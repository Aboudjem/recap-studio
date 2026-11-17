---
name: recap-setup
user-invocable: false
description: Use when the user types /recap setup, /recap config, or asks Recap Studio to "configure", "initialize", or "set defaults". Writes recap-studio.config.ts (in a recap-studio checkout) or recap-studio.config.json (anywhere else) with safe defaults and checks env.
arguments:
  - name: preset
    description: economy | balanced | premium (sets costMode and modelRouting defaults)
    required: false
---

# /recap setup

You configure Recap Studio. Safe defaults are picked so that side effects
(deploy, email, network) stay **off** until the user opts in.

## What you do

1. Pick the file. Inside a checkout of recap-studio, use `recap-studio.config.ts`
   (copy `recap-studio.config.example.ts`; the file is gitignored). In any other
   project, write `recap-studio.config.json` with the same keys as the template
   below, as plain JSON. If either file exists, keep it (see Hard rules).
   Writing this file marks the folder as a recap-studio project: the plugin's
   safety hooks only act in such folders. Tell the user that in one line.
2. Check every key against the allowed values in the template below.
3. Check env. List which optional keys are present without printing their
   values. Never log secrets.
4. Print a "what's enabled" summary:
   - `deploymentMode`: disabled / preview / production-with-confirmation
   - `emailMode`: disabled / draft / send-with-confirmation
   - `costMode`: economy / balanced / premium
   - `researchIntensity`: fast / balanced / deep
5. If a flag is set to a mode that requires keys that are missing, **do not
   change the file**, print the precise key it needs.

## Safe defaults (template)

```ts
import type { RecapStudioConfig } from "@recap-studio/content-pipeline";

export const config: RecapStudioConfig = {
  contentLength: "medium",
  explanationDepth: "beginner",
  researchIntensity: "balanced",
  theme: "dark",
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
- Always preserve an existing config file. Show the change you would make
  and ask the user to apply it.
