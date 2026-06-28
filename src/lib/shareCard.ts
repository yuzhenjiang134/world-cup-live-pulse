import type { MatchData, PulseFrame } from "../types";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildShareCardSvg(match: MatchData, frame: PulseFrame) {
  const latestTitle = frame.latestEvent?.title ?? "Match pulse";
  const latestDescription = frame.latestEvent?.description ?? "Replay demo is ready.";
  const score = `${match.home.code} ${frame.homeScore}-${frame.awayScore} ${match.away.code}`;
  const commentary =
    frame.commentary.length > 112 ? `${frame.commentary.slice(0, 109)}...` : frame.commentary;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#17313b"/>
      <stop offset="0.58" stop-color="#0c1518"/>
      <stop offset="1" stop-color="#452d32"/>
    </linearGradient>
    <linearGradient id="pulse" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#55a7d8"/>
      <stop offset="0.5" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#ef476f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="54" y="54" width="1092" height="522" rx="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
  <text x="86" y="118" fill="#b9c9ce" font-family="Arial, sans-serif" font-size="28" font-weight="700">WORLD CUP LIVE PULSE</text>
  <text x="86" y="224" fill="#ffffff" font-family="Arial, sans-serif" font-size="88" font-weight="900">${escapeXml(score)}</text>
  <text x="86" y="306" fill="#ffd166" font-family="Arial, sans-serif" font-size="48" font-weight="800">${escapeXml(latestTitle)} at ${frame.minute}'</text>
  <text x="86" y="366" fill="#d7e2e6" font-family="Arial, sans-serif" font-size="30">${escapeXml(latestDescription)}</text>
  <foreignObject x="86" y="408" width="900" height="96">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: white; font-size: 34px; line-height: 1.18; font-weight: 800;">${escapeXml(commentary)}</div>
  </foreignObject>
  <rect x="86" y="532" width="650" height="18" rx="9" fill="rgba(255,255,255,0.18)"/>
  <rect x="86" y="532" width="${Math.max(24, frame.market.sentiment * 6.5)}" height="18" rx="9" fill="url(#pulse)"/>
  <text x="770" y="552" fill="#ffffff" font-family="Arial, sans-serif" font-size="26" font-weight="700">Market mood ${frame.market.sentiment}/100</text>
  <text x="86" y="586" fill="#9fb1b7" font-family="Arial, sans-serif" font-size="22">Informational fan experience. No betting, trading advice, wallets, or custody.</text>
</svg>`;
}

export function downloadShareCard(match: MatchData, frame: PulseFrame) {
  const svg = buildShareCardSvg(match, frame);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `world-cup-live-pulse-${match.id}-${frame.minute}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type PredictionCardInput = {
  homeScore: number;
  awayScore: number;
  outcome: string;
  quickPick: string;
  safetyLabel: string;
};

export function buildPredictionCardSvg(
  match: MatchData,
  frame: PulseFrame,
  prediction: PredictionCardInput,
) {
  const pickedScore = `${match.home.code} ${prediction.homeScore}-${prediction.awayScore} ${match.away.code}`;
  const latestTitle = frame.latestEvent?.title ?? "Match pulse";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff7ef"/>
      <stop offset="0.55" stop-color="#eef8f5"/>
      <stop offset="1" stop-color="#e8f0ff"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${escapeXml(match.home.color)}"/>
      <stop offset="0.5" stop-color="#ffd166"/>
      <stop offset="1" stop-color="${escapeXml(match.away.color)}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="54" y="52" width="1092" height="526" rx="24" fill="#ffffff" stroke="#d8e0dc"/>
  <rect x="54" y="52" width="1092" height="16" rx="8" fill="url(#stripe)"/>
  <text x="86" y="124" fill="#657478" font-family="Arial, sans-serif" font-size="28" font-weight="800">WORLD CUP LIVE PULSE / FAN SCORE PICK</text>
  <text x="86" y="224" fill="#11191c" font-family="Arial, sans-serif" font-size="92" font-weight="900">${escapeXml(pickedScore)}</text>
  <text x="86" y="300" fill="#cf3246" font-family="Arial, sans-serif" font-size="42" font-weight="900">My read: ${escapeXml(prediction.outcome)}</text>
  <text x="86" y="360" fill="#34464a" font-family="Arial, sans-serif" font-size="32" font-weight="800">Quick pick: ${escapeXml(prediction.quickPick)}</text>
  <rect x="86" y="408" width="612" height="86" rx="16" fill="#f3f6f5"/>
  <text x="112" y="460" fill="#172126" font-family="Arial, sans-serif" font-size="30" font-weight="800">${escapeXml(latestTitle)} / ${frame.minute}'</text>
  <rect x="724" y="408" width="332" height="86" rx="16" fill="#172126"/>
  <text x="754" y="461" fill="#ffffff" font-family="Arial, sans-serif" font-size="30" font-weight="900">Pulse ${frame.market.sentiment}/100</text>
  <text x="86" y="546" fill="#657478" font-family="Arial, sans-serif" font-size="24">${escapeXml(prediction.safetyLabel)}</text>
</svg>`;
}

export function downloadPredictionCard(
  match: MatchData,
  frame: PulseFrame,
  prediction: PredictionCardInput,
) {
  const svg = buildPredictionCardSvg(match, frame, prediction);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `world-cup-live-pulse-pick-${match.id}-${prediction.homeScore}-${prediction.awayScore}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
