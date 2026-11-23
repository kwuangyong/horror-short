// Builds timeline.json for the full animated episode from audio-anim/words.json (cues keyed to spoken words).
const fs = require('fs'), path = require('path');
const { wordTime } = require('../../../tools/anim/timeline_words');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/words.json'), 'utf8'));
const T = (w, n = 1, edge) => wordTime(words, w, n, edge);
const END = 102.73;
// ---- world layout (x): hole 130 | Vry stops ~260 | Grim lands 800 | tomb+kid 1010 | garlic 1065 | red limit line 1160 | outside > 1160
const HOLE = 130, TOMB = 1010, GARLIC = 1112, LIM = 1160, WALL_TOP = 865;
const tl = { fps: 30, duration: END, holeX: HOLE, camInit: { cx: 1120, cy: 930, zoom: 1.2 }, tracks: {}, cues: [], cam: [], shake: [], flash: [], fx: [], text: [], props: [], scenes: [], black: [], tints: [], glitch: [], knocks: [97.33], freeze: [] };
const A = (actor, action, t0, t1, params) => tl.cues.push({ actor, action, t0, t1, params: params || {} });
const C = (t0, t1, cx, cy, zoom, ease) => tl.cam.push({ t0, t1, cx, cy, zoom, ease: ease || 'inOut' });
const TR = (name, t0, t1, v, ease) => { (tl.tracks[name] = tl.tracks[name] || []).push({ t0, t1, v, ease }); };
const SH = (t0, dur, amp, hold) => tl.shake.push({ t0, dur, amp, hold });
const FL = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp: amp === undefined ? 1 : amp, color });
const FX = (type, t0, x, y, o) => tl.fx.push(Object.assign({ type, t0, x, y, dur: 1 }, o || {}));
const TX = (t0, t1, text, x, y, size, o) => tl.text.push(Object.assign({ t0, t1, text, x, y, size, color: '#f2f0ea', anim: 'fade' }, o || {}));
const CARD = { fill: '#14182e', stroke: '#c4121f', sw: 6, rx: 18, px: 48, py: 22 };
const SC = (t0, s) => tl.scenes.push({ t0, s });

tl.actors = {
  kid: { kind: 'kid', x: 1010, y: 1000, scale: 0.72, flip: 1, z: 0, vis: [[0, 3.4], [17.39, 98.13]] },
  vry: { kind: 'vry', x: 1250, y: 1080, scale: 0.86, flip: -1, z: 2, vis: [[0, 3.4], [23.3, 66.8], [69.3, 87.9], [99.85, 100.95]] },
  grim: { kind: 'grim', x: 1520, y: 1080, scale: 0.84, flip: -1, z: 3, vis: [[0, 3.4], [27.2, 66.8], [69.3, 75.3], [78.3, 92.6], [100.2, END]] },
};
tl.props = [
  { type: 'tomb', x: TOMB, y: 1000, scale: 0.8, z: 1, scene: 'grave' },
  { type: 'garlic', x: GARLIC, y: 1012, scale: 0.8, z: 1.2, scene: 'grave' },
  { type: 'ring', follow: 'grim', y: 1088, z: 1.9, scene: 'grave', track: 'ring' },
  { type: 'limit', x: LIM, y: 1090, z: 0.4, scene: 'grave', track: 'limit' },
];

// ============================================================ 0 HOOK (0-3.4): freeze of the end of round 2, then rewind + cut
SC(0, 'grave');
A('vry', 'walk', 0, 3.4, { speed: 0.04, x: [1250, 1250], y: [1080, 1080], flip: -1 });
A('grim', 'down', 0, 3.4, { x: [1520, 1520], y: [1080, 1080], flip: -1 });
A('kid', 'peek', 0, 3.4, { x: [TOMB, TOMB], y: [1000, 1000], scale: 0.72, flip: 1 });
C(0, 3.4, 1130, 930, 1.3, 'lin'); tl.camInit = { cx: 1110, cy: 930, zoom: 1.2 };
tl.tints.push({ t0: 0, t1: 3.4, a: 0.28, color: '#c4121f', fadeIn: 0.1, fadeOut: 0.3 });
SH(0, 3.2, 5, true);
TX(T('Who'), 3.4, 'WHO SURVIVES?', 540, 520, 118, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.1 });
tl.glitch.push([2.85, 3.4]); FL(2.85, 0.1, 0.5);
SC(3.4, 'void'); tl.black.push([3.4, 5.2, 1]);
// ============================================================ 1 SPLIT ROLL (5.25-16.2)
tl.splits = [{
  t0: 5.25, shatter: 15.3, end: 16.3,
  left: { kind: 'vry', lockT: T('Vrykolakas'), N: 20, label: 'VRYKOLAKAS', subLabel: 'THE GREEK REVENANT', fx: 0, fy: 262, fscale: 0.86, idle: 'idle' },
  right: { kind: 'grim', lockT: T('Grim'), N: 34, label: 'CHURCH GRIM', subLabel: 'GRAVEYARD GUARDIAN', fx: -34, fy: 215, fscale: 0.56, idle: 'shake-fur' },
}, { t0: 101.35, shatter: 150, end: END, opaque: false, fadeIn: 0.25,
  left: { kind: null, lockT: 400, N: 60, label: '' }, right: { kind: null, lockT: 400, N: 60, label: '' } }];
SH(T('Vrykolakas'), 0.5, 20); SH(T('Grim'), 0.5, 20);
SC(15.2, 'forest');
C(15.2, 17.39, 560, 930, 1.0);
FX('sparks', 15.3, 270, 760, { dur: 1.7, n: 30, color: '#ff4a56', seed: 3 }); FX('sparks', 15.3, 810, 760, { dur: 1.7, n: 30, color: '#ffe39a', seed: 4 });
FL(15.3, 0.25, 0.8); SH(15.3, 0.6, 14);
const VS = T('Comment', 1, 'end') - 0.45;   // VS lands right after "Comment"
TX(15.99, 17.4, 'VS', 540, 800, 380, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6, fadeOut: 0.3 });
TX(16.25, 17.4, 'WHO WINS?  COMMENT', 540, 1010, 70, { anim: 'blink', color: '#ff7a84', shadow: '#000', shadowDx: 4, shadowDy: 5, fadeOut: 0.2 });
FL(15.99, 0.2, 0.9); SH(15.99, 0.5, 26);
// ============================================================ 2 KID + ARENA + RULES (17.39-38.78)
// forest: kid chases fireflies
A('kid', 'chase', 17.39, 19.0, { x: [80, 520], y: [1040, 1040], scale: 0.9, flip: 1, speed: 1.5, ease: 'lin' });
A('kid', 'lost', 19.0, 19.87, { x: [520, 520] });
C(17.39, 17.4, 140, 940, 1.5); C(17.4, 19.0, 500, 940, 1.5, 'lin'); C(19.0, 19.87, 540, 940, 1.5);
// graveyard: kid walks in through the wall gap, pan across wall/graves
SC(19.87, 'grave');
A('kid', 'walk', 19.87, 21.0, { x: [-40, 330], y: [1040, 1040], scale: 0.72, flip: 1, speed: 1.2, ease: 'lin' });
C(19.87, 21.6, 640, 930, 1.0);
A('kid', 'look-up', 21.0, 21.62, { x: [330, 330] });
A('kid', 'scared-back', T('shakes') + 0.1, 22.9, { x: [330, 280], ease: 'out' }); A('kid', 'idle-scared', 22.9, 25.9, { x: [280, 280] });
SH(T('shakes') - 0.2, 1.9, 16, true);
FX('dust', 21.8, HOLE, 1090, { dur: 1.2, n: 12 }); FX('dust', 22.5, HOLE + 40, 1090, { dur: 1.2, n: 10, seed: 2 });
// Vrykolakas rises
A('vry', 'rise', 23.4, 25.55, { x: [HOLE, HOLE], y: [1080, 1080], clipY: 1090, flip: 1 });
FX('soil', 23.5, HOLE, 1085, { dur: 1.4, n: 22 }); FX('soil', 24.3, HOLE + 20, 1085, { dur: 1.4, n: 16, seed: 2 }); FX('dust', 23.6, HOLE, 1092, { dur: 1.2, n: 12 }); FX('dust', 25.3, HOLE, 1095, { dur: 1.1, n: 10, seed: 2 });
SH(23.4, 2.2, 10, true);
C(21.62, 22.6, 270, 940, 1.35); C(22.6, 23.5, 200, 940, 1.5); C(23.5, 25.6, 200, 930, 1.5);
// walks toward the kid; kid drops light, runs for the tomb
A('vry', 'walk', 25.62, 27.7, { x: [HOLE, 255], speed: 0.8, flip: 1 }); A('vry', 'grin', 27.7, 29.4, { x: [255, 255] });
C(25.6, 27.4, 520, 930, 1.05);
A('kid', 'scared-back', 25.9, 26.4, { x: [280, 330] });
A('kid', 'run', 26.4, 29.0, { x: [330, TOMB - 8], y: [1040, 1006], scale: [0.72, 0.72], speed: 2.4, ease: 'inOut' });
// Grim appears: leaps off the wall, lands between
A('grim', 'crouch', 27.2, T('Then') + 0.0, { x: [1150, 1150], y: [WALL_TOP, WALL_TOP], flip: -1 });
const J0 = T('appears') - 0.55;
A('grim', 'jump', J0, J0 + 0.95, { x: [1150, 800], y: [WALL_TOP, 1080], arc: 170, ease: 'lin', flip: -1 });
A('grim', 'land', J0 + 0.95, J0 + 1.5, {}); A('grim', 'growl', T('Between') - 0.15, 31.6, {});
C(27.4, 28.4, 800, 930, 1.1); C(28.4, 29.5, 760, 930, 1.35);
SH(J0 + 0.95, 0.5, 20); FX('dust', J0 + 0.95, 800, 1092, { dur: 1.1, n: 16, spread: 560 }); FL(J0 + 0.95, 0.2, 0.6);
TR('ring', J0 + 0.9, J0 + 1.4, 1, 'out');
C(29.5, 31.6, 740, 920, 1.55);
A('kid', 'hide', 29.2, 38.7, { x: [TOMB, TOMB], y: [1000, 1000], scale: 0.72 });
// garlic weakens it (rule card)
const G0 = T('Garlic') - 0.1;
C(31.6, 31.75, GARLIC, 960, 2.4, 'out');
tl.props.push({ type: 'garlic', x: GARLIC, y: 1012, scale: 1.0, z: 1.2, scene: 'grave' }); tl.props.pop();
TX(T('Garlic'), 34.0, 'GARLIC WEAKENS IT', 540, 330, 84, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
C(32.55, 32.7, 260, 840, 1.8, 'out');
A('vry', 'disgust', 32.45, 33.4, { x: [255, 255] });
// only fire ends it
C(33.35, 33.55, TOMB, 930, 2.0, 'out'); TR('inscr', T('Only'), T('Only') + 0.7, 1, 'out'); TR('inscr', 38.0, 38.6, 0);
TX(T('fire') + 0.1, 35.3, 'ONLY FIRE ENDS IT', 540, 330, 76, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 46, py: 22 }, glow: true, fadeOut: 0.3 });
A('vry', 'grin', 33.4, 35.4, { x: [255, 255] });
// Grim guards inside the wall, stops at the line
A('grim', 'walk', T('Grim', 3), 36.9, { x: [520, LIM - 321 - 8], flip: 1, speed: 0.9, ease: 'lin' }); A('grim', 'paw-line', 36.9, 38.78, { x: [LIM - 329, LIM - 329], flip: 1 });
C(35.34, 35.5, 700, 930, 1.35, 'out'); C(35.5, 37.2, 980, 930, 1.4); C(37.2, 38.78, 930, 930, 1.35);
TR('limit', 36.5, 37.1, 1, 'out'); TR('limit', 46.0, 46.1, 0);
TX(T('Only', 2), 38.7, 'THE LIMIT:\nINSIDE THE WALL ONLY', 540, 330, 58, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ff4a56', sw: 5, rx: 14, px: 40, py: 20 }, fadeOut: 0.25 });
// ============================================================ 3 ROUND 1 (38.78-46.19)
TX(38.78, 40.1, 'ROUND 1', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
A('vry', 'circle', 38.78, 40.55, { x: [255, 330], flip: 1 });
A('grim', 'stalk', 38.78, 40.19, { x: [LIM - 329, 790], flip: -1, speed: 0.6 });
A('kid', 'cower', 38.8, 42.9, { x: [TOMB, TOMB] });
C(38.78, 40.0, 620, 930, 1.15); C(40.0, 40.3, 560, 930, 1.45);
// lunges onto the Vrykolakas, jaws on throat
A('grim', 'lunge', 40.19, 40.95, { x: [790, 350], flip: -1, ease: 'in' });
A('vry', 'fall-back', 40.6, 41.3, { x: [330, 330], flip: 1 });
FX('impact', 40.8, 330, 900, { dur: 0.5, r: 110 }); FL(40.8, 0.1, 0.7); SH(40.8, 0.4, 22);
A('grim', 'bite-shake', 41.45, 43.7, { x: [350, 335], flip: -1 }); A('vry', 'pinned', 41.3, 44.0, { x: [330, 330], flip: 1 });
C(40.3, 41.6, 360, 960, 1.6); C(41.6, 43.6, 330, 980, 1.75);
FL(T('Jaws'), 0.12, 0.8); SH(T('Jaws'), 1.4, 20, true); FX('impact', T('throat') - 0.2, 150, 1000, { dur: 0.45, r: 90 });
tl.hudL = [{ t0: 41.8, t1: 42.6, v: 0.55 }, { t0: 71.4, t1: 72.2, v: 0.30 }, { t0: 80.4, t1: 81.0, v: 0.10 }, { t0: 82.7, t1: 82.9, v: 0 }];
A('kid', 'peek', 42.9, 44.2, { x: [TOMB, TOMB] }); A('kid', 'hide', 44.2, 46.0, { x: [TOMB, TOMB] });
// claws rake Grim's side, Grim backs off, Vrykolakas crawls away
A('grim', 'recoil', 43.95, 44.8, { x: [335, 430], flip: -1 }); FX('impact', 44.25, 440, 960, { dur: 0.4, r: 80 }); FL(44.25, 0.08, 0.5); SH(44.25, 0.3, 12);
A('vry', 'crawl-back', 44.8, 46.19, { x: [330, 190], flip: 1 });
A('grim', 'growl', 44.8, 46.19, { x: [430, 430], flip: -1 });
C(43.6, 44.8, 380, 940, 1.55); C(44.8, 46.19, 330, 920, 1.3);
// ============================================================ 4 ROUND 2 (46.19-61.12)
TX(46.19, 47.5, 'ROUND 2', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
A('vry', 'stand-up', 46.19, 47.6, { x: [190, 190], flip: 1 });
A('grim', 'stalk', 46.3, 47.64, { x: [430, 490], flip: -1, speed: 0.5 });
A('vry', 'walk', 47.6, 47.9, { x: [190, 205], speed: 0.8, flip: 1 });
C(46.19, 47.6, 340, 930, 1.2); C(47.6, 48.9, 470, 920, 1.4);
A('vry', 'neck-grab', 47.9, 49.8, { x: [205, 205], flip: 1 });
A('grim', 'stalk', 47.64, 48.6, { x: [490, 505], flip: -1, speed: 0.5 });
A('grim', 'dangle', 48.6, 50.0, { x: [505, 505], y: [1080, 970], flip: -1, ease: 'out' });
SH(T('neck') - 0.1, 1.1, 8, true);
C(48.9, 49.8, 470, 880, 1.5);
// hurled over the wall
const TH = T('hurls') + 0.05;
A('vry', 'grab-throw', 49.85, 50.8, { x: [205, 205], flip: 1 });
A('grim', 'jump', TH, T('over') + 1.0, { x: [505, 1520], y: [970, 1080], arc: 420, rot: [0, -600], ease: 'lin', flip: -1, blend: 0.05 });
A('grim', 'weak', T('over') + 1.0, 52.65, { x: [1520, 1520], y: [1080, 1080], rot: [0, 0], flip: -1 });
C(49.8, 50.35, 540, 900, 1.2, 'in'); C(50.35, 51.7, 1250, 930, 1.15, 'inOut'); C(51.7, 54.0, 1330, 930, 1.5);
const LAND = T('over') + 1.0;
SH(LAND, 0.6, 24); FX('dust', LAND, 1520, 1092, { dur: 1.2, n: 16, spread: 560 }); FL(LAND, 0.12, 0.5);
tl.hudR = [{ t0: 44.0, t1: 44.6, v: 0.9 }, { t0: LAND, t1: LAND + 0.4, v: 0.6 }, { t0: 54.1, t1: 55.3, v: 0.35 }];
TR('ring', LAND + 0.1, LAND + 1.4, 0, 'in');
A('grim', 'blocked', 52.65, 54.05, { x: [1490, 1481], flip: -1 });
TR('limit', 52.3, 52.4, 1);
A('vry', 'lunge-at', 51.0, 54.0, { x: [205, 1380], flip: 1, ease: 'lin' });
C(54.0, 55.6, 1450, 930, 1.5);
A('vry', 'slash-down', 54.0, 55.65, { x: [1380, 1380], flip: 1 });
A('grim', 'down', 54.05, 57.6, { x: [1481, 1481], flip: -1 });
for (const tt of [54.3, 54.76, 55.22]) { FL(tt, 0.1, 0.45); SH(tt, 0.25, 10); FX('impact', tt, 1520, 980, { dur: 0.35, r: 70, seed: Math.round(tt) }); }
A('vry', 'victory', 55.65, 57.25, { x: [1380, 1380], flip: 1 });
// it turns to the kid
A('vry', 'walk', 57.3, 61.12, { x: [1380, 1180], speed: 0.55, flip: -1, ease: 'inOut', z: 4 });
C(55.65, 57.2, 1480, 930, 1.4); C(57.2, 57.6, 1160, 940, 1.35, 'in'); C(57.6, 61.1, 1100, 930, 1.6);
A('kid', 'peek', 57.5, 58.8, { x: [TOMB, TOMB] }); A('kid', 'hide', 58.8, 59.14, { x: [TOMB, TOMB] }); A('kid', 'cower', 59.14, 62.6, { x: [TOMB, TOMB] });
FL(57.3, 0.06, 0.4);
tl.tints.push({ t0: 59.1, t1: 61.1, a: 0.25, color: '#06060e', fadeIn: 0.5, fadeOut: 0.5 });
// ============================================================ 5 ROUND 3 (61.12-84)
TX(61.12, 62.4, 'ROUND 3', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
C(61.1, 62.56, 1360, 940, 1.35);
A('grim', 'down', 57.6, 62.56, { x: [1481, 1481], flip: -1 });
A('grim', 'crawl', 62.56, 64.6, { x: [1481, 880], flip: -1, ease: 'inOut' });
TR('ring', 63.6, 64.1, 1.0, 'out'); TR('limit', 62.6, 62.7, 1);
C(62.56, 64.6, 1200, 940, 1.35);
A('grim', 'stand-up', 64.6, 65.4, { x: [880, 800], flip: 1 }); A('grim', 'bristle', 65.4, 66.83, { x: [800, 800], flip: 1 });
A('kid', 'peek', 64.8, 66.0, { x: [TOMB, TOMB] }); A('kid', 'hide', 66.0, 66.8, { x: [TOMB, TOMB] });
A('vry', 'lunge-at', T('lunges', 2) - 0.1, 66.83, { x: [1180, 1130], flip: -1, speed: 1.0, z: 4 });
C(64.6, 66.83, 1120, 930, 1.5);
// garlic cut-away (camera tilts up from the roots)
C(66.83, 66.9, GARLIC, 1085, 2.7, 'out'); C(66.9, 69.35, GARLIC, 880, 2.7, 'inOut');
TX(67.3, 69.0, 'GARLIC', 540, 470, 62, { anim: 'pop', color: '#f4f1e6', bg: { fill: '#1d3a2a', stroke: '#8fd0a0', sw: 4, rx: 12, px: 34, py: 14 }, fadeOut: 0.2 });
// steps through
A('vry', 'walk', 69.37, 70.9, { x: [1130, 1040], flip: -1, speed: 0.9, z: 4 });
C(69.35, 70.3, 1100, 940, 1.7, 'out');
FX('powder', 70.15, GARLIC, 1030, { dur: 1.2, n: 14, spread: 300 });
A('vry', 'cover-face', 70.95, 72.4, { x: [1040, 1160], flip: -1, z: 4 }); A('kid', 'peek', 70.95, 72.5, { x: [TOMB, TOMB] });
A('grim', 'bristle', 66.83, 75.3, { x: [800, 800], flip: 1 });
SH(70.95, 1.4, 12); FL(T('hits'), 0.15, 0.5);
A('vry', 'kneel-cough', 72.5, 78.4, { x: [1160, 1160], flip: -1, z: 4 });
FX('smoke', 71.6, 1130, 790, { dur: 7.0, n: 12, spread: 90 });
C(70.95, 72.55, 1120, 910, 1.65);
TR('ring', 72.55, 73.4, 1.7, 'out'); SH(72.55, 2.4, 6, true); TR('inscr', 72.9, 73.4, 0.0);
C(72.55, 75.28, 1000, 930, 1.45, 'inOut');
A('kid', 'peek', 73.5, 75.0, { x: [TOMB, TOMB] });
// legend: buried dog (cut-away)
SC(75.28, 'church'); SC(78.28, 'grave');
TR('dogEye', 76.6, 77.6, 1, 'inOut'); TR('dogEye', 78.0, 78.2, 0);
C(75.28, 75.3, 540, 960, 1.0); tl.black.push([75.28, 75.4, 0.6]);
A('grim', 'howl', 77.9, 78.7, { x: [800, 800], flip: 1 });
// pounce: long jump, slow-mo punch, bite
TR('limit', 78.7, 78.8, 1);
A('grim', 'lunge', 78.7, 79.65, { x: [800, 1170], flip: 1, ease: 'in' });
A('vry', 'fall-back', 79.35, 80.0, { x: [1160, 1160], flip: -1, z: 1.5 });
C(78.28, 78.9, 1000, 940, 1.35); C(78.9, 79.6, 1120, 950, 1.7); C(79.6, 82.0, 1230, 960, 1.8);
FL(79.65, 0.12, 0.7); SH(79.65, 0.5, 24); FX('impact', 79.65, 1330, 930, { dur: 0.5, r: 130 }); FX('speed', 79.0, 1100, 940, { dur: 0.6, n: 18 });
A('grim', 'bite-shake', 80.1, 82.05, { x: [1170, 1172], flip: 1 }); A('vry', 'pinned', 80.0, 82.7, { x: [1160, 1160], flip: -1 });
FL(T('neck', 2) - 0.15, 0.12, 0.8); SH(T('neck', 2) - 0.15, 1.4, 22, true);
A('grim', 'bite', 82.2, 82.95, { x: [1172, 1172], flip: 1 });
A('vry', 'dead', 82.7, 86.2, { x: [1160, 1160], flip: -1 });
FL(82.66, 0.1, 0.9); SH(82.66, 0.5, 18);
A('kid', 'peek', 82.0, 85.6, { x: [TOMB, TOMB] });
// K.O.
FL(83.47, 0.12, 1.0); SH(83.47, 0.5, 20);
TX(83.47, 85.7, 'K.O.', 540, 560, 250, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 14, shadowDy: 16, fadeOut: 0.4 });
TX(83.9, 85.7, 'WINNER: CHURCH GRIM', 540, 760, 60, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ffd98a', sw: 5, rx: 14, px: 40, py: 18 }, fadeOut: 0.3 });
A('grim', 'howl', 84.0, 85.89, { x: [1172, 1172], flip: 1 });
C(82.0, 84.0, 1230, 940, 1.5); C(84.0, 85.89, 1230, 880, 1.2, 'inOut');
// ============================================================ 7 FALSE PEACE (85.89-92.34)
TR('dawn', 85.89, 88.2, 1, 'inOut'); TR('bells', 86.7, 86.8, 1);
TR('ring', 85.9, 86.5, 0, 'in'); TR('limit', 85.9, 86.0, 0);
C(85.89, 86.6, 1150, 760, 1.05);
// Grim drags the body to the open grave and covers it
A('grim', 'drag', 86.6, 87.7, { x: [520, 215], flip: 1, speed: 1 });
A('vry', 'dead', 86.2, 87.8, { x: [520, 215], flip: -1 }); A('vry', 'dead', 87.8, 88.0, { x: [215, 215], y: [1080, 1170], clipY: 1090, flip: -1 });
C(86.6, 87.6, 330, 940, 1.35); C(87.6, 88.3, 190, 950, 1.55);
A('grim', 'dig', 87.7, 88.4, { x: [215, 215], flip: -1 }); FX('soil', 87.8, 150, 1085, { dur: 1.0, n: 16 }); TR('grave', 87.8, 88.3, 1);
// kid runs home toward the dawn
A('kid', 'hide', 85.6, 88.6, { x: [TOMB, TOMB] });
A('kid', 'walk', 88.5, 89.1, { x: [TOMB, TOMB + 70], y: [1000, 1030], scale: 0.72, flip: 1, speed: 1.0 });
A('kid', 'lost', 89.1, 89.5, { x: [TOMB + 70, TOMB + 70] });
A('kid', 'run', 89.5, 91.3, { x: [TOMB + 70, 1760], y: [1030, 1040], flip: 1, speed: 2.6, ease: 'in' });
C(88.3, 88.4, TOMB, 930, 1.5); C(88.4, 90.0, 1250, 930, 1.45);
// Grim sits on the wall, watching them go (eyes amber)
A('grim', 'sit', 90.05, 92.5, { x: [1330, 1330], y: [WALL_TOP, WALL_TOP], flip: 1 });
C(90.05, 90.2, 1480, 900, 1.45, 'out'); C(90.2, 92.3, 1530, 900, 1.3);
// ============================================================ 8 CLIFFHANGER (92.34-98.13)
SC(92.34, 'room'); TR('dawn', 92.3, 92.34, 0);
tl.black.push([92.3, 92.5, 0.85]);
A('kid', 'sleep', 92.34, 96.43, { x: [520, 520], y: [962, 962], scale: 1.25, flip: -1 });
C(92.34, 92.35, 560, 930, 1.12); C(92.35, 96.4, 580, 930, 1.18, 'inOut');
TX(92.5, 93.25, 'ONLY FIRE ENDS IT', 540, 330, 56, { anim: 'fade', color: '#ff4a56', glow: true });
A('kid', 'bed-wake', 96.43, 97.1, { x: [520, 520], y: [962, 962], flip: 1, scale: 1.25 });
TR('blanket', 96.45, 97.0, 120, 'out'); TR('blanketY', 96.45, 97.0, 30, 'out'); TR('blanketR', 96.45, 97.0, 8, 'out');
C(96.4, 97.0, 700, 930, 1.25);
tl.black.push([96.95, 98.13, 1], [97.33, 97.45, 0.0]);
SH(97.33, 0.3, 6);
// ============================================================ 9 CTA (98.13-102.73)
SC(98.13, 'grave'); TR('dawn', 98.13, 98.14, 0);
C(98.13, 98.14, TOMB, 930, 2.2); C(98.14, 99.7, TOMB + 30, 940, 2.4);
TR('inscr', 98.2, 98.5, 0.5);
FX('sparks', 98.6, 1000, 700, { dur: 1.8, n: 6, color: '#3f5a52', seed: 5 });
TR('soil', 98.9, 102.7, 1);
TX(98.13, 99.7, 'NOBODY BURNED IT', 540, 400, 70, { anim: 'pop', color: '#ff7a84', bg: { fill: '#14182e', stroke: '#c4121f', sw: 5, rx: 14, px: 38, py: 18 }, fadeOut: 0.3 });
C(99.7, 99.8, HOLE + 40, 1000, 2.0, 'out'); C(99.8, 101.3, HOLE + 120, 960, 1.6);
A('vry', 'hand', 99.9, 100.9, { x: [HOLE, HOLE], y: [1080, 1080], clipY: 1090, flip: 1 });
FX('soil', 100.0, HOLE, 1085, { dur: 1.2, n: 10, seed: 6 });
A('grim', 'sit', 100.2, 102.0, { x: [420, 420], y: [1080, 1080], flip: -1 }); A('grim', 'alert', 101.9, END, { x: [420, 420], flip: -1 });
TX(T('Is'), 101.3, 'IS IT REALLY DEAD?', 540, 400, 72, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.2 });
TX(101.4, END, "WHO'S NEXT?", 540, 430, 120, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 10, shadowDy: 12, fadeOut: 0.0001 });
TX(101.95, END, 'FOLLOW', 540, 1000, 66, { anim: 'pop', color: '#fff', bg: { fill: '#c4121f', stroke: '#fff', sw: 4, rx: 40, px: 70, py: 22 }, fadeOut: 0.0001 });
// ---- HUD (2 bars: VRYKOLAKAS left, GRIM right)
tl.hud = { vis: [[0, 3.4], [15.99, 17.4], [27.63, 75.28], [78.28, 85.7]], leftLabel: 'VRYKOLAKAS', rightLabel: 'GRIM', leftInit: 0.55, rightInit: 0.35, blinkR: [[0, 3.4], [54.8, 72.55]], blinkL: [[81.0, 82.9]],
  left: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudL), right: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudR) };
delete tl.hudL; delete tl.hudR;
tl.cam.sort((a, b) => a.t0 - b.t0);
for (let i = 1; i < tl.cam.length; i++) if (tl.cam[i].t0 < tl.cam[i - 1].t1 - 1e-6) console.warn('CAM OVERLAP', tl.cam[i - 1], tl.cam[i]);
for (const k in tl.tracks) tl.tracks[k].sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(tl));
console.log('timeline.json written: cues', tl.cues.length, 'cams', tl.cam.length, 'fx', tl.fx.length);
