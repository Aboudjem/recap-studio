import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tools } from "./tools.js";
import { handle } from "./index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("MCP tool registry", () => {
  it("exposes the ten documented tools", () => {
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "cache_source",
      "create_run_artifact",
      "deploy_vercel_preview",
      "generate_mermaid_diagram",
      "read_run_artifact",
      "render_page_screenshot",
      "render_recap_html",
      "run_accessibility_scan",
      "run_lighthouse_summary",
      "send_email_draft",
      "validate_content",
    ].sort());
  });

  it("refuses to deploy without confirmation", async () => {
    const tool = tools.find((t) => t.name === "deploy_vercel_preview")!;
    const res = await tool.handler({ confirmed: false } as never);
    assert.deepEqual((res as { ok: boolean; reason: string }), {
      ok: false,
      reason: "must pass confirmed: true",
    });
  });

  it("refuses to send email without confirmation", async () => {
    const tool = tools.find((t) => t.name === "send_email_draft")!;
    const res = (await tool.handler({
      to: "x@example.com",
      subject: "x",
      body: "y",
      confirmed: false,
    } as never)) as { ok: boolean; draftOnly: boolean };
    assert.equal(res.ok, false);
    assert.equal(res.draftOnly, true);
  });

  it("validates mermaid diagram type prefix", async () => {
    const tool = tools.find((t) => t.name === "generate_mermaid_diagram")!;
    await assert.rejects(
      async () => tool.handler({ code: "not a real diagram", alt: "alt text here" } as never),
      /recognized diagram type/,
    );
    const ok = (await tool.handler({
      code: "flowchart TD\nA --> B",
      alt: "concept map",
    } as never)) as { ok: boolean };
    assert.equal(ok.ok, true);
  });

  it("render_recap_html produces a self-contained HTML file", async () => {
    const tool = tools.find((t) => t.name === "render_recap_html")!;
    const prev = process.cwd();
    process.chdir(repoRoot); // content lookup is relative to cwd
    try {
      const res = (await tool.handler({ slug: "latest-ai-models", theme: "dark" } as never)) as {
        ok: boolean;
        path: string;
        bytes: number;
        selfContained: boolean;
      };
      assert.equal(res.ok, true);
      assert.equal(res.selfContained, true);
      assert.ok(res.bytes > 5000, "non-trivial HTML produced");
      assert.match(res.path, /recap-latest-ai-models\.html$/);
    } finally {
      process.chdir(prev);
    }
  });
});

describe("MCP transport (JSON-RPC over stdio)", () => {
  it("tools/call returns a text content block (MCP-compliant, not type:json)", async () => {
    const res = await handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "generate_mermaid_diagram", arguments: { code: "flowchart TD\nA-->B", alt: "a concept map" } },
    });
    const result = res?.result as { content: Array<{ type: string; text: string }> };
    assert.equal(result.content[0]?.type, "text");
    assert.match(result.content[0]?.text ?? "", /"ok": true/);
  });

  it("notifications get no response (null)", async () => {
    const res = await handle({ jsonrpc: "2.0", method: "notifications/initialized" });
    assert.equal(res, null);
  });

  it("responds to ping", async () => {
    const res = await handle({ jsonrpc: "2.0", id: 7, method: "ping" });
    assert.deepEqual(res?.result, {});
  });

  it("initialize advertises protocol + tools capability", async () => {
    const res = await handle({ jsonrpc: "2.0", id: 0, method: "initialize" });
    const result = res?.result as { protocolVersion: string; capabilities: { tools: unknown } };
    assert.ok(result.protocolVersion, "has protocolVersion");
    assert.ok(result.capabilities.tools, "advertises tools capability");
  });
});
