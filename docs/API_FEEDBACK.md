# TxLINE API Feedback

## Build-stage feedback

World Cup Live Pulse is built replay-first because the public hackathon build needs to be judgeable even when no World Cup match is active. The app now also has a real TxLINE HTTP adapter for fixtures, scores, and odds, while keeping private credentials local-only. The most important API need is not only live data, but trustworthy status metadata that lets the product avoid pretending schedule seed or replay data is live.

## What would improve the developer experience

- Keep the self-serve hackathon token path visible in the official docs: funded devnet wallet, free-tier subscribe transaction, guest JWT, signed activation payload, `/api/token/activate`, then `X-Api-Token`.
- A single visible sponsor access route on the hackathon page. On 2026-07-03, Superteam Earn support clarified that Earn support does not issue TxODDS API credentials and teams should contact `https://t.me/TxLINEChat` for sponsor-side questions.
- A match calendar endpoint with explicit `no_live_match_today` or equivalent empty-state metadata.
- A fixture access field that says whether a fixture is unlocked live, delayed, token-gated, or unavailable.
- A machine-readable effective delay field in every payload. Official docs distinguish mainnet Level 1 (60-second delay), mainnet Level 12 (real-time), and the current devnet Level 1 pricing row (`samplingIntervalSec = 0`), but clients still need to know the actual delivery state per response.
- A clear freshness field for every score, event, and odds snapshot.
- Stable event IDs so the UI can deduplicate goals, cards, substitutions, and market shifts.
- Sample payloads for live, delayed, scheduled, finished, postponed, and no-match-day states.
- A documented odds meaning model so the product can label market movement correctly and avoid betting-advice language.
- CORS guidance for browser demos.
- A recommended secure-proxy pattern for static deployments such as GitHub Pages.
- Rate limits and recommended polling interval.
- Standard error codes for token missing, token expired, rate limit, match not found, and no active fixture.
- A documented final-score recipe for fan apps: select `Action = "game_finalised"`, then request `statKeys=1,2` from `/api/scores/stat-validation` for participant total goals.

## What worked well

- One normalized fixture/score/odds model makes it practical to drive the Match Center from a single adapter boundary.
- Guest JWT bootstrap and `X-Api-Token` separation keep short-lived session auth distinct from subscription access.
- Score snapshots contain enough action-level data to normalize goals, cards, substitutions, clock, and final-state behavior.
- The documented `game_finalised` plus stat-validation path gives final-score settlement a stronger trust story than an arbitrary in-play snapshot.
- The official free tier allows commercial use and currently documents no API call rate limit, which is helpful for consumer prototypes.

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
- Authenticated TxLINE World Cup fixtures directly in Match Center and the source-first Teams view.
- A No Match Day rule when no official fixture is known.
- A real local TxLINE adapter that requests `POST /auth/guest/start`, `GET /api/fixtures/snapshot`, `GET /api/scores/snapshot/{fixtureId}`, and `GET /api/odds/snapshot/{fixtureId}` when credentials are present.
- Optional public Live proxy support through `VITE_TXLINE_PROXY_BASE`, so GitHub Pages can call a token-holding proxy instead of exposing credentials in the frontend bundle.
- A free no-token ESPN public World Cup scoreboard fallback that keeps Live mode useful when TxLINE activation is blocked, while clearly labeling it as a non-TxLINE public signal.
- Safe activation helper pages for the devnet free-tier subscribe and `/api/token/activate` flow.
- Deterministic replay stories to make the same core Match Center flow repeatable for judges.
- Pulse Play, key-moment navigation, score settlement, and followed-match alerts all consume the same normalized event contract; no second demo-only event model exists.
- English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic UI labels for global fan testing.

## Public implementation patterns observed

On 2026-07-01, public GitHub research found TxLINE-related projects using several patterns:

- Server-side API routes or proxies that store `TXLINE_API_KEY` / `TXLINE_API_TOKEN` in encrypted environment variables.
- Browser `EventSource` connected to a same-origin `/api/...` route, with the server forwarding TxLINE SSE streams.
- Demo or mock fallback when the key is absent.
- Local activation scripts that request guest JWT, activate a token, and verify fixture access without committing secrets.

The safest pattern for this project is the same: GitHub Pages remains a static replay / seed app, and real public Live mode uses a separate token-holding proxy.

## Verified token findings on 2026-07-11

- `GET /api/fixtures/snapshot?competitionId=72` returned 3 World Cup fixtures in two consecutive probes.
- The selected World Cup fixture was `18213979` (Norway vs England), with 2 score records in both probes.
- `GET /api/odds/snapshot/18213979` returned 0 records in the first probe and 27 in the second. Consumer clients therefore need an explicit empty/temporarily unavailable state rather than stale or synthetic odds.
- On 2026-07-12, two consecutive probes returned 2 World Cup fixtures. Fixture `18222446` returned 40 score records and 20 official-odds records in both probes.
- A later pair on 2026-07-12 returned 3 World Cup fixtures. The same fixture returned 42 score records and 0 official-odds records in both probes. This confirms that score and odds collections can evolve independently and that a consumer client must not reuse an older non-empty odds snapshot as current truth.
- Leaving `VITE_TXLINE_FIXTURE_ID` blank is the correct production default; it follows the current World Cup fixture instead of pinning a completed match.
- The broader fixture snapshot can include `CompetitionId 430` Friendlies beside `CompetitionId 72` World Cup data. The product now applies both the query parameter and a response-side competition filter.
- The token, guest JWT, and local environment values were not printed by the probe.

## Verified token findings on 2026-07-13

Two consecutive authenticated probes completed with the same current selection:

- Guest JWT bootstrap resolved successfully.
- `GET /api/fixtures/snapshot?competitionId=72` returned 2 accepted World Cup fixture records.
- Fixture `18237038` returned 2 score snapshot records.
- The same fixture returned 4 official-odds snapshot records in the first final-candidate probe and 7 in the second. This reinforces that score and odds collections evolve independently and must be timestamped rather than merged with stale values.
- Final-score stat validation was intentionally skipped because no final sequence was configured; the product did not present an unrequested proof as successful.
- No token, JWT, or local environment value was printed.

These numbers are dated integration observations, not permanent World Cup facts. The final submission should describe the successful endpoint path and truth behavior without hard-coding these counts into the fan interface.

## Current endpoint mapping in the product

- `POST /auth/guest/start`: guest JWT bootstrap.
- `GET /api/fixtures/snapshot`: schedule snapshot and Source Board.
- `GET /api/scores/snapshot/{fixtureId}`: live score clock and event mapping.
- `GET /api/odds/snapshot/{fixtureId}`: market mood snapshots.
- `GET /api/scores/stat-validation?fixtureId=<FixtureId>&seq=<Seq>&statKeys=1,2`: optional final-score proof path after `Action = "game_finalised"`.

`/api/scores/stream` and `/api/odds/stream` are not claimed as implemented product dependencies. They remain a future server-proxy optimization after the polling build is accepted.

## Final verification on 2026-07-16

Two consecutive authenticated release probes completed successfully:

- Guest JWT bootstrap resolved in both runs.
- `GET /api/fixtures/snapshot?competitionId=72` returned 2 accepted World Cup fixture records in both runs.
- Fixture `18257865` returned 2 score snapshot records in both runs.
- The official-odds collection changed from 3 records to 2 between runs, so the product continues to timestamp and replace each current collection independently.
- Final-score stat validation was not claimed because no final sequence was configured.
- No token, JWT, wallet secret, or local environment value was printed.

## Detailed integration consequences

The most important integration lesson is that consumer truth is a state machine, not a single score number:

- Fixture scope can be broader than the requested competition, so response-side filtering is mandatory.
- Score and odds collections can become available at different times, so an empty odds response cannot inherit an earlier value.
- A historical fixture is finished, but a replay cursor before full time is not. The UI must separate fixture outcome from current replay-frame state.
- A penalty flag can enrich fan presentation without inferring the event from prose.
- Player IDs are not player names. Numeric-only identities must remain hidden.
- A goal-like update is not enough for challenge settlement. The product needs the final action and, when configured, participant total-goal proof.
- Browser notifications need stable event identity and user preferences to avoid duplicate or unwanted alerts.

For the TxLINE developer experience, the highest-value additions would be a single typed consumer example that demonstrates fixture selection, event deduplication, delayed/freshness labeling, `game_finalised`, penalty metadata, and stat validation together. That would prevent each fan application from independently reconstructing the same safety rules.

## Final submission note

The final submission version should preserve:

- The exact endpoints used.
- What worked well in the normalized schema.
- Any auth, CORS, freshness, rate-limit, or no-match-day friction.
- Any bug or documentation gap reported to TxODDS support.
- Which endpoint drove each visible product surface: Match Center, Pulse Play, score challenge settlement, schedule, teams, and official odds.
- Dated probe evidence, with dynamic record counts clearly labeled as observations rather than permanent facts.
- The exact public-deployment secret boundary and why a static GitHub Pages bundle requires a token-holding proxy for authenticated TxLINE Live mode.
