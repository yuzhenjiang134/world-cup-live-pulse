import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const sourcePath = path.resolve("src/lib/challenge.ts");
const source = await fs.readFile(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: sourcePath,
}).outputText.replace(/^import .*?;\r?\n/gm, "");
const challenge = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const exact = challenge.settleScorePick({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 });
assert.deepEqual(exact, { exact: true, correct: true, award: 250 });

const resultOnly = challenge.settleScorePick({ homeScore: 1, awayScore: 0 }, { homeScore: 3, awayScore: 2 });
assert.deepEqual(resultOnly, { exact: false, correct: true, award: 100 });

const draw = challenge.settleScorePick({ homeScore: 0, awayScore: 0 }, { homeScore: 2, awayScore: 2 });
assert.deepEqual(draw, { exact: false, correct: true, award: 100 });

const miss = challenge.settleScorePick({ homeScore: 0, awayScore: 1 }, { homeScore: 2, awayScore: 0 });
assert.deepEqual(miss, { exact: false, correct: false, award: 0 });

let stats = challenge.updateChallengeStats(challenge.emptyChallengeStats, resultOnly);
stats = challenge.updateChallengeStats(stats, exact);
assert.deepEqual(stats, { played: 2, correct: 2, exact: 1, streak: 2, bestStreak: 2 });
stats = challenge.updateChallengeStats(stats, miss);
assert.deepEqual(stats, { played: 3, correct: 2, exact: 1, streak: 0, bestStreak: 2 });

assert.equal(challenge.canSettleScorePick(true, false, true), true);
assert.equal(challenge.canSettleScorePick(true, true, true), false);
assert.equal(challenge.canSettleScorePick(true, false, false), false);
assert.equal(challenge.canLockScorePick("live", "finished"), false);
assert.equal(challenge.canLockScorePick("live", "live"), true);
assert.equal(challenge.canLockScorePick("replay", "finished"), true);

assert.deepEqual(challenge.getFanLevel(challenge.emptyChallengeStats), {
  index: 0,
  xp: 0,
  floor: 0,
  ceiling: 200,
  progress: 0,
});
assert.equal(challenge.getFanLevel({ played: 1, correct: 1, exact: 1, streak: 1, bestStreak: 1 }).index, 1);
assert.equal(challenge.getFanLevel({ played: 10, correct: 8, exact: 4, streak: 3, bestStreak: 5 }).index, 3);

console.log("PASS score challenge rules, levels, single-settlement gate, streaks, and match-state gates");
