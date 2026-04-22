'use client'

import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  onLoginClick: () => void
}

export function Navigation({ onLoginClick }: NavigationProps) {
  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 relative">
                <span className="inline-block hover:animate-bounce">p</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.1s' }}>r</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.2s' }}>e</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.3s' }}>d</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.4s' }}>i</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.5s' }}>c</span>
                <span className="inline-block hover:animate-bounce" style={{ animationDelay: '0.6s' }}>t</span>
                <span className="inline-block text-cyan-500 font-black ml-1">Kart</span>
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-3">
                <input
                  type="text"
                  placeholder="Paste product link to compare..."
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500 text-sm"
                />
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              <a href="#categories" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Categories
              </a>
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#spend-lens" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Spend Lens
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </a>
              <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 h-auto text-sm font-medium">
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

    </>
  )
}
