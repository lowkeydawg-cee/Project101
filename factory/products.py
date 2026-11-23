"""
The Safehouse product catalogue.

A product = one design function + one CATALOG entry. That is all /new-product writes;
build.py does the rest (STL, checks, 3D model, renders, slides, listing SQL).
All branding comes from brand.py.

RULES (also in .claude/skills/safehouse-product/SKILL.md):
  1. Body black; brand details grey; white only where contrast is functional (QR).
  2. maker_mark(<catalogue no.>) debossed on the back or underside of every product.
  3. House logo() on the front unless BRAND_FRONT=False.
  4. Brand fonts only. Raised text cap height >= 2.8 mm. Walls >= 2 mm.
  5. Model it in print orientation (z up, flat base on the bed, no overhang > 45 deg).
  6. Personalised text must auto-fit or raise ValueError, never overflow.
"""
import numpy as np
import manifold3d as m3d
from manifold3d import Manifold, CrossSection, FillRule
import qrcode
from brand import (text_solid, logo, wordmark, lockup, maker_mark, on_front, cut_back, cut_under)

m3d.set_circular_segments(64)
DEB = 0.6   # maker's mark deboss depth (mm)

# ---------------------------------------------------------------- helpers
def box(x, y, z):
    return Manifold.cube([x, y, z])

def profile_extrude(pts, width):
    """2D side profile in (y,z), extruded along X by width."""
    return CrossSection([pts]).extrude(width).rotate([90, 0, 90])

def fit_text(text, max_w, cap, min_cap, depth, font, tracking=0.0, min_tracking=None):
    """Largest text <= max_w wide: tighten tracking first, then reduce size. ValueError if it can't fit."""
    trs = [tracking] if min_tracking is None else list(np.linspace(tracking, min_tracking, 5))
    c = cap
    while c >= min_cap - 1e-6:
        for tr in trs:
            m, (w, h) = text_solid(text, c, depth, font, tr)
            if w <= max_w:
                return m, (w, h)
        c -= 0.25
    raise ValueError(f'"{text}" is too long: it does not fit {max_w:.0f} mm even at {min_cap} mm cap height')

def qr_solid(data, size_mm, depth, min_module=1.0):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(data); q.make(fit=True)
    mat = np.array(q.get_matrix(), dtype=bool); n = mat.shape[0]; cell = size_mm / n; e = 0.01
    if cell < min_module:
        raise ValueError(f"link too long for a {size_mm:.0f} mm QR: modules would be {cell:.2f} mm (min {min_module})")
    sq = []
    for r in range(n):
        c = 0
        while c < n:
            if mat[r, c]:
                c0 = c
                while c < n and mat[r, c]: c += 1
                y1 = size_mm - r * cell + e
                sq.append([[c0 * cell - e, y1 - cell - 2 * e], [c * cell + e, y1 - cell - 2 * e],
                           [c * cell + e, y1], [c0 * cell - e, y1]])
            else:
                c += 1
    return CrossSection(sq, FillRule.NonZero).extrude(depth)

# ---------------------------------------------------------------- designs
def connect_display(PAYLOAD="https://www.safehouse.rw", W=90, PLATE_H=110, T=4,
                    TILT=72, QR=62, RAISE=0.8, LABEL="SCAN TO PAY", BRAND_FRONT=True):
    base = box(W, 60, 8)
    tilt = lambda m: m.rotate([-(90 - TILT), 0, 0]).translate([0, 34, 6])
    mk, ms = maker_mark("SH-BC-001", DEB + 0.3)
    body = base + tilt(box(W, T, PLATE_H) - cut_back(mk, ms, T, W / 2, PLATE_H * 0.3))
    PANEL_T, QZ = 0.6, 5                     # QR must be DARK on LIGHT for every phone
    panel = box(QR + 2 * QZ, QR + 2 * QZ + 14, PANEL_T).translate([(W - QR) / 2 - QZ, -QZ - 14, 0])
    lab, (lw, _) = fit_text(LABEL.upper(), QR, 4.0, 3.0, RAISE, "label", 0.25, 0.1)
    code = qr_solid(PAYLOAD, QR, RAISE).translate([(W - QR) / 2, 0, PANEL_T]) + \
           lab.translate([(W - lw) / 2, -11, PANEL_T])
    onto = lambda m: tilt(m.rotate([90, 0, 0]).translate([0, 0, 30]))
    parts = {"body": body, "panel": onto(panel), "code": onto(code)}
    if BRAND_FRONT:
        lk, ls = lockup(2.8, 0.6)
        parts["brand"] = on_front(lk, ls, 0, W / 2, 4)
    return parts

def nameplate(NAME="Cyusa Nerlin", TITLE="Founder, The Safehouse", L=190, D=42, H=36,
              RAISE=1.0, MARGIN=14, BRAND_FRONT=True):
    body = profile_extrude([[0, 0], [D, 0], [D, H], [D - 10, H], [0, 6]], L)
    mk, ms = maker_mark("SH-PC-001", DEB + 0.3)
    body = body - cut_back(mk, ms, D, L / 2, H / 2)
    logo_w = 11
    name_room = L - 2 * MARGIN - (logo_w + 8 if BRAND_FRONT else 0)
    name, (nw, ncap) = fit_text(NAME, name_room, 10.5, 7.0, RAISE, "serif", 0.02)
    face = name.translate([MARGIN, 23, 0])
    ttl, (tw, _) = fit_text(TITLE.upper(), L - 2 * MARGIN - 26, 3.2, 2.8, RAISE, "label", 0.35, 0.12)
    face = face + ttl.translate([L - MARGIN - tw, 9.5, 0])
    line_w = tw + 26
    face = face + box(line_w, 0.8, RAISE).translate([L - MARGIN - line_w, 5.6, 0])
    if BRAND_FRONT:
        lg, (lw, lh) = logo(logo_w, RAISE)
        face = face + lg.translate([L - MARGIN - lw, 23 + ncap - lh, 0])
    phi = np.degrees(np.arctan2(H - 6, D - 10))
    return {"body": body, "letters": face.rotate([phi, 0, 0]).translate([0, 0, 6])}

def brand_signature(W=150, H=70, T=6, BASE_D=40, RAISE=1.2):
    base = box(W + 10, BASE_D, 10).translate([-5, 0, 0]); y0 = (BASE_D - T) / 2
    mk, ms = maker_mark("SH-BC-002", DEB + 0.3)
    body = base + box(W, T, H).translate([0, y0, 8]) - cut_back(mk, ms, y0 + T, W / 2, 8 + H / 2)
    lg, (lw, lh) = logo(30, RAISE)
    wm, (ww, wh) = wordmark(5.5, RAISE)
    face = lg.translate([(W - lw) / 2, H - lh - 10, 0]) + wm.translate([(W - ww) / 2, 12, 0])
    return {"body": body, "logo": on_front(face, (W, H), y0, W / 2, 8 + H / 2)}

def everyday_stand(W=80, DEPTH=86, BACK_ANGLE=65, SLOT=14, LIP_H=14, REST=95, T=6, CABLE=14):
    a = np.radians(BACK_ANGLE); ca, sa = np.cos(a), np.sin(a); s0 = 6 + SLOT
    tf = (s0 + REST * ca, 5 + REST * sa); tb = (tf[0] + T * sa, tf[1] - T * ca)
    outer = CrossSection([[[0, 0], [DEPTH, 0], [DEPTH, 5], list(tb), list(tf),
                           [s0, 5], [6, 5], [6, LIP_H], [0, LIP_H]]])
    yr = s0 + T * sa + (T * ca) / np.tan(a)
    tri = CrossSection([[[yr, 5], [DEPTH, 5], list(tb)]]).offset(-5, m3d.JoinType.Miter)
    body = (outer - tri).extrude(W).rotate([90, 0, 90])
    notch = box(CABLE, 8, LIP_H).translate([(W - CABLE) / 2, -1, 5])
    accent = box(W, 6, 1.2).translate([0, 0, LIP_H - 1.2]) - notch
    mk, ms = maker_mark("SH-EO-001", DEB + 0.3)
    body = body - notch - accent - cut_under(mk, ms, W / 2, 12)
    lg, (lw, lh) = logo(10, 0.6)
    accent = accent + on_front(lg, (lw, lh), 0, W - 15, 6.5)
    return {"body": body, "accent": accent}

def order_desk(WALL=2.4, FLOOR=2.4):
    comps = [(0, 46, 64, 100), (46 - WALL, 56, 64, 58), (46 + 56 - 2 * WALL, 46, 64, 30)]
    solid = cav = None
    for x, w, d, h in comps:
        o = box(w, d, h).translate([x, 0, 0])
        c = box(w - 2 * WALL, d - 2 * WALL, h).translate([x + WALL, WALL, FLOOR])
        solid = o if solid is None else solid + o
        cav = c if cav is None else cav + c
    x, w, d, h = comps[0]
    rim = (box(w, d, 3).translate([x, 0, h - 3]) -
           box(w - 2 * WALL, d - 2 * WALL, 4).translate([x + WALL, WALL, h - 3.5]))
    mk, ms = maker_mark("SH-EO-002", DEB + 0.3)
    mx, mw, md, _ = comps[1]
    body = solid - cav - rim - cut_back(mk, ms, md, mx + mw / 2, 22, DEB)
    lg, (lw, lh) = logo(22, 0.6)
    rim = rim + on_front(lg, (lw, lh), 0, w / 2, 24)
    return {"body": body, "rim": rim}

def card_holder(W=104, D=48, HF=16, HB=36, POCKET_W=93, POCKET_D=17, FLOOR=4, LEAN=12, FRONT=9, BRAND_FRONT=True):
    """Reception business-card holder: low front so the top card shows, tall back it leans on.
    Fits standard 85-90 x 50-55 mm cards; ~50 cards at POCKET_D=17."""
    body = profile_extrude([[0, 0], [D, 0], [D, HB], [0, HF]], W)          # sloped top, low front
    pocket = box(POCKET_W, POCKET_D, HB * 2).rotate([-LEAN, 0, 0]).translate([(W - POCKET_W) / 2, FRONT, FLOOR])
    rim = box(W, 1.2, 1.0).translate([0, 0, HF - 1.0])                     # grey line on the front top edge
    mk, ms = maker_mark("SH-BC-003", DEB + 0.3)
    body = body - pocket - rim - cut_under(mk, ms, W / 2, D / 2)
    if BRAND_FRONT:
        lg, (lw, lh) = logo(12, 0.6)
        rim = rim + on_front(lg, (lw, lh), 0, W / 2, (HF - 1) / 2)
    return {"body": body, "rim": rim}

def card_holder_props(W=104, POCKET_W=93, FRONT=9, FLOOR=4, LEAN=12):
    """Display only (renders + 3D viewer, never printed): a stack of white cards in the pocket."""
    cards = box(89, 10, 54).rotate([-LEAN, 0, 0]).translate([(W - 89) / 2, FRONT + 4.5, FLOOR + 0.2])
    return {"prop_cards": cards}

# ---------------------------------------------------------------- catalogue
# shots: camera for slide 01 (hero), 02 (detail), 03 (back = maker's-mark slide uses artwork,
# "profile" = a side shot is used instead). personalise: order field -> design parameter.
CATALOG = {
  "connect-display": dict(fn=connect_display, name="Connect Display", code="SH-BC-001", category="Business",
      price=18000, slide3="stamp", qr="PAYLOAD",
      headline="YOUR LINK, PRINTED IN", custom="Your MoMo code, menu, Instagram or website",
      colours="Matte black · white QR panel · grey mark",
      description="A counter stand with your QR code printed into it, for MoMo payments, your menu, Instagram or website.",
      personalise={"link": dict(param="PAYLOAD", label="Link or payment code for the QR", max=200, required=True)},
      shots=dict(hero=dict(az=-28, el=16), detail=dict(az=-8, el=10, zoom=2.1, ty=0.12, tz=0.1))),
  "signature-nameplate": dict(fn=nameplate, name="Signature Nameplate", code="SH-PC-001", category="Signature",
      price=12000, slide3="stamp",
      headline="YOUR NAME, SET IN RELIEF", custom="Your name and title", colours="Matte black · grey lettering",
      description="A desk nameplate with your name in raised grey on matte black, finished with the Safehouse mark.",
      personalise={"name": dict(param="NAME", label="Name", max=32, required=True),
                   "title": dict(param="TITLE", label="Title", max=40, required=False)},
      shots=dict(hero=dict(az=-12, el=22), detail=dict(az=-4, el=24, zoom=2.4, tx=-0.2, ty=0.05))),
  "brand-signature": dict(fn=brand_signature, name="Brand Signature", code="SH-BC-002", category="Business",
      price=30000, slide3="stamp",
      headline="YOUR LOGO, AT RECEPTION", custom="Your logo and company name", colours="Matte black · grey logo",
      description="Your logo as a standing sign for a reception desk, shop counter or office. After you order, send us your logo on WhatsApp or by email and we confirm the design with you before printing.",
      personalise={}, shots=dict(hero=dict(az=-20, el=12), detail=dict(az=-6, el=8, zoom=2.2, ty=0.12))),
  "everyday-stand": dict(fn=everyday_stand, name="Everyday Stand", code="SH-EO-001", category="Everyday",
      price=9000, slide3="profile", profile_caption="65°  —  THE ANGLE FOR CALLS AND VIDEO",
      headline="THE HOUSE, ON THE LIP", custom="Fits any phone, case on or off", colours="Matte black · grey line",
      description="A low, solid phone stand for the desk or the bedside, with a cable notch in the lip.",
      personalise={}, shots=dict(hero=dict(az=-40, el=14), detail=dict(az=-18, el=16, zoom=2.6, tx=0.32, ty=-0.38, tz=0.45),
                                 profile=dict(az=-90, el=4, zoom=1.1))),
  "order-desk": dict(fn=order_desk, name="Order Desk", code="SH-EO-002", category="Everyday",
      price=20000, slide3="stamp",
      headline="PENS · CARDS · CLIPS", custom="Three heights, one footprint", colours="Matte black · grey rim",
      description="A stepped desk organiser: tall for pens, middle for cards, low for clips.",
      personalise={}, shots=dict(hero=dict(az=-34, el=24), detail=dict(az=-12, el=8, zoom=2.6, tx=-0.34, ty=-0.26, tz=0.5))),
  "card-holder": dict(fn=card_holder, name="Reception Card Holder", code="SH-BC-003", category="Business",
      price=10000, slide3="stamp", stamp_where="UNDERNEATH",
      headline="FIFTY CARDS, LEANING BACK", custom="Fits standard business cards",
      colours="Matte black · grey line and mark",
      description="A solid card holder for reception desks and counters. Holds about fifty standard business cards, leaning back so the top card is easy to read.",
      props=card_holder_props,
      personalise={}, shots=dict(hero=dict(az=-32, el=22), detail=dict(az=-12, el=12, zoom=2.0, ty=-0.12, tz=0.35))),
}
