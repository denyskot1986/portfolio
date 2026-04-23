"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CRTBackground } from "../genesis/_shared/CRTBackground";
import { useAnimationClock } from "../genesis/_shared/useClock";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";
import { play as playSfx } from "@/lib/sfx";

/* ═══════════════════════════════════════════════════════════════
   HABITAT — где живут агенты
   Один и тот же агент-сущность мигрирует по 4 «домам»:
   Telegram → Сайт → Голос → Фон → финальный коллаж
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_MS = 16000;

// каждая сцена — [start, end]; финал начинается с T_FINALE
const SCENES: Array<{ id: SceneId; start: number; end: number }> = [
  { id: "telegram", start: 200,   end: 3800 },
  { id: "site",     start: 3800,  end: 7400 },
  { id: "voice",    start: 7400,  end: 11000 },
  { id: "daemon",   start: 11000, end: 14200 },
];
const T_FINALE = 14200;

type SceneId = "telegram" | "site" | "voice" | "daemon";

type Copy = {
  title: string;
  subtitle: string;
  back: string;
  agents: string;
  replay: string;
  exploreHint: string;
  scenes: Record<
    SceneId,
    { home: string; agent: string; line: string; intro: string }
  >;
};

const COPY: Record<Lang, Copy> = {
  EN: {
    title: "HABITAT",
    subtitle: "where Finekot agents live",
    back: "← home",
    agents: "meet the agents →",
    replay: "↺ replay",
    exploreHint: "▸ tap any window to read about that home",
    scenes: {
      telegram: {
        home: "TELEGRAM · personal chat",
        agent: "Boris",
        line: "\"Brother — contract signed ✓\"",
        intro:
          "Boris lives in your private Telegram, on the same line where your friends and family already write. Not a chatbot widget on some site you forget — a contact in the app you check anyway.",
      },
      site: {
        home: "WEBSITE · live nav",
        agent: "David",
        line: "scrolling cart → checkout for you",
        intro:
          "David greets visitors of finekot.shop and walks them through products himself — scrolls, opens, fills the cart. The site is not a static landing — it's a stage David performs on.",
      },
      voice: {
        home: "VOICE · phone call",
        agent: "Ada",
        line: "\"Booked Thursday, 15:00 CET.\"",
        intro:
          "Ada answers the phone in a real voice, takes the booking, and pushes it to your calendar — while you're driving, sleeping, on stage. No \"please leave a message after the beep.\"",
      },
      daemon: {
        home: "BACKGROUND · daemon",
        agent: "Skynet",
        line: "queue: 12 · uptime 99.97%",
        intro:
          "While you sleep — agents work. Triage inbox, log decisions to Notion, sync invoices in Stripe. A 24/7 daemon you don't see, but find the work already done in the morning.",
      },
    },
  },
  RU: {
    title: "HABITAT",
    subtitle: "где живут агенты Finekot",
    back: "← главная",
    agents: "к агентам →",
    replay: "↺ replay",
    exploreHint: "▸ ткни на любое окно — прочитаешь про этот дом",
    scenes: {
      telegram: {
        home: "TELEGRAM · личный чат",
        agent: "Борис",
        line: "«Брат — договор подписали ✓»",
        intro:
          "Борис живёт в твоём личном Telegram, на той же дистанции что друзья и семья. Не виджет на сайте, который ты забываешь, — контакт в мессенджере, который ты и так открываешь сто раз в день.",
      },
      site: {
        home: "САЙТ · ведёт навигацию",
        agent: "Давид",
        line: "скроллит корзину → оформляет заказ",
        intro:
          "Давид встречает гостей finekot.shop и сам проводит экскурсию по товарам — скроллит, открывает, наполняет корзину. Сайт здесь не лендинг, а сцена, на которой работает Давид.",
      },
      voice: {
        home: "ГОЛОС · звонок",
        agent: "Ada",
        line: "«Забронировала четверг, 15:00 CET.»",
        intro:
          "Ada берёт трубку живым голосом, принимает запись и кладёт её в твой календарь — пока ты за рулём, на сцене или спишь. Никакого «оставьте сообщение после сигнала».",
      },
      daemon: {
        home: "ФОН · daemon",
        agent: "Skynet",
        line: "очередь: 12 · аптайм 99.97%",
        intro:
          "Пока ты спишь — агенты работают. Разбирают инбокс, фиксируют решения в Notion, сводят счета в Stripe. 24/7 daemon, которого ты не видишь, но утром находишь работу уже сделанной.",
      },
    },
  },
  UA: {
    title: "HABITAT",
    subtitle: "де живуть агенти Finekot",
    back: "← головна",
    agents: "до агентів →",
    replay: "↺ replay",
    exploreHint: "▸ тицьни на будь-яке вікно — прочитаєш про цей дім",
    scenes: {
      telegram: {
        home: "TELEGRAM · особистий чат",
        agent: "Борис",
        line: "«Брате — договір підписали ✓»",
        intro:
          "Борис живе у твоєму особистому Telegram, на тій же дистанції, що друзі й родина. Не віджет на сайті, який ти забуваєш, — контакт у месенджері, який ти й так відкриваєш сто разів на день.",
      },
      site: {
        home: "САЙТ · веде навігацію",
        agent: "Давід",
        line: "гортає кошик → оформлює замовлення",
        intro:
          "Давід зустрічає гостей finekot.shop і сам водить екскурсію по товарах — гортає, відкриває, наповнює кошик. Сайт тут не лендінг, а сцена, на якій працює Давід.",
      },
      voice: {
        home: "ГОЛОС · дзвінок",
        agent: "Ada",
        line: "«Забронювала четвер, 15:00 CET.»",
        intro:
          "Ada бере слухавку живим голосом, приймає запис і кладе його у твій календар — поки ти за кермом, на сцені або спиш. Жодного «залиште повідомлення після сигналу».",
      },
      daemon: {
        home: "ФОН · daemon",
        agent: "Skynet",
        line: "черга: 12 · аптайм 99.97%",
        intro:
          "Поки ти спиш — агенти працюють. Розбирають інбокс, фіксують рішення в Notion, зводять рахунки у Stripe. 24/7 daemon, якого ти не бачиш, але вранці знаходиш роботу вже зробленою.",
      },
    },
  },
};

function activeScene(t: number): SceneId | "finale" | null {
  if (t >= T_FINALE) return "finale";
  for (const s of SCENES) {
    if (t >= s.start && t < s.end) return s.id;
  }
  return null;
}

/* ────────────── SCENE COMPONENTS ────────────── */

type SceneInteractProps = { onClick?: () => void; selected?: boolean };

function TelegramScene({
  active,
  c,
  onClick,
  selected,
}: { active: boolean; c: Copy["scenes"]["telegram"] } & SceneInteractProps) {
  return (
    <SceneFrame
      active={active}
      tint="#229ED9"
      title="t.me/borya"
      chrome="tg"
      label={c.home}
      onClick={onClick}
      selected={selected}
    >
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold"
            style={{
              background: "linear-gradient(135deg, #229ED9, #1a7fb3)",
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            }}
          >
            Б
          </div>
          <div className="flex flex-col leading-tight">
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{c.agent}</span>
            <motion.span
              style={{ color: "#7ec3e8", fontSize: 10 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              печатает…
            </motion.span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="self-start max-w-[88%] px-3 py-2 rounded-xl rounded-bl-sm"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(34,158,217,0.4)",
            color: "#e7f4fc",
            fontSize: 12.5,
            lineHeight: 1.4,
          }}
        >
          {c.line}
        </motion.div>
      </div>
    </SceneFrame>
  );
}

function SiteScene({
  active,
  c,
  onClick,
  selected,
}: { active: boolean; c: Copy["scenes"]["site"] } & SceneInteractProps) {
  return (
    <SceneFrame
      active={active}
      tint="#00ff41"
      title="finekot.shop"
      chrome="browser"
      label={c.home}
      onClick={onClick}
      selected={selected}
    >
      <div className="relative h-full overflow-hidden">
        {/* fake page rows the agent "scrolls" past */}
        <motion.div
          className="absolute inset-x-0 top-0 px-3 py-2 flex flex-col gap-1.5"
          initial={{ y: 0 }}
          animate={{ y: -38 }}
          transition={{ delay: 0.4, duration: 1.6, ease: "easeInOut" }}
        >
          {["BORIS · $149/mo", "ADA · $199/mo", "DAVID · $99/mo", "REELS · $79/mo"].map((row, i) => (
            <div
              key={row}
              className="px-2 py-1.5 rounded-sm flex items-center justify-between"
              style={{
                background: i === 2 ? "rgba(0,255,65,0.16)" : "rgba(0,255,65,0.04)",
                border: `1px solid ${i === 2 ? "rgba(0,255,65,0.7)" : "rgba(0,255,65,0.2)"}`,
                color: i === 2 ? "#aaffba" : "rgba(217,255,224,0.7)",
                fontSize: 10,
                letterSpacing: "0.05em",
              }}
            >
              <span>{row}</span>
              {i === 2 && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ color: "#00ff41" }}
                >
                  ▸ click
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-[9px]"
          style={{
            background: "rgba(0,255,65,0.08)",
            borderTop: "1px solid rgba(0,255,65,0.3)",
            color: "#aaffba",
            letterSpacing: "0.12em",
          }}
        >
          ● {c.agent} — {c.line}
        </div>
      </div>
    </SceneFrame>
  );
}

function VoiceScene({
  active,
  c,
  onClick,
  selected,
}: { active: boolean; c: Copy["scenes"]["voice"] } & SceneInteractProps) {
  const bars = 22;
  return (
    <SceneFrame
      active={active}
      tint="#ffb000"
      title="incoming · Ada"
      chrome="phone"
      label={c.home}
      onClick={onClick}
      selected={selected}
    >
      <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #ffb000, #d98700)",
            color: "#040208",
            fontWeight: 700,
            fontSize: 22,
            boxShadow: "0 0 24px rgba(255,176,0,0.5)",
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          A
        </motion.div>
        <span style={{ color: "#ffd88a", fontSize: 12, letterSpacing: "0.1em" }}>
          {c.agent} · 02:14
        </span>
        {/* voice waveform */}
        <div className="flex items-end gap-[2px] h-7">
          {Array.from({ length: bars }).map((_, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-sm"
              style={{ background: "#ffb000" }}
              animate={{
                height: [
                  4 + ((i * 13) % 18),
                  6 + ((i * 7) % 22),
                  3 + ((i * 19) % 14),
                ],
              }}
              transition={{
                duration: 0.7 + ((i % 5) * 0.1),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="px-3 py-1.5 rounded-md"
          style={{
            background: "rgba(255,176,0,0.1)",
            border: "1px solid rgba(255,176,0,0.4)",
            color: "#ffd88a",
            fontSize: 11.5,
          }}
        >
          {c.line}
        </motion.div>
      </div>
    </SceneFrame>
  );
}

function DaemonScene({
  active,
  c,
  onClick,
  selected,
}: { active: boolean; c: Copy["scenes"]["daemon"] } & SceneInteractProps) {
  const lines = [
    "[00:00] cron · ada.process_inbox()",
    "[00:01] tool=gmail · 4 unread → triage",
    "[00:02] tool=notion · log_decision(→Q3)",
    "[00:03] tool=stripe · sync_invoices(7)",
    "[00:04] heartbeat · ok · queue=12",
  ];
  return (
    <SceneFrame
      active={active}
      tint="#9d4edd"
      title="systemd · ada.service"
      chrome="server"
      label={c.home}
      onClick={onClick}
      selected={selected}
    >
      <div className="relative h-full flex flex-col p-3 gap-2">
        <div className="flex items-center gap-2 text-[10px]" style={{ color: "#c9a3f0", letterSpacing: "0.1em" }}>
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: "#9d4edd", boxShadow: "0 0 8px #9d4edd" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span>{c.agent.toUpperCase()} · ACTIVE</span>
          <span className="ml-auto" style={{ opacity: 0.6 }}>{c.line}</span>
        </div>
        <div className="flex-1 font-mono text-[9.5px] leading-[1.5] overflow-hidden" style={{ color: "rgba(217,200,250,0.85)" }}>
          {lines.map((l, i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.35, duration: 0.25 }}
              className="whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {l}
            </motion.div>
          ))}
        </div>
      </div>
    </SceneFrame>
  );
}

/* ────────────── shared scene frame (window chrome) ────────────── */

function SceneFrame({
  active,
  tint,
  title,
  chrome,
  label,
  children,
  onClick,
  selected,
}: {
  active: boolean;
  tint: string;
  title: string;
  chrome: "tg" | "browser" | "phone" | "server";
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const lit = active || selected;
  return (
    <motion.div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="relative w-full h-full overflow-hidden font-mono"
      style={{
        background: "rgba(8, 6, 14, 0.92)",
        border: `1px solid ${selected ? tint : lit ? tint : `${tint}55`}`,
        borderRadius: 8,
        boxShadow: selected
          ? `0 0 44px ${tint}88, inset 0 0 32px ${tint}18`
          : lit
          ? `0 0 32px ${tint}55, inset 0 0 24px ${tint}10`
          : `0 0 6px ${tint}22`,
        transition: "border-color 0.4s, box-shadow 0.4s",
        cursor: onClick ? "pointer" : undefined,
      }}
      animate={{ scale: lit ? 1 : 0.97, opacity: lit ? 1 : 0.55 }}
      transition={{ duration: 0.4 }}
    >
      {/* window chrome */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5"
        style={{
          background: `linear-gradient(180deg, ${tint}18, transparent)`,
          borderBottom: `1px solid ${tint}33`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#28c840" }} />
        <span
          className="ml-1 text-[9px] tracking-widest uppercase"
          style={{ color: tint, opacity: 0.85 }}
        >
          {chrome === "tg" && "▲ telegram"}
          {chrome === "browser" && "◐ browser"}
          {chrome === "phone" && "☏ call"}
          {chrome === "server" && "◧ systemd"}
        </span>
        <span className="ml-auto text-[9px]" style={{ color: `${tint}cc`, opacity: 0.7 }}>
          {title}
        </span>
      </div>
      {/* scene body */}
      <div className="absolute top-[28px] left-0 right-0 bottom-[18px] overflow-hidden">{children}</div>
      {/* footer label */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2.5 py-1 text-[8.5px] tracking-[0.18em]"
        style={{
          background: `${tint}10`,
          borderTop: `1px solid ${tint}25`,
          color: `${tint}cc`,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

/* ────────────── PAGE ────────────── */

export default function HabitatPage() {
  const { lang } = useLang();
  const c = COPY[lang];
  const { t, replay } = useAnimationClock(TOTAL_MS);

  const cur = activeScene(t);
  const isFinale = cur === "finale";
  const sec = Math.min(16, Math.floor(t / 1000));

  // After the timed beat ends, the user explores by clicking. `selected`
  // is the scene the user picked (only meaningful in finale phase).
  // Reset on replay so a new run starts clean.
  const [selected, setSelected] = useState<SceneId | null>(null);
  useEffect(() => {
    if (!isFinale) setSelected(null);
  }, [isFinale]);

  // What the bottom info card describes:
  // - during the timed run → the scene currently playing
  // - in finale, before pick → no card (just hint)
  // - in finale, after pick → the picked scene
  let focused: SceneId | null = null;
  if (isFinale) {
    focused = selected;
  } else if (cur) {
    // TS narrows cur to SceneId here — the "finale" branch is taken above.
    focused = cur as SceneId;
  }

  return (
    <main
      className="fixed inset-0 text-[#00ff41] font-mono overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, rgba(20, 0, 40, 0.4) 0%, rgba(4, 2, 8, 1) 70%)",
      }}
    >
      <CRTBackground />

      {/* HUD — top bar with prominent nav buttons + animation counter.
          Lives just below the global chat top chrome (z-499) so it's not
          clipped; raised z to 500 to sit above the chrome on accidental
          overlap. */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 65, 0.18)";
            e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.85)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 65, 0.08)";
            e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.5)";
          }}
        >
          {c.back}
        </Link>

        <span className="hidden sm:inline-block flex-1 text-center text-[10px] sm:text-xs opacity-60 tracking-widest font-mono">
          {c.title} · {String(sec).padStart(2, "0")}s / 16s
        </span>

        <button
          onClick={replay}
          className="font-mono uppercase transition-all px-2.5 py-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] hidden sm:inline-flex items-center gap-1"
          style={{
            color: "rgba(255, 255, 255, 0.55)",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffb000";
            e.currentTarget.style.borderColor = "rgba(255, 176, 0, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.55)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
          }}
        >
          {c.replay}
        </button>

        <Link
          href="/#product-boris"
          className="font-mono uppercase transition-all px-3 py-1.5 text-[10px] sm:text-[11px] tracking-[0.18em] flex items-center gap-1.5"
          style={{
            color: "#ffb000",
            background: "rgba(255, 176, 0, 0.1)",
            border: "1px solid rgba(255, 176, 0, 0.55)",
            borderRadius: 4,
            textShadow: "0 0 8px rgba(255, 176, 0, 0.6)",
            boxShadow: "0 0 14px rgba(255, 176, 0, 0.22)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 176, 0, 0.22)";
            e.currentTarget.style.borderColor = "rgba(255, 176, 0, 0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 176, 0, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 176, 0, 0.55)";
          }}
        >
          {c.agents}
        </Link>
      </div>

      {/* Title strip — sits below the HUD button row */}
      <div
        className="absolute left-0 right-0 z-20 text-center px-4"
        style={{ top: "calc(var(--chat-top-h, 34px) + 56px)" }}
      >
        <div
          className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase"
          style={{ color: "#ffb000", textShadow: "0 0 8px rgba(255,176,0,0.4)" }}
        >
          // {c.subtitle}
        </div>
      </div>

      {/* 2×2 GRID OF HOMES */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-20 pb-24">
        <div
          className="relative grid grid-cols-2 grid-rows-2 gap-3 sm:gap-5"
          style={{
            width: "min(840px, 100%)",
            height: "min(540px, 70vh)",
          }}
        >
          <TelegramScene
            active={cur === "telegram" || isFinale}
            c={c.scenes.telegram}
            onClick={isFinale ? () => { playSfx("tap"); setSelected("telegram"); } : undefined}
            selected={selected === "telegram"}
          />
          <SiteScene
            active={cur === "site" || isFinale}
            c={c.scenes.site}
            onClick={isFinale ? () => { playSfx("tap"); setSelected("site"); } : undefined}
            selected={selected === "site"}
          />
          <VoiceScene
            active={cur === "voice" || isFinale}
            c={c.scenes.voice}
            onClick={isFinale ? () => { playSfx("tap"); setSelected("voice"); } : undefined}
            selected={selected === "voice"}
          />
          <DaemonScene
            active={cur === "daemon" || isFinale}
            c={c.scenes.daemon}
            onClick={isFinale ? () => { playSfx("tap"); setSelected("daemon"); } : undefined}
            selected={selected === "daemon"}
          />
        </div>
      </div>

      {/* INFO CARD — floats ABOVE the grid like a tooltip / function
          description, well clear of the chat bar at the bottom. Closeable
          by tapping the × or by clicking another window (focus swaps). */}
      <div
        className="absolute left-0 right-0 z-[400] px-4 flex justify-center pointer-events-none"
        style={{ bottom: "calc(var(--chat-bar-h, 72px) + 18px)" }}
      >
        <AnimatePresence mode="wait">
          {focused ? (
            <motion.div
              key={`info-${focused}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="relative px-4 sm:px-5 py-3 sm:py-3.5 backdrop-blur-lg pointer-events-auto"
              style={{
                maxWidth: 620,
                background: "rgba(4, 2, 8, 0.92)",
                border: "1px solid rgba(255,176,0,0.55)",
                borderRadius: 10,
                boxShadow:
                  "0 12px 48px rgba(0,0,0,0.6), 0 0 32px rgba(255,176,0,0.25)",
              }}
            >
              {/* close button — only useful in finale where the user picked */}
              {isFinale && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="absolute top-1.5 right-2 w-6 h-6 flex items-center justify-center text-base leading-none"
                  style={{
                    color: "rgba(255,176,0,0.7)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ffb000")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,176,0,0.7)")
                  }
                >
                  ×
                </button>
              )}
              <div
                className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase mb-1.5 pr-6"
                style={{
                  color: "#ffb000",
                  textShadow: "0 0 6px rgba(255,176,0,0.4)",
                }}
              >
                ▸ {c.scenes[focused].home}
                <span style={{ opacity: 0.6 }}> · {c.scenes[focused].agent}</span>
              </div>
              <div
                className="text-[12px] sm:text-[13px]"
                style={{
                  color: "rgba(217,255,224,0.94)",
                  lineHeight: 1.55,
                }}
              >
                {c.scenes[focused].intro}
              </div>
            </motion.div>
          ) : isFinale ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="px-4 py-2 backdrop-blur-md pointer-events-auto"
              style={{
                background: "rgba(4, 2, 8, 0.7)",
                border: "1px solid rgba(255,176,0,0.35)",
                borderRadius: 999,
                color: "rgba(255,176,0,0.9)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(255,176,0,0.35)",
              }}
            >
              {c.exploreHint}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
