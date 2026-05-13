#!/usr/bin/env node
/**
 * @recap-studio/mcp-server
 *
 * Optional local MCP server. The plugin is fully functional without it; the
 * server exposes nice-to-have tools (artifact store, source cache, diagram
 * renderer, screenshot, a11y/lighthouse summaries, Vercel preview helper,
 * email draft helper).
 *
 * Side-effect tools (deploy, email) refuse to run unless config + env are
 * present AND the caller passes `confirmed: true`.
 *
 * MCP transport is intentionally minimal: a JSON-RPC line-delimited reader
 * over stdio that responds to `tools/list` and `tools/call`. Real consumers
 * should plug a full @modelcontextprotocol/sdk transport — this scaffold
 * gives them a working contract until the SDK is installed.
 */
import { createInterface } from "node:readline";
import { tools, type ToolCall } from "./tools.js";

interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface RpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

function listTools(): unknown {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
}

async function callTool(params: ToolCall): Promise<unknown> {
  const tool = tools.find((t) => t.name === params.name);
  if (!tool) {
    throw new Error(`unknown tool: ${params.name}`);
  }
  const args = tool.input.parse(params.arguments ?? {});
  // The runtime cast below is safe because `tool.input` was used to derive `args`.
  return tool.handler(args as never);
}

async function handle(req: RpcRequest): Promise<RpcResponse> {
  const id = req.id ?? null;
  try {
    switch (req.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2025-06-18",
            serverInfo: { name: "recap-studio-mcp", version: "0.1.0" },
            capabilities: { tools: {} },
          },
        };
      case "tools/list":
        return { jsonrpc: "2.0", id, result: listTools() };
      case "tools/call":
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "json", json: await callTool(req.params as ToolCall) }] },
        };
      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `method not found: ${req.method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

async function main() {
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let req: RpcRequest | undefined;
    try {
      req = JSON.parse(trimmed) as RpcRequest;
    } catch {
      continue;
    }
    const res = await handle(req);
    process.stdout.write(JSON.stringify(res) + "\n");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

export { tools, handle };
