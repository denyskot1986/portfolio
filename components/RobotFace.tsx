"use client";

/**
 * RobotFace — small pixel-style robot head with blinking slit eyes.
 * Reusable across the site as a "live robots here" signature.
 *
 * Blink cadence: eyes close briefly every ~3.5s, slight stagger between
 * left and right so it feels organic rather than mechanical-in-sync.
 */

import { motion } from "framer-motion";

interface RobotFaceProps {
  size?: number;
  color?: string;
  glow?: boolean;
  className?: string;
}

export default function RobotFace({
  size = 14,
  color = "#00ff41",
  glow = true,
  className,
}: RobotFaceProps) {
  const blinkAnim = {
    y: [8, 9.35, 8],
    height: [3, 0.3, 3],
  };
  const blinkTrans = (delay: number) => ({
    duration: 0.28,
    delay,
    repeat: Infinity,
    repeatDelay: 3.5,
    ease: "easeInOut" as const,
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined}
    >
      {/* antenna */}
      <line
        x1="10"
        y1="3"
        x2="10"
        y2="1.2"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="10" cy="1.2" r="0.8" fill={color} />

      {/* head */}
      <rect
        x="2.5"
        y="3.5"
        width="15"
        height="13"
        rx="3"
        ry="3"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />

      {/* mouth bar */}
      <rect x="7" y="13" width="6" height="0.8" rx="0.3" fill={color} opacity="0.5" />

      {/* left eye */}
      <motion.rect
        x="5"
        width="3.5"
        rx="0.5"
        fill={color}
        initial={{ y: 8, height: 3 }}
        animate={blinkAnim}
        transition={blinkTrans(0)}
      />

      {/* right eye — blinks a hair later so it looks less robotic-sync */}
      <motion.rect
        x="11.5"
        width="3.5"
        rx="0.5"
        fill={color}
        initial={{ y: 8, height: 3 }}
        animate={blinkAnim}
        transition={blinkTrans(0.04)}
      />
    </svg>
  );
}
