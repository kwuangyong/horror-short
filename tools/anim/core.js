// core.js - helpers: svg builders, easing, joints (pivot hierarchy), pose blending. No timing/real-time APIs used.
(function (G) {
  const NS = 'http://www.w3.org/2000/svg';
  const f2 = (x) => (Math.round(x * 100) / 100);
  function $(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const EASE = {
    lin: (t) => t,
    in: (t) => t * t, out: (t) => 1 - (1 - t) * (1 - t),
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t, outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    smooth: (t) => t * t * (3 - 2 * t),
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
  };
  const ease = (name, t) => (EASE[name] || EASE.inOut)(clamp(t));
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hex2 = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  const rgb = (r, g, b) => '#' + hex2(r) + hex2(g) + hex2(b);
  function parse(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixc(a, b, t) { const A = parse(a), B = parse(b); return rgb(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }

  // ---- rig registry: every filled shape of the current rig is remembered so we can silhouette it
  let CUR = null;
  function newRig() { CUR = { fills: [], sil: 0 }; return CUR; }
  function reg(el, col) { if (CUR) CUR.fills.push([el, col]); return el; }
  function setSil(rig, s, silCol = '#06070f') {
    if (rig.sil === s) return; rig.sil = s;
    for (const [el, c] of rig.fills) el.setAttribute('fill', s <= 0 ? c : mixc(c, silCol, s));
  }
  const poly = (p, pts, fill, extra) => reg($('polygon', Object.assign({ points: pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' '), fill }, extra || {}), p), fill);
  const ell = (p, cx, cy, rx, ry, fill, extra) => reg($('ellipse', Object.assign({ cx, cy, rx, ry, fill }, extra || {}), p), fill);
  function limb(p, a, b, w0, w1, fill) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    poly(p, [[a[0] + nx * w0 / 2, a[1] + ny * w0 / 2], [b[0] + nx * w1 / 2, b[1] + ny * w1 / 2], [b[0] - nx * w1 / 2, b[1] - ny * w1 / 2], [a[0] - nx * w0 / 2, a[1] - ny * w0 / 2]], fill);
    ell(p, a[0], a[1], w0 / 2, w0 / 2, fill); ell(p, b[0], b[1], w1 / 2, w1 / 2, fill);
  }
  // Joint: outer group is transformed about pivot (px,py); inner group keeps ABSOLUTE rig coordinates.
  function joint(parent, px, py) {
    const g = $('g', {}, parent);
    const c = $('g', { transform: `translate(${-px} ${-py})` }, g);
    const j = { g, c, px, py, base: 0, set(rot = 0, sx = 1, sy = 1, dx = 0, dy = 0) {
      g.setAttribute('transform', `translate(${f2(px + dx)} ${f2(py + dy)}) rotate(${f2(rot)}) scale(${f2(sx)} ${f2(sy)})`);
    } };
    j.set();
    return j;
  }
  // ---- poses: plain objects of numbers. K = keyframe interpolation
  function K(u, frames, e) {   // frames: [[u, value], ...] numbers
    u = clamp(u);
    if (u <= frames[0][0]) return frames[0][1];
    for (let i = 1; i < frames.length; i++) {
      if (u <= frames[i][0]) { const a = frames[i - 1], b = frames[i]; return lerp(a[1], b[1], ease(e || 'inOut', (u - a[0]) / (b[0] - a[0] || 1))); }
    }
    return frames[frames.length - 1][1];
  }
  function KO(u, frames, e) {  // frames: [[u, {param: v}], ...] ; params missing in a frame keep the previous one
    u = clamp(u);
    const keys = new Set(); frames.forEach((f) => Object.keys(f[1]).forEach((k) => keys.add(k)));
    const out = {};
    keys.forEach((k) => {
      const fr = []; let last;
      frames.forEach((f) => { if (k in f[1]) { last = f[1][k]; fr.push([f[0], last]); } });
      out[k] = K(u, fr, e);
    });
    return out;
  }
  const mixPose = (a, b, w) => { const o = {}; for (const k in a) o[k] = lerp(a[k], b[k] === undefined ? a[k] : b[k], w); return o; };
  function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  Object.assign(G, { NS, $, clamp, lerp, EASE, ease, mulberry, rgb, mixc, parse, newRig, reg, setSil, poly, ell, limb, joint, K, KO, mixPose, hash, f2 });
})(window);
