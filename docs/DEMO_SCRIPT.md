# Demo Video Script

Target length: 3:06. Maximum allowed: 5:00.

## 0:00-0:14 — Problem and product

World Cup Live Pulse is a fan-first second screen for the Consumer and Fan Experiences track. It turns verified match data into a score challenge, live pulse, and replayable match story that ordinary fans can understand at a glance.

## 0:14-0:38 — Match Center and score challenge

The first view answers three questions: what is happening, where did the data come from, and what can the fan do now? The score hero shows source state and checked time. Directly below it, every local session starts with 1,000 test points. A score pick costs 50 points and is settled only from a verified final score. It has no cash value and never connects a wallet.

## 0:38-1:04 — Judgeable replay

Because review may happen when no match is live, Replay preserves the complete product flow without mislabeling history as current data. The Argentina–France story exposes goals, cards, extra time, pulse changes, final-score settlement, and AI-style commentary. The same timeline works with authenticated TxLINE events during a current fixture.

## 1:04-1:24 — Teams and players

Team and player context remains one click away instead of crowding the match view. The atlas currently contains 12 source-aware profiles, while compact key-player context appears inside Match Center when the loaded source provides it.

## 1:24-1:46 — Settings and global usability

Language, local-point reset, refresh, and TxLINE diagnostics stay in Settings. The interface validates a shared set of labels across English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic. Credentials remain local and are never rendered in the fan interface or committed to GitHub Pages.

## 1:46-2:10 — TxLINE backend

TxLINE powers the live input. The adapter starts a guest session, loads the fixture snapshot, then requests score and odds snapshots for the selected fixture. Those responses are normalized into one MatchData model for the score hero, event timeline, AI-style explanation, and score challenge.

Implemented endpoints:

- `POST /auth/guest/start`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/odds/snapshot/{fixtureId}`

## 2:10-2:30 — Data truth

Data truth is visible product behavior. Live, Delay, Seed, and Replay are separate states. Unknown teams remain pending confirmation. Empty odds stay empty. Historical fixtures stay in Replay. The latest two consecutive 2026-07-12 probes returned three World Cup fixtures; fixture 18222446 returned 42 score records and zero official-odds records both times, so numerical odds are hidden rather than carried forward from an older snapshot.

Official match video rights are separate from TxLINE. The product links only to official FIFA+ archive and highlights pages, with territory and rights limitations disclosed.

## 2:30-2:50 — Commercial value

The score challenge creates a repeat-use loop for fan communities. The same source-aware second-screen shell can be licensed or embedded by sports media, Telegram communities, venues, and sponsors. A future shared leaderboard can add identity and social competition without turning the product into wagering.

## 2:50-3:06 — Close

World Cup Live Pulse is deployed, functional, documented, and repeatable for judges. It uses TxLINE as the live data boundary and remains a safe fan experience: no betting, no trade advice, no prediction market, no custody, and no private token in the public build.

## Recording checklist

- Use the latest deployed asset, not an older cached Pages build.
- Keep browser zoom at 100 percent and capture at 1280 × 720.
- Do not show `.env.local`, API tokens, JWTs, private keys, wallet screens, or browser developer tools.
- Show the Match Center score challenge before secondary details.
- Show one event-driven AI brief and play its spoken version.
- Open the labeled season demonstration only after showing the user's separate real challenge history.
- Show the Replay label and final score clearly.
- Show the exact TxLINE endpoints in a caption card.
- Keep the final video below five minutes.
