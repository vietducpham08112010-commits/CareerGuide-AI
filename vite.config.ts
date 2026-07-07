import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) {
                  return 'export-utils';
                }
                if (id.includes('lucide-react')) {
                  return 'icons';
                }
                if (id.includes('firebase')) {
                  return 'firebase-sdk';
                }
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      define: {
        // API keys are now handled on the server side
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
