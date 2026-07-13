import argparse
import array
import difflib
import json
import math
import re
import subprocess
import wave
from pathlib import Path

from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parents[1]


def normalize(text):
    return re.sub(r"[^a-z0-9]+", " ", str(text).lower()).strip()


def load_manifest(variant):
    output = subprocess.check_output(
        ["node", "scripts/record-demo-video.mjs", f"--variant={variant}", "--print-manifest"],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
    )
    return json.loads(output)


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
    parser = argparse.ArgumentParser(description="Reverse-transcribe demo narration and compare it with the scene script.")
    parser.add_argument("--model", required=True, help="Local faster-whisper model directory.")
    parser.add_argument("--variant", choices=["A", "B"], default="B")
    parser.add_argument("--audio-dir", default="demo-assets/narration-b")
    parser.add_argument("--output", default="demo-assets/narration-asr-report.json")
    args = parser.parse_args()

    manifest = load_manifest(args.variant)
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    audio_dir = ROOT / args.audio_dir
    rows = []
    failed = False

    for index, scene in enumerate(manifest["scenes"], start=1):
        audio_path = audio_dir / f"raw-{index:02d}.wav"
        segments, info = model.transcribe(str(audio_path), language="en", beam_size=5, vad_filter=True)
        actual = " ".join(segment.text.strip() for segment in segments)
        expected = scene.get("narration") or f"{scene['title']}. {scene.get('subtitle', '')}"
        ratio = difflib.SequenceMatcher(None, normalize(expected), normalize(actual)).ratio()
        metrics = audio_metrics(audio_path)
        passed = (
            ratio >= 0.85
            and 1.5 <= metrics["duration"] <= max(1.5, scene["seconds"] - 0.35)
            and metrics["rms"] >= 0.01
            and metrics["clip_ratio"] <= 0.001
            and metrics["silence_ratio"] <= 0.85
        )
        failed = failed or not passed
        row = {
            "scene": index,
            "passed": passed,
            "ratio": round(ratio, 3),
            "language": info.language,
            "expected": expected,
            "actual": actual,
            **metrics,
        }
        rows.append(row)
        print(f"{'PASS' if passed else 'FAIL'} SCENE {index:02d} ratio={ratio:.3f} duration={metrics['duration']}s rms={metrics['rms']} clip={metrics['clip_ratio']}")
        print(f"ASR: {actual}\n")

    output_path = ROOT / args.output
    output_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    summary = {
        "scenes": len(rows),
        "passed": not failed,
        "minimum_ratio": min(row["ratio"] for row in rows),
        "average_ratio": round(sum(row["ratio"] for row in rows) / len(rows), 3),
        "output": str(output_path),
    }
    print(json.dumps(summary, ensure_ascii=False))
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
