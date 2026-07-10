import fs from "node:fs";

const file = "src/MatchdayApp.tsx";
const source = fs.readFileSync(file, "utf8");
const languageCodes = ["en", "zh", "es", "pt", "fr", "de", "ja", "ar"];

const blocks = new Map();
for (const code of languageCodes) {
  const match = source.match(new RegExp(`\\n  ${code}: \\{([\\s\\S]*?)\\n  \\},\\n`));
  if (!match) throw new Error(`Missing UI language block: ${code}`);
  const keys = [...match[1].matchAll(/^    ([A-Za-z][A-Za-z0-9]*):/gm)].map((item) => item[1]);
  blocks.set(code, keys);
}

const baseKeys = blocks.get("en");
for (const code of languageCodes.slice(1)) {
  const keys = blocks.get(code);
  const missing = baseKeys.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !baseKeys.includes(key));
  if (missing.length || extra.length) {
    throw new Error(`${code} UI keys differ. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`);
  }
}

for (const code of languageCodes) {
  if (!new RegExp(`code: \\"${code}\\"`).test(source)) {
    throw new Error(`Language selector does not expose: ${code}`);
  }
}

const mojibakeMarkers = ["浠ョ", "銉", "賲丕", "莽", "茅", "脷", "锛", "鏃ユ"];
const foundMarkers = mojibakeMarkers.filter((marker) => source.includes(marker));
if (foundMarkers.length) throw new Error(`Known mojibake markers found in ${file}: ${foundMarkers.join(", ")}`);

console.log(`PASS i18n: ${languageCodes.length} languages, ${baseKeys.length} shared UI keys, UTF-8 text check clean`);

