#!/usr/bin/env python3
"""scp682-vs-pegasus score + SFX (SCP lab breach klaxon + storm forest drone + 125 BPM war drums + Zeus thunder
+ acid/spike hiss + aerial clash + Olympus ascent + hard cut before whisper) -> music.wav."""
import json, os, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
SR = 44100
rng = np.random.default_rng(5)
S = json.load(open(f"{H}/sections.json"))
TOTAL = S["duration"] + 1.5
BPM = 125
BEAT = 60.0 / BPM

def T(n):
    return np.arange(int(n * SR)) / SR

def lp(x, fc, order=2):
    n = len(x)
    if n == 0:
        return x
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = 1.0 / (1.0 + (f / max(fc, 1.0)) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x) * h, n)

def hp(x, fc):
    return x - lp(x, fc, 1)

def noise(d):
    return rng.standard_normal(int(d * SR))

buf = np.zeros(int(TOTAL * SR) + SR * 4)
t_all = np.arange(len(buf)) / SR

def put(x, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i : i + len(x)] += x * g

def sent(prefix):
    return [s for s in S["sentences"] if s["text"].startswith(prefix)][0]

def sec(name):
    return [s for s in S["sections"] if s["name"] == name][0]

def klaxon(d=0.65, f0=620, f1=440):
    t = T(d)
    f = f0 + (f1 - f0) * (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.4 * np.sin(3 * ph)) * np.minimum(t / 0.03, 1) * np.minimum((d - t) / 0.08, 1)
    return np.tanh(x * 1.3) * 0.42

def boom(d=1.4, f0=82, f1=30, k=6, dec=0.42):
    t = T(d)
    f = f1 + (f0 - f1) * np.exp(-t * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec) * (1 - np.exp(-t / 0.004))

def impact(d=2.0):
    t = T(d)
    x = boom(d, 95, 26, 6, 0.45) + 0.65 * lp(noise(d), 1600, 2) * np.exp(-t / 0.28) + 0.3 * np.sin(2 * np.pi * 135 * t) * np.exp(-t / 0.2)
    return np.tanh(x * 1.5) * 0.8

def tom(f=106, d=0.45):
    t = T(d)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.55 * np.exp(-t * 28))) / SR) * np.exp(-t / 0.14) * 0.9

def snare(d=0.28):
    t = T(d)
    return hp(noise(d), 1500) * np.exp(-t / 0.065) * 0.8 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.055) * 0.5

def tick(f=2200, d=0.03):
    t = T(d)
    return (np.sin(2 * np.pi * f * t) + 0.65 * noise(d)) * np.exp(-t / 0.006) * 0.5

def whoosh(d=0.8, f0=300, f1=4200, rev=False):
    t = T(d)
    n = lp(noise(d), f1, 2) - lp(noise(d), f0, 2)
    env = np.exp(-((t / d - 0.5) ** 2) / (2 * 0.2 ** 2))
    out = n * env * 2.5
    return out[::-1] if rev else out

def beam_body(d, base=112, g=1.0):
    t = T(d)
    ph = 2 * np.pi * np.cumsum(base + 5 * np.sin(2 * np.pi * 6.0 * t)) / SR
    x = sum(np.sin(h * ph) / (h ** 0.5) for h in (1, 2, 3, 4, 5, 6)) * (0.7 + 0.3 * np.sin(2 * np.pi * 24 * t))
    x = x * 0.42 + hp(noise(d), 2600) * 0.35
    return np.tanh(x * 1.2) * np.minimum(t / 0.08, 1) * np.minimum((d - t) / 0.15, 1) * g

def thunder(d=2.2):
    t = T(d)
    n = lp(noise(d), 260, 2) * 8.5 + hp(noise(d), 3200) * np.exp(-t / 0.12) * 0.9
    am = (0.5 + 0.5 * np.sin(2 * np.pi * 3.2 * t + 1)) ** 1.5
    return np.tanh(n * am * 0.6) * np.minimum(t / 0.04, 1) * np.exp(-t / 0.95)

def acid_hiss(d=1.6):
    t = T(d)
    n = hp(noise(d), 2800) * (0.65 + 0.35 * np.sin(2 * np.pi * 14 * t))
    return n * np.minimum(t / 0.15, 1) * np.minimum((d - t) / 0.3, 1) * 0.65

def rumble(d, g=1.0):
    t = T(d)
    x = np.sin(2 * np.pi * np.cumsum(34 + 4 * np.sin(2 * np.pi * 0.9 * t)) / SR) + lp(noise(d), 120, 2) * 10
    return x * (0.65 + 0.35 * np.sin(2 * np.pi * 6 * t)) * np.minimum(t / 0.4, 1) * np.minimum((d - t) / 0.5, 1) * g

# Anchors
t_m0, t_m1 = sec("intro_scp682")["start"], sec("intro_scp682")["end"]
t_g0, t_g1 = sec("intro_pegasus")["start"], sec("intro_pegasus")["end"]
t_story = sec("story")["start"]
t_block = sent("Radiant wings")["start"]
t_fight = sec("fight")["start"]
t_dive = sent("Diving like")["start"]
t_zeus = sent("Then Pegasus")["start"]
t_adapt = sec("adapt")["start"]
t_armor = sent("Worse, its body")["start"]
t_spikes = sent("Bone glands")["start"]
t_wings = sec("wings")["start"]
t_climax = sec("climax")["start"]
t_exhaust = sent("Pegasus could")["start"]
t_retreat = sec("retreat")["start"]
t_after = sec("aftermath")["start"]
t_cut = sent("Alone in the")["start"] - 0.15  # HARD MUSIC CUT DEAD!
t_whisp = sent("Bring your god")["start"]

# Stormy forest dark drone (cuts dead at t_cut)
fm = 42 + 2.5 * np.sin(2 * np.pi * 0.05 * t_all)
drone = (
    np.sin(2 * np.pi * np.cumsum(fm) / SR) * 0.52
    + 0.32 * np.sin(2 * np.pi * np.cumsum(fm * 1.5) / SR)
    + 0.24 * np.sin(2 * np.pi * np.cumsum(fm * 0.5) / SR)
)
storm = lp(noise(len(t_all) / SR), 420, 2) * 4.8 * (0.55 + 0.45 * np.sin(2 * np.pi * 0.14 * t_all)) ** 1.4
lvl = np.interp(
    t_all,
    [0, 3.0, t_story, t_fight, t_climax, t_after, t_after + 1.5, t_cut - 0.08, t_cut, TOTAL],
    [0.75, 0.50, 0.65, 0.85, 0.96, 0.30, 0.22, 0.22, 0.0, 0.0],
)
buf += (drone * 0.55 + storm * 0.34) * lvl

# Hook 0..3.0 s: SCP lab klaxon + steel blast door explosion + clash + glitch rewind
put(klaxon(0.6), 0.05, 0.85)
put(impact(1.4), 0.55, 0.9)
put(thunder(1.8), 1.05, 0.85)
put(impact(1.6), 2.0, 0.95)
put(whoosh(0.5, 400, 4800, rev=True), 2.45, 0.9)

# Split-roll ratchets & locks
def ratchet(t0, t1, iv=0.045):
    t = t0
    while t < t1:
        put(tick(2100 + 300 * rng.random()), t, 0.85)
        iv = min(iv * 1.06, 0.18)
        t += iv

lockL = round(t_m0 - 0.55, 2)
lockR = round(t_g0 - 0.60, 2)
t_vs = round(t_g1 + 0.15, 2)
ratchet(3.05, lockL)
put(impact(1.5), lockL, 0.95)
put(acid_hiss(1.4), t_m0, 0.65)
put(rumble(2.0, 0.5), t_m0, 0.65)

ratchet(t_m1 + 0.35, lockR)
put(impact(1.5), lockR, 0.95)
put(thunder(2.0), t_g0, 0.75)

put(impact(1.8), t_vs, 1.0)
put(whoosh(0.6, 250, 3800), t_story - 0.25, 0.85)

# Story & Battle SFX
put(klaxon(0.65), t_story + 0.05, 0.75)
put(klaxon(0.65), t_story + 0.85, 0.60)
put(impact(1.8), t_story + 1.1, 0.9)
put(thunder(2.0), t_block - 0.4, 0.85)
put(impact(1.6), t_block + 0.3, 0.85)
put(whoosh(0.7, 500, 5000), t_dive, 0.9)
put(impact(2.0), t_dive + 1.1, 0.95)
put(thunder(2.4), t_zeus + 0.2, 0.95)
put(beam_body(1.8, 128, 0.8), t_zeus + 0.6, 0.85)
put(acid_hiss(1.8), t_adapt + 0.2, 0.75)
put(rumble(2.0, 0.7), t_armor, 0.8)
put(impact(1.6), t_armor + 1.5, 0.85)
put(acid_hiss(2.0), t_spikes + 0.3, 0.85)
put(rumble(2.5, 0.85), t_wings, 0.9)
put(whoosh(0.9, 250, 3600), t_wings + 1.2, 0.9)
put(beam_body(3.6, 110, 0.95), t_climax + 1.4, 0.95)
put(impact(2.4), t_exhaust + 0.8, 1.0)
put(thunder(2.4), t_retreat + 0.4, 0.95)
put(whoosh(1.0, 400, 5200), t_retreat + 1.6, 0.95)

# Cliffhanger dry tension AFTER hard music cut: distant thunder + leathery wing flare
put(rumble(1.2, 0.35), t_cut + 0.4, 0.55)
put(thunder(2.0), t_whisp - 0.8, 0.45)

# 125 BPM war drums
t = t_fight
step = 0
while t < t_after - 0.5:
    if not (t_exhaust + 0.2 <= t < t_exhaust + 1.1):
        if step % 4 == 0:
            put(boom(0.55, 92, 34, 8, 0.22), t, 0.78)
        if step % 4 == 2:
            put(snare(0.26), t, 0.62)
        if step % 2 == 1:
            put(tom(98 + (step % 3) * 14, 0.32), t, 0.48)
    t += BEAT / 2.0
    step += 1

buf = np.tanh(buf * 0.9)
peak = np.max(np.abs(buf)) + 1e-9
buf = (buf / peak * 0.88 * 32767).astype(np.int16)
with wave.open(f"{H}/music.wav", "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(buf.tobytes())
print(f"Wrote music.wav ({len(buf)/SR:.2f}s)")
