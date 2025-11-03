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
// Bundle visualizer for analysis
let visualizer: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const pkg = require('rollup-plugin-visualizer') as any;
  visualizer = pkg?.default ?? pkg ?? (() => undefined);
} catch {
  visualizer = () => undefined;
}
// Optional image optimization plugin
let viteImagemin: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const imgPkg = require('vite-plugin-imagemin') as any;
  viteImagemin = imgPkg?.default ?? imgPkg ?? null;
} catch {
  viteImagemin = null;
}

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
    // Using default Rollup chunking for now to avoid runtime ordering issues found in production bundles.
    // If needed we can reintroduce a safer manualChunks strategy that groups react + react-dom + closely-coupled libs.
    rollupOptions: {},
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  plugins: [
  // Ensure the SWC react plugin uses the automatic JSX runtime to match
  // the project's TypeScript setting (tsconfig.app.json: "jsx": "react-jsx").
  // This avoids the plugin inserting legacy/classic React imports that can
  // conflict with existing imports in files.
  react({ jsxRuntime: 'automatic' }),
    mode === 'development' && componentTagger(),
    process.env.ANALYZE === 'true' ? visualizer({ filename: 'dist/stats.html' }) : null,
    mode === 'production' && viteImagemin
      ? viteImagemin({
          gifsicle: { optimizationLevel: 7, interlaced: false },
          optipng: { optimizationLevel: 7 },
          mozjpeg: { quality: 75 },
          pngquant: { quality: [0.7, 0.9], speed: 4 },
          svgo: { plugins: [{ removeViewBox: false }] },
        })
      : null,
  ].filter(Boolean),
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
