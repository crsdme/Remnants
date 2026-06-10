import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
    sequence: {
      setupFiles: 'list',
    },
  },
})
