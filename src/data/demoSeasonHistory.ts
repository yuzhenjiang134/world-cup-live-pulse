import { settleScorePick } from "../lib/challenge";
import { txlineArchiveMatches } from "./txlineArchive";

const demoPicks: Record<string, [number, number]> = {
  "txline-archive-18188721": [0, 1],
  "txline-archive-18187298": [1, 1],
  "txline-archive-18192996": [1, 2],
  "txline-archive-18198205": [1, 1],
  "txline-archive-18193785": [0, 2],
  "txline-archive-18202701": [2, 1],
  "txline-archive-18202783": [0, 0],
  "txline-archive-18209181": [2, 0],
  "txline-archive-18237038": [1, 2],
  "txline-archive-18241006": [1, 2],
};

export const demoSeasonHistory = txlineArchiveMatches.map((match) => {
  const finalEvent = [...match.events].reverse().find((event) => event.type === "fulltime") ?? match.events.at(-1);
  const [homeScore, awayScore] = demoPicks[match.id] ?? [1, 1];
  const finalScore = { homeScore: finalEvent?.homeScore ?? 0, awayScore: finalEvent?.awayScore ?? 0 };
  const result = settleScorePick({ homeScore, awayScore }, finalScore);
  return {
    matchId: match.id,
    kickoffIso: match.kickoffIso,
    homeCode: match.home.code,
    awayCode: match.away.code,
    homeScore,
    awayScore,
    finalHomeScore: finalScore.homeScore,
    finalAwayScore: finalScore.awayScore,
    ...result,
  };
});

export const demoSeasonSummary = demoSeasonHistory.reduce((summary, item) => ({
  played: summary.played + 1,
  correct: summary.correct + (item.correct ? 1 : 0),
  exact: summary.exact + (item.exact ? 1 : 0),
  netPoints: summary.netPoints + item.award - 50,
}), { played: 0, correct: 0, exact: 0, netPoints: 0 });
