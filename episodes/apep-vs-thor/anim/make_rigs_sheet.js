#!/usr/bin/env node
// Builds episodes/apep-vs-thor/preview/rigs-sheet.png : APEP + THOR poses, desert eclipse domain, coil-squeeze hook test.
// usage: node episodes/apep-vs-thor/anim/make_rigs_sheet.js [out.png] [--keep dir]
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../../..'), OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(ROOT, 'episodes/apep-vs-thor/preview/rigs-sheet.png');
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rigs3-'));
const base = (o) => Object.assign({ fps: 30, duration: 4, holeX: 130, camInit: { cx: 540, cy: 960, zoom: 1 }, tracks: {}, domains: { pose: { sky: ['#171424', '#3c3254'], glow: '#8a78b8', floor: ['#2a2434', '#100c18'], motif: 'none', horizon: 1900 } }, scenes: [{ t0: 0, s: 'domain-pose' }], actors: {}, cues: [], shots: [{ t: 0, type: 'wide', cx: 540, cy: 960, zoom: 1 }], props: [], fx: [], text: [], voices: { v: { words: [[0, 9]] } } }, o);
// items: {kind, a (action), at (seconds into the action), dur, p, x, scale, label}
const grid = (items, cols, cw, ch, y0) => { const tl = base({}); items.forEach((it, i) => { const c = i % cols, r = Math.floor(i / cols), x = cw * c + (it.x === undefined ? cw / 2 : it.x), y = y0 + ch * r, a = 'a' + i; const at = it.at || 0, dur = it.dur || 2;
  tl.actors[a] = { kind: it.kind, x, y, scale: it.scale, flip: it.flip || 1, z: 1, variant: 0 }; tl.cues.push({ actor: a, action: it.a, t0: 1 - at, t1: 1 - at + dur, params: Object.assign({ voice: 'v' }, it.p || {}) });
  tl.text.push({ t0: 0, t1: 4, text: it.label || (it.kind.toUpperCase() + ': ' + it.a), x: cw * c + cw / 2, y: y + 60, size: 28, color: '#ffe9a0', anim: 'fade' }); }); return tl; };
const panels = [];
const ap = (a, at, dur, p, label) => ({ kind: 'apep', a, at, dur, p, scale: 0.6, x: 650, label });
panels.push([grid([ap('idle', 1.2, 4, {}, 'APEP: idle (slither)'), ap('rise-from-sand', 0.62, 1.2, {}, 'APEP: rise-from-sand (u .5)'), ap('strike', 0.5, 1.0, { reach: 560 }, 'APEP: strike (head lunges)')], 1, 1080, 600, 520), 0]);
panels.push([grid([ap('hypno-gaze', 1.5, 3, {}, 'APEP: hypno-gaze'), ap('roar', 0.8, 2, {}, 'APEP: roar'), ap('swallow', 0.55, 1.4, { reach: 520 }, 'APEP: swallow (unhinged jaw)')], 1, 1080, 600, 520), 0]);
const th = (a, at, dur, p, label) => ({ kind: 'thor', a, at, dur, p, scale: 0.52, label });
panels.push([grid([th('idle', 1, 4, {}, 'THOR: idle'), th('lightning-call', 1.2, 2, {}, 'THOR: lightning-call'), th('throw-hammer', 0.36, 1.2, {}, 'THOR: throw-hammer (wind-up)'), th('belt-power', 1.0, 2, {}, 'THOR: belt-power'), th('strangled', 1.2, 2.5, {}, 'THOR: strangled'), th('stagger-venom', 1.4, 3, {}, 'THOR: stagger-venom')], 2, 540, 600, 560), 0]);
panels.push([grid([th('run', 0.4, 2, {}, 'THOR: run'), th('catch-hammer', 0.4, 1.2, {}, 'THOR: catch-hammer'), th('swing', 0.5, 1.0, {}, 'THOR: swing'), th('block', 0.5, 1.4, {}, 'THOR: block'), th('kneel', 0.8, 2, {}, 'THOR: kneel'), th('land-hero', 0.55, 1.4, {}, 'THOR: land-hero (impact)')], 2, 540, 600, 560), 0]);
// desert battlefield, eclipse nearly total, both characters
const dom = { desert: { sky: ['#0b0620', '#5a2f6a'], glow: '#b86bff', floor: ['#2c1c38', '#0c0714'], motif: 'ruins', horizon: 1000, rock: '#251a30', sand: ['#3a2848', '#2f2040', '#241834'], motes: '#e6c8ff', mist: '#b090d8', eclipse: { x: 520, y: 330, r: 150, track: 'eclipse' } } };
const mkDom = (k, aps, tors, extra) => base(Object.assign({ domains: dom, scenes: [{ t0: 0, s: 'domain-desert' }], tracks: { eclipse: [{ t0: 0, t1: 0.1, v: k }], rise: [{ t0: 0, t1: 0.1, v: 1 }] }, cinema: [[0, 4]], embers: [[0, 4, '#d8b8ff']], sides: { left: 'apep', right: 'thor' },
  props: [{ type: 'spire', x: 360, y: 1260, scale: 1, h: 700, w: 190, tilt: -6, color: '#b86bff', rock: '#150d22', track: 'rise', scene: 'domain-desert' }],
  actors: Object.assign({ apep: { kind: 'apep', x: 120, y: 1260, scale: 0.62, flip: 1, z: 2, aura: { colors: ['#4a1a8a', '#b07aff', '#e8d0ff'], r: 300, h: 200 }, rim: '#b07aff', rimPx: 6 }, thor: { kind: 'thor', x: 880, y: 1270, scale: 0.78, flip: -1, z: 2, aura: { colors: ['#2a5ac8', '#8ad0ff', '#ffffff'], r: 240, h: 230 }, rim: '#9fd8ff', rimPx: 8 } }, extra || {}),
  cues: aps.concat(tors), shots: [{ t: 0, type: 'wide', cx: 540, cy: 940, zoom: 1 }] }, {}));
panels.push([mkDom(0.94, [{ actor: 'apep', action: 'hypno-gaze', t0: -0.5, t1: 3, params: {} }], [{ actor: 'thor', action: 'lightning-call', t0: -0.2, t1: 3, params: {} }]), 0]);
// squeeze hook: two apep actors (back / front layer) around Thor
const sq = (layer) => ({ actor: layer === 1 ? 'apepB' : 'apepF', action: 'coil-squeeze', t0: -0.4, t1: 3, params: { wrapX: 700, wrapR: 170, wrapH: 900, layer, headRot: 14 } });
const hook = mkDom(0.55, [sq(1), sq(2)], [{ actor: 'thor', action: 'strangled', t0: -0.2, t1: 3, params: {} }], { apepB: { kind: 'apep', x: 60, y: 1260, scale: 0.62, flip: 1, z: 1, rim: '#b07aff', rimPx: 6 }, apepF: { kind: 'apep', x: 60, y: 1260, scale: 0.62, flip: 1, z: 3, rim: '#b07aff', rimPx: 6 } });
delete hook.actors.apep; hook.actors.thor.x = 60 + 700 * 0.62 + 0; hook.props = []; hook.sides = { left: 'apepB', right: 'thor' };
panels.push([hook, 0]);
const imgs = [];
panels.forEach(([tl, t], i) => { const f = path.join(TMP, `p${i}.json`); fs.writeFileSync(f, JSON.stringify(tl)); const d = path.join(TMP, `d${i}`); const r = spawnSync('node', [path.join(ROOT, 'tools/anim/render.js'), '--timeline', f, '--dump', '1', '--dump-dir', d, '--scale', '1'], { encoding: 'utf8' }); if (r.status || /PAGE ERROR/.test(r.stderr + r.stdout)) { console.error(r.stdout, r.stderr); process.exit(1); } imgs.push(path.join(d, fs.readdirSync(d)[0])); });
if (process.argv.includes('--keep')) { const kd = process.argv[process.argv.indexOf('--keep') + 1]; fs.mkdirSync(kd, { recursive: true }); imgs.forEach((p, i) => fs.copyFileSync(p, path.join(kd, `panel${i}.png`))); }
const names = ['APEP poses 1', 'APEP poses 2', 'THOR poses 1', 'THOR poses 2', 'DESERT eclipse (k=.94) + both', 'HOOK TEST: coil-squeeze (2 layers) + strangled'];
const py = `from PIL import Image, ImageDraw\nimgs=${JSON.stringify(imgs)}\nnames=${JSON.stringify(names)}\nW,H=648,1152\nS=Image.new('RGB',(W*3,H*2+60),(8,8,16));d=ImageDraw.Draw(S)\nfor i,p in enumerate(imgs):\n    im=Image.open(p).convert('RGB').resize((W,1152));x=(i%3)*W;y=(i//3)*(H+30)+30;S.paste(im,(x,y));d.text((x+8,y-22),names[i],fill=(255,230,150))\nS.save(${JSON.stringify(OUT)});print(S.size)`;
const r2 = spawnSync('python3', ['-c', py], { encoding: 'utf8' }); console.log(r2.stdout, r2.stderr);
