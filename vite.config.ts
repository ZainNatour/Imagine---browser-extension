import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { execSync } from 'node:child_process';
import stripBigIcons from './vite.plugins/stripBigIcons';


export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    stripBigIcons()

  ],
  build: {
    target: 'chrome117',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
        background: 'src/background/background.js',
      },
      output: { manualChunks: undefined }
    }
  }
});

// optimise images after the bundle
execSync(
  // run with ts-node’s ESM loader so .ts is understood
  'node --no-warnings --loader ts-node/esm scripts/optimize-images.ts',
  { stdio: 'inherit' }
);

