#!/usr/bin/env node
// Episode #005 v3: SCP-682 vs PEGASUS (No Kid · Lab Breach -> Night City Rampage -> Evolution -> Olympus Retreat)
// Builds episodes/scp682-vs-pegasus/anim/timeline.json synchronized to audio-anim/sections.json & words.json.
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
const t_g0 = sec('intro_pegasus').start;
const t_g1 = sec('intro_pegasus').end;
const t_story = sec('story').start;
const t_rampage = sent('It tore through').start;
const t_block = sent('Radiant wings').start;
const t_fight = sec('fight').start;
const t_dive = sent('Diving like').start;
const t_zeus = sent('Then Pegasus').start;
const t_adapt = sec('adapt').start;
const t_armor = sent('Worse, its body').start;
const t_mock = sent('Your thunder').start;
const t_spikes = sent('Bone glands').start;
const t_wings = sec('wings').start;
const t_climax = sec('climax').start;
const t_exhaust = sent('Pegasus could').start;
const t_retreat = sec('retreat').start;
const t_zeus_line = sent('Only Zeus').start;
const t_after = sec('aftermath').start;
const t_cliff = sec('cliffhanger').start;
const t_whisp = sec('whisper').start;

const voices = {
  scp682: { words: wordsIn(0, D, 'scp682') },
  pegasus: { words: wordsIn(0, D, 'pegasus') },
};

const tl = {
  fps: 24,
  duration: D,
  camInit: { cx: 880, cy: 840, zoom: 0.72 },
  sides: { left: 'scp682', right: 'pegasus' },
  voices,
  domains: {
    lab: {
      sky: ['#0b060a', '#24090f'],
      glow: '#ff2238',
      floor: ['#1b1e24', '#0b0c10'],
      motif: 'lab',
      rock: '#242933',
      sigil: null,
      motes: '#ff4455',
      mist: '#ff2238',
      horizon: 960,
    },
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
      sky: ['#161848', '#3c4296', '#b884ff', '#ffd670'],
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
      glow: '#ff5a2a',
      floor: ['#161922', '#090b10'],
      motif: 'city',
      rock: '#101624',
      sigil: null,
      motes: '#ff9644',
      mist: '#2e4066',
      horizon: 980,
    },
  },
  actors: {
    scp682: {
      kind: 'scp682',
      x: 380,
      y: 1120,
      scale: 1.28,
      flip: 1,
      z: 30,
      rim: '#7cff3b',
      rimPx: 7,
      aura: { colors: ['#5ce62e', '#8f0e16', '#d9ff3f'], r: 260, h: 220, motes: true, on: 0.7 },
    },
    pegasus: {
      kind: 'pegasus',
      x: 1380,
      y: 960,
      scale: 1.05,
      flip: -1,
      z: 35,
      rim: '#63f2ff',
      rimPx: 8,
      aura: { colors: ['#b366ff', '#4ce8ff', '#ffd859', '#fff8d6'], r: 270, h: 240, motes: true, on: 1.0 },
    },
  },
  props: [
    // Overturned burning car wreck & concrete debris on the city avenue
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
    // Rising shattered asphalt & bone spires during SCP-682 adaptation
    { type: 'spire', x: 180, y: 1130, scale: 1.0, h: 520, w: 150, tilt: -10, color: '#66ff33', rock: '#181f1a', track: 'rise', scene: 'domain-city-storm', z: 12, seed: 3 },
    { type: 'spire', x: 640, y: 1120, scale: 0.9, h: 460, w: 130, tilt: 12, color: '#ff2438', rock: '#1b171b', track: 'rise', scene: 'domain-city-storm', z: 14, seed: 7 },
    { type: 'spire', x: 960, y: 1130, scale: 0.8, h: 380, w: 120, tilt: -6, color: '#66ff33', rock: '#181f1a', track: 'rise', scene: 'domain-city-storm', z: 10, seed: 11 },
    // Olympus golden storm glow overhead for aftermath / cliffhanger
    {
      type: 'shape',
      x: 900,
      y: 220,
      scale: 1.0,
      z: 6,
      scene: 'domain-city-storm',
      shapes: [
        { k: 'glow', cx: 0, cy: 0, r: 580, color: '#ffd859', op: 0.95, track: 'olympusSky', flick: 0.25 },
        { k: 'glow', cx: 140, cy: -40, r: 360, color: '#4ce8ff', op: 0.7, track: 'olympusSky', flick: 0.3 },
      ],
    },
  ],
  tracks: {
    rise: [
      { t0: 0, t1: t_spikes - 0.1, v: 0 },
      { t0: t_spikes, t1: t_spikes + 1.1, v: 1, ease: 'outCubic' },
      { t0: t_spikes + 1.1, t1: D, v: 1 },
    ],
    olympusSky: [
      { t0: 0, t1: t_retreat, v: 0 },
      { t0: t_retreat, t1: t_after + 1.0, v: 0.85, ease: 'outCubic' },
      { t0: t_cliff, t1: D, v: 1.0 },
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
    sub: 'HARD-TO-DESTROY REPTILE',
    title: 'SCP-682 · HARD-TO-DESTROY REPTILE',
    domain: 'acid',
    color: '#7cff3b',
    glow: '#8f0e16',
    card: { fx: 40, fy: 255, fscale: 0.34, idle: 'idle-card' },
    pillar: { x: 180, y: 1120, w: 140 },
  },
  guardian: {
    kind: 'pegasus',
    label: 'PEGASUS',
    sub: 'WINGED STEED OF OLYMPUS',
    title: 'PEGASUS · WINGED STEED OF OLYMPUS',
    domain: 'olympus',
    color: '#ffd859',
    glow: '#4ce8ff',
    card: { fx: 10, fy: 255, fscale: 0.48, idle: 'idle-card' },
    pillar: { x: 1580, y: 1100, w: 140 },
  },
});

const addShot = (s) => tl.shots.push(s);
const addCue = (c) => tl.cues.push(c);
const addFx = (f) => tl.fx.push(f);

// ---- HOOK SHOTS (0..3.0 s): SCP LAB BREACH -> CITY RAMPAGE -> AERIAL CLASH ----
addShot({ t: 0.0, type: 'wide', scene: 'domain-lab', cx: 560, cy: 860, zoom: 0.90, push: 1.15, pan: [50, -15] });
addShot({ t: 1.05, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.56, push: 1.12, pan: [30, -10], tr: { type: 'whip', dur: 0.14, dir: 1 } });
addShot({ t: 2.0, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 760, maxZoom: 0.86, push: 1.15, pan: [0, -25] });

addCue({ actor: 'scp682', action: 'lunge', t0: 0.0, t1: 1.05, params: { x: [200, 540], y: [1120, 1120], scale: 1.28, flip: 1 } });
addCue({ actor: 'scp682', action: 'roar', t0: 1.05, t1: 1.98, params: { x: [420, 440], y: [1120, 1120], scale: 1.32, flip: 1 } });
addCue({ actor: 'scp682', action: 'fly-slash', t0: 1.98, t1: 3.05, params: { x: [420, 480], y: [860, 820], scale: 1.32, flip: 1, pose: { armor: 1, wings: 1 } } });
addCue({ actor: 'pegasus', action: 'summon-thunder', t0: 0.0, t1: 1.98, params: { x: [1420, 1420], y: [880, 880], scale: 1.08, flip: -1 } });
addCue({ actor: 'pegasus', action: 'wing-cyclone', t0: 1.98, t1: 3.05, params: { x: [1340, 1290], y: [820, 800], scale: 1.08, flip: -1 } });
addFx({ type: 'impact', t0: 0.35, x: 520, y: 920, dur: 0.65, r: 175 });
addFx({ type: 'sparks', t0: 0.35, x: 520, y: 920, dur: 0.7, n: 28, spread: 270 });
addFx({ type: 'lightning', t0: 1.1, dur: 0.85, x: 940, y: 120, x2: 520, y2: 960, color: '#ffd94a', color2: '#38c6ff', w: 28, branches: 5 });
addFx({ type: 'beam-clash', t0: 2.0, dur: 1.0, x: 640, y: 740, x2: 1180, y2: 740, colorL: '#66ff33', colorR: '#4ce8ff', w: 68, amp: 0.08 });
tl.flash.push({ t0: 0.35, dur: 0.14, amp: 0.75, color: '#ff3844' });
tl.shake.push({ t0: 0.35, dur: 0.4, amp: 20 });

// ---- SPLIT-ROLL PLACEHOLDER 1 ----
addShot({ t: 3.0, type: 'wide', scene: 'domain-acid', cx: 540, cy: 900, zoom: 0.85, push: 1.04, pan: [10, 0] });

// ---- INTRO MONSTER: SCP-682 ----
const [mi0, mi1] = T.intro.L;
const md = mi1 - mi0;
addShot({ t: mi0, type: 'low', scene: 'domain-acid', actor: 'scp682', zoom: 0.92, ground: 0.85, push: 1.1, pan: [25, -15] });
addShot({ t: mi0 + md * 0.28, type: 'cu', scene: 'domain-acid', actor: 'scp682', fill: 0.56, push: 1.1, pan: [18, -8] });
addShot({ t: mi0 + md * 0.55, type: 'ecu', scene: 'domain-acid', actor: 'scp682', at: 'eye', zoom: 2.5, push: 1.12, pan: [12, 0] });
addShot({ t: mi0 + md * 0.76, type: 'wide', scene: 'domain-acid', cx: 480, cy: 890, zoom: 0.82, push: 1.08, pan: [-30, -15] });
addCue({ actor: 'scp682', action: 'talk', t0: mi0, t1: mi1 + 0.1, params: { x: [420, 440], y: [1120, 1120], scale: 1.32, flip: 1, voice: 'scp682', pose: { armor: 0, wings: 0, damage: 0, spikes: 0 } } });
addFx({ type: 'glint', t0: mi0 + md * 0.56, dur: 0.65, actor: 'scp682', at: 'eye', color: '#d9ff3f', r: 95 });
addFx({ type: 'smoke', t0: mi0 + 0.1, x: 440, y: 1080, dur: 2.4, n: 14, r: 90, dark: true });

// ---- SPLIT-ROLL PLACEHOLDER 2 ----
addShot({ t: T.emerge.L[0], type: 'wide', scene: 'domain-olympus', cx: 1280, cy: 860, zoom: 0.85, push: 1.04, pan: [-10, 0] });

// ---- INTRO GUARDIAN: PEGASUS ----
const [gi0, gi1] = T.intro.R;
const gd = gi1 - gi0;
addShot({ t: gi0, type: 'low', scene: 'domain-olympus', actor: 'pegasus', zoom: 0.96, ground: 0.84, push: 1.1, pan: [-25, -18] });
addShot({ t: gi0 + gd * 0.28, type: 'cu', scene: 'domain-olympus', actor: 'pegasus', fill: 0.56, push: 1.1, pan: [-18, -8] });
addShot({ t: gi0 + gd * 0.55, type: 'ecu', scene: 'domain-olympus', actor: 'pegasus', at: 'eye', zoom: 2.6, push: 1.12, pan: [-12, 0] });
addShot({ t: gi0 + gd * 0.76, type: 'wide', scene: 'domain-olympus', cx: 1320, cy: 850, zoom: 0.84, push: 1.08, pan: [28, -18] });
addCue({ actor: 'pegasus', action: 'talk', t0: gi0, t1: gi1 + 0.1, params: { x: [1340, 1320], y: [1040, 1020], scale: 1.08, flip: -1, voice: 'pegasus', pose: { stormCharge: 0.7 } } });
addFx({ type: 'glint', t0: gi0 + gd * 0.56, dur: 0.65, actor: 'pegasus', at: 'eye', color: '#ffd859', r: 105 });
addFx({ type: 'sparks', t0: gi0 + gd * 0.75, x: 1320, y: 840, dur: 1.1, n: 24, spread: 240 });

// ---- SPLIT-ROLL PLACEHOLDER 3 (VS) ----
addShot({ t: T.emerge.R[0], type: 'wide', scene: 'domain-lab', cx: 620, cy: 860, zoom: 0.88, push: 1.05, pan: [15, 0] });

// ==================== 2. STORY & BATTLE (CITY AT NIGHT — NO KID) ====================
tl.cinema.push([t_story, t_after - 0.2]);
tl.embers.push([t_story, t_adapt, '#ffd859']);
tl.embers.push([t_adapt, t_after, '#7cff3b']);

// --- OPENING: LAB BREACH -> CITY RAMPAGE -> PEGASUS DIVES FROM STORM CLOUDS ---
addShot({ t: t_story, type: 'wide', scene: 'domain-lab', cx: 560, cy: 860, zoom: 0.86, push: 1.14, pan: [60, -10] });
addCue({ actor: 'scp682', action: 'run', t0: t_story, t1: t_story + 2.25, params: { x: [180, 640], y: [1120, 1120], scale: 1.28, flip: 1, pose: { armor: 0, wings: 0, damage: 0, spikes: 0 } } });
addFx({ type: 'impact', t0: t_story + 0.85, x: 520, y: 920, dur: 0.7, r: 195 });
addFx({ type: 'sparks', t0: t_story + 0.85, x: 520, y: 920, dur: 0.8, n: 30, spread: 290 });
tl.flash.push({ t0: t_story + 0.85, dur: 0.14, amp: 0.75, color: '#ff2438' });
tl.shake.push({ t0: t_story + 0.85, dur: 0.45, amp: 22 });

// SCP-682 smashes onto downtown avenue
addShot({ t: t_story + 2.25, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.86, ground: 0.85, push: 1.12, pan: [40, -15], tr: { type: 'whip', dur: 0.18, dir: 1 } });
addCue({ actor: 'scp682', action: 'lunge', t0: t_story + 2.25, t1: t_rampage + 1.6, params: { x: [260, 480], y: [1120, 1120], scale: 1.30, flip: 1 } });
addFx({ type: 'soil', t0: t_story + 2.3, x: 420, y: 1120, dur: 0.9, n: 18, spread: 240 });
addFx({ type: 'dust', t0: t_story + 2.3, x: 420, y: 1120, dur: 1.0, n: 18, spread: 280 });

// SCP-682 tears through burning city street
addShot({ t: t_rampage, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.56, push: 1.12, pan: [25, -10] });
addCue({ actor: 'scp682', action: 'claw-swipe', t0: t_rampage, t1: t_block, params: { x: [480, 520], y: [1120, 1120], scale: 1.30, flip: 1 } });
addFx({ type: 'slash', t0: t_rampage + 0.35, x: 560, y: 940, x2: 960, y2: 1020, r: 220, fly: 0.3, color: '#ff3b1f' });
addFx({ type: 'sparks', t0: t_rampage + 0.6, x: 960, y: 1020, dur: 0.7, n: 24, spread: 240 });

// Pegasus dives through the storm clouds above the skyscrapers RIGHT
addShot({ t: t_rampage + 1.85, type: 'high', scene: 'domain-city-storm', actor: 'pegasus', zoom: 0.92, push: 1.14, pan: [-35, 25], tr: { type: 'whip', dur: 0.16, dir: 1 } });
addCue({ actor: 'pegasus', action: 'dive-kick', t0: t_rampage + 1.85, t1: t_block, params: { x: [1580, 1140], y: [380, 960], scale: 1.06, flip: -1, pose: { diveFlame: 0.95 } } });
addFx({ type: 'pillar', t0: t_rampage + 1.9, dur: 0.75, x: 1360, y: 1130, w: 170, color: '#4ce8ff' });

// Pegasus slams SCP-682 back with radiant wing-gale -> 1v1 establishing wide shot
addShot({ t: t_block, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 900, maxZoom: 0.82, push: 1.1, pan: [-15, -10] });
addShot({ t: t_block + 2.05, type: 'wide', scene: 'domain-city-storm', cx: 880, cy: 840, zoom: 0.66, push: 1.08, pan: [0, -25] });
addCue({ actor: 'scp682', action: 'bite', t0: t_block - 0.1, t1: t_block + 1.6, params: { x: [480, 560], y: [1120, 1120], scale: 1.30, flip: 1 } });
addCue({ actor: 'scp682', action: 'roar', t0: t_block + 1.6, t1: t_fight + 1.6, params: { x: [560, 400], y: [1120, 1120], scale: 1.32, flip: 1 } });
addCue({ actor: 'pegasus', action: 'block', t0: t_block, t1: t_block + 1.6, params: { x: [1080, 1160], y: [1000, 980], scale: 1.06, flip: -1, pose: { stormCharge: 0.8 } } });
addCue({ actor: 'pegasus', action: 'hover', t0: t_block + 1.6, t1: t_fight + 1.8, params: { x: [1160, 1360], y: [980, 620], scale: 1.06, flip: -1, pose: { stormCharge: 0.5 } } });
addFx({ type: 'slash', t0: t_block + 0.15, x: 1040, y: 920, x2: 560, y2: 940, r: 240, fly: 0.34, color: '#4ce8ff' });
addFx({ type: 'impact', t0: t_block + 0.4, x: 640, y: 940, dur: 0.65, r: 170 });
addFx({ type: 'sparks', t0: t_block + 0.4, x: 640, y: 940, dur: 0.7, n: 26, spread: 240 });
tl.shake.push({ t0: t_block + 0.4, dur: 0.35, amp: 18 });

// ==================== BEAT 1: PEGASUS AIR DOMINANCE (HOOF-DIVE & ZEUS LIGHTNING) ====================
addShot({ t: t_fight, type: 'low', scene: 'domain-city-storm', actor: 'pegasus', zoom: 0.95, ground: 0.92, push: 1.12, pan: [-35, -35] });
addShot({ t: t_fight + 2.2, type: 'wide', scene: 'domain-city-storm', cx: 780, cy: 860, zoom: 0.70, push: 1.1, pan: [30, 15] });
addCue({ actor: 'scp682', action: 'claw-swipe', t0: t_fight + 1.6, t1: t_dive, params: { x: [400, 480], y: [1120, 1120], scale: 1.32, flip: 1 } });
addCue({ actor: 'pegasus', action: 'hover', t0: t_fight + 1.8, t1: t_dive, params: { x: [1360, 1280], y: [620, 560], scale: 1.05, flip: -1 } });

// DIVINE HOOF-DIVE KICK
addShot({ t: t_dive, type: 'cu', scene: 'domain-city-storm', actor: 'pegasus', fill: 0.56, push: 1.14, pan: [-25, 15] });
addShot({ t: t_dive + 1.25, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 900, maxZoom: 0.84, push: 1.14, pan: [-35, 10], tr: { type: 'whip', dur: 0.16, dir: -1 } });
addShot({ t: t_dive + 2.75, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.56, push: 1.12, pan: [-30, 0] });
addCue({ actor: 'pegasus', action: 'dive-kick', t0: t_dive, t1: t_dive + 2.6, params: { x: [1280, 740], y: [560, 960], scale: 1.08, flip: -1, pose: { diveFlame: 1.0 } } });
addCue({ actor: 'pegasus', action: 'hover', t0: t_dive + 2.6, t1: t_zeus, params: { x: [740, 1340], y: [960, 620], scale: 1.06, flip: -1, pose: { diveFlame: 0.2 } } });
addCue({ actor: 'scp682', action: 'hurt', t0: t_dive + 1.65, t1: t_zeus, params: { x: [480, 340], y: [1120, 1120], scale: 1.32, flip: 1, pose: { damage: 0.65 } } });
addFx({ type: 'glint', t0: t_dive + 0.2, dur: 0.55, actor: 'pegasus', at: 'hoof', color: '#ffb82e', r: 100 });
addFx({ type: 'slash', t0: t_dive + 1.35, x: 1180, y: 660, x2: 520, y2: 980, r: 260, fly: 0.32, color: '#ffb82e' });
addFx({ type: 'impact', t0: t_dive + 1.65, x: 520, y: 980, dur: 0.75, r: 210 });
addFx({ type: 'dust', t0: t_dive + 1.65, x: 500, y: 1120, dur: 1.0, n: 20, spread: 280 });
tl.flash.push({ t0: t_dive + 1.65, dur: 0.14, amp: 0.85, color: '#ffd859' });
tl.shake.push({ t0: t_dive + 1.65, dur: 0.45, amp: 24 });

// ZEUS SKY-THUNDERBOLTS
addShot({ t: t_zeus, type: 'high', scene: 'domain-city-storm', actor: 'pegasus', zoom: 0.94, push: 1.12, pan: [-20, -25] });
addShot({ t: t_zeus + 1.25, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 840, maxZoom: 0.78, push: 1.12, pan: [-25, 0], tr: { type: 'whip', dur: 0.16, dir: -1 } });
addShot({ t: t_zeus + 2.85, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.1, pan: [15, 10] });
addCue({ actor: 'pegasus', action: 'summon-thunder', t0: t_zeus, t1: t_adapt, params: { x: [1340, 1380], y: [620, 600], scale: 1.06, flip: -1, pose: { stormCharge: 1.0 } } });
addCue({ actor: 'scp682', action: 'hurt', t0: t_zeus + 1.5, t1: t_adapt, params: { x: [340, 320], y: [1120, 1120], scale: 1.32, flip: 1, pose: { damage: 1.0 } } });
addFx({ type: 'pillar', t0: t_zeus + 0.3, dur: 0.7, x: 1360, y: 1120, w: 160, color: '#ffd94a' });
addFx({ type: 'lightning', t0: t_zeus + 1.35, dur: 1.1, x: 420, y: 60, x2: 400, y2: 1020, color: '#ffd94a', color2: '#38c6ff', w: 34, branches: 6 });
addFx({ type: 'lightning', t0: t_zeus + 1.55, dur: 0.95, x: 640, y: 80, x2: 460, y2: 1040, color: '#38c6ff', color2: '#ffffff', w: 24, branches: 4 });
addFx({ type: 'beam', t0: t_zeus + 1.2, dur: 1.25, x: 1200, y: 600, x2: 420, y2: 960, w: 60, color: '#38c6ff', charge: 0.25 });
addFx({ type: 'smoke', t0: t_zeus + 1.8, x: 400, y: 1020, dur: 2.2, n: 18, r: 105, dark: true });
tl.flash.push({ t0: t_zeus + 1.45, dur: 0.16, amp: 0.9, color: '#d8f4ff' });
tl.shake.push({ t0: t_zeus + 1.45, dur: 0.5, amp: 26 });

// ==================== BEAT 2: ADAPTATION TURNING POINT (REGEN -> ARMOR -> SPIKES -> HORROR WINGS) ====================
addShot({ t: t_adapt, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.95, ground: 0.85, push: 1.14, pan: [20, -25] });
addShot({ t: t_adapt + 1.65, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.12, pan: [25, -10] });
addCue({ actor: 'scp682', action: 'regen', t0: t_adapt, t1: t_armor, params: { x: [320, 380], y: [1120, 1120], scale: 1.32, flip: 1, aura: [1.0, 1.5], pose: { damage: 0.2, regen: 1.0 } } });
addFx({ type: 'pillar', t0: t_adapt + 0.2, dur: 0.8, x: 400, y: 1120, w: 190, color: '#7cff3b' });
addFx({ type: 'soil', t0: t_adapt + 0.2, x: 400, y: 1120, dur: 1.0, n: 16, spread: 240 });

// Dark Lightning-Proof Armor
addShot({ t: t_armor, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.56, push: 1.12, pan: [20, -10] });
addShot({ t: t_armor + 1.65, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 860, maxZoom: 0.80, push: 1.1, pan: [-20, 0], tr: { type: 'whip', dur: 0.16, dir: -1 } });
addShot({ t: t_mock, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.60, push: 1.14, pan: [15, -12] });
addCue({ actor: 'scp682', action: 'adapt-armor', t0: t_armor, t1: t_mock, params: { x: [380, 420], y: [1120, 1120], scale: 1.34, flip: 1, pose: { armor: 1, damage: 0, regen: 0.3 } } });
addCue({ actor: 'scp682', action: 'talk', t0: t_mock, t1: t_spikes, params: { x: [420, 440], y: [1120, 1120], scale: 1.34, flip: 1, voice: 'scp682', pose: { armor: 1 } } });
addCue({ actor: 'pegasus', action: 'summon-thunder', t0: t_armor + 1.4, t1: t_spikes, params: { x: [1380, 1340], y: [620, 650], scale: 1.06, flip: -1, pose: { stormCharge: 0.9 } } });
addFx({ type: 'glint', t0: t_armor + 0.4, dur: 0.55, actor: 'scp682', at: 'eye', color: '#ff3b1f', r: 95 });
addFx({ type: 'lightning', t0: t_armor + 1.75, dur: 0.85, x: 1180, y: 640, x2: 460, y2: 920, color: '#ffd94a', color2: '#38c6ff', w: 28, branches: 4 });
addFx({ type: 'sparks', t0: t_armor + 1.9, x: 460, y: 920, dur: 0.85, n: 32, spread: 320 });

// Bio-Spike & Acid Barrage into skyline
addShot({ t: t_spikes, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.92, ground: 0.85, push: 1.12, pan: [30, -25], dutch: -4, dutchTo: 0 });
addShot({ t: t_spikes + 1.6, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 820, maxZoom: 0.78, push: 1.12, pan: [35, -15], tr: { type: 'whip', dur: 0.16, dir: 1 } });
addShot({ t: t_spikes + 3.1, type: 'cu', scene: 'domain-city-storm', actor: 'pegasus', fill: 0.56, push: 1.12, pan: [-20, -10] });
addCue({ actor: 'scp682', action: 'spike-barrage', t0: t_spikes, t1: t_wings, params: { x: [440, 460], y: [1120, 1120], scale: 1.34, flip: 1, pose: { armor: 1, spikes: 1 } } });
addCue({ actor: 'pegasus', action: 'wing-cyclone', t0: t_spikes + 1.6, t1: t_wings, params: { x: [1340, 1420], y: [650, 580], scale: 1.06, flip: -1, pose: { stormCharge: 0.7 } } });
addFx({ type: 'spikes', t0: t_spikes + 0.8, dur: 2.2, x: 520, y: 880, x2: 1360, y2: 580, n: 9, stagger: 0.11, fly: 0.55, arc: 220, color: '#e8e2d0', color2: '#7cff3b' });
addFx({ type: 'orbs', t0: t_spikes + 1.5, x: 540, y: 860, x2: 1380, y2: 620, n: 5, stagger: 0.12, fly: 0.55, arc: 240, r: 24, color: '#9eff3b' });
addFx({ type: 'slash', t0: t_spikes + 2.4, x: 1320, y: 600, x2: 880, y2: 760, r: 240, fly: 0.34, color: '#b366ff' });
addFx({ type: 'slash', t0: t_spikes + 2.75, x: 1340, y: 640, x2: 860, y2: 720, r: 220, fly: 0.32, color: '#3ce8ff', flipV: true });

// HORROR BONE-WINGS TRANSFORMATION
addShot({ t: t_wings, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.88, ground: 0.85, push: 1.15, pan: [20, -40], dutch: 5, dutchTo: 0 });
addShot({ t: t_wings + 2.0, type: 'wide', scene: 'domain-city-storm', cx: 880, cy: 680, zoom: 0.68, push: 1.1, pan: [0, -45] });
addCue({ actor: 'scp682', action: 'grow-wings', t0: t_wings, t1: t_wings + 1.9, params: { x: [460, 460], y: [1120, 1080], scale: 1.36, flip: 1, aura: [1.3, 1.7], pose: { armor: 1, spikes: 0.5, wings: 1 } } });
addCue({ actor: 'scp682', action: 'fly-hover', t0: t_wings + 1.9, t1: t_climax, params: { x: [460, 520], y: [1080, 680], scale: 1.34, flip: 1, pose: { armor: 1, wings: 1 } } });
addCue({ actor: 'pegasus', action: 'hover', t0: t_wings, t1: t_climax, params: { x: [1420, 1360], y: [580, 640], scale: 1.06, flip: -1 } });
addFx({ type: 'pillar', t0: t_wings + 0.35, dur: 0.85, x: 460, y: 1120, w: 220, color: '#8f0e16' });
addFx({ type: 'dust', t0: t_wings + 0.4, x: 460, y: 1120, dur: 1.2, n: 22, spread: 340 });
tl.shake.push({ t0: t_wings + 0.35, dur: 0.55, amp: 24 });

// ==================== BEAT 3: AERIAL OVERWHELM & TACTICAL RETREAT TO OLYMPUS ====================
addShot({ t: t_climax, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 640, maxZoom: 0.82, push: 1.12, pan: [25, -10], tr: { type: 'whip', dur: 0.16, dir: 1 } });
addShot({ t: t_climax + 1.8, type: 'cu', scene: 'domain-city-storm', actor: 'pegasus', fill: 0.56, push: 1.1, pan: [20, 10] });
addShot({ t: t_climax + 3.2, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 650, maxZoom: 0.80, push: 1.12, pan: [0, -15] });
addShot({ t: t_exhaust + 1.15, type: 'versus', scene: 'domain-city-storm', a: 'scp682', b: 'pegasus', cy: 650, maxZoom: 0.88, push: 1.14, pan: [30, 0], slow: 0.45, crash: { at: t_exhaust + 1.85, dur: 0.45, k: 1.45 } });
addCue({ actor: 'scp682', action: 'fly-slash', t0: t_climax, t1: t_climax + 2.0, params: { x: [520, 680], y: [680, 640], scale: 1.34, flip: 1, pose: { armor: 1, wings: 1 } } });
addCue({ actor: 'scp682', action: 'roar', t0: t_climax + 2.0, t1: t_retreat, params: { x: [560, 620], y: [660, 650], scale: 1.36, flip: 1, pose: { armor: 1, wings: 1 } } });
addCue({ actor: 'pegasus', action: 'recoil', t0: t_climax + 0.7, t1: t_climax + 2.0, params: { x: [1360, 1460], y: [640, 680], scale: 1.06, flip: -1 } });
addCue({ actor: 'pegasus', action: 'wing-cyclone', t0: t_climax + 2.0, t1: t_exhaust + 1.6, params: { x: [1380, 1360], y: [660, 670], scale: 1.06, flip: -1, pose: { stormCharge: 1.0 } } });
addCue({ actor: 'pegasus', action: 'recoil', t0: t_exhaust + 1.6, t1: t_retreat, params: { x: [1360, 1500], y: [670, 700], scale: 1.05, flip: -1 } });
addFx({ type: 'slash', t0: t_climax + 0.55, x: 760, y: 600, x2: 1280, y2: 680, r: 250, fly: 0.3, color: '#ff2438' });
addFx({ type: 'impact', t0: t_climax + 0.85, x: 1280, y: 680, dur: 0.65, r: 170 });
const t_bc0 = t_climax + 3.25;
addFx({ type: 'beam-clash', t0: t_bc0, dur: t_retreat - t_bc0 - 0.1, x: 760, y: 630, x2: 1240, y2: 650, colorL: '#66ff33', colorR: '#ffd859', w: 78, amp: 0.1, win: 'L', winAt: (t_exhaust + 1.3) - t_bc0 });
tl.flash.push({ t0: t_exhaust + 1.85, dur: 0.18, amp: 0.9, color: '#c6ff5e' });
tl.shake.push({ t0: t_exhaust + 1.85, dur: 0.55, amp: 28 });

// HIPPOCRENE FLASH ESCAPE -> "Only Zeus can end you!" -> ROCKET TO OLYMPUS
addShot({ t: t_retreat, type: 'cu', scene: 'domain-city-storm', actor: 'pegasus', fill: 0.58, push: 1.14, pan: [-20, -25] });
addShot({ t: t_retreat + 2.15, type: 'wide', scene: 'domain-city-storm', cx: 1020, cy: 660, zoom: 0.72, push: 1.12, pan: [25, -45] });
addShot({ t: t_zeus_line, type: 'cu', scene: 'domain-city-storm', actor: 'pegasus', fill: 0.62, push: 1.12, pan: [0, -20] });
addShot({ t: t_zeus_line + 1.45, type: 'wide', scene: 'domain-city-storm', cx: 1020, cy: 520, zoom: 0.64, push: 1.12, pan: [40, -120], tr: { type: 'whip', dur: 0.16, dir: 1 } });
addCue({ actor: 'pegasus', action: 'surge-escape', t0: t_retreat, t1: t_zeus_line, params: { x: [1440, 1380], y: [680, 620], scale: 1.06, flip: -1, pose: { surge: 1.0 } } });
addCue({ actor: 'pegasus', action: 'talk', t0: t_zeus_line, t1: t_zeus_line + 1.45, params: { x: [1380, 1380], y: [620, 600], scale: 1.08, flip: -1, voice: 'pegasus', pose: { surge: 0.85, stormCharge: 1.0 } } });
addCue({ actor: 'pegasus', action: 'ascend-olympus', t0: t_zeus_line + 1.45, t1: t_after + 1.8, params: { x: [1380, 1480], y: [600, -480], scale: 1.05, flip: -1, pose: { diveFlame: 1.0, surge: 0.6 } } });
addCue({ actor: 'scp682', action: 'fly-hover', t0: t_retreat, t1: t_after, params: { x: [620, 440], y: [650, 920], scale: 1.34, flip: 1, pose: { armor: 1, wings: 1 } } });
addFx({ type: 'pillar', t0: t_retreat + 0.25, dur: 0.85, x: 1400, y: 1120, w: 220, color: '#2ef2d4' });
addFx({ type: 'glint', t0: t_retreat + 0.3, dur: 0.6, actor: 'pegasus', at: 'eye', color: '#ffd859', r: 120 });
addFx({ type: 'slash', t0: t_zeus_line + 1.5, x: 1380, y: 640, x2: 1460, y2: -220, r: 280, fly: 0.55, color: '#ffd859' });
addFx({ type: 'sparks', t0: t_zeus_line + 1.55, x: 1400, y: 420, dur: 1.1, n: 30, spread: 280 });
tl.flash.push({ t0: t_retreat + 0.25, dur: 0.16, amp: 0.85, color: '#e6ffff' });

// ==================== 3. 3-BEAT CLIFFHANGER OVER THE BURNING CITY (C9) ====================
addShot({ t: t_after, type: 'wide', scene: 'domain-city-storm', cx: 960, cy: 560, zoom: 0.68, push: 1.08, pan: [0, -55] });
addShot({ t: t_after + 2.3, type: 'wide', scene: 'domain-city-storm', cx: 740, cy: 840, zoom: 0.68, push: 1.06, pan: [-30, -25] });
addCue({ actor: 'scp682', action: 'idle', t0: t_after, t1: t_cliff, params: { x: [420, 420], y: [1120, 1120], scale: 1.36, flip: 1, pose: { armor: 1, wings: 1 } } });

// Beat 2 (Music cuts dead — massive winged, armored 682 flares atop city ruins)
addShot({ t: t_cliff, type: 'low', scene: 'domain-city-storm', actor: 'scp682', zoom: 0.90, ground: 0.86, push: 1.12, pan: [20, -30] });
addShot({ t: t_cliff + 2.2, type: 'cu', scene: 'domain-city-storm', actor: 'scp682', fill: 0.58, push: 1.12, pan: [15, -18] });
addCue({ actor: 'scp682', action: 'roar', t0: t_cliff, t1: t_whisp - 0.6, params: { x: [420, 420], y: [1120, 1120], scale: 1.38, flip: 1, aura: [0.9, 1.3], pose: { armor: 1, wings: 1 } } });
addFx({ type: 'lightning', t0: t_cliff + 1.2, dur: 0.75, x: 960, y: 40, x2: 1120, y2: 460, color: '#ffd859', color2: '#4ce8ff', w: 22, branches: 4 });

// Beat 3 (Visual reveal — unobstructed ECU pale skull & blazing acid eye + "Bring your god." + CTA)
addShot({ t: t_whisp - 0.55, type: 'ecu', scene: 'domain-city-storm', actor: 'scp682', at: 'eye', zoom: 1.9, push: 1.12, pan: [12, -8] });
addShot({ t: t_whisp + 1.15, type: 'wide', scene: 'domain-city-storm', cx: 640, cy: 780, zoom: 0.74, push: 1.08, pan: [0, -35] });
addCue({ actor: 'scp682', action: 'talk', t0: t_whisp - 0.6, t1: D, params: { x: [420, 420], y: [1120, 1120], scale: 1.38, flip: 1, voice: 'scp682', pose: { armor: 1, wings: 1, wingAng: -55 } } });
addFx({ type: 'glint', t0: t_whisp - 0.2, dur: 0.85, actor: 'scp682', at: 'eye', color: '#d9ff3f', r: 120 });
tl.text.push({ t0: t_whisp + 0.9, t1: D - 0.05, text: 'CAN ZEUS STOP SCP-682?', x: 540, y: 420, size: 78, color: '#ffd859', anim: 'blink', shadow: '#000', bg: { fill: '#0b0812', stroke: '#ffd859', sw: 5 } });

const outPath = path.join(__dirname, 'timeline.json');
fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log(`Wrote ${outPath} | duration=${D}s | shots=${tl.shots.length} | cues=${tl.cues.length} | fx=${tl.fx.length}`);
