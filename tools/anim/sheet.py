#!/usr/bin/env python3
"""sheet.py DIR OUT.jpg [cols] - contact sheet of all PNG/JPG frames in DIR (sorted by name)."""
import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(d + '/*.png') + glob.glob(d + '/*.jpg')); tw = 360; th = 640
rows = (len(fs) + cols - 1) // cols; S = Image.new('RGB', (cols * tw, rows * th), (0, 0, 0))
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((tw, th)); ImageDraw.Draw(im).text((8, 8), f.split('/')[-1], fill=(255, 255, 0)); S.paste(im, ((i % cols) * tw, (i // cols) * th))
S.save(out, quality=88)
