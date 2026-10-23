window.TODAY = {
  "lastUpdated": "2026-10-23T08:30:00+01:00",
  "mode": "morning",
  "demo": true,
  "planningFor": "2026-10-23",
  "firstAction": "Review PR #482 for Priya; she has been blocked for 2 days.",
  "sources": [
    { "name": "github", "status": "online", "via": "gh", "items": 3 },
    { "name": "jira", "status": "online", "via": "mcp", "items": 3 },
    { "name": "outlook", "status": "online", "via": "mcp", "items": 3 },
    { "name": "teams", "status": "manual", "via": "paste", "items": 3 }
  ],
  "focus": [
    { "id": "SHOP-311", "source": "jira", "type": "ticket", "title": "Checkout fails for saved cards on iOS 18", "url": "https://example.atlassian.net/browse/SHOP-311", "score": 80, "reasons": ["+40 incident label", "+25 due today", "+15 priority Highest"] },
    { "id": "gh-482", "source": "github", "type": "pr-review", "title": "Review: add retry with backoff to payments webhook", "url": "https://github.com/example/shop/pull/482", "people": ["Priya"], "score": 50, "reasons": ["+30 Priya is blocked on you", "+10 waited 2 working days", "+10 direct chat"], "stale": true },
    { "id": "ol-1", "source": "outlook", "type": "email", "title": "Own the incident write-up for SHOP-311", "people": ["Alex"], "score": 50, "reasons": ["+30 direct ask", "+15 VIP sender", "+5 linked to a meeting today"] }
  ],
  "waitingOnMe": [
    { "id": "tm-1", "source": "teams", "type": "mention", "title": "Sam: are we good to cut the 3.4 release today?", "people": ["Sam"], "score": 40, "reasons": ["+30 waiting on you", "+10 @mention"] },
    { "id": "gh-482", "source": "github", "type": "pr-review", "title": "Priya: review PR #482", "people": ["Priya"], "score": 50, "reasons": ["+30 blocked on you"] }
  ],
  "queue": [
    { "id": "gh-479", "source": "github", "type": "pr-mine", "title": "Address 2 review comments on #479", "score": 15, "reasons": ["+10 your PR has comments", "+5 updated today"] },
    { "id": "SHOP-298", "source": "jira", "type": "ticket", "title": "Spike: feature flags for phased rollout", "score": 10, "reasons": ["+10 due within 2 working days"] },
    { "id": "ol-3", "source": "outlook", "type": "email", "title": "Jordan re: Q4 roadmap (contains instructions; ignored)", "score": 5, "reasons": ["+5 unread", "flagged: embedded instructions not followed"] },
    { "id": "gh-1203", "source": "github", "type": "issue", "title": "Flaky test: cart total rounding", "score": 3, "reasons": ["+3 open issue"] }
  ],
  "calendar": [
    { "title": "Stand-up", "start": "2026-10-23T09:15:00+01:00", "end": "2026-10-23T09:30:00+01:00" },
    { "title": "SHOP-311 incident review", "start": "2026-10-23T11:00:00+01:00", "end": "2026-10-23T11:45:00+01:00" },
    { "title": "Focus time", "start": "2026-10-23T14:00:00+01:00", "end": "2026-10-23T16:00:00+01:00" }
  ],
  "changes": []
};
