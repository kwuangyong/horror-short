#!/usr/bin/env python3
"""Run voice_fx, scale word timings (tempo 0.94), overlay whispered Eleni line -> voice_dark.wav, words.json, sections.json"""
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..", "..")
fx = os.path.join(R, "tools", "voice_fx.sh")
def sh(*c): subprocess.run(c, check=True)
sh("bash", fx, f"{H}/voice_narr.mp3", f"{H}/voice_narr_dark.wav", "deep")
sh("bash", fx, f"{H}/eleni_raw.mp3", f"{H}/eleni_fx.wav", "whisper")
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
raw = json.load(open(f"{H}/sections_raw.json")); d_raw = raw["duration"]; d_fx = dur(f"{H}/voice_narr_dark.wav")
k = d_fx / d_raw
print("raw", d_raw, "fx", d_fx, "scale", k)
es = raw["eleni_start"] * k
# overlay Eleni (extra reverb/low-pass for aged, distant feel)
sh("ffmpeg","-v","error","-y","-i",f"{H}/voice_narr_dark.wav","-i",f"{H}/eleni_fx.wav","-filter_complex",
   f"[1:a]lowpass=f=4500,aecho=0.8:0.6:120|240:0.25|0.15,volume=1.3,adelay={int(es*1000)}:all=1[e];[0:a][e]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89",
   "-ar","48000",f"{H}/voice_dark.wav")
words = [{"word": w["word"], "start": round(w["start"]*k,3), "end": round(w["end"]*k,3)} for w in json.load(open(f"{H}/words_raw.json"))]
json.dump(words, open(f"{H}/words.json","w"), ensure_ascii=False, indent=1)
secs = [{"section": s["section"], "start": round(s["start"]*k,2)} for s in raw["sections"]]
json.dump({"scale": k, "duration": dur(f"{H}/voice_dark.wav"), "sections": secs}, open(f"{H}/sections.json","w"), indent=1)
print("voice_dark", dur(f"{H}/voice_dark.wav"))
