# Inventário técnico — 26/11/2026
Evidência da Fase 0 do ROADMAP.md; não constitui planejamento concorrente.
Base b575558, árvore de trabalho com ajuste do catálogo. Tamanhos brutos locais (bytes), não transferidos. Classificação pela função do arquivo; nenhum item removido.
| Arquivo | Classe | Bytes |
|---|---|---:|
| .github/workflows/quality.yml | Automação / configuração | 1744 |
| .gitignore | Automação / configuração | 379 |
| .nojekyll | Automação / configuração | 0 |
| ACCESS.md | Documentação / evidência | 2193 |
| AUDITORIA-TEXTOS.md | Documentação / evidência | 6773 |
| CRESCIMENTO.md | Documentação / evidência | 5883 |
| ETAPA-01.md | Documentação / evidência | 2244 |
| ETAPA-02.md | Documentação / evidência | 1372 |
| ETAPA-03.md | Documentação / evidência | 3127 |
| ETAPA-04.md | Documentação / evidência | 1591 |
| ETAPA-05.md | Documentação / evidência | 1425 |
| ETAPA-06.md | Documentação / evidência | 933 |
| HOMOLOGACAO.md | Documentação / evidência | 9253 |
| README.md | Documentação / evidência | 22840 |
| REVISAO-2026-10.md | Documentação / evidência | 8641 |
| ROADMAP.md | Documentação / evidência | 24020 |
| app.js | Execução | 103728 |
| auth.js | Execução | 9430 |
| auth.test.cjs | Teste | 7366 |
| care.js | Execução | 11697 |
| check.cjs | Automação / configuração | 1333 |
| controlados-dados.json | Dados / fonte | 117950 |
| controlados.css | Execução | 10053 |
| controlados.html | Execução | 5870 |
| controlados.js | Execução | 13226 |
| controlados.test.cjs | Teste | 4037 |
| dashboard-cards.css | Execução | 10425 |
| dashboard-visual.test.cjs | Teste | 4744 |
| design.css | Execução | 18268 |
| diu.js | Execução | 25355 |
| docs/GUIA-STAGING-LOCAL-TO.md | Documentação / evidência | 3624 |
| docs/PLANO-INTEGRACAO-PROJETO-TO.md | Documentação / evidência | 21549 |
| docs/PUBLICACAO-GITHUB-PAGES.md | Documentação / evidência | 6414 |
| docs/RELATORIO-INTEGRACAO-TO-FASE-HOST.md | Documentação / evidência | 4900 |
| docs/REWORK-TO-SEM-PACIENTES.md | Documentação / evidência | 9514 |
| docs/VALIDACAO-TO-SEM-PRONTUARIO.md | Documentação / evidência | 16982 |
| enhancements.js | Execução | 21322 |
| enhancements.test.cjs | Teste | 10986 |
| growth-data.js | Execução | 32469 |
| growth-sources.json | Dados / fonte | 6430 |
| growth.js | Execução | 12452 |
| growth.test.cjs | Teste | 8860 |
| html2canvas.min.js | Execução / biblioteca vendorizada | 198708 |
| implante.js | Execução | 27599 |
| index.html | Execução | 2321 |
| lab-details.js | Execução | 6906 |
| measure.cjs | Automação / configuração | 4227 |
| notes.js | Execução | 15359 |
| occupational-portal.js | Execução | 4566 |
| occupational-portal.test.cjs | Teste | 7749 |
| occupational.test.cjs | Teste | 6180 |
| ot-embedded/bundle-manifest.json | Gerado / bundle verificado | 229 |
| ot-embedded/projeto-to-embedded.js | Gerado / bundle verificado | 923594 |
| package-lock.json | Automação / configuração | 23264 |
| package.json | Automação / configuração | 689 |
| pages-bundle.test.cjs | Teste | 3517 |
| prenatal.js | Execução | 30968 |
| prepare-private-to.cjs | Automação / configuração | 7583 |
| prepare-private-to.test.cjs | Teste | 2593 |
| quality.test.cjs | Teste | 52699 |
| readiness.test.cjs | Teste | 2773 |
| receituario.html | Execução | 269021 |
| release.cjs | Automação / configuração | 765 |
| renewal.js | Execução | 18251 |
| rx-workflow.css | Execução | 3200 |
| rx-workflow.js | Execução | 13803 |
| scripts/gerar_controlados.py | Automação / configuração | 3513 |
| shortcuts.js | Execução | 2319 |
| smoke-pages.cjs | Automação / configuração | 1129 |
| style.css | Execução | 53533 |
| supabase.min.js | Execução / biblioteca vendorizada | 217955 |
| tests/contraception-browser.cjs | Teste | 2336 |
| tests/lab-browser.cjs | Teste | 4549 |
| tests/mobile-browser.cjs | Teste | 5944 |
| tests/release-browser.cjs | Teste | 2783 |
| tests/session-browser.cjs | Teste | 3938 |
| tests/theme-browser.cjs | Teste | 7152 |
| theme.css | Execução | 1071 |
| verify-pages-to.cjs | Automação / configuração | 414 |
| workflow.js | Execução | 48117 |
| docs/tcr/INVENTARIO-TECNICO.md | Documentação / evidência | novo |
| docs/tcr/ESCOPO-E-REQUISITOS.md | Documentação / evidência | novo |
| tests/inventory-browser.cjs | Teste / instrumentação | novo |

## Grafo de alto nível
- index.html → style.css, design.css, dashboard-cards.css; scripts care, workflow, notes, prenatal, implante, diu, lab-details, shortcuts, renewal, supabase.min, auth, growth-data, growth, occupational-portal, app e enhancements (ordem do HTML).
- design.css e rx-workflow.css → theme.css; fontes externas Google, atalhos externos e fontes oficiais são dependências de rede, não requisitos para os testes isolados.
- app.js → rotas home, general, has, dm, both, prenatal, implante, diu, lab, rx, controlados, occupational, renewal, child, cervical, history; formulários e narrativas usam globals dos scripts anteriores.
- app.js → iframe receituario.html (rx-frame, mantido em memória); catálogo controlados.html (controlados-frame); ambos documentos independentes.
- controlados.html → controlados.css, controlados.js → fetch controlados-dados.json; scripts/gerar_controlados.py gera a base. Teste controlados.test.cjs verifica filtros e integridade.
- receituario.html → rx-workflow.js/css e html2canvas.min.js; fluxo de impressão e eventos de sessão.
- occupational-portal.js → ot-embedded/projeto-to-embedded.js e manifesto; preparação e verificação em prepare-private-to.cjs e verify-pages-to.cjs; origem privada não incluída neste inventário.
- npm scripts → check.cjs, testes *.test.cjs, release.cjs, smoke-pages.cjs; CI quality.yml executa check, test, verify:to e copia manifesto explícito de publicação.
- Eventos relevantes: input/change (formulários e filtros), click (navegação), pagehide/pageshow (limpeza), equipe027:new-encounter (reset), resize/visualViewport (layout), eventos de comunicação do receituário.
- Autenticação: auth.js e biblioteca Supabase; serviço remoto não foi consultado. Credenciais e dados reais excluídos.
- Limites: não é grafo exaustivo de chamadas, globals, CSS em execução ou eventos internos do bundle; requer instrumentação adicional. Não houve medição de transferência, memória ou dispositivos físicos. Links externos não foram acessados. Revisão de licenças e segurança continua pendente.

## Evidência dinâmica — Brave local, 26/11/2026
`tests/inventory-browser.cjs` aprovado em ambiente HTTP interceptado, com Playwright Core isolado e Brave. Login carregou os scripts e folhas de estilo listados; rotas clínicas internas não produziram novas requisições no percurso observado. TO requisitou o bundle; receituário requisitou HTML, CSS, JS, theme.css e html2canvas; controlados requisitou HTML, CSS, JS e JSON. Google Fonts foi bloqueado. A instrumentação registra caminhos locais e domínios externos, sem conteúdo clínico, parâmetros ou credenciais. Não representa cobertura exaustiva de interações ou rede de produção.

## Governança
Versão definida em package.json/Care e cache de HTML; validar check, test, verify:to e navegadores antes de marcar critérios. Commit reversível, sem reescrita de histórico. Riscos: perda de rascunho por navegação completa, divergência de cache, dependência de serviço remoto, uso assistencial sem homologação. Nenhuma exclusão proposta sem evidência.

## Complemento — 26/11/2026
- THIRD-PARTY-NOTICES.md: evidência de licenças de produção, incluída no CI.
- tests/performance-browser.cjs e BASELINE-DESEMPENHO.md: instrumentação e resultados sintéticos em dois viewports.
- scripts/audit-local.cjs: triagem heurística local sem imprimir valores; 84 arquivos textuais rastreados, zero correspondências nos padrões selecionados. Supabase UMD 2.117.1 equivale ao instalado após normalização de finais de linha e espaços externos; não é byte a byte idêntico.
- Sem verificação exaustiva do histórico Git, segredos arbitrários, configuração remota, fontes/instrumentos clínicos ou cadeia completa dos bundles. Não remover ativos por ausência de cobertura.
