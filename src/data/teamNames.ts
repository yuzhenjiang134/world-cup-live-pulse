export type TeamNameLanguage = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";

const names: Partial<Record<TeamNameLanguage, Record<string, string>>> = {
  zh: { ARG: "阿根廷", SUI: "瑞士", FRA: "法国", ESP: "西班牙", PAR: "巴拉圭", BRA: "巴西", NOR: "挪威", MEX: "墨西哥", ENG: "英格兰", POR: "葡萄牙", USA: "美国", BEL: "比利时", EGY: "埃及", COL: "哥伦比亚", MAR: "摩洛哥", GER: "德国", JPN: "日本" },
  es: { ARG: "Argentina", SUI: "Suiza", FRA: "Francia", ESP: "España", PAR: "Paraguay", BRA: "Brasil", NOR: "Noruega", MEX: "México", ENG: "Inglaterra", POR: "Portugal", USA: "Estados Unidos", BEL: "Bélgica", EGY: "Egipto", COL: "Colombia", MAR: "Marruecos", GER: "Alemania", JPN: "Japón" },
  pt: { ARG: "Argentina", SUI: "Suíça", FRA: "França", ESP: "Espanha", PAR: "Paraguai", BRA: "Brasil", NOR: "Noruega", MEX: "México", ENG: "Inglaterra", POR: "Portugal", USA: "Estados Unidos", BEL: "Bélgica", EGY: "Egito", COL: "Colômbia", MAR: "Marrocos", GER: "Alemanha", JPN: "Japão" },
  fr: { ARG: "Argentine", SUI: "Suisse", FRA: "France", ESP: "Espagne", PAR: "Paraguay", BRA: "Brésil", NOR: "Norvège", MEX: "Mexique", ENG: "Angleterre", POR: "Portugal", USA: "États-Unis", BEL: "Belgique", EGY: "Égypte", COL: "Colombie", MAR: "Maroc", GER: "Allemagne", JPN: "Japon" },
  de: { ARG: "Argentinien", SUI: "Schweiz", FRA: "Frankreich", ESP: "Spanien", PAR: "Paraguay", BRA: "Brasilien", NOR: "Norwegen", MEX: "Mexiko", ENG: "England", POR: "Portugal", USA: "Vereinigte Staaten", BEL: "Belgien", EGY: "Ägypten", COL: "Kolumbien", MAR: "Marokko", GER: "Deutschland", JPN: "Japan" },
  ja: { ARG: "アルゼンチン", SUI: "スイス", FRA: "フランス", ESP: "スペイン", PAR: "パラグアイ", BRA: "ブラジル", NOR: "ノルウェー", MEX: "メキシコ", ENG: "イングランド", POR: "ポルトガル", USA: "アメリカ", BEL: "ベルギー", EGY: "エジプト", COL: "コロンビア", MAR: "モロッコ", GER: "ドイツ", JPN: "日本" },
  ar: { ARG: "الأرجنتين", SUI: "سويسرا", FRA: "فرنسا", ESP: "إسبانيا", PAR: "باراغواي", BRA: "البرازيل", NOR: "النرويج", MEX: "المكسيك", ENG: "إنجلترا", POR: "البرتغال", USA: "الولايات المتحدة", BEL: "بلجيكا", EGY: "مصر", COL: "كولومبيا", MAR: "المغرب", GER: "ألمانيا", JPN: "اليابان" },
};

export function localizeTeamName(code: string, fallback: string, language: TeamNameLanguage) {
  return names[language]?.[code] ?? fallback ?? code;
}
