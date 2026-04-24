"use client";

import { useEffect, useState } from "react";
import LensWarp from "../../components/LensWarp";

type Preset = { label: string; s: number; c: number; hint: string };

const PRESETS: Preset[] = [
  { label: "Off",         s: 0,   c: 2.0, hint: "оригинал, без искажения" },
  { label: "Subtle",      s: 25,  c: 2.2, hint: "лёгкая выпуклость, едва заметно" },
  { label: "Convex",      s: 60,  c: 2.0, hint: "выпуклый экран — основной вариант" },
  { label: "CRT",         s: 110, c: 2.2, hint: "старый кинескоп, сильный bulge" },
  { label: "Fishbowl",    s: 200, c: 1.4, hint: "fish-eye, экстрим" },
];

const SOURCES = [
  { label: "Главная",    src: "/" },
  { label: "Factory",    src: "/factory" },
  { label: "Habitat",    src: "/habitat" },
  { label: "Genesis",    src: "/genesis" },
  { label: "Products",   src: "/products" },
];

export default function LensDemo() {
  const [presetIdx, setPresetIdx] = useState(2);
  const [custom, setCustom] = useState<{ s: number; c: number } | null>(null);
  const [srcIdx, setSrcIdx] = useState(0);
  const [vignette, setVignette] = useState(true);
  const [scanlines, setScanlines] = useState(false);

  const cfg = custom ?? { s: PRESETS[presetIdx].s, c: PRESETS[presetIdx].c };

  // На /lens свой layout — обнуляем body-padding, который добавляет ChatbotBar.
  useEffect(() => {
    const root = document.documentElement;
    const prevTop = root.style.getPropertyValue("--chat-top-h");
    const prevBot = root.style.getPropertyValue("--chat-bar-h");
    root.style.setProperty("--chat-top-h", "0px");
    root.style.setProperty("--chat-bar-h", "0px");
    return () => {
      root.style.setProperty("--chat-top-h", prevTop || "34px");
      root.style.setProperty("--chat-bar-h", prevBot || "72px");
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/40">
      {/* Control bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-xs">
          <span className="font-mono text-[11px] tracking-widest text-pink-400">
            LENS · CONVEX SCREEN
          </span>

          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p, i) => {
              const active = !custom && i === presetIdx;
              return (
                <button
                  key={p.label}
                  onClick={() => { setPresetIdx(i); setCustom(null); }}
                  title={p.hint}
                  className={
                    "rounded-full border px-3 py-1 transition " +
                    (active
                      ? "border-pink-500 bg-pink-500 text-black"
                      : "border-white/15 text-white/70 hover:border-white/40 hover:text-white")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-white/60">
              <span className="w-20 text-right font-mono">strength</span>
              <input
                type="range" min={0} max={250} value={cfg.s}
                onChange={(e) => setCustom({ ...cfg, s: +e.target.value })}
                className="w-32 accent-pink-500"
              />
              <span className="w-10 font-mono text-white">{cfg.s}px</span>
            </label>
            <label className="flex items-center gap-2 text-white/60">
              <span className="w-20 text-right font-mono">curvature</span>
              <input
                type="range" min={1} max={3} step={0.1} value={cfg.c}
                onChange={(e) => setCustom({ ...cfg, c: +e.target.value })}
                className="w-24 accent-pink-500"
              />
              <span className="w-10 font-mono text-white">{cfg.c.toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1 text-white/70">
              <input type="checkbox" checked={vignette} onChange={(e) => setVignette(e.target.checked)} className="accent-pink-500" />
              vignette
            </label>
            <label className="flex items-center gap-1 text-white/70">
              <input type="checkbox" checked={scanlines} onChange={(e) => setScanlines(e.target.checked)} className="accent-pink-500" />
              scanlines
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 text-xs">
          <span className="font-mono text-white/40">source</span>
          {SOURCES.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setSrcIdx(i)}
              className={
                "rounded px-2 py-0.5 transition " +
                (srcIdx === i
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white")
              }
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-white/30">
            {custom ? "custom" : PRESETS[presetIdx].hint}
          </span>
        </div>
      </header>

      {/* Stage */}
      <main className="relative h-screen pt-[92px]">
        <div className="relative h-full w-full overflow-hidden bg-white">
          <LensWarp strength={cfg.s} curvature={cfg.c} className="h-full w-full">
            <iframe
              key={SOURCES[srcIdx].src}
              src={SOURCES[srcIdx].src}
              className="h-full w-full border-0 bg-white"
              title="lens preview"
            />
          </LensWarp>

          {vignette && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 88%, rgba(0,0,0,0.85) 100%)",
                mixBlendMode: "multiply",
              }}
            />
          )}

          {scanlines && (
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 3px)",
                mixBlendMode: "multiply",
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
