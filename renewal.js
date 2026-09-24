/* Documentary renewal workflow. No drug/dose recommendations or stock promises. */
const Renewal = (() => {
  const requested = ['Glifage XR','Sinvastatina','Rosuvastatina','Insulina','Insulina NPH','Clonazepam','Sertralina','Escitalopram','Risperidona','Amitriptilina'];
  const municipal = ['Losartana potássica','Ácido fólico','Pregabalina'];
  const keys = ['name','strength','strengthUnit','dose','doseUnit','frequency','route','schedule','result','newRegimen'];
  const val = (d,k) => String(d[k] || '').trim();
  const select = (name,label,options) => `<label>${label}<select name="${name}"><option value="">Não informado</option>${options.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>`;
  const input = (name,label,extra='') => `<label>${label}<input name="${name}" autocomplete="off" ${extra}></label>`;
  const groups = ['req','muc'];
  function ids(d,group) {
    return [...new Set(Object.keys(d||{}).map(k=>k.match(new RegExp('^'+group+'_(\\d+)_'))?.[1]).filter(Boolean))].map(Number).sort((a,b)=>a-b);
  }
  function row(group,id) {
    const p=`${group}_${id}_`;
    return `<fieldset class="medicine-row" data-med-group="${group}" data-med-id="${id}"><legend>${group==='req'?'Solicitação':'MUC'} · medicamento ${id}</legend><div class="fields two">${input(p+'name','Medicamento / tipo de insulina','list="renewal-drugs" placeholder="Selecione ou digite o nome"')}${input(p+'strength','Concentração / apresentação','placeholder="Conforme receita ou embalagem"')}${select(p+'strengthUnit','Unidade da concentração',['mg','mcg','mg/mL','mcg/mL','UI/mL','%','g'])}${input(p+'dose','Quantidade por tomada','inputmode="decimal" placeholder="Quantidade prescrita"')}${select(p+'doseUnit','Unidade da tomada',['mg','mcg','mL','UI','comprimido(s)','cápsula(s)','gota(s)','dose(s)'])}${input(p+'frequency','Frequência','list="renewal-frequency" placeholder="Vezes ao dia ou intervalo"')}${input(p+'route','Via de administração','list="renewal-routes"')}${input(p+'schedule','Horários / esquema / observações','placeholder="Ex.: doses diferentes por horário, conforme receita"')}</div>${group==='req'?`<div class="fields two section-extra">${select(p+'result','Resultado da solicitação',['Renovado sem alteração','Renovado com alteração','Não renovado','Aguardando avaliação'])}<label>Nova prescrição / motivo / encaminhamento<textarea name="${p}newRegimen" rows="2" placeholder="Se houve alteração, transcreva o esquema completo renovado"></textarea></label></div>`:''}<button type="button" class="remove-medicine" aria-label="Remover ${group==='req'?'solicitação':'MUC'} medicamento ${id}">Remover medicamento</button></fieldset>`;
  }
  function groupForm(group,title) {
    const existing=ids(drafts.renewal||{},group);
    return section(title,`<p class="privacy">${group==='req'?'Registre o medicamento e o esquema cuja renovação foi solicitada.':'Registre separadamente os medicamentos em uso (MUC), conforme informação obtida no atendimento.'} Concentração e quantidade por tomada são campos diferentes. Nenhuma dose é sugerida.</p><div class="medicine-shortcuts" aria-label="Atalhos ${title}">${requested.map(n=>`<button type="button" data-med-add="${group}" data-drug="${esc(n)}">+ ${esc(n)}</button>`).join('')}</div><details class="section-extra"><summary>Outros nomes e fonte municipal</summary><p class="privacy">Nomes encontrados em registros públicos municipais: não confirmam estoque atual na UBS Dr. Davi Marcos de Lima. Os atalhos acima foram solicitados pela equipe.</p><div class="medicine-shortcuts">${municipal.map(n=>`<button type="button" data-med-add="${group}" data-drug="${esc(n)}">+ ${esc(n)}</button>`).join('')}</div><a href="https://saude.lagarto.se.gov.br/lista-de-medicamentos" target="_blank" rel="noopener noreferrer">Consultar lista municipal ↗</a></details><div id="med-${group}">${(existing.length?existing:[1]).map(id=>row(group,id)).join('')}</div><button type="button" data-med-add="${group}">+ Outro medicamento</button>`);
  }
  function form() {
    return `<div class="workspace"><form id="clinical">${groupForm('req','Medicamentos solicitados para renovação')}${groupForm('muc','MUC · medicamentos em uso')}${section('Avaliação e decisão médica',`<div class="fields two">${select('medicalRequested','Avaliação médica solicitada',['Sim','Não'])}${select('medicalDone','Avaliação médica realizada',['Sim','Não'])}${input('renewPhysician','Médico responsável / registro')}${input('prescriptionDate','Data da prescrição renovada','type="date"')}</div><p class="privacy">Marque o resultado de cada medicamento. A solicitação, a avaliação e a renovação não são confirmadas automaticamente.</p><button type="button" id="renew-all">Marcar todos os solicitados como renovados sem alteração</button><label class="section-extra">Registro da avaliação / conduta médica<textarea name="renewAssessment" rows="3"></textarea></label>`)}${section('Informações do atendimento',`<div class="fields two">${input('renewReason','Motivo da renovação / contexto')}${input('renewComplaints','Queixas relatadas')}${input('renewAllergies','Alergias informadas')}${select('renewSource','Fonte das informações sobre medicamentos',['Relato do paciente','Relato do acompanhante','Receita apresentada','Receita e relato conferidos'])}</div><label class="section-extra">Outras informações relevantes<textarea name="renewOther" rows="2"></textarea></label>`)}${section('Orientações e retorno',`${chips('renewGuides',['Uso conforme prescrição médica','Conferência da receita e das doses','Não alterar ou interromper medicamentos por conta própria','Seguimento com a equipe de referência'])}<label class="section-extra">Outras orientações realizadas<textarea name="renewGuidance" rows="2"></textarea></label><div class="fields two section-extra">${select('followStatus','Retorno',['Orientado','Agendado'])}${input('followDate','Data do retorno','type="date"')}${input('followDetails','Finalidade / horário / local')}</div>`)}</form>${outputPanel()}<datalist id="renewal-drugs">${[...requested,...municipal].map(n=>`<option value="${esc(n)}">`).join('')}</datalist><datalist id="renewal-frequency">${['1 vez ao dia','2 vezes ao dia','3 vezes ao dia','4 vezes ao dia','A cada 12 horas','A cada 8 horas','A cada 6 horas','Conforme esquema descrito'].map(n=>`<option value="${n}">`).join('')}</datalist><datalist id="renewal-routes"><option value="Oral"><option value="Subcutânea"><option value="Inalatória"><option value="Tópica"><option value="Intramuscular"></datalist></div>`;
  }
  function mount() {
    const f=document.querySelector('#clinical');
    function bind(el) {
      el.querySelector('.remove-medicine').onclick=async()=>{
        const filled=[...el.querySelectorAll('input,select,textarea')].some(x=>x.value.trim());
        if(filled && await Flow.dialog('Remover medicamento?','Os campos deste medicamento serão removidos do registro atual.',[['cancel','Cancelar'],['remove','Remover']])!=='remove')return;
        el.remove();Flow.changed();
      };
    }
    f.querySelectorAll('.medicine-row').forEach(bind);
    f.querySelectorAll('[data-med-add]').forEach(b=>b.onclick=()=>{
      const group=b.dataset.medAdd, list=f.querySelector('#med-'+group);
      const empty=[...list.querySelectorAll('.medicine-row')].find(el=>![...el.querySelectorAll('input,select,textarea')].some(x=>x.value.trim()));
      let el=empty;
      if(!el){const id=Math.max(0,...[...list.children].map(x=>Number(x.dataset.medId)))+1;list.insertAdjacentHTML('beforeend',row(group,id));el=list.lastElementChild;bind(el);}
      const name=el.querySelector('input');name.value=b.dataset.drug||'';name.focus();el.scrollIntoView({block:'nearest'});Flow.changed();
    });
    f.querySelector('#renew-all').onclick=()=>{
      if(f.elements.medicalRequested.value!=='Sim'||f.elements.medicalDone.value!=='Sim')return toast('Confirme a solicitação e a avaliação médica realizada.');
      f.querySelectorAll('[data-med-group="req"]').forEach(el=>{if(el.querySelector('[name$="_name"]').value.trim()&&!el.querySelector('[name$="_result"]').value)el.querySelector('[name$="_result"]').value='Renovado sem alteração';});Flow.changed();
    };
  }
  function rows(d,group) {
    return ids(d,group).map(id=>({id,prefix:`${group}_${id}_`,...Object.fromEntries(keys.map(k=>[k,val(d,`${group}_${id}_${k}`)]))})).filter(r=>keys.some(k=>r[k]));
  }
  function describe(r) {
    return [r.name,r.strength?`concentração/apresentação ${r.strength}${r.strengthUnit?' '+r.strengthUnit:''}`:'',r.dose?`${r.dose} ${r.doseUnit} por tomada`:'',r.frequency,r.route?'via '+r.route.toLowerCase():'',r.schedule].filter(Boolean).join(', ');
  }
  function compose(d) {
    const req=rows(d,'req'),muc=rows(d,'muc');
    if(!req.length)Care.error('req_1_name','Informe ao menos um medicamento solicitado para renovação.');
    for(const r of [...req,...muc]) {
      if(!r.name)Care.error(r.prefix+'name','Informe o nome do medicamento nesta linha.');
      if(r.strengthUnit&&!r.strength)Care.error(r.prefix+'strength','Informe a concentração ou retire sua unidade.');
      if(Boolean(r.dose)!==Boolean(r.doseUnit))Care.error(r.prefix+(r.dose?'doseUnit':'dose'),'Informe a quantidade por tomada e sua unidade.');
      if(r.dose && (!/^\d+(?:[.,]\d+)?$/.test(r.dose)||Number(r.dose.replace(',','.'))<=0))Care.error(r.prefix+'dose','Informe uma quantidade por tomada maior que zero.');
      if(r.name.toLowerCase()==='insulina')Care.error(r.prefix+'name','Especifique o tipo de insulina conforme a receita.');
      if(r.result?.startsWith('Renovado') && (d.medicalRequested!=='Sim'||d.medicalDone!=='Sim'))Care.error('medicalDone','Confirme a solicitação e a realização da avaliação médica antes de registrar a renovação.');
      if(r.result==='Renovado sem alteração' && (!r.strength || !r.dose || !r.frequency))Care.error(r.prefix+(!r.strength?'strength':!r.dose?'dose':'frequency'),'Complete concentração, quantidade por tomada e frequência conforme a prescrição renovada.');
      if(r.result==='Renovado com alteração'&&!r.newRegimen)Care.error(r.prefix+'newRegimen','Transcreva a prescrição renovada com a alteração realizada.');
    }
    if(d.prescriptionDate && !req.some(r=>r.result.startsWith('Renovado')))Care.error('prescriptionDate','Registre quais medicamentos foram renovados antes de informar a data da prescrição renovada.');
    if(d.prescriptionDate && d.recordDate && d.prescriptionDate>d.recordDate)Care.error('prescriptionDate','A prescrição renovada não pode ter data posterior ao atendimento registrado.');
    const p=[sentence('Paciente comparece à unidade para solicitar renovação de '+req.map(describe).join('; '))];
    if(d.renewReason)p.push(sentence('Motivo informado: '+d.renewReason));
    if(muc.length)p.push(sentence('MUC (medicamentos em uso): '+muc.map(describe).join('; ')));
    if(d.renewSource)p.push(sentence('Fonte das informações: '+d.renewSource.toLowerCase()));
    if(d.renewComplaints)p.push(sentence('Queixas relatadas: '+d.renewComplaints));
    if(d.renewAllergies)p.push(sentence('Alergias informadas: '+d.renewAllergies));
    if(d.renewOther)p.push(sentence(d.renewOther));
    const assessment=[];
    if(d.medicalRequested==='Sim')assessment.push('Foi solicitada avaliação médica');
    if(d.medicalDone==='Sim')assessment.push('Avaliação médica realizada'+(d.renewPhysician?' por '+d.renewPhysician:''));
    if(d.medicalRequested==='Sim'&&d.medicalDone==='Não')assessment.push('Avaliação médica ainda não realizada');
    if(d.renewAssessment)assessment.push('Registro da avaliação/conduta: '+d.renewAssessment);
    for(const r of req){
      if(r.result==='Renovado sem alteração')assessment.push('Após avaliação médica, renovada a prescrição de '+describe(r)+'; mantido o esquema informado'+(r.newRegimen?'; '+r.newRegimen:''));
      if(r.result==='Renovado com alteração')assessment.push('Após avaliação médica, renovada a prescrição de '+r.name+' com alteração: '+r.newRegimen);
      if(r.result==='Não renovado')assessment.push('Não realizada renovação de '+r.name+(r.newRegimen?': '+r.newRegimen:''));
      if(r.result==='Aguardando avaliação')assessment.push('Solicitação de '+r.name+' aguardando avaliação médica'+(r.newRegimen?': '+r.newRegimen:''));
    }
    if(d.prescriptionDate)assessment.push('Data da prescrição renovada: '+d.prescriptionDate.split('-').reverse().join('/'));
    if(assessment.length)p.push(assessment.map(sentence).join(' '));
    const guides=d['c:renewGuides']||[];
    if(guides.length)p.push(sentence('Orientações realizadas: '+guides.map(x=>x.charAt(0).toLowerCase()+x.slice(1)).join('; ')));
    if(d.renewGuidance)p.push(sentence(d.renewGuidance));
    return p.join('\n\n');
  }
  return {form,mount,compose,rows,describe};
})();
