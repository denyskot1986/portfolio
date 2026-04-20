"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { productsData, getTranslatedProduct } from "@/lib/products-data";
import DemoChat from "@/components/DemoChat";
import { getDemoChat } from "@/lib/demo-chats";
import { i18n } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import LangSwitcher from "@/components/LangSwitcher";

function botDeepLink(contact: string, id: string, intent: "buy" | "order"): string {
  const sep = contact.includes("?") ? "&" : "?";
  return `${contact}${sep}start=${intent}_${id}`;
}

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function ProductPageClient() {
  const params = useParams();
  const { lang } = useLang();
  const tp = i18n[lang].pages.product;
  const product = getTranslatedProduct(params.id as string, lang);
  const demo = product ? getDemoChat(product.id, lang) : undefined;

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-pink-100/80 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">{tp.notFound}</h1>
          <Link href="/" className="text-pink-400/60 hover:text-pink-400 transition-colors">&larr; {i18n[lang].pages.backHome}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-pink-100/80 overflow-x-hidden">
      {/* NAV */}
      <nav
        style={{ top: "var(--chat-top-h, 34px)" }}
        className="fixed left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-pink-400/5"
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

      {/* HERO */}
      <section className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{product.category}</p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tight">
              <span className="gradient-text">{product.name}</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-pink-100/50 font-semibold mb-6">{product.tagline}</p>
            <p className="text-pink-100/30 text-base leading-relaxed max-w-3xl mx-auto">{product.longDescription}</p>
          </motion.div>
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade} className="glass rounded-xl p-6 sm:p-10 overflow-x-auto flex justify-center">
            <pre className="diagram text-[10px] md:text-xs text-pink-300/50">{product.diagram}</pre>
          </motion.div>
        </div>
      </section>

      {/* INTERACTIVE DEMO / VIDEO — only render if demo chat or YouTube video exists */}
      {(demo || product.youtubeId) && (
        <section className="relative z-10 py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fade}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 text-center tracking-tight">
                <span className="gradient-text">{demo ? tp.interactiveDemo : tp.howItWorks}</span>
              </h2>
              {demo ? (
                <DemoChat
                  productName={product.name}
                  messages={demo.messages}
                  tryLink={demo.tryLink}
                  tryLabel={demo.tryLabel}
                  lang={lang}
                />
              ) : (
                <div className="glass rounded-xl overflow-hidden aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${product.youtubeId}`}
                    title={`${product.name} — Demo`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              <span className="gradient-text">{tp.features}</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 sm:p-6 group hover:shadow-[0_0_30px_rgba(244,114,182,0.1)] transition-all">
                <p className="text-sm font-bold mb-2 text-pink-100/80 group-hover:text-pink-300 transition-colors">{f.title}</p>
                <p className="text-xs text-pink-100/30 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 text-center tracking-tight">
              <span className="gradient-text">{tp.useCases}</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {product.useCases.map((uc, i) => (
                <span key={i} className="glass rounded-lg px-4 py-2 text-xs text-pink-100/40 font-mono">{uc}</span>
              ))}
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
            {productsData.filter((p) => p.id !== product.id).map((p) => (
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
