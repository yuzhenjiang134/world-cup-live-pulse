import assert from "node:assert/strict";

process.env.TXLINE_API_TOKEN = "test-token";
process.env.TXLINE_BASE = "https://txline.test";
process.env.ALLOWED_ORIGIN = "https://yuzhenjiang134.github.io";

const calls = [];
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  calls.push({ url, init });
  if (url.endsWith("/auth/guest/start")) {
    return new Response(JSON.stringify({ token: "test-guest-jwt" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify([
    { FixtureId: 1, CompetitionId: 72, Competition: "World Cup" },
    { FixtureId: 2, CompetitionId: 430, Competition: "Friendlies" },
  ]), { status: 200, headers: { "content-type": "application/json" } });
};

const { default: handler } = await import("../api/txline/[...path].mjs");

const success = mockResponse();
await handler({
  method: "GET",
  url: "/api/txline/api/fixtures/snapshot?competitionId=430",
  headers: { origin: "https://yuzhenjiang134.github.io" },
}, success);
assert.equal(success.statusCode, 200);
assert.deepEqual(JSON.parse(success.body), [{ FixtureId: 1, CompetitionId: 72, Competition: "World Cup" }]);
assert.match(calls.at(-1).url, /competitionId=72/);
assert.equal(calls.at(-1).init.headers["X-Api-Token"], "test-token");
assert.equal(calls.at(-1).init.headers.Authorization, "Bearer test-guest-jwt");
assert.doesNotMatch(success.body, /test-token|test-guest-jwt/);
assert.match(success.headers["Cache-Control"], /no-store/);
assert.equal(success.headers["CDN-Cache-Control"], "no-store");
assert.equal(success.headers["Vercel-CDN-Cache-Control"], "no-store");

const sameOrigin = mockResponse();
await handler({
  method: "GET",
  url: "/api/txline/__health",
  headers: {
    origin: "https://world-cup-live-pulse.vercel.app",
    host: "world-cup-live-pulse.vercel.app",
    "x-forwarded-proto": "https",
  },
}, sameOrigin);
assert.equal(sameOrigin.statusCode, 200);
assert.equal(sameOrigin.headers["Access-Control-Allow-Origin"], "https://world-cup-live-pulse.vercel.app");

const forbidden = mockResponse();
await handler({ method: "GET", url: "/api/txline/api/fixtures/snapshot", headers: { origin: "https://evil.example" } }, forbidden);
assert.equal(forbidden.statusCode, 403);

const disallowed = mockResponse();
await handler({ method: "GET", url: "/api/txline/api/token/activate", headers: { origin: "https://yuzhenjiang134.github.io" } }, disallowed);
assert.equal(disallowed.statusCode, 404);

const historical = mockResponse();
await handler({ method: "GET", url: "/api/txline/api/scores/historical/18209181", headers: { origin: "https://yuzhenjiang134.github.io" } }, historical);
assert.equal(historical.statusCode, 200);
assert.match(calls.at(-1).url, /\/api\/scores\/historical\/18209181/);

const health = mockResponse();
await handler({ method: "GET", url: "/api/txline/__health", headers: { origin: "https://yuzhenjiang134.github.io" } }, health);
assert.deepEqual(JSON.parse(health.body), {
  ok: true,
  service: "world-cup-live-pulse-txline-proxy",
  hasToken: true,
  competitionId: 72,
});

console.log("PASS Vercel TxLINE proxy origin, path, secret, World Cup scope, and no-store guards");

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(value = "") { this.body = value; },
  };
}
