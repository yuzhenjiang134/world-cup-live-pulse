# Technical Overview

## Goal

World Cup Live Pulse is a fan-facing World Cup match dashboard for the Superteam Earn / TxODDS Consumer and Fan Experiences track. The product turns match state, key events, market mood, and short AI-style commentary into a readable fan pulse without exposing betting, trading, wallet, or custody flows.

## Architecture

```text
TxLINE API or replay fixtures
-> src/lib/txlineAdapter.ts
-> normalized MatchData
-> src/lib/pulse.ts
-> React dashboard
-> share card and demo video
```

The UI reads one normalized `MatchData` model. Replay data and live TxLINE data use the same adapter boundary so the product can be judged today and tested locally with real credentials without changing the dashboard surface.

## Hackathon submission fit

The final submission package is optimized for the official Consumer and Fan Experiences criteria:

- Fan Accessibility and UX: a polished dashboard for ordinary fans, not a trader terminal.
- Real-Time Responsiveness: the adapter and pulse model are ready to react to live score, event, and market updates from TxLINE.
- Originality and Value Creation: fan command center, local score pick, Judge Demo chapters, fan commentary, and share cards turn raw feed changes into understandable match moments.
- Commercial and Monetization Path: the same surface can support fan communities, match media embeds, and premium club or creator dashboards without betting mechanics.
- Completeness and Execution: the public app is functional now in Replay + Seed mode, with a clear path to TxLINE Live mode after official access is configured.

The competition requires a working deployed app or endpoint, public repo, demo video under 5 minutes, technical documentation, endpoint usage notes, and API feedback. This repository keeps those files in `docs/` so product work and submission work stay synchronized.

## Data consistency model

The app separates four data states:

| State | Meaning | Current use |
|---|---|---|
| Live | Data pulled from TxLINE with configured credentials and endpoint mapping | Implemented in the adapter; requires local token |
| Delay | Live-like data that is not guaranteed to be real time | Reserved for delayed feeds |
| Replay | Fixed historical replay data for judging and demo recording | Implemented |
| Seed | Official schedule/context or static background data such as teams, players, referee, standings, and schedule labels | Implemented |

This matters because World Cup matches are not played every day. The public build must never invent a live match. If there is no confirmed live fixture or the TxLINE token is missing, the UI shows Replay and Seed labels instead of pretending to be live.

On 2026-06-28 UTC, the public Today Board includes official TxLINE World Cup Schedule seed fixtures for Jordan vs Argentina and Algeria vs Austria. They are shown as `Seed / Token Required` in the public build because GitHub Pages is not deployed with a private TxLINE token.

## Current implementation

- `src/data/replayMatch.ts`: two replay fixtures with score events, market snapshots, team profiles, key players, referee, kickoff time, and optional group table.
- `src/data/matchCalendar.ts`: public Today Board state with official schedule seed fixtures and Token Required behavior.
- `src/lib/txlineAdapter.ts`: single integration boundary for replay fallback and authenticated TxLINE live mode.
- `src/lib/pulse.ts`: deterministic pulse frame builder for score, latest event, commentary, pressure, and market mood.
- `src/lib/shareCard.ts`: SVG export for a fan share card.
- `src/App.tsx`: dashboard UI with Replay/Live mode, rolling match ticker, fan command center, local score-linked fan pick, details-on-demand reveal buttons, Today Board, Daily Brief, Data Audit, Live Readiness, endpoint status cards, Judge Demo chapters, Match Intelligence, Match Center, team profiles, group table, four-language settings, and safety copy.

## Product surfaces

- Today Board: makes No Match Day and token-required states visible.
- Match data ticker: keeps score, clock, source state, next beat, market mood, and safety visible without adding another heavy panel.
- Fan command center: keeps the watch-now read, AI commentary, recent event feed, local score pick, source status, and team / fixture detail entry points in the primary fan view.
- Local score pick: score steppers and quick pick buttons update a local fan selection only; no wallet, persistence, odds execution, wager, or prediction-market mechanic is attached.
- Trust & Accuracy Center: explains official schedule seed, live token gate, replay truth, Free Tier delay behavior, and scan-friendly endpoint coverage cards.
- Judge Demo chapters: repeatable path for data integrity, goal swing, late volatility, and upset-context review.
- Match Intelligence: phase summary, event stack, and player impact derived from replay events.
- Match Center: kickoff, referee, data status, qualification note, discipline, team profiles, key players, and group context.
- Global fan language setting: English, Chinese, Spanish, and Portuguese.

## TxLINE integration boundary

The adapter maps external TxLINE responses into:

- `MatchData`
- `MatchEvent`
- `MarketSnapshot`
- `DataSourceState`

Live responses must include enough metadata to keep the UI honest: fixture date, match status, data freshness, event IDs, and whether the feed is live or delayed.

Current mapped endpoint families:

- `POST /auth/guest/start` for guest JWT bootstrap.
- `GET /api/fixtures/snapshot` for schedule and Today Board.
- `GET /api/scores/snapshot/{fixtureId}` for score clock and match events.
- `GET /api/odds/snapshot/{fixtureId}` for market snapshots.
- `GET /api/scores/stream` and `GET /api/odds/stream` remain future SSE streaming upgrades.

The official OpenAPI spec requires `Authorization: Bearer <guest JWT>` and `X-Api-Token: <API token>` for the authenticated data endpoints. The public GitHub Pages build does not include these secrets; local testing uses `.env.local`.

## Safety boundary

The product is informational only. It does not:

- Place bets
- Recommend trades
- Operate a prediction market
- Handle wallets
- Request private keys, seed phrases, verification codes, or API tokens in the UI
- Store secrets in the repository

## Verification

Run:

```bash
npm.cmd run check
npm.cmd run fixtures
npm.cmd run preflight
npm.cmd run security
npm.cmd run build
```

For the full local gate:

```bash
npm.cmd run validate
```
