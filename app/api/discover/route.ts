import { NextRequest, NextResponse } from "next/server";
import {
  QUESTIONER_SYSTEM_PROMPT,
  ANALYST_SYSTEM_PROMPT,
  QUESTION_BUDGET,
} from "@/lib/discover-prompts";

// Primary: Anthropic-direct (per task spec). Fallback: OpenRouter
// (only if DISCOVER_USE_OPENROUTER=1 — temporary stopgap until Anthropic
// key is funded). Both keys are server-only and never exposed to client.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const USE_OPENROUTER = process.env.DISCOVER_USE_OPENROUTER === "1";

const QUESTIONER_MODEL =
  process.env.DISCOVER_QUESTIONER_MODEL || "claude-sonnet-4-5";
const ANALYST_MODEL =
  process.env.DISCOVER_ANALYST_MODEL || "claude-opus-4-5";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnswerFormat = "single" | "multi" | "scale" | "text";

interface HistoryItem {
  questionNumber: number;
  question: string;
  format: AnswerFormat;
  options: string[];
  // user answer — string for single/scale/text, string[] for multi
  answer: string | string[];
}

interface NextRequestBody {
  action: "next" | "analyze";
  history: HistoryItem[];
}

function formatHistoryForLLM(history: HistoryItem[]): string {
  if (history.length === 0) return "(пусто — это первый вопрос)";
  return history
    .map((h) => {
      const ans = Array.isArray(h.answer) ? h.answer.join(", ") : h.answer;
      return `Q${h.questionNumber} [${h.format}]: ${h.question}\nA: ${ans}`;
    })
    .join("\n\n");
}

async function callAnthropicDirect(opts: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens: number;
}): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: "user", content: opts.userMessage }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find(
    (b: { type: string }) => b.type === "text"
  );
  if (!textBlock?.text) {
    throw new Error("Anthropic response missing text content");
  }
  return textBlock.text as string;
}

async function callOpenRouter(opts: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens: number;
}): Promise<string> {
  // OpenRouter prefixes Anthropic models as "anthropic/<model>".
  const orModel = opts.model.startsWith("anthropic/")
    ? opts.model
    : `anthropic/${opts.model}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://finekot.ai",
      "X-Title": "Finekot Discover",
    },
    body: JSON.stringify({
      model: orModel,
      max_tokens: opts.maxTokens,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter response missing content");
  return text as string;
}

async function callLLM(opts: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens: number;
}): Promise<string> {
  if (USE_OPENROUTER) {
    if (!OPENROUTER_API_KEY) {
      throw new Error("DISCOVER_USE_OPENROUTER=1 но OPENROUTER_API_KEY не задан");
    }
    return callOpenRouter(opts);
  }
  return callAnthropicDirect(opts);
}

// Strip ```json ... ``` if model wraps despite instructions.
function extractJSON(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Try to find first { ... last } block as fallback.
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    if (!USE_OPENROUTER && !ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Сканер не настроен. Отсутствует ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }
    if (USE_OPENROUTER && !OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Сканер не настроен. Отсутствует OPENROUTER_API_KEY." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as NextRequestBody;
    const { action, history } = body;

    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: "Некорректный формат history" },
        { status: 400 }
      );
    }

    if (action === "next") {
      const nextNumber = history.length + 1;
      if (nextNumber > QUESTION_BUDGET) {
        return NextResponse.json(
          { error: "Бюджет вопросов исчерпан. Запросите анализ." },
          { status: 400 }
        );
      }

      const userMessage = `БЮДЖЕТ: ${QUESTION_BUDGET} вопросов
ТЕКУЩИЙ ВОПРОС: ${nextNumber}/${QUESTION_BUDGET}
ОСТАЛОСЬ ПОСЛЕ ЭТОГО: ${QUESTION_BUDGET - nextNumber}

ИСТОРИЯ ДИАЛОГА:
${formatHistoryForLLM(history)}

Сгенерируй вопрос ${nextNumber} в формате JSON согласно инструкциям. ${
        nextNumber === QUESTION_BUDGET ? 'ЭТО ПОСЛЕДНИЙ ВОПРОС — обязательно "isLast": true.' : ""
      }`;

      const raw = await callLLM({
        model: QUESTIONER_MODEL,
        system: QUESTIONER_SYSTEM_PROMPT,
        userMessage,
        maxTokens: 1000,
      });

      let parsed;
      try {
        parsed = JSON.parse(extractJSON(raw));
      } catch (e) {
        return NextResponse.json(
          {
            error: "Модель вернула некорректный JSON",
            raw,
            parseError: e instanceof Error ? e.message : String(e),
          },
          { status: 502 }
        );
      }

      // Force questionNumber to match server count to prevent drift.
      parsed.questionNumber = nextNumber;
      parsed.isLast = nextNumber === QUESTION_BUDGET;

      return NextResponse.json({ question: parsed });
    }

    if (action === "analyze") {
      if (history.length < 5) {
        return NextResponse.json(
          { error: "Недостаточно данных для анализа (минимум 5 ответов)." },
          { status: 400 }
        );
      }

      const userMessage = `ПОЛНАЯ СТЕНОГРАММА СКАНИРОВАНИЯ (${history.length} вопросов):

${formatHistoryForLLM(history)}

Сгенерируй финальный профиль в формате JSON согласно инструкциям.`;

      const raw = await callLLM({
        model: ANALYST_MODEL,
        system: ANALYST_SYSTEM_PROMPT,
        userMessage,
        maxTokens: 4000,
      });

      let parsed;
      try {
        parsed = JSON.parse(extractJSON(raw));
      } catch (e) {
        return NextResponse.json(
          {
            error: "Аналитик вернул некорректный JSON",
            raw,
            parseError: e instanceof Error ? e.message : String(e),
          },
          { status: 502 }
        );
      }

      return NextResponse.json({ profile: parsed });
    }

    return NextResponse.json(
      { error: `Неизвестное действие: ${action}` },
      { status: 400 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
