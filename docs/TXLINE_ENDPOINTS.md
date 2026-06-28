# TxLINE Endpoints Usage Plan

## Current status

The public build runs with Replay and Seed data. TxLINE API token and official endpoint documentation are not committed and are not required for the first judgeable demo.

For final hackathon submission, TxLINE must be used as a live input. The table below now maps the public TxLINE API reference paths into the app contract. Exact request headers, token handling, and response samples still need to be verified after access is configured locally.

The public Today Board includes official TxLINE World Cup Schedule seed fixtures observed on 2026-06-28 UTC:

- Fixture `17588325`: Jordan vs Argentina, 02:00 UTC.
- Fixture `17588326`: Algeria vs Austria, 05:00 UTC.

These are shown as `Seed / Token Required`, not `Live`, until authenticated score/event/odds payloads are loaded.

Secrets must only be placed in a local `.env.local` file:

```bash
VITE_TXLINE_API_BASE=
VITE_TXLINE_API_KEY=
```

Do not commit `.env`, `.env.local`, real tokens, wallet keys, seed phrases, or verification codes.

## Required endpoint mapping

| Product need | Expected endpoint | Required fields | Internal target |
|---|---|---|---|
| Guest auth | `POST /api/session/guest` | guest session token or auth response metadata | local adapter auth bootstrap |
| Match calendar / Today Board | `GET /api/fixtures/snapshot` | fixture id, teams, kickoff time, status, competition, venue | `TodayMatchCard[]` and `MatchData` |
| Live score | `GET /api/scores/snapshot/{fixtureId}` | home score, away score, match clock, stoppage, status | `PulseFrame` score and clock |
| Match events | `GET /api/scores/snapshot/{fixtureId}` | stable event/action id, minute, type, team, player, description | `MatchEvent[]` |
| Odds or market movement | API Reference > Odds snapshot, exact path to confirm after access | timestamp or minute, home/draw/away values, freshness | `MarketSnapshot[]` |
| Score updates | `GET /api/scores/stream` | fixture id, changed score/event fields, event timestamp | live update loop |
| Odds updates | API Reference > Odds update stream, exact path to confirm after access | fixture id, changed odds fields, event timestamp | market mood updates |
| Team and player context | fixture and score payload metadata, or future context endpoint | team code, team name, colors, key players, roles | `Team` and `PlayerProfile` |
| Standings or qualification context | fixture metadata, schedule context, or future context endpoint | group, played, points, goal difference, status | `GroupStanding[]` |
| Highlight chapters | derived from score events and odds swings | event id, minute, type, label, shareable context | Judge Demo chapters and share cards |

## Data consistency rules

- Use `Live` only when TxLINE data is successfully loaded from official endpoints.
- Use `Delay` when a sponsor feed is near-live but not guaranteed real time.
- Use `Replay` for fixed historical fixtures used in demos and judging.
- Use `Seed` for static context such as teams, players, referee, standings, and schedule labels.
- If no match is active today, show No Match Day / Seed state instead of filling the page with fake live data.
- If live API calls fail, keep Replay mode available and label the source clearly.

## Adapter contract

`src/lib/txlineAdapter.ts` is the only place that should know about raw TxLINE payloads. The adapter should return:

```ts
type MatchLoadResult = {
  match: MatchData;
  source: DataSourceState;
};
```

The UI should stay payload-agnostic and display only normalized fields.

## Questions for TxLINE docs

- What is the official match calendar endpoint?
- Does the API expose a no-match-day response?
- How is data freshness represented?
- Are odds snapshots historical, current only, or both?
- Are event IDs stable across refreshes?
- What are the rate limits and CORS requirements?
- Which auth header or query parameter format is expected?
- Does hackathon access require a Solana sign-up flow before API token issuance?

## Official docs checked

- World Cup Schedule: `https://txline.txodds.com/documentation/scores/schedule`
- Guest session auth: `https://txline.txodds.com/api-reference/authentication/start-a-new-guest-session`
- Score snapshots: `https://txline.txodds.com/api-reference/scores/get-snapshots-for-each-action-in-the-latest-score-events-for-a-fixture`
- Score SSE updates: `https://txline.txodds.com/api-reference/scores/get-a-real-time-server-sent-events-stream-of-scores-updates`
