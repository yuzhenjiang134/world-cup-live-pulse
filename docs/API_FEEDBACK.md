# TxLINE API Feedback

## Build-stage feedback

World Cup Live Pulse is built replay-first because the public hackathon build needs to be judgeable even when no World Cup match is active. The most important API need is not only live data, but trustworthy status metadata that lets the product avoid pretending mock data is live.

## What would improve the developer experience

- A match calendar endpoint with explicit `no_live_match_today` or equivalent empty-state metadata.
- A clear freshness field for every score, event, and odds snapshot.
- Stable event IDs so the UI can deduplicate goals, cards, substitutions, and market shifts.
- Sample payloads for live, delayed, scheduled, finished, postponed, and no-match-day states.
- A documented odds meaning model so the product can label market movement correctly and avoid betting-advice language.
- CORS guidance for browser demos.
- Rate limits and recommended polling interval.
- Standard error codes for token missing, token expired, rate limit, match not found, and no active fixture.

## Product-specific feedback

For consumer fan experiences, the API is strongest when it can support explanation, not just raw values. Useful extra fields would include:

- Match status label
- Localized kickoff time
- Venue and referee
- Group or knockout stage
- Qualification context
- Player involved in each event
- Feed freshness and delay level
- Stable match chapter or highlight markers for consumer replay and social sharing
- Localized names or short labels for teams, competition stages, and match status

## Current handling

Until official token and endpoint docs are available, the app uses:

- `Replay` data for deterministic match playback.
- `Seed` data for static context.
- A visible `TxLINE token needed` state for Live mode.
- A No Match Day rule in the Today Board.
- Judge Demo chapters to make replay evaluation repeatable.
- English, Chinese, Spanish, and Portuguese UI labels for global fan testing.

## Final submission note

This file should be updated again after real TxLINE endpoint testing. The final version should list:

- The exact endpoints used.
- What worked well in the normalized schema.
- Any auth, CORS, freshness, rate-limit, or no-match-day friction.
- Any bug or documentation gap reported to TxODDS support.
