"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTranslatedProduct, getTranslatedProducts } from "@/lib/products-data";
import { i18n } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import LangSwitcher from "@/components/LangSwitcher";
import LiveVitals from "@/components/LiveVitals";
import InlineAgentChat from "@/components/InlineAgentChat";
import type { Lang } from "@/lib/i18n";

function botDeepLink(contact: string, id: string, intent: "buy" | "order"): string {
  const sep = contact.includes("?") ? "&" : "?";
  return `${contact}${sep}start=${intent}_${id}`;
}

function defaultGreeting(name: string, lang: Lang): string {
  switch (lang) {
    case "RU": return `${name} · онлайн. Чем могу помочь?`;
    case "UA": return `${name} · онлайн. Чим можу допомогти?`;
    default:   return `${name} · online. How can I help?`;
  }
}

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function ProductPageClient() {
  const params = useParams();
  const { lang } = useLang();
  const tp = i18n[lang].pages.product;
  const product = getTranslatedProduct(params.id as string, lang);

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-pink-100/80 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">{tp.notFound}</h1>
          <Link href="/" className="text-pink-400/60 hover:text-pink-400 transition-colors">&larr; {i18n[lang].pages.backHome}</Link>
        </div>
      </main>
    );
  }

  const greeting = product.firstMessage?.[lang] ?? defaultGreeting(product.name, lang);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-pink-100/80 overflow-x-hidden">
      {/* LIVE VITALS HUD — fixed, top-right */}
      <LiveVitals slug={product.id} agentName={product.name} />

      {/* NAV */}
      <nav
        style={{ top: "var(--chat-top-h, 34px)" }}
        className="fixed left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg)]/60 border-b border-pink-400/5"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-mono text-pink-400/40 hover:text-pink-400/80 transition-colors">&larr; {i18n[lang].pages.backHome}</Link>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <a href={botDeepLink(product.contact, product.id, "order")} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-pink-400/40 hover:text-pink-400/80 transition-colors">
              {i18n[lang].pages.order} &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* Hero (категория + имя + лицо + tagline + длинное описание) убран
          по запросу Командира — юзер заходит на страницу и сразу видит
          чат с агентом. Всё что нужно — агент сам расскажет в диалоге. */}

      {/* LIVE AGENT CHAT — speak with the agent right on their page */}
      <section id="agent-chat" className="relative z-10 pt-28 pb-10 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fade}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-5 text-center tracking-tight">
              <span className="gradient-text">
                {lang === "RU"
                  ? `Поговори с ${product.name}`
                  : lang === "UA"
                  ? `Поговори з ${product.name}`
                  : `Chat with ${product.name}`}
              </span>
            </h2>
            <InlineAgentChat
              slug={product.id}
              agentName={product.name}
              greeting={greeting}
              lang={lang}
              faceConfig={product.faceConfig}
            />
          </motion.div>
        </div>
      </section>

      {/* Убраны по запросу Командира: «Как это работает» (LiveTerminal),
          «Интерактивное демо» и FEATURES grid — инлайн-чат с агентом
          заменяет это всё, юзер реально общается, а не смотрит демо-лог. */}

      {/* «Применение» (use-cases chips) убран — агент сам рассказывает
          в чате кому он подходит. */}

      {/* ОПИСАНИЕ ТОВАРА — подробное, но БЕЗ техстека/архитектуры.
          Источники: longDescription + features (title/desc) + useCases.
          techStack, внутренняя сборка, конкретные модели/API — НЕ
          показываем (защищаем know-how от конкурентов). */}
      <section className="relative z-10 py-14 px-4 sm:px-6 border-t border-pink-400/5">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fade}>
            <p
              className="text-center text-[10px] uppercase tracking-[0.32em] mb-6 font-mono"
              style={{ color: "rgba(0,255,65,0.55)", textShadow: "0 0 6px rgba(0,255,65,0.3)" }}
            >
              {lang === "RU"
                ? "// описание товара"
                : lang === "UA"
                ? "// опис товару"
                : "// product details"}
            </p>

            <div
              className="font-mono rounded-lg overflow-hidden"
              style={{
                background: "rgba(2,10,4,0.6)",
                border: "1px solid rgba(0,255,65,0.25)",
                boxShadow:
                  "0 0 18px rgba(0,255,65,0.08), inset 0 0 40px rgba(0,255,65,0.03)",
              }}
            >
              {/* header */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase"
                style={{
                  borderBottom: "1px solid rgba(0,255,65,0.25)",
                  color: "rgba(0,255,65,0.7)",
                  letterSpacing: "0.22em",
                  background: "rgba(0,255,65,0.04)",
                }}
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
                <span className="ml-2" style={{ color: "rgba(0,255,65,0.55)" }}>
                  {product.id}.product.md
                </span>
              </div>

              <div className="px-4 sm:px-5 py-5 space-y-5 text-[13.5px] leading-[1.65]" style={{ color: "rgba(217,255,224,0.9)" }}>
                {/* Lead */}
                <p>{product.longDescription}</p>

                {/* Возможности */}
                <div>
                  <p
                    className="text-[10px] uppercase mb-2"
                    style={{ color: "#ffb000", letterSpacing: "0.22em", textShadow: "0 0 6px rgba(255,176,0,0.4)" }}
                  >
                    {lang === "RU"
                      ? "$ capabilities"
                      : lang === "UA"
                      ? "$ capabilities"
                      : "$ capabilities"}
                  </p>
                  <ul className="space-y-2.5">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span
                          className="shrink-0 text-[11px] pt-[3px] tabular-nums"
                          style={{ color: "rgba(0,255,65,0.55)", letterSpacing: "0.1em", width: "2ch" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="shrink-0 pt-0.5" style={{ color: "rgba(0,255,65,0.4)" }}>│</span>
                        <span className="flex-1">
                          <span
                            className="font-semibold"
                            style={{ color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,0.3)" }}
                          >
                            {f.title}
                          </span>
                          <span style={{ color: "rgba(217,255,224,0.65)" }}>{" — "}{f.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Для кого */}
                <div>
                  <p
                    className="text-[10px] uppercase mb-2"
                    style={{ color: "#ffb000", letterSpacing: "0.22em", textShadow: "0 0 6px rgba(255,176,0,0.4)" }}
                  >
                    {lang === "RU"
                      ? "$ fits"
                      : lang === "UA"
                      ? "$ fits"
                      : "$ fits"}
                  </p>
                  <ul className="space-y-1.5">
                    {product.useCases.map((uc, i) => (
                      <li key={i} className="flex gap-2" style={{ color: "rgba(217,255,224,0.75)" }}>
                        <span style={{ color: "rgba(0,255,65,0.55)" }}>→</span>
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Доставка / срок */}
                <div className="pt-2" style={{ borderTop: "1px dashed rgba(0,255,65,0.18)" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6 text-[12px]">
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "rgba(0,255,65,0.55)" }}>
                        {lang === "RU" ? "доставка (шаблон)" : lang === "UA" ? "доставка (шаблон)" : "delivery (template)"}
                      </span>
                      <span className="tabular-nums text-right">{product.deliveryTime.template}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "rgba(0,255,65,0.55)" }}>
                        {lang === "RU" ? "интеграция" : lang === "UA" ? "інтеграція" : "integration"}
                      </span>
                      <span className="tabular-nums text-right">{product.deliveryTime.integration}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "rgba(0,255,65,0.55)" }}>
                        {lang === "RU" ? "доступ" : lang === "UA" ? "доступ" : "access"}
                      </span>
                      <span className="text-right" style={{ color: "rgba(217,255,224,0.75)" }}>
                        Telegram · {lang === "RU" ? "по твоему ID" : lang === "UA" ? "за твоїм ID" : "by your ID"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "rgba(0,255,65,0.55)" }}>
                        {lang === "RU" ? "статус" : lang === "UA" ? "статус" : "status"}
                      </span>
                      <span className="text-right" style={{ color: product.available ? "#00ff41" : "rgba(255,176,0,0.8)" }}>
                        {product.available
                          ? lang === "RU" ? "● live" : lang === "UA" ? "● live" : "● live"
                          : lang === "RU" ? "в разработке" : lang === "UA" ? "у розробці" : "in progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Дисклеймер — защита know-how */}
                <p
                  className="pt-1 text-[10px] italic"
                  style={{ color: "rgba(217,255,224,0.35)", letterSpacing: "0.02em" }}
                >
                  {lang === "RU"
                    ? "* внутренняя архитектура, модели и конфигурация не раскрываются — это авторская сборка Finekot Systems."
                    : lang === "UA"
                    ? "* внутрішня архітектура, моделі та конфігурація не розкриваються — це авторське складання Finekot Systems."
                    : "* internal architecture, models and configuration are proprietary — authored build by Finekot Systems."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade}>
            <p className="text-center text-pink-400/30 text-xs font-mono uppercase tracking-[0.3em] mb-8">{tp.pricing}</p>
            {product.pricing.subscription ? (
              (() => {
                const sub = product.pricing.subscription!;
                const tiers = sub.tiers ?? [
                  { name: "Standard", price: sub.monthly, features: [] },
                ];
                const monthLabel = lang === "RU" ? "мес" : lang === "UA" ? "міс" : "mo";
                const ctaLabel = lang === "RU" ? "Подписаться →" : lang === "UA" ? "Підписатись →" : "Subscribe →";
                return (
                  <div>
                    <div className={`grid grid-cols-1 ${tiers.length >= 3 ? "md:grid-cols-3" : tiers.length === 2 ? "md:grid-cols-2" : ""} gap-4`}>
                      {tiers.map((tier, idx) => {
                        const isFeatured = idx === 1; // middle tier highlighted when 3 tiers
                        return (
                          <div
                            key={tier.name}
                            className={`glass rounded-xl p-6 sm:p-8 text-center ${isFeatured ? "border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.08)]" : ""}`}
                          >
                            {isFeatured && (
                              <div className="flex justify-center mb-3">
                                <span className="text-[10px] px-3 py-1 rounded-full bg-pink-500/15 text-pink-300/60 border border-pink-500/20 font-mono uppercase tracking-wider">
                                  {tp.recommended}
                                </span>
                              </div>
                            )}
                            <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">{tier.name}</p>
                            <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-1">
                              ${tier.price}
                              {tier.price > 0 && <span className="text-base text-pink-100/40 font-normal">/{monthLabel}</span>}
                            </p>
                            <div className="mt-5 mb-6">
                              <ul className="space-y-2 text-sm text-pink-100/40 text-left">
                                {tier.features.map((f, i) => (
                                  <li key={i} className="flex gap-2"><span className={isFeatured ? "text-pink-400" : "text-pink-400/40"}>→</span> {f}</li>
                                ))}
                              </ul>
                            </div>
                            {product.available ? (
                              <a
                                href={botDeepLink(product.contact, product.id, "buy")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-block w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                                  isFeatured
                                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(244,114,182,0.2)]"
                                    : "border border-pink-400/20 text-pink-100/70 hover:bg-pink-400/10 hover:text-pink-100"
                                }`}
                              >
                                {ctaLabel}
                              </a>
                            ) : (
                              <a href="https://t.me/finekot" target="_blank" rel="noopener noreferrer"
                                className="inline-block w-full px-6 py-3 rounded-lg border border-pink-400/20 text-sm font-semibold text-pink-100/70 hover:bg-pink-400/10 hover:text-pink-100 transition-all">
                                Contact @finekot →
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            ) : product.pricing.setup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-6 sm:p-8 text-center">
                  <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">{tp.sourceCode}</p>
                  <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${product.pricing.code}</p>
                  <p className="text-xs text-pink-100/30 mb-5">{tp.getCodeDesc}</p>
                  <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
                    <li className="flex gap-2"><span className="text-pink-400/40">&rarr;</span> {tp.includes.code}</li>
                    <li className="flex gap-2"><span className="text-pink-400/40">&rarr;</span> {tp.includes.docs}</li>
                    <li className="flex gap-2"><span className="text-pink-400/40">&rarr;</span> {tp.includes.autoInstall}</li>
                    <li className="flex gap-2"><span className="text-pink-400/40">&rarr;</span> {tp.includes.updates}</li>
                  </ul>
                  <p className="text-[10px] text-pink-100/20 mb-4">{tp.deliveryTemplate}: {product.deliveryTime.template}</p>
                  {product.available ? (
                    <a href={botDeepLink(product.contact, product.id, "buy")} target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg border border-pink-400/20 text-sm font-semibold text-pink-100/70 hover:bg-pink-400/10 hover:text-pink-100 transition-all">
                      Buy Now &rarr;
                    </a>
                  ) : (
                    <a href="https://t.me/finekot" target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg border border-pink-400/20 text-sm font-semibold text-pink-100/70 hover:bg-pink-400/10 hover:text-pink-100 transition-all">
                      Contact @finekot &rarr;
                    </a>
                  )}
                </div>
                <div className="glass rounded-xl p-6 sm:p-8 text-center border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.08)]">
                  <div className="flex justify-center mb-3">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-pink-500/15 text-pink-300/60 border border-pink-500/20 font-mono uppercase tracking-wider">{tp.recommended}</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${product.pricing.setup}</p>
                  <p className="text-xs text-pink-100/30 mb-5">{tp.setupDesc}</p>
                  <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.everything}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.setup}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.infra}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.support}</li>
                  </ul>
                  <p className="text-[10px] text-pink-100/20 mb-4">{tp.deliveryIntegration}: {product.deliveryTime.integration}</p>
                  {product.available ? (
                    <a href={botDeepLink(product.contact, product.id, "buy")} target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                      Buy Now &rarr;
                    </a>
                  ) : (
                    <a href="https://t.me/finekot" target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                      Contact @finekot &rarr;
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="glass rounded-xl p-6 sm:p-8 text-center border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.08)]">
                  <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-2">${product.pricing.code}</p>
                  <p className="text-xs text-pink-100/30 mb-5">{tp.fullSystem}</p>
                  <ul className="space-y-2 text-sm text-pink-100/40 text-left mb-6">
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.code}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.docs}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.autoInstall}</li>
                    <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.updates}</li>
                  </ul>
                  <p className="text-[10px] text-pink-100/20 mb-4">{tp.deliveryTemplate}: {product.deliveryTime.template}</p>
                  {product.available ? (
                    <a href={botDeepLink(product.contact, product.id, "buy")} target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                      Buy Now &rarr;
                    </a>
                  ) : (
                    <a href="https://t.me/finekot" target="_blank" rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                      Contact @finekot &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* OTHER PRODUCTS */}
      <section className="relative z-10 py-16 px-6 border-t border-pink-400/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-pink-400/30 uppercase tracking-[0.3em] mb-8 font-mono">{tp.otherProducts}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {getTranslatedProducts(lang).filter((p) => p.id !== product.id).map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}
                className="glass rounded-xl p-4 text-center hover:shadow-[0_0_20px_rgba(244,114,182,0.08)] transition-all group">
                <p className="text-xs font-bold text-pink-100/60 group-hover:text-pink-300 transition-colors mb-1">{p.name}</p>
                <p className="text-[10px] text-pink-100/20">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 px-6 border-t border-pink-400/5">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/" className="text-xs text-pink-100/20 hover:text-pink-100/40 transition-colors font-mono">&larr; {i18n[lang].pages.backHome}</Link>
        </div>
      </footer>

    </main>
  );
}
