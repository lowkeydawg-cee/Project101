"""SH-TY-002 Arena Court and SH-TY-003 Full Court: desk display courts, engineered for the A1.
Every accessory part is ONE colour and prints flat with no supports; parts slot together with pegs and pockets.
The floor plate carries the court paint as the top 0.6 mm only (about two filament changes)."""
import numpy as np
from manifold3d import CrossSection, JoinType, Manifold
from brand import maker_mark
from courts import half_court_lines, ring, stroke3d, LW

FLOOR, PAINT, CL = 5.0, 0.6, 0.2          # floor thickness, paint relief, fit clearance
DEB = 0.6

def cube(x0, y0, z0, x1, y1, z1):
    return Manifold.cube([x1 - x0, y1 - y0, z1 - z0]).translate([x0, y0, z0])

def drop(m):
    b = m.bounding_box(); return m.translate([-b[0], -b[1], -b[2]])

# ---------------------------------------------------------------- hoop (facing +y, board back face at y=yb)
def hoop(yb, rim_z, k, post="stanchion"):
    """Returns assembled parts {name: manifold} and print pieces [(colour, manifold_in_print_orientation)]."""
    bw, bh, bt = 36 * k, 22 * k, 3.0
    z0 = rim_z - 3 * k
    board = cube(-bw / 2, yb, z0, bw / 2, yb + bt, z0 + bh)
    zc = z0 + bh * 0.55
    board = board - cube(-2.7 - CL, yb - 0.01, zc - 2 - CL, 2.7 + CL, yb + 2.0, zc + 2 + CL)          # arm pocket (back)
    board = board - cube(-1.2 - CL, yb + bt - 1.8, rim_z - CL, 1.2 + CL, yb + bt + 0.01, rim_z + 1.3 + CL)   # rim pocket (front)
    sq = cube(-7 * k, yb + bt, rim_z + 0.6, 7 * k, yb + bt + 0.6, rim_z + 0.6 + 10 * k) - \
         cube(-7 * k + 1.2, yb + bt - 0.1, rim_z + 1.8, 7 * k - 1.2, yb + bt + 0.8, rim_z - 0.6 + 10 * k)
    rr = 7.0 * k; rcy = yb + bt + rr + 2.2
    rim = ring(rr, 1.4, 96).translate([0, rcy]).extrude(1.3).translate([0, 0, rim_z])
    tab = cube(-1.2, yb + bt - 1.6, rim_z, 1.2, rcy - rr + 0.3, rim_z + 1.3)
    rim = rim + tab
    # net: bottom ring on the bed when printed, strings lean outward (< 20°), clips under the rim
    zs = [rim_z - 0.05, rim_z - 9.5 * k * 0.5, rim_z - 9.5 * k]
    rs = [rr - 0.2, rr * 0.82, rr * 0.62]; n = 12; strings = None
    for i in range(n):
        for lvl in range(2):
            for d in (-1, 1):
                a0 = 2 * np.pi * (i + 0.5 * lvl) / n; a1 = a0 + d * np.pi / n
                p0 = (rs[lvl] * np.cos(a0), rcy + rs[lvl] * np.sin(a0), zs[lvl] - 0.5); p1 = (rs[lvl + 1] * np.cos(a1), rcy + rs[lvl + 1] * np.sin(a1), zs[lvl + 1] - 0.45)
                s = (Manifold.sphere(0.5, 16).translate(list(p0)) + Manifold.sphere(0.5, 16).translate(list(p1))).hull()
                strings = s if strings is None else strings + s
    net = strings + ring(rs[2], 1.0, 72).translate([0, rcy]).extrude(1.0).translate([0, 0, zs[2] - 0.5]) \
        + ring(rs[1], 0.9, 84).translate([0, rcy]).extrude(0.9).translate([0, 0, zs[1] - 0.45]) \
        + ring(rs[0], 1.0, 96).translate([0, rcy]).extrude(1.0).translate([0, 0, zs[0] - 1.0])
    net = net.as_original()
    # support: profile in the y-z plane, 5 mm thick, prints lying flat
    if post == "stanchion":
        col_y0, col_y1, foot = yb - 26, yb - 21, FLOOR + 9 - 4
        prof = CrossSection([[[col_y0, foot], [col_y1, foot], [col_y1, zc - 2], [yb + 2.0 - CL, zc - 2], [yb + 2.0 - CL, zc + 2],
                              [col_y1, zc + 2], [col_y1, zc + 4.5], [col_y0, zc + 4.5]]])
        brace = CrossSection([[[col_y1, zc - 15], [col_y1, zc - 11.5], [yb - 9, zc - 2], [yb - 12.5, zc - 2]]])
        prof = prof + brace
    else:   # slim pole straight into the floor
        col_y0, col_y1, foot = yb - 9, yb - 5, FLOOR - 3
        prof = CrossSection([[[col_y0, foot], [col_y1, foot], [col_y1, zc - 2], [yb + 2.0 - CL, zc - 2], [yb + 2.0 - CL, zc + 2],
                              [col_y1, zc + 2], [col_y1, zc + 8], [col_y0, zc + 8]]])
    support = prof.extrude(5).rotate([0, 0, 0])
    support = support.rotate([90, 0, 90]).translate([-2.5, 0, 0])     # profile (y,z) -> world y,z ; extrude along x
    parts = dict(board=board, square=sq, rim=rim, net=net, support=support)
    base = None
    if post == "stanchion":
        base = cube(-11, yb - 32, FLOOR, 11, yb - 15, FLOOR + 9)
        base = base - cube(-2.5 - CL, col_y0 - CL, FLOOR + 5 - 0.01, 2.5 + CL, col_y1 + CL, FLOOR + 9.01)
        for x in (-6.5, 6.5):
            base = base + Manifold.cylinder(2.5, 1.5, 1.5, 32).translate([x, yb - 23.5, FLOOR - 2.5])
        parts["base"] = base
    return parts

def hoop_print(parts):
    """Each part rotated into its print orientation and dropped onto the bed."""
    out = {}
    bd = parts["board"].rotate([90, 0, 0]); sq = parts["square"].rotate([90, 0, 0])     # front face up
    b = bd.bounding_box(); sh = [-b[0], -b[1], -b[2]]
    out["board"], out["square"] = bd.translate(sh), sq.translate(sh)                       # red square = top layers only
    out["rim"] = drop(parts["rim"])
    out["net"] = drop(parts["net"])
    out["support"] = drop(parts["support"].rotate([0, 90, 0]))
    if parts.get("base") is not None: out["base"] = drop(parts["base"].rotate([180, 0, 0]))     # pegs up, socket on the bed
    return out

def ball_halves(r):
    b = Manifold.sphere(r, 72)
    seams = None
    for rot in ([0, 0, 0], [90, 0, 0], [0, 90, 0]):
        sl = (Manifold.sphere(r + 1, 72) - Manifold.sphere(r - 0.45, 72)) ^ cube(-r - 2, -0.35, -r - 2, r + 2, 0.35, r + 2)
        sl = sl.rotate(rot); seams = sl if seams is None else seams + sl
    b = b - seams
    top = b ^ cube(-r - 1, -r - 1, 0, r + 1, r + 1, r + 1)
    bot = (b ^ cube(-r - 1, -r - 1, -r - 1, r + 1, r + 1, 0)).rotate([180, 0, 0])
    pin = Manifold.cylinder(2.0, 1.0, 1.0, 24)
    top = top - pin.translate([0, r * 0.45, -0.01]); bot = bot + pin.translate([0, -r * 0.45, -0.01]) if False else bot - pin.translate([0, -r * 0.45, -0.01])
    return b, drop(top), drop(bot)

# ---------------------------------------------------------------- courts
def _floor(lines, keyf, outline, apron, socket_xy, mark_at):
    slab = (outline.offset(4, JoinType.Round) + apron).extrude(FLOOR)
    for (x, y, r) in socket_xy:
        slab = slab - Manifold.cylinder(2.8, r + CL, r + CL, 32).translate([x, y, FLOOR - 2.7])
    mk, ms = maker_mark(mark_at[0], DEB + 0.3)
    slab = slab - mk.rotate([0, 180, 0]).translate([mark_at[1] + ms[0] / 2, mark_at[2] - ms[1] / 2, DEB])
    return slab, lines.extrude(PAINT).translate([0, 0, FLOOR]), keyf.extrude(PAINT * 0.5).translate([0, 0, FLOOR])

def arena_court(KEY="red", FLOOR_C="black"):
    s = 7.0; lines, keyf, box = half_court_lines(s)
    yb = 1.2 * s - 6 - 3.0
    hp = hoop(yb, FLOOR + 40, 1.0, "stanchion")
    W = 15 * s
    planks = None
    for x in np.arange(-W / 2 + 6, W / 2, 6):
        g = cube(x - 0.2, 2, FLOOR - 0.35, x + 0.2, 14 * s - 2, FLOOR + 0.01)
        planks = g if planks is None else planks + g
    floor, paint, key = _floor(lines, keyf, box, CrossSection.square([30, 38]).translate([-15, yb - 36]),
                               [(-6.5, yb - 23.5, 1.5), (6.5, yb - 23.5, 1.5)], ("SH-TY-002", 0, 14 * s / 2))
    floor = floor - planks
    full, top, bot = ball_halves(6.0)
    assembled = {f"{FLOOR_C}_floor": floor, "white_lines": paint, f"{KEY}_key": key,
                 "red_base": hp["base"], "black_support": hp["support"], "white_board": hp["board"], "red_square": hp["square"],
                 "red_rim": hp["rim"], "white_net": hp["net"], "red_ball": full.translate([-4.5 * s, 8 * s, FLOOR + 6])}
    return assembled, hp, (top, bot), (floor, paint, key)

def full_court_build(KEY="blue", FLOOR_C="black"):
    s = 5.0; lines, keyf, box = half_court_lines(s)
    D = 14 * s
    other = lines.mirror([0, 1]).translate([0, 2 * D]); okey = keyf.mirror([0, 1]).translate([0, 2 * D])
    outline = CrossSection.square([15 * s, 2 * D]).translate([-15 * s / 2, 0])
    centre = CrossSection.circle(1.8 * s - LW / 2, 96).translate([0, D])
    yb = 1.2 * s - 6 - 3.0
    hpa = hoop(yb, FLOOR + 30, 0.7, "pole")
    aprons = CrossSection.square([16, 14]).translate([-8, yb - 13]) + CrossSection.square([16, 14]).translate([-8, 2 * D - yb - 1])
    sockets = [(0, yb - 7, 2.0), (0, 2 * D - yb + 7, 2.0)]
    floor, paint, key = _floor(lines + other, keyf + okey, outline, aprons, [], ("SH-TY-003", 0, D))
    # square sockets for the two poles
    for y0 in (yb - 9, 2 * D - yb + 5):
        floor = floor - cube(-2.5 - CL, y0 - CL, FLOOR - 3 - 0.01, 2.5 + CL, y0 + 4 + CL, FLOOR + 0.01)
    centre_m = centre.extrude(PAINT * 0.5).translate([0, 0, FLOOR])
    mirror = lambda m: m.mirror([0, 1, 0]).translate([0, 2 * D, 0])
    full, top, bot = ball_halves(4.0)
    assembled = {f"{FLOOR_C}_floor": floor, "white_lines": paint, f"{KEY}_key": key, "red_centre": centre_m,
                 "black_support": hpa["support"] + mirror(hpa["support"]), "white_board": hpa["board"] + mirror(hpa["board"]),
                 "red_square": hpa["square"] + mirror(hpa["square"]), "red_rim": hpa["rim"] + mirror(hpa["rim"]),
                 "white_net": hpa["net"] + mirror(hpa["net"]), "red_ball": full.translate([2.5 * s, D, FLOOR + 4])}
    return assembled, hpa, (top, bot), (floor, paint, key, centre_m)

def _layout(floor_parts, pieces, x0):
    """Floor plate at the origin; accessory pieces packed in a column grid to its right (separate plates per colour)."""
    out = {}
    for k, m in floor_parts.items(): out[k] = m
    x, y, rowh = x0, 0, 0
    for name, m in pieces:
        names, ms = (name, m) if isinstance(name, tuple) else ((name,), (m,))
        b = ms[0].bounding_box(); w, d = b[3] - b[0], b[4] - b[1]
        if y + d > 240: x += rowh + 6; y = 0; rowh = 0
        for nm, piece in zip(names, ms):
            mm = piece.translate([x - b[0], y - b[1], -b[2]])
            out[nm] = out[nm] + mm if nm in out else mm
        y += d + 6; rowh = max(rowh, w)
    return out

def arena_court_print(KEY="red", FLOOR_C="black"):
    a, hp, (top, bot), (floor, paint, key) = arena_court(KEY, FLOOR_C)
    b = floor.bounding_box(); sh = [-b[0], -b[1], 0]
    fp = {f"{FLOOR_C}_floor": floor.translate(sh), "white_lines": paint.translate(sh), f"{KEY}_key": key.translate(sh)}
    pr = hoop_print(hp)
    pieces = [("red_parts", pr["base"]), ("red_parts", pr["rim"]), ("red_parts", top), ("red_parts", bot),
              ("black_parts", pr["support"]), (("white_board", "red_square"), (pr["board"], pr["square"])), ("white_net", pr["net"])]
    return _layout(fp, pieces, b[3] - b[0] + 10)

def full_court_print(KEY="blue", FLOOR_C="black"):
    a, hp, (top, bot), (floor, paint, key, centre) = full_court_build(KEY, FLOOR_C)
    b = floor.bounding_box(); sh = [-b[0], -b[1], 0]
    fp = {f"{FLOOR_C}_floor": floor.translate(sh), "white_lines": paint.translate(sh), f"{KEY}_key": key.translate(sh), "red_centre": centre.translate(sh)}
    pr = hoop_print(hp)
    pieces = []
    for _ in range(2):
        pieces += [("black_parts", pr["support"]), (("white_board", "red_square"), (pr["board"], pr["square"])), ("red_parts", pr["rim"]), ("white_net", pr["net"])]
    pieces += [("red_parts", top), ("red_parts", bot)]
    return _layout(fp, pieces, b[3] - b[0] + 10)

def arena_court_display(KEY="red", FLOOR_C="black"):
    return arena_court(KEY, FLOOR_C)[0]

def full_court_display(KEY="blue", FLOOR_C="black"):
    return full_court_build(KEY, FLOOR_C)[0]
