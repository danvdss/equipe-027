const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  assertPrivateSource,
  verifyBundle,
  assertPublicRepoIgnored,
  prepare,
} = require("./prepare-private-to.cjs");

function fixture(t, name = "projeto-to") {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "e027-ot-staging-"));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(folder, "package.json"),
    JSON.stringify({ name, scripts: { "build:embedded": "echo fixture" } }),
  );
  fs.mkdirSync(path.join(folder, "dist", "embedded"), { recursive: true });
  const output = path.join(folder, "dist", "embedded", "projeto-to-embedded.js");
  fs.writeFileSync(output, "export function mountProjetoTo() { return null; }");
  return { folder, output };
}

test("staging refuses the public repo itself as a private Projeto-TO source", () => {
  assert.throws(() => assertPrivateSource(__dirname), /deve ficar fora/);
  assert.throws(() => assertPrivateSource(path.join(__dirname, "subdir")), /deve ficar fora/);
});

test("staging rejects a different project or missing private source", (t) => {
  const wrong = fixture(t, "not-projeto-to");
  assert.throws(() => assertPrivateSource(wrong.folder), /não é um Projeto-TO/);
  assert.throws(() => assertPrivateSource(path.join(wrong.folder, "missing")), /não encontrado/);
});

test("private browser bundle must not ship Node globals, clinical endpoints, or backend references", (t) => {
  const { output } = fixture(t);
  assert.ok(verifyBundle(output) > 0);
  for (const malicious of [
    "process.env.NODE_ENV; function mountProjetoTo(){}",
    "const a='https://fake.supabase.co'; function mountProjetoTo(){}",
    "const b='/rest/v1'; function mountProjetoTo(){}",
    "const c='patient_drafts'; function mountProjetoTo(){}",
    "const d='clinical_notes'; function mountProjetoTo(){}",
  ]) {
    fs.writeFileSync(output, malicious);
    assert.throws(() => verifyBundle(output), /backend|navegador|clínico/i);
  }
  fs.writeFileSync(output, "export default function invalid(){}");
  assert.throws(() => verifyBundle(output), /mountProjetoTo/);
});

test("staging verifies ignored output and can validate without copying private files", (t) => {
  const { folder } = fixture(t);
  assert.doesNotThrow(() => assertPublicRepoIgnored());
  assert.doesNotThrow(() => prepare({ privateSource: folder, verifyOnly: true }));
});
