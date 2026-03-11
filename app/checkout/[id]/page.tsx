"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { getProductById } from "@/lib/products-data";
import { i18n } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import LangSwitcher from "@/components/LangSwitcher";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const USDC_ADDRESS = "0x6b55152939088C088fbE931Ae8809D6fe42d5E10";

export default function CheckoutPage() {
  const params = useParams();
  const { lang } = useLang();
  const tc = i18n[lang].pages.checkout;
  const tp = i18n[lang].pages.product;
  const product = getProductById(params.id as string);
  const [plan, setPlan] = useState<"code" | "setup">("code");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ status: "success" | "error" | "pending"; message: string } | null>(null);

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-pink-100/80 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">{tc.notFound}</h1>
          <Link href="/" className="text-pink-400/60 hover:text-pink-400 transition-colors">&larr; {i18n[lang].pages.backHome}</Link>
        </div>
      </main>
    );
  }

  const price = plan === "setup" && product.pricing.setup ? product.pricing.setup : product.pricing.code;

  const copyAddress = () => {
    navigator.clipboard.writeText(USDC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!txHash.trim()) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          expectedAmount: price,
          productId: product.id,
          productName: product.name,
          plan,
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult({ status: "error", message: tc.paymentError });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-pink-100/80 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-pink-400/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href={`/products/${product.id}`} className="text-sm font-mono text-pink-400/40 hover:text-pink-400/80 transition-colors">&larr; {product.name}</Link>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <span className="text-xs font-mono text-pink-400/30">{tc.title}</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-28 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">{tc.title}</p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight">
              <span className="gradient-text">{product.name}</span>
            </h1>
            <p className="text-pink-100/40 text-sm">{product.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* PLAN SELECTOR */}
      {product.pricing.setup && (
        <section className="relative z-10 px-6 pb-6">
          <div className="max-w-md mx-auto flex gap-2">
            <button
              onClick={() => setPlan("code")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                plan === "code"
                  ? "glass border-pink-400/30 text-pink-100/80 shadow-[0_0_20px_rgba(244,114,182,0.1)]"
                  : "glass text-pink-100/30 hover:text-pink-100/50"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider text-pink-400/40 mb-1">{tc.sourceCode}</span>
              <span className="font-mono font-black text-lg">${product.pricing.code}</span>
            </button>
            <button
              onClick={() => setPlan("setup")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                plan === "setup"
                  ? "glass border-pink-400/30 text-pink-100/80 shadow-[0_0_20px_rgba(244,114,182,0.1)]"
                  : "glass text-pink-100/30 hover:text-pink-100/50"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider text-pink-400/40 mb-1">{tc.setupIntegration}</span>
              <span className="font-mono font-black text-lg">${product.pricing.setup}</span>
            </button>
          </div>
        </section>
      )}

      {/* STEPS */}
      <section className="relative z-10 px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <button key={s} onClick={() => setStep(s as 1 | 2 | 3)} className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  step === s
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_20px_rgba(244,114,182,0.3)]"
                    : step > s
                    ? "bg-pink-500/20 text-pink-300/60 border border-pink-400/20"
                    : "glass text-pink-100/30"
                }`}>
                  {step > s ? "\u2713" : s}
                </span>
                {s < 3 && <span className={`w-12 h-[1px] ${step > s ? "bg-pink-400/30" : "bg-pink-400/10"}`} />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 1: Order Summary */}
      {step === 1 && (
        <section className="relative z-10 px-6 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div {...fade}>
              <div className="glass rounded-xl p-6 sm:p-8 mb-4">
                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{tc.orderSummary}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-pink-100/60">{product.name}</span>
                  <span className="text-sm font-mono text-pink-100/60">{plan === "setup" ? tc.setupIntegration : tc.sourceCode}</span>
                </div>
                <div className="border-t border-pink-400/10 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-pink-100/80">Total</span>
                  <span className="text-2xl font-black gradient-text font-mono">${price}</span>
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <ul className="space-y-2 text-sm text-pink-100/40">
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> {tp.includes.code}</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> {tp.includes.docs}</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> {tp.includes.autoInstall}</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> {tp.includes.updates}</li>
                  {plan === "setup" && (
                    <>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.setup}</li>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.infra}</li>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> {tp.includes.support}</li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]"
              >
                {tc.sendUsdc} &rarr;
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* STEP 2: Crypto Payment — USDC ERC20 only */}
      {step === 2 && (
        <section className="relative z-10 px-6 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div {...fade}>
              <div className="glass rounded-xl p-6 sm:p-8 mb-4 text-center">
                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">{tc.sendUsdc}</p>
                <p className="text-3xl sm:text-4xl font-black gradient-text font-mono mb-1">${price}</p>
                <p className="text-xs text-pink-100/30">{tc.usdcNote}</p>
              </div>

              <div className="glass rounded-xl p-4 sm:p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-xs font-mono text-blue-300/80">$</span>
                    <div>
                      <p className="text-xs font-semibold text-pink-100/70">USDC ERC20</p>
                      <p className="text-[10px] text-pink-100/30">Ethereum Network</p>
                    </div>
                  </div>
                  <button
                    onClick={copyAddress}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                      copied
                        ? "bg-green-500/20 text-green-300/80 border border-green-500/30"
                        : "glass text-pink-100/40 hover:text-pink-100/70 hover:bg-pink-400/10"
                    }`}
                  >
                    {copied ? tc.copied : tc.copyAddress}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-pink-100/30 break-all select-all bg-black/30 rounded-lg px-3 py-2">{USDC_ADDRESS}</p>
              </div>

              <div className="glass rounded-xl p-4 border-yellow-500/20 mb-6">
                <p className="text-xs text-yellow-300/60 mb-1 font-semibold">Important</p>
                <ul className="text-[11px] text-pink-100/30 space-y-1">
                  <li>&rarr; Send exactly <span className="text-pink-100/60 font-mono">${price} USDC</span></li>
                  <li>&rarr; Only send <span className="text-pink-100/60">USDC on Ethereum (ERC20)</span></li>
                  <li>&rarr; Wrong network = funds may be lost</li>
                  <li>&rarr; After sending, click the button below to verify</li>
                </ul>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]"
              >
                {tc.verifyPayment} &rarr;
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* STEP 3: Verify Transaction */}
      {step === 3 && (
        <section className="relative z-10 px-6 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div {...fade}>
              <div className="glass rounded-xl p-6 sm:p-8 mb-6">
                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">{tc.verifyPayment}</p>
                <p className="text-sm text-pink-100/40 mb-6">
                  {tc.enterTxHash}
                </p>

                <div className="mb-4">
                  <label className="block text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">Transaction Hash</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder={tc.txPlaceholder}
                    className="w-full bg-black/40 border border-pink-400/10 rounded-lg px-4 py-3 text-sm font-mono text-pink-100/70 placeholder-pink-100/20 focus:border-pink-400/30 focus:outline-none transition-colors"
                  />
                </div>

                {verifyResult && (
                  <div className={`rounded-lg p-4 mb-4 ${
                    verifyResult.status === "success"
                      ? "bg-green-500/10 border border-green-500/20"
                      : verifyResult.status === "pending"
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}>
                    <p className={`text-sm ${
                      verifyResult.status === "success"
                        ? "text-green-300/80"
                        : verifyResult.status === "pending"
                        ? "text-yellow-300/80"
                        : "text-red-300/80"
                    }`}>
                      {verifyResult.status === "success" && "\u2713 "}
                      {verifyResult.status === "pending" && "\u23F3 "}
                      {verifyResult.status === "error" && "\u2717 "}
                      {verifyResult.message}
                    </p>
                  </div>
                )}

                <button
                  onClick={verifyPayment}
                  disabled={verifying || !txHash.trim()}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    verifying || !txHash.trim()
                      ? "bg-pink-500/10 text-pink-100/20 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(244,114,182,0.2)]"
                  }`}
                >
                  {verifying ? tc.verifying : tc.verifyPayment}
                </button>
              </div>

              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-xs text-pink-100/40 mb-2">Where to find your tx hash:</p>
                <ul className="text-[11px] text-pink-100/30 space-y-1">
                  <li>&rarr; MetaMask: Activity tab &rarr; click transaction &rarr; copy hash</li>
                  <li>&rarr; Trust Wallet: Transaction details &rarr; TxID</li>
                  <li>&rarr; Exchange: Withdrawal history &rarr; TxHash/TxID</li>
                </ul>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs text-pink-100/40 mb-2">Need help?</p>
                <p className="text-[11px] text-pink-100/30">
                  Contact us on Telegram: <a href="https://t.me/shop_by_finekot_bot" target="_blank" rel="noopener noreferrer" className="text-pink-400/60 hover:text-pink-400/80 transition-colors">@shop_by_finekot_bot</a>
                </p>
              </div>

              <div className="text-center mt-6">
                <Link href={`/products/${product.id}`} className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">
                  &larr; {tc.back} {product.name}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 py-8 px-6 border-t border-pink-400/5">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/" className="text-xs text-pink-100/20 hover:text-pink-100/40 transition-colors font-mono">&larr; {i18n[lang].pages.backHome}</Link>
        </div>
      </footer>
    </main>
  );
}
