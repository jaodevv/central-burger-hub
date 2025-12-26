import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  // Força o uso do plugin React baseado em Babel (seguro para Termux e Web)
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Garante que o build não tente buscar otimizações nativas incompatíveis
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
