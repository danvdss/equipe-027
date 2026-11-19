/* Equipe 027: complementary documentation and contextual laboratory checks.
   This module does not make diagnoses or store patient data persistently. */
(() => {
"use strict";
const definitions = {
  Glic:{label:"Glicemia de jejum",unit:"mg/dL",low:70,high:99,source:"Sociedade Brasileira de Diabetes",url:"https://diretriz.diabetes.org.br/",note:"Confirme o jejum e confira os limites no laudo."},
  HbA1c:{label:"Hemoglobina glicada",unit:"%",low:0,high:5.6,source:"Sociedade Brasileira de Diabetes",url:"https://diretriz.diabetes.org.br/",note:"Confira a faixa do laudo. Metas de tratamento são individualizadas."},
  Na:{label:"Sódio",unit:"mmol/L",low:135,high:145,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/sodium-blood-test/",note:"Faixa inicial ilustrativa. Confira os limites do laboratório."},
  K:{label:"Potássio",unit:"mmol/L",low:3.5,high:5.0,source:"National Kidney Foundation",url:"https://www.kidney.org/kidney-topics/potassium",note:"Faixa inicial ilustrativa. Confira os limites do laboratório."},
  Cr:{label:"Creatinina",unit:"mg/dL",low:0.6,high:1.3,source:"Sociedade Brasileira de Nefrologia",url:"https://sbn.org.br/",note:"Limites dependem do metodo, sexo, idade e massa muscular. Transcreva o intervalo do laudo."},
  "TFG/eTFG":{label:"Taxa de filtração glomerular estimada",unit:"mL/min/1,73m2",low:60,high:120,source:"KDIGO",url:"https://kdigo.org/guidelines/ckd-evaluation-and-management/",note:"Interpretacao requer contexto clinico, idade, persistencia e albuminuria; nao diagnosticar DRC por resultado isolado."},
  CT:{label:"Colesterol total",unit:"mg/dL",low:0,high:190,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Alvos dependem de risco cardiovascular e condicao clinica; nao usar faixa universal."},
  HDL:{label:"Colesterol HDL",unit:"mg/dL",low:40,high:100,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Interpretar com perfil de risco e contexto clinico."},
  LDL:{label:"Colesterol LDL",unit:"mg/dL",low:0,high:130,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Metas individualizadas conforme estratificacao de risco; nao presumir meta."},
  TG:{label:"Triglicerídeos",unit:"mg/dL",low:0,high:150,source:"Sociedade Brasileira de Cardiologia",url:"https://www.portal.cardiol.br/diretrizes",note:"Jejum e contexto podem modificar interpretacao; confira o laudo."},
  Hb:{label:"Hemoglobina",unit:"g/dL",low:12,high:17.5,source:"Organizacao Mundial da Saude",url:"https://www.who.int/",note:"Intervalos dependem de idade, sexo, gestacao e outras condicoes; transcreva o laudo."},
  Leuco:{label:"Leucócitos",unit:"/mm3",low:4000,high:11000,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",note:"Unidades e limites variam; confira o hemograma original."},
  Plaq:{label:"Plaquetas",unit:"/mm3",low:150000,high:450000,source:"MedlinePlus",url:"https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",note:"Unidades e limites variam; confira o hemograma original."}
};
const examNames={
 Ht:"Hematócrito",Neutro:"Neutrófilos",Linf:"Linfócitos",Mono:"Monócitos",Eos:"Eosinófilos",Baso:"Basófilos",
 VCM:"Volume corpuscular médio",HCM:"Hemoglobina corpuscular média",CHCM:"Concentração de hemoglobina corpuscular média",
 Ur:"Ureia",TGO:"Aspartato aminotransferase (AST)",TGP:"Alanina aminotransferase (ALT)",FA:"Fosfatase alcalina",
 BT:"Bilirrubina total",BD:"Bilirrubina direta",BI:"Bilirrubina indireta",Ca:"Cálcio",Mg:"Magnésio",Cl:"Cloreto",
 T4L:"Tiroxina livre",TSH:"Hormônio tireoestimulante",PCR:"Proteína C reativa"
};
const memory={};
const clinicalSources={
 has:{title:"Hipertensao arterial",items:[["Ministerio da Saude — Linha de Cuidado HAS","https://linhasdecuidado.saude.gov.br/portal/hipertensao-arterial-sistemica/"],["Sociedade Brasileira de Cardiologia — Diretrizes","https://www.portal.cardiol.br/diretrizes"]]},
 dm:{title:"Diabetes mellitus",items:[["Ministerio da Saude — Linha de Cuidado DM2","https://linhasdecuidado.saude.gov.br/portal/diabetes-mellitus-tipo-2/"],["Sociedade Brasileira de Diabetes — Diretrizes","https://diretriz.diabetes.org.br/"]]},
 renal:{title:"Funcao renal",items:[["Sociedade Brasileira de Nefrologia","https://sbn.org.br/"],["KDIGO — Guidelines","https://kdigo.org/guidelines/"]]}
};
let active=null;
const number=s=>{const v=String(s??"").trim().replace(",",".");return /^-?\d+(\.\d+)?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null};
function assess(value,low,high){
 const v=number(value),lo=number(low),hi=number(high);
 if(v===null||lo===null||hi===null||lo>=hi)return "unverified";
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
 panel.append(node("h2","Painel de exames"),node("p","Compare o resultado com os limites do laudo. Confirme a unidade e a faixa antes de usar o gráfico.","muted"));
 const units=field("Conferi as unidades dos resultados com o laudo","checkbox",undefined,"units");panel.append(units);
 const fasting=field("Jejum confirmado para a glicemia de jejum","checkbox",undefined,"fasting");panel.append(fasting);
 const controls=node("div",undefined,"lab-panel-filters");
 const searchLabel=field("Buscar por nome ou sigla","search","","search");
 const search=searchLabel.querySelector("input");
 const filterLabel=node("label","Situação ");
 const filter=node("select");
 for(const [value,label] of [["all","Todas"],["filled","Com resultado"],["alerts","Fora da faixa"],["within","Dentro da faixa"],["unchecked","Sem comparação"],["empty","Sem resultado"]]){
   filter.add(new Option(label,value));
 }
 filterLabel.append(filter);
 const groupLabel=node("label","Categoria ");
 const category=node("select");
 category.add(new Option("Todas as categorias",""));
 groupLabel.append(category);
 controls.append(searchLabel,filterLabel,groupLabel);panel.append(controls);
 const summary=node("p");summary.setAttribute("role","status");panel.append(summary);
 const table=node("div");table.className="e027-visual-grid";panel.append(table);
 const more=node("button","Mostrar mais exames");more.type="button";panel.append(more);
 panel.append(node("h2","Exames complementares"),node("p","Registre USG, ECG e outros exames; os achados so entram na evolucao quando inseridos.","muted"));
 const exams=node("div");panel.append(exams);
 const add=node("button","+ Adicionar exame complementar");add.type="button";add.onclick=()=>{addExam(exams);persist();refresh()};panel.append(add);
 const container=form.querySelector("#lab-evaluation-fields");
 if(container)container.prepend(panel);
 else form.querySelector("#extras").closest("section").after(panel);
 const stored=memory.lab||{};
 const rows=[];
 const groups=new Set();
 const normalize=value=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 for(const input of form.querySelectorAll('input[name^="lab:"]')){
   const key=input.name.slice(4);
   const ref=definitions[key];
   const group=input.closest(".lab-group")?.querySelector("summary")?.textContent.trim()||"Outros";
   groups.add(group);
   const row=node("article",undefined,"lab-row e027-range");row.dataset.key=key;
   const title=ref?.label||examNames[key]||key;
   row.append(node("small",group,"muted"),node("strong",title===key?title:title+" · "+key));
   const result=field("Resultado do exame","text",input.value,"result");
   const visual=result.querySelector("input");row.append(result);
   const originalUnit=ref?.unit||(input.closest("label")?.textContent.trim().endsWith("· %")?"%":"");
   const unitLabel=field("Unidade do laudo","text",originalUnit||stored[key+"-unit"]||"","unit");
   const unit=unitLabel.querySelector("input");unit.readOnly=Boolean(originalUnit);
   row.append(unitLabel);
   const lowLabel=field("Mínimo do laudo","text",stored[key+"-low"]??ref?.low??"","range-low");
   const highLabel=field("Máximo do laudo","text",stored[key+"-high"]??ref?.high??"","range-high");
   const low=lowLabel.querySelector("input"),high=highLabel.querySelector("input");
   low.inputMode=high.inputMode="decimal";
   row.append(lowLabel,highLabel);
   if(ref){
     const link=node("a","Referência: "+ref.source);link.href=ref.url;link.target="_blank";link.rel="noopener noreferrer";row.append(link);
     row.append(node("p",ref.note,"muted"));
   }
   const confirmation=field("Faixa conferida com o laudo","checkbox",undefined,"confirmed");
   const confirmed=confirmation.querySelector("input");confirmed.checked=!!stored[key+"-confirmed"];row.append(confirmation);
   const track=node("div",undefined,"e027-track");track.setAttribute("aria-hidden","true");
   const marker=node("div",undefined,"e027-marker");track.append(marker);
   const label=node("p",undefined,"e027-state");row.append(track,label);table.append(row);
   rows.push({key,group,term:normalize(title+" "+key+" "+group),row,input,visual,unit,low,high,confirmed,track,marker,label});
   visual.addEventListener("input",()=>{
     input.value=visual.value;
     input.dispatchEvent(new Event("input",{bubbles:true}));
   });
 }
 for(const group of groups)category.add(new Option(group,group));
 const unitsBox=units.querySelector("input"),fastingBox=fasting.querySelector("input");
 unitsBox.checked=!!stored.units;fastingBox.checked=!!stored.fasting;
 (stored.exams||[]).forEach(x=>addExam(exams,x));
 let limit=8;
 function refresh(){
   const query=normalize(search.value);
   let matches=0,filled=0,alerts=0;
   for(const item of rows){
     const {key,input,visual,unit,low,high,confirmed,track,marker,label,row}=item;
     if(visual.value!==input.value)visual.value=input.value;
     const value=input.value.trim();
     let state="empty",description="Aguardando resultado";
     if(value){
       filled++;
       state="unverified";
       if(!unit.value.trim()||!unitsBox.checked)description="Confira a unidade no laudo";
       else if(!confirmed.checked)description="Confira a faixa no laudo";
       else if(key==="Glic"&&!fastingBox.checked)description="Jejum sem confirmação";
       else {
         state=assess(value,low.value,high.value);
         description={low:"Abaixo da faixa",within:"Dentro da faixa",high:"Acima da faixa",unverified:"Sem comparação numérica"}[state];
       }
     }
     const comparable=["low","within","high"].includes(state);
     track.hidden=!comparable;track.classList.toggle("is-visible",comparable);
     if(comparable){
       const position=20+60*(number(value)-number(low.value))/(number(high.value)-number(low.value));
       marker.style.left=Math.max(0,Math.min(100,position))+"%";
       description+=" · "+value+" "+unit.value+" · faixa "+low.value+" a "+high.value+" "+unit.value;
     }
     row.dataset.state=state;
     if(label.textContent!==description)label.textContent=description;
     const outside=state==="high"||state==="low";if(outside)alerts++;
     const statuses={all:true,filled:!!value,alerts:outside,within:state==="within",unchecked:state==="unverified",empty:!value};
     const match=statuses[filter.value]&&(!category.value||category.value===item.group)&&item.term.includes(query);
     if(match)matches++;
     row.hidden=!match||matches>limit;
   }
   const status=matches ? Math.min(matches,limit)+" de "+matches+" exames exibidos" : "Nenhum exame corresponde à busca";
   summary.textContent=status+" · No formulário: "+filled+" com resultado · "+alerts+" alerta(s) fora da faixa.";
   more.hidden=matches<=limit;
 }
 function persist(){
   const values={units:unitsBox.checked,fasting:fastingBox.checked,exams:[...exams.children].map(row=>({kind:row.querySelector("select").value,date:row.querySelector('input[type="date"]').value,report:row.querySelector("textarea").value}))};
   for(const {key,low,high,unit,confirmed} of rows){
     values[key+"-low"]=low.value;values[key+"-high"]=high.value;values[key+"-confirmed"]=confirmed.checked;
     if(!unit.readOnly&&unit.value)values[key+"-unit"]=unit.value;
   }
   memory.lab=values;
 }
 more.onclick=()=>{limit+=8;refresh()};
 search.addEventListener("input",()=>{limit=8;refresh()});
 for(const select of [filter,category])select.addEventListener("change",()=>{limit=8;refresh()});
 function handle(event){
   if(controls.contains(event.target)||event.target.dataset.e027==="result")return;
   refresh();
   if(panel.contains(event.target))persist();
 }
 form.addEventListener("input",handle);
 form.addEventListener("change",handle);
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
