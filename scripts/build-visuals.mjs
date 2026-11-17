#!/usr/bin/env node
// Builds the README hero (dark and light) and the social preview from one layout.
// Usage: node scripts/build-visuals.mjs
// Writes .github/assets/hero-dark.svg, hero-light.svg and social-preview.svg.
// When playwright or rsvg-convert is on PATH it also renders .github/social-preview.png (1280x640)
// and copies it to .github/assets/social-preview.png.
import { writeFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, ".github", "assets");

// Real output of `npx -y github:Aboudjem/recap-studio demo` (2026-11-17).
const VERDICT = "Verdict: PASS · 49.8 KB · 0 script tags · 9.7/10";
const COMMAND = "npx -y github:Aboudjem/recap-studio demo";
const HEADLINE = "What changed, on one page";
const CHIPS = ["Understand what was done", "One page to send", "Checked before you send"];
const WORKS = "Agent skills · Any MCP client · CLI · Tested: Claude Code, Codex CLI";

const THEMES = {
  dark: {
    bg: "#0A0F1C", ink: "#F2F6FF", sub: "#C2CDE4", muted: "#93A2BE",
    bar: "#3A4560", card: "#121A2E", cardLine: "#2A3550", accent: "#5B9DFF",
    accent2: "#8E7BFF", pass: "#4ADE80", chipBg: "#15203A", chipStroke: "#2D4A80",
    cmdBg: "#0F1626", cmdStroke: "#2A3550",
  },
  light: {
    bg: "#F7F9FF", ink: "#0B1020", sub: "#2A3550", muted: "#4A5670",
    bar: "#C3CBDD", card: "#FFFFFF", cardLine: "#D5DCEA", accent: "#2F6FE0",
    accent2: "#6B57E8", pass: "#15803D", chipBg: "#EAF1FF", chipStroke: "#9DBBF2",
    cmdBg: "#FFFFFF", cmdStroke: "#C3CBDD",
  },
};

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg({ w, h, t, label }) {
  const pad = 64;
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">`);
  parts.push(`<title>${esc(label)}</title>`);
  parts.push(`<rect width="${w}" height="${h}" fill="${t.bg}"/>`);
  // Wordmark and headline.
  parts.push(`<text x="${pad}" y="78" font-family="${SANS}" font-size="26" font-weight="700" fill="${t.accent}">recap-studio</text>`);
  parts.push(`<text x="${pad}" y="150" font-family="${SANS}" font-size="62" font-weight="800" fill="${t.ink}">${esc(HEADLINE)}</text>`);

  // Visual: a tall stack of commits, one arrow, one page.
  const vy = 196;
  const widths = [170, 130, 190, 110, 160, 140, 180, 120];
  widths.forEach((bw, i) => {
    parts.push(`<rect x="${pad}" y="${vy + i * 18}" width="${bw}" height="10" rx="5" fill="${t.bar}"/>`);
  });
  parts.push(`<text x="${pad}" y="${vy + 8 * 18 + 26}" font-family="${MONO}" font-size="20" fill="${t.muted}">40 commits</text>`);
  const ax = pad + 220;
  const ay = vy + 72;
  parts.push(`<path d="M${ax} ${ay} H${ax + 70}" stroke="${t.accent}" stroke-width="5" stroke-linecap="round"/>`);
  parts.push(`<path d="M${ax + 58} ${ay - 14} L${ax + 76} ${ay} L${ax + 58} ${ay + 14}" stroke="${t.accent}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  const cx = ax + 110;
  const cw = w - pad - cx;
  const ch = 190;
  parts.push(`<rect x="${cx}" y="${vy - 6}" width="${cw}" height="${ch}" rx="14" fill="${t.card}" stroke="${t.cardLine}" stroke-width="2"/>`);
  parts.push(`<rect x="${cx + 28}" y="${vy + 22}" width="${Math.min(300, cw - 56)}" height="14" rx="7" fill="${t.accent}"/>`);
  parts.push(`<rect x="${cx + 28}" y="${vy + 52}" width="${Math.min(460, cw - 56)}" height="10" rx="5" fill="${t.cardLine}"/>`);
  parts.push(`<rect x="${cx + 28}" y="${vy + 74}" width="${Math.min(390, cw - 56)}" height="10" rx="5" fill="${t.cardLine}"/>`);
  parts.push(`<text x="${cx + 28}" y="${vy + 146}" font-family="${MONO}" font-size="22" font-weight="600" fill="${t.pass}">${esc(VERDICT)}</text>`);

  // Chips.
  let x = pad;
  const cy = vy + ch + 34;
  for (const c of CHIPS) {
    const cwid = Math.round(c.length * 12.2 + 40);
    parts.push(`<rect x="${x}" y="${cy}" width="${cwid}" height="48" rx="24" fill="${t.chipBg}" stroke="${t.chipStroke}" stroke-width="1.5"/>`);
    parts.push(`<text x="${x + cwid / 2}" y="${cy + 31}" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="600" fill="${t.ink}">${esc(c)}</text>`);
    x += cwid + 16;
  }

  // Works with.
  const wy = cy + 92;
  parts.push(`<text x="${pad}" y="${wy}" font-family="${SANS}" font-size="20" font-weight="500" fill="${t.sub}">${esc(WORKS)}</text>`);

  // Command.
  const my = wy + 28;
  const mw = Math.round(COMMAND.length * 13.3 + 84);
  parts.push(`<rect x="${pad}" y="${my}" width="${mw}" height="54" rx="10" fill="${t.cmdBg}" stroke="${t.cmdStroke}" stroke-width="1.5"/>`);
  parts.push(`<text x="${pad + 24}" y="${my + 35}" font-family="${MONO}" font-size="22" fill="${t.accent2}">$</text>`);
  parts.push(`<text x="${pad + 50}" y="${my + 35}" font-family="${MONO}" font-size="22" fill="${t.ink}">${esc(COMMAND)}</text>`);
  parts.push(`</svg>`);
  return parts.join("\n") + "\n";
}

const LABEL =
  "Recap Studio: what changed, on one page. 40 commits become one page with the line " +
  "Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10. Command: " + COMMAND;

writeFileSync(join(assets, "hero-dark.svg"), svg({ w: 1200, h: 640, t: THEMES.dark, label: LABEL }));
writeFileSync(join(assets, "hero-light.svg"), svg({ w: 1200, h: 640, t: THEMES.light, label: LABEL }));
const social = join(assets, "social-preview.svg");
writeFileSync(social, svg({ w: 1280, h: 640, t: THEMES.dark, label: LABEL }));

try {
  const png = join(root, ".github", "social-preview.png");
  try {
    // A browser render matches what GitHub shows (font kerning).
    execFileSync("playwright", ["screenshot", "--viewport-size=1280,640", `file://${social}`, png], { stdio: "ignore" });
  } catch {
    execFileSync("rsvg-convert", ["-w", "1280", "-h", "640", social, "-o", png]);
  }
  copyFileSync(png, join(assets, "social-preview.png"));
  console.log("Wrote hero-dark.svg, hero-light.svg, social-preview.svg and social-preview.png");
} catch {
  console.log("Wrote the SVGs. No renderer found, so the PNG was not rendered.");
}
