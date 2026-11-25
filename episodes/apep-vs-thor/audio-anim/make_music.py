#!/usr/bin/env python3
"""apep-vs-thor score + SFX (numpy/scipy, no samples) -> music.wav. Cues from words.json / sections.json. Run: python make_music.py"""
import json, os, wave
import numpy as np
from scipy.signal import lfilter
H = os.path.dirname(os.path.abspath(__file__)); SR = 44100
rng = np.random.default_rng(3)
W = json.load(open(f"{H}/words.json")); S = json.load(open(f"{H}/sections.json"))
TOTAL = S["duration"] + 2.0
BPM = 155; BEAT = 60/BPM; BAR = 4*BEAT
def T(n): return np.arange(int(n*SR))/SR
def lp(x, fc, order=2):
    a = np.exp(-2*np.pi*fc/SR)
    for _ in range(order): x = lfilter([1-a], [1, -a], x)
    return x
def hp(x, fc): return x - lp(x, fc, 1)
def noise(d): return rng.standard_normal(int(d*SR))
buf = np.zeros(int(TOTAL*SR)+SR*4); t_all = np.arange(len(buf))/SR
def put(x, t, g=1.0):
    i = int(t*SR)
    if i < 0 or i >= len(buf): return
    x = x[:len(buf)-i]; buf[i:i+len(x)] += x*g
def fw(word, after=0.0, nth=0):
    c = [w for w in W if w["word"].lower().strip(".,?!'\"") == word.lower() and w["start"] >= after]
    return c[nth]
def sent(prefix): return [s for s in S["sentences"] if s["text"].startswith(prefix)][0]
# ---------- SFX ----------
def boom(d=1.4, f0=80, f1=34, k=6, dec=0.4):
    t = T(d); f = f1 + (f0-f1)*np.exp(-t*k); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/dec)*(1-np.exp(-t/0.004))
def impact(d=2.6):
    t = T(d); x = boom(d, 90, 28, 6, 0.5) + 0.7*lp(noise(d), 1800, 2)*np.exp(-t/0.3) + 0.3*np.sin(2*np.pi*140*t)*np.exp(-t/0.2)
    return np.tanh(x*1.6)*0.8
def tom(f=110, d=0.5): t = T(d); return (np.sin(2*np.pi*np.cumsum(f*(1+0.6*np.exp(-t*30)))/SR))*np.exp(-t/0.14)*0.9
def snare(d=0.3): t = T(d); return (hp(noise(d), 1500)*np.exp(-t/0.07)*0.8 + np.sin(2*np.pi*190*t)*np.exp(-t/0.06)*0.5)
def tick(f=2200, d=0.03): t = T(d); return (np.sin(2*np.pi*f*t) + 0.7*noise(d))*np.exp(-t/0.006)*0.5
def whoosh(d=0.9, f0=300, f1=4500, peak=0.5, rev=False):
    t = T(d); n = noise(d); out = np.zeros(len(t)); seg = 6
    for i in range(seg):
        a, b = int(i*len(t)/seg), int((i+1)*len(t)/seg); fc = f0*(f1/f0)**((i+.5)/seg)
        out[a:b] = (lp(n, fc*1.4, 2) - lp(n, fc*0.5, 2))[a:b]*(1.0+i*0.15)
    env = np.exp(-((t/d-peak)**2)/(2*0.18**2)); out = out*env*6
    return out[::-1] if rev else out
def charge(d=1.6, f0=180, f1=2600, g=1.0):
    t = T(d); f = f0*(f1/f0)**(t/d); ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sin(ph) + 0.5*np.sin(2*ph) + 0.3*np.sin(3.01*ph)
    x *= (0.6+0.4*np.sin(2*np.pi*(8+14*t/d)*t)) * (t/d)**1.5
    fz = hp(noise(d), 3000)*(t/d)**2*0.7
    return (x*0.5 + fz)*np.minimum((d-t)/0.03, 1)*g
def fire_burst(d=1.2, f=1500):
    t = T(d); n = noise(d); x = lp(n, f, 2)*np.exp(-t/0.25)*3 + hp(n, 4000)*np.exp(-t/0.08)*0.8
    s = np.sin(2*np.pi*np.cumsum(900*np.exp(-t*5)+80)/SR)*np.exp(-t/0.3)
    return np.tanh((x + s + boom(d, 70, 30, 8, 0.4)*0.9)*1.3)*0.8
def beam_body(d, base=110, detune=0.0, g=1.0):
    t = T(d); ph = 2*np.pi*np.cumsum(base*(1+detune)+3*np.sin(2*np.pi*5*t))/SR
    x = sum(np.sin(h*ph)/h**0.5 for h in (1, 2, 3, 4, 5, 6, 7)) * (0.7+0.3*np.sin(2*np.pi*24*t))
    x = x*0.4 + hp(noise(d), 2500)*0.35*(0.6+0.4*np.sin(2*np.pi*17*t))
    return np.tanh(x*1.2)*np.minimum(t/0.08, 1)*np.minimum((d-t)/0.15, 1)*g
def thunder(d=2.2):
    t = T(d); n = lp(noise(d), 260, 2)*10; am = (0.5+0.5*np.sin(2*np.pi*3.1*t+1))**1.5
    return n*am*np.minimum(t/0.05, 1)*np.exp(-t/1.0)
def rumble(d, g=1.0):
    t = T(d); x = np.sin(2*np.pi*np.cumsum(34+5*np.sin(2*np.pi*0.9*t))/SR) + lp(noise(d), 120, 2)*14
    return x*(0.6+0.4*np.sin(2*np.pi*7*t))*np.minimum(t/0.6, 1)*np.minimum((d-t)/0.8, 1)*g
def hiss(d=1.0):
    t = T(d); n = hp(noise(d), 4500); return lp(n, 11000, 1)*(0.4+0.6*np.sin(np.pi*t/d)**2)*(0.75+0.25*np.sin(2*np.pi*14*t))*0.5
def padchord(freqs, d, g=1.0, bright=1.0):
    t = T(d); x = np.zeros(len(t))
    for f in freqs:
        for dt in (-0.004, 0.004):
            ph = 2*np.pi*f*(1+dt)*t; x += sum(np.sin(h*ph)/h for h in range(1, 6))*0.12*bright
    return x*np.minimum(t/(d*0.5), 1)*np.minimum((d-t)/(d*0.3), 1)*g
def gate(x_t0, x_t1, fo=0.03): pass
# ---------- word-anchored times ----------
t_cut = fw("breathe", 60)["end"] + 0.04                         # hard music cut (before the final whisper)
t_whisper = sent("I always")["start"]
t_story = sent("A kid")["start"]; t_rose = fw("Apep", 21)["start"]
t_tot = fw("totality")["start"]; t_swall = fw("swallowed")["start"]
t_sun = fw("sunlight")["start"]; t_goh = fw("Go")["start"]
# grid for drums: BEAT multiples from t_story
def grid(n): return t_story + n*BEAT
# ---------- bed ----------
fm = 46 + 3*np.sin(2*np.pi*0.05*t_all)
drone = np.sin(2*np.pi*np.cumsum(fm)/SR)*0.5 + 0.35*np.sin(2*np.pi*np.cumsum(fm*1.5*(1+0.002*np.sin(2*np.pi*0.11*t_all)))/SR) + 0.25*np.sin(2*np.pi*np.cumsum(fm*0.5)/SR)
dark = lp(noise(len(t_all)/SR), 500, 2)*7*(0.5+0.5*np.sin(2*np.pi*0.13*t_all+1))**1.5
lvl = np.interp(t_all, [0, 3, t_story, t_tot-0.05, t_tot, t_tot+2.8, t_tot+3.5, t_sun-0.1, t_sun+1.5, t_goh+2, t_cut-0.5, t_cut, t_cut+0.03, TOTAL],
                      [0.5, .5, .5, .8, .15, .15, .8, .7, .25, .35, .75, .75, 0, 0])
buf += (drone*0.55 + dark*0.3)*lvl
# ---------- hook 0-3 ----------
put(impact(), 0.0, 0.95)
for j in range(14): put(tick(2600+rng.random()*1500, 0.02), 0.25+j*0.17+rng.random()*0.05, 0.5)   # sparks on Mjolnir
put(charge(1.0, 300, 3200), 1.0, 0.8)
put(rumble(2.2), 0.0, 0.5); put(hiss(0.9), 0.3, 0.6)
put(impact(), 2.0, 0.85); put(thunder(1.0), 2.0, 0.6)                          # WHO SURVIVES slam
put(whoosh(0.6, 400, 5000, 0.85, rev=True), 2.55, 0.9)                          # rewind
# ---------- split-roll ----------
def ratchet(t0, t1, iv=0.045):
    t = t0
    while t < t1: put(tick(2200+300*rng.random()), t, 0.9); iv = min(iv*1.06, 0.2); t += iv
ratchet(3.0, 4.1); put(boom(0.9, 110, 50), 4.1, 1.0); put(tick(900, 0.08), 4.1, 1.0); put(impact(), 4.1, 0.7)   # lock MONSTER
put(hiss(1.3), 4.45, 0.6); put(rumble(4.5, 0.7), 4.3, 0.5)                         # Apep intro bed
put(boom(0.8, 90, 40), 5.0, 0.5)
ratchet(9.4, 10.1); put(boom(0.9, 95, 45), 10.1, 1.0); put(tick(700, 0.08), 10.1, 1.0); put(impact(), 10.1, 0.7)  # lock GUARDIAN
put(thunder(3.0), 10.7, 0.6); put(boom(0.9, 70, 30), 10.9, 0.7)                  # Thor intro bed
put(thunder(2.2), 13.0, 0.35)
t_vs = 16.1; put(impact(), t_vs, 1.0); put(boom(2.5, 60, 24), t_vs, 0.8)       # VS
put(lp(noise(3), 250, 2)*np.exp(-T(3)/1.2)*6, t_vs, 0.5)
# drums during intros (light, 155 BPM)
def drumhit(t, kind, g):
    if kind == "k": put(boom(0.9, 95, 46, 7, 0.28), t, g)
    elif kind == "t": put(tom(105 if int(t*10) % 2 else 140), t, g*0.7)
    elif kind == "s": put(snare(), t, g*0.5)
def drums(t0, t1, g0, g1, skip=()):
    n0 = 0; t = t0; pat = ["k", None, "k", "k", "t", None, "k", "s"]    # 8ths, war pattern, 1 bar = 8 steps
    i = 0
    while t < t1:
        p = (t-t0)/max(t1-t0, 1e-6); k = pat[i % 8]
        if k and not any(a <= t < b for a, b in skip): drumhit(t, k, g0+(g1-g0)*p)
        if i % 8 == 7 and rng.random() < 0.5 and not any(a <= t+BEAT/4 < b for a, b in skip): drumhit(t+BEAT/4, "t", (g0+(g1-g0)*p)*0.8)
        i += 1; t += BEAT/2
drums(5.2, 9.3, 0.25, 0.5); drums(11.2, 16.0, 0.3, 0.6)
# ---------- story ----------
put(impact(), t_story, 0.8)                                         # shatter into story
put(hiss(1.0), fw("hiss")["start"], 0.7)
drums(grid(2), t_rose - 0.01, 0.1, 0.25)
put(fire_burst(1.6, 900), t_rose, 0.8); put(rumble(3.0, 0.9), t_rose - 0.1, 0.5)     # Apep rises from the sand
put(thunder(2.4), fw("thunder")["start"], 0.8); put(impact(), fw("thunder")["start"] + 0.45, 0.9)   # thunder falls, Thor blocks
put(whoosh(0.7, 500, 3000, 0.7), fw("caught")["start"]-0.5, 0.6); put(impact(), fw("caught")["start"] + 0.2, 0.7)
t_ran = fw("ran")["start"]; put(whoosh(0.8, 200, 2000, 0.5), t_ran, 0.5)       # kid runs away
# main body: drums from rose to totality; one bar out at totality; to sunlight
drums_skip = [(t_tot - 0.05, t_tot - 0.05 + BAR), (t_sun - 0.1, 1e9)]
drums(t_rose, t_sun - 0.1, 0.45, 0.95, skip=drums_skip)
# belt: runes flare
t_belt = fw("doubled")["start"]; put(charge(0.7, 200, 1800), t_belt - 0.75, 0.6); put(impact(), t_belt, 0.9); put(thunder(1.5), t_belt, 0.5)
# hammer throw: whoosh + hit + catch
t_h = fw("hammer", 29)["start"]; put(whoosh(0.9, 250, 4200, 0.4), t_h, 0.9)
t_mis = fw("misses")["start"]; put(impact(), t_mis - 0.1, 0.7); put(tick(3200, 0.05), t_mis + 0.5, 0.8)
# roar: deep earthquake rumble + split sand
t_roar = fw("roared", 31)["start"]; put(rumble(4.2, 1.3), t_roar - 0.2, 0.8); put(impact(3.0), t_roar + 0.1, 0.9)
put(fire_burst(1.4, 500), fw("split")["start"], 0.6); put(boom(1.5, 60, 25), fw("buckled", 33)["start"], 0.7)
put(whoosh(0.8, 200, 2500, 0.5), fw("orbs", 0)["start"] if False else 34.2, 0.4)   # black orbs (#28)
# hypnotic stare: murky throb
h0 = fw("stare")["start"] - 0.1; h1 = fw("in", 38)["end"] + 0.1; th = T(h1-h0)
hyp = np.sin(2*np.pi*np.cumsum(150+6*np.sin(2*np.pi*0.8*th))/SR) + 0.6*np.sin(2*np.pi*np.cumsum(151.5+4*np.sin(2*np.pi*0.6*th))/SR) + 0.4*np.sin(2*np.pi*np.cumsum(75+3*np.sin(2*np.pi*0.5*th))/SR)
put(lp(hyp, 420, 2)*(0.55+0.45*np.sin(2*np.pi*3.0*th))*np.hanning(len(th))*0.7, h0, 0.55)
put(hiss(1.0), fw("coils")["start"], 0.5)
# venom bite + stagger
put(impact(1.8), fw("Venom")["start"], 0.8)
put(hp(noise(1.2), 3000)*np.exp(-T(1.2)/0.3)*0.5, fw("burned")["start"], 0.6)
for j in range(9): put(boom(0.5, 70, 40, 8, 0.15), fw("staggered")["start"] + 0.12 + j*0.2, 0.35)   # nine steps
# eclipse totality: sub drop, drums out for 1 bar
td = T(3.2); drop = np.sin(2*np.pi*np.cumsum(90*np.exp(-td/0.9)+28)/SR)*np.minimum(td/0.05, 1)*np.exp(-td/1.7)
put(drop, t_tot, 1.4); put(rumble(BAR+1.5, 0.7), t_tot, 0.6)
put(whoosh(1.4, 3000, 200, 0.7), t_tot-1.0, 0.5)
put(impact(), t_tot + BAR, 0.8)                                   # drums return
# beams: charge both sides, fire, clash (shots #39-#40)
t_rb = fw("roared", 47)["start"]; t_ch = fw("chaos", 48)["start"]; t_pd = fw("harder", 48)["end"]
put(charge(t_ch - t_rb + 0.1, 180, 2400, 0.9), t_rb, 0.9); put(charge(t_ch - t_rb + 0.1, 130, 1900, 0.9), t_rb + 0.05, 0.7)
put(thunder(1.2), fw("lightning", 48)["start"], 0.6)
put(fire_burst(1.3, 1800), t_ch + 0.05, 1.0); put(impact(), t_ch + 0.05, 0.9)
d_cl = t_pd + 0.4 - t_ch; put(beam_body(d_cl, 98, 0.0, 0.7), t_ch + 0.1, 0.8); put(beam_body(d_cl, 130, 0.012, 0.6), t_ch + 0.1, 0.7)
put(whoosh(0.8, 300, 4000, 0.5), fw("pushed")["start"], 0.6)
put(impact(), fw("pushed")["start"] + 0.2, 0.7)                              # Apep wins: Thor to one knee
# bait: ox head hammer, high arc
t_bait = fw("bait", 52)["start"]; put(whoosh(1.1, 250, 3500, 0.5), t_bait - 0.25, 0.8); put(tick(1800, 0.06), fw("hooked", 52)["start"], 0.6)
put(boom(0.6, 80, 40), fw("tore")["start"], 0.5)
# final: Apep lunges, Thor channels everything, beam-clash right wins (shot #45)
t_lun = fw("lunged")["start"]; t_l2 = fw("lightning", 55)["start"]; t_bl = fw("blasted")["start"]; t_sk = fw("skyward")["end"]
put(hiss(0.8), t_lun, 0.6); put(boom(0.8, 70, 35), t_lun + 0.2, 0.6)
put(charge(t_bl - t_l2 + 0.5, 150, 3000, 1.0), t_l2 - 0.3, 1.0)
put(fire_burst(1.8, 2200), t_bl, 1.0); put(impact(3.0), t_bl, 1.0); put(thunder(2.5), t_bl, 0.9)
put(beam_body(t_sk - t_bl + 0.6, 120, 0.0, 0.9), t_bl + 0.1, 0.9); put(beam_body(t_sk - t_bl + 0.6, 92, 0.015, 0.5), t_bl + 0.1, 0.6)
buf[int((t_bl+0.05)*SR):int((t_bl+0.12)*SR)] *= 0.2      # beat of slow-mo
put(impact(3.5), t_sk + 0.2, 1.0); put(boom(2.8, 60, 22), t_sk + 0.2, 1.0)    # eruption, crash
put(whoosh(0.9, 4000, 300, 0.6), t_sk + 0.3, 0.6)
# sunlight returns: triumphant swell (drums out)
put(padchord([130.8, 196.0, 261.6, 329.6], t_goh + 2 - t_sun + 0.6, 1.0, 1.2), t_sun - 0.1, 0.9)
put(padchord([261.6, 392.0, 523.3, 659.3], t_goh + 1 - t_sun, 0.6, 1.0), t_sun + 0.3, 0.7)
put(impact(2.2), t_sun, 0.7)
for dt, f in [(0.0, 523.25), (0.35, 659.25), (0.7, 783.99), (1.05, 1046.5)]: put(padchord([f], 2.5, 0.3, 0.8), t_sun + 0.2 + dt, 0.6)
# Thor / kid: soft, a low gloom returns under the kid's shadow
t_sh = fw("shadow")["start"]; put(rumble(t_cut - t_sh - 0.2, 0.5), t_sh, 0.5)
put(hiss(1.2), fw("Okay")["end"] + 0.3, 0.45)
# dunes breathe: slow swells, a heartbeat
for j in range(3): put(boom(0.7, 70, 36, 8, 0.22), fw("dunes", 70)["start"] + j*0.62, 0.45 + 0.1*j)
# ---------- HARD CUT ----------
buf[int(t_cut*SR):] = 0
out = buf[:int(TOTAL*SR)]
out[-int(0.05*SR):] *= np.linspace(1, 0, int(0.05*SR))
pk = np.max(np.abs(out)); out = np.tanh(out/pk*1.4)/np.tanh(1.4)*0.9
x = np.stack([out, out], 1); x = np.clip(x, -1, 1)
with wave.open(f"{H}/music.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x*32767).astype("<i2").tobytes())
cues = dict(lockL=4.1, lockR=10.1, VS=t_vs, story=round(t_story, 2), rise=round(t_rose, 2), belt=round(t_belt, 2), hammer=round(t_h, 2), roar=round(t_roar, 2),
            stare=round(h0, 2), totality=round(t_tot, 2), drums_back=round(t_tot+BAR, 2), charge=round(t_rb, 2), fire=round(t_ch, 2), bait=round(t_bait, 2), chargeL=round(t_l2-0.3, 2),
            blast=round(t_bl, 2), crash=round(t_sk+0.2, 2), sunlight=round(t_sun, 2), cut=round(t_cut, 2), whisper=round(t_whisper, 2))
print("music.wav", round(len(out)/SR, 2)); print(json.dumps(cues)); json.dump(cues, open(f"{H}/cues.json", "w"), indent=1)
