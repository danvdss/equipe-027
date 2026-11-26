# Etapa 05 — Faixas laboratoriais por exame

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](ROADMAP.md); não representa homologação atual.


Cada um dos 91 cartões identifica se a faixa foi conferida. O profissional pode registrar a origem da faixa e as condições informadas pelo laboratório. Idade, sexo, gestação, método e risco podem ser documentados quando pertinentes. Os exemplos já existentes continuam identificados como ilustrativos. Para os demais exames, os limites iniciais ficam vazios.

Editar a fonte, o contexto, a unidade ou os limites desfaz a confirmação. Uma troca de unidade exige nova transcrição dos limites. Campos percentuais cuja unidade integra o formulário original mantêm o símbolo de porcentagem. Limites vazios, não numéricos, iguais ou invertidos impedem a comparação. Restaurar recupera os limites e a unidade iniciais daquele exame, limpa a personalização e preserva o resultado.

As alterações acompanham o atendimento durante a navegação. A suíte inclui regressão de edição e restauração. O ensaio tests/lab-browser.cjs verifica a persistência temporária do contexto, a invalidação da confirmação e o gráfico em 1440, 390 e 320 px, usando dados fictícios. Execute npm test, npm run check e o ensaio conforme ETAPA-01.md.

A validação dos intervalos para uso institucional continua pendente. Orientação geral sobre a leitura das faixas do próprio laboratório: https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/
