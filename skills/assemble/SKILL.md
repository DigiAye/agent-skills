---
name: assemble
description: Multi-model iterative review loop. Four models take turns improving and checking one answer, rotating roles (builder, skeptic, edge cases, simplifier) over rounds of 4x4, then 3x4, then 2x4 (36 turns), stopping early when the answer converges. Use when the user says "/assemble", wants several models to cross-check a solution, design, plan or piece of code, or asks for a Ralph Wiggum style loop.
license: MIT
compatibility: Any agent that supports Agent Skills. Multi-vendor runs need either in-tool subagents with a model choice or the vendor CLIs used by scripts/run-model.sh (claude, codex, gemini, agent). Otherwise it falls back to one model playing four roles.
metadata:
  author: Joe Morrison (DigiAye)
  version: "1.0.0"
---

# assemble

Four models, one answer, many rounds. Each turn reads the current best answer, critiques it from a given role, and writes an improved version. Progress lives in files, not in the conversation, so every turn starts with fresh context (the Ralph Wiggum technique).

## Commands

| Command | What to do |
|---------|------------|
| `assemble <task>` | Start a run with the default schedule (36 turns). |
| `assemble --quick <task>` | One block of 2 passes x 4 models (8 turns). |
| `assemble resume [<slug>]` | Continue the most recent (or named) unfinished run. |
| `assemble cancel [<slug>]` | Set `status: cancelled` in the state file and stop. |
| `assemble status` | Show iteration, block, open `MUST` items and models used. |

## Before starting

1. Load `.assemble/config.json` if it exists, otherwise `assets/config.example.json`.
2. Pick the model adapter (see below) and tell the user which four models will run, and where their task text will be sent. If any model is outside `allowedModels`, or `localOnly` is true and a model is remote, drop it and say so.
3. Restate the task and the acceptance criteria in one short paragraph. If the task is unclear, ask the user before spending any rounds.
4. Create `.assemble/<slug>/` with `task.md`, `answer.md` (empty), and `state.md` as described in `references/state-format.md`. Make sure `.assemble/` is in `.gitignore`.

## The schedule

A round is one model turn. A pass is all four models taking one turn each, in order.

| Block | Passes | Turns | Running total |
|-------|--------|-------|---------------|
| 1 | 4 | 16 | 16 |
| 2 | 3 | 12 | 28 |
| 3 | 2 | 8 | 36 |

After turn 36, show the report and ask the user whether to run another block. Never go past 36 without asking.

Roles rotate each pass so every model plays every role: in pass `p` (0-based), model `m` plays `roles[(m + p) % 4]` from `references/roles.md`.

## Each turn

Build the turn prompt from files only, using `references/handoff-format.md`:

- `task.md`
- the current `answer.md`
- the previous turn's critique (from the latest `round-NN.md`)
- the role card for this turn

Don't include earlier rounds, and don't say which model wrote the current answer. Then:

1. Send the prompt to the model for this turn using the chosen adapter.
2. Parse the reply into a critique (each issue tagged `MUST` or `NICE`), a revised answer, and a verdict.
3. If the task is code and `checks` are configured, apply the revised answer in a scratch copy, run the checks, and add any failures to the critique as `MUST` items.
4. Write `round-NN.md` (role, model id, critique, check results, verdict, line diff size) and overwrite `answer.md` with the revised answer.
5. Update `state.md`: iteration, block, pass, open `MUST` count, and the no-change streak.
6. Give the user a one-line progress note: `Round 7/36 · skeptic · 2 MUST, 1 NICE · diff 14 lines`.

If a model errors or times out, log it in `round-NN.md`, skip the turn, and carry on. If two models in a row fail, pause and tell the user.

## Stopping

A turn counts as **no change** when it raises no `MUST` items and changes fewer than `noChangeLines` lines of `answer.md`.

Stop early when either:

- four turns in a row (a full pass) are no change, or
- a turn ends with `<promise>CONVERGED</promise>` and the next turn confirms with no `MUST` items.

If the open `MUST` count hasn't dropped for a full block, stop and write a short "stuck" note: what's blocking, what was tried, and what the user could decide to unblock it.

## Report

When the run ends, write `.assemble/<slug>/report.md` and show it:

- the final answer
- rounds run, and why it stopped
- the top changes in each block
- any open `NICE` items
- models used, with failures
- a rough token and cost estimate (sum of prompt and reply sizes, times prices in config if given)

## Model adapters

Use the first that's available, and tell the user which one you picked.

1. **In-tool subagents.** If the host can spawn subagents and pick their model, use one per turn. Cursor can mix vendors. Claude Code and Kiro only offer Claude models here, so the four will be Claude variants.
2. **Vendor CLIs.** Run `scripts/run-model.sh <model-id> <prompt-file>` once per turn. This is the true multi-vendor option. Check each CLI exists (`command -v`) before the run starts.
3. **Single model.** Run every turn yourself, playing the role for that turn. Read only the turn's files, and treat each turn as a fresh start.

Optional tool-specific helpers, such as a Claude Code stop hook for unattended runs, are in the repo's `adapters/` folder.
