# QC - episode #002 BLACK-EYED CHILDREN vs CERBERUS, script v2 / audio v2 (ending A: Cerberus wins) - build-anim.sh

- Video: build/anim/black-eyed-children-vs-cerberus.mp4, 1080x1920 30 fps, 87.5 s. Preview preview/black-eyed-children-vs-cerberus.mp4 (<15 MB), 20-frame sheet preview/black-eyed-children-vs-cerberus-sheet.jpg. Loudness -14.2 LUFS (audio-anim/mix_test.sh, trimmed to 87.5 s, 0.5 s fade). SFX only the ones baked in music.wav (lamp dies 26.49, hypnotic throb 25.26-29.39, serpent hiss 35.03, drool 35.95, lullaby break 58.44, fire/claw 62.65, drag 65.43, gate slam 66.79 (+shake/flash), K.O. 67.71, knock 81.08, "Can we come in?" 82.20).
- New format: no HUD bars, no ROUND cards; K.O. / WINNER: CERBERUS kept. 53 shots (44 scripted scenes incl. sub-shots), anim/make_timeline.js -> timeline.json, cuts keyed to words.json. `render.js --check` (180 rule, BEC left / Cerberus right) OK.
- Hook = freeze of the fight "Only one head is awake" (two heads sagged, one up; OTS-kid foreground). "Come in." is shown as a close-up of a BEC mouth (mimic, kid_mimic caption grey italic), then the kid shakes their head.
- Powers: BEC no-blink stare, hypno chant (grey sound rings), lamp shrinks/flickers/dies, kid's hand drifts to the latch (hand-drift, snap-awake); Cerberus snake mane + serpent tail (tail-strike/coil), venom drool withers the grass and aconite blooms (grass prop wilt/bloom), triple bite.
- Drag-down chain: silhouette bite (red backlight tint, rigs silhouetted, flash, black smoke) -> POV-GATE (looking up out of the gate: dog heads, serpent tail, grey face sinking) -> ECU grey hand clawing the planks (scratch gouges) -> serpent tail coil/yank -> wide, gate slams shut (ring collapse, shake, flash).
- Captions: Bebas Neue 92, --max-words 5 --max-chars 24, speaker colours; captions_dyn.py moves close-up captions to y=1590.
## Known deviations / risks
- The chain 33-36 is ~0.6 s per shot (audio gives only ~1.7 s between "drags" and "shut"), so it reads as a fast montage.
- Kid is a separate rig per place (window / porch / inside / bedroom); BEC are fixed rigs reused (window, porch). Split-roll BEC card shows one child.
- Serpent mane/tail are small at wide range (best in the ECU shots). POV-GATE is drawn procedurally (silhouettes), not a rig.
- Close-up captions at 83 % height can sit over ground.
