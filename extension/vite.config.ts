import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import stripBigIcons from './vite.plugins/stripBigIcons';

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    stripBigIcons()
  ],

  // copy src/assets → dist/assets
  publicDir: 'src/assets',

  build: {
    target: 'chrome117',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
        options: 'src/options/options.html',
        content: 'src/content/content.js',
        background: 'src/background/background.js',
      },
      output: {
        format: 'es',
        manualChunks: undefined
      }
    }
  }
});
