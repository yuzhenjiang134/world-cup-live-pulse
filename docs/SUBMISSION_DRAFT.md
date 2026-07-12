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

- Match-first command center: score, match clock, latest beat, tune-in signal, source freshness, and spoken AI-style commentary.
- Local fan score challenge: 1,000 starting points, 50-point picks, one-time verified settlement, fan level/XP/streak/accuracy stats, and a downloadable card; no wallet, no stake, no market.
- Match pulse timeline: replay controls, key moments, market mood, goal swings, player impact, and schedule cards with verified event/goal/extra-time summaries.
- Data adapters: TxLINE fixtures/scores/odds through local token or secure proxy, plus a free no-token ESPN public World Cup scoreboard fallback for score, status, teams, venue, and events.
- Data truth system: every screen labels Replay, Seed, Delay, or Live, with checked time and source diagnostics explaining why.
- Settings and secondary context: eight languages, local-point reset, current source teams, a collapsed reference atlas, and authorized-video status stay available without crowding the main match view.
- Submission support: README, technical overview, endpoint notes, API feedback, demo-video package, and Superteam copy are included.

## TxODDS / TxLINE usage

The app is designed around the TxLINE integration boundary in `src/lib/txlineAdapter.ts`. The public build uses Replay and Seed data because a private TxLINE token is not deployed to GitHub Pages. Local builds can use `.env.local` to call the official TxLINE endpoints.

Official TxLINE documentation distinguishes mainnet Level 1 (60-second delay), mainnet Level 12 (real-time), and the current devnet Level 1 matrix row (`samplingIntervalSec = 0`). The app polls every 15 seconds and labels polling delivery `Delay` unless a true live stream is confirmed.

If TxLINE token access is unavailable during judging, Live mode still loads the no-token ESPN FIFA World Cup public scoreboard by default. That source is labeled separately and treated as `Delay`, not as official TxLINE data.

The 2026-07-11 authenticated snapshot returned three `CompetitionId 72` World Cup fixtures:

- Fixture `18213979`: Norway vs England.
- Fixture `18222446`: Argentina vs Switzerland.
- Fixture `18237038`: France vs Spain.

The adapter sends `competitionId=72` and applies a second response-side filter, preventing `CompetitionId 430` Friendlies from entering the World Cup Match Center or Teams view. The latest two consecutive probes on 2026-07-12 returned three current fixtures; fixture `18222446` returned 42 score records and zero official-odds records in both runs. The production fixture override stays blank so selection follows the latest source response, and numerical odds remain hidden while the current official payload is empty.

Implemented TxLINE endpoint mapping:

- `POST /auth/guest/start`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/scores/stat-validation` for the documented final-score proof path
- Team and player context only where supplied by fixtures, score events, or clearly labeled reference data

Live deployment note:

- The public GitHub Pages build does not ship a private TxLINE token.
- Local verification uses `.env.local` and `npm run txline:probe`.
- Public Live mode is designed to use `VITE_TXLINE_PROXY_BASE`, where a secure proxy stores `TXLINE_API_TOKEN` server-side and forwards only the allowlisted fixture, score, and odds endpoints.

The authenticated token used in local verification was activated through the official Solana devnet flow: wallet subscription transaction, guest JWT, signed activation message, and `/api/token/activate`. No wallet secret is used by the fan product.

Video is handled separately from TxLINE data. The public build does not embed match video. If a rights-cleared official broadcaster, FIFA, YouTube Live, or other authorized embed URL is configured locally, the optional Authorized Video Sync panel can display it and align the viewing context with match clock or replay minute.

## Data consistency note

World Cup matches are not available every day. The app does not invent live games. If TxLINE credentials are missing or a live endpoint fails, schedule entries remain Seed / Token Required, and the demo uses Replay fixtures for judgeable match flow.

## Why it fits the track

- It is built for ordinary fans, not traders.
- It makes match context easier to understand in real time.
- It remains judgeable without waiting for a live fixture.
- It creates a clear path for fan communities, Telegram groups, and sports media embeds.
- It avoids wallet, custody, betting, and prediction-market risk.

## Commercial path

- Free fan experience: match pulse, score challenge, replay, source trust, and official watch links.
- Community edition: branded challenges, group leaderboards, notifications, and share cards for supporter communities.
- Media/B2B edition: embeddable localized match-pulse widgets, sponsor placements, and engagement analytics for publishers and broadcasters.

## Demo flow

1. Open the deployed app on the match-first view.
2. Show the score, latest beat, tune-in signal, source label, and free-tier delay label.
3. Use local fan score pick, then export the prediction card.
4. Jump through the timeline to show goal swing, late volatility, and final whistle.
5. Point out the checked timestamp and explain Replay / Seed / Delay / Live.
6. Switch to Live mode and show either the TxLINE token/proxy path or the free public scoreboard fallback if TxLINE access is still blocked.
7. Open Settings only to show language support and optional modules.
8. Close with safety: no betting, no custody, no private token in the public build.
