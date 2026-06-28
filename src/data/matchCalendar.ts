import { replayMatches } from "./replayMatch";
import type { DataConsistencyState } from "../types";

export const dataConsistencyState: DataConsistencyState = {
  checkedAtIso: "2026-06-28T09:00:00+08:00",
  liveAvailability: "token-required",
  sourceLabel: "Public build: seed schedule + replay fixtures",
  message:
    "World Cup matches are not guaranteed every day. This build never invents live games: if TxLINE live data is unavailable or there is no match today, the app clearly switches to Replay or Seed data.",
  rules: [
    "Live means pulled from TxLINE after a token and endpoint docs are configured.",
    "Delay means live-like data that is not guaranteed real time.",
    "Replay means fixed historical demo data for judging and video recording.",
    "Seed means static background data such as teams, players, referees, and standings.",
  ],
  today: [
    {
      id: "calendar-live-status",
      label: "No public TxLINE live fixture configured",
      homeCode: "TBD",
      awayCode: "TBD",
      kickoffIso: "2026-06-28T00:00:00+08:00",
      stage: "No Match Day / Token Required",
      dataStatus: "Seed",
      availability: "no-live-feed",
    },
    ...replayMatches.map((match) => ({
      id: match.id,
      label: match.kickoffLabel,
      homeCode: match.home.code,
      awayCode: match.away.code,
      kickoffIso: match.kickoffIso ?? "2026-06-28T00:00:00+08:00",
      stage: match.stage ?? match.competition,
      dataStatus: match.dataStatus ?? "Replay",
      availability: "available" as const,
    })),
  ],
};
