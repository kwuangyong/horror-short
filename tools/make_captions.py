#!/usr/bin/env python3
"""Generate TikTok/Shorts-style captions (.ass): UPPERCASE condensed bold, 1-3 words per
chunk, keywords from the script (*word*) highlighted red, pop-in animation, placed at ~70%
of the frame height.

From real timings (recommended):
    python tools/make_captions.py words.json --script script.md -o captions.ass

Without a transcript (spreads narration evenly over a duration, for drafts):
    python tools/make_captions.py --script script.md --duration 95 -o captions.ass
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from common import narration_lines, norm, script_tokens

PUNCT_END = re.compile(r"[.,!?…:;]$")
DANGLING = {"the", "a", "an", "to", "of", "in", "on", "at", "for", "into", "and", "or", "but", "with",
            "its", "their", "them", "over", "from", "by"}


def line_end_indexes(script: str) -> set[int]:
    """Indexes (in script_tokens order) of the last token of every narration line (> line)."""
    ends, n = set(), 0
    for line in narration_lines(script, keep_marks=True):
        k = len(script_tokens("## x\n> " + line))
        n += k
        if k:
            ends.add(n - 1)
    return ends

RED_ASS = "&H002F26E3&"    # BGR of (227, 38, 47)
WHITE_ASS = "&H00EBF2F5&"


def ts(t: float) -> str:
    t = max(t, 0)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def even_words(tokens: list[tuple[str, bool]], duration: float, start: float = 0.0) -> list[dict]:
    weights = [len(w) + 2 for w, _ in tokens]
    total = sum(weights)
    t, out = start, []
    for (w, key), wt in zip(tokens, weights):
        d = duration * wt / total
        out.append({"word": w, "start": t, "end": t + d, "key": key})
        t += d
    return out


def align_keywords(words: list[dict], tokens: list[tuple[str, bool]], window: int = 6,
                   line_ends: set[int] | None = None) -> None:
    """Mark transcript words as keywords by aligning them, in order, with the script.
    Only the occurrence that was starred in the script is highlighted, not every repeat."""
    j = 0
    for w in words:
        w["key"] = False
        n = norm(w["word"])
        for k in range(j, min(j + window, len(tokens))):
            if norm(tokens[k][0]) == n:
                w["key"] = tokens[k][1]
                # sentence boundary known from the script (words.json has no punctuation)
                w["brk"] = bool(PUNCT_END.search(tokens[k][0])) or k in (line_ends or ())
                j = k + 1
                break


def chunk(words: list[dict], max_words: int, max_chars: int, gap: float) -> list[list[dict]]:
    chunks: list[list[dict]] = []
    cur: list[dict] = []
    for i, w in enumerate(words):
        if cur:
            text_len = sum(len(x["word"]) + 1 for x in cur) + len(w["word"])
            prev = cur[-1]
            hard = prev.get("brk") or PUNCT_END.search(prev["word"])
            if (len(cur) >= max_words or text_len > max_chars
                    or w["start"] - prev["end"] > gap or hard):
                if (not hard and len(cur) > 1 and norm(prev["word"]) in DANGLING):
                    cur.pop()                      # never leave "the/to/of..." hanging at chunk end
                    chunks.append(cur)
                    cur = [prev]
                else:
                    chunks.append(cur)
                    cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(words, width, height, font, size, max_words, max_chars, gap,
              ypos) -> str:
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},{size},{WHITE_ASS},{WHITE_ASS},&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,5,4,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    chunks = chunk(words, max_words, max_chars, gap)
    x, y = width // 2, int(height * ypos)
    lines = []
    for i, c in enumerate(chunks):
        start = c[0]["start"]
        nxt = chunks[i + 1][0]["start"] if i + 1 < len(chunks) else c[-1]["end"] + 0.5
        end = min(nxt, c[-1]["end"] + 0.6)
        parts = []
        for w in c:
            txt = re.sub(r"[\"“”]", "", w["word"]).upper()
            if w.get("key"):
                parts.append(f"{{\\c{RED_ASS}}}{txt}{{\\c{WHITE_ASS}}}")
            else:
                parts.append(txt)
        anim = f"{{\\pos({x},{y})\\fscx78\\fscy78\\t(0,90,\\fscx104\\fscy104)\\t(90,140,\\fscx100\\fscy100)}}"
        lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,,0,0,0,,{anim}{' '.join(parts)}")
    return header + "\n".join(lines) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("words", nargs="?", help="words.json from transcribe_words.py")
    ap.add_argument("--script", help="script markdown with *keywords* and > narration")
    ap.add_argument("--duration", type=float, help="spread narration evenly (no words.json)")
    ap.add_argument("--offset", type=float, default=0.0, help="start time for --duration mode")
    ap.add_argument("-o", "--output", default="captions.ass")
    ap.add_argument("--font", default="Oswald", help="font family name (installed or in fonts/)")
    ap.add_argument("--size", type=int, default=92)
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1920)
    ap.add_argument("--max-words", type=int, default=3)
    ap.add_argument("--max-chars", type=int, default=18)
    ap.add_argument("--gap", type=float, default=0.35, help="pause (s) that forces a new chunk")
    ap.add_argument("--ypos", type=float, default=0.70, help="vertical position 0..1")
    a = ap.parse_args()

    script = Path(a.script).read_text(encoding="utf-8") if a.script else ""
    tokens = script_tokens(script)
    if a.words:
        words = json.loads(Path(a.words).read_text(encoding="utf-8"))
        if tokens:                       # otherwise keep "key" flags from the json
            align_keywords(words, tokens, line_ends=line_end_indexes(script))
    elif a.duration and script:
        words = even_words(tokens, a.duration, a.offset)
    else:
        raise SystemExit("Give words.json, or --script with --duration.")

    ass = build_ass(words, a.width, a.height, a.font, a.size, a.max_words,
                    a.max_chars, a.gap, a.ypos)
    Path(a.output).write_text(ass, encoding="utf-8")
    print(f"{len(words)} words, {sum(1 for w in words if w.get('key'))} highlighted -> {a.output}")


if __name__ == "__main__":
    main()
