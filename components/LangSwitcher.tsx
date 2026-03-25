"use client";

import { langs } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";

export default function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div className={`flex gap-1 ${className}`}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all"
          style={
            lang === l
              ? {
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  background: "rgba(244,63,160,0.08)",
                  boxShadow: "0 0 12px rgba(244,63,160,0.15)",
                }
              : {
                  border: "1px solid var(--glass-border)",
                  color: "var(--muted)",
                  background: "transparent",
                }
          }
          onMouseEnter={(e) => {
            if (lang !== l) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
            }
          }}
          onMouseLeave={(e) => {
            if (lang !== l) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
            }
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
