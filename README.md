# Diretório de ramais com banco JSON — cópia de revisão

## O que mudou
- Todos os contatos foram extraídos das três páginas HTML recebidas e reunidos em `ramais.json`.
- As páginas `index.html`, `habt.html` e `geral.html` mantêm a estrutura visual e carregam seus registros a partir do JSON.
- `data-loader.js` monta as tabelas, busca, filtros e contagem de resultados.
- Quantidade extraída: SADS 98, Habitação 59, Geral 11 (168 registros no total).

## Executar no Windows
1. Extraia todo o ZIP para uma pasta.
2. Dê dois cliques em `run.bat`. É necessário ter Python 3 instalado.
3. O navegador abrirá `http://127.0.0.1:8765/index.html`.

Não abra as páginas com duplo clique diretamente no HTML: o navegador bloqueia o `fetch` do JSON em `file://`. Use `run.bat`.

## Como atualizar os dados
Edite `ramais.json` com um editor de texto, mantendo a estrutura JSON válida. As três seções são `sads`, `habitacao` e `geral`. No GitHub Pages, os dados são somente leitura para os visitantes; para publicar alterações, envie o JSON atualizado ao repositório.

Esta é uma cópia de revisão. Nada foi publicado nem alterado no site original.
