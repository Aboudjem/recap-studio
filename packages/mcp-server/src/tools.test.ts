import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tools } from "./tools.js";

describe("MCP tool registry", () => {
  it("exposes the nine documented tools", () => {
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, [
      "cache_source",
      "create_run_artifact",
      "deploy_vercel_preview",
      "generate_mermaid_diagram",
      "read_run_artifact",
      "render_page_screenshot",
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
});
