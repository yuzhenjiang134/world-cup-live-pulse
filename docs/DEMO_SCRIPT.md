# Demo Video Script

Target length: under 5 minutes.

## 0:00-0:25 Open and position

Open the deployed GitHub Pages site.

Say: World Cup Live Pulse is a fan-first match dashboard for the Consumer and Fan Experiences track. It explains score, match events, market mood, and momentum without becoming a betting or trading product.

Show that the default Fan Mode opens directly on the match pulse, not on documentation. Point to the compact match hero, rolling ticker, watch-now panel, AI readout, and local fan score pick.

Use the score buttons to change the local fan score pick once, then use a quick pick button. Say: This is a local fan conversation feature only. It does not place bets, create a prediction market, connect wallets, or store secrets.

Click the team cards and match details buttons only briefly to show that deeper information exists on demand.

## 0:45-1:35 Data consistency

Open Settings and switch to Judge Mode.

Show the Source Board and Trust & Accuracy Center.

Say: The app does not invent live data. The Today Board uses official TxLINE schedule seed fixtures for Jordan vs Argentina and Algeria vs Austria, but it keeps them as Seed / Token Required until authenticated live score, event, and odds feeds are loaded. Replay stays available so judges can evaluate the match flow even if no live fixture is open during review.

Point to Data Audit, Live Readiness, and the endpoint status cards. Explain mapped, token-gated, and planned feeds in one sentence.

Briefly show that Judge Mode opens the Operation Manual and Fixture Briefing modules, while Fan Mode can collapse them again.

Say: The page is designed for a first-time fan. It tells the user what is happening now, lets them make a safe local score pick, and makes source truth visible when they need it.

## 1:35-2:35 Judge Demo chapters

Use the Judge Demo chapter buttons.

Show:

- Data integrity chapter
- Goal swing chapter
- Late volatility chapter
- Upset context chapter
- Scoreline
- Latest beat
- AI-style commentary
- Pressure map
- Market mood panel
- Timeline progress

Say: The built-in chapters make the demo repeatable for judges and video recording.

## 2:35-3:20 Match Intelligence and Match Center

Show:

- Country Team Atlas
- Phase summary
- Event stack
- Player impact
- Kickoff time
- Referee
- Data status
- Qualification note
- Discipline events
- Team profiles and key players

Use the upset-context chapter to show the Japan vs Germany group table.

## 3:20-3:55 Settings and optional modules

Open Settings and switch between Fan Mode, Analyst Mode, and Judge Mode. Then switch between English, Chinese, Spanish, and Portuguese.

Say: Presets keep the page useful for ordinary fans, data reviewers, and hackathon judges without cluttering the main match view. Language switching is important for a global World Cup fan experience and for demo clarity across audiences.

Turn on Authorized Video Sync.

Say: Match video rights are separate from TxLINE data. This panel only accepts a rights-cleared official embed URL, and the public build shows a rights-required state instead of using unofficial streams.

## 3:55-4:30 TxLINE boundary

Switch to Live mode.

Say: Live mode is already routed through the TxLINE adapter. Without credentials it shows a token-needed state instead of pretending replay data is live. With a local token, the adapter calls TxLINE fixtures, score snapshots, and odds snapshots, then maps them into the same MatchData model.

## 4:30-4:55 Share and safety

Switch to Analyst or Judge Mode, then show the share card preview and export button.

Close with: The product is informational only. It does not place bets, recommend trades, operate prediction markets, handle wallets, or store secrets.

## Recording checklist

- Browser zoom at 100 percent.
- Use the deployed URL.
- Use the Judge Demo chapters instead of manually hunting for moments.
- Do not show `.env.local`, tokens, private keys, seed phrases, verification codes, or wallet screens.
- Keep the final video under 5 minutes.
