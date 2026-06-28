import { replayMatches } from "./replayMatch";
import type { DataConsistencyState } from "../types";

export const dataConsistencyState: DataConsistencyState = {
  checkedAtIso: "2026-06-28T10:59:09+08:00",
  liveAvailability: "token-required",
  sourceLabel: "TxLINE schedule snapshot + replay fixtures",
  message:
    "This build never invents live games. The TxLINE World Cup schedule snapshot observed fixtures for 2026-06-28 UTC, so the app shows them as Seed / Token Required until authenticated live score, event, and odds feeds are configured.",
  rules: [
    "Live means pulled from authenticated TxLINE score, event, and odds endpoints.",
    "Delay means TxLINE Free Tier or delayed feed data, including the documented 60-second delay mode.",
    "Replay means fixed historical demo data for judging and video recording.",
    "Seed means official schedule/context or static background data that is not a live feed.",
  ],
  today: [
    {
      id: "txline-fixture-17588325",
      label: "Official TxLINE schedule seed",
      fixtureId: 17588325,
      homeCode: "JOR",
      awayCode: "ARG",
      kickoffIso: "2026-06-28T02:00:00Z",
      stage: "World Cup Group Stage",
      dataStatus: "Seed",
      availability: "upcoming",
      sourceLabel: "TxLINE World Cup schedule",
      coverage: "Schedule known; live score/events/odds require token",
      statusNote: "Do not present as Live until score and odds endpoints are authenticated.",
    },
    {
      id: "txline-fixture-17588326",
      label: "Official TxLINE schedule seed",
      fixtureId: 17588326,
      homeCode: "ALG",
      awayCode: "AUT",
      kickoffIso: "2026-06-28T05:00:00Z",
      stage: "World Cup Group Stage",
      dataStatus: "Seed",
      availability: "upcoming",
      sourceLabel: "TxLINE World Cup schedule",
      coverage: "Schedule known; live score/events/odds require token",
      statusNote: "Do not present as Live until score and odds endpoints are authenticated.",
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
