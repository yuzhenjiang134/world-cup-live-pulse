import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const tempDir = await mkdtemp(path.join(process.cwd(), ".wclp-score-normalize-"));
const outfile = path.join(tempDir, "adapter.mjs");

try {
  const source = await readFile(path.resolve("src/lib/txlineScoreNormalizer.ts"), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  await writeFile(outfile, transpiled.outputText, "utf8");

  const { normalizeTxlineScoreRecord } = await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
  const raw = {
    FixtureId: 18209181,
    GameState: "2nd half",
    StartTime: 1783526400,
    Participant1IsHome: true,
    Participant1Id: 10,
    Participant2Id: 20,
    Action: "game_finalised",
    Id: 9001,
    Ts: 1783533300,
    Seq: 1114,
    StatusId: 99,
    Participant: 1,
    Data: { Action: "goal", Goal: true, Penalty: true, Minutes: 23, PlayerName: "Source Player" },
    Score: {
      Participant1: { Total: { Goals: 2, YellowCards: 1 } },
      Participant2: { Total: { Goals: 0 } },
    },
    Stats: { Possession: 54 },
  };

  const normalized = normalizeTxlineScoreRecord(raw);
  assert.equal(normalized.fixtureId, 18209181);
  assert.equal(normalized.gameState, "2nd half");
  assert.equal(normalized.startTime, 1783526400);
  assert.equal(normalized.participant1IsHome, true);
  assert.equal(normalized.action, "game_finalised");
  assert.equal(normalized.seq, 1114);
  assert.equal(normalized.participant, 1);
  assert.equal(normalized.dataSoccer.Penalty, true);
  assert.equal(normalized.dataSoccer.Minutes, 23);
  assert.equal(normalized.scoreSoccer.Participant1.Total.Goals, 2);
  assert.equal(normalized.scoreSoccer.Participant2.Total.Goals, 0);
  assert.equal(normalized.stats.Possession, 54);

  const camel = normalizeTxlineScoreRecord({
    fixtureId: 7,
    action: "goal",
    scoreSoccer: { Participant1: { Total: { Goals: 1 } } },
  });
  assert.equal(camel.fixtureId, 7);
  assert.equal(camel.action, "goal");
  assert.equal(camel.scoreSoccer.Participant1.Total.Goals, 1);

  console.log("PASS TxLINE PascalCase and camelCase score records normalize to one model");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
