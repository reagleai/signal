export default async function handler(req, res) {
    // Enforce internal API key to prevent public abuse
    const providedKey = req.headers['x-internal-api-key'];
    if (!providedKey || providedKey !== process.env.VITE_INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid internal API key.' });
    }

    const baseUrl = process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL;
    if (!baseUrl) {
        return res.status(500).json({ error: 'Server misconfiguration: Missing N8N_BASE_URL.' });
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
            throw new Error(`Upstream failed: ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Metrics KPI Proxy Error:", err);
        return res.status(500).json({ error: err.message });
    }
}
