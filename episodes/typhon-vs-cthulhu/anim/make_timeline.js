#!/usr/bin/env node
// make_timeline.js - Episode #004 TYPHON vs CTHULHU (Sakuga Battle Spin)
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

const MX = 240, GX = 1280, GY = 1120; // Typhon LEFT, Cthulhu RIGHT (180-degree rule)

const tl = {
  fps: 12,
  duration: D,
  sides: { left: 'typhon', right: 'cthulhu' },
  camInit: { cx: 760, cy: 860, zoom: 0.72 },
  domains: {
    etna: {
      sky: ['#160608', '#42120c'],
      glow: '#ff521b',
      floor: ['#260a08', '#0d0404'],
      motif: 'spires',
      rock: '#1c0c0e',
      sigil: '#ff6a22',
      motes: '#ffae38',
      mist: '#3a100a',
      horizon: 900,
    },
    rlyeh: {
      sky: ['#040d10', '#0d2a26'],
      glow: '#26d98c',
      floor: ['#081d1a', '#030a0a'],
      motif: 'monoliths',
      rock: '#0b221e',
      sigil: '#38ff9a',
      motes: '#6cffb8',
      mist: '#0b2b24',
      horizon: 900,
    },
    'ocean-storm': {
      sky: ['#03060c', '#0b1826'],
      glow: '#1a3848',
      floor: ['#071824', '#02070d'],
      motif: 'none',
      rock: '#0b1620',
      sigil: null,
      motes: '#74c8e8',
      mist: '#0d2230',
      horizon: 910,
    },
  },
  actors: {
    typhon: {
      kind: 'typhon', x: MX, y: GY, scale: 1.15, flip: 1, z: 20,
      aura: { colors: ['#ff3b14', '#ff9428', '#ffe066'], r: 260, h: 220, motes: true, on: 0.9 },
      rim: '#ff6a22', rimPx: 8,
    },
    cthulhu: {
      kind: 'cthulhu', x: GX, y: GY, scale: 1.12, flip: -1, z: 22,
      aura: { colors: ['#128858', '#38ff9a', '#b8ffdd'], r: 260, h: 220, motes: true, on: 0.9 },
      rim: '#38ff9a', rimPx: 8,
    },
    kid: {
      kind: 'kid', x: 1620, y: 1110, scale: 0.72, flip: -1, z: 30,
    },
  },
  voices: {
    typhon: { words: wordIntervals(0, D, 'typhon') },
    cthulhu: { words: wordIntervals(0, D, 'cthulhu') },
    kid: { words: wordIntervals(0, D, 'kid') },
  },
  tracks: {
    volcRise: [],
    rlyehRise: [],
    starAlign: [],
    boatX: [],
    mistSea: [],
    underEye: [],
  },
  props: [
    // Rocky crag far right on ocean-storm
    {
      type: 'shape', x: 1860, y: 1160, scale: 1.0, z: 12, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'poly', pts: [[-260, 0], [-180, -180], [-60, -240], [120, -290], [320, -220], [360, 40], [-280, 40]], fill: '#101a24' },
        { k: 'poly', pts: [[-180, -180], [-60, -240], [20, -160], [-100, -110]], fill: '#1b2c3b' },
      ],
    },
    // Wooden fishing boat with warm lantern (pushed right onto rocky shore at #20)
    {
      type: 'shape', x: 1520, y: 1115, scale: 0.95, z: 26, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'poly', pts: [[-110, -28], [115, -28], [86, 16], [-86, 16]], fill: '#3d2416', txTrack: 'boatX' },
        { k: 'poly', pts: [[-6, -28], [4, -28], [4, -145], [-6, -145]], fill: '#2a180e', txTrack: 'boatX' },
        { k: 'poly', pts: [[4, -140], [72, -62], [4, -46]], fill: '#c8b89a', txTrack: 'boatX' },
        { k: 'glow', cx: 68, cy: -42, r: 34, fill: '#ffcf66', flick: 1, txTrack: 'boatX' },
      ],
    },
    // Rising volcanic basalt spires LEFT (TY4)
    { type: 'spire', x: 180, y: 1140, scale: 1.15, h: 640, w: 150, tilt: -8, color: '#ff521b', rock: '#1c0c0e', track: 'volcRise', z: 10, scene: 'domain-ocean-storm' },
    { type: 'spire', x: 460, y: 1150, scale: 0.95, h: 520, w: 130, tilt: 7, color: '#ff7828', rock: '#221012', track: 'volcRise', z: 11, scene: 'domain-ocean-storm' },
    // Rising R'lyeh non-Euclidean monoliths RIGHT (C3)
    { type: 'monolith', x: 1340, y: 1140, scale: 1.18, h: 680, w: 165, tilt: 11, color: '#38ff9a', rock: '#0b221e', track: 'rlyehRise', z: 10, scene: 'domain-ocean-storm' },
    { type: 'monolith', x: 1040, y: 1150, scale: 0.96, h: 540, w: 140, tilt: -10, color: '#6cffb8', rock: '#091b18', track: 'rlyehRise', z: 11, scene: 'domain-ocean-storm' },
    // Stars aligning in the night sky (#58)
    {
      type: 'shape', x: 760, y: 360, scale: 1.0, z: 8, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'glow', cx: -260, cy: 0, r: 22, fill: '#b8ffdd', track: 'starAlign' },
        { k: 'glow', cx: -130, cy: 0, r: 26, fill: '#e8fff5', track: 'starAlign' },
        { k: 'glow', cx: 0, cy: 0, r: 34, fill: '#38ff9a', track: 'starAlign' },
        { k: 'glow', cx: 130, cy: 0, r: 26, fill: '#e8fff5', track: 'starAlign' },
        { k: 'glow', cx: 260, cy: 0, r: 22, fill: '#b8ffdd', track: 'starAlign' },
      ],
    },
    // Green mist bubbling beside boat (#59) & Cthulhu eyes under water (#60)
    {
      type: 'shape', x: 1680, y: 1135, scale: 1.0, z: 32, scene: 'domain-ocean-storm',
      shapes: [
        { k: 'glow', cx: -60, cy: 10, r: 120, fill: '#38ff9a', track: 'mistSea' },
        { k: 'glow', cx: 50, cy: -10, r: 140, fill: '#1cd87c', track: 'mistSea' },
        { k: 'glow', cx: -46, cy: 20, r: 32, fill: '#38ff9a', track: 'underEye' },
        { k: 'glow', cx: 46, cy: 20, r: 32, fill: '#38ff9a', track: 'underEye' },
        { k: 'ell', cx: -46, cy: 20, rx: 18, ry: 9, fill: '#d8ffec', track: 'underEye' },
        { k: 'ell', cx: 46, cy: 20, rx: 18, ry: 9, fill: '#d8ffec', track: 'underEye' },
      ],
    },
  ],
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

const cue = (actor, action, t0, t1, params = {}) => tl.cues.push({ actor, action, t0, t1, params });
const shot = (s) => tl.shots.push(Object.assign({ push: 1.08, pan: [22, 0] }, s));
const fx = (f) => tl.fx.push(f);

// ---- Anchors from real audio
const ty0 = sec('intro_typhon').start, ty1 = sec('intro_typhon').end;
const ct0 = sec('intro_cthulhu').start, ct1 = sec('intro_cthulhu').end;
const st0 = sec('story').start;
const t_erupt = sent('Suddenly the sea').start;
const t_shield = sent('Yet the tremors').start;
const t_kidrun = sent('The kid scrambled').start;
const t_fight = sent('Typhon beat').start;
const t_dark = sent('Then Cthulhu spread').start;
const t_rock = sent('Furious, Typhon').start;
const t_rlyeh = sent('So Cthulhu summoned').start;
const t_roar = sent('But Typhon unleashed').start;
const t_crush = sent('His serpent coils').start;
const t_burn = sent('Burn in my fire').start;
const t_kid1 = sent('Meanwhile, a flaming').start;
const t_reform = sent('Yet Cthulhu was never').start;
const t_psych = sent('Then his psychic').start;
const t_climax = sent('Trapped in the waves').start;
const t_drown = sent('Drown in madness').start;
const t_quench = sent("As R'lyeh's stone").start;
const t_after = sent('At last, the storm').start;
const t_gohome = sent('Go home, little').start;
const t_stay = sent('...Are you staying').start;
const t_mid = sent('By midnight').start;
const t_stars = sent('Until the stars').start;
const t_whisp = sent('The stars are almost').start;

// ---- 1. OPENING (episode_kit.js)
const T = kit.opening(tl, {
  hookEnd: 3.0,
  hookText: 2.0,
  lockL: 4.1,
  monsterIntro: [ty0 - 0.1, ty1 + 0.1],
  lockR: ty1 + 0.85,
  guardianIntro: [ct0 - 0.1, ct1 + 0.1],
  story: st0 - 0.05,
  monster: {
    kind: 'typhon', label: 'TYPHON', sub: 'FATHER OF MONSTERS', title: 'GREEK FATHER OF MONSTERS',
    domain: 'etna', color: '#ff6a22', glow: '#7a1808',
    card: { fx: 0, fy: 255, fscale: 0.45, idle: 'idle-card' },
    pillar: { x: 540, y: 1120 },
  },
  guardian: {
    kind: 'cthulhu', label: 'CTHULHU', sub: "DREAMER OF R'LYEH", title: "GREAT OLD ONE OF R'LYEH",
    domain: 'rlyeh', color: '#38ff9a', glow: '#0b4d32',
    card: { fx: 0, fy: 255, fscale: 0.45, idle: 'idle-card' },
    pillar: { x: 540, y: 1120 },
  },
});

// ---- 2. HOOK SHOTS (0 - 3.0 s: real beam-clash preview)
cue('typhon', 'fire-breath', 0, 3.0, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('cthulhu', 'psychic-cast', 0, 3.0, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: 0.0, type: 'versus', a: 'typhon', b: 'cthulhu', scene: 'domain-ocean-storm', zoom: 0.85, push: 1.12, pan: [20, 0] });
shot({ t: 1.0, type: 'ecu', actor: 'typhon', at: 'eye', zoom: 3.4, push: 1.1, pan: [-15, 0] });
shot({ t: 2.0, type: 'wide', cx: 760, cy: 840, zoom: 0.66, push: 1.14, pan: [0, -20] });
fx({ type: 'beam-clash', t0: 0.0, dur: 2.9, x: MX + 90, y: GY - 480, x2: GX - 90, y2: GY - 480, colorL: '#ff521b', colorR: '#38ff9a', w: 78 });
fx({ type: 'glint', t0: 1.0, actor: 'typhon', at: 'eye', color: '#ff9428', r: 110, dur: 0.55 });

// ---- 3. TYPHON INTRO (domain-etna)
const mi0 = T.intro.L[0], mi1 = T.intro.L[1], miMid = (mi0 + mi1) / 2;
cue('typhon', 'rise', mi0, mi0 + 1.3, { x: [540, 540], y: [GY, GY], flip: 1 });
cue('typhon', 'talk', mi0 + 1.3, mi1, { voice: 'typhon', x: [540, 540], y: [GY, GY], flip: 1 });
shot({ t: mi0, type: 'low', actor: 'typhon', scene: 'domain-etna', zoom: 0.92, push: 1.1, pan: [0, -30] });
shot({ t: mi0 + 1.7, type: 'cu', actor: 'typhon', fill: 0.55, dutch: 5, push: 1.1, pan: [24, 0], tr: { type: 'whip', dur: 0.18, dir: -1 } });
shot({ t: miMid + 0.5, type: 'ecu', actor: 'typhon', at: 'eye', zoom: 3.8, push: 1.1, pan: [16, 0] });
shot({ t: mi1 - 1.5, type: 'wide', cx: 540, cy: 820, zoom: 0.78, push: 1.08, pan: [-20, -15] });
fx({ type: 'glint', t0: miMid + 0.55, actor: 'typhon', at: 'eye', color: '#ff6a22', r: 100, dur: 0.5 });
fx({ type: 'orbs', t0: mi1 - 1.4, x: 540, y: 760, x2: 880, y2: 420, n: 4, color: '#ff7828' });

// ---- 4. CTHULHU INTRO (domain-rlyeh)
const gi0 = T.intro.R[0], gi1 = T.intro.R[1], giMid = (gi0 + gi1) / 2;
cue('cthulhu', 'rise', gi0, gi0 + 1.3, { x: [540, 540], y: [GY, GY], flip: -1 });
cue('cthulhu', 'talk', gi0 + 1.3, gi1, { voice: 'cthulhu', x: [540, 540], y: [GY, GY], flip: -1 });
shot({ t: gi0, type: 'low', actor: 'cthulhu', scene: 'domain-rlyeh', zoom: 0.92, push: 1.1, pan: [0, -30] });
shot({ t: gi0 + 1.7, type: 'cu', actor: 'cthulhu', fill: 0.55, dutch: -5, push: 1.1, pan: [-24, 0], tr: { type: 'whip', dur: 0.18, dir: 1 } });
shot({ t: giMid + 0.5, type: 'ecu', actor: 'cthulhu', at: 'eye', zoom: 3.8, push: 1.1, pan: [-16, 0] });
shot({ t: gi1 - 1.5, type: 'wide', cx: 540, cy: 820, zoom: 0.78, push: 1.08, pan: [20, -15] });
fx({ type: 'glint', t0: giMid + 0.55, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 100, dur: 0.5 });
fx({ type: 'orbs', t0: gi1 - 1.4, x: 540, y: 760, x2: 200, y2: 420, n: 4, color: '#38ff9a' });

// ---- 5. STORY: MOONLESS OCEAN, TYPHON ERUPTS, CTHULHU SHIELDS BOATS, KID FLEES
// Reset actors to 180-rule positions (Typhon LEFT = MX, Cthulhu RIGHT = GX)
cue('typhon', 'sink', T.story, t_erupt, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('cthulhu', 'sink', T.story, t_shield, { x: [GX, GX], y: [GY, GY], flip: -1 });
cue('kid', 'idle-scared', T.story, t_kidrun, { x: [1520, 1520], y: [1085, 1085], flip: -1 });

shot({ t: T.story, type: 'wide', cx: 1380, cy: 900, zoom: 0.75, scene: 'domain-ocean-storm', push: 1.08, pan: [30, 0] });
shot({ t: T.story + 1.8, type: 'insert', cx: 1520, cy: 920, zoom: 1.35, push: 1.1, pan: [15, -10] });

// Typhon erupts from boiling sea + firestorm breath
cue('typhon', 'rise-from-sea', t_erupt, t_erupt + 1.6, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('typhon', 'fire-breath', t_erupt + 1.6, t_shield + 0.6, { x: [MX, MX], y: [GY, GY], flip: 1 });
shot({ t: t_erupt, type: 'low', actor: 'typhon', zoom: 0.9, push: 1.12, pan: [0, -30] });
shot({ t: t_erupt + 1.6, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.74, push: 1.1, pan: [40, 0], tr: { type: 'whip', dur: 0.18, dir: 1 } });
fx({ type: 'pillar', t0: t_erupt, x: MX, y: GY, w: 190, color: '#ff521b', dur: 0.65 });
fx({ type: 'beam', t0: t_erupt + 1.6, x: MX + 80, y: GY - 480, x2: GX - 60, y2: GY - 440, w: 80, color: '#ff521b', dur: 1.4 });
tl.shake.push({ t0: t_erupt, dur: 0.6, amp: 20 });

// Cthulhu rises to shield & sweeps wave pushing boat to rocky shore
cue('cthulhu', 'land-hero', t_shield, t_shield + 1.4, { x: [GX, GX], y: [GY, GY], flip: -1 });
cue('cthulhu', 'wave-sweep', t_shield + 1.4, t_kidrun, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: t_shield, type: 'wide', cx: 1020, cy: 840, zoom: 0.72, push: 1.1, pan: [-24, 0] });
shot({ t: t_shield + 1.4, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.7, push: 1.08, pan: [50, 0], tr: { type: 'whip', dur: 0.18, dir: 1 } });
fx({ type: 'slash', t0: t_shield + 1.5, x: GX - 40, y: GY - 320, x2: 1750, y2: GY - 220, r: 240, color: '#6cffb8' });
tl.tracks.boatX.push({ t0: t_shield + 1.4, t1: t_kidrun, v: 260, ease: 'outCubic' });
tl.flash.push({ t0: t_shield + 0.2, dur: 0.18, amp: 0.85, color: '#b8ffdd' });

// Kid's own shot running off-frame RIGHT behind boulders
const kidGone = kit.kidFlee(tl, { actor: 'kid', t: t_kidrun, x0: 1720, x1: 2240, y: 1060, scale: 0.72, dur: 1.3 });
kit.hideDuring(tl, 'kid', [
  [T.story, kidGone],
  [t_kid1, t_kid1 + 2.0], // short hiding-spot insert #1 (<= 2.0 s)
  [t_after, t_mid + 1.6], // aftermath
]);

// Establishing 1v1
cue('typhon', 'idle', t_kidrun + 1.2, t_fight, { x: [MX, MX], y: [GY, GY], flip: 1 });
cue('cthulhu', 'idle', t_kidrun + 1.2, t_fight, { x: [GX, GX], y: [GY, GY], flip: -1 });
shot({ t: t_kidrun + 1.3, type: 'wide', cx: 760, cy: 840, zoom: 0.64, push: 1.08, pan: [0, -15] });
tl.cinema.push([t_fight, t_after]);
tl.embers.push([t_fight, t_after, '#ff6a22']);

// ---- 6. BEAT 1: TESTING POWERS (A2 BACK-AND-FORTH)
// Typhon hurricanes (TY2) vs Cthulhu claws (C4)
cue('typhon', 'wing-charge', t_fight, t_fight + 1.4);
cue('typhon', 'strike', t_fight + 1.4, t_fight + 2.9);
cue('cthulhu', 'claw-slash', t_fight + 2.6, t_dark);
shot({ t: t_fight, type: 'cu', actor: 'typhon', fill: 0.55, push: 1.1, pan: [20, 0] });
shot({ t: t_fight + 1.4, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.74, push: 1.1, pan: [40, 0], tr: { type: 'whip', dur: 0.16, dir: 1 } });
shot({ t: t_fight + 2.8, type: 'cu', actor: 'cthulhu', fill: 0.55, push: 1.1, pan: [-20, 0] });
fx({ type: 'slash', t0: t_fight + 1.5, x: MX + 120, y: GY - 380, x2: GX - 80, y2: GY - 360, r: 240, color: '#ff6a22' });
fx({ type: 'slash', t0: t_fight + 2.9, x: GX - 100, y: GY - 360, x2: MX + 160, y2: GY - 360, r: 230, color: '#38ff9a', flipV: true });

// Cthulhu material darkness (C5) + psychic orbs (C1)
cue('cthulhu', 'wing-surge', t_dark, t_dark + 1.5);
cue('cthulhu', 'psychic-cast', t_dark + 1.5, t_rock);
cue('typhon', 'recoil', t_dark + 2.7, t_rock);
shot({ t: t_dark, type: 'low', actor: 'cthulhu', zoom: 0.9, push: 1.12, pan: [0, -28] });
shot({ t: t_dark + 1.5, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.74, push: 1.1, pan: [-40, 0], tr: { type: 'whip', dur: 0.16, dir: -1 } });
shot({ t: t_dark + 2.8, type: 'cu', actor: 'typhon', fill: 0.55, push: 1.1, pan: [18, 0] });
fx({ type: 'pillar', t0: t_dark, x: GX, y: GY, w: 200, color: '#1cd87c', dur: 0.7 });
fx({ type: 'orbs', t0: t_dark + 1.6, x: GX - 90, y: GY - 460, x2: MX + 60, y2: GY - 420, n: 6, color: '#38ff9a' });
tl.shake.push({ t0: t_dark + 2.7, dur: 0.5, amp: 18 });

// Typhon volcanic spires rise LEFT + hurls lava boulders (TY4)
tl.tracks.volcRise.push({ t0: t_rock, t1: t_rock + 1.4, v: 1.0, ease: 'outCubic' });
cue('typhon', 'throw-rock', t_rock + 1.3, t_rlyeh);
cue('cthulhu', 'stagger', t_rock + 2.6, t_rlyeh);
shot({ t: t_rock, type: 'low', actor: 'typhon', dutch: 6, zoom: 0.88, push: 1.12, pan: [0, -25] });
shot({ t: t_rock + 1.4, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.72, push: 1.1, pan: [38, 0], tr: { type: 'whip', dur: 0.16, dir: 1 } });
shot({ t: t_rock + 2.7, type: 'cu', actor: 'cthulhu', fill: 0.55, push: 1.1, pan: [-20, 0] });
shot({ t: t_rock + 4.1, type: 'wide', cx: 760, cy: 840, zoom: 0.65, push: 1.08, pan: [0, -15] });
fx({ type: 'orbs', t0: t_rock + 1.5, x: MX + 100, y: GY - 380, x2: GX - 60, y2: GY - 360, n: 5, color: '#ff521b', r: 34 });
tl.shake.push({ t0: t_rock, dur: 0.7, amp: 20 }, { t0: t_rock + 2.6, dur: 0.5, amp: 20 });

// ---- 7. BEAT 2: R'LYEH RISES, 100-HEADED ROAR, COIL CRUSH, MIST REFORM, KID CRISIS
tl.tracks.rlyehRise.push({ t0: t_rlyeh, t1: t_rlyeh + 1.5, v: 1.0, ease: 'outCubic' });
cue('cthulhu', 'monolith-crush', t_rlyeh, t_roar);
shot({ t: t_rlyeh, type: 'low', actor: 'cthulhu', dutch: -6, zoom: 0.88, push: 1.12, pan: [0, -28] });
shot({ t: t_rlyeh + 1.6, type: 'wide', cx: 760, cy: 820, zoom: 0.62, push: 1.1, pan: [-20, 0] });
tl.shake.push({ t0: t_rlyeh, dur: 0.8, amp: 22 });

// Typhon hundred-headed roar (TY3)
cue('typhon', 'roar', t_roar, t_crush);
shot({ t: t_roar, type: 'ecu', actor: 'typhon', at: 'mouth', zoom: 3.4, push: 1.12, pan: [15, 0] });
shot({ t: t_roar + 1.5, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.74, push: 1.1, pan: [40, 0], tr: { type: 'whip', dur: 0.16, dir: 1 } });
fx({ type: 'orbs', t0: t_roar + 1.5, x: MX + 100, y: GY - 480, x2: GX - 60, y2: GY - 420, n: 5, color: '#ffae38', r: 30 });
tl.shake.push({ t0: t_roar, dur: 0.9, amp: 24 });

// Typhon coils crush Cthulhu + point-blank firestorm -> Cthulhu bursts into green mist
cue('typhon', 'coil-squeeze', t_crush, t_burn);
cue('cthulhu', 'strangled', t_crush, t_burn + 1.1);
cue('typhon', 'fire-breath', t_burn, t_kid1);
cue('cthulhu', 'disperse-mist', t_burn + 1.1, t_reform);
shot({ t: t_crush, type: 'wide', cx: 820, cy: 860, zoom: 0.72, push: 1.1, pan: [25, 0] });
shot({ t: t_burn, type: 'cu', actor: 'typhon', fill: 0.58, push: 1.12, pan: [20, 0] });
shot({ t: t_burn + 1.2, type: 'ecu', actor: 'cthulhu', at: 'head', zoom: 2.8, push: 1.14, pan: [-15, 0] });
fx({ type: 'beam', t0: t_burn, x: MX + 90, y: GY - 480, x2: GX - 40, y2: GY - 440, w: 92, color: '#ff521b', dur: 1.3 });
tl.flash.push({ t0: t_burn + 1.2, dur: 0.25, amp: 0.95, color: '#38ff9a' });

// Short kid hiding-spot insert #1 (<= 2.0 s)
cue('kid', 'cower', t_kid1, t_kid1 + 2.0, { x: [1880, 1880], y: [960, 960], flip: -1 });
shot({ t: t_kid1, type: 'insert', cx: 1880, cy: 860, zoom: 1.4, push: 1.08, pan: [15, 0], tr: { type: 'whip', dur: 0.16, dir: 1 } });

// Cthulhu reforms from green mist (C2) + psychic gaze (C1) disrupts Typhon
cue('cthulhu', 'reform-mist', t_reform, t_reform + 1.6);
cue('cthulhu', 'power-up', t_reform + 1.6, t_psych);
shot({ t: t_reform, type: 'wide', cx: 1080, cy: 840, zoom: 0.74, push: 1.1, pan: [-20, -15] });
shot({ t: t_reform + 1.6, type: 'cu', actor: 'cthulhu', fill: 0.56, push: 1.12, pan: [-18, 0] });
fx({ type: 'pillar', t0: t_reform + 0.4, x: GX, y: GY, w: 180, color: '#38ff9a', dur: 0.65 });
fx({ type: 'glint', t0: t_reform + 1.7, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 120, dur: 0.55 });

cue('cthulhu', 'psychic-gaze', t_psych, t_psych + 1.5);
cue('typhon', 'confused-stagger', t_psych + 1.2, t_climax);
cue('cthulhu', 'monolith-crush', t_psych + 2.6, t_climax);
shot({ t: t_psych, type: 'ecu', actor: 'cthulhu', at: 'eye', zoom: 3.8, push: 1.12, pan: [-14, 0] });
shot({ t: t_psych + 1.3, type: 'cu', actor: 'typhon', fill: 0.58, dutch: 7, push: 1.1, pan: [20, 0] });
shot({ t: t_psych + 2.7, type: 'wide', cx: 760, cy: 840, zoom: 0.66, push: 1.1, pan: [-25, 0] });
fx({ type: 'glint', t0: t_psych + 0.1, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 120, dur: 0.55 });

// ---- 8. BEAT 3: CLIMAX BEAM-CLASH & LORE FINISHER (slow-mo + crash-zoom)
cue('typhon', 'beam-charge', t_climax, t_drown);
cue('cthulhu', 'beam-charge', t_climax + 1.2, t_drown);
cue('typhon', 'fire-breath', t_drown, t_quench + 2.2);
cue('cthulhu', 'psychic-cast', t_drown, t_quench + 2.4);
cue('typhon', 'sink', t_quench + 2.2, t_after);
tl.tracks.volcRise.push({ t0: t_quench + 2.4, t1: t_after, v: 0.0, ease: 'inOut' });
tl.tracks.rlyehRise.push({ t0: t_quench + 3.0, t1: t_after, v: 0.0, ease: 'inOut' });

shot({ t: t_climax, type: 'cu', actor: 'typhon', fill: 0.58, push: 1.12, pan: [18, 0] });
shot({ t: t_climax + 1.4, type: 'cu', actor: 'cthulhu', fill: 0.58, push: 1.12, pan: [-18, 0] });
shot({ t: t_drown, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.78, push: 1.12, pan: [0, -10] });
// Slow-mo + crash-zoom on winning beam-clash!
shot({ t: t_quench, type: 'versus', a: 'typhon', b: 'cthulhu', zoom: 0.82, push: 1.16, pan: [-30, 0], slow: 0.55, crash: { at: t_quench + 1.5, dur: 0.35, k: 1.45 } });
shot({ t: t_quench + 2.1, type: 'ecu', actor: 'typhon', at: 'eye', zoom: 4.0, push: 1.15, pan: [0, 0] });
shot({ t: t_quench + 3.4, type: 'wide', cx: 680, cy: 860, zoom: 0.64, push: 1.08, pan: [25, -15] });

fx({ type: 'glint', t0: t_climax + 0.2, actor: 'typhon', at: 'eye', color: '#ff6a22', r: 110, dur: 0.5 });
fx({ type: 'glint', t0: t_climax + 1.5, actor: 'cthulhu', at: 'eye', color: '#38ff9a', r: 110, dur: 0.5 });
fx({ type: 'beam-clash', t0: t_drown, dur: t_quench + 2.1 - t_drown, x: MX + 90, y: GY - 480, x2: GX - 90, y2: GY - 480, colorL: '#ff521b', colorR: '#38ff9a', w: 86, win: 'R', winAt: t_quench + 0.5 });
fx({ type: 'pillar', t0: t_quench + 1.5, x: MX, y: GY, w: 220, color: '#38ff9a', dur: 0.8 });
tl.flash.push({ t0: t_quench + 1.8, dur: 0.28, amp: 1.0, color: '#e8fff5' });
tl.shake.push({ t0: t_drown, dur: 3.5, amp: 22 });

// ---- 9. AFTERMATH & FINAL DIALOGUE
cue('kid', 'peek', t_after, t_stay, { x: [1860, 1860], y: [960, 960], flip: -1 });
cue('cthulhu', 'idle', t_after, t_gohome, { x: [GX, GX], y: [GY + 120, GY + 120], flip: -1 });
cue('cthulhu', 'talk', t_gohome, t_stay, { voice: 'cthulhu', x: [GX, GX], y: [GY + 120, GY + 120], flip: -1 });
cue('kid', 'talk', t_stay, t_mid, { voice: 'kid', x: [1860, 1860], y: [960, 960], flip: -1 });

shot({ t: t_after, type: 'insert', cx: 1860, cy: 860, zoom: 1.35, push: 1.08, pan: [-15, 0] });
shot({ t: t_after + 1.6, type: 'wide', cx: 1180, cy: 880, zoom: 0.72, push: 1.08, pan: [20, 0] });
shot({ t: t_gohome, type: 'cu', actor: 'cthulhu', fill: 0.54, push: 1.08, pan: [-16, 0] });
shot({ t: t_stay, type: 'cu', actor: 'kid', fill: 0.52, push: 1.08, pan: [12, 0] });

// ---- 10. 3-BEAT CLIFFHANGER (C3: glassy water -> stars align -> emerald mist & eyes under water)
tl.tracks.starAlign.push({ t0: t_stars, t1: t_stars + 1.4, v: 1.0, ease: 'inOut' });
tl.tracks.mistSea.push({ t0: t_whisp - 1.1, t1: D, v: 1.0, ease: 'outCubic' });
tl.tracks.underEye.push({ t0: t_whisp - 0.35, t1: D, v: 1.0, ease: 'outCubic' });

shot({ t: t_mid, type: 'wide', cx: 1580, cy: 920, zoom: 0.78, push: 1.06, pan: [18, 0] });
shot({ t: t_stars, type: 'low', cx: 760, cy: 480, zoom: 0.9, push: 1.1, pan: [0, -24] });
shot({ t: t_whisp - 1.1, type: 'insert', cx: 1680, cy: 1090, zoom: 1.35, push: 1.1, pan: [12, 0] });
shot({ t: t_whisp - 0.3, type: 'insert', cx: 1680, cy: 1140, zoom: 2.1, push: 1.12, pan: [0, 8] });

tl.text.push({ t0: t_whisp + 0.6, t1: D, text: 'WHO SHOULD FIGHT IT NEXT?', x: 540, y: 1460, size: 62, color: '#38ff9a', anim: 'blink', shadow: '#000' });

fs.writeFileSync(path.join(HERE, 'timeline.json'), JSON.stringify(tl, null, 2));
console.log('Wrote timeline.json | duration:', D, 's | shots:', tl.shots.length, '| cues:', tl.cues.length);
