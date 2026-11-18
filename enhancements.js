/* Equipe-027: apoio documental; alertas não substituem interpretação clínica. */
(() => {
  "use strict";
  const ranges = {
    "Glic": {name:"Glicemia (somente se em jejum)", low:70, high:99, unit:"mg/dL", source:"Sociedade Brasileira de Diabetes — Diretrizes", url:"https://diretriz.diabetes.org.br/", context:"Aplicável apenas se coleta em jejum; limite inferior é operacional, não critério diagnóstico."},
    "HbA1c": {name:"Hemoglobina glicada", high:5.6, unit:"%", source:"Sociedade Brasileira de Diabetes — Diretrizes", url:"https://diretriz.diabetes.org.br/", context:"Faixa de rastreamento, não meta terapêutica individual."},
    "Na": {name:"Sódio", low:135, high:145, unit:"mmol/L", source:"MedlinePlus — Sodium Blood Test", url:"https://medlineplus.gov/lab-tests/sodium-blood-test/", context:"Faixa usual; conferir o intervalo do laboratório."},
    "K": {name:"Potássio", low:3.5, high:5.0, unit:"mmol/L", source:"National Kidney Foundation — Potassium", url:"https://www.kidney.org/kidney-topics/potassium", context:"Faixa usual; conferir o intervalo do laboratório."}
  };
  const parse = v => {const t=String(v||"").trim().replace(",",".");return /^-?\d+(\.\d+)?$/.test(t)?Number(t):null};
  function evaluate(key,value,unit,fasting=false){
    const r=ranges[key]; if(!r||!String(value||"").trim())return null;
    if(key==="Glic"&&!fasting)return {state:"unknown",reason:"Jejum não confirmado.",ref:r};
    if(unit!==r.unit)return {state:"unknown",reason:"Unidade não confirmada: "+r.unit+".",ref:r};
    const n=parse(value);if(n===null)return {state:"unknown",reason:"Resultado não numérico.",ref:r};
    return {state:(r.low!==undefined&&n<r.low)||(r.high!==undefined&&n>r.high)?"alert":"within",reason:"Faixa configurada: "+(r.low??"—")+" a "+(r.high??"—")+" "+r.unit+".",ref:r};
  }
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
  function addText(text){
    const out=document.querySelector("#output");if(!out)return;
    out.value+=(out.value.trim()?"\n":"")+text;
    out.dataset.manual="true";
    out.dispatchEvent(new Event("input",{bubbles:true}));
  }
  function mount(){
    const form=document.querySelector("#clinical");if(!form)return;
    if(form.querySelector("#extras")){
      if(form.querySelector("#e027-lab"))return;
      const panel=make("section",undefined,"panel");panel.id="e027-lab";
      panel.innerHTML='<h2>Alertas de resultados laboratoriais</h2><p class="muted">Apoio à conferência, não diagnóstico. Compare com o laudo original, idade, gestação e contexto clínico. Valores não cobertos não são classificados como normais.</p><label><input id="e027-units" type="checkbox"> Confirmo que Glic está em mg/dL, HbA1c em %, Na e K em mmol/L conforme laudo</label><label><input id="e027-fasting" type="checkbox"> Glicemia coletada em jejum (confirmado)</label><div id="e027-flags" role="status" aria-live="polite"></div><h2>Exames complementares</h2><p class="muted">USG, ECG e outros exames, com achados transcritos do laudo. Inserção manual no editor.</p><div id="e027-extra"></div><button type="button" id="e027-add">+ Adicionar exame complementar</button>';
      const extras=form.querySelector("#extras");extras.closest("section")?.insertAdjacentElement("afterend",panel);
      panel.querySelector("#e027-add").onclick=()=>{
        const row=make("div",undefined,"lab-row");
        row.innerHTML='<label>Exame<select><option>USG</option><option>ECG</option><option>Ecocardiograma</option><option>Radiografia</option><option>Tomografia</option><option>Ressonância</option><option>Outro</option></select></label><label>Data<input type="date"></label><label>Achados do laudo<textarea rows="2"></textarea></label><button type="button" class="remove">Remover</button><button type="button" class="insert">Inserir no registro</button>';
        row.querySelector(".remove").onclick=()=>row.remove();
        row.querySelector(".insert").onclick=()=>{
          const [kind,date,report]=row.querySelectorAll("select,input,textarea");
          if(!report.value.trim()){alert("Informe os achados do laudo.");return}
          addText(kind.value+(date.value?" ("+date.value.split("-").reverse().join("/")+")":"")+": "+report.value.trim());
        };
        panel.querySelector("#e027-extra").append(row);
      };
      const update=()=>{
        const target=panel.querySelector("#e027-flags");target.replaceChildren();
        let count=0;
        for(const [key,ref] of Object.entries(ranges)){
          const input=[...form.querySelectorAll('input[name^="lab:"]')].find(x=>x.name==="lab:"+key);
          if(!input?.value.trim())continue;
          const unitsConfirmed=panel.querySelector("#e027-units").checked; const result=evaluate(key,input.value,unitsConfirmed?ref.unit:"unconfirmed",panel.querySelector("#e027-fasting").checked);
          const icon=result.state==="alert"?"⚠️":result.state==="within"?"✓":"ℹ️";
          const line=make("p",icon+" "+ref.name+": "+input.value+" "+ref.unit+" — "+(result.state==="alert"?"fora da faixa configurada":result.state==="within"?"dentro da faixa configurada":result.reason)+". "+ref.context+" ");
          const link=make("a","Referência");link.href=ref.url;link.target="_blank";link.rel="noopener noreferrer";line.append(link);target.append(line);count++;
        }
        if(!count)target.append(make("p","Preencha glicemia, HbA1c, sódio ou potássio para visualizar os alertas disponíveis.","muted"));
      };
      form.addEventListener("input",update);form.addEventListener("change",update);update();
    }else if(!form.querySelector("#e027-anamnesis")){
      const panel=make("section",undefined,"panel");panel.id="e027-anamnesis";
      panel.innerHTML='<h2>Anamnese estruturada</h2><p class="muted">Campos opcionais. Registre apenas informações realmente obtidas.</p><div class="fields"><label>Queixa principal<textarea data-title="Queixa principal" rows="2"></textarea></label><label>História atual<textarea data-title="História atual" rows="2"></textarea></label><label>Antecedentes<textarea data-title="Antecedentes" rows="2"></textarea></label><label>Medicamentos em uso<textarea data-title="Medicamentos em uso" rows="2"></textarea></label><label>Alergias relatadas<textarea data-title="Alergias relatadas" rows="2"></textarea></label></div><button type="button">Inserir no editor</button>';
      form.prepend(panel);
      panel.querySelector("button").onclick=()=>{
        const lines=[...panel.querySelectorAll("[data-title]")].filter(x=>x.value.trim()).map(x=>x.dataset.title+": "+x.value.trim());
        if(lines.length)addText(lines.join("\n"));
      };
    }
  }
  const start=()=>{
    const root=document.querySelector("#app");if(!root)return;
    const observer=new MutationObserver(()=>{const form=root.querySelector("#clinical");if(form&&!form.querySelector("#e027-lab")&&!form.querySelector("#e027-anamnesis"))mount()});
    observer.observe(root,{childList:true,subtree:false});mount();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
  window.Equipe027LabCheck={evaluate};
})();