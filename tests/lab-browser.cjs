const {chromium}=require("playwright-core");
const path=require("node:path");
const assert=require("node:assert/strict");
async function run(){
 const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
 try {
  for(const width of [1440,390,320]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
   await page.route("**/*",route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=="equipe.test")return route.abort();
    return route.fulfill({path:path.join(process.cwd(),url.pathname.slice(1)||"index.html")});
   });
   await page.goto("http://equipe.test");
   await page.evaluate("logged=true;navigate('lab')");
   const panel=page.locator("#e027-lab"),row=panel.locator('[data-key="Ferritina"]');
   const count=await page.locator('input[name^="lab:"]').count();
   assert.equal(await panel.locator(".e027-range").count(),count);
   const search=panel.locator('input[type=search]');
   await search.fill("ferritina");
   assert.equal(await panel.locator(".e027-range:visible").count(),1);
   await row.locator('[data-e027=result]').fill("12,5");
   assert.equal(await page.locator('[name="lab:Ferritina"]').inputValue(),"12,5");
   assert.equal(await row.locator(".e027-track").isVisible(),false);
   await panel.locator('[data-e027=units]').check();
   await row.locator('[data-e027=unit]').fill("u");
   await row.locator('[data-e027=range-low]').fill("8");
   await row.locator('[data-e027=range-high]').fill("12");
   await row.locator('[data-e027=confirmed]').check();
   assert.match(await row.locator(".e027-state").textContent(),/Acima da faixa/);
   await panel.locator(".lab-panel-filters select").first().selectOption("alerts");
   assert.equal(await row.isVisible(),true);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(process.env.E027_SCREENSHOTS){
    await row.scrollIntoViewIfNeeded();
    await row.screenshot({path:path.join(process.env.E027_SCREENSHOTS,"e027-exames-"+width+".png")});
   }
   await page.evaluate("navigate('general');navigate('lab')");
   await search.fill("ferritina");
   assert.equal(await row.locator('[data-e027=result]').inputValue(),"12,5");
   assert.equal(await row.locator(".e027-track").isVisible(),true);
   await page.locator('[name=labMode]').selectOption("solicitacao");
   assert.equal(await panel.isVisible(),false);
   console.log(width,count,"exames; pesquisa, filtros, gráfico, troca de módulo e modo aprovados");
   await page.close();
  }
 } finally {await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
