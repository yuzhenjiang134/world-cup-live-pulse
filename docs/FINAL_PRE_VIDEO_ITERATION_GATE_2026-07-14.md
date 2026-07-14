# Final pre-video iteration gate

## Controlling goal

Ship a fan-facing competition product whose live/replay facts remain honest, whose core interactions work end to end, and whose demo proves the product rather than hiding unfinished work. Recording remains blocked until local acceptance, same-commit online acceptance, and explicit owner approval.

## Already complete

- [x] Fan-first match centre with score, status, key events, schedule, replay and team paths.
- [x] Score Challenge starts with 1,000 local points, supports pre-kickoff edits, settles from confirmed final scores and keeps an auditable local ledger.
- [x] Three AI views: live call, why it matters and 30-second catch-up, all grounded in the normalized score/event frame.
- [x] Eight interface languages with localized navigation, match labels, event labels and AI text.
- [x] Pulse Play starts 11 v 11, responds to goals/cards/substitutions/added time/final state, and reduces the on-pitch count after a red card.
- [x] Pulse Play exposes only readable source player names; source-internal numeric identities are omitted.
- [x] Pulse Play states that positions and shirt numbers are illustrative, while score, minute and event type come from the selected match timeline.
- [x] Match room plus two team rooms, local comments, quick prompts, removable posts and one reaction per room/match minute.
- [x] No fake global users, comments, reaction totals or community activity claims.
- [x] Rights-safe viewing path uses official destinations; no unlicensed stream is embedded.
- [x] Developer setup wording and private connection details are absent from the fan-facing product.

## Iteration 1: AI interpretation and speech

- [x] Map all eight languages to explicit speech locales.
- [x] Prefer an exact local device voice, then a matching language voice, without mislabelling browser speech as cloned narration.
- [x] Tune pace by language and AI mode so live calls remain energetic and catch-ups remain easier to follow.
- [x] Require goal, yellow-card, red-card and score-review calls to preserve minute and score in all eight languages.
- [x] Keep internal player IDs out of every tested AI language.
- [x] Complete fresh local English and Chinese E2E after all iterations.
- [ ] Complete a manual listen/read review of the final English demo narration before recording.

## Iteration 2: Pulse Play truth and humanization

- [x] Render 11 human figures per team at kickoff and distinguish keeper, defence, midfield and attack.
- [x] Animate the event actor, supporting run, ball trail and goal celebration without claiming optical tracking.
- [x] Show yellow/red cards, substitutions, penalties, added time and full time from the event timeline.
- [x] Preserve 10 v 11 after a verified dismissal and keep the current dismissed figure visible during the card moment.
- [x] Label live, delayed, scheduled and replay synchronization honestly.
- [x] Recheck desktop, 390 px mobile and reduced-motion presentation after the final build.

## Iteration 3: community, retention and sustainability

- [x] Scope comments and reactions by fixture and fan room.
- [x] Persist the most recently used room, comments and reactions on the current device.
- [x] Cap comments at 180 characters and retain only the latest 24 local posts.
- [x] Prevent repeated taps from inflating the same minute/reaction count.
- [x] Replace developer-style generic prompts with natural, event-aware conversation starters in all eight languages.
- [x] Keep community realism honest: prompts adapt to the event, while only the user's own posts appear as comments; no fabricated profiles or totals.
- [x] Link retention to follow, favourites, event alerts, Score Challenge history, catch-up and replay.
- [x] Document the production boundary: global rooms require authenticated identity, rate limits, filters, reporting and human escalation.
- [x] Re-run room isolation, persistence, deletion and reaction-deduplication E2E after the final build.
- [x] Confirm that kickoff and other visible event labels never fall back to `INFO` or generic developer wording.

## Local release gate

- [x] `npm run validate` passes after the three iterations.
- [x] Production build passes.
- [x] English E2E passes.
- [x] Chinese E2E passes without mixed-language product labels.
- [x] 390 px mobile has no horizontal overflow or clipped controls.
- [x] Public bundle scan finds no token, private key, local voice path, local absolute path or developer setup copy.
- [x] Local functionality and fan usability report is updated.

## Online release gate

- [x] Commit and push the final local candidate only after the local release gate is complete.
- [x] GitHub Actions and Pages deploy the same candidate successfully.
- [x] Online QA round 1: English desktop, core flow, console and live/replay state.
- [x] Online QA round 2: Chinese/mobile, community persistence, Pulse Play and public bundle audit.
- [x] Record the deployed commit, bundle hashes and remaining honest product limits.

Accepted online evidence:

- Deployed commit: `4a033b17e5c8a676ed7b51828335a5b2fb0284b2`.
- GitHub Actions: CI run 60 and Pages run 59 completed successfully for that commit.
- Public JavaScript: `index-CejLFIAl.js`, SHA-256 `50066362D1656B399E2A6F05694E01E834C7AA76F8C77C7E58B8382FC03AD667`.
- Public CSS: `index-CWq-wxmX.css`, SHA-256 `83748D66C575528C6A5B63F349F008C0C3DA7BEF9273FDFBB55414037608BB86`.
- Online English E2E: pass, including challenge settlement, replay, Pulse Play, fan rooms, AI modes, official links, accessibility and desktop/mobile layout.
- Online Chinese E2E: pass, including localized product labels, challenge flow, community state and 390 px layout without horizontal overflow.
- Public browser audit: zero console errors; no `.env.local`, devnet-token setup, `INFO` event fallback or absolute local path in the fan UI.
- Honest limits remain explicit: comments and reactions are device-local; positions and shirt numbers are illustrative; official video availability depends on regional rights; live freshness depends on the available TxLINE feed.

## Demo gate

- [ ] Owner explicitly approves recording after reviewing the accepted online release.
- [ ] English-only narration uses the owner's authorized local voice asset; no voice profile, sample or local path enters Git.
- [ ] Narration is one fluent, emotionally natural story under five minutes.
- [ ] Demo visibly explains the fan problem, product answer, Score Challenge, AI interpretation, Pulse Play, fan rooms and TxLINE backend.
- [ ] Watch/listen pass 1 checks facts, timing, flow and synchronization.
- [ ] Watch/listen pass 2 checks audio continuity, pronunciation, subtitles and absence of private material.

## Current stop line

Video recording has not started. Local and same-commit online acceptance are complete. The next permitted step is owner review and explicit approval; recording remains blocked until that approval is given.
