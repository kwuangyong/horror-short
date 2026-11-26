#!/usr/bin/env python3
"""Generate offline English horror narration using Kokoro-82M (ONNX).

Default voice: 60% am_onyx + 40% bm_george (deep US + cold UK blend).

Usage:
    python tools/tts_kokoro.py voice.txt -o voice.wav
    python tools/tts_kokoro.py voice.txt -o voice_dark.wav --fx deep
    python tools/tts_kokoro.py --text "At the end, you choose." -o test.mp3
"""
import argparse
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
DEFAULT_VOICE = "am_onyx:0.6,bm_george:0.4"
DEFAULT_CACHE = Path.home() / ".cache" / "horror-short" / "kokoro"


def ensure_file(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {dest.name} -> {dest} ...", file=sys.stderr)
    tmp = dest.with_suffix(dest.suffix + ".part")
    urllib.request.urlretrieve(url, tmp)
    tmp.replace(dest)
    return dest


def resolve_voice(kokoro: Kokoro, voice_spec: str):
    """Parse either a single voice name ('am_onyx') or a blend ('am_onyx:0.6,bm_george:0.4')."""
    parts = [p.strip() for p in voice_spec.split(",") if p.strip()]
    if len(parts) == 1 and ":" not in parts[0]:
        return parts[0]

    blended = None
    total_w = 0.0
    for part in parts:
        if ":" in part:
            name, w_str = part.split(":", 1)
            weight = float(w_str)
        else:
            name, weight = part, 1.0
        vec = kokoro.get_voice_style(name.strip())
        blended = vec * weight if blended is None else blended + vec * weight
        total_w += weight

    if total_w <= 0:
        raise ValueError(f"Invalid voice weights in '{voice_spec}'")
    return (blended / total_w).astype(np.float32)


def synthesize_text(kokoro: Kokoro, text: str, voice, speed: float, lang: str, pause_sec: float = 0.35):
    paragraphs = [p.strip() for p in text.splitlines() if p.strip()]
    chunks = []
    sr = 24000
    for i, para in enumerate(paragraphs):
        audio, sr = kokoro.create(para, voice=voice, speed=speed, lang=lang)
        chunks.append(audio)
        if i < len(paragraphs) - 1 and pause_sec > 0:
            chunks.append(np.zeros(int(sr * pause_sec), dtype=np.float32))
    if not chunks:
        raise ValueError("Input text is empty.")
    return np.concatenate(chunks), sr


def main():
    ap = argparse.ArgumentParser(description="Offline horror TTS using Kokoro-82M (ONNX)")
    ap.add_argument("input", nargs="?", help="Input text file (e.g. voice.txt)")
    ap.add_argument("--text", help="Direct text input instead of file")
    ap.add_argument("-o", "--output", required=True, help="Output audio path (.wav or .mp3)")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help=f"Voice or blend (default: {DEFAULT_VOICE})")
    ap.add_argument("--speed", type=float, default=0.86, help="Speaking speed (default: 0.86)")
    ap.add_argument("--lang", default="en-us", help="Phonemizer language (default: en-us)")
    ap.add_argument("--pause", type=float, default=0.35, help="Pause in seconds between lines (default: 0.35)")
    ap.add_argument("--fx", choices=["deep", "demon", "whisper", "radio"], help="Apply tools/voice_fx.sh preset")
    ap.add_argument("--cache-dir", default=str(DEFAULT_CACHE), help="Directory for Kokoro ONNX model files")
    args = ap.parse_args()

    if args.text:
        text = args.text
    elif args.input:
        text = Path(args.input).read_text(encoding="utf-8")
    else:
        ap.error("Provide an input text file or --text")

    cache = Path(args.cache_dir)
    model_path = ensure_file(MODEL_URL, cache / "kokoro-v1.0.onnx")
    voices_path = ensure_file(VOICES_URL, cache / "voices-v1.0.bin")

    kokoro = Kokoro(str(model_path), str(voices_path))
    voice = resolve_voice(kokoro, args.voice)
    audio, sr = synthesize_text(kokoro, text, voice, args.speed, args.lang, args.pause)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        raw_wav = Path(td) / "raw.wav"
        sf.write(str(raw_wav), audio, sr)

        final_wav = raw_wav
        if args.fx:
            voice_fx = Path(__file__).resolve().parent / "voice_fx.sh"
            fx_wav = Path(td) / "fx.wav"
            subprocess.run(["bash", str(voice_fx), str(raw_wav), str(fx_wav), args.fx], check=True)
            final_wav = fx_wav

        if out_path.suffix.lower() == ".mp3":
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(final_wav), "-b:a", "192k", str(out_path)],
                check=True,
            )
        else:
            out_path.write_bytes(final_wav.read_bytes())

    print(f"-> {out_path} ({args.voice}, speed={args.speed}" + (f", fx={args.fx})" if args.fx else ")"))


if __name__ == "__main__":
    main()
