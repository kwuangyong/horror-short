#!/usr/bin/env python3
"""scp682-vs-zeus voice: edge-tts + multi-layer blend FX (narrator dark blend, SCP-682 guttural reptilian roar,
SCP-682 dry whisper, Zeus thunderous god-king boom) -> clips/u_NN.wav + units.json."""
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
    "scp682": ("en-US-GuyNeural", "+8%", "-22Hz"),
    "scp682_whisper": ("en-US-GuyNeural", "-22%", "-18Hz"),
    "zeus": ("en-GB-RyanNeural", "+4%", "-18Hz"),
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
        if "scp682" in notes and "whisper" in notes:
            spk = "scp682_whisper"
        elif "scp682" in notes:
            spk = "scp682"
        elif "zeus" in notes:
            spk = "zeus"
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
    d = dur(raw)
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
    elif spk == "scp682":
        ff(
            "-i", raw, "-filter_complex",
            f"[0:a]aresample=48000,asplit=4[a][b][c][e];"
            f"[a]asetrate=48000*0.84,aresample=48000,atempo=1.1905,equalizer=f=120:t=q:w=1:g=5.5,acompressor=threshold=-22dB:ratio=4:makeup=4[l0];"
            f"[b]highpass=f=2200,acrusher=bits=5:mix=0.42,adelay=32:all=1,volume=0.90[l1];"
            f"[c]asetrate=48000*0.68,aresample=48000,atempo=1.4706,lowpass=f=620,volume=0.72[l2];"
            f"[e]adelay=55:all=1,bandpass=f=820:w=500,volume=0.38[l3];"
            f"anoisesrc=d={d+0.5:.2f}:c=brown:r=48000,lowpass=f=110,afade=t=in:d=0.15,afade=t=out:st={max(d-0.15,0):.2f}:d=0.5,volume=5.5[r];"
            f"[l0][l1][l2][l3][r]amix=inputs=5:normalize=0:duration=first,aecho=0.85:0.75:70|155|250:0.32|0.20|0.12,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "zeus":
        # Thunderous God-King boom: deep authoritative chest + sub-bass octave + sky-thunder rumble + Olympus hall echo
        ff(
            "-i", raw, "-filter_complex",
            f"[0:a]aresample=48000,asplit=3[a][b][c];"
            f"[a]asetrate=48000*0.86,aresample=48000,atempo=1.1628,equalizer=f=110:t=q:w=1:g=6,equalizer=f=3600:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=4:makeup=4.5[l0];"
            f"[b]asetrate=48000*0.68,aresample=48000,atempo=1.4706,lowpass=f=480,volume=0.62[l1];"
            f"[c]adelay=34:all=1,highpass=f=2200,volume=0.30[l2];"
            f"anoisesrc=d={d+0.5:.2f}:c=brown:r=48000,lowpass=f=95,afade=t=in:d=0.15,afade=t=out:st={max(d-0.15,0):.2f}:d=0.5,volume=4.5[r];"
            f"[l0][l1][l2][r]amix=inputs=4:normalize=0:duration=first,aecho=0.85:0.86:95|210|360:0.44|0.30|0.18,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    else:  # scp682_whisper
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=2[a][b];"
            "[a]asetrate=48000*0.86,aresample=48000,atempo=1.1628,highpass=f=150,equalizer=f=5400:t=q:w=1:g=6,acompressor=threshold=-26dB:ratio=3:makeup=5[l0];"
            "[b]adelay=36:all=1,highpass=f=3000,acrusher=bits=7:mix=0.25,volume=0.72[l1];"
            "[l0][l1]amix=inputs=2:normalize=0:duration=first,aecho=0.8:0.65:75|160:0.22|0.12,volume=1.9,alimiter=limit=0.85",
            "-ar", "48000", out,
        )

async def main():
    meta = []
    for i, u in enumerate(units):
        mp3, wb = await synth(u["text"], u["speaker"])
        x, s0 = trim(decode(mp3))
        raw = f"{CL}/r_{i:02d}.mp3"
        out = f"{CL}/u_{i:02d}.wav"
        wr(raw, x)
        char_fx(u["speaker"], raw, out)
        d = dur(out)
        ws = [{"word": w, "start": round(max(a0 - s0, 0), 3), "end": round(max(b0 - s0, 0), 3)} for w, a0, b0 in wb]
        meta.append({**u, "file": f"u_{i:02d}.wav", "dur": round(d, 3), "words": ws})
        print(f"u_{i:02d} [{u['speaker']:14s}] {d:5.2f}s | {u['text'][:60]}")
    json.dump(meta, open(f"{HERE}/units.json", "w"), ensure_ascii=False, indent=1)
    print(f"Total units: {len(meta)}")

asyncio.run(main())
