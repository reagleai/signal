export default async function handler(req, res) {
    const baseUrl = process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL || 'https://n8n-fastest.protonaiagents.com/webhook';
    const endpoint = `${baseUrl}/api-data-sources-sync`;

    try {
        const fetchRes = await fetch(endpoint, {
            method: req.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
        });

        if (!fetchRes.ok) {
            throw new Error(`Upstream failed: ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        // Safe error logging
        console.error("Data Sources Proxy Error:", err);
        return res.status(500).json({ error: err.message });
    }
}
