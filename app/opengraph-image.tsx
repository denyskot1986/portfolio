import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Finekot — Authored AI Agents & Systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0608 0%, #1a0a14 40%, #0a0608 100%)",
          position: "relative",
        }}
      >
        {/* Pink glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Top line */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "rgba(244,114,182,0.4)", fontSize: 14, fontFamily: "monospace", letterSpacing: 4 }}>
            FINEKOT.AI
          </span>
        </div>

        {/* Main text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "rgba(244,114,182,0.5)",
              fontFamily: "monospace",
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Authored AI Agents & Systems
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: "linear-gradient(135deg, #f472b6, #ec4899, #a855f7)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
            }}
          >
            Finekot
          </span>
          <span
            style={{
              fontSize: 28,
              color: "rgba(237,224,228,0.6)",
              fontWeight: 600,
            }}
          >
            Subscribe to Boris. Or own the code.
          </span>
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <span style={{ fontSize: 14, color: "rgba(244,114,182,0.4)", fontFamily: "monospace" }}>
              Agents from $49/mo
            </span>
            <span style={{ fontSize: 14, color: "rgba(244,114,182,0.2)" }}>•</span>
            <span style={{ fontSize: 14, color: "rgba(244,114,182,0.4)", fontFamily: "monospace" }}>
              Systems from $499
            </span>
            <span style={{ fontSize: 14, color: "rgba(244,114,182,0.2)" }}>•</span>
            <span style={{ fontSize: 14, color: "rgba(244,114,182,0.4)", fontFamily: "monospace" }}>
              Studio from $15k
            </span>
          </div>
        </div>

        {/* Bottom border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, #ec4899, #a855f7, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
