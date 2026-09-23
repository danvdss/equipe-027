# EQUIPE 027

Ferramenta estática para gerar evoluções de enfermagem, registros LAB e preencher o receituário de Lagarto/SE.

## Recursos
- Evolução geral, hipertensão, diabetes, HAS + DM e pré-natal.
- Cálculo da idade gestacional por DUM ou USG.
- Texto editável e cópia para o sistema oficial.
- Receituário em duas vias, impressão e exportação PNG.

## Uso
Abra `index.html` por um servidor HTTP local ou pelo GitHub Pages. Login de demonstração: `equipe27`; senha: `e27`. Esse formulário não constitui autenticação segura.

Os dados preenchidos ficam somente na memória da página e são apagados ao sair ou recarregar. Nenhum banco de dados ou serviço de IA é necessário. Textos e arquivos exportados devem ser revisados pelo profissional.

## Publicação no GitHub Pages
Em Settings → Pages, selecione Deploy from a branch, branch `main` e pasta `/ (root)`, depois Save. Todos os recursos usam caminhos relativos.

## Estrutura
- `index.html`, `style.css`: interface principal.
- `app.js`, `notes.js`, `prenatal.js`: formulários, modelos e cálculos.
- `receituario.html`: modelo de receituário integrado.
- `html2canvas.min.js`: exportação PNG; licença original incluída no arquivo.

Não envie preenchimentos clínicos nem dados de pacientes ao repositório.

## Solicitação de Implanon

A aba Implanon reúne história menstrual e obstétrica, contracepção, avaliação de possibilidade de gestação, antecedentes, medicamentos, testes rápidos, orientações, consentimento, avaliação de vulnerabilidade e situação da solicitação. A evolução usa apenas os dados informados e não registra inserção nem decide elegibilidade. Pontuação de vulnerabilidade é transcrita com identificação do instrumento local; não há cálculo ou corte presumido.

Referências consultadas em 23/09/2026: Manual do Ministério da Saúde para inserção do implante subdérmico (versão preliminar 2025, disponível na ESPPE) e Nota Técnica Conjunta 419/2025. Links no formulário. Confirmar protocolo municipal vigente.
