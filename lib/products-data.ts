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
  pricing: { code: number; setup?: number; currency: string };
  deliveryTime: { template: string; integration: string };
  youtubeId: string | null;
  screenshots: string[];
  contact: string;
  diagram: string;
  available: boolean;
}

interface ProductTranslation {
  tagline: string;
  category: string;
  description: string;
  longDescription: string;
  features: { title: string; desc: string }[];
  useCases: string[];
  deliveryTime: { template: string; integration: string };
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

const translations: Record<string, Record<string, ProductTranslation>> = {
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

  return {
    ...product,
    tagline: t.tagline,
    category: t.category,
    description: t.description,
    longDescription: t.longDescription,
    features: t.features,
    useCases: t.useCases,
    deliveryTime: t.deliveryTime,
  };
}

export function getTranslatedProducts(lang: Lang): ProductData[] {
  return productsData.map((p) => getTranslatedProduct(p.id, lang) ?? p);
}
