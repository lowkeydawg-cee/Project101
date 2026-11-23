"""Basketball court display concepts. Court markings to real proportions (FIBA), hoops scaled up for presence.
Colours limited to filament on hand: black, white, red, blue."""
import os, numpy as np, trimesh
from manifold3d import CrossSection, JoinType, Manifold
LW = 0.9           # painted line width (mm)
FLOOR = 5.0        # floor slab thickness
PAINT = 0.6        # paint relief

def add(p, k, m):
    if m is None: return
    p[k] = p[k] + m if k in p else m

def ring(r, w=LW, seg=128):
    return CrossSection.circle(r + w / 2, seg) - CrossSection.circle(max(0.01, r - w / 2), seg)

def half_court_lines(s, fill_key=True):
    """Half court, baseline at y=0, centre x=0; s = mm per metre. Returns (lines, key_fill, outline_cs)."""
    W, D = 15 * s, 14 * s
    box = CrossSection.square([W, D]).translate([-W / 2, 0])
    border = box - box.offset(-LW, JoinType.Miter)
    key = CrossSection.square([4.9 * s, 5.8 * s]).translate([-2.45 * s, 0])
    keyl = key - key.offset(-LW, JoinType.Miter)
    up = lambda y0: CrossSection.square([W, D]).translate([-W / 2, y0])
    ft = ring(1.8 * s).translate([0, 5.8 * s]) ^ up(5.8 * s)
    hy = 1.575 * s
    arc = ring(6.75 * s).translate([0, hy]) ^ up(hy + 1.416 * s)
    corners = CrossSection.square([LW, 2.99 * s]).translate([-6.6 * s - LW / 2, 0]) + CrossSection.square([LW, 2.99 * s]).translate([6.6 * s - LW / 2, 0])
    restr = ring(1.25 * s).translate([0, hy]) ^ up(hy)
    centre = ring(1.8 * s).translate([0, D]) ^ CrossSection.square([W, D]).translate([-W / 2, 0])
    midline = CrossSection.square([W, LW]).translate([-W / 2, D - LW])
    lines = border + keyl + ft + arc + corners + restr + centre + midline
    return lines, (key.offset(-LW, JoinType.Miter) if fill_key else None), box

def stroke3d(pts, r):
    out = None
    for a, b in zip(pts[:-1], pts[1:]):
        seg = (Manifold.sphere(r, 24).translate(list(a)) + Manifold.sphere(r, 24).translate(list(b))).hull()
        out = seg if out is None else out + seg
    return out

def net(cx, cy, z_top, r_top=6.6, r_bot=4.2, depth=9.0, n=12):
    """Diamond-weave net: strings zig-zag between three rings."""
    zs = [z_top, z_top - depth * 0.5, z_top - depth]
    rs = [r_top, (r_top + r_bot) / 2 + 0.3, r_bot]
    out = None
    for k in range(n):
        for lvl in range(2):
            for d in (-1, 1):
                a0 = 2 * np.pi * (k + 0.5 * lvl) / n
                a1 = a0 + d * np.pi / n
                p0 = (cx + rs[lvl] * np.cos(a0), cy + rs[lvl] * np.sin(a0), zs[lvl])
                p1 = (cx + rs[lvl + 1] * np.cos(a1), cy + rs[lvl + 1] * np.sin(a1), zs[lvl + 1])
                seg = stroke3d([p0, p1], 0.28)
                out = seg if out is None else out + seg
    bottom = ring(r_bot, 0.6, 64).translate([cx, cy]).extrude(0.6).translate([0, 0, zs[2] - 0.3])
    return out + bottom

def hoop_parts(cx, by, rim_z, board="white", rim="red", scale=1.0, facing=1):
    """Backboard face at y = by (court side = +y*facing), rim + net in front."""
    k = scale; p = {}
    bw, bh, bt = 36 * k, 22 * k, 2.0
    y0 = by if facing > 0 else by - bt
    add(p, f"{board}_board", Manifold.cube([bw, bt, bh]).translate([cx - bw / 2, y0 - (bt if facing > 0 else 0), rim_z - 3 * k]))
    sq = Manifold.cube([14 * k, 0.6, 10 * k]) - Manifold.cube([14 * k - 2.4, 2, 10 * k - 2.4]).translate([1.2, -0.7, 1.2])
    add(p, f"{rim}_square", sq.translate([cx - 7 * k, by + (0 if facing > 0 else -0.6), rim_z + 0.5]))
    rr = 7.0 * k; rcy = by + facing * (rr + 2.5)
    rim_m = ring(rr, 1.2, 96).translate([cx, rcy]).extrude(1.3).translate([0, 0, rim_z])
    brk = Manifold.cube([3, 3.2, 1.3]).translate([cx - 1.5, by + (0 if facing > 0 else -3.2), rim_z])
    add(p, f"{rim}_rim", rim_m + brk)
    add(p, "white_net", net(cx, rcy, rim_z, rr - 0.4, rr * 0.62, 9.5 * k))
    return p, rcy

def ball(x, y, z, r=6.0, colour="red"):
    b = Manifold.sphere(r, 64).translate([x, y, z])
    s1 = (Manifold.sphere(r + 0.12, 64) - Manifold.sphere(r - 0.1, 64)) ^ Manifold.cube([2 * r + 2, 0.5, 2 * r + 2]).translate([-r - 1, -0.25, -r - 1])
    s2 = (Manifold.sphere(r + 0.12, 64) - Manifold.sphere(r - 0.1, 64)) ^ Manifold.cube([0.5, 2 * r + 2, 2 * r + 2]).translate([-0.25, -r - 1, -r - 1])
    s3 = (Manifold.sphere(r + 0.12, 64) - Manifold.sphere(r - 0.1, 64)) ^ Manifold.cube([2 * r + 2, 2 * r + 2, 0.5]).translate([-r - 1, -r - 1, -0.25])
    return {f"{colour}_ball": b, "black_seams": (s1 + s2 + s3).translate([x, y, z])}

# ---------------------------------------------------------------------------------------------
def arena():
    """A · Arena: black hardwood-look floor with plank grooves, red painted key, pro stanchion with padded base, glass-style board."""
    s = 7.0; p = {}
    lines, keyf, box = half_court_lines(s)
    W, D = 15 * s, 14 * s
    slab = (box.offset(4, JoinType.Round)).extrude(FLOOR)
    planks = None
    for x in np.arange(-W / 2 + 6, W / 2, 6):
        g = Manifold.cube([0.4, D + 8, 0.4]).translate([x, -4, FLOOR - 0.35])
        planks = g if planks is None else planks + g
    add(p, "black_floor", slab - planks)
    add(p, "white_lines", lines.extrude(PAINT).translate([0, 0, FLOOR]))
    add(p, "red_key", keyf.extrude(PAINT * 0.5).translate([0, 0, FLOOR]))
    # stanchion behind the baseline: padded base, upright, diagonal boom to the board
    base = Manifold.cube([22, 16, 9]).translate([-11, -30, FLOOR])
    pad = Manifold.cube([22.6, 1.2, 9.6]).translate([-11.3, -14.6, FLOOR])
    up = Manifold.cube([5, 5, 62]).translate([-2.5, -26, FLOOR + 9])
    boom = stroke3d([(0, -23.5, FLOOR + 66), (0, -4, FLOOR + 50)], 2.0)
    add(p, "black_stanchion", base + up + boom); add(p, "red_pad", pad)
    hp, rcy = hoop_parts(0, 1.2 * s - 6, FLOOR + 40, board="white", rim="red", scale=1.0)
    for k, v in hp.items(): add(p, k, v)
    add(p, "black_brace", Manifold.cube([6, 4, 14]).translate([-3, -6.2 - 4, FLOOR + 42]))
    for k, v in ball(-4.5 * s, 8 * s, FLOOR + 6).items(): add(p, k, v)
    return p

def street():
    """B · Streetball: blue outdoor court, red key, gooseneck pole on a concrete pad, chain-weave net, ball on the line."""
    s = 7.0; p = {}
    lines, keyf, box = half_court_lines(s)
    W, D = 15 * s, 14 * s
    add(p, "blue_court", box.extrude(FLOOR))
    surround = (box.offset(7, JoinType.Miter) - box).extrude(FLOOR - 1.2)
    add(p, "black_surround", surround)
    add(p, "white_lines", lines.extrude(PAINT).translate([0, 0, FLOOR]))
    add(p, "red_key", keyf.extrude(PAINT * 0.5).translate([0, 0, FLOOR]))
    # gooseneck pole: rises behind the baseline, curves forward over it
    t = np.linspace(0, 1, 18)
    pts = [(0, -14 + 10 * (1 - np.cos(np.pi / 2 * u)) * (u > 0.6), FLOOR + 66 * min(1, u / 0.75)) for u in t]
    pts = [(0, -14, FLOOR)] + [(0, -14 + 12 * np.sin(np.pi / 2 * min(1, max(0, (u - 0.62) / 0.38))), FLOOR + 6 + 58 * np.sin(np.pi / 2 * min(1, u / 0.8))) for u in t[1:]]
    add(p, "black_pole", stroke3d(pts, 2.6) + Manifold.cylinder(2, 6, 6, 32).translate([0, -14, FLOOR - 1.2]))
    hp, rcy = hoop_parts(0, -0.5, FLOOR + 44, board="white", rim="red", scale=0.95)
    for k, v in hp.items(): add(p, k, v)
    for k, v in ball(5.2 * s, 6.8 * s, FLOOR + 5.5, 5.5).items(): add(p, k, v)
    return p

def full_court():
    """C · Full court tabletop: both halves, centre circle, two compact hoops facing each other."""
    s = 5.0; p = {}
    lines, keyf, box = half_court_lines(s)
    W, D = 15 * s, 14 * s
    other = lines.mirror([0, 1]).translate([0, 2 * D]); okey = keyf.mirror([0, 1]).translate([0, 2 * D])
    full = CrossSection.square([W, 2 * D]).translate([-W / 2, 0])
    add(p, "black_floor", full.offset(3, JoinType.Round).extrude(FLOOR))
    add(p, "white_lines", (lines + other).extrude(PAINT).translate([0, 0, FLOOR]))
    add(p, "blue_key", (keyf + okey).extrude(PAINT * 0.5).translate([0, 0, FLOOR]))
    add(p, "red_centre", CrossSection.circle(1.8 * s - LW / 2, 96).translate([0, D]).extrude(PAINT * 0.5).translate([0, 0, FLOOR]))
    for by, f in ((1.2 * s - 4, 1), (2 * D - 1.2 * s + 4, -1)):
        hp, _ = hoop_parts(0, by, FLOOR + 30, board="white", rim="red", scale=0.7, facing=f)
        for k, v in hp.items(): add(p, k, v)
        post_y = by - f * 9 - 2
        add(p, "black_post", Manifold.cube([4, 4, 40]).translate([-2, post_y, FLOOR]) + Manifold.cube([4, 9, 3]).translate([-2, min(post_y, by - f * 2 - (9 if f > 0 else 0)) if f > 0 else by + 0, FLOOR + 32]))
    for k, v in ball(2.5 * s, D, FLOOR + 4.2, 4.0).items(): add(p, k, v)
    return p

def stadium():
    """D · Stadium bowl: round arena, half court on the floor, tiered seating rings rising around it."""
    s = 5.5; p = {}
    lines, keyf, box = half_court_lines(s)
    W, D = 15 * s, 14 * s
    shift = [0, -D / 2]
    lines, keyf, box = lines.translate(shift), keyf.translate(shift), box.translate(shift)
    R0 = 64
    add(p, "black_floor", CrossSection.circle(R0, 160).extrude(FLOOR))
    add(p, "white_lines", lines.extrude(PAINT).translate([0, 0, FLOOR]))
    add(p, "red_key", keyf.extrude(PAINT * 0.5).translate([0, 0, FLOOR]))
    tiers = []
    for i in range(5):
        r_in, r_out = R0 + i * 5.5, R0 + (i + 1) * 5.5
        t = (CrossSection.circle(r_out, 180) - CrossSection.circle(r_in, 180)).extrude(FLOOR + 3.5 * (i + 1))
        add(p, ("blue_seats" if i % 2 == 0 else "white_seats") if i < 4 else "red_rim_tier", t)
    tunnel = Manifold.cube([16, 40, 40]).translate([-8, R0 + 4, 0]).rotate([0, 0, 180])
    for k in list(p):
        if "seats" in k or "tier" in k: p[k] = p[k] - tunnel
    hp, _ = hoop_parts(0, -D / 2 + 1.2 * s - 6, FLOOR + 36, board="white", rim="red", scale=0.85)
    for k, v in hp.items(): add(p, k, v)
    add(p, "black_post", Manifold.cube([4.5, 4.5, 40]).translate([-2.25, -D / 2 - 16, FLOOR]) +
        stroke3d([(0, -D / 2 - 14, FLOOR + 38), (0, -D / 2 + 1.2 * s - 8, FLOOR + 36)], 1.8))
    for k, v in ball(-3.5 * s, 1.5 * s, FLOOR + 4.5, 4.5).items(): add(p, k, v)
    return p

CONCEPTS = [("A Arena", arena, dict(az=148, el=22)), ("B Streetball", street, dict(az=150, el=22)),
            ("C Full Court", full_court, dict(az=-60, el=30)), ("D Stadium Bowl", stadium, dict(az=160, el=36))]
if __name__ == "__main__":
    import build
    jobs = []
    for name, fn, cam in CONCEPTS:
        slug = name.split(" ", 1)[1].replace(" ", "_").lower()
        out = os.path.join(build.HERE, "out", "courts", slug); os.makedirs(out, exist_ok=True)
        meshes = {}
        for part, man in fn().items():
            m = man.to_mesh(); meshes[part] = trimesh.Trimesh(np.array(m.vert_properties)[:, :3], np.array(m.tri_verts), process=True)
        allb = np.vstack([m.bounds for m in meshes.values()])
        print(name, [round(float(v)) for v in allb.max(0) - allb.min(0)])
        build.build_glb(meshes, os.path.join(out, "model.glb"))
        jobs.append(dict(glb=os.path.relpath(os.path.join(out, "model.glb"), build.HERE), out=os.path.join(out, "hero.png"), **cam))
    build.render(jobs, build.HERE)
