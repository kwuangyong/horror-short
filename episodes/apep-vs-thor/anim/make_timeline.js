// Episode #003 APEP vs THOR - v2 (tempo ~20% slower, colossal Apep). Cuts + cues keyed to audio-anim/words.json.
//   node episodes/apep-vs-thor/anim/make_timeline.js   -> anim/timeline.json
// v1 timings (anim/make_timeline_v1.js) are mapped word-by-word onto the v2 voice (m(t)); the split-roll / intro block uses raw v2 times (RAW).
const fs = require('fs'), path = require('path');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/words.json'), 'utf8'));
const v1w = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/v1/words.json'), 'utf8'));
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']/g, '');
const pick = (w, near, key) => { const c = words.filter((x) => norm(x.word) === norm(w)); if (!c.length) throw new Error('no word ' + w); if (near === undefined) return c[0][key]; return c.reduce((a, b) => (Math.abs(b[key] - near) < Math.abs(a[key] - near) ? b : a))[key]; };
const W = (w, near) => pick(w, near, 'start'), Wend = (w, near) => pick(w, near, 'end');          // v2 word times (near = v2 time hint)
// m(t): v1 time -> v2 time (piecewise linear through every word start; identity before the first word; shifted after the last)
const KA = [0, ...v1w.map((w) => w.start)], KB = [0, ...words.map((w) => w.start)];
const m = (t) => { if (t <= 0) return t; const n = KA.length - 1; if (t >= KA[n]) return t - KA[n] + KB[n]; let i = 1; while (KA[i] < t) i++; const u = (t - KA[i - 1]) / Math.max(1e-6, KA[i] - KA[i - 1]); return KB[i - 1] + u * (KB[i] - KB[i - 1]); };
let RAW = false; const M = (t) => (RAW ? t : m(t)), DK = (d) => (RAW ? d : d * 1.15);
const DUR = Math.round(m(76.85) * 100) / 100;
const tl = { fps: 30, duration: DUR, holeX: 130, sides: { left: 'apep', right: 'thor' }, camInit: { cx: 540, cy: 960, zoom: 1 }, tracks: {}, scenes: [], cues: [], shots: [], shake: [], flash: [], fx: [], text: [], glitch: [], cinema: [], embers: [], props: [], tints: [], black: [], freeze: [], slow: [] };
const spk = (name) => words.filter((w) => w.speaker === name).map((w) => [w.start, w.end]);
tl.voices = { apep: { words: spk('apep') }, thor: { words: spk('thor') }, kid: { words: spk('kid') } };
const A = (actor, action, t0, t1, params) => tl.cues.push({ actor, action, t0: M(t0), t1: M(t1), params: params || {} });
const S = (t, type, o) => { o = Object.assign({}, o || {}); if (o.crash) o.crash = Object.assign({}, o.crash, { at: M(o.crash.at) }); tl.shots.push(Object.assign({ t: M(t), type }, o)); };
const TR = (name, t0, t1, v, ease) => (tl.tracks[name] = tl.tracks[name] || []).push({ t0: M(t0), t1: M(t1), v, ease });
const SH = (t0, dur, amp) => tl.shake.push({ t0: M(t0), dur: DK(dur), amp });
const FL = (t0, dur, amp, color) => tl.flash.push({ t0: M(t0), dur, amp, color });
const FX = (type, t0, o) => { o = Object.assign({}, o); if (!RAW && (type === 'beam' || type === 'beam-clash')) { for (const k of ['charge', 'dur', 'winAt']) if (o[k] !== undefined) o[k] = Math.round(o[k] * 1.15 * 1000) / 1000; } tl.fx.push(Object.assign({ type, t0: M(t0) }, o)); };
const TX = (t0, t1, text, x, y, size, o) => tl.text.push(Object.assign({ t0: M(t0), t1: M(t1), text, x, y, size, color: '#f2f0ea', anim: 'fade' }, o || {}));
const CI = (a, b) => tl.cinema.push([M(a), M(b)]), EM = (a, b, c) => tl.embers.push([M(a), M(b), c]);
const TN = (o) => tl.tints.push(Object.assign({}, o, { t0: M(o.t0), t1: M(o.t1) })), SL = (a, b, rate) => tl.slow.push({ t0: M(a), t1: M(b), rate });
const mv = (arr) => arr.map(([a, b]) => [M(a), M(b)]);
const whip = (dir, dur) => ({ tr: { type: 'whip', dur: dur || 0.2, dir } });
// ---------------------------------------------------------------- domains: Duat (Apep), Thrudheim (Thor), ONE desert battlefield (+ sunset variant for the ending)
const ECL = { x: 1180, y: 250, r: 165, track: 'eclipse', sun: '#ffe6a0', corona: '#e8d8ff', skyDarkMax: 0.5, gDarkMax: 0.24, rayK: 1.7, coronaR: 5.2, coronaMid: 0.75 };   // v2: totality brighter
tl.domains = {
  duat: { sky: ['#02050a', '#0b2a2c'], glow: '#7a3aff', floor: ['#0a2128', '#020608'], motif: 'spires', rock: '#050b12', sigil: '#7affc0', motes: '#9a7aff', mist: '#2a7a6a', horizon: 950 },
  thrudheim: { sky: ['#0a1030', '#4a6ac8'], glow: '#cfeaff', floor: ['#26346a', '#080c22'], motif: 'columns', rock: '#2a3878', sigil: '#bfe6ff', motes: '#e8f6ff', mist: '#7a9ad8', horizon: 950 },
  desert: { sky: ['#1a1038', '#d8683c'], glow: '#ff9a50', floor: ['#4a2e48', '#140a1c'], motif: 'ruins', horizon: 1000, rock: '#241a30', sand: ['#5a3450', '#46283e', '#321a30'], motes: '#ffd8a0', mist: '#b090d8', eclipse: ECL },
  day: { sky: ['#1a1038', '#e8803c'], glow: '#ffb060', floor: ['#5a3a50', '#1a0e22'], motif: 'ruins', horizon: 1000, rock: '#241a30', sand: ['#6a3a52', '#52304a', '#3a1e38'], motes: '#ffd8a0', mist: '#d8a0b0' },
  dusk: { sky: ['#1a0c30', '#ff7a3a'], glow: '#ff8a3a', floor: ['#4a2a40', '#140a1c'], motif: 'ruins', horizon: 1000, rock: '#1c1024', sand: ['#6a3a4a', '#4a2842', '#321a34'], motes: '#ffc890', mist: '#d890a0' },
};
// layout (world px): Apep COLOSSAL (scale 2.8, head origin ~ x -200, mouth ~ x 700), Thor ~1/4.5 of Apep's reared height, ground FY
const AX = -560, FY = 1230, AS = 2.8, TS = 0.8, TX0 = 1080, SQ = 1080, TEND = 1260, KX = 1650;
const WRAPX = (SQ - AX) / AS;
const APOSE = { girth: 0.78, len: 1.5, lam: 900, rearK: 0.72 }, APOSE_SQ = Object.assign({}, APOSE, { girth: 0.42 });
const AURA_A = { colors: ['#4a1a8a', '#b07aff', '#e8d0ff'], r: 300, h: 200 };
tl.actors = {
  apep: { kind: 'apep', x: AX, y: FY, scale: AS, flip: 1, z: 2, pose: APOSE, aura: { colors: AURA_A.colors, r: 330, h: 320 }, rim: '#d8b8ff', rimPx: 9 },
  apepB: { kind: 'apep', x: AX, y: FY, scale: AS, flip: 1, z: 1, pose: APOSE_SQ, rim: '#d8b8ff', rimPx: 9 },
  apepF: { kind: 'apep', x: AX, y: FY, scale: AS, flip: 1, z: 3, pose: APOSE_SQ, aura: { colors: AURA_A.colors, r: 330, h: 320 }, rim: '#d8b8ff', rimPx: 9 },
  thor: { kind: 'thor', x: TX0, y: FY, scale: TS, flip: -1, z: 2, aura: { colors: ['#2a5ac8', '#8ad0ff', '#ffffff'], r: 250, h: 230 }, rim: '#b8e4ff', rimPx: 9 },
  kid: { kind: 'kid', x: KX, y: 1130, scale: 0.72, flip: -1, z: 3 },
};
// ---------------------------------------------------------------- split-roll / intro times (RAW = v2 seconds)
const SEC = JSON.parse(fs.readFileSync(path.join(__dirname, '../audio-anim/sections.json'), 'utf8')).sentences, SE = (p) => SEC.find((x) => x.text.startsWith(p));
const tAe = SE('Tonight').end, tTs = SE('I am Thor').start, tTe = SE('Crawl').end, STORY = SE('A kid').start;   // same anchors as make_music.py
const LOCKL = 4.1, D1 = [4.15, 4.5], E2 = [tAe + 0.02, tAe + 0.37], LOCKR = tAe + 0.85, D2 = [LOCKR + 0.1, LOCKR + 0.45], TI0 = D2[1] + 0.05, E3 = [tTe + 0.06, tTe + 0.42], VST = tTe + 0.12;
tl.actors.apep.vis = [[4.5, E2[0] + 0.3], ...mv([[22.0, 37.95], [43.0, 62.5]]).map((a, i) => (i === 1 ? [M(41.5), a[1]] : a))];
tl.actors.apepB.vis = [[0, 2.95], ...mv([[37.95, 43.0]])];
tl.actors.apepF.vis = [[0, 2.95], ...mv([[37.95, 41.45]])];
tl.actors.thor.vis = [[0, 2.95], [TI0 - 0.05, E3[0] + 0.45], ...mv([[23.95, 70.4]])];
tl.actors.kid.vis = mv([[17.4, 28.05], [62.6, 71.5]]);
// ---------------------------------------------------------------- props
const sk = (shapes, track) => shapes.map((s) => Object.assign({}, s, track ? { track } : {}));
const COIL = { body: '#1d1230', body2: '#3a2460', sheen: '#8a62c8', vein: '#b07aff', sand: '#46283e', haze: '#6a3a5a', sp: 1 };
const DUATC = { body: '#06141c', body2: '#123a40', sheen: '#2a8a8a', vein: '#7affc0', sand: '#07161c', haze: '#0b3a3c', sp: 1 };
tl.props.push(
  // ---- COLOSSAL APEP: coil arcs rising out of / diving back into the dunes, from the foreground to the horizon (scales, glowing veins, slow slither)
  { type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 0.1, scene: 'domain-desert', track: 'cf', ...COIL, arcs: [
    { x0: -1250, x1: -520, y: 1010, h: 560, w: 180, d: 0.7, ph: 1.0 }, { x0: -40, x1: 620, y: 1006, h: 640, w: 200, d: 0.72, ph: 2.1, delay: 0.1 }, { x0: 760, x1: 1420, y: 1008, h: 560, w: 190, d: 0.7, ph: 3.4, delay: 0.2 }, { x0: 1560, x1: 2300, y: 1010, h: 680, w: 200, d: 0.72, ph: 5.0, delay: 0.3 }] },
  { type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 0.4, scene: 'domain-desert', track: 'rise', ...COIL, arcs: [
    { x0: -1150, x1: -380, y: 1140, h: 760, w: 250, d: 0.3, ph: 0.5 }, { x0: 260, x1: 1000, y: 1160, h: 700, w: 240, d: 0.28, ph: 2.2, delay: 0.12 }, { x0: 900, x1: 1760, y: 1150, h: 820, w: 260, d: 0.28, ph: 4.0, delay: 0.25 }] },
  { type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 3.6, scene: 'domain-desert', track: 'rise', ...COIL, arcs: [
    { x0: -1700, x1: -1000, y: 1360, h: 460, w: 330, d: 0, ph: 1.4 }, { x0: 1560, x1: 2350, y: 1370, h: 420, w: 320, d: 0, ph: 3.0, delay: 0.2 }] },
  // Duat river: the same serpent filling the black water
  { type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 0.3, scene: 'domain-duat', track: 'cd', ...DUATC, arcs: [
    { x0: -900, x1: -80, y: 1040, h: 720, w: 250, d: 0.45, ph: 0.6 }, { x0: 560, x1: 1380, y: 1050, h: 800, w: 270, d: 0.4, ph: 2.3, delay: 0.1 }, { x0: -300, x1: 520, y: 1010, h: 520, w: 190, d: 0.7, ph: 4.2, delay: 0.2 }, { x0: 1100, x1: 1900, y: 1010, h: 560, w: 200, d: 0.7, ph: 5.1, delay: 0.3 }] },
  { type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 3.6, scene: 'domain-duat', track: 'cd', ...DUATC, arcs: [{ x0: -1300, x1: -560, y: 1330, h: 480, w: 330, d: 0, ph: 1.9 }, { x0: 900, x1: 1700, y: 1340, h: 420, w: 320, d: 0, ph: 3.7, delay: 0.15 }] },
  // rising terrain on the battlefield: obsidian spires (track 'rise': 1 in the hook, 0 at story start, up at "roared", reversed at "sunlight")
  { type: 'spire', x: 360, y: 1215, scale: 1, z: 0.2, scene: 'domain-desert', track: 'rise', rock: '#140c26', color: '#b07aff', h: 900, w: 260, tilt: -7, seed: 4 },
  { type: 'spire', x: 880, y: 1230, scale: 0.9, z: 0.2, scene: 'domain-desert', track: 'rise', rock: '#140c26', color: '#b07aff', h: 700, w: 220, tilt: 8, seed: 6 },
  { type: 'spire', x: 1240, y: 1215, scale: 1, z: 0.2, scene: 'domain-desert', track: 'rise', rock: '#140c26', color: '#b07aff', h: 820, w: 240, tilt: -5, seed: 9 },
  { type: 'spire', x: 1620, y: 1215, scale: 0.8, z: 0.1, scene: 'domain-desert', track: 'rise', rock: '#140c26', color: '#b07aff', h: 700, w: 210, tilt: 6, seed: 11 },
  // tent at the desert edge (back wall glows from a lantern), kid sleeps inside
  { type: 'shape', x: KX + 10, y: 1112, scale: 1, z: 0.5, vis: mv([[17.3, 62.6]]), shapes: [
    { k: 'poly', pts: [[-190, 0], [0, -250], [190, 0]], fill: '#3a2a52' }, { k: 'poly', pts: [[-190, 0], [0, -250], [-20, -240], [-100, 0]], fill: '#4c3a68' },
    { k: 'poly', pts: [[-120, 0], [0, -190], [120, 0]], fill: '#ffb860', op: 0.9 }, { k: 'glow', cx: 0, cy: -80, r: 230, color: '#ffb860', op: 0.55 }, { k: 'poly', pts: [[-190, 0], [-120, 0], [-150, 12]], fill: '#241838' }] },
  // thunder cart (goats Tanngrisnir + Tanngnjostr): big bright streak, lightning bolts, lands with Thor
  { type: 'shape', x: 0, y: 0, scale: 1.5, z: 4, vis: mv([[23.8, 25.5]]), xTrack: 'cartX', yTrack: 'cartY', shapes: sk([
    { k: 'glow', cx: 100, cy: -60, r: 420, color: '#bfe6ff', op: 0.85 }, { k: 'poly', pts: [[-110, -30], [80, -30], [100, -110], [-120, -120]], fill: '#f4f8ff', op: 1 }, { k: 'poly', pts: [[-110, -30], [80, -30], [70, -50], [-100, -50]], fill: '#8ab4e8' }, { k: 'ell', cx: -60, cy: 0, rx: 46, ry: 46, fill: 'none', stroke: '#ffffff', sw: 10 }, { k: 'ell', cx: 50, cy: 0, rx: 46, ry: 46, fill: 'none', stroke: '#ffffff', sw: 10 },
    { k: 'ell', cx: 190, cy: -80, rx: 70, ry: 34, fill: '#f4f8ff' }, { k: 'poly', pts: [[250, -100], [300, -150], [270, -60]], fill: '#f4f8ff' }, { k: 'poly', pts: [[230, -110], [250, -170], [262, -100]], fill: '#f4f8ff' }, { k: 'ell', cx: 330, cy: -70, rx: 60, ry: 30, fill: '#e8f0ff' }, { k: 'poly', pts: [[380, -90], [430, -140], [400, -50]], fill: '#e8f0ff' },
    { k: 'poly', pts: [[80, -70], [190, -80], [330, -70]], fill: 'none', stroke: '#ffffff', sw: 6 }, { k: 'poly', pts: [[-110, -80], [-260, -190], [-200, -100], [-380, -230]], fill: 'none', stroke: '#cfeaff', sw: 8 }, { k: 'poly', pts: [[-120, -40], [-300, -20], [-250, -60], [-460, -40]], fill: 'none', stroke: '#9fd8ff', sw: 6 }], 'cartA') },
  // kid's flashlight at the toppled statue (flickers, rolls out of the statue's shadow, goes out) + sinking hollow
  { type: 'shape', x: 760, y: 1112, scale: 1, z: 1, xTrack: 'flx', rotTrack: 'flrot', vis: mv([[44.6, 49.0]]), shapes: [
    { k: 'poly', pts: [[560, -22], [66, -26], [66, 26], [560, 110]], fill: '#fff0aa', op: 0.3, track: 'fl', flick: 0.4, cx: 1 }, { k: 'glow', cx: 70, cy: 0, r: 150, color: '#ffe9a0', op: 0.9, track: 'fl', flick: 0.5 },
    { k: 'poly', pts: [[-44, -12], [44, -12], [44, 12], [-44, 12]], fill: '#8a94b8' }, { k: 'poly', pts: [[32, -20], [66, -28], [66, 28], [32, 20]], fill: '#cdd6ee' }, { k: 'poly', pts: [[-14, -12], [0, -12], [0, 12], [-14, 12]], fill: '#c4121f' }, { k: 'ell', cx: 66, cy: 0, rx: 7, ry: 24, fill: '#fff6c8', track: 'fl' }] },
  { type: 'shape', x: 720, y: 1118, scale: 1, z: 0.4, vis: mv([[45.9, 70.4]]), shapes: [{ k: 'ell', cx: 0, cy: 0, rx: 220, ry: 42, fill: '#050208', op: 0.95, track: 'hol', sxTrack: 'hol', syTrack: 'hol', pivot: [0, 0] }, { k: 'ell', cx: 0, cy: 0, rx: 130, ry: 24, fill: '#000', track: 'hol', sxTrack: 'hol', syTrack: 'hol', pivot: [0, 0] }] },
  // altar with a carved ox head (Hymiskvida bait); the ox head tears off and attaches to Mjolnir
  { type: 'shape', x: TEND + 140, y: 1150, scale: 1, z: 0.5, vis: mv([[17, 62.6]]), shapes: [
    { k: 'poly', pts: [[-130, 0], [-110, -150], [120, -160], [140, 0]], fill: '#4a3a5a' }, { k: 'poly', pts: [[-130, 0], [-110, -150], [-90, -150], [-104, 0]], fill: '#fff', op: 0.07 }, { k: 'poly', pts: [[-150, -150], [150, -160], [150, -184], [-150, -174]], fill: '#5a4a6a' },
    { k: 'glow', cx: 0, cy: -90, r: 120, color: '#ffd890', op: 0.45, track: 'oxRel' }, { k: 'poly', pts: [[-34, -120], [34, -122], [24, -64], [0, -44], [-24, -64]], fill: '#2a1e38', track: 'oxRel' }, { k: 'poly', pts: [[-34, -120], [-78, -150], [-90, -126], [-52, -92]], fill: '#2a1e38', track: 'oxRel' }, { k: 'poly', pts: [[34, -122], [78, -150], [90, -126], [52, -92]], fill: '#2a1e38', track: 'oxRel' }] },
  { type: 'shape', x: TEND + 140, y: 1090, scale: 1.1, z: 6, vis: mv([[52.55, 55.3]]), attach: { actor: 'thor', marker: 'hammer', track: 'oxAttach' }, shapes: [
    { k: 'glow', cx: 0, cy: 0, r: 90, color: '#ffd890', op: 0.6 }, { k: 'poly', pts: [[-38, -34], [38, -34], [28, 44], [0, 66], [-28, 44]], fill: '#b8a888' }, { k: 'poly', pts: [[-38, -34], [-92, -76], [-112, -44], [-62, 0]], fill: '#d8cca8' }, { k: 'poly', pts: [[38, -34], [92, -76], [112, -44], [62, 0]], fill: '#d8cca8' }, { k: 'ell', cx: -14, cy: -6, rx: 6, ry: 8, fill: '#3a2a20' }, { k: 'ell', cx: 14, cy: -6, rx: 6, ry: 8, fill: '#3a2a20' }] },
  { type: 'shape', x: 520, y: 330, scale: 1, z: 0.05, scene: 'domain-day', shapes: [{ k: 'glow', cx: 0, cy: 0, r: 520, color: '#ffe6a0', op: 0.8 }, { k: 'ell', cx: 0, cy: 0, rx: 150, ry: 150, fill: '#fff3c4' }] },
  // sunset ending (domain 'dusk'): sun, breathing dunes, the eye under the sand
  { type: 'shape', x: 640, y: 940, scale: 1, z: 0.05, scene: 'domain-dusk', shapes: [{ k: 'glow', cx: 0, cy: 0, r: 420, color: '#ff9a4a', op: 0.9 }, { k: 'ell', cx: 0, cy: 0, rx: 130, ry: 130, fill: '#ffd8a0' }] },
  { type: 'shape', x: 380, y: 1150, scale: 1, z: 0.3, scene: 'domain-dusk', shapes: [{ k: 'poly', pts: [[-300, 0], [-200, -50], [-60, -70], [80, -50], [260, 0]], fill: '#5a2e48', syTrack: 'breath', pivot: [0, 0] }] },
  { type: 'shape', x: 760, y: 1190, scale: 1, z: 0.3, scene: 'domain-dusk', shapes: [{ k: 'poly', pts: [[-320, 0], [-180, -60], [0, -86], [160, -56], [300, 0]], fill: '#4a2440', syTrack: 'breath', pivot: [0, 0] }] },
  { type: 'shape', x: 600, y: 1250, scale: 1, z: 0.4, scene: 'domain-dusk', shapes: [
    { k: 'poly', pts: [[-330, 0], [-150, -26], [0, -34], [150, -26], [330, 0]], fill: '#3a1c36' }, { k: 'glow', cx: 0, cy: 0, r: 260, color: '#b07aff', op: 0.8, track: 'eye' },
    { k: 'poly', pts: [[-130, 0], [0, -64], [130, 0], [0, 64]], fill: '#d8ff4a', track: 'eye', syTrack: 'eye', pivot: [0, 0] }, { k: 'ell', cx: 0, cy: 0, rx: 16, ry: 62, fill: '#05020a', track: 'eye', syTrack: 'eye', pivot: [0, 0] },
    { k: 'poly', pts: [[0, -240], [18, -22], [0, -4], [-18, -22]], fill: '#ffffff', op: 0.9, track: 'star' }, { k: 'poly', pts: [[-200, 0], [-22, -14], [200, 0], [22, 14]], fill: '#ffffff', op: 0.8, track: 'star' }] },
  // serpent-headed shadow of the kid (#52): lies on the sand LEFT of the kid's feet; v2 = larger, pure black, warm light patch under it for contrast
  { type: 'shape', x: 860, y: 1136, scale: 1.15, z: 0.35, vis: mv([[70.4, 71.6]]), shapes: [
    { k: 'ell', cx: -380, cy: -20, rx: 560, ry: 70, fill: '#ffb070', op: 0.42 }, { k: 'ell', cx: -380, cy: -20, rx: 380, ry: 40, fill: '#ffd8a0', op: 0.3 },
    { k: 'poly', pts: [[20, 4], [10, -30], [-6, -54], [-30, -64], [-52, -44], [-60, -14], [-110, -18], [-260, -22], [-420, -26], [-520, -30], [-560, -60], [-600, -96], [-680, -64], [-760, -30], [-690, 2], [-600, -4], [-540, 6], [-420, 10], [-260, 12], [-110, 8], [-50, 8]], fill: '#000000', op: 1 },
    { k: 'poly', pts: [[-760, -30], [-830, -44], [-860, -62], [-830, -36], [-860, -22], [-826, -26]], fill: '#000000', op: 1 }, { k: 'glow', cx: -690, cy: -44, r: 150, color: '#c090ff', op: 1, flick: 0.5 }, { k: 'ell', cx: -690, cy: -44, rx: 14, ry: 8, fill: '#f0d8ff' }] },
);
// ---------------------------------------------------------------- tracks
TR('rise', 0, 0.01, 1); TR('rise', 17.35, 17.37, 0); TR('rise', 32.35, 33.1, 1, 'out'); TR('rise', 60.2, 61.4, 0, 'inOut');
TR('cf', 0, 0.01, 1); TR('cf', 17.35, 17.37, 0); TR('cf', 22.0, 23.4, 1, 'out'); TR('cf', 60.2, 61.4, 0, 'inOut');           // far coil ridges appear as Apep rises, all arcs up at "roared"
tl.tracks.cd = [{ t0: 0, t1: 0.01, v: 0 }, { t0: 4.45, t1: 5.9, v: 1, ease: 'out' }, { t0: E2[0] + 0.3, t1: E2[0] + 0.31, v: 0 }];
TR('eclipse', 0, 0.01, 0.62); TR('eclipse', 17.3, 17.31, 0.14); TR('eclipse', 17.4, 20.4, 0.22); TR('eclipse', 20.4, 27, 0.34); TR('eclipse', 27, 32, 0.44); TR('eclipse', 32.3, 36, 0.62); TR('eclipse', 36, 44.8, 0.72); TR('eclipse', 44.8, 45.95, 1, 'inOut'); TR('eclipse', 58, 59, 1); TR('eclipse', 61.0, 62.6, 0, 'inOut');
// thunder cart lands with Thor at the start of #20
TR('cartA', 0, 0.01, 0); TR('cartA', 24.0, 24.06, 1); TR('cartA', 24.55, 25.3, 0); TR('cartX', 0, 0.01, 2000); TR('cartX', 23.9, 24.35, 1250, 'out'); TR('cartX', 24.35, 25.3, 820, 'in'); TR('cartY', 0, 0.01, -500); TR('cartY', 23.9, 24.35, 1000, 'in'); TR('cartY', 24.35, 25.3, 960);
// flashlight: flickers during #36, rolls and dies in #38; hollow grows
{ let t = 44.7, v = 1; TR('fl', 0, 0.01, 0); TR('fl', 44.6, 44.7, 1); for (; t < 46.9; t += 0.13) { v = (Math.floor(t * 100) % 3 === 0) ? 0.25 : 1; TR('fl', t, t + 0.05, v); } TR('fl', 46.9, 47.3, 0.8); TR('fl', 47.9, 48.0, 0); }
TR('flx', 0, 0.01, 760); TR('flx', 47.35, 48.2, 550, 'out'); TR('flrot', 0, 0.01, 0); TR('flrot', 47.35, 48.2, -560, 'out');
TR('hol', 0, 0.01, 0.01); TR('hol', 46.0, 47.9, 1, 'inOut');
TR('oxRel', 0, 0.01, 1); TR('oxRel', 52.78, 52.8, 0); TR('oxAttach', 0, 0.01, 0); TR('oxAttach', 53.2, 54.3, 1, 'inOut');
TR('eye', 0, 0.01, 0.02); TR('eye', 73.0, 74.0, 1, 'out'); TR('star', 0, 0.01, 0); TR('star', 73.6, 73.7, 1); TR('star', 74.0, 74.9, 0);
{ TR('breath', 0, 0.01, 1); let k = 0; for (let t = 71.3; t < 72.8; t += 0.3) { TR('breath', t, t + 0.3, k % 2 ? 1 : 1.9, 'inOut'); k++; } TR('breath', 72.8, 73.4, 1, 'inOut'); }
// ================================================================ 0 HOOK (0-3 s): the squeeze (real frame from #32-33), no narration
const SQA = { wrapX: WRAPX, wrapY: 40, wrapR: 80, wrapH: 150, coilLift: 320, turns: 1.25, headRot: -5 };
A('apepB', 'coil-squeeze', 0, 2.95, Object.assign({ layer: 1 }, SQA)); A('apepF', 'coil-squeeze', 0, 2.95, Object.assign({ layer: 2 }, SQA));
A('thor', 'strangled', 0, 2.95, { x: [SQ, SQ], flip: -1 });
S(0, 'cu', { scene: 'domain-desert', actor: 'thor', zoom: 2.2, dy: -90, dx: 60, push: 1.14, pan: [-26, 10], hand: 3 });
FX('glint', 0.25, { actor: 'apepF', at: 'eye', color: '#d8a8ff', r: 160, dur: 0.6 });
S(1.0, 'ecu', { actor: 'thor', at: 'hammer', zoom: 2.0, dx: 110, dy: 60, push: 1.2, pan: [20, -14], hand: 3 });
FX('sparks', 1.05, { x: SQ - 50, y: 640, n: 26, color: '#bfe6ff' }); SH(1.0, 1.0, 7);
S(2.0, 'low', { actor: 'thor', dx: -120, zoom: 0.62, ground: 0.8, push: 1.12, pan: [30, 20], dutch: -3 });
FX('beam', 2.0, { x: 850, y: 760, x2: 1140, y2: 640, w: 22, color: '#d8efff', charge: 0.05, dur: 0.8, hit: false }); FX('beam', 2.3, { x: 1180, y: 560, x2: 840, y2: 700, w: 18, color: '#d8efff', charge: 0.05, dur: 0.6, hit: false });
TX(2.0, 2.95, 'WHO SURVIVES?', 540, 400, 120, { anim: 'slam', shadow: '#7a2ac8', shadowDx: 8, shadowDy: 10 }); SH(2.0, 0.4, 14);
tl.cinema.push([0, 2.95]); tl.embers.push([0, 2.95, '#d8b8ff']);
tl.glitch.push([2.45, 3.0]); tl.flash.push({ t0: 2.62, dur: 0.14, amp: 0.85 });
// ================================================================ 1 SPLIT ROLL + 2 self-intros  (RAW v2 times)
RAW = true;
const card = (k) => ({
  left: { kind: 'apep', N: 16, label: 'APEP', subLabel: 'SERPENT OF CHAOS', fx: 10, fy: 255, fscale: 0.4, idle: 'idle-card' },
  right: { kind: 'thor', N: 20, label: 'THOR', subLabel: 'GOD OF THUNDER', fx: 0, fy: 270, fscale: 0.5, idle: 'idle' },
}[k]);
tl.splits = [
  { t0: 3.0, shatter: 99, end: D1[1] + 0.02, left: Object.assign(card('left'), { lockT: LOCKL }), right: Object.assign(card('right'), { spin: 9 }), dive: { t0: D1[0], t1: D1[1], side: 'L' } },
  { t0: E2[0], shatter: 99, end: D2[1] + 0.02, left: Object.assign(card('left'), { locked: true }), right: Object.assign(card('right'), { lockT: LOCKR }), emerge: { t0: E2[0], t1: E2[1], side: 'L' }, dive: { t0: D2[0], t1: D2[1], side: 'R' } },
  { t0: E3[0], shatter: STORY, end: STORY + 0.9, left: Object.assign(card('left'), { locked: true }), right: Object.assign(card('right'), { locked: true }), emerge: { t0: E3[0], t1: E3[1], side: 'R' } },
];
SH(LOCKL, 0.4, 18); SH(LOCKR, 0.4, 18);
S(3.0, 'wide', { scene: 'domain-duat', cx: 540, cy: 900, zoom: 1.0, push: 1.05, pan: [10, 0] });
// ---- Apep's Duat (4.5 - E2): colossal coils fill the black river
const AIX = 330, AIY = 1130, AIS = 2.1;
RAW = true; A('apep', 'rise-from-sand', 4.5, 5.9, { x: [AIX, AIX], y: [AIY, AIY], scale: AIS, flip: 1, clipY: AIY + 1 }); RAW = false;
A('apep', 'talk', 5.9, 6.85, { voice: 'apep', hypno: 0.2 }); A('apep', 'hypno-gaze', 6.85, 8.05, {}); RAW = true; A('apep', 'roar', m(8.05), E2[0] + 0.3, {}); RAW = false;
RAW = true; S(4.5, 'low', { scene: 'domain-duat', actor: 'apep', dx: 520, zoom: 0.62, ground: 0.86, push: 1.14, pan: [-30, 16] }); RAW = false;
RAW = true; FX('pillar', 4.5, { x: AIX + 700, y: AIY, w: 150, color: '#9a5aff', dur: 0.75 }); FL(4.5, 0.2, 0.9, '#e8d0ff'); SH(4.5, 0.5, 20); RAW = false;
S(5.55, 'cu', { actor: 'apep', fill: 0.72, push: 1.16, pan: [24, -12], dutch: 6 });
S(6.85, 'ecu', { actor: 'apep', at: 'eye', zoom: 1.7, push: 1.25, pan: [-16, 6], ...whip(-1, 0.2) });
FX('glint', 7.0, { actor: 'apep', at: 'eye', color: '#b07aff', r: 190, dur: 0.6 });
S(8.05, 'wide', { cx: 700, cy: 700, zoom: 0.6, push: 1.14, pan: [0, -26] });
FX('orbs', 8.15, { x: AIX + 700, y: 560, x2: 1250, y2: 420, n: 4, color: '#9a5aff', arc: 200 });
RAW = true; TX(4.7, E2[0], 'APEP', 540, 300, 118, { anim: 'slam', shadow: '#3a1a7a', bg: { fill: '#0a0614', stroke: '#b07aff', sw: 6 } });
TX(5.1, E2[0], 'EGYPTIAN SERPENT OF CHAOS', 540, 425, 40, { anim: 'pop', color: '#d8c0ff' });
tl.cinema.push([4.5, E2[0] + 0.05]); tl.embers.push([4.5, E2[0], '#b090ff']);
S(E2[0], 'wide', { cx: 560, cy: 900, zoom: 1.0, push: 1.05, pan: [8, 0] });
// ---- Thor's Thrudheim (TI0 - tTe)
const TIX = 640, TIY = 1120, TIS = 0.86;
A('thor', 'land-hero', TI0 - 0.05, m(11.85), { x: [TIX, TIX], y: [TIY, TIY], scale: TIS, flip: -1 });
RAW = false;
A('thor', 'talk', 11.85, 13.4, { voice: 'thor', pose: { eyeGlow: 2.2 } }); A('thor', 'talk', 13.4, 14.7, { voice: 'thor', eyeGlow: 2.6, pose: { eyeGlow: 3.0, brow: 1 } }); A('thor', 'swing', 14.7, 16.0, { pose: { eyeGlow: 2.2 } });
RAW = true; A('thor', 'idle', tTe + 0.02, E3[1], { x: [TX0, TX0], y: [FY, FY], scale: TS, flip: -1 });
S(TI0, 'low', { scene: 'domain-thrudheim', actor: 'thor', zoom: 1.25, ground: 0.86, push: 1.14, pan: [30, 14] });
FX('pillar', TI0, { x: TIX + 300, y: TIY, w: 150, color: '#bfe6ff', dur: 0.75 }); FL(TI0, 0.2, 1, '#e8f6ff'); SH(TI0, 0.5, 18); RAW = false;
S(12.2, 'cu', { actor: 'thor', fill: 0.62, push: 1.15, pan: [-22, -10], dutch: -5 });
S(13.4, 'ecu', { actor: 'thor', at: 'eye', zoom: 4.4, push: 1.25, pan: [16, 4], ...whip(1, 0.2) });
FX('glint', 13.55, { actor: 'thor', at: 'eye', color: '#7ad8ff', r: 130, dur: 0.6 });
S(14.7, 'wide', { cx: 580, cy: 900, zoom: 0.92, push: 1.14, pan: [0, -24] });
FX('orbs', 14.9, { x: TIX - 120, y: 560, x2: -100, y2: 520, n: 4, color: '#9fd8ff', arc: 220 }); FL(14.85, 0.1, 0.6, '#e8f6ff');
RAW = true; TX(TI0 + 0.2, tTe + 0.04, 'THOR', 540, 300, 118, { anim: 'slam', shadow: '#27367c', bg: { fill: '#0c1230', stroke: '#8ad0ff', sw: 6 } });
TX(TI0 + 0.6, tTe + 0.04, 'NORSE GOD OF THUNDER', 540, 425, 40, { anim: 'pop', color: '#cfeaff' });
tl.cinema.push([TI0, tTe + 0.05]); tl.embers.push([TI0, tTe + 0.05, '#cfeaff']);
S(tTe + 0.06, 'wide', { cx: 580, cy: 900, zoom: 1.0, push: 1.05, pan: [-8, 0] });
TX(VST, STORY + 0.1, 'VS', 540, 780, 380, { anim: 'slam', shadow: '#7a2ac8', shadowDx: 16, shadowDy: 18, spacing: 6 });
TX(VST + 0.3, STORY + 0.1, 'WHO WINS?  COMMENT', 540, 1000, 70, { anim: 'blink', color: '#9fd8ff', shadow: '#000' }); FL(VST, 0.2, 0.9); SH(VST, 0.5, 26);
RAW = false;
// ================================================================ 2 STORY on ONE battlefield (desert)
// kid: tent -> wakes -> walks out -> looks up -> flees right out of frame at "ran" -> hidden for the whole 1v1
A('kid', 'sleep', 17.4, 18.85, { x: [KX, KX], y: [1128, 1128], scale: 0.7, flip: -1 }); A('kid', 'bed-wake', 18.85, 19.95, {}); A('kid', 'idle-scared', 19.95, 20.2, {});
A('kid', 'walk', 20.2, 21.3, { x: [KX, 1560], y: [1128, 1150], scale: [0.7, 0.8], flip: -1 }); A('kid', 'look-up', 21.3, 22.5, {}); A('kid', 'idle-scared', 22.5, 23.3, {});
A('kid', 'gasp', 23.3, 23.95, {}); A('kid', 'scared-back', 23.95, 24.6, { x: [1560, 1620], y: [1150, 1160], z: 1 }); A('kid', 'cower', 24.6, 25.4, { z: 1 }); A('kid', 'idle-scared', 25.4, 27.05, { z: 1 });
A('kid', 'run', 27.05, 27.95, { x: [1620, 2300], y: [1160, 1130], flip: 1, speed: 2.8, z: 3 });
// Apep + Thor opening of the fight
A('apep', 'rise-from-sand', 22.0, 23.2, { x: [AX, AX], y: [FY, FY], scale: AS, flip: 1, clipY: FY + 1 }); A('apep', 'strike', 23.2, 24.1, { reach: 370 }); A('apep', 'hypno-gaze', 24.1, 25.2, {});
A('apep', 'strike', 25.2, 26.1, { reach: 300 }); A('apep', 'hypno-gaze', 26.1, 30.9, {}); A('apep', 'recoil', 30.9, 31.8, {}); A('apep', 'hypno-gaze', 31.8, 32.0, {});
A('apep', 'roar', 32.0, 33.8, {}); A('apep', 'roar', 33.9, 35.0, {}); A('apep', 'hypno-gaze', 35.0, 37.95, {});
A('thor', 'land-hero', 23.75, 24.55, { x: [1130, 1130], y: [FY, FY], scale: TS, flip: -1, pose: { eyeGlow: 2.0 } }); A('thor', 'idle', 24.55, 25.45, { pose: { eyeGlow: 1.6 } }); A('thor', 'block', 25.45, 26.5, {}); A('thor', 'idle', 26.5, 28.6, { x: [1130, TX0] });
A('thor', 'belt-power', 28.7, 30.5, { pose: { eyeGlow: 2.2 } }); A('thor', 'throw-hammer', 30.4, 31.4, {}); A('thor', 'catch-hammer', 31.4, 32.5, {}); A('thor', 'idle', 32.5, 33.6, {}); A('thor', 'block', 33.6, 34.6, {});
A('thor', 'recoil', 34.9, 36.0, { x: [TX0, SQ], pose: { eyeGlow: 1.6 } }); A('thor', 'idle', 36.0, 37.9, { pose: { eyeGlow: 0.5, head: 8, aR: [8, -4], aL: [-4, 0], mouth: 0.1 } });
// squeeze (#32-34): two Apep layers around Thor; the main Apep head strikes into Thor's shoulder at "Venom" (front arcs stay, head hidden)
A('apepB', 'coil-squeeze', 37.95, 43.0, Object.assign({ layer: 1 }, SQA)); A('apepF', 'coil-squeeze', 37.95, 41.5, Object.assign({ layer: 2 }, SQA)); A('apepF', 'coil-squeeze', 41.5, 43.0, Object.assign({ layer: 3, age: 3.6 }, SQA));
A('thor', 'strangled', 37.95, 41.65, { pose: { eyeGlow: 2.2 } }); A('thor', 'strangled', 41.65, 43.05, { pose: { venom: 0.8, eyeGlow: 2.2 } });
A('apep', 'strike', 41.2, 42.5, { reach: 345, rear2: 0.67, z: 2.5 });
A('thor', 'stagger-venom', 43.05, 47.3, { x: [SQ, TEND], pose: { venom: 0.9, eyeGlow: 2.0 } });
A('apep', 'recoil', 43.0, 43.8, {}); A('apep', 'hypno-gaze', 43.8, 45.6, {}); A('apep', 'roar', 45.6, 47.4, {}); A('apep', 'hypno-gaze', 47.4, 48.5, {}); A('apep', 'roar', 48.5, 51.5, {}); A('apep', 'hypno-gaze', 51.5, 55.5, {});
A('thor', 'stagger-venom', 47.3, 48.3, { x: [TEND, TX0], pose: { venom: 0.9, eyeGlow: 2.0 } }); A('thor', 'lightning-call', 48.3, 50.8, { pose: { venom: 0.8, eyeGlow: 2.4 } }); A('thor', 'kneel', 50.8, 52.4, { pose: { venom: 0.9, eyeGlow: 1.6 } });
A('thor', 'idle', 52.4, 54.7, { x: [TEND, TEND], pose: { venom: 0.8, eyeGlow: 2.0 } }); A('thor', 'throw-hammer', 54.7, 55.7, { pose: { venom: 0.8, eyeGlow: 2.0 } }); A('thor', 'idle', 55.7, 56.9, { pose: { venom: 0.8, hammer: 0 } });
A('thor', 'lightning-call', 56.9, 59.0, { pose: { venom: 0.7, eyeGlow: 3.0 } }); A('thor', 'kneel', 59.0, 65.4, { pose: { venom: 0.6, eyeGlow: 1.8 } });
A('apep', 'swallow', 55.5, 57.3, { reach: 330 }); A('apep', 'roar', 57.3, 59.0, {}); A('apep', 'recoil', 59.0, 59.9, {}); A('apep', 'sink', 59.9, 62.4, { clipY: FY + 1 });
A('thor', 'talk', 65.4, 69.8, { voice: 'thor', pose: { venom: 0.6, eyeGlow: 2.2 }, hoarse: 1 }); A('thor', 'kneel', 69.8, 70.5, { pose: { venom: 0.6 } });
A('kid', 'peek', 62.6, 64.0, { x: [760, 760], y: [1112, 1112], scale: 0.55, flip: -1, z: 0.6 }); A('kid', 'look-up', 64.0, 65.4, { x: [760, 760], y: [1112, 1112], scale: 0.62, flip: -1, z: 3 });
A('kid', 'talk', 65.4, 70.4, { voice: 'kid', x: [760, 760], y: [1112, 1112], scale: 0.62, flip: -1 }); A('kid', 'idle-scared', 70.4, 71.5, { x: [860, 860], y: [1130, 1130], scale: 0.7, flip: -1 });
// ---- shots (wide = coils + giant Apep visible, low angles look up at the head)
RAW = true; S(STORY, 'wide', { scene: 'domain-desert', cx: 1400, cy: 900, zoom: 0.9, push: 1.1, pan: [30, -10] }); RAW = false;                                                          // 15 tent (STORY is already v2 time)
S(18.85, 'insert', { cx: KX, cy: 1000, zoom: 2.1, push: 1.14, pan: [-24, 6] });                                                                              // 16 sand pours, kid wakes
FX('dust', 18.85, { x: KX - 30, y: 1090, n: 18, r: 80 }); SH(18.9, 0.4, 6);
S(20.2, 'follow', { actor: 'kid', dx: -40, dy: -190, zoom: 1.5, push: 1.1, pan: [-34, -10] });                                                              // 17 kid steps out, looks up
S(22.0, 'low', { actor: 'apep', dx: 700, zoom: 0.5, ground: 0.84, push: 1.12, pan: [26, -16] });                                                             // 18 Apep rises (colossal)
FX('pillar', 22.05, { x: AX + 420, y: FY, w: 260, color: '#7a3aff', dur: 0.6 }); FX('soil', 22.2, { x: AX + 400, y: FY, n: 30 }); SH(22.05, 0.9, 20);
S(23.2, 'versus', { a: 'apep', b: 'thor', cy: 560, zoom: 0.62, push: 1.12, pan: [60, 0] });                                                                  // 19 fang toward the kid
S(24.06, 'wide', { cx: 1300, cy: 880, zoom: 0.85, push: 1.12, pan: [-36, 0], ...whip(1, 0.2) });                                                              // 20 Thor lands (cart streak, kid clear at right)
FX('beam', 24.0, { x: 1130, y: -200, x2: 1130, y2: 1090, w: 110, color: '#cfeaff', charge: 0.0, dur: 0.5, r: 260 }); FL(24.1, 0.15, 0.9, '#e8f6ff'); SH(24.1, 0.5, 22); FX('impact', 24.15, { x: 1130, y: 1110, r: 170 });
S(25.55, 'versus', { a: 'apep', b: 'thor', cy: 760, zoom: 0.95, push: 1.14, pan: [-40, 8] });                                                                // 20b block
FX('impact', 25.62, { x: 1040, y: 800, r: 220 }); FL(25.62, 0.14, 0.9); SH(25.62, 0.45, 20);
S(27.05, 'wide', { cx: 1500, cy: 960, zoom: 0.95, push: 1.1, pan: [-30, 0] });                                                                               // 21 kid runs off right
S(28.0, 'wide', { cx: 430, cy: 640, zoom: 0.58, push: 1.1, pan: [30, -10], ...whip(1, 0.2) });                                                               // 22 face-off establishing, whole desert coiled
S(29.05, 'cu', { actor: 'thor', fill: 0.95, dy: 120, push: 1.15, pan: [16, 0] });                                                                            // 23 belt
FX('pillar', 30.0, { x: TX0, y: FY, w: 110, color: '#bfe6ff', dur: 0.75 }); FL(30.02, 0.18, 0.8, '#e8f6ff'); SH(30.02, 0.5, 14); FX('dust', 30.05, { x: TX0, y: FY - 10, n: 24, r: 90 });
S(30.56, 'versus', { a: 'apep', b: 'thor', cy: 560, zoom: 0.62, push: 1.12, pan: [-46, 0] });                                                                // 24 hammer throw
FX('slash', 30.95, { x: TX0 - 90, y: 800, x2: 600, y2: 260, r: 260, color: '#bfe6ff', flipV: true });
S(31.25, 'versus', { a: 'apep', b: 'thor', cy: 500, zoom: 0.8, push: 1.1, pan: [30, -10], ...whip(-1, 0.2) });                                               // 25 hit + catch
FX('slash', 31.4, { x: 600, y: 260, x2: TX0 - 90, y2: 810, r: 200, color: '#bfe6ff', br: 90 }); FX('glint', 31.65, { actor: 'thor', at: 'hammer', color: '#d8f0ff', r: 100, dur: 0.5 }); FL(31.3, 0.12, 0.8); SH(31.3, 0.4, 14);
S(32.0, 'low', { actor: 'thor', dx: -380, zoom: 0.62, ground: 0.86, push: 1.14, pan: [-30, 14], dutch: -7, dutchTo: -2 });                                    // 26 spires + coils erupt
SH(32.35, 1.6, 26); FX('soil', 32.4, { x: 800, y: FY, n: 30 }); FX('dust', 32.45, { x: 1240, y: FY, n: 24, r: 120 });
S(33.05, 'ecu', { actor: 'apep', at: 'mouth', zoom: 1.0, push: 1.2, pan: [10, -6] }); SH(33.05, 0.8, 12);                                                    // 27 roar
S(34.1, 'versus', { a: 'apep', b: 'thor', cy: 560, zoom: 0.62, push: 1.1, pan: [50, 0] });                                                                  // 28 orbs
FX('orbs', 34.15, { x: 600, y: 300, x2: 1060, y2: 840, n: 5, color: '#9a5aff', arc: 300, r: 40 });
S(35.0, 'cu', { actor: 'thor', fill: 0.85, push: 1.15, pan: [-22, 6], ...whip(1, 0.2) });                                                                    // 29 Thor flung
FL(34.95, 0.15, 0.9, '#d8b8ff'); SH(34.95, 0.7, 20); FX('dust', 35.0, { x: 1140, y: FY - 6, n: 22, r: 120 });
S(36.65, 'ecu', { actor: 'apep', at: 'eye', zoom: 1.5, push: 1.24, pan: [-14, 4] });                                                                         // 30 hypno eye
FX('glint', 36.8, { actor: 'apep', at: 'eye', color: '#c090ff', r: 190, dur: 0.6 });
S(37.3, 'cu', { actor: 'thor', fill: 0.85, push: 1.14, pan: [18, -8] });                                                                                      // 31 frozen
S(38.0, 'wide', { cx: 540, cy: 620, zoom: 0.6, push: 1.12, pan: [40, -20] });                                                                                 // 32 coils lift Thor
S(39.4, 'cu', { actor: 'thor', fill: 0.85, push: 1.22, pan: [-20, 8], hand: 3 });                                                                             // 33 strangled
FX('sparks', 39.6, { x: SQ - 50, y: 640, n: 16, color: '#bfe6ff' });
S(41.65, 'wide', { cx: 980, cy: 760, zoom: 1.25, push: 1.1, pan: [14, -10] }); FL(41.65, 0.15, 0.8, '#9aff7a'); SH(41.65, 0.4, 16);                              // 34 fangs reach Thor's shoulder
S(43.05, 'wide', { cx: 700, cy: 700, zoom: 0.62, push: 1.12, pan: [50, 0] });                                                                                // 35 staggers
FL(43.05, 0.16, 0.9, '#e8f6ff'); FX('beam', 43.05, { x: 900, y: -100, x2: SQ, y2: 800, w: 40, color: '#cfeaff', charge: 0, dur: 0.35, r: 120 });
S(44.7, 'insert', { cx: 760, cy: 1040, zoom: 2.3, push: 1.14, pan: [20, -8] });                                                                               // 36 flashlight flickers
S(45.8, 'wide', { cx: 500, cy: 620, zoom: 0.58, push: 1.1, pan: [0, -30], ...whip(1, 0.2) });                                                                 // 37 totality (brighter)
FX('pillar', 45.9, { x: AX + 500, y: FY, w: 300, color: '#7a2ad8', dur: 0.9 }); SH(45.86, 1.0, 14); TN({ t0: 45.8, t1: 47.3, a: 0.1, color: '#000000', fadeIn: 0.15, fadeOut: 0.5 });
S(47.3, 'insert', { cx: 640, cy: 1060, zoom: 2.1, push: 1.12, pan: [-24, 4] });                                                                                // 38 light goes out
FL(47.3, 0.14, 0.9, '#ffffff'); FL(47.95, 0.25, 1, '#000000'); SH(47.3, 0.5, 12);
S(48.5, 'versus', { a: 'apep', b: 'thor', cy: 560, zoom: 0.62, push: 1.1, pan: [-40, -10] });                                                               // 39 both charge
FX('beam', 48.67, { x: 640, y: 330, x2: 660, y2: 330, w: 110, color: '#a040ff', charge: 1.25, grow: 0.05, dur: 1.3, hit: false }); FX('beam', 48.67, { x: 1080, y: 700, x2: 1060, y2: 700, w: 70, color: '#9fd8ff', charge: 1.25, grow: 0.05, dur: 1.3, hit: false });
S(49.95, 'versus', { a: 'apep', b: 'thor', cy: 520, zoom: 0.62, push: 1.12, pan: [40, 0], dutch: 3, dutchTo: -3, hand: 5 });                                      // 40 clash, Apep wins
FX('beam-clash', 49.95, { dur: 1.9, x: 660, y: 340, x2: 1060, y2: 700, colorL: '#a040ff', colorR: '#9fd8ff', w: 110, win: 'L', winAt: 0.9 }); SH(50.0, 1.4, 18); SL(50.9, 51.25, 0.5);
S(51.25, 'low', { actor: 'thor', dx: -300, zoom: 0.7, ground: 0.86, push: 1.12, pan: [-30, 12], dutch: 5 });                                                  // 41 one knee
S(52.5, 'insert', { cx: TEND + 40, cy: 1010, zoom: 1.7, push: 1.16, pan: [50, -6] }); FX('glint', 53.0, { actor: 'thor', at: 'hand', color: '#ffe9b0', r: 100, dur: 0.5 });  // 42 ox head
S(54.95, 'versus', { a: 'apep', b: 'thor', cy: 560, zoom: 0.6, push: 1.1, pan: [-44, -10] });                                                                 // 43 bait arc
FX('orbs', 55.15, { x: TEND - 60, y: 780, x2: 640, y2: 330, n: 1, color: '#ffd890', arc: 460, r: 40, fly: 0.7 }); FX('slash', 55.2, { x: TEND - 80, y: 760, x2: 650, y2: 330, r: 200, color: '#ffe0a0', hit: false });
S(55.8, 'cu', { actor: 'apep', fill: 0.72, push: 1.15, pan: [24, -8], ...whip(-1, 0.2) });                                                                    // 44 lunges for bait
S(57.1, 'versus', { a: 'apep', b: 'thor', cy: 540, zoom: 0.6, push: 1.15, pan: [40, 0], dutch: -3, dutchTo: 3, hand: 5, slow: 0.6, crash: { at: 58.85, dur: 0.12, k: 1.4 } }); // 45 blast
FX('beam-clash', 57.45, { dur: 1.7, x: 680, y: 300, x2: 1180, y2: 700, colorL: '#a040ff', colorR: '#bfe6ff', w: 120, win: 'R', winAt: 0.7 }); FX('pillar', 58.2, { x: AX + 420, y: FY, w: 280, color: '#bfe6ff', dur: 0.8 }); SH(57.9, 1.2, 24); FL(58.85, 0.2, 1, '#e8f6ff');
S(59.0, 'ecu', { actor: 'apep', at: 'eye', zoom: 1.3, push: 1.2, pan: [10, 0], crash: { at: 59.05, dur: 0.1, k: 1.3 } });                                  // 46 crash on the eye
FX('glint', 59.1, { actor: 'apep', at: 'eye', color: '#ffffff', r: 220, dur: 0.5 }); FL(59.0, 0.18, 1, '#ffffff'); SH(59.0, 0.8, 26);
S(59.6, 'wide', { cx: 440, cy: 600, zoom: 0.55, push: 1.14, pan: [30, -14] });                                                                                 // 47 spews dark, sunlight
FX('smoke', 59.75, { x: AX + 800, y: 700, n: 20, dark: true, spread: 300 }); FX('smoke', 60.2, { x: AX + 700, y: 820, n: 18, dark: true, spread: 360 }); FL(61.0, 0.35, 0.7, '#ffe9b0');
S(62.6, 'insert', { scene: 'domain-day', cx: 780, cy: 1040, zoom: 1.9, push: 1.12, pan: [-26, -4] });                                                                // 48 kid back
S(64.1, 'wide', { cx: 1020, cy: 900, zoom: 0.92, push: 1.1, pan: [-40, -8] });                                                                                  // 49 kid + weak Thor
S(65.5, 'cu', { actor: 'thor', fill: 0.85, push: 1.12, pan: [20, 6], dutch: 4 });                                                                              // 50 Thor speaks
S(67.55, 'cu', { actor: 'thor', fill: 1.05, push: 1.16, pan: [-18, -6], dutch: -4 });                                                                          // 50b
S(69.8, 'reaction', { actor: 'kid', fill: 0.62, push: 1.14, pan: [14, 0] });                                                                                   // 51 kid
S(70.45, 'wide', { scene: 'domain-dusk', cx: 480, cy: 1020, zoom: 0.9, push: 1.12, pan: [40, 10], dutch: -4, cap: 'top' });                                   // 52 serpent shadow (high contrast, caption on top)
S(71.5, 'wide', { scene: 'domain-dusk', cx: 540, cy: 960, zoom: 1.0, push: 1.1, pan: [20, 30] });                                                             // 53 sunset dunes
S(72.8, 'insert', { cx: 600, cy: 1190, zoom: 1.7, push: 1.25, pan: [-20, -10], tr: { type: 'fade', dur: 0.35 } });                                            // 54 eye opens
TX(74.6, 76.85, 'IS IT REALLY DEAD?', 540, 1330, 84, { anim: 'blink', color: '#d8c0ff', shadow: '#000' });
TN({ t0: 76.0, t1: 76.85, a: 1, color: '#000000', fadeIn: 0.8 });
// ---- action-wide overlays
CI(22.0, 62.5); EM(17.4, 22.0, '#ffb04a'); EM(22.0, 62.5, '#d8a8ff'); EM(62.6, 70.4, '#ffd8a0'); EM(71.5, 76.4, '#ff9a50');
tl.shake.sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(tl));
console.log('wrote timeline.json', tl.shots.length, 'shots,', tl.cues.length, 'cues, duration', DUR, 'E2', E2.map((x) => +x.toFixed(2)), 'TI0', +TI0.toFixed(2), 'tTe', +tTe.toFixed(2), 'VST', +VST.toFixed(2), 'STORY', STORY);
