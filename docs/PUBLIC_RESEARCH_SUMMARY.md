# Public Research Summary

Updated: 2026-07-01

## Why We Are Building This

World Cup Live Pulse is aimed at the Superteam Earn / TxODDS World Cup Hackathon, Consumer and Fan Experiences track.

The track brief says TxLINE provides live scores, real-time odds, and match events for the World Cup. The sponsor wants fan-facing experiences that ordinary people would actually open while watching a match, especially on a phone.

That means the product should not be a generic sports website or a long documentation page. The main screen should answer one fan question:

```text
What is happening in this match, and why does it feel different now?
```

## Public Requirements That Shape The Product

From the saved public track brief:

- Demo video up to 5 minutes is an absolute requirement for initial screening.
- The submission needs a working app link or functional API endpoint.
- The submission needs a public repo.
- The submission needs brief technical documentation.
- The submission needs a list of specific TxLINE endpoints used.
- The submission needs feedback on the TxLINE API experience.
- Products must be functional, not pitch decks, wireframes, mockups, or non-working concepts.
- Submissions should use TxLINE data as a live input and sign up through Solana.
- Judges care about fan accessibility, real-time responsiveness, originality, monetization path, and completeness.

## What The Page Should Prioritize

Primary surface:

- Score and match clock.
- Latest event.
- Match pulse / momentum.
- AI-style fan explanation.
- Data state: Replay, Seed, Delay, or Live.
- Live / Replay switch.
- Judge demo chapters.
- Share/export output.

Secondary or collapsible surface:

- Operation manual.
- Fixture briefing.
- Country/team atlas.
- Deep endpoint tables.
- Video rights status.
- Language and review presets.
- Background or personalization settings.

This is why the UI was changed so optional modules are hidden behind Settings by default. The public page should feel like a working match dashboard first, not a report.

## TxLINE Data Needed

Implemented or mapped:

- `POST /auth/guest/start`: guest JWT bootstrap.
- `GET /api/fixtures/snapshot`: fixture/calendar source.
- `GET /api/scores/snapshot/{fixtureId}`: score, clock, and match events.
- `GET /api/odds/snapshot/{fixtureId}`: odds / market mood context.

Future upgrade:

- Score SSE stream for true live event updates.
- Odds SSE stream for live market movement.

Why these are needed:

- Fixtures prove which match exists.
- Scores power the scoreboard and match clock.
- Events power goals, cards, substitutions, and the timeline.
- Odds power the "market mood, not advice" layer.
- Streams are the right upgrade for real-time responsiveness.

## Video API Position

TxLINE is a sports data layer. The public docs and track brief emphasize scores, odds, and match events; they do not grant rights to embed official match video.

The OpenAPI spec was checked for video-related terms such as `video`, `hls`, `broadcast`, `embed`, and `streamUrl`; none were present. So the project should not describe video as a TxLINE endpoint.

Because match video is rights-controlled, the project must not scrape, mirror, or embed unofficial streams.

The implemented Authorized Video Sync module therefore works like this:

- It is hidden by default in Settings.
- It only accepts `https://` embed URLs through `VITE_AUTHORIZED_VIDEO_EMBED_URL`.
- It opens an official FIFA+ archive/highlights page by default, so the product has a useful and legal watch path without inventing a stream URL.
- A configured `VITE_AUTHORIZED_VIDEO_EMBED_URL` can replace that default only when the team has a rights-cleared `https://` source.
- FIFA+ availability can vary by territory and rights. The UI therefore calls it an official replay/highlights source, never a guaranteed live stream.
- The in-app timeline replay remains the deterministic fallback and does not pretend to be a TxLINE video feed.

Official sources checked for the default watch path:

- [FIFA+ World Cup editions](https://www.plus.fifa.com/en/showcase/fifa-world-cup-editions/9e331159-475a-4b7e-9ee7-27ff9587c6e2)
- [FIFA+ highlights and replays](https://www.plus.fifa.com/en/showcase/highlights-and-replays/483be165-7819-4791-8815-e502790a5aa4)
- [FIFA World Cup official hub](https://www.fifa.com/en/tournaments/mens/worldcup/)

## Competition-Oriented Product Direction

To improve award chances, the project should keep moving toward:

- Less clutter in the first viewport.
- Stronger live data proof after a real TxLINE token is available.
- No-token public fallback: ESPN FIFA World Cup scoreboard JSON was checked on 2026-07-10 and returned score, status, event details, teams, venue, broadcast labels, and CORS `*`. This is now integrated as a free public signal when TxLINE credentials are missing.
- Video/highlight source check: ScoreBat documents official videos and live streams from verified sources, but its free plan is limited to a Free Feed and may include branding/ads. It is useful as a future authorized-video source, not the core score truth layer.
- Team/context source check: TheSportsDB offers a free JSON API for data and artwork, while its own page lists 2-minute livescores under the supporter/premium API. It is useful for context, not the primary free livescore source.
- A demo video that shows the product flow, not just the UI.
- Clear API feedback for TxODDS.
- A commercial story around fan communities, sports media embeds, Telegram channels, and sponsor-safe second-screen experiences.

The safest winning posture is:

```text
Functional fan dashboard + compact live-pulse ticker + honest data states + real TxLINE adapter + replayable demo + clean submission package.
```

## GitHub Case Review

Updated: 2026-07-01

Public GitHub search found several TxLINE / TxODDS hackathon-style repositories, including `sports-workbench`, `txline-arena`, `matchmind`, and `Pitchside`. They are not the same Consumer and Fan Experiences product, but they expose useful implementation patterns:

- Token handling: stronger projects keep `TXLINE_API_KEY` / `TXLINE_API_TOKEN` in server-side environment variables, not browser bundles.
- Public live UX: the browser connects to a same-origin API route or proxy; the proxy attaches `Authorization: Bearer <guest JWT>` and `X-Api-Token`.
- Streaming: stronger projects use SSE routes for scores or odds and handle unavailable upstreams with visible fallback states.
- Submission docs: strong entries list exact TxLINE endpoints, demo-video flow, API friction, and final setup steps.
- Risk to avoid: projects in trading / settlement tracks often expose wallet or prediction-market flows. World Cup Live Pulse should not copy that because the chosen track is Consumer and Fan Experiences and the product safety boundary is informational fan context only.

Applied decision for this repo:

- Keep GitHub Pages Replay / Seed by default.
- Add optional `VITE_TXLINE_PROXY_BASE` for real online Live mode.
- Keep direct `VITE_TXLINE_API_TOKEN` only for local verification.
- Show the API Access Plan directly in Analyst / Judge view.

## Sources Checked

- Saved Superteam / TxODDS track brief pasted into the project thread.
- Superteam World Cup Hackathon page rechecked on 2026-07-01: https://superteam.fun/earn/hackathon/world-cup/
- TxLINE Quickstart rechecked on 2026-07-01: https://txline.txodds.com/documentation/quickstart
- TxLINE World Cup Free Tier rechecked on 2026-07-01: https://txline.txodds.com/documentation/worldcup
- TxLINE OpenAPI spec rechecked on 2026-07-01: https://txline.txodds.com/docs/docs.yaml
- TxLINE World Cup docs: https://txline.txodds.com/documentation/worldcup
- TxLINE World Cup schedule docs: https://txline.txodds.com/documentation/scores/schedule
- TxLINE guest auth docs: https://txline.txodds.com/api-reference/authentication/start-a-new-guest-session
- TxLINE OpenAPI spec reference: https://txline.txodds.com/docs/docs.yaml
- GitHub public repository search for TxLINE / TxODDS patterns on 2026-07-01.
