#!/usr/bin/env node
// Episode #006: SCP-682 vs ZEUS (Part 2 · Direction 2: Master Bolt Vaporization + Single Bone-Shard Regen)
// Builds episodes/scp682-vs-zeus/anim/timeline.json synchronized to audio-anim/sections.json & words.json.
const fs = require('fs');
const path = require('path');
const kit = require('../../../tools/anim/episode_kit');

const EP = path.resolve(__dirname, '..');
const AU = path.join(EP, 'audio-anim');
const S = JSON.parse(fs.readFileSync(path.join(AU, 'sections.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(path.join(AU, 'words.json'), 'utf8'));

const sec = (name) => S.sections.find((x) => x.name === name);
const sent = (pref) => S.sentences.find((x) => x.text.startsWith(pref));
const wordsIn = (t0, t1, spk) =>
  W.filter((w) => w.start >= t0 - 0.15 && w.end <= t1 + 0.15 && (!spk || w.speaker === spk))
    .map((w) => [w.start, w.end]);

const D = S.duration;
const t_m0 = sec('intro_scp682').start;
const t_m1 = sec('intro_scp682').end;
const t_g0 = sec('intro_zeus').start;
const t_g1 = sec('intro_zeus').end;
const t_story = sec('story').start;
const t_descend = sent('Zeus descended').start;
const t_fight = sec('fight').start;
const t_absorb = sec('absorb').start;
const t_delic = sent('Delicious').start;
const t_slam = sent('Supercharged').start;
const t_aegis = sec('aegis').start;
const t_ripped = sent('The blast ripped').start;
const t_overdrive = sec('overdrive').start;
const t_climax = sec('climax').start;
const t_erase = sent('Be erased').start;
const t_vaporize = sec('vaporize').start;
const t_after = sec('aftermath').start;
const t_safe = sent('The sky is safe').start;
const t_cliff = sec('cliffhanger').start;
const t_whisp = sec('whisper').start;

const voices = {
  scp682: { words: wordsIn(0, D, 'scp682') },
  zeus: { words: wordsIn(0, D, 'zeus') },
};

const tl = {
  fps: 24,
  duration: D,
  camInit: { cx: 880, cy: 840, zoom: 0.72 },
  sides: { left: 'scp682', right: 'zeus' },
  voices,
  domains: {
    acid: {
      sky: ['#050c08', '#102818'],
      glow: '#66ff33',
      floor: ['#122216', '#060c07'],
      motif: 'lab',
      rock: '#1b2620',
      sigil: '#66ff33',
      motes: '#9eff4a',
      mist: '#44cc33',
      horizon: 960,
    },
    olympus: {
      sky: ['#10143d', '#2b327d', '#8666db', '#ffd859'],
      glow: '#ffd859',
      floor: ['#dce6ff', '#7690d8'],
      motif: 'columns',
      rock: '#eef4ff',
      sigil: '#ffd859',
      motes: '#66f0ff',
      mist: '#c8b2ff',
      horizon: 980,
    },
    'city-storm': {
      sky: ['#060a18', '#121b36', '#1e2848'],
      glow: '#ffd859',
      floor: ['#161922', '#090b10'],
      motif: 'city',
      rock: '#101624',
      sigil: null,
      motes: '#ffd859',
      mist: '#2e4066',
      horizon: 980,
    },
  },
  actors: {
    scp682: {
      kind: 'scp682',
      x: 380,
      y: 1120,
      scale: 1.32,
      flip: 1,
      z: 30,
      rim: '#7cff3b',
      rimPx: 7,
      aura: { colors: ['#5ce62e', '#8f0e16', '#d9ff3f'], r: 265, h: 225, motes: true, on: 0.85 },
    },
    zeus: {
      kind: 'zeus',
      x: 1380,
      y: 1120,
      scale: 1.06,
      flip: -1,
      z: 35,
      rim: '#ffd859',
      rimPx: 8,
      pose: { aegis: 0, bolt: 1 },
      aura: { colors: ['#5b4bff', '#38c6ff', '#ffd94a', '#fffbe0'], r: 280, h: 270, motes: true, on: 1.0 },
    },
  },
  props: [
    // Overturned burning car wreck on downtown avenue (continuity from ep005!)
    {
      type: 'shape',
      x: 1020,
      y: 1135,
      scale: 1.0,
      z: 20,
      scene: 'domain-city-storm',
      shapes: [
        { k: 'poly', pts: [[-140, 10], [-125, -45], [-55, -75], [65, -72], [130, -35], [145, 10]], fill: '#1c222e', stroke: '#0c1018', sw: 4 },
        { k: 'poly', pts: [[-45, -62], [45, -60], [65, -32], [-65, -32]], fill: '#2c3d52', op: 0.75 },
        { k: 'ell', cx: -85, cy: 5, rx: 24, ry: 24, fill: '#0b0d12' },
        { k: 'ell', cx: 85, cy: 5, rx: 24, ry: 24, fill: '#0b0d12' },
        { k: 'glow', cx: -100, cy: -35, r: 90, color: '#ff5a1a', op: 0.65, flick: 0.35 },
      ],
    },
    // Rising shattered asphalt & bone spires during climax
    { type: 'spire', x: 180, y: 1130, scale: 1.0, h: 520, w: 150, tilt: -10, color: '#66ff33', rock: '#181f1a', track: 'rise', scene: 'domain-city-storm', z: 12, seed: 3 },
    { type: 'spire', x: 640, y: 1120, scale: 0.9, h: 460, w: 130, tilt: 12, color: '#ff2438', rock: '#1b171b', track: 'rise', scene: 'domain-city-storm', z: 14, seed: 7 },
    // Smoking vaporization crater + single charred bone shard regenerating in fissure (Cliffhanger C1!)
    {
      type: 'shape',
      x: 420,
      y: 1125,
      scale: 1.0,
      z: 38,
      scene: 'domain-city-storm',
      shapes: [
        // Dark cracked asphalt fissure
        { k: 'ell', cx: 0, cy: 10, rx: 260, ry: 44, fill: '#07090d', track: 'crater' },
        { k: 'poly', pts: [[-190, 5], [-70, -14], [10, 12], [110, -10], [210, 12], [90, 34], [-90, 32]], fill: '#030406', track: 'crater' },
        // Single charred bone shard pulsing crimson-green
        { k: 'glow', cx: 0, cy: 2, r: 120, color: '#7cff3b', op: 0.85, track: 'shardPulse', flick: 0.3 },
        { k: 'glow', cx: 0, cy: 2, r: 78, color: '#ff2438', op: 0.8, track: 'shardPulse', flick: 0.25 },
        { k: 'poly', pts: [[-48, 12], [-22, -24], [18, -32], [54, -8], [32, 18], [-18, 22]], fill: '#e8e2d0', stroke: '#3a342c', sw: 4, track: 'shardPulse' },
        // Wet crimson regenerating tendrils wrapping the shard
        { k: 'poly', pts: [[-62, 18], [-34, -8], [-12, 10], [-42, 26]], fill: '#c81822', track: 'shardEye' },
        { k: 'poly', pts: [[34, -14], [74, -4], [62, 18], [26, 8]], fill: '#c81822', track: 'shardEye' },
        { k: 'poly', pts: [[-8, -28], [10, -56], [26, -24]], fill: '#a8121c', track: 'shardEye' },
        // Tiny glowing acid-green eye snapping open on the shard!
        { k: 'ell', cx: 6, cy: -8, rx: 22, ry: 13, fill: '#ff3b1f', track: 'shardEye' },
        { k: 'ell', cx: 6, cy: -8, rx: 16, ry: 9, fill: '#d9ff3f', track: 'shardEye' },
        { k: 'ell', cx: 6, cy: -8, rx: 3.5, ry: 8.5, fill: '#0b0e08', track: 'shardEye' },
      ],
    },
    // Golden Olympus dawn sky glow
    {
      type: 'shape',
      x: 900,
      y: 220,
      scale: 1.0,
      z: 6,
      scene: 'domain-city-storm',
      shapes: [
        { k: 'glow', cx: 0, cy: 0, r: 620, color: '#ffd859', op: 0.9, track: 'dawnGlow', flick: 0.15 },
        { k: 'glow', cx: 140, cy: -40, r: 380, color: '#38c6ff', op: 0.65, track: 'dawnGlow', flick: 0.2 },
      ],
    },
  ],
  tracks: {
    rise: [
      { t0: 0, t1: t_climax - 0.1, v: 0 },
      { t0: t_climax, t1: t_climax + 1.0, v: 1, ease: 'outCubic' },
      { t0: t_climax + 1.0, t1: D, v: 1 },
    ],
    crater: [
      { t0: 0, t1: t_vaporize + 1.2, v: 0 },
      { t0: t_vaporize + 1.2, t1: t_vaporize + 1.8, v: 1, ease: 'outCubic' },
      { t0: t_vaporize + 1.8, t1: D, v: 1 },
    ],
    shardPulse: [
      { t0: 0, t1: t_cliff - 0.2, v: 0 },
      { t0: t_cliff, t1: t_cliff + 0.9, v: 1, ease: 'outCubic' },
      { t0: t_cliff + 0.9, t1: D, v: 1 },
    ],
    shardEye: [
      { t0: 0, t1: t_whisp - 0.8, v: 0 },
      { t0: t_whisp - 0.65, t1: t_whisp - 0.25, v: 1, ease: 'outBack' },
      { t0: t_whisp - 0.25, t1: D, v: 1 },
    ],
    dawnGlow: [
      { t0: 0, t1: t_after - 0.3, v: 0.25 },
      { t0: t_after, t1: t_after + 2.0, v: 0.95, ease: 'outCubic' },
      { t0: t_cliff - 0.2, t1: t_cliff + 0.4, v: 0.2, ease: 'inOut' },
      { t0: t_cliff + 0.4, t1: D, v: 0.15 },
    ],
  },
  cues: [],
  shots: [],
  fx: [],
  text: [],
  shake: [],
  flash: [],
  cinema: [],
  embers: [],
  glitch: [],
  tints: [],
  black: [],
};

// ==================== 1. OPENING (HOOK + SPLIT-ROLL + 2 INTROS + VS) ====================
const lockL = +(t_m0 - 0.55).toFixed(2);
const lockR = +(t_g0 - 0.60).toFixed(2);
const T = kit.opening(tl, {
  hookEnd: 3.0,
  hookText: 2.0,
  lockL,
  monsterIntro: [t_m0 - 0.1, t_m1 + 0.05],
  lockR,
  guardianIntro: [t_g0 - 0.1, t_g1 + 0.05],
  story: t_story - 0.08,
  monster: {
    kind: 'scp682',
    label: 'SCP-682',
    sub: 'EVOLVED REPTILE',
    title: 'SCP-682 · EVOLVED HARD-TO-DESTROY REPTILE',
    domain: 'acid',
    color: '#7cff3b',
    glow: '#8f0e16',
    card: { fx: 40, fy: 255, fscale: 0.34, idle: 'idle-card' },
    pillar: { x: 180, y: 1120, w: 140 },
  },
  guardian: {
    kind: 'zeus',
    label: 'ZEUS',
    sub: 'KING OF OLYMPUS',
    title: 'ZEUS · KING OF OLYMPUS',
    domain: 'olympus',
    color: '#ffd859',
    glow: '#38c6ff',
    card: { fx: 0, fy: 265, fscale: 0.44, idle: 'idle-card' },
    pillar: { x: 1580, y: 1120, w: 150 },
  },
});

const addShot = (s) => tl.shots.push(s);
const addCue = (c) => tl.cues.push(c);
const addFx = (f) => tl.fx.push(f);

// ---- HOOK SHOTS (0..3.0 s): ZEUS THUNDER PILLAR DESCENT -> MUSCULAR ZEUS -> CLASH ----
addShot({ t: 0.0, type: 'high', scene: 'domain-city-storm', cx: 1220, cy: 760, zoom: 0.80, push: 1.15, pan: [20, 40] });
addShot({ t: 1.05, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.12, pan: [-20, -15], tr: { type: 'whip', dur: 0.14, dir: -1 } });
addShot({ t: 2.0, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 840, maxZoom: 0.84, push: 1.15, pan: [0, -20] });

addCue({ actor: 'zeus', action: 'descend', t0: 0.0, t1: 1.05, params: { x: [1380, 1380], y: [360, 1120], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 1.6, aegis: 0, overdrive: 0.8 } } });
addCue({ actor: 'zeus', action: 'master-bolt-fire', t0: 1.05, t1: 3.05, params: { x: [1380, 1360], y: [1120, 1120], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 2.0, aegis: 0, overdrive: 1.0 } } });
addCue({ actor: 'scp682', action: 'roar', t0: 0.0, t1: 3.05, params: { x: [420, 440], y: [1120, 1120], scale: 1.34, flip: 1, pose: { armor: 1, wings: 1 } } });
addFx({ type: 'pillar', t0: 0.1, dur: 0.9, x: 1380, y: 1120, w: 220, color: '#ffd94a' });
addFx({ type: 'lightning', t0: 0.1, dur: 0.95, x: 1380, y: 40, x2: 1380, y2: 1120, color: '#ffd94a', color2: '#38c6ff', w: 36, branches: 6 });
addFx({ type: 'beam-clash', t0: 2.0, dur: 1.0, x: 640, y: 840, x2: 1180, y2: 840, colorL: '#66ff33', colorR: '#ffd94a', w: 76, amp: 0.08 });
tl.flash.push({ t0: 0.35, dur: 0.16, amp: 0.85, color: '#fff5c8' });
tl.shake.push({ t0: 0.35, dur: 0.45, amp: 24 });

// ---- SPLIT-ROLL PLACEHOLDER 1 ----
addShot({ t: 3.0, type: 'wide', scene: 'domain-acid', cx: 540, cy: 900, zoom: 0.85, push: 1.04, pan: [10, 0] });

// ---- INTRO MONSTER: EVOLVED SCP-682 ----
const [mi0, mi1] = T.intro.L;
const md = mi1 - mi0;
addShot({ t: mi0, type: 'low', scene: 'domain-acid', actor: 'scp682', zoom: 0.90, ground: 0.85, push: 1.1, pan: [25, -15] });
addShot({ t: mi0 + md * 0.28, type: 'cu', scene: 'domain-acid', actor: 'scp682', fill: 0.56, push: 1.1, pan: [18, -8] });
addShot({ t: mi0 + md * 0.55, type: 'ecu', scene: 'domain-acid', actor: 'scp682', at: 'eye', zoom: 2.0, push: 1.12, pan: [12, 0] });
addShot({ t: mi0 + md * 0.76, type: 'wide', scene: 'domain-acid', cx: 480, cy: 890, zoom: 0.82, push: 1.08, pan: [-30, -15] });
addCue({ actor: 'scp682', action: 'talk', t0: mi0, t1: mi1 + 0.1, params: { x: [420, 440], y: [1120, 1120], scale: 1.32, flip: 1, voice: 'scp682', pose: { armor: 1, wings: 1, wingAng: -45 } } });
addFx({ type: 'glint', t0: mi0 + md * 0.56, dur: 0.65, actor: 'scp682', at: 'eye', color: '#d9ff3f', r: 95 });
addFx({ type: 'smoke', t0: mi0 + 0.1, x: 440, y: 1080, dur: 2.4, n: 14, r: 90, dark: true });

// ---- SPLIT-ROLL PLACEHOLDER 2 ----
addShot({ t: T.emerge.L[0], type: 'wide', scene: 'domain-olympus', cx: 1280, cy: 860, zoom: 0.85, push: 1.04, pan: [-10, 0] });

// ---- INTRO GUARDIAN: MUSCULAR ZEUS ----
const [gi0, gi1] = T.intro.R;
const gd = gi1 - gi0;
addShot({ t: gi0, type: 'low', scene: 'domain-olympus', actor: 'zeus', zoom: 0.94, ground: 0.86, push: 1.1, pan: [-25, -18] });
addShot({ t: gi0 + gd * 0.28, type: 'cu', scene: 'domain-olympus', actor: 'zeus', fill: 0.56, push: 1.1, pan: [-18, -8] });
addShot({ t: gi0 + gd * 0.55, type: 'ecu', scene: 'domain-olympus', actor: 'zeus', at: 'eye', zoom: 2.5, push: 1.12, pan: [-12, 0] });
addShot({ t: gi0 + gd * 0.76, type: 'wide', scene: 'domain-olympus', cx: 1320, cy: 860, zoom: 0.82, push: 1.08, pan: [28, -18] });
addCue({ actor: 'zeus', action: 'talk', t0: gi0, t1: gi1 + 0.1, params: { x: [1340, 1340], y: [1120, 1120], scale: 1.08, flip: -1, voice: 'zeus', pose: { bolt: 1, boltGlow: 1.5, aegis: 0, overdrive: 0.6 } } });
addFx({ type: 'glint', t0: gi0 + gd * 0.56, dur: 0.65, actor: 'zeus', at: 'eye', color: '#ffd859', r: 105 });
addFx({ type: 'sparks', t0: gi0 + gd * 0.75, x: 1340, y: 780, dur: 1.1, n: 26, spread: 260 });

// ---- SPLIT-ROLL PLACEHOLDER 3 (VS) ----
addShot({ t: T.emerge.R[0], type: 'wide', scene: 'domain-city-storm', cx: 900, cy: 840, zoom: 0.76, push: 1.05, pan: [15, 0] });

// ==================== 2. STORY & BATTLE (BURNING CITY SEQUEL) ====================
tl.cinema.push([t_story, t_after - 0.2]);
tl.embers.push([t_story, t_aegis, '#7cff3b']);
tl.embers.push([t_aegis, t_after, '#ffd859']);

// --- OPENING: OLYMPUS SKY TEARS OPEN -> ZEUS DESCENDS ---
addShot({ t: t_story, type: 'high', scene: 'domain-city-storm', cx: 960, cy: 520, zoom: 0.74, push: 1.14, pan: [20, 45] });
addShot({ t: t_story + 2.0, type: 'low', scene: 'domain-city-storm', actor: 'zeus', zoom: 0.90, ground: 0.86, push: 1.12, pan: [-25, -20] });
addShot({ t: t_descend, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.12, pan: [-15, -10] });
addShot({ t: t_descend + 2.3, type: 'wide', scene: 'domain-city-storm', cx: 880, cy: 860, zoom: 0.66, push: 1.08, pan: [0, -20] });
addCue({ actor: 'scp682', action: 'roar', t0: t_story, t1: t_fight, params: { x: [400, 420], y: [1120, 1120], scale: 1.34, flip: 1, pose: { armor: 1, wings: 1 } } });
addCue({ actor: 'zeus', action: 'descend', t0: t_story, t1: t_story + 2.2, params: { x: [1380, 1380], y: [240, 1120], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 1.4, aegis: 0, } } });
addCue({ actor: 'zeus', action: 'land-hero', t0: t_story + 2.2, t1: t_fight, params: { x: [1380, 1360], y: [1120, 1120], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 1.5, aegis: 0, } } });
addFx({ type: 'lightning', t0: t_story + 0.3, dur: 1.2, x: 1380, y: 30, x2: 1380, y2: 1120, color: '#ffd94a', color2: '#38c6ff', w: 34, branches: 6 });
addFx({ type: 'pillar', t0: t_story + 1.9, dur: 0.8, x: 1380, y: 1120, w: 220, color: '#ffd94a' });
addFx({ type: 'impact', t0: t_story + 2.1, x: 1380, y: 1120, dur: 0.75, r: 210 });
addFx({ type: 'dust', t0: t_story + 2.1, x: 1380, y: 1120, dur: 1.1, n: 24, spread: 340 });
tl.flash.push({ t0: t_story + 2.1, dur: 0.16, amp: 0.85, color: '#fff4c4' });
tl.shake.push({ t0: t_story + 2.1, dur: 0.5, amp: 24 });

// ==================== BEAT 1: 682 ABSORBS ZEUS'S WARNING BOLT & SURGES ====================
addShot({ t: t_fight, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.14, pan: [-25, 0] });
addShot({ t: t_fight + 1.5, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 880, maxZoom: 0.80, push: 1.12, pan: [-30, 0], tr: { type: 'whip', dur: 0.16, dir: -1 } });
addCue({ actor: 'zeus', action: 'bolt-throw', t0: t_fight, t1: t_absorb, params: { x: [1360, 1340], y: [1120, 1120], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 1.7, aegis: 0, } } });
addFx({ type: 'glint', t0: t_fight + 0.25, dur: 0.5, actor: 'zeus', at: 'bolt', color: '#38c6ff', r: 100 });
addFx({ type: 'lightning', t0: t_fight + 1.55, dur: 1.1, x: 1200, y: 820, x2: 460, y2: 920, color: '#38c6ff', color2: '#ffd94a', w: 30, branches: 5 });
addFx({ type: 'beam', t0: t_fight + 1.4, dur: 1.2, x: 1200, y: 820, x2: 460, y2: 920, w: 62, color: '#38c6ff', charge: 0.2 });

// 682 drinks the lightning -> "Delicious!" -> spikes & acid surge
addShot({ t: t_absorb, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.92, ground: 0.85, push: 1.14, pan: [25, -20] });
addShot({ t: t_absorb + 2.2, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.14, pan: [20, -10] });
addShot({ t: t_delic, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.62, push: 1.15, pan: [15, -12] });
addCue({ actor: 'scp682', action: 'adapt-armor', t0: t_absorb, t1: t_delic, params: { x: [420, 460], y: [1120, 1120], scale: 1.38, flip: 1, aura: [1.2, 1.7], pose: { armor: 1, wings: 1, spikes: 1 } } });
addCue({ actor: 'scp682', action: 'talk', t0: t_delic, t1: t_slam, params: { x: [460, 480], y: [1120, 1120], scale: 1.38, flip: 1, voice: 'scp682', pose: { armor: 1, wings: 1, spikes: 1, wingAng: -35 } } });
addFx({ type: 'pillar', t0: t_absorb + 0.3, dur: 0.85, x: 440, y: 1120, w: 210, color: '#7cff3b' });
addFx({ type: 'sparks', t0: t_absorb + 0.3, x: 460, y: 880, dur: 1.4, n: 32, spread: 340 });

// Supercharged 682 slams Zeus across the shattered street
addShot({ t: t_slam, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 860, maxZoom: 0.82, push: 1.12, pan: [35, 0], tr: { type: 'whip', dur: 0.16, dir: 1 } });
addShot({ t: t_slam + 1.8, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.12, pan: [25, 10] });
addCue({ actor: 'scp682', action: 'fly-slash', t0: t_slam, t1: t_aegis, params: { x: [480, 740], y: [1060, 960], scale: 1.38, flip: 1, pose: { armor: 1, wings: 1, spikes: 1 } } });
addCue({ actor: 'zeus', action: 'hover', t0: t_slam, t1: t_slam + 1.5, params: { x: [1340, 1380], y: [1120, 1120], scale: 1.08, flip: -1, pose: { aegis: 0, bolt: 1 } } });
addCue({ actor: 'zeus', action: 'stagger', t0: t_slam + 1.5, t1: t_aegis, params: { x: [1380, 1480], y: [1120, 1120], scale: 1.08, flip: -1, pose: { aegis: 0, bolt: 1 } } });
addFx({ type: 'spikes', t0: t_slam + 0.1, dur: 1.6, x: 560, y: 880, x2: 1320, y2: 860, n: 8, stagger: 0.09, fly: 0.48, arc: 180, color: '#e8e2d0', color2: '#7cff3b' });
addFx({ type: 'orbs', t0: t_slam + 0.35, x: 580, y: 860, x2: 1340, y2: 880, n: 5, stagger: 0.1, fly: 0.45, arc: 200, r: 24, color: '#9eff3b' });
addFx({ type: 'slash', t0: t_slam + 1.15, x: 760, y: 880, x2: 1320, y2: 880, r: 260, fly: 0.3, color: '#ff2438' });
addFx({ type: 'impact', t0: t_slam + 1.45, x: 1320, y: 880, dur: 0.7, r: 200 });
tl.shake.push({ t0: t_slam + 1.45, dur: 0.45, amp: 24 });

// ==================== BEAT 2: AEGIS SHOCKWAVE & GOD-KING OVERDRIVE ====================
addShot({ t: t_aegis, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.14, pan: [-25, -10] });
addShot({ t: t_aegis + 1.65, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 880, maxZoom: 0.80, push: 1.14, pan: [-35, 0], tr: { type: 'whip', dur: 0.16, dir: -1 } });
addCue({ actor: 'zeus', action: 'bolt-throw', t0: t_aegis, t1: t_overdrive, params: { x: [1460, 1280], y: [1120, 1120], scale: 1.10, flip: -1, pose: { aegis: 0, bolt: 1, overdrive: 0.6 } } });
addFx({ type: 'glint', t0: t_aegis + 0.25, dur: 0.55, actor: 'zeus', at: 'bolt', color: '#ffd94a', r: 120 });
addFx({ type: 'pillar', t0: t_aegis + 0.5, dur: 0.75, x: 1320, y: 1120, w: 190, color: '#ffd94a' });
addFx({ type: 'lightning', t0: t_aegis + 1.55, dur: 0.95, x: 1220, y: 820, x2: 460, y2: 900, color: '#ffd94a', color2: '#38c6ff', w: 34, branches: 5 });
addFx({ type: 'lightning', t0: t_aegis + 1.72, dur: 0.90, x: 1180, y: 760, x2: 480, y2: 960, color: '#38c6ff', color2: '#ffffff', w: 28, branches: 4 });
addFx({ type: 'slash', t0: t_aegis + 1.7, x: 1220, y: 860, x2: 460, y2: 920, r: 290, fly: 0.32, color: '#ffd94a' });
addFx({ type: 'slash', t0: t_aegis + 1.85, x: 1220, y: 880, x2: 460, y2: 900, r: 250, fly: 0.30, color: '#38c6ff', flipV: true });
addFx({ type: 'impact', t0: t_aegis + 2.0, x: 480, y: 920, dur: 0.8, r: 230 });
tl.flash.push({ t0: t_aegis + 2.0, dur: 0.16, amp: 0.9, color: '#fff3c4' });
tl.shake.push({ t0: t_aegis + 2.0, dur: 0.55, amp: 28 });

// Bone wings ripped off & dark armor cracked!
addShot({ t: t_ripped, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.90, ground: 0.85, push: 1.12, pan: [-30, 10] });
addShot({ t: t_ripped + 1.8, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.1, pan: [-20, 10] });
addCue({ actor: 'scp682', action: 'hurt', t0: t_aegis + 2.0, t1: t_climax, params: { x: [700, 380], y: [1120, 1120], scale: 1.32, flip: 1, pose: { armor: 0.25, wings: 0, spikes: 0, damage: 0.8 } } });
addFx({ type: 'dust', t0: t_ripped + 0.1, x: 420, y: 1120, dur: 1.2, n: 24, spread: 340 });
addFx({ type: 'smoke', t0: t_ripped + 0.2, x: 420, y: 1020, dur: 2.0, n: 16, r: 100, dark: true });

// ZEUS GOD-KING OVERDRIVE & CYCLOPES MASTER BOLT CHARGE
addShot({ t: t_overdrive, type: 'low', scene: 'domain-city-storm', actor: 'zeus', zoom: 0.92, ground: 0.86, push: 1.15, pan: [-20, -35], dutch: 4, dutchTo: 0 });
addShot({ t: t_overdrive + 2.1, type: 'ecu', scene: 'domain-city-storm', actor: 'zeus', at: 'bolt', zoom: 2.2, push: 1.14, pan: [-15, -10] });
addCue({ actor: 'zeus', action: 'master-bolt-charge', t0: t_overdrive, t1: t_erase, params: { x: [1340, 1360], y: [1120, 1060], scale: 1.12, flip: -1, aura: [1.3, 1.8], pose: { bolt: 1, boltGlow: 2.0, aegis: 0, overdrive: 1.0 } } });
addFx({ type: 'pillar', t0: t_overdrive + 0.25, dur: 0.85, x: 1360, y: 1120, w: 240, color: '#5b4bff' });
addFx({ type: 'lightning', t0: t_overdrive + 0.4, dur: 1.4, x: 1360, y: 30, x2: 1360, y2: 720, color: '#ffd94a', color2: '#38c6ff', w: 36, branches: 6 });
addFx({ type: 'glint', t0: t_overdrive + 2.2, dur: 0.65, actor: 'zeus', at: 'bolt', color: '#fffbe0', r: 130 });
tl.shake.push({ t0: t_overdrive + 0.35, dur: 0.6, amp: 24 });

// ==================== BEAT 3: MASTER BOLT VAPORIZATION (DIRECTION 2) ====================
addShot({ t: t_climax, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.14, pan: [25, -10] });
addShot({ t: t_climax + 1.9, type: 'wide', scene: 'domain-city-storm', cx: 880, cy: 840, zoom: 0.68, push: 1.1, pan: [0, -20] });
addShot({ t: t_erase, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.60, push: 1.14, pan: [-15, -10] });
addCue({ actor: 'scp682', action: 'roar', t0: t_climax, t1: t_vaporize + 1.4, params: { x: [380, 420], y: [1120, 1120], scale: 1.36, flip: 1, pose: { armor: 0.25, wings: 0, damage: 0.5 } } });
addCue({ actor: 'zeus', action: 'talk', t0: t_erase, t1: t_vaporize, params: { x: [1360, 1360], y: [1080, 1080], scale: 1.12, flip: -1, voice: 'zeus', pose: { bolt: 1, boltGlow: 2.0, aegis: 0, overdrive: 1.0 } } });

// FINAL CLASH -> MASTER BOLT VAPORIZES SCP-682 TO ASH (slow-mo + crash-zoom!)
addShot({ t: t_vaporize, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 860, maxZoom: 0.80, push: 1.12, pan: [-20, 0] });
addShot({ t: t_vaporize + 1.5, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'zeus', cy: 860, maxZoom: 0.90, push: 1.16, pan: [-40, 0], slow: 0.42, crash: { at: t_vaporize + 2.2, dur: 0.48, k: 1.48 } });
addShot({ t: t_vaporize + 3.05, type: 'wide', scene: 'domain-city-storm', cx: 680, cy: 840, zoom: 0.66, push: 1.12, pan: [-35, -35] });
addCue({ actor: 'zeus', action: 'master-bolt-fire', t0: t_vaporize, t1: t_after, params: { x: [1360, 1340], y: [1100, 1120], scale: 1.12, flip: -1, pose: { bolt: 1, boltGlow: 2.0, aegis: 0, overdrive: 1.0 } } });
// SCP-682 completely vaporizes to ash (alpha 1 -> 0)!
addCue({ actor: 'scp682', action: 'hurt', t0: t_vaporize + 1.4, t1: t_vaporize + 3.3, params: { x: [420, 380], y: [1120, 1120], scale: 1.34, flip: 1, alpha: [1, 0], pose: { damage: 1.0, armor: 0, wings: 0 } } });
addCue({ actor: 'scp682', action: 'fade', t0: t_vaporize + 3.3, t1: D, params: { x: [380, 380], y: [1120, 1120], scale: 1.34, flip: 1, alpha: [0, 0] } });

addFx({ type: 'beam-clash', t0: t_vaporize + 0.05, dur: 3.1, x: 580, y: 880, x2: 1180, y2: 860, colorL: '#66ff33', colorR: '#ffd94a', w: 86, amp: 0.09, win: 'R', winAt: 1.55 });
addFx({ type: 'lightning', t0: t_vaporize + 2.1, dur: 1.3, x: 420, y: 40, x2: 420, y2: 1120, color: '#fffbe0', color2: '#38c6ff', w: 46, branches: 7 });
addFx({ type: 'pillar', t0: t_vaporize + 2.15, dur: 1.3, x: 420, y: 1120, w: 320, color: '#ffd94a' });
addFx({ type: 'impact', t0: t_vaporize + 2.2, x: 420, y: 920, dur: 1.0, r: 290 });
addFx({ type: 'smoke', t0: t_vaporize + 2.4, x: 420, y: 1060, dur: 3.6, n: 26, r: 140, dark: true });
tl.flash.push({ t0: t_vaporize + 2.2, dur: 0.28, amp: 1.0, color: '#ffffff' });
tl.shake.push({ t0: t_vaporize + 2.2, dur: 0.85, amp: 32 });

// ==================== 3. AFTERMATH & 3-BEAT CLIFFHANGER (C1 — SINGLE BONE SHARD REGEN) ====================
addShot({ t: t_after, type: 'wide', scene: 'domain-city-storm', cx: 920, cy: 860, zoom: 0.68, push: 1.08, pan: [20, -25] });
addShot({ t: t_safe, type: 'cu', scene: 'domain-city-storm', actor: 'zeus', fill: 0.56, push: 1.08, pan: [0, -15] });
addShot({ t: t_safe + 2.3, type: 'wide', scene: 'domain-city-storm', cx: 1200, cy: 560, zoom: 0.70, push: 1.1, pan: [25, -90] });
addCue({ actor: 'zeus', action: 'talk', t0: t_after, t1: t_safe + 2.3, params: { x: [1340, 1340], y: [1120, 1120], scale: 1.08, flip: -1, voice: 'zeus', pose: { bolt: 1, boltGlow: 0.9, aegis: 0, overdrive: 0.2 } } });
addCue({ actor: 'zeus', action: 'descend', t0: t_safe + 2.3, t1: D, params: { x: [1340, 1380], y: [1120, -480], scale: 1.08, flip: -1, pose: { bolt: 1, boltGlow: 1.2, aegis: 0, } } });
addFx({ type: 'sparks', t0: t_safe + 2.4, x: 1340, y: 620, dur: 1.2, n: 28, spread: 240 });

// Beat 1: False peace — quiet smoking city crater
addShot({ t: t_cliff - 1.0, type: 'wide', scene: 'domain-city-storm', cx: 520, cy: 960, zoom: 0.80, push: 1.08, pan: [-20, 20] });

// Beat 2: Music cuts dead — push tight onto single charred bone shard in the dark fissure
addShot({ t: t_cliff + 0.6, type: 'insert', scene: 'domain-city-storm', cx: 420, cy: 1110, zoom: 1.85, push: 1.18, pan: [0, 8] });

// Beat 3: Visual reveal — crimson tendrils & glowing acid-green eye snap open on the shard + "Still... alive." + CTA
addShot({ t: t_whisp - 0.55, type: 'insert', scene: 'domain-city-storm', cx: 424, cy: 1115, zoom: 2.9, push: 1.14, pan: [0, 0] });
addShot({ t: t_whisp + 1.45, type: 'insert', scene: 'domain-city-storm', cx: 420, cy: 1105, zoom: 2.2, push: 1.08, pan: [0, -10] });
tl.text.push({ t0: t_whisp + 1.1, t1: D - 0.05, text: 'CAN ANYTHING ERASE SCP-682?', x: 540, y: 420, size: 74, color: '#7cff3b', anim: 'blink', shadow: '#000', bg: { fill: '#0b0812', stroke: '#7cff3b', sw: 5 } });

const outPath = path.join(__dirname, 'timeline.json');
fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log(`Wrote ${outPath} | duration=${D}s | shots=${tl.shots.length} | cues=${tl.cues.length} | fx=${tl.fx.length}`);
