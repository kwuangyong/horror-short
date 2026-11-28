#!/usr/bin/env python3
"""scp096-vs-medusa voice: edge-tts + multi-layer blend FX (narrator dark blend, SCP-096 hollow distorted shriek,
SCP-096 dry whisper, Medusa venomous sibilant Gorgon voice) -> clips/u_NN.wav + units.json."""
import asyncio, json, os, re, subprocess, argparse
import numpy as np, edge_tts

ap = argparse.ArgumentParser()
ap.add_argument("--rate", default="+12%")
ap.add_argument("--pitch", default="-10Hz")
a = ap.parse_args()

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "script-anim.md")
CL = f"{HERE}/clips"
os.makedirs(CL, exist_ok=True)
SR = 24000
PROXY = os.environ.get("HTTPS_PROXY")

VOICES = {
    "narrator": ("en-US-ChristopherNeural", None, None),
    "scp096": ("en-US-GuyNeural", "+6%", "-8Hz"),
    "scp096_whisper": ("en-US-GuyNeural", "-22%", "-14Hz"),
    "medusa": ("en-GB-SoniaNeural", "-4%", "-10Hz"),
}

items = []
sec = -1
started = False
for line in open(SCRIPT, encoding="utf-8"):
    if line.startswith("## "):
        started = True
        sec += 1
    if started and line.startswith(">"):
        raw = line.lstrip("> ").strip()
        notes = " ".join(re.findall(r"\(([^)]*)\)", raw)).lower()
        body = re.sub(r"\([^)]*\)\s*", "", raw).replace("*", "").replace('"', "").replace("…", "...").strip()
        if "scp096" in notes and "whisper" in notes:
            spk = "scp096_whisper"
        elif "scp096" in notes:
            spk = "scp096"
        elif "medusa" in notes:
            spk = "medusa"
        else:
            spk = "narrator"
        if body:
            items.append((sec, body, spk))

units = []
for s, t, spk in items:
    first = True
    for p in re.split(r"(?<=[.?!])\s+", t):
        if p:
            units.append({"section": s, "text": p, "speaker": spk, "line_first": first})
            first = False

async def synth(text, spk):
    v, r, p = VOICES[spk]
    r = r or a.rate
    p = p or a.pitch
    for attempt in range(4):
        try:
            c = edge_tts.Communicate(text, v, rate=r, pitch=p, boundary="WordBoundary", proxy=PROXY)
            audio = b""
            wb = []
            async for ch in c.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    wb.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
            if audio:
                return audio, wb
        except Exception:
            if attempt == 3:
                raise
            await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Empty audio for {text}")

def decode(b):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
        input=b, capture_output=True, check=True,
    )
    return np.frombuffer(p.stdout, dtype=np.float32)

def trim(x):
    idx = np.where(np.abs(x) > 0.01)[0]
    if len(idx) == 0:
        return x, 0.0
    s0 = max(idx[0] - int(0.02 * SR), 0)
    return x[s0 : idx[-1] + int(0.08 * SR)], s0 / SR

def wr(path, x):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-b:a", "192k", path],
        input=x.tobytes(), check=True,
    )

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)

def char_fx(spk, raw, out):
    if spk == "narrator":
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=3[a][b][c];"
            "[a]equalizer=f=115:t=q:w=1:g=4.5,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3.5:makeup=4[l0];"
            "[b]asetrate=48000*0.82,aresample=48000,atempo=1.2195,lowpass=f=650,volume=0.45[l1];"
            "[c]adelay=18:all=1,highpass=f=1800,volume=0.22[l2];"
            "[l0][l1][l2]amix=inputs=3:normalize=0:duration=first,aecho=0.8:0.65:45|95:0.18|0.10,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "scp096":
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=4[a][b][c][d];"
            "[a]equalizer=f=2200:t=q:w=1.2:g=5,acompressor=threshold=-20dB:ratio=4:makeup=4[l0];"
            "[b]asetrate=48000*0.76,aresample=48000,atempo=1.3158,lowpass=f=500,volume=0.52[l1];"
            "[c]asetrate=48000*1.16,aresample=48000,atempo=0.862,highpass=f=1600,adelay=32:all=1,volume=0.35[l2];"
            "[d]adelay=65:all=1,bandpass=f=1200:w=800,volume=0.28[l3];"
            "[l0][l1][l2][l3]amix=inputs=4:normalize=0:duration=first,aecho=0.85:0.75:55|120:0.32|0.18,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "scp096_whisper":
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=2[a][b];"
            "[a]highpass=f=320,equalizer=f=3400:t=q:w=1.4:g=6,acompressor=threshold=-24dB:ratio=3:makeup=4[l0];"
            "[b]adelay=38:all=1,highpass=f=2400,volume=0.38[l1];"
            "[l0][l1]amix=inputs=2:normalize=0:duration=first,aecho=0.8:0.6:35:0.18,alimiter=limit=0.88",
            "-ar", "48000", out,
        )
    elif spk == "medusa":
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=3[a][b][c];"
            "[a]asetrate=48000*0.92,aresample=48000,atempo=1.087,equalizer=f=4800:t=q:w=1.2:g=4.5,acompressor=threshold=-22dB:ratio=3.5:makeup=4[l0];"
            "[b]asetrate=48000*0.78,aresample=48000,atempo=1.282,lowpass=f=520,volume=0.40[l1];"
            "[c]adelay=42:all=1,highpass=f=2800,volume=0.34[l2];"
            "[l0][l1][l2]amix=inputs=3:normalize=0:duration=first,aecho=0.85:0.72:50|110:0.28|0.14,alimiter=limit=0.89",
            "-ar", "48000", out,
        )

async def main():
    meta = []
    for i, u in enumerate(units):
        raw_mp3 = f"{CL}/raw_{i:02d}.mp3"
        out_wav = f"{CL}/u_{i:02d}.wav"
        b, wb = await synth(u["text"], u["speaker"])
        x, off = trim(decode(b))
        wr(raw_mp3, x)
        char_fx(u["speaker"], raw_mp3, out_wav)
        d0 = len(x) / SR
        d1 = dur(out_wav)
        sc = d1 / max(d0, 0.05)
        wlist = [{"word": w, "start": round(max(0.0, (s - off) * sc), 3), "end": round(max(0.02, (e - off) * sc), 3)} for w, s, e in wb]
        meta.append({**u, "file": f"u_{i:02d}.wav", "dur": round(d1, 3), "words": wlist})
        print(f"[{i:02d}] {u['speaker']:14s} {d1:4.2f}s | {u['text'][:55]}")
    json.dump(meta, open(f"{HERE}/units.json", "w"), ensure_ascii=False, indent=1)
    print(f"Total units: {len(meta)}")

if __name__ == "__main__":
    asyncio.run(main())
