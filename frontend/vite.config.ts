import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      reportsDirectory: 'coverage',
    },
  },
});
