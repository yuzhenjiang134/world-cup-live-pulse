# World Cup Live Pulse Task List

Updated: 2026-06-28

## Done locally

- [x] Create clean Vite + React + TypeScript project
- [x] Add replay-first match data model
- [x] Add fixed replay fixture
- [x] Add multiple replay scenarios
- [x] Add replay scenario selector
- [x] Build match score card
- [x] Build event timeline
- [x] Build AI-style one-line commentary
- [x] Build market mood and odds movement panel
- [x] Add Replay / Live mode switch
- [x] Add replay controls and speed controls
- [x] Add key moment jump controls
- [x] Pause automatically when jumping to a key moment
- [x] Add TxLINE adapter boundary
- [x] Add clear Live-mode token-needed state
- [x] Add share card SVG preview and export
- [x] Add README
- [x] Add `.env.example`
- [x] Add submission draft
- [x] Add demo video script
- [x] Add technical write-up
- [x] Add implementation checklist
- [x] Add Vercel deployment config
- [x] Add GitHub Actions build check
- [x] Add GitHub Pages deployment workflow
- [x] Add local preflight script
- [x] Add replay fixture validation script
- [x] Add all-in-one validate command
- [x] Add user action list
- [x] Add submission packet index
- [x] Add API mapping template
- [x] Verify TypeScript check
- [x] Verify production build
- [x] Verify browser smoke test
- [x] Verify mobile page has no page-level horizontal overflow

## Blocked until user provides external inputs

- [ ] TxLINE World Cup API token
- [ ] TxLINE endpoint documentation
- [ ] Example TxLINE response payloads with secrets removed
- [ ] GitHub public repository target
- [ ] GitHub Pages deployment check
- [ ] Superteam Earn account access
- [ ] Telegram contact for submission
- [ ] Demo video hosting target
- [ ] Clean Solana wallet for prize workflow only

## Next implementation after TxLINE docs arrive

- [ ] Map live match list endpoint into `MatchData`
- [ ] Map live score endpoint into the score card
- [ ] Map match events endpoint into `MatchEvent`
- [ ] Map odds or market snapshots into `MarketSnapshot`
- [ ] Add live API loading state
- [ ] Add live API empty state
- [ ] Add live API error fallback to Replay mode
- [ ] Document exact TxLINE endpoints used
- [ ] Add endpoint feedback to submission draft

## Submission checklist

- [ ] Deploy app on GitHub Pages
- [ ] Verify deployed app works on desktop
- [ ] Verify deployed app works on mobile
- [ ] Make GitHub repo public
- [ ] Confirm no `.env`, API token, private key, seed phrase, or verification code is committed
- [ ] Record 3 to 5 minute demo video
- [ ] Fill final GitHub Pages URL in `docs/submission-draft.md`
- [ ] Fill GitHub URL in `docs/submission-draft.md`
- [ ] Fill demo video URL in `docs/submission-draft.md`
- [ ] Submit through Superteam Earn before 2026-07-19 23:59 UTC
