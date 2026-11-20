const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

function setup(t) {
  const dom = new JSDOM(fs.readFileSync("index.html", "utf8"), {
    url: "https://example.test/equipe-027/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function (v) {
    this.returnValue = v || "";
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.navigator.clipboard = {writeText: async () => {}};
  const files = [
    "care.js","workflow.js","notes.js","prenatal.js","implante.js",
    "diu.js","lab-details.js","shortcuts.js","renewal.js",
    "occupational-portal.js","app.js",
  ];
  for (const file of files)
    vm.runInContext(fs.readFileSync(file, "utf8"), dom.getInternalVMContext(), {filename: file});
  const run = (code) => vm.runInContext(code, dom.getInternalVMContext());
  t.after(() => w.close());
  run("logged=true;render()");
  return {w,run};
}
const wait = () => new Promise(resolve => setTimeout(resolve, 0));

test("shell keeps original home and opens Projeto-TO as first occupational view", (t) => {
  const {w,run} = setup(t);
  assert.ok(w.document.querySelector(".cards"), "Equipe-027 initial dashboard preserved");
  run("navigate('occupational')");
  assert.equal(w.document.querySelector("[data-ot-view='projeto']")?.getAttribute("aria-pressed"), "true");
  assert.ok(w.document.querySelector("#ot-embedded-root"), "React host exists");
  assert.equal(w.document.querySelector("#clinical"), null, "legacy editor is not duplicated");
  assert.equal(w.OccupationalPortal.currentView(), "projeto");
});

test("Evolução rápida remains available and preserves its current local form", (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  w.document.querySelector("[data-ot-view='rapida']").click();
  const form = w.document.querySelector("#clinical");
  assert.ok(form, "legacy occupational form restored");
  assert.ok(form.elements.otDemand, "original demand field");
  assert.ok(w.document.querySelector("#output"), "live editor preserved");
  form.elements.otDemand.value = "Intervenção sintética";
  w.document.querySelector("[data-ot-view='projeto']").click();
  assert.equal(w.document.querySelector("#clinical"), null);
  w.document.querySelector("[data-ot-view='rapida']").click();
  assert.equal(w.document.querySelector("#clinical").elements.otDemand.value, "Intervenção sintética");
});

test("returning to occupational tab reopens Projeto-TO home instead of legacy editor", (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  w.document.querySelector("[data-ot-view='rapida']").click();
  run("navigate('lab')");
  assert.ok(w.document.querySelector("#clinical"), "lab not broken by portal");
  run("navigate('occupational')");
  assert.equal(w.OccupationalPortal.currentView(), "projeto");
  assert.ok(w.document.querySelector("#ot-embedded-root"));
});

test("bundled private module is a fixed same-origin asset and not a remote arbitrary URL", (t) => {
  const {w} = setup(t);
  assert.equal(w.OccupationalPortal.modulePath, "./ot-embedded/projeto-to-embedded.js");
  assert.equal(
    w.OccupationalPortal.moduleUrl("https://example.test/equipe-027/"),
    "https://example.test/equipe-027/ot-embedded/projeto-to-embedded.js",
  );
  assert.match(fs.readFileSync(".gitignore", "utf8"), /ot-embedded\//);
  assert.match(fs.readFileSync("index.html", "utf8"), /occupational-portal\.js/);
});

test("embedded lifecycle detects a removed host and prevents stale re-mount", async (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  let resolveImport;
  const importer = () => new Promise(resolve => {resolveImport = resolve;});
  const mounting = w.OccupationalPortal.mount(importer);
  run("navigate('home')");
  resolveImport({mountProjetoTo: () => {throw new Error("must not mount stale view");}});
  assert.equal(await mounting, false);
  assert.equal(w.document.querySelector("#ot-embedded-root"), null);
});

test("failed private bundle only shows safe fallback, not a second login", async (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  const host = w.document.querySelector("#ot-embedded-root");
  await w.OccupationalPortal.mount(async () => { throw new Error("asset absent"); });
  assert.match(host.textContent, /Evolução rápida continua acessível/);
  assert.equal(host.querySelector("input[type=password]"), null);
});

test("cancelling an unsaved clinical form prevents changing the module", async (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  const host = w.document.querySelector("#ot-embedded-root");
  let forceCalled = false;
  await w.OccupationalPortal.mount(async () => ({
    mountProjetoTo(target) {
      const el = w.document.createElement("span"); el.textContent = "Home fictícia";
      target.replaceChildren(el);
      return {unmount(force) { forceCalled = force; return force === true; }};
    },
  }));
  run("navigate('lab')");
  assert.equal(w.document.querySelector("#ot-embedded-root"), host, "departure cancelled");
  assert.equal(w.OccupationalPortal.currentView(), "projeto");
  assert.equal(forceCalled, false);
  // Only final shell replacement forces disposal in logout/direct render.
  run("logged=false");
  // Don't invoke real auth/network; test controller contract directly.
  assert.equal(w.OccupationalPortal.leave(true), true);
  assert.equal(forceCalled, true);
});

test("mount forwards a checked shell identity and in-memory client to the private module", async (t) => {
  const {w,run} = setup(t);
  run("navigate('occupational')");
  const client = { supabaseUrl: "https://test-issuer.example" };
  const attestation = { userId: "synthetic-user", supabaseUrl: client.supabaseUrl };
  w.Access = {
    getEmbeddedClient: () => client,
    verifiedBridgeIdentity: async () => attestation,
  };
  let received;
  await w.OccupationalPortal.mount(async () => ({
    mountProjetoTo(target, options) {
      assert.equal(target.childNodes.length, 0, "React gets an empty mounting container");
      received = options;
      target.textContent = "Página inicial fictícia";
      return {unmount: () => true};
    },
  }));
  assert.equal(received.getShellClient(), client);
  assert.deepEqual(await received.verifyShellIdentity(), attestation);
  assert.match(w.document.querySelector("#ot-embedded-root").textContent, /Página inicial fictícia/);
});
