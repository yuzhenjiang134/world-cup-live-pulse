# World Cup Live Pulse User Manual

## Purpose

World Cup Live Pulse is a fan-facing dashboard. It helps ordinary fans understand a match through score, key events, market mood, commentary, source status, and replay chapters.

It is informational only. It does not place bets, give trading advice, connect wallets, or handle secrets.

## Quick Start

1. Open the public site.
2. Check the source banner first.
3. Use Today Board to see official schedule seed fixtures.
4. Use Judge Demo chapters when no live fixture is available.
5. Read score, latest beat, AI commentary, pressure, market mood, and timeline together.
6. Export the share card only after checking the data state.

## Data States

| State | Meaning |
|---|---|
| Live | Authenticated TxLINE score/event/odds data loaded successfully. |
| Delay | Live-like data that is delayed or not guaranteed second-by-second. |
| Replay | Fixed historical scenario for demo and judging. |
| Seed | Official schedule or static context, not a live feed. |

The app must never invent live games. If credentials are missing, the public build stays in Replay + Seed mode.

## Settings

- Language: English, Chinese, Spanish, and Portuguese labels.
- Viewing preset: Fan Mode, Analyst Mode, or Judge Mode.
- Operation manual: show or hide the matchday guide.
- Fixture briefing: show or hide fixture-specific data rules.
- Country team atlas: show or hide team profiles and watch notes.

## Country Team Atlas

The atlas contains seeded team profiles for teams represented in the replay fixtures, TxLINE schedule seed, and host/reference teams. These profiles are fan context, not official final rosters.

When a valid TxLINE fixture is loaded, live fixture data should override seed context where available.

## Local TxLINE Verification

Only put credentials in `.env.local`:

```bash
VITE_TXLINE_API_BASE=https://txline.txodds.com
VITE_TXLINE_API_TOKEN=your_txline_x_api_token_here
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=17588325
```

Then run:

```bash
npm run txline:probe
```

The probe verifies guest JWT, fixture snapshot, score snapshot, and odds snapshot access without printing token values.

Do not commit `.env.local`, API tokens, private keys, seed phrases, verification codes, or wallet material.

## Demo Flow

1. Show Today Board and the source banner.
2. Open Trust & Accuracy Center.
3. Open Operation Manual and Fixture Briefing.
4. Use Judge Demo chapters.
5. Show Match Intelligence and Country Team Atlas.
6. Switch to Live mode and explain token-gated data.
7. Export the share card.
8. Close with the safety boundary.
