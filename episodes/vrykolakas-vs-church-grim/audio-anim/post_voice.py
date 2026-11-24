#!/usr/bin/env python3
"""deep fx on narrator, overlay character clips at their slots -> voice_dark.wav, words.json (speaker per word), sections.json."""
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
subprocess.run(["bash", f"{R}/tools/voice_fx.sh", f"{H}/voice_narr.mp3", f"{H}/voice_narr_dark.wav", "deep"], check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
raw = json.load(open(f"{H}/sections_raw.json")); k = dur(f"{H}/voice_narr_dark.wav")/raw["duration"]
ins = ["-i", f"{H}/voice_narr_dark.wav"]; flt = []; labs = ["[0:a]"]
for n, c in enumerate(raw["chars"]):
    ins += ["-i", f"{H}/{c['file']}"]; ms = int(c["start"]*k*1000)
    flt.append(f"[{n+1}:a]aresample=48000,adelay={ms}:all=1[c{n}]"); labs.append(f"[c{n}]")
flt.append("".join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=first,alimiter=limit=0.89")
subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",";".join(flt),"-ar","48000",f"{H}/voice_dark.wav"], check=True)
names = ["hook","split_roll","arena","R1","R2","R3","KO","dawn","cliffhanger","CTA"]
words = [{"word": w["word"], "start": round(w["start"]*k,3), "end": round(w["end"]*k,3), "speaker": w["speaker"]} for w in json.load(open(f"{H}/words_raw.json"))]
json.dump(words, open(f"{H}/words.json","w"), ensure_ascii=False, indent=1)
secs = [{"section": s["section"], "name": names[s["section"]], "start": round(s["start"]*k,2)} for s in raw["sections"]]
sents = [dict(x, start=round(x["start"]*k,2)) for x in raw["sentences"]]
cta = [x for x in sents if x["text"].startswith("Nobody burned")][0]["start"]
secs.append({"section": 9, "name": "CTA", "start": cta})
dial = [x for x in sents if x["speaker"] != "narrator"]
json.dump({"scale": k, "duration": dur(f"{H}/voice_dark.wav"), "sections": secs, "dialogue": dial, "sentences": sents}, open(f"{H}/sections.json","w"), indent=1)
print("scale", k, "voice_dark", dur(f"{H}/voice_dark.wav"), [(s["name"], s["start"]) for s in secs]); print(dial)
