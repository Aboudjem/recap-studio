import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { z } from "zod";
import {
  appendSource,
  findByUrl,
  hashUrl,
  parseRecapPageContent,
} from "@recap-studio/content-pipeline";
import { runValidation, reportMarkdown } from "@recap-studio/validation";
import { renderFromJson } from "@recap-studio/html-renderer";

export interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
}

interface ToolDef<T extends z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: unknown;
  input: T;
  handler: (args: z.infer<T>) => Promise<unknown> | unknown;
}

function artifactsRoot(): string {
  return resolve(process.cwd(), "artifacts");
}

function ensureDir(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}

/**
 * Resolve artifacts/<slug>/<filename> and refuse anything that lands outside
 * the artifacts folder. A slug or filename with `..` or an absolute path must
 * never let a tool call read or write elsewhere on disk.
 */
export function artifactPath(slug: string, filename: string): string {
  const root = artifactsRoot();
  const path = resolve(root, slug, filename);
  const rel = relative(root, path);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`refused: ${join(slug, filename)} resolves outside artifacts/`);
  }
  return path;
}

/**
 * Find the content JSON for a slug. The first match wins:
 *   1. an explicit `path` (relative to the working directory)
 *   2. artifacts/<slug>/content.json   (any project: where the skills write)
 *   3. apps/recap-web/src/content/<slug>.json   (a recap-studio checkout)
 *   4. fixtures/topics/<slug>.json              (a recap-studio checkout)
 */
export function resolveContentPath(slug: string, path?: string): string {
  const cwd = process.cwd();
  const candidates = [
    ...(path ? [resolve(cwd, path)] : []),
    join(artifactsRoot(), slug, "content.json"),
    join(cwd, "apps", "recap-web", "src", "content", `${slug}.json`),
    join(cwd, "fixtures", "topics", `${slug}.json`),
  ];
  const found = candidates.find((c) => existsSync(c));
  if (!found) {
    throw new Error(
      `no content for slug "${slug}". Looked in: ${candidates.map((c) => relative(cwd, c) || c).join(", ")}. ` +
        `Save the content JSON with create_run_artifact as artifacts/${slug}/content.json first.`,
    );
  }
  return found;
}

const CreateArtifact = z.object({
  slug: z.string().min(1),
  filename: z.string().min(1),
  content: z.string().min(1),
});

const ReadArtifact = z.object({
  slug: z.string().min(1),
  filename: z.string().min(1),
});

const CacheSource = z.object({
  url: z.string().url(),
  summary: z.string().min(1),
  excerpt: z.string().max(8192).default(""),
  publisher: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
});

const GenerateMermaid = z.object({
  code: z.string().min(1),
  alt: z.string().min(8),
});

const RenderScreenshot = z.object({
  url: z.string().url(),
  outPath: z.string().min(1),
});

const RunAccessibility = z.object({
  url: z.string().url().optional(),
  htmlPath: z.string().min(1).optional(),
});

const RunLighthouse = z.object({
  url: z.string().url(),
});

const DeployVercelPreview = z.object({
  confirmed: z.boolean(),
});

const SendEmailDraft = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  confirmed: z.boolean(),
});

const ValidateContent = z.object({
  slug: z.string().min(1),
  path: z.string().min(1).optional(),
});

const RenderRecapHtml = z.object({
  slug: z.string().min(1),
  path: z.string().min(1).optional(),
  theme: z.enum(["dark", "light", "auto"]).default("dark"),
});

export const tools: Array<ToolDef<z.ZodTypeAny>> = [
  {
    name: "create_run_artifact",
    description:
      "Persist a Recap Studio artifact under artifacts/<slug>/<filename>. Use for generated content JSON, diagrams, reports.",
    input: CreateArtifact,
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        filename: { type: "string" },
        content: { type: "string" },
      },
      required: ["slug", "filename", "content"],
    },
    handler: ({ slug, filename, content }) => {
      const path = artifactPath(slug, filename);
      ensureDir(path);
      writeFileSync(path, content, "utf8");
      return { ok: true, path };
    },
  },
  {
    name: "read_run_artifact",
    description: "Read a previously persisted artifact.",
    input: ReadArtifact,
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        filename: { type: "string" },
      },
      required: ["slug", "filename"],
    },
    handler: ({ slug, filename }) => {
      const path = artifactPath(slug, filename);
      if (!existsSync(path)) {
        throw new Error(`artifact not found: ${path}`);
      }
      return { ok: true, path, content: readFileSync(path, "utf8") };
    },
  },
  {
    name: "cache_source",
    description:
      "Append a research source to .recap-studio/cache/sources.jsonl. Idempotent on URL hash.",
    input: CacheSource,
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        summary: { type: "string" },
        excerpt: { type: "string" },
        publisher: { type: "string" },
        publishedAt: { type: ["string", "null"] },
      },
      required: ["url", "summary"],
    },
    handler: ({ url, summary, excerpt, publisher, publishedAt }) => {
      const existing = findByUrl(url);
      if (existing) return { ok: true, cached: false, id: existing.id };
      const id = "src-" + hashUrl(url);
      const file = appendSource({
        id,
        url,
        fetchedAt: new Date().toISOString(),
        contentHash: hashUrl(url + summary),
        summary,
        publisher,
        publishedAt: publishedAt ?? null,
        excerpt: (excerpt ?? "").slice(0, 8192),
      });
      return { ok: true, cached: true, id, file };
    },
  },
  {
    name: "generate_mermaid_diagram",
    description: "Validate a Mermaid diagram source and return a normalized snippet plus required alt text.",
    input: GenerateMermaid,
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        alt: { type: "string" },
      },
      required: ["code", "alt"],
    },
    handler: ({ code, alt }) => {
      const trimmed = code.trim();
      if (!/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|timeline|gantt|gitGraph|pie|quadrantChart)/m.test(trimmed)) {
        throw new Error("mermaid code must start with a recognized diagram type");
      }
      return { ok: true, code: trimmed, alt };
    },
  },
  {
    name: "render_page_screenshot",
    description: "(scaffold) Render a screenshot of the given URL using Playwright. Disabled until Playwright is installed locally.",
    input: RenderScreenshot,
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        outPath: { type: "string" },
      },
      required: ["url", "outPath"],
    },
    handler: () => {
      return {
        ok: false,
        skipped: true,
        reason:
          "Playwright is not bundled. Install in apps/recap-web and wire up here when needed.",
      };
    },
  },
  {
    name: "run_accessibility_scan",
    description: "(scaffold) Run an axe-core scan against a URL or local HTML snapshot. Disabled until axe is installed.",
    input: RunAccessibility,
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
        htmlPath: { type: "string" },
      },
      required: [],
    },
    handler: () => {
      return {
        ok: false,
        skipped: true,
        reason:
          "axe-core not bundled. Use `@recap-studio/validation`'s static checks until installed.",
      };
    },
  },
  {
    name: "run_lighthouse_summary",
    description: "(scaffold) Run a Lighthouse summary. Disabled until lighthouse is installed locally.",
    input: RunLighthouse,
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", format: "uri" },
      },
      required: ["url"],
    },
    handler: () => {
      return {
        ok: false,
        skipped: true,
        reason: "Lighthouse not bundled. Use `vercel inspect` or a CI runner.",
      };
    },
  },
  {
    name: "deploy_vercel_preview",
    description:
      "(stub) Never deploys. Checks that confirmed: true and VERCEL_TOKEN are set, then returns the shell command that deploys a Vercel preview, for you to run yourself.",
    input: DeployVercelPreview,
    inputSchema: {
      type: "object",
      properties: { confirmed: { type: "boolean" } },
      required: ["confirmed"],
    },
    handler: ({ confirmed }) => {
      if (!confirmed) {
        return { ok: false, reason: "must pass confirmed: true" };
      }
      if (!process.env.VERCEL_TOKEN) {
        return { ok: false, reason: "VERCEL_TOKEN missing in env" };
      }
      // We intentionally do NOT execute the deploy from inside the MCP server.
      // Side-effect tools surface a script path instead, keeping intent in the
      // user's shell where they can audit it.
      return {
        ok: true,
        deployed: false,
        next: "run `bash scripts/deploy-preview.sh` from the root of a recap-studio checkout",
      };
    },
  },
  {
    name: "send_email_draft",
    description:
      "(stub) Never sends email. Returns the draft (to, subject, first 200 characters of the body) for you to paste into your mail client.",
    input: SendEmailDraft,
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", format: "email" },
        subject: { type: "string" },
        body: { type: "string" },
        confirmed: { type: "boolean" },
      },
      required: ["to", "subject", "body", "confirmed"],
    },
    handler: ({ to, subject, body, confirmed }) => {
      // Recap Studio ships no send code. Whatever `confirmed` says, the answer
      // is the draft and the next step, never a sent message.
      return {
        ok: false,
        sent: false,
        draftOnly: true,
        to,
        subject,
        preview: body.slice(0, 200),
        nextStep: confirmed
          ? "Recap Studio does not send email. Paste this draft into your mail client and send it there."
          : "Draft only. Recap Studio does not send email; paste the draft into your mail client.",
      };
    },
  },
  {
    name: "validate_content",
    description:
      "Run the deterministic validation suite against a content JSON and return a Markdown report, verdict first. Reads artifacts/<slug>/content.json, or the optional path.",
    input: ValidateContent,
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        path: { type: "string", description: "Optional path to the content JSON, relative to the working directory." },
      },
      required: ["slug"],
    },
    handler: ({ slug, path }) => {
      const file = resolveContentPath(slug, path);
      const content = parseRecapPageContent(JSON.parse(readFileSync(file, "utf8")));
      const report = runValidation(content);
      return { ok: true, source: file, report, markdown: reportMarkdown(report) };
    },
  },
  {
    name: "render_recap_html",
    description:
      "Render a RecapPageContent JSON into ONE self-contained, dark-mode HTML file: inlined CSS, zero JavaScript, opens with a double-click offline. Reads artifacts/<slug>/content.json (or the optional path) and writes artifacts/<slug>/recap-<slug>.html. Works in any project and any MCP client.",
    input: RenderRecapHtml,
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        path: { type: "string", description: "Optional path to the content JSON, relative to the working directory." },
        theme: { type: "string", enum: ["dark", "light", "auto"] },
      },
      required: ["slug"],
    },
    handler: ({ slug, path, theme }) => {
      const file = resolveContentPath(slug, path);
      const html = renderFromJson(JSON.parse(readFileSync(file, "utf8")), { theme });
      const outPath = artifactPath(slug, `recap-${slug}.html`);
      ensureDir(outPath);
      writeFileSync(outPath, html, "utf8");
      return { ok: true, source: file, path: outPath, bytes: Buffer.byteLength(html, "utf8"), selfContained: true };
    },
  },
];
