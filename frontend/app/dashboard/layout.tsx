'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Search, BarChart2, Bell, Gift,
  Bot, TrendingUp, Settings, Menu, X, Mic, Command, ChevronDown, Zap, LogOut
} from 'lucide-react'

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Account Overview', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    label: 'Core Tools',
    items: [
      { label: 'Price Comparison', icon: Search, href: '/dashboard/price-comparison' },
      { label: 'Spend Lens', icon: BarChart2, href: '/dashboard/spend-lens' },
      { label: 'Price Alerts', icon: Bell, href: '/dashboard/price-alerts' },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { label: 'Gift Cards', icon: Gift, href: '/dashboard/gift-cards' },
    ],
  },
  {
    label: 'AI Intelligence',
    items: [
      { label: 'AI Assistant', icon: Bot, href: '/dashboard/ai-assistant' },
      { label: 'Deal Predictor', icon: TrendingUp, href: '/dashboard/deal-predictor' },
    ],
  },
]

function Sidebar({ open, onClose, user }: { open: boolean; onClose: () => void; user: any }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear user auth
    localStorage.removeItem('user_info')
    
    // Clear search persistence
    localStorage.removeItem('last_searched_product')
    localStorage.removeItem('last_searched_offers')
    localStorage.removeItem('last_searched_url')
    
    // Clear AI context
    sessionStorage.removeItem('ai_product')
    sessionStorage.removeItem('ai_offers')
    
    router.push('/')
  }
  
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'No email'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-black text-gray-900 tracking-tight">
              prerdict<span className="text-blue-500">.cart</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
                          ${active
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile card */}
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">{displayEmail}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-700 shrink-0">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 shrink-0 ml-1" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

import { SearchProvider } from './SearchContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem('user_info')
    if (data) {
      setUser(JSON.parse(data))
    }
  }, [])

  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <SearchProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-gray-100 h-16 flex items-center px-4 gap-4 shrink-0 z-20">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, alerts, deals..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
                <div className="flex items-center gap-1.5 border-l border-gray-300 pl-2">
                  <kbd className="flex items-center gap-1 text-gray-400">
                    <Command className="w-3 h-3" />
                    <span className="text-[10px]">K</span>
                  </kbd>
                  <Mic className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-gray-500 hidden sm:block">Integrations</span>

              {/* Notification bell */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              {/* Online community avatars */}
              <div className="hidden sm:flex items-center">
                <div className="flex -space-x-2">
                  {['#3B82F6', '#10B981', '#F59E0B'].map((color, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {['A', 'S', 'R'][i]}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">+12 online</span>
              </div>

              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                {initial}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
