import { loadEnv, defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

function txlineDevProxy(env: Record<string, string>): Plugin {
  return {
    name: "txline-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/__txline", async (request, response, next) => {
        if (request.method !== "GET") {
          next();
          return;
        }

        const requestUrl = new URL(request.url ?? "/", "http://vite.local");
        const upstreamPath = requestUrl.pathname.replace(/^\/__txline/, "") || "/";
        const allowed =
          upstreamPath === "/api/fixtures/snapshot" ||
          /^\/api\/(scores|odds)\/snapshot\/.+/.test(upstreamPath) ||
          /^\/api\/scores\/historical\/\d+$/.test(upstreamPath) ||
          upstreamPath.startsWith("/api/scores/stat-validation");

        if (!allowed) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }

        const apiBase = (env.VITE_TXLINE_API_BASE || "https://txline-dev.txodds.com").replace(/\/+$/, "");
        const upstreamUrl = `${apiBase}${upstreamPath}${requestUrl.search}`;

        try {
          const upstream = await fetch(upstreamUrl, {
            headers: {
              Accept: "application/json",
              Authorization: env.VITE_TXLINE_SESSION_JWT ? `Bearer ${env.VITE_TXLINE_SESSION_JWT}` : "",
              "X-Api-Token": env.VITE_TXLINE_API_TOKEN ?? "",
            },
          });
          const body = await upstream.arrayBuffer();
          response.statusCode = upstream.status;
          response.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
          response.setHeader("Cache-Control", "no-store");
          response.end(Buffer.from(body));
        } catch {
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "TxLINE dev proxy unavailable" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: isGitHubPages ? "/world-cup-live-pulse/" : "/",
    plugins: [react(), txlineDevProxy(env)],
    server: {
      port: 5177,
      strictPort: false,
    },
  };
});
