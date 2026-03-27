"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SkynetLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/skynet");
      } else {
        setGlitch(true);
        setError("ACCESS DENIED — INVALID CREDENTIALS");
        setTimeout(() => setGlitch(false), 600);
      }
    } catch {
      setError("CONNECTION ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: "#020408",
      backgroundImage: "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      fontFamily: "var(--font-jetbrains-mono), monospace",
    }}>
      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
      }} />

      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.3em", color: "rgba(0,255,65,0.4)",
            marginBottom: 8, textTransform: "uppercase"
          }}>
            FINEKOT SYSTEMS
          </div>
          <div style={{
            fontSize: 32, fontWeight: 900, letterSpacing: "0.1em",
            color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.2)",
          }}
            className={glitch ? "glitch-anim" : ""}
          >
            SKYNET
          </div>
          <div style={{
            fontSize: 11, letterSpacing: "0.25em", color: "rgba(0,255,65,0.3)",
            marginTop: 4
          }}>
            v3.0 · COMMAND CENTER
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: "rgba(0,255,65,0.02)",
          border: "1px solid rgba(0,255,65,0.15)",
          borderRadius: 4,
          padding: "28px 24px",
        }}>
          <div style={{ marginBottom: 8, fontSize: 10, letterSpacing: "0.2em", color: "rgba(0,255,65,0.4)" }}>
            AUTHENTICATION REQUIRED
          </div>
          <div style={{ height: 1, background: "rgba(0,255,65,0.1)", marginBottom: 24 }} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.15em", color: "rgba(0,255,65,0.5)", marginBottom: 6 }}>
              UNIT ID
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={{
                width: "100%", boxSizing: "border-box", padding: "10px 12px",
                background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.2)",
                borderRadius: 3, color: "#00ff41", fontSize: 13, fontFamily: "inherit",
                outline: "none", letterSpacing: "0.05em",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,255,65,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,255,65,0.2)")}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.15em", color: "rgba(0,255,65,0.5)", marginBottom: 6 }}>
              ACCESS CODE
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: "100%", boxSizing: "border-box", padding: "10px 12px",
                background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.2)",
                borderRadius: 3, color: "#00ff41", fontSize: 13, fontFamily: "inherit",
                outline: "none", letterSpacing: "0.1em",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,255,65,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,255,65,0.2)")}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: "8px 12px", fontSize: 10,
              letterSpacing: "0.1em", color: "#ff4444",
              background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
              borderRadius: 3,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", fontFamily: "inherit",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
              background: loading ? "rgba(0,255,65,0.05)" : "rgba(0,255,65,0.08)",
              border: "1px solid rgba(0,255,65,0.3)",
              color: loading ? "rgba(0,255,65,0.4)" : "#00ff41",
              borderRadius: 3, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "VERIFYING..." : "AUTHENTICATE"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 9, letterSpacing: "0.2em", color: "rgba(0,255,65,0.15)" }}>
          UNAUTHORIZED ACCESS WILL BE TERMINATED
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0%   { transform: translate(0); filter: hue-rotate(0deg); }
          20%  { transform: translate(-3px, 1px); filter: hue-rotate(90deg); }
          40%  { transform: translate(3px, -1px); filter: hue-rotate(180deg); }
          60%  { transform: translate(-1px, 2px); filter: hue-rotate(270deg); }
          80%  { transform: translate(2px, -2px); filter: hue-rotate(90deg); }
          100% { transform: translate(0); filter: hue-rotate(0deg); }
        }
        .glitch-anim { animation: glitch 0.15s steps(2) 4; }
        input::placeholder { color: rgba(0,255,65,0.2); }
      `}</style>
    </div>
  );
}
