/**
 * Recap Studio Tailwind preset.
 * Consumers spread this into their tailwind.config.ts presets array.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16161D",
          dark: "#F2F1EE",
        },
        canvas: {
          DEFAULT: "#FBFAF7",
          dark: "#0B0B0F",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#15151B",
        },
        muted: {
          DEFAULT: "#5C5C66",
          dark: "#A4A4B0",
        },
        accent: {
          DEFAULT: "#7C5CFF",
          soft: "#E6E0FF",
          ink: "#1F1647",
        },
        line: {
          DEFAULT: "#E7E6E1",
          dark: "#23232B",
        },
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        soft: "0 1px 1px rgba(20,18,40,0.04), 0 12px 24px -12px rgba(20,18,40,0.08)",
        card: "0 1px 2px rgba(20,18,40,0.06), 0 18px 32px -16px rgba(20,18,40,0.12)",
      },
      fontFamily: {
        display: [
          "ui-serif",
          "Iowan Old Style",
          "Apple Garamond",
          "Source Serif Pro",
          "Georgia",
          "serif",
        ],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
};
