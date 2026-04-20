import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { kvEnabled, kvSetJSON } from "@/lib/kv";

export const runtime = "nodejs";

const BOT_USERNAME = process.env.DISCOVER_BOT_USERNAME || "taras_by_finekot_bot";
const TTL_SECONDS = 60 * 60 * 24;
const MAX_PROFILE_BYTES = 40_000;

function makeToken(): string {
  return randomBytes(12).toString("base64url");
}

interface ProfilePayload {
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

interface StashBody {
  profile?: ProfilePayload;
}

function isValidProfile(p: unknown): p is ProfilePayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.hollandCode === "string" &&
    typeof o.hollandDescription === "string" &&
    typeof o.summary === "string" &&
    Array.isArray(o.strengths) &&
    Array.isArray(o.professions) &&
    Array.isArray(o.developmentPlan) &&
    o.bigFive !== null &&
    typeof o.bigFive === "object"
  );
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
    const profile = body?.profile;

    if (!isValidProfile(profile)) {
      return NextResponse.json({ error: "profile required" }, { status: 400 });
    }

    const size = new TextEncoder().encode(JSON.stringify(profile)).length;
    if (size > MAX_PROFILE_BYTES) {
      return NextResponse.json({ error: "profile too large" }, { status: 413 });
    }

    const token = makeToken();
    await kvSetJSON(
      `discover:${token}`,
      {
        profile,
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
