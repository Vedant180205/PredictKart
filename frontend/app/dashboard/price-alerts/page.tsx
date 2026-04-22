"use client";

import { useState, useEffect } from "react";
import { Bell, RefreshCw, ExternalLink, Trash2, TrendingDown, Clock, ShoppingCart } from "lucide-react";

interface TrackedProduct {
  tracking_id: string;
  product_id: string;
  title: string;
  target_price: number;
  last_price: number | null;
  last_checked: string | null;
  product_url: string;
  image_url: string;
}

export default function PriceAlertsPage() {
  const [tracked, setTracked] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTracked = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/user-tracking");
      if (!res.ok) throw new Error("Failed to fetch tracked products");
      const data = await res.json();
      setTracked(data.tracked);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (tracking_id: string) => {
    setUpdating(tracking_id);
    try {
      const res = await fetch(`http://localhost:8000/api/update-track/${tracking_id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      
      // Update local state
      setTracked(prev =>
        prev.map(item =>
          item.tracking_id === tracking_id
            ? { ...item, last_price: data.last_price, last_checked: data.last_checked }
            : item
        )
      );
      
      // Show custom message
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchTracked();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading your trackers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Price Alerts
          </h1>
          <p className="text-gray-500">Manage your active product trackers and target prices</p>
        </div>
        <button 
          onClick={fetchTracked}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {tracked.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Trackers</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't added any products to your watch list yet. Go to the Price Comparison tool to start tracking.
          </p>
          <a 
            href="/dashboard/price-comparison" 
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-100"
          >
            Start Tracking
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {tracked.map((item) => (
            <div 
              key={item.tracking_id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Image Section */}
                <div className="w-24 h-24 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                  <img src={item.image_url} alt={item.title} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{item.title}</h3>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                      <TrendingDown className="w-4 h-4" />
                      Target: ₹{item.target_price}
                    </div>
                    {item.last_price !== null && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        <ShoppingCart className="w-4 h-4" />
                        Last: ₹{item.last_price}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      {item.last_checked ? new Date(item.last_checked).toLocaleString() : "Never checked"}
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePrice(item.tracking_id)}
                    disabled={updating === item.tracking_id}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {updating === item.tracking_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Update Price
                  </button>
                  <a
                    href={item.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
