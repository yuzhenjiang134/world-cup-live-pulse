# TxLINE Endpoints Usage Plan

## Current status

The public build runs with Replay and Seed data. TxLINE API token and official endpoint documentation are not committed and are not required for the first judgeable demo.

For final hackathon submission, TxLINE must be used as a live input. The table below is the required mapping plan until the official World Cup endpoint docs and token are configured locally. After that, each `TBD` must be replaced with the exact TxLINE endpoint path, required request parameters, freshness fields, and response fields used by the app.

Secrets must only be placed in a local `.env.local` file:

```bash
VITE_TXLINE_API_BASE=
VITE_TXLINE_API_KEY=
```

Do not commit `.env`, `.env.local`, real tokens, wallet keys, seed phrases, or verification codes.

## Required endpoint mapping

| Product need | Expected endpoint | Required fields | Internal target |
|---|---|---|---|
| Match calendar / Today Board | TBD | match id, teams, kickoff time, status, competition, venue | `TodayMatchCard[]` and `MatchData` |
| Live score | TBD | home score, away score, match clock, stoppage, status | `PulseFrame` score and clock |
| Match events | TBD | stable event id, minute, type, team, player, description | `MatchEvent[]` |
| Odds or market movement | TBD | timestamp or minute, home/draw/away values, freshness | `MarketSnapshot[]` |
| Team and player context | TBD | team code, team name, colors, key players, roles | `Team` and `PlayerProfile` |
| Standings or qualification context | TBD | group, played, points, goal difference, status | `GroupStanding[]` |
| Highlight chapters | TBD | event id, minute, type, label, shareable context | Judge Demo chapters and share cards |

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
