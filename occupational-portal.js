/* Integration shell for the privately built Projeto-TO React module.
 * Does not contain Projeto-TO source, credentials, or patient data.
 * No clinical access is granted here: the module/backend must validate it.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.OccupationalPortal = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";
  const MODULE_PATH = "./ot-embedded/projeto-to-embedded.js";
  let view = "projeto";
  let controller = null;
  let host = null;
  let generation = 0;

  function currentView() { return view; }
  function resetView() { view = "projeto"; }
  function setView(next) {
    if (next !== "projeto" && next !== "rapida") throw new Error("Invalid occupational view");
    view = next;
  }
  function form(legacy) {
    const isProject = view === "projeto";
    return '<section class="panel ot-hub-picker" aria-label="Modo de Terapia Ocupacional">' +
      '<div class="ot-hub-actions" role="group" aria-label="Escolher modalidade">' +
      '<button type="button" data-ot-view="projeto" aria-pressed="' + isProject + '">Ferramentas do Projeto-TO</button>' +
      '<button type="button" data-ot-view="rapida" aria-pressed="' + !isProject + '">Evolução rápida</button>' +
      '</div><p class="muted">As duas opções são temporárias, sem cadastro, banco ou histórico de pacientes.</p></section>' +
      (isProject
        ? '<section id="ot-embedded-root" role="region" aria-label="Página inicial do Projeto-TO">' +
          '<p class="privacy" role="status">Carregando a página inicial de Terapia Ocupacional…</p></section>'
        : legacy());
  }
  function url(base) {
    const target = new URL(MODULE_PATH, base);
    if (typeof location !== "undefined" && target.origin !== location.origin) {
      throw new Error("Cross-origin occupational module denied");
    }
    return target.href;
  }
  function loadModule() {
    // Fixed, same-origin asset built in the private integration deployment.
    return import(url(document.baseURI));
  }
  function showError(current) {
    current.replaceChildren();
    const message = document.createElement("p");
    message.className = "privacy ot-hub-unavailable";
    message.setAttribute("role", "status");
    message.textContent =
      "O Ferramentas do Projeto-TO ainda não está disponível neste ambiente. " +
      "A Evolução rápida continua acessível pela opção acima. Nenhum dado clínico foi carregado.";
    current.append(message);
  }
  async function mount(importer = loadModule) {
    const target = document.getElementById("ot-embedded-root");
    if (!target || view !== "projeto") return false;
    const request = ++generation;
    host = target;
    try {
      const loaded = await importer();
      if (request !== generation || host !== target || !target.isConnected) return false;
      if (!loaded || typeof loaded.mountProjetoTo !== "function") throw new Error("Invalid embedded module");
      // The shell verifies its own account; the temporary TO tools never access
      // a patient database and never receive a Supabase client or JWT.
      // The React entrypoint requires an empty container (no loading placeholder).
      target.replaceChildren();
      controller = loaded.mountProjetoTo(target, {
        verifyShellIdentity: async () => {
          if (typeof Access === "undefined" || typeof Access.verifiedBridgeIdentity !== "function") return null;
          return Access.verifiedBridgeIdentity();
        },
      });
      if (!controller || typeof controller.unmount !== "function") throw new Error("Invalid module lifecycle");
      return true;
    } catch {
      if (request === generation && host === target && target.isConnected) showError(target);
      return false;
    }
  }
  function leave(force = false) {
    if (controller && typeof controller.unmount === "function") {
      if (controller.unmount(force) === false && !force) return false;
    }
    ++generation;  // Ignore pending imports when leaving.
    controller = null;
    host = null;
    return true;
  }
  return { form, mount, leave, currentView, resetView, setView, modulePath: MODULE_PATH, moduleUrl: url };
});
