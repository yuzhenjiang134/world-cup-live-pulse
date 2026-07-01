# Competitor Review and Number-One Plan

Updated: 2026-07-01

## Public search scope

Reviewed public Superteam page metadata and GitHub repositories that mention TxODDS, TxLINE, and World Cup Hackathon.

The Superteam static page confirms the hackathon metadata and required submission links, but it does not expose a reliable public submission count in the static HTML / `__NEXT_DATA__` payload. Current submission count must be re-checked with the logged-in Superteam UI or an official API before final submission.

## Public projects observed

| Project | Public angle | Strength | Risk / gap |
| --- | --- | --- | --- |
| `Anuragt1104/final-whistle-rooms` | Consumer & Fan rooms | Private watch rooms, live game loop, AI room recap, Merkle proof story, mobile app | More setup friction, room hosting/state complexity, heavier backend |
| `DIALLOUBE-RESEARCH/natt-pundit` | Fan oracle / edge | Microservice architecture, TxLINE gateway, proof / settlement docs | More technical, less immediately simple for mainstream fans |
| `srivtx/sports-workbench` | Trading tools & agents | Strong proof/receipt story, TxLINE endpoint mapping, public deployed tool | Different track; reads financial/trading rather than consumer fan |
| `aoecal/sharpline` | Sharp-money detector | Clear odds-signal framing | More analyst/trader than fan entertainment |
| `imFiz/snaptap-prediction-markets` | Prediction market | On-chain settlement ambition | Outside our safety boundary; financialized |

## Honest position

If the question is "would a user pay today?", the answer is:

- For a normal fan: not as a standalone paid app until true live TxLINE data and notifications are active.
- For a sports bar, creator community, club page, or media operator: yes, as a white-label attention layer if live data is connected through a secure proxy.
- For judges: yes, the product is coherent because the replay demo is usable, the data states are honest, and the product solves a real fan question: should I keep watching now?

## How we beat the visible competitors

1. Own the attention layer, not generic scores.
   - The Tune-in Signal says Watch now, Stay close, or Catch up later.
   - This is easier for mainstream fans than raw odds, receipts, or market charts.

2. Stay brand-safe.
   - No betting calls.
   - No wallet custody.
   - No private token in the browser bundle.
   - No pirated video.

3. Be judgeable without live timing.
   - Replay mode is deterministic.
   - Seed data is labeled.
   - Live is only shown when TxLINE payloads load.

4. Add buyer readiness.
   - Operator Kit names the buyer use cases: venues, communities, media pages.
   - It also states the live-data blocker clearly, which is more credible than pretending.

## Remaining number-one blockers

- Official TxLINE token / activation path.
- Secure proxy deployment for public live mode.
- Demo video under 5 minutes.
- Optional: real notification backend, favorite teams, and hosted watch-party links.

## Next product target

The highest-value next feature is not more static content. It is a working public live path:

`TxLINE token -> secure proxy -> VITE_TXLINE_PROXY_BASE -> Live mode -> source freshness shown in UI`.

Until then, the product should keep prioritizing replay demo quality, source truth, and a crisp demo story.
