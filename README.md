# World Cup Live Pulse

World Cup Live Pulse is a fan-first match dashboard for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

It shows live-score style match cards, key events, odds and market mood movement, local AI prediction / evaluation / commentary, and a replay timeline that works even when there is no live match available.

## Safety boundary

This project is not a betting product. It does not place bets, recommend trades, provide prediction-market advice, handle wallets, request private keys, or store API tokens in the repository.

## Current submission build

- Match Center is the first screen: current score state, source freshness, fan pulse, 1,000-point score challenge, events, AI-style commentary, market context, and schedule.
- The challenge charges once, settles once from a verified final score, persists per fixture, tracks fan level/XP/streak/accuracy, exports a share card, and never touches cash or a wallet.
- Live mode uses the official TxLINE fixture, score, odds, and final-score validation endpoints through `src/lib/txlineAdapter.ts`.
- TxLINE fixture scope is locked to World Cup `CompetitionId 72` in both request and response validation; Friendlies `CompetitionId 430` cannot enter the World Cup UI.
- Eight credential-free 2026 TxLINE historical sequences keep the complete workflow judgeable when no current match is active. Two deterministic 2022 editorial stories remain secondary legacy examples.
- Schedule cards show stage, localized kickoff, source status, score, and verified event/goal/extra-time summaries. The source-first Teams view shows current fixture count and opponents before an optional collapsed historical atlas.
- Event-driven AI commentary turns verified goals, cards, score reviews, half-time, full-time, and momentum changes into a concise multilingual match brief. Browser speech playback makes the same grounded brief accessible without introducing an unverified external narrative.
- A clearly labeled season demonstration shows how eight verified 2026 replay results would settle score picks over time. It is separate from the user's real local challenge history and never changes the user's points.
- Eight complete UI languages are validated: English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic.
- Official FIFA+ archive/highlight links are the legal watch path. No unofficial stream is scraped or embedded.
- Automated gates cover TypeScript, fixture truth, i18n parity, product/data audit, World Cup scope, challenge rules, security, build, and real-browser mobile behavior.

## Competition requirements tracked

- Final submission needs a working deployed app, a public GitHub repo, a demo video under 5 minutes, brief technical docs, TxLINE endpoint notes, and API feedback.
- The product must be functional, not a pitch deck, wireframe, or static mockup.
- Final live competition readiness requires a local TxLINE `X-Api-Token` activated through the TxLINE free-tier flow and, optionally, a guest session JWT.
- The public build must stay honest when no match is active: Replay and Seed data are labeled clearly and never presented as Live.
- The production entry point now uses a focused three-column matchday shell: left navigation, center match workflow, and a right trust / replay rail. Authentication is hidden under Settings > Live data connection.
- The main screen includes a browser-only 1,000-point fan score challenge. Points have no cash value and never touch wallets, tokens, or transactions.
- The product stays informational only and avoids betting, wagering, trading, prediction-market, wallet, custody, private-key, seed-phrase, verification-code, or token handling.

## Judge demo path (recording paused until the product quality gate passes)

Use the same visible fan workflow that a normal user sees:

1. Open Match Center and show source, freshness, current fixture, and the score challenge.
2. Lock one score pick, play the historical Argentina-France replay, and settle exactly once.
3. Jump through goals, cards, extra time, pulse changes, and spoken AI-style commentary.
4. Open current source teams, then Settings for language and hidden TxLINE diagnostics.

## Data truth model

- TxLINE scope: the latest two consecutive authenticated checks on 2026-07-12 returned 3 World Cup fixtures under `CompetitionId 72`; fixture `18222446` returned 42 score records and 0 official-odds records both times. The UI therefore hides numerical odds instead of carrying forward an older snapshot. The adapter rejected Friendlies `CompetitionId 430`.
- Live: only shown after authenticated TxLINE scores, events, and odds are loaded, or after a confirmed public scoreboard event is loaded and labeled with its real source.
- Delay: used for polling delivery or any feed not confirmed as a true stream. Official docs distinguish mainnet Level 1 (60-second delay), mainnet Level 12 (real-time), and the current devnet Level 1 matrix row (`samplingIntervalSec = 0`).
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
npm run audit
npm run preflight
npm run security
npm run validate
```

## Demo video

The reproducible local demo-video package is documented in `docs/DEMO_VIDEO_PACKAGE.md`. Final generation is intentionally paused until the current product and submission quality gates are complete.

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
VITE_TXLINE_FIXTURE_ID=
VITE_TXLINE_FINAL_SCORE_SEQ=
VITE_TXLINE_START_EPOCH_DAY=
VITE_TXLINE_COMPETITION_ID=72
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

## Final external gates

1. Publish a server-side TxLINE proxy if authenticated Live data must run on the public static site; never expose the private token in GitHub Pages.
2. Re-check the live Superteam listing and TxLINE feed immediately before recording.
3. Record the final under-five-minute demo only after all local and online quality gates pass.
4. Submit the public URL, repository, demo URL, endpoint list, and API feedback on Superteam Earn.
