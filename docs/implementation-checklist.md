# Implementation Checklist

Updated: 2026-06-28

## Prepared

- Vite + React + TypeScript project scaffold
- Replay-first match data model
- Replay match fixture
- Score card
- Match event timeline
- AI-style one-line commentary generator
- Odds and market mood panel
- Replay controls
- Live mode with real TxLINE HTTP adapter
- TxLINE adapter boundary for fixtures, scores, and odds
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

1. Verify a real TxLINE token against one fixture locally.
2. Capture sanitized response samples for final endpoint notes.
3. Confirm browser CORS behavior for local and public demos.
4. Add live empty-state copy from the real no-match-day response if provided.
5. Record a demo video under five minutes.

## User inputs needed

- TxLINE World Cup API token
- TxLINE / Solana hackathon access confirmation
- Sanitized example TxLINE response payloads
- GitHub repo target
- Superteam Earn account access for final submission
- Telegram contact used by the hackathon
- Clean Solana wallet for prize workflow only
- Final deployed URL and demo video URL when ready

## Safety reminders

- Do not commit `.env` or `.env.local`.
- Do not paste wallet private keys, seed phrases, verification codes, or API tokens into public files.
- Keep the app informational: no betting, no trading advice, no prediction-market flow, no wallet handling.
