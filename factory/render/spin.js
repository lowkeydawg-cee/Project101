// node spin.js <glb under factory/> <outdir> <frames> [el] [startDeg] [zoom]
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary'};
const srv=http.createServer((q,s)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
 if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){s.writeHead(404);return s.end();}
 s.writeHead(200,{'Content-Type':T[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(s);});
(async()=>{const [glb,out,n,el='16',start='-35',zoom='1']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const pg=await b.newPage({viewport:{width:1080,height:1350}});
 await pg.goto(`http://127.0.0.1:${srv.address().port}/render/spin.html?g=/${glb}&el=${el}&zoom=${zoom}`);
 await pg.waitForFunction(()=>document.title==='ready'||document.title.startsWith('error'),null,{timeout:120000});
 if(await pg.title()!=='ready') throw new Error(await pg.title());
 for(let i=0;i<+n;i++){const d=+start+360*i/+n; await pg.evaluate(d=>window.frame(d),d);
  await pg.screenshot({path:path.join(out,`f${String(i).padStart(4,'0')}.png`)});}
 await b.close();srv.close();})().catch(e=>{console.error(e);process.exit(1)});
