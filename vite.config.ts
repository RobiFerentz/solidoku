import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/solidoku/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  test: {
    // One jsdom per worker instead of one per test file. The suite resets
    // modules, globals, and DOM state in beforeEach, so sharing is safe.
    environment: 'jsdom',
    isolate: false,
    pool: 'threads',
    // A single worker means a single jsdom for the whole run.
    fileParallelism: false,
  },
});
