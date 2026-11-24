// Full cinematic episode #002 (script-anim.md v2/v1.1): BLACK-EYED CHILDREN vs CERBERUS (ending A: Cerberus wins). Shots + cues keyed to audio-anim/words.json.
const fs = require('fs'), path = require('path');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/words.json'), 'utf8'));
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']/g, '');
const W = (w, near) => { const c = words.filter((x) => norm(x.word) === norm(w)); if (!c.length) throw new Error('no word ' + w); if (near === undefined) return c[0].start; return c.reduce((a, b) => (Math.abs(b.start - near) < Math.abs(a.start - near) ? b : a)).start; };
const DUR = 97.0;
const tl = { fps: 30, duration: DUR, holeX: 130, sides: { left: 'b0', right: 'cb' }, mirror: [], camInit: { cx: 700, cy: 880, zoom: 1.1 }, tracks: {}, cues: [], cam: [], shots: [], shake: [], flash: [], fx: [], text: [], scenes: [], black: [], tints: [], glitch: [], knocks: [20.17, 90.1], freeze: [], slow: [] };
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
// ---- layout (cabin cross-section): porch + door (x 605-795) centre, BEC on the porch at the LEFT, Cerberus blocks the door from the RIGHT, kid in the window right of the door
const CBX = 940, GATEX = 800, WIN = [880, 690, 160, 200], KIDW = { x: 960, y: 905, scale: 0.62 };
tl.actors = {
  kw: { kind: 'kid', x: KIDW.x, y: KIDW.y, scale: KIDW.scale, flip: -1, z: 0, scenes: ['cabin'], vis: [[0, 3.4], [26.0, 85.3]] },            // kid seen in the window right of the door
  kp: { kind: 'kid', x: 200, y: 1090, scale: 0.8, flip: 1, z: 1, scenes: ['cabin'], vis: [[15.9, 18.8], [78.8, 85.3]] },                      // kid on the porch (arrives / dawn)
  ki: { kind: 'kid', x: 800, y: 1062, scale: 0.9, flip: 1, z: 1, scenes: ['cabin-in', 'room'], vis: [[18.7, 27.9], [55.9, 65.6], [85.19, 92.5]] },  // kid inside (cabin / bedroom)
  b0: { kind: 'bec', variant: 0, x: 470, y: 1080, scale: 0.98, flip: 1, z: 2, scenes: ['cabin'], vis: [[0, 3.4], [23.5, 77.0]] },
  b1: { kind: 'bec', variant: 1, x: 560, y: 1084, scale: 0.98, flip: 1, z: 2, scenes: ['cabin'], vis: [[0, 3.4], [23.5, 77.0]] },
  bw0: { kind: 'bec', variant: 0, x: 290, y: 660, scale: 0.62, flip: 1, z: 1, scenes: ['cabin-in'], vis: [[18.7, 27.9], [61.0, 65.6]] },        // BEC behind the interior window glass
  bw1: { kind: 'bec', variant: 1, x: 390, y: 664, scale: 0.62, flip: 1, z: 1, scenes: ['cabin-in'], vis: [[18.7, 27.9], [61.0, 65.6]] },
  rw0: { kind: 'bec', variant: 0, x: 190, y: 745, scale: 0.9, flip: 1, z: 1, scenes: ['room'], vis: [[90.9, 92.5]] },                              // BEC behind the bedroom window
  rw1: { kind: 'bec', variant: 1, x: 330, y: 749, scale: 0.9, flip: 1, z: 1, scenes: ['room'], vis: [[90.9, 92.5]] },
  cb: { kind: 'cerberus', x: CBX, y: 1076, scale: 0.68, flip: -1, z: 3, scenes: ['cabin'], vis: [[0, 3.4], [29.6, 85.3]] },
};
tl.props = [
  { type: 'limit', x: 600, y: 1090, scale: 1, z: 0.4, scene: 'cabin', track: 'limit' },
  { type: 'gate', x: GATEX, y: 1086, scale: 0.8, z: 0.5, scene: 'cabin', track: 'gate', closeAt: 75.11 },
  { type: 'lyre', x: 520, y: 840, scale: 1.3, z: 0.3, scene: 'cabin', track: 'lyre' },
  { type: 'torch', x: 700, y: 1060, scale: 1, z: 0.6, scene: 'cabin-in', xTrack: 'torchX', beamTrack: 'torchBeam' },
];
const KID_IN = { x: 800, y: 1062, scale: 0.9 };
// ================================================================ 0 HOOK: freeze of round 2 ("Only one head is awake")
const tOnly = W('Only', 0), tWho = W('Who', 1.5), tSurv = W('survives'), tTonight = W('Tonight');
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
const lockB = W('Black-Eyed', 7.7), lockC = W('Cerberus', 10.3), tComment = W('Comment'), VSt = 13.46;
tl.splits = [{
  t0: tTonight, shatter: tComment, end: 14.3, exclude: ['blackeyed', 'cerberus'],
  zooms: [{ t0: tTonight, t1: 6.5, z0: 1.0, z1: 1.12, cx: 540, cy: 900, ease: 'lin' }, { t0: 6.5, t1: lockB, z0: 1.12, z1: 1.0, cx: 540, cy: 900 }, { t0: lockB, t1: lockB + 1.5, z0: 1.0, z1: 1.55, cx: 270, cy: 1000, ease: 'out' }, { t0: lockB + 1.5, t1: lockC, z0: 1.55, z1: 1.0, cx: 270, cy: 1000 }, { t0: lockC, t1: lockC + 1.5, z0: 1.0, z1: 1.5, cx: 810, cy: 1000, ease: 'out' }, { t0: lockC + 1.5, t1: tComment, z0: 1.5, z1: 1.0, cx: 810, cy: 1000 }],
  left: { kind: 'bec', lockT: lockB, N: 16, label: 'BLACK-EYED', nameSize: 60, subLabel: 'CHILDREN · THE KNOCKERS', fx: 0, fy: 262, fscale: 1.15, idle: 'idle-still' },
  right: { kind: 'cerberus', lockT: lockC, N: 28, label: 'CERBERUS', subLabel: 'GATEKEEPER OF HADES', fx: -34, fy: 225, fscale: 0.37, idle: 'growl' },
}, { t0: 94.5, shatter: 500, end: DUR, opaque: false, fadeIn: 0.25, left: { kind: null, lockT: 400, N: 60, label: '' }, right: { kind: null, lockT: 400, N: 60, label: '' } }];
SH(lockB, 0.5, 20); SH(lockC, 0.5, 20);
SC(tComment, 'forest'); S(tComment, 'wide', { scene: 'forest', cx: 560, cy: 930, zoom: 1.0, push: 1.1 });
FX('sparks', tComment, 270, 760, { dur: 1.7, n: 30, color: '#ff4a56', seed: 3 }); FX('sparks', tComment, 810, 760, { dur: 1.7, n: 30, color: '#ffe39a', seed: 4 }); FL(tComment, 0.25, 0.8); SH(tComment, 0.6, 14);
TX(VSt, 14.3, 'VS', 540, 800, 380, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6, fadeOut: 0.2 });
TX(VSt + 0.25, 14.3, 'WHO WINS?  COMMENT', 540, 1010, 70, { anim: 'blink', color: '#ff7a84', shadow: '#000', shadowDx: 4, shadowDy: 5, fadeOut: 0.1 });
FL(VSt, 0.2, 0.9); SH(VSt, 0.5, 26);
// ================================================================ 2 KID LOST -> CABIN -> RULES
const tKid = W('A'), tUntil = W('until'), tThey = W('They'), tKnock = W('knock'), tCan = W('Can', 21.7), tLegend = W('Legend', 23.5), tSo = W('So'), tBut = W('but', 27.9), tCerb = W('Cerberus', 29.8), tAnd1 = W('and', 33.3), tLeg2 = W('Legend', 34.7);
S(tKid, 'pov', { scene: 'forest', speed: 3.4, sweep: 340, lamp: 1, lampAt: 1.3 });                                                 // S6
SC(tUntil, 'cabin'); TR('door', tUntil, tUntil + 0.01, 0);
S(tUntil, 'wide', { scene: 'cabin', cx: 700, cy: 880, zoom: 1.12, push: 1.08, whip: 0.16, tr: { type: 'whip', dur: 0.26, dir: 1 } });   // S7 WIDE cabin
A('kp', 'run', tUntil, tThey - 0.3, { x: [180, 690], y: [1090, 1090], scale: [0.82, 0.8], flip: 1, speed: 2.4, ease: 'inOut' });
TR('door', tThey - 1.0, tThey - 0.4, 1, 'out'); TR('door', tThey + 0.15, tThey + 0.35, 0);
// interior: kid slips in, shuts the door, back against it; knock
SC(tThey, 'cabin-in');
S(tThey, 'wide', { scene: 'cabin-in', cx: 640, cy: 840, zoom: 1.15, push: 1.1, hand: 1.5 });                                         // S8 MEDIUM
A('ki', 'scared-back', tThey, tThey + 0.9, { x: [680, KID_IN.x], y: [KID_IN.y, KID_IN.y], scale: KID_IN.scale, flip: 1 });
A('ki', 'cower', tThey + 0.9, tCan, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], flip: 1 });
SH(tKnock - 0.05, 0.5, 8);
// BEC behind the interior window glass
A('bw0', 'idle-still', tThey, tCan - 0.9, { x: [290, 290], y: [660, 660], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] }); A('bw1', 'idle-still', tThey, tCan + 0.4, { x: [390, 390], y: [664, 664], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] });
S(tCan, 'ots', { scene: 'cabin-in', side: 'right', cx: 330, cy: 560, zoom: 1.5, push: 1.12, hand: 1.5, rack: { fg: 9, bg: 1 } });          // S9 OTS-KID
A('bw0', 'turn-to-camera', tCan - 0.9, tCan - 0.1, { x: [290, 290], dur: 0.8 }); A('bw0', 'mimic', tCan - 0.1, tLegend, { x: [290, 290], voice: 'children', flip: 1 }); A('bw1', 'mimic', tCan, tLegend, { x: [390, 390], voice: 'children', flip: 1 });
// threshold insert
SC(tLegend, 'cabin');
A('b0', 'idle-still', tLegend, tSo + 2, { x: [470, 470], y: [1080, 1080], scale: 0.98, flip: 1 }); A('b1', 'step', tLegend, tSo + 2, { x: [560, 562], y: [1084, 1084], scale: 0.98, flip: 1 });
TR('limit', tLegend + 0.5, tLegend + 1.1, 1, 'out'); TR('thresh', tLegend + 0.4, tLegend + 1.0, 1);
S(tLegend, 'insert', { scene: 'cabin', cx: 560, cy: 1040, zoom: 2.3, push: 1.1, hand: 1.2 });                                            // S10 INSERT-NGƯỠNG
TX(W('cannot'), tSo - 0.1, 'UNLESS INVITED', 540, 330, 84, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
TX(W('invited') + 0.2, tSo + 0.3, 'INVITE NO ONE', 540, 450, 64, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 40, py: 20 }, glow: true, fadeOut: 0.3 });
// kid reaction, then the floor starts to glow
SC(tSo, 'cabin-in'); A('ki', 'gasp', tSo, tBut, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], flip: 1 });
S(tSo, 'cu', { actor: 'ki', fill: 0.8, push: 1.08, hand: 1.5 });                                                                       // S11 REACTION-KID
SC(tBut, 'cabin'); TR('gate', tBut, tCerb - 0.1, 0.4, 'in'); TR('limit', tBut, tBut + 0.2, 1);
A('kw', 'hide', tBut, tAnd1 - 0.2, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
S(tBut, 'insert', { scene: 'cabin', cx: 600, cy: 1010, zoom: 2.1, pan: [0, 90], hand: 1.4 });                                         // tilt-down to the glowing boards
FX('sparks', tBut + 0.5, 700, 1080, { dur: 1.8, n: 14, color: '#ff8a2a', seed: 9 });
// Cerberus climbs out of the boards (low angle), then blocks the door
A('cb', 'growl', tCerb, tAnd1, { x: [CBX, CBX], y: [1076 + 320, 1076], clipY: 1088, flip: -1, ease: 'out' });
TR('gate', tCerb - 0.1, tCerb + 0.8, 1, 'out'); TR('gate', tAnd1 + 0.3, tAnd1 + 1.4, 0, 'in');
S(tCerb, 'low', { actor: 'cb', zoom: 1.35, ground: 0.9, sy: 1.08, push: 1.12, hand: 1.5 });                                             // S12 LOW-ANGLE
TX(tCerb + 0.9, tAnd1 - 0.1, 'KEEPS THE GATE OF THE DEAD', 540, 330, 56, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
SH(tCerb + 0.3, 2.4, 9, true); FX('dust', tCerb + 0.5, CBX, 1090, { dur: 1.3, n: 14, spread: 500 });
A('kw', 'peek', tAnd1 - 0.2, tLeg2, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
S(tAnd1, 'versus', { a: 'b0', b: 'cb', zoom: 1.12, dx: 240, cy: 900, push: 1.06 });                                                      // S13 VERSUS WIDE
A('cb', 'block', tAnd1, tLeg2, { x: [CBX, CBX], y: [1076, 1076], flip: -1 });
// music puts him to sleep: lyre + ears
S(tLeg2, 'insert', { scene: 'cabin', cx: 520, cy: 850, zoom: 2.2, push: 1.08 }); TR('lyre', tLeg2 - 0.1, tLeg2 + 0.4, 1);                  // S14 INSERT-LYRE
TX(W('music'), W('Round', 37.6) - 0.1, 'MUSIC PUTS HIM TO SLEEP', 540, 330, 58, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.3 });
S(W('puts'), 'ecu', { actor: 'cb', at: 'head', zoom: 2.3, hand: 1.5 });
// ================================================================ 3 ROUND 1
const tR1 = W('Round', 37.6), tSnap = W('snap'), tHurl = W('hurl'), tRise = W('rise'), tHum = W('hum'), tR2 = W('Round', 44.5);
TX(tR1, tR1 + 1.3, 'ROUND 1', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
S(tR1, 'versus', { a: 'b0', b: 'cb', zoom: 1.1, dx: 220, cy: 900 });                                                                      // S15 VERSUS WIDE
A('cb', 'lunge', tSnap - 0.2, tSnap + 0.9, { x: [CBX, 660], y: [1076, 1076], flip: -1, ease: 'in' });
A('b0', 'idle-still', tR1, tHurl, { x: [470, 470], flip: 1 }); A('b1', 'idle-still', tR1, tHurl, { x: [562, 562], flip: 1 });
S(tSnap + 0.55, 'ecu', { actor: 'cb', at: 'head', zoom: 2.6, crash: { at: tSnap + 0.62, dur: 0.1, k: 1.3 }, hand: 2.2 });
A('cb', 'bite', tSnap + 0.9, tHurl + 0.5, { x: [660, 660], head: 1, flip: -1 });
A('b0', 'dragged', tHurl, tHurl + 0.9, { x: [470, 150], y: [1080, 1100], rot: [0, -62], flip: 1, arc: 90, ease: 'out' }); A('b1', 'dragged', tHurl + 0.05, tHurl + 0.95, { x: [562, 250], y: [1084, 1104], rot: [0, -50], flip: 1, arc: 70, ease: 'out' });
FL(tSnap + 0.62, 0.12, 0.8); SH(tSnap + 0.62, 1.2, 18, true); FX('dust', tHurl + 0.8, 200, 1096, { dur: 1.2, n: 14, spread: 500 });
S(tRise - 0.2, 'versus', { a: 'b0', b: 'cb', zoom: 1.35, dx: 100, cy: 930, hand: 1.5 });                                                    // S16 MEDIUM VERSUS (BEC rise + hum)
A('b0', 'idle-still', tRise, tR2, { x: [220, 360], y: [1090, 1080], rot: [0, 0], flip: 1, ease: 'inOut' }); A('b1', 'idle-still', tRise + 0.05, tR2, { x: [300, 440], y: [1094, 1084], rot: [0, 0], flip: 1, ease: 'inOut' });
A('b1', 'hum', tHum - 0.2, tR2 + 6, { x: [440, 440], flip: 1 });
A('cb', 'idle', tHurl + 0.5, tR2 + 0.2, { x: [660, 860], y: [1076, 1076], flip: -1, ease: 'inOut' });
// ================================================================ 4 ROUND 2 (lullaby: heads fall asleep one by one)
const tLull = W('lullaby'), tAnd2 = W('and', 46.85), tSags = W('sags'), tThen = W('Then', 48.6), tAnd3 = W('and', 49.95), tOnly2 = W('Only', 52.1), tAnd4 = W('and', 53.88), tR3 = W('Round', 55.9);
TX(tR2, tR2 + 1.3, 'ROUND 2', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
A('b0', 'idle-still', tR2, tAnd4, { x: [330, 330], flip: 1 }); A('b1', 'hum', tR2, tAnd4, { x: [410, 410], flip: 1 });
A('cb', 'sleepy', tLull + 0.9, tThen, { head: 0, x: [860, 860], flip: -1 }); A('cb', 'sleepy', tThen, tAnd3 + 0.4, { head: 1, x: [860, 860], flip: -1 }); A('cb', 'fight-sleep', tAnd3 + 0.4, tR3 + 0.1, { x: [860, 860], flip: -1 });
FX('notes', tLull, 440, 850, { dur: 2.6, n: 8, dx: 330, dy: -110, color: '#b8bccf' }); FX('notes', tThen - 0.2, 480, 860, { dur: 2.2, n: 6, dx: 280, dy: -100, color: '#b8bccf', seed: 3 });
S(tR2, 'cu', { actor: 'b1', fill: 0.9, hand: 1.5, whip: 0.2, dy: 10 });                                                                    // S17 TRACKING CU: from the humming mouth ...
S(tAnd2, 'ecu', { actor: 'cb', at: 'head0', zoom: 2.4, push: 1.1, hand: 1.2 });                                                         // ... to the left head
S(tThen, 'ecu', { actor: 'cb', at: 'head', zoom: 2.4, push: 1.1, hand: 1.2 });                                                          // S18 CU middle head
S(tAnd3, 'versus', { a: 'b0', b: 'cb', zoom: 1.2, dx: 170, cy: 930, hand: 1.2 });                                                          // S19 VERSUS WIDE (Cerberus kneels)
S(tOnly2, 'ecu', { actor: 'cb', at: 'head2', zoom: 2.4, push: 1.12, hand: 1.5 });                                                       // S20 last head fights sleep
S(tAnd4, 'versus', { a: 'b0', b: 'cb', zoom: 1.12, dx: 220, cy: 900 });                                                                   // pull-back: the children step closer
A('b0', 'step', tAnd4, tR3, { x: [330, 400], flip: 1 }); A('b1', 'step', tAnd4, tR3, { x: [410, 470], flip: 1 });
tl.hudL = [{ t0: tSnap + 0.9, t1: tSnap + 1.6, v: 0.6 }, { t0: 70.5, t1: 71.2, v: 0.30 }, { t0: 73.8, t1: 74.6, v: 0 }];
tl.hudR = [{ t0: tSags - 0.9, t1: tSags - 0.1, v: 0.65 }, { t0: tAnd3 - 0.5, t1: tAnd3 + 0.2, v: 0.35 }];
// ================================================================ 5 ROUND 3 (the kid answers, the song breaks, three heads wake)
const tSpeak = W('speak'), tCome = W('Come', 59.4), tBut2 = W('But', 61.0), tNo = W('No.'), tSong = W('song'), tBreaks = W('breaks'), tWake = W('wake'), tSeizes = W('seizes'), tAnd5 = W('and', 69.9), tSplits = W('splits'), tHe = W('He'), tDrags = W('drags'), tShut = W('shut'), tKO = 76.06;
TX(tR3, tR3 + 1.3, 'ROUND 3', 540, 560, 150, { anim: 'slam', bg: CARD, color: '#fff', fadeOut: 0.2 });
SC(tR3, 'cabin-in'); A('ki', 'gasp', tR3, tCome, { x: [KID_IN.x, KID_IN.x], y: [KID_IN.y, KID_IN.y], scale: KID_IN.scale, flip: 1 });
S(tR3, 'cu', { actor: 'ki', fill: 0.8, push: 1.1, hand: 1.5 });                                                                            // S21 REACTION-KID
SC(tSpeak, 'cabin'); A('b0', 'mimic', tSpeak, tBut2, { x: [400, 400], voice: 'kid_mimic', flip: 1 }); A('b1', 'mimic', tSpeak, tBut2, { x: [470, 470], voice: 'kid_mimic', flip: 1 });
S(tSpeak, 'cu', { actor: 'b0', fill: 0.95, whip: 0.2, hand: 1.5, tr: { type: 'whip', dur: 0.24, dir: -1 } });                                // whip -> CU-BEC mouths
SC(tCome + 0.4, 'cabin-in'); A('ki', 'scared-back', tCome + 0.3, tBut2, { x: [KID_IN.x, KID_IN.x + 40], y: [KID_IN.y, KID_IN.y], flip: 1 }); TR('torchX', tCome + 0.4, tBut2 + 0.8, 520, 'out');
S(tCome + 0.3, 'cu', { actor: 'ki', fill: 0.8, hand: 2, tr: { type: 'whip', dur: 0.2, dir: 1 } });                                        // S22 recoil, flashlight drops
A('ki', 'talk', tBut2, tNo + 4, { x: [KID_IN.x + 40, KID_IN.x + 40], y: [KID_IN.y, KID_IN.y], voice: 'kid', beam: 0.8, flip: 1 });
S(tBut2, 'cu', { actor: 'ki', fill: 0.85, push: 1.08, hand: 1.0 });                                                                          // S23 CU-KID "No."
SC(tNo + 1.0, 'cabin-in'); A('bw0', 'idle-still', tNo - 0.2, tSong, { x: [290, 290], y: [660, 660], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] }); A('bw1', 'idle-still', tNo - 0.2, tSong, { x: [390, 390], y: [664, 664], scale: 0.62, flip: 1, clipRect: [214, 344, 232, 302] });
S(tNo + 1.0, 'ots', { scene: 'cabin-in', side: 'right', cx: 330, cy: 560, zoom: 1.5, push: 1.1, hand: 1.5, rack: { fg: 9, bg: 1 } });          // S23b OTS (kid answers)
TX(tNo + 0.1, tSong, 'INVITE NO ONE', 540, 300, 70, { anim: 'slam', color: '#ff7a84', bg: { fill: '#2a2f44', stroke: '#8a909e', sw: 6, rx: 14, px: 40, py: 20 }, glow: true, fadeOut: 0.3 });
SC(tSong, 'cabin'); TR('limit', tSong - 0.3, tSong - 0.2, 1);
A('b0', 'shriek', tSong, tSeizes - 0.3, { x: [400, 400], y: [1080, 1080], scale: 0.98, flip: 1 }); A('b1', 'shriek', tSong, tSeizes - 0.3, { x: [470, 470], y: [1084, 1084], scale: 0.98, flip: 1 });
A('cb', 'fight-sleep', tSong, tBreaks, { x: [860, 860], y: [1076, 1076], flip: -1 }); A('cb', 'growl', tBreaks, tSeizes - 0.4, { x: [860, 860], flip: -1, blend: 0.05 });
S(tSong, 'ecu', { actor: 'cb', at: 'head2', zoom: 2.9, push: 1.12, crash: { at: tWake, dur: 0.1, k: 1.3 }, hand: 1.2 });                     // S24 ECU-EYES, song breaks
FL(tBreaks, 0.14, 0.9); SH(tBreaks, 0.5, 14); FL(tWake, 0.12, 0.7); SH(tWake, 0.7, 16, true);
tl.hudR.push({ t0: tWake, t1: tWake + 0.4, v: 0.35 });
A('cb', 'lunge', tSeizes - 0.4, tSeizes + 0.6, { x: [860, 780], y: [1076, 1076], flip: -1, ease: 'in' }); A('cb', 'bite-hold', tSeizes + 0.6, tDrags, { head: 1, x: [780, 780], y: [1076, 1076], flip: -1 });
S(tSeizes - 0.3, 'versus', { a: 'b0', b: 'cb', zoom: 1.12, dx: 200, cy: 900 });                                                              // S25 VERSUS WIDE: Cerberus seizes them
A('b0', 'dragged', tSeizes + 0.4, tDrags, { x: [400, 440], y: [1080, 1030], rot: [0, -8], flip: 1, mouth: 1 }); A('b1', 'dragged', tSeizes + 0.45, tDrags, { x: [470, 470], y: [1084, 1030], rot: [0, -10], flip: 1, mouth: 1 });
TR('gate', tAnd5 - 0.3, tSplits + 0.9, 1, 'out'); SH(tSplits, 1.0, 20, true); FX('dust', tSplits, GATEX, 1090, { dur: 1.2, n: 16, spread: 560 }); FL(tSplits, 0.12, 0.7);
// silhouette bite (backlit by the red gate), black smoke, no detail
const SB0 = tAnd5, SB1 = tDrags + 0.1;
S(SB0, 'versus', { a: 'b0', b: 'cb', zoom: 1.5, dx: 190, cy: 920, hand: 1.5 });                                                              // S26 SILHOUETTE-BITE
for (const n of ['b0', 'b1', 'cb']) A(n, 'idle', SB0 + 0.2, SB0 + 0.21, {});
tl.tints.push({ t0: SB0 + 0.1, t1: SB1 + 0.3, a: 0.5, color: '#ff2a18', fadeIn: 0.2, fadeOut: 0.3 });
FL(SB1 - 0.3, 0.1, 1.0); FX('smoke', SB1 - 0.3, 560, 960, { dur: 3.2, n: 14, spread: 160, dark: true, seed: 2 });
tl.hudL.push({ t0: SB0 + 0.4, t1: SB0 + 1.1, v: 0.30 });
// drag down into the gate (slow-mo high angle), children dissolve into black smoke, gate slams shut
A('cb', 'drag-down', tDrags, tShut, { head: 1, x: [780, 840], y: [1076, 1076], flip: -1, speed: 0.8 });
A('b0', 'dragged', tDrags, tShut, { x: [440, 560], y: [1030, 1060], rot: [0, 0], flip: 1, mouth: 1 }); A('b1', 'dragged', tDrags, tShut, { x: [470, 580], y: [1030, 1064], rot: [0, 0], flip: 1, mouth: 1 });
A('b0', 'dissolve-smoke', tDrags + 1.0, tShut + 0.15, { x: [560, 560], y: [1060, 1140], clipY: 1096, flip: 1, alpha: [1, 0] }); A('b1', 'dissolve-smoke', tDrags + 1.1, tShut + 0.15, { x: [580, 580], y: [1064, 1146], clipY: 1096, flip: 1, alpha: [1, 0] });
FX('smoke', tDrags + 1.0, 570, 1050, { dur: 3.4, n: 16, spread: 200, dark: true, seed: 5 });
S(tDrags, 'high', { x: 640, zoom: 1.35, sy: 0.74, ground: 0.58, slow: 0.55 });                                                              // S27 HIGH-ANGLE slow-mo
tl.hudL.push({ t0: tDrags + 1.0, t1: tDrags + 1.7, v: 0 }); FL(tShut, 0.15, 0.9); SH(tShut, 0.9, 30);
// ================================================================ 6 K.O.
FL(tKO, 0.12, 1.0); SH(tKO, 0.5, 20);
TX(tKO, 77.8, 'K.O.', 540, 560, 250, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 14, shadowDy: 16, fadeOut: 0.4 });
TX(tKO + 0.4, 77.8, 'WINNER: CERBERUS', 540, 760, 60, { anim: 'pop', bg: { fill: '#14182e', stroke: '#ffd98a', sw: 5, rx: 14, px: 40, py: 18 }, fadeOut: 0.3 });
A('cb', 'wounded', tShut + 0.1, 78.8, { x: [800, 840], y: [1076, 1076], flip: -1 });
A('kw', 'peek', tShut, 79.2, { x: [KIDW.x, KIDW.x], y: [KIDW.y, KIDW.y], scale: KIDW.scale, flip: -1, clipRect: WIN });
S(tKO, 'wide', { scene: 'cabin', cx: 740, cy: 880, zoom: 1.15, push: 1.1 });                                                                // S28 WIDE-ESTABLISH
// ================================================================ 7 DAWN + FINAL LINES
const tDawn = W('dawn'), tTurns = W('turns'), tNever = W('Never'), tIwont = W('I'), tBut3 = W('But', 85.1);
TR('dawn', tDawn, tDawn + 2.4, 1, 'inOut'); TR('bells', tDawn + 0.4, tDawn + 0.5, 1); TR('door', tTurns - 0.4, tTurns + 0.4, 1);
S(tDawn, 'wide', { cx: 740, cy: 900, zoom: 1.12, pan: [0, -150], push: 1.0 });                                                                 // S29 tilt-up to the dawn sky
A('cb', 'idle', 78.8, tNever, { x: [840, 900], y: [1076, 1076], flip: -1, ease: 'out' });
A('kp', 'walk', tTurns, tNever, { x: [700, 430], y: [1080, 1082], scale: [0.7, 0.76], flip: 1, speed: 0.8 });
A('cb', 'talk', tNever, tIwont - 0.1, { x: [900, 900], y: [1076, 1076], flip: -1, voice: 'cerberus' });
S(tNever, 'ecu', { actor: 'cb', at: 'head', zoom: 2.3, push: 1.06, hand: 1.0 });                                                              // S30 CU-CERB talk
A('kp', 'talk', tIwont - 0.05, tBut3, { x: [430, 430], y: [1082, 1082], voice: 'kid', beam: 0.4, look: 0.2, flip: 1 });
S(tIwont - 0.05, 'cu', { actor: 'kp', fill: 0.85, push: 1.06, hand: 1.0 });                                                                   // S31 CU-KID "I won't."
// ================================================================ 8 CLIFFHANGER (bedroom) + CTA
const tNext = W('Next'), tKnock2 = 90.1, tCan2 = W('Can', 91.2), tDid = W('Did'), tWhos = W("Who's");
SC(tBut3 - 0.0, 'room'); TR('dawn', tBut3 - 0.02, tBut3, 0);
S(tBut3, 'high', { scene: 'room', actor: 'ki', zoom: 1.35, sy: 0.78, ground: 0.58, push: 1.1, hand: 1.5, tr: { type: 'fade', dur: 0.45 } });   // S32 HIGH-ANGLE: red glow under the floor
A('ki', 'in-bed', tBut3, tKnock2 + 0.2, { x: [520, 520], y: [962, 962], scale: 1.25, flip: -1 });
TR('vent', W('red', 86.3), W('red', 86.3) + 1.2, 1, 'inOut');
S(W('Then', 88.6), 'wide', { cx: 560, cy: 900, zoom: 1.2, hand: 1.2 });                                                                         // S33 MEDIUM
S(tKnock2 - 0.05, 'insert', { cx: 560, cy: 900, zoom: 1.2, pan: [-290, -380], push: 1.35, hand: 1.0 }); SH(tKnock2, 0.3, 7);
A('ki', 'bed-turn', tKnock2 + 0.2, tCan2 + 1.0, { x: [520, 520], y: [962, 962], flip: -1, scale: 1.25 });
A('rw0', 'idle-still', tCan2 - 1.0, 92.5, { x: [190, 190], y: [745, 745], scale: 0.9, flip: 1 }); A('rw1', 'head-tilt', tCan2 - 1.0, 92.5, { x: [330, 330], y: [749, 749], scale: 0.9, flip: 1, dur: 0.8 });
S(tCan2 - 0.05, 'insert', { cx: 300, cy: 560, zoom: 2.3, hand: 1.0 });                                                                          // S34 CU-WINDOW: two black-eyed faces
TR('winBreath', tCan2, tCan2 + 0.3, 0.0); tl.black.push([92.45, tDid + 0.2, 1]);
tl.black.push([tDid + 0.2, tWhos, 0.5]);
TX(tDid, tWhos, 'DID HELL REALLY\nKEEP THEM?', 540, 520, 80, { anim: 'slam', color: '#fff', shadow: '#c4121f', shadowDx: 8, shadowDy: 10, fadeOut: 0.2 });
S(tDid + 0.1, 'insert', { cx: 640, cy: 1100, zoom: 2.0, hand: 1.5 });
TX(tWhos, DUR, "WHO'S NEXT?", 540, 1120, 112, { anim: 'slam', color: '#f2f0ea', shadow: '#c4121f', shadowDx: 10, shadowDy: 12, fadeOut: 0.0001 });
TX(tWhos + 0.5, DUR, 'FOLLOW', 540, 960, 66, { anim: 'pop', color: '#fff', bg: { fill: '#c4121f', stroke: '#fff', sw: 4, rx: 40, px: 70, py: 22 }, fadeOut: 0.0001 });
S(tWhos, 'wide', { cx: 540, cy: 960, zoom: 1.0 });
tl.splits[1].t0 = tWhos - 0.1;
// ---- HUD (left = Black-Eyed, right = Cerberus)
tl.hud = { vis: [[0, 3.4], [VSt, 14.3], [tAnd1, 77.9]], leftLabel: 'BLACK-EYED', rightLabel: 'CERBERUS', leftInit: 0.6, rightInit: 0.35, blinkR: [[0, 3.4], [tAnd3 + 0.3, tWake]],
  left: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudL), right: [{ t0: 3.4, t1: 3.4, v: 1 }].concat(tl.hudR) };
tl.hud.left.sort((a, b) => a.t0 - b.t0); tl.hud.right.sort((a, b) => a.t0 - b.t0); delete tl.hudL; delete tl.hudR;
tl.cam.sort((a, b) => a.t0 - b.t0); tl.shots.sort((a, b) => a.t - b.t); tl.scenes.sort((a, b) => a.t0 - b.t0); for (const k in tl.tracks) tl.tracks[k].sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(tl));
console.log('timeline.json: shots', tl.shots.length, 'cues', tl.cues.length, 'fx', tl.fx.length, 'dur', tl.duration);
