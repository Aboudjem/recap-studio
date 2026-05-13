# recap-studio

> Generate beautiful, calm, mobile-first one-page explainers in under 5 minutes.

[![marketplace](https://img.shields.io/badge/10x-marketplace-7C5CFF?style=flat-square)](https://github.com/Aboudjem/10x)
[![license](https://img.shields.io/badge/license-MIT-7C5CFF?style=flat-square)](https://github.com/Aboudjem/recap-studio/blob/main/LICENSE)

This npm package is a **placeholder** that redirects to the canonical install path. Recap Studio is a Claude Code plugin distributed via the [10x marketplace](https://github.com/Aboudjem/10x).

## Install (canonical)

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

Then in any Claude Code session:

```
/recap "Latest AI models"
/recap session
/recap setup
/recap validate
```

## Run locally

```bash
git clone https://github.com/Aboudjem/recap-studio
cd recap-studio && pnpm install
pnpm -w demo:latest-ai-models    # offline demo
pnpm -w validate:demo            # 7-dimension scorecard
pnpm --filter recap-web dev      # http://localhost:3000
```

## What does `npx recap-studio` do?

Prints the install instructions above. The package is a redirect, not a CLI.

## Links

- [Repo](https://github.com/Aboudjem/recap-studio)
- [Architecture](https://github.com/Aboudjem/recap-studio/blob/main/docs/architecture.md)
- [Changelog](https://github.com/Aboudjem/recap-studio/blob/main/CHANGELOG.md)
- [10x marketplace](https://github.com/Aboudjem/10x)

## License

MIT
