# Command surface

Recap Studio has four skills. Two are visible in the `/` menu; two are hidden (`user-invocable: false`) so ADHD-friendly owners see a minimal command list.

## Visible (user-facing)

| Skill | Trigger | Why kept |
|---|---|---|
| `recap-topic` | `/recap "subject"` | Primary entry point — this IS the product. |
| `recap-session` | `/recap session` | Distinct intent (git diff → explainer vs topic → explainer). Different input, different pipeline. Worth a separate slot. |

## Hidden (Claude-invocable only)

| Skill | Why hidden |
|---|---|
| `recap-setup` | One-time config. Users rarely need it after first run. Claude invokes it automatically when `recap-studio.config.ts` is missing. |
| `recap-validate` | Internal QA step. Runs automatically inside `recap-topic` and `recap-session`. Exposing it as a menu item adds noise without value for most users. |

## Rationale

`user-invocable: false` hides a skill from the `/` menu while keeping it fully callable by Claude and other skills. No code is removed or merged — it is a single frontmatter line per SKILL.md. If a user explicitly types `/recap validate` or `/recap setup`, the skill still fires normally; the flag only affects menu discoverability.
