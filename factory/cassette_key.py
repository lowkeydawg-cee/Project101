"""SH-TY-005 Mixtape Key. A detailed mini cassette: both reels really turn (snap-fit hubs), the buyer's song is
handwritten on the label (Caveat, regular weight), side A marked, Safehouse mark small at the bottom right,
and a QR tile on the back plays the song."""
import numpy as np
from manifold3d import CrossSection, JoinType, Manifold
from brand import text_solid, logo, maker_mark
from products import qr_solid
from vinyl_player import split_pin, rr, cyl

W, H, T = 58.0, 40.0, 4.6
FLOOR, TAPE_TOP = 1.2, 2.0
RX, RY, RSEP = W / 2, 23.0, 8.4          # reel centres at (RX ± RSEP, RY)
CL = 0.25

def text_cs(s, cap, font, track=0.0, thicken=0.0):
    m, (w, h) = text_solid(s, cap, 1.0, font, track)
    cs = m.slice(0.5)
    if thicken: cs = cs.offset(thicken, JoinType.Round)
    b = cs.bounds(); return cs, b[2] - b[0], b

def shell(title, artist, ring=True, back=True):
    body = (rr(W, H, 2.6).extrude(T - 0.6) + rr(W, H, 2.6).offset(-0.6, JoinType.Round).extrude(T)).hull()
    # seam between the two shell halves
    seam = (rr(W + 2, H + 2, 3.6).translate([-1, -1]) - rr(W - 0.6, H - 0.6, 2.3).translate([0.3, 0.3])).extrude(0.4).translate([0, 0, 2.1])
    body = body - seam
    # keyring tab, top-left
    tab = (CrossSection.circle(3.8, 48).translate([-2.2, H - 5.5]) + CrossSection.square([4.4, 7.6]).translate([-0.6, H - 9.3])).extrude(T - 0.6)
    if ring: body = body + tab - cyl(10, 1.8, seg=40).translate([-2.2, H - 5.5, -1])
    # window, tape packs (more tape on the left: side A just started), pins
    win = rr(31.0, 10.4, 5.2).translate([RX - 15.5, RY - 5.2])
    body = body - win.extrude(T).translate([0, 0, FLOOR])
    packs = (CrossSection.circle(6.2, 96).translate([RX - RSEP, RY]) + CrossSection.circle(4.3, 96).translate([RX + RSEP, RY])) ^ win
    body = body + packs.extrude(TAPE_TOP - FLOOR).translate([0, 0, FLOOR])
    for d in (-1, 1):
        body = body + split_pin(1.15, 1.85, 1.5, 0.75, 0.5, 1.8).translate([RX + d * RSEP, RY, TAPE_TOP])
    # label recess (filled by the red label part) with the window cut through it
    lab = rr(W - 7.0, H - 15.4, 1.4).translate([3.5, 12.2])
    body = body - (lab - win.offset(0.8, JoinType.Round)).extrude(0.41).translate([0, 0, T - 0.4])
    # bottom trapezoid, capstan and guide holes, screws, write-protect notches
    trap = CrossSection([[[13.0, 0], [W - 13.0, 0], [W - 16.8, 10.4], [16.8, 10.4]]])
    body = body - trap.extrude(0.9).translate([0, 0, T - 0.9])
    for x, r in ((18.4, 1.0), (24.0, 1.3), (W - 24.0, 1.3), (W - 18.4, 1.0)):
        body = body - cyl(2.0, r, seg=32).translate([x, 3.6 if r < 1.2 else 5.4, T - 2.8])
    for x, y in ((3.0, 3.0), (W - 3.0, 3.0), (3.0, H - 3.0), (W - 3.0, H - 3.0), (RX, 2.6)):
        body = body - cyl(0.5, 1.05, seg=32).translate([x, y, T - 0.5]) + cyl(0.5, 0.35, seg=16).translate([x, y, T - 0.5])
    for x in (6.5, W - 9.5):
        body = body - Manifold.cube([3.0, 1.4, 1.6]).translate([x, H - 1.3, T - 1.6])
    # back: guide outline for the QR tile + catalogue number
    if back:
        guide = (rr(33.4, 33.4, 1.2) - rr(32.6, 32.6, 0.8).translate([0.4, 0.4])).translate([3.6, 3.3]).extrude(0.4).translate([0, 0, -0.01])
        body = body - guide
        num, (nw, nh) = text_solid("SH-TY-005", 2.8, 0.6, "mono", 0.04)
        body = body - num.rotate([0, 0, 90]).mirror([1, 0, 0]).translate([W - 4.2, 7.0, -0.01])

    # ---- the label: red, with only the handwritten line in white; logo + "est 2026" pressed INTO the label ----
    LT = 0.6
    body = body - (lab - win.offset(0.8, JoinType.Round)).extrude(LT + 0.01).translate([0, 0, T - LT])
    label = (lab - win.offset(0.8, JoinType.Round)).extrude(LT).translate([0, 0, T - LT])
    t_cs, tw, tb = text_cs(title, 5.6, "hand", 0.0, 0.16)
    if tw > W - 14: raise ValueError(f'"{title}" is too long for the label')
    ink = t_cs.translate([(W - tw) / 2 - tb[0], 30.0])
    lg, (lw, lh) = logo(4.4, 1.0); lg_cs = lg.slice(0.5)
    est, ew, eb = text_cs("est 2026", 2.8, "label", 0.04)
    x_end = W - 5.6
    stamp = est.translate([x_end - ew - eb[0], 13.9]) + lg_cs.translate([x_end - ew - 1.2 - lw, 13.5])
    label = label - stamp.extrude(0.4).translate([0, 0, T - 0.4 + 0.001])
    return body, label, ink.extrude(0.4).translate([0, 0, T])

def reel():
    """White hub with six teeth into the bore and six spokes: snaps onto the pin and spins."""
    outer = CrossSection.circle(3.9, 72) - CrossSection.circle(2.35, 48)
    for k in range(6):
        outer = outer + CrossSection.square([0.8, 1.2]).translate([-0.4, 1.35 + CL]).rotate(60 * k)
    rim_notch = CrossSection()
    for k in range(6):
        rim_notch = rim_notch + CrossSection.square([0.7, 0.9]).translate([-0.35, 3.2]).rotate(60 * k + 30)
    return (outer - rim_notch).extrude(1.6)

def qr_tile(link):
    tile = Manifold.cube([32.0, 32.0, 1.4])
    return tile, qr_solid(link, 29.0, 0.6).translate([1.5, 1.5, 1.4])

def cassette_display(TITLE="it'sregular", ARTIST="", LINK="https://safehouse.rw/s/AB12C"):
    body, label, ink = shell(TITLE, ARTIST)
    reels = None
    for d in (-1, 1):
        r = reel().rotate([0, 0, 15 * d]).translate([RX + d * RSEP, RY, TAPE_TOP + 0.05])
        reels = r if reels is None else reels + r
    return {"black_shell": body, "red_label": label, "white_ink": ink, "white_reels": reels}

def cassette(TITLE="it'sregular", ARTIST="", LINK="https://safehouse.rw/s/AB12C"):
    body, label, ink = shell(TITLE, ARTIST)
    tile, code = qr_tile(LINK)
    r = reel()
    return {"black_shell": body, "red_label": label, "white_ink": ink,
            "white_reels": r.translate([W + 10, 6, 0]) + r.translate([W + 20, 6, 0]),
            "white_tile": tile.translate([W + 8, 16, 0]), "black_qr": code.translate([W + 8, 16, 0])}


# ---------------------------------------------------------------- desk edition: real cassette size, leaning on a stand
S_XY, S_Z = 1.73, 1.55           # 58 x 40 -> ~100 x 69 mm (a real tape is 100.4 x 63.8); 4.6 -> ~7.1 mm thick
LEAN = 15.0                      # degrees back from vertical

def _scaled(m): return m.scale([S_XY, S_XY, S_Z])

DESK_TILE, DESK_QR = 34.0, 30.0

def desk_back(Wd, Hd):
    """Back face (z=0) of the scaled shell: QR tile outline on the left as seen from the back,
    the Safehouse origin stamp pressed in at the bottom right (mirrored, because the back faces away)."""
    tx = Wd - 5.0 - DESK_TILE; ty = (Hd - DESK_TILE) / 2 + 4.0
    guide = (rr(DESK_TILE + 1.4, DESK_TILE + 1.4, 1.6) - rr(DESK_TILE + 0.6, DESK_TILE + 0.6, 1.2).translate([0.4, 0.4])).translate([tx - 0.7, ty - 0.7])
    cut = guide.extrude(0.4).translate([0, 0, -0.01])
    mk, (mw, mh) = maker_mark("SH-TY-005", 0.7)
    stamp = mk.mirror([1, 0, 0]).translate([mw + 13.5, 7.5, -0.01])          # reads correctly from the back
    return cut + stamp, (tx, ty)

def desk_tile(link):
    return Manifold.cube([DESK_TILE, DESK_TILE, 1.4]), qr_solid(link, DESK_QR, 0.6).translate([(DESK_TILE - DESK_QR) / 2, (DESK_TILE - DESK_QR) / 2, 1.4])

def desk_parts(title, link):
    body, label, ink = shell(title, "", ring=False, back=False)
    reels = None
    for d in (-1, 1):
        r = reel().rotate([0, 0, 15 * d]).translate([RX + d * RSEP, RY, TAPE_TOP + 0.05])
        reels = r if reels is None else reels + r
    tile, code = desk_tile(link)
    out = {k: _scaled(v) for k, v in dict(body=body, label=label, ink=ink, reels=reels).items()}
    cut, _ = desk_back(W * S_XY, H * S_XY)
    out["body"] = out["body"] - cut
    return out, (tile, code)

def stand(length, t):
    """Profile in y-z, extruded along x. Base, front lip, back rest parallel to the cassette back."""
    a = np.radians(LEAN)
    up = np.array([np.sin(a), np.cos(a)])              # along the cassette's height, leaning back
    n = np.array([np.cos(a), -np.sin(a)])              # back-face normal (pointing back)
    b0 = np.array([0.0, 4.0])                          # back-bottom edge of the cassette
    front = b0 - n * (t + 0.4)
    base = CrossSection.square([44.0, 4.0]).translate([-14.0, 0])
    lip = CrossSection([[[front[0] - 3.2, 4.0], [front[0], 4.0], [front[0] + 0.0, 9.0], [front[0] - 3.2, 8.2]]])
    p0 = b0 + n * 0.4; p1 = p0 + up * 42.0
    rest = CrossSection([[list(p0), list(p0 + n * 5.0), list(p1 + n * 5.0 + np.array([0, 0])), list(p1)]])
    if rest.area() < 0: rest = CrossSection([[list(p0), list(p1), list(p1 + n * 5.0), list(p0 + n * 5.0)]])
    foot = CrossSection([[list(p0 + n * 5.0), [p0[0] + 5.0 + 10.0, 4.0], [p0[0] + 5.0 + 10.0, 0.0], list(p0 + n * 5.0 - np.array([0, 4.0]))]])
    prof = base + lip + rest + (CrossSection([[[p0[0], 4.0], [p0[0] + 14.0, 4.0], list(p0 + n * 5.0 + up * 10.0)]]))
    st = prof.extrude(length).rotate([90, 0, 90])     # (y,z) profile, extruded along +x
    window = Manifold.cube([length - 28.0, 60.0, 60.0]).translate([14.0, p0[0] - 2.0, 10.0])
    st = st - window                                     # open back: two posts + a low spine, so the back stamp shows
    return st, b0, n, up

def mixtape_display(TITLE="it'sregular", LINK="https://safehouse.rw/s/AB12C"):
    parts, _ = desk_parts(TITLE, LINK)
    Wd = W * S_XY; t = T * S_Z
    st, b0, n, up = stand(Wd + 4.0, t)
    # cassette: face toward the viewer (-y), leaning back; its back-bottom edge on the stand at b0
    a = np.radians(90 - LEAN)
    place = lambda m: m.translate([0, 0, -t]).rotate([90 - LEAN, 0, 0]).translate([2.0, b0[0] - t * np.sin(a), b0[1] + t * np.cos(a)])
    out = {"black_stand": st}
    names = dict(body="black_shell", label="red_label", ink="white_ink", reels="white_reels")
    for k, v in parts.items(): out[names[k]] = place(v)
    return out

def mixtape(TITLE="it'sregular", LINK="https://safehouse.rw/s/AB12C"):
    parts, (tile, code) = desk_parts(TITLE, LINK)
    Wd, Hd = W * S_XY, H * S_XY; t = T * S_Z
    st, *_ = stand(Wd + 4.0, t)
    sb = st.bounding_box()
    big_tile, big_code = tile, code
    r = reel().scale([S_XY, S_XY, S_Z])
    return {"black_shell": parts["body"], "red_label": parts["label"], "white_ink": parts["ink"],
            "white_reels": r.translate([Wd + 14, 10, 0]) + r.translate([Wd + 32, 10, 0]),
            "black_stand": st.translate([-sb[0], Hd + 10 - sb[1], -sb[2]]),
            "white_tile": big_tile.translate([Wd + 8, 26, 0]), "black_qr": big_code.translate([Wd + 8, 26, 0])}
