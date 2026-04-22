'use client'

import { Mail, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contact" className="w-full bg-slate-950 text-slate-300 py-16 px-8 rounded-t-[3rem] mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">
            Join 50,000+ smart shoppers.
          </h3>
          <p className="text-slate-400 mb-6">
            Get the best hidden deals delivered weekly.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800 placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg">
              Subscribe
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-12"></div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              prerdict<span className="text-blue-600">.</span>cart
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your AI shopping companion. Compare, predict, and save across the Indian e-commerce landscape.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50"
              >
                <Twitter className="w-5 h-5 text-slate-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50"
              >
                <Instagram className="w-5 h-5 text-slate-300 hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50"
              >
                <Linkedin className="w-5 h-5 text-slate-300 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: Features */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Features</h3>
            <ul className="space-y-3">
              {['Price History', 'AI Fake Alert', 'Spend Lens', 'Auto-Buy', 'API Access'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tracked Stores */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Tracked Stores</h3>
            <ul className="space-y-3">
              {['Amazon India', 'Flipkart', 'Myntra', 'Ajio', 'Tata Cliq'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Legal & Contact</h3>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="mailto:contact@prerdictcart.com"
                  className="text-slate-400 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  contact@prerdictcart.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            © 2026 Prerdict Cart. All rights reserved. Built for smart buyers.
          </p>
        </div>
      </div>
    </footer>
  )
}
