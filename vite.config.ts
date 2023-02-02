/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'quire-core',
      formats: ['es'],
      fileName: format => `quire-core.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {},
  },
  test: {
    environment: "jsdom"
  }
});
