import crypto from 'crypto'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!keySecret || !supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({
            error: 'Server payment verification keys are not configured in Vercel.',
        })
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            userName,
        } = req.body || {}

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !userId
        ) {
            return res.status(400).json({ error: 'Incomplete payment payload.' })
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature.' })
        }

        const headers = {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        }

        const patchRes = await fetch(
            `${supabaseUrl}/rest/v1/artist_profiles?id=eq.${userId}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    plan: 'pro',
                    pro_since: new Date().toISOString(),
                }),
            }
        )

        const updatedRows = await patchRes.json()

        if (Array.isArray(updatedRows) && updatedRows.length === 0) {
            const fallbackUsername = `creator_${userId.slice(0, 6)}`
            await fetch(`${supabaseUrl}/rest/v1/artist_profiles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: userId,
                    full_name: userName || 'ArtNova Creator',
                    username: fallbackUsername,
                    plan: 'pro',
                    pro_since: new Date().toISOString(),
                }),
            })
        }

        await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: userId,
                razorpay_order_id,
                razorpay_payment_id,
                amount: 19900,
                currency: 'INR',
                plan: 'pro',
                status: 'captured',
            }),
        })

        return res.status(200).json({ success: true, plan: 'pro' })
    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Payment verification failed.',
        })
    }
}