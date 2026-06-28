import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

export default defineConfig({
  base: isGitHubPages ? "/world-cup-live-pulse/" : "/",
  plugins: [react()],
  server: {
    port: 5177,
    strictPort: false,
  },
});
