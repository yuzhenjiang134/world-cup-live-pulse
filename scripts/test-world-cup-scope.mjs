import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import path from "node:path";
import ts from "typescript";

const filePath = path.join(process.cwd(), "src/lib/worldCupScope.ts");
const source = await readFile(filePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  fileName: filePath,
});
const encoded = Buffer.from(compiled.outputText, "utf8").toString("base64");
const scope = await import(`data:text/javascript;base64,${encoded}`);

const fixtures = [
  { FixtureId: 1, CompetitionId: 72, Competition: "World Cup" },
  { FixtureId: 2, CompetitionId: 430, Competition: "Friendlies" },
  { FixtureId: 3, Competition: "FIFA World Cup" },
  { FixtureId: 4, CompetitionId: 430, Competition: "World Cup" },
];
const filtered = scope.filterTxlineWorldCupFixtures(fixtures);
const ids = filtered.map((fixture) => fixture.FixtureId).join(",");

if (scope.txlineWorldCupCompetitionId !== 72) {
  throw new Error("TxLINE World Cup competition id must remain 72.");
}
if (ids !== "1,3") {
  throw new Error(`World Cup scope leaked non-tournament fixtures: ${ids}`);
}

console.log("PASS TxLINE World Cup scope keeps CompetitionId 72 and rejects Friendlies 430.");
