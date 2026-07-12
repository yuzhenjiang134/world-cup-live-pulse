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

// Historical reference only. Current teams always come from the selected source and schedule.
export const teamAtlas: TeamGuide[] = [
  {
    code: "ARG",
    name: "Argentina",
    region: "South America",
    status: "Historical replay profile",
    style: "Controlled possession, emotional tempo, and fast left-side transitions.",
    fanRead: "A creator-led attack can change the match mood in one action.",
    watchFor: "Penalty pressure, Messi-led combinations, and late crowd swings.",
    keyPlayers: ["Lionel Messi", "Angel Di Maria", "Emiliano Martinez"],
    dataNote: "Player context belongs to the fixed 2022 replay and is not a 2026 roster claim.",
    colors: ["#55a7d8", "#ffffff"],
  },
  {
    code: "FRA",
    name: "France",
    region: "Europe",
    status: "Historical replay profile",
    style: "Explosive forwards, direct pressure, and sudden late volatility.",
    fanRead: "The match can look calm until space opens behind the line.",
    watchFor: "Mbappe acceleration, comeback windows, and quick mood reversals.",
    keyPlayers: ["Kylian Mbappe", "Antoine Griezmann", "Adrien Rabiot"],
    dataNote: "Player context belongs to the fixed 2022 replay and is not a 2026 roster claim.",
    colors: ["#233f8f", "#ef476f"],
  },
  {
    code: "GER",
    name: "Germany",
    region: "Europe",
    status: "Historical replay profile",
    style: "Territory, shot volume, midfield control, and high-possession pressure.",
    fanRead: "Pressure can rise well before the scoreboard changes.",
    watchFor: "Second balls, penalty moments, and vulnerability after substitutions.",
    keyPlayers: ["Ilkay Gundogan", "Joshua Kimmich", "Jamal Musiala"],
    dataNote: "Player context belongs to the fixed 2022 replay and is not a 2026 roster claim.",
    colors: ["#1f2933", "#f2c94c"],
  },
  {
    code: "JPN",
    name: "Japan",
    region: "Asia",
    status: "Historical replay profile",
    style: "Compact defense, bench speed, and sharp late-match transitions.",
    fanRead: "Patience can become a fast emotional flip late in the match.",
    watchFor: "Impact substitutes, equalizer windows, and underdog momentum.",
    keyPlayers: ["Ritsu Doan", "Takuma Asano", "Daichi Kamada"],
    dataNote: "Player context belongs to the fixed 2022 replay and is not a 2026 roster claim.",
    colors: ["#d62839", "#ffffff"],
  },
];

export const matchBriefings: MatchBriefing[] = [
  {
    id: "txline-fixture-18213979",
    title: "Norway vs England",
    kickoff: "TxLINE fixture snapshot",
    stage: "World Cup",
    source: "TxLINE CompetitionId 72",
    status: "Authenticated score and odds snapshots available",
    whatToWatch: [
      "Use the checked time and source state before reading the score.",
      "Official odds may be temporarily empty and must never be fabricated.",
      "The score challenge settles only after a verified final result.",
    ],
  },
  {
    id: "txline-fixture-18222446",
    title: "Argentina vs Switzerland",
    kickoff: "TxLINE fixture snapshot",
    stage: "World Cup",
    source: "TxLINE CompetitionId 72",
    status: "Schedule context until selected",
    whatToWatch: ["Keep current source teams ahead of historical reference data."],
  },
  {
    id: "txline-fixture-18237038",
    title: "France vs Spain",
    kickoff: "TxLINE fixture snapshot",
    stage: "World Cup",
    source: "TxLINE CompetitionId 72",
    status: "Schedule context until selected",
    whatToWatch: ["Do not mix Friendlies CompetitionId 430 into this schedule."],
  },
  {
    id: "wc-demo-arg-fra",
    title: "Argentina vs France",
    kickoff: "Historical replay",
    stage: "2022 final replay",
    source: "Deterministic replay data",
    status: "Judgeable at any time",
    whatToWatch: ["Goals, cards, extra time, pulse swings, and final-score settlement."],
  },
  {
    id: "wc-demo-jpn-ger",
    title: "Germany vs Japan",
    kickoff: "Historical replay",
    stage: "2022 group replay",
    source: "Deterministic replay data",
    status: "Judgeable at any time",
    whatToWatch: ["Late upset momentum, substitutes, and group context."],
  },
];

export const manualSteps: ManualStep[] = [
  {
    id: "source",
    title: "1. Check source and freshness",
    action: "Read the source label and checked time before the score.",
    reason: "Live, Delay, Seed, and Replay are intentionally different states.",
  },
  {
    id: "challenge",
    title: "2. Enter the score challenge",
    action: "Choose a score, review the 50-point cost, then lock once.",
    reason: "The core fan loop is explicit, local, and non-cash.",
  },
  {
    id: "moments",
    title: "3. Follow key moments",
    action: "Use events, pulse, commentary, and schedule context together.",
    reason: "Fans understand why the match changed, not only the score.",
  },
  {
    id: "replay",
    title: "4. Use historical replay",
    action: "Open a replay when no current match can demonstrate the full flow.",
    reason: "Judges can repeat the experience without confusing history with live data.",
  },
  {
    id: "verify",
    title: "5. Verify locally",
    action: "Keep credentials in .env.local and run the probe and browser tests.",
    reason: "Real TxLINE verification must not leak secrets into the public bundle.",
  },
];

// Retained for the archived dashboard component; the production MatchdayApp uses direct navigation.
export const viewPresets: ViewPreset[] = [
  {
    id: "fan",
    label: "Fan workflow",
    description: "Score challenge, match pulse, events, and replay.",
    focus: ["Score challenge", "Key moments", "Commentary", "Replay"],
  },
  {
    id: "analyst",
    label: "Source review",
    description: "Data state, freshness, competition scope, and odds availability.",
    focus: ["CompetitionId 72", "Checked time", "Source state", "Empty odds"],
  },
  {
    id: "judge",
    label: "Submission review",
    description: "Repeatable fan flow and evidence against the published criteria.",
    focus: ["Accessibility", "Responsiveness", "Originality", "Completeness"],
  },
];
