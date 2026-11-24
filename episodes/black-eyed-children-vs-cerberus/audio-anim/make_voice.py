#!/usr/bin/env python3
"""v6: narration (Christopher) + 2 character lines (Grim: GuyNeural+demon fx+growl, kid: AnaNeural whisper).
-> voice_narr.mp3 (character slots silent), char_N_fx.wav, words_raw.json (speaker per word), sections_raw.json.
Usage: python make_voice.py [--rate +5%] [--pitch -10Hz]"""
import asyncio, json, os, re, subprocess, argparse
import numpy as np, edge_tts
ap = argparse.ArgumentParser(); ap.add_argument("--rate", default="+5%"); ap.add_argument("--pitch", default="-10Hz")
a = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__)); SCRIPT = os.path.join(HERE, "..", "script-anim.md")
ROOT = os.path.join(HERE, "..", "..", "..")
SR = 24000; PROXY = os.environ.get("HTTPS_PROXY"); KNOM = 1.0639   # nominal deep-preset stretch
VOICES = {"narrator": ("en-US-ChristopherNeural", None, None),
          "cerberus": ("en-US-GuyNeural", "-22%", "-18Hz"),
          "children": ("en-US-AnaNeural", "-14%", "-8Hz"),
          "children2": ("en-GB-MaisieNeural", "-14%", "-6Hz"),
          "kid_mimic": ("en-US-AnaNeural", "-12%", "-4Hz"),
          "kid": ("en-US-AnaNeural", "-8%", "+0Hz")}
items = []; sec = -1; started = False
for line in open(SCRIPT, encoding="utf-8"):
    if line.startswith("## "): started = True; sec += 1
    if started and line.startswith(">"):
        raw = line.lstrip("> ").strip(); notes = " ".join(re.findall(r"\(([^)]*)\)", raw)).lower()
        body = re.sub(r"\([^)]*\)\s*", "", raw).replace("*", "").replace('"', "").strip()
        spk = ("cerberus" if "cerberus" in notes else "children" if "children" in notes else
               "kid_mimic" if ("kid" in notes and "flat" in notes) else "kid" if "kid" in notes else "narrator")
        if body: items.append((sec, body, spk))
units = []
for s, t, spk in items:
    first = True
    for p in re.split(r"(?<=[.?!])\s+", t):
        if p: units.append((s, p, spk, first)); first = False
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
    return x[max(idx[0]-int(.02*SR),0): idx[-1]+int(.08*SR)], (max(idx[0]-int(.02*SR),0))/SR
def wr(path, x):
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","pipe:0","-b:a","192k",path], input=x.tobytes(), check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
def char_fx(spk, raw, out, raw2=None):
    R = ROOT + "/tools"
    if spk == "cerberus":
        d = dur(raw)
        # 3 layers: base, -5 st (late 35 ms), +3 st (late 70 ms) + low-passed growl underneath
        subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-i",f"{HERE}/growl.wav","-filter_complex",
            "[0:a]aresample=48000,asplit=3[a][b][c];"
            "[a]rubberband=pitch=0.8909:formant=preserved,equalizer=f=110:t=q:w=1:g=4,acompressor=threshold=-22dB:ratio=4:makeup=4[l0];"
            "[b]rubberband=pitch=0.7492,adelay=35:all=1,volume=0.75[l1];"
            "[c]rubberband=pitch=1.1892,adelay=70:all=1,lowpass=f=3500,volume=0.5[l2];"
            f"[1:a]aresample=48000,pan=mono|c0=c0,lowpass=f=450,volume=0.4,atrim=0:{d+0.1:.3f}[g];"
            "[l0][l1][l2][g]amix=inputs=4:normalize=0:duration=first,aecho=0.8:0.6:60|110:0.2|0.12,alimiter=limit=0.89", "-ar","48000", out], check=True)
    elif spk == "children":   # two flat child voices, a few ms apart, cold room
        subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-i",raw2,"-filter_complex",
            "[0:a]aresample=48000,highpass=f=180,volume=1.5[a];[1:a]aresample=48000,highpass=f=180,adelay=14:all=1,volume=1.3[b];"
            "[a][b]amix=inputs=2:normalize=0:duration=longest,acompressor=threshold=-24dB:ratio=3:makeup=4,aecho=0.8:0.6:90|170:0.3|0.2,alimiter=limit=0.85", "-ar","48000", out], check=True)
    elif spk == "kid_mimic":  # the kid's voice, flat, echoing and warped
        subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af",
            "aresample=48000,highpass=f=160,acompressor=threshold=-24dB:ratio=3:makeup=4,"
            "aecho=0.8:0.7:110|220|330:0.4|0.3|0.2,chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3,volume=1.2,alimiter=limit=0.85", "-ar","48000", out], check=True)
    else:  # kid whisper
        subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af",
            "aresample=48000,highpass=f=160,equalizer=f=5500:t=q:w=1:g=4,acompressor=threshold=-24dB:ratio=3:makeup=5,aecho=0.8:0.5:55:0.12,volume=2.2,alimiter=limit=0.8",
            "-ar","48000", out], check=True)
async def main():
    words = []; marks = []; sents = []; chars = []; prev_sec = None; prev_spk = None
    out = np.zeros(0, np.float32); ci = 0
    def add_sil(d): nonlocal out; out = np.concatenate([out, np.zeros(int(d*SR), np.float32)])
    for i, (s, text, spk, newline) in enumerate(units):
        audio, wb = await synth(text.replace("…", "..."), spk)
        x, lead = trim(decode(audio)); x2 = None
        if spk == "children":
            a2, _ = await synth(text, "children2"); x2, _ = trim(decode(a2))
        if prev_sec is not None:
            if s != prev_sec: gap = {1: 1.3, 2: 0.9}.get(s, 0.45)
            elif s == 1: gap = 0.55 if newline else 0.25
            elif spk == "children" and s == 5: gap = 1.1     # room for the single knock
            elif spk != prev_spk: gap = 0.55          # air before/after dialogue
            elif newline: gap = 0.3
            else: gap = 0.2 if spk == "narrator" else 0.3
            add_sil(gap)
        if s != prev_sec: marks.append({"section": s, "start": round(len(out)/SR, 2)})
        st = len(out)/SR
        sents.append({"section": s, "speaker": spk, "text": text, "start": round(st, 2)})
        if spk == "narrator":
            for w, b, e in wb:
                words.append({"word": w, "start": round(st+max(b-lead,0),3), "end": round(st+max(e-lead,0),3), "speaker": spk})
            out = np.concatenate([out, x])
        else:
            raw = f"{HERE}/char_{ci}_raw.mp3"; fx = f"{HERE}/char_{ci}_fx.wav"; wr(raw, x)
            raw2 = None
            if x2 is not None: raw2 = f"{HERE}/char_{ci}_raw2.mp3"; wr(raw2, x2)
            char_fx(spk, raw, fx, raw2)
            d_fx = dur(fx); k = d_fx/(len(x)/SR)            # fx clip vs raw clip
            for w, b, e in wb:     # stored in "pre-stretch" time so post_voice's x k lands on final time
                words.append({"word": w, "start": round(st+max(b-lead,0)*k/KNOM,3), "end": round(st+max(e-lead,0)*k/KNOM,3), "speaker": spk})
            chars.append({"file": os.path.basename(fx), "speaker": spk, "start": st, "text": text})
            add_sil(d_fx/KNOM); ci += 1
        prev_sec = s; prev_spk = spk
    add_sil(0.5)
    wr(os.path.join(HERE,"voice_narr.mp3"), out)
    json.dump(words, open(f"{HERE}/words_raw.json","w"), indent=1)
    json.dump({"sections": marks, "sentences": sents, "chars": chars, "duration": len(out)/SR}, open(f"{HERE}/sections_raw.json","w"), indent=1)
    print("duration", len(out)/SR, "words", len(words), "units", len(units), "chars", len(chars))
asyncio.run(main())
