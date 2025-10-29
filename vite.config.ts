import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/livekit': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/creators': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
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
