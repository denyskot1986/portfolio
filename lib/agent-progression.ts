"use client";

// Персистентный state прогрессии знакомства с агентами.
// Хранится в localStorage на клиенте — у нас нет аккаунтов, привязка к
// конкретному браузеру. Юзер посетил /products/{slug} → агент «разблокирован»,
// аватарка в AgentDock зажигается; если юзер давно не заходил, idle-tick
// накидывает +1 «непрочитанного» сообщения случайному разблокированному агенту
// (мягкий re-engagement). При заходе на карточку unread сбрасывается.

const VISITED_KEY = "finekot.agents.visited";
const UNREAD_KEY = "finekot.agents.unread";
const LAST_TICK_KEY = "finekot.agents.lastTick";

export type ProgressionSnapshot = {
  visited: Set<string>;
  unread: Record<string, number>;
};

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode — молча */
  }
}

export function readVisited(): Set<string> {
  const raw = safeGet(VISITED_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((s): s is string => typeof s === "string"));
  } catch {
    return new Set();
  }
}

export function readUnread(): Record<string, number> {
  const raw = safeGet(UNREAD_KEY);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "number" && v > 0) out[k] = Math.min(v, 99);
    }
    return out;
  } catch {
    return {};
  }
}

function writeVisited(v: Set<string>): void {
  safeSet(VISITED_KEY, JSON.stringify([...v]));
}

function writeUnread(u: Record<string, number>): void {
  safeSet(UNREAD_KEY, JSON.stringify(u));
}

// Событие для ре-рендера AgentDock'а при изменениях из разных табов/мест.
const EVT = "finekot:agents:progression";

function broadcast(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVT));
}

export function subscribeProgression(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  // storage event — сквозная синхронизация между вкладками
  const storageHandler = (e: StorageEvent) => {
    if (e.key === VISITED_KEY || e.key === UNREAD_KEY) cb();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function markVisited(slug: string): void {
  const v = readVisited();
  if (v.has(slug)) return;
  v.add(slug);
  writeVisited(v);
  broadcast();
}

export function clearUnread(slug: string): void {
  const u = readUnread();
  if (!u[slug]) return;
  delete u[slug];
  writeUnread(u);
  broadcast();
}

export function bumpUnread(slug: string, by = 1): void {
  const u = readUnread();
  u[slug] = Math.min(99, (u[slug] || 0) + by);
  writeUnread(u);
  broadcast();
}

// Idle-tick: раз в interval бросает +1 unread случайному уже разблокированному
// агенту (если такие есть и прошло достаточно времени с прошлого тика).
// Вызывается один раз из AgentDock'а.
export function maybeTickUnread(pool: string[]): void {
  if (pool.length === 0) return;
  const visited = readVisited();
  const candidates = pool.filter((slug) => visited.has(slug));
  if (candidates.length === 0) return;

  const now = Date.now();
  const rawLast = safeGet(LAST_TICK_KEY);
  const last = rawLast ? Number(rawLast) : 0;
  // Минимум 90 сек между тиками, чтобы не спамить. Randomize чтобы не было
  // предсказуемо.
  const minGap = 90_000 + Math.floor(Math.random() * 60_000);
  if (now - last < minGap) return;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  bumpUnread(pick, 1);
  safeSet(LAST_TICK_KEY, String(now));
}

export function totalUnread(): number {
  const u = readUnread();
  return Object.values(u).reduce((a, b) => a + b, 0);
}
