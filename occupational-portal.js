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
  const MODULE_PATH = "./ot-embedded/projeto-to-embedded.js?v=af9088309a09";
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
  let modulePromise;
  let failedImports = 0;
  function loadModule() {
    // Fixed, same-origin asset built in the private integration deployment.
    if (!modulePromise) {
      const asset = new URL(url(document.baseURI));
      if (failedImports) asset.searchParams.set("retry", String(failedImports));
      modulePromise = import(asset.href).catch(error => {
        modulePromise = null;
        failedImports++;
        throw error;
      });
    }
    return modulePromise;
  }
  function showError(current, importer, restoreFocus) {
    current.replaceChildren();
    const message = document.createElement("p");
    message.className = "privacy ot-hub-unavailable";
    message.setAttribute("role", "status");
    message.textContent =
      "Não foi possível abrir as ferramentas do Projeto-TO. " +
      "A Evolução rápida continua acessível pela opção acima. Nenhum dado clínico foi carregado.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Tentar novamente";
    retry.addEventListener("click", () => {
      if (current !== host || !current.isConnected) return;
      message.textContent = "Carregando as ferramentas de Terapia Ocupacional…";
      retry.setAttribute("aria-disabled", "true");
      void mount(importer, retry);
    }, { once: true });
    current.append(message, retry);
    if (restoreFocus) retry.focus();

  }
  async function mount(importer = loadModule, retry = null) {
    const target = document.getElementById("ot-embedded-root");
    if (!target || view !== "projeto") return false;
    const request = ++generation;
    host = target;
    target.setAttribute("aria-busy", "true");
    try {
      const loaded = await importer();
      if (request !== generation || host !== target || !target.isConnected) return false;
      if (!loaded || typeof loaded.mountProjetoTo !== "function") throw new Error("Invalid embedded module");
      // The shell verifies its own account; the temporary TO tools never access
      // a patient database and never receive a Supabase client or JWT.
      // The React entrypoint requires an empty container (no loading placeholder).
      const focusAfterMount = retry && document.activeElement === retry;
      target.replaceChildren();
      controller = loaded.mountProjetoTo(target, {
        verifyShellIdentity: async () => {
          if (typeof Access === "undefined" || typeof Access.verifiedBridgeIdentity !== "function") return null;
          return Access.verifiedBridgeIdentity();
        },
      });
      if (!controller || typeof controller.unmount !== "function") throw new Error("Invalid module lifecycle");
      if (focusAfterMount) {
        target.tabIndex = -1;
        target.focus();
      }
      return true;
    } catch {
      if (request === generation && host === target && target.isConnected) showError(target, importer, retry && document.activeElement === retry);
      return false;
    } finally {
      if (request === generation && target.isConnected) target.removeAttribute("aria-busy");
    }
  }
  function hasUnsavedChanges() {
    return Boolean(controller && typeof controller.hasUnsavedChanges === "function" && controller.hasUnsavedChanges());
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
  return { form, mount, leave, hasUnsavedChanges, currentView, resetView, setView, modulePath: MODULE_PATH, moduleUrl: url };
});
