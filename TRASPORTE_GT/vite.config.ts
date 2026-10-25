import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Modo "movil" (npm run dev:movil): HTTPS con certificado propio y abierto en la red local, para usar la cámara
  // del celular en el abordaje (el navegador solo la permite en https:// o localhost). El celular no llega al
  // gateway por localhost, así que /v1 pasa por este servidor (mismo origen: sin CORS ni contenido mixto).
  const movil = mode === 'movil'
  const gateway = loadEnv(mode, process.cwd(), '').GATEWAY_URL || 'http://localhost:8080'

  return {
    plugins: movil ? [react(), basicSsl()] : [react()],
    server: {
      port: 5173,
      strictPort: true,
      host: movil,
      proxy: {
        '/v1': {
          target: gateway,
          changeOrigin: true,
          // El gateway valida CORS por Origin; detrás del proxy la petición es del mismo origen
          configure: (proxy) => proxy.on('proxyReq', (peticion) => peticion.removeHeader('origin')),
        },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
})
