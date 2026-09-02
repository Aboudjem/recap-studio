import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parseRecapPageContent, type RecapPageContent } from "@recap-studio/content-pipeline";
import { renderToMarkdown, renderToText, serializeFromJson } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(here, "../../../fixtures/topics/latest-ai-models.json");
const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
const content = parseRecapPageContent(raw);

/** Reparse the fixture with one field changed, without touching the shared object. */
function variant(mutate: (r: Record<string, unknown>) => void): RecapPageContent {
  const copy = JSON.parse(readFileSync(fixturePath, "utf8"));
  mutate(copy);
  return parseRecapPageContent(copy);
}

test("markdown opens with the title, the answer and the reading path", () => {
  const md = renderToMarkdown(content);
  assert.ok(md.startsWith(`# ${content.topic}`), "starts with an h1 carrying the topic");
  assert.match(md, /\n> /, "the one-sentence answer is a blockquote");
  assert.match(md, /min read \| \d{4}-\d{2}-\d{2} \| \d+ sources? \| \w+/, "metadata line");
  assert.match(md, /\*\*Reading path\*\*/, "the five-minute path is not dropped");
  assert.ok(md.endsWith("\n"), "ends with exactly one newline");
});

test("both formats carry every source URL and its available metadata", () => {
  const md = renderToMarkdown(content);
  const txt = renderToText(content);
  for (const s of content.sourceMap) {
    assert.ok(md.includes(s.url), `markdown has ${s.url}`);
    assert.ok(txt.includes(s.url), `text has ${s.url}`);
  }
  // Source summaries are rendered by the HTML; they must not vanish here.
  const withSummary = content.sourceMap.find((s) => s.summary);
  if (withSummary?.summary) {
    assert.ok(md.includes(withSummary.summary.split("\n")[0]!.slice(0, 40)), "markdown keeps summaries");
  }
});

test("optional source metadata is joined only when it exists", () => {
  const c = variant((r) => {
    const sources = r.sourceMap as Array<Record<string, unknown>>;
    delete sources[0]!.publisher;
    sources[0]!.publishedAt = null;
  });
  const md = renderToMarkdown(c);
  assert.ok(!md.includes(", , "), "no empty slot between separators");
  assert.ok(!md.includes(", )"), "no trailing separator before the close paren");
  assert.match(md, /\(primary/, "the markers that do exist are still there");
});

test("the comparison becomes a real GFM table, and no table when there is none", () => {
  const md = renderToMarkdown(content);
  assert.ok(content.comparisons && content.comparisons.length > 0, "the fixture has comparisons");
  assert.match(md, /\n\| --- \|/, "a header separator row is present");

  // The fixture always carries comparisons, so the negative case needs one removed.
  const without = variant((r) => {
    delete r.comparisons;
    r.visualSections = (r.visualSections as Array<{ kind: string }>).filter((s) => s.kind !== "comparison");
  });
  assert.ok(!renderToMarkdown(without).includes("| --- |"), "no table without comparisons");
});

test("table cells survive pipes and newlines in the content", () => {
  const c = variant((r) => {
    const cmp = (r.comparisons as Array<{ rows: Array<{ name: string; cells: Record<string, string> }>; columns: string[] }>)[0]!;
    const col = cmp.columns[0]!;
    cmp.rows[0]!.name = "a | b";
    cmp.rows[0]!.cells[col] = "line one\nline two | piped";
  });
  const md = renderToMarkdown(c);
  const row = md.split("\n").find((l) => l.startsWith("| a "));
  assert.ok(row, "the row is emitted");
  assert.ok(row!.includes("a \\| b"), "pipes in a cell are escaped");
  assert.ok(row!.includes("line one line two \\| piped"), "newlines are collapsed, pipes escaped");
});

test("link delimiters in a source title or url cannot break the link", () => {
  const c = variant((r) => {
    const sources = r.sourceMap as Array<Record<string, unknown>>;
    sources[0]!.title = "Report [2026] (final)";
    sources[0]!.url = "https://example.com/a(b)c";
  });
  const md = renderToMarkdown(c);
  assert.ok(md.includes("\\[2026\\]"), "brackets in the title are escaped");
  assert.ok(md.includes("(<https://example.com/a(b)c>)"), "a url with parens uses the angle-bracket form");
});

test("concept-map diagrams are not silently dropped", () => {
  assert.ok(content.diagrams.length > 0, "the fixture has diagrams");
  const md = renderToMarkdown(content);
  const txt = renderToText(content);
  assert.match(md, /## How it fits together/);
  for (const d of content.diagrams) {
    if (d.kind === "mermaid") {
      assert.ok(md.includes("```mermaid"), "mermaid gets a fenced block");
      assert.ok(md.includes(d.code.split("\n")[0]!), "with its source");
    } else {
      assert.ok(md.includes(`_Diagram: ${d.alt}_`), "svg is represented by its alt text");
      assert.ok(!md.includes("<svg"), "raw svg markup is not inlined into markdown");
    }
    assert.ok(txt.includes(d.alt), "text names every diagram");
  }
});

test("both formats follow visualSections order and deduplicate like the html", () => {
  const md = renderToMarkdown(content);
  const idxIdeas = md.indexOf("## Key ideas");
  const idxSources = md.indexOf("## Sources");
  assert.ok(idxIdeas > 0 && idxSources > idxIdeas, "sections come out in the declared order");

  // examples and analogies share one section; it must appear once.
  assert.equal(md.split("## Make it concrete").length - 1, 1, "the shared section is emitted once");

  // A disabled section disappears from both formats.
  const noGlossary = variant((r) => {
    r.visualSections = (r.visualSections as Array<{ kind: string; enabled?: boolean }>).map((s) =>
      s.kind === "glossary" ? { ...s, enabled: false } : s,
    );
  });
  assert.ok(!renderToMarkdown(noGlossary).includes("## Glossary"), "disabled sections are skipped");
  assert.ok(renderToMarkdown(content).includes("## Glossary"), "and present when enabled");
});

test("an unknown section kind is skipped, not crashed on", () => {
  const c = variant((r) => {
    (r.visualSections as Array<unknown>).push({ kind: "deep-dive", id: "dd", enabled: true });
  });
  assert.doesNotThrow(() => renderToMarkdown(c));
  assert.doesNotThrow(() => renderToText(c));
});

test("plain text introduces no markdown links, hash headings or pipe tables", () => {
  const txt = renderToText(content);
  // This pins the serializer's own output, not the content: prose the author
  // wrote with backticks or asterisks passes through untouched by design.
  assert.ok(!/^#/m.test(txt), "no hash headings");
  assert.ok(!txt.includes("]("), "no markdown link syntax");
  assert.ok(!/^\|/m.test(txt), "no pipe table rows");
  assert.match(txt, /^[A-Z0-9 ,.:'"()-]+\n=+$/m, "the title is underlined instead");
});

test("both serializers are stable across calls", () => {
  assert.equal(renderToMarkdown(content), renderToMarkdown(content));
  assert.equal(renderToText(content), renderToText(content));
});

test("serializeFromJson validates first and throws the renderer's error", () => {
  assert.throws(() => serializeFromJson({}, "md"), /Invalid RecapPageContent/);
  assert.throws(() => serializeFromJson({}, "txt"), /Invalid RecapPageContent/);
  assert.ok(serializeFromJson(raw, "md").startsWith("# "));
});
