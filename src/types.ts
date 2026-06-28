export type MatchMode = "live" | "replay";

export type PlayerProfile = {
  name: string;
  position: string;
  role: string;
  note: string;
};

export type Team = {
  code: string;
  name: string;
  color: string;
  group?: string;
  coach?: string;
  record?: string;
  profile?: string;
  keyPlayers?: PlayerProfile[];
};

export type MatchEventType =
  | "kickoff"
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "odds_shift"
  | "halftime"
  | "fulltime";

export type MatchEvent = {
  id: string;
  minute: number;
  stoppage?: number;
  type: MatchEventType;
  team?: string;
  player?: string;
  title: string;
  description: string;
  homeScore: number;
  awayScore: number;
  marketPulse: number;
};

export type MarketSnapshot = {
  minute: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  sentiment: number;
};

export type MatchData = {
  id: string;
  competition: string;
  venue: string;
  status: "scheduled" | "live" | "finished";
  stage?: string;
  kickoffIso?: string;
  referee?: string;
  dataStatus?: DataStatus;
  qualificationNote?: string;
  home: Team;
  away: Team;
  kickoffLabel: string;
  events: MatchEvent[];
  market: MarketSnapshot[];
  groupTable?: GroupStanding[];
};

export type DataStatus = "Live" | "Delay" | "Replay" | "Seed";

export type TodayMatchCard = {
  id: string;
  label: string;
  homeCode: string;
  awayCode: string;
  kickoffIso: string;
  stage: string;
  dataStatus: DataStatus;
  availability: "available" | "no-live-feed" | "upcoming";
};

export type DataConsistencyState = {
  checkedAtIso: string;
  liveAvailability: "live-match-available" | "no-live-match" | "token-required";
  sourceLabel: string;
  message: string;
  rules: string[];
  today: TodayMatchCard[];
};

export type GroupStanding = {
  teamCode: string;
  played: number;
  points: number;
  goalDiff: number;
  status: string;
};

export type DataSourceState =
  | {
      kind: "replay";
      label: string;
      message: string;
    }
  | {
      kind: "live-ready";
      label: string;
      message: string;
    }
  | {
      kind: "needs-token";
      label: string;
      message: string;
    }
  | {
      kind: "error";
      label: string;
      message: string;
    };

export type MatchLoadResult = {
  match: MatchData;
  source: DataSourceState;
};

export type PulseFrame = {
  minute: number;
  homeScore: number;
  awayScore: number;
  activeEvents: MatchEvent[];
  latestEvent?: MatchEvent;
  market: MarketSnapshot;
  commentary: string;
  insight: {
    headline: string;
    swing: number;
    swingLabel: string;
    eventCount: number;
    nextBeat: string;
  };
  pressure: {
    home: number;
    away: number;
    neutral: number;
  };
};
