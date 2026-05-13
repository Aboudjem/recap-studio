---
name: recap-setup
description: Use when the user types /recap setup, /recap config, or asks Recap Studio to "configure", "initialize", or "set defaults". Writes recap-studio.config.ts with safe defaults and validates env.
arguments:
  - name: preset
    description: economy | balanced | premium (sets costMode and modelRouting defaults)
    required: false
---

# /recap setup

You configure Recap Studio. Safe defaults are picked so that side effects
(deploy, email, network) stay **off** until the user opts in.

## What you do

1. If `recap-studio.config.ts` does not exist, create it from the template
   in `packages/content-pipeline/src/config-template.ts` and write to repo
   root.
2. Validate the file with `RecapStudioConfig` (zod schema).
3. Check env. List which optional keys are present without printing their
   values. Never log secrets.
4. Print a "what's enabled" summary:
   - `deploymentMode`: disabled / preview / production-with-confirmation
   - `emailMode`: disabled / draft / send-with-confirmation
   - `costMode`: economy / balanced / premium
   - `researchIntensity`: fast / balanced / deep
5. If a flag is set to a mode that requires keys that are missing, **do not
   change the file** — print the precise key it needs.

## Safe defaults (template)

```ts
import type { RecapStudioConfig } from "@recap-studio/content-pipeline";

export const config: RecapStudioConfig = {
  contentLength: "medium",
  explanationDepth: "beginner",
  researchIntensity: "balanced",
  theme: "auto",
  animationIntensity: "low",
  visualDensity: "medium",
  deploymentMode: "disabled",
  emailMode: "disabled",
  citationStrictness: "strict",
  costMode: "balanced",
  modelRouting: "auto",
  sourceFreshnessRequired: true,
};

export default config;
```

## Hard rules

- Never write `.env` files. Print which env keys the user can set instead.
- Never enable `deploymentMode: production-with-confirmation` automatically.
- Never enable `emailMode: send-with-confirmation` automatically.
- Always preserve any existing `recap-studio.config.ts` — write a `.next`
  diff file and ask the user to merge if changes are needed.
