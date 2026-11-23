"""
Personalised orders -> print-ready files, for Saint to approve.

    python orders.py orders.json

orders.json: the rows Claude Code pulls from Supabase (see .claude/commands/orders.md):
  [{"order_number": "SH-1A2B3C4D", "customer_name": "...", "slug": "signature-nameplate",
    "quantity": 2, "personalisation": {"name": "Jane Uwase", "title": "CEO"}}]

For every item: validate the personalisation, auto-fit it, build the STLs, run the print checks,
render a preview (and scan the QR back for QR products). Nothing is printed or marked
in production until Saint approves the preview.
Output: out/orders/<order_number>/<n>-<slug>/{stl/, model.glb, raw/hero.png, job.json}
"""
import os, sys, json, re
from products import CATALOG
import build

HERE = os.path.dirname(os.path.abspath(__file__))

def clean(v, mx):
    return re.sub(r"[\x00-\x1f\x7f]", "", str(v or "")).strip()[:mx]

def expand_numbers(text, count):
    """'1-6' / '1,2,3,4,5,VIP' -> exactly `count` labels, or ValueError."""
    out = []
    for part in re.split(r"[,\s]+", text.strip()):
        if not part: continue
        m = re.fullmatch(r"(\d{1,3})-(\d{1,3})", part)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            if b < a or b - a > 50: raise ValueError(f"range {part} doesn't make sense")
            out += [str(i) for i in range(a, b + 1)]
        else:
            out.append(part.upper())
    if len(out) != count:
        raise ValueError(f"the set has {count} table numbers but {len(out)} were given ({', '.join(out) or 'none'})")
    return out

def expand_bundle(row):
    """A set order -> one row per printed piece, each with its own personalisation."""
    meta = CATALOG[row["slug"]]; given = row.get("personalisation") or {}; rows = []
    for c in meta["bundle"]:
        if c.get("each"):
            for label in expand_numbers(str(given.get(c["each"], "")), c["count"]):
                rows.append(dict(row, slug=c["slug"], personalisation={"number": label}))
        else:
            rows.append(dict(row, slug=c["slug"], personalisation={k: given.get(v) for k, v in c["map"].items()}))
    return rows

def run_item(order, n, item):
    slug = item["slug"]; tag = f"{order}/{n}-{slug}"
    if slug not in CATALOG:
        return dict(item=tag, status="BLOCKED", reason=f"unknown product {slug}")
    meta = CATALOG[slug]; given = item.get("personalisation") or {}
    over, problems = {}, []
    for key, f in meta["personalise"].items():
        v = clean(given.get(key), f["max"])
        if not v and f["required"]: problems.append(f"missing {f['label']}")
        if v: over[f["param"]] = v
    if problems:
        return dict(item=tag, status="NEEDS CUSTOMER", reason="; ".join(problems))
    out = os.path.join(HERE, "out", "orders", order, f"{n}-{slug}"); os.makedirs(out, exist_ok=True)
    try:
        meshes = build.build_stl(slug, out, over)
    except ValueError as e:                       # text too long, link too long ...
        return dict(item=tag, status="NEEDS CUSTOMER", reason=str(e))
    ok, rep = build.check(meshes)
    job = dict(item=tag, product=meta["name"], quantity=item.get("quantity", 1), personalisation=over,
               size_mm=rep["size_mm"], filament_g=round(rep["filament_g_estimate"] * item.get("quantity", 1), 1),
               warnings=rep["warnings"])
    if not ok:
        job.update(status="BLOCKED", reason="; ".join(rep["fails"])); return job
    build.build_glb(build.display_for(slug, meshes, over), os.path.join(out, "model.glb"))
    shots = dict(hero=meta["shots"]["hero"])
    if meta.get("qr"):
        k = "scan" if "scan" in meta["shots"] else "detail"; shots[k] = meta["shots"][k]
    raw = os.path.join(out, "raw"); os.makedirs(raw, exist_ok=True)
    glb = os.path.relpath(os.path.join(out, "model.glb"), HERE)
    build.render([dict(glb=glb, out=os.path.join(raw, f"{k}.png"), **v) for k, v in shots.items()], out)
    if meta.get("qr"):
        from products import with_defaults
        good, got = build.qr_check(os.path.join(raw, ("scan" if "scan" in meta["shots"] else "detail") + ".png"), meta["qr"](with_defaults(meta["fn"], over)))
        job["qr_scan"] = got
        if not good:
            job.update(status="BLOCKED", reason=f"QR does not scan back to the customer's link (got {got!r})"); return job
    job.update(status="READY FOR APPROVAL", preview=os.path.join(raw, "hero.png"), files=os.path.join(out, "stl"))
    json.dump(job, open(os.path.join(out, "job.json"), "w"), indent=2)
    return job

def main(path):
    rows = json.load(open(path)); jobs = []
    counters = {}
    for r in rows:
        if r.get("slug") in CATALOG and CATALOG[r["slug"]].get("bundle"):
            try:
                pieces = [p for _ in range(int(r.get("quantity", 1))) for p in expand_bundle(dict(r, quantity=1))]
            except ValueError as e:
                jobs.append(dict(item=f"{r['order_number']}/{r['slug']}", status="NEEDS CUSTOMER", reason=str(e))); continue
        else:
            pieces = [r]
        for p in pieces:
            o = p["order_number"]; counters[o] = counters.get(o, 0) + 1
            jobs.append(run_item(o, counters[o], p))
    print(f"\n{'ITEM':38} {'STATUS':20} DETAIL")
    for j in jobs:
        detail = j.get("reason") or f"{j['filament_g']} g · {j['size_mm']} mm" + (f" · QR ✓" if j.get("qr_scan") else "")
        print(f"{j['item']:38} {j['status']:20} {detail}")
    total = sum(j.get("filament_g", 0) for j in jobs if j["status"] == "READY FOR APPROVAL")
    print(f"\nFilament for approved-ready items: ~{total:.0f} g PLA (rough estimate)")
    json.dump(jobs, open(os.path.join(HERE, "out", "orders", "last_run.json"), "w"), indent=2)
    return all(j["status"] == "READY FOR APPROVAL" for j in jobs)

if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "out", "orders"), exist_ok=True)
    sys.exit(0 if main(sys.argv[1]) else 1)
