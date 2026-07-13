# World Cup Live Pulse - Technical Submission

Updated: 2026-07-13

World Cup Live Pulse is a fan-first match companion built for the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track. It turns a verified match feed into a score challenge, event-driven animated match theatre, key-moment replay, grounded AI-style explanation, followed-match alerts, and team context.

## 1. Product principle

The product has one public truth rule: a visible match fact must come from the active source, a labeled verified replay, or a deterministic calculation over those records. Unknown player identities, lineups, injuries, xG, ratings, news, and odds are omitted instead of filled with placeholders.

The fan journey is intentionally short:

1. Read the score, status, freshness, and next important moment.
2. Spend local points on one score challenge entry before kickoff.
3. Follow the match through key events, Pulse Play, and three grounded AI brief modes.
4. Catch up through verified replay chapters, schedule, advancement, teams, and source-backed player records.

## 2. Architecture

```text
TxLINE authenticated API               Public FIFA World Cup scoreboard
          |                                         |
          +-------------- source adapters ----------+
                                   |
                    World Cup competition guard
                                   |
                  normalized MatchLoadResult contract
                                   |
             MatchData + MatchEvent + MarketSnapshot
                                   |
            pulse frame / challenge / commentary layer
                                   |
  Match Center | Pulse Play | Score Challenge | Replay | Teams | Alerts
```

The production entry is `src/MatchdayApp.tsx`. Raw TxLINE field knowledge is isolated in `src/lib/txlineAdapter.ts` and `src/lib/txlineScoreNormalizer.ts`. Components consume the normalized types in `src/types.ts`; they do not parse raw API payloads.

## 3. TxLINE endpoints used

| Method and path | Product use | Authentication | Failure behavior |
| --- | --- | --- | --- |
| `POST /auth/guest/start` | Create a short-lived guest session JWT when one is not supplied locally | Guest bootstrap | Fall back to the configured session or show an honest unavailable state |
| `GET /api/fixtures/snapshot?competitionId=72` | Find current World Cup fixtures and build schedule context | Guest JWT plus `X-Api-Token` | Retry through the source adapter, then use the named public scoreboard or replay |
| `GET /api/scores/snapshot/{fixtureId}` | Current score, clock, status, goals, cards, substitutions, penalty metadata, and final action | Guest JWT plus `X-Api-Token` | Keep the previous verified render only during the in-flight request; never invent a new event |
| `GET /api/scores/historical/{fixtureId}` | Build deterministic, judgeable historical sequences | Guest JWT plus `X-Api-Token` | Omit the fixture from the verified replay archive if a final record cannot be proved |
| `GET /api/odds/snapshot/{fixtureId}` | Show official market context when records are present | Guest JWT plus `X-Api-Token` | Hide the numerical odds surface when the collection is empty; never carry an older snapshot forward as current |
| `GET /api/scores/stat-validation?fixtureId=<id>&seq=<seq>&statKeys=1,2` | Optional participant-total-goal proof for a decisive final result | Guest JWT plus `X-Api-Token` | Do not claim proof if the sequence is not configured or the endpoint fails |

The product does not currently claim to consume TxLINE stream endpoints. Live delivery is implemented as polling so behavior and freshness are testable on the hackathon free tier.

## 4. Authentication and secret boundary

Local authenticated development reads ignored `.env.local` values. The Vite development proxy forwards `/__txline` requests so the browser does not need to construct cross-origin authorization manually.

A public GitHub Pages bundle cannot safely contain `X-Api-Token` or a reusable JWT. Public authenticated live mode therefore requires a separate HTTPS proxy configured through `VITE_TXLINE_PROXY_BASE`. The repository, production bundle, screenshots, logs, and Demo must never contain an API token, JWT, wallet secret, seed phrase, private key, local voice profile ID, or local voice sample path.

## 5. Competition scope and fixture selection

World Cup `CompetitionId 72` is enforced twice:

1. The fixture request includes `competitionId=72`.
2. `src/lib/worldCupScope.ts` filters the response before fixture selection, schedule rendering, or team extraction.

Observed Friendlies records use a different competition ID and are rejected. The default build does not pin a fixture ID; it follows the current accepted World Cup fixture. A fixture override exists only for local diagnosis and repeatable tests.

## 6. Refresh and consistency lifecycle

- Match Center polls every 15 seconds in Live mode.
- Returning focus to the window or making the page visible triggers an immediate refresh.
- Pending score challenges are rechecked for a verified final every 60 seconds.
- An in-flight guard prevents overlapping requests.
- Event IDs and event state prevent duplicate browser alerts.
- Followed-match alert preferences are stored locally for goals, cards, and the full-time result.
- Replay uses a deterministic minute cursor and the same pulse-frame calculation as Live mode.

Source state is explicit: Live, delayed/public, schedule seed, or replay. Checked time is visible to the fan. A finished fixture does not make every replay frame final; final state appears only after the replay reaches a full-time event or its final minute.

## 7. Event normalization

The adapter maps source records into a compact event vocabulary:

- `kickoff`
- `goal`, including a source-provided penalty flag
- `yellow_card`
- `red_card`
- `score_update`
- `substitution`
- `halftime`
- `fulltime`

Participant orientation is resolved before score and team labels reach the UI. Numeric-only player identifiers are discarded as display names. A source-readable player name is shown only when it survives the identity guard.

The replay archive accepts a final result only from an action normalized as `game_finalised`. A provisional goal that later disappears is not counted as a confirmed goal.

## 8. Pulse Play

`src/components/PulsePlay.tsx` is an original, rights-safe event theatre. It does not show broadcast footage or copyrighted player likenesses.

- The ball position and attacking side react to the current normalized event frame.
- Goals animate the ball at the relevant end.
- Penalty badges use the source penalty flag.
- Red and yellow cards render from the matching event type.
- Added time uses minute and stoppage metadata.
- The score, current minute, and moment explanation stay synchronized with Match Center.
- Team cheer buttons are local-only fan interactions. Their counts are labeled as the current user's device state and are never presented as global sentiment.

The normal scoreboard remains one click away. Reduced-motion users receive the same state without sustained animation.

## 9. Score challenge

The challenge is an entertainment points system, not betting:

- Every user starts with 1,000 local points.
- The first entry for a match costs 50 points.
- A scheduled match entry may be edited before kickoff without a second charge.
- One fixture has one ledger record and one final settlement.
- Exact score awards 250 points; correct result awards 100; a miss awards 0.
- Settlement requires a verified final score.
- Refresh persistence, revision count, streak, best streak, hit rate, XP, level, and a share card are implemented.

No wallet, token transfer, cash value, custody, wager, prediction market, or trading recommendation exists in this flow.

## 10. Grounded AI-style experience

The product exposes three complementary modes:

- Live call: what just happened.
- Why it matters: how the event changes the match context.
- 30-second recap: a concise catch-up narrative.

Text is generated deterministically from normalized score, event, match state, and source-backed market context. Scheduled matches have distinct pre-match copy for matchup, significance, and catch-up rather than repeating an empty state. The feature does not invent external news or player facts.

Authorized local voice clips are used for prepared replay scenes; browser speech is a transparent fallback. The final English Demo uses the owner's authorized local cloned voice, with scene-specific emotional direction. Voice samples and profile identifiers remain outside the public repository.

## 11. Global fan access

- Eight complete interface languages: English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic.
- Arabic right-to-left document direction.
- Responsive desktop and 390 px mobile layouts without page-level horizontal overflow.
- Keyboard focus, visible focus rings, accessible names, semantic controls, live regions, and reduced-motion support.
- Followed-match alerts and favorite-team prioritization reduce repeated search work.
- Spoiler-free replay hides results and advancement until the fan chooses to reveal them.

## 12. Video and news boundary

TxLINE is a data source, not a broadcast-rights provider. The app links only to official FIFA/FIFA+ archive, highlights, and updates pages unless a rights-cleared URL is supplied. It does not scrape, mirror, or embed unauthorized streams.

The app does not display unsourced gossip. A future club or publisher feed can add editorial stories only when every item includes a named source, timestamp, and rights-safe link.

## 13. Commercial path

The free fan core remains score, events, replay, challenge, and AI catch-up. A viable business path is business-to-business and community focused:

- Branded challenge rooms and private leaderboards for clubs, sponsors, media publishers, and fan communities.
- An embeddable Pulse Play and key-moment widget for publisher match pages.
- Sponsored, clearly labeled fan moments around verified events rather than betting prompts.
- Premium multi-match following, longer personal history, and community moderation tools.
- White-label language packs and match-day venue displays.

This model monetizes distribution, branding, retention, and operations without selling outcome advice or handling wagers.

## 14. Failure and fallback behavior

- No token: use the named public World Cup scoreboard when available.
- No active match: show a scheduled state and keep verified replay available.
- Source failure: show a recoverable source state; do not silently relabel seed or replay as live.
- Empty odds: hide official numerical odds.
- Unknown field: omit it.
- Missing voice clip: use browser speech without claiming it is the cloned voice.
- Missing rights-cleared video: keep event replay and official outbound links.

## 15. Verification evidence

```text
npm run validate
npm run build
npm run e2e:matchday
npm run txline:probe
git diff --check
```

The local suite covers TypeScript, fixture truth, World Cup scope, score normalization, challenge rules, archive finals, AI briefs, eight-language integrity, security, proxy behavior, and the token helper. Browser E2E covers exact settlement, pre-kickoff edits, Pulse Play penalty state, local cheers, alert preference persistence, three AI modes, key events, replay, favorites, official links, keyboard access, accessible names, and desktop/mobile layouts.

On the final local candidate, two consecutive authenticated probes on 2026-07-13 each accepted 2 World Cup fixtures and 2 score records for fixture `18237038`. The official-odds collection changed from 4 records to 7 between probes. These counts are dated observations, not permanent product claims; they demonstrate why every collection is refreshed and timestamped independently.

The final release process runs the complete product acceptance at least three times, renders the English Demo only from the accepted worktree, reviews audio/video twice, and then verifies the deployed site against the same Git commit.
