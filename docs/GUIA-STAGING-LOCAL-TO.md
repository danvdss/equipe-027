# Guia de montagem local do Projeto-TO dentro do Equipe-027

**Finalidade:** preparar o ambiente local de testes da interface integrada, sem publicar o código privado, dados clínicos, credenciais ou prontuários.

**Estado:** uso por desenvolvedores; não representa homologação ou autorização institucional.

## Pré-requisitos

- Checkouts dos dois projetos no computador, com Node.js e npm instalados.
- Projeto-TO na branch privada de rework sem pacientes.
- Equipe-027 na branch de integração.
- Git disponível no PATH ou pelo GitHub Desktop.
- Usar exclusivamente dados fictícios de testes.

## Preparar

Dentro da pasta do Equipe-027:

```powershell
npm ci
npm run check
npm run stage:to
npm test
```

A rotina `stage:to` busca por padrão um checkout privado irmão chamado `projeto-to-integration`. Se o projeto estiver em outro local, aponte o diretório:

```powershell
$env:PROJETO_TO_DIR = "C:\caminho\para\projeto-to"
npm run stage:to
```

Para usar outro executável Git local, opcionalmente defina `E027_GIT_BIN`.

O comando executa o build do Projeto-TO com suas validações, rejeita pacotes com globais Node ou indicadores do antigo backend clínico, confere que `ot-embedded/` está ignorada e **não rastreada pelo Git** e copia apenas `projeto-to-embedded.js` para essa pasta local. Nunca executa `git add`, `commit`, `push` ou deploy.

### Verificação sem copiar

```powershell
node prepare-private-to.cjs --verify-only
```

Essa opção exige um build privado já existente e apenas confere os pré-requisitos e o pacote, sem alterá-lo.

## Visualização

Para inspecionar a aba integrada, sirva o Equipe-027 localmente, restrito ao loopback:

```powershell
py -m http.server 8766 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:8766/`. O login real deve ser feito **somente por meio do Equipe-027** e usando um ambiente de teste institucional autorizado. A página de Terapia Ocupacional deverá abrir a home original do Projeto-TO, com botão **Entrar**, ferramentas temporárias sem cadastro nem banco clínico, e a alternativa **Evolução rápida**.

A conexão a uma conta real não foi validada neste ciclo. Não use credenciais ou dados reais até a conclusão da revisão de privacidade.

## Guardas de segurança

1. **Jamais adicionar à força `ot-embedded/` ao Git**, criar commits do pacote privado no repositório público ou liberar a rota em hospedagem pública sem autorização.
2. **Não compartilhar a pasta de desenvolvimento em rede pública**; usar `127.0.0.1`.
3. O Projeto-TO não recebe o cliente Supabase nem tokens do E027; o shell confirma apenas a conta profissional. O texto da evolução permanece na memória do componente.
4. O histórico de pacientes do backend antigo não é alterado por este comando. A retenção e desativação desse serviço exigem avaliação separada.
5. Impressão ou salvar como PDF são ações explícitas do profissional e transferem a responsabilidade de guarda para o destino escolhido.

## Critérios para homologação futura

- Ambiente privado realmente integrado à autenticação do Equipe-027.
- Teste E2E com conta de homologação e permissões adequadas, sem dados pessoais reais.
- Testes de acessibilidade com teclado, leitor de tela e dispositivos físicos.
- Revisão das licenças e versões dos instrumentos.
- Auditoria de CSP/headers implantados, backups, serviços e dados legados.
- Aprovação clínica e institucional documentada.

**Não publicar como pronto para uso clínico até que esses critérios sejam atendidos.**
