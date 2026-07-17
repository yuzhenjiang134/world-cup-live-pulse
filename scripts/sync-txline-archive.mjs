import fs from "node:fs/promises";
import path from "node:path";

const fixtures = [
  { fixtureId: 18188721, stage: "Round of 16", homeCode: "PAR", homeName: "Paraguay", awayCode: "FRA", awayName: "France" },
  { fixtureId: 18187298, stage: "Round of 16", homeCode: "BRA", homeName: "Brazil", awayCode: "NOR", awayName: "Norway" },
  { fixtureId: 18192996, stage: "Round of 16", homeCode: "MEX", homeName: "Mexico", awayCode: "ENG", awayName: "England" },
  { fixtureId: 18198205, stage: "Round of 16", homeCode: "POR", homeName: "Portugal", awayCode: "ESP", awayName: "Spain" },
  { fixtureId: 18193785, stage: "Round of 16", homeCode: "USA", homeName: "United States", awayCode: "BEL", awayName: "Belgium" },
  { fixtureId: 18202701, stage: "Round of 16", homeCode: "ARG", homeName: "Argentina", awayCode: "EGY", awayName: "Egypt" },
  { fixtureId: 18202783, stage: "Round of 16", homeCode: "SUI", homeName: "Switzerland", awayCode: "COL", awayName: "Colombia" },
  { fixtureId: 18209181, stage: "Quarter-final", homeCode: "FRA", homeName: "France", awayCode: "MAR", awayName: "Morocco" },
  { fixtureId: 18237038, stage: "Semi-final", homeCode: "FRA", homeName: "France", awayCode: "ESP", awayName: "Spain" },
  { fixtureId: 18241006, stage: "Semi-final", homeCode: "ENG", homeName: "England", awayCode: "ARG", awayName: "Argentina" },
];

const keyActions = new Set([
  "kickoff",
  "goal",
  "yellow_card",
  "red_card",
  "substitution",
  "halftime_finalised",
  "additional_time",
  "action_discarded",
  "game_finalised",
  "score_adjustment",
  "var",
  "var_end",
]);

const env = await readEnv(path.resolve(".env.local"));
const apiBase = clean(env.VITE_TXLINE_API_BASE) || "https://txline-dev.txodds.com";
const apiToken = clean(env.VITE_TXLINE_API_TOKEN);
if (!apiToken) throw new Error("VITE_TXLINE_API_TOKEN is required in ignored .env.local");
const jwt = clean(env.VITE_TXLINE_SESSION_JWT) || await startGuestSession(apiBase);

const matches = [];
for (const fixture of fixtures) {
  const response = await fetch(`${apiBase.replace(/\/+$/, "")}/api/scores/historical/${fixture.fixtureId}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
  });
  if (!response.ok) throw new Error(`Historical fixture ${fixture.fixtureId} failed with HTTP ${response.status}`);
  const records = parseHistoricalPayload(await response.text());
  if (!Array.isArray(records)) throw new Error(`Historical fixture ${fixture.fixtureId} did not return an array`);
  const keyRecords = records.filter((record) => keyActions.has(record?.Action)).map(sanitizeRecord);
  const finalRecord = keyRecords.filter((record) => record.Action === "game_finalised").sort(compareSequence).at(-1);
  if (!finalRecord) throw new Error(`Historical fixture ${fixture.fixtureId} has no game_finalised record`);
  matches.push({ ...fixture, sourceEndpoint: `/api/scores/historical/${fixture.fixtureId}`, records: keyRecords });
  console.log(`Synced fixture ${fixture.fixtureId}: ${keyRecords.length} key records`);
}

const output = {
  schemaVersion: 1,
  source: "TxLINE authenticated historical score API",
  competitionId: 72,
  capturedAtIso: new Date().toISOString(),
  note: "Sanitized judgeable archive. No API token, JWT, wallet, or private key is stored.",
  matches,
};

await fs.writeFile(path.resolve("src/data/txlineArchiveSnapshot.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${matches.length} verified 2026 archive matches without credentials`);

function sanitizeRecord(record) {
  return omitUndefined({
    FixtureId: record?.FixtureId,
    StartTime: record?.StartTime,
    Participant1IsHome: record?.Participant1IsHome,
    Participant1Id: record?.Participant1Id,
    Participant2Id: record?.Participant2Id,
    Action: record?.Action,
    Id: record?.Id,
    Ts: record?.Ts,
    Seq: record?.Seq,
    Clock: record?.Clock ? { Seconds: record.Clock.Seconds } : undefined,
    Score: compactScore(record?.Score),
    Participant: record?.Participant,
    Data: compactData(record?.Data ?? record?.DataSoccer),
  });
}

function compactScore(score) {
  if (!score) return undefined;
  return {
    Participant1: { Total: compactTotal(score.Participant1?.Total) },
    Participant2: { Total: compactTotal(score.Participant2?.Total) },
  };
}

function compactTotal(total) {
  return omitUndefined({ Goals: total?.Goals, YellowCards: total?.YellowCards, RedCards: total?.RedCards });
}

function compactData(data) {
  if (!data) return undefined;
  const compact = omitUndefined({
    GoalType: data.GoalType,
    PlayerId: data.PlayerId,
    PlayerInId: data.PlayerInId,
    PlayerOutId: data.PlayerOutId,
  });
  return Object.keys(compact).length ? compact : undefined;
}

function omitUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function compareSequence(first, second) {
  return (first.Seq ?? first.Ts ?? first.Id ?? 0) - (second.Seq ?? second.Ts ?? second.Id ?? 0);
}

function parseHistoricalPayload(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) return JSON.parse(trimmed);
  return trimmed.split(/\r?\n/).flatMap((line) => {
    const value = line.trim();
    if (!value.startsWith("data:")) return [];
    const payload = value.slice(5).trim();
    if (!payload || payload === "[DONE]") return [];
    return [JSON.parse(payload)];
  });
}

async function startGuestSession(base) {
  const response = await fetch(`${base.replace(/\/+$/, "")}/auth/guest/start`, { method: "POST" });
  if (!response.ok) throw new Error(`Guest session failed with HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload?.token) throw new Error("Guest session did not return a token");
  return payload.token;
}

async function readEnv(file) {
  const text = await fs.readFile(file, "utf8");
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return [];
    const separator = trimmed.indexOf("=");
    return [[trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "")]];
  }));
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}
