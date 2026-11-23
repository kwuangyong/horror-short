#!/usr/bin/env python3
"""voice_fx deep on voice_narr.mp3 -> voice_dark.wav; scale word timings; sections.json (named)."""
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
subprocess.run(["bash", f"{R}/tools/voice_fx.sh", f"{H}/voice_narr.mp3", f"{H}/voice_dark.wav", "deep"], check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
raw = json.load(open(f"{H}/sections_raw.json")); d_fx = dur(f"{H}/voice_dark.wav"); k = d_fx/raw["duration"]
names = ["hook","split_roll","arena","R1","R2","R3","KO","peace","cliffhanger","CTA"]
words = [{"word": w["word"], "start": round(w["start"]*k,3), "end": round(w["end"]*k,3)} for w in json.load(open(f"{H}/words_raw.json"))]
json.dump(words, open(f"{H}/words.json","w"), ensure_ascii=False, indent=1)
secs = [{"section": s["section"], "name": names[s["section"]], "start": round(s["start"]*k,2)} for s in raw["sections"]]
json.dump({"scale": k, "duration": d_fx, "sections": secs, "sentences": [dict(x, start=round(x["start"]*k,2)) for x in raw["sentences"]]}, open(f"{H}/sections.json","w"), indent=1)
print("scale", k, "voice_dark", d_fx, [(s["name"], s["start"]) for s in secs])
