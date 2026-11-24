// stage.js v2 - scenes (forest / graveyard / room / church), props, camera, fx, split-roll (x N instances), text, HUD, timeline eval.
// window.loadTimeline(tl) then window.renderFrame(t).  See README.md for the timeline format.
(function (G) {
  const { $, clamp, lerp, ease, EASE, mulberry, rgb, mixc, hash, f2, ACTIONS, RIGS, setSil } = G;
  const W = 1080, H = 1920, GROUND = 880;
  let TL = null, svg, defs, arena, layers = {}, fxList = [], textList = [], flashEl, tintEl, blackEl, glitchG, vigEl, splits = [], hud = null, props = [], room = {}, scenesCache = null;

  // ------------------------------------------------------------------ helpers
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
  function stateTrack(list, ta, init) {
    let s = Object.assign({}, init);
    for (const c of list) {
      const tgt = {}; for (const k of ['cx', 'cy', 'zoom']) tgt[k] = c[k] === undefined ? s[k] : c[k];
      if (ta >= c.t1) { s = tgt; continue; }
      if (ta >= c.t0) { const e = ease(c.ease || 'inOut', (ta - c.t0) / (c.t1 - c.t0 || 1e-3)); const o = {}; for (const k in tgt) o[k] = lerp(s[k], tgt[k], e); return o; }
      break;
    }
    return s;
  }
  function numTrack(list, t, init) {     // [{t0,t1,v,ease}] sequential tweens (t1==t0 => step)
    let v = init;
    for (const s of (list || [])) {
      if (t >= s.t1) { v = s.v; continue; }
      if (t >= s.t0) return lerp(v, s.v, ease(s.ease || 'inOut', (t - s.t0) / (s.t1 - s.t0 || 1e-3)));
      break;
    }
    return v;
  }
  const trk = (name, t, init = 0) => numTrack(TL.tracks && TL.tracks[name], t, init);
  const inWin = (wins, t) => { if (!wins) return true; for (const w of wins) if (t >= w[0] && t < w[1]) return true; return false; };
  function ampAt(name, t) {
    const V = name && TL.voices && TL.voices[name]; if (!V) return 0;
    if (V.v) { const x = t * V.fps, i = Math.floor(x); if (i < 0 || i >= V.v.length - 1) return 0; return clamp(lerp(V.v[i], V.v[i + 1], x - i) * (V.gain || 1)); }
    for (const w of (V.words || [])) if (t >= w[0] && t <= w[1]) { const e = Math.min(clamp((t - w[0]) / 0.05), clamp((w[1] - t) / 0.07)); return clamp((0.45 + 0.55 * Math.abs(Math.sin(t * 17 + w[0] * 9))) * e); }
    return 0;
  }
  function actorTime(t) {
    let ta = t; for (const f of (TL.freeze || [])) if (t >= f.t0 && t < f.t0 + f.dur) ta = f.t0;
    for (const w of (TL.slow || [])) {            // slow-mo: actor time lags inside [t0,t1], then catches up smoothly (exp decay)
      const L = (1 - w.rate) * (w.t1 - w.t0);
      if (t >= w.t0 && t < w.t1) ta -= (1 - w.rate) * (t - w.t0); else if (t >= w.t1) ta -= L * Math.exp(-(t - w.t1) * 7);
    }
    return ta;
  }

  // ------------------------------------------------------------------ defs
  function buildDefs() {
    defs = $('defs', {}, svg);
    const rg = (id, stops) => { const g = $('radialGradient', { id }, defs); stops.forEach((s) => $('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g)); };
    const lg = (id, stops, x2 = 0, y2 = 1) => { const g = $('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach((s) => $('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] === undefined ? 1 : s[2] }, g)); };
    rg('gRed', [[0, '#ff2a38', 0.9], [0.45, '#ff2a38', 0.35], [1, '#ff2a38', 0]]);
    rg('gWhite', [[0, '#ffffff', 1], [1, '#ffffff', 0]]);
    rg('gSmoke', [[0, '#e8ecf6', 0.75], [1, '#e8ecf6', 0]]);
    rg('gGold', [[0, '#ffe39a', 0.95], [0.5, '#ffd070', 0.35], [1, '#ffd070', 0]]);
    rg('gMoon', [[0, '#c8d2ff', 0.55], [0.4, '#c8d2ff', 0.18], [1, '#c8d2ff', 0]]);
    rg('gFog', [[0, '#8e98c8', 0.34], [1, '#8e98c8', 0]]);
    rg('gFly', [[0, '#ffd65a', 0.85], [1, '#ffd65a', 0]]);
    rg('gVig', [[0.5, '#000', 0], [1, '#02030a', 0.72]]);
    rg('gRing', [[0, '#ff2a38', 0], [0.7, '#ff2a38', 0.0], [0.86, '#ff2a38', 0.5], [1, '#ff2a38', 0]]);
    rg('gRingFill', [[0, '#c4121f', 0.0], [0.6, '#c4121f', 0.12], [1, '#c4121f', 0.32]]);
    lg('gSky', [[0, '#141a33'], [0.6, '#2a3159'], [1, '#4a3d6e']]);
    lg('gDawn', [[0, '#3a3a78'], [0.5, '#c0627a'], [1, '#ffb070']]);
    lg('gGround', [[0, '#2a3159'], [0.18, '#1b2140'], [1, '#0b0e1e']]);
    lg('gCardL', [[0, '#4a0f22'], [1, '#14060d']]);
    lg('gCardR', [[0, '#34447e'], [1, '#0c1230']]);
    lg('gBgL', [[0, '#2c0a14'], [1, '#0d0307']]);
    lg('gBgR', [[0, '#1c2a62'], [1, '#080d28']]);
    lg('gLine', [[0, '#c4121f', 0], [0.5, '#ff4a56', 1], [1, '#c4121f', 0]], 1, 0);
    lg('gLimit', [[0, '#ff2a38', 0], [1, '#ff2a38', 0.85]]);
    lg('gBeam', [[0, '#fff3b0', 0.55], [1, '#fff3b0', 0]]);
    lg('gWindow', [[0, '#1b2a66'], [1, '#34457f']]);
    lg('gFloor', [[0, '#2c2030'], [1, '#120c18']]);
    lg('gRoomWall', [[0, '#1f2650'], [1, '#2c3566']]);
    lg('gEarth', [[0, '#1c1424'], [1, '#08060c']]);
    $('clipPath', { id: 'clipRise', clipPathUnits: 'userSpaceOnUse' }, defs).appendChild($('rect', { id: 'clipRiseR', x: -3000, y: -3000, width: 9000, height: 4000 }));
    for (const s of ['L', 'R']) $('clipPath', { id: 'clip' + s }, defs).appendChild($('rect', { x: s === 'L' ? 0 : 540, y: 0, width: 540, height: H }));
  }

  // ------------------------------------------------------------------ arena (forest / graveyard / dawn)
  function pine(p, x, base, h, col, tiers = 4) {
    const w = h * 0.34;
    for (let i = 0; i < tiers; i++) { const y1 = base - h * (i / tiers) * 0.8 - h * 0.12, hh = h * 0.45 * (1 - i * 0.12), ww = w * (1 - i * 0.2); $('polygon', { points: `${x - ww},${y1} ${x + ww},${y1} ${x},${y1 - hh}`, fill: col }, p); }
    $('rect', { x: x - 5, y: base - h * 0.14, width: 10, height: h * 0.16, fill: col }, p);
  }
  function stoneWall(g, blocks, base, seed) {
    const brng = mulberry(seed);
    for (const [x, w, h] of blocks) {
      const rows = Math.ceil(h / 46);
      for (let r = 0; r < rows; r++) { const y = base - (r + 1) * 46, off = r % 2 ? 22 : 0; $('rect', { x: x + off - 3, y: y + 2, width: w - 2, height: 44, rx: 5, fill: brng() > 0.5 ? '#565e88' : '#4a5278' }, g); }
      $('rect', { x: x - 2, y: base - h - 1, width: w - 1, height: 8, rx: 4, fill: '#7a82ae' }, g);
    }
  }
  function tombShape(parent, w, h, glow) {
    const g = $('g', {}, parent);
    $('ellipse', { cx: 10, cy: 4, rx: w * 0.75, ry: 12, fill: '#04050e', opacity: 0.55 }, g);
    $('path', { d: `M${-w / 2} 0 L${-w / 2} ${-h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-h + w / 2} L${w / 2} 0Z`, fill: '#48507c' }, g);
    $('path', { d: `M${-w / 2 + 6} 0 L${-w / 2 + 6} ${-h + w / 2} A${w / 2 - 6} ${w / 2 - 6} 0 0 1 ${w / 2 - 14} ${-h + w / 2} L${w / 2 - 14} 0Z`, fill: '#646c98' }, g);
    for (const [mx, my, rr] of [[-w * 0.3, -h * 0.2, 16], [w * 0.2, -h * 0.5, 11], [-w * 0.1, -h * 0.05, 14]]) $('ellipse', { cx: mx, cy: my, rx: rr, ry: rr * 0.6, fill: '#3f5a52', opacity: 0.8 }, g);   // moss
    return g;
  }
  function buildArena() {
    arena = $('g', {}, svg);
    const L = (name) => (layers[name] = $('g', {}, arena));
    const rng = mulberry(7);
    let g = L('sky'); $('rect', { x: -900, y: -900, width: 3600, height: GROUND + 900 + 80, fill: 'url(#gSky)' }, g);
    for (let i = 0; i < 120; i++) $('circle', { cx: -400 + rng() * 2400, cy: -200 + rng() * 800, r: 0.8 + rng() * 1.8, fill: '#dfe4ff', opacity: 0.25 + rng() * 0.6, 'data-tw': rng() * 6 }, g);
    layers.dawnRect = $('rect', { x: -900, y: -900, width: 3600, height: GROUND + 900 + 80, fill: 'url(#gDawn)', opacity: 0 }, g);
    g = L('moon'); $('circle', { cx: 830, cy: 300, r: 190, fill: 'url(#gMoon)' }, g); $('circle', { cx: 830, cy: 300, r: 88, fill: '#ece9d6' }, g);
    for (const [dx, dy, r] of [[-28, -22, 16], [24, 18, 22], [-6, 40, 11]]) $('circle', { cx: 830 + dx, cy: 300 + dy, r, fill: '#d6d3c0' }, g);
    // church tower (dawn)
    g = L('tower'); const tw = $('g', { transform: 'translate(1180 880)' }, g);
    $('rect', { x: -46, y: -330, width: 92, height: 330, fill: '#2a2f58' }, tw); $('polygon', { points: '-60,-330 60,-330 0,-470', fill: '#1f2347' }, tw); $('rect', { x: -4, y: -520, width: 8, height: 60, fill: '#1f2347' }, tw); $('rect', { x: -22, y: -508, width: 44, height: 7, fill: '#1f2347' }, tw);
    $('path', { d: 'M-18 -250 L-18 -290 A18 18 0 0 1 18 -290 L18 -250Z', fill: '#0c0f24' }, tw);
    layers.bell = $('g', {}, tw); $('path', { d: 'M-12 -262 Q-12 -290 0 -292 Q12 -290 12 -262Z', fill: '#d9a441' }, layers.bell); layers.bell.setAttribute('transform', 'translate(0 -292)');
    g = L('far'); for (let x = -700; x < 2100; x += 70 + rng() * 40) pine(g, x, GROUND + 30, 260 + rng() * 150, '#1a2040', 4); $('rect', { x: -900, y: GROUND + 20, width: 3600, height: 60, fill: '#1a2040' }, g);
    g = L('near'); for (let x = -750; x < 2150; x += 120 + rng() * 80) pine(g, x, GROUND + 40, 380 + rng() * 220, '#10152b', 5);
    g = L('ftrees'); const fr0 = mulberry(31);
    for (let x = -600; x < 2000; x += 140 + fr0() * 120) { const w = 50 + fr0() * 50, h = 1100 + fr0() * 300; $('rect', { x: x - w / 2, y: GROUND + 140 - h, width: w, height: h, fill: '#0b0e20' }, g); $('polygon', { points: `${x - w / 2 - 20},${GROUND + 140} ${x + w / 2 + 20},${GROUND + 140} ${x + w / 2},${GROUND + 70} ${x - w / 2},${GROUND + 70}`, fill: '#0b0e20' }, g); for (let b = 0; b < 3; b++) { const by = GROUND + 140 - h * (0.45 + b * 0.18), dir = b % 2 ? 1 : -1; $('polygon', { points: `${x},${by} ${x + dir * 160},${by - 70} ${x + dir * 170},${by - 52} ${x},${by + 22}`, fill: '#0b0e20' }, g); } }
    for (let x = -600; x < 2000; x += 90 + fr0() * 90) { const rr = 40 + fr0() * 50; $('ellipse', { cx: x, cy: GROUND + 150, rx: rr * 1.8, ry: rr, fill: '#0d1128' }, g); }
    g = L('ground'); $('rect', { x: -900, y: GROUND, width: 3600, height: 1500, fill: 'url(#gGround)' }, g); $('ellipse', { cx: 540, cy: GROUND + 6, rx: 1500, ry: 40, fill: 'url(#gFog)' }, g);
    // props of the graveyard (static)
    g = L('props');
    const tomb = (x, base, w, h, tilt) => { const t = $('g', { transform: `translate(${x} ${base}) rotate(${tilt})` }, g); tombShape(t, w, h); $('rect', { x: -w * 0.1 - 3, y: -h + w * 0.42, width: 7, height: w * 0.6, fill: '#48507c' }, t); $('rect', { x: -w * 0.28, y: -h + w * 0.6, width: w * 0.42, height: 7, fill: '#48507c' }, t); };
    tomb(-60, 960, 80, 125, -6); tomb(60, 975, 70, 110, 5); tomb(380, 960, 80, 120, 6); tomb(520, 985, 76, 105, -4); tomb(660, 962, 70, 100, 3);
    stoneWall(g, [[860, 80, 90], [940, 80, 40], [1000, 84, 110]], 985, 5);          // low fragment (gap near x=920 where wild garlic grows)
    stoneWall(g, [[1040, 90, 120], [1130, 84, 150], [1214, 92, 210], [1306, 88, 210], [1394, 84, 170], [1478, 80, 120], [1560, 90, 100], [1650, 90, 90], [1740, 90, 90]], 1010, 3);
    $('ellipse', { cx: 1400, cy: 1018, rx: 520, ry: 16, fill: '#04050e', opacity: 0.4 }, g);
    layers.hole = $('g', {}, arena);
    const HX = TL.holeX || 130;
    layers.holeBack = $('ellipse', { cx: HX, cy: 1088, rx: 130, ry: 30, fill: '#1c121e' }, layers.hole); $('ellipse', { cx: HX, cy: 1092, rx: 104, ry: 20, fill: '#0b060c' }, layers.hole);
    layers.holeFill = $('ellipse', { cx: HX, cy: 1090, rx: 118, ry: 26, fill: '#4a3446', opacity: 0 }, layers.hole);
    layers.actors = $('g', {}, arena);
    layers.mound = $('g', {}, arena);
    layers.moundEls = [[-40, 70, 22, '#4a3446'], [186, 74, 22, '#4a3446'], [12, 46, 14, '#5a4056'], [136, 44, 14, '#5a4056']].map(([dx, rx, ry, c]) => $('ellipse', { cx: HX + dx, cy: 1096, rx, ry, fill: c }, layers.mound));
    layers.fx = $('g', {}, arena);
    g = L('fog'); const fr = mulberry(21);
    for (let i = 0; i < 12; i++) { const e = $('ellipse', { cx: 0, cy: 1020 + fr() * 330, rx: 260 + fr() * 220, ry: 40 + fr() * 36, fill: 'url(#gFog)', opacity: 0.8 }, g); e.__fog = { x0: fr() * 3200, sp: 8 + fr() * 14 }; }
    layers.flies = L('flies'); for (let i = 0; i < 22; i++) { const e = $('g', {}, layers.flies); $('circle', { r: 26, fill: 'url(#gFly)' }, e); $('circle', { r: 4, fill: '#fff2a8' }, e); e.__f = { x: -100 + fr() * 1700, y: 600 + fr() * 800, ph: fr() * 6 }; }
    buildRoom(); buildChurch(); arena.insertBefore(layers.room, arena.firstChild); arena.insertBefore(layers.church, arena.firstChild);
  }
  const PAR = { sky: 0.1, moon: 0.12, tower: 0.45, far: 0.35, near: 0.6, ftrees: 0.9, ground: 1, props: 1, hole: 1, actors: 1, mound: 1, fx: 1, fog: 1.12, flies: 1.2, room: 1, church: 0 };

  function buildRoom() {
    const g = layers.room = $('g', {}, arena);
    $('rect', { x: -400, y: -300, width: 1900, height: 1450, fill: 'url(#gRoomWall)' }, g);
    for (let x = -400; x < 1500; x += 90) $('rect', { x, y: -300, width: 44, height: 1450, fill: '#fff', opacity: 0.03 }, g);
    $('rect', { x: -400, y: 1020, width: 1900, height: 14, fill: '#10142e' }, g);
    $('rect', { x: -400, y: 1034, width: 1900, height: 900, fill: 'url(#gFloor)' }, g);
    for (let x = -400; x < 1500; x += 120) $('rect', { x, y: 1034, width: 3, height: 900, fill: '#000', opacity: 0.25 }, g);
    // window with moon
    const w = $('g', { transform: 'translate(120 330)' }, g);
    $('polygon', { points: '40,300 300,300 560,900 -120,900', fill: '#9fb4ff', opacity: 0.07 }, w);
    $('rect', { x: -14, y: -14, width: 288, height: 388, rx: 8, fill: '#4a3446' }, w); $('rect', { x: 0, y: 0, width: 260, height: 360, fill: 'url(#gWindow)' }, w);
    $('circle', { cx: 150, cy: 110, r: 110, fill: 'url(#gMoon)' }, w); $('circle', { cx: 150, cy: 110, r: 52, fill: '#ece9d6' }, w);
    for (let i = 0; i < 14; i++) $('circle', { cx: 20 + (i * 53) % 230, cy: 20 + (i * 97) % 300, r: 1.6, fill: '#dfe4ff', opacity: 0.7 }, w);
    $('rect', { x: 124, y: 0, width: 12, height: 360, fill: '#4a3446' }, w); $('rect', { x: 0, y: 174, width: 260, height: 12, fill: '#4a3446' }, w); $('rect', { x: -26, y: 372, width: 312, height: 18, rx: 6, fill: '#5a4056' }, w);
    // door
    room.door = $('g', {}, g); const d = room.door; room.doorBase = [860, 1034];
    $('rect', { x: 0, y: -640, width: 250, height: 640, fill: '#2a1c28' }, d);
    for (let i = 0; i < 5; i++) $('rect', { x: 8 + i * 48, y: -632, width: 44, height: 624, rx: 3, fill: i % 2 ? '#5a4056' : '#523a4e' }, d);
    $('rect', { x: 8, y: -340, width: 234, height: 12, fill: '#3a2838' }, d); $('rect', { x: 8, y: -560, width: 234, height: 12, fill: '#3a2838' }, d);
    $('circle', { cx: 212, cy: -300, r: 13, fill: '#d9a441' }, d);
    $('rect', { x: 8, y: -4, width: 234, height: 4, fill: '#ffd98a', opacity: 0.22 }, d);    // faint light under the door
    // bed
    const b = $('g', {}, g);
    $('rect', { x: 120, y: 960, width: 760, height: 120, rx: 14, fill: '#3a2838' }, b); $('rect', { x: 100, y: 780, width: 60, height: 300, rx: 12, fill: '#4a3446' }, b);
    $('rect', { x: 150, y: 1000, width: 700, height: 56, rx: 10, fill: '#cdd2e6' }, b);                   // mattress
    $('ellipse', { cx: 250, cy: 986, rx: 100, ry: 28, fill: '#e6e9f5' }, b);                              // pillow
    $('rect', { x: 830, y: 1030, width: 40, height: 80, fill: '#2a1c28' }, b); $('rect', { x: 120, y: 1060, width: 40, height: 60, fill: '#2a1c28' }, b);
    // blanket (front, over the kid)
    room.blanket = $('g', {}, layers.actors); room.blanket.__z = 2.5;
    $('path', { d: 'M300 940 Q420 908 560 930 Q720 950 880 960 L880 1040 Q700 1056 520 1052 Q380 1056 300 1040Z', fill: '#c4121f' }, room.blanket);
    $('path', { d: 'M300 940 Q420 908 560 930 Q720 950 880 960 L880 972 Q700 962 560 944 Q420 924 300 952Z', fill: '#e8404d' }, room.blanket);
    for (const x of [420, 540, 660, 780]) $('path', { d: `M${x} 950 Q${x + 12} 990 ${x} 1040`, stroke: '#8a0d18', 'stroke-width': 4, fill: 'none', opacity: 0.6 }, room.blanket);
  }
  function buildChurch() {
    const g = layers.church = $('g', {}, arena); $('rect', { x: -200, y: -200, width: 1500, height: 2400, fill: 'url(#gEarth)' }, g);
    const rr = mulberry(12);
    for (let r = 0; r < 4; r++) for (let x = -60 + (r % 2) * 60; x < 1200; x += 180) $('rect', { x, y: 380 + r * 90, width: 172, height: 82, rx: 8, fill: r % 2 ? '#4a4258' : '#3c3550' }, g);
    $('rect', { x: -200, y: 380, width: 1500, height: 360, fill: '#000', opacity: 0.18 }, g);
    $('rect', { x: -200, y: 740, width: 1500, height: 1200, fill: '#120c18' }, g);
    for (let i = 0; i < 40; i++) $('circle', { cx: rr() * 1100, cy: 760 + rr() * 900, r: 3 + rr() * 8, fill: '#2a1c28' }, g);
    for (let i = 0; i < 5; i++) $('polygon', { points: `${100 + i * 220},380 ${140 + i * 220},380 ${300 + i * 220 - 100},1000 ${100 + i * 220 - 120},1000`, fill: '#ffd98a', opacity: 0.04 }, g);
    // buried dog (curled)
    const d = $('g', { transform: 'translate(540 1200)' }, g);
    $('ellipse', { cx: 0, cy: 0, rx: 260, ry: 130, fill: '#06060e' }, d); $('ellipse', { cx: -20, cy: -30, rx: 240, ry: 100, fill: '#101226' }, d);
    $('polygon', { points: '-200,-20 -300,-120 -250,40', fill: '#06060e' }, d); $('ellipse', { cx: 190, cy: 40, rx: 110, ry: 80, fill: '#101226' }, d);
    $('polygon', { points: '140,-20 170,-100 210,-30', fill: '#101226' }, d); $('polygon', { points: '210,-26 250,-90 270,-10', fill: '#101226' }, d);
    $('rect', { x: 250, y: 40, width: 120, height: 40, rx: 20, fill: '#101226' }, d);
    layers.dogEye = $('g', {}, d); $('circle', { cx: 260, cy: 30, r: 52, fill: 'url(#gRed)' }, layers.dogEye); $('ellipse', { cx: 260, cy: 30, rx: 18, ry: 12, fill: '#ff3838' }, layers.dogEye);
    layers.dogEyeLid = $('rect', { x: 240, y: 14, width: 44, height: 32, fill: '#101226' }, d);
  }

  const SCN_VIS = { forest: ['sky', 'moon', 'far', 'near', 'ground', 'ftrees', 'actors', 'fx', 'fog', 'flies'], grave: ['sky', 'moon', 'far', 'near', 'ground', 'props', 'hole', 'actors', 'mound', 'fx', 'fog', 'flies', 'tower'], room: ['room', 'actors', 'fx'], church: ['church'], void: [] };
  const sceneAt = (t) => { let sc = 'grave'; for (const s of (TL.scenes || [])) if (t >= s.t0) sc = s.s; return sc; };
  function sceneVis(t) { const sc = sceneAt(t), vis = SCN_VIS[sc]; for (const name in PAR) layers[name].setAttribute('display', vis.includes(name) ? 'inline' : 'none'); if (room.blanket) room.blanket.setAttribute('display', sc === 'room' ? 'inline' : 'none'); return sc; }
  function updateScene(t, cam, shk, ta = t) {
    let sc = sceneAt(t);
    const vis = { forest: ['sky', 'moon', 'far', 'near', 'ground', 'ftrees', 'actors', 'fx', 'fog', 'flies'], grave: ['sky', 'moon', 'far', 'near', 'ground', 'props', 'hole', 'actors', 'mound', 'fx', 'fog', 'flies', 'tower'], room: ['room', 'actors', 'fx'], church: ['church'], void: [] }[sc];
    const dawn = trk('dawn', t, 0);
    for (const name in PAR) {
      const l = layers[name]; l.setAttribute('display', vis.includes(name) ? 'inline' : 'none'); if (!vis.includes(name)) continue;
      const p = PAR[name], cx = 540 + (cam.cx - 540) * p, cy = 960 + (cam.cy - 960) * p, z = name === 'church' ? 1 : cam.zoom;
      l.setAttribute('transform', `translate(${f2(540 + shk[0])} ${f2(960 + shk[1])}) rotate(${f2(cam.rot || 0)}) scale(${f2(z)} ${f2(z * (cam.sy || 1))}) translate(${f2(-cx)} ${f2(-cy)})`);
    }
    layers.dawnRect.setAttribute('opacity', dawn);
    layers.moon.setAttribute('opacity', 1 - 0.8 * dawn); layers.flies.setAttribute('opacity', 1 - dawn);
    layers.tower.setAttribute('opacity', clamp(dawn * 1.4));
    layers.bell.setAttribute('transform', `translate(0 -292) rotate(${f2(24 * Math.sin(t * 6) * clamp(dawn * 3) * trk('bells', t, 0))})`);
    if (sc === 'forest' || sc === 'grave') {
      layers.sky.querySelectorAll('[data-tw]').forEach((c) => c.setAttribute('opacity', (0.35 + 0.35 * Math.sin(t * 1.3 + +c.getAttribute('data-tw'))) * (1 - dawn)));
      Array.from(layers.fog.children).forEach((e) => { const f = e.__fog; e.setAttribute('transform', `translate(${f2(((f.x0 + ta * f.sp * (1 + 2 * dawn)) % 3200) - 900)} 0)`); e.setAttribute('opacity', 0.8 * (1 - 0.6 * dawn)); });
      Array.from(layers.flies.children).forEach((e) => { const f = e.__f; e.setAttribute('transform', `translate(${f2(f.x + 40 * Math.sin(ta * 0.5 + f.ph))} ${f2(f.y + 30 * Math.sin(ta * 0.7 + f.ph * 2))})`); e.setAttribute('opacity', 0.5 + 0.5 * Math.sin(ta * 2.2 + f.ph)); });
      const fill = trk('grave', t, 0); layers.holeFill.setAttribute('opacity', fill);
      const wob = trk('soil', t, 0); layers.moundEls.forEach((e, i) => e.setAttribute('transform', `translate(0 ${f2(-wob * (4 + (i % 2) * 5) * Math.abs(Math.sin(t * 7 + i)))})`));
    }
    if (room.blanket) room.blanket.setAttribute('display', sc === 'room' ? 'inline' : 'none');
    if (sc === 'room') {
      const kn = (TL.knocks || []).reduce((a, k) => (t >= k && t - k < 0.5 ? Math.max(a, 1 - (t - k) / 0.5) : a), 0);
      room.door.setAttribute('transform', `translate(${f2(room.doorBase[0] + 3 * kn * Math.sin(t * 90))} ${room.doorBase[1]})`);
      room.blanket.setAttribute('transform', `translate(${f2(trk('blanket', t, 0))} ${f2(trk('blanketY', t, 0))}) rotate(${f2(trk('blanketR', t, 0))} 600 1000)`);
    }
    if (sc === 'church') { const o = trk('dogEye', t, 0); layers.dogEyeLid.setAttribute('height', f2(32 * (1 - o))); layers.dogEye.setAttribute('opacity', clamp(o * 1.2)); }
    return sc;
  }

  // ------------------------------------------------------------------ props
  function buildProps() {
    for (const p of (TL.props || [])) {
      const g = $('g', {}, layers.actors); g.__z = p.z === undefined ? 1 : p.z; const o = { p, g };
      if (p.type === 'tomb') { const body = tombShape(g, 130, 190); $('rect', { x: -14, y: -190 + 54, width: 8, height: 38, fill: '#48507c' }, body); $('rect', { x: -32, y: -190 + 72, width: 40, height: 7, fill: '#48507c' }, body); o.glow = $('g', { opacity: 0 }, g); ['ONLY', 'FIRE', 'ENDS IT'].forEach((s, i) => { const tt = $('text', { x: 0, y: -96 + i * 26, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 22, fill: '#ff4a56', 'letter-spacing': 2 }, o.glow); tt.textContent = s; }); $('ellipse', { cx: 0, cy: -70, rx: 90, ry: 70, fill: 'url(#gRed)' }, o.glow); o.glow.insertBefore(o.glow.lastChild, o.glow.firstChild); }
      if (p.type === 'garlic') { o.sway = []; const r = mulberry(5); for (let i = 0; i < 9; i++) { const s = $('g', {}, g); const a = -50 + i * 12; $('path', { d: `M0 0 Q${6 + i} -40 ${(i - 4) * 9} -${70 + r() * 40}`, stroke: '#3f7a52', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, s); o.sway.push([s, i]); } for (let i = 0; i < 7; i++) { const fx = (i - 3) * 14, fy = -80 - r() * 40; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; $('ellipse', { cx: fx + Math.cos(a) * 9, cy: fy + Math.sin(a) * 9, rx: 7, ry: 4, fill: '#f4f1e6', transform: `rotate(${a * 57.3} ${fx + Math.cos(a) * 9} ${fy + Math.sin(a) * 9})` }, g); } $('circle', { cx: fx, cy: fy, r: 5, fill: '#ffe58a' }, g); } $('ellipse', { cx: 0, cy: 4, rx: 60, ry: 10, fill: '#04050e', opacity: 0.5 }, g); g.insertBefore(g.lastChild, g.firstChild); }
      if (p.type === 'ring') { o.fill = $('ellipse', { cx: 0, cy: 0, rx: 100, ry: 20, fill: 'url(#gRingFill)' }, g); o.ring = $('ellipse', { cx: 0, cy: 0, rx: 100, ry: 20, fill: 'none', stroke: '#ff3a46', 'stroke-width': 5 }, g); o.ring2 = $('ellipse', { cx: 0, cy: 0, rx: 100, ry: 20, fill: 'none', stroke: '#ff7a84', 'stroke-width': 2.5 }, g); }
      if (p.type === 'limit') { $('rect', { x: -22, y: -330, width: 44, height: 330, fill: 'url(#gLimit)', opacity: 0.55 }, g); $('rect', { x: -4, y: -330, width: 8, height: 330, fill: '#ff6a74' }, g); $('ellipse', { cx: 0, cy: 6, rx: 70, ry: 14, fill: 'url(#gRed)' }, g); o.rects = Array.from(g.children); }
      if (p.type === 'flashlight') { $('rect', { x: -6, y: -30, width: 12, height: 34, rx: 4, fill: '#3e466a' }, g); $('rect', { x: -9, y: -42, width: 18, height: 14, rx: 4, fill: '#fff0aa' }, g); }
      props.push(o);
    }
  }
  function updateProps(t, sc) {
    for (const o of props) {
      const p = o.p, on = inWin(p.vis, t) && (!p.scene || p.scene === sc);
      o.g.setAttribute('display', on ? 'inline' : 'none'); if (!on) continue;
      const x = p.xTrack ? trk(p.xTrack, t, p.x) : p.x, y = p.yTrack ? trk(p.yTrack, t, p.y) : p.y, sc_ = p.scale || 1, a = p.alpha === undefined ? 1 : p.alpha;
      let tx = x;
      if (p.follow && TL.actors[p.follow] && TL.actors[p.follow].pos) tx = TL.actors[p.follow].pos.x + (p.dx || 0);
      o.g.setAttribute('transform', `translate(${f2(tx)} ${f2(y)}) scale(${f2(sc_)})`);
      if (p.type === 'tomb') o.glow.setAttribute('opacity', trk(p.glowTrack || 'inscr', t, 0));
      if (p.type === 'garlic') o.sway.forEach(([s, i]) => s.setAttribute('transform', `rotate(${f2(3 * Math.sin(t * 1.6 + i))})`));
      if (p.type === 'ring') { const r = trk(p.track || 'ring', t, 0), rx = 40 + 300 * r, pulse = 1 + 0.04 * Math.sin(t * 5); o.g.setAttribute('opacity', clamp(r * 3)); for (const [e, k] of [[o.fill, 1], [o.ring, 1], [o.ring2, 0.82]]) { e.setAttribute('rx', f2(rx * pulse * k)); e.setAttribute('ry', f2(rx * pulse * k * 0.18)); } }
      if (p.type === 'limit') o.g.setAttribute('opacity', trk(p.track || 'limit', t, 0) * (0.7 + 0.3 * Math.sin(t * 6)));
      if (p.type === 'blanket') { /* handled in room */ }
      o.g.setAttribute('opacity', (p.type === 'ring' || p.type === 'limit') ? o.g.getAttribute('opacity') : a);
    }
  }

  // ------------------------------------------------------------------ actors
  function setupActors() {
    for (const name in TL.actors) {
      const d = TL.actors[name], rig = RIGS[d.kind](); const wrap = $('g', {}, layers.actors); wrap.__z = d.z || 0; wrap.appendChild(rig.root);
      d.rig = rig; d.wrap = wrap; d.cues = TL.cues.filter((c) => c.actor === name).sort((a, b) => a.t0 - b.t0);
    }
  }
  function poseFor(d, ta) {
    const cues = d.cues; let idx = -1; for (let i = 0; i < cues.length; i++) if (cues[i].t0 <= ta) idx = i;
    const N = d.rig.N, acts = ACTIONS[d.kind];
    const at = (c) => { const lt = ta - c.t0, dur = Math.max(1e-3, c.t1 - c.t0); const fn = acts[c.action] || acts.idle; return Object.assign({}, N, fn({ t: ta, lt, dur, u: clamp(lt / dur), p: c.params || {}, amp: ampAt(c.params && c.params.voice, ta) })); };
    if (idx < 0) return Object.assign({}, N, acts.idle({ t: ta, lt: ta, dur: 1, u: 0, p: {} }));
    let P = at(cues[idx]);
    if (idx > 0) { const bl = (cues[idx].params && cues[idx].params.blend) || 0.18, lt = ta - cues[idx].t0; if (lt < bl) P = mixP(at(cues[idx - 1]), P, EASE.smooth(lt / bl)); }
    return P;
  }
  function updateActors(t, ta) {
    for (const name in TL.actors) {
      const d = TL.actors[name], a = d.cues;
      const on = inWin(d.vis, t); d.wrap.setAttribute('display', on ? 'inline' : 'none'); if (!on) continue;
      const P = poseFor(d, ta); d.rig.apply(P, ta);
      const x = track(a, 'x', ta, d.x), y = track(a, 'y', ta, d.y, 'y'), sc = track(a, 'scale', ta, d.scale || 1), al = track(a, 'alpha', ta, 1), rot = track(a, 'rot', ta, 0);
      let flip = d.flip || 1; for (const c of a) if (c.t0 <= ta && c.params && c.params.flip !== undefined) flip = c.params.flip;
      const rc = d.rotC || -150;
      d.rig.root.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) scale(${f2(flip * sc)} ${f2(sc)}) rotate(${f2(rot)} 0 ${rc})`);
      d.wrap.setAttribute('opacity', al);
      let clip = null; for (const c of a) if (c.t0 <= ta && ta <= c.t1 + 0.4 && c.params && c.params.clipY !== undefined) clip = c.params.clipY;
      if (clip !== null) { document.getElementById('clipRiseR').setAttribute('height', clip + 3000); d.wrap.setAttribute('clip-path', 'url(#clipRise)'); } else d.wrap.removeAttribute('clip-path');
      let zz = d.z || 0; for (const c of a) if (c.t0 <= ta && c.params && c.params.z !== undefined) zz = c.params.z; d.wrap.__z = zz;
      d.pos = { x, y, flip, sc };
    }
    // z-order of actors + props + blanket
    const els = Array.from(layers.actors.children); els.sort((p, q) => (p.__z || 0) - (q.__z || 0)); els.forEach((e) => layers.actors.appendChild(e));
  }

  // ------------------------------------------------------------------ fx
  function buildFx() {
    for (const f of (TL.fx || [])) {
      const r = mulberry((f.seed || 1) * 977 + Math.round(f.t0 * 100)); const grp = $('g', { display: 'none' }, layers.fx); const it = { f, grp, parts: [] };
      const fill = f.fill || 'url(#gFog)';
      if (f.type === 'dust' || f.type === 'powder') for (let i = 0; i < (f.n || 14); i++) { const e = $('circle', { r: 1, fill: f.type === 'powder' ? 'url(#gSmoke)' : fill }, grp); it.parts.push({ e, vx: (r() - 0.5) * (f.spread || 380), vy: -(30 + r() * 90), r0: 14 + r() * 20, r1: 40 + r() * 50, dx: (r() - 0.5) * 120 }); }
      if (f.type === 'smoke') for (let i = 0; i < (f.n || 10); i++) { const e = $('circle', { r: 1, fill: 'url(#gSmoke)' }, grp); it.parts.push({ e, d: r() * 0.9, dx: (r() - 0.5) * (f.spread || 90), vx: (r() - 0.5) * 40, r1: 30 + r() * 30 }); }
      if (f.type === 'soil') for (let i = 0; i < (f.n || 18); i++) { const e = $('rect', { width: 10 + r() * 12, height: 8 + r() * 10, rx: 3, fill: r() > 0.5 ? '#5a4056' : '#3d2a38' }, grp); it.parts.push({ e, vx: (r() - 0.5) * 520, vy: -(300 + r() * 520), rot: (r() - 0.5) * 900 }); }
      if (f.type === 'sparks') for (let i = 0; i < (f.n || 24); i++) { const e = $('circle', { r: 3 + r() * 4, fill: f.color || '#ffd65a' }, grp); const a = r() * 6.283, sp = 120 + r() * 360; it.parts.push({ e, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, g: -70 - r() * 120 }); }
      if (f.type === 'ripple') for (let i = 0; i < 4; i++) it.parts.push({ e: $('circle', { fill: 'none', stroke: f.color || '#ffe39a', 'stroke-width': 5 }, grp), d: i * 0.18 });
      if (f.type === 'flame') { it.fl1 = $('polygon', { fill: '#ff8a1e' }, grp); it.fl2 = $('polygon', { fill: '#ffe08a' }, grp); it.glow = $('circle', { fill: 'url(#gGold)' }, grp); }
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
      if (f.type === 'dust' || f.type === 'powder') it.parts.forEach((p) => { const e = EASE.outCubic(u); p.e.setAttribute('cx', f2(X + p.dx + p.vx * e)); p.e.setAttribute('cy', f2(Y + p.vy * e * 1.4)); p.e.setAttribute('r', f2(lerp(p.r0, p.r1, e))); p.e.setAttribute('opacity', f2(1.6 * (1 - u))); });
      if (f.type === 'smoke') it.parts.forEach((p) => { const life = 1.1, q = ((lt - p.d * 0.9) / life); const qq = q - Math.floor(q); const act = lt - p.d * 0.9 > 0; p.e.setAttribute('cx', f2(X + p.dx + p.vx * qq)); p.e.setAttribute('cy', f2(Y - 160 * qq)); p.e.setAttribute('r', f2(10 + p.r1 * qq)); p.e.setAttribute('opacity', act ? f2(0.9 * Math.sin(qq * Math.PI) * (1 - u * 0.4)) : 0); });
      if (f.type === 'soil') it.parts.forEach((p) => { p.e.setAttribute('transform', `translate(${f2(X + p.vx * lt)} ${f2(Y + p.vy * lt + 1500 * lt * lt)}) rotate(${f2(p.rot * lt)})`); p.e.setAttribute('opacity', clamp(1.4 - u * 1.4)); });
      if (f.type === 'flame') { const R = f.r || 14, fl = 1 + 0.25 * Math.sin(lt * 31) + 0.15 * Math.sin(lt * 53), a = Math.sin(Math.PI * clamp(u)) ; const tear = (rr, k) => `${f2(X - rr)},${f2(Y)} ${f2(X - rr * 0.7)},${f2(Y - rr * 1.2 * fl * k)} ${f2(X + 0.12 * rr * Math.sin(lt * 17))},${f2(Y - rr * 2.6 * fl * k)} ${f2(X + rr * 0.7)},${f2(Y - rr * 1.2 * fl * k)} ${f2(X + rr)},${f2(Y)} ${f2(X)},${f2(Y + rr * 0.5)}`; it.fl1.setAttribute('points', tear(R, 1)); it.fl2.setAttribute('points', tear(R * 0.55, 0.8)); it.glow.setAttribute('cx', X); it.glow.setAttribute('cy', Y - R); it.glow.setAttribute('r', R * 5); it.grp.setAttribute('opacity', f2(a)); }
      if (f.type === 'sparks') it.parts.forEach((p) => { p.e.setAttribute('cx', f2(X + p.vx * lt * (1 - u * 0.5))); p.e.setAttribute('cy', f2(Y + p.vy * lt + 0.5 * p.g * lt * lt)); p.e.setAttribute('opacity', clamp(1.6 - u * 1.6)); });
      if (f.type === 'ripple') it.parts.forEach((p) => { const q = clamp((lt - p.d) / (dur - 0.5)); p.e.setAttribute('cx', X); p.e.setAttribute('cy', Y); p.e.setAttribute('r', f2(30 + q * (f.r || 520))); p.e.setAttribute('opacity', q <= 0 ? 0 : f2(0.8 * (1 - q))); });
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

  // ------------------------------------------------------------------ split roll (monster | guardian), any number of instances
  const SIL = '#07080f';
  const DECOYS = {
    // each entry draws a recognisable silhouette in a +-200 x +-250 box. mk helpers: P polygon, E ellipse, S stroke path, eyes
    koschei: (m) => { m.P('-36,-195 -36,-238 -20,-214 0,-248 20,-214 36,-238 36,-195'); m.E(0, -165, 34, 42); m.P('-42,-120 42,-120 32,0 -32,0'); m.P('-26,0 -8,0 -12,190 -32,190'); m.P('8,0 26,0 32,190 12,190'); m.P('-42,-116 -96,-20 -86,-10 -34,-98'); m.P('42,-116 96,-20 86,-10 34,-98'); m.P('104,-210 112,-210 112,60 104,60'); m.P('86,-60 130,-60 130,-50 86,-50'); m.eyes([[-13, -168], [13, -168]], 5); },
    chupacabra: (m) => { m.E(0, 60, 120, 58); m.P('96,10 196,38 196,70 108,82'); m.P('108,-6 120,-50 140,0'); m.P('-80,10 -70,-44 -52,6'); m.P('-40,2 -26,-58 -8,2'); m.P('0,-4 16,-64 32,-4'); m.P('40,2 56,-48 70,6'); for (const x of [-90, -50, 50, 90]) m.P(`${x - 12},90 ${x + 12},90 ${x + 6},190 ${x - 14},190`); m.P('-110,50 -190,0 -176,70'); m.P('150,66 160,100 170,66'); m.eyes([[148, 38]], 6); },
    jersey: (m) => { m.P('-10,-20 -100,-100 -200,-70 -180,20 -128,0 -96,56 -50,22'); m.P('10,-20 100,-100 200,-70 180,20 128,0 96,56 50,22'); m.P('-30,-70 30,-70 50,40 -50,40'); m.P('-24,-72 -44,-140 -6,-86'); m.P('24,-72 44,-140 6,-86'); m.E(0,86,46,72); m.P('-34,140 -12,140 -10,206 -42,206'); m.P('12,140 34,140 42,206 10,206'); m.S('M30 130 Q110 190 150 120', 10); m.eyes([[-14, -40], [14, -40]], 6); },
    draugr: (m) => { m.P('0,-206 -80,-150 -92,-20 92,-20 80,-150'); m.P('-92,-20 92,-20 140,210 -140,210'); m.P('112,-130 120,-130 120,170 112,170'); m.P('120,-120 176,-96 176,-24 120,-44'); m.E(0, -96, 50, 54); m.eyes([[-22, -96], [22, -96]], 6); },
    babayaga: (m) => { m.E(0, -120, 50, 58); m.P('48,-122 96,-92 52,-98'); m.P('-58,-140 0,-198 58,-140 62,-98 -62,-98'); m.P('-62,-70 62,-70 100,90 -100,90'); m.P('-120,60 120,60 84,184 -84,184'); m.P('96,-10 120,6 48,206 24,192'); m.eyes([[-18, -118], [16, -118]], 5); },
    kelpie: (m) => { m.P('-30,-176 44,-176 106,-62 96,-10 24,-30 -36,64 -84,64 -64,-92'); m.P('-34,-168 -96,-126 -128,-30 -106,44 -74,-6 -62,-84'); m.P('-84,64 -20,-30 24,-30 46,206 -110,206'); for (const [x, y] of [[-110, 90], [-90, 150], [-60, 210]]) m.E(x, y, 8, 14); m.eyes([[44, -126]], 6); },
    horseman: (m) => { m.E(0, 106, 120, 56); m.P('96,66 150,-10 192,0 172,76'); m.P('150,-6 166,-50 178,-4'); for (const x of [-90, -50, 50, 90]) m.P(`${x - 10},130 ${x + 10},130 ${x + 8},224 ${x - 12},224`); m.P('-20,46 40,46 30,-84 -30,-84'); m.P('-30,-84 -100,60 -44,44'); m.E(78, -64, 24, 22); m.P('110,-210 118,-210 118,40 110,40'); m.eyes([[170, 12]], 6); m.eyes([[70, -66], [86, -66]], 4, '#ffb347'); },
    blackeyed: (m) => { m.P('-62,-124 0,-196 62,-124 62,-60 -62,-60'); m.P('-50,-60 50,-60 70,170 -70,170'); m.P('-50,-52 -84,70 -64,76 -36,-30'); m.P('50,-52 84,70 64,76 36,-30'); m.E(0, -112, 38, 44, '#aab0c2'); m.E(-15, -112, 12, 17, '#000'); m.E(15, -112, 12, 17, '#000'); },
    strigoi: (m) => { m.P('-30,-110 30,-110 160,180 -160,180'); m.P('-30,-100 -176,40 -156,196 -20,60'); m.P('30,-100 176,40 156,196 20,60'); m.E(0, -150, 32, 40); m.P('-30,-162 -54,-196 -26,-140'); m.P('30,-162 54,-196 26,-140'); m.P('-9,-124 -4,-108 1,-124', '#f2f0ea'); m.P('4,-124 9,-108 14,-124', '#f2f0ea'); m.eyes([[-12, -152], [12, -152]], 5); },
    cerberus: (m) => { m.E(0, 110, 130, 66); m.P('-60,70 -120,-10 -76,-10 -30,60'); m.P('-14,60 -14,-50 14,-50 14,60'); m.P('60,70 120,-10 76,-10 30,60'); for (const [cx, cy] of [[-100, -26], [0, -70], [100, -26]]) { m.E(cx, cy, 34, 30); m.P(`${cx - 17},${cy + 6} ${cx + 17},${cy + 6} ${cx + 12},${cy + 42} ${cx - 12},${cy + 42}`); m.P(`${cx - 30},${cy - 14} ${cx - 22},${cy - 54} ${cx - 6},${cy - 22}`); m.P(`${cx + 30},${cy - 14} ${cx + 22},${cx === 0 ? cy - 54 : cy - 54} ${cx + 6},${cy - 22}`); m.eyes([[cx - 10, cy - 6], [cx + 10, cy - 6]], 4); } for (const x of [-90, -40, 40, 90]) m.P(`${x - 12},150 ${x + 12},150 ${x + 8},230 ${x - 14},230`); },
    talos: (m) => { m.E(0, -190, 36, 40); m.P('-124,-146 124,-146 100,-100 -100,-100'); m.P('-70,-100 70,-100 55,40 -55,40'); m.P('-124,-146 -156,40 -112,44 -90,-100'); m.P('124,-146 156,40 112,44 90,-100'); m.P('-52,40 -4,40 -10,214 -62,214'); m.P('4,40 52,40 62,214 10,214'); m.E(0, -20, 22, 22, '#22242e'); m.eyes([[-14, -192], [14, -192]], 5); m.eyes([[0, -20]], 9); m.P('-8,206 8,206 6,236 -6,236', '#ffd98a'); },
    griffin: (m) => { m.E(0, 50, 100, 60); m.P('-20,-10 -140,-180 -210,-120 -130,0 -60,36'); m.P('20,-10 100,-120 130,-80 70,10'); m.P('40,-30 70,-120 110,-140 120,-90 80,-20'); m.E(78, -140, 36, 34); m.P('104,-150 160,-116 104,-114'); m.P('80,-168 100,-206 112,-160'); for (const x of [-70, -30, 40, 80]) m.P(`${x - 12},90 ${x + 12},90 ${x + 8},190 ${x - 14},190`); m.P('-100,40 -196,0 -176,76'); m.eyes([[88, -144]], 5); },
    garmr: (m) => { m.E(0, 60, 118, 56); m.P('96,10 176,24 196,56 100,80'); m.P('104,-8 118,-60 138,0'); m.P('140,-4 160,-44 168,10'); for (const x of [-90, -50, 50, 90]) m.P(`${x - 12},90 ${x + 12},90 ${x + 6},192 ${x - 14},192`); m.P('-110,50 -184,20 -170,90'); m.E(40, 70, 22, 18, '#7a0d18'); for (let i = 0; i < 6; i++) m.S(`M${70 + i * 8} ${12 + i * 5} a8 8 0 1 1 0.1 0`, 4, '#9aa0b8'); m.eyes([[148, 30]], 6); },
    domovoi: (m) => { m.E(0, 116, 66, 80); m.E(0, -22, 48, 52); m.P('-50,-44 50,-44 0,-120'); m.P('-48,0 48,0 14,106 0,120 -14,106', '#cfd2e0'); m.P('-60,176 -20,176 -26,214 -66,214'); m.P('20,176 60,176 66,214 26,214'); m.eyes([[-16, -26], [16, -26]], 5); },
    brownie: (m) => { m.E(0, -60, 42, 44); m.P('-40,-62 -96,-98 -38,-40'); m.P('40,-62 96,-98 38,-40'); m.P('-44,-24 44,-24 70,130 22,112 0,142 -30,112 -70,130'); m.P('-50,-110 0,-190 50,-110'); m.P('90,-90 98,-90 98,170 90,170'); m.P('64,160 124,160 110,206 70,206'); m.eyes([[-15, -60], [15, -60]], 5); },
    matagot: (m) => { m.Pa('M-134,200 Q-110,-70 0,-76 Q110,-70 134,200 L96,200 Q60,70 0,60 Q-60,70 -96,200Z'); m.E(0, -108, 52, 44); m.P('-42,-130 -38,-196 -6,-142'); m.P('42,-130 38,-196 6,-142'); m.S('M120 190 Q210 120 160 20', 14); for (const s of [-1, 1]) for (const y of [-96, -84]) m.S(`M${s * 40} ${y} L${s * 100} ${y - 12}`, 3, '#9aa0b8'); m.eyes([[-20, -112], [20, -112]], 7); },
    tomte: (m) => { m.P('-58,-76 58,-76 8,-236 40,-250 36,-210'); m.E(0, -48, 40, 36); m.P('-62,-60 62,-60 44,100 0,170 -44,100'); m.E(0, 130, 70, 70); m.E(0, -34, 14, 11, '#caa08a'); m.P('-44,178 -8,178 -14,214 -50,214'); m.P('8,178 44,178 50,214 14,214'); m.eyes([[-16, -56], [16, -56]], 4); },
  };
  const MON_NAMES = ['koschei', 'chupacabra', 'jersey', 'draugr', 'babayaga', 'kelpie', 'horseman', 'blackeyed', 'strigoi'];
  const GUA_NAMES = ['cerberus', 'talos', 'griffin', 'garmr', 'domovoi', 'brownie', 'matagot', 'tomte'];
  const LABELS = { koschei: 'KOSCHEI', chupacabra: 'CHUPACABRA', jersey: 'JERSEY DEVIL', draugr: 'DRAUGR', babayaga: 'BABA YAGA', kelpie: 'KELPIE', horseman: 'HEADLESS HORSEMAN', blackeyed: 'BLACK-EYED CHILD', strigoi: 'STRIGOI', cerberus: 'CERBERUS', talos: 'TALOS', griffin: 'GRIFFIN', garmr: 'GARMR', domovoi: 'DOMOVOI', brownie: 'BROWNIE', matagot: 'MATAGOT', tomte: 'TOMTE' };
  function drawDecoy(g, name, eyeCol) {
    const m = {
      P: (pts, fill) => $('polygon', { points: pts, fill: fill || SIL }, g), E: (cx, cy, rx, ry, fill) => $('ellipse', { cx, cy, rx, ry, fill: fill || SIL }, g), Pa: (d) => $('path', { d, fill: SIL }, g),
      S: (d, w, col) => $('path', { d, stroke: col || SIL, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g),
      eyes: (pts, r, col) => pts.forEach(([x, y]) => { $('circle', { cx: x, cy: y, r: r * 3.2, fill: eyeCol === '#ffd98a' ? 'url(#gGold)' : 'url(#gRed)' }, g); $('circle', { cx: x, cy: y, r, fill: col || eyeCol }, g); }),
    };
    DECOYS[name](m);
  }
  function buildSplit(cfg) {
    const inst = { cfg, halves: [] }; inst.g = $('g', {}, svg);
    inst.bg = $('rect', { x: 0, y: 0, width: W, height: H, fill: '#05060d' }, inst.g);
    const CY = 760;
    for (const side of ['L', 'R']) {
      const h = cfg[side === 'L' ? 'left' : 'right'], mon = side === 'L', cx = mon ? 270 : 810, x0 = mon ? 0 : 540; h.mon = mon;
      const hg = $('g', {}, inst.g); h.hg = hg; h.cx = cx; h.side = side;
      const clipG = $('g', { 'clip-path': `url(#clip${side})` }, hg);
      $('rect', { x: x0, y: 0, width: 540, height: H, fill: mon ? 'url(#gBgL)' : 'url(#gBgR)' }, clipG);
      if (!mon) { h.rays = $('g', {}, clipG); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; $('polygon', { points: `${cx},${CY} ${cx + Math.cos(a) * 900},${CY + Math.sin(a) * 900} ${cx + Math.cos(a + 0.14) * 900},${CY + Math.sin(a + 0.14) * 900}`, fill: '#ffe39a', opacity: 0.09 }, h.rays); } $('circle', { cx, cy: CY, r: 380, fill: 'url(#gGold)', opacity: 0.55 }, clipG); }
      else { $('circle', { cx, cy: CY, r: 380, fill: 'url(#gRed)', opacity: 0.25 }, clipG); const dr = mulberry(8); for (let i = 0; i < 9; i++) { const x = x0 + 30 + dr() * 480; $('rect', { x, y: 0, width: 5 + dr() * 6, height: 120 + dr() * 700, fill: '#7a0d18', opacity: 0.35 }, clipG); } }
      h.streaks = $('g', {}, clipG); for (let i = 0; i < 9; i++) $('rect', { x: x0 + 20 + i * 60, y: 0, width: 4, height: 500, fill: mon ? '#ffb0b0' : '#fff6d0', opacity: 0 }, h.streaks);
      h.parts = []; const pr = mulberry(mon ? 41 : 43);
      for (let i = 0; i < 18; i++) { const e = $('circle', { r: mon ? 5 + pr() * 4 : 3 + pr() * 4, fill: mon ? '#c4121f' : '#ffe39a' }, clipG); h.parts.push({ e, x: x0 + 20 + pr() * 500, sp: 60 + pr() * 160, ph: pr() * 2000, mon }); }
      h.reel = $('g', {}, clipG); h.cards = []; h.S = 700; const N = h.N, names = mon ? MON_NAMES : GUA_NAMES, eyeCol = mon ? '#ff3a44' : '#ffd98a';
      if (h.kind) { h.rig = RIGS[h.kind](); }
      for (let i = -3; i < N; i++) {
        const c = $('g', {}, h.reel); const tgt = i === N - 1 && h.kind; const inner = $('g', { transform: `translate(${cx} 0)` }, c);
        if (!mon) $('rect', { x: -232, y: -312, width: 464, height: 648, rx: 40, fill: 'none', stroke: 'url(#gGold)', 'stroke-width': 22, opacity: 0.8 }, inner);
        $('rect', { x: -212, y: -304, width: 424, height: 608, rx: 26, fill: mon ? 'url(#gCardL)' : 'url(#gCardR)' }, inner);
        if (!mon) $('ellipse', { cx: 0, cy: 20, rx: 190, ry: 250, fill: 'url(#gGold)', opacity: 0.35 }, inner);
        $('rect', { x: -212, y: -304, width: 424, height: 608, rx: 26, fill: 'none', stroke: mon ? '#d0303c' : '#ffe39a', 'stroke-width': mon ? 3 : 5, opacity: mon ? 0.8 : 1 }, inner);
        $('ellipse', { cx: 0, cy: 250, rx: 150, ry: 22, fill: '#000', opacity: 0.35 }, inner);
        if (tgt) { const hold = $('g', { transform: `translate(${h.fx || 0} ${h.fy}) scale(${h.fscale})` }, inner); hold.appendChild(h.rig.root); h.target = c; G.setSil(h.rig, 1); }
        else { const nm = names[((i + 30) * 5 + (mon ? 0 : 2)) % names.length]; const dg = $('g', { transform: 'translate(0 8) scale(0.9)' }, inner); drawDecoy(dg, nm, eyeCol); const lb = $('text', { x: 0, y: 276, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 27, fill: mon ? '#f08c94' : '#ffeab0', 'letter-spacing': 3 }, inner); lb.textContent = LABELS[nm]; }
        if (mon) {                                     // blood: drips from the top edge + claw scratches
          const br = mulberry(i * 13 + 5); for (let k = 0; k < 5; k++) { const x = -190 + k * 90 + br() * 40, len = 40 + br() * 150; $('path', { d: `M${x - 7} -304 L${x - 7} ${-304 + len} Q${x} ${-304 + len + 14} ${x + 7} ${-304 + len} L${x + 7} -304Z`, fill: '#a30d1a' }, inner); $('circle', { cx: x, cy: -304 + len + 4, r: 7, fill: '#c4121f' }, inner); }
          for (let k = 0; k < 3; k++) $('path', { d: `M${70 + k * 22} -250 L${130 + k * 22} -130`, stroke: '#e0505a', 'stroke-width': 4, opacity: 0.45, 'stroke-linecap': 'round' }, inner);
        } else { for (let k = 0; k < 4; k++) $('path', { d: `M${-190 + k * 126} 296 l8 -26 l8 26 l-8 -8z`, fill: '#fff3c0', opacity: 0.8 }, inner); }
        c.__i = i; h.cards.push(c);
      }
      h.flash = $('rect', { x: x0, y: 0, width: 540, height: H, fill: mon ? '#ff2a38' : '#fff6d6', opacity: 0 }, clipG);
      h.ring = $('circle', { cx, cy: CY, r: 10, fill: 'none', stroke: mon ? '#ff5a64' : '#fff0b0', 'stroke-width': 10, opacity: 0 }, hg);
      h.splat = []; const sr = mulberry(77); for (let i = 0; i < (mon ? 16 : 14); i++) h.splat.push({ e: $('polygon', { fill: mon ? '#b50f1d' : '#fff3c0', opacity: 0 }, hg), a: sr() * 6.283, l: 160 + sr() * 300, w: 12 + sr() * 14 });
      // title plate
      h.plate = $('g', { opacity: 0 }, hg);
      if (mon) { $('rect', { x: cx - 220, y: 196, width: 440, height: 124, rx: 14, fill: '#5a0a14', stroke: '#c4121f', 'stroke-width': 5 }, h.plate); for (const [dx, ln] of [[-170, 60], [-90, 90], [10, 50], [120, 80], [180, 40]]) { $('path', { d: `M${cx + dx - 7} 320 L${cx + dx - 7} ${320 + ln} Q${cx + dx} ${334 + ln} ${cx + dx + 7} ${320 + ln} L${cx + dx + 7} 320Z`, fill: '#c4121f' }, h.plate); } }
      else { $('circle', { cx, cy: 258, r: 260, fill: 'url(#gGold)', opacity: 0.6 }, h.plate); $('rect', { x: cx - 220, y: 196, width: 440, height: 124, rx: 14, fill: '#27367c', stroke: '#ffe39a', 'stroke-width': 6 }, h.plate); }
      const pt = $('text', { x: cx, y: 288, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': mon ? 80 : 72, fill: mon ? '#ffdede' : '#fff6d0', 'letter-spacing': 4 }, h.plate); pt.textContent = mon ? 'MONSTER' : 'GUARDIAN';
      h.name = $('text', { x: cx, y: 1128, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': h.nameSize || 58, fill: '#f2f0ea', opacity: 0, 'letter-spacing': 3 }, hg); h.name.textContent = h.label || '';
      h.sub = $('text', { x: cx, y: 1176, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 27, fill: mon ? '#ff7a84' : '#ffe39a', opacity: 0, 'letter-spacing': 4 }, hg); h.sub.textContent = h.subLabel || '';
    }
    inst.line = $('g', {}, inst.g); $('rect', { x: 528, y: 0, width: 24, height: H, fill: 'url(#gLine)' }, inst.line); $('rect', { x: 536, y: 0, width: 8, height: H, fill: '#ff6a74' }, inst.line);
    inst.shards = []; const r = mulberry(99); for (let i = 0; i < 16; i++) { const y = (i + 0.5) * H / 16; const e = $('polygon', { points: `0,-${60 + r() * 40} ${12 + r() * 14},0 0,${60 + r() * 40} -${6 + r() * 8},0`, fill: i % 2 ? '#ff4a56' : '#ff9aa2', opacity: 0 }, inst.g); inst.shards.push({ e, y, vx: (r() - 0.5) * 1600, vy: (r() - 0.5) * 500, rot: (r() - 0.5) * 900 }); }
    splits.push(inst);
  }
  function cum(s) { if (s < 0.2) return s * s / 0.4; if (s < 0.45) return 0.1 + (s - 0.2); const w = (s - 0.45) / 0.55; return 0.35 + 0.55 * (1 - Math.pow(1 - w, 3)) / 3; }
  function updateSplit(inst, t) {
    const cfg = inst.cfg, sh0 = cfg.shatter, t0 = cfg.t0 || 0, on = t >= t0 && t <= cfg.end;
    inst.g.setAttribute('display', on ? 'inline' : 'none'); if (!on) return;
    const fade = cfg.fadeIn ? clamp((t - t0) / cfg.fadeIn) : 1, fout = cfg.fadeOut ? clamp((cfg.end - t) / cfg.fadeOut) : 1;
    inst.g.setAttribute('opacity', Math.min(fade, fout));
    let zz = 1, zcx = 540, zcy = 960; for (const z of (cfg.zooms || [])) if (t >= z.t0 && t <= z.t1) { const e = ease(z.ease || 'inOut', (t - z.t0) / (z.t1 - z.t0)); zz = lerp(z.z0, z.z1, e); zcx = z.cx; zcy = z.cy; }
    inst.g.setAttribute('transform', zz === 1 ? '' : `translate(${zcx} ${zcy}) scale(${f2(zz)}) translate(${-zcx} ${-zcy})`);
    const T0 = t0 + 0.05;
    for (const h of [cfg.left, cfg.right]) {
      const lockT = h.lockT, s = clamp((t - T0) / (lockT - T0)), p = cum(s) / 0.5333, M = (h.N - 1) * h.S;
      let bounce = 0, lt = t - lockT; if (lt > 0) bounce = 22 * Math.exp(-lt * 8) * Math.sin(lt * 26);
      for (const c of h.cards) { const y = 760 - c.__i * h.S + p * M + bounce; c.setAttribute('transform', `translate(0 ${f2(y)})`); c.setAttribute('display', y < -420 || y > H + 420 ? 'none' : 'inline'); }
      const v = s >= 1 ? 0 : (cum(Math.min(1, s + 0.01)) - cum(s)) / 0.01 / 0.5333 * M / (lockT - T0), sp = clamp(Math.abs(v) / 3500);
      Array.from(h.streaks.children).forEach((e, i) => { e.setAttribute('opacity', 0.16 * sp); e.setAttribute('height', 200 + 500 * sp); e.setAttribute('y', f2(((i * 531 + t * v * 1.1) % (H + 700)) - 600)); });
      h.parts.forEach((q) => { const yy = ((q.ph - t * q.sp * (q.mon ? -1 : 1)) % 2200 + 2200) % 2200 - 100; q.e.setAttribute('cx', f2(q.x + 14 * Math.sin(t * 2 + q.ph))); q.e.setAttribute('cy', f2(yy)); q.e.setAttribute('opacity', 0.35 + 0.35 * Math.sin(t * 3 + q.ph)); });
      if (h.rays) h.rays.setAttribute('transform', `rotate(${f2(t * 5)} ${h.cx} 760)`);
      if (h.kind) {
        setSil(h.rig, lt < 0 ? 1 : 1 - EASE.smooth(clamp(lt / 0.35)));
        const act = ACTIONS[h.kind][lt < 0 ? 'idle' : (h.idle || 'idle')]; h.rig.apply(Object.assign({}, h.rig.N, act({ t, lt: Math.max(0, lt), dur: 99, u: 0, p: {} })), t);
      }
      let shx = 0, shy = 0; if (lt > 0 && lt < 0.5) { const a = 22 * (1 - lt / 0.5); shx = (hash(t * 91) - 0.5) * 2 * a; shy = (hash(t * 57 + 3) - 0.5) * 2 * a; }
      h.flash.setAttribute('opacity', lt > 0 ? (h.mon ? 0.7 : 0.95) * Math.max(0, 1 - lt / 0.3) : 0);
      h.ring.setAttribute('opacity', lt > 0 && lt < 0.55 ? 1 - lt / 0.55 : 0); h.ring.setAttribute('r', f2(10 + lt * 1100));
      h.splat.forEach((q) => { const u = clamp(lt / 0.5); if (lt <= 0) { q.e.setAttribute('opacity', 0); return; } const e = EASE.outCubic(u), d0 = 120 * e, d1 = q.l * e, w = q.w * (h.mon ? 1 - u * 0.4 : 1 - u), ca = Math.cos(q.a), sa = Math.sin(q.a); q.e.setAttribute('points', `${f2(h.cx + ca * d0 - sa * w)},${f2(760 + sa * d0 + ca * w)} ${f2(h.cx + ca * d1)},${f2(760 + sa * d1)} ${f2(h.cx + ca * d0 + sa * w)},${f2(760 + sa * d0 - ca * w)}`); q.e.setAttribute('opacity', h.mon ? clamp(1.4 - u * 0.7) : clamp(1.4 - u * 1.4)); });
      const pl = clamp((t - T0) / 0.3); h.plate.setAttribute('opacity', pl); h.plate.setAttribute('transform', `translate(${h.cx} 258) scale(${f2(lerp(1.5, 1, EASE.outBack(pl)))}) translate(${-h.cx} -258)`);
      h.name.setAttribute('opacity', lt > 0.12 ? 1 : 0); h.sub.setAttribute('opacity', lt > 0.3 ? 1 : 0);
      const slam = lt > 0 ? EASE.outBack(clamp(lt / 0.25)) : 0; h.name.setAttribute('transform', `translate(${h.cx} 1110) scale(${f2(0.6 + 0.4 * slam)}) translate(${-h.cx} -1110)`);
      const sd = clamp((t - sh0) / 0.8), dir = h.mon ? -1 : 1;
      h.hg.setAttribute('transform', `translate(${f2(shx + dir * 260 * EASE.inCubic(sd))} ${f2(shy)}) translate(${h.cx} 900) scale(${f2(1 + 0.35 * EASE.inCubic(sd))}) translate(${-h.cx} -900)`);
      h.hg.setAttribute('opacity', 1 - EASE.smooth(clamp((sd - 0.1) / 0.9)));
    }
    inst.bg.setAttribute('opacity', 1 - EASE.smooth(clamp((t - sh0) / 0.5)));
    const sd = t - sh0, pulse = 0.75 + 0.25 * Math.sin(t * 9);
    inst.line.setAttribute('opacity', sd < 0 ? pulse : sd < 0.12 ? 1 : 0);
    inst.shards.forEach((s) => { if (sd < 0) { s.e.setAttribute('opacity', 0); return; } const u = clamp(sd / 1.0); s.e.setAttribute('opacity', clamp(1 - u * 1.1)); s.e.setAttribute('transform', `translate(${f2(540 + s.vx * sd)} ${f2(s.y + s.vy * sd + 700 * sd * sd)}) rotate(${f2(s.rot * sd)}) scale(${f2(1 + sd * 2)})`); });
  }

  // ------------------------------------------------------------------ text / hud / overlays
  function buildText() {
    for (const tx of (TL.text || [])) {
      const g = $('g', { opacity: 0 }, svg); const o = { tx, g }; const fs = tx.size || 80;
      const mk = (fill, dx, dy) => { const e = $('text', { x: dx, y: dy, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': fs, fill, 'letter-spacing': tx.spacing || 2 }, g); e.textContent = tx.text; return e; };
      const lines = String(tx.text).split('\n');
      if (tx.bg) { o.bg = $('rect', { fill: tx.bg.fill || '#14182e', stroke: tx.bg.stroke || 'none', 'stroke-width': tx.bg.sw || 4, rx: tx.bg.rx || 16, opacity: tx.bg.op === undefined ? 0.92 : tx.bg.op }, g); }
      if (tx.shadow) { o.sh = $('text', { x: tx.shadowDx || 10, y: (tx.shadowDy || 12), 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': fs, fill: tx.shadow, 'letter-spacing': tx.spacing || 2 }, g); }
      o.els = lines.map((ln, i) => { const e = $('text', { x: 0, y: i * fs * 1.12, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': fs, fill: tx.color || '#fff', 'letter-spacing': tx.spacing || 2 }, g); e.textContent = ln; return e; });
      if (o.sh) o.sh.textContent = lines[0];
      if (tx.glow) { o.gl = $('ellipse', { cx: 0, cy: -fs * 0.3, rx: fs * 0.6 * Math.max(...lines.map((l) => l.length)) * 0.55 + 40, ry: fs * 0.9, fill: 'url(#gRed)', opacity: 0.8 }, g); g.insertBefore(o.gl, g.firstChild); }
      textList.push(o);
    }
  }
  function fitText() {
    for (const o of textList) { if (!o.bg) continue; const bb = o.g.getBBox(), px = o.tx.bg.px === undefined ? 36 : o.tx.bg.px, py = o.tx.bg.py === undefined ? 18 : o.tx.bg.py; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; o.els.forEach((e) => { const b = e.getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); }); o.bg.setAttribute('x', x0 - px); o.bg.setAttribute('y', y0 - py); o.bg.setAttribute('width', x1 - x0 + 2 * px); o.bg.setAttribute('height', y1 - y0 + 2 * py); }
  }
  function updateText(t) {
    for (const o of textList) {
      const tx = o.tx, lt = t - tx.t0, vis = lt >= 0 && t <= tx.t1;
      if (!vis) { o.g.setAttribute('opacity', 0); continue; }
      let sc = 1, op = 1;
      if (tx.anim === 'slam') { sc = lt < 0.22 ? lerp(3.2, 1, EASE.outBack(clamp(lt / 0.22))) : 1 + 0.015 * Math.sin(lt * 5); op = clamp(lt / 0.05); }
      else if (tx.anim === 'pop') { sc = lerp(0.5, 1, EASE.outBack(clamp(lt / 0.3))); op = clamp(lt / 0.12); }
      else if (tx.anim === 'blink') { op = clamp(lt / 0.1) * (0.55 + 0.45 * Math.sin(lt * 14)); }
      else op = clamp(lt / 0.25);
      if (tx.anim !== 'blink' || true) op *= clamp((tx.t1 - t) / (tx.fadeOut === undefined ? 0.25 : tx.fadeOut || 0.001));
      o.g.setAttribute('opacity', op); o.g.setAttribute('transform', `translate(${tx.x} ${tx.y}) scale(${f2(sc)})`);
    }
  }
  function updateOverlay(t) {
    let fl = 0, fc = '#fff'; for (const f of (TL.flash || [])) { const lt = t - f.t0; if (lt >= 0 && lt < f.dur) { const a = (f.amp || 1) * (1 - lt / f.dur); if (a > fl) { fl = a; fc = f.color || '#fff'; } } }
    flashEl.setAttribute('opacity', fl); flashEl.setAttribute('fill', fc);
    const tc = TL.tints || []; let ta = 0, tcol = '#c4121f'; for (const tt of tc) { if (t >= tt.t0 && t <= tt.t1) { const k = Math.min(clamp((t - tt.t0) / (tt.fadeIn || 0.3)), clamp((tt.t1 - t) / (tt.fadeOut || 0.3))); ta = Math.max(ta, tt.a * k); tcol = tt.color || tcol; } }
    tintEl.setAttribute('opacity', ta); tintEl.setAttribute('fill', tcol);
    let bl = 0; for (const b of (TL.black || [])) if (t >= b[0] && t < b[1]) bl = b[2] === undefined ? 1 : b[2]; blackEl.setAttribute('opacity', bl);
    // glitch (rewind) windows
    let gl = 0; for (const w of (TL.glitch || [])) if (t >= w[0] && t < w[1]) gl = 1;
    glitchG.setAttribute('display', gl ? 'inline' : 'none');
    if (gl) { const fr = Math.floor(t * 30); Array.from(glitchG.children).forEach((e, i) => { const r1 = hash(fr * 7.3 + i * 3.1), r2 = hash(fr * 2.9 + i * 5.7); e.setAttribute('y', f2(r1 * H)); e.setAttribute('height', f2(6 + r2 * 60)); e.setAttribute('x', f2((hash(fr + i) - 0.5) * 120)); e.setAttribute('opacity', 0.1 + 0.3 * hash(fr * 1.7 + i)); e.setAttribute('fill', i % 3 === 0 ? '#ff2a38' : i % 3 === 1 ? '#7affff' : '#fff'); }); }
    return gl;
  }
  function shakeAt(t) {
    let dx = 0, dy = 0; const fr = Math.floor(t * 30);
    for (const s of (TL.shake || [])) { const lt = t - s.t0; if (lt >= 0 && lt < s.dur) { const a = (s.amp || 20) * Math.pow(1 - lt / s.dur, s.hold ? 0.3 : 1.5); dx += (hash(fr * 1.37 + 1) - 0.5) * 2 * a; dy += (hash(fr * 2.11 + 7) - 0.5) * 2 * a * 0.8; } }
    return [dx, dy];
  }
  function buildHud() {
    const h = TL.hud; if (!h) return; hud = { cfg: h, g: $('g', {}, svg) };
    const bar = (x, col, side, lab) => { const g = $('g', {}, hud.g); $('rect', { x, y: 74, width: 440, height: 40, rx: 20, fill: '#0a0c1c', opacity: 0.85 }, g); const f = $('rect', { x: x + 4, y: 78, width: 432, height: 32, rx: 16, fill: col }, g); const l = $('text', { x: side < 0 ? x + 6 : x + 434, y: 64, 'text-anchor': side < 0 ? 'start' : 'end', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 28, fill: '#e8e6f0', 'letter-spacing': 3 }, g); l.textContent = lab; const pc = $('text', { x: x + 220, y: 104, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 800, 'font-size': 26, fill: '#fff' }, g); return { f, l, pc, x, side, col }; };
    hud.L = bar(50, '#c4121f', -1, h.leftLabel || 'VRYKOLAKAS'); hud.R = bar(590, '#4a68d8', 1, h.rightLabel || 'GRIM');
  }
  function updateHud(t) {
    if (!hud) return; const c = hud.cfg; hud.g.setAttribute('display', inWin(c.vis, t) ? 'inline' : 'none');
    const L = numTrack(c.left, t, c.leftInit === undefined ? 1 : c.leftInit), R = numTrack(c.right, t, c.rightInit === undefined ? 1 : c.rightInit);
    const fl = (v, bar, win) => { const low = v <= 0.36 && v > 0 && win && inWin(win, t), blink = low && Math.floor(t * 4) % 2 === 0; bar.f.setAttribute('fill', blink ? '#ffffff' : bar.col); bar.pc.textContent = Math.round(v * 100) + '%'; };
    hud.L.f.setAttribute('width', f2(Math.max(0, 432 * L))); hud.R.f.setAttribute('width', f2(Math.max(0, 432 * R))); hud.R.f.setAttribute('x', f2(hud.R.x + 4 + 432 * (1 - R)));
    fl(L, hud.L, c.blinkL); fl(R, hud.R, c.blinkR);
  }

  // ------------------------------------------------------------------ SHOT SYSTEM (hard cuts between camera set-ups)
  let povFogL = [], povRev = null, povBeamG = null, povGrp = [], povG = null, povW = null, povHand = null, povTrees = [], povFlies = [], povBeam = null, povCone = [], povDark = null, povFog = [], otsG = null, crashG = null, curShot = null;
  const HEADSZ = { vry: 150, grim: 250, kid: 150 }, HEADOFF = { vry: [0, -425], grim: [222, -288], kid: [0, -262] };
  function markerWorld(actor, name) {
    const d = TL.actors[actor]; if (!d || !d.rig || !d.rig.mk || !d.rig.mk[name]) return null;
    const m = d.rig.mk[name], c1 = m.getCTM(), c2 = layers.actors.getCTM(); if (!c1 || !c2) return null;
    const M = c2.inverse().multiply(c1), x = +m.getAttribute('cx'), y = +m.getAttribute('cy');
    return { x: M.a * x + M.c * y + M.e, y: M.b * x + M.d * y + M.f };
  }
  function shotInfo(t) {
    const L = TL.shots; if (!L || !L.length) return null; let i = -1; for (let k = 0; k < L.length; k++) if (L[k].t <= t) i = k; if (i < 0) return null;
    const s = L[i], t1 = i + 1 < L.length ? L[i + 1].t : TL.duration; return { s, i, t1, dur: Math.max(1e-3, t1 - s.t), lt: t - s.t, u: clamp((t - s.t) / Math.max(1e-3, t1 - s.t)) };
  }
  function shotCam(t, info) {
    const s = info.s, u = info.u, lt = info.lt; let cx = s.cx === undefined ? 540 : s.cx, cy = s.cy === undefined ? 930 : s.cy, zoom = s.zoom || 1, rot = 0, sy = 1;
    const A = s.actor && TL.actors[s.actor], P = A && A.pos;
    switch (s.type) {
      case 'versus': { const a = TL.actors[s.a].pos, b = TL.actors[s.b].pos; if (a && b) { const ha = a.x + HEADOFF[TL.actors[s.a].kind][0] * a.flip * a.sc, hb = b.x + HEADOFF[TL.actors[s.b].kind][0] * b.flip * b.sc; cx = (ha + hb) / 2 + (s.dx || 0); const span = Math.abs(ha - hb) + (s.margin || 340); zoom = s.zoom || Math.min(s.maxZoom || 1.7, Math.max(s.minZoom || 1.2, 980 / span)); cy = s.cy || 960; } break; }
      case 'follow': { if (P) { cx = P.x + (s.dx || 0); cy = P.y + (s.dy === undefined ? -150 : s.dy); } break; }
      case 'cu': case 'reaction': { if (P) { const o = HEADOFF[A.kind], sc = P.sc; cx = P.x + o[0] * P.flip * sc + (s.dx || 0); cy = P.y + o[1] * sc + (s.dy || 0); zoom = s.zoom || ((s.fill || 0.6) * 1080 / (HEADSZ[A.kind] * sc)); } break; }
      case 'ecu': { const mk = markerWorld(s.actor, s.at || 'eye'); if (mk) { cx = mk.x + (s.dx || 0); cy = mk.y + (s.dy || 0); } zoom = s.zoom || 5; break; }
      case 'low': { const x = s.x !== undefined ? s.x : (P ? P.x : 540), feet = P ? P.y : 1080; cx = x + (s.dx || 0); zoom = s.zoom || 1.6; cy = feet - ((s.ground || 0.88) * 1920 - 960) / zoom; sy = s.sy || 1.12; break; }
      case 'high': { const x = s.x !== undefined ? s.x : (P ? P.x : 540), feet = P ? P.y : 1080; cx = x + (s.dx || 0); zoom = s.zoom || 1.5; sy = s.sy || 0.74; cy = feet - ((s.ground || 0.62) * 1920 - 960) / (zoom * sy) ; break; }
      default: break;     // wide / establish / insert / ots / versus fallbacks use cx,cy,zoom
    }
    if (s.push) zoom *= 1 + (s.push - 1) * ease(s.pushEase || 'inOut', u);
    if (s.pan) { cx += s.pan[0] * ease('inOut', u); cy += s.pan[1] * ease('inOut', u); }
    if (s.dutch !== undefined) rot = lerp(s.dutch, s.dutchTo === undefined ? s.dutch : s.dutchTo, u);
    if (s.hand) { const a = s.hand; cx += a * (Math.sin(t * 1.9) + 0.5 * Math.sin(t * 4.3 + 1)); cy += a * (Math.sin(t * 1.3 + 2) + 0.5 * Math.sin(t * 3.7)); rot += a * 0.05 * Math.sin(t * 1.1 + 1); }
    let crash = 0;
    if (s.crash) { const q = clamp((t - s.crash.at) / (s.crash.dur || 0.12)); if (t >= s.crash.at) { zoom *= 1 + (s.crash.k - 1) * EASE.outCubic(q); crash = clamp(1 - (t - s.crash.at) / 0.4) * 1; } }
    return { cx, cy, zoom, rot, sy, crash, whip: s.whip && lt < s.whip ? 1 - lt / s.whip : 0, whipDir: s.whipDir || 1, rack: s.rack || null };
  }
  // ---- POV-KID: first-person forest walk with a flashlight cone (screen space, deterministic)
  function buildPov(cfg) {
    povG = $('g', { display: 'none' }, svg); povW = $('g', {}, povG); const r = mulberry(17);
    const gb = $('linearGradient', { id: 'gBeamL', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 1 }, defs); [[0, '#fff2c0', 0.55], [0.35, '#ffe9a0', 0.22], [1, '#ffe9a0', 0]].forEach((q) => $('stop', { offset: q[0], 'stop-color': q[1], 'stop-opacity': q[2] }, gb)); povBeamG = gb;
    const gv = $('linearGradient', { id: 'gTrunkVol', x1: 0, y1: 0, x2: 1, y2: 0 }, defs); [[0, '#c8d4ff', 0.34], [0.35, '#ffffff', 0], [1, '#000000', 0.55]].forEach((q) => $('stop', { offset: q[0], 'stop-color': q[1], 'stop-opacity': q[2] }, gv));
    $('rect', { x: -200, y: -200, width: 1480, height: 1100, fill: 'url(#gSky)' }, povW); $('circle', { cx: 700, cy: 330, r: 360, fill: 'url(#gMoon)' }, povW); $('circle', { cx: 700, cy: 330, r: 96, fill: '#ece9d6' }, povW);
    const far = $('g', {}, povW); for (let x = -200; x < 1300; x += 60 + r() * 40) pine(far, x, 910, 200 + r() * 140, '#1a2040', 4);
    $('rect', { x: -200, y: 900, width: 1480, height: 1300, fill: 'url(#gGround)' }, povW);
    $('polygon', { points: '532,900 548,900 980,1980 100,1980', fill: '#2a3159', opacity: 0.55 }, povW);
    povRev = $('g', { opacity: 0 }, povW);                                  // graveyard wall + headstones at the horizon (revealed by `reveal`)
    for (let i = 0; i < 7; i++) $('rect', { x: 260 + i * 84, y: 862 - (i % 2) * 8, width: 80, height: 62, rx: 5, fill: i % 2 ? '#565e88' : '#4a5278' }, povRev);
    for (const x of [330, 480, 640, 760]) $('path', { d: `M${x - 22} 930 L${x - 22} 880 A22 22 0 0 1 ${x + 22} 880 L${x + 22} 930Z`, fill: '#646c98' }, povRev);
    povTrees = []; povGrp = [$('g', {}, povW), $('g', {}, povW), $('g', { style: 'filter:blur(7px)' }, povW)];
    // mist between the depth layers
    povFogL = []; for (const [gi, y, op] of [[1, 960, 0.5], [2, 1010, 0.4]]) { const e = $('ellipse', { cx: 540, cy: y, rx: 1000, ry: 190, fill: 'url(#gFog)', opacity: op }, povW); povW.insertBefore(e, povGrp[gi]); povFogL.push(e); }
    for (let i = 0; i < 64; i++) { const g = $('g', {}, povGrp[0]), X = (r() < 0.5 ? -1 : 1) * (1.3 + Math.pow(r(), 1.2) * 10), o = { g, X, ph: r() * 24.7, h: 10 + r() * 8, sz: 0.8 + r() * 0.5, w: 0.35 + r() * 0.3, bk: [0, 1, 2].map(() => $('polygon', {}, g)), trunk: $('rect', {}, g), shade: $('rect', {}, g), vol: $('rect', { fill: 'url(#gTrunkVol)' }, g), bark: [0, 1].map(() => $('rect', {}, g)), tiers: [0, 1, 2, 3, 4].map(() => $('polygon', {}, g)), tops: [0, 1, 2, 3, 4].map(() => $('polygon', {}, g)) }; povTrees.push(o); }
    povFog = []; for (let i = 0; i < 6; i++) { const e = $('ellipse', { rx: 700, ry: 70, fill: 'url(#gFog)' }, povW); povFog.push({ e, y: 940 + i * 70, sp: 10 + r() * 14, x0: r() * 1800 }); }
    povDark = $('rect', { x: -300, y: -300, width: 1680, height: 2500, fill: '#02030a', opacity: cfg.dark === undefined ? 0.94 : cfg.dark }, povW);
    const mk = $('mask', { id: 'povMask', maskUnits: 'userSpaceOnUse', x: -300, y: -300, width: 1680, height: 2500 }, defs); $('rect', { x: -300, y: -300, width: 1680, height: 2500, fill: '#fff' }, mk);
    povCone = [$('polygon', { fill: '#c0c0c0' }, mk), $('polygon', { fill: '#808080' }, mk), $('polygon', { fill: '#000' }, mk)]; povDark.setAttribute('mask', 'url(#povMask)');
    povBeam = $('polygon', { fill: 'url(#gBeamL)', style: 'mix-blend-mode:screen' }, povW);   // warm flashlight light on the nearest trunks
    povFlies = []; for (let i = 0; i < 16; i++) { const g = $('g', {}, povW); $('circle', { r: 24, fill: 'url(#gFly)' }, g); $('circle', { r: 3.6, fill: '#fff2a8' }, g); povFlies.push({ g, X: (r() - 0.5) * 9, Y: 0.4 + r() * 2.4, ph: r() * 20, sp: 0.5 + r() * 1.2 }); }
    povHand = $('g', {}, povG);                                              // kid's striped sleeve + hand + oversized flashlight
    $('polygon', { points: '840,1920 950,1730 1180,1730 1180,2030 780,2030', fill: '#7a84bc' }, povHand); $('polygon', { points: '950,1730 1180,1730 1180,1796 930,1784', fill: '#98a2d6' }, povHand);
    for (let i = 0; i < 4; i++) { const y = 1790 + i * 56; $('polygon', { points: `${920 - i * 26},${y + 70} ${1180},${y} ${1180},${y + 26} ${900 - i * 26},${y + 96}`, fill: '#56609a' }, povHand); }
    $('polygon', { points: '938,1740 1000,1700 1010,1760 944,1790', fill: '#e0b8a4' }, povHand);
    povHand.__fl = $('g', {}, povHand); const f = povHand.__fl;
    $('rect', { x: -70, y: -52, width: 380, height: 104, rx: 22, fill: '#3e466a' }, f); $('rect', { x: -70, y: -52, width: 380, height: 22, rx: 11, fill: '#6a74a0' }, f); $('rect', { x: 120, y: -52, width: 36, height: 104, fill: '#c4121f' }, f); $('rect', { x: 250, y: -76, width: 110, height: 152, rx: 26, fill: '#4a5482' }, f);
    $('ellipse', { cx: 362, cy: 0, rx: 18, ry: 70, fill: '#fff6c8' }, f); $('circle', { cx: 372, cy: 0, r: 150, fill: 'url(#gGold)', opacity: 0.8 }, f);
    for (let i = 0; i < 4; i++) $('ellipse', { cx: 30 + i * 36, cy: 52, rx: 20, ry: 28, fill: '#d2aa96' }, f); $('ellipse', { cx: 150, cy: -46, rx: 38, ry: 22, fill: '#e0b8a4' }, f);
  }
  function updatePov(t, info) {
    const s = info.s, lt = info.lt, f = 1000, horizon = 900, camH = 1.1, speed = s.speed === undefined ? 3.0 : s.speed, Dn = 1.3, Df = 26, step = 1.9;
    const bob = 14 * Math.abs(Math.sin(Math.PI * step * t)) * (speed > 0 ? 1 : 0.2), breath = 4 * Math.sin(2 * Math.PI * 0.27 * t), roll = 1.4 * Math.sin(Math.PI * step * t + 0.5) * (speed > 0 ? 1 : 0.3);
    povW.setAttribute('transform', `translate(${f2(4 * Math.sin(Math.PI * step * t))} ${f2(bob + breath)}) rotate(${f2(roll)} 540 960)`);
    povRev.setAttribute('opacity', f2(s.reveal ? clamp(lt / (s.revealT || 1)) * s.reveal : 0));
    const D0 = lt * speed + (s.start || 0);
    const items = povTrees.map((o) => { let D = Df - (((o.ph + D0) % (Df - Dn)) + (Df - Dn)) % (Df - Dn); return { o, D }; }).sort((a, b) => b.D - a.D);
    for (const { o, D } of items) {
      const k = f / D, sx = 540 + o.X * k, base = horizon + camH * k, fogK = clamp((D - 3) / 21), col = mixc('#04060e', '#303a74', Math.pow(fogK, 0.8)), op = clamp((Df - D) / 3) * clamp((D - 1.25) / 1.0);
      povGrp[D > 9 ? 0 : D > 3.4 ? 1 : 2].appendChild(o.g);
      o.g.setAttribute('opacity', f2(op)); o.g.setAttribute('display', op <= 0.01 || sx < -700 || sx > 1800 ? 'none' : 'inline');
      const lit = mixc(col, '#7f8cd2', 0.4 * (1 - fogK)), dk = mixc(col, '#000000', 0.5), mid = mixc(col, '#1a2048', 0.45 * (1 - fogK));
      const tx = sx - o.w * k / 2, ty = base - o.h * k, tw = o.w * k, th = o.h * k;
      o.trunk.setAttribute('fill', mid); o.trunk.setAttribute('x', f2(tx)); o.trunk.setAttribute('y', f2(ty)); o.trunk.setAttribute('width', f2(tw)); o.trunk.setAttribute('height', f2(th));
      o.shade.setAttribute('fill', dk); o.shade.setAttribute('x', f2(tx + tw * 0.62)); o.shade.setAttribute('y', f2(ty)); o.shade.setAttribute('width', f2(tw * 0.38)); o.shade.setAttribute('height', f2(th));
      o.vol.setAttribute('x', f2(tx)); o.vol.setAttribute('y', f2(ty)); o.vol.setAttribute('width', f2(tw)); o.vol.setAttribute('height', f2(th));
      o.bark.forEach((bk, i) => { bk.setAttribute('fill', dk); bk.setAttribute('x', f2(tx + tw * (0.2 + i * 0.3))); bk.setAttribute('y', f2(ty + th * 0.4)); bk.setAttribute('width', f2(Math.max(1, tw * 0.05))); bk.setAttribute('height', f2(th * 0.6)); });
      const step_ = (o.h - 4) / 4.2;
      o.bk.forEach((p, i) => { const y0 = base - (2.6 + i * step_ * 1.5) * k, hw = (2.5 - i * 0.55) * o.sz * k, hh = (step_ * 1.9 + 2) * k; p.setAttribute('fill', dk); p.setAttribute('points', `${f2(sx - hw)},${f2(y0)} ${f2(sx)},${f2(y0 - hh)} ${f2(sx + hw)},${f2(y0)}`); });
      o.tiers.forEach((p, i) => { const y0 = base - (2.3 + i * step_) * k, hw = (1.8 - i * 0.3) * o.sz * k, hh = (step_ + 2.2) * k; const c = i % 2 ? dk : col;
        p.setAttribute('fill', c); p.setAttribute('points', `${f2(sx - hw)},${f2(y0)} ${f2(sx - hw * 0.35)},${f2(y0 - hh * 0.45)} ${f2(sx)},${f2(y0 - hh)} ${f2(sx + hw * 0.35)},${f2(y0 - hh * 0.45)} ${f2(sx + hw)},${f2(y0)}`);
        const t2 = o.tops[i]; t2.setAttribute('fill', lit); t2.setAttribute('points', `${f2(sx - hw * 0.42)},${f2(y0 - hh * 0.4)} ${f2(sx)},${f2(y0 - hh)} ${f2(sx - hw * 0.05)},${f2(y0 - hh * 0.4)}`); });
    }
    povFog.forEach((q) => { q.e.setAttribute('cx', f2(((q.x0 + t * q.sp) % 2000) - 400)); q.e.setAttribute('cy', q.y); });
    povFogL.forEach((e, i) => e.setAttribute('cx', f2(540 + 60 * Math.sin(t * 0.3 + i))));
    povFlies.forEach((q) => { const D = Df * 0.9 - (((q.ph * 3 + D0 * q.sp * 0.6) % 14) + 14) % 14 - 0.6; const k = f / Math.max(1.0, D + 2); const x = 540 + (q.X + 0.8 * Math.sin(t * 0.7 + q.ph)) * k * 0.6, y = horizon - (q.Y + 0.25 * Math.sin(t * 1.1 + q.ph)) * k * 0.55 + 140; q.g.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) scale(${f2(clamp(k / 220, 0.25, 2.4))})`); q.g.setAttribute('opacity', f2((0.55 + 0.45 * Math.sin(t * 2.4 + q.ph)) * clamp((D + 2) / 3))); });
    const O = [940, 1770], tx = 540 + (s.sweep === undefined ? 300 : s.sweep) * Math.sin(lt * 0.85 + (s.phase || 0.5)) + (s.aimX || 0), ty = 780 + 70 * Math.sin(lt * 1.3) + (s.aimY || 0), th = Math.atan2(ty - O[1], tx - O[0]), hw = s.cone || 0.2;
    const cone = (w, len) => `${O[0]},${O[1]} ${f2(O[0] + Math.cos(th - w) * len)},${f2(O[1] + Math.sin(th - w) * len)} ${f2(O[0] + Math.cos(th + w) * len)},${f2(O[1] + Math.sin(th + w) * len)}`;
    povCone[0].setAttribute('points', cone(hw * 1.7, 2800)); povCone[1].setAttribute('points', cone(hw * 1.3, 2800)); povCone[2].setAttribute('points', cone(hw * 0.95, 2800)); povBeam.setAttribute('points', cone(hw * 1.0, 2000));
    povBeamG.setAttribute('x1', O[0]); povBeamG.setAttribute('y1', O[1]); povBeamG.setAttribute('x2', f2(O[0] + Math.cos(th) * 1500)); povBeamG.setAttribute('y2', f2(O[1] + Math.sin(th) * 1500));
    povDark.setAttribute('opacity', f2((s.dark === undefined ? 0.94 : s.dark) * (0.985 + 0.015 * Math.sin(t * 31))));
    povHand.setAttribute('transform', `translate(${f2(3 * Math.sin(Math.PI * step * t + 1))} ${f2(bob * 0.5 + breath * 1.4)})`);
    povHand.__fl.setAttribute('transform', `translate(${O[0]} ${O[1]}) rotate(${f2(th * 57.2958)})`);
  }
  // ---- OTS-KID foreground: the kid's hooded back, big and blurred at the bottom corner
  function buildOts() {
    otsG = $('g', { display: 'none' }, svg); const g = $('g', {}, otsG); otsG.__in = g;
    $('polygon', { points: '560,1480 1400,1000 1400,1700', fill: '#fff0b8', opacity: 0.07 }, g); $('polygon', { points: '560,1480 1400,1180 1400,1560', fill: '#fff0b8', opacity: 0.08 }, g);
    otsG.__scarf = $('path', { fill: '#c4121f' }, g); otsG.__scarf2 = $('path', { fill: '#8a0d18' }, g);
    const cp = $('clipPath', { id: 'clipCoat' }, defs); $('path', { d: 'M-160 2000 Q-100 1700 110 1640 L440 1640 Q660 1700 740 2000Z' }, cp);
    $('path', { d: 'M-160 2000 Q-100 1700 110 1640 L440 1640 Q660 1700 740 2000Z', fill: '#7a84bc' }, g);                       // baggy pyjama top, back view
    const cg = $('g', { 'clip-path': 'url(#clipCoat)' }, g); for (let y = 1680; y < 2040; y += 64) $('rect', { x: -200, y, width: 1000, height: 26, fill: '#56609a' }, cg); $('rect', { x: 430, y: 1600, width: 400, height: 500, fill: '#6a74a8', opacity: 0.5 }, cg);
    $('path', { d: 'M250 1690 L262 2000', stroke: '#4a5488', 'stroke-width': 7, opacity: 0.7 }, g);
    // flashlight arm: striped sleeve, hand, oversized flashlight
    const sl = $('g', {}, g); $('polygon', { points: '430,1730 490,1650 650,1520 722,1590 530,1790', fill: '#8a94c8' }, sl); $('polygon', { points: '490,1650 650,1520 672,1550 520,1676', fill: '#a0abdc' }, sl);
    for (const [x0, y0, x1, y1] of [[520, 1690, 560, 1760], [570, 1650, 610, 1720], [620, 1612, 656, 1680]]) $('polygon', { points: `${x0},${y0} ${x1},${y1} ${x1 + 22},${y1 - 14} ${x0 + 22},${y0 - 14}`, fill: '#56609a' }, sl);
    $('ellipse', { cx: 676, cy: 1558, rx: 44, ry: 38, fill: '#e0b8a4' }, g);
    const fl = $('g', { transform: 'translate(654 1538) rotate(-24)' }, g);
    $('rect', { x: -30, y: -44, width: 270, height: 88, rx: 20, fill: '#3e466a' }, fl); $('rect', { x: -30, y: -44, width: 270, height: 18, rx: 9, fill: '#6a74a0' }, fl); $('rect', { x: 60, y: -44, width: 28, height: 88, fill: '#c4121f' }, fl); $('rect', { x: 180, y: -64, width: 90, height: 128, rx: 22, fill: '#4a5482' }, fl);
    $('ellipse', { cx: 272, cy: 0, rx: 14, ry: 56, fill: '#fff6c8' }, fl); $('circle', { cx: 282, cy: 0, r: 150, fill: 'url(#gGold)', opacity: 0.85 }, fl);
    for (let i = 0; i < 3; i++) $('ellipse', { cx: 20 + i * 30, cy: 40, rx: 17, ry: 24, fill: '#d2aa96' }, fl);
    // nape, ears, big messy hair seen from behind
    $('ellipse', { cx: 250, cy: 1640, rx: 92, ry: 70, fill: '#b8847e' }, g); $('ellipse', { cx: 250, cy: 1626, rx: 80, ry: 52, fill: '#c89488' }, g);
    $('ellipse', { cx: 6, cy: 1450, rx: 30, ry: 44, fill: '#c89488' }, g); $('ellipse', { cx: 494, cy: 1450, rx: 30, ry: 44, fill: '#c89488' }, g);
    const hairG = $('g', {}, g); otsG.__hair = hairG;
    $('ellipse', { cx: 250, cy: 1400, rx: 262, ry: 290, fill: '#2a2238' }, hairG);
    const hr = mulberry(33);
    for (let i = 0; i < 17; i++) { const th = (180 + i * 11.2) * Math.PI / 180, px = 250 + 250 * Math.cos(th), py = 1400 + 280 * Math.sin(th), len = 70 + hr() * 90, w = 26 + hr() * 20, ux = Math.cos(th) + (hr() - 0.5) * 0.5, uy = Math.sin(th) + (hr() - 0.5) * 0.3, nx = -uy, ny = ux; $('polygon', { points: `${f2(px - nx * w)},${f2(py - ny * w)} ${f2(px + ux * len)},${f2(py + uy * len)} ${f2(px + nx * w)},${f2(py + ny * w)}`, fill: i % 3 === 0 ? '#4a3e66' : '#2a2238' }, hairG); }
    $('ellipse', { cx: 300, cy: 1260, rx: 150, ry: 90, fill: '#3a2f52', opacity: 0.7 }, hairG); $('path', { d: 'M130 1500 Q200 1380 250 1300 M330 1520 Q380 1400 330 1290', stroke: '#1c1628', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, hairG);
    $('path', { d: 'M440 1230 Q520 1380 486 1560', stroke: '#c4d0fa', 'stroke-width': 9, fill: 'none', opacity: 0.8, 'stroke-linecap': 'round' }, g);                         // moon rim light
    $('path', { d: 'M0 1690 Q250 1760 500 1690 L520 1790 Q250 1860 -20 1790Z', fill: '#c4121f' }, g); $('path', { d: 'M0 1730 Q250 1800 500 1730 L506 1780 Q250 1850 -12 1780Z', fill: '#a30d1a' }, g); $('ellipse', { cx: 150, cy: 1790, rx: 62, ry: 48, fill: '#8a0d18' }, g);
  }
  function updateOts(t, info) {
    const s = info.s, show = s.type === 'ots'; otsG.setAttribute('display', show ? 'inline' : 'none'); if (!show) return;
    const side = s.side === 'right' ? -1 : 1, br = 5 * Math.sin(2 * Math.PI * 0.3 * t);
    otsG.__in.setAttribute('transform', `translate(${side < 0 ? 1080 : 0} ${f2(br)}) scale(${side} 1) translate(${s.fgX || 0} ${s.fgY || 0})`);
    const w1 = Math.sin(t * 5.2), w2 = Math.sin(t * 6.4 + 1.3), tail = (a, b) => `M110 1740 C60 1760 ${-20 + 20 * w1} ${1700 + 40 * w2 + a} ${-140 + 40 * w2} ${1640 + 60 * w1 + a} L${-160 + 30 * w1} ${1700 + 40 * w2 + a + b} C${-20 + 20 * w2} ${1790 + 30 * w1} 60 1820 150 1800Z`;
    otsG.__scarf.setAttribute('d', tail(0, 40)); otsG.__scarf2.setAttribute('d', tail(18, 26));
    otsG.__hair.setAttribute('transform', `rotate(${f2(1.2 * Math.sin(t * 1.9))} 250 1500) translate(0 ${f2(3 * Math.sin(t * 2.6))})`);
    const fb = s.rack && s.rack.fg !== undefined ? s.rack.fg : 9; otsG.style.filter = `blur(${fb}px)`;
  }
  function updateCrash(sh) { if (!crashG) return; const w = sh ? sh.crash : 0; crashG.setAttribute('display', w > 0.01 ? 'inline' : 'none'); if (w > 0.01) Array.from(crashG.children).forEach((e) => e.setAttribute('opacity', f2(0.55 * w))); }

  // ------------------------------------------------------------------ public API
  G.loadTimeline = function (tl) {
    TL = tl; props = []; fxList = []; textList = []; splits = []; hud = null; layers = {}; room = {}; povG = null; povTrees = [];
    document.body.innerHTML = ''; svg = $('svg', { xmlns: G.NS, width: W, height: H, viewBox: `0 0 ${W} ${H}` }); document.body.appendChild(svg);
    buildDefs(); buildArena(); setupActors(); buildProps(); buildFx();
    TL.shots = (TL.shots || []).slice().sort((a, b) => a.t - b.t); TL.scenes = TL.scenes || []; TL.slow = (TL.slow || []).slice();
    TL.shots.forEach((sh, i) => { if (sh.scene) TL.scenes.push({ t0: sh.t, s: sh.scene }); if (sh.slow) TL.slow.push({ t0: sh.t, t1: i + 1 < TL.shots.length ? TL.shots[i + 1].t : TL.duration, rate: sh.slow }); if (sh.type === 'pov' && !povG) buildPov(sh); });
    TL.scenes.sort((a, b) => a.t0 - b.t0);
    for (const s of (TL.splits || (TL.split ? [TL.split] : []))) buildSplit(s);
    buildOts(); crashG = $('g', { display: 'none' }, svg); for (let i = 0; i < 30; i++) { const a = i / 30 * 6.283 + 0.1; $('polygon', { points: `${540 + Math.cos(a) * 200},${960 + Math.sin(a) * 200} ${540 + Math.cos(a + 0.012) * 1500},${960 + Math.sin(a + 0.012) * 1500} ${540 + Math.cos(a - 0.012) * 1500},${960 + Math.sin(a - 0.012) * 1500}`, fill: '#fff' }, crashG); }
    buildText(); buildHud();
    $('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#gVig)' }, svg); vigEl = svg.lastChild;
    tintEl = $('rect', { x: 0, y: 0, width: W, height: H, fill: '#c4121f', opacity: 0 }, svg);
    if (hud) svg.appendChild(hud.g); textList.forEach((o) => svg.appendChild(o.g));
    glitchG = $('g', { display: 'none' }, svg); for (let i = 0; i < 10; i++) $('rect', { x: 0, y: 0, width: W, height: 20, fill: '#fff', opacity: 0.2 }, glitchG);
    blackEl = $('rect', { x: 0, y: 0, width: W, height: H, fill: '#000', opacity: 0 }, svg);
    flashEl = $('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff', opacity: 0 }, svg);
    fitText(); G.renderFrame(0);
  };
  G.renderFrame = function (t) {
    const ta = actorTime(t), info = shotInfo(t);
    const shk = shakeAt(t);
    const sp = splits.find((s) => t >= (s.cfg.t0 || 0) && t <= s.cfg.end && s.cfg.opaque !== false);
    const sceneOn = !splits.length || splits.every((s) => !(t >= (s.cfg.t0 || 0) && t < s.cfg.shatter - 0.05 && s.cfg.opaque !== false));
    const isPov = info && info.s.type === 'pov' && povG;
    const sc = sceneVis(t);
    arena.setAttribute('display', sceneOn && !isPov ? 'inline' : 'none');
    if (sceneOn) updateActors(t, ta);
    let cam = stateTrack(TL.cam || [], t, TL.camInit || { cx: 540, cy: 960, zoom: 1 }), shotX = null;
    if (info && !isPov) { shotX = shotCam(t, info); cam = shotX; }
    curShot = shotX;
    let sk = shk;
    if (shotX && shotX.whip) sk = [shk[0] + shotX.whip * shotX.whip * 520 * shotX.whipDir, shk[1]];
    updateScene(t, cam, sk, ta);
    if (sceneOn && !isPov) { updateProps(t, sc); updateFx(ta); }
    const bl = (shotX && shotX.whip ? 16 * shotX.whip : 0) + (shotX && shotX.rack && shotX.rack.bg ? shotX.rack.bg : 0);
    arena.style.filter = bl > 0.3 ? `blur(${f2(bl)}px)` : '';
    if (povG) { povG.setAttribute('display', isPov ? 'inline' : 'none'); if (isPov) { updatePov(t, info); const wb = info.s.whip && info.lt < info.s.whip ? 12 * (1 - info.lt / info.s.whip) : 0; povG.style.filter = wb > 0.3 ? `blur(${f2(wb)}px)` : ''; } }
    updateOts(t, info || { s: {} }); updateCrash(shotX);
    splits.forEach((s) => updateSplit(s, t));
    updateText(t); updateHud(t); updateOverlay(t);
    return true;
  };
  G.ANIM_READY = true;
})(window);
