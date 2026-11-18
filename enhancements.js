/* Equipe 027: complementary documentation and contextual laboratory checks.
   This module does not make diagnoses or store patient data persistently. */
(() => {
"use strict";
const definitions = {
  Glic:{label:"Glicemia de jejum",unit:"mg/dL",low:70,high:99,source:"Sociedade Brasileira de Diabetes",url:"https://diretriz.diabetes.org.br/",note:"Only applicable when fasting is confirmed. The lower limit is operational, not a diagnostic criterion."},
  HbA1c:{label:"Hemoglobina glicada",unit:"%",low:0,high:5.6,source:"Sociedade Brasileira de Diabetes",url:"https://diretriz.diabetes.org.br/",note:"Screening classification is not an individualized treatment target."},
  Na:{label:"Sodio",unit:"mmol/L",low:135,high:145,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/sodium-blood-test/",note:"Typical interval only; prioritize the reporting laboratory."},
  K:{label:"Potassio",unit:"mmol/L",low:3.5,high:5.0,source:"National Kidney Foundation",url:"https://www.kidney.org/kidney-topics/potassium",note:"Typical interval only; prioritize the reporting laboratory."},
  Cr:{label:"Creatinina",unit:"mg/dL",low:null,high:null,source:"Sociedade Brasileira de Nefrologia",url:"https://sbn.org.br/",note:"Limites dependem do metodo, sexo, idade e massa muscular. Transcreva o intervalo do laudo."},
  "TFG/eTFG":{label:"Taxa de filtracao glomerular estimada",unit:"mL/min/1,73m2",low:null,high:null,source:"KDIGO",url:"https://kdigo.org/guidelines/ckd-evaluation-and-management/",note:"Interpretacao requer contexto clinico, idade, persistencia e albuminuria; nao diagnosticar DRC por resultado isolado."},
  CT:{label:"Colesterol total",unit:"mg/dL",low:null,high:null,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Alvos dependem de risco cardiovascular e condicao clinica; nao usar faixa universal."},
  HDL:{label:"Colesterol HDL",unit:"mg/dL",low:null,high:null,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Interpretar com perfil de risco e contexto clinico."},
  LDL:{label:"Colesterol LDL",unit:"mg/dL",low:null,high:null,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Metas individualizadas conforme estratificacao de risco; nao presumir meta."},
  TG:{label:"Triglicerideos",unit:"mg/dL",low:null,high:null,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Jejum e contexto podem modificar interpretacao; confira o laudo."},
  Hb:{label:"Hemoglobina",unit:"g/dL",low:null,high:null,source:"Organizacao Mundial da Saude",url:"https://www.who.int/",note:"Intervalos dependem de idade, sexo, gestacao e outras condicoes; transcreva o laudo."},
  Leuco:{label:"Leucocitos",unit:"/mm3",low:null,high:null,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",note:"Unidades e limites variam; confira o hemograma original."},
  Plaq:{label:"Plaquetas",unit:"/mm3",low:null,high:null,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",note:"Unidades e limites variam; confira o hemograma original."}
};
const memory={};
const clinicalSources={
 has:{title:"Hipertensao arterial",items:[["Ministerio da Saude — Linha de Cuidado HAS","https://linhasdecuidado.saude.gov.br/portal/hipertensao-arterial-sistemica/"],["Sociedade Brasileira de Cardiologia — Diretrizes","https://www.portal.cardiol.br/diretrizes"]]},
 dm:{title:"Diabetes mellitus",items:[["Ministerio da Saude — Linha de Cuidado DM2","https://linhasdecuidado.saude.gov.br/portal/diabetes-mellitus-tipo-2/"],["Sociedade Brasileira de Diabetes — Diretrizes","https://diretriz.diabetes.org.br/"]]},
 renal:{title:"Funcao renal",items:[["Sociedade Brasileira de Nefrologia","https://sbn.org.br/"],["KDIGO — Guidelines","https://kdigo.org/guidelines/"]]}
};
let active=null;
const number=s=>{const v=String(s??"").trim().replace(",",".");return /^-?\d+(\.\d+)?$/.test(v)?Number(v):null};
function assess(value,low,high){
 const v=number(value),lo=number(low),hi=number(high);
 if(v===null||lo===null||hi===null||lo>hi)return "unverified";
 return v<lo?"low":v>hi?"high":"within";
}
const node=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e};
const html=(markup)=>{const e=node("div");e.innerHTML=markup;return e.firstElementChild};
function insertText(text){
 const out=document.querySelector("#output");if(!out)return;
 out.value+=(out.value.trim()?"\n":"")+text;out.dataset.manual="true";
 out.dispatchEvent(new Event("input",{bubbles:true}));
}
function save(){
 if(!active||!active.isConnected)return;
 const form=active.closest("form");if(!form)return;
 const key=active.id==="e027-lab"?"lab":"anamnesis";
 const values={};active.querySelectorAll("[data-e027]").forEach(x=>{values[x.dataset.e027]=x.type==="checkbox"?x.checked:x.value});
 memory[key]=values;
}
function field(label,type,value,key){
 const wrapper=node("label",label+" ");
 const input=node(type==="textarea"?"textarea":"input");
 if(type!=="textarea")input.type=type;
 input.dataset.e027=key;if(value!==undefined)input.value=value;
 wrapper.append(input);return wrapper;
}
function addExam(list,values={}){
 const row=node("div",undefined,"lab-row e027-exam");
 const kind=node("select");["USG","ECG","Ecocardiograma","Radiografia","Tomografia","Ressonancia","Outro"].forEach(v=>{const o=node("option",v);o.value=v;kind.append(o)});
 kind.dataset.e027="exam-kind";kind.value=values.kind||"USG";
 const date=field("Data","date",values.date||"","exam-date");
 const report=field("Achados do laudo","textarea",values.report||"","exam-report");
 const remove=node("button","Remover");remove.type="button";remove.onclick=()=>{row.remove();if(typeof row.dispatchEvent==="function")list.dispatchEvent(new Event("change",{bubbles:true}))};
 const insert=node("button","Inserir no editor");insert.type="button";insert.onclick=()=>{
  const finding=report.querySelector("textarea").value.trim();
  if(!finding){alert("Informe os achados documentados no laudo.");return}
  const dateValue=date.querySelector("input").value;
  insertText(kind.value+(dateValue?" ("+dateValue.split("-").reverse().join("/")+")":"")+": "+finding);
 };
 const kindLabel=node("label","Exame ");kindLabel.append(kind);
 row.append(kindLabel,date,report,remove,insert);list.append(row);
}
function mountLab(form){
 const panel=node("section",undefined,"panel");panel.id="e027-lab";
 panel.append(node("h2","Conferencia contextual de exames"),node("p","Alertas informativos, nao diagnosticos. Use o intervalo e a unidade do laudo. Para funcao renal, perfil lipidico e hemograma, os limites iniciam em branco e precisam ser transcritos do laudo.","muted"));
 const units=field("Confirmo que as unidades informadas no laudo correspondem as unidades indicadas abaixo","checkbox",undefined,"units");panel.append(units);
 const fasting=field("Jejum confirmado (para glicemia)","checkbox",undefined,"fasting");panel.append(fasting);
 const filterLabel=node("label","Filtrar exames ");
 const filter=node("select");[["all","Todos"],["filled","Com resultado"],["alerts","Fora do intervalo"],["unchecked","Nao classificaveis"]].forEach(([value,label])=>{const opt=node("option",label);opt.value=value;filter.append(opt)});filterLabel.append(filter);panel.append(filterLabel);
 const summary=node("p");summary.setAttribute("role","status");panel.append(summary);
 const table=node("div");panel.append(table);
 const results=node("div");results.setAttribute("role","status");results.setAttribute("aria-live","polite");panel.append(results);
 panel.append(node("h2","Exames complementares"),node("p","Registre USG, ECG e outros exames; os achados so entram na evolucao quando inseridos.","muted"));
 const exams=node("div");panel.append(exams);
 const add=node("button","+ Adicionar exame complementar");add.type="button";add.onclick=()=>{addExam(exams);persist();refresh()};panel.append(add);
 form.querySelector("#extras").closest("section")?.insertAdjacentElement("afterend",panel);
 const stored=memory.lab||{};
 for(const [key,ref] of Object.entries(definitions)){
  const row=node("div",undefined,"lab-row e027-range");
  row.dataset.key=key;
  row.append(node("strong",ref.label+" ("+ref.unit+")"));
  row.append(field("Minimo do laudo","text",stored[key+"-low"]??(ref.low===null?"":String(ref.low)),"range-low"));
  row.append(field("Maximo do laudo","text",stored[key+"-high"]??(ref.high===null?"":String(ref.high)),"range-high"));
  const source=node("a","Referencia: "+ref.source);source.href=ref.url;source.target="_blank";source.rel="noopener noreferrer";row.append(source);
  row.append(node("p",ref.note,"muted"));table.append(row);
 }
 fasting.querySelector("input").checked=!!stored.fasting;units.querySelector("input").checked=!!stored.units;
 (stored.exams||[]).forEach(x=>addExam(exams,x));
 function refresh(){
  results.replaceChildren();
  const entries=[];
  for(const row of table.children){
   const key=row.dataset.key,ref=definitions[key];
   const input=[...form.querySelectorAll('input[name^="lab:"]')].find(x=>x.name==="lab:"+key);
   const [low,high]=row.querySelectorAll("input");
   const filled=!!input?.value.trim();
   const state=!filled?"empty":!units.querySelector("input").checked||(key==="Glic"&&!fasting.querySelector("input").checked)?"unverified":assess(input.value,low.value,high.value);
   entries.push({row,key,ref,input,filled,state});
  }
  const count={filled:0,alerts:0,unchecked:0};
  for(const item of entries){
   const {row,ref,input,filled,state}=item;
   if(filled)count.filled++;
   if(state==="low"||state==="high")count.alerts++;
   if(state==="unverified")count.unchecked++;
   const selected=filter.value;
   row.hidden=selected==="filled"?!filled:selected==="alerts"?!["low","high"].includes(state):selected==="unchecked"?state!=="unverified":false;
   if(!filled||row.hidden)continue;
   const message=state==="low"?"Abaixo do intervalo informado":state==="high"?"Acima do intervalo informado":state==="within"?"Dentro do intervalo informado":"Nao classificavel: confirme jejum, limites e unidade";
   const itemLine=node("p",(state==="high"||state==="low"?"ALERTA: ":"")+ref.label+": "+input.value+" ("+ref.unit+"): "+message+".");
   itemLine.dataset.state=state;
   results.append(itemLine);
  }
  summary.textContent=count.filled+" resultado(s) preenchido(s) | "+count.alerts+" alerta(s) | "+count.unchecked+" sem classificacao.";
  if(!results.children.length)results.append(node("p",count.filled?"Nenhum resultado corresponde ao filtro selecionado.":"Preencha os resultados nos campos LAB para avaliar as faixas informadas.","muted"));
 }
 filter.addEventListener("change",refresh); function persist(){
  const values={units:units.querySelector("input").checked,fasting:fasting.querySelector("input").checked,exams:[...exams.children].map(row=>({kind:row.querySelector("select").value,date:row.querySelector('input[type="date"]').value,report:row.querySelector("textarea").value}))};
  for(const row of table.children){const [lo,hi]=row.querySelectorAll("input");values[row.dataset.key+"-low"]=lo.value;values[row.dataset.key+"-high"]=hi.value}
  memory.lab=values;
 }
 form.addEventListener("input",()=>{refresh();persist()});
 form.addEventListener("change",()=>{refresh();persist()});
 refresh();active=panel;
}
function mountAnam(form){
 const module=document.querySelector(".main-nav [aria-current=page]")?.dataset.nav||"general";
 const bucket="anamnesis:"+module;
 const panel=node("section",undefined,"panel");panel.id="e027-anamnesis";
 panel.append(node("h2","Anamnese estruturada"),node("p","Preencha apenas informacoes obtidas. Insercao manual no editor; nenhuma conclusao e presumida.","muted"));
 const fields=[["Queixa principal","complaint"],["Historia atual","history"],["Antecedentes","past"],["Medicamentos em uso","meds"],["Alergias relatadas","allergies"]];
 for(const [label,key] of fields){const f=field(label,"textarea",memory[bucket]?.[key]||"",key);panel.append(f)}
 if(["has","dm","both"].includes(module)){
  const follow=node("section",undefined,"e027-followup");follow.append(node("h3","Acompanhamento de condicoes cronicas"));
  const followFields=[["Adesao relatada ao tratamento","adherence"],["Barreiras ao cuidado","barriers"],["Autocuidado e habitos","selfcare"],["Metas pactuadas com o paciente","goals"],["Encaminhamentos ou retorno efetivamente acordados","return"]];
  for(const [label,key] of followFields)follow.append(field(label,"textarea",memory[bucket]?.[key]||"",key));
  panel.append(follow);fields.push(...followFields);
  const refs=node("section");refs.append(node("h3","Fontes para consulta profissional"));
  const groups=module==="both"?["has","dm","renal"]:module==="has"?["has","renal"]:["dm","renal"];
  for(const group of groups)for(const [label,url] of clinicalSources[group].items){const link=node("a",label);link.href=url;link.target="_blank";link.rel="noopener noreferrer";const line=node("p");line.append(link);refs.append(line)}
  refs.append(node("p","Consulte a versao vigente e o protocolo local. Links nao representam recomendacao individual de tratamento.","muted"));panel.append(refs);
 }
 const button=node("button","Inserir anamnese no editor");button.type="button";button.onclick=()=>{
  const lines=fields.map(([label,key])=>{const v=panel.querySelector('[data-e027="'+key+'"]').value.trim();return v?label+": "+v:null}).filter(Boolean);
  if(lines.length)insertText(lines.join("\n"));
 };panel.append(button);
 form.prepend(panel);active=panel;
 panel.addEventListener("input",()=>{const data={};panel.querySelectorAll("[data-e027]").forEach(x=>data[x.dataset.e027]=x.value);memory[bucket]=data});
}
function mount(){
 const form=document.querySelector("#clinical");if(!form)return;
 if(form.querySelector("#extras")){if(!form.querySelector("#e027-lab"))mountLab(form)}
 else if(!form.querySelector("#e027-anamnesis"))mountAnam(form);
}
function start(){
 const root=document.querySelector("#app");if(!root)return;
 new MutationObserver(()=>{if(root.querySelector("#clinical"))mount()}).observe(root,{childList:true,subtree:false});
 mount();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.Equipe027HasExtraDraft=()=>Object.values(memory).some(x=>Object.entries(x).some(([k,v])=>k!=="fasting"&&k!=="units"&&((Array.isArray(v)&&v.some(y=>y.report?.trim()))||(typeof v==="string"&&v.trim()&&!(k.endsWith("-low")||k.endsWith("-high"))))));
window.addEventListener("equipe027:new-encounter",()=>{for(const key of Object.keys(memory))delete memory[key];active=null});
window.Equipe027LabCheck={assess,definitions,clinicalSources};
})();