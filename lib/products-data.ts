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
}

export const productsData: ProductData[] = [
  {
    id: "iborya",
    name: "iБоря",
    tagline: "AI operations chief for small business",
    category: "Agents",
    description: "A subscription AI-agent that holds your clients, tasks and finances together 24/7. Works across your CRM, calendar and messengers.",
    longDescription: "iБоря is an authored AI agent built by Finekot — the first in a new subscription line. He doesn't forget clients, doesn't lose tasks, writes the morning briefing at 8:00, and answers routine client questions in your Telegram/WhatsApp while you run the business. Plugs into your CRM, calendar, Notion and messengers. 7-day free trial, cancel any time.",
    features: [
      { title: "Client pulse", desc: "Spots clients who ghosted for 3+ weeks, drafts a re-engagement message in your tone for one-click send." },
      { title: "Morning brief", desc: "At 8:00 you get a Telegram summary: yesterday's unfinished, today's fires, who is waiting for an answer." },
      { title: "Voice → tasks", desc: "Drop a voice note with 3 things. iБоря splits them into Todoist/Notion tasks with deadlines and context." },
      { title: "Routine replies", desc: "Handles repetitive client questions in Telegram/WhatsApp in your voice. Escalates only when it matters." },
      { title: "Weekly report", desc: "Friday digest: revenue, new & lost clients, bottlenecks, and one recommendation for next week." },
    ],
    useCases: ["Solo founders", "Small business owners (≤10 people)", "Infobiz creators (5k–50k audience)", "Consultants & coaches", "Agency leads"],
    techStack: ["Claude Sonnet 4.6", "Telegram / WhatsApp Business", "Todoist / Notion / Google Calendar", "CRM connectors", "Per-user memory"],
    pricing: {
      code: 49,
      currency: "USD",
      subscription: {
        monthly: 49,
        yearly: 470,
        currency: "USD",
        trialDays: 7,
        tiers: [
          { name: "Trial", price: 0, features: ["7 days free", "50 messages", "Full agent access"] },
          { name: "Standard", price: 49, features: ["~500 messages / month", "Telegram + WhatsApp + CRM sync", "Morning brief + weekly report", "Per-user memory"] },
          { name: "Pro", price: 99, features: ["Unlimited messages", "Priority speed (Opus tier)", "API + Zapier", "Custom integrations"] },
        ],
      },
    },
    deliveryTime: { template: "Activate in 5 minutes", integration: "Subscription — no setup fee" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    avatarEmoji: "🛠️",
    diagram: `     +---------------------------+
     |   INPUT CHANNELS          |
     | Telegram . WhatsApp . CRM |
     +-------------+-------------+
                   |
     +-------------+-------------+
     |   iБоря — OPS ENGINE      |
     |  +---------------------+  |
     |  | Claude Sonnet 4.6   |  |
     |  | Per-user memory     |  |
     |  | Tool routing        |  |
     |  | Priority scoring    |  |
     |  +---------------------+  |
     +---+---------+---------+---+
         |         |         |
     +---+--+  +---+--+  +---+--+
     | CRM  |  |TASKS |  |BRIEFS|
     | sync |  |queue |  |daily |
     +------+  +------+  +------+
                   |
     +-------------+-------------+
     |    COMMANDER (you)        |
     |   approve . redirect      |
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
