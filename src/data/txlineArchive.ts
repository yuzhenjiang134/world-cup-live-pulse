import archiveSnapshot from "./txlineArchiveSnapshot.json";
import { normalizeTxlineScoreRecord, type NormalizedTxlineScore } from "../lib/txlineScoreNormalizer";
import type { MatchData, MatchEvent, MarketSnapshot, PlayerProfile, Team } from "../types";

type ArchiveFixture = (typeof archiveSnapshot.matches)[number];

const colors: Record<string, string> = {
  ARG: "#55a7d8", BEL: "#c9a227", BRA: "#e6c229", COL: "#f2c94c", EGY: "#c62828", ENG: "#f4f6f7",
  ESP: "#c60b1e", FRA: "#233f8f", MAR: "#b81d24", MEX: "#0b6b3a", NOR: "#ba0c2f", PAR: "#d62839",
  POR: "#a71930", SUI: "#d52b1e", USA: "#2d4f8b",
};

export const txlineArchiveCapturedAtIso = archiveSnapshot.capturedAtIso;
export const txlineArchiveMatches: MatchData[] = archiveSnapshot.matches.map(buildArchiveMatch);

function buildArchiveMatch(fixture: ArchiveFixture): MatchData {
  const records = fixture.records.map(normalizeTxlineScoreRecord).sort(compareSequence);
  const finalRecord = records.filter((record) => record.action === "game_finalised").at(-1);
  const participant1IsHome = finalRecord?.participant1IsHome ?? true;
  const participant1 = buildTeam(fixture.homeCode, fixture.homeName, fixture.stage, collectPlayers(records, 1));
  const participant2 = buildTeam(fixture.awayCode, fixture.awayName, fixture.stage, collectPlayers(records, 2));
  const home = participant1IsHome ? participant1 : participant2;
  const away = participant1IsHome ? participant2 : participant1;
  const events = buildEvents(records, participant1IsHome, home, away);
  const market = events.map((event) => ({
    minute: event.minute,
    homeWin: 0,
    draw: 0,
    awayWin: 0,
    sentiment: event.marketPulse,
  })) satisfies MarketSnapshot[];

  return {
    id: `txline-archive-${fixture.fixtureId}`,
    competition: "TxLINE World Cup 2026 archive",
    venue: "TxLINE authenticated historical feed",
    status: "finished",
    stage: fixture.stage,
    kickoffIso: toIso(finalRecord?.startTime),
    dataStatus: "Replay",
    marketSource: "derived-from-score",
    qualificationNote: `Verified final result and event sequence from ${fixture.sourceEndpoint}; snapshot captured ${archiveSnapshot.capturedAtIso}.`,
    kickoffLabel: "2026 TxLINE verified replay",
    home,
    away,
    events,
    market: market.length ? market : [{ minute: 1, homeWin: 0, draw: 0, awayWin: 0, sentiment: 50 }],
  };
}

function buildEvents(records: NormalizedTxlineScore[], participant1IsHome: boolean, home: Team, away: Team) {
  const events: MatchEvent[] = [];
  let previousScore = { homeScore: 0, awayScore: 0 };
  let previousCards = { homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0 };
  let lastClockMinute = 1;
  const seen = new Set<string>();

  for (const record of records) {
    const action = record.action ?? "";
    const score = extractScore(record, participant1IsHome, previousScore);
    const cards = extractCards(record, participant1IsHome, previousCards);
    const minute = extractMinute(record);
    if (typeof record.clockSeconds === "number") lastClockMinute = minute;
    const team = eventTeam(record, participant1IsHome, home, away);
    const scoreChanged = score.homeScore !== previousScore.homeScore || score.awayScore !== previousScore.awayScore;
    let event: MatchEvent | undefined;

    if (action === "kickoff" && !events.some((candidate) => candidate.type === "kickoff")) {
      event = makeEvent(record, minute, "kickoff", undefined, "Kickoff", "TxLINE historical sequence opened.", score);
    } else if (action === "goal" && score.homeScore + score.awayScore > previousScore.homeScore + previousScore.awayScore) {
      event = {
        ...makeEvent(record, minute, "goal", team, `${team ?? "Team"} goal`, playerDescription(record, "Goal confirmed in the TxLINE sequence."), score),
        penalty: Boolean(record.dataSoccer?.Penalty || record.parti1StateSoccer?.PossibleEvent?.Penalty || record.parti2StateSoccer?.PossibleEvent?.Penalty),
      };
    } else if ((action === "score_adjustment" || action === "action_discarded") && scoreChanged) {
      event = makeEvent(record, minute, "score_update", team, "Score corrected", "TxLINE sequence revised the scoreboard after review.", score);
    } else if (action === "yellow_card" && cardTotal(cards, "yellow") > cardTotal(previousCards, "yellow")) {
      event = makeEvent(record, minute, "yellow_card", team, `${team ?? "Team"} yellow card`, playerDescription(record, "Yellow card confirmed by TxLINE."), score);
    } else if (action === "red_card" && cardTotal(cards, "red") > cardTotal(previousCards, "red")) {
      event = makeEvent(record, minute, "red_card", team, `${team ?? "Team"} red card`, playerDescription(record, "Red card confirmed by TxLINE."), score);
    } else if (action === "substitution" && hasPlayerDetail(record)) {
      event = makeEvent(record, minute, "substitution", team, `${team ?? "Team"} substitution`, playerDescription(record, "Substitution confirmed by TxLINE."), score);
    } else if (action === "halftime_finalised") {
      event = makeEvent(record, 45, "halftime", undefined, "Half-time", "Half-time state finalised by TxLINE.", score);
    } else if (action === "additional_time") {
      event = makeEvent(record, minute, "score_update", undefined, "Added time", "Additional time update from TxLINE.", score);
    } else if (action === "var" || action === "var_end") {
      event = makeEvent(record, minute, "score_update", team, "VAR review", "Video review state from the TxLINE sequence.", score);
    } else if (action === "game_finalised") {
      event = makeEvent(record, Math.max(90, lastClockMinute), "fulltime", undefined, "Full time", "Final result confirmed by TxLINE game_finalised.", score);
    }

    if (event) {
      const key = `${event.type}-${event.minute}-${event.team ?? "neutral"}-${event.homeScore}-${event.awayScore}-${event.player ?? ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        events.push(event);
      }
    }

    previousScore = score;
    previousCards = cards;
  }

  const ordered = events.sort((first, second) => first.minute - second.minute || first.id.localeCompare(second.id));
  return ordered.map((event, index) => {
    if (event.type !== "goal") return event;
    const eventTotal = event.homeScore + event.awayScore;
    const laterReduction = ordered.slice(index + 1).find((candidate) => candidate.homeScore + candidate.awayScore < eventTotal);
    if (!laterReduction) return event;
    return {
      ...event,
      type: "score_update" as const,
      title: "Goal overturned",
      description: "A provisional goal appeared in the TxLINE sequence and was later removed from the verified score.",
    };
  });
}

function makeEvent(record: NormalizedTxlineScore, minute: number, type: MatchEvent["type"], team: string | undefined, title: string, description: string, score: { homeScore: number; awayScore: number }): MatchEvent {
  return {
    id: `txline-archive-${record.fixtureId}-${record.seq ?? record.id ?? record.ts}`,
    minute,
    type,
    team,
    player: playerLabel(record),
    title,
    description,
    homeScore: score.homeScore,
    awayScore: score.awayScore,
    marketPulse: Math.max(15, Math.min(85, 50 + (score.homeScore - score.awayScore) * 12)),
  };
}

function buildTeam(code: string, name: string, stage: string, keyPlayers: PlayerProfile[]): Team {
  return {
    code,
    name,
    color: colors[code] ?? "#315b62",
    group: stage,
    record: "2026 TxLINE verified archive participant",
    profile: "Team identity and fixture path come from the official TxLINE World Cup schedule; event details come from the authenticated historical score sequence.",
    keyPlayers,
  };
}

function collectPlayers(records: NormalizedTxlineScore[], participant: number): PlayerProfile[] {
  const evidence = new Map<string, { goals: number; cards: number; substitutions: number; minutes: Set<number> }>();
  for (const record of records) {
    if (record.participant !== participant) continue;
    const name = verifiedPlayerName(record);
    if (!name) continue;
    const player = evidence.get(name) ?? { goals: 0, cards: 0, substitutions: 0, minutes: new Set<number>() };
    if (record.action === "goal") player.goals += 1;
    if (record.action === "yellow_card" || record.action === "red_card") player.cards += 1;
    if (record.action === "substitution") player.substitutions += 1;
    if (["goal", "yellow_card", "red_card", "substitution"].includes(record.action ?? "")) player.minutes.add(extractMinute(record));
    evidence.set(name, player);
  }
  return [...evidence.entries()].slice(0, 6).map(([name, player]) => ({
    name,
    goals: player.goals || undefined,
    cards: player.cards || undefined,
    substitutions: player.substitutions || undefined,
    minutes: [...player.minutes].sort((left, right) => left - right),
  }));
}

function extractScore(record: NormalizedTxlineScore, participant1IsHome: boolean, previous: { homeScore: number; awayScore: number }) {
  if (!record.scoreSoccer) return previous;
  const first = record.scoreSoccer?.Participant1?.Total?.Goals ?? 0;
  const second = record.scoreSoccer?.Participant2?.Total?.Goals ?? 0;
  return participant1IsHome ? { homeScore: first, awayScore: second } : { homeScore: second, awayScore: first };
}

function extractCards(record: NormalizedTxlineScore, participant1IsHome: boolean, previous: { homeYellow: number; awayYellow: number; homeRed: number; awayRed: number }) {
  if (!record.scoreSoccer) return previous;
  const first = record.scoreSoccer?.Participant1?.Total;
  const second = record.scoreSoccer?.Participant2?.Total;
  return participant1IsHome
    ? { homeYellow: first?.YellowCards ?? 0, awayYellow: second?.YellowCards ?? 0, homeRed: first?.RedCards ?? 0, awayRed: second?.RedCards ?? 0 }
    : { homeYellow: second?.YellowCards ?? 0, awayYellow: first?.YellowCards ?? 0, homeRed: second?.RedCards ?? 0, awayRed: first?.RedCards ?? 0 };
}

function cardTotal(cards: { homeYellow: number; awayYellow: number; homeRed: number; awayRed: number }, type: "yellow" | "red") {
  return type === "yellow" ? cards.homeYellow + cards.awayYellow : cards.homeRed + cards.awayRed;
}

function eventTeam(record: NormalizedTxlineScore, participant1IsHome: boolean, home: Team, away: Team) {
  if (record.participant === 1 || record.participant === record.participant1Id) return participant1IsHome ? home.code : away.code;
  if (record.participant === 2 || record.participant === record.participant2Id) return participant1IsHome ? away.code : home.code;
  return undefined;
}

function playerId(record: NormalizedTxlineScore) {
  return record.dataSoccer?.PlayerId ?? record.dataSoccer?.New?.PlayerId ?? record.dataSoccer?.PlayerInId ?? record.dataSoccer?.PlayerOutId;
}

function playerLabel(record: NormalizedTxlineScore) {
  return verifiedPlayerName(record);
}

function playerDescription(record: NormalizedTxlineScore, fallback: string) {
  const player = playerLabel(record);
  return player ? `${player}. ${fallback}` : fallback;
}

function hasPlayerDetail(record: NormalizedTxlineScore) {
  return Boolean(playerId(record) || record.dataSoccer?.PlayerInId || record.dataSoccer?.PlayerOutId);
}

function verifiedPlayerName(record: NormalizedTxlineScore) {
  const candidate =
    record.dataSoccer?.PlayerName ??
    record.dataSoccer?.New?.PlayerName ??
    record.dataSoccer?.PlayerInName ??
    record.dataSoccer?.New?.PlayerInName ??
    record.dataSoccer?.PlayerOutName ??
    record.dataSoccer?.New?.PlayerOutName;
  if (!candidate) return undefined;
  const normalized = candidate.trim();
  if (!normalized || /^#?\d+$/.test(normalized) || /^player\s*#?\d+$/i.test(normalized)) return undefined;
  return normalized;
}

function extractMinute(record: NormalizedTxlineScore) {
  if (typeof record.clockSeconds === "number") return Math.max(1, Math.min(130, Math.floor(record.clockSeconds / 60)));
  if (typeof record.ts === "number" && typeof record.startTime === "number") return Math.max(1, Math.min(130, Math.floor((record.ts - record.startTime) / 60_000)));
  return 1;
}

function compareSequence(first: NormalizedTxlineScore, second: NormalizedTxlineScore) {
  return (first.seq ?? first.ts ?? first.id ?? 0) - (second.seq ?? second.ts ?? second.id ?? 0);
}

function toIso(timestamp: number | undefined) {
  return timestamp ? new Date(timestamp > 10_000_000_000 ? timestamp : timestamp * 1000).toISOString() : undefined;
}
