# Etapa 01 — Tema escuro e contraste

A paleta de tela em theme.css atende ao ambiente clínico e ao receituário. O teste de contraste em readiness.test.cjs acompanha as cores de texto, controles, foco, mensagens e barras gráficas. O fluxo de publicação inclui a nova folha de estilos.

## Evidências técnicas

- npm run check passou. O conjunto de 88 testes passou no Windows.
- Em Brave, foram percorridas 15 telas em cada área de visualização, 1440 × 960 e 390 × 844. O ensaio usou uma cópia isolada, sem tráfego para o backend e sem dados de pacientes.
- A varredura do texto visível sobre fundos sólidos não encontrou razões abaixo dos limiares de texto comum e grande nas telas percorridas. O teste de paleta também cobriu indicadores essenciais a 3:1.
- O login apresentou contorno de foco ao pressionar Tab. A revisão visual dos cartões laboratoriais verificou campos, unidades, links e estado textual no fundo escuro. Os ensaios usaram a preferência por movimento reduzido.

## Escopo do aceite

A emulação de largura móvel não comprova uso em aparelho físico. A varredura dos fundos sólidos cobre apenas texto visível com fundo identificável. Permanecem para revisão o contraste em fundos decorativos e a operação integral dos estados condicionais por teclado. Situação da entrega: implementada, com validação técnica parcial.
