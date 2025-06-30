import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3060,
      strictPort: true,
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/dist/**'],
      },
      hmr: {
        protocol: 'ws',
        host: '0.0.0.0',
        port: 3069,
      },
    },
  }
})
