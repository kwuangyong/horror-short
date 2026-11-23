#!/usr/bin/env python3
"""FINAL build generator: real art + real voice timings -> cards/HUD overlays + project-final.json.
Reuses card/HUD helpers from battle_gen.py (exec of the part before the TIMELINE section)."""
import json, os, sys
HERE, B = os.environ["HERE"], os.environ["B"]
src = open(f"{HERE}/battle_gen.py", encoding="utf-8").read()
ns = {"__name__": "bg"}
exec(compile(src[:src.index("# ================================================================== TIMELINE")], "battle_gen", "exec"), ns)
from PIL import Image, ImageDraw
W, H, FPS = 1080, 1920, 30
A = f"{HERE}/art/"
ctext, fit, F, panel, darken, bars = (ns[k] for k in ("ctext", "fit", "F", "panel", "darken", "bars"))
RED, WHITE, GOLD = ns["RED"], ns["WHITE"], ns["GOLD"]
os.makedirs(f"{B}/img", exist_ok=True)

def art(n): return Image.open(f"{A}b-{n}.png").convert("RGB").resize((W, H))
def dark(n, amt=0.62, blur=5): return darken(art(n), amt, blur)
def put(name, img): img.convert("RGB").save(f"{B}/img/{name}.png"); return f"build/final/img/{name}.png"
def hud(name, kid=None, grim=None, vry=None, ghost=None, blink=False):
    h = {k: v for k, v in (("kid", kid), ("grim", grim), ("vry", vry)) if v is not None}
    bars(Image.new("RGBA", (W, H), (0, 0, 0, 0)), h, ghost, blink).save(f"{B}/img/{name}.png")
    return f"build/final/img/{name}.png"

# ---------------------------------------------------------------- cards (over REAL art)
def c_hooktext():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle((120, 350, W - 120, 640), 20, fill=(8, 8, 12, 185), outline=RED + (255,), width=8)
    ctext(d, 355, "WHO", F(120), WHITE); ctext(d, 480, "SURVIVES?", F(120), RED)
    img.save(f"{B}/img/hooktext.png"); return "build/final/img/hooktext.png"
def c_kid():
    img = art("card-the-kid").convert("RGBA")
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.rounded_rectangle((150, 150, W - 150, 330), 20, fill=(10, 12, 20, 215), outline=(60, 200, 110, 255), width=6)
    img.alpha_composite(ov); img = img.convert("RGB"); d = ImageDraw.Draw(img)
    ctext(d, 158, "CHARACTER  ·  HP 100%", F(36), (60, 200, 110)); ctext(d, 200, "THE KID", F(105), WHITE)
    d.rectangle((200, 312, W - 200, 322), fill=(60, 200, 110))
    return put("kidcard", img)
def c_fighter(spin, n, name, sub, col):
    img = art(spin).convert("RGBA"); ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ov).rounded_rectangle((90, 330, W - 90, 700), 20, fill=(10, 12, 20, 205), outline=col + (255,), width=6)
    img.alpha_composite(ov); img = img.convert("RGB"); d = ImageDraw.Draw(img)
    ctext(d, 350, f"FIGHTER {n}", F(54), col); ctext(d, 425, name, fit(d, name, W - 260, 130), WHITE)
    ctext(d, 590, sub, fit(d, sub, W - 260, 48), (205, 205, 215))
    return put(f"fighter{n}", img)
def c_vs(on, step):
    img = art("vs-triangle").convert("RGBA"); d = ImageDraw.Draw(img)
    img = img.convert("RGB"); d = ImageDraw.Draw(img)
    ctext(d, 215, "VRYKOLAKAS", F(52), (190, 225, 190), x=40); ctext(d, 215, "GRIM", F(52), WHITE, x=W - 40 - d.textlength("GRIM", font=F(52)))
    # fill the 3 empty bars (y 1150/1190/1230, x 260-820): red from centre-left (Vrykolakas), white to right (Grim)
    for y, lab, a, b in ((1150, "POWER", 80, 70), (1190, "SPEED", 60, 85), (1230, "LORE", 95, 70)):
        if step < 1: break
        cx = 540
        d.rounded_rectangle((266, y + 5, cx - 2, y + 19), 6, fill=(30, 30, 38))
        d.rounded_rectangle((cx + 2, y + 5, 814, y + 19), 6, fill=(30, 30, 38))
        d.rounded_rectangle((cx - 2 - (cx - 270) * a / 100, y + 5, cx - 2, y + 19), 6, fill=RED)
        d.rounded_rectangle((cx + 2, y + 5, cx + 2 + (810 - cx) * b / 100, y + 19), 6, fill=(235, 235, 240))
        ctext(d, y - 2, lab, F(24), (200, 200, 210), x=250 - d.textlength(lab, font=F(24)))
    img = panel(img, (110, 1440, W - 110, 1590), RED if on else WHITE, fill=(10, 10, 16, 225)); d = ImageDraw.Draw(img)
    ctext(d, 1468, "WHO WINS? COMMENT", fit(d, "WHO WINS? COMMENT", W - 280, 84), RED if on else WHITE)
    return put(f"vs_{'on' if on else 'off'}{step}", img)
def card_round(n, name):
    img = dark(name); img = panel(img, (80, 540, W - 80, 960), RED, width=10); d = ImageDraw.Draw(img)
    ctext(d, 570, "ROUND", F(110), WHITE); ctext(d, 680, str(n), F(260), RED)
    return put(f"round{n}", img)
def card_rule():
    img = dark("grandma-garlic-flashback", 0.55); img = panel(img, (70, 420, W - 70, 880), GOLD); d = ImageDraw.Draw(img)
    ctext(d, 450, "GRANDMA'S RULES", F(48), GOLD); ctext(d, 540, "GARLIC", fit(d, "x", 500, 130), WHITE)
    ctext(d, 665, "WEAKENS IT", F(80), (205, 205, 215)); ctext(d, 770, "ONLY FIRE ENDS IT", fit(d, "ONLY FIRE ENDS IT", W - 200, 80), RED)
    return put("rule", img)
def card_limit():
    img = dark("grim-appears-stance", 0.6); img = panel(img, (70, 480, W - 70, 880), WHITE); d = ImageDraw.Draw(img)
    ctext(d, 510, "THE LIMIT", F(56), (205, 205, 215)); ctext(d, 590, "INSIDE THE WALL", fit(d, "INSIDE THE WALL", W - 200, 110), WHITE)
    ctext(d, 740, "ONLY", F(130), RED)
    return put("limit", img)
def card_ko():
    img = art("ko-winner-kid-grim").convert("RGBA"); ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.rounded_rectangle((70, 340, W - 70, 640), 20, fill=(8, 8, 12, 195), outline=RED + (255,), width=10)
    img.alpha_composite(ov); img = img.convert("RGB"); d = ImageDraw.Draw(img)
    ctext(d, 335, "K.O.", F(210), RED)
    ctext(d, 555, "WINNER: THE KID + GRIM", fit(d, "WINNER: THE KID + GRIM", W - 200, 58), WHITE)
    return put("ko", img)
def card_cta(txt1, txt2, name):
    img = art("cta-whos-next").convert("RGBA"); ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ov).rectangle((0, 930, W, 1230), fill=(0, 0, 0, 150)); img.alpha_composite(ov)
    img = img.convert("RGB"); d = ImageDraw.Draw(img)
    ctext(d, 945, txt1, fit(d, txt1, W - 160, 120), RED)
    if txt2: ctext(d, 1075, txt2, fit(d, txt2, W - 160, 100), WHITE)
    return put(name, img)
def card_next():
    img = Image.open(f"{A}mascot-sheet-the-kid.png").convert("RGB").resize((W, H)); d = ImageDraw.Draw(img)
    return put("next_raw", img)

# spin: heavy blur (fast pan reads as a spinning reel)
for k, nm in ((1, "spin-cells-monsters"), (2, "spin-shrines-guardians")):
    put(f"spinblur{k}", art(nm).filter(ns["ImageFilter"].GaussianBlur(14)))
I = dict(
    hooktext=c_hooktext(), kidcard=c_kid(),
    f1=c_fighter("spin-cells-monsters", 1, "VRYKOLAKAS", "THE GREEK REVENANT", RED),
    f2=c_fighter("spin-shrines-guardians", 2, "CHURCH GRIM", "GRAVEYARD GUARDIAN", GOLD),
    vs=[c_vs(True, 0), c_vs(False, 1), c_vs(True, 1), c_vs(False, 1), c_vs(True, 1)],
    r1=card_round(1, "round1-grim-slams"), r2=card_round(2, "round2-thrown-over-wall"), r3=card_round(3, "round2-grim-stuck"),
    rule=card_rule(), limit=card_limit(), ko=card_ko(),
    cta1=card_cta("IS IT REALLY", "DEAD?", "cta1"), cta2=card_cta("GRANDMA SAID", "FIRE.", "cta2"),
    cta3=card_cta("WHO'S NEXT?", "FOLLOW", "cta3"),
)
H_ = hud  # shortcut
HU = {
 "h0": H_("hud_h0", 20, 75, 60), "k100": H_("hud_k100", 100),
 "rise": H_("hud_rise", 100, None, 100), "claw2": H_("hud_claw2", 60, None, 100), "claw": H_("hud_claw", 60, None, 100, dict(kid=100)),
 "grim": H_("hud_grim", 60, 100, 100), "r1a": H_("hud_r1a", 60, 100, 100), "r1b": H_("hud_r1b", 60, 90, 55, dict(grim=100, vry=100)),
 "r2a": H_("hud_r2a", 60, 90, 60, dict(vry=55)), "r2b": H_("hud_r2b", 20, 90, 60, dict(kid=60)),
 "r2c": H_("hud_r2c", 20, 75, 60, dict(grim=90)), "r2c_n": H_("hud_r2cn", 20, 75, 60), "r2c_b": H_("hud_r2cb", 20, 75, 60, blink=True),
 "r3": H_("hud_r3", 20, 75, 60), "r3_b": H_("hud_r3b", 20, 75, 60, blink=True),
 "r3t": H_("hud_r3t", 20, 75, 30, dict(vry=60)), "r3t_n": H_("hud_r3tn", 20, 75, 30),
 "pz": H_("hud_pz", 20, 75, 30), "pz0": H_("hud_pz0", 20, 75, 0, dict(vry=30)), "ko": H_("hud_ko", 20, 75, 0),
}
json.dump(dict(I=I, HU=HU), open(f"{B}/assets.json", "w"))
print("assets ok")

Image.new("RGB", (W, H), (0, 0, 0)).save(f"{B}/img/black.png")
