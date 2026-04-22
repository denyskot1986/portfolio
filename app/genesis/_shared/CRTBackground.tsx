"use client";

export function CRTBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,65,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 75%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 75%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.18) 0px, rgba(0, 255, 65, 0.18) 1px, transparent 1px, transparent 3px)",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}

