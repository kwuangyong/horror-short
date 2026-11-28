#!/usr/bin/env python3
"""scp096-vs-medusa v3 score + SFX (Direct-to-Story, no wheel: eerie mist cold open -> 125 BPM war drums
-> shriek & dodge whooshes -> petrifying beam -> hard silence cut before C2 whisper) -> music.wav."""
import json, os, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
SR = 44100
rng = np.random.default_rng(77)
S = json.load(open(f"{H}/sections.json"))
TOTAL = S["duration"] + 1.5
BPM = 126
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

def sec(name):
    return [s for s in S["sections"] if s["name"] == name][0]

def boom(d=1.4, f0=86, f1=26, k=6, dec=0.45):
    t = T(d)
    f = f1 + (f0 - f1) * np.exp(-t * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec) * (1 - np.exp(-t / 0.004))

def impact(d=2.0):
    t = T(d)
    x = boom(d, 96, 24, 6, 0.45) + 0.65 * lp(noise(d), 1500, 2) * np.exp(-t / 0.25) + 0.30 * np.sin(2 * np.pi * 125 * t) * np.exp(-t / 0.20)
    return np.tanh(x * 1.5) * 0.85

def tom(f=104, d=0.45):
    t = T(d)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.52 * np.exp(-t * 28))) / SR) * np.exp(-t / 0.14) * 0.88

def snare(d=0.28):
    t = T(d)
    return hp(noise(d), 1600) * np.exp(-t / 0.06) * 0.78 + np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.05) * 0.45

def whoosh(d=0.65, f0=280, f1=4400, rev=False):
    t = T(d)
    n = lp(noise(d), f1, 2) - lp(noise(d), f0, 2)
    env = np.exp(-((t / d - 0.5) ** 2) / (2 * 0.2 ** 2))
    out = n * env * 2.6
    return out[::-1] if rev else out

def shriek_fx(d=1.6, g=0.85):
    t = T(d)
    f = 640 + 260 * np.sin(2 * np.pi * 7.5 * t) * np.exp(-t / 1.2) + 180 * np.exp(-t / 0.3)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.55 * np.sin(2 * np.pi * np.cumsum(f * 1.498) / SR)
    n = hp(noise(d), 1800) * 0.45
    return np.tanh((s * 0.6 + n) * 1.6) * np.minimum(t / 0.06, 1) * np.exp(-t / (d * 0.7)) * g

def petrify_beam(d=2.2, g=0.95):
    t = T(d)
    ph = 2 * np.pi * np.cumsum(142 + 8 * np.sin(2 * np.pi * 5.2 * t)) / SR
    x = sum(np.sin(h * ph) / (h ** 0.55) for h in (1, 2, 3, 5, 7)) * (0.72 + 0.28 * np.sin(2 * np.pi * 22 * t))
    grit = (lp(noise(d), 3800, 2) - lp(noise(d), 900, 2)) * 0.45
    return np.tanh((x * 0.48 + grit) * 1.3) * np.minimum(t / 0.08, 1) * np.minimum((d - t) / 0.16, 1) * g

def stone_crack(d=0.9, g=1.0):
    t = T(d)
    snap = hp(noise(d), 1200) * np.exp(-t / 0.045) * 1.4
    crunch = lp(noise(d), 950, 2) * np.exp(-((t - 0.16) ** 2) / (2 * 0.06 ** 2)) * 2.2
    sub = boom(d, 72, 24, 9, 0.28) * 0.9
    return np.tanh((snap + crunch + sub) * 1.4) * g

t_med = sec("medusa_reveal")["start"]
t_mline = sec("medusa_line")["start"]
t_breach = sec("wall_breach")["start"]
t_eyelock = sec("eye_lock")["start"]
t_charge1 = sec("charge1")["start"]
t_dodge1 = sec("dodge1")["start"]
t_duck = sec("duck_venom")["start"]
t_dive = sec("dive_grab")["start"]
t_slam = sec("slam")["start"]
t_climax = sec("climax")["start"]
t_turn = sec("turn_stone")["start"]
t_petrify = sec("petrify")["start"]
t_after = sec("aftermath")["start"]
t_cut = sec("cliffhanger")["start"] - 0.18
t_whisp = sec("whisper")["start"]

# Eerie misty temple drone (cuts dead at t_cut)
fm = 44 + 2.4 * np.sin(2 * np.pi * 0.06 * t_all)
drone = (
    np.sin(2 * np.pi * np.cumsum(fm) / SR) * 0.50
    + 0.32 * np.sin(2 * np.pi * np.cumsum(fm * 1.498) / SR)
    + 0.22 * np.sin(2 * np.pi * np.cumsum(fm * 0.5) / SR)
)
mist_wind = (lp(noise(len(t_all) / SR), 620, 2) - lp(noise(len(t_all) / SR), 140, 2)) * 3.8 * (0.55 + 0.45 * np.sin(2 * np.pi * 0.14 * t_all))
env_bed = np.ones_like(t_all)
env_bed[t_all > t_cut] = np.exp(-(t_all[t_all > t_cut] - t_cut) / 0.04)
buf += (drone * 0.30 + mist_wind * 0.18) * env_bed

# Cold open footsteps & soldier petrification
for i in range(6):
    put(tom(76, 0.18), 0.3 + i * 0.45, 0.42)
put(petrify_beam(1.6, 0.85), t_mline + 2.1)
put(stone_crack(0.85, 0.8), t_mline + 3.1)

# 126 BPM war drums from wall_breach to aftermath
t_d = t_breach
step = 0
while t_d < t_after - 0.4:
    intense = 1.0 if t_d >= t_charge1 else 0.72
    if step % 4 == 0:
        put(boom(0.55, 84, 28, 7, 0.28), t_d, 0.80 * intense)
    if step % 4 == 2:
        put(snare(0.24), t_d, 0.68 * intense)
    if step % 2 == 1:
        put(tom(108 if step % 4 == 1 else 92, 0.32), t_d, 0.54 * intense)
    step += 1
    t_d += BEAT * 0.5

# Action, evasion whooshes, shrieks & climax SFX
put(shriek_fx(1.5, 0.82), t_breach + 0.15)
put(impact(1.8), t_breach + 1.4, 0.98)
put(shriek_fx(1.5, 0.80), t_eyelock + 2.2)
put(whoosh(0.55), t_charge1 + 0.5, 0.92)        # 096 supersonic dash
put(petrify_beam(1.5, 0.82), t_dodge1 + 0.3)    # Medusa gaze beam
put(whoosh(0.50), t_dodge1 + 1.8, 0.95)         # Winged backflip evade!
put(whoosh(0.50), t_duck + 1.2, 0.90)           # 096 duck-dodge under venom!
put(whoosh(0.55), t_dive + 0.3, 0.95)           # Medusa bronze diving slash
put(impact(1.4), t_dive + 1.1, 0.88)
put(impact(2.0), t_slam + 0.45, 1.0)            # Sky slam into marble floor
put(shriek_fx(1.6, 0.78), t_climax + 0.3)
put(petrify_beam(3.2, 1.05), t_turn + 0.2)      # Final point-blank beam-clash
put(impact(2.2), t_petrify + 0.35, 1.0)
put(stone_crack(0.9, 0.85), t_petrify + 1.6)

# C2 Cliffhanger SFX in dead silence
put(stone_crack(1.0, 0.95), t_cut + 0.55)
put(stone_crack(1.2, 1.10), t_whisp - 0.55)
put(boom(1.8, 62, 22, 5, 0.65), t_whisp - 0.15, 0.75)

buf = buf[: int(TOTAL * SR)]
peak = np.max(np.abs(buf)) + 1e-9
buf = np.tanh(buf / max(peak * 0.85, 1.0) * 1.15) * 0.92
pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
with wave.open(f"{H}/music.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"Wrote v3 music.wav ({TOTAL:.2f}s, cut={t_cut:.2f}s)")
