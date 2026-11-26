#!/usr/bin/env node
// make_timeline.js - Episode #004 TYPHON vs CTHULHU (v3: 0-11s Story Hook + Fishing Trawler Fleet + Titan Rigs + 30 FPS + 100+ FX)
// Reads audio-anim/sections.json & words.json -> anim/timeline.json
const fs = require('fs');
const path = require('path');
const kit = require('../../../tools/anim/episode_kit');

const HERE = __dirname;
const AU = path.join(HERE, '..', 'audio-anim');
const S = JSON.parse(fs.readFileSync(path.join(AU, 'sections.json'), 'utf8'));
const W = JSON.parse(fs.readFileSync(path.join(AU, 'words.json'), 'utf8'));
const D = +(S.duration + 0.4).toFixed(2);

const sent = (pref) => {
  const f = S.sentences.find((x) => x.text.startsWith(pref));
  if (!f) throw new Error('Sentence not found: ' + pref);
  return f;
};
const sec = (name) => S.sections.find((x) => x.name === name);
const wordIntervals = (t0, t1, spk) =>
  W.filter((w) => w.start >= t0 - 0.1 && w.end <= t1 + 0.2 && (!spk || w.speaker === spk)).map((w) => [w.start, w.end]);

const MX = 200, GX = 1320, GY = 1135; // Typhon LEFT, Cthulhu RIGHT (strict 180-degree rule)

// Detailed fishing trawler + fishermen crew builder (used for main trawler + background fleet trawler)
function trawlerShapes(txTrack, withCrew = true, withSpotlight = true) {
  const s = [];
  // Sweeping spotlight cone cutting over the dark night sea
  if (withSpotlight) {
    s.push({ k: 'poly', pts: [[-150, -108], [-440, -18], [-440, 48], [-150, -88]], fill: '#ffe9a8', op: 0.2, flick: 0.25, txTrack });
  }
  // Stern crane boom & suspended fishing net over the water
  s.push(
    { k: 'poly', pts: [[98, -56], [108, -56], [134, -186], [122, -186]], fill: '#3a4854', txTrack },
    { k: 'poly', pts: [[126, -182], [188, -142], [182, -134], [122, -172]], fill: '#4b5b6a', txTrack },
    // hanging net pouch
    { k: 'poly', pts: [[176, -140], [198, -136], [218, -32], [156, -24]], fill: '#1a2c32', op: 0.85, stroke: '#6c888c', sw: 2.5, txTrack },
    // Mast + radar crossbar + warm mast beacon
    { k: 'poly', pts: [[-56, -150], [-48, -150], [-48, -248], [-56, -248]], fill: '#4a5a68', txTrack },
    { k: 'poly', pts: [[-82, -220], [-20, -220], [-20, -214], [-82, -214]], fill: '#5b6c7a', txTrack },
    { k: 'glow', cx: -52, cy: -248, r: 26, color: '#ffcf66', flick: 0.4, txTrack },
    { k: 'ell', cx: -52, cy: -248, rx: 5, ry: 5, fill: '#fff4c8', txTrack },
    // Wheelhouse cabin + glowing warm amber windows + smokestack
    { k: 'poly', pts: [[6, -138], [26, -138], [22, -190], [8, -190]], fill: '#2a343e', txTrack },
    { k: 'poly', pts: [[-116, -54], [-110, -150], [28, -150], [34, -54]], fill: '#24323e', stroke: '#3c4e5e', sw: 3, txTrack },
    { k: 'poly', pts: [[-122, -156], [36, -156], [32, -144], [-118, -144]], fill: '#384a58', txTrack },
    { k: 'poly', pts: [[-98, -134], [-64, -134], [-64, -104], [-98, -104]], fill: '#ffd066', op: 0.92, flick: 0.15, txTrack },
    { k: 'poly', pts: [[-54, -134], [-20, -134], [-20, -104], [-54, -104]], fill: '#ffd066', op: 0.92, flick: 0.15, txTrack },
    { k: 'poly', pts: [[-10, -134], [18, -134], [18, -104], [-10, -104]], fill: '#ffbe4a', op: 0.85, flick: 0.2, txTrack },
    { k: 'glow', cx: -46, cy: -118, r: 78, color: '#ffbe4a', op: 0.42, flick: 0.2, txTrack },
    // Deck rail
    { k: 'poly', pts: [[-186, -68], [164, -68], [164, -62], [-186, -62]], fill: '#5d6e7c', txTrack },
  );
  // 3 fishermen working on deck (yellow & navy oilskin slickers + sailor hats + deck lantern)
  if (withCrew) {
    const crew = [
      { x: 64, coat: '#d69e24', hat: '#e8b638', lean: 6 },
      { x: 112, coat: '#244668', hat: '#d69e24', lean: 10 },
      { x: -146, coat: '#c88c1e', hat: '#d69e24', lean: -6 },
    ];
    for (const c of crew) {
      s.push(
        { k: 'poly', pts: [[c.x - 14, -52], [c.x + 14, -52], [c.x + 10 + c.lean * 0.3, -102], [c.x - 10 + c.lean * 0.3, -102]], fill: c.coat, txTrack },
        { k: 'ell', cx: c.x + c.lean * 0.4, cy: -112, rx: 9, ry: 10, fill: '#d6aa8a', txTrack },
        { k: 'poly', pts: [[c.x - 16 + c.lean * 0.4, -118], [c.x + 16 + c.lean * 0.4, -118], [c.x + 8 + c.lean * 0.4, -128], [c.x - 10 + c.lean * 0.4, -128]], fill: c.hat, txTrack },
      );
    }
    // Bright deck work lantern glow near stern net
    s.push({ k: 'glow', cx: 88, cy: -102, r: 52, color: '#ffe08a', op: 0.55, flick: 0.3, txTrack });
  }
  // Heavy iron/wood trawler hull (upper navy-steel + red-oxide waterline + shadow keel)
  s.push(
    { k: 'poly', pts: [[-206, -64], [174, -54], [156, 2], [-172, 2]], fill: '#263440', stroke: '#3c4d5c', sw: 2.5, txTrack },
    { k: 'poly', pts: [[-182, -16], [162, -14], [148, 22], [-156, 22]], fill: '#6c241e', txTrack },
    { k: 'poly', pts: [[-196, -54], [168, -46], [166, -38], [-192, -46]], fill: '#583c28', txTrack }, // timber bumper trim
    // Red port bow beacon
    { k: 'glow', cx: -186, cy: -66, r: 22, color: '#ff3a28', op: 0.85, txTrack },
    { k: 'ell', cx: -186, cy: -66, rx: 4.5, ry: 4.5, fill: '#ff8878', txTrack },
  );
  return s;
}

const tl = {
  fps: 30,
  duration: D,
  sides: { left: 'typhon', right: 'cthulhu' },
  camInit: { cx: 1280, cy: 880, zoom: 0.72 },
  domains: {
    etna: {
      sky: ['#140507', '#4a140c'],
      glow: '#ff521b',
      floor: ['#260a08', '#0d0404'],
      motif: 'spires',
      rock: '#180a0c',
      sigil: '#ff6a22',
      motes: '#ffae38',
      mist: '#3e120a',
      horizon: 900,
    },
    rlyeh: {
      sky: ['#030b0e', '#0c2c26'],
      glow: '#26d98c',
      floor: ['#071e1a', '#02090a'],
      motif: 'monoliths',
      rock: '#0a201c',
      sigil: '#38ff9a',
      motes: '#6cffb8',
      mist: '#0b2b24',
      horizon: 900,
    },
    'ocean-storm': {
      sky: ['#03060c', '#0b1928'],
      glow: '#1a3c4e',
      floor: ['#071824', '#02070d'],
      motif: 'none',
      rock: '#0a1620',
      sigil: null,
      motes: '#74c8e8',
      mist: '#0d2230',
      horizon: 910,
    },
  },
  actors: {
    typhon: {
      kind: 'typhon', x: MX, y: GY, scale: 1.26, flip: 1, z: 20,
      aura: { colors: ['#ff3b14', '#ff9428', '#ffe066'], r: 300, h: 260, motes: true, on: 0.95 },
      rim: '#ff6a22', rimPx: 8,
    },
    cthulhu: {
      kind: 'cthulhu', x: GX, y: GY, scale: 1.24, flip: -1, z: 22,
      aura: { colors: ['#128858', '#38ff9a', '#b8ffdd'], r: 300, h: 260, motes: true, on: 0.95 },
      rim: '#38ff9a', rimPx: 8,
    },
    sailor: {
      kind: 'fisherman', x: 1475, y: 1068, scale: 0.34, flip: -1, z: 30,
    },
  },
  voices: {
    typhon: { words: wordIntervals(0, D, 'typhon') },
    cthulhu: { words: wordIntervals(0, D, 'cthulhu') },
    sailor: { words: wordIntervals(0, D, 'fisherman') },
  },
  tracks: {
    volcRise: [{ t0: 0, t1: 0.01, v: 0 }],
    rlyehRise: [{ t0: 0, t1: 0.01, v: 0 }],
    coilsRise: [{ t0: 0, t1: 0.01, v: 0 }],
    etnaCoils: [{ t0: 0, t1: 0.01, v: 0 }],
    hookEyes: [{ t0: 0, t1: 0.01, v: 0 }],
    starAlign: [{ t0: 0, t1: 0.01, v: 0 }],
    boatX: [{ t0: 0, t1: 0.01, v: 0 }],
    mistSea: [{ t0: 0, t1: 0.01, v: 0 }],
    underEye: [{ t0: 0, t1: 0.01, v: 0 }],
  },
  props: [
    // Typhon colossal lava serpent coils in his Etna intro domain
    {
      type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 4, scene: 'domain-etna', track: 'etnaCoils',
      body: '#18101a', body2: '#3c1c1e', sheen: '#8a321a', vein: '#ff6a22', sand: '#260a08', haze: '#4a140c', sp: 1.2,
      arcs: [
        { x0: -420, x1: 240, y: 1090, h: 520, w: 185, d: 0.45, ph: 0.4 },
        { x0: 780, x1: 1460, y: 1100, h: 540, w: 195, d: 0.4, ph: 2.3, delay: 0.12 },
      ],
    },
    // Typhon volcanic serpent coils erupting from the stormy ocean to constrict Cthulhu
    {
      type: 'serpent-coils', x: 0, y: 0, scale: 1, z: 24, scene: 'domain-ocean-storm', track: 'coilsRise',
      body: '#16111c', body2: '#381e22', sheen: '#84341c', vein: '#ff6a22', sand: '#091b28', haze: '#162838', sp: 1.35,
      arcs: [
        { x0: 360, x1: 960, y: 1120, h: 480, w: 175, d: 0.35, ph: 0.5 },
        { x0: 840, x1: 1420, y: 1140, h: 590, w: 210, d: 0.18, ph: 2.1, delay: 0.1 },
        { x0: 1040, x1: 1620, y: 1170, h: 510, w: 195, d: 0.08, ph: 3.9, delay: 0.2 },
      ],
    },
    // Rocky coastal crag far right on ocean-storm
    {
      type: 'shape', x: 1960, y: 1165, scale: 1.05, z: 12, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'poly', pts: [[-280, 0], [-190, -195], [-60, -260], [130, -310], [340, -230], [380, 45], [-300, 45]], fill: '#0e1822' },
        { k: 'poly', pts: [[-190, -195], [-60, -260], [20, -170], [-105, -118]], fill: '#192938' },
      ],
    },
    // SECOND BACKGROUND FISHING TRAWLER (fleet depth!)
    {
      type: 'shape', x: 980, y: 1052, scale: 0.68, z: 14, scene: 'domain-ocean-storm',
      shapes: trawlerShapes('boatX', true, true),
    },
    // MAIN FOREGROUND FISHING TRAWLER WITH CABIN, CRANE NET, SPOTLIGHT & 3 FISHERMEN ON DECK
    {
      type: 'shape', x: 1420, y: 1132, scale: 1.26, z: 26, scene: 'domain-ocean-storm',
      shapes: trawlerShapes('boatX', true, true),
    },
    // Stormy ocean swell waves overlapping trawler waterline
    {
      type: 'shape', x: 800, y: 1148, scale: 1.0, z: 31, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'poly', pts: [[-1600, 0], [-1100, -22], [-600, 8], [-120, -24], [380, 10], [820, -20], [1320, 8], [1800, -18], [2200, 6], [2200, 140], [-1600, 140]], fill: '#061522', op: 0.88 },
        { k: 'poly', pts: [[-1400, 26], [-840, 2], [-320, 28], [200, -4], [720, 24], [1220, 0], [1740, 26], [2200, 6], [2200, 160], [-1400, 160]], fill: '#040e18', op: 0.92 },
      ],
    },
    // Story Hook abyssal awakening: 6 colossal emerald eyes flaring deep BENEATH the trawler hull!
    {
      type: 'shape', x: 1360, y: 1230, scale: 1.15, z: 33, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'glow', cx: 0, cy: 0, r: 240, color: '#14b872', op: 0.7, track: 'hookEyes' },
        { k: 'glow', cx: -48, cy: -6, r: 46, color: '#38ff9a', track: 'hookEyes' },
        { k: 'glow', cx: 48, cy: -6, r: 46, color: '#38ff9a', track: 'hookEyes' },
        { k: 'ell', cx: -48, cy: -6, rx: 22, ry: 9, fill: '#d8ffec', track: 'hookEyes' },
        { k: 'ell', cx: 48, cy: -6, rx: 22, ry: 9, fill: '#d8ffec', track: 'hookEyes' },
        { k: 'ell', cx: -88, cy: -16, rx: 14, ry: 6, fill: '#6cffb8', track: 'hookEyes' },
        { k: 'ell', cx: 88, cy: -16, rx: 14, ry: 6, fill: '#6cffb8', track: 'hookEyes' },
        { k: 'ell', cx: -110, cy: 2, rx: 10, ry: 4.5, fill: '#38ff9a', track: 'hookEyes' },
        { k: 'ell', cx: 110, cy: 2, rx: 10, ry: 4.5, fill: '#38ff9a', track: 'hookEyes' },
      ],
    },
    // Rising volcanic basalt spires LEFT (TY4)
    { type: 'spire', x: 140, y: 1150, scale: 1.2, h: 680, w: 165, tilt: -8, color: '#ff521b', rock: '#1c0c0e', track: 'volcRise', z: 10, scene: 'domain-ocean-storm', seed: 3 },
    { type: 'spire', x: 450, y: 1160, scale: 1.0, h: 560, w: 140, tilt: 7, color: '#ff7828', rock: '#221012', track: 'volcRise', z: 11, scene: 'domain-ocean-storm', seed: 7 },
    // Rising R'lyeh non-Euclidean monoliths RIGHT (C3)
    { type: 'monolith', x: 1380, y: 1150, scale: 1.22, h: 720, w: 175, tilt: 11, color: '#38ff9a', rock: '#0b221e', track: 'rlyehRise', z: 10, scene: 'domain-ocean-storm', seed: 5 },
    { type: 'monolith', x: 1030, y: 1160, scale: 0.98, h: 560, w: 145, tilt: -10, color: '#6cffb8', rock: '#091b18', track: 'rlyehRise', z: 11, scene: 'domain-ocean-storm', seed: 9 },
    // Stars aligning in the night sky (#cliffhanger — track starts at 0!)
    {
      type: 'shape', x: 760, y: 360, scale: 1.0, z: 8, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'glow', cx: -260, cy: 0, r: 28, color: '#6cffb8', track: 'starAlign' },
        { k: 'glow', cx: -130, cy: 0, r: 34, color: '#b8ffdd', track: 'starAlign' },
        { k: 'glow', cx: 0, cy: 0, r: 44, color: '#38ff9a', track: 'starAlign' },
        { k: 'glow', cx: 130, cy: 0, r: 34, color: '#b8ffdd', track: 'starAlign' },
        { k: 'glow', cx: 260, cy: 0, r: 28, color: '#6cffb8', track: 'starAlign' },
        { k: 'ell', cx: -260, cy: 0, rx: 5, ry: 5, fill: '#eafff4', track: 'starAlign' },
        { k: 'ell', cx: -130, cy: 0, rx: 6, ry: 6, fill: '#eafff4', track: 'starAlign' },
        { k: 'ell', cx: 0, cy: 0, rx: 8, ry: 8, fill: '#ffffff', track: 'starAlign' },
        { k: 'ell', cx: 130, cy: 0, rx: 6, ry: 6, fill: '#eafff4', track: 'starAlign' },
        { k: 'ell', cx: 260, cy: 0, rx: 5, ry: 5, fill: '#eafff4', track: 'starAlign' },
      ],
    },
    // Green mist bubbling beside trawler & Cthulhu's glowing eyes under water (cliffhanger Beat 3)
    {
      type: 'shape', x: 1680, y: 1138, scale: 1.0, z: 32, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'glow', cx: -60, cy: 10, r: 155, color: '#38ff9a', track: 'mistSea' },
        { k: 'glow', cx: 55, cy: -10, r: 175, color: '#1cd87c', track: 'mistSea' },
        { k: 'glow', cx: -48, cy: 20, r: 44, color: '#38ff9a', track: 'underEye' },
        { k: 'glow', cx: 48, cy: 20, r: 44, color: '#38ff9a', track: 'underEye' },
        { k: 'ell', cx: -48, cy: 20, rx: 20, ry: 9, fill: '#d8ffec', track: 'underEye' },
        { k: 'ell', cx: 48, cy: 20, rx: 20, ry: 9, fill: '#d8ffec', track: 'underEye' },
      ],
    },
  ],
  cues: [],
  shots: [],
  fx: [],
  shake: [],
  flash: [],
  tints: [],
  slow: [],
  text: [],
  cinema: [],
  embers: [],
  glitch: [],
};

const cue = (actor, action, t0, t1, params = {}) => tl.cues.push({ actor, action, t0, t1, params });
const shot = (s) => tl.shots.push(Object.assign({ push: 1.09, pan: [22, 0] }, s));
const fx = (f) => tl.fx.push(f);
const sh = (t0, dur, amp) => tl.shake.push({ t0, dur, amp });
const fl = (t0, dur, amp, color = '#ffffff') => tl.flash.push({ t0, dur, amp: Math.min(0.75, amp), color });
const tint = (t0, t1, a, color, fadeIn = 0.25, fadeOut = 0.35) => tl.tints.push({ t0, t1, a, color, fadeIn, fadeOut });
const whip = (dir, dur = 0.18) => ({ tr: { type: 'whip', dur, dir } });

// ---- Anchors from real audio (sections.json)
const hookEnd = sec('hook').end; // ~11.43 s
const ty0 = sec('intro_typhon').start, ty1 = sec('intro_typhon').end;
const ct0 = sec('intro_cthulhu').start, ct1 = sec('intro_cthulhu').end;
const st0 = sec('story').start;

const t_boil = sent('Until the ocean').start;
const t_trem = sent('The tremors woke').start;
const t_blast = sent('Typhon blasted').start;
const t_shield = sent('Cthulhu rose').start;
const t_sailrun = sent('The sailors scrambled').start;
const t_fight = sent('Typhon beat').start;
const t_dark = sent('Cthulhu spread').start;
const t_rock = sent('Furious, Typhon').start;
const t_rlyeh = sent('Cthulhu summoned').start;
const t_roar = sent("Typhon's hundred-headed").start;
const t_crush = sent('His serpent coils').start;
const t_burn = sent('Burn in my fire').start;
const t_wave1 = sent('A flaming tidal').start;
const t_reform = sent('Yet Cthulhu was never').start;
const t_psych = sent('His psychic').start;
const t_climax = sent('Trapped, Typhon').start;
const t_drown = sent('Drown in madness').start;
const t_quench = sent("R'lyeh's stone").start;
const t_after = sent('At last, the storm').start;
const t_gohome = sent('Go home, sailors').start;
const t_safe = sent('...Are we safe').start;
const t_mid = sent('By midnight').start;
const t_stars = sent('Until the stars').start;
const t_whisp = sent('The stars are almost').start;

// ---- 1. OPENING (Story Hook 0..hookEnd -> Split-Roll -> Etna Intro -> R'lyeh Intro -> VS -> Battle)
const T = kit.opening(tl, {
  hookEnd,
  hookText: +(hookEnd - 1.05).toFixed(2),
  lockL: +(ty0 - 0.5).toFixed(2),
  monsterIntro: [+(ty0 - 0.1).toFixed(2), +(ty1 + 0.1).toFixed(2)],
  lockR: +(ty1 + 0.85).toFixed(2),
  guardianIntro: [+(ct0 - 0.1).toFixed(2), +(ct1 + 0.1).toFixed(2)],
  story: +(st0 - 0.05).toFixed(2),
  monster: {
    kind: 'typhon', label: 'TYPHON', sub: 'FATHER OF MONSTERS', title: 'GREEK FATHER OF MONSTERS',
    domain: 'etna', color: '#ff6a22', glow: '#7a1808',
    card: { fx: 0, fy: 255, fscale: 0.34, idle: 'idle-card' },
    pillar: { x: 540, y: 1130 },
  },
  guardian: {
    kind: 'cthulhu', label: 'CTHULHU', sub: "DREAMER OF R'LYEH", title: "GREAT OLD ONE OF R'LYEH",
    domain: 'rlyeh', color: '#38ff9a', glow: '#0b4d32',
    card: { fx: 0, fy: 255, fscale: 0.34, idle: 'idle-card' },
    pillar: { x: 540, y: 1130 },
  },
});

// Strict visibility windows: zero photobombing between intros & clean Story Hook reveals!
tl.actors.typhon.vis = [[t_boil - 0.05, hookEnd], [T.intro.L[0] - 0.05, T.intro.L[1] + 0.35], [T.story, t_after + 0.1]];
tl.actors.cthulhu.vis = [[t_trem + 0.55, hookEnd], [T.intro.R[0] - 0.05, T.intro.R[1] + 0.35], [T.story, D]];

// ---- 2. STORY HOOK SHOTS (0.0 - hookEnd: Midnight Fishing Fleet -> Typhon Wakes -> Cthulhu Eyes Open -> WHO SURVIVES?)
// Shots 1-2: Midnight black sea, 2 trawlers with searchlights, fishermen hauling nets
cue('sailor', 'haul', 0.0, t_boil, { x: [1475, 1475], y: [1068, 1068], scale: 0.34, flip: -1 });
cue('sailor', 'idle-scared', t_boil, hookEnd, { x: [1475, 1475], y: [1068, 1068], scale: 0.34, flip: -1 });
shot({ t: 0.0, type: 'wide', cx: 1260, cy: 890, zoom: 0.72, scene: 'domain-ocean-storm', push: 1.08, pan: [28, -10] });
shot({ t: 1.9, type: 'insert', cx: 1465, cy: 1000, zoom: 1.55, push: 1.12, pan: [24, -6] });
fx({ type: 'dust', t0: 0.2, x: 1420, y: 1135, n: 18, spread: 380, dur: 2.0 });

// Shots 3-4: Ocean boils, Typhon wakes & marches toward the shore!
cue('typhon', 'rise-from-sea', t_boil, t_boil + 1.8, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('typhon', 'roar', t_boil + 1.8, hookEnd, { x: [MX, MX], y: [GY, GY], flip: 1 });
shot({ t: t_boil, type: 'low', actor: 'typhon', zoom: 0.78, push: 1.15, pan: [0, -32] });
shot({ t: t_boil + 2.1, type: 'wide', cx: 880, cy: 830, zoom: 0.58, push: 1.12, pan: [36, -12], ...whip(1, 0.16) });
fx({ type: 'pillar', t0: t_boil, x: MX, y: GY, w: 240, color: '#ff4814', dur: 0.8 });
fx({ type: 'soil', t0: t_boil + 0.1, x: MX + 40, y: GY, n: 28 });
fx({ type: 'smoke', t0: t_boil + 0.2, x: MX, y: GY - 180, n: 18, dark: true, spread: 300 });
fx({ type: 'sparks', t0: t_boil + 0.25, x: MX + 40, y: GY - 340, n: 32, color: '#ffae38' });
fx({ type: 'glint', t0: t_boil + 1.6, actor: 'typhon', at: 'eye', color: '#ffae38', r: 140, dur: 0.55 });
sh(t_boil, 0.9, 22);

// Shot 5: Tremors wake a deeper god — 6 emerald eyes blaze BENEATH the trawler hull -> Cthulhu rises -> WHO SURVIVES?
tl.tracks.hookEyes.push({ t0: t_trem, t1: t_trem + 0.55, v: 1.0, ease: 'outCubic' }, { t0: t_trem + 1.25, t1: t_trem + 1.6, v: 0.0 });
cue('cthulhu', 'rise', t_trem + 0.6, hookEnd, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: t_trem, type: 'insert', cx: 1360, cy: 1090, zoom: 1.15, push: 1.16, pan: [0, -24] });
shot({ t: t_trem + 1.65, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.68, push: 1.15, pan: [0, -18], dutch: -3, hand: 3 });
fx({ type: 'ripple', t0: t_trem + 0.1, x: 1360, y: 1230, r: 540, color: '#38ff9a', dur: 1.1 });
fx({ type: 'pillar', t0: t_trem + 0.75, x: GX, y: GY, w: 220, color: '#26d98c', dur: 0.75 });
fx({ type: 'sparks', t0: t_trem + 0.85, x: GX, y: GY - 380, n: 30, color: '#38ff9a' });
fx({ type: 'glint', t0: t_trem + 1.75, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 145, dur: 0.6 });
fx({ type: 'beam-clash', t0: hookEnd - 1.35, dur: 1.3, x: MX + 115, y: GY - 540, x2: GX - 115, y2: GY - 530, colorL: '#ff4814', colorR: '#38ff9a', w: 84, amp: 0.1, freq: 5.5 });
sh(t_trem + 0.75, 0.7, 18);

// ---- 3. TYPHON INTRO (domain-etna)
const mi0 = T.intro.L[0], mi1 = T.intro.L[1], miMid = (mi0 + mi1) / 2;
tl.tracks.etnaCoils.push({ t0: mi0, t1: mi0 + 1.2, v: 1.0, ease: 'outCubic' }, { t0: mi1 + 0.3, t1: mi1 + 0.35, v: 0 });
cue('typhon', 'rise', mi0, mi0 + 1.35, { x: [540, 540], y: [GY, GY], flip: 1 });
cue('typhon', 'talk', mi0 + 1.35, mi1 - 1.35, { voice: 'typhon', x: [540, 540], y: [GY, GY], flip: 1 });
cue('typhon', 'roar', mi1 - 1.35, mi1 + 0.35, { x: [540, 540], y: [GY, GY], flip: 1 });
shot({ t: mi0, type: 'low', actor: 'typhon', scene: 'domain-etna', zoom: 0.82, push: 1.12, pan: [0, -32] });
shot({ t: mi0 + 1.7, type: 'cu', actor: 'typhon', fill: 0.52, dutch: 5, push: 1.12, pan: [24, 0], ...whip(-1) });
shot({ t: miMid + 0.45, type: 'ecu', actor: 'typhon', at: 'eye', zoom: 3.1, push: 1.15, pan: [16, 0] });
shot({ t: mi1 - 1.6, type: 'wide', cx: 540, cy: 760, zoom: 0.68, push: 1.12, pan: [-20, -20] });
fx({ type: 'soil', t0: mi0 + 0.1, x: 540, y: GY, n: 26 });
fx({ type: 'sparks', t0: mi0 + 0.25, x: 540, y: GY - 340, n: 28, color: '#ff8a24' });
fx({ type: 'glint', t0: miMid + 0.5, actor: 'typhon', at: 'eye', color: '#ffae38', r: 125, dur: 0.55 });
fx({ type: 'orbs', t0: mi1 - 1.5, x: 560, y: GY - 540, x2: 980, y2: 360, n: 6, color: '#ff521b', arc: 240, r: 28 });
fx({ type: 'beam', t0: mi1 - 1.25, x: 580, y: GY - 560, x2: 1120, y2: 260, w: 68, color: '#ff521b', charge: 0.25, dur: 1.0, hit: false });
sh(mi1 - 1.2, 0.7, 16);

// ---- 4. CTHULHU INTRO (domain-rlyeh)
const gi0 = T.intro.R[0], gi1 = T.intro.R[1], giMid = (gi0 + gi1) / 2;
cue('cthulhu', 'rise', gi0, gi0 + 1.35, { x: [540, 540], y: [GY, GY], flip: -1 });
cue('cthulhu', 'talk', gi0 + 1.35, gi1 - 1.3, { voice: 'cthulhu', x: [540, 540], y: [GY, GY], flip: -1 });
cue('cthulhu', 'power-up', gi1 - 1.3, gi1 + 0.35, { x: [540, 540], y: [GY, GY], flip: -1 });
shot({ t: gi0, type: 'low', actor: 'cthulhu', scene: 'domain-rlyeh', zoom: 0.82, push: 1.12, pan: [0, -32] });
shot({ t: gi0 + 1.7, type: 'cu', actor: 'cthulhu', fill: 0.52, dutch: -5, push: 1.12, pan: [-24, 0], ...whip(1) });
shot({ t: giMid + 0.4, type: 'ecu', actor: 'cthulhu', at: 'eye', zoom: 3.1, push: 1.15, pan: [-16, 0] });
shot({ t: gi1 - 1.45, type: 'wide', cx: 540, cy: 760, zoom: 0.68, push: 1.12, pan: [20, -20] });
fx({ type: 'smoke', t0: gi0 + 0.15, x: 540, y: GY - 120, n: 16, spread: 240 });
fx({ type: 'sparks', t0: gi0 + 0.3, x: 540, y: GY - 380, n: 26, color: '#38ff9a' });
fx({ type: 'glint', t0: giMid + 0.45, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 120, dur: 0.55 });
fx({ type: 'ripple', t0: gi1 - 1.35, x: 540, y: GY - 540, r: 460, color: '#38ff9a', dur: 1.1 });
fx({ type: 'orbs', t0: gi1 - 1.35, x: 520, y: GY - 540, x2: 120, y2: 360, n: 6, color: '#38ff9a', arc: 240, r: 28 });

// ---- 5. BACK TO OCEAN BATTLEFIELD: TYPHON FIRESTORM AT FLEET -> CTHULHU SHIELDS & SWEEPS TRAWLERS ASHORE -> SAILORS HIDE
cue('typhon', 'fire-breath', T.story, t_shield + 0.7, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('cthulhu', 'sink', T.story, t_shield, { x: [GX, GX], y: [GY, GY], flip: -1 });
cue('sailor', 'idle-scared', T.story, t_sailrun, { x: [1475, 1735], y: [1068, 1068], scale: 0.34, flip: -1 });

shot({ t: T.story, type: 'low', actor: 'typhon', scene: 'domain-ocean-storm', zoom: 0.8, push: 1.14, pan: [24, -18] });
shot({ t: t_blast + 1.4, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.68, push: 1.12, pan: [44, 0], ...whip(1) });
fx({ type: 'beam', t0: t_blast + 0.15, x: MX + 110, y: GY - 540, x2: GX - 70, y2: GY - 480, w: 90, color: '#ff4814', charge: 0.4, grow: 0.14, dur: 2.1 });
fx({ type: 'beam', t0: t_blast + 0.55, x: MX + 140, y: GY - 680, x2: GX - 60, y2: GY - 540, w: 44, color: '#ff9428', charge: 0.2, grow: 0.12, dur: 1.65 });
fx({ type: 'beam', t0: t_blast + 0.8, x: MX + 130, y: GY - 410, x2: GX - 50, y2: GY - 420, w: 38, color: '#ff6a22', charge: 0.18, grow: 0.12, dur: 1.45 });
fx({ type: 'impact', t0: t_blast + 1.25, x: GX - 80, y: GY - 470, r: 220 });
fx({ type: 'sparks', t0: t_blast + 1.3, x: GX - 80, y: GY - 470, n: 32, color: '#ffae38' });
fl(t_blast + 1.25, 0.18, 0.62, '#ffcf8a'); sh(t_blast + 0.5, 1.0, 20);

// Cthulhu bursts from the deep to shield the trawlers + tsunami sweeps both trawlers to rocky shore!
cue('cthulhu', 'land-hero', t_shield, t_shield + 1.25, { x: [GX, GX], y: [GY, GY], flip: -1 });
cue('cthulhu', 'wave-sweep', t_shield + 1.25, t_sailrun, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: t_shield, type: 'wide', cx: 1060, cy: 820, zoom: 0.66, push: 1.12, pan: [-24, 0] });
shot({ t: t_shield + 1.35, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.64, push: 1.1, pan: [52, 0], ...whip(1) });
fx({ type: 'pillar', t0: t_shield, x: GX, y: GY, w: 220, color: '#26d98c', dur: 0.72 });
fx({ type: 'dust', t0: t_shield + 0.15, x: GX, y: GY - 20, n: 24, spread: 340 });
fx({ type: 'impact', t0: t_shield + 0.4, x: GX - 120, y: GY - 440, r: 215 });
fx({ type: 'sparks', t0: t_shield + 0.44, x: GX - 120, y: GY - 440, n: 28, color: '#6cffb8' });
fx({ type: 'slash', t0: t_shield + 1.35, x: GX - 40, y: GY - 340, x2: 1800, y2: GY - 220, r: 270, color: '#6cffb8' });
fx({ type: 'dust', t0: t_shield + 1.6, x: 1660, y: GY - 15, n: 22, spread: 300 });
tl.tracks.boatX.push({ t0: t_shield + 1.3, t1: t_sailrun, v: 260, ease: 'outCubic' });
fl(t_shield + 0.2, 0.18, 0.65, '#b8ffdd'); sh(t_shield + 0.2, 0.55, 20);

// Sailors scramble up the rocky crag off-frame RIGHT (hidden during entire 1v1!)
const sailorGone = kit.kidFlee(tl, { actor: 'sailor', t: t_sailrun, x0: 1700, x1: 2260, y: 1060, scale: 0.68, dur: 1.3 });
kit.hideDuring(tl, 'sailor', [
  [0, hookEnd],
  [T.story, sailorGone],
  [t_wave1, t_wave1 + 1.9], // short hiding-spot insert #1 (<= 2.0 s)
  [t_after, t_mid + 1.6],   // aftermath
]);

// Establishing 1v1
cue('typhon', 'idle', t_sailrun + 1.2, t_fight, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('cthulhu', 'idle', t_sailrun + 1.2, t_fight, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: t_sailrun + 1.3, type: 'wide', cx: 760, cy: 800, zoom: 0.6, push: 1.09, pan: [0, -18] });
tl.cinema.push([t_fight, t_after]);
tl.embers.push([t_fight, t_after, '#ff6a22']);

// ---- 6. BEAT 1: FIRE-HURRICANE COMBO vs DOUBLE EMERALD CLAW SLASH
cue('typhon', 'wing-charge', t_fight, t_fight + 1.2);
cue('typhon', 'strike', t_fight + 1.2, t_fight + 2.6);
cue('cthulhu', 'claw-slash', t_fight + 2.35, t_dark);
shot({ t: t_fight, type: 'cu', actor: 'typhon', fill: 0.52, push: 1.12, pan: [22, 0] });
shot({ t: t_fight + 1.2, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.7, push: 1.12, pan: [44, 0], ...whip(1, 0.16) });
shot({ t: t_fight + 2.55, type: 'cu', actor: 'cthulhu', fill: 0.52, push: 1.12, pan: [-22, 0] });
fx({ type: 'pillar', t0: t_fight + 0.3, x: MX + 190, y: GY, w: 175, color: '#ff5a1c', dur: 0.85 });
fx({ type: 'slash', t0: t_fight + 1.15, x: MX + 130, y: GY - 460, x2: GX - 80, y2: GY - 420, r: 260, color: '#ff6a22' });
fx({ type: 'slash', t0: t_fight + 1.5, x: MX + 150, y: GY - 340, x2: GX - 60, y2: GY - 370, r: 250, color: '#ffae38', flipV: true });
fx({ type: 'impact', t0: t_fight + 1.65, x: GX - 70, y: GY - 410, r: 200 });
fx({ type: 'sparks', t0: t_fight + 1.68, x: GX - 70, y: GY - 410, n: 30, color: '#ffae38' });
fx({ type: 'smoke', t0: t_fight + 1.75, x: GX - 60, y: GY - 380, n: 14, dark: true, spread: 220 });
fx({ type: 'slash', t0: t_fight + 2.55, x: GX - 100, y: GY - 420, x2: MX + 150, y2: GY - 400, r: 255, color: '#38ff9a' });
fx({ type: 'slash', t0: t_fight + 2.9, x: GX - 90, y: GY - 340, x2: MX + 140, y2: GY - 470, r: 270, color: '#9affe0', flipV: true });
fx({ type: 'impact', t0: t_fight + 3.05, x: MX + 140, y: GY - 430, r: 215 });
fx({ type: 'sparks', t0: t_fight + 3.08, x: MX + 140, y: GY - 430, n: 32, color: '#6cffb8' });
fl(t_fight + 3.05, 0.16, 0.6, '#b8ffdd'); sh(t_fight + 1.6, 0.5, 18); sh(t_fight + 3.0, 0.55, 20);

// Cthulhu material darkness (C5) + 2 crossing waves of psychic orbs (C1)
cue('cthulhu', 'wing-surge', t_dark, t_dark + 1.35);
cue('cthulhu', 'psychic-cast', t_dark + 1.35, t_rock);
cue('typhon', 'recoil', t_dark + 2.45, t_rock);
shot({ t: t_dark, type: 'low', actor: 'cthulhu', zoom: 0.82, push: 1.14, pan: [0, -30] });
shot({ t: t_dark + 1.35, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.68, push: 1.12, pan: [-44, 0], ...whip(-1, 0.16) });
shot({ t: t_dark + 2.65, type: 'cu', actor: 'typhon', fill: 0.54, push: 1.12, pan: [20, 0] });
tint(t_dark + 0.1, t_rock - 0.1, 0.3, '#031214', 0.25, 0.35);
fx({ type: 'pillar', t0: t_dark, x: GX, y: GY, w: 240, color: '#14b872', dur: 0.85 });
fx({ type: 'ripple', t0: t_dark + 0.45, x: GX, y: GY - 510, r: 540, color: '#38ff9a', dur: 1.15 });
fx({ type: 'orbs', t0: t_dark + 1.3, x: GX - 100, y: GY - 510, x2: MX + 70, y2: GY - 440, n: 6, color: '#38ff9a', arc: 320, r: 30, stagger: 0.1, fly: 0.52 });
fx({ type: 'orbs', t0: t_dark + 1.75, x: GX - 90, y: GY - 420, x2: MX + 90, y2: GY - 510, n: 5, color: '#8effcc', arc: -290, r: 28, stagger: 0.1, fly: 0.5, seed: 7 });
fx({ type: 'impact', t0: t_dark + 2.3, x: MX + 80, y: GY - 460, r: 215 });
fx({ type: 'sparks', t0: t_dark + 2.35, x: MX + 80, y: GY - 460, n: 30, color: '#38ff9a' });
fx({ type: 'smoke', t0: t_dark + 2.4, x: MX + 80, y: GY - 430, n: 16, dark: true, spread: 260 });
sh(t_dark + 2.3, 0.65, 22);

// Typhon volcanic spires rise LEFT + lava boulder meteor rain (TY4)
tl.tracks.volcRise.push({ t0: t_rock, t1: t_rock + 1.25, v: 1.0, ease: 'outCubic' });
cue('typhon', 'throw-rock', t_rock + 1.05, t_rlyeh);
cue('cthulhu', 'stagger', t_rock + 2.1, t_rlyeh);
shot({ t: t_rock, type: 'low', actor: 'typhon', dutch: 6, zoom: 0.8, push: 1.14, pan: [0, -28] });
shot({ t: t_rock + 1.2, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.68, push: 1.12, pan: [42, 0], ...whip(1, 0.16) });
shot({ t: t_rock + 2.35, type: 'cu', actor: 'cthulhu', fill: 0.52, push: 1.12, pan: [-20, 0] });
fx({ type: 'pillar', t0: t_rock + 0.15, x: MX + 190, y: GY, w: 190, color: '#ff521b', dur: 0.72 });
fx({ type: 'soil', t0: t_rock + 0.1, x: MX + 160, y: GY, n: 32 });
fx({ type: 'dust', t0: t_rock + 0.25, x: MX + 280, y: GY, n: 24, spread: 340 });
fx({ type: 'orbs', t0: t_rock + 1.2, x: MX + 120, y: GY - 430, x2: GX - 50, y2: GY - 390, n: 6, color: '#ff4814', arc: 360, r: 42, stagger: 0.1, fly: 0.55 });
fx({ type: 'orbs', t0: t_rock + 1.65, x: MX + 110, y: GY - 540, x2: GX - 70, y2: GY - 470, n: 4, color: '#ffae38', arc: -240, r: 32, stagger: 0.09, fly: 0.5, seed: 5 });
fx({ type: 'impact', t0: t_rock + 2.0, x: GX - 50, y: GY - 400, r: 230 });
fx({ type: 'impact', t0: t_rock + 2.4, x: GX - 70, y: GY - 470, r: 210 });
fx({ type: 'sparks', t0: t_rock + 2.05, x: GX - 50, y: GY - 400, n: 34, color: '#ff9428' });
fx({ type: 'smoke', t0: t_rock + 2.1, x: GX - 40, y: GY - 380, n: 18, dark: true, spread: 280 });
fl(t_rock + 2.05, 0.18, 0.65, '#ffcf8a');
sh(t_rock, 0.75, 22); sh(t_rock + 2.0, 0.7, 24);

// ---- 7. BEAT 2: R'LYEH RISES, 100-HEADED ROAR + MID-FIGHT BEAM-CLASH #1, COIL CRUSH, MIST EXPLOSION
tl.tracks.rlyehRise.push({ t0: t_rlyeh, t1: t_rlyeh + 1.4, v: 1.0, ease: 'outCubic' });
cue('cthulhu', 'monolith-crush', t_rlyeh, t_roar);
shot({ t: t_rlyeh, type: 'low', actor: 'cthulhu', dutch: -6, zoom: 0.8, push: 1.14, pan: [0, -30] });
shot({ t: t_rlyeh + 1.9, type: 'wide', cx: 760, cy: 780, zoom: 0.58, push: 1.12, pan: [-22, 0] });
fx({ type: 'pillar', t0: t_rlyeh + 0.15, x: GX - 120, y: GY, w: 215, color: '#38ff9a', dur: 0.78 });
fx({ type: 'soil', t0: t_rlyeh + 0.1, x: GX - 140, y: GY, n: 32 });
fx({ type: 'smoke', t0: t_rlyeh + 0.25, x: GX - 120, y: GY - 60, n: 16, dark: true, spread: 320 });
fx({ type: 'impact', t0: t_rlyeh + 1.0, x: GX - 260, y: GY - 220, r: 200 });
sh(t_rlyeh, 0.9, 24);

// Typhon hundred-headed roar -> MID-FIGHT BEAM-CLASH #1 (Typhon wins mid-fight!)
cue('typhon', 'roar', t_roar, t_roar + 0.95);
cue('typhon', 'fire-breath', t_roar + 0.95, t_crush);
cue('cthulhu', 'psychic-cast', t_roar + 0.9, t_crush - 0.35);
cue('cthulhu', 'stagger', t_crush - 0.35, t_crush);
shot({ t: t_roar, type: 'ecu', actor: 'typhon', at: 'mouth', zoom: 2.9, push: 1.15, pan: [15, 0] });
shot({ t: t_roar + 0.95, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.7, push: 1.14, pan: [46, 0], dutch: 3, dutchTo: -3, hand: 4, ...whip(1, 0.16) });
fx({ type: 'ripple', t0: t_roar + 0.06, x: MX + 80, y: GY - 530, r: 620, color: '#ff9428', dur: 0.95 });
fx({ type: 'ripple', t0: t_roar + 0.32, x: MX + 80, y: GY - 530, r: 540, color: '#ff4814', dur: 0.9 });
fx({ type: 'sparks', t0: t_roar + 0.15, x: MX + 100, y: GY - 520, n: 28, color: '#ffae38' });
// MID-FIGHT BEAM-CLASH #1: winAt = 0.85 (RELATIVE seconds from t0!)
fx({ type: 'beam-clash', t0: t_roar + 0.95, dur: +(t_crush - (t_roar + 0.95)).toFixed(2), x: MX + 115, y: GY - 540, x2: GX - 115, y2: GY - 520, colorL: '#ff4814', colorR: '#38ff9a', w: 86, win: 'L', winAt: 0.85 });
fx({ type: 'impact', t0: t_crush - 0.35, x: GX - 50, y: GY - 480, r: 235 });
fx({ type: 'sparks', t0: t_crush - 0.32, x: GX - 50, y: GY - 480, n: 34, color: '#ff6a22' });
fx({ type: 'smoke', t0: t_crush - 0.3, x: GX - 40, y: GY - 440, n: 16, dark: true, spread: 260 });
fl(t_crush - 0.35, 0.2, 0.68, '#ffcf8a');
sh(t_roar, 1.0, 24); sh(t_roar + 1.0, 1.6, 20);

// Typhon giant serpent-coils erupt from sea & crush Cthulhu + point-blank firestorm -> green mist explosion!
tl.tracks.coilsRise.push({ t0: t_crush, t1: t_crush + 0.95, v: 1.0, ease: 'outCubic' }, { t0: t_wave1 + 1.4, t1: t_reform + 0.3, v: 0.0, ease: 'inOut' });
cue('typhon', 'coil-squeeze', t_crush, t_burn);
cue('cthulhu', 'strangled', t_crush, t_burn + 1.05);
cue('typhon', 'fire-breath', t_burn, t_wave1);
cue('cthulhu', 'disperse-mist', t_burn + 1.05, t_reform);
shot({ t: t_crush, type: 'wide', cx: 880, cy: 820, zoom: 0.66, push: 1.12, pan: [28, 0] });
shot({ t: t_crush + 2.0, type: 'cu', actor: 'cthulhu', fill: 0.56, push: 1.14, pan: [-16, 6], hand: 3 });
shot({ t: t_burn, type: 'cu', actor: 'typhon', fill: 0.54, push: 1.14, pan: [20, 0] });
shot({ t: t_burn + 1.0, type: 'ecu', actor: 'cthulhu', at: 'head', zoom: 2.5, push: 1.16, pan: [-15, 0] });
fx({ type: 'soil', t0: t_crush + 0.1, x: GX - 90, y: GY, n: 26 });
fx({ type: 'dust', t0: t_crush + 0.2, x: GX, y: GY - 15, n: 24, spread: 340 });
fx({ type: 'sparks', t0: t_crush + 1.2, x: GX - 20, y: GY - 420, n: 28, color: '#ff7828' });
fx({ type: 'beam', t0: t_burn - 0.35, x: MX + 115, y: GY - 540, x2: GX - 40, y2: GY - 470, w: 105, color: '#ff4814', charge: 0.45, grow: 0.14, dur: 1.85 });
fx({ type: 'beam', t0: t_burn + 0.15, x: MX + 145, y: GY - 670, x2: GX - 30, y2: GY - 520, w: 48, color: '#ffae38', charge: 0.15, grow: 0.12, dur: 1.35 });
fx({ type: 'impact', t0: t_burn + 1.0, x: GX, y: GY - 460, r: 255 });
fx({ type: 'smoke', t0: t_burn + 1.04, x: GX, y: GY - 440, n: 22, spread: 300 });
fx({ type: 'sparks', t0: t_burn + 1.05, x: GX, y: GY - 460, n: 36, color: '#38ff9a' });
fl(t_burn + 1.04, 0.22, 0.68, '#38ff9a'); sh(t_burn + 0.1, 1.3, 24);

// Short hiding-spot insert #1 (<= 2.0 s) — fisherman cowers behind rocks as flaming tidal wave hits
cue('sailor', 'cower', t_wave1, t_wave1 + 1.9, { x: [1920, 1920], y: [965, 965], scale: 0.68, flip: -1 });
shot({ t: t_wave1, type: 'insert', cx: 1920, cy: 860, zoom: 1.35, push: 1.08, pan: [15, 0], ...whip(1, 0.16) });
shot({ t: t_wave1 + 1.9, type: 'wide', cx: 1120, cy: 820, zoom: 0.66, push: 1.1, pan: [-20, 0] });
fx({ type: 'slash', t0: t_wave1 + 0.2, x: 1420, y: 920, x2: 1880, y2: 960, r: 230, color: '#ff6a22' });
fx({ type: 'sparks', t0: t_wave1 + 0.52, x: 1880, y: 940, n: 26, color: '#ffae38' });
fx({ type: 'dust', t0: t_wave1 + 0.58, x: 1880, y: 1020, n: 20, spread: 260 });
sh(t_wave1 + 0.5, 0.55, 16);

// Cthulhu reforms from swirling green mist orbs (C2) + psychic gaze shatters Typhon's 100 minds (C1)
cue('cthulhu', 'reform-mist', t_reform, t_reform + 1.6);
cue('cthulhu', 'power-up', t_reform + 1.6, t_psych);
shot({ t: t_reform, type: 'wide', cx: 1120, cy: 800, zoom: 0.7, push: 1.12, pan: [-22, -16] });
shot({ t: t_reform + 1.6, type: 'cu', actor: 'cthulhu', fill: 0.52, push: 1.14, pan: [-18, 0] });
fx({ type: 'orbs', t0: t_reform, x: GX - 340, y: GY - 640, x2: GX, y2: GY - 460, n: 6, arc: 260, r: 28, color: '#38ff9a', stagger: 0.08, fly: 0.5 });
fx({ type: 'orbs', t0: t_reform + 0.15, x: GX + 320, y: GY - 580, x2: GX, y2: GY - 460, n: 5, arc: -240, r: 26, color: '#9affe0', stagger: 0.08, fly: 0.5, seed: 9 });
fx({ type: 'pillar', t0: t_reform + 0.55, x: GX, y: GY, w: 220, color: '#38ff9a', dur: 0.8 });
fx({ type: 'smoke', t0: t_reform + 0.5, x: GX, y: GY - 380, n: 18, spread: 240 });
fx({ type: 'glint', t0: t_reform + 1.5, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 140, dur: 0.55 });
sh(t_reform + 0.55, 0.55, 18);

cue('cthulhu', 'psychic-gaze', t_psych, t_psych + 1.5);
cue('typhon', 'confused-stagger', t_psych + 1.0, t_climax);
cue('cthulhu', 'monolith-crush', t_psych + 2.1, t_climax);
shot({ t: t_psych, type: 'ecu', actor: 'cthulhu', at: 'eye', zoom: 3.1, push: 1.14, pan: [-14, 0] });
shot({ t: t_psych + 1.15, type: 'cu', actor: 'typhon', fill: 0.54, dutch: 7, push: 1.12, pan: [20, 0] });
shot({ t: t_psych + 2.3, type: 'wide', cx: 760, cy: 800, zoom: 0.62, push: 1.12, pan: [-25, 0] });
tint(t_psych, t_climax, 0.24, '#09422c', 0.25, 0.35);
fx({ type: 'glint', t0: t_psych + 0.08, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 155, dur: 0.55 });
fx({ type: 'ripple', t0: t_psych + 0.1, x: GX, y: GY - 530, r: 640, color: '#38ff9a', dur: 1.05 });
fx({ type: 'ripple', t0: t_psych + 0.5, x: GX, y: GY - 530, r: 580, color: '#9affe0', dur: 0.95 });
fx({ type: 'beam', t0: t_psych + 0.75, x: GX - 100, y: GY - 540, x2: MX + 60, y2: GY - 570, w: 56, color: '#6cffb8', charge: 0.25, grow: 0.12, dur: 1.3 });
fx({ type: 'impact', t0: t_psych + 1.15, x: MX + 60, y: GY - 570, r: 215 });
fx({ type: 'sparks', t0: t_psych + 1.18, x: MX + 60, y: GY - 570, n: 30, color: '#38ff9a' });
fx({ type: 'slash', t0: t_psych + 2.2, x: MX + 280, y: GY - 760, x2: MX + 40, y2: GY - 280, r: 245, color: '#38ff9a' });
fx({ type: 'soil', t0: t_psych + 2.5, x: MX + 60, y: GY, n: 28 });
fx({ type: 'impact', t0: t_psych + 2.5, x: MX + 60, y: GY - 300, r: 220 });
sh(t_psych + 1.15, 0.6, 20); sh(t_psych + 2.45, 0.65, 22);

// ---- 8. BEAT 3: CLIMAX DUAL CHARGE + FINAL BEAM-CLASH #2 (winAt RELATIVE!) + SLOW-MO + CRASH-ZOOM + QUENCH
cue('typhon', 'beam-charge', t_climax, t_drown);
cue('cthulhu', 'beam-charge', t_climax + 1.0, t_drown);
cue('typhon', 'fire-breath', t_drown, t_quench + 2.15);
cue('cthulhu', 'psychic-cast', t_drown, t_quench + 2.4);
cue('typhon', 'sink', t_quench + 2.15, t_after);
tl.tracks.volcRise.push({ t0: t_quench + 2.2, t1: t_after, v: 0.0, ease: 'inOut' });
tl.tracks.rlyehRise.push({ t0: t_quench + 2.9, t1: t_after, v: 0.0, ease: 'inOut' });

shot({ t: t_climax, type: 'cu', actor: 'typhon', fill: 0.54, push: 1.14, pan: [18, 0] });
shot({ t: t_climax + 1.5, type: 'cu', actor: 'cthulhu', fill: 0.54, push: 1.14, pan: [-18, 0] });
shot({ t: t_drown, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.72, push: 1.14, pan: [0, -10], dutch: 3, dutchTo: -2, hand: 4 });
shot({ t: t_quench, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.76, push: 1.16, pan: [-36, 0], dutch: -3, dutchTo: 3, hand: 5, slow: 0.52, crash: { at: t_quench + 1.45, dur: 0.26, k: 1.48 } });
shot({ t: t_quench + 2.1, type: 'ecu', actor: 'typhon', at: 'eye', zoom: 3.3, push: 1.16, pan: [0, 0], crash: { at: t_quench + 2.15, dur: 0.14, k: 1.25 } });
shot({ t: t_quench + 3.4, type: 'wide', cx: 680, cy: 820, zoom: 0.62, push: 1.1, pan: [25, -15] });

// Explicit visible dual charge orbs converging before the final clash!
fx({ type: 'glint', t0: t_climax + 0.25, actor: 'typhon', at: 'eye', color: '#ffae38', r: 140, dur: 0.55 });
fx({ type: 'glint', t0: t_climax + 1.6, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 145, dur: 0.55 });
fx({ type: 'beam', t0: t_climax + 0.45, x: MX + 115, y: GY - 540, x2: MX + 135, y2: GY - 540, w: 115, color: '#ff4814', charge: 2.45, grow: 0.05, dur: 2.55, hit: false });
fx({ type: 'beam', t0: t_climax + 1.1, x: GX - 115, y: GY - 530, x2: GX - 135, y2: GY - 530, w: 115, color: '#38ff9a', charge: 1.85, grow: 0.05, dur: 1.95, hit: false });
fx({ type: 'sparks', t0: t_climax + 1.6, x: MX + 115, y: GY - 540, n: 28, color: '#ffae38' });
fx({ type: 'sparks', t0: t_climax + 2.0, x: GX - 115, y: GY - 530, n: 28, color: '#38ff9a' });

// FINAL BEAM-CLASH #2: win:'R', winAt = 2.05 (RELATIVE seconds from t_drown!)
const clashDur = +(t_quench + 2.15 - t_drown).toFixed(2);
fx({ type: 'beam-clash', t0: t_drown, dur: clashDur, x: MX + 115, y: GY - 540, x2: GX - 115, y2: GY - 530, colorL: '#ff4814', colorR: '#38ff9a', w: 108, amp: 0.1, freq: 5.0, win: 'R', winAt: 2.05, r: 240 });
tl.slow.push({ t0: t_quench + 0.35, t1: t_quench + 1.85, rate: 0.5 });
fx({ type: 'pillar', t0: t_quench + 1.5, x: MX, y: GY, w: 280, color: '#38ff9a', dur: 0.95 });
fx({ type: 'impact', t0: t_quench + 1.82, x: MX + 60, y: GY - 490, r: 285 });
fx({ type: 'sparks', t0: t_quench + 1.86, x: MX + 60, y: GY - 490, n: 42, color: '#6cffb8' });
fx({ type: 'smoke', t0: t_quench + 2.0, x: MX + 40, y: GY - 340, n: 24, spread: 340 });
fx({ type: 'smoke', t0: t_quench + 2.65, x: MX + 60, y: GY - 220, n: 20, dark: true, spread: 360 });
fx({ type: 'dust', t0: t_quench + 2.1, x: MX, y: GY, n: 28, spread: 380 });
fl(t_quench + 1.8, 0.22, 0.72, '#b8ffdd');
sh(t_drown, 3.8, 24); sh(t_quench + 1.8, 0.9, 28);

// ---- 9. AFTERMATH & FINAL DIALOGUE (Sailors & Cthulhu)
cue('sailor', 'peek', t_after, t_safe, { x: [1900, 1900], y: [965, 965], scale: 0.68, flip: -1 });
cue('cthulhu', 'idle', t_after, t_gohome, { x: [GX, GX], y: [GY + 110, GY + 110], flip: -1 });
cue('cthulhu', 'talk', t_gohome, t_safe, { voice: 'cthulhu', x: [GX, GX], y: [GY + 110, GY + 110], flip: -1 });
cue('sailor', 'talk', t_safe, t_mid, { voice: 'sailor', x: [1900, 1900], y: [965, 965], scale: 0.68, flip: -1 });

shot({ t: t_after, type: 'insert', cx: 1860, cy: 860, zoom: 1.32, push: 1.08, pan: [-18, 0] });
shot({ t: t_after + 1.5, type: 'wide', cx: 1240, cy: 860, zoom: 0.68, push: 1.08, pan: [22, 0] });
shot({ t: t_gohome, type: 'cu', actor: 'cthulhu', fill: 0.5, push: 1.08, pan: [-16, 0] });
shot({ t: t_gohome + 2.2, type: 'cu', actor: 'cthulhu', fill: 0.58, dutch: -3, push: 1.1, pan: [14, -6] });
shot({ t: t_safe, type: 'cu', actor: 'sailor', fill: 0.52, push: 1.08, pan: [12, 0] });

// ---- 10. 3-BEAT CLIFFHANGER (calm trawlers -> music cuts, stars align -> emerald mist & eyes beside hull)
tl.tracks.starAlign.push({ t0: t_stars, t1: t_stars + 1.4, v: 1.0, ease: 'inOut' });
tl.tracks.mistSea.push({ t0: t_whisp - 1.1, t1: D, v: 1.0, ease: 'outCubic' });
tl.tracks.underEye.push({ t0: t_whisp - 0.35, t1: D, v: 1.0, ease: 'outCubic' });

shot({ t: t_mid, type: 'wide', cx: 1580, cy: 920, zoom: 0.74, push: 1.06, pan: [18, 0] });
shot({ t: t_mid + 1.7, type: 'insert', cx: 1620, cy: 1000, zoom: 1.15, push: 1.08, pan: [14, -8] });
shot({ t: t_stars, type: 'low', cx: 760, cy: 480, zoom: 0.9, push: 1.1, pan: [0, -24] });
shot({ t: t_whisp - 1.1, type: 'insert', cx: 1680, cy: 1090, zoom: 1.35, push: 1.1, pan: [12, 0] });
shot({ t: t_whisp - 0.3, type: 'insert', cx: 1680, cy: 1140, zoom: 2.1, push: 1.12, pan: [0, 8] });
fx({ type: 'smoke', t0: t_whisp - 1.0, x: 1680, y: 1120, n: 12, spread: 180, dur: 4.5 });
tint(D - 0.75, D, 0.88, '#020608', 0.7, 0.01);

tl.text.push({ t0: t_whisp + 0.6, t1: D, text: 'WHO SHOULD FIGHT IT NEXT?', x: 540, y: 1460, size: 62, color: '#38ff9a', anim: 'blink', shadow: '#000' });

tl.shake.sort((a, b) => a.t0 - b.t0);
fs.writeFileSync(path.join(HERE, 'timeline.json'), JSON.stringify(tl, null, 2));
console.log('Wrote timeline.json | fps:', tl.fps, '| duration:', D, 's | shots:', tl.shots.length, '| cues:', tl.cues.length, '| fx:', tl.fx.length);
