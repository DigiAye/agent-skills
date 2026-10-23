#!/usr/bin/env bash
# Run one assemble turn through a vendor CLI and print the reply to stdout.
# Usage: run-model.sh <vendor:model> <prompt-file>
#   vendor: claude | codex | gemini | cursor
#   model:  a model name for that CLI, or "default" to use the CLI's default
set -euo pipefail

spec="${1:?usage: run-model.sh <vendor:model> <prompt-file>}"
prompt_file="${2:?usage: run-model.sh <vendor:model> <prompt-file>}"
vendor="${spec%%:*}"
model="${spec#*:}"
[[ "$model" == "$spec" ]] && model="default"
timeout_s="${ASSEMBLE_TIMEOUT:-600}"

[[ -r "$prompt_file" ]] || { echo "prompt file not readable: $prompt_file" >&2; exit 2; }
prompt="$(cat "$prompt_file")"

need() { command -v "$1" >/dev/null || { echo "$1 CLI not found on PATH" >&2; exit 3; }; }

run() {
  if command -v timeout >/dev/null; then timeout "$timeout_s" "$@"
  elif command -v gtimeout >/dev/null; then gtimeout "$timeout_s" "$@"
  else "$@"
  fi
}

# Empty-array-safe expansion for bash 3.2 (macOS default) with set -u.
flags=()
add_model() { [[ "$model" == "default" ]] || flags=("$1" "$model"); }

case "$vendor" in
  claude) need claude; add_model --model; run claude -p ${flags[@]+"${flags[@]}"} "$prompt" ;;
  codex)  need codex;  add_model -m;      run codex exec ${flags[@]+"${flags[@]}"} "$prompt" ;;
  gemini) need gemini; add_model -m;      run gemini ${flags[@]+"${flags[@]}"} -p "$prompt" ;;
  cursor) need agent;  add_model --model; run agent -p ${flags[@]+"${flags[@]}"} "$prompt" ;;
  *) echo "unknown vendor: $vendor (expected claude, codex, gemini or cursor)" >&2; exit 2 ;;
esac
