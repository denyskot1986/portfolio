import { NextRequest, NextResponse } from "next/server";
import { kvDel, kvGetJSON, kvIncrWithExpire } from "@/lib/kv";

export const runtime = "nodejs";

const BOT_TOKEN = process.env.DISCOVER_BOT_TOKEN || "";
const WEBHOOK_SECRET = process.env.DISCOVER_WEBHOOK_SECRET || "";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX = 10;
const TG_MESSAGE_LIMIT = 3800;

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string; first_name?: string };
  from?: { id: number; first_name?: string; username?: string };
  text?: string;
}

interface Profile {
  hollandCode: string;
  hollandDescription: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  bigFiveNotes?: Record<string, string>;
  strengths: { title: string; evidence: string }[];
  professions: { title: string; match: number; note: string }[];
  developmentPlan: string[];
  summary: string;
}

interface StashedResult {
  profile: Profile;
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Валидный токен: base64url, 16 символов (12 байт).
function isValidToken(s: string): boolean {
  return /^[A-Za-z0-9_-]{16}$/.test(s);
}

export async function POST(req: NextRequest) {
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

  const rlKey = `rl:tg:${chatId}`;
  const count = await kvIncrWithExpire(rlKey, RATE_LIMIT_WINDOW_S);
  if (count > RATE_LIMIT_MAX) {
    await sendMessage(
      chatId,
      "⏳ Слишком много запросов. Подожди минуту и попробуй снова."
    );
    return NextResponse.json({ ok: true });
  }

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
          "Если нет — пройди тест, в конце появится кнопка «Забрать результаты у бота».",
        ].join("\n")
      );
      return NextResponse.json({ ok: true });
    }

    await handleToken(chatId, rawToken, msg.from?.first_name);
    return NextResponse.json({ ok: true });
  }

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

  // One-shot: удаляем токен до отправки. Если что-то упадёт посередине —
  // юзер пройдёт заново. Это компромисс в пользу безопасности.
  await kvDel(key);

  for (const chunk of buildProfileMessages(stashed.profile, firstName)) {
    await sendMessage(chatId, chunk);
  }
}

function buildProfileMessages(p: Profile, firstName: string | undefined): string[] {
  const greet = firstName ? `, ${escapeHtml(firstName)}` : "";
  const messages: string[] = [];

  // 1. Приветствие + Holland-код + описание
  messages.push(
    [
      `✅ Держи результаты Discover${greet}.`,
      ``,
      `🧬 <b>Holland-код:</b> <code>${escapeHtml(p.hollandCode)}</code>`,
      ``,
      escapeHtml(p.hollandDescription),
    ].join("\n")
  );

  // 2. Big Five
  const bf = p.bigFive;
  const bfn = p.bigFiveNotes || {};
  const bfLine = (label: string, val: number, note?: string) => {
    const bar = renderBar(val);
    const tail = note ? `\n   <i>${escapeHtml(note)}</i>` : "";
    return `<b>${label}</b>  ${bar}  ${val}/100${tail}`;
  };
  messages.push(
    [
      `📊 <b>Big Five (OCEAN)</b>`,
      ``,
      bfLine("Openness", bf.openness, bfn.openness),
      bfLine("Conscientiousness", bf.conscientiousness, bfn.conscientiousness),
      bfLine("Extraversion", bf.extraversion, bfn.extraversion),
      bfLine("Agreeableness", bf.agreeableness, bfn.agreeableness),
      bfLine("Neuroticism", bf.neuroticism, bfn.neuroticism),
    ].join("\n")
  );

  // 3. Сильные стороны — разбиваем если длинно
  const strengthsHeader = `💪 <b>Ключевые сильные стороны</b>`;
  const strengthBlocks = p.strengths.map(
    (s, i) =>
      `<b>${String(i + 1).padStart(2, "0")}. ${escapeHtml(s.title)}</b>\n${escapeHtml(s.evidence)}`
  );
  for (const chunk of chunkBlocks(strengthsHeader, strengthBlocks)) {
    messages.push(chunk);
  }

  // 4. Направления
  const professionsHeader = `🎯 <b>Рекомендованные направления</b>`;
  const professionBlocks = p.professions.map(
    (pr) => `• <b>${pr.match}% — ${escapeHtml(pr.title)}</b>\n  ${escapeHtml(pr.note)}`
  );
  for (const chunk of chunkBlocks(professionsHeader, professionBlocks)) {
    messages.push(chunk);
  }

  // 5. План развития
  const planHeader = `🗺 <b>План развития (3–6 месяцев)</b>`;
  const planBlocks = p.developmentPlan.map(
    (step, i) => `<b>${i + 1}.</b> ${escapeHtml(step)}`
  );
  for (const chunk of chunkBlocks(planHeader, planBlocks)) {
    messages.push(chunk);
  }

  // 6. Итог + CTA
  messages.push(
    [
      `🏁 <b>Итог</b>`,
      ``,
      escapeHtml(p.summary),
      ``,
      `—`,
      `<i>Методики: Holland Codes (RIASEC) + Big Five (OCEAN).</i>`,
      `Пройти ещё раз: <a href="https://finekot.ai/discover">finekot.ai/discover</a>`,
    ].join("\n")
  );

  return messages;
}

function renderBar(value: number): string {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * 10);
  return "▰".repeat(filled) + "▱".repeat(10 - filled);
}

// Собирает блоки в сообщения так, чтобы ни одно не превысило TG_MESSAGE_LIMIT.
// Первое сообщение начинается с header; продолжения — без него.
function chunkBlocks(header: string, blocks: string[]): string[] {
  const out: string[] = [];
  let current = header;
  for (const block of blocks) {
    const candidate = current + "\n\n" + block;
    if (candidate.length > TG_MESSAGE_LIMIT && current !== header) {
      out.push(current);
      current = block;
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: Boolean(BOT_TOKEN),
    secret: Boolean(WEBHOOK_SECRET),
  });
}
