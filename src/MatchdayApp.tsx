import { useEffect, useMemo, useState } from "react";
import { dataConsistencyState } from "./data/matchCalendar";
import { replayMatches } from "./data/replayMatch";
import { buildPulseFrame } from "./lib/pulse";
import { loadMatchData } from "./lib/txlineAdapter";
import type { DataSourceState, MatchData, MatchEvent, MatchMode, Team } from "./types";

type Language = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";
type View = "match" | "teams";

type UiCopy = {
  brandKicker: string;
  navMatch: string;
  navLive: string;
  navReplay: string;
  navTeams: string;
  navSettings: string;
  source: string;
  refresh: string;
  loading: string;
  live: string;
  delayed: string;
  replay: string;
  seed: string;
  fallback: string;
  verifiedAt: string;
  officialFeed: string;
  publicFeed: string;
  replayFeed: string;
  noLiveFeed: string;
  scorePulse: string;
  matchCenter: string;
  liveNow: string;
  final: string;
  scheduled: string;
  events: string;
  latest: string;
  noEvents: string;
  goals: string;
  yellow: string;
  red: string;
  extraTime: string;
  fanPulse: string;
  dataQuality: string;
  officialOdds: string;
  derivedPulse: string;
  replaySnapshot: string;
  next: string;
  scoreChallenge: string;
  testPoints: string;
  pointsNote: string;
  yourScore: string;
  lockPick: string;
  locked: string;
  pointsNeeded: string;
  settle: string;
  waitingSettlement: string;
  exact: string;
  result: string;
  noBetting: string;
  replayLibrary: string;
  chooseReplay: string;
  teams: string;
  players: string;
  coach: string;
  watch: string;
  officialWatch: string;
  noWatch: string;
  settings: string;
  close: string;
  language: string;
  dataConnection: string;
  authDescription: string;
  openHelper: string;
  localOnly: string;
  advancedHidden: string;
  connectionReady: string;
  connectionFallback: string;
  refreshData: string;
  languageNote: string;
  dataRules: string;
  onlyVerified: string;
};

const ui: Record<Language, UiCopy> = {
  en: {
    brandKicker: "Fan-first match intelligence",
    navMatch: "Match center",
    navLive: "Live now",
    navReplay: "Replay room",
    navTeams: "Teams",
    navSettings: "Settings",
    source: "Data source",
    refresh: "Refresh",
    loading: "Loading verified match data",
    live: "Live",
    delayed: "Delayed",
    replay: "Replay",
    seed: "Seed",
    fallback: "Fallback",
    verifiedAt: "Checked",
    officialFeed: "TxLINE score feed",
    publicFeed: "Public scoreboard",
    replayFeed: "Fixed replay fixture",
    noLiveFeed: "No live feed in this view",
    scorePulse: "Score pulse",
    matchCenter: "Match center",
    liveNow: "Live now",
    final: "Full time",
    scheduled: "Scheduled",
    events: "Match events",
    latest: "Latest moment",
    noEvents: "No verified events in this window.",
    goals: "Goals",
    yellow: "Yellow",
    red: "Red",
    extraTime: "ET / added time",
    fanPulse: "Fan pulse",
    dataQuality: "Data quality",
    officialOdds: "Official odds snapshot",
    derivedPulse: "Score-derived pulse",
    replaySnapshot: "Replay market snapshot",
    next: "Next signal",
    scoreChallenge: "Fan score challenge",
    testPoints: "Test points",
    pointsNote: "Local-only points. No cash value, wallet, or betting.",
    yourScore: "Your score",
    lockPick: "Lock score pick · 50 pts",
    locked: "Pick locked",
    pointsNeeded: "Not enough test points",
    settle: "Settle from final score",
    waitingSettlement: "Settlement unlocks when the verified final score is available.",
    exact: "Exact score",
    result: "Result",
    noBetting: "Discussion game only. Never a wager or trading signal.",
    replayLibrary: "Replay library",
    chooseReplay: "Open a fixed, judgeable match story",
    teams: "Teams and players",
    players: "Key players",
    coach: "Coach",
    watch: "Watch / replay",
    officialWatch: "Open official source",
    noWatch: "No rights-cleared video source is configured. Timeline replay remains available.",
    settings: "Settings",
    close: "Close",
    language: "Language",
    dataConnection: "Live data connection",
    authDescription: "Authentication is kept here so the main fan view stays focused. Tokens remain local and are never displayed.",
    openHelper: "Open TxLINE activation helper",
    localOnly: "Local .env.local only",
    advancedHidden: "Advanced data connection",
    connectionReady: "Authenticated source configured",
    connectionFallback: "Replay / public fallback active",
    refreshData: "Refresh verified feed",
    languageNote: "UI labels are translated; team and player names remain source-of-truth names.",
    dataRules: "Truth rules",
    onlyVerified: "Only verified score, event, and fixture data is labeled live.",
  },
  zh: {
    brandKicker: "以球迷为先的比赛情报",
    navMatch: "比赛中心",
    navLive: "实时比赛",
    navReplay: "回放空间",
    navTeams: "球队与球员",
    navSettings: "设置",
    source: "数据来源",
    refresh: "刷新",
    loading: "正在加载已核验比赛数据",
    live: "实时",
    delayed: "延迟",
    replay: "回放",
    seed: "赛程种子",
    fallback: "兜底",
    verifiedAt: "核验时间",
    officialFeed: "TxLINE 比分源",
    publicFeed: "公开比分源",
    replayFeed: "固定回放赛事实例",
    noLiveFeed: "当前视图没有实时源",
    scorePulse: "比分脉冲",
    matchCenter: "比赛中心",
    liveNow: "正在进行",
    final: "全场结束",
    scheduled: "未开赛",
    events: "比赛事件",
    latest: "最新节点",
    noEvents: "当前时间窗没有已核验事件。",
    goals: "进球",
    yellow: "黄牌",
    red: "红牌",
    extraTime: "加时 / 补时",
    fanPulse: "球迷脉冲",
    dataQuality: "数据质量",
    officialOdds: "官方赔率快照",
    derivedPulse: "由比分推导的脉冲",
    replaySnapshot: "回放市场快照",
    next: "下一个信号",
    scoreChallenge: "球迷比分挑战",
    testPoints: "测试积分",
    pointsNote: "仅本地积分，无现金价值，不连接钱包，不是下注。",
    yourScore: "你的比分",
    lockPick: "锁定比分 · 50 积分",
    locked: "已锁定",
    pointsNeeded: "测试积分不足",
    settle: "按最终比分结算",
    waitingSettlement: "已核验最终比分后才可结算。",
    exact: "精确比分",
    result: "赛果",
    noBetting: "仅用于球迷讨论，不是下注或交易信号。",
    replayLibrary: "回放库",
    chooseReplay: "打开固定、可复现的比赛故事",
    teams: "球队与球员",
    players: "关键球员",
    coach: "教练",
    watch: "观看 / 回放",
    officialWatch: "打开官方来源",
    noWatch: "尚未配置有版权的视频来源，仍可使用时间线回放。",
    settings: "设置",
    close: "关闭",
    language: "语言",
    dataConnection: "实时数据连接",
    authDescription: "认证流程放在这里，让主视图专注看比赛。Token 只保存在本地，不会在页面显示。",
    openHelper: "打开 TxLINE 激活助手",
    localOnly: "仅限本地 .env.local",
    advancedHidden: "高级数据连接",
    connectionReady: "已配置认证数据源",
    connectionFallback: "当前使用回放 / 公开兜底",
    refreshData: "刷新已核验数据",
    languageNote: "界面标签会翻译；球队和球员名称保持数据源原名。",
    dataRules: "数据规则",
    onlyVerified: "只有比分、事件和赛程经过核验时才会标记为实时。",
  },
  es: {
    brandKicker: "Inteligencia de partido para fans",
    navMatch: "Centro del partido",
    navLive: "En vivo",
    navReplay: "Repetición",
    navTeams: "Equipos",
    navSettings: "Ajustes",
    source: "Fuente",
    refresh: "Actualizar",
    loading: "Cargando datos verificados",
    live: "En vivo",
    delayed: "Retrasado",
    replay: "Repetición",
    seed: "Calendario",
    fallback: "Respaldo",
    verifiedAt: "Revisado",
    officialFeed: "Feed de TxLINE",
    publicFeed: "Marcador público",
    replayFeed: "Partido de repetición fijo",
    noLiveFeed: "Sin feed en vivo en esta vista",
    scorePulse: "Pulso del marcador",
    matchCenter: "Centro del partido",
    liveNow: "Ahora",
    final: "Final",
    scheduled: "Programado",
    events: "Eventos",
    latest: "Último momento",
    noEvents: "No hay eventos verificados en esta ventana.",
    goals: "Goles",
    yellow: "Amarillas",
    red: "Rojas",
    extraTime: "Prórroga / añadido",
    fanPulse: "Pulso fan",
    dataQuality: "Calidad",
    officialOdds: "Cuotas oficiales",
    derivedPulse: "Pulso derivado del marcador",
    replaySnapshot: "Mercado de repetición",
    next: "Siguiente señal",
    scoreChallenge: "Reto de marcador",
    testPoints: "Puntos de prueba",
    pointsNote: "Solo local. Sin valor monetario ni apuestas.",
    yourScore: "Tu marcador",
    lockPick: "Bloquear · 50 puntos",
    locked: "Bloqueado",
    pointsNeeded: "Puntos insuficientes",
    settle: "Resolver con el resultado final",
    waitingSettlement: "Disponible cuando exista un resultado final verificado.",
    exact: "Marcador exacto",
    result: "Resultado",
    noBetting: "Juego de conversación, no apuesta ni señal de trading.",
    replayLibrary: "Biblioteca de repeticiones",
    chooseReplay: "Abrir una historia fija y reproducible",
    teams: "Equipos y jugadores",
    players: "Jugadores clave",
    coach: "Entrenador",
    watch: "Ver / repetir",
    officialWatch: "Abrir fuente oficial",
    noWatch: "No hay vídeo autorizado configurado. La línea de tiempo sigue disponible.",
    settings: "Ajustes",
    close: "Cerrar",
    language: "Idioma",
    dataConnection: "Conexión de datos en vivo",
    authDescription: "La autenticación vive aquí para mantener limpia la vista del fan.",
    openHelper: "Abrir asistente de TxLINE",
    localOnly: "Solo .env.local",
    advancedHidden: "Conexión avanzada",
    connectionReady: "Fuente autenticada configurada",
    connectionFallback: "Repetición / respaldo público",
    refreshData: "Actualizar feed verificado",
    languageNote: "Las etiquetas se traducen; nombres de equipos y jugadores siguen la fuente.",
    dataRules: "Reglas de datos",
    onlyVerified: "Solo los datos verificados se marcan como en vivo.",
  },
  pt: {
    brandKicker: "Inteligência de jogo para torcedores",
    navMatch: "Central da partida",
    navLive: "Ao vivo",
    navReplay: "Reprise",
    navTeams: "Times",
    navSettings: "Configurações",
    source: "Fonte",
    refresh: "Atualizar",
    loading: "Carregando dados verificados",
    live: "Ao vivo",
    delayed: "Atrasado",
    replay: "Reprise",
    seed: "Calendário",
    fallback: "Reserva",
    verifiedAt: "Verificado",
    officialFeed: "Feed TxLINE",
    publicFeed: "Placar público",
    replayFeed: "Partida fixa de reprise",
    noLiveFeed: "Sem feed ao vivo nesta visão",
    scorePulse: "Pulso do placar",
    matchCenter: "Central da partida",
    liveNow: "Agora",
    final: "Final",
    scheduled: "Agendado",
    events: "Eventos",
    latest: "Último momento",
    noEvents: "Nenhum evento verificado nesta janela.",
    goals: "Gols",
    yellow: "Amarelos",
    red: "Vermelhos",
    extraTime: "Prorrogação / acréscimos",
    fanPulse: "Pulso dos fãs",
    dataQuality: "Qualidade",
    officialOdds: "Odds oficiais",
    derivedPulse: "Pulso derivado do placar",
    replaySnapshot: "Mercado da reprise",
    next: "Próximo sinal",
    scoreChallenge: "Desafio de placar",
    testPoints: "Pontos de teste",
    pointsNote: "Somente local. Sem valor em dinheiro ou apostas.",
    yourScore: "Seu placar",
    lockPick: "Travar placar · 50 pontos",
    locked: "Travado",
    pointsNeeded: "Pontos insuficientes",
    settle: "Apurar pelo placar final",
    waitingSettlement: "Disponível quando houver placar final verificado.",
    exact: "Placar exato",
    result: "Resultado",
    noBetting: "Jogo de conversa, não aposta nem sinal de trading.",
    replayLibrary: "Biblioteca de reprises",
    chooseReplay: "Abrir uma história fixa e reproduzível",
    teams: "Times e jogadores",
    players: "Jogadores-chave",
    coach: "Técnico",
    watch: "Assistir / reprise",
    officialWatch: "Abrir fonte oficial",
    noWatch: "Nenhum vídeo autorizado configurado. A linha do tempo continua disponível.",
    settings: "Configurações",
    close: "Fechar",
    language: "Idioma",
    dataConnection: "Conexão de dados ao vivo",
    authDescription: "A autenticação fica aqui para manter a visão do torcedor limpa.",
    openHelper: "Abrir assistente TxLINE",
    localOnly: "Somente .env.local",
    advancedHidden: "Conexão avançada",
    connectionReady: "Fonte autenticada configurada",
    connectionFallback: "Reprise / reserva pública",
    refreshData: "Atualizar feed verificado",
    languageNote: "Os rótulos são traduzidos; nomes seguem a fonte original.",
    dataRules: "Regras de dados",
    onlyVerified: "Somente dados verificados são marcados ao vivo.",
  },
  fr: {
    brandKicker: "Intelligence de match pour les fans",
    navMatch: "Centre du match",
    navLive: "En direct",
    navReplay: "Replay",
    navTeams: "Équipes",
    navSettings: "Réglages",
    source: "Source",
    refresh: "Actualiser",
    loading: "Chargement des données vérifiées",
    live: "Direct",
    delayed: "Retardé",
    replay: "Replay",
    seed: "Calendrier",
    fallback: "Secours",
    verifiedAt: "Vérifié",
    officialFeed: "Flux TxLINE",
    publicFeed: "Score public",
    replayFeed: "Match replay fixe",
    noLiveFeed: "Aucun flux direct ici",
    scorePulse: "Pouls du score",
    matchCenter: "Centre du match",
    liveNow: "En cours",
    final: "Fin du match",
    scheduled: "Programmé",
    events: "Événements",
    latest: "Dernier moment",
    noEvents: "Aucun événement vérifié dans cette fenêtre.",
    goals: "Buts",
    yellow: "Jaunes",
    red: "Rouges",
    extraTime: "Prolongation / arrêts",
    fanPulse: "Pouls des fans",
    dataQuality: "Qualité",
    officialOdds: "Cotes officielles",
    derivedPulse: "Pouls dérivé du score",
    replaySnapshot: "Marché du replay",
    next: "Prochain signal",
    scoreChallenge: "Défi de score",
    testPoints: "Points de test",
    pointsNote: "Local uniquement. Sans valeur monétaire ni pari.",
    yourScore: "Votre score",
    lockPick: "Verrouiller · 50 points",
    locked: "Verrouillé",
    pointsNeeded: "Points insuffisants",
    settle: "Régler avec le score final",
    waitingSettlement: "Disponible avec un score final vérifié.",
    exact: "Score exact",
    result: "Résultat",
    noBetting: "Jeu de discussion, pas un pari ni un signal de trading.",
    replayLibrary: "Bibliothèque replay",
    chooseReplay: "Ouvrir une histoire fixe et reproductible",
    teams: "Équipes et joueurs",
    players: "Joueurs clés",
    coach: "Entraîneur",
    watch: "Regarder / replay",
    officialWatch: "Ouvrir la source officielle",
    noWatch: "Aucune vidéo autorisée configurée. La timeline reste disponible.",
    settings: "Réglages",
    close: "Fermer",
    language: "Langue",
    dataConnection: "Connexion live",
    authDescription: "L’authentification est ici pour garder la vue fan claire.",
    openHelper: "Ouvrir l’assistant TxLINE",
    localOnly: "Local .env.local uniquement",
    advancedHidden: "Connexion avancée",
    connectionReady: "Source authentifiée configurée",
    connectionFallback: "Replay / secours public",
    refreshData: "Actualiser le flux vérifié",
    languageNote: "Les libellés sont traduits; les noms suivent la source.",
    dataRules: "Règles de données",
    onlyVerified: "Seules les données vérifiées sont marquées en direct.",
  },
  de: {
    brandKicker: "Spieldaten für Fans",
    navMatch: "Spielzentrum",
    navLive: "Live",
    navReplay: "Wiederholung",
    navTeams: "Teams",
    navSettings: "Einstellungen",
    source: "Datenquelle",
    refresh: "Aktualisieren",
    loading: "Verifizierte Spieldaten werden geladen",
    live: "Live",
    delayed: "Verzögert",
    replay: "Wiederholung",
    seed: "Spielplan",
    fallback: "Ersatz",
    verifiedAt: "Geprüft",
    officialFeed: "TxLINE Feed",
    publicFeed: "Öffentliche Anzeige",
    replayFeed: "Fixiertes Replay-Spiel",
    noLiveFeed: "Keine Livequelle in dieser Ansicht",
    scorePulse: "Torpuls",
    matchCenter: "Spielzentrum",
    liveNow: "Jetzt",
    final: "Abpfiff",
    scheduled: "Geplant",
    events: "Ereignisse",
    latest: "Letzter Moment",
    noEvents: "Keine verifizierten Ereignisse in diesem Fenster.",
    goals: "Tore",
    yellow: "Gelb",
    red: "Rot",
    extraTime: "Verlängerung / Nachspielzeit",
    fanPulse: "Fanpuls",
    dataQuality: "Datenqualität",
    officialOdds: "Offizielle Quoten",
    derivedPulse: "Aus dem Spielstand abgeleitet",
    replaySnapshot: "Replay-Markt",
    next: "Nächstes Signal",
    scoreChallenge: "Tippspiel für Fans",
    testPoints: "Testpunkte",
    pointsNote: "Nur lokal. Kein Geldwert und keine Wette.",
    yourScore: "Dein Ergebnis",
    lockPick: "Festlegen · 50 Punkte",
    locked: "Festgelegt",
    pointsNeeded: "Nicht genügend Punkte",
    settle: "Mit Endstand abrechnen",
    waitingSettlement: "Nach verifiziertem Endstand verfügbar.",
    exact: "Exakter Stand",
    result: "Ergebnis",
    noBetting: "Diskussionsspiel, keine Wette oder Trading-Signal.",
    replayLibrary: "Replay-Bibliothek",
    chooseReplay: "Eine feste, reproduzierbare Geschichte öffnen",
    teams: "Teams und Spieler",
    players: "Schlüsselspieler",
    coach: "Trainer",
    watch: "Ansehen / Replay",
    officialWatch: "Offizielle Quelle öffnen",
    noWatch: "Keine autorisierte Videoquelle konfiguriert. Die Timeline bleibt verfügbar.",
    settings: "Einstellungen",
    close: "Schließen",
    language: "Sprache",
    dataConnection: "Live-Datenverbindung",
    authDescription: "Die Authentifizierung bleibt hier, damit die Fanansicht klar bleibt.",
    openHelper: "TxLINE-Assistent öffnen",
    localOnly: "Nur lokales .env.local",
    advancedHidden: "Erweiterte Verbindung",
    connectionReady: "Authentifizierte Quelle konfiguriert",
    connectionFallback: "Replay / öffentliche Reserve",
    refreshData: "Verifizierten Feed aktualisieren",
    languageNote: "Labels werden übersetzt; Namen folgen der Quelle.",
    dataRules: "Datenregeln",
    onlyVerified: "Nur verifizierte Daten werden als live markiert.",
  },
  ja: {
    brandKicker: "ファン向け試合インテリジェンス",
    navMatch: "試合センター",
    navLive: "ライブ",
    navReplay: "リプレイ",
    navTeams: "チーム",
    navSettings: "設定",
    source: "データソース",
    refresh: "更新",
    loading: "検証済みデータを読み込み中",
    live: "ライブ",
    delayed: "遅延",
    replay: "リプレイ",
    seed: "予定",
    fallback: "フォールバック",
    verifiedAt: "確認",
    officialFeed: "TxLINE スコア",
    publicFeed: "公開スコア",
    replayFeed: "固定リプレイ",
    noLiveFeed: "この表示にライブデータはありません",
    scorePulse: "スコアパルス",
    matchCenter: "試合センター",
    liveNow: "進行中",
    final: "試合終了",
    scheduled: "予定",
    events: "試合イベント",
    latest: "最新の瞬間",
    noEvents: "この時間帯に検証済みイベントはありません。",
    goals: "ゴール",
    yellow: "イエロー",
    red: "レッド",
    extraTime: "延長 / アディショナル",
    fanPulse: "ファンパルス",
    dataQuality: "データ品質",
    officialOdds: "公式オッズ",
    derivedPulse: "スコアから算出したパルス",
    replaySnapshot: "リプレイ市場スナップショット",
    next: "次のシグナル",
    scoreChallenge: "ファンスコアチャレンジ",
    testPoints: "テストポイント",
    pointsNote: "ローカル専用。金銭価値・賭けなし。",
    yourScore: "予想スコア",
    lockPick: "スコアを確定 · 50ポイント",
    locked: "確定済み",
    pointsNeeded: "ポイント不足",
    settle: "最終スコアで確定",
    waitingSettlement: "検証済みの最終スコアで利用できます。",
    exact: "完全一致",
    result: "結果",
    noBetting: "会話型ゲームです。賭けや取引シグナルではありません。",
    replayLibrary: "リプレイライブラリ",
    chooseReplay: "固定された再現可能な試合を開く",
    teams: "チームと選手",
    players: "注目選手",
    coach: "監督",
    watch: "視聴 / リプレイ",
    officialWatch: "公式ソースを開く",
    noWatch: "権利確認済み動画は未設定です。タイムラインは利用できます。",
    settings: "設定",
    close: "閉じる",
    language: "言語",
    dataConnection: "ライブデータ接続",
    authDescription: "認証はここにまとめ、ファン画面をシンプルに保ちます。",
    openHelper: "TxLINE ヘルパーを開く",
    localOnly: "ローカル .env.local のみ",
    advancedHidden: "高度なデータ接続",
    connectionReady: "認証済みソース設定済み",
    connectionFallback: "リプレイ / 公開フォールバック",
    refreshData: "検証済みフィードを更新",
    languageNote: "UIラベルは翻訳し、チーム名・選手名はソース名を維持します。",
    dataRules: "データルール",
    onlyVerified: "検証済みデータだけをライブと表示します。",
  },
  ar: {
    brandKicker: "ذكاء المباراة للمشجعين",
    navMatch: "مركز المباراة",
    navLive: "مباشر",
    navReplay: "إعادة",
    navTeams: "الفرق",
    navSettings: "الإعدادات",
    source: "مصدر البيانات",
    refresh: "تحديث",
    loading: "جار تحميل البيانات الموثقة",
    live: "مباشر",
    delayed: "متأخر",
    replay: "إعادة",
    seed: "الجدول",
    fallback: "بديل",
    verifiedAt: "تم التحقق",
    officialFeed: "مصدر TxLINE",
    publicFeed: "نتيجة عامة",
    replayFeed: "مباراة إعادة ثابتة",
    noLiveFeed: "لا يوجد مصدر مباشر هنا",
    scorePulse: "نبض النتيجة",
    matchCenter: "مركز المباراة",
    liveNow: "الآن",
    final: "النهاية",
    scheduled: "مجدولة",
    events: "أحداث المباراة",
    latest: "آخر لحظة",
    noEvents: "لا توجد أحداث موثقة في هذه النافذة.",
    goals: "أهداف",
    yellow: "بطاقات صفراء",
    red: "بطاقات حمراء",
    extraTime: "وقت إضافي",
    fanPulse: "نبض المشجعين",
    dataQuality: "جودة البيانات",
    officialOdds: "أسعار رسمية",
    derivedPulse: "نبض مشتق من النتيجة",
    replaySnapshot: "لقطة سوق الإعادة",
    next: "الإشارة التالية",
    scoreChallenge: "تحدي نتيجة المشجع",
    testPoints: "نقاط اختبار",
    pointsNote: "محلية فقط. بلا قيمة نقدية أو مراهنة.",
    yourScore: "نتيجتك",
    lockPick: "تثبيت النتيجة · 50 نقطة",
    locked: "مثبتة",
    pointsNeeded: "النقاط غير كافية",
    settle: "تسوية من النتيجة النهائية",
    waitingSettlement: "تتوفر بعد ظهور نتيجة نهائية موثقة.",
    exact: "نتيجة دقيقة",
    result: "النتيجة",
    noBetting: "لعبة نقاش فقط، وليست مراهنة أو إشارة تداول.",
    replayLibrary: "مكتبة الإعادة",
    chooseReplay: "افتح قصة مباراة ثابتة قابلة للتكرار",
    teams: "الفرق واللاعبون",
    players: "اللاعبون الأساسيون",
    coach: "المدرب",
    watch: "مشاهدة / إعادة",
    officialWatch: "فتح المصدر الرسمي",
    noWatch: "لا يوجد مصدر فيديو مصرح به. الخط الزمني متاح.",
    settings: "الإعدادات",
    close: "إغلاق",
    language: "اللغة",
    dataConnection: "اتصال البيانات المباشرة",
    authDescription: "توجد المصادقة هنا للحفاظ على واجهة المشجع بسيطة.",
    openHelper: "فتح مساعد TxLINE",
    localOnly: "ملف .env.local المحلي فقط",
    advancedHidden: "اتصال متقدم",
    connectionReady: "المصدر الموثق جاهز",
    connectionFallback: "إعادة / مصدر عام بديل",
    refreshData: "تحديث المصدر الموثق",
    languageNote: "تترجم العناوين، بينما تبقى أسماء الفرق واللاعبين من المصدر.",
    dataRules: "قواعد البيانات",
    onlyVerified: "البيانات الموثقة فقط تظهر كمباشرة.",
  },
};

const languages: Array<{ code: Language; label: string; region: string }> = [
  { code: "en", label: "English", region: "Global" },
  { code: "zh", label: "中文", region: "China" },
  { code: "es", label: "Español", region: "Argentina / Spain / LatAm" },
  { code: "pt", label: "Português", region: "Brazil / Portugal" },
  { code: "fr", label: "Français", region: "France / Francophone" },
  { code: "de", label: "Deutsch", region: "Germany / Austria" },
  { code: "ja", label: "日本語", region: "Japan" },
  { code: "ar", label: "العربية", region: "Jordan / Algeria / MENA" },
];

const replayDurationMs = 46_000;
const replaySpeeds = [0.5, 1, 2, 4] as const;
const pointsPerPick = 50;

function detectLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const stored = window.localStorage.getItem("wclp-language") as Language | null;
  if (stored && languages.some((option) => option.code === stored)) return stored;
  const browser = navigator.language.toLowerCase();
  return languages.find((option) => browser.startsWith(option.code))?.code ?? "en";
}

function readPoints() {
  if (typeof window === "undefined") return 1000;
  const stored = Number(window.localStorage.getItem("wclp-test-points"));
  return Number.isFinite(stored) && stored >= 0 ? Math.round(stored) : 1000;
}

function sourceMeta(source: DataSourceState | null, mode: MatchMode, match: MatchData | null, copy: UiCopy) {
  if (mode === "replay" || source?.kind === "replay") {
    return { label: copy.replay, detail: copy.replayFeed, tone: "replay" };
  }
  if (source?.kind === "live-ready") {
    const isDelayed = match?.dataStatus === "Delay";
    return {
      label: isDelayed ? copy.delayed : copy.live,
      detail: source.message.includes("ESPN") ? copy.publicFeed : copy.officialFeed,
      tone: isDelayed ? "delay" : "live",
    };
  }
  if (source?.kind === "needs-token") {
    return { label: copy.fallback, detail: copy.noLiveFeed, tone: "fallback" };
  }
  return { label: copy.fallback, detail: copy.replayFeed, tone: "fallback" };
}

function eventLabel(event: MatchEvent, copy: UiCopy) {
  if (event.type === "goal") return copy.goals;
  if (event.type === "yellow_card") return copy.yellow;
  if (event.type === "red_card") return copy.red;
  if (event.type === "fulltime") return copy.final;
  if (event.type === "halftime") return "HT";
  if (event.type === "substitution") return "SUB";
  if (event.type === "odds_shift") return copy.fanPulse;
  return "INFO";
}

function minuteLabel(event: MatchEvent) {
  return `${event.minute}'${event.stoppage ? `+${event.stoppage}` : ""}`;
}

function formatCheckedAt(iso: string | undefined, language: Language) {
  if (!iso) return "--";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "--";
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : language, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function safeVideoUrl(raw: string | undefined) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function teamName(team: Team) {
  return team.name || team.code;
}

export default function MatchdayApp() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [mode, setMode] = useState<MatchMode>("live");
  const [view, setView] = useState<View>("match");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedReplayId, setSelectedReplayId] = useState(replayMatches[0].id);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [source, setSource] = useState<DataSourceState | null>(null);
  const [minute, setMinute] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<(typeof replaySpeeds)[number]>(1);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [points, setPoints] = useState(readPoints);
  const [pickHome, setPickHome] = useState(1);
  const [pickAway, setPickAway] = useState(1);
  const [pickLocked, setPickLocked] = useState(false);
  const [settlement, setSettlement] = useState<string | null>(null);

  const copy = ui[language];
  const helperUrl = `${import.meta.env.BASE_URL}tools/txline-subscribe/index.html?v=2026-07-10`;
  const videoUrl = safeVideoUrl(import.meta.env.VITE_AUTHORIZED_VIDEO_EMBED_URL);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("translate", "no");
    window.localStorage.setItem("wclp-language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("wclp-test-points", String(points));
  }, [points]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsRefreshing(true);
      setLoadError(null);
      try {
        const result = await loadMatchData(mode, {
          proxyBase: import.meta.env.VITE_TXLINE_PROXY_BASE || (import.meta.env.DEV ? "/__txline" : ""),
          asOfMs: import.meta.env.VITE_TXLINE_AS_OF_MS,
          competitionId: import.meta.env.VITE_TXLINE_COMPETITION_ID,
          fixtureId: import.meta.env.VITE_TXLINE_FIXTURE_ID,
          replayMatchId: selectedReplayId,
          startEpochDay: import.meta.env.VITE_TXLINE_START_EPOCH_DAY,
        });
        if (cancelled) return;
        setMatch(result.match);
        setSource(result.source);
        setMinute(mode === "replay" ? 1 : Math.max(1, result.match.events.at(-1)?.minute ?? 1));
        setPickLocked(false);
        setSettlement(null);
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Unknown data error");
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };
    void load();
    if (mode !== "live") return () => { cancelled = true; };
    const interval = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mode, refreshNonce, selectedReplayId]);

  const maxMinute = useMemo(() => {
    if (!match) return 90;
    return Math.max(90, ...match.events.map((event) => event.minute + (event.stoppage ?? 0)));
  }, [match]);

  useEffect(() => {
    if (mode !== "replay" || !isPlaying || !match) return;
    const tickMs = replayDurationMs / maxMinute / speed;
    const interval = window.setInterval(() => {
      setMinute((current) => {
        if (current >= maxMinute) {
          setIsPlaying(false);
          return maxMinute;
        }
        return current + 1;
      });
    }, tickMs);
    return () => window.clearInterval(interval);
  }, [isPlaying, maxMinute, match, mode, speed]);

  const frame = useMemo(() => (match ? buildPulseFrame(match, minute) : null), [match, minute]);
  const finalFrame = useMemo(() => (match ? buildPulseFrame(match, maxMinute) : null), [match, maxMinute]);

  if (!match || !frame) {
    return (
      <main className="matchday-app loading-screen">
        <div className="loading-card">
          <span className="brand-mark">W</span>
          <p className="overline">WORLD CUP LIVE PULSE</p>
          <h1>{loadError ? copy.fallback : copy.loading}</h1>
          {loadError ? <p className="error-copy">{loadError}</p> : <div className="loading-line" />}
        </div>
      </main>
    );
  }

  const sourceState = sourceMeta(source, mode, match, copy);
  const activeEvents = frame.activeEvents;
  const latestEvent = frame.latestEvent;
  const recentEvents = [...activeEvents].reverse().slice(0, 8);
  const goalCount = activeEvents.filter((event) => event.type === "goal").length;
  const yellowCount = activeEvents.filter((event) => event.type === "yellow_card").length;
  const redCount = activeEvents.filter((event) => event.type === "red_card").length;
  const extraTime = activeEvents.some((event) => event.minute > 90 || event.stoppage);
  const isFinal = match.status === "finished" || activeEvents.some((event) => event.type === "fulltime");
  const canSettle = pickLocked && isFinal && Boolean(finalFrame);
  const marketLabel = match.marketSource === "official-odds"
    ? copy.officialOdds
    : mode === "replay"
      ? copy.replaySnapshot
      : copy.derivedPulse;
  const statusText = match.status === "live" ? copy.liveNow : match.status === "finished" ? copy.final : copy.scheduled;

  function startLive() {
    setView("match");
    setMode("live");
    setIsPlaying(false);
  }

  function startReplay(id = selectedReplayId) {
    setView("match");
    setSelectedReplayId(id);
    setMode("replay");
    setMinute(1);
    setIsPlaying(true);
  }

  function lockPick() {
    if (pickLocked) return;
    if (points < pointsPerPick) {
      setSettlement(copy.pointsNeeded);
      return;
    }
    setPoints((current) => current - pointsPerPick);
    setPickLocked(true);
    setSettlement(null);
  }

  function settlePick() {
    if (!canSettle || !finalFrame) return;
    const home = finalFrame.homeScore;
    const away = finalFrame.awayScore;
    const exact = pickHome === home && pickAway === away;
    const predictedResult = pickHome === pickAway ? "draw" : pickHome > pickAway ? "home" : "away";
    const finalResult = home === away ? "draw" : home > away ? "home" : "away";
    const award = exact ? 250 : predictedResult === finalResult ? 100 : 0;
    setPoints((current) => current + award);
    setSettlement(exact ? `${copy.exact} +${award}` : `${copy.result} ${award ? `+${award}` : "+0"}`);
  }

  return (
    <main className="matchday-app">
      <aside className="left-rail">
        <div className="brand-lockup">
          <span className="brand-mark">W</span>
          <div>
            <strong>World Cup</strong>
            <span>Live Pulse</span>
          </div>
        </div>
        <p className="brand-kicker">{copy.brandKicker}</p>
        <nav className="primary-nav" aria-label="Primary navigation">
          <NavButton active={view === "match" && mode === "live"} onClick={startLive} label={copy.navLive} icon="LIVE" />
          <NavButton active={view === "match" && mode === "replay"} onClick={() => startReplay()} label={copy.navReplay} icon="RPL" />
          <NavButton active={view === "match"} onClick={() => setView("match")} label={copy.navMatch} icon="M" />
          <NavButton active={view === "teams"} onClick={() => setView("teams")} label={copy.navTeams} icon="T" />
        </nav>
        <div className="rail-footer">
          <button className="rail-settings" type="button" onClick={() => setSettingsOpen(true)}>
            <span className="nav-icon">SET</span>
            <span>{copy.navSettings}</span>
          </button>
          <div className="rail-proof">
            <span className={`status-dot ${sourceState.tone}`} />
            <span>{sourceState.label}</span>
          </div>
        </div>
      </aside>

      <section className="center-column">
        <header className="top-bar">
          <div>
            <p className="overline">{copy.matchCenter}</p>
            <h1>{teamName(match.home)} <span>vs</span> {teamName(match.away)}</h1>
          </div>
          <div className="top-actions">
            <span className={`source-pill ${sourceState.tone}`}><span className="status-dot" />{sourceState.label}</span>
            <button className="icon-button" type="button" onClick={() => setRefreshNonce((value) => value + 1)} aria-label={copy.refresh} title={copy.refresh}>
              {isRefreshing ? "..." : "↻"}
            </button>
            <button className="settings-button" type="button" onClick={() => setSettingsOpen(true)}>{copy.settings}</button>
          </div>
        </header>

        {view === "match" ? (
          <>
            <section className="score-hero" aria-label={copy.scorePulse}>
              <div className="hero-meta">
                <span className={`match-status ${match.status}`}>{statusText}</span>
                <span>{match.competition}</span>
                <span>{match.venue}</span>
              </div>
              <div className="score-line">
                <TeamSide team={match.home} score={frame.homeScore} />
                <div className="score-core">
                  <strong>{frame.homeScore} <i>:</i> {frame.awayScore}</strong>
                  <span>{minuteLabelForFrame(match, minute, isFinal, copy)}</span>
                </div>
                <TeamSide team={match.away} score={frame.awayScore} align="right" />
              </div>
              <div className="pulse-strip">
                <span>{copy.fanPulse} {Math.round(frame.market.sentiment)}/100</span>
                <div className="pulse-track"><span style={{ width: `${frame.market.sentiment}%` }} /></div>
                <span>{copy.next}: {frame.insight.nextBeat}</span>
              </div>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => setView("match")}>
                  {mode === "replay" ? (isPlaying ? "❚❚" : "▶") : copy.navMatch}
                </button>
                {mode === "replay" ? (
                  <>
                    <input className="timeline-slider" type="range" min="1" max={maxMinute} value={minute} onChange={(event) => { setIsPlaying(false); setMinute(Number(event.target.value)); }} aria-label={copy.scorePulse} />
                    <select className="speed-select" value={speed} onChange={(event) => setSpeed(Number(event.target.value) as (typeof replaySpeeds)[number])} aria-label="Replay speed">
                      {replaySpeeds.map((value) => <option key={value} value={value}>{value}x</option>)}
                    </select>
                  </>
                ) : null}
                <span className="freshness">{copy.verifiedAt} {formatCheckedAt(source?.checkedAtIso, language)}</span>
              </div>
            </section>

            <div className="signal-row" aria-label={copy.events}>
              <Signal label={copy.goals} value={goalCount} tone="goal" />
              <Signal label={copy.yellow} value={yellowCount} tone="yellow" />
              <Signal label={copy.red} value={redCount} tone="red" />
              <Signal label={copy.extraTime} value={extraTime ? "YES" : "--"} tone="neutral" />
              <div className="signal-next"><span>{copy.latest}</span><strong>{latestEvent ? `${minuteLabel(latestEvent)} ${latestEvent.title}` : copy.noEvents}</strong></div>
            </div>

            <section className="content-grid">
              <div className="feed-column">
                <section className="section-block">
                  <SectionHeading eyebrow={copy.events} title={`${activeEvents.length} ${copy.events.toLowerCase()}`} />
                  <div className="event-feed">
                    {recentEvents.length ? recentEvents.map((event) => <EventRow key={event.id} event={event} copy={copy} home={match.home} away={match.away} />) : <p className="empty-state">{copy.noEvents}</p>}
                  </div>
                </section>
                <section className="section-block pulse-detail">
                  <SectionHeading eyebrow={copy.scorePulse} title={marketLabel} />
                  <div className="pulse-metrics">
                    <Metric label={copy.fanPulse} value={`${Math.round(frame.market.sentiment)}/100`} />
                    <Metric label={copy.dataQuality} value={match.dataStatus ?? copy.seed} />
                    <Metric label={copy.next} value={frame.insight.nextBeat} />
                  </div>
                  <p className="muted-copy">{match.qualificationNote ?? copy.onlyVerified}</p>
                </section>
              </div>

              <aside className="right-content-column">
                <ScoreChallenge copy={copy} match={match} homeScore={pickHome} awayScore={pickAway} setHomeScore={setPickHome} setAwayScore={setPickAway} locked={pickLocked} points={points} settlement={settlement} onLock={lockPick} onSettle={settlePick} canSettle={canSettle} />
                <section className="side-block">
                  <SectionHeading eyebrow={copy.watch} title={videoUrl ? copy.officialWatch : copy.replay} />
                  {videoUrl ? <a className="watch-link" href={videoUrl} target="_blank" rel="noreferrer">{copy.officialWatch}<span>↗</span></a> : <p className="muted-copy">{copy.noWatch}</p>}
                  <div className="replay-progress"><span style={{ width: `${Math.min(100, (minute / maxMinute) * 100)}%` }} /></div>
                </section>
                <section className="side-block">
                  <SectionHeading eyebrow={copy.replayLibrary} title={copy.chooseReplay} />
                  <div className="replay-list">
                    {replayMatches.map((candidate) => <button className={`replay-item ${candidate.id === selectedReplayId && mode === "replay" ? "selected" : ""}`} type="button" key={candidate.id} onClick={() => startReplay(candidate.id)}><span>{candidate.home.code} <b>vs</b> {candidate.away.code}</span><small>{candidate.kickoffLabel}</small></button>)}
                  </div>
                </section>
              </aside>
            </section>
          </>
        ) : (
          <TeamsView copy={copy} match={match} />
        )}
      </section>

      <aside className="right-rail">
        <section className="balance-panel">
          <div className="balance-top"><span>{copy.testPoints}</span><span className="local-badge">LOCAL</span></div>
          <strong>{points.toLocaleString(language === "zh" ? "zh-CN" : language)} <small>pts</small></strong>
          <p>{copy.pointsNote}</p>
        </section>
        <section className="truth-panel">
          <div className="truth-heading"><span className={`status-dot ${sourceState.tone}`} /><strong>{copy.source}</strong></div>
          <strong className="truth-title">{sourceState.detail}</strong>
          <p>{source?.message ?? copy.onlyVerified}</p>
          <div className="truth-meta"><span>{copy.verifiedAt}</span><strong>{formatCheckedAt(source?.checkedAtIso, language)}</strong></div>
          <details>
            <summary>{copy.dataRules}</summary>
            <p>{copy.onlyVerified}</p>
            <p>{dataConsistencyState.rules[2]}</p>
          </details>
        </section>
        <section className="up-next-panel">
          <div className="panel-heading"><span>{copy.next}</span><span className="panel-count">{replayMatches.length}</span></div>
          <p>{copy.replayLibrary}</p>
          <button type="button" onClick={() => startReplay(replayMatches[0].id)}>{replayMatches[0].home.code} vs {replayMatches[0].away.code}<span>→</span></button>
          <button type="button" onClick={() => startReplay(replayMatches[1].id)}>{replayMatches[1].home.code} vs {replayMatches[1].away.code}<span>→</span></button>
        </section>
      </aside>

      {settingsOpen ? <SettingsDrawer copy={copy} language={language} setLanguage={setLanguage} helperUrl={helperUrl} source={source} onRefresh={() => setRefreshNonce((value) => value + 1)} onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}

function NavButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return <button className={`nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}><span className="nav-icon">{icon}</span><span>{label}</span></button>;
}

function TeamSide({ team, score, align = "left" }: { team: Team; score: number; align?: "left" | "right" }) {
  return <div className={`team-side ${align}`}><span className="team-code" style={{ backgroundColor: team.color }}>{team.code}</span><strong>{teamName(team)}</strong><small>{team.group ?? "World Cup"}</small><b>{score}</b></div>;
}

function Signal({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return <div className={`signal signal-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="pulse-metric"><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <header className="section-heading"><span>{eyebrow}</span><h2>{title}</h2></header>;
}

function EventRow({ event, copy, home, away }: { event: MatchEvent; copy: UiCopy; home: Team; away: Team }) {
  const team = event.team === home.code ? home : event.team === away.code ? away : undefined;
  return <article className={`event-row event-${event.type}`}><time>{minuteLabel(event)}</time><span className="event-mark">{event.type === "goal" ? "G" : event.type === "yellow_card" ? "Y" : event.type === "red_card" ? "R" : "·"}</span><div><strong>{eventLabel(event, copy)}{team ? ` · ${team.code}` : ""}</strong><p>{event.player ? `${event.player} — ` : ""}{event.description}</p></div><b>{event.homeScore}-{event.awayScore}</b></article>;
}

function ScoreChallenge({ copy, match, homeScore, awayScore, setHomeScore, setAwayScore, locked, points, settlement, onLock, onSettle, canSettle }: { copy: UiCopy; match: MatchData; homeScore: number; awayScore: number; setHomeScore: (value: number) => void; setAwayScore: (value: number) => void; locked: boolean; points: number; settlement: string | null; onLock: () => void; onSettle: () => void; canSettle: boolean }) {
  return <section className="challenge-block"><SectionHeading eyebrow={copy.scoreChallenge} title={`${match.home.code} vs ${match.away.code}`} /><div className="challenge-score"><ScoreInput label={match.home.code} value={homeScore} disabled={locked} onChange={setHomeScore} /><span>:</span><ScoreInput label={match.away.code} value={awayScore} disabled={locked} onChange={setAwayScore} /></div><p className="muted-copy">{copy.noBetting}</p><div className="challenge-actions">{locked ? <button className="primary-button" type="button" onClick={onSettle} disabled={!canSettle}>{canSettle ? copy.settle : copy.locked}</button> : <button className="primary-button" type="button" onClick={onLock} disabled={points < pointsPerPick}>{copy.lockPick}</button>}</div>{settlement ? <p className="challenge-result">{settlement}</p> : null}</section>;
}

function ScoreInput({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <label className="score-input"><span>{label}</span><input type="number" min="0" max="20" value={value} disabled={disabled} onChange={(event) => onChange(Math.max(0, Math.min(20, Number(event.target.value) || 0)))} /></label>;
}

function TeamsView({ copy, match }: { copy: UiCopy; match: MatchData }) {
  return <section className="teams-view"><SectionHeading eyebrow={copy.teams} title={`${teamName(match.home)} / ${teamName(match.away)}`} /><p className="muted-copy">{match.qualificationNote ?? copy.languageNote}</p><div className="team-grid"><TeamProfile copy={copy} team={match.home} /><TeamProfile copy={copy} team={match.away} /></div></section>;
}

function TeamProfile({ copy, team }: { copy: UiCopy; team: Team }) {
  return <article className="team-profile-card"><div className="profile-top"><span className="team-code" style={{ backgroundColor: team.color }}>{team.code}</span><div><h2>{teamName(team)}</h2><span>{team.group ?? "World Cup"}</span></div></div><dl><div><dt>{copy.coach}</dt><dd>{team.coach ?? "--"}</dd></div><div><dt>{copy.dataQuality}</dt><dd>{team.record ?? "Source profile"}</dd></div></dl><details open><summary>{copy.players}</summary><div className="player-stack">{(team.keyPlayers ?? []).map((player) => <div key={player.name}><strong>{player.name}</strong><span>{player.position} / {player.role}</span><p>{player.note}</p></div>)}</div></details></article>;
}

function SettingsDrawer({ copy, language, setLanguage, helperUrl, source, onRefresh, onClose }: { copy: UiCopy; language: Language; setLanguage: (language: Language) => void; helperUrl: string; source: DataSourceState | null; onRefresh: () => void; onClose: () => void }) {
  const ready = source?.kind === "live-ready";
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="settings-drawer" aria-label={copy.settings}><header><div><p className="overline">WORLD CUP LIVE PULSE</p><h2>{copy.settings}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label={copy.close}>×</button></header><section className="drawer-section"><label htmlFor="language-select">{copy.language}</label><select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languages.map((option) => <option key={option.code} value={option.code}>{option.label} · {option.region}</option>)}</select><p className="muted-copy">{copy.languageNote}</p></section><details className="drawer-section" open><summary>{copy.dataConnection}</summary><p className="muted-copy">{copy.authDescription}</p><div className={`connection-status ${ready ? "ready" : "fallback"}`}><span className="status-dot" /><strong>{ready ? copy.connectionReady : copy.connectionFallback}</strong><small>{copy.localOnly}</small></div><div className="drawer-actions"><button className="primary-button" type="button" onClick={onRefresh}>{copy.refreshData}</button><a className="secondary-button" href={helperUrl} target="_blank" rel="noreferrer">{copy.openHelper}</a></div><p className="security-note">TxLINE token, JWT and wallet signatures are never rendered in the main interface or committed to GitHub Pages.</p></details><details className="drawer-section"><summary>{copy.advancedHidden}</summary><p className="muted-copy">{copy.onlyVerified}</p><p className="muted-copy">{dataConsistencyState.message}</p></details></aside></div>;
}

function minuteLabelForFrame(match: MatchData, minute: number, isFinal: boolean, copy: UiCopy) {
  if (isFinal) return copy.final;
  if (match.status === "scheduled") return copy.scheduled;
  return `${minute}'`;
}
