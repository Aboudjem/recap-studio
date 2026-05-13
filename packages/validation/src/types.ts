import { z } from "zod";

export const Dimension = z.enum([
  "facts",
  "beginner",
  "accessibility",
  "ux",
  "performance",
  "security-privacy",
  "simplicity",
  "skeptical",
]);
export type Dimension = z.infer<typeof Dimension>;

export const Finding = z.object({
  severity: z.enum(["info", "low", "medium", "high", "blocker"]),
  message: z.string().min(1),
  hint: z.string().optional(),
  path: z.string().optional(),
});
export type Finding = z.infer<typeof Finding>;

export const DimensionResult = z.object({
  name: Dimension,
  score: z.number().min(0).max(10),
  target: z.number().min(0).max(10),
  status: z.enum(["pass", "warn", "fail", "blocker"]),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  findings: z.array(Finding).default([]),
});
export type DimensionResult = z.infer<typeof DimensionResult>;

export const ValidationReport = z.object({
  slug: z.string().min(1),
  topic: z.string().min(1),
  generatedAt: z.string(),
  dimensions: z.array(DimensionResult),
  blockers: z.array(z.string()).default([]),
  overall: z.number().min(0).max(10),
  passedThresholds: z.boolean(),
});
export type ValidationReport = z.infer<typeof ValidationReport>;

/**
 * Default per-dimension targets (must match GOAL_SPEC).
 */
export const TARGETS: Record<Dimension, number> = {
  facts: 9,
  beginner: 9,
  "accessibility": 9,
  ux: 8,
  performance: 8,
  "security-privacy": 9,
  simplicity: 9,
  skeptical: 7,
};
