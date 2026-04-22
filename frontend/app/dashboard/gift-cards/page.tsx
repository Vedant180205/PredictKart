'use client'
import { Gift } from 'lucide-react'

export default function GiftCardsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Gift Cards</h1>
      <p className="text-sm text-gray-400 mb-8">Find discounted gift cards for Amazon, Flipkart, and more.</p>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-64 gap-3">
        <Gift className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Available gift cards will appear here</p>
      </div>
    </div>
  )
}
