import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { crx } from '@crxjs/vite-plugin';
import { execSync } from 'node:child_process';

import manifest from './manifest.json' assert { type: 'json' };


export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    crx({ manifest })

  ],
  build: {
    target: 'chrome117',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: { output: { manualChunks: undefined } }
  }
});

// optimise images after the bundle
execSync(
  // run with ts-node’s ESM loader so .ts is understood
  'node --no-warnings --loader ts-node/esm scripts/optimize-images.ts',
  { stdio: 'inherit' }
);

