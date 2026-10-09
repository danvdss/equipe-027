/* Clinical data never leaves this browser. This panel is a visual aid, not a diagnosis. */
const GrowthCharts = (() => {
  const MS = 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta';
  const WHO = 'https://www.who.int/tools/child-growth-standards/standards/';
  const types = {weight:['Peso','kg','pcWeight','weight-for-age'],length:['Comprimento / altura','cm','pcLength','length-height-for-age'],bmi:['IMC','kg/m²',null,'body-mass-index-for-age-bmi-for-age'],head:['Perímetro cefálico','cm','pcHead','head-circumference-for-age']};
  const colors = ['#c4a3e9','#ff919f','#eac47c','#5cd8bd','#eac47c','#ff919f','#c4a3e9'];
  const number = v => {if(v==null||String(v).trim()==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>0?n:null;};
  const escape = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => n==null?'—':n.toLocaleString('pt-BR',{maximumFractionDigits:2});
  function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?d:null;}
  function model(d){
    const birth=date(d.pcBirth),visit=date(d.recordDate),days=birth&&visit?Math.round((visit-birth)/86400000):null;
    const months=days!=null&&days>=0?days/30.4375:null;
    const sex=d.pcSex==='Feminino'?'f':d.pcSex==='Masculino'?'m':null;
    const weight=number(d.pcWeight),length=number(d.pcLength),head=number(d.pcHead);
    const values={weight,length,head,bmi:weight&&length?weight/(length/100)**2:null};
    let reason='';
    if(!sex)reason='Informe o sexo registrado para selecionar a referência.';
    else if(months==null)reason='Preencha datas válidas de nascimento e atendimento, nessa ordem.';
    else if(months>120)reason='Este painel abrange peso, altura e IMC até 10 anos.';
    const preterm=number(d.pcGestWeeks)!=null&&number(d.pcGestWeeks)<37&&months!=null&&months<24;
    const method=days!=null&&days<731?'Comprimento deitado':'Estatura em pé';
    const methodIssue=d.pcMeasure===method?'':!d.pcMeasure?'Informe a forma de medição para posicionar comprimento/altura e IMC.':`A referência desta idade utiliza ${method.toLowerCase()}. Confira a medição; nenhuma conversão foi aplicada.`;
    const range=months!=null&&months>=24?[24,60]:[0,24];
    if(months!=null&&months>60)range.splice(0,2,60,120);
    return {d,sex,days,months,values,reason,preterm,methodIssue,range};
  }
  function rows(m,type){
    if(!m.sex||m.months==null||m.months>120)return [];
    const suffix='_'+m.sex;
    if(type==='head')return GrowthReference['head'+suffix];
    if(m.range[0]===0)return GrowthReference[(type==='length'?'length':type==='bmi'?'bmi0':'weight')+suffix].filter(r=>r[0]<=24);
    if(m.range[0]===24)return GrowthReference[(type==='length'?'height':type==='bmi'?'bmi2':'weight')+suffix].filter(r=>r[0]>=24);
    const base=GrowthReference[(type==='length'?'height':type==='bmi'?'bmi2':'weight')+suffix].find(r=>r[0]===60);
    return [base,...GrowthReference[(type==='length'?'height5':type==='bmi'?'bmi5':'weight5')+suffix]];
  }
  function pointIssue(m,type){
    if(m.reason)return m.reason;
    if(type==='head'&&m.months>24)return 'Perímetro cefálico: curva de 0 a 24 meses neste painel, conforme a Caderneta.';
    if(m.preterm)return 'Prematuridade informada: este painel não aplica curvas de prematuros nem correção da idade. Confira a referência apropriada na Caderneta.';
    if((type==='length'||type==='bmi')&&m.methodIssue)return m.methodIssue;
    if(m.values[type]==null)return type==='bmi'?'Preencha peso e comprimento/altura para calcular o IMC.':'Preencha uma medida maior que zero.';
    return '';
  }
  function svg(m,type,small=false){
    const data=rows(m,type),issue=pointIssue(m,type),unit=types[type][1];
    if(!data.length||m.reason||(type==='head'&&m.months>24))return `<div class="growth-empty">${escape(issue||'Preencha os dados para visualizar a curva.')}</div>`;
    const [start,end]=type==='head'?[0,24]:m.range;
    const W=520,H=270,left=45,right=38,top=16,bottom=35,pw=W-left-right,ph=H-top-bottom;
    const min=Math.max(0,Math.floor(Math.min(...data.map(r=>r[1]))*.9));
    const max=Math.ceil(Math.max(...data.map(r=>r[7]))*1.05);
    const x=n=>left+(n-start)/(end-start)*pw, y=n=>top+(max-n)/(max-min)*ph;
    let lines='';
    for(let i=0;i<=4;i++){let v=min+(max-min)*i/4;lines+=`<line x1="${left}" y1="${y(v)}" x2="${W-right}" y2="${y(v)}" class="growth-grid"/><text x="${left-6}" y="${y(v)+4}" text-anchor="end">${fmt(v)}</text>`;}
    for(let i=0;i<=4;i++){let mo=start+(end-start)*i/4;lines+=`<line x1="${x(mo)}" y1="${top}" x2="${x(mo)}" y2="${H-bottom}" class="growth-grid"/><text x="${x(mo)}" y="${H-17}" text-anchor="middle">${mo}</text>`;}
    for(let z=1;z<=7;z++){
      lines+=`<path d="${data.map((r,i)=>(i?'L':'M')+x(r[0]).toFixed(2)+','+y(r[z]).toFixed(2)).join(' ')}" fill="none" stroke="${colors[z-1]}" stroke-width="${z===4?2.3:1.3}" ${z===4?'':`stroke-dasharray="${z===1||z===7?'3 4':'7 3'}"`}/><text x="${W-right+5}" y="${y(data.at(-1)[z])+4}" style="fill:${colors[z-1]}">${z-4>0?'+':''}${z-4}</text>`;
    }
    let caption='';
    if(!issue){
      const value=m.values[type],cy=Math.max(top,Math.min(H-bottom,y(value))),cx=x(m.months),outside=value<min||value>max;
      caption=`${types[type][0]}: ${fmt(value)} ${unit}; idade cronológica ${fmt(m.months)} meses.`;
      lines+=`<line x1="${cx}" y1="${top}" x2="${cx}" y2="${H-bottom}" class="growth-guide"/>`;
      lines+=outside?`<path class="growth-point" d="M${cx},${cy} l-6,${value>max?10:-10} h12 Z"><title>${escape(caption)} Fora da escala exibida.</title></path>`:`<circle class="growth-point" cx="${cx}" cy="${cy}" r="6"><title>${escape(caption)}</title></circle>`;
      if(outside)caption+=' Fora da escala exibida; confira a medida e a unidade.';
    }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(types[type][0]+' por idade. '+(caption||issue))}"><text x="${left}" y="11">${unit}</text>${lines}<text x="${W/2}" y="${H-2}" text-anchor="middle">Idade cronológica (meses)</text></svg>${!small&&caption?`<p class="growth-value">${escape(caption)}</p>`:''}`;
  }
  function card(m,type,small=false){return `<article class="growth-card"><div class="growth-chart-title"><strong>${types[type][0]}</strong><span>${fmt(m.values[type])} ${types[type][1]}</span></div>${svg(m,type,small)}${!small&&pointIssue(m,type)?`<p class="growth-notice">${escape(pointIssue(m,type))}</p>`:''}</article>`;}
  function mount(){
    const form=document.querySelector('#clinical');if(!form||!form.querySelector('[name="pcWeight"]'))return;
    const dock=document.createElement('aside');dock.id='growth-dock';dock.setAttribute('aria-label','Gráficos de crescimento');
    dock.innerHTML=`<div class="growth-toolbar"><strong><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3v17h17M7 15l4-5 4 2 6-7"/></svg>Crescimento</strong><button type="button" data-minimize aria-label="Recolher gráfico" aria-expanded="true">−</button><button type="button" data-expand aria-haspopup="dialog">Expandir ↗</button></div><div class="growth-mini-body"><label class="sr-only" for="growth-kind">Gráfico exibido</label><select id="growth-kind">${Object.entries(types).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('')}</select><div data-mini></div><p class="growth-mini-status" aria-live="polite"></p></div>`;
    const dialog=document.createElement('dialog');dialog.className='growth-dialog';dialog.setAttribute('aria-labelledby','growth-title');
    dialog.innerHTML=`<div class="growth-dialog-heading"><div><span class="eyebrow">PUERICULTURA · ACOMPANHAMENTO</span><h2 id="growth-title">Gráficos de crescimento</h2></div><button type="button" data-close aria-label="Fechar gráficos de crescimento">Fechar</button></div><p data-context></p><div class="growth-legend"><span>● Medida do atendimento</span><span>Linhas: escores-z −3, −2, −1, 0, +1, +2, +3</span></div><div class="growth-charts"></div><p class="privacy">Um ponto representa esta aferição, não uma tendência de crescimento. A visualização não altera a evolução nem confirma o registro na caderneta.</p><details><summary>Fontes e critérios do gráfico</summary><p>Referência assistencial: <a href="${MS}" target="_blank" rel="noopener noreferrer">Caderneta da Criança · Ministério da Saúde</a>. Curvas redesenhadas a partir das tabelas numéricas da OMS adotadas na Caderneta; não são imagens do Ministério.</p><p>OMS 2006 (0–5 anos) e referência OMS 2007 (5–10 anos). Perímetro cefálico exibido até 24 meses. Linhas ligam os valores mensais publicados, com arredondamento de uma casa decimal; não calculam escore-z individual nem diagnóstico. Idade em meses = dias / 30,4375. Comprimento e IMC mudam de referência aos 731 dias; não há conversão automática da forma de medição.</p><p>Prematuridade antes dos 2 anos requer referência e idade apropriadas: o painel exibe as curvas, mas suspende o ponto. Não infere idade corrigida. As medidas continuam disponíveis no formulário.</p><ul>${Object.entries(types).map(([k,v])=>`<li><a target="_blank" rel="noopener noreferrer" href="${WHO+v[3]}">${v[0]} · tabelas OMS</a></li>`).join('')}<li><a target="_blank" rel="noopener noreferrer" href="https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators">Referência OMS após os 5 anos</a></li></ul></details>`;
    document.querySelector('#app').append(dock,dialog);
    let selected='weight';
    function update(){
      if(!dock.isConnected)return;
      const m=model(Object.fromEntries(new FormData(form)));
      dock.querySelector('[data-mini]').innerHTML=card(m,selected,true);
      const issue=pointIssue(m,selected);
      dock.querySelector('.growth-mini-status').textContent=issue||`${m.sex==='f'?'Meninas':'Meninos'} · ${fmt(m.months)} meses · MS / OMS`;
      dialog.querySelector('[data-context]').textContent=m.reason||`${m.sex==='f'?'Referência para meninas':'Referência para meninos'} · ${fmt(m.months)} meses de idade cronológica · atendimento em ${m.d.recordDate.split('-').reverse().join('/')}`;
      if(dialog.open)dialog.querySelector('.growth-charts').innerHTML=Object.keys(types).map(k=>card(m,k)).join('');
    }
    dock.querySelector('select').onchange=e=>{selected=e.target.value;update();};
    dock.querySelector('[data-minimize]').onclick=e=>{const collapsed=dock.classList.toggle('growth-collapsed');e.currentTarget.textContent=collapsed?'+':'−';e.currentTarget.setAttribute('aria-expanded',String(!collapsed));e.currentTarget.setAttribute('aria-label',collapsed?'Mostrar gráfico':'Recolher gráfico');};
    dock.querySelector('[data-expand]').onclick=()=>{dialog.showModal();update();};
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>dock.querySelector('[data-expand]').focus());
    const watched=new Set(['pcBirth','recordDate','pcSex','pcWeight','pcLength','pcHead','pcMeasure','pcGestWeeks']);
    const onField=e=>{if(watched.has(e.target.name))update();};
    form.addEventListener('input',onField);form.addEventListener('change',onField);
    update();
  }
  return {model,rows,pointIssue,svg,mount};
})();
