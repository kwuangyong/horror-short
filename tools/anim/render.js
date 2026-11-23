#!/usr/bin/env node
// render.js - deterministic frame renderer: Playwright Chromium -> JPEG/PNG frames -> ffmpeg mp4.
// node tools/anim/render.js --timeline tl.json --out out.mp4 [--audio mix.wav] [--scale 1] [--workers 4]
//      [--fps 30] [--png] [--dump 1.5,4,7.2 --dump-dir dir]   (dump = only write those frames, no video)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
(async () => {
  const tlPath = arg('timeline'); if (!tlPath) { console.error('usage: render.js --timeline tl.json --out out.mp4'); process.exit(1); }
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  const fps = +arg('fps', tl.fps || 30), scale = +arg('scale', 1), workers = +arg('workers', 4), png = !!arg('png', false);
  const total = Math.round((tl.duration) * fps), out = arg('out', 'out.mp4');
  const dump = arg('dump', null), tmp = path.resolve(arg('dump-dir', fs.mkdtempSync(path.join(require('os').tmpdir(), 'anim-'))));
  fs.mkdirSync(tmp, { recursive: true });
  const jobs = dump ? String(dump).split(',').map((s) => ({ t: +s, name: 'd_' + (+s).toFixed(2) })) : Array.from({ length: total }, (_, i) => ({ t: i / fps, name: 'f' + String(i).padStart(5, '0') }));
  const ext = png || dump ? 'png' : 'jpg', url = 'file://' + path.join(__dirname, 'index.html');
  const browser = await chromium.launch(); const t0 = Date.now();
  const run = async (w) => {
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
    const page = await ctx.newPage(); page.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); });
    await page.goto(url); await page.evaluate((x) => window.loadTimeline(x), tl);
    for (let i = w; i < jobs.length; i += workers) {
      await page.evaluate((t) => window.renderFrame(t), jobs[i].t);
      await page.screenshot(Object.assign({ path: path.join(tmp, jobs[i].name + '.' + ext) }, ext === 'jpg' ? { type: 'jpeg', quality: 93 } : { type: 'png' }));
    }
    await ctx.close();
  };
  await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, (_, w) => run(w)));
  await browser.close();
  const secs = (Date.now() - t0) / 1000;
  console.log(`rendered ${jobs.length} frames in ${secs.toFixed(1)} s = ${(secs / jobs.length * 1000).toFixed(0)} ms/frame (workers=${workers}, scale=${scale})`);
  if (dump) { console.log('dumped to ' + tmp); return; }
  const a = ['-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%05d.' + ext)];
  const au = arg('audio', null); if (au) a.push('-i', au);
  a.push('-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(arg('crf', 20)), '-r', String(fps));
  if (au) a.push('-c:a', 'aac', '-b:a', '160k', '-shortest'); a.push('-movflags', '+faststart', out);
  const r = spawnSync('ffmpeg', a, { stdio: 'inherit' }); if (r.status) process.exit(r.status);
  if (!arg('keep-frames', false)) fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote ' + out);
})();
