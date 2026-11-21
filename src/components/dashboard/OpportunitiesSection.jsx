import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
    Sparkles,
    Plus,
    Search,
    Clock,
    Trash2,
    Send,
    CheckCircle2,
    Users,
    Loader2,
    AlertCircle,
    X,
} from 'lucide-react'

const ROLES = [
    'All Roles',
    'Graphic Design',
    'Digital Art',
    'Illustration',
    'Animation',
    'Photography',
    'Video Editing',
    'Music & Audio Production',
    'UI/UX Design',
    'Content Creation',
    'Other',
]

const COMP_TYPES = [
    'Revenue Share / Credit',
    'Paid Commission',
    'Passion Project / Portfolio',
    'Skill Swap',
]

export function OpportunitiesSection({ user }) {
    const [opportunities, setOpportunities] = useState([])
    const [applications, setApplications] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('All Roles')

    // New Opportunity Form State
    const [title, setTitle] = useState('')
    const [disciplineNeeded, setDisciplineNeeded] = useState('Music & Audio Production')
    const [compensationType, setCompensationType] = useState('Revenue Share / Credit')
    const [timeline, setTimeline] = useState('')
    const [description, setDescription] = useState('')

    // Apply Modal State
    const [applyingTo, setApplyingTo] = useState(null)
    const [pitch, setPitch] = useState('')
    const [sendingPitch, setSendingPitch] = useState(false)

    // View Applicants Modal State
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            setLoading(true)

            const [oppsRes, appsRes, profRes] = await Promise.all([
                supabase
                    .from('collaboration_opportunities')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase.from('opportunity_applications').select('*'),
                user?.id
                    ? supabase
                        .from('artist_profiles')
                        .select('full_name, username')
                        .eq('id', user.id)
                        .maybeSingle()
                    : Promise.resolve({ data: null }),
            ])

            if (!isMounted) return

            if (oppsRes.error) setError(oppsRes.error.message)
            else setOpportunities(oppsRes.data || [])

            if (!appsRes.error) setApplications(appsRes.data || [])
            if (profRes?.data) setProfile(profRes.data)

            setLoading(false)
        }

        loadData()
        return () => {
            isMounted = false
        }
    }, [user])

    const handleCreateOpportunity = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!title.trim() || !description.trim()) {
            setError('Project title and description are required.')
            return
        }

        setSubmitting(true)

        const creatorName =
            profile?.full_name || user?.user_metadata?.full_name || 'ArtNova Creator'
        const creatorUsername = profile?.username || ''

        const { data, error: insertError } = await supabase
            .from('collaboration_opportunities')
            .insert({
                creator_id: user.id,
                creator_name: creatorName,
                creator_username: creatorUsername,
                title: title.trim(),
                discipline_needed: disciplineNeeded,
                compensation_type: compensationType,
                timeline: timeline.trim(),
                description: description.trim(),
            })
            .select()
            .single()

        setSubmitting(false)

        if (insertError) {
            setError(insertError.message)
            return
        }

        setOpportunities((prev) => [data, ...prev])
        setTitle('')
        setTimeline('')
        setDescription('')
        setShowCreateForm(false)
        setSuccess('Collaboration call published!')
        setTimeout(() => setSuccess(''), 4000)
    }

    const handleDeleteOpportunity = async (id) => {
        const { error: deleteError } = await supabase
            .from('collaboration_opportunities')
            .delete()
            .eq('id', id)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        setOpportunities((prev) => prev.filter((o) => o.id !== id))
    }

    const handleSendApplication = async (e) => {
        e.preventDefault()
        if (!applyingTo || !pitch.trim()) return

        setSendingPitch(true)
        setError('')

        const applicantName =
            profile?.full_name || user?.user_metadata?.full_name || 'ArtNova Creator'

        const { data, error: applyError } = await supabase
            .from('opportunity_applications')
            .insert({
                opportunity_id: applyingTo.id,
                applicant_id: user.id,
                applicant_name: applicantName,
                applicant_email: user.email,
                pitch: pitch.trim(),
            })
            .select()
            .single()

        setSendingPitch(false)

        if (applyError) {
            setError(applyError.message)
            return
        }

        setApplications((prev) => [...prev, data])
        setApplyingTo(null)
        setPitch('')
        setSuccess('Your collaboration pitch has been sent!')
        setTimeout(() => setSuccess(''), 4000)
    }

    const filteredOpportunities = opportunities.filter((opp) => {
        const matchesRole =
            roleFilter === 'All Roles' || opp.discipline_needed === roleFilter
        const q = searchQuery.trim().toLowerCase()
        if (!q) return matchesRole

        return (
            matchesRole &&
            (opp.title?.toLowerCase().includes(q) ||
                opp.description?.toLowerCase().includes(q) ||
                opp.creator_name?.toLowerCase().includes(q))
        )
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8B5CF6]/15">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                        Collaboration Opportunities
                    </h1>
                    <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                        Post open creative calls or pitch your skills to ongoing independent projects.
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    icon={showCreateForm ? X : Plus}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Post Open Call'}
                </Button>
            </div>

            {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Create Opportunity Form */}
            {showCreateForm && (
                <form
                    onSubmit={handleCreateOpportunity}
                    className="p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/30 space-y-5 shadow-xl"
                >
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                        <span>New Collaboration Call</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Project Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Need Synthwave Producer for Indie Game Trailer"
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Collaborator Role Needed
                            </label>
                            <select
                                value={disciplineNeeded}
                                onChange={(e) => setDisciplineNeeded(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                            >
                                {ROLES.filter((r) => r !== 'All Roles').map((role) => (
                                    <option key={role} value={role} className="bg-[#171725]">
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Collaboration Type
                            </label>
                            <select
                                value={compensationType}
                                onChange={(e) => setCompensationType(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                            >
                                {COMP_TYPES.map((comp) => (
                                    <option key={comp} value={comp} className="bg-[#171725]">
                                        {comp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Estimated Timeline
                            </label>
                            <input
                                type="text"
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                placeholder="e.g. 2 Weeks, Flexible, Ongoing"
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                            Project Brief &amp; What You&apos;re Looking For *
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the vision, deliverables needed, and style references..."
                            className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" size="md" disabled={submitting}>
                            {submitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Publishing...</span>
                                </span>
                            ) : (
                                'Publish Open Call'
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search project calls by keyword or creator..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer sm:w-56"
                >
                    {ROLES.map((role) => (
                        <option key={role} value={role} className="bg-[#171725]">
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            {/* Opportunities Feed */}
            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                </div>
            ) : filteredOpportunities.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#171725] border border-dashed border-[#8B5CF6]/30 text-center space-y-3 max-w-xl mx-auto">
                    <Sparkles className="w-9 h-9 text-[#A78BFA] mx-auto" />
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                        No Open Calls Yet
                    </h3>
                    <p className="text-xs text-[#9490A8]">
                        Click &ldquo;Post Open Call&rdquo; above to launch the first collaborative project on ArtNova.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredOpportunities.map((opp) => {
                        const isOwner = opp.creator_id === user?.id
                        const oppApps = applications.filter((a) => a.opportunity_id === opp.id)
                        const hasApplied = oppApps.some((a) => a.applicant_id === user?.id)

                        return (
                            <div
                                key={opp.id}
                                className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 p-6 flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-bold text-white font-['Outfit']">
                                                {opp.title}
                                            </h3>
                                            <p className="text-xs text-[#9490A8] mt-0.5">
                                                Posted by{' '}
                                                <span className="text-[#A78BFA] font-medium">
                                                    {opp.creator_name}
                                                    {opp.creator_username ? ` (@${opp.creator_username})` : ''}
                                                </span>
                                            </p>
                                        </div>

                                        {isOwner && (
                                            <button
                                                onClick={() => handleDeleteOpportunity(opp.id)}
                                                className="p-1.5 rounded-lg text-[#9490A8] hover:text-rose-400 hover:bg-[#101019] transition-colors cursor-pointer"
                                                title="Delete open call"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge variant="purple" size="sm">
                                            Looking for: {opp.discipline_needed}
                                        </Badge>
                                        <Badge variant="lavender" size="sm">
                                            {opp.compensation_type}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-[#F4F0FF]/85 leading-relaxed">
                                        {opp.description}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-[#8B5CF6]/15 flex items-center justify-between gap-3">
                                    <span className="text-[11px] text-[#9490A8] flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                                        <span>{opp.timeline || 'Flexible timeline'}</span>
                                    </span>

                                    {isOwner ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon={Users}
                                            onClick={() => setViewingApplicantsFor(opp)}
                                        >
                                            Applicants ({oppApps.length})
                                        </Button>
                                    ) : hasApplied ? (
                                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Interest Sent</span>
                                        </span>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            icon={Send}
                                            onClick={() => setApplyingTo(opp)}
                                        >
                                            Pitch to Collaborate
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Apply / Pitch Modal */}
            {applyingTo && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setApplyingTo(null)}
                >
                    <form
                        onSubmit={handleSendApplication}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#171725] border border-[#8B5CF6]/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white font-['Outfit']">
                                    Pitch to Collaborate
                                </h3>
                                <p className="text-xs text-[#A78BFA] mt-0.5">{applyingTo.title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApplyingTo(null)}
                                className="p-1.5 text-[#9490A8] hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Your Collaboration Pitch *
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                                placeholder="Introduce yourself, mention relevant tools/works in your portfolio, and share how you'd like to contribute..."
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                            />
                            <p className="text-[11px] text-[#9490A8] mt-1">
                                Your contact email ({user?.email}) will be shared with {applyingTo.creator_name}.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setApplyingTo(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm" disabled={sendingPitch}>
                                {sendingPitch ? 'Sending...' : 'Send Pitch'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* View Applicants Modal (For Post Owners) */}
            {viewingApplicantsFor && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setViewingApplicantsFor(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#171725] border border-[#8B5CF6]/30 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-start justify-between pb-3 border-b border-[#8B5CF6]/15">
                            <div>
                                <h3 className="text-lg font-bold text-white font-['Outfit']">
                                    Collaboration Pitches
                                </h3>
                                <p className="text-xs text-[#A78BFA] mt-0.5">{viewingApplicantsFor.title}</p>
                            </div>
                            <button
                                onClick={() => setViewingApplicantsFor(null)}
                                className="p-1.5 text-[#9490A8] hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {applications.filter((a) => a.opportunity_id === viewingApplicantsFor.id).length ===
                            0 ? (
                            <p className="text-xs text-[#9490A8] bg-[#101019] p-5 rounded-2xl text-center">
                                No creators have pitched on this call yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {applications
                                    .filter((a) => a.opportunity_id === viewingApplicantsFor.id)
                                    .map((app) => (
                                        <div
                                            key={app.id}
                                            className="p-4 rounded-2xl bg-[#101019] border border-[#8B5CF6]/20 space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-white">{app.applicant_name}</span>
                                                <span className="text-[11px] font-mono text-[#A78BFA]">
                                                    {app.applicant_email}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#F4F0FF]/85 leading-relaxed">{app.pitch}</p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default OpportunitiesSection