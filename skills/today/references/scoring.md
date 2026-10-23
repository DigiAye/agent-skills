# Scoring rules

Scores are deterministic so `explain` can always show why an item ranks where it does. Add the points for every rule that matches and record each match in `reasons`, for example `"+30 someone is blocked on you"`.

| Rule | Points |
|------|--------|
| Someone is blocked waiting on the user (review requested, direct question, assigned blocker) | +30 |
| Due today, or overdue | +25 |
| Due within 2 working days | +10 |
| From or mentioning a VIP in `config.json` | +15 |
| Direct @mention or 1:1 chat | +10 |
| PR review requested, per working day it has waited (max +20) | +5 |
| Jira priority Highest / High | +15 / +8 |
| Production incident or on-call label | +40 |
| Related to a meeting today (same people or ticket key in the meeting title) | +5 |
| Newsletter, automated notification or FYI distribution list | -20 |
| Already handled (user replied last, PR approved by the user, ticket done) | drop the item |

## Ties and staleness

- Break ties by oldest `updated` first, so things don't sit forever.
- Mark an item `stale: true` if it has been in `focus` or `waitingOnMe` for more than one working day without change.

## Tuning

Users can override any value in `config.json` under `scoring`. Use the config values when present and these defaults otherwise.
