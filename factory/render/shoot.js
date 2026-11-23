// Render GLBs to PNGs in headless Chromium.  node shoot.js <jobs.json>
// jobs: [{ "glb": "<path under factory/>", "out": "<abs or factory-relative png>", "az":-30, "el":16, "zoom":1, "tx":0, "ty":0, "tz":0, "rake":0 }]
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');                       // factory/
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  for (const j of jobs) {
    const glb = '/' + path.relative(ROOT, path.resolve(ROOT, j.glb)).split(path.sep).join('/');
    const qs = new URLSearchParams({ g: glb, az: j.az || 0, el: j.el || 0, zoom: j.zoom || 1,
      tx: j.tx || 0, ty: j.ty || 0, tz: j.tz || 0, rake: j.rake ? 1 : 0 });
    await page.goto(`http://127.0.0.1:${port}/render/render.html?${qs}`);
    await page.waitForFunction(() => document.title === 'done' || document.title.startsWith('error'), null, { timeout: 120000 });
    const t = await page.title(); if (t !== 'done') throw new Error(`${j.glb}: ${t}`);
    await page.screenshot({ path: path.resolve(ROOT, j.out) });
    console.log('rendered', j.out);
  }
  await b.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
