/* Narrative wording is independent of field labels; never infers a clinical answer. */
const Narrative = (() => {
  const labels={cxDum:'DUM',cxPreviousResult:'Exame anterior',cxFindings:'Achados ao exame',cxAfter:'Condições após a coleta',cxEventDetails:'Intercorrências e medidas adotadas',cxKit:'Dispositivo utilizado',cxDispatchDate:'Encaminhamento em',pcComplaint:'Queixa relatada',pcDevReport:'Desenvolvimento relatado',pcDevObserved:'Desenvolvimento observado',pcFeedDetails:'Alimentação: avaliação e relato registrados',pcSince:'Intercorrências relatadas',pcPregnancy:'História gestacional e perinatal',pcMeasure:'Método de medição',pregnancyBasis:'Fundamentação da avaliação de gestação',complicationDetails:'Intercorrências e medidas adotadas',otherHistory:'Outros antecedentes'};
  function field(key,label,value,d={}) {
    if(key==='cxStatus') {const type=d.cxType==='Citopatológico do colo do útero'?'citopatológico do colo do útero':d.cxType==='DNA-HPV oncogênico'?'DNA-HPV oncogênico':'';return value==='Realizada'&&type?(d.cxMethod==='Autocoleta recebida'?'Recebida amostra de autocoleta para ':'Realizada coleta para ')+type:'Situação da coleta: '+value.toLowerCase();}
    const phrases={cxExam:{Realizado:'Realizado exame especular','Não realizado':'Exame especular não realizado'},cxDispatch:{'Encaminhada ao laboratório':'Amostra encaminhada ao laboratório','Aguardando transporte':'Amostra aguardando transporte','Não encaminhada':'Amostra não encaminhada'},cxConsent:{'Concorda com a coleta':'Paciente concorda com a coleta','Não deseja realizar neste momento':'Paciente não deseja realizar a coleta neste momento','Solicitou interrupção':'Paciente solicitou interrupção'},cxEvent:{'Sem intercorrências observadas':'Sem intercorrências observadas','Com intercorrências':'Registradas intercorrências'}};
    return phrases[key]?.[value] || (labels[key]||label.replace(/\?\s*$/,'').replace(/\s*\(ex\.:.*\)$/i,''))+': '+value;
  }
  function fallback(rows) {
    const groups=new Map();for(const r of rows){const section=r.el.closest('section,details');const title=section?.querySelector('h2,summary')?.childNodes[0]?.textContent?.trim()||'Registro';const values=groups.get(title)||[];values.push(field(r.key,r.label,r.value));groups.set(title,values);}
    return [...groups].map(([title,rows])=>title+': '+rows.map(sentence).join(' ')).join('\n\n');
  }
  function mount(){
    const guides={otIntervention:[['Atividade realizada','Atividade'],['Contexto e materiais','Contexto'],['Estratégia ou ajuda oferecida','Estratégia / ajuda']],otResponse:[['Tarefa observada','Tarefa'],['Resposta observada','Resposta'],['Ajuda necessária','Ajuda']],observations:[['Achado registrado','Achado'],['Fonte ou contexto','Fonte / contexto']],physicalOther:[['Região ou item examinado','Item examinado'],['Achados observados','Achados']],cxFindings:[['Estrutura examinada','Estrutura'],['Achados observados','Achados']],pcDevObserved:[['Atividade observada','Atividade'],['Desempenho observado','Desempenho'],['Contexto e apoio','Contexto / apoio']],complicationDetails:[['Intercorrência observada','Intercorrência'],['Medidas efetivamente adotadas','Medidas adotadas']]};
    for(const [name,slots]of Object.entries(guides)){const target=document.querySelector(`#clinical [name="${name}"]`);if(!target)continue;const box=document.createElement('details');box.className='writing-aid';box.innerHTML='<summary>Preencher com roteiro</summary><p class="privacy">Complete somente o que foi registrado. O roteiro entra no campo após clicar em Acrescentar.</p><div class="fields two">'+slots.map(([label],i)=>`<label>${esc(label)}<input data-writing-slot="${i}" autocomplete="off"></label>`).join('')+'</div><button type="button">Acrescentar ao campo</button>';target.closest('label').after(box);
      box.querySelector('button').onclick=()=>{const text=slots.map(([,label],i)=>{const value=box.querySelector(`[data-writing-slot="${i}"]`).value.trim();return value?sentence(label+': '+value):'';}).filter(Boolean).join(' ');if(!text)return;target.value=[target.value.trim(),text].filter(Boolean).join('\n');box.querySelectorAll('input').forEach(x=>x.value='');box.open=false;target.dispatchEvent(new Event('input',{bubbles:true}));target.focus();};
    }
  }
  return {field,fallback,mount};
})();
/* Shared documentation language; no inferred findings or treatment. */
const Notes = (() => {
  const defaults = {
    general: "consulta",
    has: "consulta para acompanhamento da hipertensão arterial",
    dm: "consulta para acompanhamento do diabetes",
    both: "consulta para acompanhamento da hipertensão arterial e do diabetes",
    prenatal: "consulta de pré-natal",
  };
  const reasons = {
    renew: "solicitar renovação de medicamentos",
    results: "apresentar resultados de exames",
    request: "solicitar exames",
    complaint: "avaliação de queixas",
    followup: "consulta de retorno",
  };
  function form(p) {
    return section(
      "Motivo do atendimento",
      `<div class="fields two"><label>Atendimento<select name="encounterSetting"><option value="neutral">Sem especificar o local</option><option value="unit">Na unidade</option><option value="home">No domicílio</option><option value="bed">À beira do leito</option></select></label><label>Motivo principal<select name="encounterReason"><option value="default">${esc(defaults[p].charAt(0).toUpperCase() + defaults[p].slice(1))}</option>${Object.entries(
        reasons,
      )
        .map(
          ([k, v]) =>
            `<option value="${k}">${esc(v.charAt(0).toUpperCase() + v.slice(1))}</option>`,
        )
        .join(
          "",
        )}<option value="custom">Outro motivo</option></select></label></div><label class="section-extra" id="custom-reason" hidden>Descreva o motivo<input name="encounterCustom" autocomplete="off" placeholder="Ex.: acompanhamento de ferida"></label><p class="privacy" id="opening-preview"></p>`,
    );
  }
  function opening(d, p) {
    const key = d.encounterReason || "default";
    let reason =
      key === "default"
        ? defaults[p]
        : key === "custom"
          ? String(d.encounterCustom ?? "").trim()
          : reasons[key];
    if (!reason) throw Error("Informe o motivo do atendimento.");
    reason = reason.replace(/[.\s]+$/, "");
    const subject = p === "prenatal" ? "Gestante" : "Paciente";
    const setting = d.encounterSetting || "neutral";
    const start = {
      unit: subject + " comparece à unidade para ",
      home: subject + " recebe atendimento no domicílio para ",
      bed: subject + " recebe atendimento à beira do leito para ",
      neutral:
        "Atendimento " +
        (p === "prenatal" ? "à gestante" : "ao paciente") +
        " para ",
    }[setting];
    if (!start) throw Error("Confira o local do atendimento.");
    if(setting === "neutral" && reason.startsWith("consulta")) return subject+" em "+reason+".";
    return start + reason + ".";
  }
  function mount() {
    const form = document.getElementById("clinical");
    if (!form.elements.encounterReason) return;
    const refresh = () => {
      const custom = form.elements.encounterReason.value === "custom";
      const label = document.getElementById("custom-reason");
      label.hidden = !custom;
      form.elements.encounterCustom.disabled = !custom;
      try {
        document.getElementById("opening-preview").textContent = opening(
          Object.fromEntries(new FormData(form)),
          page,
        );
      } catch {
        document.getElementById("opening-preview").textContent =
          "Descreva o motivo para completar a abertura.";
      }
    };
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    refresh();
  }
  function compose(d, p, partial = false) {
    const values = (k) => unique(d["c:" + k] ?? []),
      has = (k) => String(d[k] ?? "").trim() !== "";
    const parts = [];
    let states = values("state"),
      ev = values("evaluation");
    const complaints =
      has("complaint") ||
      states.includes("Queixa principal") ||
      ev.some((v) => ["Refere queixas", "Apresenta queixa"].includes(v));
    const noComplaints =
      states.includes("Sem queixas no momento");
    states = states.filter(
      (v) => !["Queixa principal", "Sem queixas no momento"].includes(v),
    );
    if (
      !partial && states.includes("Bom estado geral") &&
      states.includes("Regular estado geral")
    )
      throw Error("Selecione apenas um estado geral.");
    if (!partial && states.includes("Deambulando") && states.includes("Restrito ao leito"))
      throw Error("Confira a mobilidade: deambulando ou restrito ao leito.");
    if (has("complaint"))
      parts.push(sentence("Refere " + d.complaint));
    else if (complaints) parts.push("Refere queixas no momento.");
    if (noComplaints) parts.push("Sem queixas no momento.");
    if (has("adherence"))
      parts.push(
        "Adesão ao tratamento informada como " +
          d.adherence.toLowerCase() +
          ".",
      );
    if (states.includes("Sem alterações relevantes"))
      parts.push("Sem alterações relevantes registradas.");
    if (states.filter(v => v !== "Sem alterações relevantes").length)
      parts.push(
        sentence(
          "Apresenta-se " +
            join(
              states.filter(v => v !== "Sem alterações relevantes").map(
                (v) =>
                  (["Bom estado geral", "Regular estado geral"].includes(v)
                    ? "em "
                    : "") + v.toLowerCase(),
              ),
            ),
        ),
      );
    const vitals = [
      ["pa", "PA", "mmHg"],
      ["fc", "FC", "bpm"],
      ["fr", "FR", "irpm"],
      ["spo", "SpO₂", "%"],
      ["temp", "temperatura", "°C"],
    ];
    const measure = (rows) =>
      rows
        .filter(([k]) => has(k))
        .map(
          ([k, l, u]) =>
            l +
            " " +
            d[k] +
            (u ? (u === "%" || u === "/10" ? "" : " ") + u : ""),
        );
    const v = measure(vitals);
    if (v.length) parts.push(sentence("Sinais vitais: " + v.join(", ")));
    const other = measure([
      ["hgt", "HGT", "mg/dL"],
      ["glic", "glicemia", "mg/dL"],
      ["a1c", "HbA1c", "%"],
      ["weight", "peso", "kg"],
      ["bmi", "IMC", ""],
      ["pain", "dor", "/10"],
    ]);
    if (other.length) parts.push(sentence(other.join(", ")));
    ev = ev.filter((v) => !["Refere queixas", "Apresenta queixa"].includes(v));
    if (states.includes("Bom estado geral"))
      ev = ev.filter((v) => v !== "Estado geral preservado");
    if (states.includes("Sem alterações relevantes"))
      ev = ev.filter((v) => v !== "Sem alterações");
    const preserved = ev.filter((v) =>
      [
        "Alimentação preservada",
        "Hidratação preservada",
        "Sono preservado",
      ].includes(v),
    );
    if (preserved.length) {
      const terms = preserved.map((v) => v.split(" ")[0].toLowerCase());
      parts.push(
        sentence(
          join(terms) +
            " " +
            (terms.length === 1
              ? terms[0] === "sono"
                ? "preservado"
                : "preservada"
              : terms.includes("sono")
                ? "preservados"
                : "preservadas"),
        ),
      );
      ev = ev.filter((v) => !preserved.includes(v));
    }
    if (ev.length) parts.push(sentence(join(ev.map((v) => v.toLowerCase()))));
    if (has("observations")) parts.push(sentence(d.observations));
    const clinicalEnd = parts.length;
    const acts = values("actions"),
      all = unique([...acts, ...values("returns")]);
    if (acts.includes("Medicação administrada"))
      parts.push(
        sentence(
          "Medicação administrada" +
            (d.adminDrug ? ": " + d.adminDrug : "") +
            (d.adminDose ? ", dose " + d.adminDose : "") +
            (d.adminRoute ? ", via " + d.adminRoute : "") +
            (d.adminTime ? ", às " + d.adminTime : "") +
            (d.adminNotes ? ". " + d.adminNotes : ""),
        ),
      );
    if (d.adherenceBarriers)
      parts.push(
        sentence("Barreiras à adesão relatadas: " + d.adherenceBarriers),
      );
    const renewed = acts.some((v) =>
      ["Medicamentos renovados", "Medicação renovada"].includes(v),
    );
    const renewalText = Care.renewalText(d);
    if (renewalText) parts.push(renewalText);
    if (acts.includes("Tratamento mantido conforme prescrição"))
      parts.push("Mantido tratamento conforme prescrição.");
    if (!renewed && d.medicalRequested !== "Sim" && d.medicalDone !== "Sim" && acts.includes("Necessidade de avaliação médica sinalizada"))
      parts.push("Sinalizada necessidade de avaliação médica.");
    const exams = unique([
      ...values("exams"),
      ...(has("otherExams") ? [d.otherExams] : []),
    ]);
    if (exams.length)
      parts.push(sentence("Solicitados exames: " + join(exams)));
    else if (values("examFlag").length || acts.includes("Exames solicitados"))
      parts.push(
        values("examFlag").length
          ? "Solicitados exames laboratoriais."
          : "Solicitados exames.",
      );
    let guides = values("guides").map((v) => v.toLowerCase());
    const orient = {
      "Uso correto das medicações orientado": "uso correto das medicações",
      "Uso regular das medicações orientado": "uso regular das medicações",
      "Adesão ao tratamento reforçada": "adesão ao tratamento",
      "Adesão ao tratamento orientada": "adesão ao tratamento",
    };
    for (const x of acts) {
      if (orient[x]) guides.push(orient[x]);
      else if (x.startsWith("Orientação sobre "))
        guides.push(x.slice("Orientação sobre ".length).toLowerCase());
    }
    guides = unique(guides);
    if (guides.includes("alimentação saudável"))
      guides = guides.filter((v) => v !== "alimentação");
    if (guides.length)
      parts.push("Orientações realizadas: " + join(guides) + ".");
    else if (acts.includes("Orientações realizadas"))
      parts.push("Realizadas orientações.");
    if (has("otherActions")) parts.push(sentence(d.otherActions));
    if (d.referralDetails)
      parts.push(sentence("Encaminhamento: " + d.referralDetails));
    else if (all.includes("Encaminhamento realizado"))
      parts.push("Realizado encaminhamento.");
    if (all.includes("Reavaliação orientada"))
      parts.push("Orientada reavaliação.");
    if (!d.followStatus && all.includes("Retorno orientado")) parts.push("Orientado retorno.");
    if (all.includes("Acompanhamento mantido"))
      parts.push("Mantido acompanhamento com a equipe.");
    if (!parts.length)
      throw Error(
        "Preencha ou selecione ao menos uma informação do atendimento.",
      );
    return [opening(d, p), parts.slice(0,clinicalEnd).join(" "), parts.length>clinicalEnd?"Conduta: "+parts.slice(clinicalEnd).join(" "):""].filter(Boolean).join("\n\n");
  }
  return { form, opening, mount, compose };
})();
