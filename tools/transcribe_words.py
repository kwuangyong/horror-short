#!/usr/bin/env python3
"""Word-level timestamps from a voice-over using faster-whisper.

    pip install faster-whisper
    python tools/transcribe_words.py voice.mp3 -o words.json [--lang vi] [--model small]

Output: [{"word": "Đồng", "start": 0.12, "end": 0.40}, ...]
"""
import argparse
import json

from faster_whisper import WhisperModel


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("-o", "--output", default="words.json")
    ap.add_argument("--model", default="small", help="tiny/base/small/medium/large-v3")
    ap.add_argument("--lang", default=None, help="vi, en, ... (auto if omitted)")
    a = ap.parse_args()

    model = WhisperModel(a.model, device="auto", compute_type="int8")
    segments, info = model.transcribe(a.audio, language=a.lang, word_timestamps=True,
                                      vad_filter=True)
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({"word": w.word.strip(), "start": round(w.start, 3),
                          "end": round(w.end, 3)})
    with open(a.output, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=1)
    print(f"{len(words)} words, language={info.language} -> {a.output}")


if __name__ == "__main__":
    main()
