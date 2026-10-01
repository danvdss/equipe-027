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
test("one editor preserves manual text and copies without mandatory dialogs", async (t) => {
  const { w, run, set, answer } = setup(t);
  run("navigate('general')");set('complaint','Queixa inicial');run('LiveReview.update()');
  const out=w.document.querySelector('#output');out.value+=' Edição manual';out.dispatchEvent(new w.Event('input',{bubbles:true}));
  set('complaint','Queixa revisada');await run('Flow.copyCurrent()');
  assert.match(w.copied,/Edição manual/);assert.equal(w.document.querySelector('dialog'),null);
  const cancel=run('LiveReview.resume()');answer('Manter minha edição');await cancel;
  assert.match(out.value,/Edição manual/);
  const resume=run('LiveReview.resume()');answer('Retomar automático');await resume;
  assert.match(out.value,/Queixa revisada/);assert.doesNotMatch(out.value,/Edição manual/);
  assert.ok(run("history.some(h=>h.text.includes('Edição manual'))"));
  assert.equal(w.document.querySelectorAll('#output').length,1);
  assert.equal(w.document.querySelector('#live-preview').getAttribute('aria-hidden'),'true');
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
  assert.equal(await run("generate()"), true);
  assert.match(w.document.querySelector("#live-issues").textContent,/percentual/);
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
  assert.equal(await run("generate()"), true);
  assert.match(w.document.querySelector("#live-issues").textContent,/EPF/);
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
    "https://lagarto.mms.inf.br/sispec/login",
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

test("login fails closed without the authentication provider and includes server auth scripts", async t => {
  const {w,run}=setup(t);
  run("logged=false;login()");
  assert.equal(run('logged'),false);
  assert.match(w.document.querySelector('#app').textContent,/autenticação/);
  assert.ok(w.document.querySelector('script[src*="auth.js"]'));
  assert.ok(w.document.querySelector('script[src*="supabase.min.js"]'));
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
  assert.match(result,/solicitar renovação de receituário de medicamento: Clonazepam 0.5 mg/);
  assert.match(result,/MUC: Sinvastatina/);
  assert.doesNotMatch(result,/Após avaliação médica|aguardando avaliação médica|renovada a prescrição/);
  set('medicalRequested','Sim');set('medicalDone','Sim');
  w.document.querySelector('#renew-all').click();
  result=run("collect();compose(drafts.renewal,'renewal')");
  assert.match(result,/Após avaliação, médico renova Clonazepam/);
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

test('live preview updates while typing without generating history and escapes markup', async t => {
  const {w,run,set}=setup(t);run("navigate('general')");
  set('complaint','Dor relatada <img src=x onerror=alert(1)>');
  await new Promise(r=>setTimeout(r,240));
  assert.match(w.document.querySelector('#live-preview').textContent,/Dor relatada/);
  assert.match(w.document.querySelector('#output').value,/Dor relatada/);
  assert.equal(w.document.querySelector('#live-preview img'),null);
  assert.equal(run('history.length'),0);
  set('complaint','Queixa revisada');
  await run('Flow.copyCurrent()');
  assert.match(w.copied,/Queixa revisada/);
});
test('live conflicts remain selected until explicit correction without blocking copying', async t => {
  const {w,run,set}=setup(t);run("navigate('general')");
  const no=w.document.querySelector('input[value="Sem queixas no momento"]');no.click();
  set('complaint','Dor no braço');
  run('LiveReview.update()');
  assert.equal(no.checked,true);
  assert.match(w.document.querySelector('#live-issues').textContent,/desmarque/);
  assert.match(w.document.querySelector('#live-preview').textContent,/Sem queixas|Dor no braço/);
  await run('Flow.copyCurrent()');assert.match(w.copied,/Dor no braço/);
  [...w.document.querySelectorAll('#live-issues button')].find(b=>b.textContent==='Desmarcar “Sem queixas no momento”').click();
  assert.equal(no.checked,false);
  assert.equal(w.document.querySelectorAll('#live-issues .live-issue').length,0);
  assert.match(w.document.querySelector('#output').value,/Dor no braço/);
});
test('live partial renewal retains incomplete input and manual edits survive subsequent changes', t => {
  const {w,run,set}=setup(t);run("navigate('renewal')");
  set('req_1_name','Sinvastatina');set('req_1_dose','1');run('LiveReview.update()');
  assert.match(w.document.querySelector('#live-preview').textContent,/Sinvastatina/);
  assert.match(w.document.querySelector('#live-issues').textContent,/unidade/);
  set('req_1_doseUnit','comprimido(s)');run('LiveReview.update()');
  const out=w.document.querySelector('#output');out.value+=' Texto manual preservado.';out.dispatchEvent(new w.Event('input',{bubbles:true}));
  set('req_1_frequency','1 vez ao dia');run('LiveReview.update()');
  assert.match(out.value,/Texto manual preservado/);
  assert.equal(w.document.querySelector('#live-preview').textContent.trim(),out.value.trim());
  assert.equal(out.dataset.stale,'true');
});
test('live validation covers EPF contradiction and pending callbacks cannot cross modules', async t => {
  const {w,run,set}=setup(t);run("navigate('lab')");set('date','2026-09-27');
  set('epfStatus','Não encontrados na amostra examinada');set('epf_giardia','Cistos');run('LiveReview.update()');
  assert.match(w.document.querySelector('#live-issues').textContent,/EPF/);
  assert.ok(w.document.querySelectorAll('#live-preview .incoherent').length>=2);
  run("navigate('general')");set('complaint','Apenas geral');run("navigate('renewal')");
  await new Promise(r=>setTimeout(r,240));
  assert.doesNotMatch(w.document.querySelector('#live-preview').textContent,/Apenas geral|Giardia/);
});
test('manual text lexical conflicts are highlighted as possible, not diagnosed', t => {
  const {w,run,set}=setup(t);run("navigate('general')");set('complaint','Dor');run('LiveReview.update()');
  const out=w.document.querySelector('#output');out.value='Paciente sem queixas. Refere dor no braço.';out.dispatchEvent(new w.Event('input',{bubbles:true}));run('LiveReview.update()');
  assert.equal(w.document.querySelectorAll('#live-preview .incoherent').length,2);
  assert.match(w.document.querySelector('#live-issues').textContent,/Possível incoerência/);
});

test('free-text conflicts participate in live review without mistaking explicit negation', t => {
  const {w,run,set}=setup(t);run("navigate('general')");
  set('complaint','Dor no braço');set('observations','Sem queixas no momento');run('LiveReview.update()');
  assert.match(w.document.querySelector('#live-issues').textContent,/Possível incoerência/);
  assert.equal(run("LiveReview.analyzeText('Sem queixas. Não refere dor.').length"),0);
});

test('clearing the last clinical field also clears the automatic output', t => {
  const {w,run,set}=setup(t);run("navigate('general')");set('complaint','Queixa temporária');run('LiveReview.update()');
  assert.match(w.document.querySelector('#output').value,/Queixa temporária/);
  set('complaint','');run('LiveReview.update()');
  assert.equal(w.document.querySelector('#output').value,'');
  assert.doesNotMatch(w.document.querySelector('#live-preview').textContent,/Queixa temporária/);
});


test('renewal follows MUC and Conduta template with explicit use and physician team', t => {
  const {run}=setup(t);
  const d={req_1_name:'Medicamento A',req_1_useType:'Contínuo',muc_1_name:'Medicamento B',medicalRequested:'Sim',renewDoctorTeam:'Médico de outra equipe por ausência do médico da equipe','c:renewGuides':['Uso conforme prescrição médica']};
  const text=run('Renewal.compose('+JSON.stringify(d)+')');
  assert.match(text,/Paciente comparece à unidade para solicitar renovação de receituário de medicamento: Medicamento A \(de uso contínuo\)/);
  assert.match(text,/MUC: Medicamento B/);
  assert.match(text,/Conduta: Solicitada avaliação de médico de outra equipe devido à ausência do médico da equipe/);
  assert.match(text,/Realizadas orientações sobre uso conforme prescrição médica/);
  assert.doesNotMatch(text,/médico renova/);
});


test('renewal uses compact medicine notation without documentary labels', t => {
  const {run}=setup(t);
  assert.equal(run("Renewal.describe({name:'Sertralina',strength:'50',strengthUnit:'mg',dose:'1',doseUnit:'comprimido(s)',frequency:'À noite'})"),'Sertralina 50 mg, 1 cp à noite');
});

test('puericultura starts empty and generates only entered findings with live calculations',t=>{
 const {run,set,w}=setup(t);run("navigate('child')");run('LiveReview.update()');assert.equal(w.document.querySelector('#output').value,'');
 set('pcReason','Acompanhamento de rotina');set('pcBirth','2026-01-01');set('recordDate','2026-01-15');set('pcWeight','4');set('pcLength','50');set('pcFeedDifficulty','Relatada');set('pcFeeding','Aleitamento materno exclusivo');run('LiveReview.update()');
 const text=w.document.querySelector('#output').value;assert.match(text,/2 semanas/);assert.match(text,/16,00 kg\/m²/);assert.match(text,/Dificuldade alimentar: Relatada/);assert.doesNotMatch(text,/Dentro da normalidade|Não reagente|Exame físico:|gráficos: Realizado/);
 set('pcScreen6','Não reagente');set('pcGraph','Realizado neste atendimento');set('pcGuidance','Orientação registrada no teste');run('LiveReview.update()');assert.match(w.document.querySelector('#output').value,/Toxoplasmose IgM: Não reagente/);
 run("navigate('home');navigate('child')");assert.equal(w.document.querySelector('[name=pcWeight]').value,'4');
});
test('puericultura flags inconsistent dates and results without blocking copy',async t=>{
 const {run,set,w}=setup(t);run("navigate('child')");set('pcBirth','2026-01-01');set('recordDate','0200-01-02');set('pcHeelStatus','Não realizado');set('pcScreen0','Dentro da normalidade');run('LiveReview.update()');assert.match(w.document.querySelector('#live-issues').textContent,/ano informado/);assert.match(w.document.querySelector('#live-issues').textContent,/resultados preenchidos/);await run('Flow.copyCurrent()');assert.match(w.copied,/Fenilcetonúria/);
 assert.equal(run("ChildCare.bmi({pcWeight:'0',pcLength:'50'})"),'');assert.equal(run("ChildCare.age({pcBirth:'2026-01-01',recordDate:'2025-12-31'})"),'');
});

test('motor and primitive reflex entries are exclusive, optional and restored in live narrative',t=>{
 const {run,set,w}=setup(t);run("navigate('child')");
 assert.equal(w.document.querySelectorAll('[name^="pcMotor_"]:checked').length,0);
 const choose=(id,value)=>w.document.querySelector(`[name="pcMotor_${id}"][value="${value}"]`).click();
 choose('roll','Presente');choose('moro','Ausente');choose('galant','Não avaliado');
 set('pcMotorSource_roll','Relatado pelo responsável');set('pcMotorNote_moro','Avaliado bilateralmente');run('LiveReview.update()');
 let text=w.document.querySelector('#output').value;
 assert.match(text,/Marcos motores: Rola de prono para supino: Presente — relatado pelo responsável/);
 assert.match(text,/Reflexos primitivos: Moro: Ausente \(Avaliado bilateralmente\)/);
 assert.match(text,/Galant \/ encurvamento do tronco: Não avaliado/);
 assert.doesNotMatch(text,/Preensão palmar:|atraso|desaparecer até|normalidade/);
 choose('roll','Ausente');run('LiveReview.update()');
 assert.equal(w.document.querySelectorAll('[name="pcMotor_roll"]:checked').length,1);
 run("navigate('home');navigate('child')");assert.equal(w.document.querySelector('[name="pcMotor_roll"][value="Ausente"]').checked,true);
});
test('motor loss alert is nonblocking and never inserts a diagnosis',async t=>{
 const {run,set,w}=setup(t);run("navigate('child')");set('pcMotorLoss','Relatada / observada');set('pcMotorLossDetails','Deixou de realizar habilidade previamente relatada');run('LiveReview.update()');
 assert.match(w.document.querySelector('#live-issues').textContent,/requer avaliação profissional/);
 await run('Flow.copyCurrent()');assert.match(w.copied,/Perda de habilidade/);assert.doesNotMatch(w.copied,/diagnóstico|atraso confirmado/);
 assert.equal(run("ChildCare.compose({pcMotor_moro:'',pcMotor_roll:''})"),'');
});
