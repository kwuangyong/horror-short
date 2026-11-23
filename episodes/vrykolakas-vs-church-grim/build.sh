#!/usr/bin/env bash
# DRAFT build of "DUAL SPIN #001 · VRYKOLAKAS vs CHURCH GRIM": placeholder art + synthetic audio.
# Runs from any directory:  bash episodes/vrykolakas-vs-church-grim/build.sh
# If voice.mp3 exists next to this file it is darkened, transcribed and used for captions;
# otherwise caption timing is ESTIMATED per script section (see SECTION WINDOWS below).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS="$HERE/../../tools"
B="$HERE/build"
mkdir -p "$B/scenes" "$B/cards" "$B/audio"
export B TOOLS HERE

# ---------- 1. placeholder scenes + spin cards (Pillow) ----------
python3 - <<'PY'
import os, sys
sys.path.insert(0, os.environ["TOOLS"])
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from common import find_font
B = os.environ["B"]; W, H = 1080, 1920
FONT = find_font()
F = lambda s: ImageFont.truetype(FONT, s)
def ctext(d, y, t, f, fill):
    w = d.textlength(t, font=f); x = (W - w) / 2
    d.text((x + 4, y + 5), t, font=f, fill=(0, 0, 0, 200)); d.text((x, y), t, font=f, fill=fill)
def fit(d, t, mw, s):
    while s > 36 and d.textlength(t, font=F(s)) > mw: s -= 4
    return F(s)
def vignette(img):
    v = Image.new("L", (W, H), 0); ImageDraw.Draw(v).ellipse((-300, -200, W + 300, H + 200), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(220))
    return Image.composite(img, Image.new("RGB", (W, H), (0, 0, 0)), v)
def ph(name, col, label, meter=None):
    img = Image.new("RGB", (W, H), col); img = vignette(img); d = ImageDraw.Draw(img)
    ctext(d, H * 0.30, label, fit(d, label, W - 120, 58), (235, 235, 235))
    ctext(d, H * 0.30 + 90, "[placeholder - replace with illustration]", F(32), (150, 150, 150))
    if meter is not None:   # GARLIC meter (UI element of the escalation beat), kept in top third
        ctext(d, 215, "GARLIC", F(46), (235, 235, 235))
        x0, y0, bw, bh = 140, 285, 800, 54
        d.rounded_rectangle((x0, y0, x0 + bw, y0 + bh), 12, outline=(235, 235, 235), width=5)
        n = 10; seg = (bw - 16) / n
        for i in range(n):
            if i < round(meter * n):
                d.rectangle((x0 + 8 + i * seg + 3, y0 + 8, x0 + 8 + (i + 1) * seg - 3, y0 + bh - 8), fill=(227, 38, 47) if meter <= .4 else (235, 225, 190))
    img.save(f"{B}/scenes/{name}.png")
S = [
 ("hook-hand",       (30, 22, 30),  "PALE HAND ON LATCH · BLACK DOG RED EYES"),
 ("island-house",    (22, 30, 52),  "WHITE HOUSE · CHURCHYARD WALL · NEW GRAVE"),
 ("bedroom",         (36, 42, 74),  "NIKOS ASLEEP · ONE BARE FOOT OUT"),
 ("grandma",         (44, 32, 40),  "GRANDMA ELENI · OIL LAMP · DRY GARLIC"),
 ("door-knock",      (30, 26, 32),  "FRONT DOOR · LAMP TREMBLING · ONE KNOCK"),
 ("legend",          (58, 66, 78),  "THE LEGEND · PALE HAND IN THE SOIL"),
 ("grim-wall",       (20, 20, 36),  "GRIM ON THE CHURCHYARD WALL · RED EYES"),
 ("end-a-latch",     (50, 24, 28),  "GARLIC TO ASH · LATCH LIFTS BY ITSELF"),
 ("end-a-howl",      (14, 14, 22),  "GRIM HOWLS AT THE WALL LINE"),
 ("end-b-window",    (22, 36, 56),  "OUT THE BACK WINDOW · CARRY NIKOS"),
 ("end-b-between",   (28, 34, 60),  "GRIM STEPS BETWEEN · DEAD MAN STOPS"),
 ("end-b-dawn",      (150, 96, 46), "SUNRISE · FOOTPRINTS END AT THE WALL"),
 ("end-b-grandma",   (120, 84, 60), "GRANDMA STILL · BLACK DOG FADES"),
 ("cta-bg",          (17, 17, 22),  "CTA BACKGROUND · BLACK DOG IN FOG"),
]
for n, c, l in S: ph(n, c, l)
ph("grim-growls", (24, 22, 40), "GRIM SNARLS AT THE DOOR · GARLIC DUST", meter=.7)
ph("grim-lunges", (26, 22, 38), "GRIM SCRAPES THE WALL TOP · CANNOT CROSS", meter=.5)
ph("nikos-latch", (40, 26, 36), "NIKOS SLEEPWALKS · HAND ON LATCH", meter=.2)

# choice split-screen background (A red left / B blue right)
img = Image.new("RGB", (W, H), (20, 20, 30)); d = ImageDraw.Draw(img)
d.rectangle((0, 0, W // 2, H), fill=(70, 18, 28)); d.rectangle((W // 2, 0, W, H), fill=(18, 40, 78))
ctext(d, H * 0.80, "[placeholder - split screen]", F(32), (150, 150, 150))
vignette(img).save(f"{B}/scenes/choice-bg.png")

# ---- Dual Spin reels: 5 stacked cells; lit centre cell on the "lock" image ----
def reel(name, base, lit, cells, shift=0, lock=None):
    img = Image.new("RGB", (W, H), base); d = ImageDraw.Draw(img)
    ch = 400
    for k in range(-1, 6):
        y = k * ch + shift
        d.rounded_rectangle((90, y + 20, W - 90, y + ch - 20), 24, fill=cells, outline=(10, 10, 14), width=8)
        if name.startswith("spin1"):
            for bx in range(150, W - 150, 90): d.rectangle((bx, y + 30, bx + 10, y + ch - 30), fill=(10, 10, 14))
        else:
            d.arc((W // 2 - 140, y + 60, W // 2 + 140, y + 420), 180, 360, fill=(10, 10, 14), width=10)
        d.ellipse((W // 2 - 50, y + ch // 2 - 50, W // 2 + 50, y + ch // 2 + 50), fill=(10, 10, 14))
    if lock:
        y0 = 740
        d.rounded_rectangle((70, y0, W - 70, y0 + 440), 30, fill=lit, outline=(240, 240, 240), width=10)
        ctext(d, y0 + 150, lock, fit(d, lock, W - 220, 64), (255, 255, 255))
        ctext(d, y0 + 240, "[placeholder - lit cell]", F(32), (220, 220, 220))
    out = vignette(img).filter(ImageFilter.GaussianBlur(0 if lock else 6))
    out.save(f"{B}/scenes/{name}.png")
for i, s in enumerate((0, 100, 200, 300)):
    reel(f"spin1_{i}", (30, 8, 14), (150, 20, 34), (74, 16, 28), s)
    reel(f"spin2_{i}", (14, 18, 34), (180, 150, 70), (36, 44, 78), s)
reel("spin1_lock", (30, 8, 14), (150, 20, 34), (74, 16, 28), 0, "VRYKOLAKAS AT THE DOOR")
reel("spin2_lock", (14, 18, 34), (170, 138, 60), (36, 44, 78), 0, "BLACK DOG AMONG GRAVESTONES")

# ---- Dual Spin name cards (own style, same palette as tools/make_cards.py) ----
def name_card(out, bg, kicker, name, sub, kcol):
    img = Image.open(f"{B}/scenes/{bg}.png").convert("RGBA")
    img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 90)))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.rounded_rectangle((90, 300, W - 90, 700), 18, fill=(14, 16, 24, 238), outline=kcol, width=6)
    img.alpha_composite(ov); d = ImageDraw.Draw(img)
    ctext(d, 335, kicker, fit(d, kicker, W - 260, 50), kcol)
    ctext(d, 420, name, fit(d, name, W - 240, 130), (245, 242, 235))
    ctext(d, 590, sub, fit(d, sub, W - 240, 52), (200, 200, 210))
    img.convert("RGB").save(f"{B}/cards/{out}.png")
name_card("name1", "spin1_lock", "SUBJECT IDENTIFIED", "VRYKOLAKAS", "THE GREEK REVENANT", (227, 38, 47))
name_card("name2", "spin2_lock", "YOUR GUARDIAN", "THE CHURCH GRIM", "THE BLACK DOG OF THE GRAVEYARD", (232, 190, 90))
PY

# ---------- 2. infographic cards (tools/make_cards.py) ----------
C="python3 $TOOLS/make_cards.py"
$C hook  "1 MONSTER · 1 GUARDIAN · 1 CHOICE" --bg "$B/scenes/hook-hand.png" -o "$B/cards/hook.png"
$C rule  "FIRST KNOCK: DON'T OPEN"  --label "RULE 1" --bg "$B/scenes/grandma.png" -o "$B/cards/rule1.png"
$C rule  "IT CALLS: DON'T ANSWER"   --label "RULE 2" --bg "$B/scenes/grandma.png" -o "$B/cards/rule2.png"
$C rule  "GARLIC ON THE DOOR"       --label "RULE 3" --bg "$B/scenes/grandma.png" -o "$B/cards/rule3.png"
$C trick "GRIM GUARDS INSIDE THE WALL" "ONLY" --bg "$B/scenes/grim-wall.png" -o "$B/cards/trick.png"
A="HOLD THE DOOR"; Bt="RUN TO THE BLACK DOG"
$C choice "$A" "$Bt" --countdown 5 --bg "$B/scenes/choice-bg.png" -o "$B/cards/choice.png"
$C stamp  "$A" "$Bt" --pick A --bg "$B/scenes/choice-bg.png" -o "$B/cards/pickA.png"
$C stamp  "$A" "$Bt" --pick B --bg "$B/scenes/choice-bg.png" -o "$B/cards/pickB.png"
$C word  "COME OUT." -o "$B/cards/come-out.png"
$C hook  "DID YOU CHOOSE RIGHT?" --bg "$B/scenes/cta-bg.png" -o "$B/cards/cta.png"

# ---------- 3. synthetic audio (placeholders for real music / SFX) ----------
python3 - <<'PY'
import os, subprocess
d = os.environ["B"] + "/audio"
def ff(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
def lav(spec, af, out): ff("-f", "lavfi", "-i", spec, "-af", af, f"{d}/{out}.wav")
ff("-f", "lavfi", "-i", "anoisesrc=c=brown:a=0.25:d=110", "-f", "lavfi", "-i", "sine=f=55:d=110", "-filter_complex",
   "[0]lowpass=f=300[n];[1]volume=0.3,tremolo=f=0.15:d=0.6[s];[n][s]amix=inputs=2:normalize=0", f"{d}/drone.wav")
lav("anoisesrc=c=brown:a=1:d=1.2", "lowpass=f=180,afade=t=out:st=0.05:d=1.1,volume=4", "impact")
lav("sine=f=48:d=0.12", "afade=t=out:st=0:d=0.12,volume=6", "beat")
lav("anoisesrc=c=white:a=0.6:d=0.05", "highpass=f=2500,afade=t=out:st=0:d=0.05,volume=2", "tick")
lav("sine=f=70:d=0.5", "afade=t=out:st=0:d=0.5,volume=7", "clunk")
lav("sine=f=90:d=0.25", "afade=t=out:st=0:d=0.25,volume=6", "knock")
lav("anoisesrc=c=white:a=0.5:d=1.0", "highpass=f=1500,afade=t=in:d=0.1,afade=t=out:st=0.2:d=0.8,volume=1", "rewind")
lav("anoisesrc=c=pink:a=0.5:d=1.6", "bandpass=f=1800:w=900,tremolo=f=9:d=0.8,afade=t=in:d=0.4,afade=t=out:st=0.8:d=0.8,volume=1.2", "whisper")
lav("anoisesrc=c=brown:a=1:d=2.5", "lowpass=f=220,tremolo=f=14:d=0.9,afade=t=in:d=0.3,afade=t=out:st=1.5:d=1,volume=5", "growl")
lav("sine=f=392:d=2.5", "afade=t=out:st=0:d=2.5,volume=1.8", "bell")
lav("anoisesrc=c=brown:a=1:d=0.6", "lowpass=f=400,afade=t=out:st=0:d=0.6,volume=5", "step")
lav("anoisesrc=c=white:a=0.5:d=0.08", "bandpass=f=3000:w=2000,afade=t=out:st=0:d=0.08,volume=3", "latch")
lav("aevalsrc='0.5*sin(2*PI*(260*t+40*t*t))':d=3", "afade=t=in:d=0.5,afade=t=out:st=1.5:d=1.5", "howl")
ff("-f", "lavfi", "-i", "sine=f=233:d=3", "-f", "lavfi", "-i", "sine=f=247:d=3", "-filter_complex",
   "amix=inputs=2:normalize=0,afade=t=out:st=0:d=3,volume=0.5", f"{d}/offnote.wav")
def mix(out, delays, src, total):
    ins = sum((["-i", f"{d}/{src}.wav"] for _ in delays), [])
    fc = ";".join(f"[{i}]adelay={int(x*1000)}|{int(x*1000)}[b{i}]" for i, x in enumerate(delays))
    fc += ";" + "".join(f"[b{i}]" for i in range(len(delays))) + f"amix=inputs={len(delays)}:normalize=0"
    ff(*ins, "-filter_complex", fc, f"{d}/{out}.wav")
# ratchet: ticks slowing down over 2 s
t, gap, tk = 0.0, 0.05, []
while t < 1.9: tk.append(t); t += gap; gap *= 1.09
mix("ratchet", tk, "tick", 2)
# heartbeat speeding up (as ma-da), 8 s
t, gap, hb = 0.0, 0.9, []
while t < 7.5: hb += [t, t + 0.22]; t += gap; gap = max(0.35, gap * 0.88)
mix("heartbeat", hb, "beat", 8)
mix("ticking", [i * 1.0 for i in range(8)], "tick", 8)
mix("steps", [0, 0.8, 1.6, 2.4], "step", 4)
PY

# ---------- 4. captions ----------
CAPFONT="$(fc-scan --format '%{family[0]}' "$(python3 -c "import sys; sys.path.insert(0,'$TOOLS'); from common import find_font; print(find_font())")")"
if [ -f "$HERE/voice.mp3" ]; then
  bash "$TOOLS/voice_fx.sh" "$HERE/voice.mp3" "$B/audio/voice_dark.wav" deep
  python3 "$TOOLS/transcribe_words.py" "$B/audio/voice_dark.wav" --lang en -o "$B/words.json"
  python3 "$TOOLS/make_captions.py" "$B/words.json" --script "$HERE/script.md" --font "$CAPFONT" -o "$B/captions.ass"
  VOICE_ARG=(--voice build/audio/voice_dark.wav)
else
  # SECTION WINDOWS: estimated narration start/end (s) for each "## " section of script.md,
  # words spread evenly inside their window (no voice yet -> DRAFT timing only).
  python3 - <<'PY'
import os, re, sys, json
sys.path.insert(0, os.environ["TOOLS"])
from common import script_tokens
from make_captions import even_words
text = open(os.environ["HERE"] + "/script.md", encoding="utf-8").read()
secs = [s for s in re.split(r"^## ", text, flags=re.M)[1:] if not s.startswith("Changelog")]
win = [(0.4, 2.9), (3.7, 5.2), (6.7, 8.2), (9.3, 15.8), (16.3, 25.6), (26.3, 31.8),
       (32.2, 40.8), (41.2, 57.5), (58.3, 65.8), (66.6, 76.8), (77.4, 94.6), (95.2, 101.8)]
assert len(secs) == len(win), (len(secs), len(win))
words = []
for s, (a, b) in zip(secs, win):
    toks = script_tokens("## " + s)
    if toks: words += even_words(toks, b - a, a)
json.dump(words, open(os.environ["B"] + "/words_est.json", "w"))
print(len(words), "estimated words")
PY
  python3 "$TOOLS/make_captions.py" "$B/words_est.json" --font "$CAPFONT" -o "$B/captions.ass"
  VOICE_ARG=()
fi

# ---------- 5. render ----------
python3 "$TOOLS/render.py" "$HERE/project.json" "${VOICE_ARG[@]}"
