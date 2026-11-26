# Validação de navegação e evolução temporária — Projeto-TO + Equipe-027

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](../ROADMAP.md); não representa homologação atual.


**Data:** 20/11/2026
**Escopo:** rework do Projeto-TO sem cadastro, armazenamento ou histórico clínico.
**Branches de testes:** `projeto-to: feature/e027-embedded-ot-home`; `equipe-027: feature/e027-ot-host`.
**Status:** validação de desenvolvimento, não homologação institucional.

## Entregas verificadas

### 1. Página inicial preservada
- A home mantém o título **“O cuidado tem uma história. Seu registro também.”**, ilustração de órbitas, princípios e botão **Entrar**.
- O Projeto-TO embutido inicia na home e recebe apenas a verificação de identidade do Equipe-027. Não recebe token, cliente Supabase ou dados de pacientes.
- A aba ainda oferece a **Evolução rápida** antiga do Equipe-027.
- O pacote React é servido por um endereço fixo da mesma origem (`ot-embedded/projeto-to-embedded.js`) e montado em Shadow DOM.
- Se o pacote estiver ausente, não ocorre acesso clínico; o usuário pode permanecer na evolução rápida.

### 2. Correção do pacote incorporável
A primeira compilação Vite no modo library mantinha checagens `process.env.NODE_ENV` do React, causando **`ReferenceError: process is not defined`** no navegador. Adicionada substituição de ambiente no arquivo `vite.embedded.config.ts` e criada verificação automática `scripts/verify-embedded.mjs`. Essa verificação é executada por `npm run build:embedded` e falha se o pacote contiver dependência de Node ou referência identificável ao backend histórico de pacientes.

**Prova técnica local:** após a correção, o pacote foi carregado diretamente no navegador Edge, com a home renderizada e sem exceções observadas. O bundle reduziu de aproximadamente 934 KB para 373 KB.

### 3. Testes reais de navegador — dados sintéticos
Ambiente: Microsoft Edge 158, automação via Chrome DevTools Protocol, localhost; desktop e emulação de viewport móvel.

| Tela | Largura | Elementos/fluxos observados | Resultado |
| --- | ---: | --- | --- |
| Home incorporada | 1440 px | Hero, CTA Entrar, Shadow DOM, CSS isolado | Aprovado |
| Home incorporada | 390 px | Página responsiva, botão e textos | Aprovado |
| Home incorporada | 320 px | Página responsiva, botão e textos | Aprovado |
| Editor independente | 1360 px | Campos e evolução lado a lado, digitação gera prévia | Aprovado |
| Editor independente | 390 px | Alternância Campos/Evolução, digitação gera prévia | Aprovado |
| Editor independente | 320 px | Alternância Campos/Evolução, digitação gera prévia | Aprovado |

Nas seis verificações, **sem rolagem horizontal indevida** e sem erros de execução registrados. Os testes usaram apenas relato fictício sem dados pessoais.

Capturas técnicas foram salvas somente no computador de desenvolvimento, em pasta local não versionada; não fazem parte do repositório público.

### 4. Revisão de evoluções e instrumentos
- Evolução em tempo real, SOAP/texto corrido, atividades com nível de assistência e adaptação.
- Registro descritivo dos instrumentos existentes, incluindo **situação do instrumento** e **origem das informações**. Nenhum escore ou diagnóstico é calculado automaticamente.
- Correção de pontuação duplicada para textos terminados em ponto, exclamação ou interrogação.
- **Desfazer/Refazer** de campos, revisões e ações no editor; histórico limitado a 50 mudanças, exclusivamente na memória da página.
- **Nova evolução/Limpar** confirma descarte e elimina também o histórico de Desfazer/Refazer.

### 5. Proteção contra dados persistidos
- O entrypoint ativo não importa pacientes, prontuários, autosave, banco clínico ou anexos.
- O build ativo foi inspecionado para referências de endpoints de Supabase e prontuário, além das regras de CSP que bloqueiam `connect-src` no aplicativo independente.
- Nenhuma gravação foi observada nos testes automatizados de preenchimento. Os testes unitários não substituem uma auditoria de segurança em ambiente implantado.
- A ação de copiar é explícita. A proteção não se estende a dados que o usuário deliberadamente cole em outro sistema.

### 6. Teste do fluxo incorporado após Entrar (identidade **simulada apenas no QA local**)

O módulo React foi montado dentro do shell E027 via pacote same-origin. Uma identidade **fictícia e injetada exclusivamente no navegador de teste**, sem vínculo com conta real, permitiu avançar do CTA **Entrar** até a oficina temporária para verificar o fluxo de interface.

- **1360 px e 390 px:** oficina carregada, digitação refletida na prévia imediatamente, sem rolagem horizontal ou exceções.
- Monitoramento local de requisições de navegador: **nenhuma chamada a endpoints clínicos/Supabase** durante o fluxo testado.
- Nenhum campo de identificação de paciente foi apresentado.
- **Este teste não comprova login real, MFA, autorização institucional ou disponibilidade pública.**

### 7. Regressão automatizada e melhoria do editor

- Projeto-TO: **285 testes aprovados** em 36 arquivos de testes; build Vercel, build Worker/versão standalone, build incorporável e ESLint aprovados.
- Equipe-027: **118 testes aprovados** e checagem da plataforma aprovada.
- Campo de instrumento ampliado para **situação de aplicação** e **origem das informações**, sem cálculo automático de escore.
- Pontuação dos campos textuais revisada: frases com ponto final não ganham segundo ponto.
- **Desfazer/Refazer**, com limite de 50 estados somente em memória e descarte de histórico ao limpar.
- `scripts/verify-embedded.mjs` executado automaticamente depois do build para bloquear referências de Node.js e endpoints históricos de pacientes.

## Limites e pendências

1. **Não há autorização para apagar automaticamente tabelas ou dados anteriores** do Projeto-TO. Inventário de retenção, backups, acessos legados e desativação operacional exigem aprovação e execução separadas.
2. O pacote privado **não** foi incorporado à publicação pública do Equipe-027. Preparar um ambiente de homologação com distribuição privada autorizada; nunca copiar código privado ou segredos para o repositório público sem revisão.
3. Ainda são necessários testes manuais de teclado, leitor de tela, contraste final, impressão e dispositivos móveis físicos.
4. Os instrumentos dependem da confirmação de versão, condições de uso e licenças antes de disponibilizar protocolos completos ou escores.
5. **Homologação clínica, privacidade institucional e liberação para pacientes reais continuam pendentes.**

## Próximo passo recomendado

Implementar uma publicação de testes unificada e privada, com autenticação E027, revisão de segurança e teste E2E em ambiente real. Após a aprovação, manter a evolução temporária como produto ativo e arquivar administrativamente os serviços de prontuário antigos. Somente depois ampliar a biblioteca de instrumentos.

## Rodada complementar — impressão, acessibilidade e descarte (20/11/2026)

### Impressão/PDF, sem salvar pacientes
- Botão explícito **Imprimir / PDF** só habilitado quando a evolução contém texto.
- O conteúdo de impressão é montado como DOM textual temporário, sem HTML dinâmico, por `buildTemporaryPrintSheet()`.
- Em `beforeprint`, cria-se uma folha com o texto corrente e aviso de revisão institucional. Em `afterprint` ou na desmontagem, a cópia é removida.
- Não existe gravação de PDF, arquivo ou prontuário pelo Projeto-TO: salvar como PDF é uma escolha explícita do profissional no navegador e cria dados fora desta ferramenta.
- Testes unitários confirmam impressão desabilitada em branco, conteúdo correto, ausência de interpretação de HTML e remoção após a saída.

### Navegador real
- Edge 158, desenvolvimento local com dados **sintéticos**, 1360 px (app independente) e 390 px (incorporado ao Equipe-027).
- Verificado o percurso da edição até a folha de impressão em `print` CSS: folha presente e visível, texto exato, nenhum campo de paciente, folha removida após `afterprint`.
- **axe-core** para WCAG 2.0/2.1 A/AA nos dois cenários: **zero violações reportadas**. Isso não substitui avaliação humana, dispositivo físico, testes de teclado/leitor de tela ou auditoria de contraste institucional.
- Nenhum erro de execução ou requisição a endpoints clínicos/Supabase foi observado nesses fluxos.

### Navegação e privacidade realistas
- Testado módulo React já incorporado com **identidade simulada somente em QA**, sem autenticação de uma conta real.
- Após editar dados fictícios, cancelar o diálogo de descarte manteve o rascunho; confirmar a saída desmontou o módulo; reentrar carregou a **home original**, sem o texto anterior.
- O estado e histórico de desfazer/refazer permanecem na memória da sessão e não são persistidos.
- A validação com login verdadeiro do Equipe-027, a distribuição privada do pacote, a revisão dos serviços legados e a homologação **ainda estão pendentes**.

## Preparação de staging local privado (sem deploy)

Foi criado no Equipe-027 o script `prepare-private-to.cjs`, acionado por `npm run stage:to`. A rotina:

1. Localiza o repositório privado do Projeto-TO fora do checkout público.
2. Confere o pacote, executa o build privado e sua verificação de ausência de endpoints clínicos.
3. Recusa origem errada, referências clínicas e arquivos privados já rastreados pelo Git.
4. Copia **somente o bundle incorporável** para `ot-embedded/`, pasta ignorada no repositório Equipe-027.
5. Não faz commit, push, publicação, migração de banco nem troca de credenciais.

Quatro testes automatizados de proteção da montagem local foram aprovados. O próprio comando `npm run stage:to` foi executado e validado no computador de desenvolvimento.

Instruções operacionais completas: [GUIA-STAGING-LOCAL-TO.md](GUIA-STAGING-LOCAL-TO.md).

**Importante:** o staging aqui é **local**. O site público do Equipe-027 permanece inalterado; a autenticação com conta real, hospedagem privada e homologação institucional não foram concluídas.

## Resultado final desta rodada de testes (20/11/2026)

- **Projeto-TO:** 289 testes automatizados aprovados; checagem TypeScript, ESLint, build Worker, Vercel e build incorporável aprovados.
- **Equipe-027:** 122 testes automatizados aprovados, incluindo quatro testes de proteção da montagem privada e checagem da plataforma aprovada.
- **Total: 411 testes automatizados aprovados** entre os dois projetos.
- O navegador Edge confirmou a geração textual, a folha de impressão e a remoção da cópia após o evento afterprint, tanto na versão independente quanto incorporada.
- Axe-core não apontou violações WCAG 2.0/2.1 A ou AA nos cenários testados; isso não constitui certificação de acessibilidade.
- Cancelar a saída preserva o rascunho; sair e retornar abre a home sem o texto anterior.
- A compilação e montagem local privada passaram pela nova rotina npm run stage:to, sem inclusão de bundle no Git público.
- **Não houve** autenticação com conta real, publicação institucional privada, avaliação em aparelhos físicos, auditoria do banco legado ou homologação clínica.

## Revisão de privacidade e desligamento de sessão

- O projeto Supabase anterior do Projeto-TO ainda mantém tabelas e registros históricos. Foi realizado inventário privado **somente-leitura**, sem identificar pacientes e sem executar exclusões ou migrações.
- Foram identificados avisos de segurança que exigem avaliação administrativa, inclusive RPCs privilegiadas ainda disponíveis para usuários autenticados.
- **Desativação do banco legado não realizada**: exige inventário, retenção autorizada, revisão de acessos, testes negativos e plano de reversão.
- O Equipe-027 agora desmonta o React incorporado antes de substituir a tela por login, tanto no logout explícito quanto na invalidação da sessão.
- O fluxo de confirmação de saída considera também mudanças não salvas no editor temporário, recebendo apenas um sinal booleano, sem texto clínico.
- Testes adicionais de limpeza de sessão, recusa de descarte e integridade do estado temporário foram adicionados às branches de desenvolvimento.

## Etapa de segurança do shell e inventário legado — revisão de 20/11/2026

- Corrigido o encerramento de sessão do E027 para desmontar o React antes de reconstruir a tela de login, inclusive em SIGNED_OUT e falha na revogação remota.
- O editor privado informa ao shell apenas um **booleano de alterações pendentes**, sem compartilhar texto clínico. A confirmação de logout/novo atendimento agora reconhece esses dados temporários.
- Backend legado Projeto-TO: inventário administrativo de contagens e políticas RLS, sem leitura de informações individuais. **Ainda há registros e objetos históricos**, não foram removidos.
- Advisors identificaram RPCs clínicas privilegiadas no projeto legado e avisos de proteção de senhas comprometidas nos dois projetos; exigem avaliação institucional antes de alterar privilégios.
- Concluídos **292 testes no Projeto-TO** e **126 testes no Equipe-027** nesta rodada, totalizando **418 aprovados**. Build incorporável, Vercel, TypeScript, lint e checagem da plataforma aprovados.
- A versão pública permanece intacta, sem homologação, desativação de banco ou uso de dados reais de pacientes.

## Revalidação da conta principal e atalhos de intervenções — 20/11/2026

- Quando o Projeto-TO está incorporado ao Equipe-027, a conta profissional verificada em **Entrar** é comparada com a identidade retornada ao voltar o foco do navegador ou reabrir a aba.
- Antes das ações explícitas **Copiar evolução** ou **Imprimir / PDF**, a identidade profissional é reconfirmada no emissor do login E027. Nenhum texto clínico é enviado nessa verificação.
- Se a conta foi revogada, substituída, não está disponível ou a checagem falha, a oficina temporária é desmontada, o texto e o histórico local são descartados e a home mostra o motivo.
- O Projeto-TO independente mantém o comportamento solicitado: home e botão **Entrar** sem segundo login nem cadastro de paciente.
- Criados seis atalhos *opcionais* de intervenções de Terapia Ocupacional. Nenhum item é preenchido automaticamente; o profissional seleciona explicitamente uma intervenção realmente realizada, e pode desfazer/refazer.
- **Testes unitários específicos:** revalidação de sessão, troca de usuário, falha de rede, cópia e impressão autorizadas e negadas, retorno de aba, preenchimento rápido e desfazer.
- **Navegador real (Edge em localhost, QA com identidade fictícia):** verificadas a remoção do rascunho após revogação ao voltar à aba (390 px), bloqueio de cópia após mudança de usuário (1360 px) e intervenção por atalho com desfazer (390 px). Todos sem erros de execução e sem requisições clínicas remotas observadas.
- **Limites:** a validação real de credenciais institucionais e testes de políticas implantadas ainda dependem de ambiente de homologação autorizado. A interface não impede que funções nativas externas ao app salvem cópias por conta do próprio profissional.

## Fechamento da etapa de continuidade de sessão e preenchimento dinâmico

**Verificações concluídas em 20/11/2026, na branch de integração (não implantada no site público):**

- npm run check e ESLint do Projeto-TO: **aprovados**.
- npm run build:embedded: **aprovado**, com verificação automática de ausência do backend clínico antigo; pacote de aproximadamente 382 KB.
- npm run build:vercel: **aprovado**, com verificação de artefatos locais; políticas HTTP remotas ainda não foram validadas.
- npm test no Projeto-TO: **304 testes aprovados em 40 arquivos**.
- npm run check no Equipe-027: **aprovado**.
- npm test no Equipe-027: **126 testes aprovados**.
- **Total verificado nesta rodada: 430 testes aprovados**, sem falhas.
- Smoke tests em navegador Edge, com identidade de profissional **simulada em localhost**, confirmaram três fluxos: descarte ao retomar sessão revogada (390 px), bloqueio de cópia após troca de usuário (1360 px) e atalho de intervenção com desfazer (390 px).
- A distribuição local do pacote privado por npm run stage:to continua fora do repositório público; **nenhuma implantação, migração ou alteração de dados clínicos foi feita**.

**Pendências externas à implementação:** login real com conta institucional de homologação, revisão final de acessibilidade em dispositivos físicos, decisões de retenção do Supabase legado, revisão dos avisos de segurança e autorização explícita de publicação.
