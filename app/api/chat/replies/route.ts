import { NextRequest, NextResponse } from "next/server";
import { productsData } from "../../../../lib/products-data";

export const runtime = "nodejs";
export const maxDuration = 15;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
// Берём ту же модель, что в основном чате — единый fast/cheap pool.
const MODEL = process.env.CHAT_REPLIES_MODEL ||
  process.env.CHAT_MODEL ||
  "google/gemini-2.5-flash";

// Анти-абъюз: короткая история + короткие сообщения хватит для регенерации.
const MAX_HISTORY = 12;
const MAX_MSG_CHARS = 2000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitize(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string")
      continue;
    const trimmed = content.slice(0, MAX_MSG_CHARS).trim();
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
  }
  return out.slice(-MAX_HISTORY);
}

function detectLang(messages: ChatMessage[]): "RU" | "UA" | "EN" {
  // Определяем по последнему сообщению юзера, иначе по assistant.
  const last =
    [...messages].reverse().find((m) => m.role === "user") ||
    messages[messages.length - 1];
  if (!last) return "EN";
  const text = last.content;
  if (/[Ѐ-ӿ]/.test(text)) {
    // Кириллица. Украинский содержит іїєґ.
    if (/[іїєґ]/i.test(text)) return "UA";
    return "RU";
  }
  return "EN";
}

function buildSystemPrompt(
  lang: "RU" | "UA" | "EN",
  agentName: string | null
): string {
  const speaker = agentName ? agentName : "агент";
  const langName = lang === "RU" ? "русском" : lang === "UA" ? "украинском" : "английском";
  return `Ты генератор quick-reply чипов для диалога с ${speaker} на сайте Finekot Systems.

Твоя задача: взять ПОСЛЕДНЕЕ сообщение ассистента и дать РОВНО 3 коротких варианта ответа ОТ ЛИЦА ЮЗЕРА.

ЖЁСТКИЕ ПРАВИЛА:
- Язык: ${lang} (${langName}).
- Каждый вариант — 2-7 слов, максимум 40 символов.
- Разные по смыслу. Двигают диалог вперёд (уточнение, выбор, next step).
- Не повторять то, что юзер уже спрашивал в истории.
- НЕ задавать пустых вопросов ("расскажи ещё", "а поподробнее").
- Звучать естественно — как юзер сам бы написал.
- Если агент задал уточняющий вопрос с вариантами — варианты это ответы на него.
- Если агент предложил продукт — варианты про этот продукт (цена, детали, альтернатива).

ФОРМАТ ОТВЕТА:
Строго JSON-массив из 3 строк. Никакого текста вокруг, никаких markdown-кодблоков, никаких комментариев.
Пример: ["Сколько стоит","Покажи пример","А для семьи есть?"]`;
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY missing" },
        { status: 500 }
      );
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const messages = sanitize((body as { messages?: unknown }).messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== "assistant") {
      return NextResponse.json(
        { error: "last message must be assistant" },
        { status: 400 }
      );
    }

    const rawAgentId = (body as { agentId?: unknown }).agentId;
    const agentId =
      typeof rawAgentId === "string" && /^[a-z0-9-]{1,40}$/i.test(rawAgentId)
        ? rawAgentId.toLowerCase()
        : null;
    const agent = agentId
      ? productsData.find((p) => p.id.toLowerCase() === agentId)
      : null;

    const lang = detectLang(messages);
    const systemPrompt = buildSystemPrompt(lang, agent?.name || null);

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 12_000);

    let response: Response;
    try {
      response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://finekot.ai",
            "X-Title": "Finekot Quick-Reply Generator",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
              {
                role: "user",
                content:
                  lang === "RU"
                    ? "(дай 3 варианта quick-reply, JSON array)"
                    : lang === "UA"
                    ? "(дай 3 варіанти quick-reply, JSON array)"
                    : "(give 3 quick-reply options, JSON array)",
              },
            ],
            // Температура выше основного чата — нужен разбросик по смыслу.
            temperature: 0.95,
            max_tokens: 120,
            reasoning: { max_tokens: 0 },
          }),
          signal: ac.signal,
        }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      console.error("quick-reply upstream error:", response.status, err);
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content || "";
    // Парсим JSON массив. Толерантны к code-fence и лишнему тексту.
    const jsonMatch =
      raw.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
      raw.match(/(\[[\s\S]*?\])/);
    const payload = jsonMatch ? jsonMatch[1] : raw;
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return NextResponse.json({ error: "parse" }, { status: 502 });
    }
    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: "shape" }, { status: 502 });
    }
    const replies = parsed
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 60)
      .slice(0, 3);

    if (replies.length === 0) {
      return NextResponse.json({ error: "empty" }, { status: 502 });
    }
    return NextResponse.json({ replies });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("quick-reply route error:", msg);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
