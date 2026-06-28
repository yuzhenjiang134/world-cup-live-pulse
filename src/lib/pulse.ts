import type { MarketSnapshot, MatchData, PulseFrame } from "../types";

const fallbackMarket: MarketSnapshot = {
  minute: 1,
  homeWin: 2.0,
  draw: 3.0,
  awayWin: 3.8,
  sentiment: 50,
};

export function buildPulseFrame(match: MatchData, minute: number): PulseFrame {
  const activeEvents = match.events.filter((event) => event.minute <= minute);
  const latestEvent = activeEvents.at(-1);
  const market = [...match.market]
    .reverse()
    .find((snapshot) => snapshot.minute <= minute) ?? fallbackMarket;
  const homeScore = latestEvent?.homeScore ?? 0;
  const awayScore = latestEvent?.awayScore ?? 0;
  const homePressure = Math.max(8, Math.min(88, market.sentiment));
  const awayPressure = Math.max(8, Math.min(88, 100 - market.sentiment));
  const neutral = Math.max(6, 100 - Math.abs(homePressure - awayPressure) - 36);
  const previousMarket = [...match.market]
    .reverse()
    .find((snapshot) => snapshot.minute < market.minute);
  const swing = previousMarket ? market.sentiment - previousMarket.sentiment : 0;
  const nextEvent = match.events.find((event) => event.minute > minute);

  return {
    minute,
    homeScore,
    awayScore,
    activeEvents,
    latestEvent,
    market,
    commentary: createCommentary(match, minute, homeScore, awayScore, market, latestEvent),
    insight: {
      headline: createInsightHeadline(match, homeScore, awayScore, market.sentiment, latestEvent),
      swing,
      swingLabel: createSwingLabel(swing),
      eventCount: activeEvents.length,
      nextBeat: nextEvent ? `${nextEvent.minute}' ${nextEvent.title}` : "Replay loop ready",
    },
    pressure: {
      home: homePressure,
      away: awayPressure,
      neutral,
    },
  };
}

function createCommentary(
  match: MatchData,
  minute: number,
  homeScore: number,
  awayScore: number,
  market: MarketSnapshot,
  latestEvent?: PulseFrame["latestEvent"],
) {
  if (!latestEvent) {
    return `${match.home.name} and ${match.away.name} are warming up the pulse before kickoff.`;
  }

  if (latestEvent.type === "goal") {
    const lead =
      homeScore === awayScore
        ? "the match is level again"
        : homeScore > awayScore
          ? `${match.home.name} lead by ${homeScore - awayScore}`
          : `${match.away.name} lead by ${awayScore - homeScore}`;
    return `${latestEvent.player ?? "A finisher"} changes the whole mood at ${minute}', and ${lead}.`;
  }

  if (latestEvent.type === "odds_shift") {
    return `Market sentiment is at ${market.sentiment}/100, showing the crowd pulse moving before the scoreboard changes.`;
  }

  if (latestEvent.type === "halftime") {
    return `Halftime snapshot: ${match.home.code} ${homeScore}-${awayScore} ${match.away.code}, with the next swing likely to define the replay.`;
  }

  if (latestEvent.type === "fulltime") {
    return `Replay window complete: the dashboard captured score, events, and market mood without betting or trading advice.`;
  }

  return `${latestEvent.title}: ${latestEvent.description}`;
}

function createInsightHeadline(
  match: MatchData,
  homeScore: number,
  awayScore: number,
  sentiment: number,
  latestEvent?: PulseFrame["latestEvent"],
) {
  if (!latestEvent) {
    return "The match is waiting for its first pulse moment.";
  }

  if (latestEvent.type === "goal" && homeScore !== awayScore) {
    const leader = homeScore > awayScore ? match.home.name : match.away.name;
    return `${leader} now controls the emotional center of the match.`;
  }

  if (latestEvent.type === "goal") {
    return "The scoreboard is level, but the crowd energy has completely reset.";
  }

  if (latestEvent.type === "odds_shift") {
    return sentiment >= 60
      ? `${match.home.name} momentum is building before the score changes.`
      : `${match.away.name} pressure is changing how the match feels.`;
  }

  if (latestEvent.type === "halftime") {
    return "Halftime gives the replay a clean before-and-after story.";
  }

  if (latestEvent.type === "fulltime") {
    return "The replay is ready to be shared as a complete fan story.";
  }

  return latestEvent.description;
}

function createSwingLabel(swing: number) {
  const absoluteSwing = Math.abs(swing);

  if (absoluteSwing >= 18) {
    return "Major swing";
  }

  if (absoluteSwing >= 8) {
    return "Clear swing";
  }

  if (absoluteSwing >= 3) {
    return "Subtle movement";
  }

  return "Stable";
}
