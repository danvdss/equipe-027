const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const path = require("node:path");

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.E027_BROWSER });
  const failures = [];
  try {
    for (const [width, height] of [[320,640],[360,800],[390,844],[768,1024],[640,320],[800,360],[844,390],[1024,768]]) {
      const page = await browser.newPage({ viewport: {width,height}, isMobile:true, hasTouch:true, reducedMotion:"reduce" });
      await page.route("**/*", route => {
        const url = new URL(route.request().url());
        if (url.hostname !== "equipe.test") return route.abort();
        return route.fulfill({path:path.join(process.cwd(),url.pathname.slice(1)||"index.html")});
      });
      await page.goto("http://equipe.test");
      async function layout(name, frame=page) {
        const result = await frame.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          if (document.documentElement.scrollWidth <= viewport+1) return "";
          return [...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().right>viewport+1)
            .slice(0,8).map(el=>el.tagName+"."+el.className).join(" ");
        });
        if (result) failures.push([width,name,result]);
      }
      await layout("login");
      await page.evaluate("logged=true;render()");
      const modules = await page.locator(".main-nav [data-nav]").evaluateAll(es=>es.map(e=>e.dataset.nav));
      for (const id of modules) {
        await page.evaluate(id=>navigate(id),id);
        await layout(id);
        if(id==="controlados"){
          const frame=page.frameLocator("#controlados-frame");
          await frame.locator(".result-card").first().waitFor();
          await layout("catalogo",page.frames().find(f=>f.url().includes("controlados.html")));
        }
        if(id==="rx"){
          const frame=page.frameLocator("#rx-frame");
          await frame.locator(".rx-switch").waitFor({state:"attached"});
          await layout("receituario",page.frames().find(f=>f.url().includes("receituario.html")));
        }
        await page.locator('.section-toggle[aria-expanded="false"]').evaluateAll(es=>es.forEach(e=>e.click()));
        await layout(id+" aberto");
      }
      await page.evaluate("navigate('general')");
      const nav=page.locator("#module-menu");
      await nav.tap();
      await page.locator("#module-search").fill("Exames");
      await page.locator('[data-module="lab"]').tap();
      const labMode=page.locator('[name="labMode"]');
      await labMode.selectOption("solicitacao");
      await page.locator('[name="labRequestedExams"]').fill("Exame fictício");
      const editorButton=page.locator(width < 900 ? "#mobile-review" : "#expand-editor");
      await editorButton.tap();
      const output=page.locator("#output");
      await output.fill("Rascunho de teste, editado à mão.");
      await layout("editor");
      if(width<900){
        async function keyboard(open){
          await page.evaluate(open=>{
            const vv=window.visualViewport;
            if(open){
              Object.defineProperty(vv,"height",{configurable:true,value:Math.max(160,window.innerHeight-250)});
            } else delete vv.height;
            vv.dispatchEvent(new Event("resize"));
          },open);
        }
        await keyboard(true);
        const visibleHeight=await page.evaluate(()=>window.visualViewport.height);
        const panel=await page.locator(".result").boundingBox();
        assert.ok(panel && panel.y>=-1 && panel.y+panel.height<=visibleHeight+1,"editor above keyboard");
        await keyboard(false);
      }
      await page.locator("#expand-editor").tap();
      if(width<900){
        await page.locator('[name="labRequestedExams"]').focus();
        await page.evaluate(()=>{
          Object.defineProperty(visualViewport,"height",{configurable:true,value:innerHeight-160});
          visualViewport.dispatchEvent(new Event("resize"));
        });
        const bar=await editorButton.boundingBox();
        assert.ok(bar && bar.y+bar.height<=height-160+1 && bar.height>=44,"actions above keyboard");
        await page.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event("resize"));});
      }
      await page.evaluate("navigate('controlados')");
      const catalog=page.frameLocator("#controlados-frame");
      await catalog.locator(".result-card").first().waitFor();
      await catalog.locator("#search").fill("clonazepam");
      await page.evaluate("navigate('lab')");
      assert.equal(await page.locator('[name="labRequestedExams"]').inputValue(),"Exame fictício");
      await editorButton.tap();
      assert.equal(await output.inputValue(),"Rascunho de teste, editado à mão.");
      await page.locator("#expand-editor").tap();
      await nav.tap();
      await page.locator('[data-module="general"]').tap();
      await nav.tap();
      await page.locator('[data-module="lab"]').tap();
      assert.equal(await page.locator('[name="labRequestedExams"]').inputValue(),"Exame fictício");
      await editorButton.tap();
      assert.equal(await output.inputValue(),"Rascunho de teste, editado à mão.");
      if(process.env.E027_SCREENSHOTS && [320,768].includes(width)) {
        await page.locator("#expand-editor").tap();
        await page.evaluate("navigate('home')");
        await page.screenshot({path:path.join(process.env.E027_SCREENSHOTS,"e027-dashboard-"+width+".png")});
      }
      console.log(width,height,"telas",modules.length,"ocorrências",failures.filter(x=>x[0]===width).slice(0,4));
      await page.close();
    }
  } finally { await browser.close(); }
  assert.deepEqual(failures,[]);
}
run().catch(error=>{console.error(error);process.exitCode=1});
