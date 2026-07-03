# API Access Plan

Updated: 2026-07-03

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

On 2026-07-03, TxLINEChat messages also indicated that devnet activation may be down or inconsistent, including reports of `/api/token/activate` returning 500 and the devnet pricing matrix PDA returning `AccountNotFound`. This is not proof that mainnet is broken. For final hackathon work, prefer mainnet Level 12 unless the sponsor explicitly recommends devnet.

Current working route:

```text
mainnet -> service level 12 -> subscribe txSig -> guest JWT -> /api/token/activate
```

Recommended wallet balance for the subscribe step:

```text
0.03 - 0.05 SOL
```

The free tier does not require TxL payment, but Solana still needs transaction fees and may need Token-2022 account rent.

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

We are following the official World Cup Free Tier docs:
- Mainnet program: 9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA
- API host: https://txline.txodds.com/api/
- Free service levels: 1 delayed and 12 real-time

Could you please confirm:
1. Is the correct hackathon path self-serve subscribe -> txSig -> guest JWT -> /api/token/activate?
2. TxLINEChat mentioned possible devnet activation / pricing matrix issues. Should hackathon teams use mainnet Level 12 for final demos?
3. If our free-tier subscribe transaction fails, what minimum SOL balance do you recommend for fees / Token-2022 account rent?
4. Are browser demos allowed to call TxLINE directly, or should public apps use a server-side proxy?
5. Which fixture IDs, league IDs, or competition filters should World Cup Hackathon teams use?
6. Are there rate limits, polling intervals, or SSE stream rules for the free tier?

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
