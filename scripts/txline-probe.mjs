import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localEnv = readLocalEnv(path.join(root, ".env.local"));

const apiBase = clean(envValue("VITE_TXLINE_API_BASE")) ?? "https://txline.txodds.com";
const apiToken = clean(envValue("VITE_TXLINE_API_TOKEN"));
const configuredJwt = clean(envValue("VITE_TXLINE_SESSION_JWT"));
const fixtureId = Number(envValue("VITE_TXLINE_FIXTURE_ID") ?? "17588325");
const asOf = optionalNumber(envValue("VITE_TXLINE_AS_OF_MS"));

if (!apiToken) {
  console.log("SKIP TxLINE probe: VITE_TXLINE_API_TOKEN is not configured in .env.local.");
  console.log("Add the token locally only; do not commit .env.local or paste the token into chat.");
  process.exit(0);
}

const sessionJwt = configuredJwt ?? (await getGuestJwt());
const authHeaders = {
  Authorization: `Bearer ${sessionJwt}`,
  "X-Api-Token": apiToken,
};

const fixtures = await requestJson("/api/fixtures/snapshot", authHeaders);
const scores = await requestJson(`/api/scores/snapshot/${fixtureId}`, authHeaders, { asOf });
const odds = await requestJson(`/api/odds/snapshot/${fixtureId}`, authHeaders, { asOf });

console.log("PASS TxLINE guest JWT resolved.");
console.log(`PASS fixtures snapshot records: ${countRecords(fixtures)}`);
console.log(`PASS score snapshot records for fixture ${fixtureId}: ${countRecords(scores)}`);
console.log(`PASS odds snapshot records for fixture ${fixtureId}: ${countRecords(odds)}`);
console.log("TxLINE probe complete. No token values were printed.");

async function getGuestJwt() {
  const payload = await requestJson("/auth/guest/start", undefined, undefined, "POST");
  const token = readToken(payload);

  if (!token) {
    throw new Error("Guest session response did not include a token field.");
  }

  return token;
}

async function requestJson(endpoint, headers, query, method = "GET") {
  const url = new URL(endpoint, `${apiBase.replace(/\/+$/, "")}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (typeof value === "number" && Number.isFinite(value)) {
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
