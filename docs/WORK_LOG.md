# World Cup Live Pulse Work Log

## 2026-07-13: Final two-round judging extension

- Added persisted goal/card/full-time alert preferences for followed matches; settings remain off the primary fan surface.
- Added Pulse Play, a rights-safe animated pitch driven by normalized score, goal, penalty, card, added-time, and final-state events.
- Added local-only team cheers with explicit device-only labeling; no global sentiment claim is made.
- Fixed replay-frame truth so a completed fixture does not display full time before the replay reaches its final event.
- Removed 2022 editorial stories from the current replay library; the public product now exposes only the verified 2026 TxLINE archive.
- Propagated source penalty metadata through TxLINE, public-scoreboard, archive, shared types, and Pulse Play.
- Expanded E2E coverage for Pulse Play, local cheers, alert preference persistence, mobile fit, and the existing challenge/AI/replay/language flows.
- Added `docs/TECHNICAL_SUBMISSION_2026-07-13.md` and expanded `docs/API_FEEDBACK.md` with endpoint behavior, dated probe evidence, product consequences, commercial path, and release evidence.
- Final local three-pass acceptance and the emotional cloned-voice English Demo are complete; same-SHA online release remains pending.

## 2026-07-13: Product extrapolation and voice-clone demo pass

- Clarified the iteration rule: “举一反三” means extending the fan-facing web product itself, not adding unrelated submission packaging or developer controls.
- Added a local favorite-team action to verified team cards and priority ordering in team and schedule views.
- Extended browser E2E to verify favorite persistence, schedule priority, language settings, key-event navigation, challenge state, and desktop/mobile screenshots.
- Located three reusable local IndexTTS2 voice profiles. The selected profile has a 12.7-second cleaned sample with a local quality score of 100, no clipping, and no remaining warnings.
- Generated the first English voice-clone probe successfully. Structural audio checks passed; reverse transcription recovered the full sentence but misheard the brand phrase “Live Pulse,” so the final narration remains blocked until brand pronunciation is corrected and rechecked.
- Final demo target is approximately 4:10-4:30, under the official five-minute limit, with real interaction before/after evidence and no filler.
- Personal voice samples and local voice-profile paths remain outside the public repository.
- Rechecked the official Consumer and Fan Experiences listing and converted the judging and submission requirements into `OFFICIAL_REQUIREMENTS_PRODUCT_MATRIX_2026-07-13.md`.
- Expanded final candidate B to 16 scenes and 268 seconds. It now proves challenge settlement, event jumps, live trust rules, replay boundaries, spoiler protection, favorite-team priority, team depth, languages, mobile use, official viewing, TxLINE integration, commercial extension, and release evidence.

## 2026-07-13: Public final demo verification

- Replaced the stale July 1 public WebM with final narrated candidate B and published it through GitHub Pages.
- Confirmed `CI` and `Deploy GitHub Pages` succeeded on commit `b8600813749c3cd13a7f3a894fb830ebe806b525`.
- Verified the no-login page at `https://yuzhenjiang134.github.io/world-cup-live-pulse/demo/` and re-downloaded the public MP4.
- The remote and local files share SHA-256 `A82C0BF756A8BDFB90AB0A21D3B93D85017BDB8B10A3D1661C774F81DD90459A`.
- The public file fully decodes as 3:20 H.264 Main 1280x720 at 24 fps with AAC stereo English narration and zero decode/corruption errors.

## 2026-07-13: Two-version demo and double review

- Rebuilt the demo story from the accepted 2026 release instead of reusing the stale July 1 draft. Variant A is the fan journey; variant B maps the same product to judging, data trust, and commercial value.
- Generated current 1280x720 captioned screenshots from the final E2E artifacts and produced English-narrated H.264/AAC MP4 candidates without opening credentials, wallet UI, browser storage, or personal accounts.
- Candidate A is 3:00 and 41,736,152 bytes. Candidate B is 3:20 and 46,130,372 bytes. Both remain below the five-minute limit.
- Ran two complete audio/video decode passes for each final candidate. All four passes completed with zero corrupt/decode-error markers.
- Audited every narration segment against its scene duration and corrected the first cut's clipped opening/closing margins. The final A/B narration sets have zero clipping-risk scenes.
- Inspected representative opening, product, data-boundary, commercial-value, and closing frames. Variant B is the stronger submission candidate because it explicitly covers the five judging dimensions while preserving the fan-first product story.

## 2026-07-13: Same-SHA online acceptance

- Published release candidate `547986f5a20327faeaf219a21a04deeb1441a1c6` to `https://yuzhenjiang134.github.io/world-cup-live-pulse/`.
- Confirmed both `CI` and `Deploy GitHub Pages` completed successfully for that same commit.
- Re-ran the complete public-site E2E against the GitHub Pages subpath: score challenge and persistence, key-event shortcuts, spoiler-free replay, follow toggle, official links, tournament, teams, eight languages, Arabic RTL, and the 390px layout all passed without runtime errors.
- Re-fetched the public assets and completed a second secret/feature audit. `assets/index-BF7xqFN2.js` and `assets/index-Cmfaox4S.css` contain the current key-event and spoiler-free controls and no detected private token, JWT, wallet secret, or `.env.local` content.
- Closed the online release gate and moved the project into the two-version demo recording and double-review phase.

## 2026-07-12: Three-research, three-test, two-demo release contract

- Re-locked the fan value order as trustworthy score/state, complete key events, readable schedule/progression, fast replay catch-up, then score challenge and AI interaction.
- Added three independent research passes: live match center, tournament/replay, and AI/personalization/retention. Each pass must produce a product decision or an explicit decision not to build unsupported UI.
- Added a minimum three-pass acceptance contract on one release candidate: data truth and refresh, complete fan flow and localization, then online/security/mobile.
- Added a two-demo contract: record two sub-five-minute versions, watch each version twice, audit every claim and secret boundary, and submit only the stronger cut.

## 2026-07-12: Research-driven key moments and spoiler-free replay

- Completed three independent market checks covering live match products, schedule/progression/catch-up, and AI/personalization/retention. Evidence and explicit build/no-build decisions are recorded in `docs/THREE_ROUND_MARKET_RESEARCH_2026-07-12.md`.
- Added a compact verified key-event strip. Replay buttons jump directly to goals, cards, score reviews, half-time, and full-time; live mode keeps the moments visible without rewinding the live source state.
- Added spoiler-free replay. Enabling it masks final scores, winners, event totals, bracket results, and team-result detail; selecting a match opens the deterministic timeline at minute 1.
- Added dynamic badge contrast so extremely light source team colors remain readable without changing the team identity or underlying data.
- Re-ran the exact candidate through three release rounds: full validation/security, production build, and browser E2E for challenge settlement, key-event jumps, spoiler-free replay, follow state, official links, tournament, teams, eight languages, RTL, and 390px layout.
- Repeated the authenticated TxLINE probe twice during this pass. Both checks returned 3 World Cup fixtures, 42 score records for fixture `18222446`, and 0 official-odds records; no token value was printed.

## 2026-07-12: Single controlling task plan

- Consolidated the user's full product, data, UX, language, safety, local-release, online-release, demo-video, and submission requirements into `docs/ROUND_MASTER_TASKS_2026-07-12.md`.
- Fixed the release order as local three-round acceptance, fresh official-requirements audit, same-SHA online verification, final demo recording, then submission.
- Made the no-source/no-field rule a release blocker: no guessed values, empty placeholders, stale current fixtures, invented odds, or unsupported player/team detail may reach the fan UI.
- Preserved the score challenge as the highest-weight fan interaction while keeping it local-only, non-cash, wallet-free, fixture-keyed, and verified-final-settled.
- Added the new master task plan and fan research documents to automated preflight coverage.

## 2026-07-12: Followed-match and final local evidence pass

- Added a persistent follow / unfollow control for the selected match. It establishes the current event as a baseline and only attempts a browser notification for a later verified normalized event.
- Kept following useful when notification permission is unavailable: the in-page state persists locally and notification failures never interrupt the match experience.
- Added the third official FIFA tournament-updates entry beside the FIFA+ archive and highlights links.
- Extended browser E2E to verify follow persistence, unfollow cleanup, all three official links, challenge settlement persistence, tournament/archive content, source-derived team records, eight languages, RTL, and zero horizontal overflow at 390px.
- Reviewed the generated desktop, mobile, tournament, and team screenshots. The main hierarchy, mobile framing, dynamic current schedule, 2026 archive cards, and source-derived team records remain readable without placeholder fields.
- Ran two authenticated TxLINE probes on the final local data pass. Both returned 3 World Cup fixture records, 42 score records for fixture `18222446`, and 0 official odds records. No token value was printed, and empty official odds remain hidden.
- Re-ran the exact release worktree sequentially after one parallel-test socket interruption: full validation, production build, browser E2E, `git diff --check`, and the security scan all passed without runtime errors.
- Re-opened the official track on 2026-07-12. It remains open with 16,000 USDT total prizes, an up-to-five-minute demo as an initial-screening requirement, working application/public repository/technical endpoint documentation/API feedback requirements, and the same five judging criteria. The syncing submission counter returned 30 and then 25 in consecutive reads, so the project continues to treat it as dynamic rather than a stable fact.

## 2026-07-10: Match center and legal watch path

This iteration keeps the product aligned to the Consumer and Fan Experiences submission goal.

### Shipped in this iteration

- Added an official FIFA+ archive/highlights watch path as the default external viewing link.
- Kept optional team-owned video URLs behind `VITE_AUTHORIZED_VIDEO_EMBED_URL`; no unofficial stream scraping or embedding.
- Added a truthful rights and territory note so replay/highlights are never described as guaranteed live video.
- Corrected scheduled-match semantics: a scheduled fixture now shows `-- : --`, no synthetic kickoff event, and a Seed source state.
- Added a local-only test-point reset action in Settings; the score challenge remains virtual and has no cash or wallet value.
- Added a shared UTF-8 i18n validation script covering English, Chinese, Spanish, Portuguese, French, German, Japanese and Arabic.
- Added match summary and AI-style commentary to the main view.
- Added a schedule and progression panel with source status, stage, kickoff, score when verified, and replay entry points.
- Added group progression rows when the loaded match contains a standings snapshot.
- Extended the adapter result with normalized schedule items from TxLINE fixture snapshots, public ESPN scoreboard events, and deterministic replay fixtures.
- Kept the primary navigation intentionally focused: Match Center is the live, score-challenge and AI-commentary surface; Replay is historical-only; Teams is the detailed World Cup team/player atlas; Settings contains connection and local-test controls.
- Added match-specific key-player context to Match Center while keeping the complete team/player atlas separate, so the live workflow stays fast to scan without removing deep reference data.

### Truth boundary

- `Live`: authenticated TxLINE score/event/odds data or a current public scoreboard event loaded from its named source.
- `Delay`: delayed or public scoreboard data; this is not silently promoted to live.
- `Seed`: fixture/schedule context without a verified current score/event feed.
- `Replay`: fixed historical data used for judging and repeatable demos.
- Video availability is rights-controlled and can vary by territory. The in-app timeline remains the reliable demo fallback.

### Product decisions recorded from the latest review

- Current and upcoming data belong in Match Center only when the source has a current checked timestamp. Old or deterministic data belongs in Replay.
- The score challenge is a core fan interaction, but it is strictly local test points and derives its settlement from the verified final score; it is not betting, trading advice or a wallet flow.
- AI-style commentary and pulse explanation stay inside the live/replay match context. They must disclose the source state and must not imply certainty.
- Team and player depth is kept as a separate atlas, with a compact match-specific player strip in Match Center. This balances a detailed reference surface with a clean live watch surface.
- Automatic refresh is enabled for live mode at the source adapter boundary. Every refresh rechecks the selected score/event/odds feed and the available schedule snapshot; unavailable or stale data remains visibly labeled.

### Verification to run before submission

```text
npm run check
npm run i18n
npm run validate
npm run build
npm run txline:probe
```

## 2026-07-10: Core challenge hierarchy and language cleanup

- Promoted the local score challenge to the first interaction block after the match summary and paired it with a market snapshot card.
- Added explicit x-price display for the normalized market snapshot; the label remains `Official odds snapshot` only when TxLINE odds records are present, otherwise it is labeled as derived/replay context.
- Added a replay shortcut row directly inside the Match Center schedule so historical stories are reachable without leaving the primary workflow.
- Localized event titles and descriptions for all supported UI languages instead of rendering raw API event descriptions or event type names.
- Removed raw TxLINE source messages, source remarks, and placeholder referee text from the visible fan surface; connection diagnostics stay behind Settings.
- Added Belgium team-code mapping and color fallback so the live schedule no longer renders an unknown `BXX` placeholder for Belgium.
- Kept source-of-truth team and player names intact while translating product labels, status labels, event descriptions, and data-quality states.
- Kept the current Match Center focused on the 2026 TxLINE schedule/score boundary; the bundled Argentina-France and Germany-Japan fixtures are explicitly historical 2022 replay demos and never presented as current matches.
- Set the local fan challenge balance to a versioned 1,000-point starting balance, with persistence and a visible reset action in Settings.
- The playback path is an official FIFA+ external archive/highlights link. It is a real legal source, but rights and territory can limit individual match availability; the in-app event timeline is the deterministic fallback.

## 2026-07-11: Score challenge priority, official video entry, and data truth audit

- Moved the score challenge directly below the score hero so the core fan interaction is visible before secondary schedule and reference content.
- Kept the starting balance at 1,000 local test points and made the final-score settlement path explicit. This is a discussion game only: no cash value, wallet, bet, trade, or prediction-market settlement.
- Added two official FIFA+ entry links in the watch surface: archive and highlights/replays. The product does not promise a free live stream; rights and territory can vary, and the in-app timeline is the deterministic fallback.
- Added `npm run audit` as a data and product-boundary audit. It checks deterministic replay identity, event/score consistency, market ranges, team identity coverage, official video domains, localized feature markers, and Live/Delay/Seed/Replay boundaries.
- Reconciled `docs/SUBMISSION_CHECKLIST.md` and `TASKS.md` with the current Match Center shell so retired prototype panels are not presented as the primary product.
- Repeated TxLINE probes on 2026-07-11 kept 3 World Cup fixtures and 2 score records for fixture `18213979` stable. Official odds varied between 0 and 27 records across checks; the final local pair returned 3 then 5. No odds are invented when the payload is empty.
- Strengthened the core challenge with fan level and XP progress derived from played, correct, and exact results; points remain local and non-cash.
- Enriched schedule cards with stage, kickoff, status, verified score, and event/goal/extra-time summaries, and enriched current source team cards with fixture counts and opponents.
- Removed stale Jordan/Algeria/Austria schedule seeds and placeholder roster entries from the reference atlas. It now contains only four clearly historical 2022 replay profiles.
- Added a two-stage World Cup scope guard: every fixture request defaults to `CompetitionId 72`, then `filterTxlineWorldCupFixtures()` rejects Friendlies `CompetitionId 430` before fixture selection, schedule rendering, or team extraction.
- Added Norway and Switzerland identity mappings so real TxLINE participants render as `NOR` and `SUI` rather than generated placeholders.
- Added pure scope tests, score-challenge tests, and browser E2E coverage for one-time settlement, reload persistence, TTS/share controls, and 390px mobile layout.

## 2026-07-11: Verified 2026 tournament archive and progression view

- Added `GET /api/scores/historical/{fixtureId}` to the local and secure public read-only proxy allowlists.
- Added a credential-safe sync command that captured eight completed 2026 World Cup fixtures from TxLINE CompetitionId 72 without storing the API token, guest JWT, wallet, or private key.
- Added a tested PascalCase/camelCase score normalizer so `FixtureId`, `Action`, `Score`, `Seq`, and `game_finalised` feed the same internal model.
- Replaced the primary 2022 demo replay with 2026 TxLINE historical replay. Legacy 2022 editorial demos remain secondary only.
- Added a dedicated Schedule & Replay product view: current fixtures, eight verified result cards, six-stage knockout path, replay launch, and team/source-player detail.
- Calibrated replay minutes from TxLINE match clock, carried score state across records with no `Score` object, and removed overturned provisional goals from confirmed-goal counts.
- Removed synthetic numerical odds from derived/replay context. The UI displays official x-prices only when an official odds payload exists; otherwise it displays score-derived fan pulse.
- Extended browser E2E to verify the 2-0 final frame, exact-score settlement, eight archive cards, six bracket lanes, localized current-fixture copy, and zero page overflow at 1440px and 390px.
# 2026-07-12 - Score challenge reliability and hierarchy

- Promoted the score challenge to a full-width primary interaction directly below the match score.
- Added large points balance, score steppers, stronger primary action, and compact prediction history.
- Added a fixture-keyed browser ledger with legacy-pick migration, automatic verified-final settlement, one-award idempotency, final score, award, and source timestamps.
- Kept the selected fixture on 15-second refresh and added 60-second background checks for other pending picks.
- Removed duplicate points UI and mixed-language source-rule content from the right rail.
- Rechecked the official listing: 26 public submissions on 2026-07-12; requirements and five judging criteria are unchanged.
- Repeated the real TxLINE probe twice: 2 World Cup fixtures, 40 score records, and 20 official-odds records for fixture `18222446` in both runs. Removed the default fixture pin so deployment follows the latest source fixture.

## 2026-07-12: Requirement-plus product depth and consumer-language pass

- Recorded a permanent acceptance rule: each official requirement is the minimum and must become two or three connected, testable fan benefits; decorative or source-unsupported feature count does not qualify.
- Added one localized team-name boundary for Match Center, scheduled-match copy, tournament/team details, and AI summaries across English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic.
- Expanded the AI brief from a generic sentence into event-driven coverage for goals, yellow/red cards, score review, half-time, full-time, and momentum changes, with factual score guards and browser speech playback.
- Added an isolated season demonstration over eight verified 2026 archive finals. It shows repeat challenge value but is explicitly separate from the user's actual fixture ledger and points.
- Removed remaining developer-facing wording from the main fan surface and kept authentication, endpoint, proxy, cache, and diagnostics inside collapsed Settings and technical documentation.
- Passed TypeScript, 8-language/96-key UTF-8 validation, event-driven AI tests, and the product/data truth audit after this pass.
- Re-ran the authenticated TxLINE probe twice after the UI pass: both runs returned 3 World Cup fixtures, 42 score records for fixture `18222446`, and 0 official-odds records. The app's empty-odds boundary remains correct.
- Re-opened the official track page twice: its syncing submission counter moved from 25 to 27 while the 16,000 USDT prize split and July 29 announcement stayed unchanged. Dynamic listing counts are no longer treated as fixed product facts.
- Enforced a no-source/no-field rule in the fan UI: removed pending player/coach placeholders, old 2022 team reference profiles, empty official-odds cells, scheduled-match event counters, and empty accuracy fields.
- Replaced the tournament page's static current-fixture lane with the active adapter schedule, so past fallback fixtures cannot remain labeled as upcoming.
- Added source-derived 2026 team records with verified archive appearances, wins, goals for/against, cards, source-supplied player names when available, and direct replay entry points.

## 2026-07-13: Fan-readable identity and interface-language pass

- Replaced the accumulated round notes with one current local-product and competition acceptance checklist. Old online/video completion markers no longer count as the current release state.
- Removed raw TxLINE player IDs from every fan-facing path. IDs remain internal event metadata only; a player card or spoken name now requires a source-supplied display name.
- Added a second defense in the AI layer so `#102`, `Player 205`, and similar identifiers are never spoken or rendered as player names even if malformed input reaches the commentary function.
- Replaced mixed-language scheduled-match sentences, fixed `vs` labels, `pts`, and letter-code navigation icons with language-aware matchup copy, point units, and familiar visual controls.
- Clarified team cards: `Matches`, `Opponents`, and `Goals for:against` now describe the displayed values; the right rail is labeled as the replay library rather than a misleading next-fixture list.
- When the current verified source has no player names, the page is truthfully titled `Teams` and omits the player section instead of showing IDs or empty placeholders.
- Passed TypeScript, 8-language/109-key UTF-8 validation, AI fact/identity guards, product-data audit, archive final-score verification, and the complete desktop/mobile browser E2E after these changes.
- Added six pre-generated natural commentary clips for one verified 2026 replay: live call, meaning, and catch-up in English and Chinese. The public mapping contains no voice-profile ID or local path, and browser speech remains the fallback.
- Reverse transcription passed all six clips after Simplified/Traditional Chinese normalization; every clip also passed duration, RMS, silence, and clipping gates.
- Fixed source-provided `FIFA World Cup, Semifinals` so Chinese and the other supported languages render the localized tournament stage instead of mixed-language source text.
- Repaired production E2E URL and browser-target isolation, then completed two consecutive passes against the built preview at `http://127.0.0.1:5190/`.
- The final competition Demo is English-only. The product remains eight-language; no multilingual video variants will be produced.
- Consolidated the current video package into one 4:50 English judging cut. All 17 scenes carry explicit emotion direction, including the event-driven Pulse Play scene, and pronunciation-sensitive narration covers no-spoiler replay, T X Line, and the no-cash safety boundary.

## 2026-07-13: Pre-kickoff fairness, richer AI states, and player evidence

- Rechecked the official Consumer and Fan Experiences brief and current FIFA, OneFootball and FotMob product patterns. The resulting priorities are match state, key moments, progression, low-friction participation, favorites and fast catch-up rather than more panels.
- Changed the live challenge gate so new predictions are accepted only before kickoff. Replay mode remains deterministic for judging.
- Added a fair edit flow: the first save costs 50 local points, edits before kickoff cost no additional points, kickoff closes editing, and one fixture remains one ledger record with revision evidence.
- Expanded scheduled AI from one repeated empty-state sentence into three distinct modes across eight languages: matchup/stage/kickoff, why the stage matters plus the challenge deadline, and a pre-match catch-up checklist.
- Expanded live “why it matters” handling for goals, cards, score review, half-time and full-time across all supported languages.
- Replaced source-internal player role strings with structured, source-derived goals, cards, substitutions and event minutes. If the source provides only numeric IDs, the player section remains hidden.
- Passed TypeScript, challenge rules, eight-language AI tests, archive final-score checks, i18n validation and the product data audit before browser acceptance.
- Marked the previous video candidate stale. The English Demo will be re-rendered only after the revised product passes local acceptance.

## 2026-07-13: Final local acceptance candidate

- Fixed the score challenge edit boundary end to end: one paid entry per fixture, free edits before kickoff, automatic edit closure at kickoff, one ledger row, revision evidence, and verified-final settlement only.
- Replaced low-information status repetition with the actual kickoff time before a match and a key-moments destination after a replay ends.
- Removed desktop and mobile truncation in challenge rules, team record metrics, and the three-item primary navigation; normalized typography spacing for more stable multilingual rendering.
- Added an explicit 15-second timeout to the read-only TxLINE probe so an unavailable upstream cannot leave product verification hanging.
- Ran two consecutive authenticated TxLINE probes. Both current observations returned 2 World Cup fixtures, 2 score records and 6 official odds records for fixture `18237038`; these are timestamped observations, not permanent product copy.
- Passed the full `npm run validate` suite after the final changes: fixture integrity, eight-language keys, source-truth audit, challenge rules, World Cup scope, score normalization, AI fact guards, 2026 archive finals, proxy boundary, preflight and secret scan.
- Passed the production build and two final browser E2E runs, one Chinese and one English, at 1440px desktop and 390px mobile with no horizontal overflow or runtime errors.
- Browser E2E proves: 1,000 starting points, replay exact-score settlement, 50-point first entry, free pre-kickoff edit without a second deduction, reload persistence, three distinct AI modes, key-event jumps, favorites, official links, source-only player display, eight language switches and safety copy.
- Added automated visible-control accessible-name coverage and keyboard focus entry to the production E2E, localized previously hard-coded screen-reader labels and group-table abbreviations, labeled both score inputs explicitly, and added a reduced-motion preference boundary.
- Local product acceptance is complete. Final English video regeneration, two-pass viewing/listening review, online deployment, same-SHA verification and final Superteam submission remain pending by design.

## 2026-07-13: Pulse Play, final evidence, and submission documentation

- Added configurable goal/card/full-time alerts for followed matches, persisted locally and triggered only by newly verified events while the page is open.
- Added Pulse Play, a rights-safe animated match theatre driven by the same normalized score and event frames as Match Center. It covers goals, source-marked penalties, cards, added time, final state, and clearly local-only team cheers.
- Fixed replay-frame truth so a completed fixture does not display full time while the replay cursor is still at an earlier minute.
- Limited the product replay library to eight verified 2026 TxLINE archives; legacy editorial stories remain compatibility fixtures and are no longer visible as current product replays.
- Replaced replay-list team codes with complete localized team names while retaining standard codes in the compact scoreboard.
- Added a detailed judge-facing technical submission and expanded TxLINE feedback with endpoints, authentication, data lifecycle, security boundary, failure behavior, commercial path, and dated evidence.
- Ran two consecutive authenticated final-candidate probes: both accepted 2 World Cup fixtures and 2 score records for fixture `18237038`; official-odds records changed from 4 to 7, confirming independent collection freshness. No token or JWT was printed.
- Passed the complete local validation suite, production build, Chinese and English browser E2E, eight-language checks, desktop and 390px mobile layout checks, accessibility names, keyboard flow, secret scan, and visual review.
- Removed personal FFmpeg paths from public demo scripts. They now use `FFMPEG_PATH`, system `PATH`, or portable local discovery.
- Final product worktree is accepted. The remaining release stages are same-SHA deployment, online verification, and the final submission audit.

## 2026-07-14: Final English Demo acceptance

- Rendered the accepted 17-scene judging cut at 4:50, 1280x720, 24 fps, H.264 Main video, and AAC stereo audio.
- Used the owner's authorized local cloned voice without writing its profile identifier, sample name, or sample path into the repository or output metadata.
- Regenerated the opening, Pulse Play, score challenge, key-event, and closing scenes with scene-specific emotion direction; reused only previously accepted authorized takes for the remaining scenes.
- Reverse-transcribed all 17 narration clips. Every clip passed; minimum text similarity was 0.904 and average similarity was 0.968.
- All narration clips passed duration, RMS, silence, and clipping gates. Full-program audio measured approximately -19.8 dB mean and -3.0 dB peak.
- Completed a second full decode and visual pass using every scene midpoint plus representative frames for the opening, Pulse Play, challenge, key events, TxLINE boundary, and closing scene.
- The final MP4 fully decodes with no missing audio/video stream or corruption error. Public publishing remains intentionally pending until the accepted worktree and video are committed together.

## 2026-07-14: Final official-source recheck

- Reopened the official Consumer and Fan Experiences listing before release. It still reports `Open`, 16,000 USDT in track prizes, and 33 public submissions at the observation time.
- Reopened the World Cup Hackathon page. It still states 24 June through 19 July and describes the goal as wiring TxODDS real-time match data into real products.
- The countdown widget showed an inconsistent zero value, so release decisions use the explicit `Open` state and published date range rather than the countdown rendering.
- Reconfirmed the required package: accessible working application, public repository, sub-five-minute Demo, brief technical documentation with exact TxLINE endpoints, and API experience feedback. The repository also contains a longer judge-facing technical note and dated probe evidence.
- Submission counts and endpoint record counts remain labeled as timestamped observations because both can change after this release.
