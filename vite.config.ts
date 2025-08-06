import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import stripBigIcons from './vite.plugins/stripBigIcons';
import { execSync } from 'node:child_process';

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    stripBigIcons(),

    // run our scripts after the bundle is finished
    {
      name: 'post-build-tasks',
      closeBundle() {
        console.log('🔧 Running post-build image optimization...');
        execSync(
          'TS_NODE_TRANSPILE_ONLY=true node --no-warnings --loader ts-node/esm scripts/optimize-images.ts',
          { stdio: 'inherit' }
        );

        console.log('📝 Copying and adjusting manifest...');
        execSync(
          'TS_NODE_TRANSPILE_ONLY=true node --no-warnings --loader ts-node/esm scripts/update-manifest.ts',
          { stdio: 'inherit' }
        );
      }
    }
  ],

  // copy src/assets → dist/assets
  publicDir: 'src/assets',

  build: {
    target: 'chrome117',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
        options: 'src/options/options.html',
        content: 'src/content/content.js',
        background: 'src/background/background.js',
      },
      output: {
        manualChunks: undefined
      }
    }
  }
});
