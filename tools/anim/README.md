# tools/anim - cutout animation engine (HTML + SVG + Playwright)

Deterministic: `window.renderFrame(t)` redraws the whole scene for time `t` (no requestAnimationFrame, no wall clock).
`render.js` opens `index.html` (1080x1920), loads a timeline JSON, screenshots every frame (4 parallel pages) and encodes with ffmpeg.

    node tools/anim/render.js --timeline tl.json --out out.mp4 [--audio mix.wav] [--scale 1] [--workers 4] [--crf 20] [--keep-frames --dump-dir DIR]
    node tools/anim/render.js --timeline tl.json --dump 1.5,4,7.2 --dump-dir DIR --scale 0.5   # only those frames (PNG) for quick checks
    python3 tools/anim/sheet.py DIR sheet.jpg 6                                                  # contact sheet of a frame dir

Speed (4 cores, scale 1, JPEG q93): ~90 ms/frame wall => 100 s episode (3000 f) ~ 4.5-5 min + ~1 min encode. `--scale 0.5` ~70 ms/frame.
Reference timeline (official format, docs/07): `tools/anim/demo/sakuga_demo.js` -> `sakuga_demo.json` -> `demo/sakuga-demo.mp4` (26 s, silent).

**Rules (docs/07):** every official episode is rendered with this engine. No still images / Ken Burns, no HP bars, no ROUND cards. Monster always screen-LEFT, guardian screen-RIGHT (`sides`, `--check` must print `180-RULE OK`).

## Files
core.js (svg/joint/easing/keyframes) | rigs.js (rigs + action library) | stage.js (arena, camera, shots, fx, split-roll, text, timeline eval) | **sakuga.js** (energy fx, domains, rising terrain, aura/rim, letterbox, embers) | timeline_words.js (map cues to words.json) | render.js | captions_dyn.py | sheet.py

## Timeline JSON (all times in seconds, wall clock)
    { fps, duration, camInit:{cx,cy,zoom},
      actors:{ name:{kind:'grim'|'vry'|'kid', x,y (feet), scale, flip(1=faces right,-1=left), z} },
      cues:[{actor, action, t0, t1, params}],
      cam:[{t0,t1,cx,cy,zoom,ease}], shake:[{t0,dur,amp}], flash:[{t0,dur,amp,color}], freeze:[{t0,dur}],
      fx:[{type:'dust'|'soil'|'impact'|'speed', t0,x,y,dur,n,r,spread,seed}],
      text:[{t0,t1,text,x,y,size,color,shadow,anim:'slam'|'fade'}],
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
- `text:[{..., bg:{fill,stroke,..}, glow, shadow, anim:'slam'|'pop'|'blink'|'fade'}]`, multi-line with `\n`; `tints:[{t0,t1,a,color}]`, `black:[[t0,t1,alpha]]`, `glitch:[[t0,t1]]`.
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
- **HUD removed from the engine** (docs/07): a `hud` key in an old timeline is ignored. No ROUND text.
- Cerberus: `mane` (snake mane) / `serp` (serpent-tail head: jaw + forked tongue) params; actions `snake-hiss`, `tail-strike`, `tail-coil`, `venom-drool`; marker `tailtip`.
- BEC: `hypno-chant` (throat rattle, pair with `fx ripple` sound rings), `no-blink-stare`, `claw-planks` (marker `handR`), `dissolve-smoke`. Kid: `hand-drift`, `snap-awake`, `shake-head`.
- Props: `oillamp` (track `lamp`, `lampFlick`), `latch` (track `latch`), `aconite` (grass withers with track `wilt`, purple flowers with `bloom`), `scratch` (gouges on planks, track `scratch`); fx `drool`, `notes`.
- Shot `povgate`: looking up out of the burning gate (dog heads loom, serpent tail dangles, a grey face sinks into black smoke). Actor cue param `sil:[a,b]` silhouettes a rig (for the red-backlit bite).
- Actor `scenes:['cabin',...]` limits an actor to scenes; `clipRect:[x,y,w,h]` clips an actor to a window.

## Sakuga Cinematic (sakuga.js, docs/07 sections 2, 4, 5)
Energy fx (in `fx:[]`, world coordinates, follow the camera and the 180-degree mirror; `dur` gets a sensible default):
- `{type:'beam', t0, x,y, x2,y2, w=70, color, charge=0.35, grow=0.14, hit=true, r}`: charge orb + converging streaks -> halo / body / vibrating white core / 3 lightning strands wrapped along it -> burst at the target.
- `{type:'beam-clash', t0, dur=2.4, x,y (left origin), x2,y2 (right origin), colorL, colorR, w, amp=0.09, freq=4.5, win:'L'|'R', winAt}`: two beams meet, the clash orb pushes back and forth with sparks and shock rings; `win` drives it into the loser and explodes there.
- `{type:'orbs', t0, x,y, x2,y2, n=5, stagger=0.12, fly=0.55, arc=260, r=26, color}`: homing orbs on alternating arcs with comet trails, small burst on each hit.
- `{type:'slash', t0, x,y, x2,y2, r=230, fly=0.32, color, flipV, hit}`: crescent energy blade with afterimages.
- `{type:'pillar', t0, x,y (ground), w=180, h=1700, color, dur=0.75}`: column of light erupting skyward + ground ring + motes. In intros keep it ~0.75 s so faces stay clear.
- `{type:'glint', t0, actor, at:'eye', color, r=90, dur=0.5}`: lens-flare star locked on a rig marker.

Domains (territories + the single battlefield): `domains:{ key:{ sky:[top,bottom], glow, floor:[top,bottom], motif:'monoliths'|'spires'|'columns'|'runes'|'none', rock, sigil:color|null, motes, mist, horizon=900 } }`, used as scene `domain-<key>` (shot `scene:'domain-mon'`). Layers: gradient sky, glow, motif silhouettes, floor, rotating ground sigil, mist, rising motes.

Rising terrain on the battlefield (no backdrop swap mid-fight): prop `{type:'monolith'|'spire', x,y, scale, h, w, tilt, color (crack glow), rock, track:'rise', scene}`; track 0..1 raises it out of the ground with shake + dust.

Actors: `aura:{colors:[outer..inner], r=230, h=190, motes:true, on=1}` (layered glow + flame silhouette + rising motes behind the rig; cue param `aura:[a,b]` scales it), `rim:'#color', rimPx=7` (drop-shadow rim light). Hide THE KID during the 1v1 with actor `vis` windows.

Screen overlays: `cinema:[[t0,t1]]` (150 px letterbox bars, slide in/out 0.25 s), `embers:[[t0,t1,color]]` (floating ember particles). Hook rewind = `glitch:[[t0,t1]]` + flash.

Split-roll extensions (per instance in `splits:[]`): half `spin: cards/s` (keeps rolling, silhouettes), half `locked:true` (already locked when this instance starts: no flash, name shown), instance `dive:{t0,t1,side:'L'|'R',k=9}` (zoom THROUGH the card into its territory, whiteout at the end) and `emerge:{t0,t1,side}` (reverse, back out of the card). Intro flow = 3 instances: [spin both -> lock L -> dive L] · [emerge L (L locked) -> lock R -> dive R] · [emerge R (both locked) -> VS -> shatter]. See `demo/sakuga_demo.js`.

## Known limits
Fx are simple (no real particles beyond dust/soil/impact/speed lines). Silhouette/split-roll decoys are 7 generic shapes. Grim is very dark on dark ground (rim light is weak). Kid poses hide/cower are rough. Freeze skips actor time (see above).

## Episode #003 additions (apep-vs-thor)
- **apep** rig (`kind:'apep'`, faces +x, origin = sand point where the neck rises; 17-joint spine, Catmull-Rom resampled). Pose params: `rear` (0..1 head height), `reach` (px), `headRot`, `hs`, `waveA/waveP` (slither), `tailUp/tailSwing`, `sway`, `tlen` (tail length), `jaw`, `unhinge`, `tongue`, `eyeGlow`, `hypno` (eye spiral), `hood`, `sink` (0..1, translates 900 px down: give the cue `clipY`=ground y), `hurt`, `girth`, `bulge/bulgeAmp` (swallowed lump), `coil` (0..1) + `wrapX/wrapY/wrapR/wrapH/turns/squeeze` (helix around a point, local Apep px), `layer` (0 all, 1 back arcs only, 2 front arcs + head: use two actors, z below/above the victim, for the squeeze). Actions: idle idle-card rise-from-sand strike(`reach`,`rear2`) coil-squeeze(`wrapX,wrapR,wrapH,turns,layer`) hypno-gaze roar swallow recoil hurt sink talk. Markers: eye head mouth tail body. `cu`/`reaction` on apep follow the `head` marker.
- **thor** rig (`kind:'thor'`, faces +x, flip -1 on the right). Params: `aL/aR` [upper,fore] angles (180 = up; hammer extends along forearm), `lF/lB` leg [thigh,shin], `hammer` (0..1 visible), `hAng`, `hglow`, `crackle`, `belt` (rune glow, >1 = white), `eyeGlow`, `mouth`, `brow`, `beard`, `hair`, `cloak`, `trail`, `lift`, `venom`. Actions: idle land-hero walk run throw-hammer catch-hammer swing lightning-call belt-power block strangled stagger-venom kneel recoil talk. Markers: eye head mouth hand hammer body.
- Split roll: silhouettes `apep` / `thor`; for locked cards use apep `idle:'idle-card'`, fscale ~0.4, fx 10, fy 255; thor fscale 0.5, fy 270.
- Domain motif `ruins` (dunes, broken columns, obelisk, toppled pharaoh head; colours `rock`, `sand:[3]`) and per-domain `eclipse:{x,y,r,track,dir,sun,moon,corona,dark}` (track 0..1 = none..total: moon slides over the sun, sky darkens, corona + rays at totality).
- Sheet: `node episodes/apep-vs-thor/anim/make_rigs_sheet.js`.

## Episode #003 v2 additions (giant monster, medium tempo)
- **`serpent-coils` prop** (sakuga.js): giant body arcs rising out of the ground and diving back in (dune ridges made of scales). `{type:'serpent-coils', x,y,scale,z,scene, track:'rise', body,body2,sheen,vein,sand,haze, sp, arcs:[{x0,x1,y,h,w,d (0 near..1 far, hazed),ph,delay,lean}]}`. Use far / mid / near sets (near set with high z passes in front of the actors). Reusable for any colossal serpent / tentacle monster.
- **`shape` prop** (sakuga.js): generic vector prop for one-off objects (tent, altar, ox head, flashlight, hollow, thunder cart, serpent shadow, eye under sand). `shapes:[{k:'poly'|'ell'|'glow',…, track, txTrack/tyTrack, syTrack+pivot, flick}]`, optional `attach:{actor,marker,track}` to follow a rig marker.
- **apep** v2 params: `len` (body length factor), `lam` (wave length), `rearK` (rear height factor), `coilLift` (raise head above the last coil in a squeeze so the victim's face stays visible), `layer` 3, marker `fang`.
- **Actor-level `pose:{}`** defaults (merged under every action) and **cue `pose:{}`** overrides (e.g. boost Thor `eyeGlow`, add `venom`).
- **`captions_dyn.py --cut t1,t2`**: captions spanning those times end there (keep split-roll card labels clear at each `emerge`).
- Timeline tip (`episodes/apep-vs-thor/anim/make_timeline.js`): the helper `M(t)` remaps v1 seconds to v2 audio; times taken from `sections.json` / `words.json` are already current, so wrap those shots in `RAW = true … RAW = false`.
- Scale guide for colossal monsters: apep scale ~2.8 with thor scale 0.8 (Thor ≈ 1/4.5 of Apep's reared height); establishing shots zoom ~0.55–0.62, low angles `ground 0.84`.

