# Agent guide

## Verification checks

Run these in order before you report a change as complete:

1. `npm run check`

`npm run check` runs `typecheck` (React Router typegen and `tsc`), then `test` (Vitest). `npm run build` must pass too.

## Where things are

- Domain terms: `GLOSSARY.md`. Use these terms in code, prompts and PRs. Do not invent new ones.
- Decisions the code cannot explain: `docs/adr/`.
- Review rules that no check enforces: `CODING_STANDARDS.md`.
- Task-specific guides: `docs/agents/`. Read the matching guide before you start that task.
- Issue tracker: GitHub issues, through `gh`. Specs, tickets, blocking edges and Wayfinder maps follow `docs/agents/issue-tracker.md`.

## When something breaks

| Symptom | Cause |
| --- | --- |
| `+types` imports fail | Run `npm run typecheck`: it generates the route types first. |

## Software factory

Issues labelled `agent:explore` start an explore run, which tags each issue and hands easy calls to `agent:implement`. Issues labelled `agent:implement` start an implementer run, which opens a draft PR. PRs labelled `agent:review` start a review run. A human merges. The `sf` CLI drives the whole flow from an idea: run `sf` in the repo root.
