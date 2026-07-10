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
- Demo video: https://yuzhenjiang134.github.io/world-cup-live-pulse/demo/

## What it does

World Cup Live Pulse gives fans one place to understand whether a match is worth watching right now. It combines score, key events, market movement, match pulse, local score-pick entertainment, team context, and short AI-style commentary into a dashboard that can be watched with real TxLINE data or replayed for judging.

The current build includes:

- Match-first command center: score, match clock, latest beat, tune-in signal, source freshness, and AI-style commentary.
- Local fan score pick: entertainment-only prediction controls with a downloadable card; no wallet, no stake, no market.
- Match pulse timeline: replay controls, key moments, market mood, goal swings, and player impact.
- Data adapters: TxLINE fixtures/scores/odds through local token or secure proxy, plus a free no-token ESPN public World Cup scoreboard fallback for score, status, teams, venue, and events.
- Data truth system: every screen labels Replay, Seed, Delay, or Live, with a Trust & Accuracy Center explaining why.
- Settings and secondary context: languages, optional operation guide, fixture briefing, country/team atlas, and authorized-video status are available without crowding the main match view.
- Submission support: README, technical overview, endpoint notes, API feedback, demo-video package, and Superteam copy are included.

## TxODDS / TxLINE usage

The app is designed around the TxLINE integration boundary in `src/lib/txlineAdapter.ts`. The public build uses Replay and Seed data because a private TxLINE token is not deployed to GitHub Pages. Local builds can use `.env.local` to call the official TxLINE endpoints.

Current TxLINEChat evidence indicates hackathon service level 1 is a 60-second delayed feed for World Cup and International Friendlies. Therefore authenticated free-tier payloads are labeled `Delay` unless TxLINE grants a higher live tier.

If TxLINE token access is unavailable during judging, Live mode still loads the no-token ESPN FIFA World Cup public scoreboard by default. That source is labeled separately and treated as `Delay`, not as official TxLINE data.

The Source Board uses a TxLINE World Cup Schedule snapshot checked on 2026-06-28. The snapshot observed fixtures for 2026-06-28 UTC:

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

Live deployment note:

- The public GitHub Pages build does not ship a private TxLINE token.
- Local verification uses `.env.local` and `npm run txline:probe`.
- Public Live mode is designed to use `VITE_TXLINE_PROXY_BASE`, where a secure proxy stores `TXLINE_API_TOKEN` server-side and forwards only the allowlisted fixture, score, and odds endpoints.

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

1. Open the deployed app on the match-first view.
2. Show the score, latest beat, tune-in signal, source label, and free-tier delay label.
3. Use local fan score pick, then export the prediction card.
4. Jump through the timeline to show goal swing, late volatility, and final whistle.
5. Open Trust & Accuracy Center and explain Replay / Seed / Delay / Live.
6. Switch to Live mode and show either the TxLINE token/proxy path or the free public scoreboard fallback if TxLINE access is still blocked.
7. Open Settings only to show language support and optional modules.
8. Close with safety: no betting, no custody, no private token in the public build.
