import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import ts from "typescript";

const source = (await readFile(new URL("../src/lib/localizedPulse.ts", import.meta.url), "utf8")).replace(
  'import { localizeTeamName } from "../data/teamNames";',
  'const localizeTeamName = (_code, fallback) => fallback;',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const match = {
  home: { code: "FRA", name: "France" },
  away: { code: "MAR", name: "Morocco" },
  status: "scheduled",
  stage: "FIFA World Cup, Semifinals",
  kickoffIso: "2026-07-14T19:00:00Z",
};
const market = { sentiment: 74 };

for (const language of ["en", "zh", "es", "pt", "fr", "de", "ja", "ar"]) {
  const text = module.localizeCommentary(language, match, frame("fulltime", 90, 2, 0, market));
  assert.match(text, /2-0/);
  assert.doesNotMatch(text, /undefined|�/);
  const recap = module.localizeRecap(language, match, frame("fulltime", 90, 2, 0, market));
  assert.match(recap, /2-0/);
  assert.doesNotMatch(recap, /undefined|�|game_finalised|score sequence|fixture/i);
  assert.notEqual(recap, text);
  const scheduledModes = ["call", "why", "recap"].map((mode) => module.localizeScheduledBrief(language, match, mode));
  assert.equal(new Set(scheduledModes).size, 3);
  scheduledModes.forEach((scheduled) => {
    assert.doesNotMatch(scheduled, /undefined|�|FIFA World Cup, Semifinals/);
    if (language !== "en") assert.doesNotMatch(scheduled, /\bvs\b/i);
  });
  assert.match(scheduledModes[0], /2026/);
}

const minimalScheduled = module.localizeScheduledBrief("en", {
  home: { code: "FRA", name: "France" },
  away: { code: "MAR", name: "Morocco" },
}, "recap");
assert.doesNotMatch(minimalScheduled, /undefined|Invalid|�/);
assert.match(minimalScheduled, /No verified match events yet/);

const englishRecapFrame = frame("fulltime", 90, 2, 0, market);
englishRecapFrame.activeEvents.unshift({ type: "yellow_card", minute: 54, homeScore: 1, awayScore: 0, title: "Yellow card" });
assert.match(module.localizeRecap("en", match, englishRecapFrame), /1 card\b/);

assert.match(module.localizeCommentary("zh", match, frame("goal", 32, 1, 0, market, "Kylian Mbappe")), /Kylian Mbappe.*1-0/);
assert.doesNotMatch(module.localizeCommentary("zh", match, frame("goal", 32, 1, 0, market, "#102")), /#102/);
assert.match(module.localizeCommentary("zh", match, frame("red_card", 67, 1, 0, market, "Player 205")), /红牌.*1-0/);
assert.doesNotMatch(module.localizeCommentary("zh", match, frame("red_card", 67, 1, 0, market, "Player 205")), /Player 205/);
assert.match(module.localizeCommentary("zh", match, frame("yellow_card", 54, 1, 0, market, "Kylian Mbappe")), /黄牌.*1-0/);
assert.match(module.localizeCommentary("zh", match, frame("score_update", 75, 1, 0, market)), /复核.*1-0/);

console.log("PASS three-mode scheduled and event-driven AI match briefs in eight languages with fact guards");

function frame(type, minute, homeScore, awayScore, matchMarket, player) {
  const latestEvent = { type, minute, homeScore, awayScore, player, description: "Verified event", title: "Verified event" };
  return {
    minute,
    homeScore,
    awayScore,
    market: matchMarket,
    latestEvent,
    activeEvents: [latestEvent],
    commentary: "",
    insight: { headline: "" },
  };
}
