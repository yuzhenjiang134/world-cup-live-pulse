import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
let failed = false;

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

async function loadTsModule(relativePath) {
  const filePath = path.join(root, relativePath);
  let source = await readFile(filePath, "utf8");
  if (relativePath === "src/data/replayMatch.ts") {
    source = source.replace('import { txlineArchiveMatches } from "./txlineArchive";', "const txlineArchiveMatches = [];");
  }
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    fileName: relativePath,
  });
  const encoded = Buffer.from(result.outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

const replayModule = await loadTsModule("src/data/replayMatch.ts");
const videoModule = await loadTsModule("src/data/videoSources.ts");
const fanGuideModule = await loadTsModule("src/data/fanGuide.ts");
const legacyReplayMatches = replayModule.legacyReplayMatches;
const videoSources = videoModule.officialVideoSources;
const teamAtlas = fanGuideModule.teamAtlas;
const appSource = await readFile(path.join(root, "src/MatchdayApp.tsx"), "utf8");
const adapterSource = await readFile(path.join(root, "src/lib/txlineAdapter.ts"), "utf8");
const archiveSource = await readFile(path.join(root, "src/data/txlineArchive.ts"), "utf8");
const replaySource = await readFile(path.join(root, "src/data/replayMatch.ts"), "utf8");
const voiceClipSource = await readFile(path.join(root, "src/data/commentaryVoiceClips.ts"), "utf8");
const calendarSource = await readFile(path.join(root, "src/data/matchCalendar.ts"), "utf8");
const pulsePlaySource = await readFile(path.join(root, "src/components/PulsePlay.tsx"), "utf8");
const fanStandSource = await readFile(path.join(root, "src/components/FanStand.tsx"), "utf8");
const matchdayCssSource = await readFile(path.join(root, "src/matchday.css"), "utf8");

if (!replaySource.includes("export const replayMatches = [...txlineArchiveMatches]")) {
  fail("Current product replay library must contain only the verified TxLINE archive");
} else {
  pass("Current product replay library is restricted to the verified TxLINE archive");
}

if (!Array.isArray(legacyReplayMatches) || legacyReplayMatches.length < 2) {
  fail("Legacy compatibility fixtures must remain available outside the product replay library");
}

for (const match of legacyReplayMatches ?? []) {
  const year = new Date(match.kickoffIso).getUTCFullYear();
  if (!match.id.startsWith("wc-demo-") || match.dataStatus !== "Replay" || year >= 2026) {
    fail(`${match.id} must remain historical replay data before the 2026 tournament window`);
  } else {
    pass(`${match.id} is isolated as historical ${year} replay data`);
  }

  const eventIds = new Set(match.events.map((event) => event.id));
  if (eventIds.size !== match.events.length) fail(`${match.id} has duplicate event ids`);
  if (match.events.at(-1)?.type !== "fulltime") fail(`${match.id} does not end with fulltime`);
  if (match.events.some((event) => event.homeScore < 0 || event.awayScore < 0 || event.marketPulse < 0 || event.marketPulse > 100)) {
    fail(`${match.id} contains invalid event score or pulse values`);
  }
  if (match.market.some((snapshot) => snapshot.homeWin <= 0 || snapshot.draw <= 0 || snapshot.awayWin <= 0 || snapshot.sentiment < 0 || snapshot.sentiment > 100)) {
    fail(`${match.id} contains invalid market snapshot values`);
  }
}

const teamCodes = new Set();
for (const team of teamAtlas ?? []) {
  if (!team.code || teamCodes.has(team.code) || !team.name || !team.colors?.length) fail(`Team atlas identity is invalid for ${team.code || "unknown"}`);
  teamCodes.add(team.code);
}
pass(`Team atlas has ${teamCodes.size} unique source profiles`);

for (const source of videoSources ?? []) {
  let url;
  try {
    url = new URL(source.url);
  } catch {
    fail(`Video source ${source.id} has an invalid URL`);
    continue;
  }
  if (url.protocol !== "https:" || !["fifa.com", "plus.fifa.com"].some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
    fail(`Video source ${source.id} is outside the authorized FIFA domains`);
  } else {
    pass(`Video source ${source.id} is an HTTPS FIFA source`);
  }
}

const requiredAppMarkers = [
  ["1,000 local starting points", "1000"],
  ["score challenge component", "function ScoreChallenge"],
  ["fan challenge levels", "getFanLevel"],
  ["fixture-keyed challenge ledger", "pickLedgerKey"],
  ["single-settlement guard", "settlementGuardRef"],
  ["verified demo season", "demoSeasonHistory"],
  ["source-derived 2026 team records", "summarizeArchiveTeam"],
  ["active tournament schedule", "schedule={schedule}"],
  ["focus-triggered refresh", 'addEventListener("focus"'],
  ["event-driven AI live region", 'className="hero-ai-brief"'],
  ["three fan commentary modes", "commentaryRecap"],
  ["prebuilt natural-voice playback", "getCommentaryVoiceClip"],
  ["browser speech fallback", "SpeechSynthesisUtterance"],
  ["key-event shortcut strip", "key-event-strip"],
  ["replay key-event navigation persists", 'mode === "replay" ? match.events : activeEvents'],
  ["spoiler-free replay control", "spoiler-toggle"],
  ["source-first team facts", "source-team-facts"],
  ["localized event descriptions", "localizeEventDescription"],
  ["official video sources", "officialVideoSources"],
  ["followed-match persistence", "wclp-followed-match"],
  ["favorite-team persistence", "wclp-favorite-team"],
  ["favorite-team schedule priority", "favorite-team"],
  ["verified event browser alerts", "Notification.permission"],
  ["official tournament updates entry", "officialUpdates"],
  ["replay mode boundary", 'setMode("replay")'],
];
for (const [label, marker] of requiredAppMarkers) {
  if (appSource.includes(marker)) pass(`App contains ${label}`);
  else fail(`App is missing ${label}`);
}

for (const filename of [
  "fra-mar-fulltime-en-call.wav",
  "fra-mar-fulltime-en-why.wav",
  "fra-mar-fulltime-en-recap.wav",
  "fra-mar-fulltime-zh-call.wav",
  "fra-mar-fulltime-zh-why.wav",
  "fra-mar-fulltime-zh-recap.wav",
]) {
  const bytes = await readFile(path.join(root, "public/audio/commentary", filename));
  if (bytes.length > 100_000) pass(`Natural commentary asset is present: ${filename}`);
  else fail(`Natural commentary asset is missing or incomplete: ${filename}`);
}

if (/voice_\d+|[A-Z]:\\/i.test(voiceClipSource)) fail("Public commentary mapping exposes a local voice profile or absolute path");
else pass("Public commentary mapping contains no local voice profile or absolute path");

if (!appSource.includes("teamPending")) pass("Fan UI removes unsourced team placeholders");
else fail("Fan UI still contains unsourced team placeholders");

if (!appSource.includes("schedule-moments") && !appSource.includes("item.eventCount")) {
  pass("Schedule cards do not present incomplete event counts as fan facts");
} else {
  fail("Schedule cards still expose incomplete event-count summaries");
}

if (!appSource.includes('|| "--"')) pass("Fan UI omits unsourced fallback fields");
else fail("Fan UI still renders an unsourced double-dash fallback");

for (const forbidden of ["比分源", "赛程种子", "下一个信号", "当前数据球队", "数据规则"]) {
  if (appSource.includes(`"${forbidden}"`)) fail(`User interface still contains developer wording: ${forbidden}`);
  else pass(`User interface removes developer wording: ${forbidden}`);
}

for (const forbidden of ["`#${id}`", "`Player #${id}`", "`Player ${playerId}`"]) {
  if (archiveSource.includes(forbidden) || adapterSource.includes(forbidden)) fail(`Player-facing data still exposes an internal identifier: ${forbidden}`);
  else pass(`Player-facing data hides internal identifier pattern: ${forbidden}`);
}

if (archiveSource.includes("verifiedPlayerName") && adapterSource.includes("PlayerName")) {
  pass("Player names render only through source-supplied display-name fields");
} else {
  fail("Player display-name boundary is missing");
}

if ((pulsePlaySource.match(/role: "(?:keeper|defender|midfielder|forward)"/g) ?? []).length === 11 && pulsePlaySource.includes("sentOffIndexes")) {
  pass("Pulse Play renders an eleven-player formation per team and reflects verified red cards");
} else {
  fail("Pulse Play must render eleven players per team and reflect verified red cards");
}

if (pulsePlaySource.includes("being-sent-off") && matchdayCssSource.includes(".pulse-player.being-sent-off")) {
  pass("The current red-card figure remains visible while the team count drops");
} else {
  fail("Current red-card events hide the dismissed figure before fans can understand the moment");
}

if (pulsePlaySource.includes("readablePlayerName") && pulsePlaySource.includes("player positions and shirt numbers are illustrative") === false) {
  pass("Pulse Play keeps internal identifiers out of the event actor display");
} else if (pulsePlaySource.includes("readablePlayerName")) {
  pass("Pulse Play keeps internal identifiers out of the event actor display");
} else {
  fail("Pulse Play needs a source-readable player-name boundary");
}

if (fanStandSource.includes("wclp-fan-stand-") && fanStandSource.includes('room: FanRoom') && fanStandSource.includes('Record<FanRoom, Record<ReactionKind, number>>') && fanStandSource.includes('momentReactions: Record<string, ReactionKind>')) {
  pass("Fan rooms persist device-local comments and one reaction per room moment");
} else {
  fail("Fan rooms must persist device-local comments and one reaction per room moment");
}

for (const forbidden of ["online fans", "global reactions", "active users", "fake message"]) {
  if (fanStandSource.toLowerCase().includes(forbidden)) fail(`Fan room contains an unsupported community claim: ${forbidden}`);
  else pass(`Fan room omits unsupported community claim: ${forbidden}`);
}

const requiredAdapterMarkers = [
  ["fixture endpoint", "/api/fixtures/snapshot"],
  ["score endpoint", "/api/scores/snapshot"],
  ["odds endpoint", "/api/odds/snapshot"],
  ["official odds boundary", 'payload.odds.length ? "official-odds"'],
  ["seed boundary", 'hasLivePayload ? "Delay" : "Seed"'],
  ["strict World Cup fixture scope", "filterTxlineWorldCupFixtures"],
  ["official World Cup competition id", "txlineWorldCupCompetitionId"],
];
for (const [label, marker] of requiredAdapterMarkers) {
  if (adapterSource.includes(marker)) pass(`Adapter contains ${label}`);
  else fail(`Adapter is missing ${label}`);
}

if (/checkedAtIso:\s*"\d{4}-\d{2}-\d{2}T/.test(calendarSource) && calendarSource.includes("never invents live games")) {
  pass("Fallback calendar is timestamped and explicitly non-live");
} else {
  fail("Fallback calendar must be timestamped and explicitly non-live");
}

const readme = await readFile(path.join(root, "README.md"), "utf8");
const submission = await readFile(path.join(root, "docs/SUBMISSION_DRAFT.md"), "utf8");
if (readme.includes("does not place bets") && submission.includes("Consumer and Fan Experiences")) {
  pass("Submission boundary and judging track are documented");
} else {
  fail("Submission boundary or judging track is missing from documents");
}

if (failed) process.exitCode = 1;
else console.log("Product data audit complete.");
