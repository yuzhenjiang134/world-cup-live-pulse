# World Cup Live Pulse

World Cup Live Pulse is a fan-first match dashboard for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

It shows live-score style match cards, key events, odds and market mood movement, AI-style one-line commentary, and a replay timeline that works even when there is no live match available.

## Safety boundary

This project is not a betting product. It does not place bets, recommend trades, provide prediction-market advice, handle wallets, request private keys, or store API tokens in the repository.

## Current submission build

- Replay data mode is implemented.
- Multiple replay scenarios are available for demo recording.
- Live mode is wired to the official TxLINE HTTP endpoints through `src/lib/txlineAdapter.ts`.
- Source Board and No Match Day / Token Required states are visible.
- Source Board includes a TxLINE schedule snapshot observed for 2026-06-28 UTC while keeping live score/event/odds data token-gated.
- Fan Mode opens as a clean match pulse surface: score, latest beat, AI read, event feed, market mood, timeline, and local fan score pick.
- Fan Mode includes a compact rolling match data ticker for score, clock, source state, next beat, market mood, and safety.
- Fan Mode now includes a market-benchmark-inspired match focus nav: Watch, Pick, Timeline, Mood, and Teams.
- Fan Mode adds a compact matchday hub so replay fixtures and official TxLINE schedule snapshot matches are visible without opening the full Source Board.
- The main fan command area keeps watch-now context, score-linked prediction controls, source truth, and team / fixture detail buttons above secondary analysis.
- Analyst Mode reveals fixture briefing, Source Board, Data Audit, Live Readiness, and Trust & Accuracy Center for data verification.
- Judge Mode reveals operation guide, fixture briefing, Judge Demo chapters, and submission readiness for review or video recording.
- TxLINE endpoint coverage is shown as status cards instead of a dense table, making mapped, token-gated, and planned feeds easier to scan.
- Operation Manual, Fixture Briefing, Country Team Atlas, and Authorized Video Sync are optional modules in Settings so the main view stays focused on match pulse.
- Trust & Accuracy Center explains schedule seed, live token gate, replay truth, Free Tier delay behavior, and endpoint coverage.
- Match Intelligence shows phase summary, event stack, and player impact.
- Language setting supports English, Chinese, Spanish, and Portuguese for a broader World Cup fan audience.
- Match score card, local fan score pick, downloadable fan pick card, timeline, market mood, Match Center, team profiles, and AI commentary are visible in the local app.
- `docs/UX_BENCHMARKS.md` records market examples and the UX choices adopted or rejected for submission safety.
- Data states are explicitly labeled as Live, Delay, Replay, or Seed.
- TxLINE API token is not required for the public replay demo. Real TxLINE data can be tested locally with `.env.local`.

## Competition requirements tracked

- Final submission needs a working deployed app, a public GitHub repo, a demo video under 5 minutes, brief technical docs, TxLINE endpoint notes, and API feedback.
- The product must be functional, not a pitch deck, wireframe, or static mockup.
- Final live competition readiness requires a local TxLINE `X-Api-Token` and, optionally, a guest session JWT.
- The public build must stay honest when no match is active: Replay and Seed data are labeled clearly and never presented as Live.
- The product stays informational only and avoids betting, wagering, trading, prediction-market, wallet, custody, private-key, seed-phrase, verification-code, or token handling.

## Judge demo path

Use the built-in Judge Demo chapters for a clean review or video recording path:

1. Data integrity: shows No Match Day, Replay, and Seed labeling.
2. Goal swing: jumps to the Argentina vs France goal swing.
3. Late volatility: jumps to the late France comeback window.
4. Upset context: jumps to Japan vs Germany and shows group context plus player impact.

## Data truth model

- Official schedule snapshot: TxLINE World Cup Schedule was checked on 2026-06-28 and observed Jordan vs Argentina and Algeria vs Austria for 2026-06-28 UTC; the app shows them as Seed / Token Required.
- Live: only shown after authenticated TxLINE scores, events, and odds are loaded.
- Delay: reserved for TxLINE Free Tier or delayed feeds, including the documented 60-second delay mode.
- Replay: deterministic historical scenarios for judging and video recording.
- Seed: official schedule or static context that is useful to fans but is not a live feed.

The checked timestamp shown in the app is part of the product. Before final submission, re-check Superteam, TxODDS, and TxLINE public pages and update any snapshot-only facts if they changed.

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

## TxLINE Local Data

Copy `.env.example` to `.env.local` when a TxLINE token is available.

```bash
VITE_APP_MODE=replay
VITE_TXLINE_API_BASE=https://txline.txodds.com
VITE_TXLINE_API_TOKEN=your_txline_x_api_token_here
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=17588325
VITE_TXLINE_START_EPOCH_DAY=
VITE_TXLINE_COMPETITION_ID=
VITE_TXLINE_AS_OF_MS=
VITE_AUTHORIZED_VIDEO_EMBED_URL=
```

The adapter can request a guest JWT from `POST /auth/guest/start` when `VITE_TXLINE_SESSION_JWT` is empty. Data endpoints still require `X-Api-Token`.

After `.env.local` is configured, run:

```bash
npm run txline:probe
```

Without a local token the probe safely skips. With a token it verifies guest JWT, fixture snapshot, score snapshot, and odds snapshot access without printing secrets.

Do not commit `.env`, `.env.local`, API tokens, wallet keys, seed phrases, or verification codes. Do not put real tokens into GitHub Pages build settings unless the sponsor explicitly allows public browser exposure.

`VITE_AUTHORIZED_VIDEO_EMBED_URL` is optional and must only contain a rights-cleared `https://` embed URL from an official broadcaster, FIFA, YouTube Live, or another authorized provider. The public build does not scrape or embed unofficial match video.

## Project structure

```text
src/
  App.tsx                 Main dashboard UI
  data/replayMatch.ts     Fixed replay match used for demos
  lib/pulse.ts            Match pulse and commentary logic
  lib/shareCard.ts        SVG share card generator
  lib/txlineAdapter.ts    TxLINE HTTP adapter and replay fallback boundary
  types.ts                Shared data types
```

## Docs

- `TASKS.md`: current task list and blocked external inputs
- `docs/TECHNICAL_OVERVIEW.md`: architecture, data consistency, and safety boundary
- `docs/TXLINE_ENDPOINTS.md`: TxLINE endpoint mapping plan
- `docs/API_FEEDBACK.md`: API feedback for sponsor docs and live-data consistency
- `docs/USER_MANUAL.md`: user-facing operation manual
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

1. Add a real TxLINE token locally and verify one fixture end to end.
2. Capture sanitized TxLINE response samples for final docs and API feedback.
3. Record a short demo video using Replay mode, Settings optional modules, Authorized Video Sync status, and the Live token boundary.
4. Fill final TxLINE API feedback after real token testing.
5. Submit the public URL, GitHub repo, and demo video on Superteam Earn.
