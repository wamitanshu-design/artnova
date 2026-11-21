import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import {
    MessageSquare,
    Send,
    Search,
    Loader2,
    AlertCircle,
} from 'lucide-react'

export function MessagesSection({ user }) {
    const [creators, setCreators] = useState([])
    const [messages, setMessages] = useState([])
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [draft, setDraft] = useState('')

    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const bottomRef = useRef(null)

    useEffect(() => {
        let isMounted = true

        async function loadInbox() {
            if (!user?.id) return
            setLoading(true)
            setError('')

            const [profilesRes, messagesRes] = await Promise.all([
                supabase
                    .from('artist_profiles')
                    .select('id, full_name, username, creative_field')
                    .order('full_name', { ascending: true }),
                supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                    .order('created_at', { ascending: true }),
            ])

            if (!isMounted) return

            if (profilesRes.error) {
                setError(profilesRes.error.message)
            } else {
                const list = profilesRes.data || []
                setCreators(list)
                if (list.length > 0) {
                    const otherCreator = list.find((c) => c.id !== user.id)
                    setSelectedCreator(otherCreator || list[0])
                }
            }

            if (messagesRes.error) {
                setError(messagesRes.error.message)
            } else {
                setMessages(messagesRes.data || [])
            }

            setLoading(false)
        }

        loadInbox()

        const channel = supabase
            .channel('artnova-direct-messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const incoming = payload.new
                    if (incoming.sender_id === user?.id || incoming.recipient_id === user?.id) {
                        setMessages((prev) =>
                            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [user])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, selectedCreator])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!draft.trim() || !selectedCreator || sending) return

        setSending(true)
        setError('')

        const { data, error: insertError } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                recipient_id: selectedCreator.id,
                content: draft.trim(),
            })
            .select()
            .single()

        setSending(false)

        if (insertError) {
            setError(insertError.message)
            return
        }

        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]))
        setDraft('')
    }

    const filteredCreators = creators.filter((c) => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true
        return (
            c.full_name?.toLowerCase().includes(q) ||
            c.username?.toLowerCase().includes(q) ||
            c.creative_field?.toLowerCase().includes(q)
        )
    })

    const activeThread = selectedCreator
        ? messages.filter(
            (m) =>
                (m.sender_id === user?.id && m.recipient_id === selectedCreator.id) ||
                (m.sender_id === selectedCreator.id && m.recipient_id === user?.id)
        )
        : []

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-[#8B5CF6]/15">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                    Messages
                </h1>
                <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                    Reach out directly to creators to discuss ideas, share stems, and plan collaborations.
                </p>
            </div>

            {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 rounded-3xl bg-[#171725] border border-[#8B5CF6]/20 overflow-hidden min-h-[520px]">
                    {/* Left Column: Creator Thread List */}
                    <div className="border-b lg:border-b-0 lg:border-r border-[#8B5CF6]/15 flex flex-col">
                        <div className="p-4 border-b border-[#8B5CF6]/15">
                            <div className="relative">
                                <Search className="w-4 h-4 text-[#9490A8] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Find a creator..."
                                    className="w-full pl-9 pr-3 py-2 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-[#8B5CF6]/10 max-h-[260px] lg:max-h-[460px]">
                            {filteredCreators.length === 0 ? (
                                <p className="p-6 text-xs text-[#9490A8] text-center">
                                    No creators found. Complete your profile first to appear here.
                                </p>
                            ) : (
                                filteredCreators.map((creator) => {
                                    const isSelected = selectedCreator?.id === creator.id
                                    const isSelf = creator.id === user?.id
                                    const threadMsgs = messages.filter(
                                        (m) =>
                                            (m.sender_id === user?.id && m.recipient_id === creator.id) ||
                                            (m.sender_id === creator.id && m.recipient_id === user?.id)
                                    )
                                    const lastMsg = threadMsgs[threadMsgs.length - 1]

                                    return (
                                        <button
                                            key={creator.id}
                                            type="button"
                                            onClick={() => setSelectedCreator(creator)}
                                            className={`w-full p-4 text-left flex items-center gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-[#8B5CF6]/15' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1.5px] shrink-0">
                                                <div className="w-full h-full bg-[#101019] rounded-[10px] flex items-center justify-center font-['Outfit'] font-bold text-sm text-white uppercase">
                                                    {creator.full_name?.charAt(0) || 'A'}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-white truncate">
                                                        {creator.full_name}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                                                            Personal Notes
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[#9490A8] truncate mt-0.5">
                                                    {lastMsg
                                                        ? lastMsg.content
                                                        : `@${creator.username} · ${creator.creative_field || 'Creator'}`}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Active Chat Thread */}
                    <div className="lg:col-span-2 flex flex-col bg-[#101019]/50">
                        {selectedCreator ? (
                            <>
                                {/* Thread Header */}
                                <div className="p-4 sm:px-6 border-b border-[#8B5CF6]/15 bg-[#171725] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center font-['Outfit'] font-bold text-sm text-[#A78BFA] uppercase">
                                            {selectedCreator.full_name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-white font-['Outfit']">
                                                {selectedCreator.full_name}
                                            </h2>
                                            <p className="text-[11px] font-mono text-[#A78BFA]">
                                                @{selectedCreator.username}
                                                {selectedCreator.creative_field
                                                    ? ` · ${selectedCreator.creative_field}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Feed */}
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[360px]">
                                    {activeThread.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2">
                                            <MessageSquare className="w-8 h-8 text-[#A78BFA]/70" />
                                            <p className="text-xs font-semibold text-white">
                                                Start the conversation with {selectedCreator.full_name}
                                            </p>
                                            <p className="text-[11px] text-[#9490A8] max-w-xs">
                                                Send a quick note below to introduce your work or pitch a collaboration idea.
                                            </p>
                                        </div>
                                    ) : (
                                        activeThread.map((msg) => {
                                            const isMine = msg.sender_id === user?.id
                                            const timeLabel = new Date(msg.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isMine
                                                                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-br-sm'
                                                                : 'bg-[#171725] border border-[#8B5CF6]/20 text-[#F4F0FF] rounded-bl-sm'
                                                            }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-[#9490A8] mt-1 px-1">
                                                        {timeLabel}
                                                    </span>
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Message Composer */}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-4 border-t border-[#8B5CF6]/15 bg-[#171725] flex items-center gap-3"
                                >
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        placeholder={`Message ${selectedCreator.full_name}...`}
                                        className="flex-1 px-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        icon={Send}
                                        disabled={sending || !draft.trim()}
                                    >
                                        {sending ? 'Sending' : 'Send'}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-xs text-[#9490A8] p-8">
                                Select a creator from the left to open a conversation.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MessagesSection