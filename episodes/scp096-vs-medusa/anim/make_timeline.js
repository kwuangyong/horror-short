#!/usr/bin/env node
// Episode #007 v2: SCP-096 vs MEDUSA (Anti-Guardian · Story Context Hook -> Curse of Sight vs Curse of Stone · C2 Stone Cracks)
// Matches 19-section sections.json (98.99s) & 56-shot script-anim.md with animated fugitive soldier prop (soldierStone track).
const fs = require('fs');
const path = require('path');
const kit = require('../../../tools/anim/episode_kit');

const EP = path.resolve(__dirname, '..');
const AU = path.join(EP, 'audio-anim');
const S = JSON.parse(fs.readFileSync(path.join(AU, 'sections.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(path.join(AU, 'words.json'), 'utf8'));

const sec = (name) => S.sections.find((x) => x.name === name);
const wordsIn = (t0, t1, spk) =>
  W.filter((w) => w.start >= t0 - 0.15 && w.end <= t1 + 0.15 && (!spk || w.speaker === spk))
    .map((w) => [w.start, w.end]);

const D = S.duration;
const t_m0 = sec('intro_scp096').start;
const t_m1 = sec('intro_scp096').end;
const t_g0 = sec('intro_medusa').start;
const t_g1 = sec('intro_medusa').end;
const t_story = sec('story').start;
const t_pet_sol = sec('petrify_soldier').start;
const t_breach = sec('wall_breach').start;
const t_eyelock = sec('eye_lock').start;
const t_charge1 = sec('charge1').start;
const t_wings = sec('wings').start;
const t_barrage = sec('barrage').start;
const t_rev = sec('reversal').start;
const t_slam = sec('slam').start;
const t_pinned = sec('pinned').start;
const t_climax = sec('climax').start;
const t_petrify = sec('petrify').start;
const t_after = sec('aftermath').start;
const t_cliff = sec('cliffhanger').start;
const t_whisp = sec('whisper').start;

const voices = {
  scp096: { words: wordsIn(0, D, 'scp096') },
  medusa: { words: wordsIn(0, D, 'medusa') },
};

// Helper to attach horizontal sprint track to every shape of the fugitive soldier prop
const sol = (sh) => Object.assign({ txTrack: 'soldierX', txK: 1 }, sh);
const solStone = (sh) => Object.assign({ txTrack: 'soldierX', txK: 1, track: 'soldierStone' }, sh);

const tl = {
  fps: 24,
  duration: D,
  camInit: { cx: 880, cy: 840, zoom: 0.72 },
  sides: { left: 'scp096', right: 'medusa' },
  voices,
  domains: {
    cell096: {
      sky: ['#07070b', '#140c10'],
      glow: '#ff2438',
      floor: ['#1b1c20', '#0a0b0e'],
      motif: 'lab',
      rock: '#181a20',
      sigil: '#ff2438',
      motes: '#ff4a5a',
      mist: '#3a141c',
      horizon: 960,
    },
    gorgon: {
      sky: ['#061412', '#0d2b24', '#164538'],
      glow: '#4cff88',
      floor: ['#1b2824', '#0b1411'],
      motif: 'columns',
      rock: '#243630',
      sigil: '#4cff88',
      motes: '#7affad',
      mist: '#24664a',
      horizon: 960,
    },
    'ruins-mist': {
      sky: ['#060d18', '#0f2238', '#1b3852'],
      glow: '#6cd4ff',
      floor: ['#1a242c', '#0b1016'],
      motif: 'ruins',
      rock: '#202c36',
      sigil: null,
      motes: '#78e8b0',
      mist: '#2b5266',
      horizon: 960,
    },
  },
  actors: {
    scp096: {
      kind: 'scp096',
      x: 360,
      y: 1120,
      scale: 1.05,
      flip: 1,
      z: 32,
      rim: '#ff4252',
      rimPx: 7,
      aura: { colors: ['#9c0c18', '#ff2438', '#ffd6d6'], r: 235, h: 245, motes: true, on: 0.75 },
    },
    medusa: {
      kind: 'medusa',
      x: 1400,
      y: 1120,
      scale: 1.05,
      flip: -1,
      z: 34,
      rim: '#4cff88',
      rimPx: 7,
      aura: { colors: ['#145c38', '#38e878', '#f5d25a'], r: 245, h: 255, motes: true, on: 0.85 },
    },
  },
  props: [
    // Torn 4-pixel photograph on steel floor in SCP-096's cell (Intro prop)
    {
      type: 'shape',
      x: 560,
      y: 1125,
      scale: 1.0,
      z: 36,
      scene: 'domain-cell096',
      shapes: [
        { k: 'poly', pts: [[-95, -52], [90, -64], [104, 58], [-88, 66]], fill: '#dce2e8', stroke: '#22262e', sw: 4 },
        { k: 'poly', pts: [[-78, -38], [76, -48], [86, 42], [-72, 48]], fill: '#5b6c7a' },
        { k: 'poly', pts: [[-72, 10], [-12, -26], [34, 6], [84, -18], [86, 42], [-72, 48]], fill: '#9db0bd' },
        { k: 'glow', cx: 14, cy: -6, r: 34, color: '#ff2438', op: 0.88, flick: 0.35 },
        { k: 'poly', pts: [[10, -10], [18, -10], [18, -2], [10, -2]], fill: '#ffffff' },
      ],
    },
    // Animated fugitive soldier prop in Medusa's misty ruins:
    // soldierStone=0 -> alive terrified tactical soldier clutching glowing 4-pixel photo
    // soldierStone=1 -> frozen screaming grey marble statue still clutching the photo!
    {
      type: 'shape',
      x: 880,
      y: 1120,
      scale: 1.08,
      z: 24,
      scene: 'domain-ruins-mist',
      shapes: [
        // Ground contact shadow
        sol({ k: 'ell', cx: 0, cy: 2, rx: 66, ry: 16, fill: '#05090e', op: 0.55 }),

        // --- ALIVE TACTICAL SOLDIER LAYER ---
        // Combat boots & mid-stride tactical pants
        sol({ k: 'poly', pts: [[-42, 0], [-14, 0], [-8, -28], [-38, -28]], fill: '#1a2026', stroke: '#0d1115', sw: 2 }),
        sol({ k: 'poly', pts: [[14, 0], [46, 0], [40, -28], [10, -28]], fill: '#1a2026', stroke: '#0d1115', sw: 2 }),
        sol({ k: 'poly', pts: [[-36, -26], [-8, -26], [-2, -138], [-34, -138]], fill: '#303d33', stroke: '#161d18', sw: 3 }),
        sol({ k: 'poly', pts: [[8, -26], [38, -26], [34, -138], [2, -138]], fill: '#2a362d', stroke: '#161d18', sw: 3 }),
        // Knee pads
        sol({ k: 'poly', pts: [[-32, -74], [-10, -74], [-10, -96], [-32, -96]], fill: '#1b2226' }),
        sol({ k: 'poly', pts: [[10, -74], [34, -74], [34, -96], [10, -96]], fill: '#1b2226' }),
        // Olive tactical torso & armored plate carrier
        sol({ k: 'poly', pts: [[-36, -136], [36, -136], [42, -234], [-42, -234]], fill: '#415440', stroke: '#192219', sw: 3 }),
        sol({ k: 'poly', pts: [[-28, -148], [28, -148], [32, -224], [-32, -224]], fill: '#2b382b', stroke: '#151c16', sw: 2 }),
        sol({ k: 'poly', pts: [[-24, -172], [24, -172], [24, -158], [-24, -158]], fill: '#1f2820' }),
        // Raised defensive left arm & gloved hand
        sol({ k: 'poly', pts: [[-38, -224], [-80, -266], [-64, -280], [-26, -236]], fill: '#3c4e3b', stroke: '#182018', sw: 3 }),
        sol({ k: 'ell', cx: -74, cy: -274, rx: 13, ry: 12, fill: '#1d2428', stroke: '#0e1215', sw: 2 }),
        // Outstretched right arm clutching 4-pixel photo
        sol({ k: 'poly', pts: [[38, -224], [82, -258], [70, -274], [26, -236]], fill: '#3c4e3b', stroke: '#182018', sw: 3 }),
        sol({ k: 'ell', cx: 76, cy: -266, rx: 13, ry: 12, fill: '#1d2428', stroke: '#0e1215', sw: 2 }),
        // Terrified face, wide eyes, open screaming mouth & tactical helmet
        sol({ k: 'ell', cx: 0, cy: -268, rx: 24, ry: 28, fill: '#d6b6a0', stroke: '#2a201c', sw: 3 }),
        sol({ k: 'poly', pts: [[-27, -274], [27, -274], [24, -300], [0, -308], [-24, -300]], fill: '#2e3c2e', stroke: '#141b15', sw: 3 }),
        sol({ k: 'poly', pts: [[-28, -276], [28, -276], [26, -268], [-26, -268]], fill: '#1b241c' }),
        // Wide terrified eyes & screaming mouth
        sol({ k: 'ell', cx: -8, cy: -264, rx: 5, ry: 4.5, fill: '#ffffff' }),
        sol({ k: 'ell', cx: 9, cy: -264, rx: 5, ry: 4.5, fill: '#ffffff' }),
        sol({ k: 'ell', cx: -7, cy: -264, rx: 2, ry: 2, fill: '#0b0e12' }),
        sol({ k: 'ell', cx: 10, cy: -264, rx: 2, ry: 2, fill: '#0b0e12' }),
        sol({ k: 'ell', cx: 1, cy: -250, rx: 8, ry: 10, fill: '#2a0d12', stroke: '#7a4a40', sw: 1.5 }),

        // --- PETRIFIED GREY MARBLE STATUE OVERLAY (soldierStone: 0 -> 1) ---
        solStone({ k: 'poly', pts: [[-56, 4], [56, 4], [44, -28], [-44, -28]], fill: '#4e585c', stroke: '#2c3338', sw: 3 }),
        solStone({ k: 'poly', pts: [[-36, -26], [-8, -26], [-2, -138], [-34, -138]], fill: '#6c777e', stroke: '#3b444a', sw: 3 }),
        solStone({ k: 'poly', pts: [[8, -26], [38, -26], [34, -138], [2, -138]], fill: '#626d74', stroke: '#3b444a', sw: 3 }),
        solStone({ k: 'poly', pts: [[-36, -136], [36, -136], [42, -234], [-42, -234]], fill: '#7a868e', stroke: '#3d474d', sw: 3 }),
        solStone({ k: 'poly', pts: [[-28, -148], [28, -148], [32, -224], [-32, -224]], fill: '#67737a', stroke: '#455057', sw: 2 }),
        solStone({ k: 'poly', pts: [[-38, -224], [-80, -266], [-64, -280], [-26, -236]], fill: '#737f87', stroke: '#3b444a', sw: 3 }),
        solStone({ k: 'ell', cx: -74, cy: -274, rx: 13, ry: 12, fill: '#828f96', stroke: '#3b444a', sw: 2 }),
        solStone({ k: 'poly', pts: [[38, -224], [82, -258], [70, -274], [26, -236]], fill: '#737f87', stroke: '#3b444a', sw: 3 }),
        solStone({ k: 'ell', cx: 76, cy: -266, rx: 13, ry: 12, fill: '#828f96', stroke: '#3b444a', sw: 2 }),
        solStone({ k: 'ell', cx: 0, cy: -268, rx: 24, ry: 28, fill: '#87949c', stroke: '#3e484e', sw: 3 }),
        solStone({ k: 'poly', pts: [[-27, -274], [27, -274], [24, -300], [0, -308], [-24, -300]], fill: '#6a767d', stroke: '#3a4349', sw: 3 }),
        // Hollow stone eyes & frozen screaming stone mouth
        solStone({ k: 'ell', cx: -8, cy: -264, rx: 4.5, ry: 4, fill: '#454f55' }),
        solStone({ k: 'ell', cx: 9, cy: -264, rx: 4.5, ry: 4, fill: '#454f55' }),
        solStone({ k: 'ell', cx: 1, cy: -250, rx: 8, ry: 10, fill: '#353e44' }),
        // Subtle marble fracture lines
        solStone({ k: 'poly', pts: [[-18, -210], [-6, -184], [-14, -158], [-11, -158], [-2, -184], [-14, -210]], fill: '#424c52', op: 0.75 }),

        // Emerald petrification flash aura (pulses when turning to stone)
        sol({ k: 'glow', cx: 0, cy: -180, r: 165, color: '#4cff88', op: 0.85, track: 'soldierGlow', flick: 0.25 }),

        // Crumpled 4-pixel photograph clutched in right hand (persists in stone hand!)
        sol({ k: 'poly', pts: [[66, -296], [116, -306], [122, -252], [72, -244]], fill: '#dce3e8', stroke: '#222830', sw: 3 }),
        sol({ k: 'poly', pts: [[74, -288], [109, -296], [114, -258], [78, -252]], fill: '#5d6e7c' }),
        sol({ k: 'poly', pts: [[76, -264], [92, -282], [104, -270], [114, -258], [78, -252]], fill: '#9fb2bf' }),
        sol({ k: 'glow', cx: 95, cy: -274, r: 30, color: '#ff2438', op: 0.9, flick: 0.35 }),
        sol({ k: 'poly', pts: [[92, -277], [98, -277], [98, -271], [92, -271]], fill: '#ffffff' }),
      ],
    },
    // Rising fractured temple monoliths/spires during Beat 2 reversal
    { type: 'monolith', x: 180, y: 1130, scale: 1.0, h: 520, w: 140, tilt: -8, color: '#ff2438', rock: '#25313a', track: 'rise', scene: 'domain-ruins-mist', z: 14, seed: 4 },
    { type: 'spire', x: 640, y: 1125, scale: 0.9, h: 440, w: 120, tilt: 11, color: '#4cff88', rock: '#1e2c34', track: 'rise', scene: 'domain-ruins-mist', z: 16, seed: 9 },
  ],
  tracks: {
    // Soldier sprints from left into courtyard at start of Story; fixed at x=880 during Hook & after arrival
    soldierX: [
      { t0: 0, t1: t_story - 0.1, v: 0 },
      { t0: t_story - 0.05, t1: t_story - 0.05, v: -290 },
      { t0: t_story, t1: t_story + 2.35, v: 0, ease: 'outCubic' },
    ],
    // 0 = alive terrified tactical soldier -> 1 = frozen grey marble statue (both in Hook AND in Opening Story!)
    soldierStone: [
      { t0: 0, t1: 1.05, v: 0 },
      { t0: 1.05, t1: 1.55, v: 1, ease: 'outCubic' },
      { t0: 1.55, t1: t_story - 0.1, v: 1 },
      { t0: t_story - 0.05, t1: t_story - 0.05, v: 0 },
      { t0: t_story, t1: t_pet_sol + 2.95, v: 0 },
      { t0: t_pet_sol + 2.95, t1: t_pet_sol + 3.75, v: 1, ease: 'outCubic' },
    ],
    // Brief emerald petrification flash over soldier during transformation
    soldierGlow: [
      { t0: 0, t1: 0.98, v: 0 },
      { t0: 1.0, t1: 1.25, v: 1, ease: 'outCubic' },
      { t0: 1.25, t1: 1.75, v: 0 },
      { t0: t_pet_sol + 2.85, t1: t_pet_sol + 3.12, v: 1, ease: 'outCubic' },
      { t0: t_pet_sol + 3.12, t1: t_pet_sol + 3.9, v: 0 },
    ],
    rise: [
      { t0: 0, t1: t_rev - 0.1, v: 0 },
      { t0: t_rev, t1: t_rev + 1.2, v: 1, ease: 'outCubic' },
    ],
  },
  cues: [],
  shots: [],
  fx: [],
  shake: [],
  flash: [],
  text: [],
  cinema: [],
  embers: [],
  glitch: [],
};

// ==================== OPENING (episode_kit.opening) ====================
kit.opening(tl, {
  hookEnd: 3.0,
  hookText: 2.0,
  lockL: 4.15,
  monsterIntro: [t_m0, t_m1],
  lockR: t_g0 - 0.55,
  guardianIntro: [t_g0, t_g1],
  story: t_story,
  monster: {
    kind: 'scp096',
    label: 'SCP-096',
    sub: 'THE SHY GUY',
    title: 'UNSTOPPABLE VISUAL ANOMALY',
    domain: 'cell096',
    color: '#ff3b4d',
    glow: '#7a0a16',
    card: { fx: 0, fy: 268, fscale: 0.48, idle: 'idle-card' },
    pillar: { x: 160, y: 1120, w: 145 },
  },
  guardian: {
    kind: 'medusa',
    label: 'MEDUSA',
    sub: 'CURSED GORGON',
    title: 'GREEK ANTI-GUARDIAN OF STONE',
    domain: 'gorgon',
    color: '#4cff88',
    glow: '#145c38',
    card: { fx: 0, fy: 262, fscale: 0.5, idle: 'idle-card' },
    pillar: { x: 1580, y: 1120, w: 145 },
  },
});

const addShot = (s) => tl.shots.push(s);
const addCue = (c) => tl.cues.push(c);
const addFx = (f) => tl.fx.push(f);
const addShake = (t0, dur, amp) => tl.shake.push({ t0, dur, amp });
const addFlash = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp, color });

// ==================== HOOK (0..3.0 s: Story Context Teaser -> Petrify + Breach -> Eye-Lock Clash) ====================
addCue({ actor: 'scp096', action: 'charge', t0: 0, t1: 1.0, params: { x: [-380, -380], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'scp096', action: 'charge', t0: 1.0, t1: 2.0, params: { x: [-220, 480], y: [1120, 1120], speed: 4.6, ease: 'outCubic' } });
addCue({ actor: 'scp096', action: 'petrify-resist', t0: 2.0, t1: 3.0, params: { x: [480, 520], y: [1120, 1120], stone0: 0.15, stone1: 0.45 } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: 0, t1: 0.95, params: { x: [1540, 1520], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: 0.95, t1: 2.0, params: { x: [1380, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addCue({ actor: 'medusa', action: 'gaze-overdrive', t0: 2.0, t1: 3.0, params: { x: [1340, 1260], y: [1120, 1120] } });

// Hook FX: emerald gaze turns soldier to stone AS 096 smashes wall -> violent eye-lock beam-clash
addFx({ type: 'beam', t0: 0.95, x: 1340, y: 690, x2: 880, y2: 860, w: 68, color: '#4cff88', charge: 0.18, grow: 0.1, hit: true, r: 150 });
addFx({ type: 'impact', t0: 1.18, x: 340, y: 860, dur: 0.75 });
addFx({ type: 'dust', t0: 1.18, x: 360, y: 1080, dur: 1.1, n: 18, spread: 260 });
addFx({ type: 'soil', t0: 1.18, x: 360, y: 1010, dur: 1.0, n: 22 });
addFx({ type: 'beam-clash', t0: 2.0, dur: 1.05, x: 560, y: 630, x2: 1200, y2: 660, colorL: '#ff2438', colorR: '#4cff88', w: 88, amp: 0.11, freq: 5.4, win: 'R', winAt: 2.75 });
addFx({ type: 'sparks', t0: 2.1, x: 880, y: 650, dur: 0.9, n: 24, color: '#7affad' });
addShake(1.15, 0.65, 22);
addFlash(1.15, 0.14, 0.75, '#4cff88');

// Shots #1-#3 (Hook)
addShot({ t: 0.0, type: 'cu', cx: 870, cy: 905, zoom: 1.78, push: 1.16, pan: [12, -10], dutch: -6, hand: 5, scene: 'domain-ruins-mist' });
addShot({ t: 1.0, type: 'low', cx: 740, cy: 900, zoom: 0.92, ground: 0.84, push: 1.14, pan: [-32, -12], dutch: 6, hand: 7 });
addShot({ t: 2.0, type: 'versus', a: 'scp096', b: 'medusa', cy: 840, zoom: 1.08, push: 1.14, pan: [0, -14], dutch: -4, hand: 6 });

// ==================== INTRO MONSTER: SCP-096 (t_m0..t_m1) ====================
addCue({ actor: 'scp096', action: 'cower', t0: t_m0, t1: t_m0 + 1.5, params: { x: [420, 420], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'scp096', action: 'talk', t0: t_m0 + 1.5, t1: t_m1 + 0.1, params: { voice: 'scp096', x: [420, 440], y: [1120, 1120], stone: 0, crack: 0 } });
addFx({ type: 'glint', t0: t_m0 + 3.2, actor: 'scp096', at: 'eye', color: '#ff2438', r: 95, dur: 0.6 });
addFx({ type: 'ripple', t0: t_m0 + 4.4, x: 450, y: 620, dur: 1.2, r: 440, color: '#ff2438' });

// Shots #5-#8 (Intro SCP-096)
const mSpan = t_m1 - t_m0;
addShot({ t: t_m0, type: 'insert', cx: 560, cy: 1110, zoom: 2.2, push: 1.15, pan: [-15, -10], dutch: -5, scene: 'domain-cell096' });
addShot({ t: t_m0 + mSpan * 0.24, type: 'low', actor: 'scp096', zoom: 1.48, ground: 0.86, push: 1.14, pan: [20, -18], hand: 4 });
addShot({ t: t_m0 + mSpan * 0.48, type: 'cu', actor: 'scp096', fill: 0.58, push: 1.14, pan: [12, -8], dutch: 5, hand: 5 });
addShot({ t: t_m0 + mSpan * 0.76, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [0, 10], hand: 7 });

// ==================== INTRO ANTI-GUARDIAN: MEDUSA (t_g0..t_g1) ====================
addCue({ actor: 'medusa', action: 'talk', t0: t_g0, t1: t_g1 + 0.1, params: { voice: 'medusa', x: [1340, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addFx({ type: 'glint', t0: t_g0 + 3.9, actor: 'medusa', at: 'eye', color: '#4cff88', r: 115, dur: 0.65 });
addFx({ type: 'sparks', t0: t_g0 + 0.3, x: 1340, y: 780, dur: 1.4, n: 22, color: '#f0c24b' });

// Shots #10-#13 (Intro Medusa)
const gSpan = t_g1 - t_g0;
addShot({ t: t_g0, type: 'low', actor: 'medusa', zoom: 1.42, ground: 0.90, push: 1.12, pan: [-22, -12], scene: 'domain-gorgon' });
addShot({ t: t_g0 + gSpan * 0.28, type: 'cu', actor: 'medusa', fill: 0.52, dy: -65, push: 1.12, pan: [-14, -6], dutch: -4 });
addShot({ t: t_g0 + gSpan * 0.55, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.3, push: 1.18, pan: [0, -6] });
addShot({ t: t_g0 + gSpan * 0.78, type: 'wide', cx: 1280, cy: 860, zoom: 0.92, push: 1.1, pan: [-32, -12] });

// ==================== STORY & BATTLE (t_story..D) ====================
tl.cinema.push([t_story, t_after + 0.5]);
tl.embers.push([t_story, t_after, '#66ffaa']);
tl.embers.push([t_rev, t_petrify + 1.0, '#ff3344']);

// --- OPENING: 4-PIXEL FUGITIVE -> STONE GARDEN -> BREACH -> EYE LOCK (E6) ---
// story (21.16..26.22): fugitive soldier runs into misty ruins clutching glowing 4-pixel photo
addCue({ actor: 'scp096', action: 'charge', t0: t_story, t1: t_breach + 1.1, params: { x: [-480, -480], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_story, t1: t_pet_sol, params: { x: [1640, 1600], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addFx({ type: 'glint', t0: t_story + 2.7, x: 982, y: 824, color: '#ff2438', r: 90, dur: 0.8 });

// Shots #15-#16 (story)
addShot({ t: t_story, type: 'high', cx: 830, cy: 930, zoom: 0.88, ground: 0.64, push: 1.14, pan: [44, 18], scene: 'domain-ruins-mist' });
addShot({ t: t_story + 2.55, type: 'insert', cx: 958, cy: 848, zoom: 2.55, push: 1.16, pan: [-10, -8], dutch: -5, hand: 5 });

// petrify_soldier (26.22..31.0): Medusa glides from shadows & petrifies the screaming soldier!
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_pet_sol, t1: t_pet_sol + 2.7, params: { x: [1580, 1340], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: t_pet_sol + 2.7, t1: t_breach + 0.1, params: { x: [1340, 1340], y: [1120, 1120] } });
addFx({ type: 'glint', t0: t_pet_sol + 1.75, actor: 'medusa', at: 'eye', color: '#4cff88', r: 120, dur: 0.7 });
addFx({ type: 'beam', t0: t_pet_sol + 2.8, x: 1320, y: 680, x2: 880, y2: 860, w: 68, color: '#4cff88', charge: 0.22, grow: 0.12, hit: true, r: 155 });
addFx({ type: 'impact', t0: t_pet_sol + 3.12, x: 880, y: 860, dur: 0.8 });
addFx({ type: 'dust', t0: t_pet_sol + 3.15, x: 880, y: 1090, dur: 1.2, n: 18, spread: 210 });
addShake(t_pet_sol + 3.1, 0.55, 16);
addFlash(t_pet_sol + 3.1, 0.14, 0.75, '#4cff88');

// Shots #17-#19 (petrify_soldier)
addShot({ t: t_pet_sol, type: 'follow', actor: 'medusa', dx: -16, dy: -260, zoom: 1.08, push: 1.12, pan: [-26, 0], dutch: 4 });
addShot({ t: t_pet_sol + 1.65, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.35, push: 1.18, pan: [-8, 0] });
addShot({ t: t_pet_sol + 2.9, type: 'cu', cx: 885, cy: 905, zoom: 1.68, push: 1.16, pan: [12, -10], dutch: -4, hand: 6 });

// wall_breach (31.0..36.35): Deafening shriek -> SCP-096 smashes through the outer stone wall!
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_breach, t1: t_eyelock + 1.2, params: { x: [1340, 1340], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'charge', t0: t_breach + 1.1, t1: t_eyelock - 0.1, params: { x: [-300, 420], y: [1120, 1120], speed: 4.5, ease: 'outCubic' } });
addFx({ type: 'ripple', t0: t_breach + 0.15, x: 240, y: 760, dur: 1.2, r: 520, color: '#ff2438' });
addFx({ type: 'impact', t0: t_breach + 1.4, x: 240, y: 880, dur: 0.9 });
addFx({ type: 'dust', t0: t_breach + 1.4, x: 260, y: 1080, dur: 1.5, n: 22, spread: 280 });
addFx({ type: 'soil', t0: t_breach + 1.4, x: 260, y: 1010, dur: 1.35, n: 26 });
addFx({ type: 'speed', t0: t_breach + 1.45, x: 340, y: 840, dur: 1.1, n: 28 });
addShake(t_breach + 0.2, 0.55, 14);
addShake(t_breach + 1.4, 0.75, 24);
addFlash(t_breach + 1.4, 0.14, 0.75, '#ff3344');

// Shots #20-#21b (wall_breach)
addShot({ t: t_breach, type: 'low', cx: 560, cy: 890, zoom: 1.12, ground: 0.85, push: 1.12, pan: [-26, -12], hand: 6 });
addShot({ t: t_breach + 1.3, type: 'follow', actor: 'scp096', dx: 85, dy: -260, zoom: 1.16, push: 1.14, pan: [52, -10], dutch: 8, hand: 7, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_breach + 3.45, type: 'low', actor: 'scp096', zoom: 1.36, ground: 0.86, push: 1.12, pan: [28, -10], hand: 5 });

// eye_lock (36.35..40.84): Target already marble -> 1v1 establishing -> Medusa looks straight into 096's face!
addCue({ actor: 'scp096', action: 'cower', t0: t_eyelock, t1: t_charge1, params: { x: [420, 420], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'medusa', action: 'gaze-charge', t0: t_eyelock + 2.8, t1: t_charge1 + 2.4, params: { x: [1340, 1340], y: [1120, 1120] } });
addFx({ type: 'glint', t0: t_eyelock + 3.1, actor: 'medusa', at: 'eye', color: '#4cff88', r: 120, dur: 0.7 });

// Shots #22-#24 (eye_lock)
addShot({ t: t_eyelock, type: 'cu', actor: 'scp096', fill: 0.56, push: 1.14, pan: [24, -6], hand: 5 });
addShot({ t: t_eyelock + 1.35, type: 'wide', cx: 880, cy: 870, zoom: 0.74, push: 1.08, pan: [0, -14] });
addShot({ t: t_eyelock + 3.0, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.35, push: 1.18, pan: [-10, 0] });

// --- BEAT 1: VISUAL CURSES IGNITE, GOLDEN WINGS & SERPENT VENOM ---
// charge1 (40.84..45.78): 096 unhinges jaw, charges -> Medusa fires first emerald beam
addCue({ actor: 'scp096', action: 'trigger-unhinge', t0: t_charge1, t1: t_charge1 + 1.6, params: { x: [420, 400], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'charge', t0: t_charge1 + 1.6, t1: t_wings, params: { x: [400, 840], y: [1120, 1120], speed: 4.6 } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: t_charge1 + 2.4, t1: t_wings + 1.4, params: { x: [1340, 1360], y: [1120, 1120] } });
addFx({ type: 'ripple', t0: t_charge1 + 0.15, x: 430, y: 610, dur: 1.25, r: 540, color: '#ff2438' });
addFx({ type: 'speed', t0: t_charge1 + 1.7, x: 560, y: 840, dur: 1.1, n: 26 });
addFx({ type: 'dust', t0: t_charge1 + 1.7, x: 460, y: 1090, dur: 1.1, n: 16, spread: 240 });
addFx({ type: 'beam', t0: t_charge1 + 3.1, x: 1320, y: 670, x2: 740, y2: 700, w: 74, color: '#4cff88', charge: 0.25, grow: 0.14, hit: true, r: 165 });
addFx({ type: 'sparks', t0: t_charge1 + 3.5, x: 740, y: 700, dur: 0.9, n: 24, color: '#4cff88' });
addShake(t_charge1 + 0.15, 0.6, 18);
addShake(t_charge1 + 3.45, 0.5, 17);
addFlash(t_charge1 + 3.45, 0.12, 0.65, '#4cff88');

// Shots #25-#27 (charge1)
addShot({ t: t_charge1, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [10, 8], dutch: -7, hand: 8, tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_charge1 + 1.6, type: 'low', actor: 'scp096', zoom: 1.42, ground: 0.86, push: 1.16, pan: [55, -14], dutch: 8, hand: 6 });
addShot({ t: t_charge1 + 3.25, type: 'versus', a: 'scp096', b: 'medusa', cy: 850, zoom: 1.02, push: 1.12, pan: [-30, 0], tr: { type: 'whip', dur: 0.2, dir: 1 } });

// wings (45.78..50.45): Grey stone creeps across 096 -> 096 shatters crust & blasts through column!
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_wings, t1: t_wings + 2.3, params: { x: [840, 870], y: [1120, 1120], stone0: 0.42, stone1: 0.12 } });
addCue({ actor: 'scp096', action: 'charge', t0: t_wings + 2.3, t1: t_barrage + 1.1, params: { x: [870, 1080], y: [1120, 1120], stone: 0.05, speed: 4.2 } });
addCue({ actor: 'medusa', action: 'gaze-charge', t0: t_wings + 1.4, t1: t_barrage, params: { x: [1360, 1360], y: [1120, 1120] } });
addFx({ type: 'soil', t0: t_wings + 0.9, x: 855, y: 740, dur: 1.1, n: 22 });
addFx({ type: 'impact', t0: t_wings + 2.55, x: 960, y: 860, dur: 0.8 });
addFx({ type: 'dust', t0: t_wings + 2.55, x: 980, y: 1080, dur: 1.2, n: 18, spread: 250 });
addShake(t_wings + 2.55, 0.5, 16);

// Shots #28-#29 (wings)
addShot({ t: t_wings, type: 'cu', actor: 'scp096', fill: 0.58, push: 1.15, pan: [18, -10], dutch: -6, hand: 6 });
addShot({ t: t_wings + 2.3, type: 'wide', cx: 920, cy: 860, zoom: 0.78, push: 1.12, pan: [32, -10] });

// barrage (50.45..55.90): Medusa spreads golden wings, banks skyward, slashes bronze claws & rains serpent venom!
addCue({ actor: 'medusa', action: 'wing-dodge', t0: t_barrage, t1: t_barrage + 1.35, params: { x: [1360, 1310], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'bronze-slash', t0: t_barrage + 1.35, t1: t_barrage + 3.2, params: { x: [1310, 1210], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'snake-strike', t0: t_barrage + 3.2, t1: t_rev, params: { x: [1210, 1280], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'hurt', t0: t_barrage + 2.2, t1: t_rev, params: { x: [1080, 620], y: [1120, 1120], stone: 0, ease: 'outCubic' } });

addFx({ type: 'sparks', t0: t_barrage + 0.15, x: 1340, y: 760, dur: 1.1, n: 24, color: '#f0c24b' });
addFx({ type: 'glint', t0: t_barrage + 1.4, actor: 'medusa', at: 'hand', color: '#ffd87a', r: 108, dur: 0.55 });
addFx({ type: 'slash', t0: t_barrage + 2.1, x: 1180, y: 690, x2: 760, y2: 780, r: 260, fly: 0.34, color: '#f0c24b', hit: true });
addFx({ type: 'slash', t0: t_barrage + 2.55, x: 1160, y: 740, x2: 700, y2: 840, r: 240, fly: 0.32, color: '#ffe588', flipV: true, hit: true });
addFx({ type: 'impact', t0: t_barrage + 2.45, x: 760, y: 780, dur: 0.7 });
addFx({ type: 'sparks', t0: t_barrage + 2.45, x: 760, y: 780, dur: 1.0, n: 26, color: '#ff3b4d' });
addFx({ type: 'orbs', t0: t_barrage + 4.15, x: 1200, y: 640, x2: 640, y2: 780, n: 6, stagger: 0.1, fly: 0.48, arc: 240, r: 24, color: '#38ff88' });
addFx({ type: 'smoke', t0: t_barrage + 4.7, x: 640, y: 820, dur: 1.3, n: 12, dark: true });
addShake(t_barrage + 2.45, 0.55, 18);
addFlash(t_barrage + 2.45, 0.12, 0.7, '#ffd87a');

// Shots #30-#34 (barrage)
addShot({ t: t_barrage, type: 'high', actor: 'medusa', zoom: 1.14, ground: 0.72, push: 1.14, pan: [-34, -36], tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_barrage + 1.15, type: 'follow', actor: 'medusa', dx: -75, dy: -340, zoom: 1.2, push: 1.12, pan: [-40, -18], dutch: 6 });
addShot({ t: t_barrage + 2.25, type: 'versus', a: 'scp096', b: 'medusa', cy: 820, zoom: 1.05, push: 1.12, pan: [-42, 10], tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_barrage + 3.35, type: 'ecu', actor: 'medusa', at: 'snake', zoom: 2.9, push: 1.16, pan: [-18, 0], dutch: -6 });
addShot({ t: t_barrage + 4.4, type: 'versus', a: 'scp096', b: 'medusa', cy: 830, zoom: 1.0, push: 1.12, pan: [-36, 12], tr: { type: 'whip', dur: 0.2, dir: -1 } });

// --- BEAT 2: INDESTRUCTIBLE SKELETON & SKY REVERSAL ---
// reversal (55.90..60.93): 096 rises roaring through venom smoke, monoliths erupt, claws Medusa mid-air!
addCue({ actor: 'scp096', action: 'roar', t0: t_rev, t1: t_rev + 2.8, params: { x: [620, 620], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'claw-slash', t0: t_rev + 2.8, t1: t_slam, params: { x: [620, 960], y: [1120, 1120], arc: 220 } });
addCue({ actor: 'medusa', action: 'wing-dodge', t0: t_rev, t1: t_slam - 0.1, params: { x: [1280, 1160], y: [1120, 1120] } });

addFx({ type: 'pillar', t0: t_rev + 0.15, x: 620, y: 1120, w: 170, color: '#ff2438', dur: 0.75 });
addFx({ type: 'glint', t0: t_rev + 1.9, actor: 'scp096', at: 'eye', color: '#ff2438', r: 95, dur: 0.6 });
addFx({ type: 'dust', t0: t_rev + 0.2, x: 620, y: 1100, dur: 1.4, n: 20, spread: 280 });
addFx({ type: 'soil', t0: t_rev + 0.3, x: 240, y: 1060, dur: 1.4, n: 20 });
addFx({ type: 'impact', t0: t_rev + 4.3, x: 1080, y: 740, dur: 0.65 });
addShake(t_rev + 0.2, 0.7, 20);

// Shots #35-#37 (reversal)
addShot({ t: t_rev, type: 'low', actor: 'scp096', zoom: 1.38, ground: 0.86, push: 1.16, pan: [22, -26], dutch: -7, hand: 7 });
addShot({ t: t_rev + 1.7, type: 'cu', actor: 'scp096', fill: 0.58, push: 1.14, pan: [16, -8], hand: 6 });
addShot({ t: t_rev + 3.3, type: 'follow', actor: 'scp096', dx: 110, dy: -320, zoom: 1.25, push: 1.14, pan: [64, -36], dutch: 10, hand: 7, tr: { type: 'whip', dur: 0.22, dir: 1 } });

// slam (60.93..64.45): 096 drags Medusa out of the sky and slams her into the marble floor!
addCue({ actor: 'scp096', action: 'grab-crush', t0: t_slam, t1: t_climax, params: { x: [960, 960], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'pinned', t0: t_slam, t1: t_climax, params: { x: [1160, 1140], y: [1120, 1120], wingDmg: 0.75, ichor: 0.9 } });

addFx({ type: 'impact', t0: t_slam + 0.45, x: 1100, y: 1060, dur: 1.0 });
addFx({ type: 'dust', t0: t_slam + 0.45, x: 1100, y: 1100, dur: 1.6, n: 24, spread: 340 });
addFx({ type: 'soil', t0: t_slam + 0.45, x: 1100, y: 1040, dur: 1.4, n: 26 });
addFx({ type: 'sparks', t0: t_slam + 0.45, x: 1100, y: 1020, dur: 1.1, n: 24, color: '#f0c24b' });
addShake(t_slam + 0.45, 0.8, 26);
addFlash(t_slam + 0.45, 0.16, 0.85, '#ffffff');

// Shots #38-#39 (slam)
addShot({ t: t_slam, type: 'wide', cx: 1060, cy: 860, zoom: 0.84, push: 1.12, pan: [10, 16], dutch: -7, hand: 7 });
addShot({ t: t_slam + 1.8, type: 'cu', actor: 'medusa', fill: 0.6, push: 1.14, pan: [-12, 16], dutch: 8, hand: 5 });

// pinned (64.45..69.11): Golden wings broken, towering 096 raises bloody claws over Medusa
addCue({ actor: 'scp096', action: 'roar', t0: t_pinned + 1.8, t1: t_climax, params: { x: [960, 950], y: [1120, 1120] } });
// Shots #40-#41 (pinned)
addShot({ t: t_pinned, type: 'low', actor: 'scp096', zoom: 1.48, ground: 0.88, push: 1.16, pan: [22, -16], dutch: -8, hand: 7 });
addShot({ t: t_pinned + 2.25, type: 'ecu', actor: 'scp096', at: 'claw', zoom: 2.3, push: 1.16, pan: [-12, -16], dutch: 6, hand: 7 });

// --- BEAT 3: POINT-BLANK PETRIFICATION (A4 CLIMAX: beam-clash + slow-mo + crash-zoom) ---
addCue({ actor: 'medusa', action: 'gaze-overdrive', t0: t_climax, t1: t_after - 0.1, params: { x: [1140, 1140], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'roar', t0: t_climax, t1: t_petrify, params: { x: [940, 900], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_petrify, t1: t_petrify + 2.8, params: { x: [900, 720], y: [1120, 1120], stone0: 0.15, stone1: 1.0 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_petrify + 2.8, t1: t_cliff, params: { x: [720, 720], y: [1120, 1120], stone: 1.0, crack: 0 } });

addFx({ type: 'glint', t0: t_climax + 0.25, actor: 'medusa', at: 'eye', color: '#4cff88', r: 145, dur: 0.9 });
addFx({ type: 'pillar', t0: t_climax + 0.6, x: 1140, y: 1120, w: 190, color: '#4cff88', dur: 0.75 });
addFx({ type: 'beam-clash', t0: t_climax + 1.8, dur: 4.55, x: 900, y: 650, x2: 1120, y2: 740, colorL: '#ff2438', colorR: '#4cff88', w: 96, amp: 0.12, freq: 5.5, win: 'R', winAt: t_petrify + 0.35 });
addFx({ type: 'sparks', t0: t_climax + 2.0, x: 1010, y: 690, dur: 3.0, n: 26, color: '#7affad' });
addFx({ type: 'pillar', t0: t_petrify + 0.55, x: 750, y: 1120, w: 220, color: '#4cff88', dur: 1.35 });
addFx({ type: 'impact', t0: t_petrify + 0.55, x: 750, y: 740, dur: 1.2 });
addFx({ type: 'dust', t0: t_petrify + 0.65, x: 750, y: 1080, dur: 1.8, n: 28, spread: 340 });
addShake(t_climax + 1.9, 1.8, 16);
addShake(t_petrify + 0.55, 1.1, 28);
addFlash(t_petrify + 0.55, 0.22, 0.95, '#7affad');

// Shots #42-#44 (climax)
addShot({ t: t_climax, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.6, push: 1.22, pan: [-8, 0], hand: 5 });
addShot({ t: t_climax + 1.9, type: 'versus', a: 'scp096', b: 'medusa', cy: 840, zoom: 1.25, push: 1.12, pan: [0, -10], dutch: 6, hand: 7 });
addShot({ t: t_climax + 4.05, type: 'cu', actor: 'medusa', fill: 0.62, push: 1.16, pan: [-14, -8], dutch: -5, hand: 6 });

// Shots #45-#47 (petrify — FINISHING BLOW: slow-mo + crash-zoom!)
addShot({ t: t_petrify, type: 'versus', a: 'scp096', b: 'medusa', cy: 820, zoom: 1.18, push: 1.15, pan: [-42, 0], slow: 0.35, crash: { at: t_petrify + 0.55, dur: 0.55, k: 1.55 }, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_petrify + 1.85, type: 'cu', actor: 'scp096', fill: 0.6, push: 1.18, pan: [12, -14], slow: 0.45, dutch: -5 });
addShot({ t: t_petrify + 3.55, type: 'wide', cx: 920, cy: 860, zoom: 0.76, push: 1.06, pan: [-16, 0] });

// --- AFTERMATH (t_after..t_cliff) ---
addCue({ actor: 'medusa', action: 'breathe-after', t0: t_after, t1: t_after + 4.3, params: { x: [1220, 1280], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'talk', t0: t_after + 4.3, t1: t_cliff - 1.3, params: { voice: 'medusa', x: [1280, 1280], y: [1120, 1120], wingDmg: 0.75, ichor: 0.85 } });
addCue({ actor: 'medusa', action: 'walk-away', t0: t_cliff - 1.3, t1: D, params: { x: [1280, 1740], y: [1120, 1120], flip: 1 } });

// Shots #48-#51 (aftermath)
addShot({ t: t_after, type: 'low', actor: 'medusa', zoom: 1.38, ground: 0.86, push: 1.08, pan: [-14, -10] });
addShot({ t: t_after + 2.35, type: 'cu', actor: 'medusa', fill: 0.56, push: 1.08, pan: [6, -4] });
addShot({ t: t_after + 4.65, type: 'versus', a: 'scp096', b: 'medusa', cy: 860, zoom: 0.92, push: 1.06, pan: [18, 0] });
addShot({ t: t_cliff - 2.25, type: 'wide', cx: 960, cy: 860, zoom: 0.78, push: 1.05, pan: [-24, 0] });

// --- 3-BEAT CLIFFHANGER (C2: STONE CRACKS, WHITE INDESTRUCTIBLE SKULL REVEALED!) ---
addCue({ actor: 'scp096', action: 'petrified', t0: t_cliff, t1: t_cliff + 1.85, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 0.4 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_cliff + 1.85, t1: t_cliff + 3.65, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 0.65 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_cliff + 3.65, t1: D, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 1.0 } });

addFx({ type: 'soil', t0: t_cliff + 1.9, x: 775, y: 635, dur: 1.1, n: 16 });
addFx({ type: 'dust', t0: t_cliff + 1.95, x: 775, y: 655, dur: 1.2, n: 12, spread: 140 });
addFx({ type: 'soil', t0: t_cliff + 3.7, x: 775, y: 635, dur: 1.3, n: 22 });
addFx({ type: 'glint', t0: t_cliff + 3.75, actor: 'scp096', at: 'mouth', color: '#ff2438', r: 125, dur: 2.2 });
addFx({ type: 'smoke', t0: t_whisp - 0.5, x: 775, y: 645, dur: 2.5, n: 10, dark: true });
addShake(t_cliff + 3.7, 0.5, 16);
addFlash(t_cliff + 3.7, 0.12, 0.55, '#ff2438');

// Shots #52-#56 (cliffhanger + whisper)
addShot({ t: t_cliff, type: 'insert', cx: 775, cy: 625, zoom: 2.15, push: 1.16, pan: [0, -8], hand: 3 });
addShot({ t: t_cliff + 1.85, type: 'cu', actor: 'scp096', fill: 0.6, push: 1.14, pan: [8, -4], hand: 4 });
addShot({ t: t_cliff + 3.65, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [6, 4], hand: 5 });
addShot({ t: t_whisp, type: 'ecu', actor: 'scp096', at: 'head', zoom: 2.85, push: 1.16, pan: [0, -6], dutch: -6, hand: 7 });
addShot({ t: t_whisp + 2.1, type: 'wide', cx: 780, cy: 820, zoom: 0.92, push: 1.1, pan: [0, -18], hand: 4 });

tl.text.push({
  t0: t_whisp + 1.7,
  t1: D,
  text: 'CAN STONE REALLY\nHOLD IT?',
  x: 540,
  y: 410,
  size: 76,
  color: '#ff4a5a',
  anim: 'blink',
  shadow: '#000',
});

tl.shots.sort((a, b) => a.t - b.t);

const outPath = path.join(__dirname, 'timeline.json');
fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log(`Wrote ${outPath} | duration=${D.toFixed(2)}s | shots=${tl.shots.length} | fx=${tl.fx.length} | cues=${tl.cues.length}`);
