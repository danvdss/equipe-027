# Validação de navegação e evolução temporária — Projeto-TO + Equipe-027

**Data:** 20/11/2026
**Escopo:** rework do Projeto-TO sem cadastro, armazenamento ou histórico clínico.
**Branches de testes:** `projeto-to: feature/e027-embedded-ot-home`; `equipe-027: feature/e027-ot-host`.
**Status:** validação de desenvolvimento, não homologação institucional.

## Entregas verificadas

### 1. Página inicial preservada
- A home mantém o título **“O cuidado tem uma história. Seu registro também.”**, ilustração de órbitas, princípios e botão **Entrar**.
- O Projeto-TO embutido inicia na home e recebe apenas a verificação de identidade do Equipe-027. Não recebe token, cliente Supabase ou dados de pacientes.
- A aba ainda oferece a **Evolução rápida** antiga do Equipe-027.
- O pacote React é servido por um endereço fixo da mesma origem (`ot-embedded/projeto-to-embedded.js`) e montado em Shadow DOM.
- Se o pacote estiver ausente, não ocorre acesso clínico; o usuário pode permanecer na evolução rápida.

### 2. Correção do pacote incorporável
A primeira compilação Vite no modo library mantinha checagens `process.env.NODE_ENV` do React, causando **`ReferenceError: process is not defined`** no navegador. Adicionada substituição de ambiente no arquivo `vite.embedded.config.ts` e criada verificação automática `scripts/verify-embedded.mjs`. Essa verificação é executada por `npm run build:embedded` e falha se o pacote contiver dependência de Node ou referência identificável ao backend histórico de pacientes.

**Prova técnica local:** após a correção, o pacote foi carregado diretamente no navegador Edge, com a home renderizada e sem exceções observadas. O bundle reduziu de aproximadamente 934 KB para 373 KB.

### 3. Testes reais de navegador — dados sintéticos
Ambiente: Microsoft Edge 158, automação via Chrome DevTools Protocol, localhost; desktop e emulação de viewport móvel.

| Tela | Largura | Elementos/fluxos observados | Resultado |
| --- | ---: | --- | --- |
| Home incorporada | 1440 px | Hero, CTA Entrar, Shadow DOM, CSS isolado | Aprovado |
| Home incorporada | 390 px | Página responsiva, botão e textos | Aprovado |
| Home incorporada | 320 px | Página responsiva, botão e textos | Aprovado |
| Editor independente | 1360 px | Campos e evolução lado a lado, digitação gera prévia | Aprovado |
| Editor independente | 390 px | Alternância Campos/Evolução, digitação gera prévia | Aprovado |
| Editor independente | 320 px | Alternância Campos/Evolução, digitação gera prévia | Aprovado |

Nas seis verificações, **sem rolagem horizontal indevida** e sem erros de execução registrados. Os testes usaram apenas relato fictício sem dados pessoais.

Capturas técnicas foram salvas somente no computador de desenvolvimento, em pasta local não versionada; não fazem parte do repositório público.

### 4. Revisão de evoluções e instrumentos
- Evolução em tempo real, SOAP/texto corrido, atividades com nível de assistência e adaptação.
- Registro descritivo dos instrumentos existentes, incluindo **situação do instrumento** e **origem das informações**. Nenhum escore ou diagnóstico é calculado automaticamente.
- Correção de pontuação duplicada para textos terminados em ponto, exclamação ou interrogação.
- **Desfazer/Refazer** de campos, revisões e ações no editor; histórico limitado a 50 mudanças, exclusivamente na memória da página.
- **Nova evolução/Limpar** confirma descarte e elimina também o histórico de Desfazer/Refazer.

### 5. Proteção contra dados persistidos
- O entrypoint ativo não importa pacientes, prontuários, autosave, banco clínico ou anexos.
- O build ativo foi inspecionado para referências de endpoints de Supabase e prontuário, além das regras de CSP que bloqueiam `connect-src` no aplicativo independente.
- Nenhuma gravação foi observada nos testes automatizados de preenchimento. Os testes unitários não substituem uma auditoria de segurança em ambiente implantado.
- A ação de copiar é explícita. A proteção não se estende a dados que o usuário deliberadamente cole em outro sistema.

### 6. Teste do fluxo incorporado após Entrar (identidade **simulada apenas no QA local**)

O módulo React foi montado dentro do shell E027 via pacote same-origin. Uma identidade **fictícia e injetada exclusivamente no navegador de teste**, sem vínculo com conta real, permitiu avançar do CTA **Entrar** até a oficina temporária para verificar o fluxo de interface.

- **1360 px e 390 px:** oficina carregada, digitação refletida na prévia imediatamente, sem rolagem horizontal ou exceções.
- Monitoramento local de requisições de navegador: **nenhuma chamada a endpoints clínicos/Supabase** durante o fluxo testado.
- Nenhum campo de identificação de paciente foi apresentado.
- **Este teste não comprova login real, MFA, autorização institucional ou disponibilidade pública.**

### 7. Regressão automatizada e melhoria do editor

- Projeto-TO: **285 testes aprovados** em 36 arquivos de testes; build Vercel, build Worker/versão standalone, build incorporável e ESLint aprovados.
- Equipe-027: **118 testes aprovados** e checagem da plataforma aprovada.
- Campo de instrumento ampliado para **situação de aplicação** e **origem das informações**, sem cálculo automático de escore.
- Pontuação dos campos textuais revisada: frases com ponto final não ganham segundo ponto.
- **Desfazer/Refazer**, com limite de 50 estados somente em memória e descarte de histórico ao limpar.
- `scripts/verify-embedded.mjs` executado automaticamente depois do build para bloquear referências de Node.js e endpoints históricos de pacientes.

## Limites e pendências

1. **Não há autorização para apagar automaticamente tabelas ou dados anteriores** do Projeto-TO. Inventário de retenção, backups, acessos legados e desativação operacional exigem aprovação e execução separadas.
2. O pacote privado **não** foi incorporado à publicação pública do Equipe-027. Preparar um ambiente de homologação com distribuição privada autorizada; nunca copiar código privado ou segredos para o repositório público sem revisão.
3. Ainda são necessários testes manuais de teclado, leitor de tela, contraste final, impressão e dispositivos móveis físicos.
4. Os instrumentos dependem da confirmação de versão, condições de uso e licenças antes de disponibilizar protocolos completos ou escores.
5. **Homologação clínica, privacidade institucional e liberação para pacientes reais continuam pendentes.**

## Próximo passo recomendado

Implementar uma publicação de testes unificada e privada, com autenticação E027, revisão de segurança e teste E2E em ambiente real. Após a aprovação, manter a evolução temporária como produto ativo e arquivar administrativamente os serviços de prontuário antigos. Somente depois ampliar a biblioteca de instrumentos.
