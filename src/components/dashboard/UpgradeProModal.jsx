import React, { useState } from 'react'
import { Button } from '../ui/Button'
import {
    Crown,
    Check,
    X,
    Sparkles,
    Loader2,
    AlertCircle,
    ShieldCheck,
} from 'lucide-react'

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export function UpgradeProModal({ isOpen, onClose, user, onUpgradeSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleStartCheckout = async () => {
        setError('')
        setLoading(true)

        try {
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                throw new Error('Could not load Razorpay checkout. Check your connection.')
            }

            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id }),
            })

            const orderData = await orderRes.json()
            if (!orderRes.ok) {
                throw new Error(orderData.error || 'Failed to start checkout.')
            }

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'ArtNova Pro',
                description: 'Unlimited AI Studio & Pro Creator Membership',
                order_id: orderData.orderId,
                prefill: {
                    name: user?.user_metadata?.full_name || 'Creator',
                    email: user?.email || '',
                },
                theme: {
                    color: '#8B5CF6',
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                userId: user?.id,
                                userName: user?.user_metadata?.full_name || 'Creator',
                            }),
                        })

                        const verifyData = await verifyRes.json()
                        if (!verifyRes.ok) {
                            throw new Error(verifyData.error || 'Payment verification failed.')
                        }

                        setLoading(false)
                        onUpgradeSuccess()
                        onClose()
                    } catch (verifyErr) {
                        setError(verifyErr.message)
                        setLoading(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                    },
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function (resp) {
                setError(resp?.error?.description || 'Payment failed. Please try again.')
                setLoading(false)
            })
            rzp.open()
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#171725] border border-[#8B5CF6]/40 p-6 sm:p-8 shadow-2xl space-y-6">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-[#9490A8] hover:text-white hover:bg-white/5 cursor-pointer"
                    aria-label="Close upgrade modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-xs font-bold text-amber-300">
                        <Crown className="w-3.5 h-3.5" />
                        <span>ARTNOVA PRO</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                        Unlock Unlimited Creative Power
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9490A8]">
                        Scale your collaborations with unlimited AI matchmaking, priority discovery visibility, and verified Pro status.
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#101019] border border-[#8B5CF6]/30 flex items-baseline justify-between">
                    <div>
                        <span className="text-3xl font-extrabold text-white font-['Outfit']">
                            ₹199
                        </span>
                        <span className="text-xs text-[#9490A8] ml-1.5">/ month</span>
                    </div>
                    <span className="text-[11px] text-[#A78BFA] font-medium">
                        Google Pay · UPI · Cards · Netbanking
                    </span>
                </div>

                <ul className="space-y-3 text-xs text-[#F4F0FF]/90">
                    {[
                        'Unlimited ArtNova AI Matchmaker & Creative Coach runs (Free is capped at 3)',
                        'Verified PRO Creator badge across your profile and dashboard',
                        'Priority visibility when creators search for collaborators',
                        'Unlimited portfolio showcases and active collaboration workspaces',
                    ].map((perk) => (
                        <li key={perk} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                            <span>{perk}</span>
                        </li>
                    ))}
                </ul>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-3 pt-1">
                    <Button
                        variant="primary"
                        size="md"
                        icon={loading ? Loader2 : Sparkles}
                        onClick={handleStartCheckout}
                        disabled={loading}
                        className="w-full justify-center"
                    >
                        {loading ? 'Opening Secure Checkout...' : 'Upgrade to ArtNova Pro — ₹199'}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9490A8]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Secured by Razorpay · Instant activation</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpgradeProModal