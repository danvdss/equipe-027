/* Repeated prenatal results by trimester. Documentary only; no automatic diagnosis. */
const PrenatalExams=(()=>{
 const reactive=['Não reagente','Reagente','Indeterminado','Inválido'];
 const catalog={
 hemogram:['Hemograma',[['hb','Hemoglobina (g/dL)'],['ht','Hematócrito (%)'],['leuc','Leucócitos (/mm³)'],['plat','Plaquetas (/mm³)'],['detail','Outros parâmetros e unidades']]],
 blood:['Tipagem ABO / Rh',[['abo','Grupo ABO',['A','B','AB','O']],['rh','Fator Rh',['Positivo','Negativo','Indeterminado']]]],
 glucose:['Glicemia de jejum',[['value','Glicemia (mg/dL)']]],
 vdrl:['VDRL',[['result','Resultado',reactive],['titer','Titulação conforme laudo (ex.: 1:8)']]],
 coombs:['Coombs indireto / pesquisa de anticorpos irregulares',[['result','Resultado',['Negativo','Positivo','Indeterminado']],['antibody','Anticorpo identificado / título conforme laudo']]],
 totg:['TOTG 75 g',[['fast','Jejum (mg/dL)'],['one','Após 1 hora (mg/dL)'],['two','Após 2 horas (mg/dL)'],['conditions','Condições / interrupção / observações']]],
 eas:['EAS / sumário de urina',[['density','Densidade'],['ph','pH'],['protein','Proteínas (resultado e unidade)'],['glucose','Glicose (resultado e unidade)'],['nitrite','Nitrito',['Negativo','Positivo']],['leuco','Leucócitos (valor e unidade)'],['red','Hemácias (valor e unidade)'],['bacteria','Bactérias / sedimento / outros achados']]],
 culture:['Urocultura',[['result','Resultado',['Sem crescimento bacteriano','Com crescimento bacteriano','Flora mista / possível contaminação','Inconclusivo']],['organism','Microrganismo(s)'],['count','Contagem (UFC/mL)'],['antibiogram','Antibiograma conforme laudo']]],
 usg:['Ultrassonografia',[['type','Tipo',['Obstétrica','Transvaginal','Morfológica do 1º trimestre','Morfológica do 2º trimestre','Obstétrica com Doppler','Outra']],['weeks','IG no laudo: semanas'],['days','IG no laudo: dias (0–6)'],['fetuses','Número de fetos'],['bcf','BCF (bpm)'],['weight','Peso fetal estimado (g)'],['percentile','Percentil e curva de referência'],['placenta','Placenta'],['fluid','Líquido amniótico / medida e unidade'],['findings','Biometria, Doppler, conclusão e demais achados']]],
 trSyph:['Teste rápido para sífilis (treponêmico)',[['result','Resultado',reactive],['kit','Kit / lote / identificação, se registrado']]],
 trHiv:['Teste rápido para HIV',[['result','Resultado',reactive],['stage','Etapa / teste 1 ou 2 / identificação do kit']]],
 trB:['Teste rápido para hepatite B (HBsAg)',[['result','Resultado',reactive],['kit','Kit / lote / identificação, se registrado']]],
 trC:['Teste rápido para hepatite C (anti-HCV)',[['result','Resultado',reactive],['kit','Kit / lote / identificação, se registrado']]],
 toxo:['Toxoplasmose IgG / IgM',[['igg','IgG',reactive],['igm','IgM',reactive],['values','Valores, unidades e referência do laboratório'],['avidity','Avidez de IgG, quando realizada']]],
 hiv:['HIV laboratorial',[['result','Resultado conforme laudo'],['method','Método / etapa do algoritmo']]],
 hbv:['HBsAg laboratorial',[['result','Resultado',reactive]]],hcv:['Anti-HCV laboratorial',[['result','Resultado',reactive]]],
 htlv:['HTLV I/II',[['result','Resultado',reactive]]],electro:['Eletroforese de hemoglobina',[['result','Resultado conforme laudo']]],
 gbs:['Cultura para estreptococo do grupo B',[['result','Resultado',['Negativo','Positivo','Inconclusivo']],['site','Local da coleta']]],
 other:['Outro exame',[['name','Nome do exame'],['result','Resultado, unidade e referência']]]
 };
 const value=(d,k)=>String(d[k]??'').trim();
 function records(d){return [...new Set(Object.keys(d).map(k=>k.match(/^(pnLab_[123]_\d+)_/)?.[1]).filter(Boolean))].sort((a,b)=>+a.split('_')[1]-+b.split('_')[1]||+a.split('_')[2]-+b.split('_')[2]);}
 function field(p,[key,label,opts]){return `<label>${esc(label)}${Array.isArray(opts)?`<select name="${p}_${key}"><option value="">Não informado</option>${opts.map(v=>`<option>${esc(v)}</option>`).join('')}</select>`:opts==='date'?`<input name="${p}_${key}" type="date">`:`<input name="${p}_${key}" autocomplete="off">`}</label>`;}
 function row(p,kind){const c=catalog[kind];if(!c)return '';return `<details class="exam-record" open><summary><span>${esc(c[0])}</span><small data-exam-summary>Registro em preenchimento</small><span class="exam-edit">Editar / recolher</span></summary><fieldset class="medicine-row" data-pn-lab="${p}"><legend>${esc(c[0])}</legend><input type="hidden" name="${p}_kind" value="${kind}"><div class="fields two">${[['status','Situação',['Solicitado','Coletado / realizado, aguardando resultado','Resultado disponível','Não realizado']],['date','Data da coleta / realização','date'],['report','Data do laudo','date'],['source','Fonte',['Laudo apresentado','Registro da caderneta','Registro eletrônico','Teste realizado nesta consulta','Relato da gestante']],...c[1],['note','Observações / conduta registrada']].map(f=>field(p,f)).join('')}</div><button type="button" data-pn-remove>Remover este registro</button></fieldset></details>`;}
 function form(){const d=drafts.prenatal||{};return section('Resultados de exames por trimestre',`<p class="privacy">Adicione o exame, selecione a situação e transcreva os resultados. Repita para exames em outras datas. Cada trimestre é uma organização do registro, não uma solicitação automática de todos os exames. Não repita aqui um mesmo resultado já transcrito no Protege.</p>${[1,2,3].map(t=>`<details class="compact-details" data-pn-trimester="${t}"><summary>${t}º trimestre · exames e testes rápidos</summary><div class="exam-picker"><label>Buscar exame<input type="search" data-pn-search="${t}" placeholder="Ex.: VDRL, urina, HIV"></label><label>Adicionar exame ao ${t}º trimestre<select data-pn-picker="${t}"><option value="">Selecione o exame</option>${Object.entries(catalog).map(([id,c])=>`<option value="${id}">${esc(c[0])}</option>`).join('')}</select></label><button type="button" data-pn-add="${t}">+ Adicionar exame</button></div><div data-pn-list="${t}">${records(d).filter(p=>p.split('_')[1]===String(t)).map(p=>row(p,d[p+'_kind'])).join('')}</div></details>`).join('')}<p class="privacy">VDRL e teste rápido treponêmico são registros distintos; resultados diferentes não são classificados automaticamente como incoerentes. O TOTG registra as três medidas sem presumir diagnóstico. A USG registrada aqui não altera a referência de datação escolhida acima.</p><details><summary>Referências e uso</summary><p class="privacy">Exames e repetição dependem da avaliação e do protocolo local. Resultados reagentes exigem avaliação profissional conforme o fluxo do teste; esta tela não conclui diagnósticos nem prescreve condutas.</p><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/gravidez/exames-e-vacinas" target="_blank" rel="noopener noreferrer">Ministério da Saúde · exames do pré-natal ↗</a><br><a href="https://www.gov.br/aids/pt-br/assuntos/transmissao-vertical" target="_blank" rel="noopener noreferrer">Ministério da Saúde · testagem no pré-natal ↗</a></details>`);}
 function compose(d){const by={};for(const p of records(d)){const c=catalog[d[p+'_kind']];if(!c)continue;const fields=[['status','Situação'],['date','Coleta / realização'],['report','Laudo'],['source','Fonte'],...c[1],['note','Observações / conduta']];const bits=fields.filter(([k])=>value(d,p+'_'+k)).map(([k,l])=>l+': '+(['date','report'].includes(k)?value(d,p+'_'+k).split('-').reverse().join('/'):value(d,p+'_'+k)));if(bits.length)(by[p.split('_')[1]]??=[]).push(c[0]+' — '+bits.join('; '));}return Object.entries(by).map(([t,rows])=>`Exames do ${t}º trimestre: `+rows.map(sentence).join(' ')).join('\n\n');}
 function issues(d){const out=[];const add=(message,keys)=>out.push({message,keys,values:keys.map(k=>value(d,k)).filter(Boolean)});for(const p of records(d)){const kind=d[p+'_kind'],c=catalog[kind];if(!c)continue;const k=x=>p+'_'+x,results=c[1].filter(([key])=>!['name','kit','stage','method','site','type'].includes(key)&&value(d,k(key))).map(([key])=>k(key));
 if(results.length&&['Solicitado','Coletado / realizado, aguardando resultado','Não realizado'].includes(d[k('status')]))add(c[0]+': resultado preenchido com situação pendente ou não realizada. Confira a situação e a data.',[k('status'),...results]);
 if(results.length&&!d[k('status')])add(c[0]+': informe a situação do resultado para contextualizar o registro.',[k('status')]);
 for(const key of ['date','report']){const s=value(d,k(key));if(!s)continue;const dt=new Date(s+'T12:00:00Z');if(isNaN(dt)||dt.toISOString().slice(0,10)!==s||+s.slice(0,4)<1900)add('Confira a data do exame.',[k(key)]);else if(d.visitDate&&s>d.visitDate)add('Exame ou laudo com data posterior à consulta. Confira o registro.',[k(key),'visitDate']);}
 if(d[k('report')]&&d[k('date')]&&d[k('report')]<d[k('date')])add('Laudo anterior à coleta / realização.',[k('date'),k('report')]);
 if(kind==='culture'&&d[k('result')]==='Sem crescimento bacteriano'&&value(d,k('organism')))add('Urocultura sem crescimento com microrganismo descrito. Revise.',[k('result'),k('organism')]);
 if(kind==='vdrl'&&d[k('result')]==='Não reagente'&&value(d,k('titer')))add('VDRL não reagente com titulação registrada. Confira o laudo.',[k('result'),k('titer')]);
 if(kind==='usg'&&value(d,k('days'))&&(!/^\d+$/.test(d[k('days')])||+d[k('days')]>6))add('Na idade gestacional da USG, informe dias entre 0 e 6.',[k('days')]);
 }return out;}
 function mount(){const f=document.querySelector('#clinical');
 const summarize=()=>{f.querySelectorAll('.exam-record').forEach(el=>{const p=el.querySelector('[data-pn-lab]').dataset.pnLab;const d=Object.fromEntries(new FormData(f));const c=catalog[d[p+'_kind']];const result=c[1].filter(([k])=>!['kit','stage','method','name'].includes(k)&&value(d,p+'_'+k)).slice(0,2).map(([k,l])=>l+': '+value(d,p+'_'+k));el.querySelector('[data-exam-summary]').textContent=[value(d,p+'_date')?value(d,p+'_date').split('-').reverse().join('/'):'Sem data',value(d,p+'_status')||'Situação não informada',...result].join(' · ');});f.querySelectorAll('[data-pn-trimester]').forEach(el=>{let badge=el.querySelector('[data-exam-count]');if(!badge){badge=document.createElement('span');badge.dataset.examCount='';el.querySelector('summary').append(badge);}const n=el.querySelectorAll('.exam-record').length;badge.textContent=n?' · '+n+' registro(s)':'';});};
 f.querySelectorAll('[data-pn-search]').forEach(input=>input.oninput=()=>{const term=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const select=f.querySelector(`[data-pn-picker="${input.dataset.pnSearch}"]`);select.innerHTML='<option value="">Selecione o exame</option>'+Object.entries(catalog).filter(([id,c])=>c[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(term)).map(([id,c])=>`<option value="${id}">${esc(c[0])}</option>`).join('');});
 f.addEventListener('input',summarize);f.addEventListener('change',summarize);summarize();
f.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-pn-add')){const t=b.dataset.pnAdd,picker=f.querySelector(`[data-pn-picker="${t}"]`),kind=picker.value;if(!catalog[kind]){picker.focus();return;}const list=f.querySelector(`[data-pn-list="${t}"]`),id=Math.max(0,...[...list.querySelectorAll('[data-pn-lab]')].map(el=>+el.dataset.pnLab.split('_')[2]))+1;list.insertAdjacentHTML('beforeend',row(`pnLab_${t}_${id}`,kind));picker.value='';list.lastElementChild.querySelector('select')?.focus();Flow.changed();summarize();}
 if(b.hasAttribute('data-pn-remove')){if(await Flow.dialog('Remover exame?','Este registro será removido do rascunho.',[['cancel','Cancelar'],['remove','Remover']])!=='remove')return;b.closest('.exam-record').remove();Flow.changed();summarize();}});}
 return {form,mount,compose,issues};
})();

/* Pré-natal: calculations and text are local to the current session. */
const Prenatal = (() => {
  const DAY = 86400000;
  const medicines = ["Carbonato de cálcio", "Sulfato ferroso", "Ácido fólico"];
  const assays = [
    "HIV",
    "Sífilis",
    "Toxoplasmose IgM",
    "Toxoplasmose IgG",
    "HBsAg",
    "Anti-HCV",
    "HTLV",
  ];
  const orientations = [
    "Alimentação e hidratação",
    "Uso correto dos medicamentos prescritos",
    "Sinais de alerta e quando procurar atendimento",
    "Importância do acompanhamento pré-natal",
    "Realização dos exames solicitados",
    "Atualização vacinal conforme avaliação",
    "Aleitamento materno",
    "Cuidados com a saúde bucal",
  ];
  const procedures = [
    "Consulta de enfermagem realizada",
    "Caderneta da gestante atualizada",
    "Resultados de exames avaliados",
    "Encaminhamento realizado",
    "Acompanhamento pré-natal mantido",
  ];
  const present = (v) => String(v ?? "").trim() !== "";
  const list = (d, k) => (Array.isArray(d["c:" + k]) ? d["c:" + k] : []);
  const fmt = (v) => v.split("-").reverse().join("/");
  function dateDay(value, label = "data") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? ""))
      throw Error("Informe uma " + label + " válida.");
    const n = Date.parse(value + "T00:00:00Z");
    if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== value)
      throw Error("Confira a " + label + ".");
    return n / DAY;
  }
  function age(d) {
    const method = d.igMethod || "dum";
    if (method === "none") return null;
    let days;
    if (method === "dum") {
      if (!present(d.dum)) return null;
      days = dateDay(d.visitDate, "data da consulta") - dateDay(d.dum, "DUM");
      if (days < 0) throw Error("A DUM não pode ser posterior à consulta.");
    } else if (method === "usg") {
      if (![d.usgDate, d.usgWeeks].some(present)) return null;
      if (!present(d.usgDate) || !present(d.usgWeeks) || !present(d.usgDays))
        throw Error("Complete a data e a idade da USG em semanas e dias.");
      if (
        !/^\d+$/.test(d.usgWeeks) ||
        !/^\d+$/.test(d.usgDays) ||
        Number(d.usgDays) > 6
      )
        throw Error("Na USG, informe semanas inteiras e dias entre 0 e 6.");
      const elapsed =
        dateDay(d.visitDate, "data da consulta") -
        dateDay(d.usgDate, "data da USG");
      if (elapsed < 0) throw Error("A USG não pode ser posterior à consulta.");
      days = Number(d.usgWeeks) * 7 + Number(d.usgDays) + elapsed;
    } else throw Error("Selecione DUM ou USG para o cálculo.");
    if (days > 45 * 7 + 6)
      throw Error(
        "Idade calculada acima de 45 semanas. Confira as datas e a idade da USG.",
      );
    return { weeks: Math.floor(days / 7), days: days % 7, method, total: days };
  }
  function select(name, label, options, blank = "Não informado") {
    return `<label>${label}<select name="${name}"><option value="">${blank}</option>${options
      .map((x) => {
        const [v, t] = Array.isArray(x) ? x : [x, x];
        return `<option value="${esc(v)}">${esc(t)}</option>`;
      })
      .join("")}</select></label>`;
  }
  function input(name, label, type = "text", attrs = "") {
    return `<label>${label}<input name="${name}" type="${type}" autocomplete="off" ${attrs}></label>`;
  }
  function text(name, label, placeholder = "") {
    return `<label>${label}<textarea name="${name}" rows="2" placeholder="${esc(placeholder)}"></textarea></label>`;
  }
  function protege(n) {
    const prefix = "protege" + n;
    return `<div class="protege-block"><h3>Protege · ${n}º trimestre</h3><div class="fields two">${select(
      prefix + "Status",
      "Situação",
      [
        ["not", "Não coletado"],
        ["requested", "Coleta solicitada"],
        ["collected", "Coletado"],
        ["pending", "Coletado · aguardando resultados"],
        ["available", "Resultados disponíveis"],
      ],
    )}<div data-protege-date="${n}">${input(prefix + "Date", "Data da coleta", "date")}</div></div><div data-protege-results="${n}" class="section-extra"><p class="privacy">Transcreva os resultados do laudo. Campos vazios não entram no texto.</p><div class="fields two">${assays.map((v, i) => input(prefix + "Result" + i, v, "text", 'list="protege-values" placeholder="Selecione ou digite"')).join("")}</div><div class="section-extra">${text(prefix + "Other", "Outros resultados / observações", "Detalhes do laudo, valores ou titulações")}</div></div></div>`;
  }
  function form() {
    const today = new Date();
    const local = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    return `<div class="workspace"><form id="clinical" autocomplete="off">${Notes.form("prenatal")}
      ${section(
        "Idade gestacional",
        `<div class="fields two">${input("visitDate", "Data da consulta", "date", `value="${local}"`)}<label>Calcular pela<select name="igMethod"><option value="dum">DUM</option><option value="usg">USG</option><option value="none">Não registrar idade gestacional</option></select></label></div><div data-ig="dum" class="section-extra">${input("dum", "Data da última menstruação (DUM)", "date")}</div><div data-ig="usg" class="fields section-extra">${input("usgDate", "Data da USG", "date")}${input("usgWeeks", "Semanas na USG", "number", 'min="0" max="45" step="1"')}${input("usgDays", "Dias na USG", "number", 'min="0" max="6" step="1" value="0"')}</div><output id="ig-result" class="ig-result" aria-live="polite">Preencha a referência para calcular.</output><p class="privacy">Use a referência de datação adotada pela equipe. O cálculo não escolhe nem corrige a datação clínica.</p><div class="section-extra">${select(
          "complaintStatus",
          "Queixas",
          [
            ["none", "Sem queixas no momento"],
            ["yes", "Refere queixas"],
          ],
        )}</div><div data-if="complaintStatus:yes" class="section-extra">${text("pnComplaint", "Descreva as queixas")}</div>`,
      )}
      ${section("Exame físico", `<div class="fields">${input("au", "Altura uterina · cm", "text", 'inputmode="decimal"')}${select("presentation", "Apresentação fetal", ["Cefálica", "Pélvica", "Córmica", "Não definida", "Não avaliada"])}${input("bcf", "BCF · bpm", "text", 'inputmode="numeric"')}${input("pnPa", "PA · mmHg", "text", 'inputmode="decimal" placeholder="120/80"')}${input("pnWeight", "Peso · kg", "text", 'inputmode="decimal"')}</div><div class="section-extra">${chips("pnPhysical", ["Exame físico realizado"])}</div><details class="compact-details"><summary>Outros achados do exame físico</summary>${text("physicalOther", "Achados adicionais")}</details>`)}
      ${PrenatalExams.form()}
      ${section("Exames e Protege", `<h3>Exames solicitados nesta consulta</h3>${chips("pnExams", ["1º trimestre", "2º trimestre", "3º trimestre"])}<details class="compact-details"><summary>Detalhar exames solicitados</summary>${text("pnExamOther", "Exames / observações")}</details><div class="protege-grid">${protege(1)}${protege(3)}</div><datalist id="protege-values"><option value="Não reagente"><option value="Reagente"><option value="Indeterminado"><option value="Não realizado"></datalist><p class="privacy"><a href="https://saude.se.gov.br/lacen-amplia-capacidade-diaria-de-testes-sorologicos-para-gestantes/" target="_blank" rel="noopener noreferrer">Referência dos exames do Protege · SES/SE</a></p>`)}
      ${section(
        "Medicamentos",
        `${select("medicineUse", "Em uso de medicamentos?", [
          ["yes", "Sim"],
          ["no", "Nega uso"],
        ])}<div data-if="medicineUse:yes" class="section-extra">${chips("pnUsing", medicines)}<div class="section-extra">${text("medicineOther", "Outros medicamentos / dose e posologia", "Somente o uso informado ou conferido")}</div></div><h3 class="section-extra">Medicamentos considerados para renovação</h3><p class="privacy">Selecione os medicamentos. Confirme as etapas da avaliação e da renovação no detalhamento da conduta.</p>${chips("pnRenew", medicines)}<details class="compact-details"><summary>Outros medicamentos renovados</summary>${text("renewOther", "Outros medicamentos considerados para renovação")}</details>`,
      )}
      ${section("Condutas e orientações", `${chips("pnProcedures", procedures)}<h3 class="section-extra">Orientações realizadas</h3>${chips("pnGuides", orientations)}<details class="compact-details"><summary>Outras condutas / detalhes</summary>${text("pnOther", "O que foi realizado")}</details>`)}
      ${section(
        "Próxima consulta",
        `<div class="fields">${select("returnStatus", "Retorno", [
          ["scheduled", "Consulta agendada"],
          ["advised", "Agendamento orientado"],
        ])}<div data-if="returnStatus:scheduled">${input("returnDate", "Data da próxima consulta", "date")}</div><div data-if="returnStatus:scheduled">${input("returnTime", "Horário (opcional)", "time")}</div></div><div data-if="returnStatus:scheduled" class="section-extra">${select("returnWith", "Profissional", ["Enfermagem", "Médico(a)", "Equipe multiprofissional"])}</div>`,
      )}
    </form>${outputPanel()}</div>`;
  }
  function mount() {
    const form = document.getElementById("clinical");
    PrenatalExams.mount();
    function refresh() {
      const method = form.elements.igMethod.value;
      form.querySelectorAll("[data-ig]").forEach((el) => {
        el.hidden = el.dataset.ig !== method;
        el.querySelectorAll("input").forEach((i) => (i.disabled = el.hidden));
      });
      form.querySelectorAll("[data-if]").forEach((el) => {
        const [key, value] = el.dataset.if.split(":");
        el.hidden = form.elements[key].value !== value;
        el.querySelectorAll("input,select,textarea").forEach(
          (i) => (i.disabled = el.hidden),
        );
      });
      [1, 3].forEach((n) => {
        const state = form.elements["protege" + n + "Status"].value;
        const date = form.querySelector(`[data-protege-date="${n}"]`),
          results = form.querySelector(`[data-protege-results="${n}"]`);
        date.hidden = !["collected", "pending", "available"].includes(state);
        results.hidden = state !== "available";
        [date, results].forEach((el) =>
          el
            .querySelectorAll("input,textarea")
            .forEach((i) => (i.disabled = el.hidden)),
        );
      });
      const d = Object.fromEntries(new FormData(form));
      const result = document.getElementById("ig-result");
      try {
        const a = age(d);
        result.classList.remove("invalid");
        result.textContent = a
          ? `${a.weeks} semana${a.weeks === 1 ? "" : "s"} e ${a.days} dia${a.days === 1 ? "" : "s"} · ${a.method.toUpperCase()} · em ${fmt(d.visitDate)}`
          : method === "none"
            ? "Idade gestacional não será incluída."
            : "Preencha a referência para calcular.";
      } catch (e) {
        result.classList.add("invalid");
        result.textContent = e.message;
      }
    }
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    refresh();
  }
  function renewal(names = []) {
    return (
      "Solicitada e realizada avaliação médica para renovação de medicamentos, com " +
      (names.length
        ? "renovação de " + join(names)
        : "renovação das medicações") +
      " conforme orientação médica."
    );
  }
  function compose(d) {
    const p = [];
    const a = age(d);
    if (a) {
      let reference =
        a.method === "dum"
          ? `DUM ${fmt(d.dum)}`
          : `USG de ${fmt(d.usgDate)}, com ${d.usgWeeks} semana${Number(d.usgWeeks) === 1 ? "" : "s"} e ${d.usgDays} dia${Number(d.usgDays) === 1 ? "" : "s"} no exame`;
      p.push(
        `Idade gestacional de ${a.weeks} semana${a.weeks === 1 ? "" : "s"} e ${a.days} dia${a.days === 1 ? "" : "s"} em ${fmt(d.visitDate)}, calculada pela ${reference}.`,
      );
    }
    if (d.complaintStatus === "none")
      p.push("Gestante sem queixas no momento.");
    if (d.complaintStatus === "yes")
      p.push(
        present(d.pnComplaint)
          ? sentence("Gestante refere: " + d.pnComplaint)
          : "Gestante refere queixas.",
      );
    if (d.medicineUse === "no") p.push("Gestante nega uso de medicamentos.");
    if (d.medicineUse === "yes") {
      const used = [
        ...list(d, "pnUsing"),
        ...(present(d.medicineOther) ? [d.medicineOther] : []),
      ];
      p.push(
        used.length
          ? sentence("Em uso de " + join(used))
          : "Gestante refere uso de medicamentos.",
      );
    }
    const physical = [];
    if (present(d.au)) physical.push("altura uterina " + d.au + " cm");
    if (present(d.presentation))
      physical.push("apresentação fetal " + d.presentation.toLowerCase());
    if (present(d.bcf)) physical.push("BCF " + d.bcf + " bpm");
    if (present(d.pnPa)) physical.push("PA " + d.pnPa + " mmHg");
    if (present(d.pnWeight)) physical.push("peso " + d.pnWeight + " kg");
    if (present(d.physicalOther)) physical.push(d.physicalOther);
    if (physical.length)
      p.push(sentence("Exame físico: " + physical.join("; ")));
    else if (list(d, "pnPhysical").length) p.push("Exame físico realizado.");

    for (const n of [1, 3]) {
      const prefix = "protege" + n,
        status = d[prefix + "Status"];
      if (!present(status)) continue;
      const states = {
        not: "não coletado",
        requested: "coleta solicitada",
        collected: "coletado",
        pending: "coletado, aguardando resultados",
        available: "resultados disponíveis",
      };
      if (!states[status]) throw Error("Confira a situação do Protege.");
      const date = d[prefix + "Date"];
      let dateText = "";
      if (
        present(date) &&
        ["collected", "pending", "available"].includes(status)
      ) {
        const day = dateDay(date, "data da coleta do Protege");
        if (
          present(d.visitDate) &&
          day > dateDay(d.visitDate, "data da consulta")
        )
          throw Error("A coleta do Protege não pode ser posterior à consulta.");
        dateText = " (coleta em " + fmt(date) + ")";
      }
      let s = `Protege do ${n}º trimestre: ${states[status]}${dateText}`;
      if (status === "available") {
        const results = assays.flatMap((name, i) =>
          present(d[prefix + "Result" + i])
            ? [name + ": " + d[prefix + "Result" + i]]
            : [],
        );
        if (present(d[prefix + "Other"])) results.push(d[prefix + "Other"]);
        if (results.length) s += "; " + results.join(" | ");
      }
      p.push(sentence(s));
    }
    const examText = PrenatalExams.compose(d);
    if (examText) p.push(examText);
    const renewed = [
      ...list(d, "pnRenew"),
      ...(present(d.renewOther) ? [d.renewOther] : []),
    ];
    const exams = list(d, "pnExams");
    if (exams.length)
      p.push("Solicitados exames referentes ao " + join(exams) + ".");
    if (present(d.pnExamOther))
      p.push(sentence("Exames solicitados: " + d.pnExamOther));
    const renewalText = Care.renewalText(d, renewed);
    if (renewalText) p.push(renewalText);
    if (d.referralDetails)
      p.push(sentence("Encaminhamento: " + d.referralDetails));
    p.push(
      ...list(d, "pnProcedures")
        .filter(
          (v) =>
            v !== "Acompanhamento pré-natal mantido" &&
            !(d.medicalRequested === "Sim" && v === "Avaliação médica solicitada"),
        )
        .map(sentence),
    );
    const guides = list(d, "pnGuides");
    if (guides.length)
      p.push(
        sentence(
          "Realizadas orientações sobre " +
            join(guides.map((v) => v.toLowerCase())),
        ),
      );
    if (present(d.pnOther)) p.push(sentence(d.pnOther));
    if (d.returnStatus === "scheduled") {
      if (present(d.returnTime) && !present(d.returnDate))
        throw Error("Informe a data da próxima consulta junto ao horário.");
      if (present(d.returnDate)) {
        const date = dateDay(d.returnDate, "data de retorno");
        if (
          present(d.visitDate) &&
          date < dateDay(d.visitDate, "data da consulta")
        )
          throw Error("O retorno não pode ser anterior à consulta.");
      }
      p.push(
        "Próxima consulta agendada" +
          (present(d.returnDate) ? " para " + fmt(d.returnDate) : "") +
          (present(d.returnTime) ? " às " + d.returnTime : "") +
          (present(d.returnWith) ? " com " + d.returnWith.toLowerCase() : "") +
          ".",
      );
    } else if (d.returnStatus === "advised")
      p.push("Orientado agendamento da próxima consulta de pré-natal.");
    if (
      !p.length &&
      !list(d, "pnProcedures").includes("Acompanhamento pré-natal mantido")
    )
      throw Error(
        "Preencha ou selecione ao menos uma informação do pré-natal.",
      );
    if (list(d, "pnProcedures").includes("Acompanhamento pré-natal mantido"))
      p.push("Mantido acompanhamento pré-natal.");
    return [Notes.opening(d, "prenatal"), ...unique(p)].join(" ");
  }
  return { form, mount, compose, age, renewal };
})();
