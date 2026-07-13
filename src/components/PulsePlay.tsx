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
  text: PulsePlayText;
};

type CheerState = { home: number; away: number };

function readCheers(matchId: string): CheerState {
  if (typeof window === "undefined") return { home: 0, away: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`wclp-cheers-${matchId}`) ?? "null") as Partial<CheerState> | null;
    return { home: Math.max(0, Math.round(parsed?.home ?? 0)), away: Math.max(0, Math.round(parsed?.away ?? 0)) };
  } catch {
    return { home: 0, away: 0 };
  }
}

export function PulsePlay({ match, frame, latestEvent, minute, isFinal, homeName, awayName, momentLabel, momentDescription, text }: PulsePlayProps) {
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

  useEffect(() => {
    window.localStorage.setItem(`wclp-cheers-${match.id}`, JSON.stringify(cheers));
  }, [cheers, match.id]);

  const addCheer = (side: keyof CheerState) => {
    setCheers((current) => ({ ...current, [side]: Math.min(999, current[side] + 1) }));
  };

  return (
    <section className={`pulse-play pulse-play-${eventType} ${isPenalty ? "is-penalty" : ""} ${isExtraTime ? "is-extra-time" : ""}`} aria-label={text.title}>
      <header className="pulse-play-scoreboard">
        <span><b>{match.home.code}</b><strong>{frame.homeScore}</strong></span>
        <div><small>{isFinal ? "FT" : `${Math.max(1, minute)}'`}</small><b>{text.title}</b></div>
        <span><strong>{frame.awayScore}</strong><b>{match.away.code}</b></span>
      </header>
      <div className="pulse-pitch" style={{ "--ball-x": `${ballX}%`, "--ball-y": `${ballY}%` } as CSSProperties}>
        <div className="pitch-halfway" aria-hidden="true" />
        <div className="pitch-circle" aria-hidden="true" />
        <div className="pitch-box pitch-box-home" aria-hidden="true" />
        <div className="pitch-box pitch-box-away" aria-hidden="true" />
        {[0, 1, 2].map((index) => <span className={`pulse-player home player-${index + 1} ${attackingHome ? "attacking" : ""}`} key={`home-${index}`} aria-hidden="true">{match.home.code.slice(0, 1)}</span>)}
        {[0, 1, 2].map((index) => <span className={`pulse-player away player-${index + 1} ${!attackingHome ? "attacking" : ""}`} key={`away-${index}`} aria-hidden="true">{match.away.code.slice(0, 1)}</span>)}
        <span className="pulse-ball" aria-hidden="true" />
        {card ? <span className={`pulse-card ${card}`} aria-hidden="true" /> : null}
        {isPenalty ? <span className="pulse-penalty-badge">{text.penalty}</span> : null}
        {isExtraTime ? <span className="pulse-extra-badge">{text.extraTime}</span> : null}
      </div>
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
