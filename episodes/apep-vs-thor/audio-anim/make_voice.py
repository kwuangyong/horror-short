#!/usr/bin/env python3
"""apep-vs-thor voice: per-sentence clips (narrator Christopher +38% -10Hz -> voice_fx deep; Apep layered; Thor boom+hall+thunder;
kid whisper) -> clips/u_NN.wav + units.json (raw word times scaled to the fx clip). post_voice.py places them on the anchors.
Usage: python make_voice.py [--rate +38%] [--pitch -10Hz]"""
import asyncio, json, os, re, subprocess, argparse
import numpy as np, edge_tts
ap = argparse.ArgumentParser(); ap.add_argument("--rate", default="+12%"); ap.add_argument("--pitch", default="-10Hz")
a = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__)); SCRIPT = os.path.join(HERE, "..", "script-anim.md")
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..")); CL = f"{HERE}/clips"
SR = 24000; PROXY = os.environ.get("HTTPS_PROXY")
VOICES = {"narrator": ("en-US-ChristopherNeural", None, None),
          "apep": ("en-US-GuyNeural", "+8%", "-20Hz"),
          "apep_whisper": ("en-US-GuyNeural", "-28%", "-14Hz"),
          "thor": ("en-GB-RyanNeural", "+10%", "-22Hz"),
          "thor_hoarse": ("en-GB-RyanNeural", "-24%", "-14Hz"),
          "kid": ("en-US-AnaNeural", "-22%", "+0Hz")}  # v2: ~20% slower than v1 (narrator +12% vs +40%)
# anchor (final time, s) = start of the shot the line introduces, minus ~0.2 s; key = text prefix
ANCH = {"I am Apep": 4.4, "I am Thor": 10.9, "A kid slept": 17.4, "So they walked": 19.9, "Then Apep rose": 21.3,
        "But thunder": 22.7, "The kid ran": 25.1, "He buckled": 27.6, "His hammer": 28.8, "But Apep roared": 31.4,
        "Then its stare": 36.5, "Venom burned": 41.7, "Now the eclipse": 44.5, "Thor roared back": 48.5,
        "So he tore": 52.5, "Apep lunged": 55.0, "The beast spat": 59.6, "The kid stood": 61.1,
        "Go home": 64.0, "...Okay": 67.0, "At the next": 69.6, "I always": 72.4}
items = []; sec = -1; started = False
for line in open(SCRIPT, encoding="utf-8"):
    if line.startswith("## "): started = True; sec += 1
    if started and line.startswith(">"):
        raw = line.lstrip("> ").strip(); notes = " ".join(re.findall(r"\(([^)]*)\)", raw)).lower()
        body = re.sub(r"\([^)]*\)\s*", "", raw).replace("*", "").replace('"', "").replace("…", "...").strip()
        spk = ("apep_whisper" if "apep" in notes and "whisper" in notes and "layered" not in notes else "apep" if "apep" in notes else
               "thor_hoarse" if "thor" in notes and "hoarse" in notes else "thor" if "thor" in notes else
               "kid" if "kid" in notes else "narrator")
        if body: items.append((sec, body, spk))
units = []
for s, t, spk in items:
    first = True
    for p in re.split(r"(?<=[.?!])\s+", t):
        if p: units.append({"section": s, "text": p, "speaker": spk, "line_first": first}); first = False
async def synth(text, spk):
    v, r, p = VOICES[spk]; r = r or a.rate; p = p or a.pitch
    c = edge_tts.Communicate(text, v, rate=r, pitch=p, boundary="WordBoundary", proxy=PROXY)
    audio = b""; wb = []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary": wb.append((ch["text"], ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7))
    return audio, wb
def decode(b):
    p = subprocess.run(["ffmpeg","-v","error","-i","pipe:0","-f","f32le","-ac","1","-ar",str(SR),"pipe:1"], input=b, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32)
def trim(x):
    idx = np.where(np.abs(x) > 0.01)[0]
    s0 = max(idx[0]-int(.02*SR), 0)
    return x[s0: idx[-1]+int(.08*SR)], s0/SR
def wr(path, x):
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","pipe:0","-b:a","192k",path], input=x.tobytes(), check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
def ff(*args): subprocess.run(["ffmpeg","-v","error","-y",*args], check=True)
def char_fx(spk, raw, out):
    d = dur(raw)
    if spk == "narrator":
        subprocess.run(["bash", f"{ROOT}/tools/voice_fx.sh", raw, out, "deep"], check=True)
    elif spk == "apep":
        # layered: main -3 st + whisper layer +40 ms (breathy, high-passed) + hiss/rasp layer (sibilants, crushed) + low shadow; slow, cold hall
        ff("-i", raw, "-filter_complex",
           "[0:a]aresample=48000,asplit=4[a][b][c][e];"
           "[a]rubberband=pitch=0.8409:formant=preserved,equalizer=f=120:t=q:w=1:g=4,acompressor=threshold=-22dB:ratio=4:makeup=4[l0];"
           "[b]rubberband=pitch=0.9439,highpass=f=2200,adelay=40:all=1,volume=0.9[l1];"
           "[c]highpass=f=5200,acrusher=bits=6:mix=0.35,equalizer=f=7500:t=q:w=1:g=7,adelay=22:all=1,volume=1.5[l2];"
           "[e]rubberband=pitch=0.6674,lowpass=f=900,volume=0.6[l3];"
           "[l0][l1][l2][l3]amix=inputs=4:normalize=0:duration=first,aecho=0.8:0.6:70|130:0.25|0.15,atempo=0.97,alimiter=limit=0.89", "-ar", "48000", out)
    elif spk == "apep_whisper":   # dry, close, breathy: no reverb
        ff("-i", raw, "-filter_complex",
           "[0:a]aresample=48000,asplit=2[a][b];"
           "[a]rubberband=pitch=0.9,highpass=f=140,equalizer=f=6500:t=q:w=1:g=7,acompressor=threshold=-26dB:ratio=3:makeup=5[l0];"
           "[b]highpass=f=5000,acrusher=bits=7:mix=0.3,adelay=30:all=1,volume=1.3[l1];"
           "[l0][l1]amix=inputs=2:normalize=0:duration=first,volume=2.4,alimiter=limit=0.85", "-ar", "48000", out)
    elif spk in ("thor", "thor_hoarse"):
        hoarse = spk == "thor_hoarse"
        pit = "0.8909" if hoarse else "0.8409"
        grit = "acrusher=bits=7:mix=0.2,highpass=f=100," if hoarse else ""
        hall = "aecho=0.8:0.75:80|190|330:0.35|0.25|0.15" if hoarse else "aecho=0.85:0.9:90|210|380|620:0.5|0.38|0.28|0.18"
        thunder = "" if hoarse else f";anoisesrc=d={d+0.9:.2f}:c=brown:r=48000,lowpass=f=130,tremolo=f=2.3:d=0.7,afade=t=in:d=0.2,afade=t=out:st={max(d-0.2,0):.2f}:d=0.9,volume=9[t]"
        fc = (f"[0:a]aresample=48000,rubberband=pitch={pit}:formant=preserved,equalizer=f=100:t=q:w=1:g=6,equalizer=f=2800:t=q:w=1:g=-2,{grit}"
              f"acompressor=threshold=-22dB:ratio=4:makeup=5,{hall}[v]" + thunder)
        fc += (";[v][t]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89" if not hoarse else ";[v]volume=1.1,alimiter=limit=0.89[o]")
        if not hoarse: fc += "[o]"
        ff("-i", raw, "-filter_complex", fc, "-map", "[o]", "-ar", "48000", out)
    else:  # kid: child-like whisper
        ff("-i", raw, "-af", "aresample=48000,rubberband=pitch=1.12,highpass=f=170,equalizer=f=5500:t=q:w=1:g=4,"
           "acompressor=threshold=-24dB:ratio=3:makeup=5,aecho=0.8:0.5:55:0.12,volume=2.2,alimiter=limit=0.8", "-ar", "48000", out)
async def main():
    for i, u in enumerate(units):
        raw = f"{CL}/u_{i:02d}_raw.mp3"; fx = f"{CL}/u_{i:02d}.wav"; meta = f"{CL}/u_{i:02d}.json"
        audio, wb = await synth(u["text"], u["speaker"])
        x, lead = trim(decode(audio)); wr(raw, x); char_fx(u["speaker"], raw, fx)
        k = dur(fx)/(len(x)/SR)
        u.update(file=os.path.basename(fx), dur=dur(fx), k=k,
                 words=[{"word": w, "start": max(b-lead, 0)*k, "end": max(e-lead, 0)*k} for w, b, e in wb])
        pre = [p for p in ANCH if u["text"].startswith(p)]
        u["anchor"] = ANCH[pre[0]] if pre and u["line_first"] else None
        print(i, u["speaker"], round(u["dur"], 2), u["text"][:40], flush=True)
    json.dump(units, open(f"{HERE}/units.json", "w"), indent=1, ensure_ascii=False)
asyncio.run(main())
