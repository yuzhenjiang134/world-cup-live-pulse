# Final Submission Checklist

Updated: 2026-07-11

Official listing checked 2026-07-12: the syncing public submission counter moved from 25 to 27 across consecutive fetches. This track still lists 16,000 USDT total prizes (10,000 / 4,000 / 2,000) and a July 29, 2026 winner announcement. Recheck the dynamic count and close timer immediately before submission.

This is the checklist for the current matchday shell. Older Source Board / Judge Demo prototype labels are retired from the primary interface and must not be described as visible product features.

## Product

- [x] Match Center is the first view and shows the selected 2026 fixture state.
- [x] Score challenge is the first interaction block below the score hero.
- [x] Score challenge history is stored by fixture and settles a verified final exactly once.
- [x] The season demonstration is explicitly labeled, uses verified 2026 replay finals, and is isolated from the user's actual points and history.
- [x] AI match briefs react to goals, cards, score reviews, half-time, full-time, and momentum changes in all eight languages, with browser speech playback.
- [x] Known current team names use the active interface language across Match Center, schedule context, team details, and AI briefs.
- [x] New local sessions receive 1,000 test points; points persist locally and can be reset in Settings.
- [x] The challenge visibly explains current points, per-pick cost, and final-score settlement before the user enters a score.
- [x] Fan level and XP progress reward correct and exact historical results without turning points into money or a transferable asset.
- [x] Challenge settlement uses the verified final score in Replay or Live data; it has no cash value, wallet flow, betting, or trading advice.
- [x] Multi-match picks persist by fixture ID, pending fixtures are rechecked in the background, and each verified final can award points only once.
- [x] Match events show goals, yellow cards, red cards, substitutions, halftime, fulltime, added time, and score changes when the source provides them.
- [x] AI-style fan commentary is source-state aware and does not claim certainty.
- [x] Schedule and progression are inside Match Center, with historical replay shortcuts.
- [x] Replay is deterministic and separate from current 2026 Match Center data.
- [x] Teams and players are available as a separate atlas, with compact key-player context in Match Center.
- [x] Schedule cards expose stage, kickoff, status, verified score, and event/goal/extra-time summaries; current source team cards expose fixture count and opponents.
- [x] Settings contains language, local points reset, refresh, and hidden TxLINE connection controls.
- [x] Chinese, English, Spanish, Portuguese, French, German, Japanese, and Arabic UI keys are validated as a shared set.

## Data Truth

- [x] TxLINE fixtures, scores, and odds endpoints are mapped in `src/lib/txlineAdapter.ts`.
- [x] Authenticated TxLINE data remains local through `.env.local` or the local proxy; credentials are never rendered or committed.
- [x] `Live`, `Delay`, `Seed`, and `Replay` labels are not interchangeable.
- [x] Current/upcoming fixtures are source-checked schedule data; they do not receive synthetic scores or kickoff events.
- [x] Official odds are displayed only when the TxLINE odds payload is present; derived and replay snapshots are labeled separately.
- [x] Unknown source team codes are shown as pending confirmation instead of being invented as real teams.
- [x] TxLINE fixture requests default to World Cup `CompetitionId 72`, and a second adapter-side filter rejects Friendlies `CompetitionId 430` before selection, schedule rendering, or team extraction.
- [x] Legacy 2022 demos are absent from the primary fan path; the active replay library uses verified 2026 TxLINE sequences.
- [x] The primary replay library uses eight authenticated, sanitized 2026 TxLINE historical sequences with `game_finalised` results.
- [x] `npm run audit` checks replay dates, event scores, market values, team identities, video domains, feature markers, and data boundaries.
- [x] Repeated `npm run txline:probe` checks on 2026-07-11 kept 3 World Cup fixtures and 2 score records for fixture `18213979` stable. Official odds varied between 0 and 27 records across checks; the final local pair returned 3 then 5. Empty odds are shown honestly and never backfilled with invented values.
- [x] The latest 2026-07-12 probe pair returned 3 World Cup fixtures; fixture `18222446` returned 42 score records and 0 official-odds records both times. Production follows the current source fixture and hides numerical odds while the official payload is empty.

## Video

- [x] The product opens official FIFA+ archive and highlights/replay pages over HTTPS.
- [x] The product does not scrape or embed unofficial streams.
- [x] Rights and territory limitations are visible; the in-app timeline remains the deterministic fallback.
- [ ] A public match video URL is added only if an authorized provider grants one.

## Verification

- [x] `npm run check`
- [x] `npm run i18n`
- [x] `npm run fixtures`
- [x] `npm run audit`
- [x] `npm run scope`
- [x] `npm run validate`
- [x] `npm run build`
- [x] `npm run security`
- [x] Browser smoke test: Match Center, Replay, Teams, Settings, 1,000 points, official video links.
- [x] Browser E2E: one charge, one final-score settlement, no duplicate reward, reload persistence, TTS/share controls, and 390px responsive layout.
- [x] Local proxy returns HTTP 200 for the app and TxLINE fixtures endpoint.
- [x] Production bundle contains no JWT-shaped credential values.

## Submission Package

Final submission gate: do not submit until the latest Pages asset hash and final demo URL are verified.

Local-first rule: no push and no final video until the data-truth, complete-product-flow, and release-quality rounds all pass on the same local worktree. Then recheck the live official listing and perform a fresh requirement-by-requirement gap audit before any online push.

- [x] Public GitHub repository: `https://github.com/yuzhenjiang134/world-cup-live-pulse`
- [x] README, technical overview, endpoint mapping, API feedback, user manual, submission draft, and demo script.
- [x] Five-criterion evidence audit: `docs/JUDGING_AUDIT_2026-07-11.md`.
- [x] Official track requirements are reflected: working app/API access, public repo, specific TxLINE endpoint list, API feedback, TxLINE live input, and Solana sign-up path.
- [x] GitHub Pages workflow is configured and the public URL returns HTTP 200.
- [x] Generate the final English judging cut only after local acceptance; the accepted candidate is 4:50, 1280x720, H.264/AAC, and contains 17 scenes.
- [x] Review the final candidate twice: all 17 narration segments pass reverse transcription and audio metrics; the complete MP4 decodes and all 17 scene midpoints pass visual inspection.
- [ ] Push the accepted worktree, confirm CI/Pages on the same SHA, then verify no-login page access, MP4 playback/download, remote hash, public E2E, and secret scan.
- [ ] Re-check the live Superteam listing and submit before the stated deadline if unchanged.

## Required Track Language

The submission must explicitly explain the Consumer and Fan Experiences value: fast fan accessibility, observable real-time responsiveness, score-challenge interaction, replay judgeability, commercial embedding potential, and a complete working flow. Source truth is represented by the visible source state, checked timestamp, data-status labels, and hidden connection diagnostics.
