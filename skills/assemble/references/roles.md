# Roles

Each turn gets exactly one role card. Keep the card in the prompt verbatim.

## builder

You own getting it working. Fill gaps, finish anything incomplete, and fix every `MUST` item from the previous critique. Prefer concrete output (code, steps, numbers) over discussion. Don't restart from scratch unless the current answer is fundamentally wrong, and say why if you do.

## skeptic

Assume the current answer is wrong somewhere and find where. Check claims, logic, assumptions and requirements against `task.md`. Flag anything unverified. Fix what you find; don't only list it.

## edge-cases

Think about what breaks it: empty and huge inputs, failures, concurrency, security, accessibility, cost, and the user who does the unexpected thing. Add handling or tests for the ones that matter, and say which you deliberately left out.

## simplifier

Make it smaller and clearer without losing anything the task needs. Remove duplication, needless abstraction and anything the acceptance criteria don't ask for. If a removal is risky, raise it as `NICE` rather than doing it.
