"""
THE SAFEHOUSE — brand system (single source of truth).

Every product imports from here. Change the logo, fonts, colours or maker's mark
in THIS file and every current and future product picks it up on the next build.

    logo(size, depth)         house-and-orbit mark (original geometry, owned by The Safehouse)
    wordmark(cap, depth)      THE SAFEHOUSE in wide-set Jost, with the signature accent over the last E
    lockup(cap, depth)        logo + wordmark side by side
    maker_mark(code, depth)   origin stamp: lockup + "MADE IN KIGALI · <catalogue no.>"
    text_solid(...)           any text in a brand font
"""
import os
import numpy as np
from manifold3d import Manifold, CrossSection, FillRule
from matplotlib.textpath import TextPath
from matplotlib.font_manager import FontProperties

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- colours (filament) -------------------------------------------------
COLOURS = {"black": "#1C1C1C", "white": "#F2F0EB", "grey": "#A4A29B",
           "red": "#B3262E", "blue": "#24489A"}   # red/blue: toy line only (filament on hand)

# ---- fonts (all SIL Open Font License: free for commercial products) ----
FONTS = {
    "word":    "Jost-500.ttf",                    # wordmark, large
    "word-sm": "Jost-600.ttf",                    # wordmark, small (thicker strokes print cleanly)
    "label":   "Jost-600.ttf",                    # titles, labels
    "serif":   "CormorantGaramond-SemiBold.ttf",  # Atelier names
    "mono":    "IBMPlexMono-Medium.ttf",          # catalogue numbers
}
_FC = {}
def _font(fid):
    if fid not in _FC:
        from fontTools.ttLib import TTFont
        path = os.path.join(HERE, "fonts", FONTS[fid]); tt = TTFont(path)
        _FC[fid] = dict(path=path, upm=tt["head"].unitsPerEm, cap=tt["OS/2"].sCapHeight,
                        cmap=tt.getBestCmap(), hmtx=tt["hmtx"])
    return _FC[fid]

def text_solid(text, cap_mm, depth, font="label", tracking=0.0):
    """Text on XY (+Z up), baseline y=0, ink starting at x=0. cap_mm = capital height."""
    f = _font(font); em = cap_mm * f["upm"] / f["cap"]
    fp = FontProperties(fname=f["path"]); x = 0.0; polys = []
    for ch in text:
        g = f["cmap"].get(ord(ch)); adv = (f["hmtx"][g][0] if g else f["upm"] / 2) / f["upm"] * em
        if not ch.isspace():
            polys += [p.tolist() for p in TextPath((x, 0), ch, size=em, prop=fp).to_polygons() if len(p) >= 3]
        x += adv + tracking * em
    cs = CrossSection(polys, FillRule.EvenOdd); b = cs.bounds()
    return cs.translate([-b[0], 0]).extrude(depth), (b[2] - b[0], cap_mm)

# ---- logo: house + orbit ------------------------------------------------
def _stroke(pts, t):
    """Polyline as a round-jointed stroke of width t."""
    cs = None
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        L = np.hypot(x1 - x0, y1 - y0); a = np.degrees(np.arctan2(y1 - y0, x1 - x0))
        seg = CrossSection.square([L, t]).translate([0, -t / 2]).rotate(a).translate([x0, y0])
        cs = seg if cs is None else cs + seg
    for p in pts:
        cs = cs + CrossSection.circle(t / 2, 24).translate(list(p))
    return cs

def _logo_2d(t=6.5):
    """Original mark on a 100-unit grid: a pitched house with a chimney, a door,
    and an orbit ring passing in front of the walls and behind the house."""
    house = [[24, 6], [24, 50], [48, 74], [61, 61], [61, 70], [70, 70], [70, 6], [52, 6]]
    door = [[36, 40], [47, 40], [47, 6]]
    sil = CrossSection([[[70, 6], [70, 52], [48, 74], [24, 50], [24, 6]]])      # filled outline
    cx, cy, rx, ry = 47, 30, 42, 11
    ang = np.linspace(np.pi, 2 * np.pi, 60)                                    # front (lower) half
    front = _stroke([[cx + rx * np.cos(a), cy + ry * np.sin(a)] for a in ang], t)
    ang = np.linspace(0, np.pi, 60)                                            # back (upper) half
    back = _stroke([[cx + rx * np.cos(a), cy + ry * np.sin(a)] for a in ang], t)
    gap = t * 0.55
    body = _stroke(house, t) + _stroke(door, t)
    body = body - front.offset(gap)                     # ring passes IN FRONT of the walls
    back = back - sil.offset(t / 2 + gap)               # ring passes BEHIND the house
    return body + front + back

def logo(size, depth):
    """House mark, `size` mm wide, on XY (+Z up), lower-left at origin."""
    cs = _logo_2d(); b = cs.bounds()
    s = size / (b[2] - b[0]); cs = cs.translate([-b[0], -b[1]]).scale([s, s])
    return cs.extrude(depth), (size, (b[3] - b[1]) * s)

# ---- wordmark -----------------------------------------------------------
def wordmark(cap, depth, text="THE SAFEHOUSE"):
    """Wide-set geometric caps with the signature accent rising from the last E."""
    font = "word" if cap >= 5 else "word-sm"
    w, (ww, _) = text_solid(text, cap, depth, font, tracking=0.32)
    e, (ew, _) = text_solid(text[-1], cap, depth, font)
    ex = ww - ew                                          # left edge of the final E
    t = max(0.6, cap * 0.11)
    acc = CrossSection([[[ex, cap * 1.08], [ex + t, cap * 1.08],
                         [ex + t + cap * 0.30, cap * 1.62], [ex + cap * 0.30, cap * 1.62]]])
    return w + acc.extrude(depth), (ww, cap * 1.62)

def lockup(cap, depth):
    """Logo + wordmark, side by side, vertically centred."""
    lg, (lw, lh) = logo(cap * 3.2, depth)
    wm, (ww, wh) = wordmark(cap, depth)
    h = max(lh, wh); gap = cap * 1.2
    return lg.translate([0, (h - lh) / 2, 0]) + wm.translate([lw + gap, (h - cap) / 2 - cap * 0.15, 0]), (lw + gap + ww, h)

def maker_mark(code, depth):
    """Origin stamp for the back / underside of every product."""
    lk, (kw, kh) = lockup(2.6, depth)
    sub, (sw, _) = text_solid(f"MADE IN KIGALI  ·  {code}", 2.4, depth, "mono", tracking=0.08)
    w = max(kw, sw)
    return lk.translate([(w - kw) / 2, 4.8, 0]) + sub.translate([(w - sw) / 2, 0, 0]), (w, 4.8 + kh)

# ---- placement helpers --------------------------------------------------
def on_front(m, size, y, cx, cz):
    """Stand an XY solid on a front face (plane y, facing -Y), centred at (cx, cz)."""
    w, h = size
    return m.rotate([90, 0, 0]).translate([cx - w / 2, y, cz - h / 2])

def cut_back(m, size, y, cx, cz, depth=0.6):
    """Cutter debossing an XY mark into a back face (plane y, facing +Y), readable from behind."""
    w, h = size
    return m.rotate([90, 0, 180]).translate([cx + w / 2, y - depth, cz - h / 2])

def cut_under(m, size, cx, cy):
    """Cutter debossing an XY mark into the underside (z=0), readable from below."""
    w, h = size
    return m.scale([-1, 1, 1]).translate([cx + w / 2, cy - h / 2, -0.3])

# ---- part colours: the filament each STL part is printed in --------------
# Any part name not listed prints in grey (the brand detail colour).
PART_COLOURS = {"body": "black", "code": "black", "panel": "white"}
def part_colour(part):
    if part.startswith("prop_"):          # display-only props (never printed)
        return COLOURS["white"]
    head = part.split("_")[0]
    if head in COLOURS: return COLOURS[head]      # colour-named parts: "red_body", "white_rims"
    return COLOURS[PART_COLOURS.get(part, "grey")]

# ---- printer --------------------------------------------------------------
PRINTER = {"name": "Bambu Lab A1", "bed_mm": (256, 256, 256), "nozzle_mm": 0.4}
