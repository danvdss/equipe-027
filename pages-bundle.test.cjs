"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { verifyPublishedBundle, verifyBundle, assertPublicRepoIgnored } = require("./prepare-private-to.cjs");

test("the only distributed TO client bundle is verified against a pinned private commit", () => {
  assert.doesNotThrow(() => assertPublicRepoIgnored());
  const data = verifyPublishedBundle();
  assert.match(data.commit, /^[a-f0-9]{40}$/);
  const content = fs.readFileSync(path.join(__dirname, "ot-embedded", data.asset), "utf8");
  assert.ok(content.includes("Entrar na plataforma"), "Missing original landing");
  assert.ok(content.includes("dna-flow"), "Missing original golden helix animation");
  assert.ok(content.includes("mountProjetoTo"), "Missing integration mount");
});

test("a manifest must not allow tampered client JS to publish", (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "e027-pages-bundle-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const dir = path.join(base, "ot-embedded");
  fs.mkdirSync(dir);
  const js = Buffer.from("export function mountProjetoTo(){return null};");
  fs.writeFileSync(path.join(dir, "projeto-to-embedded.js"), js);
  const data = {
    source: "danvdss/projeto-to",
    commit: "a".repeat(40),
    asset: "projeto-to-embedded.js",
    bytes: js.length,
    sha256: createHash("sha256").update(js).digest("hex"),
  };
  fs.writeFileSync(path.join(dir, "bundle-manifest.json"), JSON.stringify(data));
  assert.equal(verifyPublishedBundle(base).sha256, data.sha256);
  fs.writeFileSync(path.join(dir, data.asset), Buffer.concat([js, Buffer.from(" //modified")]));
  assert.throws(() => verifyPublishedBundle(base), /divergente/);
  fs.writeFileSync(path.join(dir, data.asset), js);
  data.sha256 = "0".repeat(64);
  fs.writeFileSync(path.join(dir, "bundle-manifest.json"), JSON.stringify(data));
  assert.throws(() => verifyPublishedBundle(base), /Hash.*divergente/);
});

test("GitHub Pages workflow includes the bundle and the original E027 assets", () => {
  const workflow = fs.readFileSync(path.join(__dirname, ".github", "workflows", "quality.yml"), "utf8");
  assert.match(workflow, /npm run verify:to/);
  assert.match(workflow, /cp ot-embedded\/projeto-to-embedded\.js ot-embedded\/bundle-manifest\.json public\/ot-embedded\//);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.doesNotMatch(workflow, /PROJETO_TO_TOKEN|PRIVATE_KEY|service_role/i);
});
