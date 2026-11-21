# Equipe-027 — Roadmap revisado de conclusão

**Revisão:** 21/11/2026
**Versão examinada:** 2026.11.22 (branch main, commit b572d91)
**Formato:** 12 entregas, distribuídas em 6 fases, sem prazos artificiais.
**Princípio:** preservar funcionalidades e rascunhos; avançar apenas com evidência e testes.

> Esta revisão consolida e reorganiza o roadmap de 12 entregas em face do código e dos documentos presentes em 21/11/2026. Não representa liberação para uso assistencial.

## Resumo executivo

- **6 entregas com implementação técnica concluída**, **3 parcialmente concluídas** e **3 pendentes** segundo os critérios abaixo. Estes números representam entregas, não percentual de esforço ou conformidade.
- **133 de 133 testes automatizados aprovados** na revisão local de 21/11/2026, executada sobre uma cópia isolada de main. Testes de DOM não equivalem a navegação real, auditoria de servidor ou validação clínica.
- **13 cards/módulos** da tela inicial com identidade visual e rotas preservadas.
- Publicação GitHub Pages confirmada na execução de Actions [44942923366](https://github.com/danvdss/equipe-027/actions/runs/44942923366). A publicação de arquivos não comprova que todos os fluxos autenticados foram testados em aparelhos reais.
- **Principal bloqueador:** homologação institucional, precedida de auditoria efetiva de autenticação/LGPD, testes reais e revisão clínica de cada módulo.

**Legenda:** CONCLUÍDA = evidência técnica da entrega; PARCIAL = há implementação, mas o aceite específico ainda depende de testes ou revisão; PENDENTE = não há evidência de aceite suficiente.

## Fase 1 — Fundação visual e experiência móvel

### 01. Identidade visual dos módulos — CONCLUÍDA (técnica)
**Evidência:** 13 cards com ícones individualizados, gradientes, entrada animada, brilho e hover; testes em dashboard-visual.test.cjs; créditos discretos no rodapé.
**Aceite:** nenhuma rota alterada; cards acessíveis por teclado; preferência por movimento reduzido respeitada.
**Manutenção:** verificar visualmente qualquer mudança de tema ou cards antes de publicar.

### 02. Responsividade e acessibilidade operacional — PARCIAL
**Entregue:** CSS móvel, focos por teclado, alvos de toque e verificações estáticas/DOM de contraste e movimento reduzido.
**Falta:** ensaios reais Android/Chrome e iPhone/Safari; navegação com teclado físico, leitores de tela, zoom, rotação e teclado virtual; corrigir problemas reproduzidos.
**Aceite:** percurso completo sem corte de controles, perda de foco, bloqueio de formulário ou armadilhas de teclado, com registros de evidências.

## Fase 2 — Segurança e integridade

### 03. Autenticação, sessão e proteção de acesso — PARCIAL
**Entregue:** Supabase Auth, entrada via username-login, validação remota do usuário, sessão efêmera, limpeza de rascunhos e testes automatizados.
**Falta:** auditar configuração real do Supabase, contas autorizadas, senhas e credenciais que precisem de rotação, proteção contra abuso, função Edge, expiração/revogação, recuperação, perda de rede e logout em dispositivos publicados.
**Aceite:** administrador registra testes positivos e negativos, permissões, resposta a falhas e confirmação de bloqueio de acesso não autorizado.

### 04. Privacidade, LGPD e governança — PENDENTE de aceite
**Entregue:** o aplicativo informa que os registros clínicos permanecem em memória; modelos não usam armazenamento remoto de pacientes.
**Falta:** revisão de logs, permissões, fluxo de exportação, área de transferência, impressão, equipamentos compartilhados, incidente e retenção; responsável por privacidade designado; política de usuários individuais ou justificativa documentada para acesso compartilhado.
**Aceite:** parecer institucional registrado; ausência de dados reais em GitHub, testes e logs; controles e responsabilidades formalizados.

## Fase 3 — Exames e geração documental

### 05. Exames: solicitação e avaliação — CONCLUÍDA (técnica)
**Entregue:** caminhos separados para solicitação e avaliação, motivo, exames, resultados, solicitação de avaliação médica e condutas; faixas laboratoriais ilustrativas editáveis, filtros e alertas de inconsistência.
**Aceite técnico:** texto gerado apenas a partir das escolhas informadas; manutenção dos rascunhos; testes automatizados dos dois percursos.
**Próximo aceite clínico:** revisar unidades, faixas, métodos, jejum, idade, gestação e contextualização com profissionais, sem interpretação diagnóstica automática.

### 06. Evoluções, editor único e histórico temporário — CONCLUÍDA (técnica)
**Entregue:** editor manual/automático, prévia, histórico da sessão, cópia, revisão de inconsistências e preservação de edição manual.
**Próximo aceite:** testar o fluxo ponta a ponta com dados fictícios no navegador autenticado e aprovar as frases-padrão, orientações e condutas de cada serviço.

## Fase 4 — Módulos clínicos e Terapia Ocupacional

### 07. Módulos assistenciais complementares — PARCIAL
**Entregue:** HAS, DM, HAS+DM, pré-natal, puericultura, citopatológico/DNA-HPV, Implanon, DIU, renovação e receituário, com verificações de regressão.
**Falta:** revisão clínica individual de textos e campos, protocolos locais, casos-limite e impressões; validar especialmente o receituário em papel e condições reais de impressão.
**Aceite:** termo de revisão por módulo, com nome do profissional, versão, data e ajustes registrados.

### 08. Integração da Terapia Ocupacional — CONCLUÍDA (técnica)
**Entregue:** entrada integrada ao Projeto-TO, preservação da evolução rápida anterior, montagem/desmontagem e avisos de conteúdo não salvo; pacote de navegador verificado por manifesto/hash. Em 21/11/2026 foram acrescentados o contexto hospitalar (UTI, Eixo Crítico, Pediatria, Clínica Médica e Cirúrgica), o registro de Katz/MIF por setor e os sinais vitais antes e depois da intervenção. A redação hospitalar foi revisada para gerar parágrafos clínicos contínuos, seguindo os modelos de UTI e Eixo Crítico e a sequência das intervenções. Campos e instrumentos permanecem opcionais e sem interpretação automática.
**Falta para homologação:** validar identidade/fluxos clínicos com profissionais, garantir atualização segura do pacote privado e verificar condições de uso dos instrumentos de avaliação.
**Aceite:** teste real do fluxo integral sem perda de dados, dupla autenticação indesejada ou carregamento incorreto.

## Fase 5 — Qualidade, testes e desempenho

### 09. Regressão automatizada e integração contínua — CONCLUÍDA (técnica)
**Entregue:** comando de checagem, 133 testes automatizados aprovados em 21/11 e workflow que verifica antes de publicar.
**Aceite:** preservar os testes atuais e criar testes de regressão para toda nova mudança.

### 10. Ensaios reais e acessibilidade completa — PENDENTE
**Falta:** testes funcionais autenticados de ponta a ponta, dispositivos físicos, teclado/zoom/leitor de tela, conexão ruim, uso prolongado, exportação, impressão, desempenho e recuperação de falhas.
**Aceite:** matriz de plataformas, evidência de execução, lista de defeitos corrigidos, retestes e ausência de falhas impeditivas.

## Fase 6 — Publicação e homologação

### 11. Entrega técnica no GitHub Pages — CONCLUÍDA (técnica)
**Entregue:** fluxo GitHub Actions para build, checagens e publicação; site responde HTTP 200; versão 2026.11.22 confirmada.
**Manutenção:** executar conferência de arquivos publicados e preservar reversão/identificação de release.

### 12. Aceite clínico, segurança e liberação institucional — PENDENTE
**Falta:** responsáveis técnico, clínico, privacidade e administração de acesso; registros de aprovação dos módulos; evidências dos testes em aparelhos; riscos residuais; versão aprovada; termo de aceite.
**Aceite:** a instituição autoriza formalmente a versão testada e define as condições de uso. Sem isso, o sistema é protótipo/ferramenta técnica, não prontuário clínico homologado.

## Pendências organizadas por execução

### A — Podem avançar sem decisão institucional prévia
1. Preparar matriz de testes para desktop, Android, iOS, teclado, zoom, leitor de tela, teclado virtual e rede instável.
2. Executar testes adicionais automatizados de regressão das rotas principais, inclusive seleção de solicitação/avaliação de exames e integração TO.
3. Criar checklist de revisão de todos os textos clínicos, por módulo, com casos fictícios e divergências a serem verificadas.
4. Padronizar documentação e versão de release; verificar consistência entre README, ACCESS, PLANO-CONCLUSAO e arquivos publicados.
5. Preparar checklist de segurança para validação do administrador e do encarregado de dados, sem consultar ou expor credenciais na documentação.

### B — Dependem de acesso, equipamento ou autorização da equipe
1. **Administrador de acesso:** auditar o Supabase em produção, política de senhas, possíveis credenciais comprometidas, proteção contra abuso, permissões e revogação de sessões.
2. **Responsável de privacidade:** validar fluxo dos dados, equipamentos compartilhados, cópia/impressão e LGPD.
3. **Profissionais habilitados:** revisar limites e textos de todos os módulos, protocolos e instrumentos de TO.
4. **Equipe da unidade:** realizar testes autenticados em celulares e desktop reais e a impressão física do receituário.
5. **Gestão institucional:** registrar responsáveis, versão aprovada, restrições e aceite final.

## Ordem de fechamento recomendada

**Primeiro:** segurança e política de acesso (03–04).
**Segundo:** validação clínica e formulários com dados fictícios (05–08).
**Terceiro:** acessibilidade, desempenho, dispositivos e impressão (02 e 10).
**Quarto:** congelar a versão, repetir CI e verificação da publicação (09 e 11).
**Último:** formalizar o aceite (12).

## Critérios obrigatórios de conclusão
- Nenhum dado identificável de paciente deve ser incluído em repositório, testes públicos, relatórios ou logs de demonstração.
- A interface não deve transformar valores laboratoriais em diagnóstico, prescrição ou conduta clínica automaticamente.
- Qualquer alteração mantém as funções existentes, testa regressões e documenta o resultado.
- Cada módulo exige revisão profissional antes de liberação institucional.
- O responsável pela plataforma registra data, versão, responsáveis, evidências e riscos residuais.
- Este roadmap não substitui ACCESS.md nem PLANO-CONCLUSAO.md; as listas de bloqueios nesses arquivos continuam válidas.

## Evidências examinadas
- **main:** versão 2026.11.22, commit b572d91; arquivos package.json, index.html, app.js, auth.js, styles e módulos.
- **Testes:** dashboard-visual.test.cjs, readiness.test.cjs, occupational-portal.test.cjs, pages-bundle.test.cjs e demais testes do comando npm test.
- **Publicação:** workflow .github/workflows/quality.yml e GitHub Pages.
- **Governança:** ACCESS.md e PLANO-CONCLUSAO.md, atualizados pela última vez em 18/11 antes desta revisão.

**Situação final da revisão:** desenvolvimento técnico avançado; **homologação institucional NÃO CONCEDIDA**.
