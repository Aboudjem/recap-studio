import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("source vault", () => {
  it("indexes a small cache and finds keyword matches", async () => {
    // Point RECAP_STUDIO_HOME at a temp dir so we do not pollute the repo.
    const dir = mkdtempSync(join(tmpdir(), "recap-vault-"));
    process.env.RECAP_STUDIO_HOME = dir;
    mkdirSync(dir, { recursive: true });

    // Write a tiny JSONL cache that mirrors the on-disk format.
    const sources = join(dir, "sources.jsonl");
    writeFileSync(
      sources,
      [
        JSON.stringify({
          id: "src-001",
          url: "https://example.com/quantum",
          fetchedAt: new Date().toISOString(),
          contentHash: "abc",
          summary: "Quantum computing uses qubits and superposition for fast factoring",
          excerpt: "",
        }),
        JSON.stringify({
          id: "src-002",
          url: "https://example.com/llm",
          fetchedAt: new Date().toISOString(),
          contentHash: "def",
          summary: "Large language models train on tokens to predict next tokens",
          excerpt: "",
        }),
      ].join("\n") + "\n",
      "utf8",
    );

    // Dynamic import so the module reads env at construction time.
    const { indexCache, searchVault } = await import("./source-vault.js");
    const indexed = indexCache();
    assert.equal(indexed.length, 2);

    const hits = searchVault("qubits superposition");
    assert.equal(hits.length, 1);
    assert.equal(hits[0]?.url, "https://example.com/quantum");
  });
});
