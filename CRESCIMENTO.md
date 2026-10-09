# Gráficos de crescimento · 2026.10.09.1

Painel da puericultura no canto inferior direito, com escolha de indicador, recolhimento e expansão dos quatro gráficos. Atualização local imediata ao mudar nascimento, data do atendimento, sexo registrado, peso, comprimento/altura, forma de medição, perímetro cefálico ou idade gestacional ao nascer. Não move o foco nem altera a evolução.

## Fontes e fidelidade

- Referência assistencial: [Caderneta da Criança — Ministério da Saúde](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta).
- Organização dos indicadores: [Caderneta de Saúde da Criança, menino, 11ª edição — Ministério da Saúde](https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_saude_crianca_menino_11ed.pdf). Perímetro cefálico até 2 anos; peso, comprimento/altura e IMC organizados em 0–2, 2–5 e 5–10 anos.
- Dados numéricos: tabelas oficiais de escores-z da OMS (padrão 2006 e referência 2007), consultadas em 09/10/2026. As 18 fontes específicas, intervalos mensais e hashes das linhas extraídas estão em [growth-sources.json](growth-sources.json).
- [Peso por idade — OMS](https://www.who.int/tools/child-growth-standards/standards/weight-for-age)
- [Comprimento/altura por idade — OMS](https://www.who.int/tools/child-growth-standards/standards/length-height-for-age)
- [IMC por idade — OMS](https://www.who.int/toolkits/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age)
- [Perímetro cefálico por idade — OMS](https://www.who.int/tools/child-growth-standards/standards/head-circumference-for-age)
- [Referência após 5 anos — OMS](https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators)

As curvas são uma reprodução gráfica própria de valores numéricos, não uma imagem ou aplicação oficial do Ministério. Não há extração visual aproximada das linhas. Foram extraídos os sete valores tabulados em cada mês: −3, −2, −1, mediana, +1, +2 e +3 desvios-padrão. As tabelas publicadas têm uma casa decimal; os segmentos apenas ligam esses pontos. Não se calcula escore-z ou percentil individual.

A página de altura 5–19 anos apresentou links de tabela de escores-z direcionados a tabelas de percentis. Esses arquivos foram identificados e descartados. O conjunto utilizado é o de tabelas simplificadas explicitamente intituladas **z-scores**, com sete colunas verificadas.

## Comportamento clínico

- Um ponto representa somente a aferição do atendimento atual. Não cria um histórico longitudinal, nem presume tendência a partir de um único ponto.
- Idade cronológica em dias entre datas UTC válidas, convertida em meses por 30,4375. Não interpreta texto livre de idade.
- Sem sexo ou datas válidas: solicita completar os campos, sem escolher uma referência por conta própria.
- Peso, comprimento/altura e IMC: do nascimento até 120 meses. Perímetro cefálico: 0–24 meses neste painel.
- Comprimento deitado até 730 dias; estatura em pé a partir de 731 dias. Mantida a descontinuidade das tabelas de comprimento/estatura e IMC aos 2 anos. Não mistura as duas linhas nem converte centímetros silenciosamente.
- Se a forma de medição não estiver informada ou divergir da referência por idade, o ponto de comprimento/altura e IMC não é colocado. O valor original continua no formulário e no texto.
- Prematuridade informada (<37 semanas) antes de 24 meses: suspende o ponto e explica que curvas específicas/idade apropriada precisam ser verificadas. Não implementa Intergrowth nem correção automática. Não considera informação ausente como nascimento a termo.
- Valores positivos fora da escala são indicados por um marcador na borda e aviso explícito, sem parecer que caem dentro da referência. Medidas vazias, zero, negativas ou inválidas não geram ponto.
- Não marca “Registro nos gráficos da caderneta” nem acrescenta avaliação, normalidade ou diagnóstico à evolução. IMC já existente na narrativa permanece aritmético.
- Dados somente em memória, sem armazenamento adicional ou serviços externos. A tabela de referência acompanha o site; não há chamada à OMS/MS a cada preenchimento.

## Validação e limites

Sete testes específicos verificam integridade/intervalos das tabelas, sentinelas numéricas por sexo, idade/datas inválidas, IMC e medidas parciais, tipo de medição, transição aos 2 anos, prematuridade, limite etário, valores fora da escala, atualização sem mudança de foco, expansão, recolhimento, cópia idêntica ao editor, navegação, restauração e limpeza do módulo. A suíte completa inclui os testes anteriores de autenticação e redação.

A interface tem regras responsivas para celular/tablet, diálogo nativo com Escape e retorno de foco, rótulos acessíveis e botão para recolher a miniatura. A visualização autenticada em aparelhos físicos ainda requer conferência local. O painel é apoio visual e não substitui a avaliação profissional da trajetória de crescimento nem a caderneta oficial.
