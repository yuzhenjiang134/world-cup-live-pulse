# API Access Plan

Updated: 2026-07-05

## Decision

GitHub Pages is a static host. It cannot safely store a private TxLINE `X-Api-Token`.

World Cup Live Pulse therefore supports two safe access modes:

1. Local verification mode: `.env.local` contains `VITE_TXLINE_API_TOKEN` and `npm run txline:probe` verifies fixtures, scores, and odds locally.
2. Public live mode: `VITE_TXLINE_PROXY_BASE` points the static app to a small HTTPS proxy. The proxy stores `TXLINE_API_TOKEN` server-side and forwards only allowed TxLINE endpoints.

The public GitHub Pages build stays in Replay / Seed mode until one of those access paths is configured. It must not expose tokens or label replay data as Live.

## Why A Proxy Is Needed

Public repositories and static builds expose frontend environment variables at build time. Any `VITE_` variable compiled into the GitHub Pages bundle is readable by visitors.

So a real online Live deployment needs a backend boundary:

```text
Browser on GitHub Pages
  -> VITE_TXLINE_PROXY_BASE
  -> secure proxy with TXLINE_API_TOKEN
  -> TxLINE official endpoints
```

The project includes `examples/txline-proxy-worker.mjs` as a minimal Fetch-compatible proxy template.

## Required Sponsor Answers

Ask TxODDS / TxLINE support for:

- The hackathon `X-Api-Token` issuance path or activation route.
- Whether the token is tied to Solana sign-up, wallet signature, service level, or subscription transaction.
- Whether browser-side CORS demos are allowed, or whether a server-side proxy is required.
- Allowed fixture IDs, endpoints, and competition filters for the World Cup hackathon.
- Rate limits and recommended polling interval.
- Whether Free Tier data is live or delayed for each fixture, including the documented 60-second delay mode.
- SSE stream requirements, resume behavior, and heartbeat handling.

## Sponsor Contact Status

Superteam Earn support replied on 2026-07-03 that Earn support does not directly issue TxODDS API credentials. They directed teams to the sponsor channel:

```text
https://t.me/TxLINEChat
```

They also advised checking the official hackathon resources for the latest API access steps. This means the active access path is:

1. Continue the official TxLINE self-serve flow: free-tier on-chain subscribe, then API token activation.
2. Contact `TxLINEChat` if the wallet subscribe step, token activation endpoint, or endpoint permission remains blocked.
3. Record any sponsor answer in this file and in `docs/API_FEEDBACK.md` without publishing private credentials.

On 2026-07-05, TxLINEChat clarified the current hackathon free-tier route:

- Do not share JWT publicly.
- Use a funded devnet wallet.
- Run the on-chain free-tier subscribe transaction.
- Call `/api/token/activate` with the signed activation payload.
- If it still fails, share only the wallet public key and subscribe transaction signature with TxLINEChat.
- A TxLINEChat follow-up said devnet activation was retested with a fresh wallet and `/api/token/activate` returned 200.

This supersedes the earlier 2026-07-03 devnet outage note for our working plan. Mainnet Level 12 remains a later production option only if the sponsor explicitly confirms it for the final public demo.

Current working route:

```text
devnet -> service level 1 -> 4 week subscribe txSig -> guest JWT -> /api/token/activate -> X-Api-Token
```

Recommended wallet balance for the subscribe step:

```text
devnet: funded wallet from faucet; keep at least 0.005 devnet SOL before signing
mainnet fallback only: 0.03 - 0.05 SOL
```

The free tier does not require TxL payment, but Solana still needs transaction fees and may need Token-2022 account rent.

## Final-score verification note

TxLINEChat also clarified the correct proof path for final scores in knockout matches:

1. Do not use an arbitrary 90-minute or in-play score record.
2. Fetch score updates or snapshots and select the record where `Action = "game_finalised"`.
3. Use that record's `FixtureId` and `Seq`.
4. Request `/api/scores/stat-validation?fixtureId=<FixtureId>&seq=<Seq>&statKeys=1,2`.
5. `statKeys=1,2` means participant 1 total goals and participant 2 total goals.
6. Use the returned proof payload with on-chain `validateStatV2` when cryptographic proof is needed.

For the Consumer and Fan Experiences track, this is a credibility feature for final result verification. It is not a betting, trading, or prediction-market workflow.

## Reference implementations

The browser helpers in this repo are the preferred route for this project because they do not require sharing wallet keys and they match a consumer-facing demo flow.

Additional references checked on 2026-07-05:

- Official TypeScript devnet examples: `https://github.com/txodds/tx-on-chain/tree/main/examples/devnet/scripts`
- Rust SDK helper shared in TxLINEChat: `https://github.com/Berektassuly/txline-rs/blob/main/crates/txline/examples/devnet_setup_user.rs`

The Rust SDK confirms the same core activation contract:

```text
TXLINE_SERVICE_LEVEL_ID default = 1
TXLINE_SUBSCRIPTION_WEEKS default = 4
activation preimage = ${txSig}:${selectedLeagues.join(",")}:${jwt}
empty selectedLeagues = ${txSig}::${jwt}
devnet host = https://txline-dev.txodds.com
```

Use the Rust helper only as an engineering fallback. Do not paste private keys into chat, screenshots, docs, or this repository.

## Telegram Sponsor Message Draft

Use this message in `TxLINEChat`. Do not include private keys, seed phrases, verification codes, or API tokens.

```text
Hi TxLINE / TxODDS team,

We are building World Cup Live Pulse for the Superteam Earn World Cup Hackathon, Consumer and Fan Experiences track.

Superteam Earn support told us that TxODDS API credentials are handled by the sponsor channel, so we are asking here.

Project:
World Cup Live Pulse - a fan-first live match dashboard with score, events, market mood, AI-style commentary, replay fallback, and clear data freshness labels.

Safety boundary:
No betting, no trading advice, no prediction market, no wallet custody, and no private keys or seed phrases.

We are following the current TxLINEChat free-tier route:
- Devnet program: 6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J
- API host: https://txline-dev.txodds.com/api/
- Free service level: 1
- Duration: 4 weeks

Could you please confirm:
1. Can you confirm the exact fixture or competition ids teams should use for World Cup Hackathon demos?
2. Are browser demos allowed to call TxLINE directly, or should public apps use a server-side proxy?
3. What polling interval and SSE reconnect rules should we use for the free tier?
4. For final result accuracy, should Consumer track apps also prefer `Action = "game_finalised"` plus `statKeys=1,2`?
5. Are mainnet Level 12 credentials available for final public demos, or should final judging rely on devnet plus replay fallback?

Project repo:
https://github.com/yuzhenjiang134/world-cup-live-pulse

Public demo:
https://yuzhenjiang134.github.io/world-cup-live-pulse/

Thanks!
```

## Implemented In This Repo

- `src/lib/txlineAdapter.ts`: supports direct local token mode and optional proxy mode.
- `.env.example`: documents `VITE_TXLINE_PROXY_BASE`.
- `scripts/txline-probe.mjs`: local token verification without printing secrets.
- `examples/txline-proxy-worker.mjs`: minimal proxy template for secure public Live mode.
- App UI: Analyst / Judge view shows API access status, proxy status, token gate, and fallback state.

## Current Public Build State

The deployed GitHub Pages app currently runs as Replay / Seed unless `VITE_TXLINE_PROXY_BASE` is set before build. This is intentional and safer than placing a private TxLINE token in the frontend bundle.

## Token Handling Rules

- Do not commit `.env`, `.env.local`, worker secrets, wallet private keys, seed phrases, or verification codes.
- Do not paste real tokens into chat, screenshots, README, or browser console output.
- Do not set `VITE_TXLINE_API_TOKEN` in a public GitHub Pages build.
- Use a proxy for public Live mode.
- Use `.env.local` only for local verification.
