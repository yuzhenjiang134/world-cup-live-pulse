import type { MatchLoadResult } from "../types";
import { getReplayMatch } from "../data/replayMatch";

type TxlineAdapterOptions = {
  apiBase?: string;
  apiKey?: string;
  replayMatchId?: string;
};

export async function loadMatchData(
  mode: "live" | "replay",
  options: TxlineAdapterOptions = {},
): Promise<MatchLoadResult> {
  const replayMatch = getReplayMatch(options.replayMatchId);

  if (mode === "replay") {
    return {
      match: replayMatch,
      source: {
        kind: "replay",
        label: "Replay running",
        message: "Using a fixed replay fixture so judges can evaluate the demo at any time.",
      },
    };
  }

  if (!options.apiBase || !options.apiKey) {
    return {
      match: {
        ...replayMatch,
        kickoffLabel: "Live placeholder",
        status: "scheduled",
      },
      source: {
        kind: "needs-token",
        label: "Needs TxLINE token",
        message:
          "Live mode is wired to the adapter boundary, but the API token and endpoint docs are not configured yet.",
      },
    };
  }

  // Placeholder for the TxLINE World Cup API integration once the token is available.
  // Keep secrets in .env.local and map external fields into MatchData here.
  return {
    match: replayMatch,
    source: {
      kind: "live-ready",
      label: "Live adapter ready",
      message:
        "TxLINE credentials are configured. Replace this placeholder with endpoint mapping when API docs are available.",
    },
  };
}
