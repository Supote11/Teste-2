# Painel administrativo simples (GitHub Pages)

## O que faz
- Login visual usando `admin.json`.
- Adicionar, editar e excluir registros de SADS, Habitação e Geral.
- Ordenar os registros alfabeticamente.
- Baixar um novo `ramais.json` para enviar manualmente ao GitHub.

## Publicação
1. Envie os arquivos desta pasta para a raiz do repositório `Supote11/Teste-2`.
2. Confirme que `index.html`, `ramais.json`, `admin.html`, `admin.js` e `admin.json` estão na raiz.
3. Ative GitHub Pages em Settings > Pages, branch `main`, pasta `/(root)`.
4. Abra `https://supote11.github.io/Teste-2/admin.html`.
5. Entre com usuário `SADSADM` e a senha definida em `admin.json`.
6. Edite os registros e clique em **Baixar ramais.json atualizado**.
7. No GitHub, abra `ramais.json`, clique no lápis ou use Add file > Upload files para substituí-lo, e confirme o commit.

## Limitação importante
Este é um painel simples, sem autenticação real no servidor. O `admin.json` é público quando o repositório/site é público; qualquer pessoa pode ler as credenciais e o código de login pode ser contornado. Ele **não grava diretamente no GitHub**. As alterações só passam a valer após enviar manualmente o JSON baixado ao repositório. Não reutilize essa senha em outros serviços.

O site oficial não é alterado por este pacote; publique somente no repositório de teste.
