import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const n8nBase = env.N8N_BASE_URL;

  if (!n8nBase) {
    console.warn('\x1b[33m⚠ N8N_BASE_URL not set in .env — API proxy routes will not work in dev mode.\x1b[0m');
  }

  let targetDomain = n8nBase ? new URL(n8nBase).origin : 'http://localhost:5678';
  let basePath = '/webhook';
  try {
    if (n8nBase) {
      const u = new URL(n8nBase);
      targetDomain = u.origin;
      basePath = u.pathname;
      if (basePath === '/') basePath = '';
    }
  } catch (e) { }

  return {
    plugins: [react()],
    build: { sourcemap: false },
    server: {
      proxy: {
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
          rewrite: () => `${basePath}/api-data-sources-sync`,
          timeout: 300000,
          proxyTimeout: 300000
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
        }
      }
    }
  }
})
