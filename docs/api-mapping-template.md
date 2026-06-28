# TxLINE API Mapping Template

Fill this file after the official endpoint documentation is available.

## Environment

```bash
VITE_TXLINE_API_BASE=
VITE_TXLINE_API_KEY=
```

Do not commit real values.

## Endpoint inventory

| Purpose | Method | Endpoint | Required fields | Internal target |
|---|---|---|---|---|
| Match list | GET | TBD | TBD | `MatchData[]` |
| Match score | GET | TBD | TBD | `homeScore`, `awayScore`, `status` |
| Match clock | GET | TBD | TBD | `minute`, `stoppage` |
| Events | GET | TBD | TBD | `MatchEvent[]` |
| Odds or market mood | GET | TBD | TBD | `MarketSnapshot[]` |

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
