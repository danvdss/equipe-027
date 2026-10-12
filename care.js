/* Shared data normalization and documentary checks. No eligibility decisions. */
const Care = (() => {
  const version = "2026.10.12";
  const numeric = [
    "fc",
    "fr",
    "spo",
    "temp",
    "hgt",
    "glic",
    "a1c",
    "weight",
    "bmi",
    "pain",
    "au",
    "bcf",
    "pnWeight",
    "hysterometry",
    "threads",
    "painScore",
  ];
  const value = (d, k) => String(d[k] ?? "").trim();
  function normalize(raw) {
    const d = {};
    for (const [k, v] of Object.entries(raw))
      d[k] = Array.isArray(v)
        ? [...new Set(v)]
        : typeof v === "string"
          ? v.trim()
          : v;
    for (const k of ["pa", "pnPa"])
      if (d[k]) d[k] = String(d[k]).replace(/\s+/g, "");
    return d;
  }
  function error(key, message) {
    const e = new Error(message);
    e.field = key;
    throw e;
  }
  function date(key, v) {
    const n = Date.parse(v + "T00:00:00Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
      !Number.isFinite(n) ||
      new Date(n).toISOString().slice(0, 10) !== v
    )
      error(key, "Confira a data informada.");
  }
  function validate(d, p) {
    for (const [k, v] of Object.entries(d))
      if (
        v &&
        (/Date$/.test(k) || ["date", "dum", "expiry", "rxDate"].includes(k))
      )
        date(k, v);
    for (const k of numeric)
      if (value(d, k)) {
        if (!/^\d+(?:[.,]\d+)?$/.test(d[k]))
          error(k, "Informe um número válido, com ponto ou vírgula decimal.");
        const n = Number(d[k].replace(",", "."));
        if (["spo", "a1c"].includes(k) && n > 100)
          error(k, "O percentual deve ficar entre 0 e 100.");
        if (["pain", "painScore"].includes(k) && n > 10)
          error(k, "A intensidade de dor deve ficar entre 0 e 10.");
      }
    for (const k of ["pa", "pnPa"])
      if (value(d, k) && !/^\d{1,3}\/\d{1,3}$/.test(d[k]))
        error(k, "Informe a pressão no formato 120/80, em mmHg.");
    if (d.returnStatus === "scheduled" && !value(d, "returnDate"))
      error(
        "returnDate",
        "Informe a data da consulta agendada ou selecione agendamento orientado.",
      );
    if (d.plan === "Inserção programada" && !value(d, "scheduledDate"))
      error("scheduledDate", "Informe a data da inserção programada.");
    if (
      p === "diu" &&
      d.mode === "Inserção" &&
      d.outcome === "Inserção concluída" &&
      ["Inserção adiada", "Paciente optou por não prosseguir"].includes(d.plan)
    )
      error(
        "plan",
        "O planejamento informado contradiz a inserção concluída. Revise a situação atual.",
      );
    if (d.followStatus === "Agendado" && !value(d, "followDate"))
      error("followDate", "Informe a data do retorno agendado.");
    if (d.followDate && !d.followStatus)
      error("followStatus", "Informe se o retorno foi orientado ou agendado.");
    if (d.followDate && d.recordDate && d.followDate < d.recordDate)
      error("followDate", "O retorno não pode ser anterior ao atendimento.");
    if (d.adminDrug && !d.adminDose)
      error("adminDose", "Registre a dose da medicação administrada.");
    if (d.renewDone === "Sim" && d.medicalDone !== "Sim")
      error(
        "medicalDone",
        "Confirme a avaliação médica realizada antes de registrar renovação conforme orientação médica.",
      );
    if (d.medicalDone === "Sim" && d.medicalRequested === "Não")
      error(
        "medicalRequested",
        "Revise as etapas de solicitação e realização da avaliação médica.",
      );
    return d;
  }
  function warnings(d, p) {
    if (p === "occupational") return Occupational.warnings(d);
    const a = [];
    if (
      p === "diu" &&
      d.mode === "Inserção" &&
      d.outcome === "Inserção concluída"
    )
      for (const [k, l] of [
        ["deviceType", "tipo de DIU"],
        ["model", "modelo"],
        ["lot", "lote"],
        ["expiry", "validade da embalagem"],
        ["procedureDate", "data do procedimento"],
        ["professional", "profissional responsável"],
        ["consent", "situação do consentimento"],
        ["assessment", "avaliação profissional"],
      ])
        if (!value(d, k) || d[k] === "Ainda não definido")
          a.push({ key: k, text: "Não registrado: " + l + "." });
    if (
      p === "diu" &&
      d.outcome === "Inserção concluída" &&
      ["Gestação confirmada", "Não foi possível afastar gestação"].includes(
        d.pregnancyAssessment,
      )
    )
      a.push({
        key: "pregnancyAssessment",
        text: "Confira a avaliação de gestação e o procedimento registrado; documente a fundamentação profissional.",
      });
    for (const n of [1, 3])
      if (
        d["protege" + n + "Status"] === "available" &&
        !Object.keys(d).some(
          (k) => k.startsWith("protege" + n + "Result") && value(d, k),
        ) &&
        !value(d, "protege" + n + "Other")
      )
        a.push({
          key: "protege" + n + "Status",
          text: "Protege do " + n + "º trimestre: nenhum resultado transcrito.",
        });
    if (
      p === "implante" &&
      d.requestStatus === "Solicitação enviada / inserida na regulação" &&
      !value(d, "reference")
    )
      a.push({
        key: "reference",
        text: "Número de protocolo / serviço não informado.",
      });
    return a;
  }
  function labValue(v, unit = "") {
    v = String(v).trim();
    unit = String(unit).trim();
    if (unit === "%" && /^[<>≤≥]?\s*\d+(?:[.,]\d+)?\s*%*$/.test(v))
      return v.replace(/\s*%*$/, "") + "%";
    if (!unit || (unit === "%" && !/^[<>≤≥]?\s*\d+(?:[.,]\d+)?\s*%*$/.test(v)))
      return v;
    if (v.toLowerCase().endsWith(unit.toLowerCase())) return v;
    return v + " " + unit;
  }
  function meaningful(d) {
    return Object.entries(d || {}).some(
      ([k, v]) =>
        ![
          "stale",
          "manual",
          "baseline",
          "snapshot",
          "touched",
          "encounterSetting",
          "encounterReason",
          "mode",
          "igMethod",
          "usgDays",
          "visitDate",
          "recordDate",
        ].includes(k) &&
        (Array.isArray(v) ? v.length : typeof v === "string" && v.trim()),
    );
  }
  function textState(d) {
    return !d.output
      ? "Ainda não gerado"
      : d.stale
        ? "Formulário alterado"
        : d.manual
          ? "Editado manualmente"
          : "Atualizado";
  }
  function renewalText(d, names = []) {
    const parts = [];
    if (d.medicalRequested === "Sim") parts.push("Solicitada avaliação médica");
    else if(d.medicalRequested === "Não") parts.push("Avaliação médica não solicitada neste atendimento");
    if (d.medicalDone === "Sim") parts.push("realizada avaliação médica");
    if (d.renewDone === "Sim") {
      const list = value(d, "renewedDetails") || names.join(", ");
      parts.push(
        "medicamentos renovados conforme orientação médica" +
          (list ? ": " + list : ""),
      );
    } else if (d.renewDone === "Não")
      parts.push("não houve renovação de medicamentos");
    else if (d.medicalRequested === "Sim" && d.medicalDone === "Não")
      parts.push("aguardando avaliação");
    return parts.length
      ? parts.map(sentence).join(" ")
      : "";
  }
  function decorate(text, d, p) {
    if (p === "lab") return text;
    let result = text;
    if (d.recordSetting === "No domicílio")
      result = result.replace(
        /Paciente(, [^,]+,)? comparece à unidade/,
        "Paciente$1 recebe atendimento no domicílio",
      );
    if (d.recordSetting === "À beira do leito")
      result = result.replace(
        /Paciente(, [^,]+,)? comparece à unidade/,
        "Paciente$1 recebe atendimento à beira do leito",
      );
    if (d.recordSetting === "Sem especificar o local")
      result = result.replace(
        /Paciente(, [^,]+,)? comparece à unidade para/,
        "Paciente$1 recebe atendimento para",
      );
    const start = [];
    if (d.recordDate)
      start.push(
        "Atendimento em " + d.recordDate.split("-").reverse().join("/") + ".",
      );

    const tail = [];
    if (d.followStatus)
      tail.push(
        "Retorno " +
          d.followStatus.toLowerCase() +
          (d.followDate
            ? " para " + d.followDate.split("-").reverse().join("/")
            : "") +
          (d.followDetails ? ": " + d.followDetails : "") +
          ".",
      );
    else if (d.followDetails)
      tail.push("Orientação de retorno: " + d.followDetails + ".");
    if (d.recordProfessional)
      tail.push("Profissional responsável: " + d.recordProfessional + ".");
    return [result, ...tail.map(sentence), ...start].join("\n\n");
  }
  const references = [
    {id:'growth',modules:['child'],title:'Crescimento · OMS / Caderneta da Criança',edition:'OMS 2006/2007; manual Anthro 3.2.2 (2011)',url:'https://www.who.int/tools/child-growth-standards/software',checked:'12/10/2026',rule:'Idade exata em dias; estatura a partir de 731 dias. Curvas mensais, sem escore-z individual.',tests:'growth.test.cjs',review:'Conferência técnica; homologação assistencial local pendente'},
    {id:'mchat',modules:['occupational'],title:'M-CHAT-R/F · registro de resultado externo',edition:'Português brasileiro: arquivo oficial publicado em 2018; algoritmo oficial consultado em 2026',url:'https://www.mchatscreen.com/mchat-rf/scoring/',checked:'12/10/2026',rule:'16–30 meses, aplicação completa e referência confirmada; sem questionário digital ou diagnóstico.',tests:'occupational.test.cjs',review:'Conferência técnica; homologação assistencial local pendente'},
    {id:'hpv',modules:['cervical'],title:'INCA · rastreamento organizado com DNA-HPV',edition:'Diretrizes brasileiras, 2025',url:'https://ninho.inca.gov.br/jspui/handle/123456789/17858',checked:'12/10/2026',rule:'Referência para consulta. O módulo registra coleta; não determina elegibilidade, periodicidade ou encaminhamento.',tests:'quality.test.cjs (documentação)',review:'Implantação e fluxo municipal não verificados'},
    {id:'documentary',modules:['general','has','dm','both','prenatal','diu','implante','renewal','lab'],title:'Registro documental do atendimento',edition:'Modelo da equipe, revisão 2026.10',url:'',checked:'12/10/2026',rule:'Organização de informações preenchidas. Não é protocolo de prescrição, diagnóstico ou elegibilidade.',tests:'quality.test.cjs',review:'Validação assistencial e protocolos locais pendentes'}
  ];
  function referencePanel(module){
    const items=references.filter(r=>r.modules.includes(module));if(!items.length)return '';
    return '<details class="protocol-reference"><summary>Referências e limites deste módulo</summary><p>As referências apoiam a conferência; não confirmam condutas nem substituem a avaliação profissional.</p><ul>'+items.map(r=>'<li><strong>'+r.title+'</strong><br>'+r.edition+'<br>'+r.rule+'<br><small>Conferência: '+r.checked+'. '+r.review+'.</small>'+(r.url?' <a href="'+r.url+'" target="_blank" rel="noopener noreferrer">Consultar fonte ↗</a>':'')+'</li>').join('')+'</ul></details>';
  }
  return {
    version,
    references,
    referencePanel,
    value,
    normalize,
    validate,
    warnings,
    labValue,
    meaningful,
    textState,
    error,
    renewalText,
    decorate,
  };
})();

