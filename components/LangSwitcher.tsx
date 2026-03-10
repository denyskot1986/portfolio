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
          className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
            lang === l
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
              : "text-pink-300/30 hover:text-pink-300/60 border border-transparent"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
