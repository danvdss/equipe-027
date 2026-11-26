# Equipe-027 · Matriz de aceite da versão 2026.11.21

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](ROADMAP.md); não representa homologação atual.


A versão reúne as entregas de interface e os fluxos clínicos para avaliação. Os testes de interface utilizam dados fictícios. A aprovação para uso institucional permanece em aberto.

| Etapa | Implementação e evidência técnica | Limite do aceite |
| --- | --- | --- |
| 01 · Tema | Paleta compartilhada, foco e movimento reduzido. Testes de contraste em readiness.test.cjs e de renderização em tests/theme-browser.cjs. | As medições cobrem as combinações e áreas amostradas. |
| 02 · Celular | Navegação, favoritos e preservação de rascunhos. tests/mobile-browser.cjs verifica larguras pequenas e orientações. | Conferir teclado, toque e rotação em aparelho físico. |
| 03 · Segurança | Revisão da configuração Supabase e testes de sessão, convite, falha de autenticação e limpeza ao sair em auth.test.cjs. | Resolver o alerta de política de senhas, realizar o ciclo positivo com identidade fictícia institucional e obter parecer sobre privacidade. |
| 04 · Exames | Busca, categorias, filtros, unidades, resultados textuais e sincronização do painel com o formulário. enhancements.test.cjs e tests/lab-browser.cjs. | Conferência clínica dos exames pela equipe. |
| 05 · Faixas | Edição, restauração, limites incoerentes e confirmação pelo laudo cobertos por enhancements.test.cjs. | Responsável clínico deve revisar fontes e condições de aplicação. |
| 06 · Solicitação e avaliação | Testes de início vazio, mudança de modalidade, conduta explícita e preservação da edição em quality.test.cjs. | Aprovação dos textos pela equipe. |
| 07 · Editor | Histórico em memória por módulo e modalidade, desfazer/refazer, prévia, cópia e edição manual. quality.test.cjs e tests/release-browser.cjs. | Avaliar ergonomia em atendimento simulado. |
| 08 · Modelos | Criação, duplicação, edição e restauração por módulo. O armazenamento guarda nomes e títulos de seções. Campos do atendimento entram no texto por ação explícita. | Usar títulos genéricos nos modelos compartilhados no dispositivo. |
| 09 · Módulos | Testes individuais de navegação e edição parcial em 12 módulos. Suítes específicas cobrem regras, conflitos e cálculos conforme o módulo. | Validação profissional dos protocolos e cálculos. |
| 10 · Dashboard | Pesquisa por nome e palavra-chave, favoritos configuráveis e atalhos. Ensaio da busca pelo termo “hipertenso”. | Verificar com a equipe o vocabulário habitual. |
| 11 · Documentos | Prévia do texto editado, TXT, impressão A4 e PDF multipágina. tests/release-browser.cjs exercita texto fictício com 120 linhas. | Conferir uma impressão em papel. |
| 12 · Homologação | Matriz de rastreabilidade, suíte automatizada e ensaios de navegador. | Pareceres clínico, de segurança e privacidade e aceite formal institucional. |

## Cobertura clínica

| Módulos | Casos de regressão e pontos para conferência profissional |
| --- | --- |
| Geral, HAS, diabetes e HAS com diabetes | Prévia parcial, navegação, edição manual e independência dos rascunhos. Conferir conteúdo e obrigatoriedade dos campos por tipo de atendimento. |
| Renovação | Diferencia pedido, uso contínuo e decisão registrada. Testes incluem dose e unidade ausentes. |
| Exames | Verifica dados omitidos, conflitos, faixas não confirmadas, solicitação e avaliação. |
| Pré-natal e puericultura | Conferir datas, medidas e cálculos obstétricos e de crescimento. growth.test.cjs inclui dados ausentes, idade e limites da referência. |
| Terapia Ocupacional | occupational.test.cjs cobre ausência, texto SOAP, omissões, limites de pontuação e revisão manual. |
| Citopatológico, DIU e implante | Conferir textos de atendimento incompleto, procedimentos e condutas selecionados em cada formulário. |
| Receituário | Fluxo de documento próprio e estilos de impressão independentes das evoluções. Conferir a saída na impressora institucional. |

## Reprodução

Executar npm ci, npm test e npm run check na raiz do projeto. Para os ensaios em navegador, instalar playwright-core em ambiente de testes, definir E027_BROWSER como caminho do executável e executar com Node os arquivos tests/theme-browser.cjs, tests/mobile-browser.cjs, tests/lab-browser.cjs e tests/release-browser.cjs. O último grava um PDF temporário com dados fictícios. Os ensaios isolados de interface não autenticam no serviço de produção.

## Registro de aceite institucional

A instituição deve registrar a versão examinada, aparelho e navegador, resultado, falhas encontradas e responsável por cada parecer. Para a sessão real, utilizar conta fictícia controlada com autorização institucional. A revisão clínica deve identificar o módulo, a regra avaliada e o profissional responsável. O aceite formal continua pendente até que os responsáveis registrem a decisão.

## Resultados desta versão

- Windows, 108 testes aprovados, zero falhas e zero testes ignorados. A verificação de integridade examinou 30 arquivos.
- Brave, 15 telas por dimensão em 320×640, 360×800, 390×844, 768×1024 e respectivas orientações horizontais. Nenhuma ocorrência no ensaio de layout.
- No ensaio de contraste, 90 áreas por largura, sem falhas. Os menores valores medidos foram 6,36:1 a 1440 px e 6,32:1 a 390 px.
- Painel com 91 exames testado a 1440, 390 e 320 px, incluindo filtros, gráfico, busca e mudança de modalidade.
- Brave e Edge executaram busca, desfazer/refazer, modelos, prévia, exportação TXT e geração de PDF. O TXT correspondeu ao texto editado. Cada PDF teve três páginas A4. A extração recuperou as 120 linhas numeradas em ordem nos dois arquivos.
- A estação disponibilizava somente impressora virtual. Continuam pendentes o teste em papel e o teste em celular físico.

### Conferência adicional no Firefox

Na revisão be3ec46, o Firefox 142.0.1 em Windows, com perfil temporário, abriu a avaliação com o painel recolhido e o filtro **Com resultado** selecionado. Digitar zero no campo de ferritina do formulário exibiu um cartão de resultado. A prévia reproduziu exatamente o texto de teste. O PDF gerado pelo motor de impressão do Firefox continha três páginas A4. A extração de texto confirmou as 120 linhas fictícias, com acentos, na ordem original e sem controles da interface. A conferência foi digital. O aceite em papel permanece pendente.

### Revisão das evoluções de DIU e implante

A abertura automática identificava avaliação e solicitação mesmo ao registrar apenas avaliação de DIU ou preferência por outro método no módulo de implante. A abertura agora identifica o método do atendimento. Finalidade, decisão, pedido, consentimento e desfecho continuam vinculados aos campos do registro. A suíte de 110 testes passou, incluindo a distinção entre motivo de inserção e inserção concluída. O ensaio tests/contraception-browser.cjs verificou os fluxos com dados fictícios no Brave a 1440 e 320 px. Os protocolos aguardam avaliação profissional.

### Sessão com dados fictícios no navegador

Na revisão f037544, o Brave no Windows executou tests/session-browser.cjs com o SDK distribuído e respostas HTTP simuladas. Cancelar a saída preservou o texto. Ao confirmar, a aplicação consultou o usuário e enviou o pedido de encerramento durante o fluxo. Com resposta 204, a sessão seguinte abriu com editor vazio e sem edição para desfazer. Com resposta 503, a tela exibiu a orientação para fechar a aba. Após recarregar e entrar novamente, a sessão também começou vazia. O marcador fictício estava ausente da tela de login e dos armazenamentos localStorage e sessionStorage nos dois casos. O ensaio não verifica revogação no servidor real.

### Ficha de conferência na unidade

Registrar a revisão do sistema, a data e o responsável por cada ensaio. Usar exclusivamente dados fictícios. Registrar evidências e decisões no canal institucional apropriado.

| Ensaio pendente | Ação e resultado a conferir | Resultado observado / responsável |
| --- | --- | --- |
| Sessão institucional | Entrar com a identidade fictícia autorizada, editar um rascunho, cancelar a saída e conferir o texto. Confirmar a saída, entrar novamente e verificar editor e histórico vazios. Conferir o encerramento também no provedor. | A preencher |
| Celular físico | Anotar aparelho, sistema e navegador. Abrir Avaliação de exames, registrar zero em ferritina, abrir o painel e conferir o cartão em Com resultado. Editar a evolução com o teclado aberto, girar o aparelho e voltar ao módulo. Conferir texto, acesso às ações e rolagem. | A preencher |
| Papel A4 | Anotar navegador e impressora. Imprimir uma evolução fictícia com linhas numeradas suficientes para duas páginas. Comparar primeira e última linha, sequência, acentos, margens e ausência de controles com o texto editado. | A preencher |
| Pareceres e decisão | Identificar módulos e regras revisados, ressalvas clínicas, parecer de segurança e privacidade, falhas a corrigir e decisão formal sobre a versão. | A preencher |
