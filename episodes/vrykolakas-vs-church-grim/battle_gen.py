#!/usr/bin/env python3
"""Generator for the BATTLE draft: placeholder art + HUD + cards + synthetic audio + project-battle.json.
Called by build-battle.sh. Output in build/battle/. Does not touch the previous (dual) build."""
import json, math, os, random, re, subprocess, sys, glob, shutil
sys.path.insert(0, os.environ["TOOLS"])
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from common import find_font, script_tokens
from make_captions import even_words

HERE, B = os.environ["HERE"], os.environ["B"]
W, H = 1080, 1920
FONT = find_font()
F = lambda s: ImageFont.truetype(FONT, s)
RED, WHITE = (227, 38, 47), (245, 242, 235)
GOLD = (232, 190, 90)
random.seed(7)

# ---------------------------------------------------------------- drawing helpers
def ctext(d, y, t, f, fill, x=None):
    w = d.textlength(t, font=f); x = (W - w) / 2 if x is None else x
    d.text((x + 4, y + 5), t, font=f, fill=(0, 0, 0, 220)); d.text((x, y), t, font=f, fill=fill)
def fit(d, t, mw, s):
    while s > 36 and d.textlength(t, font=F(s)) > mw: s -= 4
    return F(s)
def vignette(img):
    v = Image.new("L", (W, H), 0); ImageDraw.Draw(v).ellipse((-300, -200, W + 300, H + 200), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(220))
    return Image.composite(img, Image.new("RGB", (W, H), (0, 0, 0)), v)

# simple geometric sprites (placeholders) -------------------------------------------------
def kid(d, x, y, s=1.0, lying=False, flash=False):
    """x,y = feet centre. grey pajamas, red scarf, hood, big flashlight."""
    if lying:
        d.rounded_rectangle((x - 90*s, y - 40*s, x + 40*s, y), 18*s, fill=(150, 150, 160))
        d.ellipse((x + 30*s, y - 55*s, x + 90*s, y + 5*s), fill=(230, 215, 200))
        d.polygon([(x + 30*s, y - 50*s), (x + 70*s, y - 90*s), (x + 90*s, y - 40*s)], fill=(150, 150, 160))
        d.rectangle((x + 20*s, y - 30*s, x + 45*s, y - 10*s), fill=RED)
        d.polygon([(x - 90*s, y - 35*s), (x - 160*s, y - 55*s), (x - 150*s, y - 20*s)], fill=RED)
        return
    d.rounded_rectangle((x - 30*s, y - 110*s, x + 30*s, y), 14*s, fill=(150, 150, 160))
    d.ellipse((x - 28*s, y - 160*s, x + 28*s, y - 104*s), fill=(230, 215, 200))
    d.polygon([(x - 34*s, y - 140*s), (x, y - 205*s), (x + 34*s, y - 140*s)], fill=(150, 150, 160))
    d.rectangle((x - 34*s, y - 112*s, x + 34*s, y - 94*s), fill=RED)
    d.polygon([(x + 20*s, y - 105*s), (x + 55*s, y - 60*s), (x + 40*s, y - 50*s)], fill=RED)
    d.rounded_rectangle((x + 20*s, y - 85*s, x + 75*s, y - 60*s), 6*s, fill=(70, 70, 80))
    if flash:
        d.polygon([(x + 75*s, y - 72*s), (x + 520*s, y - 190*s), (x + 520*s, y + 60*s)], fill=(255, 245, 190, 110))
def vry(d, x, y, s=1.0, claws=True, face=(150, 190, 150)):
    d.rounded_rectangle((x - 45*s, y - 300*s, x + 45*s, y), 16*s, fill=(120, 150, 120))
    d.ellipse((x - 40*s, y - 380*s, x + 40*s, y - 300*s), fill=face)
    d.ellipse((x - 22*s, y - 355*s, x - 8*s, y - 340*s), fill=(10, 10, 10)); d.ellipse((x + 8*s, y - 355*s, x + 22*s, y - 340*s), fill=(10, 10, 10))
    if claws:
        d.line((x - 40*s, y - 270*s, x - 150*s, y - 360*s), fill=face, width=int(16*s)); d.line((x + 40*s, y - 270*s, x + 150*s, y - 360*s), fill=face, width=int(16*s))
        for sx in (-150, 150):
            for k in (-18, 0, 18): d.line((x + sx*s, y - 360*s, x + (sx + k)*s, y - 405*s), fill=(235, 235, 220), width=int(6*s))
def dog(d, x, y, s=1.0, facing=1):
    f = facing
    d.ellipse((x - 150*s, y - 150*s, x + 150*s, y), fill=(12, 12, 18))
    d.ellipse((x + f*100*s - 60*s, y - 190*s, x + f*100*s + 60*s, y - 90*s), fill=(12, 12, 18))
    d.polygon([(x + f*70*s, y - 190*s), (x + f*80*s, y - 245*s), (x + f*105*s, y - 190*s)], fill=(12, 12, 18))
    for dx in (-18, 22): d.ellipse((x + f*(100 + dx)*s - 11*s, y - 150*s - 11*s, x + f*(100 + dx)*s + 11*s, y - 150*s + 11*s), fill=(255, 40, 40))
    for lx in (-110, -50, 50, 110): d.rectangle((x + lx*s - 14*s, y - 20*s, x + lx*s + 14*s, y + 50*s), fill=(12, 12, 18))
def wall(d, y, gap=(380, 520), col=(70, 74, 86)):
    for x0 in range(0, W, 120):
        if gap[0] <= x0 < gap[1]: continue
        d.rectangle((x0 + 4, y - 90 - 20 * ((x0 // 120) % 2), x0 + 116, y + 40), fill=col)
def graves(d, y, xs=(120, 800, 930), col=(60, 64, 78)):
    for x in xs:
        d.rounded_rectangle((x - 45, y - 130, x + 45, y), 40, fill=col)
def trees(d, col=(8, 14, 22)):
    for x in (30, 200, 760, 960, 1040):
        d.rectangle((x - 22, 330, x + 22, 1500), fill=col)
        d.polygon([(x - 110, 700), (x, 330), (x + 110, 700)], fill=col)

# ---------------------------------------------------------------- base scene images
# each base: draw(d) callable; bg colour; label (placeholder tag, drawn only on the visible version)
BASES = {}
def base(name, col, label, fn=None, ground=1380):
    BASES[name] = (col, label, fn, ground)
def G(d, y=1380, col=(16, 26, 22)): d.rectangle((0, y, W, H), fill=col)

base("hook", (86, 12, 20), "FREEZE-FRAME ROUND 2 · KID DOWN OUTSIDE WALL · GRIM STUCK AT LINE", lambda d: (trees(d), wall(d, 1000, gap=(2000, 2001)), G(d, 1100, (40, 14, 20)), dog(d, 300, 1010, 1.4, 1), kid(d, 760, 1340, 1.4, lying=True), vry(d, 700, 1250, 1.0)))
base("kidcard", (30, 20, 34), "", lambda d: (kid(d, 540, 1180, 2.8, flash=False),))
base("window", (22, 30, 54), "KID CLIMBS OUT THE WINDOW · FIREFLY · MOON", lambda d: (d.ellipse((780, 380, 880, 480), fill=(235, 230, 200)), d.rectangle((120, 620, 520, 1250), fill=(210, 214, 224)), d.rectangle((220, 760, 420, 980), fill=(14, 20, 34)), kid(d, 330, 1000, 1.0), d.ellipse((640, 780, 664, 804), fill=(255, 240, 140))))
base("forest", (14, 28, 36), "KID FOLLOWS FIREFLY · RUINED CHURCHYARD WALL · NEW GRAVE", lambda d: (trees(d), G(d, 1300), wall(d, 1180), graves(d, 1180, (780, 900)), kid(d, 300, 1380, 1.0), d.ellipse((470, 900, 494, 924), fill=(255, 240, 140))))
base("grandma", (52, 46, 50), "FLASHBACK · GRANDMA ELENI · GARLIC · OIL LAMP + MATCHES", lambda d: (d.rounded_rectangle((220, 760, 560, 1380), 40, fill=(20, 20, 24)), d.ellipse((290, 650, 490, 850), fill=(200, 180, 160)), d.polygon([(280, 720), (390, 620), (500, 720)], fill=(14, 14, 18)), kid(d, 760, 1380, 1.3)))
base("rise", (24, 34, 30), "FRESH GRAVE CRACKS · VRYKOLAKAS CRAWLS OUT", lambda d: (trees(d), G(d, 1250, (30, 24, 22)), vry(d, 560, 1330, 0.9), kid(d, 230, 1500, 1.0)))
base("claw", (60, 24, 30), "CLAW MISSES SCARF · KID TUMBLES (NO INJURY)", lambda d: (trees(d), G(d, 1250), vry(d, 800, 1260, 1.0), kid(d, 300, 1330, 1.1, lying=True), d.line((560, 700, 330, 1000), fill=(255, 70, 70), width=14)))
base("grim", (22, 20, 40), "GRIM ON GRAVESTONE · RED EYES · SNARLS · KID PEEKS FROM WALL GAP", lambda d: (trees(d), wall(d, 1250, gap=(100, 250)), graves(d, 1250, (300,), (80, 86, 104)), dog(d, 700, 1180, 1.2, -1), kid(d, 170, 1330, 0.9)))
base("r1", (60, 40, 50), "ROUND 1 · GRIM SLAMS VRYKOLAKAS · KID HIDES BEHIND TOMBSTONE", lambda d: (graves(d, 1260, (150,)), vry(d, 700, 1340, 1.0, claws=False), dog(d, 560, 1180, 1.3, 1), kid(d, 120, 1330, 0.8)))
base("r2a", (50, 24, 36), "ROUND 2 · VRYKOLAKAS GRINS · HURLS KID OVER THE WALL", lambda d: (trees(d), wall(d, 1300), vry(d, 280, 1380, 1.0), kid(d, 760, 900, 1.0, lying=True), dog(d, 880, 1380, 0.9, -1)))
base("r2b", (70, 14, 24), "GRIM STOPS AT THE WALL LINE · KID DOWN · CLAWS RETURN", lambda d: (trees(d), wall(d, 1180, gap=(2000, 2001)), dog(d, 250, 1180, 1.2, 1), d.line((0, 1190, W, 1190), fill=(255, 240, 160), width=6), G(d, 1200, (36, 16, 22)), vry(d, 700, 1360, 1.1), kid(d, 880, 1500, 0.9, lying=True)))
base("crawl", (60, 16, 26), "KID CRAWLS ON GRASS · HAND IN POCKET · RED BAR NEARLY EMPTY", lambda d: (trees(d), G(d, 1250, (34, 18, 24)), kid(d, 520, 1450, 1.6, lying=True)))
base("crush", (90, 24, 36), "CLOSE-UP · SMALL HAND CRUSHES GARLIC", lambda d: (d.ellipse((330, 700, 750, 1120), fill=(235, 215, 190)), d.ellipse((470, 800, 610, 960), fill=(245, 245, 235)), d.rectangle((500, 1050, 600, 1250), fill=RED)))
base("throw", (66, 30, 40), "KID THROWS GARLIC DUST INTO VRYKOLAKAS FACE", lambda d: (trees(d), G(d, 1300), vry(d, 700, 1380, 1.2, claws=False), kid(d, 240, 1400, 1.1), d.ellipse((380, 900, 540, 1060), fill=(250, 250, 245))))
base("lure", (22, 24, 48), "FLASHLIGHT LURE · VRYKOLAKAS CHASES LIGHT · STEPS OVER WALL · GRIM WAITS", lambda d: (trees(d), G(d, 1300), wall(d, 1250, gap=(380, 520)), graves(d, 1250, (880,)), kid(d, 230, 1400, 1.1, flash=True), vry(d, 640, 1400, 1.0), dog(d, 920, 1250, 0.8, -1)))
base("pounce", (80, 16, 22), "GRIM POUNCES · JAWS ON NECK · VRYKOLAKAS DOWN", lambda d: (trees(d), G(d, 1300), vry(d, 500, 1400, 1.0, claws=False), dog(d, 700, 1230, 1.5, -1), kid(d, 130, 1400, 0.8)))
base("ko", (50, 10, 20), "K.O. · KID + GRIM STAND · VRYKOLAKAS COLLAPSED", lambda d: (trees(d), G(d, 1350), vry(d, 800, 1520, 0.8, claws=False), kid(d, 250, 1500, 1.0), dog(d, 520, 1500, 1.0, -1)))
base("dawn", (170, 104, 52), "DAWN · GRIM DRAGS BODY TO GRAVE · KID WALKS HOME WITH LAMP + MATCHES", lambda d: (d.ellipse((380, 700, 700, 1020), fill=(255, 190, 110)), G(d, 1300, (96, 70, 50)), graves(d, 1300, (150, 920)), dog(d, 650, 1380, 1.0, -1), kid(d, 230, 1450, 1.0), d.rectangle((900, 800, 980, 1300), fill=(130, 90, 70))))
base("cliff", (30, 36, 56), "CLOSE-UP · GRAVE SOIL BULGES · UNUSED MATCHBOX + LAMP BESIDE IT", lambda d: (G(d, 1180, (44, 34, 32)), d.ellipse((300, 1050, 780, 1330), fill=(58, 46, 40)), d.rectangle((830, 1260, 930, 1320), fill=(180, 60, 50)), d.rectangle((140, 1220, 200, 1320), fill=(150, 130, 70))))
base("cta", (12, 12, 18), "", None)
base("black", (0, 0, 0), "", None)

def make_base(name, with_label=True):
    col, label, fn, _ = BASES[name]
    img = Image.new("RGBA", (W, H), col + (255,)); d = ImageDraw.Draw(img, "RGBA")
    if fn: fn(d)
    img = vignette(img.convert("RGB")) if name != "black" else img.convert("RGB")
    if with_label and label:
        d = ImageDraw.Draw(img)
        # placeholder tag in the empty upper-middle band (below HUD bars, above caption band)
        words_, lines_, cur_ = label.split(" "), [], ""
        for w_ in words_:
            if len(cur_) + len(w_) + 1 > 40 and cur_: lines_.append(cur_); cur_ = w_
            else: cur_ = (cur_ + " " + w_).strip()
        lines_.append(cur_)
        for k_, ln_ in enumerate(lines_[:3]): ctext(d, 430 + 46 * k_, ln_, F(38), (210, 210, 210))
        ctext(d, 580, "[placeholder - replace with illustration]", F(28), (140, 140, 140))
    return img

def darken(img, amt=0.72, blur=7):
    img = img.filter(ImageFilter.GaussianBlur(blur))
    return Image.blend(img, Image.new("RGB", (W, H), (4, 4, 8)), amt)

# ---------------------------------------------------------------- HUD (3 health bars)
def bars(img, hud, ghost=None, blink=False):
    """hud = dict(kid=, grim=, vry=) values 0..100 (missing = hidden). ghost = previous values."""
    d = ImageDraw.Draw(img, "RGBA")
    rows = [("KID", "kid", (60, 200, 110)), ("GRIM", "grim", (235, 235, 240)), ("VRYKOLAKAS", "vry", (227, 38, 47))]
    x0, bw, bh, y = 50, 520, 26, 205
    for name, k, col in rows:
        if k not in hud: continue
        v = hud[k]; gv = (ghost or {}).get(k, v)
        c = col
        if k == "kid" and v <= 25: c = RED if not blink else (255, 255, 255)
        d.rounded_rectangle((x0 - 8, y - 4, x0 + 330 + bw + 18, y + bh + 6), 10, fill=(0, 0, 0, 150))
        d.text((x0, y - 2), name, font=F(24), fill=WHITE)
        bx = x0 + 215
        d.rectangle((bx, y, bx + bw - 215 + 100, y + bh), fill=(30, 30, 38), outline=(240, 240, 240), width=3)
        tw = bw - 215 + 100 - 6
        if gv > v: d.rectangle((bx + 3, y + 3, bx + 3 + tw * gv / 100, y + bh - 3), fill=(255, 230, 140))
        if v > 0: d.rectangle((bx + 3, y + 3, bx + 3 + tw * v / 100, y + bh - 3), fill=c)
        d.text((bx + tw + 14, y - 2), f"{v}%", font=F(24), fill=WHITE)
        y += 40
    return img

# ---------------------------------------------------------------- cards
def panel(img, box, outline, fill=(10, 12, 20, 232), width=6):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle(box, 20, fill=fill, outline=outline, width=width)
    img = img.convert("RGBA"); img.alpha_composite(ov); return img.convert("RGB")
def card_bg(name): return darken(make_base(name, False))

def c_kid():
    img = card_bg("kidcard"); d = ImageDraw.Draw(img)
    img = panel(img, (110, 380, W - 110, 760), (60, 200, 110)); d = ImageDraw.Draw(img)
    ctext(d, 410, "CHARACTER", F(46), (60, 200, 110)); ctext(d, 480, "THE KID", F(150), WHITE)
    ctext(d, 650, "HP 100%", F(60), WHITE)
    d.rectangle((200, 725, W - 200, 745), fill=(60, 200, 110))
    return img
def c_fighter(base_name, n, name, sub, col):
    img = card_bg(base_name)
    img = panel(img, (90, 340, W - 90, 800), col); d = ImageDraw.Draw(img)
    ctext(d, 375, f"FIGHTER {n}", fit(d, "x", 600, 56), col)
    ctext(d, 460, name, fit(d, name, W - 260, 140), WHITE)
    ctext(d, 630, sub, fit(d, sub, W - 260, 52), (205, 205, 215))
    return img
def stat_bar(d, y, label, a, b):
    ctext(d, y - 44, label, F(34), (200, 200, 210))
    for side, v, col in ((0, a, (227, 38, 47)), (1, b, (235, 235, 240))):
        x0 = 70 if side == 0 else 580; bw = 430
        d.rectangle((x0, y, x0 + bw, y + 28), fill=(30, 30, 38), outline=(200, 200, 210), width=3)
        d.rectangle((x0 + 3, y + 3, x0 + 3 + (bw - 6) * v / 100, y + 25), fill=col)
def c_vs(on):
    img = Image.new("RGB", (W, H), (14, 10, 20)); d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(0, 330), (W, 330), (0, 1220)], fill=(70, 16, 28)); d.polygon([(W, 330), (W, 1220), (0, 1220)], fill=(18, 22, 40))
    d.line((W, 330, 0, 1220), fill=RED, width=10)
    vry(d, 250, 880, 0.9, claws=False); dog(d, 800, 890, 0.95, -1)
    img = vignette(img); d = ImageDraw.Draw(img)
    ctext(d, 360, "VRYKOLAKAS", F(60), (190, 225, 190), x=60); ctext(d, 360, "GRIM", F(60), WHITE, x=W - 60 - d.textlength("GRIM", font=F(60)) - 90)
    d.polygon([(540, 440), (700, 720), (380, 720)], fill=RED, outline=WHITE); ctext(d, 540, "VS", F(120), WHITE)
    stat_bar(d, 1010, "POWER", 80, 70); stat_bar(d, 1090, "SPEED", 60, 85)
    stat_bar(d, 1170, "LORE", 95, 70)
    # the 'WHO WINS? COMMENT' text sits above the caption band (blinks red/white via two frames)
    img = panel(img, (110, 760, W - 110, 900), RED if on else WHITE, fill=(10, 10, 16, 235)); d = ImageDraw.Draw(img)
    ctext(d, 785, "WHO WINS? COMMENT", fit(d, "WHO WINS? COMMENT", W - 280, 84), RED if on else WHITE)
    return img
def c_round(n, name):
    img = card_bg(name); img = panel(img, (80, 540, W - 80, 960), RED, width=10); d = ImageDraw.Draw(img)
    ctext(d, 570, "ROUND", F(110), WHITE); ctext(d, 680, str(n), F(260), RED)
    return img
def c_rule(name):
    img = card_bg(name); img = panel(img, (70, 420, W - 70, 880), GOLD); d = ImageDraw.Draw(img)
    ctext(d, 450, "GRANDMA'S RULES", F(48), GOLD)
    ctext(d, 540, "GARLIC", fit(d, "x", 500, 130), WHITE); ctext(d, 665, "WEAKENS IT", F(80), (205, 205, 215))
    ctext(d, 770, "ONLY FIRE ENDS IT", fit(d, "ONLY FIRE ENDS IT", W - 200, 80), RED)
    return img
def c_limit(name):
    img = card_bg(name); img = panel(img, (70, 480, W - 70, 880), WHITE); d = ImageDraw.Draw(img)
    ctext(d, 510, "THE LIMIT", F(56), (205, 205, 215)); ctext(d, 590, "INSIDE THE WALL", fit(d, "INSIDE THE WALL", W - 200, 110), WHITE)
    ctext(d, 740, "ONLY", F(130), RED)
    return img
def c_hook(name):
    img = make_base(name, False); img = Image.blend(img, Image.new("RGB", (W, H), (80, 0, 0)), 0.18)
    img = panel(img, (80, 420, W - 80, 760), RED, fill=(8, 8, 12, 215), width=8); d = ImageDraw.Draw(img)
    ctext(d, 440, "WHO", F(140), WHITE); ctext(d, 585, "SURVIVES?", F(140), RED)
    return img
def c_ko(name, flash=False):
    img = card_bg(name); d = ImageDraw.Draw(img)
    img = panel(img, (70, 400, W - 70, 1010), RED, width=10); d = ImageDraw.Draw(img)
    ctext(d, 410, "K.O.", F(300), RED); ctext(d, 730, "WINNER", F(60), (205, 205, 215))
    ctext(d, 805, "THE KID + GRIM", fit(d, "THE KID + GRIM", W - 220, 120), WHITE)
    return img
def c_cta(txt1, txt2, col, extra=None):
    img = make_base("cta", False); d = ImageDraw.Draw(img, "RGBA")
    d.arc((340, 400, 740, 800), 200, 340, fill=RED, width=22); d.line((540, 600, 540, 700), fill=RED, width=22)
    d.ellipse((520, 760, 560, 800), fill=RED)
    d = ImageDraw.Draw(img)
    ctext(d, 900, txt1, fit(d, txt1, W - 200, 130), col)
    if txt2: ctext(d, 1040, txt2, fit(d, txt2, W - 200, 100), WHITE)
    return img
def c_next():
    img = make_base("cta", False); d = ImageDraw.Draw(img, "RGBA")
    d.rectangle((90, 380, W - 90, 920), fill=(24, 12, 20, 240), outline=RED, width=8)
    kid(d, 540, 760, 1.5); d.text((0, 0), "", font=F(10))
    d = ImageDraw.Draw(img)
    ctext(d, 450, "NEXT BATTLE SPIN", F(60), (205, 205, 215))
    ctext(d, 940, "WHO'S NEXT?", fit(d, "WHO'S NEXT?", W - 200, 140), WHITE)
    ctext(d, 1090, "FOLLOW", F(80), RED)
    return img
def c_spin(kind, shift):
    col = (30, 8, 14) if kind == 1 else (14, 18, 34); cell = (74, 16, 28) if kind == 1 else (36, 44, 78)
    img = Image.new("RGB", (W, H), col); d = ImageDraw.Draw(img); ch = 400
    for k in range(-1, 6):
        y = k * ch + shift
        d.rounded_rectangle((90, y + 20, W - 90, y + ch - 20), 24, fill=cell, outline=(10, 10, 14), width=8)
        d.ellipse((W // 2 - 50, y + ch // 2 - 50, W // 2 + 50, y + ch // 2 + 50), fill=(10, 10, 14))
    return vignette(img)
def c_spin_lock(kind):
    img = c_spin(kind, 0).filter(ImageFilter.GaussianBlur(0)); d = ImageDraw.Draw(img)
    lit = (150, 20, 34) if kind == 1 else (170, 138, 60); lock = "VRYKOLAKAS" if kind == 1 else "CHURCH GRIM"
    d.rounded_rectangle((70, 740, W - 70, 1180), 30, fill=lit, outline=(240, 240, 240), width=10)
    # tiny sprite so the lit cell reads as a "slot" symbol
    dd = ImageDraw.Draw(img, "RGBA")
    (vry(dd, 540, 1160, 0.7, claws=False) if kind == 1 else dog(dd, 540, 1150, 1.0, 1))
    ctext(d, 760, lock, fit(d, lock, W - 220, 70), (255, 255, 255))
    return img

# ---------------------------------------------------------------- save helpers
IMG = {}
def save(key, img, hud=None, ghost=None, blink=False):
    if hud is not None: img = bars(img.copy(), hud, ghost, blink)
    p = f"{B}/img/{key}.png"; img.convert("RGB").save(p); IMG[key] = f"build/battle/img/{key}.png"; return IMG[key]

# ================================================================== TIMELINE
text = open(f"{HERE}/script-battle.md", encoding="utf-8").read()
text = text[text.index("\n## "):]
blocks, cur = [], []
for line in text.splitlines():
    if line.startswith(">"): cur.append(line)
    elif cur: blocks.append(cur); cur = []
if cur: blocks.append(cur)
toks = [script_tokens("## x\n" + "\n".join(b)) for b in blocks]
assert len(blocks) == 20, len(blocks)
nw = [len(t) for t in toks]
print("blocks/words:", nw, sum(nw))

# scene: dict(img, w=weight or d=fixed seconds, fx..., sfx=[(name, offset, vol)], clock)
S = {}  # block index -> list of scene dicts
def sc(img, **k): return dict(img=img, **k)
KG = dict(kid=100)
def hv(**k): return k

# image variants (HUD baked in)
save("hook", c_hook("hook"), hv(kid=20, grim=75, vry=60))
save("kidcard", c_kid())
for kind in (1, 2):
    for i, sh in enumerate((0, 100, 200, 300)): save(f"spin{kind}_{i}", c_spin(kind, sh).filter(ImageFilter.GaussianBlur(6)))
    save(f"spin{kind}_lock", c_spin_lock(kind))
save("name1", c_fighter("kidcard", 1, "VRYKOLAKAS", "THE GREEK REVENANT", RED))
save("name2", c_fighter("kidcard", 2, "CHURCH GRIM", "GRAVEYARD GUARDIAN", GOLD))
save("vs_on", c_vs(True)); save("vs_off", c_vs(False))
save("window", make_base("window"), hv(kid=100))
save("forest", make_base("forest"), hv(kid=100))
save("grandma", make_base("grandma"), hv(kid=100))
save("rule", c_rule("grandma"), hv(kid=100))
save("rise", make_base("rise"), hv(kid=100, vry=100))
save("claw", make_base("claw"), hv(kid=60, vry=100), dict(kid=100, vry=100))
save("grim", make_base("grim"), hv(kid=60, vry=100, grim=100))
save("limit", c_limit("grim"), hv(kid=60, vry=100, grim=100))
save("round1", c_round(1, "grim"), hv(kid=60, vry=100, grim=100))
save("r1_a", make_base("r1"), hv(kid=60, vry=100, grim=100))
save("r1_b", make_base("r1"), hv(kid=60, vry=55, grim=90), dict(kid=60, vry=100, grim=100))
save("round2", c_round(2, "r2a"), hv(kid=60, vry=55, grim=90))
save("r2a", make_base("r2a"), hv(kid=20, vry=55, grim=90), dict(kid=60, vry=55, grim=90))
save("r2b", make_base("r2b"), hv(kid=20, vry=60, grim=75), dict(kid=20, vry=55, grim=90))
save("r2b_blink", make_base("r2b"), hv(kid=20, vry=60, grim=75), blink=True)
save("round3", c_round(3, "crawl"), hv(kid=20, vry=60, grim=75))
save("crawl", make_base("crawl"), hv(kid=20, vry=60, grim=75))
save("crawl_blink", make_base("crawl"), hv(kid=20, vry=60, grim=75), blink=True)
save("crush", make_base("crush"), hv(kid=20, vry=60, grim=75))
save("throw_a", make_base("throw"), hv(kid=20, vry=60, grim=75))
save("throw_b", make_base("throw"), hv(kid=20, vry=30, grim=75), dict(kid=20, vry=60, grim=75))
save("lure", make_base("lure"), hv(kid=20, vry=30, grim=75))
save("pounce", make_base("pounce"), hv(kid=20, vry=0, grim=30), dict(kid=20, vry=30, grim=75))
save("ko", c_ko("pounce"), hv(kid=20, vry=0, grim=30))
save("dawn", make_base("dawn"))
save("cliff", make_base("cliff"))
save("black", make_base("black", False))
save("cta1", c_cta("IS IT REALLY", "DEAD?", RED)); save("cta2", c_next())

S[0] = [sc("hook", w=1, zoom=[1.3, 1.0], shake=16, flash=True, hud=True, clock=None, sfx=[("impact", 0, 1.0), ("rewind", 0.5, 0.7)])]
S[1] = [sc("kidcard", w=1, zoom=[1.0, 1.08], flash=True)]
S[2] = [sc(f"spin1_{i}", d=0.4, zoom=[1.0, 1.12], pan="up", **({"sfx": [("ratchet", 0, 0.9)]} if i == 0 else {})) for i in range(4)]
S[2] += [sc("spin1_lock", d=0.35, flash=True, sfx=[("clunk", 0, 1.0)]), sc("name1", d=1.0, zoom=[1.0, 1.06])]
S[2] += [sc(f"spin2_{i}", d=0.4, zoom=[1.0, 1.12], pan="up", **({"sfx": [("ratchet", 0, 0.9)]} if i == 0 else {})) for i in range(4)]
S[2] += [sc("spin2_lock", d=0.35, flash=True, sfx=[("clunk", 0, 1.0)]), sc("name2", d=1.0, zoom=[1.0, 1.06])]
S[3] = [sc("vs_on" if i % 2 == 0 else "vs_off", d=0.5, zoom=[1.0, 1.05], **({"flash": True, "sfx": [("thunder", 0, 1.0), ("bell", 0.4, 0.8)]} if i == 0 else {})) for i in range(6)]
S[4] = [sc("window", w=0.35, zoom=[1.0, 1.12], pan="right", fade_in=0.3, clock="2:00 AM"),
        sc("forest", w=0.65, zoom=[1.0, 1.15], pan="left", sfx=[("chime", 0.3, 0.6)])]
S[5] = [sc("grandma", w=0.4, zoom=[1.0, 1.1], flash=True), sc("rule", w=0.6, zoom=[1.0, 1.06], flash=True, sfx=[("bell", 0.1, 0.7)])]
S[6] = [sc("rise", w=1, zoom=[1.0, 1.2], shake=8, sfx=[("earth", 0, 1.0), ("moan", 0.9, 0.8)])]
S[7] = [sc("claw", w=1, zoom=[1.0, 1.25], shake=22, flash=True, sfx=[("swipe", 0.1, 0.9), ("thud", 1.2, 1.0)])]
S[8] = [sc("grim", w=0.45, zoom=[1.0, 1.15], sfx=[("growl", 0.2, 1.0)]), sc("limit", w=0.55, zoom=[1.0, 1.05], flash=True)]
S[9] = [sc("round1", d=0.9, zoom=[1.7, 1.0], shake=24, flash=True, sfx=[("slam", 0, 1.0)]),
        sc("r1_a", w=0.4, zoom=[1.1, 1.3], shake=20, flash=True, sfx=[("growl", 0, 1.0), ("bite", 0.8, 1.0)]),
        sc("r1_b", w=0.6, zoom=[1.2, 1.4], shake=14, flash=True, sfx=[("bone", 0.2, 1.0), ("bite", 1.4, 1.0)])]
S[10] = [sc("round2", d=0.9, zoom=[1.7, 1.0], shake=24, flash=True, sfx=[("slam", 0, 1.0)]),
         sc("r2a", w=0.3, zoom=[1.0, 1.3], shake=18, flash=True, sfx=[("cackle", 0, 1.0), ("thud", 1.6, 1.0)]),
         sc("r2b", w=0.25, zoom=[1.0, 1.15], pan="right", shake=6, flash=True, sfx=[("howl", 0.3, 0.9)]),
         sc("r2b_blink", d=0.4, zoom=[1.1, 1.2], shake=10), sc("r2b", d=0.4, zoom=[1.2, 1.3], shake=14, flash=True),
         sc("r2b_blink", w=0.2, zoom=[1.3, 1.45], shake=18, flash=True, sfx=[("swipe", 0.2, 1.0)])]
S[11] = [sc("round3", d=0.9, zoom=[1.7, 1.0], shake=24, flash=True, sfx=[("slam", 0, 1.0)]),
         sc("crawl", w=1, zoom=[1.0, 1.15], sfx=[("heartbeat", 0, 1.0)])]
S[12] = [sc("crush", w=1, zoom=[1.0, 1.3], flash=True, sfx=[("crunch", 0.2, 1.0)])]
S[13] = [sc("throw_a", w=0.4, zoom=[1.0, 1.2]), sc("throw_b", w=0.6, zoom=[1.2, 1.5], shake=22, flash=True, sfx=[("sizzle", 0, 1.0), ("choke", 0.3, 0.9)])]
S[14] = [sc("lure", w=0.5, zoom=[1.0, 1.2], pan="right", sfx=[("click", 0.1, 1.0)]), sc("lure", w=0.5, zoom=[1.2, 1.5], shake=8, flash=True)]
S[15] = [sc("pounce", w=1, zoom=[1.1, 1.5], shake=24, flash=True, sfx=[("wind", 0, 0.6), ("slam", 1.2, 1.0), ("bite", 1.3, 1.0)])]
S[16] = [sc("ko", w=1, zoom=[1.4, 1.0], shake=18, flash=True, sfx=[("impact", 0, 1.0)])]
S[17] = [sc("dawn", w=1, zoom=[1.0, 1.12], fade_in=0.5, clock="5:40 AM", sfx=[("churchbell", 0.2, 0.8), ("churchbell", 2.4, 0.6)])]
S[18] = [sc("cliff", w=1, zoom=[1.0, 1.1], clock=None, sfx=[("knock", "END", 1.0)])]
S[19] = [sc("black", d=0.7, hud=False, silent=True), sc("cta1", w=0.5, flash=True, hud=False, zoom=[1.0, 1.06]), sc("cta2", w=0.5, hud=False, zoom=[1.0, 1.06], flash=True)]

# block durations (s). Narration pace ~2.55 words/s + breathing room; fixed minimums for card beats.
PACE = float(os.environ.get("PACE", 2.75))
MINB = {0: 3.2, 1: 2.4, 2: 5.9, 3: 3.0, 9: 5.2, 10: 9.0, 11: 4.0, 12: 2.8, 16: 3.4, 17: 5.0, 18: 3.8}
dur = []
for i in range(20):
    fixed = sum(s.get("d", 0) for s in S[i])
    need = nw[i] / PACE + 0.5 + (0.7 if i == 19 else 0)
    dur.append(max(need, MINB.get(i, 0), fixed + 0.5 if any("w" in s for s in S[i]) else fixed))
T0 = [sum(dur[:i]) for i in range(20)]
TOTAL = sum(dur)
print("block durations:", [round(x, 1) for x in dur], "total", round(TOTAL, 1))

# ---- scenes + sfx timeline
scenes_out, sfx_out, words = [], [], []
t = 0.0
for i in range(20):
    sl = S[i]; fixed = sum(s.get("d", 0) for s in sl); wsum = sum(s.get("w", 0) for s in sl)
    spare = dur[i] - fixed
    st = t
    silent = 0.0
    for s in sl:
        d = s["d"] if "d" in s else spare * s["w"] / wsum
        d = round(d * 30) / 30
        e = {"image": IMG[s["img"]], "duration": round(d, 3), "zoom": s.get("zoom", [1.0, 1.05])}
        for k in ("pan", "shake", "flash", "fade_in", "clock"):
            if k in s: e[k] = s[k]
        if s.get("hud") is False: e["hud"] = False
        scenes_out.append(e)
        for name, off, vol in s.get("sfx", []):
            at = st + (d - 0.06 if off == "END" else off)
            sfx_out.append((name, round(at, 3), vol))
        if s.get("silent"): silent += d
        st += d
    # fix rounding drift so later blocks stay aligned
    dur[i] = st - t
    ws, we = t + silent + 0.15, t + dur[i] - (0.35 if i != 18 else 0.7)
    # (the stinger blocks 0 and 16: words stay on narration; K.O./winner text is on screen)
    words += even_words(toks[i], max(we - ws, 0.5), ws)
    t = st
TOTAL = t
print("final total", round(TOTAL, 2))
json.dump(words, open(f"{B}/words_est.json", "w"))

# key moments for music shaping
t_r3 = T0 = [sum(dur[:i]) for i in range(21)]
r3_start, ko_start, cliff_start, cta_start = T0[11], T0[16], T0[18], T0[19] + 0.7
# ================================================================== AUDIO
A = f"{B}/audio"
def ff(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
def lav(spec, af, out): ff("-f", "lavfi", "-i", spec, "-af", af + ",alimiter=limit=0.9:level=0", f"{A}/{out}.wav")
# raw drone: bass + brown + mid wind, 110 s
ff("-f", "lavfi", "-i", "anoisesrc=c=brown:a=0.25:d=115", "-f", "lavfi", "-i", "sine=f=55:d=115", "-f", "lavfi", "-i", "anoisesrc=c=pink:a=0.5:d=115",
   "-filter_complex", "[0]lowpass=f=300[n];[1]volume=0.3,tremolo=f=0.15:d=0.6[s];[2]bandpass=f=900:w=1200,tremolo=f=0.1:d=0.5,volume=1.2[w];"
   "[n][s][w]amix=inputs=3:normalize=0,volume=6,acompressor=threshold=0.1:ratio=12:attack=5:release=80:makeup=2,alimiter=limit=0.35:level=0", f"{A}/drone_raw.wav")
lav("anoisesrc=c=brown:a=1:d=1.4", "lowpass=f=200,afade=t=out:st=0.05:d=1.3,volume=5", "impact")
lav("anoisesrc=c=brown:a=1:d=1.0", "lowpass=f=400,afade=t=out:st=0.0:d=0.9,volume=6", "slam_lo")
lav("anoisesrc=c=white:a=0.8:d=0.5", "bandpass=f=1800:w=2500,afade=t=out:st=0:d=0.45,volume=3", "slam_hi")
ff("-i", f"{A}/slam_lo.wav", "-i", f"{A}/slam_hi.wav", "-filter_complex", "amix=inputs=2:normalize=0,alimiter=limit=0.9:level=0", f"{A}/slam.wav")
lav("anoisesrc=c=white:a=0.5:d=0.05", "highpass=f=2500,afade=t=out:st=0:d=0.05,volume=2", "tick")
lav("sine=f=70:d=0.5", "afade=t=out:st=0:d=0.5,volume=7", "clunk")
lav("aevalsrc='0.9*sin(2*PI*140*t)*exp(-t*22)+0.5*sin(2*PI*330*t)*exp(-t*38)+0.4*sin(2*PI*90*t)*exp(-t*14)':d=0.5", "volume=1", "knock")
lav("anoisesrc=c=white:a=0.5:d=1.0", "highpass=f=1500,afade=t=in:d=0.1,afade=t=out:st=0.2:d=0.8,volume=1", "rewind")
lav("anoisesrc=c=brown:a=1:d=2.5", "lowpass=f=260,tremolo=f=14:d=0.9,afade=t=in:d=0.2,afade=t=out:st=1.5:d=1,volume=7", "growl_lo")
lav("anoisesrc=c=pink:a=1:d=2.5", "bandpass=f=700:w=500,tremolo=f=14:d=0.9,afade=t=in:d=0.2,afade=t=out:st=1.5:d=1,volume=3", "growl_hi")
ff("-i", f"{A}/growl_lo.wav", "-i", f"{A}/growl_hi.wav", "-filter_complex", "amix=inputs=2:normalize=0", f"{A}/growl.wav")
ff("-f", "lavfi", "-i", "sine=f=392:d=2.5", "-f", "lavfi", "-i", "sine=f=587:d=2.5", "-filter_complex", "amix=inputs=2:normalize=0,afade=t=out:st=0:d=2.5,volume=3", f"{A}/bell.wav")
ff("-i", f"{A}/bell.wav", "-af", "atempo=0.5,volume=1.4", f"{A}/churchbell.wav")
lav("anoisesrc=c=brown:a=1:d=3", "lowpass=f=130,afade=t=in:d=0.1,afade=t=out:st=0.3:d=2.7,volume=9", "thunder")
lav("sine=f=1760:d=0.8", "afade=t=out:st=0:d=0.8,volume=0.6", "chime")
lav("anoisesrc=c=brown:a=1:d=1.0", "lowpass=f=500,afade=t=in:d=0.2,afade=t=out:st=0.3:d=0.7,volume=7,tremolo=f=22:d=0.7", "earth")
lav("aevalsrc='0.8*sin(2*PI*(160*t-50*t*t))':d=1.6", "afade=t=in:d=0.2,afade=t=out:st=0.8:d=0.8,tremolo=f=7:d=0.5", "moan")
lav("anoisesrc=c=white:a=0.6:d=0.3", "bandpass=f=2500:w=2500,afade=t=in:d=0.1,afade=t=out:st=0.12:d=0.18,volume=3", "swipe")
lav("anoisesrc=c=brown:a=1:d=0.4", "lowpass=f=250,afade=t=out:st=0:d=0.35,volume=8", "thud")
lav("anoisesrc=c=white:a=0.7:d=0.3", "bandpass=f=2200:w=1800,afade=t=out:st=0:d=0.25,volume=3", "bite")
lav("aevalsrc='sin(2*PI*900*t)*exp(-t*60)*0.9':d=0.2", "volume=1", "bone")
lav("anoisesrc=c=pink:a=1:d=1.1", "bandpass=f=1300:w=900,tremolo=f=15:d=1.0,afade=t=in:d=0.1,afade=t=out:st=0.5:d=0.6,volume=3", "cackle")
lav("anoisesrc=c=white:a=0.7:d=0.8", "highpass=f=3000,tremolo=f=40:d=0.8,afade=t=out:st=0.2:d=0.6,volume=3", "sizzle")
lav("aevalsrc='0.8*sin(2*PI*(500-250*t)*t)':d=0.8", "afade=t=out:st=0.3:d=0.5,tremolo=f=12:d=0.8", "choke")
lav("anoisesrc=c=pink:a=1:d=0.5", "bandpass=f=1500:w=1500,tremolo=f=30:d=0.9,afade=t=out:st=0.1:d=0.4,volume=4", "crunch")
lav("anoisesrc=c=white:a=0.5:d=0.04", "bandpass=f=3000:w=1000,volume=4", "click")
lav("anoisesrc=c=pink:a=1:d=3", "bandpass=f=500:w=400,afade=t=in:d=1,afade=t=out:st=1.5:d=1.5,volume=2", "wind")
lav("aevalsrc='0.7*sin(2*PI*(260*t+40*t*t))':d=3", "afade=t=in:d=0.5,afade=t=out:st=1.5:d=1.5", "howl")
lav("sine=f=48:d=0.14", "afade=t=out:st=0:d=0.14,volume=7", "beat")
# ratchet and heartbeat (slow, loud: Round 3 has no music)
def mix(out, delays, src):
    ins = sum((["-i", f"{A}/{src}.wav"] for _ in delays), [])
    fc = ";".join(f"[{i}]adelay={int(x*1000)}|{int(x*1000)}[b{i}]" for i, x in enumerate(delays))
    fc += ";" + "".join(f"[b{i}]" for i in range(len(delays))) + f"amix=inputs={len(delays)}:normalize=0"
    ff(*ins, "-filter_complex", fc, f"{A}/{out}.wav")
tt, gap, tk = 0.0, 0.05, []
while tt < 1.5: tk.append(tt); tt += gap; gap *= 1.09
mix("ratchet", tk, "tick")
hb, tt = [], 0.0
while tt < dur[11] - 1: hb += [tt, tt + 0.22]; tt += 0.85
mix("heartbeat", hb, "beat")

# music bed: drone with hard cut at the cliffhanger, ducked (heartbeat only) in Round 3, dips under SFX
big = {"impact", "slam", "growl", "thunder", "bite", "bone", "knock", "howl", "cackle", "thud", "swipe", "sizzle", "choke", "earth", "moan", "clunk", "crunch"}
dips = [at for (n, at, v) in sfx_out if n in big]
def ramp(a): return f"clip(min((t-{a-0.05:.3f})/0.06\\,({a+0.9:.3f}-t)/0.5)\\,0\\,1)"
duck = "+".join(ramp(a) for a in dips)
gain = (f"if(lt(t\\,{cliff_start:.3f})\\,1\\,if(lt(t\\,{cta_start:.3f})\\,0\\,0.6))"
        f"*if(between(t\\,{r3_start+0.9:.3f}\\,{ko_start-1.0:.3f})\\,0.08\\,1)*(1-0.75*min(1\\,{duck}))")
ff("-i", f"{A}/drone_raw.wav", "-af", f"volume='{gain}':eval=frame", f"{A}/drone.wav")

# ================================================================== project json
sfx_json = []
for (n, at, v) in sfx_out:
    sfx_json.append({"file": f"build/battle/audio/{n}.wav", "at": at, "volume": v})
sfx_json.append({"file": "build/battle/audio/heartbeat.wav", "at": round(T0[11] + 0.9, 3), "volume": 1.0}) if False else None
proj = {"width": W, "height": H, "fps": 30, "output": "build/battle/battle-draft.mp4",
        "hud": {"label": "BATTLE SPIN · VRYKOLAKAS vs CHURCH GRIM"}, "voice": None,
        "music": "build/battle/audio/drone.wav", "music_volume": 1.6,
        "captions": "build/battle/captions.ass", "loudness": -14,
        "sfx": [s for s in sfx_json if s], "scenes": scenes_out}
json.dump(proj, open(f"{HERE}/project-battle.json", "w"), indent=1)
json.dump({"T0": T0, "dur": dur, "total": TOTAL, "cliff": cliff_start}, open(f"{B}/timeline.json", "w"))
print("scenes", len(scenes_out), "sfx", len(sfx_out), "cliff at", round(cliff_start, 1))
