'use client'
import { BarChart2 } from 'lucide-react'

export default function SpendLensPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Spend Lens</h1>
      <p className="text-sm text-gray-400 mb-8">Visual breakdown of your spending across all tracked products.</p>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-64 gap-3">
        <BarChart2 className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Your spending charts will appear here</p>
        <p className="text-gray-300 text-xs">Start tracking products to see insights</p>
      </div>
    </div>
  )
}
