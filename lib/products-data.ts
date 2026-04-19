import type { Lang } from "./i18n";

/** Per-agent Telegram bots that power the trial/subscription flow. Each entry maps
 *  a product id to the bot username that handles `?start=trial` for that agent.
 *  When an id is absent from this map, the site falls back to the generic sales
 *  bot (`product.contact`). Keep in sync with /opt/finekot-agents/.env on VPS #3. */
export const TRIAL_BOT_BY_ID: Record<string, string> = {
  iborya: "https://t.me/iborya_by_finekot_trial_bot",
  iada: "https://t.me/ada_by_finekot_trial_bot",
  // ilucy / orban / idoctor / ileva / ihogol — Commander is creating these in @BotFather.
};

export interface ProductData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  longDescription: string;
  features: { title: string; desc: string }[];
  useCases: string[];
  techStack: string[];
  pricing: {
    code: number;
    setup?: number;
    currency: string;
    /** If set, product is sold as a subscription. `code` should equal `subscription.monthly` for card display. */
    subscription?: {
      monthly: number;
      yearly?: number;
      currency: string;
      trialDays: number;
      tiers?: { name: string; price: number; features: string[] }[];
    };
  };
  deliveryTime: { template: string; integration: string };
  youtubeId: string | null;
  screenshots: string[];
  contact: string;
  diagram: string;
  available: boolean;
  /** Visual agent icon for subscription agents (emoji on card). Optional. */
  avatarEmoji?: string;
}

interface ProductTranslation {
  tagline: string;
  category: string;
  description: string;
  longDescription: string;
  features: { title: string; desc: string }[];
  useCases: string[];
  deliveryTime: { template: string; integration: string };
  /** Translated subscription tier copy (name + features). Only overrides visible strings; prices come from master. */
  tiers?: { name: string; features: string[] }[];
}

export const productsData: ProductData[] = [
  {
    id: "iborya",
    name: "iБоря",
    tagline: "Your personal AI chief of staff",
    category: "Agents",
    description: "Personal AI secretary that lives in your Telegram. Calendar, inbox, tasks, meeting prep — all under control, voice-first.",
    longDescription: "iБоря is your personal chief of staff — an AI agent that sits in your Telegram and absorbs the chaos of daily life. Morning briefing, inbox triage, meeting prep and recap, voice-to-task dictation, idea intake while you drive or walk. Designed for one human — you — with per-user memory so he remembers your people, your projects, your promises.",
    features: [
      { title: "Morning briefing", desc: "At 8:00 in Telegram: today's priorities, pre-read for every meeting, follow-ups you owe, flags on anything slipping." },
      { title: "Inbox triage", desc: "Sorts mail into act-now / today / this week / ignore. Drafts replies in your voice — you hit send." },
      { title: "Meeting prep & recap", desc: "Before every call: who, what they last said, what you promised. After: action items filed into your task system." },
      { title: "Voice → tasks", desc: "Drop a voice note with 3 things. iБоря splits them into Todoist/Notion tasks with deadlines and context." },
      { title: "Personal memory", desc: "Remembers your people, your projects, what you promised and when. The longer you use him, the sharper he gets." },
    ],
    useCases: ["Busy professionals with 20+ meetings / week", "Founders juggling inbox + calendar + Notion", "Consultants managing 10+ clients", "Anyone who has ever said 'I need an assistant'"],
    techStack: ["Claude Opus 4.7", "Telegram bot + voice", "Gmail / Google Calendar / Notion", "Whisper STT", "Per-user persistent memory"],
    pricing: {
      code: 49,
      currency: "USD",
      subscription: {
        monthly: 49,
        yearly: 470,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 49, features: ["7-day free trial", "Morning briefing + inbox triage", "Meeting prep & recap", "Voice → tasks", "Personal memory"] },
          { name: "Pro", price: 99, features: ["Everything in Basic", "Opus tier (max quality)", "Unlimited messages", "Priority speed", "API + Zapier access", "Custom integrations"] },
        ],
      },
    },
    deliveryTime: { template: "Activate in 10 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🤝",
    diagram: `     +---------------------------+
     |   YOU (Telegram + voice)  |
     +-------------+-------------+
                   |
     +-------------+-------------+
     |   iБоря — CHIEF OF STAFF  |
     |  +---------------------+  |
     |  | Claude Opus 4.7     |  |
     |  | Per-user memory     |  |
     |  | Personal toolkit    |  |
     |  +---------------------+  |
     +---+-------+-------+---+---+
         |       |       |   |
     +---+-+ +---+-+ +---+-+-+--+
     |MAIL | |CAL  | |NOTES | |TASK|
     |tri-e| |prep | |search| | q  |
     +-----+ +-----+ +------+ +----+
                   |
     +-------------+-------------+
     |  BRIEFS . DRAFTS . RECAPS |
     |  delivered in Telegram    |
     +---------------------------+`,
    available: true,
  },
  {
    id: "ilucy",
    name: "iLucy",
    tagline: "AI companion for your aging parents",
    category: "Agents",
    description: "Calls your parent twice a day. Reminds about meds. Talks about the dacha. Alerts you the moment something's off.",
    longDescription: "iLucy is a voice-first AI companion built for the parents you love but can't always visit. She calls morning and evening, holds real conversations about life, checks that medication is taken, and escalates to you instantly if she hears anything alarming. Gentle on the surface, watchful underneath. Voice calls via regular telephone; weekly report delivered to you in Telegram. HIPAA-friendly handling of any health notes you upload.",
    features: [
      { title: "Twice-a-day voice calls", desc: "Morning and evening calls over regular phone. Real conversation, not a menu." },
      { title: "Medication reminders", desc: "Reminds at the right time, checks back, escalates to you if skipped." },
      { title: "Distress detection", desc: "Spots tremor, confusion, keywords like 'can't breathe' — calls emergency + pings you within seconds." },
      { title: "Weekly family report", desc: "Mood trend, topics discussed, health flags. Delivered to you every Sunday." },
      { title: "Smart speaker friendly", desc: "Works with Yandex / Google / Alice speakers if your parent prefers hands-free." },
    ],
    useCases: ["Adults 30–55 with parents 65+", "Families separated by 500+ km", "Post-stroke or post-surgery recovery at home", "Lonely grandparents"],
    techStack: ["Claude Sonnet 4.6", "Whisper STT + ElevenLabs voice", "Telephony (Twilio/Exotel)", "Telegram notifications", "Encrypted health vault"],
    pricing: {
      code: 99,
      currency: "USD",
      subscription: {
        monthly: 99,
        yearly: 950,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 99, features: ["7-day free trial", "2 voice calls per day", "Medication + health reminders", "Weekly family report", "Emergency escalation"] },
          { name: "Pro", price: 149, features: ["Everything in Basic", "Unlimited voice calls", "Smart-speaker deployment (Yandex/Google/Alice)", "Doctor's report sync via iDoctor", "Priority human support"] },
        ],
      },
    },
    deliveryTime: { template: "Phone number active in 30 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🫶",
    diagram: `     +---------------------------+
     |   YOUR PARENT             |
     |  (regular phone call)     |
     +--------+------------------+
              |
     +--------+------------------+
     |   iLucy — CARE ENGINE     |
     |  voice . memory . watch   |
     +--+--------+------------+--+
        |        |            |
     +--+-+  +---+---+   +----+---+
     |MEDS|  |MOOD/  |   |EMERGENCY|
     |RMND|  |HEALTH |   |DETECT   |
     +----+  +-------+   +---------+
                             |
     +---------------------------+
     |   YOU (Telegram)          |
     |  weekly report + alerts   |
     +---------------------------+`,
    available: true,
  },
  {
    id: "orban",
    name: "Orban",
    tagline: "AI operations chief for small business. MCP-native.",
    category: "Agents",
    description: "24/7 business operations agent. Holds your clients, tasks and finances together. Plugs into your CRM, calendar and messengers via Model Context Protocol.",
    longDescription: "Orban is the Finekot agent for running a small business without drowning in it. He doesn't forget clients, doesn't lose tasks, writes the morning business briefing, and answers routine client questions in your Telegram/WhatsApp while you run the real work. Under the hood he speaks MCP — the open Model Context Protocol standard — which means he doesn't just chat about your CRM, he opens it and does the work. Hosted by Finekot, per-business memory, integrations out of the box.",
    features: [
      { title: "Client pulse", desc: "Spots clients who ghosted for 3+ weeks, drafts a re-engagement message in your tone for one-click send." },
      { title: "Morning business brief", desc: "At 8:00 you get a Telegram summary: yesterday's unfinished, today's fires, who is waiting for an answer, which revenue is at risk." },
      { title: "Routine client replies", desc: "Handles repetitive client questions in Telegram/WhatsApp in your business voice. Escalates only when it matters." },
      { title: "MCP-native integrations", desc: "Connects to any MCP server — CRM, Gmail, Notion, Linear, Slack, custom. Not a one-off integration — a live protocol." },
      { title: "Weekly report", desc: "Friday digest: revenue, new & lost clients, bottlenecks, and one recommendation for next week." },
    ],
    useCases: ["Solo founders", "Small business owners (≤10 people)", "Infobiz creators (5k–50k audience)", "Consultants & coaches", "Agency leads"],
    techStack: ["Claude Opus 4.7", "MCP servers (CRM, Gmail, Notion, Linear, Slack)", "Telegram / WhatsApp Business", "Per-business memory", "Priority scoring engine"],
    pricing: {
      code: 79,
      currency: "USD",
      subscription: {
        monthly: 79,
        yearly: 760,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 79, features: ["7-day free trial", "Client pulse + morning brief", "Routine replies in Telegram/WhatsApp", "Weekly report", "All MCP connectors"] },
          { name: "Pro", price: 199, features: ["Everything in Basic", "Opus tier (max quality)", "Unlimited messages", "Custom MCP servers built for your stack", "Priority human support", "Quarterly tune-up session with Denys"] },
        ],
      },
    },
    deliveryTime: { template: "Telegram + MCP setup in ~15 min", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🛠️",
    diagram: `     +---------------------------+
     |   YOUR BUSINESS           |
     | clients . team . revenue  |
     +-------------+-------------+
                   |
     +-------------+-------------+
     |   Orban — OPS ENGINE      |
     |  Claude Opus 4.7 + MCP    |
     +--+----+----+----+----+----+
        |    |    |    |    |
     +--+-+ +-+-+ +-+-+ +-+-+ +-+-+
     |CRM | |CAL| |GM | |WA | |NO |
     |sync| |dar| |ail| |pro| |ion|
     +----+ +---+ +---+ +---+ +---+
                   |
     +-------------+-------------+
     |  CLIENT PULSE . BRIEFS .  |
     |  REPORTS . CLIENT REPLIES |
     +---------------------------+`,
    available: true,
  },
  {
    id: "idoctor",
    name: "iDoctor",
    tagline: "AI doctor + psychologist. Knows your full health story.",
    category: "Agents",
    description: "Upload your analyses, prescriptions, doctor's notes. iDoctor remembers everything. Guides lifestyle, flags patterns, talks you through the hard moments.",
    longDescription: "iDoctor is a health agent that unifies two roles usually kept apart: the body doctor who understands your labs and the psychologist who understands your life. Drop in a blood panel, a cardiology note, an MRI report — iDoctor ingests it, builds a longitudinal picture, and you can ask anything in plain language. When life hits hard, the same agent listens, reflects, and applies CBT-style techniques. Not a replacement for live doctors or therapists — a 24/7 second opinion that knows your entire history. HIPAA-grade encryption on all uploaded documents; one-click full delete at any time.",
    features: [
      { title: "Longitudinal health memory", desc: "Every lab, every prescription, every doctor's note — remembered forever, searchable in 2 seconds." },
      { title: "Pattern detection", desc: "'Your ferritin has been drifting down for 18 months.' 'You sleep worse the week before a deadline.' — things no single specialist would catch." },
      { title: "Plain-language explanations", desc: "Cardiology note full of Latin? iDoctor translates to your level — then answers follow-ups." },
      { title: "Emotional support mode", desc: "When you don't need a diagnosis — just need someone to listen. CBT/ACT-style, never prescriptive." },
      { title: "Red-flag escalation", desc: "Chest pain + specific descriptors? iDoctor stops, gives emergency numbers, refuses to handle solo." },
    ],
    useCases: ["Chronic condition carriers who hate re-explaining", "Anxious health-tracker types", "People with aging bodies and no local GP they trust", "Anyone who wants therapy-lite 24/7 without the $200/hour bill"],
    techStack: ["Claude Opus 4.7", "Encrypted health vault (AES-256)", "Medical document OCR", "PubMed RAG for grounded claims", "24/7 emergency keyword filter"],
    pricing: {
      code: 99,
      currency: "USD",
      subscription: {
        monthly: 99,
        yearly: 950,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 99, features: ["7-day free trial", "Unlimited document uploads", "Longitudinal health memory", "Pattern detection & weekly digest", "Emotional support mode", "Red-flag escalation"] },
          { name: "Pro", price: 179, features: ["Everything in Basic", "Up to 4 family members", "Shared or private vaults per person", "Priority human support", "Optional sync with iLucy for aging parents"] },
        ],
      },
    },
    deliveryTime: { template: "Vault active in 5 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🩺",
    diagram: `     +---------------------------+
     |   YOUR HEALTH DOCS        |
     |  labs . prescriptions .   |
     |  MRI . notes . devices    |
     +--------+------------------+
              |
     +--------+------------------+
     |   ENCRYPTED VAULT (AES)   |
     +--------+------------------+
              |
     +--------+------------------+
     |   iDoctor — HEALTH AGENT  |
     |  doctor mode | therapy mode|
     +--+------+------+------+---+
        |      |      |      |
     +--+-+ +--+-+ +--+--+ +-+---+
     |EXPL| |PATT| |EMOT | |RED-  |
     |AIN | |ERNS| |SUPP | |FLAGS |
     +----+ +----+ +-----+ +------+`,
    available: true,
  },
  {
    id: "ileva",
    name: "iLeva",
    tagline: "Safe AI for kids 5–15. Curated by Finekot.",
    category: "Agents",
    description: "Your child can ask anything. Finekot guardrails make sure iLeva teaches, never harms. Nothing inappropriate, nothing scary, nothing you'd regret.",
    longDescription: "iLeva is the AI you can hand to your kid without anxiety. A multi-layer safety stack — content filters, parental instructions, a Finekot-curated knowledge base, and age-adaptive tone — make sure the only thing your child gets is a patient tutor and a curious playmate. Math, reading, languages, science, gentle life questions. Weekly parent digest shows what your kid learned and where they got stuck. Built and watched by Finekot Systems — not a general-purpose chatbot with a filter bolted on.",
    features: [
      { title: "Finekot safety stack", desc: "Four layers: content filter, age tone match, curated knowledge base, parental rules. No harmful content reaches the child. Ever." },
      { title: "Ages 5–15, adaptive", desc: "Vocabulary, complexity, and tone shift per age. A 7-year-old and a 14-year-old get very different iLevas." },
      { title: "Tutor mode", desc: "Homework help that teaches instead of gives answers. Socratic method by default." },
      { title: "Language practice", desc: "Spoken and written practice in EN/UA/RU/DE. Child picks topic; iLeva keeps it going." },
      { title: "Parent dashboard", desc: "Weekly digest: topics explored, progress, struggles, one recommendation. No conversation spying — just aggregate insights." },
    ],
    useCases: ["Parents 30–50 with kids 5–15", "Homeschooling families", "Parents whose kids already sneak onto ChatGPT", "Grandparents gifting a safe AI instead of more screen time"],
    techStack: ["Claude Sonnet 4.6 with child-safety prompt layer", "Finekot-curated knowledge base", "Constitutional safety classifier", "Per-child memory + parent audit log", "Voice option via Whisper + ElevenLabs"],
    pricing: {
      code: 49,
      currency: "USD",
      subscription: {
        monthly: 49,
        yearly: 470,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 49, features: ["7-day free trial", "1 child profile", "All ages 5–15", "Weekly parent digest", "Finekot safety stack", "EN/RU/UA/DE"] },
          { name: "Pro", price: 89, features: ["Everything in Basic", "Up to 4 child profiles", "Sibling-aware memory", "Priority human support"] },
        ],
      },
    },
    deliveryTime: { template: "Activate in 10 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🧒",
    diagram: `     +---------------------------+
     |   YOUR CHILD (5–15)       |
     +--------+------------------+
              |
     +--------+------------------+
     |   FINEKOT SAFETY STACK    |
     |  filter + tone + KB + rules|
     +--------+------------------+
              |
     +--------+------------------+
     |   iLeva — KID AGENT       |
     |  tutor . playmate . calm  |
     +--+---------+-----------+--+
        |         |           |
     +--+--+  +---+---+   +---+----+
     |MATH |  |LANG   |   |SCIENCE |
     |READ |  |EN/RU  |   |WORLD   |
     +-----+  +-------+   +--------+
              |
     +--------+------------------+
     |   PARENT (weekly digest)  |
     +---------------------------+`,
    available: true,
  },
  {
    id: "iada",
    name: "iAda",
    tagline: "Your research terminator. Perplexity-killer.",
    category: "Agents",
    description: "Fast answer with sources in 30 seconds. Or Deep Research — a structured 2,500-word report in 8 minutes. Built on Finekot's own Ada stack.",
    longDescription: "iAda is the public edition of Ada — the research terminator inside SKYNET. She runs two modes. FAST: one question, ~30-60 seconds, answer with 5+ sources. DEEP: a multi-pass investigation across 20+ sources that returns a structured 5–10 minute report, with contradictions flagged and every claim traceable. Built to replace Perplexity for anyone doing real work — consultants, analysts, founders, journalists. Remembers your research threads across sessions so you don't repeat yourself.",
    features: [
      { title: "Fast mode (30–60 sec)", desc: "Direct answer to your question with 5+ cited sources. Like Perplexity, but with memory." },
      { title: "Deep Research (3–10 min)", desc: "Multi-step investigation across Exa + Tavily + direct crawl. Returns a structured report with sections, confidence levels, and open questions." },
      { title: "Cross-source verification", desc: "Flags contradictions between sources. Says 'high / medium / questionable' per claim." },
      { title: "Thread memory", desc: "Remembers what you've researched before. 'Last week you were looking at Delphi — here's what changed since.'" },
      { title: "Export to anywhere", desc: "One-click export to Markdown, Notion, Google Docs. Or get the report straight in Telegram/email." },
    ],
    useCases: ["Consultants preparing client decks", "Journalists on tight deadlines", "Product managers scanning competitors", "Researchers doing literature reviews", "Founders doing market validation"],
    techStack: ["Claude Opus 4.7", "Exa + Tavily search APIs", "Firecrawl for full-text crawl", "Cross-source verification layer", "Per-user research thread memory"],
    pricing: {
      code: 49,
      currency: "USD",
      subscription: {
        monthly: 49,
        yearly: 470,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 49, features: ["7-day free trial", "Unlimited Fast queries", "20 Deep Research reports / mo", "Thread memory", "Markdown / Notion / Docs export"] },
          { name: "Pro", price: 99, features: ["Everything in Basic", "Unlimited Deep Research", "Opus tier (max quality)", "API access for Zapier / n8n / scripts", "Custom domain sources"] },
        ],
      },
    },
    deliveryTime: { template: "Activate in 2 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🛰️",
    diagram: `     +---------------------------+
     |   YOUR QUESTION           |
     +--------+------------------+
              |
     +--------+------------------+
     |   iAda — RESEARCH ENGINE  |
     +--+------+------+------+---+
        |      |      |      |
     +--+-+ +--+-+ +--+--+ +-+---+
     |EXA | |TAV | |CRAWL| |GITHUB|
     |NEUR| |LILY| |ER   | |SCHO  |
     +----+ +----+ +-----+ +------+
              |
     +--------+------------------+
     |  CROSS-SOURCE VERIFIER    |
     |  contradictions . levels  |
     +--------+------------------+
              |
     +--------+------------------+
     |  REPORT (MD / Notion /    |
     |  Google Docs / Telegram)  |
     +---------------------------+`,
    available: true,
  },
  {
    id: "ihogol",
    name: "iHogol",
    tagline: "Learns your voice. Writes in it.",
    category: "Agents",
    description: "Feed it 30 of your posts. It catches your tone. Then it writes in your voice: Telegram, Instagram, LinkedIn, email. You edit, you publish.",
    longDescription: "iHogol is the agent that does your writing without sounding like AI. It ingests 30 samples of your existing text, builds a voice profile (tone, rhythm, vocabulary, punchlines, obsessions), and from then on generates posts, emails, video scripts and campaign copy that read as if you wrote them on your best day. Not a 'generate me a post' button — a collaborator that knows your positioning, your audience, and what you've already said so it doesn't repeat itself.",
    features: [
      { title: "Voice profile in 30 samples", desc: "Paste 30 of your posts once. iHogol builds a voice profile you can audit, edit, and version." },
      { title: "Multi-platform adaptation", desc: "One idea → Telegram post + Instagram caption + LinkedIn op-ed + email teaser. Each in the right length and tone." },
      { title: "Content calendar", desc: "Monthly calendar with themes, formats, and hook options. You approve — iHogol drafts." },
      { title: "Anti-repeat memory", desc: "Remembers every post you've published so new content doesn't re-litigate old takes." },
      { title: "Engagement debrief", desc: "After posting, iHogol pulls metrics and tells you what worked in your voice — and what was drift." },
    ],
    useCases: ["Creators with 5k–500k audience", "Founders building a personal brand", "Agencies managing thought-leader accounts", "Ghostwriters who want to 3x throughput", "Info-business owners launching courses"],
    techStack: ["Claude Opus 4.7", "Voice-profile fine-prompt layer", "Instagram / LinkedIn / Telegram APIs", "Notion / Google Docs export", "Per-user post history + anti-repeat index"],
    pricing: {
      code: 49,
      currency: "USD",
      subscription: {
        monthly: 49,
        yearly: 470,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Basic", price: 49, features: ["7-day free trial", "Voice profile from 30+ samples", "Unlimited drafts", "Multi-platform adaptation", "Anti-repeat memory"] },
          { name: "Pro", price: 129, features: ["Everything in Basic", "Up to 3 voices (team / agency)", "Calendar + approval workflow", "Engagement debrief", "Priority support"] },
        ],
      },
    },
    deliveryTime: { template: "Voice trained in 10 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "✍️",
    diagram: `     +---------------------------+
     |  30 SAMPLES OF YOUR WRITING|
     +--------+------------------+
              |
     +--------+------------------+
     |   VOICE PROFILE ENGINE    |
     |  tone . rhythm . punch    |
     +--------+------------------+
              |
     +--------+------------------+
     |   iHogol — WRITER AGENT   |
     +--+-----+-----+-----+------+
        |     |     |     |
     +--+-+ +-+--+ +--+--+ +-+--+
     |TG  | |IG  | |LI   | |MAIL|
     |post| |cap | |oped | |seq |
     +----+ +----+ +-----+ +----+
              |
     +--------+------------------+
     |   YOU — edit & publish    |
     +---------------------------+`,
    available: true,
  },
  {
    id: "skynet-intake",
    name: "SKYNET Intake",
    tagline: "AI Task Assistant",
    category: "Bots",
    description: "A Telegram bot that turns raw ideas (text/voice) into structured tasks with AI routing.",
    longDescription: "SKYNET Intake turns raw ideas — voice messages, texts — into structured, prioritized tasks. AI prioritization and routing across agents. Recommended for use with SKYNET 3.0 and above.",
    features: [
      { title: "Voice Input", desc: "Send a voice message — it transcribes and structures automatically." },
      { title: "AI Structuring & Task Routing", desc: "AI parses input and routes tasks to the right agent automatically." },
      { title: "Auto-Prioritization", desc: "Assigns urgency and importance based on content analysis." },
      { title: "Integration with Todoist, Notion, Linear", desc: "Tasks sync to your preferred project management tool instantly." },
    ],
    useCases: ["Entrepreneurs", "Team leads", "Project managers", "Creative professionals", "Remote teams"],
    techStack: ["AI API", "Whisper STT", "Todoist API", "aiogram", "Python"],
    pricing: { code: 50, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   INPUT LAYER          |
     |  Voice . Text . Photo  |
     +----------+-------------+
                |
     +----------+-------------+
     |   PROCESSING ENGINE    |
     |  +------------------+  |
     |  | Whisper STT      |  |
     |  | AI Parser        |  |
     |  | Priority Scorer  |  |
     |  | Category Engine  |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | ROUTING ||  TODOIST  |
     | ENGINE  ||  SYNC     |
     +---------++-----------+
     |Agent Map||Projects   |
     |Team Map ||Labels     |
     |Auto-Asn ||Due Dates  |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |    DAILY DIGEST       |
     |  Summary . Priorities |
     +-----------------------+`,
    available: true,
  },
];

const translations: Record<string, Record<string, ProductTranslation>> = {
  "ilucy": {
    RU: {
      tagline: "AI-компаньон для твоих пожилых родителей",
      category: "Агенты",
      description: "Звонит маме или папе дважды в день. Напоминает о таблетках. Болтает про дачу. Сразу пишет тебе, если что-то не так.",
      longDescription: "iLucy — голосовой AI-компаньон для тех родителей, которых ты любишь, но не можешь навещать каждый день. Звонит утром и вечером, ведёт живой разговор, проверяет что таблетки приняты, и моментально эскалирует тебе если услышит что-то тревожное. Мягкая снаружи, внимательная внутри. Звонок через обычный телефон; еженедельный отчёт приходит тебе в Telegram. Медицинская документация — с шифрованием уровня HIPAA.",
      features: [
        { title: "Два голосовых звонка в день", desc: "Утро и вечер, обычный телефонный звонок. Реальный разговор, а не меню." },
        { title: "Напоминания о лекарствах", desc: "Напоминает вовремя, проверяет что принято, эскалирует тебе если пропуск." },
        { title: "Детекция тревоги", desc: "Ловит дрожь, спутанность, слова типа «задыхаюсь» — вызывает скорую и пишет тебе за секунды." },
        { title: "Еженедельный семейный отчёт", desc: "Настроение, темы, здоровье. В твой Telegram каждое воскресенье." },
        { title: "Совместима с колонками", desc: "Работает через Яндекс / Google / Алису если родителю удобнее hands-free." },
      ],
      useCases: ["Взрослые 30–55 с родителями 65+", "Семьи, разделённые 500+ км", "Восстановление после инсульта или операции дома", "Одинокие бабушки и дедушки"],
      deliveryTime: { template: "Номер активен за 30 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "2 голосовых звонка в день", "Напоминания о лекарствах и здоровье", "Еженедельный семейный отчёт", "Экстренная эскалация"] },
        { name: "Pro", features: ["Всё из Basic", "Безлимит голосовых звонков", "Колонки (Яндекс / Google / Алиса)", "Синхронизация с iDoctor", "Приоритетная поддержка человеком"] },
      ],
    },
    UA: {
      tagline: "AI-компаньйон для твоїх літніх батьків",
      category: "Агенти",
      description: "Дзвонить мамі або татові двічі на день. Нагадує про таблетки. Говорить про дачу. Одразу пише тобі, якщо щось не так.",
      longDescription: "iLucy — голосовий AI-компаньйон для тих батьків, яких ти любиш, але не можеш відвідувати щодня. Телефонує вранці та ввечері, веде живу розмову, перевіряє, що таблетки прийняті, і миттєво ескалує тобі, якщо почує щось тривожне. М'яка зовні, уважна всередині. Дзвінок через звичайний телефон; щотижневий звіт приходить тобі в Telegram. Медична документація — з шифруванням рівня HIPAA.",
      features: [
        { title: "Два голосових дзвінки на день", desc: "Ранок і вечір, звичайний телефонний дзвінок. Справжня розмова, а не меню." },
        { title: "Нагадування про ліки", desc: "Нагадує вчасно, перевіряє що прийнято, ескалує тобі у разі пропуску." },
        { title: "Детекція тривоги", desc: "Ловить тремтіння, сплутаність, слова типу «задихаюсь» — викликає швидку і пише тобі за секунди." },
        { title: "Щотижневий сімейний звіт", desc: "Настрій, теми, здоров'я. У твій Telegram щонеділі." },
        { title: "Сумісна з колонками", desc: "Працює через Яндекс / Google / Алісу якщо батькові зручніше hands-free." },
      ],
      useCases: ["Дорослі 30–55 з батьками 65+", "Родини, розділені 500+ км", "Відновлення після інсульту чи операції вдома", "Самотні бабусі й дідусі"],
      deliveryTime: { template: "Номер активний за 30 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "2 голосові дзвінки на день", "Нагадування про ліки та здоров'я", "Щотижневий сімейний звіт", "Екстрена ескалація"] },
        { name: "Pro", features: ["Все з Basic", "Безліміт голосових дзвінків", "Колонки (Яндекс / Google / Аліса)", "Синхронізація з iDoctor", "Пріоритетна підтримка людиною"] },
      ],
    },
  },
  "orban": {
    RU: {
      tagline: "AI-операционный директор для малого бизнеса. MCP-native.",
      category: "Агенты",
      description: "24/7 держит клиентов, задачи и финансы твоего бизнеса под контролем. Работает с CRM, календарём и мессенджерами через MCP.",
      longDescription: "Orban — агент Finekot для ведения малого бизнеса так, чтобы в нём не утонуть. Не теряет клиентов, не забывает задач, пишет утренний бизнес-бриф, и отвечает на рутинные вопросы клиентов в Telegram/WhatsApp пока ты делаешь реальную работу. Под капотом говорит на MCP — открытом Model Context Protocol стандарте — а значит не просто болтает про твою CRM, а открывает её и делает работу. Хостится у Finekot, бизнес-память, интеграции из коробки.",
      features: [
        { title: "Пульс клиентов", desc: "Замечает тех, кто молчит 3+ недели. Собирает контекст и пишет реактивирующее письмо в твоём тоне на согласование." },
        { title: "Утренний бизнес-бриф", desc: "В 8:00 в Telegram: что вчера не сделано, что горит сегодня, кто ждёт ответа, какая выручка под риском." },
        { title: "Рутинные ответы клиентам", desc: "Отвечает на типовые вопросы клиентов в Telegram/WhatsApp в твоём бизнес-голосе. Эскалирует только важное." },
        { title: "MCP-нативные интеграции", desc: "Подключается к любому MCP-серверу — CRM, Gmail, Notion, Linear, Slack, кастомным. Не одноразовая интеграция — живой протокол." },
        { title: "Еженедельный отчёт", desc: "Пятница: выручка, новые и ушедшие клиенты, узкие места + одна рекомендация на след. неделю." },
      ],
      useCases: ["Соло-предприниматели", "Владельцы малого бизнеса (≤10 чел)", "Инфобизнесмены (5k–50k аудитория)", "Консультанты и коучи", "Агентства"],
      deliveryTime: { template: "Telegram + MCP настройка за ~15 мин", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "Пульс клиентов + утренний бриф", "Рутинные ответы в Telegram/WhatsApp", "Еженедельный отчёт", "Все MCP-коннекторы"] },
        { name: "Pro", features: ["Всё из Basic", "Opus-тариф (макс. качество)", "Безлимит сообщений", "Кастомные MCP-серверы под твой стек", "Приоритетная поддержка человеком", "Квартальный tune-up с Denys"] },
      ],
    },
    UA: {
      tagline: "AI-операційний директор для малого бізнесу. MCP-native.",
      category: "Агенти",
      description: "24/7 тримає клієнтів, задачі та фінанси твого бізнесу під контролем. Працює з CRM, календарем та месенджерами через MCP.",
      longDescription: "Orban — агент Finekot для ведення малого бізнесу так, щоб у ньому не потонути. Не губить клієнтів, не забуває задач, пише ранковий бізнес-бриф, і відповідає на рутинні запити клієнтів у Telegram/WhatsApp поки ти робиш справжню роботу. Під капотом говорить на MCP — відкритому Model Context Protocol стандарті — а отже не просто базікає про твою CRM, а відкриває її і робить роботу. Хоститься у Finekot, бізнес-пам'ять, інтеграції з коробки.",
      features: [
        { title: "Пульс клієнтів", desc: "Помічає тих, хто мовчить 3+ тижні. Збирає контекст і пише реактивуючий лист у твоєму тоні на узгодження." },
        { title: "Ранковий бізнес-бриф", desc: "О 8:00 у Telegram: що вчора не зроблено, що горить сьогодні, хто чекає на відповідь, який виторг під ризиком." },
        { title: "Рутинні відповіді клієнтам", desc: "Відповідає на типові питання клієнтів у Telegram/WhatsApp твоїм бізнес-голосом. Ескалює лише важливе." },
        { title: "MCP-нативні інтеграції", desc: "Підключається до будь-якого MCP-сервера — CRM, Gmail, Notion, Linear, Slack, кастомних. Не одноразова інтеграція — живий протокол." },
        { title: "Тижневий звіт", desc: "П'ятниця: виторг, нові та втрачені клієнти, вузькі місця + одна рекомендація на наступний тиждень." },
      ],
      useCases: ["Соло-підприємці", "Власники малого бізнесу (≤10 осіб)", "Інфобізнесмени (5k–50k аудиторія)", "Консультанти та коучі", "Агентства"],
      deliveryTime: { template: "Telegram + MCP налаштування за ~15 хв", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "Пульс клієнтів + ранковий бриф", "Рутинні відповіді у Telegram/WhatsApp", "Тижневий звіт", "Всі MCP-конектори"] },
        { name: "Pro", features: ["Все з Basic", "Opus-тариф (макс. якість)", "Безліміт повідомлень", "Кастомні MCP-сервери під твій стек", "Пріоритетна підтримка людиною", "Квартальна tune-up сесія з Denys"] },
      ],
    },
  },
  "idoctor": {
    RU: {
      tagline: "AI-врач + психолог. Знает всю твою историю здоровья.",
      category: "Агенты",
      description: "Загружай анализы, рецепты, заключения врачей. iDoctor помнит всё. Ведёт образ жизни, ловит паттерны, слушает в тяжёлые моменты.",
      longDescription: "iDoctor — агент здоровья, соединивший две роли, которые обычно врозь: врача, понимающего твои анализы, и психолога, понимающего твою жизнь. Кидаешь анализ крови, кардиологическое заключение, МРТ — iDoctor разбирает, строит картину длиной в годы, и ты спрашиваешь на обычном языке. Когда бьёт жизнь — тот же агент слушает, отражает, применяет CBT. Не замена живых врачей и терапевтов — 24/7 второе мнение, которое знает твою полную историю. HIPAA-grade шифрование всего что загружаешь; удаление в 1 клик в любой момент.",
      features: [
        { title: "Долгосрочная память здоровья", desc: "Каждый анализ, каждый рецепт, каждое заключение — помнится навсегда, ищется за 2 секунды." },
        { title: "Детекция паттернов", desc: "«У тебя ферритин дрейфует вниз 18 месяцев». «Ты хуже спишь за неделю до дедлайна». Вещи, которые ни один узкий специалист не поймает." },
        { title: "Объяснения на твоём языке", desc: "Заключение в латинских терминах? iDoctor переводит под твой уровень — и отвечает на follow-up." },
        { title: "Режим эмоциональной поддержки", desc: "Когда диагноз не нужен — нужен просто тот кто слушает. CBT/ACT-стиль, без предписаний." },
        { title: "Эскалация красных флагов", desc: "Боль в груди + специфические слова? iDoctor останавливается, даёт телефоны скорой, отказывается вести дальше соло." },
      ],
      useCases: ["Носители хронических болезней, уставшие пересказывать", "Тревожные биохакеры", "Люди с стареющим телом и без ВОПа которому доверяют", "Все кто хочет терапию-лайт 24/7 без $200/час"],
      deliveryTime: { template: "Хранилище активно за 5 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "Безлимит загрузок документов", "Долгосрочная память здоровья", "Детекция паттернов + еженедельный дайджест", "Режим эмоциональной поддержки", "Эскалация красных флагов"] },
        { name: "Pro", features: ["Всё из Basic", "До 4 членов семьи", "Общие или приватные хранилища на каждого", "Приоритетная поддержка человеком", "Опциональная синхронизация с iLucy для пожилых родителей"] },
      ],
    },
    UA: {
      tagline: "AI-лікар + психолог. Знає всю твою історію здоров'я.",
      category: "Агенти",
      description: "Завантажуй аналізи, рецепти, висновки лікарів. iDoctor пам'ятає все. Веде спосіб життя, ловить патерни, слухає у важкі моменти.",
      longDescription: "iDoctor — агент здоров'я, що поєднав дві ролі, які зазвичай окремо: лікаря, який розуміє твої аналізи, і психолога, який розуміє твоє життя. Кидаєш аналіз крові, кардіологічний висновок, МРТ — iDoctor розбирає, будує картину довжиною в роки, і ти питаєш звичайною мовою. Коли б'є життя — той самий агент слухає, відображає, застосовує CBT. Не заміна живих лікарів і терапевтів — 24/7 друга думка, яка знає твою повну історію. HIPAA-grade шифрування всього що завантажуєш; видалення в 1 клік у будь-який момент.",
      features: [
        { title: "Довгострокова пам'ять здоров'я", desc: "Кожен аналіз, кожен рецепт, кожен висновок — пам'ятається назавжди, шукається за 2 секунди." },
        { title: "Детекція патернів", desc: "«У тебе феритин дрейфує вниз 18 місяців». «Ти гірше спиш за тиждень до дедлайну». Речі, які жоден вузький спеціаліст не зловить." },
        { title: "Пояснення твоєю мовою", desc: "Висновок у латинських термінах? iDoctor перекладає на твій рівень — і відповідає на follow-up." },
        { title: "Режим емоційної підтримки", desc: "Коли діагноз не потрібен — потрібен просто той хто слухає. CBT/ACT-стиль, без приписів." },
        { title: "Ескалація червоних прапорів", desc: "Біль у грудях + специфічні слова? iDoctor зупиняється, дає телефони швидкої, відмовляється вести далі соло." },
      ],
      useCases: ["Носії хронічних хвороб, втомлені переповідати", "Тривожні біохакери", "Люди зі старіючим тілом і без сімейного лікаря якому довіряють", "Усі хто хоче терапію-лайт 24/7 без $200/год"],
      deliveryTime: { template: "Сховище активне за 5 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "Безліміт завантажень документів", "Довгострокова пам'ять здоров'я", "Детекція патернів + щотижневий дайджест", "Режим емоційної підтримки", "Ескалація червоних прапорів"] },
        { name: "Pro", features: ["Все з Basic", "До 4 членів сім'ї", "Спільні або приватні сховища на кожного", "Пріоритетна підтримка людиною", "Опціональна синхронізація з iLucy для літніх батьків"] },
      ],
    },
  },
  "ileva": {
    RU: {
      tagline: "Безопасный AI для детей 5–15. Под надзором Finekot.",
      category: "Агенты",
      description: "Твой ребёнок может спросить что угодно. Защитный стек Finekot следит чтобы iLeva учила, но никогда не навредила. Ничего неуместного, ничего страшного, ничего о чём пожалеешь.",
      longDescription: "iLeva — AI которого можно дать ребёнку без тревоги. Многослойный стек безопасности — контент-фильтры, родительские инструкции, курированная Finekot база знаний, возраст-адаптивный тон — делает так чтобы твой ребёнок получил только терпеливого репетитора и любопытного друга. Математика, чтение, языки, наука, аккуратные жизненные вопросы. Еженедельный дайджест родителю показывает что ребёнок узнал и где застрял. Построено и наблюдается Finekot Systems — не «обычный чат-бот с фильтром сверху».",
      features: [
        { title: "Стек безопасности Finekot", desc: "Четыре слоя: контент-фильтр, возрастной тон, курированная база знаний, родительские правила. Вредное не доходит до ребёнка. Никогда." },
        { title: "Возраст 5–15, адаптивно", desc: "Словарь, сложность, тон сдвигаются под возраст. 7-летний и 14-летний получают очень разных iLeva." },
        { title: "Режим репетитора", desc: "Помощь с домашкой которая учит, а не даёт ответ. Сократический метод по умолчанию." },
        { title: "Языковая практика", desc: "Говорение и письмо на EN/UA/RU/DE. Ребёнок выбирает тему, iLeva её держит." },
        { title: "Панель для родителя", desc: "Еженедельный дайджест: темы, прогресс, сложные места, одна рекомендация. Без слежки за диалогами — только агрегаты." },
      ],
      useCases: ["Родители 30–50 с детьми 5–15", "Семьи на домашнем обучении", "Родители чьи дети уже лазят в ChatGPT", "Бабушки и дедушки, дарящие безопасный AI вместо экранного времени"],
      deliveryTime: { template: "Активация за 10 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "1 профиль ребёнка", "Все возрасты 5–15", "Еженедельный дайджест родителю", "Стек безопасности Finekot", "EN / RU / UA / DE"] },
        { name: "Pro", features: ["Всё из Basic", "До 4 профилей детей", "Память, понимающая братьев и сестёр", "Приоритетная поддержка человеком"] },
      ],
    },
    UA: {
      tagline: "Безпечний AI для дітей 5–15. Під наглядом Finekot.",
      category: "Агенти",
      description: "Твоя дитина може запитати будь-що. Захисний стек Finekot слідкує щоб iLeva вчила, але ніколи не нашкодила. Нічого недоречного, нічого страшного, нічого про що пошкодуєш.",
      longDescription: "iLeva — AI якого можна дати дитині без тривоги. Багатошаровий стек безпеки — контент-фільтри, батьківські інструкції, курирована Finekot база знань, вік-адаптивний тон — робить так щоб твоя дитина отримала лише терплячого репетитора і допитливого друга. Математика, читання, мови, наука, обережні життєві питання. Щотижневий дайджест батькові показує що дитина дізналася і де застрягла. Побудовано й наглядається Finekot Systems — не «звичайний чат-бот із фільтром зверху».",
      features: [
        { title: "Стек безпеки Finekot", desc: "Чотири шари: контент-фільтр, віковий тон, курирована база знань, батьківські правила. Шкідливе не доходить до дитини. Ніколи." },
        { title: "Вік 5–15, адаптивно", desc: "Словник, складність, тон зсуваються під вік. 7-річний і 14-річний отримують дуже різних iLeva." },
        { title: "Режим репетитора", desc: "Допомога з домашкою що вчить, а не дає відповідь. Сократівський метод за замовчуванням." },
        { title: "Мовна практика", desc: "Говоріння і письмо EN/UA/RU/DE. Дитина обирає тему, iLeva її тримає." },
        { title: "Панель для батька", desc: "Щотижневий дайджест: теми, прогрес, складні місця, одна рекомендація. Без стеження за діалогами — лише агрегати." },
      ],
      useCases: ["Батьки 30–50 з дітьми 5–15", "Родини на домашньому навчанні", "Батьки чиї діти вже лазять у ChatGPT", "Бабусі та дідусі, що дарують безпечний AI замість екранного часу"],
      deliveryTime: { template: "Активація за 10 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "1 профіль дитини", "Всі вікові групи 5–15", "Щотижневий дайджест батьку", "Стек безпеки Finekot", "EN / RU / UA / DE"] },
        { name: "Pro", features: ["Все з Basic", "До 4 профілів дітей", "Пам'ять, що розуміє братів і сестер", "Пріоритетна підтримка людиною"] },
      ],
    },
  },
  "iada": {
    RU: {
      tagline: "Твой терминатор-исследователь. Perplexity-killer.",
      category: "Агенты",
      description: "Быстрый ответ с источниками за 30 секунд. Или Deep Research — структурированный отчёт на 2500 слов за 8 минут. Построена на собственном Ada-стеке Finekot.",
      longDescription: "iAda — публичная версия Ады, терминатора-исследователя внутри SKYNET. Работает в двух режимах. FAST: один вопрос, ~30–60 секунд, ответ с 5+ источниками. DEEP: многопроходное расследование по 20+ источникам, возвращает структурированный отчёт за 5–10 минут с противоречиями, уровнями достоверности и трассируемыми фактами. Создана как замена Perplexity для тех кто делает реальную работу — консультантов, аналитиков, основателей, журналистов. Помнит твои ресёрч-треды между сессиями.",
      features: [
        { title: "Fast-режим (30–60 сек)", desc: "Прямой ответ на вопрос с 5+ цитированными источниками. Как Perplexity, но с памятью." },
        { title: "Deep Research (3–10 мин)", desc: "Многошаговое расследование по Exa + Tavily + прямой краулинг. Возвращает отчёт со структурой, секциями, уровнями уверенности и открытыми вопросами." },
        { title: "Кросс-верификация источников", desc: "Помечает противоречия. Пишет «высокий / средний / под вопросом» на каждое утверждение." },
        { title: "Память тредов", desc: "Помнит что ты уже исследовал. «Неделю назад ты смотрел Delphi — вот что изменилось»." },
        { title: "Экспорт куда угодно", desc: "Один клик в Markdown, Notion, Google Docs. Или отчёт сразу в Telegram/email." },
      ],
      useCases: ["Консультанты, готовящие клиентские презентации", "Журналисты на дедлайне", "Продактовые менеджеры, сканирующие конкурентов", "Исследователи с literature review", "Основатели на валидации рынка"],
      deliveryTime: { template: "Активация за 2 минуты", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "Безлимит Fast-запросов", "20 Deep Research отчётов / мес", "Память тредов", "Экспорт Markdown / Notion / Docs"] },
        { name: "Pro", features: ["Всё из Basic", "Безлимит Deep Research", "Opus-тариф (макс. качество)", "API-доступ для Zapier / n8n / скриптов", "Кастомные доменные источники"] },
      ],
    },
    UA: {
      tagline: "Твій термінатор-дослідник. Perplexity-killer.",
      category: "Агенти",
      description: "Швидка відповідь з джерелами за 30 секунд. Або Deep Research — структурований звіт на 2500 слів за 8 хвилин. Побудована на власному Ada-стеку Finekot.",
      longDescription: "iAda — публічна версія Ади, термінатора-дослідника всередині SKYNET. Працює у двох режимах. FAST: одне питання, ~30–60 секунд, відповідь з 5+ джерелами. DEEP: багатопрохідне розслідування по 20+ джерелах, повертає структурований звіт за 5–10 хвилин із протиріччями, рівнями достовірності та трасованими фактами. Створена як заміна Perplexity для тих хто робить реальну роботу — консультантів, аналітиків, засновників, журналістів. Пам'ятає твої ресерч-треди між сесіями.",
      features: [
        { title: "Fast-режим (30–60 сек)", desc: "Пряма відповідь на питання з 5+ цитованими джерелами. Як Perplexity, але з пам'яттю." },
        { title: "Deep Research (3–10 хв)", desc: "Багатокроковий ресерч по Exa + Tavily + прямий краулінг. Повертає звіт зі структурою, секціями, рівнями впевненості та відкритими питаннями." },
        { title: "Крос-верифікація джерел", desc: "Помічає протиріччя. Пише «високий / середній / під питанням» на кожне твердження." },
        { title: "Пам'ять тредів", desc: "Пам'ятає що ти вже досліджував. «Тиждень тому ти дивився Delphi — ось що змінилося»." },
        { title: "Експорт куди завгодно", desc: "Один клік у Markdown, Notion, Google Docs. Або звіт одразу в Telegram/email." },
      ],
      useCases: ["Консультанти, що готують клієнтські презентації", "Журналісти на дедлайні", "Продуктові менеджери, що сканують конкурентів", "Дослідники з literature review", "Засновники на валідації ринку"],
      deliveryTime: { template: "Активація за 2 хвилини", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "Безліміт Fast-запитів", "20 Deep Research звітів / міс", "Пам'ять тредів", "Експорт Markdown / Notion / Docs"] },
        { name: "Pro", features: ["Все з Basic", "Безліміт Deep Research", "Opus-тариф (макс. якість)", "API-доступ для Zapier / n8n / скриптів", "Кастомні доменні джерела"] },
      ],
    },
  },
  "ihogol": {
    RU: {
      tagline: "Учит твой голос. Пишет в нём.",
      category: "Агенты",
      description: "Загрузи 30 своих постов. Он ловит твой тон. Дальше пишет в твоём голосе: Telegram, Instagram, LinkedIn, email. Ты редактируешь, публикуешь.",
      longDescription: "iHogol — это агент, который делает твоё писательство не звучащим как AI. Разбирает 30 примеров твоих текстов, собирает voice-профиль (тон, ритм, лексика, панчлайны, навязчивости), и дальше генерит посты, письма, сценарии и кампании которые читаются как твои лучшие тексты. Не кнопка «сгенери мне пост» — соавтор который знает твоё позиционирование, твою аудиторию и что ты уже написал, чтобы не повторяться.",
      features: [
        { title: "Voice-профиль за 30 примеров", desc: "Вставляешь 30 своих постов — iHogol строит voice-профиль, который ты можешь просмотреть, отредактировать, версионировать." },
        { title: "Мультиплатформенная адаптация", desc: "Одна идея → пост в Telegram + подпись в Instagram + op-ed в LinkedIn + тизер в email. Каждый в правильной длине и тоне." },
        { title: "Контент-календарь", desc: "Месячный календарь с темами, форматами, варианты hook-ов. Ты согласовываешь — iHogol пишет." },
        { title: "Анти-повтор память", desc: "Помнит каждый твой опубликованный пост, чтобы новое не пережёвывало старое." },
        { title: "Разбор engagement", desc: "После публикации iHogol тянет метрики и говорит что сработало в твоём голосе — а что было дрейфом." },
      ],
      useCases: ["Создатели с аудиторией 5k–500k", "Founders, строящие личный бренд", "Агентства ведущие thought-leader аккаунты", "Ghostwriters хотящие в 3 раза ускориться", "Инфобиз запускающий курсы"],
      deliveryTime: { template: "Голос обучен за 10 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "Voice-профиль из 30+ примеров", "Безлимит черновиков", "Мультиплатформенная адаптация", "Анти-повтор память"] },
        { name: "Pro", features: ["Всё из Basic", "До 3 голосов (команда / агентство)", "Календарь + workflow согласования", "Разбор engagement", "Приоритетная поддержка"] },
      ],
    },
    UA: {
      tagline: "Вчить твій голос. Пише в ньому.",
      category: "Агенти",
      description: "Завантаж 30 своїх постів. Він ловить твій тон. Далі пише у твоєму голосі: Telegram, Instagram, LinkedIn, email. Ти редагуєш, публікуєш.",
      longDescription: "iHogol — це агент, який робить твоє письменництво таким, що не звучить як AI. Розбирає 30 прикладів твоїх текстів, збирає voice-профіль (тон, ритм, лексика, панчлайни, нав'язливості), і далі генерує пости, листи, сценарії та кампанії які читаються як твої найкращі тексти. Не кнопка «згенеруй мені пост» — співавтор який знає твоє позиціонування, твою аудиторію і що ти вже написав, щоб не повторюватися.",
      features: [
        { title: "Voice-профіль за 30 прикладів", desc: "Вставляєш 30 своїх постів — iHogol будує voice-профіль, який ти можеш переглянути, відредагувати, версіонувати." },
        { title: "Мультиплатформна адаптація", desc: "Одна ідея → пост у Telegram + підпис в Instagram + op-ed у LinkedIn + тизер в email. Кожен у правильній довжині та тоні." },
        { title: "Контент-календар", desc: "Місячний календар з темами, форматами, варіанти hook-ів. Ти погоджуєш — iHogol пише." },
        { title: "Анти-повтор пам'ять", desc: "Пам'ятає кожен твій опублікований пост, щоб нове не пережовувало старе." },
        { title: "Розбір engagement", desc: "Після публікації iHogol тягне метрики і каже що спрацювало у твоєму голосі — а що було дрейфом." },
      ],
      useCases: ["Творці з аудиторією 5k–500k", "Founders, що будують особистий бренд", "Агентства що ведуть thought-leader акаунти", "Ghostwriters бажаючі втричі прискоритися", "Інфобіз що запускає курси"],
      deliveryTime: { template: "Голос навчено за 10 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "Voice-профіль з 30+ прикладів", "Безліміт чернеток", "Мультиплатформна адаптація", "Анти-повтор пам'ять"] },
        { name: "Pro", features: ["Все з Basic", "До 3 голосів (команда / агенція)", "Календар + workflow погодження", "Розбір engagement", "Пріоритетна підтримка"] },
      ],
    },
  },
  "italker": {
    RU: {
      tagline: "Отрепетируй тяжёлый разговор. Потом иди и проведи его.",
      category: "Агенты",
      description: "Опиши сцену — разговор о зарплате, увольнение, разрыв, злой клиент. iTalker играет твоего визави по-настоящему. 4 раунда — и ты готов.",
      longDescription: "iTalker — спарринг-партнёр для разговоров, которые реально важны. Описываешь сцену (кто, что, чего ты хочешь), и он играет противоположную сторону — реалистично, с возражениями, эмоциями, паузами которые ты встретишь. После каждого раунда — разбор: что держал, где слил, одно изменение. Это не терапия и не юридический совет. Это репетиция. Как профессиональные переговорщики репетируют перед комнатой — теперь и для твоего разговора о зарплате во вторник.",
      features: [
        { title: "Библиотека сценариев", desc: "Разговор о зарплате, увольнение, трудная обратная связь, защита цены, разрыв, семейный конфликт, питч инвестору — 20+ шаблонов или полностью кастом." },
        { title: "Реализм роли", desc: "iTalker держит персонаж: твой шеф-скряга остаётся скрягой, твой убитый горем родитель остаётся убитым. Без незапрошенных утешений." },
        { title: "Многораундовая репетиция", desc: "3–5 раундов за сессию. Каждый раунд проверяет другую слабость твоей позиции." },
        { title: "Разбор после каждого раунда", desc: "Что сработало / где слил / одно хирургическое изменение. Не лекция — тренерская заметка." },
        { title: "Voice-режим", desc: "Репетируй вслух, полный duplex. Потому что печатая ты не ловишь панику в собственном голосе." },
      ],
      useCases: ["Все кто готовится просить повышение", "Менеджеры перед увольнением сотрудника", "Основатели перед term sheet", "Партнёры перед тяжёлым разговором дома", "Продажники против ценовых возражений"],
      deliveryTime: { template: "Первая сессия за 3 минуты", integration: "Подписка — без setup-платы" },
    },
    UA: {
      tagline: "Відрепетируй важку розмову. Потім іди і проведи її.",
      category: "Агенти",
      description: "Опиши сцену — розмова про зарплату, звільнення, розрив, злий клієнт. iTalker грає твого візаві по-справжньому. 4 раунди — і ти готовий.",
      longDescription: "iTalker — спаринг-партнер для розмов, які реально важливі. Описуєш сцену (хто, що, чого ти хочеш), і він грає протилежну сторону — реалістично, із запереченнями, емоціями, паузами які ти зустрінеш. Після кожного раунду — розбір: що тримав, де здав, одна зміна. Це не терапія і не юридична порада. Це репетиція. Як професійні перемовники репетирують перед кімнатою — тепер і для твоєї розмови про зарплату у вівторок.",
      features: [
        { title: "Бібліотека сценаріїв", desc: "Розмова про зарплату, звільнення, важкий зворотний зв'язок, захист ціни, розрив, сімейний конфлікт, пітч інвестору — 20+ шаблонів або повністю кастом." },
        { title: "Реалізм ролі", desc: "iTalker тримає персонажа: твій шеф-скнара залишається скнарою, твій вбитий горем батько залишається вбитим. Без непрошених розрад." },
        { title: "Багатораундова репетиція", desc: "3–5 раундів за сесію. Кожен раунд перевіряє іншу слабкість твоєї позиції." },
        { title: "Розбір після кожного раунду", desc: "Що спрацювало / де здав / одна хірургічна зміна. Не лекція — тренерська нотатка." },
        { title: "Voice-режим", desc: "Репетируй вголос, повний duplex. Бо друкуючи ти не ловиш паніку у власному голосі." },
      ],
      useCases: ["Усі хто готується просити підвищення", "Менеджери перед звільненням співробітника", "Засновники перед term sheet", "Партнери перед важкою розмовою вдома", "Продажники проти цінових заперечень"],
      deliveryTime: { template: "Перша сесія за 3 хвилини", integration: "Підписка — без setup-оплати" },
    },
  },
  "iborya": {
    RU: {
      tagline: "AI-операционный директор для малого бизнеса",
      category: "Агенты",
      description: "Подписной AI-агент, который 24/7 держит твоих клиентов, задачи и финансы под контролем. Работает с CRM, календарём и мессенджерами.",
      longDescription: "iБоря — первый авторский агент Finekot в новой подписной линейке. Не теряет клиентов, не забывает задач, в 8:00 шлёт утренний бриф, отвечает на рутинные вопросы клиентов в Telegram/WhatsApp твоим голосом — пока ты занимаешься бизнесом. Подключается к твоей CRM, календарю, Notion и мессенджерам. 7 дней бесплатно, отмена в 1 клик.",
      features: [
        { title: "Пульс клиентов", desc: "Замечает тех, кто молчит 3+ недели. Собирает контекст и пишет реактивирующее письмо в твоём тоне на согласование." },
        { title: "Утренний бриф", desc: "В 8:00 в Telegram: что вчера не сделано, что горит сегодня, кто ждёт ответа." },
        { title: "Голос → задачи", desc: "Сбросил голосовое с 3-мя пунктами. iБоря разбил на задачи в Todoist/Notion с дедлайнами и контекстом." },
        { title: "Рутинные ответы", desc: "Отвечает на типовые вопросы клиентов в Telegram/WhatsApp в твоём голосе. Эскалирует только важное." },
        { title: "Еженедельный отчёт", desc: "Пятница: выручка, новые и ушедшие клиенты, узкие места + одна рекомендация на след. неделю." },
      ],
      useCases: ["Соло-предприниматели", "Владельцы малого бизнеса (≤10 чел)", "Инфобизнесмены (5k–50k аудитория)", "Консультанты и коучи", "Агентства"],
      deliveryTime: { template: "Активация за 5 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["7 дней бесплатно", "Утренний бриф + триаж почты", "Подготовка и расшифровка встреч", "Голос → задачи", "Персональная память"] },
        { name: "Pro", features: ["Всё из Basic", "Opus-тариф (макс. качество)", "Безлимит сообщений", "Приоритетная скорость", "API + Zapier доступ", "Кастомные интеграции"] },
      ],
    },
    UA: {
      tagline: "AI-операційний директор для малого бізнесу",
      category: "Агенти",
      description: "Підписний AI-агент, що 24/7 тримає твоїх клієнтів, задачі та фінанси під контролем. Працює з CRM, календарем і месенджерами.",
      longDescription: "iБоря — перший авторський агент Finekot у новій підписній лінійці. Не губить клієнтів, не забуває задач, о 8:00 шле ранковий бриф, відповідає на рутинні запити клієнтів у Telegram/WhatsApp твоїм голосом — поки ти займаєшся бізнесом. Підключається до твоєї CRM, календаря, Notion та месенджерів. 7 днів безкоштовно, скасування в 1 клік.",
      features: [
        { title: "Пульс клієнтів", desc: "Помічає тих, хто мовчить 3+ тижні. Збирає контекст і пише реактивуючий лист у твоєму тоні на узгодження." },
        { title: "Ранковий бриф", desc: "О 8:00 у Telegram: що вчора не зроблено, що горить сьогодні, хто чекає на відповідь." },
        { title: "Голос → задачі", desc: "Скинув голосове з 3-ма пунктами. iБоря розбив на задачі у Todoist/Notion з дедлайнами та контекстом." },
        { title: "Рутинні відповіді", desc: "Відповідає на типові питання клієнтів у Telegram/WhatsApp твоїм голосом. Ескалює лише важливе." },
        { title: "Тижневий звіт", desc: "П'ятниця: виторг, нові та втрачені клієнти, вузькі місця + одна рекомендація на наступний тиждень." },
      ],
      useCases: ["Соло-підприємці", "Власники малого бізнесу (≤10 осіб)", "Інфобізнесмени (5k–50k аудиторія)", "Консультанти та коучі", "Агентства"],
      deliveryTime: { template: "Активація за 5 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["7 днів безкоштовно", "Ранковий бриф + тріаж пошти", "Підготовка і розшифровка зустрічей", "Голос → задачі", "Персональна пам'ять"] },
        { name: "Pro", features: ["Все з Basic", "Opus-тариф (макс. якість)", "Безліміт повідомлень", "Пріоритетна швидкість", "API + Zapier доступ", "Кастомні інтеграції"] },
      ],
    },
  },
  "skynet-intake": {
    RU: {
      tagline: "AI-ассистент задач",
      category: "Боты",
      description: "Telegram-бот, превращающий сырые идеи (текст/голос) в структурированные задачи с AI-маршрутизацией.",
      longDescription: "SKYNET Intake превращает сырые идеи — голосовые сообщения, тексты — в структурированные, приоритизированные задачи. AI-приоритизация и маршрутизация по агентам. Рекомендуется для использования с SKYNET 3.0 и выше.",
      features: [
        { title: "Голосовой ввод", desc: "Отправьте голосовое сообщение — бот транскрибирует и структурирует автоматически." },
        { title: "AI-структурирование и маршрутизация", desc: "AI разбирает ввод и направляет задачи нужному агенту автоматически." },
        { title: "Автоприоритизация", desc: "Назначает срочность и важность на основе анализа содержания." },
        { title: "Интеграция с Todoist, Notion, Linear", desc: "Задачи синхронизируются с вашим инструментом управления проектами мгновенно." },
      ],
      useCases: ["Предприниматели", "Тимлиды", "Менеджеры проектов", "Креативные специалисты", "Удалённые команды"],
      deliveryTime: { template: "Мгновенная загрузка", integration: "Свяжитесь для настройки" },
    },
    UA: {
      tagline: "AI-асистент задач",
      category: "Боти",
      description: "Telegram-бот, що перетворює сирі ідеї (текст/голос) на структуровані задачі з AI-маршрутизацією.",
      longDescription: "SKYNET Intake перетворює сирі ідеї — голосові повідомлення, тексти — на структуровані, пріоритизовані задачі. AI-пріоритизація та маршрутизація по агентах. Рекомендовано для використання з SKYNET 3.0 та вище.",
      features: [
        { title: "Голосовий ввід", desc: "Надішліть голосове повідомлення — бот транскрибує та структурує автоматично." },
        { title: "AI-структурування та маршрутизація", desc: "AI розбирає ввід і спрямовує задачі потрібному агенту автоматично." },
        { title: "Автопріоритизація", desc: "Призначає терміновість та важливість на основі аналізу вмісту." },
        { title: "Інтеграція з Todoist, Notion, Linear", desc: "Задачі синхронізуються з вашим інструментом управління проєктами миттєво." },
      ],
      useCases: ["Підприємці", "Тімліди", "Менеджери проєктів", "Креативні спеціалісти", "Віддалені команди"],
      deliveryTime: { template: "Миттєве завантаження", integration: "Зв'яжіться для налаштування" },
    },
  },
};

export function getProductById(id: string): ProductData | undefined {
  return productsData.find((p) => p.id === id);
}

export function getTranslatedProduct(id: string, lang: Lang): ProductData | undefined {
  const product = getProductById(id);
  if (!product) return undefined;
  if (lang === "EN") return product;

  const t = translations[id]?.[lang];
  if (!t) return product;

  let pricing = product.pricing;
  if (t.tiers && product.pricing.subscription?.tiers) {
    const masterTiers = product.pricing.subscription.tiers;
    const merged = masterTiers.map((mt, i) => {
      const tt = t.tiers?.[i];
      return tt ? { name: tt.name, price: mt.price, features: tt.features } : mt;
    });
    pricing = {
      ...product.pricing,
      subscription: { ...product.pricing.subscription, tiers: merged },
    };
  }

  return {
    ...product,
    tagline: t.tagline,
    category: t.category,
    description: t.description,
    longDescription: t.longDescription,
    features: t.features,
    useCases: t.useCases,
    deliveryTime: t.deliveryTime,
    pricing,
  };
}

export function getTranslatedProducts(lang: Lang): ProductData[] {
  return productsData.map((p) => getTranslatedProduct(p.id, lang) ?? p);
}
