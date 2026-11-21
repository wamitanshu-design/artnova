import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0B12]/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-[#171725] border border-[#8B5CF6]/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-5px_rgba(139,92,246,0.25)] p-6 sm:p-8 z-10 transition-all transform animate-in zoom-in-95 duration-200 my-8`}
        role="dialog"
        aria-modal="true"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent rounded-full" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-2 border-b border-[#8B5CF6]/15">
          <div>
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#F4F0FF] font-['Outfit']">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[#9490A8] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 rounded-full text-[#9490A8] hover:text-[#F4F0FF] hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-[#F4F0FF]">{children}</div>
      </div>
    </div>
  )
}
