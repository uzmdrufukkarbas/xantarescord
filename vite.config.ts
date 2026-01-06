import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy ayarları kaldırıldı.
    // App.tsx doğrudan 'http://localhost:3001' adresine bağlandığı 
    // ve server.js CORS ayarlarını yönettiği için proxy'ye gerek yoktur.
  }
})
