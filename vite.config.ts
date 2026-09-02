import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Enable Brotli & Gzip compression for static assets
      compression({
        algorithms: ['gzip', 'brotliCompress'],
        threshold: 1024,
        deleteOriginalAssets: false,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
