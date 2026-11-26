// episode_kit.js - builders for the fixed parts of a Battle Spin episode (docs/07), so every make_timeline.js
// produces the same opening grammar. Node module, used by episodes/<slug>/anim/make_timeline.js.
//
//   const kit = require('../../../tools/anim/episode_kit');
//   const T = kit.opening(tl, {                      // all times in seconds (take them from sections.json / words.json)
//     hookEnd: 3.0, hookText: 2.0,                   // hook 0..hookEnd (in medias res, no narration), "WHO SURVIVES?" slams at hookText
//     lockL: 4.1, monsterIntro: [4.5, 10.6],          // left card locks, then the monster's ~5-6 s self-intro in its territory
//     lockR: 11.45, guardianIntro: [12.3, 18.9],      // right card locks, guardian intro
//     story: 20.2,                                    // VS slams right after the guardian intro, the split-roll shatters into the story at `story`
//     monster:  { kind:'apep', label:'APEP', sub:'SERPENT OF CHAOS', title:'EGYPTIAN SERPENT OF CHAOS', domain:'duat', color:'#b07aff', glow:'#3a1a7a', card:{fx:10, fy:255, fscale:0.4, idle:'idle-card'}, pillar:{x:1030, y:1130} },
//     guardian: { kind:'thor', label:'THOR', sub:'GOD OF THUNDER',  title:'NORSE GOD OF THUNDER',      domain:'thrudheim', color:'#8ad0ff', glow:'#27367c', card:{fy:270, fscale:0.5}, pillar:{x:940, y:1120} },
//   });
//   // T = { cuts:[...] (pass to captions_dyn.py --cut), intro:{L:[a,b], R:[a,b]}, story, vs }
//   // Then add YOUR shots inside T.intro.L / T.intro.R (low > cu > ecu > wide), the hook shots (0..hookEnd) and the story.
//
//   kit.kidFlee(tl, { actor:'kid', t:27.0, x0:1560, x1:2300, y:1150, scale:0.8 })  // own shot: kid runs out of frame; returns the hide time
//   kit.hideDuring(tl, 'kid', [[17.4, 28.1], [62.6, 71.5]])                       // visibility windows (hidden during the 1v1)
//   kit.chain(tl, t0, [ {type:'cu',...,dur:1.4}, {type:'versus',...,dur:1.6}, ... ])  // a 2-4 shot power chain: prep > activate > impact > aftermath
//
// Every helper only pushes into tl.* arrays; nothing is hidden. Validate with: node tools/anim/validate.js timeline.json
const add = (tl, k, v) => { (tl[k] = tl[k] || []).push(v); return v; };

function opening(tl, o) {
  const M = o.monster, G = o.guardian, hookEnd = o.hookEnd || 3.0, hookText = o.hookText === undefined ? hookEnd - 1.0 : o.hookText;
  const [mi0, mi1] = o.monsterIntro, [gi0, gi1] = o.guardianIntro, lockL = o.lockL, lockR = o.lockR, story = o.story;
  const D1 = [lockL + 0.05, mi0], E2 = [mi1 + 0.02, mi1 + 0.37], D2 = [lockR + 0.1, gi0], E3 = [gi1 + 0.06, gi1 + 0.42], VS = gi1 + 0.12;
  const card = (C, side) => Object.assign({ kind: C.kind, N: side === 'L' ? 16 : 20, label: C.label, subLabel: C.sub, fx: 0, fy: 250, fscale: 0.5, idle: 'idle' }, C.card || {});
  // ---- hook: WHO SURVIVES? + rewind glitch + letterbox/embers (your hook shots are added by the episode)
  add(tl, 'text', { t0: hookText, t1: hookEnd - 0.05, text: 'WHO SURVIVES?', x: 540, y: 400, size: 120, color: '#f2f0ea', anim: 'slam', shadow: M.glow || '#7a2ac8', shadowDx: 8, shadowDy: 10 });
  add(tl, 'shake', { t0: hookText, dur: 0.4, amp: 14 });
  add(tl, 'glitch', [hookEnd - 0.55, hookEnd]); add(tl, 'flash', { t0: hookEnd - 0.38, dur: 0.14, amp: 0.85 });
  add(tl, 'cinema', [0, hookEnd - 0.05]); add(tl, 'embers', [0, hookEnd - 0.05, M.color || '#ffd070']);
  // ---- split-roll: [spin both > lock L > dive L] · [emerge L (L locked) > lock R > dive R] · [emerge R (both locked) > VS > shatter]
  tl.splits = [
    { t0: hookEnd, shatter: 999, end: D1[1] + 0.02, left: Object.assign(card(M, 'L'), { lockT: lockL }), right: Object.assign(card(G, 'R'), { spin: 9 }), dive: { t0: D1[0], t1: D1[1], side: 'L' } },
    { t0: E2[0], shatter: 999, end: D2[1] + 0.02, left: Object.assign(card(M, 'L'), { locked: true }), right: Object.assign(card(G, 'R'), { lockT: lockR }), emerge: { t0: E2[0], t1: E2[1], side: 'L' }, dive: { t0: D2[0], t1: D2[1], side: 'R' } },
    { t0: E3[0], shatter: story, end: story + 0.9, left: Object.assign(card(M, 'L'), { locked: true }), right: Object.assign(card(G, 'R'), { locked: true }), emerge: { t0: E3[0], t1: E3[1], side: 'R' } },
  ];
  add(tl, 'shake', { t0: lockL, dur: 0.4, amp: 18 }); add(tl, 'shake', { t0: lockR, dur: 0.4, amp: 18 });
  // ---- two territory intros: title plate, origin line, pillar flash only ~0.75 s at the cut-in, letterbox + embers
  for (const [C, w] of [[M, [mi0, mi1]], [G, [gi0, gi1]]]) {
    add(tl, 'text', { t0: w[0] + 0.2, t1: w[1] + 0.02, text: C.label, x: 540, y: 300, size: 118, color: '#f2f0ea', anim: 'slam', shadow: C.glow || '#000', bg: { fill: '#0a0614', stroke: C.color, sw: 6 } });
    add(tl, 'text', { t0: w[0] + 0.6, t1: w[1] + 0.02, text: C.title || C.sub, x: 540, y: 425, size: 40, color: C.color, anim: 'pop' });
    if (C.pillar) add(tl, 'fx', { type: 'pillar', t0: w[0], x: C.pillar.x, y: C.pillar.y, w: C.pillar.w || 150, color: C.color, dur: 0.75 });
    add(tl, 'flash', { t0: w[0], dur: 0.2, amp: 0.9, color: '#ffffff' }); add(tl, 'shake', { t0: w[0], dur: 0.5, amp: 18 });
    add(tl, 'cinema', [w[0], w[1] + 0.05]); add(tl, 'embers', [w[0], w[1], C.color]);
  }
  // ---- VS + the only CTA of the opening
  add(tl, 'text', { t0: VS, t1: story + 0.1, text: 'VS', x: 540, y: 780, size: 380, color: '#f2f0ea', anim: 'slam', shadow: '#c4121f', shadowDx: 16, shadowDy: 18, spacing: 6 });
  add(tl, 'text', { t0: VS + 0.3, t1: story + 0.1, text: 'WHO WINS?  COMMENT', x: 540, y: 1000, size: 70, color: G.color || '#ff7a84', anim: 'blink', shadow: '#000' });
  add(tl, 'flash', { t0: VS, dur: 0.2, amp: 0.9 }); add(tl, 'shake', { t0: VS, dur: 0.5, amp: 26 });
  return { cuts: [E2[0], E3[0]], intro: { L: [mi0, mi1], R: [gi0, gi1] }, story, vs: VS, dive: { L: D1, R: D2 }, emerge: { L: E2, R: E3 } };
}

// THE KID's own shot running out of frame (after the guardian blocks the first strike). Returns the time the kid is gone.
function kidFlee(tl, o) {
  const dur = o.dur || 1.2, a = o.actor || 'kid';
  add(tl, 'cues', { actor: a, action: 'run', t0: o.t, t1: o.t + dur, params: { x: [o.x0, o.x1], y: [o.y, o.y], scale: o.scale || 0.8, flip: o.x1 > o.x0 ? 1 : -1, speed: 2.6 } });
  add(tl, 'shots', Object.assign({ t: o.t, type: 'follow', actor: a, dx: 120 * Math.sign(o.x1 - o.x0), dy: -200, zoom: 1.4, push: 1.08, pan: [60 * Math.sign(o.x1 - o.x0), 0], tr: { type: 'whip', dur: 0.2, dir: Math.sign(o.x1 - o.x0) || 1 } }, o.shot || {}));
  return o.t + dur;
}
const hideDuring = (tl, actor, wins) => { tl.actors[actor].vis = wins; return wins; };

// A power chain: consecutive shots (prep > activate > impact > aftermath). Each item = shot params + dur (s). Returns the end time.
function chain(tl, t0, items) {
  let t = t0; for (const it of items) { const { dur, ...s } = it; add(tl, 'shots', Object.assign({ t, push: 1.1, pan: [24, 0] }, s)); t += dur || 1.5; } return t;
}
module.exports = { opening, kidFlee, hideDuring, chain };
