/**
 * RecapPageContent — the typed contract between the agent pipeline and the
 * Next.js renderer. Every important claim links to one or more sources via
 * `sourceIds`. Designed for incremental rendering and validation.
 */
import { z } from "zod";

export const AudienceLevel = z.enum(["beginner", "intermediate", "expert"]);
export type AudienceLevel = z.infer<typeof AudienceLevel>;

export const Severity = z.enum(["info", "low", "medium", "high", "blocker"]);
export type Severity = z.infer<typeof Severity>;

export const SourceMapItem = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  fetchedAt: z.string().optional(),
  composite: z.number().min(0).max(10),
  reliability: z.number().min(0).max(5).optional(),
  freshness: z.number().min(0).max(5).optional(),
  relevance: z.number().min(0).max(5).optional(),
  independence: z.number().min(0).max(5).optional(),
  primary: z.boolean().default(true),
  provenance: z.enum(["live", "fixture"]).default("fixture"),
  summary: z.string().optional(),
  claims: z.array(z.string()).default([]),
  conflict: z.boolean().default(false),
});
export type SourceMapItem = z.infer<typeof SourceMapItem>;

const Cited = z.object({
  sourceIds: z.array(z.string()).min(0).default([]),
});

export const KeyIdea = Cited.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().optional(),
});
export type KeyIdea = z.infer<typeof KeyIdea>;

export const VisualSectionKind = z.enum([
  "hero",
  "matters",
  "concept-map",
  "ideas",
  "timeline",
  "comparison",
  "examples",
  "analogies",
  "misconceptions",
  "glossary",
  "takeaways",
  "sources",
  "deep-dive",
]);
export type VisualSectionKind = z.infer<typeof VisualSectionKind>;

export const VisualSection = z.object({
  kind: VisualSectionKind,
  id: z.string().min(1),
  enabled: z.boolean().default(true),
});
export type VisualSection = z.infer<typeof VisualSection>;

export const TimelineItem = Cited.extend({
  date: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});
export type TimelineItem = z.infer<typeof TimelineItem>;

export const ComparisonRow = Cited.extend({
  name: z.string().min(1),
  cells: z.record(z.string(), z.string()),
});
export type ComparisonRow = z.infer<typeof ComparisonRow>;

export const ComparisonBlock = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  columns: z.array(z.string().min(1)).min(2),
  rows: z.array(ComparisonRow).min(2),
});
export type ComparisonBlock = z.infer<typeof ComparisonBlock>;

export const ExampleBlock = Cited.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});
export type ExampleBlock = z.infer<typeof ExampleBlock>;

export const AnalogyBlock = z.object({
  id: z.string().min(1),
  setup: z.string().min(1),
  takeaway: z.string().min(1),
});
export type AnalogyBlock = z.infer<typeof AnalogyBlock>;

export const Misconception = Cited.extend({
  id: z.string().min(1),
  myth: z.string().min(1),
  truth: z.string().min(1),
});
export type Misconception = z.infer<typeof Misconception>;

export const GlossaryItem = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
});
export type GlossaryItem = z.infer<typeof GlossaryItem>;

export const Diagram = z.object({
  id: z.string().min(1),
  kind: z.enum(["mermaid", "svg"]),
  code: z.string().min(1),
  alt: z.string().min(1),
});
export type Diagram = z.infer<typeof Diagram>;

export const ReviewScores = z.object({
  facts: z.number().min(0).max(10).default(0),
  beginner: z.number().min(0).max(10).default(0),
  a11y: z.number().min(0).max(10).default(0),
  ux: z.number().min(0).max(10).default(0),
  performance: z.number().min(0).max(10).default(0),
  securityPrivacy: z.number().min(0).max(10).default(0),
  simplicity: z.number().min(0).max(10).default(0),
  skeptical: z.number().min(0).max(10).default(0),
});
export type ReviewScores = z.infer<typeof ReviewScores>;

export const RecapPageContent = z.object({
  slug: z.string().min(1),
  topic: z.string().min(1),
  audienceLevel: AudienceLevel.default("beginner"),
  generatedAt: z.string(),
  fixture: z.boolean().default(false),
  oneSentenceAnswer: z.string().min(1).max(280),
  fiveMinutePath: z.array(z.string().min(1)).min(3).max(7),
  whyItMatters: z.array(z.string().min(1)).min(2).max(5),
  keyIdeas: z.array(KeyIdea).min(3).max(7),
  visualSections: z.array(VisualSection).min(5),
  diagrams: z.array(Diagram).default([]),
  timeline: z.array(TimelineItem).optional(),
  comparisons: z.array(ComparisonBlock).optional(),
  examples: z.array(ExampleBlock).min(1).max(6),
  analogies: z.array(AnalogyBlock).min(1).max(4),
  misconceptions: z.array(Misconception).min(1).max(5),
  glossary: z.array(GlossaryItem).min(1),
  practicalTakeaways: z.array(z.string().min(1)).min(3).max(6),
  sourceMap: z.array(SourceMapItem).min(1),
  uncertaintyNotes: z.array(z.string()).default([]),
  reviewScores: ReviewScores.default({} as ReviewScores),
});
export type RecapPageContent = z.infer<typeof RecapPageContent>;

/**
 * Convenience: parse with a useful error.
 */
export function parseRecapPageContent(input: unknown): RecapPageContent {
  const result = RecapPageContent.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `- ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid RecapPageContent:\n${issues}`);
  }
  return result.data;
}
