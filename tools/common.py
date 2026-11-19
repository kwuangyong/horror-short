"""Shared helpers: fonts, colors, script parsing."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Brand palette (flat-vector horror look of the reference video)
RED = (227, 38, 47)
NAVY = (27, 33, 64)
NAVY_2 = (42, 49, 89)
WINE = (90, 26, 46)
COLD_BLUE = (40, 110, 190)
WHITE = (245, 242, 235)
BLACK = (10, 10, 14)

# Condensed bold fonts first (put .ttf files into ./fonts), then system fallbacks.
FONT_CANDIDATES = [
    "Oswald-Bold.ttf", "Oswald-VariableFont_wght.ttf", "Anton-Regular.ttf",
    "BebasNeue-Regular.ttf",
    "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf",
    "/usr/share/fonts/opentype/inter/Inter-Black.otf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def find_font(explicit: str | None = None) -> str:
    cands = [explicit] if explicit else []
    cands += FONT_CANDIDATES
    for c in cands:
        if not c:
            continue
        for p in (Path(c), ROOT / "fonts" / c):
            if p.is_file():
                return str(p)
    raise SystemExit("No usable font found. Put Oswald-Bold.ttf into ./fonts or pass --font.")


def norm(word: str) -> str:
    """Lowercase, strip punctuation, keep Vietnamese diacritics."""
    w = unicodedata.normalize("NFC", word).lower()
    return re.sub(r"[^\w]", "", w)


def script_tokens(text: str) -> list[tuple[str, bool]]:
    """Narration words in order, each flagged True if it sat inside *asterisks*."""
    toks: list[tuple[str, bool]] = []
    for line in narration_lines(text, keep_marks=True):
        for i, part in enumerate(re.split(r"\*", line)):
            for w in part.split():
                if toks and not norm(w):          # lone punctuation -> glue to previous
                    toks[-1] = (toks[-1][0] + w, toks[-1][1])
                else:
                    toks.append((w, i % 2 == 1))
    return toks


def narration_lines(text: str, keep_marks: bool = False) -> list[str]:
    """Narration = lines starting with '>' (blockquote) in the script markdown.
    Lines inside the header notes (starting with '> Truyền thuyết', etc.) are skipped
    if they appear before the first '## ' heading."""
    out, started = [], False
    for line in text.splitlines():
        if line.startswith("## "):
            started = True
        if started and line.startswith(">"):
            clean = line.lstrip("> ").strip()
            clean = re.sub(r"\([^)]*\)\s*", "", clean).strip()   # (delivery notes)
            if not keep_marks:
                clean = clean.replace("*", "")
            if clean:
                out.append(clean)
    return out
