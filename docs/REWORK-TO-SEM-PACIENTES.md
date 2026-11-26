# REWORK DO PROJETO-TO — Atendimento temporário sem prontuário

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](../ROADMAP.md); não representa homologação atual.


**Decisão de produto:** 20/11/2026
**Estado:** implementação em branch de desenvolvimento; publicação/homologação pendentes
**Repositório origem:** `danvdss/projeto-to` (privado)
**Integração:** `danvdss/equipe-027`, aba **Terapia Ocupacional**

> **REQUISITO DEFINITIVO:** o Projeto-TO não realizará cadastro, consulta, manutenção, salvamento nem histórico de dados de pacientes. Sua função será disponibilizar instrumentos, formulários e evoluções **temporárias** para revisão e cópia consciente pelo profissional. Nenhum prontuário será criado no Projeto-TO.

## 1. Experiência aprovada para implementação

- Preservar a **página inicial original**: hero “O cuidado tem uma história. Seu registro também.”, ilustração com órbitas, bloco “Onde estamos”, princípios, identidade e estilo.
- Preservar o botão **Entrar**, sem segundo login. Na integração, o login principal do Equipe-027 continua necessário; a verificação ocorre pelo backend de autenticação do E027.
- Após **Entrar**, oferecer **Ferramentas temporárias de Terapia Ocupacional**. Não mostrar “Pacientes”, “Novo paciente”, “Prontuário”, “Responsáveis”, “Consentimentos”, “Sessões de paciente”, “Histórico clínico” ou “Anexos de paciente”.
- Manter o modo **Evolução rápida** antigo do Equipe-027, também temporário, para não quebrar fluxos existentes.
- Não pedir nome, CPF, endereço, prontuário, data de nascimento ou identificador do paciente. Exibir orientação para não incluir identificadores em campos livres.
- O profissional poderá preencher instrumentos, atividades, níveis de assistência e gerar um texto **em tempo real**.
- O texto gerado pode ser revisado manualmente e explicitamente copiado para o sistema de registro institucional autorizado. A cópia é escolha do profissional e poderá persistir **fora** do Projeto-TO.

## 2. Política de dados — regras inegociáveis

1. Formulários e prévias: **somente memória temporária da página atual** (estado React). Recarregar ou fechar a aba descarta o preenchimento.
2. **Nunca salvar dados clínicos** em Supabase/Postgres, Storage, logs, cookies, analytics, cache de aplicação, WebSQL, IndexedDB ou armazenamento local/de sessão.
3. **Nenhuma requisição de leitura ou escrita de prontuário**, anexos, objetivos, anamneses ou sessões de pacientes.
4. Gerador textual puramente local e determinístico; não enviar conteúdo para IA ou APIs remotas.
5. Ausência de cadastro ou formulário de identificação; o sistema não deve convidar à inclusão de dados identificáveis em texto livre.
6. Ações explícitas de copiar/print **não são salvamento do Projeto-TO** e devem ser sinalizadas.
7. Descarte ao clicar em “Nova evolução”, sair ou recarregar: confirmação quando houver alterações. Não prometer recuperação de rascunho perdido.
8. O browser pode manter informações em memória enquanto a página estiver aberta ou o usuário escolher copiar. A política se refere à aplicação e sua infraestrutura, não à impossibilidade física de captura externa ou ao armazenamento no sistema destino.

## 3. Escopo funcional da nova oficina temporária

- Formulário de modalidade e data opcionais; relato e prioridades sem identificação.
- Objetivos terapêutico-ocupacionais da sessão, intervenções realmente realizadas.
- **Atividades repetíveis** com tarefa, desempenho observado, nível de assistência contextualizado e adaptação/recurso.
- Participação, conclusão da tarefa, análise profissional, orientações, plano e retorno.
- Instrumentos disponíveis para registro descritivo: **COPM, Katz, Lawton e Brody, PEDI-CAT, Perfil Sensorial 2, MoCA, M-CHAT-R/F e Outro**.
- Registrar nome, versão, **situação da aplicação, origem das informações**, resultados e observações; não reproduzir automaticamente itens protegidos, nem inferir diagnósticos/escores fora da versão validada.
- **Prévia em tempo real**, texto corrido/SOAP, edição por blocos com origem preservada, botão copiar e nova evolução.
- Desktop com campos e prévia lado a lado; celular com alternância Campos/Evolução.
- Não preencher informações clínicas presumidas ou extraídas de registros anteriores (não há histórico).

## 4. Alteração técnica

### Frontend
- **`src/App.tsx`**: a única rota de trabalho passa a ser `TemporaryWorkspace`; remove da navegação ativa o CRUD de pacientes, login interno, MFA próprio, Perfil de paciente e prontuário.
- **`src/features/session/TemporaryWorkspace.tsx`**: estado em memória, regras de edição e prévia.
- **`src/domain/evolution.ts`**: blocos novos `activities` e `instruments` usando somente os valores explicitamente preenchidos.
- **`src/embedded.tsx`**: não importa cliente Supabase; a verificação do login E027 é callback de conta emitido pelo shell. O módulo não recebe token, cliente, senha ou paciente.
- **`worker/handler.mjs`** e **`vercel.json`**: CSP com **`connect-src 'none'`**, impedindo chamadas de rede de scripts de browser no aplicativo independente.
- **E027 `occupational-portal.js`**: mantém carregamento same-origin, remove a transferência de `getShellClient`, preserva apenas `verifyShellIdentity` (somente `userId` confirmado pelo E027).
- Nenhuma informação clínica é armazenada no backend do TO pela nova interface, e nenhuma informação da evolução é passada ao backend do E027.

### Backend e dados anteriores — etapa operacional SEPARADA
- O novo frontend **não utiliza** as tabelas, RPCs e Storage clínicos antigos; as migrations e código de servidor históricos permanecem no repositório para rastreabilidade.
- **Não apagar automaticamente os dados anteriores** nem remover tabelas/arquivos sem inventário, plano de retenção, autorização do responsável pelo tratamento e avaliação legal/institucional.
- Para desativar definitivamente o serviço anterior, avaliar revogar acessos antigos, desabilitar endpoints/serviços, encerrar chaves compatíveis, revisar backups e retenção. Isso requer revisão operacional do backend, não é consequência automática da troca de telas.
- Se houver dados anteriores, a política institucional define se devem ser retidos, exportados, eliminados ou preservados por motivo legal. Não assumir que estão apagados.
- O Supabase do Equipe-027 permanece apenas para **identidade de profissionais** conforme o escopo atual do acesso principal.

### Segurança da sessão incorporada

- O login emitido pelo Equipe-027 continua sendo a única identidade exigida na integração; o Projeto-TO não solicita uma segunda senha.
- A conta profissional deve ser reconfirmada quando a aba volta ao foco e antes da cópia ou impressão explícitas. A identidade não deve mudar durante a evolução aberta.
- Falha na revalidação descarta o rascunho e retorna à home, sem salvar conteúdo.
- Seis intervenções comuns podem ser acrescentadas por atalhos **não pré-selecionados**, somente após confirmação pelo profissional, com desfazer/refazer.

## 5. Critérios de aceite

- A home original aparece com botão Entrar; sem usuário/senha do Projeto-TO.
- Botão Entrar no módulo incorporado exige a conta E027 confirmada; no app independente, abre somente ferramentas sem armazenamento.
- **Nenhum botão ou rota acessa listagem, cadastro, sessão, histórico ou anexos de pacientes.**
- O build Vite ativo **não contém cliente Supabase clínico nem referência a endpoint remoto**.
- Testes com stubs de `fetch`, APIs de storage e rede garantem que preencher, alterar, revisar, limpar e copiar não fazem nenhuma gravação remota/local.
- Rascunhos temporários desaparecem ao desmontar/reabrir; revisão manual não é sobrescrita.
- Testes completos, lint, TypeScript, compilação e validação visual/mobile.
- Regressão de todos os demais módulos E027 preservada.
- **Homologação clínica e institucional não é presumida.**

## 6. Roadmap pós-rework

1. Concluir a exclusão dos fluxos clínicos persistentes do bundle e testar uso temporário.
2. Avaliar visualmente a home original e a oficina em desktop/celular, com dados sintéticos.
3. Melhorar instrumentos já disponíveis (registro e orientação de uso, sem armazenamento).
4. Harmonizar editor e modelos com as evoluções atuais do Equipe-027.
5. **Somente ao término**, estudar outros instrumentos (Barthel, WHODAS 2.0, GAS, MIF/FIM), conferindo versões, autorizações e licenças antes de implementar formulários ou cálculos.
6. Realizar auditoria operacional dos dados e serviços históricos, separado do rollout frontend.
7. Testes finais de privacidade, acessibilidade e revisão clínica; decisão sobre implantação.

## 7. Execução para agentes

Priorizar privacidade e funcionalidade temporária sobre continuidade longitudinal. Não reintroduzir cadastro, autosave, histórico, persistência clínica ou login próprio em regressões futuras. Testar que não existem imports de API clínica no entrypoint, nem conexões de browser permitidas pelo CSP. Preservar a home e sua identidade visual. Alterações nos dados já existentes, migração, exportação ou exclusão dependem de aprovação específica. Trabalhar em branches de desenvolvimento, com testes e prova de build, sem publicar como homologado.
