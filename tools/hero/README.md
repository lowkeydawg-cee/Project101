# The hero clip

The homepage hero is a Three.js scene rendered to frames and encoded as a
video. It is not filmed and not AI generated, which is why it holds to
exactly three colours: black `#0B0B0A`, soft white `#F2F1EB` and `#A4A29B`.

`scene.html` is the whole scene. It exposes three things on `window`:

- `renderFrame(p)` draws the scene at scroll position `p`, from 0 to 1
- `setSize(w, h, portrait)` resizes and switches to the portrait camera
- `ready` turns true once Three.js has loaded

## Rebuilding it

```bash
# 1. serve this folder together with Three.js
cp node_modules/three/build/*.js tools/hero/
cd tools/hero && python3 -m http.server 8911

# 2. render 150 frames with the script below, then encode:
ffmpeg -y -framerate 25 -i frames/f%04d.png \
  -c:v libx264 -preset veryslow -crf 26 \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart ../../public/hero-build.mp4
```

`-g 1 -keyint_min 1` makes every frame a keyframe. That is what lets the
browser jump to any moment instantly while you scroll. Drop it and the hero
stutters.

The frame renderer is a short Playwright script: open
`http://127.0.0.1:8911/scene.html`, wait for `window.ready`, then loop
`renderFrame(i / 149)` and screenshot the canvas each time.

For the phone poster, call `setSize(900, 1200, true)` then `renderFrame(1)`
and save that single frame as `public/hero-poster-mobile.jpg`. The wide
poster is the last frame of the sequence.
