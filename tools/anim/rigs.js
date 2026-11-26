// rigs.js - cutout rigs (Church Grim, Vrykolakas) + action library. Coordinates match art/draw_art.py:
// local origin = feet, +x = facing direction, y down. Angles for limbs: degrees from straight-down, + = toward facing (forward).
(function (G) {
  const { $, joint, poly, ell, limb, rgb, K, KO, clamp, lerp, hash, EASE, newRig, f2 } = G;
  const rad = Math.PI / 180;
  const FUR = rgb(48, 56, 96), FUR_L = rgb(130, 148, 205), FUR_D = rgb(26, 30, 56), RIM = rgb(176, 194, 240), TOOTH = rgb(244, 240, 230);
  const SK = rgb(150, 172, 160), SK_D = rgb(104, 128, 122), SH = rgb(194, 190, 168), SH_D = rgb(150, 146, 128), CLAW = rgb(230, 222, 186);

  const mixc2 = (a, b, t) => G.mixc(a, b, t);
  function spikeRow(parent, cx, cy, rx, ry, t0, t1, n, h, col, seed) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = (t0 + (t1 - t0) * (i + 0.5) / n) * rad;
      const nx0 = Math.cos(t) / rx, ny0 = Math.sin(t) / ry, L = Math.hypot(nx0, ny0), nx = nx0 / L, ny = ny0 / L;
      const bx = cx + rx * 0.96 * Math.cos(t), by = cy + ry * 0.96 * Math.sin(t);
      const hh = h * (0.75 + hash(seed + i * 3.1) * 0.5), w = h * 0.55 * (360 / n / 40 > 1 ? 1 : 1) + 6;
      const j = joint(parent, bx, by);
      poly(j.c, [[bx - w, by], [bx + w, by], [bx, by - hh]], col);
      j.base = Math.atan2(nx, -ny) / rad; j.set(j.base);
      out.push(j);
    }
    return out;
  }

  // =============================================================== CHURCH GRIM
  function buildGrim() {
    const rig = newRig();
    const root = $('g'); const lift = $('g', { transform: 'translate(0 -36)' }, root);
    const body = joint(lift, -100, -140); rig.body = body;
    const B = body.c;
    // tail (2 segments)
    const tail = joint(B, -150, -230);
    poly(tail.c, [[-150, -230], [-215, -300], [-235, -270], [-230, -230], [-170, -150]], FUR);
    const tip = joint(tail.c, -215, -290);
    poly(tip.c, [[-215, -300], [-290, -350], [-270, -270], [-232, -268]], FUR);
    rig.tail = tail; rig.tip = tip;
    const leg = (hx, hy, col, w) => {
      const th = joint(B, hx, hy); if (col === FUR) { limb(th.c, [hx - 4, hy - 3], [hx - 4, hy + 79], w, w * 0.75, RIM); }
      limb(th.c, [hx, hy], [hx, hy + 82], w, w * 0.75, col);
      const sh = joint(th.c, hx, hy + 82); if (col === FUR) { limb(sh.c, [hx - 3, hy + 80], [hx - 3, hy + 160], w * 0.75, w * 0.55, RIM); }
      limb(sh.c, [hx, hy + 82], [hx, hy + 164], w * 0.75, w * 0.55, col);
      ell(sh.c, hx + 14, hy + 170, 36, 15, col);
      return { th, sh };
    };
    const far = G.mixc(FUR, '#000000', 0.3);
    rig.FF = leg(110, -140, far, 60); rig.RF = leg(-105, -145, far, 60);
    // torso
    ell(B, 0, -198, 178, 98, RIM); ell(B, 0, -186, 175, 94, FUR);
    ell(B, 120, -220, 88, 96, RIM); ell(B, 120, -207, 85, 92, FUR); ell(B, -112, -188, 88, 96, FUR);
    rig.spikes = spikeRow(B, 0, -195, 178, 98, 196, 340, 11, 26, mixc2(FUR, RIM, 0.45), 1).concat(spikeRow(B, 0, -195, 178, 98, 200, 336, 11, 16, FUR_D, 9));
    rig.RN = leg(-105, -145, FUR, 60); rig.FN = leg(110, -140, FUR, 60);
    // head on neck joint
    const hd = joint(B, 90, -250); rig.head = hd; const Hc = hd.c;
    const Hx = 222, Hy = -288;
    poly(Hc, [[70, -300], [190, -350], [270, -250], [170, -150], [60, -170]], FUR);
    rig.nspikes = spikeRow(Hc, 150, -255, 90, 100, 200, 300, 6, 30, FUR, 5);
    ell(Hc, Hx, Hy - 3, 80, 72, RIM); ell(Hc, Hx - 3, Hy + 4, 78, 68, FUR);
    const ear1 = joint(Hc, Hx - 35, Hy - 52); poly(ear1.c, [[Hx - 52, Hy - 40], [Hx - 18, Hy - 64], [Hx - 40, Hy - 150]], FUR);
    const ear2 = joint(Hc, Hx + 14, Hy - 54); poly(ear2.c, [[Hx - 4, Hy - 56], [Hx + 34, Hy - 52], [Hx + 20, Hy - 138]], FUR_L); poly(ear2.c, [[Hx - 4, Hy - 56], [Hx + 34, Hy - 52], [Hx + 22, Hy - 118]], FUR);
    rig.ear1 = ear1; rig.ear2 = ear2;
    // mouth: cavity (dynamic), jaw joint
    rig.cav = $('polygon', { fill: rgb(120, 10, 28), points: '0,0' }, Hc);
    const hinge = [Hx + 30, Hy + 30]; rig.hinge = hinge; rig.Hx = Hx; rig.Hy = Hy;
    const jaw = joint(Hc, hinge[0], hinge[1]); rig.jaw = jaw;
    poly(jaw.c, [[Hx + 20, Hy + 22], [Hx + 160, Hy + 22], [Hx + 150, Hy + 54], [Hx + 20, Hy + 62]], FUR);
    rig.lteeth = $('g', {}, jaw.c);
    for (let i = 0; i < 4; i++) { const tx = Hx + 60 + i * 28; poly(rig.lteeth, [[tx, Hy + 22], [tx + 14, Hy + 22], [tx + 7, Hy + 2]], TOOTH); }
    poly(Hc, [[Hx + 20, Hy - 36], [Hx + 160, Hy - 14], [Hx + 160, Hy + 22], [Hx + 20, Hy + 40]], FUR);
    poly(Hc, [[Hx + 20, Hy - 36], [Hx + 160, Hy - 14], [Hx + 160, Hy - 4], [Hx + 20, Hy - 22]], FUR_L);
    rig.uteeth = $('g', {}, Hc);
    for (let i = 0; i < 4; i++) { const tx = Hx + 66 + i * 26; poly(rig.uteeth, [[tx, Hy + 24], [tx + 13, Hy + 22], [tx + 6, Hy + 44]], TOOTH); }
    ell(Hc, Hx + 160, Hy - 4, 17, 14, rgb(8, 8, 16)); ell(Hc, Hx + 154, Hy - 9, 5, 4, FUR_L);
    // eye
    const ex = Hx + 54, ey = Hy - 22;
    rig.glow = $('circle', { cx: ex, cy: ey, r: 44, fill: 'url(#gRed)' }, Hc);
    const eye = joint(Hc, ex, ey); rig.eye = eye;
    rig.eyeEll = ell(eye.c, ex, ey, 16, 12, '#ff3838'); G.reg(rig.eyeEll, '#ff3838'); ell(eye.c, ex + 3, ey, 7, 9, rgb(255, 214, 200));
    rig.brow = joint(Hc, ex, ey - 10); poly(rig.brow.c, [[ex - 26, ey - 22], [ex + 24, ey - 6], [ex + 24, ey - 16], [ex - 26, ey - 40]], FUR_D);
    // close-up detail: eye specular, iris ring, wet nose shine, gum line; markers for the shot system
    ell(eye.c, ex - 5, ey - 4, 3.2, 3.2, '#ffffff'); ell(eye.c, ex + 6, ey + 4, 1.8, 1.8, '#ffffff');
    $('ellipse', { cx: ex, cy: ey, rx: 16, ry: 12, fill: 'none', stroke: '#8a0d18', 'stroke-width': 2.5 }, eye.c);
    ell(Hc, Hx + 152, Hy - 12, 6, 3, '#9aa8d8');
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, Hx, Hy); mk('eye', Hc, ex, ey); mk('mouth', Hc, Hx + 110, Hy + 34); mk('jaw', jaw.c, Hx + 110, Hy + 40); mk('nose', Hc, Hx + 160, Hy - 4); mk('body', B, 0, -195); mk('tail', tail.c, -150, -230);
    rig.root = root;
    rig.N = { bodyY: 0, bodyRot: 0, tail1: 0, tail2: 0, head: 0, jaw: 0.08, ear: 0, hackle: 1, FN: [4, -4], FF: [4, -4], RN: [8, -10], RF: [8, -10], eye: 1, glow: 1, brow: 0, shakeX: 0, shakeY: 0, sx: 1, sy: 1, amber: 0 };
    rig.apply = (P, t) => {
      const sh = P.shakeX, shy = P.shakeY;
      body.set(P.bodyRot, P.sx, P.sy, sh, P.bodyY + shy);
      tail.set(-P.tail1 + 5 * Math.sin(t * 1.7), 1, 1); tip.set(-P.tail2 + 9 * Math.sin(t * 2.3 + 1), 1, 1);
      for (const k of ['FN', 'FF', 'RN', 'RF']) { const L = rig[k], a = P[k]; L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      hd.set(P.head);
      ear1.set(-P.ear * 1.0 + 3 * Math.sin(t * 1.3)); ear2.set(-P.ear * 0.8 + 2 * Math.sin(t * 1.1 + 2));
      const jw = clamp(P.jaw, 0, 1.2); jaw.set(jw * 30);
      // dynamic cavity
      const a = jw * 30 * rad, hx = hinge[0], hy = hinge[1];
      const jt = (px, py) => { const dx = px - hx, dy = py - hy; return [hx + dx * Math.cos(a) - dy * Math.sin(a), hy + dx * Math.sin(a) + dy * Math.cos(a)]; };
      const l0 = jt(Hx + 20, Hy + 22), l1 = jt(Hx + 160, Hy + 22);
      rig.cav.setAttribute('points', [[Hx + 24, Hy + 24], [Hx + 160, Hy + 18], l1, l0].map((q) => f2(q[0]) + ',' + f2(q[1])).join(' '));
      rig.cav.setAttribute('opacity', jw > 0.15 ? 1 : 0);
      const to = clamp((jw - 0.18) * 6);
      rig.lteeth.setAttribute('opacity', to); rig.uteeth.setAttribute('opacity', to);
      rig.spikes.forEach((s, i) => s.set(s.base + 3 * Math.sin(t * 9 + i) * (P.hackle > 1.2 ? 1.5 : 0.3), 1, P.hackle));
      rig.nspikes.forEach((s, i) => s.set(s.base, 1, P.hackle));
      const bl = P.eye * (1 - blink(t, 3.1)); eye.set(0, 1, Math.max(0.06, bl));
      rig.eyeEll.setAttribute('fill', G.mixc('#ff3838', '#ffb347', clamp(P.amber))); rig.glow.setAttribute('r', 44 * P.glow); rig.glow.setAttribute('opacity', clamp(0.55 + 0.35 * P.glow));
      rig.brow.set(P.brow * 14, 1, 1, 0, P.brow * 6);
    };
    return rig;
  }
  const blink = (t, per) => { const x = (t % per) / per; return x > 0.94 ? Math.sin((x - 0.94) / 0.06 * Math.PI) : 0; };

  // =============================================================== VRYKOLAKAS
  function buildVry() {
    const rig = newRig();
    const root = $('g'); const lift = $('g', {}, root);
    const body = joint(lift, 0, -100); rig.body = body; const B = body.c;
    const arm = (sx, sy, parent) => {
      const up = joint(parent, sx, sy); limb(up.c, [sx, sy], [sx, sy + 100], 30, 23, SK);
      const fo = joint(up.c, sx, sy + 100); limb(fo.c, [sx, sy + 100], [sx, sy + 196], 23, 18, SK);
      ell(fo.c, sx, sy + 196, 20, 18, SK_D);
      const claws = [];
      for (let i = -2; i <= 2; i++) { const c = joint(fo.c, sx, sy + 196); poly(c.c, [[sx - 5, sy + 202], [sx + 5, sy + 202], [sx, sy + 196 + 74 - Math.abs(i) * 6]], CLAW); c.k = i; claws.push(c); }
      return { up, fo, claws };
    };
    rig.aL = arm(-60, -340, B);
    const legs = [];
    for (const hx of [-24, 24]) {
      const lg = joint(B, hx, -100); limb(lg.c, [hx, -100], [hx, 0], 24, 17, SK_D); ell(lg.c, hx + 12, 3, 26, 9, SK_D); legs.push(lg);
    }
    rig.legs = legs;
    // shroud (dynamic path)
    rig.sh1 = reg(SH); rig.sh2 = reg(SH_D);
    function reg(c) { const e = $('path', { fill: c }, B); G.reg(e, c); return e; }
    poly(B, [[-22, -352], [22, -352], [0, -300]], SK_D);
    for (const fx of [-50, -20, 25, 58]) poly(B, [[fx, -300], [fx + 8, -80], [fx - 6, -80]], SH_D, { opacity: 0.6 });
    for (const [sx_, sy_, rr] of [[-40, -140, 20], [36, -190, 14], [-10, -100, 16]]) ell(B, sx_, sy_, rr, rr * 0.7, rgb(96, 82, 62), { opacity: 0.55 });
    poly(B, [[-62, -230], [-34, -200], [-70, -178]], rgb(30, 28, 34)); poly(B, [[52, -130], [74, -96], [40, -104]], rgb(30, 28, 34));
    rig.aR = arm(60, -340, B);
    const hd = joint(B, 0, -385); rig.head = hd; const Hc = hd.c;
    limb(Hc, [0, -352], [0, -385], 30, 28, SK_D);
    const hy = -425; rig.hy = hy;
    ell(Hc, 0, hy, 70, 90, SK_D); ell(Hc, -5, hy - 4, 65, 85, SK);
    ell(Hc, -34, hy + 30, 16, 26, SK_D, { opacity: 0.6 }); ell(Hc, 34, hy + 30, 16, 26, SK_D, { opacity: 0.6 });
    const hair = rgb(70, 80, 78);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) limb(Hc, [s * 64, hy - 20 + i * 16], [s * (84 + i * 6), hy + 20 + i * 24], 6, 2, hair);
    limb(Hc, [-8, hy - 88], [-24, hy - 118], 5, 2, hair); limb(Hc, [10, hy - 88], [30, hy - 112], 5, 2, hair);
    // eyes
    rig.eyes = [];
    for (const s of [-1, 1]) {
      const gl = $('circle', { cx: s * 26, cy: hy - 8, r: 40, fill: 'url(#gRed)', opacity: 0 }, Hc);
      const e = joint(Hc, s * 26, hy - 8);
      ell(e.c, s * 26, hy - 8, 21, 29, rgb(14, 16, 24));
      const pu = ell(e.c, s * 26, hy - 6, 4.5, 4.5, rgb(190, 240, 200)); G.reg(pu, rgb(190, 240, 200));
      ell(e.c, s * 26 - 6, hy - 18, 3.4, 3.4, '#ffffff'); rig.eyes.push({ e, pu, gl });
    }
    poly(Hc, [[-8, hy + 12], [8, hy + 12], [0, hy + 34]], rgb(60, 78, 74));
    // mouth: cavity + upper teeth behind chin; grin overlay on top
    rig.cav = $('rect', { x: -40, y: hy + 46, width: 80, height: 10, rx: 6, fill: rgb(36, 12, 20) }, Hc);
    rig.ut = $('g', {}, Hc);
    for (let tx = -36; tx <= 36; tx += 12) poly(rig.ut, [[tx, hy + 46], [tx + 10, hy + 46], [tx + 5, hy + 60]], rgb(236, 232, 206));
    const chin = joint(Hc, 0, hy + 46); rig.chin = chin;
    ell(chin.c, 0, hy + 82, 46, 38, SK_D); ell(chin.c, -3, hy + 80, 43, 34, SK);
    rig.lt = $('g', {}, chin.c);
    for (let tx = -28; tx <= 28; tx += 14) poly(rig.lt, [[tx, hy + 46], [tx + 10, hy + 46], [tx + 5, hy + 34]], rgb(236, 232, 206));
    rig.grin = $('g', {}, Hc);
    poly(rig.grin, [[-46, hy + 46], [46, hy + 46], [30, hy + 72], [0, hy + 78], [-30, hy + 72]], rgb(36, 12, 20));
    for (let tx = -40; tx <= 40; tx += 11) poly(rig.grin, [[tx, hy + 46], [tx + 9, hy + 46], [tx + 4, hy + 60]], rgb(236, 232, 206));
    for (let tx = -30; tx <= 30; tx += 15) poly(rig.grin, [[tx, hy + 76], [tx + 10, hy + 74], [tx + 5, hy + 62]], rgb(236, 232, 206));
    rig.slit = poly(Hc, [[-34, hy + 52], [34, hy + 52], [26, hy + 56], [0, hy + 58], [-26, hy + 56]], rgb(30, 40, 40));
    // close-up detail: eye sockets / bags, skin cracks, eye specular; markers
    for (const sd of [-1, 1]) { $('ellipse', { cx: sd * 26, cy: hy + 14, rx: 24, ry: 9, fill: SK_D, opacity: 0.8 }, Hc); $('ellipse', { cx: sd * 26, cy: hy - 8, rx: 25, ry: 33, fill: 'none', stroke: rgb(70, 92, 88), 'stroke-width': 3 }, Hc); }
    for (const d of ['M-44 ' + (hy - 40) + ' l12 14 l-6 12', 'M40 ' + (hy - 52) + ' l-10 16 l8 10', 'M-8 ' + (hy + 6) + ' l-4 16', 'M30 ' + (hy + 40) + ' l12 -8 l4 12']) $('path', { d, stroke: rgb(70, 92, 88), 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, Hc);
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 0, hy); mk('eye', Hc, 0, hy - 8); mk('mouth', Hc, 0, hy + 56); mk('hand', rig.aR.fo.c, 60, -144); mk('claw', rig.aR.fo.c, 60, -80); mk('handL', rig.aL.fo.c, -60, -144); mk('body', B, 0, -230);
    rig.root = root;
    rig.N = { bodyY: 0, bodyRot: 0, head: 0, open: 0, grin: 0, aL: [-12, -6], aR: [14, 8], lL: -6, lR: 6, flap: 1, eye: 1, wide: 0, rage: 0, shakeX: 0, shakeY: 0, grip: 1, sink: 0, trail: 0, headX: 0 };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, 1, 1, P.shakeX, P.bodyY + P.sink + P.shakeY);
      legs[0].set(-P.lL); legs[1].set(-P.lR);
      for (const [A, a] of [[rig.aL, P.aL], [rig.aR, P.aR]]) {
        A.up.set(-a[0]); A.fo.set(-(a[1] - a[0]));
        A.claws.forEach((c) => c.set(c.k * 20 * P.grip));
      }
      hd.set(P.head, 1, 1, P.headX, 0);
      const op = clamp(P.open, 0, 1.2);
      chin.set(0, 1, 1, 0, op * 36);
      rig.cav.setAttribute('height', 8 + op * 36); rig.cav.setAttribute('opacity', op > 0.04 ? 1 : 0);
      rig.ut.setAttribute('opacity', op > 0.04 ? 1 : 0); rig.lt.setAttribute('opacity', op > 0.15 ? 1 : 0);
      const gr = clamp(P.grin) * clamp(1 - op * 5);
      rig.grin.setAttribute('opacity', gr); rig.slit.setAttribute('opacity', clamp(1 - gr) * clamp(1 - op * 8));
      const bl = 1 - blink(t, 4.3 + 0.0); const es = P.eye * bl * (1 + P.wide * 0.18);
      const rc = G.mixc(rgb(190, 240, 200), rgb(255, 60, 60), clamp(P.rage));
      rig.eyes.forEach((E) => { E.e.set(0, 1 + P.wide * 0.1, Math.max(0.06, es)); E.pu.setAttribute('fill', rc); E.pu.setAttribute('rx', 4.5 + P.wide * 2 + P.rage * 1.5); E.pu.setAttribute('ry', 4.5 + P.wide * 2 + P.rage * 1.5); E.gl.setAttribute('opacity', clamp(P.rage) * 0.8); });
      // shroud: hem flutters, trails behind movement (trail > 0 pushes hem backwards)
      const hem = [], xs = []; for (let x = -100; x <= 100; x += 25) xs.push(x);
      xs.forEach((x, i) => { hem.push([x - P.trail * (0.4 + (i % 2) * 0.5) + P.flap * 6 * Math.sin(t * 3.2 + i * 0.9), -48 + (i % 2) * -38 + P.flap * 7 * Math.sin(t * 2.6 + i * 1.7)]); });
      const hr = hem.slice().reverse();
      const pts = [[-62, -352], [62, -352], [84, -250], [100 - P.trail * 0.2, -90]].concat(hr).concat([[-100 - P.trail * 0.2, -90], [-84, -250]]);
      rig.sh1.setAttribute('d', 'M' + pts.map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z');
      const p2 = [[10, -352], [62, -352], [84, -250], [100 - P.trail * 0.2, -90]].concat(hr.filter((q) => q[0] >= 20)).concat([[40, -70]]);
      rig.sh2.setAttribute('d', 'M' + p2.map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z');
    };
    return rig;
  }

  // =============================================================== ACTIONS
  // action(ctx) -> partial pose. ctx: {t: actor time, lt: seconds since cue start, dur, u: progress 0..1, p: cue params}
  const env = (lt, a) => EASE.smooth(clamp(lt / a));
  const legPh = (phi, c, A, Bd) => { const a1 = c + A * Math.sin(phi), lift = Math.max(0, Math.cos(phi)); return [a1, a1 - Bd * lift]; };
  const GRIM = {
    idle: (c) => ({ bodyY: 2 * Math.sin(c.t * 2.2), head: 3 * Math.sin(c.t * 1.6), tail1: 6 * Math.sin(c.t * 1.2), jaw: 0.06 + 0.03 * Math.sin(c.t * 2.2), hackle: 1 }),
    walk: (c) => { const sp = c.p.speed || 1.1, f = 2 * Math.PI * sp * c.lt;
      return { bodyY: 2.5 * Math.sin(2 * f), bodyRot: 2 * Math.sin(f), head: 8 + 5 * Math.sin(f), jaw: 0.06, tail1: 10 * Math.sin(f), hackle: 0.9,
        RN: legPh(f, 8, 26, 22), FN: legPh(f + Math.PI / 2, 6, 26, 22), RF: legPh(f + Math.PI, 8, 26, 22), FF: legPh(f + 1.5 * Math.PI, 6, 26, 22) }; },
    run: (c) => { const sp = c.p.speed || 2.3, f = 2 * Math.PI * sp * c.lt;
      return { bodyY: 8 * Math.sin(2 * f + 1) - 6, bodyRot: 6 + 5 * Math.sin(f), head: 12 + 5 * Math.sin(f + 1), jaw: 0.3 + 0.12 * Math.sin(f), tail1: -28, tail2: -15, ear: 25, hackle: 0.8, glow: 1.3,
        FN: legPh(f, 18, 52, 55), FF: legPh(f + 0.5, 18, 52, 55), RN: legPh(f + Math.PI, -10, 50, 50), RF: legPh(f + Math.PI + 0.5, -10, 50, 50) }; },
    growl: (c) => { const e = env(c.lt, 0.3), tr = Math.sin(c.lt * 55) * e;
      return { bodyY: 14 * e, bodyRot: 3 * e, head: 14 * e + 1.5 * tr, jaw: 0.08 + (0.6 + 0.08 * tr) * e, hackle: 1 + 0.55 * e, ear: 28 * e, glow: 1 + 0.5 * e, brow: e, shakeX: 2.5 * tr, shakeY: 1.2 * Math.sin(c.lt * 63) * e, tail1: -22 * e + 3 * tr, tail2: -10 * e,
        FN: [4 - 20 * e, -4 + 12 * e], FF: [4 - 18 * e, -4 + 10 * e], RN: [8 - 28 * e, -10 + 26 * e], RF: [8 - 28 * e, -10 + 26 * e] }; },
    crouch: (c) => { const e = env(c.lt, 0.35);
      return { bodyY: 26 * e, bodyRot: 6 * e, head: 18 * e, jaw: 0.1, hackle: 1.2, ear: 20 * e, glow: 1.4, brow: e, tail1: -12 * e,
        FN: [4 - 40 * e, -4 + 30 * e], FF: [4 - 36 * e, -4 + 30 * e], RN: [8 - 46 * e, -10 + 44 * e], RF: [8 - 46 * e, -10 + 44 * e] }; },
    lunge: (c) => KO(c.u, [[0, { bodyY: 14, bodyRot: 3, head: 14, jaw: 0.65, hackle: 1.5, brow: 1, glow: 1.5, FN: [-16, 8], FF: [-14, 6], RN: [-20, 16], RF: [-20, 16], tail1: -20 }],
      [0.28, { bodyY: 30, bodyRot: -4, head: 20, jaw: 0.5, FN: [-40, 24], FF: [-36, 24], RN: [-44, 40], RF: [-44, 40] }],
      [0.5, { bodyY: -6, bodyRot: 14, head: 6, jaw: 0.95, FN: [95, 82], FF: [88, 78], RN: [-80, -70], RF: [-74, -64], tail1: -35, tail2: -25, ear: 30 }],
      [0.85, { bodyY: 0, bodyRot: 12, jaw: 0.95, FN: [92, 80], FF: [86, 76], RN: [-78, -68], RF: [-72, -62] }],
      [1, { bodyRot: 10, jaw: 0.7, FN: [70, 62], FF: [64, 56], RN: [-60, -56], RF: [-56, -50] }]], 'inOut'),
    jump: (c) => KO(c.u, [[0, { bodyY: 26, bodyRot: 6, head: 18, jaw: 0.1, glow: 1.4, hackle: 1.2, FN: [-36, 26], FF: [-34, 26], RN: [-40, 40], RF: [-40, 40] }],
      [0.2, { bodyY: 36, bodyRot: 8, head: 22, FN: [-46, 34], FF: [-44, 34], RN: [-52, 50], RF: [-52, 50] }],
      [0.4, { bodyY: -4, bodyRot: -6, head: -6, jaw: 0.7, FN: [70, 40], FF: [64, 36], RN: [-70, -40], RF: [-66, -36], tail1: -25 }],
      [0.75, { bodyY: 0, bodyRot: 10, head: 8, jaw: 0.6, FN: [30, 10], FF: [24, 6], RN: [-30, -20], RF: [-26, -16], hackle: 1.4 }],
      [1, { bodyY: 8, bodyRot: 6, head: 10, jaw: 0.3, FN: [10, 0], FF: [8, -2], RN: [-10, -14], RF: [-8, -12] }]], 'inOut'),
    land: (c) => KO(c.u, [[0, { bodyY: 24, bodyRot: 6, head: 14, jaw: 0.4, FN: [-30, 20], FF: [-28, 20], RN: [-30, 26], RF: [-30, 26], sy: 0.94, sx: 1.04 }],
      [0.6, { bodyY: 8, bodyRot: 2, head: 6, jaw: 0.3, sy: 1, sx: 1 }], [1, { bodyY: 0, bodyRot: 0, head: 4, jaw: 0.1, FN: [4, -4], FF: [4, -4], RN: [8, -10], RF: [8, -10] }]], 'out'),
    bite: (c) => { const f = c.lt * 7 * Math.PI; const j = 0.5 + 0.45 * Math.sin(f - Math.PI / 2) * -1;
      return { bodyRot: 10, head: 18 + 8 * Math.abs(Math.sin(f)), jaw: clamp(0.5 + 0.45 * Math.cos(f), 0, 1), hackle: 1.4, glow: 1.5, brow: 1, bodyY: 6, FN: [52, 70], FF: [48, 66], RN: [-38, -60], RF: [-34, -56], shakeX: 2 * Math.sin(c.lt * 50) }; },
    blocked: (c) => { const e = env(c.lt, 0.2), f = c.lt * 2 * Math.PI * 2.2;
      return { bodyRot: -26 * e, bodyY: -10 * e, head: -4 * e, jaw: 0.7 * e, hackle: 1.5, glow: 1.5, brow: 1, ear: 30, shakeX: 2 * Math.sin(c.lt * 45) * e,
        FN: [4 + (121 + 18 * Math.sin(f)) * e, -4 + (116 + 12 * Math.sin(f)) * e], FF: [4 + (121 - 18 * Math.sin(f)) * e, -4 + (116 - 12 * Math.sin(f)) * e], RN: [8 + 10 * e, -10 + 4 * e], RF: [8 + 10 * e, -10 + 4 * e] }; },
    howl: (c) => { const e = env(c.lt, 0.5);
      return { bodyRot: -10 * e, bodyY: 4 * e, head: -46 * e, jaw: 0.1 + 0.5 * e + 0.05 * Math.sin(c.lt * 9) * e, eye: 1 - 0.55 * e, tail1: 18 * e, hackle: 1 + 0.15 * e, glow: 1.2, ear: -12 * e, sy: 1 + 0.02 * Math.sin(c.lt * 5) * e,
        FN: [4 + 6 * e, -4], FF: [4 + 6 * e, -4], RN: [8, -10], RF: [8, -10] }; },
    drag: (c) => { const f = 2 * Math.PI * 0.8 * c.lt;
      return { bodyRot: 9, bodyY: 14, head: 34, jaw: 0.25, hackle: 0.9, tail1: 18, glow: 1.2, FN: legPh(f, 36, 14, 16), FF: legPh(f + Math.PI, 36, 14, 16), RN: legPh(f + 1.5, 20, 14, 16), RF: legPh(f + 1.5 + Math.PI, 20, 14, 16) }; },
    recoil: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.18)) * (1 - 0.5 * EASE.smooth(clamp((c.lt - 0.2) / 0.5)));
      return { bodyRot: -14 * e, bodyY: 8 * e, head: -14 * e, jaw: 0.65 * e, eye: 1 - 0.5 * e, hackle: 1.3, glow: 1.5, FN: [4 + 30 * e, -4 + 20 * e], FF: [4 + 30 * e, -4 + 20 * e], RN: [8 - 20 * e, -10 - 10 * e], RF: [8 - 20 * e, -10 - 10 * e], shakeX: 3 * Math.sin(c.lt * 60) * (1 - EASE.smooth(clamp(c.lt / 0.6))) }; },
    fade: (c) => GRIM.idle(c),
    talk: (c) => { const a = c.amp || 0; return { jaw: 0.05 + 0.5 * a, head: 5 - 5 * a + 2 * Math.sin(c.t * 1.4), bodyY: 2 * Math.sin(c.t * 2.2), hackle: 0.75, glow: 0.85, brow: 0, amber: 0.6, ear: -6, eye: 0.9, tail1: 8 * Math.sin(c.t * 1.8), shakeX: 0 }; },
    'shake-fur': (c) => { const d = Math.exp(-c.lt * 2.2), e = EASE.smooth(clamp((c.lt - 0.9) / 0.4)); return { shakeX: 7 * Math.sin(c.lt * 48) * d, sx: 1 + 0.03 * Math.sin(c.lt * 48) * d, hackle: 1 + 0.5 * d, head: -14 * e + 3 * Math.sin(c.t * 1.6), jaw: 0.1, glow: 1.3, ear: 15 * e, tail1: 10 * Math.sin(c.t * 1.2) }; },
    sit: (c) => { const e = env(c.lt, 0.5); return { bodyRot: -30 * e, bodyY: 36 * e, head: 18 * e, jaw: 0.06, amber: e, glow: 0.9, brow: 0, tail1: 20 * Math.sin(c.t * 4), tail2: 15 * Math.sin(c.t * 4 + 1), RN: [8 + 78 * e, -10 - 60 * e], RF: [8 + 78 * e, -10 - 60 * e], FN: [4 - 4 * e, -4 + 4 * e], FF: [4 - 4 * e, -4 + 4 * e], hackle: 0.8, sy: 1 + 0.012 * Math.sin(c.t * 2) }; },
    down: (c) => { const e = env(c.lt, 0.45), br = Math.sin(c.t * 3.2); return { bodyY: 66 * e, bodyRot: -6 * e, head: 44 * e, jaw: 0.14 * e + 0.02 * br, eye: 1 - 0.62 * e + 0.0, glow: 0.7, hackle: 0.8, ear: 28 * e, tail1: 10 * e, sy: 1 + 0.02 * br, FN: [4 + 86 * e, -4 + 80 * e], FF: [4 + 70 * e, -4 + 62 * e], RN: [8 - 78 * e, -10 - 70 * e], RF: [8 - 66 * e, -10 - 56 * e], amber: 0.0 }; },
    weak: (c) => { const e = env(c.lt, 0.3), tr = Math.sin(c.lt * 26); return { bodyY: 18 * e, head: 26 * e, jaw: 0.1, ear: 30 * e, glow: 0.5, eye: 0.65, hackle: 0.7, tail1: 14 * e, shakeX: 1.4 * tr * e, FN: [4 - 14 * e + 3 * tr, -4 + 10 * e], FF: [4 - 12 * e - 3 * tr, -4 + 10 * e], RN: [8 - 26 * e + 3 * tr, -10 + 22 * e], RF: [8 - 26 * e - 3 * tr, -10 + 22 * e] }; },
    dangle: (c) => { const f = c.lt * 14; return { bodyRot: -68, bodyY: 0, head: -28, jaw: 0.55 + 0.1 * Math.sin(f), hackle: 1.4, glow: 1.4, brow: 1, ear: 30, tail1: 20 + 12 * Math.sin(f), shakeX: 1.5 * Math.sin(f * 2), FN: [30 + 18 * Math.sin(f), 10], FF: [24 - 18 * Math.sin(f), 6], RN: [-30 + 38 * Math.sin(f + 1), -40], RF: [-24 - 38 * Math.sin(f + 1), -30] }; },
    'bite-shake': (c) => { const f = c.lt * 30; return { bodyRot: 12, bodyY: 10, head: 22 + 6 * Math.sin(f), jaw: 0.1 + 0.05 * Math.sin(f * 0.5), shakeX: 9 * Math.sin(f), hackle: 1.5, glow: 1.6, brow: 1, ear: 30, FN: [52, 70], FF: [48, 66], RN: [-38, -60], RF: [-34, -56], tail1: -20 }; },
    crawl: (c) => { const f = 2 * Math.PI * 0.7 * c.lt, e = env(c.lt, 0.25); return { bodyY: 44 * e, bodyRot: 12 * e, head: 38 * e, jaw: 0.2, eye: 0.7, glow: 0.8, hackle: 0.8, ear: 26 * e, tail1: 14, FN: [50 + 34 * Math.sin(f), 60 + 20 * Math.sin(f)], FF: [50 - 34 * Math.sin(f), 60 - 20 * Math.sin(f)], RN: [-30, -12], RF: [-26, -10], sy: 0.98 }; },
    'paw-line': (c) => { const e = env(c.lt, 0.35), f = 2 * Math.PI * 1.0 * c.lt * (1 - e); return { bodyRot: -8 * e, bodyY: 4, head: 8, jaw: 0.1, glow: 1.4, brow: 0.6, hackle: 1.1, FN: [60 * e + 6 * Math.sin(f), 40 * e], FF: [10, 0], RN: [8, -10], RF: [8, -10] }; },
    stalk: (c) => { const f = 2 * Math.PI * (c.p.speed || 0.7) * c.lt; return { bodyY: 16, bodyRot: 4, head: 20, jaw: 0.5, hackle: 1.4, glow: 1.4, brow: 1, ear: 28, tail1: -14, RN: legPh(f, 0, 22, 18), FN: legPh(f + Math.PI / 2, -4, 22, 18), RF: legPh(f + Math.PI, 0, 22, 18), FF: legPh(f + 1.5 * Math.PI, -4, 22, 18) }; },
    dig: (c) => { const f = 2 * Math.PI * 2.4 * c.lt; return { bodyRot: 16, bodyY: 20, head: 30, jaw: 0.1, glow: 1, FN: [26 + 40 * Math.sin(f), 0], FF: [26 - 40 * Math.sin(f), 0], hackle: 0.9, tail1: 8 * Math.sin(f), shakeX: 2 * Math.sin(f) }; },
    bristle: (c) => { const e = env(c.lt, 0.5); return { sx: 1 + 0.1 * e, sy: 1 + 0.1 * e, hackle: 1 + 1.0 * e, glow: 1 + 1.0 * e, brow: e, jaw: 0.5 * e, head: 10 * e, ear: 34 * e, bodyY: -4 * e, shakeX: 1.2 * Math.sin(c.lt * 50) * e, FN: [4 + 8 * e, -4], FF: [4 + 8 * e, -4], RN: [8 - 6 * e, -10], RF: [8 - 6 * e, -10], tail1: -26 * e }; },
    alert: (c) => ({ head: -10, ear: -10, glow: 1.2, eye: 1, jaw: 0.04, bodyY: 0, tail1: 5 * Math.sin(c.t * 2), hackle: 1 }),
    'stand-up': (c) => KO(c.u, [[0, { bodyY: 66, head: 44, eye: 0.38, FN: [90, 84], FF: [74, 66], RN: [-70, -80], RF: [-58, -66], glow: 0.7, ear: 28, hackle: 0.8 }], [0.5, { bodyY: 30, head: 30, eye: 0.7, FN: [30, 40], FF: [20, 28], RN: [-30, -30], RF: [-24, -24] }], [0.85, { bodyY: 12, head: 20, eye: 1, FN: [0, 0], FF: [0, 0], RN: [0, 0], RF: [0, 0], glow: 1.1 }], [1, { bodyY: 4, head: 10, jaw: 0.1, glow: 1.2, hackle: 1.1, eye: 1, ear: 10 }]], 'inOut'),
  };

  const VRY = {
    idle: (c) => ({ bodyRot: 3 * Math.sin(c.t * 1.3), bodyY: 2 * Math.sin(c.t * 2.2), head: 4 * Math.sin(c.t * 1.1 + 1), headX: 3 * Math.sin(c.t * 1.1), aL: [-14 + 5 * Math.sin(c.t * 1.5), -8 + 6 * Math.sin(c.t * 1.9)], aR: [16 + 5 * Math.sin(c.t * 1.4 + 1), 10 + 6 * Math.sin(c.t * 1.7 + 2)], grip: 1 + 0.12 * Math.sin(c.t * 3), open: 0.05, flap: 1 }),
    rise: (c) => { const u = c.u; const shake = Math.sin(c.lt * 40) * clamp(1 - u * 1.5) * 3;
      return KO(u, [[0, { sink: 600, bodyRot: 18, head: 14, open: 0.4, aL: [160, 170], aR: [170, 176], lL: -10, lR: 10, grip: 1.4, wide: 0 }],
        [0.22, { sink: 470, aL: [150, 165], aR: [166, 172], grip: 1.5 }],
        [0.62, { sink: 170, bodyRot: 20, head: 12, open: 0.7, aL: [120, 100], aR: [150, 150], wide: 1, rage: 0.6 }],
        [0.85, { sink: 28, bodyRot: -4, head: -10, open: 0.9, aL: [50, 40], aR: [100, 80], grip: 1.3 }],
        [1, { sink: 0, bodyRot: 0, head: 0, open: 0.2, aL: [-12, -6], aR: [14, 8], lL: -6, lR: 6, grip: 1, wide: 0.3, rage: 0.5 }]], 'inOut', 0, shake); },
    walk: (c) => { const f = 2 * Math.PI * (c.p.speed || 0.75) * c.lt;
      return { bodyRot: 9, bodyY: 4 * Math.abs(Math.sin(f)), head: 10 + 4 * Math.sin(f), headX: 8, open: 0.25, grin: 0.5, aL: [78 + 10 * Math.sin(f), 92], aR: [84 - 10 * Math.sin(f), 96], lL: 24 * Math.sin(f), lR: -24 * Math.sin(f), trail: 40, rage: 0.4, wide: 0.2, grip: 1.1 }; },
    'claw-swipe': (c) => KO(c.u, [[0, { bodyRot: -3, head: -4, grin: 1, open: 0, aL: [-12, -6], aR: [14, 8], lL: -6, lR: 6 }],
      [0.35, { bodyRot: -14, head: -10, grin: 0, open: 0.35, aR: [-150, -168], aL: [-110, -130], grip: 1.5, rage: 0.8, lL: -14, lR: 12, bodyY: 4 }],
      [0.5, { bodyRot: -16, aR: [-155, -170], aL: [-112, -130], open: 0.5 }],
      [0.64, { bodyRot: 16, head: 10, open: 0.9, aR: [105, 150], aL: [88, 130], rage: 1, wide: 1, lL: -22, lR: 24, grip: 1.6, bodyY: -2, trail: -30 }],
      [0.82, { bodyRot: 14, aR: [118, 160], aL: [96, 140], open: 0.8, grip: 1.5 }],
      [1, { bodyRot: 8, head: 4, open: 0.4, aR: [100, 130], aL: [84, 110], lL: -14, lR: 14 }]], 'inOut'),
    grin: (c) => { const e = env(c.lt, 0.3), lg = Math.sin(c.lt * 17) * e;
      return { bodyY: 3 * lg, bodyRot: -3 * e + 1.5 * lg, head: -8 * e + 2 * lg, grin: 1, open: 0, aL: [-30 * e - 14 * (1 - e), -20], aR: [32 * e + 14 * (1 - e), 22], rage: 0.7 * e, wide: 0.4 * e, grip: 1.4, shakeX: 1.5 * lg }; },
    'grab-throw': (c) => KO(c.u, [[0, { bodyRot: 4, grin: 1, aL: [105, 100], aR: [110, 96], grip: 1.3, lL: -10, lR: 10 }],
      [0.35, { bodyRot: 12, head: 8, aL: [110, 98], aR: [112, 100], grip: 0.8, rage: 0.8 }],
      [0.55, { bodyRot: 14, aL: [112, 100], aR: [114, 100], grip: 0.6 }],
      [0.8, { bodyRot: -8, head: -8, aL: [-40, -30], aR: [-30, -20], grip: 1.6, open: 0.5, lL: -18, lR: 20, rage: 1 }],
      [1, { bodyRot: -6, aL: [-30, -20], aR: [-20, -10], open: 0.3 }]], 'inOut'),
    stagger: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.2)), w = Math.sin(c.lt * 12) * (1 - 0.6 * clamp(c.lt / c.dur));
      return { bodyRot: -18 * e + 7 * w, head: -14 * e + 5 * w, open: 0.8, wide: 1, eye: 1, aL: [-20 + 70 * Math.sin(c.lt * 9), 30], aR: [20 - 70 * Math.sin(c.lt * 9), 30], lL: -26 * e + 10 * w, lR: 28 * e - 10 * w, rage: 0.3, grin: 0, bodyY: 3 * Math.abs(w), grip: 1.5 }; },
    choke: (c) => { const tr = Math.sin(c.lt * 40);
      return { bodyRot: 9, head: 6, grin: 1, rage: 1, aL: [120 + 2 * tr, 100], aR: [110 - 2 * tr, 96], grip: 0.7 + 0.05 * tr, shakeX: 1.5 * tr, lL: -16, lR: 16, trail: 10 }; },
    fall: (c) => { const e = EASE.inCubic(clamp(c.u / 0.8)), b = c.u > 0.8 ? Math.sin((c.u - 0.8) / 0.2 * Math.PI) * 4 : 0;
      return { bodyRot: 88 * e - b, bodyY: 78 * e, head: -10 * e, open: 0.6 * (1 - e) + 0.05, eye: 1 - 0.9 * e, aL: [-30 + 130 * (1 - e) - 100 * e, -10], aR: [20 + 140 * (1 - e), 40], lL: -5 - 25 * e, lR: 8 + 10 * e, grin: 0, flap: 1 - e * 0.7, wide: 1 - e, rage: 0 }; },
    twitch: (c) => { const k = Math.floor(c.lt * 9), j = hash(k) > 0.55 ? Math.sin(c.lt * 70) : 0;
      return { bodyRot: 88 + 1.5 * j, bodyY: 78, head: -10 + 6 * j, eye: 0.1, open: 0.08 + 0.1 * Math.abs(j), aL: [-130 + 14 * j, -10], aR: [20 + 12 * hash(k + 5) * j, 40], lL: -30 + 8 * j, lR: 18, grin: 0, flap: 0.3, grip: 1 + 0.4 * j }; },
    circle: (c) => { const f = 2 * Math.PI * 0.9 * c.lt, e = env(c.lt, 0.3); return { bodyRot: 12 * e, bodyY: 20 * e + 2 * Math.sin(2 * f), head: 14 * e, open: 0.4 * e, rage: 0.6 * e, wide: 0.3, aL: [40 * e - 12 * (1 - e), 70 * e], aR: [60 * e, 90 * e], lL: 14 * Math.sin(f) - 6, lR: -14 * Math.sin(f) + 6, grip: 1.5, trail: 10 }; },
    'fall-back': (c) => { const e = EASE.inCubic(clamp(c.u / 0.75)), b = c.u > 0.75 ? Math.sin((c.u - 0.75) / 0.25 * Math.PI) * 4 : 0; return { bodyRot: -86 * e + b, bodyY: 76 * e, head: 8 * e, open: 0.9, wide: 1, eye: 1, aL: [-40 - 90 * e, -20], aR: [40 + 70 * e, 30], lL: -10 - 10 * e, lR: 10 + 20 * e, rage: 0.6, grin: 0, flap: 1 - e * 0.5, grip: 1.5 }; },
    pinned: (c) => { const f = c.lt * 16; return { bodyRot: -86, bodyY: 76, head: 10 + 4 * Math.sin(f * 0.7), open: 0.95, wide: 1, rage: 0.7, aL: [-120 + 50 * Math.sin(f), -60 + 40 * Math.cos(f)], aR: [110 - 50 * Math.sin(f + 1), 70 + 30 * Math.cos(f)], lL: -20 + 24 * Math.sin(f + 2), lR: 24 - 24 * Math.sin(f), shakeX: 2.5 * Math.sin(f * 3), grip: 1.6, flap: 0.5 }; },
    'crawl-back': (c) => { const f = 2 * Math.PI * 1.1 * c.lt; return { bodyRot: -78, bodyY: 62, head: -16, open: 0.4, wide: 0.7, rage: 0.5, aL: [-100 + 30 * Math.sin(f), -70], aR: [-90 - 30 * Math.sin(f), -60], lL: -20 + 28 * Math.sin(f), lR: 20 - 28 * Math.sin(f), grip: 1.3, flap: 0.6 }; },
    'stand-up': (c) => { const e = EASE.inOutCubic(clamp(c.u / 0.7)), n = clamp((c.u - 0.7) / 0.3), h = n > 0 ? (n < 0.4 ? 24 * n / 0.4 : n < 0.55 ? 24 - 40 * (n - 0.4) / 0.15 : -16 * (1 - (n - 0.55) / 0.45)) : 0; return { bodyRot: -86 * (1 - e), bodyY: 76 * (1 - e), head: h + 8 * (1 - e), open: 0.3 * (1 - n), wide: 0.5, rage: 0.6, aL: [-40 * (1 - e) - 14 * e, -10], aR: [40 * (1 - e) + 14 * e, 20], lL: -8, lR: 8, grip: 1.2 }; },
    'neck-grab': (c) => KO(c.u, [[0, { bodyRot: 4, grin: 1, aL: [105, 100], aR: [110, 96], grip: 1.3 }], [0.3, { bodyRot: 10, head: 6, aL: [112, 100], aR: [116, 100], grip: 0.65, rage: 1, open: 0.2, grin: 0 }], [0.65, { bodyRot: -6, head: -4, aL: [150, 140], aR: [155, 145], grip: 0.65, open: 0.5, trail: -10 }], [1, { bodyRot: -8, aL: [158, 150], aR: [162, 152], grip: 0.65, open: 0.5 }]], 'inOut'),
    'slash-down': (c) => { const f = c.lt / 0.46, ph = f - Math.floor(f), sw = ph < 0.35 ? -150 + 0 * ph : ph < 0.6 ? lerp(-150, 85, EASE.outCubic((ph - 0.35) / 0.25)) : lerp(85, -150, EASE.inOut((ph - 0.6) / 0.4)), alt = Math.floor(f) % 2; return { bodyRot: 16 + (ph > 0.4 && ph < 0.6 ? 6 : 0), bodyY: 8 * Math.sin(ph * 6.28), head: 10, open: 1, wide: 1, rage: 1, aR: alt ? [-20, -10] : [sw, sw + 14], aL: alt ? [sw, sw + 14] : [-20, -10], grip: 1.6, lL: -16, lR: 18, shakeX: 1.2 * Math.sin(c.lt * 40) }; },
    victory: (c) => { const e = env(c.lt, 0.4), lg = Math.sin(c.lt * 15) * e; return { head: -22 * e, bodyRot: -6 * e, open: 0.8 + 0.15 * lg, rage: 1, wide: 1, aL: [-150 * e, -170 * e], aR: [155 * e, 168 * e], grip: 1.7, shakeX: 1.5 * lg, bodyY: -2 * e }; },
    'lunge-at': (c) => { const f = 2 * Math.PI * 1.6 * c.lt; return { bodyRot: 16, bodyY: 3 * Math.abs(Math.sin(f)), head: 12, open: 0.9, wide: 1, rage: 1, aR: [100 + 30 * Math.sin(f), 130], aL: [90 - 30 * Math.sin(f), 120], lL: 30 * Math.sin(f), lR: -30 * Math.sin(f), trail: 40, grip: 1.6 }; },
    'cover-face': (c) => { const e = EASE.outCubic(clamp(c.lt / 0.18)), w = Math.sin(c.lt * 9) * (1 - 0.5 * clamp(c.lt / c.dur)); return { bodyRot: -14 * e + 6 * w, head: -14 * e, open: 0.1, wide: 1, eye: 0.5, aL: [110 * e, 200 * e], aR: [120 * e, 205 * e], grip: 0.9, lL: -22 * e + 8 * w, lR: 24 * e - 8 * w, rage: 0.2, grin: 0, shakeX: 2 * Math.sin(c.lt * 40) * e }; },
    'kneel-cough': (c) => { const f = Math.sin(c.lt * 16); return { bodyY: 92, bodyRot: 14 + 4 * f, head: 20 + 5 * f, open: 0.35 + 0.15 * f, wide: 0.6, eye: 0.6, aL: [40, 150], aR: [44, 158], grip: 1, lL: 66, lR: -74, shakeX: 2 * f, rage: 0.3, grin: 0 }; },
    disgust: (c) => { const e = env(c.lt, 0.25), tr = Math.sin(c.lt * 32) * e; return { bodyRot: 10 * e, bodyY: 6 * e, head: 16 * e, open: 0.22 * e, eye: 0.6, wide: 0.2, aL: [30 * e - 12 * (1 - e), 60 * e], aR: [34 * e + 14 * (1 - e), 70 * e], grin: 0, shakeX: 1.6 * tr, rage: 0.2, grip: 1.3 }; },
    hand: (c) => ({ sink: 500, bodyRot: 14, aR: [168 + 8 * Math.sin(c.lt * 25), 176], aL: [150, 160], grip: 1.5 + 0.4 * Math.sin(c.lt * 30), open: 0.3, lL: -10, lR: 10, eye: 0.1 }),
    talk: (c) => { const a = c.amp || 0; return { open: 0.08 + 0.7 * a, grin: 0.3, head: 3 * Math.sin(c.t * 1.5), bodyRot: 2 * Math.sin(c.t * 1.2), rage: 0.3, aL: [-14, -6], aR: [14, 8], eye: 0.9 }; },
    dead: (c) => ({ bodyRot: -86, bodyY: 78, head: 8, eye: 0.08, open: 0.05, aL: [-120, -60], aR: [100, 60], lL: -20, lR: 22, grin: 0, flap: 0.2, grip: 1 }),
    recoil: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.15)) * (1 - 0.5 * EASE.smooth(clamp((c.lt - 0.2) / 0.6)));
      return { bodyRot: -16 * e, head: -12 * e, open: 0.9, wide: 1, aL: [-130 * e, -150 * e], aR: [140 * e, 150 * e], lL: -12, lR: 14, grip: 1.5, shakeX: 3 * Math.sin(c.lt * 60) * (1 - EASE.smooth(clamp(c.lt / 0.6))), rage: 0.4 }; },
  };
  // KO with optional per-key extra offsets (used by rise for a tremor on shoulders)
  const _KO = KO;
  GRIM.__noop = null;



  // =============================================================== CERBERUS (three-headed hound, ep #002 guardian)
  function buildCerberus() {
    const rig = newRig(); const root = $('g'); const lift = $('g', { transform: 'translate(0 -42) scale(1.14)' }, root);
    const CF = rgb(54, 58, 82), CFL = rgb(150, 166, 208), CFD = rgb(30, 32, 48), CFAR = rgb(36, 38, 56), CRIM = rgb(176, 194, 236);
    const body = joint(lift, -100, -140); rig.body = body; const B = body.c;
    const tail = joint(B, -170, -246); poly(tail.c, [[-170, -246], [-250, -300], [-330, -330], [-300, -250], [-250, -226], [-186, -150]], CF); const tip = joint(tail.c, -300, -300); poly(tip.c, [[-300, -306], [-376, -350], [-392, -280], [-330, -262]], CFD); rig.tail = tail; rig.tip = tip;
    const SN = rgb(36, 52, 46), SNL = rgb(120, 160, 140);   // serpent tail head (jaw + forked tongue), strikes with P.serp
    rig.sjaw = joint(tip.c, -384, -312); poly(rig.sjaw.c, [[-384, -316], [-452, -330], [-456, -308], [-392, -296]], SN); poly(rig.sjaw.c, [[-432, -312], [-440, -302], [-428, -302]], '#f4f1e6');
    poly(tip.c, [[-376, -352], [-460, -338], [-456, -322], [-384, -314], [-374, -300], [-340, -330]], SN); poly(tip.c, [[-376, -352], [-440, -340], [-376, -338]], SNL); ell(tip.c, -430, -338, 5, 5, '#ffd86a');
    rig.tongue = $('polygon', { fill: '#d23a4a', points: '0,0' }, tip.c);
    const leg = (hx, hy, col, w) => {
      const th = joint(B, hx, hy); if (col === CF) limb(th.c, [hx - 4, hy - 3], [hx - 4, hy + 79], w, w * 0.78, CRIM); limb(th.c, [hx, hy], [hx, hy + 82], w, w * 0.78, col);
      const sh = joint(th.c, hx, hy + 82); if (col === CF) limb(sh.c, [hx - 3, hy + 80], [hx - 3, hy + 160], w * 0.78, w * 0.58, CRIM); limb(sh.c, [hx, hy + 82], [hx, hy + 164], w * 0.78, w * 0.58, col); ell(sh.c, hx + 16, hy + 170, 42, 17, col);
      return { th, sh };
    };
    rig.FF = leg(120, -146, CFAR, 74); rig.RF = leg(-120, -150, CFAR, 74);
    ell(B, 0, -212, 206, 112, CRIM); ell(B, 0, -200, 202, 108, CF); ell(B, 138, -228, 98, 108, CRIM); ell(B, 138, -216, 96, 104, CF); ell(B, -130, -200, 100, 110, CF);
    rig.spikes = spikeRow(B, 0, -208, 206, 112, 196, 340, 12, 30, mixc2(CF, CRIM, 0.45), 21).concat(spikeRow(B, 0, -208, 206, 112, 200, 336, 12, 18, CFD, 29));
    rig.RN = leg(-120, -150, CF, 74); rig.FN = leg(120, -146, CF, 74);
    rig.manes = []; for (let i = 0; i < 7; i++) { const px = 96 + i * 18, py = -300 - (i % 2) * 10, j = joint(B, px, py); const L = 54 + (i % 3) * 14; poly(j.c, [[px - 6, py], [px + 6, py], [px + 14, py - L * 0.5], [px + 2, py - L], [px - 8, py - L * 0.5]], i % 2 ? SN : mixc2(SN, SNL, 0.35)); poly(j.c, [[px - 3, py - L], [px + 12, py - L - 8], [px + 7, py - L + 6]], SN); ell(j.c, px + 5, py - L - 2, 2.4, 2.4, '#ffd86a'); j.px0 = i; rig.manes.push(j); }
    rig.heads = [];
    const specs = [{ px: 112, py: -276, hx: 262, hy: -418, s: 0.8, col: CFAR }, { px: 150, py: -250, hx: 372, hy: -318, s: 1.0, col: CF }, { px: 136, py: -226, hx: 318, hy: -226, s: 0.82, col: CF }];
    const order = [0, 2, 1];
    for (const i of order) {
      const sp = specs[i], hj = joint(B, sp.px, sp.py), Hc = hj.c, col = sp.col, rimc = i === 0 ? mixc2(CRIM, CFD, 0.5) : CRIM;
      limb(Hc, [sp.px, sp.py], [sp.hx - 20, sp.hy + 10], 96 * sp.s, 76 * sp.s, col);
      const g = $('g', { transform: `translate(${sp.hx} ${sp.hy}) scale(${sp.s})` }, Hc);
      const H = { hj, i, s: sp.s };
      ell(g, 0, -4, 78, 70, rimc); ell(g, -3, 2, 76, 66, col);
      H.ear = joint(g, -34, -56); poly(H.ear.c, [[-52, -40], [-16, -66], [-42, -156]], col); poly(H.ear.c, [[-44, -46], [-24, -62], [-40, -126]], CFD, {});
      H.cav = $('polygon', { fill: rgb(120, 10, 28), points: '0,0' }, g);
      H.jaw = joint(g, 30, 30); poly(H.jaw.c, [[20, 22], [166, 22], [156, 56], [20, 64]], col);
      H.lt = $('g', {}, H.jaw.c); for (let k = 0; k < 4; k++) { const tx = 62 + k * 28; poly(H.lt, [[tx, 22], [tx + 14, 22], [tx + 7, 2]], TOOTH); }
      poly(g, [[20, -38], [166, -14], [166, 22], [20, 40]], col); poly(g, [[20, -38], [166, -14], [166, -4], [20, -24]], rimc);
      H.ut = $('g', {}, g); for (let k = 0; k < 4; k++) { const tx = 68 + k * 26; poly(H.ut, [[tx, 24], [tx + 13, 22], [tx + 6, 46]], TOOTH); }
      ell(g, 166, -4, 18, 14, rgb(8, 8, 16)); ell(g, 160, -9, 5, 4, rimc);
      const ex = 56, ey = -22;
      H.glow = $('circle', { cx: ex, cy: ey, r: 44, fill: 'url(#gRed)' }, g); H.eye = joint(g, ex, ey); H.eyeEll = ell(H.eye.c, ex, ey, 17, 13, '#ffb347'); G.reg(H.eyeEll, '#ffb347'); ell(H.eye.c, ex + 3, ey, 7, 9, rgb(255, 232, 200)); ell(H.eye.c, ex - 5, ey - 4, 3.4, 3.4, '#fff');
      H.brow = joint(g, ex, ey - 10); poly(H.brow.c, [[ex - 28, ey - 22], [ex + 26, ey - 6], [ex + 26, ey - 17], [ex - 28, ey - 40]], CFD);
      H.lid = $('path', { d: `M${ex - 20} ${ey + 2} Q${ex} ${ey + 14} ${ex + 20} ${ey + 2}`, stroke: '#0a0a14', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, g);
      rig.heads[i] = H;
    }
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('tailtip', rig.tip.c, -440, -336); mk('head', rig.heads[1].hj.c, 372, -318); mk('head0', rig.heads[0].hj.c, 262, -418); mk('head2', rig.heads[2].hj.c, 318, -226); mk('body', B, 0, -200);
    rig.root = root;
    const A3 = (a, b, c) => [a, b, c];
    rig.N = { bodyY: 0, bodyRot: 0, tail1: 0, tail2: 0, hackle: 1, FN: [4, -4], FF: [4, -4], RN: [8, -10], RF: [8, -10], mane: 0.35, serp: 0, hrot: A3(0, 0, 0), jaw: A3(0.06, 0.06, 0.06), eyeO: A3(1, 1, 1), anger: A3(0, 0, 0), ear: A3(0, 0, 0), sleepy: A3(0, 0, 0), glow: 1, shakeX: 0, shakeY: 0, sx: 1, sy: 1 };
    const hinge = [30, 30];
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY);
      tail.set(-P.tail1 + 5 * Math.sin(t * 1.5), 1, 1); tip.set(-P.tail2 + 8 * Math.sin(t * 2.1 + 1), 1, 1);
      for (const k of ['FN', 'FF', 'RN', 'RF']) { const L = rig[k], a = P[k]; L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      rig.spikes.forEach((sp, i) => sp.set(sp.base + 2.5 * Math.sin(t * 8 + i) * (P.hackle > 1.2 ? 1.5 : 0.3), 1, P.hackle));
      rig.manes.forEach((m, i) => m.set(-8 + 6 * i + P.mane * 14 * Math.sin(t * (7 + P.mane * 6) + i * 1.7), 1, 0.25 + 0.8 * clamp(P.mane, 0, 1.6), 0, 0));
      rig.sjaw.set(clamp(P.serp) * 34 * (0.7 + 0.3 * Math.sin(t * 20)), 1, 1); { const w = clamp(P.serp), tp = [[-452, -318], [-452 - 40 * w, -318 + 8 * Math.sin(t * 30)], [-452 - 52 * w, -330], [-452 - 40 * w, -318 - 8 * Math.sin(t * 30)], [-452 - 52 * w, -306]]; rig.tongue.setAttribute('points', w < 0.05 ? '0,0' : tp.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ')); }
      for (let i = 0; i < 3; i++) {
        const H = rig.heads[i], sl = P.sleepy[i], breath = Math.sin(t * 1.6 + i * 2.1);
        H.hj.set(P.hrot[i] + 50 * sl + 2.2 * Math.sin(t * 1.2 + i * 1.9) + 1.5 * breath * sl);
        H.ear.set(-P.ear[i] + 24 * sl + 2 * Math.sin(t * 1.3 + i));
        const jw = clamp(P.jaw[i] + 0.0, 0, 1.2); H.jaw.set(jw * 30);
        const a = jw * 30 * rad, jt = (px, py) => { const dx = px - hinge[0], dy = py - hinge[1]; return [hinge[0] + dx * Math.cos(a) - dy * Math.sin(a), hinge[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
        const l0 = jt(20, 22), l1 = jt(166, 22); H.cav.setAttribute('points', [[24, 24], [166, 18], l1, l0].map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ')); H.cav.setAttribute('opacity', jw > 0.15 ? 1 : 0);
        const to = clamp((jw - 0.18) * 6); H.lt.setAttribute('opacity', to); H.ut.setAttribute('opacity', to);
        const bl = (1 - blink(t + i * 0.9, 3.4 + i * 0.5)) * P.eyeO[i] * (1 - 0.92 * sl); H.eye.set(0, 1, Math.max(0.05, bl));
        H.eyeEll.setAttribute('fill', mixc('#ffb347', '#ff2a38', clamp(P.anger[i]))); H.glow.setAttribute('r', 44 * P.glow * (0.7 + 0.5 * P.anger[i])); H.glow.setAttribute('opacity', clamp((0.35 + 0.6 * P.anger[i]) * (1 - 0.85 * sl)));
        H.brow.set(P.anger[i] * 14, 1, 1, 0, P.anger[i] * 6); H.lid.setAttribute('opacity', clamp(sl * 1.6 - 0.3));
      }
    };
    return rig;
  }
  const CERB = (() => {
    const N3 = (a) => [a, a, a], env_ = (lt, a) => EASE.smooth(clamp(lt / a));
    const sw = (t, i, amp) => amp * Math.sin(t * 1.3 + i * 2.0);
    const base = (c, extra) => Object.assign({ hrot: [sw(c.t, 0, 4), sw(c.t, 1, 3), sw(c.t, 2, 5)], tail1: 7 * Math.sin(c.t * 1.2) }, extra);
    const sleepyArr = (n, u, hold) => [0, 1, 2].map((i) => (i < n ? 1 : i === n ? u : 0));
    return {
      idle: (c) => ({ bodyY: 2 * Math.sin(c.t * 2), hrot: [sw(c.t, 0, 5), sw(c.t, 1, 3), sw(c.t, 2, 6)], jaw: [0.06 + 0.03 * Math.sin(c.t * 2.2), 0.05, 0.07], tail1: 7 * Math.sin(c.t * 1.2), ear: [3 * Math.sin(c.t * 1.9), 0, 2] }),
      growl: (c) => { const e = env_(c.lt, 0.3), ph = [0, 2.1, 4.0]; const j = ph.map((p) => 0.1 + 0.5 * e * (0.55 + 0.45 * Math.sin(c.lt * 8 + p))); return { bodyY: 16 * e, bodyRot: 3 * e, hackle: 1 + 0.6 * e, anger: N3(e), jaw: j, hrot: [10 * e + 2 * Math.sin(c.lt * 40), 14 * e, 18 * e - 2 * Math.sin(c.lt * 44)], ear: N3(26 * e), glow: 1 + 0.5 * e, shakeX: 2 * Math.sin(c.lt * 55) * e, tail1: -22 * e, FN: [4 - 20 * e, -4 + 12 * e], FF: [4 - 18 * e, -4 + 10 * e], RN: [8 - 28 * e, -10 + 26 * e], RF: [8 - 28 * e, -10 + 26 * e] }; },
      lunge: (c) => KO(c.u, [[0, { bodyY: 14, bodyRot: 3, hackle: 1.5, anger: N3(1), jaw: N3(0.65), hrot: [10, 14, 18], FN: [-16, 8], FF: [-14, 6], RN: [-20, 16], RF: [-20, 16], tail1: -20 }], [0.28, { bodyY: 32, bodyRot: -4, jaw: N3(0.5), hrot: [14, 20, 24], FN: [-40, 24], FF: [-36, 24], RN: [-44, 40], RF: [-44, 40] }], [0.5, { bodyY: -6, bodyRot: 14, jaw: N3(1.0), hrot: [22, 26, 30], FN: [95, 82], FF: [88, 78], RN: [-80, -70], RF: [-74, -64], tail1: -35, tail2: -25 }], [0.85, { bodyY: 0, bodyRot: 12, jaw: N3(1.0), FN: [92, 80], FF: [86, 76], RN: [-78, -68], RF: [-72, -62] }], [1, { bodyRot: 10, jaw: N3(0.7), FN: [70, 62], FF: [64, 56], RN: [-60, -56], RF: [-56, -50] }]], 'inOut'),
      bite: (c) => { const k = c.p.head === undefined ? 1 : c.p.head, f = c.lt * 7 * Math.PI, snap = clamp(0.5 + 0.5 * Math.cos(f), 0, 1) * 1.0; const j = [0.2, 0.2, 0.2], hr = [8, 10, 12]; j[k] = clamp(snap, 0, 1); hr[k] = 24 + 8 * Math.abs(Math.sin(f)); return { bodyRot: 8, bodyY: 8, hackle: 1.4, anger: N3(0.8), jaw: j, hrot: hr, FN: [40, 56], FF: [36, 52], RN: [-30, -48], RF: [-26, -44], shakeX: 1.5 * Math.sin(c.lt * 50), glow: 1.4 }; },
      block: (c) => { const e = env_(c.lt, 0.3), br = Math.sin(c.lt * 2.4); return { bodyY: 20 * e, bodyRot: 2 * e, hackle: 1.3 + 0.2 * br, anger: [0.7 * e, 0.9 * e, 0.7 * e], jaw: [0.2 + 0.1 * br, 0.3, 0.2 - 0.05 * br], hrot: [-6 * e, 6 * e, 14 * e], ear: N3(14 * e), glow: 1.2, tail1: -12 * e, FN: [4 - 22 * e, -4 + 14 * e], FF: [4 + 12 * e, -4 + 6 * e], RN: [8 - 30 * e, -10 + 28 * e], RF: [8 - 26 * e, -10 + 24 * e], shakeX: 0.8 * Math.sin(c.lt * 30) * e }; },
      sleepy: (c) => { const n = c.p.head === undefined ? 0 : c.p.head, u = EASE.inOut(c.u), sl = sleepyArr(n, u), aw = (i) => 1 - sl[i]; return { bodyY: 10 * (sl[0] + sl[1] + sl[2]) / 3 * 1.2, hackle: 0.85, anger: [0.5 * aw(0), 0.5 * aw(1), 0.5 * aw(2)], sleepy: sl, jaw: [0.06 + 0.06 * sl[0] * Math.sin(c.t * 1.6), 0.06 + 0.06 * sl[1] * Math.sin(c.t * 1.6 + 1), 0.06 + 0.08 * sl[2]], hrot: [sw(c.t, 0, 3) * aw(0), sw(c.t, 1, 3) * aw(1), sw(c.t, 2, 3) * aw(2)], tail1: 4 * Math.sin(c.t * 1.2), glow: 0.9 - 0.3 * (sl[0] + sl[1] + sl[2]) / 3 }; },
      'fight-sleep': (c) => { const f = 0.72 + 0.2 * Math.sin(c.lt * 2.2) - 0.1 * Math.max(0, Math.sin(c.lt * 5.3)), jerk = Math.max(0, Math.sin(c.lt * 3.1 + 0.7)) > 0.97 ? 1 : 0; return { bodyY: 26, hackle: 0.8, anger: [0, 0, 0.35 + 0.3 * Math.sin(c.lt * 2.2)], sleepy: [1, 1, clamp(f - 0.3 * jerk)], jaw: [0.04, 0.04, 0.1 + 0.08 * Math.sin(c.lt * 2.2)], hrot: [0, 0, -8 * jerk], eyeO: [1, 1, 0.55 + 0.4 * jerk], glow: 0.7, FN: [4 - 16, -4 + 12], FF: [4 - 14, -4 + 10], RN: [8 - 24, -10 + 22], RF: [8 - 24, -10 + 22], shakeX: 1.2 * Math.sin(c.lt * 24) * (0.4 + 0.6 * jerk) }; },
      talk: (c) => { const a = c.amp || 0, ph = [1.7, 0, 3.1]; const j = ph.map((p, i) => 0.06 + (i === 1 ? 0.6 : 0.36) * a * (0.6 + 0.4 * Math.abs(Math.sin(c.t * 22 + p)))); return { jaw: j, hrot: [sw(c.t, 0, 4) - 4 * a, sw(c.t, 1, 3) - 6 * a, sw(c.t, 2, 4) - 3 * a], anger: [0.15, 0.1, 0.15], hackle: 0.8, glow: 0.9, ear: N3(-4), bodyY: 2 * Math.sin(c.t * 2), tail1: 6 * Math.sin(c.t * 1.4) }; },
      'open-gate': (c) => { const e = env_(c.lt, 0.5), st = Math.sin(c.lt * 9) * e; return { bodyRot: -6 * e, bodyY: -4 * e, hackle: 1.6, anger: N3(e), jaw: [0.5 * e, 0.8 * e, 0.5 * e], hrot: [-24 * e, -28 * e, -18 * e], ear: N3(24 * e), glow: 1.7, shakeX: 1.6 * Math.sin(c.lt * 50) * e, FN: [4 + 56 * Math.max(0, st), -4 + 40 * Math.max(0, st)], FF: [4, -4], RN: [8 - 12 * e, -10 + 10 * e], RF: [8 - 12 * e, -10 + 10 * e], tail1: 18 * e }; },
      'bite-hold': (c) => { const k = c.p.head === undefined ? 1 : c.p.head, e = env_(c.lt, 0.2), sh = Math.sin(c.lt * 15) * (c.p.shake === undefined ? 1 : c.p.shake); const j = [0.34 + 0.2 * Math.sin(c.lt * 7 + 1), 0.34 + 0.2 * Math.sin(c.lt * 7 + 3), 0.34 + 0.2 * Math.sin(c.lt * 7 + 5)], hr = [8 + 3 * Math.sin(c.lt * 9), 8, 12 + 3 * Math.sin(c.lt * 9 + 2)]; j[k] = 0.1; hr[k] = 20 * e + 4 * sh; return { bodyY: 16 * e, bodyRot: 6 * e, hackle: 1.5, anger: N3(0.9), jaw: j, hrot: hr, shakeX: 2.5 * sh * e, FN: [4 + 36 * e, -4 + 40 * e], FF: [4 + 30 * e, -4 + 34 * e], RN: [8 - 30 * e, -10 + 28 * e], RF: [8 - 28 * e, -10 + 26 * e], glow: 1.5, ear: N3(24), tail1: -18 * e }; },
      'drag-down': (c) => { const k = c.p.head === undefined ? 1 : c.p.head, e = env_(c.lt, 0.3), f = -2 * Math.PI * (c.p.speed || 0.9) * c.lt; const j = [0.3, 0.3, 0.3], hr = [10, 10, 14]; j[k] = 0.1; hr[k] = 24 + 3 * Math.sin(f * 2); const lp = (ph, ctr, A, B) => { const a1 = ctr + A * Math.sin(ph), lift = Math.max(0, Math.cos(ph)); return [a1, a1 - B * lift]; }; return { bodyY: 24 * e, bodyRot: -8 * e, hackle: 1.4, anger: N3(0.8), jaw: j, hrot: hr, ear: N3(22), glow: 1.4, tail1: -10 * e, FN: lp(f, 20 * e, 22, 18), FF: lp(f + Math.PI, 20 * e, 22, 18), RN: lp(f + 1.5, -8 * e, 20, 18), RF: lp(f + 1.5 + Math.PI, -8 * e, 20, 18), shakeX: 1.2 * Math.sin(c.lt * 18) * e }; },
      'snake-hiss': (c) => { const e = env_(c.lt, 0.25); return { mane: 1.5 * e, hackle: 1.5, anger: N3(0.8 * e), jaw: [0.5 * e, 0.4 * e, 0.4 * e], hrot: [-12 * e, -8 * e, -4 * e], ear: N3(20 * e), glow: 1.4, bodyY: 10 * e, serp: 0.8 * e, tail1: 14 * Math.sin(c.lt * 6) * e, shakeX: 1.2 * Math.sin(c.lt * 45) * e }; },
      'tail-strike': (c) => { const f = c.lt * 2.4, ph = f - Math.floor(f), k = ph < 0.3 ? EASE.outCubic(ph / 0.3) : 1 - EASE.inOut((ph - 0.3) / 0.7); return { mane: 1.2, hackle: 1.3, anger: N3(0.9), jaw: N3(0.4), serp: 1, tail1: 40 * k - 10, tail2: 30 * k, hrot: [4, 6, 8], bodyY: 8, glow: 1.4 }; },
      'venom-drool': (c) => { const e = env_(c.lt, 0.4); return { bodyY: 20 * e, bodyRot: 8 * e, hackle: 1.1, anger: N3(0.7), jaw: [0.2, 0.4 + 0.2 * Math.sin(c.lt * 4), 0.2], hrot: [14 * e, 36 * e, 20 * e], mane: 0.8, ear: N3(14 * e), glow: 1.2, FN: [4 - 16 * e, -4 + 10 * e], FF: [4 - 14 * e, -4 + 8 * e], tail1: -12 * e }; },
      'tail-coil': (c) => { const e = env_(c.lt, 0.2); return { mane: 1.4, hackle: 1.4, anger: N3(1), jaw: N3(0.4), serp: 0.9, tail1: 10 + 28 * Math.sin(c.lt * 6) * e, tail2: -40 * e, bodyY: 14, bodyRot: 4 * e, hrot: [10, 14, 20], glow: 1.5 }; },
      fade: (c) => CERB.idle(c),
      wounded: (c) => { const e = env_(c.lt, 0.4), tr = Math.sin(c.lt * 20) * e; return { bodyY: 26 * e, bodyRot: 5 * e, hackle: 0.7, anger: N3(0.15), eyeO: N3(1 - 0.35 * e), jaw: N3(0.1), hrot: [24 * e, 30 * e, 36 * e], ear: N3(30 * e), glow: 0.6, shakeX: 1.4 * tr, tail1: 12 * e, FN: [4 - 8 * e + 3 * tr, -4 + 20 * e], FF: [4 - 6 * e - 3 * tr, -4 + 18 * e], RN: [8 - 26 * e, -10 + 24 * e], RF: [8 - 26 * e, -10 + 24 * e] }; },
    };
  })();
  // =============================================================== BEC: Black-Eyed Child (ep #002 monster; variant 0 = grey hoodie + messy light hair, 1 = old olive coat + black bowl cut)
  function buildBec(variant = 0) {
    const rig = newRig(); const root = $('g'); const lift = $('g', {}, root);
    const sk = rgb(218, 212, 220), skD = rgb(176, 170, 190), blk = rgb(4, 4, 8), v = variant % 2;
    const coat = v ? rgb(88, 94, 72) : rgb(120, 124, 144), coatD = v ? rgb(58, 62, 48) : rgb(84, 88, 108), pants = v ? rgb(34, 34, 44) : rgb(46, 52, 82), shoe = v ? rgb(40, 34, 32) : rgb(86, 64, 52), hair = v ? rgb(14, 12, 18) : rgb(112, 94, 76), hairL = v ? rgb(38, 34, 48) : rgb(150, 128, 104);
    const body = joint(lift, 0, -70); rig.body = body; const B = body.c;
    rig.legs = [-18, 18].map((hx) => { const j = joint(B, hx, -76); limb(j.c, [hx, -76], [hx, -8], 34, 28, pants); ell(j.c, hx + 6, -2, 24, 11, shoe); return j; });
    // coat / hoodie torso (slightly long, hangs past the hips)
    poly(B, [[-46, -204], [46, -204], [58, -60], [-58, -60]], coat); poly(B, [[14, -204], [46, -204], [58, -60], [24, -60]], coatD); ell(B, 0, -60, 58, 10, coatD);
    if (v) { poly(B, [[-46, -204], [-10, -204], [0, -150], [-30, -190]], coatD); poly(B, [[46, -204], [10, -204], [0, -150], [30, -190]], coatD); for (const by of [-150, -118, -86]) ell(B, 0, by, 4, 4, rgb(150, 140, 110)); }
    else { poly(B, [[-40, -112], [40, -112], [34, -76], [-34, -76]], coatD); $('path', { d: 'M-8 -200 L-12 -150 M8 -200 L12 -150', stroke: '#c8ccd8', 'stroke-width': 3, fill: 'none' }, B); }
    rig.arms = [-1, 1].map((sd) => { const sx = sd * 52, a = joint(B, sx, -194); limb(a.c, [sx, -194], [sx, -112], 26, 22, coat); const f = joint(a.c, sx, -112); limb(f.c, [sx, -112], [sx, -34], 22, 18, coat); ell(f.c, sx, -30, 11, 13, sk); a.fore = f; return a; });
    // head
    const hd = joint(B, 0, -208); rig.head = hd; const H = hd.c, hy = -262;
    if (!v) poly(H, [[-44, -210], [44, -210], [58, -234], [-58, -234]], coatD);
    poly(H, [[-14, -204], [14, -204], [12, -226], [-12, -226]], skD);
    ell(H, 0, hy + 2, 48, 54, skD); ell(H, -2, hy, 46, 52, sk); ell(H, -46, hy + 4, 7, 11, skD); ell(H, 46, hy + 4, 7, 11, skD);
    rig.face = joint(H, 0, hy); const F = rig.face.c;
    rig.eyes = [-1, 1].map((sd) => { ell(F, sd * 17, hy + 18 - 14, 20, 13, skD, { opacity: 0.55 }); const j = joint(F, sd * 17, hy + 4); ell(j.c, sd * 17, hy + 4, 14, 20, blk); return j; });  // pure black eyes: no whites, no pupils
    ell(F, 0, hy + 24, 4, 3, skD);
    rig.mouth = ell(F, 0, hy + 36, 8, 2.4, rgb(120, 96, 110)); G.reg(rig.mouth, rgb(120, 96, 110)); rig.smile = $('path', { d: `M-14 ${hy + 32} Q0 ${hy + 46} 14 ${hy + 32}`, stroke: rgb(110, 88, 104), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, F);
    rig.cheeks = $('g', { opacity: 0 }, F); $('path', { d: `M-26 ${hy + 30} Q-30 ${hy + 36} -26 ${hy + 40} M26 ${hy + 30} Q30 ${hy + 36} 26 ${hy + 40}`, stroke: skD, 'stroke-width': 2.4, fill: 'none' }, rig.cheeks);
    // hair (drawn over the top of the head)
    if (v) { ell(H, 0, hy - 24, 52, 38, hair); poly(H, [[-52, hy - 20], [52, hy - 20], [48, hy - 2], [-48, hy - 10]], hair); poly(H, [[-48, hy - 12], [-10, hy - 6], [-48, hy + 12]], hair); poly(H, [[48, hy - 12], [10, hy - 8], [48, hy + 12]], hair); }
    else { ell(H, 0, hy - 28, 50, 32, hair); for (let i = 0; i < 8; i++) { const th = (200 + i * 20) * Math.PI / 180, px = 48 * Math.cos(th), py = hy - 20 + 44 * Math.sin(th); poly(H, [[px - 8, py], [px + 8, py], [px + 14 * Math.cos(th), py + 30 * Math.sin(th) - 6]], i % 2 ? hairL : hair); } poly(H, [[-30, hy - 22], [-4, hy - 22], [-16, hy - 2]], hair); poly(H, [[6, hy - 22], [30, hy - 22], [22, hy - 6]], hair); }
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); }; mk('head', H, 0, hy); mk('eye', H, 0, hy + 4); mk('body', B, 0, -130);
    rig.root = root;
    rig.N = { bodyY: 0, bodyRot: 0, head: 0, headX: 0, look: 0, aL: -3, aR: 3, fL: 0, fR: 0, lL: 0, lR: 0, mouth: 0, smile: 0, shakeX: 0, shakeY: 0, sx: 1, sy: 1, twitch: 0, dis: 0 };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY); rig.legs[0].set(-P.lL); rig.legs[1].set(-P.lR);
      rig.arms[0].set(-P.aL); rig.arms[0].fore.set(-P.fL); rig.arms[1].set(-P.aR); rig.arms[1].fore.set(-P.fR);
      hd.set(P.head, 1, 1, P.headX, 0); rig.face.set(0, 1 - 0.18 * Math.abs(P.look), 1, 20 * P.look, 0);
      const mo = clamp(P.mouth, 0, 1.2); rig.mouth.setAttribute('rx', 8 + mo * 4.5); rig.mouth.setAttribute('ry', 2.4 + mo * 13); rig.mouth.setAttribute('opacity', P.smile > 0.5 ? 0 : 1); rig.mouth.setAttribute('fill', mixc(rgb(120, 96, 110), rgb(8, 5, 12), clamp(mo * 1.6))); rig.root.setAttribute('opacity', f2(1 - clamp(P.dis)));
      rig.smile.setAttribute('opacity', clamp(P.smile)); rig.cheeks.setAttribute('opacity', clamp(P.smile));
    };
    return rig;
  }
  const BEC = {
    'idle-still': (c) => ({ bodyY: 0.5 * Math.sin(c.t * 1.1), head: 0.6 * Math.sin(c.t * 0.7), twitch: 0 }),
    knock: (c) => { const f = c.lt / (c.p.period || 0.9), ph = f - Math.floor(f), hit = ph < 0.18 ? Math.sin(ph / 0.18 * Math.PI) : 0; return { aR: 70 + 20 * hit, fR: 40 + 55 * hit, bodyRot: 2 * hit, head: 2, mouth: 0 }; },
    'head-tilt': (c) => { const e = EASE.inOut(clamp(c.lt / (c.p.dur || 1.4))); return { head: 22 * e * (c.p.dir || 1), headX: 6 * e, bodyRot: 1 * e }; },
    step: (c) => ({ bodyY: 0.4 * Math.sin(c.t * 0.9), lL: 2 * Math.sin(c.lt * 1.2), lR: -2 * Math.sin(c.lt * 1.2), head: 0.5 * Math.sin(c.t * 0.7) }),
    hum: (c) => { const a = c.amp === undefined ? 0.5 + 0.5 * Math.sin(c.t * 5.2) : c.amp; return { mouth: 0.25 + 0.2 * a, head: 4 * Math.sin(c.t * 1.6), bodyRot: 1.2 * Math.sin(c.t * 1.6), bodyY: 0.4 * Math.sin(c.t * 1.1) }; },
    point: (c) => { const e = EASE.inOut(clamp(c.lt / 0.8)); return { aR: 8 + 82 * e, fR: 0 + 6 * e, head: 4 * e }; },
    smile: (c) => { const e = EASE.inOut(clamp(c.lt / (c.p.dur || 1.2))); return { smile: e, head: 6 * e, mouth: 0 }; },
    mimic: (c) => { const a = c.amp || 0; return { mouth: 0.1 + 0.8 * a, head: 3 * Math.sin(c.t * 2) + 4, bodyY: 0.4 * Math.sin(c.t * 1.1) }; },
    enter: (c) => { const e = clamp(c.lt / (c.dur || 1)); return { bodyY: 0.5 * Math.sin(c.t * 0.9), lL: 3 * Math.sin(c.lt * 1.4), lR: -3 * Math.sin(c.lt * 1.4), head: -6 * (1 - e) + 2, smile: 0.4 * e }; },
    shriek: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.12)), tr = Math.sin(c.lt * 44) * e; return { mouth: 1.15 * e, head: -18 * e, bodyRot: -3 * e, aL: -14 * e, aR: 14 * e, fL: 6 * e, fR: -6 * e, shakeX: 2.2 * tr, bodyY: -2 * e, look: 0 }; },
    dragged: (c) => { const e = EASE.smooth(clamp(c.lt / 0.25)), cl = Math.sin(c.lt * 9); return { bodyRot: -16 * e, bodyY: 14 * e, lL: 38 * e, lR: 30 * e, aL: 128 * e + 16 * cl * e, aR: 118 * e - 16 * cl * e, fL: 10 * e + 22 * cl * e, fR: 10 * e - 22 * cl * e, head: -10 * e, mouth: (c.p.mouth === undefined ? 0.45 : c.p.mouth) * e, shakeX: 1.4 * Math.sin(c.lt * 31) * e }; },
    'dissolve-smoke': (c) => { const u = EASE.inOut(clamp(c.u)); return { dis: u, sy: 1 + 0.45 * u, sx: 1 - 0.3 * u, bodyY: -12 * u, shakeX: 3.2 * u * Math.sin(c.lt * 37), head: 8 * u * Math.sin(c.lt * 13), mouth: 0.3 * u }; },
    'turn-to-camera': (c) => { const e = EASE.inOut(clamp(c.lt / (c.p.dur || 1.0))); return { look: 1 - e, head: -10 * (1 - e) + 8 * e, headX: 8 * (1 - e) }; },
  };
  BEC['no-blink-stare'] = BEC['idle-still'];
  BEC['hypno-chant'] = (c) => { const a = c.amp === undefined ? 0.5 + 0.5 * Math.sin(c.t * 9) : c.amp; return { mouth: 0.12 + 0.12 * a, head: 8 + 1.5 * Math.sin(c.t * 40), headX: 1.4 * Math.sin(c.t * 44), bodyY: 0.5 * Math.sin(c.t * 1.1), aL: -4, aR: 4 }; };
  BEC['claw-planks'] = (c) => { const e = EASE.smooth(clamp(c.lt / 0.3)), d = Math.sin(c.lt * 7) * e, slide = clamp(c.lt / (c.dur || 2)); return { bodyRot: -20 * e - 8 * slide, bodyY: 18 * e + 24 * slide, aR: 150 * e - 10 * d, fR: 14 * e + 20 * d, aL: 120 * e, fL: 10 * e, head: -12 * e, mouth: 0.5, shakeX: 1.6 * Math.sin(c.lt * 33) * e, lL: 40 * slide }; };
  BEC.idle = BEC['idle-still'];

  // =============================================================== THE KID v2 (no hood: messy dark hair, big eyes, baggy striped pyjamas, red scarf + shoes, big flashlight)
  function buildKid() {
    const rig = newRig(); const root = $('g'); const lift = $('g', {}, root);
    const skin = rgb(244, 212, 188), skinD = rgb(214, 172, 152), pj = rgb(201, 206, 230), pjS = rgb(143, 152, 200), pjD = rgb(158, 166, 206), shoe = rgb(196, 18, 31), shoeD = rgb(130, 10, 24), ink = rgb(30, 24, 40), scarfC = rgb(196, 18, 31), scarfD = rgb(130, 10, 24), fl = rgb(62, 70, 104), flL = rgb(112, 120, 156), hairC = rgb(42, 34, 58), hairL = rgb(74, 62, 98);
    const body = joint(lift, 0, -62); rig.body = body; const B = body.c;
    const stripes = (p, x, y0, y1, w, n, col) => { for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + 0.5) / n; poly(p, [[x - w / 2, y - 4], [x + w / 2, y - 4], [x + w / 2, y + 4], [x - w / 2, y + 4]], col); } };
    rig.legs = [-24, 24].map((hx) => { const j = joint(B, hx, -66); limb(j.c, [hx, -66], [hx, -8], 44, 38, pjD); stripes(j.c, hx, -62, -14, 40, 4, pjS); ell(j.c, hx + 10, -2, 32, 15, shoe); ell(j.c, hx + 12, 6, 30, 6, '#f4f1f8'); ell(j.c, hx + 18, -8, 12, 6, shoeD); return j; });
    rig.scarf = G.reg($('path', { fill: scarfC }, B), scarfC);
    const arm = (sx, parent) => { const j = joint(parent, sx, -168); limb(j.c, [sx, -168], [sx, -84], 44, 36, pj); stripes(j.c, sx, -160, -96, 40, 4, pjS); ell(j.c, sx, -84, 21, 20, pjD); ell(j.c, sx, -78, 17, 16, skin); return j; };
    rig.aL = arm(-56, B);
    poly(B, [[-64, -196], [64, -196], [80, -58], [-80, -58]], pj); poly(B, [[24, -196], [64, -196], [80, -58], [34, -58]], pjD);
    for (let i = 0; i < 5; i++) { const y = -176 + i * 26, k0 = (y + 196) / 138, xl = lerp(64, 80, k0), xr = lerp(64, 80, (y + 8 + 196) / 138); poly(B, [[-xl, y], [xl, y], [xr, y + 9], [-xr, y + 9]], pjS); }
    ell(B, 0, -58, 80, 12, pjD); for (const by of [-170, -134, -98]) ell(B, 0, by, 5, 5, pjS);
    poly(B, [[-60, -214], [60, -214], [66, -180], [-66, -180]], scarfC); poly(B, [[12, -180], [66, -180], [60, -214], [26, -214]], scarfD);
    const aR = arm(56, B); rig.aR = aR;
    rig.beam = $('polygon', { points: '56,44 128,780 -16,780', fill: '#fff0aa', opacity: 0 }, aR.c);
    limb(aR.c, [56, -128], [56, -4], 42, 44, fl); limb(aR.c, [56, -66], [56, -50], 46, 46, flL); limb(aR.c, [56, -8], [56, 38], 60, 68, fl); limb(aR.c, [56, 34], [56, 44], 58, 58, rgb(255, 238, 170)); limb(aR.c, [56, -34], [56, -26], 45, 45, scarfC);
    ell(aR.c, 56, -84, 18, 18, skin);
    // head (no hood): face, ears, big eyes, messy hair that bounces
    const hd = joint(B, 0, -200); rig.head = hd; const H = hd.c; const hy = -264;
    rig.hairBack = ell(H, 0, hy - 30, 72, 60, hairC);
    poly(H, [[-22, -204], [22, -204], [20, -226], [-20, -226]], skinD);
    ell(H, -62, hy + 6, 11, 15, skinD); ell(H, 62, hy + 6, 11, 15, skinD); ell(H, 0, hy + 4, 64, 66, skinD); ell(H, -2, hy + 2, 62, 63, skin);
    rig.locks = [];
    for (let i = 0; i < 11; i++) { const th = (196 + i * 14.8) * Math.PI / 180, px = 66 * Math.cos(th), py = hy - 20 + 48 * Math.sin(th), len = 34 + 14 * ((i * 7) % 3), w = 12 + (i % 2) * 4, out = Math.atan2(Math.sin(th) * 48 / 66, Math.cos(th)) * 0 + th; const j = joint(H, px, py); const ux = Math.cos(th), uy = Math.sin(th), nx = -uy, ny = ux; poly(j.c, [[px - nx * w, py - ny * w], [px + ux * len, py + uy * len], [px + nx * w, py + ny * w]], i % 3 === 0 ? hairL : hairC); j.baseRot = (th * 180 / Math.PI + 90) * 0; j.k = i; rig.locks.push(j); }
    ell(H, 0, hy - 30, 56, 38, hairC); ell(H, -8, hy - 40, 40, 20, hairL);
    for (const [fx, fw, fl_] of [[-34, 14, 12], [-8, 14, 17], [22, 14, 13], [42, 12, 9]]) poly(H, [[fx - fw, hy - 40], [fx + fw, hy - 40], [fx + 2, hy - 40 + fl_]], hairC);   // fringe
    rig.eyes = [-1, 1].map((s) => { const j = joint(H, s * 24, hy + 2); ell(j.c, s * 24, hy + 2, 17, 21, '#ffffff'); const iris = ell(j.c, s * 24, hy + 4, 11, 14, rgb(92, 62, 48)); const pu = ell(j.c, s * 24, hy + 4, 6.4, 8.4, ink); ell(j.c, s * 24 - 3, hy - 3, 4.6, 4.6, '#ffffff'); ell(j.c, s * 24 + 4, hy + 8, 2.2, 2.2, '#ffffff'); $('path', { d: `M${s * 24 - 18} ${hy - 6} Q${s * 24} ${hy - 26} ${s * 24 + 18} ${hy - 6}`, stroke: ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, j.c); return { j, s, pu, iris }; });
    rig.brows = [-1, 1].map((s) => { const j = joint(H, s * 24, hy - 30); poly(j.c, [[s * 38, hy - 30], [s * 10, hy - 26], [s * 10, hy - 32], [s * 38, hy - 38]], hairC); return { j, s }; });
    ell(H, 0, hy + 20, 5, 3.4, skinD);
    rig.mouth = ell(H, 0, hy + 42, 10, 6, ink); rig.tongue = ell(H, 0, hy + 46, 6, 3, rgb(220, 110, 120), { opacity: 0 });
    for (const s of [-1, 1]) ell(H, s * 40, hy + 28, 12, 7, rgb(236, 140, 146), { opacity: 0.55 });
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', H, 0, hy); mk('eye', H, 0, hy + 2); mk('body', B, 0, -130); mk('lens', aR.c, 56, 44);
    rig.root = root;
    rig.N = { bodyRot: 0, bodyY: 0, head: 0, lookX: 0, lookY: 0, aL: -14, aR: 95, lL: -6, lR: 6, scarf: [150, 130], beam: 0, beamOn: 0, wide: 0.3, mouth: 0.2, sleep: 0, brow: 0.5, shakeX: 0, shakeY: 0, sx: 1, sy: 1, hair: 0.15, smile: 0 };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY);
      rig.legs[0].set(-P.lL); rig.legs[1].set(-P.lR); rig.aL.set(-P.aL); aR.set(-P.aR);
      hd.set(P.head);
      const bl = P.sleep > 0.5 ? 0.08 : Math.max(0.1, 1 - blink(t, 3.6));
      rig.eyes.forEach((E) => { E.j.set(0, 1 + P.wide * 0.18, Math.max(0.06, bl * (1 + P.wide * 0.16) * (1 - P.sleep))); E.pu.setAttribute('cx', E.s * 24 + P.lookX * 6); E.iris.setAttribute('cx', E.s * 24 + P.lookX * 6); E.pu.setAttribute('cy', hy + 4 + P.lookY * 6); E.iris.setAttribute('cy', hy + 4 + P.lookY * 6); const k = 1 - P.wide * 0.18; E.pu.setAttribute('rx', 6.4 * k); E.pu.setAttribute('ry', 8.4 * k); });
      rig.brows.forEach((E) => E.j.set(E.s * (P.brow - 0.5) * -22, 1, 1, 0, -P.wide * 9));
      const mo = clamp(P.mouth, 0, 1.2); rig.mouth.setAttribute('rx', 8 + mo * 5 + P.smile * 5); rig.mouth.setAttribute('ry', 3.4 + mo * 13); rig.tongue.setAttribute('opacity', mo > 0.5 ? 0.9 : 0); rig.tongue.setAttribute('cy', hy + 42 + mo * 7);
      rig.beam.setAttribute('opacity', 0.32 * P.beam);
      const hairAmp = clamp(Math.abs(P.lL) / 24 + P.hair, 0, 2.2);
      rig.locks.forEach((j) => j.set(hairAmp * 9 * Math.sin(t * 13 + j.k * 1.7) + 3 * Math.sin(t * 1.9 + j.k) + P.bodyRot * -0.3, 1, 1));
      const ta = P.scarf[0] + 12 * Math.sin(t * 2.5), tl = P.scarf[1], pl = [], pr = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10, d = [Math.sin(ta * rad), Math.cos(ta * rad)], wv = 18 * Math.sin(u * 6.9 + t * 4) * u, px = 34 + d[0] * tl * u - d[1] * wv, py = -190 + d[1] * tl * u + d[0] * wv, wd = 28 - 10 * u;
        pl.push([px - d[1] * wd / 2, py + d[0] * wd / 2]); pr.push([px + d[1] * wd / 2, py - d[0] * wd / 2]); }
      rig.scarf.setAttribute('d', 'M' + pl.concat(pr.reverse()).map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z');
    };
    return rig;
  }
  const KID = {
    'idle-scared': (c) => { const tr = Math.sin(c.t * 22); return { bodyY: 2 * Math.sin(c.t * 2.4), shakeX: 0.8 * tr, head: 3 * Math.sin(c.t * 1.8), wide: 0.9, mouth: 0.5, brow: 1, aL: -24 + 6 * Math.sin(c.t * 3), aR: 70, lookX: Math.sin(c.t * 1.1), lookY: 0.2, beam: 1, scarf: [140, 120] }; },
    walk: (c) => { const f = 2 * Math.PI * (c.p.speed || 1.4) * c.lt; return { bodyY: 3 * Math.abs(Math.sin(f)), bodyRot: 3, lL: 22 * Math.sin(f), lR: -22 * Math.sin(f), aL: -24 * Math.sin(f), aR: 75 + 22 * Math.sin(f * 0.5), head: 4 + 6 * Math.sin(f * 0.5), lookX: Math.sin(f * 0.5), wide: 0.5, mouth: 0.3, beam: 1, scarf: [120, 140] }; },
    run: (c) => { const f = 2 * Math.PI * (c.p.speed || 2.6) * c.lt; return { bodyY: 6 * Math.abs(Math.sin(f)) - 4, bodyRot: 16, lL: 48 * Math.sin(f), lR: -48 * Math.sin(f), aL: -75 * Math.sin(f), aR: 75 + 35 * Math.sin(f), head: 4, wide: 1, mouth: 0.8, brow: 1, beam: 1, scarf: [95, 230], lookX: -0.5 }; },
    hide: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.4)), pk = Math.sin(c.t * 1.3) * 0.5 + 0.5; return { bodyY: 62 * e, bodyRot: 4 * e, head: 6 * e, lookX: 0.9, lookY: -0.2, wide: 1, mouth: 0.5, brow: 1, aL: -150 * e - 14 * (1 - e), aR: 150 * e + 95 * (1 - e), beam: 0.5 * e, lL: -40 * e - 6 * (1 - e), lR: 40 * e, shakeX: 0.7 * Math.sin(c.lt * 28) * e, scarf: [150, 90] }; },
    peek: (c) => { const f = (c.lt / Math.max(0.5, c.dur)); const up = Math.sin(clamp(f) * Math.PI); return { bodyY: 62 - 30 * up, bodyRot: 4, head: 6 - 6 * up, lookX: 0.9, wide: 1, mouth: 0.4, brow: 1, aL: -150, aR: 150, beam: 0.5, lL: -40, lR: 40, scarf: [150, 90] }; },
    cower: (c) => { const e = env(c.lt, 0.3), tr = Math.sin(c.lt * 26) * e; return { bodyY: 98 * e, bodyRot: 12 * e, head: 36 * e, aL: 55 * e - 14 * (1 - e), aR: 62 * e + 95 * (1 - e), lL: -78 * e, lR: -70 * e, shakeX: 2.2 * tr, shakeY: 0.8 * Math.sin(c.lt * 31) * e, wide: 1, mouth: 0.9, brow: 1, beam: 0, scarf: [160, 70], lookX: -0.4 }; },
    gasp: (c) => { const e = env(c.lt, 0.15); return { bodyY: -3 * e, bodyRot: -6 * e, head: -6 * e, wide: 1, mouth: 1, brow: 1, aL: -150 * e, aR: 95, beam: 0.8, shakeX: 1.4 * Math.sin(c.lt * 34) * e, scarf: [160, 100] }; },
    'scared-back': (c) => { const f = 2 * Math.PI * 1.8 * c.lt, e = env(c.lt, 0.15); return { bodyRot: -10 * e, bodyY: 2 * Math.abs(Math.sin(f)), lL: -18 * Math.sin(f) * e, lR: 18 * Math.sin(f) * e, wide: 1, mouth: 0.8, brow: 1, aL: -60 * e - 14 * (1 - e), aR: 40, head: -6, beam: 1 - 0.5 * Math.sin(c.lt * 40), shakeX: 1.2 * Math.sin(c.lt * 40), scarf: [160, 100], lookX: 1 }; },
    chase: (c) => { const f = 2 * Math.PI * (c.p.speed || 1.5) * c.lt; return { bodyY: 3 * Math.abs(Math.sin(f)), bodyRot: 4, lL: 24 * Math.sin(f), lR: -24 * Math.sin(f), aL: 130 + 15 * Math.sin(f * 2), aR: 75 + 22 * Math.sin(f * 0.5), head: -10 + 4 * Math.sin(f * 0.5), lookX: Math.sin(c.lt * 1.4), lookY: -0.7, wide: 0.5, mouth: 0.7, beam: 1, brow: 0, scarf: [120, 140] }; },
    lost: (c) => ({ bodyY: 2 * Math.sin(c.t * 2), head: 8 * Math.sin(c.t * 1.9), lookX: Math.sin(c.t * 1.9), lookY: 0.2, wide: 0.7, mouth: 0.35, brow: 1, aL: -20 + 5 * Math.sin(c.t * 2), aR: 70 + 30 * Math.sin(c.t * 1.9), beam: 1, scarf: [140, 120] }),
    'bed-wake': (c) => KO(c.u, [[0, { bodyRot: 88, bodyY: 62, sleep: 1, mouth: 0.1, beam: 0, aL: -30, aR: 20, brow: 1, head: -8 }], [0.2, { bodyRot: 88, bodyY: 62, sleep: 0, wide: 1, mouth: 0.6, brow: 1 }], [0.55, { bodyRot: 30, bodyY: 20, sleep: 0, wide: 1, mouth: 0.7, aL: -60, aR: 50, head: 6, lookX: 1 }], [1, { bodyRot: 2, bodyY: 6, sleep: 0, wide: 1, mouth: 0.8, aL: -50, aR: 50, head: -4, lookX: 1, brow: 1 }]], 'inOut'),
    'look-up': (c) => { const e = env(c.lt, 0.4); return { head: -26 * e, bodyRot: -4 * e, lookY: -1 * e, wide: 1 * e, mouth: 0.8 * e, aR: 95 + 70 * e, beam: 1, aL: -20, brow: 1, scarf: [160, 110] }; },
    sleep: (c) => ({ bodyRot: 88, bodyY: 62, head: -8, sleep: 1, mouth: 0.1 + 0.15 * Math.sin(c.t * 1.8), aL: -30, aR: 5, lL: -4, lR: 4, brow: 1, beam: 0, wide: 0, sy: 1 + 0.015 * Math.sin(c.t * 1.8), scarf: [150, 90] }),
    wake: (c) => KO(c.u, [[0, { bodyRot: 88, bodyY: 62, sleep: 1, mouth: 0.1, beam: 0, aL: -30, aR: 20 }], [0.25, { bodyRot: 88, bodyY: 62, sleep: 0, wide: 1, mouth: 0.7 }], [0.7, { bodyRot: 20, bodyY: 14, sleep: 0, wide: 1, mouth: 0.6, aL: -50, aR: 40, head: 8 }], [1, { bodyRot: 0, bodyY: 0, sleep: 0, wide: 0.9, mouth: 0.5, aL: -24, aR: 70, brow: 1 }]], 'inOut'),
  };
  KID.talk = (c) => ({ bodyY: 1.5 * Math.sin(c.t * 2.2), head: 3 * Math.sin(c.t * 1.7) + 2, mouth: 0.08 + 0.85 * (c.amp || 0), wide: 0.4 + 0.3 * (c.amp || 0), brow: 0.6, aL: -20 + 8 * Math.sin(c.t * 3), aR: c.p.aR === undefined ? 35 : c.p.aR, beam: c.p.beam === undefined ? 0.6 : c.p.beam, smile: 0.2, lookX: c.p.look === undefined ? 0.5 : c.p.look, scarf: [150, 120] });
  KID.wave = (c) => ({ bodyRot: -2, aL: 140 + 28 * Math.sin(c.lt * 9), aR: 80, mouth: 0.4, smile: 1, wide: 0.3, brow: 0.2, head: 4 * Math.sin(c.lt * 4.5), beam: 0.7, scarf: [140, 120], hair: 0.5 });
  KID['look-back'] = (c) => { const e = env(c.lt, 0.25); return { bodyRot: -6 * e, head: -14 * e, lookX: -1 * e, lookY: -0.2 * e, wide: 0.9 * e, mouth: 0.4 * e, brow: 1, aR: 80, aL: -20, beam: 0.6, scarf: [150, 130], hair: 0.5 }; };
  KID['in-bed'] = (c) => ({ bodyRot: 88, bodyY: 62, head: -8, sleep: 0, lookY: -0.9, lookX: 0, wide: 0.4, mouth: 0.1 + 0.04 * Math.sin(c.t * 1.8), aL: -30, aR: 5, lL: -4, lR: 4, brow: 0.9, beam: 0, scarf: [150, 90], sy: 1 + 0.015 * Math.sin(c.t * 1.8) });
  KID['bed-turn'] = (c) => { const u = EASE.inOut(c.u); return { bodyRot: 88, bodyY: 62, head: -8 - 22 * u, sleep: 0, lookY: -0.9 + 0.2 * u, lookX: -1 * u, wide: 0.4 + 0.6 * u, mouth: 0.1 + 0.5 * u, aL: -30, aR: 5, lL: -4, lR: 4, brow: 1, beam: 0, scarf: [150, 90], shakeX: 0.6 * u * Math.sin(c.lt * 30) }; };
  KID['shake-head'] = (c) => { const e = env(c.lt, 0.12); return { head: 16 * Math.sin(c.lt * 15) * e, bodyRot: -4 * e, lookX: 0.8 * Math.sin(c.lt * 15) * e, wide: 1, mouth: 0.5, brow: 1, aL: -150 * e - 14 * (1 - e), aR: 80, beam: 0.3, scarf: [150, 110], hair: 0.8, shakeX: 1.2 * Math.sin(c.lt * 30) * e }; };
  KID['hand-drift'] = (c) => { const u = EASE.inOut(clamp(c.u)); return { bodyRot: 2 * u, bodyY: 1 * Math.sin(c.t * 1.4), head: -3 * u, lookX: 0, lookY: 0, wide: 0.0, brow: 0.5, mouth: 0.08, aL: -14, aR: 40 + 70 * u, fx: 0, beam: 0.35 * (1 - u), scarf: [150, 100], hair: 0.1, shakeX: 0.4 * Math.sin(c.lt * 24) * u }; };
  KID['snap-awake'] = (c) => { const e = EASE.outCubic(clamp(c.lt / 0.15)); return { bodyRot: -8 * e, head: -8 * e, wide: 1, mouth: 0.7 * e, brow: 1, aL: -60 * e, aR: 110 - 70 * e, beam: 0.6, scarf: [160, 100], shakeX: 1.6 * Math.sin(c.lt * 40) * e, lookX: 0.6 }; };
  KID.idle = KID['idle-scared'];

  // =============================================================== APEP (Egyptian chaos serpent, ep #003 monster, screen-LEFT, faces +x)
  // Local origin = ground point where the raised neck leaves the sand. The body is 17 spine joints (tail tip = 0 ... head = 16) following
  // a ground slither wave + a Bezier neck (rear / reach / headRot), optionally wrapped into a helix (coil) around a point (wrapX, wrapY).
  // Spine is Catmull-Rom resampled (4 sub-steps/segment) and drawn as flat vector quads+circles (no outlines).
  // layer: 0 = whole snake, 1 = only back parts (head hidden), 2 = only front arcs + head -> use two actors around Thor for the squeeze.
  function buildApep() {
    const rig = newRig(); const root = $('g'); const lift = $('g', {}, root);
    const OB = rgb(38, 24, 60), OB2 = rgb(62, 38, 94), SHEEN = rgb(104, 66, 152), BEL = rgb(146, 114, 188), SPK = rgb(66, 40, 104), FANG = rgb(238, 232, 212), VEIN = '#b07aff', ACID = '#c8ff3c';
    const body = joint(lift, 0, 0); rig.body = body; const B = body.c;
    const NJ = 17, SUB = 4, M = (NJ - 1) * SUB + 1;
    const PLY = (g, col) => poly(g, [[0, 0], [1, 0], [1, 1]], col);
    // ---- spikes (behind the body), asymmetric: a few skipped, sizes vary
    rig.spk = []; const spg = $('g', {}, B);
    for (let i = 1; i < NJ; i++) { const h = hash(i * 3.7 + 2); if (h < 0.18) continue; rig.spk.push({ k: i * SUB - 1, h: (30 + 60 * hash(i * 5.1)) * (0.6 + 0.6 * i / NJ), lean: 0.5 + hash(i * 1.3), e: PLY(spg, SPK), e2: PLY(spg, VEIN) }); }
    // ---- body samples (type-layered so strips never get covered by the next circle)
    const gQ = $('g', {}, B), gBel = $('g', {}, B), gSh = $('g', {}, B), gRid = $('g', {}, B), gVn = $('g', {}, B), gGs = $('g', {}, B);
    rig.Q = []; rig.Ce = []; rig.Be = []; rig.Sh = [];
    for (let k = 0; k < M; k++) { rig.Q.push(PLY(gQ, OB)); rig.Ce.push(ell(gQ, 0, 0, 5, 5, OB)); }
    for (let k = 0; k < M - 1; k++) rig.Be.push(PLY(gBel, BEL));
    for (let k = 0; k < M - 1; k++) rig.Sh.push(PLY(gSh, SHEEN));
    rig.rid = []; for (let i = 0; i < NJ; i++) rig.rid.push($('polyline', { fill: 'none', stroke: i % 2 ? OB2 : '#9cff5a', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: i % 2 ? 0.9 : 0.5 }, gRid));
    rig.vnG = $('polyline', { fill: 'none', stroke: VEIN, 'stroke-width': 16, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.25 }, gVn);
    rig.vn = $('polyline', { fill: 'none', stroke: '#e3c8ff', 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.85 }, gVn);
    // knife-cut gashes (cartoon, cut open pale violet, no gore)
    rig.gash = [11, 27, 41, 55].map((k) => ({ k, a: $('line', { stroke: '#0b0516', 'stroke-width': 11, 'stroke-linecap': 'round' }, gGs), b: $('line', { stroke: '#e6d2ff', 'stroke-width': 4, 'stroke-linecap': 'round' }, gGs), c: $('line', { stroke: '#e6d2ff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }, gGs) }));
    // ---- head
    const hd = joint(B, 0, 0); rig.head = hd; const Hc = hd.c; rig.hdg = hd.g;
    // hood: fan behind the skull, spiky rim, glowing pattern
    const hood = joint(Hc, -26, -8); rig.hood = hood;
    const fan = (rx, ry, cx, cy, n, col, sd) => { const pts = []; for (let i = 0; i <= n * 2; i++) { const a = -Math.PI * 0.62 + (Math.PI * 1.24) * i / (n * 2), rr = i % 2 ? 0.8 : 1 + 0.12 * hash(sd + i); pts.push([cx + Math.cos(a) * rx * rr * (a > 0 ? 1 : 1), cy + Math.sin(a) * ry * rr]); } pts.push([cx + 10, cy + ry * 0.35]); pts.push([cx + 10, cy - ry * 0.35]); return poly(hood.c, pts, col); };
    const fanL = (rx, ry, cx, cy, col) => ell(hood.c, cx, cy, rx, ry, col);
    fan(120, 250, -34, -10, 11, OB2, 3); fanL(86, 190, -26, -8, rgb(70, 40, 108));
    for (let i = 0; i < 3; i++) $('path', { d: `M-20 ${-150 + i * 8} Q${-110 - i * 6} ${-20 - i * 8} -20 ${150 - i * 8}`, stroke: VEIN, 'stroke-width': 5, fill: 'none', opacity: 0.55 }, hood.c);
    $('circle', { cx: -42, cy: -10, r: 44, fill: 'none', stroke: VEIN, 'stroke-width': 5, opacity: 0.6 }, hood.c); $('circle', { cx: -42, cy: -10, r: 14, fill: VEIN, opacity: 0.5 }, hood.c);
    // upper cavity, tongue, jaw, skull
    const hinge = [36, 42]; rig.hinge = hinge;
    rig.cav = PLY(Hc, rgb(78, 8, 56)); rig.gul = $('ellipse', { cx: 70, cy: 44, rx: 40, ry: 22, fill: 'url(#gViolet)' }, Hc);
    rig.tng = PLY(Hc, rgb(206, 38, 128));
    const jaw = joint(Hc, hinge[0], hinge[1]); rig.jaw = jaw;
    poly(jaw.c, [[10, 26], [302, 20], [298, 42], [252, 72], [170, 92], [70, 100], [0, 86]], OB);
    poly(jaw.c, [[0, 86], [70, 100], [170, 92], [252, 72], [298, 42], [288, 46], [244, 80], [170, 102], [66, 110], [-8, 94]], BEL);
    poly(jaw.c, [[88, 100], [104, 146], [128, 96]], SPK); poly(jaw.c, [[160, 94], [176, 130], [196, 90]], SPK);
    rig.lt = $('g', {}, jaw.c); for (const x of [110, 150, 190, 232, 268]) poly(rig.lt, [[x, 26], [x + 13, 26], [x + 6, 2]], FANG);
    poly(Hc, [[-60, -74], [10, -108], [90, -110], [150, -92], [215, -70], [270, -50], [312, -26], [318, 6], [300, 22], [220, 26], [120, 32], [40, 40], [-60, 66]], OB);
    poly(Hc, [[0, -106], [90, -110], [150, -92], [215, -70], [270, -50], [312, -26], [302, -14], [262, -34], [200, -56], [140, -76], [80, -92], [10, -90]], SHEEN);
    poly(Hc, [[-20, -90], [-96, -156], [-62, -66]], SPK); poly(Hc, [[20, -102], [30, -160], [58, -104]], SPK); poly(Hc, [[78, -108], [112, -172], [128, -100]], SPK);   // asymmetric horns
    $('polyline', { points: '20,-80 80,-98 140,-80 200,-54 250,-40', fill: 'none', stroke: VEIN, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }, Hc);
    ell(Hc, 292, -14, 9, 5, rgb(8, 4, 16)); ell(Hc, 292, -15, 4, 2, ACID, { opacity: 0.7 });
    rig.ut = $('g', {}, Hc);
    const lipY = (x) => 40 - 0.054 * (x - 40);
    for (const x of [86, 112, 138, 166, 192]) poly(rig.ut, [[x, lipY(x) - 2], [x + 14, lipY(x) - 2], [x + 6, lipY(x) + 22]], FANG);
    poly(rig.ut, [[226, 24], [258, 20], [252, 66], [244, 94], [238, 126], [234, 92], [228, 58]], FANG);      // big jagged fang
    poly(rig.ut, [[150, 34], [174, 31], [166, 70], [160, 92]], FANG);
    // gash across the snout
    $('line', { x1: 214, y1: -66, x2: 252, y2: -30, stroke: '#0b0516', 'stroke-width': 10, 'stroke-linecap': 'round' }, Hc); $('line', { x1: 214, y1: -66, x2: 252, y2: -30, stroke: '#e6d2ff', 'stroke-width': 4, 'stroke-linecap': 'round' }, Hc);
    // eye (hypnotic): halo, almond, slit pupil, spiral
    const ex = 176, ey = -58;
    rig.glow = $('circle', { cx: ex, cy: ey, r: 76, fill: 'url(#gAcid)' }, Hc);
    const eye = joint(Hc, ex, ey); rig.eye = eye;
    rig.eyeEll = poly(eye.c, [[ex - 36, ey + 10], [ex - 8, ey - 20], [ex + 26, ey - 22], [ex + 50, ey - 4], [ex + 22, ey + 16], [ex - 10, ey + 20]], ACID); G.reg(rig.eyeEll, ACID);
    rig.pupil = ell(eye.c, ex + 8, ey - 1, 6, 19, rgb(12, 4, 22));
    const sp = joint(eye.c, ex + 8, ey - 1); rig.spiral = sp; const sp1 = [], sp2 = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * 4 * Math.PI, rr = 3 + 24 * i / 48; sp1.push([ex + 8 + Math.cos(a) * rr, ey - 1 + Math.sin(a) * rr]); sp2.push([ex + 8 + Math.cos(a + Math.PI) * rr, ey - 1 + Math.sin(a + Math.PI) * rr]); }
    rig.spG = $('g', { opacity: 0 }, sp.c); const pl = (pts, col, w) => $('polyline', { points: pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' '), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, rig.spG);
    ell(rig.spG, ex + 8, ey - 1, 28, 28, rgb(70, 20, 110), { opacity: 0.8 }); pl(sp1, '#ffffff', 5); pl(sp2, '#1a0630', 5);
    poly(Hc, [[ex - 52, ey - 6], [ex + 58, ey - 36], [ex + 62, ey - 20], [ex - 46, ey + 2]], OB);                // angry brow
    poly(Hc, [[ex + 20, ey - 32], [ex + 56, ey - 98], [ex + 66, ey - 30]], SPK); poly(Hc, [[ex - 22, ey - 18], [ex - 34, ey - 62], [ex - 6, ey - 24]], SPK);
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 130, -10); mk('eye', Hc, ex + 10, ey); mk('mouth', Hc, 280, 28); mk('fang', Hc, 238, 126); mk('tail', B, -900, 0); mk('body', B, 0, -120); rig.dynHead = true;
    rig.root = root;
    rig.N = { bodyY: 0, shakeX: 0, shakeY: 0, rear: 0.2, reach: 150, headRot: 0, headDrop: 0, hs: 1, waveA: 34, waveP: 0, tailUp: 0, tailSwing: 0, sway: 0, coil: 0, wrapX: 520, wrapY: 0, wrapR: 170, wrapH: 900, turns: 2.75, squeeze: 0, layer: 0, jaw: 0.04, unhinge: 0, tongue: 0, eyeGlow: 1, hypno: 0, hood: 0.3, sink: 0, hurt: 0, girth: 1.25, tlen: 900, len: 1, lam: 330, rearK: 1, coilLift: 0, bulge: -1, bulgeAmp: 0, eye: 1 };
    const wprof = (s) => (s < 0.55 ? 8 + 142 * Math.pow(Math.sin(s / 0.55 * Math.PI / 2), 0.7) : lerp(150, 116, (s - 0.55) / 0.45));
    const sm = (x) => x * x * (3 - 2 * x);
    function spine(P, t) {
      const pts = [], zz = [], TLEN = P.tlen * P.len, A = P.waveA, ph = P.waveP, lam = P.lam;
      for (let i = 0; i <= 9; i++) { const x = -TLEN * (1 - i / 9), env = clamp(-x / 170), tt = 1 - i / 9; let y = -A * (0.5 + 0.5 * Math.sin(2 * Math.PI * x / lam - ph)) * env; y -= P.tailUp * tt * tt * 460; pts.push([x + P.tailSwing * tt * tt * 160, y]); }
      const hy = -P.rear * 620 * P.rearK + P.headDrop, hx = P.reach, a = P.headRot * rad, L2 = 80 + 140 * P.rear;
      const p0 = pts[9], p1 = [-40 + hx * 0.25 + P.sway, hy * 0.68], p2 = [hx - Math.cos(a) * L2, hy - Math.sin(a) * L2], p3 = [hx, hy];
      for (let j = 1; j <= 7; j++) { const u = j / 7, v = 1 - u; pts.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0] + P.sway * 0.5 * Math.sin(Math.PI * u), v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); }
      for (let i = 0; i < NJ; i++) zz.push(0);
      if (P.coil > 0.001) {
        const c0 = 1, R = P.wrapR * (1 - 0.14 * P.squeeze), sq = P.squeeze;
        for (let j = c0; j < NJ; j++) {
          const q = (j - c0) / (NJ - 1 - c0), w = sm(clamp(P.coil * 1.8 - (1 - q) * 0.8)), th = Math.PI + P.turns * 2 * Math.PI * q + 0.15 * Math.sin(t * 3 + j) * sq;
          const hx2 = P.wrapX + Math.cos(th) * R, hy2 = P.wrapY - P.wrapH * Math.pow(q, 0.92) - 6 * Math.sin(t * 11 + j) * sq;
          pts[j] = [lerp(pts[j][0], hx2, w), lerp(pts[j][1], hy2, w)]; zz[j] = Math.sin(th) * w;
        }
        if (P.coilLift) for (let j = NJ - 5; j < NJ; j++) { const u = (j - (NJ - 5)) / 4; pts[j][1] -= P.coilLift * u * u * sm(clamp(P.coil * 1.8)); }   // v2: raise the head above the last coil (keeps the victim's face clear)
      }
      return { pts, zz };
    }
    function resample(p, z) {
      const out = [], oz = [];
      for (let i = 0; i < p.length - 1; i++) { const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
        for (let k = 0; k < SUB; k++) { const u = k / SUB, u2 = u * u, u3 = u2 * u, f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); oz.push(lerp(z[i], z[i + 1], u)); } }
      out.push(p[p.length - 1].slice()); oz.push(z[z.length - 1]); return { out, oz };
    }
    const setP = (e, pts) => e.setAttribute('points', pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' '));
    rig.apply = (P, t) => {
      body.set(0, 1, 1, P.shakeX, P.bodyY + P.sink * 900 + P.shakeY);
      const { pts, zz } = spine(P, t), { out, oz } = resample(pts, zz), n = out.length, layer = Math.round(P.layer);
      const tan = [], nor = [], wd = [];
      for (let k = 0; k < n; k++) { const a = out[Math.max(0, k - 1)], b = out[Math.min(n - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; tan.push([dx / L, dy / L]); nor.push([-dy / L, dx / L]);
        const s = k / (n - 1); let w = wprof(s) * P.girth; if (P.bulge >= 0) w *= 1 + P.bulgeAmp * 0.5 * Math.exp(-Math.pow((s - P.bulge) / 0.05, 2)); w *= 1 + 0.05 * P.squeeze * Math.sin(t * 10 + k * 0.7); wd.push(w); }
      const front = (k) => oz[k] > 0.05, show = (fr) => (layer === 0 ? 1 : (layer === 2 || layer === 3) ? (fr ? 1 : 0) : (fr ? 0 : 1));
      const at = (k, off) => [out[k][0] + nor[k][0] * wd[k] * 0.5 * off, out[k][1] + nor[k][1] * wd[k] * 0.5 * off];
      for (let k = 0; k < n; k++) {
        const fr = front(k) || (k < n - 1 && front(k + 1)), vis = show(fr);
        rig.Ce[k].setAttribute('cx', f2(out[k][0])); rig.Ce[k].setAttribute('cy', f2(out[k][1])); rig.Ce[k].setAttribute('rx', f2(wd[k] / 2)); rig.Ce[k].setAttribute('ry', f2(wd[k] / 2)); rig.Ce[k].setAttribute('display', vis ? 'inline' : 'none');
        if (k < n - 1) {
          setP(rig.Q[k], [at(k, 1), at(k + 1, 1), at(k + 1, -1), at(k, -1)]); rig.Q[k].setAttribute('display', vis ? 'inline' : 'none');
          const bsh = [at(k, 0.55), at(k + 1, 0.55), at(k + 1, 0.97), at(k, 0.97)]; setP(rig.Be[k], bsh); rig.Be[k].setAttribute('display', vis ? 'inline' : 'none');
          const ssh = [at(k, -0.62), at(k + 1, -0.62), at(k + 1, -0.84), at(k, -0.84)]; setP(rig.Sh[k], ssh); rig.Sh[k].setAttribute('display', vis ? 'inline' : 'none');
        }
      }
      for (let i = 0; i < NJ; i++) { const k = Math.min(n - 1, i * SUB), tg = tan[k], pa = at(k, -0.95), pb = at(k, 0.6), pm = [(pa[0] + pb[0]) / 2 + tg[0] * wd[k] * 0.22, (pa[1] + pb[1]) / 2 + tg[1] * wd[k] * 0.22]; setP(rig.rid[i], [pa, pm, pb]); rig.rid[i].setAttribute('display', show(front(k)) ? 'inline' : 'none'); rig.rid[i].setAttribute('opacity', (i % 2 ? 0.9 : 0.35 + 0.3 * Math.sin(t * 3 + i)) * 1); }
      const vp = []; for (let k = 0; k < n; k++) vp.push(at(k, -0.34 + 0.12 * Math.sin(k * 0.8 + t * 2))); setP(rig.vn, vp); setP(rig.vnG, vp);
      const vv = layer === 0 ? 1 : 0; rig.vn.setAttribute('display', vv ? 'inline' : 'none'); rig.vnG.setAttribute('display', vv ? 'inline' : 'none'); rig.vnG.setAttribute('opacity', f2(0.18 + 0.12 * Math.sin(t * 3)));
      rig.spk.forEach((s) => { const k = Math.max(1, Math.min(n - 2, s.k)), tg = tan[k], w = wd[k], base = at(k, -0.96), hh = s.h * (w / 150 + 0.25), bw = Math.max(8, w * 0.1); const vis = show(front(k)); setP(s.e, [[base[0] - tg[0] * bw, base[1] - tg[1] * bw], [base[0] + tg[0] * bw, base[1] + tg[1] * bw], [base[0] + nor[k][0] * -hh - tg[0] * hh * s.lean * 0.7, base[1] + nor[k][1] * -hh - tg[1] * hh * s.lean * 0.7]]); setP(s.e2, [[base[0] - tg[0] * bw * 0.4, base[1] - tg[1] * bw * 0.4], [base[0] + tg[0] * bw * 0.4, base[1] + tg[1] * bw * 0.4], [base[0] + nor[k][0] * -hh * 0.55 - tg[0] * hh * s.lean * 0.4, base[1] + nor[k][1] * -hh * 0.55 - tg[1] * hh * s.lean * 0.4]]); s.e.setAttribute('display', vis ? 'inline' : 'none'); s.e2.setAttribute('display', vis ? 'inline' : 'none'); s.e2.setAttribute('opacity', f2(0.35 + 0.3 * Math.sin(t * 4 + s.k))); });
      rig.gash.forEach((g) => { const k = Math.min(n - 2, g.k), tg = tan[k], a = at(k, -0.85), b = at(k, 0.55); const A2 = [a[0] + tg[0] * wd[k] * 0.28, a[1] + tg[1] * wd[k] * 0.28], B2 = [b[0] - tg[0] * wd[k] * 0.28, b[1] - tg[1] * wd[k] * 0.28]; const vis = show(front(k)) ? 'inline' : 'none'; for (const e of [g.a, g.b, g.c]) { e.setAttribute('display', vis); e.setAttribute('x1', f2(A2[0])); e.setAttribute('y1', f2(A2[1])); e.setAttribute('x2', f2(B2[0])); e.setAttribute('y2', f2(B2[1])); } g.c.setAttribute('x1', f2(A2[0] + tg[0] * 14)); g.c.setAttribute('y1', f2(A2[1] + tg[1] * 14)); g.c.setAttribute('x2', f2(B2[0] + tg[0] * 14)); g.c.setAttribute('y2', f2(B2[1] + tg[1] * 14)); g.b.setAttribute('opacity', f2(0.75 + 0.25 * P.hurt)); });
      // tail marker
      rig.mk.tail.setAttribute('cx', f2(out[0][0])); rig.mk.tail.setAttribute('cy', f2(out[0][1]));
      // head
      const hp = out[n - 1], hv = (layer === 1 || layer === 3) ? 'none' : 'inline'; hd.g.setAttribute('display', hv);
      hd.set(P.headRot, P.hs * (1 + 0.13 * P.unhinge), P.hs * (1 + 0.04 * P.unhinge), hp[0], hp[1]);
      const hdv = clamp(P.hood); hood.set(0, 0.5 + 0.5 * hdv + 0.02 * Math.sin(t * 3), 0.2 + 0.8 * hdv + 0.02 * Math.sin(t * 2.3));
      const ja = clamp(P.jaw, 0, 1.2) * 34 + clamp(P.unhinge) * 38; jaw.set(ja);
      const aa = ja * rad, hx = hinge[0], hy = hinge[1], jt = (px, py) => { const dx = px - hx, dy = py - hy; return [hx + dx * Math.cos(aa) - dy * Math.sin(aa), hy + dx * Math.sin(aa) + dy * Math.cos(aa)]; };
      const l0 = jt(24, 26), l1 = jt(298, 22); setP(rig.cav, [[30, 26], [300, 16], l1, l0]); rig.cav.setAttribute('opacity', ja > 4 ? 1 : 0);
      rig.gul.setAttribute('opacity', f2(clamp((ja - 8) / 24) * (0.5 + 0.5 * clamp(P.unhinge + P.eyeGlow * 0.3)))); rig.gul.setAttribute('cx', f2(lerp(70, 70, 0) + 0)); rig.gul.setAttribute('cy', f2(lerp(46, 46 + ja * 0.9, 0.5)));
      rig.lt.setAttribute('opacity', ja > 6 ? 1 : 0); rig.ut.setAttribute('opacity', 1);
      const tg = clamp(P.tongue), tl = 70 + tg * 230, tp = [], tq = [];
      for (let i = 0; i <= 8; i++) { const s = i / 8, x = 80 + tl * s, yy = 34 + ja * 0.45 + Math.sin(s * 8 - t * 34) * 9 * tg * s, w = 9 * (1 - 0.5 * s); tp.push([x, yy - w]); tq.push([x, yy + w]); }
      const tip = tp[8], fk = 30 * tg; setP(rig.tng, tp.concat([[tip[0] + fk, tip[1] - 14 * tg - 2], [tip[0] + fk * 0.2, tip[1] + 8], [tip[0] + fk, tip[1] + 22 * tg + 6]], tq.reverse())); rig.tng.setAttribute('opacity', tg > 0.02 ? 1 : 0);
      const bl = P.eye * (1 - blink(t, 4.9)) * (1 - 0.55 * P.hurt); eye.set(0, 1, Math.max(0.08, bl)); rig.glow.setAttribute('r', f2(76 * P.eyeGlow * (1 + 0.08 * Math.sin(t * 6)))); rig.glow.setAttribute('opacity', f2(clamp(0.45 + 0.45 * P.eyeGlow)));
      rig.spG.setAttribute('opacity', f2(clamp(P.hypno))); rig.spiral.set(t * 260 * (P.hypno > 0.02 ? 1 : 0)); rig.pupil.setAttribute('opacity', f2(1 - 0.8 * clamp(P.hypno)));
    };
    return rig;
  }
  const APEP = {
    idle: (c) => ({ waveP: c.t * 3.4, waveA: 34, rear: 0.22 + 0.04 * Math.sin(c.t * 1.3), reach: 150 + 30 * Math.sin(c.t * 0.9), headRot: 5 + 4 * Math.sin(c.t * 1.1), sway: 26 * Math.sin(c.t * 1.2), tailSwing: Math.sin(c.t * 1.7), hood: 0.3, tongue: 0.7 * Math.pow(Math.max(0, Math.sin(c.t * 2.6)), 8), jaw: 0.05 }),
    'rise-from-sand': (c) => Object.assign(KO(c.u, [[0, { sink: 1, rear: 0.1, reach: 120, headRot: 0, hood: 0, jaw: 0, eyeGlow: 0.2, waveA: 10 }], [0.35, { sink: 0.55, rear: 0.45, hood: 0.3, eyeGlow: 0.8, waveA: 24 }], [0.72, { sink: 0.08, rear: 0.97, reach: 100, headRot: -10, hood: 0.95, eyeGlow: 1.6, jaw: 0.35, waveA: 34 }], [1, { sink: 0, rear: 0.9, reach: 130, headRot: 2, hood: 1, eyeGlow: 1.3, jaw: 0.1 }]], 'inOut'), { waveP: c.t * 3, shakeX: 6 * Math.sin(c.lt * 47) * clamp(1 - c.u * 1.3) }),
    strike: (c) => Object.assign(KO(c.u, [[0, { rear: 0.95, reach: 110, headRot: -8, hood: 1, jaw: 0.1, tongue: 0.4 }], [0.28, { rear: 1, reach: 30, headRot: -24, hood: 1, jaw: 0.2, tongue: 0.9, eyeGlow: 1.6 }], [0.44, { rear: c.p.rear2 === undefined ? 0.36 : c.p.rear2, reach: c.p.reach || 760, headRot: 16, hood: 0.7, jaw: 1, tongue: 0, eyeGlow: 1.6 }], [0.7, { jaw: 0.9 }], [1, { rear: 0.82, reach: 140, headRot: 0, hood: 0.8, jaw: 0.15, eyeGlow: 1.2 }]], 'inOut'), { waveP: c.t * 3, shakeX: 7 * Math.sin(c.lt * 60) * (c.u > 0.4 && c.u < 0.55 ? 1 : 0) }),
    'coil-squeeze': (c0) => { const c = Object.assign({}, c0, { lt: c0.lt + (c0.p.age || 0) }), e = EASE.outCubic(clamp(c.lt / 0.55)), p = c.p; return { coil: e, coilLift: p.coilLift || 0, wrapX: p.wrapX === undefined ? 520 : p.wrapX, wrapY: p.wrapY || 0, wrapR: p.wrapR || 170, wrapH: p.wrapH || 900, turns: p.turns || 2.75, squeeze: clamp((c.lt - 0.4) / 0.4) * (0.55 + 0.45 * Math.sin(c.lt * 9)), layer: p.layer || 0, headRot: p.headRot === undefined ? 14 : p.headRot, hood: 1, jaw: p.jaw === undefined ? 0.35 + 0.1 * Math.sin(c.lt * 7) : p.jaw, tongue: 0.6 * Math.pow(Math.max(0, Math.sin(c.lt * 6)), 4), eyeGlow: 1.7, hypno: p.hypno || 0, waveP: c.t * 2, shakeX: 1.5 * Math.sin(c.lt * 40) * e }; },
    'hypno-gaze': (c) => { const e = env(c.lt, 0.4); return { rear: 0.82, reach: 130 + 14 * Math.sin(c.t * 1.4), headRot: 8 * e, hs: 1 + 0.05 * e, hood: 1, hypno: e, eyeGlow: 1 + 0.9 * e, jaw: 0.05, sway: 30 * Math.sin(c.t * 1.1), tongue: 0.3 * Math.pow(Math.max(0, Math.sin(c.t * 3)), 6), waveP: c.t * 2.2, waveA: 30 }; },
    roar: (c) => { const e = env(c.lt, 0.25), tr = Math.sin(c.lt * 55) * e; return { rear: 0.96, reach: 70 * (1 - e) + 90, headRot: -30 * e + 2 * tr, jaw: 1.0 + 0.08 * tr, hood: 1, eyeGlow: 1.7, shakeX: 5 * tr, shakeY: 2.5 * Math.sin(c.lt * 71) * e, hs: 1 + 0.06 * e, tongue: 0.25, waveP: c.t * 3, waveA: 40 }; },
    swallow: (c) => Object.assign(KO(c.u, [[0, { rear: 0.95, reach: 90, headRot: -14, hood: 1, jaw: 0.3, unhinge: 0, eyeGlow: 1.5 }], [0.3, { rear: 1, reach: 20, headRot: -28, jaw: 0.8, unhinge: 0.5 }], [0.5, { rear: 0.38, reach: c.p.reach || 620, headRot: 28, jaw: 1.1, unhinge: 1, hood: 0.8, eyeGlow: 1.8 }], [0.68, { jaw: 0.5, unhinge: 0.6, rear: 0.5, reach: 400, headRot: 10 }], [0.85, { jaw: 0.08, unhinge: 0, rear: 0.78, reach: 160, headRot: -6, hood: 0.7 }], [1, { rear: 0.85, reach: 140, headRot: 0 }]], 'inOut'), { bulge: clamp((c.u - 0.62) / 0.3), bulgeAmp: c.u > 0.62 && c.u < 0.96 ? 0.9 : 0, waveP: c.t * 3, shakeX: 5 * Math.sin(c.lt * 55) * (c.u > 0.42 && c.u < 0.56 ? 1 : 0) }),
    recoil: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.16)) * (1 - 0.45 * EASE.smooth(clamp((c.lt - 0.2) / 0.6))); return { rear: 0.9, reach: 140 - 120 * e, headRot: -32 * e, jaw: 0.8 * e, hood: 1, eye: 1, hurt: e, eyeGlow: 1.2 - 0.6 * e, shakeX: 6 * Math.sin(c.lt * 60) * (1 - EASE.smooth(clamp(c.lt / 0.6))), waveP: c.t * 3, tailUp: 0.4 * e }; },
    hurt: (c) => { const f = Math.sin(c.lt * 28) * Math.exp(-c.lt * 2.4); return { rear: 0.7 + 0.1 * f, reach: 100, headRot: -12 + 8 * f, jaw: 0.5 + 0.2 * f, hood: 0.9, hurt: 1, eyeGlow: 0.9, shakeX: 5 * f, waveP: c.t * 6, waveA: 40, tailUp: 0.25, tongue: 0.3 }; },
    sink: (c) => Object.assign(KO(c.u, [[0, { rear: 0.85, reach: 140, headRot: 0, hood: 0.7, eyeGlow: 1.2 }], [0.35, { rear: 0.45, reach: 200, headRot: 22, hood: 0.3, eyeGlow: 0.7, jaw: 0.1 }], [0.75, { sink: 0.5, rear: 0.2, headRot: 10, eyeGlow: 0.4 }], [1, { sink: 1, rear: 0.1, headRot: 0, eyeGlow: 0.2 }]], 'inOut'), { waveP: c.t * 2.4, waveA: 28 }),
    talk: (c) => { const a = c.amp || 0; return { rear: 0.55 + 0.02 * Math.sin(c.t * 1.4), reach: 150, headRot: 4 + 3 * Math.sin(c.t * 1.2), jaw: 0.05 + 0.65 * a, hood: 0.6 + 0.2 * a, tongue: 0.35 * Math.pow(Math.max(0, Math.sin(c.t * 5)), 6) + 0.15 * a, eyeGlow: 1.15, hypno: c.p.hypno || 0, sway: 22 * Math.sin(c.t * 1.1), waveP: c.t * 2.6, waveA: 30, hs: 1.04 }; },
  };
  APEP['idle-card'] = (c) => ({ tlen: 400, rear: 0.97 + 0.02 * Math.sin(c.t * 1.3), reach: 90 + 10 * Math.sin(c.t * 0.9), headRot: 6 + 3 * Math.sin(c.t * 1.1), hood: 0.95, waveA: 22, waveP: c.t * 2.4, sway: 14 * Math.sin(c.t * 1.2), jaw: 0.08, tongue: 0.8 * Math.pow(Math.max(0, Math.sin(c.t * 2.2)), 6), eyeGlow: 1.3, tailSwing: 0.4 * Math.sin(c.t * 1.5) });
  APEP.fade = APEP.idle;

  // =============================================================== THOR (Eddic thunder god, ep #003 guardian, screen-RIGHT: flip -1 to face left)
  // Local origin = feet, +x = facing. Red hair + big red beard, short-handled Mjolnir, Megingjord belt (glowing runes), iron gloves (Jarngreipr),
  // Viking-age tunic + grey fur mantle + slate-blue cloak. NOT Marvel (no red cape, no winged helmet, no armour plates).
  // Arm angles: degrees from straight down, + = forward/up (180 = straight up). The hammer continues along the forearm (head at the far end).
  function buildThor() {
    const rig = newRig(); const root = $('g'); const lift = $('g', {}, root);
    const TUN = rgb(64, 86, 134), TUND = rgb(40, 54, 88), TUNL = rgb(106, 132, 184), WOOL = rgb(96, 88, 78), WOOLD = rgb(66, 60, 54), LEA = rgb(108, 72, 46), LEAD = rgb(66, 43, 28), FURC = rgb(170, 154, 134), FURD = rgb(112, 100, 88);
    const SKIN = rgb(234, 186, 150), SKIND = rgb(198, 144, 112), HAIR = rgb(206, 64, 28), HAIRD = rgb(146, 38, 16), HAIRL = rgb(246, 124, 56), STEEL = rgb(142, 152, 170), STEELD = rgb(76, 84, 102), STEELL = rgb(208, 220, 236), GOLD = rgb(255, 208, 96), CLK = rgb(46, 60, 98), CLKL = rgb(88, 68, 56);
    rig.skin = [];
    const skin = (el, base) => { rig.skin.push([el, base]); return el; };
    const body = joint(lift, 0, -215); rig.body = body; const B = body.c;
    rig.cloak = $('path', { fill: CLK }, B); G.reg(rig.cloak, CLK); rig.cloak2 = $('path', { fill: CLKL }, B); G.reg(rig.cloak2, CLKL);
    const leg = (hx, wool, boot) => { const th = joint(B, hx, -215); limb(th.c, [hx, -215], [hx, -112], 58, 48, wool); const sh = joint(th.c, hx, -112); limb(sh.c, [hx, -112], [hx, -36], 46, 40, wool);
      for (let k = 0; k < 3; k++) poly(sh.c, [[hx - 21, -102 + k * 17], [hx + 21, -102 + k * 17], [hx + 21, -96 + k * 17], [hx - 21, -96 + k * 17]], LEAD);
      poly(sh.c, [[hx - 22, -72], [hx + 22, -72], [hx + 24, -32], [hx + 64, -12], [hx + 64, 2], [hx - 24, 2]], boot); ell(sh.c, hx, -72, 28, 12, FURC); ell(sh.c, hx, -66, 26, 8, FURD);
      return { th, sh }; };
    rig.lB = leg(-26, WOOLD, LEAD); rig.lF = leg(26, WOOL, LEA);
    // ---- arms
    const arm = (sx, sy, parent, front, withHammer) => {
      const up = joint(parent, sx, sy); limb(up.c, [sx, sy], [sx, sy + 108], 52, 44, front ? TUN : TUND); poly(up.c, [[sx - 22, sy + 94], [sx + 22, sy + 94], [sx + 21, sy + 108], [sx - 21, sy + 108]], LEAD);
      const fo = joint(up.c, sx, sy + 108); const n0 = rig.fills.length; limb(fo.c, [sx, sy + 108], [sx, sy + 200], 40, 34, front ? SKIN : SKIND); rig.fills.slice(n0).forEach(([el, cc]) => skin(el, cc));
      poly(fo.c, [[sx - 22, sy + 132], [sx + 22, sy + 132], [sx + 24, sy + 204], [sx - 24, sy + 204]], front ? STEEL : STEELD); poly(fo.c, [[sx - 22, sy + 132], [sx - 8, sy + 132], [sx - 8, sy + 204], [sx - 24, sy + 204]], STEELL, { opacity: 0.5 });
      for (const dy of [140, 170]) poly(fo.c, [[sx - 24, sy + dy], [sx + 24, sy + dy], [sx + 24, sy + dy + 5], [sx - 24, sy + dy + 5]], STEELD); ell(fo.c, sx, sy + 156, 5, 5, GOLD);
      ell(fo.c, sx, sy + 214, 24, 27, front ? STEEL : STEELD); poly(fo.c, [[sx - 20, sy + 204], [sx + 20, sy + 204], [sx + 22, sy + 212], [sx - 22, sy + 212]], STEELD); for (const dx of [-12, 0, 12]) ell(fo.c, sx + dx, sy + 226, 6, 7, STEELL, { opacity: 0.8 });
      return { up, fo, sx, sy };
    };
    rig.aL = arm(-72, -425, B, false);
    // ---- torso
    poly(B, [[-88, -440], [88, -440], [96, -400], [66, -250], [80, -160], [-80, -160], [-66, -250], [-96, -400]], TUN);
    poly(B, [[-88, -440], [-20, -440], [-34, -250], [-66, -250], [-96, -400]], TUND, { opacity: 0.5 });
    poly(B, [[-80, -184], [80, -184], [82, -160], [-82, -160]], LEAD); for (let x = -64; x <= 64; x += 32) ell(B, x, -172, 5, 5, GOLD);
    poly(B, [[56, -440], [80, -420], [-34, -246], [-62, -262]], LEA); ell(B, 54, -418, 7, 7, GOLD);
    poly(B, [[-30, -440], [30, -440], [0, -378]], SKIND);
    // belt (Megingjord)
    rig.beltG = $('ellipse', { cx: 0, cy: -272, rx: 130, ry: 56, fill: 'url(#gGold)', opacity: 0.2 }, B);
    poly(B, [[-72, -296], [72, -296], [76, -248], [-76, -248]], LEA); poly(B, [[-72, -296], [72, -296], [72, -286], [-72, -286]], rgb(140, 98, 62));
    poly(B, [[-28, -302], [28, -302], [30, -244], [-30, -244]], STEELD); poly(B, [[-22, -296], [22, -296], [22, -250], [-22, -250]], STEEL); ell(B, 0, -273, 10, 10, STEELL);
    rig.runes = $('path', { d: 'M-64 -282 l8 -10 l8 10 M-62 -262 l6 0 l0 12 M-46 -280 l10 24 M-40 -280 l-10 24 M44 -282 l8 -10 l8 10 M46 -262 l6 0 l0 12 M62 -280 l-10 24 M56 -280 l10 24', stroke: GOLD, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, B);
    rig.runesW = $('path', { d: 'M-14 -290 l14 -8 l14 8 l-14 38 z', stroke: GOLD, 'stroke-width': 3.5, fill: 'none', 'stroke-linejoin': 'round' }, B);
    rig.aR = arm(70, -425, B, true);
    // hammer: pivot at the front hand, head at the far end of the forearm direction
    const hx = rig.aR.sx, hy = rig.aR.sy + 214, hmJ = joint(rig.aR.fo.c, hx, hy); rig.hmJ = hmJ; rig.hm = hmJ.g; const Hm = hmJ.c;
    poly(Hm, [[hx - 9, hy - 40], [hx + 9, hy - 40], [hx + 9, hy + 118], [hx - 9, hy + 118]], LEA); for (let k = 0; k < 5; k++) poly(Hm, [[hx - 10, hy - 30 + k * 16], [hx + 10, hy - 30 + k * 16], [hx + 10, hy - 25 + k * 16], [hx - 10, hy - 25 + k * 16]], LEAD);
    ell(Hm, hx, hy - 42, 14, 10, GOLD); $('path', { d: `M${hx} ${hy - 48} q-34 -26 -12 -58 q22 -24 30 6`, stroke: LEAD, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, Hm);
    const hcx = hx, hcy = hy + 158; rig.hcx = hcx; rig.hcy = hcy;
    rig.hglow = $('circle', { cx: hcx, cy: hcy, r: 130, fill: 'url(#gBlue)', opacity: 0 }, Hm);
    poly(Hm, [[hcx - 78, hcy - 50], [hcx + 78, hcy - 50], [hcx + 88, hcy - 36], [hcx + 88, hcy + 36], [hcx + 78, hcy + 50], [hcx - 78, hcy + 50], [hcx - 88, hcy + 36], [hcx - 88, hcy - 36]], STEEL);
    poly(Hm, [[hcx - 78, hcy - 50], [hcx + 78, hcy - 50], [hcx + 66, hcy - 34], [hcx - 66, hcy - 34]], STEELL); poly(Hm, [[hcx + 66, hcy - 34], [hcx + 78, hcy - 50], [hcx + 88, hcy - 36], [hcx + 88, hcy + 36], [hcx + 78, hcy + 50], [hcx + 66, hcy + 34]], STEELD);
    poly(Hm, [[hcx - 88, hcy - 36], [hcx - 78, hcy - 50], [hcx - 66, hcy - 34], [hcx - 66, hcy + 34], [hcx - 78, hcy + 50], [hcx - 88, hcy + 36]], rgb(110, 120, 140));
    poly(Hm, [[hx - 14, hcy - 54], [hx + 14, hcy - 54], [hx + 14, hcy - 44], [hx - 14, hcy - 44]], GOLD);
    rig.hrune = $('path', { d: `M${hcx - 52} ${hcy - 14} l16 -14 l16 14 l-16 14 z M${hcx} ${hcy - 20} l0 40 M${hcx + 20} ${hcy - 18} l16 36 M${hcx + 52} ${hcy - 18} l-16 36`, stroke: '#bfe6ff', 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.35 }, Hm);
    rig.crkH = [0, 1, 2].map(() => $('polyline', { fill: 'none', stroke: '#e4f6ff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, Hm));
    // ---- mantle (grey fur) + neck
    skin(poly(B, [[-26, -472], [26, -472], [30, -440], [-30, -440]], SKIND), SKIND);
    const mant = [[-104, -412], [-98, -440], [-82, -434], [-76, -458], [-58, -450], [-44, -470], [-26, -454], [0, -472], [26, -454], [44, -470], [58, -450], [76, -458], [82, -434], [98, -440], [104, -412], [116, -380], [92, -372], [98, -348], [72, -352], [62, -328], [32, -352], [0, -334], [-32, -352], [-62, -328], [-72, -352], [-98, -348], [-92, -372], [-116, -380]];
    poly(B, mant, FURD); poly(B, mant.map((q) => [q[0] * 0.93, -400 + (q[1] + 400) * 0.9 - 4]), FURC);
    for (let i = 0; i < 9; i++) poly(B, [[-80 + i * 20, -420], [-72 + i * 20, -392], [-66 + i * 20, -420]], FURD, { opacity: 0.55 });
    // ---- head
    const hd = joint(B, 0, -450); rig.head = hd; const Hc = hd.c;
    const hairB = joint(Hc, 0, -545); rig.hairB = hairB;
    poly(hairB.c, [[-62, -572], [54, -578], [74, -540], [82, -470], [94, -420], [72, -392], [44, -440], [-46, -440], [-78, -392], [-92, -428], [-82, -500]], HAIRD);
    poly(hairB.c, [[-70, -470], [-60, -420], [-84, -400], [-88, -440]], HAIR); poly(hairB.c, [[78, -470], [70, -418], [92, -398], [92, -440]], HAIR);
    skin(ell(Hc, -46, -510, 9, 14, SKIND), SKIND);
    skin(ell(Hc, 6, -512, 50, 60, SKIN), SKIN); skin(ell(Hc, 22, -496, 22, 40, SKIN, { opacity: 0.0 }), SKIN);
    skin(poly(Hc, [[-2, -520], [18, -520], [26, -496], [4, -494]], SKIND), SKIND);
    rig.venomV = $('g', { opacity: 0 }, Hc); for (const d of ['M-30 -540 q8 14 -2 30 q-6 10 4 22', 'M40 -534 q-10 16 2 30 q8 12 -4 26', 'M-4 -560 q4 14 -4 24']) $('path', { d, stroke: '#7fd04a', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, rig.venomV);
    const beard = joint(Hc, 6, -476); rig.beard = beard;
    poly(beard.c, [[-48, -504], [58, -504], [66, -464], [56, -424], [34, -384], [8, -352], [-16, -384], [-42, -424], [-58, -464]], HAIR);
    poly(beard.c, [[-30, -470], [-18, -470], [-14, -380], [-28, -392]], HAIRL, { opacity: 0.8 }); poly(beard.c, [[20, -470], [32, -470], [30, -392], [18, -380]], HAIRL, { opacity: 0.8 }); poly(beard.c, [[-6, -440], [6, -440], [8, -358], [-4, -362]], HAIRD);
    for (const bx of [-18, 26]) { poly(beard.c, [[bx - 7, -378], [bx + 7, -378], [bx + 4, -318], [bx - 3, -318]], HAIRD); ell(beard.c, bx, -366, 8, 5, GOLD); ell(beard.c, bx, -322, 6, 8, HAIR); }
    rig.mouth = ell(Hc, 8, -476, 16, 4, rgb(54, 18, 18)); rig.teeth = poly(Hc, [[-6, -480], [22, -480], [22, -474], [-6, -474]], rgb(246, 240, 226));
    rig.mou = joint(Hc, 8, -482);
    poly(rig.mou.c, [[-44, -494], [8, -500], [60, -494], [72, -482], [40, -476], [8, -484], [-22, -476], [-56, -482]], HAIR); poly(rig.mou.c, [[-40, -490], [8, -495], [56, -490], [40, -484], [8, -490], [-24, -484]], HAIRL, { opacity: 0.55 });
    // eyes
    rig.eyes = []; const mkEye = (cx, cy) => { const gl = $('circle', { cx, cy, r: 24, fill: 'url(#gBlue)', opacity: 0.5 }, Hc); const e = joint(Hc, cx, cy); const w = ell(e.c, cx, cy, 11, 9, rgb(240, 250, 255)); const ir = ell(e.c, cx + 2, cy, 6.5, 7.5, rgb(150, 218, 255)); G.reg(ir, rgb(150, 218, 255)); ell(e.c, cx + 3, cy, 3, 4, rgb(16, 20, 40)); ell(e.c, cx - 1, cy - 3, 2, 2, '#fff'); rig.eyes.push({ gl, e, ir }); };
    mkEye(-14, -520); mkEye(30, -520);
    rig.browL = joint(Hc, -18, -528); poly(rig.browL.c, [[-40, -542], [-2, -524], [-2, -513], [-40, -530]], HAIRD); rig.browR = joint(Hc, 34, -528); poly(rig.browR.c, [[48, -542], [10, -524], [10, -513], [48, -530]], HAIRD);
    // front hair + leather band (no winged helmet)
    poly(Hc, [[-60, -556], [-42, -594], [-22, -566], [0, -604], [18, -568], [42, -598], [54, -562], [64, -540], [46, -538], [26, -554], [6, -542], [-14, -554], [-34, -540], [-52, -536]], HAIR);
    poly(Hc, [[-56, -548], [58, -552], [60, -540], [-56, -536]], LEA); ell(Hc, 4, -544, 6, 6, GOLD);
    poly(Hc, [[-8, -588], [10, -594], [22, -566], [4, -566]], HAIRL, { opacity: 0.7 });
    // lightning arcs around the body
    rig.crkB = [0, 1, 2, 3].map(() => $('polyline', { fill: 'none', stroke: '#e4f6ff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, B));
    rig.mk = {}; const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 6, -512); mk('eye', Hc, 8, -520); mk('mouth', Hc, 8, -476); mk('hand', rig.aR.fo.c, hx, hy); mk('hammer', Hm, hcx, hcy); mk('body', B, 0, -300);
    rig.root = root;
    rig.N = { bodyY: 0, bodyRot: 0, shakeX: 0, shakeY: 0, sx: 1, sy: 1, head: 0, aL: [-14, -8], aR: [18, 22], lF: [4, 2], lB: [-4, -2], hammer: 1, hAng: -18, hglow: 0, crackle: 0, eye: 1, eyeGlow: 1, belt: 0.35, mouth: 0, brow: 0, beard: 0, hair: 0, cloak: 1, trail: 0, lift: 0, venom: 0 };
    const FRn = (t) => Math.floor(t * 30);
    const zig = (x0, y0, x1, y1, n, amp, sd) => { const pts = []; for (let i = 0; i <= n; i++) { const s = i / n, nx = -(y1 - y0), ny = (x1 - x0), L = Math.hypot(nx, ny) || 1, o = (i === 0 || i === n ? 0 : (hash(sd + i * 7.3) - 0.5) * 2 * amp); pts.push([x0 + (x1 - x0) * s + nx / L * o, y0 + (y1 - y0) * s + ny / L * o]); } return pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' '); };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY);
      for (const [L, a] of [[rig.lF, P.lF], [rig.lB, P.lB]]) { L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      for (const [A, a] of [[rig.aL, P.aL], [rig.aR, P.aR]]) { A.up.set(-a[0]); A.fo.set(-(a[1] - a[0])); }
      rig.hmJ.set(P.hAng); rig.hm.setAttribute('display', P.hammer > 0.02 ? 'inline' : 'none'); rig.hm.setAttribute('opacity', f2(clamp(P.hammer)));
      const hg = clamp(P.hglow + P.crackle * 0.5); rig.hglow.setAttribute('opacity', f2(hg * (0.75 + 0.25 * Math.sin(t * 40)))); rig.hrune.setAttribute('opacity', f2(0.3 + 0.7 * clamp(P.hglow + P.crackle)));
      hd.set(P.head + 0.6 * Math.sin(t * 1.3), 1.14, 1.14);
      beard.set(P.beard + 2.2 * Math.sin(t * 1.7), 1, 1 + 0.03 * P.mouth, 0, 0); rig.hairB.set(P.hair + 1.6 * Math.sin(t * 1.4 + 1));
      const mo = clamp(P.mouth, 0, 1.2); rig.mouth.setAttribute('ry', f2(3 + mo * 15)); rig.mouth.setAttribute('cy', f2(-476 + mo * 6)); rig.teeth.setAttribute('opacity', mo > 0.25 ? 1 : 0); rig.mou.set(0, 1, 1, 0, -mo * 1.5);
      const bl = P.eye * (1 - blink(t, 3.7)); rig.eyes.forEach((E, i) => { E.e.set(0, 1, Math.max(0.08, bl)); E.gl.setAttribute('r', f2(24 * P.eyeGlow)); E.gl.setAttribute('opacity', f2(clamp(0.1 + 0.35 * P.eyeGlow))); E.ir.setAttribute('fill', G.mixc(rgb(150, 218, 255), rgb(150, 190, 90), clamp(P.venom))); });
      rig.browL.set(P.brow * 5, 1, 1, 0, P.brow * 5); rig.browR.set(-P.brow * 5, 1, 1, 0, P.brow * 5);
      const bg = clamp(P.belt, 0, 2.2); rig.beltG.setAttribute('opacity', f2(clamp(bg * 0.45) * (0.8 + 0.2 * Math.sin(t * 9)))); rig.runes.setAttribute('stroke', G.mixc(rgb(255, 196, 80), '#ffffff', clamp(bg - 1) * 0.8)); rig.runes.setAttribute('opacity', f2(0.35 + 0.65 * clamp(bg))); rig.runes.setAttribute('stroke-width', f2(4 + 1.5 * clamp(bg - 1, 0, 1))); rig.runesW.setAttribute('opacity', f2(0.3 + 0.7 * clamp(bg)));
      // cloak
      const tr = P.trail, fl = P.cloak * 7, f = (i) => fl * Math.sin(t * 3.1 + i * 1.7) - P.lift * (1 + i * 0.5) * 20;
      const cp = [[-24, -440], [-96, -432], [-122 - 0.3 * tr, -300], [-148 - tr, -136 + f(0)], [-122 - 0.8 * tr, -104 + f(1)], [-88 - 0.6 * tr, -128 + f(2)], [-56 - 0.4 * tr, -98 + f(3)], [-20, -132 + f(4) * 0.4], [-8, -300]];
      rig.cloak.setAttribute('d', 'M' + cp.map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z');
      rig.cloak2.setAttribute('d', 'M' + [cp[1], cp[2], cp[3], cp[4], [cp[4][0] + 22, cp[4][1] - 30], [cp[2][0] + 22, cp[2][1]]].map((q) => f2(q[0]) + ' ' + f2(q[1])).join('L') + 'Z');
      // crackle
      const fr = FRn(t), cr = clamp(P.crackle);
      rig.crkH.forEach((e, i) => { const a = hash(fr * 3 + i) * 6.283, a2 = a + 0.9 + hash(fr + i * 5), r0 = 52, r1 = 118 + 40 * hash(fr * 2 + i); e.setAttribute('points', zig(rig.hcx + Math.cos(a) * r0, rig.hcy + Math.sin(a) * r0 * 0.7, rig.hcx + Math.cos(a2) * r1, rig.hcy + Math.sin(a2) * r1 * 0.8, 6, 16, fr * 11 + i)); e.setAttribute('opacity', f2(cr > 0.02 && hash(fr + i * 9) > 0.15 ? cr : 0)); });
      rig.crkB.forEach((e, i) => { const sx0 = [-70, 70, -30, 40][i] + (hash(fr * 4 + i) - 0.5) * 60, sy0 = [-430, -430, -300, -200][i], ex = sx0 + (hash(fr * 5 + i + 3) - 0.5) * 220, ey = sy0 + (hash(fr * 7 + i + 1) - 0.5) * 200 - 40; e.setAttribute('points', zig(sx0, sy0, ex, ey, 5, 14, fr * 13 + i)); e.setAttribute('opacity', f2(cr > 0.3 && hash(fr + i * 17) > 0.35 ? clamp(cr) : 0)); });
      // venom: sickly skin + green veins
      const v = clamp(P.venom); rig.skin.forEach(([el, base]) => el.setAttribute('fill', v > 0 ? G.mixc(base, rgb(150, 178, 110), v * 0.65) : base)); rig.venomV.setAttribute('opacity', f2(v));
    };
    return rig;
  }
  const THOR = {
    idle: (c) => ({ bodyY: 2 * Math.sin(c.t * 2.1), sy: 1 + 0.008 * Math.sin(c.t * 2.1), head: 2 * Math.sin(c.t * 1.2), aL: [-12 + 3 * Math.sin(c.t * 1.5), -6], aR: [20 + 3 * Math.sin(c.t * 1.3), 26 + 4 * Math.sin(c.t * 1.7)], hAng: -18, belt: 0.35, cloak: 1, beard: 3 * Math.sin(c.t * 1.1), crackle: 0.08 * Math.max(0, Math.sin(c.t * 0.8)), lF: [6, 3], lB: [-6, -3] }),
    'land-hero': (c) => KO(c.u, [[0, { bodyY: -20, aL: [150, 160], aR: [165, 175], lF: [-10, -30], lB: [-24, -50], cloak: 3, lift: 1.4, trail: -30, hAng: -10, eyeGlow: 1.8, mouth: 0.6, head: -8, crackle: 0.5 }],
      [0.4, { bodyY: -10, aL: [140, 150], aR: [155, 165], lF: [0, -10], lB: [-10, -30], lift: 1.4 }],
      [0.5, { bodyY: 98, bodyRot: 10, head: 18, aL: [30, 60], aR: [50, 70], lF: [74, 6], lB: [-8, -86], cloak: 2, lift: 0.1, trail: 40, mouth: 0.2, crackle: 1, hglow: 1, shakeY: 6 }],
      [0.7, { bodyY: 92, bodyRot: 8, head: 8, crackle: 0.6, shakeY: 0 }],
      [1, { bodyY: 2, bodyRot: 0, head: 0, aL: [-14, -8], aR: [22, 26], lF: [6, 3], lB: [-6, -3], cloak: 1, lift: 0, trail: 0, mouth: 0, crackle: 0.2, hglow: 0.3, eyeGlow: 1.2, hAng: -18 }]], 'inOut'),
    walk: (c) => { const sp = c.p.speed || 1.0, f = 2 * Math.PI * sp * c.lt; return { bodyY: 3 * Math.abs(Math.sin(f)), bodyRot: 2, head: 2 * Math.sin(f), lF: legPh(f, 2, 24, 24), lB: legPh(f + Math.PI, 2, 24, 24), aL: [-22 * Math.sin(f) - 6, -16 * Math.sin(f)], aR: [18 + 10 * Math.sin(f), 22 + 10 * Math.sin(f)], trail: 20, cloak: 1.4, beard: 5 * Math.sin(f) }; },
    run: (c) => { const sp = c.p.speed || 2.2, f = 2 * Math.PI * sp * c.lt; return { bodyY: 6 * Math.abs(Math.sin(f)) - 8, bodyRot: 10, head: 4 - 4 * Math.sin(f), lF: legPh(f, 6, 52, 58), lB: legPh(f + Math.PI, 6, 52, 58), aL: [-50 * Math.sin(f), -80 * Math.sin(f) - 20], aR: [32 + 16 * Math.sin(f), 52 + 14 * Math.sin(f)], hAng: -50, trail: 90, cloak: 2.4, beard: 12, hair: 10, eyeGlow: 1.4, mouth: 0.25, brow: 1 }; },
    'throw-hammer': (c) => KO(c.u, [[0, { bodyRot: 0, aL: [-14, -8], aR: [30, 34], lF: [6, 3], lB: [-6, -3], hammer: 1, hAng: -18, brow: 1, eyeGlow: 1.4 }],
      [0.28, { bodyRot: -12, head: -6, aL: [60, 80], aR: [196, 222], lF: [14, 6], lB: [-20, -26], hAng: -4, crackle: 1, hglow: 1, brow: 1, mouth: 0.4, eyeGlow: 1.8, cloak: 2, trail: -20 }],
      [0.5, { bodyRot: 14, head: 6, aL: [-40, -30], aR: [96, 90], lF: [30, 16], lB: [-24, -30], hAng: 0, hammer: 1, mouth: 0.8, trail: 60 }],
      [0.56, { hammer: 0, crackle: 0.5 }],
      [0.8, { bodyRot: 10, aR: [92, 88], hammer: 0, crackle: 0, hglow: 0 }],
      [1, { bodyRot: 4, aL: [-14, -8], aR: [70, 62], hammer: 0, lF: [14, 8], lB: [-12, -8], mouth: 0.1, trail: 0 }]], 'inOut'),
    'catch-hammer': (c) => KO(c.u, [[0, { bodyRot: 4, aR: [96, 90], aL: [-20, -14], hammer: 0, lF: [14, 8], lB: [-12, -8], eyeGlow: 1.2 }],
      [0.22, { aR: [100, 94], hammer: 0 }], [0.28, { hammer: 1, hglow: 1, crackle: 1, bodyRot: -6, aR: [66, 60], shakeX: 6, eyeGlow: 1.8 }],
      [0.5, { aR: [40, 40], bodyRot: -2, shakeX: 0, crackle: 0.6, hglow: 0.6, mouth: 0.3 }], [1, { aR: [22, 26], bodyRot: 0, lF: [6, 3], lB: [-6, -3], crackle: 0.2, hglow: 0.2, aL: [-12, -6], hAng: -18, mouth: 0 }]], 'inOut'),
    swing: (c) => KO(c.u, [[0, { bodyRot: 0, aR: [22, 26], aL: [-14, -8], lF: [6, 3], lB: [-6, -3] }], [0.32, { bodyRot: -14, head: -8, aR: [176, 198], aL: [150, 170], lF: [10, 4], lB: [-16, -20], hAng: -4, crackle: 0.8, hglow: 1, brow: 1, mouth: 0.5, cloak: 2, trail: -20, eyeGlow: 1.8 }],
      [0.5, { bodyRot: 16, head: 8, aR: [74, 62], aL: [60, 80], lF: [34, 20], lB: [-24, -30], hAng: 0, crackle: 1, mouth: 0.9, trail: 80, shakeX: 4 }], [0.66, { bodyRot: 12, aR: [70, 58], shakeX: 0 }], [1, { bodyRot: 4, aR: [40, 40], aL: [-14, -8], lF: [10, 6], lB: [-8, -6], crackle: 0.3, mouth: 0.1, hAng: -18, trail: 0 }]], 'inOut'),
    'lightning-call': (c) => { const e = env(c.lt, 0.35); return { bodyRot: -5 * e, head: -22 * e + 2 * Math.sin(c.t * 1.3), aR: [lerp(22, 172, e), lerp(26, 178, e)], aL: [lerp(-14, 40, e), lerp(-8, 60, e)], lF: [6 + 14 * e, 3 + 10 * e], lB: [-6 - 14 * e, -3 - 14 * e], hAng: -2, hglow: e, crackle: e, eyeGlow: 1 + 1.0 * e, belt: 0.4 + 0.9 * e, mouth: 0.5 * e, brow: e, cloak: 2.2 * e + 1, trail: 20 * e, lift: 0.6 * e, hair: 8 * e, beard: 8 * e, shakeX: 1.2 * e * Math.sin(c.lt * 50) }; },
    'belt-power': (c) => { const e = env(c.lt, 0.25), p = 0.5 + 0.5 * Math.sin(c.lt * 14); return { bodyRot: -2 * e, bodyY: -4 * e, sx: 1 + 0.05 * e + 0.015 * p * e, sy: 1 + 0.05 * e + 0.015 * p * e, head: -8 * e, aR: [lerp(22, 24, e), lerp(26, 70 , e)], aL: [lerp(-14, -26, e), lerp(-8, 56, e)], lF: [6 + 16 * e, 3 + 14 * e], lB: [-6 - 16 * e, -3 - 14 * e], hAng: -6, belt: 0.4 + 1.8 * e, crackle: 0.9 * e, hglow: 0.8 * e, eyeGlow: 1 + 1.1 * e, mouth: 0.55 * e, brow: e, cloak: 2.4 * e + 1, trail: 30 * e, hair: 9 * e, beard: 9 * e, shakeX: 2 * e * Math.sin(c.lt * 45) }; },
    block: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.14)), w = Math.sin(c.lt * 40) * (1 - 0.6 * clamp(c.lt / c.dur)); return { bodyRot: -8 * e, bodyY: 10 * e, head: 6 * e, aR: [100 * e + 22 * (1 - e), 120 * e + 26 * (1 - e)], aL: [70 * e - 14 * (1 - e), 110 * e - 8 * (1 - e)], hAng: -80 * e - 18 * (1 - e), lF: [20 * e + 6, 14 * e + 3], lB: [-24 * e - 6, -20 * e - 3], crackle: 0.9 * e, hglow: 0.8 * e, brow: e, mouth: 0.5 * e, eyeGlow: 1.6, shakeX: 2.5 * w * e, trail: -20 * e }; },
    strangled: (c) => { const tr = Math.sin(c.lt * 31), e = env(c.lt, 0.3); return { bodyRot: -3 * e, bodyY: 6 * e, head: -20 * e + 3 * tr, aR: [lerp(22, 140, e) + 4 * tr, lerp(26, 150, e) + 4 * tr], aL: [lerp(-14, -90, e) - 4 * tr, lerp(-8, -100, e) - 4 * tr], hAng: -4, mouth: 0.7 * e, eye: 1 - 0.45 * e, eyeGlow: 1.0 + 0.4 * Math.sin(c.lt * 9), brow: e, belt: 0.5 + 0.7 * (0.5 + 0.5 * Math.sin(c.lt * 7)), crackle: 0.4 * e * (0.5 + 0.5 * Math.sin(c.lt * 5)), venom: 0.15 * e, shakeX: 2.5 * tr * e, shakeY: 1.4 * Math.sin(c.lt * 37) * e, lF: [10 + 4 * tr, 8], lB: [-10 - 4 * tr, -8], cloak: 2, beard: 6 * tr }; },
    'stagger-venom': (c) => { const e = env(c.lt, 0.4), w = Math.sin(c.lt * 3.4); return { bodyRot: -6 * e + 8 * w * e, bodyY: 16 * e, head: 26 * e + 6 * w, aR: [lerp(22, 12, e), lerp(26, 8, e)], aL: [-8 + 14 * w, 6 + 10 * w], hAng: -2, lF: [8 + 12 * w, 4 + 14 * Math.max(0, w)], lB: [-10 - 10 * w, -6 - 14 * Math.max(0, -w)], venom: 0.95 * e, eyeGlow: 1 - 0.55 * e, eye: 1 - 0.3 * e, mouth: 0.25 * e + 0.1 * Math.sin(c.lt * 6), brow: 0.4 * e, belt: 0.35 - 0.2 * e + 0.15 * Math.max(0, Math.sin(c.lt * 6)), crackle: 0.1 * Math.max(0, Math.sin(c.lt * 8)), cloak: 0.4, trail: -10 * e, beard: -6 * e, hair: -6 * e, shakeX: 1.2 * Math.sin(c.lt * 23) * e }; },
    kneel: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.45)); return { bodyY: 112 * e, bodyRot: 8 * e, head: 22 * e + 2 * Math.sin(c.t * 2.4), aR: [lerp(22, 30, e), lerp(26, 10, e)], aL: [lerp(-14, 52, e), lerp(-8, 22, e)], hAng: lerp(-18, 4, e), lF: [lerp(6, 90, e), lerp(3, 0, e)], lB: [lerp(-6, 6, e), lerp(-3, -88, e)], eyeGlow: 1 - 0.4 * e, eye: 1 - 0.35 * e, mouth: 0.2 * e, venom: 0.9 * e, belt: 0.2, cloak: 0.3, trail: -20 * e, shakeX: 1.4 * Math.sin(c.lt * 15) * e, beard: 4 * Math.sin(c.t * 2) }; },
    recoil: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.16)) * (1 - 0.5 * EASE.smooth(clamp((c.lt - 0.2) / 0.6))); return { bodyRot: -14 * e, head: -12 * e, aL: [-14 - 30 * e, -8], aR: [22 + 30 * e, 26 + 20 * e], lF: [6 + 12 * e, 3 + 10 * e], lB: [-6 - 16 * e, -3], mouth: 0.8 * e, brow: e, trail: -40 * e, shakeX: 4 * Math.sin(c.lt * 60) * (1 - EASE.smooth(clamp(c.lt / 0.6))), crackle: 0.5 * e }; },
    talk: (c) => { const a = c.amp || 0; return { bodyY: 1.5 * Math.sin(c.t * 2), head: 2 * Math.sin(c.t * 1.5) - 2 * a, mouth: 0.08 + 0.75 * a, brow: 0.5 * a, aL: [-12, -6], aR: [20 + 3 * Math.sin(c.t * 1.3), 26], hAng: -18, belt: 0.4, beard: 4 * a + 2 * Math.sin(c.t * 1.2), venom: c.p.venom || 0, eyeGlow: c.p.eyeGlow === undefined ? 1.1 : c.p.eyeGlow, bodyRot: c.p.venom ? 3 : 0, crackle: 0.1 }; },
  };
  THOR.fade = THOR.idle;

  // ================================================================== TYPHON (Titan-grade overhaul: volcanic basalt musculature with glowing magma fissures, 12 articulated dragon/serpent heads, intertwined giant scaled serpent coils + lower vipers, massive flaming storm wings, horned demon-titan main head)
  let _rigUid = 0;
  function buildTyphon() {
    const uid = ++_rigUid;
    const rig = newRig();
    const root = $('g'); rig.root = root; rig.mk = {};
    const defs = $('defs', {}, root);
    const mkRad = (id, stops) => { const g = $('radialGradient', { id: `${id}_${uid}` }, defs); stops.forEach(([o, c, a]) => $('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); return `url(#${id}_${uid})`; };
    const mkLin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => { const g = $('linearGradient', { id: `${id}_${uid}`, x1, y1, x2, y2 }, defs); stops.forEach(([o, c, a]) => $('stop', { offset: o, 'stop-color': c, 'stop-opacity': a === undefined ? 1 : a }, g)); return `url(#${id}_${uid})`; };
    const gLava = mkRad('tyLava', [[0, '#fff4b8', 1], [0.3, '#ff8c24', 0.85], [0.65, '#e82e0a', 0.4], [1, '#7a0a00', 0]]);
    const gEye = mkRad('tyEye', [[0, '#fffbe0', 1], [0.35, '#ffae28', 0.85], [0.7, '#ff340a', 0.35], [1, '#ff2000', 0]]);
    const gWingF = mkLin('tyWF', [[0, '#140c10', 1], [0.55, '#2b1414', 1], [0.85, '#b82a0c', 1], [1, '#ff9a24', 1]], 0, 0, 1, 0.3);
    const gWingB = mkLin('tyWB', [[0, '#0d070a', 1], [0.6, '#210e10', 1], [0.88, '#96200a', 1], [1, '#ff7a1c', 1]], 1, 0, 0, 0.3);

    const BAS = rgb(32, 26, 30), BASD = rgb(16, 13, 18), BASM = rgb(48, 38, 44), BASL = rgb(74, 58, 64);
    const OBS = rgb(22, 17, 26), OBSH = rgb(58, 44, 62), BEL = rgb(78, 42, 34);
    const MAG = rgb(255, 78, 18), MAGD = rgb(196, 34, 8), MAGL = rgb(255, 206, 78), HOT = rgb(255, 246, 196);
    const CLAW = rgb(244, 214, 152), HORN = rgb(26, 18, 22), HORNL = rgb(88, 62, 54);
    const pathR = (p, d, fill, extra) => G.reg($('path', Object.assign({ d, fill }, extra || {}), p), fill);
    const Pstr = (pts) => pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ');

    const body = joint(root, 0, -240); rig.body = body; const B = body.c;

    // ---- MASSIVE FLAMING STORM WINGS (2 layered tiers per side, tattered demon/eagle feathers with burning rims)
    const mkWing = (sx, sy, dir, isFront) => {
      const w = joint(B, sx, sy);
      const wg = w.c, colMain = isFront ? BAS : BASD, colEdge = isFront ? gWingF : gWingB;
      // back fiery aura feather silhouette
      const outer = `M${sx} ${sy} C${sx + dir * 110} ${sy - 210} ${sx + dir * 240} ${sy - 320} ${sx + dir * 415} ${sy - 295}`
        + ` C${sx + dir * 375} ${sy - 235} ${sx + dir * 388} ${sy - 205} ${sx + dir * 440} ${sy - 175}`
        + ` C${sx + dir * 355} ${sy - 145} ${sx + dir * 360} ${sy - 110} ${sx + dir * 395} ${sy - 72}`
        + ` C${sx + dir * 310} ${sy - 75} ${sx + dir * 295} ${sy - 35} ${sx + dir * 335} ${sy + 18}`
        + ` C${sx + dir * 255} ${sy - 10} ${sx + dir * 235} ${sy + 30} ${sx + dir * 260} ${sy + 86}`
        + ` C${sx + dir * 190} ${sy + 48} ${sx + dir * 165} ${sy + 76} ${sx + dir * 175} ${sy + 126}`
        + ` C${sx + dir * 115} ${sy + 78} ${sx + dir * 70} ${sy + 88} ${sx} ${sy + 115} Z`;
      pathR(wg, outer, colMain);
      // burning gradient outer membrane overlay
      $('path', { d: outer, fill: colEdge, opacity: isFront ? 0.72 : 0.58 }, wg);
      // secondary feathered covert tier
      const mid = `M${sx} ${sy + 6} C${sx + dir * 95} ${sy - 155} ${sx + dir * 210} ${sy - 230} ${sx + dir * 320} ${sy - 195}`
        + ` C${sx + dir * 265} ${sy - 140} ${sx + dir * 280} ${sy - 100} ${sx + dir * 295} ${sy - 68}`
        + ` C${sx + dir * 225} ${sy - 68} ${sx + dir * 215} ${sy - 20} ${sx + dir * 228} ${sy + 20}`
        + ` C${sx + dir * 160} ${sy - 12} ${sx + dir * 145} ${sy + 26} ${sx + dir * 148} ${sy + 62}`
        + ` C${sx + dir * 95} ${sy + 32} ${sx + dir * 50} ${sy + 52} ${sx} ${sy + 78} Z`;
      pathR(wg, mid, isFront ? BASM : BAS);
      // wing leading-edge skeletal arm + jagged firebone ribs
      const bone = `M${sx} ${sy} Q${sx + dir * 140} ${sy - 220} ${sx + dir * 340} ${sy - 265} L${sx + dir * 412} ${sy - 292}`;
      $('path', { d: bone, stroke: BASL, 'stroke-width': 15, fill: 'none', 'stroke-linecap': 'round' }, wg);
      $('path', { d: bone, stroke: MAG, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 }, wg);
      // flaming feather tips & veins
      const ribs = [
        [dir * 200, -205, dir * 435, -174], [dir * 210, -188, dir * 392, -72],
        [dir * 185, -162, dir * 332, 16], [dir * 145, -120, dir * 256, 84], [dir * 100, -76, dir * 172, 122],
      ];
      const flames = ribs.map(([x0, y0, x1, y1], i) => {
        $('path', { d: `M${sx + x0} ${sy + y0} Q${sx + (x0 + x1) * 0.52} ${sy + (y0 + y1) * 0.45 - 24} ${sx + x1} ${sy + y1}`, stroke: isFront ? MAG : MAGD, 'stroke-width': 4.2, fill: 'none', opacity: 0.8 }, wg);
        return $('path', { d: `M${sx + x1 - dir * 26} ${sy + y1 - 8} Q${sx + x1 + dir * 22} ${sy + y1 - 24} ${sx + x1 + dir * 42} ${sy + y1 + 4} Q${sx + x1 + dir * 6} ${sy + y1 + 14} ${sx + x1 - dir * 26} ${sy + y1 - 8} Z`, fill: i % 2 ? MAGL : MAG, opacity: 0.85 }, wg);
      });
      return { w, flames };
    };
    const wB = mkWing(-52, -415, -1, false); rig.wB = wB.w;
    const wF = mkWing(52, -415, 1, true); rig.wF = wF.w;
    rig.wingFlames = [...wB.flames, ...wF.flames];

    // ---- REAR DRAGON NECKS & HEADS (layer 1 behind shoulders: 6 fierce dark dragon heads)
    const mkDragonHead = (parent, sx, sy, ang, len, sc, dir, rear) => {
      const g = joint(parent, sx, sy);
      const radA = ang * rad;
      const ex = sx + Math.sin(radA) * len, ey = sy - Math.cos(radA) * len;
      const c1x = sx + dir * (44 + sc * 26), c1y = sy - len * 0.42;
      const c2x = ex - dir * (28 + sc * 14), c2y = ey + len * 0.22;
      const neckD = `M${f2(sx)} ${f2(sy)} C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(ex)} ${f2(ey)}`;
      const nkW = 30 * sc;
      // neck base + subtle organic scale chevrons + glowing lava vein
      $('path', { d: neckD, stroke: rear ? BASD : OBS, 'stroke-width': nkW, fill: 'none', 'stroke-linecap': 'round' }, g.c);
      $('path', { d: neckD, stroke: rear ? BAS : OBSH, 'stroke-width': nkW * 0.78, 'stroke-dasharray': `${f2(nkW * 0.1)} ${f2(nkW * 0.22)}`, fill: 'none', opacity: 0.42 }, g.c);
      $('path', { d: neckD, stroke: MAG, 'stroke-width': 3.2 * sc, fill: 'none', opacity: rear ? 0.45 : 0.78 }, g.c);
      $('path', { d: neckD, stroke: MAGL, 'stroke-width': 1.4 * sc, 'stroke-dasharray': `${f2(12 * sc)} ${f2(14 * sc)}`, fill: 'none', opacity: rear ? 0.35 : 0.68 }, g.c);
      // dorsal neck spikes
      for (let k = 1; k <= 4; k++) {
        const u = k / 5, v = 1 - u;
        const px = v * v * v * sx + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * ex;
        const py = v * v * v * sy + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * ey;
        poly(g.c, [[px - 5 * sc, py], [px + 5 * sc, py], [px - dir * 16 * sc, py - 16 * sc]], rear ? BASD : HORN);
      }
      // detailed horned dragon skull + articulated roaring jaw + fire tongue
      const h = joint(g.c, ex, ey);
      const hc = h.c;
      // back horns
      poly(hc, [[ex - 8 * dir * sc, ey - 14 * sc], [ex - 36 * dir * sc, ey - 38 * sc], [ex - 4 * dir * sc, ey - 24 * sc]], HORN);
      poly(hc, [[ex - 12 * dir * sc, ey - 8 * sc], [ex - 34 * dir * sc, ey - 18 * sc], [ex - 10 * dir * sc, ey - 18 * sc]], HORNL);
      // fiery mouth cavity & flame tongue
      const tongue = $('path', { d: `M${f2(ex + 16 * dir * sc)} ${f2(ey + 6 * sc)} Q${f2(ex + 48 * dir * sc)} ${f2(ey + 4 * sc)} ${f2(ex + 66 * dir * sc)} ${f2(ey - 4 * sc)} Q${f2(ex + 44 * dir * sc)} ${f2(ey + 14 * sc)} ${f2(ex + 16 * dir * sc)} ${f2(ey + 10 * sc)} Z`, fill: MAGL, opacity: 0.85 }, hc);
      // lower jaw
      const jaw = joint(hc, ex - 2 * dir * sc, ey + 6 * sc);
      pathR(jaw.c, `M${f2(ex - 12 * dir * sc)} ${f2(ey + 6 * sc)} L${f2(ex + 44 * dir * sc)} ${f2(ey + 10 * sc)} L${f2(ex + 32 * dir * sc)} ${f2(ey + 24 * sc)} Q${f2(ex + 8 * dir * sc)} ${f2(ey + 25 * sc)} ${f2(ex - 14 * dir * sc)} ${f2(ey + 16 * sc)} Z`, rear ? BASD : BAS);
      for (const f of [14, 26, 36]) poly(jaw.c, [[ex + f * dir * sc, ey + 10 * sc], [ex + (f + 5) * dir * sc, ey + 10 * sc], [ex + (f + 2) * dir * sc, ey + 1 * sc]], CLAW);
      // upper skull & snout
      pathR(hc, `M${f2(ex - 18 * dir * sc)} ${f2(ey - 10 * sc)} Q${f2(ex + 2 * dir * sc)} ${f2(ey - 28 * sc)} ${f2(ex + 34 * dir * sc)} ${f2(ey - 14 * sc)} L${f2(ex + 54 * dir * sc)} ${f2(ey - 2 * sc)} L${f2(ex + 46 * dir * sc)} ${f2(ey + 9 * sc)} L${f2(ex - 12 * dir * sc)} ${f2(ey + 10 * sc)} Z`, rear ? BAS : BASM);
      // snout ridge highlight + upper fangs
      $('path', { d: `M${f2(ex - 4 * dir * sc)} ${f2(ey - 18 * sc)} L${f2(ex + 44 * dir * sc)} ${f2(ey - 5 * sc)}`, stroke: BASL, 'stroke-width': 3 * sc, fill: 'none' }, hc);
      for (const f of [16, 28, 40]) poly(hc, [[ex + f * dir * sc, ey + 8 * sc], [ex + (f + 6) * dir * sc, ey + 7 * sc], [ex + (f + 3) * dir * sc, ey + 20 * sc]], CLAW);
      // glowing infernal eye
      const eX = ex + 16 * dir * sc, eY = ey - 7 * sc;
      const gl = $('circle', { cx: eX, cy: eY, r: 15 * sc, fill: gEye, opacity: 0.72 }, hc);
      poly(hc, [[eX - 8 * dir * sc, eY - 3 * sc], [eX + 8 * dir * sc, eY - 1 * sc], [eX + 4 * dir * sc, eY + 4 * sc], [eX - 6 * dir * sc, eY + 3 * sc]], HOT);
      return { g, h, jaw, gl, tongue, dir };
    };

    const rearSpecs = [
      [-126, -412, -74, 155, 0.78, -1], [-102, -432, -52, 200, 0.86, -1], [-62, -448, -26, 230, 0.92, -1],
      [126, -412, 74, 155, 0.78, 1], [102, -432, 52, 200, 0.86, 1], [62, -448, 26, 230, 0.92, 1],
    ];
    rig.dHeads = rearSpecs.map((sp, idx) => Object.assign(mkDragonHead(B, ...sp, true), { idx, rear: true }));

    // ---- LOWER HALF: DYNAMIC INTERTWINED SERPENT COILS + 4 STRIKING LOWER VIPERS (organic S-loops, NOT horizontal bars)
    rig.coilsG = $('g', {}, B);
    const coilSpecs = [
      { x0: -92, y0: -195, x1: 158, y1: -110, w: 96, amp: 32, col: BASD, belly: BEL, ph: 0.0 },
      { x0: 155, y0: -115, x1: -188, y1: -34, w: 108, amp: 38, col: OBS, belly: BEL, ph: 1.7 },
      { x0: -184, y0: -38, x1: 215, y1: 14, w: 98, amp: 34, col: BAS, belly: BEL, ph: 3.3 },
      { x0: 185, y0: 4, x1: -145, y1: 28, w: 82, amp: 28, col: OBS, belly: BEL, ph: 4.8 },
    ];
    rig.coilPaths = coilSpecs.map((cs, i) => ({
      cs,
      shadow: $('path', { fill: 'none', stroke: '#050208', 'stroke-width': cs.w + 14, 'stroke-linecap': 'round', opacity: 0.65 }, rig.coilsG),
      body: $('path', { fill: 'none', stroke: cs.col, 'stroke-width': cs.w, 'stroke-linecap': 'round' }, rig.coilsG),
      scales: $('path', { fill: 'none', stroke: OBSH, 'stroke-width': cs.w * 0.84, 'stroke-dasharray': `${f2(cs.w * 0.12)} ${f2(cs.w * 0.28)}`, 'stroke-linecap': 'butt', opacity: 0.45 }, rig.coilsG),
      belly: $('path', { fill: 'none', stroke: cs.belly, 'stroke-width': cs.w * 0.24, 'stroke-dasharray': `${f2(cs.w * 0.14)} ${f2(cs.w * 0.14)}`, 'stroke-linecap': 'butt', opacity: 0.48 }, rig.coilsG),
      veinG: $('path', { fill: 'none', stroke: MAG, 'stroke-width': 11, 'stroke-linecap': 'round', opacity: 0.22 }, rig.coilsG),
      vein: $('path', { fill: 'none', stroke: MAGL, 'stroke-width': 3.5, 'stroke-dasharray': '28 18', 'stroke-linecap': 'round', opacity: 0.78 }, rig.coilsG),
    }));
    // 4 lower viper heads erupting from the serpent coils!
    const lowSpecs = [
      [-150, -155, -108, 128, 0.76, -1], [-178, -64, -95, 138, 0.80, -1],
      [150, -155, 108, 128, 0.76, 1], [178, -64, 95, 138, 0.80, 1],
    ];
    lowSpecs.forEach((sp, k) => rig.dHeads.push(Object.assign(mkDragonHead(B, ...sp, false), { idx: 12 + k, rear: false, lower: true })));

    // ---- MUSCULAR VOLCANIC ARMS (organic Bezier deltoid + bicep + forearm + elbow spikes + 5 claws + lava orb)
    const mkArm = (p, sx, sy, dark, dir) => {
      const up = joint(p, sx, sy);
      const col1 = dark ? BASD : BAS, col2 = dark ? BAS : BASM;
      // deltoid & bicep organic silhouette
      pathR(up.c, `M${sx - 34} ${sy - 26} C${sx - 56} ${sy + 14} ${sx - 44} ${sy + 92} ${sx - 26} ${sy + 132} L${sx + 28} ${sy + 132} C${sx + 48} ${sy + 86} ${sx + 54} ${sy + 12} ${sx + 34} ${sy - 26} Q${sx} ${sy - 46} ${sx - 34} ${sy - 26} Z`, col1);
      // shoulder basalt spikes
      poly(up.c, [[sx + dir * 24, sy - 28], [sx + dir * 68, sy - 64], [sx + dir * 42, sy + 2]], HORN);
      poly(up.c, [[sx + dir * 32, sy + 4], [sx + dir * 66, sy - 14], [sx + dir * 36, sy + 30]], HORNL);
      // glowing bicep lava fissure
      $('path', { d: `M${sx - 6} ${sy - 6} L${sx + 10} ${sy + 44} L${sx - 4} ${sy + 92} L${sx + 8} ${sy + 122}`, stroke: MAG, 'stroke-width': 4.8, fill: 'none', 'stroke-linecap': 'round' }, up.c);
      $('path', { d: `M${sx - 6} ${sy - 6} L${sx + 10} ${sy + 44} L${sx - 4} ${sy + 92}`, stroke: MAGL, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, up.c);

      const fo = joint(up.c, sx, sy + 126);
      // muscular tapered forearm + elbow spur
      pathR(fo.c, `M${sx - 30} ${sy + 118} C${sx - 40} ${sy + 160} ${sx - 32} ${sy + 216} ${sx - 24} ${sy + 252} L${sx + 24} ${sy + 252} C${sx + 36} ${sy + 212} ${sx + 42} ${sy + 160} ${sx + 30} ${sy + 118} Z`, col2);
      poly(fo.c, [[sx - dir * 24, sy + 122], [sx - dir * 56, sy + 108], [sx - dir * 28, sy + 154]], HORN);
      $('path', { d: `M${sx + 4} ${sy + 132} L${sx - 8} ${sy + 188} L${sx + 8} ${sy + 242}`, stroke: MAG, 'stroke-width': 4.2, fill: 'none', 'stroke-linecap': 'round' }, fo.c);
      // clawed monster hand (palm + 5 curved molten claws)
      pathR(fo.c, `M${sx - 26} ${sy + 246} Q${sx - 38} ${sy + 272} ${sx - 24} ${sy + 288} L${sx + 26} ${sy + 288} Q${sx + 40} ${sy + 272} ${sx + 26} ${sy + 246} Z`, col1);
      for (const [cx, len, lean] of [[-24, 52, -14], [-12, 64, -6], [2, 70, 0], [16, 62, 7], [28, 48, 16]]) {
        pathR(fo.c, `M${sx + cx - 5} ${sy + 280} Q${sx + cx + lean * 0.5} ${sy + 280 + len * 0.55} ${sx + cx + lean} ${sy + 280 + len} Q${sx + cx + 4 + lean * 0.3} ${sy + 280 + len * 0.5} ${sx + cx + 5} ${sy + 280} Z`, CLAW);
      }
      // molten energy orb crackling in palm (visible during attacks/high glow)
      const orb = $('circle', { cx: sx, cy: sy + 305, r: 42, fill: gLava, opacity: 0 }, fo.c);
      return { up, fo, orb };
    };
    rig.aL = mkArm(B, -124, -408, true, -1);

    // ---- COLOSSAL MUSCULAR VOLCANIC TORSO (V-taper titan chest, pecs, abs, organic jagged magma fissures)
    pathR(B, 'M-136 -438 C-110 -466 -54 -474 0 -470 C54 -474 110 -466 136 -438 C144 -378 122 -306 102 -246 C92 -208 86 -184 74 -168 L-74 -168 C-86 -184 -92 -208 -102 -246 C-122 -306 -144 -378 -136 -438 Z', BAS);
    // trapezius + broad volcanic shoulder armor
    pathR(B, 'M-134 -436 C-92 -482 -44 -484 0 -468 C44 -484 92 -482 134 -436 C112 -404 64 -390 0 -392 C-64 -390 -112 -404 -134 -436 Z', BASM);
    // sculpted pectoral plates & ribcage shadow
    pathR(B, 'M-110 -416 C-62 -424 -14 -412 -6 -360 C-18 -332 -74 -328 -108 -358 Z', BASL, { opacity: 0.52 });
    pathR(B, 'M110 -416 C62 -424 14 -412 6 -360 C18 -332 74 -328 108 -358 Z', BASL, { opacity: 0.52 });
    // abdominal muscle blocks
    for (let r = 0; r < 3; r++) {
      const y = -326 + r * 42;
      pathR(B, `M-52 ${y} Q-26 ${y - 8} -5 ${y + 2} L-8 ${y + 30} Q-28 ${y + 34} -48 ${y + 26} Z`, BASM, { opacity: 0.72 });
      pathR(B, `M52 ${y} Q26 ${y - 8} 5 ${y + 2} L8 ${y + 30} Q28 ${y + 34} 48 ${y + 26} Z`, BASM, { opacity: 0.72 });
    }
    // organic lightning-like molten fissures across chest & abs (thinner, jagged, natural cracks)
    const veinD = 'M-88 -424 L-66 -402 L-48 -394 L-32 -374 L-12 -366 L0 -376 L18 -362 L40 -372 L62 -396 L88 -420'
      + ' M0 -376 L-6 -344 L6 -314 L-8 -282 L4 -248 L-10 -212 L4 -176'
      + ' M-48 -394 L-64 -356 L-52 -320 L-72 -284 L-60 -244'
      + ' M40 -372 L68 -348 L56 -312 L74 -276 L62 -236'
      + ' M-6 -344 L-36 -336 L-52 -320 M6 -314 L34 -306 L56 -312 M-8 -282 L-42 -270 M4 -248 L44 -238';
    rig.veinsGlow = $('path', { d: veinD, stroke: MAGD, 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.42 }, B);
    rig.veins = $('path', { d: veinD, stroke: MAG, 'stroke-width': 4.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, B);
    rig.veinsCore = $('path', { d: veinD, stroke: HOT, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, B);

    // ---- FOREGROUND DRAGON NECKS & HEADS (layer 2 framing shoulders: 6 bright fierce dragon heads)
    const frontSpecs = [
      [-112, -424, -64, 175, 0.84, -1], [-82, -444, -38, 205, 0.90, -1], [-44, -456, -16, 215, 0.86, -1],
      [112, -424, 64, 175, 0.84, 1], [82, -444, 38, 205, 0.90, 1], [44, -456, 16, 215, 0.86, 1],
    ];
    frontSpecs.forEach((sp, k) => rig.dHeads.push(Object.assign(mkDragonHead(B, ...sp, false), { idx: 6 + k, rear: false })));

    // ---- MAIN DEMON-TITAN HEAD (angular demonic skull, sculpted cheekbones, ram horns, blazing volcanic mane/beard, fanged maw, razor eyes)
    const hd = joint(B, 4, -452); rig.head = hd; const Hc = hd.c;
    // thick muscular neck
    pathR(Hc, 'M-42 -442 C-44 -482 -38 -508 -34 -528 L38 -528 C44 -506 48 -480 46 -442 Z', BASD);
    // jagged billowing smoke & fire mane behind skull
    rig.mane = $('path', { d: 'M-76 -516 L-108 -548 L-84 -578 L-102 -614 L-58 -612 L-40 -652 L-4 -624 L26 -658 L48 -618 L96 -624 L82 -582 L114 -554 L84 -514 L98 -476 L54 -454 L-48 -454 L-92 -478 Z', fill: BASD, opacity: 0.94 }, Hc);
    $('path', { d: 'M-76 -516 L-102 -548 L-80 -578 L-94 -608 L-56 -608 L-36 -642 M30 -648 L48 -614 L90 -618 L78 -580 L108 -554', stroke: MAG, 'stroke-width': 4.5, fill: 'none', opacity: 0.65 }, Hc);
    // colossal sweeping curved demon-ram horns (matching image_2.png)
    pathR(Hc, 'M-34 -574 C-78 -628 -140 -624 -148 -564 C-154 -524 -126 -488 -94 -500 C-114 -520 -116 -558 -96 -576 C-76 -592 -46 -572 -24 -556 Z', HORN);
    pathR(Hc, 'M38 -574 C84 -630 150 -624 158 -564 C164 -522 134 -486 102 -498 C122 -520 124 -558 104 -576 C84 -592 54 -572 28 -556 Z', HORN);
    $('path', { d: 'M-44 -578 C-84 -614 -130 -606 -140 -562 M48 -578 C90 -614 138 -606 148 -562', stroke: HORNL, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }, Hc);
    $('path', { d: 'M-116 -592 L-142 -560 M122 -592 L150 -560', stroke: MAG, 'stroke-width': 3, fill: 'none' }, Hc);
    poly(Hc, [[-26, -580], [-42, -654], [-4, -590]], HORN);
    poly(Hc, [[30, -580], [50, -656], [8, -590]], HORN);

    // roaring molten mouth cavity
    rig.mouthGlow = $('ellipse', { cx: 14, cy: -492, rx: 44, ry: 18, fill: gLava, opacity: 0.45 }, Hc);
    // articulated lower jaw + volcanic beard + lower tusks
    const jaw = joint(Hc, 12, -496); rig.jaw = jaw;
    pathR(jaw.c, 'M-38 -500 L66 -500 L52 -460 L14 -446 L-26 -462 Z', BASD);
    pathR(jaw.c, 'M-36 -472 L-48 -428 L-20 -450 L-4 -408 L18 -442 L40 -412 L52 -450 L70 -434 L56 -476 Z', BAS);
    $('path', { d: 'M-20 -450 L-4 -412 L18 -442 L40 -416', stroke: MAG, 'stroke-width': 3, fill: 'none', opacity: 0.72 }, jaw.c);
    for (const [fx, h] of [[-18, 22], [-2, 16], [14, 15], [30, 17], [46, 24]]) {
      poly(jaw.c, [[fx - 4.5, -496], [fx + 4.5, -496], [fx, -496 - h]], CLAW);
    }

    // angular sculpted demon-titan skull (gaunt cheekbones, sharp temple ridges, fierce snout)
    pathR(Hc, 'M-56 -564 L-34 -594 L8 -602 L50 -594 L68 -564 L76 -524 L62 -492 L36 -486 L-12 -486 L-44 -492 L-64 -524 Z', BAS);
    // brow-crest & gaunt cheekbone planes
    pathR(Hc, 'M-48 -562 L-24 -586 L8 -592 L40 -586 L58 -562 L44 -542 L8 -530 L-32 -542 Z', BASM);
    pathR(Hc, 'M-58 -524 L-26 -518 L-16 -496 L-44 -496 Z', BASL, { opacity: 0.45 });
    pathR(Hc, 'M70 -524 L38 -518 L28 -496 L56 -496 Z', BASL, { opacity: 0.45 });
    // sharp ridged nose & fiery facial cracks
    pathR(Hc, 'M0 -536 L20 -536 L26 -504 L10 -496 L-6 -504 Z', BASL, { opacity: 0.58 });
    poly(Hc, [[1, -508], [6, -504], [2, -500]], BASD);
    poly(Hc, [[19, -508], [14, -504], [18, -500]], BASD);
    $('path', { d: 'M-40 -570 L-24 -536 L-36 -502 M52 -570 L38 -536 L50 -502', stroke: MAG, 'stroke-width': 2.6, fill: 'none', opacity: 0.72 }, Hc);
    // upper predator fangs
    for (const [fx, h] of [[-22, 26], [-5, 16], [11, 15], [27, 16], [44, 28]]) {
      poly(Hc, [[fx - 4.5, -490], [fx + 4.5, -490], [fx, -490 + h]], CLAW);
    }
    // heavy furrowed V-shaped volcanic brow ridges (fierce angry glare)
    pathR(Hc, 'M-60 -556 L10 -528 L74 -556 L66 -534 L10 -514 L-52 -534 Z', BASD);
    // fierce narrowed blazing eyes (tighter halo so sharp angry eye slits read unmistakably!)
    rig.eyes = [];
    for (const [ex, ey, dir] of [[-14, -532, -1], [36, -532, 1]]) {
      const gl = $('circle', { cx: ex, cy: ey, r: 22, fill: gEye, opacity: 0.65 }, Hc);
      poly(Hc, [[ex - 20 * dir, ey - 8], [ex + 16 * dir, ey - 1], [ex + 10 * dir, ey + 7], [ex - 14 * dir, ey + 5]], MAGL);
      poly(Hc, [[ex - 12 * dir, ey - 4], [ex + 9 * dir, ey], [ex + 4 * dir, ey + 4], [ex - 8 * dir, ey + 3]], HOT);
      rig.eyes.push({ gl });
    }

    // ---- FRONT ARM (overlaps torso for 3D mass)
    rig.aR = mkArm(B, 126, -408, false, 1);

    const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 12, -528); mk('eye', Hc, 20, -534); mk('mouth', Hc, 42, -490); mk('hand', rig.aR.fo.c, 126, -120); mk('body', B, 0, -320);

    rig.N = { bodyY: 0, bodyRot: 0, shakeX: 0, shakeY: 0, sx: 1, sy: 1, head: 0, jaw: 0, aL: [-20, -10], aR: [24, 30], wL: 0, wR: 0, dAmp: 1, dSpread: 0, glow: 1, sink: 0, coilW: 1 };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY + P.sink * 720);
      rig.aL.up.set(-P.aL[0]); rig.aL.fo.set(-(P.aL[1] - P.aL[0]));
      rig.aR.up.set(-P.aR[0]); rig.aR.fo.set(-(P.aR[1] - P.aR[0]));
      const orbA = clamp((P.glow - 1.15) * 0.95) * (0.75 + 0.25 * Math.sin(t * 24));
      rig.aR.orb.setAttribute('opacity', f2(orbA)); rig.aR.orb.setAttribute('r', f2(34 + 22 * orbA));
      rig.aL.orb.setAttribute('opacity', f2(orbA * 0.65));
      rig.wB.set(-P.wL + 4 * Math.sin(t * 2.2)); rig.wF.set(P.wR + 4 * Math.sin(t * 2.2 + 0.5));
      rig.wingFlames.forEach((f, i) => f.setAttribute('opacity', f2(clamp(0.45 + 0.4 * P.glow * (0.65 + 0.35 * Math.sin(t * 14 + i * 1.9))))));
      hd.set(P.head + 1.4 * Math.sin(t * 1.8));
      jaw.set(P.jaw * 26, 1, 1, 0, P.jaw * 14);
      rig.mouthGlow.setAttribute('opacity', f2(clamp(0.22 + 0.78 * P.jaw * P.glow)));
      rig.mouthGlow.setAttribute('ry', f2(10 + 26 * P.jaw));
      const vp = clamp(0.55 + 0.45 * P.glow * (0.8 + 0.2 * Math.sin(t * 8)));
      rig.veins.setAttribute('opacity', f2(vp));
      rig.veinsCore.setAttribute('opacity', f2(clamp(vp * 0.9)));
      rig.veinsGlow.setAttribute('opacity', f2(clamp(0.22 + 0.4 * P.glow)));
      rig.eyes.forEach((E) => { E.gl.setAttribute('r', f2(18 + 12 * P.glow)); E.gl.setAttribute('opacity', f2(clamp(0.38 + 0.38 * P.glow))); });
      rig.dHeads.forEach((D) => {
        const w = Math.sin(t * (2.5 + (D.idx % 4) * 0.6) + D.idx * 1.37) * 11 * P.dAmp;
        D.g.set(w + D.dir * P.dSpread * (D.lower ? 0.6 : 1));
        D.h.set(w * 0.55 + P.head * 0.35);
        D.jaw.set(D.dir * (6 + P.jaw * 24));
        D.gl.setAttribute('opacity', f2(clamp(0.42 + 0.45 * P.glow)));
        D.tongue.setAttribute('opacity', f2(clamp((P.jaw * 0.9 + (P.glow - 1.0) * 0.5) * (0.6 + 0.4 * Math.sin(t * 18 + D.idx)))));
      });
      // animated giant S-curved serpent coils with travelling scales & lava veins
      const cw = P.coilW;
      rig.coilPaths.forEach((c, i) => {
        const cs = c.cs, ph = t * 2.8 + cs.ph, dx = Math.sin(ph) * cs.amp * cw;
        const x0 = cs.x0 * cw + dx * 0.6, x1 = cs.x1 * cw + dx;
        const cx1 = lerp(x0, x1, 0.33) + (i % 2 ? -55 : 55), cy1 = lerp(cs.y0, cs.y1, 0.25) + 46 + Math.cos(ph) * 16;
        const cx2 = lerp(x0, x1, 0.68) + (i % 2 ? 45 : -45), cy2 = lerp(cs.y0, cs.y1, 0.8) - 24 + Math.sin(ph * 1.2) * 14;
        const d = `M${f2(x0)} ${f2(cs.y0)} C${f2(cx1)} ${f2(cy1)} ${f2(cx2)} ${f2(cy2)} ${f2(x1)} ${f2(cs.y1)}`;
        for (const el of [c.shadow, c.body, c.scales, c.belly, c.veinG, c.vein]) el.setAttribute('d', d);
        c.scales.setAttribute('stroke-dashoffset', f2(-t * 36 * (i % 2 ? 1 : -1)));
        c.vein.setAttribute('stroke-dashoffset', f2(-t * 54 * (i % 2 ? 1 : -1)));
        c.vein.setAttribute('opacity', f2(clamp(0.42 + 0.48 * P.glow)));
      });
    };
    return rig;
  }
  const TYPHON = {
    idle: (c) => ({ bodyY: 6 * Math.sin(c.t * 2), head: 3 * Math.sin(c.t * 1.5), jaw: 0.18 + 0.08 * Math.sin(c.t * 2.4), wL: 10 + 5 * Math.sin(c.t * 1.7), wR: 10 + 5 * Math.sin(c.t * 1.7), aL: [-24, -14], aR: [24, 34], glow: 1.05 }),
    'idle-card': (c) => ({ bodyY: 4 * Math.sin(c.t * 2), jaw: 0.42, wL: 18, wR: 18, dSpread: 12, glow: 1.4 }),
    rise: (c) => { const e = EASE.outCubic(clamp(c.u)); return { sink: 1 - e, bodyRot: -6 * (1 - e), jaw: 0.65 * e, wL: 30 * e, wR: 30 * e, dSpread: 15 * e, glow: 0.9 + 0.9 * e }; },
    'rise-from-sea': (c) => { const e = EASE.outCubic(clamp(c.u)); return { sink: 1.05 * (1 - e), bodyRot: -8 * (1 - e), jaw: 0.88 * e, wL: 36 * e, wR: 36 * e, aL: [-62 * e, -22], aR: [74 * e, 44], dSpread: 20 * e, glow: 1.6 }; },
    roar: (c) => { const e = env(c.lt, 0.25); return { bodyRot: -10 * e, head: -14 * e, jaw: 1.05 * e, wL: 40 * e, wR: 40 * e, dAmp: 2.3, dSpread: 24 * e, aL: [-78 * e, -42], aR: [84 * e, 54], glow: 1.9, shakeX: 4 * e * Math.sin(c.lt * 55) }; },
    'fire-breath': (c) => { const e = env(c.lt, 0.2); return { bodyRot: 12 * e, head: 10 * e, jaw: 1.15 * e, wL: 26 * e, wR: 26 * e, dAmp: 1.9, dSpread: 14 * e, aL: [-52, -32], aR: [96 * e, 112 * e], glow: 2.1, shakeX: 3 * e * Math.sin(c.lt * 48) }; },
    'wing-charge': (c) => { const e = EASE.outCubic(clamp(c.u)); return { bodyRot: -12 * e, wL: 54 * e, wR: 54 * e, aL: [-82 * e, -52], aR: [82 * e, 52], jaw: 0.65 * e, dSpread: 22 * e, glow: 1.7 }; },
    strike: (c) => KO(c.u, [[0, { bodyRot: -14, wL: 48, wR: 48, aR: [122, 142], glow: 1.6 }], [0.45, { bodyRot: 18, wL: -20, wR: -20, aR: [40, 10], jaw: 0.95, glow: 2.0, shakeX: 6 }], [1, { bodyRot: 6, wL: 12, wR: 12, aR: [30, 35], jaw: 0.25, glow: 1.15 }]], 'inOut'),
    'throw-rock': (c) => KO(c.u, [[0, { bodyRot: -16, aL: [-112, -92], aR: [168, 188], jaw: 0.55, glow: 1.6 }], [0.5, { bodyRot: 16, aL: [-30, -10], aR: [65, 55], jaw: 0.98, glow: 2.0, shakeX: 5 }], [1, { bodyRot: 4, aR: [30, 35], jaw: 0.22, glow: 1.15 }]], 'inOut'),
    'coil-squeeze': (c) => { const e = env(c.lt, 0.3); return { bodyRot: 14 * e, coilW: 1.38 + 0.16 * Math.sin(c.lt * 16), aL: [75 * e, 110 * e], aR: [95 * e, 130 * e], jaw: 0.85 * e, glow: 1.8, shakeX: 3 * e * Math.sin(c.lt * 40) }; },
    recoil: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.18)) * (1 - 0.5 * clamp((c.lt - 0.25) / 0.6)); return { bodyRot: -18 * e, head: -16 * e, jaw: 0.75 * e, wL: -12 * e, wR: -12 * e, glow: 0.65, shakeX: 6 * e * Math.sin(c.lt * 60) }; },
    'confused-stagger': (c) => { const w = Math.sin(c.lt * 11); return { bodyRot: -10 + 12 * w, head: 18 * Math.sin(c.lt * 15), jaw: 0.65, dAmp: 3.4, dSpread: 26, aL: [-60 + 30 * w, -30], aR: [60 - 30 * w, 30], glow: 0.8, shakeX: 5 * Math.sin(c.lt * 45) }; },
    'beam-charge': (c) => { const e = EASE.outCubic(clamp(c.u)); return { bodyRot: -10 * e, head: -8 * e, jaw: 1.05 * e, wL: 44 * e, wR: 44 * e, dSpread: 26 * e, glow: 1.3 + 1.2 * e, shakeX: 3.5 * e * Math.sin(c.lt * 55) }; },
    sink: (c) => { const e = EASE.inOut(clamp(c.u)); return { sink: 1.15 * e, bodyRot: -12 * e, head: -18 * e, jaw: 0.8 * (1 - e), glow: 1.2 * (1 - e), shakeX: 4 * (1 - e) * Math.sin(c.lt * 40) }; },
    talk: (c) => { const a = c.amp || 0; return { bodyY: 4 * Math.sin(c.t * 2), head: 2 * Math.sin(c.t * 1.4) - 4 * a, jaw: 0.15 + 0.85 * a, wL: 14 + 10 * a, wR: 14 + 10 * a, dAmp: 1.2 + 0.8 * a, glow: 1.15 + 0.75 * a }; },
  };
  TYPHON.fade = TYPHON.idle;

  // ================================================================== CTHULHU (Titan-grade Lovecraftian overhaul: ridged cephalopod cranium, 6 fierce glowing eyes under heavy brow, 16 tapered Bezier suction-cup tentacles in 3 depth layers, massive scaled trapezius/muscular dragon torso with abyssal veins, huge skeletal tattered bat-dragon wings, prodigious curved claws)
  function buildCthulhu() {
    const uid = ++_rigUid;
    const rig = newRig();
    const root = $('g'); rig.root = root; rig.mk = {};
    const defs = $('defs', {}, root);
    const mkRad = (id, stops) => { const g = $('radialGradient', { id: `${id}_${uid}` }, defs); stops.forEach(([o, c, a]) => $('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); return `url(#${id}_${uid})`; };
    const mkLin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => { const g = $('linearGradient', { id: `${id}_${uid}`, x1, y1, x2, y2 }, defs); stops.forEach(([o, c, a]) => $('stop', { offset: o, 'stop-color': c, 'stop-opacity': a === undefined ? 1 : a }, g)); return `url(#${id}_${uid})`; };
    const gEmr = mkRad('ctEmr', [[0, '#eafff4', 1], [0.3, '#38ff9a', 0.85], [0.68, '#0b9c5e', 0.35], [1, '#043824', 0]]);
    const gEyeR = mkRad('ctEyeR', [[0, '#fff4e0', 1], [0.35, '#38ff9a', 0.9], [0.72, '#0fa660', 0.38], [1, '#052b1c', 0]]);
    const gWing = mkLin('ctWg', [[0, '#0a1c18', 1], [0.5, '#17382e', 1], [1, '#265c4a', 0.92]], 0, 0, 1, 1);

    const SKIND = rgb(11, 30, 24), SKIN = rgb(22, 56, 44), SKINM = rgb(36, 86, 66), SKINL = rgb(62, 134, 102), WET = rgb(124, 212, 168);
    const WINGD = rgb(10, 22, 20), WINGM = rgb(18, 42, 36), BONE = rgb(44, 88, 70), SUCK = rgb(94, 166, 128);
    const CLAW = rgb(198, 232, 210), CLAWD = rgb(94, 126, 112), EMR = rgb(56, 255, 154), EMRL = rgb(226, 255, 240);
    const pathR = (p, d, fill, extra) => G.reg($('path', Object.assign({ d, fill }, extra || {}), p), fill);
    const Pstr = (pts) => pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ');

    const body = joint(root, 0, -240); rig.body = body; const B = body.c;

    // ---- HUGE SKELETAL BAT-DRAGON WINGS (arched wing-arm + apex thumb claw + 5 curved bone fingers + scalloped tattered membranes)
    const mkBatWing = (sx, sy, dir, isFront) => {
      const w = joint(B, sx, sy);
      const wg = w.c;
      const apexX = sx + dir * 218, apexY = sy - 335;
      const tips = [
        [sx + dir * 412, sy - 235],
        [sx + dir * 375, sy - 68],
        [sx + dir * 296, sy + 52],
        [sx + dir * 204, sy + 116],
        [sx + dir * 116, sy + 128],
      ];
      // scalloped tattered membrane path connecting the 5 bone tips
      const memD = `M${sx} ${sy - 14} Q${sx + dir * 110} ${sy - 205} ${apexX} ${apexY}`
        + ` Q${sx + dir * 320} ${sy - 305} ${tips[0][0]} ${tips[0][1]}`
        + ` Q${sx + dir * 350} ${sy - 140} ${tips[1][0]} ${tips[1][1]}`
        + ` Q${sx + dir * 298} ${sy - 22} ${tips[2][0]} ${tips[2][1]}`
        + ` Q${sx + dir * 224} ${sy + 54} ${tips[3][0]} ${tips[3][1]}`
        + ` Q${sx + dir * 142} ${sy + 86} ${tips[4][0]} ${tips[4][1]}`
        + ` Q${sx + dir * 64} ${sy + 72} ${sx} ${sy + 110} Z`;
      pathR(wg, memD, isFront ? WINGM : WINGD);
      $('path', { d: memD, fill: gWing, opacity: isFront ? 0.65 : 0.42 }, wg);
      // subtle membrane folds/veins
      for (let i = 0; i < 4; i++) {
        const mx = (tips[i][0] + tips[i + 1][0]) * 0.5, my = (tips[i][1] + tips[i + 1][1]) * 0.5;
        $('path', { d: `M${f2(apexX)} ${f2(apexY)} Q${f2((apexX + mx) * 0.52)} ${f2((apexY + my) * 0.48)} ${f2(mx - dir * 18)} ${f2(my - 18)}`, stroke: EMR, 'stroke-width': 2.2, fill: 'none', opacity: isFront ? 0.34 : 0.2 }, wg);
      }
      // leading skeletal wing arm + curved bone fingers
      $('path', { d: `M${sx} ${sy} Q${sx + dir * 112} ${sy - 200} ${apexX} ${apexY}`, stroke: isFront ? SKINM : SKIND, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, wg);
      $('path', { d: `M${sx} ${sy} Q${sx + dir * 112} ${sy - 200} ${apexX} ${apexY}`, stroke: isFront ? WET : BONE, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }, wg);
      // sharp wing-thumb claw at apex
      pathR(wg, `M${apexX - dir * 6} ${apexY + 4} Q${apexX + dir * 14} ${apexY - 48} ${apexX + dir * 40} ${apexY - 62} Q${apexX + dir * 24} ${apexY - 22} ${apexX + dir * 14} ${apexY + 8} Z`, CLAW);
      // 5 bone ribs radiating from apex
      tips.forEach(([tx, ty], i) => {
        const cx = (apexX + tx) * 0.5 + dir * (16 - i * 4), cy = (apexY + ty) * 0.5 - 24;
        $('path', { d: `M${apexX} ${apexY} Q${f2(cx)} ${f2(cy)} ${tx} ${ty}`, stroke: isFront ? BONE : SKIN, 'stroke-width': 9 - i * 1.1, fill: 'none', 'stroke-linecap': 'round' }, wg);
        $('path', { d: `M${apexX} ${apexY} Q${f2(cx)} ${f2(cy)} ${tx} ${ty}`, stroke: WET, 'stroke-width': 2.2, fill: 'none', opacity: isFront ? 0.55 : 0.3 }, wg);
      });
      return w;
    };
    rig.wB = mkBatWing(-46, -425, -1, false);
    rig.wF = mkBatWing(46, -425, 1, true);

    // ---- HEAVY ORGANIC MUSCULAR LEGS & TALONED FEET
    const mkLeg = (p, sx, sy, dark) => {
      const col1 = dark ? SKIND : SKIN, col2 = dark ? SKIN : SKINM;
      const th = joint(p, sx, sy);
      pathR(th.c, `M${sx - 38} ${sy - 14} C${sx - 50} ${sy + 42} ${sx - 40} ${sy + 96} ${sx - 30} ${sy + 132} L${sx + 32} ${sy + 132} C${sx + 46} ${sy + 86} ${sx + 50} ${sy + 34} ${sx + 36} ${sy - 14} Z`, col1);
      // knee scale ridge
      pathR(th.c, `M${sx - 22} ${sy + 104} Q${sx + 4} ${sy + 94} ${sx + 28} ${sy + 112} L${sx + 18} ${sy + 136} L${sx - 20} ${sy + 132} Z`, dark ? SKIN : SKINL, { opacity: 0.7 });
      const sh = joint(th.c, sx, sy + 126);
      pathR(sh.c, `M${sx - 30} ${sy + 118} C${sx - 44} ${sy + 168} ${sx - 36} ${sy + 216} ${sx - 28} ${sy + 246} L${sx + 34} ${sy + 246} C${sx + 40} ${sy + 204} ${sx + 44} ${sy + 162} ${sx + 28} ${sy + 118} Z`, col2);
      // calf dorsal fin
      pathR(sh.c, `M${sx - 34} ${sy + 148} L${sx - 60} ${sy + 178} L${sx - 32} ${sy + 206} Z`, dark ? SKIND : SKINL);
      // webbed foot + 4 sharp curved talons
      pathR(sh.c, `M${sx - 32} ${sy + 236} L${sx + 42} ${sy + 236} L${sx + 54} ${sy + 258} L${sx - 36} ${sy + 258} Z`, col1);
      for (const [cx, dx] of [[-20, 6], [-2, 12], [18, 18], [36, 22]]) {
        pathR(sh.c, `M${sx + cx - 5} ${sy + 244} Q${sx + cx + dx * 0.6} ${sy + 252} ${sx + cx + dx} ${sy + 272} Q${sx + cx + 4} ${sy + 260} ${sx + cx + 6} ${sy + 244} Z`, CLAW);
      }
      return { th, sh };
    };
    rig.lB = mkLeg(B, -48, -238, true);
    rig.lF = mkLeg(B, 48, -238, false);

    // ---- TITAN ARMS WITH SCALED FINS & PRODIGIOUS CURVED CLAWS
    const mkArm = (p, sx, sy, dark, dir) => {
      const col1 = dark ? SKIND : SKIN, col2 = dark ? SKIN : SKINM;
      const up = joint(p, sx, sy);
      pathR(up.c, `M${sx - 34} ${sy - 26} C${sx - 54} ${sy + 16} ${sx - 44} ${sy + 92} ${sx - 28} ${sy + 132} L${sx + 28} ${sy + 132} C${sx + 46} ${sy + 86} ${sx + 52} ${sy + 14} ${sx + 34} ${sy - 26} Q${sx} ${sy - 44} ${sx - 34} ${sy - 26} Z`, col1);
      // jagged aquatic shoulder fin
      pathR(up.c, `M${sx + dir * 24} ${sy - 22} Q${sx + dir * 68} ${sy - 44} ${sx + dir * 74} ${sy - 2} Q${sx + dir * 48} ${sy + 24} ${sx + dir * 32} ${sy + 48} Z`, dark ? SKIN : SKINL, { opacity: 0.85 });
      $('path', { d: `M${sx} ${sy} Q${sx + dir * 8} ${sy + 62} ${sx - dir * 4} ${sy + 118}`, stroke: EMR, 'stroke-width': 3.5, fill: 'none', opacity: 0.55 }, up.c);

      const fo = joint(up.c, sx, sy + 124);
      pathR(fo.c, `M${sx - 30} ${sy + 118} C${sx - 44} ${sy + 162} ${sx - 34} ${sy + 214} ${sx - 26} ${sy + 248} L${sx + 26} ${sy + 248} C${sx + 38} ${sy + 208} ${sx + 44} ${sy + 162} ${sx + 30} ${sy + 118} Z`, col2);
      // forearm serrated fin
      pathR(fo.c, `M${sx - dir * 28} ${sy + 132} L${sx - dir * 62} ${sy + 158} L${sx - dir * 42} ${sy + 186} L${sx - dir * 56} ${sy + 206} L${sx - dir * 26} ${sy + 224} Z`, dark ? SKIND : SKINL);
      $('path', { d: `M${sx + dir * 4} ${sy + 130} L${sx - dir * 6} ${sy + 186} L${sx + dir * 4} ${sy + 240}`, stroke: EMR, 'stroke-width': 3.2, fill: 'none', opacity: 0.65 }, fo.c);
      // prodigious clawed hand (palm + 5 long razor claws with dark shadow & specular edge)
      pathR(fo.c, `M${sx - 28} ${sy + 242} Q${sx - 42} ${sy + 268} ${sx - 26} ${sy + 286} L${sx + 28} ${sy + 286} Q${sx + 44} ${sy + 268} ${sx + 28} ${sy + 242} Z`, col1);
      for (const [cx, len, lean] of [[-26, 62, -18], [-12, 78, -8], [3, 86, 0], [18, 76, 9], [30, 58, 20]]) {
        pathR(fo.c, `M${sx + cx - 6} ${sy + 278} Q${sx + cx + lean * 0.55} ${sy + 278 + len * 0.56} ${sx + cx + lean} ${sy + 278 + len} Q${sx + cx + 5 + lean * 0.3} ${sy + 278 + len * 0.5} ${sx + cx + 6} ${sy + 278} Z`, CLAW);
        $('path', { d: `M${sx + cx - 2} ${sy + 280} Q${sx + cx + lean * 0.55} ${sy + 280 + len * 0.56} ${sx + cx + lean} ${sy + 278 + len}`, stroke: EMRL, 'stroke-width': 1.8, fill: 'none', opacity: 0.65 }, fo.c);
      }
      const orb = $('circle', { cx: sx, cy: sy + 312, r: 44, fill: gEmr, opacity: 0 }, fo.c);
      return { up, fo, orb };
    };
    rig.aL = mkArm(B, -118, -408, true, -1);

    // ---- MASSIVE HUNCHED SCALED TITAN TORSO (broad trapezius, pectorals, rib plates, abyssal emerald veins, wet sheen)
    pathR(B, 'M-134 -434 C-102 -478 -52 -492 0 -486 C52 -492 102 -478 134 -434 C144 -368 120 -298 96 -244 C82 -214 68 -196 54 -192 L-54 -192 C-68 -196 -82 -214 -96 -244 C-120 -298 -144 -368 -134 -434 Z', SKIN);
    // muscular shoulder hump / trapezius highlight
    pathR(B, 'M-118 -432 C-86 -472 -38 -480 0 -470 C38 -480 86 -472 118 -432 C98 -394 56 -378 0 -382 C-56 -378 -98 -394 -118 -432 Z', SKINM, { opacity: 0.78 });
    // pectoral & sternal ridges
    pathR(B, 'M-104 -410 C-62 -418 -14 -404 -6 -356 C-20 -326 -72 -324 -102 -354 Z', SKINL, { opacity: 0.45 });
    pathR(B, 'M104 -410 C62 -418 14 -404 6 -356 C20 -326 72 -324 102 -354 Z', SKINL, { opacity: 0.45 });
    // segmented dragon belly plates & wet rib ridges
    for (let i = 0; i < 5; i++) {
      const y = -352 + i * 32, w = 64 - i * 4;
      pathR(B, `M${-w} ${y} Q0 ${y + 14} ${w} ${y} L${w - 6} ${y + 20} Q0 ${y + 30} ${-(w - 6)} ${y + 20} Z`, i % 2 ? SKINM : SKIND, { opacity: 0.65 });
      $('path', { d: `M${-w + 8} ${y + 4} Q0 ${y + 16} ${w - 8} ${y + 4}`, stroke: WET, 'stroke-width': 2.6, fill: 'none', opacity: 0.42 }, B);
    }
    // glowing abyssal emerald veins on chest & sides
    const cVein = 'M-84 -420 Q-48 -384 -16 -366 M84 -420 Q48 -384 16 -366 M0 -376 L0 -216 M-68 -334 Q-82 -290 -64 -248 M68 -334 Q82 -290 64 -248';
    rig.chestVeins = $('path', { d: cVein, stroke: EMR, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.55 }, B);
    // dripping sea-slime / seaweed strands off shoulders
    for (const [dx, dy, ln] of [[-96, -424, 58], [-64, -448, 46], [74, -444, 54], [104, -418, 64]]) {
      $('path', { d: `M${dx} ${dy} Q${dx + 6} ${dy + ln * 0.5} ${dx - 4} ${dy + ln}`, stroke: WET, 'stroke-width': 3, fill: 'none', opacity: 0.42, 'stroke-linecap': 'round' }, B);
    }

    // ---- TERRIFYING CEPHALOPOD HEAD (ridged organic cranium, deep scowling brow, 6 fierce glowing eyes, 16 tapered suction-cup tentacles in 3 layers)
    const hd = joint(B, 4, -445); rig.head = hd; const Hc = hd.c;

    // 1. Background layer of 6 dark tentacles (draping behind front beard & over chest)
    const mkTentacle = (parent, spec) => {
      const sh = $('path', { fill: SKIND, opacity: 0.72 }, parent);
      const bodyP = G.reg($('path', { fill: spec.col }, parent), spec.col);
      const hi = $('path', { fill: 'none', stroke: WET, 'stroke-width': spec.w * 0.16, 'stroke-linecap': 'round', opacity: spec.layer === 2 ? 0.58 : 0.28 }, parent);
      const suckers = spec.suck ? Array.from({ length: 5 }, () => $('ellipse', { rx: spec.w * 0.22, ry: spec.w * 0.14, fill: SUCK, opacity: 0.78 }, parent)) : [];
      return Object.assign({ sh, bodyP, hi, suckers }, spec);
    };
    const tentSpecs = [
      // layer 0 (back, 6 wide dark tentacles flaring out)
      { x0: -60, y0: -502, len: 196, w: 22, spread: -1.65, col: SKIND, layer: 0, ph: 0.2, suck: false },
      { x0: -38, y0: -496, len: 214, w: 23, spread: -1.05, col: SKIND, layer: 0, ph: 1.1, suck: false },
      { x0: -14, y0: -494, len: 226, w: 24, spread: -0.35, col: SKIND, layer: 0, ph: 2.0, suck: false },
      { x0: 14, y0: -494, len: 228, w: 24, spread: 0.35, col: SKIND, layer: 0, ph: 2.8, suck: false },
      { x0: 40, y0: -496, len: 214, w: 23, spread: 1.05, col: SKIND, layer: 0, ph: 3.7, suck: false },
      { x0: 64, y0: -502, len: 196, w: 22, spread: 1.65, col: SKIND, layer: 0, ph: 4.6, suck: false },
      // layer 1 (mid, 6 thick muscular tentacles with suction cups)
      { x0: -52, y0: -496, len: 184, w: 23, spread: -1.35, col: SKIN, layer: 1, ph: 0.7, suck: true },
      { x0: -30, y0: -492, len: 204, w: 24, spread: -0.8, col: SKINM, layer: 1, ph: 1.6, suck: true },
      { x0: -10, y0: -490, len: 218, w: 25, spread: -0.22, col: SKIN, layer: 1, ph: 2.4, suck: true },
      { x0: 12, y0: -490, len: 220, w: 25, spread: 0.24, col: SKINM, layer: 1, ph: 3.2, suck: true },
      { x0: 34, y0: -492, len: 202, w: 24, spread: 0.82, col: SKIN, layer: 1, ph: 4.1, suck: true },
      { x0: 56, y0: -496, len: 182, w: 23, spread: 1.38, col: SKINM, layer: 1, ph: 5.0, suck: true },
      // layer 2 (front, 4 prominent curling tentacles with bright wet highlights & suction cups)
      { x0: -38, y0: -490, len: 162, w: 22, spread: -0.95, col: SKINM, layer: 2, ph: 0.4, suck: true },
      { x0: -14, y0: -488, len: 182, w: 24, spread: -0.32, col: SKINL, layer: 2, ph: 1.9, suck: true },
      { x0: 16, y0: -488, len: 184, w: 24, spread: 0.34, col: SKINL, layer: 2, ph: 3.5, suck: true },
      { x0: 42, y0: -490, len: 160, w: 22, spread: 0.98, col: SKINM, layer: 2, ph: 5.2, suck: true },
    ];
    const tentBackG = $('g', {}, Hc);
    rig.tents = tentSpecs.slice(0, 6).map((sp, i) => mkTentacle(tentBackG, Object.assign({ i }, sp)));

    // 2. Bulbous ridged organic cephalopod cranium (NOT a simple ellipse!)
    pathR(Hc, 'M-68 -518 C-82 -554 -76 -602 -36 -626 C-12 -640 24 -640 48 -626 C88 -602 92 -554 78 -518 C72 -494 52 -480 4 -480 C-44 -480 -62 -494 -68 -518 Z', SKIN);
    // cranial mantle lobes & glowing cephalopod grooves
    pathR(Hc, 'M-48 -536 C-56 -578 -36 -616 6 -620 C48 -616 66 -578 58 -536 C36 -548 -26 -548 -48 -536 Z', SKINM, { opacity: 0.78 });
    pathR(Hc, 'M-26 -552 C-28 -588 -12 -612 6 -614 C24 -612 38 -588 34 -552 Z', SKINL, { opacity: 0.42 });
    // deep organic cranial ridges & glistening highlight arcs
    for (const d of [
      'M-46 -598 C-56 -572 -54 -544 -42 -526', 'M-18 -616 C-24 -588 -22 -558 -14 -536',
      'M24 -616 C30 -588 28 -558 20 -536', 'M52 -598 C62 -572 60 -544 48 -526',
    ]) {
      $('path', { d, stroke: SKIND, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.72 }, Hc);
      $('path', { d, stroke: WET, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.36 }, Hc);
    }
    // lateral cheek gill ridges / flanges
    pathR(Hc, 'M-66 -528 C-88 -522 -94 -498 -74 -482 C-66 -496 -60 -510 -56 -522 Z', SKINM);
    pathR(Hc, 'M76 -528 C98 -522 104 -498 84 -482 C76 -496 70 -510 66 -522 Z', SKINM);

    // 3. Heavy scowling overhanging brow ridges & deep shadowed eye sockets
    pathR(Hc, 'M-68 -538 C-40 -554 -14 -542 6 -524 C26 -542 52 -554 78 -538 L70 -504 C44 -512 22 -504 6 -496 C-10 -504 -32 -512 -60 -504 Z', SKIND);
    pathR(Hc, 'M-64 -542 C-38 -558 -12 -548 6 -532 C24 -548 50 -558 74 -542 C48 -536 26 -530 6 -518 C-14 -530 -38 -536 -64 -542 Z', SKINL, { opacity: 0.56 });

    // 4. Mid & Front tentacle layers (10 muscular tapered tentacles emerging from under the facial mantle)
    const tentFrontG = $('g', {}, Hc);
    tentSpecs.slice(6).forEach((sp, k) => rig.tents.push(mkTentacle(tentFrontG, Object.assign({ i: 6 + k }, sp))));

    // 5. Fleshy sculpted cephalopod nose/cheek ridge overlapping tentacle roots for seamless organic anatomy
    pathR(Hc, 'M-64 -506 C-42 -508 -18 -500 6 -492 C30 -500 54 -508 72 -506 C62 -488 38 -480 6 -484 C-26 -480 -54 -488 -64 -506 Z', SKIN);
    pathR(Hc, 'M-48 -502 C-28 -502 -10 -494 6 -486 C22 -494 40 -502 56 -502 C44 -490 26 -486 6 -488 C-14 -486 -34 -490 -48 -502 Z', SKINM, { opacity: 0.78 });
    $('path', { d: 'M-56 -502 Q-26 -494 6 -488 Q38 -494 64 -502', stroke: SKIND, 'stroke-width': 4, fill: 'none', opacity: 0.72 }, Hc);

    // 6. 6 FIERCE GLOWING LOVECRAFTIAN EYES (3 pairs slanted under brow: crisp, chilling, non-washed glow)
    rig.eyes = [];
    const eyeSpecs = [
      [-18, -514, 15, 7.2, -20], [28, -514, 15, 7.2, 20],
      [-40, -522, 10, 5.2, -26], [50, -522, 10, 5.2, 26],
      [-52, -509, 7, 4.0, -14], [62, -509, 7, 4.0, 14],
    ];
    for (const [ex, ey, rx, ry, rot] of eyeSpecs) {
      const gl = $('circle', { cx: ex, cy: ey, r: rx * 1.9, fill: gEyeR, opacity: 0.58 }, Hc);
      const eg = $('g', { transform: `translate(${ex} ${ey}) rotate(${rot})` }, Hc);
      ell(eg, 0, 0, rx * 1.15, ry * 1.25, '#03120c', { opacity: 0.75 });
      const ir = poly(eg, [[-rx, 0], [-rx * 0.3, -ry], [rx * 0.5, -ry * 0.85], [rx, 0], [rx * 0.4, ry], [-rx * 0.4, ry * 0.85]], EMR);
      poly(eg, [[-rx * 0.52, 0], [0, -ry * 0.52], [rx * 0.58, 0], [0, ry * 0.52]], EMRL);
      ell(eg, 0.8, 0, rx * 0.14, ry * 0.76, '#031a0f');
      rig.eyes.push({ gl, ir, rx });
    }

    // ---- FRONT ARM (overlapping chest & wings)
    rig.aR = mkArm(B, 118, -408, false, 1);

    // ---- NEBULOUS EMERALD MIST FORM (for disperse-mist / reform-mist)
    rig.mistG = $('g', { opacity: 0 }, root);
    for (const [mx, my, mr] of [[-95, -390, 120], [80, -450, 130], [0, -320, 150], [-45, -535, 110], [105, -290, 115], [15, -490, 135]]) {
      $('circle', { cx: mx, cy: my, r: mr, fill: gEmr, opacity: 0.55 }, rig.mistG);
    }
    // spectral glowing eyes peeking through mist
    for (const [ex, ey] of [[-18, -514], [28, -514], [-40, -522], [50, -522]]) {
      $('ellipse', { cx: ex, cy: ey, rx: 12, ry: 5, fill: EMRL, opacity: 0.9 }, rig.mistG);
    }

    const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 6, -528); mk('eye', Hc, 8, -516); mk('mouth', Hc, 6, -478); mk('hand', rig.aR.fo.c, 118, -120); mk('body', B, 0, -320);

    rig.N = { bodyY: 0, bodyRot: 0, shakeX: 0, shakeY: 0, sx: 1, sy: 1, head: 0, aL: [-16, -10], aR: [20, 26], lF: [6, 3], lB: [-6, -3], wL: 10, wR: 10, tentA: 1, tentSpread: 0, eyeGlow: 1.1, sink: 0, mist: 0 };

    // helper: build a smooth tapered organic tentacle polygon along a cubic Bezier + update suction cups
    const updateTent = (T, t, tentA, tentSpread) => {
      const ph = t * (2.4 + (T.i % 4) * 0.42) + T.ph;
      const sp = T.spread * (28 + 38 * tentSpread);
      const p0 = [T.x0, T.y0];
      const p1 = [T.x0 + sp * 0.45 + Math.sin(ph) * 20 * tentA, T.y0 + T.len * 0.36];
      const p2 = [T.x0 + sp * 0.92 + Math.cos(ph * 1.15) * 32 * tentA, T.y0 + T.len * 0.72];
      const p3 = [T.x0 + sp * 1.15 + Math.sin(ph * 1.35 + 1.2) * 44 * tentA, T.y0 + T.len - Math.abs(T.spread) * 10];
      const N = 8, L = [], R = [], mid = [];
      const bz = (u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
      for (let k = 0; k <= N; k++) mid.push(bz(k / N));
      for (let k = 0; k <= N; k++) {
        const a = mid[Math.max(0, k - 1)], b = mid[Math.min(N, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1;
        const nx = -dy / ln, ny = dx / ln, u = k / N, rootTap = k === 0 ? 0.74 : 1.0, hw = T.w * 0.5 * rootTap * Math.pow(1 - u * 0.88, 0.82);
        L.push([mid[k][0] + nx * hw, mid[k][1] + ny * hw]);
        R.push([mid[k][0] - nx * hw, mid[k][1] - ny * hw]);
      }
      const polyD = 'M' + Pstr(L) + ' L' + Pstr(R.reverse()) + ' Z';
      T.bodyP.setAttribute('d', polyD);
      T.sh.setAttribute('d', polyD);
      T.sh.setAttribute('transform', 'translate(3 4)');
      T.hi.setAttribute('d', `M${f2(p0[0])} ${f2(p0[1])} C${f2(p1[0])} ${f2(p1[1])} ${f2(p2[0])} ${f2(p2[1])} ${f2(p3[0])} ${f2(p3[1])}`);
      if (T.suckers.length) {
        T.suckers.forEach((s, idx) => {
          const u = 0.24 + idx * 0.14, q = bz(u), sc = 1 - u * 0.65;
          s.setAttribute('cx', f2(q[0] + (T.spread < 0 ? 4 : -4) * sc));
          s.setAttribute('cy', f2(q[1]));
          s.setAttribute('rx', f2(T.w * 0.22 * sc));
          s.setAttribute('ry', f2(T.w * 0.14 * sc));
        });
      }
    };

    rig.apply = (P, t) => {
      const vis = clamp(1 - P.mist * 0.92);
      body.g.setAttribute('opacity', f2(vis));
      rig.mistG.setAttribute('opacity', f2(clamp(P.mist * 1.15)));
      rig.mistG.setAttribute('transform', `scale(${f2(1 + P.mist * 0.55)}) translate(0,${f2(-P.mist * 30)})`);
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY + P.sink * 720);
      for (const [L, a] of [[rig.lF, P.lF], [rig.lB, P.lB]]) { L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      for (const [A, a] of [[rig.aL, P.aL], [rig.aR, P.aR]]) { A.up.set(-a[0]); A.fo.set(-(a[1] - a[0])); }
      const orbA = clamp((P.eyeGlow - 1.45) * 0.9) * (0.75 + 0.25 * Math.sin(t * 22));
      rig.aR.orb.setAttribute('opacity', f2(orbA)); rig.aR.orb.setAttribute('r', f2(32 + 24 * orbA));
      rig.aL.orb.setAttribute('opacity', f2(orbA * 0.75));
      rig.wB.set(-P.wL + 3 * Math.sin(t * 1.6)); rig.wF.set(P.wR + 3 * Math.sin(t * 1.6 + 0.4));
      hd.set(P.head + 1.3 * Math.sin(t * 1.2));
      rig.chestVeins.setAttribute('opacity', f2(clamp(0.35 + 0.35 * P.eyeGlow * (0.8 + 0.2 * Math.sin(t * 6)))));
      rig.eyes.forEach((E) => { E.gl.setAttribute('r', f2(E.rx * (1.35 + 0.72 * P.eyeGlow))); E.gl.setAttribute('opacity', f2(clamp(0.28 + 0.34 * P.eyeGlow))); });
      rig.tents.forEach((T) => updateTent(T, t, P.tentA, P.tentSpread));
    };
    return rig;
  }
  const CTHULHU = {
    idle: (c) => ({ bodyY: 5 * Math.sin(c.t * 1.7), head: 2 * Math.sin(c.t * 1.1), wL: 12 + 4 * Math.sin(c.t * 1.4), wR: 12 + 4 * Math.sin(c.t * 1.4), aL: [-18, -10], aR: [22, 28], eyeGlow: 1.15 }),
    'idle-card': (c) => ({ bodyY: 4 * Math.sin(c.t * 1.8), wL: 24, wR: 24, tentA: 1.4, eyeGlow: 1.55 }),
    rise: (c) => { const e = EASE.outCubic(clamp(c.u)); return { sink: 1 - e, wL: 34 * e, wR: 34 * e, tentA: 1.5, eyeGlow: 1.4 + 0.55 * e }; },
    'land-hero': (c) => KO(c.u, [[0, { sink: 0.7, wL: 45, wR: 45, aL: [70, 90], aR: [80, 100], eyeGlow: 1.85 }], [0.5, { sink: 0, bodyY: 40, bodyRot: 8, wL: 30, wR: 30, aL: [65, 110], aR: [85, 120], eyeGlow: 2.05 }], [1, { sink: 0, bodyY: 0, bodyRot: 0, wL: 16, wR: 16, eyeGlow: 1.3 }]], 'inOut'),
    block: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.16)); return { bodyRot: -8 * e, bodyY: 12 * e, aL: [80 * e, 120 * e], aR: [95 * e, 130 * e], wL: 26 * e, wR: 26 * e, eyeGlow: 1.75, shakeX: 3 * e * Math.sin(c.lt * 45) }; },
    'wave-sweep': (c) => KO(c.u, [[0, { bodyRot: -12, aR: [-40, -20], wL: 20, wR: 20 }], [0.48, { bodyRot: 14, aR: [125, 145], aL: [-40, -20], wL: 35, wR: 35, eyeGlow: 1.7 }], [1, { bodyRot: 4, aR: [40, 45], eyeGlow: 1.2 }]], 'inOut'),
    'claw-slash': (c) => KO(c.u, [[0, { bodyRot: -14, aR: [165, 185], aL: [-40, -20], eyeGlow: 1.6 }], [0.46, { bodyRot: 16, aR: [45, 25], aL: [60, 80], eyeGlow: 2.0, shakeX: 5 }], [1, { bodyRot: 4, aR: [25, 30], eyeGlow: 1.2 }]], 'inOut'),
    'wing-surge': (c) => { const e = EASE.outCubic(clamp(c.u)); return { bodyRot: -8 * e, bodyY: -24 * e, wL: 62 * e, wR: 62 * e, aL: [-70 * e, -40], aR: [70 * e, 40], tentA: 2.0, eyeGlow: 2.05 }; },
    'psychic-cast': (c) => { const e = env(c.lt, 0.25); return { bodyRot: 8 * e, head: 6 * e, aL: [75 * e, 95 * e], aR: [95 * e, 115 * e], tentA: 2.2, tentSpread: 1.35 * e, eyeGlow: 2.25, shakeX: 2.5 * e * Math.sin(c.lt * 42) }; },
    stagger: (c) => { const e = EASE.outCubic(clamp(c.lt / 0.18)) * (1 - 0.5 * clamp((c.lt - 0.3) / 0.6)); return { bodyRot: -16 * e, head: -12 * e, aL: [-50 * e, -20], aR: [50 * e, 20], eyeGlow: 0.7, shakeX: 5 * e * Math.sin(c.lt * 55) }; },
    strangled: (c) => { const tr = Math.sin(c.lt * 28); return { bodyRot: -5, head: -16 + 4 * tr, aL: [-80 + 6 * tr, -90], aR: [130 + 6 * tr, 145], tentA: 2.4, eyeGlow: 1.2 + 0.4 * tr, shakeX: 3 * tr }; },
    'disperse-mist': (c) => { const e = EASE.outCubic(clamp(c.u)); return { mist: e, sx: 1 + 0.25 * e, sy: 1 + 0.15 * e, eyeGlow: 1.8 * (1 - e), shakeX: 6 * (1 - e) * Math.sin(c.lt * 60) }; },
    'reform-mist': (c) => { const e = EASE.outCubic(clamp(c.u)); return { mist: 1 - e, wL: 40 * e, wR: 40 * e, tentA: 2.0, eyeGlow: 0.8 + 1.45 * e }; },
    'power-up': (c) => { const e = env(c.lt, 0.25); return { bodyY: -18 * e, wL: 48 * e, wR: 48 * e, aL: [-50 * e, -20], aR: [50 * e, 20], tentA: 2.0, tentSpread: 1.2 * e, eyeGlow: 2.35, shakeX: 2.5 * e * Math.sin(c.lt * 48) }; },
    'psychic-gaze': (c) => { const e = env(c.lt, 0.2); return { head: 4 * e, tentA: 2.4, tentSpread: 1.45 * e, eyeGlow: 2.55 }; },
    'monolith-crush': (c) => KO(c.u, [[0, { bodyRot: -10, aL: [140, 155], aR: [150, 165], wL: 45, wR: 45, eyeGlow: 1.85 }], [0.5, { bodyRot: 14, aL: [65, 85], aR: [75, 95], eyeGlow: 2.25, shakeX: 5 }], [1, { bodyRot: 4, aR: [30, 35], eyeGlow: 1.4 }]], 'inOut'),
    'beam-charge': (c) => { const e = EASE.outCubic(clamp(c.u)); return { bodyRot: -6 * e, aL: [95 * e, 120 * e], aR: [105 * e, 130 * e], wL: 48 * e, wR: 48 * e, tentA: 2.2, tentSpread: 1.55 * e, eyeGlow: 1.5 + 1.25 * e, shakeX: 3 * e * Math.sin(c.lt * 52) }; },
    talk: (c) => { const a = c.amp || 0; return { bodyY: 4 * Math.sin(c.t * 1.8), head: 2 * Math.sin(c.t * 1.2) - 2 * a, tentA: 1.2 + 1.4 * a, tentSpread: 0.75 * a, wL: 14 + 8 * a, wR: 14 + 8 * a, eyeGlow: 1.25 + 0.65 * a }; },
  };
  CTHULHU.fade = CTHULHU.idle;

  // ================================================================== FISHERMAN (deep-sea trawler sailor: yellow oilskin slicker raincoat, sou'wester hat, weathered beard, rubber boots, bright lantern/flashlight)
  function buildFisherman() {
    const rig = newRig();
    const root = $('g'); rig.root = root; rig.mk = {};
    const COAT = rgb(214, 158, 36), COATD = rgb(146, 102, 20), COATL = rgb(246, 202, 76);
    const NAVY = rgb(26, 40, 56), BOOT = rgb(20, 24, 30), SKIN = rgb(218, 172, 138), BEARD = rgb(72, 54, 42);
    const body = joint(root, 0, -145); rig.body = body; const B = body.c;
    // legs + rubber storm boots
    const mkLeg = (hx, dark) => {
      const th = joint(B, hx, -135); limb(th.c, [hx, -135], [hx, -68], 34, 28, dark ? BOOT : NAVY);
      const sh = joint(th.c, hx, -68); limb(sh.c, [hx, -68], [hx, -14], 28, 24, BOOT);
      poly(sh.c, [[hx - 14, -22], [hx + 16, -22], [hx + 34, -4], [hx + 34, 4], [hx - 16, 4]], BOOT);
      return { th, sh };
    };
    rig.lB = mkLeg(-18, true); rig.lF = mkLeg(18, false);
    // back arm
    const mkArm = (sx, sy, dark, hasLamp) => {
      const up = joint(B, sx, sy); limb(up.c, [sx, sy], [sx, sy + 68], 30, 26, dark ? COATD : COAT);
      const fo = joint(up.c, sx, sy + 66); limb(fo.c, [sx, sy + 66], [sx, sy + 126], 24, 20, dark ? COATD : COAT);
      ell(fo.c, sx, sy + 132, 12, 12, SKIN);
      let beam = null;
      if (hasLamp) {
        poly(fo.c, [[sx - 6, sy + 126], [sx + 34, sy + 120], [sx + 34, sy + 144], [sx - 6, sy + 138]], rgb(52, 62, 74));
        ell(fo.c, sx + 36, sy + 132, 5, 11, '#fff3b0');
        beam = $('polygon', { points: `${sx + 36},${sy + 122} ${sx + 340},${sy + 48} ${sx + 340},${sy + 216} ${sx + 36},${sy + 142}`, fill: 'url(#gBeam)', opacity: 0.48 }, fo.c);
      }
      return { up, fo, beam };
    };
    rig.aL = mkArm(-44, -242, true, false);
    // oilskin raincoat torso + high storm collar + reflective stripes
    poly(B, [[-48, -252], [48, -252], [60, -112], [-60, -112]], COAT);
    poly(B, [[-48, -252], [-10, -252], [-18, -112], [-60, -112]], COATD, { opacity: 0.5 });
    poly(B, [[22, -252], [48, -252], [58, -112], [32, -112]], COATL, { opacity: 0.42 });
    poly(B, [[-56, -148], [56, -148], [58, -138], [-58, -138]], '#e8eef4', { opacity: 0.72 }); // reflective safety band
    poly(B, [[-26, -264], [26, -264], [34, -240], [-34, -240]], COATD); // storm collar
    // head + bearded sailor face + sou'wester hat
    const hd = joint(B, 0, -258); rig.head = hd; const Hc = hd.c;
    ell(Hc, 4, -298, 28, 34, SKIN);
    poly(Hc, [[-22, -296], [30, -296], [26, -268], [6, -258], [-18, -270]], BEARD);
    rig.mouth = ell(Hc, 12, -282, 8, 3, '#3a1414');
    ell(Hc, 14, -304, 4, 4.5, '#141820'); ell(Hc, -4, -304, 3.5, 4, '#141820');
    // sou'wester rain hat (wide sloping back brim)
    poly(Hc, [[-48, -310], [-18, -338], [28, -336], [42, -314], [18, -316], [-34, -300]], COAT);
    poly(Hc, [[-48, -310], [-18, -338], [6, -337], [-12, -308]], COATD, { opacity: 0.6 });
    rig.aR = mkArm(44, -242, false, true);
    const mk = (n, p, x, y) => { rig.mk[n] = $('circle', { cx: x, cy: y, r: 1, fill: 'none' }, p); };
    mk('head', Hc, 4, -298); mk('eye', Hc, 12, -304); mk('mouth', Hc, 12, -282); mk('body', B, 0, -185);
    rig.N = { bodyY: 0, bodyRot: 0, shakeX: 0, head: 0, aL: [-12, -8], aR: [28, 52], lF: [4, 2], lB: [-4, -2], mouth: 0, beam: 1 };
    rig.apply = (P, t) => {
      body.set(P.bodyRot, 1, 1, P.shakeX, P.bodyY);
      for (const [L, a] of [[rig.lF, P.lF], [rig.lB, P.lB]]) { L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      for (const [A, a] of [[rig.aL, P.aL], [rig.aR, P.aR]]) { A.up.set(-a[0]); A.fo.set(-(a[1] - a[0])); }
      hd.set(P.head + Math.sin(t * 1.8));
      rig.mouth.setAttribute('ry', f2(2.5 + clamp(P.mouth) * 8));
      if (rig.aR.beam) rig.aR.beam.setAttribute('opacity', f2(clamp(P.beam) * (0.42 + 0.1 * Math.sin(t * 17))));
    };
    return rig;
  }
  const FISHERMAN = {
    idle: (c) => ({ bodyY: 3 * Math.sin(c.t * 2.2), head: 2 * Math.sin(c.t * 1.4), aL: [-12, -6], aR: [24, 34] }),
    haul: (c) => { const w = Math.sin(c.t * 4.2); return { bodyRot: -6 + 10 * w, bodyY: 4 * Math.abs(w), aL: [44 + 18 * w, 72 + 16 * w], aR: [36 + 16 * w, 46 + 12 * w], lF: [12, 8], lB: [-12, -8], beam: 0.35 }; },
    'idle-scared': (c) => ({ bodyRot: -6, head: -14, aL: [-24, -10], aR: [32, 34], mouth: 0.45, shakeX: 2.2 * Math.sin(c.t * 26) }),
    run: (c) => { const sp = c.p.speed || 2.5, f = 2 * Math.PI * sp * c.lt; return { bodyY: 5 * Math.abs(Math.sin(f)) - 6, bodyRot: 12, head: 6, lF: legPh(f, 8, 48, 54), lB: legPh(f + Math.PI, 8, 48, 54), aL: [-44 * Math.sin(f), -66 * Math.sin(f)], aR: [24 * Math.sin(f) + 18, 30 * Math.sin(f) + 22], mouth: 0.4 }; },
    cower: (c) => ({ bodyY: 58, bodyRot: 24, head: 18, aL: [85, 130], aR: [75, 105], lF: [64, -18], lB: [48, -28], shakeX: 2.8 * Math.sin(c.t * 32), beam: 0.35 }),
    peek: (c) => ({ bodyY: 22, bodyRot: 10, head: -10, aL: [12, 24], aR: [30, 36], beam: 0.9 }),
    talk: (c) => { const a = c.amp || 0; return { bodyY: 2 * Math.sin(c.t * 2), head: -4 - 2 * a, mouth: 0.1 + 0.8 * a, aL: [-10, -4], aR: [28, 34], beam: 0.95 }; },
  };
  FISHERMAN.fade = FISHERMAN.idle;

  const ACTIONS = { grim: GRIM, vry: VRY, kid: KID, fisherman: FISHERMAN, cerberus: CERB, bec: BEC, apep: APEP, thor: THOR, typhon: TYPHON, cthulhu: CTHULHU };
  const RIGS = { grim: buildGrim, vry: buildVry, kid: buildKid, fisherman: buildFisherman, cerberus: buildCerberus, bec: buildBec, apep: buildApep, thor: buildThor, typhon: buildTyphon, cthulhu: buildCthulhu };
  Object.assign(G, { ACTIONS, RIGS });
})(window);
