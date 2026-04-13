// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   preview: {
//     allowedHosts: ['mechanical-stress-analyzer-kits.up.railway.app'] // Replace with your actual Railway URL
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  base: '/', 
  preview: {
    host: '0.0.0.0',
    // Railway provides the PORT variable automatically
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    strictPort: true, 
    allowedHosts: true 
  }
})