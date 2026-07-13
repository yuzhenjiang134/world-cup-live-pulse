import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

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
  "docs/USER_MANUAL.md",
  "docs/PUBLIC_RESEARCH_SUMMARY.md",
  "docs/SUBMISSION_DRAFT.md",
  "docs/DEMO_SCRIPT.md",
  "docs/SUBMISSION_CHECKLIST.md",
  "docs/JUDGING_AUDIT_2026-07-11.md",
  "docs/FINAL_RELEASE_TASKS.md",
  "docs/ROUND_MASTER_TASKS_2026-07-12.md",
  "docs/FAN_PRODUCT_RESEARCH_2026-07-12.md",
  "docs/FAN_FIRST_ITERATION_TASKS.md",
  "docs/THREE_ROUND_MARKET_RESEARCH_2026-07-12.md",
  "api/txline/[...path].mjs",
  "src/lib/txlineAdapter.ts",
  "src/lib/challenge.ts",
  "src/lib/worldCupScope.ts",
  "src/lib/txlineScoreNormalizer.ts",
  "src/lib/shareCard.ts",
  "src/data/replayMatch.ts",
  "src/data/demoSeasonHistory.ts",
  "src/data/teamNames.ts",
  "src/data/matchCalendar.ts",
  "src/data/fanGuide.ts",
  "scripts/validate-fixtures.mjs",
  "scripts/audit-product-data.mjs",
  "scripts/test-score-challenge.mjs",
  "scripts/test-world-cup-scope.mjs",
  "scripts/test-txline-score-normalization.mjs",
  "scripts/test-ai-match-brief.mjs",
  "scripts/test-vercel-txline-proxy.mjs",
  "scripts/e2e-matchday.mjs",
  "scripts/security-scan.mjs",
  "scripts/txline-probe.mjs",
  "scripts/sync-txline-archive.mjs",
  "scripts/test-txline-archive.mjs",
  "scripts/record-demo-video.mjs",
  "scripts/render-demo-video.py",
  "scripts/render-demo-narration.ps1",
  "scripts/render-demo-package.ps1",
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
  ["docs/TECHNICAL_OVERVIEW.md", "Source truth model"],
  ["docs/TXLINE_ENDPOINTS.md", "Implemented endpoint mapping"],
  ["docs/TXLINE_ENDPOINTS.md", "GET /api/fixtures/snapshot"],
  ["docs/TXLINE_ENDPOINTS.md", "POST /auth/guest/start"],
  ["docs/TXLINE_ENDPOINTS.md", "X-Api-Token"],
  ["docs/API_FEEDBACK.md", "no-match-day"],
  ["docs/USER_MANUAL.md", "Current source teams"],
  ["docs/USER_MANUAL.md", "npm run txline:probe"],
  ["docs/PUBLIC_RESEARCH_SUMMARY.md", "Authorized Video Sync"],
  ["docs/PUBLIC_RESEARCH_SUMMARY.md", "Demo video up to 5 minutes"],
  ["docs/SUBMISSION_DRAFT.md", "CompetitionId 72"],
  ["docs/SUBMISSION_DRAFT.md", "Consumer and Fan Experiences"],
  ["docs/DEMO_SCRIPT.md", "below five minutes"],
  ["docs/SUBMISSION_CHECKLIST.md", "visible source state"],
  ["docs/SUBMISSION_CHECKLIST.md", "Final submission"],
  ["docs/JUDGING_AUDIT_2026-07-11.md", "Fan accessibility and user experience"],
  ["docs/JUDGING_AUDIT_2026-07-11.md", "Commercial and monetization path"],
  ["docs/FINAL_RELEASE_TASKS.md", "Demo video"],
  ["docs/FINAL_RELEASE_TASKS.md", "Submission audit and upload"],
  ["docs/ROUND_MASTER_TASKS_2026-07-12.md", "这是当前唯一执行清单"],
  ["docs/ROUND_MASTER_TASKS_2026-07-12.md", "无来源字段整段隐藏"],
  ["docs/ROUND_MASTER_TASKS_2026-07-12.md", "最终 Demo 与发布"],
  ["docs/ROUND_MASTER_TASKS_2026-07-12.md", "每项官方评审要求至少延展为 2 至 3 个真实可用"],
  ["docs/ROUND_MASTER_TASKS_2026-07-12.md", "同一工作树通过数据、可用性、语言/移动端/安全三轮本地验收"],
  ["docs/FAN_PRODUCT_RESEARCH_2026-07-12.md", "Pain points translated into product decisions"],
  ["docs/FAN_FIRST_ITERATION_TASKS.md", "P0: matchday essentials"],
  ["docs/THREE_ROUND_MARKET_RESEARCH_2026-07-12.md", "Round 1: live match center and key events"],
  ["docs/THREE_ROUND_MARKET_RESEARCH_2026-07-12.md", "Round 3: AI, personalization, and return engagement"],
  [".github/workflows/pages.yml", "Deploy GitHub Pages"],
  ["vite.config.ts", "github-pages"],
  ["src/lib/txlineAdapter.ts", "Live activation pending"],
  ["src/lib/txlineAdapter.ts", "/api/scores/snapshot"],
  ["src/lib/txlineAdapter.ts", "filterTxlineWorldCupFixtures"],
  ["src/lib/worldCupScope.ts", "txlineWorldCupCompetitionId = 72"],
  ["api/txline/[...path].mjs", "origin_not_allowed"],
  ["api/txline/[...path].mjs", "competitionId"],
  ["src/data/replayMatch.ts", "replayMatches"],
  ["src/data/matchCalendar.ts", "never invents live games"],
  ["src/data/fanGuide.ts", "teamAtlas"],
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

function isIgnoredAndUntracked(file) {
  try {
    execFileSync("git", ["check-ignore", "--quiet", "--", file], { stdio: "ignore" });
    execFileSync("git", ["ls-files", "--error-unmatch", "--", file], { stdio: "ignore" });
    return false;
  } catch {
    let ignored = false;
    let tracked = false;
    try {
      execFileSync("git", ["check-ignore", "--quiet", "--", file], { stdio: "ignore" });
      ignored = true;
    } catch {
      ignored = false;
    }
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", "--", file], { stdio: "ignore" });
      tracked = true;
    } catch {
      tracked = false;
    }
    return ignored && !tracked;
  }
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
  if (file === ".env.local" && fs.existsSync(fullPath) && isIgnoredAndUntracked(file)) {
    pass(`${file} is present locally, ignored, and untracked`);
  } else if (fs.existsSync(fullPath)) {
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

if (packageJson.scripts?.validate && packageJson.scripts?.fixtures && packageJson.scripts?.audit && packageJson.scripts?.challenge && packageJson.scripts?.scope && packageJson.scripts?.["scores:test"] && packageJson.scripts?.["ai:test"] && packageJson.scripts?.["archive:test"] && packageJson.scripts?.["proxy:test"] && packageJson.scripts?.security && packageJson.scripts?.["e2e:matchday"]) {
  pass("package scripts include validate, fixtures, audit, challenge, scope, score normalization, AI brief, proxy, browser E2E, and security");
} else {
  fail("package scripts must include validate, fixtures, audit, challenge, scope, score normalization, AI brief, proxy, browser E2E, and security");
}

if (packageJson.scripts?.["txline:probe"]) {
  pass("package scripts include txline:probe");
} else {
  fail("package scripts must include txline:probe");
}

if (packageJson.scripts?.["demo:video"]) {
  pass("package scripts include reproducible English final-demo generation");
} else {
  fail("package scripts must include reproducible English final-demo generation");
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Preflight complete.");
}
