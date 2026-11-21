import React from 'react'
import { SectionHeader } from '../ui/SectionHeader'
import { FEATURES } from '../../data/platformData'
import { User, LayoutGrid, Search, Users, GitFork } from 'lucide-react'

export function Features() {
  const iconMap = {
    User,
    LayoutGrid,
    Search,
    Users,
    GitFork,
  }

  return (
    <section id="features" className="py-20 relative bg-[#101019]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Platform Features"
          title="Everything You Need to Connect &"
          highlight="Collaborate."
          description="Explore the core capabilities ArtNova offers to help emerging artists showcase their talents and initiate joint creative projects."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || User
            const isFullWidthOnLarge = idx === FEATURES.length - 1 && FEATURES.length % 3 !== 0

            return (
              <div
                key={feature.id}
                className={`p-6 sm:p-7 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 transition-all ${
                  isFullWidthOnLarge ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] mb-5">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-[#F4F0FF] font-['Outfit'] mb-2.5">
                  {feature.title}
                </h3>

                <p className="text-sm text-[#9490A8] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
