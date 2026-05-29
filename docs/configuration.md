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
| `RESEND_API_KEY` / `DEFAULT_EMAIL_FROM` / `DEFAULT_EMAIL_TO` | Email side effect (see "Email" below) | unset   |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Deploy side effect                      | unset   |
| `RECAP_ALLOW_SECRET_WRITE=1`            | Hook escape — use only after human review            | unset   |
| `RECAP_ALLOW_DESTRUCTIVE_GIT=1`         | Hook escape — use only after human review            | unset   |
| `RECAP_USER_CONFIRMED_PREVIEW=1`        | Confirm a preview deploy                             | unset   |
| `RECAP_USER_CONFIRMED_PROD_DEPLOY=1`    | Confirm a production deploy                          | unset   |
| `RECAP_USER_CONFIRMED_PUBLIC=1`         | Confirm a project-level SSO toggle (deploy script)   | unset   |
| `SSO_MODE`                              | `off`/`preview_only`/`all` — used by vercel-set-public.sh | `off` |

## Email

Email is **off by default**. Set `emailMode` to `"draft"` or
`"send-with-confirmation"` in `recap-studio.config.ts` and set
`RESEND_API_KEY` in your shell.

### Picking a FROM address

Resend rejects any `from:` that is not on a verified domain. You have two
common situations:

**Full-access key.** Set `DEFAULT_EMAIL_FROM` to an address on a domain
you've verified in the Resend dashboard. The agent can also call
`GET /domains` to list verified domains if needed.

**Restricted send-only key.** Resend lets you mint a key scoped to
"Sending access" only. Such keys can `POST /emails` but can't enumerate
domains, so the agent has no way to discover what's verified. Two
workarounds:

1. **Sandbox sender** — use `from: "onboarding@resend.dev"`. Resend
   accepts it from any account, but only delivers to the email address
   of the Resend account owner. Fine for self-emailing recaps to
   yourself. Will fail (or be silently dropped) for any other recipient.
2. **Pre-set `DEFAULT_EMAIL_FROM`** — pin a known-verified address in
   env. The agent uses it without listing domains. This is the right
   choice for shared/team setups.

### Quick reference

| Setting                       | Behavior                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `emailMode: "disabled"`       | No email side effect, even if keys exist.                    |
| `emailMode: "draft"`          | Agent writes the HTML/text email but does not send.          |
| `emailMode: "send-with-confirmation"` | Sends after explicit user confirmation in-session.   |
| `DEFAULT_EMAIL_FROM` unset, key restricted | Falls back to `onboarding@resend.dev`.          |
| `DEFAULT_EMAIL_TO` unset      | Falls back to the user email in the active session context.  |

See `docs/known-issues.md#resend-restricted-key-fallback` for the debug
history that led to this section.

### Deliverability gotchas

A `200 OK` from `POST /emails` with a fresh `id` means **queued**, not
**delivered**. The skill must treat the response that way and always
remind the user where to look if mail does not arrive.

| Failure mode                       | Why it happens                                                                                                                  | What to do                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Sandbox send to non-owner          | `onboarding@resend.dev` only delivers to the Resend account owner. New keys return `403 testing emails`; older behavior was silent. | Verify a domain and switch `DEFAULT_EMAIL_FROM`, or only send to the owner address.                                  |
| Microsoft 365 / Outlook quarantine | `resend.dev` SPF/DKIM alignment is weak against corporate inbound rules. Mail arrives but lands in Junk or admin Quarantine.    | Check Junk + the M365 Quarantine portal. Long-term: verify a custom domain and align SPF/DKIM/DMARC.                  |
| Gmail / Workspace promotions tab   | Same root cause, milder. Mail is delivered but hidden in Promotions or Spam.                                                    | Add `onboarding@resend.dev` (or your verified FROM) to contacts. Check the Spam folder.                               |

For corporate inboxes, the only reliable fix is a verified custom domain
on the Resend side. The sandbox sender is fine for self-sending to a
personal Gmail; treat it as best-effort everywhere else.

See `docs/known-issues.md#resend-200-ok-not-delivery` for the full debug
trail.

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
