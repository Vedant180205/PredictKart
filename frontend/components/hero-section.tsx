'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function HeroSection() {
  return (
    <div className="bg-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Container */}
        <div className="bg-gray-100 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-8">
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight">
                  Price History & Tracker – Find{' '}
                  <span className="text-blue-600">Real Deals</span>, Skip the Fake Ones!
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed max-w-md">
                  Track genuine price drops, compare across stores, and shop smarter every day.
                </p>
              </div>



              {/* Promo Cards */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                {/* Card 1: Yellow */}
                <div className="bg-yellow-400 rounded-2xl p-5 flex-1 flex flex-col gap-3">
                  <h3 className="text-blue-600 font-bold text-lg">AI Fake Alert</h3>
                  <p className="text-gray-800 text-sm font-medium">Detects fake discounts instantly.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-4 py-2 h-auto text-xs font-medium rounded-lg">
                    View Example
                  </Button>
                </div>

                {/* Card 2: White */}
                <div className="bg-white rounded-2xl p-5 flex-1 flex flex-col gap-3 shadow-md border border-gray-200">
                  <h3 className="text-black font-bold text-lg">98% Deal Score</h3>
                  <p className="text-gray-700 text-sm font-medium">Best time to buy right now!</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-4 py-2 h-auto text-xs font-medium rounded-lg">
                    See Why
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern shopping and e-commerce lifestyle"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
