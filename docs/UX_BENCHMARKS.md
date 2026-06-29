# UX Benchmarks

Updated: 2026-06-29

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
- Added a source trust strip, live signal summary, and visual prediction bars so the first product path behaves more like a mature match center.

## 2026-06-29 five-iteration upgrade scan

| Iteration | Dimension | Market reference | Upgrade applied |
| --- | --- | --- | --- |
| 1 | Match-first action path | FotMob keeps match, predictor, lineup, and football tools close to the live match experience. | Added first-screen Watch / Pick / Timeline actions directly inside the match hero. |
| 2 | Data accuracy and source trust | Sofascore and Flashscore make live score state, match details, statistics, and refresh confidence central to the product. | Added a compact source trust strip for current mode, data status, and canonical source. |
| 3 | Judge/demo comprehension | Hackathon review depends on a short demo video and a clear proof path, not only a nice page. | Added demo cues for Replay demo, data consistency, no betting, and SVG export before chapter controls. |
| 4 | Mobile and accessibility | WCAG 2.2 and mature sports apps require touch-friendly controls and responsive text behavior. | Hardened hero actions for mobile tap size, wrapping, and long-language text safety. |
| 5 | Submission readiness | Superteam/TxODDS judging rewards a complete, executable product with clear user value. | Updated the checklist to match the eight-language product state and keep final submission evidence accurate. |

## 2026-06-29 deeper market and organizer QA scan

| Round | Reference | Quality gap found | Upgrade applied |
| --- | --- | --- | --- |
| 1 | FotMob / OneFootball style match-first surfaces | Watch view needed stronger "what matters now" signal density without adding a new panel. | Added a live signal strip for current read, goals, cards, and market swings inside Watch Now. |
| 2 | Sofascore / Flashscore stat-forward match pages | Decimal market prices were at risk of being read as direct percentages. | Converted quick-pick display to implied-probability bars while keeping market prices visible and no-betting copy intact. |
| 3 | LiveScore / ESPN-style match centers | Data trust had to stay near the score, not buried in audit panels. | Added freshness as a first-class source trust chip beside mode, data status, and source. |
| 4 | TxODDS/Superteam judging requirements | Submission docs must prove a functional product, API boundary, demo path, and feedback loop. | Synchronized README, technical overview, UX benchmarks, and API feedback with the live product state. |
