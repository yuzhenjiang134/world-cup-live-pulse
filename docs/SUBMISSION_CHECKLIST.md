# Final Submission Checklist

Updated: 2026-07-11

Official listing snapshot checked 2026-07-11: 20 public submissions; this track lists 16,000 USDT total prizes (10,000 / 4,000 / 2,000), with a July 19, 2026 23:59 UTC close and July 29, 2026 15:00 UTC announcement. The overall World Cup hackathon pool is listed as 50,000 USDT.

This is the checklist for the current matchday shell. Older Source Board / Judge Demo prototype labels are retired from the primary interface and must not be described as visible product features.

## Product

- [x] Match Center is the first view and shows the selected 2026 fixture state.
- [x] Score challenge is the first interaction block below the score hero.
- [x] New local sessions receive 1,000 test points; points persist locally and can be reset in Settings.
- [x] The challenge visibly explains current points, per-pick cost, and final-score settlement before the user enters a score.
- [x] Challenge settlement uses the verified final score in Replay or Live data; it has no cash value, wallet flow, betting, or trading advice.
- [x] Match events show goals, yellow cards, red cards, substitutions, halftime, fulltime, added time, and score changes when the source provides them.
- [x] AI-style fan commentary is source-state aware and does not claim certainty.
- [x] Schedule and progression are inside Match Center, with historical replay shortcuts.
- [x] Replay is deterministic and separate from current 2026 Match Center data.
- [x] Teams and players are available as a separate atlas, with compact key-player context in Match Center.
- [x] Settings contains language, local points reset, refresh, and hidden TxLINE connection controls.
- [x] Chinese, English, Spanish, Portuguese, French, German, Japanese, and Arabic UI keys are validated as a shared set.

## Data Truth

- [x] TxLINE fixtures, scores, and odds endpoints are mapped in `src/lib/txlineAdapter.ts`.
- [x] Authenticated TxLINE data remains local through `.env.local` or the local proxy; credentials are never rendered or committed.
- [x] `Live`, `Delay`, `Seed`, and `Replay` labels are not interchangeable.
- [x] Current/upcoming fixtures are source-checked schedule data; they do not receive synthetic scores or kickoff events.
- [x] Official odds are displayed only when the TxLINE odds payload is present; derived and replay snapshots are labeled separately.
- [x] Unknown source team codes are shown as pending confirmation instead of being invented as real teams.
- [x] The bundled Argentina-France and Germany-Japan fixtures are explicitly historical 2022 replay demos.
- [x] `npm run audit` checks replay dates, event scores, market values, team identities, video domains, feature markers, and data boundaries.
- [x] `npm run txline:probe` passed twice on 2026-07-11: 7 fixture records, 41 score records for fixture `17588325`, and 0 odds records for that fixture.

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
- [x] `npm run validate`
- [x] `npm run build`
- [x] `npm run security`
- [x] Browser smoke test: Match Center, Replay, Teams, Settings, 1,000 points, official video links.
- [x] Local proxy returns HTTP 200 for the app and TxLINE fixtures endpoint.
- [x] Production bundle contains no JWT-shaped credential values.

## Submission Package

Final submission gate: do not submit until the latest Pages asset hash and final demo URL are verified.

- [x] Public GitHub repository: `https://github.com/yuzhenjiang134/world-cup-live-pulse`
- [x] README, technical overview, endpoint mapping, API feedback, user manual, submission draft, and demo script.
- [x] Official track requirements are reflected: working app/API access, public repo, specific TxLINE endpoint list, API feedback, TxLINE live input, and Solana sign-up path.
- [x] GitHub Pages workflow is configured and the public URL returns HTTP 200.
- [ ] Confirm Pages has switched to the latest pushed asset hash before recording the final demo.
- [ ] Record a demo under 5 minutes showing Match Center, score challenge, source status, Replay, Teams, Settings, and official video links.
- [ ] Re-check the live Superteam listing and submit before the stated deadline if unchanged.

## Required Track Language

The submission must explicitly explain the Consumer and Fan Experiences value: fast fan accessibility, observable real-time responsiveness, score-challenge interaction, replay judgeability, commercial embedding potential, and a complete working flow. The Trust & Accuracy Center is represented by the visible source state, checked timestamp, data-status labels, and hidden connection diagnostics.
