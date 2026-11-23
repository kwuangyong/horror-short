#!/usr/bin/env python3
"""Synthesize battle score + SFX (numpy only) -> music.wav, impact.wav, growl.wav, knock.wav.
Cue times come from words.json / sections.json. Run: python audio/make_music.py"""
import json, os, wave
import numpy as np
H = os.path.dirname(os.path.abspath(__file__)); SR = 44100
rng = np.random.default_rng(7)
W = json.load(open(f"{H}/words.json")); S = json.load(open(f"{H}/sections.json"))
VOICE_DUR = S["duration"]; TOTAL = VOICE_DUR + 3.0
sec = {s["section"]: s["start"] for s in S["sections"]}
def find(word, nth=0, after=0.0):
    c = [w for w in W if w["word"].lower().strip(".,?!…'\"") == word.lower() and w["start"] >= after]
    return type('Wd',(),c[nth])
def T(n): return np.arange(int(n*SR))/SR
def lp(x, fc, order=2):
    # simple one-pole cascade low-pass
    a = np.exp(-2*np.pi*fc/SR); y = x.copy()
    for _ in range(order):
        out = np.empty_like(y); s = 0.0
        # vectorized via lfilter-like loop in chunks (scipy-free)
        for i in range(len(y)): s = (1-a)*y[i] + a*s; out[i] = s
        y = out
    return y
try:
    from scipy.signal import lfilter
    def lp(x, fc, order=2):
        a = np.exp(-2*np.pi*fc/SR)
        for _ in range(order): x = lfilter([1-a], [1, -a], x)
        return x
except ImportError: pass
def hp(x, fc): return x - lp(x, fc, 1)
def env_ad(n, a, d):
    t = T(n); e = np.minimum(t/max(a,1e-4), 1)*np.exp(-t/d); return e
buf = np.zeros(int(TOTAL*SR)+SR*2)
def put(x, t, g=1.0, buf_=None):
    b = buf if buf_ is None else buf_
    i = int(t*SR); 
    if i < 0 or i >= len(b): return
    x = x[:len(b)-i]; b[i:i+len(x)] += x*g
def span(t0, t1): return slice(int(t0*SR), int(t1*SR))
def fade_gate(t0, t1, fi=0.5, fo=0.5):
    g = np.zeros(len(buf)); a, b = int(t0*SR), int(t1*SR); g[a:b] = 1
    n = int(fi*SR); g[a:a+n] *= np.linspace(0, 1, n); n = int(fo*SR); g[b-n:b] *= np.linspace(1, 0, n); return g
# ---------- SFX ----------
def boom(d=1.6, f0=70, f1=32):
    t = T(d); f = f1 + (f0-f1)*np.exp(-t*6); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.45)*(1-np.exp(-t/0.004))
def impact():
    n = int(2.8*SR); t = T(2.8)
    x = boom(2.8, 85, 28)*1.0 + 0.7*lp(rng.standard_normal(n), 1800, 2)*np.exp(-t/0.35)
    x += 0.3*np.sin(2*np.pi*140*t)*np.exp(-t/0.2)
    return np.tanh(x*1.6)*0.8
def growl(d=2.4):
    t = T(d); f = 62 + 18*np.sin(2*np.pi*0.7*t)
    saw = 2*((np.cumsum(f)/SR) % 1) - 1
    am = 0.55 + 0.45*np.sign(np.sin(2*np.pi*27*t))*0.6 + 0.0
    n = lp(rng.standard_normal(len(t)), 900, 2)*3
    x = (saw*0.6 + n*0.7)*am
    x = lp(x, 1400, 2)*np.minimum(t/0.25, 1)*np.minimum((d-t)/0.5, 1)
    return np.tanh(x*2.0)*0.7
def knock():
    d = 0.5; t = T(d)
    x = np.sin(2*np.pi*190*t)*np.exp(-t/0.03) + 0.6*np.sin(2*np.pi*410*t)*np.exp(-t/0.015) \
        + 0.8*lp(rng.standard_normal(len(t)), 2500, 1)*np.exp(-t/0.008)
    x = x*(1-np.exp(-t/0.0008))
    # a touch of dull room
    r = np.zeros(len(t)); r[int(.09*SR):] = x[:len(t)-int(.09*SR)]*0.25
    return np.tanh((x + r)*1.4)*0.9
def tick(f=2200, d=0.03):
    t = T(d); return (np.sin(2*np.pi*f*t) + 0.7*rng.standard_normal(len(t)))*np.exp(-t/0.006)*0.5
def bell(f, d=6.0, g=1.0):
    t = T(d); x = 0
    for r, a, dc in [(1, 1, 1.0), (2.01, .5, .6), (2.76, .35, .4), (4.1, .2, .25), (5.4, .1, .2)]:
        x = x + a*np.sin(2*np.pi*f*r*t)*np.exp(-t/(d*0.3*dc))
    return x*(1-np.exp(-t/0.003))*0.4*g
def pnote(f, d=3.5, det=0.0):
    t = T(d); f = f*2**(det/12); x = np.zeros(len(t))
    for k, a in [(1, 1), (2, .4), (3, .2), (4, .1)]: x += a*np.sin(2*np.pi*f*k*t*(1+0.0004*k*k))
    return x*np.exp(-t/1.2)*(1-np.exp(-t/0.006))*0.3
def heart(g=1.0):
    return boom(0.35, 75, 45)*g
# ---------- write SFX files ----------
def wav(path, x, stereo=False):
    x = np.clip(x, -1, 1); 
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(path, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x*32767).astype("<i2").tobytes())
IMP, GRW, KNK = impact(), growl(), knock()
wav(f"{H}/impact.wav", IMP); wav(f"{H}/growl.wav", GRW); wav(f"{H}/knock.wav", KNK)
# ---------- score ----------
t_all = T(len(buf)/SR)
t_cut = sec[10] - 0.04          # music dies right before "Behind them... the soil moves"
t_ko = find("it", 0, 83).end + 0.15
t_dawn = sec[9]
# 1. drone bed (0 -> cut), swelling during fight, ducked in peace
fm = 48 + 3*np.sin(2*np.pi*0.05*t_all)
drone = np.sin(2*np.pi*np.cumsum(fm)/SR)*0.5 + 0.35*np.sin(2*np.pi*np.cumsum(fm*1.5*(1+0.002*np.sin(2*np.pi*0.11*t_all)))/SR) \
        + 0.25*np.sin(2*np.pi*np.cumsum(fm*0.5)/SR)
wind = lp(rng.standard_normal(len(t_all)), 400, 2)*8 ; wind *= (0.5+0.5*np.sin(2*np.pi*0.13*t_all+1))**1.5
bed = (drone*0.55 + wind*0.35)
lvl = np.interp(t_all, [0, 7, 12, 46, 65, t_ko, t_ko+0.3, t_dawn, t_dawn+3, t_cut, t_cut+0.04, 95.3, 98, TOTAL],
                      [0.5, .55, .7, .8, .55, .9, 0.0, 0.0, .45, .45, 0.0, 0.0, .2, 0.0])
lvl[(t_all > t_ko) & (t_all < t_dawn)] *= 0
lvl = np.minimum(lvl, 1)
buf += bed*lvl
# 2. spin / lock-in (sections 2) ratchet ticks
def ratchet(t0, t1):
    t = t0; iv = 0.05
    while t < t1:
        put(tick(2200 + 300*rng.random()), t, 0.9); iv = min(iv*1.07, 0.26); t += iv
    return t
f1 = find("Vrykolakas", 0, sec[2]); f2 = find("Grim", 0, sec[2] + 3)
rt = ratchet(sec[2]-0.15, f1.start - 0.05); put(boom(0.9, 110, 50), f1.start, 0.9); put(tick(900, 0.08), f1.start, 1.0)
ratchet(f1.end+0.05, f2.start - 0.05); put(boom(0.9, 110, 50), f2.start, 0.9)
# 3. VS screen: thunder + bell
put(IMP, sec[3], 0.8); put(bell(98, 5), sec[3]+0.05, 0.9)
put(lp(rng.standard_normal(int(3*SR)), 250, 2)*np.exp(-T(3)/1.2)*6, sec[3], 0.5)
# hook hit
put(IMP, 0.0, 0.9)
# 4. fresh grave: earth crack + low swell
put(lp(rng.standard_normal(int(1.5*SR)), 600, 2)*np.exp(-T(1.5)/0.5)*5, find("cracks").start, 0.6)
put(GRW, find("rises").start, 0.5)
# 5. Grim appears
put(GRW, find("Red").start - 0.6, 0.7)
# 6. rounds (sec 6 -> 8): taiko pattern increasing
r1, r2, r3 = find("Round", 0, sec[6]-0.1), find("Round", 1, sec[6]-0.1), find("Round", 2, sec[6]-0.1)
for r in (r1, r2, r3): put(IMP, r.start - 0.05, 0.75)
def drums(t0, t1, iv0, iv1, g0, g1):
    t = t0
    while t < t1:
        p = (t - t0)/(t1 - t0); put(boom(1.0, 95, 48), t, g0 + (g1-g0)*p)
        if int((t-t0)/iv0) % 2: put(lp(rng.standard_normal(int(.12*SR)), 3000, 1)*np.exp(-T(.12)/0.03), t+iv0/2, 0.15*g0)
        t += iv0 + (iv1-iv0)*p
drums(r1.end + 0.3, r2.start - 0.4, 0.9, 0.75, 0.35, 0.5)
drums(r2.end + 0.3, r3.start - 0.4, 0.75, 0.55, 0.5, 0.7)
# 7. Round 3: music out, heartbeat accelerating to the K.O.
t = r3.end + 0.2; iv = 0.95
buf[span(r3.start-0.1, r3.start+0.2)] *= np.linspace(1, 0.3, int(0.3*SR))
while t < t_ko - 0.2:
    p = (t - r3.end)/(t_ko - r3.end); g = 0.55 + 0.35*p
    put(heart(g), t, 1.0); put(heart(g*0.7), t + 0.22 - 0.07*p, 1.0)
    iv = 0.95 - 0.55*p; t += iv
# fight SFX
put(GRW, find("pounces").start - 0.1, 0.9)
put(lp(rng.standard_normal(int(.8*SR)), 3500, 1)*np.exp(-T(.8)/0.2)*3, find("face").start, 0.3)
put(IMP, find("flashlight").start, 0.0)
put(tick(1500, 0.05), find("clicks").start, 1.0); put(tick(900, 0.05), find("clicks").start+0.08, 0.8)
# 8. K.O.: big hit then silence (lvl already cut)
put(IMP, t_ko, 1.0); put(boom(2.5, 60, 24), t_ko, 0.9)
# 9. false peace: wrong-note piano + distant church bells
notes = [(t_dawn+0.3, 392.0, 0), (t_dawn+1.5, 493.9, 0.35), (t_dawn+2.8, 587.3, -0.4), (t_dawn+4.3, 523.3, 0.5), (t_dawn+5.4, 369.99, 0.3)]
for tt, f, dt in notes:
    if tt < t_cut - 0.3: put(pnote(f, 3.5, dt), tt, 0.8)
for k in range(3):
    tt = t_dawn + 0.5 + k*2.4
    if tt < t_cut - 0.3: b = lp(bell(311.1, 6), 1800, 1); put(b, tt, 0.55)
# 10. cut + knock
t_k = find("knock").end + 0.12
buf[int(t_cut*SR):int((t_cut+0.04)*SR)] *= np.linspace(1, 0, int(0.04*SR))
# hard gate: nothing from tail of notes after t_cut except the knock
seg = buf[int(t_cut*SR):int(t_k*SR)]; seg *= 0
tail = buf[int(t_k*SR):]; tail *= 0
put(KNK, t_k, 1.0)
# faint return of the drone for CTA (very low)
put(lp(rng.standard_normal(int(4*SR)), 120, 2)*np.hanning(int(4*SR))*10, 96.0, 0.12)
# ---------- master ----------
out = buf[:int(TOTAL*SR)]
out = hp(out, 25) if False else out
pk = np.max(np.abs(out)); out = np.tanh(out/pk*1.4)/np.tanh(1.4)*0.9
wav(f"{H}/music.wav", out)
print("music.wav", len(out)/SR, "cut", round(t_cut,2), "KO", round(t_ko,2), "knock", round(t_k,2))
