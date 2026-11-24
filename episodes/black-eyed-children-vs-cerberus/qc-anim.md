# QC - episode #002 BLACK-EYED CHILDREN vs CERBERUS (ending A: Cerberus wins) - build-anim.sh

- Video: build/anim/black-eyed-children-vs-cerberus.mp4, 1080x1920 30 fps, 97.0 s (script target 90-98: OK). Preview preview/black-eyed-children-vs-cerberus.mp4 (<15 MB), sheet preview/black-eyed-children-vs-cerberus-sheet.jpg (20 frames, chronological).
- Loudness -14.2 LUFS (audio-anim/mix_test.sh trimmed to 97 s, 0.5 s fade). SFX only the ones baked in music.wav (locks 7.75/10.29, VS 13.46, lullaby break 66.0, fire/growl 70.45, gate slam 75.11 (+shake/flash added), K.O. 76.06, music cut 89.18, knock 90.10, "Can we come in?" 91.22).
- Timeline: anim/make_timeline.js -> anim/timeline.json (42 shots incl. sub-shots of the 35 scripted scenes, 69 cues); cuts keyed to words.json (W('word', ~time)). Voices (talk/mimic/hum) from the words.json speaker field: children, kid, kid_mimic, cerberus.
- 180-degree rule: `render.js --check` OK (BEC screen-left, Cerberus screen-right in every VERSUS shot; no mirroring needed). Kid is placed in the window right of the door / inside the cabin; head and scarf visible in every wide cabin shot (checked 17.0, 34.0, 38.0, 51.2, 53.4, 78.8).
- Hook = freeze of the R2 frame ("Only one head is awake"): BEC left head-tilt, Cerberus right with two heads sagged, one awake; OTS-kid foreground; HUD C 35 / B 60.
- Sleeping vs awake heads: sleepy heads droop 50 deg, eyelid line, eye glow off, ears down; the last head (fight-sleep) keeps one half-open amber eye. Cerberus shown at medium/close range (ECU head / head0 / head2) because three heads stack when far.
- Drag down: silhouette bite (red backlight tint, BEC + Cerberus set to silhouette, flash), BEC dissolve-smoke + dark smoke fx + alpha, sink into the gate, gate close-slam with shake + flash. No blood, no detail.
- Captions: Bebas Neue 92, --max-words 5 --max-chars 24, speaker colours (children grey, kid italic white, cerberus red-orange); captions_dyn.py moved the close-up ones to y=1590.
- Frames inspected: split lock, knock/window, Cerberus rising, R1 lunge, R2 sleepy ECUs, mimic whip CU, kid refusal, three heads waking, seize/silhouette/drag, gate slam, K.O., dawn dialogue, bedroom, window BECs, CTA.
## Known deviations / risks
- BEC are two separate rigs (variants) reused for the cabin window, porch and bedroom window (fixed, motionless by design).
- Cabin is a cross-section with a flat porch; Cerberus overlaps the door/gate area, so the door is mostly hidden when he blocks it.
- Split-roll BEC card shows one child (second child only on the porch). Labels "BLACK-EYED / CHILDREN · THE KNOCKERS" shortened to fit the zoomed card.
- Close-up captions at 83 % height can sit over ground/legs.
