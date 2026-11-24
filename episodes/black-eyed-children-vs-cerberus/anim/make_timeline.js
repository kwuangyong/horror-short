// Episode #002 final (script-anim.md v2, 44 scenes, no HUD / no ROUND): BLACK-EYED CHILDREN vs CERBERUS, ending A. Cuts + cues keyed to audio-anim/words.json.
const fs = require('fs'), path = require('path');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/words.json'), 'utf8'));
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']/g, '');
const W = (w, near) => { const c = words.filter((x) => norm(x.word) === norm(w)); if (!c.length) throw new Error('no word ' + w); if (near === undefined) return c[0].start; return c.reduce((a, b) => (Math.abs(b.start - near) < Math.abs(a.start - near) ? b : a)).start; };
const DUR = 87.5;
const tl = { fps: 30, duration: DUR, holeX: 130, sides: { left: 'b0', right: 'cb' }, mirror: [], camInit: { cx: 700, cy: 880, zoom: 1.1 }, tracks: {}, cues: [], cam: [], shots: [], shake: [], flash: [], fx: [], text: [], scenes: [], black: [], tints: [], glitch: [], knocks: [19.18, 81.08], freeze: [], slow: [] };
const spk = (name) => words.filter((w) => w.speaker === name).map((w) => [w.start, w.end]);
tl.voices = { cerberus: { words: spk('cerberus') }, kid: { words: spk('kid') }, children: { words: spk('children') }, kid_mimic: { words: spk('kid_mimic') } };
const A = (actor, action, t0, t1, params) => tl.cues.push({ actor, action, t0, t1, params: params || {} });
const S = (t, type, o) => tl.shots.push(Object.assign({ t, type }, o || {}));
const TR = (name, t0, t1, v, ease) => { (tl.tracks[name] = tl.tracks[name] || []).push({ t0, t1, v, ease }); };
const SH = (t0, dur, amp, hold) => tl.shake.push({ t0, dur, amp, hold });
const FL = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp: amp === undefined ? 1 : amp, color });
const FX = (type, t0, x, y, o) => tl.fx.push(Object.assign({ type, t0, x, y, dur: 1 }, o || {}));
const TX = (t0, t1, text, x, y, size, o) => tl.text.push(Object.assign({ t0, t1, text, x, y, size, color: '#f2f0ea', anim: 'fade' }, o || {}));
const CARD = { fill: '#14182e', stroke: '#c4121f', sw: 6, rx: 18, px: 48, py: 22 };
const SC = (t0, s) => tl.scenes.push({ t0, s });
// layout: porch + door (x 605-795) centre; BEC on the porch LEFT, Cerberus blocks the door from the RIGHT, kid in the window right of the door / inside the cabin
const CBX = 940, GATEX = 800, WIN = [880, 690, 160, 200], KIDW = { x: 960, y: 905, scale: 0.62 }, KID_IN = { x: 620, y: 1062, scale: 0.9 };
tl.actors = {
  kw: { kind: 'kid', x: KIDW.x, y: KIDW.y, scale: KIDW.scale, flip: -1, z: 0, scenes: ['cabin'], vis: [[0, 3.4], [29.0, 69.6]] },
  kp: { kind: 'kid', x: 200, y: 1090, scale: 0.8, flip: 1, z: 1, scenes: ['cabin'], vis: [[15.2, 18.0], [69.6, 76.4]] },
  ki: { kind: 'kid', x: KID_IN.x, y: KID_IN.y, scale: KID_IN.scale, flip: 1, z: 1, scenes: ['cabin-in', 'room'], vis: [[17.8, 30.4], [49.3, 58.0], [76.4, 83.4]] },
  b0: { kind: 'bec', variant: 0, x: 470, y: 1080, scale: 0.98, flip: 1, z: 2, scenes: ['cabin'], vis: [[0, 3.4], [22.5, 67.0]] },
  b1: { kind: 'bec', variant: 1, x: 560, y: 1084, scale: 0.98, flip: 1, z: 2, scenes: ['cabin'], vis: [[0, 3.4], [22.5, 67.0]] },
  bw0: { kind: 'bec', variant: 0, x: 290, y: 660, scale: 0.62, flip: 1, z: 1, scenes: ['cabin-in'], vis: [[17.8, 22.6], [54.6, 58.0]] },
  bw1: { kind: 'bec', variant: 1, x: 390, y: 664, scale: 0.62, flip: 1, z: 1, scenes: ['cabin-in'], vis: [[17.8, 22.6], [54.6, 58.0]] },
  rw0: { kind: 'bec', variant: 0, x: 190, y: 745, scale: 0.9, flip: 1, z: 1, scenes: ['room'], vis: [[81.6, 83.6]] },
  rw1: { kind: 'bec', variant: 1, x: 330, y: 749, scale: 0.9, flip: 1, z: 1, scenes: ['room'], vis: [[81.6, 83.6]] },
  cb: { kind: 'cerberus', x: CBX, y: 1076, scale: 0.68, flip: -1, z: 3, scenes: ['cabin'], vis: [[0, 3.4], [30.3, 69.6], [69.6, 76.4]] },
};
tl.props = [
  { type: 'limit', x: 600, y: 1090, scale: 1, z: 0.4, scene: 'cabin', track: 'limit' },
  { type: 'gate', x: GATEX, y: 1086, scale: 0.8, z: 0.5, scene: 'cabin', track: 'gate', closeAt: 66.79 },
  { type: 'lyre', x: 520, y: 840, scale: 1.3, z: 0.3, scene: 'cabin', track: 'lyre' },
  { type: 'aconite', x: 610, y: 1096, scale: 1.0, z: 0.6, scene: 'cabin', track: 'wilt', bloomTrack: 'bloom' },
  { type: 'scratch', x: 520, y: 1070, scale: 1.2, z: 0.7, scene: 'cabin', track: 'scratch' },
  { type: 'oillamp', x: 560, y: 1000, scale: 1.0, z: 0.5, scene: 'cabin-in', track: 'lamp' },
  { type: 'latch', x: 700, y: 870, scale: 1.0, z: 0.5, scene: 'cabin-in', track: 'latch' },
  { type: 'torch', x: 640, y: 1060, scale: 1, z: 0.6, scene: 'cabin-in', xTrack: 'torchX', beamTrack: 'torchBeam' },
];
// ================================================================ 0 HOOK: freeze of the fight ("Only one head is awake")
const tWho = W('Who', 1.5), tSurv = W('survives'), tTonight = W('Tonight');
SC(0, 'cabin'); TR('door', 0, 0.01, 0);
A('b0', 'head-tilt', 0, 3.4, { x: [470, 470], flip: 1, dur: 0.01 }); A('b1', 'idle-still', 0, 3.4, { x: [562, 562], flip: 1 });
A('cb', 'fight-sleep', 0, 3.4, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
A('kw', 'peek', 0, 3.4, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
TR('limit', 0, 0.01, 1); TR('gate', 0, 0.01, 0.55);
S(0, 'ots', { side: 'left', cx: 760, cy: 880, zoom: 1.5, push: 1.2, hand: 2, rack: { fg: 8, bg: 0 } });
S(tWho, 'ecu', { actor: 'kw', at: 'eye', zoom: 3.2, dy: 6, crash: { at: tSurv, dur: 0.1, k: 1.4 }, hand: 2.5 });
tl.tints.push({ t0: 0, t1: 3.4, a: 0.28, color: '#c4121f', fadeIn: 0.1, fadeOut: 0.3 }); SH(0, 3.2, 5, true);
TX(tWho, 3.4, 'WHO SURVIVES?', 540, 520, 118, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.1 });
tl.glitch.push([2.7, 3.4]); FL(2.7, 0.1, 0.5); tl.black.push([3.4, tTonight, 1]);
TR('gate', 3.45, 3.46, 0); TR('limit', 3.45, 3.46, 0);
// ================================================================ 1 SPLIT ROLL
const lockB = W('Black-Eyed', 7.4), lockC = W('Cerberus', 9.8), tComment = W('Comment'), VSt = 12.85;
tl.splits = [{
  t0: tTonight, shatter: tComment, end: 13.7, exclude: ['blackeyed', 'cerberus'],
  zooms: [{ t0: tTonight, t1: 6.3, z0: 1.0, z1: 1.12, cx: 540, cy: 900, ease: 'lin' }, { t0: 6.3, t1: lockB, z0: 1.12, z1: 1.0, cx: 540, cy: 900 }, { t0: lockB, t1: lockB + 1.4, z0: 1.0, z1: 1.55, cx: 270, cy: 1000, ease: 'out' }, { t0: lockB + 1.4, t1: lockC, z0: 1.55, z1: 1.0, cx: 270, cy: 1000 }, { t0: lockC, t1: lockC + 1.4, z0: 1.0, z1: 1.5, cx: 810, cy: 1000, ease: 'out' }, { t0: lockC + 1.4, t1: tComment, z0: 1.5, z1: 1.0, cx: 810, cy: 1000 }],
  left: { kind: 'bec', lockT: lockB, N: 15, label: 'BLACK-EYED', nameSize: 60, subLabel: 'CHILDREN · THE KNOCKERS', fx: 0, fy: 262, fscale: 1.15, idle: 'idle-still' },
  right: { kind: 'cerberus', lockT: lockC, N: 24, label: 'CERBERUS', subLabel: 'GATEKEEPER OF HADES', fx: -34, fy: 225, fscale: 0.37, idle: 'growl' },
}, { t0: 85.4, shatter: 500, end: DUR, opaque: false, fadeIn: 0.25, left: { kind: null, lockT: 400, N: 60, label: '' }, right: { kind: null, lockT: 400, N: 60, label: '' } }];
SH(lockB, 0.5, 20); SH(lockC, 0.5, 20);
SC(tComment, 'forest'); S(tComment, 'wide', { scene: 'forest', cx: 560, cy: 930, zoom: 1.0, push: 1.1 });
FX('sparks', tComment, 270, 760, { dur: 1.7, n: 30, color: '#ff4a56', seed: 3 }); FX('sparks', tComment, 810, 760, { dur: 1.7, n: 30, color: '#ffe39a', seed: 4 }); FL(tComment, 0.25, 0.8); SH(tComment, 0.6, 14);
TX(VSt, 13.7, 'VS', 540, 800, 380, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6, fadeOut: 0.2 });
TX(VSt + 0.25, 13.7, 'WHO WINS?  COMMENT', 540, 1010, 70, { anim: 'blink', color: '#ff7a84', shadow: '#000', shadowDx: 4, shadowDy: 5, fadeOut: 0.1 });
FL(VSt, 0.2, 0.9); SH(VSt, 0.5, 26);
// ================================================================ 2 KID LOST -> CABIN -> RULES -> POWERS
const tKid = W('A'), tUntil = W('until'), tThey = W('They'), tKnock = W('knock'), tCan = W('Can', 20.7), tLegend = W('Legend', 22.5), tSo = W('So', 25.0), tLamp = W('dies'), tAnd1 = W('and', 27.17), tThen = W('Then', 29.5), tAnd2 = W('and', 30.9), tCerb = W('Cerberus', 31.1), tRises = W('rises'), tHis = W('His'), tAnd3 = W('and', 35.68), tLeg2 = W('Legend', 37.5), tThree = W('Three');
S(tKid, 'pov', { scene: 'forest', speed: 3.4, sweep: 340, lamp: 1, lampAt: 1.1 });                                                  // S6
SC(tUntil, 'cabin'); TR('door', tUntil, tUntil + 0.01, 0);
S(tUntil, 'wide', { scene: 'cabin', cx: 700, cy: 880, zoom: 1.12, push: 1.08, whip: 0.16, tr: { type: 'whip', dur: 0.26, dir: 1 } });   // S7
A('kp', 'run', tUntil, tThey - 0.3, { x: [180, 690], y: [1090, 1090], scale: [0.82, 0.8], flip: 1, speed: 2.4, ease: 'inOut' });
TR('door', tThey - 1.0, tThey - 0.4, 1, 'out'); TR('door', tThey + 0.15, tThey + 0.35, 0);
SC(tThey, 'cabin-in'); TR('lamp', 0, 0.01, 1);
S(tThey, 'wide', { scene: 'cabin-in', cx: 640, cy: 840, zoom: 1.15, push: 1.1, hand: 1.5 });                                         // S8
A('ki', 'scared-back', tThey, tThey + 0.9, { x: [680, KID_IN.x], y: [KID_IN.y, KID_IN.y], scale: KID_IN.scale, flip: 1 });
A('ki', 'cower', tThey + 0.9, tCan, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], flip: 1 });
SH(tKnock - 0.05, 0.5, 8);
A('bw0', 'no-blink-stare', tThey, tCan - 0.9, { x: [290, 290], y: [660, 660], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] }); A('bw1', 'no-blink-stare', tThey, tCan + 0.4, { x: [390, 390], y: [664, 664], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] });
S(tCan, 'ots', { scene: 'cabin-in', side: 'right', cx: 330, cy: 560, zoom: 1.5, push: 1.12, hand: 1.5, rack: { fg: 9, bg: 1 } });          // S9 OTS-KID (lamp starts to flicker)
A('bw0', 'turn-to-camera', tCan - 0.9, tCan - 0.1, { x: [290, 290], dur: 0.8 }); A('bw0', 'mimic', tCan - 0.1, tLegend, { x: [290, 290], voice: 'children', flip: 1 }); A('bw1', 'mimic', tCan, tLegend, { x: [390, 390], voice: 'children', flip: 1 });
TR('lampFlick', tCan + 0.4, tCan + 0.8, 1);
SC(tLegend, 'cabin');
A('b0', 'no-blink-stare', tLegend, tSo + 0.1, { x: [470, 470], y: [1080, 1080], scale: 0.98, flip: 1 }); A('b1', 'step', tLegend, tSo + 0.1, { x: [560, 562], y: [1084, 1084], scale: 0.98, flip: 1 });
TR('limit', tLegend + 0.5, tLegend + 1.1, 1, 'out'); TR('thresh', tLegend + 0.4, tLegend + 1.0, 1);
S(tLegend, 'insert', { scene: 'cabin', cx: 560, cy: 1040, zoom: 2.3, push: 1.1, hand: 1.2 });                                           // S10
TX(W('cannot'), tSo - 0.1, 'UNLESS INVITED', 540, 330, 84, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
TX(W('invited') + 0.2, tSo + 0.2, 'INVITE NO ONE', 540, 450, 64, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 40, py: 20 }, glow: true, fadeOut: 0.3 });
// S11 hypnotic chant: CU on a BEC with grey sound rings, S12 the lamp dies, S13 the kid's hand drifts to the latch
A('b0', 'hypno-chant', tSo, tThen, { x: [470, 470], flip: 1 }); A('b1', 'hypno-chant', tSo, tThen, { x: [562, 562], flip: 1 });
S(tSo, 'cu', { actor: 'b0', fill: 0.95, push: 1.12, hand: 1.2 });                                                                         // S11 CU-BEC
FX('ripple', tSo + 0.2, 480, 835, { dur: 1.6, r: 480, color: '#aab0c0', seed: 2 }); FX('ripple', tSo + 0.9, 480, 835, { dur: 1.6, r: 480, color: '#aab0c0', seed: 3 });
const tLampW = W('lamp', 26.2); SC(tLampW, 'cabin-in'); TR('lamp', tLamp - 0.45, tLamp + 0.2, 0, 'in'); tl.tints.push({ t0: tLamp, t1: tAnd2 + 1.5, a: 0.45, color: '#06081a', fadeIn: 0.2, fadeOut: 0.6 });
S(tLampW, 'insert', { scene: 'cabin-in', cx: 560, cy: 940, zoom: 3.0, hand: 1.2 });                                                // S12 INSERT-ĐÈN
A('ki', 'hand-drift', tAnd1 - 0.3, tThen + 0.6, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], scale: KID_IN.scale, flip: 1 });
S(tAnd1, 'insert', { scene: 'cabin-in', cx: 660, cy: 860, zoom: 2.6, hand: 1.0 });                                                       // S13 INSERT-TAY -> latch
TR('latch', W('latch') - 0.4, W('latch') + 0.4, 0.4, 'in');
S(W('latch') - 0.1, 'cu', { actor: 'ki', fill: 0.9, push: 1.06, hand: 1.0 });                                                          // CU-KID, dull eyes
A('ki', 'snap-awake', tThen + 0.6, tThen + 1.3, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], flip: 1 }); TR('latch', tThen + 0.6, tThen + 0.8, 0);
// S14 floor glows, Cerberus rises
SC(tThen + 1.3, 'cabin'); TR('gate', tThen + 1.3, tCerb - 0.1, 0.4, 'in'); TR('limit', tThen + 1.3, tThen + 1.5, 1);
S(tThen + 0.65, 'cu', { actor: 'ki', fill: 0.85, hand: 2.0 });
S(tThen + 1.3, 'insert', { scene: 'cabin', cx: 600, cy: 1010, zoom: 2.1, pan: [0, 90], hand: 1.4 });                                       // tilt-down to the glowing boards
FX('sparks', tThen + 1.5, 700, 1080, { dur: 1.8, n: 14, color: '#ff8a2a', seed: 9 });
A('cb', 'growl', tCerb, tRises + 0.1, { x: [CBX, CBX], y: [1076 + 320, 1076], clipY: 1088, flip: -1, ease: 'out' });
TR('gate', tCerb - 0.1, tCerb + 0.8, 1, 'out'); TR('gate', tRises + 0.5, tRises + 1.4, 0, 'in');
S(tAnd2, 'low', { actor: 'cb', zoom: 1.35, ground: 0.9, sy: 1.08, push: 1.12, hand: 1.5 });                                             // S14 LOW-ANGLE
TX(W('keeper'), tRises, 'KEEPER OF THE GATE OF THE DEAD', 540, 330, 50, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
SH(tCerb + 0.3, 2.4, 9, true); FX('dust', tCerb + 0.5, CBX, 1090, { dur: 1.3, n: 14, spread: 500 });
A('kw', 'hide', tRises, tHis, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
A('cb', 'block', tRises + 0.1, tHis, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
S(tRises + 0.1, 'versus', { a: 'b0', b: 'cb', zoom: 1.12, dx: 240, cy: 900, push: 1.06 });                                                 // S15 WIDE
// S16 serpent mane + tail, S17 drool withers the grass, aconite blooms
A('cb', 'snake-hiss', tHis, W('serpent') + 0.2, { x: [CBX, CBX], y: [1076, 1076], flip: -1 }); A('cb', 'tail-strike', W('serpent') + 0.2, tAnd3 + 0.1, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
S(tHis, 'ecu', { actor: 'cb', at: 'head0', zoom: 2.4, dx: -30, dy: 20, hand: 1.5 });                                                       // S16 CU-BỜM (snake mane)
S(W('serpent') - 0.3, 'ecu', { actor: 'cb', at: 'tailtip', zoom: 2.6, hand: 1.5 });                                                 // ... pan to the serpent tail
A('cb', 'venom-drool', tAnd3 + 0.1, tLeg2, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
FX('drool', W('drool') - 0.1, 610, 1035, { dur: 1.8, n: 6, h: 70 }); TR('wilt', W('withers'), W('grass') + 0.4, 1, 'inOut'); TR('bloom', W('grass') + 0.2, tLeg2 + 0.4, 1, 'out');
S(tAnd3, 'insert', { scene: 'cabin', cx: 620, cy: 1040, zoom: 2.4, push: 1.1, hand: 1.2 });                                                 // S17 INSERT-DÃI
// S18 lyre + ears
S(tLeg2, 'insert', { scene: 'cabin', cx: 520, cy: 850, zoom: 2.2, push: 1.08 }); TR('lyre', tLeg2 - 0.1, tLeg2 + 0.4, 1);
TX(W('music'), tThree - 0.1, 'MUSIC PUTS HIM TO SLEEP', 540, 330, 58, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
A('cb', 'idle', tLeg2, tThree - 0.2, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
S(W('puts'), 'ecu', { actor: 'cb', at: 'head', zoom: 2.3, hand: 1.5 });
// ================================================================ 3 THE FIGHT (no HUD, no ROUND cards)
const tSnap = W('snap'), tFly = W('fly'), tRise = W('rise'), tHum = W('humming'), tLull = W('lullaby'), tDrifts = W('drifts'), tSag = W('sag'), tAnd4 = W('and', 47.85), tFights = W('fights'), tNow = W('Now'), tSpeak = W('speak'), tCome = W('Come', 51.9), tBut2 = W('But', 53.5), tNo = W('No.'), tSong = W('song'), tBreaks = W('breaks'), tWake = W('wake'), tSeizes = W('seizes'), tAnd5 = W('and', 62.1), tSplits = W('splits'), tHe = W('He', 64.3), tDown = W('down'), tShut = W('shut'), tKO = 67.71;
S(tThree, 'wide', { scene: 'cabin', cx: 700, cy: 900, zoom: 1.12, push: 1.1 });
A('cb', 'lunge', tSnap - 0.25, tSnap + 0.9, { x: [CBX, 660], y: [1076, 1076], flip: -1, ease: 'in' });
A('b0', 'no-blink-stare', tThree, tFly, { x: [470, 470], flip: 1 }); A('b1', 'no-blink-stare', tThree, tFly, { x: [562, 562], flip: 1 });
S(tSnap - 0.1, 'ecu', { actor: 'cb', at: 'head', zoom: 2.6, crash: { at: tSnap + 0.05, dur: 0.1, k: 1.3 }, hand: 2.2 });                      // S19 ECU-HÀM
A('cb', 'bite', tSnap + 0.9, tFly + 0.6, { x: [660, 660], head: 1, flip: -1 });
A('b0', 'dragged', tFly, tFly + 0.9, { x: [470, 150], y: [1080, 1100], rot: [0, -62], flip: 1, arc: 90, ease: 'out' }); A('b1', 'dragged', tFly + 0.05, tFly + 0.95, { x: [562, 250], y: [1084, 1104], rot: [0, -50], flip: 1, arc: 70, ease: 'out' });
FL(tSnap + 0.05, 0.12, 0.8); SH(tSnap + 0.05, 1.2, 18, true); FX('dust', tFly + 0.8, 200, 1096, { dur: 1.2, n: 14, spread: 500 });
S(tFly, 'follow', { actor: 'b0', dx: 220, dy: -120, zoom: 1.2, slow: 0.5 });                                                              // S20 TRACKING slow-mo
S(tRise - 0.05, 'low', { x: 300, zoom: 1.5, ground: 0.9, sy: 1.08, hand: 1.4 });                                                          // S21 LOW-ANGLE: rise in sync
A('b0', 'idle-still', tRise, tAnd4 + 3, { x: [220, 330], y: [1090, 1080], rot: [0, 0], flip: 1, ease: 'inOut' }); A('b1', 'idle-still', tRise + 0.05, tAnd4 + 3, { x: [300, 410], y: [1094, 1084], rot: [0, 0], flip: 1, ease: 'inOut' });
A('b1', 'hum', tHum - 0.2, tNow, { x: [410, 410], flip: 1 });
A('cb', 'idle', tFly + 0.6, tDrifts + 0.6, { x: [660, 860], y: [1076, 1076], flip: -1, ease: 'inOut' });
S(tLull - 0.1, 'cu', { actor: 'b1', fill: 0.9, hand: 1.5, dy: 10 });                                                                       // S22 CU-BEC humming
FX('notes', tLull, 440, 850, { dur: 2.4, n: 8, dx: 330, dy: -110, color: '#b8bccf' }); FX('notes', tDrifts - 0.1, 480, 860, { dur: 2.0, n: 6, dx: 280, dy: -100, color: '#b8bccf', seed: 3 });
A('cb', 'sleepy', tDrifts + 0.55, tSag + 0.6, { head: 0, x: [860, 860], flip: -1 }); A('cb', 'sleepy', tSag + 0.6, tAnd4 + 0.5, { head: 1, x: [860, 860], flip: -1 }); A('cb', 'fight-sleep', tAnd4 + 0.5, tSpeak + 0.5, { x: [860, 860], flip: -1 });
S(tDrifts + 0.55, 'ecu', { actor: 'cb', at: 'head0', zoom: 2.4, push: 1.1, hand: 1.2 });                                                    // S23 left head sags ...
S(tSag + 0.4, 'ecu', { actor: 'cb', at: 'head', zoom: 2.4, push: 1.1, hand: 1.2 });                                                         // ... middle head follows
S(tAnd4, 'versus', { a: 'b0', b: 'cb', zoom: 1.2, dx: 170, cy: 930, hand: 1.2 });                                                          // S24 WIDE: knees buckle, BEC step onto the porch
A('b0', 'step', tAnd4 + 0.3, tNow, { x: [330, 410], flip: 1 }); A('b1', 'step', tAnd4 + 0.3, tNow, { x: [410, 470], flip: 1 });
S(tFights, 'ecu', { actor: 'cb', at: 'head2', zoom: 2.4, push: 1.12, hand: 1.5 });                                                         // S25 last head fights sleep
// S26-28: the kid's own voice, "Come in." must NOT look like the kid: BEC close-up, then the kid recoils; the kid answers
SC(tNow, 'cabin-in'); A('ki', 'gasp', tNow, tSpeak + 0.8, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], scale: KID_IN.scale, flip: 1 });
S(tNow, 'cu', { actor: 'ki', fill: 0.8, push: 1.1, hand: 1.5 });                                                                            // S26 REACTION-KID
SC(tSpeak + 0.8, 'cabin'); A('b0', 'mimic', tSpeak + 0.8, tBut2, { x: [410, 410], voice: 'kid_mimic', flip: 1 }); A('b1', 'mimic', tSpeak + 0.8, tBut2, { x: [470, 470], voice: 'kid_mimic', flip: 1 });
S(tSpeak + 0.8, 'cu', { actor: 'b0', fill: 0.95, whip: 0.2, hand: 1.5, tr: { type: 'whip', dur: 0.24, dir: -1 } });                          // whip -> CU-BEC mouth
SC(tCome + 0.95, 'cabin-in'); A('ki', 'shake-head', tCome + 0.95, tBut2, { x: [KID_IN.x, KID_IN.x + 20], y: [KID_IN.y, KID_IN.y], flip: 1 }); TR('torchX', tCome + 1.0, tBut2 + 0.8, 520, 'out');
S(tCome + 0.95, 'cu', { actor: 'ki', fill: 0.8, hand: 2, tr: { type: 'whip', dur: 0.2, dir: 1 } });                                         // S27 recoil, flashlight drops
A('ki', 'talk', tBut2, tNo + 4, { x: [KID_IN.x + 20, KID_IN.x + 20], y: [KID_IN.y, KID_IN.y], voice: 'kid', beam: 0.8, flip: 1 });
S(tBut2, 'cu', { actor: 'ki', fill: 0.85, push: 1.08, hand: 1.0 });                                                                          // S28 CU-KID "No."
A('bw0', 'no-blink-stare', tNo - 0.2, tSong, { x: [290, 290], y: [660, 660], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] }); A('bw1', 'no-blink-stare', tNo - 0.2, tSong, { x: [390, 390], y: [664, 664], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] });
S(tNo + 1.0, 'ots', { scene: 'cabin-in', side: 'right', cx: 330, cy: 560, zoom: 1.5, push: 1.1, hand: 1.5, rack: { fg: 9, bg: 1 } });          // OTS (hook frame)
TX(tNo + 0.1, tSong, 'INVITE NO ONE', 540, 300, 70, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 40, py: 20 }, glow: true, fadeOut: 0.3 });
SC(tSong, 'cabin'); TR('limit', tSong - 0.3, tSong - 0.2, 1);
A('b0', 'shriek', tSong, tSeizes - 0.3, { x: [400, 400], y: [1080, 1080], scale: 0.98, flip: 1 }); A('b1', 'shriek', tSong, tSeizes - 0.3, { x: [470, 470], y: [1084, 1084], scale: 0.98, flip: 1 });
A('cb', 'fight-sleep', tSong, tBreaks, { x: [860, 860], y: [1076, 1076], flip: -1 }); A('cb', 'growl', tBreaks, tSeizes - 0.4, { x: [860, 860], flip: -1, blend: 0.05 });
S(tSong, 'ecu', { actor: 'cb', at: 'head2', zoom: 2.9, push: 1.12, crash: { at: tWake, dur: 0.1, k: 1.3 }, hand: 1.2 });                          // S29 ECU-EYES, song breaks
FL(tBreaks, 0.14, 0.9); SH(tBreaks, 0.5, 14); FL(tWake, 0.12, 0.7); SH(tWake, 0.7, 16, true);
// S30 seize + tail lash (low angle), S31 the porch splits (high angle), S32 silhouette bite, S33 POV-GATE, S34 grey hand claws the planks, S35 serpent tail yanks, S36 gate slams
A('cb', 'lunge', tSeizes - 0.5, tSeizes + 0.5, { x: [860, 780], y: [1076, 1076], flip: -1, ease: 'in' }); A('cb', 'bite-hold', tSeizes + 0.5, tHe, { head: 1, x: [780, 780], y: [1076, 1076], flip: -1 });
S(tSeizes - 0.5, 'low', { actor: 'cb', zoom: 1.25, ground: 0.88, sy: 1.08, hand: 1.6, crash: { at: tSeizes + 0.4, dur: 0.1, k: 1.2 } });         // S30
A('b0', 'dragged', tSeizes + 0.3, tHe, { x: [400, 440], y: [1080, 1030], rot: [0, -8], flip: 1, mouth: 1 }); A('b1', 'dragged', tSeizes + 0.35, tHe, { x: [470, 470], y: [1084, 1030], rot: [0, -10], flip: 1, mouth: 1 });
TR('gate', tAnd5 - 0.3, W('red') + 0.6, 1, 'out'); SH(tSplits, 1.0, 20, true); FX('dust', tSplits, GATEX, 1090, { dur: 1.2, n: 16, spread: 560 }); FL(tSplits, 0.12, 0.7);
S(tAnd5, 'high', { x: 740, zoom: 1.3, sy: 0.74, ground: 0.58, hand: 1.5 });                                                                  // S31 HIGH-ANGLE: gate opens below
const SB0 = W('red', 63.2), SB1 = tHe;
S(SB0, 'versus', { a: 'b0', b: 'cb', zoom: 1.5, dx: 190, cy: 920, hand: 1.5 });                                                              // S32 SILHOUETTE-BITE
tl.tints.push({ t0: SB0 - 0.05, t1: SB1 + 0.1, a: 0.5, color: '#ff2a18', fadeIn: 0.15, fadeOut: 0.2 });
for (const n of ['b0', 'b1', 'cb']) A(n, 'idle', SB0, SB1 + 0.1, { sil: [1, 1] });
FL(SB1 - 0.15, 0.1, 1.0); FX('smoke', SB1 - 0.15, 560, 960, { dur: 3.0, n: 14, spread: 160, dark: true, seed: 2 });
A('cb', 'drag-down', SB1 + 0.1, tDown, { head: 1, x: [780, 820], y: [1076, 1076], flip: -1, speed: 0.8, sil: [0, 0] });
A('b0', 'dragged', SB1 + 0.1, tDown, { x: [440, 560], y: [1030, 1060], rot: [0, 0], flip: 1, mouth: 1, sil: [0, 0] });
S(tHe, 'povgate', {});                                                                                                                         // S33 POV-GATE
TR('scratch', tDown - 0.15, tDown + 0.5, 1, 'lin');
A('b1', 'claw-planks', tDown - 0.25, tDown + 0.65, { x: [470, 530], y: [1084, 1090], flip: 1, dur: 0.9, sil: [0, 0] });
S(tDown - 0.15, 'ecu', { actor: 'b1', at: 'handR', zoom: 2.6, hand: 3.0, dy: 10 });                                                          // S34 ECU-TAY: grey hand clawing the planks
A('cb', 'tail-coil', tDown, tShut - 0.6, { x: [820, 820], y: [1076, 1076], flip: -1 });
S(tDown + 0.5, 'ecu', { actor: 'cb', at: 'tailtip', zoom: 2.4, hand: 2.5, crash: { at: tDown + 0.9, dur: 0.1, k: 1.25 } });            // S35 CU-ĐUÔI RẮN: coil + yank
A('b0', 'dissolve-smoke', tDown - 0.2, tShut - 0.2, { x: [560, 560], y: [1060, 1120], clipY: 1096, flip: 1, alpha: [1, 0] }); A('b1', 'dissolve-smoke', tDown + 0.45, tShut + 0.1, { x: [530, 540], y: [1090, 1140], clipY: 1096, flip: 1, alpha: [1, 0] });
FX('smoke', tHe + 0.4, 560, 1040, { dur: 3.0, n: 14, spread: 200, dark: true, seed: 5 });
S(W('and', 65.9), 'wide', { scene: 'cabin', cx: 780, cy: 900, zoom: 1.15, push: 1.06 });                                                      // S36 WIDE: gate slams shut, scratches remain
FL(tShut, 0.15, 0.9); SH(tShut, 0.9, 30);
// ================================================================ K.O. + DAWN + FINAL LINES
FL(tKO, 0.12, 1.0); SH(tKO, 0.5, 20);
TX(tKO, 69.0, 'K.O.', 540, 560, 250, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 14, shadowDy: 16, fadeOut: 0.4 });
TX(tKO + 0.4, 69.0, 'WINNER: CERBERUS', 540, 760, 60, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ffd98a', sw: 5, rx: 14, px: 40, py: 18 }, fadeOut: 0.3 });
A('cb', 'wounded', tShut - 0.5, 70.0, { x: [820, 860], y: [1076, 1076], flip: -1 });
A('kw', 'peek', tShut, 69.6, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
S(tKO - 0.1, 'low', { actor: 'cb', zoom: 1.2, ground: 0.88, sy: 1.08, hand: 1.0 });                                                          // S37 LOW-ANGLE
const tDawn = W('dawn'), tTurns = W('turns'), tNever = W('Never'), tIwont = W('I'), tBut3 = W('But', 76.4);
TR('dawn', tDawn, tDawn + 2.4, 1, 'inOut'); TR('bells', tDawn + 0.4, tDawn + 0.5, 1); TR('door', tTurns - 0.4, tTurns + 0.4, 1);
S(tDawn - 0.2, 'wide', { scene: 'cabin', cx: 740, cy: 900, zoom: 1.12, pan: [0, -150], push: 1.0 });                                          // S38
A('cb', 'idle', 70.0, tNever, { x: [860, 900], y: [1076, 1076], flip: -1, ease: 'out' });
A('kp', 'walk', tTurns, tNever, { x: [700, 430], y: [1080, 1082], scale: [0.7, 0.76], flip: 1, speed: 0.8 });
A('cb', 'talk', tNever, tIwont - 0.1, { x: [900, 900], y: [1076, 1076], flip: -1, voice: 'cerberus' });
S(tNever, 'ecu', { actor: 'cb', at: 'head', zoom: 2.3, push: 1.06, hand: 1.0 });                                                              // S39 CU-CERB talk
A('kp', 'talk', tIwont - 0.05, tBut3, { x: [430, 430], y: [1082, 1082], voice: 'kid', beam: 0.4, look: 0.2, flip: 1 });
S(tIwont - 0.05, 'cu', { actor: 'kp', fill: 0.85, push: 1.06, hand: 1.0 });                                                                   // S40 CU-KID "I won't."
// ================================================================ CLIFFHANGER (bedroom) + CTA
const tKnock2 = 81.08, tCan2 = W('Can', 82.2), tDid = W('Did'), tWhos = W("Who's");
SC(tBut3, 'room'); TR('dawn', tBut3 - 0.02, tBut3, 0);
S(tBut3, 'high', { scene: 'room', actor: 'ki', zoom: 1.35, sy: 0.78, ground: 0.58, push: 1.1, hand: 1.5, tr: { type: 'fade', dur: 0.45 } });  // S41
A('ki', 'in-bed', tBut3, tKnock2 + 0.2, { x: [520, 520], y: [962, 962], scale: 1.25, flip: -1 });
TR('vent', W('red', 77.4), W('red', 77.4) + 1.2, 1, 'inOut');
S(W('Then', 79.7), 'wide', { cx: 560, cy: 900, zoom: 1.2, hand: 1.2 });                                                                          // S42
S(tKnock2 - 0.05, 'insert', { cx: 560, cy: 900, zoom: 1.2, pan: [-290, -380], push: 1.35, hand: 1.0 }); SH(tKnock2, 0.3, 7);
A('ki', 'bed-turn', tKnock2 + 0.2, tCan2 + 1.0, { x: [520, 520], y: [962, 962], flip: -1, scale: 1.25 });
A('rw0', 'no-blink-stare', tCan2 - 0.6, 83.6, { x: [190, 190], y: [745, 745], scale: 0.9, flip: 1 }); A('rw1', 'head-tilt', tCan2 - 0.6, 83.6, { x: [330, 330], y: [749, 749], scale: 0.9, flip: 1, dur: 0.8 });
S(tCan2 - 0.05, 'insert', { cx: 300, cy: 560, zoom: 2.3, hand: 1.0 });                                                                            // S43 CU-WINDOW
TR('winBreath', tCan2, tCan2 + 0.3, 0.0); tl.black.push([83.6, tDid + 0.2, 1]);
tl.black.push([tDid + 0.2, tWhos, 0.5]);
TX(tDid, tWhos, 'DID HELL REALLY\nKEEP THEM?', 540, 520, 80, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.2 });
S(tDid + 0.1, 'insert', { cx: 640, cy: 1100, zoom: 2.0, hand: 1.5 });
TX(tWhos, DUR, "WHO'S NEXT?", 540, 1120, 112, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 10, shadowDy: 12, fadeOut: 0.0001 });
TX(tWhos + 0.5, DUR, 'FOLLOW', 540, 960, 66, { anim: 'pop', color: '#fff', bg: { fill: '#c4121f', stroke: '#fff', sw: 4, rx: 40, px: 70, py: 22 }, fadeOut: 0.0001 });
S(tWhos, 'wide', { cx: 540, cy: 960, zoom: 1.0 });                                                                                             // S44
tl.splits[1].t0 = tWhos - 0.1;
tl.cam.sort((a, b) => a.t0 - b.t0); tl.shots.sort((a, b) => a.t - b.t); tl.scenes.sort((a, b) => a.t0 - b.t0); for (const k in tl.tracks) tl.tracks[k].sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(tl));
console.log('timeline.json: shots', tl.shots.length, 'cues', tl.cues.length, 'fx', tl.fx.length, 'dur', tl.duration);
