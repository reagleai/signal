export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }

    const { name, email, category, description } = req.body

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
    if (!description || description.trim().length < 10) {
        return res.status(400).json({ message: 'Description must be at least 10 characters' })
    }

    // Hide the destination email server-side
    const DESTINATION_EMAIL = 'reagleai@gmail.com'

    // Here you would integrate with an email provider SDK like Resend or SendGrid.
    // Because the active Vercel project needs an API credential added, we mock the safe return.
    // Example for Resend:
    // const resendClient = new Resend(process.env.RESEND_API_KEY)
    // await resendClient.emails.send({ ... })

    const MOCK_DELIVERY = true

    try {
        if (MOCK_DELIVERY) {
            // Simulate network delay for UI polish
            await new Promise(resolve => setTimeout(resolve, 800))

            console.log(`[SECURE DEMO] Intended for ${DESTINATION_EMAIL}`)
            console.log(`[SECURE DEMO] Form Payload:`, { name, email, category, description })

            return res.status(200).json({ success: true, message: 'Feedback safely captured (Demo).' })
        }

        // Example actual delivery handler below
        /*
        if (!process.env.RESEND_API_KEY) {
          return res.status(500).json({ message: 'Server configuration error: Email API key missing' })
        }
        
        await deliverySdk.send({
          from: 'feedback@signal-app.com', // Verified domain
          to: DESTINATION_EMAIL,
          subject: `[Signal Feedback] ${category} from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nDescription:\n${description}`,
          reply_to: email
        })
        
        return res.status(200).json({ success: true })
        */

    } catch (error) {
        console.error('Email delivery failed:', error)
        return res.status(500).json({ message: 'Failed to deliver feedback email safely.' })
    }
}
