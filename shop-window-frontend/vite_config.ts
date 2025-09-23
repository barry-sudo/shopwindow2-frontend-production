import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'google-maps': ['@googlemaps/react-wrapper']
        }
      }
    }
  },
  
  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/styles': path.resolve(__dirname, './src/styles')
    }
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || ''),
    'process.env.REACT_APP_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@googlemaps/react-wrapper']
  }
})