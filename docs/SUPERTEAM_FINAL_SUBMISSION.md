# Superteam Final Submission

Updated: 2026-07-17

This is the paste-ready submission packet for the Consumer and Fan Experiences track.

## Paste-ready form fields

The URL inputs already display `https://`. Paste the values below without another protocol prefix.

### 1. Your submission link

Use the working product as the primary submission link:

```text
yuzhenjiang134.github.io/world-cup-live-pulse/
```

### 2. Tweet link

Optional. Leave blank unless a public X post about this exact project is already available.

### 3. Project name

```text
World Cup Live Pulse
```

### 4. Brief project description

```text
World Cup Live Pulse is a fan-first World Cup companion powered by TxLINE. It combines a match-first score view, verified key events, 11v11 Pulse Play, a 1,000-point local score challenge, grounded AI match briefs, replay, fan rooms, teams, tournament progression, eight languages, and official viewing links. TxLINE fixtures, score events, odds snapshots, and final-state records enter through one normalized adapter with visible freshness and source-state rules. The public build never exposes a private token and remains fully judgeable through ten sanitized 2026 replay sequences when no World Cup match is live.
```

### 5. Live and publicly available MVP

```text
yuzhenjiang134.github.io/world-cup-live-pulse/
```

### 6. Live demo video

```text
youtu.be/tjbY4NHeV1E
```

### 7. Public repository

```text
github.com/yuzhenjiang134/world-cup-live-pulse
```

### 8. Technical documentation

```text
github.com/yuzhenjiang134/world-cup-live-pulse/blob/main/docs/TECHNICAL_SUBMISSION_2026-07-13.md
```

### 9. Personal profile or related tweet

Optional profile link:

```text
x.com/yuchanjiang
```

### 10. TxLINE API experience

```text
What worked well: TxLINE fixture, score, odds, and game_finalised records can drive a complete consumer match experience through one normalized adapter. Guest JWT bootstrap and X-Api-Token keep session authentication separate from subscription access, while the documented stat-validation route gives final-score settlement a stronger trust path.

The main friction was consumer-facing source truth. Clients would benefit from machine-readable freshness and effective-delay fields, stable event IDs, explicit no-live-match states, clearer CORS and secure-proxy guidance, typed scheduled/postponed/finalised examples, and a documented odds-availability model. Our authenticated probes showed score and odds collections can evolve independently, so World Cup Live Pulse timestamps and replaces each collection independently and never reuses stale odds when a current response is empty. We also apply CompetitionId 72 in both the request and response filter, hide numeric-only player identities, and settle challenges only from game_finalised data.
```

### 11. Anything else

```text
Full TxLINE feedback: https://github.com/yuzhenjiang134/world-cup-live-pulse/blob/main/docs/API_FEEDBACK.md

Safety: this is a fan-engagement product. Its score challenge uses local, non-transferable points with no cash value. It does not place bets, recommend trades, connect a wallet, custody funds, request private keys, or expose the TxLINE token in the public frontend.
```

### 12. Final checkbox

Confirm only after checking that the video opens in a signed-out or InPrivate browser window.

## Public project links

```text
App: https://yuzhenjiang134.github.io/world-cup-live-pulse/
GitHub: https://github.com/yuzhenjiang134/world-cup-live-pulse
Demo: https://youtu.be/tjbY4NHeV1E
Track: Consumer and Fan Experiences
```

## YouTube metadata

### Title

```text
World Cup Live Pulse | TxLINE World Cup Hackathon Demo
```

### Description

```text
World Cup Live Pulse is a fan-first World Cup matchday companion built for the Superteam Earn x TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

Live product: https://yuzhenjiang134.github.io/world-cup-live-pulse/
Source code: https://github.com/yuzhenjiang134/world-cup-live-pulse

This 4:51 English demo shows the fan problem, complete product journey, local score challenge, event-driven Pulse Play, grounded AI match briefs, replay, fan rooms, eight languages, mobile UX, and how TxLINE powers fixtures, scores, events, official odds, and final-score settlement.

Safety: local points only. No betting, trading advice, wallet custody, private keys, or public API credentials.
```

## One-line pitch

```text
A fan-first World Cup companion that turns verified match events, score changes, official market context, replay, and grounded AI match briefs into one clear live pulse for ordinary fans.
```

## Extended project description

```text
World Cup Live Pulse helps ordinary fans understand what is happening, what changed, and whether a match is worth watching now. It combines a match-first score view, verified key events, 11v11 Pulse Play, a 1,000-point local score challenge, grounded AI match briefs, replay, fan rooms, teams, tournament progression, eight languages, and official viewing links. TxLINE fixtures, score events, odds snapshots, and final-state records enter through one normalized adapter with visible freshness and source-state rules. The public build never exposes a private token and remains fully judgeable through ten sanitized 2026 replay sequences when no World Cup match is live.
```

## TxLINE endpoints used

```text
POST /auth/guest/start
GET /api/fixtures/snapshot?competitionId=72
GET /api/scores/snapshot/{fixtureId}
GET /api/scores/historical/{fixtureId}
GET /api/odds/snapshot/{fixtureId}
GET /api/scores/stat-validation?fixtureId=<id>&seq=<seq>&statKeys=1,2
```

## Technical summary

```text
The product is a Vite, React, and TypeScript application. src/lib/txlineAdapter.ts owns raw TxLINE payload knowledge and normalizes fixtures, score events, status, odds, and final-state records into one MatchData contract. World Cup CompetitionId 72 is enforced in both the request and response filters. The browser never receives a committed credential: local verification uses an ignored .env.local file and the Vite proxy; a public authenticated deployment uses a token-holding allowlist proxy. Live, Delay, Seed, and Replay states are kept distinct. Empty odds, unknown player identities, and unavailable facts are hidden instead of invented. The same normalized event contract drives Match Center, Pulse Play, AI briefs, challenge settlement, replay, alerts, and team context.
```

## API feedback

```text
What worked well: the fixture, score, odds, and game_finalised records can drive a complete consumer match experience through one normalized adapter. Guest JWT bootstrap and X-Api-Token keep session auth separate from subscription access, and the documented stat-validation route gives final-score settlement a stronger trust path.

Main friction: consumer clients need machine-readable freshness and effective-delay fields, stable event IDs, explicit no-live-match states, clearer browser CORS/proxy guidance, typed examples for scheduled/postponed/finalised states, and a documented odds-availability model. Authenticated probes also showed that score and odds collections evolve independently, so the app timestamps and replaces them independently and never reuses stale odds when a current response is empty.
```

## Product and safety statement

```text
This is a fan-engagement product, not a betting or prediction-market product. The score challenge uses local, non-transferable points with no cash value. The app does not place bets, recommend trades, connect a wallet, custody funds, request private keys, or expose the TxLINE API token in the public frontend.
```

## Final manual check

1. Open the Demo URL in an InPrivate window and confirm it plays without account access.
2. Use the live MVP as the primary submission link and the YouTube Demo in its dedicated required field.
3. Leave the Tweet field blank unless a real public X post exists.
4. Enter `World Cup Live Pulse` exactly.
5. Check the eligibility declaration only after reviewing the form.
6. Submit before 2026-07-19 23:59 UTC.
