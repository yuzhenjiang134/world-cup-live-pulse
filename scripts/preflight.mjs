import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "README.md",
  "TASKS.md",
  ".env.example",
  "vercel.json",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  "docs/submission-draft.md",
  "docs/demo-script.md",
  "docs/technical-writeup.md",
  "docs/pre-submit-check.md",
  "docs/user-action-list.md",
  "docs/submission-pack.md",
  "docs/api-mapping-template.md",
  "docs/TECHNICAL_OVERVIEW.md",
  "docs/TXLINE_ENDPOINTS.md",
  "docs/API_FEEDBACK.md",
  "docs/SUBMISSION_DRAFT.md",
  "docs/DEMO_SCRIPT.md",
  "docs/SUBMISSION_CHECKLIST.md",
  "src/lib/txlineAdapter.ts",
  "src/lib/shareCard.ts",
  "src/data/replayMatch.ts",
  "src/data/matchCalendar.ts",
  "scripts/validate-fixtures.mjs",
  "scripts/security-scan.mjs",
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
  ["docs/TECHNICAL_OVERVIEW.md", "Data consistency model"],
  ["docs/TXLINE_ENDPOINTS.md", "Required endpoint mapping"],
  ["docs/API_FEEDBACK.md", "no-match-day"],
  ["docs/SUBMISSION_DRAFT.md", "Consumer and Fan Experiences"],
  ["docs/DEMO_SCRIPT.md", "under 5 minutes"],
  ["docs/SUBMISSION_CHECKLIST.md", "Final submission"],
  [".github/workflows/pages.yml", "Deploy GitHub Pages"],
  ["vite.config.ts", "github-pages"],
  ["src/lib/txlineAdapter.ts", "Needs TxLINE token"],
  ["src/data/replayMatch.ts", "replayMatches"],
  ["src/data/matchCalendar.ts", "never invents live games"],
  ["scripts/security-scan.mjs", "Security scan complete"],
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

if (packageJson.scripts?.validate && packageJson.scripts?.fixtures && packageJson.scripts?.security) {
  pass("package scripts include validate, fixtures, and security");
} else {
  fail("package scripts must include validate, fixtures, and security");
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Preflight complete.");
}
