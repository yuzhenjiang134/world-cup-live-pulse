import type { PulseLanguage, ScheduledBriefMode } from "./localizedPulse";

type VoiceCandidate = {
  lang: string;
  localService?: boolean;
  default?: boolean;
};

type SpeechProfile = {
  locale: string;
  rate: number;
  pitch: number;
};

const speechLocales: Record<PulseLanguage, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ar: "ar-SA",
};

const baseRates: Record<PulseLanguage, number> = {
  en: 0.96,
  zh: 0.92,
  es: 0.95,
  pt: 0.94,
  fr: 0.94,
  de: 0.93,
  ja: 0.92,
  ar: 0.9,
};

export function getSpeechProfile(language: PulseLanguage, mode: ScheduledBriefMode): SpeechProfile {
  const modeAdjustment = mode === "call" ? 0.02 : mode === "recap" ? -0.02 : 0;
  return {
    locale: speechLocales[language],
    rate: Math.max(0.85, Math.min(1, baseRates[language] + modeAdjustment)),
    pitch: mode === "call" ? 1.03 : 1,
  };
}

export function selectSpeechVoice<T extends VoiceCandidate>(voices: readonly T[], language: PulseLanguage): T | null {
  const locale = speechLocales[language].toLowerCase();
  const primaryLanguage = locale.split("-")[0];
  const scored = voices
    .map((voice, index) => {
      const voiceLocale = voice.lang.trim().replace("_", "-").toLowerCase();
      const voicePrimary = voiceLocale.split("-")[0];
      const languageScore = voiceLocale === locale ? 8 : voicePrimary === primaryLanguage ? 4 : 0;
      const localityScore = voice.localService ? 2 : 0;
      const defaultScore = voice.default ? 1 : 0;
      return { voice, index, score: languageScore + localityScore + defaultScore };
    })
    .filter((item) => item.score >= 4)
    .sort((left, right) => right.score - left.score || left.index - right.index);
  return scored[0]?.voice ?? null;
}
