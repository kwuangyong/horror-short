// debug helper: node markers.js timeline.json "t:actor:marker,..."   -> world positions of rig markers
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const tl = JSON.parse(fs.readFileSync(process.argv[2])); const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.goto('file://' + path.resolve(__dirname, '../../../tools/anim/index.html')); await pg.evaluate((x) => window.loadTimeline(x), tl);
  for (const q of process.argv[3].split(',')) { const [t, a, m] = q.split(':'); const r = await pg.evaluate(([t, a, m]) => window.markerAt(+t, a, m), [t, a, m]); console.log(q, r && Math.round(r.x), r && Math.round(r.y)); }
  await b.close(); })();
