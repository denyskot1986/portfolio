"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AgentFaceProps {
  size?: number;
  color?: string;
  antennaColor?: string;
  eyeStyle?: "round" | "slit";
  extra?: "scanner" | "cross" | "feather" | "dual-mouth" | "none";
  className?: string;
}

export default function AgentFace({
  size = 96,
  color = "var(--accent)",
  antennaColor,
  eyeStyle = "round",
  extra = "none",
  className,
}: AgentFaceProps) {
  const reduced = useReducedMotion() ?? false;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [eyeOff, setEyeOff] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const max = 1.6;
      setEyeOff({
        x: Math.max(-max, Math.min(max, (dx / dist) * max)),
        y: Math.max(-max, Math.min(max, (dy / dist) * max)),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  const antC = antennaColor ?? color;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 8px ${color}55)`,
      }}
      aria-hidden
    >
      <svg viewBox="-30 -34 60 64" width={size} height={size}>
        {/* halo */}
        <circle cx="0" cy="0" r="22" fill="none" stroke={color} strokeOpacity="0.22" />

        {/* antenna stem */}
        <line x1="0" y1="-16" x2="0" y2="-22" stroke={antC} strokeWidth="1.1" strokeLinecap="round" />
        {/* antenna tip (pulsing) */}
        <motion.circle
          cx="0"
          cy="-24"
          r="1.8"
          fill={antC}
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* head */}
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="8"
          ry="8"
          fill="rgba(4,2,8,0.92)"
          stroke={color}
          strokeWidth="1.3"
        />

        {/* eyes — group shifts with cursor */}
        <motion.g
          animate={reduced ? undefined : { x: eyeOff.x, y: eyeOff.y }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          {eyeStyle === "round" ? (
            <>
              <motion.circle
                cx="-6"
                cy="-2"
                r="2.4"
                fill={color}
                animate={reduced ? undefined : { scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 3.6, ease: "easeInOut" }}
                style={{ transformOrigin: "-6px -2px" }}
              />
              <motion.circle
                cx="6"
                cy="-2"
                r="2.4"
                fill={color}
                animate={reduced ? undefined : { scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 3.6, delay: 0.06, ease: "easeInOut" }}
                style={{ transformOrigin: "6px -2px" }}
              />
            </>
          ) : (
            <>
              <motion.rect
                x="-8.5"
                y="-3"
                width="5"
                height="1.8"
                rx="0.9"
                fill={color}
                animate={reduced ? undefined : { scaleY: [1, 0.2, 1] }}
                transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 3.6, ease: "easeInOut" }}
                style={{ transformOrigin: "-6px -2.1px" }}
              />
              <motion.rect
                x="3.5"
                y="-3"
                width="5"
                height="1.8"
                rx="0.9"
                fill={color}
                animate={reduced ? undefined : { scaleY: [1, 0.2, 1] }}
                transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 3.6, delay: 0.06, ease: "easeInOut" }}
                style={{ transformOrigin: "6px -2.1px" }}
              />
            </>
          )}
        </motion.g>

        {/* mouth — swap for dual-mouth if asked */}
        {extra === "dual-mouth" ? (
          <>
            <line x1="-8" y1="6" x2="-2" y2="6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
            <line x1="2" y1="6" x2="8" y2="6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          </>
        ) : (
          <line x1="-7" y1="6" x2="7" y2="6" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
        )}

        {/* scanner dot under the mouth */}
        {extra === "scanner" && (
          <motion.circle
            cx="0"
            cy="11"
            r="1.1"
            fill={color}
            animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* little red cross on the side */}
        {extra === "cross" && (
          <g transform="translate(16,-10)">
            <rect x="-2.5" y="-0.6" width="5" height="1.2" fill="#ff4b6e" />
            <rect x="-0.6" y="-2.5" width="1.2" height="5" fill="#ff4b6e" />
          </g>
        )}
        {/* feather over the head */}
        {extra === "feather" && (
          <g transform="translate(11,-18) rotate(25)">
            <path d="M0 0 L4 -6 L1 0 Z" fill={color} opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}
