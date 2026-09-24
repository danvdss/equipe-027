# Acesso e limites operacionais

A plataforma usa Supabase Auth para validar e-mail/senha e recuperar acesso. Projeto `equipe-027` (`lqmvzdibbmbkbexeywwo`), região São Paulo, criado em 24/09/2026 após confirmação do custo informado de US$ 0/mês. Cadastro público e entrada anônima desativados; e-mail confirmado exigido. Contas são criadas por convite no painel. Primeira conta ainda pendente de convite/aceite.

O SDK 2.117.1 é distribuído localmente, com dependência e lockfile fixados. A chave publicada é publishable, sem privilégios de administração. Tokens ficam somente na memória; o logout solicita revogação da sessão atual e apaga rascunhos. Não há senha embutida nem fallback de demonstração. Erros de recuperação não revelam se a conta existe.

GitHub Pages e os arquivos do repositório permanecem públicos. A autenticação identifica o usuário no serviço; ela não impede o download dos scripts estáticos. Não há dados clínicos no servidor. Para disponibilizar dados ou operações protegidas no futuro, cada API deve verificar identidade e autorização no servidor; tabelas expostas precisam de RLS. Não usar a interface como única barreira de autorização.

O SMTP padrão do Supabase é limitado a endereços autorizados da equipe da organização e tem limite de envio. Para outros usuários é necessário configurar SMTP próprio. Não adicionar profissionais à organização administrativa apenas para contornar essa restrição. A recuperação e o aceite precisam ser validados com o e-mail real do titular; os testes automáticos usam simulações e não enviam e-mails.

Não adicionar dados de pacientes ao repositório, aos testes ou aos arquivos de calibração. Os formulários atuais usam memória temporária, sem banco de pacientes. Textos copiados, impressões e PNGs ficam fora do controle da plataforma. Recarregar, sair ou iniciar novo atendimento apaga o estado local. A confirmação de saída depende do suporte do navegador e não impede encerramento forçado pelo sistema.

## Verificações pendentes fora deste ambiente

- Aprovação dos modelos pelo responsável clínico e identificação do protocolo institucional adotado.
- Testes em Android/Chrome e iPhone/Safari reais, incluindo teclado, rotação, área segura, compartilhamento e impressão.
- Calibração de impressão com a impressora e as configurações de escala do serviço.
- Convite e aceite da primeira conta, teste de login com o titular e configuração de SMTP para ampliar a equipe.

Versão funcional: 2026.09.24.3. Não há decisão automatizada de elegibilidade, prescrição ou aprovação clínica.
