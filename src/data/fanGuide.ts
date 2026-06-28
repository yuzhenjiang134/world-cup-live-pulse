export type TeamGuide = {
  code: string;
  name: string;
  region: string;
  status: string;
  style: string;
  fanRead: string;
  watchFor: string;
  keyPlayers: string[];
  dataNote: string;
  colors: [string, string];
};

export type MatchBriefing = {
  id: string;
  title: string;
  kickoff: string;
  stage: string;
  source: string;
  status: string;
  whatToWatch: string[];
};

export type ManualStep = {
  id: string;
  title: string;
  action: string;
  reason: string;
};

export type ViewPreset = {
  id: "fan" | "analyst" | "judge";
  label: string;
  description: string;
  focus: string[];
};

export const teamAtlas: TeamGuide[] = [
  {
    code: "ARG",
    name: "Argentina",
    region: "South America",
    status: "Replay + schedule seed",
    style: "Controlled possession, emotional tempo, fast left-side transitions.",
    fanRead: "Fans watch the creator first: one touch can change the whole match mood.",
    watchFor: "Penalty pressure, Messi-led combinations, and late crowd swings.",
    keyPlayers: ["Lionel Messi", "Angel Di Maria", "Emiliano Martinez"],
    dataNote: "Replay profile is seeded; live score and odds override when TxLINE is authenticated.",
    colors: ["#55a7d8", "#ffffff"],
  },
  {
    code: "FRA",
    name: "France",
    region: "Europe",
    status: "Replay seed",
    style: "Explosive forwards, direct pressure, and sudden late volatility.",
    fanRead: "The match can look calm until France finds space behind the line.",
    watchFor: "Mbappe acceleration, comeback windows, and quick market mood reversals.",
    keyPlayers: ["Kylian Mbappe", "Antoine Griezmann", "Adrien Rabiot"],
    dataNote: "Replay profile is used for judgeable demo moments.",
    colors: ["#233f8f", "#ef476f"],
  },
  {
    code: "GER",
    name: "Germany",
    region: "Europe",
    status: "Replay seed",
    style: "Territory, shot volume, midfield control, and high-possession pressure.",
    fanRead: "Germany's pulse rises through pressure even before the scoreboard moves.",
    watchFor: "Penalty moments, second-ball pressure, and vulnerability after substitutions.",
    keyPlayers: ["Ilkay Gundogan", "Joshua Kimmich", "Jamal Musiala"],
    dataNote: "Replay seed includes group-table context for upset storytelling.",
    colors: ["#1f2933", "#f2c94c"],
  },
  {
    code: "JPN",
    name: "Japan",
    region: "Asia",
    status: "Replay seed",
    style: "Compact defense, bench speed, and sharp late-match transitions.",
    fanRead: "Japan's fan story is patience first, then a fast emotional flip.",
    watchFor: "Impact substitutes, equalizer windows, and underdog momentum.",
    keyPlayers: ["Ritsu Doan", "Takuma Asano", "Daichi Kamada"],
    dataNote: "Replay seed powers the upset-context chapter.",
    colors: ["#d62839", "#ffffff"],
  },
  {
    code: "JOR",
    name: "Jordan",
    region: "Asia",
    status: "TxLINE schedule seed",
    style: "Structured block, quick releases, and set-piece pressure.",
    fanRead: "The key user need is clarity: show schedule seed until live feed is authenticated.",
    watchFor: "Fixture status, early defensive shape, and whether live score data unlocks.",
    keyPlayers: ["Feed roster pending", "Team context pending", "Lineup pending"],
    dataNote: "Fixture 17588325 appears in the TxLINE schedule seed.",
    colors: ["#0f766e", "#be123c"],
  },
  {
    code: "ALG",
    name: "Algeria",
    region: "Africa",
    status: "TxLINE schedule seed",
    style: "Wide carries, pressing bursts, and emotionally loud momentum phases.",
    fanRead: "Fans need quick confirmation that this is schedule data until scores arrive.",
    watchFor: "Fixture status, attack lanes, and authenticated odds availability.",
    keyPlayers: ["Feed roster pending", "Team context pending", "Lineup pending"],
    dataNote: "Fixture 17588326 appears in the TxLINE schedule seed.",
    colors: ["#0b8f55", "#ffffff"],
  },
  {
    code: "AUT",
    name: "Austria",
    region: "Europe",
    status: "TxLINE schedule seed",
    style: "Compact pressing, vertical passing, and disciplined midfield spacing.",
    fanRead: "Austria's card should stay honest: schedule first, live details after token access.",
    watchFor: "Pressing intensity, match clock freshness, and market snapshot timing.",
    keyPlayers: ["Feed roster pending", "Team context pending", "Lineup pending"],
    dataNote: "Fixture 17588326 appears in the TxLINE schedule seed.",
    colors: ["#d62839", "#ffffff"],
  },
  {
    code: "USA",
    name: "United States",
    region: "North America",
    status: "Host reference seed",
    style: "Transition speed, athletic pressure, and wide running.",
    fanRead: "Useful as a host-country reference for global fan testing and language UX.",
    watchFor: "Young-player moments and high-energy crowd phases.",
    keyPlayers: ["Host profile seed", "Roster pending", "Lineup pending"],
    dataNote: "Reference profile only; live use depends on TxLINE fixtures.",
    colors: ["#2563eb", "#b91c1c"],
  },
  {
    code: "MEX",
    name: "Mexico",
    region: "North America",
    status: "Host reference seed",
    style: "High emotion, wide attacks, and fast crowd response.",
    fanRead: "A strong language and community test case for matchday sharing.",
    watchFor: "Momentum after set pieces and crowd-driven pressure shifts.",
    keyPlayers: ["Host profile seed", "Roster pending", "Lineup pending"],
    dataNote: "Reference profile only; live use depends on TxLINE fixtures.",
    colors: ["#0f5132", "#d62839"],
  },
  {
    code: "BRA",
    name: "Brazil",
    region: "South America",
    status: "Fan reference seed",
    style: "Individual flair, quick combinations, and high expectation pressure.",
    fanRead: "Brazil is a good test for pulse spikes that happen before goals.",
    watchFor: "Chance creation, wide dribbles, and crowd confidence swings.",
    keyPlayers: ["Reference seed", "Roster pending", "Lineup pending"],
    dataNote: "Reference profile only; live use depends on TxLINE fixtures.",
    colors: ["#f2c94c", "#0b8f55"],
  },
  {
    code: "ENG",
    name: "England",
    region: "Europe",
    status: "Fan reference seed",
    style: "Structured attacks, set-piece threat, and measured control.",
    fanRead: "England is useful for explaining pressure without overclaiming certainty.",
    watchFor: "Set pieces, midfield control, and late risk management.",
    keyPlayers: ["Reference seed", "Roster pending", "Lineup pending"],
    dataNote: "Reference profile only; live use depends on TxLINE fixtures.",
    colors: ["#ffffff", "#b91c1c"],
  },
  {
    code: "ESP",
    name: "Spain",
    region: "Europe",
    status: "Fan reference seed",
    style: "Possession, rotations, and pressure through control.",
    fanRead: "Spain tests whether the dashboard can explain quiet dominance.",
    watchFor: "Territory, passing rhythm, and subtle odds movement.",
    keyPlayers: ["Reference seed", "Roster pending", "Lineup pending"],
    dataNote: "Reference profile only; live use depends on TxLINE fixtures.",
    colors: ["#f59e0b", "#be123c"],
  },
];

export const matchBriefings: MatchBriefing[] = [
  {
    id: "txline-fixture-17588325",
    title: "Jordan vs Argentina",
    kickoff: "2026-06-28 02:00 UTC",
    stage: "World Cup Group Stage",
    source: "TxLINE schedule seed",
    status: "Token required for live score, events, and odds",
    whatToWatch: [
      "Use this card as a schedule truth anchor, not a fake live match.",
      "When token access is ready, fixture 17588325 is the first live probe target.",
      "The UI should show Live only after score and odds payloads load successfully.",
    ],
  },
  {
    id: "txline-fixture-17588326",
    title: "Algeria vs Austria",
    kickoff: "2026-06-28 05:00 UTC",
    stage: "World Cup Group Stage",
    source: "TxLINE schedule seed",
    status: "Token required for live score, events, and odds",
    whatToWatch: [
      "Use this as the second fixture to verify calendar consistency.",
      "If live data is unavailable, keep Seed labeling visible.",
      "Compare odds freshness against score freshness before calling anything Live.",
    ],
  },
  {
    id: "wc-demo-arg-fra",
    title: "Argentina vs France",
    kickoff: "Replay fixture",
    stage: "Final replay",
    source: "Replay data",
    status: "Judgeable at any time",
    whatToWatch: [
      "Goal swing at 23 minutes.",
      "Late volatility at 80 and 81 minutes.",
      "Market mood is context only, never betting advice.",
    ],
  },
  {
    id: "wc-demo-jpn-ger",
    title: "Germany vs Japan",
    kickoff: "Replay fixture",
    stage: "Group-stage upset replay",
    source: "Replay data",
    status: "Judgeable at any time",
    whatToWatch: [
      "Use the 75 minute chapter to show upset momentum.",
      "Group table explains why the fan story matters.",
      "Player impact highlights substitutes and decisive runners.",
    ],
  },
];

export const manualSteps: ManualStep[] = [
  {
    id: "source",
    title: "1. Check the source label",
    action: "Start with the yellow or green source banner before reading the match.",
    reason: "Fans can immediately tell whether the page is Replay, Seed, Live, Delay, or token-gated.",
  },
  {
    id: "match",
    title: "2. Pick a match path",
    action: "Use Today Board for schedule truth, or Judge Demo chapters for a repeatable replay.",
    reason: "The product stays useful on match days and no-match days without inventing live data.",
  },
  {
    id: "pulse",
    title: "3. Read the pulse, not just the score",
    action: "Look at AI commentary, latest beat, market mood, pressure, and timeline together.",
    reason: "A normal fan gets a plain-language explanation of why the match feels different now.",
  },
  {
    id: "share",
    title: "4. Share only after checking safety",
    action: "Export the fan card after confirming the data state and no-betting boundary.",
    reason: "The dashboard is social-friendly while still avoiding betting and trading advice.",
  },
  {
    id: "live",
    title: "5. Local live verification",
    action: "When a token is available, put it in .env.local and run npm run txline:probe.",
    reason: "Real TxLINE testing must not leak API tokens into the public repo or browser build.",
  },
];

export const viewPresets: ViewPreset[] = [
  {
    id: "fan",
    label: "Fan Mode",
    description: "Best for normal match watching and quick emotional context.",
    focus: ["Score", "Latest beat", "AI read", "Share card"],
  },
  {
    id: "analyst",
    label: "Analyst Mode",
    description: "Best for checking source quality, odds freshness, and event logic.",
    focus: ["Data audit", "Endpoint coverage", "Market movement", "Event stack"],
  },
  {
    id: "judge",
    label: "Judge Mode",
    description: "Best for hackathon review, repeatable demo chapters, and submission readiness.",
    focus: ["Today Board", "Trust Center", "Demo chapters", "Safety boundary"],
  },
];
