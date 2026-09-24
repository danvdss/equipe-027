const Shortcuts = (() => {
  const entries = [
    [
      "SISPEC",
      "Portal de serviços",
      "https://lagarto.mms.inf.br/sispec/login",
      "M4 21V5h16v16 M8 5V3h8v2 M9 10h6 M12 7v6 M9 21v-5h6v5",
    ],
    [
      "DRIVE DA EQUIPE",
      "Abrir o Google Drive",
      "https://drive.google.com/drive/u/0/mobile/my-drive?hl=pt-br&pli=1",
      "M3 7h7l2 2h9v11H3z M3 7V4h7l2 3",
    ],
    [
      "CÁLCULO DE RISCO CARDIOVASCULAR",
      "Calculadora da SBC",
      "http://departamentos.cardiol.br/sbc-da/2015/calculadoraer2017/etapa1.html",
      "M20 5c-3-3-7 0-8 2-1-2-5-5-8-2-5 5 8 16 8 16S25 10 20 5 M5 12h4l2-4 3 8 2-4h3",
    ],
    [
      "CKDEPI",
      "CKD-EPI 2021 · SBN",
      "https://sbn.org.br/medicos/utilidades/calculadoras-nefrologicas/ckd-epi-2021/",
      "M6 3h12v18H6z M9 7h6 M9 11h1 M14 11h1 M9 15h1 M14 15h1",
    ],
  ];
  function links() {
    return entries
      .map(
        ([name, description, url, path]) =>
          `<a class="shortcut-card" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="shortcut-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg></span><span><strong>${name}</strong><small>${description}</small></span><span class="shortcut-external" aria-hidden="true">↗</span><span class="sr-only"> (abre em nova aba)</span></a>`,
      )
      .join("");
  }
  function mount() {
    const main = document.getElementById("workspace-main");
    if (!main) return;
    const node = document.createElement(
      page === "home" ? "section" : "details",
    );
    node.className = "quick-links";
    if (page === "home") {
      node.setAttribute("aria-label", "Atalhos da equipe");
      node.innerHTML =
        '<div class="row-title"><h2>Atalhos da equipe</h2><span class="muted">Abrem em nova aba</span></div>';
    } else node.innerHTML = "<summary>Atalhos da equipe</summary>";
    node.insertAdjacentHTML(
      "beforeend",
      '<div class="shortcut-grid">' + links() + "</div>",
    );
    if (page === "home") main.querySelector(".intro").after(node);
    else main.querySelector(".heading").after(node);
  }
  return { mount };
})();
