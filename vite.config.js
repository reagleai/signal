import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const n8nBase = env.N8N_BASE_URL || env.VITE_N8N_BASE_URL;

  let targetDomain = '';
  let basePath = '';
  if (n8nBase) {
    try {
      const u = new URL(n8nBase);
      targetDomain = u.origin;
      basePath = u.pathname;
      if (basePath === '/') basePath = '';
    } catch (e) {
      console.warn("Invalid N8N_BASE_URL configured in environment.", e);
    }
  }

  return {
    plugins: [react()],
    build: { sourcemap: false },
    server: {
      proxy: targetDomain ? {
        '/api/ai-insights': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/signal/run`,
          timeout: 600000,
          proxyTimeout: 600000
        },
        '/api/data-sources': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/api-data-sources-sync`
        },
        '/api/metrics-kpi': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/signal-kpi-simple`
        },
        '/api/metrics-charts': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/signal-metrics-charts`
        },
        '/api/feedback': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `/webhook/feedback-received`
        },
        '/api/chat': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/signal/chat`
        }
      } : {}
    }
  }
})
