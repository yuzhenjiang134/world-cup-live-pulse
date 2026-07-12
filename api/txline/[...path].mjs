const defaultTxlineBase = "https://txline-dev.txodds.com";
const defaultAllowedOrigin = "https://yuzhenjiang134.github.io";
let cachedGuestJwt = "";

const allowedPaths = [
  /^\/api\/fixtures\/snapshot$/,
  /^\/api\/scores\/snapshot\/\d+$/,
  /^\/api\/scores\/historical\/\d+$/,
  /^\/api\/scores\/stat-validation$/,
  /^\/api\/odds\/snapshot\/\d+$/,
];

export default async function handler(request, response) {
  const origin = headerValue(request.headers, "origin");
  const allowedOrigin = clean(process.env.ALLOWED_ORIGIN) || defaultAllowedOrigin;
  setCors(response, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (origin && origin !== allowedOrigin) {
    sendJson(response, 403, { error: "origin_not_allowed" });
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "method_not_allowed" });
    return;
  }

  const incoming = new URL(request.url, "https://world-cup-live-pulse.local");
  const upstreamPath = resolveUpstreamPath(incoming.pathname);

  if (upstreamPath === "/__health") {
    sendJson(response, 200, {
      ok: true,
      service: "world-cup-live-pulse-txline-proxy",
      hasToken: Boolean(clean(process.env.TXLINE_API_TOKEN)),
      competitionId: 72,
    });
    return;
  }

  if (!allowedPaths.some((pattern) => pattern.test(upstreamPath))) {
    sendJson(response, 404, { error: "not_found" });
    return;
  }

  const apiToken = clean(process.env.TXLINE_API_TOKEN);
  if (!apiToken) {
    sendJson(response, 503, { error: "txline_token_missing" });
    return;
  }

  try {
    const txlineBase = (clean(process.env.TXLINE_BASE) || defaultTxlineBase).replace(/\/+$/, "");
    const guestJwt = clean(process.env.TXLINE_SESSION_JWT) || (await getGuestJwt(txlineBase));
    const upstreamUrl = new URL(`${txlineBase}${upstreamPath}`);
    incoming.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));
    if (upstreamPath === "/api/fixtures/snapshot") upstreamUrl.searchParams.set("competitionId", "72");

    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${guestJwt}`,
        "X-Api-Token": apiToken,
      },
    });
    const contentType = upstream.headers.get("content-type") || "application/json";
    let body = await upstream.text();

    if (upstream.ok && upstreamPath === "/api/fixtures/snapshot") {
      const payload = body ? JSON.parse(body) : [];
      body = JSON.stringify(filterWorldCupFixtures(payload));
    }

    response.statusCode = upstream.status;
    response.setHeader("Content-Type", contentType);
    setNoStore(response);
    response.end(body);
  } catch (error) {
    sendJson(response, 502, {
      error: "txline_proxy_upstream_error",
      message: error instanceof Error ? error.message.slice(0, 160) : "Unknown proxy error",
    });
  }
}

function resolveUpstreamPath(pathname) {
  const prefix = "/api/txline";
  if (!pathname.startsWith(prefix)) return "";
  return pathname.slice(prefix.length) || "/__health";
}

function filterWorldCupFixtures(payload) {
  return (Array.isArray(payload) ? payload : []).filter((fixture) =>
    typeof fixture?.CompetitionId === "number"
      ? fixture.CompetitionId === 72
      : /\bworld cup\b/i.test(fixture?.Competition ?? ""),
  );
}

async function getGuestJwt(txlineBase) {
  if (cachedGuestJwt) return cachedGuestJwt;
  const response = await fetch(`${txlineBase}/auth/guest/start`, { method: "POST" });
  if (!response.ok) throw new Error(`guest_auth_${response.status}`);
  const payload = await response.json();
  const token = payload?.token;
  if (!token) throw new Error("guest_jwt_missing");
  cachedGuestJwt = token;
  return cachedGuestJwt;
}

function setCors(response, allowedOrigin) {
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
  response.setHeader("Vary", "Origin");
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  setNoStore(response);
  response.end(JSON.stringify(payload));
}

function setNoStore(response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
}

function headerValue(headers, key) {
  const value = headers?.[key] ?? headers?.[key.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}
