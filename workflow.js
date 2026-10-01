/* Local documentary preview. Never changes clinical answers or calls a server. */
const LiveReview = (() => {
  let timer;
  const q = s => document.querySelector(s);
  function entries() {
    return [...(q('#clinical')?.querySelectorAll('input,select,textarea') || [])]
      .filter(x => !(page === "occupational" && (x.closest("[data-session][hidden]") || x.closest("section[hidden]"))) && x.name && !x.disabled && x.value.trim() && (!['checkbox','radio'].includes(x.type) || x.checked))
      .map(x => ({el:x,key:x.name.split(':').slice(0,2).join(':'),value:x.value.trim(),label:[...(x.closest('label')?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ') || x.name}));
  }
  function inspect(d, p) {
    const issues=p==='occupational'?Occupational.issues(d):p==='child'?ChildCare.issues(d):[];
    const add=(message,keys,values=[])=>issues.push({message,keys,values});
    const states=[...(d['c:state']||[]),...(d['c:evaluation']||[])];
    if(states.includes('Sem queixas no momento') && (d.complaint || states.some(v=>['Queixa principal','Refere queixas','Apresenta queixa'].includes(v))))
      add('Há registro de ausência de queixas e de queixa presente. Confira o relato e desmarque a opção incompatível ou revise a queixa.', ['c:state','c:evaluation','complaint'],['Sem queixas no momento','Queixa principal','Refere queixas','Apresenta queixa',d.complaint].filter(Boolean));
    for(const pair of [['Bom estado geral','Regular estado geral'],['Deambulando','Restrito ao leito']])
      if(pair.every(v=>states.includes(v)))add('Foram selecionados estados incompatíveis. Mantenha apenas o que foi observado.', ['c:state','c:evaluation'],pair);
    if(d.complaintStatus==='none' && d.pnComplaint)add('Ausência de queixas e queixa descrita: revise a seleção ou a descrição.', ['complaintStatus','pnComplaint']);
    if(d.pregnancyTest==='Positivo' && d.pregnancyAssessment==='Razoável certeza de ausência de gestação')add('Teste positivo e conclusão de ausência de gestação: revise os dois registros.', ['pregnancyTest','pregnancyAssessment']);
    if(d.renewDone==='Sim' && d.medicalDone!=='Sim')add('A renovação está confirmada sem avaliação médica realizada. Confira a avaliação ou altere a situação da renovação.', ['renewDone','medicalDone']);
    if(d.medicalRequested==='Não' && d.medicalDone==='Sim')add('A solicitação e a realização da avaliação médica estão incompatíveis. Revise essas etapas.', ['medicalRequested','medicalDone']);
    if(d.g && ((d.p && +d.p>+d.g)||(d.a && +d.a>+d.g)||(d.p&&d.a&&+d.p + +d.a > +d.g)))add('G/P/A incompatíveis: confira os números de gestações, partos e abortamentos.', ['g','p','a']);
    if(d.outcome==='Inserção concluída') {
      if(['Inserção adiada','Paciente optou por não prosseguir'].includes(d.plan))add('A inserção concluída contradiz o planejamento informado. Revise o resultado ou o planejamento.', ['outcome','plan']);
      if(d.consent==='Paciente não consentiu' || ['Prefere outro método','Não deseja prosseguir'].includes(d.choice))add('A inserção concluída está incompatível com a decisão ou o consentimento. Confira o registro do atendimento.', ['outcome','consent','choice']);
    }
    if(d.requestStatus==='Inserção agendada' && (d.consent==='Paciente não consentiu neste momento'||['Não deseja prosseguir no momento','Prefere outro método'].includes(d.decision)))add('Agendamento incompatível com a decisão ou o consentimento registrados. Revise os campos.', ['requestStatus','consent','decision']);
    for(const key of ['menarche','sexarche'])if(d[key]&&d.age&&+d[key]>+d.age)add('O antecedente não pode ter idade maior que a idade atual informada. Confira os valores.', [key,'age']);
    const encounter=d.visitDate||d.recordDate;
    for(const key of ['returnDate','scheduledDate','followDate'])if(d[key]&&encounter&&d[key]<encounter)add('A data de retorno ou agendamento é anterior ao atendimento. Confira ambas as datas.', [key,d.visitDate?'visitDate':'recordDate']);
    const found=Object.keys(d).filter(k=>k.startsWith('epf_')&&d[k]);
    if(d.epfStatus==='Não encontrados na amostra examinada' && (found.length||d.epfOther))add('O EPF está negativo, mas há organismos registrados. Confira o laudo e revise o resultado ou os achados.', ['epfStatus',...found,'epfOther']);
    if(p==='renewal')for(const r of Renewal.rows(d,'req')) {
      if(r.result.startsWith('Renovado') && (d.medicalDone!=='Sim'||d.medicalRequested!=='Sim'))add('Renovação de '+r.name+' sem confirmação das etapas médicas. Revise a avaliação ou o resultado deste medicamento.',[r.prefix+'result','medicalRequested','medicalDone']);
    }
    return issues;
  }
  function focusField(key) {
    const field=[...q('#clinical').elements].find(x=>x.name===key || x.name.startsWith(key+':'));
    if(!field)return;
    Flow.view('form');
    for(let n=field;n&&n!==q('#clinical');n=n.parentElement){if(n.tagName==='DETAILS')n.open=true;if(n.classList?.contains('section-body'))n.hidden=false;}
    field.closest('section')?.querySelector('.section-toggle')?.setAttribute('aria-expanded','true');
    field.focus();field.scrollIntoView({block:'center'});
  }
  function analyzeText(text) {
    // Conservative lexical checks, always presented as possible conflicts.
    const issues=[];
    for(const [a,b] of [[/\bsem queixas(?: no momento)?/i,/\b(?:refere|apresenta) (?:como queixa principal|queixas?|dor\b)[^.!?\n]*/i],[/\bafebril\b/i,/\bfebril\b/i]]){
      const left=text.match(a),right=text.match(b);
      if(left&&right && !/(?:não|nega)\s*$/i.test(text.slice(Math.max(0,right.index-12),right.index)))issues.push({message:'Possível incoerência no texto: “'+left[0]+'” e “'+right[0]+'”. Confira o contexto e ajuste manualmente.',keys:[],values:[left[0],right[0]]});
    }
    return issues;
  }
  function painted(text,terms) {
    const clean=[...new Set(terms.filter(Boolean))].sort((a,b)=>b.length-a.length);
    if(!clean.length)return esc(text);
    const re=new RegExp(clean.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');
    let html='',start=0;
    for(const m of text.matchAll(re)){html+=esc(text.slice(start,m.index))+'<mark class="incoherent">'+esc(m[0])+'</mark>';start=m.index+m[0].length;}
    return html+esc(text.slice(start));
  }
  function update() {
    clearTimeout(timer);
    const form=q('#clinical'),box=q('#live-preview'),out=q('#output');
    if(!form||!box)return {issues:[]};
    const d=Care.normalize(Flow.data()), rows=entries(), issues=inspect(d,page);
    let text='',failure;
    try{text=compose(d,page);}catch(e){failure=e;}
    const meaningful=rows.some(r=>!['recordDate','recordSetting','visitDate','encounterSetting','encounterReason','mode','igMethod','usgDays'].includes(r.key));
    if(failure && meaningful && !issues.some(i=>i.message===failure.message))issues.push({message:failure.message,keys:failure.field?[failure.field]:[],values:[]});
    if(text)for(const issue of analyzeText(text)){
      issue.keys=[...new Set(rows.filter(r=>issue.values.some(v=>r.value.toLowerCase().includes(v.toLowerCase())||v.toLowerCase().includes(r.value.toLowerCase()))).map(r=>r.key))];
      issues.push(issue);
    }
    const partial=!!failure;
    if (failure) {
      // Keep incomplete answers visible; do not invent a clinical conclusion.
      text = meaningful ? rows.map(r => r.label + ': ' + r.value + '.').join('\n') : '';
    }
    const manual=out.dataset.manual==='true';
    if(!manual) {
      out.value=text;out.dataset.baseline=text;out.dataset.stale='false';
    } else out.dataset.stale=String(text!==out.dataset.baseline);
    const manualIssues=manual?analyzeText(out.value):[];
    issues.push(...manualIssues);
    const terms=issues.flatMap(i=>i.values?.length?i.values:rows.filter(r=>i.keys.includes(r.key)).map(r=>r.value));
    box.innerHTML=painted(out.value,terms)+'\n';
    box.scrollTop=out.scrollTop;
    q('#editor-mode').textContent=manual?'Edição manual':'Automático';
    q('#live-heading').textContent=issues.length ? issues.length+' ponto(s) para revisar — opcional' : 'Nenhum conflito identificado';
    q('#review-details').hidden=!issues.length;
    q('#live-issues').replaceChildren();
    form.querySelectorAll('.live-conflict').forEach(el=>el.classList.remove('live-conflict'));
    for(const issue of issues) {
      const item=document.createElement('div');item.className='live-issue';
      const message=document.createElement('p');message.textContent='Revisar: '+issue.message;item.append(message);
      for(const key of issue.keys){
        const fields=[...form.elements].filter(x=>x.name===key||x.name.startsWith(key+':'));
        fields.filter(x=>!issue.values.length||issue.values.includes(x.value)).forEach(x=>x.closest('label')?.classList.add('live-conflict'));
        if(fields.length){const b=document.createElement('button');b.type='button';b.textContent='Revisar '+(rows.find(r=>r.key===key)?.label||fields[0].closest('label')?.childNodes[0]?.textContent||key);b.onclick=()=>focusField(key);item.append(b);}
      }
      const candidates=rows.filter(r=>issue.keys.includes(r.key)&&r.el.type==='checkbox'&&(!issue.values.length||issue.values.includes(r.value)));
      for(const r of candidates){const b=document.createElement('button');b.type='button';b.textContent='Desmarcar “'+r.value+'”';b.onclick=()=>{r.el.checked=false;r.el.dispatchEvent(new Event('change',{bubbles:true}));update();};item.append(b);}
      q('#live-issues').append(item);
    }
    q('#live-status').textContent=manual ? (out.dataset.stale==='true'?'Formulário alterado. Sua edição foi preservada; use Retomar automático se desejar.':'Sua edição está preservada.') : partial?'Texto parcial: confira os campos indicados. Você pode continuar e copiar.':'Atualizado automaticamente. Revise antes de copiar.';
    Flow.updateStatus();
    return {issues,manualIssues,text,partial};
  }
  function schedule(){const form=q('#clinical');clearTimeout(timer);timer=setTimeout(()=>{if(q('#clinical')===form)update();},180);}
  async function resume(){
    const out=q('#output');
    if(out.dataset.manual==='true') {
      const choice=await Flow.dialog('Retomar atualização automática?', 'Sua edição manual será substituída pelo texto dos campos. Uma cópia ficará no histórico desta sessão.', [['cancel','Manter minha edição'],['replace','Retomar automático']]);
      if(choice!=='replace')return;
      if(out.value.trim())saveHistory(out.value);
    }
    out.dataset.manual='false';update();collect();
  }
  function mount(){
    const out=q('#output');
    out.addEventListener('input',schedule);
    out.addEventListener('scroll',()=>{q('#live-preview').scrollTop=out.scrollTop;q('#live-preview').scrollLeft=out.scrollLeft;});
    update();
  }
  return {mount,update,schedule,inspect,analyzeText,resume};
})();
const Flow = (() => {
  let undo = null,
    rxDirty = false,
    busy = false,
    initial = "";
  const q = (s) => document.querySelector(s),
    clone = (v) => JSON.parse(JSON.stringify(v));
  function dialog(title, message, buttons, comparison) {
    return new Promise((resolve) => {
      const el = document.createElement("dialog");
      el.className = "review-dialog";
      el.setAttribute("aria-labelledby", "dialog-title");
      const h = document.createElement("h2");
      h.id = "dialog-title";
      h.textContent = title;
      const p = document.createElement("p");
      p.textContent = message;
      el.append(h, p);
      if (comparison) {
        const cols = document.createElement("div");
        cols.className = "compare-texts";
        for (const [label, text] of comparison) {
          const l = document.createElement("label");
          l.textContent = label;
          const t = document.createElement("textarea");
          t.readOnly = true;
          t.value = text;
          l.append(t);
          cols.append(l);
        }
        el.append(cols);
      }
      const actions = document.createElement("div");
      actions.className = "actions";
      for (const [id, label] of buttons) {
        const b = document.createElement("button");
        b.textContent = label;
        b.onclick = () => el.close(id);
        actions.append(b);
      }
      el.append(actions);
      document.body.append(el);
      el.addEventListener(
        "close",
        () => {
          const answer = el.returnValue;
          el.remove();
          resolve(answer);
        },
        { once: true },
      );
      el.showModal();
    });
  }
  function data() {
    const d = {};
    const form = q("#clinical");
    if (!form) return d;
    new FormData(form).forEach((v, k) => {
      if (k.startsWith("c:"))
        (d[k.split(":").slice(0, 2).join(":")] ??= []).push(v);
      else d[k] = v;
    });
    return d;
  }
  function snapshot() {
    return JSON.stringify(data());
  }
  function state() {
    const out = q("#output");
    return out
      ? {
          output: out.value,
          stale: out.dataset.stale === "true",
          manual: out.dataset.manual === "true",
        }
      : {};
  }
  function changed() {
    const out = q("#output");
    if (out?.value.trim()) out.dataset.stale = "true";
    updateStatus();
    summaries();
    clearError();
    LiveReview.schedule();
  }
  function updateStatus() {
    const s = q("#output-status");
    if (s)
      s.textContent = q("#output").value.length + " caracteres · " + (q("#output").dataset.manual === "true" ? "edição manual preservada" : "atualização automática");
  }
  function showError(e) {
    clearError();
    view("form");
    const form = q("#clinical");
    const box = document.createElement("p");
    box.id = "form-error";
    box.className = "error-summary";
    box.setAttribute("role", "alert");
    box.textContent = e.message;
    form.prepend(box);
    let field = e.field ? form.elements.namedItem(e.field) : null;
    if (field && typeof field.focus === "function") {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", "form-error");
      reveal(field);
      field.focus();
      field.scrollIntoView({ block: "center" });
    } else box.scrollIntoView({ block: "center" });
  }
  function clearError() {
    q("#form-error")?.remove();
    q("#clinical")
      ?.querySelectorAll("[aria-invalid]")
      .forEach((x) => {
        x.removeAttribute("aria-invalid");
        x.removeAttribute("aria-describedby");
      });
  }
  async function generate() {
    LiveReview.update();
    const text=q('#output').value;
    if(!text.trim()){toast('Preencha um campo ou escreva no texto.');return false;}
    collect();saveHistory(text);toast('Texto guardado no histórico desta sessão.');return true;
  }
  async function copyCurrent() {
    LiveReview.update();
    const text=q('#output').value;
    if(!text.trim())return toast('Preencha um campo ou escreva no texto.');
    collect();saveHistory(text);await copy(text);
  }
  async function clear() {
    collect();
    if (!Care.meaningful(drafts[page]) && snapshot() === initial) return;
    const current = page;
    if (
      (await dialog(
        "Limpar este módulo?",
        "O preenchimento e o texto serão removidos. Você poderá desfazer durante esta sessão.",
        [
          ["no", "Cancelar"],
          ["yes", "Limpar módulo"],
        ],
      )) !== "yes"
    )
      return;
    undo = { page: current, draft: clone(drafts[current]) };
    delete drafts[current];
    render();
    toast("Módulo limpo. Use Desfazer limpeza para recuperar.");
  }
  async function undoClear() {
    if (!undo) return;
    collect();
    if (
      Care.meaningful(drafts[undo.page]) &&
      (await dialog(
        "Recuperar preenchimento anterior?",
        "Isso substituirá o rascunho atual deste módulo.",
        [
          ["no", "Cancelar"],
          ["yes", "Recuperar"],
        ],
      )) !== "yes"
    )
      return;
    drafts[undo.page] = undo.draft;
    page = undo.page;
    undo = null;
    render();
  }
  function hasData() {
    collect();
    return (
      rxDirty ||
      history.length > 0 ||
      !!undo ||
      Object.values(drafts).some(Care.meaningful) ||
      (q("#clinical") && snapshot() !== initial)
    );
  }
  async function end(logout = false) {
    if (
      hasData() &&
      (await dialog(
        logout ? "Encerrar sessão?" : "Iniciar novo atendimento?",
        "Serão apagados todos os módulos, textos, histórico e dados do receituário desta sessão. Cópias e arquivos já exportados permanecem fora da plataforma.",
        [
          ["no", "Cancelar"],
          ["yes", logout ? "Sair e apagar" : "Iniciar novo atendimento"],
        ],
      )) !== "yes"
    )
      return;
    drafts = {};
    history = [];
    extraCount = 0;
    undo = null;
    rxDirty = false;
    initial = "";
    destroyReceituario();
    page = "home";
    if (logout) {
      logged = false;
      if (typeof Access !== "undefined") await Access.signOut();
      else login();
    } else render();
  }
  function reveal(el) {
    let node = el;
    while (node && node !== q("#clinical")) {
      if (node.tagName === "DETAILS") node.open = true;
      if (node.classList?.contains("section-body")) node.hidden = false;
      node = node.parentElement;
    }
    const section = el.closest("section");
    section
      ?.querySelector(".section-toggle")
      ?.setAttribute("aria-expanded", "true");
  }
  function view(v) {
    const work = q(".workspace");
    if (!work) return;
    work.dataset.view = v;
    q("#view-form")?.setAttribute("aria-pressed", String(v === "form"));
    q("#view-text")?.setAttribute("aria-pressed", String(v === "text"));
    (v === "text" ? q(".result") : q("#clinical"))?.scrollIntoView({
      block: "start",
    });
  }
  function addFields() {
    const form = q("#clinical");
    if (!form || form.querySelector("[name=recordDate]")) return;
    const today = new Date();
    const local = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const group = document.createElement("section");
    group.className = "panel";
    group.innerHTML =
      '<h2>Identificação do atendimento</h2><div class="fields two">' +
      (form.elements.visitDate || page === "lab"
        ? ""
        : `<label>Data do atendimento<input type="date" name="recordDate" value="${local}"></label>`) +
      (form.elements.professional
        ? ""
        : `<label>Profissional responsável / registro<input name="recordProfessional" autocomplete="off"></label>`) +
      (!form.elements.encounterSetting
        ? `<label>Local do atendimento<select name="recordSetting"><option value="">Na unidade</option><option>No domicílio</option><option>À beira do leito</option><option>Sem especificar o local</option></select></label>`
        : "") +
      "</div>";
    if (page !== "lab") form.prepend(group);
    if (["general", "has", "dm", "both", "prenatal"].includes(page)) {
      const panel = document.createElement("section");
      panel.className = "panel";
      panel.innerHTML =
        '<h2>Detalhamento da conduta</h2><div class="fields two">' +
        [
          ["medicalRequested", "Avaliação médica solicitada"],
          ["medicalDone", "Avaliação médica realizada"],
          ["renewDone", "Renovação efetivada conforme orientação médica"],
        ]
          .map(
            ([k, l]) =>
              `<label>${l}<select name="${k}"><option value="">Não informado</option><option>Sim</option><option>Não</option></select></label>`,
          )
          .join("") +
        '<label class="wide">Medicamentos renovados / orientação médica<textarea name="renewedDetails" rows="2"></textarea></label>' +
        (["has", "dm", "both"].includes(page)
          ? '<label class="wide">Barreiras à adesão relatadas<textarea name="adherenceBarriers" rows="2"></textarea></label>'
          : "") +
        '<label class="wide">Destino e motivo do encaminhamento<textarea name="referralDetails" rows="2"></textarea></label></div>';
      form.append(panel);
      if (page === "general") {
        panel.insertAdjacentHTML(
          "beforeend",
          '<div id="admin-fields" class="fields two section-extra" hidden>' +
            [
              ["adminDrug", "Medicamento administrado"],
              ["adminDose", "Dose"],
              ["adminRoute", "Via"],
              ["adminTime", "Horário"],
            ]
              .map(
                ([k, l]) =>
                  `<label>${l}<input name="${k}" ${k === "adminTime" ? 'type="time"' : ""} autocomplete="off"></label>`,
              )
              .join("") +
            '<label class="wide">Observações da administração<textarea name="adminNotes" rows="2"></textarea></label></div>',
        );
      }
      if (page !== "prenatal") {
        panel.insertAdjacentHTML(
          "beforeend",
          '<div class="fields two section-extra"><label>Retorno<select name="followStatus"><option value="">Não informado</option><option>Orientado</option><option>Agendado</option></select></label><label>Data do retorno<input type="date" name="followDate"></label><label class="wide">Finalidade / horário / local<input name="followDetails" autocomplete="off"></label></div>',
        );
      }
    }
  }
  function mount() {
    const form = q("#clinical");
    if (!form) return;
    initial = snapshot();
    const output = q("#output");
    output.dataset.manual = drafts[page]?.manual ? "true" : "false";
    output.dataset.baseline = drafts[page]?.baseline || output.value;
    const status = document.createElement("p");
    status.id = "output-status";
    status.setAttribute("role", "status");
    status.className = "privacy";
    output.after(status);
    output.addEventListener("input", () => {
      output.dataset.manual = String(output.value !== output.dataset.baseline);
      updateStatus();
    });
    const sections = [...(page === "occupational" ? form.querySelectorAll("section.panel") : form.children)].filter((x) =>
      x.matches("section,details"),
    );
    const toolbar = document.createElement("div");
    toolbar.className = "form-tools";
    toolbar.innerHTML =
      '<div class="view-switch"><button type="button" id="view-form" aria-pressed="true">Formulário</button><button type="button" id="view-text" aria-pressed="false">Texto</button></div><label>Buscar campo<input id="form-search" type="search" placeholder="Ex.: DUM, lote, retorno"></label><label>Ir para seção<select id="section-picker"><option value="">Selecione uma seção</option></select></label><p id="search-status" role="status"></p>';
    form.before(toolbar);
    toolbar.style.gridColumn = "1 / -1";
    q("#view-form").onclick = () => view("form");
    q("#view-text").onclick = () => view("text");
    q(".workspace").dataset.view = "form";
    sections.forEach((el, i) => {
      el.id = "form-section-" + i;
      const title = el.querySelector("h2,summary");
      if (!title) return;
      const label = title.textContent;
      const option = document.createElement("option");
      option.value = el.id;
      option.textContent = label;
      q("#section-picker").append(option);
      if (el.tagName === "SECTION") {
        const body = document.createElement("div");
        body.className = "section-body";
        for (const child of [...el.children])
          if (child !== title) body.append(child);
        el.append(body);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "section-toggle";
        b.textContent = label;
        const count = document.createElement("span");
        count.className = "section-count";
        b.append(count);
        title.replaceChildren(b);
        const collapsed = (["diu", "implante"].includes(page) && i > 2) || (page === "occupational" && i > 3);
        body.hidden = collapsed;
        b.setAttribute("aria-expanded", String(!collapsed));
        b.onclick = () => {
          body.hidden = !body.hidden;
          b.setAttribute("aria-expanded", String(!body.hidden));
        };
      }
    });
    q("#section-picker").onchange = (e) => {
      const target = document.getElementById(e.target.value);
      if (target) {
        view("form");
        if (target.tagName === "DETAILS") target.open = true;
        const b = target.querySelector(".section-body");
        if (b) {
          b.hidden = false;
          target
            .querySelector(".section-toggle")
            .setAttribute("aria-expanded", "true");
        }
        target.scrollIntoView({ block: "start" });
      }
    };
    q("#form-search").oninput = (e) => {
      const term = e.target.value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
      form
        .querySelectorAll(".search-match")
        .forEach((x) => x.classList.remove("search-match"));
      if (!term) {
        q("#search-status").textContent = "";
        return;
      }
      let count = 0;
      for (const label of form.querySelectorAll("label")) {
        if (label.closest("[hidden]:not(.section-body)")) continue;
        const text = [...label.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(" ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
        if (text.includes(term)) {
          reveal(label);
          label.classList.add("search-match");
          count++;
        }
      }
      q("#search-status").textContent = count
        ? count + " campo(s) destacado(s)."
        : "Nenhum campo disponível encontrado.";
    };
    function refresh() {
      const admin = q("#admin-fields");
      if (admin) {
        const checked = [
          ...form.querySelectorAll('input[name="c:actions"]:checked'),
        ].some((x) => x.value === "Medicação administrada");
        admin.hidden = !checked;
        admin
          .querySelectorAll("input,textarea")
          .forEach((x) => (x.disabled = !checked));
      }
      for (const name of ["renewedDetails", "followDate"]) {
        const el = form.elements[name];
        if (el) {
          const enable =
            name === "renewedDetails"
              ? form.elements.renewDone.value === "Sim"
              : form.elements.followStatus.value === "Agendado";
          el.disabled = !enable;
          el.closest("label").hidden = !enable;
        }
      }
      for (const option of q("#section-picker").options) {
        if (option.value)
          option.hidden = document.getElementById(option.value).hidden;
      }
      summaries();
    }
    form.addEventListener("input", changed);
    form.addEventListener("change", () => {
      refresh();
      changed();
    });
    refresh();
    initial = snapshot();
    const bar = document.createElement("div");
    bar.className = "mobile-actions";
    bar.innerHTML = '<button type="button" class="primary" id="mobile-generate">Copiar texto</button><button type="button" id="mobile-review">Ver evolução</button>';
    q('.workspace').after(bar);
    q('#mobile-generate').onclick = copyCurrent;
    q("#mobile-review").onclick = () => view("text");
    form.addEventListener("keydown", async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        await copyCurrent();
      }
    });
    updateStatus();
    LiveReview.mount();
  }
  function summaries() {
    if (page === "implante") {
      let summary = q("#request-summary");
      if (!summary) {
        summary = document.createElement("p");
        summary.id = "request-summary";
        summary.className = "privacy";
        q(".form-tools")?.append(summary);
      }
      const d = data();
      summary.textContent =
        "Solicitação: " +
        (d.requestStatus || "não informada") +
        " · Consentimento: " +
        (d.consent || "não informado") +
        " · Retorno: " +
        (d.returnDate
          ? d.returnDate.split("-").reverse().join("/")
          : "não informado");
    }
    q("#clinical")
      ?.querySelectorAll("section")
      .forEach((section) => {
        const count = [
          ...section.querySelectorAll("input,textarea,select"),
        ].filter(
          (x) =>
            !x.disabled &&
            (x.type === "checkbox" || x.type === "radio"
              ? x.checked
              : !!x.value),
        ).length;
        const badge = section.querySelector(".section-count");
        if (badge) badge.textContent = count ? count + " preenchido(s)" : "";
      });
  }
  function shell() {
    const target = q(".session");
    if (target) {
      const b = document.createElement("button");
      b.id = "new-encounter";
      b.textContent = "Novo atendimento";
      b.onclick = () => end(false);
      target.prepend(b);
    }
    if (undo) {
      const b = document.createElement("button");
      b.id = "undo-clear";
      b.textContent = "Desfazer limpeza";
      b.onclick = undoClear;
      q("#workspace-main")?.prepend(b);
    }
    const foot = document.createElement("p");
    foot.className = "app-version";
    foot.textContent =
      "EQUIPE 027 · v" +
      Care.version +
      " · Revisão clínica institucional pendente";
    q("#workspace-main")?.append(foot);
  }
  function setRxDirty(value) {
    rxDirty = value;
  }
  function reset() {
    undo = null;
    rxDirty = false;
    initial = "";
  }
  return {
    dialog,
    data,
    generate,
    copyCurrent,
    clear,
    end,
    hasData,
    addFields,
    mount,
    shell,
    changed,
    view,
    updateStatus,
    setRxDirty,
    reset,
  };
})();
window.addEventListener("beforeunload", (e) => {
  if (logged && Flow.hasData()) {
    e.preventDefault();
    e.returnValue = "";
  }
});
const updateKeyboard = () => {
  const focused = document.activeElement;
  const typing = focused?.matches(
    "textarea,input:not([type=checkbox]):not([type=radio]):not([type=date]):not([type=time])",
  );
  document.body.classList.toggle(
    "keyboard-open",
    !!typing &&
      !!window.visualViewport &&
      window.innerHeight - window.visualViewport.height > 140,
  );
};
window.visualViewport?.addEventListener("resize", updateKeyboard);
document.addEventListener("focusin", updateKeyboard);
document.addEventListener("focusout", () => setTimeout(updateKeyboard, 0));

window.addEventListener("message", (e) => {
  const frame = document.querySelector("#rx-frame");
  if (
    e.origin === location.origin &&
    frame &&
    e.source === frame.contentWindow &&
    e.data?.type === "rx-dirty"
  )
    Flow.setRxDirty(e.data.dirty === true);
});
