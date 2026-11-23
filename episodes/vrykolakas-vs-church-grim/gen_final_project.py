#!/usr/bin/env python3
"""Writes project-final.json: scene durations aligned to audio/words.json + sections.json (frame-quantised)."""
import json, os
HERE, B = os.environ["HERE"], os.environ["B"]
AS = json.load(open(f"{B}/assets.json")); I, HU = AS["I"], AS["HU"]
FPS, TOTAL = 30, 99.2
a = lambda n: f"art/b-{n}.png"
bgfg = lambda n: dict(image=a(n + "_bg"), fg=a(n + "_fg"))
# (start_time_s, scene dict) -- each scene runs until the next start; times come from words.json / sections.json
T = []
def add(t, **k): T.append((t, k))
tm = lambda e, **kw: [dict(file=e, **kw)]

add(0.0, **bgfg("hook-freeze-grim-stuck"), zoom=[1.3, 1.0], fg_zoom=[1.36, 1.08], shake=16, shake_win=[0, 1.6], flash=True,
    overlay=HU["h0"], overlays_timed=tm(I["hooktext"], enable="gte(t,1.5)"))
add(3.19, image=I["kidcard"], zoom=[1.0, 1.08], flash=True, overlay=HU["k100"])
# spin 1 (fast blurred pan) -> lock + FIGHTER 1 card on "Vrykolakas"
add(7.2, image=I["f1"].replace("fighter1", "spinblur1"), zoom=[1.55, 1.55], pan="down", overlay=HU["k100"])
add(7.65, image=I["f1"].replace("fighter1", "spinblur1"), zoom=[1.55, 1.55], pan="up", overlay=HU["k100"])
add(8.1, image=I["f1"], zoom=[1.14, 1.0], flash=True, shake=10, shake_win=[0, 0.3], overlay=HU["k100"])
add(9.4, image=I["f1"].replace("fighter1", "spinblur2"), zoom=[1.55, 1.55], pan="down", overlay=HU["k100"])
add(9.9, image=I["f1"].replace("fighter1", "spinblur2"), zoom=[1.55, 1.55], pan="up", overlay=HU["k100"])
add(10.4, image=I["f2"], zoom=[1.14, 1.0], flash=True, shake=10, shake_win=[0, 0.3], overlay=HU["k100"])
add(11.99, image=I["vs"][0], zoom=[1.0, 1.05], flash=True)
add(12.5, image=I["vs"][1], zoom=[1.05, 1.08])
add(13.0, image=I["vs"][2], zoom=[1.08, 1.1])
add(13.55, image=I["vs"][3], zoom=[1.1, 1.12])
add(14.14, image=a("kid-window-firefly"), zoom=[1.0, 1.15], pan="right", fade_in=0.3, clock="2:00 AM", overlay=HU["k100"])
add(16.8, image=a("forest-old-graves"), zoom=[1.0, 1.15], pan="left", overlay=HU["k100"])
add(21.7, image=a("grandma-garlic-flashback"), zoom=[1.0, 1.1], flash=True, overlay=HU["k100"])
add(23.8, image=I["rule"], zoom=[1.0, 1.06], flash=True, overlay=HU["k100"])
add(28.8, image=a("grandma-garlic-flashback"), zoom=[1.1, 1.3], pan="right", overlay=HU["k100"])
add(31.6, image=a("grave-rises"), zoom=[1.0, 1.2], shake=10, shake_win=[0.3, 2.4], flash_at=[1.9], overlay=HU["rise"])
add(35.2, image=a("claw-miss-kid-falls"), zoom=[1.0, 1.25], shake=22, shake_win=[0, 0.9], flash=True, overlay=HU["claw"])
add(37.4, image=a("claw-miss-kid-falls"), zoom=[1.25, 1.05], overlay=HU["claw2"])
add(39.39, **bgfg("grim-appears-stance"), zoom=[1.0, 1.12], fg_zoom=[1.04, 1.2], fg_slide=-30, flash=True, overlay=HU["grim"])
add(44.9, image=I["limit"], zoom=[1.0, 1.05], flash=True, overlay=HU["grim"])
add(46.59, image=I["r1"], zoom=[1.7, 1.0], shake=24, shake_win=[0, 0.7], flash=True, overlay=HU["grim"])
add(47.6, image=a("round1-grim-slams"), zoom=[1.0, 1.3], shake=20, shake_win=[0, 0.8], flash=True, overlay=HU["r1a"])
add(49.1, image=a("round1-grim-slams"), zoom=[1.3, 1.45], shake=14, shake_win=[0, 0.7], flash=True, flash_at=[1.1], overlay=HU["r1b"])
add(51.7, image=I["r2"], zoom=[1.7, 1.0], shake=24, shake_win=[0, 0.7], flash=True, overlay=HU["r1b"])
add(52.7, image=a("round2-thrown-over-wall"), zoom=[1.0, 1.25], pan="right", overlay=HU["r2a"])
add(55.5, image=a("round2-thrown-over-wall"), zoom=[1.25, 1.4], shake=18, shake_win=[0, 0.9], flash=True, overlay=HU["r2b"])
add(57.0, image=a("round2-grim-stuck"), zoom=[1.0, 1.1], overlay=HU["r2b"])
add(58.0, image=a("round2-grim-stuck"), zoom=[1.1, 1.25], shake=8, shake_win=[0, 0.5], flash=True, overlay=HU["r2c"])
add(61.3, image=a("round2-grim-stuck"), zoom=[1.25, 1.5], shake=18, shake_win=[2.6, 4.0], flash_at=[2.6], overlay=HU["r2c_n"],
    overlays_timed=tm(HU["r2c_b"], enable="gte(t,0.7)*lt(mod(t,0.4),0.2)"))
add(65.62, image=I["r3"], zoom=[1.7, 1.0], shake=24, shake_win=[0, 0.7], flash=True, overlay=HU["r3"])
add(66.7, image=a("round2-grim-stuck"), zoom=[1.5, 1.7], pan="right", overlay=HU["r3"],
    overlays_timed=tm(HU["r3_b"], enable="lt(mod(t,0.4),0.2)"))
add(68.0, image=a("round3-garlic-crush"), zoom=[1.0, 1.3], flash=True, overlay=HU["r3"])
add(69.6, image=a("round3-garlic-throw"), zoom=[1.0, 1.2], overlay=HU["r3"])
add(70.6, image=a("round3-garlic-throw"), zoom=[1.2, 1.5], shake=22, shake_win=[0, 0.9], flash=True, overlay=HU["r3t"])
add(73.2, **bgfg("round3-flashlight-lure"), zoom=[1.0, 1.25], fg_zoom=[1.0, 1.4], fg_slide=40, flash_at=[1.2], overlay=HU["r3t_n"])
add(80.3, **bgfg("round3-grim-pounce"), zoom=[1.05, 1.45], fg_zoom=[1.08, 1.6], fg_slide=-30, shake=24, shake_win=[1.2, 2.4], flash=True,
    flash_at=[1.3], overlay=HU["pz"], overlays_timed=tm(HU["pz0"], enable="gte(t,1.3)"))
add(83.6, image=I["ko"], zoom=[1.4, 1.0], shake=18, shake_win=[0, 0.6], flash=True, overlay=HU["ko"])
add(85.48, image=a("dawn-peace"), zoom=[1.0, 1.12], pan="right", fade_in=0.5, clock="5:40 AM")
add(91.48, **bgfg("cliffhanger-soil-moves"), zoom=[1.0, 1.2], fg_zoom=[1.0, 1.3], shake=6, shake_win=[3.0, 3.3], clock=None)
add(94.77, image="build/final/img/black.png", hud=False, zoom=[1.0, 1.0])
add(95.3, image=I["cta1"], zoom=[1.0, 1.06], flash=True, hud=False)
add(96.4, image=I["cta2"], zoom=[1.0, 1.06], flash=True, hud=False)
add(97.8, image=I["cta3"], zoom=[1.0, 1.06], flash=True, hud=False)

fr = lambda t: round(t * FPS)
scenes = []
for k, (t, sc) in enumerate(T):
    end = T[k + 1][0] if k + 1 < len(T) else TOTAL
    n = fr(end) - fr(t)
    sc = dict(sc); sc["duration"] = round(n / FPS, 4); sc["_t"] = round(t, 2)
    scenes.append(sc)
proj = dict(width=1080, height=1920, fps=30, output="build/final/battle-final.mp4",
            hud=dict(label="BATTLE SPIN · VRYKOLAKAS vs CHURCH GRIM"),
            voice="audio/voice_dark.wav", music="audio/music.wav", music_volume=0.11,
            captions="audio/captions.ass", loudness=-14, scenes=scenes)
json.dump(proj, open(f"{HERE}/project-final.json", "w"), indent=1, ensure_ascii=False)
print("scenes", len(scenes), "sum", round(sum(s["duration"] for s in scenes), 3))
