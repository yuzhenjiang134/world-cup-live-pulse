# Technical Overview

Updated: 2026-07-13

The detailed judge-facing implementation note is `docs/TECHNICAL_SUBMISSION_2026-07-13.md`. This file remains the short technical overview requested by the submission form.

World Cup Live Pulse is a Vite, React, and TypeScript consumer match companion for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

## Product architecture

```text
TxLINE or public scoreboard
  -> source adapter and competition guard
  -> normalized MatchData
  -> pulse frame and grounded commentary
  -> Match Center, challenge, timeline, teams, and replay
```

The production entry point renders `src/MatchdayApp.tsx`. It has four product surfaces:

- Match Center: source state, score, fan pulse, score challenge, event timeline, AI-style commentary, followed-match alerts, odds context, schedule, and official watch links.
- Pulse Play: a rights-safe animated match theatre driven by the same normalized goal, penalty, card, added-time, and final-state events as Match Center.
- Replay: fixed historical matches using the same Match Center components.
- Teams: teams from the selected match and current source first, followed by a collapsed reference atlas.
- Settings: language, persisted goal/card/full-time alert choices, local points reset, refresh, and advanced TxLINE diagnostics.

## TxLINE integration

`src/lib/txlineAdapter.ts` owns all raw TxLINE payload knowledge. The UI only receives normalized `MatchLoadResult` data.

Implemented requests:

- `POST /auth/guest/start`
- `GET /api/fixtures/snapshot?competitionId=72`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/historical/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/scores/stat-validation?fixtureId=<id>&seq=<seq>&statKeys=1,2`

The browser never receives a committed credential. Local development uses the Vite `/__txline` proxy with ignored `.env.local` values. A public authenticated build must use a server-side proxy through `VITE_TXLINE_PROXY_BASE`.

## Competition scope guard

The TxLINE feed can contain multiple competitions. `src/lib/worldCupScope.ts` defines World Cup `CompetitionId 72` as the product boundary.

Protection is applied twice:

1. The fixture request defaults to `competitionId=72`.
2. The response is filtered again before fixture selection, schedule rendering, or team extraction.

If a record has a numeric competition ID, only `72` is accepted. This blocks observed Friendlies `CompetitionId 430`, even if a configured fixture ID points to one of those records.

## Data consistency model

- `Live`: use only when the named source provides a current authenticated live payload.
- `Delay`: delayed/free-tier or named public scoreboard payload.
- `Seed`: schedule or reference context without verified current score/events.
- `Replay`: deterministic historical data for review outside match hours.

Scheduled fixtures display no synthetic score or kickoff event. Empty official odds remain empty. Unknown facts are hidden or marked pending instead of inferred.

The bundled judgeable replay archive contains ten sanitized 2026 TxLINE historical sequences, including both completed semi-finals. Every result is resolved from `Action = game_finalised`; provisional goals that are later removed are shown as review/correction events and are excluded from confirmed goal counts. The archive retains fixture IDs, source endpoint, record sequence, and capture time but contains no credentials.

For knockout final results, the documented proof path starts from the TxLINE record where `Action = "game_finalised"`, then requests participant total-goal proof with `statKeys=1,2`.

## Score challenge

The fan challenge is local entertainment only:

- 1,000 starting points.
- 50 points per locked score.
- Exact score: +250 points.
- Correct result: +100 points.
- Miss: +0 points.
- One charge and one settlement per stored match state.
- Free edits before kickoff without another point charge.
- Streak, best streak, accuracy, reload persistence, and SVG share card.

It has no cash value, wallet, token, transaction, wager, prediction market, or trading advice.

## AI-style commentary

Commentary, evaluation, and prediction labels are generated from normalized score, events, market snapshot, match status, and source state. Browser speech synthesis can read the current commentary aloud. No external LLM is required for the judgeable flow, and the UI does not present generated text as verified source data.

## Localization

The typed UI dictionary supports English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic. The validator requires the same shared keys in every language and checks UTF-8 text. Tournament navigation and current-fixture truth notes have matching localized copy, and Arabic switches the document to RTL. Team and player proper names remain source names.

## Video boundary

TxLINE supplies match data, not video rights. The product opens HTTPS FIFA+ archive and highlight pages and can accept an optional rights-cleared URL through `VITE_AUTHORIZED_VIDEO_EMBED_URL`. It does not scrape, mirror, or embed unofficial streams.

## Failure behavior

- No TxLINE credential: try the named public FIFA World Cup scoreboard fallback.
- TxLINE/public source failure: show an honest source error and retain deterministic Replay.
- No current event: show scheduled/no-match state without invented activity.
- Empty odds: hide official odds or show unavailable; never substitute derived values under an official label.

## Verification

```text
npm run validate
npm run build
npm run txline:probe
npm run e2e:matchday
```

The validation suite covers TypeScript, replay fixtures, eight-language parity, data truth, challenge rules, World Cup scope, ten 2026 archive finals, submission files, secret scanning, and the TxLINE subscribe helper. Browser E2E covers one-time challenge settlement, pre-kickoff edits, Pulse Play event states, local cheers, persisted alert preferences, replay, tournament progression, team detail, controls, keyboard access, and 1440px/390px layouts.

## Source truth model

Every claim visible in the fan interface must be traceable to the selected source, replay fixture, or clearly labeled reference context. Checked time and data state are product features, not debug decoration.
