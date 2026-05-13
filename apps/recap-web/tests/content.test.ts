import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Smoke test the active content artifact without booting Next.js.
 * Keeps CI fast and protects the page renderer from invalid content.
 */
describe("active content", () => {
  it("is valid JSON with required fields", () => {
    const path = resolve(__dirname, "..", "src", "content", "latest-ai-models.json");
    const data = JSON.parse(readFileSync(path, "utf8"));
    expect(data.slug).toBe("latest-ai-models");
    expect(typeof data.oneSentenceAnswer).toBe("string");
    expect(Array.isArray(data.keyIdeas)).toBe(true);
    expect(data.keyIdeas.length).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(data.sourceMap)).toBe(true);
    expect(data.sourceMap.length).toBeGreaterThanOrEqual(1);
  });
});
