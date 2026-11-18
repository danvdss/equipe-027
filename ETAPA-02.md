# Etapa 02 — Experiência móvel

A navegação e os cartões foram compactados para telas estreitas. As ações do formulário e o editor acompanham a área visível durante a digitação. A troca de módulo preserva o texto editado e os campos temporários dos dois modos de exames. Apenas o modo ativo contribui para a evolução.

## Verificações

- 91 testes de regressão aprovados, incluindo a troca de modos e a geometria do teclado.
- 15 telas percorridas em 320 × 640, 360 × 800, 390 × 844, 768 × 1024 e nas quatro dimensões invertidas. Nenhuma ocorrência de rolagem horizontal da página nos cenários medidos.
- Busca de módulos por toque, edição manual, troca de módulo e recuperação do rascunho verificadas em cada configuração.
- Redução da área visível simulada para verificar as posições do editor e da barra de ações em larguras abaixo de 900 px.
- Regressão de tema e teclado em 1440 e 390 px, com 92 controles de seção testados por largura.

Os testes usaram dados fictícios no Brave em Windows. O teclado nativo e o comportamento em aparelhos físicos aguardam conferência.

## Reprodução

Execute `npm ci`, `npm run check` e `npm test`. Para os testes de navegador, use o ambiente descrito em `ETAPA-01.md` e execute `node tests/mobile-browser.cjs` e `node tests/theme-browser.cjs` a partir da raiz.
