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
# ---------- score: black-eyed-children-vs-cerberus (0 hook,1 roll,2 arena,3 R1,4 R2,5 R3,6 KO,7 dawn,8 cliff+CTA) ----------
t_all = T(len(buf)/SR)
def fw(prefix, after=0.0, before=1e9):
    return [w for w in W if w["word"].lower().startswith(prefix.lower()) and after <= w["start"] < before][0]
on = fw("one", sec[8]); kn = fw("knock", sec[8])
t_cut = on["start"] - 0.06; t_k = kn["end"] + 0.12
t_break = fw("breaks", sec[5])["start"]; t_hum = fw("hum", sec[3])["end"]
t_split = fw("splits", sec[5])["start"]; t_shut = fw("shut", sec[5])["start"]; t_ko = sec[6] - 0.03
t_glow = fw("glow", sec[8])["start"]
# --- bed: drone + wind
fm = 46 + 3*np.sin(2*np.pi*0.05*t_all)
drone = np.sin(2*np.pi*np.cumsum(fm)/SR)*0.5 + 0.35*np.sin(2*np.pi*np.cumsum(fm*1.5*(1+0.002*np.sin(2*np.pi*0.11*t_all)))/SR) + 0.25*np.sin(2*np.pi*np.cumsum(fm*0.5)/SR)
wind = lp(rng.standard_normal(len(t_all)), 400, 2)*8; wind *= (0.5+0.5*np.sin(2*np.pi*0.13*t_all+1))**1.5
bed = drone*0.55 + wind*0.35
lvl = np.interp(t_all, [0, sec[1], sec[2], sec[3], sec[4], sec[4]+3, t_break-0.02, t_break, t_ko, t_ko+0.3, sec[7], sec[7]+2, sec[8]-1, sec[8], t_cut, t_cut+0.04, TOTAL],
                      [0.5, .45, .65, .8, .5, .3, .3, .85, .9, 0.0, 0.0, .3, .3, 0.0, 0.0, 0.0, 0.0])
lvl[(t_all > t_ko+0.3) & (t_all < sec[7])] = 0
buf += bed*lvl
# --- hook hit
put(IMP, 0.0, 0.9)
# --- split roll: ratchet + locks on the names
def ratchet(t0, t1):
    t = t0; iv = 0.05
    while t < t1:
        put(tick(2200 + 300*rng.random()), t, 0.9); iv = min(iv*1.05, 0.22); t += iv
f1 = fw("black-eyed", sec[1]); f2 = fw("cerberus", sec[1])
ratchet(sec[1]-0.1, f1["start"]-0.05); put(boom(0.9, 110, 50), f1["start"], 0.9); put(tick(900, 0.08), f1["start"], 1.0)
ratchet(fw("children", sec[1])["end"]+0.05, f2["start"]-0.05); put(boom(0.9, 95, 45), f2["start"], 0.9); put(tick(700, 0.08), f2["start"], 1.0)
cm = fw("comment", sec[1]); t_vs = cm["end"] + 0.15
put(IMP, t_vs, 0.8); put(bell(98, 5), t_vs+0.05, 0.9)
put(lp(rng.standard_normal(int(3*SR)), 250, 2)*np.exp(-T(3)/1.2)*6, t_vs, 0.5)
# --- arena: the knock (cabin), floor glow swell, Cerberus climbs
put(KNK, fw("knock", sec[2])["start"] - 0.05, 0.9)
gl = fw("glow", sec[2])["start"]
put(lp(rng.standard_normal(int(2.5*SR)), 300, 2)*np.hanning(int(2.5*SR))*8, gl, 0.5)
put(GRW, fw("cerberus", sec[2]+3)["start"] - 0.2, 0.6)
put(lp(rng.standard_normal(int(1.2*SR)), 700, 2)*np.exp(-T(1.2)/0.4)*5, fw("boards", sec[2])["start"], 0.5)   # wood splintering
# --- rounds
rs = [fw("round", sec[3]-0.1), fw("round", sec[4]-0.1), fw("round", sec[5]-0.1)]
for r in rs: put(IMP, r["start"]-0.05, 0.7)
def drums(t0, t1, iv0, iv1, g0, g1):
    t = t0
    while t < t1:
        p = (t-t0)/(t1-t0); put(boom(1.0, 95, 48), t, g0+(g1-g0)*p)
        if int((t-t0)/iv0) % 2: put(lp(rng.standard_normal(int(.12*SR)), 3000, 1)*np.exp(-T(.12)/0.03), t+iv0/2, 0.15*g0)
        t += iv0 + (iv1-iv0)*p
drums(rs[0]["end"]+0.3, t_hum-0.6, 0.85, 0.7, 0.4, 0.55)         # R1 drums
put(GRW, fw("snap", sec[3])["start"]-0.1, 0.6)
# --- R2: off-key music-box lullaby from the hum until "The song breaks"
mel = [0, 0, 7, 7, 9, 9, 7, None, 5, 5, 4, 4, 2, 2, 0, None]       # twinkle-ish, then it falls apart
def musicbox(f, d=1.6, det=0.0):
    t = T(d); f = f*2**(det/12)
    x = (np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.2) + 0.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.08))
    return x*np.exp(-t/0.55)*(1-np.exp(-t/0.003))*0.22
t = t_hum - 0.5; i = 0; iv = 0.62
while t < t_break - 0.05:
    st = mel[i % len(mel)]
    if st is not None:
        det = rng.uniform(-0.55, 0.55) + (0.35 if i % 5 == 3 else 0)      # sour, wandering pitch
        put(musicbox(392.0*2**(st/12), 1.6, det), t, 0.9 + 0.1*rng.random())
        if i % 4 == 2: put(musicbox(392.0*2**((st+6)/12), 1.2, 0.2), t+0.03, 0.35)   # tritone ghost
    t += iv*(1 + 0.012*i)*(1.3 if st is None else 1.0); i += 1
# hard stop: the song breaks (also kills the drone for a beat)
buf[int(t_break*SR):int((t_break+0.15)*SR)] *= 0.0
put(IMP, t_break, 0.8)
# --- R3: strong beat after the break, fire + growl when the gate opens, slam
drums(t_break+0.3, t_shut-0.3, 0.55, 0.38, 0.6, 0.95)
put(GRW, fw("seizes", sec[5])["start"]-0.1, 0.9)
def fire(d):
    t = T(d); n = rng.standard_normal(len(t)); roar = lp(n, 900, 2)*6*np.minimum(t/1.0, 1)
    crack = np.zeros(len(t))
    for _ in range(int(d*40)):
        j = rng.integers(0, len(t)-400); crack[j:j+400] += rng.standard_normal(400)*np.exp(-np.arange(400)/60)*rng.uniform(.3, 1)
    return (roar*0.7 + crack*0.5)*np.minimum((d-t)/0.4, 1)*0.5
put(fire(t_shut - t_split), t_split, 0.9)
put(GRW, t_split + 0.3, 0.6)
clang = lambda: (np.sin(2*np.pi*310*T(1.5))*np.exp(-T(1.5)/0.5) + 0.6*np.sin(2*np.pi*477*T(1.5))*np.exp(-T(1.5)/0.35))*0.4
put(IMP, t_shut, 1.0); put(clang(), t_shut, 0.7); put(boom(2.5, 60, 24), t_shut, 0.8)
put(IMP, t_ko, 1.0)                                              # K.O.
# --- dawn: gentle in-tune bell + soft pad
d0 = sec[7]
for k_, (dt, f) in enumerate([(0.2, 523.25), (1.8, 659.25), (3.4, 783.99), (5.0, 659.25)]):
    if d0+dt < sec[8]-0.5: put(pnote(f, 3.5, 0.0), d0+dt, 0.5)
put(lp(bell(392, 6), 2200, 1), d0+0.1, 0.5)
pad = sum(np.sin(2*np.pi*f*t_all) for f in (130.8, 164.8, 196.0))*0.05*np.interp(t_all, [d0, d0+2, sec[8]-1, sec[8]], [0, 1, 1, 0])
buf += pad
# --- cliffhanger: low red rumble under the floor -> cut -> one knock -> (child voice) -> silence
rum = np.sin(2*np.pi*np.cumsum(34 + 4*np.sin(2*np.pi*0.7*t_all))/SR)*0.9 + lp(rng.standard_normal(len(t_all)), 110, 2)*10
rum *= np.interp(t_all, [t_glow, t_cut-0.3], [0.0, 0.85]) * ((t_all > t_glow) & (t_all < t_cut))
rum *= 0.6 + 0.4*np.sin(2*np.pi*0.9*t_all)                       # breathing pulse
buf += rum*0.9
buf[int((t_cut)*SR):int((t_cut+0.04)*SR)] *= np.linspace(1, 0, int(0.04*SR))
buf[int((t_cut+0.04)*SR):] = 0
put(KNK, t_k, 1.0)
out = buf[:int(TOTAL*SR)]
pk = np.max(np.abs(out)); out = np.tanh(out/pk*1.4)/np.tanh(1.4)*0.9
wav(f"{H}/music.wav", out)
print("music.wav", len(out)/SR, "locks", round(f1["start"],2), round(f2["start"],2), "VS", round(t_vs,2), "break", round(t_break,2), "gate", round(t_split,2), round(t_shut,2), "KO", round(t_ko,2), "cut", round(t_cut,2), "knock", round(t_k,2))
