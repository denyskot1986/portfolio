"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CRTBackground } from "../genesis/_shared/CRTBackground";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";
import { play as playSfx } from "@/lib/sfx";
import { AuthButton, AuthLockedDialog } from "@/components/AuthLockedDialog";

/* ═══════════════════════════════════════════════════════════════
   HABITAT — агенты юзера, живущие в параллельных окнах.
   8 чатов, каждый автоматически «работает» над задачами владельца
   в собственном голосе. Dock снизу, клик по аватарке выводит
   окно на передний план и накрывает соседей наполовину.
   ═══════════════════════════════════════════════════════════════ */

type AgentId =
  | "felix"
  | "ira"
  | "nova"
  | "eva"
  | "kira"
  | "orion"
  | "theo"
  | "sasha";

type Beat = {
  from: "agent" | "user" | "system";
  text: string;
  /** ms of "typing…" indicator before this beat lands. Only on `agent` beats. */
  typing?: number;
};

type Agent = {
  id: AgentId;
  name: string;
  initial: string;
  home: string;
  role: Record<Lang, string>;
  script: Beat[];
};

/* Palette — pinned to the site's CRT accents.
   Per-agent tinting is gone; the only color switch is GREEN for the
   ambient idle windows and AMBER for whichever one is focused. */
const ACCENT = "#00ff41";
const ACCENT_AMBER = "#ffb000";

/* ──────────────── AGENT ROSTER + SCRIPTED WORK ──────────────── */

const AGENTS: Agent[] = [
  {
    id: "felix",
    name: "Felix",
    initial: "F",
    home: "telegram · диспетчер",
    role: {
      EN: "Task router",
      RU: "Диспетчер задач",
      UA: "Диспетчер задач",
    },
    script: [
      { from: "user", text: "сделай лендинг под запуск" },
      {
        from: "agent",
        typing: 900,
        text: "📋 Задача оформлена.\n⚡ Приоритет: высокий\n🤖 Роут → T-1 (fullstack)\n📅 Дедлайн: завтра",
      },
      { from: "user", text: "и глянь цены конкурентов по AI-тулам" },
      {
        from: "agent",
        typing: 700,
        text: "📋 Роут → Orion (ресёрч)\nПервый черновик через ~45м.",
      },
      { from: "system", text: "очередь: 7 активных · 2 на ревью" },
      { from: "user", text: "набросай Q3 OKR" },
      {
        from: "agent",
        typing: 800,
        text: "📋 Роут → Nova\nБазовый шаблон подтянул из Notion.",
      },
      { from: "system", text: "heartbeat · ok · uptime 99.97%" },
    ],
  },
  {
    id: "ira",
    name: "Ira",
    initial: "I",
    home: "telegram · личка",
    role: {
      EN: "Personal assistant",
      RU: "Личный ассистент",
      UA: "Особистий асистент",
    },
    script: [
      {
        from: "agent",
        typing: 700,
        text: "🌞 Утренний бриф. Разбираю инбокс и календарь…",
      },
      {
        from: "agent",
        typing: 1400,
        text: "Инбокс 47 → 5 требуют тебя. Остальным ответы набросала.",
      },
      {
        from: "agent",
        typing: 1000,
        text: "🔴 Sarah (TechFlow) — 2 дня тишина по $18k-предложению. Приоритет сегодня.",
      },
      { from: "user", text: "набросай ответ Саре" },
      {
        from: "agent",
        typing: 1600,
        text: "«Sarah — скоп зафиксировали, предложение пришлю до 18:00 CET. Один вопрос: Q2-запуск всё ещё в силе?»\n→ отправить / править / переделать",
      },
      {
        from: "agent",
        typing: 900,
        text: "10:30 созвон с Legion — пре-рид собрала. Онбординг v2 они в прошлом месяце зарубили, не питчи повторно.",
      },
      { from: "user", text: "напомни позвонить отцу в 19:00" },
      { from: "agent", typing: 600, text: "✓ поставила · календарь + пинг в 18:55." },
    ],
  },
  {
    id: "nova",
    name: "Nova",
    initial: "N",
    home: "telegram · клиенты",
    role: {
      EN: "Client pulse",
      RU: "Пульс клиентов",
      UA: "Пульс клієнтів",
    },
    script: [
      {
        from: "agent",
        typing: 1100,
        text: "⚠️ Клиентский пульс — 2 аккаунта замолчали за неделю",
      },
      {
        from: "agent",
        typing: 900,
        text: "🔴 Martin (Agency42) — 23 дня тишина, висит $8,400 по счёту",
      },
      {
        from: "agent",
        typing: 700,
        text: "🟡 Laura (BrightPath) — 18 дней тишина, продление через 9 дней",
      },
      { from: "user", text: "черновик для Мартина" },
      {
        from: "agent",
        typing: 1500,
        text: "«Martin — у меня готов план роста на Q2, созвонимся когда будешь в тонусе. По счёту пока не дёргаю. Просто хочу убедиться, что ты не тонешь, а я не мельтешу 😄»\nТон сняла с твоих последних 6 сообщений.",
      },
      { from: "user", text: "а Laura?" },
      {
        from: "agent",
        typing: 1200,
        text: "💡 Ход: напомнить что кастомные отчёты уже собрали + предложить квартальный ревью на 2 созвона. Набросать?",
      },
    ],
  },
  {
    id: "eva",
    name: "Eva",
    initial: "E",
    home: "голос · забота",
    role: {
      EN: "Voice for elder care",
      RU: "Голос для пожилых",
      UA: "Голос для літніх",
    },
    script: [
      { from: "system", text: "📞 10:00 · звоню маме · плановая проверка" },
      {
        from: "agent",
        typing: 2100,
        text: "📲 на связи · 8 минут разговор закончен",
      },
      { from: "agent", typing: 900, text: "✅ утренняя таблетка принята (08:45)" },
      {
        from: "agent",
        typing: 900,
        text: "⚠️ упомянула лёгкое головокружение — «раньше было, прошло». Флагую.",
      },
      { from: "user", text: "пинг меня если вечером повторится" },
      {
        from: "agent",
        typing: 700,
        text: "✓ 19:00 созвон — слушаю триггеры по головокружению. Моментальный алерт, если услышу.",
      },
      { from: "agent", text: "настрой: тёплый, разговорчивый · ↑ vs вчера" },
    ],
  },
  {
    id: "kira",
    name: "Kira",
    initial: "K",
    home: "ребёнок · Соня, 9",
    role: {
      EN: "Kid tutor",
      RU: "Детский тьютор",
      UA: "Дитячий тьютор",
    },
    script: [
      { from: "user", text: "а почему небо на закате краснеет?" },
      {
        from: "agent",
        typing: 1300,
        text: "Хороший вопрос, Соня 🌅 Солнечный свет — это радуга, собранная в один луч.",
      },
      {
        from: "agent",
        typing: 1100,
        text: "Днём синий рассеивается сильнее всего → небо голубое. На закате синий «расходуется по пути», до глаз доходит только красный и оранжевый.",
      },
      {
        from: "agent",
        typing: 1100,
        text: "Хочешь маленький эксперимент? Стакан воды + фонарик в тёмной комнате 🔦",
      },
      { from: "user", text: "да!" },
      {
        from: "agent",
        typing: 900,
        text: "Направь фонарик в стакан сбоку → голубоватое свечение. Сквозь стакан → жёлтое. Это и есть рассеивание ✨",
      },
      {
        from: "system",
        text: "📩 в дайджест родителям: «Соня сегодня узнала про рассеяние Рэлея»",
      },
    ],
  },
  {
    id: "orion",
    name: "Orion",
    initial: "O",
    home: "web · ресёрч",
    role: {
      EN: "Research analyst",
      RU: "Аналитик ресёрча",
      UA: "Аналітик ресерчу",
    },
    script: [
      { from: "user", text: "deep research: цены на AI-тулы Q1 2026" },
      { from: "agent", typing: 900, text: "Сканирую 34 источника…" },
      {
        from: "agent",
        typing: 1500,
        text: "Паттерн: Perplexity team снизил $40 → $30 (12 фев)",
      },
      {
        from: "agent",
        typing: 900,
        text: "Аномалия: Claude Max держит $200, скидочного давления нет",
      },
      {
        from: "agent",
        typing: 1100,
        text: "Свожу 12-страничный бриф → Notion",
      },
      { from: "agent", text: "✓ готово · orion.notion/research-q1-2026" },
      { from: "user", text: "экспорт в markdown" },
      { from: "agent", typing: 500, text: "✓ ~/research-q1-2026.md" },
    ],
  },
  {
    id: "theo",
    name: "Theo",
    initial: "T",
    home: "vault · здоровье семьи",
    role: {
      EN: "Family health",
      RU: "Семейное здоровье",
      UA: "Сімейне здоров'я",
    },
    script: [
      { from: "system", text: "📄 ingest · ОАК + ферритин · 2026-04-18" },
      {
        from: "agent",
        typing: 1200,
        text: "📉 Тренд ферритина: 68 → 41 → 23 нг/мл за 18 мес",
      },
      {
        from: "agent",
        typing: 900,
        text: "⚠️ Уверенное снижение к депляции. Ниже функционального оптимума (80–150).",
      },
      { from: "user", text: "врач сказал — норм. так ли?" },
      {
        from: "agent",
        typing: 1400,
        text: "🟡 Не экстренно — но и не «норм». Низкий запас топлива, не отказ двигателя. Попроси терапевта досдать: насыщение трансферрина + CRP.",
      },
      {
        from: "agent",
        typing: 800,
        text: "Корреляция: кофе под еду с февраля (блокатор железа). Стоит 4 недели попробовать разнести с едой на 2 часа.",
      },
    ],
  },
  {
    id: "sasha",
    name: "Sasha",
    initial: "S",
    home: "studio · контент",
    role: {
      EN: "Content studio",
      RU: "Контент-студия",
      UA: "Контент-студія",
    },
    script: [
      { from: "system", text: "voice-профиль · 32 сэмпла подгружено" },
      {
        from: "agent",
        typing: 1200,
        text: "Делаю рилс #12 · «Почему агенты > автоматизации»",
      },
      { from: "agent", typing: 1000, text: "Хук A/B: «Я уволила своего VA…» → 9.2/10" },
      { from: "user", text: "хук посильнее" },
      {
        from: "agent",
        typing: 1100,
        text: "«В моём телеграме 8 человек, которые никогда не спят. 5 из них — не люди.» → 9.7/10 — публикуем?",
      },
      { from: "agent", typing: 900, text: "Рендер в очереди · готово через 4 мин" },
      { from: "agent", text: "календарь: 3 поста запланированы на эту неделю" },
    ],
  },
];

/* ──────────────── UI COPY ──────────────── */

type Copy = {
  title: string;
  subtitle: string;
  back: string;
  auth: string;
  dockLabel: string;
  hintIdle: string;
  hintFocused: string;
  typing: string;
  you: string;
  working: string;
  idle: string;
  parallel: string;
};

const COPY: Record<Lang, Copy> = {
  EN: {
    title: "HABITAT",
    subtitle: "your agents — living side by side",
    back: "← home",
    auth: "SIGN IN",
    dockLabel: "agents",
    hintIdle: "▸ tap an agent below to focus that chat",
    hintFocused: "▸ agents work in parallel · tap another to switch",
    typing: "typing…",
    you: "you",
    working: "working",
    idle: "idle",
    parallel: "8 agents · parallel",
  },
  RU: {
    title: "HABITAT",
    subtitle: "твои агенты — живут бок о бок",
    back: "← главная",
    auth: "АВТОРИЗАЦИЯ",
    dockLabel: "агенты",
    hintIdle: "▸ ткни агента в доке — чат увеличится",
    hintFocused: "▸ агенты работают параллельно · тапни другого чтоб переключиться",
    typing: "печатает…",
    you: "ты",
    working: "работает",
    idle: "простой",
    parallel: "8 агентов · параллельно",
  },
  UA: {
    title: "HABITAT",
    subtitle: "твої агенти — живуть поруч",
    back: "← головна",
    auth: "АВТОРИЗАЦІЯ",
    dockLabel: "агенти",
    hintIdle: "▸ тицьни агента в доку — чат збільшиться",
    hintFocused: "▸ агенти працюють паралельно · тапни іншого щоб перемкнутись",
    typing: "друкує…",
    you: "ти",
    working: "працює",
    idle: "простій",
    parallel: "8 агентів · паралельно",
  },
};

/* ──────────────── MESSAGE TYPES ──────────────── */

type RenderedMsg = {
  id: number;
  from: Beat["from"];
  text: string;
  stamp: string; // HH:MM
};

/* ──────────────── CHAT WINDOW ──────────────── */

type ChatWindowProps = {
  agent: Agent;
  copy: Copy;
  lang: Lang;
  focused: boolean;
  anyFocused: boolean;
  orderIndex: number; // 0..7 — seeds stagger + layout
  /** true when the window is in mobile fullscreen-overlay mode (no outer
   * scale transform, so inner text renders at natural size). */
  overlayMode: boolean;
  onFocus: () => void;
  onClose: () => void;
};

function ChatWindow({
  agent,
  copy,
  lang,
  focused,
  anyFocused,
  orderIndex,
  overlayMode,
  onFocus,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<RenderedMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [working, setWorking] = useState(true);

  // Refs so the message loop survives re-renders without restarting.
  const beatRef = useRef(0);
  const focusedRef = useRef(focused);
  const scrollRef = useRef<HTMLDivElement>(null);
  focusedRef.current = focused;

  // Each window gets its own virtual "started at" timestamp so the 8
  // grids don't all read the same clock. Stable for the window lifetime.
  const baseMinute = useMemo(() => 14 * 60 + 2 + orderIndex * 7, [orderIndex]);

  function stampFor(i: number): string {
    const total = baseMinute + i;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  useEffect(() => {
    let alive = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = (ms: number) => {
      timeoutId = setTimeout(tick, ms);
    };

    const tick = () => {
      if (!alive) return;
      const beat = agent.script[beatRef.current % agent.script.length];

      const land = () => {
        if (!alive) return;
        setTyping(false);
        setMessages((prev) => {
          const nextId = prev.length ? prev[prev.length - 1].id + 1 : 0;
          const next: RenderedMsg = {
            id: nextId,
            from: beat.from,
            text: beat.text,
            stamp: stampFor(nextId),
          };
          // cap the log — old messages roll off so the DOM stays thin
          return [...prev.slice(-24), next];
        });
        beatRef.current++;

        // Pace: focused windows play faster (more readable); idle windows
        // tick slowly so the whole grid feels alive without overload.
        const baseIdle = 3400 + (orderIndex % 3) * 350;
        const baseFocus = 1400 + (orderIndex % 2) * 250;
        const endOfLoop = beatRef.current % agent.script.length === 0;
        const gap = endOfLoop
          ? 6000
          : focusedRef.current
            ? baseFocus
            : baseIdle;

        setWorking(false);
        setTimeout(() => {
          if (alive) setWorking(true);
        }, Math.min(900, Math.max(300, gap - 200)));

        scheduleNext(gap);
      };

      if (beat.typing && beat.from === "agent") {
        setTyping(true);
        setWorking(true);
        const ms = focusedRef.current
          ? Math.max(400, Math.floor(beat.typing * 0.65))
          : beat.typing;
        timeoutId = setTimeout(land, ms);
      } else {
        land();
      }
    };

    // Stagger window starts so the grid doesn't pulse in lockstep.
    const bootDelay = 350 + orderIndex * 420;
    scheduleNext(bootDelay);

    return () => {
      alive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // focused is read via ref — toggling must not restart the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll the log to the latest message on each change.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  // Single palette axis: green for ambient / background windows, amber
  // for whichever window the user has brought to the front. Matches the
  // rest of the site's CRT chrome instead of fighting it with 8 hues.
  const tint = focused ? ACCENT_AMBER : ACCENT;

  return (
    <div
      onClick={focused ? undefined : onFocus}
      role={focused ? undefined : "button"}
      tabIndex={focused ? -1 : 0}
      className="relative w-full h-full font-mono overflow-hidden"
      style={{
        background: "rgba(6, 4, 12, 0.95)",
        border: `1px solid ${focused ? tint : `${tint}66`}`,
        borderRadius: 10,
        boxShadow: focused
          ? `0 30px 80px rgba(0,0,0,0.7), 0 0 72px ${tint}88, inset 0 0 40px ${tint}18`
          : `0 0 18px ${tint}33, inset 0 0 14px ${tint}08`,
        cursor: focused ? "default" : "pointer",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* window chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 select-none"
        style={{
          background: `linear-gradient(180deg, ${tint}22, transparent 90%)`,
          borderBottom: `1px solid ${tint}40`,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            if (focused) {
              e.stopPropagation();
              playSfx("tap");
              onClose();
            }
          }}
          aria-label="close"
          className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125"
          style={{
            background: "#ff5f57",
            cursor: focused ? "pointer" : "default",
          }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#febc2e" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#28c840" }}
        />
        <span
          className="ml-2 text-[10px] tracking-[0.15em] uppercase truncate"
          style={{ color: tint, opacity: 0.95, fontWeight: 600 }}
        >
          {agent.name}
        </span>
        <span
          className="ml-auto text-[9px] tracking-[0.18em] uppercase hidden sm:inline"
          style={{ color: `${tint}bb`, opacity: 0.7 }}
        >
          {agent.home}
        </span>
        <motion.span
          className="ml-2 w-1.5 h-1.5 rounded-full"
          style={{
            background: working || typing ? tint : `${tint}55`,
            boxShadow: working || typing ? `0 0 8px ${tint}` : "none",
          }}
          animate={{ opacity: working || typing ? [0.4, 1, 0.4] : 0.5 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>

      {/* message log */}
      <div
        ref={scrollRef}
        className="absolute top-[36px] left-0 right-0 bottom-[30px] overflow-y-auto px-3 py-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: `${tint}55 transparent`,
        }}
        onClick={(e) => focused && e.stopPropagation()}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              msg={m}
              tint={tint}
              copy={copy}
              agent={agent}
              focused={focused}
              anyFocused={anyFocused}
              overlayMode={overlayMode}
            />
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-1"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${tint}, ${tint}99)`,
                  color: "#040208",
                  fontWeight: 700,
                  fontSize: 10,
                }}
              >
                {agent.initial}
              </div>
              <div
                className="px-3 py-1.5 rounded-xl rounded-bl-sm"
                style={{
                  background: `${tint}18`,
                  border: `1px solid ${tint}40`,
                }}
              >
                <TypingDots tint={tint} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* footer — role + live status */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex items-center justify-between text-[9px] tracking-[0.18em] uppercase select-none"
        style={{
          background: `${tint}12`,
          borderTop: `1px solid ${tint}30`,
          color: `${tint}cc`,
        }}
      >
        <span className="truncate">{agent.role[lang]}</span>
        <span style={{ opacity: 0.8 }}>
          {typing ? copy.typing : working ? `● ${copy.working}` : `○ ${copy.idle}`}
        </span>
      </div>
    </div>
  );
}

/* ──────────────── MESSAGE ROW ──────────────── */

function MessageRow({
  msg,
  tint,
  copy,
  agent,
  focused,
  overlayMode,
}: {
  msg: RenderedMsg;
  tint: string;
  copy: Copy;
  agent: Agent;
  focused: boolean;
  anyFocused: boolean;
  overlayMode: boolean;
}) {
  if (msg.from === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="my-2 text-[10px] tracking-[0.14em] uppercase text-center"
        style={{ color: `${tint}99`, opacity: 0.75 }}
      >
        ── {msg.text} ──
      </motion.div>
    );
  }

  const isUser = msg.from === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex items-start gap-2 mt-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={
          isUser
            ? {
                background: "rgba(217,255,224,0.12)",
                border: "1px solid rgba(217,255,224,0.3)",
                color: "#d9ffe0",
              }
            : {
                background: `linear-gradient(135deg, ${tint}, ${tint}99)`,
                color: "#040208",
              }
        }
      >
        {isUser ? "·" : agent.initial}
      </div>
      <div
        className={`${focused ? "max-w-[82%]" : "max-w-[90%]"} min-w-0`}
        style={{ textAlign: isUser ? "right" : "left" }}
      >
        <div
          className={`inline-block px-3 py-1.5 ${
            isUser ? "rounded-xl rounded-br-sm" : "rounded-xl rounded-bl-sm"
          } whitespace-pre-wrap break-words text-left`}
          style={
            isUser
              ? {
                  background: "rgba(217,255,224,0.08)",
                  border: "1px solid rgba(217,255,224,0.22)",
                  color: "#eaffef",
                  // Desktop focus grows the window via outer scale — keep
                  // text base small so it doesn't double-up. Overlay mode
                  // has no outer scale, so it needs a natural readable size.
                  fontSize: overlayMode ? 13 : 11.5,
                  lineHeight: 1.45,
                }
              : {
                  background: `${tint}18`,
                  border: `1px solid ${tint}40`,
                  color: "#f0fff4",
                  fontSize: overlayMode ? 13 : 11.5,
                  lineHeight: 1.45,
                }
          }
        >
          {msg.text}
        </div>
        <div
          className="text-[9px] mt-0.5 px-1"
          style={{ color: isUser ? "rgba(217,255,224,0.45)" : `${tint}88` }}
        >
          {isUser ? copy.you : agent.name} · {msg.stamp}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────── TYPING DOTS ──────────────── */

function TypingDots({ tint }: { tint: string }) {
  return (
    <div className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: tint }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────── DOCK ──────────────── */

function Dock({
  agents,
  focusedId,
  onSelect,
  copy,
}: {
  agents: Agent[];
  focusedId: AgentId | null;
  onSelect: (id: AgentId) => void;
  copy: Copy;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[120] flex justify-center px-4"
      style={{ bottom: "calc(var(--chat-bar-h, 72px) + 16px)" }}
    >
      <div
        className="pointer-events-auto flex items-end gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl"
        style={{
          background: "rgba(4,2,8,0.72)",
          border: "1px solid rgba(0,255,65,0.25)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 12px 48px rgba(0,0,0,0.55), 0 0 26px rgba(0,255,65,0.12)",
        }}
      >
        <span
          className="hidden sm:inline mr-1 self-center text-[9px] tracking-[0.22em] uppercase"
          style={{ color: "rgba(0,255,65,0.55)" }}
        >
          ▸ {copy.dockLabel}
        </span>
        {agents.map((a) => {
          const active = focusedId === a.id;
          // Active tile flips to amber so the spelled-out FINEKOTS row
          // reads like green terminal letters with ONE amber cursor.
          const c = active ? ACCENT_AMBER : ACCENT;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                playSfx("tap");
                onSelect(a.id);
              }}
              aria-label={a.name}
              className="relative group"
              style={{
                width: active ? 46 : 36,
                height: active ? 46 : 36,
                borderRadius: 8,
                background: active
                  ? `rgba(255, 176, 0, 0.18)`
                  : `rgba(0, 255, 65, 0.08)`,
                color: c,
                fontWeight: 700,
                fontSize: active ? 18 : 14,
                letterSpacing: "0.04em",
                border: `1px solid ${active ? c : `${c}55`}`,
                boxShadow: active
                  ? `0 0 22px ${c}99, inset 0 0 14px ${c}22, 0 6px 18px rgba(0,0,0,0.5)`
                  : `0 0 10px ${c}33, inset 0 0 8px ${c}08`,
                textShadow: `0 0 8px ${c}cc`,
                transform: active ? "translateY(-6px)" : "translateY(0)",
                transition: "all 0.2s cubic-bezier(.2,.9,.3,1.2)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {a.initial}
              {!active && (
                <motion.span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{
                    background: c,
                    boxShadow: `0 0 6px ${c}`,
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
              <span
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap px-2 py-0.5 rounded text-[9px] tracking-[0.16em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "rgba(4,2,8,0.88)",
                  border: `1px solid ${c}88`,
                  color: c,
                }}
              >
                {a.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────── PAGE ──────────────── */

export default function HabitatPage() {
  const { lang } = useLang();
  const c = COPY[lang];

  const [focusedId, setFocusedId] = useState<AgentId | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Narrow-viewport layout: 2×4 grid and fullscreen-overlay focus mode.
  // Scale-in-place only makes sense with the wide 4×2 desktop grid.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Esc closes focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFocusedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main
      className="fixed inset-0 text-[#00ff41] font-mono overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, rgba(10, 30, 18, 0.55) 0%, rgba(4, 2, 8, 1) 75%)",
      }}
    >
      <CRTBackground />

      {/* HUD — nav strip */}
      <div
        className="absolute left-3 right-3 sm:left-4 sm:right-4 z-[500] flex items-center gap-2 sm:gap-3"
        style={{ top: "calc(var(--chat-top-h, 34px) + 10px)" }}
      >
        <Link
          href="/"
          className="font-mono uppercase transition-all px-3 py-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] flex items-center gap-1.5"
          style={{
            color: "#00ff41",
            background: "rgba(0, 255, 65, 0.08)",
            border: "1px solid rgba(0, 255, 65, 0.5)",
            borderRadius: 4,
            textShadow: "0 0 8px rgba(0, 255, 65, 0.6)",
            boxShadow: "0 0 12px rgba(0, 255, 65, 0.18)",
          }}
        >
          {c.back}
        </Link>

        <span className="hidden sm:inline-block flex-1 text-center text-[10px] sm:text-xs opacity-60 tracking-widest">
          {c.title} · {c.parallel}
        </span>

        <AuthButton onClick={() => setAuthOpen(true)} label={c.auth} />
      </div>

      <AuthLockedDialog open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Subtitle */}
      <div
        className="absolute left-0 right-0 z-20 text-center px-4"
        style={{ top: "calc(var(--chat-top-h, 34px) + 56px)" }}
      >
        <div
          className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase"
          style={{
            color: "#ffb000",
            textShadow: "0 0 8px rgba(255,176,0,0.4)",
          }}
        >
          // {c.subtitle}
        </div>
      </div>

      {/* GRID of chat windows.
          — Desktop (4×2): focused window scales 1.8× in-place with
            transform-origin biased toward the grid interior, so it
            physically overlaps its neighbours.
          — Narrow (2×4): focused window escapes the grid and fills it
            as an overlay — scaling a tiny mobile cell is illegible.
          Click-through rule: while any window is focused, a tap on
          another window ONLY closes focus (doesn't immediately swap) —
          the dimmed neighbours are hard to aim at blind. Dock taps DO
          swap directly, since the dock stays visible and legible. */}
      <div
        className="absolute inset-x-0 z-10 px-3 sm:px-6"
        style={{
          top: "calc(var(--chat-top-h, 34px) + 90px)",
          bottom: "calc(var(--chat-bar-h, 72px) + 96px)",
          // Narrow screens + 4 rows don't fit — let the grid scroll past
          // the viewport so each window stays tall enough to read.
          overflowY: isNarrow ? "auto" : "hidden",
        }}
        onClick={(e) => {
          // backdrop tap → defocus (only when there's something to close)
          if (focusedId && e.target === e.currentTarget) setFocusedId(null);
        }}
      >
        <div
          className={`relative mx-auto grid w-full gap-3 sm:gap-4 ${isNarrow ? "" : "h-full"}`}
          style={{
            maxWidth: 1400,
            gridTemplateColumns: isNarrow
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
            // Fixed-per-row on narrow screens (scrollable); on desktop,
            // allow stretch but enforce a minimum so short viewports
            // don't squish the log into 1-message slices.
            gridTemplateRows: isNarrow
              ? "repeat(4, 330px)"
              : "repeat(2, minmax(300px, 1fr))",
          }}
          onClick={(e) => {
            // tapping the grid container itself (gap area) also defocuses
            if (focusedId && e.target === e.currentTarget) setFocusedId(null);
          }}
        >
          {AGENTS.map((a, i) => {
            const focused = focusedId === a.id;
            const cols = isNarrow ? 2 : 4;
            const row = Math.floor(i / cols);
            const col = i % cols;

            // Desktop-only transform-origin so the scale pops INTO
            // neighbours rather than off-screen.
            const originX = isNarrow
              ? "50%"
              : col === 0
                ? "20%"
                : col === 1
                  ? "40%"
                  : col === 2
                    ? "60%"
                    : "80%";
            const originY = isNarrow ? "50%" : row === 0 ? "30%" : "70%";

            // Mobile focus = fullscreen overlay (absolute, inset:0).
            // Leaves the rest of the grid in place underneath.
            const mobileOverlay = isNarrow && focused;

            return (
              <motion.div
                key={a.id}
                className="relative min-h-0 min-w-0"
                style={{
                  zIndex: focused ? 60 : 10 + (8 - i),
                  transformOrigin: `${originX} ${originY}`,
                  willChange: "transform, opacity, filter",
                  ...(mobileOverlay
                    ? {
                        // Pin to the viewport rather than the scrollable
                        // grid container — otherwise the overlay grows
                        // to match the FULL scrollable grid height.
                        position: "fixed",
                        top: "calc(var(--chat-top-h, 34px) + 90px)",
                        bottom: "calc(var(--chat-bar-h, 72px) + 96px)",
                        left: 12,
                        right: 12,
                      }
                    : {
                        gridColumn: col + 1,
                        gridRow: row + 1,
                      }),
                }}
                animate={{
                  // Desktop pop-scale; mobile uses overlay sizing instead.
                  scale:
                    !isNarrow && focused
                      ? 1.7
                      : focusedId && !focused
                        ? 0.97
                        : 1,
                  opacity: focused ? 1 : focusedId ? 0.45 : 1,
                  filter: focused
                    ? "blur(0px)"
                    : focusedId
                      ? "blur(1.5px) saturate(0.8)"
                      : "blur(0px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                  mass: 0.9,
                }}
              >
                <ChatWindow
                  agent={a}
                  copy={c}
                  lang={lang}
                  focused={focused}
                  anyFocused={focusedId !== null}
                  orderIndex={i}
                  overlayMode={mobileOverlay}
                  onFocus={() => {
                    playSfx("tap");
                    // First tap while something else is focused → only
                    // close it (user can't see where they're aiming
                    // under the dim). Second tap can then select.
                    if (focusedId && focusedId !== a.id) {
                      setFocusedId(null);
                      return;
                    }
                    setFocusedId(a.id);
                  }}
                  onClose={() => setFocusedId(null)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* HINT — sits above the dock */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-[110] flex justify-center px-4"
        style={{ bottom: "calc(var(--chat-bar-h, 72px) + 84px)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedId ? "focused" : "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{
              background: "rgba(4,2,8,0.7)",
              border: "1px solid rgba(255,176,0,0.32)",
              color: "rgba(255,176,0,0.92)",
              fontSize: 10.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(255,176,0,0.3)",
            }}
          >
            {focusedId ? c.hintFocused : c.hintIdle}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DOCK */}
      <Dock
        agents={AGENTS}
        focusedId={focusedId}
        onSelect={(id) =>
          setFocusedId(focusedId === id ? null : id)
        }
        copy={c}
      />
    </main>
  );
}
