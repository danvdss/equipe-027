"use strict";
/* Catálogo nominal da RDC nº 1.036/2026. A cor informa a regra GERAL da lista.
   A receita aplicável a um medicamento depende também dos adendos e da formulação. */
(() => {
  const TYPE = Object.freeze({
    a: { title:"Notificação A · amarela", subtitle:"Regra geral das listas A1, A2 e A3", legend:"Notificação de Receita A" },
    b: { title:"Notificação B · azul", subtitle:"Regra geral da lista B1", legend:"Notificação de Receita B" },
    b2: { title:"Notificação B2 · azul", subtitle:"Regra geral da lista B2", legend:"Notificação de Receita B2" },
    rce: { title:"Controle Especial · 2 vias", subtitle:"Receita de Controle Especial (branca)", legend:"Receita de Controle Especial" },
    especial: { title:"Notificação Especial", subtitle:"Regras específicas das listas C2 e C3", legend:"Notificação de Receita Especial" },
    simples: { title:"Receita sem retenção", subtitle:"D1 ou adendo específico de outra lista", legend:"Receita médica sem retenção" },
    controle: { title:"Controle químico / MJSP", subtitle:"Controle de insumos químicos, não receita médica", legend:"Controle do Ministério da Justiça" },
    proscrito: { title:"Uso proscrito no Brasil", subtitle:"Não corresponde a receita de dispensação", legend:"Substâncias de uso proscrito" }
  });
  const COLORS = ["a","b","b2","rce","especial","simples","controle","proscrito"];
  const GROUPS = {
    A1:"a",A2:"a",A3:"a",B1:"b",B2:"b2",C1:"rce",C2:"especial",
    C3:"especial",C5:"rce",D1:"simples",D2:"controle",
    E:"proscrito",F1:"proscrito",F2:"proscrito",F3:"proscrito",F4:"proscrito"
  };
  const RECIPE_OVERRIDES = Object.freeze({
    "B1|fenobarbital":"rce",
    "B1|metilfenobarbital (prominal)":"rce",
    "B1|barbital":"rce",
    "B1|barbexaclona":"rce",
    "B1|perampanel":"rce",
    "B1|carisoprodol":"simples",
    "C1|loperamida":"simples"
  });
  const EXCEPTIONS = {
    "A1|difenoxilato":"Adendo 2 (A1): determinadas preparações com até 2,5 mg por unidade e associação específica com atropina utilizam Receita de Controle Especial em duas vias.",
    "A1|opio":"Adendo 3 (A1): certas preparações com até 5 mg de morfina anidra por mL utilizam Receita de Controle Especial em duas vias.",
    "A1|oxicodona":"Adendo 5 (A1): comprimidos de liberação controlada com até 40 mg por unidade ficam sujeitos a Receita de Controle Especial em duas vias.",
    "A1|buprenorfina":"Adendo 8 (A1): determinadas apresentações transdérmicas em matriz adesiva usam Receita de Controle Especial em duas vias.",
    "A2|acetildiidrocodeina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|codeina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|diidrocodeina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|etilmorfina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|folcodina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|nicodicodina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|norcodeina":"Adendo 2 (A2): certas apresentações com limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|tramadol":"Adendo 3 (A2): determinadas preparações com até 100 mg por unidade posológica usam Receita de Controle Especial em duas vias.",
    "A2|dextropropoxifeno":"Adendo 4 (A2): certas preparações dentro dos limites de dose e concentração usam Receita de Controle Especial em duas vias.",
    "A2|nalbufina":"Adendo 5 (A2): preparações com até 10 mg de cloridrato de nalbufina por unidade usam Receita de Controle Especial em duas vias.",
    "A2|propiram":"Adendo 6 (A2): preparações com até 100 mg por unidade e associação com metilcelulose podem utilizar Receita de Controle Especial em duas vias.",
    "A3|dronabinol":"Adendo 6 (A3): a regra para dronabinol limita-se à substância sintética em condições específicas. Há regras próprias para produtos de Cannabis.",
    "B1|fenobarbital":"Adendo 2 (B1): medicamentos contendo fenobarbital ficam sujeitos à Receita de Controle Especial em duas vias.",
    "B1|metilfenobarbital (prominal)":"Adendo 2 (B1): medicamentos contendo metilfenobarbital ficam sujeitos à Receita de Controle Especial em duas vias.",
    "B1|barbital":"Adendo 2 (B1): medicamentos contendo barbital ficam sujeitos à Receita de Controle Especial em duas vias.",
    "B1|barbexaclona":"Adendo 2 (B1): medicamentos contendo barbexaclona ficam sujeitos à Receita de Controle Especial em duas vias.",
    "B1|perampanel":"Adendo 9 (B1): medicamentos contendo perampanel ficam sujeitos à Receita de Controle Especial em duas vias.",
    "B1|carisoprodol":"Adendo 16 (B1): medicamentos contendo carisoprodol são vendidos sob prescrição SEM retenção da receita.",
    "B1|cetamina":"Adendo 14 (B1): dispensação e uso de medicamentos contendo cetamina são permitidos somente em estabelecimentos de saúde.",
    "B1|escetamina":"Adendos 14 e 15 (B1): dispensação e uso apenas em estabelecimentos de saúde, com monitoramento quando aplicável.",
    "C1|loperamida":"Adendo 2 (C1): medicamentos à base de loperamida são vendidos sob prescrição SEM retenção da receita.",
    "C1|misoprostol":"Adendo 4 (C1): compra e uso permitidos somente em estabelecimentos hospitalares cadastrados para esse fim.",
    "C1|tetracaina":"Adendo 5 (C1): o receituário varia conforme a apresentação e a via de uso (odontológico, otorrinolaringológico e oftalmológico).",
    "C1|benzidamina":"Adendo 7 (C1): determinadas formas farmacêuticas são excluídas dos controles desta Portaria.",
    "C1|canabidiol (cbd)":"Adendo 13 (C1): controle nominal referente ao canabidiol sintético, em condições especificadas. Produtos de Cannabis têm regras próprias.",
    "E|cannabis sativa l.":"Adendos 13–17 (E): há exceções específicas para determinados vegetais, produtos regularizados, medicamentos e atividades autorizadas.",
  };
  const GENERAL_ALERTS = {
    C2:"Adendo 2 (C2): apresentações medicamentosas de uso tópico seguem prescrição sem retenção de receita.",
    C5:"Adendo 2 (C5): apresentações medicamentosas de uso tópico seguem prescrição sem retenção de receita.",
    C3:"Adendo 4 (C3): lenalidomida e pomalidomida têm requisitos próprios de controle e dispensação.",
    F2:"Além dos nomes indexados, a lista F2 inclui classes estruturais de canabinoides, catinonas sintéticas e feniletilaminas.",
  };
  const $ = id => document.getElementById(id);
  const state = { data:null, q:"", list:"", type:"", visible:24 };
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
  const div = (tag,className,text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const exceptionFor = record => {
    const key = record.l + "|" + normalize(record.n);
    return EXCEPTIONS[key] || GENERAL_ALERTS[record.l] || "";
  };
  const recipeFor = record => RECIPE_OVERRIDES[record.l+"|"+normalize(record.n)] || GROUPS[record.l] || "controle";
  function buildLegend(){
    for (const code of COLORS) {
      const el = div("div","legend-item");
      el.style.setProperty("--tone",({
        a:"#f6ca63",b:"#77b9fa",b2:"#98a5ff",rce:"#e8eef9",
        especial:"#c8aaff",simples:"#8ce0c0",controle:"#9baac2",proscrito:"#ff9a9e"
      })[code]);
      el.append(div("strong","",TYPE[code].legend),div("small","",TYPE[code].subtitle));
      $("legend").append(el);
    }
    for(const code of COLORS){
      const opt=document.createElement("option");
      opt.value=code; opt.textContent=TYPE[code].legend;
      $("typeFilter").append(opt);
    }
  }
  function recordCard(record){
    const group=recipeFor(record),recipe=TYPE[group];
    const card=div("article","result-card");
    card.dataset.type=group;
    const top=div("div","card-top");
    top.append(div("span","list-code","LISTA "+record.l),div("span","record-index","#"+String(record.i).padStart(2,"0")));
    card.append(top,div("h3","card-name",record.n));
    const override=RECIPE_OVERRIDES[record.l+"|"+normalize(record.n)];
    card.append(div("span","recipe-badge",recipe.title),
      div("p","recipe-subtitle",override?"Modalidade definida por adendo específico da lista "+record.l:recipe.subtitle));
    const exception=exceptionFor(record);
    if(exception){
      const box=div("div","exception");
      box.append(div("strong","","Atenção: adendo ou exceção normativa"));
      box.append(div("span","",exception));
      card.append(box);
    }
    const details=div("details","card-details");
    const summary=div("summary","","Ver referências, sinônimos e adendos");
    details.append(summary);
    const body=div("div","details-body");
    if(record.s){
      body.append(div("strong","","Nome alternativo ou descrição no texto normativo"));
      body.append(div("p","",record.s));
    }
    body.append(div("strong","","Adendos da Lista "+record.l));
    const norm=div("p","addendum-text",state.data.adendos?.[record.l] || "Consulte o Anexo I oficial para a redação integral.");
    body.append(norm);
    const link=div("a","","Consultar AnvisaLegis ↗");
    link.href=state.data.fonte;link.target="_blank";link.rel="noopener noreferrer";
    body.append(link);
    details.append(body);card.append(details);
    return card;
  }
  function render(){
    if(!state.data)return;
    const list=state.data.registros.filter(item => {
      const haystack=normalize(item.n+" "+(item.s||""));
      return (!state.q || haystack.includes(state.q)) && (!state.list || item.l===state.list) &&
        (!state.type || recipeFor(item)===state.type);
    });
    const result=$("results");result.replaceChildren();
    const shown=list.slice(0,state.visible);
    for(const record of shown)result.append(recordCard(record));
    if(!list.length){
      const empty=div("div","empty-state");
      empty.append(div("strong","","Nenhuma correspondência nesta relação nominal."));
      empty.append(div("span","","Experimente outro termo. Uma ausência não descarta controle por sais, isômeros ou classes estruturais."));
      result.append(empty);
    }
    $("resultCount").textContent=list.length+" resultado"+(list.length===1?"":"s")+" · "+shown.length+" exibido"+(shown.length===1?"":"s");
    $("loadMore").hidden=shown.length>=list.length;
  }
  function filtersChanged(){
    state.q=normalize($("search").value);
    state.list=$("listFilter").value;
    state.type=$("typeFilter").value;
    state.visible=24;
    render();
  }
  async function start(){
    buildLegend();
    ["search","listFilter","typeFilter"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",filtersChanged));
    $("clearFilters").addEventListener("click",()=>{
      $("search").value="";$("listFilter").value="";$("typeFilter").value="";
      filtersChanged();$("search").focus();
    });
    $("loadMore").addEventListener("click",()=>{state.visible+=24;render()});
    try{
      const response=await fetch("controlados-dados.json",{cache:"no-store"});
      if(!response.ok)throw Error("HTTP "+response.status);
      const data=await response.json();
      if(!Array.isArray(data.registros) || data.registros.length!==data.total || data.total!==783)
        throw Error("Integridade ou versão da base inesperada");
      state.data=data;
      $("totalCount").textContent=new Intl.NumberFormat("pt-BR").format(data.total);
      $("indexStatus").textContent="Base nominal · 13/07/2026";
      for(const [list,count] of Object.entries(data.contagens)){
        const opt=document.createElement("option");
        opt.value=list;opt.textContent="Lista "+list+" ("+count+")";
        $("listFilter").append(opt);
      }
      $("sourceLink").href=data.paginaAnvisa;
      render();
    }catch(error){
      $("indexStatus").textContent="Falha ao carregar a base";
      $("resultCount").textContent="Consulta temporariamente indisponível";
      const box=div("div","empty-state");
      box.append(div("strong","","Não foi possível verificar o catálogo."));
      box.append(div("span","","Recarregue a página. Não use informações incompletas para determinar o receituário."));
      $("results").replaceChildren(box);
      console.error("Controlados: falha ao carregar a fonte",error.message);
    }
  }
  if(window.self!==window.top && new URLSearchParams(location.search).get("embedded")==="1"){
    document.querySelector(".topbar")?.setAttribute("hidden","");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
