# TxLINE API Feedback

## Build-stage feedback

World Cup Live Pulse is built replay-first because the public hackathon build needs to be judgeable even when no World Cup match is active. The app now also has a real TxLINE HTTP adapter for fixtures, scores, and odds, while keeping private credentials local-only. The most important API need is not only live data, but trustworthy status metadata that lets the product avoid pretending schedule seed or replay data is live.

## What would improve the developer experience

- Keep the self-serve hackathon token path visible in the official docs: funded devnet wallet, free-tier subscribe transaction, guest JWT, signed activation payload, `/api/token/activate`, then `X-Api-Token`.
- A single visible sponsor access route on the hackathon page. On 2026-07-03, Superteam Earn support clarified that Earn support does not issue TxODDS API credentials and teams should contact `https://t.me/TxLINEChat` for sponsor-side questions.
- A match calendar endpoint with explicit `no_live_match_today` or equivalent empty-state metadata.
- A fixture access field that says whether a fixture is unlocked live, delayed, token-gated, or unavailable.
- A machine-readable delay field for the free tier. Current community evidence says service level 1 is a 60-second delayed feed for World Cup and International Friendlies, and products should not have to infer that from chat messages.
- A clear freshness field for every score, event, and odds snapshot.
- Stable event IDs so the UI can deduplicate goals, cards, substitutions, and market shifts.
- Sample payloads for live, delayed, scheduled, finished, postponed, and no-match-day states.
- A documented odds meaning model so the product can label market movement correctly and avoid betting-advice language.
- CORS guidance for browser demos.
- A recommended secure-proxy pattern for static deployments such as GitHub Pages.
- Rate limits and recommended polling interval.
- Standard error codes for token missing, token expired, rate limit, match not found, and no active fixture.
- A documented final-score recipe for fan apps: select `Action = "game_finalised"`, then request `statKeys=1,2` from `/api/scores/stat-validation` for participant total goals.

## Product-specific feedback

For consumer fan experiences, the API is strongest when it can support explanation, not just raw values. Useful extra fields would include:

- Match status label
- Localized kickoff time
- Venue and referee
- Group or knockout stage
- Qualification context
- Player involved in each event
- Feed freshness and delay level
- Stable match chapter or highlight markers for consumer replay and social sharing
- Localized names or short labels for teams, competition stages, and match status

## Current handling

The current app uses:

- `Replay` data for deterministic match playback.
- `Seed` data for official schedule context and static context.
- A visible `TxLINE token needed` state for Live mode.
- Official TxLINE schedule snapshot fixtures in the Source Board when known.
- A No Match Day rule when no official fixture is known.
- A real local TxLINE adapter that requests `POST /auth/guest/start`, `GET /api/fixtures/snapshot`, `GET /api/scores/snapshot/{fixtureId}`, and `GET /api/odds/snapshot/{fixtureId}` when credentials are present.
- Optional public Live proxy support through `VITE_TXLINE_PROXY_BASE`, so GitHub Pages can call a token-holding proxy instead of exposing credentials in the frontend bundle.
- A free no-token ESPN public World Cup scoreboard fallback that keeps Live mode useful when TxLINE activation is blocked, while clearly labeling it as a non-TxLINE public signal.
- Safe activation helper pages for the devnet free-tier subscribe and `/api/token/activate` flow.
- Judge Demo chapters to make replay evaluation repeatable.
- English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic UI labels for global fan testing.

## Public implementation patterns observed

On 2026-07-01, public GitHub research found TxLINE-related projects using several patterns:

- Server-side API routes or proxies that store `TXLINE_API_KEY` / `TXLINE_API_TOKEN` in encrypted environment variables.
- Browser `EventSource` connected to a same-origin `/api/...` route, with the server forwarding TxLINE SSE streams.
- Demo or mock fallback when the key is absent.
- Local activation scripts that request guest JWT, activate a token, and verify fixture access without committing secrets.

The safest pattern for this project is the same: GitHub Pages remains a static replay / seed app, and real public Live mode uses a separate token-holding proxy.

## Current endpoint mapping in the product

- `POST /auth/guest/start`: guest JWT bootstrap.
- `GET /api/fixtures/snapshot`: schedule snapshot and Source Board.
- `GET /api/scores/snapshot/{fixtureId}`: live score clock and event mapping.
- `GET /api/odds/snapshot/{fixtureId}`: market mood snapshots.
- `GET /api/scores/stat-validation?fixtureId=<FixtureId>&seq=<Seq>&statKeys=1,2`: optional final-score proof path after `Action = "game_finalised"`.
- `GET /api/scores/stream`: future server-sent score updates.
- `GET /api/odds/stream`: future server-sent odds updates.

## Final submission note

This file should be updated again after real token testing. The final version should list:

- The exact endpoints used.
- What worked well in the normalized schema.
- Any auth, CORS, freshness, rate-limit, or no-match-day friction.
- Any bug or documentation gap reported to TxODDS support.
