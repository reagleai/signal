// Phase 1 — Data Status (POST to this endpoint both for load and re-sync)
export const endpoints = {
    dataSources: '/api/data-sources',
    sync: '/api/data-sources',

    // Phase 2 — Metrics
    metrics: '/api/metrics-kpi',
    metricsCharts: '/api/metrics-charts',

    // Phase 3 — Insights
    insights: '/api/ai-insights',

    // Deferred — keep on mock
    feedback: '/api/feedback',
    chat: null,  // DEFERRED
}
