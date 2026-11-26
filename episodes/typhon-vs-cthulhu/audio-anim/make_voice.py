#!/usr/bin/env python3
"""typhon-vs-cthulhu voice: edge-tts + multi-layer blend FX (narrator blend, Typhon layered volcanic roar,
Cthulhu deep abyssal psychic boom, Cthulhu whisper, kid whisper) -> clips/u_NN.wav + units.json."""
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
    "typhon": ("en-US-GuyNeural", "+8%", "-20Hz"),
    "cthulhu": ("en-GB-RyanNeural", "+6%", "-22Hz"),
    "cthulhu_whisper": ("en-GB-RyanNeural", "-24%", "-16Hz"),
    "kid": ("en-US-AnaNeural", "-18%", "+0Hz"),
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
        if "typhon" in notes:
            spk = "typhon"
        elif "cthulhu" in notes and "whisper" in notes:
            spk = "cthulhu_whisper"
        elif "cthulhu" in notes:
            spk = "cthulhu"
        elif "kid" in notes:
            spk = "kid"
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
    c = edge_tts.Communicate(text, v, rate=r, pitch=p, boundary="WordBoundary", proxy=PROXY)
    audio = b""
    wb = []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            wb.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
    return audio, wb

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
        # Multi-layer dark cinematic blend: main deep + low shadow (-3.5 st) + subtle chorus/echo
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=3[a][b][c];"
            "[a]equalizer=f=115:t=q:w=1:g=4.5,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3.5:makeup=4[l0];"
            "[b]asetrate=48000*0.82,aresample=48000,atempo=1.2195,lowpass=f=650,volume=0.45[l1];"
            "[c]adelay=18:all=1,highpass=f=1800,volume=0.22[l2];"
            "[l0][l1][l2]amix=inputs=3:normalize=0:duration=first,aecho=0.8:0.65:45|95:0.18|0.10,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "typhon":
        # Layered volcanic roar: deep main + raspy hiss layer + sub-volcanic rumble + cavern echo
        ff(
            "-i", raw, "-filter_complex",
            f"[0:a]aresample=48000,asplit=4[a][b][c][e];"
            f"[a]asetrate=48000*0.86,aresample=48000,atempo=1.1628,equalizer=f=130:t=q:w=1:g=5,acompressor=threshold=-22dB:ratio=4:makeup=4[l0];"
            f"[b]highpass=f=2400,acrusher=bits=6:mix=0.35,adelay=26:all=1,volume=0.95[l1];"
            f"[c]asetrate=48000*0.70,aresample=48000,atempo=1.4286,lowpass=f=700,volume=0.65[l2];"
            f"[e]adelay=50:all=1,bandpass=f=900:w=600,volume=0.4[l3];"
            f"anoisesrc=d={d+0.5:.2f}:c=brown:r=48000,lowpass=f=120,afade=t=in:d=0.15,afade=t=out:st={max(d-0.15,0):.2f}:d=0.5,volume=6[r];"
            f"[l0][l1][l2][l3][r]amix=inputs=5:normalize=0:duration=first,aecho=0.85:0.75:75|160|260:0.35|0.22|0.14,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "cthulhu":
        # Deep abyssal boom + psychic chorus echo
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=3[a][b][c];"
            "[a]asetrate=48000*0.80,aresample=48000,atempo=1.25,equalizer=f=95:t=q:w=1:g=6,acompressor=threshold=-22dB:ratio=4:makeup=5[l0];"
            "[b]asetrate=48000*0.64,aresample=48000,atempo=1.5625,lowpass=f=500,volume=0.7[l1];"
            "[c]adelay=42:all=1,bandpass=f=1800:w=1200,tremolo=f=5.5:d=0.45,volume=0.45[l2];"
            "[l0][l1][l2]amix=inputs=3:normalize=0:duration=first,aecho=0.85:0.88:90|210|370:0.45|0.32|0.20,alimiter=limit=0.89",
            "-ar", "48000", out,
        )
    elif spk == "cthulhu_whisper":
        # Close eerie abyssal whisper
        ff(
            "-i", raw, "-filter_complex",
            "[0:a]aresample=48000,asplit=2[a][b];"
            "[a]asetrate=48000*0.88,aresample=48000,atempo=1.1364,highpass=f=130,equalizer=f=5800:t=q:w=1:g=6,acompressor=threshold=-26dB:ratio=3:makeup=5[l0];"
            "[b]adelay=35:all=1,highpass=f=3200,tremolo=f=4:d=0.4,volume=0.75[l1];"
            "[l0][l1]amix=inputs=2:normalize=0:duration=first,aecho=0.8:0.7:85|190:0.3|0.18,volume=1.9,alimiter=limit=0.85",
            "-ar", "48000", out,
        )
    else:  # kid whisper
        ff(
            "-i", raw, "-af",
            "aresample=48000,asetrate=48000*1.08,aresample=48000,atempo=0.9259,highpass=f=170,equalizer=f=5500:t=q:w=1:g=4,"
            "acompressor=threshold=-24dB:ratio=3:makeup=5,aecho=0.8:0.5:55:0.12,volume=2.1,alimiter=limit=0.82",
            "-ar", "48000", out,
        )

async def main():
    for i, u in enumerate(units):
        raw = f"{CL}/u_{i:02d}_raw.mp3"
        fx = f"{CL}/u_{i:02d}.wav"
        audio, wb = await synth(u["text"], u["speaker"])
        x, lead = trim(decode(audio))
        wr(raw, x)
        char_fx(u["speaker"], raw, fx)
        k = dur(fx) / max(len(x) / SR, 1e-3)
        u.update(
            file=os.path.basename(fx),
            dur=dur(fx),
            k=k,
            words=[{"word": w, "start": max(b - lead, 0) * k, "end": max(e - lead, 0) * k} for w, b, e in wb],
        )
        print(i, u["speaker"], round(u["dur"], 2), u["text"][:44], flush=True)
    json.dump(units, open(f"{HERE}/units.json", "w"), indent=1, ensure_ascii=False)

asyncio.run(main())
