# Submission Draft

## Project title

World Cup Live Pulse

## One-line pitch

A fan-first World Cup dashboard that turns live scores, match events, odds movement, and AI commentary into a clear real-time pulse for ordinary fans.

## Track

Consumer and Fan Experiences

## What it does

World Cup Live Pulse gives fans a single replay/live dashboard for following a match without needing to understand trading screens or betting tools. The interface highlights the score, key events, market mood changes, and a short AI-style commentary line that explains why the match feels different now.

## TxODDS / TxLINE usage

The MVP currently runs in Replay mode with mock data so judges can evaluate the experience at any time. The `src/lib/txlineAdapter.ts` file is reserved for mapping TxLINE World Cup API responses into the app's internal match model once the API token and endpoint documentation are available.

Planned integration:

- Live match list
- Score updates
- Key match events
- Odds or market movement snapshots
- API error fallback to replay mode

## Why this fits the fan experience track

- Accessible for ordinary fans
- Useful when a live match is unavailable because Replay mode still demonstrates the experience
- Avoids betting, trading advice, wallet handling, or custody risk
- Creates a clear media and community embedding path for sports channels, Telegram communities, and fan sites

## Demo script outline

1. Open the deployed app in Replay mode.
2. Show the score card and mode switch.
3. Press Play and let the match timeline advance.
4. Pause on a goal event and show AI commentary plus market mood shift.
5. Switch to Live mode and explain that it is the TxLINE adapter boundary.
6. Close with safety boundary: no betting, no wallet handling, no trading advice.

## Links to fill before submission

- Deployed app: https://yuzhenjiang134.github.io/world-cup-live-pulse/
- GitHub repo: https://github.com/yuzhenjiang134/world-cup-live-pulse
- Demo video:
- Technical write-up: docs/technical-writeup.md
- TxLINE endpoints used:

## User-owned items

- Superteam Earn account
- GitHub account
- Telegram contact
- Clean Solana wallet for prize workflow
- TxLINE API token
- Final submission and prize compliance
