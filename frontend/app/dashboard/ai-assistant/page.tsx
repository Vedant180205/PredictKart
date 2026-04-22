"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your savvy shopping advisor. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load product and offers from sessionStorage
    const storedProduct = sessionStorage.getItem("ai_product");
    const storedOffers = sessionStorage.getItem("ai_offers");
    if (storedProduct) {
      const product = JSON.parse(storedProduct);
      setProductId(product.id);
      // Optional: push an automated message if we just arrived from a product
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `I see you're looking at "${product.title}". I've analyzed the price comparison for you. What would you like to know?` 
      }]);
    }
    if (storedOffers) {
      setOffers(JSON.parse(storedOffers));
    }
  }, []);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMessage = query.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setQuery("");
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          product_id: productId,
          offers: offers,
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to get response");
      }
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-120px)] flex gap-8">
      {/* Left Column: Chat UI */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
              <Bot className="w-7 h-7 text-purple-600" />
              Shopping Assistant
            </h1>
            <p className="text-xs text-gray-500">Your personal advisor for the best deals</p>
          </div>
          {productId && (
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Analyzing Product</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-3xl shadow-sm p-5 mb-4 border border-gray-100 space-y-4 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "user" ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white" : "bg-white border border-gray-100 text-purple-600"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-3.5 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-white border border-gray-100 p-3.5 px-4 rounded-2xl shadow-sm animate-pulse">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="text-xs text-gray-500">Advisor is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative group">
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-3.5 px-5 bg-transparent rounded-2xl outline-none text-sm text-gray-800"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !query.trim()}
              className="m-1.5 p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-md shadow-purple-500/10"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Spline Robot */}
      <div className="hidden xl:flex w-[320px] flex-col">
        <div className="flex-1 bg-[#DDE0ED] rounded-[32px] overflow-hidden relative border border-gray-100 shadow-sm">
          <iframe 
            src='https://my.spline.design/happyrobotbutton-crTiVKFI6Tn95nyOMxUqkaB9/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="scale-90 origin-center"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
