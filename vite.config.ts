import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: 'treemap', // or 'sunburst'
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@headlessui/react', '@heroicons/react'],
          'vendor-editor': ['@monaco-editor/react'],
          'vendor-db': ['@supabase/supabase-js', '@supabase/ssr'],
          'vendor-utils': ['js-confetti', 'sanitize-html', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild'
  }
})