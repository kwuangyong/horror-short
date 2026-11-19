#!/usr/bin/env python3
"""Draw a few flat-vector scenes for the 10-second preview (no external art needed).

    python examples/ma-da/draw_scenes.py examples/ma-da/build/art
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "build/art")
OUT.mkdir(parents=True, exist_ok=True)
random.seed(7)


def vgrad(top, bottom, h=H):
    img = Image.new("RGB", (W, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return img.convert("RGBA")


def glow(img, xy, r, color, blur):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r), fill=color)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def vignette(img, strength=200):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse((-250, -150, W + 250, H + 150), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(220))
    dark = Image.new("RGBA", img.size, (0, 0, 0, strength))
    dark.putalpha(Image.eval(mask, lambda v: int(strength * (1 - v / 255))))
    img.alpha_composite(dark)


# ---------------------------------------------------------------- house on the river
def house():
    img = vgrad((14, 18, 40), (34, 42, 80), 1250)
    full = Image.new("RGBA", (W, H))
    full.alpha_composite(img)
    d = ImageDraw.Draw(full)
    for _ in range(90):
        x, y = random.randint(0, W), random.randint(0, 900)
        r = random.choice([1, 1, 2])
        d.ellipse((x, y, x + r, y + r), fill=(220, 225, 255, random.randint(80, 200)))
    glow(full, (790, 420), 170, (200, 210, 255, 70), 60)
    d.ellipse((720, 350, 860, 490), fill=(236, 233, 214))
    # far tree line
    pts = [(0, 1150)]
    for x in range(0, W + 60, 60):
        pts.append((x, 1080 - random.randint(0, 70)))
    pts += [(W, 1250), (0, 1250)]
    d.polygon(pts, fill=(12, 16, 30))
    # river
    river = vgrad((18, 24, 48), (6, 8, 18), H - 1250)
    full.alpha_composite(river, (0, 1250))
    for i in range(26):
        y = 1270 + i * 24
        w = 160 - i * 4
        d.rounded_rectangle((790 - w, y, 790 + w, y + 5), 3, fill=(200, 205, 230, 90 - i * 3))
    for _ in range(40):
        x, y = random.randint(0, W), random.randint(1300, H)
        d.line((x, y, x + random.randint(30, 90), y), fill=(60, 70, 110, 120), width=3)
    # stilt house
    for sx in (330, 430, 560, 690, 760):
        d.rectangle((sx, 1120, sx + 14, 1330), fill=(26, 18, 22))
    d.rectangle((280, 1110, 820, 1135), fill=(40, 28, 30))            # deck
    d.rectangle((310, 880, 790, 1115), fill=(66, 44, 40))             # wall
    for x in range(310, 790, 40):
        d.line((x, 880, x, 1115), fill=(56, 36, 34), width=3)
    d.polygon([(250, 900), (550, 700), (850, 900)], fill=(38, 26, 30))  # roof
    glow(full, (640, 980), 120, (255, 180, 80, 90), 50)
    d.rectangle((590, 930, 690, 1030), fill=(255, 196, 102))          # lit window
    d.line((640, 930, 640, 1030), fill=(66, 44, 40), width=6)
    d.line((590, 980, 690, 980), fill=(66, 44, 40), width=6)
    d.rectangle((380, 960, 470, 1110), fill=(28, 20, 22))             # door
    # head in the water
    d.ellipse((150, 1440, 230, 1500), fill=(10, 10, 14))
    d.rectangle((150, 1470, 230, 1500), fill=(10, 12, 24))
    vignette(full, 170)
    full.convert("RGB").save(OUT / "house.png")


# ---------------------------------------------------------------- empty mat + wet footprints
def empty_mat():
    full = vgrad((40, 22, 30), (18, 10, 16))
    d = ImageDraw.Draw(full)
    for y in range(0, H, 90):                                          # floorboards
        d.line((0, y, W, y), fill=(30, 16, 22), width=4)
    d.rounded_rectangle((180, 380, 900, 1250), 24, fill=(110, 36, 56))  # mat
    for y in range(400, 1240, 36):
        d.line((200, y, 880, y), fill=(96, 30, 48), width=6)
    d.rounded_rectangle((300, 420, 780, 600), 60, fill=(210, 205, 196))  # pillow
    d.ellipse((440, 470, 640, 560), fill=(176, 170, 162))                # dent
    d.polygon([(180, 820), (900, 760), (900, 1250), (180, 1250)], fill=(80, 70, 110))  # blanket
    for x in range(200, 900, 60):
        for y in range(830, 1240, 60):
            d.ellipse((x, y, x + 8, y + 8), fill=(120, 110, 150))
    # wet footprints leading to the mat
    for i, (x, y) in enumerate([(520, 1850), (600, 1730), (500, 1610), (590, 1490), (510, 1370)]):
        d.ellipse((x, y, x + 60, y + 100), fill=(60, 90, 120, 220))
        for t in range(5):
            d.ellipse((x + 4 + t * 11, y - 22, x + 16 + t * 11, y - 8), fill=(60, 90, 120, 220))
        d.ellipse((x + 10, y + 105, x + 50, y + 125), fill=(60, 90, 120, 120))
    vignette(full, 210)
    full.convert("RGB").save(OUT / "empty-mat.png")


# ---------------------------------------------------------------- the wet kid at the door
def wet_kid():
    full = vgrad((26, 20, 26), (12, 10, 14))
    d = ImageDraw.Draw(full)
    for x in range(0, W, 70):
        d.line((x, 0, x, H), fill=(20, 15, 20), width=5)
    d.rectangle((300, 320, 780, 1560), fill=(40, 30, 32))              # door frame
    outside = vgrad((30, 44, 80), (10, 16, 34), 1180)
    full.alpha_composite(outside.crop((0, 0, 420, 1180)), (330, 350))
    glow(full, (540, 700), 220, (120, 150, 220, 60), 90)
    # kid silhouette
    body = (200, 214, 222)
    d.rounded_rectangle((455, 900, 625, 1300), 50, fill=body)                 # torso
    d.rectangle((475, 1280, 520, 1500), fill=body)
    d.rectangle((560, 1280, 605, 1500), fill=body)
    d.rectangle((420, 930, 460, 1210), fill=body)
    d.rectangle((620, 930, 660, 1210), fill=body)
    d.ellipse((470, 700, 610, 870), fill=body)                                 # head
    d.polygon([(458, 720), (622, 720), (640, 1010), (440, 1010)], fill=(14, 14, 18))  # wet hair
    for x in range(450, 640, 26):                                              # drips
        L = random.randint(40, 160)
        d.line((x, 1010, x, 1010 + L), fill=(14, 14, 18), width=6)
    for _ in range(26):
        x, y = random.randint(440, 660), random.randint(1000, 1530)
        d.ellipse((x, y, x + 8, y + 16), fill=(150, 190, 230, 200))
    d.ellipse((380, 1480, 720, 1580), fill=(50, 80, 120, 200))                 # puddle
    vignette(full, 220)
    full.convert("RGB").save(OUT / "wet-kid.png")


# ---------------------------------------------------------------- drowned face (jumpscare)
def face():
    full = vgrad((40, 6, 12), (8, 2, 4))
    d = ImageDraw.Draw(full)
    glow(full, (540, 820), 420, (230, 230, 220, 60), 120)
    d.ellipse((190, 420, 890, 1260), fill=(205, 214, 206))                     # bloated face
    d.polygon([(170, 420), (910, 420), (980, 1500), (100, 1500)], fill=(10, 10, 12))
    d.ellipse((230, 520, 850, 1260), fill=(205, 214, 206))
    for cx in (400, 680):                                                      # milky eyes
        d.ellipse((cx - 85, 720, cx + 85, 840), fill=(240, 242, 236))
        d.ellipse((cx - 30, 755, cx + 30, 805), fill=(200, 205, 200))
        d.arc((cx - 95, 700, cx + 95, 860), 200, 340, fill=(60, 70, 70), width=8)
    d.chord((330, 930, 750, 1160), 10, 170, fill=(20, 8, 10))                  # smile
    for x in range(360, 730, 34):
        d.rectangle((x, 1000, x + 22, 1040), fill=(214, 208, 180))
    for x in range(260, 820, 48):
        d.line((x, 1260, x + random.randint(-10, 10), 1260 + random.randint(60, 200)),
               fill=(10, 10, 12), width=10)
    vignette(full, 230)
    full.convert("RGB").save(OUT / "face.png")


house(); empty_mat(); wet_kid(); face()
print("art ->", OUT)
