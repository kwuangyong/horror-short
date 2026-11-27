#!/usr/bin/env node
// make_zeus_sheet.js — generates a 4-pose showcase timeline for the Zeus God-King rig
// Poses: descend, aegis-block, master-bolt-charge, master-bolt-fire
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'zeus_sheet_tl.json');

const tl = {
  fps: 30,
  duration: 4.2,
  domains: {
    'olympus-storm': {
      sky: ['#091024', '#1A2D54'],
      glow: '#FFD859',
      floor: ['#141D36', '#070A16'],
      motif: 'forest',
      motes: '#4CE8FF',
      horizon: 1020,
    },
  },
  scenes: [
    { t0: 0, s: 'domain-olympus-storm' },
  ],
  shots: [
    { t: 0.0, type: 'wide', cx: 540, cy: 880, zoom: 1.0 },
    { t: 1.0, type: 'wide', cx: 540, cy: 960, zoom: 1.06 },
    { t: 2.0, type: 'wide', cx: 540, cy: 920, zoom: 0.96 },
    { t: 3.0, type: 'wide', cx: 540, cy: 940, zoom: 0.98 },
  ],
  actors: {
    zeus: {
      kind: 'zeus',
      x: 540,
      y: 1260,
      scale: 1.15,
      flip: 1,
      vis: [[0, 4.2]],
      rim: '#FFD859',
      rimPx: 5,
      aura: { colors: ['#B366FF', '#4CE8FF', '#FFD859', '#FFFCE0'], r: 270, h: 310, on: 0 },
    },
  },
  cues: [
    // Frame 1 (t=0.5): descend
    { actor: 'zeus', t0: 0.0, t1: 1.0, action: 'descend', params: { x: [540, 540], y: [1260, 1260], scale: [1.12, 1.12], aura: [0.75, 0.75] } },
    // Frame 2 (t=1.5): aegis-block
    { actor: 'zeus', t0: 1.0, t1: 2.0, action: 'aegis-block', params: { x: [500, 500], y: [1280, 1280], scale: [1.18, 1.18], aura: [0.85, 0.85] } },
    // Frame 3 (t=2.5): master-bolt-charge
    { actor: 'zeus', t0: 2.0, t1: 3.0, action: 'master-bolt-charge', params: { x: [540, 540], y: [1280, 1280], scale: [1.12, 1.12], aura: [1.2, 1.2] } },
    // Frame 4 (t=3.5): master-bolt-fire
    { actor: 'zeus', t0: 3.0, t1: 4.2, action: 'master-bolt-fire', params: { x: [470, 470], y: [1280, 1280], scale: [1.14, 1.14], aura: [1.35, 1.35] } },
  ],
  fx: [
    { type: 'lightning', t0: 2.1, dur: 0.9, x: 650, y: 40, x2: 665, y2: 340, color: '#FFD859', color2: '#4CE8FF', w: 22, branches: 5 },
  ],
  text: [
    { t0: 0.0, t1: 0.99, x: 540, y: 180, text: 'ZEUS · DESCEND', size: 50, color: '#FFD859' },
    { t0: 1.0, t1: 1.99, x: 540, y: 180, text: 'ZEUS · AEGIS-BLOCK', size: 50, color: '#4CE8FF' },
    { t0: 2.0, t1: 2.99, x: 540, y: 180, text: 'ZEUS · MASTER-BOLT-CHARGE', size: 44, color: '#FFF4B8' },
    { t0: 3.0, t1: 4.19, x: 540, y: 180, text: 'ZEUS · MASTER-BOLT-FIRE', size: 46, color: '#FFD859' },
  ],
};

fs.writeFileSync(outPath, JSON.stringify(tl, null, 2));
console.log('Wrote', outPath);
