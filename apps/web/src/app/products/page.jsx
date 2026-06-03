import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { products, categories } from "../../data/products";
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Grid,
  List as ListIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Best Selling") {
      result.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(result);
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                THE <span className="text-emerald-600">COLLECTION.</span>
              </h1>
              <p className="text-slate-500 font-medium">
                {filteredProducts.length} premium essentials curated for you.
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["All", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${
                    selectedCategory === cat
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-600 hover:border-emerald-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between py-6 border-y border-slate-100 mb-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors"
              >
                <SlidersHorizontal size={18} />
                FILTERS
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 hidden sm:block">
                SORT BY:
              </span>
              <div className="relative group">
                <button className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  {sortBy} <ChevronDown size={16} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-2xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 py-2">
                  {[
                    "Newest",
                    "Best Selling",
                    "Price: Low to High",
                    "Price: High to Low",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {selectedCategory !== "All" && (
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setSelectedCategory("All")}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100"
              >
                Category: {selectedCategory} <X size={14} />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSortBy("Newest");
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                No products found
              </h3>
              <p className="text-slate-500 mb-8">
                Try adjusting your filters or search criteria.
              </p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
