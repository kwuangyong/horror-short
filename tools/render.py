#!/usr/bin/env python3
"""Assemble a vertical horror short from stills with ffmpeg.

    python tools/render.py project.json [--voice voice_dark.wav] [--output out.mp4]

Each scene: Ken Burns zoom/pan, optional shake / white flash / fade, HUD overlay
(series label + in-story clock like the reference video). Then: concat, voice + music
bed + timed SFX, burned captions (.ass), loudness-normalised to -14 LUFS.

See examples/ma-da/project.json for every option.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from common import RED, WHITE, find_font  # noqa: E402


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(cmd), "\n", r.stderr[-3000:], file=sys.stderr)
        raise SystemExit(r.returncode)


def hud_png(path: Path, label: str, clock: str | None, w: int, h: int, font: str) -> None:
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = w / 1080
    f1 = ImageFont.truetype(font, int(30 * s))
    f2 = ImageFont.truetype(font, int(28 * s))
    tw = d.textlength(label, font=f1)
    pad = 22 * s
    y = 70 * s
    d.rounded_rectangle(((w - tw) / 2 - pad, y, (w + tw) / 2 + pad, y + 50 * s), radius=25 * s,
                        fill=RED + (255,))
    d.text(((w - tw) / 2, y + 7 * s), label, font=f1, fill=WHITE)
    if clock:
        cw = d.textlength(clock, font=f2)
        cy = y + 68 * s
        d.ellipse(((w - cw) / 2 - 26 * s, cy + 12 * s, (w - cw) / 2 - 12 * s, cy + 26 * s),
                  fill=RED + (255,))
        d.text(((w - cw) / 2, cy), clock, font=f2, fill=WHITE)
    img.save(path)


def scene_clip(sc: dict, i: int, cfg: dict, base: Path, tmp: Path, font: str) -> Path:
    W, H, fps = cfg["width"], cfg["height"], cfg["fps"]
    dur = float(sc["duration"])
    n = max(1, round(dur * fps))
    z0, z1 = sc.get("zoom", [1.0, 1.08])
    pan = sc.get("pan", "none")
    src = base / sc["image"]

    # upscale 2x for smooth sub-pixel zoompan, cover-crop to 9:16
    pre = (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,"
           f"crop={W*2}:{H*2},setsar=1")
    zexpr = f"{z0}+({z1}-{z0})*on/{max(n-1,1)}"
    prog = f"(on/{max(n-1,1)})"
    xexpr = {"left": f"(iw-iw/zoom)*(1-{prog})", "right": f"(iw-iw/zoom)*{prog}"}.get(
        pan, "iw/2-(iw/zoom/2)")
    yexpr = {"up": f"(ih-ih/zoom)*(1-{prog})", "down": f"(ih-ih/zoom)*{prog}"}.get(
        pan, "ih/2-(ih/zoom/2)")
    vf = [pre, f"zoompan=z='{zexpr}':x='{xexpr}':y='{yexpr}':d={n}:s={W}x{H}:fps={fps}"]
    if sc.get("shake"):
        amp = int(sc["shake"]) if not isinstance(sc["shake"], bool) else 14
        vf.append(f"crop={W-2*amp}:{H-2*amp}:'{amp}+{amp}*sin(t*47)':'{amp}+{amp}*cos(t*39)',"
                  f"scale={W}:{H}")
    if sc.get("flash"):
        vf.append("fade=t=in:st=0:d=0.18:color=white")
    if sc.get("fade_in"):
        vf.append(f"fade=t=in:st=0:d={sc['fade_in']}")
    if sc.get("fade_out"):
        vf.append(f"fade=t=out:st={dur - sc['fade_out']:.3f}:d={sc['fade_out']}")
    vf.append("format=yuv420p")

    out = tmp / f"scene_{i:03d}.mp4"
    cmd = ["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(fps), "-t", f"{dur}",
           "-i", str(src)]
    hud = cfg.get("hud")
    if hud and sc.get("hud", True):
        hp = tmp / f"hud_{i:03d}.png"
        hud_png(hp, hud["label"], sc.get("_clock"), W, H, font)
        cmd += ["-i", str(hp), "-filter_complex",
                f"[0:v]{','.join(vf)}[v];[v][1:v]overlay=0:0,format=yuv420p[o]", "-map", "[o]"]
    else:
        cmd += ["-vf", ",".join(vf)]
    cmd += ["-frames:v", str(n), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-r", str(fps), str(out)]
    run(cmd)
    return out


def main() -> None:
    import argparse
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--voice", help="override 'voice' (path relative to project.json)")
    ap.add_argument("--output", help="override 'output'")
    a = ap.parse_args()
    pfile = Path(a.project).resolve()
    base = pfile.parent
    cfg = {"width": 1080, "height": 1920, "fps": 30, "music_volume": 0.18,
           "loudness": -14, **json.loads(pfile.read_text(encoding="utf-8"))}
    if a.voice:
        cfg["voice"] = a.voice
    if a.output:
        cfg["output"] = a.output
    font = find_font(cfg.get("font"))
    tmp = Path(tempfile.mkdtemp(prefix="render_"))
    try:
        clock = None
        clips = []
        for i, sc in enumerate(cfg["scenes"]):
            clock = sc.get("clock", clock)
            sc["_clock"] = clock
            clips.append(scene_clip(sc, i, cfg, base, tmp, font))
            print(f"scene {i+1}/{len(cfg['scenes'])}: {sc['image']} ({sc['duration']}s)")
        total = sum(float(s["duration"]) for s in cfg["scenes"])

        lst = tmp / "list.txt"
        lst.write_text("".join(f"file '{c}'\n" for c in clips))
        video = tmp / "video.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
             "-c", "copy", str(video)])

        # ---- audio graph ----
        inputs = ["-i", str(video)]
        parts, labels = [], []
        idx = 1
        if cfg.get("voice"):
            inputs += ["-i", str(base / cfg["voice"])]
            parts.append(f"[{idx}:a]aresample=48000,volume=1.0[voice]")
            labels.append("[voice]")
            idx += 1
        if cfg.get("music"):
            inputs += ["-stream_loop", "-1", "-i", str(base / cfg["music"])]
            parts.append(f"[{idx}:a]aresample=48000,volume={cfg['music_volume']},"
                         f"atrim=0:{total},afade=t=out:st={max(total-2,0)}:d=2[music]")
            labels.append("[music]")
            idx += 1
        for k, sfx in enumerate(cfg.get("sfx", [])):
            inputs += ["-i", str(base / sfx["file"])]
            ms = int(float(sfx["at"]) * 1000)
            parts.append(f"[{idx}:a]aresample=48000,volume={sfx.get('volume', 0.8)},"
                         f"adelay={ms}|{ms}[s{k}]")
            labels.append(f"[s{k}]")
            idx += 1

        vf = []
        if cfg.get("captions"):
            ass = str(base / cfg["captions"]).replace("\\", "/").replace(":", "\\:")
            fdir = cfg.get("fonts_dir", str(Path(__file__).resolve().parent.parent / "fonts"))
            vf.append(f"subtitles='{ass}':fontsdir='{fdir}'")
        out = base / cfg.get("output", "output.mp4")
        out.parent.mkdir(parents=True, exist_ok=True)
        cmd = ["ffmpeg", "-y", "-v", "error", *inputs]
        if labels:
            # pass 1: mix to wav and measure loudness
            mixwav = tmp / "mix.wav"
            mix = (f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=longest,"
                   f"atrim=0:{total}[a]")
            run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex",
                 ";".join(parts + [mix]), "-map", "[a]", str(mixwav)])
            target = f"I={cfg['loudness']}:TP=-1.0:LRA=11"
            r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mixwav), "-af",
                                f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                               capture_output=True, text=True)
            m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
            ln = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                  f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
                  f"offset={m['target_offset']}:linear=true,aresample=48000")
            # pass 2: video + normalised audio
            cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(video), "-i", str(mixwav)]
            fc = f"[1:a]{ln}[a]"
            if vf:
                fc += f";[0:v]{','.join(vf)}[v]"
                cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]"]
            else:
                cmd += ["-filter_complex", fc, "-map", "0:v", "-map", "[a]"]
            cmd += ["-c:a", "aac", "-b:a", "192k"]
        elif vf:
            cmd += ["-vf", ",".join(vf)]
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", "-t", f"{total}", str(out)]
        run(cmd)
        print(f"done -> {out} ({total:.1f}s)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
