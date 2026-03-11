export default async function handler(req, res) {
    const baseUrl = process.env.N8N_BASE_URL;
    if (!baseUrl) {
        console.error("Data Sources Proxy: N8N_BASE_URL environment variable is not set.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }
    const endpoint = `${baseUrl}/api-data-sources-sync`;

    try {
        const fetchRes = await fetch(endpoint, {
            method: req.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined
        });

        if (!fetchRes.ok) {
            throw new Error(`Upstream responded with ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Data Sources Proxy Error:", err);
        return res.status(500).json({ error: 'Failed to fetch data sources.' });
    }
}
