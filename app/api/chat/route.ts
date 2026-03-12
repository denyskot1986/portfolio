import { NextRequest, NextResponse } from "next/server";
import { productsData } from "../../../lib/products-data";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

function buildProductCatalog(): string {
  const available = productsData.filter((p) => p.available);
  const unavailable = productsData.filter((p) => !p.available);

  const formatProduct = (p: typeof productsData[0]) => {
    const price = p.pricing.setup
      ? `$${p.pricing.code} code / $${p.pricing.setup} with setup`
      : `$${p.pricing.code}`;
    const useCases = p.useCases.slice(0, 3).join(", ");
    return `- ${p.name} (${price}) — ${p.tagline}\n  For: ${useCases}`;
  };

  return `
AVAILABLE FOR PURCHASE NOW:
${available.map(formatProduct).join("\n")}

COMING SOON (not available yet — say "contact us" if asked):
${unavailable.map((p) => `- ${p.name} — ${p.tagline}`).join("\n")}

PRICING MODEL:
- "Code/Template" = source code + docs + deployment guide (self-deploy)
- "With setup" = personal setup into your business + 30 days support
- All purchases are one-time. No subscriptions. Full code ownership.

CONTACT: Telegram @shop_by_finekot_bot or @finekot
Website: https://finekot.ai`;
}

const BLOG_SYSTEM_PROMPT = `You are FineChat — a friendly and knowledgeable AI consultant from Finekot.

Your role: You are a helpful, polite consultant who answers questions about the article the visitor is reading. You explain concepts, clarify details, and have a natural conversation about the topics covered.

IMPORTANT RULES:
- ALWAYS respond in the same language the user writes in (English, Russian, Ukrainian, or any other)
- Be friendly, approachable, and helpful — like a knowledgeable colleague
- You are NOT a salesperson. Do NOT push products or suggest purchases unprompted
- If the user specifically asks how to buy something or asks about products/pricing, refer to the product catalog below
- If a product is marked "coming soon", tell the user it's not available yet and suggest contacting @finekot
- Be concise — 2-4 sentences unless the user asks for a detailed explanation`;

const SALES_SYSTEM_PROMPT = `You are a sales consultant for Finekot — a company that sells production-ready AI systems.

Your role: Help potential customers understand which product fits their needs, answer questions about pricing, features, and integration process. Be friendly, professional, and concise. Always guide toward a purchase or a consultation call.

IMPORTANT RULES:
- Answer in the same language the user writes in (English, Russian, Ukrainian)
- Be concise — max 3-4 sentences per response unless asked for details
- Always mention specific product names and prices when relevant
- ONLY recommend products that are marked as AVAILABLE FOR PURCHASE NOW
- If someone asks about a "coming soon" product, acknowledge it exists but say it's not available yet — suggest contacting @finekot to join the waitlist
- If unsure which product fits, ask 1-2 clarifying questions
- End responses with a soft CTA (suggest booking a call or trying a product)
- You will receive the current page URL — use it to recommend the most relevant product first`;

export async function POST(req: NextRequest) {
  try {
    const { messages, pageUrl, mode, articleTitle } = await req.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Chat is not configured. Please set OPENROUTER_API_KEY." },
        { status: 500 }
      );
    }

    const catalog = buildProductCatalog();

    let systemContent: string;
    if (mode === "blog") {
      const articleContext = articleTitle
        ? `\n\nThe user is reading the article: "${articleTitle}". Answer questions about this article's topics.`
        : "";
      systemContent = BLOG_SYSTEM_PROMPT + "\n\n" + catalog + articleContext;
    } else {
      const pageContext = pageUrl
        ? `\n\nThe user is currently on page: ${pageUrl}. Prioritize recommending the product related to this page if applicable.`
        : "";
      systemContent = SALES_SYSTEM_PROMPT + "\n\n" + catalog + pageContext;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://finekot.ai",
        "X-Title": "Finekot",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
        messages: [
          { role: "system", content: systemContent },
          ...messages.slice(-10),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

    return NextResponse.json({ reply });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
