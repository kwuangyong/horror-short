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
    const leg = (hx, hy, col, w) => {
      const th = joint(B, hx, hy); if (col === CF) limb(th.c, [hx - 4, hy - 3], [hx - 4, hy + 79], w, w * 0.78, CRIM); limb(th.c, [hx, hy], [hx, hy + 82], w, w * 0.78, col);
      const sh = joint(th.c, hx, hy + 82); if (col === CF) limb(sh.c, [hx - 3, hy + 80], [hx - 3, hy + 160], w * 0.78, w * 0.58, CRIM); limb(sh.c, [hx, hy + 82], [hx, hy + 164], w * 0.78, w * 0.58, col); ell(sh.c, hx + 16, hy + 170, 42, 17, col);
      return { th, sh };
    };
    rig.FF = leg(120, -146, CFAR, 74); rig.RF = leg(-120, -150, CFAR, 74);
    ell(B, 0, -212, 206, 112, CRIM); ell(B, 0, -200, 202, 108, CF); ell(B, 138, -228, 98, 108, CRIM); ell(B, 138, -216, 96, 104, CF); ell(B, -130, -200, 100, 110, CF);
    rig.spikes = spikeRow(B, 0, -208, 206, 112, 196, 340, 12, 30, mixc2(CF, CRIM, 0.45), 21).concat(spikeRow(B, 0, -208, 206, 112, 200, 336, 12, 18, CFD, 29));
    rig.RN = leg(-120, -150, CF, 74); rig.FN = leg(120, -146, CF, 74);
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
    mk('head', rig.heads[1].hj.c, 372, -318); mk('head0', rig.heads[0].hj.c, 262, -418); mk('head2', rig.heads[2].hj.c, 318, -226); mk('body', B, 0, -200);
    rig.root = root;
    const A3 = (a, b, c) => [a, b, c];
    rig.N = { bodyY: 0, bodyRot: 0, tail1: 0, tail2: 0, hackle: 1, FN: [4, -4], FF: [4, -4], RN: [8, -10], RF: [8, -10], hrot: A3(0, 0, 0), jaw: A3(0.06, 0.06, 0.06), eyeO: A3(1, 1, 1), anger: A3(0, 0, 0), ear: A3(0, 0, 0), sleepy: A3(0, 0, 0), glow: 1, shakeX: 0, shakeY: 0, sx: 1, sy: 1 };
    const hinge = [30, 30];
    rig.apply = (P, t) => {
      body.set(P.bodyRot, P.sx, P.sy, P.shakeX, P.bodyY + P.shakeY);
      tail.set(-P.tail1 + 5 * Math.sin(t * 1.5), 1, 1); tip.set(-P.tail2 + 8 * Math.sin(t * 2.1 + 1), 1, 1);
      for (const k of ['FN', 'FF', 'RN', 'RF']) { const L = rig[k], a = P[k]; L.th.set(-a[0]); L.sh.set(-(a[1] - a[0])); }
      rig.spikes.forEach((sp, i) => sp.set(sp.base + 2.5 * Math.sin(t * 8 + i) * (P.hackle > 1.2 ? 1.5 : 0.3), 1, P.hackle));
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
  KID.idle = KID['idle-scared'];
  const ACTIONS = { grim: GRIM, vry: VRY, kid: KID, cerberus: CERB, bec: BEC };
  const RIGS = { grim: buildGrim, vry: buildVry, kid: buildKid, cerberus: buildCerberus, bec: buildBec };
  Object.assign(G, { ACTIONS, RIGS });
})(window);
