"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");
const data=require("./controlados-dados.json");

test("catálogo nominal reproduz as 16 listas e os 783 registros oficiais",()=>{
  assert.equal(data.total,783);
  assert.equal(data.registros.length,783);
  assert.equal(Object.values(data.contagens).reduce((a,b)=>a+b,0),783);
  for(const [list,count] of Object.entries({
    A1:94,A2:13,A3:14,B1:95,B2:8,C1:213,C2:5,C3:3,C5:31,
    D1:35,D2:13,E:9,F1:56,F2:186,F3:1,F4:7
  }))assert.equal(data.contagens[list],count);
  const has=(list,name)=>data.registros.some(v=>v.l===list&&v.n.toLowerCase().includes(name));
  assert.ok(has("D1","mmdppa"));
  assert.ok(has("F1","dimetocaína"));
  assert.ok(has("B1","carisoprodol"));
  assert.ok(has("A2","tramadol"));
  assert.ok(has("C1","sertralina"));
  assert.ok(has("F4","fenibut"));
  assert.match(data.base,/344\/1998/);
  assert.match(data.fonte,/1036/);
});

test("catálogo informa o tipo por cor, filtros, exceções e fonte normativa",async(t)=>{
  const html=fs.readFileSync("controlados.html","utf8");
  const js=fs.readFileSync("controlados.js","utf8");
  const css=fs.readFileSync("controlados.css","utf8");
  assert.match(html,/controlados-dados|controlados\.js/);
  assert.match(js,/A1:"a"/);
  assert.match(js,/B1:"b"/);
  assert.match(js,/C1:"rce"/);
  assert.match(css,/result-card\[data-type="a"\]/);
  assert.match(css,/result-card\[data-type="b"\]/);
  assert.match(css,/result-card\[data-type="rce"\]/);
  assert.match(css,/result-card\[data-type="proscrito"\]/);
  const dom=new JSDOM(html,{url:"https://danvdss.github.io/equipe-027/controlados.html",runScripts:"outside-only"});
  t.after(()=>dom.window.close());
  const w=dom.window;
  w.fetch=async()=>({ok:true,json:async()=>data});
  vm.runInContext(js,dom.getInternalVMContext(),{filename:"controlados.js"});
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(w.document.getElementById("totalCount").textContent,"783");
  assert.equal(w.document.querySelectorAll(".legend-item").length,8);
  assert.equal(w.document.querySelectorAll(".result-card").length,24);
  function search(name){
    const el=w.document.getElementById("search");
    el.value=name;
    el.dispatchEvent(new w.Event("input",{bubbles:true}));
    return w.document.querySelector(".result-card");
  }
  const first=search("clonazepam");
  assert.equal(first.dataset.type,"b");
  assert.match(first.textContent,/Notificação B/);
  assert.equal(search("mmdppa").dataset.type,"simples");
  assert.equal(search("dimetocaína").dataset.type,"proscrito");
  const exception=search("carisoprodol");
  assert.equal(exception.dataset.type,"simples");
  assert.match(exception.textContent,/SEM retenção/);
  assert.ok(exception.querySelector(".exception"));
  assert.match(search("tramadol").textContent,/100 mg/);
  const fenobarbital=search("fenobarbital");
  assert.equal(fenobarbital.dataset.type,"rce");
  assert.match(fenobarbital.textContent,/Controle Especial em duas vias/);
  assert.equal(search("loperamida").dataset.type,"simples");
  assert.equal(search("isotretinoína").dataset.type,"especial");
  assert.equal(search("sertralina").dataset.type,"rce");
  assert.equal(search("fenibut").dataset.type,"proscrito");
  const clear=w.document.getElementById("clearFilters");
  clear.click();
  assert.equal(w.document.querySelectorAll(".result-card").length,24);
  assert.equal(w.document.getElementById("search").value,"");
  assert.match(w.document.getElementById("sourceLink").href,/gov\.br\/anvisa/);
});
test("workflow do GitHub Pages publica os assets do catálogo",()=>{
  const yml=fs.readFileSync(".github/workflows/quality.yml","utf8");
  for(const name of ["controlados.html","controlados.css","controlados.js","controlados-dados.json"]) {
    assert.ok(yml.includes(name),"Arquivo não publicado: "+name);
  }
});
