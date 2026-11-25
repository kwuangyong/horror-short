#!/usr/bin/env python3
"""Place clips on the shot anchors (gap 0.15-0.25 s inside a line; a line never starts before its anchor) -> voice_dark.wav, words.json, sections.json."""
import json, os, subprocess, wave
import numpy as np
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000
U = json.load(open(f"{H}/units.json"))
def load(p):
    r = subprocess.run(["ffmpeg","-v","error","-i",p,"-f","f32le","-ac","1","-ar",str(SR),"pipe:1"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)
t = 0.0; out = np.zeros(int(90*SR), np.float32); words = []; sents = []; prev_end = None; log = []
for u in U:
    x = load(f"{H}/clips/{u['file']}")
    gap = 0.2 if u["speaker"].startswith("apep") else 0.15
    start = (prev_end + gap) if prev_end is not None else 0.0
    if u["anchor"] is not None: start = max(start, u["anchor"]); late = start - u["anchor"]
    else: late = 0.0
    out[int(start*SR): int(start*SR)+len(x)] += x
    for w in u["words"]:
        words.append({"word": w["word"], "start": round(start+w["start"], 3), "end": round(start+w["end"], 3), "speaker": "narrator" if u["speaker"] == "narrator" else u["speaker"].split("_")[0]})
    sents.append({"section": u["section"], "speaker": u["speaker"], "text": u["text"], "start": round(start, 2), "end": round(start+len(x)/SR, 2), "late": round(late, 2)})
    prev_end = start + len(x)/SR
end = prev_end + 0.4
out = np.tanh(out[: int(end*SR)] * 1.0) if False else out[: int(end*SR)]
subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","pipe:0","-af","alimiter=limit=0.89","voice_dark.wav"], input=out.tobytes(), check=True, cwd=H)
json.dump(words, open(f"{H}/words.json","w"), ensure_ascii=False, indent=1)
def first(p): return [s for s in sents if s["text"].startswith(p)][0]
secs = [{"section": 0, "name": "hook", "start": 0.0}, {"section": 1, "name": "split_roll", "start": 3.0},
        {"name": "intro_apep", "start": first("I am Apep")["start"], "end": first("Tonight, I")["end"]},
        {"name": "intro_thor", "start": first("I am Thor")["start"], "end": first("Crawl")["end"]},
        {"section": 2, "name": "story", "start": first("A kid slept")["start"]},
        {"name": "fight", "start": first("He buckled")["start"]}, {"name": "totality", "start": first("Now the eclipse")["start"]},
        {"name": "beams", "start": first("Thor roared back")["start"]}, {"name": "finale", "start": first("Apep lunged")["start"]},
        {"name": "dawn", "start": first("The beast spat")["start"]}, {"name": "cliffhanger", "start": first("At the next")["start"]},
        {"name": "whisper", "start": first("I always")["start"]}]
json.dump({"duration": end, "sections": secs, "dialogue": [s for s in sents if s["speaker"] != "narrator"], "sentences": sents}, open(f"{H}/sections.json","w"), indent=1)
for s in sents: print(f"{s['start']:6.2f}-{s['end']:6.2f} late {s['late']:.2f} {s['speaker']:12s} {s['text'][:48]}")
print("voice_dark", round(end,2))
