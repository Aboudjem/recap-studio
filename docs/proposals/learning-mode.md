# Proposal: learning mode

**Status**: proposal, implemented on `feat/learning-mode` for review.
**Scope**: an opt-in `learn` block on `RecapPageContent`, two page sections, one
reviewer agent, one validation dimension.

A recap page is something you read. Reading is the weakest of the study
techniques we have evidence for. This proposal adds a mode that turns a page
into something you *answer*, without giving up the thing that makes the output
useful: one self-contained HTML file, no JavaScript, no network.

The principles and their sources come from a sibling plugin (private) that
packages sourced learning-science material. Nothing here depends on it; the
citations below are public primary sources and every one was re-checked
against Crossref before it went into the repo.

## What learning science adds

Seven findings, each with one primary source. Where a source was mis-cited in
the notes this was built from, the correction is stated.

| # | Principle | What it means here | Source |
|---|---|---|---|
| 1 | **Retrieval practice** | Being tested is not a measurement of learning, it is an act of learning. Five minutes after study, restudy wins; at two days and one week the tested group retains substantially more. | Roediger & Karpicke 2006, *Psychological Science* **17(3)**, 249–255 — https://doi.org/10.1111/j.1467-9280.2006.01693.x |
| 2 | **Practice testing ranks first** | Of ten common study techniques rated on four criteria, only practice testing and distributed practice earned high utility. Highlighting, summarising and rereading rated low. | Dunlosky et al. 2013, *PSPI* 14(1), 4–58 — https://doi.org/10.1177/1529100612453266 |
| 3 | **Prequestions** | Questions asked *before* reading raise recall for the material they name (g ≈ 0.66) and do almost nothing for the rest (g ≈ 0.01). So they must name what has to stick. | Pan & Carpenter 2023, *Educational Psychology Review* 35, art. 97 — https://doi.org/10.1007/s10648-023-09814-5 |
| 4 | **Chunking at 4±1** | When grouping and rehearsal are blocked, capacity is near 3–5 items, not Miller's seven. A block that introduces ten things loses nine. | Cowan 2001, *Behavioral and Brain Sciences* 24(1), 87–114 — https://doi.org/10.1017/S0140525X01003922 |
| 5 | **Dual coding** | A diagram and a short text that reuses the diagram's own labels give two retrieval routes instead of one. | Mayer 2017, *JCAL* 33(5), 403–423 — https://doi.org/10.1111/jcal.12197 |
| 6 | **Expertise reversal** | Scaffolding that helps a newcomer becomes redundant load for a reader who already holds the schema, and can make things worse. | Kalyuga, Ayres, Chandler & Sweller 2003, *Educational Psychologist* 38(1), 23–31 — https://doi.org/10.1207/S15326985EP3801_4 |
| 7 | **Feedback after answering** | Retrieval works without feedback and better with it, chiefly by correcting confident errors. Printing the answer under the question removes the retrieval and keeps none of the benefit. | Roediger & Butler 2011, *TiCS* 15(1), 20–27 — https://doi.org/10.1016/j.tics.2010.09.003 |

Plus one that shapes what the mode refuses to do: spaced revision beats massed
across 839 assessments in 317 experiments, and the best gap **grows** with how
long you need to remember, so there is no single correct interval
(Cepeda et al. 2006 — https://doi.org/10.1037/0033-2909.132.3.354).

### Corrections applied

- Roediger & Karpicke 2006 is *Psychological Science* **17(3)**, not 17(2).
  Confirmed against Crossref.
- Harp & Mayer 1998 (https://doi.org/10.1037/0022-0663.90.3.414): the
  established result is the main effect — four experiments, 357 students,
  fewer main ideas recalled and fewer transfer solutions. The further claims
  that signaling fails to rescue a seductive detail, and that placement
  reverses the effect, are **not** supported by the accessible abstract. The
  `pedagogy-reviewer` is told to treat them as a design hypothesis and never
  to assert them.
- Interleaving (out of scope here) rests on Rohrer & Taylor 2007
  **Experiment 2** only; Experiment 1 of that paper manipulates spacing, not
  interleaving. Do not attribute the interleaving result to both.

## What changes

**(a) `agents/learning-architect.md`** — the unsourced numbers go. "5 steps of
≤ 18 words" and "4–7 cards" were house preferences with nothing behind them;
they are replaced by the chunking limit (principle 4) with its source, plus
dual coding, expertise reversal, seductive details and progressive disclosure.
The schema's own bounds (3–7 steps, 3–7 cards) still apply and are named as
schema bounds, not as findings. Format and frontmatter unchanged.

**(b) `agents/pedagogy-reviewer.md`** (new) — the reviewer that asks whether a
page teaches, covering five traps: seductive details, trivial quiz items whose
answer sits in the prompt, extrinsic gamification, expertise reversal, and the
illusion of fluency. It reports a table plus findings and ends every report
with `pedagogy_blocking: N`. Registered in the validation board in
`docs/agent-system.md` and in `skills/recap-validate/SKILL.md`.

**(c) Schema + two sections** — `RecapPageContent.learn` is optional:

```ts
learn?: {
  enabled: boolean;
  prequestions?: { question: string; hint?: string }[];
  checks?: { id: string; prompt: string; options: string[]; answer: number; why: string }[];
  cloze?: { text: string; blanks: string[] }[];
  revision?: { d1?: string; d3?: string; d7?: string };
}
```

`PreQuestions` renders above the five-minute path, one closed `<details>` per
question with the hint inside and the answer nowhere. `CheckBlock` renders
after the material: each check is a `<fieldset>` of radio inputs (so the page
can mark what the reader picked, via `:checked`, without saying whether it was
right) plus a closed `<details>` holding the right option and its `why`. Each
check carries `data-learn="check"`. `CheckBlock` also renders the cloze lines
and the day 1 / 3 / 7 prompts, so no schema field goes nowhere.

Both are also implemented in `packages/html-renderer`, because that package —
not the Next.js components — is what produces the self-contained file the
plugin ships. Without it, a page could declare learning mode and the HTML
would silently drop it.

**(d) `packages/validation`** — a new `learning` dimension, target 9, scored
only when `learn.enabled` is true and **left out of the report entirely**
otherwise. It is not scored "n/a at 10": `overall` is a mean, so a free 10 on
every ordinary page would lift every historical score by construction. Rules:
every check has non-blank feedback (high), at least 3 checks (medium), at
least 2 prequestions (medium), no item whose right option appears in its own
prompt, case-insensitively (medium), and an answer index inside `options`
(blocker — otherwise the page prints an empty right answer).

**(e) Tests** — see *How to test*.

**(f) `CHANGELOG.md`** — described under Unreleased.

## Integration plan

1. Content stays valid without the block. `learn` is optional; absent or
   `enabled: false` renders byte-identical markup and the same seven
   dimensions. The demo still scores 9.7/10.
2. `fixtures/topics/learning-mode-demo.json` is a new fixture, self-describing:
   a page about retrieval practice that uses retrieval practice. No existing
   fixture or content file was touched.
3. The orchestrator opts a run into the mode by filling `learn`. Nothing else
   in the pipeline changes.
4. `pedagogy-reviewer` joins the parallel reviewer fan-out as 6h.

## Out of scope

- **No JavaScript in the standalone HTML.** Radios and `<details>` carry the
  whole interaction. CI already fails on a `<script>` tag or a `/_next/` path
  in the rendered file, and that gate is what keeps this honest.
- **No scoring, no stored state, no streaks.** A static page has no memory, so
  any score would be fabricated, and contingent rewards undermine intrinsic
  motivation across 128 studies (Deci, Koestner & Ryan 1999 —
  https://doi.org/10.1037/0033-2909.125.6.627). What helps is feedback that
  signals competence (Sailer et al. 2017 —
  https://doi.org/10.1016/j.chb.2016.12.033).
- **No spaced-revision scheduler.** The page cannot know when it was first
  opened. `revision` is three prompts and says so.
- **No interleaving, no free-recall box, no confidence weighting.** Later, if
  the mode earns it.
- **No deployment**, no config change, no new dependency.

## How to test

```bash
pnpm -r --if-present run build
pnpm -r --if-present run test        # validation, content-pipeline, html-renderer, recap-web
pnpm -r --if-present run typecheck
pnpm -r --if-present run lint
node scripts/validate.mjs            # demo still 9.7/10, seven dimensions
node scripts/render-html.mjs fixtures/topics/learning-mode-demo.json
# then, on the rendered file:
#   no "<script"  and  no "/_next/"
```

New tests: `packages/validation/src/learning.test.ts` (the passing shape, then
one failure per rule, plus proof the dimension is absent without the block),
`packages/content-pipeline/src/schema.test.ts` (learn block parses; missing
`enabled`, missing `why`, one option and a negative index all rejected),
`packages/html-renderer/src/learn.test.ts` (section order, radios, feedback
strictly after the reveal, nothing leaks into a plain page, print opens the
reveals), and `apps/recap-web/tests/learn-sections.test.tsx` (the two
components rendered with `react-dom/server`).

## Checklist for reviewers

- [ ] Every principle above still has a live primary source, and the three
      corrections are respected in the agent prompts.
- [ ] No claim in `pedagogy-reviewer.md` goes past what its source states.
- [ ] `learn` is genuinely optional: an existing content file renders and
      scores exactly as it did on `main`.
- [ ] The rendered HTML for the new fixture has no `<script>` and no `/_next/`.
- [ ] No feedback is reachable before the reader opens the reveal — check the
      markup order, not just the rendered page.
- [ ] The `learning` dimension is absent, not 10, on a page without the block.
- [ ] `.recap-quiz` does not collide with the pre-existing `.recap-check`
      takeaway badge.
- [ ] Section labels are English, like the rest of the repo's chrome.
