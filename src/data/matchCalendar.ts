import { replayMatches } from "./replayMatch";
import type { DataConsistencyState } from "../types";

export const dataConsistencyState: DataConsistencyState = {
  checkedAtIso: "2026-07-17T10:00:59+08:00",
  liveAvailability: "live-match-available",
  sourceLabel: "TxLINE CompetitionId 72 fixture snapshot + authenticated 2026 archive",
  message:
    "This build never invents live games. Current fixtures come from the TxLINE World Cup snapshot. Completed 2026 replays come from authenticated historical score sequences. Unconfirmed stages, winners, player names, and odds are left blank rather than inferred.",
  rules: [
    "Live means pulled from authenticated TxLINE score, event, and odds endpoints.",
    "Delay means TxLINE Free Tier or delayed feed data, including the documented 60-second delay mode.",
    "Replay means fixed historical demo data for judging and video recording.",
    "Seed means official schedule/context or static background data that is not a live feed.",
  ],
  today: [
    {
      id: "txline-fixture-18257865",
      label: "TxLINE verified third-place fixture",
      fixtureId: 18257865,
      homeCode: "FRA",
      awayCode: "ENG",
      kickoffIso: "2026-07-18T21:00:00Z",
      stage: "Bronze final",
      dataStatus: "Seed",
      availability: "upcoming",
      sourceLabel: "TxLINE World Cup fixture snapshot",
      coverage: "Fixture ID, participants and kickoff verified from the TxLINE CompetitionId 72 snapshot.",
      statusNote: "Scores, events and odds load from authenticated endpoints when available.",
    },
    {
      id: "txline-fixture-18257739",
      label: "TxLINE verified final fixture",
      fixtureId: 18257739,
      homeCode: "ESP",
      awayCode: "ARG",
      kickoffIso: "2026-07-19T19:00:00Z",
      stage: "Final",
      dataStatus: "Seed",
      availability: "upcoming",
      sourceLabel: "TxLINE World Cup fixture snapshot",
      coverage: "Fixture ID, participants and kickoff verified from the TxLINE CompetitionId 72 snapshot.",
      statusNote: "Scores, events and odds load from authenticated endpoints when available.",
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
      sourceLabel: "Replay fixture",
      coverage: "Score, events, market snapshots, teams, players, referee, standings",
      statusNote: "Historical replay for judgeable demo and video recording.",
    })),
  ],
};
