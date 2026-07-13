import argparse
import array
import difflib
import json
import math
import wave
from pathlib import Path

from faster_whisper import WhisperModel
from opencc import OpenCC


ROOT = Path(__file__).resolve().parents[1]
T2S = OpenCC("t2s")
CLIPS = {
    "fra-mar-fulltime-en-call.wav": ("en", "Full-time: France 2-0 Morocco. The final score and event sequence are confirmed."),
    "fra-mar-fulltime-en-why.wav": ("en", "The replay is ready to be shared as a complete fan story."),
    "fra-mar-fulltime-en-recap.wav": ("en", "Quick catch-up: France 2-0 Morocco. 2 goals and 1 card are verified. Latest: Full-time; the verified score is 2-0."),
    "fra-mar-fulltime-zh-call.wav": ("zh", "全场结束：法国二比零摩洛哥，最终比分和比赛事件已确认。"),
    "fra-mar-fulltime-zh-why.wav": ("zh", "回放已完成，可以作为完整的球迷故事查看。"),
    "fra-mar-fulltime-zh-recap.wav": ("zh", "快速补课：法国二比零摩洛哥。已确认两个进球和一张牌。最新节点：全场结束，最终比分二比零。"),
}


def normalize(value):
    simplified = T2S.convert(str(value))
    return "".join(character.lower() for character in simplified if character.isalnum())


def audio_metrics(path):
    with wave.open(str(path), "rb") as source:
        channels = source.getnchannels()
        sample_width = source.getsampwidth()
        sample_rate = source.getframerate()
        frame_count = source.getnframes()
        raw = source.readframes(frame_count)
    if sample_width != 2:
        raise ValueError(f"Expected PCM16 WAV: {path.name}")
    samples = array.array("h")
    samples.frombytes(raw)
    absolute = [abs(sample) / 32768 for sample in samples]
    peak = max(absolute, default=0)
    rms = math.sqrt(sum(value * value for value in absolute) / max(1, len(absolute)))
    clip_ratio = sum(value >= 0.995 for value in absolute) / max(1, len(absolute))
    silence_ratio = sum(value < 0.003 for value in absolute) / max(1, len(absolute))
    return {
        "duration": round(frame_count / sample_rate, 3),
        "channels": channels,
        "sample_rate": sample_rate,
        "peak": round(peak, 4),
        "rms": round(rms, 4),
        "clip_ratio": round(clip_ratio, 6),
        "silence_ratio": round(silence_ratio, 4),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--output", default="demo-assets/commentary-audio-asr-report.json")
    args = parser.parse_args()

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    rows = []
    failed = False
    for filename, (language, expected) in CLIPS.items():
        path = ROOT / "public" / "audio" / "commentary" / filename
        metrics = audio_metrics(path)
        segments, info = model.transcribe(str(path), language=language, beam_size=5, vad_filter=True)
        actual = " ".join(segment.text.strip() for segment in segments)
        ratio = difflib.SequenceMatcher(None, normalize(expected), normalize(actual)).ratio()
        passed = (
            1.5 <= metrics["duration"] <= 20
            and metrics["rms"] >= 0.01
            and metrics["clip_ratio"] <= 0.001
            and metrics["silence_ratio"] <= 0.85
            and ratio >= (0.72 if language == "en" else 0.62)
        )
        failed = failed or not passed
        row = {
            "file": filename,
            "passed": passed,
            "ratio": round(ratio, 3),
            "detected_language": info.language,
            "expected": expected,
            "actual": actual,
            **metrics,
        }
        rows.append(row)
        print(f"{'PASS' if passed else 'FAIL'} {filename} ratio={ratio:.3f} duration={metrics['duration']}s rms={metrics['rms']} clip={metrics['clip_ratio']}")
        print(f"ASR: {actual}")

    output = ROOT / args.output
    output.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
