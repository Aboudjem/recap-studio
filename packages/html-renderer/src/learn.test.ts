import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderToHtml } from "./index.js";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";

const here = dirname(fileURLToPath(import.meta.url));
const learnPath = resolve(here, "../../../fixtures/topics/learning-mode-demo.json");
const plainPath = resolve(here, "../../../fixtures/topics/latest-ai-models.json");
const learnRaw = JSON.parse(readFileSync(learnPath, "utf8"));
const learnContent = parseRecapPageContent(learnRaw);
const plainContent = parseRecapPageContent(JSON.parse(readFileSync(plainPath, "utf8")));

/** Everything outside the inlined <style>, i.e. what the reader actually gets. */
function body(html: string): string {
  return html.replace(/<style>[\s\S]*?<\/style>/g, "");
}

test("learning mode renders both sections and stays script-free", () => {
  const html = renderToHtml(learnContent);
  assert.ok(html.includes('id="prequestions"'), "has the prequestions section");
  assert.ok(html.includes('id="checks"'), "has the checks section");
  assert.ok(!/<script/i.test(html), "no <script> tags");
  assert.ok(!html.includes("/_next/"), "no Next.js asset paths");
  assert.ok(!/\son[a-z]+=/i.test(body(html)), "no inline event handlers");
});

test("prequestions precede the five-minute path, checks follow the material", () => {
  const html = renderToHtml(learnContent);
  const at = (id: string) => html.indexOf(`id="${id}"`);
  assert.ok(at("hero") < at("prequestions"), "prequestions sit after the hero");
  assert.ok(at("prequestions") < at("matters"), "and before the five-minute path");
  assert.ok(at("ideas") < at("checks"), "checks come after the key ideas");
  assert.ok(at("checks") < at("takeaways"), "and before the takeaways");
});

test("every check is a fieldset of radios with the verdict behind a closed details", () => {
  const html = body(renderToHtml(learnContent));
  const checks = learnContent.learn!.checks!;
  assert.equal((html.match(/data-learn="check"/g) ?? []).length, checks.length);
  assert.ok(!/<details[^>]*\sopen/.test(html), "nothing is pre-opened on screen");

  for (const c of checks) {
    const at = html.indexOf(`data-check-id="${c.id}"`);
    assert.ok(at > -1, `${c.id} is rendered`);
    const radios = html.slice(at).match(new RegExp(`name="check-${c.id}"`, "g")) ?? [];
    assert.equal(radios.length, c.options.length, `${c.id} has one radio per option`);
    const summaryAt = html.indexOf("Show the answer", at);
    const whyAt = html.indexOf(c.why.slice(0, 24), at);
    assert.ok(summaryAt > at && whyAt > summaryAt, `${c.id} reveals feedback after the summary`);
  }
});

test("a page without a learn block renders exactly as before", () => {
  const html = body(renderToHtml(plainContent));
  for (const marker of ['id="prequestions"', 'id="checks"', "data-learn", "recap-quiz", 'type="radio"']) {
    assert.ok(!html.includes(marker), `no ${marker} leaks into a plain page`);
  }
});

test("an explicitly disabled learn block renders nothing", () => {
  const off = parseRecapPageContent({ ...learnRaw, learn: { ...learnRaw.learn, enabled: false } });
  const html = body(renderToHtml(off));
  assert.ok(!html.includes('id="prequestions"'));
  assert.ok(!html.includes('id="checks"'));
});

test("print mode forces the reveals open so paper shows the answers", () => {
  const html = renderToHtml(learnContent, { print: true });
  assert.match(html, /details\.recap-answer-box > \*:not\(summary\) \{ display: block !important; \}/);
});

test("the learning classes do not collide with the takeaway checkmark", () => {
  const html = renderToHtml(learnContent);
  // .recap-check is the takeaway badge and predates learning mode; the quiz
  // fieldset must not borrow it, or the badge inherits the fieldset's padding.
  assert.ok(html.includes('<span class="recap-check">'), "takeaway badge keeps its class");
  assert.ok(html.includes('class="recap-quiz"'), "the quiz uses its own class");
});
