# Revisão EQUIPE 027 · 2026.10.12

## Entregue

- Tokens do tema escuro reunidos, superfícies e bordas refinadas, movimentos de entrada reduzidos a 180 ms. Painel de crescimento com fontes maiores, controles de 44 px e tabela acessível.
- Editor: comparação seletiva de parágrafos sem opções pré-marcadas. O usuário define qual parágrafo substituir ou se deseja acrescentar ao final. Destinos repetidos são recusados. Texto não selecionado permanece intacto; versão anterior vai ao histórico temporário.
- Modo “Texto sem realce” e proteção durante composição por teclado/IME. Cópia continua usando exatamente o editor. A atualização seletiva permanece em modo manual e não presume sincronização clínica de todos os trechos.
- Revisão lexical conservadora por parágrafo, com supressão em contextos temporais/fontes ambíguos, tratamento de negação e realce localizado no texto manual. Checagens estruturadas permanecem. Correção de checkbox oferece desfazer.
- Renovação: quatro atalhos imediatos, demais nomes pesquisáveis sem mudar as prescrições. Confirmação com nomes e quantidade antes de marcar em lote; decisões anteriores permanecem. Remoção devolve foco a controle utilizável.
- Redação geral: “Conduta: Orientações realizadas: …” passa a “Conduta: Orientado: …”, preservando os termos selecionados. Frases genéricas permanecem quando não há conteúdo mais específico informado.
- M-CHAT: escores transcritos só recebem interpretação automática após confirmação explícita da referência oficial brasileira suportada, além das condições anteriores de aplicação e idade. Versão livre isolada não libera interpretação. Questionários completos seguem indisponíveis.
- Referências e limites visíveis nos módulos. Catálogo técnico em Care.references com edição, consulta, regra, teste e status de revisão. Nenhum responsável clínico foi presumido; homologação local está pendente.
- Versão central em package.json; npm run release atualiza caches de index, receituário e Care. npm run check verifica todos os arquivos próprios JS/CJS e coerência das versões. Autenticação não alterada; dependências travadas preservadas.

## Auditoria e decisões

| Item | Classificação | Resultado |
|---|---|---|
| Qualquer texto de versão permitia interpretar M-CHAT | Confirmado | Referência suportada passa a exigir seleção explícita |
| Divergência de faixas aos 2 anos | Risco não reproduzido | Dias inteiros tornam os critérios equivalentes; documentados e centralizados, sem mudar o limite OMS |
| Alertas sem contexto em texto livre | Confirmado | Checagens mais conservadoras; não há interpretação semântica completa |
| Perda silenciosa de texto manual | Não encontrada na base | Proteção existente preservada; acrescentada aplicação seletiva |
| Miniatura com tipografia e controles pequenos | Confirmado no CSS | Ajustado; homologação em tela ainda pendente |
| Histórico de crescimento | Expansão opcional | Não implementado: apenas aferição atual, sem armazenamento de pacientes |
| Revisão de todos os protocolos assistenciais | Pendente de homologação | Não adicionadas regras de diagnóstico, prescrição ou elegibilidade |

## Exemplos fictícios, mantendo os mesmos fatos

- Orientação selecionada “alimentação saudável”: antes “Conduta: Orientações realizadas: alimentação saudável.”; depois “Conduta: Orientado: alimentação saudável.” Nenhuma orientação adicional foi incluída.
- Texto “Febril ontem, afebril hoje.”: antes o par lexical podia gerar alerta; agora contexto temporal evita esse alerta. Isso não valida o restante do registro.
- Edição “Abertura manual. / Relato manual. / Plano manual preservado.”: ao selecionar apenas o destino do novo relato, abertura e plano são preservados. Cancelar não muda nenhum trecho.
- M-CHAT com escore inicial 8, idade 24 e versão livre: antes podia produzir classificação; agora exige a referência suportada explicitamente conferida. O escore informado continua registrado.

## Verificação

Linha de base: 67 testes aprovados. Revisão: 75 testes aprovados, incluindo os oito novos casos de referência não suportada, fronteiras de crescimento, tabela acessível, contexto textual, aplicação seletiva, cancelamento/conflito de destinos, composição IME e renovação em lote.

Verificação sintática de todos os módulos próprios e consistência do cache. Nenhum dado real de paciente utilizado. Testes são DOM simulado, sem autenticação de produção e sem homologação clínica.

## Medição reproduzível

Executar node measure.cjs DIRETORIO. Comparação com os mesmos dados fictícios na base publicada 190021c e na revisão. 25 atualizações por módulo; milissegundos de execução síncrona em JSDOM, sem renderização gráfica, sem atraso do agendador e sem teclado virtual. Não equivale a tempo de consulta ou desempenho de aparelho físico.

| Módulo | Mediana antes (ms) | Mediana depois (ms) | P95 antes (ms) | P95 depois (ms) |
|---|---:|---:|---:|---:|
| general | 4.22 | 4.17 | 5.09 | 5.57 |
| renewal | 4.89 | 5.41 | 5.4 | 8.38 |
| prenatal | 8.14 | 8.52 | 10.28 | 10.26 |
| child | 13.17 | 13.07 | 14.71 | 18.32 |
| occupational | 7.5 | 7.59 | 9.47 | 8.68 |

As diferenças incluem variabilidade do ambiente. Não há base para afirmar aceleração geral. O agendamento passou de 180 para 120 ms, mas latência visual total ainda requer medição em navegador/dispositivo.

Ações lógicas executadas por roteiro (navegação, preenchimento, seleção ou ativação; caracteres não contados): renovação registra dois medicamentos e copia; pré-natal adiciona VDRL/TOTG e resultados e copia; puericultura informa oito campos, expande gráfico e copia; TO informa demanda/intervenção/resposta e copia; geral preenche, edita manualmente e copia.

| Tarefa | Antes | Depois |
|---|---:|---:|
| renewal | 14 | 14 |
| prenatal | 14 | 14 |
| child | 10 | 10 |
| occupational | 5 | 5 |
| general | 4 | 4 |

A contagem exclui rolagens, abertura visual de seções externas, busca manual, conferência e tempo humano. Os roteiros usam DOM simulado e não são testes de usabilidade. Renovação em lote agora acrescenta confirmação explícita; essa ação não fazia parte do roteiro acima. Não foi declarado ganho de velocidade por redução de cliques.

## Limitações e itens parcialmente atendidos

- Sem verificação visual autenticada nas cinco larguras, zoom de 200%, teclado virtual ou aparelhos reais. A visualização local já havia sido bloqueada pela política do navegador; não foi contornada.
- Catálogo de protocolos é inicial. Revisão clínica completa de cada módulo e validação municipal precisam de responsável assistencial; não há certificação de conformidade clínica.
- Licenças e formulários integrais de instrumentos não foram presumidos. Não foram criados escores normativos, diagnóstico, histórico longitudinal ou curvas de prematuros.
- Redação, formulários e separações clínicas existentes foram preservados onde já atendiam ao pedido. Não houve reconstrução integral de todos os modelos.
- Tokens CSS centralizados, mas a consolidação integral de todas as regras por componente depende de regressão visual. Não foi feita migração de framework nem reestruturação total de app.js.
- Atualização seletiva usa parágrafos e escolha explícita de destino. Não há associação universal de cada trecho a cada campo. Realce estrutural de texto gerado ainda depende das regras de valores; texto manual usa posições exatas nas checagens lexicais.

## Fontes conferidas

- WHO Anthro manual 3.2.2, seções 3.2.1 e 3.2.3: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/software/anthro-pc-manual-v322.pdf?sfvrsn=c4e76522_2
- Caderneta da Criança: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta/caderneta
- M-CHAT algoritmo: https://www.mchatscreen.com/mchat-rf/scoring/
- Tradução brasileira identificada: https://www.mchatscreen.com/wp-content/uploads/2018/04/M-CHAT-R_F_Brazilian_Portugese.pdf
- INCA 2025: https://ninho.inca.gov.br/jspui/handle/123456789/17858

Não houve mudança em dados clínicos persistentes, credenciais, hospedagem ou política de autenticação. Para voltar ao comportamento anterior, restaurar o conteúdo do commit remoto 190021cb53418c5771d2770a31305416ea2f0e5f e passar novamente pelos testes e publicação.
