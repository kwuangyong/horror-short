#!/usr/bin/env node
// make_rigs_sheet.js — generates a 6-frame pose & FX showcase timeline for SCP-682 & Pegasus
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'rigs_sheet_tl.json');

const tl = {
  fps: 30,
  duration: 6.2,
  domains: {
    lab: {
      sky: ['#0D1118', '#1A2029'],
      glow: '#FF1E2D',
      floor: ['#1B2028', '#0A0D12'],
      motif: 'lab',
      motes: '#7CFF3B',
      horizon: 960,
    },
    'forest-storm': {
      sky: ['#091120', '#1A2B40'],
      glow: '#4F88B8',
      floor: ['#0F1926', '#060A10'],
      motif: 'forest',
      motes: '#63F2FF',
      horizon: 960,
    },
  },
  scenes: [
    { t0: 0, s: 'domain-lab' },
    { t0: 1.0, s: 'domain-forest-storm' },
  ],
  shots: [
    { t: 0.0, type: 'wide', cx: 540, cy: 960, zoom: 1.05 },
    { t: 1.0, type: 'wide', cx: 540, cy: 960, zoom: 1.05 },
    { t: 2.0, type: 'wide', cx: 540, cy: 920, zoom: 0.92 },
    { t: 3.0, type: 'wide', cx: 540, cy: 920, zoom: 1.05 },
    { t: 4.0, type: 'wide', cx: 540, cy: 940, zoom: 1.05 },
    { t: 5.0, type: 'wide', cx: 540, cy: 900, zoom: 0.98 },
  ],
  actors: {
    scp682: {
      kind: 'scp682',
      x: 500,
      y: 1220,
      scale: 1.2,
      flip: 1,
      vis: [[0, 3.0]],
      rim: '#FF3B1F',
      rimPx: 5,
      aura: { colors: ['#8F0E16', '#5CE62E', '#D9FF3F'], r: 220, h: 200, on: 0 },
    },
    pegasus: {
      kind: 'pegasus',
      x: 560,
      y: 1220,
      scale: 1.2,
      flip: -1,
      vis: [[3.0, 6.2]],
      rim: '#FFD859',
      rimPx: 6,
      aura: { colors: ['#B366FF', '#4CE8FF', '#FFB830', '#FFF6C2'], r: 260, h: 260, on: 0 },
    },
  },
  cues: [
    // Frame 1 (t=0.5): Base SCP-682 in containment lab
    { actor: 'scp682', t0: 0.0, t1: 1.0, action: 'roar', params: { x: [500, 500], y: [1220, 1220], scale: [1.22, 1.22], aura: [0.35, 0.35] } },
    // Frame 2 (t=1.5): Hurt + Regen + Spikes
    { actor: 'scp682', t0: 1.0, t1: 2.0, action: 'regen', params: { x: [480, 480], y: [1220, 1220], scale: [1.22, 1.22], pose: { damage: 0.72, regen: 1.0, spikes: 0.9 }, aura: [0.85, 0.85] } },
    // Frame 3 (t=2.5): Armored + Winged Aerial Horror
    { actor: 'scp682', t0: 2.0, t1: 3.0, action: 'fly-hover', params: { x: [540, 540], y: [1220, 1220], scale: [1.05, 1.05], pose: { armor: 1.0, wings: 1.0, wingAng: 26 }, aura: [0.95, 0.95] } },
    // Frame 4 (t=3.5): Pegasus Hover with multi-color aura
    { actor: 'pegasus', t0: 3.0, t1: 4.0, action: 'hover', params: { x: [560, 560], y: [1220, 1220], scale: [1.22, 1.22], aura: [1.1, 1.1] } },
    // Frame 5 (t=4.5): Pegasus Dive-Kick meteor strike
    { actor: 'pegasus', t0: 4.0, t1: 5.0, action: 'dive-kick', params: { x: [560, 560], y: [1180, 1180], scale: [1.22, 1.22], pose: { diveFlame: 1.0 }, aura: [1.25, 1.25] } },
    // Frame 6 (t=5.5): Pegasus Summon-Thunder
    { actor: 'pegasus', t0: 5.0, t1: 6.2, action: 'summon-thunder', params: { x: [630, 630], y: [1200, 1200], scale: [1.18, 1.18], pose: { stormCharge: 1.0 }, aura: [1.35, 1.35] } },
  ],
  fx: [
    // Frame 2: Bone-spike + acid-glob volley launching skyward
    { type: 'spikes', t0: 1.1, dur: 0.9, x: 520, y: 920, x2: 960, y2: 460, n: 7, stagger: 0.06, fly: 0.55, arc: 150, color: '#F7F3E3', color2: '#5CE62E' },
    // Frame 6: Zeus's forked sky-thunderbolt striking down
    { type: 'lightning', t0: 5.25, dur: 0.65, x: 340, y: 120, x2: 260, y2: 1240, color: '#FFD94A', color2: '#38C6FF', w: 26, branches: 5 },
  ],
  text: [
    { t0: 0.0, t1: 0.99, x: 540, y: 180, text: 'SCP-682 BASE (LAB)', size: 46, color: '#E8E2D0' },
    { t0: 1.0, t1: 1.99, x: 540, y: 180, text: 'SCP-682 HURT + REGEN + SPIKES', size: 42, color: '#D9FF3F' },
    { t0: 2.0, t1: 2.99, x: 540, y: 180, text: 'SCP-682 ARMORED + WINGED', size: 44, color: '#FF4D4D' },
    { t0: 3.0, t1: 3.99, x: 540, y: 180, text: 'PEGASUS HOVER + AURA', size: 46, color: '#4CE8FF' },
    { t0: 4.0, t1: 4.99, x: 540, y: 180, text: 'PEGASUS DIVE-KICK', size: 46, color: '#FFB830' },
    { t0: 5.0, t1: 6.1, x: 540, y: 180, text: 'PEGASUS SUMMON-THUNDER', size: 44, color: '#FFD94A' },
  ],
};

fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log('Wrote', outPath);
