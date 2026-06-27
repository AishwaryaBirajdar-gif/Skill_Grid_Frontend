import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // ✅ Crucial for SockJS / STOMP to work in the browser
    global: 'window',
  },
  server: {
    // ✅ Essential for fixing HMR and WebSocket connection errors
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    port: 5173,
    strictPort: true,
    // Optional: Proxy setup if you want to avoid CORS issues with your Spring Boot backend
    proxy: {
      '/api': {
        target: 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },
})