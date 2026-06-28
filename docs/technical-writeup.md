# Technical Write-up

## Architecture

World Cup Live Pulse uses a replay-first frontend architecture.

```text
Replay JSON or TxLINE API
-> adapter
-> normalized MatchData
-> pulse frame builder
-> dashboard UI
-> share card export
```

## Current data flow

The current MVP uses `src/data/replayMatch.ts` as a fixed match fixture. This fixture is passed through the same `loadMatchData()` boundary that live TxLINE data will use later.

The UI never reads fixture fields directly. It works from normalized types in `src/types.ts`.

## TxLINE integration plan

`src/lib/txlineAdapter.ts` is the integration boundary.

When the TxLINE API token and endpoint documentation are ready, the adapter should map external responses into:

- `MatchData`
- `MatchEvent`
- `MarketSnapshot`

Planned live inputs:

- Match list
- Score state
- Match clock
- Goals and disciplinary events
- Odds or market movement snapshots

## Replay fallback

Replay mode remains useful even after live API integration because judges may open the app when no live match is active. If live API calls fail, the app can keep a visible fallback instead of becoming blank.

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
