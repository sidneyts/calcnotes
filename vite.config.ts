import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Necessary for Electron to resolve file paths relative to index.html
  build: {
    chunkSizeWarningLimit: 1024, // Increase chunk size warning limit to 1MB
  },
  // Força o Vite a pré-compilar estas dependências, resolvendo problemas de importação no Electron
  optimizeDeps: {
    include: ['mathjs', 'convert-units'],
  },
})

