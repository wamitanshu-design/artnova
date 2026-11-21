import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { supabase } from '../../lib/supabase'
import {
  User,
  AtSign,
  MapPin,
  Sparkles,
  Layers,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Eye,
} from 'lucide-react'

export function ProfileSection({ user }) {
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    username: '',
    creativeField: 'Graphic Design',
    experienceLevel: 'Intermediate',
    location: '',
    bio: '',
    skills: [],
    collaborationInterests: '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const creativeDisciplines = [
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

  const experienceLevels = [
    'Beginner / Student',
    'Intermediate',
    'Experienced',
    'Professional',
  ]

  // Load profile from Supabase on mount
  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching artist profile:', error)
        }

        if (isMounted && data) {
          setFormData({
            fullName: data.full_name || user?.user_metadata?.full_name || '',
            username: data.username || '',
            creativeField: data.creative_field || 'Graphic Design',
            experienceLevel: data.experience_level || 'Intermediate',
            location: data.location || '',
            bio: data.bio || '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            collaborationInterests: data.collaboration_interests || '',
          })
        }
      } catch (err) {
        console.error('Unexpected error loading profile:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  // Handle skill addition
  const handleAddSkill = (e) => {
    if (e) e.preventDefault()
    const trimmed = skillInput.trim()
    if (!trimmed) return

    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }))
    }
    setSkillInput('')
  }

  // Handle skill removal
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  // Form validation
  const validate = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.'
    } else if (!/^[a-z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username =
        'Username can only contain lowercase letters, numbers, and underscores.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    if (!validate()) return

    setIsSaving(true)

    try {
      const { error } = await supabase.from('artist_profiles').upsert({
        id: user.id,
        full_name: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        creative_field: formData.creativeField,
        experience_level: formData.experienceLevel,
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills,
        collaboration_interests: formData.collaborationInterests.trim(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        if (error.code === '23505') {
          setServerError('That username is already taken. Please choose another.')
        } else {
          setServerError(error.message || 'Unable to update profile.')
        }
        setIsSaving(false)
        return
      }

      setSuccessMessage('Profile updated successfully!')
      setIsSaving(false)

      setTimeout(() => {
        setSuccessMessage('')
      }, 4000)
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred while saving.')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#9490A8] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
        <span className="text-xs">Loading artist profile...</span>
      </div>
    )
  }

  const avatarInitial = formData.fullName.trim().charAt(0) || user?.email?.charAt(0) || 'A'

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#8B5CF6]/15">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          My Creator Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#9490A8] mt-1">
          Customize your artist identity, technical skills, and collaboration preferences.
        </p>
      </div>

      {/* Main Grid: Form on Left, Live Preview Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2 pb-2 border-b border-[#8B5CF6]/15">
                <User className="w-4 h-4 text-[#8B5CF6]" />
                <span>Basic Identity</span>
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value })
                    if (errors.fullName) setErrors({ ...errors, fullName: null })
                  }}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full px-3.5 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors ${
                    errors.fullName
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                  Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => {
                      const cleanUsername = e.target.value
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, '_')
                      setFormData({ ...formData, username: cleanUsername })
                      if (errors.username) setErrors({ ...errors, username: null })
                    }}
                    placeholder="alex_creator"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors font-mono ${
                      errors.username
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#9490A8] mt-1">
                  Lowercase letters, numbers, and underscores only.
                </p>
                {errors.username && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Creative Discipline & Experience Level Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                    Creative Discipline
                  </label>
                  <select
                    value={formData.creativeField}
                    onChange={(e) =>
                      setFormData({ ...formData, creativeField: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                  >
                    {creativeDisciplines.map((d) => (
                      <option key={d} value={d} className="bg-[#171725] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceLevel: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                  >
                    {experienceLevels.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-[#171725] text-white">
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                  Location / Working Mode
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Berlin, Germany or Remote"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                  />
                </div>
              </div>

              {/* Bio / Artist Statement */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Bio / Artist Statement
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.bio.length >= 300
                        ? 'text-rose-400'
                        : 'text-[#9490A8]'
                    }`}
                  >
                    {formData.bio.length} / 300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell fellow creators about your artistic focus, vision, and creative background..."
                  className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                />
              </div>

              {/* Skills Interactive Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                  Skills & Tools
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Type a skill (e.g. Figma, Blender, Ableton) and press Add"
                    className="flex-1 px-3.5 py-2 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={handleAddSkill}
                  >
                    Add
                  </Button>
                </div>

                {/* Rendered Skill Tags */}
                {formData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101019] border border-[#8B5CF6]/30 text-xs text-[#F4F0FF]"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#9490A8] hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                          aria-label={`Remove skill ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#9490A8] italic">
                    No skills added yet. Add tags for software, instruments, or artistic techniques.
                  </p>
                )}
              </div>

              {/* Collaboration Interests */}
              <div>
                <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                  Collaboration Interests
                </label>
                <textarea
                  rows={3}
                  value={formData.collaborationInterests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collaborationInterests: e.target.value,
                    })
                  }
                  placeholder="What types of projects or creators are you looking to partner with? (e.g. 'Looking for sound designers for animated shorts', 'Seeking 3D artists for album artwork')..."
                  className="w-full px-3.5 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs resize-none"
                />
              </div>
            </div>

            {/* Server Error Message */}
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Success Confirmation Banner */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                className="w-full sm:w-auto px-8"
              >
                {isSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </span>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Profile Card Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider font-['Outfit'] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Profile Preview</span>
            </span>
            <Badge variant="glass" size="sm">
              Public View
            </Badge>
          </div>

          {/* Preview Card */}
          <div className="rounded-3xl bg-[#171725] border border-[#8B5CF6]/25 p-6 shadow-2xl relative overflow-hidden group">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-2xl rounded-full pointer-events-none" />

            {/* Top Identity Row */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full bg-[#101019] rounded-[14px] flex items-center justify-center">
                  <span className="font-['Outfit'] font-black text-xl text-transparent bg-clip-text bg-gradient-to-br from-[#F4F0FF] to-[#A78BFA] uppercase">
                    {avatarInitial}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white font-['Outfit'] truncate">
                  {formData.fullName.trim() || 'Your Name'}
                </h3>
                <span className="text-xs font-mono text-[#A78BFA] block truncate">
                  {formData.username ? `@${formData.username}` : '@username'}
                </span>
                {formData.location && (
                  <span className="text-[11px] text-[#9490A8] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                    <span>{formData.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Badges: Creative Discipline & Experience */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Badge variant="purple" size="sm">
                {formData.creativeField}
              </Badge>
              <Badge variant="lavender" size="sm">
                {formData.experienceLevel}
              </Badge>
            </div>

            {/* Bio Preview */}
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#9490A8] mb-1">
                About
              </h4>
              <p className="text-xs text-[#F4F0FF]/90 leading-relaxed bg-[#101019]/60 p-3 rounded-xl border border-white/5 min-h-[48px]">
                {formData.bio.trim() || (
                  <span className="text-[#9490A8]/50 italic">
                    Your artist statement and creative bio will display here.
                  </span>
                )}
              </p>
            </div>

            {/* Skills Tags Preview */}
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#9490A8] mb-1.5">
                Skills & Mediums
              </h4>
              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#101019] text-[#A78BFA] border border-[#8B5CF6]/20 font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[#9490A8]/50 italic">
                  Skills added above will show here.
                </span>
              )}
            </div>

            {/* Collaboration Interests Preview */}
            {formData.collaborationInterests.trim() && (
              <div className="pt-3 border-t border-[#8B5CF6]/15">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#A78BFA] mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Looking to Collaborate On</span>
                </h4>
                <p className="text-xs text-[#9490A8] leading-relaxed">
                  {formData.collaborationInterests}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSection
