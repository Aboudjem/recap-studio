---
name: recap
description: Use when the user types /recap with or without arguments, or asks Recap Studio for "a recap", "an explainer page" or "a one-page summary" without saying topic or session. Picks topic mode or session mode and hands off.
arguments:
  - name: input
    description: A topic in quotes, or "session", "repo", "setup", "validate". Empty means "decide from the repo state".
    required: false
---

# /recap

You route the request to the right Recap Studio skill. You do no work yourself.

## Routing

| The user typed                                                               | Hand off to                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/recap "<subject>"` or `/recap topic <subject>`                             | `recap-topic`                                                              |
| `/recap session`, `/recap repo`, `/recap session --deep`                     | `recap-session`                                                            |
| `/recap setup`, `/recap config`                                              | `recap-setup`                                                              |
| `/recap validate`                                                            | `recap-validate`                                                           |
| `/recap demo`                                                                | Run the demo below                                                         |
| `/recap` alone, inside a git repo with uncommitted changes or recent commits | `recap-session`                                                            |
| `/recap` alone, anywhere else                                                | Ask one question: "What topic should the page explain?" Then `recap-topic` |

## Demo

The demo needs no input and no network. It shows the user what a page looks like.

1. Run the bundled CLI from the plugin: `node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs" demo`.
   If that path does not resolve, run `npx -y github:Aboudjem/recap-studio demo`.
2. It writes `recap-latest-ai-models.html` in the working directory and prints a verdict first.
3. Open the file for the user (`open` on macOS, `xdg-open` on Linux, `start` on Windows).

## Rules

- Never guess a topic. When the input is empty and the repo has nothing to recap, ask.
- Never deploy, email or call the network from this skill.
