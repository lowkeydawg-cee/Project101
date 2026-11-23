"""SH-TY-001 Sports car. An original mid-engine coupe, ~92 mm, engineered to print with NO colour swaps:
every part is one colour and goes on its own plate (body / canopy+tyres+axles / rims).
Assembled: canopy pegs into the body, rims press into the tyres, axles pass through the body and the wheels roll."""
import numpy as np, trimesh
from manifold3d import Manifold, Mesh, CrossSection, JoinType
from brand import maker_mark, cut_under

L = 92.0
FLOOR = 3.6          # ground clearance: body floor height when assembled
WR, WW = 8.2, 7.0    # wheel radius / width
FX, RX = 0.20 * L, 0.78 * L
AXLE_D, HOLE_D = 2.6, 3.2
TRACK = 21.6 - WW / 2 - 1.4          # tyre centre |y|
SEAT_Z = 13.4                        # canopy seat height
DEB = 0.6

def interp(t, pts):
    xs, ys = zip(*pts); return float(np.interp(t, xs, ys))

def loft(ts, half_w, z_bot, z_top, n_top=3.6, n_bot=9.0, m=72, taper=0.06, pinch=None):
    """Closed lofted solid from superellipse sections. Lower half is near-rectangular (prints without overhang)."""
    rings = []
    for t in ts:
        e = min(1.0, min(t - ts[0], ts[-1] - t) / taper + 0.2); e = np.sqrt(max(0.0, 1 - (1 - e) ** 2))
        w, zb, zt = half_w(t) * e, z_bot(t), z_top(t)
        zc, h = (zb + zt) / 2, (zt - zb) / 2
        hz = h * (0.4 + 0.6 * e)
        ring = []
        for a in np.linspace(0, 2 * np.pi, m, endpoint=False):
            c, s = np.cos(a), np.sin(a); n = n_top if s >= 0 else n_bot
            y = np.sign(c) * abs(c) ** (2 / n) * w
            z = np.sign(s) * abs(s) ** (2 / n) * (hz if s >= 0 else h)
            if pinch is not None and z > 0: y *= 1 - (1 - pinch(t)) * (z / hz) ** 1.6
            ring.append([t * L, y, zc + z])
        rings.append(ring)
    V = np.array(rings).reshape(-1, 3); k = len(ts); F = []
    for i in range(k - 1):
        for j in range(m):
            a, b = i * m + j, i * m + (j + 1) % m; F += [[a, a + m, b], [b, a + m, b + m]]
    c0 = len(V); V = np.vstack([V, np.array(rings[0]).mean(0), np.array(rings[-1]).mean(0)])
    for j in range(m):
        F.append([c0, j, (j + 1) % m]); F.append([c0 + 1, (k - 1) * m + (j + 1) % m, (k - 1) * m + j])
    tm = trimesh.Trimesh(V, np.array(F), process=True)
    if tm.volume < 0: tm.invert()
    return Manifold(Mesh(vert_properties=np.asarray(tm.vertices, np.float32), tri_verts=np.asarray(tm.faces, np.uint32)))

BODY_W = lambda t: interp(t, [(0, 16.5), (0.1, 20.0), (0.2, 21.6), (0.34, 20.6), (0.5, 19.6), (0.66, 21.4), (0.78, 22.6), (0.92, 21.8), (1, 19.5)])
BODY_TOP = lambda t: interp(t, [(0, 8.4), (0.07, 11.6), (0.2, 15.6), (0.32, 14.0), (0.5, 14.6), (0.66, 16.2), (0.78, 17.6),
                                (0.9, 16.6), (0.96, 17.4), (1, 15.4)])          # ducktail lip at the back
CAB_W = lambda t: interp(t, [(0.30, 12.0), (0.45, 15.0), (0.62, 15.0), (0.86, 11.0)])
CAB_TOP = lambda t: interp(t, [(0.30, 14.4), (0.40, 20.0), (0.50, 23.6), (0.60, 23.6), (0.74, 20.6), (0.86, 17.2)])

def _arch(x):
    """Teardrop arch (45° peak) so the wheel opening prints without supports."""
    r = WR + 1.3
    cs = (CrossSection.circle(r, 72) + CrossSection([[[-0.01, 0], [0.01, 0], [0, r * 1.414]]])).hull()
    a = cs.extrude(60).rotate([90, 0, 0]).translate([x, 30, WR])
    sides = Manifold.cube([40, 20, 40]).translate([x - 20, 11.5, -5]) + Manifold.cube([40, 20, 40]).translate([x - 20, -31.5, -5])
    return a ^ sides

def _groove_side(t, z0, z1, w=0.5, d=0.5):
    """A shut line cut into both flanks at body station t."""
    x, hw = t * L, BODY_W(t)
    g = Manifold.cube([w, 30, z1 - z0])
    return g.translate([x - w / 2, hw - d, z0]) + g.translate([x - w / 2, -hw - 30 + d, z0])

def parts_assembled():
    ts = np.linspace(0, 1, 110)
    body = loft(ts, BODY_W, lambda t: interp(t, [(0, 4.6), (0.1, 3.0), (0.9, 3.0), (1, 4.8)]), BODY_TOP, taper=0.07)
    body = body ^ Manifold.cube([200, 100, 100]).translate([-50, -50, FLOOR])            # flat floor
    cab = loft(np.linspace(0.30, 0.86, 70), CAB_W, lambda t: 12.0, CAB_TOP, n_top=2.6, n_bot=6, taper=0.12, pinch=lambda t: 0.72)
    seat = Manifold.cube([200, 100, 40]).translate([-50, -50, SEAT_Z])
    canopy = cab ^ seat
    prism = cab.slice(SEAT_Z).extrude(20).translate([0, 0, SEAT_Z])
    body = (body + (cab - seat)) - prism                                                    # flat seat for the canopy
    for x in (FX, RX): body = body - _arch(x)
    # details, all cut into the body (sharp edges, single colour)
    for t in (0.355, 0.605): body = body - _groove_side(t, FLOOR + 1.2, BODY_TOP(t) - 0.8)
    blade = lambda y: Manifold.cube([7, 7.5, 3]).rotate([0, -16, 0]).translate([2.4, y, 9.0])
    body = body - (blade(-15.5) + blade(8.0))                                               # headlight recesses
    vent = Manifold.cube([7, 1.2, 3]).rotate([0, -10, 0])
    for y in (-5, -2.6, 1.4, 3.8): body = body - vent.translate([0.25 * L, y, 13.6])        # hood vents
    scoop = Manifold.cylinder(6, 3.2, 3.2, 48).rotate([90, 0, 0]).scale([2.4, 1, 0.7])
    body = body - scoop.translate([0.62 * L, 22.6, 10.8]) - scoop.translate([0.62 * L, -22.6 + 6, 10.8])   # side intakes
    rear = Manifold.cube([1.0, 30, 1.0]).translate([L - 0.6, -15, 12.6])
    fins = None
    for y in (-9, -3, 3, 9):
        f = Manifold.cube([6, 1.0, 2.2]).translate([L - 5.6, y - 0.5, FLOOR - 0.1])
        fins = f if fins is None else fins + f
    body = body - rear - fins                                                                # light bar + diffuser
    # axle holes and canopy sockets
    for x in (FX, RX):
        body = body - Manifold.cylinder(60, HOLE_D / 2, HOLE_D / 2, 32).rotate([90, 0, 0]).translate([x, 30, WR])
    for x in (0.44 * L, 0.66 * L):                                                          # pegs up from the seat, sockets in the canopy
        body = body + Manifold.cylinder(2.6, 1.5, 1.5, 32).translate([x, 0, SEAT_Z - 0.2])
        canopy = canopy - Manifold.cylinder(3.0, 1.75, 1.75, 32).translate([x, 0, SEAT_Z - 0.1])
    # wheels: black tyre (with back web + hub) + white rim insert, on a D-shaped axle
    tyres, rims, axles = None, None, None
    for x in (FX, RX):
        for side in (-1, 1):
            tp = (CrossSection.square([WR - 5.0 - 1.0, WW - 2.0]).translate([5.0 + 0.5, -(WW - 2.0) / 2]).offset(1.0, JoinType.Round))
            tyre = tp.revolve(96)
            web = Manifold.cylinder(1.2, 5.6, 5.6, 64).translate([0, 0, -WW / 2]) - Manifold.cylinder(4, AXLE_D / 2 + 0.05, AXLE_D / 2 + 0.05, 32).translate([0, 0, -WW])
            tyre = (tyre + web)
            tread = None
            for k in range(36):
                a = 360 * k / 36
                g = Manifold.cube([1.0, 0.6, WW - 3.0]).translate([WR - 0.45, -0.3, -(WW - 3.0) / 2]).rotate([0, 0, a])
                tread = g if tread is None else tread + g
            tyre = tyre - tread
            disc = CrossSection.circle(5.0 - 0.1, 72)
            holes = CrossSection()
            for k in range(5):
                a = 2 * np.pi * k / 5 + np.pi / 2
                holes = holes + (CrossSection.circle(1.15, 32).translate([2.9 * np.cos(a), 2.9 * np.sin(a)]) +
                                 CrossSection.circle(0.7, 24).translate([4.0 * np.cos(a), 4.0 * np.sin(a)])).hull()
            rim = (disc - holes - CrossSection.circle(AXLE_D / 2 - 0.05, 32)).extrude(2.2) + \
                  (CrossSection.circle(1.9, 32) - CrossSection.circle(AXLE_D / 2 - 0.05, 32)).extrude(3.0)
            rim = rim.translate([0, 0, WW / 2 - 2.6])
            o = lambda m: m.rotate([-90 * side, 0, 0]).translate([x, side * TRACK, WR])
            tyres = o(tyre) if tyres is None else tyres + o(tyre); rims = o(rim) if rims is None else rims + o(rim)
        ax = (Manifold.cylinder(2 * (TRACK + WW / 2 - 0.4), AXLE_D / 2, AXLE_D / 2, 32) ^
              Manifold.cube([4, 4, 100]).translate([-2, -AXLE_D / 2 + 0.25, -50]))                  # D-flat
        ax = ax.translate([0, 0, -(TRACK + WW / 2 - 0.4)]).rotate([90, 0, 0]).translate([x, 0, WR])
        axles = ax if axles is None else axles + ax
    mk, ms = maker_mark("SH-TY-001", DEB + 0.3)
    under = mk.rotate([0, 180, 0]).translate([0.5 * L + ms[0] / 2, -ms[1] / 2, FLOOR + DEB])
    body = body - under
    return dict(body=body, canopy=canopy, tyres=tyres, rims=rims, axles=axles)

def sports_car(BODY="red", ROOF="black", RIM="white"):
    """Print layout: everything flat on the bed, each part named by its colour (one plate per colour)."""
    p = parts_assembled()
    body = p["body"].translate([0, 0, -FLOOR])
    canopy = p["canopy"].translate([0, 0, -SEAT_Z])
    out = {f"{BODY}_body": body.translate([10, 40, 0])}
    blk = canopy.translate([10, -30, 0])
    k = 0
    for x in (FX, RX):
        for side in (-1, 1):
            tyre = p["tyres"] ^ Manifold.cube([30, 30, 30]).translate([x - 15, side * TRACK - 15, WR - 15])
            t0 = tyre.translate([-x, -side * TRACK, -WR]).rotate([90 * side, 0, 0])
            t0 = t0.translate([0, 0, -t0.bounding_box()[2]])
            blk = blk + t0.translate([110 + (k % 2) * 22, -40 + (k // 2) * 22, 0])
            rim = p["rims"] ^ Manifold.cube([30, 30, 30]).translate([x - 15, side * TRACK - 15, WR - 15])
            r0 = rim.translate([-x, -side * TRACK, -WR]).rotate([90 * side, 0, 0])
            r0 = r0.translate([0, 0, -r0.bounding_box()[2]])
            rims = r0.translate([110 + (k % 2) * 14, 10 + (k // 2) * 14, 0]) if k == 0 else rims + r0.translate([110 + (k % 2) * 14, 10 + (k // 2) * 14, 0])
            k += 1
    for i, x in enumerate((FX, RX)):
        a = p["axles"] ^ Manifold.cube([10, 60, 30]).translate([x - 5, -30, 0])
        a = a.translate([-x, 0, -WR]).rotate([0, 0, 90])           # lying along x, flat side down
        bb = a.bounding_box(); a = a.translate([0, 0, -bb[2]])
        blk = blk + a.translate([140, -60 + i * 8, 0])
    out[f"{ROOF}_parts"] = blk
    out[f"{RIM}_rims"] = rims
    return out

def sports_car_display(BODY="red", ROOF="black", RIM="white"):
    p = parts_assembled()
    return {f"{BODY}_body": p["body"], f"{ROOF}_canopy": p["canopy"] + p["tyres"] + p["axles"], f"{RIM}_rims": p["rims"]}
