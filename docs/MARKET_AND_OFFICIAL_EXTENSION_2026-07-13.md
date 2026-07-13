# Fan Product Research and Extension Decisions

Updated: 2026-07-13

This pass asks one product question: what should a mainstream World Cup fan be able to do in seconds, and which of those actions can World Cup Live Pulse support with verified data today?

## Current official references

- Superteam World Cup Hackathon: https://superteam.fun/earn/hackathon/world-cup/
- Consumer and Fan Experiences listing: https://superteam.fun/earn/listing/consumer-and-fan-experiences/
- FIFA Official App: https://apps.apple.com/us/app/fifa-official-app/id756904853
- OneFootball product guide: https://onefootballsupport.zendesk.com/hc/en-us/articles/4412970161937-What-does-the-OneFootball-app-offer
- FotMob product listing: https://apps.apple.com/gb/app/fotmob-football-live-scores/id488575683

The public submission counter changes while the listing syncs. It is useful for competition awareness but is not product data and must never be hard-coded into the app or demo.

## What fans repeatedly need

1. **Know the match state immediately.** Score, clock/status, stage and data freshness must be visible before analysis.
2. **Do not miss the moments that changed the match.** Goals, cards, score reviews, half-time, full-time and added time form the fastest catch-up path.
3. **Understand why the next match or event matters.** Stage and progression should be explained without inventing form, lineups or tactical claims.
4. **Participate without friction.** A points-only score challenge should be reversible before kickoff, close fairly at kickoff and settle once from the verified final score.
5. **Return to what matters personally.** Followed matches, favorite teams, alerts, replay shortcuts and spoiler control should shorten repeat visits.
6. **See player facts only when identity is reliable.** Readable source names may show verified goals, cards, substitutions and event minutes. Source-only numeric IDs are omitted.

## Market patterns adopted

### FIFA Official App

The official app prioritizes a real-time match centre, key moments, schedule and tournament progression, predictors, favorites and alerts. World Cup Live Pulse extends this pattern with a single source-aware match story: the score challenge, AI brief, key moments and replay all consume the same normalized event state.

### OneFootball

OneFootball emphasizes date/live filters, followed teams and matches, highlights or rights-controlled video offers, and a personalized profile. World Cup Live Pulse keeps the main navigation smaller: Match Center, Schedule & Replay, Teams and Settings. Favorites reorder useful content without hiding other verified matches.

### FotMob

FotMob demonstrates the value of instant notifications, detailed match pages, text/audio commentary and highlights. World Cup Live Pulse adopts event alerts and three commentary modes, but deliberately rejects xG, ratings, lineups and TV claims until a reliable endpoint is available.

## Official requirement extensions

### Fan accessibility and UX

- Primary score challenge directly under the match hero.
- Pre-kickoff editing with one charge and one record per fixture.
- Key-moment jumps, spoiler-free replay, eight languages and mobile-safe layout.

### Real-time responsiveness

- Fifteen-second live refresh plus focus/visibility refresh.
- Goals, cards, reviews and match-state changes update the timeline, AI brief and alerts.
- Only `game_finalised` can settle the challenge; missing official odds remain hidden.

### Originality and value

- Three useful AI modes: current call, why it matters and 30-second catch-up.
- Scheduled matches receive matchup, stage, kickoff, progression meaning and a clear fan action instead of a one-line empty state.
- Source-gated player evidence and deterministic 2026 replay make the same product useful during and between live matches.

## Rejected until a reliable source exists

- Starting lineups, injuries, shirt numbers, positions and coaches.
- xG, shot maps, player ratings and tactical assertions.
- Guaranteed free live video, territory-independent streams or scraped broadcasts.
- Simulated odds or probabilities presented as official market data.
- Numeric player IDs shown as names.

## Acceptance evidence for this pass

- Rule tests: challenge opens only before kickoff in live mode, while replay remains judgeable.
- Browser test: first save deducts once, edit costs no extra points, one fixture keeps one ledger record, and the edited score survives reload.
- AI test: call, why and catch-up differ in all eight languages and use only source-backed stage/kickoff/event facts.
- Player audit: no raw ID, `Goal event`, `Card event`, `Score event` or `Event participant` reaches fan UI.
