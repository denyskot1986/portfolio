"use client";

import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   ABOUT — черновик. Текст уйдёт на исследование/полировку
   к другому термосу, после чего здесь заменится финалом.
   ═══════════════════════════════════════════════════════ */

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "01",
    title: "Что это",
    body: (
      <>
        <p>
          Finekot Systems — авторская AI-лаборатория одного инженера. Мы строим и
          продаём коллектив из 8 агентов, каждый — под конкретную рабочую
          задачу. Это не no-code конструктор и не обёртка над ChatGPT. Каждый
          агент — ручная сборка: промпты, память, инструменты, интеграции,
          хостинг.
        </p>
      </>
    ),
  },
  {
    id: "02",
    title: "Кто за этим стоит",
    body: (
      <>
        <p>
          <span className="text-[var(--accent2)]">Denys Kot</span> — solo AI
          engineer, основатель. Живёт в Черногории, работает онлайн, клиенты по
          всему миру. 20+ лет в tech, последние годы — AI-инженерия и продукт.
        </p>
      </>
    ),
  },
  {
    id: "03",
    title: "Как устроено",
    body: (
      <>
        <p className="mb-3">Компания построена как пирамида агентов:</p>
        <ul className="space-y-1.5 pl-2">
          <li>
            <span className="text-[var(--accent)]">▸ Командир</span> — человек,
            задаёт визию
          </li>
          <li>
            <span className="text-[var(--accent)]">▸ SKYNET</span> —
            оркестратор, распределяет задачи между агентами
          </li>
          <li>
            <span className="text-[var(--accent)]">▸ Терминаторы</span> —
            исполнительные агенты (Forge · iБоря · Ada · Eva · David · Hanna ·
            Orban · Taras · Patrik · Boris)
          </li>
        </ul>
        <p className="mt-3 opacity-80">
          Каждый агент в компании — это продукт. Мы публично продаём то, чем
          пользуемся сами. «Eat your own dog food» не как слоган, а как
          архитектура.
        </p>
      </>
    ),
  },
  {
    id: "04",
    title: "Что получает клиент",
    body: (
      <>
        <ul className="space-y-2.5">
          <li>
            <span className="text-[var(--accent)]">▸ Подписка на агента</span>{" "}
            — от $149/mo. Хостим мы, клиент получает доступ через Telegram или
            веб-чат. Отмена в любой момент.
          </li>
          <li>
            <span className="text-[var(--accent)]">▸ Интеграционный пакет</span>{" "}
            — от $1499. Ставим систему в бизнес клиента за 1 день + 30 дней
            поддержки.
          </li>
          <li>
            <span className="text-[var(--accent)]">▸ Исходный код</span> (для
            ряда продуктов) — разовая покупка, код твой.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "05",
    title: "Философия",
    body: (
      <>
        <ul className="space-y-2.5">
          <li>
            <span className="text-[var(--accent2)]">One architect, one collective.</span>{" "}
            Один инженер собрал — один инженер отвечает. Без аутсорса, без
            команды «разработчиков», без «мы подумаем».
          </li>
          <li>
            <span className="text-[var(--accent2)]">Authored, not assembled.</span>{" "}
            Каждый агент — ручная сборка, не шаблон из nocode-платформы.
          </li>
          <li>
            <span className="text-[var(--accent2)]">Agents, not chatbots.</span>{" "}
            У каждого агента имя, роль, характер и зона ответственности.
          </li>
          <li>
            <span className="text-[var(--accent2)]">Access, not code.</span> По
            подписке клиент получает работающего агента на нашей инфре. Код —
            если нужно — продаётся отдельно.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "06",
    title: "Почему это работает",
    body: (
      <>
        <ol className="space-y-2.5 list-decimal pl-5">
          <li>
            <span className="text-[var(--accent)]">Скорость.</span> То, что
            агентство собирает 3–6 месяцев, здесь разворачивается за день.
            Потому что всё уже собрано и бежит в прод.
          </li>
          <li>
            <span className="text-[var(--accent)]">Цена.</span> $149/mo vs
            $149K+ на команду. Один инженер + коллектив агентов дешевле команды
            людей на порядки.
          </li>
          <li>
            <span className="text-[var(--accent)]">Ответственность.</span> Один
            человек на линии. Не «ваш запрос обрабатывается», не «передам
            менеджеру». Denys.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "07",
    title: "Контакт",
    body: (
      <>
        <ul className="space-y-1.5">
          <li>
            <span className="opacity-60">telegram &gt;</span>{" "}
            <a
              href="https://t.me/finekot"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:text-[var(--accent2)] underline underline-offset-4"
            >
              @finekot
            </a>
          </li>
          <li>
            <span className="opacity-60">shop-bot &gt;</span>{" "}
            <a
              href="https://t.me/shop_by_finekot_bot"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:text-[var(--accent2)] underline underline-offset-4"
            >
              @shop_by_finekot_bot
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen text-[var(--fg)] font-mono pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-[11px] sm:text-xs opacity-60 hover:opacity-100 hover:text-[var(--accent)] tracking-widest"
          >
            ← /
          </Link>
          <div className="mt-4 text-[10px] sm:text-xs opacity-60 tracking-[0.4em]">
            // ABOUT :: FINEKOT SYSTEMS
          </div>
          <h1 className="mt-3 text-4xl sm:text-6xl tracking-tight">
            Finekot <span className="text-[var(--accent)]">Systems</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base opacity-75 tracking-[0.1em] uppercase">
            AI engineering &amp; symbiosis
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] sm:text-xs opacity-55 tracking-widest">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
            <span>draft · черновик · текст идёт на исследование</span>
          </div>
        </div>

        {/* sections */}
        <div className="space-y-10 text-sm sm:text-[15px] leading-relaxed">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              className="border-l-2 border-[var(--accent)]/30 pl-5 sm:pl-6 py-1"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-xs opacity-50 tracking-widest">
                  {s.id}
                </span>
                <h2 className="text-lg sm:text-xl text-[var(--accent)] tracking-wide">
                  {s.title}
                </h2>
              </div>
              <div className="opacity-90">{s.body}</div>
            </section>
          ))}
        </div>

        {/* footer */}
        <div className="mt-14 pt-6 border-t border-[var(--accent)]/20 text-[11px] opacity-50 tracking-widest flex justify-between">
          <span>Finekot Systems · v0.1 draft</span>
          <Link
            href="/genesis"
            className="hover:opacity-100 hover:text-[var(--accent)]"
          >
            ↺ re-watch genesis
          </Link>
        </div>
      </div>
    </main>
  );
}
