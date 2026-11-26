const {chromium}=require("playwright-core");
const assert=require("node:assert/strict");
const path=require("node:path");
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
 try {
  const p=await browser.newPage({viewport:{width:1440,height:900}});
  const records=new Map();let current="login";
  await p.route("**/*",r=>{
   const u=new URL(r.request().url());
   const entry=u.hostname==="equipe.test"?u.pathname:"external:"+u.hostname;
   if(!records.has(current))records.set(current,new Set());
   records.get(current).add(entry);
   if(u.hostname!=="equipe.test")return r.abort();
   return r.fulfill({path:path.join(process.cwd(),u.pathname.slice(1)||"index.html")});
  });
  await p.goto("http://equipe.test");
  await p.evaluate("logged=true;render()");
  const ids=await p.locator(".main-nav [data-nav]").evaluateAll(es=>es.map(e=>e.dataset.nav));
  for(const id of ids){
   current=id;records.set(id,new Set());
   await p.evaluate(id=>navigate(id),id);
   if(id==="rx")await p.frameLocator("#rx-frame").locator(".rx-switch").waitFor({state:"attached"});
   if(id==="controlados")await p.frameLocator("#controlados-frame").locator(".result-card").first().waitFor();
   if(id==="occupational")await p.waitForFunction(()=>document.querySelector("#ot-embedded-root")?.firstElementChild && !document.querySelector("#ot-embedded-root > p[role=status]"));
   // Wait for the route-specific readiness above, not global network idle:
   // the embedded document and auth timers may keep network activity alive.
  }
  const has=(id,asset)=>records.get(id)?.has(asset);
  assert.ok(has("rx","/receituario.html"));
  assert.ok(has("controlados","/controlados-dados.json"));
  assert.ok(has("occupational","/ot-embedded/projeto-to-embedded.js"));
  for(const [id,assets] of records)console.log(id+": "+([...assets].sort().join(", ")||"no new requests"));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
