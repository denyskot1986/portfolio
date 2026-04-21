import type { Lang } from "./i18n";

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
    id: "boris",
    name: "Boris",
    tagline: "Your right hand in Telegram.",
    category: "Agents",
    description: "Personal AI chief of staff. Lives in your Telegram. Runs your calendar, inbox, tasks and meeting prep — voice or text.",
    longDescription: "Boris is your right hand. An AI agent that sits in your Telegram and absorbs the chaos of your day — morning brief, inbox triage, meeting prep and recap, voice-to-task on the move. Built for one human: you. Remembers your people, your projects, your promises. The longer he works with you, the sharper he gets.",
    features: [
      { title: "Runs your morning brief", desc: "At 8:00 in Telegram: today's priorities, pre-read for every meeting, follow-ups you owe, flags on anything slipping." },
      { title: "Triages your inbox", desc: "Sorts mail into act-now / today / this week / ignore. Drafts replies in your voice — you hit send." },
      { title: "Preps and recaps meetings", desc: "Before every call: who, what they last said, what you promised. After: action items filed into your task system." },
      { title: "Turns voice into tasks", desc: "Drop a voice note with 3 things. Boris splits them into Todoist/Notion tasks with deadlines and context." },
      { title: "Remembers your world", desc: "Holds your people, projects and promises in persistent memory. The more you use him, the more right-hand he becomes." },
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
        tiers: [
          { name: "Basic", price: 49, features: ["Morning brief + inbox triage", "Meeting prep & recap", "Voice → tasks", "Personal memory"] },
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
     |   BORIS — RIGHT HAND      |
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
    id: "eva",
    name: "Eva",
    tagline: "She calls your parents when you can't.",
    category: "Agents",
    description: "Twice-a-day calls to your aging parent. Real conversation. Meds checked. You get a ping the second something's off.",
    longDescription: "Eva is the warm, patient AI companion for the parents you love but can't always visit. She calls morning and evening over a regular phone, holds a real conversation, makes sure medication is taken, and escalates to you instantly if she hears anything alarming. Gentle on the surface, watchful underneath. Weekly family report lands in your Telegram every Sunday. Any health notes you upload are stored HIPAA-grade.",
    features: [
      { title: "Calls twice a day", desc: "Morning and evening, over a regular phone number. Real conversation — not a voice menu." },
      { title: "Keeps meds on schedule", desc: "Reminds at the right time, checks back, escalates to you if a dose is skipped." },
      { title: "Catches distress fast", desc: "Spots tremor, confusion, keywords like 'can't breathe' — calls emergency and pings you within seconds." },
      { title: "Sends a Sunday family report", desc: "Mood trend, topics, health flags. One clean digest in your Telegram every week." },
      { title: "Works on smart speakers", desc: "Runs through Yandex / Google / Alice speakers when your parent prefers hands-free." },
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
        tiers: [
          { name: "Basic", price: 99, features: ["2 voice calls per day", "Medication + health reminders", "Weekly family report", "Emergency escalation"] },
          { name: "Pro", price: 149, features: ["Everything in Basic", "Unlimited voice calls", "Smart-speaker deployment (Yandex/Google/Alice)", "Doctor's report sync via Patrik", "Priority human support"] },
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
     |   EVA — CARE ENGINE       |
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
    id: "david",
    name: "David",
    tagline: "The steady hand running your small business.",
    category: "Agents",
    description: "24/7 operations chief for your business. Holds clients, tasks and money together. Plugs into your CRM, calendar and messengers over MCP.",
    longDescription: "David is the Finekot agent for running a small business without drowning in it. He doesn't forget clients, doesn't lose tasks, writes your morning business brief, and handles routine client questions in Telegram/WhatsApp while you run the real work. Under the hood he speaks MCP — the open Model Context Protocol standard — so he doesn't just chat about your CRM, he opens it and does the work. Hosted by Finekot, per-business memory, integrations out of the box.",
    features: [
      { title: "Tracks the client pulse", desc: "Spots clients who ghosted for 3+ weeks, drafts a re-engagement message in your tone for one-click send." },
      { title: "Writes your morning business brief", desc: "At 8:00 you get a Telegram summary: yesterday's unfinished, today's fires, who is waiting for an answer, which revenue is at risk." },
      { title: "Handles routine client replies", desc: "Answers repetitive client questions in Telegram/WhatsApp in your business voice. Escalates only when it matters." },
      { title: "Speaks MCP natively", desc: "Connects to any MCP server — CRM, Gmail, Notion, Linear, Slack, custom. Not a one-off integration — a live protocol." },
      { title: "Ships a weekly report", desc: "Friday digest: revenue, new & lost clients, bottlenecks, and one recommendation for next week." },
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
        tiers: [
          { name: "Basic", price: 79, features: ["Client pulse + morning brief", "Routine replies in Telegram/WhatsApp", "Weekly report", "All MCP connectors"] },
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
     |   DAVID — OPS ENGINE      |
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
    id: "patrik",
    name: "Patrik",
    tagline: "The doctor who remembers every lab you've ever taken.",
    category: "Agents",
    description: "Upload your labs, prescriptions, doctor's notes. Patrik remembers everything. Guides lifestyle, flags patterns, talks you through the hard moments.",
    longDescription: "Patrik is a health agent built around one idea: the doctor who understands your labs and the psychologist who understands your life shouldn't be two different people. Drop in a blood panel, a cardiology note, an MRI report — Patrik ingests it, builds a longitudinal picture of your body, and you can ask anything in plain language. When life hits hard, the same agent listens, reflects, and applies CBT-style techniques. Not a replacement for live doctors or therapists — a 24/7 second opinion that knows your entire history. HIPAA-grade encryption; one-click full delete at any time.",
    features: [
      { title: "Holds your full health history", desc: "Every lab, every prescription, every doctor's note — remembered forever, searchable in 2 seconds." },
      { title: "Spots the slow drift", desc: "'Your ferritin has been drifting down for 18 months.' 'You sleep worse the week before a deadline.' — things no single specialist would catch." },
      { title: "Translates the Latin", desc: "Cardiology note full of medical jargon? Patrik translates to your level — then answers follow-ups." },
      { title: "Listens when you need it", desc: "When you don't need a diagnosis — just need someone to listen. CBT/ACT-style, never prescriptive." },
      { title: "Escalates red flags hard", desc: "Chest pain + specific descriptors? Patrik stops, gives emergency numbers, refuses to handle solo." },
    ],
    useCases: ["Chronic condition carriers tired of re-explaining their history", "Anxious health-tracker types", "People with aging bodies and no local GP they trust", "Anyone who wants therapy-lite 24/7 without the $200/hour bill"],
    techStack: ["Claude Opus 4.7", "Encrypted health vault (AES-256)", "Medical document OCR", "PubMed RAG for grounded claims", "24/7 emergency keyword filter"],
    pricing: {
      code: 99,
      currency: "USD",
      subscription: {
        monthly: 99,
        yearly: 950,
        currency: "USD",
        tiers: [
          { name: "Basic", price: 99, features: ["Unlimited document uploads", "Longitudinal health memory", "Pattern detection & weekly digest", "Emotional support mode", "Red-flag escalation"] },
          { name: "Pro", price: 179, features: ["Everything in Basic", "Up to 4 family members", "Shared or private vaults per person", "Priority human support", "Optional sync with Eva for aging parents"] },
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
     |   PATRIK — HEALTH AGENT   |
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
    id: "taras",
    name: "Taras",
    tagline: "The strong guardian for kids 5–15.",
    category: "Agents",
    description: "Your kid can ask anything. The Finekot safety stack makes sure Taras teaches, never harms. Nothing inappropriate, nothing scary, nothing you'd regret.",
    longDescription: "Taras is the AI you can hand to your kid without anxiety. A multi-layer safety stack — content filters, parental instructions, a Finekot-curated knowledge base, and age-adaptive tone — makes sure the only thing your child gets is a patient tutor and a curious playmate. Math, reading, languages, science, gentle life questions. A weekly parent digest shows what your kid learned and where they got stuck. Built and watched by Finekot Systems — not a general-purpose chatbot with a filter bolted on.",
    features: [
      { title: "Guards with the Finekot safety stack", desc: "Four layers: content filter, age tone match, curated knowledge base, parental rules. No harmful content reaches the child. Ever." },
      { title: "Adapts to age 5–15", desc: "Vocabulary, complexity, and tone shift per age. A 7-year-old and a 14-year-old get very different Tarases." },
      { title: "Teaches instead of answering", desc: "Homework help that teaches instead of hands over answers. Socratic method by default." },
      { title: "Holds real language practice", desc: "Spoken and written practice in EN/UA/RU/DE. Child picks the topic; Taras keeps it going." },
      { title: "Keeps parents in the loop", desc: "Weekly digest: topics explored, progress, struggles, one recommendation. No conversation spying — just aggregate insights." },
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
        tiers: [
          { name: "Basic", price: 49, features: ["1 child profile", "All ages 5–15", "Weekly parent digest", "Finekot safety stack", "EN/RU/UA/DE"] },
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
     |   TARAS — KID AGENT       |
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
    id: "ada",
    name: "Ada",
    tagline: "The research agent. Perplexity-killer.",
    category: "Agents",
    description: "Fast answer with sources in 30 seconds. Or Deep Research — a structured 2,500-word report in 8 minutes. Built on Finekot's own Ada stack.",
    longDescription: "Ada is the research agent in the Finekot collective. She runs two modes. FAST: one question, ~30–60 seconds, answer with 5+ sources. DEEP: a multi-pass investigation across 20+ sources that returns a structured 5–10 minute report, with contradictions flagged and every claim traceable. Built to replace Perplexity for anyone doing real work — consultants, analysts, founders, journalists. Remembers your research threads across sessions so you don't repeat yourself.",
    features: [
      { title: "Answers fast in 30–60 sec", desc: "Direct answer to your question with 5+ cited sources. Like Perplexity, but with memory." },
      { title: "Runs Deep Research in 3–10 min", desc: "Multi-step investigation across Exa + Tavily + direct crawl. Returns a structured report with sections, confidence levels, and open questions." },
      { title: "Verifies across sources", desc: "Flags contradictions between sources. Rates each claim 'high / medium / questionable'." },
      { title: "Remembers your threads", desc: "Holds what you've researched before. 'Last week you were looking at Delphi — here's what changed since.'" },
      { title: "Exports anywhere", desc: "One-click export to Markdown, Notion, Google Docs. Or get the report straight in Telegram/email." },
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
        tiers: [
          { name: "Basic", price: 49, features: ["Unlimited Fast queries", "20 Deep Research reports / mo", "Thread memory", "Markdown / Notion / Docs export"] },
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
     |   ADA — RESEARCH ENGINE   |
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
    id: "hanna",
    name: "Hanna",
    tagline: "Learns your voice. Writes in it.",
    category: "Agents",
    description: "Feed her 30 of your posts. She catches your tone. Then she writes in your voice: Telegram, Instagram, LinkedIn, email. You edit, you publish.",
    longDescription: "Hanna is the creative agent that does your writing without sounding like AI. She ingests 30 samples of your existing text, builds a voice profile (tone, rhythm, vocabulary, punchlines, obsessions), and from then on generates posts, emails, video scripts and campaign copy that read as if you wrote them on your best day. Not a 'generate me a post' button — a collaborator who knows your positioning, your audience, and what you've already said so she doesn't repeat you.",
    features: [
      { title: "Builds your voice profile in 30 samples", desc: "Paste 30 of your posts once. Hanna builds a voice profile you can audit, edit, and version." },
      { title: "Adapts across every platform", desc: "One idea → Telegram post + Instagram caption + LinkedIn op-ed + email teaser. Each in the right length and tone." },
      { title: "Runs a content calendar", desc: "Monthly calendar with themes, formats, and hook options. You approve — Hanna drafts." },
      { title: "Refuses to repeat you", desc: "Remembers every post you've published so new content doesn't re-litigate old takes." },
      { title: "Debriefs what worked", desc: "After posting, Hanna pulls metrics and tells you what worked in your voice — and what was drift." },
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
        tiers: [
          { name: "Basic", price: 49, features: ["Voice profile from 30+ samples", "Unlimited drafts", "Multi-platform adaptation", "Anti-repeat memory"] },
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
     |   HANNA — WRITER AGENT    |
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
    id: "orban",
    name: "Orban",
    tagline: "AI Task Assistant",
    category: "Bots",
    description: "A Telegram bot that turns raw ideas (text/voice) into structured tasks with AI routing.",
    longDescription: "Orban turns raw ideas — voice messages, texts — into structured, prioritized tasks. He parses intent, scores priority, and routes every task to the right agent in the Finekot collective.",
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
  "eva": {
    RU: {
      tagline: "Звонит твоим родителям, когда ты не можешь.",
      category: "Агенты",
      description: "Звонит маме или папе дважды в день. Реальный разговор. Таблетки проверены. Ты получаешь пинг в ту же секунду, если что-то не так.",
      longDescription: "Eva — тёплый, терпеливый AI-компаньон для тех родителей, которых ты любишь, но не можешь навещать каждый день. Звонит утром и вечером на обычный телефон, ведёт живой разговор, следит что таблетки приняты, и моментально эскалирует тебе если услышит что-то тревожное. Мягкая снаружи, внимательная внутри. Еженедельный семейный отчёт приходит тебе в Telegram каждое воскресенье. Медицинская документация — с шифрованием уровня HIPAA.",
      features: [
        { title: "Звонит дважды в день", desc: "Утро и вечер, на обычный телефон. Реальный разговор, а не меню." },
        { title: "Держит таблетки по графику", desc: "Напоминает вовремя, проверяет что принято, эскалирует тебе если пропуск." },
        { title: "Ловит тревогу мгновенно", desc: "Замечает дрожь, спутанность, слова типа «задыхаюсь» — вызывает скорую и пишет тебе за секунды." },
        { title: "Шлёт воскресный отчёт", desc: "Настроение, темы, здоровье. Один чистый дайджест в твой Telegram раз в неделю." },
        { title: "Работает через колонки", desc: "Запускается через Яндекс / Google / Алису если родителю удобнее hands-free." },
      ],
      useCases: ["Взрослые 30–55 с родителями 65+", "Семьи, разделённые 500+ км", "Восстановление после инсульта или операции дома", "Одинокие бабушки и дедушки"],
      deliveryTime: { template: "Номер активен за 30 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["2 голосовых звонка в день", "Напоминания о лекарствах и здоровье", "Еженедельный семейный отчёт", "Экстренная эскалация"] },
        { name: "Pro", features: ["Всё из Basic", "Безлимит голосовых звонков", "Колонки (Яндекс / Google / Алиса)", "Синхронизация с Patrik", "Приоритетная поддержка человеком"] },
      ],
    },
    UA: {
      tagline: "Дзвонить твоїм батькам, коли ти не можеш.",
      category: "Агенти",
      description: "Дзвонить мамі або татові двічі на день. Справжня розмова. Таблетки перевірені. Ти отримуєш пінг тієї ж секунди, якщо щось не так.",
      longDescription: "Eva — теплий, терплячий AI-компаньйон для тих батьків, яких ти любиш, але не можеш відвідувати щодня. Телефонує вранці та ввечері на звичайний телефон, веде живу розмову, слідкує що таблетки прийняті, і миттєво ескалує тобі, якщо почує щось тривожне. М'яка зовні, уважна всередині. Щотижневий сімейний звіт приходить тобі в Telegram щонеділі. Медична документація — з шифруванням рівня HIPAA.",
      features: [
        { title: "Телефонує двічі на день", desc: "Ранок і вечір, на звичайний телефон. Справжня розмова, а не меню." },
        { title: "Тримає ліки за графіком", desc: "Нагадує вчасно, перевіряє що прийнято, ескалує тобі у разі пропуску." },
        { title: "Ловить тривогу миттєво", desc: "Помічає тремтіння, сплутаність, слова типу «задихаюсь» — викликає швидку і пише тобі за секунди." },
        { title: "Шле недільний звіт", desc: "Настрій, теми, здоров'я. Один чистий дайджест у твій Telegram раз на тиждень." },
        { title: "Працює через колонки", desc: "Запускається через Яндекс / Google / Алісу якщо батькові зручніше hands-free." },
      ],
      useCases: ["Дорослі 30–55 з батьками 65+", "Родини, розділені 500+ км", "Відновлення після інсульту чи операції вдома", "Самотні бабусі й дідусі"],
      deliveryTime: { template: "Номер активний за 30 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["2 голосові дзвінки на день", "Нагадування про ліки та здоров'я", "Щотижневий сімейний звіт", "Екстрена ескалація"] },
        { name: "Pro", features: ["Все з Basic", "Безліміт голосових дзвінків", "Колонки (Яндекс / Google / Аліса)", "Синхронізація з Patrik", "Пріоритетна підтримка людиною"] },
      ],
    },
  },
  "david": {
    RU: {
      tagline: "Надёжная рука, держащая твой малый бизнес.",
      category: "Агенты",
      description: "24/7 операционный директор для твоего бизнеса. Держит клиентов, задачи и деньги. Работает с CRM, календарём и мессенджерами через MCP.",
      longDescription: "David — агент от Finekot для ведения малого бизнеса так, чтобы в нём не утонуть. Не теряет клиентов, не забывает задач, пишет утренний бизнес-бриф и отвечает на рутинные вопросы клиентов в Telegram/WhatsApp пока ты занят настоящей работой. Под капотом говорит на MCP — открытом стандарте Model Context Protocol — поэтому не просто болтает про твою CRM, а открывает её и делает дело. Хостится у Finekot, с бизнес-памятью и интеграциями из коробки.",
      features: [
        { title: "Держит пульс клиентов", desc: "Замечает тех, кто молчит 3+ недели. Собирает контекст и пишет реактивирующее письмо в твоём тоне на согласование." },
        { title: "Пишет утренний бизнес-бриф", desc: "В 8:00 в Telegram: что вчера не сделано, что горит сегодня, кто ждёт ответа, какая выручка под риском." },
        { title: "Ведёт рутинные ответы", desc: "Отвечает на типовые вопросы клиентов в Telegram/WhatsApp в твоём бизнес-голосе. Эскалирует только важное." },
        { title: "Говорит на MCP нативно", desc: "Подключается к любому MCP-серверу — CRM, Gmail, Notion, Linear, Slack, кастомным. Не одноразовая интеграция — живой протокол." },
        { title: "Шлёт отчёт в пятницу", desc: "Пятница: выручка, новые и ушедшие клиенты, узкие места + одна рекомендация на следующую неделю." },
      ],
      useCases: ["Соло-предприниматели", "Владельцы малого бизнеса (≤10 чел)", "Инфобизнесмены (5k–50k аудитория)", "Консультанты и коучи", "Агентства"],
      deliveryTime: { template: "Telegram + MCP настройка за ~15 мин", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["Пульс клиентов + утренний бриф", "Рутинные ответы в Telegram/WhatsApp", "Еженедельный отчёт", "Все MCP-коннекторы"] },
        { name: "Pro", features: ["Всё из Basic", "Opus-тариф (макс. качество)", "Безлимит сообщений", "Кастомные MCP-серверы под твой стек", "Приоритетная поддержка человеком", "Квартальный tune-up с Denys Kot"] },
      ],
    },
    UA: {
      tagline: "Надійна рука, що тримає твій малий бізнес.",
      category: "Агенти",
      description: "24/7 операційний директор для твого бізнесу. Тримає клієнтів, задачі та гроші. Працює з CRM, календарем та месенджерами через MCP.",
      longDescription: "David — агент від Finekot для ведення малого бізнесу так, щоб у ньому не потонути. Не губить клієнтів, не забуває задач, пише ранковий бізнес-бриф і відповідає на рутинні запити клієнтів у Telegram/WhatsApp поки ти зайнятий справжньою роботою. Під капотом говорить на MCP — відкритому стандарті Model Context Protocol — тому не просто базікає про твою CRM, а відкриває її і робить справу. Хоститься у Finekot, з бізнес-пам'яттю та інтеграціями з коробки.",
      features: [
        { title: "Тримає пульс клієнтів", desc: "Помічає тих, хто мовчить 3+ тижні. Збирає контекст і пише реактивуючий лист у твоєму тоні на узгодження." },
        { title: "Пише ранковий бізнес-бриф", desc: "О 8:00 у Telegram: що вчора не зроблено, що горить сьогодні, хто чекає на відповідь, який виторг під ризиком." },
        { title: "Веде рутинні відповіді", desc: "Відповідає на типові питання клієнтів у Telegram/WhatsApp твоїм бізнес-голосом. Ескалює лише важливе." },
        { title: "Говорить на MCP нативно", desc: "Підключається до будь-якого MCP-сервера — CRM, Gmail, Notion, Linear, Slack, кастомних. Не одноразова інтеграція — живий протокол." },
        { title: "Шле звіт у п'ятницю", desc: "П'ятниця: виторг, нові та втрачені клієнти, вузькі місця + одна рекомендація на наступний тиждень." },
      ],
      useCases: ["Соло-підприємці", "Власники малого бізнесу (≤10 осіб)", "Інфобізнесмени (5k–50k аудиторія)", "Консультанти та коучі", "Агентства"],
      deliveryTime: { template: "Telegram + MCP налаштування за ~15 хв", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["Пульс клієнтів + ранковий бриф", "Рутинні відповіді у Telegram/WhatsApp", "Тижневий звіт", "Всі MCP-конектори"] },
        { name: "Pro", features: ["Все з Basic", "Opus-тариф (макс. якість)", "Безліміт повідомлень", "Кастомні MCP-сервери під твій стек", "Пріоритетна підтримка людиною", "Квартальна tune-up сесія з Denys Kot"] },
      ],
    },
  },
  "patrik": {
    RU: {
      tagline: "Врач, помнящий каждый твой анализ.",
      category: "Агенты",
      description: "Загружай анализы, рецепты, заключения врачей. Patrik помнит всё. Рекомендует по образу жизни, ловит паттерны, слушает в тяжёлые моменты.",
      longDescription: "Patrik — агент здоровья, построенный вокруг одной идеи: врач, понимающий твои анализы, и психолог, понимающий твою жизнь, не должны быть разными людьми. Кидаешь анализ крови, кардиологическое заключение, МРТ — Patrik разбирает, строит картину длиной в годы, и ты спрашиваешь на обычном языке. Когда бьёт жизнь — тот же агент слушает, отражает, применяет CBT. Не замена живых врачей и терапевтов — 24/7 второе мнение, которое знает твою полную историю. HIPAA-grade шифрование всего что загружаешь; удаление в 1 клик в любой момент.",
      features: [
        { title: "Держит всю историю здоровья", desc: "Каждый анализ, каждый рецепт, каждое заключение — помнится навсегда, ищется за 2 секунды." },
        { title: "Ловит медленный дрейф", desc: "«У тебя ферритин дрейфует вниз 18 месяцев». «Ты хуже спишь за неделю до дедлайна». Вещи, которые ни один узкий специалист не поймает." },
        { title: "Переводит с латыни", desc: "Заключение в медицинских терминах? Patrik переводит под твой уровень — и отвечает на follow-up." },
        { title: "Слушает когда нужно", desc: "Когда диагноз не нужен — нужен просто тот кто слушает. CBT/ACT-стиль, без предписаний." },
        { title: "Жёстко эскалирует красные флаги", desc: "Боль в груди + специфические слова? Patrik останавливается, даёт телефоны скорой, отказывается вести дальше соло." },
      ],
      useCases: ["Носители хронических болезней, уставшие пересказывать историю каждому новому врачу", "Тревожные биохакеры", "Люди без семейного врача, которому доверяют", "Все кто хочет лёгкую терапию 24/7 без $200/час"],
      deliveryTime: { template: "Хранилище активно за 5 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["Безлимит загрузок документов", "Долгосрочная память здоровья", "Детекция паттернов + еженедельный дайджест", "Режим эмоциональной поддержки", "Эскалация красных флагов"] },
        { name: "Pro", features: ["Всё из Basic", "До 4 членов семьи", "Общие или приватные хранилища на каждого", "Приоритетная поддержка человеком", "Опциональная синхронизация с Eva для пожилых родителей"] },
      ],
    },
    UA: {
      tagline: "Лікар, що пам'ятає кожен твій аналіз.",
      category: "Агенти",
      description: "Завантажуй аналізи, рецепти, висновки лікарів. Patrik пам'ятає все. Радить по способу життя, ловить патерни, слухає у важкі моменти.",
      longDescription: "Patrik — агент здоров'я, побудований навколо однієї ідеї: лікар, який розуміє твої аналізи, і психолог, який розуміє твоє життя, не мають бути різними людьми. Кидаєш аналіз крові, кардіологічний висновок, МРТ — Patrik розбирає, будує картину довжиною в роки, і ти питаєш звичайною мовою. Коли б'є життя — той самий агент слухає, відображає, застосовує CBT. Не заміна живих лікарів і терапевтів — 24/7 друга думка, яка знає твою повну історію. HIPAA-grade шифрування всього що завантажуєш; видалення в 1 клік у будь-який момент.",
      features: [
        { title: "Тримає всю історію здоров'я", desc: "Кожен аналіз, кожен рецепт, кожен висновок — пам'ятається назавжди, шукається за 2 секунди." },
        { title: "Ловить повільний дрейф", desc: "«У тебе феритин дрейфує вниз 18 місяців». «Ти гірше спиш за тиждень до дедлайну». Речі, які жоден вузький спеціаліст не зловить." },
        { title: "Перекладає з латини", desc: "Висновок у медичних термінах? Patrik перекладає на твій рівень — і відповідає на follow-up." },
        { title: "Слухає коли потрібно", desc: "Коли діагноз не потрібен — потрібен просто той хто слухає. CBT/ACT-стиль, без приписів." },
        { title: "Жорстко ескалує червоні прапори", desc: "Біль у грудях + специфічні слова? Patrik зупиняється, дає телефони швидкої, відмовляється вести далі соло." },
      ],
      useCases: ["Носії хронічних хвороб, втомлені переповідати історію кожному новому лікарю", "Тривожні біохакери", "Люди без сімейного лікаря, якому довіряють", "Усі хто хоче легку терапію 24/7 без $200/год"],
      deliveryTime: { template: "Сховище активне за 5 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["Безліміт завантажень документів", "Довгострокова пам'ять здоров'я", "Детекція патернів + щотижневий дайджест", "Режим емоційної підтримки", "Ескалація червоних прапорів"] },
        { name: "Pro", features: ["Все з Basic", "До 4 членів сім'ї", "Спільні або приватні сховища на кожного", "Пріоритетна підтримка людиною", "Опціональна синхронізація з Eva для літніх батьків"] },
      ],
    },
  },
  "taras": {
    RU: {
      tagline: "Крепкий защитник для детей 5–15.",
      category: "Агенты",
      description: "Твой ребёнок может спросить что угодно. Защитный стек Finekot следит чтобы Taras учил, но никогда не навредил. Ничего неуместного, ничего страшного, ничего о чём пожалеешь.",
      longDescription: "Taras — AI которого можно дать ребёнку без тревоги. Многослойный стек безопасности — контент-фильтры, родительские инструкции, курированная Finekot база знаний, возраст-адаптивный тон — делает так чтобы твой ребёнок получил только терпеливого репетитора и любопытного друга. Математика, чтение, языки, наука, аккуратные жизненные вопросы. Еженедельный дайджест родителю показывает что ребёнок узнал и где застрял. Построено и под контролем Finekot Systems — не «обычный чат-бот с фильтром сверху».",
      features: [
        { title: "Охраняет через стек Finekot", desc: "Четыре слоя: контент-фильтр, возрастной тон, курированная база знаний, родительские правила. Вредное не доходит до ребёнка. Никогда." },
        { title: "Подстраивается под возраст 5–15", desc: "Словарь, сложность, тон сдвигаются под возраст. 7-летний и 14-летний получают очень разных Taras-ов." },
        { title: "Учит, а не даёт ответ", desc: "Помощь с домашкой которая учит, а не даёт ответ. Сократический метод по умолчанию." },
        { title: "Держит языковую практику", desc: "Говорение и письмо на EN/UA/RU/DE. Ребёнок выбирает тему, Taras её держит." },
        { title: "Держит родителя в курсе", desc: "Еженедельный дайджест: темы, прогресс, сложные места, одна рекомендация. Без слежки за диалогами — только агрегаты." },
      ],
      useCases: ["Родители 30–50 с детьми 5–15", "Семьи на домашнем обучении", "Родители чьи дети уже сидят в ChatGPT без присмотра", "Бабушки и дедушки, дарящие безопасный AI вместо экранного времени"],
      deliveryTime: { template: "Активация за 10 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["1 профиль ребёнка", "Все возрасты 5–15", "Еженедельный дайджест родителю", "Стек безопасности Finekot", "EN / RU / UA / DE"] },
        { name: "Pro", features: ["Всё из Basic", "До 4 профилей детей", "Память, понимающая братьев и сестёр", "Приоритетная поддержка человеком"] },
      ],
    },
    UA: {
      tagline: "Міцний захисник для дітей 5–15.",
      category: "Агенти",
      description: "Твоя дитина може запитати будь-що. Захисний стек Finekot слідкує щоб Taras вчив, але ніколи не нашкодив. Нічого недоречного, нічого страшного, нічого про що пошкодуєш.",
      longDescription: "Taras — AI якого можна дати дитині без тривоги. Багатошаровий стек безпеки — контент-фільтри, батьківські інструкції, курирована Finekot база знань, вік-адаптивний тон — робить так щоб твоя дитина отримала лише терплячого репетитора і допитливого друга. Математика, читання, мови, наука, обережні життєві питання. Щотижневий дайджест батькові показує що дитина дізналася і де застрягла. Побудовано й під контролем Finekot Systems — не «звичайний чат-бот із фільтром зверху».",
      features: [
        { title: "Охороняє через стек Finekot", desc: "Чотири шари: контент-фільтр, віковий тон, курирована база знань, батьківські правила. Шкідливе не доходить до дитини. Ніколи." },
        { title: "Підлаштовується під вік 5–15", desc: "Словник, складність, тон зсуваються під вік. 7-річний і 14-річний отримують дуже різних Taras-ів." },
        { title: "Вчить, а не дає відповідь", desc: "Допомога з домашкою що вчить, а не дає відповідь. Сократівський метод за замовчуванням." },
        { title: "Тримає мовну практику", desc: "Говоріння і письмо EN/UA/RU/DE. Дитина обирає тему, Taras її тримає." },
        { title: "Тримає батька в курсі", desc: "Щотижневий дайджест: теми, прогрес, складні місця, одна рекомендація. Без стеження за діалогами — лише агрегати." },
      ],
      useCases: ["Батьки 30–50 з дітьми 5–15", "Родини на домашньому навчанні", "Батьки чиї діти вже сидять у ChatGPT без нагляду", "Бабусі та дідусі, що дарують безпечний AI замість екранного часу"],
      deliveryTime: { template: "Активація за 10 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["1 профіль дитини", "Всі вікові групи 5–15", "Щотижневий дайджест батьку", "Стек безпеки Finekot", "EN / RU / UA / DE"] },
        { name: "Pro", features: ["Все з Basic", "До 4 профілів дітей", "Пам'ять, що розуміє братів і сестер", "Пріоритетна підтримка людиною"] },
      ],
    },
  },
  "ada": {
    RU: {
      tagline: "Исследовательский агент. Perplexity-killer.",
      category: "Агенты",
      description: "Быстрый ответ с источниками за 30 секунд. Или Deep Research — структурированный отчёт на 2500 слов за 8 минут. Построена на собственном Ada-стеке Finekot.",
      longDescription: "Ada — исследовательский агент коллектива Finekot. Работает в двух режимах. FAST: один вопрос, ~30–60 секунд, ответ с 5+ источниками. DEEP: многопроходное расследование по 20+ источникам, возвращает структурированный отчёт за 5–10 минут с противоречиями, уровнями достоверности и трассируемыми фактами. Построена как замена Perplexity для тех кто делает реальную работу — консультантов, аналитиков, основателей, журналистов. Помнит твои ресёрч-треды между сессиями.",
      features: [
        { title: "Отвечает быстро за 30–60 сек", desc: "Прямой ответ на вопрос с 5+ цитированными источниками. Как Perplexity, но с памятью." },
        { title: "Запускает Deep Research за 3–10 мин", desc: "Многошаговое расследование по Exa + Tavily + прямой краулинг. Возвращает отчёт со структурой, секциями, уровнями уверенности и открытыми вопросами." },
        { title: "Верифицирует по источникам", desc: "Помечает противоречия. Пишет «высокий / средний / под вопросом» на каждое утверждение." },
        { title: "Помнит твои треды", desc: "Помнит что ты уже исследовал. «Неделю назад ты смотрел Delphi — вот что изменилось»." },
        { title: "Экспортирует куда угодно", desc: "Один клик в Markdown, Notion, Google Docs. Или отчёт сразу в Telegram/email." },
      ],
      useCases: ["Консультанты, готовящие клиентские презентации", "Журналисты на дедлайне", "Продактовые менеджеры, сканирующие конкурентов", "Исследователи с literature review", "Основатели на валидации рынка"],
      deliveryTime: { template: "Активация за 2 минуты", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["Безлимит Fast-запросов", "20 Deep Research отчётов / мес", "Память тредов", "Экспорт Markdown / Notion / Docs"] },
        { name: "Pro", features: ["Всё из Basic", "Безлимит Deep Research", "Opus-тариф (макс. качество)", "API-доступ для Zapier / n8n / скриптов", "Кастомные доменные источники"] },
      ],
    },
    UA: {
      tagline: "Дослідницький агент. Perplexity-killer.",
      category: "Агенти",
      description: "Швидка відповідь з джерелами за 30 секунд. Або Deep Research — структурований звіт на 2500 слів за 8 хвилин. Побудована на власному Ada-стеку Finekot.",
      longDescription: "Ada — дослідницький агент колективу Finekot. Працює у двох режимах. FAST: одне питання, ~30–60 секунд, відповідь з 5+ джерелами. DEEP: багатопрохідне розслідування по 20+ джерелах, повертає структурований звіт за 5–10 хвилин із протиріччями, рівнями достовірності та трасованими фактами. Побудована як заміна Perplexity для тих хто робить реальну роботу — консультантів, аналітиків, засновників, журналістів. Пам'ятає твої ресерч-треди між сесіями.",
      features: [
        { title: "Відповідає швидко за 30–60 сек", desc: "Пряма відповідь на питання з 5+ цитованими джерелами. Як Perplexity, але з пам'яттю." },
        { title: "Запускає Deep Research за 3–10 хв", desc: "Багатокроковий ресерч по Exa + Tavily + прямий краулінг. Повертає звіт зі структурою, секціями, рівнями впевненості та відкритими питаннями." },
        { title: "Верифікує по джерелах", desc: "Помічає протиріччя. Пише «високий / середній / під питанням» на кожне твердження." },
        { title: "Пам'ятає твої треди", desc: "Пам'ятає що ти вже досліджував. «Тиждень тому ти дивився Delphi — ось що змінилося»." },
        { title: "Експортує куди завгодно", desc: "Один клік у Markdown, Notion, Google Docs. Або звіт одразу в Telegram/email." },
      ],
      useCases: ["Консультанти, що готують клієнтські презентації", "Журналісти на дедлайні", "Продуктові менеджери, що сканують конкурентів", "Дослідники з literature review", "Засновники на валідації ринку"],
      deliveryTime: { template: "Активація за 2 хвилини", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["Безліміт Fast-запитів", "20 Deep Research звітів / міс", "Пам'ять тредів", "Експорт Markdown / Notion / Docs"] },
        { name: "Pro", features: ["Все з Basic", "Безліміт Deep Research", "Opus-тариф (макс. якість)", "API-доступ для Zapier / n8n / скриптів", "Кастомні доменні джерела"] },
      ],
    },
  },
  "hanna": {
    RU: {
      tagline: "Учит твой голос. Пишет в нём.",
      category: "Агенты",
      description: "Загрузи 30 своих постов. Она ловит твой тон. Дальше пишет в твоём голосе: Telegram, Instagram, LinkedIn, email. Ты редактируешь, публикуешь.",
      longDescription: "Hanna — креативный агент, который делает твоё писательство не звучащим как AI. Разбирает 30 примеров твоих текстов, собирает voice-профиль (тон, ритм, лексика, панчлайны, навязчивости), и дальше генерит посты, письма, сценарии и кампании которые читаются как твои лучшие тексты. Не кнопка «сгенери мне пост» — соавтор который знает твоё позиционирование, твою аудиторию и что ты уже написал, чтобы не повторять тебя.",
      features: [
        { title: "Строит voice-профиль за 30 примеров", desc: "Вставляешь 30 своих постов — Hanna строит voice-профиль, который ты можешь просмотреть, отредактировать, версионировать." },
        { title: "Адаптирует под каждую платформу", desc: "Одна идея → пост в Telegram + подпись в Instagram + op-ed в LinkedIn + тизер в email. Каждый в правильной длине и тоне." },
        { title: "Ведёт контент-календарь", desc: "Месячный календарь с темами, форматами, варианты hook-ов. Ты согласовываешь — Hanna пишет." },
        { title: "Отказывается повторяться", desc: "Помнит каждый твой опубликованный пост, чтобы новое не пережёвывало старое." },
        { title: "Разбирает что сработало", desc: "После публикации Hanna тянет метрики и говорит что сработало в твоём голосе — а что ушло в сторону." },
      ],
      useCases: ["Создатели с аудиторией 5k–500k", "Founders, строящие личный бренд", "Агентства ведущие thought-leader аккаунты", "Ghostwriters хотящие в 3 раза ускориться", "Инфобиз запускающий курсы"],
      deliveryTime: { template: "Голос обучен за 10 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["Voice-профиль из 30+ примеров", "Безлимит черновиков", "Мультиплатформенная адаптация", "Анти-повтор память"] },
        { name: "Pro", features: ["Всё из Basic", "До 3 голосов (команда / агентство)", "Календарь + workflow согласования", "Разбор engagement", "Приоритетная поддержка"] },
      ],
    },
    UA: {
      tagline: "Вчить твій голос. Пише в ньому.",
      category: "Агенти",
      description: "Завантаж 30 своїх постів. Вона ловить твій тон. Далі пише у твоєму голосі: Telegram, Instagram, LinkedIn, email. Ти редагуєш, публікуєш.",
      longDescription: "Hanna — креативний агент, який робить твоє письменництво таким, що не звучить як AI. Розбирає 30 прикладів твоїх текстів, збирає voice-профіль (тон, ритм, лексика, панчлайни, нав'язливості), і далі генерує пости, листи, сценарії та кампанії які читаються як твої найкращі тексти. Не кнопка «згенеруй мені пост» — співавтор який знає твоє позиціонування, твою аудиторію і що ти вже написав, щоб не повторювати тебе.",
      features: [
        { title: "Будує voice-профіль за 30 прикладів", desc: "Вставляєш 30 своїх постів — Hanna будує voice-профіль, який ти можеш переглянути, відредагувати, версіонувати." },
        { title: "Адаптує під кожну платформу", desc: "Одна ідея → пост у Telegram + підпис в Instagram + op-ed у LinkedIn + тизер в email. Кожен у правильній довжині та тоні." },
        { title: "Веде контент-календар", desc: "Місячний календар з темами, форматами, варіанти hook-ів. Ти погоджуєш — Hanna пише." },
        { title: "Відмовляється повторюватися", desc: "Пам'ятає кожен твій опублікований пост, щоб нове не пережовувало старе." },
        { title: "Розбирає що спрацювало", desc: "Після публікації Hanna тягне метрики і каже що спрацювало у твоєму голосі — а що пішло в сторону." },
      ],
      useCases: ["Творці з аудиторією 5k–500k", "Founders, що будують особистий бренд", "Агентства що ведуть thought-leader акаунти", "Ghostwriters бажаючі втричі прискоритися", "Інфобіз що запускає курси"],
      deliveryTime: { template: "Голос навчено за 10 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["Voice-профіль з 30+ прикладів", "Безліміт чернеток", "Мультиплатформна адаптація", "Анти-повтор пам'ять"] },
        { name: "Pro", features: ["Все з Basic", "До 3 голосів (команда / агенція)", "Календар + workflow погодження", "Розбір engagement", "Пріоритетна підтримка"] },
      ],
    },
  },
  "boris": {
    RU: {
      tagline: "Твоя правая рука в Telegram.",
      category: "Агенты",
      description: "Личный AI chief of staff. Живёт в твоём Telegram. Ведёт календарь, инбокс, задачи и подготовку ко встречам — голосом или текстом.",
      longDescription: "Boris — твоя правая рука. AI-агент, который сидит в твоём Telegram и впитывает хаос дня. Утренний бриф, сортировка почты, подготовка и разбор встреч, голос-в-задачу на ходу. Заточен под одного человека — тебя. Помнит твоих людей, проекты, обещания. Чем дольше работает с тобой — тем точнее.",
      features: [
        { title: "Ведёт утренний бриф", desc: "В 8:00 в Telegram: приоритеты дня, pre-read к каждой встрече, follow-up за тобой, флаги на провисающем." },
        { title: "Сортирует инбокс", desc: "Разбирает входящие: сейчас / сегодня / на неделю / игнор. Черновики ответов в твоём голосе — ты только жмёшь send." },
        { title: "Готовит и разбирает встречи", desc: "Перед звонком: кто, что говорили в прошлый раз, что ты обещал. После: action items сразу в твою task-систему." },
        { title: "Превращает голос в задачи", desc: "Сбросил голосовое с 3-мя пунктами. Boris разбил их на задачи в Todoist/Notion с дедлайнами и контекстом." },
        { title: "Помнит твой мир", desc: "Держит твоих людей, проекты и обещания в персистентной памяти. Чем больше пользуешься — тем больше он становится правой рукой." },
      ],
      useCases: ["Профессионалы с 20+ встреч в неделю", "Founders, жонглирующие инбоксом и календарём", "Консультанты на 10+ клиентов", "Все кто когда-либо говорил «мне нужен ассистент»"],
      deliveryTime: { template: "Активация за 10 минут", integration: "Подписка — без setup-платы" },
      tiers: [
        { name: "Basic", features: ["Утренний бриф + триаж почты", "Подготовка и расшифровка встреч", "Голос → задачи", "Персональная память"] },
        { name: "Pro", features: ["Всё из Basic", "Opus-тариф (макс. качество)", "Безлимит сообщений", "Приоритетная скорость", "API + Zapier доступ", "Кастомные интеграции"] },
      ],
    },
    UA: {
      tagline: "Твоя права рука в Telegram.",
      category: "Агенти",
      description: "Особистий AI chief of staff. Живе у твоєму Telegram. Веде календар, інбокс, задачі та підготовку до зустрічей — голосом або текстом.",
      longDescription: "Boris — твоя права рука. AI-агент, який сидить у твоєму Telegram і вбирає хаос дня. Ранковий бриф, сортування пошти, підготовка та розбір зустрічей, голос-в-задачу на ходу. Заточений під одну людину — тебе. Пам'ятає твоїх людей, проєкти, обіцянки. Чим довше працює з тобою — тим точніше.",
      features: [
        { title: "Веде ранковий бриф", desc: "О 8:00 у Telegram: пріоритети дня, pre-read до кожної зустрічі, follow-up за тобою, прапори на провисаючому." },
        { title: "Сортує інбокс", desc: "Розбирає вхідні: зараз / сьогодні / на тиждень / ігнор. Чернетки відповідей у твоєму голосі — ти лише тиснеш send." },
        { title: "Готує та розбирає зустрічі", desc: "Перед дзвінком: хто, що говорили минулого разу, що ти обіцяв. Після: action items одразу в твою task-систему." },
        { title: "Перетворює голос на задачі", desc: "Скинув голосове з 3-ма пунктами. Boris розбив їх на задачі у Todoist/Notion з дедлайнами та контекстом." },
        { title: "Пам'ятає твій світ", desc: "Тримає твоїх людей, проєкти і обіцянки у персистентній пам'яті. Чим більше користуєшся — тим більше він стає правою рукою." },
      ],
      useCases: ["Професіонали з 20+ зустрічей на тиждень", "Founders, що жонглюють інбоксом і календарем", "Консультанти на 10+ клієнтів", "Усі хто колись казав «мені потрібен асистент»"],
      deliveryTime: { template: "Активація за 10 хвилин", integration: "Підписка — без setup-оплати" },
      tiers: [
        { name: "Basic", features: ["Ранковий бриф + тріаж пошти", "Підготовка і розшифровка зустрічей", "Голос → задачі", "Персональна пам'ять"] },
        { name: "Pro", features: ["Все з Basic", "Opus-тариф (макс. якість)", "Безліміт повідомлень", "Пріоритетна швидкість", "API + Zapier доступ", "Кастомні інтеграції"] },
      ],
    },
  },
  "orban": {
    RU: {
      tagline: "AI-ассистент задач",
      category: "Боты",
      description: "Telegram-бот, превращающий сырые идеи (текст/голос) в структурированные задачи с AI-маршрутизацией.",
      longDescription: "Orban превращает сырые идеи — голосовые сообщения, тексты — в структурированные, приоритизированные задачи. Разбирает смысл, оценивает приоритет и направляет каждую задачу нужному агенту коллектива Finekot.",
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
      longDescription: "Orban перетворює сирі ідеї — голосові повідомлення, тексти — на структуровані, пріоритизовані задачі. Розбирає зміст, оцінює пріоритет і спрямовує кожну задачу потрібному агенту колективу Finekot.",
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
