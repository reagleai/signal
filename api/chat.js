export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const baseUrl = process.env.N8N_BASE_URL;
    if (!baseUrl) {
        console.error("Chat Proxy: N8N_BASE_URL environment variable is not set.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }
    const endpoint = `${baseUrl}/signal/chat`;

    try {
        const fetchRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body || {})
        });

        if (!fetchRes.ok) {
            throw new Error(`Upstream responded with ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Chat Proxy Error:", err);
        return res.status(500).json({ error: 'Failed to process chat request.' });
    }
}
