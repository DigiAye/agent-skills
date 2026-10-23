# Turn prompt and reply format

## Prompt (sent to the model each turn)

```markdown
You are one turn in an iterative review loop. Other reviewers came before you and more will come after.
You don't know who wrote the current answer; judge it on its merits.

# Role
<role card from roles.md>

# Task
<task.md>

# Current answer
<answer.md, or "(empty: you are first)">

# Previous critique
<critique section of the latest round-NN.md, or "(none)">

# Reply in exactly this format
## Critique
- MUST: <issue that has to be fixed for the answer to meet the task>
- NICE: <improvement that would help but isn't required>
(write "- none" if you have nothing)

## Answer
<the complete revised answer, not a diff>

## Verdict
<one sentence on the state of the answer>
<if, and only if, you'd ship this answer as-is: <promise>CONVERGED</promise>>
```

## Parsing the reply

- Split on the `## Critique`, `## Answer` and `## Verdict` headings.
- If the `## Answer` section is missing or empty, keep the previous `answer.md` and log the turn as a failure.
- Count lines starting with `- MUST:` and `- NICE:`.
- Only treat `<promise>CONVERGED</promise>` as real if it's inside the Verdict section.
