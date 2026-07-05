// Minimal TxLINE proxy for Cloudflare Workers or similar Fetch-compatible runtimes.
// Purpose: keep TXLINE_API_TOKEN server-side while GitHub Pages calls this proxy.
//
// Required environment variables:
//   TXLINE_API_TOKEN=real_txline_x_api_token
// Optional:
//   TXLINE_BASE=https://txline-dev.txodds.com
//   TXLINE_SESSION_JWT=preissued_guest_jwt
//   ALLOWED_ORIGIN=https://yuzhenjiang134.github.io
//
// Exposed proxy paths:
//   GET /__health
//   GET /api/fixtures/snapshot
//   GET /api/scores/snapshot/:fixtureId
//   GET /api/scores/stat-validation
//   GET /api/odds/snapshot/:fixtureId

let cachedGuestJwt = "";
const defaultTxlineBase = "https://txline-dev.txodds.com";

const allowedPathPatterns = [
  /^\/api\/fixtures\/snapshot$/,
  /^\/api\/scores\/snapshot\/[A-Za-z0-9_-]+$/,
  /^\/api\/scores\/stat-validation$/,
  /^\/api\/odds\/snapshot\/[A-Za-z0-9_-]+$/,
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") ?? "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const corsHeaders = buildCorsHeaders(origin, allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405, corsHeaders);
    }

    const url = new URL(request.url);
    const txlineBase = (env.TXLINE_BASE || defaultTxlineBase).replace(/\/+$/, "");

    if (url.pathname === "/__health" || url.pathname === "/api/health") {
      return json(
        {
          ok: true,
          service: "world-cup-live-pulse-txline-proxy",
          hasToken: Boolean(clean(env.TXLINE_API_TOKEN)),
          hasStaticGuestJwt: Boolean(clean(env.TXLINE_SESSION_JWT)),
          txlineBase,
          allowedOrigin: allowedOrigin === "*" ? "*" : "restricted",
          allowedPaths: [
            "/api/fixtures/snapshot",
            "/api/scores/snapshot/:fixtureId",
            "/api/scores/stat-validation",
            "/api/odds/snapshot/:fixtureId",
          ],
        },
        200,
        corsHeaders,
      );
    }

    if (!allowedPathPatterns.some((pattern) => pattern.test(url.pathname))) {
      return json({ error: "not_found" }, 404, corsHeaders);
    }

    const apiToken = clean(env.TXLINE_API_TOKEN);

    if (!apiToken) {
      return json({ error: "txline_token_missing" }, 503, corsHeaders);
    }

    try {
      const guestJwt = clean(env.TXLINE_SESSION_JWT) || (await getGuestJwt(txlineBase));
      const upstreamUrl = new URL(`${txlineBase}${url.pathname}${url.search}`);
      const upstream = await fetch(upstreamUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${guestJwt}`,
          "X-Api-Token": apiToken,
        },
      });
      const body = await upstream.arrayBuffer();
      const headers = new Headers(corsHeaders);
      headers.set("Cache-Control", "no-store");
      headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/json");

      return new Response(body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });
    } catch (error) {
      return json(
        {
          error: "txline_proxy_upstream_error",
          message: safeErrorMessage(error),
        },
        502,
        corsHeaders,
      );
    }
  },
};

async function getGuestJwt(txlineBase) {
  if (cachedGuestJwt) {
    return cachedGuestJwt;
  }

  const response = await fetch(`${txlineBase}/auth/guest/start`, { method: "POST" });
  const payload = await response.json();
  const token = payload.token || payload.jwt || payload.accessToken || payload.access_token;

  if (!token) {
    throw new Error("guest_jwt_missing");
  }

  cachedGuestJwt = token;
  return cachedGuestJwt;
}

function buildCorsHeaders(origin, allowedOrigin) {
  const resolvedOrigin = allowedOrigin === "*" ? "*" : origin === allowedOrigin ? origin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": resolvedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    Vary: "Origin",
  };
}

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function safeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 180);
}
