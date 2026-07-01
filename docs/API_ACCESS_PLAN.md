# API Access Plan

Updated: 2026-07-01

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
