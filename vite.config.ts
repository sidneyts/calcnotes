  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    // Força o Vite a pré-compilar estas dependências, resolvendo problemas de importação no Electron
    optimizeDeps: {
      include: ['mathjs', 'convert-units'],
    },
  })

