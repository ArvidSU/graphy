import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig( {
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve( './src' ),
    },
  },
  optimizeDeps: {
    include: [ 'use-sync-external-store', 'use-sync-external-store/shim/with-selector.js' ]
  },
} )
