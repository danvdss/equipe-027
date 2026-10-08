# Auditoria de redação e praticidade — 2026.10.08.3

## Evidências encontradas e mudanças

| Área | Problema observado no código anterior | Alteração |
|---|---|---|
| Geral, HAS, DM e HAS+DM | Abertura e seguimento presumiam enfermagem; parágrafo único extenso | Redação profissionalmente neutra, local explícito e separação de relato/avaliação e conduta |
| Editor | Exceção de um campo substituía todo o texto por pares rótulo/valor | Segunda composição documental sem cálculo inválido, mantendo alerta e narrativa; fallback por seção para falhas não previstas |
| Edição manual | Confirmação de substituição sem comparação no fluxo de retomada | Comparação entre edição atual e texto atualizado, cancelamento e cópia anterior no histórico |
| Pré-natal | Erro na referência de IG derrubava exames e orientações; queixa detalhada podia não aparecer se a seleção negasse queixas | Referência inválida registrada para revisão sem calcular IG; preservação de ambos os registros conflitantes |
| Exames pré-natais | Repetição de Situação/Resultado por exame | Resultado compacto com data, fonte, laudo e todas as medidas; situação pendente preservada |
| Protege | Mesmo exame podia ser transcrito novamente | Aviso opcional para HBsAg, anti-HCV e HTLV com mesmo resultado e data; sem apagar dados nem equiparar VDRL e teste treponêmico |
| Renovação | Repetição manual dos dados entre solicitação e MUC; abertura longa | Abertura breve, listas separadas e reaproveitamento explícito dos dados, sem copiar decisão/renovação |
| Renovação incompleta | Falha global de composição | Narrativa parcial conserva dados; não afirma avaliação médica a partir da renovação isolada |
| DIU / Implanon | Validação de um campo impedia a narrativa dos demais | Validação estrita preservada, composição documental parcial para a prévia; campos ativos e unidades mantidos |
| Citopatológico / DNA-HPV | Alguns rótulos administrativos apareciam literalmente | Frases próprias para coleta, exame, consentimento e envio; autocoleta recebida não é descrita como coleta pelo profissional |
| Puericultura | Alguns rótulos extensos dificultavam leitura; motivo livre convertido para minúsculas | Rótulos narrativos curtos, texto livre preservado; relato e observação separados; marcos/reflexos e cálculos preservados |
| Terapia Ocupacional | Muitas linhas isoladas e resposta observada antes da intervenção | Blocos Relato / Atividade e avaliação / Intervenção / Resposta / Análise / Plano; SOAP e instrumentos preservados |
| EPF / EAS | Incoerência no EPF impedia composição dos demais resultados | Resultados conflitantes mantidos para revisão sem apagar EAS ou outros exames |
| Textos livres | Digitação sem apoio estrutural | Roteiros opcionais em campos selecionados; somente conteúdo preenchido é acrescentado após ação explícita |

## Regras mantidas

Nenhum resultado normal, consentimento, orientação, diagnóstico, medicamento ou dose é completado automaticamente. Datas e fontes diferentes não são fundidas. Exames permanecem individualizados: data igual não confirma por si só a mesma coleta. O aviso de repetição não remove nenhum resultado. Campos recolhidos mantêm dados; campos inaplicáveis continuam sujeitos às regras dos módulos. Autenticação, M-CHAT e demais algoritmos de pontuação não foram alterados.

A narrativa usa regras específicas quando a redação natural é inequívoca; rótulos técnicos permanecem em medidas, achados, instrumentos e descrições livres para não alterar seu sentido. O modo parcial é para documentação do que foi digitado, não aprovação clínica. Valores a revisar continuam destacados e podem ser copiados.

## Exemplos reais de composição com dados fictícios

### Evolução geral

Antes:

> Paciente comparece à unidade para consulta de enfermagem. Refere como queixa principal: dor no ombro direito há três dias. Sinais vitais: PA 120/80 mmHg. Orientações realizadas: uso correto das medicações.

Depois:

> Paciente em consulta.
> 
> Refere dor no ombro direito há três dias. Sinais vitais: PA 120/80 mmHg.
> 
> Conduta: Orientações realizadas: uso correto das medicações.

### Exame no pré-natal

Antes:

> Gestante comparece à unidade para consulta de pré-natal. Exames do 1º trimestre: VDRL — Situação: Resultado disponível; Coleta / realização: 10/09/2026; Fonte: Laudo apresentado; Resultado: Não reagente.

Depois:

> Gestante em consulta de pré-natal.
> 
> Exames do 1º trimestre: VDRL (coleta / realização em 10/09/2026; fonte: laudo apresentado): Não reagente.

Nos exemplos, o local não foi preenchido. A nova abertura deixa de presumir comparecimento à unidade. A escolha explícita “Na unidade” continua gerando essa redação. Não houve limite de palavras nem exclusão de achados para encurtar o texto.

## Medição reproduzida em DOM simulado

Cenário: medicamento já informado na origem, destino vazio. Sete campos: nome, concentração, unidade da concentração, quantidade, unidade da quantidade, frequência e via. Cada preenchimento/seleção ou ativação de botão conta como uma ação; digitação caractere a caractere, rolagem e conferência clínica não foram cronometradas.

| Tarefa | Antes | Depois | Resultado |
|---|---:|---:|---|
| Solicitação → MUC | 7 preenchimentos | 1 ativação explícita | Sete valores idênticos; avaliação e renovação não marcadas |
| MUC → Solicitação | 7 preenchimentos | 1 ativação explícita | Sete valores idênticos; avaliação e renovação não marcadas |

Comparação executada entre o código anterior no Git e a implementação atual. Não representa medição de tempo real de consulta. Nomes iguais com esquemas diferentes permanecem registros diferentes. Repetir a cópia de dados idênticos focaliza o registro existente, sem alterar sua decisão.

## Validação e limites

60 testes aprovados, incluindo autenticação, módulos, rascunhos, cópia exata, edição manual, comparação antes da substituição, datas inválidas, negativas conflitantes, dados incompletos, repetição de exames, autocoleta, procedimentos interrompidos, medicamentos e instrumentos quantitativos. Sintaxe JavaScript verificada.

A conferência foi por código e DOM simulado. Não houve homologação visual autenticada ou teste em aparelhos físicos nesta etapa. Campos de texto livre não são interpretados semanticamente de forma completa; alertas são regras documentais e podem precisar de revisão humana. Não foi acrescentado serviço externo ou envio de texto clínico para reescrita.
