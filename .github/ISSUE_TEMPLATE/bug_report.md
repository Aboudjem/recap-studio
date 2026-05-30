---
name: Bug report
about: Something broke — rendering, validation, a skill, or the MCP server
title: "bug: <short description>"
labels: bug
assignees: Aboudjem
---

## What happened

<!-- A clear description of the bug. One paragraph max. -->

## Steps to reproduce

1.
2.
3.

## Expected behaviour

<!-- What should have happened. -->

## Actual behaviour

<!-- What actually happened. Paste error messages verbatim. -->

## Environment

| Field | Value |
|---|---|
| Recap Studio version | <!-- e.g. v0.3.1 — run `git describe --tags` --> |
| Node version | <!-- `node -v` --> |
| pnpm version | <!-- `pnpm -v` --> |
| OS | <!-- e.g. macOS 15, Ubuntu 24.04, Windows 11 --> |
| Host CLI (if using a skill) | <!-- e.g. Claude Code, Cursor, Codex --> |
| Track affected | <!-- offline HTML / CLI / MCP server / skill / Next.js hosted track --> |

## Minimal reproduction

<!-- A content JSON that triggers the bug, or a git diff, or the exact command you ran.
     Use the fixture flag `"fixture": true` to avoid any LLM calls. -->

```json

```

## Logs / error output

<details>
<summary>Full error output</summary>

```
paste here
```

</details>

## Checklist

- [ ] I searched existing issues and this is not a duplicate.
- [ ] I am on the latest release (or a recent commit from `main`).
- [ ] The bug is reproducible with a fixture JSON (no live LLM call needed).
