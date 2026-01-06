import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Sunucunun dışarıdan erişilebilir olmasını sağlar (Container/Cloud için)
    strictPort: true,
    port: 5173
  }
})
