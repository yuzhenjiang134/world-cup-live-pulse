export type OfficialVideoSource = {
  id: string;
  label: string;
  url: string;
  note: string;
  scope: "archive" | "highlights" | "hub";
};

// These are official FIFA pages. They are external viewing links, not a claim
// that every match is available live or in every territory.
export const officialVideoSources: OfficialVideoSource[] = [
  {
    id: "fifa-world-cup-editions",
    label: "FIFA+ World Cup archive",
    url: "https://www.plus.fifa.com/en/showcase/fifa-world-cup-editions/9e331159-475a-4b7e-9ee7-27ff9587c6e2",
    note: "Official archive and replay hub; catalogue availability varies by territory and rights.",
    scope: "archive",
  },
  {
    id: "fifa-highlights-replays",
    label: "FIFA+ highlights and replays",
    url: "https://www.plus.fifa.com/en/showcase/highlights-and-replays/483be165-7819-4791-8815-e502790a5aa4",
    note: "Official highlights and replay collection; it is not presented as a live stream.",
    scope: "highlights",
  },
  {
    id: "fifa-world-cup",
    label: "FIFA World Cup official page",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/",
    note: "Official tournament hub for current updates, highlights and match context.",
    scope: "hub",
  },
];

