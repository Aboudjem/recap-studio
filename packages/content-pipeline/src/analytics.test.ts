import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("analytics", () => {
  it("records view, section-read, and source-click events", async () => {
    process.env.RECAP_STUDIO_HOME = mkdtempSync(join(tmpdir(), "recap-analytics-"));
    const { recordEvent, readCounters } = await import("./analytics.js");

    recordEvent({ type: "view", slug: "x" });
    recordEvent({ type: "view", slug: "x" });
    recordEvent({ type: "section-read", slug: "x", sectionId: "hero" });
    recordEvent({ type: "source-click", slug: "x", sourceId: "s1" });

    const c = readCounters();
    assert.equal(c.views.x, 2);
    assert.equal(c.sections.x?.hero, 1);
    assert.equal(c.sources.x?.s1, 1);
  });
});
