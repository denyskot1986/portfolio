"use client";

import V1SystemWindow from "../../components/chat-variants/V1SystemWindow";
import V2HudTactical from "../../components/chat-variants/V2HudTactical";
import V3DataStream from "../../components/chat-variants/V3DataStream";

const variants = [
  {
    id: "v1",
    title: "V1 · System Window",
    blurb: "Полноценное терминальное окно: title bar с процессом, session-info, статус-бар внизу (model · tokens · ↑↓). Плотно, по-хакерски, похоже на IRC / htop.",
    Component: V1SystemWindow,
  },
  {
    id: "v2",
    title: "V2 · HUD Tactical",
    blurb: "Без рамки — только 4 угловых скобки, полупрозрачный фон, amber-сканер сверху. Большая типографика, подчёркивание вместо поля ввода. Sci-fi прицел.",
    Component: V2HudTactical,
  },
  {
    id: "v3",
    title: "V3 · Data Stream",
    blurb: "Tree-лог с ├─ линиями, лёгкий matrix-rain на фоне, однострочный prompt внизу. Читается как live-tail чат-сервера.",
    Component: V3DataStream,
  },
];

export default function ChatPreviewPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="section-label-term">chat-preview</div>
          <h1 className="gradient-text text-3xl md:text-4xl font-bold mb-3">
            3 варианта окна консультанта
          </h1>
          <p className="text-sm" style={{ color: "rgba(217, 255, 224, 0.6)" }}>
            Все в единой terminal-эстетике сайта, но с разным характером. Выбирай — допилю до прода.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {variants.map(({ id, title, blurb, Component }) => (
            <div key={id} className="flex flex-col items-center">
              <div className="mb-4 w-full">
                <div
                  className="text-xs mb-2"
                  style={{ color: "#ffb000", letterSpacing: "0.16em", textShadow: "0 0 6px rgba(255, 176, 0, 0.5)" }}
                >
                  {title}
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "rgba(217, 255, 224, 0.55)" }}
                >
                  {blurb}
                </p>
              </div>
              <div className="flex justify-center">
                <Component />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
