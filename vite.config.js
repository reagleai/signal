import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mock the feedback endpoint locally without consuming the post stream (which causes indefinite hangs)
const localFeedbackMock = () => {
  return {
    name: 'local-feedback-mock',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.includes('/api/feedback') && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Mocked successful local feedback request.' }));
          return;
        }
        next();
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const n8nBase = env.N8N_BASE_URL || 'https://n8n-fastest.protonaiagents.com/webhook';

  let targetDomain = 'https://n8n-fastest.protonaiagents.com';
  let basePath = '/webhook';
  try {
    const u = new URL(n8nBase);
    targetDomain = u.origin;
    basePath = u.pathname;
    if (basePath === '/') basePath = '';
  } catch (e) { }

  return {
    plugins: [react(), localFeedbackMock()],
    build: { sourcemap: false },
    server: {
      proxy: {
        '/api/ai-insights': {
          target: targetDomain,
          changeOrigin: true,
          secure: false,
          rewrite: () => `${basePath}/signal/run`
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
        }
      }
    }
  }
})
