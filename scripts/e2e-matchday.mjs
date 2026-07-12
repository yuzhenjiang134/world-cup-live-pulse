import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const edgePath = process.env.EDGE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\144.0.3719.115\\msedge.exe";
const appUrl = process.env.MATCHDAY_URL ?? "http://127.0.0.1:5180/?mode=replay&replay=txline-archive-18209181&minute=90";
const baseEntryUrl = new URL(".", appUrl).toString();
const port = 9300 + Math.floor(Math.random() * 500);
const profileDir = path.join(os.tmpdir(), `wclp-e2e-${Date.now()}`);
let edgeDiagnostics = "";
const edge = spawn(edgePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  appUrl,
], { stdio: ["ignore", "ignore", "pipe"] });
edge.stderr.on("data", (chunk) => {
  edgeDiagnostics = `${edgeDiagnostics}${chunk}`.slice(-2000);
});

let socket;

try {
  const target = await waitForTarget(port, edge);
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  const runtimeIssues = [];
  const cdp = createCdpClient(socket, (message) => {
    if (message.method === "Runtime.exceptionThrown") runtimeIssues.push(message.params?.exceptionDetails?.exception?.description ?? message.params?.exceptionDetails?.text ?? "Runtime exception");
    if (message.method === "Log.entryAdded" && message.params?.entry?.level === "error") runtimeIssues.push(message.params.entry.text);
  });
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await waitForCondition(cdp, "Boolean(document.querySelector('#root'))", 30_000);
  await cdp.send("Storage.clearDataForOrigin", { origin: new URL(appUrl).origin, storageTypes: "local_storage" });
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForCondition(cdp, "Boolean(document.querySelector('.challenge-block'))", 30_000);

  const desktopLayout = await evaluate(cdp, `({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    body: document.body.innerText.slice(0, 500),
    challenge: Boolean(document.querySelector('.challenge-block')),
    level: Boolean(document.querySelector('.challenge-level')),
    timeline: Boolean(document.querySelector('.timeline-slider')),
    scheduleMoments: document.querySelectorAll('.schedule-moments').length,
    challengeWidth: document.querySelector('.challenge-block')?.getBoundingClientRect().width ?? 0,
    heroWidth: document.querySelector('.score-hero')?.getBoundingClientRect().width ?? 0,
    challengeTop: document.querySelector('.challenge-block')?.getBoundingClientRect().top ?? 0,
    signalTop: document.querySelector('.signal-row')?.getBoundingClientRect().top ?? 0,
    scoreSteppers: document.querySelectorAll('.score-stepper button').length,
  })`);
  console.log(`Desktop layout ${JSON.stringify(desktopLayout)}`);
  if (runtimeIssues.length) console.log(`Runtime issues ${JSON.stringify(runtimeIssues)}`);
  assert.equal(desktopLayout.scrollWidth, desktopLayout.viewport);
  assert.equal(desktopLayout.challenge, true);
  assert.equal(desktopLayout.level, true);
  assert.equal(desktopLayout.timeline, true);
  assert.ok(desktopLayout.scheduleMoments > 0);
  assert.ok(desktopLayout.challengeWidth >= desktopLayout.heroWidth * 0.98);
  assert.ok(desktopLayout.challengeTop < desktopLayout.signalTop);
  assert.equal(desktopLayout.scoreSteppers, 4);
  assert.doesNotMatch(desktopLayout.body, /2022/);

  assert.match(await buttonText(cdp, ".challenge-block .primary-button"), /50/);
  assert.match(await blockText(cdp, ".challenge-block"), /1,000\s+pts/);

  await evaluate(cdp, `(() => {
    const inputs = document.querySelectorAll('.challenge-score input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(inputs[0], '2'); inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    setter.call(inputs[1], '0'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);

  await evaluate(cdp, "document.querySelector('.challenge-block .primary-button').click(); true");
  await wait(350);
  const settledText = await blockText(cdp, ".challenge-block");
  assert.match(settledText, /1,200\s+pts/);
  assert.match(settledText, /已结算/);
  assert.equal(await elementCount(cdp, ".challenge-history:not(.demo-history) .challenge-history-list > div"), 1);
  assert.equal(await elementCount(cdp, ".demo-history .challenge-history-list > div"), 8);
  assert.match(settledText, /赛季演示/);
  assert.match(settledText, /FRA 2:0 MAR/);

  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForCondition(cdp, "Boolean(document.querySelector('.challenge-block'))", 30_000);
  const restoredText = await blockText(cdp, ".challenge-block");
  assert.match(restoredText, /1,200\s+pts/);
  assert.match(restoredText, /已结算/);
  assert.equal(await elementCount(cdp, ".challenge-history:not(.demo-history) .challenge-history-list > div"), 1);
  assert.equal(await elementCount(cdp, ".demo-history .challenge-history-list > div"), 8);
  assert.equal(await elementCount(cdp, ".challenge-block .secondary-button"), 1);
  assert.equal(await elementCount(cdp, ".commentary-audio"), 1);
  assert.match(await blockText(cdp, ".hero-ai-brief"), /法国 2-0 摩洛哥/);
  assert.doesNotMatch(await blockText(cdp, ".hero-ai-brief"), /France|Morocco/);
  assert.equal(await elementCount(cdp, ".follow-button"), 1);
  await evaluate(cdp, "document.querySelector('.follow-button').click(); true");
  await waitForCondition(cdp, "Boolean(localStorage.getItem('wclp-followed-match'))", 5_000);
  assert.equal(await elementCount(cdp, ".follow-button.active"), 1);
  await evaluate(cdp, "document.querySelector('.follow-button').click(); true");
  await waitForCondition(cdp, "!localStorage.getItem('wclp-followed-match')", 5_000);
  assert.equal(await elementCount(cdp, ".follow-button.active"), 0);
  assert.equal(await elementCount(cdp, ".official-video-links a"), 3);
  const desktopCapture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.resolve("demo-assets/desktop-final.png"), Buffer.from(desktopCapture.data, "base64"));

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await cdp.send("Page.navigate", { url: baseEntryUrl });
  await waitForCondition(cdp, "Boolean(document.querySelector('.score-line'))", 30_000);
  const mobileLayout = await evaluate(cdp, `(() => {
    const rect = (selector, index = 0) => {
      const element = document.querySelectorAll(selector)[index];
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, width: box.width };
    };
    return {
      url: location.href,
      body: document.body.innerText.slice(0, 240),
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      score: rect('.score-line'),
      home: rect('.team-side', 0),
      away: rect('.team-side', 1),
      actions: rect('.top-actions'),
      awayText: document.querySelectorAll('.team-side')[1]?.innerText ?? '',
      awayCode: rect('.team-side .team-code', 1),
      awayName: rect('.team-side strong', 1),
    };
  })()`);
  console.log(`Mobile layout ${JSON.stringify(mobileLayout)}`);
  assert.equal(mobileLayout.scrollWidth, mobileLayout.viewport);
  assert.ok(mobileLayout.home.left >= 0 && mobileLayout.home.right <= mobileLayout.viewport);
  assert.ok(mobileLayout.away.left >= 0 && mobileLayout.away.right <= mobileLayout.viewport);
  assert.ok(mobileLayout.awayText.trim().length > 3);
  assert.doesNotMatch(mobileLayout.awayText, /TBD|undefined/);
  assert.ok(mobileLayout.awayCode.width > 0 && mobileLayout.awayName.width > 0);
  assert.ok(mobileLayout.actions.left >= 0 && mobileLayout.actions.right <= mobileLayout.viewport);
  const checkedBeforeFocus = await evaluate(cdp, "document.querySelectorAll('.truth-meta strong')[0]?.textContent ?? ''");
  await evaluate(cdp, "window.dispatchEvent(new Event('focus')); true");
  await waitForCondition(cdp, `document.querySelectorAll('.truth-meta strong')[0]?.textContent !== ${JSON.stringify(checkedBeforeFocus)}`, 30_000);
  const mobileCapture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.resolve("demo-assets/mobile-final.png"), Buffer.from(mobileCapture.data, "base64"));

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[1].click(); true");
  await wait(350);
  const tournamentLayout = await evaluate(cdp, `({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    archiveCards: document.querySelectorAll('.archive-match-card').length,
    bracketLanes: document.querySelectorAll('.bracket-lane').length,
    currentCards: document.querySelectorAll('.current-fixture-grid article').length,
    currentBand: Boolean(document.querySelector('.current-fixtures')),
    detail: Boolean(document.querySelector('.team-detail-panel')),
    text: document.querySelector('.tournament-view')?.innerText ?? '',
  })`);
  assert.equal(tournamentLayout.scrollWidth, tournamentLayout.viewport);
  assert.equal(tournamentLayout.archiveCards, 8);
  assert.equal(tournamentLayout.bracketLanes, 6);
  assert.equal(tournamentLayout.currentBand, tournamentLayout.currentCards > 0);
  assert.equal(tournamentLayout.detail, true);
  assert.match(tournamentLayout.text, /FRA|法国|France/);
  assert.match(tournamentLayout.text, /2-0/);
  assert.doesNotMatch(tournamentLayout.text, /Fixture identity|stage label not asserted/);
  const tournamentCapture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.resolve("demo-assets/tournament-final.png"), Buffer.from(tournamentCapture.data, "base64"));

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await wait(120);
  const tournamentMobile = await evaluate(cdp, `({ viewport: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, cards: document.querySelectorAll('.archive-match-card').length })`);
  assert.equal(tournamentMobile.scrollWidth, tournamentMobile.viewport);
  assert.equal(tournamentMobile.cards, 8);

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[2].click(); true");
  await wait(300);
  const teamsText = await blockText(cdp, ".teams-view");
  assert.doesNotMatch(teamsText, /TBD|undefined|待定队伍|资料更新|待补充/);
  assert.ok((await elementCount(cdp, ".source-team-card")) >= 2);
  assert.ok((await elementCount(cdp, ".source-team-record")) >= 1);
  assert.ok((await elementCount(cdp, ".team-archive-match")) >= 1);
  const teamsCapture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.resolve("demo-assets/teams-final.png"), Buffer.from(teamsCapture.data, "base64"));

  await evaluate(cdp, "document.querySelector('.settings-button').click(); true");
  await wait(200);
  assert.equal(await elementCount(cdp, "#language-select option"), 8);
  for (const language of ["en", "zh", "es", "pt", "fr", "de", "ja", "ar"]) {
    await evaluate(cdp, `(() => {
      const select = document.querySelector('#language-select');
      select.value = ${JSON.stringify(language)};
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await wait(80);
    assert.equal(await evaluate(cdp, "document.documentElement.lang"), language);
    assert.equal(await evaluate(cdp, "document.documentElement.dir"), language === "ar" ? "rtl" : "ltr");
    const visibleText = await evaluate(cdp, "document.body.innerText");
    assert.doesNotMatch(visibleText, /undefined|\uFFFD/);
  }
  await evaluate(cdp, `(() => {
    const select = document.querySelector('#language-select');
    select.value = 'zh';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  assert.doesNotMatch(await evaluate(cdp, "document.body.innerText"), /VITE_TXLINE_API_TOKEN|Bearer\s+[A-Za-z0-9_-]+/);
  assert.deepEqual(runtimeIssues, []);

  console.log("PASS browser challenge, followed-match toggle, official watch links, verified 2026 tournament/replays, World Cup-only teams, eight languages, settings safety, and desktop/mobile layouts");
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  const edgeExit = once(edge, "exit").catch(() => undefined);
  edge.kill();
  await Promise.race([edgeExit, wait(3000)]);
  await removeProfileWithRetry(profileDir);
}

async function waitForTarget(debugPort, browserProcess) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
      const target = targets.find((item) => item.type === "page");
      if (target) return target;
    } catch {
      // Edge is still starting.
    }
    if (browserProcess.exitCode !== null) {
      throw new Error(`Headless Edge exited before CDP was ready. ${edgeDiagnostics.trim()}`);
    }
    await wait(200);
  }
  throw new Error(`Timed out waiting for the headless Edge target. ${edgeDiagnostics.trim()}`);
}

async function waitForCondition(cdp, expression, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await wait(250);
  }
  const body = await evaluate(cdp, "document.body.innerText.slice(0, 500)");
  throw new Error(`Timed out waiting for browser condition: ${expression}. Page: ${body}`);
}

function createCdpClient(ws, onEvent = () => {}) {
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) {
      onEvent(message);
      return;
    }
    if (!pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  ws.addEventListener("close", () => {
    for (const { reject } of pending.values()) {
      reject(new Error(`CDP connection closed unexpectedly. ${edgeDiagnostics.trim()}`));
    }
    pending.clear();
  });
  return {
    send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

function blockText(cdp, selector) {
  return evaluate(cdp, `document.querySelector(${JSON.stringify(selector)})?.innerText ?? ''`);
}

function buttonText(cdp, selector) {
  return evaluate(cdp, `document.querySelector(${JSON.stringify(selector)})?.textContent?.trim() ?? ''`);
}

function elementCount(cdp, selector) {
  return evaluate(cdp, `document.querySelectorAll(${JSON.stringify(selector)}).length`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeProfileWithRetry(profilePath) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(profilePath, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error?.code !== "EBUSY" || attempt === 4) throw error;
      await wait(500 * (attempt + 1));
    }
  }
}
