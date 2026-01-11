import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true, // Automatically opens the app in the browser
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Only apply to .js files in the src directory
  },
});