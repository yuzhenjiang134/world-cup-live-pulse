import { useEffect, useMemo, useRef, useState } from "react";
import { replayMatches } from "./data/replayMatch";
import { demoSeasonHistory, demoSeasonSummary } from "./data/demoSeasonHistory";
import { officialVideoSources } from "./data/videoSources";
import { tournamentCopy } from "./data/tournamentCopy";
import { localizeTeamName } from "./data/teamNames";
import { txlineArchiveMatches } from "./data/txlineArchive";
import { getCommentaryVoiceClip } from "./data/commentaryVoiceClips";
import { getSpeechProfile, selectSpeechVoice } from "./lib/speechVoice";
import { PulsePlay } from "./components/PulsePlay";
import { FanStand } from "./components/FanStand";
import { fanStandCopy } from "./data/fanStandCopy";
import { canLockScorePick, emptyChallengeStats, getFanLevel, settleScorePick, updateChallengeStats } from "./lib/challenge";
import type { ChallengeStats } from "./lib/challenge";
import { buildPulseFrame } from "./lib/pulse";
import { downloadPredictionCard } from "./lib/shareCard";
import { loadMatchData } from "./lib/txlineAdapter";
import { localizeCommentary, localizeEventDescription, localizeInsight, localizeRecap, localizeScheduledBrief } from "./lib/localizedPulse";
import type { DataSourceState, MatchData, MatchEvent, MatchMode, MatchScheduleItem, PlayerProfile, Team } from "./types";

type Language = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";
type View = "match" | "tournament" | "teams";
type CommentaryMode = "call" | "why" | "recap";
type AlertPreferences = { goals: boolean; cards: boolean; final: boolean };
type HeroDisplay = "score" | "play";

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
  keyMoments: string;
  goals: string;
  wins: string;
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
  commentaryCall: string;
  commentaryWhy: string;
  commentaryRecap: string;
  schedule: string;
  advancement: string;
  scoreChallenge: string;
  versus: string;
  pointsUnit: string;
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
  spoilerFree: string;
  teams: string;
  players: string;
  matches: string;
  opponents: string;
  goalsForAgainst: string;
  sourceTeams: string;
  watch: string;
  officialWatch: string;
  officialUpdates: string;
  followMatch: string;
  unfollowMatch: string;
  favoriteTeam: string;
  removeFavoriteTeam: string;
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
    loading: "Loading the match",
    live: "Live",
    delayed: "Delayed",
    replay: "Replay",
    seed: "Upcoming",
    fallback: "Match coverage",
    verifiedAt: "Updated",
    officialFeed: "Official data",
    publicFeed: "Public scoreboard",
    replayFeed: "2026 match record",
    noLiveFeed: "No match is live right now",
    scorePulse: "Score pulse",
    matchCenter: "Match center",
    liveNow: "Live now",
    final: "Full time",
    scheduled: "Scheduled",
    events: "Match events",
    latest: "Latest moment",
    noEvents: "No match events yet.",
    keyMoments: "Key moments",
    goals: "Goals",
    wins: "Wins",
    yellow: "Yellow",
    red: "Red",
    extraTime: "ET / added time",
    fanPulse: "Match flow",
    dataQuality: "Status",
    officialOdds: "Official odds snapshot",
    derivedPulse: "Match momentum",
    replaySnapshot: "Match flow",
    next: "Coming up",
    summary: "Match summary",
    aiCommentary: "AI match brief",
    commentaryCall: "Live call",
    commentaryWhy: "Why it matters",
    commentaryRecap: "30-sec catch-up",
    schedule: "Schedule",
    advancement: "Stage and progression",
    scoreChallenge: "Score challenge",
    versus: "vs",
    pointsUnit: "pts",
    testPoints: "Challenge points",
    pointsNote: "Local-only points. No cash value, wallet, or betting.",
    currentPoints: "Current points",
    pickCost: "Pick cost",
    settlementRule: "Settles from the final score",
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
    waitingSettlement: "Settlement unlocks when the final score is available.",
    exact: "Exact score",
    result: "Result",
    noBetting: "Discussion game only. Never a wager or trading signal.",
    replayLibrary: "Replay library",
    chooseReplay: "Choose a match",
    spoilerFree: "Spoiler-free replay",
    teams: "Teams",
    players: "Player records",
    matches: "Matches",
    opponents: "Opponents",
    goalsForAgainst: "Goals for:against",
    sourceTeams: "Tournament teams",
    watch: "Watch / replay",
    officialWatch: "Open official source",
    officialUpdates: "Official updates",
    followMatch: "Follow this match",
    unfollowMatch: "Stop following",
    favoriteTeam: "Make this my team",
    removeFavoriteTeam: "Remove favorite team",
    archiveLink: "FIFA+ archive",
    highlightsLink: "FIFA+ highlights",
    noWatch: "Official FIFA+ archive and highlights are available when rights allow; timeline replay remains available.",
    resetPoints: "Reset local points",
    settings: "Settings",
    close: "Close",
    language: "Language",
    dataConnection: "Match data",
    authDescription: "Refresh the match or view its connection status here.",
    securityNote: "Private connection details stay on this device and are never included in the public site.",
    openHelper: "Manage data connection",
    localOnly: "Private connection",
    advancedHidden: "Data & privacy",
    connectionReady: "Match data is up to date",
    connectionFallback: "Showing verified replay data",
    refreshData: "Refresh match",
    languageNote: "The interface is translated; team and player names keep their official spelling.",
    dataRules: "Data and updates",
    onlyVerified: "Scores and key events come from confirmed match records.",
  },
  zh: {
    brandKicker: "以球迷为先的比赛情报",
    navMatch: "比赛中心",
    navLive: "实时比赛",
    navReplay: "赛程与回放",
    navTeams: "球队",
    navSettings: "设置",
    source: "比赛状态",
    refresh: "刷新",
    loading: "正在加载比赛",
    live: "实时",
    delayed: "延迟",
    replay: "回放",
    seed: "未开赛",
    fallback: "比赛动态",
    verifiedAt: "最近更新",
    officialFeed: "官方数据",
    publicFeed: "公开比分",
    replayFeed: "2026 比赛记录",
    noLiveFeed: "当前没有正在进行的比赛",
    scorePulse: "比分脉冲",
    matchCenter: "比赛中心",
    liveNow: "正在进行",
    final: "全场结束",
    scheduled: "未开赛",
    events: "比赛事件",
    latest: "最新动态",
    noEvents: "当前还没有比赛事件。",
    keyMoments: "关键事件",
    goals: "进球",
    wins: "胜场",
    yellow: "黄牌",
    red: "红牌",
    extraTime: "加时 / 补时",
    fanPulse: "比赛走势",
    dataQuality: "状态",
    officialOdds: "官方赔率快照",
    derivedPulse: "比赛走势",
    replaySnapshot: "比赛走势",
    next: "接下来",
    summary: "比赛摘要",
    aiCommentary: "AI 比赛解读",
    commentaryCall: "现场快报",
    commentaryWhy: "为什么重要",
    commentaryRecap: "30 秒补课",
    schedule: "赛程",
    advancement: "阶段与晋级",
    scoreChallenge: "比分挑战",
    versus: "对阵",
    pointsUnit: "积分",
    testPoints: "挑战积分",
    pointsNote: "仅本地积分，无现金价值，不连接钱包，不是下注。",
    currentPoints: "当前积分",
    pickCost: "本次消耗",
    settlementRule: "按最终比分结算",
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
    waitingSettlement: "最终比分公布后即可结算。",
    exact: "精确比分",
    result: "赛果",
    noBetting: "仅用于球迷讨论，不是下注或交易信号。",
    replayLibrary: "回放库",
    chooseReplay: "选择一场比赛",
    spoilerFree: "无剧透回放",
    teams: "球队",
    players: "球员记录",
    matches: "比赛",
    opponents: "对手",
    goalsForAgainst: "进球:失球",
    sourceTeams: "参赛球队",
    watch: "观看 / 回放",
    officialWatch: "打开官方来源",
    officialUpdates: "官方赛况",
    followMatch: "关注本场",
    unfollowMatch: "取消关注",
    favoriteTeam: "设为我关注的球队",
    removeFavoriteTeam: "取消关注球队",
    archiveLink: "FIFA+ 回放库",
    highlightsLink: "FIFA+ 集锦",
    noWatch: "官方 FIFA+ 回放和集锦入口会受地区与版权影响；时间线回放始终可用。",
    resetPoints: "重置本地积分",
    settings: "设置",
    close: "关闭",
    language: "语言",
    dataConnection: "比赛数据",
    authDescription: "在这里更新比赛，或查看数据是否已更新。",
    securityNote: "私密连接信息只保存在本设备，不会进入公开网站。",
    openHelper: "管理数据连接",
    localOnly: "私密连接",
    advancedHidden: "数据与隐私",
    connectionReady: "比赛数据已更新",
    connectionFallback: "正在显示已确认回放",
    refreshData: "更新比赛",
    languageNote: "界面标签会翻译；球队和球员名称保持数据源原名。",
    dataRules: "数据与更新",
    onlyVerified: "比分和关键事件来自已确认的比赛记录。",
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
    loading: "Cargando el partido",
    live: "En vivo",
    delayed: "Retrasado",
    replay: "Repetición",
    seed: "Calendario",
    fallback: "Cobertura del partido",
    verifiedAt: "Actualizado",
    officialFeed: "Datos oficiales",
    publicFeed: "Marcador público",
    replayFeed: "Registro de partidos 2026",
    noLiveFeed: "No hay un partido en directo ahora",
    scorePulse: "Pulso del marcador",
    matchCenter: "Centro del partido",
    liveNow: "Ahora",
    final: "Final",
    scheduled: "Programado",
    events: "Eventos",
    latest: "Último momento",
    noEvents: "Todavía no hay eventos del partido.",
    keyMoments: "Momentos clave",
    goals: "Goles",
    wins: "Victorias",
    yellow: "Amarillas",
    red: "Rojas",
    extraTime: "Prórroga / añadido",
    fanPulse: "Ritmo del partido",
    dataQuality: "Estado",
    officialOdds: "Cuotas oficiales",
    derivedPulse: "Ritmo del partido",
    replaySnapshot: "Ritmo del partido",
    next: "A continuación",
    summary: "Resumen del partido",
    aiCommentary: "Resumen del partido con IA",
    commentaryCall: "Relato en vivo",
    commentaryWhy: "Por qué importa",
    commentaryRecap: "Resumen en 30 s",
    schedule: "Calendario",
    advancement: "Fase y clasificación",
    scoreChallenge: "Reto de marcador",
    versus: "contra",
    pointsUnit: "pts",
    testPoints: "Puntos del reto",
    pointsNote: "Solo local. Sin valor monetario ni apuestas.",
    currentPoints: "Puntos actuales",
    pickCost: "Coste de la jugada",
    settlementRule: "Se resuelve con el marcador final",
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
    waitingSettlement: "Disponible cuando se publique el resultado final.",
    exact: "Marcador exacto",
    result: "Resultado",
    noBetting: "Juego de conversación, no apuesta ni señal de trading.",
    replayLibrary: "Biblioteca de repeticiones",
    chooseReplay: "Elegir un partido",
    spoilerFree: "Repetición sin spoilers",
    teams: "Equipos",
    players: "Registros de jugadores",
    matches: "Partidos",
    opponents: "Rivales",
    goalsForAgainst: "Goles a favor:en contra",
    sourceTeams: "Equipos del torneo",
    watch: "Ver / repetir",
    officialWatch: "Abrir fuente oficial",
    officialUpdates: "Actualizaciones oficiales",
    followMatch: "Seguir partido",
    unfollowMatch: "Dejar de seguir",
    favoriteTeam: "Marcar como mi equipo",
    removeFavoriteTeam: "Quitar equipo favorito",
    archiveLink: "Archivo FIFA+",
    highlightsLink: "Resúmenes FIFA+",
    noWatch: "El archivo y los resúmenes oficiales de FIFA+ dependen de territorio y derechos; la línea de tiempo sigue disponible.",
    resetPoints: "Restablecer puntos locales",
    settings: "Ajustes",
    close: "Cerrar",
    language: "Idioma",
    dataConnection: "Datos del partido",
    authDescription: "Actualiza el partido o revisa aquí su estado.",
    securityNote: "Los datos privados de conexión permanecen en este dispositivo y nunca se incluyen en el sitio público.",
    openHelper: "Gestionar conexión de datos",
    localOnly: "Conexión privada",
    advancedHidden: "Datos y privacidad",
    connectionReady: "Datos actualizados",
    connectionFallback: "Mostrando repetición verificada",
    refreshData: "Actualizar partido",
    languageNote: "Las etiquetas se traducen; nombres de equipos y jugadores siguen la fuente.",
    dataRules: "Datos y actualizaciones",
    onlyVerified: "Los marcadores y eventos clave proceden de registros confirmados.",
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
    loading: "Carregando a partida",
    live: "Ao vivo",
    delayed: "Atrasado",
    replay: "Reprise",
    seed: "Calendário",
    fallback: "Cobertura da partida",
    verifiedAt: "Atualizado",
    officialFeed: "Dados oficiais",
    publicFeed: "Placar público",
    replayFeed: "Registro de jogos de 2026",
    noLiveFeed: "Nenhum jogo ao vivo agora",
    scorePulse: "Pulso do placar",
    matchCenter: "Central da partida",
    liveNow: "Agora",
    final: "Final",
    scheduled: "Agendado",
    events: "Eventos",
    latest: "Último momento",
    noEvents: "Ainda não há eventos da partida.",
    keyMoments: "Momentos-chave",
    goals: "Gols",
    wins: "Vitórias",
    yellow: "Amarelos",
    red: "Vermelhos",
    extraTime: "Prorrogação / acréscimos",
    fanPulse: "Ritmo do jogo",
    dataQuality: "Estado",
    officialOdds: "Odds oficiais",
    derivedPulse: "Ritmo do jogo",
    replaySnapshot: "Ritmo do jogo",
    next: "A seguir",
    summary: "Resumo da partida",
    aiCommentary: "Resumo da partida com IA",
    commentaryCall: "Narração ao vivo",
    commentaryWhy: "Por que importa",
    commentaryRecap: "Resumo em 30 s",
    schedule: "Calendário",
    advancement: "Fase e classificação",
    scoreChallenge: "Desafio de placar",
    versus: "contra",
    pointsUnit: "pts",
    testPoints: "Pontos do desafio",
    pointsNote: "Somente local. Sem valor em dinheiro ou apostas.",
    currentPoints: "Pontos atuais",
    pickCost: "Custo da escolha",
    settlementRule: "Resolvido pelo placar final",
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
    waitingSettlement: "Disponível quando o placar final for publicado.",
    exact: "Placar exato",
    result: "Resultado",
    noBetting: "Jogo de conversa, não aposta nem sinal de trading.",
    replayLibrary: "Biblioteca de reprises",
    chooseReplay: "Escolher uma partida",
    spoilerFree: "Reprise sem spoilers",
    teams: "Times",
    players: "Registros de jogadores",
    matches: "Jogos",
    opponents: "Adversários",
    goalsForAgainst: "Gols pró:contra",
    sourceTeams: "Equipes do torneio",
    watch: "Assistir / reprise",
    officialWatch: "Abrir fonte oficial",
    officialUpdates: "Atualizações oficiais",
    followMatch: "Seguir partida",
    unfollowMatch: "Deixar de seguir",
    favoriteTeam: "Definir como meu time",
    removeFavoriteTeam: "Remover time favorito",
    archiveLink: "Arquivo FIFA+",
    highlightsLink: "Destaques FIFA+",
    noWatch: "O arquivo e os destaques oficiais do FIFA+ dependem do território e dos direitos; a linha do tempo continua disponível.",
    resetPoints: "Redefinir pontos locais",
    settings: "Configurações",
    close: "Fechar",
    language: "Idioma",
    dataConnection: "Dados do jogo",
    authDescription: "Atualize o jogo ou confira aqui o estado dos dados.",
    securityNote: "Os dados privados de conexão ficam neste dispositivo e nunca entram no site público.",
    openHelper: "Gerenciar conexão de dados",
    localOnly: "Conexão privada",
    advancedHidden: "Dados e privacidade",
    connectionReady: "Dados atualizados",
    connectionFallback: "Exibindo replay verificado",
    refreshData: "Atualizar jogo",
    languageNote: "Os rótulos são traduzidos; nomes seguem a fonte original.",
    dataRules: "Dados e atualizações",
    onlyVerified: "Placares e eventos principais vêm de registros confirmados.",
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
    loading: "Chargement du match",
    live: "Direct",
    delayed: "Retardé",
    replay: "Replay",
    seed: "Calendrier",
    fallback: "Couverture du match",
    verifiedAt: "Actualisé",
    officialFeed: "Données officielles",
    publicFeed: "Score public",
    replayFeed: "Historique des matchs 2026",
    noLiveFeed: "Aucun match en direct maintenant",
    scorePulse: "Pouls du score",
    matchCenter: "Centre du match",
    liveNow: "En cours",
    final: "Fin du match",
    scheduled: "Programmé",
    events: "Événements",
    latest: "Dernier moment",
    noEvents: "Aucun événement de match pour le moment.",
    keyMoments: "Moments clés",
    goals: "Buts",
    wins: "Victoires",
    yellow: "Jaunes",
    red: "Rouges",
    extraTime: "Prolongation / arrêts",
    fanPulse: "Rythme du match",
    dataQuality: "État",
    officialOdds: "Cotes officielles",
    derivedPulse: "Rythme du match",
    replaySnapshot: "Rythme du match",
    next: "À suivre",
    summary: "Résumé du match",
    aiCommentary: "Résumé du match par IA",
    commentaryCall: "Direct",
    commentaryWhy: "Pourquoi c'est important",
    commentaryRecap: "Récap en 30 s",
    schedule: "Calendrier",
    advancement: "Phase et qualification",
    scoreChallenge: "Défi de score",
    versus: "contre",
    pointsUnit: "pts",
    testPoints: "Points du défi",
    pointsNote: "Local uniquement. Sans valeur monétaire ni pari.",
    currentPoints: "Points actuels",
    pickCost: "Coût du choix",
    settlementRule: "Réglé selon le score final",
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
    waitingSettlement: "Disponible dès la publication du score final.",
    exact: "Score exact",
    result: "Résultat",
    noBetting: "Jeu de discussion, pas un pari ni un signal de trading.",
    replayLibrary: "Bibliothèque replay",
    chooseReplay: "Choisir un match",
    spoilerFree: "Replay sans spoiler",
    teams: "Équipes",
    players: "Fiches joueurs",
    matches: "Matchs",
    opponents: "Adversaires",
    goalsForAgainst: "Buts pour:contre",
    sourceTeams: "Équipes du tournoi",
    watch: "Regarder / replay",
    officialWatch: "Ouvrir la source officielle",
    officialUpdates: "Actualités officielles",
    followMatch: "Suivre le match",
    unfollowMatch: "Ne plus suivre",
    favoriteTeam: "Définir comme mon équipe",
    removeFavoriteTeam: "Retirer l'équipe favorite",
    archiveLink: "Archives FIFA+",
    highlightsLink: "Temps forts FIFA+",
    noWatch: "Les archives et temps forts officiels de FIFA+ dépendent du territoire et des droits; la timeline reste disponible.",
    resetPoints: "Réinitialiser les points locaux",
    settings: "Réglages",
    close: "Fermer",
    language: "Langue",
    dataConnection: "Données du match",
    authDescription: "Actualisez le match ou vérifiez son état ici.",
    securityNote: "Les données de connexion privées restent sur cet appareil et ne sont jamais incluses dans le site public.",
    openHelper: "Gérer la connexion des données",
    localOnly: "Connexion privée",
    advancedHidden: "Données et confidentialité",
    connectionReady: "Données à jour",
    connectionFallback: "Replay vérifié affiché",
    refreshData: "Actualiser le match",
    languageNote: "Les libellés sont traduits; les noms suivent la source.",
    dataRules: "Données et actualisations",
    onlyVerified: "Scores et moments clés proviennent de comptes rendus confirmés.",
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
    loading: "Spiel wird geladen",
    live: "Live",
    delayed: "Verzögert",
    replay: "Wiederholung",
    seed: "Spielplan",
    fallback: "Spielübersicht",
    verifiedAt: "Aktualisiert",
    officialFeed: "Offizielle Daten",
    publicFeed: "Öffentliche Anzeige",
    replayFeed: "Spielprotokoll 2026",
    noLiveFeed: "Aktuell läuft kein Spiel",
    scorePulse: "Torpuls",
    matchCenter: "Spielzentrum",
    liveNow: "Jetzt",
    final: "Abpfiff",
    scheduled: "Geplant",
    events: "Ereignisse",
    latest: "Letzter Moment",
    noEvents: "Noch keine Spielereignisse.",
    keyMoments: "Schlüsselmomente",
    goals: "Tore",
    wins: "Siege",
    yellow: "Gelb",
    red: "Rot",
    extraTime: "Verlängerung / Nachspielzeit",
    fanPulse: "Spieldynamik",
    dataQuality: "Status",
    officialOdds: "Offizielle Quoten",
    derivedPulse: "Spieldynamik",
    replaySnapshot: "Spieldynamik",
    next: "Als Nächstes",
    summary: "Spielzusammenfassung",
    aiCommentary: "KI-Spielanalyse",
    commentaryCall: "Live-Bericht",
    commentaryWhy: "Warum es zählt",
    commentaryRecap: "30-Sekunden-Rückblick",
    schedule: "Spielplan",
    advancement: "Phase und Weiterkommen",
    scoreChallenge: "Tippspiel für Fans",
    versus: "gegen",
    pointsUnit: "Pkt.",
    testPoints: "Challenge-Punkte",
    pointsNote: "Nur lokal. Kein Geldwert und keine Wette.",
    currentPoints: "Aktuelle Punkte",
    pickCost: "Tippkosten",
    settlementRule: "Auswertung nach dem Endstand",
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
    waitingSettlement: "Nach Veröffentlichung des Endstands verfügbar.",
    exact: "Exakter Stand",
    result: "Ergebnis",
    noBetting: "Diskussionsspiel, keine Wette oder Trading-Signal.",
    replayLibrary: "Replay-Bibliothek",
    chooseReplay: "Spiel auswählen",
    spoilerFree: "Spoilerfreies Replay",
    teams: "Teams",
    players: "Spieleraufzeichnungen",
    matches: "Spiele",
    opponents: "Gegner",
    goalsForAgainst: "Tore:Gegentore",
    sourceTeams: "Turnierteams",
    watch: "Ansehen / Replay",
    officialWatch: "Offizielle Quelle öffnen",
    officialUpdates: "Offizielle Updates",
    followMatch: "Spiel folgen",
    unfollowMatch: "Nicht mehr folgen",
    favoriteTeam: "Als mein Team festlegen",
    removeFavoriteTeam: "Favorit entfernen",
    archiveLink: "FIFA+ Archiv",
    highlightsLink: "FIFA+ Highlights",
    noWatch: "Offizielle FIFA+ Archive und Highlights hängen von Gebiet und Rechten ab; die Timeline bleibt verfügbar.",
    resetPoints: "Lokale Punkte zurücksetzen",
    settings: "Einstellungen",
    close: "Schließen",
    language: "Sprache",
    dataConnection: "Spieldaten",
    authDescription: "Spiel aktualisieren oder Datenstatus prüfen.",
    securityNote: "Private Verbindungsdaten bleiben auf diesem Gerät und werden nie Teil der öffentlichen Website.",
    openHelper: "Datenverbindung verwalten",
    localOnly: "Private Verbindung",
    advancedHidden: "Daten & Datenschutz",
    connectionReady: "Spieldaten sind aktuell",
    connectionFallback: "Verifiziertes Replay wird gezeigt",
    refreshData: "Spiel aktualisieren",
    languageNote: "Labels werden übersetzt; Namen folgen der Quelle.",
    dataRules: "Daten und Aktualisierungen",
    onlyVerified: "Spielstände und Schlüsselmomente stammen aus bestätigten Spielberichten.",
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
    loading: "試合を読み込み中",
    live: "ライブ",
    delayed: "遅延",
    replay: "リプレイ",
    seed: "予定",
    fallback: "試合情報",
    verifiedAt: "最終更新",
    officialFeed: "公式データ",
    publicFeed: "公開スコア",
    replayFeed: "2026年試合記録",
    noLiveFeed: "現在ライブ中の試合はありません",
    scorePulse: "スコアパルス",
    matchCenter: "試合センター",
    liveNow: "進行中",
    final: "試合終了",
    scheduled: "予定",
    events: "試合イベント",
    latest: "最新の瞬間",
    noEvents: "まだ試合イベントはありません。",
    keyMoments: "重要イベント",
    goals: "ゴール",
    wins: "勝利",
    yellow: "イエロー",
    red: "レッド",
    extraTime: "延長 / アディショナル",
    fanPulse: "試合の流れ",
    dataQuality: "状況",
    officialOdds: "公式オッズ",
    derivedPulse: "試合の流れ",
    replaySnapshot: "試合の流れ",
    next: "次に見る",
    summary: "試合概要",
    aiCommentary: "AI試合解説",
    commentaryCall: "ライブ速報",
    commentaryWhy: "重要な理由",
    commentaryRecap: "30秒まとめ",
    schedule: "日程",
    advancement: "ステージと進出",
    scoreChallenge: "ファンスコアチャレンジ",
    versus: "対",
    pointsUnit: "点",
    testPoints: "チャレンジポイント",
    pointsNote: "ローカル専用。金銭価値・賭けなし。",
    currentPoints: "現在のポイント",
    pickCost: "予想コスト",
    settlementRule: "最終スコアで判定",
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
    waitingSettlement: "最終スコアの発表後に利用できます。",
    exact: "完全一致",
    result: "結果",
    noBetting: "会話型ゲームです。賭けや取引シグナルではありません。",
    replayLibrary: "リプレイライブラリ",
    chooseReplay: "試合を選ぶ",
    spoilerFree: "ネタバレなし再生",
    teams: "チーム",
    players: "選手記録",
    matches: "試合",
    opponents: "対戦相手",
    goalsForAgainst: "得点:失点",
    sourceTeams: "大会参加チーム",
    watch: "視聴 / リプレイ",
    officialWatch: "公式ソースを開く",
    officialUpdates: "公式アップデート",
    followMatch: "試合をフォロー",
    unfollowMatch: "フォロー解除",
    favoriteTeam: "お気に入りチームに設定",
    removeFavoriteTeam: "お気に入りを解除",
    archiveLink: "FIFA+ アーカイブ",
    highlightsLink: "FIFA+ ハイライト",
    noWatch: "FIFA+公式アーカイブとハイライトは地域・権利により異なります。タイムラインは利用できます。",
    resetPoints: "ローカルポイントをリセット",
    settings: "設定",
    close: "閉じる",
    language: "言語",
    dataConnection: "試合データ",
    authDescription: "試合の更新とデータ状況を確認できます。",
    securityNote: "非公開の接続情報はこの端末だけに保存され、公開サイトには含まれません。",
    openHelper: "データ接続を管理",
    localOnly: "非公開接続",
    advancedHidden: "データとプライバシー",
    connectionReady: "試合データは最新です",
    connectionFallback: "確認済みリプレイを表示中",
    refreshData: "試合を更新",
    languageNote: "UIラベルは翻訳し、チーム名・選手名はソース名を維持します。",
    dataRules: "データと更新",
    onlyVerified: "スコアと重要イベントは確認済みの試合記録に基づきます。",
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
    loading: "جار تحميل المباراة",
    live: "مباشر",
    delayed: "متأخر",
    replay: "إعادة",
    seed: "الجدول",
    fallback: "تغطية المباراة",
    verifiedAt: "آخر تحديث",
    officialFeed: "بيانات رسمية",
    publicFeed: "نتيجة عامة",
    replayFeed: "سجل مباريات 2026",
    noLiveFeed: "لا توجد مباراة مباشرة الآن",
    scorePulse: "نبض النتيجة",
    matchCenter: "مركز المباراة",
    liveNow: "الآن",
    final: "النهاية",
    scheduled: "مجدولة",
    events: "أحداث المباراة",
    latest: "آخر لحظة",
    noEvents: "لا توجد أحداث للمباراة حتى الآن.",
    keyMoments: "اللحظات المهمة",
    goals: "أهداف",
    wins: "انتصارات",
    yellow: "بطاقات صفراء",
    red: "بطاقات حمراء",
    extraTime: "وقت إضافي",
    fanPulse: "إيقاع المباراة",
    dataQuality: "الحالة",
    officialOdds: "أسعار رسمية",
    derivedPulse: "إيقاع المباراة",
    replaySnapshot: "إيقاع المباراة",
    next: "التالي",
    summary: "ملخص المباراة",
    aiCommentary: "ملخص المباراة بالذكاء الاصطناعي",
    commentaryCall: "تعليق مباشر",
    commentaryWhy: "لماذا يهم",
    commentaryRecap: "ملخص 30 ثانية",
    schedule: "الجدول",
    advancement: "المرحلة والتأهل",
    scoreChallenge: "تحدي نتيجة المشجع",
    versus: "ضد",
    pointsUnit: "نقطة",
    testPoints: "نقاط التحدي",
    pointsNote: "محلية فقط. بلا قيمة نقدية أو مراهنة.",
    currentPoints: "النقاط الحالية",
    pickCost: "تكلفة الاختيار",
    settlementRule: "تُحسم بالنتيجة النهائية",
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
    waitingSettlement: "تتوفر بعد إعلان النتيجة النهائية.",
    exact: "نتيجة دقيقة",
    result: "النتيجة",
    noBetting: "لعبة نقاش فقط، وليست مراهنة أو إشارة تداول.",
    replayLibrary: "مكتبة الإعادة",
    chooseReplay: "اختر مباراة",
    spoilerFree: "إعادة بلا حرق للنتيجة",
    teams: "الفرق",
    players: "سجلات اللاعبين",
    matches: "مباريات",
    opponents: "الخصوم",
    goalsForAgainst: "أهداف له:عليه",
    sourceTeams: "فرق البطولة",
    watch: "مشاهدة / إعادة",
    officialWatch: "فتح المصدر الرسمي",
    officialUpdates: "التحديثات الرسمية",
    followMatch: "متابعة المباراة",
    unfollowMatch: "إلغاء المتابعة",
    favoriteTeam: "تعيين كفريقي",
    removeFavoriteTeam: "إزالة الفريق المفضل",
    archiveLink: "أرشيف FIFA+",
    highlightsLink: "ملخصات FIFA+",
    noWatch: "يتوفر أرشيف وملخصات FIFA+ الرسمية حسب المنطقة والحقوق؛ الخط الزمني متاح دائمًا.",
    resetPoints: "إعادة ضبط النقاط المحلية",
    settings: "الإعدادات",
    close: "إغلاق",
    language: "اللغة",
    dataConnection: "بيانات المباراة",
    authDescription: "حدّث المباراة أو تحقق من حالة البيانات هنا.",
    securityNote: "تبقى بيانات الاتصال الخاصة على هذا الجهاز ولا تُضمّن في الموقع العام.",
    openHelper: "إدارة اتصال البيانات",
    localOnly: "اتصال خاص",
    advancedHidden: "البيانات والخصوصية",
    connectionReady: "بيانات المباراة محدثة",
    connectionFallback: "عرض إعادة موثقة",
    refreshData: "تحديث المباراة",
    languageNote: "تترجم العناوين، بينما تبقى أسماء الفرق واللاعبين من المصدر.",
    dataRules: "البيانات والتحديثات",
    onlyVerified: "النتائج واللحظات الرئيسية مأخوذة من سجلات مباريات مؤكدة.",
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

const alertPreferenceCopy: Record<Language, { title: string; note: string; goals: string; cards: string; final: string }> = {
  en: { title: "Match alerts", note: "Choose which moments matter to you. Browser alerts work while this page is open.", goals: "Goals", cards: "Red and yellow cards", final: "Full-time result" },
  zh: { title: "比赛提醒", note: "选择你最关心的比赛时刻。页面保持打开时可接收浏览器提醒。", goals: "进球", cards: "红牌与黄牌", final: "完场结果" },
  es: { title: "Alertas del partido", note: "Elige los momentos que te interesan. Las alertas funcionan mientras la página esté abierta.", goals: "Goles", cards: "Tarjetas rojas y amarillas", final: "Resultado final" },
  pt: { title: "Alertas da partida", note: "Escolha os momentos que mais importam. Os alertas funcionam enquanto a página estiver aberta.", goals: "Gols", cards: "Cartões vermelhos e amarelos", final: "Resultado final" },
  fr: { title: "Alertes du match", note: "Choisissez les moments qui vous intéressent. Les alertes fonctionnent tant que cette page reste ouverte.", goals: "Buts", cards: "Cartons rouges et jaunes", final: "Résultat final" },
  de: { title: "Spielbenachrichtigungen", note: "Wähle die Spielmomente, die dir wichtig sind. Browser-Hinweise funktionieren, solange diese Seite geöffnet ist.", goals: "Tore", cards: "Rote und gelbe Karten", final: "Endergebnis" },
  ja: { title: "試合アラート", note: "気になる試合の瞬間を選べます。このページを開いている間にブラウザー通知を受け取れます。", goals: "ゴール", cards: "レッドカードとイエローカード", final: "試合終了結果" },
  ar: { title: "تنبيهات المباراة", note: "اختر اللحظات التي تهمك. تعمل تنبيهات المتصفح ما دامت هذه الصفحة مفتوحة.", goals: "الأهداف", cards: "البطاقات الحمراء والصفراء", final: "النتيجة النهائية" },
};

const commentaryAudioCopy: Record<Language, { autoOn: string; autoOff: string; rewards: string }> = {
  en: { autoOn: "Auto commentary on", autoOff: "Auto commentary", rewards: "Points you can earn" },
  zh: { autoOn: "自动播报已开启", autoOff: "自动播报", rewards: "本场可赢积分" },
  es: { autoOn: "Narración automática activa", autoOff: "Narración automática", rewards: "Puntos que puedes ganar" },
  pt: { autoOn: "Narração automática ativa", autoOff: "Narração automática", rewards: "Pontos que você pode ganhar" },
  fr: { autoOn: "Commentaire auto activé", autoOff: "Commentaire automatique", rewards: "Points à gagner" },
  de: { autoOn: "Auto-Kommentar aktiv", autoOff: "Auto-Kommentar", rewards: "Mögliche Punkte" },
  ja: { autoOn: "自動実況オン", autoOff: "自動実況", rewards: "獲得できるポイント" },
  ar: { autoOn: "التعليق التلقائي مفعّل", autoOff: "التعليق التلقائي", rewards: "النقاط التي يمكنك كسبها" },
};

const pulsePlayCopy: Record<Language, { scoreView: string; playView: string; title: string; liveMoment: string; ready: string; penalty: string; extraTime: string; cheer: string; localCheers: string; localOnly: string; liveSync: string; delayedSync: string; scheduledSync: string; replaySync: string; illustrative: string; onPitch: string; confirmedMoment: string; matchStory: string }> = {
  en: { scoreView: "Score", playView: "Pulse Play", title: "Pulse Play", liveMoment: "On the pitch", ready: "Ready for kickoff", penalty: "Penalty", extraTime: "Added time", cheer: "Cheer for", localCheers: "Your match cheers", localOnly: "Saved on this device", liveSync: "Live moment", delayedSync: "Update pending", scheduledSync: "Pre-match preview", replaySync: "Replay moment", illustrative: "The event, score and cards follow the match record; animated positions and shirt numbers are illustrative.", onPitch: "on pitch", confirmedMoment: "Player involved", matchStory: "Match story" },
  zh: { scoreView: "比分", playView: "比赛剧场", title: "比赛剧场", liveMoment: "场上动态", ready: "等待开赛", penalty: "点球", extraTime: "补时", cheer: "为球队加油", localCheers: "我的助威", localOnly: "仅保存在本设备", liveSync: "实时动态", delayedSync: "稍后更新", scheduledSync: "赛前预览", replaySync: "回放时刻", illustrative: "事件、比分和罚牌来自比赛记录；动画位置与号码仅用于呈现场面。", onPitch: "人在场", confirmedMoment: "本次事件球员", matchStory: "比赛故事线" },
  es: { scoreView: "Marcador", playView: "Pulso en juego", title: "Pulso en juego", liveMoment: "En el campo", ready: "Listos para el inicio", penalty: "Penalti", extraTime: "Tiempo añadido", cheer: "Animar a", localCheers: "Tus ánimos", localOnly: "Guardado en este dispositivo", liveSync: "Momento en vivo", delayedSync: "Actualización pendiente", scheduledSync: "Vista previa", replaySync: "Momento de repetición", illustrative: "El evento, el marcador y las tarjetas siguen el acta; las posiciones y dorsales animados son ilustrativos.", onPitch: "en campo", confirmedMoment: "Jugador implicado", matchStory: "Historia del partido" },
  pt: { scoreView: "Placar", playView: "Pulso em jogo", title: "Pulso em jogo", liveMoment: "Em campo", ready: "Pronto para o início", penalty: "Pênalti", extraTime: "Acréscimos", cheer: "Torcer por", localCheers: "Sua torcida", localOnly: "Salvo neste dispositivo", liveSync: "Momento ao vivo", delayedSync: "Atualização pendente", scheduledSync: "Prévia da partida", replaySync: "Momento do replay", illustrative: "Evento, placar e cartões seguem o registro da partida; posições e números animados são ilustrativos.", onPitch: "em campo", confirmedMoment: "Jogador envolvido", matchStory: "História da partida" },
  fr: { scoreView: "Score", playView: "Pouls du match", title: "Pouls du match", liveMoment: "Sur le terrain", ready: "Prêt pour le coup d'envoi", penalty: "Penalty", extraTime: "Temps additionnel", cheer: "Encourager", localCheers: "Vos encouragements", localOnly: "Enregistré sur cet appareil", liveSync: "Moment en direct", delayedSync: "Mise à jour en attente", scheduledSync: "Aperçu avant-match", replaySync: "Moment du replay", illustrative: "L'événement, le score et les cartons suivent le compte rendu; positions et numéros animés sont illustratifs.", onPitch: "sur le terrain", confirmedMoment: "Joueur impliqué", matchStory: "Fil du match" },
  de: { scoreView: "Spielstand", playView: "Spielimpuls", title: "Spielimpuls", liveMoment: "Auf dem Platz", ready: "Bereit zum Anpfiff", penalty: "Elfmeter", extraTime: "Nachspielzeit", cheer: "Anfeuern", localCheers: "Dein Jubel", localOnly: "Auf diesem Gerät gespeichert", liveSync: "Live-Moment", delayedSync: "Update ausstehend", scheduledSync: "Spielvorschau", replaySync: "Replay-Moment", illustrative: "Ereignis, Spielstand und Karten folgen dem Spielbericht; animierte Positionen und Nummern sind illustrativ.", onPitch: "auf dem Platz", confirmedMoment: "Beteiligter Spieler", matchStory: "Spielverlauf" },
  ja: { scoreView: "スコア", playView: "パルスプレイ", title: "パルスプレイ", liveMoment: "ピッチ上", ready: "キックオフ待機", penalty: "ペナルティーキック", extraTime: "アディショナルタイム", cheer: "応援する", localCheers: "あなたの応援", localOnly: "この端末だけに保存", liveSync: "ライブ場面", delayedSync: "更新待ち", scheduledSync: "試合前プレビュー", replaySync: "リプレイ場面", illustrative: "試合イベントに合わせて場面を再現します。位置と背番号は演出です。", onPitch: "人出場", confirmedMoment: "関与した選手", matchStory: "試合の流れ" },
  ar: { scoreView: "النتيجة", playView: "نبض الملعب", title: "نبض الملعب", liveMoment: "على أرض الملعب", ready: "جاهزون للبداية", penalty: "ركلة جزاء", extraTime: "وقت بدل ضائع", cheer: "شجع", localCheers: "تشجيعك", localOnly: "محفوظ على هذا الجهاز", liveSync: "لحظة مباشرة", delayedSync: "التحديث قادم", scheduledSync: "معاينة قبل المباراة", replaySync: "لحظة إعادة", illustrative: "الحدث والنتيجة والبطاقات تتبع سجل المباراة؛ المواقع والأرقام المتحركة توضيحية.", onPitch: "في الملعب", confirmedMoment: "اللاعب المعني", matchStory: "قصة المباراة" },
};

const challengeEditCopy: Record<Language, { edit: string; save: string; note: string; updated: string }> = {
  en: { edit: "Edit score", save: "Save changes", note: "One entry per match. Edit until kickoff; changes cost no extra points.", updated: "Pick updated" },
  zh: { edit: "修改比分", save: "保存修改", note: "每场一条预测。开赛前可修改，修改不重复扣分。", updated: "预测已更新" },
  es: { edit: "Editar marcador", save: "Guardar cambios", note: "Una entrada por partido. Puedes editar hasta el inicio sin gastar más puntos.", updated: "Pronóstico actualizado" },
  pt: { edit: "Editar placar", save: "Salvar alterações", note: "Um palpite por partida. Edite até o início sem gastar mais pontos.", updated: "Palpite atualizado" },
  fr: { edit: "Modifier le score", save: "Enregistrer", note: "Un pronostic par match. Modifiable jusqu'au coup d'envoi sans coût supplémentaire.", updated: "Pronostic mis à jour" },
  de: { edit: "Tipp ändern", save: "Änderungen speichern", note: "Ein Tipp pro Spiel. Bis zum Anpfiff ohne weitere Punktkosten änderbar.", updated: "Tipp aktualisiert" },
  ja: { edit: "予想を変更", save: "変更を保存", note: "1試合につき1件。キックオフまで追加ポイントなしで変更できます。", updated: "予想を更新しました" },
  ar: { edit: "تعديل النتيجة", save: "حفظ التعديل", note: "توقع واحد لكل مباراة. يمكن تعديله حتى البداية دون خصم نقاط إضافية.", updated: "تم تحديث التوقع" },
};

const challengeLedgerCopy: Record<Language, { entry: string; reward: string; net: string }> = {
  en: { entry: "Entry cost", reward: "Reward", net: "Net change" },
  zh: { entry: "参赛消耗", reward: "结算奖励", net: "本场净变化" },
  es: { entry: "Coste de entrada", reward: "Recompensa", net: "Cambio neto" },
  pt: { entry: "Custo de entrada", reward: "Recompensa", net: "Variação líquida" },
  fr: { entry: "Coût d'entrée", reward: "Récompense", net: "Variation nette" },
  de: { entry: "Teilnahmekosten", reward: "Belohnung", net: "Nettoänderung" },
  ja: { entry: "参加コスト", reward: "獲得ポイント", net: "増減" },
  ar: { entry: "تكلفة المشاركة", reward: "المكافأة", net: "صافي التغيير" },
};

const standingStatusCopy: Record<Language, Record<string, string>> = {
  en: { "Top seed path": "Group winner", Qualified: "Qualified", Eliminated: "Eliminated" },
  zh: { "Top seed path": "小组第一", Qualified: "晋级", Eliminated: "出局" },
  es: { "Top seed path": "Ganador del grupo", Qualified: "Clasificado", Eliminated: "Eliminado" },
  pt: { "Top seed path": "Vencedor do grupo", Qualified: "Classificado", Eliminated: "Eliminado" },
  fr: { "Top seed path": "Vainqueur du groupe", Qualified: "Qualifié", Eliminated: "Éliminé" },
  de: { "Top seed path": "Gruppensieger", Qualified: "Qualifiziert", Eliminated: "Ausgeschieden" },
  ja: { "Top seed path": "グループ首位", Qualified: "突破", Eliminated: "敗退" },
  ar: { "Top seed path": "متصدر المجموعة", Qualified: "متأهل", Eliminated: "خرج" },
};

const playerFactCopy: Record<Language, { cards: string; substitutions: string; minutes: string }> = {
  en: { cards: "Cards", substitutions: "Substitutions", minutes: "Minutes" },
  zh: { cards: "牌", substitutions: "换人参与", minutes: "事件分钟" },
  es: { cards: "Tarjetas", substitutions: "Cambios", minutes: "Minutos" },
  pt: { cards: "Cartões", substitutions: "Substituições", minutes: "Minutos" },
  fr: { cards: "Cartons", substitutions: "Remplacements", minutes: "Minutes" },
  de: { cards: "Karten", substitutions: "Wechsel", minutes: "Minuten" },
  ja: { cards: "カード", substitutions: "交代", minutes: "記録分" },
  ar: { cards: "بطاقات", substitutions: "تبديلات", minutes: "الدقائق" },
};

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
  updatedAtIso?: string;
  revisionCount?: number;
  settledAtIso?: string;
  finalHomeScore?: number;
  finalAwayScore?: number;
  award?: number;
  entryCost?: number;
  netChange?: number;
  balanceAfterEntry?: number;
  sourceKind?: DataSourceState["kind"];
  sourceCheckedAtIso?: string;
};

const pickLedgerKey = "wclp-pick-ledger-v1";
const pointsVersion = "v5";
const alertPreferencesKey = "wclp-alert-preferences";
const defaultAlertPreferences: AlertPreferences = { goals: true, cards: true, final: true };

function readAlertPreferences(): AlertPreferences {
  if (typeof window === "undefined") return defaultAlertPreferences;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(alertPreferencesKey) ?? "null") as Partial<AlertPreferences> | null;
    return parsed
      ? { goals: parsed.goals !== false, cards: parsed.cards !== false, final: parsed.final !== false }
      : defaultAlertPreferences;
  } catch {
    return defaultAlertPreferences;
  }
}

function alertEnabledForEvent(event: MatchEvent, preferences: AlertPreferences) {
  if (event.type === "goal") return preferences.goals;
  if (event.type === "yellow_card" || event.type === "red_card") return preferences.cards;
  if (event.type === "fulltime") return preferences.final;
  return false;
}

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
      updatedAtIso: parsed.updatedAtIso,
      revisionCount: Math.max(0, Math.round(parsed.revisionCount ?? 0)),
      settledAtIso: parsed.settledAtIso,
      finalHomeScore: parsed.finalHomeScore,
      finalAwayScore: parsed.finalAwayScore,
      award: parsed.award,
      entryCost: Number.isFinite(parsed.entryCost) ? Math.max(0, Math.round(Number(parsed.entryCost))) : undefined,
      netChange: Number.isFinite(parsed.netChange) ? Math.round(Number(parsed.netChange)) : undefined,
      balanceAfterEntry: Number.isFinite(parsed.balanceAfterEntry) ? Math.max(0, Math.round(Number(parsed.balanceAfterEntry))) : undefined,
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
  const rawStored = window.localStorage.getItem("wclp-test-points");
  const stored = rawStored === null || rawStored.trim() === "" ? Number.NaN : Number(rawStored);
  if (Number.isFinite(stored) && stored >= 0) {
    window.localStorage.setItem("wclp-points-version", pointsVersion);
    return Math.round(stored);
  }
  window.localStorage.setItem("wclp-points-version", pointsVersion);
  window.localStorage.setItem("wclp-test-points", "1000");
  return 1000;
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
  if (event.type === "kickoff") return "Kickoff";
  if (event.type === "goal") return copy.goals;
  if (event.type === "yellow_card") return copy.yellow;
  if (event.type === "red_card") return copy.red;
  if (event.type === "fulltime") return copy.final;
  if (event.type === "halftime") return "Half-time";
  if (event.type === "substitution") return "Substitution";
  if (event.type === "odds_shift") return "Momentum shift";
  if (event.type === "score_update") return "Score update";
  return "Play continues";
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
    if (language === "zh") return "场面升温";
    if (language === "es") return "Sube la intensidad";
    if (language === "pt") return "Jogo esquenta";
    if (language === "fr") return "Le rythme monte";
    if (language === "de") return "Das Spiel wird intensiver";
    if (language === "ja") return "試合がヒートアップ";
    if (language === "ar") return "ارتفاع إيقاع المباراة";
  }
  if (event.type === "score_update" || event.type === "kickoff") {
    if (language === "zh") return event.type === "kickoff" ? "开赛" : "比分更新";
    if (language === "es") return event.type === "kickoff" ? "Inicio" : "Marcador actualizado";
    if (language === "pt") return event.type === "kickoff" ? "Início" : "Placar atualizado";
    if (language === "fr") return event.type === "kickoff" ? "Coup d'envoi" : "Score actualisé";
    if (language === "de") return event.type === "kickoff" ? "Anstoß" : "Spielstand aktualisiert";
    if (language === "ja") return event.type === "kickoff" ? "キックオフ" : "スコア更新";
    if (language === "ar") return event.type === "kickoff" ? "البداية" : "تحديث النتيجة";
  }
  return eventLabel(event, copy);
}

function minuteLabel(event: MatchEvent) {
  return `${event.minute}'${event.stoppage ? `+${event.stoppage}` : ""}`;
}

function eventCountLabel(count: number, language: Language) {
  if (language === "zh") return `${count} 个比赛事件`;
  if (language === "es") return `${count} ${count === 1 ? "evento" : "eventos"} del partido`;
  if (language === "pt") return `${count} ${count === 1 ? "evento" : "eventos"} da partida`;
  if (language === "fr") return `${count} ${count === 1 ? "événement" : "événements"} du match`;
  if (language === "de") return `${count} ${count === 1 ? "Spielereignis" : "Spielereignisse"}`;
  if (language === "ja") return `試合イベント ${count}件`;
  if (language === "ar") return `${count} ${count === 1 ? "حدث" : "أحداث"} في المباراة`;
  return `${count} ${count === 1 ? "match event" : "match events"}`;
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

function teamBadgeStyle(color: string) {
  const normalized = color.replace("#", "");
  const hex = normalized.length === 3 ? normalized.split("").map((value) => `${value}${value}`).join("") : normalized;
  const channels = /^[0-9a-f]{6}$/i.test(hex) ? [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) : [0, 90, 80];
  const luminance = (channels[0] * 0.299 + channels[1] * 0.587 + channels[2] * 0.114) / 255;
  return { backgroundColor: luminance > 0.9 ? "#e7edef" : color, color: luminance > 0.68 ? "#102225" : "#ffffff", borderColor: luminance > 0.82 ? "#9fb3b8" : color };
}

function teamGroupLabel(group: string | undefined, copy: UiCopy, language: Language) {
  if (!group) return copy.matchCenter;
  const normalized = group.toLowerCase();
  if (normalized.includes("txline") || normalized.includes("fixture")) return copy.officialFeed;
  if (normalized.includes("espn") || normalized.includes("public scoreboard")) return copy.publicFeed;
  const localizedStage = localizedTournamentStage(group, language);
  if (localizedStage) return localizedStage;
  return group;
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
  const localizedStage = localizedTournamentStage(value, language);
  if (localizedStage) return localizedStage;
  return value;
}

function uniqueFacts(...values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
}

function localizedTournamentStage(value: string, language: Language) {
  const normalized = value.toLowerCase().replace(/[-_]/g, " ");
  const text = tournamentCopy[language];
  if (normalized.includes("round of 32")) return text.round32;
  if (normalized.includes("round of 16")) return text.round16;
  if (normalized.includes("quarter")) return text.quarter;
  if (normalized.includes("semi")) return text.semi;
  if (normalized.includes("bronze") || normalized.includes("third place")) return bronzeStageLabels[language];
  if (/\bfinals?\b/.test(normalized)) return text.final;
  return null;
}

const bronzeStageLabels: Record<Language, string> = {
  en: "Third-place match",
  zh: "季军赛",
  es: "Partido por el tercer puesto",
  pt: "Disputa do terceiro lugar",
  fr: "Match pour la troisième place",
  de: "Spiel um Platz drei",
  ja: "3位決定戦",
  ar: "مباراة المركز الثالث",
};

export default function MatchdayApp() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [mode, setMode] = useState<MatchMode>(initialMode);
  const [view, setView] = useState<View>(initialView);
  const [settingsOpen, setSettingsOpen] = useState(() => queryValue("settings") === "1");
  const [heroDisplay, setHeroDisplay] = useState<HeroDisplay>("score");
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
  const [pickEditing, setPickEditing] = useState(false);
  const [pickSettled, setPickSettled] = useState(false);
  const [settlement, setSettlement] = useState<string | null>(null);
  const [challengeStats, setChallengeStats] = useState(readChallengeStats);
  const [pickLedger, setPickLedger] = useState(readPickLedger);
  const [settlementMatches, setSettlementMatches] = useState<MatchData[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoCommentary, setAutoCommentary] = useState(() => window.localStorage.getItem("wclp-auto-commentary") === "1");
  const [commentaryMode, setCommentaryMode] = useState<CommentaryMode>("call");
  const [followedMatchId, setFollowedMatchId] = useState(() => window.localStorage.getItem("wclp-followed-match"));
  const [favoriteTeamCode, setFavoriteTeamCode] = useState(() => window.localStorage.getItem("wclp-favorite-team"));
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(readAlertPreferences);
  const loadedMatchIdRef = useRef<string | null>(null);
  const settlementGuardRef = useRef(new Set(readPickLedger().filter((pick) => pick.settled).map((pick) => pick.matchId)));
  const notifiedEventRef = useRef<string | null>(null);
  const commentaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoCommentaryEventRef = useRef<string | null>(null);

  const copy = ui[language];
  const standText = fanStandCopy[language];
  const helperUrl = `${import.meta.env.BASE_URL}tools/txline-subscribe/index.html?v=2026-07-10`;
  const configuredVideoUrl = safeVideoUrl(import.meta.env.VITE_AUTHORIZED_VIDEO_EMBED_URL);
  const videoUrl = configuredVideoUrl ?? officialVideoSources[0].url;
  const txlineProxyBase = (import.meta.env.VITE_TXLINE_PROXY_BASE || "").trim()
    || (import.meta.env.DEV ? "/__txline" : window.location.hostname.endsWith(".vercel.app") ? "/api/txline" : "");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("translate", "no");
    window.localStorage.setItem("wclp-language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("wclp-points-version", pointsVersion);
    window.localStorage.setItem("wclp-test-points", String(points));
  }, [points]);

  useEffect(() => {
    window.localStorage.setItem("wclp-challenge-stats", JSON.stringify(challengeStats));
  }, [challengeStats]);

  useEffect(() => {
    window.localStorage.setItem(pickLedgerKey, JSON.stringify(pickLedger));
  }, [pickLedger]);

  useEffect(() => {
    if (followedMatchId) window.localStorage.setItem("wclp-followed-match", followedMatchId);
    else window.localStorage.removeItem("wclp-followed-match");
  }, [followedMatchId]);

  useEffect(() => {
    if (favoriteTeamCode) window.localStorage.setItem("wclp-favorite-team", favoriteTeamCode);
    else window.localStorage.removeItem("wclp-favorite-team");
  }, [favoriteTeamCode]);

  useEffect(() => {
    window.localStorage.setItem(alertPreferencesKey, JSON.stringify(alertPreferences));
  }, [alertPreferences]);

  useEffect(() => {
    if (!match || loadedMatchIdRef.current !== match.id) return;
    if (pickEditing) return;
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
  }, [match, pickAway, pickEditing, pickHome, pickLedger, pickLocked, pickSettled]);

  useEffect(() => {
    if (!match || !pickEditing || mode !== "live" || match.status === "scheduled") return;
    const stored = pickLedger.find((item) => item.matchId === match.id);
    if (stored) {
      setPickHome(stored.homeScore);
      setPickAway(stored.awayScore);
    }
    setPickEditing(false);
    setSettlement(copy.pickClosed);
  }, [copy.pickClosed, match, mode, pickEditing, pickLedger]);

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
        entryCost: pick.entryCost ?? pointsPerPick,
        netChange: result.award - (pick.entryCost ?? pointsPerPick),
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
          proxyBase: txlineProxyBase,
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
  }, [match?.id, mode, pickLedger, txlineProxyBase]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    commentaryAudioRef.current?.pause();
    commentaryAudioRef.current = null;
    setIsSpeaking(false);
    if (pickSettled) setSettlement(copy.alreadySettled);
    return () => {
      window.speechSynthesis?.cancel();
      commentaryAudioRef.current?.pause();
    };
  }, [language, match?.id, commentaryMode]);

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
          proxyBase: txlineProxyBase,
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
          setPickEditing(false);
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
  }, [mode, refreshNonce, selectedReplayId, txlineProxyBase]);

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

  useEffect(() => {
    if (!match || !frame || mode !== "live" || followedMatchId !== match.id || match.status === "scheduled") return;
    const event = frame.latestEvent;
    if (!event || notifiedEventRef.current === event.id) return;
    if (notifiedEventRef.current === null) {
      notifiedEventRef.current = event.id;
      return;
    }
    notifiedEventRef.current = event.id;
    if (!alertEnabledForEvent(event, alertPreferences)) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const title = `${teamName(match.home, language)} ${copy.versus} ${teamName(match.away, language)}`;
    try {
      new Notification(title, { body: localizeEventDescription(language, event), tag: `wclp-${match.id}-${event.id}` });
    } catch {
      // Following remains useful in-page even when the browser blocks notification delivery.
    }
  }, [alertPreferences, followedMatchId, frame, language, match, mode]);

  useEffect(() => {
    if (!autoCommentary || !match || !frame || match.status === "scheduled") return;
    const event = frame.latestEvent;
    if (!event || autoCommentaryEventRef.current === event.id) return;
    autoCommentaryEventRef.current = event.id;
    playCommentaryLine(localizeCommentary(language, match, frame), "call", event.type);
  }, [autoCommentary, frame, language, match]);

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
  const activePick = pickLedger.find((pick) => pick.matchId === match.id);
  const isScheduled = match.status === "scheduled";
  const activeEvents = isScheduled ? frame.activeEvents.filter((event) => event.type !== "kickoff") : frame.activeEvents;
  const latestEvent = isScheduled ? undefined : frame.latestEvent;
  const recentEvents = [...activeEvents].reverse().slice(0, 8);
  const keyEventSource = mode === "replay" ? match.events : activeEvents;
  const keyEvents = keyEventSource.filter((event) => ["goal", "yellow_card", "red_card", "score_review", "halftime", "fulltime"].includes(event.type)).slice(-6);
  const goalCount = activeEvents.filter((event) => event.type === "goal").length;
  const yellowCount = activeEvents.filter((event) => event.type === "yellow_card").length;
  const redCount = activeEvents.filter((event) => event.type === "red_card").length;
  const extraTime = activeEvents.some((event) => event.minute > 90 || event.stoppage);
  const isFinal = mode === "replay"
    ? activeEvents.some((event) => event.type === "fulltime") || minute >= maxMinute
    : match.status === "finished" || activeEvents.some((event) => event.type === "fulltime");
  const canLockPick = canLockScorePick(mode, match.status);
  const marketLabel = match.marketSource === "official-odds"
    ? copy.officialOdds
    : mode === "replay"
      ? copy.replaySnapshot
      : copy.derivedPulse;
  const statusText = match.status === "live" ? copy.liveNow : match.status === "finished" ? copy.final : copy.scheduled;
  const nextEvent = match.events.find((event) => event.minute > minute);
  const nextSignal = isScheduled
    ? match.kickoffIso ? formatKickoffLabel(match.kickoffIso, language) : copy.scheduled
    : nextEvent
      ? `${minuteLabel(nextEvent)} ${localizedEventLabel(nextEvent, copy, language)}`
      : copy.keyMoments;
  const commentaryByMode: Record<CommentaryMode, string> = {
    call: isScheduled ? localizeScheduledBrief(language, match, "call") : localizeCommentary(language, match, frame),
    why: isScheduled ? localizeScheduledBrief(language, match, "why") : localizeInsight(language, match, frame),
    recap: isScheduled ? localizeScheduledBrief(language, match, "recap") : localizeRecap(language, match, frame),
  };
  const aiCommentary = commentaryByMode[commentaryMode];
  const audioText = commentaryAudioCopy[language];
  const pulseText = pulsePlayCopy[language];
  const pulseMomentLabel = latestEvent
    ? `${latestEvent.penalty ? `${pulseText.penalty} · ` : ""}${localizedEventLabel(latestEvent, copy, language)}${latestEvent.team ? ` · ${latestEvent.team}` : ""}`
    : isScheduled
      ? pulseText.ready
      : statusText;
  const pulseMomentDescription = latestEvent ? localizeEventDescription(language, latestEvent) : "";
  const pulseStoryEvents = activeEvents
    .filter((event) => ["goal", "yellow_card", "red_card", "substitution", "halftime", "fulltime", "score_update"].includes(event.type))
    .slice(-4)
    .map((event) => ({ id: event.id, at: event.minute, minute: minuteLabel(event), label: localizedEventLabel(event, copy, language), team: event.team, score: `${event.homeScore}-${event.awayScore}` }));
  const fanChannelMoments = activeEvents
    .filter((event) => ["goal", "yellow_card", "red_card", "substitution", "halftime", "fulltime", "score_update"].includes(event.type))
    .slice(-5)
    .reverse()
    .map((event) => {
      const eventTeamName = event.team === match.home.code ? teamName(match.home, language) : event.team === match.away.code ? teamName(match.away, language) : undefined;
      const playerName = readableSourcePlayer(event.player);
      const playerEvents = playerName
        ? activeEvents.filter((candidate) => readableSourcePlayer(candidate.player)?.toLocaleLowerCase() === playerName.toLocaleLowerCase())
        : [];
      const playerRecord: PlayerProfile | undefined = playerName ? {
        name: playerName,
        goals: playerEvents.filter((candidate) => candidate.type === "goal").length || undefined,
        cards: playerEvents.filter((candidate) => candidate.type === "yellow_card" || candidate.type === "red_card").length || undefined,
        substitutions: playerEvents.filter((candidate) => candidate.type === "substitution").length || undefined,
        minutes: [...new Set(playerEvents.map((candidate) => candidate.minute))],
      } : undefined;
      return {
        id: event.id,
        minute: event.minute,
        minuteLabel: minuteLabel(event),
        label: [localizedEventLabel(event, copy, language), eventTeamName, playerName].filter(Boolean).join(" · "),
        description: localizeEventDescription(language, event),
        score: `${event.homeScore}-${event.awayScore}`,
        player: playerRecord ? { name: playerRecord.name, detail: playerFactText(playerRecord, copy, language) || undefined } : undefined,
      };
    });
  const prioritizedReplays = [...replayMatches].sort((left, right) => {
    const includesFavorite = (candidate: MatchData) => Boolean(favoriteTeamCode && (candidate.home.code === favoriteTeamCode || candidate.away.code === favoriteTeamCode));
    return Number(includesFavorite(right)) - Number(includesFavorite(left));
  });
  const challengeRoom = !activePick
    ? undefined
    : activePick.homeScore > activePick.awayScore
      ? "home" as const
      : activePick.awayScore > activePick.homeScore
        ? "away" as const
        : "match" as const;
  const challengeRoomLabel = challengeRoom === "home"
    ? standText.teamFans(teamName(match.home, language))
    : challengeRoom === "away"
      ? standText.teamFans(teamName(match.away, language))
      : challengeRoom === "match"
        ? standText.allFans
        : undefined;

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

  function savePick() {
    if (!match) return;
    const isUpdating = pickLocked && pickEditing;
    if (pickLocked && !isUpdating) return;
    if (!canLockPick) {
      setSettlement(copy.pickClosed);
      setPickEditing(false);
      return;
    }
    if (!isUpdating && points < pointsPerPick) {
      setSettlement(copy.pointsNeeded);
      return;
    }
    if (!isUpdating) setPoints((current) => current - pointsPerPick);
    setPickLocked(true);
    setPickEditing(false);
    setSettlement(isUpdating ? challengeEditCopy[language].updated : null);
    const previous = pickLedger.find((item) => item.matchId === match.id);
    const now = new Date().toISOString();
    const record: StoredPick = {
      ...previous,
      matchId: match.id,
      homeCode: match.home.code,
      awayCode: match.away.code,
      homeScore: pickHome,
      awayScore: pickAway,
      locked: true,
      settled: false,
      lockedAtIso: previous?.lockedAtIso ?? now,
      updatedAtIso: now,
      revisionCount: isUpdating ? (previous?.revisionCount ?? 0) + 1 : previous?.revisionCount ?? 0,
      entryCost: previous?.entryCost ?? pointsPerPick,
      balanceAfterEntry: previous?.balanceAfterEntry ?? Math.max(0, points - pointsPerPick),
      sourceKind: source?.kind,
      sourceCheckedAtIso: source?.checkedAtIso,
    };
    setPickLedger((current) => [record, ...current.filter((item) => item.matchId !== match.id)]);
  }

  function editPick() {
    if (!match || match.status !== "scheduled" || !pickLocked || pickSettled) return;
    setPickEditing(true);
    setSettlement(null);
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
    if (!match) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      commentaryAudioRef.current?.pause();
      commentaryAudioRef.current = null;
      setIsSpeaking(false);
      return;
    }

    playCommentaryLine(aiCommentary, commentaryMode, latestEvent?.type);
  }

  function playCommentaryLine(line: string, voiceMode: CommentaryMode, eventType?: MatchEvent["type"]) {
    if (!match) return;
    window.speechSynthesis?.cancel();
    commentaryAudioRef.current?.pause();
    commentaryAudioRef.current = null;
    const clipPath = getCommentaryVoiceClip(match.id, language, voiceMode, eventType, line);
    if (clipPath) {
      const audio = new Audio(`${import.meta.env.BASE_URL}${clipPath}`);
      let fallbackStarted = false;
      const fallback = () => {
        if (fallbackStarted) return;
        fallbackStarted = true;
        commentaryAudioRef.current = null;
        speakWithBrowserVoice(line, voiceMode);
      };
      audio.onended = () => {
        commentaryAudioRef.current = null;
        setIsSpeaking(false);
      };
      audio.onerror = fallback;
      commentaryAudioRef.current = audio;
      setIsSpeaking(true);
      void audio.play().catch(fallback);
      return;
    }

    speakWithBrowserVoice(line, voiceMode);
  }

  function speakWithBrowserVoice(line = aiCommentary, voiceMode: CommentaryMode = commentaryMode) {
    if (!("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(line);
    const profile = getSpeechProfile(language, voiceMode);
    const voices = window.speechSynthesis.getVoices();
    utterance.lang = profile.locale;
    utterance.voice = selectSpeechVoice(voices, language);
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  function toggleAutoCommentary() {
    setAutoCommentary((current) => {
      const next = !current;
      window.localStorage.setItem("wclp-auto-commentary", next ? "1" : "0");
      if (!next) {
        window.speechSynthesis?.cancel();
        commentaryAudioRef.current?.pause();
        commentaryAudioRef.current = null;
        setIsSpeaking(false);
      } else {
        autoCommentaryEventRef.current = null;
      }
      return next;
    });
  }

  async function toggleMatchFollow() {
    if (!match) return;
    if (followedMatchId === match.id) {
      setFollowedMatchId(null);
      notifiedEventRef.current = null;
      return;
    }
    setFollowedMatchId(match.id);
    notifiedEventRef.current = latestEvent?.id ?? null;
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // The in-page followed state still works when browser notifications are unavailable.
      }
    }
  }

  function resetPoints() {
    window.localStorage.setItem("wclp-points-version", pointsVersion);
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
        <nav className="primary-nav" aria-label={copy.matchCenter}>
          <NavButton active={view === "match" && mode === "live"} onClick={startLive} label={copy.navMatch} icon="●" />
          <NavButton active={view === "tournament"} onClick={() => setView("tournament")} label={copy.navReplay} icon="↺" />
          <NavButton active={view === "teams"} onClick={() => setView("teams")} label={copy.navTeams} icon="◎" />
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
            <h1>{view === "tournament" ? tournamentCopy[language].title : view === "teams" ? copy.teams : <>{teamName(match.home, language)} <span>{copy.versus}</span> {teamName(match.away, language)}</>}</h1>
          </div>
          <div className="top-actions">
            <span className={`source-pill ${sourceState.tone}`}><span className={`status-dot ${sourceState.tone}`} />{sourceState.label}</span>
            <button className={`icon-button follow-button ${followedMatchId === match.id ? "active" : ""}`} type="button" onClick={toggleMatchFollow} aria-label={followedMatchId === match.id ? copy.unfollowMatch : copy.followMatch} title={followedMatchId === match.id ? copy.unfollowMatch : copy.followMatch}>{followedMatchId === match.id ? "★" : "☆"}</button>
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
                {uniqueFacts(stageLabel(match.stage, match.competition, copy, language), venueLabel(match.venue, copy)).map((fact) => <span key={fact}>{fact}</span>)}
                <div className="hero-view-toggle" role="tablist" aria-label={pulseText.title}>
                  <button className={heroDisplay === "score" ? "active" : ""} type="button" role="tab" aria-selected={heroDisplay === "score"} onClick={() => setHeroDisplay("score")}>{pulseText.scoreView}</button>
                  <button className={heroDisplay === "play" ? "active" : ""} type="button" role="tab" aria-selected={heroDisplay === "play"} onClick={() => setHeroDisplay("play")}>{pulseText.playView}</button>
                </div>
              </div>
              {heroDisplay === "score" ? <div className="score-line">
                <TeamSide team={match.home} score={frame.homeScore} copy={copy} language={language} />
                <div className="score-core">
                  <strong>{isScheduled ? "–" : frame.homeScore} <i>:</i> {isScheduled ? "–" : frame.awayScore}</strong>
                  <span>{minuteLabelForFrame(match, minute, isFinal, copy)}</span>
                </div>
                <TeamSide team={match.away} score={frame.awayScore} align="right" copy={copy} language={language} />
              </div> : <PulsePlay key={match.id} match={match} frame={frame} latestEvent={latestEvent} minute={minute} isFinal={isFinal} homeName={teamName(match.home, language)} awayName={teamName(match.away, language)} momentLabel={pulseMomentLabel} momentDescription={pulseMomentDescription} storyEvents={pulseStoryEvents} text={pulseText} onSelectStory={mode === "replay" ? (targetMinute) => { setIsPlaying(false); setMinute(targetMinute); } : undefined} />}
              <div className="pulse-strip">
                <span>{copy.fanPulse} {Math.round(frame.market.sentiment)}/100</span>
                <div className="pulse-track"><span style={{ width: `${frame.market.sentiment}%` }} /></div>
                <span>{copy.next}: {nextSignal}</span>
              </div>
              <div className="hero-ai-brief">
                <div className="commentary-copy">
                  <div className="commentary-topline"><span>{copy.aiCommentary}</span><div className="commentary-modes" role="tablist" aria-label={copy.aiCommentary}>
                    {(["call", "why", "recap"] as CommentaryMode[]).map((modeOption) => <button className={commentaryMode === modeOption ? "active" : ""} type="button" role="tab" aria-selected={commentaryMode === modeOption} key={modeOption} onClick={() => setCommentaryMode(modeOption)}>{modeOption === "call" ? copy.commentaryCall : modeOption === "why" ? copy.commentaryWhy : copy.commentaryRecap}</button>)}
                  </div></div>
                  <strong aria-live="polite">{aiCommentary}</strong>
                </div>
                <div className="commentary-audio-actions"><button className="commentary-audio" type="button" onClick={toggleCommentaryAudio} title={isSpeaking ? copy.stopCommentary : copy.listenCommentary}>{isSpeaking ? copy.stopCommentary : copy.listenCommentary}</button><button className={`commentary-auto ${autoCommentary ? "active" : ""}`} type="button" aria-pressed={autoCommentary} onClick={toggleAutoCommentary}>{autoCommentary ? audioText.autoOn : audioText.autoOff}</button></div>
              </div>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => setView("match")}>
                  {mode === "replay" ? (isPlaying ? "❚❚" : "▶") : copy.navMatch}
                </button>
                {mode === "replay" ? (
                  <>
                    <input className="timeline-slider" type="range" min="1" max={maxMinute} value={minute} onChange={(event) => { setIsPlaying(false); setMinute(Number(event.target.value)); }} aria-label={copy.scorePulse} />
                    <select className="speed-select" value={speed} onChange={(event) => setSpeed(Number(event.target.value) as (typeof replaySpeeds)[number])} aria-label={copy.replay}>
                      {replaySpeeds.map((value) => <option key={value} value={value}>{value}x</option>)}
                    </select>
                  </>
                ) : null}
                <span className="freshness">{copy.verifiedAt} {formatCheckedAt(source?.checkedAtIso, language)}</span>
              </div>
            </section>

            <section className="prediction-focus" aria-label={copy.scoreChallenge}>
              <ScoreChallenge copy={copy} language={language} match={match} picks={pickLedger} homeScore={pickHome} awayScore={pickAway} setHomeScore={setPickHome} setAwayScore={setPickAway} locked={pickLocked} editing={pickEditing} settled={pickSettled} points={points} stats={challengeStats} settlement={settlement} onSave={savePick} onEdit={editPick} onDownload={downloadPickCard} onJoinRoom={() => document.querySelector<HTMLElement>(".fan-stand")?.scrollIntoView({ behavior: "smooth", block: "start" })} roomLabel={standText.title} canLock={canLockPick} />
            </section>

            {!isScheduled && activeEvents.length ? <div className="signal-row" aria-label={copy.events}>
              <Signal label={copy.goals} value={goalCount} tone="goal" />
              <Signal label={copy.yellow} value={yellowCount} tone="yellow" />
              <Signal label={copy.red} value={redCount} tone="red" />
              <Signal label={copy.extraTime} value={extraTime ? "✓" : "0"} tone="neutral" />
               <div className="signal-next"><span>{copy.latest}</span><strong>{latestEvent ? `${minuteLabel(latestEvent)} ${localizedEventLabel(latestEvent, copy, language)}${readableSourcePlayer(latestEvent.player) ? ` · ${readableSourcePlayer(latestEvent.player)}` : ""}` : copy.noEvents}</strong></div>
            </div> : null}

            {keyEvents.length ? <div className="key-event-strip" aria-label={copy.keyMoments}>
              <strong>{copy.keyMoments}</strong>
              <div>{keyEvents.map((event) => mode === "replay" ? <button type="button" key={event.id} onClick={() => { setIsPlaying(false); setMinute(event.minute); }}>{minuteLabel(event)} {localizedEventLabel(event, copy, language)}</button> : <span key={event.id}>{minuteLabel(event)} {localizedEventLabel(event, copy, language)}</span>)}</div>
            </div> : null}

            <FanStand key={match.id} matchId={match.id} minute={minute} homeName={teamName(match.home, language)} awayName={teamName(match.away, language)} homeScore={frame.homeScore} awayScore={frame.awayScore} eventType={latestEvent?.type} eventTeam={latestEvent?.team === match.home.code ? teamName(match.home, language) : latestEvent?.team === match.away.code ? teamName(match.away, language) : undefined} fallbackLabel={pulseMomentLabel} momentDescription={pulseMomentDescription} language={language} copy={standText} moments={fanChannelMoments} challenge={{ title: copy.scoreChallenge, status: activePick?.settled ? copy.alreadySettled : activePick?.locked ? copy.locked : canLockPick ? copy.lockPick : copy.pickClosed, score: activePick ? `${match.home.code} ${activePick.homeScore}:${activePick.awayScore} ${match.away.code}` : undefined, points: `${points.toLocaleString()} ${copy.pointsUnit}`, action: copy.scoreChallenge, room: challengeRoom, roomLabel: challengeRoomLabel, award: activePick?.settled ? `+${activePick.award ?? 0} ${copy.pointsUnit}` : undefined }} onOpenChallenge={() => { document.querySelector<HTMLElement>(".challenge-block")?.scrollIntoView({ behavior: "smooth", block: "center" }); window.setTimeout(() => document.querySelector<HTMLInputElement>(".challenge-score input")?.focus(), 350); }} onSelectMoment={mode === "replay" ? (targetMinute) => { setHeroDisplay("play"); setIsPlaying(false); setMinute(targetMinute); document.querySelector<HTMLElement>(".score-hero")?.scrollIntoView({ behavior: "smooth", block: "start" }); } : undefined} />

            <section className="content-grid">
              <div className="feed-column">
                <section className="section-block">
                  <SectionHeading eyebrow={copy.events} title={eventCountLabel(activeEvents.length, language)} />
                  <div className="event-feed">
                    {recentEvents.length ? recentEvents.map((event) => <EventRow key={event.id} event={event} copy={copy} home={match.home} away={match.away} language={language} />) : <p className="empty-state">{copy.noEvents}</p>}
                  </div>
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
                     <a href={officialVideoSources[2].url} target="_blank" rel="noreferrer">{copy.officialUpdates}<span>↗</span></a>
                   </div>
                   <p className="muted-copy">{copy.noWatch}</p>
                  <div className="replay-progress"><span style={{ width: `${Math.min(100, (minute / maxMinute) * 100)}%` }} /></div>
                </section>
                <section className="side-block">
                  <SectionHeading eyebrow={copy.replayLibrary} title={copy.chooseReplay} />
                  <div className="replay-list">
                    {replayMatches.map((candidate) => <button className={`replay-item ${candidate.id === selectedReplayId && mode === "replay" ? "selected" : ""}`} type="button" key={candidate.id} onClick={() => startReplay(candidate.id)}><span>{teamName(candidate.home, language)} <b>{copy.versus}</b> {teamName(candidate.away, language)}</span><small>{copy.replay}</small></button>)}
                  </div>
                </section>
              </aside>
            </section>
          </>
        ) : view === "tournament" ? (
          <TournamentView language={language} copy={copy} schedule={schedule} onOpenReplay={startReplay} favoriteTeamCode={favoriteTeamCode} />
        ) : (
          <TeamsView copy={copy} language={language} match={match} schedule={schedule} onOpenReplay={startReplay} favoriteTeamCode={favoriteTeamCode} onToggleFavorite={(code) => setFavoriteTeamCode((current) => current === code ? null : code)} />
        )}
      </section>

      <aside className="right-rail">
        <section className="truth-panel">
          <div className="truth-heading"><span className={`status-dot ${sourceState.tone}`} /><strong>{copy.source}</strong></div>
          <strong className="truth-title">{sourceState.detail}</strong>
           <p>{copy.onlyVerified}</p>
          <div className="truth-meta"><span>{copy.verifiedAt}</span><strong>{formatCheckedAt(source?.checkedAtIso, language)}</strong></div>
        </section>
        <section className="up-next-panel">
          <div className="panel-heading"><span>{copy.replayLibrary}</span><span className="panel-count">{prioritizedReplays.length}</span></div>
          {prioritizedReplays.slice(0, 2).map((candidate) => <button type="button" key={candidate.id} onClick={() => startReplay(candidate.id)}>{teamName(candidate.home, language)} {copy.versus} {teamName(candidate.away, language)}<span>→</span></button>)}
        </section>
      </aside>

      {settingsOpen ? <SettingsDrawer copy={copy} language={language} setLanguage={setLanguage} alertPreferences={alertPreferences} setAlertPreferences={setAlertPreferences} helperUrl={helperUrl} source={source} onRefresh={() => setRefreshNonce((value) => value + 1)} onResetPoints={resetPoints} onClose={() => setSettingsOpen(false)} /> : null}
    </main>
  );
}

function NavButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return <button className={`nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}><span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span></button>;
}

function TeamSide({ team, score, align = "left", copy, language }: { team: Team; score: number | string; align?: "left" | "right"; copy: UiCopy; language: Language }) {
  return <div className={`team-side ${align}`}><span className="team-code" style={teamBadgeStyle(team.color)}>{team.code}</span><strong>{teamName(team, language)}</strong><small>{teamGroupLabel(team.group, copy, language)}</small><b>{score}</b></div>;
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

function readableSourcePlayer(candidate?: string) {
  if (!candidate) return undefined;
  const normalized = candidate.trim();
  if (!normalized || /^#?\d+$/.test(normalized) || /^player\s*#?\d+$/i.test(normalized)) return undefined;
  return normalized;
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
  const visibleValues = values.filter((item) => Number.isFinite(item.value) && item.value > 0);
  if (!visibleValues.length) return null;
  return <section className="odds-context"><SectionHeading eyebrow={copy.fanPulse} title={label} /><div className="odds-grid">{visibleValues.map((item) => <div className="odds-cell" key={item.label}><span>{item.label}</span><strong>{`x${item.value.toFixed(2)}`}</strong></div>)}</div><p className="muted-copy">{copy.noBetting}</p></section>;
}

function ScoreChallenge({ copy, language, match, picks, homeScore, awayScore, setHomeScore, setAwayScore, locked, editing, settled, points, stats, settlement, onSave, onEdit, onDownload, onJoinRoom, roomLabel, canLock }: { copy: UiCopy; language: Language; match: MatchData; picks: StoredPick[]; homeScore: number; awayScore: number; setHomeScore: (value: number) => void; setAwayScore: (value: number) => void; locked: boolean; editing: boolean; settled: boolean; points: number; stats: ChallengeStats; settlement: string | null; onSave: () => void; onEdit: () => void; onDownload: () => void; onJoinRoom: () => void; roomLabel: string; canLock: boolean }) {
  const matchState = match.status === "finished" ? copy.final : match.status === "live" ? copy.live : copy.scheduled;
  const accuracy = stats.played ? `${Math.round((stats.correct / stats.played) * 100)}%` : null;
  const editText = challengeEditCopy[language];
  const canEdit = match.status === "scheduled" && locked && !settled;
  const actionLabel = settled ? copy.alreadySettled : editing ? editText.save : locked ? copy.locked : canLock ? copy.lockPick : copy.pickClosed;
  const level = getFanLevel(stats);
  const levelDetail = level.ceiling ? `${copy.nextLevel} · ${level.xp}/${level.ceiling} XP` : `${level.xp} XP`;
  const demoText = seasonDemoCopy[language];
  const ledgerText = challengeLedgerCopy[language];
  const activePick = picks.find((pick) => pick.matchId === match.id);
  const activeEntryCost = activePick?.entryCost ?? pointsPerPick;
  const activeAward = activePick?.settled ? activePick.award ?? 0 : null;
  const activeNet = activeAward === null ? -activeEntryCost : activeAward - activeEntryCost;
  const signedPoints = (value: number) => `${value > 0 ? "+" : ""}${value} ${copy.pointsUnit}`;
  return (
    <section className="challenge-block">
      <div className="challenge-heading-row">
        <SectionHeading eyebrow={copy.scoreChallenge} title={`${match.home.code} ${copy.versus} ${match.away.code}`} />
        <div className="challenge-balance"><span>{copy.currentPoints}</span><strong>{points.toLocaleString()}</strong><small>{copy.pointsUnit}</small></div>
      </div>
      <div className="challenge-stage">
        <div className="challenge-progress-column">
          <div className="challenge-level">
            <div><span>{copy.fanLevel}</span><strong>Lv {level.index + 1} · {copy.levelNames[level.index]}</strong></div>
            <small>{levelDetail}</small>
            <div className="challenge-level-track"><span style={{ width: `${level.progress}%` }} /></div>
          </div>
          <div className="challenge-meta"><div><span>{copy.pickCost}</span><strong>{pointsPerPick} {copy.pointsUnit}</strong></div><div><span>{copy.settlementRule}</span><strong>{locked ? copy.locked : matchState}</strong></div></div>
          <div className="challenge-rewards" aria-label={commentaryAudioCopy[language].rewards}><span><small>{copy.exact}</small><strong>+250 {copy.pointsUnit}</strong></span><span><small>{copy.result}</small><strong>+100 {copy.pointsUnit}</strong></span></div>
          <div className="challenge-stats"><span>{copy.streak} <b>{stats.streak}</b> <small>{copy.bestStreak} {stats.bestStreak}</small></span>{accuracy ? <span>{copy.accuracy} <b>{accuracy}</b> <small>{stats.correct}/{stats.played}</small></span> : null}</div>
        </div>
        <div className="challenge-play-column">
          <div className={`challenge-score ${editing ? "editing" : ""}`}><ScoreInput label={match.home.code} value={homeScore} disabled={(locked && !editing) || !canLock} onChange={setHomeScore} /><span>:</span><ScoreInput label={match.away.code} value={awayScore} disabled={(locked && !editing) || !canLock} onChange={setAwayScore} /></div>
          {match.status === "scheduled" ? <p className="challenge-rule-note">{editText.note}</p> : null}
          <p className="muted-copy">{copy.pointsNote}</p>
          {activePick?.locked ? <div className="challenge-transaction" aria-label={copy.scoreChallenge}><span><small>{ledgerText.entry}</small><strong>-{activeEntryCost} {copy.pointsUnit}</strong></span><span><small>{ledgerText.reward}</small><strong>{activeAward === null ? copy.waitingSettlement : `+${activeAward} ${copy.pointsUnit}`}</strong></span><span><small>{ledgerText.net}</small><strong>{signedPoints(activeNet)}</strong></span></div> : null}
          <div className="challenge-actions"><button className="primary-button" type="button" onClick={onSave} disabled={settled || (!editing && locked) || (!editing && points < pointsPerPick) || !canLock}>{actionLabel}</button>{canEdit && !editing ? <button className="secondary-button edit-pick-button" type="button" onClick={onEdit}>{editText.edit}</button> : null}{locked && !editing ? <button className="secondary-button" type="button" onClick={onDownload}>{copy.downloadPick}</button> : null}{locked && !editing ? <button className="secondary-button challenge-room-button" type="button" onClick={onJoinRoom}>{roomLabel}</button> : null}</div>
        </div>
      </div>
      {settlement ? <p className="challenge-result">{settlement}</p> : null}
      {picks.length ? <details className="challenge-history" open><summary>{demoText.myHistory} · {picks.length}</summary><div className="challenge-history-list">{picks.slice(0, 4).map((pick) => { const entryCost = pick.entryCost ?? pointsPerPick; const award = pick.award ?? 0; const net = pick.settled ? award - entryCost : -entryCost; return <div key={pick.matchId}><strong>{pick.homeCode} {pick.homeScore}:{pick.awayScore} {pick.awayCode}</strong><span>{pick.settled && Number.isFinite(pick.finalHomeScore) && Number.isFinite(pick.finalAwayScore) ? `${copy.final} ${pick.finalHomeScore}:${pick.finalAwayScore} · ${ledgerText.entry} -${entryCost} · ${ledgerText.reward} +${award} · ${ledgerText.net} ${signedPoints(net)}` : `${pick.revisionCount ? editText.updated : copy.locked} · ${ledgerText.entry} -${entryCost}`}</span><small>{copy.verifiedAt} {formatCheckedAt(pick.updatedAtIso ?? pick.sourceCheckedAtIso, language)}</small></div>; })}</div></details> : null}
      <details className="challenge-history demo-history"><summary>{demoText.title} · {demoSeasonSummary.played} {demoText.matches} · {demoSeasonSummary.correct} {demoText.correct} · {demoSeasonSummary.exact} {demoText.exact} · {demoSeasonSummary.netPoints >= 0 ? "+" : ""}{demoSeasonSummary.netPoints} {copy.pointsUnit}</summary><p className="muted-copy">{demoText.note}</p><div className="challenge-history-list">{demoSeasonHistory.map((pick) => <div key={pick.matchId}><strong>{pick.homeCode} {pick.homeScore}:{pick.awayScore} {pick.awayCode}</strong><span>{copy.final} {pick.finalHomeScore}:{pick.finalAwayScore} · +{pick.award}</span><small>{pick.kickoffIso ? formatKickoffLabel(pick.kickoffIso, language) : copy.replay}</small></div>)}</div></details>
    </section>
  );
}

function ScoreInput({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <label className="score-input"><span>{label}</span><div className="score-stepper"><button type="button" disabled={disabled || value <= 0} onClick={() => onChange(Math.max(0, value - 1))} aria-label={`${label} -`}>-</button><input type="number" min="0" max="20" value={value} disabled={disabled} aria-label={label} onChange={(event) => onChange(Math.max(0, Math.min(20, Number(event.target.value) || 0)))} /><button type="button" disabled={disabled || value >= 20} onClick={() => onChange(Math.min(20, value + 1))} aria-label={`${label} +`}>+</button></div></label>;
}

function TournamentView({ language, copy, schedule, onOpenReplay, favoriteTeamCode }: { language: Language; copy: UiCopy; schedule: MatchScheduleItem[]; onOpenReplay: (id: string) => void; favoriteTeamCode: string | null }) {
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
  const [spoilerFree, setSpoilerFree] = useState(false);
  const selectedTeam = teams.get(selectedCode);
  const selectedMatches = txlineArchiveMatches.filter((match) => match.home.code === selectedCode || match.away.code === selectedCode);
  const selectedResults = selectedMatches.flatMap((item) => {
    const finalEvent = item.events.filter((event) => event.type === "fulltime").at(-1) ?? item.events.at(-1);
    return finalEvent ? [`${teamName(item.home, language)} ${finalEvent.homeScore}-${finalEvent.awayScore} ${teamName(item.away, language)}`] : [];
  });
  const round16 = txlineArchiveMatches.filter((match) => match.stage === "Round of 16");
  const quarter = txlineArchiveMatches.filter((match) => match.stage === "Quarter-final");
  const semi = txlineArchiveMatches.filter((match) => match.stage === "Semi-final");
  const includesFavorite = (item: Pick<MatchScheduleItem, "home" | "away">) => Boolean(favoriteTeamCode && (item.home.code === favoriteTeamCode || item.away.code === favoriteTeamCode));
  const currentFixtures = schedule
    .filter((item) => item.status === "scheduled" && !item.home.code.endsWith("XX") && !item.away.code.endsWith("XX"))
    .sort((left, right) => Number(includesFavorite(right)) - Number(includesFavorite(left)))
    .slice(0, 4);

  return <section className="tournament-view">
    <header className="tournament-intro"><div><p className="overline">{text.verified}</p><h2>{text.subtitle}</h2></div><div className="tournament-intro-actions"><p>{text.sourceRule}</p><label className="spoiler-toggle"><input type="checkbox" checked={spoilerFree} onChange={(event) => setSpoilerFree(event.target.checked)} /><span>{copy.spoilerFree}</span></label></div></header>

    {currentFixtures.length ? <section className="tournament-band current-fixtures"><SectionHeading eyebrow={copy.schedule} title={text.current} /><div className="current-fixture-grid">{currentFixtures.map((item) => { const favorite = includesFavorite(item); const status = scheduleStatusLabel(item, copy); return <article className={favorite ? "favorite-team" : ""} key={item.id}><div><span className={`data-chip ${status.tone}`}>{status.label}</span>{favorite ? <span className="favorite-marker" title={copy.favoriteTeam}>★</span> : null}{item.kickoffIso ? <small>{formatKickoffLabel(item.kickoffIso, language)}</small> : null}</div><small className="current-stage">{stageLabel(item.stage, item.stage, copy, language)}</small><strong>{teamName(item.home, language)} <b>{copy.versus}</b> {teamName(item.away, language)}</strong><p>{currentFixtureNote(language)}</p></article>; })}</div></section> : null}

    <section className="tournament-band"><SectionHeading eyebrow="2026" title={text.archive} /><div className="archive-match-grid">{txlineArchiveMatches.map((archive) => {
      const finalEvent = archive.events.filter((event) => event.type === "fulltime").at(-1) ?? archive.events.at(-1);
      if (!finalEvent) return null;
      const score = `${finalEvent.homeScore}-${finalEvent.awayScore}`;
      const winner = finalEvent && finalEvent.homeScore !== finalEvent.awayScore ? (finalEvent.homeScore > finalEvent.awayScore ? teamName(archive.home, language) : teamName(archive.away, language)) : null;
      const yellowCards = archive.events.filter((event) => event.type === "yellow_card").length;
      const redCards = archive.events.filter((event) => event.type === "red_card").length;
      const finalMinute = Math.max(90, ...archive.events.map((event) => event.minute + (event.stoppage ?? 0)));
      const aiRecap = localizeRecap(language, archive, buildPulseFrame(archive, finalMinute));
      return <article className={`archive-match-card ${spoilerFree ? "spoilered" : ""}`} key={archive.id}><div className="archive-match-top"><span>{localizedStage(archive.stage, text)}</span><small>{text.verified}</small></div><div className="archive-score-row"><button type="button" onClick={() => setSelectedCode(archive.home.code)}>{archive.home.code}</button><strong>{spoilerFree ? copy.versus : score}</strong><button type="button" onClick={() => setSelectedCode(archive.away.code)}>{archive.away.code}</button></div>{spoilerFree ? null : <>{winner || yellowCards || redCards ? <p>{winner ? <>{text.winner}: <b>{winner}</b></> : null}{yellowCards ? <>{winner ? <> · </> : null}{copy.yellow} {yellowCards}</> : null}{redCards ? <>{winner || yellowCards ? <> · </> : null}{copy.red} {redCards}</> : null}</p> : null}<div className="archive-ai-summary"><span>{text.aiRecap}</span><p>{aiRecap}</p></div></>}<button className="archive-open" type="button" onClick={() => onOpenReplay(archive.id)}>{text.open}<span>→</span></button></article>;
    })}</div></section>

    {!spoilerFree ? <section className="tournament-band bracket-section"><SectionHeading eyebrow={copy.advancement} title={text.path} /><div className="bracket-scroll"><div className="bracket-grid">
      <BracketLane title={text.round32} matches={[]} waiting={text.waiting} />
      <BracketLane title={text.round16} matches={round16} waiting={text.waiting} onOpen={onOpenReplay} />
      <BracketLane title={text.quarter} matches={quarter} waiting={text.waiting} onOpen={onOpenReplay} />
      <BracketLane title={text.semi} matches={semi} waiting={text.waiting} onOpen={onOpenReplay} />
      <BracketLane title={text.final} matches={[]} waiting={text.waiting} />
      <BracketLane title={text.champion} matches={[]} waiting={text.waiting} champion />
    </div></div></section> : null}

    {!spoilerFree && selectedTeam ? <section className="tournament-band team-detail-panel"><div className="team-detail-heading"><div className="profile-top"><span className="team-code" style={teamBadgeStyle(selectedTeam.color)}>{selectedTeam.code}</span><div><p className="overline">{text.teamDetail}</p><h2>{teamName(selectedTeam, language)}</h2></div></div><div className="team-switcher">{[...teams.values()].map((team) => <button className={team.code === selectedCode ? "active" : ""} type="button" key={team.code} onClick={() => setSelectedCode(team.code)}>{team.code}</button>)}</div></div><div className="team-detail-grid">{selectedResults.length ? <div><span>{copy.schedule}</span><strong>{selectedResults.length}</strong><p>{selectedResults.join(" · ")}</p></div> : null}{selectedTeam.keyPlayers?.length ? <div><span>{text.sourcePlayers}</span><strong>{selectedTeam.keyPlayers.length}</strong><p>{selectedTeam.keyPlayers.map((player) => { const facts = playerFactText(player, copy, language); return facts ? `${player.name} · ${facts}` : player.name; }).join(" · ")}</p></div> : null}<div><span>{copy.dataQuality}</span><strong>{text.verified}</strong><p>{copy.onlyVerified}</p></div></div></section> : null}
  </section>;
}

function BracketLane({ title, matches, waiting, onOpen, champion = false }: { title: string; matches: MatchData[]; waiting: string; onOpen?: (id: string) => void; champion?: boolean }) {
  return <section className={`bracket-lane ${champion ? "champion" : ""}`}><header><span>{title}</span><b>{matches.length}</b></header><div>{matches.length ? matches.map((match) => {
    const finalEvent = match.events.filter((event) => event.type === "fulltime").at(-1) ?? match.events.at(-1);
    if (!finalEvent) return null;
    return <button type="button" key={match.id} onClick={() => onOpen?.(match.id)}><span>{match.home.code} <b>{finalEvent.homeScore}</b></span><span>{match.away.code} <b>{finalEvent.awayScore}</b></span></button>;
  }) : <p>{waiting}</p>}</div></section>;
}

function localizedStage(stage: string | undefined, text: (typeof tournamentCopy)[Language]) {
  if (stage === "Round of 16") return text.round16;
  if (stage === "Quarter-final") return text.quarter;
  if (stage === "Semi-final") return text.semi;
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

function TeamsView({ copy, language, match, schedule, onOpenReplay, favoriteTeamCode, onToggleFavorite }: { copy: UiCopy; language: Language; match: MatchData; schedule: MatchScheduleItem[]; onOpenReplay: (id: string) => void; favoriteTeamCode: string | null; onToggleFavorite: (code: string) => void }) {
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
  const orderedTeams = [...sourceTeams.values()].sort((left, right) => Number(right.team.code === favoriteTeamCode) - Number(left.team.code === favoriteTeamCode));
  return <section className="teams-view"><SectionHeading eyebrow={copy.teams} title={copy.sourceTeams} /><p className="muted-copy">{copy.onlyVerified}</p><div className="atlas-grid source-atlas">{orderedTeams.map(({ team, status }) => {
    const fixtures = schedule.filter((item) => item.home.code === team.code || item.away.code === team.code);
    const opponents = [...new Set(fixtures.map((item) => item.home.code === team.code ? item.away.code : item.home.code))];
    const archive = summarizeArchiveTeam(team.code);
    const sourcePlayers = archive.matches.flatMap((item) => item.home.code === team.code ? item.home.keyPlayers ?? [] : item.away.keyPlayers ?? []);
    const uniquePlayers = mergePlayerProfiles(sourcePlayers);
    const isFavorite = favoriteTeamCode === team.code;
    return <article className={`team-guide-card source-team-card ${isFavorite ? "favorite" : ""}`} key={team.code}>
      <div className="profile-top"><span className="team-code" style={teamBadgeStyle(team.color)}>{team.code}</span><div><h2>{teamName(team, language)}</h2></div><button className={`team-favorite ${isFavorite ? "active" : ""}`} type="button" onClick={() => onToggleFavorite(team.code)} aria-label={isFavorite ? copy.removeFavoriteTeam : copy.favoriteTeam} title={isFavorite ? copy.removeFavoriteTeam : copy.favoriteTeam}>{isFavorite ? "★" : "☆"}</button></div>
      <div className="source-team-facts"><span><small>{copy.matches}</small><strong>{fixtures.length}</strong></span>{opponents.length ? <span><small>{copy.opponents}</small><strong>{opponents.slice(0, 3).map((code) => localizeTeamName(code, code, language)).join(" · ")}</strong></span> : null}</div>
      <div className="team-guide-status"><span>{copy.dataQuality}</span><strong>{dataStatusLabel(status, copy)}</strong></div>
      {archive.matches.length ? <section className="source-team-record">
        <div className="source-record-heading"><strong>2026</strong><span>{copy.replayFeed}</span></div>
        <div className="source-record-stats">
          <span><small>{copy.replay}</small><b>{archive.matches.length}</b></span>
          <span><small>{copy.wins}</small><b>{archive.wins}</b></span>
          <span><small>{copy.goalsForAgainst}</small><b>{archive.goalsFor}:{archive.goalsAgainst}</b></span>
          <span><small>{copy.yellow} / {copy.red}</small><b>{archive.yellow}:{archive.red}</b></span>
        </div>
        <details><summary>{copy.replayLibrary} · {archive.matches.length}</summary><div className="team-archive-list">{archive.matches.map((archiveMatch) => {
          const finalEvent = archiveMatch.events.filter((event) => event.type === "fulltime").at(-1) ?? archiveMatch.events.at(-1);
          if (!finalEvent) return null;
          return <button className="team-archive-match" type="button" key={archiveMatch.id} onClick={() => onOpenReplay(archiveMatch.id)}><span>{archiveMatch.home.code} {finalEvent.homeScore}:{finalEvent.awayScore} {archiveMatch.away.code}</span><small>{localizedStage(archiveMatch.stage, tournamentCopy[language])}</small><b>→</b></button>;
        })}</div></details>
      </section> : null}
      {uniquePlayers.length ? <details><summary>{copy.players} · {uniquePlayers.length}</summary><div className="source-player-list">{uniquePlayers.map((player) => { const facts = playerFactText(player, copy, language); return <span key={player.name}><strong>{player.name}</strong>{facts ? <small>{facts}</small> : null}</span>; })}</div></details> : null}
    </article>;
  })}</div></section>;
}

function summarizeArchiveTeam(code: string) {
  const matches = txlineArchiveMatches.filter((item) => item.home.code === code || item.away.code === code);
  return matches.reduce((summary, item) => {
    const isHome = item.home.code === code;
    const finalEvent = item.events.filter((event) => event.type === "fulltime").at(-1) ?? item.events.at(-1);
    const goalsFor = finalEvent ? (isHome ? finalEvent.homeScore : finalEvent.awayScore) : 0;
    const goalsAgainst = finalEvent ? (isHome ? finalEvent.awayScore : finalEvent.homeScore) : 0;
    return {
      matches,
      wins: summary.wins + (goalsFor > goalsAgainst ? 1 : 0),
      goalsFor: summary.goalsFor + goalsFor,
      goalsAgainst: summary.goalsAgainst + goalsAgainst,
      yellow: summary.yellow + item.events.filter((event) => event.type === "yellow_card" && event.team === code).length,
      red: summary.red + item.events.filter((event) => event.type === "red_card" && event.team === code).length,
    };
  }, { matches, wins: 0, goalsFor: 0, goalsAgainst: 0, yellow: 0, red: 0 });
}

function mergePlayerProfiles(players: PlayerProfile[]) {
  const byName = new Map<string, PlayerProfile>();
  for (const player of players) {
    const current = byName.get(player.name);
    if (!current) {
      byName.set(player.name, { ...player, minutes: [...(player.minutes ?? [])] });
      continue;
    }
    byName.set(player.name, {
      name: player.name,
      goals: (current.goals ?? 0) + (player.goals ?? 0) || undefined,
      cards: (current.cards ?? 0) + (player.cards ?? 0) || undefined,
      substitutions: (current.substitutions ?? 0) + (player.substitutions ?? 0) || undefined,
      minutes: [...new Set([...(current.minutes ?? []), ...(player.minutes ?? [])])].sort((left, right) => left - right),
    });
  }
  return [...byName.values()];
}

function playerFactText(player: PlayerProfile, copy: UiCopy, language: Language) {
  const labels = playerFactCopy[language];
  return [
    player.goals ? `${copy.goals} ${player.goals}` : null,
    player.cards ? `${labels.cards} ${player.cards}` : null,
    player.substitutions ? `${labels.substitutions} ${player.substitutions}` : null,
    player.minutes?.length ? `${labels.minutes} ${player.minutes.map((minute) => `${minute}'`).join(", ")}` : null,
  ].filter(Boolean).join(" · ");
}

function KeyPlayersStrip({ copy, match, language }: { copy: UiCopy; match: MatchData; language: Language }) {
  const players = [
    ...(match.home.keyPlayers ?? []).slice(0, 2).map((player) => ({ ...player, team: match.home.code })),
    ...(match.away.keyPlayers ?? []).slice(0, 2).map((player) => ({ ...player, team: match.away.code })),
  ];
  if (!players.length) return null;
  return <div className="key-player-strip"><strong>{copy.players}</strong>{players.map((player) => { const facts = playerFactText(player, copy, language); return <span key={`${player.team}-${player.name}`}><b>{player.name}</b><small>{facts ? `${player.team} · ${facts}` : player.team}</small></span>; })}</div>;
}

function ScheduleBoard({ copy, items, selectedId, onOpenReplay, language, favoriteTeamCode }: { copy: UiCopy; items: MatchScheduleItem[]; selectedId: string; onOpenReplay: (id: string) => void; language: Language; favoriteTeamCode: string | null }) {
  const includesFavorite = (item: Pick<MatchScheduleItem, "home" | "away">) => Boolean(favoriteTeamCode && (item.home.code === favoriteTeamCode || item.away.code === favoriteTeamCode));
  const visibleItems = items.filter((item) => !item.home.code.endsWith("XX") && !item.away.code.endsWith("XX")).sort((left, right) => Number(includesFavorite(right)) - Number(includesFavorite(left))).slice(0, 8);
  const replayLinks = [...replayMatches].sort((left, right) => Number(includesFavorite(right)) - Number(includesFavorite(left))).slice(0, 3);
  return <section className="section-block schedule-block"><SectionHeading eyebrow={copy.schedule} title={copy.advancement} /><div className="schedule-list">{visibleItems.length ? visibleItems.map((item) => { const isReplay = item.dataStatus === "Replay"; const status = scheduleStatusLabel(item, copy); const note = scheduleNote(item, copy); const favorite = includesFavorite(item); return <article className={`schedule-card ${item.id === selectedId ? "selected" : ""} ${favorite ? "favorite-team" : ""}`} key={item.id}><div className="schedule-card-top"><span className={`source-pill ${status.tone}`}>{status.label}</span>{favorite ? <span className="favorite-marker" title={copy.favoriteTeam}>★</span> : null}<small>{stageLabel(item.stage, item.stage, copy, language)}</small></div><strong>{teamName(item.home, language)} <b>{copy.versus}</b> {teamName(item.away, language)}</strong>{typeof item.homeScore === "number" && typeof item.awayScore === "number" && item.status !== "scheduled" ? <span className="schedule-score">{item.homeScore} - {item.awayScore}</span> : null}{item.kickoffIso ? <small>{formatKickoffLabel(item.kickoffIso, language)}</small> : null}{note ? <p>{note}</p> : null}{isReplay ? <button className="schedule-open" type="button" onClick={() => onOpenReplay(item.id)}>{copy.replay}<span>→</span></button> : null}</article>; }) : <p className="empty-state">{copy.noEvents}</p>}</div><div className="schedule-replay-links"><strong>{copy.replayLibrary}</strong>{replayLinks.map((candidate) => <button type="button" key={candidate.id} onClick={() => onOpenReplay(candidate.id)}>{teamName(candidate.home, language)} {copy.versus} {teamName(candidate.away, language)}<span>→</span></button>)}</div></section>;
}

function scheduleNote(item: MatchScheduleItem, copy: UiCopy) {
  if (item.dataStatus === "Replay" || item.status === "finished") return null;
  if (item.status === "scheduled") return copy.scheduled;
  if (item.dataStatus === "Delay") return copy.delayed;
  return copy.live;
}

function scheduleStatusLabel(item: MatchScheduleItem, copy: UiCopy) {
  if (item.dataStatus === "Replay") return { label: copy.replay, tone: "replay" };
  if (item.status === "finished") return { label: copy.final, tone: "replay" };
  if (item.status === "scheduled") return { label: copy.scheduled, tone: "seed" };
  if (item.dataStatus === "Delay") return { label: copy.delayed, tone: "delay" };
  if (item.dataStatus === "Live") return { label: copy.live, tone: "live" };
  return { label: copy.seed, tone: "seed" };
}

function GroupTable({ table, home, away, title, copy, language }: { table: NonNullable<MatchData["groupTable"]>; home: string; away: string; title: string; copy: UiCopy; language: Language }) {
  return <div className="group-table" aria-label={title}><strong>{title}</strong>{table.map((standing) => {
    const status = standingStatusCopy[language][standing.status];
    return <div className={`group-row ${standing.teamCode === home || standing.teamCode === away ? "focus" : ""}`} key={standing.teamCode}><span>{standing.teamCode}</span><span>{standing.played} {copy.matches}</span><b>{standing.points} {copy.pointsUnit}</b>{status ? <small>{status}</small> : null}</div>;
  })}</div>;
}

function SettingsDrawer({ copy, language, setLanguage, alertPreferences, setAlertPreferences, helperUrl, source, onRefresh, onResetPoints, onClose }: { copy: UiCopy; language: Language; setLanguage: (language: Language) => void; alertPreferences: AlertPreferences; setAlertPreferences: (preferences: AlertPreferences) => void; helperUrl: string; source: DataSourceState | null; onRefresh: () => void; onResetPoints: () => void; onClose: () => void }) {
  const ready = source?.kind === "live-ready";
  const alerts = alertPreferenceCopy[language];
  const updateAlert = (key: keyof AlertPreferences, enabled: boolean) => setAlertPreferences({ ...alertPreferences, [key]: enabled });
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="settings-drawer" aria-label={copy.settings}><header><div><p className="overline">WORLD CUP LIVE PULSE</p><h2>{copy.settings}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label={copy.close}>×</button></header><section className="drawer-section"><label htmlFor="language-select">{copy.language}</label><select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languages.map((option) => <option key={option.code} value={option.code}>{option.label} · {option.region}</option>)}</select><p className="muted-copy">{copy.languageNote}</p></section><details className="drawer-section" open><summary>{alerts.title}</summary><p className="muted-copy">{alerts.note}</p><div className="preference-list">{(["goals", "cards", "final"] as const).map((key) => <label key={key}><input type="checkbox" checked={alertPreferences[key]} onChange={(event) => updateAlert(key, event.currentTarget.checked)} /><span>{alerts[key]}</span></label>)}</div></details><details className="drawer-section"><summary>{copy.dataConnection}</summary><p className="muted-copy">{copy.authDescription}</p><div className={`connection-status ${ready ? "ready" : "fallback"}`}><span className="status-dot" /><strong>{ready ? copy.connectionReady : copy.connectionFallback}</strong><small>{copy.localOnly}</small></div><div className="drawer-actions"><button className="primary-button" type="button" onClick={onRefresh}>{copy.refreshData}</button><a className="secondary-button" href={helperUrl} target="_blank" rel="noreferrer">{copy.openHelper}</a></div><p className="security-note">{copy.securityNote}</p></details><details className="drawer-section"><summary>{copy.testPoints}</summary><p className="muted-copy">{copy.pointsNote}</p><button className="secondary-button" type="button" onClick={onResetPoints}>{copy.resetPoints}</button></details><details className="drawer-section"><summary>{copy.advancedHidden}</summary><p className="muted-copy">{copy.onlyVerified}</p><p className="muted-copy">{copy.replaySnapshot}</p></details></aside></div>;
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
