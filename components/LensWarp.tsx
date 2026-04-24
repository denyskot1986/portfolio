"use client";

import { useEffect, useId, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Displacement scale in pixels at the corners. 0 = effect off. */
  strength?: number;
  /** Falloff exponent. 1 = linear, 2 = quadratic (smooth bulge), 3 = sharp edges only. */
  curvature?: number;
  /** Map resolution. Higher = smoother, slower to generate. */
  resolution?: number;
  className?: string;
  style?: React.CSSProperties;
};

const cache = new Map<string, string>();

function buildBarrelMap(size: number, curvature: number): string {
  const key = `${size}-${curvature}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const c = size / 2;
  const maxR = Math.sqrt(2) * c;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / maxR;
      const dy = (y - c) / maxR;
      const r = Math.sqrt(dx * dx + dy * dy);
      const k = Math.pow(r, curvature);
      // Barrel: at edges, sample from closer-to-center → image appears bulged outward
      const ux = -dx * k;
      const uy = -dy * k;
      const i = (y * size + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, Math.round(128 + ux * 127)));
      img.data[i + 1] = Math.max(0, Math.min(255, Math.round(128 + uy * 127)));
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}

export default function LensWarp({
  children,
  strength = 60,
  curvature = 2,
  resolution = 512,
  className,
  style,
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `lens-${rawId}`;
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  useEffect(() => {
    setMapUrl(buildBarrelMap(resolution, curvature));
  }, [curvature, resolution]);

  const active = strength > 0 && mapUrl != null;

  return (
    <div
      className={className}
      style={{
        ...style,
        filter: active ? `url(#${filterId})` : "none",
        WebkitFilter: active ? `url(#${filterId})` : "none",
        willChange: "filter",
      }}
    >
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            {mapUrl && (
              <>
                <feImage
                  href={mapUrl}
                  result="map"
                  preserveAspectRatio="none"
                  x="0%"
                  y="0%"
                  width="100%"
                  height="100%"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale={strength}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </>
            )}
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
}
