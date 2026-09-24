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
