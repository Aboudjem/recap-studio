/**
 * Markdown and plain-text serializers for a RecapPageContent.
 *
 * Pure functions: same content in, byte-identical string out. Nothing here
 * reads the clock, the filesystem, the environment or the network, and nothing
 * pulls in a Markdown library. The HTML renderer is untouched, so its
 * zero-JavaScript, zero-external-request guarantee is unaffected.
 *
 * Trust posture, stated plainly because it differs from the HTML path. The HTML
 * renderer escapes every content string, because its output is a page a browser
 * executes. These serializers emit prose verbatim: a `.md` or `.txt` file is not
 * executed, and mangling the author's own backticks and asterisks would make the
 * output worse. What they DO escape is anything that would break the structure
 * they build themselves: pipes and newlines inside a table cell, and the
 * brackets and parentheses that delimit a link. If your content came from
 * somewhere you do not trust, treat the Markdown the same way you would treat
 * that source, because a Markdown renderer that allows inline HTML will see
 * whatever the content carries.
 */
import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { readingMinutes } from "./sections.js";

export type SerializeFormat = "md" | "txt";

/** Show an ISO date as YYYY-MM-DD without going through Date parsing. */
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : iso;
}

/** Collapse every run of whitespace, newlines included, to one space. */
function oneLine(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/** A table cell: one line, with pipes escaped so the row survives. */
function mdCell(value: unknown): string {
  return oneLine(value).replace(/\|/g, "\\|");
}

/** Link text: one line, with the delimiters escaped. */
function mdLinkText(value: unknown): string {
  return oneLine(value).replace(/([[\]])/g, "\\$1");
}

/**
 * A link destination. A bare URL breaks on whitespace or an unbalanced
 * parenthesis, and the angle-bracket form is the CommonMark answer to both.
 */
function mdUrl(url: string): string {
  const u = String(url ?? "").trim();
  if (/[\s()<>]/.test(u)) return `<${u.replace(/</g, "%3C").replace(/>/g, "%3E")}>`;
  return u;
}

/** The metadata that actually exists on a source, in reading order. */
function sourceMeta(s: RecapPageContent["sourceMap"][number]): string[] {
  const bits: string[] = [s.primary ? "primary" : "secondary"];
  if (s.provenance === "fixture") bits.push("fixture");
  if (s.publisher) bits.push(s.publisher);
  if (s.publishedAt) bits.push(s.publishedAt);
  return bits;
}

/** Section kinds this module knows how to write, mirroring RENDERERS. */
const KNOWN = new Set([
  "hero",
  "matters",
  "concept-map",
  "ideas",
  "timeline",
  "comparison",
  "examples",
  "analogies",
  "misconceptions",
  "glossary",
  "takeaways",
  "sources",
]);

/**
 * The enabled section kinds in order, deduplicated the way composeBody does it:
 * `analogies` collapses onto `examples`, unknown kinds (the schema's
 * `deep-dive` has no renderer at all) are skipped, and `hero` is handled by the
 * caller because a document has to open with its title.
 */
function sectionOrder(c: RecapPageContent): string[] {
  const out: string[] = [];
  const seen = new Set<string>(["hero"]);
  for (const s of c.visualSections) {
    if (!s.enabled) continue;
    const key = s.kind === "analogies" ? "examples" : s.kind;
    if (seen.has(key) || !KNOWN.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/* ------------------------------------------------------------------ Markdown */

/**
 * Render the content as GitHub-flavored Markdown.
 *
 * Ordering note: the title block always comes first, because a document opens
 * with its title. The HTML renderer prepends its hero only when `visualSections`
 * does not already carry an enabled one, so for content that lists `hero` late,
 * Markdown and text lead with it while HTML does not. That is the one place the
 * three formats deliberately disagree.
 */
export function renderToMarkdown(c: RecapPageContent): string {
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# ${oneLine(c.topic)}`, "");
  push(`> ${oneLine(c.oneSentenceAnswer)}`, "");
  push(
    [
      `~${readingMinutes(c)} min read`,
      fmtDate(c.generatedAt),
      `${c.sourceMap.length} source${c.sourceMap.length === 1 ? "" : "s"}`,
      c.audienceLevel,
    ].join(" | "),
    "",
  );
  if (c.fixture) push("_Demo content from a fixture, not a live research run._", "");
  if (c.fiveMinutePath.length) {
    push("**Reading path**", "");
    c.fiveMinutePath.forEach((s, i) => push(`${i + 1}. ${oneLine(s)}`));
    push("");
  }

  for (const kind of sectionOrder(c)) {
    if (kind === "matters" && c.whyItMatters.length) {
      push("## The short version", "");
      c.whyItMatters.forEach((w, i) => push(`${i + 1}. ${w}`));
      push("");
    } else if (kind === "concept-map" && c.diagrams.length) {
      push("## How it fits together", "");
      for (const d of c.diagrams) {
        if (d.kind === "mermaid") {
          push("```mermaid", d.code, "```", "");
        } else {
          // Raw SVG markup in a Markdown file is a wall of unreadable
          // characters in a diff, so the alt text stands in for the figure.
          push(`_Diagram: ${oneLine(d.alt)}_`, "");
        }
      }
    } else if (kind === "ideas" && c.keyIdeas.length) {
      push("## Key ideas", "");
      for (const k of c.keyIdeas) push(`### ${oneLine(k.title)}`, "", k.body, "");
    } else if (kind === "timeline" && c.timeline?.length) {
      push("## Timeline", "");
      for (const t of c.timeline) push(`### ${oneLine(t.date)}: ${oneLine(t.title)}`, "", t.body, "");
    } else if (kind === "comparison" && c.comparisons?.length) {
      push("## Comparison", "");
      for (const b of c.comparisons) {
        push(`### ${oneLine(b.title)}`, "");
        push(`| | ${b.columns.map(mdCell).join(" | ")} |`);
        push(`| --- | ${b.columns.map(() => "---").join(" | ")} |`);
        for (const r of b.rows) {
          push(`| ${mdCell(r.name)} | ${b.columns.map((col) => mdCell(r.cells[col] ?? "-")).join(" | ")} |`);
        }
        push("");
      }
    } else if (kind === "examples" && (c.examples.length || c.analogies.length)) {
      push("## Make it concrete", "");
      for (const e of c.examples) push(`### Example: ${oneLine(e.title)}`, "", e.body, "");
      for (const a of c.analogies) push("### Analogy", "", a.setup, "", a.takeaway, "");
    } else if (kind === "misconceptions" && c.misconceptions.length) {
      push("## Myth vs truth", "");
      for (const m of c.misconceptions) push(`- **Myth:** ${m.myth}`, `  **Truth:** ${m.truth}`, "");
    } else if (kind === "glossary" && c.glossary.length) {
      push("## Glossary", "");
      for (const g of c.glossary) push(`- **${oneLine(g.term)}**: ${oneLine(g.definition)}`);
      push("");
    } else if (kind === "takeaways" && c.practicalTakeaways.length) {
      push("## Takeaways", "");
      for (const t of c.practicalTakeaways) push(`- ${t}`);
      push("");
    } else if (kind === "sources" && c.sourceMap.length) {
      push("## Sources", "");
      c.sourceMap.forEach((s, i) => {
        push(`${i + 1}. [${mdLinkText(s.title)}](${mdUrl(s.url)}) (${sourceMeta(s).join(", ")})`);
        if (s.summary) push(`   ${oneLine(s.summary)}`);
      });
      push("");
      if (c.uncertaintyNotes.length) {
        push("### What we are unsure about", "");
        for (const n of c.uncertaintyNotes) push(`> ${oneLine(n)}`, ">");
        out.pop();
        push("");
      }
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/* ---------------------------------------------------------------- Plain text */

function underline(text: string, char: string): string[] {
  return [text, char.repeat(Math.max(3, text.length))];
}

/**
 * Render the content as plain text.
 *
 * The serializer introduces no Markdown links, hash headings or pipe tables.
 * It does not strip the backticks and double asterisks a content author may
 * have written into their own prose; rewriting someone's words to make a claim
 * about the format would be the wrong trade. Lines are not wrapped, because
 * wrapping at a guessed width is worse than letting the reader's tool do it.
 */
export function renderToText(c: RecapPageContent): string {
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(...underline(oneLine(c.topic).toUpperCase(), "="), "");
  push(oneLine(c.oneSentenceAnswer), "");
  push(
    [
      `~${readingMinutes(c)} min read`,
      fmtDate(c.generatedAt),
      `${c.sourceMap.length} source${c.sourceMap.length === 1 ? "" : "s"}`,
      String(c.audienceLevel),
    ].join(" | "),
    "",
  );
  if (c.fixture) push("Demo content from a fixture, not a live research run.", "");
  if (c.fiveMinutePath.length) {
    push("Reading path:");
    c.fiveMinutePath.forEach((s, i) => push(`  ${i + 1}. ${oneLine(s)}`));
    push("");
  }

  for (const kind of sectionOrder(c)) {
    if (kind === "matters" && c.whyItMatters.length) {
      push(...underline("The short version", "-"), "");
      c.whyItMatters.forEach((w, i) => push(`  ${i + 1}. ${oneLine(w)}`));
      push("");
    } else if (kind === "concept-map" && c.diagrams.length) {
      push(...underline("How it fits together", "-"), "");
      for (const d of c.diagrams) {
        push(`[diagram] ${oneLine(d.alt)}`);
        if (d.kind === "mermaid") {
          for (const line of d.code.split("\n")) push(`  ${line}`);
        }
        push("");
      }
    } else if (kind === "ideas" && c.keyIdeas.length) {
      push(...underline("Key ideas", "-"), "");
      for (const k of c.keyIdeas) push(oneLine(k.title), `  ${oneLine(k.body)}`, "");
    } else if (kind === "timeline" && c.timeline?.length) {
      push(...underline("Timeline", "-"), "");
      for (const t of c.timeline) push(`${oneLine(t.date)}: ${oneLine(t.title)}`, `  ${oneLine(t.body)}`, "");
    } else if (kind === "comparison" && c.comparisons?.length) {
      push(...underline("Comparison", "-"), "");
      for (const b of c.comparisons) {
        push(oneLine(b.title), "");
        for (const r of b.rows) {
          push(`  ${oneLine(r.name)}`);
          // A fixed-width table cannot survive an unknown terminal width, so
          // the rows are spelled out one field per line instead.
          for (const col of b.columns) push(`    ${oneLine(col)}: ${oneLine(r.cells[col] ?? "-")}`);
          push("");
        }
      }
    } else if (kind === "examples" && (c.examples.length || c.analogies.length)) {
      push(...underline("Make it concrete", "-"), "");
      for (const e of c.examples) push(`Example: ${oneLine(e.title)}`, `  ${oneLine(e.body)}`, "");
      for (const a of c.analogies) push("Analogy", `  ${oneLine(a.setup)}`, `  ${oneLine(a.takeaway)}`, "");
    } else if (kind === "misconceptions" && c.misconceptions.length) {
      push(...underline("Myth vs truth", "-"), "");
      for (const m of c.misconceptions) push(`  Myth:  ${oneLine(m.myth)}`, `  Truth: ${oneLine(m.truth)}`, "");
    } else if (kind === "glossary" && c.glossary.length) {
      push(...underline("Glossary", "-"), "");
      for (const g of c.glossary) push(`  ${oneLine(g.term)}: ${oneLine(g.definition)}`);
      push("");
    } else if (kind === "takeaways" && c.practicalTakeaways.length) {
      push(...underline("Takeaways", "-"), "");
      for (const t of c.practicalTakeaways) push(`  - ${oneLine(t)}`);
      push("");
    } else if (kind === "sources" && c.sourceMap.length) {
      push(...underline("Sources", "-"), "");
      c.sourceMap.forEach((s, i) => {
        push(`  [${i + 1}] ${oneLine(s.title)}`, `      ${s.url}`, `      ${sourceMeta(s).join(", ")}`);
        if (s.summary) push(`      ${oneLine(s.summary)}`);
        push("");
      });
      if (c.uncertaintyNotes.length) {
        push("What we are unsure about", "");
        for (const n of c.uncertaintyNotes) push(`  ${oneLine(n)}`);
        push("");
      }
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/**
 * Parse and validate unknown JSON, then serialize. Throws the same descriptive
 * `Invalid RecapPageContent` error `renderFromJson` throws. This is the entry
 * point the CLI uses for the non-HTML formats.
 */
export function serializeToFormat(c: RecapPageContent, format: SerializeFormat): string {
  return format === "md" ? renderToMarkdown(c) : renderToText(c);
}
