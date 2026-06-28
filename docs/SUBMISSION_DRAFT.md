# Superteam Submission Draft

## Project title

World Cup Live Pulse

## Track

Consumer and Fan Experiences

## One-line pitch

A fan-first World Cup dashboard that turns match events, score changes, market mood, and AI-style commentary into a clear live pulse for ordinary fans.

## Public links

- Deployed app: https://yuzhenjiang134.github.io/world-cup-live-pulse/
- GitHub repo: https://github.com/yuzhenjiang134/world-cup-live-pulse
- Demo video: TBD

## What it does

World Cup Live Pulse gives fans one place to understand why a match feels different now. It combines score, key events, market movement, match pulse, team context, and short commentary into a dashboard that can be watched live or replayed for highlights.

The current build includes:

- Replay mode with two World Cup scenarios.
- Live mode placeholder wired through a TxLINE adapter boundary.
- Today Board with No Match Day / Token Required handling.
- Daily Brief, Data Audit, and Live Readiness panels.
- Judge Demo chapters for data integrity, goal swing, late volatility, and upset context.
- Match Intelligence with phase summary, event stack, and player impact.
- Match Center with kickoff time, referee, qualification note, discipline events, team profiles, key players, and group table where relevant.
- English, Chinese, Spanish, and Portuguese language setting.
- Share card export.
- Safety boundary copy: no betting, no trading advice, no wallets, no custody.

## TxODDS / TxLINE usage

The app is designed around the TxLINE integration boundary in `src/lib/txlineAdapter.ts`. The public build currently uses Replay and Seed data because a real TxLINE token and endpoint documentation have not been configured.

Planned TxLINE endpoints:

- Match calendar
- Live score and clock
- Match events
- Odds or market movement snapshots
- Team, player, referee, and standings context

## Data consistency note

World Cup matches are not available every day. The app does not invent live games. If no live match is available or TxLINE credentials are missing, the UI clearly labels the state as Replay or Seed.

## Why it fits the track

- It is built for ordinary fans, not traders.
- It makes match context easier to understand in real time.
- It remains judgeable without waiting for a live fixture.
- It creates a clear path for fan communities, Telegram groups, and sports media embeds.
- It avoids wallet, custody, betting, and prediction-market risk.

## Demo flow

1. Open the deployed app.
2. Show the Today Board and data status labels.
3. Use the Judge Demo chapter buttons: Data integrity, Goal swing, Late volatility, and Upset context.
4. Show Match Intelligence: phase summary, event stack, and player impact.
5. Show Match Center: referee, kickoff, qualification, team profiles, discipline, and group table.
6. Switch language across English, Chinese, Spanish, and Portuguese.
7. Open Live mode and explain the TxLINE token-needed boundary.
8. Export the share card and close with the safety boundary.
