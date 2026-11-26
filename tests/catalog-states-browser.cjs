// Synthetic catalog requests in the normal workspace, without external services.
const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const { chromium } = require("playwright-core");

async function check(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const requests = [];
  const arrivals = Array.from({ length: 4 }, () => Promise.withResolvers());
  try {
    await page.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin !== "http://equipe.test") return route.abort();
      if (url.pathname === "/controlados-dados.json") {
        arrivals[requests.length]?.resolve(route);
        requests.push(route);
        return;
      }
      return route.fulfill({ path: path.join(process.cwd(), url.pathname.slice(1) || "index.html") });
    });
    await page.goto("http://equipe.test");
    await page.evaluate('logged=true;render();navigate("general")');
    if (width < 900) await page.locator("#mobile-review").click();
    const draft = "Texto fictício para testar a recuperação do catálogo.";
    await page.locator("#output").fill(draft);
    await page.evaluate('navigate("controlados")');
    const catalog = page.frameLocator("#controlados-frame");
    const results = catalog.locator("#results");
    const search = catalog.locator("#search");
    const type = catalog.locator("#typeFilter");
    const retry = catalog.locator("#retryCatalog");
    await type.selectOption("b");
    await search.fill("clonazepam");
    assert.equal(await results.getAttribute("aria-busy"), "true");
    assert.ok(await catalog.locator("#listFilter").isDisabled());

    for (const [index, outcome] of ["offline", "http", "invalid"].entries()) {
      const route = await arrivals[index].promise;
      assert.equal(requests.length, index + 1);
      if (outcome === "offline") await route.abort("internetdisconnected");
      if (outcome === "http") await route.fulfill({status: 503, body: ""});
      if (outcome === "invalid") await route.fulfill({json: {registros: [], total: 0}});
      await catalog.getByText("Não foi possível verificar o catálogo.").waitFor();
      assert.equal(await results.getAttribute("aria-busy"), "false");
      assert.equal(await results.locator(".result-card").count(), 0);
      assert.ok(await catalog.locator("#loadMore").isHidden());
      await retry.focus();
      await retry.press("Enter");
      await arrivals[index + 1].promise;
      await retry.press("Enter");
      assert.equal(await retry.getAttribute("aria-disabled"), "true");
    }

    assert.equal(requests.length, 4);
    await requests[3].fulfill({path: path.resolve("controlados-dados.json")});
    await results.locator(".result-card").first().waitFor();
    assert.equal(await search.inputValue(), "clonazepam");
    assert.equal(await type.inputValue(), "b");
    assert.ok(await search.evaluate(el => el === document.activeElement));
    assert.ok(await retry.isHidden());
    assert.ok(await catalog.locator("#listFilter").isEnabled());
    await search.fill("termo-ficticio-sem-correspondencia");
    await results.locator(".empty-state").waitFor();
    assert.match(await catalog.locator("#resultCount").innerText(), /^0 resultados/);
    await catalog.locator("#clearFilters").click();
    assert.equal(await results.locator(".result-card").count(), 24);
    await page.evaluate('navigate("general")');
    if (width < 900) await page.locator("#mobile-review").click();
    assert.equal(await page.locator("#output").inputValue(), draft);
    console.log(width + " px: carregamento, falhas, recuperação, filtros e rascunho OK");
  } finally {
    await page.close();
  }
}

test("recuperação do catálogo no atendimento", { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.E027_BROWSER });
  try {
    for (const width of [1440, 390, 320]) await check(browser, width);
  } finally {
    await browser.close();
  }
});
