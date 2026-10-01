/* Cervical sample collection: documentary model, no screening or diagnosis decisions. */
const Cervical = (()=>{
 const groups=[
 ['Atendimento',[
 ['cxType','Exame solicitado',['Citopatológico do colo do útero','DNA-HPV oncogênico']],
 ['cxPurpose','Finalidade',['Rastreamento','Repetição de coleta','Seguimento de alteração anterior','Investigação de sintomas','Outra']],
 ['cxReason','Indicação / motivo específico','area'],['recordDate','Data do atendimento','date'],['cxProfessional','Profissional responsável / registro','text']]],
 ['História e relato',[
 ['cxComplaintState','Queixas',['Sem queixas relatadas','Com queixas relatadas','Não investigadas']],['cxComplaint','Queixas / duração','area'],
 ['cxDum','DUM','date'],['cxCycle','Contexto menstrual',['Ciclos presentes','Menopausa','Amenorreia','DUM desconhecida']],
 ['cxPregnancy','Gestação informada',['Nega gestação','Gestante','Possibilidade de gestação não esclarecida','Não investigada']],
 ['cxContraception','Contracepção em uso','text'],['cxPrevious','Exame anterior',['Realizado','Nunca realizado','Não sabe informar']],
 ['cxPreviousDate','Data do exame anterior','date'],['cxPreviousResult','Exame anterior: tipo, resultado e fonte','area'],
 ['cxHistory','Antecedentes relevantes: histerectomia, lesões, tratamento, imunossupressão','area'],
 ['cxPreparation','Uso vaginal, sangramento ou outras condições que possam interferir','area']]],
 ['Decisão e exame realizado',[
 ['cxExplanation','Explicação do procedimento',['Realizada; dúvidas esclarecidas','Não realizada']],
 ['cxConsent','Concordância da paciente',['Concorda com a coleta','Não deseja realizar neste momento','Solicitou interrupção']],
 ['cxExam','Exame especular',['Realizado','Não realizado']],
 ['cxExternal','Inspeção externa, se realizada','area'],
 ['cxCervix','Visualização do colo',['Visualizado integralmente','Visualizado parcialmente','Não visualizado','Ausente após histerectomia']],
 ['cxAspect','Aspecto do colo',['Sem alterações macroscópicas observadas','Com alterações macroscópicas observadas']],
 ['cxSecretions','Secreções observadas',['Sem secreção anormal observada','Secreção observada']],
 ['cxFindings','Descrição dos achados / secreções / sangramento','area'],
 ['cxStatus','Situação da coleta',['Realizada','Interrompida com amostra obtida','Interrompida sem amostra','Não realizada']],
 ['cxNotDone','Motivo / dificuldades / decisão compartilhada','area']]],
 ['Amostra e procedimento',[
 ['cxDate','Data da coleta','date'],['cxMethod','Forma de coleta DNA-HPV',['Coleta pelo profissional','Autocoleta recebida']],
 ['cxSite','Local da amostra',['Colo uterino','Vaginal','Outro']],['cxSiteOther','Especificar local / particularidades','text'],
 ['cxCytoTechnique','Técnica citopatológica',['Convencional em lâmina','Em meio líquido']],
 ['cxCytoAreas','Material citopatológico obtido',['Ectocervical e endocervical','Ectocervical','Endocervical','Vaginal']],
 ['cxKit','Kit / meio / dispositivo utilizado','text'],['cxSampleId','Identificador da amostra / requisição','text'],
 ['cxLabel','Identificação e acondicionamento',['Conferidos e realizados','Pendência identificada']],
 ['cxDispatch','Encaminhamento da amostra',['Encaminhada ao laboratório','Aguardando transporte','Não encaminhada']],
 ['cxLab','Laboratório / destino','text'],['cxDispatchDate','Data do encaminhamento','date'],
 ['cxEvent','Intercorrências',['Sem intercorrências observadas','Com intercorrências']],['cxEventDetails','Intercorrências e medidas adotadas','area'],
 ['cxAfter','Condições após o procedimento / dor / sangramento','area']]],
 ['Orientações e retorno',[
 ['cxGuidance','Orientações adicionais efetivamente realizadas','area'],['cxPlan','Avaliação / conduta / encaminhamento','area'],
 ['cxResultState','Disponibilidade do laudo',['Aguardando resultado','Resultado já disponível em atendimento posterior']],
 ['cxReturnDate','Data prevista para retorno','date'],['cxReturn','Prazo, local e forma de acesso ao resultado','text']]]
 ];
 const guidance=['Explicada a finalidade do exame','Orientada sobre como obter o resultado','Orientada a retornar para avaliação do laudo','Esclarecido que a coleta não informa o resultado','Orientada sobre possíveis desconfortos após a coleta','Orientada a procurar atendimento diante de sintomas persistentes ou intensos'];
 const val=(d,k)=>String(d[k]??'').trim();
 const sampled=d=>['Realizada','Interrompida com amostra obtida'].includes(d.cxStatus);
 function active(k,d){if(['cxEvent','cxEventDetails','cxAfter'].includes(k))return ['Realizada','Interrompida com amostra obtida','Interrompida sem amostra'].includes(d.cxStatus);if(k.startsWith('cxCyto'))return sampled(d)&&d.cxType==='Citopatológico do colo do útero';if(k==='cxMethod')return sampled(d)&&d.cxType==='DNA-HPV oncogênico';if(['cxCervix','cxAspect','cxSecretions','cxFindings'].includes(k))return d.cxExam==='Realizado';if(groups[3][1].some(x=>x[0]===k))return sampled(d);return true;}
 function field([k,label,type]){return `<label data-cx-field="${k}">${esc(label)}${Array.isArray(type)?`<select name="${k}"><option value="">Não informado</option>${type.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`:type==='area'?`<textarea name="${k}" rows="2"></textarea>`:`<input name="${k}" type="${type}" autocomplete="off">`}</label>`;}
 function form(){return `<div class="workspace"><form id="clinical">${groups.map(([title,fields],i)=>section(title,`<div class="fields two">${fields.map(field).join('')}</div>${i===4?'<p class="privacy">Selecione apenas orientações realizadas.</p>'+chips('cxGuides',guidance):''}`)).join('')}${section('Como o texto é gerado',`<p class="privacy">O início será “Paciente comparece à unidade para coleta de material para exame citopatológico do colo do útero” ou “... para teste de DNA-HPV oncogênico”, conforme a escolha. A realização só é afirmada quando registrada. Campos inativos ficam preservados no rascunho, mas não entram no texto.</p><p class="privacy">Modelo documental elaborado a partir de referências oficiais, não transcrição de uma evolução padronizada nacional. A adequabilidade da amostra e o resultado pertencem ao laudo laboratorial. O protocolo local e as instruções do kit orientam a coleta. Não há definição automática de elegibilidade, periodicidade ou encaminhamento.</p><p class="privacy"><a href="https://www.inca.gov.br/publicacoes/formularios/requisicao-de-exame-citopatologico-colo-do-utero" target="_blank" rel="noopener noreferrer">INCA · requisição citopatológica ↗</a><br><a href="https://linhasdecuidado.saude.gov.br/portal/cancer-do-colo-do-utero/unidade-de-atencao-primaria/vigilancia-em-saude/tecnica-exame-citopatologico" target="_blank" rel="noopener noreferrer">Ministério da Saúde · registro da coleta e acompanhamento ↗</a><br><a href="https://www.gov.br/saude/pt-br/assuntos/pcdt/r/rastreamento-cancer-do-colo-do-utero/view" target="_blank" rel="noopener noreferrer">Diretrizes brasileiras · DNA-HPV (2025) ↗</a></p>`)}</form>${outputPanel()}</div>`;}
 function compose(d){if(!Object.keys(d).some(k=>(k.startsWith('cx')||k==='c:cxGuides')&&(Array.isArray(d[k])?d[k].length:val(d,k))))return '';
 const intro=d.cxType==='DNA-HPV oncogênico'&&d.cxMethod==='Autocoleta recebida'&&sampled(d)?'Paciente comparece à unidade para entrega de material obtido por autocoleta para teste de DNA-HPV oncogênico.':d.cxType==='Citopatológico do colo do útero'?'Paciente comparece à unidade para coleta de material para exame citopatológico do colo do útero.':d.cxType==='DNA-HPV oncogênico'?'Paciente comparece à unidade para coleta de material para teste de DNA-HPV oncogênico.':'Paciente comparece à unidade para atendimento relacionado à coleta de exame do colo do útero.';
 const out=[intro];groups.forEach(([title,fields])=>{const parts=fields.filter(([k])=>k!=='cxType'&&active(k,d)&&val(d,k)).map(([k,label,type])=>label+': '+(type==='date'?val(d,k).split('-').reverse().join('/'):val(d,k)));if(title==='Orientações e retorno'&&(d['c:cxGuides']||[]).length)parts.unshift('Orientações realizadas: '+d['c:cxGuides'].join('; '));if(parts.length)out.push(title+': '+parts.map(sentence).join(' '));});return out.join('\n\n');}
 function issues(d){const a=[],add=(message,keys)=>a.push({message,keys,values:keys.map(k=>val(d,k)).filter(Boolean)});
 if(d.cxComplaintState==='Sem queixas relatadas'&&val(d,'cxComplaint'))add('Ausência de queixas e queixa descrita: revise o contexto ou a seleção.',['cxComplaintState','cxComplaint']);
 if(sampled(d)&&d.cxConsent==='Não deseja realizar neste momento')add('Coleta com amostra registrada e recusa: confira os momentos e a situação da coleta.',['cxStatus','cxConsent']);
 if(d.cxStatus==='Realizada'&&d.cxConsent==='Solicitou interrupção')add('Confira se a coleta foi concluída antes da solicitação de interrupção ou ajuste sua situação.',['cxStatus','cxConsent']);
 if(active('cxEvent',d)&&d.cxEvent==='Sem intercorrências observadas'&&val(d,'cxEventDetails'))add('Há descrição de intercorrência com seleção de ausência. Revise.',['cxEvent','cxEventDetails']);
 if(d.cxExam==='Realizado'&&['Não visualizado','Ausente após histerectomia'].includes(d.cxCervix)&&val(d,'cxAspect'))add('Aspecto do colo preenchido sem colo visualizado. Confira os achados.',['cxCervix','cxAspect']);
 if(sampled(d)&&d.cxType==='Citopatológico do colo do útero'&&d.cxCytoAreas==='Vaginal'&&d.cxSite==='Colo uterino')add('Local vaginal e colo uterino: confira a origem da amostra.',['cxCytoAreas','cxSite']);
 if(sampled(d)&&d.cxType==='DNA-HPV oncogênico'&&d.cxMethod==='Autocoleta recebida'&&d.cxSite==='Colo uterino')add('Autocoleta com local cervical: confira o local efetivo registrado.',['cxMethod','cxSite']);
 for(const k of ['cxDum','cxPreviousDate','cxDate','cxDispatchDate','cxReturnDate']){if(!active(k,d)||!val(d,k))continue;const dt=new Date(d[k]+'T12:00:00Z');if(isNaN(dt)||dt.toISOString().slice(0,10)!==d[k]||+d[k].slice(0,4)<1900)add('Confira a data informada.',[''+k]);if(d.recordDate&&k!=='cxReturnDate'&&k!=='cxDispatchDate'&&d[k]>d.recordDate)add('Data posterior ao atendimento: confira o registro.',['recordDate',k]);}
 if(d.cxReturnDate&&d.recordDate&&d.cxReturnDate<d.recordDate)add('Retorno anterior ao atendimento.',['cxReturnDate','recordDate']);
 if(sampled(d)&&d.cxDispatchDate&&d.cxDate&&d.cxDispatchDate<d.cxDate)add('Encaminhamento anterior à coleta.',['cxDispatchDate','cxDate']);
 return a;}
 function mount(){const f=document.querySelector('#clinical');const update=()=>{const d=Object.fromEntries(new FormData(f));f.querySelectorAll('[data-cx-field]').forEach(el=>{el.hidden=!active(el.dataset.cxField,d);});};f.addEventListener('change',update);update();}
 return {form,compose,issues,mount};
})();

/* Puericultura: documentary fields only, no inferred examination or diagnosis. */
const ChildCare = (() => {
  const screens=['Fenilcetonúria','Hipotireoidismo congênito','Doença falciforme / hemoglobinopatias','Fibrose cística','Hiperplasia adrenal congênita','Deficiência de biotinidase','Toxoplasmose IgM'];
  const v=(d,k)=>String(d[k]??'').trim();
  const input=(k,l,type='text')=>`<label>${esc(l)}<input name="${k}" type="${type}" autocomplete="off" ${type==='number'?'step="any"':''}></label>`;
  const area=(k,l)=>`<label>${esc(l)}<textarea name="${k}" rows="2"></textarea></label>`;
  const select=(k,l,opts)=>`<label>${esc(l)}<select name="${k}"><option value="">Não informado</option>${opts.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>`;
  const grid=a=>'<div class="fields two">'+a.join('')+'</div>';
  const num=s=>/^\d+(?:[.,]\d+)?$/.test(String(s))?Number(String(s).replace(',','.')):NaN;
  function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s&&+s.slice(0,4)>=1900?d:null;}
  const fmt=s=>date(s)?s.split('-').reverse().join('/'):s;
  function age(d){const b=date(v(d,'pcBirth')),a=date(v(d,'recordDate'));if(!b||!a||a<b)return '';const days=Math.round((a-b)/86400000);if(days<7)return `${days} dia${days===1?'':'s'}`;if(days<28){const w=Math.floor(days/7),r=days%7;return `${w} semana${w===1?'':'s'}`+(r?` e ${r} dia${r===1?'':'s'}`:'');}let months=(a.getUTCFullYear()-b.getUTCFullYear())*12+a.getUTCMonth()-b.getUTCMonth()-(a.getUTCDate()<b.getUTCDate()?1:0);return months<24?`${months} mês(es) completos`:`${Math.floor(months/12)} ano(s) e ${months%12} mês(es) completos`;}
  function bmi(d){const w=num(d.pcWeight),h=num(d.pcLength);return w>0&&h>0?(w/(h/100)**2).toFixed(2).replace('.',','):'';}
  // Descriptions summarized for documentation, not a validated screening instrument.
  const motorItems=[
    ['headProne',2,'Eleva a cabeça em prono'],['limbs',2,'Movimenta ambos os braços e pernas'],
    ['headSteady',4,'Sustenta a cabeça sem apoio no colo'],['handsMouth',4,'Leva mãos à boca'],['forearms',4,'Apoia-se nos antebraços em prono'],
    ['roll',6,'Rola de prono para supino'],['arms',6,'Estende braços em prono'],['tripod',6,'Senta apoiando as mãos'],
    ['sitTransition',9,'Chega à posição sentada'],['sit',9,'Senta sem apoio'],['transfer',9,'Transfere objetos entre mãos'],
    ['pullStand',12,'Levanta-se com apoio'],['cruise',12,'Anda apoiado em móveis'],['pincer',12,'Usa pinça polegar–indicador'],
    ['steps',15,'Dá passos independentes'],['walk',18,'Anda sem apoio'],['scribble',18,'Rabisca'],
    ['kick',24,'Chuta bola'],['run',24,'Corre'],['stairs',24,'Sobe degraus, com ou sem ajuda'],['spoon',24,'Alimenta-se com colher']
  ];
  const whoItems=[['assistStand','Fica em pé com ajuda','4,8–11,4'],['crawl','Engatinha em quatro apoios','5,2–13,5'],['stand','Fica em pé sem apoio','6,9–16,9']];
  const reflexItems=[
    ['moro','Moro','Presente ao nascimento a termo; diminui após aproximadamente 3 meses e costuma desaparecer até 6 meses.','Futagi et al. (2012)'],
    ['palmar','Preensão palmar','Presente ao nascimento a termo; redução após os primeiros 3 meses e desaparecimento geralmente até 6 meses.','Futagi et al. (2012)'],
    ['plantar','Preensão plantar','Presente ao nascimento a termo; redução após os primeiros 6 meses e desaparecimento geralmente até 12 meses.','Futagi et al. (2012)'],
    ['rooting','Busca / procura','Presente ao nascimento; a referência didática agrupa sua inibição nos primeiros meses, até 6 meses, sem fixar uma data individual.','FCM–Unicamp'],
    ['sucking','Sucção reflexa','Presente ao nascimento; redução do componente reflexo por volta de 2 meses nesta referência. A capacidade de sugar não desaparece.','FCM–Unicamp'],
    ['stepping','Marcha automática / reflexa','Presente ao nascimento; desaparecimento por volta de 2 meses nesta referência. Não corresponde à marcha voluntária posterior.','FCM–Unicamp'],
    ['atnr','Tônico-cervical assimétrico (RTCA)','Presente ao nascimento; a referência didática agrupa sua inibição nos primeiros meses, até 6 meses, sem fixar uma data individual.','FCM–Unicamp'],
    ['galant','Galant / encurvamento do tronco','Presente ao nascimento; a referência didática agrupa sua inibição nos primeiros meses, até 6 meses, sem fixar uma data individual.','FCM–Unicamp']
  ];
  function motorRow(id,label,reference){return `<fieldset class="motor-row"><legend>${esc(label)}</legend><p class="privacy">${esc(reference)}</p><div class="chips" role="group" aria-label="${esc(label)}">${['Presente','Ausente','Não avaliado'].map(s=>`<label class="chip"><input type="radio" name="pcMotor_${id}" value="${s}">${s}</label>`).join('')}</div><details><summary>Fonte e observações</summary>${grid([select('pcMotorSource_'+id,'Fonte deste registro',['Observado nesta consulta','Relatado pelo responsável','Registro anterior / documento']),area('pcMotorNote_'+id,'Condições, ajuda, assimetria ou motivo de não avaliação')])}</details></fieldset>`;}
  function motorForm(){return section('Marcos motores · 0 a 24 meses',`<p class="privacy">Sem respostas pré-marcadas. “Ausente” registra a avaliação informada; não confirma atraso. Se não examinou e não obteve relato, use “Não avaliado”. Habilidades adquiridas não têm idade prevista para desaparecer. Os reflexos ficam separados abaixo.</p>${grid([select('pcMotorAgeBasis','Idade considerada pelo profissional',['Cronológica','Corrigida por prematuridade']),input('pcMotorCorrected','Idade corrigida informada (meses)','number'),area('pcMotorEarly','0–2 meses: movimentos espontâneos, simetria e condições observadas'),select('pcMotorLoss','Perda de habilidade previamente adquirida',['Relatada / observada','Não identificada na avaliação']),area('pcMotorLossDetails','Qual habilidade, desde quando e fonte'),area('pcMotorPlan','Avaliação / conduta relacionada ao desenvolvimento motor')])}<p class="privacy">Idades de acompanhamento (Pediatrics, 2022): referência para a maioria das crianças (≥75%), não idade exata de aparecimento nem prazo para esperar. Em prematuros, registre a idade utilizada; não há correção automática ou classificação de atraso.</p>${[2,4,6,9,12,15,18,24].map(n=>`<details class="motor-age"><summary>Referência: ${n} meses</summary>${motorItems.filter(x=>x[1]===n).map(([id,month,label])=>motorRow(id,label,'Idade de referência: '+month+' meses · Zubler et al., Pediatrics (2022).')).join('')}</details>`).join('')}<details class="motor-age"><summary>Janelas de aquisição da OMS · habilidades adicionais</summary><p class="privacy">Percentis 1–99 em meses, não limites diagnósticos. Nem toda criança engatinha em quatro apoios.</p>${whoItems.map(([id,label,range])=>motorRow(id,label,'Janela observada: '+range+' meses · OMS, Acta Paediatrica (2006).')).join('')}<p class="privacy">Outras janelas: sentar sem apoio 3,8–9,2; andar com ajuda 6,0–13,7; andar sozinho 8,2–17,6 meses. A idade de referência da lista acima e a janela da OMS usam critérios distintos.</p></details><details class="motor-age"><summary>Reflexos primitivos · presença e desaparecimento</summary><p class="privacy">Respostas reflexas, diferentes dos marcos voluntários. Referências aproximadas para nascidos a termo, com variação entre autores e condições do exame. As referências de nascimento não indicam a primeira manifestação intrauterina. A presença ou ausência isolada não define normalidade ou doença. Não executar manobras sem treinamento; registre apenas avaliação efetivamente realizada.</p>${reflexItems.map(([id,label,ref,source])=>motorRow(id,label,ref+' Fonte: '+source+'.')).join('')}</details><details class="motor-age"><summary>Referências científicas e limites</summary><p class="privacy">Lista de apoio ao registro, sem escore, diagnóstico ou reprodução de uma escala validada. Ausência isolada deve ser interpretada no contexto da idade, oportunidade, fonte e exame. Perda de habilidade exige avaliação profissional, sem esperar a próxima faixa.</p><ul class="motor-sources"><li><a href="https://doi.org/10.1542/peds.2021-052138" target="_blank" rel="noopener noreferrer">Zubler et al. Pediatrics. 2022;149(3):e2021052138. Tabela 6.</a></li><li><a href="https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/motor-development-milestones/mm_windows_table.pdf" target="_blank" rel="noopener noreferrer">WHO Motor Development Study. Acta Paediatr Suppl. 2006;450:86–95. Tabela OMS.</a></li><li><a href="https://doi.org/10.1155/2012/191562" target="_blank" rel="noopener noreferrer">Futagi, Toribe e Suzuki. International Journal of Pediatrics. 2012:191562.</a></li><li><a href="https://www.fcm.unicamp.br/fcm/neuropediatria-conteudo-didatico/exame-neurologico/reflexos-primitivos" target="_blank" rel="noopener noreferrer">FCM–Unicamp. Reflexos primitivos. Material didático acadêmico complementar (não é artigo de revista).</a></li><li><a href="https://www.scielo.br/j/anp/a/nMyVy6WXGgNyrTSFg7cY5cK/?lang=pt" target="_blank" rel="noopener noreferrer">Olhweiler, Silva e Rotta. Arq Neuropsiquiatr. 2005. Estudo em prematuros: variação mesmo com idade corrigida.</a></li></ul><p class="privacy">Referências verificadas em 01/10/2026. Resumo em português; não é tradução validada de instrumento.</p></details>`);}
  function motorText(d){const lines=[],put=(k,l)=>{if(v(d,k))lines.push(l+': '+v(d,k));};put('pcMotorAgeBasis','Idade de referência adotada');if(v(d,'pcMotorCorrected'))lines.push('Idade corrigida informada: '+d.pcMotorCorrected+' meses');put('pcMotorEarly','Observação motora inicial');
    function rows(items){return items.map(item=>{const id=item[0],label=typeof item[1]==='number'?item[2]:item[1],state=v(d,'pcMotor_'+id),source=v(d,'pcMotorSource_'+id),note=v(d,'pcMotorNote_'+id);if(!state&&!source&&!note)return '';return label+': '+(state||'situação não informada')+(source?' — '+source.toLowerCase():'')+(note?' ('+note+')':'');}).filter(Boolean);}
    const milestones=rows([...motorItems,...whoItems]),reflexes=rows(reflexItems);if(milestones.length)lines.push('Marcos motores: '+milestones.join('; '));if(reflexes.length)lines.push('Reflexos primitivos: '+reflexes.join('; '));put('pcMotorLoss','Perda de habilidade previamente adquirida');put('pcMotorLossDetails','Detalhes da perda');put('pcMotorPlan','Conduta motora');return lines.map(sentence).join(' ');}
  function motorIssues(d){const out=[],add=(message,keys)=>out.push({message,keys,values:keys.map(k=>v(d,k)).filter(Boolean)});if(d.pcMotorLoss==='Relatada / observada')add('Perda de habilidade registrada: confira início, contexto e conduta; requer avaliação profissional. Este alerta não impede a cópia.',['pcMotorLoss','pcMotorLossDetails','pcMotorPlan']);if(d.pcMotorAgeBasis==='Corrigida por prematuridade'&&!v(d,'pcMotorCorrected'))add('Informe a idade corrigida considerada ou revise a base de idade.',['pcMotorAgeBasis','pcMotorCorrected']);if(v(d,'pcMotorCorrected')&&(!Number.isFinite(num(d.pcMotorCorrected))||num(d.pcMotorCorrected)<0))add('Confira a idade corrigida informada.',['pcMotorCorrected']);return out;}

  function form(){return `<div class="workspace"><form id="clinical">
    ${section('Identificação e atendimento',grid([input('recordDate','Data do atendimento','date'),input('pcName','Nome da criança'),input('pcBirth','Data de nascimento','date'),input('pcBirthTime','Horário do nascimento','time'),input('pcAgeReported','Idade informada (se não houver datas)'),select('pcSex','Sexo registrado',['Feminino','Masculino','Outro / não especificado']),input('pcResponsible','Responsável / acompanhante'),input('pcRelationship','Vínculo com a criança'),input('pcProfessional','Profissional responsável / registro')])+'<p class="privacy" id="pc-age-status" role="status">A idade será calculada com as datas preenchidas.</p>')}
    ${section('Motivo e relato',grid([select('pcReason','Motivo do atendimento',['Acompanhamento de rotina','Primeira consulta','Retorno','Queixa / intercorrência']),area('pcComplaint','Queixa principal / relato do responsável'),input('pcCordFall','Queda do coto umbilical: data ou tempo relatado'),area('pcSince','Intercorrências desde a última consulta')]))}
    ${section('Gestação e nascimento',grid([select('pcPrenatal','Pré-natal realizado',['Sim','Não']),input('pcPrenatalVisits','Número de consultas','number'),select('pcDelivery','Tipo de parto',['Vaginal','Cesárea','Instrumental','Outro']),input('pcGestWeeks','Idade gestacional ao nascer: semanas','number'),input('pcGestDays','Dias adicionais (0–6)','number'),input('pcBirthWeight','Peso ao nascer (g; ex.: 3294)','number'),input('pcBirthLength','Comprimento ao nascer (cm)','number'),input('pcApgar1','Apgar no 1º minuto (0–10)','number'),input('pcApgar5','Apgar no 5º minuto (0–10)','number'),area('pcPregnancy','Intercorrências gestacionais / perinatais'),area('pcNeonatal','Internação neonatal / condições da alta')]))}
    ${section('Triagens neonatais',grid([select('pcHeelStatus','Teste do pezinho: situação',['Coletado','Resultado apresentado','Aguardando resultado','Não realizado','Recoleta indicada']),input('pcHeelDate','Data da coleta','date'),input('pcHeelReport','Data do resultado','date')])+grid(screens.map((n,i)=>select('pcScreen'+i,n,i===6?['Não reagente','Reagente','Indeterminado','Pendente','Não consta no laudo']:['Dentro da normalidade','Alterado','Inconclusivo','Pendente','Não consta no laudo'])))+grid([area('pcHeelOther','Outras doenças triadas / detalhes do laudo'),area('pcHeelPlan','Conduta relativa à triagem'),area('pcHearing','Teste da orelhinha: data, resultado e fonte'),area('pcEye','Teste do olhinho: data, resultado e fonte'),area('pcHeart','Teste do coraçãozinho: data, resultado e fonte'),area('pcOtherScreen','Outras triagens apresentadas')])+'<p class="privacy">Transcreva apenas os resultados do laudo. Triagem não equivale a diagnóstico.</p>')}
    ${section('Vacinação',grid([select('pcVaccineStatus','Situação vacinal',['Atualizada conforme conferência','Atrasada conforme conferência','Caderneta não apresentada','Não avaliada']),select('pcVaccineSource','Fonte da informação',['Caderneta conferida','Registro eletrônico conferido','Relato do responsável']),area('pcVaccineHistory','Vacinas registradas: nome, dose e data (ex.: BCG, hepatite B)'),area('pcVaccinesToday','Vacinas administradas neste atendimento'),area('pcVaccinePlan','Pendências / encaminhamento / próximas doses')])+'<p class="privacy">Registre as datas efetivas. A plataforma não presume vacinação nem define o calendário.</p>')}
    ${section('Crescimento',grid([input('pcWeight','Peso atual (kg)','number'),input('pcLength','Comprimento / estatura atual (cm)','number'),select('pcMeasure','Forma de medição',['Comprimento deitado','Estatura em pé']),input('pcHead','Perímetro cefálico (cm)','number'),input('pcChest','Perímetro torácico (cm), se aferido','number'),select('pcGraph','Registro nos gráficos da caderneta',['Realizado neste atendimento','Não realizado']),area('pcGrowth','Avaliação da curva / tendência e referência utilizada')])+'<p class="privacy" id="pc-bmi-status" role="status">IMC calculado após peso e comprimento. Sem classificação automática para crianças.</p>')}
    ${section('Alimentação e rotina',grid([select('pcFeeding','Alimentação',['Aleitamento materno exclusivo','Aleitamento materno predominante','Aleitamento materno misto / parcial','Fórmula infantil','Alimentação complementar com aleitamento','Alimentação complementar sem aleitamento','Outra']),select('pcFeedDifficulty','Dificuldade na alimentação',['Relatada','Não relatada']),area('pcFeedDetails','Dificuldade, pega, sucção, frequência e avaliação realizada'),area('pcFood','Fórmula / preparo / outros alimentos ou líquidos informados'),area('pcElimination','Diurese e evacuações'),area('pcSleep','Sono e rotina'),area('pcMeds','Medicamentos / suplementos em uso'),area('pcAllergy','Alergias informadas')]))}
    ${section('Desenvolvimento e contexto',grid([area('pcDevReport','Aquisições / preocupações relatadas pelo responsável'),area('pcDevObserved','Habilidades e respostas observadas nesta consulta'),area('pcDevAssessment','Avaliação do desenvolvimento / instrumento e referência'),area('pcPlay','Brincar, interação e estímulos no cotidiano'),area('pcSupport','Rede de apoio / condições de cuidado')]))}
    ${motorForm()}
    ${section('Exame físico realizado',grid([area('pcGeneral','Estado geral e sinais vitais aferidos'),area('pcSkin','Pele, mucosas e hidratação'),area('pcHeadExam','Cabeça, fontanelas e perímetro: achados'),area('pcMouth','Olhos, ouvidos e cavidade oral: achados'),area('pcCardio','Exame cardiopulmonar'),area('pcAbdomen','Abdome e região umbilical'),area('pcGenitals','Genitais / região perineal, se examinados'),area('pcMotor','Tônus, movimentos, quadris e reflexos avaliados'),area('pcExamOther','Outros achados')])+'<p class="privacy">Campos vazios não geram achados normais nem negativas.</p>')}
    ${section('Avaliação, conduta e retorno',grid([area('pcAssessment','Síntese da avaliação profissional'),area('pcConduct','Condutas efetivamente realizadas'),area('pcGuidance','Orientações realizadas ao responsável'),area('pcReferral','Avaliação compartilhada / encaminhamentos e motivo'),input('pcReturnDate','Data de retorno','date'),input('pcReturn','Prazo / finalidade do retorno')])+'<p class="privacy"><a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta" target="_blank" rel="noopener noreferrer">Referência: Caderneta da Criança · Ministério da Saúde ↗</a></p>')}
    </form>${outputPanel()}</div>`;}
  function issues(d){const a=[],add=(message,keys)=>a.push({message,keys,values:keys.map(k=>v(d,k)).filter(Boolean)});
    for(const k of ['recordDate','pcBirth','pcHeelDate','pcHeelReport','pcReturnDate'])if(v(d,k)&&!date(d[k]))add('Confira a data e o ano informado.',[k]);
    if(date(d.pcBirth)&&date(d.recordDate)&&d.pcBirth>d.recordDate)add('Nascimento posterior ao atendimento. Confira as datas.',['pcBirth','recordDate']);
    for(const k of ['pcHeelDate','pcHeelReport'])if(date(d[k])&&date(d.pcBirth)&&d[k]<d.pcBirth)add('Data de triagem anterior ao nascimento.',['pcBirth',k]);
    if(date(d.pcHeelReport)&&date(d.pcHeelDate)&&d.pcHeelReport<d.pcHeelDate)add('Resultado anterior à coleta. Confira as datas.',['pcHeelDate','pcHeelReport']);
    for(const k of ['pcHeelDate','pcHeelReport'])if(date(d[k])&&date(d.recordDate)&&d[k]>d.recordDate)add('Triagem com data posterior ao atendimento. Confira o registro.',['recordDate',k]);
    if(date(d.pcReturnDate)&&date(d.recordDate)&&d.pcReturnDate<d.recordDate)add('Retorno anterior ao atendimento.',['pcReturnDate','recordDate']);
    for(const k of ['pcWeight','pcLength','pcHead','pcChest','pcBirthWeight','pcBirthLength'])if(v(d,k)&&!(num(d[k])>0))add('A medida deve ser um número maior que zero. Confira a unidade.',[k]);
    for(const k of ['pcApgar1','pcApgar5','pcGestDays','pcGestWeeks','pcPrenatalVisits'])if(v(d,k)&&(!Number.isInteger(num(d[k]))||num(d[k])<0||(['pcApgar1','pcApgar5'].includes(k)&&num(d[k])>10)||(k==='pcGestDays'&&num(d[k])>6)||(k==='pcGestWeeks'&&(num(d[k])<1||num(d[k])>45))))add('Confira o valor inteiro e a faixa indicada no campo.',[k]);
    if(d.pcPrenatal==='Não'&&num(d.pcPrenatalVisits)>0)add('Pré-natal não realizado com consultas informadas.',['pcPrenatal','pcPrenatalVisits']);
    const resultKeys=screens.map((_,i)=>'pcScreen'+i).filter(k=>v(d,k)&&!['Pendente','Não consta no laudo'].includes(d[k]));
    if(['Não realizado','Aguardando resultado'].includes(d.pcHeelStatus)&&resultKeys.length)add('Situação do teste e resultados preenchidos podem se referir a etapas diferentes. Confira o laudo.',['pcHeelStatus',...resultKeys]);
    if(d.pcVaccineStatus?.includes('conferência')&&d.pcVaccineSource==='Relato do responsável')add('Situação definida por conferência com fonte apenas relatada. Confira a fonte.',['pcVaccineStatus','pcVaccineSource']);
    if(d.pcFeeding==='Aleitamento materno exclusivo'&&v(d,'pcFood'))add('Aleitamento exclusivo com outros alimentos ou líquidos descritos: confira o relato.',['pcFeeding','pcFood']);
    return a.concat(motorIssues(d));
  }
  function compose(d){if(!Object.keys(d).some(k=>k.startsWith('pc')&&v(d,k)))return '';const out=['Paciente comparece à unidade para consulta de puericultura'+(d.pcReason?' — '+d.pcReason.toLowerCase():'')+'.'];
    const block=(title,items)=>{const parts=items.filter(Boolean);if(parts.length)out.push(title+': '+parts.map(sentence).join(' '));};
    const f=(k,label)=>v(d,k)?label+': '+v(d,k):'';
    const dt=(k,label)=>v(d,k)?label+': '+fmt(d[k]):'';
    const m=(k,label,unit)=>v(d,k)?label+': '+v(d,k)+' '+unit:'';
    block('Identificação',[f('pcName','Nome'),dt('pcBirth','Nascimento'),f('pcBirthTime','Horário'),age(d)?'Idade calculada: '+age(d):f('pcAgeReported','Idade informada'),f('pcSex','Sexo'),f('pcResponsible','Responsável'),f('pcRelationship','Vínculo'),dt('recordDate','Atendimento'),f('pcProfessional','Profissional')]);
    block('Relato',[f('pcComplaint','Queixa / relato'),f('pcCordFall','Queda do coto umbilical relatada'),f('pcSince','Intercorrências')]);
    block('Gestação e nascimento',[f('pcPrenatal','Pré-natal'),f('pcPrenatalVisits','Consultas'),f('pcDelivery','Parto'),m('pcGestWeeks','IG ao nascer','semanas'),m('pcGestDays','Dias adicionais','dias'),m('pcBirthWeight','Peso ao nascer','g'),m('pcBirthLength','Comprimento ao nascer','cm'),f('pcApgar1','Apgar 1º minuto'),f('pcApgar5','Apgar 5º minuto'),f('pcPregnancy','Intercorrências gestacionais / perinatais'),f('pcNeonatal','Período neonatal')]);
    block('Triagens',[f('pcHeelStatus','Teste do pezinho'),dt('pcHeelDate','Coleta'),dt('pcHeelReport','Resultado'),...screens.map((n,i)=>f('pcScreen'+i,n)),f('pcHeelOther','Outros resultados'),f('pcHeelPlan','Conduta da triagem'),f('pcHearing','Teste da orelhinha'),f('pcEye','Teste do olhinho'),f('pcHeart','Teste do coraçãozinho'),f('pcOtherScreen','Outras triagens')]);
    block('Vacinação',[f('pcVaccineStatus','Situação'),f('pcVaccineSource','Fonte'),f('pcVaccineHistory','Registro apresentado'),f('pcVaccinesToday','Administradas hoje'),f('pcVaccinePlan','Planejamento')]);
    block('Crescimento',[m('pcWeight','Peso','kg'),m('pcLength','Comprimento / estatura','cm'),f('pcMeasure','Medição'),m('pcHead','Perímetro cefálico','cm'),m('pcChest','Perímetro torácico','cm'),bmi(d)?'IMC calculado: '+bmi(d)+' kg/m²':'',f('pcGraph','Registro nos gráficos'),f('pcGrowth','Avaliação do crescimento')]);
    block('Alimentação e rotina',[f('pcFeeding','Alimentação'),f('pcFeedDifficulty','Dificuldade alimentar'),f('pcFeedDetails','Avaliação / relato da alimentação'),f('pcFood','Outros alimentos / líquidos'),f('pcElimination','Eliminações'),f('pcSleep','Sono'),f('pcMeds','Medicamentos / suplementos'),f('pcAllergy','Alergias')]);
    block('Desenvolvimento e contexto',[f('pcDevReport','Relato'),f('pcDevObserved','Observado nesta consulta'),f('pcDevAssessment','Avaliação'),f('pcPlay','Brincar / interação'),f('pcSupport','Rede de apoio')]);
    if(motorText(d))out.push(motorText(d));
    block('Exame físico',[...['pcGeneral','pcSkin','pcHeadExam','pcMouth','pcCardio','pcAbdomen','pcGenitals','pcMotor','pcExamOther'].map(k=>v(d,k))]);
    block('Avaliação e conduta',[v(d,'pcAssessment'),v(d,'pcConduct'),f('pcGuidance','Orientações realizadas'),f('pcReferral','Avaliação compartilhada / encaminhamento')]);
    block('Retorno',[dt('pcReturnDate','Data'),v(d,'pcReturn')]);return out.join('\n\n');
  }
  function mount(){const f=document.querySelector('#clinical');const update=()=>{const d=Object.fromEntries(new FormData(f));document.querySelector('#pc-age-status').textContent=age(d)?'Idade cronológica calculada: '+age(d)+'.':'Preencha nascimento e atendimento para calcular a idade cronológica.';document.querySelector('#pc-bmi-status').textContent=bmi(d)?'IMC calculado: '+bmi(d)+' kg/m². A interpretação exige curva pediátrica apropriada.':'IMC calculado após peso e comprimento. Sem classificação automática.';};f.addEventListener('input',update);f.addEventListener('change',update);update();}
  return {form,mount,compose,issues,age,bmi};
})();

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
  ["child", "Puericultura"],
  ["cervical", "Citopatológico / DNA-HPV"],
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
  child: "Puericultura",
  cervical: "Citopatológico / DNA-HPV",
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
  cervical: "M9 3h6 M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3 M8 16h8",
  child: "M12 3a9 9 0 1 0 9 9 M12 3c4 0 6 2 6 4s-3 3-4 1 M8 11h.01 M16 11h.01 M8 15q4 4 8 0",
  occupational: "M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 12l7 2 7-2 M12 14v4 M12 18l-4 4 M12 18l4 4",
  arrow: "M7 17L17 7 M7 7h10v10",
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
  return `<aside class="result"><section class="panel editor-panel"><div class="row-title"><h2>${page === "lab" ? "Registro dos exames" : "Evolução"}</h2><span class="tag" id="editor-mode">Automático</span></div><p class="privacy">Preencha e acompanhe aqui. Você pode editar o texto e copiar a qualquer momento.</p><label for="output" class="muted">Texto do atendimento</label><div class="editor-stack"><div id="live-preview" aria-hidden="true"></div><textarea id="output" placeholder="Comece a preencher o atendimento…" spellcheck="true" aria-describedby="output-status"></textarea></div><div class="actions"><button class="primary" id="copy">Copiar texto</button><button id="generate">Guardar no histórico</button></div><details class="editor-options"><summary>Opções do texto</summary><div class="actions"><button id="edit">Editar texto</button><button id="regenerate">Retomar automático</button><button id="clear">Limpar módulo</button></div></details><p id="live-status" role="status" aria-live="polite"></p><details id="review-details"><summary id="live-heading">Pontos para revisar</summary><p class="privacy">Alertas são sugestões, não comprovação de informação falsa. Não impedem copiar ou continuar.</p><div id="live-issues"></div></details></section><p class="privacy">Rascunho temporário: recarregar ou fechar apaga o preenchimento.</p></aside>`;
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
    ["cervical", "", "Citopatológico / DNA-HPV", "Coleta, achados, amostra e retorno."],
    ["child", "", "Puericultura", "Crescimento, desenvolvimento, triagens e cuidado infantil."],
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
  return `<div class="intro"><div><div class="eyebrow">Área de trabalho</div><h1>Qual registro<br>vamos preparar?</h1><p>Selecione um módulo para começar.</p></div><span class="intro-number" aria-hidden="true">027</span></div><div class="module-heading"><h2>Módulos de atendimento</h2><span>Selecione · Preencha · Revise</span></div><div class="cards">${cards.map(([id, icon, t, d]) => `<button class="card" data-nav="${id}"><span class="icon">${uiIcon(id)}</span><span class="arrow">${uiIcon("arrow")}</span><strong>${t}</strong><p>${d}</p></button>`).join("")}</div><div class="bottom-note"><span>Informações temporárias · Nenhum cadastro de pacientes</span><button data-nav="history">Histórico da sessão (${history.length})</button></div>`;
}
function render() {
  if (!logged) return login();
  app.innerHTML = `<a class="skip-link" href="#workspace-main">Ir ao conteúdo</a><header class="top"><div class="logo"><span class="mark">+</span>EQUIPE 027</div><div class="session"><span>Ferramentas da equipe</span><button id="logout">Sair</button></div></header><nav class="main-nav" aria-label="Navegação principal"><span class="nav-caption">Área de trabalho</span>${modules.map(([p, t]) => `<button data-nav="${p}" class="${page === p ? "active" : ""}" ${page === p ? 'aria-current="page"' : ""}>${uiIcon(p)}<span>${t}</span></button>`).join("")}<div class="nav-bottom"><button data-nav="history" class="${page === "history" ? "active" : ""}">${uiIcon("history")}<span>Histórico da sessão</span></button><p>Dados temporários.<br>Apagados ao encerrar.</p></div></nav><main id="workspace-main" tabindex="-1">${page === "home" ? dashboard() : `<div class="heading"><div><div class="eyebrow">EQUIPE 027 / ${page === "lab" ? "Resultados" : "Área de trabalho"}</div><h1 style="margin-top:10px">${titles[page]}</h1><p>${page === "rx" ? "Preencha as duas vias, revise e imprima." : page === "history" ? "Textos gerados nesta sessão." : "Preencha apenas o que foi avaliado ou realizado."}</p></div><button data-nav="home">Início</button></div>` + (page === "rx" ? `<p class="privacy rx-privacy">Os dados do receituário ficam apenas nesta sessão. Sair ou recarregar apaga o preenchimento.</p>` : page === "history" ? historyView() : page === "lab" ? labForm() : page === "prenatal" ? Prenatal.form() : page === "implante" ? Implante.form() : page === "diu" ? DIU.form() : page === "cervical" ? Cervical.form() : page === "child" ? ChildCare.form() : page === "renewal" ? Renewal.form() : page === "occupational" ? Occupational.form() : clinical())}</main>`;
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
    if (page === "child") ChildCare.mount();
    if (page === "cervical") Cervical.mount();
    if (page === "renewal") Renewal.mount();
    if (page === "occupational") Occupational.mount();
    Notes.mount();
    Flow.mount();
    $("#clinical").onsubmit = (e) => e.preventDefault();
    $("#generate").onclick = generate;
    $("#regenerate").onclick = () => LiveReview.resume();
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
  if (p === "child") return ChildCare.compose(Care.normalize(raw));
  if (p === "cervical") return Cervical.compose(Care.normalize(raw));
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
