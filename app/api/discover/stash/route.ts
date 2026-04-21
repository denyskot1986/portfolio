import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { kvEnabled, kvSetJSON } from "@/lib/kv";

export const runtime = "nodejs";

const BOT_USERNAME = process.env.DISCOVER_BOT_USERNAME || "taras_by_finekot_bot";
const TTL_SECONDS = 60 * 60 * 24;
const MAX_PROFILE_BYTES = 80_000;

function makeToken(): string {
  return randomBytes(12).toString("base64url");
}

interface LifeContext {
  has_business: number;
  has_aging_parent: number;
  has_children_5_15: number;
  has_health_focus: number;
  has_meeting_overload: number;
  is_content_creator: number;
  is_research_heavy: number;
  has_task_chaos: number;
}

interface AgentRecommendation {
  agentId: string;
  agentName: string;
  emoji: string;
  match: number;
  tier: "Basic" | "Pro" | "OneTime";
  monthlyCost: number;
  role: "primary" | "secondary" | "tertiary";
  whyNow: string;
  tasksCovered: string[];
  hoursSavedPerWeek: number;
  evidenceQuotes: string[];
}

interface AgentRecommendations {
  stack: AgentRecommendation[];
  startingMonthlyCost: number;
  totalMonthlyCost: number;
  totalHoursSavedPerWeek: number;
  fallback: { reason: string; nextStep: string } | null;
}

interface RoadmapPhase {
  phase: string;
  agent: string | null;
  action: string;
  successCriterion: string;
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
  lifeContext: LifeContext;
  strengths: { title: string; evidence: string }[];
  agentRecommendations: AgentRecommendations;
  agentStackRoadmap: RoadmapPhase[];
  developmentPlan: string[];
  summary: string;
}

interface StashBody {
  profile?: ProfilePayload;
}

function isValidProfile(p: unknown): p is ProfilePayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (
    typeof o.hollandCode !== "string" ||
    typeof o.hollandDescription !== "string" ||
    typeof o.summary !== "string" ||
    !Array.isArray(o.strengths) ||
    !Array.isArray(o.developmentPlan) ||
    !Array.isArray(o.agentStackRoadmap) ||
    o.bigFive === null ||
    typeof o.bigFive !== "object" ||
    o.lifeContext === null ||
    typeof o.lifeContext !== "object"
  ) {
    return false;
  }
  const recs = o.agentRecommendations as Record<string, unknown> | null;
  if (!recs || typeof recs !== "object") return false;
  if (!Array.isArray(recs.stack)) return false;
  return true;
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
