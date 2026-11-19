const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright-core");

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.E027_BROWSER });
  try {
    for (const width of [1440, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.route("**/*", route => {
        const url = new URL(route.request().url());
        return url.hostname === "equipe.test"
          ? route.fulfill({ path: path.join(process.cwd(), url.pathname.slice(1) || "index.html") })
          : route.abort();
      });
      await page.goto("http://equipe.test");
      await page.evaluate("logged=true;navigate('implante')");
      const decisionSection = page.locator("section.panel").filter({ has: page.locator('[name="decision"]') }).locator(".section-toggle").first();
      if (await decisionSection.getAttribute("aria-expanded") === "false") await decisionSection.press("Enter");
      await page.locator('[name="decision"]').selectOption("Prefere outro método");
      const text = page.locator("#output");
      await page.waitForFunction(() => /Prefere outro método/i.test(document.querySelector("#output").value));
      assert.doesNotMatch(await text.inputValue(), /solicita|agendada|assinado/i);
      await page.evaluate("navigate('diu')");
      const reasonSection = page.locator("section.panel").filter({ has: page.locator('[name="reason"]') }).locator(".section-toggle").first();
      if (await reasonSection.getAttribute("aria-expanded") === "false") await reasonSection.press("Enter");
      await page.locator('[name="reason"]').selectOption("Avaliação");
      await page.waitForFunction(() => /avaliação/i.test(document.querySelector("#output").value));
      assert.doesNotMatch(await text.inputValue(), /solicitação|inserção/i);
      await page.locator('[name="reason"]').selectOption("Solicitação");
      await page.waitForFunction(() => /solicitação/i.test(document.querySelector("#output").value));
      console.log(width, "px: finalidade registrada conforme a seleção");
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
