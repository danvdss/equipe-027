// Run from the revision to capture. Pass an output directory outside the application.
const { chromium } = require("playwright-core");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

async function capture(browser, width, height, destination) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  try {
    await page.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin !== "http://equipe.test") return route.abort();
      return route.fulfill({ path: path.join(process.cwd(), url.pathname.slice(1) || "index.html") });
    });
    const shot = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(destination, width + "-" + name + ".jpg"), quality: 85 });
    };
    await page.goto("http://equipe.test");
    await page.locator(".login-card").waitFor();
    await shot("login");
    await page.evaluate("logged=true;render()");
    assert.equal(await page.locator(".module-card").count(), 14);
    await shot("painel");
    await page.locator('.cards [data-nav="general"]').click();
    await page.locator("#clinical").waitFor();
    await shot("consulta");
    await page.locator(width < 900 ? "#mobile-review" : "#expand-editor").click();
    await page.locator("#output").fill("Registro fictício para conferência visual.");
    await shot("editor");
    await page.evaluate('navigate("occupational")');
    await page.waitForFunction(() => document.querySelector("#ot-embedded-root")?.firstElementChild &&
      !document.querySelector("#ot-embedded-root > p[role=status]"));
    await page.locator("#ot-embedded-root").scrollIntoViewIfNeeded();
    await shot("to");
    await page.evaluate('navigate("controlados")');
    await page.frameLocator("#controlados-frame").locator(".result-card").first().waitFor();
    await page.frameLocator("#controlados-frame").locator("#search").fill("clonazepam");
    await page.frameLocator("#controlados-frame").locator(".result-card").first().scrollIntoViewIfNeeded();
    await shot("catalogo");
    await page.goto("http://equipe.test/receituario.html");
    await page.locator(".rx-switch").first().waitFor({ state: "attached" });
    await page.emulateMedia({ media: "print" });
    assert.ok(await page.locator(".stage-shell").isVisible());
    assert.equal(await page.locator(".layout > .panel").isVisible(), false);
    await page.pdf({ path: path.join(destination, width + "-impressao.pdf"), format: "A4", preferCSSPageSize: true, printBackground: true });
  } finally {
    await page.close();
  }
}

async function main() {
  const destination = path.resolve(process.argv[2]);
  fs.mkdirSync(destination, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.E027_BROWSER });
  try {
    for (const [width, height] of [[1440, 900], [390, 844]]) await capture(browser, width, height, destination);
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
