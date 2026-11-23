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

## Known limits
Fx are simple (no real particles beyond dust/soil/impact/speed lines). Silhouette/split-roll decoys are 7 generic shapes. Grim is very dark on dark ground (rim light is weak). Kid poses hide/cower are rough. Freeze skips actor time (see above).
