/* Supabase Auth: accounts only; clinical drafts never leave the browser. */
const Access = (() => {
  const SITE = "https://danvdss.github.io/equipe-027/";
  let client, setupMode = false, busy = false;
  function clearWork() {
    logged = false; drafts = {}; history = []; extraCount = 0; page = "home";
    Flow.reset(); destroyReceituario();
  }
  function message(text) {
    const el = document.querySelector("#error");
    if (el) el.textContent = text;
  }
  function screen(mode = "login", notice = "") {
    destroyReceituario();
    const passwordMode = mode === "password";
    const recoveryMode = mode === "recovery";
    app.innerHTML = `<main class="login modern-login"><div class="login-dots" aria-hidden="true"></div><section class="login-access" aria-labelledby="login-title"><form class="login-card" id="login"><div class="login-emblem" aria-hidden="true">027</div><span class="eyebrow">EQUIPE 027</span><h1 id="login-title">${passwordMode ? "Defina sua senha" : recoveryMode ? "Recupere seu acesso" : "Entre na sua conta"}</h1><p class="muted">${passwordMode ? "Escolha uma senha exclusiva, com pelo menos 12 caracteres." : recoveryMode ? "Receba um link no seu e-mail cadastrado." : "Seu espaço de cuidado, em um só lugar."}</p>${passwordMode ? "" : recoveryMode ? '<label>E-mail de recuperação<input name="email" type="email" autocomplete="email" required autofocus></label>' : '<label>Usuário<input name="username" autocomplete="username" placeholder="Seu usuário" required autofocus></label>'}${recoveryMode ? "" : `<label>${passwordMode ? "Nova senha" : "Senha"}<input name="password" type="password" autocomplete="${passwordMode ? "new-password" : "current-password"}" ${passwordMode ? 'minlength="12"' : ""} required></label>`}${passwordMode ? '<label>Confirme a senha<input name="confirmation" type="password" autocomplete="new-password" minlength="12" required></label>' : ""}<p id="error" class="error" role="status" aria-live="polite"></p><button class="primary" type="submit">${passwordMode ? "Salvar senha" : recoveryMode ? "Enviar link" : "Entrar"}</button><button id="access-secondary" type="button">${passwordMode ? "Cancelar e sair" : recoveryMode ? "Voltar ao login" : "Esqueci minha senha"}</button><p class="login-note">Acesso por convite. Sessão e rascunhos temporários: recarregar ou fechar esta página apaga o preenchimento. Não usamos este banco para guardar dados de pacientes.</p></form><p class="login-signature">Mais cuidado. Mais clareza.</p></section></main>`;
    message(notice);
    document.querySelector("#access-secondary").onclick = () => {
      if (busy) return;
      if (passwordMode) return signOut();
      screen(recoveryMode ? "login" : "recovery");
    };
    document.querySelector("#login").onsubmit = async (event) => {
      event.preventDefault();
      if (busy) return;
      if (!client) { message("Não foi possível carregar o acesso. Recarregue a página."); return; }
      const form = event.currentTarget;
      const data = new FormData(form);
      if (passwordMode && data.get("password") !== data.get("confirmation")) {
        message("As senhas precisam ser iguais."); return;
      }
      busy = true;
      form.querySelectorAll("button").forEach(b => b.disabled = true);
      message("Aguarde…");
      try {
        if (recoveryMode) {
          const { error } = await client.auth.resetPasswordForEmail(String(data.get("email")).trim(), {redirectTo: SITE});
          if (error) throw error;
          message("Se houver uma conta autorizada para este e-mail, você receberá um link. Verifique também o spam.");
        } else if (passwordMode) {
          const {error: userError, data: verified} = await client.auth.getUser();
          if (userError || !verified.user) throw new Error("Sessão expirada");
          const {error} = await client.auth.updateUser({password: String(data.get("password"))});
          if (error) throw error;
          setupMode = false;
          await signOut("Senha salva. Entre com seu usuário e a nova senha.");
        } else {
          const response = await fetch("https://lqmvzdibbmbkbexeywwo.supabase.co/functions/v1/username-login", {
            method: "POST", headers: {"Content-Type":"application/json", apikey:"sb_publishable_5pFA-sZUIVNfk_10NJKAdQ_xMgMUGnN"},
            body: JSON.stringify({username: String(data.get("username")).trim(), password: String(data.get("password"))}),
            signal: AbortSignal.timeout(15000)
          });
          if (!response.ok) throw {status: response.status};
          const tokens = await response.json();
          if (!tokens.access_token || !tokens.refresh_token) throw new Error("Sessão inválida");
          const {error} = await client.auth.setSession(tokens);
          if (error) throw error;
          const {data: verified, error: userError} = await client.auth.getUser();
          if (userError || !verified.user || !verified.user.email_confirmed_at) throw new Error("Acesso não confirmado");
          clearWork(); logged = true; render();
        }
      } catch (error) {
        if (!recoveryMode && !passwordMode) { try { await client.auth.signOut({scope:"local"}); } catch {} }
        message(error?.status === 429 ? "Muitas tentativas. Aguarde alguns minutos e tente novamente." : passwordMode ? "Não foi possível salvar a senha. Confira os requisitos ou solicite um novo link." : recoveryMode ? "Não foi possível enviar o link. Tente novamente mais tarde ou contate o responsável pelo acesso." : "Não foi possível entrar. Confira o usuário e a senha e verifique sua conexão.");
      } finally {
        busy = false;
        form.querySelectorAll("button").forEach(b => b.disabled = false);
        form.querySelectorAll('input[type="password"]').forEach(el => el.value = "");
      }
    };
  }
  async function signOut(notice = "") {
    clearWork(); setupMode = false;
    screen("login", "Encerrando sessão…");
    try {
      const {error} = await client.auth.signOut({scope: "local"});
      if (error) throw error;
      screen("login", notice);
    } catch {
      client.auth.stopAutoRefresh();
      screen("login", "Os dados desta página foram apagados. Não foi possível confirmar a saída no servidor; feche esta aba.");
    }
  }
  async function start() {
    const callback = new URLSearchParams(location.hash.slice(1));
    setupMode = ["invite", "recovery"].includes(callback.get("type"));
    const hasCallbackError = callback.has("error") || callback.has("error_code");
    screen("login", "Carregando acesso…");
    try {
      client = window.supabase.createClient("https://lqmvzdibbmbkbexeywwo.supabase.co", "sb_publishable_5pFA-sZUIVNfk_10NJKAdQ_xMgMUGnN", {
        auth: {persistSession: false, autoRefreshToken: true, detectSessionInUrl: true},
        global: {fetch: async (url, options = {}) => {
          const controller = new AbortController();
          const abort = () => controller.abort();
          options.signal?.addEventListener("abort", abort, {once: true});
          if (options.signal?.aborted) abort();
          const timer = setTimeout(abort, 15000);
          try { return await fetch(url, {...options, signal: controller.signal}); }
          finally { clearTimeout(timer); options.signal?.removeEventListener("abort", abort); }
        }}
      });
      client.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setupMode = true;
        if (event === "SIGNED_OUT" && logged) { clearWork(); screen("login", "Sua sessão foi encerrada."); }
      });
      const {data, error} = await client.auth.getSession();
      if (error || hasCallbackError) throw error || new Error("Link inválido");
      if (data.session && setupMode) {
        const {data: verified, error: invalid} = await client.auth.getUser();
        if (invalid || !verified.user) throw invalid || new Error("Link inválido");
        screen("password");
      } else screen("login");
    } catch {
      screen("login", "Não foi possível validar o acesso. Se você abriu um convite, solicite um novo link; caso contrário, tente entrar novamente.");
    } finally {
      if (callback.has("access_token") || callback.has("refresh_token") || hasCallbackError) {
        window.history.replaceState(null, "", location.pathname + location.search);
      }
    }
  }
  // Read-only bridge for the embedded TO module. Always rechecks identity on
  // the issuing Auth backend; never exposes credentials, tokens or user data.
  async function verifiedBridgeIdentity() {
    if (!logged || !client) return null;
    try {
      const {data, error} = await client.auth.getUser();
      if (error || !data?.user?.id || !data.user.email_confirmed_at) return null;
      return {userId: String(data.user.id), supabaseUrl: client.supabaseUrl};
    } catch {
      return null;
    }
  }
  function getEmbeddedClient() { return logged && client ? client : null; }
  return {start, screen, signOut, verifiedBridgeIdentity, getEmbeddedClient};
})();
