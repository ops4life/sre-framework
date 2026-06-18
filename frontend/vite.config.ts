import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: { outDir: 'dist' },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
