# Fan Product Research

Updated: 2026-07-12

## Product purpose

World Cup Live Pulse is a second-screen match companion for mainstream fans. It should answer three questions with minimum effort:

1. What is happening now?
2. What should I pay attention to next?
3. How did my score challenge perform?

It is not a developer console, a generic data warehouse, a sportsbook, or a collection of unsupported football facts.

## Market evidence

### Official FIFA experience

- FIFA's 2026 tournament hub prioritizes live scores, the full fixture list, teams, the bracket, news, highlights, and interactive games.
- FIFA's 2026 coverage plan adds live blogs for all 104 matches, team news, previews, injury/suspension context, key statistics, reports, and highlights shortly after full time.
- FIFA+ combines live schedules, free archive/replay, highlights, multilingual access, personalization, recommendations, and match notifications.
- FIFA's accessibility program emphasizes real-time audio description so low-vision fans can follow every goal and important moment without repeatedly asking what happened.

Sources:

- https://www.fifa.com/en/tournaments/mens/worldcup/
- https://www.fifa.com/en/articles/coverage-highlights-blogs-reports-interviews
- https://www.fifa.com/en/news/articles/fifa-plus-new-era-brand
- https://inside.fifa.com/organisation/news/audio-desctiptive-commentary-haptic-boards-jillian-sloane-canada

### Mature score products

- LiveScore centers on live score, fixtures, results, match stats, commentary, event alerts, lineups, previews, and post-match reaction.
- Flashscore emphasizes fast reliable updates, goals/cards/lineups notifications, live standings, detailed statistics, ratings, and personalized favorites.
- OneFootball separates personalized content, live matches, date filters, streamable matches, videos, highlights, and games into predictable navigation.
- FotMob positions real-time scores, detailed statistics, ratings, and personalized insights as one coherent match product.

Sources:

- https://www.livescore.com/en/media/livescore-features-wc-2026/
- https://www.flashscore.com/faq/information/
- https://www.flashscore.com/news/a-new-level-of-notifications-customise-your-settings-for-each-team-or-match/nR4k89xo/
- https://onefootballsupport.zendesk.com/hc/en-us/articles/4412970161937-What-does-the-OneFootball-app-offer
- https://www.fotmob.com/aboutUs/company

### Fan demand and pain points

- IBM's 2025 global study covered more than 20,000 sports fans in 12 countries. Fans increasingly value real-time updates, personalization, and AI-powered commentary/analysis.
- Deloitte found that fans want real-time statistics and analytics, while fragmented viewing rights cause people to miss games and subscribe to too many services.
- The official hackathon asks for an intuitive mainstream fan experience, fluid real-time response, an original interaction model, commercial utility, and complete execution. It explicitly suggests an AI pundit with goal/red-card/odds-shift explanations and TTS, plus replayable fan games with streaks and sharing.

Sources:

- https://china.newsroom.ibm.com/2025-08-20-IBM-AI
- https://www.deloitte.com/us/en/insights/industry/sports/immersive-sports-fandom.html
- https://superteam.fun/earn/listing/consumer-and-fan-experiences

## Pain points translated into product decisions

| Fan pain | Product response | Truth boundary |
| --- | --- | --- |
| Score apps are noisy and fragmented | One Match Center with score, state, event pulse, AI brief, challenge, schedule, and official watch links | Secondary details stay behind dedicated views or collapsed sections |
| Fans miss goals, cards, kick-off, and full time | 15-second refresh, focus recovery, event-driven AI, spoken brief, and local followed-match alerts | Alerts only use newly verified normalized events |
| Tournament paths are hard to scan | Dynamic upcoming fixtures, verified 2026 results, and knockout lanes | Unknown stages or winners remain absent |
| Replays are hard to find or rights vary | Deterministic timeline replay plus official FIFA archive/highlight links | No unofficial stream or guaranteed territory availability |
| Passive scores do not create return engagement | 1,000-point score challenge, one-time settlement, history, level, streak, share card, and season demonstration | Local points only; no cash, wallet, wagering, or trading |
| AI sports text can hallucinate | Event templates use score, minute, card type, player ID/name, source state, and team mapping | AI never invents lineups, injuries, player names, or probabilities |
| Global fans encounter mixed language | Eight complete interface languages, localized team names, RTL, and browser speech | Source IDs/proper names remain unchanged when no verified translation exists |
| Detailed pages often contain filler | 2026 team records derive matches, wins, goals, cards, player IDs, and replay links from TxLINE archive | No-source means no field and no pending placeholder |

## Differentiation

The product should not try to beat mature score apps on the number of raw statistics. Its stronger competition story is the connected loop:

`verified match update -> concise multilingual AI explanation -> score challenge consequence -> replay/share/history`

That loop directly expands the hackathon's AI pundit and replayable fan-game examples while remaining useful before, during, and after a match.

## Explicit non-goals until a source exists

- Starting lineups, formations, possession, shots, corners, xG, injuries, suspensions, player ratings, and news articles.
- Unofficial live video, scraped streams, or territorial availability claims.
- Betting recommendations, deposits, cash prizes, wallet connections, or prediction markets.
- Background push delivery while the site is closed; the current static deployment can only provide truthful in-page/browser alerts while open.
