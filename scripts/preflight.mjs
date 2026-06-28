import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "README.md",
  "TASKS.md",
  ".env.example",
  "vercel.json",
  ".github/workflows/ci.yml",
  "docs/submission-draft.md",
  "docs/demo-script.md",
  "docs/technical-writeup.md",
  "docs/pre-submit-check.md",
  "docs/user-action-list.md",
  "docs/submission-pack.md",
  "docs/api-mapping-template.md",
  "src/lib/txlineAdapter.ts",
  "src/lib/shareCard.ts",
  "src/data/replayMatch.ts",
  "scripts/validate-fixtures.mjs",
];

const forbiddenFiles = [".env", ".env.local"];
const requiredText = [
  ["README.md", "does not place bets"],
  ["TASKS.md", "Blocked until user provides external inputs"],
  ["docs/submission-draft.md", "Consumer and Fan Experiences"],
  ["docs/technical-writeup.md", "Replay JSON or TxLINE API"],
  ["docs/user-action-list.md", "Step 2: TxLINE API"],
  ["docs/submission-pack.md", "World Cup Live Pulse"],
  ["docs/api-mapping-template.md", "Endpoint inventory"],
  ["src/lib/txlineAdapter.ts", "Needs TxLINE token"],
  ["src/data/replayMatch.ts", "replayMatches"],
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    pass(`${file} exists`);
  } else {
    fail(`${file} is missing`);
  }
}

for (const file of forbiddenFiles) {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    fail(`${file} must not be committed`);
  } else {
    pass(`${file} absent`);
  }
}

for (const [file, text] of requiredText) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf8");
  if (content.includes(text)) {
    pass(`${file} contains "${text}"`);
  } else {
    fail(`${file} does not contain "${text}"`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts?.check && packageJson.scripts?.build) {
  pass("package scripts include check and build");
} else {
  fail("package scripts must include check and build");
}

if (packageJson.scripts?.validate && packageJson.scripts?.fixtures) {
  pass("package scripts include validate and fixtures");
} else {
  fail("package scripts must include validate and fixtures");
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Preflight complete.");
}
