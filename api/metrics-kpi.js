export default async function handler(req, res) {
    const baseUrl = process.env.N8N_BASE_URL;
    if (!baseUrl) {
        console.error("Metrics KPI Proxy: N8N_BASE_URL environment variable is not set.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }
    const url = new URL(`${baseUrl}/signal-kpi-simple`);

    // Pass query strings safely
    if (req.query) {
        Object.keys(req.query).forEach(key => url.searchParams.append(key, req.query[key]));
    }

    try {
        const fetchRes = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!fetchRes.ok) {
            throw new Error(`Upstream responded with ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Metrics KPI Proxy Error:", err);
        return res.status(500).json({ error: 'Failed to fetch KPI metrics.' });
    }
}
