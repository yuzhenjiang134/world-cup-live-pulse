# World Cup Live Pulse

World Cup Live Pulse is a fan-first match dashboard for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

It shows live-score style match cards, key events, odds and market mood movement, AI-style one-line commentary, and a replay timeline that works even when there is no live match available.

## Safety boundary

This project is not a betting product. It does not place bets, recommend trades, provide prediction-market advice, handle wallets, request private keys, or store API tokens in the repository.

## Current submission build

- Replay data mode is implemented.
- Multiple replay scenarios are available for demo recording.
- Live mode is present as a TxLINE adapter placeholder.
- Today Board and No Match Day / Token Required states are visible.
- Today Board now includes official TxLINE schedule seed fixtures for 2026-06-28 UTC while keeping live score/event/odds data token-gated.
- Daily Brief, Data Audit, Live Readiness, and Judge Demo chapters are implemented.
- Trust & Accuracy Center explains schedule seed, live token gate, replay truth, Free Tier delay behavior, and endpoint coverage.
- Match Intelligence shows phase summary, event stack, and player impact.
- Language setting supports English, Chinese, Spanish, and Portuguese for a broader World Cup fan audience.
- Match score card, timeline, market mood, Match Center, team profiles, and AI commentary are visible in the local app.
- Data states are explicitly labeled as Live, Delay, Replay, or Seed.
- TxLINE API token is not required for the first local demo.

## Competition requirements tracked

- Final submission needs a working deployed app, a public GitHub repo, a demo video under 5 minutes, brief technical docs, TxLINE endpoint notes, and API feedback.
- The product must be functional, not a pitch deck, wireframe, or static mockup.
- Final live competition readiness requires TxLINE data as a live input once official token and endpoint access are available.
- The public build must stay honest when no match is active: Replay and Seed data are labeled clearly and never presented as Live.
- The product stays informational only and avoids betting, wagering, trading, prediction-market, wallet, custody, private-key, seed-phrase, verification-code, or token handling.

## Judge demo path

Use the built-in Judge Demo chapters for a clean review or video recording path:

1. Data integrity: shows No Match Day, Replay, and Seed labeling.
2. Goal swing: jumps to the Argentina vs France goal swing.
3. Late volatility: jumps to the late France comeback window.
4. Upset context: jumps to Japan vs Germany and shows group context plus player impact.

## Data truth model

- Official schedule seed: TxLINE World Cup Schedule lists Jordan vs Argentina and Algeria vs Austria on 2026-06-28 UTC; the app shows them as Seed / Token Required.
- Live: only shown after authenticated TxLINE scores, events, and odds are loaded.
- Delay: reserved for TxLINE Free Tier or delayed feeds, including the documented 60-second delay mode.
- Replay: deterministic historical scenarios for judging and video recording.
- Seed: official schedule or static context that is useful to fans but is not a live feed.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Validate locally

```bash
npm run check
npm run build
npm run fixtures
npm run preflight
npm run security
npm run validate
```

## Deploy

GitHub Pages deployment is configured in `.github/workflows/pages.yml`.

Expected public URL after the workflow succeeds:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/
```

The workflow builds with `DEPLOY_TARGET=github-pages`, which sets Vite's base path to `/world-cup-live-pulse/`.

## Environment

Copy `.env.example` to `.env.local` when a TxLINE token is available.

```bash
VITE_APP_MODE=replay
VITE_TXLINE_API_BASE=https://api.txline.example
VITE_TXLINE_API_KEY=your_txline_api_key_here
```

Do not commit `.env`, `.env.local`, API tokens, wallet keys, or seed phrases.

## Project structure

```text
src/
  App.tsx                 Main dashboard UI
  data/replayMatch.ts     Fixed replay match used for demos
  lib/pulse.ts            Match pulse and commentary logic
  lib/shareCard.ts        SVG share card generator
  lib/txlineAdapter.ts    Future TxLINE API mapping boundary
  types.ts                Shared data types
```

## Docs

- `TASKS.md`: current task list and blocked external inputs
- `docs/TECHNICAL_OVERVIEW.md`: architecture, data consistency, and safety boundary
- `docs/TXLINE_ENDPOINTS.md`: TxLINE endpoint mapping plan
- `docs/API_FEEDBACK.md`: API feedback for sponsor docs and live-data consistency
- `docs/SUBMISSION_DRAFT.md`: Superteam submission draft
- `docs/DEMO_SCRIPT.md`: under-5-minute demo video script
- `docs/SUBMISSION_CHECKLIST.md`: final submission checklist
- `docs/submission-draft.md`: Superteam submission draft
- `docs/demo-script.md`: 3 to 5 minute demo video script
- `docs/technical-writeup.md`: architecture and TxLINE integration plan
- `docs/pre-submit-check.md`: final local and safety checks
- `docs/user-action-list.md`: exact items the user must provide
- `docs/submission-pack.md`: final submission packet index
- `docs/api-mapping-template.md`: TxLINE endpoint mapping worksheet

## Next implementation steps

1. Replace the placeholder TxLINE adapter with the official endpoint mapping after the API token and docs are available.
2. Add real live empty-state handling from TxLINE's match calendar endpoint.
3. Record a short demo video using Replay mode.
4. Fill final TxLINE endpoint usage notes and API feedback.
5. Submit the public URL, GitHub repo, and demo video on Superteam Earn.
