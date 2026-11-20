const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright-core");

// Isolated HTTP fixtures exercise the bundled SDK. No request leaves the test.
async function run() {
  const browser = await chromium.launch({ executablePath: process.env.E027_BROWSER });
  try {
    for (const logoutStatus of [204, 503]) {
      const page = await browser.newPage();
      const user = { id: "ac9f4318-61e3-41c4-a733-157b496a074a", email: "teste@example.invalid",
        aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-01-01T00:00:00Z" };
      const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
      const jwt = [encode({ alg: "HS256", typ: "JWT" }),
        encode({ sub: user.id, aud: user.aud, exp: Math.floor(Date.now()/1000)+3600 }), "dGVzdGU"].join(".");
      const calls = [];
      await page.route("**/*", route => {
        const url = new URL(route.request().url());
        if (url.hostname === "equipe.test")
          return route.fulfill({ path: path.join(process.cwd(), url.pathname.slice(1) || "index.html") });
        if (url.hostname !== "lqmvzdibbmbkbexeywwo.supabase.co") return route.abort();
        const request = route.request();
        if (request.method() === "OPTIONS") return route.fulfill({status:204,headers:{
          "access-control-allow-origin":"*","access-control-allow-methods":"GET, POST, OPTIONS",
          "access-control-allow-headers": request.headers()["access-control-request-headers"] || "*"}});
        calls.push(request.method()+" "+url.pathname);
        if (url.pathname === "/functions/v1/username-login")
          return route.fulfill({json:{access_token:jwt,refresh_token:"refresh-de-teste"}});
        if (url.pathname === "/auth/v1/user") return route.fulfill({json:user});
        if (url.pathname === "/auth/v1/logout")
          return route.fulfill(logoutStatus === 204 ? {status:204} : {status:503,json:{message:"Indisponível"}});
        return route.abort();
      });
      async function enter() {
        await page.getByLabel("Usuário",{exact:true}).fill("usuario-ficticio");
        await page.getByLabel("Senha",{exact:true}).fill("senha-ficticia");
        await page.getByRole("button",{name:"Entrar",exact:true}).click();
        await page.locator('.card[data-nav="general"]').click();
      }
      await page.goto("http://equipe.test");
      await enter();
      const marker="TEXTO FICTÍCIO DA SESSÃO ANTERIOR";
      await page.locator("#output").fill(marker);
      await page.locator("#logout").click();
      await page.getByRole("button",{name:"Cancelar",exact:true}).click();
      assert.equal(await page.locator("#output").inputValue(),marker);
      await page.locator("#logout").click();
      await page.getByRole("button",{name:"Sair e apagar"}).click();
      await page.waitForFunction(() => document.querySelector("#login") && !document.querySelector("#error").textContent.includes("Encerrando"));
      if (logoutStatus === 503) assert.match(await page.locator("#error").innerText(), /feche esta aba/i);
      assert.ok(calls.includes("GET /auth/v1/user"));
      assert.ok(calls.includes("POST /auth/v1/logout"));
      assert.equal(await page.evaluate(m => [document.body.innerText,JSON.stringify(localStorage),JSON.stringify(sessionStorage)].some(s=>s.includes(m)),marker),false);
      if (logoutStatus === 503) await page.reload();
      await enter();
      assert.equal(await page.locator("#output").inputValue(),"");
      assert.equal(await page.getByRole("button",{name:"Desfazer edição"}).isDisabled(),true);
      await page.close();
      console.log("Saída HTTP",logoutStatus,"· cancelamento, limpeza e próxima sessão aprovados");
    }
  } finally { await browser.close(); }
}
run().catch(error=>{ console.error(error);process.exitCode=1; });
