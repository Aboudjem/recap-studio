/**
 * @recap-studio/mcp-server
 *
 * Optional local MCP server. The plugin is fully functional without it; the
 * server exposes nice-to-have tools (artifact store, source cache, diagram
 * renderer, and stubs for screenshot, a11y, lighthouse, Vercel preview and
 * email draft).
 *
 * No tool deploys or sends email. The deploy stub returns the shell command
 * to run yourself; the email stub returns the draft.
 *
 * MCP transport is intentionally minimal: a JSON-RPC line-delimited reader
 * over stdio that answers `initialize`, `ping`, `tools/list` and `tools/call`.
 * It has no dependency beyond zod, so the whole server bundles into the one
 * file the plugin ships (bin/recap.mjs, started with `recap mcp`).
 *
 * This module only exports. Importing it never starts a server: the entry
 * points are src/bin.ts (this package) and `recap mcp` (the CLI).
 */
import { createInterface } from "node:readline";
import { tools, type ToolCall } from "./tools.js";

/** Reported in `initialize`. Kept equal to the repo version by a test. */
export const SERVER_VERSION = "0.6.2";

/** Protocol revisions this server speaks, newest first. */
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

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

/**
 * Returns the RpcResponse, or `null` for notifications (requests with no `id`),
 * which per JSON-RPC / MCP MUST NOT receive a response.
 */
async function handle(req: RpcRequest): Promise<RpcResponse | null> {
  const isNotification = req.id === undefined || req.id === null;
  const id = req.id ?? null;
  // Notifications (e.g. notifications/initialized) get no response.
  if (isNotification && req.method.startsWith("notifications/")) return null;
  try {
    switch (req.method) {
      case "initialize": {
        // Echo the client's revision when we speak it, else offer our newest.
        const asked = (req.params as { protocolVersion?: unknown } | undefined)?.protocolVersion;
        const protocolVersion =
          typeof asked === "string" && PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0];
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion,
            serverInfo: { name: "recap-studio-mcp", version: SERVER_VERSION },
            capabilities: { tools: { listChanged: false } },
          },
        };
      }
      case "notifications/initialized":
        return null;
      case "ping":
        return { jsonrpc: "2.0", id, result: {} };
      case "tools/list":
        return { jsonrpc: "2.0", id, result: listTools() };
      case "tools/call": {
        const out = await callTool(req.params as ToolCall);
        // MCP spec: tool results are content items of type "text" (not "json").
        // We serialize structured results to a JSON string in a text block so
        // every compliant client (Cursor, VS Code, Codex, Continue) can read it.
        const text = typeof out === "string" ? out : JSON.stringify(out, null, 2);
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
      }
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

/** Serve MCP over stdio until stdin closes. */
export async function runServer(): Promise<void> {
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
    if (res !== null) process.stdout.write(JSON.stringify(res) + "\n");
  }
}

export { tools, handle };
