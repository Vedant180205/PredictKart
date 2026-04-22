"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShieldCheck, AlertCircle, Loader2, Sparkles, ArrowRight, BarChart3, Clock } from "lucide-react";

interface TrackedProduct {
  tracking_id: string;
  product_id: string;
  title: string;
  target_price: number;
  last_price: number | null;
  last_checked: string | null;
  image_url: string;
}

interface DealReport {
  score: number;
  recommendation: string;
  reasoning: string;
  current_price: number;
  lowest_price: number;
  average_price: number;
}

export default function DealPredictorPage() {
  const [tracked, setTracked] = useState<TrackedProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DealReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracked products
  useEffect(() => {
    const fetchTracked = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user-tracking");
        if (!res.ok) throw new Error("Failed to fetch tracked products");
        const data = await res.json();
        setTracked(data.tracked);
        if (data.tracked.length > 0) {
          setSelectedProductId(data.tracked[0].product_id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTracked();
  }, []);

  const generateReport = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    setReport(null);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/deal-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: selectedProductId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate report");
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationBadge = (rec: string) => {
    const styles = {
      "Buy now": "bg-green-100 text-green-800 border-green-200",
      Wait: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Avoid: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[rec as keyof typeof styles] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === "Buy now") return <ShieldCheck className="w-5 h-5 text-green-600" />;
    if (rec === "Wait") return <Clock className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Deal Predictor
        </h1>
        <p className="text-gray-500 mt-2">AI-powered market analysis and buying recommendations.</p>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select a tracked product:</label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 font-medium"
              >
                {tracked.map((item) => (
                  <option key={item.product_id} value={item.product_id}>
                    {item.title.length > 60 ? item.title.substring(0, 60) + "..." : item.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={loading || !selectedProductId}
            className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 min-w-[220px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Deal Report
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {report && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Header / Score Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Market Confidence</h2>
                  <div className="flex items-center gap-4 justify-center sm:justify-start">
                    <span className={`text-7xl font-black ${getScoreColor(report.score)}`}>
                      {report.score}
                    </span>
                    <div className="h-12 w-px bg-gray-200 hidden sm:block" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-500">Deal Score</p>
                      <p className="text-xs text-gray-400">Based on 30-day history</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center sm:items-end gap-3">
                  <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-black text-lg ${getRecommendationBadge(report.recommendation)} shadow-sm`}>
                    {getRecommendationIcon(report.recommendation)}
                    {report.recommendation}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI-Generated Advice
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Body */}
            <div className="p-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                  Buying Rationale
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  "{report.reasoning}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Price</p>
                  <p className="text-2xl font-black text-gray-900">₹{report.current_price.toLocaleString()}</p>
                </div>
                <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100">
                  <p className="text-xs font-bold text-green-600/60 uppercase mb-1">Lowest Recorded</p>
                  <p className="text-2xl font-black text-green-700">₹{report.lowest_price.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                  <p className="text-xs font-bold text-blue-600/60 uppercase mb-1">Average (30d)</p>
                  <p className="text-2xl font-black text-blue-700">₹{report.average_price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tracked.length === 0 && !loading && !error && (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products to analyze</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any tracked products yet. Search for a product and click "Track" to see AI deal predictions here.
          </p>
        </div>
      )}
    </div>
  );
}
