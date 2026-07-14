import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { FanStandCopy } from "../data/fanStandCopy";

type FanRoom = "match" | "home" | "away";
type ReactionKind = "celebrate" | "applaud" | "surprised";

type FanMessage = {
  id: string;
  room: FanRoom;
  minute: number;
  text: string;
};

type FanStandState = {
  messages: FanMessage[];
  reactions: Record<FanRoom, Record<ReactionKind, number>>;
  momentReactions: Record<string, ReactionKind>;
};

type FanStandProps = {
  matchId: string;
  minute: number;
  homeName: string;
  awayName: string;
  momentLabel: string;
  momentDescription?: string;
  copy: FanStandCopy;
};

const emptyState: FanStandState = {
  messages: [],
  reactions: {
    match: { celebrate: 0, applaud: 0, surprised: 0 },
    home: { celebrate: 0, applaud: 0, surprised: 0 },
    away: { celebrate: 0, applaud: 0, surprised: 0 },
  },
  momentReactions: {},
};

function storageKey(matchId: string) {
  return `wclp-fan-stand-${matchId}`;
}

function readFanStand(matchId: string): FanStandState {
  if (typeof window === "undefined") return emptyState;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey(matchId)) ?? "null") as Partial<FanStandState> | null;
    const messages = Array.isArray(stored?.messages)
      ? stored.messages.filter((item): item is FanMessage => Boolean(item && typeof item.id === "string" && typeof item.text === "string" && ["match", "home", "away"].includes(item.room))).slice(-24)
      : [];
    const legacyReactions = stored?.reactions as unknown as Partial<Record<ReactionKind, number>> | undefined;
    const roomReactions = stored?.reactions as unknown as Partial<Record<FanRoom, Partial<Record<ReactionKind, number>>>> | undefined;
    const momentReactions = Object.fromEntries(Object.entries(stored?.momentReactions ?? {}).filter(([key, value]) => /^(match|home|away):\d{1,3}$/.test(key) && ["celebrate", "applaud", "surprised"].includes(value))) as Record<string, ReactionKind>;
    const reactionState = (room: FanRoom) => ({
      celebrate: Math.max(0, Math.round(roomReactions?.[room]?.celebrate ?? (room === "match" ? legacyReactions?.celebrate : 0) ?? 0)),
      applaud: Math.max(0, Math.round(roomReactions?.[room]?.applaud ?? (room === "match" ? legacyReactions?.applaud : 0) ?? 0)),
      surprised: Math.max(0, Math.round(roomReactions?.[room]?.surprised ?? (room === "match" ? legacyReactions?.surprised : 0) ?? 0)),
    });
    return {
      messages,
      reactions: {
        match: reactionState("match"),
        home: reactionState("home"),
        away: reactionState("away"),
      },
      momentReactions,
    };
  } catch {
    return emptyState;
  }
}

export function FanStand({ matchId, minute, homeName, awayName, momentLabel, momentDescription, copy }: FanStandProps) {
  const [room, setRoom] = useState<FanRoom>("match");
  const [draft, setDraft] = useState("");
  const [stand, setStand] = useState<FanStandState>(() => readFanStand(matchId));
  const scopeId = matchId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const panelId = `fan-room-panel-${scopeId}`;

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(matchId), JSON.stringify(stand));
    } catch {
      // The room stays usable in memory when browser storage is unavailable.
    }
  }, [matchId, stand]);

  const rooms = useMemo(() => [
    { id: "match" as const, label: copy.allFans },
    { id: "home" as const, label: copy.teamFans(homeName) },
    { id: "away" as const, label: copy.teamFans(awayName) },
  ], [awayName, copy, homeName]);
  const messages = stand.messages.filter((message) => message.room === room).slice().reverse();
  const roomCount = (target: FanRoom) => stand.messages.filter((message) => message.room === target).length;
  const reactionMinute = Math.max(1, Math.round(minute));
  const reactionKey = `${room}:${reactionMinute}`;
  const selectedReaction = stand.momentReactions[reactionKey];

  const addReaction = (kind: ReactionKind) => {
    setStand((current) => {
      const previous = current.momentReactions[reactionKey];
      if (previous === kind) return current;
      const nextRoomReactions = { ...current.reactions[room] };
      if (previous) nextRoomReactions[previous] = Math.max(0, nextRoomReactions[previous] - 1);
      nextRoomReactions[kind] = Math.min(99, nextRoomReactions[kind] + 1);
      return {
        ...current,
        reactions: { ...current.reactions, [room]: nextRoomReactions },
        momentReactions: { ...current.momentReactions, [reactionKey]: kind },
      };
    });
  };

  const postMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${text.length}`;
    setStand((current) => ({
      ...current,
      messages: [...current.messages, { id, room, minute: Math.max(1, minute), text: text.slice(0, 180) }].slice(-24),
    }));
    setDraft("");
  };

  const removeMessage = (id: string) => {
    setStand((current) => ({ ...current, messages: current.messages.filter((message) => message.id !== id) }));
  };

  return (
    <section className="fan-stand" aria-labelledby="fan-stand-title">
      <header className="fan-stand-heading">
        <div>
          <p className="overline">{copy.kicker}</p>
          <h2 id="fan-stand-title">{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        {momentLabel ? <span className="fan-stand-moment">{Math.max(1, minute)}' · {momentLabel}</span> : null}
      </header>

      <div className="fan-room-tabs" role="tablist" aria-label={copy.title}>
        {rooms.map((item) => <button id={`fan-room-${scopeId}-${item.id}`} type="button" role="tab" aria-controls={panelId} aria-selected={room === item.id} className={room === item.id ? "active" : ""} key={item.id} onClick={() => setRoom(item.id)}><span>{item.label}</span>{roomCount(item.id) ? <b>{roomCount(item.id)}</b> : null}</button>)}
      </div>

      <div id={panelId} className="fan-stand-body" role="tabpanel" aria-labelledby={`fan-room-${scopeId}-${room}`}>
        {momentLabel ? <aside className="fan-live-update" aria-live="polite"><span>{copy.matchUpdate}</span><strong>{Math.max(1, minute)}' · {momentLabel}</strong>{momentDescription ? <p>{momentDescription}</p> : null}</aside> : null}
        <div className="fan-reactions" aria-label={copy.react}>
          <span>{copy.react}</span>
          {(["celebrate", "applaud", "surprised"] as const).map((kind) => <button type="button" className={selectedReaction === kind ? "active" : ""} aria-pressed={selectedReaction === kind} key={kind} onClick={() => addReaction(kind)}><span>{copy[kind]}</span><b>{stand.reactions[room][kind]}</b></button>)}
        </div>

        <form className="fan-comment-form" onSubmit={postMessage}>
          <label className="sr-only" htmlFor={`fan-comment-${matchId}`}>{copy.placeholder}</label>
          <input id={`fan-comment-${matchId}`} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} maxLength={180} placeholder={copy.placeholder} />
          <button type="submit" disabled={!draft.trim()}>{copy.post}</button>
          <span className="fan-comment-count" aria-hidden="true">{draft.length}/180</span>
        </form>

        <div className="fan-quick-prompts" aria-label={copy.quickPrompt}>
          <span>{copy.quickPrompt}</span>
          <div>{copy.prompts.map((prompt) => <button type="button" key={prompt} onClick={() => setDraft(prompt)}>{prompt}</button>)}</div>
        </div>

        <div className="fan-message-list" aria-live="polite">
          {messages.length ? messages.map((message) => <article key={message.id}><header><span>{copy.yourPost} · {copy.minute} {message.minute}'</span><button type="button" onClick={() => removeMessage(message.id)} aria-label={copy.removePost} title={copy.removePost}>×</button></header><p>{message.text}</p></article>) : <p className="fan-room-empty">{copy.empty}</p>}
        </div>
      </div>
      <small className="fan-stand-privacy">{copy.saved}</small>
    </section>
  );
}
