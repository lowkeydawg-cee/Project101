"""Brand-styled product slides: 01 hero, 02 detail, 03 origin stamp / profile, 04 spec card.
Prices are left off on purpose so slides never go stale."""
import os, glob, numpy as np, trimesh
from PIL import Image, ImageDraw, ImageFont
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path; from matplotlib.patches import PathPatch
from brand import maker_mark, lockup, logo, COLOURS

HERE = os.path.dirname(os.path.abspath(__file__))
F = lambda n, s: ImageFont.truetype(f"{HERE}/fonts/{n}", s)
SOFT, BLACK, GREY, INK = "#ECEAE6", COLOURS["black"], COLOURS["grey"], "#2A2A2A"
W, H = 1600, 1200

def tracked(d, xy, text, font, fill, track=0.0):
    sp = font.size * track; x, y = xy
    for c in text:
        d.text((x, y), c, font=font, fill=fill); x += d.textlength(c, font=font) + sp

def raster(man, colour, height_px, tmpdir):
    verts, codes = [], []
    for poly in man.slice(0.3).to_polygons():
        p = list(map(tuple, poly)); verts += p + [p[0]]
        codes += [Path.MOVETO] + [Path.LINETO] * (len(p) - 1) + [Path.CLOSEPOLY]
    v = np.array(verts); w_mm, h_mm = np.ptp(v[:, 0]), np.ptp(v[:, 1])
    fig = plt.figure(figsize=(height_px * w_mm / h_mm / 100, height_px / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1]); ax.add_patch(PathPatch(Path(verts, codes), color=colour, lw=0))
    ax.set_xlim(v[:, 0].min(), v[:, 0].max()); ax.set_ylim(v[:, 1].min(), v[:, 1].max()); ax.axis("off")
    tmp = os.path.join(tmpdir, "_raster.png"); fig.savefig(tmp, transparent=True); plt.close(fig)
    return Image.open(tmp).convert("RGBA")

def size_mm(stl_dir, meta=None):
    if meta and meta.get("display"):                     # assembled size, not the print layout
        bs = [m.bounding_box() for m in meta["display"]().values()]
        lo = np.min([b[:3] for b in bs], 0); hi = np.max([b[3:] for b in bs], 0); e = hi - lo
        return f"{e[0]:.0f} × {e[1]:.0f} × {e[2]:.0f} mm"
    b = np.vstack([trimesh.load(p).bounds for p in glob.glob(f"{stl_dir}/*.stl")]); e = b.max(0) - b.min(0)
    return f"{e[0]:.0f} × {e[1]:.0f} × {e[2]:.0f} mm"

def build_slides(slug, meta, raw, stl_dir, out):
    os.makedirs(out, exist_ok=True); name, code = meta["name"], meta["code"]
    def caption(d, nm):
        if nm: tracked(d, (90, H - 150), nm.upper(), F("Jost-500.ttf", 34), INK, 0.28)
        tracked(d, (90, H - 98), code, F("IBMPlexMono-Medium.ttf", 22), GREY, 0.1)
    # 01 hero
    im = Image.open(f"{raw}/hero.png").convert("RGBA"); d = ImageDraw.Draw(im); caption(d, name)
    m = raster(logo(20, 0.6)[0], GREY, 40, raw); im.alpha_composite(m, (W - 90 - m.width, 80))
    im.convert("RGB").save(f"{out}/01.webp", quality=86)
    # 02 detail
    im = Image.open(f"{raw}/detail.png").convert("RGBA")
    im.alpha_composite(Image.new("RGBA", (W, 170), (236, 234, 230, 235)), (0, 0)); d = ImageDraw.Draw(im)
    tracked(d, (90, 72), meta["headline"], F("Jost-500.ttf", 40), INK, 0.3); caption(d, "")
    im.convert("RGB").save(f"{out}/02.webp", quality=86)
    # 03 origin stamp, or side profile
    if meta.get("slide3", "stamp") == "stamp":
        im = Image.new("RGBA", (W, H), BLACK); d = ImageDraw.Draw(im)
        st = raster(maker_mark(code, 0.6)[0], GREY, 300, raw)
        if st.width > 1180: st = st.resize((1180, round(st.height * 1180 / st.width)), Image.LANCZOS)
        im.alpha_composite(st, ((W - st.width) // 2, (H - st.height) // 2 + 20))
        tracked(d, (90, 90), "STAMPED ON EVERY PIECE", F("Jost-500.ttf", 34), GREY, 0.3)
        tracked(d, (90, H - 120), f"DEBOSSED {meta.get('stamp_where', 'ON THE BACK')}  ·  YOUR PROOF OF ORIGIN", F("IBMPlexMono-Medium.ttf", 22), "#6E6C66", 0.1)
    else:
        im = Image.open(f"{raw}/profile.png").convert("RGBA"); d = ImageDraw.Draw(im)
        tracked(d, (90, 90), meta.get("profile_caption", name.upper()), F("Jost-500.ttf", 34), INK, 0.24)
        tracked(d, (90, H - 120), f"{code}  ·  ORIGIN STAMP UNDERNEATH", F("IBMPlexMono-Medium.ttf", 22), GREY, 0.1)
    im.convert("RGB").save(f"{out}/03.webp", quality=86)
    # 04 spec card
    im = Image.new("RGBA", (W, H), SOFT); d = ImageDraw.Draw(im)
    hero = Image.open(f"{raw}/hero.png").convert("RGBA").crop((260, 180, 1340, 1120)).resize((760, 661))
    im.alpha_composite(hero, (30, 270))
    x = 860; fs = 46
    while fs > 26 and sum(d.textlength(c, font=F("Jost-500.ttf", fs)) + fs * 0.22 for c in name.upper()) > W - 90 - x:
        fs -= 2
    tracked(d, (x, 150), name.upper(), F("Jost-500.ttf", fs), INK, 0.22)
    tracked(d, (x, 222), code, F("IBMPlexMono-Medium.ttf", 26), GREY, 0.1)
    rows = [("SIZE", size_mm(stl_dir, meta)), ("MATERIAL", "Matte PLA, printed in Kigali"),
            ("COLOURS", meta["colours"]), ("MADE FOR YOU", meta["custom"])]
    y = 360
    for k, v in rows:
        d.line([(x, y - 26), (W - 90, y - 26)], fill="#D3D0CA", width=2)
        tracked(d, (x, y), k, F("IBMPlexMono-Medium.ttf", 20), GREY, 0.14)
        d.text((x, y + 36), v, font=F("Jost-500.ttf", 30), fill=INK); y += 150
    lk = raster(lockup(3, 0.6)[0], INK, 52, raw); im.alpha_composite(lk, (x, H - 140))
    im.convert("RGB").save(f"{out}/04.webp", quality=86)
    return [f"{out}/0{i}.webp" for i in range(1, 5)]
