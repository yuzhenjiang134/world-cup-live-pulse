import type { MatchData, MatchMode } from "../types";

export type ChallengeStats = {
  played: number;
  correct: number;
  exact: number;
  streak: number;
  bestStreak: number;
};

export type ScorePickResult = {
  exact: boolean;
  correct: boolean;
  award: number;
};

export type FanLevel = {
  index: number;
  xp: number;
  floor: number;
  ceiling?: number;
  progress: number;
};

const fanLevelThresholds = [0, 200, 500, 900] as const;

export const emptyChallengeStats: ChallengeStats = {
  played: 0,
  correct: 0,
  exact: 0,
  streak: 0,
  bestStreak: 0,
};

export function canLockScorePick(mode: MatchMode, status: MatchData["status"]) {
  return mode === "replay" || status !== "finished";
}

export function canSettleScorePick(locked: boolean, settled: boolean, isFinal: boolean) {
  return locked && !settled && isFinal;
}

export function settleScorePick(
  pick: { homeScore: number; awayScore: number },
  finalScore: { homeScore: number; awayScore: number },
): ScorePickResult {
  const exact = pick.homeScore === finalScore.homeScore && pick.awayScore === finalScore.awayScore;
  const predictedResult = resultSide(pick.homeScore, pick.awayScore);
  const finalResult = resultSide(finalScore.homeScore, finalScore.awayScore);
  const correct = exact || predictedResult === finalResult;
  return { exact, correct, award: exact ? 250 : correct ? 100 : 0 };
}

export function updateChallengeStats(current: ChallengeStats, result: ScorePickResult): ChallengeStats {
  const streak = result.correct ? current.streak + 1 : 0;
  return {
    played: current.played + 1,
    correct: current.correct + (result.correct ? 1 : 0),
    exact: current.exact + (result.exact ? 1 : 0),
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
  };
}

export function getFanLevel(stats: ChallengeStats): FanLevel {
  const xp = stats.played * 25 + stats.correct * 75 + stats.exact * 150;
  let safeIndex = 0;
  fanLevelThresholds.forEach((threshold, index) => {
    if (xp >= threshold) safeIndex = index;
  });
  const floor = fanLevelThresholds[safeIndex];
  const ceiling = fanLevelThresholds[safeIndex + 1];
  const progress = ceiling ? Math.min(100, Math.round(((xp - floor) / (ceiling - floor)) * 100)) : 100;
  return { index: safeIndex, xp, floor, ceiling, progress };
}

function resultSide(homeScore: number, awayScore: number) {
  if (homeScore === awayScore) return "draw";
  return homeScore > awayScore ? "home" : "away";
}
