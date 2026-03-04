"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { getProductById } from "@/lib/products-data";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const wallets = [
  { network: "USDT TRC20", label: "Tron (TRC20)", address: "TXxxxxxxxxxxxxxxxxxxxxxxxxxExample1", icon: "₮" },
  { network: "USDC TRC20", label: "Tron (TRC20)", address: "TXxxxxxxxxxxxxxxxxxxxxxxxxxExample2", icon: "$" },
  { network: "USDT ERC20", label: "Ethereum (ERC20)", address: "0xExampleEthereumAddress1234567890abcdef", icon: "₮" },
  { network: "USDC ERC20", label: "Ethereum (ERC20)", address: "0xExampleEthereumAddress1234567890abcdef", icon: "$" },
];

export default function CheckoutPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const [plan, setPlan] = useState<"code" | "setup">("code");
  const [copied, setCopied] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-pink-100/80 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
          <Link href="/" className="text-pink-400/60 hover:text-pink-400 transition-colors">&larr; Back to Home</Link>
        </div>
      </main>
    );
  }

  const price = plan === "setup" && product.pricing.setup ? product.pricing.setup : product.pricing.code;

  const copyAddress = (address: string, network: string) => {
    navigator.clipboard.writeText(address);
    setCopied(network);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-pink-100/80 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-pink-400/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href={`/products/${product.id}`} className="text-sm font-mono text-pink-400/40 hover:text-pink-400/80 transition-colors">&larr; {product.name}</Link>
          <span className="text-xs font-mono text-pink-400/30">Checkout</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-28 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fade}>
            <p className="text-xs text-pink-400/30 uppercase tracking-[0.4em] mb-3 font-mono">Checkout</p>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
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
              <span className="block text-[10px] uppercase tracking-wider text-pink-400/40 mb-1">Source Code</span>
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
              <span className="block text-[10px] uppercase tracking-wider text-pink-400/40 mb-1">Setup + Integration</span>
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
                  {step > s ? "✓" : s}
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
                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-4">Order Summary</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-pink-100/60">{product.name}</span>
                  <span className="text-sm font-mono text-pink-100/60">{plan === "setup" ? "Setup + Integration" : "Source Code"}</span>
                </div>
                <div className="border-t border-pink-400/10 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-pink-100/80">Total</span>
                  <span className="text-2xl font-black gradient-text font-mono">${price}</span>
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-xs text-pink-100/40 mb-3">What&apos;s included:</p>
                <ul className="space-y-2 text-sm text-pink-100/40">
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> Full source code</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> Documentation &amp; setup guide</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> Auto-install included</li>
                  <li className="flex gap-2"><span className="text-pink-400/50">&rarr;</span> Lifetime updates</li>
                  {plan === "setup" && (
                    <>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> Personal setup by the creator</li>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> Integrated into your infrastructure</li>
                      <li className="flex gap-2"><span className="text-pink-400">&rarr;</span> 30 days support</li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]"
              >
                Proceed to Payment &rarr;
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* STEP 2: Crypto Payment */}
      {step === 2 && (
        <section className="relative z-10 px-6 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div {...fade}>
              <div className="glass rounded-xl p-6 sm:p-8 mb-4 text-center">
                <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-2">Amount to Send</p>
                <p className="text-4xl font-black gradient-text font-mono mb-1">${price}</p>
                <p className="text-xs text-pink-100/30">Send exact amount in USDT or USDC</p>
              </div>

              <div className="space-y-3 mb-6">
                {wallets.map((w) => (
                  <div key={w.network} className="glass rounded-xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-pink-500/10 border border-pink-400/20 flex items-center justify-center text-xs font-mono text-pink-300/60">{w.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-pink-100/70">{w.network}</p>
                          <p className="text-[10px] text-pink-100/30">{w.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyAddress(w.address, w.network)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                          copied === w.network
                            ? "bg-green-500/20 text-green-300/80 border border-green-500/30"
                            : "glass text-pink-100/40 hover:text-pink-100/70 hover:bg-pink-400/10"
                        }`}
                      >
                        {copied === w.network ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-pink-100/30 break-all select-all bg-black/30 rounded-lg px-3 py-2">{w.address}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4 border-yellow-500/20 mb-6">
                <p className="text-xs text-yellow-300/60 mb-1 font-semibold">Important</p>
                <ul className="text-[11px] text-pink-100/30 space-y-1">
                  <li>&rarr; Send the exact amount: <span className="text-pink-100/60 font-mono">${price}</span></li>
                  <li>&rarr; Only send USDT or USDC on the specified network</li>
                  <li>&rarr; Wrong network = funds may be lost</li>
                </ul>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]"
              >
                I&apos;ve Sent the Payment &rarr;
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* STEP 3: Confirm via Bot */}
      {step === 3 && (
        <section className="relative z-10 px-6 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div {...fade}>
              <div className="glass rounded-xl p-6 sm:p-8 text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-400/20 flex items-center justify-center text-2xl mx-auto mb-4">
                  &#x2713;
                </div>
                <h2 className="text-xl font-black mb-2 text-pink-100/80">Almost Done!</h2>
                <p className="text-sm text-pink-100/40 mb-6">Send your transaction hash to our bot. It will verify the payment and deliver your product automatically.</p>

                <div className="glass rounded-xl p-5 mb-4 text-left">
                  <p className="text-[10px] text-pink-400/30 uppercase tracking-wider font-mono mb-3">Steps</p>
                  <ol className="space-y-3 text-sm text-pink-100/50">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-500/15 border border-pink-400/20 flex items-center justify-center text-[10px] font-mono text-pink-300/60 shrink-0">1</span>
                      <span>Open <span className="text-pink-300/70 font-semibold">@shop_by_finekot_bot</span> on Telegram</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-500/15 border border-pink-400/20 flex items-center justify-center text-[10px] font-mono text-pink-300/60 shrink-0">2</span>
                      <span>Send: <span className="font-mono text-pink-100/70 text-xs">/pay {product.id} [tx_hash]</span></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-500/15 border border-pink-400/20 flex items-center justify-center text-[10px] font-mono text-pink-300/60 shrink-0">3</span>
                      <span>Bot verifies payment and sends product access</span>
                    </li>
                  </ol>
                </div>

                <a
                  href="https://t.me/shop_by_finekot_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(244,114,182,0.2)]"
                >
                  Open Telegram &rarr;
                </a>

                <p className="text-[10px] text-pink-100/20 mt-4">Usually verified within 5 minutes. Manual review for large amounts.</p>
              </div>

              <div className="text-center">
                <Link href={`/products/${product.id}`} className="text-xs text-pink-400/30 hover:text-pink-400/60 transition-colors font-mono">
                  &larr; Back to {product.name}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 py-8 px-6 border-t border-pink-400/5">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/" className="text-xs text-pink-100/20 hover:text-pink-100/40 transition-colors font-mono">&larr; denyskot.com</Link>
        </div>
      </footer>
    </main>
  );
}
