import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localEnv = readLocalEnv(path.join(root, ".env.local"));

const apiBase = clean(envValue("VITE_TXLINE_API_BASE")) ?? "https://txline-dev.txodds.com";
const proxyBase = clean(envValue("VITE_TXLINE_PROXY_BASE"));
const apiToken = clean(envValue("VITE_TXLINE_API_TOKEN"));
const configuredJwt = clean(envValue("VITE_TXLINE_SESSION_JWT"));
const fixtureId = Number(envValue("VITE_TXLINE_FIXTURE_ID") ?? "17588325");
const finalScoreSeq = optionalNumber(envValue("VITE_TXLINE_FINAL_SCORE_SEQ"));
const asOf = optionalNumber(envValue("VITE_TXLINE_AS_OF_MS"));
const startEpochDay = optionalNumber(envValue("VITE_TXLINE_START_EPOCH_DAY"));
const competitionId = optionalNumber(envValue("VITE_TXLINE_COMPETITION_ID")) ?? 72;

if (proxyBase) {
  await probeProxyMode();
  process.exit(0);
}

if (!apiToken) {
  console.log("SKIP TxLINE probe: neither VITE_TXLINE_PROXY_BASE nor VITE_TXLINE_API_TOKEN is configured.");
  console.log("Use proxy mode for public Live, or add the token locally only. Do not commit .env.local or paste tokens into chat.");
  process.exit(0);
}

const sessionJwt = configuredJwt ?? (await getGuestJwt());
const authHeaders = {
  Authorization: `Bearer ${sessionJwt}`,
  "X-Api-Token": apiToken,
};

const fixturesPayload = await requestJson(apiBase, "/api/fixtures/snapshot", authHeaders, {
  startEpochDay,
  competitionId,
});
const fixtures = worldCupFixtures(fixturesPayload);
const liveFixtureId = selectFixtureId(fixtures, fixtureId);
if (!liveFixtureId) throw new Error("No CompetitionId 72 fixture was returned by TxLINE.");
const scores = await requestJson(apiBase, `/api/scores/snapshot/${liveFixtureId}`, authHeaders, { asOf });
const odds = await requestJson(apiBase, `/api/odds/snapshot/${liveFixtureId}`, authHeaders, { asOf });
const finalScoreProof = finalScoreSeq
  ? await requestJson(apiBase, "/api/scores/stat-validation", authHeaders, {
      fixtureId,
      seq: finalScoreSeq,
      statKeys: "1,2",
    })
  : null;

console.log("PASS TxLINE guest JWT resolved.");
console.log(`PASS TxLINE API base: ${apiBase}`);
console.log(`PASS fixtures snapshot records: ${countRecords(fixtures)}`);
console.log(`PASS score snapshot records for fixture ${liveFixtureId}: ${countRecords(scores)}`);
console.log(`PASS odds snapshot records for fixture ${liveFixtureId}: ${countRecords(odds)}`);
if (finalScoreSeq) {
  console.log(`PASS final-score stat-validation proof payload: ${countRecords(finalScoreProof)}`);
} else {
  console.log("SKIP final-score proof probe: VITE_TXLINE_FINAL_SCORE_SEQ is not configured.");
}
console.log("TxLINE probe complete. No token values were printed.");

async function probeProxyMode() {
  const health = await requestJson(proxyBase, "/__health");
  const fixturesPayload = await requestJson(proxyBase, "/api/fixtures/snapshot", undefined, {
    startEpochDay,
    competitionId,
  });
  const fixtures = worldCupFixtures(fixturesPayload);
  const liveFixtureId = selectFixtureId(fixtures, fixtureId);
  if (!liveFixtureId) throw new Error("No CompetitionId 72 fixture was returned by the TxLINE proxy.");
  const scores = await requestJson(proxyBase, `/api/scores/snapshot/${liveFixtureId}`, undefined, { asOf });
  const odds = await requestJson(proxyBase, `/api/odds/snapshot/${liveFixtureId}`, undefined, { asOf });
  const finalScoreProof = finalScoreSeq
    ? await requestJson(proxyBase, "/api/scores/stat-validation", undefined, {
        fixtureId,
        seq: finalScoreSeq,
        statKeys: "1,2",
      })
    : null;

  console.log("PASS TxLINE proxy health check.");
  console.log(`PASS proxy token configured: ${Boolean(health?.hasToken)}`);
  console.log(`PASS proxy fixtures snapshot records: ${countRecords(fixtures)}`);
  console.log(`PASS proxy score snapshot records for fixture ${liveFixtureId}: ${countRecords(scores)}`);
  console.log(`PASS proxy odds snapshot records for fixture ${liveFixtureId}: ${countRecords(odds)}`);
  if (finalScoreSeq) {
    console.log(`PASS proxy final-score stat-validation proof payload: ${countRecords(finalScoreProof)}`);
  } else {
    console.log("SKIP proxy final-score proof probe: VITE_TXLINE_FINAL_SCORE_SEQ is not configured.");
  }
  console.log("TxLINE proxy probe complete. Browser-facing probe did not receive token values.");
}

async function getGuestJwt() {
  const payload = await requestJson(apiBase, "/auth/guest/start", undefined, undefined, "POST");
  const token = readToken(payload);

  if (!token) {
    throw new Error("Guest session response did not include a token field.");
  }

  return token;
}

async function requestJson(baseUrl, endpoint, headers, query, method = "GET") {
  const url = new URL(endpoint, `${baseUrl.replace(/\/+$/, "")}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
      url.searchParams.set(key, String(value));
    }
    if (typeof value === "string" && value.trim()) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(headers ?? {}),
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`TxLINE ${endpoint} failed with HTTP ${response.status}: ${text.slice(0, 220)}`);
  }

  return text ? JSON.parse(text) : null;
}

function readLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
      }),
  );
}

function envValue(key) {
  return process.env[key] ?? localEnv[key];
}

function clean(value) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed && !trimmed.includes("your_") ? trimmed : undefined;
}

function optionalNumber(value) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readToken(payload) {
  if (payload && typeof payload === "object" && "token" in payload && typeof payload.token === "string") {
    return payload.token;
  }

  return undefined;
}

function countRecords(payload) {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (payload && typeof payload === "object") {
    return 1;
  }

  return 0;
}

function worldCupFixtures(payload) {
  const fixtures = Array.isArray(payload) ? payload : [];
  return fixtures.filter((fixture) =>
    typeof fixture?.CompetitionId === "number"
      ? fixture.CompetitionId === 72
      : /\bworld cup\b/i.test(fixture?.Competition ?? ""),
  );
}

function selectFixtureId(fixtures, configuredFixtureId) {
  const configured = fixtures.find((fixture) => fixture?.FixtureId === configuredFixtureId);
  if (configured?.FixtureId) return configured.FixtureId;

  const now = Date.now();
  return [...fixtures]
    .filter((fixture) => Number.isFinite(fixture?.FixtureId))
    .sort((a, b) => Math.abs(toTimestamp(a?.StartTime) - now) - Math.abs(toTimestamp(b?.StartTime) - now))[0]?.FixtureId;
}

function toTimestamp(value) {
  if (!Number.isFinite(value)) return 0;
  return value < 10_000_000_000 ? value * 1000 : value;
}
