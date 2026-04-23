"use client";

// Tiny synthesized SFX layer — no audio files, no CDN, no autoplay
// permission dance. Each call schedules a short envelope on a freshly
// created OscillatorNode. Sound is OFF by default; the user opts in
// via the CMD menu and the choice persists in localStorage.

const STORAGE_KEY = "finekot-sfx";

type SfxName = "tick" | "blip" | "beep" | "tap";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.12; // global ceiling — keeps everything tasteful
  masterGain.connect(ctx.destination);
  return ctx;
}

export function isSfxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setSfxEnabled(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
  // Resume the audio graph on opt-in so the first sound after the toggle
  // actually plays (browsers suspend it until a user gesture).
  if (on) {
    const c = ensureCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }
}

export function play(name: SfxName): void {
  if (!isSfxEnabled()) return;
  const c = ensureCtx();
  if (!c || !masterGain) return;
  if (c.state === "suspended") c.resume().catch(() => {});

  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  // Per-effect envelope. Numbers are deliberately small — these read as
  // UI feedback, not as music.
  switch (name) {
    case "tick": {
      // Short keystroke / typewriter click.
      osc.type = "square";
      osc.frequency.setValueAtTime(2200, now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }
    case "blip": {
      // Soft message-sent confirmation.
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.07);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case "beep": {
      // Agent take-over — a slightly more present, two-tone alert.
      osc.type = "triangle";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(990, now + 0.08);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.24);
      break;
    }
    case "tap": {
      // Generic UI tap — used on chips, scene clicks etc.
      osc.type = "sine";
      osc.frequency.setValueAtTime(1320, now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    }
  }
}
