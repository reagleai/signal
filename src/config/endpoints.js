// n8n webhook endpoints
// Set VITE_N8N_BASE_URL in .env to override (e.g. https://your-n8n.example.com)
const BASE = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678/webhook';

export const endpoints = {
    // Phase 1 — Data Status (POST to this endpoint both for load and re-sync)
    dataSources: `${BASE}/api-data-sources-sync`,
    sync: `${BASE}/api-data-sources-sync`,

    // Phase 2 — Metrics
    metrics: `${BASE}/signal-kpi-simple`,
    metricsCharts: `${BASE}/signal-metrics-charts`,

    // Phase 3 — Insights
    insights: `${BASE}/signal-insights`,

    // Deferred — keep on mock
    feedback: null,  // DEFERRED
    chat: null,  // DEFERRED
}
