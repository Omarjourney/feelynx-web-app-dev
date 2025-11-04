import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

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
      '/toys': { target: 'http://localhost:3001', changeOrigin: true },
      '/patterns': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable all manual chunking
      },
    },
  },
}));
