# EQUIPE 027

Ferramenta estática para gerar evoluções de enfermagem, registros LAB e preencher o receituário de Lagarto/SE.

## Recursos
- Evolução geral, hipertensão, diabetes, HAS + DM e pré-natal.
- Cálculo da idade gestacional por DUM ou USG.
- Texto editável e cópia para o sistema oficial.
- Receituário em duas vias, impressão e exportação PNG.

## Uso
Abra `index.html` por um servidor HTTP local ou pelo GitHub Pages. O acesso usa nome de usuário e senha validados pelo Supabase Auth através de uma função no servidor.

Os dados preenchidos ficam somente na memória da página e são apagados ao sair ou recarregar. O Supabase é usado exclusivamente para autenticação; os formulários clínicos não são enviados ao banco. Textos e arquivos exportados devem ser revisados pelo profissional.

## Publicação no GitHub Pages
A publicação deve usar GitHub Actions. O fluxo `.github/workflows/quality.yml` verifica sintaxe e executa os testes antes de preparar o artefato e publicar. Em Settings → Pages, selecione GitHub Actions. Todos os recursos usam caminhos relativos.

## Estrutura
- `index.html`, `style.css`: interface principal.
- `app.js`, `notes.js`, `prenatal.js`: formulários, modelos e cálculos.
- `receituario.html`: modelo de receituário integrado.
- `html2canvas.min.js`: exportação PNG; licença original incluída no arquivo.

Não envie preenchimentos clínicos nem dados de pacientes ao repositório.

## Solicitação de Implanon

A aba Implanon reúne história menstrual e obstétrica, contracepção, avaliação de possibilidade de gestação, antecedentes, medicamentos, testes rápidos, orientações, consentimento, avaliação de vulnerabilidade e situação da solicitação. A evolução usa apenas os dados informados e não registra inserção nem decide elegibilidade. Pontuação de vulnerabilidade é transcrita com identificação do instrumento local; não há cálculo ou corte presumido.

Referências consultadas em 23/09/2026: Manual do Ministério da Saúde para inserção do implante subdérmico (versão preliminar 2025, disponível na ESPPE) e Nota Técnica Conjunta 419/2025. Links no formulário. Confirmar protocolo municipal vigente.


## Versão 2026.09.24.1

Proteção de edição manual, cópia desatualizada, limpeza reversível na sessão, novo atendimento, validação compartilhada e formulários recolhíveis. Dados clínicos não são persistidos. A validação da redação e dos protocolos pela instituição permanece pendente; não há responsável clínico designado no projeto.

Execute `npm test` para testar modelos e interações em DOM simulado. Testes em aparelhos físicos e impressão real precisam de validação local.

## Revisão 2026.09.24.1

- Confirmação ao limpar, sair e iniciar novo atendimento; desfazer a última limpeza por sessão.
- Comparação antes de substituir edição manual e confirmação para copiar texto desatualizado.
- Validações documentais compartilhadas, pendências explícitas e estados clínicos mutuamente exclusivos.
- Busca de campos, seções recolhíveis, resumo de preenchimento e alternância formulário/texto em telas pequenas.
- Registro de medicação administrada, etapas de avaliação e renovação, barreiras de adesão e retorno.
- Receituário com revisão das duas vias, proteção contra sobreposição, PNG de 3368 × 2380 px e importação/exportação apenas da calibração.
- `npm ci && npm run check && npm test`: testes de interação em DOM simulado. Não substituem testes em aparelhos reais.
- Consulte `ACCESS.md` para a dependência de autenticação e validação institucional.

## Atalhos e exames · 2026.09.24.2

Atalhos com ícones para SISPEC, Drive da equipe, calculadora cardiovascular da SBC e CKD-EPI 2021 da SBN. Links mantidos conforme fornecidos, em nova aba. O atalho do Drive abre “Meu Drive” da conta conectada; não aponta para uma pasta compartilhada específica.

EPF: resultado informado, método, amostras, Giardia duodenalis, E. histolytica/dispar, E. coli, Endolimax nana, Iodamoeba bütschlii, Blastocystis spp. e outros achados. EAS: características físicas, fita reagente e sedimento. Datas específicas opcionais, preservação de unidades, campos inicialmente vazios e bloqueio de resultado negativo com organismos presentes. A transcrição não gera diagnóstico nem recomenda tratamento.

Referências para estrutura e nomenclatura consultadas em 24/09/2026:
- Ministério da Saúde: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/g/giardiase
- CDC DPDx: https://www.cdc.gov/dpdx/amebiasis/index.html
- HC-UFTM, Urina Tipo 1 / Urinálise, versão 3: https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-sudeste/hc-uftm/documentos/procedimentos-e-rotinas-operacionais-padrao/pops/copy_of_POP.HCUFTMUACAP.008UrinaTipo1Urinaliseversao3.pdf

## Autenticação · 2026.09.24.3

E-mail e senha validados pelo Supabase, recuperação de senha, aceite de convite e saída. Tokens apenas em memória, sem localStorage/sessionStorage. A recarga exige novo login e apaga rascunhos. `supabase.min.js` é a distribuição UMD oficial de `@supabase/supabase-js` 2.117.1 (MIT), copiada de node_modules; versão e lockfile fixados. Para atualizar, instalar versão exata, copiar dist/umd/supabase.js e executar testes.

A hospedagem GitHub Pages e os arquivos do repositório continuam públicos. O login não torna os scripts privados. Não há armazenamento remoto de pacientes; qualquer futura API clínica exige autorização no servidor e políticas RLS específicas.

## Acesso compartilhado anterior · 2026.09.24.4 (substituído)

Por solicitação do responsável, foi restaurada a entrada local compartilhada. As credenciais não são exibidas na interface. Os scripts Supabase não são carregados pela página; sua integração anterior permanece no histórico/arquivos para eventual retomada. O projeto e a conta do Supabase não foram excluídos. A hospedagem continua pública e não há autenticação em servidor neste modo.

## Renovação e revisão textual · 2026.09.24.5

A aba Renovação separa medicamentos solicitados e MUC (medicamentos em uso). Cada linha registra nome, concentração/apresentação, quantidade por tomada, unidade, frequência, via e esquema. Atalhos preenchem apenas o nome. Não há sugestão de doses, conversão de unidades ou prescrição automática. Solicitação de avaliação, avaliação realizada e resultado de cada medicamento exigem registro explícito. Alterações de prescrição exigem transcrição do novo esquema. Campos vazios são omitidos da evolução.

Pesquisa em 24/09/2026: portal oficial de Lagarto, lista municipal e registros de estoque indexados (julho/agosto de 2026). Foram encontrados Losartana potássica, Ácido fólico e Pregabalina. Os demais atalhos foram pedidos pela equipe. As páginas detalhadas retornaram erro e **não foi possível confirmar a disponibilidade atual de qualquer item na UBS Dr. Davi Marcos de Lima**; confirmar diretamente com a dispensação local. Nome comercial e formulação não são intercambiados automaticamente.
- https://saude.lagarto.se.gov.br/lista-de-medicamentos
- https://saude.lagarto.se.gov.br/estoque-de-medicamentos?page=6
- https://saude.lagarto.se.gov.br/estoque-de-medicamentos?page=2
- https://saude.lagarto.se.gov.br/unidade-de-atendimento/remume-rename

Revisão de redação: avaliações não preenchidas não geram condutas presumidas; metadados preservam pontos decimais; local do atendimento preserva idade informada; correção de singular/plural da idade gestacional, pontuação e repetições nas orientações e no retorno.

## Prévia em tempo real · 2026.09.27.1

Prévia local atualizada após 180 ms de digitação e imediatamente antes de copiar ou revisar/salvar. Nenhuma chamada externa nem gravação no histórico por tecla. Quando faltam dados exigidos ou existem conflitos, a prévia parcial mostra os campos preenchidos sem produzir uma evolução final válida. Pontos associados são destacados em vermelho e os botões levam aos campos; desmarcar uma opção exige clique explícito. Não há alteração automática de respostas.

Regras documentais: queixa versus ausência de queixa, etapas de avaliação/renovação, gestação e teste registrado, G/P/A, decisão/consentimento e inserção, datas e achados de EPF. As validações existentes continuam ativas. Texto livre editado recebe somente checagens lexicais limitadas, indicadas como possíveis conflitos. Isso não é revisão clínica completa. Edições manuais permanecem separadas da prévia; substituir exige comparação e confirmação. Copiar é bloqueado enquanto houver pontos sinalizados. Em celular/tablet, a prévia recolhível fica visível acima do formulário durante o preenchimento.


## Terapia Ocupacional — 2026.09.27.3

Aba independente com modalidades de atendimento, perfil ocupacional, tarefas e ajuda por contexto, intervenções, texto corrido/SOAP e prévia em tempo real. Mantém edição manual e revisão de conflitos. Campos inativos de ausência não entram no texto. Dados clínicos continuam apenas na memória da sessão.

Permite registrar vários instrumentos (M-CHAT-R/F, COPM, Katz, Lawton e Brody, PEDI-CAT, Perfil Sensorial 2, MoCA e outros), resultados por domínio e origem externa. M-CHAT-R/F valida os escores informados e distingue seguimento pendente, completo e revisão necessária. Não reproduz seus itens ou fluxogramas: publicação eletrônica requer licença dos autores. Fonte verificada: https://www.mchatscreen.com/mchat-rf/ e https://www.mchatscreen.com/mchat-rf/scoring/ (27/09/2026).

Questionários completos não estão habilitados nesta versão. O motor determinístico foi preparado, mas nenhuma licença/versionamento de formulário foi presumida. Katz/Lawton exigem definição e verificação do formulário e direitos; instrumentos comerciais permanecem como registro de aplicação/relatório. Não há inferência diagnóstica nem conversão normativa de escores. Estes limites aparecem na interface.

Validação: testes de integração com dados fictícios, limites do M-CHAT, seguimento, ausência, contexto, troca de abas e preservação manual. Revisão profissional do conteúdo continua necessária antes do registro institucional.


## Autenticação por usuário · 2026.09.27.4

O login local foi removido. O formulário envia usuário e senha à Edge Function `username-login`, que resolve o alias no servidor e submete a senha ao Supabase Auth. Após receber os tokens, o navegador valida a identidade com `getUser`. Falha de rede ou de validação nunca libera a interface. A senha válida é a já cadastrada na conta confirmada do Supabase; a antiga senha local não foi migrada nem inserida em código público. Recuperação continua pelo e-mail da conta. Nenhuma senha da conta foi alterada.

Sessões somente em memória; saída e recarga apagam dados locais. A função usa somente a chave pública/anon, sem privilégios administrativos. Supabase Auth mantém suas próprias políticas de senha e limites de tentativas; o proxy propaga 429. O limite de origem CORS não substitui autenticação. A conta compartilhada não oferece autoria individual. Repositório e interface permanecem públicos, e a versão anterior do login pode continuar no histórico Git. Nenhum dado clínico é enviado ao serviço de autenticação.

A função deve ser implantada com `verify_jwt=false`, pois é o ponto de entrada antes da sessão; a autenticação é feita dentro dela pelo endpoint oficial de senha do Supabase. Não existe emissão própria de JWT, comparação de senha local ou chave de serviço no cliente.

## Editor único · 2026.09.29.1

Substitui o fluxo anterior de prévia e resultado separados. Texto automático e editável no mesmo campo; copiar usa o texto visível e guarda uma cópia no histórico temporário. Alertas vermelhos são sugestões e não bloqueiam cópia. Edição manual é preservada; retomar automático exige confirmação e mantém a versão anterior no histórico. Em falha de composição, os dados aparecem como registro parcial, sem resultados clínicos inferidos. No celular o editor compacto fica no fluxo normal; Ctrl/Cmd+Enter copia. Verificações locais: 37 testes em DOM simulado e sintaxe; aparelhos físicos e impressão real não homologados nesta revisão.
