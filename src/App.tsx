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
const replaySpeeds = [0.5, 1, 2, 4] as const;

type Language = "en" | "zh" | "es" | "pt";
type PredictionPick = "home" | "draw" | "away";

const languageOptions: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

const displayLanguageOptions: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

const copy = {
  en: {
    appEyebrow: "Superteam Earn x TxODDS / Consumer Fan Experience",
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
    endpointPending: "Waiting for local TxLINE token and access verification",
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
    tokenRequiredShort: "Token required",
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
    sourceNeedsTokenMessage: "等主办方给 API 文档后，再把 token 放到本地环境变量。",
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
    endpointPending: "等待本地 TxLINE token 与权限验证",
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
  waitingForTxline: "等待 TxLINE token",
  sourceReplay: "回放数据已就绪",
  sourceLiveReady: "实时数据已接入",
  sourceNeedsToken: "需要 TxLINE token",
  sourceError: "数据源错误",
  sourceReplayMessage: "回放模式使用固定比赛数据，评委可以随时完整体验。",
  sourceLiveReadyMessage: "实时模式已通过 TxLINE adapter 加载。",
  sourceNeedsTokenMessage: "请只在本地 .env.local 放入 TxLINE token，不要提交到仓库。",
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
  dailyPointThree: "Live 模式已接官方端点，但需要本地 token 才能加载。",
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
  endpointPending: "等待本地 TxLINE token 与权限验证",
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
  tokenRequiredShort: "需要 Token",
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
    endpointPending: "Esperando token local TxLINE y verificación de acceso",
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
    endpointPending: "Aguardando token local TxLINE e verificação de acesso",
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

const trustCopy = {
  en: {
    eyebrow: "Trust & Accuracy",
    title: "Data truth center",
    scheduleSeed: "Official schedule snapshot",
    scheduleValue: "2 seed fixtures",
    scheduleNote:
      "TxLINE World Cup schedule snapshot observed Jordan vs Argentina and Algeria vs Austria for 2026-06-28 UTC.",
    liveGate: "Live gate",
    liveGateValue: "Token required",
    liveGateNote:
      "The app will not show Live until authenticated scores, events, and odds are loaded from TxLINE.",
    replayTruth: "Replay truth",
    replayTruthValue: "Deterministic",
    replayTruthNote:
      "Replay fixtures are fixed historical scenarios for judging and demo recording, never presented as live.",
    freeTier: "Free Tier behavior",
    freeTierValue: "Live or 60s delay",
    freeTierNote:
      "TxLINE docs describe real-time access for unlocked fixtures and a 60-second delay mode for other fixtures.",
    endpointsTitle: "Endpoint coverage",
    endpoint: "Endpoint",
    coverage: "Coverage",
    status: "Status",
    mapped: "Mapped",
    tokenGated: "Token-gated",
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
    liveGateValue: "需要 Token",
    liveGateNote: "只有从 TxLINE 鉴权后的比分、事件、赔率接口加载成功后，页面才会显示 Live。",
    replayTruth: "回放真实性",
    replayTruthValue: "固定可复现",
    replayTruthNote: "Replay 是用于评审和录屏的历史场景，不会伪装成实时比赛。",
    freeTier: "Free Tier 行为",
    freeTierValue: "实时或 60 秒延迟",
    freeTierNote: "TxLINE 文档说明可解锁实时 fixture，其他 fixture 可用 60 秒延迟模式。",
    endpointsTitle: "Endpoint 覆盖",
    endpoint: "Endpoint",
    coverage: "覆盖内容",
    status: "状态",
    mapped: "已映射",
    tokenGated: "Token 锁定",
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
    freeTierValue: "Live o 60s delay",
    freeTierNote:
      "La documentacion TxLINE describe acceso real-time para fixtures desbloqueados y modo 60-second delay para otros.",
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
    freeTierValue: "Live ou 60s delay",
    freeTierNote:
      "A documentacao TxLINE descreve acesso real-time para fixtures liberados e modo 60-second delay para outros.",
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
    liveGateValue: "需要 Token",
    liveGateNote: "只有 TxLINE 鉴权后的比分、事件和赔率接口加载成功后，页面才会显示 Live。",
    replayTruth: "回放真实性",
    replayTruthValue: "固定可复现",
    replayTruthNote: "Replay 是用于评审和录屏的历史场景，不会伪装成实时比赛。",
    freeTier: "Free Tier 行为",
    freeTierValue: "实时或 60 秒延迟",
    freeTierNote: "TxLINE 文档说明可解锁实时 fixture，其它 fixture 可用 60 秒延迟模式。",
    endpointsTitle: "Endpoint 覆盖",
    endpoint: "Endpoint",
    coverage: "覆盖内容",
    status: "状态",
    mapped: "已映射",
    tokenGated: "Token 锁定",
    planned: "计划中",
    evidence: "证据",
    visibleFixtures: "可见赛程",
    source: "来源",
  },
} as const;

type CopyText = (typeof localizedCopy)[Language];
type ViewPresetId = ViewPreset["id"];
type DemoChapter = {
  id: string;
  matchId: string;
  minute: number;
  label: string;
  summary: string;
  focus: string;
};

function detectInitialLanguage(): Language {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }

  return "en";
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
  return language === "zh" ? zhPresetText[preset.id] : preset;
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

export default function App() {
  const [mode, setMode] = useState<MatchMode>("replay");
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

  const t = localizedCopy[language];
  const trust = localizedTrustCopy[language];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.setAttribute("translate", "no");
    document.body.setAttribute("translate", "no");
  }, [language]);

  useEffect(() => {
    setLoadError(null);
    loadMatchData(mode, {
      apiBase: import.meta.env.VITE_TXLINE_API_BASE,
      apiToken: import.meta.env.VITE_TXLINE_API_TOKEN,
      asOfMs: import.meta.env.VITE_TXLINE_AS_OF_MS,
      competitionId: import.meta.env.VITE_TXLINE_COMPETITION_ID,
      fixtureId: import.meta.env.VITE_TXLINE_FIXTURE_ID,
      replayMatchId,
      sessionJwt: import.meta.env.VITE_TXLINE_SESSION_JWT,
      startEpochDay: import.meta.env.VITE_TXLINE_START_EPOCH_DAY,
    })
      .then((result) => {
        setMatch(result.match);
        setSource(result.source);

        if (mode === "live") {
          setMinute(Math.max(1, result.match.events.at(-1)?.minute ?? 1));
        }
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
  const videoEmbedUrl = getSafeVideoEmbedUrl(import.meta.env.VITE_AUTHORIZED_VIDEO_EMBED_URL);
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
    { label: t.endpointStatus, value: trust.tokenGated },
    { label: t.calendarStatus, value: trust.scheduleValue },
    { label: t.fallbackStatus, value: t.replayFallbackReady },
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
      value: nextEvent ? `${nextEvent.minute}' ${nextEvent.title}` : t.replayLoop,
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
  const predictionOptions = [
    {
      id: "home" as const,
      label: match.home.name,
      shortLabel: match.home.code,
      value: frame.market.homeWin,
    },
    {
      id: "draw" as const,
      label: t.draw,
      shortLabel: t.draw,
      value: frame.market.draw,
    },
    {
      id: "away" as const,
      label: match.away.name,
      shortLabel: match.away.code,
      value: frame.market.awayWin,
    },
  ];
  const fanLean = predictionOptions.reduce((leaderOption, option) =>
    option.value > leaderOption.value ? option : leaderOption,
  );
  const scoreDerivedPick = getPredictionPickFromScore(predictedHomeScore, predictedAwayScore);
  const activePredictionPick = predictionPick ?? scoreDerivedPick;
  const selectedPrediction = predictionOptions.find((option) => option.id === activePredictionPick);
  const predictedOutcome =
    predictedHomeScore === predictedAwayScore
      ? t.draw
      : predictedHomeScore > predictedAwayScore
        ? match.home.name
        : match.away.name;
  const recentPulseEvents = frame.activeEvents.slice(-4).reverse();
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
            className="settings-button"
            onClick={() => setSettingsOpen((value) => !value)}
            type="button"
          >
            {settingsOpen ? t.close : t.settings}
          </button>
        </div>
      </header>

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
                      {option.label}
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
          <div className="source-banner-main">
            <strong>{sourceStatus.label}</strong>
            <span>{sourceStatus.message}</span>
          </div>
          <div className="source-freshness" aria-label={t.freshness}>
            <span>{t.freshness}</span>
            <strong>{formatKickoff(dataConsistencyState.checkedAtIso, language)}</strong>
            <small>{t.publicSeedSource}</small>
          </div>
        </section>
      ) : null}

      <section className="matchday-rail" aria-label={t.matchdayHub}>
        <article className="matchday-current">
          <p className="eyebrow">{t.matchdayHub}</p>
          <h2>
            {match.home.name} vs {match.away.name}
          </h2>
          <div className="matchday-current-status">
            <span>{mode === "replay" ? t.nowPlaying : t.waitingForTxline}</span>
            <small>
              {t.checkedAt}: {formatKickoff(dataConsistencyState.checkedAtIso, language)}
            </small>
          </div>
          <p>{t.sourceBoundary}</p>
        </article>
        <div className="matchday-list" aria-label={t.todaysMatches}>
          {matchdayItems.map((item) => {
            const isActiveReplay = item.id === replayMatchId;
            const isAvailable = item.availability === "available";
            const statusLabel = isAvailable ? t.replayAvailable : t.tokenRequiredShort;

            if (!isAvailable) {
              return (
                <article className="matchday-item locked" key={item.id}>
                  <span>{t.officialSeed}</span>
                  <strong>
                    {item.homeCode} vs {item.awayCode}
                  </strong>
                  <small>{formatKickoff(item.kickoffIso, language)}</small>
                  <em>{statusLabel}</em>
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
                <span>{statusLabel}</span>
                <strong>
                  {item.homeCode} vs {item.awayCode}
                </strong>
                <small>{item.stage}</small>
                <em>{isActiveReplay ? t.nowPlaying : t.focusWatch}</em>
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
          <strong>{frame.latestEvent?.title ?? frame.insight.headline}</strong>
          <p>{frame.latestEvent?.description ?? frame.insight.headline}</p>
          <div className="ai-readout">
            <span>{t.aiCommentary}</span>
            <strong>{frame.commentary}</strong>
          </div>
          <div className="watch-now-grid">
            <Metric label={t.clock} value={`${minute}'`} />
            <Metric label={t.nextBeat} value={nextEvent ? `${nextEvent.minute}'` : t.replayLoop} />
            <Metric label={t.pulse} value={`${fanTemperature}/100`} />
          </div>
          <div className="mini-event-feed" aria-label={t.liveFeed}>
            <span>{t.liveFeed}</span>
            {recentPulseEvents.length ? (
              recentPulseEvents.map((event) => (
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
                  <span>{event.title}</span>
                </button>
              ))
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
                <strong>{option.value}%</strong>
              </button>
            ))}
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
                {fanLean.label} {fanLean.value}%
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
            <h2>{match.stage ?? match.competition}</h2>
          </div>
          <p>{match.qualificationNote ?? frame.insight.headline}</p>
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
    return {
      label: source.label || t.sourceLiveReady,
      message: source.message || t.sourceLiveReadyMessage,
    };
  }

  if (source.kind === "needs-token") {
    return {
      label: source.label || t.sourceNeedsToken,
      message: source.message || t.sourceNeedsTokenMessage,
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

  return dataConsistencyState.rules;
}

function getTodayCardDisplay(
  item: { id: string; label: string; stage: string },
  language: Language,
) {
  const labels: Record<Language, Record<string, { label: string; stage: string }>> = {
    en: {
      "txline-fixture-17588325": {
        label: "Official TxLINE schedule seed",
        stage: "World Cup Group Stage / Token Required",
      },
      "txline-fixture-17588326": {
        label: "Official TxLINE schedule seed",
        stage: "World Cup Group Stage / Token Required",
      },
      "calendar-live-status": {
        label: "No public TxLINE live fixture configured",
        stage: "No Match Day / Token Required",
      },
      "wc-demo-arg-fra": { label: "Replay demo", stage: "Final replay" },
      "wc-demo-jpn-ger": { label: "Upset replay demo", stage: "Group stage replay" },
    },
    zh: {
      "txline-fixture-17588325": {
        label: "官方 TxLINE 赛程种子",
        stage: "世界杯小组赛 / 需要 Token",
      },
      "txline-fixture-17588326": {
        label: "官方 TxLINE 赛程种子",
        stage: "世界杯小组赛 / 需要 Token",
      },
      "calendar-live-status": {
        label: "未配置公开 TxLINE 实时赛程",
        stage: "无比赛日 / 需要 Token",
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
