/* Occupational therapy documentation. Session memory only; no patient network requests. */
const Occupational = (() => {
  const catalog = {
    'M-CHAT-R/F': ['Rastreio do desenvolvimento · M chat','https://www.mchatscreen.com/mchat-rf/'],
    'COPM': ['Prioridades, desempenho e satisfação ocupacional','https://www.thecopm.ca/about/'],
    'Katz': ['Atividades básicas de vida diária','https://bvsms.saude.gov.br/bvs/publicacoes/envelhecimento_saude_pessoa_idosa_n19.pdf'],
    'Lawton e Brody': ['Atividades instrumentais de vida diária','https://bvsms.saude.gov.br/bvs/publicacoes/envelhecimento_saude_pessoa_idosa_n19.pdf'],
    'PEDI-CAT': ['Desempenho funcional pediátrico','https://www.pedicat.com/'],
    'Perfil Sensorial 2': ['Padrões sensoriais no cotidiano','https://www.pearsonassessments.com/'],
    'MoCA': ['Rastreio cognitivo','https://mocacognition.com/paper'],
    'Outro': ['Instrumento ou método informado','']
  };
  const modalities=['Avaliação inicial','Acompanhamento','Reavaliação','Orientação a familiar/cuidador','Atendimento compartilhado','Participação em grupo','Visita domiciliar','Alta/encerramento','Ausência ou atendimento não realizado'];
  const assistance=['Sem ajuda de outra pessoa','Preparação do ambiente/material','Supervisão','Pistas verbais','Pistas visuais','Pistas gestuais','Ajuda física parcial','Ajuda física total','Recurso adaptado/tecnologia assistiva'];
  const domains=['Autocuidado / AVD','AIVD','Gestão da saúde','Descanso e sono','Educação','Trabalho','Brincar','Lazer','Participação social'];
  const interventions=['Análise e prática de atividade cotidiana','Adaptação de tarefa/ambiente','Organização da rotina','Estratégias externas de organização','Orientação a familiar/cuidador','Exploração de brincar/lazer','Promoção de participação social','Avaliação/treino de tecnologia assistiva','Articulação com escola/equipe/rede','Construção/revisão do projeto terapêutico'];
  const v=(d,k)=>String(d[k]??'').trim();
  const input=(k,l,type='text')=>`<label>${esc(l)}<input name="${k}" type="${type}" autocomplete="off" ${type==='number'?'step="any"':''}></label>`;
  const area=(k,l)=>`<label>${esc(l)}<textarea name="${k}" rows="2"></textarea></label>`;
  const select=(k,l,opts)=>`<label>${esc(l)}<select name="${k}"><option value="">Não informado</option>${opts.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>`;
  const fields=(a)=>`<div class="fields two">${a.join('')}</div>`;
  const date=s=>s?s.split('-').reverse().join('/'):'';
  function ids(d,p){return [...new Set(Object.keys(d).map(k=>k.replace(/^c:/,'').match(new RegExp('^'+p+'_(\\d+)_'))?.[1]).filter(Boolean))].map(Number).sort((a,b)=>a-b);}
  function taskRow(id){const p=`otTask_${id}_`;return `<fieldset class="medicine-row" data-task="${id}"><legend>Tarefa observada ${id}</legend>${fields([input(p+'task','Ocupação / tarefa'),input(p+'context','Etapa, contexto e momento'),area(p+'performance','O que realizou / dificuldades'),input(p+'resource','Recurso ou adaptação')])}${chips(p+'help',assistance)}<p class="privacy">Seleções se referem à mesma etapa e momento. Para outro contexto, adicione outra tarefa.</p><button type="button" data-remove-row>Remover tarefa</button></fieldset>`;}
  function resultRow(id,n){const p=`otTest_${id}_r${n}_`;return `<fieldset class="medicine-row" data-result="${n}"><legend>Resultado ${n}</legend>${fields([input(p+'domain','Domínio / subteste'),input(p+'value','Resultado / valor'),select(p+'type','Tipo de escore',['Bruto','Padronizado','Percentil','Classificação do relatório','Descritivo']),input(p+'unit','Unidade / escala'),area(p+'note','Observação')])}<button type="button" data-remove-row>Remover resultado</button></fieldset>`;}
  function testRow(id,d={}){const p=`otTest_${id}_`;const nums=[...new Set(Object.keys(d).map(k=>k.match(new RegExp('^'+p+'r(\\d+)_'))?.[1]).filter(Boolean))];return `<fieldset class="medicine-row" data-test="${id}"><legend>Avaliação / instrumento ${id}</legend>${fields([select(p+'name','Instrumento',Object.keys(catalog)),input(p+'other','Nome de outro instrumento / método'),select(p+'origin','Origem',['Aplicação presencial nesta sessão','Resultado externo apresentado']),input(p+'version','Versão / edição'),input(p+'language','Idioma / adaptação'),input(p+'date','Data da aplicação','date'),input(p+'purpose','Finalidade'),input(p+'informant','Informante / fonte'),input(p+'examiner','Profissional aplicador'),select(p+'status','Estado da aplicação',['Completa','Parcial','Interrompida','Não aplicado']),area(p+'reason','Motivo de interrupção / parcialidade'),area(p+'conditions','Condições e limitações')])}<p class="privacy ot-license"></p><div class="ot-mchat" hidden>${fields([input(p+'age','Idade na aplicação (meses)','number'),input(p+'initial','Escore inicial informado (0–20)','number'),select(p+'followState','Entrevista de seguimento',['Pendente','Em andamento','Concluída','Revisão necessária','Dispensada conforme algoritmo']),input(p+'follow','Escore informado após seguimento','number'),input(p+'followDate','Data do seguimento','date')])}<p class="privacy" role="status" data-mchat-status></p></div><details><summary>Procedimento e desempenho no teste</summary>${fields([area(p+'procedure','Procedimento realizado'),area(p+'task','Tarefa / domínio avaliado'),area(p+'response','Resposta / desempenho observado'),area(p+'support','Ajuda, pistas e adaptações'),input(p+'time','Tempo e unidade'),input(p+'attempts','Tentativas / acertos'),area(p+'difficulty','Dificuldades')])}</details><div data-results>${(nums.length?nums:[1]).map(n=>resultRow(id,n)).join('')}</div><button type="button" data-add-result>+ Resultado / domínio</button>${fields([area(p+'interpretation','Interpretação do profissional'),area(p+'impact','Repercussão ocupacional'),area(p+'plan','Conduta / reavaliação planejada')])}<button type="button" data-remove-row>Remover instrumento</button></fieldset>`;}
  function form(){const d=drafts.occupational||{};return `<div class="workspace ot-workspace"><form id="clinical">${section('Atendimento de Terapia Ocupacional',fields([input('recordDate','Data do atendimento','date'),select('otMode','Modalidade',modalities),select('otPerson','Termo no texto',['Paciente','Usuário','Pessoa atendida']),select('otFormat','Formato',['Texto corrido','SOAP']),select('otLocation','Local',['Unidade','Domicílio','Escola','Território','Outro']),input('otLocationOther','Outro local'),input('otParticipants','Participantes / equipe'),select('otSource','Fonte do relato',['Pessoa atendida','Familiar/cuidador','Equipe','Documento','Outra fonte']),input('otSourceOther','Especificar fonte'),input('otProfessional','Profissional responsável'),input('otCrefito','CREFITO')]))}${section('Ausência / atendimento não realizado',`<div data-absence>${fields([area('otAbsentReason','Motivo conhecido'),area('otContact','Contato efetivamente realizado'),area('otAbsentPlan','Conduta')])}</div>`)}<div data-session>${section('Demanda do dia',fields([area('otDemand','Demanda / motivo'),area('otPriority','Prioridade da pessoa'),area('otReport','Relato desde o último atendimento')]))}${section('Atividade e desempenho',`${select('otObservation','Fonte do desempenho',['Observado nesta sessão','Relatado, não observado nesta sessão'])}<div id="ot-tasks">${(ids(d,'otTask').length?ids(d,'otTask'):[1]).map(taskRow).join('')}</div><button type="button" id="ot-add-task">+ Outra tarefa / contexto</button>`)}${section('Objetivo da sessão',fields([area('otGoal','Resultado funcional buscado'),area('otAgreement','Pactuação'),area('otIndicator','Indicador observável')]))}${section('Intervenção realizada',`<p class="privacy">Selecione apenas o que foi realizado. Descreva atividade, finalidade e resposta nos campos abaixo.</p>${chips('otInterventions',interventions)}${fields([area('otIntervention','O que foi feito e com qual atividade'),area('otPurpose','Finalidade ocupacional'),area('otAdaptation','Adaptação / estratégia / ajuda'),input('otDuration','Duração / dose de prática registrada')])}`)}${section('Resposta e análise profissional',fields([area('otResponse','Resposta durante a tarefa / evidência'),area('otAnalysis','Interpretação e repercussão ocupacional'),area('otEvents','Intercorrências, se registradas'),area('otComparison','Comparação e referência anterior')]))}${section('Orientações e plano',fields([area('otGuidance','Orientações efetivamente realizadas'),input('otRecipient','Destinatário'),area('otUnderstanding','Compreensão verificada'),area('otPlan','Próximos passos / continuidade'),area('otReferral','Articulação / encaminhamento realizado'),input('otReturn','Retorno / finalidade'),input('otReturnDate','Data do retorno','date'),select('otRegular','Sessões regulares do mesmo plano',['Mantidas','Encerradas']),area('otDischargeReason','Motivo da alta / explicação da continuidade')]))}${section('Perfil ocupacional ampliado',`<details id="ot-profile"><summary>Abrir perfil e domínios ocupacionais</summary>${fields([area('otHistory','História ocupacional'),area('otInterests','Interesses e atividades significativas'),area('otRoutine','Rotina e papéis'),area('otStrengths','Potencialidades e facilitadores'),area('otBarriers','Barreiras e contexto')])}${domains.map((x,i)=>`<details><summary>${esc(x)}</summary>${fields([input('otDomain'+i+'Task','Tarefa concreta'),input('otDomain'+i+'Context','Cenário / fonte'),area('otDomain'+i+'Impact','Impacto percebido / prioridades')])}</details>`).join('')}</details>`)}${section('Avaliações e instrumentos',`<p class="privacy">Registre avaliações presenciais ou relatórios externos. Formulários protegidos dependem de autorização digital e versão verificadas. Nenhum resultado é diagnóstico automático.</p><div id="ot-tests">${ids(d,'otTest').map(id=>testRow(id,d)).join('')}</div><button type="button" id="ot-add-test">+ Adicionar instrumento / teste</button>`)}</div></form>${outputPanel()}</div>`;}
  function mchat(r){
    const out={errors:[],text:'',suggestion:''};const num=(s,max)=>s!==''&&/^\d+$/.test(s)&&+s<=max;
    if(r.initial&&!num(r.initial,20))out.errors.push(['initial','O escore inicial deve ser inteiro entre 0 e 20.']);
    if(r.age&&(!/^\d+(\.\d+)?$/.test(r.age)||+r.age<=0))out.errors.push(['age','Confira a idade em meses.']);
    if(r.follow&&!num(r.follow,20))out.errors.push(['follow','Confira o escore inteiro do seguimento.']);
    if(r.follow&&r.initial&&+r.follow>+r.initial)out.errors.push(['follow','O escore do seguimento não pode superar os itens inicialmente pontuados.']);
    if(out.errors.length)return out;
    if(!r.initial)return out;
    if(r.status!=='Completa'){out.text='Aplicação inicial não concluída; sem interpretação final.';return out;}
    if(!r.version||!r.age||+r.age<16||+r.age>30||r.conditions){out.text='Interpretação automática indisponível: conferir versão, idade de 16–30 meses e condições de aplicação.';return out;}
    const n=+r.initial;
    if(n<=2){out.text='Rastreio inicial de baixa probabilidade; resultado negativo não afasta preocupações clínicas.';if(+r.age<24)out.suggestion='Algoritmo: repetir rastreio aos 24 meses e manter vigilância do desenvolvimento.';}
    else if(n>=8){out.text='Rastreio positivo na etapa inicial; seguimento dispensável pelo algoritmo.';out.suggestion='Algoritmo: avaliação diagnóstica e de elegibilidade para intervenção precoce.';}
    else if(r.followState==='Dispensada conforme algoritmo')out.errors.push(['followState','Pontuação inicial de 3–7 indica entrevista de seguimento.']);
    else if(r.followState!=='Concluída'||!r.follow){out.text='Seguimento indicado e ainda não concluído; sem resultado final do rastreio.';}
    else {out.text=+r.follow>=2?'Rastreio positivo após seguimento.':'Rastreio negativo após seguimento; manter vigilância do desenvolvimento.';if(+r.follow>=2)out.suggestion='Algoritmo: avaliação diagnóstica e de elegibilidade para intervenção precoce.';}
    return out;
  }
  function testData(d,id){const p=`otTest_${id}_`;return Object.fromEntries(Object.entries(d).filter(([k])=>k.startsWith(p)).map(([k,val])=>[k.slice(p.length),String(val).trim()]));}
  function issues(d){const a=[];const add=(msg,keys)=>a.push({message:msg,keys,values:[]});
    if(d.otMode===modalities[8])return a; // hidden fields retained in draft, excluded from this encounter
    for(const id of ids(d,'otTask')){const p=`otTask_${id}_`,help=d['c:'+p+'help']||[];if(help.includes('Sem ajuda de outra pessoa')&&help.some(x=>['Ajuda física parcial','Ajuda física total'].includes(x)))add('Ajuda humana incompatível na mesma tarefa e contexto. Revise ou separe os momentos.',['c:'+p+'help']);}
    if(d.otMode==='Alta/encerramento'&&d.otRegular==='Mantidas'&&!d.otDischargeReason)add('Explique a manutenção de sessões do mesmo plano após alta.',['otRegular','otDischargeReason']);
    if(d.otReturnDate&&d.recordDate&&d.otReturnDate<d.recordDate)add('Retorno anterior ao atendimento.',['otReturnDate','recordDate']);
    for(const id of ids(d,'otTest')){const p=`otTest_${id}_`,r=testData(d,id);
      if(r.status==='Não aplicado'&&(r.initial||Object.keys(r).some(k=>/^r\d+_value$/.test(k)&&r[k])))add('Instrumento não aplicado com resultado registrado. Confira a origem e a situação. ',[p+'status']);
      if(r.date&&d.recordDate&&r.date>d.recordDate)add('Data da aplicação posterior ao atendimento.',[p+'date']);
      if(r.followDate&&r.date&&r.followDate<r.date)add('Seguimento anterior à aplicação inicial.',[p+'followDate']);
      if(r.name==='M-CHAT-R/F')mchat(r).errors.forEach(([k,m])=>add(m,[p+k]));
      for(const k of Object.keys(r).filter(k=>/^r\d+_type$/.test(k)&&r[k]==='Percentil')){const value=r[k.replace('_type','_value')];if(value&&(!/^\d+(?:[.,]\d+)?$/.test(value)||+value.replace(',','.')>100))add('Percentil deve estar entre 0 e 100.',[p+k.replace('_type','_value')]);}
    }return a;
  }
  function compose(d){
    const contentKeys=Object.keys(d).filter(k=>(k.startsWith('ot')||k.startsWith('c:ot'))&&!['otMode','otPerson','otFormat','otLocation','otProfessional','otCrefito','otObservation','otSource'].includes(k));
    if(!contentKeys.some(k=>Array.isArray(d[k])?d[k].length:v(d,k)) && d.otMode!==modalities[8])return '';
    const who=d.otPerson||'Paciente', mode=d.otMode, absent=mode===modalities[8], S=[],O=[],A=[],P=[];
    const put=(arr,k,label)=>{if(v(d,k))arr.push(sentence((label?label+': ':'')+v(d,k)));};
    let opening=absent?'Atendimento de Terapia Ocupacional não realizado.':mode==='Orientação a familiar/cuidador'?'Realizado atendimento de orientação em Terapia Ocupacional.':mode==='Participação em grupo'?`${who} participa de atendimento grupal de Terapia Ocupacional.`:mode==='Visita domiciliar'||d.otLocation==='Domicílio'?'Realizado atendimento domiciliar de Terapia Ocupacional.':`${who} recebe atendimento de Terapia Ocupacional${d.otLocation?' em '+(d.otLocation==='Outro'?(d.otLocationOther||'local informado'):d.otLocation.toLowerCase()):''}${mode?' — '+mode.toLowerCase():''}.`;
    if(absent){put(S,'otAbsentReason','Motivo conhecido');put(P,'otContact','Contato realizado');put(P,'otAbsentPlan','Conduta');}
    else {
      put(S,'otParticipants','Participantes');put(S,'otSource','Fonte do relato');put(S,'otSourceOther','Fonte especificada');
      for(const [k,l] of [['otDemand','Demanda'],['otPriority','Prioridade'],['otReport','Relato'],['otHistory','História ocupacional'],['otInterests','Interesses'],['otRoutine','Rotina e papéis'],['otStrengths','Potencialidades'],['otBarriers','Barreiras']])put(S,k,l);
      for(let i=0;i<domains.length;i++){const s=[v(d,'otDomain'+i+'Task'),v(d,'otDomain'+i+'Context'),v(d,'otDomain'+i+'Impact')].filter(Boolean);if(s.length)S.push(sentence(domains[i]+': '+s.join('; ')));}
      for(const id of ids(d,'otTask')){const p=`otTask_${id}_`,help=d['c:'+p+'help']||[];const bits=[v(d,p+'task'),v(d,p+'context'),v(d,p+'performance'),...help,v(d,p+'resource')].filter(Boolean);if(bits.length)(d.otObservation==='Relatado, não observado nesta sessão'?S:O).push(sentence((d.otObservation==='Relatado, não observado nesta sessão'?'Desempenho relatado, não observado':d.otObservation==='Observado nesta sessão'?'Desempenho observado':'Desempenho registrado (fonte não informada)')+': '+bits.join('; ')));}
      for(const [k,l] of [['otGoal','Objetivo funcional'],['otAgreement','Pactuação'],['otIndicator','Indicador'],['otAnalysis','Análise profissional'],['otComparison','Comparação e referência']])put(A,k,l);
      const selected=d['c:otInterventions']||[];if(selected.length)P.push(sentence('Intervenções registradas: '+selected.join('; ')));
      for(const [k,l] of [['otIntervention','Procedimento realizado'],['otPurpose','Finalidade'],['otAdaptation','Estratégia / ajuda'],['otDuration','Duração'],['otGuidance','Orientações realizadas'],['otRecipient','Destinatário'],['otUnderstanding','Compreensão verificada'],['otPlan','Plano'],['otReferral','Articulação / encaminhamento realizado'],['otReturn','Retorno'],['otRegular','Sessões regulares'],['otDischargeReason','Alta / justificativa']])put(P,k,l);
      if(d.otReturnDate)P.push(sentence('Retorno em '+date(d.otReturnDate)));
      put(O,'otResponse','Resposta observada');put(O,'otEvents','Intercorrências registradas');
      for(const id of ids(d,'otTest')){const r=testData(d,id);if(!r.name)continue;let name=r.name==='Outro'?(r.other||'Instrumento não identificado'):r.name;
        const bits=[(r.origin==='Resultado externo apresentado'?'Apresentado resultado de ':r.origin==='Aplicação presencial nesta sessão'?'Aplicação presencial de ':'Registro de ')+name,r.version?'versão '+r.version:'',r.language,r.date?'em '+date(r.date):'',r.informant?'informante: '+r.informant:'',r.examiner?'aplicador: '+r.examiner:'',r.status?'aplicação '+r.status.toLowerCase():'situação da aplicação não informada',r.reason,r.conditions?'limitações: '+r.conditions:''];
        for(const [k,l] of [['purpose','finalidade'],['procedure','procedimento'],['task','tarefa'],['response','desempenho'],['support','ajuda/adaptação'],['time','tempo'],['attempts','tentativas/acertos'],['difficulty','dificuldades']])if(r[k])bits.push(l+': '+r[k]);
        for(const n of [...new Set(Object.keys(r).map(k=>k.match(/^r(\d+)_/)?.[1]).filter(Boolean))]){const s=['domain','value','type','unit','note'].map(k=>r['r'+n+'_'+k]).filter(Boolean);if(s.length)bits.push(s.join(' — '));}
        if(name==='M-CHAT-R/F'){if(r.age)bits.push('idade na aplicação: '+r.age+' meses');if(r.initial)bits.push('escore inicial informado: '+r.initial);if(r.followState)bits.push('seguimento: '+r.followState.toLowerCase());if(r.follow)bits.push('escore de seguimento informado: '+r.follow);if(r.followDate)bits.push('seguimento em '+date(r.followDate));const m=mchat(r);if(m.text)bits.push(m.text);}
        O.push(bits.filter(Boolean).map(sentence).join(' '));if(r.interpretation)A.push(sentence(name+' — interpretação profissional: '+r.interpretation));if(r.impact)A.push(sentence(name+' — repercussão ocupacional: '+r.impact));if(r.plan)P.push(sentence(name+' — plano registrado: '+r.plan));
      }
    }
    const performed=P.filter(x=>/^(Intervenções registradas|Procedimento realizado|Finalidade|Estratégia \/ ajuda|Duração):/.test(x)), planned=P.filter(x=>!performed.includes(x));
    const blocks=d.otFormat==='SOAP'?[opening,...[['S',S],['O',O],['A',A],['P',P]].filter(([,x])=>x.length).map(([l,x])=>l+': '+x.join(' '))]:[opening,...S,...performed,...O,...A,...planned];
    if(d.otProfessional||d.otCrefito)blocks.push(sentence(['Profissional: '+(d.otProfessional||'não informado'),d.otCrefito?'CREFITO '+d.otCrefito:''].filter(Boolean).join(' — ')));
    if(d.recordDate)blocks.push(sentence('Atendimento em '+date(d.recordDate)));
    return blocks.join('\n\n');
  }
  function warnings(d){
    const result=[];
    const need=(key,label)=>{if(!v(d,key))result.push({key,text:'Não registrado: '+label+'.'});};
    need('otMode','modalidade');need('recordDate','data do atendimento');need('otProfessional','profissional');need('otCrefito','CREFITO');
    if(d.otMode===modalities[8]){need('otAbsentPlan','conduta para atendimento não realizado');return result;}
    need('otDemand','demanda do atendimento');need('otPlan','plano / próximos passos');
    if((d['c:otInterventions']||[]).length){need('otIntervention','atividade/procedimento realizado');need('otPurpose','finalidade da intervenção');need('otResponse','resposta observada');}
    for(const id of ids(d,'otTest')){const r=testData(d,id),p=`otTest_${id}_`;for(const [k,l] of [['name','nome do instrumento'],['version','versão'],['origin','origem'],['status','estado da aplicação'],['date','data da aplicação']])need(p+k,l);if(['Parcial','Interrompida'].includes(r.status))need(p+'reason','motivo da aplicação incompleta');}
    return result;
  }
  // Versioned engine: a form may only be enabled with a verified catalog entry.
  // No restricted items or normative tables are bundled in this release.
  function scoreQuestionnaire(spec,answers){
    if(!spec?.permissionVerified || !spec?.version || !Array.isArray(spec.items) || !spec.items.length)return {state:'unavailable',score:null};
    let total=0,answered=0;const missing=[],invalid=[];
    for(const item of spec.items){const answer=answers[item.id];if(answer===null||answer===undefined||answer===''){missing.push(item.id);continue;}
      const option=item.options.find(x=>x.value===answer);if(!option||!Number.isFinite(option.points)){invalid.push(item.id);continue;}answered++;total+=option.points;
    }
    return {state:invalid.length?'invalid':missing.length?'partial':'complete',answered,required:spec.items.length,missing,invalid,score:missing.length||invalid.length?null:total};
  }
  function mount(){const f=document.querySelector('#clinical');
    const refresh=()=>{const absent=f.elements.otMode.value===modalities[8];f.querySelector('[data-session]').hidden=absent;f.querySelector('[data-absence]').closest('section').hidden=!absent;
      for(const el of f.querySelectorAll('[data-test]')){const p=`otTest_${el.dataset.test}_`,name=f.elements[p+'name'].value,is=name==='M-CHAT-R/F';el.querySelector('.ot-mchat').hidden=!is;el.querySelectorAll('.ot-mchat input,.ot-mchat select').forEach(x=>x.disabled=!is);const note=el.querySelector('.ot-license');note.replaceChildren();if(name){note.append(document.createTextNode('Registro de aplicação disponível. Questionário digital indisponível: autorização e versão para reprodução ainda não verificadas. '));if(catalog[name][1]){const link=document.createElement('a');link.href=catalog[name][1];link.textContent='Consultar fonte oficial ↗';link.target='_blank';link.rel='noopener noreferrer';note.append(link);}}if(is){const m=mchat(testData(Flow.data(),el.dataset.test));el.querySelector('[data-mchat-status]').textContent=[m.text,m.suggestion].filter(Boolean).join(' ');}}
    };
    f.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
      if(b.matches('[data-remove-row]')){const row=b.closest('fieldset');if([...row.querySelectorAll('input,textarea,select')].some(x=>x.type==='checkbox'?x.checked:x.value.trim())&&await Flow.dialog('Remover registro?','Os campos deste registro serão removidos da evolução.',[['cancel','Cancelar'],['remove','Remover']])!=='remove')return;row.remove();Flow.changed();}
      if(b.id==='ot-add-task'){const list=f.querySelector('#ot-tasks'),id=Math.max(0,...[...list.children].map(x=>+x.dataset.task))+1;list.insertAdjacentHTML('beforeend',taskRow(id));Flow.changed();}
      if(b.id==='ot-add-test'){const list=f.querySelector('#ot-tests'),id=Math.max(0,...[...list.children].map(x=>+x.dataset.test))+1;list.insertAdjacentHTML('beforeend',testRow(id));refresh();Flow.changed();}
      if(b.matches('[data-add-result]')){const test=b.closest('[data-test]'),list=test.querySelector('[data-results]'),id=Math.max(0,...[...list.children].map(x=>+x.dataset.result))+1;list.insertAdjacentHTML('beforeend',resultRow(test.dataset.test,id));Flow.changed();}
    });
    f.addEventListener('change',e=>{const test=e.target.closest('[data-test]');if(test&&/_(initial|version|age)$/.test(e.target.name)){const field=f.elements[`otTest_${test.dataset.test}_followState`];if(field.value==='Concluída')field.value='Revisão necessária';}if(e.target.name==='otMode'&&['Avaliação inicial','Reavaliação'].includes(e.target.value))f.querySelector('#ot-profile').open=true;refresh();});f.addEventListener('input',refresh);refresh();
  }
  return {form,mount,compose,issues,mchat,catalog,warnings,scoreQuestionnaire};
})();

const $ = (s) => document.querySelector(s);
const app = $("#app");
const modules = [
  ["home", "Início"],
  ["general", "Evolução"],
  ["renewal", "Renovação"],
  ["occupational", "Terapia Ocupacional"],
  ["has", "Hipertensão"],
  ["dm", "Diabetes"],
  ["both", "HAS + DM"],
  ["prenatal", "Pré-natal"],
  ["implante", "Implanon"],
  ["diu", "DIU"],
  ["lab", "Exames"],
  ["rx", "Receituário"],
];
const titles = {
  occupational: "Terapia Ocupacional",
  renewal: "Renovação de medicamentos",
  diu: "DIU · avaliação e inserção",
  implante: "Implanon · solicitação",
  prenatal: "Pré-natal",
  general: "Evolução geral",
  has: "Hipertensão",
  dm: "Diabetes",
  both: "Hipertensão + Diabetes",
  lab: "Exames laboratoriais",
  rx: "Receituário",
  history: "Histórico da sessão",
};
let logged = false,
  page = "home",
  drafts = {},
  history = [],
  extraCount = 0;
const generalState = [
  "Bom estado geral",
  "Regular estado geral",
  "Sem alterações relevantes",
  "Consciente",
  "Orientado",
  "Comunicativo",
  "Deambulando",
  "Restrito ao leito",
  "Sem queixas no momento",
  "Queixa principal",
];
const evaluation = [
  "Sem alterações",
  "Estado geral preservado",
  "Alimentação preservada",
  "Hidratação preservada",
  "Eliminações presentes",
  "Sono preservado",
  "Sem intercorrências",
  "Refere queixas",
  "Apresenta queixa",
];
const generalActions = [
  "Orientações realizadas",
  "Medicação administrada",
  "Exames solicitados",
  "Encaminhamento realizado",
  "Retorno orientado",
  "Acompanhamento mantido",
  "Adesão ao tratamento orientada",
  "Orientação sobre alimentação",
  "Orientação sobre atividade física",
  "Orientação sobre uso correto das medicações",
  "Orientação sobre sinais de alerta",
];
const medsHas = [
  "Uso regular das medicações orientado",
  "Uso correto das medicações orientado",
  "Adesão ao tratamento reforçada",
  "Necessidade de avaliação médica sinalizada",
];
const medsDm = [
  "Uso correto das medicações orientado",
  "Adesão ao tratamento reforçada",
  "Tratamento mantido conforme prescrição",
  "Necessidade de avaliação médica sinalizada",
];
const guideHas = [
  "Redução do consumo de sal",
  "Alimentação saudável",
  "Atividade física",
  "Controle da pressão arterial",
  "Acompanhamento regular",
  "Sinais de alerta",
  "Não interromper medicação sem orientação profissional",
];
const guideDm = [
  "Alimentação saudável",
  "Controle glicêmico",
  "Atividade física",
  "Monitorização da glicemia",
  "Uso correto das medicações",
  "Cuidados com os pés",
  "Inspeção dos pés",
  "Hidratação da pele",
  "Sinais de hipoglicemia",
  "Sinais de hiperglicemia",
  "Acompanhamento regular",
  "Não interromper medicação sem orientação profissional",
];
const examsHas = [
  "Hemograma",
  "Glicemia",
  "HbA1c",
  "Creatinina",
  "Ureia",
  "Perfil lipídico",
  "Sódio",
  "Potássio",
  "TGO",
  "TGP",
  "EAS",
];
const examsDm = [
  "Glicemia",
  "HbA1c",
  "Hemograma",
  "Creatinina",
  "Ureia",
  "TFG/eTFG",
  "Perfil lipídico",
  "TGO",
  "TGP",
  "EAS",
];
const returns = [
  "Retorno orientado",
  "Acompanhamento mantido",
  "Reavaliação orientada",
  "Encaminhamento realizado",
];
const labs = [
  [
    "Hemograma",
    [
      "Hb",
      "Ht",
      "Leuco",
      "Neutro",
      "Linf",
      "Mono",
      "Eos",
      "Baso",
      "Plaq",
      "VCM",
      "HCM",
      "CHCM",
      "RDW",
    ],
  ],
  ["Glicemia", ["Glic", "HbA1c"]],
  ["Função renal", ["Cr", "Ur", "TFG/eTFG"]],
  [
    "Função hepática",
    ["TGO", "TGP", "GGT", "FA", "BT", "BD", "BI", "Albumina"],
  ],
  ["Perfil lipídico", ["CT", "HDL", "LDL", "TG", "VLDL"]],
  ["Eletrólitos", ["Na", "K", "Ca", "Mg", "Cl"]],
  ["Tireoide", ["TSH", "T4L", "T3"]],
];
const percent = new Set([
  "Ht",
  "Neutro",
  "Linf",
  "Mono",
  "Eos",
  "Baso",
  "HbA1c",
  "RDW",
]);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const unique = (a) => [...new Set(a)];
const join = (a) =>
  a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " e " + a.at(-1);
const sentence = (s) => {
  s = String(s ?? "").trim().replace(/[.\s]+$/, "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) + "." : "";
};
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.style.display = "none"), 3000);
}
function login() {
  if (typeof Access !== "undefined") return Access.start();
  app.textContent = "Não foi possível carregar a autenticação. Recarregue a página.";
}
const iconPaths = {
  renewal: "M4 8a8 8 0 0113-3l3 3 M20 3v5h-5 M20 16a8 8 0 01-13 3l-3-3 M4 21v-5h5",
  diu: "M5 5h14 M12 5v13 M9 21c0-3 3-3 3-3s3 0 3 3",
  home: "M3 10l9-7 9 7v10H3z M9 20v-7h6v7",
  general: "M9 5H5v16h14V5h-4 M9 3h6v4H9z M8 12h8 M8 16h5",
  has: "M3 12h4l3-7 4 14 3-7h4",
  dm: "M12 3s-7 8-7 12a7 7 0 0014 0c0-4-7-12-7-12z",
  both: "M5 7h14v14H5z M9 7V3h6v4 M8 14h8 M12 10v8",
  prenatal: "M12 21S3 15 3 9a5 5 0 019-3 5 5 0 019 3c0 6-9 12-9 12z",
  implante: "M7 17L17 7 M5 19l2-2 M17 7l2-2 M4 16l4 4 M16 4l4 4",
  lab: "M9 3h6 M10 3v7l-6 9q-1 2 2 2h12q3 0 2-2l-6-9V3 M7 15h10",
  rx: "M6 21V3h6a5 5 0 010 10H6 M11 13l8 8 M19 13l-8 8",
  history: "M3 11a9 9 0 119 10 M3 4v7h7 M12 7v5l3 2",
};
function uiIcon(id) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[id] || iconPaths.general}"/></svg>`;
}

function collect() {
  const f = $("#clinical");
  if (!f) return;
  const d = {};
  new FormData(f).forEach((v, k) => {
    if (k.startsWith("c:")) {
      (d[k.split(":").slice(0, 2).join(":")] ??= []).push(v);
    } else d[k] = v;
  });
  d.output = $("#output")?.value ?? "";
  d.stale = $("#output")?.dataset.stale === "true";
  d.manual = $("#output")?.dataset.manual === "true";
  d.baseline = $("#output")?.dataset.baseline ?? "";
  drafts[page] = d;
}
function navigate(p) {
  collect();
  page = p;
  render();
  window.scrollTo(0, 0);
}
function field(name, label, placeholder = "", type = "text") {
  return `<label>${label}<input name="${esc(name)}" type="${type}" ${type === "text" && ["fc", "fr", "spo", "temp", "hgt", "glic", "a1c", "weight", "bmi", "pain"].includes(name) ? 'inputmode="decimal"' : ""} placeholder="${esc(placeholder)}" autocomplete="off"></label>`;
}
function chips(key, values) {
  const exclusive = [
    ["Bom estado geral", "Regular estado geral"],
    ["Deambulando", "Restrito ao leito"],
  ];
  return `<div class="chips">${values
    .map((v) => {
      const group = exclusive.findIndex((g) => g.includes(v));
      return `<label class="chip"><input type="${group >= 0 ? "radio" : "checkbox"}" name="c:${key}${group >= 0 ? ":" + group : ""}" value="${esc(v)}">${esc(v)}</label>`;
    })
    .join("")}</div>`;
}

function section(title, content) {
  return `<section class="panel"><h2>${title}</h2>${content}</section>`;
}
function outputPanel() {
  return `<aside class="result"><button class="primary generate" id="generate">REVISAR E SALVAR</button><section class="panel"><div class="row-title"><h2>${page === "lab" ? "LAB gerado" : "Evolução gerada"}</h2><span class="tag">Editável</span></div><label for="output" class="muted">Revise antes de copiar</label><textarea id="output" placeholder="O texto gerado aparecerá aqui. Apenas as informações preenchidas serão incluídas." spellcheck="true"></textarea><div class="actions"><button class="primary" id="copy">${page === "lab" ? "COPIAR LAB" : "COPIAR"}</button><button id="edit">Editar</button><button id="regenerate">Revisar e salvar</button><button id="clear">Limpar</button></div></section><p class="privacy">Sem cadastro de pacientes. Os rascunhos ficam na memória desta sessão. Cópias, impressões e arquivos exportados permanecem fora do controle da plataforma.</p></aside>`;
}
function clinical() {
  const g = page === "general",
    has = page === "has" || page === "both",
    dm = page === "dm" || page === "both";
  let body = Notes.form(page);
  if (g)
    body += section(
      "Estado geral",
      chips("state", generalState) +
        `<div class="section-extra">${field("complaint", "Queixa principal", "Descreva, se houver")}</div>`,
    );
  let fs = g
    ? [
        ["pa", "PA · mmHg", "130/80"],
        ["fc", "FC · bpm"],
        ["fr", "FR · irpm"],
        ["spo", "SpO₂ · %"],
        ["temp", "T · °C"],
        ["hgt", "HGT · mg/dL"],
        ["pain", "Dor · /10"],
      ]
    : [
        ...(has
          ? [
              ["pa", "PA · mmHg", "130/80"],
              ["fc", "FC · bpm"],
            ]
          : []),
        ...(dm
          ? [
              ["hgt", "HGT · mg/dL"],
              ["glic", "Glicemia · mg/dL"],
              ["a1c", "HbA1c · %"],
            ]
          : []),
        ["weight", "Peso · kg"],
        ["bmi", "IMC"],
      ];
  body += section(
    g ? "Sinais vitais" : "Avaliação rápida",
    `<div class="fields">${fs.map((x) => field(...x)).join("")}${g ? "" : `<label>Adesão ao tratamento<select name="adherence"><option value="">Não informado</option><option>Boa</option><option>Parcial</option><option>Baixa</option></select></label><div class="wide">${field("complaint", "Queixas", "Descreva, se houver")}</div>`}</div>`,
  );
  if (g) {
    body += section(
      "Avaliação",
      chips("evaluation", evaluation) +
        `<label class="section-extra">Observações adicionais<textarea name="observations" rows="2"></textarea></label>`,
    );
    body += section("Condutas realizadas", chips("actions", generalActions));
  } else {
    body += section(
      "Medicamentos",
      chips(
        "actions",
        unique([...(has ? medsHas : []), ...(dm ? medsDm : [])]),
      ),
    );
    body += section(
      "Orientações",
      chips(
        "guides",
        unique([...(has ? guideHas : []), ...(dm ? guideDm : [])]),
      ),
    );
    body += section(
      "Exames solicitados",
      chips("examFlag", ["Exames laboratoriais solicitados"]) +
        `<div class="section-extra">${chips("exams", unique([...(has ? examsHas : []), ...(dm ? examsDm : [])]))}</div><div class="section-extra">${field("otherExams", "Outros exames")}</div>`,
    );
    body += section("Retorno", chips("returns", returns));
  }
  body += `<details class="panel compact-details"><summary>Outras condutas (opcional)</summary><label>Outras condutas<textarea name="otherActions" rows="2" placeholder="Inclua somente condutas realizadas"></textarea></label></details>`;
  return `<div class="workspace"><form id="clinical" autocomplete="off">${body}</form>${outputPanel()}</div>`;
}
function labForm() {
  return `<div class="workspace"><form id="clinical" autocomplete="off">${section("Data da coleta", field("date", "Data dos exames", "", "date"))}${labs.map(([name, ls]) => `<details class="lab-group" open><summary>${name}</summary><div class="fields">${ls.map((v) => field("lab:" + v, v + (percent.has(v) ? " · %" : ""))).join("")}</div></details>`).join("")}${LabDetails.form()}${section("Outros exames", `<div id="extras"></div><button type="button" id="addLab">+ ADICIONAR EXAME</button>`)}</form>${outputPanel()}</div>`;
}
function addLab(values = {}) {
  const id = extraCount++;
  const row = document.createElement("div");
  row.className = "lab-row";
  row.innerHTML =
    field("extraName:" + id, "Sigla/nome") +
    field("extraValue:" + id, "Valor") +
    field("extraUnit:" + id, "Unidade") +
    '<button type="button" aria-label="Remover exame">×</button>';
  row.querySelector("button").onclick = () => {
    row.remove();
    Flow.changed();
  };
  row.querySelectorAll("input").forEach((x, i) => {
    x.removeAttribute("inputmode");
    x.value = [values.name, values.value, values.unit][i] ?? "";
  });
  $("#extras").append(row);
  if (!Object.keys(values).length) Flow.changed();
}
function dashboard() {
  const cards = [
    ["general", "✚", "Evolução geral", "Estado geral, avaliação e condutas."],
    ["occupational", "◎", "Terapia Ocupacional", "Evoluções, perfil ocupacional e instrumentos de avaliação."],
    ["renewal", "℞", "Renovação", "Solicitação, avaliação médica, medicamentos renovados e MUC."],
    ["has", "♡", "Hipertensão", "Acompanhamento da pressão arterial."],
    ["dm", "◇", "Diabetes", "Controle glicêmico e orientações."],
    [
      "both",
      "⊕",
      "Hipertensão + Diabetes",
      "Uma evolução integrada, sem repetições.",
    ],
    [
      "prenatal",
      "♡",
      "Pré-natal",
      "Idade gestacional, Protege, exame físico e condutas.",
    ],
    [
      "implante",
      "✚",
      "Implanon",
      "Questionário e evolução para solicitação do implante.",
    ],
    ["diu", "✚", "DIU", "Avaliação, solicitação e registro da inserção."],
    [
      "lab",
      "▤",
      "Exames laboratoriais",
      "Resultados no padrão LAB, prontos para copiar.",
    ],
    [
      "rx",
      "℞",
      "Receituário",
      "Modelo de Lagarto/SE, impressão e exportação PNG.",
    ],
  ];
  return `<div class="intro"><div><div class="eyebrow">Área de trabalho</div><h1>Qual registro<br>vamos preparar?</h1><p>Selecione um módulo para começar.</p></div><span class="intro-number" aria-hidden="true">027</span></div><div class="module-heading"><h2>Módulos de atendimento</h2><span>Selecione · Preencha · Revise</span></div><div class="cards">${cards.map(([id, icon, t, d]) => `<button class="card" data-nav="${id}"><span class="icon">${uiIcon(id)}</span><span class="arrow">↗</span><strong>${t}</strong><p>${d}</p></button>`).join("")}</div><div class="bottom-note"><span>Informações temporárias · Nenhum cadastro de pacientes</span><button data-nav="history">Histórico da sessão (${history.length})</button></div>`;
}
function render() {
  if (!logged) return login();
  app.innerHTML = `<a class="skip-link" href="#workspace-main">Ir ao conteúdo</a><header class="top"><div class="logo"><span class="mark">+</span>EQUIPE 027</div><div class="session"><span>Ferramentas da equipe</span><button id="logout">Sair</button></div></header><nav class="main-nav" aria-label="Navegação principal"><span class="nav-caption">Área de trabalho</span>${modules.map(([p, t]) => `<button data-nav="${p}" class="${page === p ? "active" : ""}" ${page === p ? 'aria-current="page"' : ""}>${uiIcon(p)}<span>${t}</span></button>`).join("")}<div class="nav-bottom"><button data-nav="history" class="${page === "history" ? "active" : ""}">${uiIcon("history")}<span>Histórico da sessão</span></button><p>Dados temporários.<br>Apagados ao encerrar.</p></div></nav><main id="workspace-main" tabindex="-1">${page === "home" ? dashboard() : `<div class="heading"><div><div class="eyebrow">EQUIPE 027 / ${page === "lab" ? "Resultados" : "Área de trabalho"}</div><h1 style="margin-top:10px">${titles[page]}</h1><p>${page === "rx" ? "Preencha as duas vias, revise e imprima." : page === "history" ? "Textos gerados nesta sessão." : "Preencha apenas o que foi avaliado ou realizado."}</p></div><button data-nav="home">Início</button></div>` + (page === "rx" ? `<p class="privacy rx-privacy">Os dados do receituário ficam apenas nesta sessão. Sair ou recarregar apaga o preenchimento.</p>` : page === "history" ? historyView() : page === "lab" ? labForm() : page === "prenatal" ? Prenatal.form() : page === "implante" ? Implante.form() : page === "diu" ? DIU.form() : page === "renewal" ? Renewal.form() : page === "occupational" ? Occupational.form() : clinical())}</main>`;
  syncReceituario();
  mountMobileNavigation();
  Flow.shell();
  Shortcuts.mount();
  app
    .querySelectorAll("[data-nav]")
    .forEach((b) => (b.onclick = () => navigate(b.dataset.nav)));
  $("#logout").onclick = () => Flow.end(true);
  if ($("#clinical")) {
    Flow.addFields();
    restore();
    if (page === "prenatal") Prenatal.mount();
    if (page === "implante") Implante.mount();
    if (page === "diu") DIU.mount();
    if (page === "renewal") Renewal.mount();
    if (page === "occupational") Occupational.mount();
    Notes.mount();
    Flow.mount();
    $("#clinical").onsubmit = (e) => e.preventDefault();
    $("#generate").onclick = generate;
    $("#regenerate").onclick = generate;
    $("#copy").onclick = () => Flow.copyCurrent();
    $("#edit").onclick = () => $("#output").focus();
    $("#clear").onclick = () => Flow.clear();
    if ($("#addLab")) $("#addLab").onclick = () => addLab();

  }
  app
    .querySelectorAll("[data-copy-index]")
    .forEach(
      (b) =>
        (b.onclick = () => copy(history[Number(b.dataset.copyIndex)].text)),
    );
  if ($("#clearHistory"))
    $("#clearHistory").onclick = async () => {
      if (
        (await Flow.dialog(
          "Limpar histórico?",
          "Os textos do histórico serão apagados.",
          [
            ["no", "Cancelar"],
            ["yes", "Limpar"],
          ],
        )) === "yes"
      ) {
        history = [];
        render();
      }
    };
}
function restore() {
  const d = drafts[page];
  if (!d) return;
  if (page === "lab") {
    Object.keys(d)
      .filter((k) => k.startsWith("extraName:"))
      .forEach((k) => {
        const id = k.split(":")[1];
        addLab({
          name: d[k],
          value: d["extraValue:" + id],
          unit: d["extraUnit:" + id],
        });
      });
  }
  $("#clinical")
    .querySelectorAll("input,select,textarea")
    .forEach((x) => {
      if (x.name.startsWith("extra")) return;
      if (x.type === "checkbox" || x.type === "radio")
        x.checked = (d[x.name.split(":").slice(0, 2).join(":")] ?? []).includes(
          x.value,
        );
      else x.value = d[x.name] ?? "";
    });
  $("#output").value = d.output ?? "";
  $("#output").dataset.stale = d.stale ? "true" : "false";
}
function resolveConflicts(e) {
  const x = e.target;
  if (x.type !== "checkbox" || !x.checked) return;
  const groups = [
    ["Bom estado geral", "Regular estado geral"],
    ["Deambulando", "Restrito ao leito"],
    [
      "Sem queixas no momento",
      "Queixa principal",
      "Refere queixas",
      "Apresenta queixa",
    ],
  ];
  for (const group of groups) {
    if (
      group.includes(x.value) &&
      !(
        group.includes("Sem queixas no momento") &&
        x.value !== "Sem queixas no momento"
      )
    ) {
      $("#clinical")
        .querySelectorAll("input[type=checkbox]")
        .forEach((y) => {
          if (y !== x && group.includes(y.value)) y.checked = false;
        });
    } else if (
      group.includes("Sem queixas no momento") &&
      group.includes(x.value)
    ) {
      $("#clinical")
        .querySelectorAll("input[type=checkbox]")
        .forEach((y) => {
          if (y.value === "Sem queixas no momento") y.checked = false;
        });
    }
  }
}
function compose(raw, p) {
  if (p === "occupational") return Occupational.compose(Care.normalize(raw));
  const d = Care.normalize(raw);
  Care.validate(d, p);
  return Care.decorate(composeBody(d, p), d, p);
}
function composeBody(d, p) {
  if (p === "renewal") return Renewal.compose(d);
  if (p === "diu") return DIU.compose(d);
  if (p === "implante") return Implante.compose(d);
  if (p === "prenatal") return Prenatal.compose(d);
  const vals = (k) => d["c:" + k] ?? [];
  const has = (k) => String(d[k] ?? "").trim() !== "";
  const parts = [];
  if (p === "lab") {
    if (!has("date")) throw Error("Informe a data dos exames.");
    const date = d.date.split("-").reverse().join("/");
    const order = [
      "Hb",
      "Ht",
      "Leuco",
      "Neutro",
      "Linf",
      "Mono",
      "Eos",
      "Baso",
      "Plaq",
      "VCM",
      "HCM",
      "CHCM",
      "RDW",
      "Cr",
      "Ur",
      "TFG/eTFG",
      "Glic",
      "HbA1c",
      "Na",
      "K",
      "Ca",
      "Mg",
      "Cl",
      "TGO",
      "TGP",
      "GGT",
      "FA",
      "BT",
      "BD",
      "BI",
      "Albumina",
      "CT",
      "HDL",
      "LDL",
      "TG",
      "VLDL",
      "TSH",
      "T4L",
      "T3",
    ];
    const items = order
      .filter((k) => has("lab:" + k))
      .map(
        (k) =>
          k + " " + Care.labValue(d["lab:" + k], percent.has(k) ? "%" : ""),
      );
    Object.keys(d)
      .filter((k) => k.startsWith("extraName:"))
      .forEach((k) => {
        const id = k.split(":")[1],
          v = "extraValue:" + id,
          u = "extraUnit:" + id;
        if (has(k) !== has(v) || (has(u) && !has(k)))
          throw Error("Complete o nome e o valor dos exames adicionais.");
        if (has(k) && has(v))
          items.push(d[k] + " " + Care.labValue(d[v], has(u) ? d[u] : ""));
      });
    items.push(...LabDetails.compose(d));
    if (!items.length) throw Error("Preencha ao menos um resultado.");
    return `LAB (${date}): ${items.join(" | ")}.`;
  }
  return Notes.compose(d, p);
}
async function generate() {
  return Flow.generate();
}
function saveHistory(text) {
  if (!history.some((h) => h.text === text))
    history.unshift({
      text,
      type: titles[page] ?? "Texto",
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
}
async function copy(text) {
  if (!text.trim()) return toast("Gere um texto antes de copiar.");
  try {
    await navigator.clipboard.writeText(text);
    if (page !== "history") saveHistory(text);
    toast(page === "lab" ? "LAB copiado!" : "Evolução copiada!");
  } catch {
    toast(
      "Não foi possível copiar automaticamente. Selecione e copie o texto.",
    );
    $("#output")?.select();
  }
}
function historyView() {
  return history.length
    ? `<div class="row-title"><span class="muted">${history.length} texto(s) · apagados ao encerrar a sessão</span><button id="clearHistory">Limpar histórico</button></div>${history.map((h, i) => `<article class="panel"><div class="row-title"><h2>${esc(h.type)}</h2><span class="tag">${h.time}</span></div><p class="history-text">${esc(h.text)}</p><button data-copy-index="${i}">Copiar</button></article>`).join("")}`
    : `<section class="panel empty"><h2>Nenhum texto nesta sessão</h2><p class="muted">As evoluções geradas aparecerão aqui temporariamente.</p><button class="primary" data-nav="general">Criar evolução</button></section>`;
}
window.addEventListener("pagehide", () => {
  drafts = {};
  history = [];
  logged = false;
  page = "home";
  Flow.reset();
  destroyReceituario();
  app.replaceChildren();
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) login();
});

login();

// Keep one isolated document mounted across tab changes, only in memory.
function syncReceituario() {
  let host = document.getElementById("rx-host");
  document.body.classList.toggle("rx-open", logged && page === "rx");
  if (logged && page === "rx" && !host) {
    host = document.createElement("section");
    host.id = "rx-host";
    host.setAttribute("aria-label", "Preenchimento de receituário");
    const frame = document.createElement("iframe");
    frame.id = "rx-frame";
    frame.title = "Receituário da Secretaria Municipal da Saúde de Lagarto";
    frame.src = "receituario.html?v=" + Care.version;
    host.append(frame);
    app.after(host);
  }
  if (host) host.hidden = !logged || page !== "rx";
}
function destroyReceituario() {
  document.getElementById("rx-host")?.remove();
  document.body.classList.remove("rx-open");
}

function mountMobileNavigation() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;
  const wrap = document.createElement("div");
  wrap.className = "mobile-nav";
  const label = document.createElement("label");
  label.htmlFor = "mobile-module";
  label.textContent = "Módulo";
  const select = document.createElement("select");
  select.id = "mobile-module";
  [...modules, ["history", "Histórico da sessão"]].forEach(([id, title]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = title;
    option.selected = page === id;
    select.append(option);
  });
  select.onchange = () => navigate(select.value);
  wrap.append(label, select);
  nav.after(wrap);
}
