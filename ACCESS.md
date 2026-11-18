# Acesso e limites operacionais — versão vigente

Atualizado em 18/11/2026. Este documento substitui as descrições históricas de acesso compartilhado local.

## Arquitetura atual verificada no código
- `index.html` carrega `supabase.min.js` e `auth.js`.
- O login utiliza usuário e senha e consulta a função `username-login` do Supabase antes de validar a sessão.
- A interface não deve ser tratada como mecanismo isolado de segurança; a autorização efetiva depende das políticas e configurações do serviço remoto.
- Rascunhos clínicos permanecem na memória da página. O sistema não deve armazenar pacientes no repositório, nos testes, no serviço de autenticação ou em logs.
- Textos copiados, impressões, imagens exportadas e dispositivos compartilhados ficam fora do controle do aplicativo.

## Bloqueadores de homologação institucional
1. Responsável técnico/clínico identificado, com aprovação documentada dos modelos e protocolos locais.
2. Responsável pela proteção de dados confirma o fluxo, permissões, logs, retenção, incidentes e adequação à LGPD.
3. Administrador do Supabase confirma usuários autorizados, segurança da função de login, proteção contra abuso, política de senhas e revogação de sessão.
4. Testes reais com usuários de teste em Android/Chrome, iPhone/Safari e desktop, incluindo teclado, leitores de tela e perda de conexão.
5. Teste de impressão física com a impressora e configuração da unidade.
6. Aprovação formal da versão publicada, com data, responsáveis e evidências.

## Proibições de uso
- Não registrar dados identificáveis de pacientes nos testes, no GitHub ou em relatórios públicos.
- Não considerar o sistema um prontuário eletrônico validado, nem usar alertas como diagnóstico, prescrição ou decisão automática.
- Não declarar homologação institucional com base apenas em testes automatizados.

## Registro de aceite
- Versão aprovada: **pendente**
- Responsável clínico: **pendente**
- Responsável por segurança/privacidade: **pendente**
- Testes em dispositivos reais: **pendente**
- Homologação institucional: **não concedida**
