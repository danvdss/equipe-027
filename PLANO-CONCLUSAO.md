# Equipe-027 — Plano de conclusão e critérios de aceite

Atualizado em 18/11/2026. Este arquivo registra evidências técnicas; não equivale a homologação clínica.

## Etapa 1 — Base, acesso e registros
- [x] Navegação, autenticação, rascunhos apenas em memória e limpeza por novo atendimento.
- [x] Anamnese complementar por módulo e inserção explícita no editor.
- [x] Testes automatizados de regressão.
- [ ] Homologar o fluxo com profissionais da unidade e testar autenticação em ambiente publicado.
- [ ] Testar login, saída e perda de conexão em dispositivos reais.

## Etapa 2 — Exames e acompanhamento de HAS/DM
- [x] Registros de exames laboratoriais e complementares.
- [x] Conferência contextual com confirmação de unidade e jejum quando aplicável.
- [x] Limites do laudo editáveis; função renal, lipídios e hemograma iniciam sem limites universais.
- [x] Filtros por preenchimento, alerta e ausência de classificação.
- [x] Campos de adesão, barreiras, autocuidado, metas e retorno.
- [ ] Validar limites, unidades e linguagem dos alertas com profissional habilitado e protocolos locais.
- [ ] Verificar interpretação por idade, gestação, método e condições clínicas sem inferência automática.
- [ ] Realizar teste de ponta a ponta no navegador com dados fictícios.

## Etapa 3 — Outros módulos clínicos
- [x] Existem módulos de pré-natal, DIU, implante, puericultura, citopatológico, TO e receituário.
- [ ] Homologar textos e fluxos de cada módulo com profissionais responsáveis.
- [ ] Verificar impressão física do receituário e acessibilidade de formulários.

## Etapa 4 — Design, acessibilidade e desempenho
- [x] Estilos responsivos e testes DOM existentes.
- [ ] Auditar teclado, foco, leitores de tela, contraste e navegação móvel.
- [ ] Medir desempenho real em dispositivos de entrada e otimizar gargalos.

## Etapa 5 — Publicação e entrega
- [x] Workflow de GitHub Pages com verificação de sintaxe e testes.
- [x] Verificação automática de que assets locais do HTML entram no pacote publicado.
- [ ] Confirmar sucesso do deploy e abrir a URL pública em navegador.
- [ ] Homologar o sistema com dados fictícios, registrar responsável e versão aprovada.

## Condições para considerar o projeto concluído
1. Testes automatizados e verificações de publicação aprovados.
2. Teste real em desktop e celular sem erros impeditivos.
3. Revisão e aceite clínico documentados para cada módulo.
4. Conferência de segurança e privacidade, inclusive autenticação e ausência de dados sensíveis em repositório/logs.
5. Publicação acessível e fluxos principais homologados.

Não usar alertas laboratoriais como diagnóstico ou decisão clínica automática.
