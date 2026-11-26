#!/usr/bin/env node
// validate.js - checks an episode timeline against the Battle Spin rules (docs/07). Run before every full render.
//   node tools/anim/validate.js episodes/<slug>/anim/timeline.json [--script episodes/<slug>/script-anim.md] [--strict]
// Prints PASS / WARN / FAIL lines. Exit code 1 if any FAIL (or any WARN with --strict).
// FAIL = breaks a hard rule (HUD, ROUND, no split-roll intros, 180 sides missing, kid on the 1v1 battlefield, intro pillar too long...).
// WARN = outside the target range (duration, shot count, push/pan, fx variety, word count...). Boss decides at Gate 3.
const fs = require('fs');
const argv = process.argv.slice(2), tlPath = argv.find((a) => !a.startsWith('--') && a.endsWith('.json'));
const opt = (k) => { const i = argv.indexOf('--' + k); return i < 0 ? null : argv[i + 1]; };
if (!tlPath) { console.error('usage: validate.js timeline.json [--script script-anim.md] [--strict]'); process.exit(2); }
const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
const out = { PASS: [], WARN: [], FAIL: [] }, R = (lvl, msg) => out[lvl].push(msg);
const shots = (tl.shots || []).slice().sort((a, b) => a.t - b.t), splits = tl.splits || (tl.split ? [tl.split] : []);
const texts = tl.text || [], fx = tl.fx || [], D = tl.duration;
const inW = (w, t) => (w || []).some((x) => t >= x[0] && t < x[1]);

// ---- 1. engine / forbidden elements
if (tl.hud) R('FAIL', 'timeline has a `hud` (HP bars are forbidden)'); else R('PASS', 'no HUD / HP bars');
const round = texts.filter((x) => /\bROUND\b/i.test(x.text)); round.length ? R('FAIL', `ROUND text found at ${round.map((x) => x.t0.toFixed(1)).join(', ')}`) : R('PASS', 'no ROUND cards');
// ---- 2. duration / shots / tempo
(D >= 85 && D <= 100) ? R('PASS', `duration ${D.toFixed(1)} s (85-100)`) : R('WARN', `duration ${D.toFixed(1)} s outside 85-100`);
const placeholders = shots.filter((s) => splits.some((p) => s.t >= (p.t0 || 0) - 0.01 && s.t < Math.min(p.end, p.shatter) - 0.05));
const realShots = shots.length - placeholders.length;
(realShots >= 50 && realShots <= 60) ? R('PASS', `${realShots} shots (+${placeholders.length} under split-roll)`) : R('WARN', `${realShots} shots outside 50-60 (+${placeholders.length} under split-roll)`);
const lens = shots.map((s, i) => (i + 1 < shots.length ? shots[i + 1].t : D) - s.t), longs = shots.filter((s, i) => lens[i] > 3.2 && !placeholders.includes(s));
longs.length ? R('WARN', `shots longer than 3.2 s at ${longs.map((s) => s.t.toFixed(1)).join(', ')}`) : R('PASS', 'no shot longer than 3.2 s');
const still = shots.filter((s) => !placeholders.includes(s) && !['pov', 'povgate'].includes(s.type) && !(s.push && s.push !== 1) && !s.pan && !s.follow && s.type !== 'follow');
still.length ? R('WARN', `${still.length} shot(s) without push/pan (no static frames): ${still.map((s) => s.t.toFixed(1)).join(', ')}`) : R('PASS', 'every shot has push/pan');
// ---- 3. opening: hook, split-roll with 2 dives + emerges, VS
const hook = texts.find((x) => /WHO SURVIVES/i.test(x.text) && x.t0 < 3.5);
hook ? R('PASS', `hook text "WHO SURVIVES?" at ${hook.t0.toFixed(1)} s`) : R('FAIL', 'no "WHO SURVIVES?" text in the first 3.5 s');
(tl.glitch || []).some((g) => g[0] < 4) ? R('PASS', 'rewind glitch after the hook') : R('WARN', 'no rewind `glitch` in the first 4 s');
const dives = splits.filter((s) => s.dive), emerges = splits.filter((s) => s.emerge);
(splits.length >= 3 && dives.some((s) => s.dive.side === 'L') && dives.some((s) => s.dive.side === 'R') && emerges.length >= 2)
  ? R('PASS', `split-roll: ${splits.length} instances, dive L + dive R, ${emerges.length} emerges`)
  : R('FAIL', `split-roll intro flow incomplete (need 3 instances: dive L, emerge+dive R, emerge+VS; found ${splits.length} instances, ${dives.length} dives, ${emerges.length} emerges)`);
const vs = texts.find((x) => /^VS$/i.test(String(x.text).trim())), cta = texts.find((x) => /WHO WINS/i.test(x.text));
(vs && cta) ? R('PASS', `VS + "WHO WINS? COMMENT" at ${vs.t0.toFixed(1)} s`) : R('FAIL', 'missing VS and/or "WHO WINS? COMMENT" text');
// intro windows = from the end of each dive to the start of the next emerge
const introW = []; for (let i = 0; i < splits.length - 1; i++) if (splits[i].dive && splits[i + 1].emerge) introW.push([splits[i].dive.t1, splits[i + 1].emerge.t0]);
introW.forEach((w, i) => { const len = w[1] - w[0]; (len >= 4 && len <= 7.5) ? R('PASS', `intro ${i ? 'GUARDIAN' : 'MONSTER'} ${len.toFixed(1)} s`) : R('WARN', `intro ${i ? 'GUARDIAN' : 'MONSTER'} ${len.toFixed(1)} s (target ~5-6.5 s)`);
  const sc = shots.filter((s) => s.t >= w[0] - 0.05 && s.t < w[1]); const types = sc.map((s) => s.type);
  (sc.length >= 2 && types.includes('low') && (types.includes('cu') || types.includes('ecu'))) ? R('PASS', `intro ${i ? 'GUARDIAN' : 'MONSTER'} cameras: ${types.join(' > ')}`) : R('WARN', `intro ${i ? 'GUARDIAN' : 'MONSTER'} needs 2-3 moving angles low > cu > ecu (has ${types.join(', ') || 'none'})`);
  const pil = fx.filter((f) => f.type === 'pillar' && f.t0 >= w[0] - 0.1 && f.t0 < w[1]); pil.forEach((p) => ((p.dur || 0.75) <= 0.85 ? R('PASS', `intro pillar ${(p.dur || 0.75).toFixed(2)} s`) : R('FAIL', `intro pillar too long (${p.dur} s > 0.85 s, would cover the face)`))); });
// ---- 4. 180 rule + battlefield
tl.sides && tl.sides.left && tl.sides.right ? R('PASS', `sides: monster LEFT = ${tl.sides.left}, guardian RIGHT = ${tl.sides.right} (run render.js --check too)`) : R('FAIL', '`sides:{left,right}` missing (180-degree rule)');
const storyT = splits.length ? Math.max(...splits.map((s) => Math.min(s.end, s.shatter))) : 0;
const storyScenes = new Set(shots.filter((s) => s.t >= storyT && s.scene).map((s) => s.scene));
R(storyScenes.size <= 3 ? 'PASS' : 'WARN', `story scenes after ${storyT.toFixed(1)} s: ${[...storyScenes].join(', ') || '(inherited)'} (one battlefield; extra scenes only for opening/cliffhanger)`);
// ---- 5. sakuga fx
const need = ['beam', 'beam-clash', 'orbs', 'slash', 'pillar']; const have = need.filter((k) => fx.some((f) => f.type === k && f.t0 >= storyT));
have.length === need.length ? R('PASS', `story fx: ${have.join(', ')}`) : R('WARN', `story fx missing: ${need.filter((k) => !have.includes(k)).join(', ')}`);
(tl.cinema || []).some((w) => w[0] >= storyT) ? R('PASS', 'letterbox (cinema) in action scenes') : R('WARN', 'no `cinema` letterbox in the story');
(tl.embers || []).some((w) => w[0] >= storyT) ? R('PASS', 'embers in action scenes') : R('WARN', 'no `embers` in the story');
shots.some((s) => s.slow && s.crash && s.t >= storyT) || (shots.some((s) => s.slow && s.t >= storyT) && shots.some((s) => s.crash && s.t >= storyT)) ? R('PASS', 'finishing blow has slow-mo + crash-zoom') : R('WARN', 'no slow-mo + crash-zoom in the story');
shots.filter((s) => s.t >= storyT && s.tr && s.tr.type === 'whip').length >= 4 ? R('PASS', 'whip-pans between sides') : R('WARN', 'fewer than 4 whip-pan transitions in the story');
// ---- 6. THE KID: hidden during the 1v1 except short hiding-spot inserts
const kidName = Object.keys(tl.actors || {}).find((k) => tl.actors[k].kind === 'kid');
const fight = fx.filter((f) => f.t0 >= storyT && ['beam', 'beam-clash', 'orbs', 'slash'].includes(f.type)).map((f) => f.t0);
if (kidName && fight.length) {
  const vis = tl.actors[kidName].vis, w1 = Math.max(...fight); let w0 = Math.min(...fight);
  if (vis) { let t = storyT; while (t < w1 && !inW(vis, t)) t += 0.05; while (t < w1 && inW(vis, t)) t += 0.05; w0 = Math.max(w0, t); }   // the 1v1 starts when the kid has run off-frame (after the first block)
  if (!vis) R('FAIL', `kid "${kidName}" has no \`vis\` windows: must be hidden during the 1v1 (${w0.toFixed(1)}-${w1.toFixed(1)} s)`);
  else { const segs = []; let cur = null; for (let t = w0; t <= w1; t += 0.05) { const on = inW(vis, t); if (on && !cur) cur = [t, t]; if (on) cur[1] = t; if (!on && cur) { segs.push(cur); cur = null; } } if (cur) segs.push(cur);
    const bad = segs.filter((s) => s[1] - s[0] > 3.0);
    bad.length ? R('FAIL', `kid visible on the battlefield too long: ${bad.map((s) => s[0].toFixed(1) + '-' + s[1].toFixed(1)).join(', ')} (only short hiding-spot inserts allowed)`) : R('PASS', `kid hidden during the 1v1 (${segs.length} short hiding-spot appearance(s))`); }
} else R('WARN', 'could not find a kid actor or 1v1 fx window');
// ---- 7. script checks (optional)
const sp = opt('script');
if (sp && fs.existsSync(sp)) {
  const s = fs.readFileSync(sp, 'utf8'), lines = s.split('\n').filter((l) => l.startsWith('>'));
  const words = lines.join(' ').replace(/\([^)]*\)/g, ' ').replace(/[>*]/g, ' ').split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  (words >= 200 && words <= 245) ? R('PASS', `script ${words} words (200-240)`) : R('WARN', `script ${words} words (target 200-240)`);
  const multiKw = lines.filter((l) => (l.match(/\*[^*]+\*/g) || []).length > 1); multiKw.length ? R('WARN', `${multiKw.length} line(s) with more than one *keyword*`) : R('PASS', 'max one *keyword* per line');
  const voices = new Set((s.match(/\((\w+)'s voice/gi) || []).map((x) => x.toLowerCase())); voices.size >= 2 ? R('PASS', `character voices: ${[...voices].join(', ')}`) : R('WARN', 'fewer than 2 character voices in the script');
  /\(story\)|câu chuyện/i.test(s) ? R('PASS', 'invented details flagged "(story)"') : R('WARN', 'no "(story)" flag: make sure every invented detail is marked');
}
for (const k of ['FAIL', 'WARN', 'PASS']) out[k].forEach((m) => console.log(k.padEnd(4), m));
console.log(`\n${out.FAIL.length} FAIL · ${out.WARN.length} WARN · ${out.PASS.length} PASS`);
process.exit(out.FAIL.length || (argv.includes('--strict') && out.WARN.length) ? 1 : 0);
