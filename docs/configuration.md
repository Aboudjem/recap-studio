# Configuration

Recap Studio reads two things at runtime:

1. **`recap-studio.config.ts`** — typed knobs (see schema below).
2. **Environment variables** — keys for opt-in side effects, plus runtime
   knobs.

Both are optional. The system runs offline with safe defaults out of the box.

## Config schema

```ts
type RecapStudioConfig = {
  contentLength: "short" | "medium" | "long";        // default "medium"
  explanationDepth: "beginner" | "intermediate" | "expert"; // default "beginner"
  researchIntensity: "fast" | "balanced" | "deep";   // default "balanced"
  theme: "light" | "dark" | "auto";                  // default "auto"
  animationIntensity: "none" | "low" | "medium" | "high"; // default "low"
  visualDensity: "low" | "medium" | "high";          // default "medium"
  deploymentMode: "disabled" | "preview" | "production-with-confirmation"; // default "disabled"
  emailMode: "disabled" | "draft" | "send-with-confirmation"; // default "disabled"
  citationStrictness: "standard" | "strict" | "academic";  // default "strict"
  costMode: "economy" | "balanced" | "premium";      // default "balanced"
  modelRouting: "auto" | "manual";                    // default "auto"
  sourceFreshnessRequired: boolean;                   // default true
};
```

Create or update via `/recap setup`. The skill refuses to enable
`deploymentMode: production-with-confirmation` or
`emailMode: send-with-confirmation` automatically — you must change those
yourself.

## Environment variables

All optional. See `.env.example` for the canonical list.

| Var                                     | Purpose                                              | Default |
| --------------------------------------- | ---------------------------------------------------- | ------- |
| `RECAP_STUDIO_FIXTURE_ONLY=1`           | Force fixture pathways (no network)                  | `1`     |
| `RECAP_STUDIO_HOME`                     | Override artifact + source cache root                | (cwd)   |
| `ANTHROPIC_API_KEY`                     | Optional research / synthesis                        | unset   |
| `OPENAI_API_KEY`                        | Optional research / synthesis                        | unset   |
| `BRAVE_SEARCH_API_KEY` / `EXA_API_KEY` / `TAVILY_API_KEY` | Optional search providers          | unset   |
| `RESEND_API_KEY` / `DEFAULT_EMAIL_FROM` / `DEFAULT_EMAIL_TO` | Email side effect                | unset   |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Deploy side effect                      | unset   |
| `RECAP_ALLOW_SECRET_WRITE=1`            | Hook escape — use only after human review            | unset   |
| `RECAP_ALLOW_DESTRUCTIVE_GIT=1`         | Hook escape — use only after human review            | unset   |
| `RECAP_USER_CONFIRMED_PREVIEW=1`        | Confirm a preview deploy                             | unset   |
| `RECAP_USER_CONFIRMED_PROD_DEPLOY=1`    | Confirm a production deploy                          | unset   |

## What changes by `costMode`

| Mode      | Researcher model | Architect model | Reviewers model | Source intensity |
| --------- | ---------------- | --------------- | --------------- | ---------------- |
| economy   | haiku            | sonnet          | haiku           | fast             |
| balanced  | haiku            | sonnet          | sonnet/haiku    | balanced         |
| premium   | sonnet           | opus            | sonnet          | deep             |

## Tuning the page itself

- `contentLength: "long"` enables the optional deep-dive accordion section.
- `visualDensity: "high"` shows more diagrams; `"low"` falls back to text-led.
- `animationIntensity: "none"` disables all motion (still works for
  reduced-motion users by definition).
