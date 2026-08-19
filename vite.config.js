import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
  const frontendUrl = (env.FRONTEND_URL || '').replace(/\/$/, '')
  const backendUrl = (env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')
  const apiBase =
    env.VITE_API_BASE_URL
    || (backendUrl ? `${backendUrl}/api` : 'http://localhost:5000/api')

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3-')) return 'charts';
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
              if (id.includes('framer-motion')) return 'motion';
            }
          }
        }
      }
    },
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.FRONTEND_URL': JSON.stringify(frontendUrl),
      'import.meta.env.BACKEND_URL': JSON.stringify(backendUrl),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase.replace(/\/$/, ''))
    }
  }
})
