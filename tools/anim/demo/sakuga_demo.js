// sakuga_demo.js - 26 s silent reference of the official format (docs/07): in-medias-res hook + rewind glitch,
// split-roll with a ~5 s self-intro per side (dive through the card into each territory), VS, then a 1v1 on ONE
// battlefield with beams / beam-clash / orbs / slash / pillar, letterbox, embers, whip-pans, slow-mo + crash-zoom,
// and THE KID running out of frame to hide. Uses the existing rigs (vry = monster LEFT, grim = guardian RIGHT, kid).
//   node tools/anim/demo/sakuga_demo.js && node tools/anim/render.js --timeline tools/anim/demo/sakuga_demo.json --check
const fs = require('fs'), path = require('path');
const DUR = 26;
const tl = { fps: 30, duration: DUR, sides: { left: 'mon', right: 'gua' }, tracks: {}, cues: [], shots: [], shake: [], flash: [], fx: [], text: [], glitch: [], cinema: [], embers: [], props: [] };
const A = (actor, action, t0, t1, params) => tl.cues.push({ actor, action, t0, t1, params: params || {} });
const S = (t, type, o) => tl.shots.push(Object.assign({ t, type }, o || {}));
const TR = (name, t0, t1, v, ease) => (tl.tracks[name] = tl.tracks[name] || []).push({ t0, t1, v, ease });
const SH = (t0, dur, amp) => tl.shake.push({ t0, dur, amp });
const FL = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp, color });
const FX = (type, t0, o) => tl.fx.push(Object.assign({ type, t0 }, o));
const TX = (t0, t1, text, x, y, size, o) => tl.text.push(Object.assign({ t0, t1, text, x, y, size, color: '#f2f0ea', anim: 'fade' }, o || {}));
// territories: monster lair, guardian sanctum, and the ONE battlefield (monster terrain rises out of it, never a backdrop swap)
tl.domains = {
  mon: { sky: ['#030806', '#0d2a1c'], glow: '#3aff9a', floor: ['#0b1a14', '#020604'], motif: 'monoliths', rock: '#0a1210', sigil: '#3aff9a', motes: '#7affc0', mist: '#3a6a5a' },
  gua: { sky: ['#0a1030', '#2a3a86'], glow: '#ffe39a', floor: ['#1a2250', '#070a1e'], motif: 'columns', rock: '#1f2a60', sigil: '#ffe39a', motes: '#fff6c8' },
  field: { sky: ['#06070f', '#24203e'], glow: '#c4121f', floor: ['#1b2140', '#06070f'], motif: 'spires', rock: '#0c0d18', motes: '#ffb04a' },
};
const MX = 250, GX = 860, FY = 1080;
tl.actors = {
  mon: { kind: 'vry', x: MX, y: FY, scale: 1, flip: 1, z: 2, aura: { colors: ['#0a5a34', '#3aff9a', '#d8ffe8'], r: 220, h: 230 }, rim: '#3aff9a', rimPx: 6 },
  gua: { kind: 'grim', x: GX, y: FY, scale: 0.95, flip: -1, z: 2, aura: { colors: ['#4a68d8', '#ffe39a', '#ffffff'], r: 240, h: 170 }, rim: '#ffe39a', rimPx: 8 },
  kid: { kind: 'kid', x: 560, y: FY, scale: 0.8, flip: -1, z: 3, vis: [[17.8, 19.9], [24.2, DUR]] },
};
tl.props.push({ type: 'monolith', x: 150, y: 1000, scale: 1, z: 0.2, scene: 'domain-field', track: 'rise', h: 760, w: 190, tilt: -9, seed: 1 }, { type: 'monolith', x: 420, y: 960, scale: 0.7, z: 0.1, scene: 'domain-field', track: 'rise2', h: 700, tilt: 7, seed: 2 }, { type: 'spire', x: 1150, y: 1010, scale: 0.62, z: 0.2, scene: 'domain-field', track: 'rock', rock: '#141626', color: '#ffb04a', h: 260, w: 300, tilt: 0, seed: 4 });
// ---------------------------------------------------------------- 0 HOOK (0-2.4): mid-fight beam clash, WHO SURVIVES?, rewind glitch
A('mon', 'claw-swipe', 0, 2.4, { x: [MX, MX] }); A('gua', 'growl', 0, 2.4, { x: [GX, GX] });
TR('rise', 0, 0.01, 1); TR('rise2', 0, 0.01, 1); TR('rock', 0, 0.01, 1);
S(0, 'versus', { scene: 'domain-field', a: 'mon', b: 'gua', cy: 860, zoom: 1.15, push: 1.12, pan: [30, 0], dutch: -4, dutchTo: 3, hand: 4 });
FX('beam-clash', 0.05, { dur: 2.35, x: MX + 110, y: 760, x2: GX - 170, y2: 800, colorL: '#3aff9a', colorR: '#ffe39a', w: 70, amp: 0.12 });
tl.cinema.push([0, 2.0]); tl.embers.push([0, 2.0, '#ffd070']);
TX(0.35, 2.0, 'WHO SURVIVES?', 540, 380, 118, { anim: 'slam', shadow: '#c4121f', shadowDx: 8, shadowDy: 10 }); SH(0.35, 0.4, 14);
tl.glitch.push([1.95, 2.4]); FL(2.3, 0.15, 0.8);
// ---------------------------------------------------------------- 1 SPLIT ROLL + 5 s self-intro per side
const L1 = 3.5, D1 = [3.75, 4.3], E2 = [9.45, 9.85], R2 = 10.55, D2 = [10.8, 11.35], E3 = [16.45, 16.85], VS = 17.0, SHAT = 17.75;
const card = (k) => ({ left: { kind: 'vry', N: 14, label: 'VRYKOLAKAS', subLabel: 'THE RESTLESS DEAD', fx: 0, fy: 230, fscale: 0.6, idle: 'grin' }, right: { kind: 'grim', N: 20, label: 'CHURCH GRIM', subLabel: 'WARDEN OF THE GRAVES', fx: -60, fy: 210, fscale: 0.55, idle: 'growl' } }[k]);
tl.splits = [
  { t0: 2.4, shatter: 99, end: D1[1] + 0.02, exclude: ['strigoi'], left: Object.assign(card('left'), { lockT: L1 }), right: Object.assign(card('right'), { spin: 9 }), dive: { t0: D1[0], t1: D1[1], side: 'L' } },
  { t0: E2[0], shatter: 99, end: D2[1] + 0.02, left: Object.assign(card('left'), { locked: true }), right: Object.assign(card('right'), { lockT: R2 }), emerge: { t0: E2[0], t1: E2[1], side: 'L' }, dive: { t0: D2[0], t1: D2[1], side: 'R' } },
  { t0: E3[0], shatter: SHAT, end: SHAT + 0.9, left: Object.assign(card('left'), { locked: true }), right: Object.assign(card('right'), { locked: true }), emerge: { t0: E3[0], t1: E3[1], side: 'R' } },
];
SH(L1, 0.4, 18); SH(R2, 0.4, 18);
// monster lair (4.3-9.45): low -> cu -> ecu, title card, energy VFX; pillar only flashes 0.75 s at the cut-in
A('mon', 'rise', 4.3, 5.6, { x: [540, 540], clipY: 1080 }); A('mon', 'grin', 5.6, 7.3, { x: [540, 540] }); A('mon', 'claw-swipe', 7.3, 9.45, { x: [540, 540] });
A('gua', 'idle', 4.3, 9.45, { x: [3000, 3000] });
S(4.3, 'low', { scene: 'domain-mon', actor: 'mon', zoom: 1.35, push: 1.12, pan: [-30, 0] });
FX('pillar', 4.3, { x: 540, y: 1080, w: 230, color: '#3aff9a', dur: 0.75 }); FL(4.3, 0.2, 0.9, '#d8ffe8'); SH(4.3, 0.5, 20);
S(6.0, 'cu', { actor: 'mon', fill: 0.5, push: 1.15, pan: [20, -10], dutch: 6, tr: { type: 'whip', dur: 0.22, dir: -1 } });
S(7.7, 'ecu', { actor: 'mon', at: 'eye', zoom: 4.2, push: 1.25, pan: [-15, 0] });
FX('glint', 7.8, { actor: 'mon', at: 'eye', color: '#3aff9a', r: 110, dur: 0.6 });
S(8.4, 'wide', { cx: 540, cy: 820, zoom: 1.0, push: 1.15, pan: [0, -20], tr: { type: 'whip', dur: 0.2, dir: 1 } });
FX('orbs', 8.5, { x: 640, y: 720, x2: 1200, y2: 400, n: 4, color: '#3aff9a', arc: 200 });
TX(4.6, 9.4, 'VRYKOLAKAS', 540, 300, 104, { anim: 'slam', shadow: '#0a5a34', bg: { fill: '#04140c', stroke: '#3aff9a', sw: 6 } });
TX(5.0, 9.4, 'GREEK UNDEAD · RISES FROM THE GRAVE', 540, 420, 40, { anim: 'pop', color: '#9affd0' });
tl.cinema.push([4.3, 9.45]); tl.embers.push([4.3, 9.45, '#7affc0']);
// guardian sanctum (11.35-16.45)
A('gua', 'howl', 11.35, 13.2, { x: [600, 600], flip: -1 }); A('gua', 'growl', 13.2, 16.45, { x: [600, 600], flip: -1 }); A('mon', 'idle', 11.35, 16.45, { x: [-2000, -2000] });
S(11.35, 'low', { scene: 'domain-gua', actor: 'gua', zoom: 1.3, push: 1.12, pan: [30, 0] });
FX('pillar', 11.35, { x: 600, y: 1080, w: 260, color: '#ffe39a', dur: 0.75 }); FL(11.35, 0.2, 1, '#fff6d6'); SH(11.35, 0.5, 18);
S(13.0, 'cu', { actor: 'gua', fill: 0.5, push: 1.15, pan: [-20, -10], dutch: -5, tr: { type: 'whip', dur: 0.22, dir: 1 } });
S(14.6, 'ecu', { actor: 'gua', at: 'eye', zoom: 4, push: 1.25, pan: [15, 0] });
FX('glint', 14.7, { actor: 'gua', at: 'eye', color: '#ffe39a', r: 120, dur: 0.6 });
S(15.4, 'wide', { cx: 560, cy: 820, zoom: 1.0, push: 1.15, pan: [0, -20], tr: { type: 'whip', dur: 0.2, dir: -1 } });
TX(11.6, 16.4, 'CHURCH GRIM', 540, 300, 104, { anim: 'slam', shadow: '#27367c', bg: { fill: '#0c1230', stroke: '#ffe39a', sw: 6 } });
TX(12.0, 16.4, 'ENGLISH FOLKLORE · GUARDS THE CHURCHYARD', 540, 420, 38, { anim: 'pop', color: '#ffeab0' });
tl.cinema.push([11.35, 16.45]); tl.embers.push([11.35, 16.45, '#fff0b0']);
// VS + WHO WINS? COMMENT, then explode into the story
TX(VS, SHAT + 0.1, 'VS', 540, 800, 380, { anim: 'slam', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6 });
TX(VS + 0.25, SHAT + 0.1, 'WHO WINS?  COMMENT', 540, 1010, 70, { anim: 'blink', color: '#ff7a84', shadow: '#000' }); FL(VS, 0.2, 0.9); SH(VS, 0.5, 26);
// ---------------------------------------------------------------- 2 STORY on the ONE battlefield (17.75-26)
TR('rise', 0.02, 0.03, 0); TR('rise2', 0.02, 0.03, 0); TR('rock', 0.02, 0.03, 1);
A('kid', 'idle-scared', 17.75, 18.6, { x: [560, 560], flip: -1 }); A('mon', 'walk', 17.75, 18.6, { x: [150, 300], flip: 1 }); A('gua', 'run', 17.75, 18.4, { x: [1300, 800], flip: -1, speed: 2.4 });
A('gua', 'blocked', 18.4, 19.0, { x: [800, 780] }); A('mon', 'recoil', 18.6, 19.2, { x: [300, MX] });
S(SHAT, 'wide', { scene: 'domain-field', cx: 560, cy: 860, zoom: 1.0, push: 1.1, pan: [40, 0] });
FX('impact', 18.45, { x: 690, y: 820, r: 160 }); SH(18.45, 0.4, 22); FL(18.45, 0.12, 0.7);
// THE KID runs out of frame to hide (own shot), then is hidden for the whole 1v1
A('kid', 'run', 18.95, 19.9, { x: [560, 1450], flip: 1, speed: 2.6 });
S(18.95, 'follow', { actor: 'kid', dx: 120, dy: -200, zoom: 1.5, push: 1.08, pan: [60, 0], tr: { type: 'whip', dur: 0.2, dir: 1 } });
// 1v1: monster terrain rises out of the SAME ground; orbs -> slash -> beam -> clash, whip-pans follow the projectile direction
TR('rise', 19.9, 20.5, 1, 'out'); TR('rise2', 20.0, 20.6, 1, 'out'); SH(19.9, 0.7, 16);
A('mon', 'grin', 19.9, 20.6, { x: [MX, MX] }); A('gua', 'growl', 19.0, 20.6, { x: [GX, GX] });
S(19.9, 'low', { actor: 'mon', zoom: 1.3, push: 1.12, pan: [-30, 0], dutch: -6, dutchTo: -2 });
A('mon', 'claw-swipe', 20.6, 21.4, { x: [MX, MX] });
S(20.6, 'versus', { a: 'mon', b: 'gua', cy: 860, zoom: 1.1, push: 1.1, pan: [40, 0], tr: { type: 'whip', dur: 0.2, dir: 1 } });
FX('orbs', 20.65, { x: MX + 120, y: 740, x2: GX - 120, y2: 860, n: 5, color: '#3aff9a', arc: 240 });
A('gua', 'lunge', 21.4, 22.2, { x: [GX, GX - 60] });
S(21.4, 'versus', { a: 'mon', b: 'gua', cy: 840, zoom: 1.2, push: 1.08, pan: [-50, 0], tr: { type: 'whip', dur: 0.18, dir: -1 } });
FX('slash', 21.5, { x: GX - 150, y: 820, x2: MX + 40, y2: 780, r: 240, color: '#ffe39a', flipV: true });
tl.embers.push([19.9, DUR, '#ffb04a']); tl.cinema.push([19.9, 25.0]);
// beam clash: both fire, then the guardian wins (slow-mo + crash-zoom at the decisive push)
A('mon', 'choke', 22.2, 24.2, { x: [MX, MX] }); A('gua', 'howl', 22.2, 24.2, { x: [GX - 60, GX - 60] });
S(22.2, 'versus', { a: 'mon', b: 'gua', cy: 820, zoom: 0.8, maxZoom: 0.85, push: 1.15, pan: [0, -20], dutch: 3, dutchTo: -3, hand: 5, slow: 0.6, crash: { at: 23.55, dur: 0.12, k: 1.35 } });
FX('beam-clash', 22.25, { dur: 1.9, x: MX + 110, y: 760, x2: GX - 230, y2: 790, colorL: '#3aff9a', colorR: '#ffe39a', w: 80, win: 'R', winAt: 1.15 });
FX('pillar', 22.2, { x: GX - 60, y: 1080, w: 200, color: '#ffe39a', dur: 0.7 });
SH(23.4, 0.8, 26); FL(23.75, 0.18, 1);
A('mon', 'fall', 24.2, 25.2, { x: [MX, MX - 120] });
// cut to the kid's far hiding spot (only for the decisive blow / ending)
A('kid', 'peek', 24.2, DUR, { x: [1150, 1150], y: [1005, 1005], scale: [0.45, 0.45], flip: -1, z: 0.1 });
S(24.2, 'insert', { cx: 1080, cy: 900, zoom: 2.0, push: 1.12, pan: [-20, 0], tr: { type: 'whip', dur: 0.2, dir: 1 } });
S(25.0, 'wide', { cx: 600, cy: 860, zoom: 1.05, push: 1.08, pan: [-30, 0] });
fs.writeFileSync(path.join(__dirname, 'sakuga_demo.json'), JSON.stringify(tl));
console.log('wrote sakuga_demo.json', tl.shots.length, 'shots');
