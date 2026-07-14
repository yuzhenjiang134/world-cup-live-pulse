import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import ts from "typescript";

const source = (await readFile(new URL("../src/lib/speechVoice.ts", import.meta.url), "utf8"))
  .replace('import type { PulseLanguage, ScheduledBriefMode } from "./localizedPulse";\n', "");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const speech = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const locales = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ar: "ar-SA",
};

for (const [language, locale] of Object.entries(locales)) {
  for (const mode of ["call", "why", "recap"]) {
    const profile = speech.getSpeechProfile(language, mode);
    assert.equal(profile.locale, locale);
    assert.ok(profile.rate >= 0.85 && profile.rate <= 1);
    assert.ok(profile.pitch >= 1 && profile.pitch <= 1.03);
  }
}

const voices = [
  { name: "Remote English", lang: "en-US", localService: false, default: true },
  { name: "Local UK", lang: "en-GB", localService: true, default: false },
  { name: "Local US", lang: "en_US", localService: true, default: false },
  { name: "Local Chinese", lang: "zh-CN", localService: true, default: false },
  { name: "French", lang: "fr-FR", localService: false, default: false },
];

assert.equal(speech.selectSpeechVoice(voices, "en")?.name, "Local US");
assert.equal(speech.selectSpeechVoice(voices, "zh")?.name, "Local Chinese");
assert.equal(speech.selectSpeechVoice(voices, "fr")?.name, "French");
assert.equal(speech.selectSpeechVoice(voices, "ar"), null);

console.log("PASS eight-language speech locales, pacing, and deterministic local voice preference");
