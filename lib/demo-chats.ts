import type { Lang } from "./i18n";

interface DemoMessage {
  from: "bot" | "user";
  text: string;
}

interface DemoConfig {
  messages: DemoMessage[];
  tryLink: string;
  tryLabel: string;
}

const demoChatEN: Record<string, DemoConfig> = {
  "skynet-intake": {
    messages: [
      { from: "bot", text: "Send me a task — text, voice, or photo.\nI'll structure it and route to the right agent." },
      { from: "user", text: "Build a landing page for the new product launch, high priority" },
      { from: "bot", text: "Task structured:\n\n📋 Build landing page for product launch\n⚡ Priority: High\n🤖 Assigned to: T-1 (Fullstack)\n📁 Project: Marketing\n📅 Due: Tomorrow\n\nCreated in Todoist. T-1 will start shortly." },
      { from: "user", text: "Also research competitor pricing for AI tools" },
      { from: "bot", text: "Task structured:\n\n📋 Research competitor pricing — AI tools market\n⚡ Priority: Medium\n🤖 Assigned to: T-4 (Research)\n📁 Project: Strategy\n\nRouted to T-4. You'll get a report in the Dashboard." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_skynet-intake",
    tryLabel: "Get SKYNET Intake",
  },
};

const demoChatRU: Record<string, DemoConfig> = {
  "skynet-intake": {
    messages: [
      { from: "bot", text: "Отправьте мне задачу — текст, голос или фото.\nЯ структурирую и направлю нужному агенту." },
      { from: "user", text: "Сделать лендинг для запуска нового продукта, высокий приоритет" },
      { from: "bot", text: "Задача структурирована:\n\n📋 Создать лендинг для запуска продукта\n⚡ Приоритет: Высокий\n🤖 Назначено: T-1 (Fullstack)\n📁 Проект: Маркетинг\n📅 Дедлайн: Завтра\n\nСоздано в Todoist. T-1 скоро приступит." },
      { from: "user", text: "Ещё исследуй цены конкурентов на AI-инструменты" },
      { from: "bot", text: "Задача структурирована:\n\n📋 Исследование цен конкурентов — рынок AI\n⚡ Приоритет: Средний\n🤖 Назначено: T-4 (Research)\n📁 Проект: Стратегия\n\nНаправлено T-4. Отчёт появится в Dashboard." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_skynet-intake",
    tryLabel: "Получить SKYNET Intake",
  },
};

const demoChatUA: Record<string, DemoConfig> = {
  "skynet-intake": {
    messages: [
      { from: "bot", text: "Надішліть мені задачу — текст, голос або фото.\nЯ структурую та спрямую потрібному агенту." },
      { from: "user", text: "Зробити лендинг для запуску нового продукту, високий пріоритет" },
      { from: "bot", text: "Задачу структуровано:\n\n📋 Створити лендинг для запуску продукту\n⚡ Пріоритет: Високий\n🤖 Призначено: T-1 (Fullstack)\n📁 Проєкт: Маркетинг\n📅 Дедлайн: Завтра\n\nСтворено в Todoist. T-1 скоро почне." },
      { from: "user", text: "Ще дослідити ціни конкурентів на AI-інструменти" },
      { from: "bot", text: "Задачу структуровано:\n\n📋 Дослідження цін конкурентів — ринок AI\n⚡ Пріоритет: Середній\n🤖 Призначено: T-4 (Research)\n📁 Проєкт: Стратегія\n\nСпрямовано T-4. Звіт з'явиться в Dashboard." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_skynet-intake",
    tryLabel: "Отримати SKYNET Intake",
  },
};

const allDemoChats: Record<Lang, Record<string, DemoConfig>> = {
  EN: demoChatEN,
  RU: demoChatRU,
  UA: demoChatUA,
};

export function getDemoChat(productId: string, lang: Lang): DemoConfig | undefined {
  return allDemoChats[lang]?.[productId];
}

// backwards compat — used in ProductPageClient
export const demoChatData = demoChatEN;
