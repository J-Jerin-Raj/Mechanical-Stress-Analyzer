import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['mechanical-stress-analyzer-kits.up.railway.app'] // Replace with your actual Railway URL
  }
})
