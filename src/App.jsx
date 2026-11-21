import React, { useState, useEffect } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Features } from './components/sections/Features'
import { HowItWorks } from './components/sections/HowItWorks'
import { Contact } from './components/sections/Contact'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { DashboardPage } from './pages/DashboardPage'
import { supabase } from './lib/supabase'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' | 'login' | 'signup' | 'dashboard'
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // Track Supabase active session and listen to auth state changes safely
  useEffect(() => {
    supabase.auth
      .getSession()
      .then((res) => {
        const session = res?.data?.session
        setUser(session?.user ?? null)
        setAuthReady(true)
      })
      .catch((err) => {
        console.error('Error fetching session:', err)
        setUser(null)
        setAuthReady(true)
      })

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      authListener?.data?.subscription?.unsubscribe()
    }
  }, [])

  // Listen to hash changes for deep linking (e.g., #/login, #/signup, #/dashboard, #/home)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/login' || hash === '#login') {
        setCurrentPage('login')
        window.scrollTo(0, 0)
      } else if (hash === '#/signup' || hash === '#signup') {
        setCurrentPage('signup')
        window.scrollTo(0, 0)
      } else if (hash === '#/dashboard' || hash === '#dashboard') {
        setCurrentPage('dashboard')
        window.scrollTo(0, 0)
      } else if (hash.startsWith('#/') || hash === '') {
        setCurrentPage('home')
      }
    }

    // Check initial hash on load
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (page) => {
    setCurrentPage(page)
    if (page === 'login') {
      window.location.hash = '#/login'
    } else if (page === 'signup') {
      window.location.hash = '#/signup'
    } else if (page === 'dashboard') {
      window.location.hash = '#/dashboard'
    } else {
      window.location.hash = '#/'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Route protection for dashboard: redirect to login if no active user session
  useEffect(() => {
    if (authReady && currentPage === 'dashboard' && !user) {
      handleNavigate('login')
    }
  }, [authReady, currentPage, user])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setUser(null)
      handleNavigate('home')
    }
  }

  // Render Login Page
  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} />
  }

  // Render Sign Up Page
  if (currentPage === 'signup') {
    return <SignUpPage onNavigate={handleNavigate} />
  }

  // Render Dashboard Page (Protected)
  if (currentPage === 'dashboard') {
    if (authReady && !user) {
      return <LoginPage onNavigate={handleNavigate} />
    }
    return (
      <DashboardPage
        user={user}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    )
  }

  // Render Landing Page
  return (
    <div className="min-h-screen bg-[#101019] text-[#F4F0FF] selection:bg-[#8B5CF6]/30 selection:text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Navigation Bar with user and onLogout */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero onNavigate={handleNavigate} />

        {/* 3. About ArtNova */}
        <About />

        {/* 4. Features */}
        <Features />

        {/* 5. How It Works */}
        <HowItWorks />

        {/* 6. Contact Section */}
        <Contact />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  )
}
