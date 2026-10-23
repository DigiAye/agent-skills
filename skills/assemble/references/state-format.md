# Run state

Everything for a run lives in `.assemble/<slug>/`, where `<slug>` is a short kebab-case name for the task.

```
.assemble/<slug>/
  task.md       # the task and acceptance criteria, written once at the start
  answer.md     # the current best answer, overwritten every turn
  state.md      # progress (below)
  round-01.md   # one log per turn
  ...
  report.md     # written when the run ends
```

## `state.md`

```markdown
---
status: running          # running | converged | stuck | cancelled | max-reached
iteration: 7             # turns completed
block: 1
pass: 1                  # 0-based within the block
schedule: [4, 3, 2]      # passes per block
maxIterations: 36
models: [model-a, model-b, model-c, model-d]
adapter: cli             # subagent | cli | single
openMust: 2
noChangeStreak: 0
converging: false        # true after a turn emits the promise, until the next turn confirms it
startedAt: 2026-10-23T21:00:00Z
---
Optional notes for the user, e.g. why a model was dropped.
```

## `round-NN.md`

```markdown
---
round: 7
block: 1
pass: 1
role: skeptic
model: model-c
diffLines: 14
must: 2
nice: 1
checks: failed           # passed | failed | skipped
---
## Critique
...
## Check output
...
## Verdict
...
```

To resume, read `state.md`, work out the next model and role from `iteration`, `schedule` and the rotation rule, and carry on.
