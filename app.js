const $ = (s) => document.querySelector(s);
const app = $("#app");
const modules = [
  ["home", "Início"],
  ["general", "Evolução"],
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
const sentence = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[.\s]+$/, "") + "." : "";
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.style.display = "none"), 3000);
}
function login() { Access.screen(); }
const iconPaths = {
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
  return `<aside class="result"><button class="primary generate" id="generate">${page === "lab" ? "GERAR LAB" : "GERAR EVOLUÇÃO"}</button><section class="panel"><div class="row-title"><h2>${page === "lab" ? "LAB gerado" : "Evolução gerada"}</h2><span class="tag">Editável</span></div><label for="output" class="muted">Revise antes de copiar</label><textarea id="output" placeholder="O texto gerado aparecerá aqui. Apenas as informações preenchidas serão incluídas." spellcheck="true"></textarea><div class="actions"><button class="primary" id="copy">${page === "lab" ? "COPIAR LAB" : "COPIAR"}</button><button id="edit">Editar</button><button id="regenerate">Gerar novamente</button><button id="clear">Limpar</button></div></section><p class="privacy">Sem cadastro de pacientes. Os rascunhos ficam na memória desta sessão. Cópias, impressões e arquivos exportados permanecem fora do controle da plataforma.</p></aside>`;
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
  app.innerHTML = `<a class="skip-link" href="#workspace-main">Ir ao conteúdo</a><header class="top"><div class="logo"><span class="mark">+</span>EQUIPE 027</div><div class="session"><span>Ferramentas de enfermagem</span><button id="logout">Sair</button></div></header><nav class="main-nav" aria-label="Navegação principal"><span class="nav-caption">Área de trabalho</span>${modules.map(([p, t]) => `<button data-nav="${p}" class="${page === p ? "active" : ""}" ${page === p ? 'aria-current="page"' : ""}>${uiIcon(p)}<span>${t}</span></button>`).join("")}<div class="nav-bottom"><button data-nav="history" class="${page === "history" ? "active" : ""}">${uiIcon("history")}<span>Histórico da sessão</span></button><p>Dados temporários.<br>Apagados ao encerrar.</p></div></nav><main id="workspace-main" tabindex="-1">${page === "home" ? dashboard() : `<div class="heading"><div><div class="eyebrow">EQUIPE 027 / ${page === "lab" ? "Resultados" : "Área de trabalho"}</div><h1 style="margin-top:10px">${titles[page]}</h1><p>${page === "rx" ? "Preencha as duas vias, revise e imprima." : page === "history" ? "Textos gerados nesta sessão." : "Preencha apenas o que foi avaliado ou realizado."}</p></div><button data-nav="home">Início</button></div>` + (page === "rx" ? `<p class="privacy rx-privacy">Os dados do receituário ficam apenas nesta sessão. Sair ou recarregar apaga o preenchimento.</p>` : page === "history" ? historyView() : page === "lab" ? labForm() : page === "prenatal" ? Prenatal.form() : page === "implante" ? Implante.form() : page === "diu" ? DIU.form() : clinical())}</main>`;
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
    Notes.mount();
    Flow.mount();
    $("#clinical").onsubmit = (e) => e.preventDefault();
    $("#generate").onclick = generate;
    $("#regenerate").onclick = generate;
    $("#copy").onclick = () => Flow.copyCurrent();
    $("#edit").onclick = () => $("#output").focus();
    $("#clear").onclick = () => Flow.clear();
    if ($("#addLab")) $("#addLab").onclick = () => addLab();
    $("#clinical").addEventListener("change", resolveConflicts);
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
  const d = Care.normalize(raw);
  Care.validate(d, p);
  return Care.decorate(composeBody(d, p), d, p);
}
function composeBody(d, p) {
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
  if (e.persisted) Access.signOut();
});

Access.start();

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
