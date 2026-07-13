# Official Requirements to Product Evidence Matrix

Updated: 2026-07-13

This matrix is the release contract for the final competition build. “Extrapolation” means turning each official requirement into two or three connected fan benefits inside the web product, then proving those benefits in the demo and tests. It does not mean adding unrelated panels.

Release gate: after all extensions are implemented, run at least two separate usability passes. Pass one follows the primary fan tasks. Pass two rechecks language, mobile layout, data truth, empty states, and recovery paths.

## 1. Fan Accessibility and UX

Official intent: a mainstream, non-technical football fan should understand and repeatedly use the product.

Product evidence:

1. Score, match state, freshness, AI brief, replay control, and next action occupy the first match view.
2. The 1,000-point score challenge is the highest-weight interaction, with one fixture record, free editing before kickoff, one verified settlement, persistent XP, streak, accuracy, and history.
3. Key-event jumps, spoiler-free catch-up, favorite-team priority, configurable followed-match alerts, eight complete languages, Arabic RTL, and a verified 390-pixel layout shorten common fan tasks.

Demo evidence: scenes 2-4 and 7-11.

Acceptance evidence: browser E2E, i18n key audit, desktop/mobile screenshots, no-horizontal-overflow check.

## 2. Real-Time Responsiveness

Official intent: the product should visibly react to what is happening on the pitch using TxLINE as a live input.

Product evidence:

1. The selected match refreshes every 15 seconds and immediately after focus or visibility recovery; the last checked time is visible.
2. Goals, penalties, yellow/red cards, score updates, half-time, full-time, and market movement drive the timeline, Pulse Play animation, AI brief, spoken brief, and followed-match notification.
3. World Cup CompetitionId 72 is enforced, Friendlies 430 is rejected, provisional goals can be overturned, missing official odds are hidden, and only `game_finalised` settles the challenge.

Demo evidence: scenes 4-6 and 13.

Acceptance evidence: TxLINE live probes, fixture-scope audit, normalized event tests, final-state settlement tests, source-freshness checks.

## 3. Originality and Fan Value

Official intent: create a genuine consumer interaction rather than repackaging a score feed.

Product evidence:

1. The points-only challenge converts verified results into a safe repeat-use loop across matches without cash, wagering, a wallet, or trading advice.
2. Pulse Play converts the same verified event frame into a rights-safe animated pitch for goals, source-tagged penalties, cards, added time, and full time; local cheers add participation without pretending to be global sentiment.
3. Spoiler-free replay and event-grounded AI commentary cover pre-match, live and post-match states; key-moment jumps, spoken recap, and favorite-team priority turn raw match data into a personal catch-up story.

Demo evidence: scenes 3, 4, 7, and 8.

Acceptance evidence: persistent local ledger test, no-duplicate settlement test, Pulse Play event/cheer E2E, spoiler mask E2E, favorite persistence and ordering E2E.

## 4. Commercial and Extension Path

Official intent: the build should have a credible path beyond a one-off hackathon screen.

Product evidence:

1. The free fan layer has a repeat-use loop through challenge progress, replay history, followed matches, and favorite-team shortcuts.
2. The same source-aware match story and Pulse Play component can extend into branded challenge rooms, community leaderboards, publisher widgets, venue screens, and localized sponsor activations.
3. The product does not show a fake payment button or claim unsupported revenue; commercial extensions remain documented and reuse the same verified data core.

Demo evidence: scene 14.

Acceptance evidence: product-value review, no-fake-payment UI audit, technical overview.

## 5. Completeness and Execution

Official intent: a functional product, not a pitch deck, wireframe, mockup, or static concept.

Product evidence:

1. A deployed public website and public repository expose the full fan flow without login.
2. Authenticated TxLINE live mode and credential-free 2026 replay mode share the same normalized UI while remaining truthfully labeled.
3. README, brief and detailed technical notes, exact endpoint documentation, dated API feedback, user manual, submission draft, tests, security scan, and same-SHA release evidence form one submission package.

Demo evidence: scenes 1, 6, 13, 15, and 16.

Acceptance evidence: validate/build/E2E, public E2E, CI and Pages status, bundle secret scan, endpoint and claim audit.

## 6. Submission Requirements

- [x] Working deployed website.
- [x] Public GitHub repository.
- [x] Brief technical documentation, detailed implementation note, and exact TxLINE endpoint list.
- [x] Detailed TxLINE API experience, dated probe evidence, friction, product consequences, and improvement feedback.
- [x] Functional product with TxLINE as the primary live data source.
- [x] Re-render the Demo master after final product acceptance; the 4:50 final cut shows the problem, working flow, and TxLINE backend value.
- [x] Demo scene plan includes real before/after product interactions rather than feature-only slides.
- [x] Local authorized voice profile passes English brand-name and sentence reverse-transcription checks.
- [x] Render the complete 4:50 narration with the local voice profile and pass two audio/video evidence reviews.
- [x] Re-run three local product acceptance rounds on the exact final worktree.
- [ ] Publish only after local acceptance, then verify CI, Pages, public E2E, video playback, and remote hashes on the same commit.
- [ ] Human owner completes the final Superteam submission and any identity or payout steps.

## 7. Non-Negotiable Truth Boundaries

- No source means no field: no invented lineups, injuries, xG, ratings, odds, news, or video streams.
- Current, scheduled, delayed, and replay data remain visibly distinct.
- Official FIFA/FIFA+ links only; no unauthorized stream embedding.
- No token, JWT, private key, seed phrase, wallet secret, or personal voice sample in the public repository or video.
- Dynamic submission counts and temporary API behavior are never presented as permanent product facts.
