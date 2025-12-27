import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  // Define o caminho base como relativo para funcionar perfeitamente em túneis (Serveo)
  base: './',
  // Plugin React baseado em Babel para máxima compatibilidade no Termux
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // Permite que o túnel do Serveo ou outros hosts acessem o servidor de dev
    allowedHosts: [
      '.serveousercontent.com',
      '.serveo.net',
      'localhost',
      '127.0.0.1'
    ],
  },
  build: {
    // Usa Terser para evitar erros de compilação nativa no ambiente Android
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    commonjsOptions: {
      // Corrigido: Garante compatibilidade entre módulos ESM e CommonJS
      transformMixedEsModules: true,
    },
  },
})
