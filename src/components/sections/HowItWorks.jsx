import React from 'react'
import { SectionHeader } from '../ui/SectionHeader'
import { HOW_IT_WORKS_STEPS } from '../../data/platformData'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 relative bg-[#0E0E17] border-y border-[#8B5CF6]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How It Works"
          title="A Straightforward Process for"
          highlight="Collaborative Creation."
          description="Getting started on ArtNova is designed to be simple, respectful of your time, and centered around your creative output."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/35 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black font-['Outfit'] text-[#8B5CF6] block mb-4">
                  {step.step}
                </span>

                <h3 className="text-base font-bold text-white font-['Outfit'] mb-2.5">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#9490A8] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
