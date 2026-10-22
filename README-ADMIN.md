# Painel administrativo com gravação direta no GitHub

## Configuração
1. Envie os arquivos desta pasta para a raiz do repositório `Supote11/ramais`.
2. Confirme que `index.html`, `ramais.json`, `admin.html`, `admin.js` e `admin.json` estão na raiz.
3. Ative GitHub Pages em Settings > Pages, branch `main`, pasta `/(root)`.
4. Abra `https://supote11.github.io/ramais/admin.html`.
5. Entre com usuário e senha de `admin.json`. Cole também um token fine-grained do GitHub.
6. O token precisa estar limitado ao repositório `ramais`, com `Contents: Read and write`. Não inclua token em arquivo do repositório. Ele é mantido somente na memória da página e apagado ao sair/atualizar.
7. Cadastre/edite/exclua contatos e clique em **Salvar no GitHub**. Isso cria um commit que atualiza `ramais.json` diretamente.

## Aviso
`admin.json` é público em um repositório público, então as credenciais ali são apenas uma barreira visual e podem ser lidas por qualquer pessoa. O token do GitHub é privilegiado: cole-o somente no painel oficial do seu repositório e use um token fine-grained restrito a `ramais`. Não salve o token no código, em JSON, nem em screenshots. Para maior segurança, use autenticação no servidor.

## Limites
- Configurado para proprietário `Supote11`, repositório `ramais`, branch `main` e arquivo `ramais.json`.
- Requer conexão à internet e permissão de gravação no token.
- O site oficial não é alterado por este pacote.
