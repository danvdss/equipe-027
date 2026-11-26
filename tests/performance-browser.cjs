// Synthetic baseline; never use real credentials or clinical data.
const {chromium}=require('playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
 try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const p=await browser.newPage({viewport});
 let requests=new Map(),errors=[];
 p.on('pageerror',e=>errors.push(e.name));
 await p.addInitScript(()=>{window.__perf={long:[],lcp:0,cls:0};for(const type of ['longtask','largest-contentful-paint','layout-shift'])try{new PerformanceObserver(l=>{for(const e of l.getEntries()){if(type==='longtask')window.__perf.long.push(e.duration);if(type==='largest-contentful-paint')window.__perf.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)window.__perf.cls+=e.value;}}).observe({type,buffered:true});}catch{}});
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='equipe.test')return r.abort();const file=path.resolve('.','.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(process.cwd()+path.sep)||!fs.existsSync(file))return r.abort();const body=fs.readFileSync(file);requests.set(u.pathname,{raw:body.length,gzip:zlib.gzipSync(body).length});return r.fulfill({path:file});});
 const c=await p.context().newCDPSession(p);await c.send('Performance.enable');
 await p.coverage.startJSCoverage({resetOnNavigation:false});await p.coverage.startCSSCoverage({resetOnNavigation:false});
 await p.goto('http://equipe.test');await p.waitForTimeout(300);
 const metrics=async()=>{const m=Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));return {heapBytes:m.JSHeapUsedSize,nodes:m.Nodes,layoutCount:m.LayoutCount,taskMs:Math.round(m.TaskDuration*1000)};};
 const report={viewport,login:await p.evaluate(()=>window.__perf),loginAssets:[...requests.values()],routes:[]};
 await p.evaluate('logged=true;render()');
 for(const id of await p.locator('.main-nav [data-nav]').evaluateAll(es=>es.map(e=>e.dataset.nav))){
 const before=await metrics(), start=Date.now();requests=new Map();
 await p.evaluate(id=>navigate(id),id);
 if(id==='rx')await p.frameLocator('#rx-frame').locator('.rx-switch').waitFor({state:'attached'});
 if(id==='controlados')await p.frameLocator('#controlados-frame').locator('.result-card').first().waitFor();
 if(id==='occupational')await p.waitForFunction(()=>document.querySelector('#ot-embedded-root')?.firstElementChild&&!document.querySelector('#ot-embedded-root > p[role=status]'));
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const readyMs=Date.now()-start; await p.waitForTimeout(100);
 const after=await metrics(), sizes=[...requests.values()];
 report.routes.push({id,readyMs,raw:sizes.reduce((s,x)=>s+x.raw,0),estimatedGzip:sizes.reduce((s,x)=>s+x.gzip,0),heapBytes:after.heapBytes,nodes:after.nodes,layouts:after.layoutCount-before.layoutCount,taskMs:after.taskMs-before.taskMs});
 }
 const summarize=entries=>entries.filter(e=>e.url.startsWith('http://equipe.test')).map(e=>{const source=e.text||e.source||'';const ranges=e.ranges?.map(r=>({...r,count:1}))||e.functions?.flatMap(f=>f.ranges.map(r=>({start:r.startOffset,end:r.endOffset,count:r.count})))||[];const events=ranges.flatMap(r=>[{pos:r.start,r,add:true},{pos:r.end,r,add:false}]).sort((a,b)=>a.pos-b.pos);const active=new Set();let used=0,prev=0;for(const event of events){let inner;for(const r of active)if(!inner||r.end-r.start<inner.end-inner.start)inner=r;if(inner?.count>0)used+=event.pos-prev;prev=event.pos;if(event.add)active.add(event.r);else active.delete(event.r);}return {asset:new URL(e.url).pathname,sourceChars:source.length,observedRangeChars:used};});
 report.coverage={js:summarize(await p.coverage.stopJSCoverage()),css:summarize(await p.coverage.stopCSSCoverage())};report.observed=await p.evaluate(()=>window.__perf);report.errors=errors;
 assert.equal(errors.length,0);console.log(JSON.stringify(report));await p.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
