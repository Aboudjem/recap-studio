# FAQ

## Is the HTML really self-contained?

Yes. Every style is inlined, there is no JavaScript, and there are no `/_next/` or CDN references.
CI asserts both on every push: the rendered page is grepped for `<script` and for `/_next/`, and a
match fails the build. The file opens over `file://` on a plane.

## Does it work without an internet connection?

Rendering is fully offline. The research pipeline behind `/recap` runs inside your Claude Code
session, so it uses the model your editor is already talking to. There is no Recap Studio API and
no key to manage.

## What is the "score"?

`recap validate` runs seven deterministic checks over structure, citation presence, word counts,
and known quality signals. It does not fetch sources and does not call a model. The 13 specialist
agents review the content only when you run `/recap` inside Claude Code. Both surfaces say so in
their own output.

The score is stable: the same input always gives the same number. That was not always true.
Version 0.5.0 fixed a bug where the secret-scanning regexes carried `/g` and kept `lastIndex`
between calls, so the same page could alternate between "leaked key" and "clean" on consecutive
runs.

## Can I use it in VS Code, Cursor, or Codex?

Yes, two ways. The five skills install into any agent that reads a skills directory with
`npx skills add Aboudjem/recap-studio`. Separately, the local MCP server exposes
`render_recap_html`, `validate_content` and nine more tools to any MCP-capable client. Per-editor snippets are in
[editors.md](editors.md).

## Why is the CLI not on npm?

It does not need to be. The CLI is one committed file with no dependency, so
`npx -y github:Aboudjem/recap-studio` runs it straight from GitHub. The `recap-studio` name on npm
holds an old placeholder at 0.2.0, not this CLI. See [cli.md](cli.md).

## Does it deploy anywhere automatically?

No. `deploymentMode` is `disabled` by default. A deploy happens only if you configure Vercel and
say yes to an explicit prompt.

## Is there a hosted web version?

Yes, the Next.js track in `apps/recap-web`, run with `npm run dev --workspace=apps/recap-web`. The hosted
track and the offline single-file track render the same content through different surfaces.

## What stops it from touching my repo or my secrets?

The plugin's Claude Code hooks refuse writes to `.env*` files, `secrets/` and `private/` folders,
SSH keys, and `.pem`, `.p12`, `.pfx`, `.keystore` and `.key` files. They also refuse `git push`,
`reset --hard`, `rebase` and `clean -fdx`. They act only when the session's working folder is
inside a recap-studio project. A CI job smoke-tests those hooks on every push. See [security-and-privacy.md](security-and-privacy.md) and
[../hooks/README.md](../hooks/README.md).

## Can I turn an existing Markdown file into a page?

Not yet. `render` reads the `RecapPageContent` schema, not arbitrary Markdown. Going the other
way works: `--format md` and `--format txt` serialize a page back to plain files.

## What does a page actually contain?

A hero with a one-sentence answer, three takeaways, an inline SVG concept map, four to seven key
ideas, a timeline when real chronology exists, a comparison table that becomes stacked cards on a
phone, examples and analogies, misconceptions, a collapsed glossary, actionable takeaways, and a
sources list where every claim links to a `sourceMap` entry.
