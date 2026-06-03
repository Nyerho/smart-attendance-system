import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <a
            href="/"
            className="text-2xl font-bold tracking-tighter text-white flex items-center gap-1"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span>AURA</span>
          </a>
          <p className="text-sm leading-relaxed">
            Elevating your lifestyle with premium essentials. We believe in
            quality, sustainability, and timeless design.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-bold mb-6">Shop</h4>
          <ul className="space-y-4 text-sm">
            <li>
              <a
                href="/products"
                className="hover:text-emerald-500 transition-colors"
              >
                All Products
              </a>
            </li>
            <li>
              <a
                href="/products?category=Electronics"
                className="hover:text-emerald-500 transition-colors"
              >
                Electronics
              </a>
            </li>
            <li>
              <a
                href="/products?category=Apparel"
                className="hover:text-emerald-500 transition-colors"
              >
                Apparel
              </a>
            </li>
            <li>
              <a
                href="/products?category=Accessories"
                className="hover:text-emerald-500 transition-colors"
              >
                Accessories
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                New Arrivals
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Returns & Refunds
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-sm mb-6">
            Subscribe to get special offers, free giveaways, and
            once-in-a-lifetime deals.
          </p>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button className="absolute right-2 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-slate-500">
          © 2026 AURA Premium Store. All rights reserved.
        </p>
        <div className="flex items-center space-x-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
            alt="Visa"
            className="h-4 opacity-50 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
            alt="Mastercard"
            className="h-6 opacity-50 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
            alt="PayPal"
            className="h-4 opacity-50 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Apple_Pay_logo.svg/1200px-Apple_Pay_logo.svg.png"
            alt="Apple Pay"
            className="h-5 opacity-50 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </footer>
  );
}
