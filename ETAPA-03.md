# Etapa 03 — Auditoria inicial de autenticação e privacidade

> Evidência histórica da versão/data indicada, preservada para rastreabilidade. O planejamento vigente e os critérios atuais estão no [ROADMAP.md](ROADMAP.md); não representa homologação atual.


Auditoria de 18 de novembro de 2026 sobre a base da Etapa 02. A revisão abrangeu o cliente web, o código implantado da função de login e os metadados do projeto Supabase correspondente. As consultas administrativas foram somente de leitura. Nenhum prontuário, senha de usuário ou conteúdo de log foi coletado.

| Item verificado | Evidência e resultado |
| --- | --- |
| Cadastro e entrada | A configuração pública do Auth indicou cadastro desativado e confirmação automática de e-mail desativada. Uma tentativa normal de entrada com dados fictícios de conta inexistente recebeu HTTP 401. |
| Verificação de identidade | A função implantada delega a senha ao Supabase Auth. O cliente exige sessão aceita, usuário confirmado pelo servidor e e-mail confirmado antes de abrir a interface. O caminho de sucesso foi testado com respostas simuladas. |
| Permissões e armazenamento | O catálogo mostrou zero tabelas ou visões no schema public e zero funções públicas SECURITY DEFINER executáveis pelos papéis anon ou authenticated. As dez tabelas do schema storage tinham RLS habilitada. Havia zero buckets e zero políticas de Storage. O levantamento descreve a configuração observada na data da revisão. |
| Credenciais no frontend | A varredura dos 23 arquivos de interface revisados buscou chaves privadas, tokens GitHub reconhecíveis, chaves Supabase secretas e JWT com role de serviço. Nenhuma ocorrência desses padrões. O frontend usa chave publicável. |
| Dados temporários | A sessão de autenticação é configurada sem persistência. O aplicativo conserva os rascunhos em memória; a preferência local por favoritos usa identificadores de módulos. Cópias no clipboard e exportações têm ciclo de vida externo ao aplicativo. |
| Encerramento | A limpeza comum agora descarta os dados complementares e cancela janelas de revisão fora do contêiner principal. O fluxo é usado na saída pelo botão e no evento de saída do provedor. |
| Convite e recuperação | A limpeza do fragmento de retorno também ocorre quando a inicialização do SDK falha. Mensagens e testes usam dados fictícios. |

## Validação e pendências

Os testes verificam rejeição, identidade não confirmada, saída com falha de rede, descarte de rascunhos, cancelamento de revisões e remoção do fragmento de retorno. A recusa HTTP 401 foi observada no serviço real. A conclusão do aceite inclui um ciclo real de entrada, recuperação e saída com conta fictícia institucional controlada.

A administração deve revisar o aviso de segurança do Auth, a gestão de identidades individuais, o vínculo administrativo da conta de login e a retenção de registros operacionais. Validação institucional de privacidade pendente: responsáveis pelo tratamento, finalidade e base legal, acesso a cópias e exportações, resposta a incidentes e canal de atendimento ao titular.

Referências: documentação do Supabase Auth para getUser e signOut e orientações de proteção de dados do Ministério da Saúde.
