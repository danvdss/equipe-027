# Acesso e limites operacionais

Acesso atual (2026.09.24.4): credencial compartilhada local, restaurada por solicitação explícita do responsável. A interface não exibe login/senha. Essa verificação no navegador é apenas uma barreira visual: os scripts e arquivos do GitHub Pages são públicos. Não tratar esse modo como autenticação segura nem usá-lo para proteger APIs ou dados remotos.

O Supabase não é carregado pela página neste modo. O projeto `equipe-027` e a conta anteriormente convidada continuam existentes; nenhum recurso ou usuário foi excluído. Os arquivos da integração por convite permanecem no repositório, mas estão desconectados da interface. Seus testes são mantidos para eventual retomada.

Não adicionar dados de pacientes ao repositório, aos testes ou aos arquivos de calibração. Os formulários atuais usam memória temporária, sem banco de pacientes. Textos copiados, impressões e PNGs ficam fora do controle da plataforma. Recarregar, sair ou iniciar novo atendimento apaga o estado local. A confirmação de saída depende do suporte do navegador e não impede encerramento forçado pelo sistema.

## Verificações pendentes fora deste ambiente

- Aprovação dos modelos pelo responsável clínico e identificação do protocolo institucional adotado.
- Testes em Android/Chrome e iPhone/Safari reais, incluindo teclado, rotação, área segura, compartilhamento e impressão.
- Calibração de impressão com a impressora e as configurações de escala do serviço.
- Para futuramente retomar autenticação real, reativar e validar a integração e definir as contas autorizadas.

Versão funcional: 2026.09.24.4. Não há decisão automatizada de elegibilidade, prescrição ou aprovação clínica.
