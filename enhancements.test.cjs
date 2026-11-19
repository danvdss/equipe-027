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
 [...panel.querySelectorAll("button")].find(b=>b.textContent.includes("Adicionar exame")).click();
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
 assert.equal(row.querySelector(".e027-track").hidden,true);
 panel.querySelector('[data-e027="units"]').checked=true;
 row.querySelector('[data-e027="confirmed"]').checked=true;
 row.querySelector('[data-e027="confirmed"]').dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(row.dataset.state,"high");
 row.querySelector('[data-e027="range-high"]').value="2";
 row.querySelector('[data-e027="range-high"]').dispatchEvent(new dom.window.Event("input",{bubbles:true}));
 assert.equal(row.dataset.state,"unverified");
 const confirmation=row.querySelector('[data-e027="confirmed"]');
 assert.equal(confirmation.checked,false);
 confirmation.checked=true;confirmation.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(row.dataset.state,"within");
 const max=row.querySelector('[data-e027="range-high"]');
 max.value="0,2";max.dispatchEvent(new dom.window.Event("input",{bubbles:true}));
 assert.equal(max.getAttribute("aria-invalid"),"true");
 assert.equal(confirmation.disabled,true);
 row.querySelector('[data-e027="restore"]').click();
 assert.equal(max.value,"1.3");assert.equal(confirmation.checked,false);
 assert.equal(input.value,"1,6");assert.equal(row.querySelector(".e027-track").hidden,true);
 dom.window.close();
});

test("catalog search, category and status combine without changing the LAB values",()=>{
 const {JSDOM}=require("jsdom");
 const fields=["Ferritina","Transferrina",...Array.from({length:8},(_,i)=>"Exame "+i)];
 const group=(title,keys)=>'<details class="lab-group"><summary>'+title+'</summary>'+keys.map(k=>'<input name="lab:'+k+'">').join("")+'</details>';
 const dom=new JSDOM('<div id="app"><form id="clinical"><div id="lab-evaluation-fields">'+group("Ferro",fields)+group("Vitaminas",["Ácido fólico"])+'<section><div id="extras"></div></section></div></form></div>',{runScripts:"outside-only"});
 try{
  const w=dom.window;w.eval(source);w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  const panel=w.document.querySelector("#e027-lab"),visible=()=>[...panel.querySelectorAll(".e027-range")].filter(x=>!x.hidden);
  const event=(el,type)=>el.dispatchEvent(new w.Event(type,{bubbles:true}));
  assert.equal(visible().length,8);
  [...panel.querySelectorAll("button")].find(b=>b.textContent==="Mostrar mais exames").click();assert.equal(visible().length,11);
  const search=panel.querySelector('[type="search"]');search.value="acido";event(search,"input");
  assert.deepEqual(visible().map(x=>x.dataset.key),["Ácido fólico"]);
  const [filter,category]=panel.querySelectorAll(".lab-panel-filters select");category.value="Ferro";event(category,"change");assert.equal(visible().length,0);
  category.value="";event(category,"change");
  const row=visible()[0],original=w.document.querySelector('[name="lab:Ácido fólico"]');
  original.value="5";event(original,"input");
  assert.equal(row.querySelector('[data-e027=result]').value,"5");
  filter.value="unchecked";event(filter,"change");assert.equal(visible().length,1);
  assert.equal(row.querySelector(".e027-track").hidden,true);
  for(const [key,value] of [["unit","unidade de teste"],["range-low","3"],["range-high","7"]])row.querySelector('[data-e027="'+key+'"]').value=value;
  panel.querySelector('[data-e027=units]').checked=true;row.querySelector('[data-e027=confirmed]').checked=true;event(row.querySelector('[data-e027=confirmed]'),"change");
  filter.value="within";event(filter,"change");
  assert.equal(visible().length,1);assert.equal(row.querySelector(".e027-track").hidden,false);
  assert.match(row.querySelector(".e027-state").textContent,/5 unidade de teste/);
  assert.equal(original.value,"5");
 } finally {dom.window.close()}
});
