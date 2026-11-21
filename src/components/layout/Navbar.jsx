import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

export function Navbar({ onNavigate, currentPage = 'home', user = null, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (currentPage !== 'home') {
      onNavigate('home')
      // Wait for home page to mount before scrolling
      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const userDisplayName =
    (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user?.email === 'string' && user.email) ||
    'Creator'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#101019]/90 backdrop-blur-md border-b border-[#8B5CF6]/15 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1px]">
              <div className="w-full h-full bg-[#101019] rounded-[7px] flex items-center justify-center">
                <span className="font-['Outfit'] font-bold text-sm text-[#F4F0FF]">
                  A
                </span>
              </div>
            </div>
            <span className="text-lg font-bold font-['Outfit'] tracking-tight text-[#F4F0FF]">
              ART<span className="text-[#A78BFA]">NOVA</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-[#9490A8] hover:text-[#F4F0FF] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop User / Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171725] border border-[#8B5CF6]/20 text-xs text-[#F4F0FF]">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                    {userDisplayName.charAt(0)}
                  </div>
                  <span className="font-medium text-[#F4F0FF] max-w-[140px] truncate">
                    {userDisplayName}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                  icon={LayoutDashboard}
                >
                  Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onLogout}
                  icon={LogOut}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('login')}
                  className={`text-sm font-medium px-3 py-1.5 transition-colors cursor-pointer ${
                    currentPage === 'login'
                      ? 'text-[#F4F0FF] font-semibold'
                      : 'text-[#9490A8] hover:text-white'
                  }`}
                >
                  Login
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-xs px-3 py-1.5"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('signup')}
                className="sm:hidden text-xs px-3 py-1.5"
              >
                Sign Up
              </Button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#171725] border border-[#8B5CF6]/20 text-[#9490A8] hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171725] border-b border-[#8B5CF6]/20 px-6 py-5 space-y-3">
          {/* Mobile User Tag if Logged In */}
          {user && (
            <div className="pb-3 border-b border-[#8B5CF6]/15 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-xs font-bold text-white uppercase">
                {userDisplayName.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="text-[#9490A8] block text-[10px]">Logged in as</span>
                <span className="font-medium text-white truncate max-w-[200px] block">
                  {userDisplayName}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="py-2 text-sm font-medium text-[#9490A8] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#8B5CF6]/15 flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  icon={LayoutDashboard}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onNavigate('dashboard')
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  icon={LogOut}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onLogout()
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onNavigate('login')
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onNavigate('signup')
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
