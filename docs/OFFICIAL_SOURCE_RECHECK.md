# Official Source Recheck

Updated: 2026-07-01

## What was rechecked

The public Superteam / TxODDS hackathon page and TxLINE documentation were rechecked before preparing the demo-video package.

Sources:

- Superteam World Cup Hackathon: `https://superteam.fun/earn/hackathon/world-cup/`
- TxLINE Quickstart: `https://txline.txodds.com/documentation/quickstart`
- TxLINE World Cup Free Tier: `https://txline.txodds.com/documentation/worldcup`
- TxLINE OpenAPI spec: `https://txline.txodds.com/docs/docs.yaml`

## Confirmed public requirements

- The project must be a functional product, not only a pitch deck, wireframe, or non-working concept.
- The required demo video must be under 5 minutes and should show the problem, the app walkthrough, and how TxLINE powers the backend.
- The submission must include a deployed app or functional endpoint, public repository, brief technical documentation, endpoint usage notes, and API feedback.
- Judging emphasizes fan accessibility, real-time responsiveness, originality, commercial path, and completeness.
- Live match availability during review is not guaranteed, so the demo must clearly show the user flow and core functionality.

## Confirmed TxLINE access model

The current public documentation describes:

- Production server: `https://txline.txodds.com`
- Test server: `http://txline-dev.txodds.com`
- Guest session endpoint: `POST /auth/guest/start`
- API token activation endpoint: `POST /api/token/activate`
- Data calls requiring both `Authorization: Bearer <guest JWT>` and `X-Api-Token: <API token>`
- World Cup / International Friendlies free tiers, including a delayed option and a real-time option
- Fixtures, scores, odds, historical snapshots, SSE streams, and validation proofs as the core data surfaces

## OpenAPI endpoint evidence

The OpenAPI spec checked on 2026-07-01 includes these paths used or mapped by this project:

- `POST /auth/guest/start`
- `POST /api/token/activate`
- `GET /api/fixtures/snapshot`
- `GET /api/odds/snapshot/{fixtureId}`
- `GET /api/odds/stream`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/stream`

## Product implication

World Cup Live Pulse should keep the public GitHub Pages build in Replay / Seed mode unless a secure server-side proxy is deployed. The browser bundle must not contain a private `X-Api-Token`.

The final demo video should therefore say:

- Replay mode is deterministic and judgeable.
- Seed schedule data is useful context but not live score data.
- Live mode is already wired through the TxLINE adapter and secure-proxy plan.
- True Live should only be shown after official TxLINE credentials are activated and payloads load successfully.

