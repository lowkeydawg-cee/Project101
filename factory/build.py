"""
The Safehouse product factory.

    python build.py <slug> [<slug> ...]      full pipeline for those products
    python build.py all                      every product in the catalogue
    python build.py <slug> --only stl,check  run selected steps
    python build.py <slug> --publish         also copy slides + model into ../public/products/v3/<slug>/

Steps: stl -> check -> glb -> render -> slides -> sql
Outputs: out/<slug>/{stl/, model.glb, raw/, slides/, report.json, product.sql}
Exit code 1 if any check FAILS (nothing gets published).
"""
import os, sys, json, shutil, subprocess, argparse
import numpy as np, trimesh
from brand import part_colour, PRINTER
from products import CATALOG

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.safehouse.rw/products/v3"
PLA_DENSITY = 1.24          # g/cm3
SHELL_MM = 0.85             # ~2 walls + top/bottom layers
INFILL = 0.15               # Bambu default sparse infill

# ------------------------------------------------------------------ stl
def build_stl(slug, out, overrides=None):
    meta = CATALOG[slug]; parts = meta["fn"](**(overrides or {}))
    d = os.path.join(out, "stl"); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    meshes = {}
    for part, man in parts.items():
        mesh = man.to_mesh()
        t = trimesh.Trimesh(np.array(mesh.vert_properties)[:, :3], np.array(mesh.tri_verts), process=True)
        t.export(os.path.join(d, f"{slug}_{part}.stl")); meshes[part] = t
    return meshes

def display_for(slug, meshes, overrides=None):
    """Meshes to show in renders / the 3D viewer: the assembled object when the print layout differs."""
    fn = CATALOG[slug].get("display")
    if fn and CATALOG[slug].get("bundle"): overrides = None      # sets always show the sample pieces
    if not fn: return meshes
    out = {}
    for k, man in fn(**(overrides or {})).items():
        mesh = man.to_mesh()
        out[k] = trimesh.Trimesh(np.array(mesh.vert_properties)[:, :3], np.array(mesh.tri_verts), process=True)
    return out

def props_for(slug, overrides=None):
    """Display-only meshes (e.g. cards in a holder) for renders and the 3D viewer. Never printed."""
    fn = CATALOG[slug].get("props")
    if not fn: return {}
    out = {}
    for k, man in fn().items():
        mesh = man.to_mesh()
        out[k] = trimesh.Trimesh(np.array(mesh.vert_properties)[:, :3], np.array(mesh.tri_verts), process=True)
    return out

# ------------------------------------------------------------------ checks
def check(meshes):
    """Print-readiness checks. Returns (ok, report)."""
    fails, warns, info = [], [], {}
    allb = np.vstack([m.bounds for m in meshes.values()]); ext = allb.max(0) - allb.min(0)
    bed = PRINTER["bed_mm"]
    info["size_mm"] = [round(float(x), 1) for x in ext]
    if any(e > b for e, b in zip(ext, bed)):
        fails.append(f"does not fit the {PRINTER['name']} bed {bed}: {info['size_mm']}")
    if allb.min(0)[2] < -0.31:
        fails.append("geometry below the bed (z < 0)")
    grams = 0.0
    for part, m in meshes.items():
        if not m.is_watertight:
            fails.append(f"{part}: mesh is not watertight")
        tiny = [c for c in m.split(only_watertight=False) if abs(c.volume) < 0.3]
        if tiny:
            warns.append(f"{part}: {len(tiny)} tiny island(s) < 0.3 mm³ may not print")
        v = abs(m.volume); shell = min(v, m.area * SHELL_MM)
        grams += (shell + INFILL * (v - shell)) / 1000 * PLA_DENSITY
    # overhangs, judged on the whole multi-part model: a downward face (> 45°) is fine if
    # material is close below it (<= 2 mm) or it is a short bridge (walls within 3 mm both sides).
    whole = trimesh.util.concatenate(list(meshes.values()))
    down = np.where((whole.face_normals[:, 2] < -0.71) & (whole.triangles_center[:, 2] > 0.4))[0]
    if len(down):
        ray = trimesh.ray.ray_triangle.RayMeshIntersector(whole)
        c = whole.triangles_center[down] - [0, 0, 0.05]      # start just under the face
        def reach(dirv, eps=0.02):
            d = np.tile(dirv, (len(c), 1)).astype(float); o = c + d * eps
            loc, idx, _ = ray.intersects_location(o, d, multiple_hits=False)
            dist = np.full(len(c), np.inf)
            if len(idx): dist[idx] = np.linalg.norm(np.asarray(loc).reshape(-1, 3) - o[idx], axis=1)
            return dist
        # resting on another part (e.g. letters lying on a slope): material right under it
        resting = np.zeros(len(c), bool)
        for m in meshes.values():
            resting |= m.contains(c - [0, 0, 0.25])
        below = reach([0, 0, -1])
        h = [reach(v) for v in ([1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0])]
        bridge = ((h[0] + h[1]) <= 3.0) | ((h[2] + h[3]) <= 3.0)       # short span, both ends held
        ledge = np.min(h, axis=0) <= 1.2                                # tiny lip off a wall (raised 0.6 mm marks)
        bad = ~resting & (below > 2.0) & ~bridge & ~ledge
        area = float(whole.area_faces[down[bad]].sum())
        info["unsupported_overhang_mm2"] = round(area, 1)
        if area > 20:
            warns.append(f"{area:.0f} mm² of unsupported overhang > 45° (add supports or redesign)")
    info["filament_g_estimate"] = round(grams, 1)
    # floating pieces: every separate piece must sit on the bed or on/inside other material
    whole_f = trimesh.util.concatenate(list(meshes.values()))
    rayf = trimesh.ray.ray_triangle.RayMeshIntersector(whole_f)
    floating = 0
    for part, m in meshes.items():
        for comp in m.split(only_watertight=False):
            zmin = comp.bounds[0][2]
            if zmin <= 0.3:
                continue
            low = comp.vertices[comp.vertices[:, 2] < zmin + 0.05][:5]
            # nudge samples 0.2 mm inward (toward the piece's centre) so they never sit exactly on a surface
            v = comp.centroid[:2] - low[:, :2]; n = np.linalg.norm(v, axis=1, keepdims=True); n[n == 0] = 1
            low = low.copy(); low[:, :2] += 0.2 * v / n; low[:, 2] -= 0.05
            others = [o for n, o in meshes.items() if n != part]
            held = any(o.contains(low).any() for o in meshes.values())
            if not held:   # held from the side by another part at its lowest layer (inlays, multi-colour)
                for dx, dy in [(d * sx, d * sy) for d in (0.3, 0.8, 1.3) for sx, sy in ((1, 0), (-1, 0), (0, 1), (0, -1))]:  # covers reliefs raised up to 1.2 mm
                    side = low + [dx, dy, 0.05]
                    if any(o.contains(side).any() for o in others):
                        held = True; break
            if not held:
                loc, idx, _ = rayf.intersects_location(low, np.tile([0, 0, -1.0], (len(low), 1)), multiple_hits=False)
                held = len(idx) and np.min(np.linalg.norm(np.asarray(loc).reshape(-1, 3) - low[idx], axis=1)) < 0.6
            if not held:
                floating += 1
    if floating:
        fails.append(f"{floating} piece(s) float in the air (nothing under them) and would fall off while printing")
    info["parts"] = {p: part_colour(p) for p in meshes}
    return (not fails), dict(fails=fails, warnings=warns, **info)

# ------------------------------------------------------------------ glb
def build_glb(meshes, path):
    sc = trimesh.Scene()
    for part, m in meshes.items():
        m = m.copy(); m.apply_scale(0.001)
        m.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0]))
        srgb = [int(part_colour(part)[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        lin = [round(255 * (c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)) for c in srgb]
        m.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            baseColorFactor=lin + [255], roughnessFactor=0.85, metallicFactor=0.0))
        sc.add_geometry(m, node_name=part)
    sc.export(path)

# ------------------------------------------------------------------ render
def render(jobs, tmp):
    jf = os.path.join(tmp, "_jobs.json"); json.dump(jobs, open(jf, "w"))
    r = subprocess.run(["node", os.path.join(HERE, "render", "shoot.js"), jf], cwd=os.path.join(HERE, "render"),
                       capture_output=True, text=True)
    if r.returncode: raise RuntimeError("render failed:\n" + r.stderr[-2000:])

def shots_for(slug, out):
    s = CATALOG[slug]["shots"]; raw = os.path.join(out, "raw"); os.makedirs(raw, exist_ok=True)
    glb = os.path.relpath(os.path.join(out, "model.glb"), HERE)
    jobs = [dict(glb=glb, out=os.path.join(raw, f"{k}.png"), **v) for k, v in s.items()]
    return jobs, raw

def qr_check(png, expected):
    import cv2
    g = cv2.cvtColor(cv2.imread(png), cv2.COLOR_BGR2GRAY)
    got = cv2.QRCodeDetector().detectAndDecode(g)[0]
    if got != expected and hasattr(cv2, "QRCodeDetectorAruco"):   # more robust on angled, raised codes
        got = cv2.QRCodeDetectorAruco().detectAndDecode(g)[0] or got
    return got == expected, got

# ------------------------------------------------------------------ sql
def product_sql(slug):
    m = CATALOG[slug]; q = lambda s: "'" + str(s).replace("'", "''") + "'"
    base = f"{SITE}/{slug}"
    gallery = "array[" + ",".join(q(f"{base}/0{i}.webp") for i in range(1, 5)) + "]::text[]"
    pers = q(json.dumps([dict(key=k, label=v["label"], max=v["max"], required=v["required"])
                         for k, v in m["personalise"].items()])) + "::jsonb"
    vals = dict(catalog_no=q(m["code"]), name=q(m["name"]), category=q(m["category"]), price=str(m["price"]),
                description=q(m["description"]), material=q("PLA"), finish=q(m["colours"].replace(" · ", ", ")),
                image_url=q(f"{base}/01.webp"), gallery=gallery, glb_url=q(f"{base}/model.glb"), personalise=pers)
    sets = ",\n  ".join(f"{k} = {v}" for k, v in vals.items())
    cols = ", ".join(["slug"] + list(vals)); vs = ", ".join([q(slug)] + list(vals.values()))
    return (f"-- {m['name']} ({m['code']}). Run after the files are live on www.safehouse.rw.\n"
            f"update public.products set\n  {sets}\nwhere slug = {q(slug)};\n"
            f"insert into public.products ({cols})\nselect {vs}\n"
            f"where not exists (select 1 from public.products where slug = {q(slug)});\n")

# ------------------------------------------------------------------ pipeline
def run(slug, steps, publish=False):
    from slides import build_slides
    meta = CATALOG[slug]; out = os.path.join(HERE, "out", slug); os.makedirs(out, exist_ok=True)
    print(f"\n== {meta['name']} ({meta['code']})")
    if meta.get("bundle"):                       # a set: pieces are checked on their own listings
        meshes = display_for(slug, None); ok = True
        rep = dict(fails=[], warnings=[], size_mm=[round(float(v), 1) for v in np.ptp(np.vstack([m.bounds for m in meshes.values()]), 0)],
                   filament_g_estimate=0, parts={k: part_colour(k) for k in meshes},
                   pieces=[c["slug"] + (f" x{c['count']}" if c.get("count") else "") for c in meta["bundle"]])
    else:
        meshes = build_stl(slug, out)
        ok, rep = check(meshes)
    for f in rep["fails"]: print("  FAIL ", f)
    for w in rep["warnings"]: print("  warn ", w)
    print(f"  size {rep['size_mm']} mm · ~{rep['filament_g_estimate']} g PLA · parts {rep['parts']}")
    if ok and "glb" in steps:
        build_glb({**display_for(slug, meshes), **props_for(slug)}, os.path.join(out, "model.glb"))
    if ok and "render" in steps:
        jobs, raw = shots_for(slug, out); render(jobs, out)
        if meta.get("qr"):
            from products import with_defaults
            good, got = qr_check(os.path.join(raw, "scan.png" if "scan" in meta["shots"] else "detail.png"), meta["qr"](with_defaults(meta["fn"])))
            rep["qr_scan"] = got
            if not good:
                ok = False; rep["fails"].append(f"QR did not scan back correctly (got {got!r})"); print("  FAIL  QR scan")
            else:
                print("  QR scans:", got)
    if ok and "slides" in steps:
        build_slides(slug, meta, os.path.join(out, "raw"), os.path.join(out, "stl"), os.path.join(out, "slides"))
    if ok and "sql" in steps:
        open(os.path.join(out, "product.sql"), "w").write(product_sql(slug))
    if ok and publish:
        dst = os.path.join(HERE, "..", "public", "products", "v3", slug); os.makedirs(dst, exist_ok=True)
        for f in os.listdir(os.path.join(out, "slides")): shutil.copy(os.path.join(out, "slides", f), dst)
        shutil.copy(os.path.join(out, "model.glb"), dst); print("  published ->", os.path.normpath(dst))
    rep["ok"] = ok; json.dump(rep, open(os.path.join(out, "report.json"), "w"), indent=2)
    print("  RESULT:", "READY" if ok else "BLOCKED")
    return ok

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("slugs", nargs="+")
    ap.add_argument("--only", default="stl,check,glb,render,slides,sql"); ap.add_argument("--publish", action="store_true")
    a = ap.parse_args(); slugs = list(CATALOG) if a.slugs == ["all"] else a.slugs
    bad = [s for s in slugs if s not in CATALOG]
    if bad: sys.exit(f"unknown product(s): {bad}. Known: {list(CATALOG)}")
    steps = set(a.only.split(","))
    sys.exit(0 if all([run(s, steps, a.publish) for s in slugs]) else 1)
