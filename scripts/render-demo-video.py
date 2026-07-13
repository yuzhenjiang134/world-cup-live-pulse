import argparse
import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEMO_DIR = ROOT / "demo-assets"
SCREENSHOT_DIR = DEMO_DIR / "screenshots"
WIDTH = 1280
HEIGHT = 720


def resolve_ffmpeg():
    configured = os.environ.get("FFMPEG_PATH")
    if configured and Path(configured).is_file():
        return Path(configured)

    command = shutil.which("ffmpeg")
    if command:
        return Path(command)

    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        apps_root = Path(local_app_data) / "JianyingPro" / "Apps"
        if apps_root.is_dir():
            bundled = sorted(apps_root.rglob("ffmpeg.exe"), reverse=True)
            if bundled:
                return bundled[0]

    raise FileNotFoundError("ffmpeg not found. Set FFMPEG_PATH or add ffmpeg to PATH.")


FFMPEG = resolve_ffmpeg()


def font(size, bold=False):
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(str(Path(r"C:\Windows\Fonts") / name), size)


def wrap(draw, text, text_font, max_width):
    words = str(text).split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=text_font)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def draw_wrapped(draw, text, xy, text_font, fill, max_width, spacing=8, max_lines=4):
    x, y = xy
    lines = wrap(draw, text, text_font, max_width)[:max_lines]
    line_height = text_font.size + spacing
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=text_font, fill=fill)
    return y + len(lines) * line_height


def gradient_background():
    image = Image.new("RGB", (WIDTH, HEIGHT), "#122126")
    pixels = image.load()
    left = (18, 41, 46)
    middle = (24, 88, 79)
    right = (225, 184, 67)
    for x in range(WIDTH):
        position = x / (WIDTH - 1)
        if position < 0.62:
            ratio = position / 0.62
            start, end = left, middle
        else:
            ratio = (position - 0.62) / 0.38
            start, end = middle, right
        color = tuple(round(start[i] + (end[i] - start[i]) * ratio) for i in range(3))
        for y in range(HEIGHT):
            pixels[x, y] = color
    return image


def render_card(scene, index, total):
    image = gradient_background()
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((68, 76, 1212, 646), radius=26, fill=(12, 27, 31, 226), outline=(255, 255, 255, 36), width=2)
    draw.text((112, 116), scene.get("kicker", "World Cup Live Pulse"), font=font(25, True), fill="#FFE49A")
    title_bottom = draw_wrapped(draw, scene["title"], (112, 176), font(58, True), "#FFFFFF", 990, spacing=5, max_lines=2)
    subtitle_y = max(318, title_bottom + 24)
    bullet_y = draw_wrapped(draw, scene.get("subtitle", ""), (116, subtitle_y), font(27, True), "#D7E8E5", 940, spacing=9, max_lines=3) + 24
    for bullet in scene.get("bullets", []):
        draw.ellipse((118, bullet_y + 7, 134, bullet_y + 23), fill="#FFE49A")
        draw.text((152, bullet_y), bullet, font=font(23, True), fill="#FFFFFF")
        bullet_y += 39
    draw_footer(draw, index, total, scene["seconds"])
    return image


def crop_cover(source, target_size):
    target_w, target_h = target_size
    scale = max(target_w / source.width, target_h / source.height)
    resized = source.resize((round(source.width * scale), round(source.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - target_w) // 2)
    top = max(0, (resized.height - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def render_screenshot(scene, index, total):
    source_path = SCREENSHOT_DIR / scene["image"]
    if not source_path.exists():
        raise FileNotFoundError(source_path)
    source = Image.open(source_path).convert("RGB")
    source = ImageEnhance.Contrast(source).enhance(1.03)
    image = crop_cover(source, (WIDTH, HEIGHT))
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    for row in range(260):
        alpha = round(50 + 190 * (row / 259))
        draw.rectangle((0, HEIGHT - 260 + row, WIDTH, HEIGHT - 260 + row), fill=(8, 20, 24, alpha))
    draw.rounded_rectangle((38, 438, 1242, 670), radius=22, fill=(10, 24, 28, 226), outline=(255, 255, 255, 36), width=2)
    draw_wrapped(draw, scene["title"], (72, 472), font(38, True), "#FFFFFF", 1080, spacing=5, max_lines=2)
    draw_wrapped(draw, scene.get("subtitle", ""), (74, 558), font(23, True), "#D8E8E6", 1080, spacing=7, max_lines=2)
    x = 72
    for badge in scene.get("badges", []):
        badge_font = font(18, True)
        bbox = draw.textbbox((0, 0), badge, font=badge_font)
        badge_width = min(320, bbox[2] - bbox[0] + 30)
        draw.rounded_rectangle((x, 622, x + badge_width, 656), radius=17, fill="#FFE49A")
        draw.text((x + 15, 628), badge, font=badge_font, fill="#152126")
        x += badge_width + 10
    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_footer(draw, index, total, scene["seconds"])
    return image.convert("RGB")


def render_compare(scene, index, total):
    before_path = SCREENSHOT_DIR / scene["beforeImage"]
    after_path = SCREENSHOT_DIR / scene["afterImage"]
    if not before_path.exists():
        raise FileNotFoundError(before_path)
    if not after_path.exists():
        raise FileNotFoundError(after_path)

    image = gradient_background().convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((34, 66, 1246, 674), radius=24, fill=(10, 24, 28, 236), outline=(255, 255, 255, 36), width=2)

    panel_y = 104
    panel_w = 568
    panel_h = 300
    before = crop_cover(Image.open(before_path).convert("RGB"), (panel_w, panel_h))
    after = crop_cover(Image.open(after_path).convert("RGB"), (panel_w, panel_h))
    image.alpha_composite(before.convert("RGBA"), (64, panel_y))
    image.alpha_composite(after.convert("RGBA"), (648, panel_y))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((76, 116, 190, 154), radius=19, fill=(13, 35, 40, 232))
    draw.text((98, 125), "BEFORE", font=font(17, True), fill="#FFFFFF")
    draw.rounded_rectangle((660, 116, 760, 154), radius=19, fill="#FFE49A")
    draw.text((680, 125), "AFTER", font=font(17, True), fill="#152126")
    draw.rounded_rectangle((604, 228, 676, 282), radius=27, fill=(255, 228, 154, 244))
    draw.text((628, 236), "→", font=font(30, True), fill="#152126")

    draw_wrapped(draw, scene["title"], (70, 432), font(35, True), "#FFFFFF", 1110, spacing=5, max_lines=2)
    draw_wrapped(draw, scene.get("subtitle", ""), (72, 520), font(21, True), "#D8E8E6", 1100, spacing=7, max_lines=2)
    x = 72
    for badge in scene.get("badges", []):
        badge_font = font(17, True)
        bbox = draw.textbbox((0, 0), badge, font=badge_font)
        badge_width = min(330, bbox[2] - bbox[0] + 28)
        draw.rounded_rectangle((x, 620, x + badge_width, 652), radius=16, fill="#FFE49A")
        draw.text((x + 14, 626), badge, font=badge_font, fill="#152126")
        x += badge_width + 10
    draw_footer(draw, index, total, scene["seconds"])
    return image.convert("RGB")


def draw_footer(draw, index, total, seconds):
    label = f"World Cup Live Pulse  |  Scene {index}/{total}  |  {seconds}s"
    draw.text((42, 28), label, font=font(17, True), fill=(255, 255, 255, 215))
    draw.rounded_rectangle((42, 690, 1238, 699), radius=5, fill=(255, 255, 255, 44))
    draw.rounded_rectangle((42, 690, 42 + round(1196 * index / total), 699), radius=5, fill="#FFE49A")


def load_manifest(variant):
    command = ["node", "scripts/record-demo-video.mjs", f"--variant={variant}", "--print-manifest"]
    result = subprocess.run(command, cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8")
    return json.loads(result.stdout)


def encode_video(frames, output):
    concat_path = frames[0][0].parent / "concat.txt"
    lines = []
    for frame, seconds in frames:
        escaped = str(frame.resolve()).replace("'", "'\\''")
        lines.extend([f"file '{escaped}'", f"duration {seconds}"])
    final_escaped = str(frames[-1][0].resolve()).replace("'", "'\\''")
    lines.append(f"file '{final_escaped}'")
    concat_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    base = [str(FFMPEG), "-y", "-hide_banner", "-loglevel", "warning", "-f", "concat", "-safe", "0", "-i", str(concat_path), "-vf", "fps=24,format=yuv420p"]
    nvenc = base + ["-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-b:v", "1800k", "-maxrate", "2200k", "-bufsize", "4400k", "-movflags", "+faststart", str(output)]
    encoded = subprocess.run(nvenc, cwd=ROOT, capture_output=True, text=True)
    if encoded.returncode != 0:
        fallback = base + ["-c:v", "mpeg4", "-b:v", "1800k", "-maxrate", "2200k", "-bufsize", "4400k", "-movflags", "+faststart", str(output)]
        subprocess.run(fallback, cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser(description="Render captioned World Cup Live Pulse demo video.")
    parser.add_argument("--variant", choices=["A", "B"], default="A")
    args = parser.parse_args()
    manifest = load_manifest(args.variant)
    work_dir = DEMO_DIR / f"render-{args.variant.lower()}"
    shutil.rmtree(work_dir, ignore_errors=True)
    work_dir.mkdir(parents=True, exist_ok=True)
    scenes = manifest["scenes"]
    rendered = []
    for index, scene in enumerate(scenes, start=1):
        if scene.get("kind") == "compare":
            frame = render_compare(scene, index, len(scenes))
        elif scene.get("image"):
            frame = render_screenshot(scene, index, len(scenes))
        else:
            frame = render_card(scene, index, len(scenes))
        frame_path = work_dir / f"scene-{index:02d}.png"
        frame.save(frame_path, quality=95)
        rendered.append((frame_path, scene["seconds"]))

    output = DEMO_DIR / f"world-cup-live-pulse-demo-{args.variant.lower()}.mp4"
    encode_video(rendered, output)
    print(json.dumps({"variant": args.variant, "seconds": sum(scene["seconds"] for scene in scenes), "output": str(output), "bytes": output.stat().st_size}, ensure_ascii=False))


if __name__ == "__main__":
    main()
