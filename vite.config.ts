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
      '/toys': { target: 'http://localhost:3001', changeOrigin: true },
      '/patterns': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('livekit')) return 'livekit';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'ui-vendor';
            return 'vendor';
          }
          if (id.includes('/src/features/live/')) return 'feature-live';
          if (id.includes('/src/features/groups/')) return 'feature-groups';
          if (id.includes('/src/features/patterns/')) return 'feature-patterns';
          if (id.includes('/src/features/remote/')) return 'feature-remote';
          if (id.includes('/src/features/companions/')) return 'feature-companions';
          if (id.includes('/src/features/contests/')) return 'feature-contests';
        },
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
