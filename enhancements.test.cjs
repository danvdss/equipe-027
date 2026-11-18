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

test("renal, lipid and CBC ranges require lab-provided thresholds",()=>{
 const {definitions,assess}=engine();
 for(const key of ["Cr","TFG/eTFG","CT","HDL","LDL","TG","Hb","Leuco","Plaq"]){
  assert.equal(definitions[key].low,null);assert.equal(definitions[key].high,null);
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
 const summary=panel.querySelector('[role="status"]');
 assert.ok(summary.textContent.includes("1 alerta"));
 const filter=panel.querySelector("select");
 filter.value="alerts";filter.dispatchEvent(new dom.window.Event("change"));
 assert.equal([...panel.querySelectorAll(".e027-range")].filter(x=>!x.hidden).length,1);
 panel.querySelector("button").click();
 assert.equal(panel.querySelectorAll(".e027-exam").length,1);
 dom.window.close();
});
