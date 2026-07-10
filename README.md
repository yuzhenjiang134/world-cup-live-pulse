# World Cup Live Pulse

World Cup Live Pulse is a fan-first match dashboard for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

It shows live-score style match cards, key events, odds and market mood movement, local AI prediction / evaluation / commentary, and a replay timeline that works even when there is no live match available.

## Safety boundary

This project is not a betting product. It does not place bets, recommend trades, provide prediction-market advice, handle wallets, request private keys, or store API tokens in the repository.

## Current submission build

- Replay data mode is implemented.
- Multiple replay scenarios are available for demo recording.
- Live mode is wired to the official TxLINE HTTP endpoints through `src/lib/txlineAdapter.ts`.
- TxLINE free-tier activation is now documented as the current hackathon path: funded devnet wallet, free-tier subscribe txSig, guest JWT, `/api/token/activate`, then local `X-Api-Token` probing.
- Current TxLINEChat evidence indicates hackathon service level 1 should be treated as a 60-second delayed feed for World Cup and International Friendlies unless TxLINE grants a higher live tier.
- If no TxLINE token or proxy is configured, Live mode now falls back to the free no-token ESPN FIFA World Cup scoreboard JSON, which was verified on 2026-07-10 with browser-safe CORS.
- The app opens in Live mode by default so the first screen attempts the real free public scoreboard source before users choose Replay.
- Source Board and No Match Day / Token Required states are visible.
- Source Board includes a TxLINE schedule snapshot observed for 2026-06-28 UTC while keeping live score/event/odds data token-gated.
- Fan Mode opens as a clean match pulse surface: score, source trust, latest beat, AI read, live signal summary, event feed, market mood, timeline, and local fan score pick.
- Fan Mode includes a compact rolling match data ticker for score, clock, source state, next beat, market mood, and safety.
- Fan Mode now includes a market-benchmark-inspired match focus nav: Watch, Pick, Timeline, Mood, and Teams.
- Fan Mode adds a compact matchday hub so replay fixtures and official TxLINE schedule snapshot matches are visible without opening the full Source Board.
- The main fan command area keeps watch-now context, a tune-in signal, local alert threshold controls, AI prediction, AI match evaluation, AI commentary, signal stats, score-linked prediction controls, implied-probability bars, source truth, and team / fixture detail buttons above secondary analysis.
- Analyst Mode reveals fixture briefing, Source Board, Data Audit, Live Readiness, Operator Kit, and Trust & Accuracy Center for data verification and buyer evaluation.
- Judge Mode reveals operation guide, fixture briefing, Judge Demo chapters, multilingual judging-criteria mapping, submission readiness, and a Path to 100 note for the external items that cannot be faked in code.
- TxLINE endpoint coverage is shown as status cards instead of a dense table, making mapped, token-gated, and planned feeds easier to scan.
- API Access Plan is visible in Analyst / Judge view so reviewers can see local token mode, secure proxy mode, token blockers, and replay fallback without reading source code.
- Operation Manual, Fixture Briefing, Country Team Atlas, and Authorized Video Sync are optional modules in Settings so the main view stays focused on match pulse.
- Trust & Accuracy Center explains schedule seed, live token gate, replay truth, Free Tier delay behavior, and endpoint coverage.
- Match Intelligence shows phase summary, event stack, and player impact.
- Language setting supports English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic for the teams and fan regions currently represented in the demo. Dynamic event titles, event descriptions, AI reads, source rules, judge criteria, and control labels use the same localization layer.
- Empty or unavailable secondary facts are not padded with fake copy. The UI hides them or leaves the area quiet until useful data exists.
- Match score card, local fan score pick, downloadable fan pick card, timeline, market mood, Match Center, team profiles, and AI commentary are visible in the local app.
- `docs/UX_BENCHMARKS.md` records market examples and the UX choices adopted or rejected for submission safety.
- Data states are explicitly labeled as Live, Delay, Replay, or Seed.
- TxLINE API token is not required for the public replay demo. Real TxLINE data can be tested locally with `.env.local`.
- GitHub Pages cannot safely store a private TxLINE token. Online Live mode should use `VITE_TXLINE_PROXY_BASE` pointing to a secure proxy such as `examples/txline-proxy-worker.mjs`.

## Competition requirements tracked

- Final submission needs a working deployed app, a public GitHub repo, a demo video under 5 minutes, brief technical docs, TxLINE endpoint notes, and API feedback.
- The product must be functional, not a pitch deck, wireframe, or static mockup.
- Final live competition readiness requires a local TxLINE `X-Api-Token` activated through the TxLINE free-tier flow and, optionally, a guest session JWT.
- The public build must stay honest when no match is active: Replay and Seed data are labeled clearly and never presented as Live.
- The production entry point now uses a focused three-column matchday shell: left navigation, center match workflow, and a right trust / replay rail. Authentication is hidden under Settings > Live data connection.
- The main screen includes a browser-only 1,000-point fan score challenge. Points have no cash value and never touch wallets, tokens, or transactions.
- The product stays informational only and avoids betting, wagering, trading, prediction-market, wallet, custody, private-key, seed-phrase, verification-code, or token handling.

## Judge demo path

Use the built-in Judge Demo chapters for a clean review or video recording path:

1. Data integrity: shows No Match Day, Replay, and Seed labeling.
2. Goal swing: jumps to the Argentina vs France goal swing.
3. Late volatility: jumps to the late France comeback window.
4. Upset context: jumps to Japan vs Germany and shows group context plus player impact.

## Data truth model

- Official schedule snapshot: TxLINE World Cup Schedule was checked on 2026-06-28 and observed Jordan vs Argentina and Algeria vs Austria for 2026-06-28 UTC; the app shows them as Seed / Token Required.
- Live: only shown after authenticated TxLINE scores, events, and odds are loaded, or after a confirmed public scoreboard event is loaded and labeled with its real source.
- Delay: reserved for TxLINE Free Tier or delayed feeds, including the observed service level 1 / 60-second delay mode.
- Public scoreboard: ESPN FIFA World Cup scoreboard is a free no-token backup for score, status, events, teams, venue, and public freshness when TxLINE token access is blocked.
- Replay: deterministic historical scenarios for judging and video recording.
- Seed: official schedule or static context that is useful to fans but is not a live feed.
- TxLINE token: cannot be safely or legally collected from public GitHub repositories. Use the official self-serve flow and TxLINEChat guidance; never paste private keys, JWTs, or API tokens into the public repo.

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

## Demo video

The reproducible local demo-video package is documented in `docs/DEMO_VIDEO_PACKAGE.md`.

After refreshing screenshots, run:

```bash
node scripts/record-demo-video.mjs
```

Then open the printed local recorder URL. The generated captioned WebM is written to:

```text
demo-assets/world-cup-live-pulse-demo.webm
```

The current public draft is served from:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/demo/
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
VITE_TXLINE_API_BASE=https://txline-dev.txodds.com
VITE_TXLINE_PROXY_BASE=
VITE_TXLINE_API_TOKEN=your_txline_x_api_token_here
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=17588325
VITE_TXLINE_FINAL_SCORE_SEQ=
VITE_TXLINE_START_EPOCH_DAY=
VITE_TXLINE_COMPETITION_ID=
VITE_TXLINE_AS_OF_MS=
VITE_AUTHORIZED_VIDEO_EMBED_URL=
```

The adapter can request a guest JWT from `POST /auth/guest/start` when `VITE_TXLINE_SESSION_JWT` is empty. Data endpoints still require `X-Api-Token`.

For the hackathon free tier, use devnet unless TxLINE explicitly tells you to use mainnet:

```text
devnet wallet with faucet SOL -> service level 1 subscribe txSig -> guest JWT -> /api/token/activate -> local X-Api-Token
```

Never publish JWTs or API tokens. If TxLINE support needs to inspect a failed activation, share only the public wallet address and subscription tx signature.

The browser helpers are the preferred project flow. The same devnet defaults are also confirmed by the official TypeScript examples and the Rust helper shared in TxLINEChat: service level `1`, duration `4` weeks, activation message `txSig:selectedLeagues:jwt` or `txSig::jwt` for the standard bundle.

For public Live mode, keep the real token on a server-side proxy and set:

```bash
VITE_TXLINE_PROXY_BASE=https://your-secure-proxy.example.com
```

During local development, the browser uses the built-in `/__txline` Vite dev proxy. It reads the ignored `.env.local` on the server side and forwards only the allowlisted TxLINE data paths, so the token and JWT are not compiled into the browser bundle.

The proxy must expose the same safe paths used by the app and probe: `/api/fixtures/snapshot`, `/api/scores/snapshot/{fixtureId}`, `/api/scores/stat-validation`, and `/api/odds/snapshot/{fixtureId}`.

After `.env.local` is configured, run:

```bash
npm run txline:probe
```

Without a local token the probe safely skips. With a token it verifies guest JWT, fixture snapshot, score snapshot, and odds snapshot access without printing secrets.

Do not commit `.env`, `.env.local`, API tokens, wallet keys, seed phrases, or verification codes. Do not put real tokens into GitHub Pages build settings unless the sponsor explicitly allows public browser exposure.

For official free-tier access, first create the on-chain free-tier subscription and get a `txSig`:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-subscribe/
```

Then use the safe browser-wallet activation helper instead of sharing a private key:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-activation/
```

The subscribe helper uses wallet `signTransaction`; the activation helper uses wallet `signMessage`. They are documented in `docs/TXLINE_SUBSCRIBE_HELPER.md` and `docs/TXLINE_SAFE_ACTIVATION.md`.

`VITE_AUTHORIZED_VIDEO_EMBED_URL` is optional and must only contain a rights-cleared `https://` URL from an official broadcaster, FIFA, YouTube Live, or another authorized provider. Without it, the app opens the official [FIFA+ World Cup archive](https://www.plus.fifa.com/en/showcase/fifa-world-cup-editions/9e331159-475a-4b7e-9ee7-27ff9587c6e2) as the legal replay/highlights path. Availability varies by territory and rights; the public build does not scrape or embed unofficial match video.

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
- `docs/TXLINE_SUBSCRIBE_HELPER.md`: safe browser-wallet free-tier subscribe workflow
- `docs/TXLINE_SAFE_ACTIVATION.md`: safe browser-wallet activation workflow
- `docs/API_ACCESS_PLAN.md`: local token and secure proxy plan for real TxLINE data
- `docs/PRODUCT_VALUE_REVIEW.md`: candid fan value and commercial-readiness review
- `docs/COMPETITOR_REVIEW.md`: public competitor scan and number-one plan
- `docs/OFFICIAL_SOURCE_RECHECK.md`: current official Superteam / TxLINE source check
- `docs/DEMO_VIDEO_PACKAGE.md`: reproducible local demo-video generation notes
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
