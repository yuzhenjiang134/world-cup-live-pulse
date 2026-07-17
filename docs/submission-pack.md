# Submission Pack

Use this as the final project packet index.

## Public-facing materials

- App: https://yuzhenjiang134.github.io/world-cup-live-pulse/
- GitHub: https://github.com/yuzhenjiang134/world-cup-live-pulse
- Demo video: https://youtu.be/tjbY4NHeV1E
- Project title: World Cup Live Pulse
- Track: Consumer and Fan Experiences

## Core files

- `README.md`
- `TASKS.md`
- `docs/SUPERTEAM_FINAL_SUBMISSION.md`
- `docs/submission-draft.md`
- `docs/demo-script.md`
- `docs/technical-writeup.md`
- `docs/pre-submit-check.md`
- `docs/user-action-list.md`
- `docs/USER_MANUAL.md`
- `docs/PUBLIC_RESEARCH_SUMMARY.md`

## Validation commands

```bash
npm run validate
```

This runs:

- TypeScript check
- Replay fixture validation
- Preflight file and safety checks
- Production build

## Product story

World Cup Live Pulse is a fan-first match dashboard that makes live score changes, event momentum, odds movement, and AI-style commentary understandable for ordinary fans.

It is designed to work in Replay mode for judges even when no live match is available, and to use TxLINE data through a clean adapter when local credentials are configured.

The main page prioritizes the match pulse. Secondary material such as guides, fixture notes, country/team context, and authorized video status is opened through Settings so the product feels like a working fan dashboard first.

## Safety boundary

The project is informational only.

It does not:

- Place bets
- Recommend trades
- Run a prediction market
- Connect wallets
- Store private keys
- Custody user funds

## Final blanks

```text
Deployed URL: https://yuzhenjiang134.github.io/world-cup-live-pulse/
GitHub URL: https://github.com/yuzhenjiang134/world-cup-live-pulse
Demo video URL: https://youtu.be/tjbY4NHeV1E
TxLINE endpoints used:
POST /auth/guest/start; GET /api/fixtures/snapshot; GET /api/scores/snapshot/{fixtureId}; GET /api/odds/snapshot/{fixtureId}
TxLINE feedback: see docs/API_FEEDBACK.md; update again after real token testing
Submission date: 2026-07-17
```
