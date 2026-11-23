// 12 s cinematic shot test: POV-KID 4s -> OTS-KID 2s -> LOW-ANGLE rise 2s -> ECU red eye 1s -> VERSUS-SIDE lunge + crash-zoom 3s
const fs = require('fs');
const A = (actor, action, t0, t1, params) => ({ actor, action, t0, t1, params: params || {} });
const tl = {
  fps: 30, duration: 12, holeX: 130, camInit: { cx: 540, cy: 930, zoom: 1 }, tracks: {}, scenes: [{ t0: 0, s: 'forest' }],
  actors: { vry: { kind: 'vry', x: 130, y: 1080, scale: 0.86, flip: 1, z: 2, vis: [[4, 12]] }, grim: { kind: 'grim', x: 1100, y: 1080, scale: 0.84, flip: -1, z: 3, vis: [[4, 12]] } },
  cues: [A('vry', 'rise', 5.6, 8.0, { x: [130, 130], clipY: 1090, flip: 1 }), A('vry', 'walk', 8.0, 9.0, { x: [130, 330], speed: 0.9 }), A('vry', 'claw-swipe', 9.0, 10.3, { x: [330, 385] }), A('vry', 'recoil', 10.75, 12, {}),
    A('grim', 'growl', 7.0, 9.45, { x: [1100, 1100], flip: -1 }), A('grim', 'lunge', 9.5, 10.4, { x: [1100, 938], ease: 'in' }), A('grim', 'recoil', 10.75, 12, { x: [938, 1010], ease: 'out' })],
  shots: [
    { t: 0, type: 'pov', speed: 3.0, sweep: 330, scene: 'forest' },
    { t: 4, type: 'ots', scene: 'grave', side: 'right', cx: 420, cy: 930, zoom: 1.15, push: 1.12, hand: 2, whip: 0.2, rack: { fg: 9, bg: 2 } },
    { t: 6, type: 'low', actor: 'vry', zoom: 1.75, ground: 0.9, sy: 1.12, push: 1.12, dutch: -7, hand: 1.5, whip: 0.15, whipDir: -1 },
    { t: 8, type: 'ecu', actor: 'grim', at: 'eye', zoom: 5.5, push: 1.1, dx: -40 },
    { t: 9, type: 'versus', a: 'vry', b: 'grim', zoom: 1.25, dx: -60, cy: 930, crash: { at: 10.4, dur: 0.1, k: 1.55 }, hand: 1.2 },
  ],
  slow: [{ t0: 9.7, t1: 10.35, rate: 0.4 }], freeze: [{ t0: 10.4, dur: 0.3 }],
  shake: [{ t0: 5.0, dur: 1.2, amp: 10, hold: true }, { t0: 10.4, dur: 0.7, amp: 30 }],
  flash: [{ t0: 10.4, dur: 0.14, amp: 0.9 }],
  fx: [{ type: 'dust', t0: 5.0, x: 130, y: 1090, dur: 1.2, n: 12 }, { type: 'soil', t0: 5.7, x: 130, y: 1085, dur: 1.4, n: 22 }, { type: 'dust', t0: 6.2, x: 130, y: 1092, dur: 1.2, n: 10, seed: 2 },
    { type: 'speed', t0: 10.4, x: 520, y: 940, dur: 0.6, n: 22 }, { type: 'impact', t0: 10.4, x: 520, y: 940, dur: 0.7, r: 190 }],
  props: [{ type: 'tomb', x: 760, y: 1000, scale: 0.8, z: 1, scene: 'grave' }],
};
fs.writeFileSync(__dirname + '/cine-timeline.json', JSON.stringify(tl));
