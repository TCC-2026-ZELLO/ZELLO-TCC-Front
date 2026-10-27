/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    ...(process.env.VITEST ? [] : [devtools()]),
    solidPlugin({ hot: !process.env.VITEST }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
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
});
