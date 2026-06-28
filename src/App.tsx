import { useEffect, useMemo, useState } from "react";
import { buildPulseFrame } from "./lib/pulse";
import { buildShareCardSvg, downloadShareCard } from "./lib/shareCard";
import { loadMatchData } from "./lib/txlineAdapter";
import { replayMatches } from "./data/replayMatch";
import type { DataSourceState, MatchData, MatchMode } from "./types";

const replayDurationMs = 46000;
const maxMinute = 90;
const replaySpeeds = [0.5, 1, 2, 4] as const;

export default function App() {
  const [mode, setMode] = useState<MatchMode>("replay");
  const [isPlaying, setIsPlaying] = useState(true);
  const [minute, setMinute] = useState(1);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [source, setSource] = useState<DataSourceState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<(typeof replaySpeeds)[number]>(1);
  const [replayMatchId, setReplayMatchId] = useState(replayMatches[0].id);

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
    setMinute(1);
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

  function switchMode(nextMode: MatchMode) {
    setMode(nextMode);
    setIsPlaying(nextMode === "replay");
  }

  if (!match || !frame) {
    return (
      <main className="app-shell">
        <section className="panel loading-panel">
          <p className="eyebrow">{loadError ? "Data source error" : "Loading"}</p>
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
  const sharePreview = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildShareCardSvg(match, frame),
  )}`;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Superteam Earn / TxODDS hackathon MVP</p>
          <h1>World Cup Live Pulse</h1>
        </div>
        <div className="mode-switch" aria-label="Dashboard mode">
          <button
            className={mode === "replay" ? "active" : ""}
            onClick={() => switchMode("replay")}
            type="button"
          >
            Replay
          </button>
          <button
            className={mode === "live" ? "active" : ""}
            onClick={() => switchMode("live")}
            type="button"
          >
            Live
          </button>
        </div>
      </header>

      <section className="match-hero" aria-label="Current match">
        <div className="status-ribbon">
          <span className={source?.kind === "replay" ? "status-live" : "status-waiting"}>
            {source?.label ?? "Preparing source"}
          </span>
          <span>{mode === "replay" ? "Mock fixture" : "TxLINE adapter"}</span>
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
          <span>{mode === "live" ? "Waiting for TxLINE token" : match.kickoffLabel}</span>
        </div>
      </section>

      {source ? (
        <section className={`source-banner source-${source.kind}`} aria-label="Data source status">
          <strong>{source.label}</strong>
          <span>{source.message}</span>
        </section>
      ) : null}

      <section className="replay-selector" aria-label="Replay match selector">
        <span>Replay scenario</span>
        {replayMatches.map((candidate) => (
          <button
            className={candidate.id === replayMatchId ? "active" : ""}
            key={candidate.id}
            onClick={() => {
              setIsPlaying(false);
              setReplayMatchId(candidate.id);
            }}
            type="button"
          >
            {candidate.home.code} vs {candidate.away.code}
          </button>
        ))}
      </section>

      <section className="control-strip" aria-label="Replay controls">
        <button type="button" onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <input
          aria-label="Replay minute"
          max={maxMinute}
          min={1}
          onChange={(event) => setMinute(Number(event.target.value))}
          type="range"
          value={minute}
        />
        <strong>{minute}'</strong>
        <button type="button" onClick={() => setMinute(1)}>
          Reset
        </button>
        <div className="speed-switch" aria-label="Replay speed">
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
        <span>Jump to moment</span>
        {keyMoments.map((event) => (
          <button key={event.id} onClick={() => jumpToMoment(event.minute)} type="button">
            {event.minute}' {event.title}
          </button>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel pulse-panel">
          <div className="panel-heading">
            <p className="eyebrow">AI commentary</p>
            <h2>One-line match read</h2>
          </div>
          <p className="commentary">{frame.commentary}</p>
          <div className="stadium-asset" aria-label="Pulse field visualization">
            <div className="field-line center" />
            <div className="field-line box left" />
            <div className="field-line box right" />
            <div className="pulse-dot home" style={{ left: `${frame.pressure.home}%` }} />
            <div className="pulse-dot away" style={{ right: `${frame.pressure.away}%` }} />
          </div>
          <div className="pressure-bars">
            <Pressure label={match.home.code} value={frame.pressure.home} />
            <Pressure label="Neutral" value={frame.pressure.neutral} />
            <Pressure label={match.away.code} value={frame.pressure.away} />
          </div>
        </article>

        <article className="panel market-panel">
          <div className="panel-heading">
            <p className="eyebrow">Market mood, not advice</p>
            <h2>Odds movement</h2>
          </div>
          <div className="odds-row">
            <Odds label={match.home.code} value={frame.market.homeWin} />
            <Odds label="Draw" value={frame.market.draw} />
            <Odds label={match.away.code} value={frame.market.awayWin} />
          </div>
          <div className="sentiment-track">
            <span style={{ width: `${frame.market.sentiment}%` }} />
          </div>
          <p className="small-copy">
            This prototype explains public match movement for fans. It does not place bets,
            recommend trades, or handle wallets.
          </p>
        </article>

        <article className="panel insight-panel">
          <div className="panel-heading">
            <p className="eyebrow">Momentum insight</p>
            <h2>Why this moment matters</h2>
          </div>
          <p className="insight-copy">{frame.insight.headline}</p>
          <div className="insight-metrics">
            <Metric label="Swing" value={`${frame.insight.swing > 0 ? "+" : ""}${frame.insight.swing}`} />
            <Metric label="Signal" value={frame.insight.swingLabel} />
            <Metric label="Events" value={String(frame.insight.eventCount)} />
          </div>
          <p className="small-copy">Next beat: {frame.insight.nextBeat}</p>
        </article>

        <article className="panel share-panel">
          <div className="panel-heading">
            <p className="eyebrow">Fan share card</p>
            <h2>Export the current pulse</h2>
          </div>
          <img alt="Current match pulse share card preview" src={sharePreview} />
          <button type="button" onClick={() => downloadShareCard(match, frame)}>
            Download SVG
          </button>
        </article>

        <article className="panel timeline-panel">
          <div className="panel-heading">
            <p className="eyebrow">Match pulse timeline</p>
            <h2>Key events</h2>
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
            <p className="next-event">Next replay beat: {nextEvent.minute}'</p>
          ) : (
            <p className="next-event">Replay loop will restart.</p>
          )}
        </article>
      </section>
    </main>
  );
}

function TeamBadge({ code, color, name }: { code: string; color: string; name: string }) {
  return (
    <div className="team-badge">
      <span style={{ background: color }}>{code}</span>
      <strong>{name}</strong>
    </div>
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
