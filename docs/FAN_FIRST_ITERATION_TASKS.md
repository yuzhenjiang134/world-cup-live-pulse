# Fan-First Iteration Tasks

Updated: 2026-07-12

This task list converts the market research, the user's prior requirements, and the official judging criteria into the current product iteration.

## P0: matchday essentials

- [x] Make score, match state, freshness, teams, and AI brief the first viewport.
- [x] Make the 1,000-point score challenge the primary interaction directly below the match hero.
- [x] Settle each fixture once from a verified final score and preserve challenge history.
- [x] Refresh the selected match every 15 seconds and immediately on focus/visibility.
- [x] Separate active schedule, verified 2026 replay, and legacy content.
- [x] Hide entire fields/sections when no verified source exists.
- [x] Replace the static tournament lane with the active adapter schedule.
- [x] Add source-derived 2026 team records and direct replay entry points.
- [x] Add a real followed-match alert toggle for newly verified goals, cards, score reviews, kick-off/half-time/full-time while the page is open.
- [x] Add a compact official World Cup coverage entry for news/live blogs without scraping article content.

## P0: interaction and accessibility

- [x] Event-driven AI brief for goals, yellow/red cards, score reviews, half-time, full-time, and momentum changes.
- [x] Spoken AI brief through browser speech synthesis.
- [x] Eight complete languages and Arabic RTL.
- [x] Localized known team names without altering unverified source identities.
- [x] Keyboard-operable score steppers, buttons, details, and navigation.
- [x] Verify focus visibility, reduced-motion behavior, screen-reader labels, and the final high-contrast light/dark surfaces.

## P1: catch-up and personalization

- [x] Deterministic event timeline, key moments, speed control, official archive/highlight links, and replay progress.
- [x] Fixture-keyed challenge history, level, streak, accuracy after a result exists, and share/download card.
- [x] Clearly labeled season demonstration isolated from real user points/history.
- [x] Add spoiler-free replay entry so a fan can start a completed match at minute 1 without seeing the final score first.
- [ ] Add a local favorite-team preference that prioritizes confirmed fixtures without hiding other matches.

## P1: trust and commercial proof

- [x] Strict World Cup scope, no-store proxy, empty-odds boundary, verified final-score settlement, and source timestamps.
- [x] Document free fan, community, publisher/widget, and broadcaster/localization paths without adding fake checkout UI.
- [ ] Add one concise in-product commercial proof point only if it helps judges and remains invisible to the normal fan path.

## Release, video, and submission

- [x] Complete local browser and screenshot acceptance after P0 changes.
- [x] Run full validation/build/security on the exact release worktree.
- [x] Commit, push, confirm CI/Pages on the same SHA, and run online E2E.
- [x] Record A/B demo candidates, review each twice, and keep both under five minutes; B is the final upload candidate.
- [ ] Upload and verify the final video without login.
- [ ] Run final judging audit, endpoint/document audit, claim audit, and secret audit.
- [ ] Submit the live URL, repo, video, technical overview, TxLINE endpoints, and API feedback before the official close.

## Source-gated features

Do not build or display these until a verified endpoint supplies them:

- [ ] Lineups and formations.
- [ ] Possession, shots, corners, xG, heatmaps, and player ratings.
- [ ] Injury/suspension news and editorial headlines.
- [ ] Official live-video embed availability by territory.

## Final fan-product extrapolation

- [x] Let a fan favorite one verified team locally and move that team to the front of team and schedule views.
- [x] Reuse the favorite-team signal only where it shortens a real fan task: team list, schedule order, and the next replay entry.
- [x] Do not create a generic personalization dashboard, account flow, or empty recommendation panel.
- [x] Keep the final judging cut below five minutes; the accepted 17-scene cut is 4:50 of dense product evidence.
- [x] Show working interaction before and after states rather than relying on static feature claims.
- [x] Use the user's locally stored, authorized voice profile for English narration after reverse-transcription and audio-quality checks pass.
- [x] Keep voice samples and voice-profile files local and excluded from Git; publish only the final mixed narration.
