"""Turntable videos for the catalogue:  python turntable.py [slug ...]
Renders a 360° spin from out/<slug>/model.glb (the assembled display model), adds the brand frame
(lockup top-left, name + catalogue number bottom-left), encodes out/<slug>/video/turntable.mp4 (1080x1350, 6 s loop)."""
import os, sys, subprocess, shutil
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
from products import CATALOG
from slides import raster, tracked, F, INK, GREY
from brand import lockup

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, SECONDS = 1080, 1350, 30, 6
EL = {"sports-car": 14, "signature-nameplate": 14, "brand-signature": 10, "card-holder": 20, "order-desk": 22, "wifi-stand": 20}

def overlay(slug, tmp):
    m = CATALOG[slug]; im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lk = raster(lockup(3, 0.6)[0], INK, 40, tmp); im.alpha_composite(lk, (64, 64))
    tracked(d, (64, H - 150), m["name"].upper(), F("Jost-500.ttf", 34), INK, 0.24)
    tracked(d, (64, H - 100), f"{m['code']}  ·  MADE IN KIGALI", F("IBMPlexMono-Medium.ttf", 22), GREY, 0.1)
    p = os.path.join(tmp, "overlay.png"); im.save(p); return p

def make(slug):
    out = os.path.join(HERE, "out", slug); glb = os.path.join("out", slug, "model.glb")
    frames = os.path.join(out, "video", "frames"); shutil.rmtree(frames, ignore_errors=True)
    n = FPS * SECONDS
    subprocess.run(["node", os.path.join(HERE, "render", "spin.js"), glb, frames, str(n), str(EL.get(slug, 16)), "-35"],
                   cwd=HERE, check=True, capture_output=True)
    ov = overlay(slug, os.path.join(out, "video"))
    mp4 = os.path.join(out, "video", "turntable.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(frames, "f%04d.png"),
                    "-i", ov, "-filter_complex", "[0][1]overlay=0:0,format=yuv420p",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-movflags", "+faststart", mp4], check=True)
    Image.open(os.path.join(frames, "f0000.png")).convert("RGB").save(os.path.join(out, "video", "cover.jpg"), quality=92)
    shutil.rmtree(frames)
    return slug, os.path.getsize(mp4) // 1024

if __name__ == "__main__":
    slugs = sys.argv[1:] or list(CATALOG)
    with ThreadPoolExecutor(4) as ex:
        for slug, kb in ex.map(make, slugs): print(f"{slug}: {kb} KB")
