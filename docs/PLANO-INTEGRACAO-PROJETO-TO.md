# Equipe-027 — Plano de incorporação do Projeto-TO na aba Terapia Ocupacional

**Versão do documento:** 1.0 · **Data:** 20/11/2026  
**Repositórios:** https://github.com/danvdss/equipe-027 (principal, público) e https://github.com/danvdss/projeto-to (origem, privado).  
**Situação:** planejamento para desenvolvimento; nenhuma integração foi homologada ou autorizada para dados de pacientes reais.

## 1. Decisão principal: preservar a página inicial ORIGINAL do Projeto-TO

**REQUISITO OBRIGATÓRIO:** o Equipe-027 mantém sua tela inicial, login e todas as abas existentes. Ao clicar na aba **Terapia Ocupacional**, o usuário encontra a **página inicial original do Projeto-TO**, não a lista de pacientes, não a evolução e não uma nova tela de login.

Preservar como referência o conteúdo da condição page === "home" em **projeto-to/src/App.tsx**:
- Título **“O cuidado tem uma história. Seu registro também.”**, texto da proposta e painel de boas-vindas;
- Composição, cores, tipografia, ilustração com órbitas e elementos “Registro / Pessoa / Continuidade”;
- Blocos **“Onde estamos”** e **“O essencial, bem cuidado”**, princípios de cuidado e informações de desenvolvimento;
- Aparência original do Projeto-TO, com ajustes mínimos para caber no módulo interno do Equipe-027; atualizar avisos de progresso somente quando comprovados;
- Responsividade para desktop e celular.

**ÚNICA alteração na entrada:** substituir o CTA **“Acessar meu espaço”** por um botão principal com texto **“Entrar”**. Retirar formulário de usuário/senha, página de login interna, opção de login duplicada no menu e botão de logout duplicado. Na apresentação deve haver **um único CTA primário: Entrar**. Os demais blocos podem ser informativos, sem oferecer acessos clínicos alternativos.

Fluxo:

~~~text
LOGIN GERAL DO EQUIPE-027
        ↓
DASHBOARD GERAL DO EQUIPE-027 (inalterado)
        ↓ clique em Terapia Ocupacional
HOME ORIGINAL DO PROJETO-TO (hero + órbitas + princípios)
        ↓ botão [Entrar]
VERIFICAÇÃO EFETIVA DE SESSÃO / WORKSPACE / MFA
        ↓ quando autorizado
ESPAÇO INTERNO DO PROJETO-TO
        ├─ Cadastros e prontuários
        ├─ Anamnese e perfil ocupacional
        ├─ Episódios e objetivos
        ├─ Sessões e evoluções
        ├─ Histórico, documentos e anexos
        └─ Segurança e preferências cabíveis
~~~

**Sem segundo login não significa sem autenticação.** O botão **Entrar** não faz login fictício nem libera dados automaticamente. Se não houver acesso ao backend, mostrar um aviso de autorização indisponível e manter o prontuário bloqueado. MFA pontual em operações sensíveis, inclusive finalização de evolução, continua obrigatório quando aplicável. O usuário pode voltar à home do Projeto-TO dentro da aba e retornar ao dashboard geral sem perder indevidamente o trabalho.

## 2. Análise comparativa: o que existe e o que deve ser preservado

### Equipe-027

O módulo **Occupational** em app.js já contém:
- Modalidades: avaliação inicial, acompanhamento, reavaliação, orientação, grupo, visita, alta e ausência;
- Dados da sessão, demanda, prioridades, relato, ocupações e tarefas repetíveis, assistência por tarefa e intervenções;
- Objetivos funcionais, análise ocupacional, resposta observada, orientações, encaminhamentos e plano;
- Perfil ocupacional ampliado, AVD, AIVD, saúde, sono, educação, trabalho, brincar, lazer e participação social;
- **Evolução em tempo real**, alternância entre **texto corrido e SOAP** e proteção contra sobrescrita manual, testadas em occupational.test.cjs;
- Instrumentos: **M-CHAT-R/F, COPM, Katz, Lawton e Brody, PEDI-CAT, Perfil Sensorial 2, MoCA e Outro**, com origem/versão, escores, subtestes e interpretação profissional.

Os demais módulos do Equipe-027 e seu editor devem permanecer operacionais, sem regressões.

### Projeto-TO

O Projeto-TO usa **React + TypeScript + Vite**, com Supabase e divisão entre frontend, domínio, repositórios tipados e migrations. Possui:
- Home visual própria, cadastro de pacientes, responsáveis e consentimentos;
- Anamnese versionada, condições/observações, episódios de cuidado, objetivos, sessões;
- Evolução por blocos rastreáveis, conciliação da redação automática e manual;
- Rascunho versionado, autosave, tratamento de conflitos e falhas de rede;
- Finalização protegida, histórico imutável, adendos, anexos e impressão/documentos;
- Controle por workspace, RLS, autenticação MFA e verificações de sessão.

**Arquivos para leitura antes de codificar:** src/App.tsx; src/features/patients/Patients.tsx; EvolutionPreview.tsx; useEvolutionAutosave.ts; FinalizeClinicalNote.tsx; FinalizedNotes.tsx; TemplateGuide.tsx; src/domain/evolution.ts; src/lib/clinical-drafts.ts; supabase/migrations; tests. Ler também os relatórios em docs/ para identificar o estado atual, e não assumir que todos os gates foram aprovados.

## 3. Arquitetura proposta

Manter **Equipe-027 como aplicação principal**, com a aba Terapia Ocupacional como contêiner para um **módulo React montável** do Projeto-TO.

- Incorporar o bundle React via build integrado e carregamento sob demanda; não usar iframe, link externo nem segunda aplicação visualmente desconectada.
- Preservar os componentes da home do Projeto-TO; transformar sua sidebar/topbar, quando necessário, em **navegação secundária** para evitar dois cabeçalhos globais e dois logouts.
- Integrar comunicação explícita do shell com o módulo: identidade autorizada, entrar, voltar, sair da aba, logout geral, rascunho pendente e erros.
- Isolar estilos CSS e tokens: o Projeto-TO não pode alterar o tema de Exames, HAS/DM, receituário e demais abas. Harmonizar contraste e estados de foco.
- Carregar funcionalidades clínicas após **Entrar**, sem prejudicar o tempo de abertura do dashboard principal.
- Preservar a home como primeiro estado da aba TO a cada abertura, salvo mudança futura validada.

### Autenticação: risco técnico essencial

Os dois repositórios atualmente têm **projetos Supabase distintos**. Um JWT de uma instância não pode ser aceito como identidade na outra. **Não** esconder o formulário de login e fingir que a autorização existe. **Não** desativar MFA, RLS, controle de workspace ou backend para simplificar.

**Estratégia preferencial:** definir uma fonte única de identidade e sessão, com migração/compatibilização administrada das contas e das permissões, mantendo os requisitos de segurança mais fortes do Projeto-TO. Avaliar a compatibilidade do login por nome de usuário do Equipe-027. Dados, senhas e tokens não são copiados automaticamente. Sem identidade/autorização validada no backend, a home pode aparecer, mas o acesso ao prontuário deve falhar de forma segura.

Dois modos de trabalho:
1. **Evolução rápida**: campos temporários, sem selecionar prontuário, sem salvar automaticamente no banco.
2. **Atendimento longitudinal**: paciente, episódio e sessão escolhidos explicitamente; leitura/escrita restritas por workspace e salvamento versionado.

Não transformar evolução geral, exames ou outros atendimentos em sessões de Terapia Ocupacional.

## 4. Evoluções: nova experiência dinâmica (prioridade máxima do módulo)

### 4.1 Visual

**Desktop:** duas áreas ajustáveis lado a lado:
- **Esquerda — Campos:** seções recolhíveis, campos bem agrupados, opções rápidas, chips, tarefas e intervenções repetíveis;
- **Direita — Evolução em tempo real:** prévia viva do registro, em texto corrido ou SOAP, com edição manual e ações de revisão.

**Celular:** uma coluna, alternância acessível **Campos / Evolução**, ação de copiar e indicador de rascunho visíveis, sem rolagem horizontal.

A nova tela deve ter a agilidade e detalhamento da evolução do Equipe-027, porém utilizando a estrutura segura do Projeto-TO.

### 4.2 Campos que precisam existir

| Seção | Campos e ações |
| --- | --- |
| Atendimento | Data, modalidade, local, participantes, fonte do relato, profissional e vínculo com episódio/sessão |
| Demanda | Motivo, prioridade da pessoa, relato do dia, comparação documentada |
| Objetivos | Objetivos ativos do episódio; objetivo específico da sessão; pactuação e indicador observável |
| Atividades | **+ Adicionar tarefa**, ocupação, contexto, desempenho, barreiras, facilitadores e recurso/adaptação |
| Assistência | Sem ajuda, supervisão, pistas verbais/visuais/gestuais, ajuda física parcial/total, tecnologia assistiva, **vinculados à tarefa** |
| Intervenções | Tipo, atividade realizada, finalidade, duração, adaptação, estratégia e resposta |
| Participação | Engajamento, dificuldades, conclusão, origem observada/relatada e intercorrências |
| Análise ocupacional | Evidência, impacto funcional e comparação com encontros anteriores quando documentada |
| Condutas | Orientações realizadas, destinatário, encaminhamento, plano, retorno e justificativa de alta |
| Instrumentos | Nome, versão, fonte, data, situação, escores, domínios, resultados e interpretação do profissional |
| Ausência | Motivo conhecido, contato efetivamente realizado e conduta; excluir atividades não realizadas |

Usar campos condicionais por modalidade, textareas autoajustáveis, listas pesquisáveis, indicadores de preenchimento e modelos de estrutura (avaliação inicial, acompanhamento, grupo, visita, reavaliação, alta, ausência).

**Nunca** gerar diagnósticos, fatos, condutas ou resultados não informados. Diferenciar “não informado”, “não observado”, “não realizado” e “sem ocorrência”; não preencher achados de sessões anteriores como se fossem atuais.

### 4.3 Prévia em tempo real

- Atualizar texto automaticamente a cada digitação, seleção ou remoção, com debounce leve apenas se necessário, **sem botão Gerar obrigatório**.
- Permitir alternar **SOAP / texto corrido** preservando dados e edição profissional.
- Reaproveitar o modelo de blocos de src/domain/evolution.ts: **id, kind, origin, sourceKeys, generatedFrom**.
- Blocos automáticos atualizam. Blocos **editados/manual** nunca são sobrescritos silenciosamente.
- Se um campo mudar depois da edição manual, comparar texto atual e sugestão: **Manter minha edição / Aplicar sugestão**.
- Permitir **desfazer/refazer**, adicionar trecho manual, copiar exatamente a redação revisada e limpar com confirmação.
- Dar feedback visual de campos relevantes ainda não preenchidos, sem transformar completude em indicação clínica.
- Gerar texto **determinístico/local**; não enviar dados clínicos a serviços externos de IA.

### 4.4 Mapeamento técnico a implementar

Criar adaptadores tipados entre os campos do Occupational de app.js e o EvolutionForm/blocks do Projeto-TO:

| Campos Equipe-027 | Estrutura unificada |
| --- | --- |
| recordDate, otMode, otLocation, otSource | Metadados da sessão, sem inventar horário |
| otDemand, otPriority, otReport | Demanda e relato |
| otTask_*; c:otTask_*_help | Tarefas repetíveis e assistência contextual |
| otGoal, otAgreement, otIndicator | Objetivos da sessão (distintos dos objetivos longitudinais) |
| c:otInterventions, otIntervention, otPurpose, otAdaptation, otDuration | Intervenções realizadas |
| otResponse, otAnalysis, otEvents, otComparison | Resposta e análise |
| otGuidance, otRecipient, otPlan, otReferral, otReturn* | Condutas e continuidade |
| otTest_* | Instrumentos/resultados com origem e versão |

Comparar casos fictícios no motor antigo e novo: atendimento parcial/completo, ausência, visita, grupo, múltiplas tarefas, ajuda contraditória, SOAP e texto manual. Não fazer migração destrutiva de schema nem quebrar histórico.

### 4.5 Rascunhos, concorrência e registros finais

- Sem sessão selecionada: apenas prévia em memória, rótulo **Não salvo**.
- Com sessão e autorização válidas: reutilizar useEvolutionAutosave e backend versionado.
- Estados visíveis: carregando, alterações pendentes, salvando, salvo, erro, conflito, somente leitura.
- Em erro de rede: preservar texto na tela, sem declarar gravação concluída.
- Em conflito: jamais sobrescrever outro rascunho ou perder edição local sem confirmação.
- **Finalizar** exige os controles existentes de autoria, revisão e MFA aplicável. Não finaliza por copiar, por autosave nem por sair da aba.
- Nota finalizada é imutável; qualquer correção por adendo auditado. Um erro de resposta durante finalização exige conferir o histórico antes de repetir a operação.
- Sem dados clínicos em localStorage/sessionStorage, analytics, URLs ou logs.

## 5. Instrumentos existentes: preservar integralmente

**Não eliminar ou substituir o catálogo atual** do Equipe-027: M-CHAT-R/F, COPM, Katz, Lawton e Brody, PEDI-CAT, Perfil Sensorial 2 e MoCA. Manter registro de aplicação presencial/externa, versão, idioma, datas, escores e resultados por domínio, limitações e interpretação profissional.

O M-CHAT-R/F já possui testes específicos de limites, seguimento e situações em que interpretação automática é indisponível; migrar somente com regressão equivalente e revisão da versão oficial. Instrumentos licenciados não podem ter questionários, itens protegidos ou tabelas normativas reproduzidos sem autorização de uso.

## 6. Visão futura: adicionar mais instrumentos APÓS o núcleo concluído

**Esta fase começa somente depois de integrar, testar e validar as funcionalidades existentes.** Não é bloqueio para a primeira versão integrada.

Criar futuramente uma **Biblioteca de Instrumentos TO** pesquisável por idade, contexto, objetivo e domínio ocupacional (pediatria, saúde mental, reabilitação, envelhecimento e comunidade).

**Candidatos apenas para análise:** Índice de Barthel; WHODAS 2.0; Goal Attainment Scaling (GAS); Medida de Independência Funcional (MIF/FIM); outros a serem selecionados por profissionais. Licença, validade clínica, idioma e formação necessária devem ser conferidos antes de implementar.

Recursos futuros: ficha de aplicação por instrumento/versão, fonte e licença, escores apenas com algoritmo autorizado e testado, gráficos longitudinais acessíveis, comparação de resultados e relação explícita com objetivos e evoluções. **Sem diagnóstico automático.**

**Gate individual:** verificar autorização/licença → fonte oficial/versão → requisitos e escore → teste com casos-limite → revisão profissional → aprovação institucional. Quando não permitido reproduzir, oferecer somente registro descritivo de resultado externo.

## 7. Roadmap sem prazos fixos

| Etapa | Implementação | Critério de aceite |
| --- | --- | --- |
| **0 — Inventário** | Conferir main de ambos os projetos, testes, funções, permissões e dependências | Matriz de funcionalidades e riscos; baseline reproduzido |
| **1 — Fundação** | Branch isolada, integração React, lazy load, CSS isolado | Nenhuma regressão nas demais abas |
| **2 — Home original** | Página inicial do Projeto-TO dentro da aba, CTA único **Entrar** | Hero, ilustração e blocos preservados; nenhum login interno |
| **3 — Acesso seguro** | Fonte única de identidade, sessão, workspace, MFA e autorização no backend | Sem token cruzado indevido ou bypass; testes negativos |
| **4 — Prontuário** | Pacientes, anamneses, episódios, objetivos, sessões, histórico e anexos | RLS, auditoria, versões e comportamentos preservados |
| **5 — Evolução dinâmica** | Campos do E027 + prévia ao vivo + SOAP/corrido + edição protegida | Testes de fidelidade ao conteúdo e à edição manual |
| **6 — Persistência** | Autosave, concorrência, finalização, adendos e exportação | Sem perda de texto, escrita indevida ou mutação de nota final |
| **7 — Instrumentos atuais** | Migrar catálogo e resultados; testar M-CHAT | Repertório preservado e restrições de uso respeitadas |
| **8 — UX/qualidade** | Mobile, acessibilidade, contraste, impressão e documentação | E2E e testes de regressão aprovados |
| **9 — Homologação** | Validação de segurança, profissional e institucional | Aceites documentados; não liberar dados reais antes |
| **10 — Futuro** | Planejamento de novos instrumentos | Iniciar apenas após etapa 9, conforme autorizações |

A interface informativa pode ser construída antes da etapa 3, porém **nenhum acesso a prontuário persistente** pode ser habilitado sem completar o gate de identidade/permissão.

## 8. Testes obrigatórios

**Home/integração:** abrir Terapia Ocupacional exibe a HOME ORIGINAL (não login nem cadastro direto); CTA Entrar com texto exato; acesso permitido somente com autenticação, permissão e MFA necessários; navegação de volta funcional; zero iframe, duplo logout ou redirecionamento externo; demais abas intactas.

**Evolução:** digitar demanda/intervenção/conduta altera prévia ao vivo; mudar SOAP/corrido não perde texto; edição manual resiste a mudanças de campos; manter/aplicar sugestão funciona; múltiplas tarefas e instrumentos preservam contexto; ausência não gera intervenção; campos vazios não inventam achados; copiar corresponde ao texto visualizado; undo/redo funciona.

**Segurança e persistência:** dois usuários/workspaces fictícios isolados, RLS e sessão revogada testados; rascunho salvo/recuperado, erro de rede e conflito sem perda silenciosa; finalização protegida e nota final imutável; sem uso de dados reais em testes ou repositórios.

**UX:** teclado, foco, contraste WCAG AA, redução de movimento, larguras 320/360/390/768/1280 px, testes com navegadores/dispositivos reais quando disponíveis, impressão/PDF e desempenho.

## 9. Instruções para o agente executor

1. Ler este MD e os arquivos indicados nas versões mais recentes antes de modificar código.
2. Criar branch isolada e plano de rollback. **Não** alterar produção prematuramente.
3. Preservar a HOME ORIGINAL do Projeto-TO com o botão **Entrar**, retirando somente a autenticação visual duplicada.
4. Manter a sessão principal, RLS, autorização, MFA, versão e auditoria; nunca “resolver” acesso removendo segurança.
5. Priorizar o editor dinâmico do Equipe-027 **sem perder** a persistência e as notas finais do Projeto-TO.
6. Implementar por fatias com testes, commits e evidências; não descartar recursos atuais ao migrar.
7. Não copiar código do repositório privado para o público sem avaliação explícita de visibilidade/licenças/segredos. A integração pública exige decisão de governança.
8. Registrar por etapa: **não iniciada / implementada / testada / aprovada clinicamente / homologada**; esses estados não são equivalentes.
9. Reservar o desenvolvimento de **novos instrumentos** para depois da integração e validação do catálogo atual.

## 10. Prompt-mestre de implementação

> Analise danvdss/equipe-027 e danvdss/projeto-to e implemente a integração na **aba Terapia Ocupacional já existente**. Preserve a home ORIGINAL do Projeto-TO com título “O cuidado tem uma história. Seu registro também.”, hero, órbitas, princípios e estilo. Retire a página de login do Projeto-TO e troque seu CTA por um único botão **Entrar**, que abre o espaço interno sem segundo login **somente se a sessão, a permissão e o MFA necessários estiverem validados no servidor**. Não use iframe, não aceite JWT de backend diferente e não reduza RLS/segurança. Mantenha o dashboard geral do Equipe-027 e todas suas funções. Integre cadastros, anamneses, objetivos, sessões, evolução, históricos e anexos. Melhore a evolução com campos detalhados e dinâmicos, tarefas, assistência, instrumentos, SOAP/texto corrido, prévia em tempo real, edição manual protegida, autosave/conflitos, finalização segura e adendos. Preserve o catálogo de instrumentos existente. Após concluir integração e validação, abra uma fase futura para mais instrumentos sujeitos a licença e revisão técnica. Use somente dados fictícios, teste cada etapa em branch isolada e não declare homologação sem aceite formal.

## 11. Condição de conclusão

**Implementado** = home original e botão Entrar integrados, navegação e recursos disponíveis em versão de testes.  
**Validado tecnicamente** = identidade/autorização, RLS, editor, histórico, testes e regressões comprovados.  
**Homologado** = aprovação clínica, de privacidade/segurança e institucional documentada.

**Nenhuma das três condições é automaticamente comprovada pela existência deste arquivo.**
