# QC - cinematic animated episode v5.1 (build-anim-v5.sh)

- Video: build/anim/anim-v5.mp4, 1080x1920 30 fps, 89.67 s (script target 85-95: OK). Preview: preview/anim-v5.mp4 (<15 MB). Sheet: preview/anim-v5-sheet.jpg (20 frames, chronological).
- Loudness: -14.2 LUFS integrated (audio-anim/mix_test.sh: voice + music with baked SFX, loudnorm 2-pass; no extra SFX). Key hits unchanged: locks 7.62/10.52, VS 13.38, K.O. 75.35, music cut 84.26, knock 85.2.
- Timeline: anim/make_timeline_v5.js -> anim/timeline-v5.json, 55 shots / 81 cues, every cut keyed to words.json (W('word', ~time) picks the nearest occurrence of repeated words).
- Captions: audio-anim/captions.ass burned in (size 84, y=1344 = 70 % of height). Checked sheet frames: no caption overflow; HUD (top), round/rule cards (y 330-560) and split-roll names (y ~1130-1180 after the zoom pivot fix) do not collide with captions. Captions do sit over character legs in close shots (unavoidable at 65-80 %).
- Engine fixes requested: POV forest has far/mid/near depth groups, two-tone trunks, lit canopy tips, near trees out of focus; OTS kid back has pointed hood, flying scarf, shoulders, arm + oversized flashlight with beam; VERSUS framing is head-based and tighter (zoom 1.4-1.7, ~35-45 % of frame height in fights, more for slow-mo cuts); slow-mo also slows fx, fog and fireflies (actor-time warp).
- Frames inspected: POV, OTS, rise (low angle), Grim blocks/leaps, garlic + headstone inserts, limit line, R1 lunge + jaw ECU, R2 grab/throw/outside/slashes, turns-to-kid (OTS + ECU eye), R3 crawl/garlic/stench/church cut-away/pounce/jaw, K.O., dawn burial, kid runs, bedroom, door, knock, CTA.
## Known deviations / risks
- Geometry: Vrykolakas ends R2 on the right of the tomb facing left (hook frame mirrors the script's "Vrykolakas left").
- Shot 39 church cut-away is dark; dog silhouette small. POV trees are still flat vector shapes (depth from scale/fog/blur only). OTS kid is a stylised blob-with-hood.
- Kid is hidden behind Grim in some wide shots (depth overlap); reaction shots hide Vrykolakas/Grim for one cut to keep the kid visible.
- Slow-mo is an actor-time lag with exponential catch-up (poses speed up briefly after the window).
- Oswald font missing: captions fall back to Inter. No downloaded assets, no placeholders.
