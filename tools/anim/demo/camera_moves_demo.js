// camera_moves_demo.js - 9 s silent reference for the 3 signature camera moves (docs/10-camera-moves.md):
//   01 PULL BACK (tight on the monster -> reveal the battlefield), 02 DOLLY ZOOM (subject locked, background looms),
//   03 CRANE + LAND (high angle descends and settles with a small overshoot on the guardian).
//   node tools/anim/demo/camera_moves_demo.js && node tools/anim/render.js --timeline tools/anim/demo/camera_moves_demo.json --dump 1,2.9,3.5,5.9,6.2,8.9 --dump-dir /tmp/cm
const fs = require('fs'), path = require('path');
const tl = { fps: 30, duration: 9, sides: { left: 'mon', right: 'gua' }, tracks: {}, cues: [], shots: [], shake: [], flash: [], fx: [], text: [], embers: [], cinema: [[0, 9]] };
tl.domains = { field: { sky: ['#06070f', '#24203e'], glow: '#c4121f', floor: ['#1b2140', '#06070f'], motif: 'spires', rock: '#0c0d18', motes: '#ffb04a' } };
tl.actors = {
  mon: { kind: 'vry', x: 250, y: 1080, scale: 1, flip: 1, z: 2 },
  gua: { kind: 'grim', x: 860, y: 1080, scale: 0.95, flip: -1, z: 2 },
};
tl.cues.push({ actor: 'mon', action: 'grin', t0: 0, t1: 9, params: {} }, { actor: 'gua', action: 'growl', t0: 0, t1: 9, params: {} });
const S = (t, type, o) => tl.shots.push(Object.assign({ t, type, scene: 'domain-field' }, o));
const L = (t0, t1, s) => tl.text.push({ t0, t1, text: s, x: 540, y: 1700, size: 64, color: '#ffb04a', anim: 'fade' });
S(0, 'cu', { actor: 'mon', zoom: 0.62, dx: 280, pullback: { k: 2.6, rise: 40 }, pan: [0, 0.01] });  // 01 pull back: start 2.6x tight, ease out to wide
L(0.1, 2.9, '01 PULL BACK');
S(3, 'cu', { actor: 'gua', fill: 0.5, dolly: { k: 1.9 }, pan: [0, 0.01], tr: { type: 'whip', dur: 0.2, dir: 1 } }); // 02 dolly zoom
L(3.1, 5.9, '02 DOLLY ZOOM');
S(6, 'low', { actor: 'gua', zoom: 1.4, crane: { dy: -700, from: 0.72, land: true, zoom: 0.8 }, pan: [-40, 0], tr: { type: 'dip', dur: 0.2 } }); // 03 crane + land
tl.shake.push({ t0: 8.4, dur: 0.3, amp: 10 });
L(6.1, 8.9, '03 CRANE + LAND');
fs.writeFileSync(path.join(__dirname, 'camera_moves_demo.json'), JSON.stringify(tl, null, 1));
console.log('wrote camera_moves_demo.json');
