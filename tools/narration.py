#!/usr/bin/env python3
"""Export the narration from a script.md for text-to-speech.

    python tools/narration.py episodes/<slug>/script-anim.md            # plain text
    python tools/narration.py episodes/<slug>/script-anim.md --elevenlabs # ElevenLabs v3 audio tags

Plain mode drops delivery notes "(whisper, slow)" and the *keyword* marks, and puts each
sentence on its own line (most TTS engines pause at line breaks).
--elevenlabs turns delivery notes into audio tags, e.g. (whisper) -> [whispers],
(beat) -> [pause]. Lines marked "(child's voice ...)" are listed separately so you can
record them with a second voice.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

TAGS = {
    "whisper": "[whispers]", "beat": "[pause]", "slow": "[slowly]", "crying": "[crying]",
    "flatter": "[flatly]", "growl": "[growls]", "laugh": "[sinister laugh]",
}


def lines_with_notes(text: str):
    started = False
    for line in text.splitlines():
        if line.startswith("## "):
            started = True
        if started and line.startswith(">"):
            yield line.lstrip("> ").strip()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--elevenlabs", action="store_true")
    ap.add_argument("-o", "--output", help="write to file instead of stdout")
    a = ap.parse_args()

    narrator, other = [], []
    for raw in lines_with_notes(Path(a.script).read_text(encoding="utf-8")):
        notes = " ".join(re.findall(r"\(([^)]*)\)", raw)).lower()
        body = re.sub(r"\([^)]*\)\s*", "", raw).replace("*", "").strip()
        if not body:
            continue
        target = other if "voice" in notes else narrator
        if a.elevenlabs:
            tags = [t for k, t in TAGS.items() if k in notes]
            body = re.sub(r"\s*…\s*", "... ", body).strip()
            body = (" ".join(tags) + " " + body).strip()
        target.append(body)

    out = "\n".join(narrator)
    if other:
        out += "\n\n# --- Character lines (record with a second voice) ---\n" + "\n".join(other)
    if a.output:
        Path(a.output).write_text(out + "\n", encoding="utf-8")
        print(f"{len(narrator)} narrator lines, {len(other)} character lines -> {a.output}")
    else:
        print(out)


if __name__ == "__main__":
    main()
