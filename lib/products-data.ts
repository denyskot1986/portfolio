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
  pricing: { code: number; setup?: number; currency: string };
  deliveryTime: { template: string; integration: string };
  youtubeId: string | null;
  screenshots: string[];
  contact: string;
  diagram: string;
  available: boolean;
}

export const productsData: ProductData[] = [
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

export function getProductById(id: string): ProductData | undefined {
  return productsData.find((p) => p.id === id);
}
