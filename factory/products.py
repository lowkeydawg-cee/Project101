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
from manifold3d import Manifold, CrossSection, FillRule, JoinType
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
def _qr_stand(payload, code_no, W, PLATE_H, QR, LABEL, SUB="", T=4, TILT=72, RAISE=0.8, BRAND_FRONT=True):
    """Shared tilted QR stand (Connect Display, Wi-Fi Stand). QR is always dark on a light panel."""
    base = box(W, 60, 8)
    tilt = lambda m: m.rotate([-(90 - TILT), 0, 0]).translate([0, 34, 6])
    mk, ms = maker_mark(code_no, DEB + 0.3)
    body = base + tilt(box(W, T, PLATE_H) - cut_back(mk, ms, T, W / 2, PLATE_H * 0.3))
    PANEL_T, QZ = 0.6, 5
    below = 20 if SUB else 14                    # room under the QR for the label (+ sub-line)
    panel = box(QR + 2 * QZ, QR + 2 * QZ + below, PANEL_T).translate([(W - QR) / 2 - QZ, -QZ - below, 0])
    lab, (lw, _) = fit_text(LABEL.upper(), QR, 4.0, 3.0, RAISE, "label", 0.25, 0.1)
    code = qr_solid(payload, QR, RAISE).translate([(W - QR) / 2, 0, PANEL_T]) + \
           lab.translate([(W - lw) / 2, -11, PANEL_T])
    if SUB:
        sub, (sw, _) = fit_text(SUB, QR, 3.6, 3.2, RAISE, "mono", 0.06, 0.0)
        code = code + sub.translate([(W - sw) / 2, -18.5, PANEL_T])
    onto = lambda m: tilt(m.rotate([90, 0, 0]).translate([0, 0, 30]))
    parts = {"body": body, "panel": onto(panel), "code": onto(code)}
    if BRAND_FRONT:
        lk, ls = lockup(2.8, 0.6)
        parts["brand"] = on_front(lk, ls, 0, W / 2, 4)
    return parts

def connect_display(PAYLOAD="https://www.safehouse.rw", W=90, PLATE_H=110, QR=62,
                    LABEL="SCAN TO PAY", BRAND_FRONT=True):
    return _qr_stand(PAYLOAD, "SH-BC-001", W, PLATE_H, QR, LABEL, BRAND_FRONT=BRAND_FRONT)

def wifi_payload(SSID, PASSWORD="", SECURITY="WPA", HIDDEN=False):
    """Standard Wi-Fi QR format (what phone cameras understand). Special characters are escaped."""
    esc = lambda v: "".join("\\" + c if c in '\\;,:"' else c for c in v)
    sec = SECURITY if PASSWORD else "nopass"
    p = f"WIFI:T:{sec};S:{esc(SSID)};"
    if PASSWORD: p += f"P:{esc(PASSWORD)};"
    if HIDDEN: p += "H:true;"
    return p + ";"

def _arc_band(r_in, r_out, a0, a1, n=64):
    a = np.radians(np.linspace(a0, a1, n))
    return CrossSection([[[r_out * np.cos(t), r_out * np.sin(t)] for t in a] +
                         [[r_in * np.cos(t), r_in * np.sin(t)] for t in a[::-1]]])

def wifi_stand(SSID="Safehouse Studio", PASSWORD="printedinkigali", SECURITY="WPA", HIDDEN=False,
               W=112, D=100, QR=40, LABEL="SCAN FOR WI-FI", BRAND_FRONT=True):
    """Signal Arch: the Wi-Fi symbol stands on the counter (grey arcs inlaid in a black fan),
    with the scan-to-join QR on the sloped front. Shows the network name, never the password.
    The house badge on the right marks where an NFC tag goes in the Tap & Scan version."""
    TOP, FRONT_H, SLOPE_END = 24, 8, 72
    base = profile_extrude([[0, 0], [D, 0], [D, TOP], [SLOPE_END, TOP], [0, FRONT_H]], W)
    # fan: a 50-130 deg sector standing behind the slope, apex sunk into the base for strength
    T, R, cx, yb, zc = 8, 70, W / 2, SLOPE_END + 6, TOP - 20      # apex sunk 20 mm: a 34 mm-wide root
    sector = CrossSection([[[0, 0]] + [[R * np.cos(t), R * np.sin(t)] for t in np.radians(np.linspace(47, 133, 64))]])
    arcs = _arc_band(25, 32, 50, 130) + _arc_band(40, 47, 50, 130) + _arc_band(55, 62, 50, 130)
    stand = lambda cs: cs.extrude(T).rotate([90, 0, 0]).translate([cx, yb + T, zc])
    accent = stand(arcs)
    body = base + stand(sector) - accent
    # QR + label + network name on the slope
    qz, below, MAX_PW = 4, 17, 64             # the panel may widen up to 64 mm for long network names
    lab, (lw, _) = fit_text(LABEL.upper(), MAX_PW - 6, 3.4, 2.8, 0.8, "label", 0.25, 0.08)
    sub, (sw, _) = fit_text(SSID, MAX_PW - 6, 3.2, 2.8, 0.8, "label", 0.06, 0.0)
    pw = max(QR + 2 * qz, lw + 6, sw + 6); ph = QR + 2 * qz + below
    panel = box(pw, ph, 0.6)
    code = qr_solid(wifi_payload(SSID, PASSWORD, SECURITY, HIDDEN), QR, 0.8).translate([(pw - QR) / 2, qz + below, 0.6]) + \
           lab.translate([(pw - lw) / 2, below - 7.5, 0.6]) + sub.translate([(pw - sw) / 2, below - 14, 0.6])
    phi = np.degrees(np.arctan2(TOP - FRONT_H, SLOPE_END))
    place = lambda m, x, s: m.rotate([phi, 0, 0]).translate([x, 0, FRONT_H]).translate([0, s * np.cos(np.radians(phi)), s * np.sin(np.radians(phi))])
    qx = 12
    panel, code = place(panel, qx, 3), place(code, qx, 3)
    if BRAND_FRONT:   # house badge (future NFC tap spot)
        ring = (CrossSection.circle(12, 64) - CrossSection.circle(10.8, 64)).extrude(0.8).translate([12, 12, 0])
        lg, (lgw, lgh) = logo(13, 0.8)
        badge = ring + lg.translate([12 - lgw / 2, 12 - lgh / 2, 0])
        bx = qx + pw + (W - qx - pw - 24) / 2
        accent = accent + place(badge, bx, 3 + ph / 2 - 12)
    mk, ms = maker_mark("SH-BC-004", DEB + 0.3)
    body = body - cut_back(mk, ms, D, cx, TOP / 2)
    return {"body": body, "panel": panel, "code": code, "accent": accent}

def with_defaults(fn, over=None):
    """The full set of arguments a design will be built with (defaults + overrides)."""
    import inspect
    kw = {k: v.default for k, v in inspect.signature(fn).parameters.items()}
    kw.update(over or {}); return kw

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
# ---- SH-BC-005 House Frame table number ------------------------------------
def _house_cs(W, H, P, CH_X0, CH_X1, CH_TOP):
    """House silhouette (with chimney) on XY, lower-left at origin, counter-clockwise."""
    roof = lambda x: P - (P - H) * abs(x - W / 2) / (W / 2)
    return CrossSection([[[0, 0], [W, 0], [W, H], [CH_X1, roof(CH_X1)], [CH_X1, CH_TOP], [CH_X0, CH_TOP],
                          [CH_X0, roof(CH_X0)], [W / 2, P], [0, H]]])

def _table_number_parts(NUMBER="07", W=80, H=60, P=90, T=5, RIM=2.0, INSET=4.0, RAISE=1.0, SLOT=8, CLEAR=0.4):
    """Plate printed FLAT (face up) so the grey is only the top layers: one filament swap per print."""
    num = str(NUMBER).strip().upper()
    if not num:
        raise ValueError("table number is empty")
    house = _house_cs(W, H, P, W - 22, W - 13, P - 6)
    plate = house.extrude(T)
    mk, ms = maker_mark("SH-BC-005", DEB + 0.3)
    plate = plate - cut_under(mk, ms, W / 2, 16)
    rim = (house.offset(-INSET, JoinType.Miter) - house.offset(-INSET - RIM, JoinType.Miter)).extrude(RAISE).translate([0, 0, T])
    rim = rim - box(W, SLOT + 1.5, RAISE + 2).translate([0, -0.5, T - 0.5])   # stays clear of the slot
    n, (nw, nh) = fit_text(num, W - 2 * INSET - 2 * RIM - 12, 30, 16, RAISE, "word", 0.04)
    n = n.translate([(W - nw) / 2, SLOT + (H - SLOT - nh) / 2 + 2, T])
    # base with a slot the plate drops into
    BW, BD, BH = W + 10, 26, 10
    gap = T + CLEAR
    base = box(BW, BD, BH) - box(W + 1, gap, SLOT + 1).translate([4.5, (BD - gap) / 2, BH - SLOT])
    bm, bs = maker_mark("SH-BC-005", DEB + 0.3)
    base = base - cut_under(bm, bs, BW / 2, BD / 2)
    return dict(plate=plate, accent=rim + n, base=base, dims=(W, T, BW, BD, BH, SLOT, gap))

def table_number(NUMBER="07", **kw):
    """Print layout: plate flat + base beside it, both on the bed."""
    p = _table_number_parts(NUMBER, **kw); W = p["dims"][0]
    return {"body": p["plate"] + p["base"].translate([W + 8, 0, 0]), "accent": p["accent"]}

def table_number_display(NUMBER="07", **kw):
    """Assembled (for renders and the 3D viewer only): plate standing in the base."""
    p = _table_number_parts(NUMBER, **kw); W, T, BW, BD, BH, SLOT, gap = p["dims"]
    y = (BD - gap) / 2 + (gap - T) / 2 + T             # plate centred in the slot, face toward -Y
    stand = lambda m: m.rotate([90, 0, 0]).translate([5, y, BH - SLOT])
    return {"body": p["base"] + stand(p["plate"]), "accent": stand(p["accent"])}


# ---- Sets: several catalogue pieces sold together ---------------------------
def _merge(parts, extra, offset):
    for k, m in extra.items():
        m = m.translate(offset); parts[k] = parts[k] + m if k in parts else m
    return parts

def cafe_set_display(**kw):
    """Display only: Signal Arch + Connect Display behind three of the six table numbers."""
    p = {}
    _merge(p, wifi_stand(), [0, 0, 0])
    _merge(p, connect_display(), [140, 110, 0])
    for i, n in enumerate(["01", "02"]):
        _merge(p, table_number_display(n), [128 + i * 100, -6, 0])
    return p

def desk_set_display(**kw):
    """Display only: Signal Arch, Card Holder and Signature Nameplate on one desk."""
    p = {}
    _merge(p, wifi_stand(), [0, 70, 0])
    _merge(p, card_holder(), [140, 95, 0])
    _merge(p, card_holder_props(), [140, 95, 0])
    _merge(p, nameplate(), [20, -30, 0])
    return p

from car import sports_car, sports_car_display
from cassette_key import mixtape, mixtape_display
from vinyl_player import record_player, record_player_display
from court_kit import arena_court_print, arena_court_display, full_court_print, full_court_display

CATALOG = {
  "mixtape": dict(fn=mixtape, display=mixtape_display, name="Mixtape", code="SH-TY-005",
      category="Desk", price=15000, slide3="profile", profile_caption="REAL CASSETTE SIZE · THE REELS TURN · SCAN TO PLAY",
      headline="IT'S REGULAR.", custom="Your words, handwritten on the label",
      colours="Black shell and stand · red label · white reels",
      description="A cassette at real size, leaning on its own stand. Both reels really turn, your words are handwritten on the label, and the QR on the back opens your song.",
      personalise={"title": dict(param="TITLE", label="Label text (handwritten)", max=16, required=True),
                   "link": dict(param="LINK", label="Song link (Spotify, Deezer, YouTube, Apple Music)", max=300, required=True)},
      shots=dict(hero=dict(az=-26, el=16), detail=dict(az=-6, el=10, zoom=1.55, tz=0.05), profile=dict(az=-80, el=6, zoom=1.1), back=dict(az=172, el=12, zoom=1.2))),
  "record-player": dict(fn=record_player, display=record_player_display, name="Record Player Key", code="SH-TY-004",
      category="Keychains", price=8000, slide3="profile", profile_caption="THE RECORD SPINS · THE ARM SWINGS · SCAN TO PLAY",
      headline="YOUR SONG, ON YOUR KEYS.", custom="Your song title, artist and link",
      colours="Black deck · red label · white tonearm",
      description="A mini turntable for your keys. The record really spins and the tonearm swings onto it. Your song title and artist curve around the label, and the QR underneath opens the song on your phone.",
      personalise={"title": dict(param="TITLE", label="Song title", max=24, required=True),
                   "artist": dict(param="ARTIST", label="Artist", max=22, required=False),
                   "link": dict(param="LINK", label="Song link (Spotify, Deezer, YouTube, Apple Music)", max=300, required=True)},
      shots=dict(hero=dict(az=-32, el=36), detail=dict(az=-6, el=58, zoom=1.55, tx=-0.08, ty=0.0, tz=0.0), profile=dict(az=-14, el=10, zoom=1.2))),
  "arena-court": dict(fn=arena_court_print, display=arena_court_display, name="Arena Court", code="SH-TY-002",
      category="Toys", price=25000, slide3="profile", profile_caption="REAL COURT MARKINGS · WOVEN NET",
      headline="YOUR COURT. YOUR DESK.", custom="Choose the key colour",
      colours="Black floor · white lines · red key · white board",
      description="A half court for the desk, marked to real proportions: three-point line, key, free-throw circle and restricted area. Pro stanchion with a padded base, a backboard with the shooter's square, a woven net and a ball. Slots together, no glue needed for the stand.",
      personalise={},
      shots=dict(hero=dict(az=148, el=22), detail=dict(az=170, el=12, zoom=1.9, ty=0.18, tz=0.0), profile=dict(az=90, el=6))),
  "full-court": dict(fn=full_court_print, display=full_court_display, name="Full Court", code="SH-TY-003",
      category="Toys", price=28000, slide3="profile", profile_caption="BOTH ENDS · REAL PROPORTIONS",
      headline="END TO END.", custom="Choose the key colour",
      colours="Black floor · white lines · blue keys · red centre",
      description="A full court for the shelf or desk, both halves marked to real proportions with a hoop at each end, woven nets and a ball at centre court.",
      personalise={},
      shots=dict(hero=dict(az=-60, el=30), detail=dict(az=-24, el=24, zoom=1.7, ty=0.05, tx=-0.12), profile=dict(az=90, el=8))),
  "sports-car": dict(fn=sports_car, display=sports_car_display, name="Safehouse GT", code="SH-TY-001",
      category="Toys", price=12000, slide3="profile", profile_caption="NO SUPPORTS · NO COLOUR SWAPS · IT ROLLS",
      headline="DESIGNED IN KIGALI. BUILT TO ROLL.", custom="Choose your colourway",
      colours="Red body · black canopy and tyres · white rims",
      description="An original pocket supercar, about 9 cm long. The wheels turn on real axles, the canopy lifts off, and every part is printed in solid colour, so nothing is painted to chip off.",
      personalise={},
      shots=dict(hero=dict(az=-38, el=16), detail=dict(az=-150, el=20, zoom=1.15), profile=dict(az=0, el=3))),
  "cafe-set": dict(fn=cafe_set_display, display=cafe_set_display, name="Café Set", code="SH-SET-001",
      category="Business", price=55000, slide3="stamp", stamp_where="ON EVERY PIECE",
      bundle=[dict(slug="wifi-stand", map={"ssid": "ssid", "password": "password"}),
              dict(slug="connect-display", map={"link": "link"}),
              dict(slug="table-number", each="tables", count=6)],
      headline="EVERYTHING A COUNTER NEEDS", custom="Your Wi-Fi, your MoMo code, your table numbers",
      size_text="8 pieces: Wi-Fi stand, pay stand, 6 table numbers",
      colours="Matte black · white QR panels · grey details",
      description="Everything a café counter needs in one order: the Signal Arch Wi-Fi stand, a Connect Display with your MoMo code or menu, and six House Frame table numbers. 63,000 RWF if bought separately.",
      personalise={"ssid": dict(param="ssid", label="Wi-Fi network name", max=32, required=True),
                   "password": dict(param="password", label="Wi-Fi password (leave empty if open)", max=63, required=False),
                   "link": dict(param="link", label="MoMo code or menu link for the pay stand", max=200, required=True),
                   "tables": dict(param="tables", label="Six table numbers (e.g. 1-6 or 1,2,3,4,5,VIP)", max=40, required=True)},
      shots=dict(hero=dict(az=-24, el=22), detail=dict(az=-6, el=30, zoom=1.3, tx=0.12, tz=-0.05))),
  "desk-set": dict(fn=desk_set_display, display=desk_set_display, name="Front Desk Set", code="SH-SET-002",
      category="Business", price=32000, slide3="stamp", stamp_where="ON EVERY PIECE",
      bundle=[dict(slug="wifi-stand", map={"ssid": "ssid", "password": "password"}),
              dict(slug="card-holder", map={}),
              dict(slug="signature-nameplate", map={"name": "name", "title": "title"})],
      headline="A RECEPTION, SORTED", custom="Your Wi-Fi and the name on the desk",
      size_text="3 pieces: Wi-Fi stand, card holder, nameplate",
      colours="Black body · white details (your choice of colours) · white QR panel",
      description="For a reception or front desk: the Signal Arch Wi-Fi stand, the Reception Card Holder and a Signature Nameplate with your name. 37,000 RWF if bought separately.",
      personalise={"ssid": dict(param="ssid", label="Wi-Fi network name", max=32, required=True),
                   "password": dict(param="password", label="Wi-Fi password (leave empty if open)", max=63, required=False),
                   "name": dict(param="name", label="Name for the nameplate", max=32, required=True),
                   "title": dict(param="title", label="Title (optional)", max=40, required=False)},
      shots=dict(hero=dict(az=-24, el=22), detail=dict(az=-8, el=16, zoom=1.3, tz=-0.15))),
  "table-number": dict(fn=table_number, display=table_number_display, name="House Frame Table Number",
      code="SH-BC-005", category="Business", price=5000, slide3="stamp", stamp_where="UNDERNEATH",
      headline="YOUR TABLES, NUMBERED", custom="Any number or short code, up to 3 characters",
      colours="Matte black · grey number and frame",
      description="A table number in the shape of the Safehouse house, standing in a solid base. The plate lifts out for cleaning. Order one per table and tell us each number.",
      personalise={"number": dict(param="NUMBER", label="Table number", max=3, required=True)},
      shots=dict(hero=dict(az=-28, el=14), detail=dict(az=-8, el=10, zoom=1.25, ty=0.04))),
  "connect-display": dict(fn=connect_display, name="Connect Display", code="SH-BC-001", category="Business",
      price=18000, slide3="stamp", qr=lambda kw: kw["PAYLOAD"],
      headline="YOUR LINK, PRINTED IN", custom="Your MoMo code, menu, Instagram or website",
      colours="Black body · white details (your choice of colours) · white QR panel",
      description="A counter stand with your QR code printed into it, for MoMo payments, your menu, Instagram or website.",
      personalise={"link": dict(param="PAYLOAD", label="Link or payment code for the QR", max=200, required=True)},
      shots=dict(hero=dict(az=-28, el=16), detail=dict(az=-8, el=10, zoom=2.1, ty=0.12, tz=0.1))),
  "wifi-stand": dict(fn=wifi_stand, name="Signal Arch Wi-Fi Stand", code="SH-BC-004", category="Business",
      price=15000, slide3="stamp",
      qr=lambda kw: wifi_payload(kw["SSID"], kw["PASSWORD"], kw["SECURITY"], kw["HIDDEN"]),
      headline="SCAN, AND YOU'RE ONLINE", custom="Your network name and password, inside the QR",
      colours="Black body · white details (your choice of colours) · white QR panel",
      description="The Wi-Fi symbol, standing on your counter. Guests scan the QR on the front to join your network: it shows your network name, and the password stays inside the code. For cafés, hotels, offices and short-stay apartments.",
      personalise={"ssid": dict(param="SSID", label="Wi-Fi network name", max=32, required=True),
                   "password": dict(param="PASSWORD", label="Wi-Fi password (leave empty if open)", max=63, required=False)},
      shots=dict(hero=dict(az=-32, el=20), detail=dict(az=-14, el=24, zoom=1.45, tx=0.0, ty=0.05, tz=0.05),
                 scan=dict(az=0, el=66, zoom=2.0, tx=-0.08, ty=-0.36, tz=0.26))),
  "signature-nameplate": dict(fn=nameplate, name="Signature Nameplate", code="SH-PC-001", category="Signature",
      price=12000, slide3="stamp",
      headline="YOUR NAME, SET IN RELIEF", custom="Your name and title", colours="Black body · white lettering (your choice of colours)",
      description="A desk nameplate with your name raised in a colour you choose, finished with the Safehouse mark.",
      personalise={"name": dict(param="NAME", label="Name", max=32, required=True),
                   "title": dict(param="TITLE", label="Title", max=40, required=False)},
      shots=dict(hero=dict(az=-12, el=22), detail=dict(az=-4, el=24, zoom=2.4, tx=-0.2, ty=0.05))),
  "brand-signature": dict(fn=brand_signature, name="Brand Signature", code="SH-BC-002", category="Business",
      price=30000, slide3="stamp",
      headline="YOUR LOGO, AT RECEPTION", custom="Your logo and company name", colours="Black body · white logo (your choice of colours)",
      description="Your logo as a standing sign for a reception desk, shop counter or office. After you order, send us your logo on WhatsApp or by email and we confirm the design with you before printing.",
      personalise={}, shots=dict(hero=dict(az=-20, el=12), detail=dict(az=-6, el=8, zoom=2.2, ty=0.12))),
  "everyday-stand": dict(fn=everyday_stand, name="Everyday Stand", code="SH-EO-001", category="Everyday",
      price=9000, slide3="profile", profile_caption="65°  —  THE ANGLE FOR CALLS AND VIDEO",
      headline="THE HOUSE, ON THE LIP", custom="Fits any phone, case on or off", colours="Black body · white line (your choice of colours)",
      description="A low, solid phone stand for the desk or the bedside, with a cable notch in the lip.",
      personalise={}, shots=dict(hero=dict(az=-40, el=14), detail=dict(az=-18, el=16, zoom=2.6, tx=0.32, ty=-0.38, tz=0.45),
                                 profile=dict(az=-90, el=4, zoom=1.1))),
  "order-desk": dict(fn=order_desk, name="Order Desk", code="SH-EO-002", category="Everyday",
      price=20000, slide3="stamp",
      headline="PENS · CARDS · CLIPS", custom="Three heights, one footprint", colours="Black body · white rim (your choice of colours)",
      description="A stepped desk organiser: tall for pens, middle for cards, low for clips.",
      personalise={}, shots=dict(hero=dict(az=-34, el=24), detail=dict(az=-12, el=8, zoom=2.6, tx=-0.34, ty=-0.26, tz=0.5))),
  "card-holder": dict(fn=card_holder, name="Reception Card Holder", code="SH-BC-003", category="Business",
      price=10000, slide3="stamp", stamp_where="UNDERNEATH",
      headline="FIFTY CARDS, LEANING BACK", custom="Fits standard business cards",
      colours="Black body · white line (your choice of colours)",
      description="A solid card holder for reception desks and counters. Holds about fifty standard business cards, leaning back so the top card is easy to read.",
      props=card_holder_props,
      personalise={}, shots=dict(hero=dict(az=-32, el=22), detail=dict(az=-12, el=12, zoom=2.0, ty=-0.12, tz=0.35))),
}
