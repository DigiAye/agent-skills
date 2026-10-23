# Sources

Try each option in order and use the first that works. `doctor` reports which one was picked for each source.

## GitHub

1. GitHub MCP server, if the host has one.
2. `gh` CLI: `gh search prs --review-requested=@me --state=open`, `gh search prs --author=@me --state=open`, `gh api notifications`.
3. Paste mode: ask the user to paste their notifications list.

## Jira

1. Atlassian remote MCP server, if the host has one.
2. `acli` (Atlassian CLI): search with JQL `assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC, updated DESC`.
3. Paste mode: ask for the output of a saved Jira filter.

## Outlook (mail and calendar) and Teams (chats and channels)

Both go through Microsoft Graph. Reading chats and channels needs an Entra app registration and usually tenant-admin consent, so check with your IT team before setting this up at work.

1. A Microsoft Graph or Microsoft 365 MCP server, if the host has one.
2. The PnP [`m365` CLI](https://pnp.github.io/cli-microsoft365/) after `m365 login`, for example `m365 outlook message list --folderName inbox` and `m365 teams chat list`.
3. Paste or export mode: ask the user to paste unread mail subjects and senders, and any Teams mentions. This always works and sends nothing over the network.

Only read the fields you need: sender, subject or first line, time, read state, and link. Don't read full bodies unless the user asks.

## Scheduling refreshes

Skills can't run on a timer, but the agent's CLI can be scheduled.

macOS (`launchd`), refreshing every hour on weekdays: save as `~/Library/LaunchAgents/scot.digiaye.today.plist`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>scot.digiaye.today</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>-lc</string><string>claude -p "/today refresh"</string></array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Weekday</key><integer>1</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Weekday</key><integer>2</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Weekday</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Weekday</key><integer>4</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Weekday</key><integer>5</integer><key>Minute</key><integer>0</integer></dict>
  </array>
</dict>
</plist>
```

Load it with `launchctl load ~/Library/LaunchAgents/scot.digiaye.today.plist`.

Linux (`cron`): `0 9-17 * * 1-5 claude -p "/today refresh"`.

Swap `claude -p` for your tool's non-interactive command, for example `agent -p` (Cursor CLI) or `gemini -p`.
