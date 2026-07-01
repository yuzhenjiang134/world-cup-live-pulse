import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const demoDir = path.join(root, "demo-assets");
const screenshotDir = path.join(demoDir, "screenshots");
const statusPath = path.join(demoDir, "video-status.json");
const outputPath = path.join(demoDir, "world-cup-live-pulse-demo.webm");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage: npm run demo:video

Starts a local 127.0.0.1 recorder page that generates:
  demo-assets/world-cup-live-pulse-demo.webm

The browser must open the printed local URL and wait until demo-assets/video-status.json reports "complete".

The output video is ignored by git and should be uploaded to Loom, YouTube, or another public video host before final submission.`);
  process.exit(0);
}

const scenes = [
  {
    kind: "card",
    seconds: 11,
    title: "World Cup Live Pulse",
    kicker: "Superteam Earn x TxODDS / Consumer and Fan Experiences",
    subtitle: "A fan-first second screen: score, events, market mood, AI-style read, source truth.",
    bullets: ["Working app", "Public repo", "Demo under 5 minutes", "TxLINE live boundary"]
  },
  {
    image: "01-fan-home.png",
    seconds: 18,
    title: "1. Fan opens the match pulse",
    subtitle: "The first screen answers: what is happening now, should I keep watching, and where did the data come from?",
    badges: ["Replay ready", "Source timestamp", "No betting"]
  },
  {
    image: "02-settings-language.png",
    seconds: 15,
    title: "2. Settings stay out of the main view",
    subtitle: "Language, presets, and optional modules move into Settings so the live match surface stays clean.",
    badges: ["8 languages", "Fan / Analyst / Judge", "Optional modules"]
  },
  {
    image: "03-judge-mode.png",
    seconds: 18,
    title: "3. Judge mode makes the demo repeatable",
    subtitle: "Reviewers can see operation guide, fixture context, demo chapters, and evaluation mapping without waiting for a live match.",
    badges: ["Judgeable anytime", "Replay chapters", "Complete flow"]
  },
  {
    image: "04-data-panels.png",
    seconds: 18,
    title: "4. Data consistency is visible",
    subtitle: "Replay, Seed, Delay, and Live are separate states. The app does not invent live games on no-match days.",
    badges: ["Source Board", "Data Audit", "Live Readiness"]
  },
  {
    image: "05-trust-operator.png",
    seconds: 18,
    title: "5. Buyer value is explicit",
    subtitle: "Operator Kit explains why venues, communities, and media pages could license this after real live data is connected.",
    badges: ["Venue screen", "Community layer", "Media embed"]
  },
  {
    image: "06-live-token-boundary.png",
    seconds: 18,
    title: "6. Live mode is honest",
    subtitle: "Without official credentials, Live shows a token-needed state instead of pretending replay data is real-time.",
    badges: ["Needs TxLINE token", "Secure proxy planned", "No token in browser"]
  },
  {
    kind: "card",
    seconds: 18,
    title: "TxLINE backend mapping",
    kicker: "Official docs rechecked 2026-07-01",
    subtitle: "The adapter maps official payloads into one MatchData model for the UI.",
    bullets: [
      "POST /auth/guest/start",
      "GET /api/fixtures/snapshot",
      "GET /api/scores/snapshot/{fixtureId}",
      "GET /api/odds/snapshot/{fixtureId}",
      "SSE streams planned for real-time updates"
    ]
  },
  {
    kind: "card",
    seconds: 12,
    title: "Submission-ready posture",
    kicker: "Safe fan experience, not a betting product",
    subtitle: "No wallet custody, no trading advice, no prediction market, no private API token in the public build.",
    bullets: ["Deployed GitHub Pages", "Public repo", "Technical docs", "API feedback path", "Video draft generated"]
  }
];

await fsp.mkdir(demoDir, { recursive: true });
await fsp.writeFile(
  statusPath,
  JSON.stringify({ state: "starting", outputPath, updatedAt: new Date().toISOString() }, null, 2)
);

function writeStatus(extra) {
  fs.writeFileSync(
    statusPath,
    JSON.stringify({ updatedAt: new Date().toISOString(), outputPath, ...extra }, null, 2)
  );
}

function contentType(filePath) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

function html() {
  const publicScenes = scenes.map((scene) => ({
    ...scene,
    ms: Math.max(1000, Math.round(scene.seconds * 1000))
  }));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>World Cup Live Pulse Demo Recorder</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #10191d; color: #f6fbfa; font-family: Inter, Arial, sans-serif; }
    main { width: min(96vw, 1280px); }
    canvas { width: 100%; aspect-ratio: 16 / 9; display: block; border-radius: 12px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.38); background: #142126; }
    p { color: #b8c9c8; }
    code { color: #ffe49a; }
  </style>
</head>
<body>
  <main>
    <canvas id="stage" width="1280" height="720"></canvas>
    <p id="status">Preparing recorder...</p>
  </main>
  <script>
    const scenes = ${JSON.stringify(publicScenes)};
    const canvas = document.getElementById("stage");
    const ctx = canvas.getContext("2d");
    const statusEl = document.getElementById("status");
    const W = canvas.width;
    const H = canvas.height;
    const totalMs = scenes.reduce((sum, scene) => sum + scene.ms, 0);
    const images = new Map();

    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = "/screenshots/" + src;
      });
    }

    function roundRect(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    function fillRound(x, y, w, h, r, fill) {
      roundRect(x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function drawText(text, x, y, maxWidth, size, weight, color, lineHeight = 1.25) {
      ctx.font = weight + " " + size + "px Inter, Arial, sans-serif";
      ctx.fillStyle = color;
      const words = String(text).split(" ");
      const lines = [];
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      lines.slice(0, 4).forEach((item, index) => ctx.fillText(item, x, y + index * size * lineHeight));
      return lines.length * size * lineHeight;
    }

    function drawBadges(items, x, y) {
      let cursor = x;
      for (const item of items || []) {
        ctx.font = "800 20px Inter, Arial, sans-serif";
        const width = Math.min(330, ctx.measureText(item).width + 34);
        fillRound(cursor, y, width, 42, 20, "rgba(255, 228, 154, 0.94)");
        ctx.fillStyle = "#152126";
        ctx.fillText(item, cursor + 17, y + 28);
        cursor += width + 12;
      }
    }

    function drawCardScene(scene, progress) {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#111f23");
      grad.addColorStop(0.48, "#1f5b54");
      grad.addColorStop(1, "#f3d777");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.12;
      for (let x = -100; x < W + 120; x += 80) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + Math.sin(progress * 6 + x) * 20, 0, 1, H);
      }
      ctx.globalAlpha = 1;
      fillRound(70, 84, 1140, 552, 28, "rgba(15, 27, 31, 0.82)");
      drawText(scene.kicker || "World Cup Live Pulse", 118, 160, 940, 26, "900", "#ffe49a");
      drawText(scene.title, 118, 246, 940, 68, "950", "#ffffff", 1.05);
      drawText(scene.subtitle, 122, 378, 900, 30, "750", "#d7e8e5", 1.28);
      let y = 486;
      for (const bullet of scene.bullets || []) {
        fillRound(122, y - 26, 18, 18, 9, "#ffe49a");
        drawText(bullet, 154, y - 8, 840, 24, "800", "#ffffff", 1.2);
        y += 36;
      }
    }

    function drawImageScene(scene, sceneProgress) {
      const img = images.get(scene.image);
      ctx.fillStyle = "#0f1d22";
      ctx.fillRect(0, 0, W, H);
      const scale = 1.03 + sceneProgress * 0.035;
      const imgW = W * scale;
      const imgH = H * scale;
      const x = (W - imgW) / 2 + Math.sin(sceneProgress * Math.PI) * 10;
      const y = (H - imgH) / 2;
      ctx.drawImage(img, x, y, imgW, imgH);
      const shade = ctx.createLinearGradient(0, 0, 0, H);
      shade.addColorStop(0, "rgba(10, 18, 21, 0.18)");
      shade.addColorStop(0.55, "rgba(10, 18, 21, 0.12)");
      shade.addColorStop(1, "rgba(10, 18, 21, 0.72)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);

      fillRound(44, 456, 1192, 206, 24, "rgba(12, 24, 28, 0.88)");
      drawText(scene.title, 78, 512, 820, 42, "950", "#ffffff", 1.08);
      drawText(scene.subtitle, 80, 568, 960, 26, "750", "#d8e8e6", 1.25);
      drawBadges(scene.badges, 80, 606);
    }

    function drawFrame(elapsed) {
      let cursor = 0;
      let scene = scenes[scenes.length - 1];
      let local = 0;
      for (const item of scenes) {
        if (elapsed < cursor + item.ms) {
          scene = item;
          local = elapsed - cursor;
          break;
        }
        cursor += item.ms;
      }
      const sceneProgress = Math.max(0, Math.min(1, local / scene.ms));
      if (scene.image) drawImageScene(scene, sceneProgress);
      else drawCardScene(scene, sceneProgress);

      const progress = Math.max(0, Math.min(1, elapsed / totalMs));
      fillRound(44, 678, 1192, 10, 5, "rgba(255,255,255,0.18)");
      fillRound(44, 678, 1192 * progress, 10, 5, "#ffe49a");
      ctx.font = "900 18px Inter, Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.76)";
      ctx.fillText("World Cup Live Pulse demo - " + Math.ceil(totalMs / 1000) + " seconds", 44, 42);
      ctx.fillText("Replay / Seed / Live truth labels", 904, 42);
    }

    async function run() {
      for (const scene of scenes) {
        if (scene.image) images.set(scene.image, await loadImage(scene.image));
      }
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const chunks = [];
      const stream = canvas.captureStream(24);
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2600000 });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mime });
        statusEl.textContent = "Uploading generated video...";
        const response = await fetch("/upload", { method: "POST", headers: { "Content-Type": mime }, body: blob });
        if (!response.ok) throw new Error("Upload failed");
        statusEl.textContent = "Complete: demo-assets/world-cup-live-pulse-demo.webm";
        window.__demoComplete = true;
      };
      recorder.start(1000);
      const started = performance.now();
      function tick(now) {
        const elapsed = Math.min(totalMs, now - started);
        drawFrame(elapsed);
        statusEl.textContent = "Recording captioned demo... " + Math.floor(elapsed / 1000) + " / " + Math.ceil(totalMs / 1000) + "s";
        if (elapsed < totalMs) requestAnimationFrame(tick);
        else recorder.stop();
      }
      requestAnimationFrame(tick);
    }

    run().catch((error) => {
      statusEl.textContent = "Recorder failed: " + error.message;
      fetch("/failed", { method: "POST", body: error.stack || error.message }).catch(() => {});
    });
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html());
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/screenshots/")) {
    const name = path.basename(url.pathname);
    const filePath = path.join(screenshotDir, name);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("missing screenshot");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/status") {
    const status = fs.existsSync(statusPath) ? fs.readFileSync(statusPath, "utf8") : "{}";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(status);
    return;
  }

  if (req.method === "POST" && url.pathname === "/upload") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      await fsp.writeFile(outputPath, buffer);
      writeStatus({ state: "complete", bytes: buffer.length, seconds: scenes.reduce((sum, scene) => sum + scene.seconds, 0) });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, outputPath, bytes: buffer.length }));
      setTimeout(() => server.close(), 400);
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/failed") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      writeStatus({ state: "failed", error: Buffer.concat(chunks).toString("utf8") });
      res.writeHead(200);
      res.end("recorded");
      setTimeout(() => server.close(), 400);
    });
    return;
  }

  res.writeHead(404);
  res.end("not found");
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  const recorderUrl = `http://127.0.0.1:${address.port}/`;
  writeStatus({ state: "ready", recorderUrl, outputPath });
  console.log(`Demo recorder ready: ${recorderUrl}`);
  console.log(`Output: ${outputPath}`);
});

setTimeout(() => {
  writeStatus({ state: "timeout", outputPath });
  server.close();
}, 1000 * 60 * 6).unref();
