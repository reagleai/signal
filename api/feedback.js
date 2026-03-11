export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }

    const { name, email, category, description, page } = req.body

    // Server-side validation
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Valid name is required' })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' })
    }
    if (!category) {
        return res.status(400).json({ message: 'Category is required' })
    }

    // Description is optional in V1

    // Retrieve webhook URL from server environment
    const feedbackWebhookUrl = process.env.N8N_FEEDBACK_WEBHOOK;
    if (!feedbackWebhookUrl) {
        console.error("Feedback Proxy: N8N_FEEDBACK_WEBHOOK environment variable is not set.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    // Construct exactly payload requested by the user
    const payload = {
        name,
        email,
        tag: category,
        description: description?.trim() || "",
        page: page || "/",
        submitted_at: new Date().toISOString()
    }

    try {
        const fetchRes = await fetch(feedbackWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!fetchRes.ok) {
            console.error(`Upstream n8n feedback error: ${fetchRes.status}`);
            throw new Error(`Upstream webhook failed: ${fetchRes.status}`);
        }

        return res.status(200).json({ success: true, message: 'Feedback successfully delivered.' })

    } catch (error) {
        console.error('Feedback delivery failed:', error)
        return res.status(500).json({ message: 'Failed to deliver feedback safely.' })
    }
}
