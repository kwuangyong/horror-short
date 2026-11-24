#!/usr/bin/env python3
"""captions_dyn.py captions.ass timeline.json out.ass [--low 1590] [--top 330]
Dynamic caption position: close-up / ECU / reaction / low-angle shots put the caption in the lower band (default y=1590, ~83 %)
so it does not cover the face; a shot can force it with `"cap": "low" | "top" | "mid"` (mid = the .ass default, y=1344)."""
import json, re, sys
a = sys.argv[1:]; ass_in, tl_in, out = a[0], a[1], a[2]
opt = lambda k, d: float(a[a.index(k) + 1]) if k in a else d
LOW, TOP = opt('--low', 1590), opt('--top', 330)
tl = json.load(open(tl_in)); shots = sorted(tl.get('shots', []), key=lambda s: s['t'])
FACE = {'ecu', 'cu', 'reaction', 'low'}
def mode(t):
    cur = None
    for s in shots:
        if s['t'] <= t: cur = s
    if not cur: return 'mid'
    return cur.get('cap') or ('low' if cur['type'] in FACE else 'mid')
def ts(x):
    h, m, s = x.split(':'); return int(h) * 3600 + int(m) * 60 + float(s)
n = 0; lines = []
for ln in open(ass_in, encoding='utf-8'):
    if ln.startswith('Dialogue:'):
        p = ln.split(',', 9); m = mode(ts(p[1]) + 0.02); y = {'low': LOW, 'top': TOP}.get(m)
        if y: ln = re.sub(r'\\pos\((\d+),(\d+)\)', lambda g: f'\\pos({g.group(1)},{int(y)})', ln, 1); n += 1
    lines.append(ln)
open(out, 'w', encoding='utf-8').write(''.join(lines)); print(f'{n} captions moved (low/top) -> {out}')
