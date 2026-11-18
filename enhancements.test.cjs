const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync(require("node:path").join(__dirname,"enhancements.js"),"utf8");
function engine(){
 const context={window:{addEventListener(){}},document:{readyState:"loading",addEventListener(){}},console};
 vm.runInNewContext(source,context);
 return context.window.Equipe027LabCheck;
}
test("lab limits: low, within, high and nonnumeric",()=>{
 const {assess}=engine();
 assert.equal(assess("3,4","3,5","5,0"),"low");
 assert.equal(assess("4,2","3,5","5,0"),"within");
 assert.equal(assess("5,1","3,5","5,0"),"high");
 assert.equal(assess("indetectavel","3,5","5,0"),"unverified");
});
test("invalid reference intervals never classify as normal",()=>{
 const {assess}=engine();
 assert.equal(assess("4","5","3"),"unverified");
 assert.equal(assess("4","","5"),"unverified");
});
test("references identify units and sources",()=>{
 const {definitions}=engine();
 for(const key of ["Glic","HbA1c","Na","K"]){
  assert.ok(definitions[key].unit);
  assert.ok(definitions[key].url.startsWith("https://"));
 }
});

test("HAS, DM and renal reference groups provide external sources",()=>{
 const {clinicalSources}=engine();
 for(const key of ["has","dm","renal"]){
  assert.ok(clinicalSources[key].items.length>=2);
  for(const [label,url] of clinicalSources[key].items){assert.ok(label);assert.ok(url.startsWith("https://"))}
 }
});

test("renal, lipid and CBC ranges have editable illustrative presets",()=>{
 const {definitions,assess}=engine();
 for(const key of ["Cr","TFG/eTFG","CT","HDL","LDL","TG","Hb","Leuco","Plaq"]){
  assert.equal(typeof definitions[key].low,"number");assert.equal(typeof definitions[key].high,"number");
  assert.ok(definitions[key].url.startsWith("https://"));
 }
 assert.equal(assess("120","",""),"unverified");
});
test("lab interface filters findings and keeps complementary exam rows",()=>{
 const {JSDOM}=require("jsdom");
 const dom=new JSDOM('<!doctype html><html><body><div id="app"><form id="clinical"><section><div id="extras"></div></section><input name="lab:K" value="5,8"><input name="lab:Cr" value="1,5"></form><textarea id="output"></textarea></div></body></html>',{runScripts:"outside-only"});
 dom.window.eval(source);
 dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
 const doc=dom.window.document;
 const panel=doc.querySelector("#e027-lab");
 assert.ok(panel,"lab panel mounts");
 const check=panel.querySelector('[data-e027="units"]');check.checked=true;
 check.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 const krow=panel.querySelector('[data-key="K"]');krow.querySelector('[data-e027="confirmed"]').checked=true;krow.querySelector('[data-e027="confirmed"]').dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 const summary=panel.querySelector('[role="status"]');
 assert.ok(summary.textContent.includes("1 alerta"));
 const filter=panel.querySelector("select");
 filter.value="alerts";filter.dispatchEvent(new dom.window.Event("change"));
 assert.equal([...panel.querySelectorAll(".e027-range")].filter(x=>!x.hidden).length,1);
 panel.querySelector("button").click();
 assert.equal(panel.querySelectorAll(".e027-exam").length,1);
 dom.window.close();
});
test("chronic modules preserve separate drafts and clear on new encounter",()=>{
 const {JSDOM}=require("jsdom");
 const dom=new JSDOM('<!doctype html><html><body><div id="app"><nav class="main-nav"><button data-nav="has" aria-current="page">HAS</button></nav><form id="clinical"></form><textarea id="output"></textarea></div></body></html>',{runScripts:"outside-only"});
 const {document:doc,Event}=dom.window;
 dom.window.eval(source);doc.dispatchEvent(new Event("DOMContentLoaded"));
 const panel=()=>doc.querySelector("#e027-anamnesis");
 assert.ok(panel().querySelector('[data-e027="adherence"]'));
 const complaint=panel().querySelector('[data-e027="complaint"]');
 complaint.value="Queixa ficticia HAS";complaint.dispatchEvent(new Event("input",{bubbles:true}));
 panel().querySelector("button").click();
 assert.match(doc.querySelector("#output").value,/Queixa ficticia HAS/);
 const nav=doc.querySelector(".main-nav");
 nav.innerHTML='<button data-nav="dm" aria-current="page">DM</button>';
 doc.querySelector("#clinical").replaceWith(doc.createElement("form"));
 doc.querySelector("form").id="clinical";
 dom.window.MutationObserver;
 doc.querySelector("#app").append(doc.createElement("span"));
 return new Promise(resolve=>setTimeout(resolve,0)).then(()=>{
  assert.equal(panel().querySelector('[data-e027="complaint"]').value,"");
  panel().querySelector('[data-e027="complaint"]').value="Queixa ficticia DM";
  panel().querySelector('[data-e027="complaint"]').dispatchEvent(new Event("input",{bubbles:true}));
  nav.innerHTML='<button data-nav="has" aria-current="page">HAS</button>';
  doc.querySelector("#clinical").replaceWith(doc.createElement("form"));
  doc.querySelector("form").id="clinical";
  doc.querySelector("#app").append(doc.createElement("span"));
  return new Promise(resolve=>setTimeout(resolve,0));
 }).then(()=>{
  assert.equal(panel().querySelector('[data-e027="complaint"]').value,"Queixa ficticia HAS");
  dom.window.dispatchEvent(new Event("equipe027:new-encounter"));
  doc.querySelector("#clinical").replaceWith(doc.createElement("form"));
  doc.querySelector("form").id="clinical";
  doc.querySelector("#app").append(doc.createElement("span"));
  return new Promise(resolve=>setTimeout(resolve,0));
 }).then(()=>{
  assert.equal(panel().querySelector('[data-e027="complaint"]').value,"");
  dom.window.close();
 });
});

test("visual cards show editable presets, synchronize results and require report confirmation",()=>{
 const {JSDOM}=require("jsdom");
 const dom=new JSDOM('<!doctype html><html><body><div id="app"><form id="clinical"><section><div id="extras"></div></section><input name="lab:Cr" value=""></form><textarea id="output"></textarea></div></body></html>',{runScripts:"outside-only"});
 dom.window.eval(source);dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
 const doc=dom.window.document,panel=doc.querySelector("#e027-lab"),row=panel.querySelector('[data-key="Cr"]');
 assert.equal(row.querySelector('[data-e027="range-low"]').value,"0.6");
 assert.equal(row.querySelector('[data-e027="range-high"]').value,"1.3");
 const input=row.querySelector('[data-e027="result"]');
 input.value="1,6";input.dispatchEvent(new dom.window.Event("input",{bubbles:true}));
 assert.equal(doc.querySelector('[name="lab:Cr"]').value,"1,6");
 assert.equal(row.dataset.state,"unverified");
 assert.equal(row.querySelector(".e027-track").classList.contains("is-visible"),true);
 panel.querySelector('[data-e027="units"]').checked=true;
 row.querySelector('[data-e027="confirmed"]').checked=true;
 row.querySelector('[data-e027="confirmed"]').dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(row.dataset.state,"high");
 row.querySelector('[data-e027="range-high"]').value="2";
 row.querySelector('[data-e027="range-high"]').dispatchEvent(new dom.window.Event("input",{bubbles:true}));
 assert.equal(row.dataset.state,"within");
 dom.window.close();
});
