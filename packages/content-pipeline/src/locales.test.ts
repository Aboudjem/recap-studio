import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveStrings, STRINGS } from "./locales.js";

describe("locales", () => {
  it("returns en for unknown locale codes", () => {
    assert.equal(resolveStrings("xx").footerTagline, STRINGS.en.footerTagline);
  });

  it("returns en when locale is undefined", () => {
    assert.equal(resolveStrings(undefined).skipToSummary, "Skip to summary");
  });

  it("returns fr when fr is asked", () => {
    assert.match(resolveStrings("fr").skipToSummary, /Aller au/);
  });

  it("ships exactly six locales", () => {
    assert.equal(Object.keys(STRINGS).length, 6);
  });
});
