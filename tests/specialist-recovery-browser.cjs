// Start with a synthetic session. All responses come from the local checkout.
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright-core");

async function check(browser, width) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  let toRequests = 0;
  let rxRequests = 0;
  let delayImport;
  const delayed = new Promise(resolve => { delayImport = resolve; });
  let releasePrescription;
  const pendingPrescription = new Promise(resolve => { releasePrescription = resolve; });
  try {
    await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== "equipe.test") return route.abort();
      if (url.pathname.endsWith("/projeto-to-embedded.js")) {
        toRequests++;
        if (toRequests === 1) return route.abort("internetdisconnected");
        if (toRequests === 2) { await delayed; return route.fulfill({status: 503, body: ""}); }
      }
      if (url.pathname.endsWith("/receituario.html")) {
        rxRequests++;
        if (rxRequests === 1) return route.abort("internetdisconnected");
        if (rxRequests === 2) return route.fulfill({status: 503, contentType: "text/html", body: "Serviço indisponível"});
        if (rxRequests === 4) await pendingPrescription;
      }
      if (url.pathname.endsWith("/rx-workflow.js") && rxRequests === 3)
        return route.abort("internetdisconnected");
      return route.fulfill({path: path.join(process.cwd(), url.pathname.slice(1) || "index.html")});
    });
    await page.goto("http://equipe.test");
    await page.evaluate('logged=true;render();navigate("occupational")');
    const project = page.locator("#ot-embedded-root");
    const retry = project.getByRole("button", {name: "Tentar novamente"});
    await retry.waitFor();
    if (process.argv[2] && width === 390)
      await project.screenshot({path: path.join(process.argv[2], "to-indisponivel.png")});
    const pending = page.waitForRequest(r => r.url().includes("projeto-to-embedded.js?") && r.url().includes("retry="));
    await retry.press("Enter");
    await pending;
    assert.equal(await project.getAttribute("aria-busy"), "true");
    await retry.press("Enter");
    await page.locator('[data-ot-view="rapida"]').click();
    const demandSection = page.locator("#clinical section").filter({has: page.locator('[name="otDemand"]')});
    const toggle = demandSection.locator('.section-toggle[aria-expanded="false"]');
    if (await toggle.count()) await toggle.click();
    await page.locator('[name="otDemand"]').fill("Demanda fictícia.");
    const failed = page.waitForResponse(r => r.url().includes("projeto-to-embedded.js") && r.status() === 503);
    delayImport();
    await failed;
    assert.equal(await project.count(), 0);
    await page.locator('[data-ot-view="projeto"]').click();
    await page.waitForFunction(() => {
      const host = document.querySelector("#ot-embedded-root");
      return host?.firstElementChild && !host.hasAttribute("aria-busy") && !host.querySelector(".ot-hub-unavailable");
    });
    assert.equal(toRequests, 3);
    await page.locator('[data-ot-view="rapida"]').click();
    assert.equal(await page.locator('[name="otDemand"]').inputValue(), "Demanda fictícia.");

    await page.evaluate('navigate("rx")');
    const rxHost = page.locator("#rx-host");
    const retryRx = rxHost.getByRole("button", {name: "Tentar novamente"});
    await retryRx.waitFor();
    if (process.argv[2] && width === 390)
      await rxHost.screenshot({path: path.join(process.argv[2], "receituario-indisponivel.png")});
    assert.ok(await page.locator("#rx-frame").isHidden());
    for (const expectedRequests of [2, 3]) {
      await retryRx.press("Enter");
      await page.waitForFunction(() => {
        const button = document.querySelector("#rx-host button");
        return button && !button.hidden && !button.hasAttribute("aria-disabled");
      });
      assert.equal(rxRequests, expectedRequests);
    }
    const successfulRequest = page.waitForRequest(r => r.url().includes("receituario.html"));
    await retryRx.press("Enter");
    await successfulRequest;
    await page.evaluate('navigate("general")');
    await page.locator("#workspace-main").focus();
    releasePrescription();
    await page.waitForFunction(() => document.querySelector("#rx-frame")?.contentDocument?.documentElement?.dataset.rxReady === "true");
    assert.ok(await rxHost.isHidden());
    assert.ok(await page.locator("#workspace-main").evaluate(el => el === document.activeElement));
    await page.evaluate('navigate("rx")');
    const name = page.frameLocator("#rx-frame").locator("#nome");
    await name.fill("Nome fictício");
    await page.evaluate('navigate("general");navigate("rx")');
    assert.equal(await name.inputValue(), "Nome fictício");
    assert.equal(rxRequests, 4);
    assert.ok(await retryRx.isHidden());
    assert.deepEqual(errors, []);
    console.log(width + " px: falhas de documento e script, recuperação, troca de modo e rascunhos OK");
  } finally {
    delayImport();
    releasePrescription();
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({executablePath: process.env.E027_BROWSER});
  try {
    for (const width of [320, 390, 1440]) await check(browser, width);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
