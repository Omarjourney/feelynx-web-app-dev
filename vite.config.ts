import { defineConfig } from 'vite';
let react: any;
try {
  // Use require inside try/catch to avoid TypeScript resolving the module at compile time.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const pkg = require('@vitejs/plugin-react-swc') as any;
  react = pkg?.default ?? pkg ?? (() => undefined);
} catch {
  // Fallback to a no-op plugin factory so TS and runtime won't fail if the package is missing.
  react = () => (() => undefined);
}
import path from 'path';

// Try to load lovable-tagger at runtime so TypeScript won't error if it's not installed.
// If the package is missing, use a no-op fallback.
let componentTagger: any;
try {
  // Use require inside try/catch to avoid TypeScript resolving the module at compile time.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const pkg = require('lovable-tagger') as any;
  componentTagger = pkg?.componentTagger ?? (() => undefined);
} catch {
  componentTagger = () => undefined;
}

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
