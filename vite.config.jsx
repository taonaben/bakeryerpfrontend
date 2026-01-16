import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure there is NO 'base' property here, 
  // or if there is, it should be './' or '/'
})