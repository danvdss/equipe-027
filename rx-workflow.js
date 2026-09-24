/* Transient prescription review; calibration files contain no patient data. */
const RxFlow = (() => {
  const $ = (id) => document.getElementById(id);
  const ids = [
    "nome",
    "endereco",
    ...medOrder.flatMap((k) => ["f_" + k + "_nome", "f_" + k + "_pos"]),
  ];
  let undo = null,
    working = false;
  const patient = () => Object.fromEntries(ids.map((id) => [id, $(id).value]));
  const dirty = () => ids.some((id) => $(id).value.trim());
  function notify() {
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "rx-dirty", dirty: dirty() || !!undo },
        location.origin,
      );
  }
  function modal(title, message, buttons) {
    return new Promise((resolve) => {
      const d = document.createElement("dialog");
      d.className = "rx-dialog";
      const h = document.createElement("h2");
      h.textContent = title;
      const p = document.createElement("p");
      p.textContent = message;
      const row = document.createElement("div");
      row.className = "actions";
      for (const [value, text] of buttons) {
        const b = document.createElement("button");
        b.textContent = text;
        b.onclick = () => d.close(value);
        row.append(b);
      }
      d.append(h, p, row);
      document.body.append(d);
      d.addEventListener(
        "close",
        () => {
          const v = d.returnValue;
          d.remove();
          resolve(v);
        },
        { once: true },
      );
      d.showModal();
    });
  }
  function show(view) {
    document.body.dataset.rxView = view;
    document.querySelectorAll("[data-rx-view]").forEach((b) => {
      if (b.tagName === "BUTTON")
        b.setAttribute("aria-pressed", String(b.dataset.rxView === view));
    });
    if (view === "preview") fillFromInputs();
  }
  async function clear() {
    if (!dirty()) return;
    if (
      (await modal(
        "Limpar receituário?",
        "Você poderá desfazer durante esta sessão.",
        [
          ["no", "Cancelar"],
          ["yes", "Limpar"],
        ],
      )) !== "yes"
    )
      return;
    undo = patient();
    ids.forEach((id) => ($(id).value = ""));
    fillFromInputs();
    $("rx-undo").hidden = false;
    notify();
  }
  async function restore() {
    if (!undo) return;
    if (
      dirty() &&
      (await modal(
        "Recuperar preenchimento?",
        "O conteúdo atual será substituído.",
        [
          ["no", "Cancelar"],
          ["yes", "Recuperar"],
        ],
      )) !== "yes"
    )
      return;
    ids.forEach((id) => ($(id).value = undo[id]));
    undo = null;
    $("rx-undo").hidden = true;
    fillFromInputs();
    notify();
  }
  function overflow() {
    const sheet = stage.getBoundingClientRect();
    if (!sheet.width) return ["Não foi possível medir a pré-visualização."];
    const issues = [];
    for (const side of ["left", "right"]) {
      const all = order
        .map((k) => ({
          key: k,
          el: overlays[k]?.[side] || medOverlays[k]?.[side].root,
        }))
        .filter((x) =>
          x.key === "nome" || x.key === "endereco"
            ? $(x.key).value.trim()
            : $("f_" + x.key + "_nome").value.trim() ||
              $("f_" + x.key + "_pos").value.trim(),
        );
      for (const item of all) {
        const r = item.el.getBoundingClientRect();
        const limit = sheet.left + sheet.width * (side === "left" ? 0.5 : 1);
        if (
          r.right > limit + 1 ||
          r.bottom > sheet.bottom - 12 ||
          item.el.scrollWidth > item.el.clientWidth + 2
        )
          issues.push(
            fields[item.key].label +
              " ultrapassa o espaço da via " +
              (side === "left" ? "esquerda" : "direita") +
              ".",
          );
        for (const next of all) {
          if (next === item) continue;
          const n = next.el.getBoundingClientRect();
          if (
            r.top < n.top &&
            r.bottom > n.top + 1 &&
            r.left < n.right &&
            r.right > n.left
          )
            issues.push(
              fields[item.key].label +
                " sobrepõe " +
                fields[next.key].label +
                ".",
            );
        }
      }
    }
    return [...new Set(issues)];
  }
  async function output(kind) {
    if (working) return;
    working = true;
    try {
      show("preview");
      fillFromInputs();
      await new Promise((r) => requestAnimationFrame(r));
      if (!dirty()) {
        await modal(
          "Receituário vazio",
          "Preencha e revise o receituário antes de exportar.",
          [["ok", "Voltar"]],
        );
        return;
      }
      if (document.querySelector("#coords [aria-invalid]")) {
        await modal(
          "Confira as coordenadas",
          "Use valores entre 0 e 100 para todos os ajustes.",
          [["ok", "Voltar"]],
        );
        return;
      }
      const issues = overflow();
      if (issues.length) {
        await modal(
          "Ajuste o texto antes de continuar",
          issues.join("\n") +
            "\nReduza o conteúdo, a fonte ou ajuste as posições e revise as duas vias.",
          [["ok", "Revisar"]],
        );
        return;
      }
      if (
        (await modal(
          "Revisar as duas vias",
          "Confira paciente, medicamentos, doses, vias, frequência, duração e legibilidade nas duas vias. A plataforma não valida a prescrição.",
          [
            ["no", "Continuar revisando"],
            [
              "yes",
              kind === "print"
                ? "Conferi · imprimir"
                : "Conferi · exportar PNG",
            ],
          ],
        )) !== "yes"
      )
        return;
      if (kind === "print") {
        window.print();
        return;
      }
      status.textContent = "Gerando imagem…";
      const width = 1684,
        height = 1190;
      const canvas = await html2canvas(stage, {
        width,
        height,
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 1800,
        windowHeight: 1400,
        onclone(doc) {
          const clone = doc.getElementById("stage");
          clone.classList.remove("guides");
          clone.parentElement.style.cssText =
            "width:1684px;max-width:none;flex:none;overflow:visible";
          clone.style.cssText =
            "width:1684px;height:1190px;aspect-ratio:auto;position:relative";
          doc.querySelector(".preview").style.cssText =
            "display:block;overflow:visible;padding:0";
          clone.querySelectorAll(".overlay").forEach((el) => {
            el.style.fontSize = (style.size * height) / 100 + "px";
          });
          clone
            .querySelectorAll(".txt-nome")
            .forEach(
              (el) =>
                (el.style.fontSize = (style.medsize * height) / 100 + "px"),
            );
          clone.querySelectorAll(".txt-pos").forEach((el) => {
            el.style.fontSize = (style.medsize * 0.86 * height) / 100 + "px";
            el.style.marginTop = (style.posgap * height) / 100 + "px";
          });
        },
      });
      const a = document.createElement("a");
      a.download = "receituario.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      status.textContent = "PNG exportado · 3368 × 2380 px";
    } catch (e) {
      status.textContent =
        "Não foi possível exportar. Revise e tente novamente.";
    } finally {
      working = false;
    }
  }
  function calibration() {
    return {
      format: "equipe027-layout",
      version: 1,
      fields: Object.fromEntries(
        order.map((k) => [
          k,
          { left: { ...fields[k].left }, right: { ...fields[k].right } },
        ]),
      ),
      style: { ...style },
    };
  }
  function applyCalibration(raw) {
    if (raw?.format !== "equipe027-layout" || raw.version !== 1)
      throw Error("Arquivo de calibração incompatível.");
    const next = {};
    for (const k of order) {
      next[k] = {};
      for (const side of ["left", "right"]) {
        next[k][side] = {};
        for (const axis of ["x", "y"]) {
          const v = raw.fields?.[k]?.[side]?.[axis];
          if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100)
            throw Error("Coordenada inválida.");
          next[k][side][axis] = v;
        }
      }
    }
    const st = {};
    for (const id of ["font", "weight", "align"]) {
      if (![...$(id).options].some((o) => o.value === raw.style?.[id]))
        throw Error("Estilo inválido.");
      st[id] = raw.style[id];
    }
    for (const id of ["size", "medsize", "posgap"]) {
      const v = raw.style?.[id];
      if (
        typeof v !== "number" ||
        !Number.isFinite(v) ||
        v < +$(id).min ||
        v > +$(id).max
      )
        throw Error("Tamanho inválido.");
      st[id] = v;
    }
    if (typeof raw.style.wrap !== "boolean")
      throw Error("Quebra de linha inválida.");
    st.wrap = raw.style.wrap;
    for (const k of order) Object.assign(fields[k], next[k]);
    Object.assign(style, st);
    for (const [k, v] of Object.entries(st)) {
      if (k === "wrap") $(k).checked = v;
      else $(k).value = v;
      $(k).dispatchEvent(
        new Event(
          k === "wrap" || ["font", "weight", "align"].includes(k)
            ? "change"
            : "input",
          { bubbles: true },
        ),
      );
    }
    document.querySelectorAll("#coords input").forEach((el) => {
      el.value = fields[el.dataset.k][el.dataset.side][el.dataset.axis];
      el.removeAttribute("aria-invalid");
    });
    layoutAll();
    applyStyle();
    status.textContent = "Calibração importada. Revise o alinhamento.";
  }
  const switches = document.createElement("nav");
  switches.className = "rx-switch";
  switches.setAttribute("aria-label", "Visualização do receituário");
  for (const [v, t] of [
    ["form", "Preencher"],
    ["preview", "Pré-visualizar"],
  ]) {
    const b = document.createElement("button");
    b.textContent = t;
    b.dataset.rxView = v;
    b.onclick = () => show(v);
    switches.append(b);
  }
  document.querySelector(".topbar").after(switches);
  show("form");
  const previewActions = document.createElement("div");
  previewActions.className = "actions";
  for (const [kind, label] of [
    ["print", "Imprimir"],
    ["png", "Exportar PNG"],
  ]) {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = () => output(kind);
    previewActions.append(b);
  }
  document.querySelector(".preview").append(previewActions);
  const calibrationPanel = document.createElement("details");
  calibrationPanel.className = "calibration";
  calibrationPanel.innerHTML =
    '<summary>Configuração e calibração do modelo</summary><p class="hint">As configurações exportadas incluem apenas posições e estilo. Nenhum nome, endereço ou medicamento é incluído.</p>';
  const panel = document.querySelector(".panel");
  panel.insertBefore(calibrationPanel, panel.firstElementChild);
  calibrationPanel.append(panel.querySelector(".group"));
  for (const el of [...panel.children])
    if (el.tagName === "DETAILS" && el !== calibrationPanel)
      calibrationPanel.append(el);
  const layoutActions = document.createElement("div");
  layoutActions.className = "actions";
  layoutActions.innerHTML =
    '<button id="save-layout">Exportar calibração</button><label class="field">Importar calibração<input id="load-layout" type="file" accept=".json,application/json"></label>';
  calibrationPanel.append(layoutActions);
  $("save-layout").onclick = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(calibration(), null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipe027-calibracao.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("load-layout").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 50000) throw Error("Arquivo maior que o esperado.");
      applyCalibration(JSON.parse(await file.text()));
    } catch (error) {
      await modal("Não foi possível importar", error.message, [
        ["ok", "Fechar"],
      ]);
    } finally {
      e.target.value = "";
    }
  };
  const un = document.createElement("button");
  un.id = "rx-undo";
  un.textContent = "Desfazer limpeza";
  un.hidden = true;
  un.onclick = restore;
  $("clear").after(un);
  document.querySelectorAll("#coords input").forEach((el) => {
    el.inputMode = "decimal";
    el.setAttribute(
      "aria-label",
      fields[el.dataset.k].label +
        " · " +
        (el.dataset.side === "left" ? "via esquerda" : "via direita") +
        " · " +
        el.dataset.axis,
    );
  });
  for (const id of ["size", "medsize", "posgap"])
    $(id).setAttribute("aria-label", $(id).previousElementSibling.textContent);
  ids.forEach((id) => $(id).addEventListener("input", notify));
  window.addEventListener("beforeunload", (e) => {
    if (window.parent === window && (dirty() || undo)) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  return { output, clear, calibration, applyCalibration, overflow };
})();
