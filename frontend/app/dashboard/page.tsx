'use client'
import { useState, useEffect } from 'react'

import { ArrowUpRight, Bell, TrendingDown, ShieldAlert, Clock, RefreshCcw, Package } from 'lucide-react'
import Image from 'next/image'

// ── Live Feed ─────────────────────────────────────────────────────────────────
const feedItems = [
  {
    icon: TrendingDown,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Price Drop Detected',
    desc: 'Sony WH-1000XM5 fell by 15%',
    time: 'Today, 4:12 pm',
    tag: 'Alert',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    icon: ShieldAlert,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    title: 'AI Fake Discount',
    desc: 'Flagged deal on Myntra – Inflated MRP',
    time: 'Today, 2:30 pm',
    tag: 'Flagged',
    tagColor: 'bg-red-100 text-red-600',
  },
  {
    icon: Bell,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    title: 'Alert Triggered',
    desc: 'iPhone 15 hit ₹72,000 target on Flipkart',
    time: 'Yesterday, 9:45 am',
    tag: 'Triggered',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: RefreshCcw,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    title: 'Tracker Updated',
    desc: 'Samsung Galaxy S24 price refreshed',
    time: 'Yesterday, 8:00 am',
    tag: 'Updated',
    tagColor: 'bg-purple-100 text-purple-700',
  },
]

// ── Recent products ────────────────────────────────────────────────────────────
const recentProducts = [
  {
    name: 'iPhone 15 Pro Max',
    category: 'Electronics',
    categoryColor: 'bg-blue-100 text-blue-700',
    price: '₹1,34,900',
    drop: '↓ ₹5,000',
    dropColor: 'text-green-600',
    img: 'https://images.unsplash.com/photo-1697571046878-13f9e27a6e6c?w=400&q=80',
    platform: 'Flipkart',
  },
  {
    name: 'Nike Air Max 270',
    category: 'Fashion',
    categoryColor: 'bg-pink-100 text-pink-700',
    price: '₹9,995',
    drop: '↓ ₹2,500',
    dropColor: 'text-green-600',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    platform: 'Amazon',
  },
]

export default function DashboardPage() {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ 
    active_trackers: 0, 
    total_saved: 0, 
    alerts_triggered: 0,
    alerts_today: 0,
    scans_today: 0,
    last_tracker_update: null as string | null
  })

  const [recentProducts, setRecentProducts] = useState<any[]>([])

  useEffect(() => {
    const data = localStorage.getItem('user_info')
    if (data) {
      setUser(JSON.parse(data))
    }
    
    const savedAvatar = localStorage.getItem('user_avatar')
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar)
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/user-stats'),
          fetch('http://127.0.0.1:8000/api/recent-tracking')
        ])
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
        
        if (recentRes.ok) {
          const recentData = await recentRes.json()
          setRecentProducts(recentData)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      }
    }
    fetchDashboardData()
  }, [])

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'No email'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex h-full">
      {/* ── Left + Center content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Activity</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, {displayName} — here's your shopping intelligence summary.</p>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">Choose Your Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <Package className="w-4 h-4 rotate-45" /> {/* Using Package as a placeholder for X if not imported, but I'll add X */}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80',
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
                  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80',
                ].map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAvatar(url)
                      localStorage.setItem('user_avatar', url)
                      setShowAvatarPicker(false)
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${selectedAvatar === url ? 'border-blue-600 shadow-lg shadow-blue-100' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <Image src={url} alt="Avatar option" fill className="object-cover" />
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setSelectedAvatar(null)
                  localStorage.removeItem('user_avatar')
                  setShowAvatarPicker(false)
                }}
                className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                Reset to Default Logo
              </button>
            </div>
          </div>
        )}

        {/* ── Profile Bento Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex overflow-hidden min-h-[220px]">
          {/* Left Vertical Brand Sidebar */}
          <div className="w-40 bg-gradient-to-b from-blue-600 to-indigo-700 flex flex-col items-center justify-center relative shrink-0">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            {/* User Logo / Avatar Area */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30 shadow-2xl relative z-10 overflow-hidden transition-transform group-hover:scale-105">
                {selectedAvatar ? (
                  <Image src={selectedAvatar} alt="Profile" fill className="object-cover" />
                ) : (
                  <Package className="w-10 h-10" /> // Using Package as logo placeholder for now
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-20 border border-gray-100 text-blue-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <p className="mt-4 text-[10px] font-black text-white/60 uppercase tracking-[0.2em] relative z-10">
              Profile
            </p>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-400 font-medium">Verified Intelligence Hub • Since 2024</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <div className="flex gap-2 mt-4">
                   <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm">
                     🏆 Pro Deal Hunter
                   </span>
                   <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-purple-50 text-purple-600 px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
                     ✨ Early Adopter
                   </span>
                </div>
              </div>

              {/* Info Aligned to Right */}
              <div className="text-sm space-y-3 text-gray-500 min-w-[200px]">
                <div className="flex items-center justify-end gap-3 group">
                   <span className="text-right font-medium group-hover:text-blue-600 transition-colors">{displayEmail}</span>
                   <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">📧</div>
                </div>
                <div className="flex items-center justify-end gap-3 group">
                   <span className="text-right font-medium group-hover:text-pink-600 transition-colors">Pune, India</span>
                   <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-sm border border-pink-100">📍</div>
                </div>
                <div className="flex items-center justify-end gap-3 group">
                   <span className="text-right font-medium group-hover:text-green-600 transition-colors">Amazon, Flipkart, Myntra</span>
                   <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100">🛍️</div>
                </div>
              </div>
            </div>

            {/* Stats Integrated into Bottom */}
            <div className="mt-8 grid grid-cols-3 gap-10 pt-6 border-t border-gray-50">
              {[
                { label: 'Active Trackers', value: stats.active_trackers, color: 'bg-pink-500', icon: '📦' },
                { label: 'Total Saved', value: `₹${stats.total_saved.toLocaleString()}`, color: 'bg-blue-500', icon: '💰' },
                { label: 'Alerts Triggered', value: stats.alerts_triggered, color: 'bg-green-500', icon: '🔔' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <div className={`h-1.5 w-12 ${stat.color} rounded-full mt-1 opacity-80`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── My Summary — Colored Bento Boxes ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">My Summary</h2>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RefreshCcw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pastel Green */}
            <div className="bg-[#d1f5d3] rounded-3xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div>
                <p className="text-sm font-semibold text-green-800">Pending Price Drops</p>
                <p className="text-xs text-green-700/70 mt-0.5">Updated 1 hr ago</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-5xl font-black text-green-700">12</p>
                <button className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center text-green-700 hover:bg-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pastel Blue */}
            <div className="bg-[#c7e8fb] rounded-3xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div>
                <p className="text-sm font-semibold text-blue-800">High Confidence Deals</p>
                <p className="text-xs text-blue-700/70 mt-0.5">AI Predicted</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-5xl font-black text-blue-700">5</p>
                <button className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center text-blue-700 hover:bg-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pastel Pink */}
            <div className="bg-[#fdd5df] rounded-3xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div>
                <p className="text-sm font-semibold text-pink-800">Missed Opportunities</p>
                <p className="text-xs text-pink-700/70 mt-0.5">Alerts ignored</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-5xl font-black text-pink-700">2</p>
                <button className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center text-pink-700 hover:bg-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Tracking ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
              View All History <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recentProducts.length > 0 ? recentProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md ${product.categoryColor} border border-white/20`}>
                    {product.category}
                  </span>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-900 hover:bg-white shadow-lg transition-transform hover:rotate-12">
                      <ArrowUpRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-1">{product.name}</h3>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${product.platform === 'Amazon' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {product.platform}
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Live Price</span>
                        <p className="text-xl font-black text-gray-900 leading-none">{product.price}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Price Delta</span>
                      <p className={`text-sm font-black flex items-center justify-end gap-0.5 ${product.dropColor}`}>
                         {product.drop}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                  <Package className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-400">No products tracked yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start by adding a product URL in the sidebar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Sidebar — Live Feed ─────────────────────────────────────────── */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
        {/* Online now */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Now online</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">3 active</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {['#3B82F6', '#10B981', '#F59E0B'].map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color }}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
              >
                {['A', 'S', 'R'][i]}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">+9 more</span>
          </div>
        </div>

        {/* Live Feed */}
        <div className="px-5 py-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-800">Live Deal Feed</p>
            <RefreshCcw className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-700" />
          </div>

          <div className="space-y-4">
            {feedItems.map((item, i) => (
              <div key={i} className="flex gap-3 group cursor-pointer">
                {/* Timestamp column */}
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  {i < feedItems.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 min-h-[16px]" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-gray-700">Today's Summary</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                { label: 'Today Scans', value: stats.scans_today },
                { label: 'Today Drops', value: stats.alerts_today },
                { label: 'Saved', value: `₹${stats.total_saved.toLocaleString()}` },
                { label: 'Alerts', value: stats.alerts_triggered },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl py-2 shadow-sm border border-gray-50">
                  <p className="text-sm font-black text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
            {stats.last_tracker_update && (
              <p className="text-[10px] text-gray-400 mt-3 text-center">
                Last updated: {new Date(stats.last_tracker_update).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
