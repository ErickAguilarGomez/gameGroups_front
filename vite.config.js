import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        // Proxear solo rutas de API al backend
        '/sanctum': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
