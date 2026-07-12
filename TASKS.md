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
- [x] Add settings panel with English / Chinese / Spanish / Portuguese / French / German / Japanese / Arabic language switch
- [x] Add richer match hero, story strip, pulse arc, and judge-ready status panels
- [x] Add Source Board with No Match Day / Token Required handling
- [x] Add official TxLINE schedule snapshot fixtures checked on 2026-06-28
- [x] Add explicit Live / Delay / Replay / Seed data state model
- [x] Add Trust & Accuracy Center for data truth, token gate, replay truth, and Free Tier delay behavior
- [x] Add visible TxLINE endpoint coverage table
- [x] Add Daily Brief for judge-friendly no-match-day explanation
- [x] Add Data Audit panel for mode, source, replay, and seed coverage
- [x] Add Live Readiness panel for token, endpoints, calendar, and fallback state
- [x] Add Match Intelligence phase summary
- [x] Add Operation Manual for first-time users and judges
- [x] Add Fixture Briefing with match-specific data rules
- [x] Add Country Team Atlas with team style, fan context, and watch notes
- [x] Add settings controls for viewing preset and dashboard modules
- [x] Make Fan / Analyst / Judge presets apply real module visibility and page focus
- [x] Add rolling match data ticker for compact live-pulse scanning
- [x] Convert TxLINE endpoint coverage from dense table to scan-friendly status cards
- [x] Further declutter Fan Mode by moving analysis and submission panels behind Analyst / Judge presets
- [x] Add fan command center with watch-now context, AI readout, compact event feed, and local score pick
- [x] Make fan score prediction controls score-linked, local-only, and separated from betting or prediction-market behavior
- [x] Move team and fixture details behind real on-page reveal buttons instead of showing secondary material by default
- [x] Compact the mobile match hero so the watch and score-pick surface appears earlier
- [x] Add market UX benchmark scan in `docs/UX_BENCHMARKS.md`
- [x] Add match focus navigation for Watch, Pick, Timeline, Mood, and Teams
- [x] Add compact matchday hub with replay fixtures and official schedule seed cards
- [x] Add downloadable local fan score-pick SVG card
- [x] Add `docs/USER_MANUAL.md`
- [x] Collapse secondary modules behind Settings so the main surface stays functional
- [x] Add Authorized Video Sync panel with rights-cleared embed boundary
- [x] Add `docs/PUBLIC_RESEARCH_SUMMARY.md`
- [x] Add player impact aggregation from replay events
- [x] Add event stack counts for goals, cards, substitutions, and market swings
- [x] Add Judge Demo Layer with clickable highlight chapters and judging-criteria score map
- [x] Add one-click jumps for data integrity, goal swing, late volatility, and upset context
- [x] Add local submission readiness score panel
- [x] Add World Cup fan-facing multilingual UI coverage for EN / ZH / ES / PT / FR / DE / JA / AR
- [x] Add kickoff time, referee, qualification note, and data status to Match Center
- [x] Add team profiles and three key players per replay team
- [x] Add discipline event panel for yellow and red cards
- [x] Add group table for the Japan vs Germany group-stage replay
- [x] Add Replay / Live mode switch
- [x] Add replay controls and speed controls
- [x] Add key moment jump controls
- [x] Pause automatically when jumping to a key moment
- [x] Add TxLINE adapter boundary
- [x] Add clear Live-mode token-needed state
- [x] Confirm official TxLINE OpenAPI endpoint paths
- [x] Add real TxLINE HTTP client with guest JWT bootstrap
- [x] Map `GET /api/fixtures/snapshot` into normalized match metadata
- [x] Map `GET /api/scores/snapshot/{fixtureId}` into score and event data
- [x] Map `GET /api/odds/snapshot/{fixtureId}` into market snapshots
- [x] Add live API error fallback to Replay mode
- [x] Add local `npm run txline:probe` command for real-token verification
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
- [x] Enable GitHub Pages source as GitHub Actions
- [x] Verify deployed GitHub Pages URL
- [x] Add local preflight script
- [x] Add replay fixture validation script
- [x] Add repository security scan for tokens, private keys, seed phrases, env files, logs, and UI screenshots
- [x] Add all-in-one validate command
- [x] Add user action list
- [x] Add submission packet index
- [x] Add API mapping template
- [x] Add formal `docs/TECHNICAL_OVERVIEW.md`
- [x] Add formal `docs/TXLINE_ENDPOINTS.md`
- [x] Add formal `docs/API_FEEDBACK.md`
- [x] Add formal `docs/SUBMISSION_DRAFT.md`
- [x] Add formal `docs/DEMO_SCRIPT.md`
- [x] Add formal `docs/SUBMISSION_CHECKLIST.md`
- [x] Update submission docs with official schedule seed and mapped TxLINE endpoints
- [x] Verify TypeScript check
- [x] Verify production build
- [x] Verify browser smoke test
- [x] Verify mobile page has no page-level horizontal overflow

## Blocked until user provides external inputs

- [x] TxLINE World Cup API token activated and stored locally in ignored `.env.local`
- [x] TxLINE endpoint documentation
- [x] TxLINE / Solana hackathon access sign-up confirmation
- [x] Example TxLINE response payloads with secrets removed
- [x] GitHub public repository target
- [x] GitHub Pages deployment check
- [ ] Superteam Earn account access
- [ ] Telegram contact for submission
- [x] Demo video hosting target
- [ ] Clean Solana wallet for prize workflow only

## Verified after TxLINE token arrival

- [x] Map live match list endpoint into `MatchData`
- [x] Map live score endpoint into the score card
- [x] Map match events endpoint into `MatchEvent`
- [x] Map odds or market snapshots into `MarketSnapshot`
- [x] Add live API loading state
- [x] Add live API error fallback to Replay mode
- [x] Document exact TxLINE endpoints used
- [x] Verify real token works against one fixture locally with `npm run txline:probe` twice
- [ ] Confirm browser CORS behavior with real token
- [x] Add live API empty-state copy from real no-match-day response, if provided
- [x] Add endpoint feedback to submission draft after real token testing
- [x] Replace the retired Source Board snapshot path with real TxLINE World Cup fixture responses in the current Match Center and Teams views

## Matchday shell completion

- [x] Replace the overloaded primary screen with a focused three-column matchday shell
- [x] Keep API authentication, JWT, wallet, and endpoint details inside Settings > Live data connection
- [x] Add truthful Live / Delay / Replay / Seed source chip and checked timestamp
- [x] Add 1,000 browser-only test points for the local score challenge
- [x] Add goals, yellow cards, red cards, added time, and final-score signals to the primary view
- [x] Add replay library and teams / players view with working navigation
- [x] Add authorized-video-only watch entry; no unofficial stream is embedded
- [x] Add eight-language controls without mojibake labels in the new shell
- [x] Update security checks to allow only ignored, untracked `.env.local`

## Submission checklist

- [x] Deploy app on GitHub Pages
- [x] Verify deployed app works on desktop
- [x] Verify deployed app works on mobile
- [x] Make GitHub repo public
- [x] Confirm no `.env`, API token, private key, seed phrase, or verification code is committed
- [x] Run local security scan
- [x] Record under-5-minute demo video draft
- [x] Fill final GitHub Pages URL in `docs/SUBMISSION_DRAFT.md`
- [x] Fill GitHub URL in `docs/SUBMISSION_DRAFT.md`
- [x] Fill demo video URL in `docs/submission-draft.md`
- [ ] Re-check the live Superteam listing, then submit before the deadline snapshot of 2026-07-19 23:59 UTC if unchanged

## 2026-07-11 Current release truth

- [x] Official listing rechecked on 2026-07-12: 26 public submissions; Consumer and Fan Experiences prize pool is 16,000 USDT, inside the 50,000 USDT World Cup pool; close is 2026-07-19 23:59 UTC and announcement is scheduled for 2026-07-29 15:00 UTC.
- [x] Match Center is the primary fan workflow: verified score state first, then the score challenge, events, AI-style commentary, market context, and schedule/replay entry points.
- [x] The score challenge starts each local session with 1,000 browser-only test points. It settles from the verified final score and never touches cash, wallets, tokens, wagering, or trading.
- [x] Primary Replay now uses eight authenticated TxLINE 2026 historical sequences. The two 2022 editorial stories remain secondary legacy examples and are never presented as current data.
- [x] Data states are explicit: Live, Delay, Seed, Replay, or public fallback. Unknown source teams remain pending confirmation instead of being guessed.
- [x] Official FIFA+ archive and highlights/replay links are available from the match view. No unofficial stream is scraped or embedded; rights and territory availability remain visible.
- [x] `npm run audit` checks replay dates, score/event consistency, market ranges, team identities, official video domains, localization markers, and source-boundary markers.
- [x] Repeated 2026-07-11 verification: strict `CompetitionId 72` probing kept 3 World Cup fixtures and 2 score records for fixture `18213979` stable. Official odds varied between 0 and 27 records; the final local pair returned 3 then 5, and empty odds were never fabricated.
- [x] Repeated 2026-07-12 verification: strict `CompetitionId 72` probing returned 2 World Cup fixtures; fixture `18222446` returned 40 score records and 20 official-odds records in both probes. The default fixture override is now blank so deployment follows the current source fixture instead of pinning yesterday's match.
- [x] Browser E2E verifies one-charge/one-settlement challenge rules, persistence after reload, commentary/share controls, and a 390px layout with zero horizontal overflow.
- [x] The current submission checklist is `docs/SUBMISSION_CHECKLIST.md`; it is the source of truth for the final demo, Pages asset hash, and submission package.
- [ ] External gates remain external: final TxLINE production/CORS confirmation, latest GitHub Pages asset hash, authorized video availability, final demo recording, and Superteam submission.

## Local-first release gate

Do not push or record the final video until all three local rounds pass on the same worktree:

- [x] Round 1 - data truth: strict World Cup scope test and two real TxLINE probes passed; only `CompetitionId 72`, stable fixture selection, honest odds volatility, and no Friendlies in Match Center or Teams.
- [x] Round 2 - product flow: challenge levels/rules and browser E2E passed for one charge, one settlement, reload persistence, Replay, current source teams, all eight language selections, commentary/share controls, and Settings.
- [x] Round 3 - release quality: full validation, production build, security scan, desktop/mobile layout checks, screenshot review, and `git diff --check` passed.
- [x] After all three local rounds pass, re-open the current official track listing, recheck every submission requirement and judging criterion, compare them against the final local product, and fix every discovered omission.
- [ ] Only after the local rounds and the fresh official-requirements audit both pass: commit, push, wait for GitHub Pages, verify the online asset and flows, then prepare the final demo video.

## 2026-07-11 tournament and replay gate

- [x] Normalize PascalCase and camelCase TxLINE score payloads at one tested adapter boundary.
- [x] Sync eight credential-free 2026 historical sequences through `GET /api/scores/historical/{fixtureId}`.
- [x] Use `game_finalised` for the displayed final score and retain source fixture ID, sequence, endpoint, and capture time.
- [x] Treat an overturned provisional goal as a score review, not as a confirmed goal count.
- [x] Add a dedicated Schedule & Replay view with current fixtures, 2026 archive cards, Round of 32 / 16 / 8 / 4 / Final / Champion lanes, and team/source-player detail.
- [x] Leave unconfirmed stage names, advancement, winners, and player display names blank or source-ID-only.
- [x] Hide numerical odds when no official TxLINE odds payload exists; show score-derived fan pulse instead.
- [x] Browser-test eight archive cards, six bracket lanes, current fixtures, team detail, 1440px and 390px widths.
- [x] Re-run the complete three-round local gate after the documentation and audit updates in this worktree.

## 2026-07-12 score challenge reliability gate

- [x] Make the score challenge the full-width primary interaction directly below the verified score hero.
- [x] Replace compact number fields with accessible minus/plus score steppers and a large points balance.
- [x] Persist predictions by fixture ID in a multi-match ledger and migrate prior per-fixture browser picks.
- [x] Auto-settle each locked pick exactly once from a verified final score; store final score, award, source check time, and settlement time.
- [x] Refresh the selected match every 15 seconds and recheck other pending fixtures every 60 seconds without exposing credentials.
- [x] Refresh immediately when the deployed page regains focus or becomes visible, and send no-store headers from the server proxy so CDN/browser caches cannot freeze match state.
- [x] Keep points local, non-transferable, wallet-free, and without cash value; this remains a fan challenge rather than wagering.
- [x] Remove the duplicated right-rail points card and replace the mixed-language data rule with localized source guidance.
- [x] Browser-test pending-fixture handling, automatic settlement, no duplicate award after reload, history visibility, focus-triggered refresh, and 390px layout on the same final worktree.
