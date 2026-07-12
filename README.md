# DIFF-FOLLOWERS

Ferramenta web para descobrir quem deixou de te seguir no Instagram, comparando dois arquivos `followers_1.html` exportados em datas diferentes. Todo o processamento acontece no navegador — nenhum dado é enviado a um servidor.

**Deploy:** [diff-followers.netlify.app](https://diff-followers.netlify.app/)

## Como usar

1. No Instagram, exporte seus seguidores em **Configurações → Sua atividade → Baixar suas informações** (formato HTML).
2. Guarde a exportação com a data no nome do arquivo (ex: `followers_2026-07.html`) para facilitar comparações futuras.
3. Repita o processo em uma data posterior.
4. Na ferramenta, envie a exportação mais antiga na caixa **Exportação anterior** e a mais recente em **Exportação atual** (clique ou arraste o arquivo).
5. Clique em **Comparar** para ver quem deixou de te seguir e quem passou a seguir.

## Rodando o projeto

Requer [Node.js](https://nodejs.org/) e [Yarn](https://yarnpkg.com/).

```bash
yarn install   # instala as dependências
yarn dev       # inicia o servidor de desenvolvimento (abre o navegador automaticamente)
yarn build     # gera a build de produção em dist/
yarn preview   # serve a build de produção localmente
```

## Qualidade de código

```bash
yarn lint           # roda o ESLint
yarn format         # formata o projeto com o Prettier
yarn format:check   # verifica a formatação sem alterar arquivos
```

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
