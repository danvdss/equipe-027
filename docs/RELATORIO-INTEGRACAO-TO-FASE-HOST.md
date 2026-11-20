# Entrega da interface unificada — Equipe-027 / Projeto-TO

**Data de referência:** 20/11/2026
**E027:** branch `feature/e027-ot-host`, a partir da main pública (não integrada ao site).
**Projeto-TO:** branch privada `feature/e027-embedded-ot-home`.
**Estado:** integração de interface e ponte de identidade em teste; autenticação/banco unificados e homologação **pendentes**.

## O que já funciona em desenvolvimento

- O Equipe-027 mantém seu dashboard e todas as abas.
- A aba Terapia Ocupacional passa a oferecer **Projeto-TO completo** e **Evolução rápida**. Na entrada inicial é selecionado o Projeto-TO.
- O projeto privado exporta `mountProjetoTo(container, options)`; sua **home original** é preservada e usa o botão **Entrar** sem formulário de login interno.
- O módulo é carregado sem iframe, em um contêiner React com Shadow DOM e CSS isolado. O E027 controla a navegação global; o Projeto-TO mantém a navegação clínica secundária.
- Alternar para **Evolução rápida** preserva o formulário anterior, seu texto e rascunho temporário na sessão.
- O script `occupational-portal.js` carrega um caminho **fixo e same-origin**: `./ot-embedded/projeto-to-embedded.js`; se faltar, mostra aviso seguro e mantém Evolução rápida.
- O artefato da origem privada **não** fica no Git do Equipe-027. `ot-embedded/` está no .gitignore.
- A saída do módulo chama `unmount` e respeita rascunhos não salvos. Navegações com cancelamento não desmontam o formulário.
- A ponte verifica a identidade do Equipe-027 no servidor por `Access.verifiedBridgeIdentity()` e, quando o Supabase tiver o **mesmo emissor**, poderá reutilizar o cliente da sessão em memória. Sem correspondência de identidade, workspace e MFA, o acesso clínico é bloqueado.
- No Projeto-TO o editor recebeu prévia em tempo real, campos de relato/análise/orientação, alternância SOAP/texto corrido, cópia e preservação de blocos manuais.

## Executar uma montagem local de desenvolvimento

1. Executar `npm ci`, `npm test` e `npm run build:embedded` **no repositório privado Projeto-TO**.
2. Em ambiente local/autorizado, copiar `dist/embedded/projeto-to-embedded.js` para a pasta `ot-embedded/` do checkout **E027 de desenvolvimento**.
3. Abrir o E027 num servidor local HTTPS/localhost; entrar com uma conta de teste própria do Equipe-027 e clicar em **Terapia Ocupacional**.
4. Confirmar que a **home original** aparece, com hero “O cuidado tem uma história. Seu registro também.”, ilustração e botão Entrar.
5. Confirmar que o botão **não abre prontuários** enquanto os dois projetos não compartilharem a mesma identidade Supabase e as permissões clínicas.
6. Alternar para **Evolução rápida**, testar formulário, edição, cópia e retorno à aba.
7. Não copiar o bundle privado para o repositório público nem utilizar dados de pacientes.

## Bloqueios reais

- **Backends Supabase distintos:** o E027 e o Projeto-TO não compartilham o mesmo emissor de JWT, usuário e políticas de acesso. É proibido converter JWT no navegador, desativar RLS/MFA, copiar senhas ou acessar o banco sob uma conta administrativa no frontend.
- **Migração de usuários, workspace e clínica:** exige planejamento controlado, revisão administrativa, testes de RLS, recuperação/expiração de sessão e aprovação institucional.
- **Distribuição privada:** planejar a implantação unificada sob uma origem única compatível com o código privado (preferência por build privado com controles adequados), mantendo o site público anterior inalterado até o aceite.
- **Campos/instrumentos:** a próxima fatia integrará os campos detalhados, tarefas, níveis de assistência e instrumentos do Occupational do E027 ao editor do Projeto-TO sem regravar notas finalizadas.
- **E2E e homologação:** concluir testes em browsers/mobile com dados fictícios, revisar acessibilidade, privacidade, impressão e assinatura clínica/institucional.

## Instrução da próxima etapa

**Priorizar a migração da autenticação para um provedor único, antes de liberar prontuários.** Enquanto isso, a interface pode ser testada localmente com dados fictícios, e a evolução rápida permanece funcional. A biblioteca de novos instrumentos deve continuar no backlog posterior ao aceite do núcleo integrado.

**Não declarar homologação, ambiente pronto para paciente ou acesso clínico concluído com base nestes testes.**
