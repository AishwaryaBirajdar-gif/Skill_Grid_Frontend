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
    // This fixes the "Uncaught ReferenceError: global is not defined" error from SockJS
    global: 'window',
  },
  server: {
    // This fixes the WebSocket / HMR connection errors
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    // Optional: ensures the port stays consistent
    port: 5173,
    strictPort: true,
  }
})