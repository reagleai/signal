export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Fallback securely checking the Server env first, then legacy Vite env
    const baseUrl = process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL || 'https://n8n-fastest.protonaiagents.com/webhook';
    const endpoint = `${baseUrl}/signal/run`;

    // Strip callback_url and other internal mechanisms from frontend payload
    const safeBody = { ...req.body };
    delete safeBody.callback_url;

    try {
        const fetchRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeBody)
        });

        if (!fetchRes.ok) {
            throw new Error(`Upstream webhook failed: ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("AI Insights Proxy Error:", err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
