# World Cup Live Pulse Final Release Tasks

Updated: 2026-07-12

The current round's single controlling checklist is `docs/ROUND_MASTER_TASKS_2026-07-12.md`. This release file remains the concise final gate for the competition package.

Current fan-product research and iteration plan: `docs/FAN_PRODUCT_RESEARCH_2026-07-12.md` and `docs/FAN_FIRST_ITERATION_TASKS.md`.

## Product standards

- [x] Treat every official requirement as the minimum and extend it into two or three useful, testable fan benefits.
- [x] Keep Match Center consumer-first: verified score, AI brief, prominent score challenge, events, schedule, replay, and team detail.
- [x] Never render an unsourced field, guessed value, stale “current” fixture, or “updating / pending” placeholder.
- [x] Separate current match data from verified 2026 replay. Keep legacy 2022 examples outside the primary product path.
- [x] Keep the score challenge primary: 1,000 local points, fixture-keyed picks, one charge, one verified settlement, levels, streaks, history, and no cash/wallet value.
- [x] Ground AI commentary in normalized goals, cards, score reviews, half-time, full-time, and momentum; support spoken playback.
- [x] Keep all eight languages complete and use localized team names where a verified mapping exists; Arabic remains RTL.
- [x] Use only official FIFA video/archive links or an explicitly rights-cleared HTTPS embed. Never scrape or embed unofficial streams.
- [x] Keep API tokens, JWTs, wallet secrets, private keys, seed phrases, and verification codes out of the repository and public bundle.

## Data and detail

- [x] Restrict TxLINE data to World Cup `CompetitionId 72` and reject Friendlies `CompetitionId 430`.
- [x] Refresh the selected match every 15 seconds, refresh on focus/visibility, and recheck pending picks in the background.
- [x] Use `game_finalised` for final settlement and correct provisional/overturned goals.
- [x] Hide numerical odds whenever the current official odds payload is empty.
- [x] Build 2026 team records only from authenticated archive results and events: matches, wins, goals for/against, cards, player IDs, and replay links.
- [x] Drive the tournament current-match lane from the active adapter schedule; hide the lane when no active source exists.
- [x] Preserve eight credential-free 2026 TxLINE replay sequences so judges can evaluate the complete product outside live match hours.

## Local acceptance

- [x] TypeScript and production build pass.
- [x] Fixture, World Cup scope, score normalization, archive, challenge, AI, proxy, preflight, and security tests pass.
- [x] Eight-language key parity and UTF-8 validation pass.
- [x] Re-run browser E2E after the final no-source/no-field team-detail pass.
- [x] Visually review final desktop, mobile, tournament, and team screenshots.
- [x] Run `npm run validate`, `npm run build`, `git diff --check`, and security scan on the exact release worktree.

## Online release

- [x] Commit and push the exact locally accepted worktree.
- [x] Confirm GitHub CI and GitHub Pages both succeed on commit `547986f5a20327faeaf219a21a04deeb1441a1c6`.
- [x] Run the full browser E2E against the deployed GitHub Pages subpath.
- [x] Verify public mobile width, score settlement persistence, eight languages, replay navigation, official links, and absence of runtime errors.
- [x] Verify the public bundle contains no private token or credential.
- [x] Keep authenticated TxLINE credentials local until a separately authorized secure server deployment is available; never expose them through GitHub Pages.

Online acceptance record: `https://yuzhenjiang134.github.io/world-cup-live-pulse/`, verified 2026-07-13 00:55 Asia/Shanghai. Public assets: `assets/index-BF7xqFN2.js` and `assets/index-Cmfaox4S.css`.

## Demo video

- [x] Record only after the final online build passes every audit.
- [x] Keep both candidate videos under five minutes and show the normal fan UI, not developer tools.
- [x] Show the score challenge first, verified settlement, replay events, AI brief, tournament path, team records, global/mobile usability, and source freshness.
- [x] Show TxLINE endpoint usage and security/data boundaries through captions and English narration; never reveal `.env.local`, token, JWT, wallet, or browser storage.
- [x] Review both A/B candidates twice for media integrity, accuracy, legibility, audio, pacing, narration clipping, and accidental secret exposure; select B as the final candidate.
- [ ] Upload the final video to the selected public host and verify playback without login.

## Submission audit and upload

- [ ] Re-open the official track immediately before submission and recheck status, timer, prizes, judging criteria, and required fields.
- [ ] Confirm the public repository, live URL, final video URL, README, technical overview, exact TxLINE endpoints, and API feedback all point to the final release.
- [ ] Confirm every claim in the submission text is visible in the product or supported by a test/document.
- [ ] Run the final secret scan and inspect the committed file list.
- [ ] Submit before the official close and save the submission confirmation.

## External actions retained for the user

- [ ] Complete the final Superteam submission and any account/wallet identity steps.
- [ ] Provide or choose the final public video hosting destination if the existing target changes.
- [ ] Keep prize wallet/private credentials outside this project and never send them to the app or repository.
