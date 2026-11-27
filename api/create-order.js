export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
        return res.status(500).json({
            error: 'Razorpay API keys are missing in Vercel Environment Variables.',
        })
    }

    try {
        const { userId } = req.body || {}
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' })
        }

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const amountInPaise = 19900 // ₹199.00 INR

        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `artnova_${userId.slice(0, 8)}_${Date.now()}`,
                notes: {
                    user_id: userId,
                    plan: 'pro',
                },
            }),
        })

        const order = await rzpRes.json()

        if (!rzpRes.ok) {
            return res.status(rzpRes.status).json({
                error: order?.error?.description || 'Failed to create Razorpay order.',
            })
        }

        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId,
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Unexpected error creating payment order.',
        })
    }
}