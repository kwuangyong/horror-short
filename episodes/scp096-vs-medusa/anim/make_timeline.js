#!/usr/bin/env node
// Episode #007 v3: SCP-096 vs MEDUSA (Direct-to-Story · Forbidden Aegean Island · Canon Rigs · Dodge Choreography · Living Stone Juggernaut Cliffhanger)
// Matches 18-section sections.json (83.40s) & 56-shot script-anim.md. Pure cinematic cold-open from t=0.0s (NO Split-Roll wheel).
const fs = require('fs');
const path = require('path');

const EP = path.resolve(__dirname, '..');
const AU = path.join(EP, 'audio-anim');
const S = JSON.parse(fs.readFileSync(path.join(AU, 'sections.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(path.join(AU, 'words.json'), 'utf8'));

const sec = (name) => S.sections.find((x) => x.name === name);
const wordsIn = (t0, t1, spk) =>
  W.filter((w) => w.start >= t0 - 0.15 && w.end <= t1 + 0.15 && (!spk || w.speaker === spk))
    .map((w) => [w.start, w.end]);

const D = S.duration;
const t_cold = sec('cold_open').start;          // 0.00
const t_photo = sec('soldier_photo').start;     // 5.10
const t_mrev = sec('medusa_reveal').start;      // 10.13
const t_mline = sec('medusa_line').start;       // 14.28
const t_breach = sec('wall_breach').start;      // 17.77
const t_eyelock = sec('eye_lock').start;        // 24.49
const t_charge1 = sec('charge1').start;         // 29.37
const t_dodge1 = sec('dodge1').start;           // 34.45
const t_duck = sec('duck_venom').start;         // 39.89
const t_dive = sec('dive_grab').start;          // 45.69
const t_slam = sec('slam').start;               // 51.28
const t_climax = sec('climax').start;           // 55.33
const t_tstone = sec('turn_stone').start;       // 60.58
const t_petrify = sec('petrify').start;         // 62.21
const t_after = sec('aftermath').start;         // 67.90
const t_mend = sec('medusa_end').start;         // 71.97
const t_cliff = sec('cliffhanger').start;       // 75.24
const t_whisp = sec('whisper').start;           // 80.28

const voices = {
  scp096: { words: wordsIn(0, D, 'scp096') },
  medusa: { words: wordsIn(0, D, 'medusa') },
};

const tl = {
  fps: 24,
  duration: D,
  camInit: { cx: 560, cy: 860, zoom: 0.78 },
  sides: { left: 'scp096', right: 'medusa' },
  splits: [],
  voices,
  domains: {
    'aegean-temple': {
      sky: ['#050c18', '#0d2038', '#1a3552'],
      glow: '#6cd4ff',
      floor: ['#263038', '#111820'],
      motif: 'columns',
      rock: '#2b3640',
      sigil: null,
      motes: '#78e8b0',
      mist: '#244b66',
      horizon: 960,
    },
  },
  actors: {
    soldier: {
      kind: 'soldier',
      x: 180,
      y: 1120,
      scale: 1.0,
      flip: 1,
      z: 26,
      rim: '#7ad4ff',
      rimPx: 5,
    },
    scp096: {
      kind: 'scp096',
      x: -260,
      y: 1120,
      scale: 1.05,
      flip: 1,
      z: 32,
      rim: '#ff4252',
      rimPx: 7,
      aura: { colors: ['#9c0c18', '#ff2438', '#ffd6d6'], r: 235, h: 245, motes: true, on: 0.75 },
      vis: [[t_breach + 1.0, D + 1]],
    },
    medusa: {
      kind: 'medusa',
      x: 1520,
      y: 1120,
      scale: 1.05,
      flip: -1,
      z: 34,
      rim: '#4cff88',
      rimPx: 7,
      aura: { colors: ['#145c38', '#38e878', '#f5d25a'], r: 245, h: 255, motes: true, on: 0.85 },
      vis: [[t_mrev - 0.1, D + 1]],
    },
  },
  props: [
    // Rising fractured Greek marble columns/spires during duck_venom leap-pounce
    { type: 'monolith', x: 520, y: 1130, scale: 0.92, h: 460, w: 128, tilt: -8, color: '#ff2438', rock: '#303c46', track: 'rise', scene: 'domain-aegean-temple', z: 14, seed: 4 },
    { type: 'spire', x: 760, y: 1125, scale: 0.86, h: 410, w: 112, tilt: 10, color: '#4cff88', rock: '#28343e', track: 'rise', scene: 'domain-aegean-temple', z: 16, seed: 9 },
  ],
  tracks: {
    rise: [
      { t0: 0, t1: t_duck + 2.8, v: 0 },
      { t0: t_duck + 2.9, t1: t_duck + 4.1, v: 1, ease: 'outCubic' },
    ],
  },
  cues: [],
  shots: [],
  fx: [],
  shake: [],
  flash: [],
  text: [],
  cinema: [[0.0, t_after + 1.5]],
  embers: [
    [0.0, t_after, '#66ffaa'],
    [t_breach + 1.1, t_petrify + 1.5, '#ff3344'],
    [t_cliff + 1.5, D, '#ff2438'],
  ],
  glitch: [],
};

const addShot = (s) => tl.shots.push(s);
const addCue = (c) => tl.cues.push(c);
const addFx = (f) => tl.fx.push(f);
const addShake = (t0, dur, amp) => tl.shake.push({ t0, dur, amp });
const addFlash = (t0, dur, amp, color) => tl.flash.push({ t0, dur, amp, color });

// =========================================================================
// ACT 1 · THE FORBIDDEN AEGEAN ISLAND (0.00..17.77s — Pure Cold Open!)
// =========================================================================

// --- cold_open (0.00..5.10) & soldier_photo (5.10..10.13) ---
// Articulated soldier runs in from left (180 -> 840), stumbles & look-back clutching 4-pixel photo
addCue({ actor: 'soldier', action: 'run', t0: t_cold, t1: t_photo + 2.8, params: { x: [180, 840], y: [1120, 1120], speed: 2.9, ease: 'outCubic' } });
addCue({ actor: 'soldier', action: 'look-back', t0: t_photo + 2.8, t1: t_mline + 1.55, params: { x: [840, 840], y: [1120, 1120], speed: 2.0 } });
addFx({ type: 'glint', t0: t_photo + 1.75, actor: 'soldier', at: 'photo', color: '#ff2438', r: 95, dur: 0.9 });
addFx({ type: 'dust', t0: 0.5, x: 340, y: 1105, dur: 1.3, n: 12, spread: 180 });
addFx({ type: 'dust', t0: 4.8, x: 760, y: 1105, dur: 1.2, n: 12, spread: 160 });

// Shots #1-#3 (cold_open: 0.00..5.10)
addShot({ t: 0.00, type: 'high', cx: 560, cy: 860, zoom: 0.78, ground: 0.64, push: 1.12, pan: [64, 18], scene: 'domain-aegean-temple' });
addShot({ t: 1.75, type: 'follow', actor: 'soldier', dx: 60, dy: -220, zoom: 1.18, push: 1.14, pan: [44, -8], hand: 5 });
addShot({ t: 3.45, type: 'low', actor: 'soldier', zoom: 1.32, ground: 0.86, push: 1.12, pan: [32, -12], dutch: -4, hand: 5 });

// Shots #4-#6 (soldier_photo: 5.10..10.13)
addShot({ t: t_photo, type: 'follow', actor: 'soldier', dx: 36, dy: -210, zoom: 1.35, push: 1.14, pan: [22, -6], dutch: -4, hand: 6 });
addShot({ t: t_photo + 1.55, type: 'ecu', actor: 'soldier', at: 'photo', zoom: 3.8, push: 1.18, pan: [-6, -4], dutch: -5, hand: 5 });
addShot({ t: t_photo + 3.25, type: 'cu', actor: 'soldier', fill: 0.56, push: 1.14, pan: [14, -6], dutch: -5, hand: 5 });

// --- medusa_reveal (10.13..14.28) ---
// Medusa glides out from between tall Greek columns (1520 -> 1340)
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_mrev - 0.1, t1: t_mline, params: { x: [1520, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addFx({ type: 'glint', t0: t_mrev + 2.95, actor: 'medusa', at: 'eye', color: '#4cff88', r: 120, dur: 0.75 });
addFx({ type: 'sparks', t0: t_mrev + 0.4, x: 1440, y: 780, dur: 1.3, n: 18, color: '#f0c24b' });

// Minimal title flash: "MEDUSA"
tl.text.push({
  t0: t_mrev + 0.5,
  t1: t_mrev + 2.1,
  text: 'MEDUSA',
  x: 540,
  y: 340,
  size: 74,
  color: '#4cff88',
  anim: 'pop',
  shadow: '#000',
});

// Shots #7-#9 (medusa_reveal: 10.13..14.28)
addShot({ t: t_mrev, type: 'low', actor: 'medusa', zoom: 1.32, ground: 0.88, push: 1.12, pan: [-28, -10] });
addShot({ t: t_mrev + 1.55, type: 'cu', actor: 'medusa', fill: 0.54, dy: -35, push: 1.14, pan: [-14, -6], dutch: -4 });
addShot({ t: t_mrev + 2.85, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.4, push: 1.18, pan: [-8, -2] });

// --- medusa_line (14.28..17.77) ---
// Medusa speaks "Another trespasser for my island." then petrifies the fleeing soldier!
addCue({ actor: 'medusa', action: 'talk', t0: t_mline, t1: t_mline + 1.3, params: { voice: 'medusa', x: [1340, 1340], y: [1120, 1120], wingDmg: 0, ichor: 0 } });
addCue({ actor: 'medusa', action: 'gaze-blast', t0: t_mline + 1.3, t1: t_breach + 0.1, params: { x: [1340, 1340], y: [1120, 1120] } });
addCue({ actor: 'soldier', action: 'petrify', t0: t_mline + 1.55, t1: t_mline + 2.55, params: { x: [840, 840], y: [1120, 1120], stone0: 0, stone1: 1 } });
addCue({ actor: 'soldier', action: 'statue', t0: t_mline + 2.55, t1: D + 0.5, params: { x: [840, 840], y: [1120, 1120] } });

addFx({ type: 'beam', t0: t_mline + 1.4, x: 1310, y: 675, x2: 840, y2: 815, w: 68, color: '#4cff88', charge: 0.18, grow: 0.1, hit: true, r: 150 });
addFx({ type: 'impact', t0: t_mline + 1.72, x: 840, y: 815, dur: 0.8 });
addFx({ type: 'sparks', t0: t_mline + 1.72, x: 840, y: 815, dur: 0.9, n: 22, color: '#4cff88' });
addFx({ type: 'dust', t0: t_mline + 1.75, x: 840, y: 1090, dur: 1.2, n: 18, spread: 210 });
addShake(t_mline + 1.7, 0.55, 16);
addFlash(t_mline + 1.7, 0.14, 0.75, '#4cff88');

// Shots #10-#12 (medusa_line: 14.28..17.77)
addShot({ t: t_mline, type: 'cu', actor: 'medusa', fill: 0.58, push: 1.14, pan: [-12, -4], dutch: 4 });
addShot({ t: t_mline + 1.42, type: 'versus', a: 'soldier', b: 'medusa', cy: 860, zoom: 1.04, push: 1.12, pan: [-28, -4], tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_mline + 2.37, type: 'cu', actor: 'soldier', fill: 0.58, push: 1.16, pan: [8, -6], slow: 0.55, dutch: -5, hand: 4 });

// =========================================================================
// ACT 2 · ACROSS THE SEA & FATAL EYE-LOCK (17.77..29.37s)
// =========================================================================

// --- wall_breach (17.77..24.49) ---
// Acoustic shriek rattles columns -> SCP-096 smashes through temple gate in a manic sprint!
addCue({ actor: 'medusa', action: 'glide-watch', t0: t_breach, t1: t_eyelock + 2.4, params: { x: [1340, 1340], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'charge', t0: t_breach + 1.0, t1: t_eyelock, params: { x: [-260, 480], y: [1120, 1120], speed: 4.6, ease: 'outCubic', stone: 0, crack: 0 } });

addFx({ type: 'ripple', t0: t_breach + 0.18, x: 260, y: 760, dur: 1.25, r: 540, color: '#ff2438' });
addFx({ type: 'impact', t0: t_breach + 1.35, x: 240, y: 880, dur: 0.9 });
addFx({ type: 'dust', t0: t_breach + 1.35, x: 260, y: 1080, dur: 1.5, n: 22, spread: 280 });
addFx({ type: 'soil', t0: t_breach + 1.35, x: 260, y: 1010, dur: 1.35, n: 26 });
addFx({ type: 'speed', t0: t_breach + 1.45, x: 340, y: 840, dur: 1.2, n: 28 });
addShake(t_breach + 0.2, 0.55, 14);
addShake(t_breach + 1.35, 0.75, 24);
addFlash(t_breach + 1.35, 0.14, 0.75, '#ff3344');

// Minimal title flash: "SCP-096"
tl.text.push({
  t0: t_breach + 1.5,
  t1: t_breach + 3.1,
  text: 'SCP-096',
  x: 540,
  y: 340,
  size: 74,
  color: '#ff3b4d',
  anim: 'pop',
  shadow: '#000',
});

// Shots #13-#16 (wall_breach: 17.77..24.49)
addShot({ t: t_breach, type: 'wide', cx: 860, cy: 860, zoom: 0.76, push: 1.1, pan: [-32, -8], hand: 5 });
addShot({ t: t_breach + 1.45, type: 'follow', actor: 'scp096', dx: 85, dy: -260, zoom: 1.18, push: 1.16, pan: [56, -12], dutch: 8, hand: 7, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_breach + 3.25, type: 'low', actor: 'scp096', zoom: 1.38, ground: 0.86, push: 1.14, pan: [34, -10], dutch: 6, hand: 6 });
addShot({ t: t_breach + 5.00, type: 'cu', actor: 'medusa', fill: 0.56, push: 1.12, pan: [-16, -4], dutch: -4 });

// --- eye_lock (24.49..29.37) ---
// 096 skids to a halt beside the statue -> eye-line lock with Medusa -> jaw unhinges!
addCue({ actor: 'scp096', action: 'idle', t0: t_eyelock, t1: t_eyelock + 3.55, params: { x: [480, 520], y: [1120, 1120], stone: 0, crack: 0 } });
addCue({ actor: 'scp096', action: 'trigger-unhinge', t0: t_eyelock + 3.55, t1: t_charge1 + 0.45, params: { x: [520, 520], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'gaze-charge', t0: t_eyelock + 2.4, t1: t_charge1 + 4.4, params: { x: [1340, 1340], y: [1120, 1120] } });

addFx({ type: 'glint', t0: t_eyelock + 2.55, actor: 'medusa', at: 'eye', color: '#4cff88', r: 120, dur: 0.75 });
addFx({ type: 'ripple', t0: t_eyelock + 3.7, x: 530, y: 610, dur: 1.25, r: 540, color: '#ff2438' });
addShake(t_eyelock + 3.7, 0.6, 18);

// Shots #17-#20 (eye_lock: 24.49..29.37)
addShot({ t: t_eyelock, type: 'cu', actor: 'scp096', fill: 0.56, push: 1.14, pan: [22, -6], dutch: 6, hand: 5 });
addShot({ t: t_eyelock + 1.25, type: 'wide', cx: 920, cy: 860, zoom: 0.74, push: 1.08, pan: [14, -8] });
addShot({ t: t_eyelock + 2.46, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.45, push: 1.18, pan: [-10, -2] });
addShot({ t: t_eyelock + 3.66, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 3.15, push: 1.2, pan: [8, 8], dutch: -7, hand: 8, tr: { type: 'whip', dur: 0.2, dir: -1 } });

// =========================================================================
// ACT 3 · HIGH-SPEED EVASION & CLASH (29.37..67.90s)
// =========================================================================

// --- BEAT 1: charge1 (29.37..34.45) & dodge1 (34.45..39.89) ---
addCue({ actor: 'scp096', action: 'charge', t0: t_charge1 + 0.45, t1: t_dodge1, params: { x: [520, 960], y: [1120, 1120], speed: 4.8 } });
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_dodge1, t1: t_dodge1 + 1.5, params: { x: [960, 1080], y: [1120, 1120], stone0: 0.35, stone1: 0.1 } });
addCue({ actor: 'scp096', action: 'claw-slash', t0: t_dodge1 + 1.5, t1: t_dodge1 + 3.35, params: { x: [1080, 1140], y: [1120, 1120], stone: 0 } });
addCue({ actor: 'scp096', action: 'leap-pounce', t0: t_dodge1 + 3.35, t1: t_duck + 1.0, params: { x: [1140, 960], y: [1120, 1120] } });

addCue({ actor: 'medusa', action: 'gaze-blast', t0: t_charge1 + 4.4, t1: t_dodge1 + 1.65, params: { x: [1340, 1340], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'backflip-evade', t0: t_dodge1 + 1.65, t1: t_dodge1 + 3.6, params: { x: [1340, 1440], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'aerial-weave', t0: t_dodge1 + 3.6, t1: t_duck, params: { x: [1440, 1320], y: [1120, 1120] } });

addFx({ type: 'speed', t0: t_charge1 + 1.1, x: 640, y: 840, dur: 1.3, n: 28 });
addFx({ type: 'dust', t0: t_charge1 + 1.1, x: 560, y: 1090, dur: 1.1, n: 18, spread: 250 });
addFx({ type: 'beam', t0: t_dodge1 + 0.12, x: 1310, y: 670, x2: 960, y2: 710, w: 74, color: '#4cff88', charge: 0.2, grow: 0.12, hit: true, r: 165 });
addFx({ type: 'sparks', t0: t_dodge1 + 0.45, x: 960, y: 710, dur: 0.9, n: 24, color: '#4cff88' });
addFx({ type: 'sparks', t0: t_dodge1 + 1.75, x: 1340, y: 720, dur: 1.0, n: 22, color: '#f0c24b' });
addFx({ type: 'dust', t0: t_dodge1 + 3.45, x: 1120, y: 1085, dur: 1.1, n: 18, spread: 240 });
addShake(t_dodge1 + 0.4, 0.5, 17);
addFlash(t_dodge1 + 0.4, 0.12, 0.65, '#4cff88');

// Shots #21-#23 (charge1: 29.37..34.45)
addShot({ t: t_charge1, type: 'wide', cx: 920, cy: 860, zoom: 0.76, push: 1.1, pan: [18, -10] });
addShot({ t: t_charge1 + 1.65, type: 'follow', actor: 'scp096', dx: 90, dy: -260, zoom: 1.24, push: 1.16, pan: [56, -12], dutch: 8, hand: 7, tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_charge1 + 3.40, type: 'ecu', actor: 'scp096', at: 'claw', zoom: 2.35, push: 1.18, pan: [18, -8], dutch: 6, hand: 7 });

// Shots #24-#27 (dodge1: 34.45..39.89 — NEAR-MISS DODGE slow: 0.4 + crash!)
addShot({ t: t_dodge1, type: 'versus', a: 'scp096', b: 'medusa', cy: 840, zoom: 1.04, push: 1.12, pan: [-34, -4], tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_dodge1 + 1.65, type: 'cu', actor: 'medusa', fill: 0.52, dy: -40, push: 1.16, pan: [26, -34], slow: 0.4, crash: { at: t_dodge1 + 2.0, dur: 0.4, k: 1.32 }, dutch: -8, hand: 6 });
addShot({ t: t_dodge1 + 3.30, type: 'high', cx: 1240, cy: 760, zoom: 0.94, ground: 0.66, push: 1.14, pan: [-28, -22], tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_dodge1 + 4.40, type: 'low', actor: 'scp096', zoom: 1.34, ground: 0.86, push: 1.14, pan: [32, -26], dutch: 6, hand: 6 });

// --- BEAT 2: duck_venom (39.89..45.69) & dive_grab (45.69..51.28) ---
addCue({ actor: 'medusa', action: 'snake-strike', t0: t_duck, t1: t_duck + 3.3, params: { x: [1320, 1340], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'aerial-weave', t0: t_duck + 3.3, t1: t_dive, params: { x: [1340, 1300], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'duck-dodge', t0: t_duck + 1.0, t1: t_duck + 3.4, params: { x: [960, 700], y: [1120, 1120], stone: 0 } });
addCue({ actor: 'scp096', action: 'leap-pounce', t0: t_duck + 3.4, t1: t_dive + 1.2, params: { x: [700, 900], y: [1120, 1120] } });

addFx({ type: 'orbs', t0: t_duck + 0.9, x: 1240, y: 620, x2: 740, y2: 810, n: 6, stagger: 0.1, fly: 0.46, arc: 220, r: 24, color: '#38ff88' });
addFx({ type: 'impact', t0: t_duck + 1.45, x: 740, y: 810, dur: 0.7 });
addFx({ type: 'sparks', t0: t_duck + 1.45, x: 740, y: 810, dur: 0.9, n: 24, color: '#38ff88' });
addFx({ type: 'soil', t0: t_duck + 3.0, x: 640, y: 1050, dur: 1.3, n: 20 });
addFx({ type: 'dust', t0: t_duck + 3.45, x: 720, y: 1090, dur: 1.1, n: 18, spread: 220 });
addShake(t_duck + 1.45, 0.45, 14);
addShake(t_duck + 3.05, 0.5, 16);

// Shots #28-#31 (duck_venom: 39.89..45.69)
addShot({ t: t_duck, type: 'ecu', actor: 'medusa', at: 'snake', zoom: 2.95, push: 1.18, pan: [-16, 4], dutch: -6 });
addShot({ t: t_duck + 1.45, type: 'follow', actor: 'scp096', dx: -30, dy: -190, zoom: 1.24, push: 1.14, pan: [-46, 16], dutch: 7, hand: 7, tr: { type: 'whip', dur: 0.2, dir: -1 } });
addShot({ t: t_duck + 3.10, type: 'low', actor: 'scp096', zoom: 1.32, ground: 0.86, push: 1.16, pan: [38, -28], dutch: -6, hand: 6 });
addShot({ t: t_duck + 4.45, type: 'follow', actor: 'scp096', dx: 90, dy: -340, zoom: 1.2, push: 1.14, pan: [54, -32], dutch: 9, hand: 7 });

// dive_grab (45.69..51.28): Medusa's bronze-slash dive -> 096 absorbs hit & catches her mid-air!
addCue({ actor: 'medusa', action: 'bronze-slash', t0: t_dive, t1: t_dive + 3.25, params: { x: [1300, 1140], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'wing-dodge', t0: t_dive + 3.25, t1: t_slam, params: { x: [1140, 1160], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'hurt', t0: t_dive + 1.2, t1: t_dive + 2.7, params: { x: [900, 820], y: [1120, 1120], stone: 0 } });
addCue({ actor: 'scp096', action: 'claw-slash', t0: t_dive + 2.7, t1: t_dive + 4.0, params: { x: [820, 980], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'grab-crush', t0: t_dive + 4.0, t1: t_slam, params: { x: [980, 1000], y: [1120, 1120] } });

addFx({ type: 'glint', t0: t_dive + 0.5, actor: 'medusa', at: 'hand', color: '#ffd87a', r: 110, dur: 0.55 });
addFx({ type: 'slash', t0: t_dive + 1.35, x: 1160, y: 690, x2: 840, y2: 780, r: 260, fly: 0.34, color: '#f0c24b', hit: true });
addFx({ type: 'slash', t0: t_dive + 1.75, x: 1140, y: 740, x2: 800, y2: 830, r: 240, fly: 0.32, color: '#ffe588', flipV: true, hit: true });
addFx({ type: 'impact', t0: t_dive + 1.7, x: 840, y: 780, dur: 0.7 });
addFx({ type: 'sparks', t0: t_dive + 1.7, x: 840, y: 780, dur: 1.0, n: 26, color: '#ff3b4d' });
addFx({ type: 'impact', t0: t_dive + 4.2, x: 1080, y: 740, dur: 0.65 });
addShake(t_dive + 1.7, 0.55, 18);
addFlash(t_dive + 1.7, 0.12, 0.7, '#ffd87a');

// Shots #32-#35 (dive_grab: 45.69..51.28)
addShot({ t: t_dive, type: 'follow', actor: 'medusa', dx: -70, dy: -310, zoom: 1.22, push: 1.14, pan: [-42, 24], dutch: 6, tr: { type: 'whip', dur: 0.2, dir: 1 } });
addShot({ t: t_dive + 1.40, type: 'versus', a: 'scp096', b: 'medusa', cy: 810, zoom: 1.08, push: 1.14, pan: [-32, 10], hand: 7 });
addShot({ t: t_dive + 2.85, type: 'cu', actor: 'scp096', fill: 0.58, push: 1.16, pan: [18, -8], dutch: -6, hand: 7 });
addShot({ t: t_dive + 4.20, type: 'ecu', actor: 'scp096', at: 'claw', zoom: 2.35, push: 1.18, pan: [22, -12], dutch: 8, hand: 8 });

// --- slam (51.28..55.33) ---
// 096 yanks Medusa out of the sky and slams her into the marble floor (pinned, wingDmg: 0.75, ichor: 0.9)
addCue({ actor: 'scp096', action: 'grab-crush', t0: t_slam, t1: t_climax, params: { x: [1000, 960], y: [1120, 1120] } });
addCue({ actor: 'medusa', action: 'pinned', t0: t_slam, t1: t_climax + 2.45, params: { x: [1160, 1140], y: [1120, 1120], wingDmg: 0.75, ichor: 0.9 } });

addFx({ type: 'impact', t0: t_slam + 0.45, x: 1100, y: 1060, dur: 1.0 });
addFx({ type: 'dust', t0: t_slam + 0.45, x: 1100, y: 1100, dur: 1.6, n: 24, spread: 340 });
addFx({ type: 'soil', t0: t_slam + 0.45, x: 1100, y: 1040, dur: 1.4, n: 26 });
addFx({ type: 'sparks', t0: t_slam + 0.45, x: 1100, y: 1020, dur: 1.1, n: 24, color: '#f0c24b' });
addShake(t_slam + 0.45, 0.8, 26);
addFlash(t_slam + 0.45, 0.16, 0.85, '#ffffff');

// Shots #36-#38 (slam: 51.28..55.33)
addShot({ t: t_slam, type: 'wide', cx: 1050, cy: 860, zoom: 0.86, push: 1.14, pan: [12, 22], dutch: -7, hand: 8 });
addShot({ t: t_slam + 1.45, type: 'cu', actor: 'medusa', fill: 0.6, push: 1.14, pan: [-10, 14], dutch: 8, hand: 6 });
addShot({ t: t_slam + 2.80, type: 'low', actor: 'scp096', zoom: 1.44, ground: 0.88, push: 1.16, pan: [20, -14], dutch: -7, hand: 7 });

// --- BEAT 3: POINT-BLANK PETRIFICATION (climax 55.33..60.58, turn_stone 60.58..62.21, petrify 62.21..67.90) ---
addCue({ actor: 'scp096', action: 'roar', t0: t_climax, t1: t_petrify, params: { x: [960, 920], y: [1120, 1120] } });
addCue({ actor: 'scp096', action: 'petrify-resist', t0: t_petrify, t1: t_petrify + 3.0, params: { x: [920, 720], y: [1120, 1120], stone0: 0.15, stone1: 1.0 } });
addCue({ actor: 'scp096', action: 'petrified', t0: t_petrify + 3.0, t1: t_cliff, params: { x: [720, 720], y: [1120, 1120], stone: 1.0, crack: 0 } });

addCue({ actor: 'medusa', action: 'gaze-overdrive', t0: t_climax + 2.45, t1: t_petrify + 4.3, params: { x: [1140, 1140], y: [1120, 1120], wingDmg: 0.75, ichor: 0.9 } });
addCue({ actor: 'medusa', action: 'breathe-after', t0: t_petrify + 4.3, t1: t_mend, params: { x: [1140, 1280], y: [1120, 1120], wingDmg: 0.75, ichor: 0.85 } });

addFx({ type: 'glint', t0: t_climax + 3.35, actor: 'medusa', at: 'eye', color: '#4cff88', r: 150, dur: 0.95 });
addFx({ type: 'pillar', t0: t_climax + 3.6, x: 1140, y: 1120, w: 195, color: '#4cff88', dur: 0.85 });
addFx({ type: 'beam-clash', t0: t_tstone + 0.08, dur: 3.65, x: 900, y: 650, x2: 1120, y2: 740, colorL: '#ff2438', colorR: '#4cff88', w: 96, amp: 0.12, freq: 5.5, win: 'R', winAt: t_petrify + 0.35 });
addFx({ type: 'sparks', t0: t_tstone + 0.25, x: 1010, y: 690, dur: 2.6, n: 26, color: '#7affad' });
addFx({ type: 'pillar', t0: t_petrify + 0.55, x: 750, y: 1120, w: 225, color: '#4cff88', dur: 1.35 });
addFx({ type: 'impact', t0: t_petrify + 0.55, x: 750, y: 740, dur: 1.2 });
addFx({ type: 'dust', t0: t_petrify + 0.65, x: 750, y: 1080, dur: 1.8, n: 28, spread: 340 });
addShake(t_tstone + 0.15, 1.8, 16);
addShake(t_petrify + 0.55, 1.1, 28);
addFlash(t_petrify + 0.55, 0.22, 0.95, '#7affad');

// Shots #39-#41 (climax: 55.33..60.58)
addShot({ t: t_climax, type: 'low', actor: 'scp096', zoom: 1.48, ground: 0.88, push: 1.16, pan: [22, -16], dutch: -8, hand: 7 });
addShot({ t: t_climax + 1.70, type: 'ecu', actor: 'scp096', at: 'claw', zoom: 2.35, push: 1.18, pan: [-10, -14], dutch: 6, hand: 7 });
addShot({ t: t_climax + 3.30, type: 'ecu', actor: 'medusa', at: 'eye', zoom: 3.6, push: 1.22, pan: [-8, 0], hand: 5 });

// Shot #42 (turn_stone: 60.58..62.21)
addShot({ t: t_tstone, type: 'versus', a: 'scp096', b: 'medusa', cy: 830, zoom: 1.24, push: 1.14, pan: [0, -10], dutch: 6, hand: 7 });

// Shots #43-#46 (petrify: 62.21..67.90 — FINISHING BLOW slow: 0.35 + crash!)
addShot({ t: t_petrify, type: 'versus', a: 'scp096', b: 'medusa', cy: 820, zoom: 1.18, push: 1.15, pan: [-42, 0], slow: 0.35, crash: { at: t_petrify + 0.55, dur: 0.55, k: 1.55 }, tr: { type: 'whip', dur: 0.22, dir: -1 } });
addShot({ t: t_petrify + 1.85, type: 'cu', actor: 'scp096', fill: 0.6, push: 1.18, pan: [12, -14], slow: 0.45, dutch: -5 });
addShot({ t: t_petrify + 3.20, type: 'ecu', actor: 'scp096', at: 'mouth', zoom: 2.9, push: 1.16, pan: [6, -6], slow: 0.55 });
addShot({ t: t_petrify + 4.45, type: 'wide', cx: 920, cy: 860, zoom: 0.78, push: 1.06, pan: [-16, 0] });

// =========================================================================
// ACT 4 · AFTERMATH & LIVING STONE JUGGERNAUT CLIFFHANGER (67.90..83.40s)
// =========================================================================

// --- aftermath (67.90..71.97) & medusa_end (71.97..75.24) ---
addCue({ actor: 'medusa', action: 'talk', t0: t_mend, t1: t_mend + 1.98, params: { voice: 'medusa', x: [1280, 1280], y: [1120, 1120], wingDmg: 0.75, ichor: 0.85 } });
addCue({ actor: 'medusa', action: 'walk-away', t0: t_mend + 1.98, t1: D + 0.5, params: { x: [1280, 1760], y: [1120, 1120], flip: 1 } });

// Shots #47-#49 (aftermath: 67.90..71.97)
addShot({ t: t_after, type: 'low', actor: 'medusa', zoom: 1.38, ground: 0.86, push: 1.08, pan: [-14, -10] });
addShot({ t: t_after + 1.40, type: 'cu', actor: 'medusa', fill: 0.56, push: 1.08, pan: [-6, -4] });
addShot({ t: t_after + 2.75, type: 'versus', a: 'scp096', b: 'medusa', cy: 860, zoom: 0.92, push: 1.06, pan: [18, 0] });

// Shots #50-#51 (medusa_end: 71.97..75.24)
addShot({ t: t_mend, type: 'cu', actor: 'medusa', fill: 0.56, push: 1.08, pan: [6, -4] });
addShot({ t: t_mend + 1.75, type: 'wide', cx: 1020, cy: 860, zoom: 0.78, push: 1.06, pan: [32, 0] });

// --- cliffhanger (75.24..80.28) & whisper (80.28..83.40) ---
// NEW LIVING STONE JUGGERNAUT CLIFFHANGER:
// Stone SCP-096's granite eyes ignite blazing crimson, then it marches relentlessly after Medusa!
addCue({ actor: 'scp096', action: 'stone-march', t0: t_cliff, t1: t_cliff + 1.7, params: { x: [720, 720], y: [1120, 1120], stone: 1.0, rage: 1.45, crack: 0.2, speed: 0.01 } });
addCue({ actor: 'scp096', action: 'stone-march', t0: t_cliff + 1.7, t1: D + 0.5, params: { x: [720, 1080], y: [1120, 1120], stone: 1.0, rage: 1.45, crack: 0.3, speed: 1.15 } });

addFx({ type: 'glint', t0: t_cliff + 0.35, actor: 'scp096', at: 'eye', color: '#ff2438', r: 135, dur: 1.4 });
addFx({ type: 'dust', t0: t_cliff + 1.75, x: 740, y: 1105, dur: 1.3, n: 18, spread: 220 });
addFx({ type: 'soil', t0: t_cliff + 1.75, x: 740, y: 1080, dur: 1.1, n: 16 });
addFx({ type: 'dust', t0: t_cliff + 3.25, x: 860, y: 1105, dur: 1.3, n: 18, spread: 220 });
addFx({ type: 'glint', t0: t_whisp + 0.2, actor: 'scp096', at: 'eye', color: '#ff2438', r: 130, dur: 1.8 });
addShake(t_cliff + 0.35, 0.35, 10);
addShake(t_cliff + 1.75, 0.5, 18);
addShake(t_cliff + 3.25, 0.45, 16);
addFlash(t_cliff + 0.35, 0.1, 0.45, '#ff2438');

// Shots #52-#54 (cliffhanger: 75.24..80.28)
addShot({ t: t_cliff, type: 'ecu', actor: 'scp096', at: 'eye', zoom: 3.35, push: 1.2, pan: [6, -4], hand: 4 });
addShot({ t: t_cliff + 1.70, type: 'low', actor: 'scp096', zoom: 1.38, ground: 0.88, push: 1.16, pan: [32, -12], dutch: -6, hand: 6 });
addShot({ t: t_cliff + 3.35, type: 'follow', actor: 'scp096', dx: 90, dy: -260, zoom: 1.18, push: 1.14, pan: [44, -8], dutch: 5, hand: 6 });

// Shots #55-#56 (whisper: 80.28..83.40)
addShot({ t: t_whisp, type: 'ecu', actor: 'scp096', at: 'head', zoom: 2.75, push: 1.16, pan: [8, -4], dutch: -5, hand: 6 });
addShot({ t: t_whisp + 1.42, type: 'wide', cx: 1180, cy: 850, zoom: 0.82, push: 1.1, pan: [38, -10], hand: 4 });

// Cliffhanger CTA
tl.text.push({
  t0: t_whisp + 1.1,
  t1: D,
  text: 'CAN MEDUSA OUTRUN\nSTONE SCP-096?',
  x: 540,
  y: 410,
  size: 74,
  color: '#ff4a5a',
  anim: 'blink',
  shadow: '#000',
});

tl.shots.sort((a, b) => a.t - b.t);

const outPath = path.join(__dirname, 'timeline.json');
fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log(`Wrote ${outPath} | duration=${D.toFixed(2)}s | shots=${tl.shots.length} | fx=${tl.fx.length} | cues=${tl.cues.length}`);
