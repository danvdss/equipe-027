/* DIU: documentação do atendimento; não decide elegibilidade nem presume procedimentos. */
const DIU=(()=>{
  const val=(d,k)=>String(d[k]??'').trim();
  const yn=['Sim','Não','Não sabe informar'];
  const procedure=d=>d.mode==='Inserção';
  const attempted=d=>procedure(d)&&['Inserção concluída','Tentativa interrompida'].includes(d.outcome);
  const completed=d=>procedure(d)&&d.outcome==='Inserção concluída';
  const f=(key,label,type='text',options=[],when=null)=>({key,label,type,options,when});
  const sel=(k,l,o,w)=>f(k,l,'select',o,w);
  const area=(k,l,w)=>f(k,l,'textarea',[],w);
  const groups=[
    ['Atendimento',[
      sel('mode','Tipo de registro',['Avaliação/solicitação','Inserção']),
      f('visitDate','Data do atendimento','date'),
      sel('reason','Motivo do atendimento',['Avaliação','Solicitação','Inserção','Troca']),
      sel('deviceType','Tipo de DIU pretendido / utilizado',['Cobre','Hormonal','Ainda não definido']),
      area('demand','Demanda e motivo da escolha'),
      area('replacement','DIU anterior e planejamento da troca',d=>d.reason==='Troca')
    ]],
    ['História menstrual e obstétrica',[
      f('dum','Data da última menstruação (DUM)','date'),
      sel('cycle','Regularidade menstrual',['Regular','Irregular','Amenorreia','Não sabe informar']),
      sel('flow','Fluxo menstrual referido',['Habitual','Reduzido','Aumentado','Variável','Não sabe informar']),
      sel('cramps','Cólicas menstruais',yn),area('menstrualDetails','Detalhes da história menstrual'),
      f('g','Gestações (G)','integer'),f('p','Partos (P)','integer'),f('a','Abortamentos (A)','integer'),
      sel('delivery','Vias de parto',['Vaginal','Cesárea','Vaginal e cesárea']),
      sel('recentEvent','Parto / abortamento recente',['Não','Pós-parto','Pós-abortamento']),
      f('eventDate','Data do parto / abortamento','date',[],d=>['Pós-parto','Pós-abortamento'].includes(d.recentEvent)),
      sel('breastfeeding','Amamentação',['Não','Sim, exclusiva ou quase exclusiva','Sim, parcial']),
      area('obstetricDetails','Antecedentes e intercorrências obstétricas')
    ]],
    ['Contracepção e possibilidade de gestação',[
      sel('contraception','Uso atual de contraceptivo',yn),
      f('currentMethod','Método atual','text',[],d=>d.contraception==='Sim'),
      sel('regularUse','Uso regular e correto',yn,d=>d.contraception==='Sim'),
      area('methodDetails','Tempo de uso, última dose e eventuais falhas',d=>d.contraception==='Sim'),
      sel('unprotected','Relação desprotegida / falha recente',yn),
      f('relationDate','Data da relação / falha mais recente','date',[],d=>d.unprotected==='Sim'),
      area('pregnancyBasis','Fundamentação da avaliação da possibilidade de gestação'),
      sel('pregnancyAssessment','Avaliação profissional quanto à gestação',['Avaliação pendente','Razoável certeza de ausência de gestação','Não foi possível afastar gestação','Gestação confirmada']),
      sel('pregnancyTest','Teste de gravidez',['Não realizado','Solicitado','Aguardando resultado','Negativo','Positivo','Inconclusivo']),
      f('testDate','Data do teste de gravidez','date',[],d=>['Negativo','Positivo','Inconclusivo'].includes(d.pregnancyTest)),
      f('testType','Tipo de teste / valor conforme laudo','text',[],d=>['Negativo','Positivo','Inconclusivo'].includes(d.pregnancyTest))
    ]],
    ['Antecedentes e sintomas',[
      ...[['bleeding','Sangramento sem causa esclarecida'],['pelvicPain','Dor pélvica'],['fever','Febre'],['discharge','Corrimento'],['sti','IST / doença inflamatória pélvica'],['uterine','Alterações uterinas']].map(([k,l])=>sel(k,l,['Nega','Refere atual','Refere antecedente','Não sabe informar'])),
      area('symptomDetails','Detalhes dos sintomas, antecedentes e tratamentos'),
      area('diseases','Outras doenças relevantes / cirurgias'),
      area('typeAssessment','Avaliação específica para o tipo de DIU escolhido'),
      sel('medicationUse','Medicamentos em uso',yn),area('medications','Medicamentos, doses e revisão de interações',d=>d.medicationUse==='Sim'),
      sel('allergy','Alergias',['Nega','Refere','Não sabe informar']),area('allergyDetails','Substância e reação referida',d=>d.allergy==='Refere')
    ]],
    ['Exame ginecológico',[
      sel('speculum','Exame especular',['Realizado','Não realizado','Recusado']),
      area('cervix','Aspecto do colo',d=>d.speculum==='Realizado'),area('secretions','Secreções observadas',d=>d.speculum==='Realizado'),
      sel('bimanual','Toque bimanual',['Realizado','Não realizado','Recusado']),
      sel('uterinePosition','Posição uterina',['Anteversão','Retroversão','Intermediária','Não determinada'],d=>d.bimanual==='Realizado'),
      sel('mobilizationPain','Dor à mobilização',['Ausente','Presente','Não avaliada'],d=>d.bimanual==='Realizado'),
      area('bimanualDetails','Outros achados do toque bimanual',d=>d.bimanual==='Realizado'),
      area('examDetails','Outros achados examinados / motivo de não realização')
    ]],
    ['Decisão e planejamento',[
      sel('choice','Escolha expressa pela paciente',['Deseja o DIU','Deseja mais tempo para decidir','Prefere outro método','Não deseja prosseguir']),
      sel('consent','Situação do consentimento',['Não abordado','Orientado / entregue para leitura','Preenchido; assinatura pendente','Lido, esclarecido e assinado','Paciente não consentiu']),
      area('assessment','Avaliação profissional e fundamentação da conduta'),
      sel('plan','Situação do planejamento',['Solicitação preenchida','Solicitação encaminhada','Aguardando avaliação','Aguardando agendamento','Inserção programada','Inserção adiada','Encaminhada para outro serviço','Paciente optou por não prosseguir']),
      area('planReason','Motivo / justificativa do planejamento'),
      f('scheduledDate','Data da inserção programada','date',[],d=>d.plan==='Inserção programada'),
      area('referral','Serviço de referência / encaminhamento'),
      area('bridge','Plano contraceptivo até a inserção')
    ]],
    ['Registro da inserção',[
      sel('outcome','Resultado do atendimento',['Inserção concluída','Tentativa interrompida','Não realizada'],procedure),
      f('procedureDate','Data do procedimento / tentativa','date',[],attempted),
      f('professional','Profissional responsável / registro','text',[],procedure),
      f('model','Modelo do dispositivo','text',[],attempted),f('manufacturer','Fabricante','text',[],attempted),
      f('lot','Lote','text',[],attempted),f('expiry','Validade da embalagem','date',[],attempted),
      f('hysterometry','Histerometria (cm)','decimal',[],attempted),
      sel('analgesia','Analgesia / anestesia',['Utilizada','Não utilizada'],attempted),
      area('analgesiaDetails','Medicamento, dose, via e técnica',d=>attempted(d)&&d.analgesia==='Utilizada'),
      f('threads','Comprimento dos fios (cm)','decimal',[],completed),
      area('technique','Registro da técnica realizada',attempted),
      sel('complications','Intercorrências',['Sem intercorrências observadas','Com intercorrências'],attempted),
      area('complicationDetails','Intercorrências e medidas adotadas',d=>attempted(d)&&d.complications==='Com intercorrências'),
      area('difficulties','Dificuldades / medidas adotadas',attempted),
      area('notCompletedReason','Motivo da interrupção / não realização',d=>procedure(d)&&['Tentativa interrompida','Não realizada'].includes(d.outcome)),
      sel('removal','Retirada do DIU anterior',['Realizada','Não realizada'],d=>procedure(d)&&d.reason==='Troca'),
      area('removalDetails','Detalhes da retirada / condição do dispositivo anterior',d=>procedure(d)&&d.reason==='Troca'&&d.removal==='Realizada')
    ],procedure],
    ['Após o procedimento',[
      sel('postPain','Dor após o procedimento',['Ausente','Presente','Não avaliada'],attempted),
      f('painScore','Intensidade de dor (0 a 10)','decimal',[],d=>attempted(d)&&d.postPain==='Presente'),
      sel('postBleeding','Sangramento após o procedimento',['Ausente','Presente','Não avaliado'],attempted),
      area('postDetails','Dor, sangramento e medidas adotadas',attempted),
      area('condition','Condições da paciente ao término / observação',attempted)
    ],attempted],
    ['Orientações e retorno',[
      area('otherGuidance','Outras orientações efetivamente realizadas'),
      area('conduct','Outras condutas / exames solicitados / encaminhamentos realizados'),
      sel('renewal','Renovação de medicamentos',['Não houve','Avaliação médica solicitada; aguardando definição','Avaliação médica solicitada e realizada; renovação conforme orientação médica']),
      area('renewed','Medicamentos renovados',d=>d.renewal==='Avaliação médica solicitada e realizada; renovação conforme orientação médica'),
      f('returnDate','Data do retorno','date'),f('returnPlace','Horário / local / finalidade do retorno'),area('returnInstructions','Orientações de retorno e procura de atendimento')
    ]]
  ];
  const guides={options:'opções contraceptivas e escolha livre e informada',duration:'eficácia e duração de uso conforme o modelo de DIU escolhido',bleeding:'possíveis alterações do sangramento e cólicas conforme o tipo de DIU',risks:'benefícios, riscos e possíveis intercorrências do procedimento',sti:'ausência de proteção contra IST e uso de preservativos',additional:'necessidade de proteção contraceptiva adicional conforme o método e a avaliação profissional',alerts:'sinais de alerta e quando procurar atendimento',removal:'possibilidade de retirada a pedido e retorno da fertilidade',followup:'acompanhamento e retorno conforme orientação do serviço'};
  const fields=groups.flatMap(g=>g[1]);
  const active=(field,d)=>!field.when||field.when(d);
  function clean(raw){const d={...raw};for(const field of fields)if(!active(field,raw))delete d[field.key];return d;}
  function control(x){const attrs=`name="${x.key}"`;let input;
    if(x.type==='select')input=`<select ${attrs}><option value="">Não informado</option>${x.options.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
    else if(x.type==='textarea')input=`<textarea ${attrs} rows="2"></textarea>`;
    else input=`<input ${attrs} type="${['integer','decimal'].includes(x.type)?'number':x.type}" ${['integer','decimal'].includes(x.type)?`min="0" step="${x.type==='integer'?'1':'0.1'}"`:''} autocomplete="off">`;
    return `<label class="${x.type==='textarea'?'wide ':''}diu-field" data-diu-field="${x.key}">${esc(x.label)}${input}</label>`;
  }
  function form(){return `<div class="workspace"><form id="clinical" autocomplete="off">${groups.map(([title,fs],i)=>`<section class="panel" data-diu-group="${i}"><h2>${title}</h2>${i===groups.length-1?`<p class="privacy">Selecione apenas orientações efetivamente realizadas.</p><div class="chips">${Object.entries(guides).map(([k,l])=>`<label class="chip"><input type="checkbox" name="c:diuGuides" value="${k}">${esc(l)}</label>`).join('')}</div><div class="section-extra"></div>`:''}<div class="fields two">${fs.map(control).join('')}</div>${i===2?'<p class="privacy">Um teste negativo isolado não afasta gestação muito recente. Registre a avaliação profissional e sua fundamentação.</p>':''}${i===5?'<p class="privacy">O formulário documenta a avaliação; não aprova ou recusa o método automaticamente. Considere o tipo de DIU, o modelo e o protocolo vigente.</p>':''}</section>`).join('')}<details class="panel compact-details"><summary>Referências do formulário</summary><p><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/saude-sexual-e-reprodutiva/contracepcao/diu-de-cobre" target="_blank" rel="noopener">Ministério da Saúde — DIU de cobre</a></p><p><a href="https://www.saude.df.gov.br/documents/d/saude/protocolo-de-queixas-ginecologicas-e-planejamento-reprodutivo-com-insercao-de-dispositivo-intrauterino-diu-na-aps-2-pdf" target="_blank" rel="noopener">SES-DF — Planejamento reprodutivo e inserção de DIU (2023)</a></p><p class="privacy">Registro para profissional habilitado, conforme protocolo local e instruções do dispositivo. A validade da embalagem é distinta do prazo de uso após inserção. Não há duração, elegibilidade ou resultados preenchidos automaticamente.</p></details></form>${outputPanel()}</div>`;}
  function mount(){const form=document.getElementById('clinical');const mode=form.elements.mode;if(!mode.value)mode.value='Avaliação/solicitação';
    const refresh=()=>{const d={};for(const el of form.elements)if(el.name&&!el.name.startsWith('c:'))d[el.name]=el.value;
      for(const x of fields){const el=form.querySelector(`[data-diu-field="${x.key}"]`);const show=active(x,d);el.hidden=!show;el.querySelectorAll('input,select,textarea').forEach(c=>c.disabled=!show)}
      groups.forEach((g,i)=>{const section=form.querySelector(`[data-diu-group="${i}"]`);section.hidden=!!g[2]&&!g[2](d);const shortcut=[...document.querySelectorAll('.form-shortcuts button')].find(b=>b.textContent===g[0]);if(shortcut)shortcut.hidden=section.hidden});
    };form.addEventListener('change',refresh);refresh();queueMicrotask(refresh);
  }
  function validate(raw){const d=clean(raw);if(!['Avaliação/solicitação','Inserção'].includes(d.mode))throw Error('Selecione avaliação/solicitação ou inserção.');
    if(!fields.some(x=>x.key!=='mode'&&active(x,d)&&val(d,x.key))&&!(d['c:diuGuides']||[]).length)throw Error('Preencha ao menos uma informação do atendimento.');
    for(const x of fields){const v=val(d,x.key);if(!v)continue;
      if(x.type==='select'&&!x.options.includes(v))throw Error('Confira a seleção: '+x.label+'.');
      if(x.type==='date'){const n=Date.parse(v+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==v)throw Error('Confira a data: '+x.label+'.')}
      if(['integer','decimal'].includes(x.type)&&(!Number.isFinite(Number(v))||Number(v)<0||x.type==='integer'&&!/^\d+$/.test(v)))throw Error('Confira o valor: '+x.label+'.');
    }
    if(val(d,'g')&&((val(d,'p')&&+d.p>+d.g)||(val(d,'a')&&+d.a>+d.g)||(['p','a'].every(k=>val(d,k))&&+d.p+(+d.a)>+d.g)))throw Error('Confira G/P/A: partos e abortamentos não podem exceder as gestações.');
    for(const k of ['dum','eventDate','relationDate','testDate','procedureDate'])if(val(d,k)&&val(d,'visitDate')&&d[k]>d.visitDate)throw Error('Datas de antecedentes, exames e procedimento não podem ser posteriores ao atendimento.');
    for(const k of ['returnDate','scheduledDate'])if(val(d,k)&&val(d,'visitDate')&&d[k]<d.visitDate)throw Error('Agendamento / retorno não pode ser anterior ao atendimento.');
    if(val(d,'painScore')&&+d.painScore>10)throw Error('A intensidade de dor deve ficar entre 0 e 10.');
    if(d.pregnancyTest==='Positivo'&&d.pregnancyAssessment==='Razoável certeza de ausência de gestação')throw Error('Revise o teste positivo e a conclusão sobre gestação.');
    if(d.pregnancyAssessment==='Razoável certeza de ausência de gestação'&&!val(d,'pregnancyBasis'))throw Error('Registre a fundamentação da avaliação de ausência de gestação.');
    if(procedure(d)&&!d.outcome)throw Error('Informe se a inserção foi concluída, interrompida ou não realizada.');
    if(completed(d)&&(d.consent==='Paciente não consentiu'||['Prefere outro método','Não deseja prosseguir'].includes(d.choice)))throw Error('Revise a inserção concluída e a decisão / consentimento registrados.');
    if(procedure(d)&&['Avaliação','Solicitação'].includes(d.reason))throw Error('Confira o motivo do atendimento no modo Inserção.');
    if(!procedure(d)&&d.reason==='Inserção')throw Error('Use o modo Inserção para registrar esse atendimento.');
    if(d.complications==='Com intercorrências'&&!val(d,'complicationDetails'))throw Error('Descreva as intercorrências e as medidas adotadas.');
    return d;
  }
  function compose(raw){const d=validate(raw),paragraphs=[];const date=v=>v.split('-').reverse().join('/');
    const sentence=s=>s.replace(/[.\s]+$/,'')+'.';
    const intro=procedure(d)?'Paciente comparece à unidade para inserção de dispositivo intrauterino.':'Paciente comparece à unidade para avaliação e solicitação de dispositivo intrauterino como método contraceptivo.';
    paragraphs.push(intro);
    groups.forEach(([title,fs,when],i)=>{if(when&&!when(d))return;let parts=[];
      if(i===1){const gpa=['g','p','a'].filter(k=>val(d,k)).map(k=>k.toUpperCase()+d[k]);if(gpa.length)parts.push('Histórico obstétrico referido: '+gpa.join(' '))}
      for(const x of fs){if(['mode','g','p','a'].includes(x.key)||!val(d,x.key)||!active(x,d))continue;let v=val(d,x.key),label=x.label;
        if(x.type==='date')v=date(v);
        if(x.key==='outcome'){parts.push(v==='Inserção concluída'?'Realizada inserção de DIU':v==='Tentativa interrompida'?'Tentativa de inserção de DIU interrompida; inserção não concluída':'Inserção de DIU não realizada');continue}
        if(x.key==='renewal'&&v==='Avaliação médica solicitada e realizada; renovação conforme orientação médica'){parts.push('Solicitada e realizada avaliação médica; medicamentos renovados conforme orientação médica');continue}
        if(x.key==='hysterometry'){label='Histerometria';v+=' cm'}if(x.key==='threads'){label='Comprimento dos fios';v+=' cm'}if(x.key==='painScore'){label='Intensidade da dor';v+='/10'}
        parts.push(label+': '+v);
      }
      if(i===groups.length-1){const gs=(d['c:diuGuides']||[]).filter(k=>guides[k]).map(k=>guides[k]);if(gs.length)parts.unshift('Realizadas orientações sobre '+gs.join('; '))}
      if(parts.length)paragraphs.push(parts.map(sentence).join(' '));
    });return paragraphs.join('\n\n');
  }
  return {form,mount,compose,validate,clean};
})();
