const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");
const wait = () => new Promise((r) => setTimeout(r, 0));
function setup(t) {
  const dom = new JSDOM(fs.readFileSync("index.html", "utf8"), {
    url: "https://example.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function (v) {
    this.returnValue = v || "";
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.navigator.clipboard = {
    writeText: async (s) => {
      w.copied = s;
    },
  };
  for (const file of [
    "care.js",
    "workflow.js",
    "notes.js",
    "prenatal.js",
    "implante.js",
    "diu.js",
    "lab-details.js",
    "shortcuts.js",
    "renewal.js",
    "app.js",
  ])
    vm.runInContext(fs.readFileSync(file, "utf8"), dom.getInternalVMContext(), {
      filename: file,
    });
  t.after(() => w.close());
  const run = (s) => vm.runInContext(s, dom.getInternalVMContext());
  run("logged=true;render()");
  const set = (name, value) => {
    const el = w.document.querySelector(`[name="${name}"]`);
    assert.ok(el, "Field exists: " + name);
    el.value = value;
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
    el.dispatchEvent(new w.Event("change", { bubbles: true }));
    return el;
  };
  const answer = (text) => {
    const b = [...w.document.querySelectorAll("dialog button")].find(
      (b) => b.textContent === text,
    );
    assert.ok(b, "Dialog choice: " + text);
    b.click();
  };
  return { w, run, set, answer };
}
test("documentary validation rejects impossible input but accepts decimal comma", (t) => {
  const { run } = setup(t);
  for (const data of [
    { spo: "140" },
    { pain: "25" },
    { pa: "abc" },
    { returnStatus: "scheduled" },
    { followStatus: "Agendado" },
    { renewDone: "Sim" },
  ])
    assert.throws(() =>
      run(`Care.validate(${JSON.stringify(data)},'general')`),
    );
  assert.doesNotThrow(() =>
    run("Care.validate({spo:'98',temp:'36,5',pa:'120/80'},'general')"),
  );
  assert.equal(run("Care.labValue('5.6 %','%')"), "5.6%");
  assert.equal(run("Care.labValue('Não reagente','%')"), "Não reagente");
});
test("all modules mount and module drafts survive navigation", (t) => {
  const { w, run, set } = setup(t);
  for (const p of [
    "general",
    "has",
    "dm",
    "both",
    "prenatal",
    "implante",
    "diu",
    "lab",
    "rx",
    "history",
  ]) {
    assert.doesNotThrow(() => run(`navigate('${p}')`));
    assert.ok(w.document.querySelector("#workspace-main"));
  }
  run("navigate('general')");
  set("complaint", "Queixa de teste");
  run("navigate('diu');navigate('general')");
  assert.equal(
    w.document.querySelector("[name=complaint]").value,
    "Queixa de teste",
  );
});
test("stale copy requires explicit decision and manual text is preserved on cancel", async (t) => {
  const { w, run, set, answer } = setup(t);
  run("navigate('general')");
  set("complaint", "Queixa inicial");
  assert.equal(await run("generate()"), true);
  const out = w.document.querySelector("#output");
  out.value += "\nEdição manual";
  out.dispatchEvent(new w.Event("input", { bubbles: true }));
  set("complaint", "Queixa revisada");
  assert.equal(out.dataset.stale, "true");
  const p = run("Flow.copyCurrent()");
  answer("Cancelar");
  await p;
  assert.equal(w.copied, undefined);
  const g = run("generate()");
  answer("Manter texto atual");
  assert.equal(await g, false);
  assert.match(out.value, /Edição manual/);
  const g2 = run("generate()");
  answer("Substituir pelo novo texto");
  assert.equal(await g2, true);
  assert.match(out.value, /Queixa revisada/);
  assert.doesNotMatch(out.value, /Edição manual/);
});
test("clear can be undone; new encounter clears all modules and history", async (t) => {
  const { w, run, set, answer } = setup(t);
  run("navigate('general')");
  set("complaint", "Rascunho");
  await run("generate()");
  const p = run("Flow.clear()");
  answer("Limpar módulo");
  await p;
  assert.equal(w.document.querySelector("[name=complaint]").value, "");
  w.document.querySelector("#undo-clear").click();
  await wait();
  assert.equal(w.document.querySelector("[name=complaint]").value, "Rascunho");
  const e = run("Flow.end(false)");
  answer("Iniciar novo atendimento");
  await e;
  assert.equal(run("history.length"), 0);
  assert.equal(run("Object.keys(drafts).length"), 0);
  assert.equal(run("page"), "home");
});
test("lab removal marks generated output stale and percentages are not duplicated", async (t) => {
  const { w, run, set } = setup(t);
  run("navigate('lab')");
  set("date", "2026-09-24");
  w.document.querySelector("#addLab").click();
  set("extraName:0", "Teste");
  set("extraValue:0", "3%");
  set("extraUnit:0", "%");
  assert.equal(await run("generate()"), true);
  assert.doesNotMatch(w.document.querySelector("#output").value, /%\s*%/);
  w.document.querySelector(".lab-row button").click();
  assert.equal(w.document.querySelector("#output").dataset.stale, "true");
});
test("DIU does not presume negatives or consent and rejects contradictory procedure", (t) => {
  const { w, run, set } = setup(t);
  run("navigate('diu')");
  assert.equal(w.document.querySelector("[name=consent]").value, "");
  assert.equal(w.document.querySelector("[name=pregnancyTest]").value, "");
  set("mode", "Inserção");
  set("outcome", "Inserção concluída");
  assert.throws(() =>
    run(
      "compose({mode:'Inserção',outcome:'Inserção concluída',plan:'Inserção adiada'},'diu')",
    ),
  );
  const n = run(
    "Care.warnings({mode:'Inserção',outcome:'Inserção concluída'},'diu').length",
  );
  assert.ok(n >= 7);
});
test("validation focuses field, section search and mobile view switch work", async (t) => {
  const { w, run, set } = setup(t);
  run("navigate('general')");
  set("spo", "140");
  assert.equal(await run("generate()"), false);
  assert.equal(
    w.document.querySelector("[name=spo]").getAttribute("aria-invalid"),
    "true",
  );
  const search = w.document.querySelector("#form-search");
  search.value = "queixa";
  search.dispatchEvent(new w.Event("input"));
  assert.ok(w.document.querySelector(".search-match"));
  w.document.querySelector("#view-text").click();
  assert.equal(w.document.querySelector(".workspace").dataset.view, "text");
});
test("exclusive clinical states cannot both be selected", (t) => {
  const { w, run } = setup(t);
  run("navigate('general')");
  const a = w.document.querySelector('input[value="Bom estado geral"]'),
    b = w.document.querySelector('input[value="Regular estado geral"]');
  a.click();
  b.click();
  assert.equal(a.checked, false);
  assert.equal(b.checked, true);
});
function rxSetup(t) {
  const dom = new JSDOM(fs.readFileSync("receituario.html", "utf8"), {
    url: "https://example.test/receituario.html",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function (v) {
    this.returnValue = v;
    this.dispatchEvent(new w.Event("close"));
  };
  for (const script of w.document.querySelectorAll("script:not([src])"))
    vm.runInContext(script.textContent, dom.getInternalVMContext());
  vm.runInContext(
    fs.readFileSync("rx-workflow.js", "utf8"),
    dom.getInternalVMContext(),
  );
  t.after(() => w.close());
  return { w, run: (s) => vm.runInContext(s, dom.getInternalVMContext()) };
}
test("prescription calibration export excludes patient data and validates imports atomically", (t) => {
  const { w, run } = rxSetup(t);
  w.document.getElementById("nome").value = "PACIENTE SINTÉTICO";
  w.document.getElementById("f_medicamento1_nome").value = "MEDICAMENTO TESTE";
  const raw = run("RxFlow.calibration()");
  assert.doesNotMatch(JSON.stringify(raw), /PACIENTE|MEDICAMENTO TESTE/);
  assert.doesNotThrow(() =>
    run("RxFlow.applyCalibration(RxFlow.calibration())"),
  );
  assert.throws(() =>
    run(
      "let bad=RxFlow.calibration();bad.fields.nome.left.x=999;RxFlow.applyCalibration(bad)",
    ),
  );
  assert.equal(run("fields.nome.left.x"), 8.4);
  assert.equal(
    w.document.querySelector("[data-rx-view=preview]").textContent,
    "Pré-visualizar",
  );
});
test("prescription clearing is confirmed and undo restores both copies", async (t) => {
  const { w, run } = rxSetup(t);
  w.document.getElementById("nome").value = "Pessoa teste";
  run("fillFromInputs()");
  const p = run("RxFlow.clear()");
  [...w.document.querySelectorAll("dialog button")]
    .find((b) => b.textContent === "Limpar")
    .click();
  await p;
  assert.equal(w.document.getElementById("nome").value, "");
  w.document.getElementById("rx-undo").click();
  await wait();
  assert.equal(w.document.getElementById("nome").value, "Pessoa teste");
  assert.equal(
    run('overlays.nome.right.querySelector(".txt").textContent'),
    "Pessoa teste",
  );
});
test("EPF and EAS start blank, preserve findings and reject conflicting results", async (t) => {
  const { w, run, set } = setup(t);
  run("navigate('lab')");
  set("date", "2026-09-24");
  assert.equal(w.document.querySelector("[name=epfStatus]").value, "");
  assert.equal(w.document.querySelector("[name=urine_nitrite]").value, "");
  set("epf_giardia", "Cistos");
  set("epf_histolytica", "Cistos e trofozoítos");
  set("urine_leukocytes", "5–10/campo");
  set("urine_nitrite", "Negativo");
  assert.equal(await run("generate()"), true);
  const out = w.document.querySelector("#output").value;
  assert.match(out, /Giardia duodenalis \(G. lamblia\): Cistos/);
  assert.match(out, /Entamoeba histolytica\/dispar/);
  assert.match(out, /Leucócitos \/ piócitos: 5–10\/campo/);
  assert.match(out, /Nitrito: Negativo/);
  assert.doesNotMatch(
    out,
    /Proteínas:|Hemácias:|diagnóstico|infecção urinária/i,
  );
  set("epfStatus", "Não encontrados na amostra examinada");
  assert.equal(await run("generate()"), false);
  assert.equal(
    w.document.querySelector("[name=epfStatus]").getAttribute("aria-invalid"),
    "true",
  );
});
test("EPF and EAS use separate dates and survive navigating away", async (t) => {
  const { w, run, set } = setup(t);
  run("navigate('lab')");
  set("date", "2026-09-24");
  set("epfDate", "2026-09-23");
  set("epfStatus", "Não encontrados na amostra examinada");
  set("urineDate", "2026-09-22");
  set("urine_rbc", "10.000/mL");
  run("navigate('general');navigate('lab')");
  assert.equal(w.document.querySelector("[name=urine_rbc]").value, "10.000/mL");
  assert.equal(await run("generate()"), true);
  const out = w.document.querySelector("#output").value;
  assert.match(out, /EPF \(coleta 23\/09\/2026\)/);
  assert.match(out, /EAS \(coleta 22\/09\/2026\)/);
  assert.doesNotMatch(out, /Giardia/);
});
test("team shortcuts use the four supplied URLs and safe new tabs", (t) => {
  const { w } = setup(t);
  const expected = [
    "https://lagarto-vigilancia.mms.inf.br/portal_servicos/",
    "https://drive.google.com/drive/u/0/mobile/my-drive?hl=pt-br&pli=1",
    "http://departamentos.cardiol.br/sbc-da/2015/calculadoraer2017/etapa1.html",
    "https://sbn.org.br/medicos/utilidades/calculadoras-nefrologicas/ckd-epi-2021/",
  ];
  const links = [...w.document.querySelectorAll(".shortcut-card")];
  assert.equal(links.length, 4);
  links.forEach((link, i) => {
    assert.equal(link.href, expected[i]);
    assert.equal(link.target, "_blank");
    assert.match(link.rel, /noopener/);
    assert.ok(link.querySelector("svg"));
  });
});

test("shared login accepts the requested credentials, rejects others, and clears on logout", async t => {
  const {w,run}=setup(t);
  run("logged=false;login()");
  const submit=()=>w.document.querySelector('#login').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  w.document.querySelector('[name=login]').value='equipe27';
  w.document.querySelector('[name=password]').value='wrong';submit();
  assert.equal(run('logged'),false);
  w.document.querySelector('[name=password]').value='e27';submit();
  assert.equal(run('logged'),true);
  await run('Flow.end(true)');
  assert.equal(run('logged'),false);
  assert.ok(w.document.querySelector('#login'));
  assert.doesNotMatch(w.document.querySelector('#login').textContent,/equipe27|e27/);
  assert.equal(w.document.querySelector('script[src*="auth.js"]'),null);
  assert.equal(w.document.querySelector('script[src*="supabase.min.js"]'),null);
});

test('renewal keeps request, MUC and medical decision separate without defaults', t => {
  const {run,w,set}=setup(t);
  run("navigate('renewal')");
  assert.equal(w.document.querySelector('[name=medicalDone]').value,'');
  w.document.querySelector('[data-med-add=req][data-drug="Clonazepam"]').click();
  set('req_1_strength','0.5');set('req_1_strengthUnit','mg');
  set('req_1_dose','1');set('req_1_doseUnit','comprimido(s)');set('req_1_frequency','1 vez ao dia');
  w.document.querySelector('[data-med-add=muc][data-drug="Sinvastatina"]').click();
  run("collect();navigate('general');navigate('renewal')");
  assert.equal(w.document.querySelector('[name=req_1_strength]').value,'0.5');
  assert.equal(w.document.querySelector('[name=muc_1_name]').value,'Sinvastatina');
  let result=run("collect();compose(drafts.renewal,'renewal')");
  assert.match(result,/solicitar renovação de Clonazepam, concentração\/apresentação 0.5 mg/);
  assert.match(result,/MUC \(medicamentos em uso\): Sinvastatina/);
  assert.doesNotMatch(result,/Após avaliação médica|aguardando avaliação médica|renovada a prescrição/);
  set('medicalRequested','Sim');set('medicalDone','Sim');
  w.document.querySelector('#renew-all').click();
  result=run("collect();compose(drafts.renewal,'renewal')");
  assert.match(result,/Após avaliação médica, renovada a prescrição de Clonazepam/);
  assert.doesNotMatch(result,/renovada a prescrição de Sinvastatina/);
});
test('renewal rejects unsupported decisions, missing dose units and unspecified insulin', t => {
  const {run}=setup(t);
  const call=d=>run(`compose(${JSON.stringify(d)},'renewal')`);
  for(const d of [
    {req_1_name:'Insulina'},
    {req_1_name:'Teste',req_1_dose:'2'},
    {req_1_name:'Teste',req_1_result:'Renovado sem alteração'},
    {req_1_name:'Teste',medicalRequested:'Sim',medicalDone:'Sim',req_1_result:'Renovado com alteração'},
    {req_1_name:'Teste',prescriptionDate:'2026-09-24'}
  ])assert.throws(()=>call(d));
  assert.match(call({req_1_name:'Teste',medicalRequested:'Sim',medicalDone:'Sim',req_1_result:'Renovado com alteração',req_1_newRegimen:'Esquema transcrito da receita'}),/com alteração: Esquema transcrito da receita/);
});
test('metadata preserves decimal medication values and missing evaluation stays unspecified', t => {
  const {run}=setup(t);
  assert.equal(run("Care.renewalText({medicalRequested:'Sim'})"),'Solicitada avaliação médica.');
  const text=run("Care.decorate('Paciente, 25 anos, comparece à unidade para avaliação. Dose 0.5 mg.',{recordSetting:'No domicílio',recordDate:'2026-09-24'},'implante')");
  assert.match(text,/Paciente, 25 anos, recebe atendimento no domicílio/);
  assert.match(text,/0.5 mg/);
  assert.match(text,/Atendimento em 24\/09\/2026/);
});
