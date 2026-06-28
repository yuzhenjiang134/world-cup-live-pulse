# Superteam Submission Draft

## Project title

World Cup Live Pulse

## Track

Consumer and Fan Experiences

## One-line pitch

A fan-first World Cup dashboard that turns match events, score changes, market mood, and AI-style commentary into a clear live pulse for ordinary fans.

## Public links

- Deployed app: https://yuzhenjiang134.github.io/world-cup-live-pulse/
- GitHub repo: https://github.com/yuzhenjiang134/world-cup-live-pulse
- Demo video: TBD

## What it does

World Cup Live Pulse gives fans one place to understand why a match feels different now. It combines score, key events, market movement, match pulse, team context, and short commentary into a dashboard that can be watched live or replayed for highlights.

The current build includes:

- Replay mode with two World Cup scenarios.
- Live mode wired through a real TxLINE HTTP adapter for fixtures, scores, and odds.
- Today Board with official TxLINE schedule seed fixtures and Token Required live handling.
- Daily Brief, Data Audit, and Live Readiness panels.
- Operation Manual, Fixture Briefing, and Country Team Atlas for first-time users.
- Optional Authorized Video Sync panel for rights-cleared official video embeds.
- Trust & Accuracy Center for schedule seed, token gate, replay truth, Free Tier delay behavior, and endpoint coverage.
- Judge Demo chapters for data integrity, goal swing, late volatility, and upset context.
- Match Intelligence with phase summary, event stack, and player impact.
- Match Center with kickoff time, referee, qualification note, discipline events, team profiles, key players, and group table where relevant.
- English, Chinese, Spanish, and Portuguese language setting.
- Share card export.
- Safety boundary copy: no betting, no trading advice, no wallets, no custody.

## TxODDS / TxLINE usage

The app is designed around the TxLINE integration boundary in `src/lib/txlineAdapter.ts`. The public build uses Replay and Seed data because a private TxLINE token is not deployed to GitHub Pages. Local builds can use `.env.local` to call the official TxLINE endpoints.

The Today Board uses official TxLINE World Cup Schedule seed fixtures observed for 2026-06-28 UTC:

- Fixture `17588325`: Jordan vs Argentina.
- Fixture `17588326`: Algeria vs Austria.

These schedule entries are shown as Seed / Token Required. They are not presented as Live until authenticated score, event, and odds feeds are loaded.

Implemented TxLINE endpoint mapping:

- `POST /auth/guest/start`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/scores/stream` and `GET /api/odds/stream` as future SSE upgrades
- Team, player, referee, and standings context where available from fixtures, score events, seed data, or future context endpoints

Video is handled separately from TxLINE data. The public build does not embed match video. If a rights-cleared official broadcaster, FIFA, YouTube Live, or other authorized embed URL is configured locally, the optional Authorized Video Sync panel can display it and align the viewing context with match clock or replay minute.

## Data consistency note

World Cup matches are not available every day. The app does not invent live games. If TxLINE credentials are missing or a live endpoint fails, schedule entries remain Seed / Token Required, and the demo uses Replay fixtures for judgeable match flow.

## Why it fits the track

- It is built for ordinary fans, not traders.
- It makes match context easier to understand in real time.
- It remains judgeable without waiting for a live fixture.
- It creates a clear path for fan communities, Telegram groups, and sports media embeds.
- It avoids wallet, custody, betting, and prediction-market risk.

## Demo flow

1. Open the deployed app.
2. Show the Today Board with official schedule seed fixtures and data status labels.
3. Show the Trust & Accuracy Center and explain Seed / Replay / Live / Delay.
4. Use the Judge Demo chapter buttons: Data integrity, Goal swing, Late volatility, and Upset context.
5. Open Settings to show optional modules only when needed: Operation Manual, Fixture Briefing, Country Team Atlas, and Authorized Video Sync status.
6. Show Match Intelligence: phase summary, event stack, and player impact.
7. Show Match Center: referee, kickoff, qualification, team profiles, discipline, and group table.
8. Switch settings across language, viewing preset, and module visibility.
9. Open Live mode and explain the TxLINE token-needed boundary, or show a local authenticated TxLINE fixture if a safe token is configured off-camera.
10. Export the share card and close with the safety boundary.
