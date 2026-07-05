# TxLINE Endpoints Usage

## Current status

The public build runs with Replay and Seed data because no private TxLINE token is deployed to GitHub Pages. The local app can call the official TxLINE HTTP API through `src/lib/txlineAdapter.ts` when `.env.local` contains a valid `X-Api-Token`.

Current hackathon access route, based on TxLINEChat clarification on 2026-07-05:

```text
funded devnet wallet -> service level 1 / 4 week subscribe txSig -> guest JWT -> /api/token/activate -> local X-Api-Token
```

Do not share JWT publicly. If activation fails after a valid subscribe transaction, share only the public wallet address and subscribe tx signature with TxLINEChat.

The Rust SDK helper shared in TxLINEChat confirms the same activation message preimage:

```text
${txSig}:${selectedLeagues.join(",")}:${jwt}
```

For the standard World Cup bundle with no selected leagues, this becomes `txSig::jwt`.

For public Live mode, the static app should call a secure HTTPS proxy through `VITE_TXLINE_PROXY_BASE`. The proxy stores the real token server-side and forwards only the allowlisted TxLINE endpoints. This avoids exposing private credentials in the GitHub Pages bundle.

The official OpenAPI spec checked on 2026-06-28 reports:

- Production server: `https://txline.txodds.com`
- Guest JWT endpoint: `POST /auth/guest/start`
- Fixtures snapshot: `GET /api/fixtures/snapshot`
- Scores snapshot: `GET /api/scores/snapshot/{fixtureId}`
- Odds snapshot: `GET /api/odds/snapshot/{fixtureId}`
- Auth headers for data endpoints: `Authorization: Bearer <guest JWT>` and `X-Api-Token: <API token>`

The public Source Board includes a TxLINE World Cup Schedule snapshot checked on 2026-06-28. The snapshot observed fixtures for 2026-06-28 UTC:

- Fixture `17588325`: Jordan vs Argentina, 02:00 UTC.
- Fixture `17588326`: Algeria vs Austria, 05:00 UTC.

These are shown as `Seed / Token Required`, not `Live`, until authenticated score/event/odds payloads are loaded.

Secrets must only be placed in a local `.env.local` file:

```bash
VITE_TXLINE_API_BASE=https://txline-dev.txodds.com
VITE_TXLINE_PROXY_BASE=
VITE_TXLINE_API_TOKEN=your_txline_x_api_token_here
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=17588325
VITE_TXLINE_FINAL_SCORE_SEQ=
VITE_TXLINE_START_EPOCH_DAY=
VITE_TXLINE_COMPETITION_ID=
VITE_TXLINE_AS_OF_MS=
VITE_AUTHORIZED_VIDEO_EMBED_URL=
```

Do not commit `.env`, `.env.local`, real tokens, wallet keys, seed phrases, or verification codes.

After local credentials are configured, run:

```bash
npm run txline:probe
```

The probe verifies guest JWT, fixture snapshot, score snapshot, and odds snapshot access without printing token values. If no token or proxy is configured, it exits safely with a skip message.

`npm run txline:probe` now supports both API landing modes:

- Local token mode: set `VITE_TXLINE_API_TOKEN` in `.env.local`.
- Public proxy mode: set `VITE_TXLINE_PROXY_BASE` in `.env.local`; the probe calls the proxy health check and the same fixture, score, and odds endpoints through the proxy.

## Public Live proxy mode

Use this mode for any deployed build that needs real TxLINE data:

```bash
VITE_TXLINE_PROXY_BASE=https://your-secure-proxy.example.com
```

The proxy should keep these server-side secrets:

```bash
TXLINE_API_TOKEN=real_txline_x_api_token
TXLINE_SESSION_JWT=optional_guest_jwt
TXLINE_BASE=https://txline-dev.txodds.com
ALLOWED_ORIGIN=https://yuzhenjiang134.github.io
```

The included `examples/txline-proxy-worker.mjs` exposes:

- `GET /__health`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/stat-validation`
- `GET /api/odds/snapshot/{fixtureId}`

`GET /__health` reports whether the proxy has a server-side token configured without returning the token. The browser never receives the `X-Api-Token`.

Proxy verification:

```bash
VITE_TXLINE_PROXY_BASE=https://your-secure-proxy.example.com
VITE_TXLINE_FINAL_SCORE_SEQ=finalised_score_seq_when_available
npm run txline:probe
```

## Implemented endpoint mapping

| Product need | Endpoint | Required fields | Internal target |
|---|---|---|---|
| Guest auth | `POST /auth/guest/start` | `token` | `Authorization: Bearer <guest JWT>` |
| Match calendar / Source Board | `GET /api/fixtures/snapshot` | `FixtureId`, `Participant1`, `Participant2`, `Participant1IsHome`, `StartTime`, `Competition` | `MatchData` and schedule snapshot reconciliation |
| Live score | `GET /api/scores/snapshot/{fixtureId}` | home score, away score, match clock, stoppage, status | `PulseFrame` score and clock |
| Match events | `GET /api/scores/snapshot/{fixtureId}` | `seq`, `ts`, `action`, `dataSoccer.Goal`, `YellowCard`, `RedCard`, player IDs, minute | `MatchEvent[]` |
| Odds or market movement | `GET /api/odds/snapshot/{fixtureId}` | `PriceNames`, `Prices`, `Pct`, `Ts`, `SuperOddsType` | `MarketSnapshot[]` |
| Final score proof | `GET /api/scores/stat-validation?fixtureId=<FixtureId>&seq=<Seq>&statKeys=1,2` | `game_finalised` score record, participant total goals proof payload | Trust & Accuracy note; optional `validateStatV2` proof path |
| Score updates | `GET /api/scores/stream` | fixture id, changed score/event fields, event timestamp | future SSE live update loop |
| Odds updates | `GET /api/odds/stream` | fixture id, changed odds fields, event timestamp | future SSE market mood updates |
| Team and player context | fixture and score payload metadata, or future context endpoint | team code, team name, colors, key players, roles | `Team` and `PlayerProfile` |
| Standings or qualification context | fixture metadata, schedule context, or future context endpoint | group, played, points, goal difference, status | `GroupStanding[]` |
| Highlight chapters | derived from score events and odds swings | event id, minute, type, label, shareable context | Judge Demo chapters and share cards |

## Authorized video note

TxLINE is used here as the match data layer for fixtures, scores, events, and odds. Match video rights are separate from TxLINE data access.

The optional Authorized Video Sync panel only accepts a rights-cleared `https://` embed URL through `VITE_AUTHORIZED_VIDEO_EMBED_URL`. It is intended for official broadcaster, FIFA, YouTube Live, or other authorized embeds. The project does not scrape, mirror, or embed unofficial match streams.

## Data consistency rules

- Use `Live` only when TxLINE data is successfully loaded from official endpoints.
- Use `Delay` when a sponsor feed is near-live but not guaranteed real time.
- Use `Replay` for fixed historical fixtures used in demos and judging.
- Use `Seed` for static context such as teams, players, referee, standings, and schedule labels.
- If no match is active today, show No Match Day / Seed state instead of filling the page with fake live data.
- Treat schedule rows as snapshots unless authenticated live score/event/odds payloads are loaded and freshly checked.
- If live API calls fail, keep Replay mode available and label the source clearly.
- For knockout final results, use the score record where `Action = "game_finalised"` rather than an arbitrary 90-minute or in-play snapshot.
- For final-score proof, request `statKeys=1,2` so participant 1 and participant 2 total goals are validated from the finalised record.

## Adapter contract

`src/lib/txlineAdapter.ts` is the only place that should know about raw TxLINE payloads. The adapter returns:

```ts
type MatchLoadResult = {
  match: MatchData;
  source: DataSourceState;
};
```

The UI stays payload-agnostic and displays only normalized fields. If a live call fails, the adapter returns a visible `error` source state and a replay fallback so the product does not become blank or pretend replay data is live.

## Remaining token-test questions

- Does the API expose a no-match-day response?
- How is data freshness represented?
- Are odds snapshots historical, current only, or both?
- Are event IDs stable across refreshes?
- What are the rate limits and CORS requirements?
- Does hackathon access require a Solana sign-up flow before API token issuance?
- Does the free World Cup tier allow browser-side CORS demos, or should the final product use a small server proxy?
- Should final public judging use devnet only, or will TxLINE provide mainnet Level 12 access for production Live mode?
- Are `Prices` always scaled by 1000 for decimal odds?

## Official docs checked

- World Cup Schedule: `https://txline.txodds.com/documentation/scores/schedule`
- Guest session auth: `https://txline.txodds.com/api-reference/authentication/start-a-new-guest-session`
- OpenAPI spec: `https://txline.txodds.com/docs/docs.yaml`
- Score snapshots: `https://txline.txodds.com/api-reference/scores/get-snapshots-for-each-action-in-the-latest-score-events-for-a-fixture`
- Score SSE updates: `https://txline.txodds.com/api-reference/scores/get-a-real-time-server-sent-events-stream-of-scores-updates`
- Odds snapshots: `https://txline.txodds.com/api-reference/odds/get-snapshots-of-the-latest-odds-for-a-fixture`
- Odds SSE updates: `https://txline.txodds.com/api-reference/odds/get-a-real-time-server-sent-events-stream-of-odds-updates`
