import { useEffect, useMemo, useRef, useState } from "react";
import { dataConsistencyState } from "./data/matchCalendar";
import { teamAtlas } from "./data/fanGuide";
import { replayMatches } from "./data/replayMatch";
import { demoSeasonHistory, demoSeasonSummary } from "./data/demoSeasonHistory";
import { officialVideoSources } from "./data/videoSources";
import { tournamentCopy } from "./data/tournamentCopy";
import { localizeTeamName } from "./data/teamNames";
import { txlineArchiveMatches } from "./data/txlineArchive";
import { canLockScorePick, emptyChallengeStats, getFanLevel, settleScorePick, updateChallengeStats } from "./lib/challenge";
import type { ChallengeStats } from "./lib/challenge";
import { buildPulseFrame } from "./lib/pulse";
import { downloadPredictionCard } from "./lib/shareCard";
import { loadMatchData } from "./lib/txlineAdapter";
import { localizeCommentary, localizeEventDescription, localizeInsight } from "./lib/localizedPulse";
import type { DataSourceState, MatchData, MatchEvent, MatchMode, MatchScheduleItem, Team } from "./types";

type Language = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";
type View = "match" | "tournament" | "teams";

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
  summary: string;
  aiCommentary: string;
  schedule: string;
  advancement: string;
  scoreChallenge: string;
  testPoints: string;
  pointsNote: string;
  currentPoints: string;
  pickCost: string;
  settlementRule: string;
  streak: string;
  bestStreak: string;
  accuracy: string;
  fanLevel: string;
  nextLevel: string;
  levelNames: [string, string, string, string];
  downloadPick: string;
  listenCommentary: string;
  stopCommentary: string;
  pickClosed: string;
  alreadySettled: string;
  resetPoints: string;
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
  sourceTeams: string;
  referenceTeams: string;
  teamPending: string;
  coach: string;
  watch: string;
  officialWatch: string;
  archiveLink: string;
  highlightsLink: string;
  noWatch: string;
  settings: string;
  close: string;
  language: string;
  dataConnection: string;
  authDescription: string;
  securityNote: string;
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
    navReplay: "Schedule & replay",
    navTeams: "Teams",
    navSettings: "Settings",
    source: "Match status",
    refresh: "Refresh",
    loading: "Loading verified match data",
    live: "Live",
    delayed: "Delayed",
    replay: "Replay",
    seed: "Upcoming",
    fallback: "Fallback",
    verifiedAt: "Checked",
    officialFeed: "Official match data",
    publicFeed: "Public scoreboard",
    replayFeed: "Verified 2026 match replay",
    noLiveFeed: "No match is live right now",
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
    fanPulse: "Match momentum",
    dataQuality: "Status",
    officialOdds: "Official odds snapshot",
    derivedPulse: "Match momentum",
    replaySnapshot: "Post-match momentum",
    next: "Coming up",
    summary: "Match summary",
    aiCommentary: "AI match brief",
    schedule: "Schedule",
    advancement: "Stage and progression",
    scoreChallenge: "Score challenge",
    testPoints: "Challenge points",
    pointsNote: "Local-only points. No cash value, wallet, or betting.",
    currentPoints: "Current points",
    pickCost: "Pick cost",
    settlementRule: "Settles from the verified final score",
    streak: "Streak",
    bestStreak: "Best",
    accuracy: "Accuracy",
    fanLevel: "Fan level",
    nextLevel: "Next level",
    levelNames: ["Rookie", "Regular", "Analyst", "Superfan"],
    downloadPick: "Download pick card",
    listenCommentary: "Listen",
    stopCommentary: "Stop",
    pickClosed: "Challenge closed",
    alreadySettled: "Settled",
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
    sourceTeams: "Tournament teams",
    referenceTeams: "More team profiles",
    teamPending: "Player details updating",
    coach: "Coach",
    watch: "Watch / replay",
    officialWatch: "Open official source",
    archiveLink: "FIFA+ archive",
    highlightsLink: "FIFA+ highlights",
    noWatch: "Official FIFA+ archive and highlights are available when rights allow; timeline replay remains available.",
    resetPoints: "Reset local points",
    settings: "Settings",
    close: "Close",
    language: "Language",
    dataConnection: "Match data",
    authDescription: "Refresh the match or view its connection status here.",
    securityNote: "TxLINE token, JWT and wallet signatures stay local and are never rendered in the main interface or committed to GitHub Pages.",
    openHelper: "Open TxLINE activation helper",
    localOnly: "Local .env.local only",
    advancedHidden: "Technical information",
    connectionReady: "Match data is up to date",
    connectionFallback: "Showing verified replay data",
    refreshData: "Refresh match",
    languageNote: "UI labels are translated; team and player names remain source-of-truth names.",
    dataRules: "About this data",
    onlyVerified: "Only confirmed scores and events are shown.",
  },
  zh: {
    brandKicker: "以球迷为先的比赛情报",
    navMatch: "比赛中心",
    navLive: "实时比赛",
    navReplay: "赛程与回放",
    navTeams: "球队与球员",
    navSettings: "设置",
    source: "比赛状态",
    refresh: "刷新",
    loading: "正在加载已核验比赛数据",
    live: "实时",
    delayed: "延迟",
    replay: "回放",
    seed: "未开赛",
    fallback: "兜底",
    verifiedAt: "核验时间",
    officialFeed: "官方比赛数据",
    publicFeed: "公开比分源",
    replayFeed: "2026 已确认比赛回放",
    noLiveFeed: "当前没有正在进行的比赛",
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
    fanPulse: "比赛热度",
    dataQuality: "状态",
    officialOdds: "官方赔率快照",
    derivedPulse: "比赛走势",
    replaySnapshot: "赛后走势",
    next: "接下来",
    summary: "比赛摘要",
    aiCommentary: "AI 比赛解读",
    schedule: "赛程",
    advancement: "阶段与晋级",
    scoreChallenge: "比分挑战",
    testPoints: "挑战积分",
    pointsNote: "仅本地积分，无现金价值，不连接钱包，不是下注。",
    currentPoints: "当前积分",
    pickCost: "本次消耗",
    settlementRule: "按核验后的最终比分结算",
    streak: "连胜",
    bestStreak: "最佳",
    accuracy: "命中率",
    fanLevel: "球迷等级",
    nextLevel: "距离升级",
    levelNames: ["新秀", "常客", "分析师", "超级球迷"],
    downloadPick: "下载预测卡",
    listenCommentary: "听解说",
    stopCommentary: "停止播放",
    pickClosed: "挑战已关闭",
    alreadySettled: "已结算",
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
    sourceTeams: "参赛球队",
    referenceTeams: "更多球队资料",
    teamPending: "球员资料更新中",
    coach: "教练",
    watch: "观看 / 回放",
    officialWatch: "打开官方来源",
    archiveLink: "FIFA+ 回放库",
    highlightsLink: "FIFA+ 集锦",
    noWatch: "官方 FIFA+ 回放和集锦入口会受地区与版权影响；时间线回放始终可用。",
    resetPoints: "重置本地积分",
    settings: "设置",
    close: "关闭",
    language: "语言",
    dataConnection: "比赛数据",
    authDescription: "在这里更新比赛，或查看数据是否已更新。",
    securityNote: "TxLINE token、JWT 和钱包签名只保留在本地，不会显示在主界面，也不会提交到 GitHub Pages。",
    openHelper: "打开 TxLINE 激活助手",
    localOnly: "仅限本地 .env.local",
    advancedHidden: "技术信息",
    connectionReady: "比赛数据已更新",
    connectionFallback: "正在显示已确认回放",
    refreshData: "更新比赛",
    languageNote: "界面标签会翻译；球队和球员名称保持数据源原名。",
    dataRules: "数据说明",
    onlyVerified: "只显示已确认的比分、事件和赛程。",
  },
  es: {
    brandKicker: "Inteligencia de partido para fans",
    navMatch: "Centro del partido",
    navLive: "En vivo",
    navReplay: "Calendario y repetición",
    navTeams: "Equipos",
    navSettings: "Ajustes",
    source: "Estado del partido",
    refresh: "Actualizar",
    loading: "Cargando datos verificados",
    live: "En vivo",
    delayed: "Retrasado",
    replay: "Repetición",
    seed: "Calendario",
    fallback: "Respaldo",
    verifiedAt: "Revisado",
    officialFeed: "Datos oficiales del partido",
    publicFeed: "Marcador público",
    replayFeed: "Repetición verificada de 2026",
    noLiveFeed: "No hay un partido en directo ahora",
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
    fanPulse: "Ritmo del partido",
    dataQuality: "Estado",
    officialOdds: "Cuotas oficiales",
    derivedPulse: "Ritmo del partido",
    replaySnapshot: "Ritmo final",
    next: "A continuación",
    summary: "Resumen del partido",
    aiCommentary: "Resumen del partido con IA",
    schedule: "Calendario",
    advancement: "Fase y clasificación",
    scoreChallenge: "Reto de marcador",
    testPoints: "Puntos del reto",
    pointsNote: "Solo local. Sin valor monetario ni apuestas.",
    currentPoints: "Puntos actuales",
    pickCost: "Coste de la jugada",
    settlementRule: "Se resuelve con el marcador final verificado",
    streak: "Racha",
    bestStreak: "Mejor",
    accuracy: "Acierto",
    fanLevel: "Nivel de fan",
    nextLevel: "Siguiente nivel",
    levelNames: ["Novato", "Habitual", "Analista", "Superfan"],
    downloadPick: "Descargar tarjeta",
    listenCommentary: "Escuchar",
    stopCommentary: "Detener",
    pickClosed: "Reto cerrado",
    alreadySettled: "Resuelto",
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
    sourceTeams: "Equipos del torneo",
    referenceTeams: "Más equipos",
    teamPending: "Actualizando jugadores",
    coach: "Entrenador",
    watch: "Ver / repetir",
    officialWatch: "Abrir fuente oficial",
    archiveLink: "Archivo FIFA+",
    highlightsLink: "Resúmenes FIFA+",
    noWatch: "El archivo y los resúmenes oficiales de FIFA+ dependen de territorio y derechos; la línea de tiempo sigue disponible.",
    resetPoints: "Restablecer puntos locales",
    settings: "Ajustes",
    close: "Cerrar",
    language: "Idioma",
    dataConnection: "Datos del partido",
    authDescription: "Actualiza el partido o revisa aquí su estado.",
    securityNote: "El token de TxLINE, el JWT y las firmas de la cartera permanecen locales y nunca se muestran ni se publican.",
    openHelper: "Abrir asistente de TxLINE",
    localOnly: "Solo .env.local",
    advancedHidden: "Información técnica",
    connectionReady: "Datos actualizados",
    connectionFallback: "Mostrando repetición verificada",
    refreshData: "Actualizar partido",
    languageNote: "Las etiquetas se traducen; nombres de equipos y jugadores siguen la fuente.",
    dataRules: "Sobre estos datos",
    onlyVerified: "Solo se muestran marcadores y eventos confirmados.",
  },
  pt: {
    brandKicker: "Inteligência de jogo para torcedores",
    navMatch: "Central da partida",
    navLive: "Ao vivo",
    navReplay: "Calendrier et reprise",
    navTeams: "Times",
    navSettings: "Configurações",
    source: "Estado do jogo",
    refresh: "Atualizar",
    loading: "Carregando dados verificados",
    live: "Ao vivo",
    delayed: "Atrasado",
    replay: "Reprise",
    seed: "Calendário",
    fallback: "Reserva",
    verifiedAt: "Verificado",
    officialFeed: "Dados oficiais do jogo",
    publicFeed: "Placar público",
    replayFeed: "Replay verificado de 2026",
    noLiveFeed: "Nenhum jogo ao vivo agora",
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
    fanPulse: "Ritmo do jogo",
    dataQuality: "Estado",
    officialOdds: "Odds oficiais",
    derivedPulse: "Ritmo do jogo",
    replaySnapshot: "Ritmo final",
    next: "A seguir",
    summary: "Resumo da partida",
    aiCommentary: "Resumo da partida com IA",
    schedule: "Calendário",
    advancement: "Fase e classificação",
    scoreChallenge: "Desafio de placar",
    testPoints: "Pontos do desafio",
    pointsNote: "Somente local. Sem valor em dinheiro ou apostas.",
    currentPoints: "Pontos atuais",
    pickCost: "Custo da escolha",
    settlementRule: "Resolvido pelo placar final verificado",
    streak: "Sequência",
    bestStreak: "Melhor",
    accuracy: "Acerto",
    fanLevel: "Nível do fã",
    nextLevel: "Próximo nível",
    levelNames: ["Novato", "Frequente", "Analista", "Superfã"],
    downloadPick: "Baixar cartão",
    listenCommentary: "Ouvir",
    stopCommentary: "Parar",
    pickClosed: "Desafio encerrado",
    alreadySettled: "Resolvido",
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
    sourceTeams: "Equipes do torneio",
    referenceTeams: "Mais equipes",
    teamPending: "Atualizando jogadores",
    coach: "Técnico",
    watch: "Assistir / reprise",
    officialWatch: "Abrir fonte oficial",
    archiveLink: "Arquivo FIFA+",
    highlightsLink: "Destaques FIFA+",
    noWatch: "O arquivo e os destaques oficiais do FIFA+ dependem do território e dos direitos; a linha do tempo continua disponível.",
    resetPoints: "Redefinir pontos locais",
    settings: "Configurações",
    close: "Fechar",
    language: "Idioma",
    dataConnection: "Dados do jogo",
    authDescription: "Atualize o jogo ou confira aqui o estado dos dados.",
    securityNote: "O token TxLINE, o JWT e as assinaturas da carteira ficam locais e nunca são exibidos nem publicados.",
    openHelper: "Abrir assistente TxLINE",
    localOnly: "Somente .env.local",
    advancedHidden: "Informações técnicas",
    connectionReady: "Dados atualizados",
    connectionFallback: "Exibindo replay verificado",
    refreshData: "Atualizar jogo",
    languageNote: "Os rótulos são traduzidos; nomes seguem a fonte original.",
    dataRules: "Sobre estes dados",
    onlyVerified: "Apenas placares e eventos confirmados são exibidos.",
  },
  fr: {
    brandKicker: "Intelligence de match pour les fans",
    navMatch: "Centre du match",
    navLive: "En direct",
    navReplay: "Spielplan und Replay",
    navTeams: "Équipes",
    navSettings: "Réglages",
    source: "État du match",
    refresh: "Actualiser",
    loading: "Chargement des données vérifiées",
    live: "Direct",
    delayed: "Retardé",
    replay: "Replay",
    seed: "Calendrier",
    fallback: "Secours",
    verifiedAt: "Vérifié",
    officialFeed: "Données officielles du match",
    publicFeed: "Score public",
    replayFeed: "Replay 2026 vérifié",
    noLiveFeed: "Aucun match en direct maintenant",
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
    fanPulse: "Rythme du match",
    dataQuality: "État",
    officialOdds: "Cotes officielles",
    derivedPulse: "Rythme du match",
    replaySnapshot: "Rythme final",
    next: "À suivre",
    summary: "Résumé du match",
    aiCommentary: "Résumé du match par IA",
    schedule: "Calendrier",
    advancement: "Phase et qualification",
    scoreChallenge: "Défi de score",
    testPoints: "Points du défi",
    pointsNote: "Local uniquement. Sans valeur monétaire ni pari.",
    currentPoints: "Points actuels",
    pickCost: "Coût du choix",
    settlementRule: "Réglé selon le score final vérifié",
    streak: "Série",
    bestStreak: "Record",
    accuracy: "Précision",
    fanLevel: "Niveau supporter",
    nextLevel: "Niveau suivant",
    levelNames: ["Débutant", "Habitué", "Analyste", "Superfan"],
    downloadPick: "Télécharger la carte",
    listenCommentary: "Écouter",
    stopCommentary: "Arrêter",
    pickClosed: "Défi fermé",
    alreadySettled: "Réglé",
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
    sourceTeams: "Équipes du tournoi",
    referenceTeams: "Plus d'équipes",
    teamPending: "Mise à jour des joueurs",
    coach: "Entraîneur",
    watch: "Regarder / replay",
    officialWatch: "Ouvrir la source officielle",
    archiveLink: "Archives FIFA+",
    highlightsLink: "Temps forts FIFA+",
    noWatch: "Les archives et temps forts officiels de FIFA+ dépendent du territoire et des droits; la timeline reste disponible.",
    resetPoints: "Réinitialiser les points locaux",
    settings: "Réglages",
    close: "Fermer",
    language: "Langue",
    dataConnection: "Données du match",
    authDescription: "Actualisez le match ou vérifiez son état ici.",
    securityNote: "Le token TxLINE, le JWT et les signatures du portefeuille restent locaux et ne sont jamais affichés ni publiés.",
    openHelper: "Ouvrir l’assistant TxLINE",
    localOnly: "Local .env.local uniquement",
    advancedHidden: "Informations techniques",
    connectionReady: "Données à jour",
    connectionFallback: "Replay vérifié affiché",
    refreshData: "Actualiser le match",
    languageNote: "Les libellés sont traduits; les noms suivent la source.",
    dataRules: "À propos des données",
    onlyVerified: "Seuls les scores et événements confirmés sont affichés.",
  },
  de: {
    brandKicker: "Spieldaten für Fans",
    navMatch: "Spielzentrum",
    navLive: "Live",
    navReplay: "Spielplan & Wiederholung",
    navTeams: "Teams",
    navSettings: "Einstellungen",
    source: "Spielstatus",
    refresh: "Aktualisieren",
    loading: "Verifizierte Spieldaten werden geladen",
    live: "Live",
    delayed: "Verzögert",
    replay: "Wiederholung",
    seed: "Spielplan",
    fallback: "Ersatz",
    verifiedAt: "Geprüft",
    officialFeed: "Offizielle Spieldaten",
    publicFeed: "Öffentliche Anzeige",
    replayFeed: "Verifiziertes Replay 2026",
    noLiveFeed: "Aktuell läuft kein Spiel",
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
    fanPulse: "Spieldynamik",
    dataQuality: "Status",
    officialOdds: "Offizielle Quoten",
    derivedPulse: "Spieldynamik",
    replaySnapshot: "Dynamik nach Abpfiff",
    next: "Als Nächstes",
    summary: "Spielzusammenfassung",
    aiCommentary: "KI-Spielanalyse",
    schedule: "Spielplan",
    advancement: "Phase und Weiterkommen",
    scoreChallenge: "Tippspiel für Fans",
    testPoints: "Challenge-Punkte",
    pointsNote: "Nur lokal. Kein Geldwert und keine Wette.",
    currentPoints: "Aktuelle Punkte",
    pickCost: "Tippkosten",
    settlementRule: "Auswertung nach verifiziertem Endstand",
    streak: "Serie",
    bestStreak: "Bestwert",
    accuracy: "Trefferquote",
    fanLevel: "Fan-Level",
    nextLevel: "Nächste Stufe",
    levelNames: ["Neuling", "Stammfan", "Analyst", "Superfan"],
    downloadPick: "Tippkarte laden",
    listenCommentary: "Anhören",
    stopCommentary: "Stoppen",
    pickClosed: "Challenge geschlossen",
    alreadySettled: "Ausgewertet",
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
    sourceTeams: "Turnierteams",
    referenceTeams: "Weitere Teams",
    teamPending: "Spielerdaten werden aktualisiert",
    coach: "Trainer",
    watch: "Ansehen / Replay",
    officialWatch: "Offizielle Quelle öffnen",
    archiveLink: "FIFA+ Archiv",
    highlightsLink: "FIFA+ Highlights",
    noWatch: "Offizielle FIFA+ Archive und Highlights hängen von Gebiet und Rechten ab; die Timeline bleibt verfügbar.",
    resetPoints: "Lokale Punkte zurücksetzen",
    settings: "Einstellungen",
    close: "Schließen",
    language: "Sprache",
    dataConnection: "Spieldaten",
    authDescription: "Spiel aktualisieren oder Datenstatus prüfen.",
    securityNote: "TxLINE-Token, JWT und Wallet-Signaturen bleiben lokal und werden weder angezeigt noch veröffentlicht.",
    openHelper: "TxLINE-Assistent öffnen",
    localOnly: "Nur lokales .env.local",
    advancedHidden: "Technische Informationen",
    connectionReady: "Spieldaten sind aktuell",
    connectionFallback: "Verifiziertes Replay wird gezeigt",
    refreshData: "Spiel aktualisieren",
    languageNote: "Labels werden übersetzt; Namen folgen der Quelle.",
    dataRules: "Über diese Daten",
    onlyVerified: "Nur bestätigte Spielstände und Ereignisse werden gezeigt.",
  },
  ja: {
    brandKicker: "ファン向け試合インテリジェンス",
    navMatch: "試合センター",
    navLive: "ライブ",
    navReplay: "日程とリプレイ",
    navTeams: "チーム",
    navSettings: "設定",
    source: "試合状況",
    refresh: "更新",
    loading: "検証済みデータを読み込み中",
    live: "ライブ",
    delayed: "遅延",
    replay: "リプレイ",
    seed: "予定",
    fallback: "フォールバック",
    verifiedAt: "確認",
    officialFeed: "公式試合データ",
    publicFeed: "公開スコア",
    replayFeed: "確認済み2026年リプレイ",
    noLiveFeed: "現在ライブ中の試合はありません",
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
    fanPulse: "試合の流れ",
    dataQuality: "状況",
    officialOdds: "公式オッズ",
    derivedPulse: "試合の流れ",
    replaySnapshot: "試合後の流れ",
    next: "次に見る",
    summary: "試合概要",
    aiCommentary: "AI試合解説",
    schedule: "日程",
    advancement: "ステージと進出",
    scoreChallenge: "ファンスコアチャレンジ",
    testPoints: "チャレンジポイント",
    pointsNote: "ローカル専用。金銭価値・賭けなし。",
    currentPoints: "現在のポイント",
    pickCost: "予想コスト",
    settlementRule: "検証済みの最終スコアで判定",
    streak: "連勝",
    bestStreak: "最高",
    accuracy: "的中率",
    fanLevel: "ファンレベル",
    nextLevel: "次のレベル",
    levelNames: ["ルーキー", "レギュラー", "アナリスト", "スーパーファン"],
    downloadPick: "予想カード保存",
    listenCommentary: "解説を聞く",
    stopCommentary: "停止",
    pickClosed: "チャレンジ終了",
    alreadySettled: "判定済み",
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
    sourceTeams: "大会参加チーム",
    referenceTeams: "その他のチーム",
    teamPending: "選手情報を更新中",
    coach: "監督",
    watch: "視聴 / リプレイ",
    officialWatch: "公式ソースを開く",
    archiveLink: "FIFA+ アーカイブ",
    highlightsLink: "FIFA+ ハイライト",
    noWatch: "FIFA+公式アーカイブとハイライトは地域・権利により異なります。タイムラインは利用できます。",
    resetPoints: "ローカルポイントをリセット",
    settings: "設定",
    close: "閉じる",
    language: "言語",
    dataConnection: "試合データ",
    authDescription: "試合の更新とデータ状況を確認できます。",
    securityNote: "TxLINEトークン、JWT、ウォレット署名はローカルに保持し、画面表示や公開ビルドへの混入を防ぎます。",
    openHelper: "TxLINE ヘルパーを開く",
    localOnly: "ローカル .env.local のみ",
    advancedHidden: "技術情報",
    connectionReady: "試合データは最新です",
    connectionFallback: "確認済みリプレイを表示中",
    refreshData: "試合を更新",
    languageNote: "UIラベルは翻訳し、チーム名・選手名はソース名を維持します。",
    dataRules: "データについて",
    onlyVerified: "確認済みのスコアとイベントだけを表示します。",
  },
  ar: {
    brandKicker: "ذكاء المباراة للمشجعين",
    navMatch: "مركز المباراة",
    navLive: "مباشر",
    navReplay: "الجدول والإعادة",
    navTeams: "الفرق",
    navSettings: "الإعدادات",
    source: "حالة المباراة",
    refresh: "تحديث",
    loading: "جار تحميل البيانات الموثقة",
    live: "مباشر",
    delayed: "متأخر",
    replay: "إعادة",
    seed: "الجدول",
    fallback: "بديل",
    verifiedAt: "تم التحقق",
    officialFeed: "بيانات المباراة الرسمية",
    publicFeed: "نتيجة عامة",
    replayFeed: "إعادة موثقة لعام 2026",
    noLiveFeed: "لا توجد مباراة مباشرة الآن",
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
    fanPulse: "إيقاع المباراة",
    dataQuality: "الحالة",
    officialOdds: "أسعار رسمية",
    derivedPulse: "إيقاع المباراة",
    replaySnapshot: "إيقاع ما بعد المباراة",
    next: "التالي",
    summary: "ملخص المباراة",
    aiCommentary: "ملخص المباراة بالذكاء الاصطناعي",
    schedule: "الجدول",
    advancement: "المرحلة والتأهل",
    scoreChallenge: "تحدي نتيجة المشجع",
    testPoints: "نقاط التحدي",
    pointsNote: "محلية فقط. بلا قيمة نقدية أو مراهنة.",
    currentPoints: "النقاط الحالية",
    pickCost: "تكلفة الاختيار",
    settlementRule: "تُحسم بالنتيجة النهائية الموثقة",
    streak: "سلسلة",
    bestStreak: "الأفضل",
    accuracy: "الدقة",
    fanLevel: "مستوى المشجع",
    nextLevel: "المستوى التالي",
    levelNames: ["مبتدئ", "متابع", "محلل", "مشجع خارق"],
    downloadPick: "تنزيل بطاقة التوقع",
    listenCommentary: "استماع",
    stopCommentary: "إيقاف",
    pickClosed: "التحدي مغلق",
    alreadySettled: "تمت التسوية",
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
    sourceTeams: "فرق البطولة",
    referenceTeams: "المزيد من الفرق",
    teamPending: "جار تحديث بيانات اللاعبين",
    coach: "المدرب",
    watch: "مشاهدة / إعادة",
    officialWatch: "فتح المصدر الرسمي",
    archiveLink: "أرشيف FIFA+",
    highlightsLink: "ملخصات FIFA+",
    noWatch: "يتوفر أرشيف وملخصات FIFA+ الرسمية حسب المنطقة والحقوق؛ الخط الزمني متاح دائمًا.",
    resetPoints: "إعادة ضبط النقاط المحلية",
    settings: "الإعدادات",
    close: "إغلاق",
    language: "اللغة",
    dataConnection: "بيانات المباراة",
    authDescription: "حدّث المباراة أو تحقق من حالة البيانات هنا.",
    securityNote: "يبقى رمز TxLINE وJWT وتواقيع المحفظة محلية ولا تُعرض أو تُنشر أبدًا.",
    openHelper: "فتح مساعد TxLINE",
    localOnly: "ملف .env.local المحلي فقط",
    advancedHidden: "معلومات تقنية",
    connectionReady: "بيانات المباراة محدثة",
    connectionFallback: "عرض إعادة موثقة",
    refreshData: "تحديث المباراة",
    languageNote: "تترجم العناوين، بينما تبقى أسماء الفرق واللاعبين من المصدر.",
    dataRules: "حول هذه البيانات",
    onlyVerified: "تظهر النتائج والأحداث المؤكدة فقط.",
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

const seasonDemoCopy: Record<Language, { title: string; note: string; myHistory: string; matches: string; correct: string; exact: string }> = {
  en: { title: "Demo season", note: "Sample picks over verified 2026 match results. This does not affect your points.", myHistory: "My challenge history", matches: "matches", correct: "correct", exact: "exact" },
  zh: { title: "赛季演示", note: "预测为演示，赛果来自 2026 已确认比赛，不影响你的积分。", myHistory: "我的挑战记录", matches: "场", correct: "命中", exact: "精确比分" },
  es: { title: "Temporada demo", note: "Pronósticos de ejemplo sobre resultados confirmados de 2026. No afectan tus puntos.", myHistory: "Mi historial", matches: "partidos", correct: "aciertos", exact: "exactos" },
  pt: { title: "Temporada demo", note: "Palpites de exemplo sobre resultados confirmados de 2026. Não alteram seus pontos.", myHistory: "Meu histórico", matches: "jogos", correct: "acertos", exact: "exatos" },
  fr: { title: "Saison démo", note: "Pronostics d'exemple sur des résultats confirmés de 2026. Sans effet sur vos points.", myHistory: "Mon historique", matches: "matchs", correct: "réussis", exact: "exacts" },
  de: { title: "Demo-Saison", note: "Beispieltipps zu bestätigten Ergebnissen 2026. Ohne Einfluss auf deine Punkte.", myHistory: "Mein Verlauf", matches: "Spiele", correct: "richtig", exact: "exakt" },
  ja: { title: "デモシーズン", note: "2026年の確認済み結果を使ったサンプル予想です。ポイントには影響しません。", myHistory: "自分の履歴", matches: "試合", correct: "的中", exact: "完全的中" },
  ar: { title: "موسم تجريبي", note: "توقعات نموذجية على نتائج مؤكدة لعام 2026 ولا تؤثر في نقاطك.", myHistory: "سجلي", matches: "مباريات", correct: "صحيحة", exact: "مطابقة" },
};

const replayDurationMs = 46_000;
const replaySpeeds = [0.5, 1, 2, 4] as const;
const pointsPerPick = 50;
const liveRefreshMs = 15_000;
const challengeSettlementRefreshMs = 60_000;

type StoredPick = {
  matchId: string;
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  locked: boolean;
  settled: boolean;
  lockedAtIso?: string;
  settledAtIso?: string;
  finalHomeScore?: number;
  finalAwayScore?: number;
  award?: number;
  sourceKind?: DataSourceState["kind"];
  sourceCheckedAtIso?: string;
};

const pickLedgerKey = "wclp-pick-ledger-v1";

function readChallengeStats(): ChallengeStats {
  if (typeof window === "undefined") return emptyChallengeStats;
  try {
    const parsed = JSON.parse(window.localStorage.getItem("wclp-challenge-stats") ?? "null") as Partial<ChallengeStats> | null;
    if (!parsed) return emptyChallengeStats;
    return {
      played: Math.max(0, Math.round(parsed.played ?? 0)),
      correct: Math.max(0, Math.round(parsed.correct ?? 0)),
      exact: Math.max(0, Math.round(parsed.exact ?? 0)),
      streak: Math.max(0, Math.round(parsed.streak ?? 0)),
      bestStreak: Math.max(0, Math.round(parsed.bestStreak ?? 0)),
    };
  } catch {
    return emptyChallengeStats;
  }
}

function readStoredPick(matchId: string): StoredPick | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`wclp-pick-${matchId}`) ?? "null") as Partial<StoredPick> | null;
    if (!parsed || !Number.isFinite(parsed.homeScore) || !Number.isFinite(parsed.awayScore)) return null;
    const knownMatch = replayMatches.find((item) => item.id === matchId);
    return {
      matchId,
      homeCode: parsed.homeCode || knownMatch?.home.code || "HOME",
      awayCode: parsed.awayCode || knownMatch?.away.code || "AWAY",
      homeScore: Math.max(0, Math.min(20, Math.round(Number(parsed.homeScore)))),
      awayScore: Math.max(0, Math.min(20, Math.round(Number(parsed.awayScore)))),
      locked: Boolean(parsed.locked),
      settled: Boolean(parsed.settled),
      lockedAtIso: parsed.lockedAtIso,
      settledAtIso: parsed.settledAtIso,
      finalHomeScore: parsed.finalHomeScore,
      finalAwayScore: parsed.finalAwayScore,
      award: parsed.award,
      sourceKind: parsed.sourceKind,
      sourceCheckedAtIso: parsed.sourceCheckedAtIso,
    };
  } catch {
    return null;
  }
}

function readPickLedger(): StoredPick[] {
  if (typeof window === "undefined") return [];
  const byId = new Map<string, StoredPick>();
  try {
    const stored = JSON.parse(window.localStorage.getItem(pickLedgerKey) ?? "[]") as StoredPick[];
    for (const item of Array.isArray(stored) ? stored : []) {
      if (item?.matchId && Number.isFinite(item.homeScore) && Number.isFinite(item.awayScore)) byId.set(item.matchId, item);
    }
  } catch {
    // Legacy per-fixture entries below remain recoverable.
  }
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("wclp-pick-") || key === pickLedgerKey) continue;
    const matchId = key.slice("wclp-pick-".length);
    const legacy = readStoredPick(matchId);
    if (legacy?.locked && !byId.has(matchId)) byId.set(matchId, legacy);
  }
  return [...byId.values()].sort((a, b) => (b.lockedAtIso ?? "").localeCompare(a.lockedAtIso ?? ""));
}

function verifiedFinalFor(matchId: string, currentMatch: MatchData | null, settlementMatches: MatchData[] = []) {
  const candidate = currentMatch?.id === matchId ? currentMatch : settlementMatches.find((item) => item.id === matchId) ?? replayMatches.find((item) => item.id === matchId);
  if (!candidate) return null;
  const hasFinal = candidate.status === "finished" || candidate.events.some((event) => event.type === "fulltime");
  if (!hasFinal) return null;
  const finalMinute = Math.max(90, ...candidate.events.map((event) => event.minute + (event.stoppage ?? 0)));
  const finalFrame = buildPulseFrame(candidate, finalMinute);
  return { match: candidate, homeScore: finalFrame.homeScore, awayScore: finalFrame.awayScore };
}

function queryValue(name: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function initialMode(): MatchMode {
  return queryValue("mode") === "replay" ? "replay" : "live";
}

function initialView(): View {
  const requested = queryValue("view");
  return requested === "teams" || requested === "tournament" ? requested : "match";
}

function initialReplayId() {
  const requested = queryValue("replay");
  return replayMatches.some((match) => match.id === requested) ? requested! : replayMatches[0].id;
}

function initialReplayMinute() {
  const requested = Number(queryValue("minute"));
  return Number.isFinite(requested) && requested >= 1 && requested <= 130 ? Math.round(requested) : null;
}

function detectLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const stored = window.localStorage.getItem("wclp-language") as Language | null;
  if (stored && languages.some((option) => option.code === stored)) return stored;
  const browser = navigator.language.toLowerCase();
  return languages.find((option) => browser.startsWith(option.code))?.code ?? "en";
}

function readPoints() {
  if (typeof window === "undefined") return 1000;
  if (window.localStorage.getItem("wclp-points-version") !== "v4") {
    window.localStorage.setItem("wclp-points-version", "v4");
    window.localStorage.setItem("wclp-test-points", "1000");
    return 1000;
  }
  const stored = Number(window.localStorage.getItem("wclp-test-points"));
  return Number.isFinite(stored) && stored >= 0 ? Math.round(stored) : 1000;
}

function sourceMeta(source: DataSourceState | null, mode: MatchMode, match: MatchData | null, copy: UiCopy) {
  if (mode === "replay" || source?.kind === "replay") {
    return { label: copy.replay, detail: copy.replayFeed, tone: "replay" };
  }
  if (source?.kind === "live-ready") {
    if (match?.status === "scheduled") {
      return { label: copy.seed, detail: source.message.includes("ESPN") ? copy.publicFeed : copy.officialFeed, tone: "seed" };
    }
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

function localizedEventLabel(event: MatchEvent, copy: UiCopy, language: Language) {
  if (event.type === "halftime") {
    if (language === "zh") return "半场";
    if (language === "es") return "Descanso";
    if (language === "pt") return "Intervalo";
    if (language === "fr") return "Mi-temps";
    if (language === "de") return "Halbzeit";
    if (language === "ja") return "ハーフタイム";
    if (language === "ar") return "الاستراحة";
  }
  if (event.type === "substitution") {
    if (language === "zh") return "换人";
    if (language === "es") return "Cambio";
    if (language === "pt") return "Substituição";
    if (language === "fr") return "Remplacement";
    if (language === "de") return "Wechsel";
    if (language === "ja") return "交代";
    if (language === "ar") return "تبديل";
  }
  if (event.type === "odds_shift") {
    if (language === "zh") return "市场脉冲";
    if (language === "es") return "Pulso de mercado";
    if (language === "pt") return "Pulso do mercado";
    if (language === "fr") return "Pouls du marché";
    if (language === "de") return "Marktimpuls";
    if (language === "ja") return "市場の脈動";
    if (language === "ar") return "نبض السوق";
  }
  if (event.type === "score_update" || event.type === "kickoff") {
    if (language === "zh") return event.type === "kickoff" ? "开赛" : "比分更新";
    if (language === "es") return event.type === "kickoff" ? "Inicio" : "Marcador";
    if (language === "pt") return event.type === "kickoff" ? "Início" : "Placar";
    if (language === "fr") return event.type === "kickoff" ? "Coup d'envoi" : "Score";
    if (language === "de") return event.type === "kickoff" ? "Anstoß" : "Spielstand";
    if (language === "ja") return event.type === "kickoff" ? "キックオフ" : "スコア更新";
    if (language === "ar") return event.type === "kickoff" ? "البداية" : "تحديث النتيجة";
  }
  return eventLabel(event, copy);
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

function teamName(team: Team, language: Language = "en") {
  return localizeTeamName(team.code, team.name, language);
}

function teamGroupLabel(group: string | undefined, copy: UiCopy, language: Language) {
  if (!group) return copy.matchCenter;
  const normalized = group.toLowerCase();
  if (normalized.includes("txline") || normalized.includes("fixture")) return copy.officialFeed;
  if (group === "Round of 16") return tournamentCopy[language].round16;
  if (group === "Quarter-final") return tournamentCopy[language].quarter;
  return group;
}

function scheduleTeamLabel(code: string, copy: UiCopy) {
  return code.endsWith("XX") ? copy.teamPending : code;
}

function dataStatusLabel(status: MatchData["dataStatus"], copy: UiCopy) {
  if (status === "Live") return copy.live;
  if (status === "Delay") return copy.delayed;
  if (status === "Replay") return copy.replay;
  if (status === "Seed") return copy.seed;
  return copy.onlyVerified;
}

function venueLabel(venue: string, copy: UiCopy) {
  const normalized = venue.toLowerCase();
  if (normalized.includes("txline") || normalized.includes("fixture feed") || normalized.includes("schedule snapshot")) return copy.officialFeed;
  if (normalized.includes("espn") || normalized.includes("public scoreboard")) return copy.publicFeed;
  return venue;
}

function stageLabel(stage: string | undefined, competition: string, copy: UiCopy, language: Language) {
  const value = stage || competition;
  const normalized = value.toLowerCase();
  if (normalized.includes("replay")) return copy.replayFeed;
  if (normalized.includes("group stage")) return copy.advancement;
  if (normalized.includes("txline") || normalized.includes("fixture")) return copy.officialFeed;
  if (value === "Round of 16") return tournamentCopy[language].round16;
  if (value === "Quarter-final") return tournamentCopy[language].quarter;
  return value;
}

export default function MatchdayApp() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [mode, setMode] = useState<MatchMode>(initialMode);
  const [view, setView] = useState<View>(initialView);
  const [settingsOpen, setSettingsOpen] = useState(() => queryValue("settings") === "1");
  const [selectedReplayId, setSelectedReplayId] = useState(initialReplayId);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [schedule, setSchedule] = useState<MatchScheduleItem[]>([]);
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
  const [pickSettled, setPickSettled] = useState(false);
  const [settlement, setSettlement] = useState<string | null>(null);
  const [challengeStats, setChallengeStats] = useState(readChallengeStats);
  const [pickLedger, setPickLedger] = useState(readPickLedger);
  const [settlementMatches, setSettlementMatches] = useState<MatchData[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const loadedMatchIdRef = useRef<string | null>(null);
  const settlementGuardRef = useRef(new Set(readPickLedger().filter((pick) => pick.settled).map((pick) => pick.matchId)));

  const copy = ui[language];
  const helperUrl = `${import.meta.env.BASE_URL}tools/txline-subscribe/index.html?v=2026-07-10`;
  const configuredVideoUrl = safeVideoUrl(import.meta.env.VITE_AUTHORIZED_VIDEO_EMBED_URL);
  const videoUrl = configuredVideoUrl ?? officialVideoSources[0].url;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("translate", "no");
    window.localStorage.setItem("wclp-language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("wclp-points-version", "v4");
    window.localStorage.setItem("wclp-test-points", String(points));
  }, [points]);

  useEffect(() => {
    window.localStorage.setItem("wclp-challenge-stats", JSON.stringify(challengeStats));
  }, [challengeStats]);

  useEffect(() => {
    window.localStorage.setItem(pickLedgerKey, JSON.stringify(pickLedger));
  }, [pickLedger]);

  useEffect(() => {
    if (!match || loadedMatchIdRef.current !== match.id) return;
    const previous = pickLedger.find((item) => item.matchId === match.id);
    const stored: StoredPick = {
      ...previous,
      matchId: match.id,
      homeCode: match.home.code,
      awayCode: match.away.code,
      homeScore: pickHome,
      awayScore: pickAway,
      locked: pickLocked,
      settled: pickSettled,
    };
    window.localStorage.setItem(`wclp-pick-${match.id}`, JSON.stringify(stored));
  }, [match, pickAway, pickHome, pickLedger, pickLocked, pickSettled]);

  useEffect(() => {
    const results: Array<ReturnType<typeof settleScorePick>> = [];
    let currentSettlement: string | null = null;
    let changed = false;
    const settledAtIso = new Date().toISOString();
    const nextLedger = pickLedger.map((pick) => {
      if (!pick.locked || pick.settled || settlementGuardRef.current.has(pick.matchId)) return pick;
      const verified = verifiedFinalFor(pick.matchId, match, settlementMatches);
      if (!verified) return pick;
      settlementGuardRef.current.add(pick.matchId);
      const result = settleScorePick(pick, verified);
      results.push(result);
      changed = true;
      const next = {
        ...pick,
        homeCode: verified.match.home.code,
        awayCode: verified.match.away.code,
        settled: true,
        settledAtIso,
        finalHomeScore: verified.homeScore,
        finalAwayScore: verified.awayScore,
        award: result.award,
        sourceKind: pick.sourceKind ?? source?.kind,
        sourceCheckedAtIso: pick.sourceCheckedAtIso ?? source?.checkedAtIso,
      };
      window.localStorage.setItem(`wclp-pick-${pick.matchId}`, JSON.stringify(next));
      if (pick.matchId === match?.id) currentSettlement = result.exact ? `${copy.exact} +${result.award}` : `${copy.result} ${result.award ? `+${result.award}` : "+0"}`;
      return next;
    });
    if (!changed) return;
    setPickLedger(nextLedger);
    setPoints((current) => current + results.reduce((sum, result) => sum + result.award, 0));
    setChallengeStats((current) => results.reduce((stats, result) => updateChallengeStats(stats, result), current));
    if (currentSettlement && match) {
      setPickSettled(true);
      setSettlement(currentSettlement);
    }
  }, [copy.exact, copy.result, match, pickLedger, settlementMatches, source?.checkedAtIso, source?.kind]);

  useEffect(() => {
    if (mode !== "live") return;
    let cancelled = false;
    let inFlight = false;
    const verifyPendingPicks = async () => {
      if (inFlight) return;
      const pending = readPickLedger().filter((pick) => pick.locked && !pick.settled && pick.matchId !== match?.id).slice(0, 6);
      if (!pending.length) return;
      inFlight = true;
      try {
        const results = await Promise.allSettled(pending.map((pick) => loadMatchData("live", {
          proxyBase: import.meta.env.VITE_TXLINE_PROXY_BASE || (import.meta.env.DEV ? "/__txline" : ""),
          asOfMs: import.meta.env.VITE_TXLINE_AS_OF_MS,
          competitionId: import.meta.env.VITE_TXLINE_COMPETITION_ID,
          fixtureId: pick.matchId,
          startEpochDay: import.meta.env.VITE_TXLINE_START_EPOCH_DAY,
        })));
        if (cancelled) return;
        const finals = results.flatMap((result) => result.status === "fulfilled" && result.value.match.id && verifiedFinalFor(result.value.match.id, result.value.match) ? [result.value.match] : []);
        if (finals.length) setSettlementMatches((current) => [...finals, ...current.filter((item) => !finals.some((next) => next.id === item.id))]);
      } finally {
        inFlight = false;
      }
    };
    void verifyPendingPicks();
    const interval = window.setInterval(() => void verifyPendingPicks(), challengeSettlementRefreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [match?.id, mode, pickLedger]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (pickSettled) setSettlement(copy.alreadySettled);
    return () => window.speechSynthesis?.cancel();
  }, [language, match?.id]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
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
        setSchedule(result.schedule ?? []);
        setSource(result.source);
        const requestedReplayMinute = initialReplayMinute();
        setMinute(mode === "replay" ? requestedReplayMinute ?? 1 : Math.max(1, result.match.events.at(-1)?.minute ?? 1));
        if (mode === "replay" && requestedReplayMinute) setIsPlaying(false);
        if (loadedMatchIdRef.current !== result.match.id) {
          const storedPick = readPickLedger().find((item) => item.matchId === result.match.id) ?? readStoredPick(result.match.id);
          setPickHome(storedPick?.homeScore ?? 1);
          setPickAway(storedPick?.awayScore ?? 1);
          setPickLocked(storedPick?.locked ?? false);
          setPickSettled(storedPick?.settled ?? false);
          setSettlement(storedPick?.settled ? copy.alreadySettled : null);
          loadedMatchIdRef.current = result.match.id;
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Unknown data error");
      } finally {
        inFlight = false;
        if (!cancelled) setIsRefreshing(false);
      }
    };
    void load();
    if (mode !== "live") return () => { cancelled = true; };
    const interval = window.setInterval(() => void load(), liveRefreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mode, refreshNonce, selectedReplayId]);

  useEffect(() => {
    if (mode !== "live") return;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") setRefreshNonce((value) => value + 1);
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [mode]);

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
  const isScheduled = match.status === "scheduled";
  const activeEvents = isScheduled ? frame.activeEvents.filter((event) => event.type !== "kickoff") : frame.activeEvents;
  const latestEvent = isScheduled ? undefined : frame.latestEvent;
  const recentEvents = [...activeEvents].reverse().slice(0, 8);
  const goalCount = activeEvents.filter((event) => event.type === "goal").length;
  const yellowCount = activeEvents.filter((event) => event.type === "yellow_card").length;
  const redCount = activeEvents.filter((event) => event.type === "red_card").length;
  const extraTime = activeEvents.some((event) => event.minute > 90 || event.stoppage);
  const isFinal = match.status === "finished" || activeEvents.some((event) => event.type === "fulltime");
  const canLockPick = canLockScorePick(mode, match.status);
  const marketLabel = match.marketSource === "official-odds"
    ? copy.officialOdds
    : mode === "replay"
      ? copy.replaySnapshot
      : copy.derivedPulse;
  const statusText = match.status === "live" ? copy.liveNow : match.status === "finished" ? copy.final : copy.scheduled;
  const nextEvent = match.events.find((event) => event.minute > minute);
  const nextSignal = isScheduled
    ? copy.scheduled
    : nextEvent
      ? `${minuteLabel(nextEvent)} ${localizedEventLabel(nextEvent, copy, language)}`
      : copy.replay;
  const aiCommentary = isScheduled ? `${teamName(match.home, language)} vs ${teamName(match.away, language)}: ${copy.scheduled}.` : localizeCommentary(language, match, frame);
  const aiInsight = isScheduled ? copy.scheduled : localizeInsight(language, match, frame);

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
    if (!match) return;
    if (pickLocked) return;
    if (!canLockPick) {
      setSettlement(copy.pickClosed);
      return;
    }
    if (points < pointsPerPick) {
      setSettlement(copy.pointsNeeded);
      return;
    }
    setPoints((current) => current - pointsPerPick);
    setPickLocked(true);
    setSettlement(null);
    const record: StoredPick = {
      matchId: match.id,
      homeCode: match.home.code,
      awayCode: match.away.code,
      homeScore: pickHome,
      awayScore: pickAway,
      locked: true,
      settled: false,
      lockedAtIso: new Date().toISOString(),
      sourceKind: source?.kind,
      sourceCheckedAtIso: source?.checkedAtIso,
    };
    setPickLedger((current) => [record, ...current.filter((item) => item.matchId !== match.id)]);
  }

  function downloadPickCard() {
    if (!match || !frame) return;
    downloadPredictionCard(match, frame, {
      homeScore: pickHome,
      awayScore: pickAway,
      outcome: `${match.home.code} ${pickHome}-${pickAway} ${match.away.code}`,
      quickPick: settlement ?? copy.locked,
      safetyLabel: copy.pointsNote,
    });
  }

  function toggleCommentaryAudio() {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(aiCommentary);
    utterance.lang = language === "zh" ? "zh-CN" : language === "pt" ? "pt-BR" : language;
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  function resetPoints() {
    window.localStorage.setItem("wclp-points-version", "v4");
    window.localStorage.setItem("wclp-test-points", "1000");
    setPoints(1000);
    setPickLocked(false);
    setPickSettled(false);
    setSettlement(null);
    setChallengeStats(emptyChallengeStats);
    setPickLedger([]);
    settlementGuardRef.current.clear();
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith("wclp-pick-")) window.localStorage.removeItem(key);
    }
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
          <NavButton active={view === "match" && mode === "live"} onClick={startLive} label={copy.navMatch} icon="LIVE" />
          <NavButton active={view === "tournament"} onClick={() => setView("tournament")} label={copy.navReplay} icon="RPL" />
          <NavButton active={view === "teams"} onClick={() => setView("teams")} label={copy.navTeams} icon="T" />
        </nav>
        <div className="rail-footer">
          <button className="rail-settings" type="button" onClick={() => setSettingsOpen(true)}>
            <span className="nav-icon" aria-hidden="true">&#9881;</span>
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
            <p className="overline">{view === "tournament" ? copy.schedule : view === "teams" ? copy.teams : copy.matchCenter}</p>
            <h1>{view === "tournament" ? tournamentCopy[language].title : view === "teams" ? copy.teams : <>{teamName(match.home, language)} <span>vs</span> {teamName(match.away, language)}</>}</h1>
          </div>
          <div className="top-actions">
            <span className={`source-pill ${sourceState.tone}`}><span className={`status-dot ${sourceState.tone}`} />{sourceState.label}</span>
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
                <span>{stageLabel(match.stage, match.competition, copy, language)}</span>
               <span>{venueLabel(match.venue, copy)}</span>
              </div>
              <div className="score-line">
                <TeamSide team={match.home} score={frame.homeScore} copy={copy} language={language} />
                <div className="score-core">
                  <strong>{isScheduled ? "—" : frame.homeScore} <i>:</i> {isScheduled ? "—" : frame.awayScore}</strong>
                  <span>{minuteLabelForFrame(match, minute, isFinal, copy)}</span>
                </div>
                <TeamSide team={match.away} score={frame.awayScore} align="right" copy={copy} language={language} />
              </div>
              <div className="pulse-strip">
                <span>{copy.fanPulse} {Math.round(frame.market.sentiment)}/100</span>
                <div className="pulse-track"><span style={{ width: `${frame.market.sentiment}%` }} /></div>
                <span>{copy.next}: {nextSignal}</span>
              </div>
              <div className="hero-ai-brief">
                <div><span>{copy.aiCommentary}</span><strong aria-live="polite">{aiCommentary}</strong></div>
                <button className="commentary-audio" type="button" onClick={toggleCommentaryAudio} title={isSpeaking ? copy.stopCommentary : copy.listenCommentary}>{isSpeaking ? copy.stopCommentary : copy.listenCommentary}</button>
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

            <section className="prediction-focus" aria-label={copy.scoreChallenge}>
              <ScoreChallenge copy={copy} language={language} match={match} picks={pickLedger} homeScore={pickHome} awayScore={pickAway} setHomeScore={setPickHome} setAwayScore={setPickAway} locked={pickLocked} settled={pickSettled} points={points} stats={challengeStats} settlement={settlement} onLock={lockPick} onDownload={downloadPickCard} canLock={canLockPick} />
            </section>

            <div className="signal-row" aria-label={copy.events}>
              <Signal label={copy.goals} value={goalCount} tone="goal" />
              <Signal label={copy.yellow} value={yellowCount} tone="yellow" />
              <Signal label={copy.red} value={redCount} tone="red" />
              <Signal label={copy.extraTime} value={extraTime ? "YES" : "--"} tone="neutral" />
               <div className="signal-next"><span>{copy.latest}</span><strong>{latestEvent ? `${minuteLabel(latestEvent)} ${localizedEventLabel(latestEvent, copy, language)}${latestEvent.player ? ` · ${latestEvent.player}` : ""}` : copy.noEvents}</strong></div>
            </div>

            <section className="match-context-grid">
              <section className="section-block match-summary-block">
                <SectionHeading eyebrow={copy.summary} title={stageLabel(match.stage, match.competition, copy, language)} />
                 <div className="summary-metrics">
                   <Metric label={copy.next} value={aiInsight} />
                  <Metric label={copy.fanPulse} value={`${Math.round(frame.market.sentiment)}/100`} />
                </div>
                <div className="match-facts">
                  <span>{stageLabel(match.stage, match.competition, copy, language)}</span>
                   <span>{venueLabel(match.venue, copy)}</span>
                  {match.referee ? <span>{match.referee}</span> : null}
                  {match.kickoffIso ? <span>{formatKickoffLabel(match.kickoffIso, language)}</span> : null}
                </div>
                {match.groupTable?.length ? <GroupTable table={match.groupTable} home={match.home.code} away={match.away.code} title={copy.advancement} /> : null}
                <KeyPlayersStrip copy={copy} match={match} language={language} />
              </section>
              <ScheduleBoard copy={copy} items={schedule} selectedId={match.id} onOpenReplay={startReplay} language={language} />
            </section>

            <section className="content-grid">
              <div className="feed-column">
                <section className="section-block">
                  <SectionHeading eyebrow={copy.events} title={`${activeEvents.length} ${copy.events.toLowerCase()}`} />
                  <div className="event-feed">
                    {recentEvents.length ? recentEvents.map((event) => <EventRow key={event.id} event={event} copy={copy} home={match.home} away={match.away} language={language} />) : <p className="empty-state">{copy.noEvents}</p>}
                  </div>
                </section>
                <section className="section-block pulse-detail">
                  <SectionHeading eyebrow={copy.scorePulse} title={marketLabel} />
                  <div className="pulse-metrics">
                    <Metric label={copy.fanPulse} value={`${Math.round(frame.market.sentiment)}/100`} />
                    <Metric label={copy.dataQuality} value={dataStatusLabel(match.dataStatus, copy)} />
                    <Metric label={copy.next} value={nextSignal} />
                  </div>
                   <p className="muted-copy">{copy.onlyVerified}</p>
                </section>
              </div>

               <aside className="right-content-column">
                <OddsContext copy={copy} label={marketLabel} match={match} market={frame.market} />
                <section className="side-block">
                  <SectionHeading eyebrow={copy.watch} title={configuredVideoUrl ? copy.officialWatch : copy.replay} />
                   <a className="watch-link" href={videoUrl} target="_blank" rel="noreferrer">{copy.officialWatch}<span>↗</span></a>
                   <div className="official-video-links">
                     <a href={officialVideoSources[0].url} target="_blank" rel="noreferrer">{copy.archiveLink}<span>↗</span></a>
                     <a href={officialVideoSources[1].url} target="_blank" rel="noreferrer">{copy.highlightsLink}<span>↗</span></a>
                   </div>
                   <p className="muted-copy">{copy.noWatch}</p>
                  <div className="replay-progress"><span style={{ width: `${Math.min(100, (minute / maxMinute) * 100)}%` }} /></div>
                </section>
                <section className="side-block">
                  <SectionHeading eyebrow={copy.replayLibrary} title={copy.chooseReplay} />
                  <div className="replay-list">
                    {replayMatches.map((candidate) => <button className={`replay-item ${candidate.id === selectedReplayId && mode === "replay" ? "selected" : ""}`} type="button" key={candidate.id} onClick={() => startReplay(candidate.id)}><span>{candidate.home.code} <b>vs</b> {candidate.away.code}</span><small>{copy.replay}</small></button>)}
                  </div>
                </section>
              </aside>
            </section>
          </>
        ) : view === "tournament" ? (
          <TournamentView language={language} copy={copy} onOpenReplay={startReplay} />
        ) : (
          <TeamsView copy={copy} language={language} match={match} schedule={schedule} />
        )}
      </section>

      <aside className="right-rail">
        <section className="truth-panel">
          <div className="truth-heading"><span className={`status-dot ${sourceState.tone}`} /><strong>{copy.source}</strong></div>
          <strong className="truth-title">{sourceState.detail}</strong>
           <p>{copy.onlyVerified}</p>
          <div className="truth-meta"><span>{copy.verifiedAt}</span><strong>{formatCheckedAt(source?.checkedAtIso, language)}</strong></div>
          <div className="truth-meta"><span>{copy.refresh}</span><strong>15s</strong></div>
          <details>
            <summary>{copy.dataRules}</summary>
            <p>{copy.onlyVerified}</p>
            <p>{copy.replaySnapshot}</p>
          </details>
        </section>
        <section className="up-next-panel">
          <div className="panel-heading"><span>{copy.next}</span><span className="panel-count">{replayMatches.length}</span></div>
          <p>{copy.replayLibrary}</p>
          <button type="button" onClick={() => startReplay(replayMatches[0].id)}>{replayMatches[0].home.code} vs {replayMatches[0].away.code}<span>→</span></button>
          <button type="button" onClick={() => startReplay(replayMatches[1].id)}>{replayMatches[1].home.code} vs {replayMatches[1].away.code}<span>→</span></button>
        </section>
      </aside>

      {settingsOpen ? <SettingsDrawer copy={copy} language={language} setLanguage={setLanguage} helperUrl={helperUrl} source={source} onRefresh={() => setRefreshNonce((value) => value + 1)} onResetPoints={resetPoints} onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}

function NavButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return <button className={`nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}><span className="nav-icon">{icon}</span><span>{label}</span></button>;
}

function TeamSide({ team, score, align = "left", copy, language }: { team: Team; score: number | string; align?: "left" | "right"; copy: UiCopy; language: Language }) {
  return <div className={`team-side ${align}`}><span className="team-code" style={{ backgroundColor: team.color }}>{team.code}</span><strong>{teamName(team, language)}</strong><small>{teamGroupLabel(team.group, copy, language)}</small><b>{score}</b></div>;
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

function EventRow({ event, copy, home, away, language }: { event: MatchEvent; copy: UiCopy; home: Team; away: Team; language: Language }) {
  const team = event.team === home.code ? home : event.team === away.code ? away : undefined;
  return <article className={`event-row event-${event.type}`}><time>{minuteLabel(event)}</time><span className="event-mark">{event.type === "goal" ? "G" : event.type === "yellow_card" ? "Y" : event.type === "red_card" ? "R" : "·"}</span><div><strong>{localizedEventLabel(event, copy, language)}{team ? ` · ${team.code}` : ""}</strong><p>{localizeEventDescription(language, event)}</p></div><b>{event.homeScore}-{event.awayScore}</b></article>;
}

function OddsContext({ copy, label, match, market }: { copy: UiCopy; label: string; match: MatchData; market: MatchData["market"][number] }) {
  if (match.marketSource !== "official-odds") {
    return <section className="odds-context"><SectionHeading eyebrow={copy.fanPulse} title={label} /><div className="derived-pulse"><div><span>{match.home.code}</span><strong>{market.sentiment}/100</strong></div><div className="derived-pulse-track"><span style={{ width: `${market.sentiment}%` }} /></div><div><span>{match.away.code}</span><strong>{100 - market.sentiment}/100</strong></div></div><p className="muted-copy">{copy.onlyVerified}</p></section>;
  }
  const values = [
    { label: match.home.code, value: market.homeWin },
    { label: copy.result, value: market.draw },
    { label: match.away.code, value: market.awayWin },
  ];
  return <section className="odds-context"><SectionHeading eyebrow={copy.fanPulse} title={label} /><div className="odds-grid">{values.map((item) => <div className="odds-cell" key={item.label}><span>{item.label}</span><strong>{Number.isFinite(item.value) && item.value > 0 ? `x${item.value.toFixed(2)}` : "--"}</strong></div>)}</div><p className="muted-copy">{copy.noBetting}</p></section>;
}

function ScoreChallenge({ copy, language, match, picks, homeScore, awayScore, setHomeScore, setAwayScore, locked, settled, points, stats, settlement, onLock, onDownload, canLock }: { copy: UiCopy; language: Language; match: MatchData; picks: StoredPick[]; homeScore: number; awayScore: number; setHomeScore: (value: number) => void; setAwayScore: (value: number) => void; locked: boolean; settled: boolean; points: number; stats: ChallengeStats; settlement: string | null; onLock: () => void; onDownload: () => void; canLock: boolean }) {
  const matchState = match.status === "finished" ? copy.final : match.status === "live" ? copy.live : copy.scheduled;
  const accuracy = stats.played ? `${Math.round((stats.correct / stats.played) * 100)}%` : "--";
  const actionLabel = settled ? copy.alreadySettled : locked ? copy.locked : canLock ? copy.lockPick : copy.pickClosed;
  const level = getFanLevel(stats);
  const levelDetail = level.ceiling ? `${copy.nextLevel} · ${level.xp}/${level.ceiling} XP` : `${level.xp} XP`;
  const demoText = seasonDemoCopy[language];
  return (
    <section className="challenge-block">
      <div className="challenge-heading-row">
        <SectionHeading eyebrow={copy.scoreChallenge} title={`${match.home.code} vs ${match.away.code}`} />
        <div className="challenge-balance"><span>{copy.currentPoints}</span><strong>{points.toLocaleString()}</strong><small>pts</small></div>
      </div>
      <div className="challenge-stage">
        <div className="challenge-progress-column">
          <div className="challenge-level">
            <div><span>{copy.fanLevel}</span><strong>Lv {level.index + 1} · {copy.levelNames[level.index]}</strong></div>
            <small>{levelDetail}</small>
            <div className="challenge-level-track"><span style={{ width: `${level.progress}%` }} /></div>
          </div>
          <div className="challenge-meta"><div><span>{copy.pickCost}</span><strong>{pointsPerPick} pts</strong></div><div><span>{copy.settlementRule}</span><strong>{locked ? copy.locked : matchState}</strong></div></div>
          <div className="challenge-stats"><span>{copy.streak} <b>{stats.streak}</b> <small>{copy.bestStreak} {stats.bestStreak}</small></span><span>{copy.accuracy} <b>{accuracy}</b> <small>{stats.correct}/{stats.played}</small></span></div>
        </div>
        <div className="challenge-play-column">
          <div className="challenge-score"><ScoreInput label={match.home.code} value={homeScore} disabled={locked} onChange={setHomeScore} /><span>:</span><ScoreInput label={match.away.code} value={awayScore} disabled={locked} onChange={setAwayScore} /></div>
          <p className="muted-copy">{copy.pointsNote}</p>
          <div className="challenge-actions"><button className="primary-button" type="button" onClick={onLock} disabled={settled || locked || points < pointsPerPick || !canLock}>{actionLabel}</button>{locked ? <button className="secondary-button" type="button" onClick={onDownload}>{copy.downloadPick}</button> : null}</div>
        </div>
      </div>
      {settlement ? <p className="challenge-result">{settlement}</p> : null}
      {picks.length ? <details className="challenge-history" open><summary>{demoText.myHistory} · {picks.length}</summary><div className="challenge-history-list">{picks.slice(0, 4).map((pick) => <div key={pick.matchId}><strong>{pick.homeCode} {pick.homeScore}:{pick.awayScore} {pick.awayCode}</strong><span>{pick.settled && Number.isFinite(pick.finalHomeScore) && Number.isFinite(pick.finalAwayScore) ? `${copy.final} ${pick.finalHomeScore}:${pick.finalAwayScore} · +${pick.award ?? 0}` : copy.locked}</span><small>{copy.verifiedAt} {formatCheckedAt(pick.sourceCheckedAtIso, language)}</small></div>)}</div></details> : null}
      <details className="challenge-history demo-history"><summary>{demoText.title} · {demoSeasonSummary.played} {demoText.matches} · {demoSeasonSummary.correct} {demoText.correct} · {demoSeasonSummary.exact} {demoText.exact} · {demoSeasonSummary.netPoints >= 0 ? "+" : ""}{demoSeasonSummary.netPoints} pts</summary><p className="muted-copy">{demoText.note}</p><div className="challenge-history-list">{demoSeasonHistory.map((pick) => <div key={pick.matchId}><strong>{pick.homeCode} {pick.homeScore}:{pick.awayScore} {pick.awayCode}</strong><span>{copy.final} {pick.finalHomeScore}:{pick.finalAwayScore} · +{pick.award}</span><small>{pick.kickoffIso ? formatKickoffLabel(pick.kickoffIso, language) : copy.replay}</small></div>)}</div></details>
    </section>
  );
}

function ScoreInput({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <label className="score-input"><span>{label}</span><div className="score-stepper"><button type="button" disabled={disabled || value <= 0} onClick={() => onChange(Math.max(0, value - 1))} aria-label={`${label} -`}>-</button><input type="number" min="0" max="20" value={value} disabled={disabled} onChange={(event) => onChange(Math.max(0, Math.min(20, Number(event.target.value) || 0)))} /><button type="button" disabled={disabled || value >= 20} onClick={() => onChange(Math.min(20, value + 1))} aria-label={`${label} +`}>+</button></div></label>;
}

function TournamentView({ language, copy, onOpenReplay }: { language: Language; copy: UiCopy; onOpenReplay: (id: string) => void }) {
  const text = tournamentCopy[language];
  const teams = useMemo(() => {
    const map = new Map<string, Team>();
    for (const match of txlineArchiveMatches) {
      map.set(match.home.code, match.home);
      map.set(match.away.code, match.away);
    }
    return map;
  }, []);
  const [selectedCode, setSelectedCode] = useState(txlineArchiveMatches[0]?.home.code ?? "FRA");
  const selectedTeam = teams.get(selectedCode);
  const selectedMatches = txlineArchiveMatches.filter((match) => match.home.code === selectedCode || match.away.code === selectedCode);
  const round16 = txlineArchiveMatches.filter((match) => match.stage === "Round of 16");
  const quarter = txlineArchiveMatches.filter((match) => match.stage === "Quarter-final");
  const currentFixtures = dataConsistencyState.today.filter((item) => item.dataStatus !== "Replay").slice(0, 4);

  return <section className="tournament-view">
    <header className="tournament-intro"><div><p className="overline">{text.verified}</p><h2>{text.subtitle}</h2></div><p>{text.sourceRule}</p></header>

    <section className="tournament-band current-fixtures"><SectionHeading eyebrow={copy.schedule} title={text.current} /><div className="current-fixture-grid">{currentFixtures.map((item) => <article key={item.id}><div><span className="data-chip seed">{dataStatusLabel(item.dataStatus, copy)}</span><small>{formatKickoffLabel(item.kickoffIso, language)}</small></div><strong>{item.homeCode} <b>vs</b> {item.awayCode}</strong><p>{currentFixtureNote(language)}</p></article>)}</div></section>

    <section className="tournament-band"><SectionHeading eyebrow="2026" title={text.archive} /><div className="archive-match-grid">{txlineArchiveMatches.map((archive) => {
      const finalEvent = archive.events.filter((event) => event.type === "fulltime").at(-1) ?? archive.events.at(-1);
      const score = finalEvent ? `${finalEvent.homeScore}-${finalEvent.awayScore}` : "--";
      const winner = finalEvent && finalEvent.homeScore !== finalEvent.awayScore ? (finalEvent.homeScore > finalEvent.awayScore ? archive.home.code : archive.away.code) : text.undecided;
      return <article className="archive-match-card" key={archive.id}><div className="archive-match-top"><span>{localizedStage(archive.stage, text)}</span><small>{text.verified}</small></div><div className="archive-score-row"><button type="button" onClick={() => setSelectedCode(archive.home.code)}>{archive.home.code}</button><strong>{score}</strong><button type="button" onClick={() => setSelectedCode(archive.away.code)}>{archive.away.code}</button></div><p>{text.winner}: <b>{winner}</b> · {archive.events.filter((event) => event.type === "goal").length} {copy.goals} · {archive.events.filter((event) => event.type === "yellow_card" || event.type === "red_card").length} {copy.events}</p><button className="archive-open" type="button" onClick={() => onOpenReplay(archive.id)}>{text.open}<span>→</span></button></article>;
    })}</div></section>

    <section className="tournament-band bracket-section"><SectionHeading eyebrow={copy.advancement} title={text.path} /><div className="bracket-scroll"><div className="bracket-grid">
      <BracketLane title={text.round32} matches={[]} waiting={text.waiting} />
      <BracketLane title={text.round16} matches={round16} waiting={text.waiting} onOpen={onOpenReplay} />
      <BracketLane title={text.quarter} matches={quarter} waiting={text.waiting} onOpen={onOpenReplay} />
      <BracketLane title={text.semi} matches={[]} waiting={text.waiting} />
      <BracketLane title={text.final} matches={[]} waiting={text.waiting} />
      <BracketLane title={text.champion} matches={[]} waiting={text.waiting} champion />
    </div></div></section>

    {selectedTeam ? <section className="tournament-band team-detail-panel"><div className="team-detail-heading"><div className="profile-top"><span className="team-code" style={{ backgroundColor: selectedTeam.color }}>{selectedTeam.code}</span><div><p className="overline">{text.teamDetail}</p><h2>{teamName(selectedTeam, language)}</h2></div></div><div className="team-switcher">{[...teams.values()].map((team) => <button className={team.code === selectedCode ? "active" : ""} type="button" key={team.code} onClick={() => setSelectedCode(team.code)}>{team.code}</button>)}</div></div><div className="team-detail-grid"><div><span>{copy.schedule}</span><strong>{selectedMatches.length}</strong><p>{selectedMatches.map((item) => `${teamName(item.home, language)} ${item.events.at(-1)?.homeScore ?? 0}-${item.events.at(-1)?.awayScore ?? 0} ${teamName(item.away, language)}`).join(" · ")}</p></div><div><span>{text.sourcePlayers}</span><strong>{selectedTeam.keyPlayers?.length ?? 0}</strong><p>{selectedTeam.keyPlayers?.length ? selectedTeam.keyPlayers.map((player) => language === "en" ? `${player.name} · ${player.role}` : player.name).join(" · ") : copy.teamPending}</p></div><div><span>{copy.dataQuality}</span><strong>{text.verified}</strong><p>{copy.onlyVerified}</p></div></div></section> : null}
  </section>;
}

function BracketLane({ title, matches, waiting, onOpen, champion = false }: { title: string; matches: MatchData[]; waiting: string; onOpen?: (id: string) => void; champion?: boolean }) {
  return <section className={`bracket-lane ${champion ? "champion" : ""}`}><header><span>{title}</span><b>{matches.length || "--"}</b></header><div>{matches.length ? matches.map((match) => {
    const finalEvent = match.events.filter((event) => event.type === "fulltime").at(-1) ?? match.events.at(-1);
    return <button type="button" key={match.id} onClick={() => onOpen?.(match.id)}><span>{match.home.code} <b>{finalEvent?.homeScore ?? 0}</b></span><span>{match.away.code} <b>{finalEvent?.awayScore ?? 0}</b></span></button>;
  }) : <p>{waiting}</p>}</div></section>;
}

function localizedStage(stage: string | undefined, text: (typeof tournamentCopy)[Language]) {
  if (stage === "Round of 16") return text.round16;
  if (stage === "Quarter-final") return text.quarter;
  return stage ?? text.waiting;
}

function currentFixtureNote(language: Language) {
  if (language === "zh") return "对阵与开赛时间已确认。";
  if (language === "es") return "Rivales y hora confirmados.";
  if (language === "pt") return "Confronto e horário confirmados.";
  if (language === "fr") return "Affiche et horaire confirmés.";
  if (language === "de") return "Paarung und Anstoß bestätigt.";
  if (language === "ja") return "対戦と開始時刻を確認済み。";
  if (language === "ar") return "تم تأكيد المواجهة والموعد.";
  return "Fixture and kickoff confirmed.";
}

function TeamsView({ copy, language, match, schedule }: { copy: UiCopy; language: Language; match: MatchData; schedule: MatchScheduleItem[] }) {
  const sourceTeams = new Map<string, { team: Team; status: MatchData["dataStatus"] }>();
  const statusPriority = { Live: 4, Delay: 3, Replay: 2, Seed: 1 } as const;
  const addTeam = (team: Team, status: MatchData["dataStatus"]) => {
    const current = sourceTeams.get(team.code);
    if (!current || statusPriority[status ?? "Seed"] > statusPriority[current.status ?? "Seed"]) {
      sourceTeams.set(team.code, { team, status });
    }
  };
  addTeam(match.home, match.dataStatus);
  addTeam(match.away, match.dataStatus);
  schedule.forEach((item) => {
    if (item.id.startsWith("wc-demo-")) return;
    addTeam(item.home, item.dataStatus);
    addTeam(item.away, item.dataStatus);
  });
  return <section className="teams-view"><SectionHeading eyebrow={copy.teams} title={copy.sourceTeams} /><p className="muted-copy">{copy.onlyVerified}</p><div className="atlas-grid source-atlas">{[...sourceTeams.values()].map(({ team, status }) => {
    const fixtures = schedule.filter((item) => item.home.code === team.code || item.away.code === team.code);
    const opponents = [...new Set(fixtures.map((item) => item.home.code === team.code ? item.away.code : item.home.code))];
    return <article className="team-guide-card source-team-card" key={team.code}><div className="profile-top"><span className="team-code" style={{ backgroundColor: team.color }}>{team.code}</span><div><h2>{teamName(team, language)}</h2></div></div><div className="source-team-facts"><span><small>{copy.schedule}</small><strong>{fixtures.length}</strong></span><span><small>{copy.next}</small><strong>{opponents.slice(0, 3).map((code) => localizeTeamName(code, code, language)).join(" · ") || "--"}</strong></span></div><div className="team-guide-status"><span>{copy.dataQuality}</span><strong>{dataStatusLabel(status, copy)}</strong></div>{team.keyPlayers?.length ? <details><summary>{copy.players}</summary><div className="source-player-list">{team.keyPlayers.map((player) => <span key={player.name}><strong>{player.name}</strong>{language === "en" ? <small>{player.position} · {player.role}</small> : null}</span>)}</div></details> : <p>{copy.teamPending}</p>}</article>;
  })}</div><details className="reference-atlas"><summary>{copy.referenceTeams}</summary><p className="muted-copy">{copy.replaySnapshot}</p><div className="atlas-grid">{teamAtlas.map((guide) => <article className="team-guide-card" key={guide.code}><div className="profile-top"><span className="team-code" style={{ backgroundColor: guide.colors[0] }}>{guide.code}</span><div><h2>{guide.name}</h2>{language === "en" ? <span>{guide.region}</span> : null}</div></div>{language === "en" ? <p>{guide.style}</p> : null}<div className="team-guide-status"><span>{copy.dataQuality}</span><strong>{teamGuideStatusLabel(guide.status, copy)}</strong></div><details><summary>{copy.players}</summary><p>{guide.keyPlayers.join(" · ")}</p>{language === "en" ? <p>{guide.watchFor}</p> : null}</details></article>)}</div></details></section>;
}

function teamGuideStatusLabel(status: string, copy: UiCopy) {
  const normalized = status.toLowerCase();
  if (normalized.includes("replay") && normalized.includes("schedule")) return `${copy.replay} + ${copy.seed}`;
  if (normalized.includes("replay")) return copy.replay;
  if (normalized.includes("txline")) return copy.officialFeed;
  return copy.seed;
}

function KeyPlayersStrip({ copy, match, language }: { copy: UiCopy; match: MatchData; language: Language }) {
  const players = [
    ...(match.home.keyPlayers ?? []).slice(0, 2).map((player) => ({ ...player, team: match.home.code })),
    ...(match.away.keyPlayers ?? []).slice(0, 2).map((player) => ({ ...player, team: match.away.code })),
  ];
  if (!players.length) return null;
  return <div className="key-player-strip"><strong>{copy.players}</strong>{players.map((player) => <span key={`${player.team}-${player.name}`}><b>{player.name}</b><small>{language === "en" ? `${player.team} · ${player.role}` : player.team}</small></span>)}</div>;
}

function ScheduleBoard({ copy, items, selectedId, onOpenReplay, language }: { copy: UiCopy; items: MatchScheduleItem[]; selectedId: string; onOpenReplay: (id: string) => void; language: Language }) {
  const visibleItems = items.slice(0, 8);
  return <section className="section-block schedule-block"><SectionHeading eyebrow={copy.schedule} title={copy.advancement} /><div className="schedule-list">{visibleItems.length ? visibleItems.map((item) => { const isReplay = item.dataStatus === "Replay"; const status = scheduleStatusLabel(item, copy); const hasMoments = typeof item.eventCount === "number" && item.eventCount > 0; return <article className={`schedule-card ${item.id === selectedId ? "selected" : ""}`} key={item.id}><div className="schedule-card-top"><span className={`source-pill ${status.tone}`}>{status.label}</span><small>{stageLabel(item.stage, item.stage, copy, language)}</small></div><strong>{scheduleTeamLabel(item.home.code, copy)} <b>vs</b> {scheduleTeamLabel(item.away.code, copy)}</strong><span className="schedule-score">{typeof item.homeScore === "number" && typeof item.awayScore === "number" && item.status !== "scheduled" ? `${item.homeScore} - ${item.awayScore}` : "— : —"}</span><small>{item.kickoffIso ? formatKickoffLabel(item.kickoffIso, language) : copy.scheduled}</small>{hasMoments ? <div className="schedule-moments"><span>{copy.events} {item.eventCount}</span><span>{copy.goals} {item.goalCount ?? 0}</span><span>{copy.extraTime} {item.extraTime ? "✓" : "—"}</span></div> : null}<p>{scheduleNote(item, copy)}</p>{isReplay ? <button className="schedule-open" type="button" onClick={() => onOpenReplay(item.id)}>{copy.replay}<span>→</span></button> : null}</article>; }) : <p className="empty-state">{copy.noEvents}</p>}</div><div className="schedule-replay-links"><strong>{copy.replayLibrary}</strong>{replayMatches.slice(0, 3).map((candidate) => <button type="button" key={candidate.id} onClick={() => onOpenReplay(candidate.id)}>{candidate.home.code} vs {candidate.away.code}<span>→</span></button>)}</div></section>;
}

function scheduleNote(item: MatchScheduleItem, copy: UiCopy) {
  if (item.dataStatus === "Replay") return copy.replay;
  if (item.dataStatus === "Delay") return copy.delayed;
  if (item.status === "scheduled") return copy.scheduled;
  if (item.status === "finished") return copy.final;
  return copy.live;
}

function scheduleStatusLabel(item: MatchScheduleItem, copy: UiCopy) {
  if (item.dataStatus === "Replay") return { label: copy.replay, tone: "replay" };
  if (item.dataStatus === "Delay") return { label: copy.delayed, tone: "delay" };
  if (item.dataStatus === "Live") return { label: copy.live, tone: "live" };
  if (item.status === "finished") return { label: copy.final, tone: "replay" };
  return { label: copy.seed, tone: "seed" };
}

function GroupTable({ table, home, away, title }: { table: NonNullable<MatchData["groupTable"]>; home: string; away: string; title: string }) {
  return <div className="group-table" aria-label={title}><strong>{title}</strong>{table.map((standing) => <div className={`group-row ${standing.teamCode === home || standing.teamCode === away ? "focus" : ""}`} key={standing.teamCode}><span>{standing.teamCode}</span><span>{standing.played} GP</span><b>{standing.points} pts</b><small>{standing.status}</small></div>)}</div>;
}

function TeamProfile({ copy, team }: { copy: UiCopy; team: Team }) {
  return <article className="team-profile-card"><div className="profile-top"><span className="team-code" style={{ backgroundColor: team.color }}>{team.code}</span><div><h2>{teamName(team)}</h2><span>{team.group ?? "World Cup"}</span></div></div><dl><div><dt>{copy.coach}</dt><dd>{team.coach ?? "--"}</dd></div><div><dt>{copy.dataQuality}</dt><dd>{team.record ?? "Source profile"}</dd></div></dl><details open><summary>{copy.players}</summary><div className="player-stack">{(team.keyPlayers ?? []).map((player) => <div key={player.name}><strong>{player.name}</strong><span>{player.position} / {player.role}</span><p>{player.note}</p></div>)}</div></details></article>;
}

function SettingsDrawer({ copy, language, setLanguage, helperUrl, source, onRefresh, onResetPoints, onClose }: { copy: UiCopy; language: Language; setLanguage: (language: Language) => void; helperUrl: string; source: DataSourceState | null; onRefresh: () => void; onResetPoints: () => void; onClose: () => void }) {
  const ready = source?.kind === "live-ready";
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="settings-drawer" aria-label={copy.settings}><header><div><p className="overline">WORLD CUP LIVE PULSE</p><h2>{copy.settings}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label={copy.close}>×</button></header><section className="drawer-section"><label htmlFor="language-select">{copy.language}</label><select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languages.map((option) => <option key={option.code} value={option.code}>{option.label} · {option.region}</option>)}</select><p className="muted-copy">{copy.languageNote}</p></section><details className="drawer-section"><summary>{copy.dataConnection}</summary><p className="muted-copy">{copy.authDescription}</p><div className={`connection-status ${ready ? "ready" : "fallback"}`}><span className="status-dot" /><strong>{ready ? copy.connectionReady : copy.connectionFallback}</strong><small>{copy.localOnly}</small></div><div className="drawer-actions"><button className="primary-button" type="button" onClick={onRefresh}>{copy.refreshData}</button><a className="secondary-button" href={helperUrl} target="_blank" rel="noreferrer">{copy.openHelper}</a></div><p className="security-note">{copy.securityNote}</p></details><details className="drawer-section"><summary>{copy.testPoints}</summary><p className="muted-copy">{copy.pointsNote}</p><button className="secondary-button" type="button" onClick={onResetPoints}>{copy.resetPoints}</button></details><details className="drawer-section"><summary>{copy.advancedHidden}</summary><p className="muted-copy">{copy.onlyVerified}</p><p className="muted-copy">{copy.replaySnapshot}</p></details></aside></div>;
}

function minuteLabelForFrame(match: MatchData, minute: number, isFinal: boolean, copy: UiCopy) {
  if (isFinal) return copy.final;
  if (match.status === "scheduled") return copy.scheduled;
  return `${minute}'`;
}

function formatKickoffLabel(iso: string, language: Language) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
