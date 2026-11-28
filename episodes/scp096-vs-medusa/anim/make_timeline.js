#!/usr/bin/env node
// Episode #007: SCP-096 vs MEDUSA (Anti-Guardian · Curse of Sight vs Curse of Stone · C2 Stone Cracks)
// Uses expanded camera grammar (high, low, follow, cu, ecu, versus, wide, insert, dutch, hand, whip, slow, crash).
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
        // Four white cursed pixels glowing red-white!
        { k: 'glow', cx: 14, cy: -6, r: 32, color: '#ff2438', op: 0.85, flick: 0.35 },
        { k: 'poly', pts: [[10, -10], [18, -10], [18, -2], [10, -2]], fill: '#ffffff' },
      ],
    },
    // Petrified trespasser statue clutching photo in Medusa's courtyard (Story prop)
    {
      type: 'shape',
      x: 880,
      y: 1120,
      scale: 1.0,
      z: 22,
      scene: 'domain-ruins-mist',
      shapes: [
        { k: 'poly', pts: [[-48, 0], [48, 0], [36, -34], [-36, -34]], fill: '#4e585c' },
        { k: 'poly', pts: [[-24, -34], [24, -34], [30, -210], [-28, -210]], fill: '#6d777c' },
        { k: 'ell', cx: 0, cy: -242, rx: 24, ry: 28, fill: '#7d888d' },
        { k: 'poly', pts: [[-26, -192], [-66, -242], [-52, -252], [-18, -206]], fill: '#646e73' },
        { k: 'poly', pts: [[26, -192], [68, -236], [56, -248], [18, -206]], fill: '#646e73' },
        // Crumpled photo in stone hand
        { k: 'poly', pts: [[56, -254], [84, -262], [88, -236], [60, -230]], fill: '#cbd4da' },
        { k: 'ell', cx: 72, cy: -246, rx: 3, ry: 3, fill: '#ff2438' },
      ],
    },
    // Rising fractured temple monoliths/spires during Beat 2 reversal
    { type: 'monolith', x: 180, y: 1130, scale: 1.0, h: 520, w: 140, tilt: -8, color: '#ff2438', rock: '#25313a', track: 'rise', scene: 'domain-ruins-mist', z: 14, seed: 4 },
    { type: 'spire', x: 640, y: 1125, scale: 0.9, h: 440, w: 120, tilt: 11, color: '#4cff88', rock: '#1e2c34', track: 'rise', scene: 'domain-ruins-mist', z: 16, seed: 9 },
  ],
  tracks: {
    rise: [{ t0: 0, t1: t_rev - 0.1, v: 0 }, { t0: t_rev, t1: t_rev + 1.2, v: 1, ease: 'outCubic' }],
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

// ==================== HOOK (0..3.0 s, in medias res) ====================
addCue({ actor: 'scp096', action: 'petrify-resist', t0: 0, t1: 3.0, params: { x: [480, 520], y: [1120, 1120], stone0: 0.2, stone1: 0.55 } });
addCue({ actor: 'medusa', action: 'gaze-overdrive', t0: 0, t1: 3.0, params: { x: [1220, 1220], y: [1120, 1120] } });
addFx({ type: 'glint', t0: 0.1, actor: 'medusa', at: 'eye', color: '#4cff88', r: 120, dur: 0.7 });
addFx({ type: 'beam-clash', t0: 0.9, dur: 2.1, x: 560, y: 630, x2: 1160, y2: 660, colorL: '#ff2438', colorR: '#4cff88', w: 86, amp: 0.1, freq: 5.2, win: 'R', winAt: 2.4 });
addShot({ t: 0.0, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.4, push: 1.15, pan: [-18, 0], dutch: -6, hand: 3, scene: 'domain-ruins-mist' });
addShot({ t: 1.0, type: 'versus', a: 'scp096', b: 'medusa', cy: 840, zoom: 1.12, push: 1.12, pan: [0, -14], dutch: 4, hand: 5 });
addShot({ t: 2.0, type: 'low', actor: 'scp096', zoom: 1.55, ground: 0.86, push: 1.14, pan: [24, -12], dutch: -8, hand: 6 });

// ==================== INTRO MONSTER: SCP-096 (t_m0..t_m1) ====================
addCue({ actor: 'scp096', action: 'cower', t0: t_m0, t1: t_m0 + 1.5, params: { x: [420, 420], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'scp096', action: 'talk', t0: t_m0 + 1.5, t1: t_m1 + 0.1, params: { voice: 'scp096', x: [420, 440], y: [1120, 1120], stone: 0, crack: 0 } });
addFx({ type: 'glint', t0: t_m0 + 3.2, actor: 'scp096', at: 'eye', color: '#ff2438', r: 95, dur: 0.6 });
addFx({ type: 'ripple', t0: t_m0 + 4.4, x: 450, y: 620, dur: 1.2, r: 440, color: '#ff2438' });

const mSpan = t_m1 - t_m0;
addShot({ t: t_m0, type: 'insert', cx: 560, cy: 1110, zoom: 2.2, push: 1.15, pan: [-15, -10], dutch: -5, scene: 'domain-cell096' });
addShot({ t: t_m0 + mSpan * 0.24, type: 'low', actor: 'scp096', zoom: 1.48, ground: 0.86, push: 1.14, pan: [20, -18], hand: 4 });
addShot({ t: t_m0 + mSpan * 0.52, type: 'cu', actor: 'scp096', fill: 0.58, push: 1.14, pan: [12, -8], dutch: 5, hand: 5 });
addShot({ t: t_m0 + mSpan * 0.76, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [0, 10], hand: 7 });

// ==================== INTRO ANTI-GUARDIAN: MEDUSA (t_g0..t_g1) ====================
addCue({ actor: 'medusa', action: 'talk', t0: t_g0, t1: t_g1 + 0.1, params: { voice: 'medusa', x: [1340, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addFx({ type: 'glint', t0: t_g0 + 3.8, actor: 'medusa', at: 'eye', color: '#4cff88', r: 115, dur: 0.65 });
addFx({ type: 'sparks', t0: t_g0 + 0.3, x: 1340, y: 780, dur: 1.4, n: 22, color: '#f0c24b' });

const gSpan = t_g1 - t_g0;
addShot({ t: t_g0, type: 'low', actor: 'medusa', zoom: 1.45, ground: 0.86, push: 1.12, pan: [-22, -16], scene: 'domain-gorgon' });
addShot({ t: t_g0 + gSpan * 0.28, type: 'cu', actor: 'medusa', fill: 0.58, push: 1.14, pan: [-14, -6], dutch: -4 });
addShot({ t: t_g0 + gSpan * 0.56, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.3, push: 1.18, pan: [0, -6] });
addShot({ t: t_g0 + gSpan * 0.78, type: 'wide', cx: 1280, cy: 860, zoom: 0.92, push: 1.1, pan: [-32, -12] });

// ==================== STORY & BATTLE (t_story..D) ====================
tl.cinema.push([t_story, t_after + 0.5]);
tl.embers.push([t_story, t_after, '#66ffaa']);
tl.embers.push([t_rev, t_petrify + 1.0, '#ff3344']);

// --- OPENING: MEDUSA'S STONE GARDEN (E6) ---
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_story, t1: t_eyelock, params: { x: [1480, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addCue({ actor: 'scp096', action: 'charge', t0: t_story, t1: t_breach + 0.3, params: { x: [-420, -420], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'scp096', action: 'charge', t0: t_breach + 0.3, t1: t_eyelock - 0.1, params: { x: [-280, 420], y: [1120, 1120], speed: 4.2, ease: 'outCubic' } });

addFx({ type: 'impact', t0: t_breach + 0.6, x: 240, y: 880, dur: 0.9 });
addFx({ type: 'dust', t0: t_breach + 0.6, x: 240, y: 1080, dur: 1.5, n: 18, spread: 260 });
addFx({ type: 'soil', t0: t_breach + 0.6, x: 260, y: 1020, dur: 1.3, n: 22 });
addFx({ type: 'speed', t0: t_breach + 1.0, x: 340, y: 840, dur: 1.0, n: 26 });
addShake(t_breach + 0.6, 0.7, 22);
addFlash(t_breach + 0.6, 0.14, 0.7, '#ff3344');

// Expanded cameras: high bird's-eye -> follow glide -> insert statue -> follow charge -> wide establishing
addShot({ t: t_story, type: 'high', cx: 1120, cy: 900, zoom: 0.78, ground: 0.64, push: 1.12, pan: [-35, 22], scene: 'domain-ruins-mist' });
addShot({ t: t_story + 1.85, type: 'follow', actor: 'medusa', dx: -10, dy: -260, zoom: 1.05, push: 1.1, pan: [-20, 0], dutch: 4 });
addShot({ t: t_breach, type: 'insert', cx: 880, cy: 910, zoom: 2.05, push: 1.14, pan: [18, -12], dutch: -4 });
addShot({ t: t_breach + 1.55, type: 'follow', actor: 'scp096', dx: 80, dy: -260, zoom: 1.16, push: 1.14, pan: [50, -10], dutch: 7, hand: 7, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_breach + 3.45, type: 'wide', cx: 880, cy: 870, zoom: 0.74, push: 1.08, pan: [0, -14] });

// --- BEAT 1: FATAL LOCK OF EYES, CHARGE, PETRIFYING BEAM & GOLDEN WINGS ---
addCue({ actor: 'scp096', action: 'trigger-unhinge', t0: t_eyelock, t1: t_charge1, params: { x: [420, 400], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'gaze-charge', t0: t_eyelock, t1: t_charge1 + 0.8, params: { x: [1340, 1340], y: [1120, 1120] } });
addFx({ type: 'glint', t0: t_eyelock + 0.25, actor: 'medusa', at: 'eye', color: '#4cff88', r: 110, dur: 0.6 });
addFx({ type: 'ripple', t0: t_eyelock + 1.8, x: 430, y: 610, dur: 1.3, r: 540, color: '#ff2438' });
addShake(t_eyelock + 1.8, 0.65, 18);

addShot({ t: t_eyelock, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.3, push: 1.16, pan: [-10, 0] });
addShot({ t: t_eyelock + 1.75, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [12, 8], dutch: -7, hand: 8, tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_eyelock + 3.3, type: 'wide', cx: 880, cy: 860, zoom: 0.78, push: 1.1, pan: [20, -12] });

// Charge & first emerald beam
addCue({ actor: 'scp096', action: 'charge', t0: t_charge1, t1: t_wings - 0.1, params: { x: [400, 820], y: [1120, 1120], speed: 4.5 } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: t_charge1 + 0.8, t1: t_wings + 0.4, params: { x: [1340, 1360], y: [1120, 1120] } });
addFx({ type: 'speed', t0: t_charge1 + 0.1, x: 560, y: 840, dur: 1.0, n: 24 });
addFx({ type: 'beam', t0: t_charge1 + 1.1, x: 1320, y: 670, x2: 720, y2: 700, w: 74, color: '#4cff88', charge: 0.3, grow: 0.14, hit: true, r: 160 });
addShake(t_charge1 + 1.5, 0.5, 16);
addFlash(t_charge1 + 1.5, 0.12, 0.65, '#4cff88');

addShot({ t: t_charge1, type: 'low', actor: 'scp096', zoom: 1.42, ground: 0.86, push: 1.16, pan: [55, -14], dutch: 9, hand: 6 });
addShot({ t: t_charge1 + 1.45, type: 'versus', a: 'scp096', b: 'medusa', cy: 850, zoom: 1.02, push: 1.12, pan: [-30, 0], tr: { type: 'whip', dur: 0.2, dir: 1 } });

// Grey stone creeps on 096 -> 096 shatters crust -> Medusa snaps golden wings & soars!
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_wings, t1: t_wings + 2.2, params: { x: [820, 860], y: [1120, 1120], stone0: 0.45, stone1: 0.15 } });
addCue({ actor: 'scp096', action: 'charge', t0: t_wings + 2.2, t1: t_barrage, params: { x: [860, 1100], y: [1120, 1120], stone: 0.08, speed: 4.0 } });
addCue({ actor: 'medusa', action: 'wing-dodge', t0: t_wings + 1.5, t1: t_barrage, params: { x: [1360, 1320], y: [1120, 1120] } });
addFx({ type: 'soil', t0: t_wings + 0.9, x: 840, y: 740, dur: 1.1, n: 20 });
addFx({ type: 'sparks', t0: t_wings + 1.7, x: 1340, y: 760, dur: 1.2, n: 24, color: '#f0c24b' });
addFx({ type: 'dust', t0: t_wings + 2.4, x: 1020, y: 1080, dur: 1.2, n: 16, spread: 240 });

addShot({ t: t_wings, type: 'cu', actor: 'scp096', fill: 0.56, push: 1.15, pan: [18, -10], dutch: -6, hand: 6 });
addShot({ t: t_wings + 1.75, type: 'high', actor: 'medusa', zoom: 1.15, ground: 0.72, push: 1.14, pan: [-34, -36], tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_wings + 3.45, type: 'follow', actor: 'medusa', dx: -80, dy: -360, zoom: 1.18, push: 1.12, pan: [-42, -20], dutch: 6 });

// --- AERIAL BRONZE SLASH & VENOM ORBS BARRAGE ---
addCue({ actor: 'medusa', action: 'bronze-slash', t0: t_barrage, t1: t_barrage + 1.8, params: { x: [1320, 1220], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'snake-strike', t0: t_barrage + 1.8, t1: t_rev, params: { x: [1220, 1280], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'hurt', t0: t_barrage + 1.1, t1: t_rev, params: { x: [1080, 620], y: [1120, 1120], stone: 0, ease: 'outCubic' } });

addFx({ type: 'glint', t0: t_barrage + 0.15, actor: 'medusa', at: 'hand', color: '#ffd87a', r: 105, dur: 0.5 });
addFx({ type: 'slash', t0: t_barrage + 0.9, x: 1180, y: 690, x2: 760, y2: 780, r: 260, fly: 0.34, color: '#f0c24b', hit: true });
addFx({ type: 'slash', t0: t_barrage + 1.35, x: 1160, y: 740, x2: 700, y2: 840, r: 240, fly: 0.32, color: '#ffe588', flipV: true, hit: true });
addFx({ type: 'orbs', t0: t_barrage + 2.0, x: 1200, y: 640, x2: 660, y2: 780, n: 6, stagger: 0.11, fly: 0.52, arc: 240, r: 24, color: '#38ff88' });
addFx({ type: 'impact', t0: t_barrage + 1.25, x: 760, y: 780, dur: 0.7 });
addFx({ type: 'sparks', t0: t_barrage + 1.25, x: 760, y: 780, dur: 1.0, n: 26, color: '#ff3b4d' });
addShake(t_barrage + 1.25, 0.55, 18);
addFlash(t_barrage + 1.25, 0.12, 0.7, '#ffd87a');

addShot({ t: t_barrage, type: 'cu', actor: 'medusa', fill: 0.58, push: 1.14, pan: [-20, 12], dutch: -6 });
addShot({ t: t_barrage + 1.3, type: 'versus', a: 'scp096', b: 'medusa', cy: 820, zoom: 1.05, push: 1.12, pan: [-42, 10], tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_barrage + 2.85, type: 'ecu', actor: 'medusa', at: 'snake', zoom: 2.9, push: 1.16, pan: [-18, 0], dutch: 5 });

// --- BEAT 2: UNSTOPPABLE BONE & REVERSAL (096 yanks Medusa down!) ---
addCue({ actor: 'scp096', action: 'roar', t0: t_rev, t1: t_rev + 2.1, params: { x: [620, 620], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'claw-slash', t0: t_rev + 2.1, t1: t_slam, params: { x: [620, 960], y: [1120, 1120], arc: 220 } });
addCue({ actor: 'medusa', action: 'wing-dodge', t0: t_rev, t1: t_slam - 0.1, params: { x: [1280, 1160], y: [1120, 1120] } });

addFx({ type: 'pillar', t0: t_rev + 0.15, x: 620, y: 1120, w: 170, color: '#ff2438', dur: 0.9 });
addFx({ type: 'dust', t0: t_rev + 0.2, x: 620, y: 1100, dur: 1.4, n: 20, spread: 280 });
addFx({ type: 'soil', t0: t_rev + 0.3, x: 240, y: 1060, dur: 1.4, n: 20 });
addShake(t_rev + 0.2, 0.7, 20);

addShot({ t: t_rev, type: 'low', actor: 'scp096', zoom: 1.38, ground: 0.86, push: 1.16, pan: [22, -26], dutch: -7, hand: 7 });
addShot({ t: t_rev + 1.65, type: 'wide', cx: 820, cy: 860, zoom: 0.76, push: 1.1, pan: [30, -18] });
addShot({ t: t_rev + 3.1, type: 'follow', actor: 'scp096', dx: 110, dy: -320, zoom: 1.25, push: 1.14, pan: [64, -36], dutch: 10, hand: 7, tr: { type: 'whip', dur: 0.22, dir: 1 } });

// Slam Medusa into the marble floor!
addCue({ actor: 'scp096', action: 'grab-crush', t0: t_slam, t1: t_climax, params: { x: [960, 960], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'pinned', t0: t_slam, t1: t_climax, params: { x: [1160, 1140], y: [1120, 1120], wingDmg: 0.75, ichor: 0.9 } });

addFx({ type: 'impact', t0: t_slam + 0.45, x: 1100, y: 1060, dur: 1.0 });
addFx({ type: 'dust', t0: t_slam + 0.45, x: 1100, y: 1100, dur: 1.6, n: 24, spread: 340 });
addFx({ type: 'soil', t0: t_slam + 0.45, x: 1100, y: 1040, dur: 1.4, n: 26 });
addFx({ type: 'sparks', t0: t_slam + 0.45, x: 1100, y: 1020, dur: 1.1, n: 24, color: '#f0c24b' });
addShake(t_slam + 0.45, 0.8, 26);
addFlash(t_slam + 0.45, 0.16, 0.85, '#ffffff');

addShot({ t: t_slam, type: 'high', cx: 1080, cy: 940, zoom: 0.96, ground: 0.66, push: 1.14, pan: [12, 24], dutch: -8, hand: 7 });
addShot({ t: t_slam + 1.85, type: 'cu', actor: 'medusa', fill: 0.6, push: 1.14, pan: [-12, 16], dutch: 8, hand: 5 });

// Pinned beat: golden wings broken, 096 towers over her
addShot({ t: t_pinned, type: 'low', actor: 'scp096', zoom: 1.48, ground: 0.88, push: 1.16, pan: [22, -16], dutch: -8, hand: 7 });
addShot({ t: t_pinned + 1.85, type: 'ecu', actor: 'scp096', at: 'claw', zoom: 2.8, push: 1.18, pan: [24, 14], hand: 7 });

// --- BEAT 3: POINT-BLANK PETRIFICATION (A4 CLIMAX: beam-clash + slow-mo + crash-zoom) ---
addCue({ actor: 'medusa', action: 'gaze-overdrive', t0: t_climax, t1: t_after - 0.1, params: { x: [1140, 1140], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'roar', t0: t_climax, t1: t_petrify, params: { x: [940, 900], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_petrify, t1: t_petrify + 2.8, params: { x: [900, 760], y: [1120, 1120], stone0: 0.15, stone1: 1.0 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_petrify + 2.8, t1: t_cliff, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 0 } });

addFx({ type: 'glint', t0: t_climax + 0.25, actor: 'medusa', at: 'eye', color: '#4cff88', r: 145, dur: 0.9 });
addFx({ type: 'pillar', t0: t_climax + 0.6, x: 1140, y: 1120, w: 190, color: '#4cff88', dur: 1.2 });
addFx({ type: 'beam-clash', t0: t_climax + 1.8, dur: 4.5, x: 900, y: 650, x2: 1120, y2: 740, colorL: '#ff2438', colorR: '#4cff88', w: 96, amp: 0.12, freq: 5.5, win: 'R', winAt: t_petrify + 0.35 });
addFx({ type: 'pillar', t0: t_petrify + 0.6, x: 780, y: 1120, w: 220, color: '#4cff88', dur: 1.4 });
addFx({ type: 'impact', t0: t_petrify + 0.6, x: 780, y: 740, dur: 1.2 });
addFx({ type: 'dust', t0: t_petrify + 0.7, x: 780, y: 1080, dur: 1.8, n: 28, spread: 340 });
addShake(t_petrify + 0.55, 1.1, 28);
addFlash(t_petrify + 0.55, 0.22, 0.95, '#7affad');

addShot({ t: t_climax, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.6, push: 1.22, pan: [-8, 0], hand: 5 });
addShot({ t: t_climax + 1.85, type: 'versus', a: 'scp096', b: 'medusa', cy: 840, zoom: 1.25, push: 1.12, pan: [0, -10], dutch: 6, hand: 7 });
addShot({ t: t_climax + 3.85, type: 'cu', actor: 'medusa', fill: 0.62, push: 1.16, pan: [-14, -8], dutch: -5, hand: 6 });
// FINISHING BLOW: slow-mo + crash-zoom!
addShot({ t: t_petrify, type: 'versus', a: 'scp096', b: 'medusa', cy: 820, zoom: 1.18, push: 1.15, pan: [-42, 0], slow: 0.38, crash: { at: t_petrify + 0.55, dur: 0.55, k: 1.55 }, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_petrify + 2.15, type: 'cu', actor: 'scp096', fill: 0.6, push: 1.18, pan: [12, -14], slow: 0.45, dutch: -5 });
addShot({ t: t_petrify + 4.15, type: 'wide', cx: 920, cy: 860, zoom: 0.76, push: 1.06, pan: [-16, 0] });

// --- AFTERMATH (t_after..t_cliff) ---
addCue({ actor: 'medusa', action: 'breathe-after', t0: t_after, t1: t_after + 4.2, params: { x: [1140, 1180], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'talk', t0: t_after + 4.2, t1: t_cliff - 1.2, params: { voice: 'medusa', x: [1180, 1180], y: [1120, 1120], wingDmg: 0.75, ichor: 0.85 } });
addCue({ actor: 'medusa', action: 'walk-away', t0: t_cliff - 1.2, t1: D, params: { x: [1180, 1680], y: [1120, 1120], flip: 1 } });

addShot({ t: t_after, type: 'low', actor: 'medusa', zoom: 1.38, ground: 0.86, push: 1.08, pan: [-18, -10] });
addShot({ t: t_after + 2.6, type: 'cu', actor: 'medusa', fill: 0.56, push: 1.08, pan: [-14, -4] });
addShot({ t: t_after + 5.1, type: 'versus', a: 'scp096', b: 'medusa', cy: 860, zoom: 0.96, push: 1.06, pan: [18, 0] });
addShot({ t: t_cliff - 1.5, type: 'wide', cx: 960, cy: 860, zoom: 0.78, push: 1.05, pan: [-24, 0] });

// --- 3-BEAT CLIFFHANGER (C2: STONE CRACKS, WHITE INDESTRUCTIBLE SKULL REVEALED!) ---
addCue({ actor: 'scp096', action: 'petrified', t0: t_cliff, t1: t_whisp - 0.8, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 0.45 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_whisp - 0.8, t1: D, params: { x: [760, 760], y: [1120, 1120], stone: 1.0, crack: 1.0 } });

addFx({ type: 'soil', t0: t_cliff + 0.5, x: 775, y: 635, dur: 1.1, n: 12 });
addFx({ type: 'soil', t0: t_whisp - 0.55, x: 775, y: 635, dur: 1.3, n: 22 });
addFx({ type: 'glint', t0: t_whisp - 0.45, actor: 'scp096', at: 'mouth', color: '#ff2438', r: 125, dur: 1.8 });
addFx({ type: 'smoke', t0: t_whisp - 0.5, x: 775, y: 645, dur: 2.5, n: 10, dark: true });
addShake(t_whisp - 0.55, 0.5, 16);
addFlash(t_whisp - 0.55, 0.12, 0.55, '#ff2438');

addShot({ t: t_cliff, type: 'insert', cx: 775, cy: 625, zoom: 2.15, push: 1.16, pan: [0, -8], hand: 3 });
addShot({ t: t_cliff + 2.4, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.1, push: 1.18, pan: [6, 4], hand: 5 });
addShot({ t: t_whisp - 0.5, type: 'ecu', actor: 'scp096', at: 'head', zoom: 2.85, push: 1.16, pan: [0, -6], dutch: -5, hand: 7 });
addShot({ t: t_whisp + 1.9, type: 'wide', cx: 780, cy: 820, zoom: 0.92, push: 1.1, pan: [0, -18], hand: 4 });

tl.text.push({
  t0: t_whisp + 1.6,
  t1: D,
  text: 'CAN STONE REALLY\nHOLD IT?',
  x: 540,
  y: 410,
  size: 76,
  color: '#ff4a5a',
  anim: 'blink',
  shadow: '#000',
});

// Ensure shots are sorted by time and check spacing
tl.shots.sort((a, b) => a.t - b.t);

// Split any long story shots (> 2.55 s) automatically so pacing stays crisp & hits 50-60 shots
const finalShots = [];
for (let i = 0; i < tl.shots.length; i++) {
  const s = tl.shots[i];
  const nextT = i + 1 < tl.shots.length ? tl.shots[i + 1].t : D;
  finalShots.push(s);
  const len = nextT - s.t;
  if (len > 2.55 && s.t >= t_story && s.t < D - 1.2) {
    const mid = +(s.t + len * 0.52).toFixed(2);
    finalShots.push({
      t: mid,
      type: s.type === 'wide' ? 'cu' : 'wide',
      actor: s.type === 'wide' ? (mid > t_after ? 'medusa' : 'scp096') : undefined,
      cx: s.type === 'wide' ? undefined : 880,
      cy: s.type === 'wide' ? undefined : 860,
      zoom: s.type === 'wide' ? undefined : 0.82,
      fill: s.type === 'wide' ? 0.56 : undefined,
      push: 1.1,
      pan: [s.type === 'wide' ? 14 : -18, -8],
    });
  }
}
tl.shots = finalShots.sort((a, b) => a.t - b.t);

const outPath = path.join(__dirname, 'timeline.json');
fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log(`Wrote ${outPath} | duration=${D.toFixed(2)}s | shots=${tl.shots.length} | fx=${tl.fx.length} | cues=${tl.cues.length}`);
