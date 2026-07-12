# Demo Video Package

Updated: 2026-07-11

## Local artifact

The reproducible local demo video target is:

```text
demo-assets/world-cup-live-pulse-demo.webm
```

The generated working copy is ignored by git so local rerenders do not clutter the repository. The current public draft is copied into `public/demo/` so GitHub Pages can serve it at:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/demo/
```

Upload the same video to Loom, YouTube, or another public video host before final submission if the Superteam form prefers a hosted video platform.

## Generate a fresh video

1. Capture the current Match Center, final replay, Teams, and Settings views into `demo-assets/screenshots/`.
2. Run the recorder server:

```bash
node scripts/record-demo-video.mjs
```

3. Open the printed local recorder URL in a browser.
4. Wait until `demo-assets/video-status.json` reports `complete`.

The recorder produces a captioned WebM video under 5 minutes. It uses the real app screenshots plus official-source cards, so it can be regenerated after UI changes without recording private browser tabs.

## Story covered

- Official hackathon requirement and judging lens.
- Fan-first Match Center and the 1,000-point score challenge.
- Historical replay with final-score settlement, event timeline, and AI-style commentary.
- Team/player depth and eight-language Settings.
- TxLINE fixture, score, event, and odds endpoint mapping.
- Live / Delay / Seed / Replay truth rules and official FIFA+ links.
- Commercial path for communities, media embeds, venues, and sponsors.
- Safety boundary: no betting, no trading advice, no wallets, no token leakage.

## Final upload note

The GitHub Pages video page is a usable public draft. Before final submission, rewatch it and optionally upload the same WebM to Loom or YouTube, then paste the final public video URL into `docs/SUBMISSION_DRAFT.md` and the Superteam form.
