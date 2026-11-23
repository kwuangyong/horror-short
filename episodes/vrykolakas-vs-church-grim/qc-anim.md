# QC - animated episode (v4 script) - build-anim.sh

- Video: build/anim/anim-final.mp4, 1080x1920 30 fps, 102.73 s (target 95-105: OK). Preview: preview/anim-final.mp4 (10.96 MB). Sheet: preview/anim-final-sheet.jpg (16 frames, chronological).
- Loudness: -14.2 LUFS integrated (audio-anim/mix-test.mp3, loudnorm 2-pass, trimmed to 102.73 s; SFX are the ones baked in music.wav, none added).
- Captions: audio-anim/captions.ass burned in (centre at y=1344 = 70 % height; HUD at top y 64-114, cards at y 330/560, so no overlap). Font: Oswald is not installed, ffmpeg falls back to Inter.
- Timeline generated from audio-anim/words.json (anim/make_timeline.js): lock hits 9.18 / 12.61, VS 15.99, K.O. 83.47, knock 97.33 all on the music cues.
- Render: 3082 frames in 121 s (39 ms/frame wall, 4 workers) + ~3 min encode.
- Frames inspected (0.5x): hook, split roll (locks), forest, graveyard, rise, Grim appears, garlic, inscription, limit, R1 lunge/jaws/rake, R2 grab/throw/blocked/claws/turns to kid/cower, R3 crawl/bristle/garlic/stench/smoke/church/pounce/jaws/snap, K.O., dawn/drag/dig, kid runs, Grim on wall, bedroom/wake/knock, CTA.
## Known deviations / risks
- Geometry: Vrykolakas ends R2 on the RIGHT of the tomb facing left (he crossed the red line), so the hook freeze shows him right of the kid, Grim on the far right (script says Vrykolakas left).
- No real slow-mo (camera punch + flash instead); characters ~25-40 % of frame height in fights (closest shots ~45 %), not 45-60 % everywhere.
- Kid is hidden behind Grim's body in some R1/R3 wide shots (depth overlap); peek frames keep the head above Grim's back.
- Garlic bush is also visible in the hook and R1 (prop is always in the scene). Church/dog cut-away is dark and small. Vrykolakas "pinned" arms dip below the ground line. Caption font fallback.
- Nothing downloaded: all art is generated in code; no placeholder images, no unlicensed assets.
