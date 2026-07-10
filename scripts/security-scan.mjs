import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "dist"]);
const forbiddenFileNames = new Set([".env", ".env.local"]);
const forbiddenNamePatterns = [/^ui-.*\.png$/i, /\.log$/i];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
]);

const suspiciousPatterns = [
  {
    name: "private key block",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  },
  {
    name: "long token-like assignment",
    pattern:
      /\b(?:api[_-]?key|token|secret|private[_-]?key|seed[_-]?phrase)\b\s*[:=]\s*["']?(?!your_|example|placeholder|TBD|tbd|not configured|needed|missing|import\.meta\.env)[A-Za-z0-9_\-.]{24,}/i,
  },
  {
    name: "mnemonic-like seed phrase",
    pattern:
      /\b(?:seed phrase|mnemonic)\b\s*[:=]\s*["']?(?:[a-z]+[\s,]+){11,23}[a-z]+["']?/i,
  },
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...walk(fullPath));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push({ fullPath, relativePath, name: entry.name });
    }
  }

  return files;
}

const files = walk(root);

function isIgnoredAndUntrackedLocalEnv(file) {
  if (file.name !== ".env.local") {
    return false;
  }

  let ignored = false;
  let tracked = false;

  try {
    execFileSync("git", ["check-ignore", "--quiet", "--", file.relativePath], { stdio: "ignore" });
    ignored = true;
  } catch {
    ignored = false;
  }

  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", file.relativePath], { stdio: "ignore" });
    tracked = true;
  } catch {
    tracked = false;
  }

  return ignored && !tracked;
}

for (const file of files) {
  if (isIgnoredAndUntrackedLocalEnv(file)) {
    pass(`${file.relativePath} is ignored and untracked; local credentials are not scanned or committed`);
    continue;
  }

  if (forbiddenFileNames.has(file.name)) {
    fail(`${file.relativePath} must not exist in the repository`);
  }

  for (const pattern of forbiddenNamePatterns) {
    if (pattern.test(file.name)) {
      fail(`${file.relativePath} looks like a generated artifact`);
    }
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!textExtensions.has(extension)) {
    continue;
  }

  const content = fs.readFileSync(file.fullPath, "utf8");
  for (const check of suspiciousPatterns) {
    if (check.pattern.test(content)) {
      fail(`${file.relativePath} contains suspicious ${check.name}`);
    }
  }
}

if (!failed) {
  pass("no forbidden local env files, generated screenshots, logs, or obvious secrets found");
  console.log("Security scan complete.");
} else {
  process.exitCode = 1;
}
