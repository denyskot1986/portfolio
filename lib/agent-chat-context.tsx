"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  replies?: string[];
}

export interface AgentFaceConfig {
  eyeStyle?: "round" | "slit";
  antennaColor?: string;
  extra?: "scanner" | "cross" | "feather" | "dual-mouth" | "none";
}

export interface ActiveAgent {
  id: string;
  name: string;
  activatedAt: number;
  unread: number;
  messages: ChatMessage[];
  sessionId: string;
  faceConfig?: AgentFaceConfig;
}

interface AgentChatState {
  agents: ActiveAgent[];
  currentAgentId: string | null;
}

interface AgentChatContextValue extends AgentChatState {
  activate: (input: {
    id: string;
    name: string;
    faceConfig?: AgentFaceConfig;
  }) => void;
  select: (id: string | null) => void;
  setAgentMessages: (id: string | null, messages: ChatMessage[]) => void;
  appendToAgent: (id: string | null, msg: ChatMessage) => void;
  clearUnread: (id: string) => void;
  dismiss: (id: string) => void;
  currentAgent: ActiveAgent | null;
}

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

const STORAGE_KEY = "finekot.agentChat.v1";
const MAX_MSGS_PER_AGENT = 60;

function loadFromStorage(): AgentChatState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rawAgents = Array.isArray(parsed.agents) ? parsed.agents : [];
    const agents: ActiveAgent[] = [];
    for (const a of rawAgents) {
      if (!a || typeof a !== "object") continue;
      const { id, name, activatedAt, unread, messages, sessionId, faceConfig } = a as ActiveAgent;
      if (typeof id !== "string" || typeof name !== "string") continue;
      agents.push({
        id,
        name,
        activatedAt: typeof activatedAt === "number" ? activatedAt : Date.now(),
        unread: typeof unread === "number" ? unread : 0,
        messages: Array.isArray(messages)
          ? messages
              .filter(
                (m): m is ChatMessage =>
                  !!m &&
                  typeof m === "object" &&
                  (m.role === "user" || m.role === "assistant") &&
                  typeof m.content === "string"
              )
              .slice(-MAX_MSGS_PER_AGENT)
          : [],
        sessionId: typeof sessionId === "string" ? sessionId : freshSession(),
        faceConfig:
          faceConfig && typeof faceConfig === "object" ? faceConfig : undefined,
      });
    }
    const currentAgentId =
      typeof parsed.currentAgentId === "string"
        ? parsed.currentAgentId
        : null;
    return { agents, currentAgentId };
  } catch {
    return null;
  }
}

function freshSession(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function AgentChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AgentChatState>(() => ({
    agents: [],
    currentAgentId: null,
  }));
  // Hydrate after mount — localStorage is not available during SSR.
  const hydrated = useRef(false);
  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) setState(loaded);
    hydrated.current = true;
  }, []);

  // Persist whenever state changes (post-hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota / disabled — ignore
    }
  }, [state]);

  const activate = useCallback<AgentChatContextValue["activate"]>(({ id, name, faceConfig }) => {
    setState((prev) => {
      const existing = prev.agents.find((a) => a.id === id);
      if (existing) {
        // Already activated. If user isn't currently looking at this
        // agent's chat, bump the unread badge so they notice.
        if (prev.currentAgentId === id) return prev;
        return {
          ...prev,
          agents: prev.agents.map((a) =>
            a.id === id ? { ...a, unread: a.unread + 1, faceConfig: faceConfig ?? a.faceConfig } : a
          ),
        };
      }
      const fresh: ActiveAgent = {
        id,
        name,
        activatedAt: Date.now(),
        unread: 1,
        messages: [],
        sessionId: freshSession(),
        faceConfig,
      };
      return { ...prev, agents: [...prev.agents, fresh] };
    });
  }, []);

  const select = useCallback<AgentChatContextValue["select"]>((id) => {
    setState((prev) => {
      if (prev.currentAgentId === id) return prev;
      if (id === null) return { ...prev, currentAgentId: null };
      if (!prev.agents.find((a) => a.id === id)) return prev;
      return {
        ...prev,
        currentAgentId: id,
        agents: prev.agents.map((a) => (a.id === id ? { ...a, unread: 0 } : a)),
      };
    });
  }, []);

  const setAgentMessages = useCallback<AgentChatContextValue["setAgentMessages"]>((id, messages) => {
    if (id === null) return;
    setState((prev) => ({
      ...prev,
      agents: prev.agents.map((a) =>
        a.id === id ? { ...a, messages: messages.slice(-MAX_MSGS_PER_AGENT) } : a
      ),
    }));
  }, []);

  const appendToAgent = useCallback<AgentChatContextValue["appendToAgent"]>((id, msg) => {
    if (id === null) return;
    setState((prev) => ({
      ...prev,
      agents: prev.agents.map((a) =>
        a.id === id
          ? { ...a, messages: [...a.messages, msg].slice(-MAX_MSGS_PER_AGENT) }
          : a
      ),
    }));
  }, []);

  const clearUnread = useCallback<AgentChatContextValue["clearUnread"]>((id) => {
    setState((prev) => ({
      ...prev,
      agents: prev.agents.map((a) => (a.id === id ? { ...a, unread: 0 } : a)),
    }));
  }, []);

  const dismiss = useCallback<AgentChatContextValue["dismiss"]>((id) => {
    setState((prev) => ({
      agents: prev.agents.filter((a) => a.id !== id),
      currentAgentId: prev.currentAgentId === id ? null : prev.currentAgentId,
    }));
  }, []);

  const currentAgent = useMemo(
    () => state.agents.find((a) => a.id === state.currentAgentId) ?? null,
    [state.agents, state.currentAgentId]
  );

  const value: AgentChatContextValue = {
    ...state,
    activate,
    select,
    setAgentMessages,
    appendToAgent,
    clearUnread,
    dismiss,
    currentAgent,
  };

  return (
    <AgentChatContext.Provider value={value}>{children}</AgentChatContext.Provider>
  );
}

export function useAgentChat(): AgentChatContextValue {
  const ctx = useContext(AgentChatContext);
  if (!ctx) {
    throw new Error("useAgentChat must be used inside <AgentChatProvider>");
  }
  return ctx;
}
