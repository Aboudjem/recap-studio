import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { parseRecapPageContent, type RecapPageContent } from "@recap-studio/content-pipeline";
import { PreQuestions } from "~/components/sections/PreQuestions";
import { CheckBlock } from "~/components/sections/CheckBlock";

const fixture = resolve(__dirname, "..", "..", "..", "fixtures", "topics", "learning-mode-demo.json");

function load(): RecapPageContent {
  return parseRecapPageContent(JSON.parse(readFileSync(fixture, "utf8")));
}

/**
 * React escapes text nodes, so a needle taken straight from the JSON will miss
 * on any apostrophe. Escape the needle the same way before searching.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Strip the learn block the way a page without learning mode looks. */
function withoutLearn(content: RecapPageContent): RecapPageContent {
  const clone = structuredClone(content);
  delete clone.learn;
  return clone;
}

describe("PreQuestions", () => {
  it("renders one closed <details> per question, with the hint inside", () => {
    const content = load();
    const html = renderToStaticMarkup(<PreQuestions content={content} />);
    const questions = content.learn!.prequestions!;

    expect(html.match(/<details/g)?.length).toBe(questions.length);
    expect(html).not.toContain("<details open");
    for (const q of questions) {
      expect(html).toContain(esc(q.question));
      if (q.hint) expect(html).toContain(esc(q.hint));
    }
  });

  it("renders nothing without a learn block", () => {
    expect(renderToStaticMarkup(<PreQuestions content={withoutLearn(load())} />)).toBe("");
  });
});

describe("CheckBlock", () => {
  const content = load();
  const html = renderToStaticMarkup(<CheckBlock content={content} />);
  const checks = content.learn!.checks!;

  it("marks each check and gives its options one radio group", () => {
    expect(html.match(/data-learn="check"/g)?.length).toBe(checks.length);
    for (const check of checks) {
      expect(html).toContain(`name="check-${check.id}"`);
      expect(html).toContain(`id="${check.id}-option-0"`);
      const radios = html.match(new RegExp(`name="check-${check.id}"`, "g"));
      expect(radios?.length).toBe(check.options.length);
    }
  });

  it("keeps the verdict behind a closed reveal, so feedback follows the answer", () => {
    expect(html).not.toContain("<details open");
    expect(html.match(/Show the answer/g)?.length).toBe(checks.length);

    for (const check of checks) {
      const at = html.indexOf(`data-check-id="${check.id}"`);
      const revealAt = html.indexOf("Show the answer", at);
      const whyAt = html.indexOf(esc(check.why), at);
      // The `why` is the feedback. It must sit after the reveal's summary,
      // which is the only thing the reader can see before they commit.
      expect(revealAt).toBeGreaterThan(at);
      expect(whyAt).toBeGreaterThan(revealAt);
      // The right option appears twice: once as a choice, once in the reveal.
      expect(html.indexOf(esc(check.options[check.answer]!), revealAt)).toBeGreaterThan(revealAt);
    }
  });

  it("ships no script and no inline event handler", () => {
    expect(html).not.toContain("<script");
    expect(html).not.toMatch(/\son[a-z]+=/);
  });

  it("renders the cloze lines and the day 1 / 3 / 7 prompts", () => {
    expect(html).toContain('data-learn="cloze"');
    expect(html).toContain('data-learn="revision"');
    expect(html).toContain(esc(content.learn!.revision!.d1!));
    expect(html).toContain(esc(content.learn!.cloze![0]!.blanks.join(" · ")));
  });

  it("omits the answer line when the index points nowhere", () => {
    const broken = structuredClone(content);
    broken.learn!.checks = [{ ...checks[0]!, answer: 99 }];
    broken.learn!.cloze = [];
    delete broken.learn!.revision;
    const out = renderToStaticMarkup(<CheckBlock content={broken} />);
    expect(out).toContain("Show the answer");
    expect(out).not.toContain("Answer:");
  });

  it("renders nothing without a learn block", () => {
    expect(renderToStaticMarkup(<CheckBlock content={withoutLearn(load())} />)).toBe("");
  });
});
