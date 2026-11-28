#!/usr/bin/env python3
"""scp096-vs-medusa score + SFX (misty temple horror drone + 125 BPM war drums + SCP-096 resonant shriek
+ petrification crystalline beam + stone crack + hard silence cut before C2 whisper) -> music.wav."""
import json, os, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
SR = 44100
rng = np.random.default_rng(7)
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

def tick(f=2200, d=0.03):
    t = T(d)
    return (np.sin(2 * np.pi * f * t) + 0.6 * noise(d)) * np.exp(-t / 0.006) * 0.5

def whoosh(d=0.75, f0=280, f1=4200, rev=False):
    t = T(d)
    n = lp(noise(d), f1, 2) - lp(noise(d), f0, 2)
    env = np.exp(-((t / d - 0.5) ** 2) / (2 * 0.2 ** 2))
    out = n * env * 2.5
    return out[::-1] if rev else out

def shriek_fx(d=1.6, g=0.85):
    t = T(d)
    f = 620 + 260 * np.sin(2 * np.pi * 7.5 * t) * np.exp(-t / 1.2) + 180 * np.exp(-t / 0.3)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.55 * np.sin(2 * np.pi * np.cumsum(f * 1.498) / SR)
    n = hp(noise(d), 1800) * 0.45
    return np.tanh((s * 0.6 + n) * 1.6) * np.minimum(t / 0.06, 1) * np.exp(-t / (d * 0.7)) * g

def petrify_beam(d=2.4, g=0.95):
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

t_m0, t_m1 = sec("intro_scp096")["start"], sec("intro_scp096")["end"]
t_g0, t_g1 = sec("intro_medusa")["start"], sec("intro_medusa")["end"]
t_story = sec("story")["start"]
t_petrify_soldier = sec("petrify_soldier")["start"]
t_breach = sec("wall_breach")["start"]
t_eyelock = sec("eye_lock")["start"]
t_charge1 = sec("charge1")["start"]
t_wings = sec("wings")["start"]
t_barrage = sec("barrage")["start"]
t_rev = sec("reversal")["start"]
t_slam = sec("slam")["start"]
t_pinned = sec("pinned")["start"]
t_climax = sec("climax")["start"]
t_petrify = sec("petrify")["start"]
t_after = sec("aftermath")["start"]
t_cut = sec("cliffhanger")["start"] - 0.18   # HARD MUSIC CUT DEAD before C2!
t_whisp = sec("whisper")["start"]

# Misty cursed temple drone (cuts dead at t_cut)
fm = 44 + 2.4 * np.sin(2 * np.pi * 0.06 * t_all)
drone = (
    np.sin(2 * np.pi * np.cumsum(fm) / SR) * 0.50
    + 0.32 * np.sin(2 * np.pi * np.cumsum(fm * 1.498) / SR)  # eerie tritone tension
    + 0.22 * np.sin(2 * np.pi * np.cumsum(fm * 0.5) / SR)
)
mist_wind = (lp(noise(len(t_all) / SR), 620, 2) - lp(noise(len(t_all) / SR), 140, 2)) * 3.8 * (0.55 + 0.45 * np.sin(2 * np.pi * 0.14 * t_all))
env_bed = np.ones_like(t_all)
env_bed[t_all > t_cut] = np.exp(-(t_all[t_all > t_cut] - t_cut) / 0.04)
buf += (drone * 0.30 + mist_wind * 0.18) * env_bed

# Hook SFX (0..3 s)
put(petrify_beam(1.8, 0.72), 0.1)
put(shriek_fx(1.2, 0.60), 0.4)
put(impact(1.6), 1.95, 0.9)
put(whoosh(0.45, 400, 5000, rev=True), 2.55, 0.85)

# Split-Roll ratchets + lock hits + VS
for t_spin0, t_spin1 in [(3.05, t_m0 - 0.55), (t_m1 + 0.35, t_g0 - 0.55)]:
    t = t_spin0
    while t < t_spin1:
        put(tick(2100 + (t - t_spin0) * 600), t, 0.75)
        t += 0.085
    put(impact(1.2), t_spin1, 0.85)
put(whoosh(0.55), t_m0 - 0.35, 0.8)
put(whoosh(0.55), t_g0 - 0.35, 0.8)
put(impact(1.5), t_story - 1.15, 0.95)  # VS slam
put(whoosh(0.65), t_story - 0.45, 0.85)

# 125 BPM war drums from wall_breach to aftermath
t_d = t_breach
step = 0
while t_d < t_after - 0.4:
    intense = 1.0 if t_d >= t_eyelock else 0.7
    if step % 4 == 0:
        put(boom(0.55, 84, 28, 7, 0.28), t_d, 0.78 * intense)
    if step % 4 == 2:
        put(snare(0.24), t_d, 0.65 * intense)
    if step % 2 == 1:
        put(tom(108 if step % 4 == 1 else 92, 0.32), t_d, 0.52 * intense)
    step += 1
    t_d += BEAT * 0.5

# Key battle SFX synced to sections
put(petrify_beam(1.5, 0.72), t_petrify_soldier + 1.0)    # Soldier petrified by Medusa
put(stone_crack(0.7, 0.65), t_petrify_soldier + 2.3)     # Soldier freezes into marble statue
put(shriek_fx(1.3, 0.68), t_breach + 0.2)                # Deafening shriek splits the woods
put(impact(1.8), t_breach + 1.8, 0.95)                   # 096 smashes through temple wall
put(petrify_beam(1.1, 0.58), t_eyelock + 1.6)            # Medusa locks eyes onto 096's face
put(shriek_fx(1.6, 0.78), t_charge1 + 0.2)               # 096 unhinges jaw & triggers
put(whoosh(0.6), t_charge1 + 1.2, 0.85)                  # Supersonic charge
put(petrify_beam(1.9, 0.85), t_charge1 + 1.8)            # First gaze beam
put(stone_crack(0.75, 0.75), t_wings + 1.0)              # 096 breaks first stone crust
put(whoosh(0.55), t_barrage + 0.25, 0.9)                 # Golden wing vault + bronze slash
put(impact(1.5), t_barrage + 1.6, 0.85)                  # Serpent venom orbs detonation
put(shriek_fx(1.2, 0.65), t_rev + 0.6)                   # 096 rises roaring through venom smoke
put(impact(1.4), t_rev + 1.8, 0.85)                      # Monoliths erupt from earth
put(impact(2.0), t_slam + 1.1, 1.0)                      # 096 slams Medusa into floor
put(whoosh(0.45), t_pinned + 0.3, 0.55)                  # Towering claws raised over pinned Medusa
put(shriek_fx(1.8, 0.75), t_climax + 0.3)                # Point-blank clash buildup
put(petrify_beam(3.2, 1.05), t_climax + 1.2)             # Final beam-clash
put(impact(2.2), t_petrify + 0.15, 1.0)                  # Petrification climax impact
put(stone_crack(0.85, 0.85), t_petrify + 1.3)            # Stone locks solid

# C2 Cliffhanger SFX in dead silence!
put(stone_crack(1.0, 0.95), t_cut + 0.45)                # Hairline marble crack
put(stone_crack(1.2, 1.10), t_whisp - 0.55)              # Stone chunk drops revealing white bone!
put(boom(1.8, 62, 22, 5, 0.65), t_whisp - 0.15, 0.75)

# Normalize & write 16-bit WAV
buf = buf[: int(TOTAL * SR)]
peak = np.max(np.abs(buf)) + 1e-9
buf = np.tanh(buf / max(peak * 0.85, 1.0) * 1.15) * 0.92
pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
with wave.open(f"{H}/music.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"Wrote music.wav ({TOTAL:.2f}s, cut={t_cut:.2f}s)")
