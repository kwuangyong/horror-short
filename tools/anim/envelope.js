#!/usr/bin/env node
// envelope.js - amplitude envelope of a voice wav -> JSON for `voices` (drives the `talk` action's jaw/mouth).
//   node tools/anim/envelope.js voice_dark.wav out.json [--fps 30] [--from 0] [--to 99]   then in the timeline:
//   voices: { grim: <contents of out.json> }   and cue params: { voice: 'grim' }
// (no wav? give word intervals instead: voices: { grim: { words: [[start,end], ...] } } e.g. from words.json)
const { spawnSync } = require('child_process'), fs = require('fs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : +process.argv[i + 1]; };
const [wav, out] = process.argv.slice(2); if (!wav || !out) { console.error('usage: envelope.js in.wav out.json [--fps 30]'); process.exit(1); }
const fps = arg('fps', 30), sr = 16000, from = arg('from', 0), to = arg('to', 1e9);
const r = spawnSync('ffmpeg', ['-v', 'error', '-i', wav, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
const buf = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4)), win = Math.floor(sr / fps), v = [];
for (let i = 0; i + win <= buf.length; i += win) { let s = 0; for (let k = 0; k < win; k++) s += buf[i + k] * buf[i + k]; const t = i / sr; v.push(t < from || t > to ? 0 : Math.sqrt(s / win)); }
const mx = Math.max(...v) || 1, sm = v.map((x, i) => Math.min(1, (0.6 * x + 0.2 * (v[i - 1] || x) + 0.2 * (v[i + 1] || x)) / (0.55 * mx)));
fs.writeFileSync(out, JSON.stringify({ fps, v: sm.map((x) => Math.round(x * 100) / 100) })); console.log('envelope', sm.length, 'frames ->', out);
