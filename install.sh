#!/usr/bin/env bash
# Symlink every skill in ./skills into each supported tool's user-level skills folder.
# Usage: ./install.sh [--uninstall]
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGETS=(
  "$HOME/.claude/skills"
  "$HOME/.agents/skills"
  "$HOME/.cursor/skills"
  "$HOME/.kiro/skills"
)

for skill_path in "$REPO_DIR"/skills/*/; do
  skill="$(basename "$skill_path")"
  for target in "${TARGETS[@]}"; do
    link="$target/$skill"
    if [[ "${1:-}" == "--uninstall" ]]; then
      [[ -L "$link" ]] && rm "$link" && echo "removed $link"
      continue
    fi
    mkdir -p "$target"
    if [[ -e "$link" && ! -L "$link" ]]; then
      echo "skipped $link (a real folder already exists)"
      continue
    fi
    ln -sfn "${skill_path%/}" "$link"
    echo "linked  $link"
  done
done

echo
echo "Kiro CLI users: see adapters/kiro/README.md for the extra agent config line."
