type CommentaryClipMode = "call" | "why" | "recap";

type CommentaryClip = {
  path: string;
  text: string;
};

const commentaryClips: Record<string, CommentaryClip> = {
  "txline-archive-18209181|en|call|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-call.wav",
    text: "Full-time: France 2-0 Morocco. The final score and event sequence are confirmed.",
  },
  "txline-archive-18209181|en|why|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-why.wav",
    text: "The replay is ready to be shared as a complete fan story.",
  },
  "txline-archive-18209181|en|recap|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-en-recap.wav",
    text: "Quick catch-up: France 2-0 Morocco. 2 goals and 1 card are verified. Latest: Full-time; the verified score is 2-0.",
  },
  "txline-archive-18209181|zh|call|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-call.wav",
    text: "全场结束：法国 2-0 摩洛哥，最终比分和比赛事件已确认。",
  },
  "txline-archive-18209181|zh|why|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-why.wav",
    text: "回放已完成，可作为完整的球迷故事查看。",
  },
  "txline-archive-18209181|zh|recap|fulltime": {
    path: "audio/commentary/fra-mar-fulltime-zh-recap.wav",
    text: "快速补课：法国 2-0 摩洛哥。已确认 2 个进球和 1 张牌。最新节点：全场结束，最终比分 2-0。",
  },
};

export function getCommentaryVoiceClip(matchId: string, language: string, mode: CommentaryClipMode, eventType: string | undefined, visibleText: string) {
  if (!eventType) return undefined;
  const clip = commentaryClips[`${matchId}|${language}|${mode}|${eventType}`];
  return clip?.text === visibleText ? clip.path : undefined;
}
