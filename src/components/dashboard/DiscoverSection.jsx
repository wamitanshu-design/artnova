import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
    Search,
    Compass,
    MapPin,
    HeartHandshake,
    Image,
    X,
    Loader2,
} from 'lucide-react'

const DISCIPLINES = [
    'All Disciplines',
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

export function DiscoverSection({ currentUser }) {
    const [artists, setArtists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDiscipline, setSelectedDiscipline] = useState('All Disciplines')

    const [selectedArtist, setSelectedArtist] = useState(null)
    const [artistWorks, setArtistWorks] = useState([])
    const [loadingWorks, setLoadingWorks] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function fetchArtists() {
            setLoading(true)
            setError('')

            const { data, error: fetchError } = await supabase
                .from('artist_profiles')
                .select('*')
                .order('updated_at', { ascending: false })

            if (!isMounted) return

            if (fetchError) {
                setError(fetchError.message)
            } else {
                setArtists(data || [])
            }
            setLoading(false)
        }

        fetchArtists()
        return () => {
            isMounted = false
        }
    }, [])

    const openArtistModal = async (artist) => {
        setSelectedArtist(artist)
        setArtistWorks([])
        setLoadingWorks(true)

        const { data } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('user_id', artist.id)
            .order('created_at', { ascending: false })

        setArtistWorks(data || [])
        setLoadingWorks(false)
    }

    const filteredArtists = artists.filter((artist) => {
        const matchesDiscipline =
            selectedDiscipline === 'All Disciplines' ||
            artist.creative_field === selectedDiscipline

        const q = searchQuery.trim().toLowerCase()
        if (!q) return matchesDiscipline

        const inName = artist.full_name?.toLowerCase().includes(q)
        const inUsername = artist.username?.toLowerCase().includes(q)
        const inBio = artist.bio?.toLowerCase().includes(q)
        const inLocation = artist.location?.toLowerCase().includes(q)
        const inSkills = Array.isArray(artist.skills)
            ? artist.skills.some((s) => s.toLowerCase().includes(q))
            : false

        return matchesDiscipline && (inName || inUsername || inBio || inLocation || inSkills)
    })

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-[#8B5CF6]/15">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                    Discover Artists
                </h1>
                <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                    Explore creators on ArtNova, inspect their portfolios, and find partners for your next project.
                </p>
            </div>

            {/* Search & Discipline Filter Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, @username, skill (e.g. Blender, FL Studio), or city..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                    />
                </div>

                <select
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                    className="px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer sm:w-56"
                >
                    {DISCIPLINES.map((disc) => (
                        <option key={disc} value={disc} className="bg-[#171725]">
                            {disc}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-[#9490A8] gap-2">
                    <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                    <span className="text-xs">Loading creator directory...</span>
                </div>
            ) : filteredArtists.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#171725] border border-dashed border-[#8B5CF6]/30 text-center space-y-3 max-w-xl mx-auto">
                    <Compass className="w-9 h-9 text-[#A78BFA] mx-auto" />
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                        No Matching Creators Found
                    </h3>
                    <p className="text-xs text-[#9490A8]">
                        Try clearing your search filter or switching back to All Disciplines.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredArtists.map((artist) => {
                        const isYou = artist.id === currentUser?.id
                        const initial = artist.full_name?.trim()?.charAt(0) || 'A'
                        const skills = Array.isArray(artist.skills) ? artist.skills : []

                        return (
                            <div
                                key={artist.id}
                                className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 p-5 flex flex-col justify-between transition-all shadow-lg"
                            >
                                <div>
                                    <div className="flex items-start gap-3.5 mb-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1.5px] shrink-0">
                                            <div className="w-full h-full bg-[#101019] rounded-[14px] flex items-center justify-center">
                                                <span className="font-['Outfit'] font-black text-lg text-[#F4F0FF] uppercase">
                                                    {initial}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-white font-['Outfit'] truncate">
                                                    {artist.full_name}
                                                </h3>
                                                {isYou && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-mono text-[#A78BFA] truncate">
                                                @{artist.username}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {artist.creative_field && (
                                            <Badge variant="purple" size="sm">
                                                {artist.creative_field}
                                            </Badge>
                                        )}
                                        {artist.experience_level && (
                                            <Badge variant="lavender" size="sm">
                                                {artist.experience_level}
                                            </Badge>
                                        )}
                                    </div>

                                    {artist.location && (
                                        <p className="text-[11px] text-[#9490A8] flex items-center gap-1 mb-2.5">
                                            <MapPin className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                                            <span className="truncate">{artist.location}</span>
                                        </p>
                                    )}

                                    <p className="text-xs text-[#F4F0FF]/80 line-clamp-2 leading-relaxed mb-3 min-h-[36px]">
                                        {artist.bio || 'No artist bio added yet.'}
                                    </p>

                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {skills.slice(0, 4).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#101019] text-[#A78BFA] border border-[#8B5CF6]/20 font-mono"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {skills.length > 4 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#101019] text-[#9490A8]">
                                                    +{skills.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openArtistModal(artist)}
                                    className="w-full justify-center text-xs mt-2"
                                >
                                    View Profile &amp; Works
                                </Button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Creator Detail & Portfolio Modal */}
            {selectedArtist && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedArtist(null)}
                >
                    <div
                        className="bg-[#171725] border border-[#8B5CF6]/30 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#8B5CF6]/15">
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[2px]">
                                    <div className="w-full h-full bg-[#101019] rounded-[14px] flex items-center justify-center">
                                        <span className="font-['Outfit'] font-black text-xl text-[#F4F0FF] uppercase">
                                            {selectedArtist.full_name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-['Outfit']">
                                        {selectedArtist.full_name}
                                    </h2>
                                    <p className="text-xs font-mono text-[#A78BFA]">
                                        @{selectedArtist.username}
                                    </p>
                                    {selectedArtist.location && (
                                        <p className="text-xs text-[#9490A8] flex items-center gap-1 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                                            {selectedArtist.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedArtist(null)}
                                className="p-2 rounded-xl bg-[#101019] text-[#9490A8] hover:text-white cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedArtist.creative_field && (
                                    <Badge variant="purple" size="sm">
                                        {selectedArtist.creative_field}
                                    </Badge>
                                )}
                                {selectedArtist.experience_level && (
                                    <Badge variant="lavender" size="sm">
                                        {selectedArtist.experience_level}
                                    </Badge>
                                )}
                            </div>

                            {selectedArtist.bio && (
                                <p className="text-xs sm:text-sm text-[#F4F0FF]/90 leading-relaxed bg-[#101019] p-4 rounded-2xl border border-white/5">
                                    {selectedArtist.bio}
                                </p>
                            )}

                            {selectedArtist.collaboration_interests && (
                                <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5 mb-1">
                                        <HeartHandshake className="w-3.5 h-3.5" />
                                        <span>Looking to Collaborate On</span>
                                    </p>
                                    <p className="text-xs text-[#F4F0FF]/90 leading-relaxed">
                                        {selectedArtist.collaboration_interests}
                                    </p>
                                </div>
                            )}

                            {Array.isArray(selectedArtist.skills) && selectedArtist.skills.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9490A8] mb-2">
                                        Skills &amp; Tools
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedArtist.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-[#101019] text-[#A78BFA] border border-[#8B5CF6]/25 font-mono"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-[#8B5CF6]/15">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-3 flex items-center gap-1.5">
                                <Image className="w-4 h-4" />
                                <span>Portfolio Showcase ({artistWorks.length})</span>
                            </h3>

                            {loadingWorks ? (
                                <div className="py-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                                </div>
                            ) : artistWorks.length === 0 ? (
                                <p className="text-xs text-[#9490A8] bg-[#101019] p-4 rounded-xl text-center">
                                    This creator hasn&apos;t published any portfolio works yet.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {artistWorks.map((work) => (
                                        <div
                                            key={work.id}
                                            className="rounded-xl bg-[#101019] border border-[#8B5CF6]/20 overflow-hidden"
                                        >
                                            <img
                                                src={work.image_url}
                                                alt={work.title}
                                                className="w-full h-36 object-cover"
                                            />
                                            <div className="p-3">
                                                <p className="text-xs font-bold text-white truncate">
                                                    {work.title}
                                                </p>
                                                {work.category && (
                                                    <p className="text-[10px] text-[#A78BFA] mt-0.5">
                                                        {work.category}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DiscoverSection