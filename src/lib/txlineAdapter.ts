import { dataConsistencyState } from "../data/matchCalendar";
import { getReplayMatch, replayMatches } from "../data/replayMatch";
import type { MatchData, MatchEvent, MatchEventType, MatchLoadResult, MatchScheduleItem, MarketSnapshot, Team } from "../types";
import { filterTxlineWorldCupFixtures, txlineWorldCupCompetitionId } from "./worldCupScope";
import {
  normalizeTxlineScoreRecord,
  type NormalizedTxlineScore as TxlineScore,
  type TxlineSoccerTotalScore,
} from "./txlineScoreNormalizer";

const defaultApiBase = "https://txline-dev.txodds.com";
const requestTimeoutMs = 12_000;
const publicWorldCupScoreboardUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

type TxlineAdapterOptions = {
  apiBase?: string;
  apiKey?: string;
  apiToken?: string;
  asOfMs?: string;
  competitionId?: string;
  fixtureId?: string;
  proxyBase?: string;
  replayMatchId?: string;
  sessionJwt?: string;
  startEpochDay?: string;
};

type TxlineFixture = {
  Ts?: number;
  StartTime?: number;
  Competition?: string;
  CompetitionId?: number;
  FixtureGroupId?: number;
  Participant1Id?: number;
  Participant1?: string;
  Participant2Id?: number;
  Participant2?: string;
  FixtureId?: number;
  Participant1IsHome?: boolean;
};


type TxlineOdds = {
  FixtureId?: number;
  MessageId?: string;
  Ts?: number;
  Bookmaker?: string;
  BookmakerId?: number;
  SuperOddsType?: string;
  GameState?: string;
  InRunning?: boolean;
  MarketParameters?: string;
  MarketPeriod?: string;
  PriceNames?: string[];
  Prices?: number[];
  Pct?: string[];
};

type TxlineLivePayload = {
  fixture?: TxlineFixture;
  fixtureId: number;
  odds: TxlineOdds[];
  replayMatch: MatchData;
  scores: TxlineScore[];
};

type EspnScoreboardPayload = {
  leagues?: EspnLeague[];
  day?: {
    date?: string;
  };
  events?: EspnEvent[];
};

type EspnLeague = {
  name?: string;
  displayName?: string;
  abbreviation?: string;
  season?: {
    year?: number;
    displayName?: string;
    type?: {
      name?: string;
      abbreviation?: string;
    };
  };
};

type EspnEvent = {
  id?: string;
  name?: string;
  shortName?: string;
  date?: string;
  season?: {
    year?: number;
    slug?: string;
  };
  competitions?: EspnCompetition[];
};

type EspnCompetition = {
  id?: string;
  date?: string;
  competitors?: EspnCompetitor[];
  details?: EspnDetail[];
  status?: EspnStatus;
  venue?: {
    displayName?: string;
    fullName?: string;
    address?: {
      city?: string;
      country?: string;
    };
  };
  altGameNote?: string;
  broadcasts?: Array<{
    names?: string[];
  }>;
};

type EspnCompetitor = {
  homeAway?: "home" | "away";
  score?: string;
  winner?: boolean;
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    name?: string;
    location?: string;
    color?: string;
    alternateColor?: string;
  };
  statistics?: Array<{
    name?: string;
    abbreviation?: string;
    displayValue?: string;
  }>;
};

type EspnStatus = {
  clock?: number;
  displayClock?: string;
  type?: {
    state?: "pre" | "in" | "post";
    completed?: boolean;
    description?: string;
    detail?: string;
    shortDetail?: string;
  };
};

type EspnDetail = {
  type?: {
    text?: string;
  };
  clock?: {
    value?: number;
    displayValue?: string;
  };
  team?: {
    id?: string;
  };
  scoreValue?: number;
  scoringPlay?: boolean;
  redCard?: boolean;
  yellowCard?: boolean;
  penaltyKick?: boolean;
  ownGoal?: boolean;
  athletesInvolved?: Array<{
    displayName?: string;
    fullName?: string;
    shortName?: string;
  }>;
};

type RequestHeaders = {
  Authorization: string;
  "X-Api-Token": string;
};

class TxlineHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    body: string,
  ) {
    super(`TxLINE ${endpoint} failed with HTTP ${status}${body ? `: ${body}` : ""}`);
  }
}

export async function loadMatchData(
  mode: "live" | "replay",
  options: TxlineAdapterOptions = {},
): Promise<MatchLoadResult> {
  const replayMatch = getReplayMatch(options.replayMatchId);
  const checkedAtIso = new Date().toISOString();

  if (mode === "replay") {
    return {
      match: replayMatch,
      schedule: replayMatches.map((candidate) => toScheduleItem(candidate, "Replay fixture")),
      source: {
        kind: "replay",
        label: "Replay running",
        message: "Using a fixed replay fixture so judges can evaluate the demo at any time.",
        checkedAtIso,
      },
    };
  }

  const apiToken = cleanSecret(options.apiToken ?? options.apiKey);
  const apiBase = normalizeApiBase(options.apiBase);
  const proxyBase = normalizeProxyBase(options.proxyBase);
  const fixtureId = resolveFixtureId(options.fixtureId);

  if (proxyBase) {
    return loadViaProxy(proxyBase, replayMatch, checkedAtIso, fixtureId, options);
  }

  if (!apiToken) {
    return loadPublicScoreboardFallback(replayMatch, checkedAtIso, fixtureId);
  }

  try {
    const sessionJwt = await resolveSessionJwt(apiBase, options.sessionJwt);
    const headers = {
      Authorization: `Bearer ${sessionJwt}`,
      "X-Api-Token": apiToken,
    };

    const fixtureQuery = {
      startEpochDay: parseOptionalInteger(options.startEpochDay),
      competitionId: parseOptionalInteger(options.competitionId) ?? txlineWorldCupCompetitionId,
    };
    const fixtures = filterTxlineWorldCupFixtures(
      toArray<TxlineFixture>(await requestJson(apiBase, "/api/fixtures/snapshot", headers, fixtureQuery)),
    );
    const selectedFixture = selectFixture(fixtures, fixtureId);
    const liveFixtureId = selectedFixture?.FixtureId;

    if (!liveFixtureId) {
      throw new Error(
        "No TxLINE fixture id is configured and the fixtures snapshot did not contain a selectable fixture.",
      );
    }

    const scorePath = `/api/scores/snapshot/${liveFixtureId}`;
    const oddsPath = `/api/odds/snapshot/${liveFixtureId}`;
    const snapshotQuery = { asOf: parseOptionalInteger(options.asOfMs) };
    const [scoreResult, oddsResult] = await Promise.allSettled([
      requestJson(apiBase, scorePath, headers, snapshotQuery),
      requestJson(apiBase, oddsPath, headers, snapshotQuery),
    ]);

    const scores = scoreResult.status === "fulfilled"
      ? toArray<unknown>(scoreResult.value).map(normalizeTxlineScoreRecord)
      : [];
    const odds = oddsResult.status === "fulfilled" ? toArray<TxlineOdds>(oddsResult.value) : [];
    const match = normalizeTxlineMatch({
      fixture: selectedFixture,
      fixtureId: liveFixtureId,
      odds,
      replayMatch,
      scores,
    });
    const livePayloadCount = scores.length + odds.length;
    const partialErrors = [
      scoreResult.status === "rejected" ? toSafeErrorMessage(scoreResult.reason) : "",
      oddsResult.status === "rejected" ? toSafeErrorMessage(oddsResult.reason) : "",
    ].filter(Boolean);

    return {
      match,
      schedule: buildTxlineSchedule(fixtures, match),
      source: {
        kind: "live-ready",
        label: livePayloadCount ? "TxLINE delayed feed loaded" : "TxLINE fixture loaded",
        message: buildLiveReadyMessage(liveFixtureId, scores.length, odds.length, partialErrors),
        checkedAtIso,
        endpoint: livePayloadCount ? `${scorePath} + ${oddsPath}` : "/api/fixtures/snapshot",
        fixtureId: String(liveFixtureId),
      },
    };
  } catch (error) {
    return {
      match: {
        ...replayMatch,
        kickoffLabel: "Replay fallback",
        dataStatus: "Replay",
      },
      schedule: replayMatches.map((candidate) => toScheduleItem(candidate, "Replay fixture")),
      source: {
        kind: "error",
        label: "TxLINE live source unavailable",
        message: `${toSafeErrorMessage(error)} Replay fallback is active so the demo remains judgeable.`,
        checkedAtIso,
        endpoint: "/api/fixtures/snapshot",
        fixtureId: fixtureId ? String(fixtureId) : undefined,
      },
    };
  }
}

async function loadPublicScoreboardFallback(
  replayMatch: MatchData,
  checkedAtIso: string,
  fixtureId?: number,
): Promise<MatchLoadResult> {
  try {
    const payload = (await requestAbsoluteJson(publicWorldCupScoreboardUrl)) as EspnScoreboardPayload;
    const match = normalizeEspnScoreboardMatch(payload, replayMatch);

    return {
      match,
      schedule: buildEspnSchedule(payload),
      source: {
        kind: "live-ready",
        label: "Free public scoreboard loaded",
        message:
          "Loaded ESPN's no-token FIFA World Cup scoreboard as a public fallback signal. TxLINE remains the sponsor source for authenticated hackathon data.",
        checkedAtIso,
        endpoint: publicWorldCupScoreboardUrl,
        fixtureId: match.id,
      },
    };
  } catch (error) {
    const tokenResult = buildNeedsTokenResult(replayMatch, checkedAtIso, fixtureId);

    return {
      ...tokenResult,
      schedule: tokenResult.schedule ?? replayMatches.map((candidate) => toScheduleItem(candidate, "Replay fixture")),
      source: {
        ...tokenResult.source,
        message: `${tokenResult.source.message} Free public scoreboard fallback also failed: ${toSafeErrorMessage(error)}`,
      },
    };
  }
}

async function loadViaProxy(
  proxyBase: string,
  replayMatch: MatchData,
  checkedAtIso: string,
  fixtureId: number | undefined,
  options: TxlineAdapterOptions,
): Promise<MatchLoadResult> {
  try {
    const fixtureQuery = {
      startEpochDay: parseOptionalInteger(options.startEpochDay),
      competitionId: parseOptionalInteger(options.competitionId) ?? txlineWorldCupCompetitionId,
    };
    const fixtures = filterTxlineWorldCupFixtures(
      toArray<TxlineFixture>(await requestProxyJson(proxyBase, "/api/fixtures/snapshot", fixtureQuery)),
    );
    const selectedFixture = selectFixture(fixtures, fixtureId);
    const liveFixtureId = selectedFixture?.FixtureId;

    if (!liveFixtureId) {
      throw new Error(
        "No fixture id is configured and the TxLINE proxy fixture snapshot did not contain a selectable fixture.",
      );
    }

    const scorePath = `/api/scores/snapshot/${liveFixtureId}`;
    const oddsPath = `/api/odds/snapshot/${liveFixtureId}`;
    const snapshotQuery = { asOf: parseOptionalInteger(options.asOfMs) };
    const [scoreResult, oddsResult] = await Promise.allSettled([
      requestProxyJson(proxyBase, scorePath, snapshotQuery),
      requestProxyJson(proxyBase, oddsPath, snapshotQuery),
    ]);
    const scores = scoreResult.status === "fulfilled"
      ? toArray<unknown>(scoreResult.value).map(normalizeTxlineScoreRecord)
      : [];
    const odds = oddsResult.status === "fulfilled" ? toArray<TxlineOdds>(oddsResult.value) : [];
    const match = normalizeTxlineMatch({
      fixture: selectedFixture,
      fixtureId: liveFixtureId,
      odds,
      replayMatch,
      scores,
    });
    const livePayloadCount = scores.length + odds.length;
    const partialErrors = [
      scoreResult.status === "rejected" ? toSafeErrorMessage(scoreResult.reason) : "",
      oddsResult.status === "rejected" ? toSafeErrorMessage(oddsResult.reason) : "",
    ].filter(Boolean);

    return {
      match,
      schedule: buildTxlineSchedule(fixtures, match),
      source: {
        kind: "live-ready",
        label: livePayloadCount ? "TxLINE proxy delayed feed loaded" : "TxLINE proxy fixture loaded",
        message: buildLiveReadyMessage(liveFixtureId, scores.length, odds.length, partialErrors),
        checkedAtIso,
        endpoint: livePayloadCount ? `${scorePath} + ${oddsPath}` : "/api/fixtures/snapshot",
        fixtureId: String(liveFixtureId),
      },
    };
  } catch (error) {
    return {
      match: {
        ...replayMatch,
        kickoffLabel: "Replay fallback",
        dataStatus: "Replay",
      },
      schedule: replayMatches.map((candidate) => toScheduleItem(candidate, "Replay fixture")),
      source: {
        kind: "error",
        label: "TxLINE proxy unavailable",
        message: `${toSafeErrorMessage(error)} Replay fallback is active so the demo remains judgeable.`,
        checkedAtIso,
        endpoint: "VITE_TXLINE_PROXY_BASE",
        fixtureId: fixtureId ? String(fixtureId) : undefined,
      },
    };
  }
}

function buildNeedsTokenResult(
  replayMatch: MatchData,
  checkedAtIso: string,
  fixtureId?: number,
): MatchLoadResult {
  return {
    match: {
      ...replayMatch,
      kickoffLabel: "Live updates unavailable",
      status: "scheduled",
      dataStatus: "Seed",
    },
    schedule: buildSeedSchedule(),
    source: {
      kind: "needs-token",
      label: "Live updates unavailable",
      message:
        "Verified replay and scheduled match information remain available while live updates are unavailable.",
      checkedAtIso,
      endpoint: "/api/fixtures/snapshot + /api/scores/snapshot/{fixtureId} + /api/odds/snapshot/{fixtureId}",
      fixtureId: fixtureId ? String(fixtureId) : undefined,
    },
  };
}

async function resolveSessionJwt(apiBase: string, configuredJwt?: string) {
  const sessionJwt = cleanSecret(configuredJwt);

  if (sessionJwt) {
    return sessionJwt;
  }

  const payload = await requestJson(apiBase, "/auth/guest/start", undefined, undefined, "POST");
  const token = readString(payload, ["token", "jwt", "accessToken", "access_token"]);

  if (!token) {
    throw new Error("TxLINE guest session did not return a token field.");
  }

  return token;
}

async function requestJson(
  apiBase: string,
  endpoint: string,
  headers?: RequestHeaders,
  query?: Record<string, number | undefined>,
  method = "GET",
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const url = buildUrl(apiBase, endpoint, query);
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(headers ?? {}),
      },
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new TxlineHttpError(response.status, endpoint, truncate(text, 220));
    }

    if (!text) {
      return null;
    }

    return parseMaybeJson(text);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function requestProxyJson(
  proxyBase: string,
  endpoint: string,
  query?: Record<string, number | undefined>,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const url = buildProxyUrl(proxyBase, endpoint, query);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new TxlineHttpError(response.status, endpoint, truncate(text, 220));
    }

    if (!text) {
      return null;
    }

    return parseMaybeJson(text);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function requestAbsoluteJson(urlString: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(urlString, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new TxlineHttpError(response.status, urlString, truncate(text, 220));
    }

    return text ? parseMaybeJson(text) : null;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function normalizeEspnScoreboardMatch(payload: EspnScoreboardPayload, replayMatch: MatchData): MatchData {
  const league = payload.leagues?.[0];
  const event = selectEspnEvent(payload.events ?? []);
  const competition = event?.competitions?.[0];

  if (!event || !competition) {
    throw new Error("ESPN public scoreboard did not return a selectable World Cup event.");
  }

  const competitors = competition.competitors ?? [];
  const homeCompetitor = competitors.find((item) => item.homeAway === "home") ?? competitors[0];
  const awayCompetitor = competitors.find((item) => item.homeAway === "away") ?? competitors.find((item) => item !== homeCompetitor);

  if (!homeCompetitor || !awayCompetitor) {
    throw new Error("ESPN public scoreboard event did not contain two teams.");
  }

  const home = buildEspnTeam(homeCompetitor, "HOME");
  const away = buildEspnTeam(awayCompetitor, "AWAY");
  const status = normalizeEspnStatus(competition.status);
  const kickoffIso = competition.date ?? event.date;
  const score = {
    homeScore: parseScore(homeCompetitor.score),
    awayScore: parseScore(awayCompetitor.score),
  };
  const events = normalizeEspnEvents(competition.details ?? [], competition.status, home, away, score, {
    homeId: homeCompetitor.team?.id,
    awayId: awayCompetitor.team?.id,
  });
  const market = buildPublicMarket(events, score);
  const venue = formatEspnVenue(competition.venue);
  const stage = competition.altGameNote ?? league?.season?.type?.name ?? event.season?.slug ?? "FIFA World Cup";

  return {
    ...replayMatch,
    id: `espn-${event.id ?? competition.id ?? "world-cup"}`,
    competition: league?.season?.displayName ?? league?.name ?? "FIFA World Cup",
    venue,
    status,
    stage,
    kickoffIso,
    referee: "Public scoreboard feed",
    dataStatus: status === "scheduled" ? "Seed" : "Delay",
    marketSource: "derived-from-score",
    qualificationNote:
      "No-token public scoreboard signal. Use for fan context and demo reliability; TxLINE remains the sponsor-verified source when an official token is active.",
    kickoffLabel: status === "scheduled" ? "ESPN public fixture" : "ESPN public scoreboard",
    home,
    away,
    events,
    groupTable: undefined,
    market,
  };
}

function selectEspnEvent(events: EspnEvent[]) {
  const withCompetition = events.filter((event) => event.competitions?.[0]?.competitors?.length);
  const live = withCompetition.find((event) => event.competitions?.[0]?.status?.type?.state === "in");

  if (live) {
    return live;
  }

  const upcoming = withCompetition.find((event) => event.competitions?.[0]?.status?.type?.state === "pre");

  if (upcoming) {
    return upcoming;
  }

  return withCompetition
    .sort(
      (first, second) =>
        Math.abs(new Date(second.competitions?.[0]?.date ?? second.date ?? 0).getTime() - Date.now()) -
        Math.abs(new Date(first.competitions?.[0]?.date ?? first.date ?? 0).getTime() - Date.now()),
    )
    .at(-1);
}

function normalizeEspnEvents(
  details: EspnDetail[],
  status: EspnStatus | undefined,
  home: Team,
  away: Team,
  finalScore: { homeScore: number; awayScore: number },
  teamIds: { homeId?: string; awayId?: string },
): MatchEvent[] {
  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [
    {
      id: "public-kickoff",
      minute: 1,
      type: "kickoff",
      title: "Public scoreboard opened",
      description: "No-token public scoreboard signal is active for this World Cup fixture.",
      homeScore: 0,
      awayScore: 0,
      marketPulse: 50,
    },
  ];

  for (const detail of [...details].sort(compareEspnDetail)) {
    const type = inferEspnDetailType(detail);

    if (!type) {
      continue;
    }

    const teamCode = resolveEspnTeamCode(detail, home, away, teamIds);

    if (type === "goal") {
      if (teamCode === home.code) {
        homeScore += 1;
      } else if (teamCode === away.code) {
        awayScore += 1;
      }
    }

    const minute = minuteFromEspnDetail(detail);
    const player = detail.athletesInvolved?.[0]?.displayName ?? detail.athletesInvolved?.[0]?.fullName;
    const title = buildEventTitle(type, teamCode);

    events.push({
      id: `public-${minute}-${type}-${events.length}`,
      minute,
      type,
      team: teamCode,
      player,
      penalty: Boolean(detail.penaltyKick),
      title,
      description: `${title} from the public World Cup scoreboard${player ? ` involving ${player}` : ""}.`,
      homeScore,
      awayScore,
      marketPulse: inferMarketPulseFromScore(homeScore, awayScore),
    });
  }

  if (status?.type?.completed || status?.type?.state === "post") {
    events.push({
      id: "public-fulltime",
      minute: minuteFromDisplayClock(status.displayClock) ?? 90,
      type: "fulltime",
      title: "Full time",
      description: "Final public scoreboard result.",
      homeScore: finalScore.homeScore,
      awayScore: finalScore.awayScore,
      marketPulse: inferMarketPulseFromScore(finalScore.homeScore, finalScore.awayScore),
    });
  } else if (events.length === 1 && (finalScore.homeScore > 0 || finalScore.awayScore > 0)) {
    events.push({
      id: "public-score-snapshot",
      minute: minuteFromDisplayClock(status?.displayClock) ?? 1,
      type: "score_update",
      title: "Public score snapshot",
      description: "Current public scoreboard score for this fixture.",
      homeScore: finalScore.homeScore,
      awayScore: finalScore.awayScore,
      marketPulse: inferMarketPulseFromScore(finalScore.homeScore, finalScore.awayScore),
    });
  }

  return dedupeEvents(events).sort((first, second) => first.minute - second.minute);
}

function normalizeTxlineMatch(payload: TxlineLivePayload): MatchData {
  const seed = findScheduleSeed(payload.fixtureId);
  const latestScore = latestByTime(payload.scores);
  const participant1IsHome =
    payload.fixture?.Participant1IsHome ?? latestScore?.participant1IsHome ?? true;
  const participant1Name = payload.fixture?.Participant1 ?? seedParticipantName(seed, 1) ?? "Participant 1";
  const participant2Name = payload.fixture?.Participant2 ?? seedParticipantName(seed, 2) ?? "Participant 2";
  const participant1 = buildTeam(participant1Name, seedParticipantCode(seed, 1));
  const participant2 = buildTeam(participant2Name, seedParticipantCode(seed, 2));
  const home = participant1IsHome ? participant1 : participant2;
  const away = participant1IsHome ? participant2 : participant1;
  const kickoffIso = toIso(payload.fixture?.StartTime ?? latestScore?.startTime ?? seed?.kickoffIso);
  const score = extractScore(latestScore, participant1IsHome);
  const events = normalizeScoreEvents(payload.scores, participant1IsHome, home, away);
  const market = normalizeOddsSnapshots(payload.odds, kickoffIso, events, score);
  const status = inferMatchStatus(latestScore, kickoffIso, events.length);
  const hasLivePayload = payload.scores.length > 0 || payload.odds.length > 0;

  return {
    ...payload.replayMatch,
    id: `txline-${payload.fixtureId}`,
    competition: payload.fixture?.Competition ?? seed?.stage ?? "TxLINE World Cup",
    venue: "TxLINE official fixture feed",
    status,
    stage: seed?.stage ?? payload.fixture?.Competition ?? "TxLINE live fixture",
    kickoffIso,
    referee: undefined,
    dataStatus: hasLivePayload ? "Delay" : "Seed",
    marketSource: payload.odds.length ? "official-odds" : "derived-from-score",
    qualificationNote:
      "TxLINE data is used as fan context only. This product does not place bets, give trading advice, or handle wallet secrets.",
    kickoffLabel: hasLivePayload ? "TxLINE authenticated polling feed" : "TxLINE fixture seed",
    home,
    away,
    events,
    groupTable: undefined,
    market,
  };
}

function toScheduleItem(match: MatchData, sourceLabel: string): MatchScheduleItem {
  const finalEvent = match.events.at(-1);
  const goalCount = match.events.filter((event) => event.type === "goal").length;
  const cardCount = match.events.filter((event) => event.type === "yellow_card" || event.type === "red_card").length;
  const extraTime = match.events.some((event) => event.minute > 90);
  return {
    id: match.id,
    home: match.home,
    away: match.away,
    kickoffIso: match.kickoffIso,
    stage: match.stage ?? match.competition,
    status: match.status,
    dataStatus: match.dataStatus ?? "Replay",
    sourceLabel,
    homeScore: finalEvent?.homeScore,
    awayScore: finalEvent?.awayScore,
    advancementNote: match.groupTable?.length ? "Group table available" : match.qualificationNote,
    eventCount: match.events.length,
    goalCount,
    cardCount,
    extraTime,
  };
}

function buildSeedSchedule(): MatchScheduleItem[] {
  return dataConsistencyState.today
    .filter((item) => item.homeCode && item.awayCode)
    .map((item) => ({
      id: item.id,
      fixtureId: item.fixtureId,
      home: buildTeam(teamNamesByCode[item.homeCode] ?? item.homeCode, item.homeCode),
      away: buildTeam(teamNamesByCode[item.awayCode] ?? item.awayCode, item.awayCode),
      kickoffIso: item.kickoffIso,
      stage: item.stage,
      status: item.availability === "available" ? "finished" : "scheduled",
      dataStatus: item.dataStatus,
      sourceLabel: item.sourceLabel ?? "Schedule snapshot",
      advancementNote: item.statusNote ?? item.coverage,
    }));
}

function buildTxlineSchedule(fixtures: TxlineFixture[], selectedMatch: MatchData): MatchScheduleItem[] {
  const cards: MatchScheduleItem[] = fixtures
    .filter((fixture) => typeof fixture.FixtureId === "number")
    .map((fixture) => {
      const seed = findScheduleSeed(fixture.FixtureId as number);
      const participant1 = buildTeam(
        fixture.Participant1 ?? seed?.homeCode ?? "Participant 1",
        seed?.homeCode ?? inferTeamCode(fixture.Participant1 ?? "Participant 1"),
      );
      const participant2 = buildTeam(
        fixture.Participant2 ?? seed?.awayCode ?? "Participant 2",
        seed?.awayCode ?? inferTeamCode(fixture.Participant2 ?? "Participant 2"),
      );
      const participant1IsHome = fixture.Participant1IsHome ?? true;
      const kickoffIso = toIso(fixture.StartTime);
      return {
        id: `txline-${fixture.FixtureId}`,
        fixtureId: fixture.FixtureId,
        home: participant1IsHome ? participant1 : participant2,
        away: participant1IsHome ? participant2 : participant1,
        kickoffIso,
        stage: fixture.Competition ?? seed?.stage ?? "TxLINE World Cup fixture",
        status: "scheduled" as const,
        dataStatus: "Seed" as const,
        sourceLabel: "TxLINE fixture feed",
        advancementNote: "Live score, events and odds are loaded separately for the selected fixture.",
      };
    });

  const merged = cards.map((card) => (card.id === selectedMatch.id ? toScheduleItem(selectedMatch, "TxLINE score feed") : card));
  return merged.length ? merged.sort(compareScheduleItems) : buildSeedSchedule();
}

function buildEspnSchedule(payload: EspnScoreboardPayload): MatchScheduleItem[] {
  const league = payload.leagues?.[0];
  return (payload.events ?? []).flatMap((event) => {
    const competition = event.competitions?.[0];
    if (!competition) return [];
    const competitors = competition.competitors ?? [];
    const homeCompetitor = competitors.find((item) => item.homeAway === "home") ?? competitors[0];
    const awayCompetitor = competitors.find((item) => item.homeAway === "away") ?? competitors.find((item) => item !== homeCompetitor);
    if (!homeCompetitor || !awayCompetitor) return [];
    const home = buildEspnTeam(homeCompetitor, "HOME");
    const away = buildEspnTeam(awayCompetitor, "AWAY");
    const status = normalizeEspnStatus(competition.status);
    return [{
      id: `espn-${event.id ?? competition.id ?? `${home.code}-${away.code}`}`,
      home,
      away,
      kickoffIso: competition.date ?? event.date,
      stage: competition.altGameNote ?? league?.season?.type?.name ?? "FIFA World Cup",
      status,
      dataStatus: (status === "scheduled" ? "Seed" : "Delay") as MatchScheduleItem["dataStatus"],
      sourceLabel: "ESPN public scoreboard",
      homeScore: parseScore(homeCompetitor.score),
      awayScore: parseScore(awayCompetitor.score),
      advancementNote: competition.altGameNote ?? "Official standings and advancement context may be separate from the scoreboard feed.",
    }];
  }).sort(compareScheduleItems);
}

function compareScheduleItems(first: MatchScheduleItem, second: MatchScheduleItem) {
  return new Date(first.kickoffIso ?? 0).getTime() - new Date(second.kickoffIso ?? 0).getTime();
}

function buildPublicMarket(events: MatchEvent[], score: { homeScore: number; awayScore: number }): MarketSnapshot[] {
  if (events.length) {
    return dedupeMarket(
      events.map((event) => ({
        minute: event.minute,
        homeWin: score.homeScore > score.awayScore ? 1.7 : 2.45,
        draw: score.homeScore === score.awayScore ? 2.9 : 3.6,
        awayWin: score.awayScore > score.homeScore ? 1.7 : 2.45,
        sentiment: event.marketPulse,
      })),
    );
  }

  return [
    {
      minute: 1,
      homeWin: 2.45,
      draw: 3.2,
      awayWin: 2.45,
      sentiment: inferMarketPulseFromScore(score.homeScore, score.awayScore),
    },
  ];
}

function normalizeEspnStatus(status: EspnStatus | undefined): MatchData["status"] {
  if (status?.type?.completed || status?.type?.state === "post") {
    return "finished";
  }

  if (status?.type?.state === "in") {
    return "live";
  }

  return "scheduled";
}

function formatEspnVenue(venue: EspnCompetition["venue"] | undefined) {
  const name = venue?.fullName ?? venue?.displayName;
  const city = venue?.address?.city;
  const country = venue?.address?.country;

  return [name, city, country].filter(Boolean).join(", ") || "Public scoreboard venue";
}

function compareEspnDetail(first: EspnDetail, second: EspnDetail) {
  return minuteFromEspnDetail(first) - minuteFromEspnDetail(second);
}

function inferEspnDetailType(detail: EspnDetail): MatchEventType | null {
  const text = `${detail.type?.text ?? ""}`.toLowerCase();

  if (detail.scoringPlay || text.includes("goal")) {
    return "goal";
  }

  if (detail.redCard || text.includes("red card")) {
    return "red_card";
  }

  if (detail.yellowCard || text.includes("yellow card")) {
    return "yellow_card";
  }

  if (text.includes("substitution")) {
    return "substitution";
  }

  if (text.includes("half")) {
    return "halftime";
  }

  return null;
}

function resolveEspnTeamCode(
  detail: EspnDetail,
  home: Team,
  away: Team,
  teamIds: { homeId?: string; awayId?: string },
) {
  if (!detail.team?.id) {
    return undefined;
  }

  if (detail.team.id === teamIds.homeId) {
    return home.code;
  }

  if (detail.team.id === teamIds.awayId) {
    return away.code;
  }

  return undefined;
}

function minuteFromEspnDetail(detail: EspnDetail) {
  const displayMinute = minuteFromDisplayClock(detail.clock?.displayValue);

  if (displayMinute) {
    return displayMinute;
  }

  if (typeof detail.clock?.value === "number" && Number.isFinite(detail.clock.value)) {
    return Math.max(1, Math.min(130, Math.round(detail.clock.value / 60)));
  }

  return 1;
}

function minuteFromDisplayClock(displayClock: string | undefined) {
  if (!displayClock) {
    return undefined;
  }

  const match = displayClock.match(/\d+/);

  if (!match) {
    return undefined;
  }

  const minute = Number(match[0]);
  return Number.isFinite(minute) ? Math.max(1, Math.min(130, minute)) : undefined;
}

function parseScore(score: string | undefined) {
  const parsed = Number(score);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readStat(competitor: EspnCompetitor, names: string[]) {
  const normalized = names.map((name) => name.toLowerCase());
  const stat = competitor.statistics?.find((item) =>
    normalized.includes(`${item.name ?? ""}`.toLowerCase()) || normalized.includes(`${item.abbreviation ?? ""}`.toLowerCase()),
  );
  const numeric = Number(stat?.displayValue);

  return Number.isFinite(numeric) ? numeric : undefined;
}

function buildEspnTeam(competitor: EspnCompetitor, fallbackCode: string): Team {
  const code = competitor.team?.abbreviation ?? competitor.team?.id ?? fallbackCode;
  const color = competitor.team?.color ? `#${competitor.team.color.replace(/^#/, "")}` : teamColorsByCode[code] ?? "#3d5a80";
  const shots = readStat(competitor, ["totalShots", "SHOT"]);
  const possession = readStat(competitor, ["possessionPct", "PP"]);
  const corners = readStat(competitor, ["wonCorners", "CW"]);

  return {
    code,
    name: competitor.team?.displayName ?? competitor.team?.shortDisplayName ?? competitor.team?.name ?? competitor.team?.location ?? code,
    color,
    group: "FIFA World Cup public scoreboard",
    record: [possession ? `${possession}% possession` : "", shots ? `${shots} shots` : "", corners ? `${corners} corners` : ""]
      .filter(Boolean)
      .join(" / "),
    profile: "Public scoreboard participant. Team context is loaded without a private API token.",
  };
}

function normalizeScoreEvents(
  scores: TxlineScore[],
  participant1IsHome: boolean,
  home: Team,
  away: Team,
): MatchEvent[] {
  const orderedScores = [...scores].sort(compareTxlineScore);
  const kickoffScore = orderedScores[0];
  const events: MatchEvent[] = [
    {
      id: "txline-kickoff",
      minute: Math.max(1, extractMinute(kickoffScore)),
      type: "kickoff",
      title: "TxLINE feed opened",
      description: "Authenticated TxLINE score feed is connected for this fixture; free-tier data is treated as delayed unless upgraded.",
      homeScore: 0,
      awayScore: 0,
      marketPulse: 50,
    },
  ];

  for (const score of orderedScores) {
    const eventType = inferScoreEventType(score);

    if (!eventType) {
      continue;
    }

    const currentScore = extractScore(score, participant1IsHome);
    const teamCode = resolveEventTeamCode(score, participant1IsHome, home, away);
    const title = buildEventTitle(eventType, teamCode);

    events.push({
      id: `txline-score-${score.seq ?? score.id ?? score.ts ?? events.length}`,
      minute: extractMinute(score),
      type: eventType,
      team: teamCode,
      player: extractPlayerLabel(score),
      penalty: Boolean(score.dataSoccer?.Penalty || score.parti1StateSoccer?.PossibleEvent?.Penalty || score.parti2StateSoccer?.PossibleEvent?.Penalty),
      title,
      description: buildEventDescription(score, title),
      homeScore: currentScore.homeScore,
      awayScore: currentScore.awayScore,
      marketPulse: inferMarketPulseFromScore(currentScore.homeScore, currentScore.awayScore),
    });
  }

  const latestScore = orderedScores.at(-1);

  if (latestScore) {
    const currentScore = extractScore(latestScore, participant1IsHome);
    const latestEvent = events.at(-1);
    const latestScoreMinute = extractMinute(latestScore);
    const needsScoreSnapshot =
      !latestEvent ||
      latestEvent.homeScore !== currentScore.homeScore ||
      latestEvent.awayScore !== currentScore.awayScore ||
      latestEvent.minute < latestScoreMinute;

    if (needsScoreSnapshot) {
      events.push({
        id: `txline-score-snapshot-${latestScore.seq ?? latestScore.id ?? latestScore.ts ?? events.length}`,
        minute: latestScoreMinute,
        type: "score_update",
        title: "TxLINE score snapshot",
        description: "Latest authenticated TxLINE score snapshot for this fixture.",
        homeScore: currentScore.homeScore,
        awayScore: currentScore.awayScore,
        marketPulse: inferMarketPulseFromScore(currentScore.homeScore, currentScore.awayScore),
      });
    }
  }

  return dedupeEvents(events).sort((first, second) => first.minute - second.minute);
}

function normalizeOddsSnapshots(
  odds: TxlineOdds[],
  kickoffIso: string | undefined,
  events: MatchEvent[],
  score: { homeScore: number; awayScore: number },
): MarketSnapshot[] {
  const snapshots = odds
    .map((item) => toMarketSnapshot(item, kickoffIso))
    .filter((item): item is MarketSnapshot => Boolean(item))
    .sort((first, second) => first.minute - second.minute);

  if (snapshots.length) {
    return dedupeMarket(snapshots);
  }

  if (events.length) {
    return dedupeMarket(
      events.map((event) => ({
        minute: event.minute,
        homeWin: score.homeScore > score.awayScore ? 1.85 : 2.4,
        draw: score.homeScore === score.awayScore ? 3.0 : 3.4,
        awayWin: score.awayScore > score.homeScore ? 1.85 : 2.4,
        sentiment: event.marketPulse,
      })),
    );
  }

  return [
    {
      minute: 1,
      homeWin: 2.2,
      draw: 3.2,
      awayWin: 3.4,
      sentiment: inferMarketPulseFromScore(score.homeScore, score.awayScore),
    },
  ];
}

function toMarketSnapshot(item: TxlineOdds, kickoffIso: string | undefined): MarketSnapshot | null {
  const prices = item.Prices ?? [];
  const priceNames = item.PriceNames ?? [];

  if (prices.length < 3) {
    return null;
  }

  const homeIndex = findNamedPriceIndex(priceNames, ["home", "1", "participant1"]);
  const drawIndex = findNamedPriceIndex(priceNames, ["draw", "x"]);
  const awayIndex = findNamedPriceIndex(priceNames, ["away", "2", "participant2"]);
  const homeWin = toDecimalOdds(prices[homeIndex >= 0 ? homeIndex : 0]);
  const draw = toDecimalOdds(prices[drawIndex >= 0 ? drawIndex : 1]);
  const awayWin = toDecimalOdds(prices[awayIndex >= 0 ? awayIndex : 2]);
  const pct = item.Pct ?? [];
  const sentimentFromPct = parsePercentage(pct[homeIndex >= 0 ? homeIndex : 0]);
  const sentiment =
    sentimentFromPct ?? Math.max(15, Math.min(85, 50 + Math.round((awayWin - homeWin) * 8)));

  return {
    minute: timestampToMinute(item.Ts, kickoffIso),
    homeWin,
    draw,
    awayWin,
    sentiment,
  };
}

function selectFixture(fixtures: TxlineFixture[], configuredFixtureId?: number) {
  if (configuredFixtureId) {
    const configured = fixtures.find((fixture) => fixture.FixtureId === configuredFixtureId);

    if (configured) {
      return configured;
    }
  }

  const now = Date.now();
  return fixtures
    .filter((fixture) => typeof fixture.FixtureId === "number")
    .sort((first, second) => Math.abs(toTimestamp(first.StartTime) - now) - Math.abs(toTimestamp(second.StartTime) - now))[0];
}

function resolveFixtureId(configuredFixtureId?: string) {
  return (
    parseOptionalInteger(configuredFixtureId) ??
    dataConsistencyState.today.find((item) => typeof item.fixtureId === "number")?.fixtureId
  );
}

function extractScore(score: TxlineScore | undefined, participant1IsHome: boolean) {
  const participant1 = extractSoccerGoals(score?.scoreSoccer?.Participant1);
  const participant2 = extractSoccerGoals(score?.scoreSoccer?.Participant2);

  return {
    homeScore: participant1IsHome ? participant1 : participant2,
    awayScore: participant1IsHome ? participant2 : participant1,
  };
}

function extractSoccerGoals(totalScore?: TxlineSoccerTotalScore) {
  return (
    totalScore?.Total?.Goals ??
    totalScore?.ETTotal?.Goals ??
    totalScore?.PE?.Goals ??
    totalScore?.H2?.Goals ??
    totalScore?.HT?.Goals ??
    totalScore?.H1?.Goals ??
    0
  );
}

function inferScoreEventType(score: TxlineScore): MatchEventType | null {
  const action = `${score.action ?? ""} ${score.dataSoccer?.Action ?? ""} ${score.dataSoccer?.Type ?? ""}`.toLowerCase();

  if (score.dataSoccer?.Goal || score.parti1StateSoccer?.PossibleEvent?.Goal || score.parti2StateSoccer?.PossibleEvent?.Goal || action.includes("goal")) {
    return "goal";
  }

  if (score.dataSoccer?.RedCard || score.possibleEventSoccer?.RedCard || action.includes("red_card") || action.includes("red card")) {
    return "red_card";
  }

  if (score.dataSoccer?.YellowCard || score.possibleEventSoccer?.YellowCard || action.includes("yellow_card") || action.includes("yellow card")) {
    return "yellow_card";
  }

  if (score.dataSoccer?.PlayerInId || score.dataSoccer?.PlayerOutId || action.includes("sub")) {
    return "substitution";
  }

  if (action.includes("half") || action.includes("ht")) {
    return "halftime";
  }

  if (action.includes("full") || action.includes("finish") || action.includes("final") || action.includes("ended")) {
    return "fulltime";
  }

  return null;
}

function buildEventTitle(eventType: MatchEventType, teamCode?: string) {
  const prefix = teamCode ? `${teamCode} ` : "";

  if (eventType === "goal") {
    return `${prefix}goal`;
  }

  if (eventType === "yellow_card") {
    return `${prefix}yellow card`;
  }

  if (eventType === "red_card") {
    return `${prefix}red card`;
  }

  if (eventType === "score_update") {
    return "TxLINE score snapshot";
  }

  if (eventType === "substitution") {
    return `${prefix}substitution`;
  }

  if (eventType === "halftime") {
    return "Halftime";
  }

  if (eventType === "fulltime") {
    return "Full time";
  }

  return "TxLINE event";
}

function buildEventDescription(score: TxlineScore, title: string) {
  const action = score.dataSoccer?.Action ?? score.action ?? score.dataSoccer?.Type ?? "score update";
  return `${title} from TxLINE score sequence ${score.seq ?? score.id ?? "n/a"} (${action}).`;
}

function resolveEventTeamCode(score: TxlineScore, participant1IsHome: boolean, home: Team, away: Team) {
  const participant = score.participant;

  if (participant === 1 || participant === score.participant1Id) {
    return participant1IsHome ? home.code : away.code;
  }

  if (participant === 2 || participant === score.participant2Id) {
    return participant1IsHome ? away.code : home.code;
  }

  return undefined;
}

function extractPlayerLabel(score: TxlineScore) {
  const candidate =
    score.dataSoccer?.PlayerName ??
    score.dataSoccer?.New?.PlayerName ??
    score.dataSoccer?.PlayerInName ??
    score.dataSoccer?.New?.PlayerInName ??
    score.dataSoccer?.PlayerOutName ??
    score.dataSoccer?.New?.PlayerOutName;
  if (!candidate) return undefined;
  const normalized = candidate.trim();
  if (!normalized || /^#?\d+$/.test(normalized) || /^player\s*#?\d+$/i.test(normalized)) return undefined;
  return normalized;
}

function inferMatchStatus(score: TxlineScore | undefined, kickoffIso: string | undefined, eventCount: number): MatchData["status"] {
  const state = `${score?.gameState ?? ""} ${score?.action ?? ""} ${score?.dataSoccer?.Action ?? ""}`.toLowerCase();

  if (state.includes("finish") || state.includes("full") || state.includes("final") || state.includes("ended")) {
    return "finished";
  }

  if (eventCount > 1 || state.includes("live") || state.includes("inplay") || state.includes("running")) {
    return "live";
  }

  if (kickoffIso && Date.now() > new Date(kickoffIso).getTime()) {
    return "live";
  }

  return "scheduled";
}

function inferMarketPulseFromScore(homeScore: number, awayScore: number) {
  const swing = (homeScore - awayScore) * 12;
  return Math.max(15, Math.min(85, 50 + swing));
}

function buildLiveReadyMessage(
  fixtureId: number,
  scoresCount: number,
  oddsCount: number,
  partialErrors: string[],
) {
  const base = `Authenticated TxLINE fixture ${fixtureId} loaded with ${scoresCount} score records and ${oddsCount} odds records. The UI labels polling delivery as delayed unless a true live stream is confirmed.`;

  if (!partialErrors.length) {
    return base;
  }

  return `${base} Partial source warning: ${partialErrors.join(" / ")}`;
}

function findScheduleSeed(fixtureId: number) {
  return dataConsistencyState.today.find((item) => item.fixtureId === fixtureId);
}

function seedParticipantName(seed: ReturnType<typeof findScheduleSeed>, participant: 1 | 2) {
  const code = participant === 1 ? seed?.homeCode : seed?.awayCode;
  return code ? teamNamesByCode[code] ?? code : undefined;
}

function seedParticipantCode(seed: ReturnType<typeof findScheduleSeed>, participant: 1 | 2) {
  return participant === 1 ? seed?.homeCode : seed?.awayCode;
}

function buildTeam(name: string, fallbackCode?: string): Team {
  const code = fallbackCode ?? inferTeamCode(name);

  return {
    code,
    name,
    color: teamColorsByCode[code] ?? "#3d5a80",
    group: "TxLINE World Cup fixture",
    record: "Live profile from authenticated TxLINE feed.",
    profile: "Official fixture participant; detailed player context stays seed-backed unless supplied by the feed.",
  };
}

function inferTeamCode(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const match = Object.entries(teamNamesByCode).find(([, teamName]) =>
    normalized.includes(teamName.toUpperCase()),
  );

  if (match) {
    return match[0];
  }

  return normalized
    .replace(/[^A-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .padEnd(3, "X");
}

function compareTxlineScore(first: TxlineScore, second: TxlineScore) {
  return (first.seq ?? first.ts ?? first.id ?? 0) - (second.seq ?? second.ts ?? second.id ?? 0);
}

function latestByTime(scores: TxlineScore[]) {
  return [...scores].sort(compareTxlineScore).at(-1);
}

function extractMinute(score: TxlineScore | undefined) {
  const minute =
    score?.dataSoccer?.Minutes ??
    score?.dataSoccer?.New?.Minutes ??
    (typeof score?.ts === "number" && typeof score.startTime === "number"
      ? Math.floor((toTimestamp(score.ts) - toTimestamp(score.startTime)) / 60_000)
      : undefined);

  return Math.max(1, Math.min(130, minute ?? 1));
}

function timestampToMinute(timestamp: number | undefined, kickoffIso: string | undefined) {
  if (!timestamp || !kickoffIso) {
    return 1;
  }

  const kickoffMs = new Date(kickoffIso).getTime();

  if (!Number.isFinite(kickoffMs)) {
    return 1;
  }

  return Math.max(1, Math.min(130, Math.floor((toTimestamp(timestamp) - kickoffMs) / 60_000)));
}

function toDecimalOdds(value: number | undefined) {
  if (!value) {
    return 2.0;
  }

  return Number((value > 100 ? value / 1000 : value).toFixed(2));
}

function parsePercentage(value: string | undefined) {
  if (!value || value === "NA") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : undefined;
}

function findNamedPriceIndex(names: string[], options: string[]) {
  const normalizedOptions = options.map((option) => option.toLowerCase());

  return names.findIndex((name) => normalizedOptions.includes(name.toLowerCase()));
}

function dedupeEvents(events: MatchEvent[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = `${event.minute}-${event.type}-${event.team ?? "neutral"}-${event.homeScore}-${event.awayScore}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeMarket(snapshots: MarketSnapshot[]) {
  const byMinute = new Map<number, MarketSnapshot>();

  for (const snapshot of snapshots) {
    byMinute.set(snapshot.minute, snapshot);
  }

  return [...byMinute.values()].sort((first, second) => first.minute - second.minute);
}

function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (isRecord(payload)) {
    for (const key of ["data", "items", "fixtures", "scores", "odds", "result", "snapshots"]) {
      const value = payload[key];

      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  return [];
}

function readString(payload: unknown, keys: string[]) {
  if (typeof payload === "string") {
    return payload;
  }

  if (!isRecord(payload)) {
    return undefined;
  }

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function cleanSecret(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed.includes("your_") ||
    trimmed.includes("example") ||
    trimmed.includes("official_base_url")
  ) {
    return undefined;
  }

  return trimmed;
}

function normalizeApiBase(apiBase: string | undefined) {
  const cleaned = cleanSecret(apiBase);
  return (cleaned ?? defaultApiBase).replace(/\/+$/, "");
}

function normalizeProxyBase(proxyBase: string | undefined) {
  const cleaned = cleanSecret(proxyBase);

  if (!cleaned) {
    return undefined;
  }

  if (cleaned.startsWith("/")) {
    return cleaned.replace(/\/+$/, "");
  }

  try {
    const url = new URL(cleaned);

    if (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return cleaned.replace(/\/+$/, "");
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function buildUrl(apiBase: string, endpoint: string, query?: Record<string, number | undefined>) {
  const url = new URL(endpoint, `${apiBase}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function buildProxyUrl(proxyBase: string, endpoint: string, query?: Record<string, number | undefined>) {
  const base = proxyBase.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${base}${path}`, globalThis.location?.origin ?? "http://127.0.0.1");

  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function parseOptionalInteger(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function toTimestamp(value: number | undefined) {
  if (!value) {
    return 0;
  }

  return value > 10_000_000_000 ? value : value * 1000;
}

function toIso(value: number | string | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (!value) {
    return undefined;
  }

  return new Date(toTimestamp(value)).toISOString();
}

function parseMaybeJson(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed;
  }

  return JSON.parse(trimmed);
}

function toSafeErrorMessage(error: unknown) {
  if (error instanceof TxlineHttpError) {
    return error.message;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "TxLINE request timed out.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown TxLINE error.";
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const teamNamesByCode: Record<string, string> = {
  ALG: "Algeria",
  ARG: "Argentina",
  AUT: "Austria",
  BEL: "Belgium",
  BRA: "Brazil",
  ENG: "England",
  FRA: "France",
  GER: "Germany",
  JOR: "Jordan",
  JPN: "Japan",
  MEX: "Mexico",
  NOR: "Norway",
  POR: "Portugal",
  SUI: "Switzerland",
  ESP: "Spain",
  USA: "United States",
};

const teamColorsByCode: Record<string, string> = {
  ALG: "#0b8f55",
  ARG: "#55a7d8",
  AUT: "#d62839",
  BEL: "#1f2933",
  BRA: "#f2c94c",
  ENG: "#b91c1c",
  FRA: "#233f8f",
  GER: "#1f2933",
  JOR: "#0f766e",
  JPN: "#d62839",
  MEX: "#0f5132",
  NOR: "#ba0c2f",
  POR: "#be123c",
  SUI: "#d52b1e",
  ESP: "#f59e0b",
  USA: "#2563eb",
};
