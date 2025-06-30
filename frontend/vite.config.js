import path from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = Number(env.VITE_PORT || 5173)
  const HOST = env.VITE_HOST || '0.0.0.0'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/dist/**'],
      },
      // hmr: {
      //   protocol: 'ws',
      //   host: HMR_HOST,
      //   port: HMR_PORT,
      // },
    },
  }
})
