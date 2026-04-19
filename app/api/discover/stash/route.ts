import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { kvEnabled, kvSetJSON } from "@/lib/kv";

export const runtime = "nodejs";

const BOT_USERNAME = process.env.DISCOVER_BOT_USERNAME || "taras_by_finekot_bot";
const TTL_SECONDS = 60 * 60 * 24;
const MAX_MARKDOWN_BYTES = 40_000;

// 16 URL-safe символов (base64url без паддинга) = 96 бит энтропии.
// Подбор через бот невозможен: rate limit + one-shot delete.
function makeToken(): string {
  return randomBytes(12).toString("base64url");
}

interface StashBody {
  markdown?: string;
  hollandCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!kvEnabled()) {
      return NextResponse.json(
        { error: "Доставка в Telegram временно недоступна." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as StashBody;
    const markdown = body?.markdown;
    const hollandCode = typeof body?.hollandCode === "string" ? body.hollandCode.slice(0, 16) : null;

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "markdown required" }, { status: 400 });
    }

    const size = new TextEncoder().encode(markdown).length;
    if (size > MAX_MARKDOWN_BYTES) {
      return NextResponse.json({ error: "markdown too large" }, { status: 413 });
    }

    const token = makeToken();
    await kvSetJSON(
      `discover:${token}`,
      {
        markdown,
        hollandCode,
        createdAt: Date.now(),
      },
      TTL_SECONDS
    );

    return NextResponse.json({
      token,
      botUrl: `https://t.me/${BOT_USERNAME}?start=${token}`,
      expiresInSeconds: TTL_SECONDS,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
