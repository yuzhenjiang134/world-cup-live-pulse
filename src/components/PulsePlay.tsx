import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { MatchData, MatchEvent, PulseFrame } from "../types";

export type PulsePlayText = {
  title: string;
  liveMoment: string;
  ready: string;
  penalty: string;
  extraTime: string;
  cheer: string;
  localCheers: string;
  localOnly: string;
  liveSync: string;
  delayedSync: string;
  scheduledSync: string;
  replaySync: string;
  illustrative: string;
  onPitch: string;
  confirmedMoment: string;
  matchStory: string;
};

export type PulseStoryEvent = {
  id: string;
  at: number;
  minute: string;
  label: string;
  team?: string;
  score: string;
};

type PulsePlayProps = {
  match: MatchData;
  frame: PulseFrame;
  latestEvent?: MatchEvent;
  minute: number;
  isFinal: boolean;
  homeName: string;
  awayName: string;
  momentLabel: string;
  momentDescription: string;
  storyEvents: PulseStoryEvent[];
  text: PulsePlayText;
  onSelectStory?: (minute: number) => void;
};

type CheerState = { home: number; away: number };

const miniSquad = [
  { x: 7, y: 50, role: "keeper" },
  { x: 17, y: 14, role: "defender" },
  { x: 19, y: 38, role: "defender" },
  { x: 19, y: 62, role: "defender" },
  { x: 17, y: 86, role: "defender" },
  { x: 30, y: 24, role: "midfielder" },
  { x: 32, y: 50, role: "midfielder" },
  { x: 30, y: 76, role: "midfielder" },
  { x: 42, y: 25, role: "forward" },
  { x: 45, y: 50, role: "forward" },
  { x: 42, y: 75, role: "forward" },
] as const;

function readCheers(matchId: string): CheerState {
  if (typeof window === "undefined") return { home: 0, away: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`wclp-cheers-${matchId}`) ?? "null") as Partial<CheerState> | null;
    return { home: Math.max(0, Math.round(parsed?.home ?? 0)), away: Math.max(0, Math.round(parsed?.away ?? 0)) };
  } catch {
    return { home: 0, away: 0 };
  }
}

export function PulsePlay({ match, frame, latestEvent, minute, isFinal, homeName, awayName, momentLabel, momentDescription, storyEvents, text, onSelectStory }: PulsePlayProps) {
  const [cheers, setCheers] = useState<CheerState>(() => readCheers(match.id));
  const eventType = latestEvent?.type ?? (match.status === "scheduled" ? "scheduled" : "kickoff");
  const attackingHome = latestEvent?.team ? latestEvent.team === match.home.code : minute % 2 === 0;
  const eventMinute = latestEvent?.minute ?? minute;
  const horizontalProgress = Math.max(18, Math.min(82, 24 + ((eventMinute * 7) % 58)));
  const ballX = latestEvent?.type === "goal" ? (attackingHome ? 91 : 9) : attackingHome ? horizontalProgress : 100 - horizontalProgress;
  const ballY = 35 + ((eventMinute * 11) % 30);
  const card = latestEvent?.type === "yellow_card" ? "yellow" : latestEvent?.type === "red_card" ? "red" : null;
  const isPenalty = Boolean(latestEvent?.penalty);
  const isExtraTime = eventMinute > 90 || Boolean(latestEvent?.stoppage);
  const eventTeamSide = latestEvent?.team === match.home.code ? "home" : latestEvent?.team === match.away.code ? "away" : null;
  const eventPlayer = readablePlayerName(latestEvent?.player);
  const eventFigureIndex = figureIndexForEvent(latestEvent);
  const goalSupportIndexes = eventType === "goal" && eventFigureIndex >= 0
    ? [(eventFigureIndex + 1) % miniSquad.length, (eventFigureIndex + 2) % miniSquad.length]
    : [];
  const visibleEvents = match.events.filter((event) => event.minute <= minute);
  const sentOff = {
    home: sentOffIndexes(visibleEvents, match.home.code),
    away: sentOffIndexes(visibleEvents, match.away.code),
  };
  const onPitch = {
    home: Math.max(7, miniSquad.length - sentOff.home.size),
    away: Math.max(7, miniSquad.length - sentOff.away.size),
  };
  const syncMode = match.dataStatus === "Replay" ? "replay" : match.status === "scheduled" ? "scheduled" : match.dataStatus === "Delay" ? "delayed" : "live";
  const syncLabel = syncMode === "replay" ? text.replaySync : syncMode === "scheduled" ? text.scheduledSync : syncMode === "delayed" ? text.delayedSync : text.liveSync;

  useEffect(() => {
    try {
      window.localStorage.setItem(`wclp-cheers-${match.id}`, JSON.stringify(cheers));
    } catch {
      // The interaction remains usable when browser storage is unavailable.
    }
  }, [cheers, match.id]);

  const addCheer = (side: keyof CheerState) => {
    setCheers((current) => ({ ...current, [side]: Math.min(999, current[side] + 1) }));
  };

  return (
    <section className={`pulse-play pulse-play-${eventType} ${isPenalty ? "is-penalty" : ""} ${isExtraTime ? "is-extra-time" : ""}`} aria-label={text.title}>
      <header className="pulse-play-scoreboard">
        <span><small>{homeName}</small><b>{match.home.code}</b><strong>{frame.homeScore}</strong><em>{onPitch.home} {text.onPitch}</em></span>
        <div><small>{isFinal ? "FT" : `${Math.max(1, minute)}'`}</small><b>{text.title}</b></div>
        <span><em>{onPitch.away} {text.onPitch}</em><strong>{frame.awayScore}</strong><b>{match.away.code}</b><small>{awayName}</small></span>
      </header>
      <div className="pulse-pitch" style={{ "--ball-x": `${ballX}%`, "--ball-y": `${ballY}%`, "--trail-left": `${attackingHome ? Math.min(82, ballX - 8) : ballX}%`, "--trail-width": `${Math.max(7, Math.abs(ballX - (attackingHome ? 82 : 18)))}%` } as CSSProperties}>
        <div className="pitch-halfway" aria-hidden="true" />
        <div className="pitch-circle" aria-hidden="true" />
        <div className="pitch-box pitch-box-home" aria-hidden="true" />
        <div className="pitch-box pitch-box-away" aria-hidden="true" />
        {miniSquad.map((player, index) => <MatchFigure key={`home-${index}`} side="home" index={index} player={player} attacking={attackingHome} eventType={eventType} eventMinute={eventMinute} ballY={ballY} active={eventTeamSide === "home" && eventFigureIndex === index} supportRank={eventTeamSide === "home" ? goalSupportIndexes.indexOf(index) : -1} sentOff={sentOff.home.has(index)} concedingGoalkeeper={eventType === "goal" && eventTeamSide === "away" && player.role === "keeper"} />)}
        {miniSquad.map((player, index) => <MatchFigure key={`away-${index}`} side="away" index={index} player={player} attacking={!attackingHome} eventType={eventType} eventMinute={eventMinute} ballY={ballY} active={eventTeamSide === "away" && eventFigureIndex === index} supportRank={eventTeamSide === "away" ? goalSupportIndexes.indexOf(index) : -1} sentOff={sentOff.away.has(index)} concedingGoalkeeper={eventType === "goal" && eventTeamSide === "home" && player.role === "keeper"} />)}
        {eventType === "goal" ? <><span className="pulse-ball-trail" aria-hidden="true" /><span className={`pulse-goal-wave ${attackingHome ? "away" : "home"}`} aria-hidden="true" /></> : null}
        <span className="pulse-ball" aria-hidden="true" />
        {card ? <><span className="pulse-referee" aria-hidden="true"><i /><b /></span><span className={`pulse-card ${card}`} aria-hidden="true" /></> : null}
        {eventType === "substitution" ? <span className="pulse-substitution-board" aria-hidden="true">↕</span> : null}
        {isPenalty ? <span className="pulse-penalty-badge">{text.penalty}</span> : null}
        {isExtraTime ? <span className="pulse-extra-badge">{text.extraTime}</span> : null}
        <span className={`pulse-sync-badge ${syncMode}`}>{syncLabel}</span>
        {eventPlayer ? <span className={`pulse-event-actor ${eventTeamSide ?? "neutral"}`}><small>{text.confirmedMoment}</small><strong>{eventPlayer}</strong></span> : null}
      </div>
      <p className="pulse-play-disclaimer">{text.illustrative}</p>
      {storyEvents.length ? <div className="pulse-match-story"><strong>{text.matchStory}</strong><div>{storyEvents.map((event) => {
        const content = <><time>{event.minute}</time><b>{event.label}</b><small>{event.team ? `${event.team} · ` : ""}{event.score}</small></>;
        return onSelectStory ? <button type="button" key={event.id} data-minute={event.at} onClick={() => onSelectStory(event.at)}>{content}</button> : <span key={event.id}>{content}</span>;
      })}</div></div> : null}
      <footer className="pulse-play-footer">
        <div className="pulse-moment" aria-live="polite">
          <span>{text.liveMoment}</span>
          <strong>{momentLabel || text.ready}</strong>
          {momentDescription ? <small>{momentDescription}</small> : null}
        </div>
        <div className="cheer-controls" aria-label={text.localCheers}>
          <button type="button" onClick={() => addCheer("home")} aria-label={`${text.cheer} ${homeName}`}><span>{match.home.code}</span><b>+{cheers.home}</b></button>
          <button type="button" onClick={() => addCheer("away")} aria-label={`${text.cheer} ${awayName}`}><span>{match.away.code}</span><b>+{cheers.away}</b></button>
          <small>{text.localOnly}</small>
        </div>
      </footer>
    </section>
  );
}

type MiniSquadPlayer = (typeof miniSquad)[number];

function MatchFigure({ side, index, player, attacking, eventType, eventMinute, ballY, active, supportRank, sentOff, concedingGoalkeeper }: { side: "home" | "away"; index: number; player: MiniSquadPlayer; attacking: boolean; eventType: string; eventMinute: number; ballY: number; active: boolean; supportRank: number; sentOff: boolean; concedingGoalkeeper: boolean }) {
  const direction = side === "home" ? 1 : -1;
  const baseX = side === "home" ? player.x : 100 - player.x;
  const attackShift = attacking ? (player.role === "keeper" ? 1.5 : player.role === "defender" ? 3 : 6) : -1;
  const eventShift = eventType === "goal" && active ? 5 : eventType === "red_card" && active ? -2 : 0;
  const laneMotion = player.role === "keeper" ? 0 : ((eventMinute + index * 5) % 5) - 2;
  const activeX = eventType === "goal" ? (side === "home" ? 82 : 18)
    : eventType === "yellow_card" || eventType === "red_card" ? 50 + direction * 3
      : eventType === "substitution" ? (side === "home" ? 8 : 92)
        : baseX + direction * (attackShift + eventShift);
  const activeY = eventType === "goal" ? ballY : eventType === "yellow_card" || eventType === "red_card" ? 50 : player.y;
  const supportX = side === "home" ? 73 - supportRank * 4 : 27 + supportRank * 4;
  const supportY = Math.max(14, Math.min(86, ballY + (supportRank === 0 ? -13 : 14)));
  const style = {
    "--figure-x": `${supportRank >= 0 ? supportX : active ? activeX : baseX + direction * (attackShift + eventShift)}%`,
    "--figure-y": `${supportRank >= 0 ? supportY : active ? activeY : Math.max(10, Math.min(90, player.y + laneMotion))}%`,
    "--figure-delay": `${index * 45}ms`,
  } as CSSProperties;
  const eventMark = active ? eventSymbol(eventType) : "";
  const beingSentOff = sentOff && active && eventType === "red_card";
  const classes = ["pulse-player", side, player.role, attacking ? "attacking" : "", active ? "event-player" : "", supportRank >= 0 ? "supporting-event" : "", eventType === "goal" && active ? "celebrating" : "", concedingGoalkeeper ? "goalkeeper-dive" : "", eventType === "substitution" && active ? "substituting" : "", beingSentOff ? "being-sent-off" : "", sentOff && !beingSentOff ? "sent-off" : ""].filter(Boolean).join(" ");

  return <span className={classes} style={style} aria-hidden="true"><i className="figure-head" /><i className="figure-arms" /><i className="figure-body">{index + 1}</i><i className="figure-legs" />{eventMark ? <b className={`figure-event figure-event-${eventType}`}>{eventMark}</b> : null}</span>;
}

function readablePlayerName(candidate?: string) {
  if (!candidate) return undefined;
  const normalized = candidate.trim();
  if (!normalized || /^#?\d+$/.test(normalized) || /^player\s*#?\d+$/i.test(normalized)) return undefined;
  return normalized;
}

function figureIndexForEvent(event?: MatchEvent) {
  if (!event) return -1;
  const seed = readablePlayerName(event.player) ?? `${event.team ?? "neutral"}-${event.minute}-${event.type}`;
  return stableHash(seed) % miniSquad.length;
}

function sentOffIndexes(events: MatchEvent[], teamCode: string) {
  const indexes = new Set<number>();
  for (const event of events) {
    if (event.type !== "red_card" || event.team !== teamCode) continue;
    let candidate = figureIndexForEvent(event);
    while (indexes.has(candidate)) candidate = (candidate + 1) % miniSquad.length;
    indexes.add(candidate);
  }
  return indexes;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function eventSymbol(eventType: string) {
  if (eventType === "goal") return "G";
  if (eventType === "yellow_card") return "Y";
  if (eventType === "red_card") return "R";
  if (eventType === "substitution") return "S";
  return "";
}
