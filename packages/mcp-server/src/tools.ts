import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
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
});

const RenderRecapHtml = z.object({
  slug: z.string().min(1),
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
      const path = join(artifactsRoot(), slug, filename);
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
      const path = join(artifactsRoot(), slug, filename);
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
      "Deploy the recap-web app as a Vercel preview. Refuses unless confirmed: true and VERCEL_TOKEN is set.",
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
        next: "run `bash scripts/deploy-preview.sh` from the repo root",
      };
    },
  },
  {
    name: "send_email_draft",
    description:
      "Compose an email draft for the latest Recap. Refuses to send unless confirmed: true and RESEND_API_KEY is set.",
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
      if (!confirmed) {
        return { ok: false, draftOnly: true, to, subject, preview: body.slice(0, 200) };
      }
      if (!process.env.RESEND_API_KEY) {
        return { ok: false, reason: "RESEND_API_KEY missing in env" };
      }
      // Real send is left to the deploy script after a /recap setup pass.
      return {
        ok: true,
        nextStep: "scripts/send-email.sh implements the actual send when wired up",
      };
    },
  },
  {
    name: "validate_content",
    description:
      "Run the deterministic validation suite against a stored content artifact and return a Markdown report.",
    input: ValidateContent,
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
    handler: ({ slug }) => {
      const file = join(
        resolve(process.cwd(), "apps", "recap-web", "src", "content"),
        `${slug}.json`,
      );
      const fallback = join(resolve(process.cwd(), "fixtures", "topics"), `${slug}.json`);
      const path = existsSync(file) ? file : fallback;
      const content = parseRecapPageContent(JSON.parse(readFileSync(path, "utf8")));
      const report = runValidation(content);
      return { ok: true, report, markdown: reportMarkdown(report) };
    },
  },
  {
    name: "render_recap_html",
    description:
      "Render a stored RecapPageContent (by slug) into ONE self-contained, dark-mode HTML file: inlined CSS, zero JavaScript, opens with a double-click offline. Writes artifacts/<slug>/recap-<slug>.html. This is the cross-editor way to turn content into a shareable page — no Claude Code required.",
    input: RenderRecapHtml,
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        theme: { type: "string", enum: ["dark", "light", "auto"] },
      },
      required: ["slug"],
    },
    handler: ({ slug, theme }) => {
      const live = join(
        resolve(process.cwd(), "apps", "recap-web", "src", "content"),
        `${slug}.json`,
      );
      const fixture = join(resolve(process.cwd(), "fixtures", "topics"), `${slug}.json`);
      const path = existsSync(live) ? live : fixture;
      if (!existsSync(path)) {
        throw new Error(`no content for slug "${slug}" (looked in apps/recap-web/src/content and fixtures/topics)`);
      }
      const html = renderFromJson(JSON.parse(readFileSync(path, "utf8")), { theme });
      const outPath = join(artifactsRoot(), slug, `recap-${slug}.html`);
      ensureDir(outPath);
      writeFileSync(outPath, html, "utf8");
      return { ok: true, path: outPath, bytes: Buffer.byteLength(html, "utf8"), selfContained: true };
    },
  },
];
