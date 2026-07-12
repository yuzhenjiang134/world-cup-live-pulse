export type TxlineSoccerScore = {
  Goals?: number;
  YellowCards?: number;
  RedCards?: number;
  Corners?: number;
};

export type TxlineSoccerTotalScore = {
  H1?: TxlineSoccerScore;
  HT?: TxlineSoccerScore;
  H2?: TxlineSoccerScore;
  ET1?: TxlineSoccerScore;
  ET2?: TxlineSoccerScore;
  PE?: TxlineSoccerScore;
  ETTotal?: TxlineSoccerScore;
  Total?: TxlineSoccerScore;
};

export type TxlineSoccerFixtureScore = {
  Participant1?: TxlineSoccerTotalScore;
  Participant2?: TxlineSoccerTotalScore;
};

export type TxlineSoccerData = {
  Action?: string;
  Color?: string;
  Goal?: boolean;
  Minutes?: number;
  Penalty?: boolean;
  PlayerId?: number;
  PlayerInId?: number;
  PlayerOutId?: number;
  RedCard?: boolean;
  StatusId?: number;
  Type?: string;
  YellowCard?: boolean;
  New?: {
    Minutes?: number;
    PlayerId?: number;
    PlayerInId?: number;
    PlayerOutId?: number;
  };
};

export type TxlineSoccerPartiState = {
  PossibleEvent?: {
    Goal?: boolean;
    Penalty?: boolean;
    Corner?: boolean;
  };
};

export type TxlineSoccerNeutralEvent = {
  RedCard?: boolean;
  YellowCard?: boolean;
  VAR?: boolean;
};

export type NormalizedTxlineScore = {
  fixtureId?: number;
  gameState?: string;
  startTime?: number;
  participant1IsHome?: boolean;
  participant1Id?: number;
  participant2Id?: number;
  action?: string;
  id?: number;
  ts?: number;
  seq?: number;
  statusSoccerId?: unknown;
  scoreSoccer?: TxlineSoccerFixtureScore;
  dataSoccer?: TxlineSoccerData;
  stats?: Record<string, unknown>;
  participant?: number;
  possession?: number;
  possessionType?: unknown;
  parti1StateSoccer?: TxlineSoccerPartiState;
  parti2StateSoccer?: TxlineSoccerPartiState;
  possibleEventSoccer?: TxlineSoccerNeutralEvent;
  clockSeconds?: number;
};

export function normalizeTxlineScoreRecord(payload: unknown): NormalizedTxlineScore {
  if (!isRecord(payload)) {
    return {};
  }

  return {
    fixtureId: readNumber(payload, ["fixtureId", "FixtureId"]),
    gameState: readText(payload, ["gameState", "GameState"]),
    startTime: readNumber(payload, ["startTime", "StartTime"]),
    participant1IsHome: readBoolean(payload, ["participant1IsHome", "Participant1IsHome"]),
    participant1Id: readNumber(payload, ["participant1Id", "Participant1Id"]),
    participant2Id: readNumber(payload, ["participant2Id", "Participant2Id"]),
    action: readText(payload, ["action", "Action"]),
    id: readNumber(payload, ["id", "Id"]),
    ts: readNumber(payload, ["ts", "Ts"]),
    seq: readNumber(payload, ["seq", "Seq"]),
    statusSoccerId: readValue(payload, ["statusSoccerId", "StatusSoccerId", "StatusId"]),
    scoreSoccer: readObject(payload, ["scoreSoccer", "ScoreSoccer", "Score"]) as TxlineSoccerFixtureScore | undefined,
    dataSoccer: readObject(payload, ["dataSoccer", "DataSoccer", "Data"]) as TxlineSoccerData | undefined,
    stats: readObject(payload, ["stats", "Stats"]),
    participant: readNumber(payload, ["participant", "Participant"]),
    possession: readNumber(payload, ["possession", "Possession"]),
    possessionType: readValue(payload, ["possessionType", "PossessionType"]),
    parti1StateSoccer: readObject(payload, ["parti1StateSoccer", "Parti1StateSoccer"]) as TxlineSoccerPartiState | undefined,
    parti2StateSoccer: readObject(payload, ["parti2StateSoccer", "Parti2StateSoccer"]) as TxlineSoccerPartiState | undefined,
    possibleEventSoccer: readObject(payload, ["possibleEventSoccer", "PossibleEventSoccer"]) as TxlineSoccerNeutralEvent | undefined,
    clockSeconds: readNestedNumber(payload, ["clock", "Clock"], ["seconds", "Seconds"]),
  };
}

function readValue(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in payload) return payload[key];
  }
  return undefined;
}

function readText(payload: Record<string, unknown>, keys: string[]) {
  const value = readValue(payload, keys);
  return typeof value === "string" ? value : undefined;
}

function readNumber(payload: Record<string, unknown>, keys: string[]) {
  const value = readValue(payload, keys);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readBoolean(payload: Record<string, unknown>, keys: string[]) {
  const value = readValue(payload, keys);
  return typeof value === "boolean" ? value : undefined;
}

function readObject(payload: Record<string, unknown>, keys: string[]) {
  const value = readValue(payload, keys);
  return isRecord(value) ? value : undefined;
}

function readNestedNumber(payload: Record<string, unknown>, objectKeys: string[], valueKeys: string[]) {
  const object = readObject(payload, objectKeys);
  return object ? readNumber(object, valueKeys) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
