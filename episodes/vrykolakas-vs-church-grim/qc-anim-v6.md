# QC - cinematic animated episode v6 (build-anim-v6.sh)

- Video: build/anim/anim-v6.mp4 1080x1920 30 fps, 96.80 s (script target 90-98: OK). Preview preview/anim-v6.mp4 (<15 MB), sheet preview/anim-v6-sheet.jpg (20 frames, chronological).
- Loudness: -14.2 LUFS (audio-anim/mix_test.sh, trimmed to 96.8 s with 0.5 s fade; SFX baked in music.wav, none added: locks 7.62/10.52, VS 13.37, K.O. 75.33, music cut 90.56, knock 91.50, window scratch + breath after).
- Timeline: anim/make_timeline_v6.js -> anim/timeline-v6.json (50 shots incl. sub-shots of the 35 scripted scenes, 80 cues); every cut keyed to words.json. Dialogue: `talk` jaw/mouth driven by the grim (79.83-83.7) and kid (84.58-85.4) word intervals of words.json (speaker field).
- 180-degree rule: `render.js --check` = OK (sides lock Vrykolakas left / Grim right in every VERSUS shot). R3 (62.3-76.3) is shown mirrored because in world space Vrykolakas is right of Grim there.
- Kid v2 everywhere (POV sleeve, OTS back, peeks, cower, talk, run, bed). Kid + tomb sit at the back (y~944, scale .66): head and scarf clear Grim's back in the WIDE shots (checked 31.0, 58.4, 76.2, 78.4).
- Window cliffhanger: knock 91.50, slow pan to the window, Vrykolakas face behind the glass (moon back-light, hollow glowing eyes, claws scratching, fog from breath), kid turns slowly, hard black cut at 93.0 before they see it (audio puts the scratch/breath over "Nobody burned it", so the tomb insert starts at "Is it really dead").
- Captions: audio-anim words.json, `Bebas Neue` 104 (fonts-bebas-neue installed; Oswald/Anton/League Gothic not in apt), speaker colours (Grim amber, kid italic), 25 captions moved to the lower band (y=1590) on close-up / low-angle shots by captions_dyn.py.
- Frames inspected: split locks, Grim blocks, garlic/headstone, R1 lunge/jaw, R2 grab/throw/outside, turns-to-kid (OTS + ECU eye), R3 (mirrored), church cut-away (bright), pounce/jaw ECU, K.O., dawn burial, Grim talk, kid talk, kid runs, bedroom, window, CTA.
## Known deviations / risks
- Hook frame: Vrykolakas is right of the tomb facing left (he crossed the red line in R2). Wall gap with garlic is on the right of the tomb (v5 layout), not at the left as in the script.
- Window monster is stylised (egg-shaped grey head, glowing hollow eyes), more cartoon than creepy.
- POV forest still flat vector shapes (volume from shading, mist, blur). Church dog is a soft glowing silhouette.
- Close-up captions at 83 % height can sit over legs/ground.
