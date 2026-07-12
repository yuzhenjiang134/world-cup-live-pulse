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
};
const market = { sentiment: 74 };

for (const language of ["en", "zh", "es", "pt", "fr", "de", "ja", "ar"]) {
  const text = module.localizeCommentary(language, match, frame("fulltime", 90, 2, 0, market));
  assert.match(text, /2-0/);
  assert.doesNotMatch(text, /undefined|�/);
}

assert.match(module.localizeCommentary("zh", match, frame("goal", 32, 1, 0, market, "#102")), /#102.*1-0/);
assert.match(module.localizeCommentary("zh", match, frame("red_card", 67, 1, 0, market, "#205")), /红牌.*1-0/);
assert.match(module.localizeCommentary("zh", match, frame("yellow_card", 54, 1, 0, market, "#205")), /黄牌.*1-0/);
assert.match(module.localizeCommentary("zh", match, frame("score_update", 75, 1, 0, market)), /复核.*1-0/);

console.log("PASS event-driven AI match brief in eight languages with score and event fact guards");

function frame(type, minute, homeScore, awayScore, matchMarket, player) {
  return {
    minute,
    homeScore,
    awayScore,
    market: matchMarket,
    latestEvent: { type, minute, homeScore, awayScore, player },
    commentary: "",
    insight: { headline: "" },
  };
}
