/**
 * Recap Studio design tokens.
 *
 * Calm, editorial, premium. One accent (violet) plus neutrals. Designed for
 * mobile-first reading and dark/light parity.
 */
export const colors = {
  bgLight: "#FBFAF7",
  bgDark: "#0B0B0F",
  surfaceLight: "#FFFFFF",
  surfaceDark: "#15151B",
  borderLight: "#E7E6E1",
  borderDark: "#23232B",
  textLight: "#16161D",
  textDark: "#F2F1EE",
  mutedLight: "#5C5C66",
  mutedDark: "#A4A4B0",
  accent: "#7C5CFF",
  accentSoft: "#E6E0FF",
  accentInk: "#1F1647",
  warn: "#E6A23C",
  ok: "#3FA672",
  err: "#D7424B",
} as const;

export const radius = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
} as const;

export const space = {
  px: "1px",
  0.5: "2px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const shadow = {
  soft: "0 1px 1px rgba(20,18,40,0.04), 0 12px 24px -12px rgba(20,18,40,0.08)",
  card: "0 1px 2px rgba(20,18,40,0.06), 0 18px 32px -16px rgba(20,18,40,0.12)",
} as const;

export const fonts = {
  display:
    'ui-serif, "Iowan Old Style", "Apple Garamond", "Source Serif Pro", Georgia, serif',
  text:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono:
    '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
} as const;

export const typeScale = {
  hero: { size: "clamp(2.25rem, 6vw, 4rem)", lh: "1.05", weight: 650 },
  h1:   { size: "clamp(1.75rem, 4vw, 2.5rem)", lh: "1.1", weight: 600 },
  h2:   { size: "clamp(1.5rem, 3vw, 2rem)", lh: "1.15", weight: 600 },
  h3:   { size: "1.25rem", lh: "1.25", weight: 600 },
  body: { size: "1rem", lh: "1.7", weight: 400 },
  small:{ size: "0.875rem", lh: "1.55", weight: 400 },
} as const;

export const motion = {
  /** Honor prefers-reduced-motion: a reader-friendly default. */
  ease: "cubic-bezier(0.2, 0.65, 0.25, 1)",
  reveal: "320ms",
  hover: "180ms",
  none: "0ms",
} as const;

export type Tokens = {
  colors: typeof colors;
  radius: typeof radius;
  space: typeof space;
  shadow: typeof shadow;
  fonts: typeof fonts;
  typeScale: typeof typeScale;
  motion: typeof motion;
};

export const tokens: Tokens = {
  colors,
  radius,
  space,
  shadow,
  fonts,
  typeScale,
  motion,
};

export default tokens;
