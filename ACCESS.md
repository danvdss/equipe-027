# Acesso e limites operacionais

A versão estática no GitHub Pages é pública. A tela de login não protege o código nem autentica usuários em servidor. Credenciais não são exibidas na interface nem neste documento; remover o aviso não tornaria o acesso seguro.

Para acesso restrito real, é necessário conectar e configurar um provedor de identidade e uma infraestrutura capaz de impor autorização em servidor. O Supabase foi conectado em 24/09/2026. A consulta retornou zero projetos e a organização disponível “danvdss's Org”. É necessário confirmar a organização de criação e, em seguida, o custo retornado pela ferramenta antes de provisionar o projeto. A implementação depende de conta/projeto autorizado, usuários permitidos, recuperação de acesso e política de sessão. Apenas adicionar um SDK de login ao GitHub Pages não protege os arquivos públicos. A implantação deve incluir hospedagem com controle de acesso ou funções/serviços protegidos; as rotas de dados devem verificar a sessão no servidor.

Não adicionar dados de pacientes ao repositório, aos testes ou aos arquivos de calibração. Os formulários atuais usam memória temporária, sem banco de pacientes. Textos copiados, impressões e PNGs ficam fora do controle da plataforma. Recarregar, sair ou iniciar novo atendimento apaga o estado local. A confirmação de saída depende do suporte do navegador e não impede encerramento forçado pelo sistema.

## Verificações pendentes fora deste ambiente

- Aprovação dos modelos pelo responsável clínico e identificação do protocolo institucional adotado.
- Testes em Android/Chrome e iPhone/Safari reais, incluindo teclado, rotação, área segura, compartilhamento e impressão.
- Calibração de impressão com a impressora e as configurações de escala do serviço.
- Criação do projeto no Supabase conectado, configuração do provedor e definição da lista de usuários autorizados.

Versão funcional: 2026.09.24.1. Não há decisão automatizada de elegibilidade, prescrição ou aprovação clínica.
