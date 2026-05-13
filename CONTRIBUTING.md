# Contributing to Recap Studio

Thanks for your interest in contributing. Recap Studio is opinionated about
quality, so a few rules keep the bar high.

## Quick start

```bash
pnpm install
pnpm -w demo:latest-ai-models
pnpm -w validate:demo
pnpm --filter recap-web dev   # http://localhost:3000
```

## How to contribute

1. Fork the repo and create a branch: `git checkout -b fix/short-summary`
2. Make your change in small, reviewable commits.
3. Run the full check: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
4. Run the demo + validation: `node scripts/demo-latest-ai-models.mjs && node scripts/validate.mjs`. All thresholds must still pass.
5. Open a PR with a clear title and a short "why".

## Quality bar

Every change must keep the validation report at or above target:

| Facts | Beginner | A11y | UX | Perf | Security | Simplicity |
| ----- | -------- | ---- | -- | ---- | -------- | ---------- |
| 9     | 9        | 9    | 8  | 8    | 9        | 9          |

If a dimension drops, document why in the PR body, or fix it before merging.

## Code style

- TypeScript strict mode. No `any`.
- Prettier-formatted (root config).
- Mobile-first, reduced-motion-safe.
- Server Components by default; client components only for real interactivity.
- Semantic HTML. Real headings. Real landmarks.

## Things that get a PR closed fast

- New runtime dependencies without a clear win.
- Marketing fluff in component copy ("powerful", "seamless", "revolutionary").
- Hidden side effects (network, deploy, email) outside the gated paths.
- Secrets in any file under git. Use env vars only.
- Destructive git commands in scripts or hooks.

## Reporting bugs

Open an issue with:
- What you expected.
- What happened instead.
- Steps to reproduce.
- Your environment (OS, Node version, pnpm version).
- A screenshot if it is visual.

## Reporting security issues

See [SECURITY.md](SECURITY.md). Do not open public issues for vulnerabilities.

## License

By contributing you agree your work is released under the MIT License.
