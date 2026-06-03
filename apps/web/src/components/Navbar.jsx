import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, User, Menu, X, ChevronRight } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-900"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-bold tracking-tighter text-slate-900 flex items-center gap-1"
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span>AURA</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a
            href="/products"
            className="hover:text-emerald-600 transition-colors"
          >
            Shop All
          </a>
          <a
            href="/products?category=Electronics"
            className="hover:text-emerald-600 transition-colors"
          >
            Electronics
          </a>
          <a
            href="/products?category=Apparel"
            className="hover:text-emerald-600 transition-colors"
          >
            Apparel
          </a>
          <a
            href="/products?category=Accessories"
            className="hover:text-emerald-600 transition-colors"
          >
            Accessories
          </a>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-600 hover:text-emerald-600 transition-colors hidden sm:block">
            <Search size={20} />
          </button>
          <button className="p-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <User size={20} />
          </button>
          <a
            href="/cart"
            className="p-2 text-slate-600 hover:text-emerald-600 transition-colors relative"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {itemCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-6 flex flex-col md:hidden">
          <div className="flex items-center justify-between mb-12">
            <span className="text-2xl font-bold tracking-tighter">AURA</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col space-y-6 text-xl font-medium">
            <a
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-slate-100 pb-4"
            >
              Shop All <ChevronRight size={20} className="text-slate-400" />
            </a>
            <a
              href="/products?category=Electronics"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-slate-100 pb-4"
            >
              Electronics <ChevronRight size={20} className="text-slate-400" />
            </a>
            <a
              href="/products?category=Apparel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-slate-100 pb-4"
            >
              Apparel <ChevronRight size={20} className="text-slate-400" />
            </a>
            <a
              href="/products?category=Accessories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between border-b border-slate-100 pb-4"
            >
              Accessories <ChevronRight size={20} className="text-slate-400" />
            </a>
          </div>
          <div className="mt-auto">
            <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
