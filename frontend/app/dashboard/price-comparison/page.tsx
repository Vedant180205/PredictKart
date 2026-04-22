"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Bell, Sparkles, ShoppingBag, Zap, BarChart3, Gift } from "lucide-react";
import { useSearch } from "../SearchContext";

export default function PriceComparisonPage() {
  const router = useRouter();
  const { 
    lastUrl: url, setLastUrl: setUrl, 
    lastProduct: product, setLastProduct: setProduct, 
    lastOffers: offers, setLastOffers: setOffers 
  } = useSearch();

  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [activeTab, setActiveTab] = useState<"features" | "description" | "specs">("features");
  const [error, setError] = useState<string | null>(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    // Sync context with localStorage on mount if context is empty
    if (!product) {
      const lastProduct = localStorage.getItem("last_searched_product");
      const lastOffers = localStorage.getItem("last_searched_offers");
      const lastUrl = localStorage.getItem("last_searched_url");
      
      if (lastProduct) setProduct(JSON.parse(lastProduct));
      if (lastOffers) setOffers(JSON.parse(lastOffers));
      if (lastUrl) setUrl(lastUrl);
    }
  }, []);

  const handleTrack = async () => {
    if (!product) return;
    setTrackingLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          target_price: parseFloat(targetPrice),
        }),
      });
      if (!res.ok) throw new Error("Failed to track product");
      alert("Product tracked successfully!");
      setShowTrackModal(false);
      setTargetPrice("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleAskAI = () => {
    if (!product) return;
    sessionStorage.setItem("ai_product", JSON.stringify(product));
    sessionStorage.setItem("ai_offers", JSON.stringify(offers));
    router.push("/dashboard/ai-assistant");
  };

  const handleSearch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    setOffers([]);
    
    localStorage.setItem("last_searched_url", url);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/compare?url=${encodeURIComponent(url)}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setProduct(data);
      localStorage.setItem("last_searched_product", JSON.stringify(data));
      localStorage.removeItem("last_searched_offers");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!product) return;
    setComparing(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        product_title: product.title,
        source_platform: product.platform || "",
        source_url: product.url || "",
        source_price: product.current_price?.toString() || ""
      });

      const res = await fetch(`http://127.0.0.1:8000/api/cross-compare?${queryParams}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to fetch comparison");
      const data = await res.json();
      setOffers(data.offers);
      localStorage.setItem("last_searched_offers", JSON.stringify(data.offers));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setComparing(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = (rating % 1) >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg ${i < full ? "text-yellow-500" : half && i === full ? "text-yellow-500" : "text-gray-300"}`}>
            {i < full ? "★" : half && i === full ? "½" : "☆"}
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-2">({product?.reviews_count || 0} reviews)</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">Price Comparison</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste Amazon product URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
        {error && <div className="mt-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}
      </div>

      {product && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header: image left, title + price right */}
          <div className="flex flex-col md:flex-row gap-6 p-6 border-b">
            <div className="md:w-1/3 flex justify-center">
              <img src={product.image_url} alt={product.title} className="max-w-full max-h-80 object-contain" />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              <div className="text-3xl font-bold text-purple-700 mb-4">₹{product.current_price.toFixed(2)}</div>
              <div className="flex gap-2">
                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {comparing ? "Comparing..." : "Compare Prices"}
                </button>
                <button
                  onClick={handleAskAI}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Ask AI
                </button>
                <button
                  onClick={() => setShowTrackModal(true)}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Track
                </button>
              </div>
            </div>
          </div>

          {/* Rating section */}
          {product.rating && (
            <div className="px-6 py-2 border-b">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.floor(product.rating!) ? "text-yellow-500" : i === Math.floor(product.rating!) && product.rating! % 1 >= 0.5 ? "text-yellow-500" : "text-gray-300"}`}>
                    {i < Math.floor(product.rating!) ? "★" : i === Math.floor(product.rating!) && product.rating! % 1 >= 0.5 ? "½" : "☆"}
                  </span>
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviews_count || 0} reviews)</span>
              </div>
            </div>
          )}

          {/* Highlights (short description) */}
          {product.short_description && (
            <div className="px-6 py-6 border-b bg-gray-50/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Key Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.short_description.split('\n').filter(line => line.trim()).map((highlight, idx) => {
                  const [title, desc] = highlight.includes(' — ') 
                    ? highlight.split(' — ') 
                    : [null, highlight];
                  
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-purple-50/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                      {title ? (
                        <>
                          <div className="font-extrabold text-purple-600 mb-2 text-xs uppercase tracking-[0.1em] group-hover:text-purple-800 transition-colors">{title}</div>
                          <div className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">{desc}</div>
                        </>
                      ) : (
                        <div className="text-gray-700 text-sm flex items-start gap-3">
                          <div className="p-1.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <Zap className="w-4 h-4 text-purple-600 shrink-0" />
                          </div>
                          {desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full description */}
          {product.full_description && (
            <div className="px-6 py-8 border-b">
              <h3 className="text-2xl font-bold mb-4">Product Description</h3>
              <div className="text-gray-600 leading-loose max-w-4xl">{product.full_description}</div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="px-6 py-10 border-b bg-gray-50/30">
              <h3 className="text-2xl font-bold mb-8">Technical Specifications</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(() => {
                  const specs = product.specifications;
                  const categories: Record<string, Record<string, string>> = {
                    "Display": {},
                    "Connectivity": {},
                    "Battery": {},
                    "Hardware & Memory": {},
                    "Camera": {},
                    "Design & Build": {},
                    "Software": {},
                    "Item Details": {},
                    "Additional Details": {}
                  };

                  Object.entries(specs).forEach(([key, value]) => {
                    const k = key.toLowerCase();
                    if (k.includes('display') || k.includes('screen') || k.includes('resolution') || k.includes('ppi')) 
                      categories["Display"][key] = value;
                    else if (k.includes('wi-fi') || k.includes('bluetooth') || k.includes('cellular') || k.includes('5g') || k.includes('network'))
                      categories["Connectivity"][key] = value;
                    else if (k.includes('battery') || k.includes('charging') || k.includes('power'))
                      categories["Battery"][key] = value;
                    else if (k.includes('ram') || k.includes('memory') || k.includes('storage') || k.includes('processor') || k.includes('cpu') || k.includes('gpu'))
                      categories["Hardware & Memory"][key] = value;
                    else if (k.includes('camera') || k.includes('lens') || k.includes('optical') || k.includes('mp'))
                      categories["Camera"][key] = value;
                    else if (k.includes('weight') || k.includes('dimension') || k.includes('colour') || k.includes('color') || k.includes('form factor') || k.includes('connector'))
                      categories["Design & Build"][key] = value;
                    else if (k.includes('os') || k.includes('operating system') || k.includes('ios') || k.includes('android'))
                      categories["Software"][key] = value;
                    else if (k.includes('brand') || k.includes('model') || k.includes('manufacturer') || k.includes('country') || k.includes('box'))
                      categories["Item Details"][key] = value;
                    else
                      categories["Additional Details"][key] = value;
                  });

                  return Object.entries(categories).map(([catName, catSpecs]) => {
                    if (Object.keys(catSpecs).length === 0) return null;
                    return (
                      <div key={catName} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-fit">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                          <h4 className="font-bold text-gray-800">{catName}</h4>
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="divide-y divide-gray-100">
                          {Object.entries(catSpecs).map(([k, v]) => (
                            <div key={k} className="grid grid-cols-2 px-4 py-3 text-sm">
                              <span className="text-gray-500 font-medium">{k}</span>
                              <span className="text-gray-900 font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Price Comparison table */}
          {offers.length > 0 && (
            <div className="p-6 border-t bg-gray-50">
              <h3 className="text-xl font-bold mb-4">Price Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Store</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{offer.platform}</td>
                        <td className="px-4 py-2">{offer.price || "N/A"}</td>
                        <td className="px-4 py-2">
                          {offer.url && (
                            <a href={offer.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Deal
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Modal JSX */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Set Target Price</h3>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price (₹)"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTrackModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleTrack} disabled={trackingLoading} className="px-4 py-2 bg-purple-600 text-white rounded">
                {trackingLoading ? "Saving..." : "Track"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
