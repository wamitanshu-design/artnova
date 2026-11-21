import React from 'react'

export function Footer() {
  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-[#0B0B12] border-t border-[#8B5CF6]/15 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#8B5CF6]/10">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <a href="#home" onClick={(e) => handleLinkClick(e, '#home')} className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1px]">
                <div className="w-full h-full bg-[#101019] rounded-[6px] flex items-center justify-center">
                  <span className="font-['Outfit'] font-bold text-xs text-[#F4F0FF]">A</span>
                </div>
              </div>
              <span className="text-lg font-bold font-['Outfit'] text-[#F4F0FF]">
                ART<span className="text-[#A78BFA]">NOVA</span>
              </span>
            </a>
            <p className="text-xs text-[#9490A8]">
              Where Creativity Finds Its People.
            </p>
          </div>

          {/* Simple Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs font-medium text-[#9490A8] hover:text-[#F4F0FF] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9490A8]">
          <p>© {new Date().getFullYear()} ArtNova. All rights reserved.</p>
          <p className="text-[11px] text-[#9490A8]/80">
            Frontend Prototype • Under Active Development
          </p>
        </div>
      </div>
    </footer>
  )
}
