import assert from "node:assert/strict";
import fs from "node:fs";

const archive = JSON.parse(fs.readFileSync("src/data/txlineArchiveSnapshot.json", "utf8"));
const expected = new Map([
  [18188721, [0, 1]], [18187298, [1, 2]], [18192996, [2, 3]], [18198205, [0, 1]],
  [18193785, [1, 4]], [18202701, [3, 2]], [18202783, [0, 0]], [18209181, [2, 0]],
]);

assert.equal(archive.schemaVersion, 1);
assert.equal(archive.competitionId, 72);
assert.equal(archive.matches.length, 8);
assert.doesNotMatch(JSON.stringify(archive), /api[_-]?token|session[_-]?jwt|private[_-]?key|seed phrase/i);

for (const match of archive.matches) {
  assert.ok(expected.has(match.fixtureId), `Unexpected fixture ${match.fixtureId}`);
  assert.match(match.sourceEndpoint, new RegExp(`^/api/scores/historical/${match.fixtureId}$`));
  assert.ok(match.records.length > 0, `Fixture ${match.fixtureId} needs historical records`);
  const final = match.records.filter((record) => record.Action === "game_finalised").sort((a, b) => a.Seq - b.Seq).at(-1);
  assert.ok(final, `Fixture ${match.fixtureId} needs game_finalised`);
  const actual = [final.Score?.Participant1?.Total?.Goals ?? 0, final.Score?.Participant2?.Total?.Goals ?? 0];
  assert.deepEqual(actual, expected.get(match.fixtureId), `Fixture ${match.fixtureId} final score mismatch`);
  assert.equal(final.FixtureId, match.fixtureId);
}

console.log("PASS 8 credential-free TxLINE 2026 archive fixtures and game_finalised scores");
