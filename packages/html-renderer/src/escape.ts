/**
 * HTML escaping helpers. The renderer treats ALL content-pipeline strings as
 * untrusted text and escapes them before interpolation. The only exception is
 * inline SVG diagram code (kind: "svg"), which is sanitized separately in
 * diagram.ts.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape text for use in element bodies. */
export function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c);
}

/** Escape text for use inside a double-quoted attribute. */
export function escAttr(value: unknown): string {
  return esc(value);
}

/**
 * Escape but keep a couple of light inline formatting affordances that the
 * learning-architect commonly emits: `code` spans and **bold**. Everything
 * else is escaped. This keeps content readable without allowing raw HTML.
 */
export function escRich(value: unknown): string {
  const escaped = esc(value);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
