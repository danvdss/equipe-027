"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const modules = [
  "controlados", "general", "cervical", "child", "occupational", "renewal",
  "has", "dm", "both", "prenatal", "implante", "diu", "lab", "rx",
];

function setup(t) {
  const dom = new JSDOM(fs.readFileSync("index.html", "utf8"), {
    url: "https://danvdss.github.io/equipe-027/",
    runScripts: "outside-only",
  });
  const { window } = dom;
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  window.navigator.clipboard = { writeText: async () => {} };
  for (const file of [
    "care.js", "workflow.js", "notes.js", "prenatal.js", "implante.js",
    "diu.js", "lab-details.js", "shortcuts.js", "renewal.js", "app.js",
  ]) vm.runInContext(fs.readFileSync(file, "utf8"), dom.getInternalVMContext(), { filename: file });
  t.after(() => window.close());
  const run = (s) => vm.runInContext(s, dom.getInternalVMContext());
  run("logged=true;render()");
  return { window, run };
}

test("all 14 dashboard cards have individual representative icons and existing routes", (t) => {
  const { window } = setup(t);
  const cards = [...window.document.querySelectorAll(".cards .module-card")];
  assert.equal(cards.length, modules.length);
  assert.deepEqual(cards.map(c => c.dataset.nav), modules);
  cards.forEach((card, i) => {
    assert.equal(card.type, "button");
    assert.equal(card.style.getPropertyValue("--tile-order"), String(i));
    assert.equal(card.querySelector(".tile-index").textContent.trim(), String(i + 1).padStart(2, "0"));
    assert.equal(card.querySelectorAll(".icon svg").length, 1);
    assert.equal(card.querySelectorAll(".tile-art svg").length, 1);
    assert.ok(card.querySelector("strong")?.textContent.trim());
    assert.ok(card.querySelector("p")?.textContent.trim());
    assert.equal(card.querySelector(".icon").getAttribute("aria-hidden"), "true");
    assert.equal(card.querySelector(".tile-art").getAttribute("aria-hidden"), "true");
    assert.equal(card.querySelector(".arrow").getAttribute("aria-hidden"), "true");
  });
  const illustrations = cards.map(c => c.querySelector(".icon path").getAttribute("d"));
  assert.equal(new Set(illustrations).size, modules.length);
});

test("dashboard visual layer doesn't alter module navigation or temporary drafts", (t) => {
  const { window, run } = setup(t);
  const card = window.document.querySelector('.cards .module-card[data-nav="child"]');
  card.click();
  assert.equal(run("page"), "child");
  const input = window.document.querySelector('[name="pcWeight"]');
  assert.ok(input);
  input.value = "12";
  run("navigate('home')");
  assert.equal(run("page"), "home");
  window.document.querySelector('.cards .module-card[data-nav="child"]').click();
  assert.equal(run("page"), "child");
  assert.equal(window.document.querySelector('[name="pcWeight"]')?.value, "12");
  run("navigate('home')");
  window.document.querySelector('.cards .module-card[data-nav="occupational"]').click();
  assert.equal(run("page"), "occupational");
});

test("dashboard motion, focus and mobile styles are accessible and published", () => {
  const css = fs.readFileSync("dashboard-cards.css", "utf8");
  const html = fs.readFileSync("index.html", "utf8");
  const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /@keyframes module-symbol-float/);
  assert.match(css, /@keyframes module-reveal/);
  assert.match(html, /dashboard-cards\.css\?v=2026\.11\.22/);
  assert.match(workflow, /design\.css dashboard-cards\.css/);
});

test("homepage credits its creator without changing the history shortcut", (t) => {
  const { window } = setup(t);
  const credit = window.document.querySelector(".bottom-note .creator-credit");
  assert.equal(credit?.textContent.trim(), "Criado por danielvieiralsd@gmail.com");
  assert.equal(credit.querySelector("a")?.getAttribute("href"), "mailto:danielvieiralsd@gmail.com");
  assert.equal(window.document.querySelectorAll(".bottom-note button[data-nav=history]").length, 1);
});
