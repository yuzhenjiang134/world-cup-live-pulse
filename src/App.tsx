import { useEffect, useMemo, useState } from "react";
import { dataConsistencyState } from "./data/matchCalendar";
import { replayMatches } from "./data/replayMatch";
import { buildPulseFrame } from "./lib/pulse";
import { buildShareCardSvg, downloadShareCard } from "./lib/shareCard";
import { loadMatchData } from "./lib/txlineAdapter";
import type { DataSourceState, MatchData, MatchEvent, MatchMode, Team } from "./types";

const replayDurationMs = 46000;
const maxMinute = 90;
const replaySpeeds = [0.5, 1, 2, 4] as const;

type Language = "en" | "zh" | "es" | "pt";

const languageOptions: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

const copy = {
  en: {
    appEyebrow: "Superteam Earn / TxODDS hackathon MVP",
    settings: "Settings",
    close: "Close",
    language: "Language",
    english: "English",
    chinese: "Chinese",
    replay: "Replay",
    live: "Live",
    mockFixture: "Mock fixture",
    txlineAdapter: "TxLINE adapter",
    waitingForTxline: "Waiting for TxLINE token",
    sourceReplay: "Replay data ready",
    sourceLiveReady: "Live adapter ready",
    sourceNeedsToken: "TxLINE token needed",
    sourceError: "Data source error",
    sourceReplayMessage: "Replay mode uses fixed match data so the demo works without live access.",
    sourceLiveReadyMessage: "Live mode is wired through the TxLINE adapter boundary.",
    sourceNeedsTokenMessage: "Add a local TxLINE token only after the sponsor provides docs.",
    sourceErrorMessage: "The app can fall back to replay mode while the live source is unavailable.",
    todayBoard: "Today board",
    dataConsistency: "Data consistency",
    noMatchDayRule:
      "No live match is invented. If TxLINE has no match today or credentials are not configured, the public build clearly marks Replay and Seed data.",
    checkedAt: "Seed snapshot",
    source: "Source",
    publicSeedSource: "Public build: seed schedule + replay fixtures",
    consistencyRules: "Consistency rules",
    replayScenario: "Replay scenario",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    replayMinute: "Replay minute",
    replaySpeed: "Replay speed",
    jumpToMoment: "Jump to moment",
    clock: "Clock",
    pulse: "Pulse",
    latestBeat: "Latest beat",
    nextBeat: "Next beat",
    replayReady: "Replay-ready",
    pagesLive: "Pages live",
    noBetting: "No betting",
    aiCommentary: "AI commentary",
    oneLineRead: "One-line match read",
    pressure: "Pressure map",
    neutral: "Neutral",
    marketMood: "Market mood, not advice",
    oddsMovement: "Odds movement",
    draw: "Draw",
    marketSafety:
      "Public movement is explained as fan context only. No bets, trading advice, wallets, or custody.",
    pulseArc: "Pulse arc",
    matchMoodPath: "Match mood path",
    low: "Low",
    now: "Now",
    high: "High",
    momentumInsight: "Momentum insight",
    whyMomentMatters: "Why this moment matters",
    swing: "Swing",
    signal: "Signal",
    events: "Events",
    submissionSnapshot: "Submission snapshot",
    judgeReadyPacket: "Judge-ready packet",
    publicBuild: "Public build",
    liveData: "Live data",
    adapterGated: "Adapter gated",
    safety: "Safety",
    matchCenter: "Match Center",
    matchFacts: "Match facts",
    kickoff: "Kickoff",
    referee: "Referee",
    dataStatus: "Data status",
    discipline: "Discipline",
    noCards: "No cards yet",
    qualification: "Qualification",
    groupTable: "Group table",
    teamProfiles: "Team profiles",
    coach: "Coach",
    keyPlayers: "Key players",
    shareCard: "Fan share card",
    exportPulse: "Export the current pulse",
    downloadSvg: "Download SVG",
    timeline: "Match pulse timeline",
    keyEvents: "Key events",
    replayLoop: "Replay loop will restart.",
    matchLevel: "Score level",
    controlsStatus: "Demo control room",
    dailyBrief: "Daily Brief",
    fansNeedKnow: "What fans need to know",
    dailyBriefBody:
      "No confirmed live TxLINE fixture is configured for this public build, so the dashboard stays in a judgeable Replay + Seed state.",
    dailyPointOne: "Replay mode demonstrates the complete fan experience at any time.",
    dailyPointTwo: "Seed context covers teams, players, referee, and standings where relevant.",
    dailyPointThree: "Live mode is visible but gated until official TxLINE credentials are configured.",
    dataAudit: "Data audit",
    sourceLedger: "Source ledger",
    currentMode: "Current mode",
    canonicalSource: "Canonical source",
    replayCoverage: "Replay coverage",
    seedCoverage: "Seed coverage",
    liveReadiness: "Live readiness",
    tokenStatus: "Token",
    endpointStatus: "Endpoints",
    calendarStatus: "Calendar",
    fallbackStatus: "Fallback",
    pending: "Pending",
    ready: "Ready",
    gated: "Gated",
    replayFixtures: "2 replay fixtures",
    seedProfiles: "Teams, players, referee, standings",
    noLiveFixture: "No live fixture configured",
    replayFallbackReady: "Replay fallback ready",
    endpointPending: "Waiting for official TxLINE endpoint docs",
    matchIntelligence: "Match Intelligence",
    phaseSummary: "Phase summary",
    preMatch: "Pre-match",
    firstHalf: "First half",
    secondHalf: "Second half",
    postMatch: "Post-match",
    playerImpact: "Player impact",
    eventStack: "Event stack",
    goals: "Goals",
    cards: "Cards",
    subs: "Subs",
    marketSwings: "Market swings",
    involved: "Involved",
    noPlayerEvents: "No player-linked events yet",
    minutes: "Minutes",
    currentRead: "Current read",
    firstHalfSummary: "The first half sets the emotional baseline before substitutions and late pressure change the pulse.",
    secondHalfSummary:
      "The second half is where volatility matters: goals, cards, and market swings reshape the fan story.",
    postMatchSummary:
      "The replay is complete, with score, context, market mood, and safety boundaries preserved for review.",
    preMatchSummary:
      "The match starts from seed context: teams, venue, referee, kickoff, and replay scenario are already clear.",
    judgeDemo: "Judge Demo",
    demoChapters: "Demo chapters",
    demoReadiness: "Submission readiness",
    readinessScore: "Readiness score",
    runnableSite: "Runnable website",
    publicRepo: "Public GitHub repo",
    replayDemo: "Replay demo",
    txlineDocs: "TxLINE docs",
    demoVideo: "Demo video",
    finalSubmission: "Final submission",
    draft: "Draft",
    todo: "Todo",
    chapterIntegrity: "Data integrity",
    chapterGoalSwing: "Goal swing",
    chapterLateVolatility: "Late volatility",
    chapterUpsetContext: "Upset context",
    chapterIntegrityNote: "Replay + Seed state is explicit when no live fixture is configured.",
    chapterGoalNote: "A goal changes the fan pulse, scoreline, and market mood immediately.",
    chapterLateNote: "Rapid late moments show why a pulse dashboard beats a static score card.",
    chapterUpsetNote: "The group-stage replay connects match events to qualification context.",
    chapterIntegrityFocus: "No-match-day trust layer",
    chapterGoalFocus: "Score and mood swing",
    chapterLateFocus: "Volatility explanation",
    chapterUpsetFocus: "Group table and player impact",
  },
  zh: {
    appEyebrow: "Superteam Earn / TxODDS 黑客松 MVP",
    settings: "设置",
    close: "关闭",
    language: "语言",
    english: "English",
    chinese: "中文",
    replay: "回放",
    live: "实时",
    mockFixture: "模拟数据",
    txlineAdapter: "TxLINE 接入层",
    waitingForTxline: "等待 TxLINE token",
    sourceReplay: "回放数据已就绪",
    sourceLiveReady: "实时接入已就绪",
    sourceNeedsToken: "需要 TxLINE token",
    sourceError: "数据源错误",
    sourceReplayMessage: "回放模式使用固定比赛数据，没接实时 API 也能完整演示。",
    sourceLiveReadyMessage: "实时模式已经通过 TxLINE adapter 边界预留。",
    sourceNeedsTokenMessage: "等主办方给 API 文档后，再把 token 放到本地环境变量。",
    sourceErrorMessage: "实时源不可用时，页面可以退回回放模式继续展示。",
    todayBoard: "今日看板",
    dataConsistency: "数据一致性",
    noMatchDayRule:
      "不会伪造实时比赛。如果 TxLINE 当天没有比赛，或 token 未配置，公开版本会明确标注 Replay 和 Seed 数据。",
    checkedAt: "种子快照",
    source: "数据来源",
    publicSeedSource: "公开版本：种子赛程 + 回放 fixture",
    consistencyRules: "一致性规则",
    replayScenario: "回放场景",
    play: "播放",
    pause: "暂停",
    reset: "重置",
    replayMinute: "回放分钟",
    replaySpeed: "回放速度",
    jumpToMoment: "跳到关键时刻",
    clock: "比赛时间",
    pulse: "情绪脉冲",
    latestBeat: "最新节点",
    nextBeat: "下一节点",
    replayReady: "回放可演示",
    pagesLive: "Pages 已上线",
    noBetting: "不做下注",
    aiCommentary: "AI 解说",
    oneLineRead: "一句话比赛解读",
    pressure: "场面压力图",
    neutral: "中立",
    marketMood: "市场情绪，不是建议",
    oddsMovement: "赔率/情绪变化",
    draw: "平局",
    marketSafety: "这里只解释公开比赛波动给球迷看，不下注、不做交易建议、不碰钱包。",
    pulseArc: "情绪曲线",
    matchMoodPath: "整场情绪路径",
    low: "低点",
    now: "当前",
    high: "高点",
    momentumInsight: "走势洞察",
    whyMomentMatters: "这个时刻为什么重要",
    swing: "摆动",
    signal: "信号",
    events: "事件",
    submissionSnapshot: "提交状态",
    judgeReadyPacket: "评委可扫读信息",
    publicBuild: "公开部署",
    liveData: "实时数据",
    adapterGated: "接入层已预留",
    safety: "安全边界",
    matchCenter: "比赛中心",
    matchFacts: "比赛信息",
    kickoff: "开球时间",
    referee: "裁判",
    dataStatus: "数据状态",
    discipline: "红黄牌",
    noCards: "暂无红黄牌",
    qualification: "晋级状态",
    groupTable: "小组积分",
    teamProfiles: "球队资料",
    coach: "主教练",
    keyPlayers: "关键球员",
    shareCard: "球迷分享卡",
    exportPulse: "导出当前情绪瞬间",
    downloadSvg: "下载 SVG",
    timeline: "比赛时间线",
    keyEvents: "关键事件",
    replayLoop: "回放会重新开始。",
    matchLevel: "比分持平",
    controlsStatus: "演示控制台",
    dailyBrief: "每日简报",
    fansNeedKnow: "球迷现在需要知道什么",
    dailyBriefBody:
      "公开版本还没有配置 TxLINE 实时赛程，所以页面保持在可评审的 Replay + Seed 状态。",
    dailyPointOne: "回放模式可以随时完整演示球迷体验。",
    dailyPointTwo: "种子资料覆盖球队、球员、裁判和相关小组积分。",
    dailyPointThree: "实时模式已经露出入口，但需要官方 TxLINE 凭据后才启用。",
    dataAudit: "数据审计",
    sourceLedger: "来源账本",
    currentMode: "当前模式",
    canonicalSource: "权威来源",
    replayCoverage: "回放覆盖",
    seedCoverage: "种子覆盖",
    liveReadiness: "实时接入准备",
    tokenStatus: "Token",
    endpointStatus: "Endpoints",
    calendarStatus: "赛程",
    fallbackStatus: "兜底",
    pending: "待补",
    ready: "就绪",
    gated: "已隔离",
    replayFixtures: "2 个回放 fixture",
    seedProfiles: "球队、球员、裁判、积分",
    noLiveFixture: "未配置实时赛程",
    replayFallbackReady: "回放兜底已就绪",
    endpointPending: "等待官方 TxLINE endpoint 文档",
    matchIntelligence: "比赛智能层",
    phaseSummary: "阶段摘要",
    preMatch: "赛前",
    firstHalf: "上半场",
    secondHalf: "下半场",
    postMatch: "赛后",
    playerImpact: "球员影响",
    eventStack: "事件统计",
    goals: "进球",
    cards: "红黄牌",
    subs: "换人",
    marketSwings: "市场波动",
    involved: "参与事件",
    noPlayerEvents: "暂无球员关联事件",
    minutes: "分钟",
    currentRead: "当前解读",
    firstHalfSummary: "上半场建立比赛情绪基线，之后换人和压力变化会改变整场脉冲。",
    secondHalfSummary: "下半场的波动最关键：进球、红黄牌和市场摆动会重塑球迷叙事。",
    postMatchSummary: "回放已经完整收束，比分、上下文、市场情绪和安全边界都可供评审查看。",
    preMatchSummary: "比赛从种子资料开始：球队、场地、裁判、开球时间和回放场景都已明确。",
    judgeDemo: "评审演示",
    demoChapters: "演示章节",
    demoReadiness: "提交准备度",
    readinessScore: "准备度",
    runnableSite: "可运行网站",
    publicRepo: "公开 GitHub 仓库",
    replayDemo: "回放演示",
    txlineDocs: "TxLINE 文档",
    demoVideo: "演示视频",
    finalSubmission: "最终提交",
    draft: "草稿",
    todo: "待做",
    chapterIntegrity: "数据可信",
    chapterGoalSwing: "进球摆动",
    chapterLateVolatility: "尾声波动",
    chapterUpsetContext: "爆冷语境",
    chapterIntegrityNote: "没有实时赛程时，Replay + Seed 状态会被明确标注。",
    chapterGoalNote: "进球会同时改变球迷情绪、比分和市场气氛。",
    chapterLateNote: "连续关键时刻展示脉冲看板比静态比分更有解释力。",
    chapterUpsetNote: "小组赛回放把事件和晋级语境连接起来。",
    chapterIntegrityFocus: "无比赛日可信层",
    chapterGoalFocus: "比分与情绪摆动",
    chapterLateFocus: "波动解释",
    chapterUpsetFocus: "积分表与球员影响",
  },
} as const;

const localizedCopy = {
  ...copy,
  es: {
    ...copy.en,
    appEyebrow: "MVP para Superteam Earn / TxODDS Hackathon",
    settings: "Ajustes",
    close: "Cerrar",
    language: "Idioma",
    replay: "Replay",
    live: "En vivo",
    mockFixture: "Datos simulados",
    txlineAdapter: "Adaptador TxLINE",
    waitingForTxline: "Esperando token TxLINE",
    sourceReplay: "Replay listo",
    sourceLiveReady: "Adaptador live listo",
    sourceNeedsToken: "Falta token TxLINE",
    sourceError: "Error de fuente",
    sourceReplayMessage: "Replay usa datos fijos para que la demo funcione sin acceso live.",
    sourceLiveReadyMessage: "Live mode ya pasa por el límite del adaptador TxLINE.",
    sourceNeedsTokenMessage: "Agrega el token local solo cuando el sponsor entregue documentación.",
    sourceErrorMessage: "La app puede volver a Replay si la fuente live no está disponible.",
    todayBoard: "Panel de hoy",
    dataConsistency: "Consistencia de datos",
    noMatchDayRule:
      "No inventamos partidos en vivo. Si TxLINE no tiene partido hoy o faltan credenciales, la versión pública marca Replay y Seed.",
    checkedAt: "Snapshot seed",
    source: "Fuente",
    publicSeedSource: "Build pública: calendario seed + fixtures replay",
    consistencyRules: "Reglas de consistencia",
    replayScenario: "Escenario replay",
    play: "Reproducir",
    pause: "Pausar",
    reset: "Reiniciar",
    replayMinute: "Minuto replay",
    replaySpeed: "Velocidad replay",
    jumpToMoment: "Saltar a momento",
    clock: "Reloj",
    pulse: "Pulso",
    latestBeat: "Último latido",
    nextBeat: "Próximo latido",
    replayReady: "Replay listo",
    pagesLive: "Pages online",
    noBetting: "Sin apuestas",
    aiCommentary: "Comentario AI",
    oneLineRead: "Lectura en una frase",
    pressure: "Mapa de presión",
    neutral: "Neutral",
    marketMood: "Ánimo de mercado, no consejo",
    oddsMovement: "Movimiento de cuotas",
    draw: "Empate",
    marketSafety:
      "El movimiento público se explica solo como contexto para fans. Sin apuestas, consejos, wallets ni custodia.",
    pulseArc: "Arco de pulso",
    matchMoodPath: "Ruta emocional del partido",
    low: "Bajo",
    now: "Ahora",
    high: "Alto",
    momentumInsight: "Insight de momentum",
    whyMomentMatters: "Por qué importa este momento",
    swing: "Giro",
    signal: "Señal",
    events: "Eventos",
    submissionSnapshot: "Snapshot de envío",
    judgeReadyPacket: "Paquete para jueces",
    publicBuild: "Build pública",
    liveData: "Datos live",
    adapterGated: "Adaptador aislado",
    safety: "Seguridad",
    matchCenter: "Centro del partido",
    matchFacts: "Datos del partido",
    kickoff: "Inicio",
    referee: "Árbitro",
    dataStatus: "Estado de datos",
    discipline: "Disciplina",
    noCards: "Sin tarjetas aún",
    qualification: "Clasificación",
    groupTable: "Tabla de grupo",
    teamProfiles: "Perfiles de equipos",
    coach: "Entrenador",
    keyPlayers: "Jugadores clave",
    shareCard: "Tarjeta para fans",
    exportPulse: "Exportar pulso actual",
    downloadSvg: "Descargar SVG",
    timeline: "Timeline del pulso",
    keyEvents: "Eventos clave",
    replayLoop: "El replay se reiniciará.",
    matchLevel: "Marcador igualado",
    controlsStatus: "Control de demo",
    dailyBrief: "Brief diario",
    fansNeedKnow: "Lo que el fan debe saber",
    dailyBriefBody:
      "La build pública no tiene calendario live TxLINE configurado, así que se mantiene en estado evaluable Replay + Seed.",
    dailyPointOne: "Replay demuestra la experiencia completa en cualquier momento.",
    dailyPointTwo: "Seed cubre equipos, jugadores, árbitro y tabla cuando aplica.",
    dailyPointThree: "Live está visible, pero bloqueado hasta configurar credenciales TxLINE.",
    dataAudit: "Auditoría de datos",
    sourceLedger: "Libro de fuentes",
    currentMode: "Modo actual",
    canonicalSource: "Fuente canónica",
    replayCoverage: "Cobertura replay",
    seedCoverage: "Cobertura seed",
    liveReadiness: "Preparación live",
    tokenStatus: "Token",
    endpointStatus: "Endpoints",
    calendarStatus: "Calendario",
    fallbackStatus: "Fallback",
    pending: "Pendiente",
    ready: "Listo",
    gated: "Bloqueado",
    replayFixtures: "2 fixtures replay",
    seedProfiles: "Equipos, jugadores, árbitro, tablas",
    noLiveFixture: "Sin fixture live configurado",
    replayFallbackReady: "Fallback replay listo",
    endpointPending: "Esperando documentación oficial de endpoints TxLINE",
    matchIntelligence: "Inteligencia del partido",
    phaseSummary: "Resumen de fase",
    preMatch: "Prepartido",
    firstHalf: "Primer tiempo",
    secondHalf: "Segundo tiempo",
    postMatch: "Postpartido",
    playerImpact: "Impacto de jugadores",
    eventStack: "Conteo de eventos",
    goals: "Goles",
    cards: "Tarjetas",
    subs: "Cambios",
    marketSwings: "Giros de mercado",
    involved: "Involucrado",
    noPlayerEvents: "Sin eventos de jugador aún",
    minutes: "Minutos",
    currentRead: "Lectura actual",
    firstHalfSummary: "El primer tiempo fija la línea emocional antes de cambios y presión tardía.",
    secondHalfSummary:
      "En el segundo tiempo la volatilidad importa: goles, tarjetas y giros de mercado rearman la historia.",
    postMatchSummary:
      "El replay está completo, con marcador, contexto, ánimo de mercado y límites de seguridad listos para revisar.",
    preMatchSummary:
      "El partido empieza desde contexto seed: equipos, sede, árbitro, inicio y escenario replay ya están claros.",
    judgeDemo: "Demo para jueces",
    demoChapters: "Capítulos de demo",
    demoReadiness: "Preparación de envío",
    readinessScore: "Score de preparación",
    runnableSite: "Sitio ejecutable",
    publicRepo: "Repo GitHub público",
    replayDemo: "Demo replay",
    txlineDocs: "Docs TxLINE",
    demoVideo: "Video demo",
    finalSubmission: "Envío final",
    draft: "Borrador",
    todo: "Pendiente",
    chapterIntegrity: "Integridad de datos",
    chapterGoalSwing: "Giro por gol",
    chapterLateVolatility: "Volatilidad final",
    chapterUpsetContext: "Contexto de sorpresa",
    chapterIntegrityNote: "Replay + Seed es explícito cuando no hay fixture live configurado.",
    chapterGoalNote: "Un gol cambia pulso, marcador y ánimo de mercado de inmediato.",
    chapterLateNote: "Momentos tardíos muestran por qué el pulso supera a un marcador estático.",
    chapterUpsetNote: "El replay de grupo conecta eventos con contexto de clasificación.",
    chapterIntegrityFocus: "Capa de confianza sin partido",
    chapterGoalFocus: "Marcador y ánimo",
    chapterLateFocus: "Explicación de volatilidad",
    chapterUpsetFocus: "Tabla e impacto jugador",
  },
  pt: {
    ...copy.en,
    appEyebrow: "MVP para Superteam Earn / TxODDS Hackathon",
    settings: "Configurações",
    close: "Fechar",
    language: "Idioma",
    replay: "Replay",
    live: "Ao vivo",
    mockFixture: "Dados simulados",
    txlineAdapter: "Adaptador TxLINE",
    waitingForTxline: "Aguardando token TxLINE",
    sourceReplay: "Replay pronto",
    sourceLiveReady: "Adaptador live pronto",
    sourceNeedsToken: "Token TxLINE necessário",
    sourceError: "Erro de fonte",
    sourceReplayMessage: "Replay usa dados fixos para a demo funcionar sem acesso live.",
    sourceLiveReadyMessage: "Live mode já passa pelo limite do adaptador TxLINE.",
    sourceNeedsTokenMessage: "Adicione o token local só quando o sponsor entregar a documentação.",
    sourceErrorMessage: "O app pode voltar para Replay se a fonte live estiver indisponível.",
    todayBoard: "Painel de hoje",
    dataConsistency: "Consistência de dados",
    noMatchDayRule:
      "Não inventamos jogo ao vivo. Se a TxLINE não tiver jogo hoje ou faltarem credenciais, a build pública marca Replay e Seed.",
    checkedAt: "Snapshot seed",
    source: "Fonte",
    publicSeedSource: "Build pública: calendário seed + fixtures replay",
    consistencyRules: "Regras de consistência",
    replayScenario: "Cenário replay",
    play: "Reproduzir",
    pause: "Pausar",
    reset: "Reiniciar",
    replayMinute: "Minuto replay",
    replaySpeed: "Velocidade replay",
    jumpToMoment: "Pular para momento",
    clock: "Relógio",
    pulse: "Pulso",
    latestBeat: "Último pulso",
    nextBeat: "Próximo pulso",
    replayReady: "Replay pronto",
    pagesLive: "Pages online",
    noBetting: "Sem apostas",
    aiCommentary: "Comentário AI",
    oneLineRead: "Leitura em uma frase",
    pressure: "Mapa de pressão",
    neutral: "Neutro",
    marketMood: "Humor de mercado, não conselho",
    oddsMovement: "Movimento de odds",
    draw: "Empate",
    marketSafety:
      "O movimento público é explicado apenas como contexto para torcedores. Sem apostas, conselhos, wallets ou custódia.",
    pulseArc: "Arco de pulso",
    matchMoodPath: "Caminho emocional do jogo",
    low: "Baixo",
    now: "Agora",
    high: "Alto",
    momentumInsight: "Insight de momentum",
    whyMomentMatters: "Por que este momento importa",
    swing: "Virada",
    signal: "Sinal",
    events: "Eventos",
    submissionSnapshot: "Snapshot de envio",
    judgeReadyPacket: "Pacote para jurados",
    publicBuild: "Build pública",
    liveData: "Dados live",
    adapterGated: "Adaptador isolado",
    safety: "Segurança",
    matchCenter: "Centro do jogo",
    matchFacts: "Dados do jogo",
    kickoff: "Início",
    referee: "Árbitro",
    dataStatus: "Estado dos dados",
    discipline: "Disciplina",
    noCards: "Sem cartões ainda",
    qualification: "Classificação",
    groupTable: "Tabela do grupo",
    teamProfiles: "Perfis dos times",
    coach: "Técnico",
    keyPlayers: "Jogadores-chave",
    shareCard: "Card para torcedores",
    exportPulse: "Exportar pulso atual",
    downloadSvg: "Baixar SVG",
    timeline: "Timeline do pulso",
    keyEvents: "Eventos-chave",
    replayLoop: "O replay vai reiniciar.",
    matchLevel: "Placar empatado",
    controlsStatus: "Controle da demo",
    dailyBrief: "Brief diário",
    fansNeedKnow: "O que o torcedor precisa saber",
    dailyBriefBody:
      "A build pública ainda não tem calendário live TxLINE configurado, então permanece em estado avaliável Replay + Seed.",
    dailyPointOne: "Replay demonstra a experiência completa a qualquer momento.",
    dailyPointTwo: "Seed cobre times, jogadores, árbitro e tabela quando aplicável.",
    dailyPointThree: "Live está visível, mas bloqueado até configurar credenciais TxLINE.",
    dataAudit: "Auditoria de dados",
    sourceLedger: "Livro de fontes",
    currentMode: "Modo atual",
    canonicalSource: "Fonte canônica",
    replayCoverage: "Cobertura replay",
    seedCoverage: "Cobertura seed",
    liveReadiness: "Preparação live",
    tokenStatus: "Token",
    endpointStatus: "Endpoints",
    calendarStatus: "Calendário",
    fallbackStatus: "Fallback",
    pending: "Pendente",
    ready: "Pronto",
    gated: "Bloqueado",
    replayFixtures: "2 fixtures replay",
    seedProfiles: "Times, jogadores, árbitro, tabelas",
    noLiveFixture: "Sem fixture live configurado",
    replayFallbackReady: "Fallback replay pronto",
    endpointPending: "Aguardando documentação oficial dos endpoints TxLINE",
    matchIntelligence: "Inteligência do jogo",
    phaseSummary: "Resumo de fase",
    preMatch: "Pré-jogo",
    firstHalf: "Primeiro tempo",
    secondHalf: "Segundo tempo",
    postMatch: "Pós-jogo",
    playerImpact: "Impacto dos jogadores",
    eventStack: "Contagem de eventos",
    goals: "Gols",
    cards: "Cartões",
    subs: "Subs",
    marketSwings: "Viradas de mercado",
    involved: "Envolvido",
    noPlayerEvents: "Sem eventos de jogador ainda",
    minutes: "Minutos",
    currentRead: "Leitura atual",
    firstHalfSummary: "O primeiro tempo define a linha emocional antes de mudanças e pressão tardia.",
    secondHalfSummary:
      "No segundo tempo a volatilidade importa: gols, cartões e viradas de mercado remontam a história.",
    postMatchSummary:
      "O replay está completo, com placar, contexto, humor de mercado e limites de segurança prontos para revisão.",
    preMatchSummary:
      "O jogo começa com contexto seed: times, estádio, árbitro, início e cenário replay já estão claros.",
    judgeDemo: "Demo para jurados",
    demoChapters: "Capítulos da demo",
    demoReadiness: "Preparação do envio",
    readinessScore: "Score de preparação",
    runnableSite: "Site executável",
    publicRepo: "Repo GitHub público",
    replayDemo: "Demo replay",
    txlineDocs: "Docs TxLINE",
    demoVideo: "Vídeo demo",
    finalSubmission: "Envio final",
    draft: "Rascunho",
    todo: "Pendente",
    chapterIntegrity: "Integridade de dados",
    chapterGoalSwing: "Virada por gol",
    chapterLateVolatility: "Volatilidade final",
    chapterUpsetContext: "Contexto de zebra",
    chapterIntegrityNote: "Replay + Seed é explícito quando não há fixture live configurado.",
    chapterGoalNote: "Um gol muda pulso, placar e humor de mercado imediatamente.",
    chapterLateNote: "Momentos finais mostram por que o pulso supera um placar estático.",
    chapterUpsetNote: "O replay de grupo conecta eventos ao contexto de classificação.",
    chapterIntegrityFocus: "Camada de confiança sem jogo",
    chapterGoalFocus: "Placar e humor",
    chapterLateFocus: "Explicação de volatilidade",
    chapterUpsetFocus: "Tabela e impacto jogador",
  },
} as const;

type CopyText = (typeof localizedCopy)[Language];
type DemoChapter = {
  id: string;
  matchId: string;
  minute: number;
  label: string;
  summary: string;
  focus: string;
};

export default function App() {
  const [mode, setMode] = useState<MatchMode>("replay");
  const [language, setLanguage] = useState<Language>("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [minute, setMinute] = useState(1);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [source, setSource] = useState<DataSourceState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<(typeof replaySpeeds)[number]>(1);
  const [replayMatchId, setReplayMatchId] = useState(replayMatches[0].id);

  const t = localizedCopy[language];

  useEffect(() => {
    setLoadError(null);
    loadMatchData(mode, {
      apiBase: import.meta.env.VITE_TXLINE_API_BASE,
      apiKey: import.meta.env.VITE_TXLINE_API_KEY,
      replayMatchId,
    })
      .then((result) => {
        setMatch(result.match);
        setSource(result.source);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Unknown data loading error");
      });
  }, [mode, replayMatchId]);

  useEffect(() => {
    if (!isPlaying || mode !== "replay") {
      return;
    }

    const tickMs = replayDurationMs / maxMinute / speed;
    const interval = window.setInterval(() => {
      setMinute((current) => (current >= maxMinute ? 1 : current + 1));
    }, tickMs);

    return () => window.clearInterval(interval);
  }, [isPlaying, mode, speed]);

  const frame = useMemo(() => {
    if (!match) {
      return null;
    }
    return buildPulseFrame(match, minute);
  }, [match, minute]);

  function jumpToMoment(targetMinute: number) {
    setIsPlaying(false);
    setMinute(targetMinute);
  }

  function switchMode(nextMode: MatchMode, options: { resetMinute?: boolean } = {}) {
    const { resetMinute = true } = options;
    setMode(nextMode);
    setIsPlaying(nextMode === "replay");
    if (resetMinute) {
      setMinute(1);
    }
  }

  if (!match || !frame) {
    return (
      <main className="app-shell">
        <section className="panel loading-panel">
          <p className="eyebrow">{loadError ? t.sourceError : "Loading"}</p>
          <h1>{loadError ? "Match pulse unavailable" : "Loading match pulse..."}</h1>
          {loadError ? <p>{loadError}</p> : null}
        </section>
      </main>
    );
  }

  const nextEvent = match.events.find((event) => event.minute > minute);
  const progress = Math.min(100, (minute / maxMinute) * 100);
  const keyMoments = match.events.filter((event) =>
    ["goal", "odds_shift", "halftime", "fulltime"].includes(event.type),
  );
  const currentMarketIndex = match.market.reduce(
    (lastIndex, snapshot, index) => (snapshot.minute <= minute ? index : lastIndex),
    0,
  );
  const sentimentValues = match.market.map((snapshot) => snapshot.sentiment);
  const sentimentLow = Math.min(...sentimentValues);
  const sentimentHigh = Math.max(...sentimentValues);
  const fanTemperature = Math.min(
    99,
    Math.max(1, Math.round(frame.market.sentiment + Math.abs(frame.insight.swing) * 1.4)),
  );
  const leader =
    frame.homeScore === frame.awayScore
      ? t.matchLevel
      : frame.homeScore > frame.awayScore
        ? match.home.name
        : match.away.name;
  const sourceStatus = source ? getSourceStatus(source, language) : null;
  const visibleCards = frame.activeEvents.filter((event) =>
    ["yellow_card", "red_card"].includes(event.type),
  );
  const kickoffLabel = formatKickoff(match.kickoffIso, language);
  const sharePreview = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildShareCardSvg(match, frame),
  )}`;
  const submissionSnapshot = [
    { label: t.replayReady, value: mode === "replay" ? t.replay : t.live },
    { label: t.publicBuild, value: t.pagesLive },
    { label: t.liveData, value: t.adapterGated },
    { label: t.safety, value: t.noBetting },
  ];
  const consistencyRules = getConsistencyRules(language);
  const dailyBriefPoints = [t.dailyPointOne, t.dailyPointTwo, t.dailyPointThree];
  const dataAuditItems = [
    {
      label: t.currentMode,
      value: mode === "replay" ? t.replay : t.live,
      note: mode === "live" && source?.kind === "needs-token" ? t.endpointPending : sourceStatus?.message,
    },
    {
      label: t.canonicalSource,
      value: sourceStatus?.label ?? t.publicSeedSource,
      note: t.noMatchDayRule,
    },
    {
      label: t.replayCoverage,
      value: t.replayFixtures,
      note: dataConsistencyState.today
        .filter((item) => item.availability === "available")
        .map((item) => `${item.homeCode}-${item.awayCode}`)
        .join(", "),
    },
    {
      label: t.seedCoverage,
      value: t.seedProfiles,
      note: dataConsistencyState.today[0]?.stage ?? t.noLiveFixture,
    },
  ];
  const readinessItems = [
    { label: t.tokenStatus, value: source?.kind === "needs-token" ? t.pending : t.gated },
    { label: t.endpointStatus, value: t.pending },
    { label: t.calendarStatus, value: t.noLiveFixture },
    { label: t.fallbackStatus, value: t.replayFallbackReady },
  ];
  const eventStats = buildEventStats(frame.activeEvents);
  const playerImpact = buildPlayerImpact(frame.activeEvents);
  const phaseSummary = buildPhaseSummary(minute, match, t);
  const demoChapters = buildDemoChapters(t);
  const selectedDemoChapter = demoChapters.find(
    (chapter) => chapter.matchId === replayMatchId && Math.abs(chapter.minute - minute) <= 2,
  );
  const readinessChecklist = [
    { label: t.runnableSite, value: t.ready, status: "ready" },
    { label: t.publicRepo, value: t.ready, status: "ready" },
    { label: t.replayDemo, value: t.ready, status: "ready" },
    { label: t.txlineDocs, value: t.draft, status: "draft" },
    { label: t.demoVideo, value: t.todo, status: "todo" },
    { label: t.finalSubmission, value: t.todo, status: "todo" },
  ];
  const readyCount = readinessChecklist.filter((item) => item.status === "ready").length;

  function openDemoChapter(chapter: DemoChapter) {
    switchMode("replay", { resetMinute: false });
    setReplayMatchId(chapter.matchId);
    setIsPlaying(false);
    setMinute(chapter.minute);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">{t.appEyebrow}</p>
          <h1>World Cup Live Pulse</h1>
        </div>
        <div className="top-actions">
          <div className="mode-switch" aria-label="Dashboard mode">
            <button
              className={mode === "replay" ? "active" : ""}
              onClick={() => switchMode("replay")}
              type="button"
            >
              {t.replay}
            </button>
            <button
              className={mode === "live" ? "active" : ""}
              onClick={() => switchMode("live")}
              type="button"
            >
              {t.live}
            </button>
          </div>
          <button
            className="settings-button"
            onClick={() => setSettingsOpen((value) => !value)}
            type="button"
          >
            {settingsOpen ? t.close : t.settings}
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <section className="settings-panel" aria-label={t.settings}>
          <div>
            <p className="eyebrow">{t.settings}</p>
            <h2>{t.controlsStatus}</h2>
          </div>
          <div className="language-control" aria-label={t.language}>
            <span>{t.language}</span>
            {languageOptions.map((option) => (
              <button
                className={language === option.code ? "active" : ""}
                key={option.code}
                onClick={() => setLanguage(option.code)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="match-hero" aria-label="Current match">
        <div className="hero-copy">
          <div className="status-ribbon">
            <span className={source?.kind === "replay" ? "status-live" : "status-waiting"}>
              {sourceStatus?.label ?? "Preparing source"}
            </span>
            <span>{mode === "replay" ? t.mockFixture : t.txlineAdapter}</span>
            <span>{match.dataStatus ?? "Replay"}</span>
            <span>{leader}</span>
          </div>
          <div className="scoreline">
            <TeamBadge name={match.home.name} code={match.home.code} color={match.home.color} />
            <div className="score">
              <strong>{frame.homeScore}</strong>
              <span>-</span>
              <strong>{frame.awayScore}</strong>
            </div>
            <TeamBadge name={match.away.name} code={match.away.code} color={match.away.color} />
          </div>
          <div className="match-meta">
            <span>{match.competition}</span>
            <span>{match.venue}</span>
            <span>{mode === "live" ? t.waitingForTxline : match.kickoffLabel}</span>
          </div>
        </div>
        <div className="hero-panel">
          <Metric label={t.clock} value={`${minute}'`} />
          <Metric label={t.pulse} value={`${fanTemperature}/100`} />
          <Metric label={t.latestBeat} value={frame.latestEvent?.title ?? "Kickoff"} />
        </div>
      </section>

      {sourceStatus ? (
        <section className={`source-banner source-${source?.kind}`} aria-label="Data source status">
          <strong>{sourceStatus.label}</strong>
          <span>{sourceStatus.message}</span>
        </section>
      ) : null}

      <section className="today-board" aria-label={t.todayBoard}>
        <article className="today-summary">
          <p className="eyebrow">{t.todayBoard}</p>
          <h2>{t.dataConsistency}</h2>
          <p>{t.noMatchDayRule}</p>
          <div className="today-meta">
            <span>
              {t.checkedAt}: {formatKickoff(dataConsistencyState.checkedAtIso, language)}
            </span>
            <span>
              {t.source}: {t.publicSeedSource}
            </span>
          </div>
          <ul>
            {consistencyRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
        <div className="today-list">
          {dataConsistencyState.today.map((item) => {
            const display = getTodayCardDisplay(item, language);

            return (
              <button
                className={item.id === replayMatchId ? "active" : ""}
                disabled={item.availability !== "available"}
                key={item.id}
                onClick={() => {
                  if (item.availability === "available") {
                    setIsPlaying(false);
                    setReplayMatchId(item.id);
                    switchMode("replay");
                  }
                }}
                type="button"
              >
                <strong>
                  {item.homeCode} vs {item.awayCode}
                </strong>
                <span>{display.label}</span>
                <span>{display.stage}</span>
                <small>
                  {formatKickoff(item.kickoffIso, language)} / {item.dataStatus}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="brief-grid" aria-label={t.dailyBrief}>
        <article className="brief-panel">
          <p className="eyebrow">{t.dailyBrief}</p>
          <h2>{t.fansNeedKnow}</h2>
          <p>{t.dailyBriefBody}</p>
          <ul>
            {dailyBriefPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="audit-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.dataAudit}</p>
            <h2>{t.sourceLedger}</h2>
          </div>
          <div className="audit-grid">
            {dataAuditItems.map((item) => (
              <section key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </section>
            ))}
          </div>
        </article>
        <article className="readiness-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.txlineAdapter}</p>
            <h2>{t.liveReadiness}</h2>
          </div>
          <div className="readiness-list">
            {readinessItems.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="judge-demo-layer" aria-label={t.judgeDemo}>
        <article className="demo-chapters-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.judgeDemo}</p>
            <h2>{t.demoChapters}</h2>
          </div>
          <div className="chapter-grid">
            {demoChapters.map((chapter) => (
              <button
                className={selectedDemoChapter?.id === chapter.id ? "active" : ""}
                key={chapter.id}
                onClick={() => openDemoChapter(chapter)}
                type="button"
              >
                <span>
                  {chapter.minute}' / {chapter.focus}
                </span>
                <strong>{chapter.label}</strong>
                <small>{chapter.summary}</small>
              </button>
            ))}
          </div>
        </article>
        <article className="readiness-score-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.demoReadiness}</p>
            <h2>
              {t.readinessScore}: {readyCount}/{readinessChecklist.length}
            </h2>
          </div>
          <div className="readiness-meter" aria-label={t.readinessScore}>
            <span style={{ width: `${(readyCount / readinessChecklist.length) * 100}%` }} />
          </div>
          <div className="readiness-checks">
            {readinessChecklist.map((item) => (
              <div className={`readiness-${item.status}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="story-strip" aria-label="Match story">
        <article>
          <span>{t.latestBeat}</span>
          <strong>{frame.latestEvent?.title ?? "Kickoff"}</strong>
          <p>{frame.latestEvent?.description ?? match.kickoffLabel}</p>
        </article>
        <article>
          <span>{t.nextBeat}</span>
          <strong>{nextEvent ? `${nextEvent.minute}' ${nextEvent.title}` : t.replayLoop}</strong>
          <p>{frame.insight.headline}</p>
        </article>
        <article>
          <span>{t.safety}</span>
          <strong>{t.noBetting}</strong>
          <p>{t.marketSafety}</p>
        </article>
      </section>

      <section className="control-deck" aria-label="Replay controls">
        <div className="replay-selector" aria-label="Replay match selector">
          <span>{t.replayScenario}</span>
          {replayMatches.map((candidate) => (
            <button
              className={candidate.id === replayMatchId ? "active" : ""}
              key={candidate.id}
              onClick={() => {
                setIsPlaying(false);
                setReplayMatchId(candidate.id);
                setMinute(1);
              }}
              type="button"
            >
              {candidate.home.code} vs {candidate.away.code}
            </button>
          ))}
        </div>

        <section className="control-strip" aria-label="Replay controls">
          <button type="button" onClick={() => setIsPlaying((value) => !value)}>
            {isPlaying ? t.pause : t.play}
          </button>
          <input
            aria-label={t.replayMinute}
            max={maxMinute}
            min={1}
            onChange={(event) => setMinute(Number(event.target.value))}
            type="range"
            value={minute}
          />
          <strong>{minute}'</strong>
          <button type="button" onClick={() => setMinute(1)}>
            {t.reset}
          </button>
          <div className="speed-switch" aria-label={t.replaySpeed}>
            {replaySpeeds.map((option) => (
              <button
                className={speed === option ? "active" : ""}
                key={option}
                onClick={() => setSpeed(option)}
                type="button"
              >
                {option}x
              </button>
            ))}
          </div>
        </section>

        <section className="moment-strip" aria-label="Jump to key replay moments">
          <span>{t.jumpToMoment}</span>
          {keyMoments.map((event) => (
            <button key={event.id} onClick={() => jumpToMoment(event.minute)} type="button">
              {event.minute}' {event.title}
            </button>
          ))}
        </section>
      </section>

      <section className="dashboard-grid">
        <article className="panel pulse-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.aiCommentary}</p>
            <h2>{t.oneLineRead}</h2>
          </div>
          <p className="commentary">{frame.commentary}</p>
          <div className="stadium-asset" aria-label={t.pressure}>
            <div className="field-line center" />
            <div className="field-line circle" />
            <div className="field-line box left" />
            <div className="field-line box right" />
            <div className="pulse-dot home" style={{ left: `${frame.pressure.home}%` }} />
            <div className="pulse-dot away" style={{ right: `${frame.pressure.away}%` }} />
          </div>
          <div className="pressure-bars">
            <Pressure label={match.home.code} value={frame.pressure.home} />
            <Pressure label={t.neutral} value={frame.pressure.neutral} />
            <Pressure label={match.away.code} value={frame.pressure.away} />
          </div>
        </article>

        <article className="panel market-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.marketMood}</p>
            <h2>{t.oddsMovement}</h2>
          </div>
          <div className="odds-row">
            <Odds label={match.home.code} value={frame.market.homeWin} />
            <Odds label={t.draw} value={frame.market.draw} />
            <Odds label={match.away.code} value={frame.market.awayWin} />
          </div>
          <div className="sentiment-track">
            <span style={{ width: `${frame.market.sentiment}%` }} />
          </div>
          <p className="small-copy">{t.marketSafety}</p>
        </article>

        <article className="panel match-facts-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.matchCenter}</p>
            <h2>{t.matchFacts}</h2>
          </div>
          <dl className="fact-grid">
            <div>
              <dt>{t.kickoff}</dt>
              <dd>{kickoffLabel}</dd>
            </div>
            <div>
              <dt>{t.referee}</dt>
              <dd>{match.referee ?? "TBD"}</dd>
            </div>
            <div>
              <dt>{t.dataStatus}</dt>
              <dd>{match.dataStatus ?? "Replay"}</dd>
            </div>
            <div>
              <dt>{t.qualification}</dt>
              <dd>{match.qualificationNote ?? match.stage ?? match.competition}</dd>
            </div>
          </dl>
          <div className="discipline-list">
            <strong>{t.discipline}</strong>
            {visibleCards.length ? (
              visibleCards.map((event) => (
                <span key={event.id}>
                  {event.minute}' {event.player ?? event.team} - {event.title}
                </span>
              ))
            ) : (
              <span>{t.noCards}</span>
            )}
          </div>
        </article>

        <article className="panel pulse-arc-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.pulseArc}</p>
            <h2>{t.matchMoodPath}</h2>
          </div>
          <div className="sparkline" aria-label={t.matchMoodPath}>
            {match.market.map((snapshot, index) => (
              <button
                aria-label={`${snapshot.minute}' ${snapshot.sentiment}`}
                className={index === currentMarketIndex ? "active" : ""}
                key={`${match.id}-${snapshot.minute}`}
                onClick={() => jumpToMoment(snapshot.minute)}
                style={{ height: `${Math.max(16, snapshot.sentiment)}%` }}
                type="button"
              >
                <span>{snapshot.minute}'</span>
              </button>
            ))}
          </div>
          <div className="arc-stats">
            <Metric label={t.low} value={String(sentimentLow)} />
            <Metric label={t.now} value={String(frame.market.sentiment)} />
            <Metric label={t.high} value={String(sentimentHigh)} />
          </div>
        </article>

        <article className="panel insight-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.momentumInsight}</p>
            <h2>{t.whyMomentMatters}</h2>
          </div>
          <p className="insight-copy">{frame.insight.headline}</p>
          <div className="insight-metrics">
            <Metric
              label={t.swing}
              value={`${frame.insight.swing > 0 ? "+" : ""}${frame.insight.swing}`}
            />
            <Metric label={t.signal} value={frame.insight.swingLabel} />
            <Metric label={t.events} value={String(frame.insight.eventCount)} />
          </div>
          <p className="small-copy">
            {t.nextBeat}: {frame.insight.nextBeat}
          </p>
        </article>

        <article className="panel phase-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.matchIntelligence}</p>
            <h2>{t.phaseSummary}</h2>
          </div>
          <div className="phase-card">
            <span>{phaseSummary.phase}</span>
            <strong>{phaseSummary.headline}</strong>
            <p>{phaseSummary.body}</p>
          </div>
          <div className="event-stack" aria-label={t.eventStack}>
            <Metric label={t.goals} value={String(eventStats.goals)} />
            <Metric label={t.cards} value={String(eventStats.cards)} />
            <Metric label={t.subs} value={String(eventStats.substitutions)} />
            <Metric label={t.marketSwings} value={String(eventStats.marketSwings)} />
          </div>
        </article>

        <article className="panel player-impact-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.matchIntelligence}</p>
            <h2>{t.playerImpact}</h2>
          </div>
          <div className="impact-list">
            {playerImpact.length ? (
              playerImpact.map((player) => (
                <section key={`${player.team}-${player.name}`}>
                  <div>
                    <strong>{player.name}</strong>
                    <span>{player.team}</span>
                  </div>
                  <p>
                    {t.involved}: {player.events} / {t.minutes}: {player.minutes.join(", ")}
                  </p>
                </section>
              ))
            ) : (
              <p className="small-copy">{t.noPlayerEvents}</p>
            )}
          </div>
        </article>

        <article className="panel submission-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.submissionSnapshot}</p>
            <h2>{t.judgeReadyPacket}</h2>
          </div>
          <dl className="submission-grid">
            {submissionSnapshot.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="panel teams-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.matchCenter}</p>
            <h2>{t.teamProfiles}</h2>
          </div>
          <div className="team-profile-grid">
            <TeamProfile labels={t} team={match.home} />
            <TeamProfile labels={t} team={match.away} />
          </div>
        </article>

        {match.groupTable ? (
          <article className="panel table-panel">
            <div className="panel-heading">
              <p className="eyebrow">{t.matchCenter}</p>
              <h2>{t.groupTable}</h2>
            </div>
            <div className="standings-table" role="table">
              {match.groupTable.map((standing) => (
                <div key={standing.teamCode} role="row">
                  <strong>{standing.teamCode}</strong>
                  <span>P{standing.played}</span>
                  <span>{standing.points} pts</span>
                  <span>
                    GD {standing.goalDiff > 0 ? "+" : ""}
                    {standing.goalDiff}
                  </span>
                  <em>{standing.status}</em>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        <article className="panel share-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.shareCard}</p>
            <h2>{t.exportPulse}</h2>
          </div>
          <img alt="Current match pulse share card preview" src={sharePreview} />
          <button type="button" onClick={() => downloadShareCard(match, frame)}>
            {t.downloadSvg}
          </button>
        </article>

        <article className="panel timeline-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.timeline}</p>
            <h2>{t.keyEvents}</h2>
          </div>
          <div className="timeline-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <ol className="timeline">
            {frame.activeEvents.map((event) => (
              <li key={event.id} className={event.id === frame.latestEvent?.id ? "latest" : ""}>
                <time>
                  {event.minute}
                  {event.stoppage ? `+${event.stoppage}` : ""}'
                </time>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
          {nextEvent ? (
            <p className="next-event">
              {t.nextBeat}: {nextEvent.minute}'
            </p>
          ) : (
            <p className="next-event">{t.replayLoop}</p>
          )}
        </article>
      </section>
    </main>
  );
}

function getSourceStatus(source: DataSourceState, language: Language) {
  const t = localizedCopy[language];

  if (source.kind === "replay") {
    return { label: t.sourceReplay, message: t.sourceReplayMessage };
  }

  if (source.kind === "live-ready") {
    return { label: t.sourceLiveReady, message: t.sourceLiveReadyMessage };
  }

  if (source.kind === "needs-token") {
    return { label: t.sourceNeedsToken, message: t.sourceNeedsTokenMessage };
  }

  return { label: t.sourceError, message: source.message || t.sourceErrorMessage };
}

function getConsistencyRules(language: Language) {
  if (language === "zh") {
    return [
      "Live 只能来自配置后的 TxLINE 实时接口。",
      "Delay 表示类似实时的数据，但不承诺秒级同步。",
      "Replay 是固定历史回放，用于评审和录制演示。",
      "Seed 是球队、球员、裁判、积分等静态背景资料。",
    ];
  }

  if (language === "es") {
    return [
      "Live solo significa datos cargados desde TxLINE con token y endpoints configurados.",
      "Delay significa datos tipo live sin garantía de tiempo real.",
      "Replay significa datos históricos fijos para evaluación y video demo.",
      "Seed significa contexto estático como equipos, jugadores, árbitros y tablas.",
    ];
  }

  if (language === "pt") {
    return [
      "Live só significa dados carregados da TxLINE com token e endpoints configurados.",
      "Delay significa dados tipo live sem garantia de tempo real.",
      "Replay significa dados históricos fixos para avaliação e vídeo demo.",
      "Seed significa contexto estático como times, jogadores, árbitros e tabelas.",
    ];
  }

  return dataConsistencyState.rules;
}

function getTodayCardDisplay(
  item: { id: string; label: string; stage: string },
  language: Language,
) {
  const labels: Record<Language, Record<string, { label: string; stage: string }>> = {
    en: {
      "calendar-live-status": {
        label: "No public TxLINE live fixture configured",
        stage: "No Match Day / Token Required",
      },
      "wc-demo-arg-fra": { label: "Replay demo", stage: "Final replay" },
      "wc-demo-jpn-ger": { label: "Upset replay demo", stage: "Group stage replay" },
    },
    zh: {
      "calendar-live-status": {
        label: "未配置公开 TxLINE 实时赛程",
        stage: "无比赛日 / 需要 Token",
      },
      "wc-demo-arg-fra": { label: "回放演示", stage: "决赛回放" },
      "wc-demo-jpn-ger": { label: "爆冷回放演示", stage: "小组赛回放" },
    },
    es: {
      "calendar-live-status": {
        label: "Sin fixture live público TxLINE configurado",
        stage: "Día sin partido / Token requerido",
      },
      "wc-demo-arg-fra": { label: "Demo replay", stage: "Replay de final" },
      "wc-demo-jpn-ger": { label: "Demo replay de sorpresa", stage: "Replay de fase de grupos" },
    },
    pt: {
      "calendar-live-status": {
        label: "Sem fixture live público TxLINE configurado",
        stage: "Dia sem jogo / Token necessário",
      },
      "wc-demo-arg-fra": { label: "Demo replay", stage: "Replay da final" },
      "wc-demo-jpn-ger": { label: "Demo replay de zebra", stage: "Replay da fase de grupos" },
    },
  };

  return labels[language][item.id] ?? { label: item.label, stage: item.stage };
}

function buildEventStats(events: MatchEvent[]) {
  return events.reduce(
    (stats, event) => {
      if (event.type === "goal") {
        stats.goals += 1;
      }

      if (event.type === "yellow_card" || event.type === "red_card") {
        stats.cards += 1;
      }

      if (event.type === "substitution") {
        stats.substitutions += 1;
      }

      if (event.type === "odds_shift") {
        stats.marketSwings += 1;
      }

      return stats;
    },
    { goals: 0, cards: 0, substitutions: 0, marketSwings: 0 },
  );
}

function buildPlayerImpact(events: MatchEvent[]) {
  const impact = new Map<string, { name: string; team: string; events: number; minutes: number[] }>();

  for (const event of events) {
    if (!event.player) {
      continue;
    }

    const key = `${event.team ?? "TEAM"}-${event.player}`;
    const existing =
      impact.get(key) ??
      {
        name: event.player,
        team: event.team ?? "TEAM",
        events: 0,
        minutes: [],
      };

    existing.events += 1;
    existing.minutes.push(event.minute);
    impact.set(key, existing);
  }

  return [...impact.values()]
    .sort((first, second) => second.events - first.events || first.minutes[0] - second.minutes[0])
    .slice(0, 5);
}

function buildPhaseSummary(minute: number, match: MatchData, labels: CopyText) {
  if (minute >= 90) {
    return {
      phase: labels.postMatch,
      headline: `${match.home.code} ${match.events.at(-1)?.homeScore ?? 0}-${match.events.at(-1)?.awayScore ?? 0} ${match.away.code}`,
      body: labels.postMatchSummary,
    };
  }

  if (minute > 45) {
    return {
      phase: labels.secondHalf,
      headline: `${labels.currentRead}: ${match.stage ?? match.competition}`,
      body: labels.secondHalfSummary,
    };
  }

  if (minute > 1) {
    return {
      phase: labels.firstHalf,
      headline: `${labels.currentRead}: ${match.home.code} vs ${match.away.code}`,
      body: labels.firstHalfSummary,
    };
  }

  return {
    phase: labels.preMatch,
    headline: `${match.home.name} vs ${match.away.name}`,
    body: labels.preMatchSummary,
  };
}

function buildDemoChapters(labels: CopyText): DemoChapter[] {
  return [
    {
      id: "integrity",
      matchId: "wc-demo-arg-fra",
      minute: 1,
      label: labels.chapterIntegrity,
      summary: labels.chapterIntegrityNote,
      focus: labels.chapterIntegrityFocus,
    },
    {
      id: "goal-swing",
      matchId: "wc-demo-arg-fra",
      minute: 23,
      label: labels.chapterGoalSwing,
      summary: labels.chapterGoalNote,
      focus: labels.chapterGoalFocus,
    },
    {
      id: "late-volatility",
      matchId: "wc-demo-arg-fra",
      minute: 81,
      label: labels.chapterLateVolatility,
      summary: labels.chapterLateNote,
      focus: labels.chapterLateFocus,
    },
    {
      id: "upset-context",
      matchId: "wc-demo-jpn-ger",
      minute: 75,
      label: labels.chapterUpsetContext,
      summary: labels.chapterUpsetNote,
      focus: labels.chapterUpsetFocus,
    },
  ];
}

function formatKickoff(kickoffIso: string | undefined, language: Language) {
  if (!kickoffIso) {
    return "TBD";
  }

  return new Intl.DateTimeFormat(getDateLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(kickoffIso));
}

function getDateLocale(language: Language) {
  if (language === "zh") {
    return "zh-CN";
  }

  if (language === "es") {
    return "es-ES";
  }

  if (language === "pt") {
    return "pt-BR";
  }

  return "en-US";
}

function TeamBadge({ code, color, name }: { code: string; color: string; name: string }) {
  return (
    <div className="team-badge">
      <span style={{ background: color }}>{code}</span>
      <strong>{name}</strong>
    </div>
  );
}

function TeamProfile({ labels, team }: { labels: CopyText; team: Team }) {
  return (
    <section className="team-profile">
      <div className="team-profile-heading">
        <span style={{ background: team.color }}>{team.code}</span>
        <div>
          <strong>{team.name}</strong>
          <p>{team.group ?? "World Cup seed"}</p>
        </div>
      </div>
      <p>{team.profile ?? team.record}</p>
      <dl>
        <div>
          <dt>{labels.coach}</dt>
          <dd>{team.coach ?? "TBD"}</dd>
        </div>
        <div>
          <dt>{labels.dataStatus}</dt>
          <dd>{team.record ?? "Seed profile"}</dd>
        </div>
      </dl>
      <strong className="mini-heading">{labels.keyPlayers}</strong>
      <div className="player-list">
        {(team.keyPlayers ?? []).map((player) => (
          <article key={player.name}>
            <strong>{player.name}</strong>
            <span>
              {player.position} / {player.role}
            </span>
            <p>{player.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Pressure({ label, value }: { label: string; value: number }) {
  return (
    <div className="pressure">
      <div>
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <meter max={100} min={0} value={value} />
    </div>
  );
}

function Odds({ label, value }: { label: string; value: number }) {
  return (
    <div className="odds-card">
      <span>{label}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
