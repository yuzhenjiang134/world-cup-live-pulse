# Technical Write-up

## Architecture

World Cup Live Pulse uses a replay-first frontend architecture with a real TxLINE adapter for local authenticated data testing.

```text
Replay JSON or TxLINE API
-> adapter
-> normalized MatchData
-> pulse frame builder
-> dashboard UI
-> share card export
```

## Current data flow

The current MVP uses `src/data/replayMatch.ts` as fixed match fixtures for public judging. Those fixtures pass through the same `loadMatchData()` boundary that live TxLINE data uses when local credentials are configured.

The UI never reads fixture fields directly. It works from normalized types in `src/types.ts`.

## TxLINE integration

`src/lib/txlineAdapter.ts` is the integration boundary.

The adapter maps external responses into:

- `MatchData`
- `MatchEvent`
- `MarketSnapshot`

Implemented live inputs:

- `POST /auth/guest/start` for guest JWT bootstrap
- `GET /api/fixtures/snapshot` for fixture list
- `GET /api/scores/snapshot/{fixtureId}` for score state, match clock, goals, cards, and substitutions where present
- `GET /api/odds/snapshot/{fixtureId}` for market movement snapshots

Authenticated data calls use `Authorization: Bearer <guest JWT>` and `X-Api-Token: <API token>`. The public GitHub Pages build does not include private tokens; real data testing belongs in local `.env.local`.

The current hackathon free-tier route is:

```text
funded devnet wallet -> service level 1 / 4 week subscribe txSig -> guest JWT -> /api/token/activate -> local X-Api-Token
```

For final result accuracy, knockout matches should use the TxLINE score record where `Action = "game_finalised"`, then request:

```text
GET /api/scores/stat-validation?fixtureId=<FixtureId>&seq=<Seq>&statKeys=1,2
```

`statKeys=1,2` represent participant 1 and participant 2 total goals. The returned payload can be passed to `validateStatV2` when on-chain proof is needed. In this Consumer and Fan Experiences product, that path is used as a trust feature, not as a betting or prediction-market flow.

## Replay fallback

Replay mode remains useful even after live API integration because judges may open the app when no live match is active. If live API calls fail, the app keeps a visible error state and replay fallback instead of becoming blank or presenting replay data as live.

## Safety and compliance boundary

The app is informational only.

It does not:

- Place bets
- Recommend trades
- Operate a prediction market
- Handle wallets
- Store private keys or seed phrases
- Take custody of funds

## Verification

Current local checks:

```bash
npm.cmd run check
npm.cmd run build
```
