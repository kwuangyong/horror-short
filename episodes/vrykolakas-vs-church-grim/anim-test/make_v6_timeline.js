// 10 s v6 test: new kid in POV forest -> OTS (back of hair + scarf) -> match-cut Grim lunge -> Grim talks to the kid -> bedroom window with Vrykolakas
const fs = require('fs');
const A = (actor, action, t0, t1, params) => ({ actor, action, t0, t1, params: params || {} });
const tl = {
  fps: 30, duration: 10, holeX: 130, camInit: { cx: 540, cy: 930, zoom: 1 }, tracks: {}, scenes: [{ t0: 0, s: 'forest' }], sides: { left: 'vry', right: 'grim' },
  voices: { grim: { words: [[5.9, 6.25], [6.35, 6.85], [6.95, 7.2], [7.3, 7.65], [8.3, 8.4]] }, kid: { words: [[6.9, 7.2], [7.25, 7.55]] } },
  actors: { kid: { kind: 'kid', x: 400, y: 1040, scale: 0.8, flip: 1, z: 0, vis: [[4.5, 7.6]] }, vry: { kind: 'vry', x: 330, y: 1080, scale: 0.86, flip: 1, z: 2, vis: [[4.5, 5.8]] }, grim: { kind: 'grim', x: 1000, y: 1080, scale: 0.84, flip: -1, z: 3, vis: [[4.5, 7.6]] } },
  cues: [A('vry', 'circle', 4.5, 5.8, { x: [330, 330], flip: 1 }), A('grim', 'growl', 4.5, 4.7, { x: [1000, 1000], flip: -1 }), A('grim', 'lunge', 4.7, 5.55, { x: [1000, 840], flip: -1, ease: 'in' }), A('grim', 'talk', 5.9, 7.6, { x: [840, 840], flip: -1, voice: 'grim' }),
    A('kid', 'talk', 5.9, 7.6, { x: [400, 400], y: [1040, 1040], flip: 1, voice: 'kid', beam: 0.4 })],
  shots: [
    { t: 0, type: 'pov', scene: 'forest', speed: 3.2, sweep: 330 },
    { t: 3.0, type: 'ots', scene: 'grave', side: 'left', cx: 560, cy: 930, zoom: 1.3, push: 1.12, hand: 2, rack: { fg: 9, bg: 1 }, tr: { type: 'whip', dur: 0.28, dir: 1 } },
    { t: 4.5, type: 'versus', a: 'vry', b: 'grim', zoom: 1.35, cy: 960, hand: 1.5 },
    { t: 5.15, type: 'ecu', actor: 'grim', at: 'jaw', zoom: 2.6, anchor: { actor: 'grim', at: 'head', sx: 540, sy: 880 }, hand: 2, tr: { type: 'whip', dur: 0.2, dir: -1 } },
    { t: 5.85, type: 'versus', a: 'kid', b: 'grim', zoom: 1.5, cy: 960, push: 1.1, tr: { type: 'dip', dur: 0.2 }, cap: 'low' },
    { t: 7.6, type: 'insert', scene: 'room', cx: 250, cy: 600, zoom: 1.25, push: 1.4, hand: 1.2, tr: { type: 'fade', dur: 0.5 } },
  ],
  tracks: { winMon: [{ t0: 7.9, t1: 8.8, v: 1, ease: 'out' }], winGlow: [{ t0: 8.5, t1: 9.0, v: 1 }], winBreath: [{ t0: 8.8, t1: 9.5, v: 1 }], winScratch: [{ t0: 9.0, t1: 10, v: 1, ease: 'lin' }], winLean: [{ t0: 8.8, t1: 10, v: 1 }] },
  fx: [], props: [{ type: 'tomb', x: 1100, y: 940, scale: 0.8, z: 1, scene: 'grave' }], text: [], flash: [{ t0: 5.0, dur: 0.1, amp: 0.8 }], shake: [{ t0: 5.0, dur: 0.4, amp: 18 }],
};
fs.writeFileSync(__dirname + '/v6-timeline.json', JSON.stringify(tl));
