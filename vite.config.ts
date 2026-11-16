/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig(({ command }) => ({
  plugins: [
    // v5.0.0-15.2.3: ferramentas de depuração só no servidor de desenvolvimento.
    ...(process.env.VITEST || command !== 'serve' ? [] : [devtools()]),
    solidPlugin({ hot: !process.env.VITEST }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    // Espelha o proxy /api do nginx (mesma origem em dev e produção; v5.0.0-3.3.1).
    proxy: {
      '/api': {
        target: process.env.API_UPSTREAM || 'http://localhost:3001',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'esnext',
    // v5.0.0-15.2.3 / 13.4.7: o build de produção não publica source maps.
    sourcemap: false,
  },
  resolve: {
    // Necessário para que a reatividade do SolidJS funcione corretamente
    // sob o Vitest (que por padrão resolve a condição "node"/"import" e
    // acaba pegando o build de produção do solid-js, quebrando a reatividade
    // fina em testes).
    conditions: ['development', 'browser'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
}));
