#!/usr/bin/env bash
# Claude Code Stop hook: while an assemble run in this project is still running,
# block the session from stopping and tell Claude to take the next turn.
set -euo pipefail

input="$(cat)"
# Avoid an infinite loop if Claude Code is already continuing because of this hook.
if [[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" == "true" ]]; then
  active_guard=1
else
  active_guard=0
fi

shopt -s nullglob
for state in .assemble/*/state.md; do
  status="$(sed -n 's/^status: *\([a-z-]*\).*/\1/p' "$state" | head -1)"
  [[ "$status" == "running" ]] || continue

  iteration="$(sed -n 's/^iteration: *\([0-9]*\).*/\1/p' "$state" | head -1)"
  max="$(sed -n 's/^maxIterations: *\([0-9]*\).*/\1/p' "$state" | head -1)"
  slug="$(basename "$(dirname "$state")")"

  # Let Claude stop at the cap so the skill can ask the user about more rounds.
  if [[ -n "$max" && "${iteration:-0}" -ge "$max" ]]; then exit 0; fi
  # A runaway guard: if the previous continuation made no progress, let it stop.
  marker=".assemble/$slug/.last-hook-iteration"
  if [[ "$active_guard" == 1 && -f "$marker" && "$(cat "$marker")" == "${iteration:-0}" ]]; then exit 0; fi
  echo "${iteration:-0}" > "$marker"

  jq -n --arg reason "assemble run '$slug' is still running (turn ${iteration:-0}/${max:-36}). Run: assemble resume $slug" \
    --arg msg "assemble: continuing $slug" \
    '{decision: "block", reason: $reason, systemMessage: $msg}'
  exit 0
done
exit 0
