const { chromium }=require("playwright-core");
const path=require("node:path");
const fs=require("node:fs/promises");
const assert=require("node:assert/strict");
async function run(){
 const browser=await chromium.launch({executablePath:process.env.E027_BROWSER});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:850}});
  await page.route("**/*",route=>{
    const u=new URL(route.request().url());
    return u.hostname==="equipe.test"?route.fulfill({path:path.join(process.cwd(),u.pathname.slice(1)||"index.html")}):route.abort();
  });
  await page.goto("http://equipe.test");await page.evaluate("logged=true;render()");
  await page.getByRole("button",{name:"Pesquisar módulos e funcionalidades"}).click();
  await page.locator("#module-search").fill("hipertenso");
  await page.locator('[data-module="has"]').click();
  const output=page.locator("#output");
  const text=Array.from({length:120},(_,i)=>"Linha "+(i+1)+" - registro fictício de teste.").join("\n");
  await output.fill(text);await output.press("Control+z");assert.notEqual(await output.inputValue(),text);
  await output.press("Control+Shift+z");assert.equal(await output.inputValue(),text);
  const models=page.getByRole("button",{name:"Modelos",exact:true});await models.click();
  const dialog=page.locator(".document-tools");await dialog.getByRole("button",{name:"Criar modelo"}).click();
  await dialog.getByLabel("Nome do modelo").fill("Retorno fictício");
  await dialog.locator("textarea").first().fill("Demanda\nObjetivo");
  await dialog.getByRole("button",{name:"Salvar modelo"}).click();
  await dialog.getByRole("button",{name:"Duplicar"}).click();
  assert.equal(await dialog.locator("select option").count(),3);
  await dialog.getByRole("button",{name:"Restaurar seções iniciais"}).click();
  await dialog.getByRole("button",{name:"Fechar"}).click();
  await page.getByRole("button",{name:"Imprimir / exportar"}).click();
  assert.equal(await dialog.locator("pre").textContent(),text);
  const download=page.waitForEvent("download");
  await dialog.getByRole("button",{name:"Baixar texto"}).click();
  assert.equal(await fs.readFile(await (await download).path(),"utf8"),text);
  await page.emulateMedia({media:"print"});assert.equal(await page.locator(".clinical-print").isVisible(),true);
  assert.equal(await page.locator("#app").isVisible(),false);
  await page.pdf({path:path.join(process.env.TEMP||"/tmp","e027-aceite-"+path.basename(process.env.E027_BROWSER)+".pdf"),preferCSSPageSize:true});
  console.log("Busca, desfazer/refazer, modelos, prévia, TXT e PDF multipágina executados em "+path.basename(process.env.E027_BROWSER));
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
