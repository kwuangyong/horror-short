#!/usr/bin/env python3
"""Place voice clips on Story Hook + Split-Roll + Battle Spin anchors -> voice_dark.wav, words.json, sections.json."""
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
    "Until the ocean": 0.45,
    "The tremors woke": 0.45,
    "I am Typhon": 2.65,          # WHO SURVIVES? slam + glitch + split-roll spin + lock L + dive L
    "I am Cthulhu": 1.65,         # emerge L -> lock R -> dive R
    "Typhon blasted": 1.50,       # emerge R -> VS slam -> shatter back to ocean
    "Cthulhu rose": 0.45,
    "The sailors scrambled": 0.35,
    "Typhon beat": 0.65,          # 1v1 establishing shot
    "Cthulhu spread": 0.40,
    "Furious, Typhon": 0.40,
    "Cthulhu summoned": 0.50,
    "Typhon's hundred-headed": 0.45,
    "His serpent coils": 0.45,
    "Burn in my fire": 0.35,
    "A flaming tidal": 0.55,
    "Yet Cthulhu was never": 0.45,
    "His psychic": 0.40,
    "Trapped, Typhon": 0.50,
    "Drown in madness": 0.35,
    "R'lyeh's stone": 0.55,
    "At last, the storm": 0.90,   # Typhon sinks + monoliths subside
    "Go home, sailors": 0.50,
    "...Are we safe": 0.45,
    "By midnight": 0.55,
    "Until the stars": 0.65,      # Beat 2: music cuts dead here
    "The stars are almost": 1.05, # Beat 3: green mist + eyes snap open
}

out = np.zeros(int(150 * SR), np.float32)
words = []
sents = []
prev_end = None

for u in U:
    x = load(f"{H}/clips/{u['file']}")
    if prev_end is None:
        start = 0.35  # Story Hook narration opens right over the midnight fishing fleet
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

end = round(prev_end + 1.0, 2)
out = out[: int(end * SR)]
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", "alimiter=limit=0.89", "voice_dark.wav"],
    input=out.tobytes(), check=True, cwd=H,
)
json.dump(words, open(f"{H}/words.json", "w"), ensure_ascii=False, indent=1)

def first(p):
    return [s for s in sents if s["text"].startswith(p)][0]

t_hook_end = round(first("The tremors woke")["end"] + 1.15, 2)
t_ty0 = first("I am Typhon")["start"]
t_ty1 = first("Tonight, the sea")["end"]
t_ct0 = first("I am Cthulhu")["start"]
t_ct1 = first("Now face")["end"]

secs = [
    {"section": 0, "name": "hook", "start": 0.0, "end": t_hook_end},
    {"section": 1, "name": "split_roll", "start": t_hook_end},
    {"name": "intro_typhon", "start": t_ty0, "end": t_ty1},
    {"name": "intro_cthulhu", "start": t_ct0, "end": t_ct1},
    {"section": 2, "name": "story", "start": first("Typhon blasted")["start"]},
    {"name": "fight", "start": first("Typhon beat")["start"]},
    {"name": "rlyeh", "start": first("Cthulhu summoned")["start"]},
    {"name": "climax", "start": first("Trapped, Typhon")["start"]},
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
print(f"hookEnd={t_hook_end} | intro_typhon={t_ty0}-{t_ty1} | intro_cthulhu={t_ct0}-{t_ct1} | duration={end}")
