#!/usr/bin/env python3
"""Flat-vector art for BATTLE SPIN #001 (Vrykolakas vs Church Grim), all drawn in code.

    python episodes/vrykolakas-vs-church-grim/art/draw_art.py [only_name ...]

Outputs 1080x1920 PNGs next to this file (names from shotlist-battle.md).
Everything is drawn at 2x and downsampled for clean edges. No text in any image.
Reusable characters: draw_kid, draw_grim, draw_vrykolakas, draw_grandma.
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
SS = 2
OUT = Path(__file__).resolve().parent
sin, cos, rad = math.sin, math.cos, math.radians

# palette
NAVY0, NAVY1, NAVY2 = (20, 26, 51), (27, 33, 64), (42, 49, 89)
CRIM = (196, 18, 31)
CRIM_D = (130, 10, 24)


def mul(col, k):
    return tuple(min(255, int(v * k)) for v in col[:3]) + tuple(col[3:])


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


# ================================================================== canvas
class Canvas:
    def __init__(self):
        self.img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _p(self, pts):
        return [(x * SS, y * SS) for x, y in pts]

    def comp(self, layer, x0, y0):
        if x0 < 0:
            layer = layer.crop((-x0, 0, layer.width, layer.height)); x0 = 0
        if y0 < 0:
            layer = layer.crop((0, -y0, layer.width, layer.height)); y0 = 0
        w = min(layer.width, self.img.width - x0)
        h = min(layer.height, self.img.height - y0)
        if w <= 0 or h <= 0:
            return
        self.img.alpha_composite(layer.crop((0, 0, w, h)), (x0, y0))

    def poly(self, pts, fill):
        if len(fill) == 4 and fill[3] < 255:
            return self.tpoly(pts, fill)
        self.d.polygon(self._p(pts), fill=fill)

    def tpoly(self, pts, fill):
        P = self._p(pts)
        x0 = int(max(0, min(p[0] for p in P) - 2)); x1 = int(min(self.img.width, max(p[0] for p in P) + 2))
        y0 = int(max(0, min(p[1] for p in P) - 2)); y1 = int(min(self.img.height, max(p[1] for p in P) + 2))
        if x1 <= x0 or y1 <= y0:
            return
        layer = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        ImageDraw.Draw(layer).polygon([(x - x0, y - y0) for x, y in P], fill=fill)
        self.img.alpha_composite(layer, (x0, y0))

    def ell(self, cx, cy, rx, ry, fill):
        if len(fill) == 4 and fill[3] < 255:
            return self.tpoly(circ(cx, cy, rx, ry, 48), fill)
        self.d.ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=fill)

    def rect(self, x0, y0, x1, y1, fill):
        self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill)

    def rrect(self, x0, y0, x1, y1, r, fill):
        if len(fill) == 4 and fill[3] < 255:
            return self.rect(x0, y0, x1, y1, fill)
        self.d.rounded_rectangle([x0 * SS, y0 * SS, x1 * SS, y1 * SS], r * SS, fill=fill)

    def line(self, pts, w, fill):
        self.d.line(self._p(pts), fill=fill, width=max(1, int(w * SS)), joint="curve")
        for p in (pts[0], pts[-1]):
            self.ell(p[0], p[1], w / 2, w / 2, fill)

    def limb(self, p0, p1, w0, w1, fill):
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        self.poly([(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2), (p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2),
                   (p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2), (p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2)], fill)
        self.ell(p0[0], p0[1], w0 / 2, w0 / 2, fill)
        self.ell(p1[0], p1[1], w1 / 2, w1 / 2, fill)

    def glow(self, x, y, r, color, blur):
        m = int(r + blur * 3)
        size = int(2 * m * SS)
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse([(m - r) * SS, (m - r) * SS, (m + r) * SS, (m + r) * SS], fill=color)
        layer = layer.filter(ImageFilter.GaussianBlur(blur * SS))
        self.comp(layer, int((x - m) * SS), int((y - m) * SS))

    def grad(self, x0, y0, x1, y1, top, bot):
        w, h = int((x1 - x0) * SS), int((y1 - y0) * SS)
        if w <= 0 or h <= 0:
            return
        g = Image.linear_gradient("L").resize((w, h), Image.BILINEAR)
        ta = top[3] if len(top) == 4 else 255
        ba = bot[3] if len(bot) == 4 else 255
        rgb = Image.composite(Image.new("RGB", (w, h), bot[:3]), Image.new("RGB", (w, h), top[:3]), g)
        a = Image.composite(Image.new("L", (w, h), ba), Image.new("L", (w, h), ta), g)
        rgb = rgb.convert("RGBA")
        rgb.putalpha(a)
        self.comp(rgb, int(x0 * SS), int(y0 * SS))

    def fog(self, y0, y1, col, a):
        ym = (y0 + y1) / 2
        self.grad(0, y0, W, ym, col + (0,), col + (a,))
        self.grad(0, ym, W, y1, col + (a,), col + (0,))

    def tint(self, col):
        self.rect(0, 0, W, H, col)


def circ(cx, cy, rx, ry, n=40):
    return [(cx + rx * cos(2 * math.pi * i / n), cy + ry * sin(2 * math.pi * i / n)) for i in range(n)]


def cos(a):  # noqa: shadow math.cos for brevity in radians
    return math.cos(a)


def sin(a):  # noqa
    return math.sin(a)


class Fig:
    """Local->world transform for characters. Local: origin at feet, +x forward, y down, rotation clockwise."""

    def __init__(self, c, x, y, k=1.0, flip=1, rot=0.0, pv=(0, 0)):
        self.c, self.x, self.y, self.k, self.flip, self.rot, self.pv = c, x, y, k, flip, rot, pv

    def pt(self, x, y):
        a = rad(self.rot)
        x0, y0 = x - self.pv[0], y - self.pv[1]
        xr = x0 * math.cos(a) - y0 * math.sin(a) + self.pv[0]
        yr = x0 * math.sin(a) + y0 * math.cos(a) + self.pv[1]
        return (self.x + self.flip * xr * self.k, self.y + yr * self.k)

    def poly(self, pts, fill):
        self.c.poly([self.pt(*p) for p in pts], fill)

    def ell(self, cx, cy, rx, ry, fill, n=44):
        self.poly(circ(cx, cy, rx, ry, n), fill)

    def limb(self, p0, p1, w0, w1, fill):
        a, b = self.pt(*p0), self.pt(*p1)
        self.c.limb(a, b, w0 * self.k, w1 * self.k, fill)

    def glow(self, x, y, r, col, blur):
        p = self.pt(x, y)
        self.c.glow(p[0], p[1], r * self.k, col, blur * self.k)

    def end(self, p, ang, L):
        """point at distance L from p along angle (deg from straight down, + toward +x)"""
        return (p[0] + L * math.sin(rad(ang)), p[1] + L * math.cos(rad(ang)))


def shaded(F, cx, cy, rx, ry, base, dark, off=(-0.1, -0.12), shrink=0.9):
    F.ell(cx, cy, rx, ry, dark)
    F.ell(cx + rx * off[0], cy + ry * off[1], rx * shrink, ry * shrink, base)


# ================================================================== scenery
def stars(c, rng, n=70, ymax=700):
    for _ in range(n):
        x, y = rng.randint(0, W), rng.randint(0, ymax)
        r = rng.choice([1.2, 1.6, 2.2])
        c.ell(x, y, r, r, (225, 230, 255, rng.randint(90, 210)))


def moon(c, x, y, r=90, col=(236, 233, 214), halo=(200, 210, 255), crescent=False):
    c.glow(x, y, r * 1.9, halo + (70,), r * 0.7)
    if crescent:
        layer = Image.new("RGBA", (int(2 * r * SS) + 8, int(2 * r * SS) + 8), (0, 0, 0, 0))
        dd = ImageDraw.Draw(layer)
        s = SS
        dd.ellipse([4, 4, 4 + 2 * r * s, 4 + 2 * r * s], fill=col + (255,))
        dd.ellipse([4 + r * 0.55 * s, 4 - r * 0.15 * s, 4 + (2 * r + r * 0.55) * s, 4 + (2 * r - r * 0.15) * s], fill=(0, 0, 0, 0))
        c.comp(layer, int((x - r) * SS) - 4, int((y - r) * SS) - 4)
        return
    c.ell(x, y, r, r, col)
    for dx, dy, rr in ((-28, -22, 16), (24, 18, 22), (-6, 40, 11)):
        c.ell(x + dx * r / 90, y + dy * r / 90, rr * r / 90, rr * r / 90, mul(col, 0.9))
    c.ell(x + r * 0.15, y + r * 0.2, r * 0.82, r * 0.82, mul(col, 0.98) + (0,)) if False else None


def pines(c, rng, base, hmin, hmax, gap, col, x0=-40, x1=W + 40, rim=None, tiers=4):
    x = x0 + rng.randint(0, gap)
    while x < x1:
        h = rng.randint(hmin, hmax)
        hw = h * 0.20
        for pass_ in ((rim, -5), (col, 0)) if rim else ((col, 0),):
            colr, ox = pass_
            c.rect(x - 7 + ox, base - h * 0.14, x + 7 + ox, base + 4, colr)
            for k in range(tiers):
                apex = base - h + k * h * 0.17
                bb = apex + h * 0.38
                half = hw * (0.5 + 0.2 * k)
                c.poly([(x + ox, apex), (x + half + ox, bb), (x - half + ox, bb)], colr)
        x += gap + rng.randint(-gap // 3, gap // 3)


def forest_bg(c, rng, G=1040, sky_top=NAVY0, sky_bot=(46, 54, 100), ground_top=(34, 42, 78), ground_bot=(8, 10, 22),
              moon_pos=(780, 300), moon_r=92, moon_col=(236, 233, 214), halo=(200, 210, 255),
              far=(30, 38, 76), mid=(22, 28, 58), fogc=(120, 134, 190), edge_trees=True, stars_on=True, rimc=None):
    c.grad(0, 0, W, G + 40, sky_top, sky_bot)
    if stars_on:
        stars(c, rng)
    if moon_pos:
        moon(c, *moon_pos, r=moon_r, col=moon_col, halo=halo)
    pines(c, rng, G - 30, 240, 380, 62, far, rim=rimc)
    c.fog(G - 220, G, fogc, 70)
    pines(c, rng, G + 6, 330, 520, 120, mid, rim=rimc)
    c.fog(G - 120, G + 40, fogc, 60)
    c.grad(0, G, W, H, ground_top, ground_bot)
    for x in range(-20, W + 40, 38):                       # grass edge
        hh = rng.randint(10, 26)
        c.poly([(x, G + 4), (x + 20, G + 4), (x + 8, G - hh)], ground_top)
    if edge_trees:
        for ex, eh in ((-30, 980), (1090, 1060)):
            pines(c, rng, G + 120, eh, eh, 9999, mul(NAVY0, 0.55), x0=ex, x1=ex + 5, tiers=5)


def fireflies(c, pts, r=1.0):
    for x, y in pts:
        c.glow(x, y, 34 * r, (255, 214, 90, 150), 20 * r)
        c.ell(x, y, 6.5 * r, 6.5 * r, (255, 244, 170))


def wall(c, rng, x0, x1, base, h=110, gaps=(), light=(104, 112, 146), c1=(86, 94, 128), c2=(72, 80, 112), mortar=(40, 46, 74)):
    """low ruined stone wall seen from the front; gaps = [(a,b),...] fully open (rubble only)."""
    c.ell((x0 + x1) / 2, base + 4, (x1 - x0) / 2, 14, (4, 6, 16, 130))
    x = x0
    row2 = h * 0.52

    def in_gap(px):
        return any(a - 4 < px < b + 4 for a, b in gaps)

    while x < x1:
        bw = rng.randint(50, 92)
        if not in_gap(x + bw / 2):
            top = base - h + rng.choice([0, 0, 0, 12, 26, 44]) if rng.random() < 0.8 else base - h * 0.55
            col = c1 if rng.random() < 0.5 else c2
            c.rrect(x, base - row2, x + bw - 3, base, 5, mortar)
            c.rrect(x + 1, base - row2 + 1, x + bw - 4, base - 2, 5, col)
            tw = bw - 3
            if top < base - row2 - 3:
                c.rrect(x + 6, top, x + 6 + tw - 6, base - row2 - 2, 5, mortar)
                c.rrect(x + 7, top + 1, x + tw - 1, base - row2 - 3, 5, col)
                c.rect(x + 12, top + 1, x + tw - 6, top + 6, light)
        x += bw
    for a, b in gaps:                                            # rubble in the gap
        for _ in range(7):
            rx_ = rng.choice([a - 20, a + 5, b - 30, b - 5, (a + b) / 2 + rng.randint(-40, 40)])
            c.rrect(rx_, base - rng.randint(14, 30), rx_ + rng.randint(26, 44), base, 5, rng.choice([c1, c2]))


def boundary(c, x0, x1, y, col=(255, 226, 140)):
    c.glow((x0 + x1) / 2, y, (x1 - x0) / 2, col + (70,), 18)
    c.line([(x0, y), (x1, y)], 5, col + (255,))
    for x in range(int(x0), int(x1), 60):
        c.glow(x + 30, y, 10, col + (160,), 6)


def tomb(c, x, base, w=120, h=190, tilt=0.0, face=(100, 108, 144), side=(72, 78, 112), cross=True):
    n = 14
    pts = [(-w / 2, 0), (-w / 2, -h + w / 2)]
    for i in range(1, n):
        a = math.pi + math.pi * i / n
        pts.append((w / 2 * math.cos(a), -h + w / 2 + w / 2 * math.sin(a) * 1.0))
    pts += [(w / 2, -h + w / 2), (w / 2, 0)]
    t = rad(tilt)

    def tr(p):
        return (x + p[0] * math.cos(t) - p[1] * math.sin(t), base + p[0] * math.sin(t) + p[1] * math.cos(t))

    c.ell(x + 10, base + 4, w * 0.75, 14, (4, 6, 16, 140))
    c.poly([tr(p) for p in pts], side)
    c.poly([tr((px * 0.86 - w * 0.07, py)) for px, py in pts], face)
    if cross:
        c.line([tr((-w * 0.08, -h + w * 0.42)), tr((-w * 0.08, -h + w * 1.02))], 7, mul(side, 0.8))
        c.line([tr((-w * 0.26, -h + w * 0.62)), tr((w * 0.1, -h + w * 0.62))], 7, mul(side, 0.8))


def mound(c, x, y, rx, ry, soil=(62, 44, 56), soil_l=(88, 62, 72)):
    c.ell(x + 6, y + 8, rx * 1.05, ry * 0.4, (4, 6, 16, 120))
    c.poly([(x - rx, y)] + [(x + rx * math.cos(math.pi + math.pi * i / 24), y + ry * math.sin(math.pi + math.pi * i / 24) * 1)
                           for i in range(25)] + [(x + rx, y)], soil)
    c.poly([(x - rx * 0.75, y - 4)] + [(x - rx * 0.05 + rx * 0.7 * math.cos(math.pi + math.pi * i / 24),
                                         y - ry * 0.1 + ry * 0.82 * math.sin(math.pi + math.pi * i / 24)) for i in range(25)], soil_l)


def impact(c, x, y, r, col=(255, 255, 255), seed=1, n=12):
    rng = random.Random(seed)
    c.glow(x, y, r * 1.1, col + (140,), r * 0.45)
    pts = []
    for i in range(n * 2):
        a = math.pi * i / n + rng.uniform(-0.08, 0.08)
        rr = r * (1.0 if i % 2 == 0 else 0.42) * rng.uniform(0.85, 1.1)
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    c.poly(pts, col + (255,))
    c.ell(x, y, r * 0.32, r * 0.32, (255, 255, 255))


def speed(c, cx, cy, r0, r1, n=26, col=(255, 255, 255, 120), seed=3, w=9):
    rng = random.Random(seed)
    for i in range(n):
        a = 2 * math.pi * i / n + rng.uniform(-0.05, 0.05)
        ra, rb = r0 * rng.uniform(0.9, 1.3), r1 * rng.uniform(0.7, 1.1)
        ca, sa = math.cos(a), math.sin(a)
        nx, ny = -sa * w / 2, ca * w / 2
        c.poly([(cx + ca * ra + nx, cy + sa * ra + ny), (cx + ca * rb, cy + sa * rb), (cx + ca * ra - nx, cy + sa * ra - ny)], col)


def slash(c, x, y, r, a0, a1, wid=30, col=CRIM):
    pts_o, pts_i = [], []
    n = 24
    for i in range(n + 1):
        a = rad(a0 + (a1 - a0) * i / n)
        t = math.sin(math.pi * i / n)
        pts_o.append((x + r * math.cos(a), y + r * math.sin(a)))
        pts_i.append((x + (r - wid * t) * math.cos(a), y + (r - wid * t) * math.sin(a)))
    c.glow(x + r * math.cos(rad((a0 + a1) / 2)), y + r * math.sin(rad((a0 + a1) / 2)), r * 0.5, col + (80,), 30)
    c.poly(pts_o + pts_i[::-1], col + (255,))


def dust(c, rng, x, y, r, n=30, col=(244, 240, 226)):
    for _ in range(n):
        a = rng.uniform(0, 2 * math.pi)
        d = r * rng.random() ** 0.6
        rr = rng.uniform(4, 15)
        c.ell(x + d * math.cos(a), y + d * math.sin(a), rr, rr, col + (rng.randint(130, 235),))


def spikes(F, cx, cy, rx, ry, t0, t1, n, h, col, rng):
    for i in range(n):
        t = rad(t0 + (t1 - t0) * (i + 0.5) / n)
        dt = rad((t1 - t0) / n) * 0.62
        def P(tt, k=1.0):
            return (cx + rx * k * math.cos(tt), cy + ry * k * math.sin(tt))
        nx, ny = math.cos(t) / rx, math.sin(t) / ry
        L = math.hypot(nx, ny)
        nx, ny = nx / L, ny / L
        b0, b1, mid = P(t - dt, 0.96), P(t + dt, 0.96), P(t)
        hh = h * rng.uniform(0.7, 1.25)
        tip = (mid[0] + nx * hh + rng.uniform(-6, 6), mid[1] + ny * hh)
        F.poly([b0, tip, b1], col)


# ================================================================== THE KID
KID_POSES = {
    "stand": dict(rot=0, aL=-14, aR=14, lL=-6, lR=6, tail=(-160, 130), fl=("R", 25, False), face="normal"),
    "walk": dict(rot=3, aL=-24, aR=30, lL=-17, lR=19, tail=(-155, 140), fl=("R", 55, False), face="normal"),
    "run": dict(rot=16, aL=-75, aR=75, lL=-48, lR=52, tail=(-100, 240), fl=("R", 78, False), face="determined"),
    "fall": dict(rot=80, aL=150, aR=125, lL=30, lR=-12, tail=(-100, 210), fl=None, face="scared"),
    "crawl": dict(rot=68, aL=100, aR=118, lL=-20, lR=-45, tail=(-125, 180), fl=("R", 118, False), face="scared"),
    "throw": dict(rot=-4, aL=-35, aR=128, lL=-26, lR=30, tail=(-120, 190), fl=None, face="determined"),
    "flashlight": dict(rot=0, aL=-25, aR=100, lL=-10, lR=14, tail=(-130, 170), fl=("R", 98, True), face="determined"),
    "scared": dict(rot=-6, aL=-148, aR=150, lL=-9, lR=11, tail=(-150, 150), fl=None, face="scared"),
    "limp": dict(rot=7, aL=-22, aR=12, lL=-34, lR=5, tail=(-165, 125), fl=("R", 30, False), face="tired"),
    "hug": dict(rot=0, aL=-135, aR=135, lL=-8, lR=8, tail=(-155, 120), fl=("R", 175, False), face="scared"),
}


def draw_kid(c, x, y, scale=1.0, pose="walk", flip=1, dark=False, back=False, **ov):
    """THE KID: grey pajamas, long RED scarf, pointed hood, oversized flashlight. Feet at (x, y)."""
    P = dict(KID_POSES[pose]); P.update(ov)
    F = Fig(c, x, y, scale, flip, P["rot"], (0, -62))
    base = dict(skin=(240, 208, 182), skin_d=(206, 168, 150), pj=(196, 200, 216), pj_d=(150, 156, 182),
                hood=(176, 182, 204), hood_d=(124, 130, 158), scarf=CRIM, scarf_d=CRIM_D, shoe=(104, 76, 88),
                ink=(30, 24, 40), fl=(62, 70, 104), fl_l=(112, 120, 156), lens=(255, 238, 170))
    K = dict(base)
    if dark:
        for k in K:
            if k not in ("scarf", "scarf_d"):
                K[k] = mul(base[k], 0.16)
    # legs
    for hx, ang in ((-20, P["lL"]), (20, P["lR"])):
        hip = (hx, -66)
        foot = F.end(hip, ang, 62)
        F.limb(hip, foot, 34, 28, K["pj_d"])
        F.ell(foot[0] + 8 * (1 if ang >= 0 else -0.2), foot[1] + 3, 25, 12, K["shoe"])
    # scarf tail (behind body)
    ta, tl = P["tail"]
    pts_l, pts_r = [], []
    base_p = (30, -184)
    for i in range(11):
        t = i / 10
        d = (sin(rad(ta)), cos(rad(ta)))
        wv = 16 * math.sin(t * math.pi * 2.2) * t
        px = base_p[0] + d[0] * tl * t + (-d[1]) * wv
        py = base_p[1] + d[1] * tl * t + (d[0]) * wv
        wd = 24 - 9 * t
        pts_l.append((px - (-d[1]) * wd / 2 * 0 + (-d[1]) * wd / 2, py + d[0] * wd / 2))
        pts_r.append((px - (-d[1]) * wd / 2, py - d[0] * wd / 2))
    F.poly(pts_l + pts_r[::-1], K["scarf"])
    F.poly(pts_l[:6] + pts_r[:6][::-1], K["scarf_d"]) if False else None
    # flashlight beam first (under kid)
    fl = P["fl"]
    arm_ang = {"L": P["aL"], "R": P["aR"]}
    sh = {"L": (-48, -168), "R": (48, -168)}
    hands = {k: F.end(sh[k], arm_ang[k], 84) for k in "LR"}
    if fl and fl[2]:
        hd = hands[fl[0]]
        lens = F.end(hd, fl[1], 122)
        for ang_, al in ((17, 40), (10, 55)):
            far1 = F.end(lens, fl[1] + ang_, 760)
            far2 = F.end(lens, fl[1] - ang_, 760)
            F.poly([lens, far1, far2], (255, 240, 170, al))
        F.glow(lens[0], lens[1], 40, (255, 240, 170, 200), 18)
    # back arm (the one that isn't holding anything) drawn first
    def arm(k):
        e = hands[k]
        F.limb(sh[k], e, 36, 29, K["pj"])
        F.ell(e[0], e[1], 17, 17, K["skin"])
    arm("L")
    # torso
    F.poly([(-52, -192), (52, -192), (64, -62), (-64, -62)], K["pj"])
    F.poly([(20, -192), (52, -192), (64, -62), (26, -62)], K["pj_d"])
    F.ell(0, -62, 64, 12, K["pj_d"])
    for by in (-150, -118, -86):
        F.ell(0, by, 5, 5, K["pj_d"])
    for sx in (-1, 1):                                         # pockets
        F.poly([(sx * 52, -126), (sx * 30, -126), (sx * 30, -92), (sx * 52, -92)], K["pj_d"])
    # scarf band
    F.poly([(-56, -208), (56, -208), (62, -176), (-62, -176)], K["scarf"])
    F.poly([(10, -176), (62, -176), (56, -208), (24, -208)], K["scarf_d"])
    # flashlight body
    if fl:
        hd = hands[fl[0]]
        d = fl[1]
        tailp = F.end(hd, d, -44); mid = F.end(hd, d, 88); headp = F.end(hd, d, 122)
        F.limb(tailp, mid, 40, 42, K["fl"])
        F.limb(F.end(hd, d, 18), F.end(hd, d, 34), 44, 44, K["fl_l"])
        F.limb(F.end(hd, d, 76), headp, 58, 66, K["fl"])
        F.limb(F.end(hd, d, 118), F.end(hd, d, 128), 56, 56, K["lens"] if fl[2] else mul(K["lens"], 0.7))
        F.limb(tailp, F.end(hd, d, -30), 40, 40, K["fl_l"])
        F.limb(F.end(hd, d, 50), F.end(hd, d, 58), 43, 43, mul(CRIM, 0.7 if dark else 1))
    arm("R")
    # head
    hy = -262
    F.ell(0, hy, 70, 72, K["hood_d"])
    F.poly([(-60, hy - 36), (62, hy - 32), (36, hy - 134)], K["hood_d"])  # hood tip
    F.poly([(-64, hy - 30), (54, hy - 30), (30, hy - 126)], K["hood"])
    F.ell(-2, hy - 2, 66, 68, K["hood"])
    if back:
        F.ell(0, hy + 2, 66, 66, K["hood"])
        F.poly([(-40, hy + 30), (40, hy + 30), (30, hy + 66), (-30, hy + 66)], K["hood_d"])
    else:
        F.ell(0, hy + 4, 54, 54, K["hood_d"])
        F.ell(0, hy + 7, 52, 51, K["skin_d"])
        F.ell(-2, hy + 5, 49, 48, K["skin"])
        face = P["face"]
        ex = 19
        if face == "scared":
            for s_ in (-1, 1):
                F.ell(s_ * ex, hy + 2, 13, 14, (250, 250, 255) if not dark else K["skin"])
                F.ell(s_ * ex + 1, hy + 3, 6.5, 7, K["ink"])
            F.ell(0, hy + 32, 9, 12, K["ink"])
            for s_ in (-1, 1):
                F.limb((s_ * 30, hy - 20), (s_ * 10, hy - 28), 5, 5, K["ink"]) if False else F.poly(
                    [(s_ * 32, hy - 24), (s_ * 8, hy - 18), (s_ * 8, hy - 23), (s_ * 32, hy - 29)], K["ink"])
        elif face == "determined":
            for s_ in (-1, 1):
                F.ell(s_ * ex, hy + 6, 7.5, 7.5, K["ink"])
                F.poly([(s_ * 34, hy - 8), (s_ * 6, hy - 1), (s_ * 6, hy - 9), (s_ * 34, hy - 18)], K["ink"])
            F.poly([(-12, hy + 32), (12, hy + 32), (10, hy + 36), (-10, hy + 36)], K["ink"])
        elif face == "tired":
            for s_ in (-1, 1):
                F.ell(s_ * ex, hy + 8, 7.5, 7.5, K["ink"])
                F.ell(s_ * ex, hy + 2, 12, 7, K["skin"])
                F.poly([(s_ * 32, hy + 2), (s_ * 7, hy + 2), (s_ * 7, hy - 2), (s_ * 32, hy - 2)], K["skin_d"])
            F.ell(0, hy + 33, 7, 4, K["ink"])
        else:
            for s_ in (-1, 1):
                F.ell(s_ * ex, hy + 6, 7.5, 8, K["ink"])
                F.ell(s_ * ex + 2, hy + 3, 2.5, 2.5, (255, 255, 255)) if not dark else None
            F.ell(0, hy + 33, 8, 4.5, K["ink"])
        for s_ in (-1, 1):
            F.ell(s_ * 33, hy + 24, 9, 6, (232, 150, 150, 160) if not dark else K["skin"])
    # hood rim shade across forehead
    F.poly([(-58, hy - 22), (58, hy - 22), (50, hy - 10), (-50, hy - 10)], K["hood_d"]) if False else None
    return F


# ================================================================== CHURCH GRIM
FUR, FUR_L, FUR_D = (22, 24, 42), (52, 58, 98), (12, 12, 24)
GRIM_POSES = {
    "stand": dict(rot=0, jaw=0.08, f=(4, -4), r=(8, -10), hack=16, hd=0),
    "snarl": dict(rot=2, jaw=0.85, f=(-16, 8), r=(-20, 16), hack=26, hd=24),
    "lunge": dict(rot=14, jaw=0.9, f=(95, 82), r=(-80, -70), hack=22, hd=6),
    "bite": dict(rot=10, jaw=0.45, f=(52, 70), r=(-38, -60), hack=22, hd=18),
    "blocked": dict(rot=-26, jaw=0.7, f=(125, 112), r=(18, -6), hack=26, hd=0, pv=(-100, -60)),
    "drag": dict(rot=9, jaw=0.25, f=(40, 56), r=(18, 28), hack=14, hd=34),
    "fade": dict(rot=0, jaw=0.1, f=(4, -4), r=(8, -10), hack=16, hd=0, alpha=0.4),
}


def draw_grim(c, x, y, scale=1.0, pose="stand", flip=1, alpha=None, **ov):
    """CHURCH GRIM: huge black dog, glowing red eyes, jagged fur. Feet at (x, y), faces +x."""
    P = dict(GRIM_POSES[pose]); P.update(ov)
    al = P.get("alpha", 1.0) if alpha is None else alpha
    tgt = Canvas() if al < 1 else c
    rng = random.Random(11)
    F = Fig(tgt, x, y, scale, flip, P["rot"], P.get("pv", (-100, -140)))

    def leg(hip, a1, a2, col, w=60):
        knee = F.end(hip, a1, 82)
        foot = F.end(knee, a2, 82)
        F.limb(hip, knee, w, w * 0.75, col)
        F.limb(knee, foot, w * 0.75, w * 0.55, col)
        F.ell(foot[0] + 14, foot[1] + 6, 36, 15, col)
        return foot
    far = mul(FUR, 0.7)
    leg((110, -140), P["f"][0] + 12, P["f"][1] + 10, far)
    leg((-105, -145), P["r"][0] + 10, P["r"][1] + 8, far)
    # tail
    F.poly([(-150, -230), (-215, -300), (-290, -350), (-270, -270), (-230, -230), (-170, -150)], FUR)
    spikes(F, -230, -230, 70, 90, 200, 300, 4, 22, FUR, rng)
    # body (rim light on top)
    F.ell(0, -195, 178, 98, FUR_L)
    F.ell(0, -188, 174, 94, FUR)
    F.ell(120, -215, 88, 96, FUR_L)
    F.ell(120, -208, 84, 92, FUR)
    F.ell(-112, -188, 88, 96, FUR)
    spikes(F, 0, -195, 178, 98, 196, 340, 11, hack := P["hack"], FUR, rng)
    spikes(F, 0, -195, 178, 98, 196, 340, 11, hack * 0.6, FUR_D, rng)
    leg((-105, -145), P["r"][0], P["r"][1], FUR)
    leg((110, -140), P["f"][0], P["f"][1], FUR)
    # neck + head
    hd = P["hd"]
    Hx, Hy = 222, -288 + hd
    F.poly([(70, -300), (190, -350 + hd * 0.4), (270, -250 + hd), (170, -150), (60, -170)], FUR)
    spikes(F, 150, -255, 90, 100, 200, 300, 6, hack * 1.3, FUR, rng)
    F.ell(Hx, Hy, 80, 72, FUR_L)
    F.ell(Hx - 3, Hy + 4, 78, 68, FUR)
    # ears
    F.poly([(Hx - 52, Hy - 40), (Hx - 18, Hy - 64), (Hx - 40, Hy - 150)], FUR)
    F.poly([(Hx - 4, Hy - 56), (Hx + 34, Hy - 52), (Hx + 20, Hy - 138)], FUR_L)
    F.poly([(Hx - 4, Hy - 56), (Hx + 34, Hy - 52), (Hx + 22, Hy - 118)], FUR)
    # mouth + jaws
    jaw = P["jaw"]
    hinge = (Hx + 30, Hy + 30)
    ja = jaw * 30
    def jt(px, py):  # rotate lower-jaw points about hinge (clockwise = opening downward when facing +x)
        a = rad(ja)
        dx, dy = px - hinge[0], py - hinge[1]
        return (hinge[0] + dx * math.cos(a) - dy * math.sin(a), hinge[1] + dx * math.sin(a) + dy * math.cos(a))
    low = [(Hx + 20, Hy + 22), (Hx + 160, Hy + 22), (Hx + 150, Hy + 54), (Hx + 20, Hy + 62)]
    lowr = [jt(*p) for p in low]
    if jaw > 0.2:
        F.poly([(Hx + 24, Hy + 24), (Hx + 160, Hy + 18)] + [lowr[1], lowr[0]], (120, 10, 28))
    F.poly(lowr, FUR)
    if jaw > 0.2:
        for i in range(4):
            tx = Hx + 60 + i * 28
            p0 = jt(tx, Hy + 22); p1 = jt(tx + 14, Hy + 22); p2 = jt(tx + 7, Hy + 2)
            F.poly([p0, p1, p2], (244, 240, 230))
    F.poly([(Hx + 20, Hy - 36), (Hx + 160, Hy - 14), (Hx + 160, Hy + 22), (Hx + 20, Hy + 40)], FUR)
    F.poly([(Hx + 20, Hy - 36), (Hx + 160, Hy - 14), (Hx + 160, Hy - 4), (Hx + 20, Hy - 22)], FUR_L)
    if jaw > 0.2:
        for i in range(4):
            tx = Hx + 66 + i * 26
            F.poly([(tx, Hy + 24), (tx + 13, Hy + 22), (tx + 6, Hy + 44)], (244, 240, 230))
    F.ell(Hx + 160, Hy - 4, 17, 14, (8, 8, 16))
    F.ell(Hx + 154, Hy - 9, 5, 4, FUR_L)
    # eye
    ex, ey = Hx + 54, Hy - 22
    F.glow(ex, ey, 40, (255, 40, 50, 150), 26)
    F.ell(ex, ey, 16, 12, (255, 56, 56))
    F.ell(ex + 3, ey, 7, 9, (255, 214, 200))
    F.poly([(ex - 26, ey - 22), (ex + 24, ey - 6), (ex + 24, ey - 16), (ex - 26, ey - 40)], FUR_D)
    # near paw claws
    if al < 1:
        a = tgt.img.split()[3].point(lambda v: int(v * al))
        tgt.img.putalpha(a)
        c.img.alpha_composite(tgt.img)
    return F


# ================================================================== VRYKOLAKAS
SK, SK_D = (150, 172, 160), (104, 128, 122)
SH, SH_D = (194, 190, 168), (150, 146, 128)
CLAW = (230, 222, 186)
VR_POSES = {
    "grin": dict(rot=0, aL=(-12, -6), aR=(14, 8), lL=-6, lR=6, mouth="grin", eyes="hollow"),
    "claw": dict(rot=7, aL=(105, 150), aR=(95, 135), lL=-14, lR=14, mouth="open", eyes="hollow"),
    "rise": dict(rot=14, aL=(115, 100), aR=(160, 168), lL=-10, lR=10, mouth="open", eyes="hollow"),
    "throw": dict(rot=-6, aL=(-40, -30), aR=(98, 102), lL=-18, lR=20, mouth="grin", eyes="hollow"),
    "choke": dict(rot=9, aL=(120, 100), aR=(110, 96), lL=-16, lR=16, mouth="grin", eyes="hollow"),
    "chase": dict(rot=17, aL=(-30, 95), aR=(100, 110), lL=-36, lR=38, mouth="open", eyes="hollow"),
    "down": dict(rot=88, aL=(-30, -10), aR=(20, 40), lL=-5, lR=8, mouth="shut", eyes="closed"),
    "recoil": dict(rot=-16, aL=(-130, -150), aR=(140, 150), lL=-12, lR=14, mouth="open", eyes="wide"),
    "stagger": dict(rot=10, aL=(105, 100), aR=(112, 104), lL=-26, lR=28, mouth="open", eyes="hollow"),
}


def draw_vrykolakas(c, x, y, scale=1.0, pose="grin", flip=1, **ov):
    """VRYKOLAKAS: gaunt grey-green corpse, torn shroud, hollow eyes, long claws. Feet at (x, y)."""
    P = dict(VR_POSES[pose]); P.update(ov)
    F = Fig(c, x, y, scale, flip, P["rot"], (0, -70))
    rng = random.Random(5)
    sh = {"L": (-60, -340), "R": (60, -340)}

    def arm(k, a):
        a1, a2 = a
        el = F.end(sh[k], a1, 100)
        hd = F.end(el, a2, 96)
        F.limb(sh[k], el, 30, 23, SK)
        F.limb(el, hd, 23, 18, SK)
        F.ell(hd[0], hd[1], 20, 18, SK_D)
        for i in range(-2, 3):
            ca = a2 + i * 20
            p0 = F.end(hd, ca, 6)
            p1 = F.end(hd, ca, 74 - abs(i) * 6)
            nx, ny = cos(rad(ca)) * 5, -sin(rad(ca)) * 5
            F.poly([(p0[0] + nx, p0[1] + ny), p1, (p0[0] - nx, p0[1] - ny)], CLAW)
    arm("L", P["aL"])
    for hx, ang in ((-24, P["lL"]), (24, P["lR"])):
        hip = (hx, -100)
        foot = F.end(hip, ang, 100)
        F.limb(hip, foot, 24, 17, SK_D)
        F.ell(foot[0] + 12, foot[1] + 3, 26, 9, SK_D)
    # shroud with ragged hem
    hem = []
    xs = list(range(-100, 101, 25))
    for i, xx in enumerate(xs):
        hem.append((xx, -48 + (i % 2) * -38 + rng.randint(-8, 8)))
    F.poly([(-62, -352), (62, -352), (84, -250), (100, -90)] + hem[::-1] + [(-100, -90), (-84, -250)], SH)
    F.poly([(10, -352), (62, -352), (84, -250), (100, -90), (hem[-1][0], hem[-1][1]), (40, -70)], SH_D)
    F.poly([(-22, -352), (22, -352), (0, -300)], SK_D)
    for fx in (-50, -20, 25, 58):
        F.poly([(fx, -300), (fx + 8, -80), (fx - 6, -80)], (*SH_D, 160))
    for sx_, sy_, rr in ((-40, -140, 20), (36, -190, 14), (-10, -100, 16)):
        F.ell(sx_, sy_, rr, rr * 0.7, (96, 82, 62, 140))
    F.poly([(-62, -230), (-34, -200), (-70, -178)], (30, 28, 34))   # rip
    F.poly([(52, -130), (74, -96), (40, -104)], (30, 28, 34))
    arm("R", P["aR"])
    # neck + head
    F.limb((0, -352), (0, -385), 30, 28, SK_D)
    hy = -425
    F.ell(0, hy, 70, 90, SK_D)
    F.ell(-5, hy - 4, 65, 85, SK)
    F.ell(-34, hy + 30, 16, 26, (SK_D[0], SK_D[1], SK_D[2], 150))     # hollow cheeks
    F.ell(34, hy + 30, 16, 26, (SK_D[0], SK_D[1], SK_D[2], 150))
    for hx_ in (-1, 1):                                          # wisps of hair
        for i in range(3):
            F.limb((hx_ * 64, hy - 20 + i * 16), (hx_ * (84 + i * 6), hy + 20 + i * 24), 6, 2, (70, 80, 78))
    F.limb((-8, hy - 88), (-24, hy - 118), 5, 2, (70, 80, 78))
    F.limb((10, hy - 88), (30, hy - 112), 5, 2, (70, 80, 78))
    eyes = P["eyes"]
    for s_ in (-1, 1):
        if eyes == "closed":
            F.limb((s_ * 38, hy - 12), (s_ * 14, hy - 4), 7, 7, (30, 40, 40))
        elif eyes == "wide":
            F.ell(s_ * 26, hy - 8, 24, 30, (14, 16, 24))
            F.ell(s_ * 26, hy - 8, 14, 18, (236, 240, 220))
            F.ell(s_ * 26, hy - 8, 5, 5, (14, 16, 24))
        else:
            F.ell(s_ * 26, hy - 8, 21, 29, (14, 16, 24))
            F.ell(s_ * 26, hy - 6, 4.5, 4.5, (190, 240, 200))
    F.poly([(-8, hy + 12), (8, hy + 12), (0, hy + 34)], (60, 78, 74))
    m = P["mouth"]
    if m == "grin":
        F.poly([(-46, hy + 46), (46, hy + 46), (30, hy + 72), (0, hy + 78), (-30, hy + 72)], (36, 12, 20))
        for tx in range(-40, 41, 11):
            F.poly([(tx, hy + 46), (tx + 9, hy + 46), (tx + 4, hy + 60)], (236, 232, 206))
        for tx in range(-30, 31, 15):
            F.poly([(tx, hy + 76), (tx + 10, hy + 74), (tx + 5, hy + 62)], (236, 232, 206))
    elif m == "open":
        F.ell(0, hy + 62, 34, 38, (36, 12, 20))
        for tx in (-24, -8, 8, 22):
            F.poly([(tx, hy + 32), (tx + 9, hy + 32), (tx + 4, hy + 48)], (236, 232, 206))
    else:
        F.limb((-30, hy + 56), (30, hy + 56), 5, 5, (40, 52, 52))
    return F


# ================================================================== grandma
def draw_grandma(c, x, y, scale=1.0, flip=1, reach=None, reach2=None):
    """Grandma Eleni: black headscarf, dark dress. reach/reach2 = world points her hands go to."""
    F = Fig(c, x, y, scale, flip, 0, (0, 0))
    dress, dress_d = (44, 44, 66), (28, 28, 46)
    for hx in (-30, 30):
        F.limb((hx, -60), (hx, -4), 28, 22, (90, 90, 112))
        F.ell(hx + 6, 0, 22, 10, (36, 32, 44))
    F.poly([(-74, -230), (74, -230), (104, -20), (-104, -20)], dress)
    F.poly([(20, -230), (74, -230), (104, -20), (30, -20)], dress_d)
    F.poly([(-46, -200), (46, -200), (56, -80), (-56, -80)], (140, 144, 172))   # apron
    F.poly([(-46, -200), (46, -200), (46, -190), (-46, -190)], (110, 114, 140))
    sh1, sh2 = F.pt(-64, -214), F.pt(64, -214)
    for sh_, tgt in ((sh1, reach), (sh2, reach2)):
        if tgt is None:
            tgt = (sh_[0], sh_[1] + 120 * scale)
        c.limb(sh_, tgt, 34 * scale, 26 * scale, dress)
        c.ell(tgt[0], tgt[1], 18 * scale, 18 * scale, (226, 194, 170))
    hy = -300
    F.ell(0, hy, 78, 82, (20, 20, 30))
    F.poly([(-60, hy + 30), (60, hy + 30), (30, hy + 100), (-30, hy + 100)], (20, 20, 30))
    F.ell(0, hy + 10, 54, 58, (226, 194, 170))
    F.ell(-4, hy + 8, 50, 54, (238, 208, 184))
    for s_ in (-1, 1):
        F.ell(s_ * 21, hy + 6, 6.5, 7, (30, 24, 40))
        F.limb((s_ * 34, hy - 12), (s_ * 10, hy - 14), 4, 4, (150, 150, 160))
        F.ell(s_ * 34, hy + 30, 10, 7, (232, 150, 150, 150))
    F.limb((-30, hy - 30), (30, hy - 30), 3, 3, (200, 168, 150)) if False else None
    F.ell(0, hy + 38, 14, 5, (150, 90, 90))
    for i in (-1, 0, 1):
        F.limb((-40 + i * 6, hy - 38 + abs(i) * 3), (40 + i * 6, hy - 38 + abs(i) * 3), 2.5, 2.5, (200, 168, 150, 190)) if i == 0 else None
    # wire glasses
    for s_ in (-1, 1):
        circle_pts = circ(s_ * 21, hy + 6, 15, 15, 24)
        F.poly(circle_pts, (255, 255, 255, 40))
    return F


def garlic(c, x, y, s=1.0, ang=0):
    bulb = (240, 236, 214)
    c.limb((x, y), (x + 8 * s, y + 130 * s), 8 * s, 8 * s, (150, 110, 80))
    for i in range(4):
        by = y + 28 * s + i * 30 * s
        bx = x + (6 if i % 2 else -6) * s + 2 * i * s
        c.ell(bx, by, 22 * s, 20 * s, (200, 196, 176))
        c.ell(bx - 3 * s, by - 2 * s, 20 * s, 18 * s, bulb)
        c.poly([(bx - 6 * s, by - 14 * s), (bx + 6 * s, by - 14 * s), (bx, by - 30 * s)], bulb)


def lamp(c, x, y, s=1.0, lit=True, rot=0):
    """oil lamp, base at (x, y)"""
    F = Fig(c, x, y, s, 1, rot, (0, 0))
    F.poly([(-40, 0), (40, 0), (34, -26), (-34, -26)], (170, 120, 60))
    F.ell(0, -48, 40, 34, (190, 140, 70))
    F.ell(-8, -52, 30, 26, (210, 164, 88))
    F.poly([(-12, -76), (12, -76), (12, -90), (-12, -90)], (150, 100, 50))
    gl = (255, 236, 170, 200) if lit else (200, 214, 226, 110)
    F.poly([(-20, -90), (20, -90), (28, -150), (0, -172), (-28, -150)], gl)
    if lit:
        F.glow(0, -128, 60, (255, 190, 90, 150), 40)
        F.poly([(-8, -108), (8, -108), (0, -146)], (255, 150, 50))
    F.limb((38, -52), (62, -70), 7, 7, (150, 100, 50))
    return F


def matchbox(c, x, y, s=1.0, rot=0):
    F = Fig(c, x, y, s, 1, rot, (0, 0))
    F.poly([(-46, 0), (46, 0), (46, -50), (-46, -50)], (196, 38, 40))
    F.poly([(-46, -34), (46, -34), (46, -50), (-46, -50)], (226, 196, 120))
    F.poly([(-40, -4), (40, -4), (40, -24), (-40, -24)], (120, 20, 28))
    return F


# ================================================================== finishing
def vignette(img, strength=190, soft=230):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse((-260, -160, W + 260, H + 160), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(soft))
    dark = Image.new("RGBA", img.size, (0, 0, 0, strength))
    dark.putalpha(mask.point(lambda v: int(strength * (1 - v / 255))))
    img.alpha_composite(dark)


def finish(c, name, mode="full", vig=190):
    img = c.img.resize((W, H), Image.LANCZOS)
    if mode == "fg":
        img.save(OUT / f"{name}_fg.png", optimize=True)
        return
    if vig:
        vignette(img, vig)
    suffix = "_bg" if mode == "bg" else ""
    rgb = img.convert("RGB")
    p = OUT / f"{name}{suffix}.png"
    rgb.save(p, optimize=True)
    if p.stat().st_size > 1_400_000:
        rgb.quantize(256, dither=Image.FLOYDSTEINBERG).save(p, optimize=True)


# ================================================================== SCENES
G = 1040  # default ground horizon


def sc_mascot(c, B, Fg, rng):
    c.grad(0, 0, W, H, (18, 20, 40), (10, 12, 26))
    c.glow(540, 760, 420, CRIM + (90,), 150)
    for x in (230, 540, 850):
        c.ell(x, 1090, 120, 22, (4, 6, 16, 160))
    draw_kid(c, 230, 1080, 1.28, "stand", flip=1, aL=-20, aR=22, fl=("R", 175, False))
    draw_kid(c, 540, 1080, 1.28, "walk", flip=1, face="normal", fl=("R", 70, False))
    draw_kid(c, 850, 1080, 1.28, "stand", back=True, aL=-16, aR=16, fl=None, tail=(-170, 190))


def sc_hook(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=880, moon_pos=(820, 290), edge_trees=True)
        c.grad(0, 880, W, H, (30, 38, 70), (8, 8, 20))
        wall(c, rng, -20, W + 20, 930, 110, gaps=[])
        c.fog(780, 960, (130, 80, 100), 60)
        c.grad(0, 930, W, H, (34, 40, 72), (8, 8, 18))
        c.tint((196, 18, 31, 54))
        c.glow(560, 760, 380, CRIM + (60,), 130)
    if Fg:
        draw_grim(c, 250, 930, 0.95, "blocked", flip=1)
        draw_kid(c, 470, 1105, 1.05, "fall", flip=-1)
        draw_vrykolakas(c, 700, 1075, 0.98, "claw", flip=-1, aL=(-130, -150), aR=(-125, -160))
        speed(c, 600, 760, 330, 540, 20, (255, 255, 255, 40), seed=4, w=8)


def sc_card(c, B, Fg, rng):
    c.grad(0, 0, W, H, (24, 12, 26), (8, 8, 18))
    c.glow(540, 760, 420, CRIM + (130,), 130)
    # beam-like spotlight
    c.poly([(470, 0), (610, 0), (900, 1300), (180, 1300)], (255, 180, 190, 22))
    pines(c, rng, 1100, 520, 760, 110, mul(NAVY0, 0.9), rim=None)
    pines(c, rng, 1180, 700, 900, 170, (10, 10, 22))
    c.ell(540, 1160, 340, 40, (4, 4, 10, 200))
    draw_kid(c, 540, 1160, 2.0, "stand", aL=-16, aR=24, fl=("R", 174, False), face="determined")


def sc_spin_fighters(c, B, Fg, rng):
    c.grad(0, 0, W, H, (24, 14, 30), (8, 8, 18))
    c.glow(540, 700, 480, CRIM + (60,), 150)
    for x0 in (50, 570):
        c.rrect(x0 - 12, 300, x0 + 472, 1160, 40, (40, 46, 84))
        c.rrect(x0, 316, x0 + 460, 1144, 30, (14, 16, 34))
    # left reel lit
    c.grad(60, 322, 500, 1138, (22, 28, 52), (60, 76, 96))
    c.glow(280, 760, 260, (170, 220, 190, 90), 90)
    draw_vrykolakas(c, 280, 1090, 0.92, "grin")
    # right reel lit
    c.grad(580, 322, 1020, 1138, (26, 20, 40), (80, 24, 40))
    c.glow(800, 780, 260, (255, 60, 70, 70), 90)
    draw_grim(c, 740, 1090, 0.82, "stand", flip=-1)
    # cylinder shading + neighbors
    for x0 in (60, 580):
        c.grad(x0, 322, x0 + 440, 520, (0, 0, 0, 230), (0, 0, 0, 0))
        c.grad(x0, 960, x0 + 440, 1138, (0, 0, 0, 0), (0, 0, 0, 230))
        for yy, col in ((372, (90, 30, 50)), (1100, (90, 30, 50))):
            c.rrect(x0 + 150, yy - 14, x0 + 290, yy + 14, 10, col + (120,))
    for x0 in (50, 570):
        c.rect(x0 - 12, 700, x0, 760, CRIM)
        c.rect(x0 + 460, 700, x0 + 472, 760, CRIM)
    c.rect(520, 330, 560, 1130, (22, 24, 48))
    c.glow(540, 730, 60, CRIM + (130,), 24)
    c.poly([(520, 700), (560, 730), (520, 760)], CRIM)


def sc_vs(c, B, Fg, rng):
    c.grad(0, 0, W, H, (26, 22, 52), (12, 10, 26))
    c.poly([(0, 0), (700, 0), (380, H), (0, H)], (28, 34, 64))
    c.poly([(700, 0), (W, 0), (W, H), (380, H)], (16, 14, 32))
    c.glow(270, 640, 300, (150, 210, 180, 60), 100)
    c.glow(830, 640, 300, (255, 50, 70, 60), 100)
    c.poly([(300, 260), (780, 260), (540, 760)], CRIM_D)
    c.poly([(340, 290), (740, 290), (540, 690)], CRIM)
    c.glow(540, 480, 160, (255, 80, 90, 120), 60)
    c.poly([(420, 330), (660, 330), (540, 520)], (255, 255, 255, 30))
    draw_vrykolakas(c, 230, 1100, 0.86, "grin", mouth="open")
    draw_grim(c, 850, 1100, 0.7, "snarl", flip=-1)
    for i, yy in enumerate((1150, 1190, 1230)):
        c.rrect(260, yy, 820, yy + 26, 13, (8, 8, 20))
        c.rrect(264, yy + 4, 816, yy + 22, 10, (24, 26, 52))
        c.rrect(260, yy, 820, yy + 26, 13, (196, 18, 31, 0)) if False else None
        c.d.rounded_rectangle([260 * SS, yy * SS, 820 * SS, (yy + 26) * SS], 13 * SS, outline=CRIM, width=3 * SS)


def house_wall(c, x0, x1, y0, y1):
    c.grad(x0, y0, x1, y1, (214, 220, 242), (170, 178, 210))
    c.rect(x1 - 90, y0, x1, y1, (150, 158, 192))
    c.rect(x0, y0, x1, y0 + 18, (232, 236, 252))


def sc_window(c, B, Fg, rng):
    if B:
        c.grad(0, 0, W, H, NAVY0, (40, 48, 92))
        stars(c, rng, 60, 600)
        moon(c, 860, 300, 78, crescent=True)
        pines(c, rng, 1020, 280, 440, 80, (22, 28, 60))
        c.fog(850, 1040, (120, 134, 190), 70)
        pines(c, rng, 1090, 340, 520, 130, (14, 18, 40))
        c.grad(0, 1040, W, H, (30, 38, 70), (8, 10, 20))
        house_wall(c, -10, 600, 260, 1120)
        c.rect(-10, 1120, 600, 1160, (130, 136, 168))
        c.rect(-10, 1050, 600, 1120, (186, 192, 224))
        c.rrect(190, 520, 470, 820, 8, (230, 236, 252))
        c.rrect(206, 536, 454, 804, 6, (255, 198, 112))
        c.glow(330, 670, 200, (255, 190, 100, 110), 70)
        for sx in (172, 470):
            c.rrect(sx, 520, sx + 36, 820, 4, (50, 90, 170))
            c.rect(sx + 8, 540, sx + 12, 800, (70, 112, 196))
        c.rrect(170, 812, 492, 840, 6, (240, 244, 255))
        c.rrect(60, 460, 100, 540, 4, (60, 50, 70)) if False else None
        c.rrect(80, 880, 160, 1040, 6, (70, 110, 190))     # door
        c.ell(120, 960, 6, 6, (230, 210, 120))
        for px in (500,):
            c.ell(px, 1010, 34, 14, (170, 100, 80))
            for k in range(5):
                c.ell(px - 30 + k * 15, 970 - (k % 2) * 18, 16, 20, (220, 90, 140))
        c.tint((60, 80, 150, 24))
        fireflies(c, [(770, 640), (880, 780), (700, 900)], 0.8)
        fireflies(c, [(640, 690)], 1.6)
    if Fg:
        draw_kid(c, 330, 822, 0.86, "walk", flip=1, rot=14, aL=-60, aR=75, lL=-30, lR=50, fl=("R", 60, False))


def sc_forest_graves(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=960, moon_pos=(300, 290), edge_trees=False)
        c.grad(0, 960, W, H, (30, 38, 70), (8, 10, 20))
        # distant churchyard
        wall(c, rng, 560, 1040, 950, 52, gaps=[(740, 800)], c1=(66, 74, 108), c2=(58, 66, 98), light=(84, 92, 124))
        mound(c, 850, 934, 70, 30)
        for tx, tl in ((620, -6), (700, 5), (920, -4), (990, 7)):
            tomb(c, tx, 930, 34, 58, tl)
        c.line([(800, 934), (800, 890)], 5, (84, 62, 60)); c.line([(786, 904), (816, 904)], 5, (84, 62, 60))
        c.fog(880, 990, (130, 144, 200), 90)
        c.poly([(660, 962), (820, 962), (1120, 1500), (-120, 1500)], (46, 54, 94, 150))
        # tall foreground trunks framing
        for tx, wd in ((90, 78), (1000, 86)):
            c.rect(tx - wd / 2, 0, tx + wd / 2, H, (8, 10, 22))
        pines(c, rng, 1160, 1000, 1200, 9999, (8, 10, 22), x0=-30, x1=-25, tiers=6)
        fireflies(c, [(620, 800)], 1.8)
        fireflies(c, [(520, 880), (700, 740)], 0.7)
    if Fg:
        draw_kid(c, 330, 1130, 0.9, "walk", flip=1, aR=18, fl=("R", 35, False), aL=-26)


def sc_grandma(c, B, Fg, rng):
    if B:
        c.grad(0, 0, W, H, (44, 54, 92), (24, 28, 56))
        c.rect(0, 1020, W, H, (36, 38, 66))
        c.grad(0, 1020, W, H, (56, 54, 84), (18, 18, 34))
        for x in range(0, W, 120):                                       # wall planks
            c.rect(x, 0, x + 6, 1020, (36, 42, 74))
        c.rrect(600, 300, 900, 700, 10, (240, 200, 130))
        c.rrect(614, 314, 886, 686, 6, (255, 214, 140))
        c.glow(750, 500, 360, (255, 200, 120, 100), 100)
        c.rect(746, 314, 754, 686, (216, 168, 100)); c.rect(614, 496, 886, 504, (216, 168, 100))
        c.ell(150, 420, 90, 90, (20, 24, 50, 140))
        garlic(c, 90, 270, 1.0)
        garlic(c, 190, 280, 0.8)
        c.limb((60, 262), (260, 262), 6, 6, (110, 80, 60))
        c.tint((120, 140, 200, 32))
    if Fg:
        k = draw_kid(c, 760, 1090, 1.2, "stand", flip=-1, aL=-18, aR=18, fl=None, face="normal")
        p_near = k.pt(40, -110)
        p_far = k.pt(-40, -110)
        draw_grandma(c, 360, 1090, 1.18, 1, reach=(p_near[0] + 6, p_near[1] - 8), reach2=(p_near[0] - 150, p_near[1] - 120))
        garlic(c, p_near[0] - 18, p_near[1] - 6, 0.52)
        lamp(c, p_far[0], p_far[1] + 8, 0.42)
        matchbox(c, p_near[0] - 150, p_near[1] - 118, 0.5, -20)


def sc_grave_rises(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=960, moon_pos=(250, 300), edge_trees=True)
        c.grad(0, 960, W, H, (28, 34, 64), (8, 8, 18))
        c.fog(860, 1000, (110, 124, 180), 80)
        tomb(c, 120, 990, 90, 130, -6)
        tomb(c, 980, 980, 80, 120, 8)
        # fresh grave mound, cracked
        mound(c, 680, 1060, 270, 90)
        for pts in (((600, 1000), (640, 1020), (620, 1050), (670, 1070)), ((760, 1000), (730, 1030), (770, 1050), (740, 1075))):
            c.line(list(pts), 6, (20, 14, 22))
        c.ell(680, 1030, 120, 28, (16, 10, 18))
    if Fg:
        draw_vrykolakas(c, 690, 1075, 0.95, "rise", flip=-1)
        mound(c, 560, 1100, 140, 40)
        mound(c, 800, 1100, 130, 36)
        c.ell(680, 1080, 150, 24, (16, 10, 18))
        draw_kid(c, 280, 1200, 1.15, "scared", flip=1, rot=-16)


def sc_claw_miss(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=1000, moon_pos=(860, 330), edge_trees=True)
        c.grad(0, 1000, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(900, 1020, (110, 124, 180), 60)
        tomb(c, 140, 1030, 90, 120, 5)
        c.tint((196, 18, 31, 26))
    if Fg:
        draw_kid(c, 390, 1060, 1.1, "fall", flip=1, rot=48, aL=130, aR=160, lL=22, lR=-30, tail=(100, 330))
        draw_vrykolakas(c, 840, 1040, 0.98, "claw", flip=-1, rot=-4, aL=(-80, -118), aR=(-95, -128))
        slash(c, 610, 640, 210, 120, 240, 34, CRIM)
        slash(c, 650, 700, 230, 130, 235, 22, CRIM)
        impact(c, 560, 860, 80, (255, 255, 255), seed=9)
        speed(c, 560, 860, 120, 300, 18, (255, 255, 255, 70), seed=8)


def sc_grim_appears(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=1040, moon_pos=(300, 420), moon_r=120, edge_trees=True)
        c.grad(0, 1040, W, H, (30, 38, 70), (8, 8, 18))
        wall(c, rng, -20, W + 20, 1020, 130, gaps=[(780, 930)])
        c.fog(900, 1060, (120, 134, 190), 80)
        tomb(c, 540, 1100, 380, 300, 0, cross=True) if False else None
        # big gravestone to stand on
        c.ell(556, 1110, 280, 24, (4, 6, 16, 150))
        c.poly([(380, 1100), (380, 840), (420, 800), (700, 800), (740, 840), (740, 1100)], (74, 80, 114))
        c.poly([(370, 1100), (370, 846), (412, 806), (690, 806), (730, 846), (730, 1100)], (100, 108, 144))
        c.line([(560, 880), (560, 1000)], 12, (70, 76, 108)); c.line([(500, 920), (620, 920)], 12, (70, 76, 108))
    if Fg:
        draw_kid(c, 855, 1000, 0.5, "scared", flip=-1, aL=-30, aR=30)
        if B or True:
            wall(c, random.Random(3), 780, 1100, 1020, 130, gaps=[(780, 830)])
        draw_grim(c, 560, 806, 1.12, "snarl", flip=-1)


def sc_round1(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=1010, moon_pos=(840, 300), edge_trees=True)
        c.grad(0, 1010, W, H, (28, 34, 66), (8, 8, 18))
        c.fog(900, 1030, (110, 124, 180), 70)
        tomb(c, 880, 1060, 100, 140, 7)
        tomb(c, 330, 1030, 80, 110, -8)
    if Fg:
        draw_kid(c, 150, 1110, 0.62, "hug", flip=1)
        tomb(c, 160, 1150, 230, 300, -3)
        draw_vrykolakas(c, 740, 1060, 0.9, "claw", flip=-1, rot=-52, aL=(-100, -140), aR=(-120, -150))
        draw_grim(c, 460, 920, 0.95, "lunge", flip=1, rot=26)
        impact(c, 600, 680, 150, (255, 255, 255), seed=2)
        speed(c, 600, 690, 200, 420, 22, (255, 255, 255, 80), seed=5)


def sc_round2_thrown(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=860, moon_pos=(830, 300), edge_trees=True)
        c.grad(0, 860, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(740, 900, (110, 124, 180), 60)
    if Fg:
        draw_vrykolakas(c, 190, 900, 0.8, "throw", flip=1)
        draw_grim(c, 840, 900, 0.8, "blocked", flip=-1)
    if B:
        wall(c, rng, -20, W + 20, 940, 110, gaps=[])
        boundary(c, 560, 1100, 944)
        c.grad(0, 940, W, H, (34, 40, 72), (8, 8, 18))
        c.tint((196, 18, 31, 30))
    if Fg:
        c.limb((380, 700), (520, 560), 12, 10, CRIM) if False else None
        draw_kid(c, 520, 800, 1.0, "fall", flip=1, rot=70, aL=-160, aR=165, lL=30, lR=-30, tail=(-125, 300))
        speed(c, 540, 700, 180, 330, 14, (255, 255, 255, 60), seed=6, w=7)


def sc_round2_stuck(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=860, moon_pos=(830, 300), edge_trees=True)
        c.grad(0, 860, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(740, 900, (110, 124, 180), 60)
    if Fg:
        draw_grim(c, 260, 900, 0.9, "blocked", flip=1)
    if B:
        wall(c, rng, -20, W + 20, 940, 110, gaps=[])
        boundary(c, 0, 520, 944)
        c.grad(0, 940, W, H, (34, 40, 72), (8, 8, 18))
        c.glow(540, 1200, 700, CRIM + (60,), 180)
    if Fg:
        draw_kid(c, 470, 1120, 1.0, "fall", flip=-1, rot=82)
        draw_vrykolakas(c, 760, 1090, 0.95, "choke", flip=-1)


def sc_garlic_crush(c, B, Fg, rng):
    c.grad(0, 0, W, H, (88, 12, 28), (24, 6, 16))
    c.glow(540, 700, 520, (255, 90, 90, 70), 160)
    speed(c, 540, 700, 330, 800, 28, (255, 160, 160, 40), seed=12, w=22)
    # big sleeve + hand
    c.poly([(380, 1200), (700, 1200), (780, 1000), (320, 960)], (196, 200, 216))
    c.poly([(560, 1200), (700, 1200), (780, 1000), (600, 980)], (150, 156, 182))
    c.poly([(560, 1060), (840, 1000), (900, 1140), (560, 1200)], CRIM) if False else None
    c.poly([(330, 1000), (790, 1000), (810, 1040), (310, 1040)], (150, 156, 182))
    # garlic clove being crushed
    c.poly([(440, 760), (560, 640), (660, 760), (620, 880), (480, 880)], (244, 240, 220))
    c.poly([(560, 640), (660, 760), (620, 880), (560, 880)], (210, 206, 186))
    c.poly([(520, 640), (560, 590), (600, 640)], (244, 240, 220))
    # palm
    c.ell(540, 860, 230, 190, (206, 168, 150))
    c.ell(534, 850, 222, 182, (240, 208, 182))
    for i, (fx, fy, ang) in enumerate(((330, 730, -18), (440, 640, -6), (560, 610, 4), (680, 650, 16))):
        c.limb((fx - ang * 2 + 20, fy + 150), (fx, fy), 76, 66, (240, 208, 182))
        c.limb((fx, fy), (fx + 40 + ang, fy + 70), 66, 56, (240, 208, 182))
        c.limb((fx + 5, fy + 6), (fx + 30, fy + 60), 22, 20, (206, 168, 150, 180)) if False else None
    c.limb((740, 880), (640, 780), 80, 60, (240, 208, 182))      # thumb
    c.limb((660, 780), (590, 760), 60, 52, (240, 208, 182))
    dust(c, rng, 540, 760, 260, 70)
    c.glow(540, 760, 120, (255, 255, 255, 140), 40)
    # scarf end
    c.poly([(220, 1100), (300, 1000), (340, 1020), (280, 1180)], CRIM)


def sc_garlic_throw(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=1040, moon_pos=(180, 330), edge_trees=True)
        c.grad(0, 1040, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(920, 1060, (110, 124, 180), 60)
        c.tint((196, 18, 31, 20))
    if Fg:
        draw_kid(c, 250, 1110, 1.2, "throw", flip=1, aR=105)
        draw_vrykolakas(c, 790, 1100, 1.0, "recoil", flip=-1)
        dust(c, rng, 560, 690, 130, 40)
        c.ell(560, 700, 90, 70, (255, 255, 255, 180))
        impact(c, 600, 690, 100, (255, 255, 255), seed=14, n=10)
        speed(c, 580, 700, 140, 330, 22, (255, 255, 255, 80), seed=15, w=8)
        dust(c, random.Random(4), 640, 680, 200, 40)


def sc_flash_lure(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=860, moon_pos=(240, 310), edge_trees=True)
        c.grad(0, 860, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(740, 900, (110, 124, 180), 60)
        for tx, tl, w, h in ((860, 4, 100, 150), (960, -7, 80, 120), (720, -5, 70, 100)):
            tomb(c, tx, 900, w, h, tl)
        wall(c, rng, -20, W + 20, 940, 110, gaps=[(430, 700)])
        boundary(c, 430, 700, 944)
        c.grad(0, 940, W, H, (34, 40, 72), (8, 8, 18))
        # grim eyes in shadow behind gravestones
        c.glow(880, 830, 40, (255, 40, 50, 160), 20)
    if Fg:
        draw_grim(c, 900, 900, 0.75, "snarl", flip=-1, alpha=0.0) if False else None
        c.ell(868, 826, 14, 10, (255, 56, 56)); c.ell(930, 826, 14, 10, (255, 56, 56))
        c.ell(870, 826, 5, 7, (255, 214, 200)); c.ell(932, 826, 5, 7, (255, 214, 200))
        draw_kid(c, 560, 930, 0.72, "flashlight", flip=-1, aR=-100, aL=24, fl=("R", -108, True), lL=-14, lR=16)
        draw_vrykolakas(c, 190, 1120, 1.02, "stagger", flip=1)


def sc_grim_pounce(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=860, moon_pos=(840, 310), edge_trees=True)
        c.grad(0, 860, W, H, (30, 38, 70), (8, 8, 18))
        c.fog(740, 900, (110, 124, 180), 60)
        tomb(c, 900, 930, 120, 170, 5)
        wall(c, rng, -20, W + 20, 940, 110, gaps=[(300, 620)])
        boundary(c, 300, 620, 944)
        c.grad(0, 940, W, H, (34, 40, 72), (8, 8, 18))
    if Fg:
        draw_kid(c, 150, 930, 0.7, "limp", flip=1, rot=2, lL=-10, lR=10, fl=("R", 25, False), face="normal")
        draw_vrykolakas(c, 440, 1030, 1.0, "stagger", flip=-1, rot=-8, aL=(-100, -120), aR=(-110, -130))
        draw_grim(c, 830, 900, 0.95, "lunge", flip=-1, rot=-6)
        impact(c, 660, 700, 100, (255, 90, 90), seed=21, n=10)
        speed(c, 660, 700, 130, 320, 18, (255, 255, 255, 70), seed=22)


def sc_ko(c, B, Fg, rng):
    if B:
        forest_bg(c, rng, G=1000, sky_top=(60, 14, 38), sky_bot=(150, 34, 56), moon_pos=(540, 360), moon_r=110,
                  moon_col=(250, 200, 190), halo=(255, 90, 100), far=(60, 22, 56), mid=(34, 16, 44), fogc=(200, 90, 110),
                  stars_on=False)
        c.grad(0, 1000, W, H, (44, 28, 60), (10, 6, 18))
    if Fg:
        c.ell(540, 1170, 280, 24, (4, 4, 10, 170))
        draw_vrykolakas(c, 620, 1160, 0.72, "down", flip=-1)
        draw_kid(c, 270, 1060, 1.1, "limp", flip=1, rot=4, aR=140, fl=("R", 150, False), face="tired", lL=-12, lR=10)
        draw_grim(c, 800, 1040, 0.88, "stand", flip=-1)


def sc_dawn(c, B, Fg, rng):
    if B:
        c.grad(0, 0, W, 1000, (92, 62, 120), (255, 176, 96))
        c.glow(780, 940, 380, (255, 220, 140, 200), 120)
        c.ell(780, 960, 140, 140, (255, 236, 180))
        # distant hills + village
        c.poly([(0, 940), (240, 880), (560, 930), (900, 880), (W, 920), (W, 1040), (0, 1040)], (96, 58, 108))
        for hx, hy, hw in ((640, 910, 44), (720, 900, 56), (830, 890, 48), (930, 905, 52), (560, 920, 40)):
            c.rect(hx, hy, hx + hw, hy + 38, (250, 232, 214))
            c.poly([(hx - 4, hy), (hx + hw + 4, hy), (hx + hw / 2, hy - 18)], (200, 100, 80))
            c.rect(hx + hw * 0.4, hy + 14, hx + hw * 0.4 + 8, hy + 28, (255, 200, 100))
        # church tower
        c.rect(120, 560, 240, 960, (110, 68, 104)); c.rect(120, 560, 150, 960, (84, 52, 88))
        c.poly([(104, 560), (256, 560), (180, 430)], (74, 44, 80))
        c.rrect(152, 600, 208, 700, 26, (36, 22, 44))
        c.ell(180, 660, 12, 14, (230, 190, 100))
        c.line([(180, 430), (180, 380)], 6, (74, 44, 80)); c.line([(160, 400), (200, 400)], 6, (74, 44, 80))
        pines(c, rng, 1000, 300, 460, 90, (66, 38, 82))
        c.fog(900, 1060, (255, 190, 140), 90)
        c.grad(0, 1000, W, H, (72, 44, 78), (20, 12, 28))
        tomb(c, 40, 1040, 100, 160, 7, face=(150, 100, 130), side=(112, 70, 104))
        tomb(c, 1020, 1000, 80, 110, -6, face=(150, 100, 130), side=(112, 70, 104))
        # open grave
        c.poly([(40, 1100), (330, 1070), (390, 1150), (-10, 1190)], (12, 8, 18))
        c.poly([(40, 1100), (330, 1070), (320, 1085), (50, 1115)], (130, 84, 76))
        c.tint((255, 160, 80, 24))
    if Fg:
        draw_vrykolakas(c, 440, 1120, 0.62, "down", flip=-1)
        draw_grim(c, 700, 1070, 0.8, "drag", flip=-1)
        draw_kid(c, 900, 960, 0.55, "walk", flip=1, aR=-10, fl=None)
        lamp(c, 925, 905, 0.2)


def sc_cliff(c, B, Fg, rng):
    if B:
        c.grad(0, 0, W, 1300, (30, 40, 86), (130, 100, 120))
        c.grad(0, 560, W, 900, (255, 160, 100, 0), (255, 170, 100, 70))
        c.fog(500, 900, (190, 200, 240), 40)
        c.grad(0, 880, W, H, (40, 38, 66), (8, 8, 18))
        mound(c, 540, 1010, 460, 280, soil=(70, 50, 62), soil_l=(100, 74, 84))
        for x in range(60, 1040, 46):
            c.poly([(x, 1030 + (x % 5) * 3), (x + 18, 1030), (x + 6, 1030 - 24 - (x % 7) * 3)], (30, 44, 70))
        # soil bulge
        c.ell(540, 760, 130, 70, (110, 82, 90))
        c.ell(540, 780, 110, 52, (88, 64, 74))
        c.ell(540, 740, 70, 34, (120, 92, 100))
        for sx in (-90, 40, 100, -40):
            c.ell(540 + sx, 730 + abs(sx) * 0.1, 10, 7, (50, 36, 46))
        c.line([(470, 760), (520, 790), (500, 830)], 6, (24, 16, 26))
        c.line([(610, 750), (580, 800), (606, 840)], 6, (24, 16, 26))
        matchbox(c, 250, 1140, 1.5, -12)
        lamp(c, 850, 1100, 1.0, lit=False, rot=64)
    if Fg:
        c.glow(540, 700, 80, (200, 240, 210, 60), 40)
        for i, (kx, ky, rr) in enumerate(((510, 700, 22), (545, 694, 24), (580, 702, 22))):
            c.ell(kx, ky, rr, rr * 0.9, SK_D)
            c.ell(kx - 3, ky - 4, rr * 0.85, rr * 0.75, SK)
        c.limb((520, 720), (520, 760), 40, 44, SK_D)


def sc_cta(c, B, Fg, rng):
    c.grad(0, 0, W, H, (6, 6, 12), (12, 8, 14))
    c.grad(0, 980, W, H, (26, 18, 24), (8, 6, 10))
    for _ in range(40):
        x, y = rng.randint(0, W), rng.randint(990, 1200)
        c.ell(x, y, rng.randint(3, 8), rng.randint(2, 4), (14, 10, 16))
    # crimson question-mark crack
    cx, cy, r = 540, 520, 150
    pts = []
    for i in range(0, 19):
        a = rad(200 + i * 14)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    pts += [(cx + 70, cy + 100), (cx + 10, cy + 190), (cx, cy + 250), (cx - 4, cy + 300)]
    jr = random.Random(2)
    jag = [(x + jr.randint(-9, 9), y + jr.randint(-9, 9)) for x, y in pts]
    c.glow(540, 620, 240, CRIM + (110,), 100)
    c.line(jag, 30, CRIM_D + (255,))
    c.line(jag, 16, CRIM + (255,))
    c.line(jag, 6, (255, 150, 150, 255))
    for k in range(len(jag) - 1, 0, -4):
        x, y = jag[k]
        c.line([(x, y), (x + jr.randint(-70, 70), y + jr.randint(-50, 50))], 5, CRIM)
    c.line([(cx - 4, cy + 300), (cx - 14, cy + 340)], 6, (4, 4, 6))
    c.glow(540, 880, 70, CRIM + (150,), 30)
    c.ell(540, 880, 36, 28, CRIM_D)
    c.ell(540, 878, 28, 21, CRIM)
    c.ell(540, 875, 10, 8, (255, 150, 150))
    # kid scarf silhouette
    draw_kid(c, 540, 1135, 0.46, "stand", dark=True, back=True, aL=-16, aR=16, fl=None, tail=(-110, 230))


def sc_spin_cells(c, B, Fg, rng):
    c.grad(0, 0, W, H, (36, 8, 20), (10, 4, 10))
    for i, x0 in enumerate(range(-20, W, 224)):
        c.rect(x0, 300, x0 + 210, 1150, (30, 10, 18))
        c.rect(x0 + 8, 316, x0 + 202, 1136, (60, 14, 28) if i != 2 else (110, 26, 44))
        c.glow(x0 + 105, 700, 150, CRIM + ((120 if i == 2 else 40),), 60)
        for bx in range(x0 + 20, x0 + 200, 38):
            c.rect(bx, 316, bx + 10, 1136, (14, 6, 12))
        c.rect(x0 + 8, 316, x0 + 202, 340, (14, 6, 12))
        c.rect(x0 + 8, 1110, x0 + 202, 1136, (14, 6, 12))
    for i, x0 in enumerate((-20, 204, 428, 652, 876)):
        if i == 2:
            continue
        c.ell(x0 + 105, 900, 56, 150, (6, 4, 8, 220))
        c.ell(x0 + 105, 760, 40, 46, (6, 4, 8, 220))
    for ex in (-20 + 105 + 224 * 0, 204 + 105 + 224 * 3 - 224 * 3):
        pass
    draw_vrykolakas(c, 535, 1100, 0.52, "grin")
    for x in (-20 + 105, 876 + 105):
        c.ell(x - 14, 758, 5, 5, (255, 70, 70)); c.ell(x + 14, 758, 5, 5, (255, 70, 70))
    c.rect(0, 1150, W, 1170, (196, 18, 31, 120))


def sc_spin_shrines(c, B, Fg, rng):
    c.grad(0, 0, W, H, (40, 30, 24), (12, 10, 14))
    for i, x0 in enumerate(range(-20, W, 224)):
        lit = i == 2
        c.rect(x0, 300, x0 + 210, 1150, (54, 40, 30))
        c.poly([(x0 + 20, 1136), (x0 + 20, 520), (x0 + 105, 330), (x0 + 190, 520), (x0 + 190, 1136)],
               (236, 188, 90) if lit else (110, 80, 44))
        c.poly([(x0 + 36, 1136), (x0 + 36, 530), (x0 + 105, 370), (x0 + 174, 530), (x0 + 174, 1136)],
               (255, 224, 140) if lit else (50, 38, 34))
        c.glow(x0 + 105, 760, 150, (255, 200, 100, 140 if lit else 40), 60)
        for cxx, cyy in ((x0 + 50, 1060), (x0 + 160, 1060)):
            c.rect(cxx - 8, cyy - 50, cxx + 8, cyy, (244, 236, 210))
            c.glow(cxx, cyy - 62, 24, (255, 210, 110, 190), 14)
            c.poly([(cxx - 7, cyy - 50), (cxx + 7, cyy - 50), (cxx, cyy - 78)], (255, 190, 80))
        c.rect(x0, 1136, x0 + 210, 1160, (84, 60, 38))
    draw_grim(c, 640, 1080, 0.5, "stand", flip=-1)
    for x in (-20 + 105, 204 + 105, 652 + 105, 876 + 105):
        c.ell(x, 900, 54, 150, (20, 14, 14, 200))
        c.ell(x, 740, 38, 44, (20, 14, 14, 200))


SCENES = [
    ("mascot-sheet-the-kid", sc_mascot, False, 120),
    ("b-hook-freeze-grim-stuck", sc_hook, True, 190),
    ("b-card-the-kid", sc_card, False, 190),
    ("b-spin-fighters", sc_spin_fighters, False, 180),
    ("b-vs-triangle", sc_vs, False, 180),
    ("b-kid-window-firefly", sc_window, False, 190),
    ("b-forest-old-graves", sc_forest_graves, False, 190),
    ("b-grandma-garlic-flashback", sc_grandma, False, 180),
    ("b-grave-rises", sc_grave_rises, False, 190),
    ("b-claw-miss-kid-falls", sc_claw_miss, False, 190),
    ("b-grim-appears-stance", sc_grim_appears, True, 190),
    ("b-round1-grim-slams", sc_round1, False, 190),
    ("b-round2-thrown-over-wall", sc_round2_thrown, False, 190),
    ("b-round2-grim-stuck", sc_round2_stuck, False, 190),
    ("b-round3-garlic-crush", sc_garlic_crush, False, 200),
    ("b-round3-garlic-throw", sc_garlic_throw, False, 190),
    ("b-round3-flashlight-lure", sc_flash_lure, True, 190),
    ("b-round3-grim-pounce", sc_grim_pounce, True, 190),
    ("b-ko-winner-kid-grim", sc_ko, False, 190),
    ("b-dawn-peace", sc_dawn, False, 150),
    ("b-cliffhanger-soil-moves", sc_cliff, True, 190),
    ("b-cta-whos-next", sc_cta, False, 190),
    ("b-spin-cells-monsters", sc_spin_cells, False, 170),
    ("b-spin-shrines-guardians", sc_spin_shrines, False, 170),
]


def render(name, fn, layered, vig):
    for mode in (("full", "bg", "fg") if layered else ("full",)):
        c = Canvas()
        B, Fg = mode != "fg", mode != "bg"
        fn(c, B, Fg, random.Random(hash(name) % 1000 if False else sum(map(ord, name))))
        finish(c, name, mode, vig)
    print("ok", name)


if __name__ == "__main__":
    only = set(sys.argv[1:])
    for name, fn, layered, vig in SCENES:
        if not only or name in only or any(o in name for o in only):
            render(name, fn, layered, vig)
