# Painel administrativo seguro — diretório de teste

Este pacote adiciona `admin.html` ao site estático e `worker.js` como API privada. O painel permite adicionar, editar e excluir contatos nas três listas do `ramais.json`. A ordenação alfabética é aplicada no painel, no serviço e na exibição pública. Nada foi publicado por este pacote.

## Importante: GitHub Pages não grava arquivos sozinho

O site público é estático. Para gravar no repositório com segurança, o painel chama um Cloudflare Worker. A senha e o token do GitHub ficam como segredos no Worker, nunca em `admin.js`, `admin-config.js` ou no repositório público.

## Configuração (apenas no repositório de teste)

### 1. Criar token do GitHub com acesso mínimo

Crie um fine-grained personal access token restrito **somente ao repositório de teste**, com permissão `Contents: Read and write`. Não use token de todos os repositórios. Cadastre o token como secret `GITHUB_TOKEN` no Cloudflare. Nunca o cole em arquivo do site nem envie no chat.

### 2. Publicar a API no Cloudflare Workers

1. Crie um Worker no painel Cloudflare e publique o conteúdo de `worker.js`.
2. Em **Settings → Variables and Secrets**, configure as variáveis comuns:
   - `GITHUB_OWNER`: `Supote11`.
   - `GITHUB_REPO`: `Teste-2`.
   - `GITHUB_BRANCH`: `main` (ou a branch que publica o site).
   - `GITHUB_FILE_PATH`: `ramais.json` se estiver na raiz.
   - `ALLOWED_ORIGIN`: `https://supote11.github.io` (sem `/Teste-2/`).
3. Configure como **secrets** `GITHUB_TOKEN`, `ADMIN_USER`, `ADMIN_PASSWORD` e `SESSION_SECRET`.
   - Configure `ADMIN_USER` como `SADSADM`. Configure `ADMIN_PASSWORD` como a senha inicial escolhida para o painel, mas não salve essa senha em arquivos ou no repositório; prefira trocá-la por uma senha exclusiva mais forte antes de uso real.
   - `SESSION_SECRET` deve ser uma chave aleatória forte, com pelo menos 32 bytes. Não reutilize a senha administrativa.
4. Publique o Worker e copie a URL HTTPS dele.

### 3. Ligar a página ao Worker

Edite `admin-config.js` no repositório de teste e substitua `https://SUBSTITUA-PELA-URL-DO-WORKER` pela URL HTTPS do Worker. Este arquivo contém apenas a URL pública do serviço, nunca segredos.

### 4. Publicar no GitHub Pages de teste

Envie os arquivos do pacote para a raiz do **repositório de teste já publicado**: arquivos originais do pacote, `admin.html`, `admin.js`, `admin-config.js`, `worker.js` (o Worker deve ser publicado separadamente no Cloudflare) e este README. O `worker.js` no repositório é código-fonte, não contém credenciais.

Abra `https://supote11.github.io/Teste-2/admin.html` (desde que o GitHub Pages esteja habilitado para esse repositório). A página não aparece nos menus públicos, mas o endereço por si só não é controle de segurança: a API exige usuário/senha e token de sessão. A autenticação protege as operações de leitura/gravação da API; o JSON público continua visível porque o diretório é público.

## O que o painel faz

- Login com usuário e senha configurados como secrets no Worker.
- Adicionar, editar e excluir registros em SADS, Habitação e Geral.
- Ordenar por nome/equipamento, ignorando diferenças entre maiúsculas/minúsculas e respeitando a ordenação em português.
- Salvar no arquivo JSON com commit na branch configurada.
- Expirar a sessão em quatro horas.

## Testes antes de usar

1. Use somente o repositório de teste e confirme que `GITHUB_REPO` aponta para ele.
2. Tente login com senha incorreta: deve ser recusado.
3. Faça um cadastro de teste e confirme o commit em `ramais.json`.
4. Edite e exclua o registro de teste; confirme cada alteração.
5. Abra as páginas públicas e confirme que a lista está em ordem alfabética.

Não coloque o token do GitHub em nenhum arquivo público. Se ele for exposto, revogue-o imediatamente. Para maior segurança operacional, configure limites de requisição no Cloudflare e ative autenticação multifator na conta GitHub/Cloudflare.
