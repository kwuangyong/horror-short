#!/usr/bin/env python3
"""Place voice clips for Episode #007 v3 (Direct-to-Story Aegean Island + Living Stone Juggernaut cliffhanger)."""
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
    "Only one soldier": 0.35,
    "From the ruined": 0.45,
    "Another trespasser": 0.35,
    "Seconds later": 1.15,          # Soldier petrification slow-mo -> shriek & wall breach
    "Its target was": 0.55,         # 096 skids to a halt -> eye-lock
    "Both curses": 0.65,            # Jaw unhinges -> 1v1 combat erupts
    "Medusa fired": 0.40,
    "Her vipers spat": 0.45,
    "Medusa dove": 0.45,
    "It yanked": 0.45,
    "Her golden wings": 0.50,
    "Turn to stone": 0.35,
    "Emerald fire": 0.45,
    "Breathing hard": 1.15,         # Petrification freeze -> aftermath silence
    "My garden always": 0.40,
    "But she had seen": 1.35,       # Beat 1 false peace -> Beat 2 music cuts dead
    "You just gave": 1.15,          # Beat 3: living marble statue steps forward!
}

out = np.zeros(int(120 * SR), np.float32)
words = []
sents = []
prev_end = None

for u in U:
    x = load(f"{H}/clips/{u['file']}")
    if prev_end is None:
        start = 0.55
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

end = round(prev_end + 1.40, 2)
out = out[: int(end * SR)]
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", "alimiter=limit=0.89", "voice_dark.wav"],
    input=out.tobytes(), check=True, cwd=H,
)
json.dump(words, open(f"{H}/words.json", "w"), ensure_ascii=False, indent=1)

def first(p):
    return [s for s in sents if s["text"].startswith(p)][0]

secs = [
    {"name": "cold_open", "start": 0.0, "end": first("Only one soldier")["start"]},
    {"name": "soldier_photo", "start": first("Only one soldier")["start"]},
    {"name": "medusa_reveal", "start": first("From the ruined")["start"]},
    {"name": "medusa_line", "start": first("Another trespasser")["start"]},
    {"name": "wall_breach", "start": first("Seconds later")["start"]},
    {"name": "eye_lock", "start": first("Its target was")["start"]},
    {"name": "charge1", "start": first("Both curses")["start"]},
    {"name": "dodge1", "start": first("Medusa fired")["start"]},
    {"name": "duck_venom", "start": first("Her vipers spat")["start"]},
    {"name": "dive_grab", "start": first("Medusa dove")["start"]},
    {"name": "slam", "start": first("It yanked")["start"]},
    {"name": "climax", "start": first("Her golden wings")["start"]},
    {"name": "turn_stone", "start": first("Turn to stone")["start"]},
    {"name": "petrify", "start": first("Emerald fire")["start"]},
    {"name": "aftermath", "start": first("Breathing hard")["start"]},
    {"name": "medusa_end", "start": first("My garden always")["start"]},
    {"name": "cliffhanger", "start": first("But she had seen")["start"]},
    {"name": "whisper", "start": first("You just gave")["start"]},
]
json.dump(
    {"duration": end, "sections": secs, "dialogue": [s for s in sents if s["speaker"] != "narrator"], "sentences": sents},
    open(f"{H}/sections.json", "w"), indent=1,
)
for s in sents:
    print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['speaker']:14s} {s['text'][:55]}")
print(f"Direct-to-story v3 Aegean duration={end}s")
