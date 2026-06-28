# UX Benchmarks

Updated: 2026-06-28

This note tracks market UX patterns used to sharpen World Cup Live Pulse for the Consumer and Fan Experiences track.

## Products reviewed

- FotMob: football-first navigation, match pages, news, transfers, TV schedules, a predictor entry point, and a lineup builder.
  Source: https://www.fotmob.com/
- Sofascore: real-time live scores, statistics, league tables, video highlights, fixtures, player ratings, match details, favorites, and no manual refresh.
  Source: https://www.sofascore.com/
- Flashscore: large live-score coverage, detailed match statistics, xG, cards, fouls, lineups, live commentary, match reports, news, video highlights, and real-time updates.
  Source: https://www.flashscore.com/
- FIFA Match Centre: official match-centre framing for tournament fixtures and results.
  Source: https://www.fifa.com/en/match-centre

## UX patterns worth adopting

- Keep a compact match header visible early: teams, score, source state, venue, and live/replay status.
- Add fast match navigation: Watch, Pick, Timeline, Mood, and Teams should be one tap away on mobile.
- Make the default state fan-first: show the current match read, event feed, local score pick, and key context before documentation.
- Keep deep context available on demand: team cards, fixture details, schedule truth, and API status should exist, but not crowd the first screen.
- Use match data labels aggressively: Live, Delay, Replay, and Seed must be visible so no-match-day states do not feel fake.
- Make interactions real: navigation buttons must scroll or reveal content, and score-pick controls must update the displayed choice.
- Preserve video rights boundaries: video can exist only as a rights-cleared official embed, never as a scraped or unofficial stream.

## Patterns intentionally rejected

- Betting calls to action, odds comparison as a gambling workflow, and wager prompts.
- Wallet connection, token custody, or prediction-market settlement.
- Large homepage-style marketing sections before the product experience.
- Dense stats tables in the default fan view.
- Fake live indicators when the current build is Replay or Seed.

## Changes applied from this scan

- Added a sticky match focus navigation bar after the ticker.
- Kept Watch and Pick above analysis panels.
- Routed Teams through a reveal button instead of showing team material by default.
- Preserved Timeline and Mood as one-tap destinations.
- Added a compact matchday hub for replay fixtures and official token-gated schedule seed matches.
- Added a downloadable local fan pick card so score prediction becomes shareable without becoming a betting flow.
- Updated demo and technical docs to explain local fan score pick safety.
