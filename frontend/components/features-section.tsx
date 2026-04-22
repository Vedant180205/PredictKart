'use client'

import Image from 'next/image'
import { BarChart3, Bell, Zap } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-white">
      {/* Feature 1: Cross-Store Comparison (NOW FIRST) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual */}
          <div className="relative h-96 flex items-center justify-center order-2 lg:order-1">
            <div className="w-full h-full rounded-3xl overflow-hidden relative">
              {/* Product Card 1 - Amazon */}
              <div className="absolute top-0 left-0 w-56 h-64 bg-white rounded-2xl shadow-xl p-4 border-4 border-blue-200 z-10 hover:z-30 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="h-32 bg-gradient-to-b from-orange-300 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">👟</span>
                </div>
                <span className="text-xs font-bold text-gray-500 block mb-2">AMAZON</span>
                <span className="text-xl font-bold text-gray-900 mb-2">₹2,999</span>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-bold">
                  View on Amz
                </button>
              </div>

              {/* Product Card 2 - Flipkart */}
              <div className="absolute top-12 left-32 w-56 h-64 bg-white rounded-2xl shadow-lg p-4 border-4 border-gray-300 z-20 hover:z-30 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="h-32 bg-gradient-to-b from-blue-300 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">👟</span>
                </div>
                <span className="text-xs font-bold text-gray-500 block mb-2">FLIPKART</span>
                <span className="text-xl font-bold text-gray-900 mb-2">₹3,200</span>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">
                  View on Flp
                </button>
              </div>

              {/* Product Card 3 - Myntra (Best Price Highlighted) */}
              <div className="absolute top-24 left-64 w-56 h-64 bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-600 z-30 hover:z-40 transition-all duration-300 hover:shadow-2xl hover:scale-105 ring-2 ring-blue-600">
                <div className="absolute -top-3 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  BEST PRICE
                </div>
                <div className="h-32 bg-gradient-to-b from-pink-300 to-pink-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">👟</span>
                </div>
                <span className="text-xs font-bold text-gray-500 block mb-2">MYNTRA</span>
                <span className="text-2xl font-bold text-blue-600 mb-2">₹2,850</span>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                One Link. Every Store. Best Price.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Don&apos;t open 10 tabs. Paste a single product link, and we&apos;ll instantly scrape and compare prices across Amazon, Flipkart, Myntra, and more to find your absolute lowest price.
              </p>
            </div>
            <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl">
              Start Comparing
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2: AI Deal Predictor (NOW SECOND) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block bg-yellow-300 text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                AI Buying Intelligence
              </span>
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Wait for the Sale or Buy Now? Let AI Decide.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our AI Deal Predictor generates comprehensive buying reports by analyzing years of price history combined with upcoming sales events like Big Billion Days and Great Indian Festival.
              </p>
            </div>
            <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl">
              Get Smart Recommendations
            </button>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 flex items-center justify-center shadow-2xl">
              {/* Mock UI Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Sony Headphones WH-1000XM5</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-400 block line-through">₹29,999</span>
                    <span className="text-2xl font-bold text-gray-900">₹24,999</span>
                  </div>
                </div>

                {/* Deal Score Badge */}
                <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase">Deal Score</p>
                    <p className="text-2xl font-black text-green-700">85/100</p>
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Excellent Deal</span>
                </div>

                {/* AI Advice */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 italic">"Price is at a 6-month low. Buy now before upcoming Big Billion Days as stock may run out."</p>
                </div>

                {/* Badges */}
                <div className="flex gap-2 pt-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold">
                    ✓ Verified Discount
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold">
                    ✨ AI Predicted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Spend Lens & Intelligence */}
      <div id="spend-lens" className="w-full bg-slate-900 text-white py-24 rounded-t-[3rem] rounded-b-[3rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black leading-tight mb-4">
              Spend Lens: Your Shopping Intelligence.
            </h2>
            <p className="text-lg text-gray-300">Heuristic delta tracking across multi-channel retail endpoints.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: Review Sentiment */}
            <div className="bg-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-700 hover:border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Review Sentiment Summaries</h3>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                We read 1,000+ reviews in seconds and give you the TL;DR.
              </p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-green-400">Pros</span>
                    <span className="text-xs font-bold text-gray-400">87%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400">Cons</span>
                    <span className="text-xs font-bold text-gray-400">13%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '13%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Smart Alerts */}
            <div className="bg-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-700 hover:border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold">Smart Alerts</h3>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Get notified the moment prices drop below your target.
              </p>

              <div className="bg-slate-700 rounded-xl p-4 border-l-4 border-yellow-500">
                <p className="text-xs font-bold text-yellow-400 mb-1">🔔 Price Drop Alert</p>
                <p className="text-sm font-semibold mb-2">Sony Headphones hit ₹19,999!</p>
                <p className="text-xs text-gray-300">Your target price: ₹20,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
