export type AgentModeTheme = "pink" | "matrix" | "blue" | "custom";
export type AgentModeIntensity = "subtle" | "normal" | "alert";

export interface ThemeStops {
  stops: string[];
  accent: string;
}

export const THEMES: Record<Exclude<AgentModeTheme, "custom">, ThemeStops> = {
  pink: {
    accent: "#ff0080",
    stops: [
      "#ff0080",
      "#ff3ec9",
      "#9d4edd",
      "#00e0ff",
      "#9d4edd",
      "#ff3ec9",
      "#ff0080",
    ],
  },
  matrix: {
    accent: "#00ff88",
    stops: [
      "#00ff88",
      "#00e5cc",
      "#00e0ff",
      "#0072ff",
      "#00e0ff",
      "#00e5cc",
      "#00ff88",
    ],
  },
  blue: {
    accent: "#00b4ff",
    stops: [
      "#00b4ff",
      "#00e0ff",
      "#4d8cff",
      "#8a5cff",
      "#4d8cff",
      "#00e0ff",
      "#00b4ff",
    ],
  },
};

export interface IntensityProfile {
  borderPx: number;
  glowBlur: number;
  glowOpacityMin: number;
  glowOpacityMax: number;
  rotationSec: number;
  glowPulseSec: number;
}

export const INTENSITY: Record<AgentModeIntensity, IntensityProfile> = {
  subtle: {
    borderPx: 4,
    glowBlur: 60,
    glowOpacityMin: 0.15,
    glowOpacityMax: 0.35,
    rotationSec: 18,
    glowPulseSec: 6,
  },
  normal: {
    borderPx: 6,
    glowBlur: 120,
    glowOpacityMin: 0.3,
    glowOpacityMax: 0.7,
    rotationSec: 12,
    glowPulseSec: 4,
  },
  alert: {
    borderPx: 10,
    glowBlur: 180,
    glowOpacityMin: 0.55,
    glowOpacityMax: 1,
    rotationSec: 6,
    glowPulseSec: 2.2,
  },
};
