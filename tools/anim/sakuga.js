// sakuga.js - "Sakuga Cinematic" extension for stage.js (loaded after stage.js; stage calls the hooks below).
// Adds: energy fx (beam, beam-clash, orbs, slash, pillar, glint), domain scenes (per-character lairs + one unified
// battlefield), rising terrain prop (monolith / spire), actor aura + rim light, cinema letterbox and screen embers.
// Everything is deterministic in t (no wall clock, no Math.random). See README.md "Sakuga" section for the JSON format.
(function (G) {
  const { $, clamp, lerp, ease, EASE, mulberry, hash, f2 } = G;
  const W = 1080, H = 1920;
  let C = null;                       // ctx from stage.js: { TL, svg, defs, arena, layers, PAR, SCN_VIS, trk, track, markerWorld, sceneAt }
  const gid = (() => { let n = 0; return (p) => p + '_' + (++n); })();
  function radial(color, stops) { const id = gid('sgR'); const g = $('radialGradient', { id }, C.defs); (stops || [[0, 0.95], [0.45, 0.4], [1, 0]]).forEach(([o, a]) => $('stop', { offset: o, 'stop-color': color, 'stop-opacity': a }, g)); return `url(#${id})`; }
  function linear(cols, x2 = 0, y2 = 1) { const id = gid('sgL'); const g = $('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, C.defs); cols.forEach((c, i) => $('stop', { offset: i / Math.max(1, cols.length - 1), 'stop-color': c }, g)); return `url(#${id})`; }
  const P = (pts) => pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ');
  const FR = (t) => Math.floor(t * 30);
  const sm01 = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

  // ---------------------------------------------------------------- beams (shared by beam + beam-clash)
  // A beam = outer halo + mid body + vibrating white core + 2 lightning strands wrapped along it + head orb.
  function mkBeam(g, color, w) {
    const b = { color, w };
    b.halo = $('polygon', { fill: color, opacity: 0.28 }, g);
    b.mid = $('polygon', { fill: color, opacity: 0.85 }, g);
    b.core = $('polygon', { fill: '#ffffff' }, g);
    b.bolts = [0, 1, 2].map((i) => $('polyline', { fill: 'none', stroke: i === 2 ? color : '#ffffff', 'stroke-width': i === 2 ? 7 : 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.9 }, g));
    b.head = $('circle', { fill: radial(color) }, g); b.headCore = $('circle', { fill: '#fff' }, g);
    b.mouth = $('circle', { fill: radial(color) }, g);
    return b;
  }
  function setBeam(b, A, B, t, k, seed) {       // k = global intensity 0..1
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, fr = FR(t);
    const vib = 1 + 0.1 * Math.sin(t * 61 + seed) + 0.06 * Math.sin(t * 97), hw = b.w * 0.5 * k * vib;
    const quad = (w0, w1) => P([[A[0] + nx * w0, A[1] + ny * w0], [B[0] + nx * w1, B[1] + ny * w1], [B[0] - nx * w1, B[1] - ny * w1], [A[0] - nx * w0, A[1] - ny * w0]]);
    b.halo.setAttribute('points', quad(hw * 1.25, hw * 1.9)); b.mid.setAttribute('points', quad(hw * 0.7, hw * 1.05)); b.core.setAttribute('points', quad(hw * 0.22, hw * 0.36));
    b.bolts.forEach((e, j) => { const pts = []; const n = Math.max(6, Math.round(L / 70)); for (let i = 0; i <= n; i++) { const s = i / n, wrap = Math.sin(s * 9 + t * 40 * (j ? -1 : 1) + j * 2.1), jit = (hash(fr * 7.1 + i * 3.3 + j * 11 + seed) - 0.5) * hw * 0.9; const off = (wrap * hw * (j === 2 ? 1.5 : 1.15)) + jit; pts.push([A[0] + dx * s + nx * off, A[1] + dy * s + ny * off]); } e.setAttribute('points', P(pts)); e.setAttribute('opacity', f2(0.9 * k)); });
    const hr = hw * (2.1 + 0.25 * Math.sin(t * 43)); b.head.setAttribute('cx', f2(B[0])); b.head.setAttribute('cy', f2(B[1])); b.head.setAttribute('r', f2(hr * 1.4)); b.headCore.setAttribute('cx', f2(B[0])); b.headCore.setAttribute('cy', f2(B[1])); b.headCore.setAttribute('r', f2(hr * 0.42));
    b.mouth.setAttribute('cx', f2(A[0])); b.mouth.setAttribute('cy', f2(A[1])); b.mouth.setAttribute('r', f2(hw * 2.6));
  }
  function beamOpacity(b, a) { for (const k of ['halo', 'mid', 'core', 'head', 'headCore', 'mouth']) b[k].setAttribute('opacity', f2(a * (k === 'halo' ? 0.3 : k === 'mid' ? 0.85 : 1))); }
  // charge: orb growing at the origin with energy streaks converging into it
  function mkCharge(g, color) { const c = { orb: $('circle', { fill: radial(color) }, g), core: $('circle', { fill: '#fff' }, g), lines: [] }; for (let i = 0; i < 10; i++) c.lines.push($('polygon', { fill: i % 2 ? '#fff' : color }, g)); return c; }
  function setCharge(c, A, u, w, t, on) {
    if (!on) { c.orb.setAttribute('opacity', 0); c.core.setAttribute('opacity', 0); c.lines.forEach((e) => e.setAttribute('opacity', 0)); return; }
    const r = w * (0.3 + 1.1 * EASE.outCubic(u)) * (1 + 0.12 * Math.sin(t * 50));
    c.orb.setAttribute('cx', f2(A[0])); c.orb.setAttribute('cy', f2(A[1])); c.orb.setAttribute('r', f2(r * 1.9)); c.orb.setAttribute('opacity', 1);
    c.core.setAttribute('cx', f2(A[0])); c.core.setAttribute('cy', f2(A[1])); c.core.setAttribute('r', f2(r * 0.45)); c.core.setAttribute('opacity', 1);
    c.lines.forEach((e, i) => { const a = i / 10 * 6.283 + t * 3, q = ((t * 2.6 + i * 0.37) % 1), d0 = lerp(w * 5, r * 0.8, q), d1 = d0 + w * 1.2 * (1 - q), ca = Math.cos(a), sa = Math.sin(a), ww = 5 * (1 - q) + 1; e.setAttribute('points', P([[A[0] + ca * d0 - sa * ww, A[1] + sa * d0 + ca * ww], [A[0] + ca * d1, A[1] + sa * d1], [A[0] + ca * d0 + sa * ww, A[1] + sa * d0 - ca * ww]])); e.setAttribute('opacity', f2(Math.sin(q * Math.PI))); });
  }
  // burst at the target: star + rings + debris
  function mkBurst(g, color, n = 12) { const b = { star: $('polygon', { fill: '#fff' }, g), glow: $('circle', { fill: radial(color) }, g), rings: [0, 1].map((i) => $('circle', { fill: 'none', stroke: i ? color : '#fff', 'stroke-width': 10 }, g)), deb: [] }; for (let i = 0; i < n; i++) b.deb.push({ e: $('polygon', { fill: i % 3 ? '#fff' : color }, g), a: hash(i * 7.7 + 1) * 6.283, l: 0.6 + hash(i * 3.1) * 0.9, w: 6 + hash(i * 5.3) * 8 }); return b; }
  function setBurst(b, X, Y, R, u, on) {
    const els = [b.star, b.glow, ...b.rings, ...b.deb.map((d) => d.e)];
    if (!on || u < 0 || u > 1) { els.forEach((e) => e.setAttribute('opacity', 0)); return; }
    const e = EASE.outCubic(clamp(u * 1.8)), rr = R * (0.35 + e), pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, q = i % 2 ? rr * 0.42 : rr; pts.push([X + Math.cos(a) * q, Y + Math.sin(a) * q]); }
    b.star.setAttribute('points', P(pts)); b.star.setAttribute('opacity', f2(clamp(1.5 - u * 2)));
    b.glow.setAttribute('cx', f2(X)); b.glow.setAttribute('cy', f2(Y)); b.glow.setAttribute('r', f2(rr * 1.8)); b.glow.setAttribute('opacity', f2(clamp(1.3 - u * 1.3)));
    b.rings.forEach((r, i) => { const q = clamp(u * (1.2 - i * 0.25)); r.setAttribute('cx', f2(X)); r.setAttribute('cy', f2(Y)); r.setAttribute('r', f2(R * (0.4 + 2.2 * EASE.outCubic(q)))); r.setAttribute('stroke-width', f2(16 * (1 - q) + 1)); r.setAttribute('opacity', f2(clamp(1 - q))); });
    b.deb.forEach((d) => { const q = EASE.outCubic(clamp(u * 1.5)), d0 = R * (0.3 + d.l * 1.6 * q), d1 = d0 + R * 0.5 * (1 - u), ca = Math.cos(d.a), sa = Math.sin(d.a), w = d.w * (1 - u); d.e.setAttribute('points', P([[X + ca * d0 - sa * w, Y + sa * d0 + ca * w], [X + ca * d1, Y + sa * d1], [X + ca * d0 + sa * w, Y + sa * d0 - ca * w]])); d.e.setAttribute('opacity', f2(clamp(1.4 - u * 1.5))); });
  }

  // ---------------------------------------------------------------- fx registry
  const FX = {};
  // beam {t0,dur,x,y -> x2,y2, w=70, color, charge=0.35, grow=0.14, hit=true}
  FX.beam = {
    build(it) { const f = it.f, g = it.grp; it.ch = mkCharge(g, f.color || '#7ad8ff'); it.b = mkBeam(g, f.color || '#7ad8ff', f.w || 70); it.burst = mkBurst(g, f.color || '#7ad8ff'); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, dur = f.dur || 1.2, chg = f.charge === undefined ? 0.35 : f.charge, grow = f.grow || 0.14, A = [f.x, f.y], B0 = [f.x2, f.y2];
      setCharge(it.ch, A, clamp(lt / Math.max(chg, 1e-3)), f.w || 70, t, lt < chg + 0.08 && chg > 0);
      const lf = lt - chg, e = EASE.outCubic(clamp(lf / grow)), out = clamp((dur - lt) / 0.22), on = lf >= 0;
      if (!on) { beamOpacity(it.b, 0); it.b.bolts.forEach((x) => x.setAttribute('opacity', 0)); setBurst(it.burst, 0, 0, 0, -1, false); return; }
      const B = [lerp(A[0], B0[0], e), lerp(A[1], B0[1], e)], k = clamp(lf / 0.06) * out;
      setBeam(it.b, A, B, t, k, f.x); beamOpacity(it.b, k);
      setBurst(it.burst, B0[0], B0[1], f.r || 150, (lf - grow) / 0.7, f.hit !== false && e >= 1);
    },
  };
  // beam-clash {t0,dur, x,y (left origin), x2,y2 (right origin), colorL, colorR, w, amp=0.09, freq=4.5, win:'L'|'R'|null, winAt (s from t0)}
  FX['beam-clash'] = {
    build(it) { const f = it.f, g = it.grp; it.L = mkBeam(g, f.colorL || '#ff3a44', f.w || 74); it.R = mkBeam(g, f.colorR || '#ffe39a', f.w || 74); it.orb = $('circle', { fill: radial(f.colorL || '#ff3a44') }, g); it.orb2 = $('circle', { fill: radial(f.colorR || '#ffe39a') }, g); it.orbCore = $('circle', { fill: '#fff' }, g);
      it.rings = [0, 1, 2].map((i) => $('ellipse', { fill: 'none', stroke: i === 1 ? (f.colorR || '#ffe39a') : i ? '#fff' : (f.colorL || '#ff3a44'), 'stroke-width': 8 }, g));
      it.sp = Array.from({ length: 26 }, (_, i) => ({ e: $('polygon', { fill: i % 3 === 0 ? (f.colorL || '#ff3a44') : i % 3 === 1 ? (f.colorR || '#ffe39a') : '#fff' }, g), ph: hash(i * 9.1), a: hash(i * 4.7 + 2) })); it.burst = mkBurst(g, f.win === 'R' ? (f.colorR || '#ffe39a') : (f.colorL || '#ff3a44'), 16); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, dur = f.dur || 2.4, A = [f.x, f.y], B = [f.x2, f.y2], grow = 0.16;
      const e = EASE.outCubic(clamp(lt / grow)), out = clamp((dur - lt) / 0.2), winAt = f.winAt === undefined ? dur * 0.72 : f.winAt;
      let u = 0.5 + (f.amp === undefined ? 0.09 : f.amp) * Math.sin(lt * (f.freq || 4.5)) * Math.min(1, lt / 0.5) + 0.03 * Math.sin(lt * 17);
      const wq = f.win ? EASE.inCubic(clamp((lt - winAt) / Math.max(0.15, dur - winAt - 0.25))) : 0; if (f.win === 'L') u = lerp(u, 1.0, wq); if (f.win === 'R') u = lerp(u, 0.0, wq);
      const M = [lerp(A[0], B[0], u), lerp(A[1], B[1], u) + 10 * Math.sin(lt * 9)];
      const ML = [lerp(A[0], M[0], e), lerp(A[1], M[1], e)], MR = [lerp(B[0], M[0], e), lerp(B[1], M[1], e)];
      const lose = f.win ? clamp(wq * 1.4) : 0, kL = out * (f.win === 'R' ? 1 - lose : 1), kR = out * (f.win === 'L' ? 1 - lose : 1);
      setBeam(it.L, A, ML, t, kL, 1); beamOpacity(it.L, kL); setBeam(it.R, B, MR, t, kR, 7); beamOpacity(it.R, kR);
      const met = e >= 1, R = (f.w || 74) * (1.4 + 0.25 * Math.sin(t * 37)) * (met ? 1 : 0.3) * out;
      for (const [o, rr] of [[it.orb, R * 2.4], [it.orb2, R * 2.0], [it.orbCore, R * 0.55]]) { o.setAttribute('cx', f2(M[0])); o.setAttribute('cy', f2(M[1])); o.setAttribute('r', f2(rr)); o.setAttribute('opacity', met ? f2(out) : 0); }
      it.orb2.setAttribute('cx', f2(M[0] + 8 * Math.sin(t * 23)));
      it.rings.forEach((r, i) => { const q = ((lt * 2.6 + i / 3) % 1); r.setAttribute('cx', f2(M[0])); r.setAttribute('cy', f2(M[1])); r.setAttribute('rx', f2(R * (0.8 + 4.5 * q))); r.setAttribute('ry', f2(R * (0.8 + 4.5 * q) * 0.55)); r.setAttribute('stroke-width', f2(10 * (1 - q) + 1)); r.setAttribute('opacity', met ? f2((1 - q) * out) : 0); });
      it.sp.forEach((s, i) => { const q = ((lt * 2.2 + s.ph) % 1), a = (s.a - 0.5) * 2.6 + (i % 2 ? Math.PI : 0) + Math.PI / 2 * (i % 4 < 2 ? 1 : -1) * 0.5, d0 = R * 0.6 + q * R * 5.5, d1 = d0 + R * 1.3 * (1 - q), ca = Math.cos(a), sa = Math.sin(a), w = 6 * (1 - q) + 1; s.e.setAttribute('points', P([[M[0] + ca * d0 - sa * w, M[1] + sa * d0 + ca * w], [M[0] + ca * d1, M[1] + sa * d1 + 160 * q * q], [M[0] + ca * d0 + sa * w, M[1] + sa * d0 - ca * w]])); s.e.setAttribute('opacity', met ? f2(Math.sin(q * Math.PI) * out) : 0); });
      const tgt = f.win === 'L' ? B : A; setBurst(it.burst, tgt[0], tgt[1], f.r || 190, (u >= 0.97 || u <= 0.03) ? (lt - (winAt + (dur - winAt) * 0.55)) / 0.6 : -1, !!f.win);
    },
  };
  // orbs {t0,x,y -> x2,y2, n=5, stagger=0.12, fly=0.55, arc=260, r=26, color}  homing energy orbs on arcs, with comet trails
  FX.orbs = {
    build(it) { const f = it.f, g = it.grp, col = f.color || '#b48cff'; it.o = Array.from({ length: f.n || 5 }, (_, i) => ({ trail: Array.from({ length: 7 }, () => $('circle', { fill: col }, g)), glow: $('circle', { fill: radial(col) }, g), core: $('circle', { fill: '#fff' }, g), burst: mkBurst(g, col, 8), side: i % 2 ? 1 : -1, h: 0.6 + 0.8 * hash(i * 3.7 + (f.seed || 0)), jx: (hash(i * 1.9) - 0.5) * 80, jy: (hash(i * 2.3) - 0.5) * 80 })); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, fly = f.fly || 0.55, A = [f.x, f.y], R = f.r || 26, dx = f.x2 - f.x, dy = f.y2 - f.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      it.o.forEach((o, i) => {
        const B = [f.x2 + o.jx, f.y2 + o.jy], Cc = [(A[0] + B[0]) / 2 + nx * (f.arc || 260) * o.side * o.h, (A[1] + B[1]) / 2 + ny * (f.arc || 260) * o.side * o.h];
        const at = (s) => [(1 - s) * (1 - s) * A[0] + 2 * (1 - s) * s * Cc[0] + s * s * B[0], (1 - s) * (1 - s) * A[1] + 2 * (1 - s) * s * Cc[1] + s * s * B[1]];
        const ls = lt - i * (f.stagger || 0.12), s = ls / fly, flying = s >= 0 && s < 1;
        const p = at(clamp(EASE.inOut(clamp(s)))), pul = 1 + 0.2 * Math.sin(t * 40 + i);
        o.glow.setAttribute('cx', f2(p[0])); o.glow.setAttribute('cy', f2(p[1])); o.glow.setAttribute('r', f2(R * 2.6 * pul)); o.glow.setAttribute('opacity', flying ? 1 : 0);
        o.core.setAttribute('cx', f2(p[0])); o.core.setAttribute('cy', f2(p[1])); o.core.setAttribute('r', f2(R * 0.55 * pul)); o.core.setAttribute('opacity', flying ? 1 : 0);
        o.trail.forEach((e, k) => { const q = at(clamp(EASE.inOut(clamp(s - (k + 1) * 0.045)))); e.setAttribute('cx', f2(q[0])); e.setAttribute('cy', f2(q[1])); e.setAttribute('r', f2(R * (0.9 - k * 0.11))); e.setAttribute('opacity', flying && s - (k + 1) * 0.045 > 0 ? f2(0.55 * (1 - k / 7)) : 0); });
        setBurst(o.burst, B[0], B[1], R * 3.2, (ls - fly) / 0.45, true);
      });
    },
  };
  // slash {t0,x,y -> x2,y2, r=230, fly=0.32, color, flipV}  crescent energy blade crossing the screen
  FX.slash = {
    build(it) { const f = it.f, g = it.grp, col = f.color || '#9affe0'; it.copies = [0.75, 0.5, 0.3].map((a) => $('polygon', { fill: col, opacity: a * 0.6 }, g)); it.glow = $('polygon', { fill: col, opacity: 0.35 }, g); it.main = $('polygon', { fill: col }, g); it.core = $('polygon', { fill: '#fff' }, g); it.burst = mkBurst(g, col, 10); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, fly = f.fly || 0.32, R = f.r || 230, ang = Math.atan2(f.y2 - f.y, f.x2 - f.x) * 180 / Math.PI, fv = f.flipV ? -1 : 1;
      const cres = (r, th) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = -1.15 + 2.3 * i / 16; pts.push([Math.cos(a) * r, Math.sin(a) * r * fv]); } for (let i = 16; i >= 0; i--) { const a = -1.15 + 2.3 * i / 16, q = Math.abs(a) / 1.15; pts.push([Math.cos(a) * r * (1 - th * (1 - q * q)) - r * th * 0.4 * (1 - q * q), Math.sin(a) * r * (1 - th * (1 - q * q)) * fv]); } return P(pts); };
      const place = (e, s, sc) => { const x = lerp(f.x, f.x2, s), y = lerp(f.y, f.y2, s); e.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) rotate(${f2(ang)}) scale(${f2(sc)})`); };
      const s = lt / fly, on = s >= 0 && s <= 1.05, grow = 0.6 + 0.4 * EASE.outCubic(clamp(s * 3));
      [it.glow, it.main, it.core].forEach((e, k) => { e.setAttribute('points', cres(R * [1.12, 1, 0.92][k], [0.34, 0.24, 0.08][k])); place(e, clamp(s), grow); e.setAttribute('opacity', on ? [0.35, 0.95, 1][k] : 0); });
      it.copies.forEach((e, k) => { e.setAttribute('points', cres(R * 0.98, 0.2)); place(e, clamp(s - (k + 1) * 0.08), grow * (1 - k * 0.08)); e.setAttribute('opacity', on && s - (k + 1) * 0.08 > 0 ? f2(0.45 - k * 0.12) : 0); });
      setBurst(it.burst, f.x2, f.y2, f.br || 150, (lt - fly) / 0.5, f.hit !== false);
    },
  };
  // pillar {t0,dur,x,y (ground), w=180, h=1700, color}  column of light erupting skyward (intro: keep dur ~0.75 s so faces stay clear)
  FX.pillar = {
    build(it) { const f = it.f, g = it.grp, col = f.color || '#ffe39a'; it.ringG = $('ellipse', { fill: radial(col) }, g); it.ring = $('ellipse', { fill: 'none', stroke: col, 'stroke-width': 10 }, g); it.outer = $('rect', { fill: col, opacity: 0.25 }, g); it.mid = $('rect', { fill: col, opacity: 0.6 }, g); it.core = $('rect', { fill: '#fff' }, g); it.top = $('ellipse', { fill: radial(col) }, g); it.motes = Array.from({ length: 16 }, (_, i) => ({ e: $('circle', { r: 4 + (i % 3) * 2, fill: i % 2 ? '#fff' : col }, g), x: hash(i * 5.1 + 3) - 0.5, ph: hash(i * 2.7) })); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, dur = f.dur || 0.75, u = lt / dur, w = f.w || 180, h = f.h || 1700, X = f.x, Y = f.y;
      const up = EASE.outCubic(clamp(lt / 0.16)), out = clamp((1 - u) / 0.45), ww = w * (0.35 + 0.65 * up) * (1 + 0.05 * Math.sin(t * 50)), hh = h * up;
      for (const [e, k, a] of [[it.outer, 1.7, 0.25], [it.mid, 1, 0.6], [it.core, 0.28, 1]]) { e.setAttribute('x', f2(X - ww * k / 2)); e.setAttribute('y', f2(Y - hh)); e.setAttribute('width', f2(ww * k)); e.setAttribute('height', f2(hh)); e.setAttribute('rx', f2(ww * k / 2)); e.setAttribute('opacity', f2(a * out)); }
      it.top.setAttribute('cx', f2(X)); it.top.setAttribute('cy', f2(Y - hh)); it.top.setAttribute('rx', f2(ww * 1.4)); it.top.setAttribute('ry', f2(ww)); it.top.setAttribute('opacity', f2(out));
      const rq = EASE.outCubic(clamp(lt / 0.5)); it.ring.setAttribute('cx', X); it.ring.setAttribute('cy', Y); it.ring.setAttribute('rx', f2(w * (0.6 + 2.6 * rq))); it.ring.setAttribute('ry', f2(w * (0.6 + 2.6 * rq) * 0.2)); it.ring.setAttribute('stroke-width', f2(12 * (1 - rq) + 1)); it.ring.setAttribute('opacity', f2(1 - rq));
      it.ringG.setAttribute('cx', X); it.ringG.setAttribute('cy', Y); it.ringG.setAttribute('rx', f2(w * 2.2)); it.ringG.setAttribute('ry', f2(w * 0.45)); it.ringG.setAttribute('opacity', f2(out));
      it.motes.forEach((m) => { const q = (lt * 0.9 + m.ph) % 1; m.e.setAttribute('cx', f2(X + m.x * ww * 1.6 + 14 * Math.sin(q * 12))); m.e.setAttribute('cy', f2(Y - q * hh)); m.e.setAttribute('opacity', f2(Math.sin(q * Math.PI) * out)); });
    },
  };
  // glint {t0,dur=0.5, actor, at:'eye', color, r=90}  lens-flare star locked on a rig marker (eye flash)
  FX.glint = {
    build(it) { const f = it.f, g = it.grp; it.g = $('circle', { fill: radial(f.color || '#fff6c8') }, g); it.s1 = $('polygon', { fill: '#fff' }, g); it.s2 = $('polygon', { fill: f.color || '#fff6c8' }, g); },
    update(it, t) {
      const f = it.f, lt = t - f.t0, u = lt / (f.dur || 0.5), mk = C.markerWorld(f.actor, f.at || 'eye'); if (!mk) { it.grp.setAttribute('display', 'none'); return; }
      const R = (f.r || 90) * Math.sin(Math.PI * clamp(u)) , X = mk.x, Y = mk.y, star = (r, w, rot) => { const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + rot, q = i % 2 ? w : r; pts.push([X + Math.cos(a) * q, Y + Math.sin(a) * q]); } return P(pts); };
      it.g.setAttribute('cx', f2(X)); it.g.setAttribute('cy', f2(Y)); it.g.setAttribute('r', f2(R * 0.9)); it.s1.setAttribute('points', star(R * 1.6, R * 0.08, 0)); it.s2.setAttribute('points', star(R * 0.8, R * 0.06, 0.785 + lt * 2));
    },
  };

  // ---------------------------------------------------------------- domains (scene 'domain-<key>')
  // domains:{ key:{ sky:[top,bottom], glow, floor:[top,bottom], motif:'monoliths'|'spires'|'columns'|'runes'|'none', sigil:color|null, motes:color, horizon:900 } }
  const MOTIF = {
    monoliths(g, d, r) {        // tilted cyclopean slabs (R'lyeh-like), cracks glow
      for (let i = 0; i < 9; i++) { const x = -300 + i * 210 + r() * 80, h = 520 + r() * 640, w = 110 + r() * 120, tilt = (r() - 0.5) * 26, base = d.horizon + 40 + r() * 40; const s = $('g', { transform: `rotate(${f2(tilt)} ${f2(x)} ${f2(base)})` }, g); $('polygon', { points: P([[x - w / 2, base], [x - w * 0.42, base - h], [x + w * 0.3, base - h - 40 * r()], [x + w / 2, base]]), fill: d.rock || '#0f1418' }, s); $('polyline', { points: P([[x - w * 0.1, base - h * 0.9], [x + w * 0.08, base - h * 0.6], [x - w * 0.05, base - h * 0.35], [x + w * 0.1, base - h * 0.1]]), fill: 'none', stroke: d.glow, 'stroke-width': 4, opacity: 0.8, 'data-pulse': i }, s); }
    },
    spires(g, d, r) {           // jagged thorns of rock, hell-ish
      for (let i = 0; i < 16; i++) { const x = -400 + i * 130 + r() * 60, h = 260 + r() * 700, w = 50 + r() * 90, base = d.horizon + 60; $('polygon', { points: P([[x - w, base], [x - w * 0.2, base - h * 0.55], [x - w * 0.5, base - h * 0.6], [x + r() * 20, base - h], [x + w * 0.4, base - h * 0.45], [x + w, base]]), fill: d.rock || '#14070a' }, g); }
    },
    columns(g, d, r) {          // temple colonnade + light shafts (guardian sanctum)
      for (let i = 0; i < 7; i++) { const x = -260 + i * 270, base = d.horizon + 60, h = 900, w = 90; $('rect', { x: x - w / 2, y: base - h, width: w, height: h, fill: d.rock || '#1d2550' }, g); $('rect', { x: x - w / 2 - 20, y: base - h - 40, width: w + 40, height: 40, fill: d.rock || '#1d2550' }, g); $('rect', { x: x - w / 2 - 14, y: base - 30, width: w + 28, height: 30, fill: d.rock || '#1d2550' }, g); for (let k = -1; k <= 1; k++) $('rect', { x: x + k * 26 - 4, y: base - h + 10, width: 8, height: h - 50, fill: '#000', opacity: 0.18 }, g); }
      for (let i = 0; i < 5; i++) { const x = -100 + i * 320; $('polygon', { points: P([[x, -400], [x + 140, -400], [x + 420, d.horizon + 200], [x + 160, d.horizon + 200]]), fill: d.glow, opacity: 0.08, 'data-shaft': i }, g); }
    },
    runes(g, d, r) {            // floating rune stones
      for (let i = 0; i < 10; i++) { const x = -200 + i * 170 + r() * 60, y = 300 + r() * 450, s = 40 + r() * 40; const e = $('g', { 'data-float': i, 'data-x': x, 'data-y': y }, g); $('polygon', { points: P([[-s, -s * 1.3], [s * 0.8, -s * 1.5], [s, s * 1.2], [-s * 0.9, s * 1.4]]), fill: d.rock || '#1a1f3a' }, e); $('path', { d: `M${-s * 0.3} ${-s * 0.7} L${s * 0.2} 0 L${-s * 0.3} ${s * 0.7} M${s * 0.2} 0 L${s * 0.5} ${-s * 0.5}`, stroke: d.glow, 'stroke-width': 5, fill: 'none' }, e); }
    },
    ruins(g, d, r) {            // desert ruins (ep #003): 3 dune layers, broken temple columns, toppled pharaoh head, obelisk
      const rock = d.rock || '#241a2c', sand = d.sand || ['#33233a', '#2a1c33', '#21162b'], hz = d.horizon;
      const dune = (amp, y0, col, seed, step) => { const pts = [[-1600, hz + 120]]; for (let x = -1600; x <= 2700; x += step) pts.push([x, y0 - amp * (0.55 + 0.45 * Math.sin(x * 0.0042 + seed) * Math.cos(x * 0.0017 + seed * 2.3)) - amp * 0.25 * Math.sin(x * 0.011 + seed * 5)]); pts.push([2700, hz + 120]); $('polygon', { points: P(pts), fill: col }, g); };
      dune(190, hz - 20, sand[0], 1.3, 60);
      // obelisk (far left) + temple pylon
      { const x = 150, b = hz + 10, h = 860, w = 92; $('polygon', { points: P([[x - w / 2, b], [x - w * 0.34, b - h], [x, b - h - 70], [x + w * 0.34, b - h], [x + w / 2, b]]), fill: rock }, g);
        $('polygon', { points: P([[x - w / 2, b], [x - w * 0.34, b - h], [x - w * 0.18, b - h], [x - w * 0.26, b]]), fill: '#fff', opacity: 0.05 }, g);
        for (let i = 0; i < 6; i++) $('rect', { x: x - 10, y: b - h * (0.14 + i * 0.13), width: 20, height: 7, fill: d.glow, opacity: 0.5, 'data-pulse': i }, g); }
      dune(120, hz + 10, sand[1], 4.1, 50);
      // broken temple columns
      const cols = [[330, 560], [470, 300], [640, 720], [1010, 420], [1130, 640]];
      cols.forEach(([x, h], i) => { const b = hz + 30 + (i % 2) * 14, w = 84 + (i % 3) * 10; $('rect', { x: x - w / 2 - 12, y: b - 26, width: w + 24, height: 26, fill: rock }, g);
        const top = b - h, pts = [[x - w / 2, b - 26], [x - w / 2, top + 20], [x - w * 0.2, top - 10 + 22 * r()], [x + w * 0.1, top + 12], [x + w * 0.3, top - 16 + 12 * r()], [x + w / 2, top + 26], [x + w / 2, b - 26]]; $('polygon', { points: P(pts), fill: rock }, g);
        for (let k = -1; k <= 1; k++) $('rect', { x: x + k * 24 - 3, y: top + 40, width: 6, height: h - 80, fill: '#000', opacity: 0.2 }, g);
        if (i % 2 === 0) { $('rect', { x: x - w / 2 - 14, y: top - 38, width: w + 28, height: 36, fill: rock }, g); for (let k = 0; k < 4; k++) $('rect', { x: x - w / 2 - 8 + k * (w + 16) / 4, y: top - 30, width: 10, height: 20, fill: d.glow, opacity: 0.35 }, g); }
        else { const fx = x + 130 + 30 * r(), fb = hz + 70; $('polygon', { points: P([[fx - 70, fb], [fx - 60, fb - 56], [fx + 30, fb - 70], [fx + 70, fb - 20], [fx + 80, fb]]), fill: rock }, g); } });
      // toppled pharaoh head (profile, nemes headdress), lying tilted on the sand
      { const x = 840, y = hz + 40, tg = $('g', { transform: `translate(${x} ${y}) rotate(-24)` }, g);
        $('polygon', { points: P([[-120, 20], [-110, -150], [-20, -210], [90, -170], [130, -60], [120, 20]]), fill: rock }, tg);
        $('polygon', { points: P([[-120, -60], [-150, 30], [-110, 60], [-100, -20]]), fill: rock }, tg); $('polygon', { points: P([[60, -140], [112, -100], [120, -20], [96, 30], [64, -10]]), fill: rock }, tg);
        for (let k = 0; k < 6; k++) $('line', { x1: -100 + k * 24, y1: -160 + k * 8, x2: -96 + k * 22, y2: 12, stroke: '#000', 'stroke-width': 4, opacity: 0.25 }, tg);
        $('ellipse', { cx: 86, cy: -90, rx: 16, ry: 8, fill: d.glow, opacity: 0.6, 'data-pulse': 3 }, tg); $('polyline', { points: P([[10, -190], [30, -120], [10, -60], [34, 10]]), fill: 'none', stroke: '#000', 'stroke-width': 4, opacity: 0.35 }, tg); }
      dune(80, hz + 40, sand[2], 7.7, 40);
    },
    none() {},
  };
  function buildDomains() {
    const D = C.TL.domains || {}; const L = C.layers; L.domain = $('g', { display: 'none' }, C.arena); C.arena.insertBefore(L.domain, L.actors); C.PAR.domain = 1;
    C.domainG = {};
    for (const key in D) {
      const d = Object.assign({ sky: ['#05060d', '#1a0f2a'], glow: '#ff3a44', floor: ['#1a1020', '#05040a'], motif: 'none', horizon: 900 }, D[key]), r = mulberry(key.length * 31 + 7);
      const g = $('g', { display: 'none' }, L.domain); const o = { d, g };
      $('rect', { x: -1600, y: -1600, width: 4300, height: 1600 + d.horizon + 60, fill: linear(d.sky) }, g);
      $('ellipse', { cx: 540, cy: d.horizon - 160, rx: 1100, ry: 700, fill: radial(d.glow, [[0, 0.55], [0.5, 0.18], [1, 0]]) }, g);
      if (d.eclipse) { const e = d.eclipse; o.ecl = { e, skyDark: $('rect', { x: -1600, y: -1600, width: 4300, height: 1600 + d.horizon + 60, fill: e.dark || '#07020f', opacity: 0 }, g) };
        const x = e.x === undefined ? 540 : e.x, y = e.y === undefined ? 420 : e.y, R = e.r || 120; o.ecl.x = x; o.ecl.y = y; o.ecl.R = R;
        o.ecl.glare = $('circle', { cx: x, cy: y, r: R * 3.4, fill: radial(e.sun || '#ffe9a8', [[0, 0.7], [0.3, 0.25], [1, 0]]) }, g);
        o.ecl.cor = $('g', { opacity: 0 }, g); o.ecl.corG = $('circle', { cx: x, cy: y, r: R * 3.6, fill: radial(e.corona || '#d8c8ff', [[0, 0.95], [0.3, 0.5], [1, 0]]) }, o.ecl.cor);
        o.ecl.rays = Array.from({ length: 28 }, (_, i) => $('polygon', { fill: i % 3 ? (e.corona || '#d8c8ff') : '#fff', opacity: 0.55 }, o.ecl.cor));
        o.ecl.sun = $('circle', { cx: x, cy: y, r: R, fill: e.sun || '#fff3c4' }, g); o.ecl.moon = $('circle', { cx: x, cy: y, r: R * 1.025, fill: e.moon || '#05030a' }, g);
        o.ecl.ring = $('circle', { cx: x, cy: y, r: R * 1.04, fill: 'none', stroke: e.corona || '#d8c8ff', 'stroke-width': 4, opacity: 0 }, g); }
      o.motif = $('g', {}, g); MOTIF[d.motif](o.motif, d, r);
      if (o.ecl) o.ecl.gDark = null;
      $('rect', { x: -1600, y: d.horizon + 40, width: 4300, height: 3000, fill: linear(d.floor) }, g);
      $('ellipse', { cx: 540, cy: d.horizon + 220, rx: 900, ry: 120, fill: radial(d.glow, [[0, 0.35], [1, 0]]) }, g);
      if (o.ecl) o.ecl.gDark = $('rect', { x: -1600, y: -1600, width: 4300, height: 1600 + d.horizon + 3000, fill: o.ecl.e.dark || '#07020f', opacity: 0 }, g);
      if (d.sigil) { o.sig = $('g', {}, g); const sg = $('g', {}, o.sig); o.sigIn = sg; $('ellipse', { cx: 0, cy: 0, rx: 420, ry: 420, fill: 'none', stroke: d.sigil, 'stroke-width': 6, opacity: 0.7 }, sg); $('ellipse', { cx: 0, cy: 0, rx: 340, ry: 340, fill: 'none', stroke: d.sigil, 'stroke-width': 3, 'stroke-dasharray': '30 18', opacity: 0.7 }, sg); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, b = (i + 2) / 6 * 6.283; $('line', { x1: f2(Math.cos(a) * 340), y1: f2(Math.sin(a) * 340), x2: f2(Math.cos(b) * 340), y2: f2(Math.sin(b) * 340), stroke: d.sigil, 'stroke-width': 3, opacity: 0.6 }, sg); } for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; $('rect', { x: f2(Math.cos(a) * 380 - 6), y: f2(Math.sin(a) * 380 - 14), width: 12, height: 28, fill: d.sigil, opacity: 0.8, transform: `rotate(${f2(a * 57.3 + 90)} ${f2(Math.cos(a) * 380)} ${f2(Math.sin(a) * 380)})` }, sg); } }
      o.mist = Array.from({ length: 7 }, (_, i) => $('ellipse', { cx: 0, cy: d.horizon + 60 + i * 60, rx: 520 + r() * 300, ry: 46, fill: radial(d.mist || '#8e98c8', [[0, 0.22], [1, 0]]) }, g));
      o.motes = Array.from({ length: 26 }, (_, i) => ({ e: $('circle', { r: 3 + (i % 3) * 2, fill: d.motes || d.glow }, g), x: -100 + r() * 1300, ph: r(), sp: 0.08 + r() * 0.12 }));
      C.domainG[key] = o; C.SCN_VIS['domain-' + key] = ['domain', 'actors', 'fx'];
    }
  }
  function updateDomains(t, sc) {
    if (!C.domainG) return; const key = sc && sc.startsWith('domain-') ? sc.slice(7) : null;
    for (const k in C.domainG) { const o = C.domainG[k], on = k === key; o.g.setAttribute('display', on ? 'inline' : 'none'); if (!on) continue; const d = o.d;
      if (o.ecl) { const E = o.ecl, k = clamp(C.trk(E.e.track || 'eclipse', t, 0)), off = (1 - k) * E.R * 2.7 * (E.e.dir || 1), tot = sm01((k - 0.86) / 0.14);
        E.moon.setAttribute('cx', f2(E.x - off)); E.moon.setAttribute('cy', f2(E.y + (1 - k) * E.R * 0.35)); E.skyDark.setAttribute('opacity', f2(0.78 * Math.pow(k, 1.3))); E.gDark.setAttribute('opacity', f2(0.55 * Math.pow(k, 1.5)));
        E.glare.setAttribute('opacity', f2(clamp(1 - k * 1.05) * 0.9)); E.sun.setAttribute('opacity', f2(1)); E.ring.setAttribute('opacity', f2(tot * 0.7)); E.cor.setAttribute('opacity', f2(tot * (0.85 + 0.15 * Math.sin(t * 5))));
        E.rays.forEach((p, i) => { const a = i / E.rays.length * 6.283 + 0.2 * Math.sin(t * 0.6 + i), len = E.R * (1.4 + 2.6 * hash(i * 3.1 + 1)) * (1 + 0.1 * Math.sin(t * 4 + i * 2)), w = E.R * 0.09 * (1 + hash(i)); const c = Math.cos(a), s2 = Math.sin(a); p.setAttribute('points', P([[E.x + c * E.R * 1.02 - s2 * w, E.y + s2 * E.R * 1.02 + c * w], [E.x + c * len, E.y + s2 * len], [E.x + c * E.R * 1.02 + s2 * w, E.y + s2 * E.R * 1.02 - c * w]])); }); }
      if (o.sig) { o.sig.setAttribute('transform', `translate(540 ${d.horizon + 230}) scale(1 0.22)`); o.sigIn.setAttribute('transform', `rotate(${f2(t * 14)})`); }
      o.mist.forEach((e, i) => e.setAttribute('cx', f2(((i * 517 + t * (12 + i * 3)) % 2600) - 700)));
      o.motes.forEach((m) => { const q = (t * m.sp + m.ph) % 1; m.e.setAttribute('cx', f2(m.x + 20 * Math.sin(t + m.ph * 9))); m.e.setAttribute('cy', f2(d.horizon + 300 - q * 1300)); m.e.setAttribute('opacity', f2(Math.sin(q * Math.PI) * 0.8)); });
      o.motif.querySelectorAll('[data-pulse]').forEach((e) => e.setAttribute('opacity', f2(0.45 + 0.45 * Math.sin(t * 3 + +e.getAttribute('data-pulse')))));
      o.motif.querySelectorAll('[data-shaft]').forEach((e) => e.setAttribute('opacity', f2(0.06 + 0.05 * Math.sin(t * 1.3 + +e.getAttribute('data-shaft')))));
      o.motif.querySelectorAll('[data-float]').forEach((e) => { const i = +e.getAttribute('data-float'); e.setAttribute('transform', `translate(${e.getAttribute('data-x')} ${f2(+e.getAttribute('data-y') + 18 * Math.sin(t * 1.4 + i))}) rotate(${f2(6 * Math.sin(t + i))})`); });
    }
  }

  // ---------------------------------------------------------------- props: monolith / spire rising out of the battlefield ground
  // {type:'monolith'|'spire', x,y (ground), scale, h=620, w=170, tilt=8, color (crack glow), rock, track:'rise'}
  const PROPS = {
    monolith: { build(o) { const p = o.p, g = o.g, w = p.w || 170, h = p.h || 620; o.clipId = gid('clipMono'); const cp = $('clipPath', { id: o.clipId, clipPathUnits: 'userSpaceOnUse' }, C.defs); $('rect', { x: -2000, y: -4000, width: 4000, height: 4000 }, cp); o.body = $('g', { 'clip-path': `url(#${o.clipId})` }, g); o.inner = $('g', {}, o.body);
        const r = mulberry((p.seed || 3) * 17); $('polygon', { points: P(p.type === 'spire' ? [[-w / 2, 0], [-w * 0.1, -h * 0.6], [-w * 0.3, -h * 0.62], [w * 0.05, -h], [w * 0.25, -h * 0.5], [w / 2, 0]] : [[-w / 2, 0], [-w * 0.44, -h], [w * 0.32, -h - 36], [w / 2, 0]]), fill: p.rock || '#10161a' }, o.inner);
        $('polygon', { points: P([[-w / 2, 0], [-w * 0.44, -h], [-w * 0.3, -h], [-w * 0.34, 0]]), fill: '#fff', opacity: 0.05 }, o.inner);
        o.crack = $('polyline', { points: P([[-w * 0.05, -h * 0.92], [w * 0.1, -h * 0.66], [-w * 0.08, -h * 0.42], [w * 0.06, -h * 0.18], [-w * 0.02, 0]]), fill: 'none', stroke: p.color || '#3aff9a', 'stroke-width': 6 }, o.inner);
        o.crackG = $('ellipse', { cx: 0, cy: -h * 0.5, rx: w * 0.5, ry: h * 0.5, fill: radial(p.color || '#3aff9a', [[0, 0.35], [1, 0]]) }, o.inner); for (let i = 0; i < 4; i++) $('rect', { x: -w * 0.35 + r() * w * 0.5, y: -h * (0.2 + r() * 0.7), width: 20 + r() * 30, height: 8, fill: p.color || '#3aff9a', opacity: 0.55 }, o.inner);
        o.dust = $('ellipse', { cx: 0, cy: 0, rx: w * 1.1, ry: 26, fill: 'url(#gFog)' }, g); },
      update(o, t) { const p = o.p, h = p.h || 620, rise = clamp(C.trk(p.track || 'rise', t, 0)), shk = rise > 0 && rise < 1 ? 6 * Math.sin(t * 70) : 0; o.inner.setAttribute('transform', `rotate(${f2(p.tilt === undefined ? 8 : p.tilt)}) translate(${f2(shk)} ${f2(h * (1 - EASE.outCubic(rise)) + 40)})`); o.crack.setAttribute('opacity', f2(rise * (0.6 + 0.4 * Math.sin(t * 4 + (p.seed || 0))))); o.crackG.setAttribute('opacity', f2(rise * 0.8)); o.dust.setAttribute('opacity', f2(rise > 0 && rise < 1 ? 1 : 0)); o.g.setAttribute('display', rise <= 0.001 ? 'none' : 'inline'); } },
  };
  PROPS.spire = PROPS.monolith;

  // ---------------------------------------------------------------- actor aura + rim light
  // actor { aura:{colors:[outer..inner], r=230, h=190 (center height above feet), motes:true}, rim:'#ffe39a', rimPx=7 }  cue param aura:[a,b] scales it.
  function setupActor(d) {
    if (d.rim) d.rig.root.style.filter = `drop-shadow(0 0 ${d.rimPx || 7}px ${d.rim}) drop-shadow(0 0 2px ${d.rim})`;
    if (!d.aura) return; const a = d.aura, cols = a.colors || ['#7ad8ff', '#ffe39a', '#ffffff'];
    d.auraG = $('g', {}, d.wrap); d.wrap.insertBefore(d.auraG, d.rig.root);
    d.auraL = cols.map((c) => $('ellipse', { fill: radial(c, [[0, 0.65], [0.55, 0.28], [1, 0]]) }, d.auraG));
    d.auraFlame = cols.slice(0, 2).map((c, i) => $('polygon', { fill: c, opacity: 0.22 - i * 0.06 }, d.auraG));
    d.auraM = a.motes === false ? [] : Array.from({ length: 14 }, (_, i) => ({ e: $('circle', { r: 3 + (i % 3) * 2, fill: cols[i % cols.length] }, d.auraG), x: hash(i * 3.3 + 1) - 0.5, ph: hash(i * 7.9) }));
  }
  function updateActor(d, ta) {
    if (!d.auraG || !d.pos) return; const a = d.aura, k = clamp(C.track(d.cues, 'aura', ta, a.on === undefined ? 1 : a.on), 0, 2), R = (a.r || 230) * d.pos.sc, cy = d.pos.y - (a.h || 190) * d.pos.sc, X = d.pos.x;
    d.auraG.setAttribute('opacity', f2(Math.min(1, k)));
    d.auraL.forEach((e, i) => { const p = 1 + 0.06 * Math.sin(ta * (3 + i) + i), rr = R * (1.35 - i * 0.28) * p * (0.7 + 0.3 * Math.min(k, 1.6)); e.setAttribute('cx', f2(X)); e.setAttribute('cy', f2(cy)); e.setAttribute('rx', f2(rr)); e.setAttribute('ry', f2(rr * 1.3)); });
    d.auraFlame.forEach((e, i) => { const pts = []; const n = 18, rr = R * (1.05 - i * 0.2) * (0.8 + 0.2 * Math.min(k, 1.6)); for (let j = 0; j <= n; j++) { const th = Math.PI * j / n, fl = 1 + 0.25 * Math.sin(ta * 9 + j * 1.7 + i) + 0.15 * hash(FR(ta) * 3 + j); pts.push([X - Math.cos(th) * rr * 0.85, cy + R * 0.9 - Math.sin(th) * rr * 1.5 * fl]); } e.setAttribute('points', P(pts)); });
    d.auraM.forEach((m) => { const q = (ta * 0.7 + m.ph) % 1; m.e.setAttribute('cx', f2(X + m.x * R * 1.6 + 10 * Math.sin(q * 10))); m.e.setAttribute('cy', f2(cy + R * 0.9 - q * R * 2.6)); m.e.setAttribute('opacity', f2(Math.sin(q * Math.PI) * Math.min(1, k))); });
  }

  // ---------------------------------------------------------------- screen overlays: embers + cinema letterbox
  // embers:[[t0,t1,color?]]  cinema:[[t0,t1]] (bars 150 px, slide in/out 0.25 s)
  function buildOverlay() {
    const s = C.svg; C.emb = $('g', { display: 'none' }, s); C.embP = Array.from({ length: 44 }, (_, i) => ({ e: $('circle', { r: 2 + (i % 4) * 1.5, fill: '#ffb04a' }, C.emb), x: hash(i * 2.1 + 5) * W, ph: hash(i * 4.4), sp: 0.12 + hash(i * 9.7) * 0.2, sw: 20 + hash(i) * 50 }));
    C.bars = $('g', { display: 'none' }, s); C.barT = $('rect', { x: 0, y: 0, width: W, height: 150, fill: '#000' }, C.bars); C.barB = $('rect', { x: 0, y: H - 150, width: W, height: 150, fill: '#000' }, C.bars);
  }
  function updateOverlay(t) {
    let ew = null; for (const w of (C.TL.embers || [])) if (t >= w[0] && t < w[1]) ew = w;
    C.emb.setAttribute('display', ew ? 'inline' : 'none'); if (ew) C.embP.forEach((p) => { const q = (t * p.sp + p.ph) % 1; p.e.setAttribute('cx', f2(p.x + p.sw * Math.sin(t * 1.7 + p.ph * 9))); p.e.setAttribute('cy', f2(H + 40 - q * (H + 120))); p.e.setAttribute('fill', ew[2] || '#ffb04a'); p.e.setAttribute('opacity', f2(Math.sin(q * Math.PI) * (0.5 + 0.5 * Math.sin(t * 7 + p.ph * 20)))); });
    let k = 0; for (const w of (C.TL.cinema || [])) if (t >= w[0] && t < w[1]) k = Math.max(k, Math.min(clamp((t - w[0]) / 0.25), clamp((w[1] - t) / 0.25)));
    C.bars.setAttribute('display', k > 0 ? 'inline' : 'none'); if (k > 0) { const hh = 150 * EASE.outCubic(k); C.barT.setAttribute('height', f2(hh)); C.barB.setAttribute('y', f2(H - hh)); C.barB.setAttribute('height', f2(hh)); }
  }

  G.SAKUGA = {
    init(ctx) { C = ctx; },
    hasFx: (type) => !!FX[type], buildFx: (it) => FX[it.f.type].build(it), updateFx: (it, t) => FX[it.f.type].update(it, t),
    hasProp: (type) => !!PROPS[type], buildProp: (o) => PROPS[o.p.type].build(o), updateProp: (o, t) => PROPS[o.p.type].update(o, t),
    buildDomains, updateDomains, setupActor, updateActor, buildOverlay, updateOverlay,
  };
})(window);
