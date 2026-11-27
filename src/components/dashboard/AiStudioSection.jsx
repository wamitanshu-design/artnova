import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
    Bot,
    Sparkles,
    Users,
    MessageSquare,
    Loader2,
    AlertCircle,
    Copy,
    Check,
    Wand2,
    Crown,
} from 'lucide-react'

const FREE_AI_LIMIT = 3

const COACH_PRESETS = [
    'Write a killer collaboration pitch for a music producer',
    'Break down a 2-week production roadmap for an animated short',
    'How should two independent creators split credits & revenue?',
    'Give me 3 portfolio project ideas to stand out in my field',
]

export function AiStudioSection({ user, isPro, onNavigateTab, onOpenUpgrade }) {
    const [mode, setMode] = useState('matchmaker')
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [creators, setCreators] = useState([])
    const [userProfile, setUserProfile] = useState(null)
    const [aiUses, setAiUses] = useState(0)

    const [matchResult, setMatchResult] = useState(null)
    const [coachReply, setCoachReply] = useState('')
    const [copiedId, setCopiedId] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function loadContext() {
            const { data } = await supabase
                .from('artist_profiles')
                .select(
                    'id, full_name, username, creative_field, experience_level, skills, bio, collaboration_interests, ai_uses_count'
                )

            if (!isMounted || !data) return

            const mine = data.find((p) => p.id === user?.id) || null
            setUserProfile(mine)
            setAiUses(mine?.ai_uses_count || 0)

            const others = data.filter((p) => p.id !== user?.id)
            setCreators(others.length > 0 ? others : data)
        }

        loadContext()
        return () => {
            isMounted = false
        }
    }, [user])

    const handleRunAi = async (e, overridePrompt) => {
        if (e) e.preventDefault()
        const activePrompt = (overridePrompt ?? prompt).trim()
        if (!activePrompt || loading) return

        if (!isPro && aiUses >= FREE_AI_LIMIT) {
            onOpenUpgrade()
            return
        }

        if (overridePrompt) setPrompt(overridePrompt)
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    prompt: activePrompt,
                    creators,
                    userProfile,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get AI response.')
            }

            if (mode === 'matchmaker') {
                setMatchResult(data)
            } else {
                setCoachReply(data.reply)
            }

            const nextCount = aiUses + 1
            setAiUses(nextCount)
            if (user?.id) {
                await supabase
                    .from('artist_profiles')
                    .update({ ai_uses_count: nextCount })
                    .eq('id', user.id)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyPitch = (id, text) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const remainingFree = Math.max(0, FREE_AI_LIMIT - aiUses)

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8B5CF6]/15">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[11px] font-semibold text-[#A78BFA] mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>Powered by Gemini AI</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                        ArtNova AI Studio
                    </h1>
                    <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                        Find your ideal creative partner from the ArtNova directory or get instant project &amp; pitch guidance.
                    </p>
                </div>

                {isPro ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-xs font-bold text-amber-300 self-start">
                        <Crown className="w-4 h-4" />
                        <span>Unlimited Pro Access</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onOpenUpgrade}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171725] border border-amber-400/30 hover:border-amber-400 text-xs font-semibold text-amber-300 transition-colors cursor-pointer self-start"
                    >
                        <Crown className="w-3.5 h-3.5" />
                        <span>
                            {remainingFree} of {FREE_AI_LIMIT} Free Runs Left · Upgrade
                        </span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20">
                <button
                    type="button"
                    onClick={() => {
                        setMode('matchmaker')
                        setError('')
                    }}
                    className={`p-3.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${mode === 'matchmaker'
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                            : 'text-[#9490A8] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Users className="w-5 h-5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold font-['Outfit']">
                            Collaborator Matchmaker
                        </div>
                        <div className="text-[11px] opacity-80">
                            AI scans real ArtNova artists for your project
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMode('coach')
                        setError('')
                    }}
                    className={`p-3.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${mode === 'coach'
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                            : 'text-[#9490A8] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Bot className="w-5 h-5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold font-['Outfit']">
                            Creative &amp; Pitch Coach
                        </div>
                        <div className="text-[11px] opacity-80">
                            Roadmaps, outreach pitches &amp; credit splits
                        </div>
                    </div>
                </button>
            </div>

            <form
                onSubmit={(e) => handleRunAi(e)}
                className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/25 space-y-4"
            >
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    {mode === 'matchmaker'
                        ? 'Describe the project & skills you are looking for'
                        : 'Ask ArtNova AI for creative or collaboration guidance'}
                </label>

                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                        mode === 'matchmaker'
                            ? 'e.g. I am designing an indie sci-fi game cover and need a digital illustrator or 3D artist who loves neon cyberpunk aesthetics...'
                            : 'e.g. How should I structure a collaboration agreement with a sound designer for my YouTube short film?'
                    }
                    className="w-full px-4 py-3 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs leading-relaxed resize-none"
                />

                {mode === 'coach' && (
                    <div className="flex flex-wrap gap-2">
                        {COACH_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => handleRunAi(null, preset)}
                                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#101019] text-[#A78BFA] border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 transition-colors cursor-pointer"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="text-[11px] text-[#9490A8]">
                        {mode === 'matchmaker'
                            ? `Scanning ${creators.length} creator profile${creators.length === 1 ? '' : 's'} in directory`
                            : 'Tailored to your ArtNova creator profile'}
                    </span>

                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        icon={loading ? Loader2 : Wand2}
                        disabled={loading || !prompt.trim()}
                    >
                        {loading
                            ? 'Thinking...'
                            : !isPro && aiUses >= FREE_AI_LIMIT
                                ? 'Unlock Unlimited AI'
                                : mode === 'matchmaker'
                                    ? 'Find Best Matches'
                                    : 'Get Guidance'}
                    </Button>
                </div>
            </form>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {mode === 'matchmaker' && matchResult && (
                <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-xs text-[#F4F0FF] leading-relaxed">
                        <span className="font-bold text-[#A78BFA] block mb-1">
                            AI Team Recommendation:
                        </span>
                        {matchResult.summary}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {matchResult.matches.map((match, idx) => (
                            <div
                                key={match.id || idx}
                                className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/30 p-5 flex flex-col justify-between space-y-4 shadow-lg"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-white font-['Outfit']">
                                                {match.full_name}
                                            </h3>
                                            <p className="text-xs font-mono text-[#A78BFA]">
                                                @{match.username}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                            {match.match_score}% Match
                                        </span>
                                    </div>

                                    {match.creative_field && (
                                        <Badge variant="purple" size="sm">
                                            {match.creative_field}
                                        </Badge>
                                    )}

                                    <p className="text-xs text-[#F4F0FF]/85 leading-relaxed">
                                        {match.reason}
                                    </p>

                                    {match.suggested_pitch && (
                                        <div className="p-3 rounded-xl bg-[#101019] border border-white/5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9490A8]">
                                                    AI Suggested DM Pitch
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopyPitch(match.id || idx, match.suggested_pitch)
                                                    }
                                                    className="text-[10px] text-[#A78BFA] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedId === (match.id || idx) ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                            <span>Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-[#9490A8] italic leading-relaxed">
                                                &ldquo;{match.suggested_pitch}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={MessageSquare}
                                    onClick={() => onNavigateTab('messages')}
                                    className="w-full justify-center text-xs"
                                >
                                    Open Messages
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'coach' && coachReply && (
                <div className="p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                        <Bot className="w-4 h-4" />
                        <span>ArtNova AI Coach Response</span>
                    </div>
                    <div className="text-xs sm:text-sm text-[#F4F0FF]/90 leading-relaxed whitespace-pre-line">
                        {coachReply}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AiStudioSection