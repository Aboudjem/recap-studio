/**
 * Session mode adds a `SessionDelta` artifact the architect can use as
 * input alongside the standard schema.
 */
import { z } from "zod";

export const ChangeGroup = z.object({
  title: z.string().min(1),
  files: z.array(z.string().min(1)),
  why: z.string().min(1),
  risk: z.enum(["low", "medium", "high"]).default("low"),
});
export type ChangeGroup = z.infer<typeof ChangeGroup>;

export const SessionDelta = z.object({
  ref: z.string().min(1),
  overview: z.string().min(1),
  filesChanged: z.number().int().nonnegative(),
  topAreas: z.array(z.string().min(1)).default([]),
  before: z.object({ diagramMermaid: z.string().min(1) }),
  after: z.object({ diagramMermaid: z.string().min(1) }),
  groups: z.array(ChangeGroup).default([]),
  risks: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  todos: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  redactedPaths: z.array(z.string()).default([]),
});
export type SessionDelta = z.infer<typeof SessionDelta>;
