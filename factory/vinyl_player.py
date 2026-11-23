"""SH-TY-004 Record Player keychain. A detailed mini turntable whose record really spins and whose tonearm really swings.
Parts snap together (split-pin spindle and pivot) instead of print-in-place, so nothing fuses. Each part is one colour,
except the song label and the QR tile, whose colour sits in the top layers only (batch 12 on a plate to share the swaps)."""
import numpy as np
from manifold3d import CrossSection, JoinType, Manifold, FillRule
from brand import text_solid, logo
from products import qr_solid

PL_W, PL_D, PL_T = 52.0, 42.0, 4.0
CX, CY = 21.0, 21.0                    # record centre
WELL_D = 0.6
Z_ROT = PL_T - WELL_D                  # rotor sits in the platter well
PLAT_R, PLAT_T = 18.0, 1.2
REC_R, REC_T = 16.8, 1.4
LAB_R = 12.4
PX, PY = 44.0, 33.0                    # tonearm pivot
CL = 0.25

def cyl(h, r1, r2=None, seg=64): return Manifold.cylinder(h, r1, r1 if r2 is None else r2, seg)
def rr(w, h, r): return CrossSection.square([w - 2 * r, h - 2 * r]).translate([r, r]).offset(r, JoinType.Round)

def glyph_cs(ch, cap, font):
    m, (w, h) = text_solid(ch, cap, 1.0, font, 0.0)
    return m.slice(0.5), w

def arc_text(text, r, cap, font="label", top=True, gap=0.22, max_deg=200):
    """Text along a circle. top: reads clockwise over the top, glyphs pointing out (baseline at r).
    bottom: reads left->right under the centre, glyphs pointing in (glyph spans r..r+cap)."""
    chars = []
    for ch in text:
        if ch == " ": chars.append((None, cap * 0.42)); continue
        cs, w = glyph_cs(ch, cap, font); chars.append((cs, w))
    S = sum(w for _, w in chars) + gap * cap * (len(chars) - 1)
    rm = r + cap / 2
    if S / rm > np.radians(max_deg): raise ValueError(f'"{text}" is too long for the label')
    out = CrossSection(); s = 0.0
    for cs, w in chars:
        sc = s + w / 2
        if cs is not None:
            g = cs.translate([-w / 2, 0])
            if top:
                th = np.pi / 2 + S / 2 / rm - sc / rm
                g = g.rotate(np.degrees(th) - 90).translate([r * np.cos(th), r * np.sin(th)])
            else:
                th = 3 * np.pi / 2 - S / 2 / rm + sc / rm
                rb = r + cap
                g = g.rotate(np.degrees(th) + 90).translate([rb * np.cos(th), rb * np.sin(th)])
            out = out + g
        s += w + gap * cap
    return out

def split_pin(r_shaft, h_shaft, r_head, h_head, slot, slot_h):
    """Snap pin: shaft + barbed head with a slot so the head squeezes through the hole and springs back."""
    pin = cyl(h_shaft, r_shaft) + cyl(h_head * 0.45, r_shaft, r_head).translate([0, 0, h_shaft]) \
        + cyl(h_head * 0.55, r_head, r_shaft * 0.8).translate([0, 0, h_shaft + h_head * 0.45])
    return pin - Manifold.cube([slot, 2 * r_head + 1, slot_h + 0.1]).translate([-slot / 2, -r_head - 0.5, h_shaft + h_head - slot_h])

def plinth():
    base = rr(PL_W, PL_D, 3.2)
    lo = base.extrude(PL_T - 0.8); hi = base.offset(-0.8, JoinType.Round).extrude(0.8).translate([0, 0, PL_T - 0.8])
    p = (lo + hi + (base.extrude(PL_T - 0.8) + base.offset(-0.8, JoinType.Round).extrude(PL_T)).hull()) ^ (lo + hi).hull()
    p = (base.extrude(PL_T - 0.8) + base.offset(-0.8, JoinType.Round).extrude(PL_T)).hull()          # chamfered top edge
    tab = (CrossSection.circle(3.8, 48).translate([-2.0, PL_D - 6]) + CrossSection.square([4, 7.6]).translate([-0.5, PL_D - 9.8])).extrude(PL_T - 0.8)
    p = p + tab - cyl(10, 1.8, seg=40).translate([-2.0, PL_D - 6, -1])
    p = p - cyl(WELL_D + 0.1, PLAT_R + 0.6, seg=160).translate([CX, CY, Z_ROT])                       # platter well
    # controls in relief
    raised = (rr(6.2, 3.8, 0.8).translate([3.5, 3.0]) + rr(3.2, 2.6, 0.6).translate([11.2, 3.6]) + rr(3.2, 2.6, 0.6).translate([15.4, 3.6])).extrude(0.6)
    power = cyl(0.9, 2.4).translate([5.2, PL_D - 5.4, 0]) - Manifold.cube([0.6, 1.8, 1]).translate([4.9, PL_D - 4.6, 0.4])
    p = p + raised.translate([0, 0, PL_T]) + power.translate([0, 0, PL_T])
    slot = rr(2.0, 15.0, 1.0).translate([46.5, 3.0]).extrude(0.6).translate([0, 0, PL_T - 0.5])
    ticks = None
    for i in range(7):
        t = Manifold.cube([1.4, 0.5, 0.4]).translate([49.0, 3.8 + i * 2.2, PL_T]); ticks = t if ticks is None else ticks + t
    knob = rr(3.4, 2.2, 0.6).translate([45.8, 9.6]).extrude(1.0).translate([0, 0, PL_T - 0.5])
    p = p - slot + knob + ticks
    lg, (lw, lh) = logo(6.4, 0.5)
    p = p + lg.translate([PL_W - 6.4 - 3.4, PL_D - lh - 3.0 - 6.5, PL_T])
    for x in (12.0, 34.0):                                                                           # dust-cover hinges
        p = p + Manifold.cube([5.0, 1.8, 1.6]).translate([x, PL_D - 2.2, PL_T - 0.4])
    p = p + cyl(1.0, 3.6).translate([PX, PY, PL_T]) + cyl(2.0, 2.6).translate([PX, PY, PL_T + 1.0])   # pivot gimbal + post
    p = p + split_pin(1.3, 2.2, 1.75, 0.9, 0.6, 2.4).translate([PX, PY, PL_T + 3.0])                  # pivot snap pin
    rest = cyl(2.6, 1.1).translate([PL_W - 3.6, 21.0, PL_T]) + (Manifold.cube([3.4, 1.0, 1.0]).translate([PL_W - 5.3, 20.5, PL_T + 2.6]))
    p = p + rest
    p = p + split_pin(1.45, 6.0 - Z_ROT + REC_T + PLAT_T - 0.6 + 0.3, 1.9, 1.0, 0.7, 3.2).translate([CX, CY, Z_ROT])  # spindle
    # underside: QR tile recess + catalogue number
    guide = (rr(35.4, 35.4, 1.2) - rr(34.6, 34.6, 0.8).translate([0.4, 0.4])).translate([2.6, 3.4]).extrude(0.4).translate([0, 0, -0.01])
    p = p - guide                                                                                   # outline guide for gluing the QR tile
    num, (nw, nh) = text_solid("SH-TY-004", 2.8, 0.7, "mono", 0.05)
    p = p - num.rotate([0, 0, 90]).mirror([1, 0, 0]).translate([42.5, 6.0, -0.1])
    return p

def rotor(title, artist):
    plat = cyl(PLAT_T, PLAT_R, seg=160)
    notches = None
    for i in range(60):
        n = Manifold.cube([1.0, 0.55, 0.4]).translate([PLAT_R - 0.9, -0.275, PLAT_T - 0.35]).rotate([0, 0, i * 6])
        notches = n if notches is None else notches + n
    plat = plat - notches
    rec = cyl(REC_T, REC_R, seg=160).translate([0, 0, PLAT_T])
    for rad, w in [(r, 0.9 if abs(r - 15.4) < 0.1 else 0.45) for r in np.arange(13.3, REC_R - 0.4, 1.05)] + [(15.4, 0.9)]:
        rec = rec - (CrossSection.circle(rad + w / 2, 160) - CrossSection.circle(rad - w / 2, 160)).extrude(0.35).translate([0, 0, PLAT_T + REC_T - 0.3])
    body = plat + rec
    hole = cyl(10, 1.45 + CL + 0.05, seg=48).translate([0, 0, -1])
    label = cyl(0.4, LAB_R, seg=128).translate([0, 0, PLAT_T + REC_T])
    txt = arc_text(title, 7.4, 2.8, "word", True, 0.10, 200) + (arc_text(artist, 6.4, 2.8, "word", False, 0.10, 130) if artist else CrossSection())
    text = txt.extrude(0.4).translate([0, 0, PLAT_T + REC_T + 0.4])
    return body - hole, label - hole, text

def tonearm():
    """Flat 2.5D arm: hub ring on the pivot, counterweight behind, S-curved tube, headshell with finger lift."""
    t = np.linspace(0, 1, 40)
    P = np.array([[PX, PY], [PX, PY - 9.0], [PX - 8.5, PY - 11.0], [PX - 11.0, PY - 18.5]])
    bez = ((1 - t) ** 3)[:, None] * P[0] + (3 * (1 - t) ** 2 * t)[:, None] * P[1] + (3 * (1 - t) * t ** 2)[:, None] * P[2] + (t ** 3)[:, None] * P[3]
    tube = CrossSection()
    for a, b in zip(bez[:-1], bez[1:]):
        tube = tube + (CrossSection.circle(0.75, 20).translate(list(a)) + CrossSection.circle(0.75, 20).translate(list(b))).hull()
    d = bez[-1] - bez[-3]; ang = np.degrees(np.arctan2(d[1], d[0]))
    shell = rr(6.0, 3.6, 0.8).translate([-1.0, -1.8]).rotate(ang).translate(list(bez[-1]))
    lift = CrossSection.square([3.2, 0.9]).translate([0, -0.45]).rotate(ang + 90).translate(list(bez[-1] + 1.2 * d / np.linalg.norm(d)))
    hub = CrossSection.circle(3.0, 48).translate([PX, PY])
    back = (CrossSection.circle(0.9, 20).translate([PX, PY]) + CrossSection.circle(0.9, 20).translate([PX + 1.2, PY + 4.6])).hull()
    weight = rr(4.6, 3.6, 1.2).rotate(15).translate([PX - 1.4, PY + 4.4])
    arm = hub + tube + shell + lift + back + weight
    arm = arm - CrossSection.circle(1.3 + CL, 40).translate([PX, PY])
    cart = rr(2.2, 2.0, 0.4).translate([-1.1, -1.0]).rotate(ang).translate(list(bez[-1] + 1.6 * d / np.linalg.norm(d)))
    return arm.extrude(1.4), cart.extrude(0.6).translate([0, 0, 1.4])

def qr_tile(link):
    tile = Manifold.cube([34.0, 34.0, 1.4])
    code = qr_solid(link, 30.0, 0.6).translate([2.0, 2.0, 1.4])
    return tile, code

def record_player_display(TITLE="Ndagukunda", ARTIST="Safehouse", LINK="https://safehouse.rw/s/AB12C"):
    pl = plinth()
    body, label, text = rotor(TITLE, ARTIST)
    z = Z_ROT
    arm, cart = tonearm()
    za = PL_T + 3.05
    tile, code = qr_tile(LINK)
    tile_m = tile.mirror([0, 0, 1]).translate([3.2, 4.0, 1.4 + 0.6]) ; code_m = code.mirror([0, 0, 1]).translate([3.2, 4.0, 1.4 + 0.6])
    return {"black_plinth": pl, "black_record": body.translate([CX, CY, z]), "red_label": label.translate([CX, CY, z]),
            "white_title": text.translate([CX, CY, z]), "white_arm": arm.translate([0, 0, za]), "black_cartridge": cart.translate([0, 0, za])}

def record_player(TITLE="Ndagukunda", ARTIST="Safehouse", LINK="https://safehouse.rw/s/AB12C"):
    """Print layout: plinth, rotor, tonearm and QR tile side by side, all flat."""
    body, label, text = rotor(TITLE, ARTIST)
    arm, cart = tonearm()
    tile, code = qr_tile(LINK)
    ab = arm.bounding_box()
    return {"black_plinth": plinth(),
            "black_record": body.translate([PL_W + 6 + PLAT_R, PLAT_R, 0]), "red_label": label.translate([PL_W + 6 + PLAT_R, PLAT_R, 0]),
            "white_title": text.translate([PL_W + 6 + PLAT_R, PLAT_R, 0]),
            "white_arm": arm.translate([-ab[0], PL_D + 8 - ab[1], 0]), "black_cartridge": cart.translate([-ab[0], PL_D + 8 - ab[1], 0]),
            "white_tile": tile.translate([PL_W + 6, 2 * PLAT_R + 8, 0]), "black_qr": code.translate([PL_W + 6, 2 * PLAT_R + 8, 0])}
