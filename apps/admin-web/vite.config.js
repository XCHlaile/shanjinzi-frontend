import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { maintainableBuild } from '../../config/build.mjs'
import { ADMIN_API_ENV_KEYS, NETWORK_CONFIG, resolveBackendOrigin } from '../../config/network.mjs'

const backendTarget = resolveBackendOrigin(process.env, ADMIN_API_ENV_KEYS)

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: false,
      resolvers: [ElementPlusResolver()]
    })
  ],
  build: maintainableBuild,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: NETWORK_CONFIG.adminPort,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true
      }
    }
  }
})
