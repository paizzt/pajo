import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['1244-36-72-72-19.ngrok-free.app', '.ngrok-free.app']
  }
})
