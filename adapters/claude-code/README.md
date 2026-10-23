# Claude Code adapter (optional)

`assemble` works without this. The adapter adds a Stop hook so a long run keeps going without you typing `assemble resume` after each stop, in the same way as Anthropic's [ralph-loop plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop).

## Install

1. Copy the hook into your project: `cp adapters/claude-code/stop-hook.sh .claude/hooks/assemble-stop.sh && chmod +x .claude/hooks/assemble-stop.sh`
2. Add it to `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": ".claude/hooks/assemble-stop.sh" }] }
    ]
  }
}
```

Needs `jq` on your PATH.

## How it stops

- The hook only blocks when a `.assemble/*/state.md` has `status: running`.
- It lets Claude stop at `maxIterations`, so the skill can ask whether you want more rounds.
- If a continuation makes no progress (same iteration twice), it lets Claude stop rather than loop.
- `assemble cancel` sets the status to `cancelled`, which turns the hook off.
