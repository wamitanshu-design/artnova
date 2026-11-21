import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
    Users,
    Plus,
    CheckSquare,
    Square,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    X,
} from 'lucide-react'

const STATUS_OPTIONS = ['In Progress', 'Review', 'Completed']

export function CollaborationsSection({ user }) {
    const [collaborations, setCollaborations] = useState([])
    const [tasks, setTasks] = useState([])
    const [artists, setArtists] = useState([])
    const [loading, setLoading] = useState(true)

    const [showNewForm, setShowNewForm] = useState(false)
    const [title, setTitle] = useState('')
    const [partnerId, setPartnerId] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)

    const [taskDrafts, setTaskDrafts] = useState({})
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        let isMounted = true

        async function loadWorkspace() {
            if (!user?.id) return
            setLoading(true)
            setError('')

            const [collabRes, tasksRes, artistsRes] = await Promise.all([
                supabase
                    .from('collaborations')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('collaboration_tasks')
                    .select('*')
                    .order('created_at', { ascending: true }),
                supabase
                    .from('artist_profiles')
                    .select('id, full_name, username, creative_field')
                    .order('full_name', { ascending: true }),
            ])

            if (!isMounted) return

            if (collabRes.error) setError(collabRes.error.message)
            else setCollaborations(collabRes.data || [])

            if (!tasksRes.error) setTasks(tasksRes.data || [])

            if (!artistsRes.error) {
                const list = artistsRes.data || []
                setArtists(list)
                if (list.length > 0) {
                    const other = list.find((a) => a.id !== user.id)
                    setPartnerId((other || list[0]).id)
                }
            }

            setLoading(false)
        }

        loadWorkspace()
        return () => {
            isMounted = false
        }
    }, [user])

    const handleCreateCollaboration = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!title.trim()) {
            setError('Please enter a collaboration project title.')
            return
        }

        const selectedPartner = artists.find((a) => a.id === partnerId)
        const creatorProfile = artists.find((a) => a.id === user.id)
        const creatorName =
            creatorProfile?.full_name || user?.user_metadata?.full_name || 'Creator'

        setCreating(true)

        const { data, error: insertError } = await supabase
            .from('collaborations')
            .insert({
                title: title.trim(),
                description: description.trim(),
                creator_id: user.id,
                creator_name: creatorName,
                partner_id: selectedPartner ? selectedPartner.id : user.id,
                partner_name: selectedPartner ? selectedPartner.full_name : creatorName,
                partner_username: selectedPartner ? selectedPartner.username : '',
                status: 'In Progress',
            })
            .select()
            .single()

        setCreating(false)

        if (insertError) {
            setError(insertError.message)
            return
        }

        setCollaborations((prev) => [data, ...prev])
        setTitle('')
        setDescription('')
        setShowNewForm(false)
        setSuccess('Collaboration workspace created!')
        setTimeout(() => setSuccess(''), 4000)
    }

    const handleStatusChange = async (collabId, newStatus) => {
        const { error: updateError } = await supabase
            .from('collaborations')
            .update({ status: newStatus })
            .eq('id', collabId)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setCollaborations((prev) =>
            prev.map((c) => (c.id === collabId ? { ...c, status: newStatus } : c))
        )
    }

    const handleDeleteCollaboration = async (collabId) => {
        const { error: deleteError } = await supabase
            .from('collaborations')
            .delete()
            .eq('id', collabId)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        setCollaborations((prev) => prev.filter((c) => c.id !== collabId))
        setTasks((prev) => prev.filter((t) => t.collaboration_id !== collabId))
    }

    const handleAddTask = async (e, collabId) => {
        e.preventDefault()
        const text = (taskDrafts[collabId] || '').trim()
        if (!text) return

        const { data, error: insertError } = await supabase
            .from('collaboration_tasks')
            .insert({
                collaboration_id: collabId,
                title: text,
                is_completed: false,
            })
            .select()
            .single()

        if (insertError) {
            setError(insertError.message)
            return
        }

        setTasks((prev) => [...prev, data])
        setTaskDrafts((prev) => ({ ...prev, [collabId]: '' }))
    }

    const handleToggleTask = async (task) => {
        const nextValue = !task.is_completed
        const { error: updateError } = await supabase
            .from('collaboration_tasks')
            .update({ is_completed: nextValue })
            .eq('id', task.id)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextValue } : t))
        )
    }

    const handleDeleteTask = async (taskId) => {
        const { error: deleteError } = await supabase
            .from('collaboration_tasks')
            .delete()
            .eq('id', taskId)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8B5CF6]/15">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                        My Collaborations
                    </h1>
                    <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                        Track joint creative workspaces, deliverables, and shared production milestones.
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    icon={showNewForm ? X : Plus}
                    onClick={() => setShowNewForm(!showNewForm)}
                >
                    {showNewForm ? 'Cancel' : 'New Workspace'}
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

            {/* New Collaboration Workspace Form */}
            {showNewForm && (
                <form
                    onSubmit={handleCreateCollaboration}
                    className="p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/30 space-y-5 shadow-xl"
                >
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#8B5CF6]" />
                        <span>Launch Collaboration Workspace</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Project / Production Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Midnight EP Cover & Visuals"
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Collaborating Artist
                            </label>
                            <select
                                value={partnerId}
                                onChange={(e) => setPartnerId(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                            >
                                {artists.map((artist) => (
                                    <option key={artist.id} value={artist.id} className="bg-[#171725]">
                                        {artist.full_name} (@{artist.username})
                                        {artist.id === user?.id ? ' - Solo Workspace' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                            Scope &amp; Goals
                        </label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Outline key creative deliverables, file formats, or target release date..."
                            className="w-full px-3.5 py-2 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" size="md" disabled={creating}>
                            {creating ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating...</span>
                                </span>
                            ) : (
                                'Create Workspace'
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Active Collaborations List */}
            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                </div>
            ) : collaborations.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#171725] border border-dashed border-[#8B5CF6]/30 text-center space-y-3 max-w-xl mx-auto">
                    <Users className="w-9 h-9 text-[#A78BFA] mx-auto" />
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                        No Active Collaborations
                    </h3>
                    <p className="text-xs text-[#9490A8]">
                        Click &ldquo;New Workspace&rdquo; above to kick off a joint project and track shared milestones.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {collaborations.map((collab) => {
                        const isLead = collab.creator_id === user?.id
                        const collabTasks = tasks.filter((t) => t.collaboration_id === collab.id)
                        const completedCount = collabTasks.filter((t) => t.is_completed).length
                        const progressPct =
                            collabTasks.length > 0
                                ? Math.round((completedCount / collabTasks.length) * 100)
                                : 0

                        return (
                            <div
                                key={collab.id}
                                className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 p-6 flex flex-col justify-between space-y-5"
                            >
                                <div className="space-y-3">
                                    {/* Top Title & Controls */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-bold text-white font-['Outfit']">
                                                {collab.title}
                                            </h3>
                                            <p className="text-xs text-[#9490A8] mt-0.5">
                                                {collab.creator_id === collab.partner_id ? (
                                                    <span>Solo Project · {collab.creator_name}</span>
                                                ) : (
                                                    <span>
                                                        {collab.creator_name} &amp;{' '}
                                                        <span className="text-[#A78BFA]">{collab.partner_name}</span>
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={collab.status}
                                                onChange={(e) => handleStatusChange(collab.id, e.target.value)}
                                                className="px-2.5 py-1 rounded-lg bg-[#101019] border border-[#8B5CF6]/25 text-[11px] font-medium text-[#A78BFA] focus:outline-none cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status} className="bg-[#171725]">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>

                                            {isLead && (
                                                <button
                                                    onClick={() => handleDeleteCollaboration(collab.id)}
                                                    className="p-1.5 rounded-lg text-[#9490A8] hover:text-rose-400 hover:bg-[#101019] transition-colors cursor-pointer"
                                                    title="Delete workspace"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {collab.description && (
                                        <p className="text-xs text-[#F4F0FF]/80 leading-relaxed">
                                            {collab.description}
                                        </p>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-[#9490A8]">Milestone Progress</span>
                                            <span className="text-[#A78BFA] font-mono">
                                                {completedCount}/{collabTasks.length} ({progressPct}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-[#101019] overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-300"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    <div className="pt-2 space-y-2">
                                        {collabTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#101019] border border-white/5"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTask(task)}
                                                    className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                                                >
                                                    {task.is_completed ? (
                                                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-[#9490A8] shrink-0" />
                                                    )}
                                                    <span
                                                        className={`text-xs truncate ${task.is_completed
                                                                ? 'line-through text-[#9490A8]'
                                                                : 'text-[#F4F0FF]'
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-[#9490A8] hover:text-rose-400 p-1 cursor-pointer"
                                                    aria-label="Delete milestone"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Milestone Input */}
                                <form
                                    onSubmit={(e) => handleAddTask(e, collab.id)}
                                    className="pt-3 border-t border-[#8B5CF6]/15 flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        value={taskDrafts[collab.id] || ''}
                                        onChange={(e) =>
                                            setTaskDrafts((prev) => ({
                                                ...prev,
                                                [collab.id]: e.target.value,
                                            }))
                                        }
                                        placeholder="Add a milestone or deliverable..."
                                        className="flex-1 px-3 py-2 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                                    />
                                    <Button type="submit" variant="secondary" size="sm" icon={Plus}>
                                        Add
                                    </Button>
                                </form>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CollaborationsSection