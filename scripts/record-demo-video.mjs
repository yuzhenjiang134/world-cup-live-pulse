import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const demoDir = path.join(root, "demo-assets");
const screenshotDir = path.join(demoDir, "screenshots");
const statusPath = path.join(demoDir, "video-status.json");
const variant = (process.argv.find((arg) => arg.startsWith("--variant="))?.split("=")[1] ?? "A").toUpperCase();
if (!new Set(["A", "B"]).has(variant)) throw new Error("Demo variant must be A or B.");
const outputPath = path.join(demoDir, `world-cup-live-pulse-demo-${variant.toLowerCase()}.webm`);
const autoOpen = process.argv.includes("--auto");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage: npm run demo:video

Starts a local 127.0.0.1 recorder page that generates variant A by default:
  demo-assets/world-cup-live-pulse-demo-a.webm

Use -- --variant=B for the judging/data-story cut:
  demo-assets/world-cup-live-pulse-demo-b.webm

Add --auto to launch the isolated recorder browser automatically.

The browser must open the printed local URL and wait until demo-assets/video-status.json reports "complete".

The output video is ignored by git and should be uploaded to Loom, YouTube, or another public video host before final submission.`);
  process.exit(0);
}

const sharedClose = {
  kind: "card",
  seconds: 14,
  title: "A complete fan product, not a data demo",
  kicker: "World Cup Live Pulse",
  subtitle: "Deployed, documented, multilingual, source-aware, and repeatable for judges outside live match hours.",
  bullets: ["No betting or trading", "No wallet custody", "No private token in the public build", "Official viewing links only"]
};

const sceneSets = {
  A: [
    {
      kind: "card",
      seconds: 14,
      title: "World Cup Live Pulse",
      kicker: "Fan journey cut / Consumer and Fan Experiences",
      subtitle: "A fan-first second screen for the four jobs that matter: follow the score, catch key events, understand the road ahead, and recover what you missed.",
      bullets: ["Working public product", "Verified match boundaries", "Score challenge", "Replay catch-up"]
    },
    {
      image: "01-current-match-center.png",
      seconds: 30,
      title: "1. The match and the fan decision share one screen",
      subtitle: "Verified score and status lead. The 1,000-point local challenge sits directly below, settles once from a confirmed final score, and never uses cash or a wallet.",
      badges: ["1,000 local points", "One verified settlement", "No wagering"]
    },
    {
      kind: "card",
      seconds: 18,
      title: "Key moments become the fastest way back into a match",
      kicker: "Goals / cards / score review / half-time / full-time",
      subtitle: "Compact event shortcuts jump to the exact replay minute. AI text and optional spoken commentary stay grounded in the same normalized score and event stream.",
      bullets: ["No missed event context", "One-tap catch-up", "Event-grounded AI", "Follow verified changes"]
    },
    {
      image: "02-current-tournament.png",
      seconds: 24,
      title: "2. Schedule, results, and progression are readable at a glance",
      subtitle: "Current source-backed fixtures stay separate from eight verified 2026 replays. Stage, score, winner, and event totals appear only when the source confirms them.",
      badges: ["Current schedule", "8 verified replays", "6 progression stages"]
    },
    {
      image: "03-current-spoiler.png",
      seconds: 20,
      title: "3. Spoiler-free replay protects the catch-up experience",
      subtitle: "One control masks final scores, winners, event totals, bracket outcomes, and team-result detail, then opens the replay at minute one.",
      badges: ["No final score", "Start at 1'", "Reveal through events"]
    },
    {
      image: "04-current-teams.png",
      seconds: 20,
      title: "4. Team and source-player detail remains one click away",
      subtitle: "The atlas derives appearances, wins, goals, cards, opponents, and replay links from confirmed archive records instead of filling unsupported roster fields.",
      badges: ["Source-derived records", "No placeholder lineups", "Direct replay links"]
    },
    {
      image: "05-current-mobile.png",
      seconds: 18,
      title: "5. The same match flow works on a phone",
      subtitle: "Responsive navigation, score, AI brief, challenge, replay, and eight-language support keep the essential fan path usable at 390 pixels.",
      badges: ["390px verified", "8 languages", "Arabic RTL"]
    },
    {
      kind: "card",
      seconds: 22,
      title: "TxLINE powers the authenticated live boundary",
      kicker: "CompetitionId 72 / World Cup only",
      subtitle: "The local secure adapter loads fixtures, score history, and official odds when supplied. Empty odds stay hidden, and historical data never masquerades as live.",
      bullets: ["POST /auth/guest/start", "GET /api/fixtures/snapshot", "GET /api/scores/snapshot/{fixtureId}", "GET /api/odds/snapshot/{fixtureId}"]
    },
    sharedClose
  ],
  B: [
    {
      kind: "card",
      seconds: 14,
      title: "World Cup Live Pulse",
      kicker: "Judging and data-trust cut",
      subtitle: "Real-time responsiveness, original fan interaction, commercial value, and complete execution in one working product.",
      bullets: ["Public site", "Public repository", "TxLINE integration", "Repeatable 2026 replay"]
    },
    {
      image: "01-current-match-center.png",
      seconds: 28,
      title: "Fan accessibility starts with hierarchy",
      subtitle: "The first viewport answers what happened, when it was checked, what the AI can explain, and what the fan can do next. Developer diagnostics stay outside this path.",
      badges: ["Score first", "Challenge second", "Secondary detail later"]
    },
    {
      kind: "card",
      seconds: 24,
      title: "Real-time behavior has explicit trust rules",
      kicker: "15-second refresh + focus refresh + final-state guard",
      subtitle: "CompetitionId 72 is enforced, Friendlies 430 is rejected, provisional goals can be overturned, and only game_finalised settles a score challenge.",
      bullets: ["No stale-current fallback", "No invented odds", "No duplicate settlement", "Checked time shown"]
    },
    {
      image: "02-current-tournament.png",
      seconds: 22,
      title: "A complete product remains judgeable between matches",
      subtitle: "Eight credential-free 2026 TxLINE replay sequences preserve the score, events, AI, challenge, schedule, and progression story without labeling archive data as live.",
      badges: ["2026 archive", "Verified finals", "Repeatable judging"]
    },
    {
      image: "03-current-spoiler.png",
      seconds: 18,
      title: "Original fan value: spoiler-free catch-up",
      subtitle: "Fans can replay from minute one while every outcome-bearing field remains masked. This turns match data into a deliberate viewing experience, not another score table.",
      badges: ["Outcome mask", "Minute-one start", "Event reveal"]
    },
    {
      image: "04-current-teams.png",
      seconds: 18,
      title: "Depth is source-gated, not decorative",
      subtitle: "Team and player records are derived only from confirmed events. Lineups, injuries, xG, and unsupported stats do not render until a verified endpoint supplies them.",
      badges: ["No-source means no-field", "Replay evidence", "Clean team detail"]
    },
    {
      image: "05-current-mobile.png",
      seconds: 18,
      title: "Global and mobile by design",
      subtitle: "Eight complete language packs, Arabic RTL, keyboard focus, reduced motion, and a verified 390-pixel layout support mainstream non-technical fans.",
      badges: ["8 complete languages", "RTL", "Responsive"]
    },
    {
      kind: "card",
      seconds: 22,
      title: "Commercial value follows the same trusted core",
      kicker: "Free fan layer / community / publisher widget / broadcaster",
      subtitle: "The local score challenge creates repeat use. The same source-aware match story can serve fan communities, media products, venue screens, and localized sponsor activations.",
      bullets: ["Retention loop", "Community path", "Embeddable media path", "Localization path"]
    },
    {
      kind: "card",
      seconds: 22,
      title: "Submission evidence is built into the release",
      kicker: "Same-SHA release acceptance",
      subtitle: "Three research rounds, three local acceptance rounds, successful CI and Pages on one commit, public E2E, secret scanning, endpoint documentation, and API feedback.",
      bullets: ["CI + Pages success", "Public bundle scanned", "No runtime errors", "Claims backed by tests or docs"]
    },
    sharedClose
  ]
};

const scenes = sceneSets[variant];

if (process.argv.includes("--print-manifest")) {
  console.log(JSON.stringify({ variant, scenes }, null, 2));
  process.exit(0);
}

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
        statusEl.textContent = ${JSON.stringify(`Complete: demo-assets/world-cup-live-pulse-demo-${variant.toLowerCase()}.webm`)};
        window.__demoComplete = true;
      };
      recorder.start(1000);
      const started = performance.now();
      let lastReportedSecond = -1;
      function tick(now) {
        const elapsed = Math.min(totalMs, now - started);
        drawFrame(elapsed);
        statusEl.textContent = "Recording captioned demo... " + Math.floor(elapsed / 1000) + " / " + Math.ceil(totalMs / 1000) + "s";
        const elapsedSecond = Math.floor(elapsed / 1000);
        if (elapsedSecond !== lastReportedSecond) {
          lastReportedSecond = elapsedSecond;
          fetch("/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elapsedSecond, totalSecond: Math.ceil(totalMs / 1000) })
          }).catch(() => {});
        }
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

  if (req.method === "POST" && url.pathname === "/progress") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const progress = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        writeStatus({ state: "recording", variant, ...progress });
      } catch {
        writeStatus({ state: "recording", variant });
      }
      res.writeHead(204);
      res.end();
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
  console.log(`Demo ${variant} recorder ready: ${recorderUrl}`);
  console.log(`Output: ${outputPath}`);

  if (autoOpen) {
    const edgePath = process.env.EDGE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\144.0.3719.115\\msedge.exe";
    const profileDir = path.join(os.tmpdir(), `wclp-demo-${variant.toLowerCase()}-${Date.now()}`);
    const browser = spawn(edgePath, [
      "--headless=new",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--no-first-run",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      `--user-data-dir=${profileDir}`,
      recorderUrl
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let diagnostics = "";
    browser.stderr.on("data", (chunk) => {
      diagnostics = `${diagnostics}${chunk}`.slice(-4000);
    });
    browser.on("exit", async (code) => {
      if (fs.existsSync(outputPath)) return;
      writeStatus({ state: "failed", variant, error: `Recorder browser exited ${code}.`, diagnostics });
      await fsp.rm(profileDir, { recursive: true, force: true }).catch(() => {});
      server.close();
    });
    server.on("close", async () => {
      browser.kill();
      await fsp.rm(profileDir, { recursive: true, force: true }).catch(() => {});
    });
  }
});

setTimeout(() => {
  writeStatus({ state: "timeout", outputPath });
  server.close();
}, 1000 * 60 * 6).unref();
