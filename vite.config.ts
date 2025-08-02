import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { crx } from '@crxjs/vite-plugin';
import { execSync } from 'node:child_process';

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    crx({ manifest: './manifest.json' })
  ],
  build: {
    target: 'chrome117',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: { output: { manualChunks: undefined } }
  }
});

// optimise images after the bundle
execSync('npx ts-node --transpile-only scripts/optimize-images.ts', { stdio: 'inherit' });
