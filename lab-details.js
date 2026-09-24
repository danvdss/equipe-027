/* Transcrição de laudos: nenhuma interpretação diagnóstica automática. */
const LabDetails = (() => {
  const organisms = [
    ["giardia", "Giardia duodenalis (G. lamblia)"],
    ["histolytica", "Entamoeba histolytica/dispar"],
    ["coli", "Entamoeba coli"],
    ["nana", "Endolimax nana"],
    ["iodamoeba", "Iodamoeba bütschlii"],
    ["blastocystis", "Blastocystis spp."],
  ];
  const urineFields = [
    ["color", "Cor", ["Amarelo-claro", "Amarelo", "Amarelo-escuro"]],
    ["appearance", "Aspecto", ["Límpido", "Ligeiramente turvo", "Turvo"]],
    ["density", "Densidade", []],
    ["ph", "pH", []],
    ["protein", "Proteínas", ["Ausente", "Traços", "+", "++", "+++"]],
    ["glucose", "Glicose", ["Ausente", "Traços", "+", "++", "+++"]],
    ["ketones", "Corpos cetônicos", ["Ausente", "Traços", "+", "++", "+++"]],
    ["blood", "Sangue / hemoglobina", ["Ausente", "Traços", "+", "++", "+++"]],
    ["nitrite", "Nitrito", ["Negativo", "Positivo"]],
    [
      "esterase",
      "Esterase leucocitária",
      ["Negativa", "Traços", "+", "++", "+++"],
    ],
    ["bilirubin", "Bilirrubina", ["Ausente", "Presente"]],
    ["urobilinogen", "Urobilinogênio", []],
    ["leukocytes", "Leucócitos / piócitos (valor e unidade)", []],
    ["rbc", "Hemácias (valor e unidade)", []],
    ["epithelial", "Células epiteliais", ["Raras", "Algumas", "Numerosas"]],
    ["bacteria", "Bactérias", ["Ausentes", "Raras", "Algumas", "Numerosas"]],
    ["mucus", "Muco", ["Ausente", "Presente"]],
    ["crystals", "Cristais (tipo e quantidade)", []],
    ["casts", "Cilindros (tipo e quantidade)", []],
    ["yeast", "Leveduras", ["Ausentes", "Presentes"]],
  ];
  const val = (d, k) => String(d[k] ?? "").trim();
  function select(k, label, options) {
    return `<label>${esc(label)}<select name="${k}"><option value="">Não informado</option>${options.map((v) => `<option>${esc(v)}</option>`).join("")}</select></label>`;
  }
  function form() {
    return `<section class="panel"><h2>Parasitológico de fezes · EPF</h2><p class="privacy">Transcreva os achados exatamente como constam no laudo. Campos vazios não entram no texto.</p><div class="fields two">${select("epfStatus", "Resultado do EPF", ["Não encontrados na amostra examinada", "Achados presentes", "Inconclusivo"])}${field("epfDate", "Data da coleta do EPF (se diferente)", "", "date")}${field("epfMethod", "Método informado no laudo")}${field("epfSamples", "Amostra(s) examinada(s)", "Ex.: 1ª amostra ou 3 amostras")}</div><h3 class="section-extra">Protozoários · selecione apenas achados descritos</h3><div class="fields two">${organisms.map(([k, l]) => select("epf_" + k, l, ["Presente conforme laudo", "Cistos", "Trofozoítos", "Cistos e trofozoítos"])).join("")}</div><div class="section-extra"><label>Outros organismos / helmintos / formas / quantidade<textarea name="epfOther" rows="2" placeholder="Inclua outros achados e a nomenclatura usada pelo laboratório"></textarea></label><label>Observações do laudo<textarea name="epfNotes" rows="2"></textarea></label></div><p class="privacy">Preserve a identificação do laudo; não substitua “E. histolytica/dispar” por uma espécie isolada. A seleção registra um achado, sem atribuir diagnóstico ou tratamento.</p></section><section class="panel"><h2>Sumário de urina · EAS</h2><p class="privacy">Registre somente os itens disponíveis, mantendo valores e unidades do laboratório. Não há resultados normais presumidos.</p><div class="fields two">${field("urineDate", "Data da coleta da urina (se diferente)", "", "date")}${field("urineMethod", "Método / amostra informados no laudo")}${urineFields.map(([k, l, options]) => `<label>${esc(l)}<input name="urine_${k}" autocomplete="off" ${options.length ? `list="urine-options-${k}"` : ""} ${["density", "ph"].includes(k) ? 'inputmode="decimal"' : ""} placeholder="${["leukocytes", "rbc"].includes(k) ? "Ex.: 5–10/campo ou 10.000/mL" : "Conforme laudo"}">${options.length ? `<datalist id="urine-options-${k}">${options.map((v) => `<option value="${esc(v)}"></option>`).join("")}</datalist>` : ""}</label>`).join("")}</div><label class="section-extra">Outros achados / observações do sumário<textarea name="urineNotes" rows="2"></textarea></label></section>`;
  }
  function compose(d) {
    const items = [];
    const found = organisms.filter(([k]) => val(d, "epf_" + k));
    if (
      d.epfStatus === "Não encontrados na amostra examinada" &&
      (found.length || val(d, "epfOther"))
    )
      Care.error(
        "epfStatus",
        "O EPF registra resultado negativo e achados presentes. Confira o laudo.",
      );
    if (
      d.epfStatus === "Achados presentes" &&
      !found.length &&
      !val(d, "epfOther")
    )
      Care.error("epfOther", "Descreva ao menos um achado presente no EPF.");
    const epf = [];
    if (val(d, "epfStatus")) epf.push(d.epfStatus);
    for (const [k, l] of found) epf.push(l + ": " + d["epf_" + k]);
    for (const [k, l] of [
      ["epfOther", "Outros achados"],
      ["epfNotes", "Observações"],
    ])
      if (val(d, k)) epf.push(l + ": " + d[k]);
    if (epf.length) {
      const meta = [];
      if (d.epfDate && d.epfDate !== d.date)
        meta.push("coleta " + d.epfDate.split("-").reverse().join("/"));
      if (val(d, "epfMethod")) meta.push("método: " + d.epfMethod);
      if (val(d, "epfSamples")) meta.push("amostra(s): " + d.epfSamples);
      items.push(
        "EPF" +
          (meta.length ? " (" + meta.join("; ") + ")" : "") +
          ": " +
          epf.join("; "),
      );
    } else if (["epfDate", "epfMethod", "epfSamples"].some((k) => val(d, k)))
      Care.error("epfStatus", "Preencha o resultado ou algum achado do EPF.");
    const urine = urineFields
      .filter(([k]) => val(d, "urine_" + k))
      .map(
        ([k, l]) =>
          l.replace(" (valor e unidade)", "") + ": " + d["urine_" + k],
      );
    if (val(d, "urineNotes")) urine.push("Observações: " + d.urineNotes);
    if (urine.length) {
      const meta = [];
      if (d.urineDate && d.urineDate !== d.date)
        meta.push("coleta " + d.urineDate.split("-").reverse().join("/"));
      if (val(d, "urineMethod")) meta.push(d.urineMethod);
      items.push(
        "EAS" +
          (meta.length ? " (" + meta.join("; ") + ")" : "") +
          ": " +
          urine.join("; "),
      );
    } else if (val(d, "urineDate") || val(d, "urineMethod"))
      Care.error(
        "urine_color",
        "Preencha ao menos um resultado do sumário de urina.",
      );
    return items;
  }
  return { form, compose };
})();
