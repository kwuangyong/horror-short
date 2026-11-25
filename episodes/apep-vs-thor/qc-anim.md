# QC anim · apep-vs-thor (#003)

Video: `build/anim/apep-vs-thor.mp4` (1080x1920, 30 fps); preview `preview/apep-vs-thor.mp4` (8.1 MB), sheet `preview/apep-vs-thor-sheet.jpg` (20 frames). Rebuild: `bash episodes/apep-vs-thor/build-anim.sh`.

| Check | Result |
|---|---|
| `render.js --check` | `180-RULE OK` (Apep screen-left, Thor screen-right in every `versus` frame) |
| Duration | 76.81 s (ffprobe; timeline 76.85, audio trimmed/faded to video length), target 70-85 s: PASS |
| Shots (`shots[]`) | 56 (incl. #4/#9/#14 placeholders under the 3 split-roll instances; +#20b block, +#50b), target 50-56: PASS |
| Loudness | -14.2 LUFS integrated (mix-test + burn-in mux): PASS |
| Preview size | 8.1 MB (< 15 MB): PASS |
| HUD / ROUND / still images | none; every shot has push + pan; whip transitions follow the projectile direction; cinema + embers in action |

## Cổng 3 milestones (frames viewed from the final mp4 or timeline dumps)
| Milestone | t (s) | Result |
|---|---|---|
| Hook (coil squeeze, Thor face visible, glint, WHO SURVIVES slam, rewind glitch) | 0.4 / 2.5 | PASS |
| Split-Roll lock MONSTER | 4.1 | PASS |
| Intro Apep: low, cu, ecu eye + glint, plate; pillar 0.75 s offset to the side, face clear | 4.5-9.4 | PASS (Apep still sunk for the first ~0.5 s of the pillar) |
| Lock GUARDIAN | 10.1 | PASS |
| Intro Thor: low, cu, ecu eye glint (glow boosted), wide + lightning orbs, plate | 10.55-16.0 | PASS |
| VS + WHO WINS? COMMENT | 16.7 | PASS |
| Thunder cart streak + Thor lands, guardian blocks the first strike | 24.1 / 25.6 | PASS (cart is a faint silhouette, per review note) |
| Kid runs out of frame (right) | 27.1-28.0 | PASS (kid `vis` off 28.05-62.6, no kid in any 1v1 frame) |
| Monster terrain rises (spires + coil mounds on the same desert) | 32.35 | PASS |
| `slash` hammer throw / `pillar` belt / `orbs` / `beam` charge / `beam-clash` L wins / bait `orbs`+`slash` / `beam-clash` R wins | 30.9 / 30.0 / 34.15 / 48.7 / 50.0 / 55.2 / 57.5 | PASS |
| Eclipse track (partial -> deeper -> totality at "totality" -> clears at "sunlight") | 17.4 / 32.3 / 45.9 / 61.0 | PASS |
| Final blast: slow-mo 0.6 + crash-zoom, ecu eye crash | 57.1-59.0 | PASS |
| Flashlight flickers / rolls and goes out (no kid shown) | 44.7 / 47.3 | PASS |
| Hiding-spot insert, kid back, no mark | 62.6 | PASS |
| Serpent-headed shadow of the kid | 70.5 | PASS but weak (see below) |
| Sunset dunes breathe, eye opens, whisper, CTA, fade | 71.5-76.85 | PASS |
| Captions not over faces (cu/ecu/low moved to y=1590), none in the hook, inside the frame (size 92, max-chars 22) | all | PASS |

## Weak points
- Serpent shadow (#52) is a flat dark polygon: readable but low contrast, partly under the caption.
- Thunder cart is only a glowing silhouette; ox-head and altar are simple vector props.
- Bite at #34 is a close mouth shot, the fangs do not visibly touch Thor's shoulder.
- Totality wide shots are very dark; Apep reads through aura and rim only.
- Sun shows a black disc to its left (moon sliding) at partial eclipse and while it clears.
- `#33` hold is 2.2 s (narration silence 38.6-41.7 s).

## Engine changes (backward compatible; `sakuga_demo` still `180-RULE OK`)
- `sakuga.js`: new prop `shape` (polygons, ellipses, glows with track-driven opacity/offset/scale, attach to a rig marker).
- `stage.js`: cue param `pose:{...}` overrides pose values (eye glow boost); `G.markerAt` debug.
- `rigs.js`: apep `coil-squeeze` accepts `jaw` and `age`.
- `anim/markers.js`: debug helper for marker positions.

## Assets
None external. Everything is vector/code and audio is synthesized (no licences).

---
# v2 (tempo -20%, colossal Apep) - 94.04 s
Video `build/anim/apep-vs-thor.mp4`; preview `preview/apep-vs-thor.mp4` (10.0 MB), sheet `preview/apep-vs-thor-sheet.jpg`; v1 kept as `preview/apep-vs-thor-v1.mp4` + `-sheet-v1.jpg`, v1 audio data in `audio-anim/v1/`.
| Check | Result |
|---|---|
| `--check` | `180-RULE OK`; `sakuga_demo` still OK |
| Duration | 94.04 s (ffprobe preview 94.037) - above the 70-85 s rule by user request (slower tempo) |
| Shots | 56 (PASS 50-56) |
| Loudness | -14.2 LUFS |
| Audio | narrator +12% (v1 +40%), gaps 0.32-0.34 s, drums 125 BPM, cues re-placed from new words; low drum pulse + riser under last section, hard cut at 89.6 s then whisper 90.0 s; hook narration-free until 4.4 s |
| Intro/VS timing | Apep intro 4.4-10.6, Thor 12.3-18.9, emerge 18.95, VS 19.0, story 20.24; captions cut before each emerge (captions_dyn `--cut`) PASS |
Milestones (frames viewed): hook squeeze with Thor face + hammer visible PASS; Duat intro with coils filling the river PASS; locks, intros, VS PASS; Thor lands + cart PASS; block PASS; kid runs out PASS (kid hidden in 1v1); terrain + coil arcs rise at "roared" PASS; slash/pillar/orbs/beam/beam-clash PASS; slow-mo + crash on the eye PASS; hiding spot PASS; serpent shadow + eye PASS.
Fixes: C1 totality brighter (sky/ground dark caps 0.5/0.24, tint 0.1, bigger corona/rays; sun moved right of Apep's head so it is visible) PASS; C2 kid moved right/behind (x 1560-1620, z behind Thor) PASS; C3 captions clear of card labels PASS; C4 shadow black + warm light patch + caption on top PASS, cart bigger and white PASS, fangs: main Apep head strikes onto Thor's shoulder, jaw/fangs touch shoulder, Thor's face partly under the jaw PASS (weak).
Giant Apep: scale 2.8 (Thor ~1/4.5 of reared height), new prop `serpent-coils` (far/mid/near arcs, scale bands, veins, spikes, slither, `rise` track), rig params `len`, `lam`, `rearK`, `coilLift`, `layer 3`, marker `fang`, actor-level `pose` defaults, eclipse params `skyDarkMax/gDarkMax/rayK/coronaR`.
Weak points: coil arcs are uniform "hoops"; Thor tiny in wide shots; beam-clash orb sits mid-frame, not exactly mouth-to-hammer; bite hides Thor's face; length exceeds 85 s.
