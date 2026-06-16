import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 65002,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:32001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
