import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { ProfileSection } from '../components/dashboard/ProfileSection'
import { PortfolioSection } from '../components/dashboard/PortfolioSection'
import { DiscoverSection } from '../components/dashboard/DiscoverSection'
import { OpportunitiesSection } from '../components/dashboard/OpportunitiesSection'
import { CollaborationsSection } from '../components/dashboard/CollaborationsSection'
import { MessagesSection } from '../components/dashboard/MessagesSection'
import { AiStudioSection } from '../components/dashboard/AiStudioSection'
import {
  LayoutDashboard,
  User,
  Image,
  Compass,
  Sparkles,
  Users,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Plus,
  Database,
} from 'lucide-react'

export function DashboardPage({ user, onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    portfolioCount: 0,
    collaborationsCount: 0,
    opportunitiesCount: 0,
  })

  const userName = user?.user_metadata?.full_name || 'Creator'
  const userEmail = user?.email || ''

  useEffect(() => {
    let isMounted = true

    async function fetchLiveStats() {
      if (!user?.id) return

      const [portfolioRes, collabRes, oppsRes] = await Promise.all([
        supabase
          .from('portfolio_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('collaborations')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('collaboration_opportunities')
          .select('id', { count: 'exact', head: true }),
      ])

      if (!isMounted) return

      setStats({
        portfolioCount: portfolioRes.count || 0,
        collaborationsCount: collabRes.count || 0,
        opportunitiesCount: oppsRes.count || 0,
      })
    }

    fetchLiveStats()
    return () => {
      isMounted = false
    }
  }, [user, activeTab])

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ai', label: 'ArtNova AI', icon: Bot, badge: 'AI' },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'portfolio', label: 'My Portfolio', icon: Image },
    { id: 'discover', label: 'Discover Artists', icon: Compass },
    { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
    { id: 'collaborations', label: 'Collaborations', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    setMobileSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#101019] text-[#F4F0FF] flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#171725] border-b border-[#8B5CF6]/15 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1px]">
            <div className="w-full h-full bg-[#101019] rounded-[6px] flex items-center justify-center">
              <span className="font-['Outfit'] font-bold text-xs text-[#F4F0FF]">A</span>
            </div>
          </div>
          <span className="font-['Outfit'] font-bold text-sm text-[#F4F0FF]">
            ART<span className="text-[#A78BFA]">NOVA</span>
          </span>
          <span className="text-xs text-[#9490A8] ml-2">/ Dashboard</span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-[#101019] border border-[#8B5CF6]/20 text-[#9490A8] hover:text-white"
          aria-label="Toggle navigation drawer"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-40 w-64 bg-[#171725] border-r border-[#8B5CF6]/15 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-5 flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-[#8B5CF6]/15">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                onNavigate('home')
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1px]">
                <div className="w-full h-full bg-[#101019] rounded-[7px] flex items-center justify-center">
                  <span className="font-['Outfit'] font-bold text-sm text-[#F4F0FF]">A</span>
                </div>
              </div>
              <span className="text-lg font-bold font-['Outfit'] tracking-tight text-[#F4F0FF]">
                ART<span className="text-[#A78BFA]">NOVA</span>
              </span>
            </a>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-[#9490A8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full mb-4 px-3 py-2 rounded-xl text-xs font-medium text-[#9490A8] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer text-left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </button>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9490A8] px-3 mb-2 block">
              Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'text-[#9490A8] hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom User Info & Logout */}
        <div className="p-4 border-t border-[#8B5CF6]/15 bg-[#101019]/40 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate block">{userName}</span>
              <span className="text-[10px] text-[#9490A8] truncate block">{userEmail}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onLogout}
            icon={LogOut}
            className="w-full justify-center text-xs"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#171725] to-[#1d1d30] border border-[#8B5CF6]/25 p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-medium text-[#A78BFA] mb-4">
                <span>Creator Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F4F0FF] font-['Outfit'] tracking-tight mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#9490A8] leading-relaxed mb-4 max-w-2xl">
                Manage your creative identity, organize portfolio works, and discover collaborators across creative disciplines.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#A78BFA]">
                <span>Account Email:</span>
                <span className="text-white font-mono bg-[#101019] px-2.5 py-0.5 rounded-md border border-[#8B5CF6]/20">
                  {userEmail}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-4 font-['Outfit']">
                Live Workspace Activity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    label: 'Portfolio Works',
                    value: stats.portfolioCount,
                    icon: Image,
                    tab: 'portfolio',
                    desc: 'Original works published to your showcase.',
                  },
                  {
                    label: 'Active Collaborations',
                    value: stats.collaborationsCount,
                    icon: Users,
                    tab: 'collaborations',
                    desc: 'Joint workspaces tracked in your studio.',
                  },
                  {
                    label: 'Open Opportunities',
                    value: stats.opportunitiesCount,
                    icon: Sparkles,
                    tab: 'opportunities',
                    desc: 'Live project calls across the community.',
                  },
                ].map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      onClick={() => handleTabClick(stat.tab)}
                      className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#9490A8] uppercase tracking-wider">
                          {stat.label}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#A78BFA]">
                          <StatIcon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-white font-['Outfit'] mb-1">
                        {stat.value}
                      </div>
                      <p className="text-[11px] text-[#9490A8]">{stat.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-4 font-['Outfit']">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                  onClick={() => handleTabClick('ai')}
                  className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all mb-4">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] mb-1.5">
                    ArtNova AI Matchmaker
                  </h3>
                  <p className="text-xs text-[#9490A8] leading-relaxed mb-4">
                    Describe your project and let Gemini AI match you with the right creators and draft pitches.
                  </p>
                  <span className="text-xs font-semibold text-[#A78BFA]">Launch AI Studio -&gt;</span>
                </div>

                <div
                  onClick={() => handleTabClick('portfolio')}
                  className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all mb-4">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] mb-1.5">
                    Upload Portfolio Work
                  </h3>
                  <p className="text-xs text-[#9490A8] leading-relaxed mb-4">
                    Publish new artwork, visual concepts, or designs to your public gallery.
                  </p>
                  <span className="text-xs font-semibold text-[#A78BFA]">Go to Portfolio -&gt;</span>
                </div>

                <div
                  onClick={() => handleTabClick('collaborations')}
                  className="p-6 rounded-2xl bg-[#171725] border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] mb-1.5">
                    Manage Collaborations
                  </h3>
                  <p className="text-xs text-[#9490A8] leading-relaxed mb-4">
                    Launch co-production workspaces and check off shared project milestones.
                  </p>
                  <span className="text-xs font-semibold text-[#A78BFA]">Open Collaborations -&gt;</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#171725]/60 border border-[#8B5CF6]/15 text-xs text-[#9490A8] flex items-start gap-3">
              <Database className="w-5 h-5 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold block mb-0.5">
                  Phase 13: ArtNova AI Studio Active
                </span>
                <span>
                  AI Collaborator Matchmaking and Creative Guidance are live. Pro Subscriptions are up next in Phase 14.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <AiStudioSection user={user} onNavigateTab={handleTabClick} />
        )}

        {activeTab === 'profile' && <ProfileSection user={user} />}

        {activeTab === 'portfolio' && <PortfolioSection user={user} />}

        {activeTab === 'discover' && <DiscoverSection currentUser={user} />}

        {activeTab === 'opportunities' && <OpportunitiesSection user={user} />}

        {activeTab === 'collaborations' && <CollaborationsSection user={user} />}

        {activeTab === 'messages' && <MessagesSection user={user} />}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#8B5CF6]/15">
              <div>
                <h1 className="text-2xl font-bold text-white font-['Outfit']">
                  Account Settings
                </h1>
                <p className="text-xs text-[#9490A8] mt-1">
                  Manage security and account preferences
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleTabClick('overview')}>
                Back to Overview
              </Button>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#171725] border border-[#8B5CF6]/20 max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] mb-1">
                  Authentication &amp; Email
                </h3>
                <p className="text-xs text-[#9490A8] mb-3">
                  Your primary credential managed via Supabase Auth.
                </p>
                <div className="p-3.5 rounded-xl bg-[#101019] border border-[#8B5CF6]/15 text-xs text-white flex items-center justify-between">
                  <span>{userEmail}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Verified
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#8B5CF6]/15">
                <h3 className="text-sm font-bold text-white font-['Outfit'] mb-1">
                  Session Control
                </h3>
                <p className="text-xs text-[#9490A8] mb-4">
                  Log out of your creator session on this device.
                </p>
                <Button variant="secondary" size="sm" onClick={onLogout} icon={LogOut}>
                  Sign Out from ArtNova
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage