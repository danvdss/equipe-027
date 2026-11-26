# Auditoria complementar da Fase 0 — 26/11/2026

Evidência subordinada ao ROADMAP.md. Base ff7573c; Projeto-TO de origem af9088309a09; sem dados reais. Não implica homologação.

## Dependências e remoções
O grafo estático em GRAFO-DEPENDENCIAS.json (scripts/dependency-graph.cjs, TypeScript AST e JSDOM) examinou 52 arquivos de fonte/testes HTML, CSS, JS e CJS, com 33 referências locais literais, 121 candidatos a referências globais entre scripts, eventos em 22 entradas de análise e zero destinos locais ausentes nos padrões inspecionados. Combinar com a evidência de rotas em INVENTARIO-TECNICO.md e BASELINE-DESEMPENHO.md. A relação entre identificadores não resolve escopo lexical, chamadas dinâmicas ou internas do bundle; não autoriza remoções. CI, scripts npm, arquivos vendorizados e origem privada já estão descritos no inventário de alto nível. Os scripts de instrumentação novos não integram a publicação.
- Commit b575558 removeu PLANO-CONCLUSAO.md e ROADMAP-ATUALIZADO.md: conteúdo consolidado no ROADMAP.md; histórico recuperável pelo Git. README e plano de integração foram atualizados. Baseline de regressão anterior: 137/137.
- test-results.txt: relatório local antigo, não versionado, ignorado em b575558; não existe commit de reversão do arquivo em si. Não alegar recuperação via Git. Sem remoções adicionais nesta passagem.

## Segurança local
scripts/audit-history.cjs: 87 commits alcançáveis por main, 477 blobs únicos de texto examinados, nenhum excluído por tamanho ou binário; zero blobs correspondentes aos cinco padrões (chaves privadas, tokens GitHub, identificadores AWS, segredo Supabase e JWT service_role). A árvore atual já teve triagem anterior de 84 arquivos. Não abrange senhas arbitrárias, branches externas, reflogs, backups, infraestrutura remota ou outras classes de segredos. A existência histórica de login compartilhado exige confirmação de revogação por administrador; não imprimir ou reutilizar credenciais. Não fazer reescrita de histórico nem alteração de configuração remota por automação.

## Fontes e ativos
Onest (Google Fonts, index e controlados) e Inter (declaração CSS, sem arquivo de fonte local rastreado): SIL OFL 1.1. Fontes oficiais: https://github.com/google/fonts/blob/main/ofl/onest/METADATA.pb e https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt (consulta em 26/11/2026). Caso sejam distribuídos arquivos de fonte próprios, incluir os avisos exigidos. Não há TTF/WOFF rastreados no host. Logotipo/brasão integrado do Projeto-TO e outros ativos próprios: titularidade/autorizações não demonstradas. Não atribuir licença própria.
Dependências de produção já descritas em THIRD-PARTY-NOTICES.md; composição exata do bundle e licenças de ativos continuam sujeitos à confirmação.

## Instrumentos clínicos — risco de direitos de uso
Consulta aos arquivos de origem autorizados TemporaryWorkspace.tsx, HospitalFields.tsx e hospital-evolution.ts. O formulário temporário lista instrumentos e campos de nome, versão, situação, fonte, resultado e observação; não presumir que mencionar o nome seja licença para reproduzir formulário ou algoritmo. O fluxo hospitalar implementa itens de MIF, portanto requer revisão prioritária de direitos. Não copiar itens, manuais ou escalas neste relatório.

| Instrumento | Tratamento observado / providência |
|---|---|
| MIF/FIM | Itens e pontuação no fluxo hospitalar; confirmar autorização de distribuição digital com titular e versão brasileira; bloqueador de homologação. Evidência histórica de licenciamento: https://aspe.hhs.gov/report/opportunities-engaging-long-term-post-acute-care-providers-health-information-exchange-activities-exchanging-interoperable-patient-assessment-information |
| Katz | Seleção hospitalar e formulário temporário; confirmar versão e direito de reprodução dos itens/escala, não presumir autorização por acesso público. |
| Lawton e Brody | Nome e registro de resultado no formulário temporário; confirmar direitos da versão antes de reproduzir/adaptar. |
| COPM | Nome/resultado; titular oferece licença de integração eletrônica: https://www.thecopm.ca/faq/ e https://www.thecopm.ca/terms/ |
| PEDI-CAT | Nome/resultado; licenciamento e distribuição: https://www.pedicat.com/faq/ e https://www.pearsonassessments.com/footer/permissions---licensing.html |
| Perfil Sensorial 2 | Nome/resultado; verificar edição, editora e permissão Pearson antes de reproduzir qualquer material: https://www.pearsonassessments.com/footer/permissions---licensing.html |
| MoCA | Nome/resultado; verificar requisitos da versão, treinamento e permissões: https://www.mocacognition.com/permission e https://mocacognition.com/terms-of-use |
| M-CHAT-R/F | Nome/resultado; distribuição eletrônica tem condições próprias: https://www.mchatscreen.com/mchat-rf/ |
| Outro | Sem autorização presumida; informar nome/versão/fonte e verificar titularidade caso a caso. |

Não expandir nem replicar instrumentos licenciados. Antes da distribuição/uso clínico ou de pesquisa, obter decisão do titular e responsável institucional, ou substituir conteúdo protegido por transcrição de resultado obtido de fonte autorizada, preservando a distinção clínica. Nenhuma funcionalidade foi removida nesta auditoria; não se declara direito de uso. As verificações documentais acima não substituem parecer jurídico.

## Fechamento
Auditoria local e baseline sintético entregues; pendências residuais explícitas: validação de dispositivos/rede reais, cobertura dinâmica por interação e composição fina de bundles, segurança remota e direitos de distribuição de instrumentos/ativos, licença própria, escopo acadêmico. A conclusão integral do gate não pode ser declarada sem evidências correspondentes. Pesquisa e assistência continuam não homologadas.
