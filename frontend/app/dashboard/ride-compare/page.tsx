'use client'
import { Car } from 'lucide-react'

export default function RideComparePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Ride Compare</h1>
      <p className="text-sm text-gray-400 mb-8">Compare Ola, Uber, and Rapido fares for your route.</p>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-64 gap-3">
        <Car className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Enter pickup and drop to compare fares</p>
      </div>
    </div>
  )
}
