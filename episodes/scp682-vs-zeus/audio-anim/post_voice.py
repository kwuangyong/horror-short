#!/usr/bin/env python3
"""Place voice clips on Battle Spin anchors for Episode #006 (SCP-682 vs Zeus) -> voice_dark.wav, words.json, sections.json."""
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
    "I am Zeus": 1.60,            # emerge L -> spin & lock R -> dive R
    "Pegasus reached": 1.50,      # emerge R -> VS slam + CTA -> shatter into burning city
    "Zeus descended": 0.45,
    "Zeus hurled": 0.60,          # 1v1 establishing wide shot
    "Instead, the reptile": 0.45,
    "Delicious": 0.35,
    "Supercharged": 0.45,
    "Enraged, Zeus": 0.50,
    "The blast ripped": 0.45,
    "Then the King": 0.50,
    "Desperate": 0.50,
    "Be erased": 0.35,
    "Pure divine": 0.50,
    "Dawn broke": 1.05,           # Supernova explosion -> crater settles
    "The sky is safe": 0.45,
    "Yet deep inside": 1.25,      # Beat 1 false peace -> Beat 2 music cuts dead
    "Still... alive": 1.10,       # Beat 3: single bone shard pulses + acid eye snaps open
}

out = np.zeros(int(130 * SR), np.float32)
words = []
sents = []
prev_end = None

for u in U:
    x = load(f"{H}/clips/{u['file']}")
    if prev_end is None:
        start = 4.60
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

end = round(prev_end + 1.30, 2)
out = out[: int(end * SR)]
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", "alimiter=limit=0.89", "voice_dark.wav"],
    input=out.tobytes(), check=True, cwd=H,
)
json.dump(words, open(f"{H}/words.json", "w"), ensure_ascii=False, indent=1)

def first(p):
    return [s for s in sents if s["text"].startswith(p)][0]

t_m0 = first("I am SCP")["start"]
t_m1 = first("Now even")["end"]
t_g0 = first("I am Zeus")["start"]
t_g1 = first("Kneel")["end"]

secs = [
    {"section": 0, "name": "hook", "start": 0.0, "end": 3.0},
    {"section": 1, "name": "split_roll", "start": 3.0},
    {"name": "intro_scp682", "start": t_m0, "end": t_m1},
    {"name": "intro_zeus", "start": t_g0, "end": t_g1},
    {"section": 2, "name": "story", "start": first("Pegasus reached")["start"]},
    {"name": "fight", "start": first("Zeus hurled")["start"]},
    {"name": "absorb", "start": first("Instead, the reptile")["start"]},
    {"name": "aegis", "start": first("Enraged, Zeus")["start"]},
    {"name": "overdrive", "start": first("Then the King")["start"]},
    {"name": "climax", "start": first("Desperate")["start"]},
    {"name": "vaporize", "start": first("Pure divine")["start"]},
    {"name": "aftermath", "start": first("Dawn broke")["start"]},
    {"name": "cliffhanger", "start": first("Yet deep inside")["start"]},
    {"name": "whisper", "start": first("Still")["start"]},
]
json.dump(
    {"duration": end, "sections": secs, "dialogue": [s for s in sents if s["speaker"] != "narrator"], "sentences": sents},
    open(f"{H}/sections.json", "w"), indent=1,
)
for s in sents:
    print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['speaker']:14s} {s['text'][:55]}")
print(f"intro_682={t_m0}-{t_m1} ({t_m1-t_m0:.2f}s) | intro_zeus={t_g0}-{t_g1} ({t_g1-t_g0:.2f}s) | duration={end}s")
