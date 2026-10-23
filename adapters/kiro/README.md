# Kiro notes

The Kiro IDE picks up skills from `~/.kiro/skills/` (global) and `.kiro/skills/` (workspace) automatically, so `./install.sh` is enough.

Kiro CLI custom agents also need the skills listed as resources. Add this to `.kiro/agents/<agent>.json`:

```json
{
  "resources": ["skill://.kiro/skills/**/SKILL.md"]
}
```

For skills installed globally, use the absolute path to your home folder, for example `skill:///Users/you/.kiro/skills/**/SKILL.md`.

## Assemble on Kiro

Kiro's built-in agents run on Claude models, so in-tool turns give you four Claude variants. For a mix of vendors, use the CLI adapter (`skills/assemble/scripts/run-model.sh`) with the other vendors' CLIs installed.
