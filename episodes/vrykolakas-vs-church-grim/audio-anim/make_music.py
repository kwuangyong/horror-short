#!/usr/bin/env python3
"""Synthesize anim score + SFX (numpy only) -> music.wav, impact.wav, growl.wav, knock.wav.
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
# ---------- score (script-anim v4; sections 0 hook,1 roll,2 arena,3 R1,4 R2,5 R3,6 KO,7 peace,8 cliff,9 CTA) ----------
t_all = T(len(buf)/SR)
kn = find("knock", 0, sec[8]); on = find("One", 0, sec[8])
t_cut = on.start - 0.06
t_k = kn.end + 0.12
last5 = [w for w in W if sec[5] <= w["start"] < sec[6]-0.05][-1]; t_ko = last5["end"] + 0.2
t_dawn = sec[7]
fm = 48 + 3*np.sin(2*np.pi*0.05*t_all)
drone = np.sin(2*np.pi*np.cumsum(fm)/SR)*0.5 + 0.35*np.sin(2*np.pi*np.cumsum(fm*1.5*(1+0.002*np.sin(2*np.pi*0.11*t_all)))/SR) \
        + 0.25*np.sin(2*np.pi*np.cumsum(fm*0.5)/SR)
wind = lp(rng.standard_normal(len(t_all)), 400, 2)*8 ; wind *= (0.5+0.5*np.sin(2*np.pi*0.13*t_all+1))**1.5
bed = drone*0.55 + wind*0.35
lvl = np.interp(t_all, [0, sec[1], sec[2], sec[3], sec[5], t_ko, t_ko+0.3, t_dawn, t_dawn+3, t_cut, t_cut+0.04, TOTAL],
                      [0.5, .45, .7, .8, .55, .9, 0.0, 0.0, .45, .45, 0.0, 0.0])
lvl[(t_all > t_ko) & (t_all < t_dawn)] = 0
buf += bed*np.minimum(lvl, 1)
# hook hit
put(IMP, 0.0, 0.9)
# split roll: ratchet + two lock hits (at each name word)
f1 = find("Vrykolakas", 0, sec[1]); f2 = find("Grim", 0, f1.end)
ratchet_end = None
def ratchet(t0, t1):
    t = t0; iv = 0.05
    while t < t1:
        put(tick(2200 + 300*rng.random()), t, 0.9); iv = min(iv*1.05, 0.22); t += iv
ratchet(sec[1]-0.1, f1.start - 0.05); put(boom(0.9, 110, 50), f1.start, 0.9); put(tick(900, 0.08), f1.start, 1.0)
ratchet(f1.end+0.05, f2.start - 0.05); put(boom(0.9, 95, 45), f2.start, 0.9); put(tick(700, 0.08), f2.start, 1.0)
# VS hit after "Comment"
cm = find("Comment", 0, sec[1]); t_vs = cm.end + 0.15
put(IMP, t_vs, 0.8); put(bell(98, 5), t_vs+0.05, 0.9)
put(lp(rng.standard_normal(int(3*SR)), 250, 2)*np.exp(-T(3)/1.2)*6, t_vs, 0.5)
# arena: ground shake, Vrykolakas rises, Grim appears
put(lp(rng.standard_normal(int(1.5*SR)), 600, 2)*np.exp(-T(1.5)/0.5)*5, find("shakes", 0, sec[2]).start, 0.6)
put(GRW, find("leaps", 0, sec[2]).start - 0.5, 0.6)
# rounds
rs = [find("Round", i, sec[3]-0.1) for i in range(3)]
for r in rs: put(IMP, r.start - 0.05, 0.75)
def drums(t0, t1, iv0, iv1, g0, g1):
    t = t0
    while t < t1:
        p = (t - t0)/(t1 - t0); put(boom(1.0, 95, 48), t, g0 + (g1-g0)*p)
        if int((t-t0)/iv0) % 2: put(lp(rng.standard_normal(int(.12*SR)), 3000, 1)*np.exp(-T(.12)/0.03), t+iv0/2, 0.15*g0)
        t += iv0 + (iv1-iv0)*p
drums(rs[0].end + 0.3, rs[1].start - 0.4, 0.9, 0.75, 0.35, 0.5)
drums(rs[1].end + 0.3, rs[2].start - 0.4, 0.75, 0.55, 0.5, 0.7)
put(GRW, find("lunges", 0, sec[3]-0.1).start - 0.1, 0.7)
# R3: music dips, accelerating heartbeat to K.O.
buf[span(rs[2].start-0.1, rs[2].start+0.2)] *= np.linspace(1, 0.3, int(0.3*SR))
t = rs[2].end + 0.2
while t < t_ko - 0.2:
    p = (t - rs[2].end)/(t_ko - rs[2].end); g = 0.55 + 0.35*p
    put(heart(g), t, 1.0); put(heart(g*0.7), t + 0.22 - 0.07*p, 1.0)
    t += 0.95 - 0.55*p
put(GRW, find("pounces", 0, sec[5]).start - 0.1, 0.9)
# K.O.
put(IMP, t_ko, 1.0); put(boom(2.5, 60, 24), t_ko, 0.9)
# false peace: bell + wrong-note piano
notes = [(t_dawn+0.3, 392.0, 0), (t_dawn+1.5, 493.9, 0.35), (t_dawn+2.8, 587.3, -0.4), (t_dawn+4.3, 523.3, 0.5), (t_dawn+5.4, 369.99, 0.3), (t_dawn+7.0, 440.0, 0.45)]
for tt, f, dt in notes:
    if tt < t_cut - 0.3: put(pnote(f, 3.5, dt), tt, 0.6)
for k in range(4):
    tt = t_dawn + 0.5 + k*2.4
    if tt < t_cut - 0.3: put(lp(bell(311.1, 6), 1800, 1), tt, 0.4)
# hard cut before "One knock", then one wooden door knock
buf[int(t_cut*SR):int((t_cut+0.04)*SR)] *= np.linspace(1, 0, int(0.04*SR))
buf[int((t_cut+0.04)*SR):] = 0
put(KNK, t_k, 1.0)
# nails scraping glass (3 faint strokes) + low breath ~1.5 s: the corpse behind the window
def scratch():
    d = 1.3; t = T(d); n = rng.standard_normal(len(t))
    x = n - lp(n, 2500, 1); x = lp(x, 7500, 1)
    sq = np.sin(2*np.pi*(3100 + 900*np.sin(2*np.pi*3.1*t))*t)*0.35
    am = np.zeros(len(t))
    for a0, a1 in [(0.0, 0.38), (0.5, 0.95), (0.98, 1.3)]:
        m = (t >= a0) & (t < a1); u = (t[m]-a0)/(a1-a0); am[m] = np.sin(np.pi*u)**0.8*(0.6+0.4*np.sin(2*np.pi*28*t[m]))
    return (x*0.5 + sq)*am*0.35
def breath():
    d = 1.5; t = T(d); n = lp(rng.standard_normal(len(t)), 700, 2)*14
    e = np.where(t < 0.7, np.sin(np.pi*t/0.7), 0)**2*0.8 + np.where(t >= 0.7, np.sin(np.pi*(t-0.7)/0.8), 0)**2*1.0
    return n*e*(1 + 0.3*np.sin(2*np.pi*55*t))*0.55
put(breath(), t_k + 0.2, 0.05); put(scratch(), t_k + 0.45, 0.07)
# faint return of drone for CTA
out = buf[:int(TOTAL*SR)]
pk = np.max(np.abs(out)); out = np.tanh(out/pk*1.4)/np.tanh(1.4)*0.9
wav(f"{H}/music.wav", out)
print("music.wav", len(out)/SR, "cut", round(t_cut,2), "KO", round(t_ko,2), "knock", round(t_k,2), "VS", round(t_vs,2), "locks", round(f1.start,2), round(f2.start,2))
