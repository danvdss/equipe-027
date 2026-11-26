# Etapa 04 — Painel de exames

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](ROADMAP.md); não representa homologação atual.


O painel usa os campos LAB do próprio formulário de avaliação como catálogo e fonte dos resultados. A busca combina nome, sigla ou categoria com filtros de situação. Oito cartões aparecem por vez, com acesso aos demais. A contagem distingue os cartões exibidos dos resultados preenchidos no formulário.

Cada cartão sincroniza o resultado nos dois sentidos. Exames sem faixa inicial recebem limites em branco. A faixa, a unidade e, quando aplicável, o jejum precisam estar conferidos para que o painel mostre o marcador e o estado textual. Resultados qualitativos permanecem registrados sem comparação numérica. As faixas preexistentes continuam ilustrativas. Os exames complementares com descrição livre conservam o registro próprio.

## Verificações

- 94 testes da suíte do projeto. Incluem busca sem acentos, combinação de categoria e situação, carregamento de mais cartões e sincronização de resultados.
- Brave em 1440, 390 e 320 px: 91 campos LAB e 91 cartões. Com dados fictícios de ferritina, verificados o estado sem comparação, o marcador após confirmação, a recuperação do rascunho e a ocultação do painel no fluxo de solicitação.
- Regressão das etapas anteriores no navegador: navegação por teclado e 15 telas nas quatro dimensões móveis e suas orientações invertidas.

Para reproduzir, use o ambiente da Etapa 01, execute npm test e npm run check e rode node tests/lab-browser.cjs na raiz. Ensaios de tela móvel emulados. A validação clínica das referências continua pendente.
