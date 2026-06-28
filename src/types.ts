export type MatchMode = "live" | "replay";

export type Team = {
  code: string;
  name: string;
  color: string;
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
  home: Team;
  away: Team;
  kickoffLabel: string;
  events: MatchEvent[];
  market: MarketSnapshot[];
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
