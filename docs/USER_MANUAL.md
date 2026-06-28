# World Cup Live Pulse User Manual

## Purpose

World Cup Live Pulse is a fan-facing dashboard. It helps ordinary fans understand a match through score, key events, market mood, commentary, source status, and replay chapters.

It is informational only. It does not place bets, give trading advice, connect wallets, or handle secrets.

## Quick Start

1. Open the public site.
2. Check the source banner first.
3. Read score, latest beat, AI commentary, event feed, market mood, and timeline together.
4. Use the local fan score pick to choose a conversation scoreline. This stays local and is not a bet.
5. Download the fan pick card if you want a shareable local SVG.
6. Open team cards or match details only when you want deeper context.
7. Use replay controls or key moments to move through the match.
8. Check the matchday hub for playable replay fixtures and official schedule seed matches.
9. Open Settings and switch to Analyst Mode for source verification, or Judge Mode for demo chapters.
10. Export the match pulse share card only after checking the data state.

## Data States

| State | Meaning |
|---|---|
| Live | Authenticated TxLINE score/event/odds data loaded successfully. |
| Delay | Live-like data that is delayed or not guaranteed second-by-second. |
| Replay | Fixed historical scenario for demo and judging. |
| Seed | Official schedule or static context, not a live feed. |

The app must never invent live games. If credentials are missing, the public build stays in Replay + Seed mode.

Always check the source banner before reading a match. It shows the data state, the checked timestamp, and whether the current view is a replay fixture, a schedule snapshot, or authenticated live data.

## Settings

- Language: English, Chinese, Spanish, and Portuguese labels.
- Viewing preset: Fan Mode keeps the main screen focused on the match, Analyst Mode reveals data-verification panels, and Judge Mode reveals the demo/review path.
- Operation manual: show or hide the matchday guide.
- Fixture briefing: show or hide fixture-specific data rules.
- Country team atlas: show or hide team profiles and watch notes.
- Authorized video sync: show or hide the rights-cleared video integration status.

The main page keeps secondary material collapsed by default. Presets apply sensible module visibility automatically, and the module switches let you override that layout when needed.

## Fan Score Pick

The score pick controls are local UI only. The score steppers and quick pick buttons help fans discuss a match outcome while watching the pulse, but they do not submit a wager, connect a wallet, store a prediction, or create a prediction market.

The pick is intentionally shown beside source status and market mood context so users can compare their read with the current match pulse without treating the percentages as financial advice.

The fan pick card download is generated entirely in the browser as an SVG. It is a local share artifact, not a submitted prediction and not a stored account record.

## Matchday Hub

The compact matchday hub separates playable Replay fixtures from official TxLINE schedule snapshot matches. Seed cards are useful for schedule awareness, but they stay labeled as token-required until authenticated score, event, and odds data are loaded.

## Authorized Video Sync

The app can display a video embed only when `VITE_AUTHORIZED_VIDEO_EMBED_URL` is configured with a rights-cleared `https://` source from an official broadcaster, FIFA, YouTube Live, or another authorized provider.

The public build does not include match video, scrape streams, or embed unofficial sources. Without an authorized URL, the panel shows a clear rights-required state.

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
VITE_AUTHORIZED_VIDEO_EMBED_URL=
```

Then run:

```bash
npm run txline:probe
```

The probe verifies guest JWT, fixture snapshot, score snapshot, and odds snapshot access without printing token values.

Do not commit `.env.local`, API tokens, private keys, seed phrases, verification codes, or wallet material.

## Demo Flow

1. Show Source Board and the source banner.
2. Open Trust & Accuracy Center.
3. Show the local fan score pick and the watch-now event feed.
4. Open Settings only when showing optional modules.
5. Use Judge Demo chapters.
6. Show Match Intelligence and Country Team Atlas.
7. Switch to Live mode and explain token-gated data.
8. Export the share card.
9. Close with the safety boundary.
