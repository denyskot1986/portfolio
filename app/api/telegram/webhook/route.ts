import { NextRequest, NextResponse } from "next/server";
import { kvDel, kvGetJSON, kvIncrWithExpire } from "@/lib/kv";

export const runtime = "nodejs";

const BOT_TOKEN = process.env.DISCOVER_BOT_TOKEN || "";
const WEBHOOK_SECRET = process.env.DISCOVER_WEBHOOK_SECRET || "";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX = 10;

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string; first_name?: string };
  from?: { id: number; first_name?: string; username?: string };
  text?: string;
}

interface StashedResult {
  markdown: string;
  hollandCode: string | null;
  createdAt: number;
}

async function tgCall(method: string, payload: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Telegram ${method} failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => null);
}

async function sendMessage(chatId: number, text: string): Promise<void> {
  await tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

async function sendDocument(chatId: number, filename: string, markdown: string, caption: string): Promise<void> {
  // Telegram не принимает JSON для sendDocument с файлом — используем multipart/form-data.
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  form.append(
    "document",
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    filename
  );
  const res = await fetch(`${TELEGRAM_API}/sendDocument`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Telegram sendDocument failed: ${res.status} ${text}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Валидный токен: base64url, 16 символов (12 байт).
function isValidToken(s: string): boolean {
  return /^[A-Za-z0-9_-]{16}$/.test(s);
}

export async function POST(req: NextRequest) {
  // Telegram шлёт secret_token в заголовке. Если не совпадает — 401.
  // Это защита от подделки webhook-запросов.
  if (WEBHOOK_SECRET) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "bot not configured" }, { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const msg = update.message;
  if (!msg || !msg.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Rate limit: max 10 команд в минуту на chat.
  const rlKey = `rl:tg:${chatId}`;
  const count = await kvIncrWithExpire(rlKey, RATE_LIMIT_WINDOW_S);
  if (count > RATE_LIMIT_MAX) {
    await sendMessage(
      chatId,
      "⏳ Слишком много запросов. Подожди минуту и попробуй снова."
    );
    return NextResponse.json({ ok: true });
  }

  // /start [token] — главный сценарий
  const startMatch = text.match(/^\/start(?:\s+(\S+))?/);
  if (startMatch) {
    const rawToken = startMatch[1];

    if (!rawToken) {
      await sendMessage(
        chatId,
        [
          "👋 Привет! Я — <b>Discover by Finekot Systems</b>.",
          "",
          "Я доставляю результаты теста личности с <a href=\"https://finekot.ai/discover\">finekot.ai/discover</a>.",
          "",
          "Если у тебя уже есть <b>код синхронизации</b> — пришли его одним сообщением.",
          "Если нет — пройди тест, в конце появится кнопка «Открыть в Telegram».",
        ].join("\n")
      );
      return NextResponse.json({ ok: true });
    }

    await handleToken(chatId, rawToken, msg.from?.first_name);
    return NextResponse.json({ ok: true });
  }

  // Любой другой текст — пробуем как токен (ручной ввод).
  if (isValidToken(text)) {
    await handleToken(chatId, text, msg.from?.first_name);
    return NextResponse.json({ ok: true });
  }

  await sendMessage(
    chatId,
    "Не понял 🤔 Пришли <b>код синхронизации</b> с сайта, либо нажми /start."
  );
  return NextResponse.json({ ok: true });
}

async function handleToken(
  chatId: number,
  token: string,
  firstName: string | undefined
): Promise<void> {
  if (!isValidToken(token)) {
    await sendMessage(
      chatId,
      "❌ Неверный формат кода. Код выглядит как <code>a1B2c3D4e5F6g7H8</code> (16 символов)."
    );
    return;
  }

  const key = `discover:${token}`;
  const stashed = await kvGetJSON<StashedResult>(key);

  if (!stashed) {
    await sendMessage(
      chatId,
      [
        "⚠️ Код не найден или истёк.",
        "",
        "Возможно прошло больше 24 часов, либо код уже был использован.",
        "Пройди тест заново: <a href=\"https://finekot.ai/discover\">finekot.ai/discover</a>",
      ].join("\n")
    );
    return;
  }

  // One-shot: удаляем токен сразу. Если sendDocument упадёт —
  // юзер должен будет пройти тест заново. Это компромисс в пользу безопасности.
  await kvDel(key);

  const hollandCode = stashed.hollandCode || "profile";
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `finekot-discover-${hollandCode}-${stamp}.md`;

  const greet = firstName ? `, ${escapeHtml(firstName)}` : "";
  const caption = [
    `✅ Держи отчёт Discover${greet}.`,
    ``,
    `Holland-код: <b>${escapeHtml(hollandCode)}</b>`,
    `Файл .md откроется в любом редакторе (Obsidian, VS Code, Notion).`,
  ].join("\n");

  await sendDocument(chatId, filename, stashed.markdown, caption);
}

// Health-check и верификация webhook.
export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: Boolean(BOT_TOKEN),
    secret: Boolean(WEBHOOK_SECRET),
  });
}
