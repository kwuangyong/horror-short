// stage.js - arena scene, camera, fx, split-roll intro, timeline evaluation, window.renderFrame(t).
(function (G) {
  const { $, clamp, lerp, ease, EASE, mulberry, rgb, mixc, hash, f2, ACTIONS, RIGS, setSil, K } = G;
  const W = 1080, H = 1920, GROUND = 880;
  let TL = null, svg, defs, arena, layers = {}, fxList = [], textList = [], flashEl, vigEl, splitG, S = {}, actors = {}, hud = null;

  // ------------------------------------------------------------------ timeline helpers
  const mixP = (a, b, w) => { const o = {}; for (const k in a) { const x = a[k], y = b[k] === undefined ? x : b[k]; o[k] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], w)) : lerp(x, y, w); } return o; };
  function track(cues, key, ta, init, arcKey) {
    let v = init;
    for (const c of cues) {
      const seg = c.params && c.params[key]; if (seg === undefined) continue;
      const a = Array.isArray(seg) ? seg[0] : seg, b = Array.isArray(seg) ? seg[1] : seg;
      if (ta >= c.t1) { v = b; continue; }
      if (ta >= c.t0) { const u = (ta - c.t0) / (c.t1 - c.t0); v = lerp(a, b, ease(c.params.ease || 'inOut', u)); if (arcKey === 'y' && c.params.arc) v -= c.params.arc * 4 * u * (1 - u); }
      break;
    }
    return v;
  }
  function stateTrack(list, ta, init) {      // camera-like: [{t0,t1,cx,cy,zoom,ease}]
    let s = Object.assign({}, init);
    for (const c of list) {
      const tgt = {}; for (const k of ['cx', 'cy', 'zoom']) tgt[k] = c[k] === undefined ? s[k] : c[k];
      if (ta >= c.t1) { s = tgt; continue; }
      if (ta >= c.t0) { const e = ease(c.ease || 'inOut', (ta - c.t0) / (c.t1 - c.t0)); const o = {}; for (const k in tgt) o[k] = lerp(s[k], tgt[k], e); return o; }
      break;
    }
    return s;
  }
  function actorTime(t) {
    let ta = t;
    for (const f of (TL.freeze || [])) if (t >= f.t0 && t < f.t0 + f.dur) ta = f.t0;
    return ta;
  }

  // ------------------------------------------------------------------ defs / gradients
  function buildDefs() {
    defs = $('defs', {}, svg);
    const rg = (id, stops) => { const g = $('radialGradient', { id }, defs); stops.forEach((s) => $('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g)); };
    const lg = (id, stops, x2 = 0, y2 = 1) => { const g = $('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach((s) => $('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] === undefined ? 1 : s[2] }, g)); };
    rg('gRed', [[0, '#ff2a38', 0.9], [0.45, '#ff2a38', 0.35], [1, '#ff2a38', 0]]);
    rg('gWhite', [[0, '#ffffff', 1], [1, '#ffffff', 0]]);
    rg('gMoon', [[0, '#c8d2ff', 0.55], [0.4, '#c8d2ff', 0.18], [1, '#c8d2ff', 0]]);
    rg('gFog', [[0, '#8e98c8', 0.34], [1, '#8e98c8', 0]]);
    rg('gFly', [[0, '#ffd65a', 0.85], [1, '#ffd65a', 0]]);
    rg('gVig', [[0.5, '#000', 0], [1, '#02030a', 0.72]]);
    rg('gSoil', [[0, '#3d2a38', 1], [1, '#2a1c28', 1]]);
    lg('gSky', [[0, '#141a33'], [0.6, '#2a3159'], [1, '#4a3d6e']]);
    lg('gGround', [[0, '#2a3159'], [0.18, '#1b2140'], [1, '#0b0e1e']]);
    lg('gCardL', [[0, '#3a1030'], [1, '#14060f']]);
    lg('gCardR', [[0, '#1d2650'], [1, '#0a0e22']]);
    lg('gBgL', [[0, '#240a18'], [1, '#0d0409']]);
    lg('gBgR', [[0, '#101635'], [1, '#05081a']]);
    lg('gLine', [[0, '#c4121f', 0], [0.5, '#ff4a56', 1], [1, '#c4121f', 0]], 1, 0);
    $('clipPath', { id: 'clipRise', clipPathUnits: 'userSpaceOnUse' }, defs).appendChild($('rect', { id: 'clipRiseR', x: -3000, y: -3000, width: 7000, height: 4000 }));
    for (const s of ['L', 'R']) $('clipPath', { id: 'clip' + s }, defs).appendChild($('rect', { x: s === 'L' ? 0 : 540, y: 0, width: 540, height: H }));
  }

  // ------------------------------------------------------------------ arena
  function pine(p, x, base, h, col, tiers = 4) {
    const w = h * 0.34;
    for (let i = 0; i < tiers; i++) { const y1 = base - h * (i / tiers) * 0.8 - h * 0.12, hh = h * 0.45 * (1 - i * 0.12), ww = w * (1 - i * 0.2); $('polygon', { points: `${x - ww},${y1} ${x + ww},${y1} ${x},${y1 - hh}`, fill: col }, p); }
    $('rect', { x: x - 5, y: base - h * 0.14, width: 10, height: h * 0.16, fill: col }, p);
  }
  function buildArena() {
    arena = $('g', {}, svg);
    const L = (name) => (layers[name] = $('g', {}, arena));
    const rng = mulberry(7);
    // sky
    let g = L('sky'); $('rect', { x: -700, y: -900, width: 2500, height: GROUND + 900 + 80, fill: 'url(#gSky)' }, g);
    for (let i = 0; i < 90; i++) $('circle', { cx: -300 + rng() * 1700, cy: -200 + rng() * 800, r: 0.8 + rng() * 1.8, fill: '#dfe4ff', opacity: 0.25 + rng() * 0.6, 'data-tw': rng() * 6 }, g);
    g = L('moon'); $('circle', { cx: 830, cy: 300, r: 190, fill: 'url(#gMoon)' }, g);
    $('circle', { cx: 830, cy: 300, r: 88, fill: '#ece9d6' }, g);
    for (const [dx, dy, r] of [[-28, -22, 16], [24, 18, 22], [-6, 40, 11]]) $('circle', { cx: 830 + dx, cy: 300 + dy, r, fill: '#d6d3c0' }, g);
    // trees
    g = L('far'); for (let x = -420; x < 1500; x += 70 + rng() * 40) pine(g, x, GROUND + 30, 260 + rng() * 150, '#1a2040', 4);
    $('rect', { x: -700, y: GROUND + 20, width: 2500, height: 60, fill: '#1a2040' }, g);
    g = L('near'); for (let x = -450; x < 1550; x += 120 + rng() * 80) pine(g, x, GROUND + 40, 380 + rng() * 220, '#10152b', 5);
    // ground
    g = L('ground'); $('rect', { x: -700, y: GROUND, width: 2500, height: 1500, fill: 'url(#gGround)' }, g);
    $('ellipse', { cx: 540, cy: GROUND + 6, rx: 900, ry: 40, fill: 'url(#gFog)' }, g);
    // props: graves left, wall right, grave hole
    g = L('props');
    const tomb = (x, base, w, h, tilt) => { const t = $('g', { transform: `translate(${x} ${base}) rotate(${tilt})` }, g);
      $('ellipse', { cx: 10, cy: 4, rx: w * 0.75, ry: 12, fill: '#04050e', opacity: 0.55 }, t);
      $('path', { d: `M${-w / 2} 0 L${-w / 2} ${-h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-h + w / 2} L${w / 2} 0Z`, fill: '#48507c' }, t);
      $('path', { d: `M${-w / 2 + 6} 0 L${-w / 2 + 6} ${-h + w / 2} A${w / 2 - 6} ${w / 2 - 6} 0 0 1 ${w / 2 - 14} ${-h + w / 2} L${w / 2 - 14} 0Z`, fill: '#646c98' }, t);
      $('rect', { x: -w * 0.1 - 3, y: -h + w * 0.42, width: 7, height: w * 0.6, fill: '#48507c' }, t); $('rect', { x: -w * 0.28, y: -h + w * 0.6, width: w * 0.42, height: 7, fill: '#48507c' }, t); };
    tomb(40, 980, 90, 140, -5); tomb(330, 960, 80, 120, 6); tomb(470, 1010, 96, 150, -3);
    // ruined wall on right
    const base = 952, brng = mulberry(3), blocks = [[660, 90, 90], [750, 80, 130], [830, 92, 190], [922, 88, 190], [1010, 84, 160], [1094, 80, 110], [1170, 90, 70]];
    for (const [x, w, h] of blocks) {
      const rows = Math.ceil(h / 46);
      for (let r = 0; r < rows; r++) { const y = base - (r + 1) * 46, off = r % 2 ? 22 : 0;
        $('rect', { x: x + off - 3, y: y + 2, width: w - 2, height: 44, rx: 5, fill: brng() > 0.5 ? '#565e88' : '#4a5278' }, g); }
      $('rect', { x: x - 2, y: base - h - 1, width: w - 1, height: 8, rx: 4, fill: '#7a82ae' }, g);
    }
    for (let i = 0; i < 7; i++) $('rect', { x: 620 + brng() * 120 - 20, y: base - 20 - brng() * 14, width: 30 + brng() * 20, height: 24, rx: 5, fill: '#4a5278' }, g);
    $('ellipse', { cx: 900, cy: base + 8, rx: 420, ry: 16, fill: '#04050e', opacity: 0.4 }, g);
    // grave hole (Vrykolakas)
    layers.hole = $('g', {}, arena); $('ellipse', { cx: 170, cy: 1088, rx: 130, ry: 30, fill: '#1c121e' }, layers.hole); $('ellipse', { cx: 170, cy: 1092, rx: 104, ry: 20, fill: '#0b060c' }, layers.hole);
    layers.actors = $('g', {}, arena);
    layers.mound = $('g', {}, arena);
    for (const [x, rx, ry, c] of [[60, 70, 22, '#4a3446'], [286, 74, 22, '#4a3446'], [112, 46, 14, '#5a4056'], [236, 44, 14, '#5a4056']]) $('ellipse', { cx: x, cy: 1096, rx, ry, fill: c }, layers.mound);
    layers.fx = $('g', {}, arena);
    g = L('fog'); const fr = mulberry(21);
    for (let i = 0; i < 9; i++) { const e = $('ellipse', { cx: 0, cy: 1020 + fr() * 330, rx: 260 + fr() * 220, ry: 40 + fr() * 36, fill: 'url(#gFog)', opacity: 0.8 }, g); e.__fog = { x0: fr() * 2400, sp: 8 + fr() * 14 }; }
    layers.flies = L('flies'); for (let i = 0; i < 16; i++) { const e = $('g', {}, layers.flies); $('circle', { r: 26, fill: 'url(#gFly)' }, e); $('circle', { r: 4, fill: '#fff2a8' }, e); e.__f = { x: -100 + fr() * 1280, y: 700 + fr() * 700, ph: fr() * 6 }; }
    layers.gimg = {};
  }
  const PAR = { sky: 0.1, moon: 0.12, far: 0.35, near: 0.6, ground: 1, props: 1, hole: 1, actors: 1, mound: 1, fx: 1, fog: 1.12, flies: 1.2 };
  function updateArena(t, cam, shk) {
    const z = cam.zoom;
    for (const name in PAR) { const p = PAR[name], cx = 540 + (cam.cx - 540) * p, cy = 960 + (cam.cy - 960) * p;
      layers[name].setAttribute('transform', `translate(${f2(540 + shk[0])} ${f2(960 + shk[1])}) scale(${f2(z)}) translate(${f2(-cx)} ${f2(-cy)})`); }
    layers.sky.querySelectorAll('[data-tw]').forEach((c) => c.setAttribute('opacity', 0.35 + 0.35 * Math.sin(t * 1.3 + +c.getAttribute('data-tw'))));
    Array.from(layers.fog.children).forEach((e) => { const f = e.__fog; e.setAttribute('transform', `translate(${f2(((f.x0 + t * f.sp) % 2400) - 600)} 0)`); });
    Array.from(layers.flies.children).forEach((e) => { const f = e.__f; e.setAttribute('transform', `translate(${f2(f.x + 40 * Math.sin(t * 0.5 + f.ph))} ${f2(f.y + 30 * Math.sin(t * 0.7 + f.ph * 2))})`); e.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 2.2 + f.ph)); });
  }

  // ------------------------------------------------------------------ actors
  function setupActors() {
    for (const name in TL.actors) {
      const d = TL.actors[name], rig = RIGS[d.kind](); const wrap = $('g', {}, layers.actors); wrap.appendChild(rig.root);
      d.rig = rig; d.wrap = wrap; d.cues = TL.cues.filter((c) => c.actor === name).sort((a, b) => a.t0 - b.t0);
    }
  }
  function poseFor(d, ta) {
    const cues = d.cues; let idx = -1; for (let i = 0; i < cues.length; i++) if (cues[i].t0 <= ta) idx = i;
    const N = d.rig.N, acts = ACTIONS[d.kind];
    const at = (c) => { const lt = ta - c.t0, dur = Math.max(1e-3, c.t1 - c.t0); const fn = acts[c.action] || acts.idle; return Object.assign({}, N, fn({ t: ta, lt, dur, u: clamp(lt / dur), p: c.params || {} })); };
    if (idx < 0) return Object.assign({}, N, acts.idle({ t: ta, lt: ta, dur: 1, u: 0, p: {} }));
    let P = at(cues[idx]);
    if (idx > 0) { const bl = (cues[idx].params && cues[idx].params.blend) || 0.18, lt = ta - cues[idx].t0; if (lt < bl) P = mixP(at(cues[idx - 1]), P, EASE.smooth(lt / bl)); }
    return P;
  }
  function updateActors(t, ta) {
    for (const name in TL.actors) {
      const d = TL.actors[name], a = d.cues;
      const P = poseFor(d, ta); d.rig.apply(P, ta);
      const x = track(a, 'x', ta, d.x), y = track(a, 'y', ta, d.y, 'y'), sc = track(a, 'scale', ta, d.scale || 1), al = track(a, 'alpha', ta, 1);
      let flip = d.flip || 1; for (const c of a) if (c.t0 <= ta && c.params && c.params.flip !== undefined) flip = c.params.flip;
      d.rig.root.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) scale(${f2(flip * sc)} ${f2(sc)})`);
      d.wrap.setAttribute('opacity', al * (d.visibleFrom !== undefined && t < d.visibleFrom ? 0 : 1));
      let clip = null; for (const c of a) if (c.t0 <= ta && ta <= c.t1 + 0.4 && c.params && c.params.clipY !== undefined) clip = c.params.clipY;
      if (clip !== null) { document.getElementById('clipRiseR').setAttribute('height', clip + 3000); d.wrap.setAttribute('clip-path', 'url(#clipRise)'); } else d.wrap.removeAttribute('clip-path');
      d.pos = { x, y, flip, sc };
    }
    const order = Object.keys(TL.actors).sort((p, q) => (TL.actors[p].z || 0) - (TL.actors[q].z || 0)); order.forEach((n) => layers.actors.appendChild(TL.actors[n].wrap));
  }

  // ------------------------------------------------------------------ fx
  function buildFx() {
    for (const f of (TL.fx || [])) {
      const r = mulberry((f.seed || 1) * 977 + Math.round(f.t0 * 100)); const grp = $('g', { display: 'none' }, layers.fx); const it = { f, grp, parts: [] };
      if (f.type === 'dust') for (let i = 0; i < (f.n || 14); i++) { const e = $('circle', { r: 1, fill: f.color || '#9aa2c8' }, grp); it.parts.push({ e, vx: (r() - 0.5) * (f.spread || 380), vy: -(30 + r() * 90), r0: 14 + r() * 20, r1: 40 + r() * 50, dx: (r() - 0.5) * 120 }); }
      if (f.type === 'soil') for (let i = 0; i < (f.n || 18); i++) { const e = $('rect', { width: 10 + r() * 12, height: 8 + r() * 10, rx: 3, fill: r() > 0.5 ? '#5a4056' : '#3d2a38' }, grp); it.parts.push({ e, vx: (r() - 0.5) * 520, vy: -(300 + r() * 520), rot: (r() - 0.5) * 900 }); }
      if (f.type === 'impact') { it.star = $('polygon', { fill: '#fff' }, grp); it.ring = $('circle', { fill: 'none', stroke: '#ffd9dc', 'stroke-width': 10 }, grp); it.core = $('circle', { fill: 'url(#gWhite)' }, grp);
        for (let i = 0; i < 14; i++) it.parts.push({ e: $('polygon', { fill: i % 3 ? '#fff' : '#ff4a56' }, grp), a: r() * 6.283, l0: 90 + r() * 80, l1: 220 + r() * 260, w: 7 + r() * 8 }); }
      if (f.type === 'speed') for (let i = 0; i < (f.n || 22); i++) it.parts.push({ e: $('polygon', { fill: '#fff' }, grp), a: (i / (f.n || 22)) * 6.283 + r() * 0.2, l0: 160 + r() * 120, l1: 420 + r() * 360, w: 5 + r() * 7 });
      fxList.push(it);
    }
  }
  function updateFx(t) {
    for (const it of fxList) {
      const f = it.f, lt = t - f.t0, dur = f.dur || 1, u = lt / dur;
      if (lt < 0 || u > 1) { it.grp.setAttribute('display', 'none'); continue; }
      it.grp.setAttribute('display', 'inline'); const X = f.x, Y = f.y;
      if (f.type === 'dust') it.parts.forEach((p) => { const e = EASE.outCubic(u); p.e.setAttribute('cx', f2(X + p.dx + p.vx * e)); p.e.setAttribute('cy', f2(Y + p.vy * e * 1.4)); p.e.setAttribute('r', f2(lerp(p.r0, p.r1, e))); p.e.setAttribute('opacity', f2(0.6 * (1 - u))); });
      if (f.type === 'soil') it.parts.forEach((p) => { p.e.setAttribute('transform', `translate(${f2(X + p.vx * lt)} ${f2(Y + p.vy * lt + 1500 * lt * lt)}) rotate(${f2(p.rot * lt)})`); p.e.setAttribute('opacity', clamp(1.4 - u * 1.4)); });
      if (f.type === 'impact') {
        const e = EASE.outCubic(clamp(u * 2.2)), R = (f.r || 150) * (0.4 + e), pts = [];
        for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, rr = i % 2 ? R * 0.45 : R; pts.push(f2(X + Math.cos(a) * rr) + ',' + f2(Y + Math.sin(a) * rr)); }
        it.star.setAttribute('points', pts.join(' ')); it.star.setAttribute('opacity', clamp(1.6 - u * 2));
        it.ring.setAttribute('cx', X); it.ring.setAttribute('cy', Y); it.ring.setAttribute('r', f2(R * 1.4)); it.ring.setAttribute('opacity', clamp(1 - u * 1.2)); it.ring.setAttribute('stroke-width', f2(14 * (1 - u) + 2));
        it.core.setAttribute('cx', X); it.core.setAttribute('cy', Y); it.core.setAttribute('r', f2(R * 1.5)); it.core.setAttribute('opacity', clamp(1.3 - u * 2));
      }
      if (f.type === 'impact' || f.type === 'speed') it.parts.forEach((p) => { const e = EASE.outCubic(clamp(u * 1.6)), a = p.a, d0 = lerp(p.l0, p.l1, e), d1 = d0 + (f.type === 'speed' ? 260 * (1 - u) : 60 + 80 * (1 - u)), ca = Math.cos(a), sa = Math.sin(a);
        const w = p.w * (1 - u); p.e.setAttribute('points', `${f2(X + ca * d0 - sa * w)},${f2(Y + sa * d0 + ca * w)} ${f2(X + ca * d1)},${f2(Y + sa * d1)} ${f2(X + ca * d0 + sa * w)},${f2(Y + sa * d0 - ca * w)}`); p.e.setAttribute('opacity', clamp(1.5 - u * 1.7)); });
    }
  }

  // ------------------------------------------------------------------ split roll intro
  const SIL = '#07080f';
  function decoy(g, k) {
    const eyes = (pts) => pts.forEach(([x, y, r]) => { $('circle', { cx: x, cy: y, r: (r || 7) * 3.2, fill: 'url(#gRed)' }, g); $('circle', { cx: x, cy: y, r: r || 7, fill: '#ff3a44' }, g); });
    const P = (d) => $('path', { d, fill: SIL }, g), E = (cx, cy, rx, ry) => $('ellipse', { cx, cy, rx, ry, fill: SIL }, g), Po = (pts) => $('polygon', { points: pts, fill: SIL }, g);
    switch (k % 7) {
      case 0: P('M-95 160 L-95 -50 Q-95 -190 0 -190 Q95 -190 95 -50 L95 160 L62 124 L31 160 L0 124 L-31 160 L-62 124Z'); eyes([[-32, -80], [32, -80]]); break;
      case 1: E(0, -40, 92, 104); Po('-70,-100 -150,-230 -30,-130'); Po('70,-100 150,-230 30,-130'); E(0, 190, 180, 100); eyes([[-34, -50], [34, -50]]); break;
      case 2: Po('0,-70 -60,-110 -120,-70 -210,-140 -180,10 -120,-14 -64,70 0,100 64,70 120,-14 180,10 210,-140 120,-70 60,-110'); E(0, 0, 40, 70); eyes([[-16, -30, 5], [16, -30, 5]]); break;
      case 3: P('M0 -210 Q-125 -160 -135 0 L-180 210 L180 210 L135 0 Q125 -160 0 -210Z'); eyes([[-30, -60], [30, -60]]); break;
      case 4: E(0, -190, 42, 58); Po('-34,-150 34,-150 56,200 -56,200'); Po('-34,-120 -90,100 -76,106 -20,-90'); Po('34,-120 90,100 76,106 20,-90'); eyes([[-16, -196, 5], [16, -196, 5]]); break;
      case 5: E(0, 50, 84, 68); E(0, -50, 48, 42); for (let i = 0; i < 4; i++) for (const s of [-1, 1]) $('path', { d: `M${s * 60} ${10 + i * 28} L${s * (140 + i * 12)} ${-30 + i * 40} L${s * (170 + i * 8)} ${100 + i * 30}`, stroke: SIL, 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); eyes([[-18, -60, 5], [18, -60, 5], [-8, -42, 4], [8, -42, 4]]); break;
      default: E(0, 20, 100, 110); Po('-90,-30 -70,-190 -20,-80'); Po('90,-30 70,-190 20,-80'); Po('-40,60 40,60 20,190 -20,190'); eyes([[-40, 0], [40, 0]]);
    }
  }
  function buildSplit(cfg) {
    splitG = $('g', {}, svg); S = { cfg, halves: [] };
    $('rect', { x: 0, y: 0, width: W, height: H, fill: '#05060d' }, splitG);
    for (const side of ['L', 'R']) {
      const h = cfg[side === 'L' ? 'left' : 'right'], cx = side === 'L' ? 270 : 810, x0 = side === 'L' ? 0 : 540;
      const hg = $('g', {}, splitG); h.hg = hg; h.cx = cx; h.side = side; h.x0 = x0;
      const clipG = $('g', { 'clip-path': `url(#clip${side})` }, hg);
      $('rect', { x: x0, y: 0, width: 540, height: H, fill: side === 'L' ? 'url(#gBgL)' : 'url(#gBgR)' }, clipG);
      h.streaks = $('g', {}, clipG); for (let i = 0; i < 9; i++) $('rect', { x: x0 + 20 + i * 60, y: 0, width: 4, height: 500, fill: '#fff', opacity: 0 }, h.streaks);
      h.reel = $('g', {}, clipG); h.cards = [];
      const S0 = 700, N = h.N; h.S = S0; const rigsOnly = RIGS[h.kind]; h.rig = rigsOnly(); G.newRig; h.rigObj = h.rig;
      for (let i = -3; i < N; i++) {
        const c = $('g', {}, h.reel); const tgt = i === N - 1;
        $('rect', { x: cx - 224, y: -316, width: 448, height: 632, rx: 34, fill: side === 'L' ? '#3a0f2a' : '#1a2350', transform: `translate(0 0)` }, c).setAttribute('x', -224);
        const inner = $('g', { transform: `translate(${cx} 0)` }, c); c.firstChild.setAttribute('transform', `translate(${cx} 0)`);
        $('rect', { x: -212, y: -304, width: 424, height: 608, rx: 26, fill: side === 'L' ? 'url(#gCardL)' : 'url(#gCardR)' }, inner);
        $('rect', { x: -212, y: -304, width: 424, height: 608, rx: 26, fill: 'none', stroke: side === 'L' ? '#c4121f' : '#5a6ab8', 'stroke-width': 3, opacity: 0.7 }, inner);
        $('ellipse', { cx: 0, cy: 250, rx: 150, ry: 22, fill: '#000', opacity: 0.35 }, inner);
        if (tgt) { const hold = $('g', { transform: `translate(${h.fx || 0} ${h.fy}) scale(${h.fscale})` }, inner); hold.appendChild(h.rig.root); h.target = c; h.hold = hold; G.setSil(h.rig, 1); }
        else decoy($('g', { transform: `translate(0 20) scale(${0.95 + 0.1 * hash(i + 3)})` }, inner), i + (side === 'L' ? 0 : 3));
        c.__i = i; h.cards.push(c);
      }
      h.flash = $('rect', { x: x0, y: 0, width: 540, height: H, fill: '#fff', opacity: 0 }, clipG);
      h.ring = $('circle', { cx, cy: 900, r: 10, fill: 'none', stroke: '#ff5a64', 'stroke-width': 10, opacity: 0 }, hg);
      h.tag = $('g', { opacity: 0 }, hg); $('rect', { x: cx - 150, y: 470, width: 300, height: 62, rx: 31, fill: side === 'L' ? '#c4121f' : '#2a3a8a' }, h.tag);
      h.tagT = $('text', { x: cx, y: 514, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 38, fill: '#fff', 'letter-spacing': 6 }, h.tag); h.tagT.textContent = h.tag_;
      h.name = $('text', { x: cx, y: 1296, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': h.nameSize || 62, fill: '#f2f0ea', opacity: 0, 'letter-spacing': 3 }, hg); h.name.textContent = h.label;
    }
    S.line = $('g', {}, splitG); $('rect', { x: 528, y: 0, width: 24, height: H, fill: 'url(#gLine)' }, S.line); $('rect', { x: 536, y: 0, width: 8, height: H, fill: '#ff6a74' }, S.line); S.line.setAttribute('class', 'divider');
    S.shards = []; const r = mulberry(99); for (let i = 0; i < 16; i++) { const y = (i + 0.5) * H / 16; const e = $('polygon', { points: `0,-${60 + r() * 40} ${12 + r() * 14},0 0,${60 + r() * 40} -${6 + r() * 8},0`, fill: i % 2 ? '#ff4a56' : '#ff9aa2', opacity: 0 }, splitG); S.shards.push({ e, y, vx: (r() - 0.5) * 1600, vy: (r() - 0.5) * 500, rot: (r() - 0.5) * 900 }); }
  }
  function cum(s) { if (s < 0.2) return s * s / 0.4; if (s < 0.45) return 0.1 + (s - 0.2); const w = (s - 0.45) / 0.55; return 0.35 + 0.55 * (1 - Math.pow(1 - w, 3)) / 3; }
  function updateSplit(t) {
    const cfg = S.cfg, sh0 = cfg.shatter;
    splitG.setAttribute('display', t > cfg.end ? 'none' : 'inline'); if (t > cfg.end) return;
    const T0 = 0.15;
    for (const h of [cfg.left, cfg.right]) {
      const lockT = h.lockT, s = clamp((t - T0) / (lockT - T0)), p = cum(s) / 0.5333, M = (h.N - 1) * h.S;
      let bounce = 0, lt = t - lockT; if (lt > 0) bounce = 22 * Math.exp(-lt * 8) * Math.sin(lt * 26);
      for (const c of h.cards) { const y = 900 - c.__i * h.S + p * M + bounce; c.setAttribute('transform', `translate(0 ${f2(y)})`); c.setAttribute('display', y < -420 || y > H + 420 ? 'none' : 'inline'); }
      const v = s >= 1 ? 0 : (cum(Math.min(1, s + 0.01)) - cum(s)) / 0.01 / 0.5333 * M / (lockT - T0);   // px/s
      const sp = clamp(Math.abs(v) / 3500);
      Array.from(h.streaks.children).forEach((e, i) => { e.setAttribute('opacity', 0.16 * sp); e.setAttribute('height', 200 + 500 * sp); e.setAttribute('y', f2(((i * 531 + t * v * 1.1) % (H + 700)) - 600)); });
      // lock reveal
      const rv = clamp(lt / 0.35); setSil(h.rig, lt < 0 ? 1 : 1 - EASE.smooth(rv));
      h.rig.apply(Object.assign({}, h.rig.N, lt < 0 ? ACTIONS[h.kind].idle({ t, lt: 0, dur: 1, u: 0, p: {} }) : ACTIONS[h.kind][h.idle || 'idle']({ t, lt, dur: 99, u: 0, p: {} })), t);
      let shx = 0, shy = 0; if (lt > 0 && lt < 0.5) { const a = 22 * (1 - lt / 0.5); shx = (hash(t * 91) - 0.5) * 2 * a; shy = (hash(t * 57 + 3) - 0.5) * 2 * a; }
      h.flash.setAttribute('opacity', lt > 0 ? 0.85 * Math.max(0, 1 - lt / 0.28) : 0);
      h.ring.setAttribute('opacity', lt > 0 && lt < 0.5 ? 1 - lt / 0.5 : 0); h.ring.setAttribute('r', f2(10 + lt * 1000));
      h.tag.setAttribute('opacity', lt > 0.05 ? 1 : 0); h.name.setAttribute('opacity', lt > 0.12 ? 1 : 0);
      const slam = lt > 0 ? EASE.outBack(clamp(lt / 0.25)) : 0; h.name.setAttribute('transform', `translate(${h.cx} 1280) scale(${f2(0.6 + 0.4 * slam)}) translate(${-h.cx} -1280)`);
      // shatter motion of whole half
      const sd = clamp((t - sh0) / 0.8), dir = h.side === 'L' ? -1 : 1;
      h.hg.setAttribute('transform', `translate(${f2(shx + dir * 260 * EASE.inCubic(sd))} ${f2(shy)}) translate(${h.cx} 900) scale(${f2(1 + 0.35 * EASE.inCubic(sd))}) translate(${-h.cx} -900)`);
      h.hg.setAttribute('opacity', 1 - EASE.smooth(clamp((sd - 0.1) / 0.9)));
    }
    // backdrop + line
    splitG.firstChild.setAttribute('opacity', 1 - EASE.smooth(clamp((t - sh0) / 0.5)));
    const sd = t - sh0, pulse = 0.75 + 0.25 * Math.sin(t * 9);
    S.line.setAttribute('opacity', sd < 0 ? pulse : sd < 0.12 ? 1 : 0);
    const lw = t > cfg.left.lockT ? 1 : 0;
    S.shards.forEach((s) => { if (sd < 0) { s.e.setAttribute('opacity', 0); return; } const u = clamp(sd / 1.0); s.e.setAttribute('opacity', clamp(1 - u * 1.1)); s.e.setAttribute('transform', `translate(${f2(540 + s.vx * sd)} ${f2(s.y + s.vy * sd + 700 * sd * sd)}) rotate(${f2(s.rot * sd)}) scale(${f2(1 + sd * 2)})`); });
  }

  // ------------------------------------------------------------------ text / hud / overlays
  function buildText() {
    for (const tx of (TL.text || [])) { const e = $('text', { x: tx.x, y: tx.y, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': tx.size || 80, fill: tx.color || '#fff', 'letter-spacing': tx.spacing || 2, opacity: 0 }, svg); e.textContent = tx.text;
      const sh = tx.shadow ? $('text', { x: tx.x, y: tx.y, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': tx.size || 80, fill: tx.shadow, 'letter-spacing': tx.spacing || 2, opacity: 0 }, svg) : null; if (sh) { sh.textContent = tx.text; svg.insertBefore(sh, e); }
      textList.push({ tx, e, sh }); }
  }
  function updateText(t) {
    for (const o of textList) { const tx = o.tx, lt = t - tx.t0, vis = lt >= 0 && t <= tx.t1;
      for (const el of [o.e, o.sh]) { if (!el) continue; if (!vis) { el.setAttribute('opacity', 0); continue; }
        let sc = 1, op = 1, dy = 0;
        if (tx.anim === 'slam') { sc = lt < 0.22 ? lerp(3.2, 1, EASE.outBack(clamp(lt / 0.22))) : 1 + 0.015 * Math.sin(lt * 5); op = clamp(lt / 0.05); }
        else { op = clamp(lt / 0.25) * clamp((tx.t1 - t) / 0.25); }
        const ox = el === o.sh ? (tx.shadowDx || 10) : 0, oy = el === o.sh ? (tx.shadowDy || 12) : 0;
        el.setAttribute('opacity', op); el.setAttribute('transform', `translate(${tx.x + ox} ${tx.y + oy - (tx.size || 80) * 0.35 + dy}) scale(${f2(sc)}) translate(${-tx.x} ${-(tx.y - (tx.size || 80) * 0.35)})`); } }
  }
  function updateOverlay(t) {
    let fl = 0, fc = '#fff'; for (const f of (TL.flash || [])) { const lt = t - f.t0; if (lt >= 0 && lt < f.dur) { const a = (f.amp || 1) * (1 - lt / f.dur); if (a > fl) { fl = a; fc = f.color || '#fff'; } } }
    flashEl.setAttribute('opacity', fl); flashEl.setAttribute('fill', fc);
  }
  function shakeAt(t) {
    let dx = 0, dy = 0; const fr = Math.floor(t * 30);
    for (const s of (TL.shake || [])) { const lt = t - s.t0; if (lt >= 0 && lt < s.dur) { const a = (s.amp || 20) * Math.pow(1 - lt / s.dur, 1.5); dx += (hash(fr * 1.37 + 1) - 0.5) * 2 * a; dy += (hash(fr * 2.11 + 7) - 0.5) * 2 * a * 0.8; } }
    return [dx, dy];
  }
  function buildHud() {
    const h = TL.hud; if (!h) return; hud = { cfg: h, g: $('g', {}, svg) };
    const bar = (x, col, side) => { const g = $('g', {}, hud.g); $('rect', { x, y: 70, width: 440, height: 26, rx: 13, fill: '#0a0c1c', opacity: 0.8 }, g); const f = $('rect', { x, y: 74, width: 432, height: 18, rx: 9, fill: col }, g); const l = $('text', { x: side < 0 ? x : x + 440, y: 64, 'text-anchor': side < 0 ? 'start' : 'end', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 26, fill: '#e8e6f0', 'letter-spacing': 3 }, g); return { f, l, x, side }; };
    hud.L = bar(50, '#c4121f', -1); hud.R = bar(590, '#4a68d8', 1); hud.L.l.textContent = h.leftLabel || 'MONSTER'; hud.R.l.textContent = h.rightLabel || 'GUARDIAN';
  }
  function updateHud(t) {
    if (!hud) return; const c = hud.cfg; hud.g.setAttribute('display', t >= c.t0 && t <= c.t1 ? 'inline' : 'none');
    const val = (k) => { let v = c[k + 'Init'] === undefined ? 1 : c[k + 'Init']; for (const s of (c[k] || [])) { if (t >= s.t1) v = s.v; else if (t >= s.t0) { v = lerp(v, s.v, EASE.outCubic((t - s.t0) / (s.t1 - s.t0))); break; } else break; } return v; };
    const l = val('left'), r = val('right'); hud.L.f.setAttribute('width', f2(432 * l)); hud.R.f.setAttribute('width', f2(432 * r)); hud.R.f.setAttribute('x', f2(hud.R.x + 4 + 432 * (1 - r)));
  }

  // ------------------------------------------------------------------ public API
  G.loadTimeline = function (tl) {
    TL = tl; document.body.innerHTML = ''; svg = $('svg', { xmlns: NS_, width: W, height: H, viewBox: `0 0 ${W} ${H}` }); document.body.appendChild(svg);
    buildDefs(); buildArena(); setupActors(); buildFx();
    if (TL.split) buildSplit(TL.split);
    buildText(); buildHud();
    $('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#gVig)' }, svg); vigEl = svg.lastChild;
    flashEl = $('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff', opacity: 0 }, svg);
    svg.appendChild(vigEl); if (splitG) { /* split above arena, below overlays */ }
    if (hud) svg.appendChild(hud.g); textList.forEach((o) => { if (o.sh) svg.appendChild(o.sh); svg.appendChild(o.e); }); svg.appendChild(flashEl);
    G.renderFrame(0);
  };
  const NS_ = G.NS;
  G.renderFrame = function (t) {
    const ta = actorTime(t);
    const cam = stateTrack(TL.cam || [], t, TL.camInit || { cx: 540, cy: 960, zoom: 1 });
    const shk = shakeAt(t);
    const arenaOn = !TL.split || t >= TL.split.shatter - 0.05;
    arena.setAttribute('display', arenaOn ? 'inline' : 'none');
    if (arenaOn) {
      arena.setAttribute('opacity', TL.split ? EASE.smooth(clamp((t - TL.split.shatter + 0.05) / 0.5)) : 1);
      updateArena(t, cam, shk); updateActors(t, ta); updateFx(t);
    }
    if (TL.split) updateSplit(t);
    updateText(t); updateHud(t); updateOverlay(t);
    return true;
  };
  G.ANIM_READY = true;
})(window);
