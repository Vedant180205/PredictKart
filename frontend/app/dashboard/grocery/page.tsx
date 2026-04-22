'use client'
import { ShoppingCart } from 'lucide-react'

export default function GroceryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Grocery Compare</h1>
      <p className="text-sm text-gray-400 mb-8">Compare prices on BigBasket, Zepto, Blinkit, and Instamart.</p>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-64 gap-3">
        <ShoppingCart className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Search for a grocery item to compare</p>
      </div>
    </div>
  )
}
