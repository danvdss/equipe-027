// Synthetic visual component regression; no clinical data or external requests.
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
try{for(const width of [1440,390,320]){
const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='equipe.test'?r.fulfill({path:path.join(process.cwd(),u.pathname.slice(1)||'index.html')}):r.abort();});
await page.goto('http://equipe.test');await page.evaluate('logged=true;render();navigate("general")');
if(width<900)await page.locator('#mobile-review').click();
const editor=page.locator('#output');await editor.fill('Registro fictício para teste visual.\nSegunda linha.');
const geometry=await page.evaluate(()=>{const a=document.querySelector('#output'),b=document.querySelector('#live-preview'),x=getComputedStyle(a),y=getComputedStyle(b);return {same:['fontFamily','fontSize','lineHeight','paddingTop','paddingLeft','borderTopWidth','boxSizing'].every(k=>x[k]===y[k]),widthDelta:Math.abs(a.getBoundingClientRect().width-b.getBoundingClientRect().width),heightDelta:Math.abs(a.getBoundingClientRect().height-b.getBoundingClientRect().height)}});
assert.ok(geometry.same&&geometry.widthDelta<1&&geometry.heightDelta<1,JSON.stringify(geometry));
await page.evaluate('navigate("controlados")');const catalog=page.frameLocator('#controlados-frame');await catalog.locator('.result-card').first().waitFor();await catalog.locator('#search').fill('clonazepam');assert.ok(await catalog.locator('.result-card').count()>0);await catalog.locator('#clearFilters').click();assert.equal(await catalog.locator('#search').inputValue(),'');
assert.ok(await catalog.locator('#clearFilters').evaluate(e=>e.getBoundingClientRect().height>=44));
assert.ok(await catalog.locator('.recipe-badge').first().textContent());
await page.evaluate('navigate("general")');if(width<900)await page.locator('#mobile-review').click();assert.equal(await page.locator('#output').inputValue(),'Registro fictício para teste visual.\nSegunda linha.');
await page.goto('http://equipe.test/receituario.html');await page.locator('.stage-shell').waitFor({state:'attached'});
await page.emulateMedia({media:'print'});assert.ok(await page.locator('.stage-shell').isVisible());assert.equal(await page.locator('.layout > .panel').isVisible(),false);
await page.close();console.log(width+'px: editor overlay, draft, catalogue controls and prescription print OK');
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
