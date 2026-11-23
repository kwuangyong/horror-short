// Builds timeline.json for the 15 s motion test (all times in seconds).
const fs = require('fs');
const A = (actor, action, t0, t1, params) => ({ actor, action, t0, t1, params: params || {} });
const tl = {
  fps: 30, duration: 15, camInit: { cx: 280, cy: 980, zoom: 1.7 },
  split: { end: 6.9, shatter: 6.0,
    left: { kind: 'vry', lockT: 3.9, N: 16, tagText: 'MONSTER', label: 'VRYKOLAKAS', nameSize: 58, fx: 0, fy: 262, fscale: 0.86, idle: 'idle' },
    right: { kind: 'grim', lockT: 4.9, N: 20, tagText: 'GUARDIAN', label: 'CHURCH GRIM', nameSize: 54, fx: -34, fy: 215, fscale: 0.56, idle: 'idle' } },
  actors: { vry: { kind: 'vry', x: 230, y: 1080, scale: 0.78, flip: 1, z: 1 }, grim: { kind: 'grim', x: 860, y: 1080, scale: 0.8, flip: -1, z: 2 } },
  cues: [
    A('vry', 'rise', 6.1, 7.9, { clipY: 1090, y: [1080, 1080] }), A('vry', 'idle', 7.9, 9.2),
    A('vry', 'grin', 9.3, 11.2), A('vry', 'claw-swipe', 11.6, 12.9, { x: [230, 350], ease: 'inOut' }),
    A('vry', 'recoil', 13.2, 14.2), A('vry', 'stagger', 13.5, 15, { x: [350, 250], ease: 'out' }),
    A('grim', 'crouch', 6.0, 7.6, { x: [900, 900], y: [760, 760] }),
    A('grim', 'jump', 7.6, 8.5, { x: [900, 860], y: [760, 1080], arc: 170, ease: 'lin' }),
    A('grim', 'land', 8.5, 9.0), A('grim', 'growl', 9.0, 11.6), A('grim', 'lunge', 11.9, 12.9, { x: [860, 800], ease: 'in' }),
    A('grim', 'recoil', 13.2, 15, { x: [800, 870], ease: 'out' }),
  ],
  cam: [{ t0: 7.2, t1: 8.5, cx: 540, cy: 960, zoom: 1.0, ease: 'inOut' }, { t0: 9.0, t1: 12.6, cx: 550, cy: 1000, zoom: 1.3, ease: 'inOut' },
    { t0: 12.9, t1: 13.2, cx: 570, cy: 1010, zoom: 1.45, ease: 'out' }, { t0: 13.5, t1: 15, cx: 590, cy: 1000, zoom: 1.25, ease: 'inOut' }],
  freeze: [{ t0: 12.9, dur: 0.3 }],
  shake: [{ t0: 6.0, dur: 0.5, amp: 18 }, { t0: 6.3, dur: 0.5, amp: 10 }, { t0: 8.5, dur: 0.4, amp: 14 }, { t0: 12.9, dur: 0.7, amp: 34 }, { t0: 13.2, dur: 0.3, amp: 26 }],
  flash: [{ t0: 6.0, dur: 0.3, amp: 0.9 }, { t0: 12.9, dur: 0.18, amp: 0.8 }],
  fx: [{ type: 'soil', t0: 6.3, x: 230, y: 1085, dur: 1.2, n: 20 }, { type: 'dust', t0: 6.4, x: 230, y: 1090, dur: 1.2, n: 12 }, { type: 'dust', t0: 7.2, x: 230, y: 1095, dur: 1.2, n: 10 },
    { type: 'dust', t0: 8.45, x: 860, y: 1090, dur: 1.0, n: 16, spread: 520 },
    { type: 'speed', t0: 12.9, x: 580, y: 940, dur: 0.6, n: 22 }, { type: 'impact', t0: 12.9, x: 580, y: 940, dur: 0.7, r: 190 }],
  text: [{ t0: 13.3, t1: 15.2, text: 'VS', x: 540, y: 560, size: 330, color: '#f2f0ea', shadow: '#c4121f', anim: 'slam', spacing: 6, shadowDx: 14, shadowDy: 16 }],
};
fs.writeFileSync(__dirname + '/timeline.json', JSON.stringify(tl, null, 1));
