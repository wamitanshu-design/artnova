import React, { useState } from 'react'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'
import { Mail, MessageSquare, CheckCircle, Send } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    discipline: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.email || !formData.message) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({ name: '', email: '', discipline: '', message: '' })
  }

  return (
    <section id="contact" className="py-20 relative bg-[#101019]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Get In Touch"
          title="Connect with the"
          highlight="ArtNova Team."
          description="Have questions about the platform, feedback on our features, or want early access updates as an artist? We'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA]">
                <Mail className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-['Outfit'] mb-1">
                  Direct Inquiries
                </h4>
                <p className="text-xs text-[#9490A8] leading-relaxed mb-3">
                  For platform inquiries, feedback, or collaborations with our team:
                </p>
                <a
                  href="mailto:contact@artnova.network"
                  className="text-sm font-semibold text-[#A78BFA] hover:text-white transition-colors"
                >
                  contact@artnova.network
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA]">
                <MessageSquare className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-['Outfit'] mb-1">
                  Artist Early Access
                </h4>
                <p className="text-xs text-[#9490A8] leading-relaxed">
                  We are developing ArtNova frontend-first and rolling out early access in stages. Send us a message with your creative discipline to receive updates.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 shadow-lg">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>

                  <h4 className="text-xl font-bold text-white font-['Outfit']">
                    Thank You for Reaching Out
                  </h4>
                  <p className="text-sm text-[#9490A8] max-w-sm mx-auto leading-relaxed">
                    Your message has been received on the frontend demo. As we continue development, we'll keep you updated.
                  </p>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    className="mt-2"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@domain.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                      Creative Discipline or Focus
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3D Animation, Sound Design, Illustration, UI/UX"
                      value={formData.discipline}
                      onChange={(e) =>
                        setFormData({ ...formData, discipline: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share your thoughts, suggestions, or what you'd like to see in ArtNova..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-sm resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      icon={Send}
                      className="w-full justify-center"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
