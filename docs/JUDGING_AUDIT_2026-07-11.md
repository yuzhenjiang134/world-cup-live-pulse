# Judging Quality Audit

Updated: 2026-07-11

Official criteria source: https://superteam.fun/earn/listing/consumer-and-fan-experiences

Fresh listing snapshot checked 2026-07-12: 26 public submissions, 16,000 USDT track prizes, July 19 2026 23:59 UTC close, and July 29 2026 15:00 UTC scheduled announcement.

This audit measures the current product against the five published Consumer and Fan Experiences criteria. It separates code-complete evidence from external submission gates so the final demo never overclaims.

## 1. Fan accessibility and user experience

Evidence:

- Match Center is the default view and keeps the score, data freshness, score challenge, events, and commentary above secondary reference material.
- The score challenge starts with 1,000 browser-only points and explains the 50-point cost and verified-final-score settlement before locking.
- Fan level, XP progress, streak, best streak, and accuracy give the challenge a durable return loop without adding financial risk.
- Current source teams are shown before the collapsed reference atlas.
- Eight UI languages share one typed key set, including localized tournament copy and RTL support for Arabic.
- Browser E2E confirms zero horizontal overflow at 390 x 844 and keeps both teams, score controls, points, and top actions inside the viewport.
- The score challenge now spans the full match column, keeps a per-fixture prediction ledger, and automatically settles verified finals exactly once after refresh or reload.

Remaining gate: final manual checks on one additional narrow phone and one large desktop after the online build is updated.

## 2. Real-time responsiveness

Evidence:

- Live mode polls every 15 seconds with an in-flight guard. Official TxLINE docs currently report mainnet Level 1 at 60-second delay, mainnet Level 12 as real-time, and devnet Level 1 with `samplingIntervalSec = 0`; the UI still labels polling delivery conservatively as Delay unless a true live stream is confirmed.
- Non-selected pending challenge fixtures are rechecked every 60 seconds, matching the conservative free-tier cadence while avoiding needless request bursts.
- TxLINE integration covers fixtures, score events, odds snapshots, and the documented final-score proof request.
- The app shows source status and checked time; it does not silently promote Seed or Replay to Live.
- Repeated real probes returned 3 World Cup fixtures and 2 score records for fixture `18213979`. Official odds varied from 0 to 27 records across checks; the final local pair returned 3 then 5, and the empty state remained empty rather than receiving synthetic values.
- The latest pair on 2026-07-12 returned 2 World Cup fixtures; fixture `18222446` returned 40 score records and 20 official-odds records in both runs. The deployed default is unpinned so the current World Cup fixture is selected automatically.
- The adapter sends `competitionId=72` and filters the response again so Friendlies `CompetitionId 430` cannot leak into the World Cup product.

Remaining gate: a server-side token proxy is required if authenticated TxLINE data must be visible on the public static deployment.

## 3. Originality and value creation

Evidence:

- The product answers a consumer question, not a trader question: what happened, how intense is the match, and what should I watch next?
- Score challenge, match pulse, event replay, share card, and spoken AI-style commentary create an active second-screen experience.
- The same normalized flow works with delayed live data and deterministic replay, so judges can evaluate the whole experience outside match hours.
- Eight completed 2026 TxLINE historical sequences make the judgeable replay demonstrably sponsor-powered rather than a fictional 2022-only mock.
- Schedule & Replay visualizes current pairings, verified Round-of-16 and quarter-final results, the incomplete knockout path, and team/source-player details without guessing unknown advancement.
- AI text is generated from normalized score, event, and source state; it is not an ungrounded external prediction.

Remaining gate: the final demo must show the interaction loop, not just static screens.

## 4. Commercial and monetization path

Product path:

- Free fan app: score, challenge, replay, source trust, and official watch links.
- Community edition: branded challenges, fan-group leaderboards, notification hooks, and share cards for Telegram or supporter communities.
- Media/B2B edition: embeddable match pulse widget, localized commentary layer, sponsor placement, and analytics for publishers or broadcasters.

The current build proves the core engagement loop and safe data boundary. Payments, cash prizes, wagering, and custody are intentionally outside this hackathon version.

Remaining gate: include one commercial-path slide/caption in the final demo and submission copy without adding a fake checkout flow.

## 5. Completeness and execution

Evidence:

- Working Vite/React/TypeScript app, public repository, GitHub Pages workflow, README, technical overview, endpoint map, API feedback, user manual, submission draft, and demo script.
- Automated gates cover TypeScript, fixtures, i18n, data/product truth, challenge rules, tournament scope, security, build, and real-browser flow.
- Replay, Live/Delay/Seed labels, official video-rights boundary, local-only credentials, and failure fallback are implemented.
- `game_finalised` final-score extraction, provisional-goal correction, hidden non-official odds, archive fixture tests, and bracket/browser tests enforce the data-truth boundary.
- Query parameters provide deterministic demo entry states without creating a judge-only fake UI.

Remaining gates: latest Pages deployment verification, final video under five minutes, final listing recheck, and Superteam submission.

## Current verdict

The product code is feature-complete for the intended fan loop. It is not yet final-submission complete because the video is deliberately paused and authenticated public TxLINE requires a secure server-side proxy. No score of 100/100 should be claimed until those external proofs are attached and the final online build passes the same checks.

## Release stop conditions

Do not record or submit if any of these fail:

- A non-World-Cup fixture appears in Match Center or Teams.
- Replay is presented as current live data, or a legacy 2022 editorial story is presented as the primary 2026 archive.
- Official odds are displayed when the TxLINE odds payload is empty.
- A prediction can be charged or rewarded more than once for the same stored state.
- Any language shows missing shared UI keys or mojibake.
- Mobile width overflows at 390px.
- The public bundle contains an API token, JWT, wallet secret, private key, or seed phrase.
- An unofficial video stream is embedded or described as authorized.
