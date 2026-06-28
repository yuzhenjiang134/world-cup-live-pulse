# Implementation Checklist

Updated: 2026-06-27

## Prepared

- Vite + React + TypeScript project scaffold
- Replay-first match data model
- Replay match fixture
- Score card
- Match event timeline
- AI-style one-line commentary generator
- Odds and market mood panel
- Replay controls
- Live mode placeholder
- TxLINE adapter boundary
- Live-mode token-needed state
- Key moment jump controls
- Replay speed controls
- Share card SVG export
- README
- `.env.example`
- Submission draft
- Demo script
- Technical write-up
- Pre-submit check
- CI workflow
- Vercel config
- Local build verification
- Local browser smoke test

## Next build tasks

1. Add TxLINE endpoint mapping after API token and docs are available.
2. Add API error, loading, empty, and offline states.
3. Add a share-card export for a dramatic event moment.
4. Improve replay pacing controls for demo recording.
5. Add a short technical write-up with endpoint names and data flow.
6. Deploy the app and verify the public URL.
7. Record a demo video under five minutes.

## User inputs needed

- TxLINE World Cup API token and endpoint documentation
- GitHub repo target
- Superteam Earn account access for final submission
- Telegram contact used by the hackathon
- Clean Solana wallet for prize workflow only
- Final deployed URL and demo video URL when ready

## Safety reminders

- Do not commit `.env` or `.env.local`.
- Do not paste wallet private keys, seed phrases, verification codes, or API tokens into public files.
- Keep the app informational: no betting, no trading advice, no prediction-market flow, no wallet handling.
