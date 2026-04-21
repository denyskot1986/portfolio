"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";
import { AgentModeOverlay } from "./AgentModeOverlay";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  replies?: string[];
}

// Allowed internal routes for nav actions (mirrors SYSTEM_PROMPT whitelist).
const NAV_WHITELIST = /^\/(products\/[a-z0-9-]+|reels-agent|genesis)\/?$/i;

// Action directive syntax emitted by the LLM:
//   [nav:/products/david]   → next.router.push
//   [scroll:product-david]  → document.getElementById(...).scrollIntoView
const ACTION_REGEX = /\[(nav|scroll):([^\]\s]+)\]/gi;

// Suggested-reply directive: `[reply: short phrase]` — rendered as clickable
// quick-reply chips below the assistant message; on click we send that phrase
// as a new user turn. Must come after the above action regex because [reply:]
// can contain spaces and punctuation.
const REPLY_REGEX = /\[reply:\s*([^\]\n]+)\]/gi;

type ParsedReply = {
  visible: string;
  actions: Array<{ type: "nav" | "scroll"; target: string }>;
  replies: string[];
};

function parseReply(raw: string): ParsedReply {
  const actions: ParsedReply["actions"] = [];
  const replies: string[] = [];
  const visible = raw
    .replace(ACTION_REGEX, (_, kind: string, target: string) => {
      const type = kind.toLowerCase() as "nav" | "scroll";
      if (type === "nav" && !NAV_WHITELIST.test(target)) return "";
      actions.push({ type, target });
      return "";
    })
    .replace(REPLY_REGEX, (_, phrase: string) => {
      const clean = phrase.trim();
      if (clean && replies.length < 4) replies.push(clean);
      return "";
    })
    // Strip stray "===" lines that leak when the LLM over-adds separators.
    .replace(/^\s*={3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { visible, actions, replies };
}

// Tour mode: LLM separates product beats with "===" on its own line.
// We split, parse each as a ParsedReply, drop empty ones.
const BEAT_SEPARATOR = /\n\s*={3,}\s*\n/;
function parseBeats(raw: string): ParsedReply[] {
  const parts = raw.split(BEAT_SEPARATOR);
  if (parts.length < 2) return [parseReply(raw)];
  const beats = parts
    .map((p) => parseReply(p))
    .filter((b) => b.visible.length > 0 || b.actions.length > 0);
  return beats.length ? beats : [parseReply(raw)];
}

// Legacy markdown links — render as plain text (directives are the new path).
const MD_LINK_REGEX = /\[([^\]\n]+)\]\((\/[^\s)]+)\)/g;
// Telegram handle — make the @shop_by_finekot_bot clickable in reply text.
// Matches @name (letters/digits/underscore, 3-32 chars per Telegram rules).
const TG_HANDLE_REGEX = /@([a-zA-Z0-9_]{3,32})/g;

function renderAssistantText(content: string): React.ReactNode {
  // 1) Strip markdown-link wrappers — keep only the label text.
  const flat = content.replace(MD_LINK_REGEX, (_, label) => label);

  // 2) Linkify any @telegram_handle occurrences.
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  const re = new RegExp(TG_HANDLE_REGEX.source, TG_HANDLE_REGEX.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat)) !== null) {
    const [full, handle] = m;
    if (m.index > cursor) nodes.push(flat.slice(cursor, m.index));
    nodes.push(
      <a
        key={key++}
        href={`https://t.me/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 transition-colors"
        style={{
          color: "#ffb000",
          textShadow: "0 0 6px rgba(255, 176, 0, 0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#ffd36b";
          e.currentTarget.style.textShadow =
            "0 0 10px rgba(255, 176, 0, 0.85)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#ffb000";
          e.currentTarget.style.textShadow =
            "0 0 6px rgba(255, 176, 0, 0.5)";
        }}
      >
        {full}
      </a>
    );
    cursor = re.lastIndex;
  }
  if (cursor < flat.length) nodes.push(flat.slice(cursor));
  return nodes.length === 0
    ? flat
    : nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Finekot Systems: online",
};

const SESSION_KEY = "finekot_chat_session";
const HISTORY_KEY = "finekot_chat_history";
const HISTORY_MAX = 40;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function loadHistory(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const out: ChatMessage[] = [];
    for (const m of parsed) {
      if (
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
      ) {
        out.push({ role: m.role, content: m.content });
      }
    }
    return out.length ? out.slice(-HISTORY_MAX) : null;
  } catch {
    return null;
  }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.slice(-HISTORY_MAX))
    );
  } catch {
    /* quota / disabled — ignore */
  }
}

const FRAME_BORDER = "rgba(0, 255, 65, 0.4)";
const FRAME_GLOW = "0 0 24px rgba(0, 255, 65, 0.18)";

const PLACEHOLDER_BY_LANG: Record<Lang, string> = {
  EN: "prompt",
  RU: "prompt",
  UA: "prompt",
};

// Quick-command presets surfaced from the "cmd" menu next to the >_ button.
// Clicking a preset sends its prompt immediately — no typing.
type QuickCommand = {
  id: string;
  label: Record<Lang, string>;
  emoji: string;
  prompt: Record<Lang, string>;
};

const QUICK_COMMANDS: QuickCommand[] = [
  {
    id: "help-decide",
    emoji: "",
    label: { EN: "Help me decide", RU: "Помочь определиться", UA: "Допоможи визначитися" },
    prompt: {
      EN: "Help me decide which agent I need. Run the short in-chat scan — ask me 5-7 short questions and then recommend a specific agent from the catalog with its price.",
      RU: "Помоги мне определиться, какой агент мне нужен. Запусти короткий скан прямо тут в чате — задай 5-7 коротких вопросов и потом порекомендуй конкретного агента из каталога с ценой.",
      UA: "Допоможи визначитись, який агент мені потрібен. Запусти короткий скан прямо тут у чаті — постав 5-7 коротких питань і потім порекомендуй конкретного агента з каталогу з ціною.",
    },
  },
  {
    id: "how-it-works",
    emoji: "",
    label: { EN: "How does it all work?", RU: "Как всё работает?", UA: "Як це все працює?" },
    prompt: {
      EN: "Explain in 3-4 short lines how Finekot Systems works end-to-end: what an authored agent is, where it lives (Telegram / site / phone), how it's different from a plain chatbot, and how I get one.",
      RU: "Объясни в 3-4 коротких строках как устроена Finekot Systems: что такое авторский агент, где он живёт (Telegram / сайт / телефон), чем отличается от обычного чат-бота и как его получить.",
      UA: "Поясни у 3-4 коротких рядках як влаштована Finekot Systems: що таке авторський агент, де він живе (Telegram / сайт / телефон), чим відрізняється від звичайного чат-бота і як його отримати.",
    },
  },
  {
    id: "site-run-by-agents",
    emoji: "",
    label: { EN: "Is this site run by agents?", RU: "Сайтом рулят агенты?", UA: "Сайтом керують агенти?" },
    prompt: {
      EN: "Is this whole site actually run by AI agents? Who am I talking to right now, and how is this different from a landing page with a support widget?",
      RU: "Этот сайт реально ведут AI-агенты? С кем я сейчас разговариваю и чем это отличается от обычного лендинга со встроенным чат-виджетом?",
      UA: "Цей сайт справді ведуть AI-агенти? З ким я зараз спілкуюсь і чим це відрізняється від звичайного лендінгу з вбудованим чат-віджетом?",
    },
  },
  {
    id: "why-not-gpt",
    emoji: "",
    label: { EN: "Why not just ChatGPT?", RU: "Чем лучше ChatGPT?", UA: "Чим краще ChatGPT?" },
    prompt: {
      EN: "Why would I buy an authored agent from Finekot Systems instead of just using ChatGPT or building one myself? Give me the honest 2-3 line answer.",
      RU: "Зачем покупать авторского агента у Finekot Systems, если есть ChatGPT или можно собрать самому? Дай честный ответ в 2-3 строки.",
      UA: "Навіщо купувати авторського агента у Finekot Systems, якщо є ChatGPT або можна зібрати самому? Дай чесну відповідь у 2-3 рядки.",
    },
  },
  {
    id: "how-to-buy",
    emoji: "",
    label: { EN: "How do I buy an agent?", RU: "Как купить агента?", UA: "Як купити агента?" },
    prompt: {
      EN: "Walk me through buying an agent in 3 steps — payment, delivery, first login. Where exactly does the checkout happen?",
      RU: "Проведи меня по покупке агента в 3 шага — оплата, доставка, первый логин. Где именно происходит оформление заказа?",
      UA: "Проведи мене по купівлі агента у 3 кроки — оплата, доставка, перший логін. Де саме відбувається оформлення замовлення?",
    },
  },
  {
    id: "custom-studio",
    emoji: "",
    label: { EN: "Custom agent", RU: "Кастомный агент", UA: "Кастомний агент" },
    prompt: {
      EN: "I need an agent that doesn't exist in your catalog — built specifically for my business. Tell me about Custom Studio: price, timeline, what's included.",
      RU: "Мне нужен агент которого нет в каталоге — собранный под мой бизнес. Расскажи про Custom Studio: цена, сроки, что входит.",
      UA: "Мені потрібен агент якого немає у каталозі — зібраний під мій бізнес. Розкажи про Custom Studio: ціна, терміни, що входить.",
    },
  },
];

export default function ChatbotBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [agentDriving, setAgentDriving] = useState(false);
  const tourTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Все setTimeout, которые шедулятся туром/скроллами. Когда пользователь
  // жмёт «забрать управление» / ESC — мы их все глушим, иначе агент
  // продолжит скроллить страницу уже после отмены.
  const scheduledTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      scheduledTimeoutsRef.current = scheduledTimeoutsRef.current.filter(
        (t) => t !== id
      );
      fn();
    }, delay);
    scheduledTimeoutsRef.current.push(id);
    return id;
  }, []);
  const clearAllScheduled = useCallback(() => {
    for (const id of scheduledTimeoutsRef.current) clearTimeout(id);
    scheduledTimeoutsRef.current = [];
  }, []);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logPanelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const cmdMenuRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);

  // On first mount, hydrate messages from sessionStorage so the log
  // survives navigation between product pages. Keep the log CLOSED —
  // user opens it themselves via >_ or by focusing input (commander
  // explicitly did not want auto-open on refresh).
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const restored = loadHistory();
    if (restored && restored.length) {
      setMessages(restored);
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, logOpen]);

  // Close log when user clicks outside of the chat chrome (log panel + bars).
  useEffect(() => {
    if (!logOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const inside =
        logPanelRef.current?.contains(target) ||
        barRef.current?.contains(target) ||
        topBarRef.current?.contains(target);
      if (!inside) setLogOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [logOpen]);

  // Close the quick-commands menu on outside click.
  useEffect(() => {
    if (!cmdOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (cmdMenuRef.current?.contains(target)) return;
      // Click on the bar itself (e.g. the cmd toggle) is handled via its own onClick.
      if (barRef.current?.contains(target)) return;
      setCmdOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [cmdOpen]);

  const executeActions = useCallback(
    (actions: ParsedReply["actions"]) => {
      if (actions.length === 0) return;
      // Tour mode: many scrolls in one reply → slower pacing so the user
      // can actually read each card. 3+ actions → 2.2s between beats.
      const isTour = actions.filter((a) => a.type === "scroll").length >= 3;
      const stepMs = isTour ? 2200 : 550;
      let delay = 0;
      for (const act of actions) {
        schedule(() => {
          if (act.type === "nav") {
            if (act.target === pathname) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push(act.target);
            }
          } else if (act.type === "scroll") {
            const el = document.getElementById(act.target);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("chat-scroll-flash");
              schedule(
                () => el.classList.remove("chat-scroll-flash"),
                1600
              );
            }
          }
        }, delay);
        // nav needs less pause than a read-a-card pause.
        delay += act.type === "nav" ? 600 : stepMs;
      }
    },
    [router, pathname, schedule]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLogOpen(true);

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const historyForApi = messages
        .filter((m) => m !== WELCOME_MESSAGE)
        .concat(userMsg);
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      if (inputRef.current) inputRef.current.style.height = "auto";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            pageUrl:
              typeof window !== "undefined" ? window.location.pathname : "/",
            sessionId: getSessionId(),
          }),
        });
        const data = await res.json();
        const raw: string =
          data.reply ||
          data.error ||
          "Связь прервана. Напиши в Telegram: @shop_by_finekot_bot";
        const beats = parseBeats(raw);
        if (beats.length === 1) {
          const parsed = beats[0];
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: parsed.visible || "> done.",
              replies: parsed.replies.length ? parsed.replies : undefined,
            },
          ]);
          const scrollCount = parsed.actions.filter(
            (a) => a.type === "scroll"
          ).length;
          const actionCount = parsed.actions.length;
          // ЛЮБАЯ навигация/скролл агентом = юзер видит оверлей «Давид ведёт».
          // Даже короткое действие (1 nav или 1 scroll) — чтоб юзер сразу
          // понял, что им управляют, а не сайт сам «прыгнул».
          if (actionCount > 0) {
            setAgentDriving(true);
            if (tourTimeoutRef.current) clearTimeout(tourTimeoutRef.current);
            let duration: number;
            if (scrollCount >= 3) {
              duration = 2200 * scrollCount + 1500; // tour
            } else if (scrollCount > 0) {
              duration = 1200 * scrollCount + 900; // 1-2 скролла
            } else {
              duration = 1600; // одна nav-переброска: хватает чтобы юзер заметил
            }
            tourTimeoutRef.current = setTimeout(() => {
              setAgentDriving(false);
              if (scrollCount >= 3) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }, duration);
          }
          executeActions(parsed.actions);
        } else {
          // Tour streaming — emit each beat as its own message with a pause
          // so the user can read + the scroll flash lands before the next.
          setAgentDriving(true);
          // A tour scrolls product cards that only exist on "/". If the user
          // is on a product page, force-nav home first and delay the beats
          // so the cards have time to mount before the first [scroll:...].
          let delay = 0;
          if (pathname !== "/") {
            router.push("/");
            delay = 700;
          }
          const BEAT_GAP_MS = 2400;
          for (const beat of beats) {
            const text = beat.visible || "";
            const beatActions = beat.actions;
            schedule(() => {
              if (text) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: text,
                    replies: beat.replies.length ? beat.replies : undefined,
                  },
                ]);
              }
              // Scroll/nav fires right after the message lands.
              if (beatActions.length) {
                schedule(() => executeActions(beatActions), 120);
              }
            }, delay);
            // Pure-action beats (just [nav:/] intro) need less read-time.
            delay += text ? BEAT_GAP_MS : 700;
          }
          if (tourTimeoutRef.current) clearTimeout(tourTimeoutRef.current);
          tourTimeoutRef.current = setTimeout(() => {
            setAgentDriving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, delay + 1500);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Ошибка соединения. Напиши в Telegram: @shop_by_finekot_bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, executeActions]
  );

  const adjustTextarea = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, []);

  const send = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  // «Забрать управление» — останавливает агент-режим: гасим все отложенные
  // beat'ы/скроллы, снимаем оверлей, снимаем loading. После этого юзер снова
  // рулит страницей сам. Ничего не удаляем из уже вставленных сообщений —
  // лог остаётся читаемым.
  const handleTakeOver = useCallback(() => {
    if (tourTimeoutRef.current) {
      clearTimeout(tourTimeoutRef.current);
      tourTimeoutRef.current = null;
    }
    clearAllScheduled();
    setAgentDriving(false);
    setLoading(false);
  }, [clearAllScheduled]);

  // ESC → забрать управление, когда агент ведёт или идёт fetch.
  useEffect(() => {
    if (!agentDriving && !loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleTakeOver();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agentDriving, loading, handleTakeOver]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.content.trim().length > 0),
    [messages]
  );

  const hasActivity = messages.length > 1;

  useEffect(
    () => () => {
      if (tourTimeoutRef.current) clearTimeout(tourTimeoutRef.current);
      for (const id of scheduledTimeoutsRef.current) clearTimeout(id);
      scheduledTimeoutsRef.current = [];
    },
    []
  );

  return (
    <>
      <AgentModeOverlay
        active={agentDriving}
        theme="blue"
        intensity="normal"
        showBadge={true}
        agentName="Давид"
        onTakeOver={handleTakeOver}
      />
      {/* ───── TOP FRAME HEADER ───── */}
      <div
        ref={topBarRef}
        className="fixed top-0 left-0 right-0 z-[499] font-mono"
        style={{
          height: "var(--chat-top-h, 34px)",
          background: "rgba(4, 2, 8, 0.97)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${FRAME_BORDER}`,
          boxShadow: "0 2px 18px rgba(0, 255, 65, 0.12)",
        }}
      >
        <div
          className="h-full px-3 sm:px-4 flex items-center gap-2 text-[10px]"
          style={{ color: "#00ff41", letterSpacing: "0.12em" }}
        >
          {/* Terminal "traffic lights" */}
          <div className="flex items-center gap-1.5 mr-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#ff5f57", boxShadow: "0 0 6px rgba(255, 95, 87, 0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#febc2e", boxShadow: "0 0 6px rgba(254, 188, 46, 0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#28c840", boxShadow: "0 0 6px rgba(40, 200, 64, 0.6)" }}
            />
          </div>
          <span style={{ color: "#ffb000", opacity: 0.7 }}>//</span>
          <span>finekot.shop</span>
          <span style={{ opacity: 0.4 }}>::</span>
          <span>consultant</span>
          <span style={{ opacity: 0.4 }}>::</span>
          <span style={{ color: "#ffb000" }}>0x3F</span>
          <span className="flex-1" />
          {hasActivity && (
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="transition-colors uppercase px-2 py-0.5 hidden sm:inline-flex items-center gap-1"
              style={{
                color: logOpen ? "#00ff41" : "rgba(0, 255, 65, 0.55)",
                letterSpacing: "0.2em",
                border: "1px solid rgba(0, 255, 65, 0.3)",
                borderRadius: "2px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = logOpen
                  ? "#00ff41"
                  : "rgba(0, 255, 65, 0.55)")
              }
              aria-label={logOpen ? "Hide log" : "Show log"}
            >
              {logOpen ? "hide log" : "log"}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#00ff41",
                  boxShadow: "0 0 6px rgba(0, 255, 65, 0.8)",
                }}
              />
            </button>
          )}
          <button
            onClick={() => {
              setMessages([WELCOME_MESSAGE]);
              setLogOpen(false);
              try {
                sessionStorage.removeItem(HISTORY_KEY);
              } catch {}
            }}
            className="transition-colors uppercase"
            style={{
              color: "rgba(0, 255, 65, 0.45)",
              letterSpacing: "0.2em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(0, 255, 65, 0.45)")
            }
            aria-label="Clear log"
          >
            clr
          </button>
        </div>
      </div>

      {/* ───── MESSAGE LOG (floats above bottom bar, inside frame) ───── */}
      <AnimatePresence>
        {logOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[498] pointer-events-none"
            style={{ bottom: "var(--chat-bar-h, 72px)" }}
          >
            {/* Прижимаем лог к ЛЕВОМУ краю: правая половина десктопа
                остаётся видна (под чатом живая страница, удобно пальцем
                скроллить справа на мобиле). На узких экранах — fullwidth,
                поэтому sm:max-w-xl включается только от 640px. */}
            <div className="max-w-full sm:max-w-xl px-3 sm:pl-4 sm:pr-2 pb-2">
              <div
                ref={logPanelRef}
                className="pointer-events-auto relative font-mono overflow-hidden"
                style={{
                  background: "rgba(4, 2, 8, 0.97)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${FRAME_BORDER}`,
                  borderRadius: "6px",
                  boxShadow: FRAME_GLOW,
                }}
              >
                {/* slim log header strip */}
                <div
                  className="px-3 py-1.5 flex items-center gap-2 text-[10px]"
                  style={{
                    background: "rgba(0, 255, 65, 0.06)",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                    color: "rgba(0, 255, 65, 0.7)",
                    letterSpacing: "0.15em",
                  }}
                >
                  <span style={{ color: "#ffb000", opacity: 0.7 }}>└─</span>
                  <span className="uppercase">Finekot Systems</span>
                  <span className="flex-1 flex items-center justify-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#00ff41",
                        boxShadow: "0 0 6px rgba(0, 255, 65, 0.9)",
                      }}
                      aria-hidden
                    />
                    <span
                      className="uppercase"
                      style={{
                        color: "#ffb000",
                        textShadow: "0 0 6px rgba(255, 176, 0, 0.45)",
                        letterSpacing: "0.22em",
                      }}
                    >
                      David agent
                    </span>
                  </span>
                  <button
                    onClick={() => setLogOpen(false)}
                    className="transition-all flex items-center gap-1.5 px-2.5 py-1 uppercase"
                    style={{
                      color: "rgba(255, 176, 0, 0.9)",
                      background: "rgba(255, 176, 0, 0.08)",
                      border: "1px solid rgba(255, 176, 0, 0.5)",
                      borderRadius: "3px",
                      letterSpacing: "0.2em",
                      fontSize: "11px",
                      fontWeight: 700,
                      textShadow: "0 0 6px rgba(255, 176, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.2)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.08)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.5)";
                    }}
                    aria-label={
                      lang === "RU"
                        ? "Свернуть лог"
                        : lang === "UA"
                        ? "Згорнути лог"
                        : "Collapse log"
                    }
                    title={
                      lang === "RU"
                        ? "Свернуть этот чат"
                        : lang === "UA"
                        ? "Згорнути цей чат"
                        : "Collapse this chat"
                    }
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span>
                      {lang === "RU"
                        ? "свернуть"
                        : lang === "UA"
                        ? "згорнути"
                        : "collapse"}
                    </span>
                  </button>
                </div>

                <div
                  ref={messagesRef}
                  className="relative px-3 py-3 space-y-1.5 text-xs leading-relaxed overflow-y-auto overscroll-contain"
                  style={{ maxHeight: "min(45vh, 320px)" }}
                >
                  {visibleMessages.map((msg, i) => {
                    const isUsr = msg.role === "user";
                    const isLast = i === visibleMessages.length - 1;
                    const hasLlmReplies = !!msg.replies?.length;
                    const isWelcome =
                      i === 0 && msg.content === WELCOME_MESSAGE.content;
                    // Под welcome — QUICK_COMMANDS фулл-набор.
                    // Под любым другим assistant-сообщением всегда даём
                    // чипы: LLM-replies если есть, иначе generic fallback
                    // («Подробнее / Примеры / Варианты») на языке юзера —
                    // чтобы диалог не обрывался, когда модель забыла
                    // приложить [reply:...]. Важно: generic fallback НЕ
                    // содержит «Помочь определиться», иначе зациклит scan.
                    const showReplies =
                      !isUsr && isLast && !loading && !agentDriving;
                    const welcomeChips: Array<{
                      label: string;
                      prompt: string;
                    }> = QUICK_COMMANDS.slice(0, 4).map((c) => ({
                      label: c.label[lang],
                      prompt: c.prompt[lang],
                    }));
                    const genericFallback: Array<{
                      label: string;
                      prompt: string;
                    }> = (() => {
                      const variants: Record<Lang, Array<[string, string]>> = {
                        EN: [
                          ["Tell me more", "Tell me more."],
                          ["Show me examples", "Show me concrete examples."],
                          ["What are my options?", "What options do I have?"],
                        ],
                        RU: [
                          ["Расскажи подробнее", "Расскажи подробнее."],
                          ["Покажи примеры", "Покажи конкретные примеры."],
                          ["Какие есть варианты?", "Какие у меня есть варианты?"],
                        ],
                        UA: [
                          ["Розкажи детальніше", "Розкажи детальніше."],
                          ["Покажи приклади", "Покажи конкретні приклади."],
                          ["Які є варіанти?", "Які у мене є варіанти?"],
                        ],
                      };
                      return variants[lang].map(([label, prompt]) => ({
                        label,
                        prompt,
                      }));
                    })();
                    const chips: Array<{ label: string; prompt: string }> =
                      hasLlmReplies
                        ? msg.replies!.map((r) => ({ label: r, prompt: r }))
                        : isWelcome
                        ? welcomeChips
                        : genericFallback;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col gap-1.5"
                      >
                        <div className="flex gap-2">
                          <span
                            className="shrink-0 pt-0.5"
                            style={{ color: "rgba(0, 255, 65, 0.5)" }}
                          >
                            ├─
                          </span>
                          <span
                            className="shrink-0 text-[10px] pt-[3px]"
                            style={{
                              color: isUsr ? "#ffb000" : "#00ff41",
                              letterSpacing: "0.12em",
                              textShadow: `0 0 6px ${
                                isUsr
                                  ? "rgba(255, 176, 0, 0.5)"
                                  : "rgba(0, 255, 65, 0.5)"
                              }`,
                              width: 26,
                            }}
                          >
                            {isUsr ? "USR" : "SYS"}
                          </span>
                          <span
                            className="shrink-0 pt-0.5"
                            style={{ color: "rgba(0, 255, 65, 0.4)" }}
                          >
                            │
                          </span>
                          <span
                            className="flex-1 whitespace-pre-wrap break-words"
                            style={{
                              color: isUsr
                                ? "rgba(255, 200, 120, 0.95)"
                                : "rgba(217, 255, 224, 0.88)",
                            }}
                          >
                            {isUsr ? msg.content : renderAssistantText(msg.content)}
                          </span>
                        </div>
                        {showReplies && (
                          <div
                            className="flex flex-col gap-1 pl-[60px] mt-1"
                            role="group"
                            aria-label="Suggested replies"
                          >
                            {chips.map((c, ri) => (
                              <button
                                key={ri}
                                type="button"
                                onClick={() => void sendMessage(c.prompt)}
                                disabled={loading || agentDriving}
                                className="group text-left px-2.5 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{
                                  background: "rgba(255, 176, 0, 0.05)",
                                  border: "1px solid rgba(255, 176, 0, 0.35)",
                                  borderRadius: 3,
                                  color: "#ffd88a",
                                  fontSize: 11.5,
                                  lineHeight: 1.3,
                                  letterSpacing: "0.01em",
                                }}
                                onMouseEnter={(e) => {
                                  if (e.currentTarget.disabled) return;
                                  e.currentTarget.style.background =
                                    "rgba(255, 176, 0, 0.14)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(255, 176, 0, 0.7)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255, 176, 0, 0.05)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(255, 176, 0, 0.35)";
                                }}
                              >
                                <span
                                  className="shrink-0 font-bold"
                                  style={{ color: "#ffb000", opacity: 0.8 }}
                                  aria-hidden
                                >
                                  {ri + 1} →
                                </span>
                                <span className="break-words">{c.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {loading && (
                    <div className="flex gap-2">
                      <span
                        className="shrink-0 pt-0.5"
                        style={{ color: "rgba(0, 255, 65, 0.5)" }}
                      >
                        ├─
                      </span>
                      <span
                        className="shrink-0 text-[10px] pt-[3px]"
                        style={{
                          color: "#00ff41",
                          letterSpacing: "0.12em",
                          textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                          width: 26,
                        }}
                      >
                        SYS
                      </span>
                      <span
                        className="shrink-0 pt-0.5"
                        style={{ color: "rgba(0, 255, 65, 0.4)" }}
                      >
                        │
                      </span>
                      <motion.span
                        className="text-[11px]"
                        style={{
                          color: "#00ff41",
                          textShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        processing...
                      </motion.span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── QUICK COMMANDS MENU (floats above bottom bar) ───── */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-0 right-0 z-[500] pointer-events-none"
            style={{ bottom: "var(--chat-bar-h, 72px)" }}
          >
            {/* Quick-command popup — тоже прижат влево, чтобы ничего не
                центрировало чатовую обвеску (правая половина экрана остаётся
                рабочей). */}
            <div className="max-w-full sm:max-w-xl px-3 sm:pl-4 sm:pr-2 pb-2">
              <div
                ref={cmdMenuRef}
                className="pointer-events-auto font-mono overflow-hidden"
                style={{
                  background: "rgba(4, 2, 8, 0.97)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: `1px solid ${FRAME_BORDER}`,
                  borderRadius: "6px",
                  boxShadow: FRAME_GLOW,
                }}
              >
                <div
                  className="px-3 py-1.5 flex items-center gap-2 text-[10px]"
                  style={{
                    background: "rgba(0, 255, 65, 0.06)",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                    color: "rgba(0, 255, 65, 0.7)",
                    letterSpacing: "0.2em",
                  }}
                >
                  <span style={{ color: "#ffb000", opacity: 0.7 }}>⌘</span>
                  <span className="uppercase">
                    {lang === "RU"
                      ? "быстрые команды"
                      : lang === "UA"
                      ? "швидкі команди"
                      : "quick commands"}
                  </span>
                </div>
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {/* Demo-mode shortcuts — amber, promoted to top of the list */}
                  <button
                    type="button"
                    onClick={() => {
                      setCmdOpen(false);
                      void sendMessage(
                        lang === "RU"
                          ? "Включи presentation mode — проведи экскурсию по всем товарам по очереди"
                          : lang === "UA"
                          ? "Увімкни presentation mode — проведи екскурсію по всіх товарах по черзі"
                          : "Start presentation mode — walk me through every product one by one"
                      );
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-left transition-all"
                    style={{
                      background: "rgba(255, 176, 0, 0.05)",
                      border: "1px solid rgba(255, 176, 0, 0.28)",
                      borderRadius: "3px",
                      color: "#ffd88a",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.14)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.65)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.05)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.28)";
                    }}
                  >
                    <span className="text-xs leading-tight">
                      {lang === "RU"
                        ? "Товары"
                        : lang === "UA"
                        ? "Товари"
                        : "Products"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCmdOpen(false);
                      router.push("/factory");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-left transition-all"
                    style={{
                      background: "rgba(255, 176, 0, 0.05)",
                      border: "1px solid rgba(255, 176, 0, 0.28)",
                      borderRadius: "3px",
                      color: "#ffd88a",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.14)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.65)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 176, 0, 0.05)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 176, 0, 0.28)";
                    }}
                  >
                    <span className="text-xs leading-tight">
                      {lang === "RU"
                        ? "Сборочный цех"
                        : lang === "UA"
                        ? "Складальний цех"
                        : "Factory"}
                    </span>
                  </button>
                  {QUICK_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        setCmdOpen(false);
                        void sendMessage(cmd.prompt[lang]);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-left transition-all group"
                      style={{
                        background: "rgba(0, 255, 65, 0.03)",
                        border: "1px solid rgba(0, 255, 65, 0.18)",
                        borderRadius: "3px",
                        color: "rgba(217, 255, 224, 0.88)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 255, 65, 0.1)";
                        e.currentTarget.style.borderColor =
                          "rgba(0, 255, 65, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 255, 65, 0.03)";
                        e.currentTarget.style.borderColor =
                          "rgba(0, 255, 65, 0.18)";
                      }}
                    >
                      <span
                        className="text-xs leading-tight"
                        style={{ letterSpacing: "0.02em" }}
                      >
                        {cmd.label[lang]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── BOTTOM INPUT BAR ───── */}
      <div
        ref={barRef}
        className="fixed bottom-0 left-0 right-0 z-[499] font-mono"
        style={{
          background: "rgba(4, 2, 8, 0.97)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderTop: `1px solid ${FRAME_BORDER}`,
          boxShadow: "0 -6px 24px rgba(0, 255, 65, 0.12)",
        }}
      >
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2.5 flex items-stretch gap-1.5 sm:gap-3">
          {/* Combined CMD button — also flashes the green activity dot that
              used to live on the removed >_ log toggle. Log опен/тугл
              теперь прячется за "log" button в хедере session-log. */}
          <button
            onClick={() => setCmdOpen((v) => !v)}
            className="relative shrink-0 h-11 px-5 sm:px-6 flex items-center justify-center gap-2 font-mono uppercase"
            style={{
              background: cmdOpen
                ? "#ffb000"
                : "rgba(255, 176, 0, 0.1)",
              border: "1px solid #ffb000",
              color: cmdOpen ? "#040208" : "#ffb000",
              borderRadius: "4px",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textShadow: cmdOpen
                ? "none"
                : "0 0 8px rgba(255, 176, 0, 0.55)",
              boxShadow: cmdOpen
                ? "0 -4px 18px rgba(255, 176, 0, 0.5), 0 0 18px rgba(255, 176, 0, 0.3)"
                : "0 0 16px rgba(255, 176, 0, 0.22), inset 0 0 10px rgba(255, 176, 0, 0.06)",
              transform: cmdOpen ? "translateY(-25%)" : "translateY(0)",
              transition:
                "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.18s, color 0.18s, box-shadow 0.18s",
            }}
            aria-label={cmdOpen ? "Close commands" : "Open commands"}
            aria-expanded={cmdOpen}
          >
            <span>CMD</span>
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: cmdOpen ? 180 : 0 }}
              transition={{ duration: 0.18 }}
            >
              <polyline points="6 15 12 9 18 15" />
            </motion.svg>
            {!cmdOpen && hasActivity && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{
                  background: "#00ff41",
                  boxShadow: "0 0 8px rgba(0, 255, 65, 0.9)",
                }}
              />
            )}
          </button>

          {/* Input */}
          <div
            className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 pl-3 sm:pl-4 pr-2 sm:pr-3 relative"
            style={{
              background: "rgba(0, 255, 65, 0.04)",
              border: "1px solid rgba(0, 255, 65, 0.35)",
              borderRadius: "4px",
              boxShadow: "inset 0 0 14px rgba(0, 255, 65, 0.06)",
            }}
          >
            <span
              className="shrink-0 hidden sm:inline text-[10px] tracking-[0.2em]"
              style={{
                color: "#ffb000",
                textShadow: "0 0 6px rgba(255, 176, 0, 0.5)",
              }}
            >
              QUERY
            </span>
            <div className="relative flex-1 min-w-0">
              {!input && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center"
                  style={{
                    color: "rgba(77, 122, 94, 0.7)",
                    fontSize: "16px",
                    letterSpacing: "0.01em",
                    paddingLeft: 2,
                  }}
                >
                  <span
                    className="mr-2 inline-block align-[-1px]"
                    style={{
                      width: "0.22em",
                      height: "1em",
                      background: "rgba(0, 255, 65, 0.8)",
                      boxShadow: "0 0 8px rgba(0, 255, 65, 0.68)",
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                  <span>{PLACEHOLDER_BY_LANG[lang]}</span>
                </div>
              )}
              <textarea
                ref={inputRef}
                data-chat-input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextarea();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setLogOpen(true)}
                rows={1}
                className="w-full py-2 bg-transparent focus:outline-none resize-none leading-relaxed"
                style={{
                  minHeight: 28,
                  maxHeight: 120,
                  color: "rgba(217, 255, 224, 0.95)",
                  caretColor: "#00ff41",
                  paddingLeft: 2,
                  // iOS Safari zooms into inputs with font-size < 16px. Keep 16px
                  // here to block the zoom, then shrink visually on desktop.
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          {/* PROMPT button */}
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="shrink-0 px-2.5 sm:px-5 h-11 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "rgba(0, 255, 65, 0.2)"
                : "rgba(0, 255, 65, 0.08)",
              border: "1px solid #00ff41",
              color: "#00ff41",
              borderRadius: "4px",
              letterSpacing: "0.15em",
              fontSize: "11px",
              fontWeight: 600,
              textShadow: "0 0 6px rgba(0, 255, 65, 0.6)",
              boxShadow:
                "0 0 14px rgba(0, 255, 65, 0.22), inset 0 0 8px rgba(0, 255, 65, 0.04)",
            }}
            onPointerEnter={(e) => {
              if (e.currentTarget.disabled) return;
              if (e.pointerType !== "mouse") return;
              e.currentTarget.style.background = "#00ff41";
              e.currentTarget.style.color = "#040208";
              e.currentTarget.style.textShadow = "none";
              e.currentTarget.style.boxShadow =
                "0 0 28px rgba(0, 255, 65, 0.55)";
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.background = loading
                ? "rgba(0, 255, 65, 0.2)"
                : "rgba(0, 255, 65, 0.08)";
              e.currentTarget.style.color = "#00ff41";
              e.currentTarget.style.textShadow =
                "0 0 6px rgba(0, 255, 65, 0.6)";
              e.currentTarget.style.boxShadow =
                "0 0 14px rgba(0, 255, 65, 0.22), inset 0 0 8px rgba(0, 255, 65, 0.04)";
            }}
            onPointerCancel={(e) => {
              e.currentTarget.style.background = loading
                ? "rgba(0, 255, 65, 0.2)"
                : "rgba(0, 255, 65, 0.08)";
              e.currentTarget.style.color = "#00ff41";
              e.currentTarget.style.textShadow =
                "0 0 6px rgba(0, 255, 65, 0.6)";
              e.currentTarget.style.boxShadow =
                "0 0 14px rgba(0, 255, 65, 0.22), inset 0 0 8px rgba(0, 255, 65, 0.04)";
            }}
            aria-label="Send prompt"
          >
            {loading ? (
              <motion.div
                className="w-3.5 h-3.5 rounded-full"
                style={{
                  border: "1px solid rgba(0, 255, 65, 0.3)",
                  borderTopColor: "#00ff41",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <span className="hidden sm:inline">PROMPT</span>
                <span
                  className="sm:hidden font-bold"
                  style={{
                    fontSize: "16px",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                  aria-hidden
                >
                  SEND
                </span>
                <span
                  className="hidden sm:inline font-bold text-[15px] leading-none"
                  aria-hidden
                >
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
