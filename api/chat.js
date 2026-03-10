export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Enforce internal API key to prevent public abuse
    const providedKey = req.headers['x-internal-api-key'];
    if (!providedKey || providedKey !== process.env.VITE_INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid internal API key.' });
    }

    const baseUrl = process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL;
    if (!baseUrl) {
        return res.status(500).json({ error: 'Server misconfiguration: Missing N8N_BASE_URL.' });
    }

    const endpoint = `${baseUrl}/signal/chat`;

    try {
        const fetchRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        if (!fetchRes.ok) throw new Error(`Upstream chat failed: ${fetchRes.status}`);

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Chat Proxy Error:", err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
