# agent-skills

Two portable [Agent Skills](https://agentskills.io) from my day-to-day AI-first workflow. They follow the open `SKILL.md` standard, so they work in Claude Code, Cursor, Kiro, Codex, Gemini CLI and any other agent that reads it.

| Skill | What it does | Page |
|-------|--------------|------|
| [`today`](skills/today/SKILL.md) | Pulls Teams, Outlook, GitHub and Jira into one ranked focus list, plus a local HUD, and keeps it updated through the day. | [digiaye.github.io/agent-skills/today](https://digiaye.github.io/agent-skills/today/) |
| [`assemble`](skills/assemble/SKILL.md) | A multi-model Ralph Wiggum loop: four models take turns improving and checking one answer over up to 36 rounds. | [digiaye.github.io/agent-skills/assemble](https://digiaye.github.io/agent-skills/assemble/) |

These are sanitised samples. They contain no employer data, tenant IDs or internal URLs.

## Install

```bash
git clone https://github.com/DigiAye/agent-skills.git
cd agent-skills
./install.sh            # symlinks both skills into every supported tool's user skills folder
```

Or use the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add DigiAye/agent-skills
```

| Tool | User-level folder | Notes |
|------|-------------------|-------|
| Claude Code | `~/.claude/skills/` | Invoke with `/today` or `/assemble` |
| Cursor | `~/.cursor/skills/` or `~/.agents/skills/` | Also reads `~/.claude/skills/` |
| Codex, Gemini CLI | `~/.agents/skills/` | |
| Kiro | `~/.kiro/skills/` | Kiro CLI needs one extra config line; see [adapters/kiro](adapters/kiro/README.md) |

## Portability

Both skills use only the core frontmatter fields from the spec (`name`, `description`, `license`, `compatibility`, `metadata`). Features that only some tools support, such as Claude Code hooks, live in [`adapters/`](adapters/) and are optional.

## Safety

- `today` is read-only by default. It treats every email, chat message and ticket as untrusted data, never as instructions, and asks before any write action.
- `assemble` can send your task to several model vendors. Use the `allowedModels` list and `localOnly` flag in its config to control where your data goes.
- Working state (`~/.today/`, `.assemble/`) stays on your machine and is gitignored.

## Landing pages

The GitHub Pages site lives in [`docs/`](docs/) with no build step. `docs/today/demo/` is a copy of the HUD, so after changing it run:

```bash
cp skills/today/hud/index.html skills/today/hud/focus.example.js docs/today/demo/
```

## Credits

The design of the landing pages is inspired by film HUD interfaces. This project is not affiliated with, or endorsed by, Marvel or Disney. Icons are from [Lucide](https://lucide.dev) (see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)).

The loop design builds on Geoffrey Huntley's [Ralph Wiggum technique](https://ghuntley.com/ralph/) and Andrej Karpathy's [llm-council](https://github.com/karpathy/llm-council).

## Licence

MIT, by [Joe Morrison / DigiAye](https://www.digiaye.scot).
