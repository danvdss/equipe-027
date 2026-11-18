# Etapa 01 — Tema escuro e contraste

O ambiente clínico e os controles do receituário usam a paleta de tela em `theme.css`. As regras de impressão ficam separadas. A navegação entre módulos leva o foco ao conteúdo principal. O seletor de seção abre a seção escolhida e leva o foco ao respectivo controle. Cada botão de expansão identifica o conteúdo associado por `aria-controls`.

## Evidências

| Verificação | Resultado |
| --- | --- |
| Verificação do projeto e regressões | `npm run check` e 89 testes aprovados. |
| Texto visível em fundos sólidos | Varredura anterior de 15 telas por largura, sem ocorrência abaixo do limiar entre os elementos avaliados. |
| Gradientes | Medição nos títulos e textos da abertura, símbolo do cabeçalho, cartões do painel e cabeçalhos clínicos. Menor contraste de 6,37:1 em 1440 px e 6,47:1 em 390 px. |
| Teclado | 92 controles de expansão por largura. Ativação, estado expandido, associação ao conteúdo e foco visível após Tab. Abertura e fechamento do menu de módulos, transferência de foco na navegação e retorno do editor com Escape. |
| Campos condicionais | Alternância entre solicitação e avaliação de exames, exibição dos campos de administração de medicamento e ativação da data de retorno. |
| Movimento reduzido | A preferência foi ativada nas duas execuções em navegador. |

As verificações em Brave no Windows usaram dados de teste e recursos locais. A medição dos gradientes comparou capturas do mesmo elemento com e sem o texto e avaliou os pixels de fundo sob os caracteres. A largura de 390 px foi emulada em navegador de desktop. Outros navegadores, uso em aparelho físico e aprovação institucional pertencem à validação posterior do roadmap.

## Reprodução

Na raiz do projeto, execute `npm ci`, `npm run check` e `npm test`. Para repetir o ensaio visual, instale `playwright-core@1.56.1` com `npm install --no-save --package-lock=false playwright-core@1.56.1`, defina `E027_BROWSER` com o caminho do executável do Brave ou Chromium e execute `node tests/theme-browser.cjs`. O ensaio abre um perfil temporário e serve os arquivos do projeto em um domínio fictício, sem utilizar o backend.
