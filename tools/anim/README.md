# tools/anim - cutout animation engine (HTML + SVG + Playwright)

Deterministic: `window.renderFrame(t)` redraws the whole scene for time `t` (no requestAnimationFrame, no wall clock).
`render.js` opens `index.html` (1080x1920), loads a timeline JSON, screenshots every frame (4 parallel pages) and encodes with ffmpeg.

    node tools/anim/render.js --timeline tl.json --out out.mp4 [--audio mix.wav] [--scale 1] [--workers 4] [--crf 20] [--keep-frames --dump-dir DIR]
    node tools/anim/render.js --timeline tl.json --dump 1.5,4,7.2 --dump-dir DIR --scale 0.5   # only those frames (PNG) for quick checks
    python3 tools/anim/sheet.py DIR sheet.jpg 6                                                  # contact sheet of a frame dir

Speed (4 cores, scale 1, JPEG q93): ~90 ms/frame wall => 100 s episode (3000 f) ~ 4.5-5 min + ~1 min encode. `--scale 0.5` ~70 ms/frame.
Example: `episodes/vrykolakas-vs-church-grim/anim-test/make_timeline.js` (writes timeline.json) -> 15 s test.

## Files
core.js (svg/joint/easing/keyframes) | rigs.js (Grim, Vrykolakas, Kid rigs + action library) | stage.js (arena, camera, fx, split-roll, text, HUD, timeline eval) | timeline_words.js (map cues to words.json) | render.js | sheet.py

## Timeline JSON (all times in seconds, wall clock)
    { fps, duration, camInit:{cx,cy,zoom},
      actors:{ name:{kind:'grim'|'vry'|'kid', x,y (feet), scale, flip(1=faces right,-1=left), z} },
      cues:[{actor, action, t0, t1, params}],
      cam:[{t0,t1,cx,cy,zoom,ease}], shake:[{t0,dur,amp}], flash:[{t0,dur,amp,color}], freeze:[{t0,dur}],
      fx:[{type:'dust'|'soil'|'impact'|'speed', t0,x,y,dur,n,r,spread,seed}],
      text:[{t0,t1,text,x,y,size,color,shadow,anim:'slam'|'fade'}],
      hud:{t0,t1,leftLabel,rightLabel,left:[{t0,t1,v}],right:[...],leftInit,rightInit},   // 2 bars: monster/guardian, v=0..1
      split:{end,shatter, left:{kind,lockT,N,tagText,label,fx,fy,fscale,idle}, right:{...}} }   // optional slot-roll intro
- An actor shows the pose of its latest cue (t0 <= t), held after t1; cue params: `x:[a,b]`, `y:[a,b]` (tweened over t0..t1, persist after), `arc` (parabola height on y), `ease`, `flip`, `scale`, `alpha:[a,b]`, `clipY` (clip below world y, for rising from soil), `blend` (crossfade s from previous pose, default .18), plus action params (`speed` for walk/run).
- `freeze`: actors hold their pose during the freeze, then continue at wall time (pose jumps by dur; hide it with a flash/shake). Camera/fx/text keep running.
- World: 1080x1920, horizon y=880, feet y~1080; camera center (cx,cy)+zoom; parallax layers.
- Cues from words: `cueOnWord(words,'bites',{actor,action,len,lead})` in timeline_words.js.

## Actions
- grim: idle walk run growl crouch lunge jump land bite blocked howl drag recoil fade(=idle; use alpha) 
- vry (Vrykolakas): idle rise(use clipY) walk claw-swipe grin grab-throw stagger choke fall twitch recoil
- kid (background character, no card/HP bar): idle-scared walk(flashlight) run hide(crouch + peek) cower look-up sleep wake. No bed/tombstone prop is drawn: hide = crouch (use clipY + a tombstone in front, or place in a scene prop); sleep = lying pose, add a bed prop in the scene.
Action = `fn({t,lt,dur,u,p}) -> partial pose`; add new ones in rigs.js (`ACTIONS.grim.myAction = ...`). Pose params: Grim bodyY/bodyRot/head/jaw/hackle/tail1/tail2/ear/FN,FF,RN,RF [thigh,shin]/eye/glow/brow/shake; Vry bodyRot/head/open/grin/aL,aR [upper,fore]/lL,lR/flap/wide/rage/sink/trail/grip; Kid bodyRot/head/aL/aR/lL/lR/lookX/lookY/wide/mouth/beam/sleep.

## v2 additions (full-episode build)
- `scenes:[{t0,s}]` s = forest | grave | room (bedroom: bed, blanket, moon window, wooden door; `knocks:[t]` shakes the door) | church (buried-dog cut-away, track `dogEye`) | void.
- `tracks:{name:[{t0,t1,v,ease}]}` numeric tweens used by scene/props: `dawn` (orange sky, tower, bells), `bells`, `ring` (red ground aura following an actor), `limit` (red wall line), `inscr` (tomb inscription glow), `grave` (fills the open grave), `soil` (mound wobble), `blanket*`, `dogEye`.
- `props:[{type:'tomb'|'garlic'|'ring'|'limit', x,y,scale,z,scene,vis,follow,track}]` (z sorts with actors; tomb = hiding place for the kid).
- actor `vis:[[t0,t1],...]` visibility windows; cue params `z`, `rot:[a,b]` (spin about the body), `flip`.
- `splits:[{t0,shatter,end,left,right,fadeIn,opaque}]` (several slot-roll instances). Left column = MONSTER (blood drips, claw marks, red), right = GUARDIAN (gold halo, rays, rising sparks); titles on top; 17 named silhouettes (Koschei, Chupacabra, Jersey Devil, Draugr, Baba Yaga, Kelpie, Headless Horseman, Black-Eyed Child, Strigoi | Cerberus, Talos, Griffin, Garmr, Domovoi, Brownie, Matagot, Tomte). Lock: monster = blood splat, guardian = holy flash.
- `text:[{..., bg:{fill,stroke,..}, glow, shadow, anim:'slam'|'pop'|'blink'|'fade'}]`, multi-line with `\n`; `tints:[{t0,t1,a,color}]`, `black:[[t0,t1,alpha]]`, `glitch:[[t0,t1]]`, `hud:{vis,leftInit,rightInit,left:[..],right:[..],blinkL,blinkR}`.
- fx types: dust powder smoke soil sparks ripple impact speed.
- extra actions: grim shake-fur sit down weak dangle bite-shake crawl paw-line stalk dig bristle alert stand-up | vry circle fall-back pinned crawl-back stand-up neck-grab slash-down victory lunge-at cover-face kneel-cough disgust hand dead | kid hide(behind tomb) peek cower(hug knees) gasp scared-back chase lost bed-wake.
- `peek.sh TIMELINE out.jpg t1,t2,...` = quick low-res contact sheet of chosen times.

## v3: SHOT SYSTEM (cinematic cuts) - `shots:[{t, type, ...}]` (hard cut at t, shot lasts until the next shot; no `shots` = legacy `cam` tracks)
Common params: `scene` (switch scene at the cut), `push` (total zoom factor over the shot), `pan:[dx,dy]`, `dutch`/`dutchTo` (frame roll, deg), `hand` (handheld amplitude), `slow` (actor time-scale for the whole shot, e.g. 0.4; actors catch up smoothly afterwards; sound unaffected), `whip` (s: whip-pan blur+slide at the start, `whipDir` +-1), `rack:{bg,fg}` (blur px of background / foreground), `crash:{at,dur,k}` (crash-zoom: zoom x k at time `at`, with radial speed lines), `cx,cy,zoom`.
- `wide` / `establish` {cx,cy,zoom}  - `insert` {cx,cy,zoom} close-up on a prop (garlic, tomb, door, hole: pass its x,y)
- `versus` {a,b,dx,cy,zoom|maxZoom,margin} - side-on fighting-game framing of two actors (follows their midpoint)
- `cu` / `reaction` {actor, fill=0.6 (head width / frame), dx,dy} - close-up on the head (kid = REACTION-KID)
- `ecu` {actor, at:'eye'|'mouth'|'jaw'|'nose'|'hand'|'claw'|'head', zoom=5} - extreme close-up locked on a rig marker (grim: eye mouth jaw nose head; vry: eye mouth hand claw handL head; kid: eye lens head)
- `low` {actor|x, zoom, ground=0.88 (feet at 88% of frame height), sy=1.12} looming low angle; `high` {actor|x, zoom, sy=0.74, ground} looking down
- `ots` {side:'left'|'right', cx,cy,zoom, rack:{fg,bg}} over-the-shoulder: the kid's blurred hooded back in the lower corner, world in the distance
- `pov` {speed (m/s), sweep (px of flashlight sweep), cone (rad), dark, aimX,aimY, start} first-person kid: forest layers approach in perspective (44+ trees, fog, fireflies), oversized flashlight + hand bottom-right, cone of light with everything else black, step bob / roll / breathing.
- timeline_words.js `cutOnWord(words,'bites',{type:'cu',actor:'grim',lead:0.05})` builds a shot that cuts when the word is spoken. Top-level `slow:[{t0,t1,rate}]` and `freeze` also work outside shots.
- Test: episodes/vrykolakas-vs-church-grim/anim-test/make_cine_timeline.js -> cine-test.mp4 (12 s: POV 4 s, OTS 2 s, LOW 2 s, ECU 1 s, VERSUS + crash-zoom 3 s). Render ~49 ms/frame (blur filters on cut frames only).

## v6 additions (continuity, new kid, Grim talks, window monster)
- **Kid v2** (no hood): messy dark hair that bounces with running, big eyes with highlights, baggy striped pyjamas, red scarf + shoes. New actions `talk` (mouth follows voice amplitude), `wave`, `look-back`; OTS back view shows hair nape + scarf + striped sleeve; POV shows the striped sleeve. Sheet: `tools/anim/kid-v2-sheet.png`.
- **Talk**: `talk` action for grim / vry / kid; cue param `voice:'name'` + top-level `voices:{name:{words:[[s,e],..]}}` (word intervals, e.g. `wordIntervals(words,t0,t1)`) or `{fps,v:[..]}` from `node tools/anim/envelope.js voice.wav out.json`.
- **Bedroom window monster**: tracks `winMon` (rises behind the glass), `winGlow` (hollow eyes), `winBreath` (fog on the pane), `winScratch` (claws drag, scratches drawn), `winLean`; use `insert` shot with `push` for the slow push-in.
- **Transitions** (`tr` on the incoming shot): `{type:'whip',dur,dir}` horizontal blur across the cut; `{type:'dip',dur}` dip to black; `{type:'fade',dur}` crossfade (rendered through `renderFrameAsync`; render.js uses it automatically). **Match-cut**: actor time never resets across cuts (cues are global) and `anchor:{actor,at:'head'|'eye'|'body',sx,sy}` puts a marker at the same screen position across the cut.
- **180 degree rule**: top-level `sides:{left:'vry',right:'grim'}`; VERSUS shots mirror the world if the left actor is on the right; `node tools/anim/render.js --timeline tl.json --check` reports any frame where sides are swapped.
- **Dynamic captions**: `python3 tools/anim/captions_dyn.py captions.ass timeline.json out.ass` moves captions to y=1590 (83 %) in cu/ecu/reaction/low shots (shot param `cap:'low'|'top'|'mid'` overrides).
- **Look**: church cut-away is moonlit with a glowing silver-blue spirit dog; POV forest has volumetric trunks, 2-tone canopies, mist between depth layers, blurred near trees and a warm flashlight glow on the nearest trunks.
- Layout tip: put the tomb/kid at y~940 (further back) so the kid's head clears Grim's back, and keep Grim's nose x at least 60 px from the kid's head.
- Fonts: Oswald / Anton / League Gothic are not in the apt registry; `fonts-bebas-neue` installed (condensed bold caps) -> `make_captions.py --font "Bebas Neue" --size 104`.

## Episode #002 additions (black-eyed-children-vs-cerberus)
- **cerberus** rig (`kind:'cerberus'`, three heads with own jaw/ear/eye): per-head pose arrays `hrot, jaw, eyeO, anger (amber->red), ear, sleepy`. Actions: idle growl lunge bite(`head:0|1|2`) block sleepy(`head:` = head falling asleep, lower indices already asleep; `u` = progress) fight-sleep (last head fights sleep) talk (3 overlapping voices, middle jaw biggest; `voice:`) open-gate wounded fade bite-hold(`head`, `shake`) drag-down(`head`, `speed`; move it with an x track backwards).
- **bec** rig (`kind:'bec'`, `variant:0` grey hoodie + messy light hair, `variant:1` olive coat + black bowl cut): pale child, pure black eyes (no whites), almost motionless. Actions: idle-still knock(`period`) head-tilt(`dir`,`dur`) step hum mimic(voice mouth) point smile enter turn-to-camera shriek dragged(`mouth`) dissolve-smoke (u 0..1 distorts + fades the rig; add `fx smoke {dark:true}` and an `alpha` track).
- **scenes** `cabin` (abandoned wooden cabin: porch, door hinged at left, windows, swinging oil lamp; tracks `door` 0..1, `thresh` glow, `knocks:[t]` shakes the door) and `cabin-in` (interior: planks, moon window, doorway + door leaf, tracks `door`, `gateLeak`; prop `torch` rolls via track `torchX`/`torchBeam`).
- **underworld gate** prop `{type:'gate', x,y,scale,track:'gate', closeAt:t}`: void ellipse, red-orange rings, spirals, embers, smoke; opens with track `gate` 0..1; `closeAt` = close-slam (collapses in 0.22 s + white shock ring; add shake/flash cues yourself).
- bedroom (`room`): track `vent` = flickering red light from a vent + floor cracks; layer `winGlass` is drawn over actors so two BECs placed at the window (x~190/330, y~745, scale .9) stand "behind the glass"; track `winBreath` fogs it.
- split roll already has BEC (`blackeyed`) and CERBERUS silhouettes; both rigs also work as `kind` of a locked card.
- Sheet: `node tools/anim/make_ep002_sheet.js` -> `tools/anim/ep002-rigs-sheet.png`.

## Episode #002 v2 additions (powers, no HUD)
- New format (docs/07): **no HUD bars and no ROUND cards** (omit `hud` and the ROUND `text`); K.O./WINNER stay. The engine still supports `hud` for old episodes.
- Cerberus: `mane` (snake mane) / `serp` (serpent-tail head: jaw + forked tongue) params; actions `snake-hiss`, `tail-strike`, `tail-coil`, `venom-drool`; marker `tailtip`.
- BEC: `hypno-chant` (throat rattle, pair with `fx ripple` sound rings), `no-blink-stare`, `claw-planks` (marker `handR`), `dissolve-smoke`. Kid: `hand-drift`, `snap-awake`, `shake-head`.
- Props: `oillamp` (track `lamp`, `lampFlick`), `latch` (track `latch`), `aconite` (grass withers with track `wilt`, purple flowers with `bloom`), `scratch` (gouges on planks, track `scratch`); fx `drool`, `notes`.
- Shot `povgate`: looking up out of the burning gate (dog heads loom, serpent tail dangles, a grey face sinks into black smoke). Actor cue param `sil:[a,b]` silhouettes a rig (for the red-backlit bite).
- Actor `scenes:['cabin',...]` limits an actor to scenes; `clipRect:[x,y,w,h]` clips an actor to a window.

## Known limits
Fx are simple (no real particles beyond dust/soil/impact/speed lines). Silhouette/split-roll decoys are 7 generic shapes. Grim is very dark on dark ground (rim light is weak). Kid poses hide/cower are rough. Freeze skips actor time (see above).
