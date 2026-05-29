#!/usr/bin/env node
/**
 * recap-studio — npm CLI redirect.
 *
 * The real distribution channel for Recap Studio is the 10x marketplace
 * for Claude Code, plus a git clone for direct use. npm `recap-studio` is
 * a placeholder that surfaces the canonical install paths to anyone who
 * stumbles into `npm install recap-studio` or `npx recap-studio`.
 */
const VERSION = "0.3.1";
const REPO = "https://github.com/Aboudjem/recap-studio";
const MARKETPLACE = "https://github.com/Aboudjem/10x";

const arg = process.argv[2];

const help = `recap-studio v${VERSION}

Turn any topic or git diff into a self-contained, offline-ready HTML explainer
in ~5 minutes. Deterministic heuristic checks; zero JavaScript output.

This npm package is a placeholder. Recap Studio installs via the
10x Claude Code marketplace:

  claude plugin marketplace add Aboudjem/10x
  claude plugin install recap-studio@10x

Then in any Claude Code session:

  /recap "Latest AI models"
  /recap session
  /recap setup
  /recap validate

Prefer to run it locally? Clone the repo:

  git clone ${REPO}
  cd recap-studio && pnpm install
  pnpm -w demo:latest-ai-models    # generate the offline demo
  pnpm -w validate:demo            # heuristic quality checks
  pnpm --filter recap-web dev      # http://localhost:3000

Marketplace:  ${MARKETPLACE}
Repo:         ${REPO}
Docs:         ${REPO}/blob/main/docs/architecture.md
`;

if (arg === "--version" || arg === "-v") {
  console.log(VERSION);
  process.exit(0);
}

console.log(help);
process.exit(0);
