# Templates

Templates define the section shape and limits for a recap. They are JSON, not
code, so the content pipeline can validate them with the same Zod schemas as
generated content.

## How they are used

1. `/recap topic` defaults to `tech-explainer`.
2. `/recap session` defaults to `coding-session`.
3. The `learning-architect` reads `templates/manifest.json`, picks the
   appropriate template, and respects its `limits` when emitting content.

## Adding a template

1. Create `templates/<id>/template.json` with the same shape as the
   defaults below.
2. Append a row to `templates/manifest.json`.
3. Document it in your PR, what audience, what fits.

Defaults ship in this repo:

- `tech-explainer`: the standard 12-section page, beginner-friendly.
- `coding-session`: built around `SessionDelta`, with a per-file deep-dive
  accordion in `--deep` mode.
