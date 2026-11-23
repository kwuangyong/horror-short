// Full cinematic episode (script-anim.md v5.1): shots + actor cues keyed to audio-anim/words.json (cut-on-word).
const fs = require('fs'), path = require('path');
const { wordTime } = require('../../../tools/anim/timeline_words');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/words.json'), 'utf8'));
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']/g, '');
// W('and', 63) = start of the word "and" closest to ~63 s (robust to repeated words); W('woods') = first occurrence
const W = (w, near) => { const c = words.filter((x) => norm(x.word) === norm(w)); if (!c.length) throw new Error('no word ' + w); if (near === undefined) return c[0].start; return c.reduce((a, b) => (Math.abs(b.start - near) < Math.abs(a.start - near) ? b : a)).start; };
const END = words[words.length - 1].end + 1.05;   // 89.67
const HOLE = 130, TOMB = 1010, GARLIC = 1112, LIM = 1160, WALL_TOP = 865;
const tl = { fps: 30, duration: 89.67, holeX: HOLE, camInit: { cx: 1170, cy: 930, zoom: 1.4 }, tracks: {}, cues: [], cam: [], shots: [], shake: [], flash: [], fx: [], text: [], scenes: [], black: [], tints: [], glitch: [], knocks: [W('knock') + 0.0 + 0.0] , freeze: [], slow: [] };
tl.knocks = [85.2];
const A = (actor, action, t0, t1, params) => tl.cues.push({ actor, action, t0, t1, params: params || {} });
const S = (t, type, o) => tl.shots.push(Object.assign({ t, type }, o || {}));
const TR = (name, t0, t1, v, ease) => { (tl.tracks[name] = tl.tracks[name] || []).push({ t0, t1, v, ease }); };
const SH = (t0, dur, amp, hold) => tl.shake.push({ t0, dur, amp, hold });
const FL = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp: amp === undefined ? 1 : amp, color });
const FX = (type, t0, x, y, o) => tl.fx.push(Object.assign({ type, t0, x, y, dur: 1 }, o || {}));
const TX = (t0, t1, text, x, y, size, o) => tl.text.push(Object.assign({ t0, t1, text, x, y, size, color: '#f2f0ea', anim: 'fade' }, o || {}));
const CARD = { fill: '#14182e', stroke: '#c4121f', sw: 6, rx: 18, px: 48, py: 22 };
const SC = (t0, s) => tl.scenes.push({ t0, s });

tl.actors = {
  kid: { kind: 'kid', x: TOMB, y: 1000, scale: 0.72, flip: 1, z: 0, vis: [[0, 3.4], [20.1, 85.62]] },
  vry: { kind: 'vry', x: 1250, y: 1080, scale: 0.86, flip: -1, z: 2, vis: [[0, 3.4], [23.0, 71.76], [72.6, 79.4], [87.15, 88.3]] },
  grim: { kind: 'grim', x: 1520, y: 1080, scale: 0.84, flip: -1, z: 3, vis: [[0, 3.4], [28.2, 31.8], [32.75, 66.15], [66.96, 68.48], [70.83, 71.76], [72.6, 81.0], [87.0, 89.67]] },
};
tl.props = [
  { type: 'tomb', x: TOMB, y: 1000, scale: 0.8, z: 1, scene: 'grave' },
  { type: 'garlic', x: GARLIC, y: 1012, scale: 0.8, z: 1.2, scene: 'grave' },
  { type: 'ring', follow: 'grim', y: 1088, z: 1.9, scene: 'grave', track: 'ring' },
  { type: 'limit', x: LIM, y: 1090, z: 0.4, scene: 'grave', track: 'limit' },
];

// ================================================================ 0 HOOK (0-3.98)
const tWho = W('Who'), tSurv = W('survives'), tTonight = W('Tonight');
SC(0, 'grave');
A('vry', 'walk', 0, 3.4, { speed: 0.04, x: [1250, 1250], y: [1080, 1080], flip: -1 });
A('grim', 'down', 0, 3.4, { x: [1481, 1481], y: [1080, 1080], flip: -1 });
A('kid', 'peek', 0, 3.4, { x: [TOMB, TOMB], y: [1000, 1000], scale: 0.72, flip: 1 });
S(0, 'ots', { side: 'left', cx: 1190, cy: 930, zoom: 1.5, push: 1.2, hand: 2, rack: { fg: 8, bg: 0 } });                       // SHOT 1 OTS-KID
S(tWho, 'ecu', { actor: 'kid', at: 'eye', zoom: 3.2, dy: 6, crash: { at: tSurv, dur: 0.1, k: 1.4 }, hand: 2.5 });                 // SHOT 2 REACTION-KID crash-zoom
tl.tints.push({ t0: 0, t1: 3.4, a: 0.28, color: '#c4121f', fadeIn: 0.1, fadeOut: 0.3 }); SH(0, 3.2, 5, true);
TX(tWho, 3.4, 'WHO SURVIVES?', 540, 520, 118, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.1 });
tl.glitch.push([2.7, 3.4]); FL(2.7, 0.1, 0.5); tl.black.push([3.4, tTonight, 1]);
// ================================================================ 1 SPLIT ROLL (3.98 - 14.3)
const lockV = W('Vrykolakas'), lockG = W('Grim'), tComment = W('Comment'), VSt = 13.38;
tl.splits = [{
  t0: tTonight, shatter: tComment, end: 14.3,
  zooms: [{ t0: tTonight, t1: 6.5, z0: 1.0, z1: 1.12, cx: 540, cy: 900, ease: 'lin' }, { t0: 6.5, t1: lockV, z0: 1.12, z1: 1.0, cx: 540, cy: 900 }, { t0: lockV, t1: lockV + 1.5, z0: 1.0, z1: 1.55, cx: 270, cy: 1000, ease: 'out' }, { t0: lockV + 1.5, t1: lockG, z0: 1.55, z1: 1.0, cx: 270, cy: 1000 }, { t0: lockG, t1: lockG + 1.5, z0: 1.0, z1: 1.5, cx: 810, cy: 1000, ease: 'out' }, { t0: lockG + 1.5, t1: tComment, z0: 1.5, z1: 1.0, cx: 810, cy: 1000 }],
  left: { kind: 'vry', lockT: lockV, N: 17, label: 'VRYKOLAKAS', subLabel: 'THE GREEK REVENANT', fx: 0, fy: 262, fscale: 0.86, idle: 'idle' },
  right: { kind: 'grim', lockT: lockG, N: 30, label: 'CHURCH GRIM', subLabel: 'GRAVEYARD GUARDIAN', fx: -34, fy: 215, fscale: 0.56, idle: 'shake-fur' },
}, { t0: 88.2, shatter: 500, end: 89.67, opaque: false, fadeIn: 0.25, left: { kind: null, lockT: 400, N: 60, label: '' }, right: { kind: null, lockT: 400, N: 60, label: '' } }];
SH(lockV, 0.5, 20); SH(lockG, 0.5, 20);
SC(tComment, 'forest');
S(tComment, 'wide', { scene: 'forest', cx: 560, cy: 930, zoom: 1.0, push: 1.1 });
FX('sparks', tComment, 270, 760, { dur: 1.7, n: 30, color: '#ff4a56', seed: 3 }); FX('sparks', tComment, 810, 760, { dur: 1.7, n: 30, color: '#ffe39a', seed: 4 }); FL(tComment, 0.25, 0.8); SH(tComment, 0.6, 14);
TX(VSt, 14.25, 'VS', 540, 800, 380, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6, fadeOut: 0.2 });
TX(VSt + 0.25, 14.25, 'WHO WINS?  COMMENT', 540, 1010, 70, { anim: 'blink', color: '#ff7a84', shadow: '#000', shadowDx: 4, shadowDy: 5, fadeOut: 0.1 });
FL(VSt, 0.2, 0.9); SH(VSt, 0.5, 26);
// ================================================================ 2 KID + ARENA + RULES (14.25 - 39.68)
const tKid = W('kid', 14), tWoods = W('woods'), tThen = W('Then'), tAnd1 = W('and', 20.2), tGround = W('The', 22.1);
S(tKid, 'pov', { scene: 'forest', speed: 3.2, sweep: 330 });                                                                  // SHOT 7
S(tWoods, 'pov', { speed: 2.0, sweep: 560, phase: 2.2, whip: 0.2, whipDir: 1 });                                              // SHOT 8 lost, whip-pan
S(tThen, 'pov', { speed: 1.4, sweep: 140, cone: 0.26, dark: 0.9, reveal: 1, revealT: 1.1, phase: 0.2 });                       // SHOT 9 branches part, graveyard
SC(tAnd1, 'grave');
S(tAnd1, 'wide', { scene: 'grave', cx: 480, cy: 930, zoom: 1.05, push: 1.12, pan: [200, 0], whip: 0.15 });                      // SHOT 10 WIDE-ESTABLISH
A('kid', 'walk', tAnd1, 21.6, { x: [-60, 350], y: [1040, 1040], scale: 0.72, flip: 1, speed: 1.2, ease: 'lin' }); A('kid', 'look-up', 21.6, tGround + 0.1, { x: [350, 350] });
S(tGround, 'insert', { cx: HOLE + 10, cy: 1040, zoom: 2.7, hand: 2.5 });                                                         // SHOT 11 ECU-ĐẤT
SH(tGround, 2.2, 14, true); FX('dust', tGround + 0.1, HOLE, 1090, { dur: 1.3, n: 14 }); FX('dust', 22.9, HOLE + 40, 1090, { dur: 1.2, n: 10, seed: 2 });
A('kid', 'scared-back', 22.5, 23.2, { x: [350, 310], ease: 'out' }); A('kid', 'idle-scared', 23.2, 26.0, { x: [310, 310] });
const tAnd2 = W('and', 23.3), tSees = W('It', 25.8);
A('vry', 'rise', 23.2, 25.55, { x: [HOLE, HOLE], y: [1080, 1080], clipY: 1090, flip: 1 });
S(tAnd2, 'low', { actor: 'vry', zoom: 1.8, ground: 0.9, sy: 1.1, push: 1.12, dutch: -6, hand: 1.5, whip: 0.1, whipDir: -1 });          // SHOT 12 LOW-ANGLE rise
FX('soil', 23.35, HOLE, 1085, { dur: 1.4, n: 22 }); FX('soil', 24.2, HOLE + 20, 1085, { dur: 1.4, n: 16, seed: 2 }); FX('dust', 23.5, HOLE, 1092, { dur: 1.2, n: 12 }); FX('dust', 25.3, HOLE, 1095, { dur: 1.1, n: 10, seed: 2 });
A('vry', 'walk', 25.55, 28.0, { x: [HOLE, 255], speed: 0.8, flip: 1, ease: 'out' }); A('vry', 'grin', 28.0, 31.8, { x: [255, 255] });
const tAnd3 = W('and', 27.0);
S(tSees, 'ots', { side: 'left', cx: 330, cy: 930, zoom: 1.35, push: 1.15, hand: 2, rack: { fg: 9, bg: 1 } });                      // SHOT 13 OTS
A('kid', 'scared-back', 26.0, tAnd3, { x: [310, 300] });
S(tAnd3, 'cu', { actor: 'kid', fill: 0.7, push: 1.12, hand: 2 });                                                              // SHOT 14 REACTION-KID
A('kid', 'run', 28.2, 30.9, { x: [300, TOMB - 8], y: [1040, 1006], scale: [0.72, 0.72], speed: 2.4, ease: 'inOut' });
const tBut = W('But', 28.5), tLeaps = W('leaps'), tAnd4 = W('and', 30.2), tBlocks = W('blocks');
A('grim', 'crouch', 28.2, tLeaps - 0.05, { x: [1150, 1150], y: [WALL_TOP, WALL_TOP], flip: -1 });
const J0 = tLeaps - 0.05;
A('grim', 'jump', J0, J0 + 0.95, { x: [1150, 800], y: [WALL_TOP, 1080], arc: 170, ease: 'lin', flip: -1 });
S(tBut, 'follow', { actor: 'grim', dx: -80, dy: -140, zoom: 1.45, whip: 0.2, whipDir: 1 });                                      // SHOT 15 TRACKING
A('grim', 'land', J0 + 0.95, J0 + 1.5, {}); A('grim', 'growl', J0 + 1.5, 31.8, {});
S(tAnd4, 'versus', { a: 'vry', b: 'grim', zoom: 1.5, cy: 950, crash: { at: J0 + 0.97, dur: 0.1, k: 1.18 } });                      // SHOT 16 VERSUS
SH(J0 + 0.95, 0.5, 20); FX('dust', J0 + 0.95, 800, 1092, { dur: 1.1, n: 16, spread: 560 }); FL(J0 + 0.95, 0.2, 0.6); TR('ring', J0 + 0.9, J0 + 1.4, 1, 'out');
A('kid', 'hide', 30.9, 60.2, { x: [TOMB, TOMB], y: [1000, 1000], scale: 0.72 });
// garlic / headstone
const tGarlic = W('Garlic'), tAnd5 = W('and', 33.3), tOnly1 = W('only', 34.8), tBut2 = W('But', 36.4);
S(tGarlic, 'insert', { cx: GARLIC, cy: 960, zoom: 2.6, push: 1.1, rack: { bg: 0 } });                                            // SHOT 17 INSERT-TỎI
TX(tGarlic + 0.1, 34.0, 'GARLIC WEAKENS IT', 540, 330, 84, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
A('vry', 'disgust', 32.55, 33.6, { x: [255, 255] });
S(32.75, 'cu', { actor: 'vry', fill: 0.75, hand: 2 });
S(tAnd5, 'insert', { cx: TOMB, cy: 800, zoom: 2.5, pan: [0, 150], hand: 1.5 });                                                  // SHOT 18 INSERT-BIA tilt-down
TR('inscr', 33.6, 34.3, 1, 'out'); TR('inscr', 38.0, 38.6, 0);
TX(tOnly1 - 0.1, 36.3, 'ONLY FIRE ENDS IT', 540, 330, 76, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 46, py: 22 }, glow: true, fadeOut: 0.3 });
A('vry', 'grin', 33.6, 36.44, { x: [255, 255] });
S(W('ends', 35.5), 'ecu', { actor: 'vry', at: 'eye', zoom: 5.2, hand: 2 });                                                      // ECU-MẮT + flame reflection
FX('flame', W('ends', 35.5) + 0.15, 260, 716, { dur: 0.9, r: 7 });
S(tBut2, 'wide', { cx: 640, cy: 930, zoom: 1.25, pan: [260, 0], dutch: 9, dutchTo: 0 });                                          // SHOT 19 DUTCH -> WIDE
A('grim', 'walk', tBut2, 38.4, { x: [520, LIM - 321 - 8], flip: 1, speed: 0.9, ease: 'lin' }); A('grim', 'paw-line', 38.4, 39.68, { x: [LIM - 329, LIM - 329], flip: 1 });
TR('limit', 37.3, 38.0, 1, 'out'); TR('limit', 49.0, 49.1, 0);
TX(W('only', 37.5), 39.6, 'THE LIMIT:\nINSIDE THE WALL', 540, 330, 62, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ff4a56', sw: 5, rx: 14, px: 40, py: 20 }, fadeOut: 0.25 });
// ================================================================ 3 ROUND 1 (39.68 - 48.62)
const tR1 = W('Round', 39.6), tLunges = W('lunges'), tJaws = W('jaws'), tClaws = W('Claws', 44), tBut3 = W('but', 45.5), tAnd6 = W('and', 46.4), tR2 = W('Round', 48.6);
TX(tR1, 40.9, 'ROUND 1', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
A('vry', 'circle', tR1, tLunges, { x: [255, 330], flip: 1 }); A('grim', 'stalk', tR1, tLunges, { x: [LIM - 329, 790], flip: -1, speed: 0.6 });
A('kid', 'cower', 39.8, 44.0, { x: [TOMB, TOMB] });
S(tR1, 'versus', { a: 'vry', b: 'grim', zoom: 1.2, cy: 960, push: 1.25 });                                                       // SHOT 20
A('grim', 'lunge', tLunges, tLunges + 0.9, { x: [790, 350], flip: -1, ease: 'in' }); A('vry', 'fall-back', tLunges + 0.5, tJaws + 0.05, { x: [330, 330], flip: 1 });
S(tLunges, 'versus', { a: 'vry', b: 'grim', zoom: 1.7, cy: 960, slow: 0.4, hand: 1.5 });                                         // SHOT 21 slow-mo lunge
S(tJaws, 'ecu', { actor: 'grim', at: 'jaw', zoom: 3.0, crash: { at: tJaws + 0.04, dur: 0.1, k: 1.3 }, hand: 2 });                  // SHOT 22 ECU-HÀM
A('grim', 'bite-shake', tJaws, tClaws + 0.1, { x: [350, 335], flip: -1 }); A('vry', 'pinned', tJaws, tClaws + 0.9, { x: [330, 330], flip: 1 });
FL(tJaws, 0.12, 0.8); SH(tJaws, 1.4, 20, true); FX('impact', tLunges + 1.0, 330, 900, { dur: 0.5, r: 110 });
S(tClaws, 'ecu', { actor: 'vry', at: 'claw', zoom: 2.8, hand: 3.5, dx: 40 });                                                    // SHOT 23 ECU-MÓNG
A('grim', 'recoil', tClaws + 0.35, tClaws + 1.25, { x: [335, 430], flip: -1 }); FX('impact', tClaws + 0.45, 440, 960, { dur: 0.4, r: 80 }); FL(tClaws + 0.45, 0.08, 0.5); SH(tClaws + 0.45, 0.3, 12);
S(tBut3, 'cu', { actor: 'kid', fill: 0.7, hand: 2 }); A('kid', 'peek', 45.4, 46.45, { x: [TOMB, TOMB] }); A('kid', 'hide', 46.45, 50.0, { x: [TOMB, TOMB] });          // SHOT 24 REACTION-KID peek
S(tAnd6, 'low', { actor: 'grim', zoom: 1.45, ground: 0.9, sy: 1.08, hand: 1.5 });                                                 // SHOT 25 LOW-ANGLE
A('vry', 'crawl-back', tClaws + 1.3, tR2 + 0.1, { x: [330, 190], flip: 1 }); A('grim', 'growl', tClaws + 1.25, tR2, { x: [430, 430], flip: -1 });
// ================================================================ 4 ROUND 2 (48.62 - 60.25)
const tGrabs = W('grabs'), tHurls = W('hurls'), tOutside = W('Outside'), tSo = W('so'), tFalls = W('falls'), tAnd7 = W('and', 57.7), tR3 = W('Round', 60.2);
TX(tR2, 49.8, 'ROUND 2', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
A('vry', 'stand-up', tR2, tGrabs - 0.3, { x: [190, 190], flip: 1 }); A('vry', 'walk', tGrabs - 0.3, tGrabs, { x: [190, 205], speed: 0.8, flip: 1 });
A('grim', 'stalk', tR2, tGrabs, { x: [430, 505], flip: -1, speed: 0.5 });
S(tR2, 'versus', { a: 'vry', b: 'grim', zoom: 1.4, cy: 950, whip: 0.15, whipDir: 1, push: 1.1 });                                  // SHOT 26
A('vry', 'neck-grab', tGrabs, tHurls, { x: [205, 205], flip: 1 }); A('grim', 'dangle', tGrabs + 0.05, tHurls, { x: [505, 505], y: [1080, 970], flip: -1, ease: 'out' });
S(tGrabs, 'ecu', { actor: 'vry', at: 'hand', zoom: 2.4, hand: 2, dx: 70, dy: -20 });                                              // SHOT 27 ECU-TAY
SH(tGrabs + 0.9, 1.0, 8, true);
A('vry', 'grab-throw', tHurls - 0.05, tHurls + 0.9, { x: [205, 205], flip: 1 });
A('grim', 'jump', tHurls, tHurls + 1.45, { x: [505, 1520], y: [970, 1080], arc: 420, rot: [0, -600], ease: 'lin', flip: -1, blend: 0.05 });
S(tHurls, 'follow', { actor: 'grim', dx: -200, dy: -100, zoom: 1.3, slow: 0.5 });                                                 // SHOT 28 TRACKING slow-mo
const LAND = tHurls + 1.45;
A('grim', 'weak', LAND, 53.6, { x: [1520, 1520], y: [1080, 1080], rot: [0, 0], flip: -1 });
S(tHurls + 1.05, 'cu', { actor: 'kid', fill: 0.7, crash: { at: tHurls + 1.1, dur: 0.1, k: 1.4 }, hand: 2.5 }); A('kid', 'gasp', tHurls + 1.0, tOutside + 0.4, { x: [TOMB, TOMB] }); // SHOT 29 REACTION-KID gasp
SH(LAND, 0.6, 24); FX('dust', LAND, 1520, 1092, { dur: 1.2, n: 16, spread: 560 }); FL(LAND, 0.12, 0.5);
tl.hudR = [{ t0: 44.0, t1: 44.8, v: 0.9 }, { t0: LAND, t1: LAND + 0.4, v: 0.6 }, { t0: 55.0, t1: 56.4, v: 0.35 }];
TR('ring', LAND + 0.1, LAND + 1.4, 0, 'in'); TR('limit', LAND - 0.5, LAND - 0.4, 1);
A('grim', 'blocked', 53.6, tSo + 0.3, { x: [1490, 1481], flip: -1 });
S(tOutside, 'cu', { actor: 'grim', fill: 0.85, push: 1.15, dy: 20 });                                                             // SHOT 30 CU-GRIM
A('vry', 'lunge-at', tR2 + 3.0, tSo + 0.05, { x: [205, 1380], flip: 1, ease: 'lin' });
S(tSo, 'versus', { a: 'vry', b: 'grim', zoom: 1.45, cy: 960, dutch: 9, dutchTo: 5, hand: 1.5 });                                  // SHOT 31 DUTCH slashes
A('vry', 'slash-down', tSo + 0.05, tFalls + 0.05, { x: [1380, 1380], flip: 1 });
A('grim', 'down', tSo + 0.1, 62.0, { x: [1481, 1481], flip: -1 });
for (const tt of [tSo + 0.3, tSo + 0.75, tSo + 1.2, tSo + 1.65]) { FL(tt, 0.1, 0.45); SH(tt, 0.25, 10); FX('impact', tt, 1520, 980, { dur: 0.35, r: 70, seed: Math.round(tt * 7) }); }
S(tFalls, 'high', { actor: 'grim', zoom: 1.5, sy: 0.74, ground: 0.58 });                                                           // SHOT 32 HIGH-ANGLE
A('vry', 'victory', tFalls + 0.1, tAnd7, { x: [1380, 1380], flip: 1 });
A('vry', 'walk', tAnd7, tR3, { x: [1380, 1180], speed: 0.55, flip: -1, ease: 'inOut', z: 1.5 });
S(tAnd7, 'ots', { side: 'left', cx: 1130, cy: 930, zoom: 1.45, push: 1.2, hand: 2, rack: { fg: 9, bg: 1 } });                      // SHOT 33 OTS-KID (= hook frame)
S(W('kid', 59), 'ecu', { actor: 'grim', at: 'eye', zoom: 5.2, push: 1.1 });                                                         // ECU-MẮT Grim hé mở
A('kid', 'cower', 60.2, 66.0, { x: [TOMB, TOMB] });
tl.hudL = [{ t0: tJaws + 0.05, t1: tJaws + 0.8, v: 0.55 }];
tl.tints.push({ t0: 58.7, t1: 60.2, a: 0.25, color: '#06060e', fadeIn: 0.5, fadeOut: 0.3 });
// ================================================================ 5 ROUND 3 (60.25 - 75.35)
const tCrawls = W('crawls', 61.6), tAnd8 = W('and', 63.1), tCharges = W('charges'), tGarlic2 = W('garlic', 66.2), tAnd9 = W('and', 66.9), tLegend = W('Legend'), tBuried = W('buried'), tAnd10 = W('and', 70.8), tStronger = W('stronger'), tHe = W('He', 72.6), tPounces = W('pounces'), tAnd11 = W('and', 73.6), tBite = W('bite'), tKO = 75.35;
TX(tR3, 61.5, 'ROUND 3', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
S(tR3, 'ecu', { actor: 'grim', at: 'eye', zoom: 5.2, push: 1.18, hand: 1.2 });                                                      // SHOT 34 ECU-MẮT
A('grim', 'crawl', tCrawls - 0.2, tAnd8, { x: [1481, 880], flip: -1, ease: 'inOut' });
TR('ring', tCrawls + 0.8, tCrawls + 1.4, 1.0, 'out'); TR('limit', tCrawls - 0.2, tCrawls - 0.1, 1);
S(W('Grim', 61.3), 'versus', { a: 'vry', b: 'grim', zoom: 1.35, cy: 960, push: 1.12 });                                            // SHOT 35 VERSUS
A('grim', 'stand-up', tAnd8, tAnd8 + 0.8, { x: [880, 800], flip: 1 }); A('grim', 'bristle', tAnd8 + 0.8, tCharges, { x: [800, 800], flip: 1 });
A('vry', 'walk', tR3, tCharges, { x: [1180, 1180], speed: 0.05, flip: -1, z: 1.5 });
A('vry', 'lunge-at', tCharges, tGarlic2, { x: [1180, 1130], flip: -1, speed: 1.0, z: 4 });
S(tCharges, 'versus', { a: 'vry', b: 'grim', zoom: 1.5, cy: 960, hand: 1.5 });                                                       // SHOT 36
S(tGarlic2, 'insert', { cx: GARLIC, cy: 1085, zoom: 2.7, pan: [0, -210] });                                                          // SHOT 37 INSERT-TỎI tilt-up
A('vry', 'walk', tGarlic2, tAnd9 + 0.1, { x: [1130, 1040], flip: -1, speed: 0.9, z: 4 });
FX('powder', tGarlic2 + 0.55, GARLIC, 1030, { dur: 1.2, n: 14, spread: 300 });
const tStench = W('stench');
A('vry', 'cover-face', tAnd9 + 0.1, tStench + 1.0, { x: [1040, 1160], flip: -1, z: 4 }); A('vry', 'kneel-cough', tStench + 1.0, tAnd11, { x: [1160, 1160], flip: -1, z: 4 });
S(tAnd9, 'cu', { actor: 'vry', fill: 0.8, hand: 2.5 });                                                                               // SHOT 38 CU-VRYKOLAKAS
SH(tAnd9, 1.4, 12); FL(tStench + 0.3, 0.15, 0.5); FX('smoke', tStench + 0.4, 1130, 790, { dur: 4.5, n: 12, spread: 90 });
tl.hudL.push({ t0: tStench + 0.1, t1: tStench + 0.8, v: 0.30 });
SC(tLegend, 'church'); SC(tAnd10, 'grave');
S(tLegend, 'wide', { scene: 'church', cx: 540, cy: 960, zoom: 1.0, push: 1.12, rack: { bg: 3 } });                                  // SHOT 39 INSERT-NỀN
TR('dogEye', tBuried - 0.3, tBuried + 0.5, 1, 'inOut'); TR('dogEye', tAnd10 - 0.1, tAnd10, 0);
tl.black.push([tLegend, tLegend + 0.1, 0.6]);
A('grim', 'bristle', tAnd10 - 0.2, tHe, { x: [800, 800], flip: 1 });
S(tAnd10, 'low', { actor: 'grim', zoom: 1.55, ground: 0.9, sy: 1.1, push: 1.1, scene: 'grave', hand: 1.5 });                           // SHOT 40 LOW-ANGLE grows
TR('ring', tAnd10, tAnd10 + 0.6, 1.7, 'out'); SH(tAnd10, 2.0, 7, true);
S(tStronger + 0.1, 'cu', { actor: 'kid', fill: 0.7, hand: 2 }); A('kid', 'peek', tStronger, tHe + 0.3, { x: [TOMB, TOMB] }); A('kid', 'hide', tHe + 0.3, 80.0, { x: [TOMB, TOMB] });   // SHOT 41
A('grim', 'lunge', tPounces - 0.1, tPounces + 0.95, { x: [800, 1170], flip: 1, ease: 'in' }); A('vry', 'fall-back', tPounces + 0.55, tBite - 0.4, { x: [1160, 1160], flip: -1, z: 1.5 });
S(tHe, 'versus', { a: 'vry', b: 'grim', zoom: 1.65, cy: 960, slow: 0.45, hand: 1.5 });                                                 // SHOT 42 slow-mo pounce
S(tAnd11, 'ecu', { actor: 'grim', at: 'jaw', zoom: 3.0, crash: { at: tAnd11 + 0.1, dur: 0.1, k: 1.3 }, hand: 2 });                     // SHOT 43 ECU-HÀM
A('grim', 'bite-shake', tAnd11 + 0.05, tBite, { x: [1170, 1172], flip: 1 }); A('vry', 'pinned', tBite - 0.4, tBite + 0.45, { x: [1160, 1160], flip: -1 });
A('grim', 'bite', tBite, tKO, { x: [1172, 1172], flip: 1 }); A('vry', 'dead', tBite + 0.45, 78.0, { x: [1160, 1160], flip: -1 });
FL(tAnd11 + 0.1, 0.12, 0.8); SH(tAnd11 + 0.1, 1.4, 22, true); FL(tBite + 0.05, 0.1, 0.9); SH(tBite + 0.05, 0.5, 18);
tl.hudL.push({ t0: tAnd11 + 0.15, t1: tAnd11 + 0.8, v: 0.10 }, { t0: tBite + 0.4, t1: tBite + 0.6, v: 0 });
A('kid', 'peek', 73.8, 77.0, { x: [TOMB, TOMB] });
// ================================================================ 6 K.O. (75.35)
FL(tKO, 0.12, 1.0); SH(tKO, 0.5, 20);
TX(tKO, 77.0, 'K.O.', 540, 400, 240, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 14, shadowDy: 16, fadeOut: 0.4 });
TX(tKO + 0.4, 77.0, 'WINNER: CHURCH GRIM', 540, 560, 60, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ffd98a', sw: 5, rx: 14, px: 40, py: 18 }, fadeOut: 0.3 });
A('grim', 'howl', tKO, 77.12, { x: [1172, 1172], flip: 1 });
S(tKO, 'wide', { cx: 1240, cy: 900, zoom: 1.5, push: 0.8 });                                                                           // SHOT 44 WIDE, pull-back
// ================================================================ 7 DAWN (77.12 - 81.08)
const tDawn = W('dawn'), tBuries = W('buries'), tAnd12 = W('and', 79.3), tRuns = W('runs'), tNext = W('Next');
TR('dawn', tDawn, tDawn + 2.2, 1, 'inOut'); TR('bells', tDawn + 0.3, tDawn + 0.4, 1);
TR('ring', tDawn - 0.1, tDawn + 0.5, 0, 'in'); TR('limit', tDawn - 0.1, tDawn, 0);
S(tDawn, 'wide', { cx: 1050, cy: 760, zoom: 1.0, pan: [-60, 0] });                                                                      // SHOT 45a tower, bells
S(77.85, 'wide', { cx: 330, cy: 920, zoom: 1.25, pan: [-80, 0] });                                                                       // 45b burying
A('grim', 'drag', 77.85, 78.6, { x: [520, 215], flip: 1, speed: 1 });
A('vry', 'dead', 77.0, 78.7, { x: [520, 215], flip: -1 }); A('vry', 'dead', 78.7, 79.2, { x: [215, 215], y: [1080, 1170], clipY: 1090, flip: -1 });
A('grim', 'dig', 78.6, tAnd12, { x: [215, 215], flip: -1 }); FX('soil', 78.7, 150, 1085, { dur: 1.0, n: 16 }); TR('grave', 78.7, 79.2, 1);
A('kid', 'hide', 77.0, tAnd12 + 0.1, { x: [TOMB, TOMB] });
A('kid', 'walk', tAnd12 + 0.1, tRuns, { x: [TOMB, TOMB + 70], y: [1000, 1030], scale: 0.72, flip: 1, speed: 1.0 });
A('kid', 'run', tRuns, tNext + 0.3, { x: [TOMB + 70, 1760], y: [1030, 1040], flip: 1, speed: 2.6, ease: 'in' });
S(tAnd12, 'follow', { actor: 'kid', dx: 140, dy: -100, zoom: 1.4, whip: 0.12 });                                                         // SHOT 46 TRACKING
A('grim', 'sit', 80.0, tNext + 1.5, { x: [1330, 1330], y: [WALL_TOP, WALL_TOP], flip: 1 });
S(80.35, 'low', { x: 1330, zoom: 1.4, ground: 0.8, sy: 1.08 });                                                                          // 46b Grim watches (amber eyes)
// ================================================================ 8 CLIFFHANGER (81.08 - 85.62)
const tThen2 = W('Then', 83.7), tOne = W('one'), tBed = W('bed');
SC(tNext, 'room'); TR('dawn', tNext - 0.02, tNext, 0);
tl.black.push([tNext, tNext + 0.2, 0.85]);
A('kid', 'sleep', tNext, 85.3, { x: [520, 520], y: [962, 962], scale: 1.25, flip: -1 });
S(tNext, 'high', { actor: 'kid', zoom: 1.35, sy: 0.78, ground: 0.58, push: 1.1, hand: 1.5 });                                             // SHOT 47 HIGH-ANGLE bed
TX(tNext + 0.3, tNext + 0.85, 'ONLY FIRE ENDS IT', 540, 330, 56, { anim: 'fade', color: '#ff4a56', glow: true });
S(tThen2, 'insert', { cx: 985, cy: 720, zoom: 2.0, push: 1.08 });                                                                        // SHOT 48 ECU-CỬA
tl.black.push([84.85, 85.15, 1], [85.15, 85.3, 0.0]);
S(85.15, 'insert', { cx: 985, cy: 720, zoom: 2.0 }); SH(85.2, 0.25, 8);
A('kid', 'bed-wake', 85.3, 85.62, { x: [520, 520], y: [962, 962], flip: 1, scale: 1.25 });
S(85.3, 'ecu', { actor: 'kid', at: 'head', zoom: 2.4, hand: 3 });                                                                         // REACTION-KID wakes
TR('blanket', 85.3, 85.6, 120, 'out'); TR('blanketY', 85.3, 85.6, 30, 'out'); TR('blanketR', 85.3, 85.6, 8, 'out');
// ================================================================ 9 CTA (85.62 - 89.67)
const tNobody = W('Nobody'), tIs = W('Is', 87), tWhos = W("Who's");
SC(tNobody, 'grave'); TR('dawn', tNobody - 0.02, tNobody, 0);
S(tNobody, 'insert', { scene: 'grave', cx: TOMB + 20, cy: 930, zoom: 2.3, push: 1.15 });                                                  // SHOT 49
TR('inscr', tNobody, tNobody + 0.4, 0.6); TR('soil', tNobody + 0.6, 90, 1);
TX(tNobody, tIs, 'NOBODY BURNED IT', 540, 400, 70, { anim: 'pop', color: '#ff7a84', bg: { fill: '#14182e', stroke: '#c4121f', sw: 5, rx: 14, px: 38, py: 18 }, fadeOut: 0.2 });
FX('sparks', tNobody + 0.5, 1000, 700, { dur: 1.4, n: 6, color: '#3f5a52', seed: 5 });
A('vry', 'hand', 87.2, 88.3, { x: [HOLE, HOLE], y: [1080, 1080], clipY: 1090, flip: 1 }); FX('soil', 87.3, HOLE, 1085, { dur: 1.2, n: 10, seed: 6 });
A('grim', 'sit', 87.0, 88.4, { x: [430, 430], y: [1080, 1080], flip: -1 }); A('grim', 'alert', 88.4, 89.67, { x: [430, 430], flip: -1 });
S(tIs, 'low', { x: 280, zoom: 1.4, ground: 0.8, sy: 1.08, hand: 1.5, scene: 'grave' });                                                      // SHOT 50
TX(tIs, tWhos, 'IS IT REALLY DEAD?', 540, 400, 72, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.15 });
TX(tWhos, 89.67, "WHO'S NEXT?", 540, 1120, 112, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 10, shadowDy: 12, fadeOut: 0.0001 });
TX(tWhos + 0.5, 89.67, 'FOLLOW', 540, 960, 66, { anim: 'pop', color: '#fff', bg: { fill: '#c4121f', stroke: '#fff', sw: 4, rx: 40, px: 70, py: 22 }, fadeOut: 0.0001 });
S(tWhos, 'wide', { cx: 540, cy: 960, zoom: 1.0 });                                                                                         // SHOT 51 SPLIT-ROLL (instance 2 overlays)
// ---- HUD
tl.hud = { vis: [[0, 3.4], [VSt, 14.25], [J0 + 0.95, tLegend], [tAnd10, tKO + 1.7]], leftLabel: 'VRYKOLAKAS', rightLabel: 'GRIM', leftInit: 0.55, rightInit: 0.35, blinkR: [[0, 3.4], [55.4, tAnd10]], blinkL: [[tAnd11 + 0.8, tBite + 0.5]],
  left: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudL), right: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudR) };
tl.hud.left.sort((a, b) => a.t0 - b.t0); tl.hud.right.sort((a, b) => a.t0 - b.t0); delete tl.hudL; delete tl.hudR;
tl.cam.sort((a, b) => a.t0 - b.t0); tl.shots.sort((a, b) => a.t - b.t); tl.scenes.sort((a, b) => a.t0 - b.t0);
for (const k in tl.tracks) tl.tracks[k].sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(__dirname, 'timeline-v5.json'), JSON.stringify(tl));
console.log('timeline-v5.json: shots', tl.shots.length, 'cues', tl.cues.length, 'fx', tl.fx.length, 'dur', tl.duration);
