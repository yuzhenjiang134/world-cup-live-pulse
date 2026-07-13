import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import ts from "typescript";

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function loadReplayMatches() {
  const source = (await readFile(new URL("../src/data/replayMatch.ts", import.meta.url), "utf8"))
    .replace('import { txlineArchiveMatches } from "./txlineArchive";', "const txlineArchiveMatches = [];");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
    fileName: "src/data/replayMatch.ts",
    reportDiagnostics: true,
  });

  const errors = result.diagnostics?.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors?.length) {
    for (const diagnostic of errors) {
      fail(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
    return [];
  }

  const encoded = Buffer.from(result.outputText, "utf8").toString("base64");
  const fixtureModule = await import(`data:text/javascript;base64,${encoded}`);
  return fixtureModule.legacyReplayMatches;
}

const replayMatches = await loadReplayMatches();

if (!Array.isArray(replayMatches)) {
  fail("legacyReplayMatches must be exported as an array");
}

for (const match of replayMatches) {
  if (!match.id || !match.home?.code || !match.away?.code) {
    fail(`${match.id || "unknown"} is missing identity fields`);
    continue;
  }

  if (match.events.length < 5) {
    fail(`${match.id} needs at least five replay events`);
  } else {
    pass(`${match.id} has ${match.events.length} events`);
  }

  if (match.market.length < 5) {
    fail(`${match.id} needs at least five market snapshots`);
  } else {
    pass(`${match.id} has ${match.market.length} market snapshots`);
  }

  const eventIds = new Set(match.events.map((event) => event.id));
  if (eventIds.size !== match.events.length) {
    fail(`${match.id} has duplicate event ids`);
  } else {
    pass(`${match.id} event ids are unique`);
  }

  for (let index = 1; index < match.events.length; index += 1) {
    if (match.events[index].minute < match.events[index - 1].minute) {
      fail(`${match.id} events are not sorted by minute`);
    }
  }

  for (let index = 1; index < match.market.length; index += 1) {
    if (match.market[index].minute < match.market[index - 1].minute) {
      fail(`${match.id} market snapshots are not sorted by minute`);
    }
  }

  for (const event of match.events) {
    if (event.marketPulse < 0 || event.marketPulse > 100) {
      fail(`${match.id}/${event.id} marketPulse must be 0-100`);
    }
  }

  for (const snapshot of match.market) {
    if (snapshot.sentiment < 0 || snapshot.sentiment > 100) {
      fail(`${match.id}/${snapshot.minute} sentiment must be 0-100`);
    }
  }

  const firstEvent = match.events[0];
  const lastEvent = match.events.at(-1);
  if (firstEvent.minute > 1) {
    fail(`${match.id} should start at minute 1`);
  } else {
    pass(`${match.id} starts at minute ${firstEvent.minute}`);
  }

  if (!lastEvent || lastEvent.type !== "fulltime") {
    fail(`${match.id} should end with a fulltime event`);
  } else {
    pass(`${match.id} ends with fulltime`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Fixture validation complete.");
}
