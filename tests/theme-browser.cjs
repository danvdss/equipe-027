const {chromium} = require("playwright-core");
const assert = require("node:assert/strict");
const path = require("node:path");

async function checkGradient(page, selector) {
  const box = page.locator(selector);
  await box.scrollIntoViewIfNeeded();
  const foreground = await box.screenshot();
  const samples = await box.evaluate(root => {
    const bounds = root.getBoundingClientRect();
    const nodes = [root, ...root.querySelectorAll("*")];
    return nodes.filter(el => !el.closest("[aria-hidden=true]") && el.checkVisibility())
      .flatMap(el => [...el.childNodes].filter(t => t.nodeType === 3 && t.textContent.trim()).flatMap(t => {
        const range = document.createRange();
        range.selectNodeContents(t);
        const css = getComputedStyle(el);
        return [...range.getClientRects()].map(r => ({
          x:r.left-bounds.left, y:r.top-bounds.top, w:r.width,h:r.height,
          color:css.color.match(/[\d.]+/g).slice(0,3).map(Number),
          minimum:parseFloat(css.fontSize)>=24 || (parseFloat(css.fontSize)>=18.67 && Number(css.fontWeight)>=700) ? 3 : 4.5
        }));
      }));
  });
  const shot = await box.screenshot({style:selector+", "+selector+" * {-webkit-text-fill-color:transparent!important;text-shadow:none!important;}"});
  return page.evaluate(async ({data,ink,samples})=>{
    const img=new Image();img.src="data:image/png;base64,"+data;await img.decode();
    const cv=document.createElement("canvas");cv.width=img.width;cv.height=img.height;
    const ctx=cv.getContext("2d");ctx.drawImage(img,0,0);
    const pixels=ctx.getImageData(0,0,cv.width,cv.height).data;
    const original=new Image();original.src="data:image/png;base64,"+ink;await original.decode();
    ctx.drawImage(original,0,0);const painted=ctx.getImageData(0,0,cv.width,cv.height).data;
    const linear=Array.from({length:256},(_,i)=>i/255<=.04045?i/255/12.92:((i/255+.055)/1.055)**2.4);
    function lum(r,g,b){return .2126*linear[r]+.7152*linear[g]+.0722*linear[b]}
    let lowest=Infinity, failed=0;
    for(const s of samples){
      const fg=lum(...s.color);
      for(let y=Math.max(0,Math.ceil(s.y));y<Math.min(cv.height,s.y+s.h);y++)
        for(let x=Math.max(0,Math.ceil(s.x));x<Math.min(cv.width,s.x+s.w);x++){
          const i=4*(y*cv.width+x), bg=lum(pixels[i],pixels[i+1],pixels[i+2]);
          if(Math.max(...[0,1,2].map(k=>Math.abs(painted[i+k]-pixels[i+k])))<8)continue;
          const ratio=(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
          lowest=Math.min(lowest,ratio);if(ratio<s.minimum)failed++;
        }
    }
    return {lowest,failed};
  },{data:shot.toString("base64"),samples,ink:foreground.toString("base64")});
}
async function run() {
  const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
  try {
    for(const width of [1440,390]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
      await page.route("**/*", r=>{
        const u=new URL(r.request().url());
        if(u.hostname!=="equipe.test")return r.abort();
        return r.fulfill({path:path.join(process.cwd(),u.pathname.slice(1)||"index.html")});
      });
      await page.goto("http://equipe.test");
      await page.evaluate("logged=true;render()");
      let count=0,lowest=Infinity,failures=0;
      const ids=await page.locator(".cards button[data-nav]").evaluateAll(es=>es.map(e=>e.dataset.nav));
      for(const sel of [".intro",".mark",...ids.map(id=>'.cards [data-nav="'+id+'"]')]){
        const r=await checkGradient(page,sel);lowest=Math.min(lowest,r.lowest);
        if(r.failed){console.log("contrast",width,sel,r);failures++}
      }
      assert.ok(Number.isFinite(lowest));
      const menu=page.locator(width===390?"#module-menu":".module-search-button");
      await menu.focus();await page.keyboard.press("Enter");
      assert.equal(await page.locator("#module-search").evaluate(e=>e===document.activeElement),true);
      await page.keyboard.press("Escape");
      assert.equal(await menu.evaluate(e=>e===document.activeElement),true);
      for(const id of ids.filter(x=>x!=="rx")){
        await menu.focus();await page.keyboard.press("Enter");
        await page.locator('[data-module="'+id+'"]').press("Enter");
        assert.equal(await page.evaluate(()=>document.activeElement.id),"workspace-main");
        const heading=await checkGradient(page,".heading");if(heading.failed)failures++;
        lowest=Math.min(lowest,heading.lowest);
        for(const b of await page.locator(".section-toggle:visible").all()){
          const expanded=await b.getAttribute("aria-expanded")==="true";
          if(expanded)await b.press("Space");
          await b.press("Enter");
          const target=await b.getAttribute("aria-controls");
          assert.equal(await b.getAttribute("aria-expanded"),"true",id+" "+target);
          assert.equal(await page.locator("#"+target).evaluate(e=>e.hidden),false,id+" "+target);
          await page.keyboard.press("Tab");
          assert.ok(await page.evaluate(()=>document.activeElement.matches(":focus-visible") && getComputedStyle(document.activeElement).outlineStyle!=="none"));
          count++;
        }
        const editorButton = page.locator(width < 900 ? "#mobile-review" : "#expand-editor");
        await editorButton.press("Enter");
        assert.equal(await page.evaluate(()=>document.activeElement.id),"output");
        await page.keyboard.press("Escape");
        assert.equal(await editorButton.evaluate(b=>b===document.activeElement),true);
        if(id==="general"){
          const action=page.locator('input[name="c:actions"][value="Medicação administrada"]');
          await action.press("Space");
          assert.equal(await page.locator("#admin-fields").isVisible(),true);
          await action.press("Space");
          assert.equal(await page.locator("#admin-fields").isVisible(),false);
          const follow=page.locator('[name="followStatus"]');
          await follow.press("End");
          assert.equal(await page.locator('[name="followDate"]').isEnabled(),true);
          await follow.press("Home");
          assert.equal(await page.locator('[name="followDate"]').isEnabled(),false);
        }
        if(id==="lab"){
          const mode=page.locator('[name=labMode]');await mode.focus();await mode.press("End");
          assert.equal(await page.locator("#lab-request-fields").isVisible(),true);
          assert.equal(await page.locator("#lab-evaluation-fields").isVisible(),false);
          await mode.press("Home");await mode.press("ArrowDown");assert.equal(await page.locator("#lab-evaluation-fields").isVisible(),true);
        }
      }
      console.log({width,sections:count,lowest,failures});assert.equal(failures,0);
      await page.close();
    }
  } finally {await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
