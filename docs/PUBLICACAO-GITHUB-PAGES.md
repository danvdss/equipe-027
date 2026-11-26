# Publicação integrada no GitHub Pages — Equipe-027 + Projeto-TO

## Arquitetura

O único site público de interface é `https://danvdss.github.io/equipe-027/`. O login e todos os demais módulos são do Equipe-027. Em Terapia Ocupacional, a home original animada do Projeto-TO é carregada no mesmo domínio a partir de `./ot-embedded/projeto-to-embedded.js`. O botão **Entrar na plataforma** abre diretamente as ferramentas, sem segundo formulário de autenticação.

O código-fonte React do Projeto-TO continua no repositório privado `danvdss/projeto-to`. Apenas o **JavaScript cliente compilado e auditado** e um manifesto com SHA-256 são comitados no repositório público do Equipe-027. O GitHub Pages distribui esse JavaScript publicamente: qualquer visitante poderá obtê-lo ou analisá-lo. Nunca incluir senhas, tokens privados, dados reais, código do backend ou segredos no pacote.

O Supabase do Equipe-027 continua responsável pelo login e pelas regras de autorização. **GitHub Pages não fornece SSO nem autenticação de arquivos estáticos.** A interface não substitui segurança de backend. O Projeto-TO incorporado não faz cadastro, salvamento ou consulta de pacientes.

## Como uma atualização do Projeto-TO chega ao Pages

As alterações de código são desenvolvidas, revisadas e testadas **no repositório privado**. O responsável então deve:

1. Garantir que o checkout privado do Projeto-TO está num commit Git aprovado e limpo.
2. No checkout público da branch de integração do Equipe-027, executar `npm run stage:to`. Esse comando executa o build privado, rejeita referências ao antigo banco de pacientes e copia **somente** `ot-embedded/projeto-to-embedded.js`. Registra no `ot-embedded/bundle-manifest.json` o commit de origem, tamanho e SHA-256 exatos.
3. Executar `npm run check`, `npm test` e `npm run verify:to`. A última verificação precisa rejeitar qualquer mudança no pacote não acompanhada da atualização do manifesto.
4. Revisar as alterações antes de enviar ao PR do Equipe-027. Conferir que arquivos clínicos, segredos, `.env`, tokens, sourcemaps e fontes TSX não estão na lista do commit.
5. Após aprovação e merge no `main`, o GitHub Actions executará o teste de qualidade, verificará o SHA-256 e criará um único artefato para GitHub Pages, incluindo os arquivos do Equipe-027 e do Projeto-TO.

**Não é necessária a criação de um token secreto entre repositórios para publicar:** a compilação é feita num checkout local autorizado e o pacote cliente aprovado é versionado junto ao Equipe-027. O Pages sempre publica exatamente o pacote inspecionado no PR.

## Proteções do pipeline

- O artefato público inclui THIRD-PARTY-NOTICES.md; revisar avisos quando atualizar dependências ou bundle.

- A pasta `ot-embedded/` só permite rastrear os dois arquivos de distribuição autorizados.
- `prepare-private-to.cjs` verifica a origem privada, o commit limpo e bloqueia bibliotecas Node e referências ao banco de pacientes no pacote.
- `verify-pages-to.cjs` confirma integridade por SHA-256, tamanho e proveniência.
- `pages-bundle.test.cjs` testa tentativas de adulteração e a inclusão no pipeline.
- O workflow `.github/workflows/quality.yml` só publica após aprovação dos testes; eventos de PR **não** publicam.
- O caminho relativo `./ot-embedded/projeto-to-embedded.js` é compatível com a subpasta `/equipe-027/` do GitHub Pages.

## Verificação de aceitação antes do uso clínico

1. Confirmar que `https://danvdss.github.io/equipe-027/` carrega o login original do Equipe-027.
2. Autenticar com **conta autorizada de homologação**, sem usar dados reais de pacientes.
3. Abrir Terapia Ocupacional; confirmar brasão original, ondas douradas animadas e botão de pausar.
4. Selecionar **Entrar na plataforma** e verificar que o editor abre diretamente, sem novo login.
5. Alternar para **Evolução rápida** e conferir que as outras abas continuam disponíveis.
6. Confirmar que mudar de conta, sair do sistema ou expirar a sessão descarta o rascunho temporário do Projeto-TO.
7. Inspecionar requisições: o módulo TO não deve enviar conteúdo clínico ao Supabase legado, e não deve existir armazenamento de pacientes no navegador.
8. Checar responsividade, navegação por teclado e leitura por tecnologias assistivas.

## Limites e reversão

- Os registros históricos do banco antigo do Projeto-TO não são alterados nem excluídos pela migração de hospedagem.
- O Vercel poderá permanecer apenas como histórico de homologação até a aprovação definitiva. Não é necessário para a interface pública do Pages.
- Em caso de regressão, usar o GitHub Actions para publicar novamente um **commit anterior validado** ou reverter o PR. Não usar `git push --force` para reescrever `main`.
- Em ambiente real, a publicação da interface não equivale à homologação institucional, clínica ou LGPD.


## Atualização visual da página inicial — 21/11/2026

- Os **13 blocos** da página inicial ganharam ícones SVG distintos para cada módulo (evolução, citopatológico, puericultura, TO, renovação, hipertensão, diabetes, acompanhamento combinado, pré-natal, implante, DIU, exames e receituário).
- O novo CSS `dashboard-cards.css` isola a identidade visual dos blocos: paleta por área, símbolo ampliado ao fundo, halo discreto, entrada escalonada, flutuação lenta e destaque ao passar o mouse.
- Os elementos interativos continuam sendo botões com `data-nav` originais; nenhuma função ou formulário foi substituído.
- Botões têm foco visível para navegação por teclado, contraste elevado e comportamento estático em `prefers-reduced-motion: reduce` ou no modo de cores forçadas.
- Em celulares de até 600 px, os cards usam linhas compactas, ícone destacado e texto com boa leitura; não há rolagem lateral.
- No Projeto-TO, a home original com brasão animado foi preservada, mas foram removidos os dois botões **Sobre o projeto** e o acesso duplicado no cabeçalho. Restou somente o botão principal **Entrar na plataforma**, que valida silenciosamente a sessão do Equipe-027.
- Os testes simulados no Edge, em 1440 e 390 px, verificaram os 13 cards, os 13 símbolos únicos e o caminho completo de Terapia Ocupacional até o editor, sem erros de execução ou carregamentos ausentes.
- Novo ciclo de release `2026.11.22` para atualização de cache dos recursos estáticos no GitHub Pages.
