# World Cup Live Pulse

World Cup Live Pulse is a fan-first match dashboard for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

It shows live-score style match cards, key events, odds and market mood movement, AI-style one-line commentary, and a replay timeline that works even when there is no live match available.

## Safety boundary

This project is not a betting product. It does not place bets, recommend trades, provide prediction-market advice, handle wallets, request private keys, or store API tokens in the repository.

## MVP status

- Replay data mode is implemented.
- Multiple replay scenarios are available for demo recording.
- Live mode is present as a TxLINE adapter placeholder.
- Match score card, timeline, market mood, and AI commentary are visible in the local app.
- TxLINE API token is not required for the first local demo.

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
npm run validate
```

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
- `docs/submission-draft.md`: Superteam submission draft
- `docs/demo-script.md`: 3 to 5 minute demo video script
- `docs/technical-writeup.md`: architecture and TxLINE integration plan
- `docs/pre-submit-check.md`: final local and safety checks
- `docs/user-action-list.md`: exact items the user must provide
- `docs/submission-pack.md`: final submission packet index
- `docs/api-mapping-template.md`: TxLINE endpoint mapping worksheet

## Next implementation steps

1. Replace the placeholder TxLINE adapter with the official endpoint mapping after the API token and docs are available.
2. Add loading, empty, offline, and API error states.
3. Add share-card export for a key replay moment.
4. Record a short demo video using Replay mode.
5. Deploy to Vercel or Render and submit the public URL plus GitHub repo.
