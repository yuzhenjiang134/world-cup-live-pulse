# TxLINE API Feedback

## Build-stage feedback

World Cup Live Pulse is built replay-first because the public hackathon build needs to be judgeable even when no World Cup match is active. The app now also has a real TxLINE HTTP adapter for fixtures, scores, and odds, while keeping private credentials local-only. The most important API need is not only live data, but trustworthy status metadata that lets the product avoid pretending schedule seed or replay data is live.

## What would improve the developer experience

- A self-serve hackathon token path that does not require guessing whether teams should use Solana activation, direct support, or a sponsor-issued `X-Api-Token`.
- A match calendar endpoint with explicit `no_live_match_today` or equivalent empty-state metadata.
- A fixture access field that says whether a fixture is unlocked live, delayed, token-gated, or unavailable.
- A clear freshness field for every score, event, and odds snapshot.
- Stable event IDs so the UI can deduplicate goals, cards, substitutions, and market shifts.
- Sample payloads for live, delayed, scheduled, finished, postponed, and no-match-day states.
- A documented odds meaning model so the product can label market movement correctly and avoid betting-advice language.
- CORS guidance for browser demos.
- A recommended secure-proxy pattern for static deployments such as GitHub Pages.
- Rate limits and recommended polling interval.
- Standard error codes for token missing, token expired, rate limit, match not found, and no active fixture.

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
- `GET /api/scores/stream`: future server-sent score updates.
- `GET /api/odds/stream`: future server-sent odds updates.

## Final submission note

This file should be updated again after real token testing. The final version should list:

- The exact endpoints used.
- What worked well in the normalized schema.
- Any auth, CORS, freshness, rate-limit, or no-match-day friction.
- Any bug or documentation gap reported to TxODDS support.
