# World Cup Live Pulse Work Log

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
