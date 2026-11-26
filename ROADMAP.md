# EQUIPE-027 — Roadmap oficial único
**Versão:** 2.0 | **Data:** 23/11/2026 | **Base auditada:** main, b4f65eb, produto 2026.11.23
**Planejamento:** por dependências e critérios de aceite, sem prazos fixos.
**Estado:** desenvolvimento técnico; homologação assistencial e autorização de pesquisa não presumidas.

Este é o único documento normativo de planejamento. Consolida o ROADMAP-ATUALIZADO.md, PLANO-CONCLUSAO.md e o roadmap de adequação ao TCR v1.0 enviado em 23/11/2026. Relatórios de auditoria, homologação, fontes e histórico permanecem evidências, não roadmaps concorrentes. Não apagar dados históricos nem alterações locais de outras cópias.

## 1. Objetivos e limites
Desenvolver incrementalmente uma plataforma de apoio à elaboração de registros clínicos multiprofissionais na APS, com experiência visual profissional, narrativas coesas, manutenção simples e avaliação de usabilidade em tarefas simuladas como produto técnico-tecnológico de TCR. Preservar edição manual, rascunhos independentes, todos os módulos, autenticação, exportações e impressão. Não substituir prontuário, decisão clínica ou validação profissional. Pesquisa exclusivamente com casos fictícios; separar pesquisa e assistência. Nunca inferir diagnósticos, normalidade, consentimento, orientações, prescrições ou condutas não informadas.

## 2. Diagnóstico inicial e inventário
A inspeção da cópia principal identificou HTML estático com JavaScript modular, Supabase Auth, GitHub Pages e pipeline de checagem, testes e verificação do bundle privado de TO. O app.js concentra cerca de 102 KB; receituario.html 269 KB; style.css 54 KB; design.css 18 KB; dashboard-cards.css 10 KB. O índice carrega 16 scripts locais e três folhas de estilo; design.css e rx-workflow.css importam theme.css. Há uma fonte Google externa. O catálogo de controlados é carregado por página própria, com JSON, CSS, JS, teste e script gerador. Os arquivos vendorizados supabase.min.js e html2canvas.min.js são dependências de execução, não lixo. growth-sources.json é fonte rastreável de crescimento e requisito de teste. measure.cjs é ferramenta histórica de medição, não asset público.
- [x] Identificar cópia principal e verificar sincronização com origin/main; preservar outros worktrees/clones com alterações locais.
- [x] Inventariar arquivos versionados, entradas HTML, scripts de pacote e manifesto de publicação.
- [x] Identificar concorrência documental dos dois roadmaps antigos.
- [x] Conferir referências estáticas dos arquivos JS/CSS/HTML/JSON/CJS na raiz: todos os arquivos próprios consultados têm função identificada em execução, testes, documentação ou automação. Não houve remoção de código nesta passagem. Baseline: 34 arquivos próprios verificados; 137/137 testes aprovados em 23/11/2026, Node 24.22.3.
- [x] Gerar inventário estático e dinâmico de dependências do host: includes, imports, URLs, rotas, candidatos a globals, eventos, assets, scripts, CI, testes e interface do bundle TO. Evidências: INVENTARIO-TECNICO.md e GRAFO-DEPENDENCIAS.json.
- [ ] Complementar resolução lexical/dinâmica e composição fina dos bundles; não interpretar ausência de cobertura como código morto.
- [x] Classificar cada arquivo: 80 arquivos da base classificados, mais três novos artefatos; evidência em docs/tcr/INVENTARIO-TECNICO.md (26/11/2026). Nenhuma exclusão adicional justificada.
- [x] Medir baseline local sintético: tamanhos brutos/gzip estimados, tarefas longas, cobertura acumulada JS/CSS, renderizações, heap e navegação; BASELINE-DESEMPENHO.md.
- [ ] Completar transferência real, cobertura por rota/interação e custo de interação em aparelhos físicos; depende de ambiente e aparelhos disponíveis.
- [x] Executar npm audit --omit=dev: 0 vulnerabilidades conhecidas nas dependências de produção reportadas pelo registro npm nesta consulta; não inclui arquivos vendorizados, código próprio ou configuração remota.
- [x] Verificar manifesto do bundle TO: 923594 bytes de cliente, fonte af9088309a09.
- [x] Executar triagem local de segredos (árvore e histórico main), npm audit, avisos de produção e auditoria preliminar de fontes e instrumentos; AUDITORIA-COMPLEMENTAR.md.
- [ ] Confirmar direitos de distribuição dos instrumentos/ativos, licença própria, revogação histórica e configuração efetiva do Supabase com responsáveis autorizados; revisão profunda na Fase 3. Não declarar segurança ou licença integral.
- [x] Remover relatório local antigo test-results.txt (versão 2026.11.22, 134 testes) e ignorar sua regeneração; não era arquivo versionado nem asset.
- [x] Registrar remoções com razão, dependências consultadas, testes e referência de recuperação quando versionadas. Evidência: docs/tcr/AUDITORIA-COMPLEMENTAR.md; b575558 removeu os dois roadmaps concorrentes; test-results.txt era local e não recuperável pelo Git. Nenhuma nova remoção.
- [x] Consolidar os dois planejamentos anteriores neste arquivo e atualizar os links de README; remover os documentos concorrentes da árvore ativa, mantendo o histórico no Git.
- [x] Reconciliar a função documental de README e evidências históricas com o planejamento vigente; preservar ACCESS, HOMOLOGACAO, AUDITORIA-TEXTOS, fontes, relatórios e testes. Marcadores de historicidade e links para evidências atuais, 26/11/2026.
**Aceite:** inventário rastreável, baseline registrada, ausência de referências quebradas, testes aprovados, relatório de riscos e exclusões. Não remover bibliotecas, cenários ou fontes usadas.

## 3. Organização da execução
| Fase | Entrega | Dependência |
|---|---|---|
| 0 | Auditoria, limpeza, governança e escopo científico | nenhuma |
| 1 | Design system, navegação, acessibilidade e desempenho | 0 |
| 2 | Revisão integral de textos e fluxos clínicos | 0; em paralelo com 1 |
| 3 | Segurança, privacidade e regressão clínica | 0–2; controles transversais desde 0 |
| 4 | Ambiente de pesquisa isolado | 0–3 |
| 5 | Cenários fictícios, tarefas, instrumentos | 4 |
| 6 | Métricas, dados e relatórios | 5 |
| 7 | Validação técnica, piloto e coleta autorizada | 0–6 |
| 8 | Consolidação e defesa do TCR | 7 |

P0: segurança, privacidade, regressões, integridade textual e bloqueadores antes da coleta. P1: entrega científica e melhorias essenciais de experiência. P2: melhorias opcionais. Distribuir trabalho de forma equilibrada entre interface, arquitetura/dados, qualidade/segurança e método/validação conforme capacidade e dependências. Cada item tem responsável, evidência, teste, status e risco. Concluir uma fase por vez com testes integrados; manter testes rápidos em mudanças críticas. Nenhum item é concluído por mera geração de código.

## 4. Fase 0 — saneamento e diagnóstico científico
- [x] Estabelecer inventário de módulos/rotas e matriz requisito → tarefa → indicador → evidência em docs/tcr/ESCOPO-E-REQUISITOS.md; proposta preliminar, não aprovação acadêmica.
- [ ] Confirmar com orientação acadêmica modalidade do TCR, recorte APS multiprofissional ou especialidade, população, inclusão/exclusão, recrutamento e método de análise.
- [x] Selecionar três fluxos técnicos representativos preliminares: evolução geral, exames e catálogo com retorno ao rascunho. Confirmar a seleção com orientação; não limitar outros módulos.
- [x] Documentar política de versões, riscos, critérios de conclusão, arquitetura atual e dependências de alto nível no inventário técnico e neste roadmap.
- [x] Aplicar limpeza apenas a itens comprovados obsoletos: baseline anterior removeu test-results.txt; inventário atual não justifica outras exclusões. Histórico e outros clones preservados.
**Aceite:** baseline reproduzível, escopo coerente, matriz e inventário, nenhum arquivo necessário removido.

## 5. Fase 1 — revisão integral de design, fluidez e desempenho
Diagnóstico de código: paleta central em theme.css, múltiplas camadas sobrepostas, gradientes e animações em dois arquivos de cards, cor de foco hardcoded em design.css, tamanhos mínimos de cards de cerca de 200–260 px, login com animação contínua, fonte externa Onest coexistindo com declaração Inter, páginas de controlados e receituário com CSS específico. O render() de app.js também substitui app.innerHTML; medir custo, restauração de foco e eventos antes de modificar. São pontos de revisão, não falhas visuais comprovadas sem navegador.
- [x] Executar baseline em Brave/Chromium local com Playwright isolado (sem alterar dependências versionadas): mobile-browser.cjs interrompido por contexto de execução destruído durante navegação (linha 31); theme-browser.cjs falhou na expectativa de foco workspace-main (linha 75). Nenhum dos dois ensaios foi aprovado.
- [x] P0 (26/11/2026): removido redirecionamento anterior a collect(); catálogo integrado por iframe no workspace. Testes de navegador adaptados à consulta e ao modo rápido de TO. Validados retorno, rascunho manual, foco, catálogo isolado e login/logout com HTTP simulado; autenticação real e dispositivos físicos não avaliados.
- [x] Capturar baseline de login, dashboard, módulos, editor, controlados, TO e impressão com dados fictícios em desktop e mobile; mapear fluxo e fricção.
- [ ] Consolidar tokens semânticos de fundo, superfície, texto, destaque, estados, borda, foco, tipografia, espaçamento, raios e sombras; preservar impressão independente.
- [ ] Manter estética escura clínica com tons neutros azul-petróleo e verde discreto; gradientes moderados e cores específicas apenas quando distinguem módulo/estado. Unificar fonte com fallback local; evitar dependência de rede desnecessária.
- [ ] Remodelar dashboard bento responsivo, hierarquia de módulos, títulos e descrições concisas, atalhos úteis e busca/navegação previsíveis. Preservar todas as rotas e ícones reconhecíveis.
- [ ] Padronizar login, navegação, cabeçalhos, formulários, botões, cards, tabelas, modais, toasts, estados vazios, carregamento, erro, sucesso e offline; evitar modais e cliques redundantes.
- [ ] Usar progressão de campos condicionais, seções recolhíveis sem apagar dados, painel de exames inicialmente minimizado e opção com resultado inicialmente selecionada quando aplicável; manter motivo, modalidade, conduta e avaliação médica explícitos.
- [ ] Aprimorar editor: prévia narrativa legível, ações copiar/revisar/limpar claramente distintas, comparação antes de substituir texto manual, foco estável, proteção de rascunhos.
- [ ] Integrar visualmente o catálogo controlados (pesquisa por substância, indicação da lista e receita com cor e texto, fonte e versão normativa verificáveis, sem presumir que toda apresentação tem a mesma regra); harmonizar TO e receituário sem quebrar bundle/ impressão.
- [ ] Reduzir CSS duplicado após auditoria de cascata; carregar módulos sob demanda quando comprovado seguro, otimizar scripts próprios e efeitos custosos; evitar refatoração massiva ou alteração do bundle privado sem processo de origem.
- [ ] Usar transições discretas de 120–200 ms quando apropriado; preferir transform/opacity; remover animações decorativas contínuas se prejudicarem desempenho; respeitar prefers-reduced-motion.
- [ ] Testar viewport 320/360/390/768/1024/1440 px, teclado virtual, zoom até 200%, rotação, navegação por teclado, leitores de tela, contraste, foco, alvos de toque e mensagens não dependentes só de cor. Adotar WCAG 2.2 AA como meta de engenharia, sem alegar conformidade sem auditoria.
- [ ] Medir antes/depois com condições comparáveis: LCP, INP, CLS, tamanho transferido, tarefas longas e navegação/edição; metas orientativas LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1, a confirmar em campo; não inventar resultados.
**Aceite:** fluxos principais sem regressão, visual consistente, sem cortes/rolagem horizontal indevida, sem perda de foco, evidências antes/depois e desempenho medido. Testar em Android/Chrome, iPhone/Safari e desktop reais quando disponíveis.

## 6. Fase 2 — auditoria textual, coerência e fidelidade clínica
Escopo: 100% dos textos visíveis e gerados: login, navegação, descrições, títulos, labels, placeholders, alertas, ajuda, validações, mensagens de rede, exportações, impressão, relatório e todos os modelos clínicos. Inventariar origem (arquivo/função), variante, condições, saída esperada, revisão técnica, revisão profissional e teste. Usar AUDITORIA-TEXTOS.md como evidência anterior, não como aprovação atual.
- [ ] Catalogar textos por módulo e remover inconsistências terminológicas, ortografia, acentuação, concordância, pontuação, abreviações, redundâncias e rótulos técnicos indevidos.
- [ ] Criar guia de redação pt-BR: linguagem objetiva, respeitosa, impessoal quando cabível e profissionalmente neutra; distinguir relato, observação, avaliação, intervenção, resposta e plano; respeitar sequência temporal e modalidade/local explicitamente selecionados.
- [ ] Revisar composição narrativa por regras de módulo, com conectivos naturais, parágrafos contínuos e transição harmônica. Evitar lista mecânica de campos ou frases truncadas. Preservar medidas, datas, unidades, fontes, nomes de medicamentos e texto livre sem mudança semântica.
- [ ] Revisar geral, HAS, DM, HAS+DM, exames (solicitação/avaliação), renovação, receituário, pré-natal, puericultura, citopatológico/DNA-HPV, DIU, Implanon, TO ambulatorial e hospitalar (UTI, Eixo Crítico, Pediatria, Clínica Médica/Cirúrgica, Katz/MIF e sinais vitais antes/depois quando registrados), controlados e qualquer módulo novo identificado.
- [ ] Verificar combinações de campos vazios, completos, incompatíveis, negativos/positivos, opcionais, repetidos, números zero, datas inválidas e procedimentos interrompidos. Exibir divergências para revisão sem apagar conteúdo ou preencher informação inventada.
- [ ] Assegurar que solicitação não seja descrita como avaliação/realização, relato não seja convertido em achado confirmado e pedido de renovação não implique prescrição; condutas, consentimento, exame normal, orientação e avaliação médica só se informados.
- [ ] Preservar edição manual, cópia exata, histórico temporário, rascunhos separados e confirmação antes de sobrescrever.
- [ ] Criar corpus de cenários fictícios e golden tests de saída por módulo, com asserções de ausência de inferências, dados omitidos, duplicações e contradições. Testar casos-limite, alterações de modo e retorno ao rascunho.
- [ ] Revisar terminologia clínica e protocolos locais com profissionais habilitados; registrar fonte, versão, data, responsável, ressalvas e decisão. Não usar serviço externo para enviar texto clínico; não automatizar interpretação clínica.
**Exemplo fictício:** “Paciente comparece à unidade para solicitar exames de rotina. Registra-se a solicitação dos exames informados. Foi orientado retorno à unidade para continuidade do cuidado.” Somente afirmar comparecimento, solicitação efetiva e orientação se explicitamente registrados. Se apenas pediu exames, escrever “solicita”; não presumir atendimento médico.
**Aceite:** catálogo completo, casos fictícios aprovados tecnicamente, sem fatos inferidos ou perda de dados, leitura fluida e revisão profissional documentada antes de uso assistencial.

## 7. Fase 3 — segurança, privacidade e qualidade clínica
- [ ] Auditar Supabase real: autorização, Edge Function username-login, acesso individual, política de senhas, rotação se necessária, abuso, recuperação, expiração/revogação, logout, perda de rede e sessões. Não expor credenciais.
- [ ] Verificar memória/armazenamento, clipboard, impressão, logs, exportações, equipamentos compartilhados, retenção, eliminação, incidente e responsabilidades de privacidade. Revisar LGPD institucionalmente.
- [ ] Validar faixas laboratoriais ilustrativas, unidades, métodos, idade, jejum, gestação e fonte do laudo; sem diagnóstico automático. Revisar todos os modelos e instrumentos, condições de uso e impressão física.
- [ ] Executar npm run check, npm test, npm run verify:to, testes de navegador e smoke de publicação aplicáveis; ampliar CI e regressões para novas funcionalidades.
- [ ] Verificar disponibilidade/versão do catálogo controlados com fonte oficial e condições de receituário; não inferir exceções normativas. Atualizações versionadas e testadas.
- [ ] Registrar riscos, gravidade, reprodução, correção, evidência e reteste; teste positivo e negativo de permissões; documentar bloqueadores de homologação.
**Aceite:** nenhuma falha bloqueadora conhecida nos percursos selecionados; segurança e privacidade revisadas por responsáveis; publicação versionada e reversível. Homologação assistencial depende de termo institucional separado.

## 8. Fase 4 — ambiente de pesquisa / simulação
- [ ] Criar entrada e banner persistente “SIMULAÇÃO — DADOS FICTÍCIOS — NÃO UTILIZAR EM ATENDIMENTO REAL”.
- [ ] Segregar rotas, configuração, estado, rascunhos, exportações e dados; limpar entre cenários e participantes, na saída e em falhas de conexão; testar isolamento.
- [ ] Marcar/desabilitar impressão e exportação de simulação conforme protocolo; não exigir dados/credenciais de pacientes.
- [ ] Começar com dados fictícios em memória; armazenamento persistente somente se protocolo e segurança autorizarem. Não duplicar autenticação/modelos; autorização efetiva no servidor se houver backend.
**Aceite:** isolamento verificado, zero mistura de resultados, clínica preservada, fluxo de dados documentado.

## 9. Fase 5 — cenários, tarefas e instrumentos
- [ ] Criar banco fictício versionado: ID, versão, módulo, objetivo, dados, instrução uniforme, critério de sucesso. Incluir interrupção/retorno se pertinente.
- [ ] Elaborar checklist de observador, erros críticos/omissões/preferências, ajuda e gabarito de fidelidade documental revisado por profissionais.
- [ ] Fluxo participante: instruções → tarefas → questionário → encerramento → limpeza. Código pseudônimo; não solicitar nome, CPF, CNS, prontuário ou e-mail sem justificativa aprovada.
- [ ] Selecionar SUS validada em português e condições de uso adequadas, se confirmada; registrar fonte, licença, versão e regras; itens incompletos sem imputação.
- [ ] Questionário complementar próprio claramente identificado, feedback opcional sem dados pessoais, mensagens neutras; consentimento conforme protocolo, não substituído por termos de uso.
**Aceite:** aplicação reproduzível por dois avaliadores, regras de sucesso/erro anteriores à coleta, instrumentos e casos validados metodologicamente.

## 10. Fase 6 — indicadores e relatórios
- [ ] Definir previamente taxa de conclusão (concluídas/iniciadas ×100), tempo (fim−início com pausa definida), erros por categoria, ajuda, SUS conforme versão autorizada e distribuição de percepção.
- [ ] Cronômetro com início/pausa/fim; não capturar digitação ou clipboard. Versionar sistema, cenários, instrumentos e regras.
- [ ] Modelo mínimo: research_session (ID, versão, cenário, horários necessários), task_result (tempos, conclusão, ajuda, erros), usability_response (versão, respostas, escore válido), feedback opcional e study_release imutável.
- [ ] Separar dados brutos e agregados; painel descritivo com n e faltantes; exportar CSV/JSON adequado ao destinatário, pseudonimizado/anonimizado conforme protocolo; revisar texto livre antes de exportação pública.
- [ ] Definir acesso, retenção, backup, eliminação e autorização no servidor se persistir; testar permissões e cálculo com dataset fictício e conferência independente.
**Aceite:** resultados reproduzíveis, nenhuma coleta desnecessária, dados faltantes e exclusões transparentes.

## 11. Enquadramento científico e fases 7–8
Título de trabalho: Desenvolvimento e avaliação de uma plataforma digital de apoio aos registros clínicos e à organização do processo de trabalho na Atenção Primária à Saúde.
Pergunta: como profissionais avaliam usabilidade e adequação funcional do Equipe-027 em tarefas simuladas de registro clínico na APS?
Objetivo: desenvolver, aprimorar e avaliar usabilidade e adequação funcional em cenários simulados; levantar necessidades, descrever arquitetura e salvaguardas, construir cenários, medir conclusão/tempo/erros, investigar percepção e documentar limitações.
Delineamento preliminar: pesquisa metodológica de desenvolvimento tecnológico, potencialmente métodos mistos; confirmar com orientador. Sem comparação controlada, não alegar superioridade ao fluxo usual; se comparativo, definir equivalência, treinamento, ordem, amostragem e análise.
### Fase 7 — validação e estudo
- [ ] Confirmar autorizações éticas/institucionais pertinentes antes de recrutamento e coleta, treinamento, versões e instrumentos.
- [ ] Executar piloto autorizado, documentar dificuldades e ajustes; congelar versão, cenários, instrumentos, dicionário, plano de análise e exclusões antes da coleta principal.
- [ ] Aplicar roteiro uniforme; verificar perdas, duplicidades e inconsistências sem alterar respostas; analisar dados reais conforme protocolo; registrar limitações, amostragem, treinamento e efeito de aprendizagem.
**Aceite:** rastreabilidade entre cada resultado, cenário e versão, sem conclusão causal indevida.
### Fase 8 — entrega acadêmica
- [ ] Manual de uso/avaliador, arquitetura, fluxo de dados, histórico e capturas fictícias.
- [ ] Métodos, resultados reais, discussão, limitações, relatório técnico, versão demonstrável, material de defesa; citações conforme ABNT NBR 10520 e demais normas aplicáveis.
- [ ] Entregar pacote congelado e evidências verificáveis; distinguir implementado, validado, proposto e não avaliado.
**Aceite:** objetivos, métodos, dados e conclusões coerentes; percurso reproduzível; nenhuma liberação assistencial implícita.

## 12. Requisitos do módulo de pesquisa
| ID | Requisito | Evidência |
|---|---|---|
| TCR-RF-01 | Identificação persistente da simulação | navegação |
| TCR-RF-02 | Cenários fictícios versionados | reprodução |
| TCR-RF-03 | Reinício limpo | isolamento |
| TCR-RF-04 | Checklist de observação | ficha |
| TCR-RF-05 | Instrumento de usabilidade | respostas válidas/incompletas |
| TCR-RF-06 | Código pseudônimo e versão | registro |
| TCR-RF-07 | Tempo e conclusão | casos de controle |
| TCR-RF-08 | Indicadores | cálculo independente |
| TCR-RF-09 | Exportação | revisão de campos |
| TCR-RF-10 | Painel agregado | totais conferidos |
| TCR-RF-11 | Perfis se exigidos | autorização servidor |
| TCR-RF-12 | Relatório de versão/incidentes | release |
Requisitos transversais: privacidade, segurança, usabilidade, acessibilidade, confiabilidade, manutenibilidade. Documentos de evidência em docs/tcr: escopo, protocolo, cenários, instrumentos/licenças, dicionário, gestão de dados, matriz de validação, histórico e resultados. Não criar roadmaps adicionais.

## 13. Portões de decisão
- [ ] A: escopo metodológico aprovado (objetivos, módulos, métricas, protocolo).
- [ ] B: ambiente isolado seguro para piloto, cenários fictícios e regressões aprovadas.
- [ ] C: autorizações éticas e institucionais pertinentes, instrumentos e consentimento adequados.
- [ ] D: após piloto autorizado, ajustes registrados, versão congelada e plano de análise definido; coleta principal autorizada.
- [ ] E: dados e resultados rastreáveis, relatório e versão demonstrável arquivados.

## 14. Riscos e definição de pronto
Escopo excessivo → 2–4 fluxos; mudanças durante coleta → congelamento; uso de dados reais → isolamento; coleta sem autorização → gates; acesso indevido → auditoria e testes negativos; instrumento inadequado → validação; causalidade indevida → desenho adequado; regressão → testes; exposição em exportação → minimização; remoção equivocada → inventário e Git; alteração semântica → golden tests e revisão profissional.
Entrega concluída somente com requisito implementado, teste automatizado e manual aplicável, ausência de regressão conhecida, documentação, evidência, riscos residuais e distinção entre conclusão técnica, validação profissional, aptidão para pesquisa e homologação assistencial. Não declarar aprovação ética ou institucional por automação.

## 15. Decisões e próximo ciclo

### Evidências de execução — 26/11/2026
- Base sincronizada b575558; alterações restritas a catálogo, testes e documentação. Rascunhos continuam em memória; sem dados reais.
- Node 24.22.3: npm run check, 137/137 testes de npm test, npm run verify:to aprovados (bundle 923594 bytes).
- Brave + Playwright Core isolado: mobile-browser aprovado em oito viewports, 16 rotas, sem ocorrências de overflow no teste; formulário e texto manual preservados após catálogo. theme-browser aprovado em 1440 e 390 px (90 seções por largura; menores razões de contraste medidas 4,54 e 5,55; não constitui auditoria WCAG completa). session-browser aprovado em logout simulado HTTP 204 e 503; retorno preserva texto, limpeza verificada. inventory-browser aprovado com requisições de rotas e assets registrados em docs/tcr/INVENTARIO-TECNICO.md.
- Fase 0: matriz, inventário e proposta de fluxos entregues. Fechamento integral ainda condicionado a escopo acadêmico aprovado, cobertura fina de dependências, baseline de desempenho/dispositivos reais e revisão de segredos/licenças/documentação histórica (seção 2). Não presumir homologação. Próxima tarefa técnica: concluir essas verificações; não avançar gate acadêmico sem autorização.

Em aberto: programa e normas do TCR, recorte, módulos avaliados, instrumentos/licenças, amostragem, persistência, autorizações e condições de assistência. Primeiro completar Fase 0 e baseline; executar Fases 1 e 2 em frentes equilibradas e controles da Fase 3 desde o início. Só então desenvolver pesquisa isolada e avançar aos gates. Manter este arquivo atualizado após cada fase; não criar um novo planejamento concorrente.

### Evidências complementares — 26/11/2026
- npm audit --omit=dev: zero vulnerabilidades reportadas, 10 dependências de produção segundo metadados do npm.
- Baseline DOM simulado (mediana/p95 ms): geral 11.63/15.18; renovação 13.27/17.08; pré-natal 23.92/31.74; puericultura 37.65/44.25; TO 19.41/25.67. Script measure.cjs apresentou erro assíncrono após imprimir métricas; resultados preliminares, não aceite.
- Licenças: avisos originais de dependências de produção instaladas e versões conferidas com lockfiles de Equipe-027 e Projeto-TO (origem af9088309a09) reunidos em THIRD-PARTY-NOTICES.md e incluídos no manifesto de publicação CI. html2canvas mantém aviso MIT no arquivo. Inventário conservador, não SBOM exaustiva.
- Pendentes: licença do código próprio por decisão do titular, verificação de ativos/fontes e instrumentos, composição exata dos bundles, segredos e configuração remota; baseline em dispositivos reais e correção do script de medição. Fase 0 permanece aberta.

### Complemento técnico — 26/11/2026
- Corrigido measure.cjs; saída 0, mediana/p95 (ms): geral 11.07/14.91, renovação 13.75/16.71, pré-natal 21.87/28.04, puericultura 37.81/44.53, TO 19.94/24.10.
- Baseline de navegador: tests/performance-browser.cjs aprovado em 1440×900 e 390×844, 16 rotas por viewport, zero erros de página. Evidência em docs/tcr/BASELINE-DESEMPENHO.md; medidas sintéticas, gzip estimado, cobertura acumulada e heap CDP, não dados de campo.
- Triagem heurística de 84 arquivos textuais rastreados sem correspondências nos padrões selecionados; UMD Supabase igual após normalização de finais de linha e espaços externos. Não prova ausência de segredos nem substitui auditoria remota.
- README, relatórios históricos e guia de publicação reconciliados quanto à governança e avisos de terceiros. Nenhum arquivo removido.
- Permanecem abertos grafo exaustivo, cobertura por rota/interação, desempenho físico e rede real, licenças de fontes/instrumentos, histórico de segredos e configuração remota autorizada; escopo acadêmico e licença própria dependem dos responsáveis.

- Regressão integrada: npm run check, npm run verify:to e npm test concluídos com saída 0; 137/137 testes aprovados.

### Fechamento da auditoria local — 26/11/2026
- Grafo: 52 arquivos, 33 referências locais, 121 candidatos globais, eventos em 22 entradas, zero destinos locais ausentes no levantamento. Histórico main: 87 commits e 477 blobs examinados, zero correspondências nos padrões selecionados.
- Fontes Onest/Inter OFL 1.1; MIF e demais instrumentos inventariados, direitos não presumidos. Registro de remoções e limites em docs/tcr/AUDITORIA-COMPLEMENTAR.md.
- Auditoria local documentada e reproduzível, sem alterações clínicas. Gate integral da Fase 0 permanece condicionado aos itens abertos das seções 2 e 4. Preparação de Fase 1 somente com autorização explícita para paralelizar pendências externas; não implica homologação.

### Consolidação de estabilidade — 26/11/2026, 11h36 BRT
- Base local/remota conferida: 4cbf28d904e09e12b33bd0b6979f1df0bc513e1c, árvore limpa antes da consolidação.
- GitHub Actions: cinco execuções mais recentes da main concluídas com sucesso (b575558, 41f3651, cbd83f7, ff7573c, 4cbf28d). Na execução https://github.com/danvdss/equipe-027/actions/runs/45831659892 os jobs quality e deploy foram aprovados; conclusão às 10h42 BRT.
- Pages: THIRD-PARTY-NOTICES.md retornou HTTP 200 com cabeçalho esperado; bundle TO público de 923594 bytes coincide por SHA-256 com o arquivo local. Verificação de disponibilidade e integridade, não homologação assistencial.
- Revalidados npm run check (34 arquivos próprios) e npm run verify:to (origem af9088309a09), saída 0. Regressão local anterior 137/137 permanece como evidência da base testada.
- Processos: três Node iniciados às 06h56 aparentam integrar os serviços de conexão remota; nenhuma execução de teste/auditoria do projeto ou Git/npm ativa na amostragem. Nenhum processo interrompido. Não inferir ausência de trabalho não salvo em outros aplicativos.
- Não houve alteração funcional nesta consolidação. As pendências residuais das seções 2 e 4 permanecem abertas; não iniciar remodelação até decisão explícita sobre paralelização. Não confundir publicação técnica com aprovação institucional ou acadêmica.

### Fase 1 — início autorizado, 26/11/2026
- Autorizado o início da remodelação visual pelo titular, sem presumir encerramento integral da Fase 0. Pendências externas continuam abertas nas seções 2 e 4; não autoriza pesquisa nem uso assistencial.
- Primeira entrega incremental: theme.css ganhou tokens de tipografia nativa, raios, espaçamento, sombra e transição de 160 ms; design.css harmoniza login, cabeçalhos, navegação e superfícies; dashboard-cards.css compacta bento com acentos por módulo e remove animações decorativas contínuas. index.html deixa de solicitar Google Fonts no host e atualiza cache CSS. Os 14 cartões, rotas, ícones e fluxos clínicos foram preservados. Catálogo ainda solicita fonte externa; integração visual de catálogo/receituário/TO e deduplicação completa permanecem pendentes.
- Validação local: npm run check, npm test (137/137), npm run verify:to, inventory-browser e mobile-browser (8 viewports, 16 rotas cada, zero ocorrências) aprovados. theme-browser: 1440 e 390 px, 90 seções por largura, zero falhas, menor contraste amostrado 6,63 em ambas. Não constitui auditoria WCAG integral. Inventário confirma ausência de requisição externa no login do host; fonte do catálogo permanece.
- Próximo incremento: capturar evidência visual comparativa, completar padronização de componentes e harmonizar catálogo/receituário preservando impressão; medir desempenho antes/depois sob condições comparáveis. Nenhuma alegação de ganho de desempenho sem medição.

### Fase 1 — segundo incremento, 26/11/2026
- Padronizados campos, seções, ações do editor, estados selecionados, controles do receituário, catálogo e contêiner/navegação TO com tokens existentes. Estilos novos limitados à tela; sem alteração da lógica clínica, textos normativos ou bundle privado. Catálogo passa a utilizar theme.css e fonte nativa; cores e texto das categorias preservados.
- Inventário de rede: 16 rotas locais, nenhuma solicitação externa observada no login ou catálogo. Publicação anterior 42a6464 confirmada no Actions https://github.com/danvdss/equipe-027/actions/runs/45841339201.
- Validação: npm run check, npm test 137/137, verify:to, mobile-browser (8 viewports x 16 rotas), theme-browser (1440 e 390 px, 90 seções por largura, contraste mínimo amostrado 6,63, zero falhas), release-browser (busca, desfazer/refazer, modelos, TXT e PDF multipágina) e phase1-components-browser (1440, 390 e 320 px: alinhamento das camadas do editor, rascunho preservado, busca/limpeza do catálogo e visibilidade em impressão de receituário) aprovados. Primeira regressão falhou somente na asserção literal de import CSS sem versão; corrigida para aceitar query de cache e incluir catálogo, suíte integral repetida com sucesso.
- Pendentes: evidência visual comparativa, auditoria fina de cascata e redução de duplicação, estados restantes, integração visual interna do bundle privado via origem, métricas comparáveis e acessibilidade em aparelhos reais. Não declarar conformidade WCAG ou conclusão integral da Fase 1.

### Fase 1 — evidência comparativa e acesso à busca, 26/11/2026

- Capturas no ZORD com Brave headless, movimento reduzido, sessão simulada, dados fictícios e serviços externos bloqueados. Comparação entre o fim da Fase 0 (`b5ea1ad`) e o segundo incremento (`258c557`) acrescido da mudança de posição da busca. O roteiro `tests/phase1-capture.cjs` gera seis imagens e um PDF A4 por largura e revisão. Os arquivos usam os prefixos `1440-` (1440 × 900) e `390-` (390 × 844).
- Fluxo observado no painel a 390 px: após o título, quatro links externos precediam a busca. Agora o botão aparece logo após o título. A ordem do DOM acompanha a visual. Enter abre a busca e foca o campo, Escape devolve o foco ao botão e Tab segue para o primeiro atalho. Regressão de componentes aprovada a 320, 390 e 1440 px.
- Evidências de login, painel, consulta geral, editor, catálogo filtrado, TO e impressão: [antes](docs/tcr/fase-1/antes) e [depois](docs/tcr/fase-1/depois). Painel móvel [anterior](docs/tcr/fase-1/antes/390-painel.jpg) e [atual](docs/tcr/fase-1/depois/390-painel.jpg). Impressão conferida no modo print do Chromium com exportação PDF; impressora física pendente.
- Desempenho: uma passagem de `tests/performance-browser.cjs` por revisão e largura, na mesma máquina, com 16 rotas e zero erros de página por passagem. Os recursos locais do login passaram de 674.111 para 680.054 bytes brutos (+5.943) e de 195.001 para 196.076 bytes em gzip estimado (+1.075). A abertura do catálogo passou de 531 para 244 ms no desktop e de 282 para 266 ms na largura móvel. Na consulta geral móvel, passou de 76 para 113 ms. A variação entre rotas e a amostra única impedem concluir ganho global. [Medições anteriores](docs/tcr/fase-1/antes/desempenho.jsonl) e [atuais](docs/tcr/fase-1/depois/desempenho.jsonl).
- Próxima frente: revisar regras sobrepostas do painel e estados de interface, usando estas capturas como referência. Continuam pendentes a integração visual interna do TO pela origem, medições repetidas e verificação em aparelhos reais.
