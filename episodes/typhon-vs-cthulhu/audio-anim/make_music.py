#!/usr/bin/env python3
"""typhon-vs-cthulhu score + SFX (pure numpy, Story Hook ocean tension + 128 BPM war drums + dual beam-clash SFX + hard cut) -> music.wav."""
import json, os, wave
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
SR = 44100
rng = np.random.default_rng(4)
S = json.load(open(f"{H}/sections.json"))
TOTAL = S["duration"] + 1.5
BPM = 128
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

# ---------- SFX ----------
def boom(d=1.4, f0=80, f1=32, k=6, dec=0.42):
    t = T(d)
    f = f1 + (f0 - f1) * np.exp(-t * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec) * (1 - np.exp(-t / 0.004))

def impact(d=2.2):
    t = T(d)
    x = boom(d, 92, 26, 6, 0.48) + 0.65 * lp(noise(d), 1600, 2) * np.exp(-t / 0.28) + 0.3 * np.sin(2 * np.pi * 135 * t) * np.exp(-t / 0.2)
    return np.tanh(x * 1.5) * 0.8

def tom(f=108, d=0.45):
    t = T(d)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.55 * np.exp(-t * 28))) / SR) * np.exp(-t / 0.14) * 0.9

def snare(d=0.28):
    t = T(d)
    return hp(noise(d), 1500) * np.exp(-t / 0.065) * 0.8 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.055) * 0.5

def tick(f=2200, d=0.03):
    t = T(d)
    return (np.sin(2 * np.pi * f * t) + 0.65 * noise(d)) * np.exp(-t / 0.006) * 0.5

def whoosh(d=0.85, f0=300, f1=4200, rev=False):
    t = T(d)
    n = lp(noise(d), f1, 2) - lp(noise(d), f0, 2)
    env = np.exp(-((t / d - 0.5) ** 2) / (2 * 0.2 ** 2))
    out = n * env * 2.5
    return out[::-1] if rev else out

def fire_burst(d=1.3, f=1600):
    t = T(d)
    n = noise(d)
    x = lp(n, f, 2) * np.exp(-t / 0.28) * 2.6 + hp(n, 3800) * np.exp(-t / 0.09) * 0.7
    return np.tanh((x + boom(d, 72, 28, 7, 0.42) * 0.9) * 1.25) * 0.8

def beam_body(d, base=105, g=1.0):
    t = T(d)
    ph = 2 * np.pi * np.cumsum(base + 4 * np.sin(2 * np.pi * 5.5 * t)) / SR
    x = sum(np.sin(h * ph) / (h ** 0.5) for h in (1, 2, 3, 4, 5, 6)) * (0.7 + 0.3 * np.sin(2 * np.pi * 22 * t))
    x = x * 0.4 + hp(noise(d), 2400) * 0.32
    return np.tanh(x * 1.2) * np.minimum(t / 0.08, 1) * np.minimum((d - t) / 0.15, 1) * g

def psychic_pulse(d=1.5, f0=420, f1=180):
    t = T(d)
    f = f1 + (f0 - f1) * np.exp(-t * 2.2)
    ph = 2 * np.pi * np.cumsum(f + 18 * np.sin(2 * np.pi * 9 * t)) / SR
    return (np.sin(ph) * 0.5 + np.sin(1.5 * ph) * 0.3) * np.minimum(t / 0.08, 1) * np.exp(-t / 0.7)

def thunder(d=2.2):
    t = T(d)
    n = lp(noise(d), 240, 2) * 8
    am = (0.5 + 0.5 * np.sin(2 * np.pi * 3.0 * t + 1)) ** 1.5
    return n * am * np.minimum(t / 0.05, 1) * np.exp(-t / 1.0)

def rumble(d, g=1.0):
    t = T(d)
    x = np.sin(2 * np.pi * np.cumsum(34 + 4 * np.sin(2 * np.pi * 0.9 * t)) / SR) + lp(noise(d), 120, 2) * 10
    return x * (0.65 + 0.35 * np.sin(2 * np.pi * 6 * t)) * np.minimum(t / 0.5, 1) * np.minimum((d - t) / 0.6, 1) * g

# ---------- Anchors ----------
t_boil = sent("Until the ocean")["start"]
t_trem = sent("The tremors woke")["start"]
t_hook_end = sec("hook")["end"]
t_ty0 = sec("intro_typhon")["start"]
t_ty1 = sec("intro_typhon")["end"]
t_ct0 = sec("intro_cthulhu")["start"]
t_ct1 = sec("intro_cthulhu")["end"]
t_story = sec("story")["start"]
t_shield = sent("Cthulhu rose")["start"]
t_fight = sec("fight")["start"]
t_rlyeh = sec("rlyeh")["start"]
t_roar = sent("Typhon's hundred-headed")["start"]
t_crush = sent("His serpent coils")["start"]
t_reform = sent("Yet Cthulhu was never")["start"]
t_climax = sec("climax")["start"]
t_drown = sent("Drown in madness")["start"]
t_quench = sent("R'lyeh's stone")["start"]
t_after = sec("aftermath")["start"]
t_cut = sent("Until the stars")["start"] - 0.05  # HARD MUSIC CUT DEAD at stars align!
t_whisp = sent("The stars are almost")["start"]

# ---------- Ocean storm drone bed (cuts dead at t_cut) ----------
fm = 44 + 3 * np.sin(2 * np.pi * 0.06 * t_all)
drone = (
    np.sin(2 * np.pi * np.cumsum(fm) / SR) * 0.5
    + 0.35 * np.sin(2 * np.pi * np.cumsum(fm * 1.5) / SR)
    + 0.25 * np.sin(2 * np.pi * np.cumsum(fm * 0.5) / SR)
)
storm = lp(noise(len(t_all) / SR), 420, 2) * 5.5 * (0.55 + 0.45 * np.sin(2 * np.pi * 0.14 * t_all + 1)) ** 1.5
lvl = np.interp(
    t_all,
    [0, t_boil, t_hook_end, t_story, t_fight, t_climax, t_after, t_after + 1.5, t_cut - 0.1, t_cut, TOTAL],
    [0.42, 0.72, 0.52, 0.68, 0.86, 0.96, 0.34, 0.24, 0.24, 0.0, 0.0],
)
buf += (drone * 0.55 + storm * 0.34) * lvl

# ---------- Story Hook 0..t_hook_end ----------
put(thunder(2.4), 0.1, 0.45)
put(rumble(2.4, 0.65), t_boil - 0.1, 0.7)
put(fire_burst(1.5), t_boil + 0.15, 0.8)
put(psychic_pulse(1.8, 420, 140), t_trem, 0.75)
put(impact(), t_hook_end - 1.0, 0.95)
put(whoosh(0.55, 400, 4800, rev=True), t_hook_end - 0.45, 0.9)

# ---------- Split-roll ratchets + locks ----------
def ratchet(t0, t1, iv=0.045):
    t = t0
    while t < t1:
        put(tick(2100 + 300 * rng.random()), t, 0.85)
        iv = min(iv * 1.06, 0.18)
        t += iv

lockL = round(t_ty0 - 0.5, 2)
ratchet(t_hook_end, lockL)
put(boom(0.9, 110, 48), lockL, 1.0)
put(impact(), lockL, 0.72)
put(fire_burst(1.5), t_ty0 - 0.1, 0.55)
put(rumble(4.8, 0.6), t_ty0, 0.45)

lockR = round(t_ty1 + 0.85, 2)
ratchet(t_ty1 + 0.3, lockR)
put(boom(0.9, 95, 42), lockR, 1.0)
put(impact(), lockR, 0.72)
put(psychic_pulse(2.2, 380, 140), t_ct0 - 0.1, 0.6)
put(thunder(2.6), t_ct0, 0.45)

t_vs = t_ct1 + 0.12
put(impact(), t_vs, 1.0)
put(boom(2.2, 62, 24), t_vs, 0.82)

# ---------- War drums (128 BPM) ----------
def drumhit(t, kind, g):
    if kind == "k":
        put(boom(0.8, 96, 44, 7, 0.26), t, g)
    elif kind == "t":
        put(tom(106 if int(t * 10) % 2 else 138), t, g * 0.7)
    elif kind == "s":
        put(snare(), t, g * 0.5)

def drums(t0, t1, g0, g1):
    pat = ["k", None, "k", "k", "t", None, "k", "s"]
    t = t0
    n = 0
    while t < t1:
        u = (t - t0) / max(t1 - t0, 1e-3)
        g = g0 + (g1 - g0) * u
        k = pat[n % len(pat)]
        if k:
            drumhit(t, k, g)
        t += BEAT / 2.0
        n += 1

drums(t_ty0 + 0.4, t_ty1, 0.35, 0.45)
drums(t_ct0 + 0.4, t_ct1, 0.35, 0.45)
drums(t_story, t_fight, 0.48, 0.66)
drums(t_fight, t_climax, 0.70, 0.86)
drums(t_climax, t_after - 0.4, 0.88, 0.96)

# ---------- Story & Battle SFX ----------
put(fire_burst(1.6), t_story + 0.4, 0.85)
put(impact(), t_shield, 0.92)
put(whoosh(1.0, 260, 2600), t_shield + 1.2, 0.75)
put(fire_burst(1.2), t_fight + 1.0, 0.78)
put(psychic_pulse(1.6), t_fight + 4.2, 0.72)
put(rumble(2.5, 0.72), t_rlyeh, 0.78)
put(impact(), t_rlyeh + 0.3, 0.85)
# Mid-fight beam-clash #1 SFX
put(beam_body(2.1, 108, 0.7), t_roar + 0.95, 0.78)
put(impact(2.0), t_roar + 2.8, 0.88)
put(boom(1.8, 70, 26), t_crush, 0.88)
put(fire_burst(1.4), t_crush + 2.0, 0.82)
put(psychic_pulse(2.0, 560, 180), t_reform, 0.85)
# Final beam-clash #2 SFX
put(beam_body(max(2.5, t_quench + 2.1 - t_drown), 114, 0.8), t_drown, 0.88)
put(impact(2.8), t_quench + 1.8, 1.0)
put(thunder(2.4), t_after - 1.2, 0.65)
# Subtle eerie chime after hard cut when stars align & eyes open
put(psychic_pulse(1.4, 740, 480), t_cut + 0.4, 0.28)
put(boom(1.8, 52, 24), t_whisp - 0.3, 0.55)

peak = np.max(np.abs(buf)) or 1.0
buf = np.tanh((buf / peak) * 1.15) * 0.92
pcm = (buf * 32767).astype(np.int16)
with wave.open(f"{H}/music.wav", "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())
print("music.wav written:", round(len(buf) / SR, 2), "s | hard cut at", round(t_cut, 2), "s")
