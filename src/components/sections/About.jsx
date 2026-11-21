import React from 'react'
import { SectionHeader } from '../ui/SectionHeader'
import { ABOUT_PILLARS } from '../../data/platformData'
import { Target, Compass, Sparkles } from 'lucide-react'

export function About() {
  const iconList = [Target, Compass, Sparkles]

  return (
    <section id="about" className="py-20 relative bg-[#0E0E17] border-y border-[#8B5CF6]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About ArtNova"
          title="Built to Connect Emerging"
          highlight="Creative Minds."
          description="A platform created with a clear mission: to provide independent creators with a dedicated environment for finding partners and bringing creative projects to life."
        />

        {/* Narrative & Mission */}
        <div className="rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 p-6 sm:p-10 mb-12">
          <h3 className="text-xl font-bold text-white font-['Outfit'] mb-4">
            The Vision Behind ArtNova
          </h3>
          <div className="space-y-4 text-sm sm:text-base text-[#9490A8] leading-relaxed">
            <p>
              Independent creators often face a common hurdle: making great work is rewarding, but finding trustworthy, talented collaborators to expand that work is difficult. Mainstream social networks are built around algorithmic engagement, advertising, and passive scrolling rather than constructive co-creation.
            </p>
            <p>
              ArtNova was conceived to change that. We are building a focused platform where artists across diverse creative disciplines—illustrators, music producers, 3D artists, writers, animators, and developers—can discover one another based on creative vision and complementary skills.
            </p>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ABOUT_PILLARS.map((pillar, idx) => {
            const Icon = iconList[idx] || Sparkles
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/35 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white font-['Outfit'] mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#9490A8] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
