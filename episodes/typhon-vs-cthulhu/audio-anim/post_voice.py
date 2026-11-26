#!/usr/bin/env python3
"""Place voice clips on battle-spin anchors -> voice_dark.wav, words.json, sections.json."""
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

# Extra breathing room before key dramatic beats (seconds added after prev_end)
EXTRA_GAP = {
    "I am Cthulhu": 1.65,         # emerge L -> lock R -> dive R
    "On a moonless": 1.45,        # emerge R -> VS slam -> shatter
    "Suddenly the sea": 0.45,
    "Yet the tremors": 0.45,
    "The kid scrambled": 0.35,
    "Typhon beat": 0.65,          # 1v1 establishing shot
    "Then Cthulhu spread": 0.40,
    "Furious, Typhon": 0.40,
    "So Cthulhu summoned": 0.55,
    "But Typhon unleashed": 0.45,
    "His serpent coils": 0.40,
    "Burn in my fire": 0.35,
    "Meanwhile, a flaming": 0.55,
    "Yet Cthulhu was never": 0.45,
    "Then his psychic": 0.40,
    "Trapped in the waves": 0.50,
    "Drown in madness": 0.35,
    "As R'lyeh's stone": 0.60,
    "At last, the storm": 0.90,   # Typhon sinks + monoliths subside
    "Go home, little": 0.50,
    "...Are you staying": 0.45,
    "By midnight": 0.55,
    "Until the stars": 0.65,      # Beat 2: music cuts dead here
    "The stars are almost": 1.05, # Beat 3: green mist + eyes snap open
}

out = np.zeros(int(140 * SR), np.float32)
words = []
sents = []
prev_end = None

for u in U:
    x = load(f"{H}/clips/{u['file']}")
    if prev_end is None:
        start = 4.5  # first intro line (hook 0-3s + split-roll lock L)
    else:
        gap = 0.24
        if u["line_first"]:
            gap = 0.32
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

end = round(prev_end + 1.0, 2)
out = out[: int(end * SR)]
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", "alimiter=limit=0.89", "voice_dark.wav"],
    input=out.tobytes(), check=True, cwd=H,
)
json.dump(words, open(f"{H}/words.json", "w"), ensure_ascii=False, indent=1)

def first(p):
    return [s for s in sents if s["text"].startswith(p)][0]

secs = [
    {"section": 0, "name": "hook", "start": 0.0},
    {"section": 1, "name": "split_roll", "start": 3.0},
    {"name": "intro_typhon", "start": first("I am Typhon")["start"], "end": first("Tonight, the sea")["end"]},
    {"name": "intro_cthulhu", "start": first("I am Cthulhu")["start"], "end": first("Now face")["end"]},
    {"section": 2, "name": "story", "start": first("On a moonless")["start"]},
    {"name": "fight", "start": first("Typhon beat")["start"]},
    {"name": "rlyeh", "start": first("So Cthulhu summoned")["start"]},
    {"name": "climax", "start": first("Trapped in the waves")["start"]},
    {"name": "aftermath", "start": first("At last, the storm")["start"]},
    {"name": "cliffhanger", "start": first("By midnight")["start"]},
    {"name": "stars_cut", "start": first("Until the stars")["start"]},
    {"name": "whisper", "start": first("The stars are almost")["start"]},
]
json.dump(
    {"duration": end, "sections": secs, "dialogue": [s for s in sents if s["speaker"] != "narrator"], "sentences": sents},
    open(f"{H}/sections.json", "w"), indent=1,
)
for s in sents:
    print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['speaker']:15s} {s['text'][:52]}")
print("voice_dark duration:", end)
