import { useEffect, useMemo, useState } from "react";
import {
  manualSteps,
  matchBriefings,
  teamAtlas,
  viewPresets,
  type MatchBriefing,
  type ManualStep,
  type TeamGuide,
  type ViewPreset,
} from "./data/fanGuide";
import { dataConsistencyState } from "./data/matchCalendar";
import { replayMatches } from "./data/replayMatch";
import { buildPulseFrame } from "./lib/pulse";
import { buildShareCardSvg, downloadPredictionCard, downloadShareCard } from "./lib/shareCard";
import { loadMatchData } from "./lib/txlineAdapter";
import type { DataSourceState, MatchData, MatchEvent, MatchMode, Team } from "./types";

const replayDurationMs = 46000;
const maxMinute = 90;
const liveRefreshIntervalMs = 60000;
const replaySpeeds = [0.5, 1, 2, 4] as const;
const alertThresholdOptions = [55, 65, 78] as const;

type Language = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";
type PredictionPick = "home" | "draw" | "away";
type AlertThreshold = (typeof alertThresholdOptions)[number];
type LanguageOption = { code: Language; label: string; region: string };

const highValueEventTypes = new Set<MatchEvent["type"]>(["goal", "red_card", "odds_shift"]);

const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", region: "Global" },
  { code: "zh", label: "中文", region: "China / Global" },
  { code: "es", label: "Español", region: "Argentina / Spain / LatAm" },
  { code: "pt", label: "Português", region: "Brazil / Portugal" },
  { code: "fr", label: "Français", region: "France / Francophone fans" },
  { code: "de", label: "Deutsch", region: "Germany / Austria" },
  { code: "ja", label: "日本語", region: "Japan" },
  { code: "ar", label: "العربية", region: "Jordan / Algeria / MENA" },
];

const displayLanguageOptions = languageOptions;

const copy = {
  en: {
    appEyebrow: "Superteam Earn x TxODDS / Consumer Fan Experience",
    eventBuildStatus: "World Cup Hackathon build",
    judgeableBuild: "Judgeable public build",
    txlineLiveGated: "TxLINE Live activation-ready",
    settings: "Settings",
    close: "Close",
    language: "Language",
    english: "English",
    chinese: "Chinese",
    replay: "Replay",
    live: "Live",
    mockFixture: "Mock fixture",
    txlineAdapter: "TxLINE adapter",
    waitingForTxline: "Live updates unavailable",
    sourceReplay: "Replay data ready",
    sourceLiveReady: "Live adapter ready",
    sourceNeedsToken: "Live updates unavailable",
    sourceError: "Data source error",
    sourceReplayMessage: "Replay mode uses fixed match data so the demo works without live access.",
    sourceLiveReadyMessage: "Live mode is wired through the TxLINE adapter boundary.",
    sourceNeedsTokenMessage:
      "Verified replay and scheduled match information remain available while live updates are unavailable.",
    sourceErrorMessage: "The app can fall back to replay mode while the live source is unavailable.",
    todayBoard: "Source board",
    dataConsistency: "Data consistency",
    noMatchDayRule:
      "The public build only uses verified states: Replay for demo scenarios, Seed for observed schedule/context, and Live only after authenticated TxLINE payloads load.",
    checkedAt: "Source checked",
    source: "Source",
    publicSeedSource: "Observed schedule snapshot + replay fixtures",
    freshness: "Freshness",
    sourceWindow: "Source window",
    sourceBoundary: "Replay and Seed stay labeled until TxLINE live payloads authenticate.",
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
    controlsStatus: "Display controls",
    dailyBrief: "Daily Brief",
    fansNeedKnow: "What fans need to know",
    dailyBriefBody:
      "The public build is judgeable at any time. Replay drives the match flow, while schedule and team context stay labeled as Seed until authenticated TxLINE data is loaded.",
    dailyPointOne: "Replay mode demonstrates the complete fan experience at any time.",
    dailyPointTwo: "Seed context covers teams, players, referee, and standings where relevant.",
    dailyPointThree: "Live mode is visible but gated until a devnet free-tier token is activated and verified locally.",
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
    endpointPending: "Live updates unavailable",
    apiAccessPlan: "API access plan",
    apiAccessTitle: "Live data path",
    apiAccessImplemented: "Implemented now",
    apiAccessImplementedNote:
      "Fixtures, score snapshots, odds snapshots, replay fallback, and the local probe are already wired.",
    apiAccessTokenBlocked: "Devnet activation gate",
    apiAccessTokenBlockedNote:
      "Authenticated Live now follows the TxLINE devnet free-tier route: subscribe txSig, guest JWT, /api/token/activate, then local probe.",
    apiAccessProxyStatus: "Online proxy mode",
    apiAccessProxyConfigured: "Proxy configured. Browser traffic can stay token-free.",
    apiAccessProxyMissing: "Not configured. GitHub Pages stays Replay/Seed until a secure proxy is deployed.",
    apiAccessReviewFallback: "Judgeable fallback",
    apiAccessReviewFallbackNote:
      "Replay and Seed remain visible, labeled, and usable when no live match or token is available.",
    apiAccessAskOfficial: "Ask TxODDS for",
    apiAccessQuestionToken: "Fixture ids and final-score proof guidance",
    apiAccessQuestionCors: "CORS policy and whether browser demos are allowed",
    apiAccessQuestionLimits: "Rate limits, fixture access, delay level, and SSE rules",
    operatorKit: "Operator kit",
    operatorTitle: "Would a buyer license this?",
    operatorBuyerQuestion: "Buyer decision",
    operatorBuyerAnswer:
      "Yes for venues, fan communities, and media pages if live TxLINE data is activated through a secure proxy; not yet as a paid standalone consumer app without true live payloads.",
    operatorVenue: "Sports bars / fan zones",
    operatorVenueNote:
      "Use the tune-in signal, score pulse, and sponsor-safe moments on a shared screen while fans keep predictions local.",
    operatorCommunity: "Creators / communities",
    operatorCommunityNote:
      "Shareable pick cards, multilingual reads, and replayable match moments give community managers content without running a betting pool.",
    operatorMedia: "Media / club pages",
    operatorMediaNote:
      "Embed as a lightweight second-screen match center with explicit Replay, Seed, Live, and freshness labels.",
    operatorProofLatency: "Timeliness contract",
    operatorProofLatencyNote:
      "The app shows source freshness. Live should only be claimed after authenticated TxLINE payloads load; otherwise it stays Replay or Seed.",
    operatorProofSafety: "Brand safety",
    operatorProofSafetyNote:
      "No wallet custody, no betting calls, no pirated video, no private token in the browser bundle.",
    operatorProofCommercial: "Commercial path",
    operatorProofCommercialNote:
      "White-label attention layer, venue screen, sponsor moments, and API-backed match intelligence.",
    competitorEdgeTitle: "Competitive edge",
    competitorEdgeFinalWhistle: "Against room products: simpler, instant, no host setup.",
    competitorEdgeProof: "Against proof/trading tools: more consumer-readable, less financial.",
    competitorEdgeOurEdge: "Our edge: attention signal + trust labels + multilingual fan view.",
    competitorEdgeBlocker: "To be number one: activate real TxLINE live and record the demo video.",
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
    settingsHelper: "Adjust only language, review mode, and visible modules.",
    viewingPreset: "Viewing preset",
    dashboardModules: "Dashboard modules",
    operationManualToggle: "Operation manual",
    fixtureBriefingToggle: "Fixture briefing",
    countryAtlasToggle: "Country team atlas",
    operationManualEyebrow: "Operation Manual",
    operationManualTitle: "How to read this dashboard on matchday",
    operationManualBody:
      "Start from source truth, then move through score, pulse, market mood, and share output. This keeps the product helpful for fans without turning it into a betting screen.",
    fixtureBriefingEyebrow: "Match Intelligence",
    fixtureBriefingTitle: "Fixture briefing and data rules",
    countryAtlasEyebrow: "Country Team Atlas",
    countryAtlasTitle: "Teams, styles, and fan context",
    teamStyle: "Style",
    fanRead: "Fan read",
    watchFor: "Watch for",
    dataNote: "Data note",
    videoPanelToggle: "Authorized video sync",
    videoSyncEyebrow: "Video Layer",
    videoSyncTitle: "Authorized match video sync",
    videoSyncBody:
      "The public build does not embed match video. It can show an official broadcaster, FIFA, or YouTube Live embed only when a rights-cleared URL is configured.",
    noVideoSource: "No authorized video source configured",
    videoProvider: "Provider",
    videoStatus: "Status",
    videoStatusValue: "Rights required",
    videoClockSync: "Sync target",
    videoClockSyncValue: "Match clock or replay minute",
    videoRightsNote: "Rights note",
    videoRightsNoteValue: "No scraping, no unofficial streams, no pirated video.",
    fanCommand: "Fan command",
    watchNow: "Watch now",
    watchSignal: "Tune-in signal",
    watchSignalNow: "Watch now",
    watchSignalSoon: "Stay close",
    watchSignalLater: "Catch up later",
    watchSignalReasonHot: "Pulse, score, or market movement says the match is worth attention now.",
    watchSignalReasonNext: "A key moment is close enough that leaving the match may cost context.",
    watchSignalReasonCalm: "The match is calm. Keep it in the background until the pulse rises.",
    alertThreshold: "Alert threshold",
    alertNow: "Would alert now",
    alertQuiet: "No alert yet",
    alertLow: "Early",
    alertBalanced: "Balanced",
    alertStrict: "Big swings",
    attentionNotBetting: "Attention signal only, not betting advice",
    minutesToKeyMoment: "min to next key moment",
    fanPrediction: "Fan score pick",
    predictionBody:
      "A local matchday pick for conversation only. No betting, no wallet, no trading advice.",
    predictionSafety: "Entertainment pick only",
    yourPick: "Your pick",
    fanLean: "Fan lean",
    dataBacked: "Data-backed context",
    openTeamInfo: "Open team cards",
    openFixtureInfo: "Open match details",
    liveFeed: "Match event feed",
    waitingForKickoff: "Waiting for kickoff",
    quickPick: "Quick pick",
    localOnly: "Local only",
    scoreLinkedPick: "Score-linked pick",
    focusNav: "Match focus",
    focusWatch: "Watch",
    focusPick: "Pick",
    focusTimeline: "Timeline",
    focusMood: "Mood",
    focusTeams: "Teams",
    matchdayHub: "Matchday hub",
    todaysMatches: "Schedule snapshot",
    nowPlaying: "Now playing",
    tokenRequiredShort: "Activate first",
    replayAvailable: "Replay available",
    officialSeed: "Official seed",
    downloadPickCard: "Download pick card",
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
    sourceNeedsTokenMessage: "先完成 devnet 免费层激活，再只把 token 放到本地 .env.local。",
    sourceErrorMessage: "实时源不可用时，页面可以退回回放模式继续展示。",
    todayBoard: "数据源看板",
    dataConsistency: "数据一致性",
    noMatchDayRule:
      "不会伪造实时比赛。如果 TxLINE 当天没有比赛，或 token 未配置，公开版本会明确标注 Replay 和 Seed 数据。",
    checkedAt: "种子快照",
    source: "数据来源",
    publicSeedSource: "公开版本：种子赛程 + 回放赛程",
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
    dailyPointThree: "实时模式已经露出入口，但需要 devnet 免费层 token 本地验证后才启用。",
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
    endpointPending: "实时更新暂不可用",
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

type CopyShape = { [Key in keyof typeof copy.en]: string };

const cleanZhCopy = {
  ...copy.en,
  eventBuildStatus: "世界杯黑客松参赛版",
  judgeableBuild: "公开版本可随时评审",
  txlineLiveGated: "TxLINE Live 待激活",
  appEyebrow: "Superteam Earn x TxODDS / 球迷体验赛道",
  settings: "设置",
  close: "关闭",
  language: "语言",
  english: "English",
  chinese: "中文",
  replay: "回放",
  live: "实时",
  mockFixture: "回放数据",
  txlineAdapter: "TxLINE 接入层",
  waitingForTxline: "实时待激活",
  sourceReplay: "回放数据已就绪",
  sourceLiveReady: "实时数据已接入",
  sourceNeedsToken: "实时待激活",
  sourceError: "数据源错误",
  sourceReplayMessage: "回放模式使用固定比赛数据，评委可以随时完整体验。",
  sourceLiveReadyMessage: "实时模式已通过 TxLINE adapter 加载。",
  sourceNeedsTokenMessage: "先完成 devnet 免费层激活，再只把 token 放入本地 .env.local，不要提交到仓库。",
  sourceErrorMessage: "实时源不可用时，页面会明确显示错误并保留回放兜底。",
  todayBoard: "数据源看板",
  dataConsistency: "数据一致性",
  noMatchDayRule:
    "公开版只使用可验证状态：Replay 用于演示回放，Seed 用于已观察到的赛程/背景资料，Live 只在 TxLINE 鉴权数据成功加载后出现。",
  checkedAt: "来源核验时间",
  source: "来源",
  publicSeedSource: "赛程快照观察值 + 回放赛程",
  freshness: "数据新鲜度",
  sourceWindow: "来源窗口",
  sourceBoundary: "Replay 和 Seed 会保持标签，直到 TxLINE 实时载荷鉴权成功。",
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
  noBetting: "不下注",
  aiCommentary: "AI 解说",
  oneLineRead: "一句话比赛解读",
  pressure: "压力地图",
  neutral: "中立",
  marketMood: "市场情绪，不是建议",
  oddsMovement: "赔率/情绪变化",
  draw: "平局",
  marketSafety:
    "这里只把市场变化作为球迷上下文展示，不提供下注、交易建议、钱包或托管功能。",
  pulseArc: "脉冲曲线",
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
  judgeReadyPacket: "评委可读信息",
  publicBuild: "公开部署",
  liveData: "实时数据",
  adapterGated: "接入层已隔离",
  safety: "安全边界",
  matchCenter: "比赛中心",
  matchFacts: "比赛信息",
  kickoff: "开球时间",
  referee: "裁判",
  dataStatus: "数据状态",
  discipline: "红黄牌",
  noCards: "暂无红黄牌",
  qualification: "晋级语境",
  groupTable: "小组积分",
  teamProfiles: "球队资料",
  coach: "主教练",
  keyPlayers: "关键球员",
  shareCard: "球迷分享卡",
  exportPulse: "导出当前脉冲",
  downloadSvg: "下载 SVG",
  timeline: "比赛时间线",
  keyEvents: "关键事件",
  replayLoop: "回放将重新开始。",
  matchLevel: "比分持平",
  controlsStatus: "显示控制",
  dailyBrief: "每日简报",
  fansNeedKnow: "球迷现在需要知道什么",
  dailyBriefBody:
    "公开版任何时间都可评审。Replay 负责比赛流程演示，赛程和球队背景保持 Seed 标签，直到 TxLINE 鉴权数据加载成功。",
  dailyPointOne: "Replay 模式可以随时完整演示球迷体验。",
  dailyPointTwo: "Seed 资料用于赛程、球队、球员、裁判和积分语境。",
  dailyPointThree: "Live 模式已接官方端点，但需要 devnet 免费层 token 本地验证后才能加载。",
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
  replayFixtures: "2 个回放赛程",
  seedProfiles: "球队、球员、裁判、积分",
  noLiveFixture: "未配置实时赛程",
  replayFallbackReady: "回放兜底已就绪",
  endpointPending: "实时更新暂不可用",
  apiAccessPlan: "API 接入方案",
  apiAccessTitle: "实时数据路径",
  apiAccessImplemented: "已经完成",
  apiAccessImplementedNote: "赛程、比分快照、赔率快照、回放兜底和本地探针已经接好。",
  apiAccessTokenBlocked: "devnet 激活门槛",
  apiAccessTokenBlockedNote: "鉴权 Live 走 TxLINE devnet 免费层：订阅 txSig、guest JWT、/api/token/activate，然后本地探针验证。",
  apiAccessProxyStatus: "线上代理模式",
  apiAccessProxyConfigured: "已配置代理，浏览器流量不暴露 token。",
  apiAccessProxyMissing: "未配置代理。GitHub Pages 在安全代理部署前保持 Replay/Seed。",
  apiAccessReviewFallback: "评审兜底",
  apiAccessReviewFallbackNote: "没有实时比赛或 token 时，Replay 与 Seed 仍可见、可用且有明确标签。",
  apiAccessAskOfficial: "向 TxODDS 确认",
  apiAccessQuestionToken: "Fixture IDs 与最终比分 proof 规则",
  apiAccessQuestionCors: "CORS 策略以及是否允许浏览器演示",
  apiAccessQuestionLimits: "速率限制、fixture 权限、延迟等级和 SSE 规则",
  operatorKit: "运营方套件",
  operatorTitle: "厂家会愿意买吗？",
  operatorBuyerQuestion: "买方判断",
  operatorBuyerAnswer:
    "如果通过安全代理接入真实 TxLINE live 数据，酒吧、球迷社区、媒体页会有购买理由；如果没有真实 live payload，还不足以作为独立付费消费应用。",
  operatorVenue: "体育酒吧 / 球迷现场",
  operatorVenueNote: "把观看信号、比分脉冲和品牌安全节点放到大屏，球迷预测仍只保存在本地。",
  operatorCommunity: "创作者 / 社区",
  operatorCommunityNote: "可分享预测卡、多语言解读和可回放节点，能给社群运营内容，但不变成投注平台。",
  operatorMedia: "媒体 / 俱乐部页面",
  operatorMediaNote: "作为轻量第二屏比赛中心嵌入，并明确标注 Replay、Seed、Live 和刷新时间。",
  operatorProofLatency: "及时性契约",
  operatorProofLatencyNote: "页面展示来源新鲜度。只有 TxLINE 鉴权数据成功加载后才称为 Live，否则保持 Replay 或 Seed。",
  operatorProofSafety: "品牌安全",
  operatorProofSafetyNote: "不托管钱包、不引导下注、不盗播视频、不把私密 token 打进浏览器包。",
  operatorProofCommercial: "商业路径",
  operatorProofCommercialNote: "白标注意力层、场馆大屏、赞助节点和 API 驱动的比赛智能。",
  competitorEdgeTitle: "竞争优势",
  competitorEdgeFinalWhistle: "对比房间类产品：更轻、更快打开、不需要房主设置。",
  competitorEdgeProof: "对比证明/交易工具：更面向普通球迷，不金融化。",
  competitorEdgeOurEdge: "我们的优势：观看信号 + 数据可信标签 + 多语言球迷视图。",
  competitorEdgeBlocker: "冲第一还差：真实 TxLINE live 接入和最终 demo 视频。",
  matchIntelligence: "比赛智能层",
  phaseSummary: "阶段摘要",
  preMatch: "赛前",
  firstHalf: "上半场",
  secondHalf: "下半场",
  postMatch: "赛后",
  playerImpact: "球员影响",
  eventStack: "事件统计",
  goals: "进球",
  cards: "牌",
  subs: "换人",
  marketSwings: "市场波动",
  involved: "参与",
  noPlayerEvents: "暂无球员关联事件",
  minutes: "分钟",
  currentRead: "当前解读",
  firstHalfSummary: "上半场建立情绪基线，之后换人和压力会改变整场脉冲。",
  secondHalfSummary: "下半场最容易出现波动：进球、红黄牌和市场变化会重塑球迷叙事。",
  postMatchSummary: "回放已完成，比分、上下文、市场情绪和安全边界都可供评审查看。",
  preMatchSummary: "比赛从种子资料开始：球队、场地、裁判、开球时间和回放场景都清楚。",
  judgeDemo: "评委演示",
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
  settingsHelper: "只调整语言、评审视图和可见模块。",
  viewingPreset: "观看预设",
  dashboardModules: "看板模块",
  operationManualToggle: "操作手册",
  fixtureBriefingToggle: "赛程说明",
  countryAtlasToggle: "国家队资料",
  operationManualEyebrow: "操作手册",
  operationManualTitle: "比赛日如何阅读这个看板",
  operationManualBody:
    "先确认数据来源，再看比分、情绪脉冲、市场气氛和分享卡。这样对球迷有帮助，同时不会变成下注界面。",
  fixtureBriefingEyebrow: "比赛情报",
  fixtureBriefingTitle: "赛程说明与数据规则",
  countryAtlasEyebrow: "国家队资料",
  countryAtlasTitle: "球队、风格与球迷语境",
  teamStyle: "打法风格",
  fanRead: "球迷解读",
  watchFor: "重点观察",
  dataNote: "数据说明",
  videoPanelToggle: "授权视频同步",
  videoSyncEyebrow: "视频层",
  videoSyncTitle: "授权比赛视频同步",
  videoSyncBody:
    "公开版不嵌入比赛视频。只有拿到官方转播方、FIFA 或 YouTube Live 等授权 embed URL 后，才会显示播放器。",
  noVideoSource: "未配置授权视频源",
  videoProvider: "视频来源",
  videoStatus: "状态",
  videoStatusValue: "需要授权",
  videoClockSync: "同步目标",
  videoClockSyncValue: "比赛时钟或回放分钟",
  videoRightsNote: "版权边界",
  videoRightsNoteValue: "不抓取、不盗播、不接入非官方视频流。",
  fanCommand: "看球主视图",
  watchNow: "现在看什么",
  watchSignal: "观看信号",
  watchSignalNow: "现在就看",
  watchSignalSoon: "别走太远",
  watchSignalLater: "稍后补看",
  watchSignalReasonHot: "脉冲、比分或市场波动显示，这场比赛现在值得注意。",
  watchSignalReasonNext: "关键节点已经接近，离开可能错过上下文。",
  watchSignalReasonCalm: "比赛暂时平稳，可以后台关注，等脉冲升高再回来。",
  alertThreshold: "提醒阈值",
  alertNow: "现在会提醒",
  alertQuiet: "暂不提醒",
  alertLow: "早提醒",
  alertBalanced: "平衡",
  alertStrict: "只看大波动",
  attentionNotBetting: "只是注意力信号，不是投注建议",
  minutesToKeyMoment: "分钟到下一关键节点",
  fanPrediction: "球迷比分预测",
  predictionBody: "仅用于看球讨论的本地选择，不下注、不接钱包、不提供交易建议。",
  predictionSafety: "娱乐预测，不是投注建议",
  yourPick: "我的选择",
  fanLean: "球迷倾向",
  dataBacked: "数据上下文",
  openTeamInfo: "打开球队/球员资料",
  openFixtureInfo: "打开比赛详情",
  liveFeed: "比赛事件流",
  waitingForKickoff: "等待开球",
  quickPick: "快速选择",
  localOnly: "仅保存在本地",
  scoreLinkedPick: "比分联动选择",
  focusNav: "比赛焦点",
  focusWatch: "看比赛",
  focusPick: "猜比分",
  focusTimeline: "时间线",
  focusMood: "走势",
  focusTeams: "球队",
  matchdayHub: "比赛日入口",
  todaysMatches: "赛程快照",
  nowPlaying: "正在观看",
  tokenRequiredShort: "待激活",
  replayAvailable: "可回放",
  officialSeed: "官方种子",
  downloadPickCard: "下载预测卡",
} satisfies CopyShape;

const localizedCopy = {
  en: copy.en,
  zh: cleanZhCopy,
  es: {
    ...copy.en,
    appEyebrow: "MVP para Superteam Earn / TxODDS Hackathon",
    eventBuildStatus: "Build World Cup Hackathon",
    judgeableBuild: "Build pública evaluable",
    txlineLiveGated: "TxLINE Live requiere token",
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
    sourceNeedsTokenMessage: "Activa primero el free tier devnet y guarda el token solo en .env.local.",
    sourceErrorMessage: "La app puede volver a Replay si la fuente live no está disponible.",
    todayBoard: "Panel de fuente",
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
    dailyPointThree: "Live está visible, pero bloqueado hasta activar y verificar un token devnet free-tier.",
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
    endpointPending: "Las actualizaciones en vivo no están disponibles",
    apiAccessPlan: "Plan de acceso API",
    apiAccessTitle: "Ruta de datos en vivo",
    apiAccessImplemented: "Implementado ahora",
    apiAccessImplementedNote:
      "Fixtures, snapshots de marcador, snapshots de cuotas, fallback replay y probe local ya están conectados.",
    apiAccessTokenBlocked: "Puerta de token oficial",
    apiAccessTokenBlockedNote:
      "Live autenticado usa la ruta devnet free-tier: subscribe txSig, guest JWT, /api/token/activate y probe local.",
    apiAccessProxyStatus: "Modo proxy online",
    apiAccessProxyConfigured: "Proxy configurado. El navegador puede seguir sin token.",
    apiAccessProxyMissing: "Sin proxy. GitHub Pages queda en Replay/Seed hasta desplegar un proxy seguro.",
    apiAccessReviewFallback: "Fallback evaluable",
    apiAccessReviewFallbackNote:
      "Replay y Seed siguen visibles, etiquetados y utilizables sin partido live o token.",
    apiAccessAskOfficial: "Pedir a TxODDS",
    apiAccessQuestionToken: "Fixture ids y regla de proof del resultado final",
    apiAccessQuestionCors: "Política CORS y si permiten demos en navegador",
    apiAccessQuestionLimits: "Rate limits, acceso a fixtures, nivel de delay y reglas SSE",
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
    settingsHelper: "Ajusta solo idioma, modo de revisión y módulos visibles.",
    viewingPreset: "Preset de vista",
    dashboardModules: "Módulos del panel",
    operationManualToggle: "Manual de uso",
    fixtureBriefingToggle: "Briefing del partido",
    countryAtlasToggle: "Atlas de equipos",
    videoPanelToggle: "Video autorizado",
  },
  pt: {
    ...copy.en,
    appEyebrow: "MVP para Superteam Earn / TxODDS Hackathon",
    eventBuildStatus: "Build World Cup Hackathon",
    judgeableBuild: "Build pública avaliável",
    txlineLiveGated: "TxLINE Live exige token",
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
    sourceNeedsTokenMessage: "Ative primeiro o free tier devnet e guarde o token só em .env.local.",
    sourceErrorMessage: "O app pode voltar para Replay se a fonte live estiver indisponível.",
    todayBoard: "Painel de fonte",
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
    dailyPointThree: "Live está visível, mas bloqueado até ativar e verificar um token devnet free-tier.",
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
    endpointPending: "As atualizações ao vivo estão indisponíveis",
    apiAccessPlan: "Plano de acesso API",
    apiAccessTitle: "Caminho dos dados ao vivo",
    apiAccessImplemented: "Implementado agora",
    apiAccessImplementedNote:
      "Fixtures, snapshots de placar, snapshots de odds, fallback replay e probe local já estão conectados.",
    apiAccessTokenBlocked: "Porta do token oficial",
    apiAccessTokenBlockedNote:
      "Live autenticado usa a rota devnet free-tier: subscribe txSig, guest JWT, /api/token/activate e probe local.",
    apiAccessProxyStatus: "Modo proxy online",
    apiAccessProxyConfigured: "Proxy configurado. O navegador pode continuar sem token.",
    apiAccessProxyMissing: "Sem proxy. GitHub Pages fica em Replay/Seed até um proxy seguro ser implantado.",
    apiAccessReviewFallback: "Fallback avaliável",
    apiAccessReviewFallbackNote:
      "Replay e Seed continuam visíveis, rotulados e utilizáveis sem jogo live ou token.",
    apiAccessAskOfficial: "Pedir à TxODDS",
    apiAccessQuestionToken: "Fixture ids e regra de proof do resultado final",
    apiAccessQuestionCors: "Política CORS e se demos no navegador são permitidas",
    apiAccessQuestionLimits: "Rate limits, acesso a fixtures, nível de delay e regras SSE",
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
    settingsHelper: "Ajuste apenas idioma, modo de revisão e módulos visíveis.",
    viewingPreset: "Preset de visualização",
    dashboardModules: "Módulos do painel",
    operationManualToggle: "Manual de uso",
    fixtureBriefingToggle: "Briefing do jogo",
    countryAtlasToggle: "Atlas de times",
    videoPanelToggle: "Vídeo autorizado",
  },
  fr: {
    ...copy.en,
    appEyebrow: "Superteam Earn x TxODDS / expérience supporters",
    eventBuildStatus: "Build World Cup Hackathon",
    judgeableBuild: "Build public évaluable",
    txlineLiveGated: "TxLINE Live nécessite un token",
    settings: "Réglages",
    close: "Fermer",
    language: "Langue",
    replay: "Replay",
    live: "Direct",
    mockFixture: "Données replay",
    txlineAdapter: "Adaptateur TxLINE",
    waitingForTxline: "En attente du token TxLINE",
    sourceReplay: "Replay prêt",
    sourceNeedsToken: "Token TxLINE requis",
    sourceReplayMessage: "Le replay utilise des données fixes pour rester jugeable sans accès live.",
    sourceNeedsTokenMessage: "Activez d'abord le free tier devnet, puis gardez le token uniquement dans .env.local.",
    todayBoard: "Tableau source",
    checkedAt: "Source vérifiée",
    publicSeedSource: "Snapshot calendrier + replays",
    freshness: "Fraîcheur",
    source: "Source",
    currentMode: "Mode actuel",
    canonicalSource: "Source canonique",
    replayCoverage: "Couverture replay",
    seedCoverage: "Contexte seed",
    liveReadiness: "Préparation live",
    tokenStatus: "Token",
    endpointStatus: "Endpoints",
    calendarStatus: "Calendrier",
    fallbackStatus: "Secours",
    sourceBoundary: "Replay et Seed restent visibles jusqu'à l'authentification TxLINE live.",
    endpointPending: "Les mises à jour en direct sont indisponibles",
    apiAccessPlan: "Plan d'accès API",
    apiAccessTitle: "Chemin des données live",
    apiAccessImplemented: "Déjà implémenté",
    apiAccessImplementedNote:
      "Fixtures, snapshots score, snapshots cotes, fallback replay et probe local sont déjà câblés.",
    apiAccessTokenBlocked: "Accès token officiel",
    apiAccessTokenBlockedNote:
      "Le Live authentifié suit le free tier devnet: subscribe txSig, guest JWT, /api/token/activate, puis probe local.",
    apiAccessProxyStatus: "Mode proxy en ligne",
    apiAccessProxyConfigured: "Proxy configuré. Le navigateur reste sans token.",
    apiAccessProxyMissing: "Proxy absent. GitHub Pages reste en Replay/Seed jusqu'au déploiement d'un proxy sûr.",
    apiAccessReviewFallback: "Fallback évaluable",
    apiAccessReviewFallbackNote:
      "Replay et Seed restent visibles, étiquetés et utilisables sans match live ou token.",
    apiAccessAskOfficial: "Demander à TxODDS",
    apiAccessQuestionToken: "Fixture ids et règle de preuve du score final",
    apiAccessQuestionCors: "Politique CORS et autorisation des demos navigateur",
    apiAccessQuestionLimits: "Rate limits, accès fixture, niveau de délai et règles SSE",
    play: "Lecture",
    pause: "Pause",
    reset: "Réinitialiser",
    clock: "Temps",
    pulse: "Pulse",
    latestBeat: "Dernier fait",
    nextBeat: "Prochain fait",
    noBetting: "Pas de pari",
    aiCommentary: "Commentaire IA",
    marketMood: "Humeur du marché, pas un conseil",
    fanCommand: "Vue supporter",
    watchNow: "À regarder maintenant",
    fanPrediction: "Pronostic score supporter",
    predictionBody: "Choix local pour discuter du match, sans pari, wallet ou conseil de trading.",
    predictionSafety: "Pronostic divertissement, pas conseil de pari",
    yourPick: "Mon choix",
    fanLean: "Tendance supporters",
    liveFeed: "Flux d'événements",
    waitingForKickoff: "En attente du coup d'envoi",
    quickPick: "Choix rapide",
    localOnly: "Local seulement",
    scoreLinkedPick: "Choix lié au score",
    focusNav: "Focus match",
    focusWatch: "Regarder",
    focusPick: "Choisir",
    focusTimeline: "Timeline",
    focusMood: "Mood",
    focusTeams: "Équipes",
    matchdayHub: "Hub matchday",
    todaysMatches: "Snapshot calendrier",
    nowPlaying: "En cours",
    tokenRequiredShort: "Token requis",
    replayAvailable: "Replay disponible",
    officialSeed: "Seed officiel",
    downloadPickCard: "Télécharger la carte",
    controlsStatus: "Contrôles d'affichage",
    settingsHelper: "Ajustez la langue, le mode de revue et les modules visibles.",
    viewingPreset: "Mode d'affichage",
    dashboardModules: "Modules du tableau",
    operationManualToggle: "Mode d'emploi",
    fixtureBriefingToggle: "Briefing match",
    countryAtlasToggle: "Atlas des équipes",
    videoPanelToggle: "Vidéo autorisée",
    draw: "Nul",
    oneLineRead: "Lecture du match",
    pressure: "Carte de pression",
    neutral: "Neutre",
    oddsMovement: "Mouvement des cotes",
    pulseArc: "Arc du pulse",
    matchMoodPath: "Trajectoire émotionnelle",
    low: "Bas",
    now: "Maintenant",
    high: "Haut",
    momentumInsight: "Lecture du momentum",
    whyMomentMatters: "Pourquoi ce moment compte",
    swing: "Bascule",
    signal: "Signal",
    events: "Événements",
    matchCenter: "Centre du match",
    matchFacts: "Infos match",
    kickoff: "Coup d'envoi",
    referee: "Arbitre",
    dataStatus: "État des données",
    discipline: "Discipline",
    noCards: "Aucun carton",
    qualification: "Contexte",
    groupTable: "Classement",
    teamProfiles: "Profils équipes",
    coach: "Sélectionneur",
    keyPlayers: "Joueurs clés",
    shareCard: "Carte supporter",
    exportPulse: "Exporter le pulse",
    downloadSvg: "Télécharger SVG",
    timeline: "Timeline du match",
    keyEvents: "Événements clés",
    replayLoop: "Le replay redémarrera.",
    matchLevel: "Score égal",
    dataBacked: "Contexte données",
    openTeamInfo: "Ouvrir les équipes",
    openFixtureInfo: "Ouvrir les détails",
    matchIntelligence: "Intelligence match",
    phaseSummary: "Résumé de phase",
    preMatch: "Avant-match",
    firstHalf: "Première mi-temps",
    secondHalf: "Deuxième mi-temps",
    postMatch: "Après-match",
    playerImpact: "Impact joueur",
    eventStack: "Pile d'événements",
    goals: "Buts",
    cards: "Cartons",
    subs: "Changements",
    marketSwings: "Basculements marché",
    involved: "Impliqué",
    noPlayerEvents: "Aucun événement joueur",
    minutes: "Minutes",
    currentRead: "Lecture actuelle",
    firstHalfSummary: "La première mi-temps pose la base émotionnelle avant les changements et la pression tardive.",
    secondHalfSummary: "La deuxième mi-temps concentre la volatilité : buts, cartons et mouvements de marché changent l'histoire.",
    postMatchSummary: "Le replay est complet avec score, contexte, humeur de marché et limites de sécurité.",
    preMatchSummary: "Le contexte est prêt : équipes, stade, arbitre, coup d'envoi et scénario replay.",
  },
  de: {
    ...copy.en,
    appEyebrow: "Superteam Earn x TxODDS / Fan Experience",
    eventBuildStatus: "World Cup Hackathon Build",
    judgeableBuild: "Öffentlich bewertbarer Build",
    txlineLiveGated: "TxLINE Live braucht Token",
    settings: "Einstellungen",
    close: "Schließen",
    language: "Sprache",
    replay: "Replay",
    live: "Live",
    mockFixture: "Replay-Daten",
    txlineAdapter: "TxLINE-Adapter",
    waitingForTxline: "Warten auf TxLINE-Token",
    sourceReplay: "Replay bereit",
    sourceNeedsToken: "TxLINE-Token nötig",
    sourceReplayMessage: "Replay nutzt feste Spieldaten, damit die Demo ohne Live-Zugang funktioniert.",
    sourceNeedsTokenMessage: "Zuerst den Devnet-Free-Tier aktivieren, dann Token nur lokal in .env.local speichern.",
    todayBoard: "Quellenboard",
    checkedAt: "Quelle geprüft",
    publicSeedSource: "Kalender-Snapshot + Replay-Spiele",
    freshness: "Aktualität",
    source: "Quelle",
    currentMode: "Aktueller Modus",
    canonicalSource: "Kanonische Quelle",
    replayCoverage: "Replay-Abdeckung",
    seedCoverage: "Seed-Abdeckung",
    liveReadiness: "Live-Bereitschaft",
    tokenStatus: "Token",
    endpointStatus: "Endpunkte",
    calendarStatus: "Kalender",
    fallbackStatus: "Fallback",
    sourceBoundary: "Replay und Seed bleiben markiert, bis TxLINE-Live-Daten authentifiziert sind.",
    endpointPending: "Live-Aktualisierungen sind nicht verfügbar",
    apiAccessPlan: "API-Zugriffsplan",
    apiAccessTitle: "Live-Datenpfad",
    apiAccessImplemented: "Bereits implementiert",
    apiAccessImplementedNote:
      "Fixtures, Score-Snapshots, Odds-Snapshots, Replay-Fallback und lokaler Probe sind verdrahtet.",
    apiAccessTokenBlocked: "Offizielles Token-Gate",
    apiAccessTokenBlockedNote:
      "Authentifiziertes Live nutzt die Devnet-Free-Tier-Route: subscribe txSig, Guest JWT, /api/token/activate, dann lokaler Probe.",
    apiAccessProxyStatus: "Online-Proxy-Modus",
    apiAccessProxyConfigured: "Proxy konfiguriert. Browser-Traffic bleibt tokenfrei.",
    apiAccessProxyMissing: "Kein Proxy. GitHub Pages bleibt Replay/Seed bis ein sicherer Proxy läuft.",
    apiAccessReviewFallback: "Bewertbarer Fallback",
    apiAccessReviewFallbackNote:
      "Replay und Seed bleiben sichtbar, markiert und nutzbar, wenn kein Live-Spiel oder Token vorhanden ist.",
    apiAccessAskOfficial: "Bei TxODDS anfragen",
    apiAccessQuestionToken: "Fixture-IDs und Proof-Regel für Endstand",
    apiAccessQuestionCors: "CORS-Regeln und ob Browser-Demos erlaubt sind",
    apiAccessQuestionLimits: "Rate Limits, Fixture-Zugriff, Verzögerung und SSE-Regeln",
    play: "Start",
    pause: "Pause",
    reset: "Zurücksetzen",
    clock: "Uhr",
    pulse: "Puls",
    latestBeat: "Letzter Moment",
    nextBeat: "Nächster Moment",
    noBetting: "Keine Wetten",
    aiCommentary: "KI-Kommentar",
    marketMood: "Marktstimmung, keine Beratung",
    fanCommand: "Fan-Ansicht",
    watchNow: "Jetzt wichtig",
    fanPrediction: "Fan-Score-Tipp",
    predictionBody: "Lokale Fan-Auswahl für Diskussionen, ohne Wette, Wallet oder Trading-Tipp.",
    predictionSafety: "Unterhaltungstipp, keine Wettberatung",
    yourPick: "Mein Tipp",
    fanLean: "Fan-Tendenz",
    liveFeed: "Ereignisfeed",
    waitingForKickoff: "Warten auf Anpfiff",
    quickPick: "Schnellwahl",
    localOnly: "Nur lokal",
    scoreLinkedPick: "Score-gekoppelt",
    focusNav: "Match-Fokus",
    focusWatch: "Schauen",
    focusPick: "Tippen",
    focusTimeline: "Timeline",
    focusMood: "Stimmung",
    focusTeams: "Teams",
    matchdayHub: "Matchday-Hub",
    todaysMatches: "Kalender-Snapshot",
    nowPlaying: "Läuft",
    tokenRequiredShort: "Token nötig",
    replayAvailable: "Replay verfügbar",
    officialSeed: "Offizieller Seed",
    downloadPickCard: "Tippkarte laden",
    controlsStatus: "Anzeige steuern",
    settingsHelper: "Sprache, Review-Modus und sichtbare Module anpassen.",
    viewingPreset: "Ansichtsmodus",
    dashboardModules: "Dashboard-Module",
    operationManualToggle: "Bedienhilfe",
    fixtureBriefingToggle: "Spielbriefing",
    countryAtlasToggle: "Team-Atlas",
    videoPanelToggle: "Autorisierte Videos",
    draw: "Unentschieden",
    oneLineRead: "Kurzlesung",
    pressure: "Druckkarte",
    neutral: "Neutral",
    oddsMovement: "Quotenbewegung",
    pulseArc: "Pulsbogen",
    matchMoodPath: "Stimmungsverlauf",
    low: "Tief",
    now: "Jetzt",
    high: "Hoch",
    momentumInsight: "Momentum-Lesung",
    whyMomentMatters: "Warum der Moment zählt",
    swing: "Swing",
    signal: "Signal",
    events: "Ereignisse",
    matchCenter: "Matchcenter",
    matchFacts: "Spieldaten",
    kickoff: "Anpfiff",
    referee: "Schiedsrichter",
    dataStatus: "Datenstatus",
    discipline: "Disziplin",
    noCards: "Noch keine Karten",
    qualification: "Kontext",
    groupTable: "Tabelle",
    teamProfiles: "Teamprofile",
    coach: "Trainer",
    keyPlayers: "Schlüsselspieler",
    shareCard: "Fankarte",
    exportPulse: "Puls exportieren",
    downloadSvg: "SVG laden",
    timeline: "Match-Timeline",
    keyEvents: "Schlüsselereignisse",
    replayLoop: "Replay startet neu.",
    matchLevel: "Ausgeglichen",
    dataBacked: "Datenkontext",
    openTeamInfo: "Teams öffnen",
    openFixtureInfo: "Details öffnen",
    matchIntelligence: "Match-Intelligence",
    phaseSummary: "Phasenbild",
    preMatch: "Vor dem Spiel",
    firstHalf: "Erste Halbzeit",
    secondHalf: "Zweite Halbzeit",
    postMatch: "Nach dem Spiel",
    playerImpact: "Spielerwirkung",
    eventStack: "Ereignisstapel",
    goals: "Tore",
    cards: "Karten",
    subs: "Wechsel",
    marketSwings: "Marktschwünge",
    involved: "Beteiligt",
    noPlayerEvents: "Noch kein Spielerereignis",
    minutes: "Minuten",
    currentRead: "Aktuelle Lesung",
    firstHalfSummary: "Die erste Halbzeit setzt den emotionalen Rahmen vor Wechseln und spätem Druck.",
    secondHalfSummary: "In der zweiten Halbzeit zählt Volatilität: Tore, Karten und Marktbewegungen verändern die Story.",
    postMatchSummary: "Das Replay ist vollständig, mit Score, Kontext, Marktstimmung und Sicherheitsgrenze.",
    preMatchSummary: "Der Kontext ist bereit: Teams, Stadion, Schiedsrichter, Anpfiff und Replay-Szenario.",
  },
  ja: {
    ...copy.en,
    appEyebrow: "Superteam Earn x TxODDS / ファン体験",
    eventBuildStatus: "World Cup Hackathon版",
    judgeableBuild: "公開審査ビルド",
    txlineLiveGated: "TxLINE LiveはToken必要",
    settings: "設定",
    close: "閉じる",
    language: "言語",
    replay: "リプレイ",
    live: "ライブ",
    mockFixture: "リプレイデータ",
    txlineAdapter: "TxLINEアダプター",
    waitingForTxline: "TxLINE token待ち",
    sourceReplay: "リプレイ準備完了",
    sourceNeedsToken: "TxLINE tokenが必要",
    sourceReplayMessage: "ライブ権限がなくても評価できるよう、固定データで再現します。",
    sourceNeedsTokenMessage: "先に devnet free-tier を有効化し、token は .env.local のみに保存します。",
    todayBoard: "ソースボード",
    checkedAt: "確認時刻",
    publicSeedSource: "日程スナップショット + リプレイ",
    freshness: "鮮度",
    source: "ソース",
    currentMode: "現在モード",
    canonicalSource: "正規ソース",
    replayCoverage: "リプレイ範囲",
    seedCoverage: "シード範囲",
    liveReadiness: "ライブ準備",
    tokenStatus: "Token",
    endpointStatus: "エンドポイント",
    calendarStatus: "カレンダー",
    fallbackStatus: "フォールバック",
    sourceBoundary: "TxLINEライブ認証まで Replay / Seed と明示します。",
    endpointPending: "ライブ更新は利用できません",
    apiAccessPlan: "API接続プラン",
    apiAccessTitle: "ライブデータ経路",
    apiAccessImplemented: "実装済み",
    apiAccessImplementedNote:
      "Fixture、スコアスナップショット、オッズスナップショット、リプレイFallback、ローカルProbeは接続済みです。",
    apiAccessTokenBlocked: "公式tokenゲート",
    apiAccessTokenBlockedNote:
      "認証Liveは devnet free-tier 経路を使います: subscribe txSig、guest JWT、/api/token/activate、local probe。",
    apiAccessProxyStatus: "オンラインProxyモード",
    apiAccessProxyConfigured: "Proxy設定済み。ブラウザはtokenなしで通信できます。",
    apiAccessProxyMissing: "Proxy未設定。安全なProxyを配備するまで GitHub Pages は Replay/Seed です。",
    apiAccessReviewFallback: "審査用Fallback",
    apiAccessReviewFallbackNote:
      "ライブ試合やtokenがなくても、Replay と Seed は表示、ラベル付け、利用可能です。",
    apiAccessAskOfficial: "TxODDSに確認",
    apiAccessQuestionToken: "Fixture ID と最終スコア proof ルール",
    apiAccessQuestionCors: "CORS方針とブラウザデモ可否",
    apiAccessQuestionLimits: "Rate limit、fixture権限、遅延レベル、SSEルール",
    play: "再生",
    pause: "停止",
    reset: "リセット",
    clock: "時計",
    pulse: "パルス",
    latestBeat: "最新ポイント",
    nextBeat: "次のポイント",
    noBetting: "賭けなし",
    aiCommentary: "AI解説",
    marketMood: "市場ムード、助言ではありません",
    fanCommand: "観戦ビュー",
    watchNow: "今見るべきこと",
    fanPrediction: "ファンスコア予想",
    predictionBody: "観戦会話用のローカル選択です。賭け、ウォレット、取引助言はありません。",
    predictionSafety: "娯楽予想、賭け助言ではありません",
    yourPick: "自分の予想",
    fanLean: "ファン傾向",
    liveFeed: "イベントフィード",
    waitingForKickoff: "キックオフ待ち",
    quickPick: "クイック選択",
    localOnly: "ローカルのみ",
    scoreLinkedPick: "スコア連動",
    focusNav: "試合フォーカス",
    focusWatch: "観戦",
    focusPick: "予想",
    focusTimeline: "タイムライン",
    focusMood: "ムード",
    focusTeams: "チーム",
    matchdayHub: "試合日ハブ",
    todaysMatches: "日程スナップショット",
    nowPlaying: "視聴中",
    tokenRequiredShort: "Token必要",
    replayAvailable: "リプレイ可能",
    officialSeed: "公式Seed",
    downloadPickCard: "予想カード保存",
    controlsStatus: "表示コントロール",
    settingsHelper: "言語、レビュー表示、表示モジュールだけを調整します。",
    viewingPreset: "表示プリセット",
    dashboardModules: "ダッシュボードモジュール",
    operationManualToggle: "操作ガイド",
    fixtureBriefingToggle: "試合ブリーフ",
    countryAtlasToggle: "チーム図鑑",
    videoPanelToggle: "許可済み動画",
    draw: "引き分け",
    oneLineRead: "試合の一言解説",
    pressure: "圧力マップ",
    neutral: "中立",
    oddsMovement: "オッズ変化",
    pulseArc: "パルス曲線",
    matchMoodPath: "感情の流れ",
    low: "低",
    now: "現在",
    high: "高",
    momentumInsight: "勢いの分析",
    whyMomentMatters: "この瞬間が重要な理由",
    swing: "変化",
    signal: "シグナル",
    events: "イベント",
    matchCenter: "試合センター",
    matchFacts: "試合情報",
    kickoff: "キックオフ",
    referee: "審判",
    dataStatus: "データ状態",
    discipline: "カード状況",
    noCards: "カードなし",
    qualification: "文脈",
    groupTable: "グループ表",
    teamProfiles: "チーム情報",
    coach: "監督",
    keyPlayers: "注目選手",
    shareCard: "共有カード",
    exportPulse: "パルスを書き出す",
    downloadSvg: "SVG保存",
    timeline: "試合タイムライン",
    keyEvents: "重要イベント",
    replayLoop: "リプレイは再開できます。",
    matchLevel: "同点",
    dataBacked: "データ文脈",
    openTeamInfo: "チーム情報を開く",
    openFixtureInfo: "試合詳細を開く",
    matchIntelligence: "試合インテリジェンス",
    phaseSummary: "フェーズ要約",
    preMatch: "試合前",
    firstHalf: "前半",
    secondHalf: "後半",
    postMatch: "試合後",
    playerImpact: "選手インパクト",
    eventStack: "イベント集計",
    goals: "ゴール",
    cards: "カード",
    subs: "交代",
    marketSwings: "市場変化",
    involved: "関与",
    noPlayerEvents: "選手イベントなし",
    minutes: "分",
    currentRead: "現在の読み",
    firstHalfSummary: "前半は、交代や終盤の圧力が変化する前の感情ベースを作ります。",
    secondHalfSummary: "後半は変動が重要です。ゴール、カード、市場変化がストーリーを変えます。",
    postMatchSummary: "リプレイは完了し、スコア、文脈、市場ムード、安全境界を保持しています。",
    preMatchSummary: "チーム、会場、審判、キックオフ、リプレイ文脈がそろっています。",
  },
  ar: {
    ...copy.en,
    appEyebrow: "Superteam Earn x TxODDS / تجربة المشجعين",
    eventBuildStatus: "نسخة World Cup Hackathon",
    judgeableBuild: "نسخة عامة قابلة للتحكيم",
    txlineLiveGated: "TxLINE Live يتطلب رمزا",
    settings: "الإعدادات",
    close: "إغلاق",
    language: "اللغة",
    replay: "إعادة",
    live: "مباشر",
    mockFixture: "بيانات إعادة",
    txlineAdapter: "موصل TxLINE",
    waitingForTxline: "بانتظار رمز TxLINE",
    sourceReplay: "الإعادة جاهزة",
    sourceNeedsToken: "رمز TxLINE مطلوب",
    sourceReplayMessage: "تستخدم الإعادة بيانات ثابتة كي تبقى التجربة قابلة للتحكيم بلا وصول مباشر.",
    sourceNeedsTokenMessage: "فعّل devnet free-tier أولا، ثم احفظ token محليا فقط في .env.local.",
    todayBoard: "لوحة المصدر",
    checkedAt: "تم التحقق",
    publicSeedSource: "لقطة جدول + مباريات إعادة",
    freshness: "حداثة البيانات",
    source: "المصدر",
    currentMode: "الوضع الحالي",
    canonicalSource: "المصدر المعتمد",
    replayCoverage: "تغطية الإعادة",
    seedCoverage: "تغطية البيانات الأولية",
    liveReadiness: "جاهزية المباشر",
    tokenStatus: "الرمز",
    endpointStatus: "النقاط",
    calendarStatus: "الجدول",
    fallbackStatus: "البديل",
    sourceBoundary: "تبقى Replay و Seed واضحة حتى تنجح مصادقة بيانات TxLINE المباشرة.",
    endpointPending: "التحديثات المباشرة غير متاحة",
    apiAccessPlan: "خطة الوصول إلى API",
    apiAccessTitle: "مسار البيانات المباشرة",
    apiAccessImplemented: "منفذ الآن",
    apiAccessImplementedNote:
      "تم ربط fixtures ولقطات النتيجة ولقطات odds وبديل replay والفحص المحلي.",
    apiAccessTokenBlocked: "بوابة الرمز الرسمي",
    apiAccessTokenBlockedNote:
      "Live المصدق يستخدم مسار devnet free-tier: subscribe txSig وguest JWT و/api/token/activate ثم probe محلي.",
    apiAccessProxyStatus: "وضع البروكسي online",
    apiAccessProxyConfigured: "تم ضبط البروكسي. المتصفح يبقى بلا token.",
    apiAccessProxyMissing: "لا يوجد بروكسي. GitHub Pages يبقى Replay/Seed حتى نشر بروكسي آمن.",
    apiAccessReviewFallback: "بديل قابل للتحكيم",
    apiAccessReviewFallbackNote:
      "Replay و Seed تبقى ظاهرة وموسومة وقابلة للاستخدام بدون مباراة live أو token.",
    apiAccessAskOfficial: "اسأل TxODDS عن",
    apiAccessQuestionToken: "Fixture ids وقاعدة proof للنتيجة النهائية",
    apiAccessQuestionCors: "سياسة CORS وهل يسمح بعروض المتصفح",
    apiAccessQuestionLimits: "حدود الطلبات، صلاحية fixtures، مستوى التأخير، وقواعد SSE",
    play: "تشغيل",
    pause: "إيقاف",
    reset: "إعادة ضبط",
    clock: "الوقت",
    pulse: "النبض",
    latestBeat: "آخر لحظة",
    nextBeat: "اللحظة التالية",
    noBetting: "بدون مراهنة",
    aiCommentary: "تعليق ذكي",
    marketMood: "مزاج السوق، ليس نصيحة",
    fanCommand: "واجهة المشجع",
    watchNow: "ما المهم الآن",
    fanPrediction: "توقع نتيجة المشجع",
    predictionBody: "اختيار محلي للنقاش فقط، بلا مراهنة أو محفظة أو نصيحة تداول.",
    predictionSafety: "توقع ترفيهي، ليس نصيحة مراهنة",
    yourPick: "اختياري",
    fanLean: "ميل المشجعين",
    liveFeed: "تدفق الأحداث",
    waitingForKickoff: "بانتظار البداية",
    quickPick: "اختيار سريع",
    localOnly: "محلي فقط",
    scoreLinkedPick: "مرتبط بالنتيجة",
    focusNav: "تركيز المباراة",
    focusWatch: "مشاهدة",
    focusPick: "توقع",
    focusTimeline: "الخط الزمني",
    focusMood: "المزاج",
    focusTeams: "الفرق",
    matchdayHub: "مركز يوم المباراة",
    todaysMatches: "لقطة الجدول",
    nowPlaying: "قيد المشاهدة",
    tokenRequiredShort: "رمز مطلوب",
    replayAvailable: "إعادة متاحة",
    officialSeed: "Seed رسمي",
    downloadPickCard: "تنزيل بطاقة التوقع",
    controlsStatus: "تحكم العرض",
    settingsHelper: "عدّل اللغة ووضع المراجعة والوحدات المرئية فقط.",
    viewingPreset: "نمط العرض",
    dashboardModules: "وحدات اللوحة",
    operationManualToggle: "دليل التشغيل",
    fixtureBriefingToggle: "ملخص المباراة",
    countryAtlasToggle: "أطلس الفرق",
    videoPanelToggle: "فيديو مصرح",
    draw: "تعادل",
    oneLineRead: "قراءة قصيرة",
    pressure: "خريطة الضغط",
    neutral: "محايد",
    oddsMovement: "حركة الأسعار",
    pulseArc: "منحنى النبض",
    matchMoodPath: "مسار المزاج",
    low: "منخفض",
    now: "الآن",
    high: "مرتفع",
    momentumInsight: "قراءة الزخم",
    whyMomentMatters: "لماذا هذه اللحظة مهمة",
    swing: "تحول",
    signal: "إشارة",
    events: "أحداث",
    matchCenter: "مركز المباراة",
    matchFacts: "معلومات المباراة",
    kickoff: "البداية",
    referee: "الحكم",
    dataStatus: "حالة البيانات",
    discipline: "البطاقات",
    noCards: "لا بطاقات",
    qualification: "السياق",
    groupTable: "جدول المجموعة",
    teamProfiles: "ملفات الفرق",
    coach: "المدرب",
    keyPlayers: "لاعبون مهمون",
    shareCard: "بطاقة مشاركة",
    exportPulse: "تصدير النبض",
    downloadSvg: "تنزيل SVG",
    timeline: "خط المباراة",
    keyEvents: "أحداث مهمة",
    replayLoop: "ستبدأ الإعادة من جديد.",
    matchLevel: "النتيجة متعادلة",
    dataBacked: "سياق البيانات",
    openTeamInfo: "فتح معلومات الفرق",
    openFixtureInfo: "فتح تفاصيل المباراة",
    matchIntelligence: "ذكاء المباراة",
    phaseSummary: "ملخص المرحلة",
    preMatch: "قبل المباراة",
    firstHalf: "الشوط الأول",
    secondHalf: "الشوط الثاني",
    postMatch: "بعد المباراة",
    playerImpact: "تأثير اللاعب",
    eventStack: "ملخص الأحداث",
    goals: "أهداف",
    cards: "بطاقات",
    subs: "تبديلات",
    marketSwings: "تحولات السوق",
    involved: "مشارك",
    noPlayerEvents: "لا أحداث مرتبطة بلاعب",
    minutes: "دقائق",
    currentRead: "القراءة الحالية",
    firstHalfSummary: "الشوط الأول يبني خط الشعور قبل التبديلات والضغط المتأخر.",
    secondHalfSummary: "في الشوط الثاني تهم التقلبات: الأهداف والبطاقات وحركة السوق تغير القصة.",
    postMatchSummary: "اكتملت الإعادة مع النتيجة والسياق ومزاج السوق وحدود السلامة.",
    preMatchSummary: "السياق جاهز: الفرق والملعب والحكم والبداية وسيناريو الإعادة.",
  },
} as const;

const trustCopy = {
  en: {
    eyebrow: "Trust & Accuracy",
    title: "Data truth center",
    scheduleSeed: "Official schedule snapshot",
    scheduleValue: "2 seed fixtures",
    scheduleNote:
      "TxLINE World Cup schedule snapshot observed Jordan vs Argentina and Algeria vs Austria for 2026-06-28 UTC.",
    liveGate: "Live gate",
    liveGateValue: "Activation pending",
    liveGateNote:
      "The app will not show Live until authenticated scores, events, and odds are loaded from TxLINE.",
    replayTruth: "Replay truth",
    replayTruthValue: "Deterministic",
    replayTruthNote:
      "Replay fixtures are fixed historical scenarios for judging and demo recording, never presented as live.",
    freeTier: "Free Tier behavior",
    freeTierValue: "SL1 / 60s delay",
    freeTierNote:
      "Video review and TxLINE community guidance indicate hackathon free-tier service level 1 is a 60-second delayed feed for World Cup and International Friendlies.",
    endpointsTitle: "Endpoint coverage",
    endpoint: "Endpoint",
    coverage: "Coverage",
    status: "Status",
    mapped: "Mapped",
    tokenGated: "Activation-gated",
    planned: "Planned",
    evidence: "Evidence",
    visibleFixtures: "Visible fixtures",
    source: "Source",
  },
  zh: {
    eyebrow: "可信度与准确性",
    title: "数据真实性中心",
    scheduleSeed: "官方赛程快照",
    scheduleValue: "2 场种子赛程",
    scheduleNote:
      "TxLINE World Cup schedule 快照在 2026-06-28 UTC 观察到 Jordan vs Argentina、Algeria vs Austria。",
    liveGate: "实时数据门槛",
    liveGateValue: "待激活",
    liveGateNote: "只有从 TxLINE 鉴权后的比分、事件、赔率接口加载成功后，页面才会显示 Live。",
    replayTruth: "回放真实性",
    replayTruthValue: "固定可复现",
    replayTruthNote: "Replay 是用于评审和录屏的历史场景，不会伪装成实时比赛。",
    freeTier: "Free Tier 行为",
    freeTierValue: "SL1 / 60 秒延迟",
    freeTierNote: "视频核查与 TxLINE 社群信息显示，黑客松免费层 service level 1 是世界杯与国际友谊赛的 60 秒延迟 feed。",
    endpointsTitle: "Endpoint 覆盖",
    endpoint: "Endpoint",
    coverage: "覆盖内容",
    status: "状态",
    mapped: "已映射",
    tokenGated: "待激活",
    planned: "计划中",
    evidence: "证据",
    visibleFixtures: "可见赛程",
    source: "来源",
  },
  es: {
    eyebrow: "Confianza y exactitud",
    title: "Centro de verdad de datos",
    scheduleSeed: "Snapshot oficial de calendario",
    scheduleValue: "2 fixtures seed",
    scheduleNote:
      "El snapshot World Cup de TxLINE observo Jordan vs Argentina y Algeria vs Austria para 2026-06-28 UTC.",
    liveGate: "Puerta live",
    liveGateValue: "Token requerido",
    liveGateNote:
      "La app no mostrara Live hasta cargar scores, eventos y odds autenticados desde TxLINE.",
    replayTruth: "Verdad replay",
    replayTruthValue: "Deterministico",
    replayTruthNote:
      "Replay usa escenarios historicos fijos para jueces y video demo; nunca se presenta como live.",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / 60s delay",
    freeTierNote:
      "La guia de la comunidad TxLINE indica que el free tier SL1 usa feed con 60s de retraso para World Cup e International Friendlies.",
    endpointsTitle: "Cobertura de endpoints",
    endpoint: "Endpoint",
    coverage: "Cobertura",
    status: "Estado",
    mapped: "Mapeado",
    tokenGated: "Token",
    planned: "Planeado",
    evidence: "Evidencia",
    visibleFixtures: "Fixtures visibles",
    source: "Fuente",
  },
  pt: {
    eyebrow: "Confianca e precisao",
    title: "Centro de verdade dos dados",
    scheduleSeed: "Snapshot oficial de calendario",
    scheduleValue: "2 fixtures seed",
    scheduleNote:
      "O snapshot World Cup da TxLINE observou Jordan vs Argentina e Algeria vs Austria para 2026-06-28 UTC.",
    liveGate: "Portao live",
    liveGateValue: "Token necessario",
    liveGateNote:
      "O app nao mostra Live ate carregar scores, eventos e odds autenticados da TxLINE.",
    replayTruth: "Verdade replay",
    replayTruthValue: "Deterministico",
    replayTruthNote:
      "Replay usa cenarios historicos fixos para jurados e video demo; nunca e apresentado como live.",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / 60s delay",
    freeTierNote:
      "A orientacao da comunidade TxLINE indica que o free tier SL1 usa feed com atraso de 60s para World Cup e International Friendlies.",
    endpointsTitle: "Cobertura de endpoints",
    endpoint: "Endpoint",
    coverage: "Cobertura",
    status: "Status",
    mapped: "Mapeado",
    tokenGated: "Token",
    planned: "Planejado",
    evidence: "Evidencia",
    visibleFixtures: "Fixtures visiveis",
    source: "Fonte",
  },
  fr: {
    eyebrow: "Confiance & exactitude",
    title: "Centre de vérité des données",
    scheduleSeed: "Snapshot calendrier officiel",
    scheduleValue: "2 matchs Seed",
    scheduleNote:
      "Le snapshot TxLINE World Cup a observé Jordan vs Argentina et Algeria vs Austria pour le 2026-06-28 UTC.",
    liveGate: "Accès live",
    liveGateValue: "Token requis",
    liveGateNote: "Le Live apparaît seulement après chargement authentifié des scores, événements et odds TxLINE.",
    replayTruth: "Vérité replay",
    replayTruthValue: "Déterministe",
    replayTruthNote: "Les replays sont des scénarios fixes pour jury et vidéo, jamais présentés comme live.",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / délai 60s",
    freeTierNote:
      "Les indications de la communaute TxLINE signalent que le free tier SL1 est un flux retarde de 60s pour World Cup et International Friendlies.",
    endpointsTitle: "Couverture endpoints",
    endpoint: "Endpoint",
    coverage: "Couverture",
    status: "Statut",
    mapped: "Mappé",
    tokenGated: "Token requis",
    planned: "Prévu",
    evidence: "Preuve",
    visibleFixtures: "Matchs visibles",
    source: "Source",
  },
  de: {
    eyebrow: "Vertrauen & Genauigkeit",
    title: "Daten-Wahrheitszentrum",
    scheduleSeed: "Offizieller Kalender-Snapshot",
    scheduleValue: "2 Seed-Spiele",
    scheduleNote:
      "Der TxLINE World Cup Snapshot sah Jordan vs Argentina und Algeria vs Austria für 2026-06-28 UTC.",
    liveGate: "Live-Gate",
    liveGateValue: "Token nötig",
    liveGateNote: "Live erscheint erst nach authentifizierten TxLINE-Scores, Events und Odds.",
    replayTruth: "Replay-Wahrheit",
    replayTruthValue: "Deterministisch",
    replayTruthNote: "Replay-Spiele sind feste Szenarien für Jury und Demo, nie als Live dargestellt.",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / 60s Verzögerung",
    freeTierNote:
      "TxLINE-Community-Hinweise deuten darauf hin, dass Free Tier SL1 ein 60-Sekunden-verzoegerter Feed fuer World Cup und International Friendlies ist.",
    endpointsTitle: "Endpoint-Abdeckung",
    endpoint: "Endpoint",
    coverage: "Abdeckung",
    status: "Status",
    mapped: "Gemappt",
    tokenGated: "Token nötig",
    planned: "Geplant",
    evidence: "Nachweis",
    visibleFixtures: "Sichtbare Spiele",
    source: "Quelle",
  },
  ja: {
    eyebrow: "信頼性と正確性",
    title: "データ真実性センター",
    scheduleSeed: "公式日程スナップショット",
    scheduleValue: "2件のSeed試合",
    scheduleNote:
      "TxLINE World Cup snapshot は 2026-06-28 UTC の Jordan vs Argentina と Algeria vs Austria を確認しました。",
    liveGate: "ライブゲート",
    liveGateValue: "Token必要",
    liveGateNote: "TxLINEのスコア、イベント、oddsが認証後に読み込まれるまでLiveは表示しません。",
    replayTruth: "リプレイの真実性",
    replayTruthValue: "固定再現",
    replayTruthNote: "リプレイは審査と動画用の固定シナリオで、ライブとして表示しません。",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / 60秒遅延",
    freeTierNote: "TxLINEコミュニティの案内では、Free Tier SL1はWorld CupとInternational Friendlies向けの60秒遅延フィードとして扱います。",
    endpointsTitle: "Endpoint範囲",
    endpoint: "Endpoint",
    coverage: "範囲",
    status: "状態",
    mapped: "対応済み",
    tokenGated: "Token必要",
    planned: "予定",
    evidence: "根拠",
    visibleFixtures: "表示試合",
    source: "ソース",
  },
  ar: {
    eyebrow: "الثقة والدقة",
    title: "مركز حقيقة البيانات",
    scheduleSeed: "لقطة جدول رسمية",
    scheduleValue: "مباراتان Seed",
    scheduleNote:
      "لقطة TxLINE World Cup رصدت Jordan vs Argentina و Algeria vs Austria بتاريخ 2026-06-28 UTC.",
    liveGate: "بوابة المباشر",
    liveGateValue: "رمز مطلوب",
    liveGateNote: "لا يظهر Live حتى يتم تحميل النتائج والأحداث والاحتمالات من TxLINE بمصادقة.",
    replayTruth: "حقيقة الإعادة",
    replayTruthValue: "ثابتة",
    replayTruthNote: "الإعادة سيناريو ثابت للتحكيم والفيديو، ولا تعرض كبيانات مباشرة.",
    freeTier: "Free Tier",
    freeTierValue: "SL1 / تأخير 60ث",
    freeTierNote: "تشير إرشادات مجتمع TxLINE إلى أن Free Tier SL1 هو بث بتأخير 60 ثانية لكأس العالم والمباريات الودية الدولية.",
    endpointsTitle: "تغطية الواجهات",
    endpoint: "Endpoint",
    coverage: "التغطية",
    status: "الحالة",
    mapped: "مربوط",
    tokenGated: "يتطلب رمزا",
    planned: "مخطط",
    evidence: "الدليل",
    visibleFixtures: "المباريات المرئية",
    source: "المصدر",
  },
} as const;

const localizedTrustCopy = {
  ...trustCopy,
  zh: {
    eyebrow: "可信度与准确性",
    title: "数据真实性中心",
    scheduleSeed: "官方赛程快照",
    scheduleValue: "2 场种子赛程",
    scheduleNote:
      "TxLINE World Cup schedule 快照在 2026-06-28 UTC 观察到 Jordan vs Argentina、Algeria vs Austria。",
    liveGate: "实时数据门槛",
    liveGateValue: "待激活",
    liveGateNote: "只有 TxLINE 鉴权后的比分、事件和赔率接口加载成功后，页面才会显示 Live。",
    replayTruth: "回放真实性",
    replayTruthValue: "固定可复现",
    replayTruthNote: "Replay 是用于评审和录屏的历史场景，不会伪装成实时比赛。",
    freeTier: "Free Tier 行为",
    freeTierValue: "SL1 / 60 秒延迟",
    freeTierNote: "视频核查与 TxLINE 社群信息显示，黑客松免费层 service level 1 是世界杯与国际友谊赛的 60 秒延迟 feed。",
    endpointsTitle: "Endpoint 覆盖",
    endpoint: "Endpoint",
    coverage: "覆盖内容",
    status: "状态",
    mapped: "已映射",
    tokenGated: "待激活",
    planned: "计划中",
    evidence: "证据",
    visibleFixtures: "可见赛程",
    source: "来源",
  },
} as const;

type CopyText = (typeof localizedCopy)[Language];
type ViewPresetId = ViewPreset["id"];
type AiPanelText = {
  lab: string;
  prediction: string;
  evaluation: string;
  commentary: string;
  confidenceLow: string;
  confidenceMedium: string;
  confidenceHigh: string;
  volatilityLow: string;
  volatilityMedium: string;
  volatilityHigh: string;
  localModelNote: string;
  noAdvice: string;
};
type DemoChapter = {
  id: string;
  matchId: string;
  minute: number;
  label: string;
  summary: string;
  focus: string;
};

const aiPanelCopy: Record<Language, AiPanelText> = {
  en: {
    lab: "AI Match Lab",
    prediction: "AI prediction",
    evaluation: "AI evaluation",
    commentary: "AI commentary",
    confidenceLow: "Low confidence",
    confidenceMedium: "Medium confidence",
    confidenceHigh: "High confidence",
    volatilityLow: "Calm match",
    volatilityMedium: "Live tension",
    volatilityHigh: "High volatility",
    localModelNote: "Local rule engine from score, events, and market mood.",
    noAdvice: "Informational only. No betting or trading advice.",
  },
  zh: {
    lab: "AI 比赛实验室",
    prediction: "AI 预测",
    evaluation: "AI 测评",
    commentary: "AI 解说",
    confidenceLow: "低置信度",
    confidenceMedium: "中等置信度",
    confidenceHigh: "高置信度",
    volatilityLow: "比赛较平稳",
    volatilityMedium: "现场有张力",
    volatilityHigh: "高波动比赛",
    localModelNote: "本地规则引擎，基于比分、事件和市场情绪生成。",
    noAdvice: "仅供观赛理解，不是下注或交易建议。",
  },
  es: {
    lab: "Laboratorio AI",
    prediction: "Predicción AI",
    evaluation: "Evaluación AI",
    commentary: "Comentario AI",
    confidenceLow: "Confianza baja",
    confidenceMedium: "Confianza media",
    confidenceHigh: "Confianza alta",
    volatilityLow: "Partido estable",
    volatilityMedium: "Tensión en vivo",
    volatilityHigh: "Alta volatilidad",
    localModelNote: "Motor local basado en marcador, eventos y ánimo de mercado.",
    noAdvice: "Solo informativo. No es consejo de apuestas ni trading.",
  },
  pt: {
    lab: "Laboratório AI",
    prediction: "Previsão AI",
    evaluation: "Avaliação AI",
    commentary: "Comentário AI",
    confidenceLow: "Baixa confiança",
    confidenceMedium: "Confiança média",
    confidenceHigh: "Alta confiança",
    volatilityLow: "Jogo calmo",
    volatilityMedium: "Tensão ao vivo",
    volatilityHigh: "Alta volatilidade",
    localModelNote: "Motor local baseado em placar, eventos e humor de mercado.",
    noAdvice: "Apenas informativo. Não é conselho de aposta ou trading.",
  },
  fr: {
    lab: "Labo IA",
    prediction: "Prédiction IA",
    evaluation: "Évaluation IA",
    commentary: "Commentaire IA",
    confidenceLow: "Confiance faible",
    confidenceMedium: "Confiance moyenne",
    confidenceHigh: "Confiance forte",
    volatilityLow: "Match calme",
    volatilityMedium: "Tension en direct",
    volatilityHigh: "Forte volatilité",
    localModelNote: "Moteur local basé sur score, événements et humeur de marché.",
    noAdvice: "Informatif uniquement. Pas de conseil de pari ou trading.",
  },
  de: {
    lab: "KI-Matchlabor",
    prediction: "KI-Prognose",
    evaluation: "KI-Bewertung",
    commentary: "KI-Kommentar",
    confidenceLow: "Niedrige Sicherheit",
    confidenceMedium: "Mittlere Sicherheit",
    confidenceHigh: "Hohe Sicherheit",
    volatilityLow: "Ruhiges Spiel",
    volatilityMedium: "Live-Spannung",
    volatilityHigh: "Hohe Volatilität",
    localModelNote: "Lokale Regelengine aus Spielstand, Ereignissen und Marktstimmung.",
    noAdvice: "Nur Information. Keine Wett- oder Tradingberatung.",
  },
  ja: {
    lab: "AI マッチラボ",
    prediction: "AI 予測",
    evaluation: "AI 評価",
    commentary: "AI 解説",
    confidenceLow: "低い確信度",
    confidenceMedium: "中程度の確信度",
    confidenceHigh: "高い確信度",
    volatilityLow: "落ち着いた試合",
    volatilityMedium: "ライブ緊張感",
    volatilityHigh: "高い変動",
    localModelNote: "スコア、イベント、市場ムードから作るローカルルールエンジン。",
    noAdvice: "情報表示のみ。賭けや取引助言ではありません。",
  },
  ar: {
    lab: "مختبر الذكاء",
    prediction: "توقع AI",
    evaluation: "تقييم AI",
    commentary: "تعليق AI",
    confidenceLow: "ثقة منخفضة",
    confidenceMedium: "ثقة متوسطة",
    confidenceHigh: "ثقة عالية",
    volatilityLow: "مباراة هادئة",
    volatilityMedium: "توتر مباشر",
    volatilityHigh: "تقلب عال",
    localModelNote: "محرك محلي من النتيجة والأحداث ومزاج السوق.",
    noAdvice: "معلومات فقط. ليست نصيحة مراهنة أو تداول.",
  },
};

type JudgeCriterion = {
  id: string;
  label: string;
  score: number;
  evidence: string;
  proof: string;
};

const judgeCriteriaEn: JudgeCriterion[] = [
  {
    id: "fan-ux",
    label: "Fan accessibility and UX",
    score: 96,
    evidence: "Match-first view, local score pick, multilingual settings, event timeline, team context on demand.",
    proof: "A non-technical fan can open the page and immediately understand score, pulse, next beat, and safety boundary.",
  },
  {
    id: "real-time",
    label: "Real-time responsiveness",
    score: 94,
    evidence: "Replay loop updates score, events, market mood, pulse, commentary, and cards from the same model used by TxLINE.",
    proof: "Live mode is token-gated, while Replay and Seed remain clearly labeled with source freshness.",
  },
  {
    id: "originality",
    label: "Originality and value creation",
    score: 95,
    evidence: "Pulse timeline, AI-style fan read, market mood context, and shareable fan pick card beyond a normal score site.",
    proof: "The product turns raw sports data into a watch companion instead of repackaging fixtures.",
  },
  {
    id: "commercial",
    label: "Commercial and monetization path",
    score: 91,
    evidence: "Sponsor-safe fan dashboard, broadcaster/club companion, premium match alerts, and rights-cleared video sync path.",
    proof: "No betting dependency; monetization can come from fan engagement, media integrations, and team/brand surfaces.",
  },
  {
    id: "execution",
    label: "Completeness and execution",
    score: 97,
    evidence: "Working app, GitHub Pages deployment, README, TxLINE docs, API feedback, demo script, checklist, validation pipeline.",
    proof: "The public build is judgeable even after the submission deadline when live matches may not be active.",
  },
];

const judgeCriteriaZh: JudgeCriterion[] = [
  {
    id: "fan-ux",
    label: "粉丝可及性与用户体验",
    score: 96,
    evidence: "主屏直接看比赛、比分预测、本地分享卡、多语言设置、事件时间线和按需展开球队信息。",
    proof: "非技术球迷打开后能立刻理解比分、脉冲、下一节点和安全边界。",
  },
  {
    id: "real-time",
    label: "实时响应",
    score: 94,
    evidence: "Replay 会同步更新比分、事件、市场情绪、脉冲、解说和卡片，并复用 TxLINE live 数据模型。",
    proof: "Live 明确 token-gated，Replay / Seed 带来源和新鲜度，不伪装实时。",
  },
  {
    id: "originality",
    label: "原创性与价值创造",
    score: 95,
    evidence: "脉冲时间线、AI 球迷解读、市场情绪语境、可下载预测卡，不只是比分网站。",
    proof: "把原始体育数据变成观赛陪伴产品，而不是重排赛程资料。",
  },
  {
    id: "commercial",
    label: "商业与变现路径",
    score: 91,
    evidence: "赞助安全的球迷看板、转播/球队伴随屏、高级提醒、授权视频同步路径。",
    proof: "不依赖下注变现，可走媒体、球队、品牌互动和粉丝参与工具路线。",
  },
  {
    id: "execution",
    label: "完整性与执行",
    score: 97,
    evidence: "可运行网站、GitHub Pages、README、TxLINE 文档、API 反馈、demo 脚本、检查表、验证流水线。",
    proof: "即使截止后没有实时比赛，公开版本仍可评审。",
  },
];

const judgeCriteriaByLanguage: Record<Language, JudgeCriterion[]> = {
  en: judgeCriteriaEn,
  zh: judgeCriteriaZh,
  es: [
    {
      id: "fan-ux",
      label: "Accesibilidad y experiencia fan",
      score: 96,
      evidence: "Vista centrada en partido, pronóstico local, idiomas, timeline de eventos y contexto de equipos bajo demanda.",
      proof: "Un fan no técnico entiende marcador, pulso, próximo momento y límite de seguridad al abrir la página.",
    },
    {
      id: "real-time",
      label: "Respuesta en tiempo real",
      score: 94,
      evidence: "Replay actualiza marcador, eventos, ánimo de mercado, pulso, comentario y tarjetas con el mismo modelo de TxLINE.",
      proof: "Live queda bloqueado por token; Replay y Seed mantienen fuente y frescura visibles.",
    },
    {
      id: "originality",
      label: "Originalidad y valor",
      score: 95,
      evidence: "Pulse timeline, lectura AI, ánimo de mercado y tarjeta compartible van más allá de un marcador normal.",
      proof: "Convierte datos deportivos en un compañero de partido, no solo en una lista de fixtures.",
    },
    {
      id: "commercial",
      label: "Ruta comercial",
      score: 91,
      evidence: "Dashboard seguro para sponsors, companion de clubes/medios, alertas premium y video autorizado.",
      proof: "No depende de apuestas; puede monetizar engagement, medios, equipos y marcas.",
    },
    {
      id: "execution",
      label: "Completitud y ejecución",
      score: 97,
      evidence: "App funcional, Pages, README, docs TxLINE, feedback API, guion demo, checklist y validación.",
      proof: "La build pública puede evaluarse aunque no haya partidos live durante la revisión.",
    },
  ],
  pt: [
    {
      id: "fan-ux",
      label: "Acessibilidade e UX do torcedor",
      score: 96,
      evidence: "Vista focada no jogo, palpite local, idiomas, timeline de eventos e contexto de times sob demanda.",
      proof: "Um torcedor não técnico entende placar, pulso, próximo momento e limite de segurança rapidamente.",
    },
    {
      id: "real-time",
      label: "Resposta em tempo real",
      score: 94,
      evidence: "Replay atualiza placar, eventos, humor de mercado, pulso, comentário e cards com o modelo TxLINE.",
      proof: "Live é token-gated; Replay e Seed ficam rotulados com fonte e frescor.",
    },
    {
      id: "originality",
      label: "Originalidade e valor",
      score: 95,
      evidence: "Timeline de pulso, leitura AI, contexto de mercado e card compartilhável além de um placar comum.",
      proof: "Transforma dados esportivos em companion de partida, não apenas em fixtures.",
    },
    {
      id: "commercial",
      label: "Caminho comercial",
      score: 91,
      evidence: "Dashboard seguro para patrocinadores, companion para clubes/mídia, alertas premium e vídeo autorizado.",
      proof: "Sem depender de apostas; monetização por engajamento, mídia, times e marcas.",
    },
    {
      id: "execution",
      label: "Completude e execução",
      score: 97,
      evidence: "App funcionando, Pages, README, docs TxLINE, feedback API, roteiro demo, checklist e validação.",
      proof: "A build pública é avaliável mesmo sem partidas ao vivo no período de revisão.",
    },
  ],
  fr: [
    {
      id: "fan-ux",
      label: "Accessibilité et expérience fan",
      score: 96,
      evidence: "Vue match-first, pronostic local, langues, timeline d'événements et contexte d'équipes à la demande.",
      proof: "Un fan non technique comprend score, pulse, prochain moment et limite de sécurité dès l'ouverture.",
    },
    {
      id: "real-time",
      label: "Réactivité temps réel",
      score: 94,
      evidence: "Replay met à jour score, événements, humeur de marché, pulse, commentaire et cartes avec le modèle TxLINE.",
      proof: "Live reste protégé par token; Replay et Seed gardent source et fraîcheur visibles.",
    },
    {
      id: "originality",
      label: "Originalité et valeur",
      score: 95,
      evidence: "Pulse timeline, lecture AI, humeur de marché et carte partageable dépassent un simple score.",
      proof: "Le produit transforme les données sportives en compagnon de match.",
    },
    {
      id: "commercial",
      label: "Voie commerciale",
      score: 91,
      evidence: "Dashboard sûr pour sponsors, companion média/club, alertes premium et vidéo autorisée.",
      proof: "La monétisation peut venir de l'engagement fan, des médias, des clubs et des marques.",
    },
    {
      id: "execution",
      label: "Complétude et exécution",
      score: 97,
      evidence: "App, Pages, README, docs TxLINE, feedback API, script vidéo, checklist et pipeline de validation.",
      proof: "La build publique reste jugeable même sans match live pendant la revue.",
    },
  ],
  de: [
    {
      id: "fan-ux",
      label: "Fan-Zugänglichkeit und UX",
      score: 96,
      evidence: "Match-zuerst Ansicht, lokaler Tipp, Sprachen, Ereignis-Timeline und Teamkontext auf Abruf.",
      proof: "Ein nicht-technischer Fan versteht sofort Spielstand, Pulse, nächsten Moment und Sicherheitsgrenze.",
    },
    {
      id: "real-time",
      label: "Echtzeit-Reaktion",
      score: 94,
      evidence: "Replay aktualisiert Spielstand, Events, Marktstimmung, Pulse, Kommentar und Karten mit dem TxLINE-Modell.",
      proof: "Live bleibt token-gated; Replay und Seed zeigen Quelle und Freshness klar an.",
    },
    {
      id: "originality",
      label: "Originalität und Wert",
      score: 95,
      evidence: "Pulse-Timeline, AI-Lesart, Marktstimmung und teilbare Tippkarte gehen über Livescore hinaus.",
      proof: "Das Produkt macht Sportdaten zu einem Match-Companion statt zu einer Fixture-Liste.",
    },
    {
      id: "commercial",
      label: "Kommerzieller Pfad",
      score: 91,
      evidence: "Sponsor-sicheres Dashboard, Club/Media Companion, Premium Alerts und lizenzierter Video-Pfad.",
      proof: "Monetarisierung braucht keine Wetten: Fan-Engagement, Medien, Teams und Marken sind möglich.",
    },
    {
      id: "execution",
      label: "Vollständigkeit und Umsetzung",
      score: 97,
      evidence: "Funktionierende App, Pages, README, TxLINE-Doku, API-Feedback, Demo-Skript, Checkliste und Validierung.",
      proof: "Die öffentliche Build bleibt auch ohne Live-Spiel während der Review beurteilbar.",
    },
  ],
  ja: [
    {
      id: "fan-ux",
      label: "ファン向けの使いやすさ",
      score: 96,
      evidence: "試合中心の表示、ローカル予想、言語設定、イベントタイムライン、必要時のチーム情報を備える。",
      proof: "技術に詳しくないファンでも、スコア、脈動、次の焦点、安全境界をすぐ理解できる。",
    },
    {
      id: "real-time",
      label: "リアルタイム応答",
      score: 94,
      evidence: "Replay は TxLINE と同じデータモデルでスコア、イベント、市場ムード、解説、カードを更新する。",
      proof: "Live は token-gated、Replay と Seed はソースと鮮度を明示する。",
    },
    {
      id: "originality",
      label: "独自性と価値",
      score: 95,
      evidence: "Pulse timeline、AI 風の読み、マーケットムード、共有カードが通常のスコア表示を超える。",
      proof: "生データを試合観戦の companion 体験に変換している。",
    },
    {
      id: "commercial",
      label: "商用化の道筋",
      score: 91,
      evidence: "スポンサー安全な看板、クラブ/メディア連携、プレミアム通知、権利処理済み動画同期を想定。",
      proof: "賭けに依存せず、ファン参加、メディア、チーム、ブランド連携で展開できる。",
    },
    {
      id: "execution",
      label: "完成度と実行力",
      score: 97,
      evidence: "動くアプリ、Pages、README、TxLINE docs、API feedback、demo script、checklist、validation pipeline。",
      proof: "審査時にライブ試合がなくても公開版を評価できる。",
    },
  ],
  ar: [
    {
      id: "fan-ux",
      label: "سهولة وصول المشجع وتجربته",
      score: 96,
      evidence: "واجهة تبدأ بالمباراة، توقع محلي، لغات، خط زمني للأحداث، ومعلومات الفرق عند الطلب.",
      proof: "المشجع غير التقني يفهم النتيجة والنبض واللحظة التالية وحدود الأمان بسرعة.",
    },
    {
      id: "real-time",
      label: "الاستجابة الفورية",
      score: 94,
      evidence: "Replay يحدث النتيجة والأحداث ومزاج السوق والنبض والتعليق والبطاقات بنفس نموذج TxLINE.",
      proof: "Live مقفل بالرمز، وReplay / Seed يعرضان المصدر وحداثة البيانات بوضوح.",
    },
    {
      id: "originality",
      label: "الأصالة وخلق القيمة",
      score: 95,
      evidence: "خط pulse، قراءة AI، سياق السوق، وبطاقة مشاركة تتجاوز موقع النتائج التقليدي.",
      proof: "المنتج يحول البيانات الرياضية إلى رفيق مشاهدة للمباراة.",
    },
    {
      id: "commercial",
      label: "المسار التجاري",
      score: 91,
      evidence: "لوحة آمنة للرعاة، تجربة للأندية والإعلام، تنبيهات مميزة، ومسار فيديو مرخص.",
      proof: "لا يعتمد على المراهنة؛ يمكن تحقيق القيمة من التفاعل والإعلام والفرق والعلامات.",
    },
    {
      id: "execution",
      label: "الاكتمال والتنفيذ",
      score: 97,
      evidence: "تطبيق عامل، Pages، README، توثيق TxLINE، ملاحظات API، نص demo، checklist، والتحقق.",
      proof: "البناء العام قابل للتقييم حتى إذا لم تكن هناك مباراة مباشرة أثناء المراجعة.",
    },
  ],
};

const judgePanelTextByLanguage: Record<
  Language,
  { eyebrow: string; scoreLabel: string; blockerTitle: string; blockerIntro: string; blockers: string[] }
> = {
  en: {
    eyebrow: "Judging criteria",
    scoreLabel: "Honest self score",
    blockerTitle: "Path to 100",
    blockerIntro: "The product is judgeable now. A true 100/100 still needs external proof that cannot be faked in code.",
    blockers: ["Official TxLINE token + live probe", "Final demo video under 5 minutes", "Final Superteam submission URL"],
  },
  zh: {
    eyebrow: "评审标准",
    scoreLabel: "真实自评分",
    blockerTitle: "满分前置条件",
    blockerIntro: "当前版本已经可评审。真正 100/100 还需要外部证明，不能在代码里假装完成。",
    blockers: ["官方 TxLINE token 与实时接口探测", "5 分钟以内最终演示视频", "Superteam 最终提交链接"],
  },
  es: {
    eyebrow: "Criterios de evaluación",
    scoreLabel: "Autoevaluación honesta",
    blockerTitle: "Camino a 100",
    blockerIntro: "El producto ya es evaluable. El 100/100 real requiere pruebas externas que no se deben fingir.",
    blockers: ["Token oficial TxLINE + prueba live", "Video demo final de menos de 5 minutos", "URL final de envío en Superteam"],
  },
  pt: {
    eyebrow: "Critérios de avaliação",
    scoreLabel: "Autoavaliação honesta",
    blockerTitle: "Caminho para 100",
    blockerIntro: "O produto já é avaliável. O 100/100 real exige provas externas que não devem ser simuladas.",
    blockers: ["Token oficial TxLINE + teste live", "Vídeo demo final com menos de 5 minutos", "URL final de envio no Superteam"],
  },
  fr: {
    eyebrow: "Critères d'évaluation",
    scoreLabel: "Auto-score honnête",
    blockerTitle: "Chemin vers 100",
    blockerIntro: "Le produit est déjà jugeable. Le vrai 100/100 exige des preuves externes qu'il ne faut pas simuler.",
    blockers: ["Token officiel TxLINE + probe live", "Vidéo demo finale sous 5 minutes", "URL finale de soumission Superteam"],
  },
  de: {
    eyebrow: "Bewertungskriterien",
    scoreLabel: "Ehrlicher Selbstscore",
    blockerTitle: "Weg zu 100",
    blockerIntro: "Das Produkt ist jetzt beurteilbar. Echte 100/100 brauchen externe Nachweise, die Code nicht vortäuschen darf.",
    blockers: ["Offizieller TxLINE Token + Live-Probe", "Finales Demo-Video unter 5 Minuten", "Finale Superteam Submission URL"],
  },
  ja: {
    eyebrow: "審査基準",
    scoreLabel: "正直な自己評価",
    blockerTitle: "100点への条件",
    blockerIntro: "現在の製品は審査可能です。本当の 100/100 には、コードで偽装できない外部証拠が必要です。",
    blockers: ["公式 TxLINE token と live probe", "5分以内の最終デモ動画", "Superteam の最終提出 URL"],
  },
  ar: {
    eyebrow: "معايير التحكيم",
    scoreLabel: "تقييم ذاتي صادق",
    blockerTitle: "الطريق إلى 100",
    blockerIntro: "المنتج قابل للتحكيم الآن. الدرجة الحقيقية 100/100 تحتاج أدلة خارجية لا يجوز تزويرها بالكود.",
    blockers: ["رمز TxLINE رسمي + اختبار live", "فيديو demo نهائي أقل من 5 دقائق", "رابط التقديم النهائي في Superteam"],
  },
};

function detectInitialLanguage(): Language {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const browserLanguage = navigator.language.toLowerCase();
  const matched = languageOptions.find((option) => browserLanguage.startsWith(option.code));

  if (matched) {
    return matched.code;
  }

  return "en";
}

function getHtmlLanguage(language: Language) {
  const htmlLanguages: Record<Language, string> = {
    ar: "ar",
    de: "de-DE",
    en: "en",
    es: "es-ES",
    fr: "fr-FR",
    ja: "ja-JP",
    pt: "pt-BR",
    zh: "zh-CN",
  };

  return htmlLanguages[language];
}

const zhPresetText: Record<ViewPresetId, Pick<ViewPreset, "label" | "description" | "focus">> = {
  fan: {
    label: "球迷模式",
    description: "适合普通球迷看比赛，快速理解比分、情绪和关键节点。",
    focus: ["比分", "最新节点", "AI 解读", "分享卡"],
  },
  analyst: {
    label: "分析模式",
    description: "适合检查数据来源、赔率新鲜度和事件逻辑。",
    focus: ["数据审计", "Endpoint 覆盖", "市场变化", "事件统计"],
  },
  judge: {
    label: "评审模式",
    description: "适合黑客松评审，展示可重复回放章节和提交准备度。",
    focus: ["数据源看板", "可信中心", "演示章节", "安全边界"],
  },
};

const presetTextByLanguage: Partial<Record<Language, Record<ViewPresetId, Pick<ViewPreset, "label" | "description" | "focus">>>> = {
  zh: zhPresetText,
  es: {
    fan: {
      label: "Modo fan",
      description: "Para ver el partido rápido: marcador, pulso, último momento y tarjeta para compartir.",
      focus: ["Marcador", "Último latido", "Lectura AI", "Tarjeta"],
    },
    analyst: {
      label: "Modo analista",
      description: "Para revisar fuentes, frescura, lógica de eventos y cambios de mercado.",
      focus: ["Auditoría", "Endpoints", "Mercado", "Eventos"],
    },
    judge: {
      label: "Modo juez",
      description: "Para evaluar el producto con capítulos repetibles, criterios y readiness.",
      focus: ["Fuentes", "Criterios", "Demo", "Seguridad"],
    },
  },
  pt: {
    fan: {
      label: "Modo torcedor",
      description: "Para assistir ao jogo com placar, pulso, momento recente e card de compartilhamento.",
      focus: ["Placar", "Último pulso", "Leitura AI", "Card"],
    },
    analyst: {
      label: "Modo analista",
      description: "Para checar fontes, frescor, lógica de eventos e movimentos de mercado.",
      focus: ["Auditoria", "Endpoints", "Mercado", "Eventos"],
    },
    judge: {
      label: "Modo jurado",
      description: "Para avaliar o produto com capítulos repetíveis, critérios e prontidão.",
      focus: ["Fontes", "Critérios", "Demo", "Segurança"],
    },
  },
  fr: {
    fan: {
      label: "Mode fan",
      description: "Pour suivre le match vite: score, pulse, dernier moment et carte partageable.",
      focus: ["Score", "Dernier moment", "Lecture AI", "Carte"],
    },
    analyst: {
      label: "Mode analyste",
      description: "Pour vérifier sources, fraîcheur, logique d'événements et humeur de marché.",
      focus: ["Audit", "Endpoints", "Marché", "Événements"],
    },
    judge: {
      label: "Mode jury",
      description: "Pour évaluer le produit avec chapitres rejouables, critères et readiness.",
      focus: ["Sources", "Critères", "Demo", "Sécurité"],
    },
  },
  de: {
    fan: {
      label: "Fan-Modus",
      description: "Für schnelles Zuschauen: Spielstand, Pulse, letzter Moment und teilbare Karte.",
      focus: ["Spielstand", "Letzter Beat", "AI-Lesart", "Karte"],
    },
    analyst: {
      label: "Analyse-Modus",
      description: "Für Quellen, Freshness, Eventlogik und Marktbewegungen.",
      focus: ["Audit", "Endpoints", "Markt", "Events"],
    },
    judge: {
      label: "Jury-Modus",
      description: "Für Bewertung mit wiederholbaren Kapiteln, Kriterien und Readiness.",
      focus: ["Quellen", "Kriterien", "Demo", "Sicherheit"],
    },
  },
  ja: {
    fan: {
      label: "ファンモード",
      description: "スコア、脈動、直近の焦点、共有カードをすばやく確認するモード。",
      focus: ["スコア", "最新の焦点", "AI 読み", "カード"],
    },
    analyst: {
      label: "分析モード",
      description: "ソース、鮮度、イベントロジック、市場ムードを確認するモード。",
      focus: ["監査", "Endpoints", "市場", "イベント"],
    },
    judge: {
      label: "審査モード",
      description: "再生可能な章、審査基準、提出準備を確認するモード。",
      focus: ["ソース", "基準", "Demo", "安全"],
    },
  },
  ar: {
    fan: {
      label: "وضع المشجع",
      description: "لمتابعة النتيجة والنبض وآخر لحظة وبطاقة المشاركة بسرعة.",
      focus: ["النتيجة", "آخر نبض", "قراءة AI", "بطاقة"],
    },
    analyst: {
      label: "وضع المحلل",
      description: "لفحص المصادر والحداثة ومنطق الأحداث وحركة السوق.",
      focus: ["تدقيق", "Endpoints", "السوق", "الأحداث"],
    },
    judge: {
      label: "وضع التحكيم",
      description: "لتقييم المنتج عبر فصول replay ومعايير واضحة وجاهزية التقديم.",
      focus: ["مصادر", "معايير", "Demo", "أمان"],
    },
  },
};

const zhManualStepText: Record<string, Pick<ManualStep, "title" | "action" | "reason">> = {
  source: {
    title: "1. 先看数据来源",
    action: "阅读比赛前，先确认黄色或绿色的数据来源提示条。",
    reason: "球迷能立刻知道当前是 Replay、Seed、Live、Delay，还是 token-gated 状态。",
  },
  match: {
    title: "2. 选择观看路径",
    action: "用数据源看板确认赛程快照，或用评审章节进行可重复回放演示。",
    reason: "无论当天有没有比赛，产品都能用，同时不会编造实时数据。",
  },
  pulse: {
    title: "3. 看情绪脉冲，不只看比分",
    action: "把 AI 解说、最新节点、市场气氛、压力图和时间线一起看。",
    reason: "普通球迷能用一句话理解为什么比赛此刻发生了变化。",
  },
  share: {
    title: "4. 确认安全边界后再分享",
    action: "导出球迷分享卡前，确认数据状态和不下注边界。",
    reason: "看板适合社交传播，同时避免下注和交易建议。",
  },
  live: {
    title: "5. 本地验证实时数据",
    action: "拿到 token 后，只放进 .env.local，并运行 npm run txline:probe。",
    reason: "真实 TxLINE 测试不能把 API token 泄漏到公开仓库或浏览器构建里。",
  },
};

const zhMatchBriefingText: Record<string, Partial<Omit<MatchBriefing, "id">>> = {
  "txline-fixture-17588325": {
    title: "约旦 vs 阿根廷",
    stage: "世界杯小组赛",
    source: "TxLINE 赛程种子",
    status: "实时比分、事件和赔率需要 token",
    whatToWatch: [
      "把这张卡当作赛程真实锚点，不要当作伪实时比赛。",
      "拿到 token 后，fixture 17588325 是第一个实时探测目标。",
      "只有比分和赔率载荷成功加载后，界面才应显示 Live。",
    ],
  },
  "txline-fixture-17588326": {
    title: "阿尔及利亚 vs 奥地利",
    stage: "世界杯小组赛",
    source: "TxLINE 赛程种子",
    status: "实时比分、事件和赔率需要 token",
    whatToWatch: [
      "用它作为第二场 fixture，验证赛程一致性。",
      "如果实时数据不可用，保持 Seed 标签可见。",
      "叫它 Live 之前，比分新鲜度和赔率新鲜度都要对齐。",
    ],
  },
  "wc-demo-arg-fra": {
    title: "阿根廷 vs 法国",
    kickoff: "回放 fixture",
    stage: "决赛回放",
    source: "Replay 数据",
    status: "任何时间都可评审",
    whatToWatch: ["第 23 分钟的进球摆动。", "第 80 和 81 分钟的尾声波动。", "市场气氛只做语境，不做下注建议。"],
  },
  "wc-demo-jpn-ger": {
    title: "德国 vs 日本",
    kickoff: "回放 fixture",
    stage: "小组赛爆冷回放",
    source: "Replay 数据",
    status: "任何时间都可评审",
    whatToWatch: ["用第 75 分钟展示爆冷走势。", "小组积分解释为什么这个球迷故事重要。", "球员影响展示替补和关键跑动。"],
  },
};

const zhTeamText: Record<string, Partial<Omit<TeamGuide, "code" | "colors">>> = {
  ARG: {
    name: "阿根廷",
    region: "南美洲",
    status: "Replay + 赛程种子",
    style: "控球、情绪节奏明显，左路转换很快。",
    fanRead: "球迷会先看核心创造者，一次触球就可能改变整场气氛。",
    watchFor: "点球压力、Messi 串联和尾声观众情绪摆动。",
    dataNote: "当前为回放资料, TxLINE 鉴权成功后由实时比分和赔率覆盖。",
  },
  FRA: {
    name: "法国",
    region: "欧洲",
    status: "Replay 种子",
    style: "前场爆发强，直接压迫，尾声波动突然。",
    fanRead: "比赛可能看似平稳，直到法国找到防线身后的空间。",
    watchFor: "Mbappe 加速、追回窗口和市场气氛快速反转。",
    dataNote: "用于可评审回放节点。",
  },
  GER: {
    name: "德国",
    region: "欧洲",
    status: "Replay 种子",
    style: "重视区域推进、射门量、中场控制和高控球压迫。",
    fanRead: "德国的脉冲常常在比分变化前就因为压力而上升。",
    watchFor: "点球时刻、二点球压力和换人后的防守空隙。",
    dataNote: "回放种子包含小组积分语境，用于讲爆冷故事。",
  },
  JPN: {
    name: "日本",
    region: "亚洲",
    status: "Replay 种子",
    style: "防守紧凑、替补速度快，尾声转换锋利。",
    fanRead: "日本的球迷叙事是先耐心等待，再快速情绪反转。",
    watchFor: "替补影响、扳平窗口和弱势方走势。",
    dataNote: "回放种子用于爆冷语境章节。",
  },
  JOR: {
    name: "约旦",
    region: "亚洲",
    status: "TxLINE 赛程种子",
    style: "结构化防线、快速释放和定位球压力。",
    fanRead: "核心需求是清楚标注：实时源鉴权前只显示赛程种子。",
    watchFor: "fixture 状态、开局防守形态，以及实时比分是否解锁。",
    keyPlayers: ["等待接口阵容", "等待球队上下文", "等待首发名单"],
    dataNote: "fixture 17588325 出现在 TxLINE 赛程种子中。",
  },
  ALG: {
    name: "阿尔及利亚",
    region: "非洲",
    status: "TxLINE 赛程种子",
    style: "边路推进、阶段性逼抢，情绪波动很明显。",
    fanRead: "球迷需要马上知道这是赛程数据，比分到达后再进入实时状态。",
    watchFor: "fixture 状态、进攻通道和已鉴权赔率可用性。",
    keyPlayers: ["等待接口阵容", "等待球队上下文", "等待首发名单"],
    dataNote: "fixture 17588326 出现在 TxLINE 赛程种子中。",
  },
  AUT: {
    name: "奥地利",
    region: "欧洲",
    status: "TxLINE 赛程种子",
    style: "紧凑逼抢、纵向传球和纪律性中场站位。",
    fanRead: "奥地利资料卡要保持诚实：先显示赛程，token 可用后再显示实时细节。",
    watchFor: "逼抢强度、比赛时钟新鲜度和市场快照时间。",
    keyPlayers: ["等待接口阵容", "等待球队上下文", "等待首发名单"],
    dataNote: "fixture 17588326 出现在 TxLINE 赛程种子中。",
  },
  USA: {
    name: "美国",
    region: "北美洲",
    status: "东道主参考种子",
    style: "转换速度、身体压迫和边路跑动。",
    fanRead: "适合测试全球球迷、语言切换和主办国语境。",
    watchFor: "年轻球员节点和高能量观众阶段。",
    keyPlayers: ["东道主资料种子", "等待阵容", "等待首发"],
    dataNote: "仅为参考资料, 实时使用取决于 TxLINE fixture。",
  },
  MEX: {
    name: "墨西哥",
    region: "北美洲",
    status: "东道主参考种子",
    style: "情绪强、边路进攻多，观众反馈很快。",
    fanRead: "适合测试语言、社区和比赛日分享体验。",
    watchFor: "定位球后的走势和观众带动的压力变化。",
    keyPlayers: ["东道主资料种子", "等待阵容", "等待首发"],
    dataNote: "仅为参考资料, 实时使用取决于 TxLINE fixture。",
  },
  BRA: {
    name: "巴西",
    region: "南美洲",
    status: "球迷参考种子",
    style: "个人灵感、快速小配合和高期待压力。",
    fanRead: "适合测试进球前的脉冲上升。",
    watchFor: "机会创造、边路突破和观众信心摆动。",
    keyPlayers: ["参考种子", "等待阵容", "等待首发"],
    dataNote: "仅为参考资料, 实时使用取决于 TxLINE fixture。",
  },
  ENG: {
    name: "英格兰",
    region: "欧洲",
    status: "球迷参考种子",
    style: "结构化进攻、定位球威胁和有节制的控制。",
    fanRead: "适合解释压力，不夸大确定性。",
    watchFor: "定位球、中场控制和尾声风险管理。",
    keyPlayers: ["参考种子", "等待阵容", "等待首发"],
    dataNote: "仅为参考资料, 实时使用取决于 TxLINE fixture。",
  },
  ESP: {
    name: "西班牙",
    region: "欧洲",
    status: "球迷参考种子",
    style: "控球、轮转，通过控制制造压力。",
    fanRead: "适合测试看板能否解释安静的优势。",
    watchFor: "区域占领、传球节奏和细微赔率变化。",
    keyPlayers: ["参考种子", "等待阵容", "等待首发"],
    dataNote: "仅为参考资料, 实时使用取决于 TxLINE fixture。",
  },
};

function getPresetDisplay(preset: ViewPreset, language: Language) {
  return presetTextByLanguage[language]?.[preset.id] ?? preset;
}

function getManualStepDisplay(step: ManualStep, language: Language): ManualStep {
  return language === "zh" ? { ...step, ...zhManualStepText[step.id] } : step;
}

function getMatchBriefingDisplay(briefing: MatchBriefing, language: Language): MatchBriefing {
  return language === "zh" ? { ...briefing, ...zhMatchBriefingText[briefing.id] } : briefing;
}

function getTeamDisplay(team: TeamGuide, language: Language): TeamGuide {
  return language === "zh" ? { ...team, ...zhTeamText[team.code] } : team;
}

const teamNameText: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    ARG: "阿根廷",
    FRA: "法国",
    GER: "德国",
    JPN: "日本",
    JOR: "约旦",
    ALG: "阿尔及利亚",
    AUT: "奥地利",
    USA: "美国",
    MEX: "墨西哥",
    BRA: "巴西",
    ENG: "英格兰",
    ESP: "西班牙",
  },
  es: {
    ARG: "Argentina",
    FRA: "Francia",
    GER: "Alemania",
    JPN: "Japon",
    JOR: "Jordania",
    ALG: "Argelia",
    AUT: "Austria",
    USA: "Estados Unidos",
    MEX: "Mexico",
    BRA: "Brasil",
    ENG: "Inglaterra",
    ESP: "Espana",
  },
  pt: {
    ARG: "Argentina",
    FRA: "Franca",
    GER: "Alemanha",
    JPN: "Japao",
    JOR: "Jordania",
    ALG: "Argelia",
    AUT: "Austria",
    USA: "Estados Unidos",
    MEX: "Mexico",
    BRA: "Brasil",
    ENG: "Inglaterra",
    ESP: "Espanha",
  },
  fr: {
    ARG: "Argentine",
    FRA: "France",
    GER: "Allemagne",
    JPN: "Japon",
    JOR: "Jordanie",
    ALG: "Algerie",
    AUT: "Autriche",
    USA: "Etats-Unis",
    MEX: "Mexique",
    BRA: "Bresil",
    ENG: "Angleterre",
    ESP: "Espagne",
  },
  de: {
    ARG: "Argentinien",
    FRA: "Frankreich",
    GER: "Deutschland",
    JPN: "Japan",
    JOR: "Jordanien",
    ALG: "Algerien",
    AUT: "Osterreich",
    USA: "Vereinigte Staaten",
    MEX: "Mexiko",
    BRA: "Brasilien",
    ENG: "England",
    ESP: "Spanien",
  },
  ja: {
    ARG: "アルゼンチン",
    FRA: "フランス",
    GER: "ドイツ",
    JPN: "日本",
    JOR: "ヨルダン",
    ALG: "アルジェリア",
    AUT: "オーストリア",
    USA: "アメリカ",
    MEX: "メキシコ",
    BRA: "ブラジル",
    ENG: "イングランド",
    ESP: "スペイン",
  },
  ar: {
    ARG: "الأرجنتين",
    FRA: "فرنسا",
    GER: "ألمانيا",
    JPN: "اليابان",
    JOR: "الأردن",
    ALG: "الجزائر",
    AUT: "النمسا",
    USA: "الولايات المتحدة",
    MEX: "المكسيك",
    BRA: "البرازيل",
    ENG: "إنجلترا",
    ESP: "إسبانيا",
  },
};

function getTeamName(code: string, fallback: string, language: Language) {
  return teamNameText[language]?.[code] ?? fallback;
}

type MatchDisplayText = {
  competition: string;
  stage: string;
  venue: string;
  qualification: string;
};

const matchDisplayText: Record<Language, Record<string, MatchDisplayText>> = {
  en: {},
  zh: {
    "wc-demo-arg-fra": {
      competition: "世界杯淘汰赛回放",
      stage: "决赛回放",
      venue: "卢塞尔标志性体育场",
      qualification: "淘汰赛回放：胜者捧杯，本短演示省略点球大战。",
    },
    "wc-demo-jpn-ger": {
      competition: "世界杯小组赛回放",
      stage: "小组赛回放",
      venue: "哈利法国际体育场",
      qualification: "小组赛爆冷回放：日本的晚段逆转改变出线叙事和市场情绪。",
    },
  },
  es: {
    "wc-demo-arg-fra": {
      competition: "Replay de eliminatoria mundialista",
      stage: "Replay de la final",
      venue: "Estadio Iconico de Lusail",
      qualification: "Replay de eliminatoria: el ganador levanta el trofeo; los penales se omiten en este bucle demo.",
    },
    "wc-demo-jpn-ger": {
      competition: "Replay de fase de grupos mundialista",
      stage: "Replay de grupos",
      venue: "Estadio Internacional Khalifa",
      qualification: "Replay de sorpresa: la remontada tardia de Japon cambia la historia de clasificacion.",
    },
  },
  pt: {
    "wc-demo-arg-fra": {
      competition: "Replay de mata-mata da Copa",
      stage: "Replay da final",
      venue: "Estadio Iconico de Lusail",
      qualification: "Replay de mata-mata: o vencedor levanta a taca; penaltis ficam fora deste loop curto.",
    },
    "wc-demo-jpn-ger": {
      competition: "Replay da fase de grupos da Copa",
      stage: "Replay de grupos",
      venue: "Estadio Internacional Khalifa",
      qualification: "Replay de zebra: a virada tardia do Japao muda a leitura de classificacao.",
    },
  },
  fr: {
    "wc-demo-arg-fra": {
      competition: "Replay a elimination de Coupe du monde",
      stage: "Replay de finale",
      venue: "Stade iconique de Lusail",
      qualification: "Replay a elimination: le vainqueur souleve le trophee; les tirs au but sont omis dans cette demo courte.",
    },
    "wc-demo-jpn-ger": {
      competition: "Replay de phase de groupes",
      stage: "Replay de groupe",
      venue: "Stade international Khalifa",
      qualification: "Replay de surprise: la victoire tardive du Japon change le contexte de qualification.",
    },
  },
  de: {
    "wc-demo-arg-fra": {
      competition: "WM-K.-o.-Replay",
      stage: "Final-Replay",
      venue: "Lusail Iconic Stadium",
      qualification: "K.-o.-Replay: Der Sieger holt den Pokal; Elfmeterschiessen ist in dieser kurzen Demo ausgelassen.",
    },
    "wc-demo-jpn-ger": {
      competition: "WM-Gruppenphasen-Replay",
      stage: "Gruppen-Replay",
      venue: "Khalifa International Stadium",
      qualification: "Upset-Replay: Japans spaeter Sieg veraendert die Qualifikationslage.",
    },
  },
  ja: {
    "wc-demo-arg-fra": {
      competition: "ワールドカップ決勝トーナメント リプレイ",
      stage: "決勝リプレイ",
      venue: "ルサイル・アイコニック・スタジアム",
      qualification: "決勝トーナメントのリプレイ。短いデモではPK戦を省略しています。",
    },
    "wc-demo-jpn-ger": {
      competition: "ワールドカップ グループステージ リプレイ",
      stage: "グループステージ リプレイ",
      venue: "ハリーファ国際スタジアム",
      qualification: "番狂わせのリプレイ。日本の終盤逆転が突破状況と市場ムードを変えます。",
    },
  },
  ar: {
    "wc-demo-arg-fra": {
      competition: "إعادة لمباراة إقصائية في كأس العالم",
      stage: "إعادة النهائي",
      venue: "استاد لوسيل",
      qualification: "إعادة إقصائية: الفائز يرفع الكأس، وركلات الترجيح خارج هذا العرض القصير.",
    },
    "wc-demo-jpn-ger": {
      competition: "إعادة من دور المجموعات",
      stage: "إعادة دور المجموعات",
      venue: "استاد خليفة الدولي",
      qualification: "إعادة لمفاجأة: فوز اليابان المتأخر يغير سياق التأهل ومزاج السوق.",
    },
  },
};

function getMatchDisplay(match: MatchData, language: Language): MatchDisplayText {
  const translated = matchDisplayText[language]?.[match.id];

  if (translated) {
    return translated;
  }

  return {
    competition: match.competition,
    stage: match.stage ?? match.competition,
    venue: match.venue,
    qualification: match.qualificationNote ?? match.stage ?? match.competition,
  };
}

type DataStatusValue = NonNullable<MatchData["dataStatus"]>;

const dataStatusText: Record<Language, Record<DataStatusValue, string>> = {
  en: { Live: "Live", Delay: "Delay", Replay: "Replay", Seed: "Seed" },
  zh: { Live: "实时", Delay: "延迟", Replay: "回放", Seed: "种子" },
  es: { Live: "En vivo", Delay: "Con retraso", Replay: "Replay", Seed: "Seed" },
  pt: { Live: "Ao vivo", Delay: "Com atraso", Replay: "Replay", Seed: "Seed" },
  fr: { Live: "Direct", Delay: "Decale", Replay: "Replay", Seed: "Seed" },
  de: { Live: "Live", Delay: "Verzoegert", Replay: "Replay", Seed: "Seed" },
  ja: { Live: "ライブ", Delay: "遅延", Replay: "リプレイ", Seed: "シード" },
  ar: { Live: "مباشر", Delay: "متأخر", Replay: "إعادة", Seed: "بيانات أولية" },
};

function getDataStatusLabel(status: DataStatusValue, language: Language) {
  return dataStatusText[language][status];
}

const swingSignalText: Record<Language, Record<"major" | "clear" | "subtle" | "stable", string>> = {
  en: { major: "Major swing", clear: "Clear swing", subtle: "Subtle movement", stable: "Stable" },
  zh: { major: "大幅摆动", clear: "明显摆动", subtle: "轻微变化", stable: "稳定" },
  es: { major: "Gran giro", clear: "Giro claro", subtle: "Movimiento leve", stable: "Estable" },
  pt: { major: "Grande virada", clear: "Virada clara", subtle: "Movimento leve", stable: "Estavel" },
  fr: { major: "Grand basculement", clear: "Bascule nette", subtle: "Mouvement leger", stable: "Stable" },
  de: { major: "Grosser Swing", clear: "Klarer Swing", subtle: "Leichte Bewegung", stable: "Stabil" },
  ja: { major: "大きな変化", clear: "明確な変化", subtle: "小さな動き", stable: "安定" },
  ar: { major: "تحول كبير", clear: "تحول واضح", subtle: "حركة خفيفة", stable: "مستقر" },
};

function getSwingSignalLabel(swing: number, language: Language) {
  const absoluteSwing = Math.abs(swing);
  const level = absoluteSwing >= 18 ? "major" : absoluteSwing >= 8 ? "clear" : absoluteSwing >= 3 ? "subtle" : "stable";
  return swingSignalText[language][level];
}

function getSafeVideoEmbedUrl(rawUrl?: string) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(9, value));
}

function getPredictionPickFromScore(homeScore: number, awayScore: number): PredictionPick {
  if (homeScore === awayScore) {
    return "draw";
  }

  return homeScore > awayScore ? "home" : "away";
}

function readAlertThreshold(): AlertThreshold {
  if (typeof window === "undefined") {
    return 65;
  }

  const storedValue = Number(window.localStorage.getItem("wclp-alert-threshold"));
  return alertThresholdOptions.includes(storedValue as AlertThreshold) ? (storedValue as AlertThreshold) : 65;
}

export default function App() {
  const [mode, setMode] = useState<MatchMode>("live");
  const [language, setLanguage] = useState<Language>(() => detectInitialLanguage());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [minute, setMinute] = useState(1);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [source, setSource] = useState<DataSourceState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<(typeof replaySpeeds)[number]>(1);
  const [replayMatchId, setReplayMatchId] = useState(replayMatches[0].id);
  const [viewPreset, setViewPreset] = useState<ViewPresetId>("fan");
  const [showManual, setShowManual] = useState(false);
  const [showMatchGuide, setShowMatchGuide] = useState(false);
  const [showTeamAtlas, setShowTeamAtlas] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [selectedTeamCode, setSelectedTeamCode] = useState("ARG");
  const [predictionPick, setPredictionPick] = useState<PredictionPick | null>(null);
  const [predictedHomeScore, setPredictedHomeScore] = useState(1);
  const [predictedAwayScore, setPredictedAwayScore] = useState(1);
  const [alertThreshold, setAlertThreshold] = useState<AlertThreshold>(() => readAlertThreshold());
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = localizedCopy[language];
  const trust = localizedTrustCopy[language];
  const aiText = aiPanelCopy[language];
  const proxyBaseConfigured = Boolean((import.meta.env.VITE_TXLINE_PROXY_BASE ?? "").trim());

  useEffect(() => {
    document.documentElement.lang = getHtmlLanguage(language);
    document.documentElement.setAttribute("translate", "no");
    document.body.setAttribute("translate", "no");
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;

    const loadLatestMatch = async () => {
      if (requestInFlight) {
        return;
      }

      requestInFlight = true;
      setIsRefreshing(true);
      setLoadError(null);

      try {
        const result = await loadMatchData(mode, {
          proxyBase: import.meta.env.VITE_TXLINE_PROXY_BASE || (import.meta.env.DEV ? "/__txline" : ""),
          asOfMs: import.meta.env.VITE_TXLINE_AS_OF_MS,
          competitionId: import.meta.env.VITE_TXLINE_COMPETITION_ID,
          fixtureId: import.meta.env.VITE_TXLINE_FIXTURE_ID,
          replayMatchId,
          startEpochDay: import.meta.env.VITE_TXLINE_START_EPOCH_DAY,
        });

        if (cancelled) {
          return;
        }

        setMatch(result.match);
        setSource(result.source);

        if (mode === "live") {
          setMinute(Math.max(1, result.match.events.at(-1)?.minute ?? 1));
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unknown data loading error");
        }
      } finally {
        requestInFlight = false;
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    };

    void loadLatestMatch();

    if (mode !== "live") {
      return () => {
        cancelled = true;
      };
    }

    const refreshTimer = window.setInterval(() => {
      void loadLatestMatch();
    }, liveRefreshIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, [mode, refreshNonce, replayMatchId]);

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

  function applyViewPreset(nextPreset: ViewPresetId) {
    setViewPreset(nextPreset);

    if (nextPreset === "fan") {
      setShowManual(false);
      setShowMatchGuide(false);
      setShowTeamAtlas(false);
      setShowVideoPanel(false);
      return;
    }

    if (nextPreset === "analyst") {
      setShowManual(false);
      setShowMatchGuide(true);
      setShowTeamAtlas(false);
      setShowVideoPanel(false);
      return;
    }

    setShowManual(true);
    setShowMatchGuide(true);
    setShowTeamAtlas(false);
    setShowVideoPanel(false);
  }

  function chooseAlertThreshold(nextThreshold: AlertThreshold) {
    setAlertThreshold(nextThreshold);
    window.localStorage.setItem("wclp-alert-threshold", String(nextThreshold));
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
  const homeTeamName = getTeamName(match.home.code, match.home.name, language);
  const awayTeamName = getTeamName(match.away.code, match.away.name, language);
  const matchDisplay = getMatchDisplay(match, language);
  const leader =
    frame.homeScore === frame.awayScore
      ? t.matchLevel
      : frame.homeScore > frame.awayScore
        ? homeTeamName
        : awayTeamName;
  const sourceStatus = source ? getSourceStatus(source, language) : null;
  const liveActivationPending = mode === "live" && source?.kind === "needs-token";
  const visibleSourceLabel = liveActivationPending ? t.replayFallbackReady : (sourceStatus?.label ?? t.publicSeedSource);
  const visibleSourceMessage = liveActivationPending
    ? t.apiAccessReviewFallbackNote
    : (sourceStatus?.message ?? t.sourceBoundary);
  const visibleSourceMode = liveActivationPending
    ? t.replayFallbackReady
    : mode === "replay"
      ? t.mockFixture
      : (sourceStatus?.label ?? t.txlineAdapter);
  const videoEmbedUrl = getSafeVideoEmbedUrl(import.meta.env.VITE_AUTHORIZED_VIDEO_EMBED_URL);
  const visibleCards = frame.activeEvents.filter((event) =>
    ["yellow_card", "red_card"].includes(event.type),
  );
  const latestEventDisplay = frame.latestEvent ? formatEventDisplay(frame.latestEvent, match, language) : null;
  const nextEventDisplay = nextEvent ? formatEventDisplay(nextEvent, match, language) : null;
  const localizedCommentary = buildLocalizedCommentary(match, frame, language);
  const localizedInsight = buildLocalizedInsight(match, frame, language);
  const dataStatusLabel = getDataStatusLabel(match.dataStatus ?? (source?.kind === "replay" ? "Replay" : "Seed"), language);
  const nextBeatSummary = nextEvent && nextEventDisplay ? `${nextEvent.minute}' ${nextEventDisplay.title}` : t.replayLoop;
  const swingSignalLabel = getSwingSignalLabel(frame.insight.swing, language);
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
    { label: t.endpointStatus, value: trust.tokenGated },
    { label: t.calendarStatus, value: trust.scheduleValue },
    { label: t.fallbackStatus, value: t.replayFallbackReady },
  ];
  const apiAccessItems = [
    {
      label: t.apiAccessImplemented,
      value: "Adapter + probe",
      note: t.apiAccessImplementedNote,
    },
    {
      label: t.apiAccessTokenBlocked,
      value: source?.kind === "live-ready" ? t.ready : t.pending,
      note: t.apiAccessTokenBlockedNote,
    },
    {
      label: t.apiAccessProxyStatus,
      value: proxyBaseConfigured ? t.ready : t.pending,
      note: proxyBaseConfigured ? t.apiAccessProxyConfigured : t.apiAccessProxyMissing,
    },
    {
      label: t.apiAccessReviewFallback,
      value: t.replayFallbackReady,
      note: t.apiAccessReviewFallbackNote,
    },
  ];
  const officialAccessQuestions = [
    t.apiAccessQuestionToken,
    t.apiAccessQuestionCors,
    t.apiAccessQuestionLimits,
  ];
  const operatorValueItems = [
    { label: t.operatorVenue, value: t.watchSignal, note: t.operatorVenueNote },
    { label: t.operatorCommunity, value: t.downloadPickCard, note: t.operatorCommunityNote },
    { label: t.operatorMedia, value: t.dataConsistency, note: t.operatorMediaNote },
  ];
  const operatorProofItems = [
    { label: t.operatorProofLatency, value: dataStatusLabel, note: t.operatorProofLatencyNote },
    { label: t.operatorProofSafety, value: t.noBetting, note: t.operatorProofSafetyNote },
    { label: t.operatorProofCommercial, value: t.ready, note: t.operatorProofCommercialNote },
  ];
  const competitorEdges = [
    t.competitorEdgeFinalWhistle,
    t.competitorEdgeProof,
    t.competitorEdgeOurEdge,
    t.competitorEdgeBlocker,
  ];
  const scheduleSeedItems = dataConsistencyState.today.filter((item) => item.fixtureId);
  const matchdayItems = dataConsistencyState.today.slice(0, 5);
  const trustMetrics = [
    {
      label: trust.scheduleSeed,
      value: trust.scheduleValue,
      note: trust.scheduleNote,
    },
    {
      label: trust.liveGate,
      value: trust.liveGateValue,
      note: trust.liveGateNote,
    },
    {
      label: trust.replayTruth,
      value: trust.replayTruthValue,
      note: trust.replayTruthNote,
    },
    {
      label: trust.freeTier,
      value: trust.freeTierValue,
      note: trust.freeTierNote,
    },
  ];
  const endpointCoverage = [
    {
      endpoint: "POST /auth/guest/start",
      coverage: "Guest JWT auth bootstrap",
      status: trust.mapped,
      state: "mapped",
    },
    {
      endpoint: "GET /api/fixtures/snapshot",
      coverage: "Fixture id, teams, start time, status",
      status: trust.mapped,
      state: "mapped",
    },
    {
      endpoint: "GET /api/scores/snapshot/{fixtureId}",
      coverage: "Score clock, action events, score snapshots",
      status: trust.tokenGated,
      state: "gated",
    },
    {
      endpoint: "GET /api/odds/snapshot/{fixtureId}",
      coverage: "1X2 odds snapshots, price names, percentages, market freshness",
      status: trust.tokenGated,
      state: "gated",
    },
    {
      endpoint: "GET /api/scores/stream + /api/odds/stream",
      coverage: "Server-sent live score and odds updates",
      status: trust.planned,
      state: "planned",
    },
  ];
  const matchTickerItems = [
    {
      label: `${match.home.code} vs ${match.away.code}`,
      value: `${frame.homeScore}-${frame.awayScore}`,
    },
    {
      label: t.clock,
      value: `${minute}' / ${t.pulse} ${fanTemperature}`,
    },
    {
      label: t.source,
      value: sourceStatus?.label ?? t.publicSeedSource,
    },
    {
      label: t.nextBeat,
      value: nextBeatSummary,
    },
    {
      label: t.marketMood,
      value: `${frame.market.sentiment}/100`,
    },
    {
      label: t.safety,
      value: t.noBetting,
    },
  ];
  const impliedHome = 1 / frame.market.homeWin;
  const impliedDraw = 1 / frame.market.draw;
  const impliedAway = 1 / frame.market.awayWin;
  const impliedTotal = impliedHome + impliedDraw + impliedAway;
  const predictionOptions = [
    {
      id: "home" as const,
      label: homeTeamName,
      shortLabel: match.home.code,
      implied: Math.round((impliedHome / impliedTotal) * 100),
      price: frame.market.homeWin,
    },
    {
      id: "draw" as const,
      label: t.draw,
      shortLabel: t.draw,
      implied: Math.round((impliedDraw / impliedTotal) * 100),
      price: frame.market.draw,
    },
    {
      id: "away" as const,
      label: awayTeamName,
      shortLabel: match.away.code,
      implied: Math.round((impliedAway / impliedTotal) * 100),
      price: frame.market.awayWin,
    },
  ];
  const fanLean = predictionOptions.reduce((leaderOption, option) =>
    option.implied > leaderOption.implied ? option : leaderOption,
  );
  const scoreDerivedPick = getPredictionPickFromScore(predictedHomeScore, predictedAwayScore);
  const activePredictionPick = predictionPick ?? scoreDerivedPick;
  const selectedPrediction = predictionOptions.find((option) => option.id === activePredictionPick);
  const predictedOutcome =
    predictedHomeScore === predictedAwayScore
      ? t.draw
      : predictedHomeScore > predictedAwayScore
        ? homeTeamName
        : awayTeamName;
  const eventStats = buildEventStats(frame.activeEvents);
  const minutesUntilNextKeyMoment = nextEvent ? Math.max(0, nextEvent.minute - minute) : null;
  const isHighValueLatestEvent = frame.latestEvent ? highValueEventTypes.has(frame.latestEvent.type) : false;
  const shouldAlertNow = fanTemperature >= alertThreshold || isHighValueLatestEvent;
  const isNextKeyMomentClose = minutesUntilNextKeyMoment !== null && minutesUntilNextKeyMoment <= 8;
  const watchSignal =
    shouldAlertNow || fanTemperature >= 70
      ? {
          label: t.watchSignalNow,
          reason: t.watchSignalReasonHot,
          tone: "hot",
        }
      : isNextKeyMomentClose || fanTemperature >= 45
        ? {
            label: t.watchSignalSoon,
            reason:
              minutesUntilNextKeyMoment !== null
                ? `${minutesUntilNextKeyMoment} ${t.minutesToKeyMoment}. ${t.watchSignalReasonNext}`
                : t.watchSignalReasonNext,
            tone: "warm",
          }
        : {
            label: t.watchSignalLater,
            reason: t.watchSignalReasonCalm,
            tone: "calm",
          };
  const thresholdLabels: Record<AlertThreshold, string> = {
    55: t.alertLow,
    65: t.alertBalanced,
    78: t.alertStrict,
  };
  const sortedImplied = [...predictionOptions].sort((first, second) => second.implied - first.implied);
  const confidenceGap = (sortedImplied[0]?.implied ?? 0) - (sortedImplied[1]?.implied ?? 0);
  const aiConfidence =
    confidenceGap >= 22
      ? aiText.confidenceHigh
      : confidenceGap >= 10
        ? aiText.confidenceMedium
        : aiText.confidenceLow;
  const volatilityScore = Math.min(
    99,
    Math.max(
      1,
      Math.round(
        Math.abs(frame.insight.swing) * 2 +
          eventStats.goals * 18 +
          eventStats.cards * 8 +
          eventStats.marketSwings * 10 +
          frame.activeEvents.length * 2,
      ),
    ),
  );
  const aiVolatility =
    volatilityScore >= 70
      ? aiText.volatilityHigh
      : volatilityScore >= 34
        ? aiText.volatilityMedium
        : aiText.volatilityLow;
  const aiPunditCards = [
    {
      label: aiText.prediction,
      value: `${fanLean.label} ${fanLean.implied}%`,
      note: `${aiConfidence}. ${dataStatusLabel}. ${aiText.localModelNote}`,
    },
    {
      label: aiText.evaluation,
      value: `${aiVolatility} ${volatilityScore}/100`,
      note: `${dataStatusLabel}. ${aiText.noAdvice}`,
    },
    {
      label: aiText.commentary,
      value: localizedCommentary,
      note: latestEventDisplay?.title ?? localizedInsight,
    },
  ].filter((item) => item.value.trim().length > 0);
  const aiEvidenceItems = [
    {
      label: t.marketMood,
      value: `${frame.market.sentiment}/100`,
      note: `${swingSignalLabel}: ${frame.insight.swing > 0 ? "+" : ""}${frame.insight.swing}`,
    },
    {
      label: t.pulse,
      value: `${fanTemperature}/100`,
      note: watchSignal.label,
    },
    {
      label: t.currentRead,
      value: `${eventStats.goals} ${t.goals} / ${eventStats.marketSwings} ${t.marketSwings}`,
      note: localizedInsight,
    },
    {
      label: t.source,
      value: dataStatusLabel,
      note: sourceStatus?.label ?? t.publicSeedSource,
    },
  ];
  const fanSignalItems = [
    { label: t.currentRead, value: localizedInsight },
    { label: t.goals, value: String(eventStats.goals) },
    { label: t.cards, value: String(eventStats.cards) },
    { label: t.marketSwings, value: String(eventStats.marketSwings) },
  ];
  const recentPulseEvents = frame.activeEvents.slice(-4).reverse();
  const playerImpact = buildPlayerImpact(frame.activeEvents);
  const phaseSummary = buildPhaseSummary(minute, match, t, matchDisplay, homeTeamName, awayTeamName);
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
  const judgeCriteria = judgeCriteriaByLanguage[language];
  const judgePanelText = judgePanelTextByLanguage[language];
  const judgeScore = Math.round(
    judgeCriteria.reduce((total, criterion) => total + criterion.score, 0) / judgeCriteria.length,
  );
  const currentPreset = viewPresets.find((preset) => preset.id === viewPreset) ?? viewPresets[0];
  const currentPresetDisplay = getPresetDisplay(currentPreset, language);
  const matchTeamCodes = new Set([match.home.code, match.away.code]);
  const priorityTeamAtlas = [...teamAtlas].sort((first, second) => {
    const firstActive = matchTeamCodes.has(first.code) ? 1 : 0;
    const secondActive = matchTeamCodes.has(second.code) ? 1 : 0;
    return secondActive - firstActive || first.name.localeCompare(second.name);
  });
  const selectedTeam = teamAtlas.find((team) => team.code === selectedTeamCode) ?? teamAtlas[0];
  const selectedTeamDisplay = getTeamDisplay(selectedTeam, language);

  function openDemoChapter(chapter: DemoChapter) {
    switchMode("replay", { resetMinute: false });
    setReplayMatchId(chapter.matchId);
    setIsPlaying(false);
    setMinute(chapter.minute);
  }

  function updatePredictedScore(nextHomeScore: number, nextAwayScore: number) {
    const safeHomeScore = clampScore(nextHomeScore);
    const safeAwayScore = clampScore(nextAwayScore);

    setPredictedHomeScore(safeHomeScore);
    setPredictedAwayScore(safeAwayScore);
    setPredictionPick(getPredictionPickFromScore(safeHomeScore, safeAwayScore));
  }

  function choosePredictionPick(nextPick: PredictionPick) {
    if (nextPick === "draw") {
      const drawScore = Math.max(predictedHomeScore, predictedAwayScore);
      updatePredictedScore(drawScore, drawScore);
      return;
    }

    if (nextPick === "home") {
      const nextAwayScore = predictedAwayScore === 9 ? 8 : predictedAwayScore;
      updatePredictedScore(Math.max(predictedHomeScore, nextAwayScore + 1), nextAwayScore);
      return;
    }

    const nextHomeScore = predictedHomeScore === 9 ? 8 : predictedHomeScore;
    updatePredictedScore(nextHomeScore, Math.max(predictedAwayScore, nextHomeScore + 1));
  }

  function revealSection(sectionSelector: string, reveal: () => void) {
    reveal();
    window.requestAnimationFrame(() => {
      document.querySelector(sectionSelector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className={`app-shell preset-${viewPreset}`} translate="no">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">{t.appEyebrow}</p>
          <h1>World Cup Live Pulse</h1>
        </div>
        <div className="top-actions">
          <div className="mode-switch" aria-label="Dashboard mode">
            <button
              aria-pressed={mode === "replay"}
              className={mode === "replay" ? "active" : ""}
              onClick={() => switchMode("replay")}
              type="button"
            >
              {t.replay}
            </button>
            <button
              aria-pressed={mode === "live"}
              className={mode === "live" ? "active" : ""}
              onClick={() => switchMode("live")}
              type="button"
            >
              {t.live}
            </button>
          </div>
          <button
            aria-busy={isRefreshing}
            aria-label="Refresh live data"
            className="settings-button refresh-button"
            disabled={isRefreshing}
            onClick={() => setRefreshNonce((value) => value + 1)}
            title="Refresh live data"
            type="button"
          >
            {isRefreshing ? "..." : "↻"}
          </button>
          <button
            className="settings-button"
            onClick={() => setSettingsOpen((value) => !value)}
            type="button"
          >
            {settingsOpen ? t.close : t.settings}
          </button>
        </div>
      </header>

      <section className="event-status-strip" aria-label="Hackathon review status">
        <strong>{t.eventBuildStatus}</strong>
        <span>{t.judgeableBuild}</span>
        <span>{t.replayAvailable}</span>
        <span>{t.txlineLiveGated}</span>
        <span>{trust.freeTierValue}</span>
        <time>
          {t.checkedAt}: {formatKickoff(dataConsistencyState.checkedAtIso, language)}
        </time>
      </section>

      {settingsOpen ? (
        <>
          <button
            aria-label={t.close}
            className="settings-scrim"
            onClick={() => setSettingsOpen(false)}
            type="button"
          />
          <aside className="settings-drawer" aria-label={t.settings}>
            <div className="settings-heading">
              <div>
                <p className="eyebrow">{t.settings}</p>
                <h2>{t.controlsStatus}</h2>
              </div>
              <button className="drawer-close" onClick={() => setSettingsOpen(false)} type="button">
                {t.close}
              </button>
            </div>
            <p className="settings-helper">{t.settingsHelper}</p>
            <div className="settings-grid">
              <section className="settings-card">
                <span>{t.language}</span>
                <div className="language-control" aria-label={t.language}>
                  {displayLanguageOptions.map((option) => (
                    <button
                      className={language === option.code ? "active" : ""}
                      key={option.code}
                      onClick={() => setLanguage(option.code)}
                      type="button"
                    >
                      <strong>{option.label}</strong>
                      <span>{option.region}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="settings-card">
                <span>{t.viewingPreset}</span>
                <div className="preset-control" aria-label={t.viewingPreset}>
                  {viewPresets.map((preset) => {
                    const display = getPresetDisplay(preset, language);

                    return (
                      <button
                        aria-pressed={viewPreset === preset.id}
                        className={viewPreset === preset.id ? "active" : ""}
                        key={preset.id}
                        onClick={() => applyViewPreset(preset.id)}
                        type="button"
                      >
                        {display.label}
                      </button>
                    );
                  })}
                </div>
                <p>{currentPresetDisplay.description}</p>
              </section>
              <section className="settings-card">
                <span>{t.dashboardModules}</span>
                <label className="toggle-row">
                  <input
                    checked={showManual}
                    onChange={(event) => setShowManual(event.target.checked)}
                    type="checkbox"
                  />
                  <strong>{t.operationManualToggle}</strong>
                </label>
                <label className="toggle-row">
                  <input
                    checked={showMatchGuide}
                    onChange={(event) => setShowMatchGuide(event.target.checked)}
                    type="checkbox"
                  />
                  <strong>{t.fixtureBriefingToggle}</strong>
                </label>
                <label className="toggle-row">
                  <input
                    checked={showTeamAtlas}
                    onChange={(event) => setShowTeamAtlas(event.target.checked)}
                    type="checkbox"
                  />
                  <strong>{t.countryAtlasToggle}</strong>
                </label>
                <label className="toggle-row">
                  <input
                    checked={showVideoPanel}
                    onChange={(event) => setShowVideoPanel(event.target.checked)}
                    type="checkbox"
                  />
                  <strong>{t.videoPanelToggle}</strong>
                </label>
              </section>
            </div>
          </aside>
        </>
      ) : null}

      <section className="match-hero" aria-label="Current match">
        <div className="hero-copy">
          <div className="status-ribbon">
            <span className={source?.kind === "replay" ? "status-replay" : "status-waiting"}>
              {visibleSourceLabel}
            </span>
            <span>{visibleSourceMode}</span>
            <span>{dataStatusLabel}</span>
            <span>{leader}</span>
          </div>
          <div className="scoreline">
            <TeamBadge name={homeTeamName} code={match.home.code} color={match.home.color} />
            <div className="score">
              <strong>{frame.homeScore}</strong>
              <span>-</span>
              <strong>{frame.awayScore}</strong>
            </div>
            <TeamBadge name={awayTeamName} code={match.away.code} color={match.away.color} />
          </div>
          <div className="match-meta">
            <span>{matchDisplay.competition}</span>
            <span>{matchDisplay.venue}</span>
            <span>{liveActivationPending ? t.replayFallbackReady : kickoffLabel}</span>
          </div>
          <div className="hero-actions" aria-label={t.focusNav}>
            <button type="button" onClick={() => revealSection(".fan-command-center", () => undefined)}>
              {t.focusWatch}
            </button>
            <button type="button" onClick={() => revealSection(".prediction-panel", () => undefined)}>
              {t.focusPick}
            </button>
            <button type="button" onClick={() => revealSection(".timeline-panel", () => undefined)}>
              {t.focusTimeline}
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <section className={`hero-watch-card signal-${watchSignal.tone}`} aria-label={t.watchSignal}>
            <span>{t.watchSignal}</span>
            <strong>{watchSignal.label}</strong>
            <p>{watchSignal.reason}</p>
            <small>{localizedCommentary}</small>
          </section>
          <Metric label={t.clock} value={`${minute}'`} />
          <Metric label={t.pulse} value={`${fanTemperature}/100`} />
          <Metric label={t.latestBeat} value={latestEventDisplay?.title ?? t.waitingForKickoff} />
        </div>
      </section>

      {sourceStatus ? (
        <section
          className={`source-banner source-${source?.kind} ${liveActivationPending ? "source-live-pending" : ""}`}
          aria-label="Data source status"
        >
          <div className="source-banner-main">
            <strong>{visibleSourceLabel}</strong>
            <span>{visibleSourceMessage}</span>
          </div>
          <div className="source-banner-actions">
            <button type="button" onClick={() => switchMode("replay")}>
              {t.replayDemo}
            </button>
            <a href="tools/txline-subscribe/index.html?v=2026-07-10" rel="noreferrer" target="_blank">
              {t.apiAccessPlan}
            </a>
          </div>
          <div className="source-trust-strip" aria-label={t.dataConsistency}>
            <span>
              <strong>{t.currentMode}</strong>
              {mode === "replay" ? t.replay : t.live}
            </span>
            <span>
              <strong>{t.dataStatus}</strong>
              {dataStatusLabel}
            </span>
            <span>
              <strong>{t.source}</strong>
              {liveActivationPending ? trust.freeTierValue : sourceStatus?.label ?? t.publicSeedSource}
            </span>
            <span>
              <strong>{t.freshness}</strong>
              {formatKickoff(dataConsistencyState.checkedAtIso, language)}
            </span>
          </div>
        </section>
      ) : null}

      <section className="matchday-rail" aria-label={t.matchdayHub}>
        <article className="matchday-current">
          <p className="eyebrow">{t.matchdayHub}</p>
          <h2>
            {homeTeamName} vs {awayTeamName}
          </h2>
          <div className="matchday-current-status">
            <span>{liveActivationPending ? t.replayFallbackReady : mode === "replay" ? t.nowPlaying : visibleSourceLabel}</span>
            <small>
              {t.checkedAt}: {formatKickoff(dataConsistencyState.checkedAtIso, language)}
            </small>
          </div>
          <p>{t.sourceBoundary}</p>
          <div className="matchday-current-facts">
            <span>
              <small>{t.dataStatus}</small>
              <strong>{dataStatusLabel}</strong>
            </span>
            <span>
              <small>{t.pulse}</small>
              <strong>{fanTemperature}/100</strong>
            </span>
            <span>
              <small>{t.nextBeat}</small>
              <strong>{nextEvent ? `${nextEvent.minute}'` : t.replayLoop}</strong>
            </span>
          </div>
        </article>
        <div className="matchday-list" aria-label={t.todaysMatches}>
          {matchdayItems.map((item) => {
            const isActiveReplay = item.id === replayMatchId;
            const isAvailable = item.availability === "available";
            const statusLabel = isAvailable ? t.replayAvailable : getDataStatusLabel(item.dataStatus ?? "Seed", language);
            const display = getTodayCardDisplay(item, language);

            if (!isAvailable) {
              return (
                <article aria-disabled="true" className="matchday-item locked" key={item.id}>
                  <div className="matchday-card-top">
                    <span>{t.officialSeed}</span>
                    <em>{statusLabel}</em>
                  </div>
                  <strong>
                    {item.homeCode} vs {item.awayCode}
                  </strong>
                  <small>{formatKickoff(item.kickoffIso, language)}</small>
                  <small>{display.stage}</small>
                  <div className="matchday-card-foot">
                    <span>{t.source}</span>
                    <strong>{item.sourceLabel ?? t.txlineLiveGated}</strong>
                  </div>
                </article>
              );
            }

            return (
              <button
                aria-pressed={isActiveReplay}
                className={`matchday-item ${isActiveReplay ? "active" : ""}`}
                key={item.id}
                onClick={() => {
                  setReplayMatchId(item.id);
                  switchMode("replay");
                  revealSection(".fan-command-center", () => undefined);
                }}
                type="button"
              >
                <div className="matchday-card-top">
                  <span>{statusLabel}</span>
                  <em>{isActiveReplay ? t.nowPlaying : t.focusWatch}</em>
                </div>
                <strong>
                  {item.homeCode} vs {item.awayCode}
                </strong>
                <small>{display.stage}</small>
                <div className="matchday-card-foot">
                  <span>{t.source}</span>
                  <strong>{item.sourceLabel ?? t.replay}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="match-ticker" aria-label="Match data ticker">
        <div className="ticker-track">
          {[...matchTickerItems, ...matchTickerItems].map((item, index) => (
            <div className="ticker-item" key={`${item.label}-${index}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <nav className="match-focus-nav" aria-label={t.focusNav}>
        <span>{t.focusNav}</span>
        <button type="button" onClick={() => revealSection(".fan-command-center", () => undefined)}>
          {t.focusWatch}
        </button>
        <button type="button" onClick={() => revealSection(".prediction-panel", () => undefined)}>
          {t.focusPick}
        </button>
        <button type="button" onClick={() => revealSection(".timeline-panel", () => undefined)}>
          {t.focusTimeline}
        </button>
        <button type="button" onClick={() => revealSection(".market-panel", () => undefined)}>
          {t.focusMood}
        </button>
        <button
          type="button"
          onClick={() =>
            revealSection(".team-atlas-section", () => {
              setShowTeamAtlas(true);
            })
          }
        >
          {t.focusTeams}
        </button>
      </nav>

      <section className="fan-command-center" aria-label={t.fanCommand}>
        <article className="watch-now-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.fanCommand}</p>
            <h2>{t.watchNow}</h2>
          </div>
          <strong>{latestEventDisplay?.title ?? localizedInsight}</strong>
          {latestEventDisplay?.description ? <p>{latestEventDisplay.description}</p> : null}
          <div className={`watch-signal-card signal-${watchSignal.tone}`} aria-label={t.watchSignal}>
            <div>
              <span>{t.watchSignal}</span>
              <strong>{watchSignal.label}</strong>
              <p>{watchSignal.reason}</p>
            </div>
            <small>
              {shouldAlertNow ? t.alertNow : t.alertQuiet} / {t.attentionNotBetting}
            </small>
          </div>
          <div className="alert-threshold-control" aria-label={t.alertThreshold}>
            <span>{t.alertThreshold}</span>
            <div>
              {alertThresholdOptions.map((threshold) => (
                <button
                  aria-pressed={alertThreshold === threshold}
                  className={alertThreshold === threshold ? "active" : ""}
                  key={threshold}
                  onClick={() => chooseAlertThreshold(threshold)}
                  type="button"
                >
                  <span>{thresholdLabels[threshold]}</span>
                  <strong>{threshold}</strong>
                </button>
              ))}
            </div>
          </div>
          <div className="ai-readout">
            <span>{t.aiCommentary}</span>
            <strong>{localizedCommentary}</strong>
          </div>
          {aiPunditCards.length ? (
            <div className="ai-lab-strip" aria-label={aiText.lab}>
              {aiPunditCards.map((item) => (
                <span key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <em>{item.note}</em>
                </span>
              ))}
            </div>
          ) : null}
          <div className="fan-signal-strip" aria-label={t.currentRead}>
            {fanSignalItems.map((item) => (
              <span key={item.label}>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
          <div className="watch-now-grid">
            <Metric label={t.clock} value={`${minute}'`} />
            <Metric label={t.nextBeat} value={nextEvent ? `${nextEvent.minute}'` : t.replayLoop} />
            <Metric label={t.pulse} value={`${fanTemperature}/100`} />
          </div>
          <div className="mini-event-feed" aria-label={t.liveFeed}>
            <span>{t.liveFeed}</span>
            {recentPulseEvents.length ? (
              recentPulseEvents.map((event) => {
                const display = formatEventDisplay(event, match, language);
                return (
                  <button
                    className={event.id === frame.latestEvent?.id ? "active" : ""}
                    key={event.id}
                    onClick={() => jumpToMoment(event.minute)}
                    type="button"
                  >
                    <strong>
                      {event.minute}
                      {event.stoppage ? `+${event.stoppage}` : ""}'
                    </strong>
                    <span>{display.title}</span>
                  </button>
                );
              })
            ) : (
              <p>{t.waitingForKickoff}</p>
            )}
          </div>
        </article>

        <article className="prediction-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.predictionSafety}</p>
            <h2>{t.fanPrediction}</h2>
          </div>
          <p>{t.predictionBody}</p>
          <div className="score-pick-grid" aria-label={t.yourPick}>
            <section>
              <span>{match.home.code}</span>
              <div className="score-stepper">
                <button
                  aria-label={`${match.home.code} -1`}
                  onClick={() => updatePredictedScore(predictedHomeScore - 1, predictedAwayScore)}
                  type="button"
                >
                  -
                </button>
                <strong>{predictedHomeScore}</strong>
                <button
                  aria-label={`${match.home.code} +1`}
                  onClick={() => updatePredictedScore(predictedHomeScore + 1, predictedAwayScore)}
                  type="button"
                >
                  +
                </button>
              </div>
            </section>
            <section>
              <span>{match.away.code}</span>
              <div className="score-stepper">
                <button
                  aria-label={`${match.away.code} -1`}
                  onClick={() => updatePredictedScore(predictedHomeScore, predictedAwayScore - 1)}
                  type="button"
                >
                  -
                </button>
                <strong>{predictedAwayScore}</strong>
                <button
                  aria-label={`${match.away.code} +1`}
                  onClick={() => updatePredictedScore(predictedHomeScore, predictedAwayScore + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </section>
          </div>
          <div className="prediction-options" aria-label={t.fanPrediction}>
            {predictionOptions.map((option) => (
              <button
                aria-pressed={activePredictionPick === option.id}
                className={activePredictionPick === option.id ? "active" : ""}
                key={option.id}
                onClick={() => choosePredictionPick(option.id)}
                type="button"
              >
                <span>{option.shortLabel}</span>
                <strong>{option.implied}%</strong>
                <small>x{option.price.toFixed(2)}</small>
                <em style={{ width: `${option.implied}%` }} />
              </button>
            ))}
          </div>
          <div className="prediction-evidence" aria-label={aiText.evaluation}>
            <header>
              <span>{aiText.lab}</span>
              <strong>
                {aiConfidence} / {aiVolatility}
              </strong>
            </header>
            <div>
              {aiEvidenceItems.map((item) => (
                <span key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <em>{item.note}</em>
                </span>
              ))}
            </div>
          </div>
          <div className="prediction-readout">
            <span>
              {t.yourPick}:{" "}
              <strong>
                {match.home.code} {predictedHomeScore}-{predictedAwayScore} {match.away.code} / {predictedOutcome}
              </strong>
            </span>
            <span>
              {t.quickPick}: <strong>{selectedPrediction?.label ?? fanLean.label}</strong>
            </span>
            <span>
              {t.fanLean}:{" "}
              <strong>
                {fanLean.label} {fanLean.implied}%
              </strong>
            </span>
            <small>
              {t.scoreLinkedPick} / {t.localOnly}
            </small>
          </div>
          <button
            className="download-pick-button"
            onClick={() =>
              downloadPredictionCard(match, frame, {
                awayScore: predictedAwayScore,
                homeScore: predictedHomeScore,
                outcome: predictedOutcome,
                quickPick: selectedPrediction?.label ?? fanLean.label,
                safetyLabel: `${t.predictionSafety}. ${t.noBetting}.`,
              })
            }
            type="button"
          >
            {t.downloadPickCard}
          </button>
        </article>

        <article className="quick-info-panel">
          <div className="panel-heading">
            <p className="eyebrow">{t.dataBacked}</p>
            <h2>{matchDisplay.stage ?? matchDisplay.competition}</h2>
          </div>
          <p>{language === "en" && match.qualificationNote ? match.qualificationNote : localizedInsight}</p>
          {sourceStatus ? (
            <div className="source-mini-ledger">
              <span>{t.source}</span>
              <strong>{sourceStatus.label}</strong>
              <small>{sourceStatus.message}</small>
            </div>
          ) : null}
          {playerImpact[0] ? (
            <div className="featured-player">
              <span>{t.playerImpact}</span>
              <strong>
                {playerImpact[0].name} / {playerImpact[0].team}
              </strong>
              <small>
                {t.involved}: {playerImpact[0].events} / {t.minutes}: {playerImpact[0].minutes.join(", ")}
              </small>
            </div>
          ) : null}
          <div className="quick-info-actions">
            <button
              type="button"
              onClick={() =>
                revealSection(".team-atlas-section", () => {
                  setShowTeamAtlas(true);
                })
              }
            >
              {t.openTeamInfo}
            </button>
            <button
              type="button"
              onClick={() =>
                revealSection(".fixture-briefing", () => {
                  setShowMatchGuide(true);
                })
              }
            >
              {t.openFixtureInfo}
            </button>
          </div>
        </article>
      </section>

      {showVideoPanel ? (
        <section className="video-sync-panel" aria-label={t.videoSyncTitle}>
          <div className="section-heading">
            <p className="eyebrow">{t.videoSyncEyebrow}</p>
            <h2>{t.videoSyncTitle}</h2>
          </div>
          <div className="video-sync-layout">
            {videoEmbedUrl ? (
              <iframe
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                src={videoEmbedUrl}
                title={t.videoSyncTitle}
              />
            ) : (
              <div className="video-placeholder">
                <strong>{t.noVideoSource}</strong>
                <p>{t.videoSyncBody}</p>
              </div>
            )}
            <dl className="video-facts">
              <div>
                <dt>{t.videoProvider}</dt>
                <dd>{videoEmbedUrl ? new URL(videoEmbedUrl).hostname : t.noVideoSource}</dd>
              </div>
              <div>
                <dt>{t.videoStatus}</dt>
                <dd>{videoEmbedUrl ? t.ready : t.videoStatusValue}</dd>
              </div>
              <div>
                <dt>{t.videoClockSync}</dt>
                <dd>{t.videoClockSyncValue}</dd>
              </div>
              <div>
                <dt>{t.videoRightsNote}</dt>
                <dd>{t.videoRightsNoteValue}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : null}

      {showManual ? (
        <section className="matchday-assistant" aria-label="Operation manual">
          <article className="assistant-summary">
            <p className="eyebrow">{t.operationManualEyebrow}</p>
            <h2>{t.operationManualTitle}</h2>
            <p>{t.operationManualBody}</p>
            <div className="preset-focus">
              <span>{currentPresetDisplay.label}</span>
              {currentPresetDisplay.focus.map((item) => (
                <strong key={item}>{item}</strong>
              ))}
            </div>
          </article>
          <div className="manual-steps">
            {manualSteps.map((step) => {
              const display = getManualStepDisplay(step, language);

              return (
                <section key={step.id}>
                  <strong>{display.title}</strong>
                  <p>{display.action}</p>
                  <small>{display.reason}</small>
                </section>
              );
            })}
          </div>
        </section>
      ) : null}

      {showMatchGuide ? (
        <section className="fixture-briefing" aria-label="Fixture briefing">
          <div className="section-heading">
            <p className="eyebrow">{t.fixtureBriefingEyebrow}</p>
            <h2>{t.fixtureBriefingTitle}</h2>
          </div>
          <div className="fixture-briefing-grid">
            {matchBriefings.map((briefing) => {
              const display = getMatchBriefingDisplay(briefing, language);

              return (
                <article className={briefing.id === replayMatchId ? "active" : ""} key={briefing.id}>
                  <div>
                    <span>{display.source}</span>
                    <strong>{display.title}</strong>
                    <small>
                      {display.stage} / {display.kickoff}
                    </small>
                  </div>
                  <em>{display.status}</em>
                  <ul>
                    {display.whatToWatch.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {showTeamAtlas ? (
        <section className="team-atlas-section" aria-label="Country team atlas">
          <div className="section-heading">
            <p className="eyebrow">{t.countryAtlasEyebrow}</p>
            <h2>{t.countryAtlasTitle}</h2>
          </div>
          <div className="team-atlas-layout">
            <div className="country-card-grid">
              {priorityTeamAtlas.map((team) => {
                const display = getTeamDisplay(team, language);

                return (
                  <button
                    aria-pressed={team.code === selectedTeam.code}
                    className={`${team.code === selectedTeam.code ? "active" : ""} ${
                      matchTeamCodes.has(team.code) ? "match-team" : ""
                    }`}
                    key={team.code}
                    onClick={() => setSelectedTeamCode(team.code)}
                    type="button"
                  >
                    <span
                      className="country-mark"
                      style={{
                        background: `linear-gradient(135deg, ${team.colors[0]} 0 50%, ${team.colors[1]} 50% 100%)`,
                      }}
                    >
                      {team.code}
                    </span>
                    <strong>{display.name}</strong>
                    <small>{display.status}</small>
                  </button>
                );
              })}
            </div>
            <article className="selected-team-card">
              <div className="team-card-heading">
                <span
                  className="country-mark large"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTeam.colors[0]} 0 50%, ${selectedTeam.colors[1]} 50% 100%)`,
                  }}
                >
                  {selectedTeam.code}
                </span>
                <div>
                  <p className="eyebrow">{selectedTeamDisplay.region}</p>
                  <h2>{selectedTeamDisplay.name}</h2>
                  <span>{selectedTeamDisplay.status}</span>
                </div>
              </div>
              <dl className="team-scout-grid">
                <div>
                  <dt>{t.teamStyle}</dt>
                  <dd>{selectedTeamDisplay.style}</dd>
                </div>
                <div>
                  <dt>{t.fanRead}</dt>
                  <dd>{selectedTeamDisplay.fanRead}</dd>
                </div>
                <div>
                  <dt>{t.watchFor}</dt>
                  <dd>{selectedTeamDisplay.watchFor}</dd>
                </div>
                <div>
                  <dt>{t.dataNote}</dt>
                  <dd>{selectedTeamDisplay.dataNote}</dd>
                </div>
              </dl>
              <div className="key-player-chips" aria-label="Key players">
                {selectedTeamDisplay.keyPlayers.map((player) => (
                  <span key={player}>{player}</span>
                ))}
              </div>
            </article>
          </div>
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

            const cardContent = (
              <>
                <strong>
                  {item.homeCode} vs {item.awayCode}
                </strong>
                <span>{display.label}</span>
                <span>{display.stage}</span>
                <small>
                  {formatKickoff(item.kickoffIso, language)} / {item.dataStatus}
                </small>
                {item.coverage ? <small>{item.coverage}</small> : null}
                {item.statusNote ? <small>{item.statusNote}</small> : null}
              </>
            );

            if (item.availability !== "available") {
              return (
                <article className="today-card unavailable" key={item.id}>
                  {cardContent}
                </article>
              );
            }

            return (
              <button
                aria-pressed={item.id === replayMatchId}
                className={`today-card ${item.id === replayMatchId ? "active" : ""}`}
                key={item.id}
                onClick={() => {
                  setIsPlaying(false);
                  setReplayMatchId(item.id);
                  switchMode("replay");
                }}
                type="button"
              >
                {cardContent}
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

      <section className="api-access-panel" aria-label={t.apiAccessPlan}>
        <div className="panel-heading">
          <p className="eyebrow">{t.apiAccessPlan}</p>
          <h2>{t.apiAccessTitle}</h2>
        </div>
        <div className="api-access-grid">
          {apiAccessItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <div className="api-request-strip">
          <span>{t.apiAccessAskOfficial}</span>
          {officialAccessQuestions.map((item) => (
            <strong key={item}>{item}</strong>
          ))}
        </div>
      </section>

      <section className="operator-kit-panel" aria-label={t.operatorKit}>
        <article className="operator-decision">
          <div className="panel-heading">
            <p className="eyebrow">{t.operatorKit}</p>
            <h2>{t.operatorTitle}</h2>
          </div>
          <span>{t.operatorBuyerQuestion}</span>
          <strong>{t.operatorBuyerAnswer}</strong>
        </article>
        <article className="operator-grid-card">
          <div className="operator-card-grid">
            {operatorValueItems.map((item) => (
              <section key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </section>
            ))}
          </div>
        </article>
        <article className="operator-grid-card">
          <div className="operator-card-grid">
            {operatorProofItems.map((item) => (
              <section key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </section>
            ))}
          </div>
        </article>
        <article className="operator-edge-card">
          <span>{t.competitorEdgeTitle}</span>
          {competitorEdges.map((item) => (
            <strong key={item}>{item}</strong>
          ))}
        </article>
      </section>

      <section className="trust-center" aria-label={trust.title}>
        <article className="trust-metrics-panel">
          <div className="panel-heading">
            <p className="eyebrow">{trust.eyebrow}</p>
            <h2>{trust.title}</h2>
          </div>
          <div className="trust-metric-grid">
            {trustMetrics.map((item) => (
              <section key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </section>
            ))}
          </div>
          <div className="fixture-ledger" aria-label={trust.visibleFixtures}>
            <span>{trust.visibleFixtures}</span>
            {scheduleSeedItems.map((item) => (
              <div key={item.id}>
                <strong>
                  {item.homeCode} vs {item.awayCode}
                </strong>
                <small>
                  #{item.fixtureId} / {formatKickoff(item.kickoffIso, language)} / {item.dataStatus}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="endpoint-panel">
          <div className="panel-heading">
            <p className="eyebrow">TxLINE</p>
            <h2>{trust.endpointsTitle}</h2>
          </div>
          <div className="endpoint-card-grid" aria-label={trust.endpointsTitle}>
            {endpointCoverage.map((item) => (
              <section className={`endpoint-card endpoint-${item.state}`} key={item.endpoint}>
                <span>{item.status}</span>
                <code>{item.endpoint}</code>
                <p>{item.coverage}</p>
              </section>
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
          <div className="demo-cue-strip" aria-label={t.demoReadiness}>
            <span>{t.replayDemo}</span>
            <span>{t.dataConsistency}</span>
            <span>{t.noBetting}</span>
            <span>{t.downloadSvg}</span>
          </div>
          <div className="chapter-grid">
            {demoChapters.map((chapter) => (
              <button
                aria-pressed={selectedDemoChapter?.id === chapter.id}
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
        <article className="criteria-score-panel">
          <div className="panel-heading">
            <p className="eyebrow">{judgePanelText.eyebrow}</p>
            <h2>
              {judgePanelText.scoreLabel}: {judgeScore}/100
            </h2>
          </div>
          <div className="criteria-grid">
            {judgeCriteria.map((criterion) => (
              <section key={criterion.id}>
                <span>{criterion.score}/100</span>
                <strong>{criterion.label}</strong>
                <p>{criterion.evidence}</p>
                <small>{criterion.proof}</small>
              </section>
            ))}
          </div>
          <div className="score-ceiling-note">
            <strong>{judgePanelText.blockerTitle}</strong>
            <p>{judgePanelText.blockerIntro}</p>
            <ul>
              {judgePanelText.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="story-strip" aria-label="Match story">
        <article>
          <span>{t.latestBeat}</span>
          <strong>{latestEventDisplay?.title ?? t.waitingForKickoff}</strong>
          {latestEventDisplay?.description ? <p>{latestEventDisplay.description}</p> : null}
        </article>
        <article>
          <span>{t.nextBeat}</span>
          <strong>{nextBeatSummary}</strong>
          <p>{localizedInsight}</p>
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
              aria-pressed={candidate.id === replayMatchId}
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
          <button aria-pressed={isPlaying} type="button" onClick={() => setIsPlaying((value) => !value)}>
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
                aria-pressed={speed === option}
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
              {event.minute}' {formatEventDisplay(event, match, language).title}
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
          <p className="commentary">{localizedCommentary}</p>
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
            {match.referee ? (
              <div>
                <dt>{t.referee}</dt>
                <dd>{match.referee}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t.dataStatus}</dt>
              <dd>{dataStatusLabel}</dd>
            </div>
            <div>
              <dt>{t.qualification}</dt>
              <dd>{matchDisplay.qualification}</dd>
            </div>
          </dl>
          <div className="discipline-list">
            <strong>{t.discipline}</strong>
            {visibleCards.length ? (
              visibleCards.map((event) => (
                <span key={event.id}>
                  {event.minute}' {event.player ?? event.team} - {formatEventDisplay(event, match, language).title}
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
                aria-pressed={index === currentMarketIndex}
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
          <p className="insight-copy">{localizedInsight}</p>
          <div className="insight-metrics">
            <Metric
              label={t.swing}
              value={`${frame.insight.swing > 0 ? "+" : ""}${frame.insight.swing}`}
            />
            <Metric label={t.signal} value={swingSignalLabel} />
            <Metric label={t.events} value={String(frame.insight.eventCount)} />
          </div>
          <p className="small-copy">
            {t.nextBeat}: {nextBeatSummary}
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
                  <strong>{formatEventDisplay(event, match, language).title}</strong>
                  <p>{formatEventDisplay(event, match, language).description}</p>
                </div>
              </li>
            ))}
          </ol>
          {nextEvent ? (
            <p className="next-event">
              {t.nextBeat}: {nextEvent.minute}' {nextEventDisplay?.title}
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
    return {
      label: source.label || t.sourceLiveReady,
      message: source.message || t.sourceLiveReadyMessage,
    };
  }

  if (source.kind === "needs-token") {
    return {
      label: t.sourceNeedsToken,
      message: t.sourceNeedsTokenMessage,
    };
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

  if (language === "fr") {
    return [
      "Live signifie uniquement des données chargées depuis TxLINE avec token et endpoints configurés.",
      "Delay signifie un flux proche du live, sans garantie de temps réel.",
      "Replay signifie des données historiques fixes pour l'évaluation et la vidéo demo.",
      "Seed signifie du contexte statique comme équipes, joueurs, arbitres et classements.",
    ];
  }

  if (language === "de") {
    return [
      "Live bedeutet nur Daten aus TxLINE mit konfiguriertem Token und Endpoints.",
      "Delay bedeutet live-ähnliche Daten ohne Echtzeitgarantie.",
      "Replay bedeutet feste historische Daten für Bewertung und Demo-Video.",
      "Seed bedeutet statischer Kontext wie Teams, Spieler, Schiedsrichter und Tabellen.",
    ];
  }

  if (language === "ja") {
    return [
      "Live は TxLINE の認証済み endpoint から読み込んだデータだけを指します。",
      "Delay はリアルタイム保証のない live 風データを指します。",
      "Replay は審査とデモ動画用の固定履歴データです。",
      "Seed はチーム、選手、審判、順位などの静的コンテキストです。",
    ];
  }

  if (language === "ar") {
    return [
      "Live يعني فقط بيانات محملة من TxLINE بعد ضبط الرمز والواجهات.",
      "Delay يعني بيانات قريبة من المباشر دون ضمان لحظي.",
      "Replay يعني بيانات تاريخية ثابتة للتقييم وفيديو العرض.",
      "Seed يعني سياقاً ثابتاً مثل الفرق واللاعبين والحكام والجداول.",
    ];
  }

  return dataConsistencyState.rules;
}

function getTodayCardDisplay(
  item: { id: string; label: string; stage: string },
  language: Language,
) {
  const labels: Partial<Record<Language, Record<string, { label: string; stage: string }>>> = {
    en: {
      "txline-fixture-17588325": {
        label: "Official TxLINE schedule seed",
        stage: "World Cup Group Stage / Activation pending",
      },
      "txline-fixture-17588326": {
        label: "Official TxLINE schedule seed",
        stage: "World Cup Group Stage / Activation pending",
      },
      "calendar-live-status": {
        label: "No public TxLINE live fixture configured",
        stage: "No Match Day / Activation pending",
      },
      "wc-demo-arg-fra": { label: "Replay demo", stage: "Final replay" },
      "wc-demo-jpn-ger": { label: "Upset replay demo", stage: "Group stage replay" },
    },
    zh: {
      "txline-fixture-17588325": {
        label: "官方 TxLINE 赛程种子",
        stage: "世界杯小组赛 / 待激活",
      },
      "txline-fixture-17588326": {
        label: "官方 TxLINE 赛程种子",
        stage: "世界杯小组赛 / 待激活",
      },
      "calendar-live-status": {
        label: "未配置公开 TxLINE 实时赛程",
        stage: "无比赛日 / 待激活",
      },
      "wc-demo-arg-fra": { label: "回放演示", stage: "决赛回放" },
      "wc-demo-jpn-ger": { label: "爆冷回放演示", stage: "小组赛回放" },
    },
    es: {
      "txline-fixture-17588325": {
        label: "Seed de calendario oficial TxLINE",
        stage: "Fase de grupos / Token requerido",
      },
      "txline-fixture-17588326": {
        label: "Seed de calendario oficial TxLINE",
        stage: "Fase de grupos / Token requerido",
      },
      "calendar-live-status": {
        label: "Sin fixture live público TxLINE configurado",
        stage: "Día sin partido / Token requerido",
      },
      "wc-demo-arg-fra": { label: "Demo replay", stage: "Replay de final" },
      "wc-demo-jpn-ger": { label: "Demo replay de sorpresa", stage: "Replay de fase de grupos" },
    },
    pt: {
      "txline-fixture-17588325": {
        label: "Seed de calendario oficial TxLINE",
        stage: "Fase de grupos / Token necessario",
      },
      "txline-fixture-17588326": {
        label: "Seed de calendario oficial TxLINE",
        stage: "Fase de grupos / Token necessario",
      },
      "calendar-live-status": {
        label: "Sem fixture live público TxLINE configurado",
        stage: "Dia sem jogo / Token necessário",
      },
      "wc-demo-arg-fra": { label: "Demo replay", stage: "Replay da final" },
      "wc-demo-jpn-ger": { label: "Demo replay de zebra", stage: "Replay da fase de grupos" },
    },
    fr: {
      "txline-fixture-17588325": {
        label: "Seed calendrier officiel TxLINE",
        stage: "Phase de groupes / Token requis",
      },
      "txline-fixture-17588326": {
        label: "Seed calendrier officiel TxLINE",
        stage: "Phase de groupes / Token requis",
      },
      "calendar-live-status": {
        label: "Aucun match live TxLINE public configuré",
        stage: "Jour sans match / Token requis",
      },
      "wc-demo-arg-fra": { label: "Demo replay", stage: "Replay de finale" },
      "wc-demo-jpn-ger": { label: "Demo replay surprise", stage: "Replay de groupe" },
    },
    de: {
      "txline-fixture-17588325": {
        label: "Offizieller TxLINE-Spielplan-Seed",
        stage: "WM-Gruppenphase / Token erforderlich",
      },
      "txline-fixture-17588326": {
        label: "Offizieller TxLINE-Spielplan-Seed",
        stage: "WM-Gruppenphase / Token erforderlich",
      },
      "calendar-live-status": {
        label: "Kein öffentliches TxLINE-Live-Spiel konfiguriert",
        stage: "Kein Spieltag / Token erforderlich",
      },
      "wc-demo-arg-fra": { label: "Replay-Demo", stage: "Final-Replay" },
      "wc-demo-jpn-ger": { label: "Überraschungs-Replay", stage: "Gruppen-Replay" },
    },
    ja: {
      "txline-fixture-17588325": {
        label: "公式 TxLINE 日程 Seed",
        stage: "ワールドカップ group stage / Token 必要",
      },
      "txline-fixture-17588326": {
        label: "公式 TxLINE 日程 Seed",
        stage: "ワールドカップ group stage / Token 必要",
      },
      "calendar-live-status": {
        label: "公開 TxLINE live fixture 未設定",
        stage: "試合なし / Token 必要",
      },
      "wc-demo-arg-fra": { label: "Replay デモ", stage: "決勝 replay" },
      "wc-demo-jpn-ger": { label: "Upset replay デモ", stage: "グループ replay" },
    },
    ar: {
      "txline-fixture-17588325": {
        label: "Seed رسمي لجدول TxLINE",
        stage: "مرحلة المجموعات / الرمز مطلوب",
      },
      "txline-fixture-17588326": {
        label: "Seed رسمي لجدول TxLINE",
        stage: "مرحلة المجموعات / الرمز مطلوب",
      },
      "calendar-live-status": {
        label: "لا توجد مباراة TxLINE مباشرة عامة",
        stage: "يوم بلا مباراة / الرمز مطلوب",
      },
      "wc-demo-arg-fra": { label: "عرض Replay", stage: "Replay النهائي" },
      "wc-demo-jpn-ger": { label: "عرض Upset replay", stage: "Replay المجموعات" },
    },
  };

  return labels[language]?.[item.id] ?? labels.en?.[item.id] ?? { label: item.label, stage: item.stage };
}

function formatEventDisplay(event: MatchEvent, match: MatchData, language: Language) {
  const team = event.team ?? "";
  const player = event.player ?? team;
  const score = `${match.home.code} ${event.homeScore}-${event.awayScore} ${match.away.code}`;
  const pulse = `${event.marketPulse}/100`;

  const copyByLanguage: Record<Language, Record<MatchEvent["type"], { title: string; description: string }>> = {
    en: {
      kickoff: { title: "Kickoff", description: `The replay starts from verified source data. Pulse ${pulse}.` },
      goal: { title: `Goal ${team}`, description: `${player} changes the score to ${score}. Pulse ${pulse}.` },
      yellow_card: { title: "Yellow card", description: `Discipline changes the rhythm. Score ${score}.` },
      red_card: { title: "Red card", description: `A red card changes match risk immediately. Score ${score}.` },
      score_update: { title: "Score update", description: `The scoreboard is now ${score}.` },
      substitution: { title: "Substitution", description: `Fresh legs change the next phase. Score ${score}.` },
      odds_shift: { title: "Market mood shift", description: `Market mood moves to ${pulse} before the scoreboard changes.` },
      halftime: { title: "Halftime", description: `Halftime snapshot: ${score}.` },
      fulltime: { title: "Full time", description: `Replay complete with score, events, and safety boundary intact. ${score}.` },
    },
    zh: {
      kickoff: { title: "开球", description: `回放从已核验的数据状态开始。脉冲 ${pulse}。` },
      goal: { title: `${team} 进球`, description: `${player} 改写比分为 ${score}。脉冲 ${pulse}。` },
      yellow_card: { title: "黄牌", description: `纪律事件改变比赛节奏。比分 ${score}。` },
      red_card: { title: "红牌", description: `红牌立刻改变比赛风险。比分 ${score}。` },
      score_update: { title: "比分更新", description: `当前比分为 ${score}。` },
      substitution: { title: "换人", description: `新鲜力量进入，下一阶段节奏可能变化。比分 ${score}。` },
      odds_shift: { title: "市场情绪变化", description: `比分变化前，市场情绪移动到 ${pulse}。` },
      halftime: { title: "半场", description: `半场快照：${score}。` },
      fulltime: { title: "全场结束", description: `回放完成，比分、事件和安全边界都保持清楚。${score}。` },
    },
    es: {
      kickoff: { title: "Inicio", description: `El replay empieza desde datos verificados. Pulso ${pulse}.` },
      goal: { title: `Gol ${team}`, description: `${player} cambia el marcador a ${score}. Pulso ${pulse}.` },
      yellow_card: { title: "Tarjeta amarilla", description: `La disciplina cambia el ritmo. Marcador ${score}.` },
      red_card: { title: "Tarjeta roja", description: `La roja cambia el riesgo del partido. Marcador ${score}.` },
      score_update: { title: "Marcador actualizado", description: `El marcador ahora es ${score}.` },
      substitution: { title: "Cambio", description: `Piernas frescas cambian la siguiente fase. Marcador ${score}.` },
      odds_shift: { title: "Cambio de ánimo", description: `El ánimo de mercado llega a ${pulse} antes del cambio en el marcador.` },
      halftime: { title: "Descanso", description: `Foto del descanso: ${score}.` },
      fulltime: { title: "Final", description: `Replay completo con marcador, eventos y límites de seguridad claros. ${score}.` },
    },
    pt: {
      kickoff: { title: "Início", description: `O replay começa com dados verificados. Pulso ${pulse}.` },
      goal: { title: `Gol ${team}`, description: `${player} muda o placar para ${score}. Pulso ${pulse}.` },
      yellow_card: { title: "Cartão amarelo", description: `A disciplina muda o ritmo. Placar ${score}.` },
      red_card: { title: "Cartão vermelho", description: `O vermelho muda o risco do jogo. Placar ${score}.` },
      score_update: { title: "Placar atualizado", description: `O placar agora é ${score}.` },
      substitution: { title: "Substituição", description: `Novas pernas mudam a próxima fase. Placar ${score}.` },
      odds_shift: { title: "Mudança de humor", description: `O humor de mercado chega a ${pulse} antes do placar mudar.` },
      halftime: { title: "Intervalo", description: `Retrato do intervalo: ${score}.` },
      fulltime: { title: "Fim de jogo", description: `Replay completo com placar, eventos e segurança claros. ${score}.` },
    },
    fr: {
      kickoff: { title: "Coup d'envoi", description: `Le replay commence depuis des données vérifiées. Pulse ${pulse}.` },
      goal: { title: `But ${team}`, description: `${player} change le score à ${score}. Pulse ${pulse}.` },
      yellow_card: { title: "Carton jaune", description: `La discipline change le rythme. Score ${score}.` },
      red_card: { title: "Carton rouge", description: `Le rouge change immédiatement le risque. Score ${score}.` },
      score_update: { title: "Score mis à jour", description: `Le score est maintenant ${score}.` },
      substitution: { title: "Remplacement", description: `Des jambes fraîches changent la phase suivante. Score ${score}.` },
      odds_shift: { title: "Humeur du marché", description: `L'humeur du marché monte à ${pulse} avant le score.` },
      halftime: { title: "Mi-temps", description: `Instant mi-temps : ${score}.` },
      fulltime: { title: "Fin du match", description: `Replay complet avec score, événements et limite de sécurité. ${score}.` },
    },
    de: {
      kickoff: { title: "Anpfiff", description: `Das Replay startet aus geprüften Daten. Puls ${pulse}.` },
      goal: { title: `Tor ${team}`, description: `${player} stellt auf ${score}. Puls ${pulse}.` },
      yellow_card: { title: "Gelbe Karte", description: `Disziplin verändert den Rhythmus. Stand ${score}.` },
      red_card: { title: "Rote Karte", description: `Rot verändert sofort das Spielrisiko. Stand ${score}.` },
      score_update: { title: "Spielstand", description: `Der Spielstand ist jetzt ${score}.` },
      substitution: { title: "Wechsel", description: `Frische Kräfte verändern die nächste Phase. Stand ${score}.` },
      odds_shift: { title: "Marktstimmung", description: `Die Marktstimmung bewegt sich auf ${pulse}, bevor der Stand kippt.` },
      halftime: { title: "Halbzeit", description: `Halbzeitbild: ${score}.` },
      fulltime: { title: "Abpfiff", description: `Replay komplett mit Stand, Ereignissen und Sicherheitsgrenze. ${score}.` },
    },
    ja: {
      kickoff: { title: "キックオフ", description: `検証済みデータからリプレイ開始。パルス ${pulse}。` },
      goal: { title: `${team} ゴール`, description: `${player} がスコアを ${score} に変更。パルス ${pulse}。` },
      yellow_card: { title: "イエローカード", description: `カードで試合のリズムが変化。スコア ${score}。` },
      red_card: { title: "レッドカード", description: `退場で試合リスクが一気に変化。スコア ${score}。` },
      score_update: { title: "スコア更新", description: `現在のスコアは ${score}。` },
      substitution: { title: "交代", description: `新しい選手が次の流れを変える。スコア ${score}。` },
      odds_shift: { title: "市場ムード変化", description: `スコア変化前に市場ムードが ${pulse} へ移動。` },
      halftime: { title: "ハーフタイム", description: `前半終了時点：${score}。` },
      fulltime: { title: "試合終了", description: `スコア、イベント、安全境界を保ったままリプレイ完了。${score}。` },
    },
    ar: {
      kickoff: { title: "البداية", description: `يبدأ replay من بيانات موثقة. النبض ${pulse}.` },
      goal: { title: `هدف ${team}`, description: `${player} يغير النتيجة إلى ${score}. النبض ${pulse}.` },
      yellow_card: { title: "بطاقة صفراء", description: `الانضباط يغير الإيقاع. النتيجة ${score}.` },
      red_card: { title: "بطاقة حمراء", description: `البطاقة الحمراء تغير خطر المباراة فوراً. النتيجة ${score}.` },
      score_update: { title: "تحديث النتيجة", description: `النتيجة الآن ${score}.` },
      substitution: { title: "تبديل", description: `لاعبون جدد يغيرون المرحلة التالية. النتيجة ${score}.` },
      odds_shift: { title: "تغير مزاج السوق", description: `مزاج السوق يصل إلى ${pulse} قبل تغير النتيجة.` },
      halftime: { title: "نهاية الشوط", description: `لقطة الشوط: ${score}.` },
      fulltime: { title: "النهاية", description: `اكتمل replay مع نتيجة وأحداث وحدود أمان واضحة. ${score}.` },
    },
  };

  return copyByLanguage[language][event.type];
}

function buildLocalizedCommentary(
  match: MatchData,
  frame: ReturnType<typeof buildPulseFrame>,
  language: Language,
) {
  if (!frame.latestEvent) {
    const waiting: Record<Language, string> = {
      en: `${match.home.code} and ${match.away.code} are waiting for the first pulse moment.`,
      zh: `${match.home.code} 与 ${match.away.code} 正在等待第一个脉冲节点。`,
      es: `${match.home.code} y ${match.away.code} esperan el primer momento de pulso.`,
      pt: `${match.home.code} e ${match.away.code} aguardam o primeiro momento de pulso.`,
      fr: `${match.home.code} et ${match.away.code} attendent le premier moment fort.`,
      de: `${match.home.code} und ${match.away.code} warten auf den ersten Puls-Moment.`,
      ja: `${match.home.code} と ${match.away.code} は最初のパルスを待っています。`,
      ar: `${match.home.code} و ${match.away.code} ينتظران أول لحظة نبض.`,
    };
    return waiting[language];
  }

  return formatEventDisplay(frame.latestEvent, match, language).description;
}

function buildLocalizedInsight(
  match: MatchData,
  frame: ReturnType<typeof buildPulseFrame>,
  language: Language,
) {
  const leader =
    frame.homeScore === frame.awayScore
      ? null
      : frame.homeScore > frame.awayScore
        ? match.home.code
        : match.away.code;
  const pulse = `${frame.market.sentiment}/100`;

  if (!frame.latestEvent) {
    const waiting: Record<Language, string> = {
      en: "The match is waiting for its first meaningful pulse.",
      zh: "比赛正在等待第一个真正有意义的脉冲节点。",
      es: "El partido espera su primer pulso importante.",
      pt: "O jogo espera seu primeiro pulso importante.",
      fr: "Le match attend son premier vrai signal.",
      de: "Das Spiel wartet auf den ersten echten Puls.",
      ja: "試合は最初の重要なパルスを待っています。",
      ar: "المباراة تنتظر أول نبض مهم.",
    };
    return waiting[language];
  }

  if (frame.latestEvent.type === "goal" && leader) {
    const text: Record<Language, string> = {
      en: `${leader} controls the emotional center right now.`,
      zh: `${leader} 现在掌握比赛情绪中心。`,
      es: `${leader} controla ahora el centro emocional.`,
      pt: `${leader} controla agora o centro emocional.`,
      fr: `${leader} contrôle maintenant le centre émotionnel.`,
      de: `${leader} kontrolliert gerade das emotionale Zentrum.`,
      ja: `${leader} が今の感情の中心を握っています。`,
      ar: `${leader} يسيطر الآن على مركز الشعور في المباراة.`,
    };
    return text[language];
  }

  if (frame.latestEvent.type === "goal") {
    const text: Record<Language, string> = {
      en: "The score is level, but the energy has reset.",
      zh: "比分回到均势，但现场能量已经重置。",
      es: "El marcador está igualado, pero la energía se reinicia.",
      pt: "O placar está empatado, mas a energia reiniciou.",
      fr: "Le score est à égalité, mais l'énergie est relancée.",
      de: "Der Stand ist ausgeglichen, aber die Energie ist neu gesetzt.",
      ja: "スコアは並びましたが、流れはリセットされました。",
      ar: "النتيجة متعادلة، لكن طاقة المباراة أعيد ضبطها.",
    };
    return text[language];
  }

  const text: Record<Language, string> = {
    en: `Pulse is ${pulse}; the next useful signal is the event stream, not a betting action.`,
    zh: `当前脉冲 ${pulse}；下一步看事件流，而不是下注动作。`,
    es: `El pulso está en ${pulse}; la señal útil está en los eventos, no en una apuesta.`,
    pt: `O pulso está em ${pulse}; o sinal útil está nos eventos, não em aposta.`,
    fr: `Le pulse est à ${pulse}; le signal utile vient des événements, pas d'un pari.`,
    de: `Der Puls liegt bei ${pulse}; das Nutzsignal ist der Ereignisstrom, keine Wette.`,
    ja: `パルスは ${pulse}。見るべきなのはイベントで、賭けではありません。`,
    ar: `النبض ${pulse}؛ الإشارة المفيدة هي الأحداث، لا المراهنة.`,
  };
  return text[language];
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

function buildPhaseSummary(
  minute: number,
  match: MatchData,
  labels: CopyText,
  display: MatchDisplayText,
  homeTeamName: string,
  awayTeamName: string,
) {
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
      headline: `${labels.currentRead}: ${display.stage}`,
      body: labels.secondHalfSummary,
    };
  }

  if (minute > 1) {
    return {
      phase: labels.firstHalf,
      headline: `${labels.currentRead}: ${homeTeamName} vs ${awayTeamName}`,
      body: labels.firstHalfSummary,
    };
  }

  return {
    phase: labels.preMatch,
    headline: `${homeTeamName} vs ${awayTeamName}`,
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
  const dateLocales: Record<Language, string> = {
    ar: "ar-JO",
    de: "de-DE",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    ja: "ja-JP",
    pt: "pt-BR",
    zh: "zh-CN",
  };

  return dateLocales[language];
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
