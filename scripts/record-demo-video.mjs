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
      subtitle: "Current source-backed fixtures stay separate from ten verified 2026 replays. Stage, score, winner, and event totals appear only when the source confirms them.",
      badges: ["Current schedule", "10 verified replays", "6 progression stages"]
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
      kicker: "Consumer and Fan Experiences / Final judging cut",
      subtitle: "A fan-first second screen for live scores, verified key moments, score challenges, and fast catch-up.",
      narration: "World Cup Live Pulse is a fan-first matchday companion for live scores, verified key moments, score challenges, and fast catch-up.",
      voiceTone: "confident and inviting",
      voiceNote: "Open with warm energy and a clear sense of purpose. Do not sound like an advertisement.",
      bullets: ["Working public product", "TxLINE-powered live boundary", "Repeatable 2026 replay", "No betting or wallet"]
    },
    {
      image: "desktop-final.png",
      seconds: 12,
      title: "The match, the explanation, and the fan decision share one screen",
      subtitle: "Score, state, source freshness, AI brief, replay control, and the 1,000-point challenge lead the experience.",
      narration: "The first view answers what happened, when it was checked, what the AI can explain, and what the fan can do next.",
      voiceTone: "clear and reassuring",
      voiceNote: "Guide a football fan through the screen with calm confidence.",
      badges: ["Score first", "AI grounded in events", "1,000 local points"]
    },
    {
      image: "pulse-play-final.png",
      seconds: 17,
      title: "Verified events become a matchday mini-game",
      subtitle: "Pulse Play turns the same score and event frames into a rights-safe animated pitch for goals, cards, penalties, added time, and local team cheers.",
      narration: "The animated pitch turns goals, yellow cards, penalties, and stoppage time into original match action. Local reactions stay on this device.",
      voiceTone: "excited but controlled matchday energy",
      voiceNote: "Lift the energy for the football action, then clearly stress that cheers are local-only.",
      badges: ["Event-driven", "Rights-safe", "Local cheers"]
    },
    {
      kind: "compare",
      beforeImage: "challenge-before-final.png",
      afterImage: "desktop-final.png",
      seconds: 21,
      title: "A score challenge that actually settles",
      subtitle: "The fan spends local points once. A confirmed final score awards XP and points once, then survives refresh without duplicate settlement.",
      narration: "Before the result, a fan locks one prediction using local points. When the final whistle is confirmed, the score record settles once, awards progress, and stays consistent after refresh.",
      voiceTone: "energetic and precise",
      voiceNote: "Give the score challenge a little excitement, then slow down for the settlement proof.",
      badges: ["Before: 1,000 pts", "After: settled ledger", "No cash or wallet"]
    },
    {
      image: "fan-stand-final.png",
      seconds: 16,
      title: "Verified moments become a match channel",
      subtitle: "Goals, cards, substitutions, and full time open the matching replay moment, fan viewpoints, local reactions, and source-derived player records.",
      narration: "Each verified moment becomes a match channel with replay jumps, fan viewpoints, local reactions, and source-derived player records, all tied to the same event stream.",
      voiceTone: "immediate and inclusive matchday energy",
      voiceNote: "Sound like you are inviting fans into a useful conversation. Keep the event-source boundary clear without sounding technical.",
      badges: ["Event jump", "Fan viewpoints", "Player match record"]
    },
    {
      kind: "card",
      seconds: 19,
      title: "Real-time behavior has explicit trust rules",
      kicker: "15-second refresh + focus refresh + final-state guard",
      subtitle: "World Cup CompetitionId 72 is enforced. Provisional goals may be overturned. Empty odds disappear. Only game_finalised can settle a challenge.",
      narration: "Live mode refreshes every fifteen seconds and on focus. It rejects non-World-Cup fixtures, handles overturned goals, hides missing odds, and exposes the checked time.",
      voiceTone: "measured and trustworthy",
      voiceNote: "Sound factual and composed. Emphasize the safeguards rather than the technology.",
      bullets: ["No stale-current fallback", "No invented odds", "No duplicate settlement", "Checked time shown"]
    },
    {
      image: "tournament-final.png",
      seconds: 18,
      title: "Schedule, results, and progression are judgeable between matches",
      subtitle: "Current fixtures stay separate from ten verified 2026 replay sequences and source-confirmed knockout progress.",
      narration: "Between matches, official 2026 World Cup archives preserve scores, events, challenges, and progression. Every archive is labeled as completed.",
      voiceTone: "helpful catch-up",
      voiceNote: "Sound empathetic to a fan who missed the match and wants to catch up quickly.",
      badges: ["Current schedule", "10 verified replays", "Source-confirmed progression"]
    },
    {
      kind: "compare",
      beforeImage: "tournament-final.png",
      afterImage: "tournament-spoiler-final.png",
      seconds: 18,
      title: "Spoiler-free replay protects the catch-up experience",
      subtitle: "One switch masks final scores, winners, event totals, bracket outcomes, and team records, then starts the replay at minute one.",
      narration: "No-spoiler replay masks scores, winners, event totals, bracket results, and team records. Fans start at minute one and reveal the story through the timeline.",
      voiceTone: "considerate and clear",
      voiceNote: "Make this feel like a thoughtful fan feature, not a technical setting.",
      badges: ["Before: results visible", "After: outcomes masked", "Reveal through events"]
    },
    {
      kind: "compare",
      beforeImage: "teams-final.png",
      afterImage: "teams-favorite-final.png",
      seconds: 16,
      title: "A favorite team shortens the next fan task",
      subtitle: "One local star moves that team to the front of team, schedule, and next-replay views without creating an account or an empty recommendation feed.",
      narration: "A favorite team moves to the front of the team directory, schedule, and replay views. It stays on this device, with no account or invented recommendations.",
      voiceTone: "friendly and practical",
      voiceNote: "Use an easy conversational rhythm and a subtle smile.",
      badges: ["Local preference", "Schedule priority", "No account required"]
    },
    {
      image: "teams-favorite-final.png",
      seconds: 18,
      title: "Team detail is source-gated, not decorative",
      subtitle: "Appearances, results, goals for and against, cards, opponents, and replay links appear only when confirmed.",
      narration: "Team stats come only from verified match records. Player names appear only when the source provides a readable name, so fans never see internal identifiers.",
      voiceTone: "calm and transparent",
      voiceNote: "Explain the data boundary plainly and confidently, without sounding defensive.",
      badges: ["No-source means no-field", "Internal IDs hidden", "Replay evidence"]
    },
    {
      image: "settings-language-final.png",
      seconds: 16,
      title: "Eight complete languages, not a half-translated shell",
      subtitle: "English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic share the full flow; Arabic uses RTL.",
      narration: "Eight language packs cover the full supporter journey, including Arabic right-to-left, without untranslated interface fragments.",
      voiceTone: "inclusive and assured",
      voiceNote: "Sound globally welcoming while keeping the pace natural.",
      badges: ["8 languages", "Arabic RTL", "Shared feature parity"]
    },
    {
      image: "mobile-final.png",
      seconds: 17,
      title: "The full match flow works at 390 pixels",
      subtitle: "Score, AI brief, challenge, replay, navigation, and settings remain usable without horizontal overflow.",
      narration: "At three hundred ninety pixels, score, AI brief, challenge, replay, navigation, and settings remain usable without horizontal overflow.",
      voiceTone: "concise and confident",
      voiceNote: "Deliver this as a quick usability proof.",
      badges: ["390px verified", "Keyboard focus", "Reduced motion"]
    },
    {
      kind: "card",
      seconds: 15,
      title: "Official viewing entries, not unauthorized streams",
      kicker: "FIFA+ archive / highlights / official updates",
      subtitle: "The product keeps timeline replay available and opens official video or coverage only when territorial rights allow.",
      narration: "Official FIFA archives, highlights, and updates are the only video links. Timeline replay remains available wherever viewing access differs.",
      voiceTone: "responsible and reassuring",
      voiceNote: "Keep the rights and safety statement clear, steady, and positive.",
      bullets: ["Official links only", "Territory-aware wording", "No scraped stream", "Timeline always available"]
    },
    {
      kind: "card",
      seconds: 18,
      title: "TxLINE powers the authenticated live boundary",
      kicker: "CompetitionId 72 / World Cup only",
      subtitle: "The secure adapter loads fixtures, score snapshots, score events, and official odds when supplied. The public build contains no private token.",
      narration: "T X Line, from T X Odds, powers fixtures, score history, events, and official odds. Replay keeps judging repeatable, but is never presented as a live feed.",
      voiceTone: "precise and authoritative",
      voiceNote: "Pronounce T X Line as separate letters followed by Line. Keep the delivery technical but accessible.",
      bullets: ["POST /auth/guest/start", "GET /api/fixtures/snapshot", "GET /api/scores/snapshot/{fixtureId}", "GET /api/odds/snapshot/{fixtureId}"]
    },
    {
      kind: "card",
      seconds: 22,
      title: "Commercial value grows from the same trusted core",
      kicker: "Fan layer / communities / publishers / venues",
      subtitle: "The challenge creates repeat use. The source-aware match story can extend into community leaderboards, media widgets, venue screens, and localized sponsor activations.",
      narration: "The points challenge creates repeat use. The same trusted match story can support communities, publisher widgets, venue screens, and localized sponsor activations, without bets or cash.",
      voiceTone: "forward-looking and credible",
      voiceNote: "Show commercial confidence without a sales pitch or exaggerated claims.",
      bullets: ["Retention loop", "Community path", "Embeddable media", "Localization path"]
    },
    {
      kind: "card",
      seconds: 18,
      title: "Every submission claim has release evidence",
      kicker: "Research / tests / same-SHA deployment",
      subtitle: "Three acceptance rounds, public E2E, secret scanning, endpoint documentation, API feedback, CI, and Pages verification support the final build.",
      narration: "Public tests, credential scans, endpoint docs, API feedback, continuous integration, and Pages verification support every claim.",
      voiceTone: "measured and evidential",
      voiceNote: "Sound like a concise proof statement. Give each evidence item enough space.",
      bullets: ["Public site and repository", "No runtime errors", "Bundle secret scan", "Claims backed by tests"]
    },
    {
      kind: "card",
      seconds: 15,
      title: "World Cup Live Pulse",
      kicker: "A complete fan product",
      subtitle: "Fast to understand, useful during or after a match, globally accessible, source-aware, and ready for repeat judging.",
      narration: "World Cup Live Pulse is deployed, multilingual, source-aware, repeatable outside live match hours, and built for fans rather than developers.",
      voiceTone: "warm and confident close",
      voiceNote: "End with conviction and a human sense of completion, not a dramatic announcer voice.",
      bullets: ["No betting", "No trading advice", "No wallet custody", "No private token in public"]
    }
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
