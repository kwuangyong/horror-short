#!/usr/bin/env python3
"""Place voice clips on Battle Spin anchors for Episode #007 (SCP-096 vs Medusa) -> voice_dark.wav, words.json, sections.json."""
import json, os, subprocess
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
SR = 48000
U = json.load(open(f"{H}/units.json"))

def load(p):
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
        capture_output=True, check=True,
    )
    return np.frombuffer(r.stdout, dtype=np.float32)

EXTRA_GAP = {
    "I am Medusa": 1.65,            # emerge L -> spin & lock R -> dive R
    "A fugitive soldier": 1.55,     # emerge R -> VS slam + CTA -> shatter into misty ruins
    "Medusa glided": 0.55,          # soldier runs into misty ruins -> Medusa glides out
    "Seconds later": 0.55,          # soldier petrified -> 096 shrieks & smashes wall
    "Its target was": 0.65,         # 1v1 establishing wide shot
    "Both curses": 0.45,
    "Grey stone crept": 0.50,
    "Spreading golden": 0.45,
    "Shredded and": 0.55,
    "It yanked": 0.45,
    "Golden wings": 0.50,
    "Trapped beneath": 0.50,
    "Turn to stone": 0.35,
    "Emerald fire": 0.50,
    "Breathing hard": 1.15,         # Petrification freeze -> aftermath silence
    "No beast escapes": 0.45,
    "Yet stone only": 1.35,         # Beat 1 false peace -> Beat 2 music cuts dead
    "Four...": 1.15,                # Beat 3: stone cracks revealing indestructible white skull
}

out = np.zeros(int(130 * SR), np.float32)
words = []
sents = []
prev_end = None

for u in U:
    x = load(f"{H}/clips/{u['file']}")
    if prev_end is None:
        start = 4.65
    else:
        gap = 0.22
        if u["line_first"]:
            gap = 0.30
            for pref, g in EXTRA_GAP.items():
                if u["text"].startswith(pref):
                    gap = g
                    break
        start = prev_end + gap
    i0 = int(start * SR)
    out[i0 : i0 + len(x)] += x
    for w in u["words"]:
        words.append({
            "word": w["word"],
            "start": round(start + w["start"], 3),
            "end": round(start + w["end"], 3),
            "speaker": "narrator" if u["speaker"] == "narrator" else u["speaker"].split("_")[0],
        })
    sents.append({
        "section": u["section"],
        "speaker": u["speaker"],
        "text": u["text"],
        "start": round(start, 2),
        "end": round(start + len(x) / SR, 2),
    })
    prev_end = start + len(x) / SR

end = round(prev_end + 1.45, 2)
out = out[: int(end * SR)]
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", "alimiter=limit=0.89", "voice_dark.wav"],
    input=out.tobytes(), check=True, cwd=H,
)
json.dump(words, open(f"{H}/words.json", "w"), ensure_ascii=False, indent=1)

def first(p):
    return [s for s in sents if s["text"].startswith(p)][0]

t_m0 = first("I am SCP")["start"]
t_m1 = first("See my face")["end"]
t_g0 = first("I am Medusa")["start"]
t_g1 = first("Look once")["end"]

secs = [
    {"section": 0, "name": "hook", "start": 0.0, "end": 3.0},
    {"section": 1, "name": "split_roll", "start": 3.0},
    {"name": "intro_scp096", "start": t_m0, "end": t_m1},
    {"name": "intro_medusa", "start": t_g0, "end": t_g1},
    {"section": 2, "name": "story", "start": first("A fugitive soldier")["start"]},
    {"name": "petrify_soldier", "start": first("Medusa glided")["start"]},
    {"name": "wall_breach", "start": first("Seconds later")["start"]},
    {"name": "eye_lock", "start": first("Its target was")["start"]},
    {"name": "charge1", "start": first("Both curses")["start"]},
    {"name": "wings", "start": first("Grey stone crept")["start"]},
    {"name": "barrage", "start": first("Spreading golden")["start"]},
    {"name": "reversal", "start": first("Shredded and")["start"]},
    {"name": "slam", "start": first("It yanked")["start"]},
    {"name": "pinned", "start": first("Golden wings")["start"]},
    {"name": "climax", "start": first("Trapped beneath")["start"]},
    {"name": "petrify", "start": first("Emerald fire")["start"]},
    {"name": "aftermath", "start": first("Breathing hard")["start"]},
    {"name": "cliffhanger", "start": first("Yet stone only")["start"]},
    {"name": "whisper", "start": first("Four...")["start"]},
]
json.dump(
    {"duration": end, "sections": secs, "dialogue": [s for s in sents if s["speaker"] != "narrator"], "sentences": sents},
    open(f"{H}/sections.json", "w"), indent=1,
)
for s in sents:
    print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['speaker']:14s} {s['text'][:55]}")
print(f"intro_096={t_m0}-{t_m1} ({t_m1-t_m0:.2f}s) | intro_medusa={t_g0}-{t_g1} ({t_g1-t_g0:.2f}s) | duration={end}s")
