# Three-Round Fan Product Research

Updated: 2026-07-12

This document records three independent market checks and converts each finding into a concrete product decision. Research is used to simplify the fan path, not to justify unsupported feature count.

## Round 1: live match center and key events

Evidence:

- FIFA's official 2026 hub centers live results, the complete schedule, teams, knockout bracket, news, highlights, and where-to-watch information.
- LiveScore's World Cup product emphasizes scores, fixtures, results, match statistics, commentary, alerts, and highlights.
- Flashscore offers match/team notification controls for goals, red cards, lineups, and full time.
- FotMob positions fast scores, detailed match state, live commentary, and personalized alerts as one match experience.

Sources:

- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
- https://www.livescore.com/en/media/livescore-features-wc-2026/
- https://www.flashscore.co.uk/news/personalised-notifications-set-up-unique-in-app-notifications-for-each-team-or-match/vLjh44bL/
- https://www.fotmob.com/en-GB/download

Decision:

- Keep verified score, match state, freshness, AI brief, and score challenge in the shortest path.
- Keep 15-second refresh, focus recovery, and followed-match alerts.
- Add a compact key-event shortcut strip for goals, cards, score reviews, half-time, and full-time.
- Do not add lineups or advanced statistics until a verified source supplies them.

## Round 2: schedule, progression, and catch-up

Evidence:

- FIFA's tournament experience combines complete fixtures, live results, groups, standings, bracket, and where-to-watch guidance.
- OneFootball separates live/streamable/date-filtered matches and makes rights/territory restrictions explicit.
- OneFootball states that full on-demand replay is not universally available; highlights and key moments are the reliable catch-up route.
- LiveScore organizes completed results with highlights and commentary.

Sources:

- https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums
- https://onefootballsupport.zendesk.com/hc/en-us/articles/4412970161937-What-does-the-OneFootball-app-offer
- https://onefootballsupport.zendesk.com/hc/en-us/articles/32443967812881-Is-There-Any-Catch-Up-or-Replay-of-Live-Matches
- https://www.livescore.com/en/football/international/world-cup-2026/results/

Decision:

- Keep active fixtures, verified 2026 replay, and knockout lanes separate.
- Keep official video as a rights-dependent external path, while the deterministic event timeline remains the reliable replay product.
- Add spoiler-free replay so a fan can enter at minute 1 without seeing the final score, winner, or event totals first.
- Never display an unconfirmed advancement, winner, date, or stage.

## Round 3: AI, personalization, and return engagement

Evidence:

- IBM's 2025 study reports that real-time updates, personalized content, and AI commentary/insights are leading fan priorities.
- FIFA+ highlights personalized navigation, a live schedule, multilingual support, AI-driven recommendations, and match notifications.
- Deloitte reports demand for real-time statistics while streaming fragmentation makes discovery harder and more expensive.
- Capgemini reports demand for streamlined aggregation and personalized match summaries, while authenticity remains important.

Sources:

- https://china.newsroom.ibm.com/2025-08-20-IBM-AI
- https://www.fifa.com/en/news/articles/fifa-plus-new-era-brand
- https://www.deloitte.com/us/en/insights/industry/sports/immersive-sports-fandom.html
- https://www.capgemini.com/ca-en/news/press-releases/over-half-of-sports-fans-are-turning-to-ai-or-gen-ai-for-more-personalized-content/

Decision:

- Keep multilingual event-grounded AI summaries and browser speech.
- Keep score challenge history, level, streak, sharing, and followed-match state as the return loop.
- Do not add a separate personalization dashboard before submission. It would create another surface without enough current source coverage.
- Do not claim generative knowledge beyond normalized match events; the commentary remains source-grounded and deterministic.

## Final research-to-product rule

The release loop remains:

`verified match update -> visible key event -> concise multilingual explanation -> score challenge consequence -> spoiler-free replay/share/history`

Anything outside this loop must either have a verified source and shorten a fan task, or stay out of the release.
