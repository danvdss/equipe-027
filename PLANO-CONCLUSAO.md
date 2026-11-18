# Equipe-027 — Plano de conclusão e critérios de aceite

Atualizado em 18/11/2026. Este arquivo registra evidências técnicas; não equivale a homologação clínica.

## Etapa 1 — Base, acesso e registros
- [x] Navegação, integração de autenticação por Supabase no código, rascunhos em memória e limpeza por novo atendimento; configuração remota ainda requer auditoria.
- [x] Anamnese complementar por módulo e inserção explícita no editor.
- [x] Testes automatizados de regressão, inclusive navegação HAS/DM, separação de rascunhos e limpeza no novo atendimento.
- [ ] Homologar o fluxo com profissionais da unidade e testar autenticação em ambiente publicado.
- [ ] Testar login, saída e perda de conexão em dispositivos reais.

## Etapa 2 — Exames e acompanhamento de HAS/DM
- [x] Registros de exames laboratoriais e complementares.
- [x] Conferência contextual com confirmação de unidade e jejum quando aplicável.
- [x] Cartões gráficos com resultados, faixas predefinidas editáveis e confirmação obrigatória do intervalo do laudo para classificação. Faixas ilustrativas não são metas clínicas universais.
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
- [x] Confirmar sucesso do deploy (GitHub Actions 44357281634) e resposta HTTP 200 do site.
- [x] Comparar 18 arquivos publicados com os locais usando SHA-256 após normalização de finais de linha (`npm run smoke:pages`).
- [ ] Homologar visualmente o site em navegador desktop e celular com acesso autenticado.
- [ ] Homologar o sistema com dados fictícios, registrar responsável e versão aprovada.

## Condições para considerar o projeto concluído
1. Testes automatizados e verificações de publicação aprovados.
2. Teste real em desktop e celular sem erros impeditivos.
3. Revisão e aceite clínico documentados para cada módulo.
4. Conferência de segurança e privacidade, inclusive autenticação e ausência de dados sensíveis em repositório/logs.
5. Publicação acessível e fluxos principais homologados.

Não usar alertas laboratoriais como diagnóstico ou decisão clínica automática.

## Evidências técnicas adicionais — 18/11/2026
- Testes de prontidão: presença de autenticação Supabase com validação remota, navegação por teclado, CSS de movimento reduzido, layout móvel e ausência de armazenamento remoto no módulo complementar.
- Estes testes são estáticos/DOM e **não** comprovam conformidade WCAG, segurança do servidor, LGPD ou segurança clínica.
- O documento ACCESS.md foi atualizado para refletir a arquitetura de autenticação efetivamente carregada pela página.
- **Decisão de homologação:** PENDENTE de responsáveis institucionais e testes reais. Não declarar aptidão clínica por conta dos testes automatizados.