#!/usr/bin/env python3
"""Synthesize battle narration with edge-tts (WordBoundary timings) -> voice.mp3, words_raw.json, sections.json.
Usage: python make_voice.py [--rate -15%] [--pitch -10Hz]"""
import asyncio, json, os, re, subprocess, sys, argparse
import numpy as np, edge_tts
ap = argparse.ArgumentParser(); ap.add_argument("--rate", default="-15%"); ap.add_argument("--pitch", default="-10Hz")
a = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__)); SCRIPT = os.path.join(HERE, "..", "script-anim.md")
SR = 24000; PROXY = os.environ.get("HTTPS_PROXY")
VOICE = "en-US-ChristopherNeural"
# parse: (section, text, is_eleni)
items = []; sec = -1; started = False
for line in open(SCRIPT, encoding="utf-8"):
    if line.startswith("## "): started = True; sec += 1
    if started and line.startswith(">"):
        raw = line.lstrip("> ").strip(); notes = " ".join(re.findall(r"\(([^)]*)\)", raw)).lower()
        body = re.sub(r"\([^)]*\)\s*", "", raw).replace("*", "").strip()
        if body: items.append((sec, body, "voice" in notes))
# split into sentences-lines for pacing
units = []
for s, t, el in items:
    if el: continue
    first = True
    for p in re.split(r"(?<=[.?!])\s+", t):
        if p: units.append((s, p, False, first)); first = False
async def synth(text, rate, pitch):
    c = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
    audio = b""; wb = []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            wb.append((ch["text"], ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7))
    return audio, wb
def decode(b):
    p = subprocess.run(["ffmpeg","-v","error","-i","pipe:0","-f","f32le","-ac","1","-ar",str(SR),"pipe:1"], input=b, capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32)
def trim(x):
    idx = np.where(np.abs(x) > 0.01)[0]
    return x[max(idx[0]-int(.02*SR),0): idx[-1]+int(.08*SR)] , (max(idx[0]-int(.02*SR),0))/SR
async def main():
    tracks = []; words = []; marks = []; t = 0.0; prev_sec = None; narr = []; eleni = None
    out = np.zeros(0, np.float32); narr_out = np.zeros(0, np.float32)
    def add_sil(d):
        nonlocal out, narr_out
        z = np.zeros(int(d*SR), np.float32); out = np.concatenate([out, z]); narr_out = np.concatenate([narr_out, z])
    for i, (s, text, el, newline) in enumerate(units):
        txt = text.replace("…", "...")
        if el: rate, pitch = "-25%", "-4Hz"
        else: rate, pitch = a.rate, a.pitch
        audio, wb = await synth(txt, rate, pitch)
        x = decode(audio); x, lead = trim(x)
        # gap before
        if prev_sec is not None:
            if s != prev_sec: gap = {1: 2.2, 2: 1.4}.get(s, 0.8 if s in (3,4,5,6,7,8,9) else 0.6)
            elif s == 1: gap = 0.9 if newline else 0.3
            elif newline: gap = 0.5
            else: gap = 0.25
            
            add_sil(gap)
        if text.startswith("One knock"): add_sil(0.9)
        if s != prev_sec: marks.append({"section": s, "start": round(len(out)/SR, 2)})
        st = len(out)/SR
        for w, b, e in wb:
            words.append({"word": w, "start": round(st + max(b-lead,0), 3), "end": round(st + max(e-lead,0), 3), "eleni": el})
        out = np.concatenate([out, x])
        narr_out = np.concatenate([narr_out, x])
        if text.startswith("One"): pass  # extra air before the knock
        prev_sec = s
    add_sil(0.5)
    def wr(path, x):
        subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","pipe:0","-b:a","192k",path], input=x.tobytes(), check=True)
    wr(os.path.join(HERE,"voice.mp3"), out); wr(os.path.join(HERE,"voice_narr.mp3"), narr_out)
    json.dump(words, open(os.path.join(HERE,"words_raw.json"),"w"), indent=1)
    json.dump({"eleni_start": None, "sections": marks, "duration": len(out)/SR}, open(os.path.join(HERE,"sections_raw.json"),"w"), indent=1)
    print("duration", len(out)/SR, "words", len(words), "units", len(units))
asyncio.run(main())
