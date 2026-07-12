# User Manual

Updated: 2026-07-11

## Start here

Open World Cup Live Pulse. Match Center is the first screen and attempts the current source before falling back honestly.

The top of Match Center shows:

- selected fixture and source status
- teams, score, clock, and latest match signal
- checked time
- fan pulse
- the score challenge

## Score challenge

1. Start with 1,000 local test points.
2. Choose a home and away score before the challenge closes.
3. Lock the score for 50 points.
4. After a verified final score is available, settle once.
5. Review points, streak, best streak, and accuracy.
6. Download the prediction card when useful.

Exact scores award 250 points; a correct win/draw/loss result awards 100; a miss awards 0. Points remain in this browser and have no cash value. The challenge never connects a wallet or places a bet.

## Match Center

Use the focus tabs to move between the match overview, score challenge, timeline, market context, and teams. Available source events can include goals, yellow/red cards, substitutions, halftime, fulltime, added time, extra time, and score changes.

AI-style commentary is based on the same normalized match frame. Use the Listen button to read it with the browser speech engine. It is an explanation aid, not a verified source quote or betting recommendation.

## Replay

Replay contains fixed historical stories for evaluation when no current World Cup match is active. Replay uses the same score challenge, event timeline, pulse, and commentary components as the current Match Center.

Historical replay is always labeled Replay and is never presented as 2026 live data.

## Current source teams

The Teams view first shows participants from the selected match and current TxLINE schedule. Open the reference atlas only when deeper seeded context is needed. Source teams are not replaced by static profiles.

## Settings

Settings contains:

- language selection
- source refresh
- local test-point reset
- TxLINE connection status and activation helper
- advanced data-boundary notes

The supported UI languages are English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic. Team and player proper names remain source names.

## Source labels

| Label | Meaning |
|---|---|
| Live | Current authenticated source data. |
| Delay | Delayed/free-tier or named public scoreboard data. |
| Seed | Schedule/reference context without verified current score events. |
| Replay | Fixed historical judgeable data. |

Never interpret Seed or Replay as a current live match. The checked timestamp shows when the source was last evaluated.

## Watch and replay links

The product opens official FIFA+ archive/highlight pages. Availability depends on rights and territory. The in-app event timeline is always the deterministic replay path. No unofficial stream is embedded.

## Local TxLINE verification

Keep credentials only in ignored `.env.local`, then run:

```text
npm run txline:probe
```

The default World Cup configuration is:

```text
VITE_TXLINE_API_BASE=https://txline-dev.txodds.com
VITE_TXLINE_FIXTURE_ID=
VITE_TXLINE_COMPETITION_ID=72
```

Never paste a private key, seed phrase, JWT, or API token into the public app or repository.

## Judge review path

1. Open Match Center and check source/freshness.
2. Enter and lock a score prediction.
3. Open Argentina vs France Replay and jump through goals, cards, and extra time.
4. Settle the prediction once and show reload persistence.
5. Listen to AI-style commentary and download the share card.
6. Open current source teams.
7. Switch one language in Settings and show the hidden TxLINE status.
8. Close on the safety and official video-rights boundary.
