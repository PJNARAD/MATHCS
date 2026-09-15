import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Preview environments proxy the dev server under sandbox-specific hostnames.
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // KaTeX and the framework change far less often than the content, so
        // splitting them keeps the content bundle small and cacheable.
        manualChunks(id: string) {
          if (id.includes('node_modules/katex')) return 'katex';
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)/.test(id)) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
