import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Only frontend/ is served. Repository data is copied through an explicit allowlist.
  server: { fs: { strict: true } },
  build: {
    rollupOptions: { output: { manualChunks: { charts: ['recharts'] } } },
  },
});
