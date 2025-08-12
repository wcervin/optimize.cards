import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['compression', 'express'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    // Performance optimizations
    chunkSizeWarningLimit: 1000
  },
  // Development optimizations
  server: {
    hmr: true,
    watch: {
      usePolling: false
    }
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@testing-library/react', '@testing-library/jest-dom']
  },
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
});
