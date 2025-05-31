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
      '@components': path.resolve( './src/components' ),
      '@logic': path.resolve( './src/logic' ),
      '@stores': path.resolve( './src/stores' ),
      '@graphTypes': path.resolve( './src/types' ),
      '@hooks': path.resolve( './src/hooks' ),
      '@utils': path.resolve( './src/utils' ),
      '@core': path.resolve( './src/components/core' ),
      '@nodes': path.resolve( './src/components/nodes' ),
      '@edges': path.resolve( './src/components/edges' ),
      '@projects': path.resolve( './src/components/projects' ),
      '@rules': path.resolve( './src/components/rules' ),
      '@toolbar': path.resolve( './src/components/toolbar' ),
      '@sidebar': path.resolve( './src/components/sidebar' ),
      '@nodeTemplates': path.resolve( './src/components/nodes/node_templates' ),
    },
  },
  optimizeDeps: {
    include: [ 'use-sync-external-store', 'use-sync-external-store/shim/with-selector.js' ]
  },
} )
