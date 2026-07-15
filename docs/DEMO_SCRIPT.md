# Final Demo Script - Recording Draft

Status: prepared for owner review. Recording is blocked until local acceptance and same-commit online review pass, then the project owner explicitly approves recording.

Target duration: 4:32. Hard maximum: 5:00. Language: English only.

The approved recording will use the user's authorized local cloned voice. The voice profile, source sample, and local paths never enter the repository, captions, browser, or output metadata. Narration should be recorded as continuous chapters with natural bridges, not as a chain of disconnected short clips.

## 0:00-0:22 - The fan problem

Show the opening Match Center and move immediately to the score, state, and latest verified moment.

Narration intent: Fans should not have to switch between a score app, a social feed, a predictor, and a replay page just to understand one match. World Cup Live Pulse brings the trusted match state, the moments that changed it, and low-friction participation into one fan-first journey.

Voice: warm urgency, then a confident product introduction.

## 0:22-0:48 - The live answer

Show score, match status, freshness, one-sentence AI brief, followed-match controls, and the score challenge above the fold.

Narration intent: The first view answers four questions quickly: what is the score, what just happened, what should I watch next, and how can I join in? Technical diagnostics stay out of the fan path, while source status and checked time remain visible in plain language.

Voice: clear and reassuring.

## 0:48-1:18 - 11v11 Pulse Play

Switch to Pulse Play. Jump through a goal, yellow card, red card, substitution, added time, and full time. Show the player count changing from eleven to ten after a confirmed red card.

Narration intent: Pulse Play turns the same verified event stream into a rights-safe animated match theatre with eleven illustrated figures per team. Goals, cards, substitutions, added time, and final state change the scene. When the source provides a readable player name, it appears; otherwise we never turn an internal number into a player identity. Positions and shirt numbers are illustrations, not tracking claims.

Voice: matchday energy with a slower, factual delivery for the identity boundary.

## 1:18-1:45 - Score challenge and repeat use

Show the 1,000-point starting balance, place a 50-point score pick, edit before kickoff, then show verified one-time settlement and history.

Narration intent: The score challenge adds a reason to return without betting, wallets, or cash. One fixture has one local ledger entry, edits remain free before kickoff, and rewards and experience settle once only after a verified final result. The history demonstrates the full loop without pretending that local demo activity came from real users.

Voice: energetic on participation, precise on settlement and safety.

## 1:45-2:10 - AI catch-up and key moments

Show Live Call, Why It Matters, and 30-Second Catch-Up. Jump among goals, cards, reviews, half-time, and full-time.

Narration intent: The AI-style brief never invents a fact. It grounds every sentence in the active score, event, minute, and source-readable identity. Fans can hear the immediate call, understand why the moment matters, or catch up quickly after missing part of the match.

Voice: conversational and human, with restrained football excitement.

## 2:10-2:34 - Fan rooms

Show the settled score pick and points change in the match room, then use the prediction shortcut to enter the matching team room. Open the all-match, home-team, and away-team rooms, add one reaction and one short comment, and show that their state remains separate.

Narration intent: Prediction and conversation form one fan loop instead of two isolated widgets. A score pick leads directly to the relevant team room, and full time keeps the one-time points result beside the discussion. This prototype stores real reactions and comments on the current device, separately for each fixture and room. It does not display fake fans, bot messages, or invented global totals. A club or publisher can extend the same structure into authenticated, moderated rooms.

Voice: friendly and social, then transparent on the local boundary.

## 2:34-2:59 - Schedule, progression, replay, teams

Show current schedule separation, verified 2026 replay fixtures, tournament progression, spoiler-free replay, favorite-team priority, and source-gated team/player detail.

Narration intent: Fans can see what is next, how the tournament progressed, and what they missed without mixing upcoming matches with completed ones. Replay, team, and player detail appear only when supported by the source. Numeric IDs and unsupported lineup, assist, or xG fields are omitted.

Voice: practical and trustworthy.

## 2:59-3:21 - Global and accessible use

Show English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic RTL, then the 390-pixel mobile layout and keyboard focus.

Narration intent: The complete fan journey works in eight languages, not just the navigation shell. Mobile controls fit without horizontal overflow, keyboard names are meaningful, and reduced-motion users keep the same match information without sustained animation.

Voice: globally welcoming and concise.

## 3:21-3:42 - Rights-safe viewing

Open the official viewing and highlights links, then return to timeline replay.

Narration intent: World Cup Live Pulse never scrapes or rebroadcasts an unauthorized stream. Viewing entry points go only to official FIFA destinations, while the event timeline and Pulse Play remain useful when media rights vary by territory.

Voice: responsible and positive.

## 3:42-4:08 - How TxLINE powers the backend

Show a clean architecture frame: guest JWT, `/api/fixtures/snapshot`, `/api/scores/snapshot`, `/api/odds/snapshot`, normalization, refresh, and `game_finalised` settlement. Do not show credentials or developer forms.

Narration intent: T X Line powers the verified core. Authenticated fixture, score, event, and official-odds collections are normalized into one match model. Live data refreshes every fifteen seconds and on focus; provisional changes can reverse; collections keep independent freshness; and the score challenge settles only on `game_finalised`. Tokens and JWTs remain behind a private proxy and never enter the public bundle.

Voice: measured, accessible, and technically confident. Pronounce the sponsor as "T X Line."

## 4:08-4:32 - Commercial path, proof, and close

Show the product matrix, test evidence, then close on Match Center with challenge, theatre, and community visible.

Narration intent: The same trusted core can power sponsored non-cash challenge rooms, moderated club communities, publisher match widgets, venue screens, and localization packages. This is a complete product, not a mockup: local and online browser tests cover challenge settlement, 22-player event states, three fan rooms, AI modes, replay, eight languages, accessibility, security, and responsive layouts. World Cup Live Pulse helps fans understand, participate, and return, during the match and after it.

Voice: credible commercial confidence, then a warm human finish.

## Approval and final checks

- Do not record until the project owner approves this script after local and online acceptance.
- Record continuous chapter narration with natural transitions and consistent pacing, emotion, and loudness.
- Confirm duration stays under five minutes and every visible fact matches the accepted commit.
- Reverse-transcribe and compare against this script.
- Check pronunciation, clipping, silence, loudness, sync, first frame, 11v11 theatre, red-card count, challenge settlement, fan-room truth boundary, TxLINE architecture, and final safety frame.
- Watch and listen to the complete English video twice before publishing.
- Publish only after the public video works without login and matches the same accepted product version.
