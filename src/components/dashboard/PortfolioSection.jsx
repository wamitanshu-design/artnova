import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import {
    ImagePlus,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    FolderOpen,
    X,
} from 'lucide-react'

const CATEGORIES = [
    'Graphic Design',
    'Digital Art',
    'Illustration',
    '3D & Animation',
    'Photography',
    'UI/UX Design',
    'Album & Cover Art',
    'Other',
]

export function PortfolioSection({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Digital Art')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')

    useEffect(() => {
        let isMounted = true

        async function fetchPortfolio() {
            if (!user?.id) return
            setLoading(true)

            const { data, error: fetchError } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!isMounted) return

            if (fetchError) {
                setError(fetchError.message)
            } else {
                setItems(data || [])
            }
            setLoading(false)
        }

        fetchPortfolio()
        return () => {
            isMounted = false
        }
    }, [user])

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0]
        if (!selected) return

        if (!selected.type.startsWith('image/')) {
            setError('Please choose a valid image file (PNG, JPG, WEBP, or GIF).')
            return
        }

        if (selected.size > 5 * 1024 * 1024) {
            setError('Image size must be under 5 MB.')
            return
        }

        setError('')
        setFile(selected)
        setPreviewUrl(URL.createObjectURL(selected))
    }

    const clearSelectedFile = () => {
        setFile(null)
        setPreviewUrl('')
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!title.trim()) {
            setError('Please enter a project title.')
            return
        }

        if (!file) {
            setError('Please select an artwork image to upload.')
            return
        }

        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath)

            const { data: insertedItem, error: dbError } = await supabase
                .from('portfolio_items')
                .insert({
                    user_id: user.id,
                    title: title.trim(),
                    category,
                    description: description.trim(),
                    image_url: publicUrlData.publicUrl,
                    storage_path: filePath,
                })
                .select()
                .single()

            if (dbError) throw dbError

            setItems((prev) => [insertedItem, ...prev])
            setTitle('')
            setDescription('')
            clearSelectedFile()
            setSuccess('Artwork added to your portfolio!')
            setTimeout(() => setSuccess(''), 4000)
        } catch (err) {
            setError(err.message || 'Failed to upload portfolio item.')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (item) => {
        setError('')
        const { error: deleteError } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', item.id)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        if (item.storage_path) {
            await supabase.storage.from('portfolio').remove([item.storage_path])
        }

        setItems((prev) => prev.filter((i) => i.id !== item.id))
    }

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-[#8B5CF6]/15">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                    My Portfolio
                </h1>
                <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
                    Upload original works to build your visual showcase for potential collaborators.
                </p>
            </div>

            {/* Upload Form Card */}
            <form
                onSubmit={handleUpload}
                className="p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 space-y-5"
            >
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Add New Work</span>
                </h2>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: File Dropzone / Preview */}
                    <div>
                        <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                            Artwork Image (Max 5MB) *
                        </label>

                        {previewUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-[#8B5CF6]/30 bg-[#101019] h-52">
                                <img
                                    src={previewUrl}
                                    alt="Upload preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearSelectedFile}
                                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#101019]/80 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                                    aria-label="Remove selected image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-[#8B5CF6]/30 hover:border-[#8B5CF6] bg-[#101019] cursor-pointer transition-colors p-4 text-center">
                                <ImagePlus className="w-8 h-8 text-[#A78BFA] mb-2" />
                                <span className="text-xs font-medium text-white">
                                    Click to choose an image
                                </span>
                                <span className="text-[11px] text-[#9490A8] mt-1">
                                    PNG, JPG, WEBP, or GIF up to 5 MB
                                </span>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Right: Metadata Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Project Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Neon Skyline Concept"
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-[#171725]">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tools used, concept notes, or your role in this piece..."
                                className="w-full px-3.5 py-2 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <Button type="submit" variant="primary" size="md" disabled={uploading}>
                        {uploading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading Artwork...</span>
                            </span>
                        ) : (
                            'Publish to Portfolio'
                        )}
                    </Button>
                </div>
            </form>

            {/* Portfolio Gallery Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider font-['Outfit']">
                        Published Works ({items.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center text-[#9490A8]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-10 rounded-2xl bg-[#171725] border border-dashed border-[#8B5CF6]/25 text-center space-y-2">
                        <FolderOpen className="w-8 h-8 text-[#A78BFA] mx-auto" />
                        <p className="text-sm font-semibold text-white">No works uploaded yet</p>
                        <p className="text-xs text-[#9490A8]">
                            Use the form above to upload your first piece to ArtNova.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 overflow-hidden flex flex-col group"
                            >
                                <div className="relative h-48 bg-[#101019] overflow-hidden">
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item)}
                                        className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-[#101019]/80 text-[#9490A8] hover:text-rose-400 hover:bg-[#101019] transition-colors cursor-pointer"
                                        title="Delete work"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h3 className="text-sm font-bold text-white font-['Outfit'] line-clamp-1">
                                                {item.title}
                                            </h3>
                                            {item.category && (
                                                <Badge variant="purple" size="sm">
                                                    {item.category}
                                                </Badge>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-xs text-[#9490A8] line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PortfolioSection