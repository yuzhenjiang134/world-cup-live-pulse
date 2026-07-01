# Product Value Review

Updated: 2026-07-01

## Would a fan pay for this?

Not yet as a standalone paid product, but the path is credible if the product owns one job better than a normal score app:

> Tell me whether this match is worth my attention right now, explain why, and let me share my safe fan read.

The current build is therefore optimized for an attention product, not a generic sports database.

## What changed in this iteration

- Added a Tune-in Signal to the main fan view: Watch now, Stay close, or Catch up later.
- Added a local alert threshold selector: Early, Balanced, Big swings.
- The signal is based on current pulse, score/event movement, high-value events, and distance to the next replay key moment.
- The copy explicitly says this is an attention signal, not betting advice.

## Why this matters for the hackathon

Judges are likely to reward real fan usefulness more than raw data volume. A fan can now understand:

- whether to keep watching;
- what changed in the match;
- why the app is not pretending Replay or Seed data is Live;
- how their score pick can be shared safely without wallets, betting, or trading advice.

## What still blocks true commercial value

- Authenticated TxLINE live payloads are still needed for real matchday operation.
- Real push notifications require a backend and permission flow.
- Video requires an authorized embed source; the app must not scrape or pirate streams.
- A real paid product would need favorite teams, notification preferences, and match history across devices.

## Current product score

- Fan usefulness: 8/10 for a demo, 6/10 for daily real use until TxLINE live data is active.
- Trust and accuracy: 8/10 because Replay, Seed, and Live boundaries are explicit.
- Commercial path: 6/10 now, potentially 8/10 if live data + alerts are deployed.
- Submission strength: 8/10 because the build has a clear consumer problem, working replay demo, safety boundaries, and documented API plan.
