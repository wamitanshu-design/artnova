import React from 'react'
import { Sparkles } from 'lucide-react'

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  centered = true,
  className = '',
}) {
  return (
    <div
      className={`max-w-3xl mb-14 md:mb-18 ${
        centered ? 'mx-auto text-center' : 'text-left'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#A78BFA] text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>{eyebrow}</span>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F0FF] tracking-tight leading-[1.15] mb-5 font-['Outfit']">
        {title}{' '}
        {highlight && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#C4B5FD]">
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p className="text-base sm:text-lg text-[#9490A8] leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
