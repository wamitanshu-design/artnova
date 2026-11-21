import React from 'react'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'

export function Hero({ onNavigate }) {
  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Simple Platform Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171725] border border-[#8B5CF6]/25 text-xs font-medium text-[#A78BFA] mb-6">
          <span>Creative Collaboration Platform</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F4F0FF] tracking-tight leading-[1.15] mb-6 font-['Outfit']">
          Where Creativity Finds Its People.
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-[#9490A8] leading-relaxed max-w-2xl mx-auto mb-10">
          ArtNova is a platform that connects emerging artists and creative individuals, helping them discover collaborators, showcase their work and explore creative opportunities.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto"
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={ArrowRight}
            onClick={() => scrollTo('#about')}
            className="w-full sm:w-auto"
          >
            Learn About ArtNova
          </Button>
        </div>

        {/* Clean Concept Preview Panel */}
        <div className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 p-6 sm:p-8 text-left shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#101019] border border-white/5">
              <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider block mb-1">
                01. Showcase
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Creative Profiles</h3>
              <p className="text-xs text-[#9490A8] leading-relaxed">
                Display your primary mediums, portfolios, and artistic interests in one place.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101019] border border-white/5">
              <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider block mb-1">
                02. Discovery
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Find Collaborators</h3>
              <p className="text-xs text-[#9490A8] leading-relaxed">
                Browse artists across disciplines including digital art, audio, film, and design.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101019] border border-white/5">
              <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider block mb-1">
                03. Co-Create
              </span>
              <h3 className="text-sm font-semibold text-white mb-1">Project Opportunities</h3>
              <p className="text-xs text-[#9490A8] leading-relaxed">
                Connect directly on creative initiatives and independent collaborative projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
