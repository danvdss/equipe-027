/**
 * Local-only integration preparation for the private Projeto-TO.
 * Never pushes, deploys, or copies private source files into Equipe-027.
 * Only the verified browser bundle is placed into ignored ot-embedded/.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, ".");
const bundleName = "projeto-to-embedded.js";
const localOutput = path.join(root, "ot-embedded", bundleName);

function assertPrivateSource(source, host = root) {
  const sourcePath = path.resolve(source);
  const hostPath = path.resolve(host);
  if (sourcePath === hostPath || sourcePath.startsWith(hostPath + path.sep)) {
    throw Error("O repositório privado deve ficar fora do repositório público Equipe-027.");
  }
  const manifestPath = path.join(sourcePath, "package.json");
  if (!fs.existsSync(manifestPath)) throw Error("Repositório privado do Projeto-TO não encontrado.");
  const info = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (info.name !== "projeto-to" || !info.scripts?.["build:embedded"]) {
    throw Error("A origem informada não é um Projeto-TO com build incorporável.");
  }
  return sourcePath;
}

function verifyBundle(file) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes("mountProjetoTo")) throw Error("Pacote sem entrada mountProjetoTo.");
  if (/\bprocess\.env\b|\brequire\(["']|\b__dirname\b/.test(source)) {
    throw Error("Pacote incompatível com o navegador.");
  }
  if (/supabase\.co|\/rest\/v1|\/auth\/v1|\/storage\/v1|clinical_notes|patient_drafts/i.test(source)) {
    throw Error("Pacote contém referências ao armazenamento clínico anterior.");
  }
  return fs.statSync(file).size;
}

function findGitBinary() {
  const candidates = [
    process.env.E027_GIT_BIN,
    "git",
    path.join(process.env.ProgramFiles || "C:\\Program Files", "Git", "cmd", "git.exe"),
  ].filter(Boolean);
  const local = process.env.LOCALAPPDATA;
  const desktop = local && path.join(local, "GitHubDesktop");
  if (desktop && fs.existsSync(desktop)) {
    const builds = fs.readdirSync(desktop)
      .filter((name) => /^app-/.test(name))
      .sort().reverse();
    for (const build of builds) {
      candidates.push(path.join(desktop, build, "resources", "app", "git", "cmd", "git.exe"));
    }
  }
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (result.status === 0) return candidate;
  }
  throw Error("Git não encontrado; defina E027_GIT_BIN antes de preparar a integração.");
}

function assertPublicRepoIgnored(host = root) {
  const rules = fs.readFileSync(path.join(host, ".gitignore"), "utf8");
  if (!/^ot-embedded\/\s*$/m.test(rules)) {
    throw Error("A pasta privada ot-embedded/ precisa estar no .gitignore.");
  }
  const tracked = spawnSync(findGitBinary(), ["ls-files", "--", "ot-embedded"], {
    cwd: host,
    encoding: "utf8",
  });
  if (tracked.status !== 0) throw Error("Não foi possível conferir arquivos rastreados pelo Git.");
  if (tracked.stdout.trim()) throw Error("Há arquivos privados ot-embedded rastreados pelo Git.");
}

function prepare(options = {}) {
  const privateSource = assertPrivateSource(
    options.privateSource ||
      process.env.PROJETO_TO_DIR ||
      path.resolve(root, "..", "projeto-to-integration"),
  );
  assertPublicRepoIgnored();
  if (!options.verifyOnly) {
    // Windows .cmd scripts are invoked by cmd.exe with fixed arguments.
    // Do not use shell:true with interpolated or user-supplied strings.
    const onWindows = process.platform === "win32";
    const command = onWindows ? process.env.ComSpec || "cmd.exe" : "npm";
    const args = onWindows
      ? ["/d", "/s", "/c", "npm", "run", "build:embedded"]
      : ["run", "build:embedded"];
    const build = spawnSync(command, args, {
      cwd: privateSource,
      stdio: "inherit",
      shell: false,
    });
    if (build.status !== 0) throw Error("Build privado falhou; nenhum pacote será copiado.");
  }
  const privateOutput = path.join(privateSource, "dist", "embedded", bundleName);
  if (!fs.existsSync(privateOutput)) {
    throw Error("Build do Projeto-TO não gerou o pacote incorporável.");
  }
  const size = verifyBundle(privateOutput);
  if (!options.verifyOnly) {
    fs.mkdirSync(path.dirname(localOutput), { recursive: true });
    fs.copyFileSync(privateOutput, localOutput);
    verifyBundle(localOutput);
  }
  console.log("Projeto-TO validado (" + size + " bytes). " +
    (options.verifyOnly
      ? "Apenas verificação, sem copiar."
      : "Pacote copiado para pasta local ignorada pelo Git."));
}

if (require.main === module) {
  try {
    prepare({ verifyOnly: process.argv.includes("--verify-only") });
  } catch (error) {
    console.error("Integração local recusada:", error.message);
    process.exitCode = 1;
  }
}

module.exports = { assertPrivateSource, verifyBundle, assertPublicRepoIgnored, prepare };
