import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const edgePath = process.env.EDGE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\144.0.3719.115\\msedge.exe";
const configuredBaseUrl = process.env.E2E_BASE_URL
  ? `${process.env.E2E_BASE_URL.replace(/\/+$/, "")}/`
  : "http://127.0.0.1:5180/";
const appUrl = process.env.MATCHDAY_URL ?? new URL("?mode=replay&replay=txline-archive-18209181&minute=90", configuredBaseUrl).toString();
const baseEntryUrl = new URL(".", appUrl).toString();
const redCardReplayUrl = new URL("?mode=replay&replay=txline-archive-18192996&minute=54", baseEntryUrl).toString();
const initialLanguage = process.env.E2E_LANGUAGE === "en" ? "en" : "zh";
const expectedCopy = initialLanguage === "en"
  ? { points: "pts", settled: /Settled/, season: /Demo season/, score: /France 2-0 Morocco/, otherTeamLanguage: /法国|摩洛哥/, stage: /Semi-finals/, versus: "vs", edit: /Edit score/, updated: /Pick updated/, audio: "fra-mar-fulltime-en-call.wav" }
  : { points: "积分", settled: /已结算/, season: /赛季演示/, score: /法国 2-0 摩洛哥/, otherTeamLanguage: /France|Morocco/, stage: /四强/, versus: "对阵", edit: /修改比分/, updated: /预测已更新/, audio: "fra-mar-fulltime-zh-call.wav" };
const port = 20_000 + Math.floor(Math.random() * 20_000);
const profileDir = path.join(os.tmpdir(), `wclp-e2e-${process.pid}-${Date.now()}-${port}`);
let edgeDiagnostics = "";
const edge = spawn(edgePath, [
  "--headless=new",
  "--disable-gpu",
  "--disable-gpu-compositing",
  "--disable-gpu-rasterization",
  "--use-angle=swiftshader",
  "--use-gl=swiftshader",
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
  const target = await waitForTarget(port, edge, new URL(appUrl).origin);
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
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem('wclp-language', ${JSON.stringify(initialLanguage)});` });
  await evaluate(cdp, `localStorage.setItem('wclp-language', ${JSON.stringify(initialLanguage)}); true`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForCondition(cdp, "Boolean(document.querySelector('.challenge-block'))", 30_000);

  const accessibilityAudit = await evaluate(cdp, `(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
    };
    const accessibleName = (element) => {
      const labelledBy = (element.getAttribute('aria-labelledby') || '')
        .split(/\\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent?.trim() || '')
        .join(' ')
        .trim();
      const labels = [...(element.labels || [])].map((label) => label.textContent?.trim() || '').join(' ').trim();
      return element.getAttribute('aria-label')?.trim()
        || labelledBy
        || labels
        || element.getAttribute('title')?.trim()
        || element.textContent?.trim()
        || '';
    };
    const interactive = [...document.querySelectorAll('button, a[href], input, select, summary')].filter(visible);
    return {
      count: interactive.length,
      unnamed: interactive.filter((element) => !accessibleName(element)).map((element) => element.outerHTML.slice(0, 160)),
    };
  })()`);
  assert.ok(accessibilityAudit.count > 20);
  assert.deepEqual(accessibilityAudit.unnamed, []);
  await evaluate(cdp, "document.activeElement?.blur(); true");
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate(cdp, "document.activeElement !== document.body && document.activeElement?.matches('button, a[href], input, select, summary')"), true);

  const desktopLayout = await evaluate(cdp, `({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    body: document.body.innerText.slice(0, 500),
    challenge: Boolean(document.querySelector('.challenge-block')),
    level: Boolean(document.querySelector('.challenge-level')),
    timeline: Boolean(document.querySelector('.timeline-slider')),
    scheduleCards: document.querySelectorAll('.schedule-card').length,
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
  assert.equal(desktopLayout.scheduleCards, 0);
  assert.equal(await elementCount(cdp, ".primary-nav button"), 3);
  assert.ok(desktopLayout.challengeWidth >= desktopLayout.heroWidth * 0.98);
  assert.ok(desktopLayout.challengeTop < desktopLayout.signalTop);
  assert.equal(desktopLayout.scoreSteppers, 4);
  assert.doesNotMatch(desktopLayout.body, /2022/);

  assert.match(await buttonText(cdp, ".challenge-block .primary-button"), /50/);
  assert.match(await blockText(cdp, ".challenge-block"), new RegExp(`1,000\\s+${expectedCopy.points}`));
  await capturePage(cdp, "demo-assets/challenge-before-final.png");

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
  assert.match(settledText, new RegExp(`1,200\\s+${expectedCopy.points}`));
  assert.match(settledText, expectedCopy.settled);
  assert.equal(await elementCount(cdp, ".challenge-history:not(.demo-history) .challenge-history-list > div"), 1);
  assert.equal(await elementCount(cdp, ".demo-history .challenge-history-list > div"), 8);
  assert.match(settledText, expectedCopy.season);
  assert.match(settledText, /FRA 2:0 MAR/);

  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForCondition(cdp, "Boolean(document.querySelector('.challenge-block'))", 30_000);
  const restoredText = await blockText(cdp, ".challenge-block");
  assert.match(restoredText, new RegExp(`1,200\\s+${expectedCopy.points}`));
  assert.match(restoredText, expectedCopy.settled);
  assert.equal(await elementCount(cdp, ".challenge-history:not(.demo-history) .challenge-history-list > div"), 1);
  assert.equal(await elementCount(cdp, ".demo-history .challenge-history-list > div"), 8);
  assert.equal(await elementCount(cdp, ".challenge-block .secondary-button"), 2);
  assert.equal(await elementCount(cdp, ".challenge-room-button"), 1);
  assert.equal(await elementCount(cdp, ".commentary-audio"), 1);
  assert.ok((await elementCount(cdp, ".key-event-strip button")) >= 1);
  await evaluate(cdp, "document.querySelector('.key-event-strip button').click(); true");
  await wait(120);
  assert.ok(Number(await evaluate(cdp, "document.querySelector('.timeline-slider').value")) < 90);
  await capturePage(cdp, "demo-assets/key-event-final.png");
  await evaluate(cdp, `(() => { const slider = document.querySelector('.timeline-slider'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(slider, '90'); slider.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await wait(120);
  assert.match(await blockText(cdp, ".hero-ai-brief"), expectedCopy.score);
  assert.doesNotMatch(await blockText(cdp, ".hero-ai-brief"), expectedCopy.otherTeamLanguage);
  assert.equal(await elementCount(cdp, ".commentary-modes button"), 3);
  const commentaryModeState = await evaluate(cdp, `[...document.querySelectorAll('.commentary-modes button')].map((button) => ({
    active: button.classList.contains('active'),
    selected: button.getAttribute('aria-selected') === 'true',
    background: getComputedStyle(button).backgroundColor,
    color: getComputedStyle(button).color,
    width: button.getBoundingClientRect().width
  }))`);
  assert.equal(commentaryModeState.filter((item) => item.active).length, 1);
  assert.equal(commentaryModeState.filter((item) => item.selected).length, 1);
  assert.notEqual(commentaryModeState.find((item) => item.active)?.background, "rgba(0, 0, 0, 0)");
  assert.ok(commentaryModeState.every((item) => item.width > 36));
  const liveCall = await blockText(cdp, ".hero-ai-brief strong");
  const cloneAudioReady = await evaluate(cdp, `fetch(${JSON.stringify(new URL(`audio/commentary/${expectedCopy.audio}`, baseEntryUrl).href)}).then((response) => response.ok)`);
  assert.equal(cloneAudioReady, true);
  await evaluate(cdp, `(() => {
    window.__wclpAudioUrls = [];
    HTMLMediaElement.prototype.play = function () {
      window.__wclpAudioUrls.push(this.src);
      queueMicrotask(() => this.dispatchEvent(new Event('ended')));
      return Promise.resolve();
    };
    document.querySelector('.commentary-audio').click();
    return true;
  })()`);
  await wait(80);
  assert.match(await evaluate(cdp, "window.__wclpAudioUrls.at(-1) || ''"), new RegExp(`${expectedCopy.audio.replace(".", "\\.")}$`));
  await evaluate(cdp, "document.querySelectorAll('.commentary-modes button')[1].click(); true");
  await wait(80);
  const whyItMatters = await blockText(cdp, ".hero-ai-brief strong");
  assert.notEqual(whyItMatters, liveCall);
  await evaluate(cdp, "document.querySelectorAll('.commentary-modes button')[2].click(); true");
  await wait(80);
  const quickRecap = await blockText(cdp, ".hero-ai-brief strong");
  assert.match(quickRecap, /2-0/);
  assert.notEqual(quickRecap, whyItMatters);
  assert.doesNotMatch(quickRecap, /undefined|�/);
  await capturePage(cdp, "demo-assets/commentary-modes-final.png");
  await evaluate(cdp, "document.querySelectorAll('.commentary-modes button')[0].click(); true");
  assert.equal(await evaluate(cdp, "document.querySelector('.commentary-auto').getAttribute('aria-pressed')"), "false");
  await evaluate(cdp, "document.querySelector('.commentary-auto').click(); true");
  await waitForCondition(cdp, "localStorage.getItem('wclp-auto-commentary') === '1'", 5_000);
  assert.equal(await evaluate(cdp, "document.querySelector('.commentary-auto').getAttribute('aria-pressed')"), "true");
  await evaluate(cdp, "document.querySelector('.commentary-auto').click(); true");
  await waitForCondition(cdp, "localStorage.getItem('wclp-auto-commentary') === '0'", 5_000);
  assert.equal(await elementCount(cdp, ".follow-button"), 1);
  await evaluate(cdp, "document.querySelector('.follow-button').click(); true");
  await waitForCondition(cdp, "Boolean(localStorage.getItem('wclp-followed-match'))", 5_000);
  assert.equal(await elementCount(cdp, ".follow-button.active"), 1);
  await evaluate(cdp, "document.querySelector('.follow-button').click(); true");
  await waitForCondition(cdp, "!localStorage.getItem('wclp-followed-match')", 5_000);
  assert.equal(await elementCount(cdp, ".follow-button.active"), 0);
  assert.equal(await elementCount(cdp, ".official-video-links a"), 3);
  assert.equal(await elementCount(cdp, ".hero-view-toggle button"), 2);
  await evaluate(cdp, "document.querySelectorAll('.hero-view-toggle button')[1].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.pulse-play'))", 5_000);
  assert.equal(await elementCount(cdp, ".pulse-player"), 22);
  assert.equal(await elementCount(cdp, ".pulse-play-scoreboard em"), 2);
  assert.equal(await elementCount(cdp, ".pulse-match-story"), 1);
  assert.ok((await elementCount(cdp, ".pulse-match-story > div > span")) >= 3);
  await evaluate(cdp, `(() => {
    const cardMoment = [...document.querySelectorAll('.key-event-strip button')].find((button) => /Yellow|黄牌|Amarilla|Amarelo|Jaune|Gelb|イエロー|صفراء/i.test(button.textContent || ''));
    cardMoment?.click();
    return Boolean(cardMoment);
  })()`);
  await wait(120);
  assert.equal(await elementCount(cdp, ".figure-event-yellow_card"), 1);
  assert.equal(await elementCount(cdp, ".pulse-referee"), 1);
  assert.equal(await elementCount(cdp, ".cheer-controls button"), 2);
  assert.equal(await elementCount(cdp, ".fan-viewpoint"), 3);
  assert.match(await blockText(cdp, ".fan-challenge-bridge"), /FRA 2:0 MAR/);
  assert.match(await blockText(cdp, ".fan-challenge-bridge"), new RegExp(`1,200\\s+${expectedCopy.points}`));
  assert.match(await blockText(cdp, ".fan-challenge-bridge"), /\+250/);
  await evaluate(cdp, "document.querySelector('.fan-challenge-bridge button').click(); true");
  await wait(80);
  assert.equal(await evaluate(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[1].getAttribute('aria-selected')"), "true");
  const fanViewpoints = await evaluate(cdp, "[...document.querySelectorAll('.fan-viewpoint p')].map((item) => item.textContent.trim())");
  assert.equal(new Set(fanViewpoints).size, 3);
  assert.ok(fanViewpoints.every((text) => text.length >= (initialLanguage === "zh" ? 10 : 20)));
  assert.match(fanViewpoints.join(" "), initialLanguage === "zh" ? /黄牌|防守|判罚/ : /card|booking|defend/i);
  assert.doesNotMatch(await blockText(cdp, ".fan-stand"), /这个节点改变了什么|What changed here\?|Score review|Pinned match update/i);
  await evaluate(cdp, "document.querySelector('.cheer-controls button').click(); true");
  await waitForCondition(cdp, "Object.entries(localStorage).some(([key, value]) => key.startsWith('wclp-cheers-') && JSON.parse(value).home === 1)", 5_000);
  assert.equal(await elementCount(cdp, ".fan-room-tabs [role='tab']"), 3);
  await evaluate(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[2].click(); true");
  await waitForCondition(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[2].getAttribute('aria-selected') === 'true'", 5_000);
  await evaluate(cdp, `(() => {
    document.querySelector('.fan-reactions button').click();
    const input = document.querySelector('.fan-comment-form input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Strong recovery after the card.');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await wait(80);
  await evaluate(cdp, "document.querySelector('.fan-comment-form button').click(); true");
  await wait(120);
  assert.equal(await elementCount(cdp, ".fan-message-list article"), 1);
  assert.equal(await blockText(cdp, ".fan-reactions button b"), "1");
  assert.equal(await evaluate(cdp, "document.querySelector('.fan-reactions button').getAttribute('aria-pressed')"), "true");
  await evaluate(cdp, "document.querySelector('.fan-reactions button').click(); true");
  await wait(80);
  assert.equal(await blockText(cdp, ".fan-reactions button b"), "1");
  await evaluate(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[1].click(); true");
  await waitForCondition(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[1].getAttribute('aria-selected') === 'true'", 5_000);
  assert.equal(await elementCount(cdp, ".fan-message-list article"), 0);
  assert.equal(await blockText(cdp, ".fan-reactions button b"), "0");
  await evaluate(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[2].click(); true");
  await waitForCondition(cdp, "document.querySelectorAll('.fan-room-tabs [role=tab]')[2].getAttribute('aria-selected') === 'true'", 5_000);
  await waitForCondition(cdp, "document.querySelector('.fan-message-list')?.innerText.includes('Strong recovery after the card.')", 5_000);
  assert.match(await blockText(cdp, ".fan-message-list"), /Strong recovery after the card\./);
  assert.equal(await evaluate(cdp, `(() => {
    const entry = Object.entries(localStorage).find(([key]) => key.startsWith('wclp-fan-stand-'));
    if (!entry) return false;
    const state = JSON.parse(entry[1]);
    return state.messages.some((message) => message.room === 'away' && message.text === 'Strong recovery after the card.')
      && state.reactions.away.celebrate === 1
      && state.reactions.home.celebrate === 0
      && Object.values(state.momentReactions).includes('celebrate');
  })()`), true);
  await evaluate(cdp, "document.querySelector('.fan-stand').scrollIntoView({ block: 'center' }); true");
  await wait(100);
  await capturePage(cdp, "demo-assets/fan-stand-final.png");
  await evaluate(cdp, "document.querySelector('.score-hero').scrollIntoView({ block: 'start' }); true");
  await wait(100);
  await capturePage(cdp, "demo-assets/pulse-play-final.png");
  await evaluate(cdp, "document.querySelectorAll('.hero-view-toggle button')[0].click(); true");
  await capturePage(cdp, "demo-assets/desktop-final.png");

  await cdp.send("Page.navigate", { url: redCardReplayUrl });
  await waitForCondition(cdp, "Boolean(document.querySelector('.hero-view-toggle'))", 30_000);
  await evaluate(cdp, "document.querySelectorAll('.hero-view-toggle button')[1].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.pulse-play'))", 5_000);
  const redCardState = await evaluate(cdp, `(() => {
    const slider = document.querySelector('.timeline-slider');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(slider, '53');
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    return {
      slider: slider.value,
      moments: [...document.querySelectorAll('.key-event-strip button')].map((button) => button.textContent?.trim() || ''),
    };
  })()`);
  console.log(`Red-card route ${JSON.stringify(redCardState)}`);
  await wait(120);
  assert.equal(redCardState.slider, "53");
  assert.equal(await elementCount(cdp, ".figure-event-red_card"), 1);
  assert.equal(await elementCount(cdp, ".pulse-player.being-sent-off"), 1);
  assert.deepEqual(await evaluate(cdp, "[...document.querySelectorAll('.pulse-play-scoreboard em')].map((element) => Number.parseInt(element.textContent, 10)).sort((a, b) => a - b)"), [10, 11]);
  await capturePage(cdp, "demo-assets/red-card-final.png");

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
  assert.doesNotMatch(mobileLayout.body, /FIFA World Cup|Semifinals/i);
  assert.doesNotMatch(mobileLayout.body, /TBD|undefined|待定/);
  assert.ok(mobileLayout.home.left >= 0 && mobileLayout.home.right <= mobileLayout.viewport);
  assert.ok(mobileLayout.away.left >= 0 && mobileLayout.away.right <= mobileLayout.viewport);
  assert.ok(mobileLayout.awayText.trim().length > 3);
  assert.doesNotMatch(mobileLayout.awayText, /TBD|undefined/);
  assert.ok(mobileLayout.awayCode.width > 0 && mobileLayout.awayName.width > 0);
  assert.ok(mobileLayout.actions.left >= 0 && mobileLayout.actions.right <= mobileLayout.viewport);
  await evaluate(cdp, "document.querySelectorAll('.hero-view-toggle button')[1].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.pulse-play'))", 5_000);
  assert.match(await blockText(cdp, ".pulse-sync-badge"), /Pre-match preview|赛前预览|Delayed update|延迟更新/);
  const mobileToggleStyles = await evaluate(cdp, "[...document.querySelectorAll('.hero-view-toggle button')].map((button) => ({ active: button.classList.contains('active'), background: getComputedStyle(button).backgroundColor, color: getComputedStyle(button).color }))");
  assert.equal(mobileToggleStyles.filter((item) => item.active).length, 1);
  assert.notEqual(mobileToggleStyles[0].background, mobileToggleStyles[1].background);
  const mobilePulseLayout = await evaluate(cdp, `(() => {
    const box = document.querySelector('.pulse-play').getBoundingClientRect();
    return { left: box.left, right: box.right, viewport: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth };
  })()`);
  assert.equal(mobilePulseLayout.scrollWidth, mobilePulseLayout.viewport);
  assert.ok(mobilePulseLayout.left >= 0 && mobilePulseLayout.right <= mobilePulseLayout.viewport);
  assert.equal(await elementCount(cdp, ".pulse-player"), 22);
  assert.equal(await elementCount(cdp, ".fan-room-tabs [role='tab']"), 3);
  assert.equal(await elementCount(cdp, ".fan-viewpoint"), 3);
  assert.equal(await evaluate(cdp, "[...document.querySelectorAll('.fan-viewpoint')].every((item) => { const box = item.getBoundingClientRect(); return box.left >= 0 && box.right <= document.documentElement.clientWidth; })"), true);
  await capturePage(cdp, "demo-assets/pulse-play-mobile-final.png");
  await evaluate(cdp, "document.querySelector('.fan-stand').scrollIntoView({ block: 'start' }); true");
  await wait(100);
  assert.equal(await elementCount(cdp, ".match-context-grid"), 0);
  await capturePage(cdp, "demo-assets/fan-stand-mobile-final.png");
  await evaluate(cdp, "document.querySelectorAll('.hero-view-toggle button')[0].click(); true");

  const liveChallengeOpen = Boolean(await elementCount(cdp, ".challenge-block .primary-button:not(:disabled)"));
  if (liveChallengeOpen) {
    await evaluate(cdp, `(() => {
      const inputs = document.querySelectorAll('.challenge-score input');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inputs[0], '1'); inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(inputs[1], '0'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('.challenge-block .primary-button').click();
      return true;
    })()`);
    await wait(180);
    assert.equal(await evaluate(cdp, "localStorage.getItem('wclp-test-points')"), "1150");
    assert.match(await buttonText(cdp, ".edit-pick-button"), expectedCopy.edit);
    await evaluate(cdp, "document.querySelector('.edit-pick-button').click(); true");
    await wait(80);
    await evaluate(cdp, `(() => {
      const inputs = document.querySelectorAll('.challenge-score input');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inputs[0], '2'); inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(inputs[1], '1'); inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('.challenge-block .primary-button').click();
      return true;
    })()`);
    await wait(180);
    assert.equal(await evaluate(cdp, "localStorage.getItem('wclp-test-points')"), "1150");
    const editedPicks = await evaluate(cdp, `JSON.parse(localStorage.getItem('wclp-pick-ledger-v1') || '[]').filter((pick) => pick.revisionCount === 1)`);
    assert.equal(editedPicks.length, 1);
    assert.equal(editedPicks[0].homeScore, 2);
    assert.equal(editedPicks[0].awayScore, 1);
    assert.match(await blockText(cdp, ".challenge-block"), expectedCopy.updated);
    await cdp.send("Page.reload", { ignoreCache: true });
    await waitForCondition(cdp, "Boolean(document.querySelector('.edit-pick-button'))", 30_000);
    assert.deepEqual(await evaluate(cdp, `[...document.querySelectorAll('.challenge-score input')].map((input) => input.value)`), ["2", "1"]);
    assert.equal(await evaluate(cdp, "localStorage.getItem('wclp-test-points')"), "1150");
  } else {
    assert.equal(await evaluate(cdp, "document.querySelector('.challenge-block .primary-button')?.disabled === true"), true);
  }
  const scheduledBriefs = [];
  for (let index = 0; index < 3; index += 1) {
    await evaluate(cdp, `document.querySelectorAll('.commentary-modes button')[${index}].click(); true`);
    await wait(60);
    scheduledBriefs.push(await blockText(cdp, ".hero-ai-brief strong"));
  }
  assert.equal(new Set(scheduledBriefs).size, 3);
  assert.ok(scheduledBriefs.every((brief) => brief.length >= (initialLanguage === "zh" ? 10 : 20)));
  assert.doesNotMatch(scheduledBriefs.join(" "), /undefined|�/);
  const checkedBeforeFocus = await evaluate(cdp, "document.querySelectorAll('.truth-meta strong')[0]?.textContent ?? ''");
  await evaluate(cdp, "window.dispatchEvent(new Event('focus')); true");
  await waitForCondition(cdp, `document.querySelectorAll('.truth-meta strong')[0]?.textContent !== ${JSON.stringify(checkedBeforeFocus)}`, 30_000);
  await capturePage(cdp, "demo-assets/mobile-final.png");

  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[1].click(); true");
  await wait(350);
  const tournamentLayout = await evaluate(cdp, `({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    archiveCards: document.querySelectorAll('.archive-match-card').length,
    archiveAiRecaps: document.querySelectorAll('.archive-ai-summary').length,
    bracketLanes: document.querySelectorAll('.bracket-lane').length,
    currentCards: document.querySelectorAll('.current-fixture-grid article').length,
    currentBand: Boolean(document.querySelector('.current-fixtures')),
    detail: Boolean(document.querySelector('.team-detail-panel')),
    text: document.querySelector('.tournament-view')?.innerText ?? '',
  })`);
  assert.equal(tournamentLayout.scrollWidth, tournamentLayout.viewport);
  assert.equal(tournamentLayout.archiveCards, 8);
  assert.equal(tournamentLayout.archiveAiRecaps, 8);
  assert.equal(tournamentLayout.bracketLanes, 6);
  assert.equal(tournamentLayout.currentBand, tournamentLayout.currentCards > 0);
  assert.equal(tournamentLayout.detail, true);
  assert.match(tournamentLayout.text, /FRA|法国|France/);
  assert.match(tournamentLayout.text, /2-0/);
  assert.doesNotMatch(tournamentLayout.text, /Fixture identity|stage label not asserted/);
  await capturePage(cdp, "demo-assets/tournament-final.png");

  assert.equal(await elementCount(cdp, ".spoiler-toggle input"), 1);
  await evaluate(cdp, "document.querySelector('.spoiler-toggle input').click(); true");
  await wait(120);
  assert.equal(await elementCount(cdp, ".archive-match-card.spoilered"), 8);
  assert.equal(await elementCount(cdp, ".archive-match-card p"), 0);
  assert.equal(await elementCount(cdp, ".bracket-section"), 0);
  assert.equal(await elementCount(cdp, ".team-detail-panel"), 0);
  assert.equal(await evaluate(cdp, `[...document.querySelectorAll('.archive-score-row strong')].every((item) => item.textContent.trim() === ${JSON.stringify(expectedCopy.versus)})`), true);
  await capturePage(cdp, "demo-assets/tournament-spoiler-final.png");
  await evaluate(cdp, "document.querySelector('.archive-match-card .archive-open').click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.timeline-slider'))", 30_000);
  assert.equal(await evaluate(cdp, "document.querySelector('.timeline-slider').value"), "1");
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[1].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.tournament-view'))", 30_000);

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
  assert.doesNotMatch(teamsText, /(?:^|\s)#\d{4,}|\bPlayer\s*#?\d+\b|Goal event|Card event|Score event/i);
  assert.ok((await elementCount(cdp, ".source-team-card")) >= 2);
  assert.ok((await elementCount(cdp, ".source-team-record")) >= 1);
  assert.ok((await elementCount(cdp, ".team-archive-match")) >= 1);
  await capturePage(cdp, "demo-assets/teams-final.png");

  assert.equal(await evaluate(cdp, "localStorage.getItem('wclp-favorite-team')"), null);
  const favoriteCode = await evaluate(cdp, "document.querySelector('.source-team-card .team-code').textContent.trim()");
  const favoriteName = await evaluate(cdp, "document.querySelector('.source-team-card h2').textContent.trim()");
  await evaluate(cdp, "document.querySelector('.source-team-card .team-favorite').click(); true");
  await waitForCondition(cdp, `localStorage.getItem('wclp-favorite-team') === ${JSON.stringify(favoriteCode)}`, 5_000);
  assert.equal(await elementCount(cdp, ".source-team-card.favorite .team-favorite.active"), 1);
  await capturePage(cdp, "demo-assets/teams-favorite-final.png");
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[0].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.up-next-panel button'))", 10_000);
  assert.match(await buttonText(cdp, ".up-next-panel button"), new RegExp(favoriteName));
  await evaluate(cdp, "document.querySelectorAll('.primary-nav button')[1].click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.current-fixture-grid article'))", 10_000);
  const favoriteScheduleCards = await evaluate(cdp, `[...document.querySelectorAll('.current-fixture-grid article')].map((card) => ({ title: card.querySelector(':scope > strong')?.innerText ?? '', favorite: card.classList.contains('favorite-team') })).filter((card) => card.title.includes(${JSON.stringify(favoriteName)}))`);
  assert.ok(favoriteScheduleCards.every((card) => card.favorite));

  await evaluate(cdp, "document.querySelector('.settings-button').click(); true");
  await wait(200);
  assert.equal(await elementCount(cdp, "#language-select option"), 8);
  assert.equal(await elementCount(cdp, ".preference-list input[type='checkbox']"), 3);
  assert.deepEqual(await evaluate(cdp, "[...document.querySelectorAll('.preference-list input')].map((input) => input.checked)"), [true, true, true]);
  await evaluate(cdp, "document.querySelector('.preference-list input').click(); true");
  await waitForCondition(cdp, "JSON.parse(localStorage.getItem('wclp-alert-preferences') || '{}').goals === false", 5_000);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForCondition(cdp, "Boolean(document.querySelector('.settings-button'))", 30_000);
  await evaluate(cdp, "document.querySelector('.settings-button').click(); true");
  await waitForCondition(cdp, "Boolean(document.querySelector('.preference-list input'))", 5_000);
  assert.equal(await evaluate(cdp, "document.querySelector('.preference-list input').checked"), false);
  await evaluate(cdp, "document.querySelector('.preference-list input').click(); true");
  await waitForCondition(cdp, "JSON.parse(localStorage.getItem('wclp-alert-preferences') || '{}').goals === true", 5_000);
  await evaluate(cdp, `(() => { const select = document.querySelector('#language-select'); select.value = 'en'; select.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await wait(100);
  await capturePage(cdp, "demo-assets/settings-language-final.png");
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

  console.log("PASS browser challenge settlement plus pre-kickoff edits, event-driven Pulse Play and local cheers, three AI modes, key events, replay, favorites, persisted match-alert preferences, official links, verified 2026 data, eight languages, keyboard access, accessible names, safety, and responsive layouts");
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  const edgeExit = once(edge, "exit").catch(() => undefined);
  edge.kill();
  await Promise.race([edgeExit, wait(3000)]);
  await removeProfileWithRetry(profileDir);
}

async function waitForTarget(debugPort, browserProcess, expectedOrigin) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
      const target = targets.find((item) => item.type === "page" && item.url.startsWith(expectedOrigin))
        ?? targets.find((item) => item.type === "page" && /^https?:/.test(item.url))
        ?? targets.find((item) => item.type === "page" && item.url !== "about:blank");
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

async function capturePage(cdp, outputPath) {
  const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.resolve(outputPath), Buffer.from(capture.data, "base64"));
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
      const retryable = new Set(["EBUSY", "ENOTEMPTY", "EPERM"]);
      if (!retryable.has(error?.code) || attempt === 4) throw error;
      await wait(500 * (attempt + 1));
    }
  }
}
