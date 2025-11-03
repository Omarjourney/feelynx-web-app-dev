import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/users': { target: 'http://localhost:3001', changeOrigin: true },
      '/posts': { target: 'http://localhost:3001', changeOrigin: true },
      '/payments': { target: 'http://localhost:3001', changeOrigin: true },
      '/subscriptions': { target: 'http://localhost:3001', changeOrigin: true },
      '/payouts': { target: 'http://localhost:3001', changeOrigin: true },
      '/livekit': { target: 'http://localhost:3001', changeOrigin: true },
      '/creators': { target: 'http://localhost:3001', changeOrigin: true },
      '/stream': { target: 'http://localhost:3001', changeOrigin: true },
      '/gifts': { target: 'http://localhost:3001', changeOrigin: true },
      '/rooms': { target: 'http://localhost:3001', changeOrigin: true },
      '/moderation': { target: 'http://localhost:3001', changeOrigin: true },
      '/control': { target: 'http://localhost:3001', changeOrigin: true },
      '/presence': { target: 'http://localhost:3001', changeOrigin: true },
      '/calls': { target: 'http://localhost:3001', changeOrigin: true },
      '/toys': { target: 'http://localhost:3001', changeOrigin: true },
      '/patterns': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
}));
