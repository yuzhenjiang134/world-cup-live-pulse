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
- [x] Add settings panel with English / Chinese / Spanish / Portuguese language switch
- [x] Add richer match hero, story strip, pulse arc, and judge-ready status panels
- [x] Add Today Board with No Match Day / Token Required handling
- [x] Add official TxLINE schedule seed fixtures for 2026-06-28 UTC
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
- [x] Add `docs/USER_MANUAL.md`
- [x] Collapse secondary modules behind Settings so the main surface stays functional
- [x] Add Authorized Video Sync panel with rights-cleared embed boundary
- [x] Add `docs/PUBLIC_RESEARCH_SUMMARY.md`
- [x] Add player impact aggregation from replay events
- [x] Add event stack counts for goals, cards, substitutions, and market swings
- [x] Add Judge Demo Layer with clickable highlight chapters
- [x] Add one-click jumps for data integrity, goal swing, late volatility, and upset context
- [x] Add local submission readiness score panel
- [x] Add World Cup fan-facing multilingual UI coverage for EN / ZH / ES / PT
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

- [ ] TxLINE World Cup API token
- [x] TxLINE endpoint documentation
- [ ] TxLINE / Solana hackathon access sign-up confirmation
- [ ] Example TxLINE response payloads with secrets removed
- [x] GitHub public repository target
- [x] GitHub Pages deployment check
- [ ] Superteam Earn account access
- [ ] Telegram contact for submission
- [ ] Demo video hosting target
- [ ] Clean Solana wallet for prize workflow only

## Next implementation after TxLINE token arrives

- [x] Map live match list endpoint into `MatchData`
- [x] Map live score endpoint into the score card
- [x] Map match events endpoint into `MatchEvent`
- [x] Map odds or market snapshots into `MarketSnapshot`
- [x] Add live API loading state
- [x] Add live API error fallback to Replay mode
- [x] Document exact TxLINE endpoints used
- [ ] Verify real token works against one fixture locally
- [ ] Confirm browser CORS behavior with real token
- [ ] Add live API empty-state copy from real no-match-day response, if provided
- [ ] Add endpoint feedback to submission draft after real token testing
- [ ] Replace static Seed Today Board with real TxLINE calendar response when token and CORS are verified

## Submission checklist

- [x] Deploy app on GitHub Pages
- [x] Verify deployed app works on desktop
- [x] Verify deployed app works on mobile
- [x] Make GitHub repo public
- [x] Confirm no `.env`, API token, private key, seed phrase, or verification code is committed
- [x] Run local security scan
- [ ] Record 3 to 5 minute demo video
- [x] Fill final GitHub Pages URL in `docs/SUBMISSION_DRAFT.md`
- [x] Fill GitHub URL in `docs/SUBMISSION_DRAFT.md`
- [ ] Fill demo video URL in `docs/submission-draft.md`
- [ ] Submit through Superteam Earn before 2026-07-19 23:59 UTC
