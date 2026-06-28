# TxLINE API Mapping Template

Use this file to collect real response samples after a local TxLINE token is configured.

## Environment

```bash
VITE_TXLINE_API_BASE=
VITE_TXLINE_API_TOKEN=
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=
```

Do not commit real values.

## Endpoint inventory

| Purpose | Method | Endpoint | Required fields | Internal target |
|---|---|---|---|---|
| Guest auth | POST | `/auth/guest/start` | `token` | request auth bootstrap |
| Match list | GET | `/api/fixtures/snapshot` | `FixtureId`, `Participant1`, `Participant2`, `StartTime`, `Participant1IsHome`, `Competition` | `MatchData` |
| Match score | GET | `/api/scores/snapshot/{fixtureId}` | `scoreSoccer.Participant1.Total.Goals`, `scoreSoccer.Participant2.Total.Goals` | `homeScore`, `awayScore`, `status` |
| Match clock | GET | `/api/scores/snapshot/{fixtureId}` | `dataSoccer.Minutes`, `ts`, `startTime` | `minute`, `stoppage` |
| Events | GET | `/api/scores/snapshot/{fixtureId}` | `seq`, `action`, `dataSoccer.Goal`, `YellowCard`, `RedCard`, player IDs | `MatchEvent[]` |
| Odds or market mood | GET | `/api/odds/snapshot/{fixtureId}` | `PriceNames`, `Prices`, `Pct`, `Ts` | `MarketSnapshot[]` |

## Internal model

Map live responses into:

- `Team`
- `MatchData`
- `MatchEvent`
- `MarketSnapshot`
- `MatchLoadResult`

## Fallback behavior

If live API requests fail:

1. Show a clear error state.
2. Keep Replay mode available.
3. Do not silently pretend replay data is live data.
4. Do not expose the API token in UI, logs, screenshots, or committed files.
