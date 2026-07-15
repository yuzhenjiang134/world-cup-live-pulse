type CommentaryClipMode = "call" | "why" | "recap";

type CommentaryClip = {
  path: string;
  factTokens?: string[];
};

const commentaryClips: Record<string, CommentaryClip> = {
  "txline-archive-18209181|en|call|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-call.wav",
    factTokens: ["2-0"],
  },
  "txline-archive-18209181|en|why|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-why.wav",
  },
  "txline-archive-18209181|en|recap|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-recap.wav",
    factTokens: ["2-0"],
  },
  "txline-archive-18209181|zh|call|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-call.wav",
    factTokens: ["2-0"],
  },
  "txline-archive-18209181|zh|why|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-why.wav",
  },
  "txline-archive-18209181|zh|recap|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-recap.wav",
    factTokens: ["2-0"],
  },
};

export function getCommentaryVoiceClip(matchId: string, language: string, mode: CommentaryClipMode, eventType: string | undefined, visibleText: string) {
  if (!eventType) return undefined;
  const clip = commentaryClips[`${matchId}|${language}|${mode}|${eventType}`];
  if (!clip || clip.factTokens?.some((token) => !visibleText.includes(token))) return undefined;
  return clip.path;
}
