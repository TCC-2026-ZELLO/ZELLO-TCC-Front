## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

A imagem Docker serve o `dist` com nginx e encaminha `/api` para o backend (mesmo site, cookies `SameSite=Strict`).

| Variável | Momento | Valor em produção |
| :--- | :--- | :--- |
| `VITE_API_URL` | Build | `/api` |
| `API_UPSTREAM` | Execução (nginx) | URL HTTPS do backend |
| `CSP_CONNECT_EXTRA` | Execução (nginx) | Origens extras em `connect-src` da CSP (opcional) |

Cabeçalhos de segurança (CSP, HSTS, `nosniff`, `Referrer-Policy`), allowlist de extensões e bloqueio de arquivos ocultos ficam em `nginx/`. Detalhes e matriz de conformidade OWASP ASVS v5.0.0: `zello-tcc-back/docs/security`.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
