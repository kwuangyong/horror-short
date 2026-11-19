#!/usr/bin/env python3
"""Infographic cards in the reference style (flat, dark, red accents), 1080x1920 PNG.
Optionally composited on top of a scene image (--bg).

    python tools/make_cards.py hook   "ONLY 4% CHOOSE RIGHT" -o hook.png --bg scene.png
    python tools/make_cards.py rule   "NEVER ANSWER" --label "RULE 1" -o rule1.png
    python tools/make_cards.py trick  "SOUNDS FAR" "SHE IS CLOSE" -o trick.png
    python tools/make_cards.py choice "OPEN THE DOOR" "STAY QUIET" --countdown 5 -o choice.png
         -> choice_5.png ... choice_0.png (one per second)
    python tools/make_cards.py stamp  "OPEN THE DOOR" "STAY QUIET" --pick A -o pickA.png
    python tools/make_cards.py word   "YOUR TURN." -o end.png
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from common import BLACK, COLD_BLUE, RED, WHITE, find_font

W, H = 1080, 1920
FONT = None


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size)


def base(bg: str | None, darken: int = 150) -> Image.Image:
    if bg:
        img = Image.open(bg).convert("RGB")
        scale = max(W / img.width, H / img.height)
        img = img.resize((round(img.width * scale), round(img.height * scale)))
        l, t = (img.width - W) // 2, (img.height - H) // 2
        img = img.crop((l, t, l + W, t + H)).convert("RGBA")
    else:
        img = Image.new("RGBA", (W, H), BLACK + (255,))
    img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, darken)))
    return img


def fit(draw, text, max_w, start, min_size=40):
    s = start
    while s > min_size and draw.textlength(text, font=font(s)) > max_w:
        s -= 4
    return font(s)


def ctext(draw, y, text, f, fill, shadow=True):
    w = draw.textlength(text, font=f)
    x = (W - w) / 2
    if shadow:
        draw.text((x + 4, y + 5), text, font=f, fill=(0, 0, 0, 200))
    draw.text((x, y), text, font=f, fill=fill)


def wrap(draw, text, max_w, f):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if draw.textlength(t, font=f) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = word
    return lines + [cur]


def panel(img, box, fill, outline=None, width=6, radius=18):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def card_hook(a):
    img = base(a.bg, 120)
    d = ImageDraw.Draw(img)
    f = font(150)
    lines = wrap(d, a.text[0].upper(), W - 120, f)
    y = H * 0.36 - len(lines) * 85
    for i, line in enumerate(lines):
        words = line.split()
        # last word of the hook in red for punch
        x_total = d.textlength(line, font=f)
        x = (W - x_total) / 2
        for j, w in enumerate(words):
            col = RED if (i == len(lines) - 1 and j == len(words) - 1) or any(c.isdigit() for c in w) else WHITE
            d.text((x + 5, y + 6), w, font=f, fill=(0, 0, 0, 220))
            d.text((x, y), w, font=f, fill=col)
            x += d.textlength(w + " ", font=f)
        y += 170
    return img


def card_rule(a):
    img = base(a.bg, 110)
    d = ImageDraw.Draw(img)
    box = (110, 560, W - 110, 860)
    panel(img, box, (14, 16, 24, 235), (70, 70, 85), 4)
    ctext(d, 600, (a.label or "RULE 1").upper(), font(44), RED, False)
    f = fit(d, a.text[0].upper(), W - 300, 120)
    ctext(d, 680, a.text[0].upper(), f, WHITE)
    return img


def card_trick(a):
    img = base(a.bg, 150)
    d = ImageDraw.Draw(img)
    panel(img, (100, 480, W - 100, 1020), (14, 16, 24, 235), (70, 70, 85), 4)
    ctext(d, 520, (a.label or "THE TRICK").upper(), font(40), (160, 160, 170), False)
    ctext(d, 610, a.text[0].upper(), fit(d, a.text[0].upper(), W - 300, 90), WHITE)
    ctext(d, 720, "↓", font(80), (200, 200, 210), False)
    panel(img, (170, 840, W - 170, 970), (60, 8, 14, 255), RED, 6, 8)
    second = a.text[1].upper() if len(a.text) > 1 else ""
    ctext(d, 860, second, fit(d, second, W - 420, 90), RED, False)
    return img


def _choice(a, number=None, pick=None):
    img = base(a.bg, 90)
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(over)
    # panels end above ~66% height so the captions (at ~70%) stay readable
    top = (370, 770)           # A panel y-range
    bot = (810, 1210)          # B panel y-range
    colA = RED + (230,) if pick in (None, "A") else (40, 20, 24, 200)
    colB = COLD_BLUE + (230,) if pick in (None, "B") else (20, 26, 40, 200)
    od.rounded_rectangle((70, top[0], W - 70, top[1]), 28, fill=colA)
    od.rounded_rectangle((70, bot[0], W - 70, bot[1]), 28, fill=colB)
    img.alpha_composite(over)
    d = ImageDraw.Draw(img)
    ctext(d, 215, (a.label or "CHOOSE.").upper(), font(120), WHITE)
    for letter, text, (y0, y1) in (("A", a.text[0], top), ("B", a.text[1], bot)):
        ctext(d, y0 + 20, letter, font(170), WHITE)
        f = font(76)
        lines = wrap(d, text.upper(), W - 240, f)
        y = y0 + 240 if len(lines) < 2 else y0 + 215
        for line in lines[:2]:
            ctext(d, y, line, fit(d, line, W - 240, 76), WHITE)
            y += 88
    if number is not None:
        cx, cy, r = W // 2, (top[1] + bot[0]) // 2, 105
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=BLACK, outline=WHITE, width=10)
        f = font(130)
        s = str(number)
        tw = d.textlength(s, font=f)
        bb = d.textbbox((0, 0), s, font=f)
        d.text((cx - tw / 2, cy - (bb[1] + bb[3]) / 2), s, font=f, fill=RED if number <= 2 else WHITE)
    if pick:
        # rubber stamp over the chosen panel
        y0, y1 = top if pick == "A" else bot
        # dim the panel text so the stamp reads clearly
        img.alpha_composite(Image.new("RGBA", (W - 140, y1 - y0), (0, 0, 0, 110)), (70, y0))
        stamp = Image.new("RGBA", (620, 240), (0, 0, 0, 0))
        sd = ImageDraw.Draw(stamp)
        sd.rounded_rectangle((10, 10, 610, 230), 20, fill=(0, 0, 0, 120), outline=WHITE, width=14)
        txt = f"{a.stamp_word} {pick}".strip()
        f = fit(sd, txt, 540, 130)
        tw = sd.textlength(txt, font=f)
        bb = sd.textbbox((0, 0), txt, font=f)
        sd.text(((620 - tw) / 2, (240 - (bb[1] + bb[3])) / 2), txt, font=f, fill=WHITE)
        stamp = stamp.rotate(-10, expand=True, resample=Image.BICUBIC)
        img.alpha_composite(stamp, ((W - stamp.width) // 2, (y0 + y1) // 2 - stamp.height // 2))
    return img


def card_word(a):
    img = base(a.bg, 255 if not a.bg else 200)
    d = ImageDraw.Draw(img)
    t = a.text[0].upper()
    f = fit(d, t, W - 160, 220)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    tw = gd.textlength(t, font=f)
    gd.text(((W - tw) / 2, H * 0.42), t, font=f, fill=RED + (200,))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(28)))
    ctext(d, H * 0.42, t, f, RED, False)
    return img


def main() -> None:
    global FONT
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", choices=["hook", "rule", "trick", "choice", "stamp", "word"])
    ap.add_argument("text", nargs="+")
    ap.add_argument("-o", "--output", required=True)
    ap.add_argument("--label")
    ap.add_argument("--bg", help="scene image to put the card on")
    ap.add_argument("--countdown", type=int, help="choice: write N..0 numbered frames")
    ap.add_argument("--pick", choices=["A", "B"], help="stamp: which side was chosen")
    ap.add_argument("--stamp-word", default="YOU CHOSE", help="stamp: text before A/B")
    ap.add_argument("--font")
    a = ap.parse_args()
    FONT = find_font(a.font)
    out = Path(a.output)

    if a.kind in ("choice", "stamp") and len(a.text) < 2:
        raise SystemExit("choice/stamp need two texts: A and B")
    if a.kind == "choice" and a.countdown is not None:
        for n in range(a.countdown, -1, -1):
            p = out.with_name(f"{out.stem}_{n}{out.suffix}")
            _choice(a, number=n).convert("RGB").save(p)
            print(p)
        return
    img = {
        "hook": card_hook, "rule": card_rule, "trick": card_trick, "word": card_word,
        "choice": lambda x: _choice(x), "stamp": lambda x: _choice(x, pick=x.pick or "A"),
    }[a.kind](a)
    img.convert("RGB").save(out)
    print(out)


if __name__ == "__main__":
    main()
