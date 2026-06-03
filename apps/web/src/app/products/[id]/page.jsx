import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";
import { products } from "../../../data/products";
import {
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
  Heart,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { useCartStore } from "../../../store/useCartStore";

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const product = products.find((p) => p.id === id) || products[0];
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isAdded, setIsAdded] = useState(false);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">
            <a href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </a>
            <ChevronRight size={14} />
            <a
              href="/products"
              className="hover:text-emerald-600 transition-colors"
            >
              Products
            </a>
            <ChevronRight size={14} />
            <span className="text-slate-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm"
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <div className="flex gap-4">
                {[
                  product.image,
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
                ].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-emerald-600 scale-105 shadow-md" : "border-slate-100 hover:border-slate-300"}`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {product.category}
                </span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Heart size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 leading-tight">
                {product.name.toUpperCase()}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-600">
                  {product.rating} ({product.reviews} Reviews)
                </span>
              </div>

              <div className="flex items-center gap-4 mb-10">
                <span className="text-4xl font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                  SAVE{" "}
                  {Math.round(
                    (1 - product.price / product.originalPrice) * 100,
                  )}
                  %
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                {product.description}
              </p>

              {/* Variants */}
              <div className="space-y-10 mb-12">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Select Color:{" "}
                    <span className="text-slate-900 ml-2">{selectedColor}</span>
                  </h4>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${selectedColor === color ? "border-emerald-600 scale-125" : "border-transparent"}`}
                      >
                        <div
                          className={`w-full h-full rounded-full bg-slate-900 shadow-inner`}
                          style={{
                            backgroundColor: color
                              .toLowerCase()
                              .replace(" ", ""),
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Select Size:{" "}
                    <span className="text-slate-900 ml-2">{selectedSize}</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedSize === size ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-600 hover:border-slate-300"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${isAdded ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-emerald-600"}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={20} /> ADDED TO CART
                    </>
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
              </div>

              <button className="w-full py-5 rounded-2xl font-bold text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50 transition-all mb-12 shadow-sm">
                BUY IT NOW
              </button>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm font-bold text-slate-600"
                  >
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Check size={12} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              icon: <Truck size={32} />,
              title: "Free Express Shipping",
              desc: "Get your order in 3-5 business days.",
            },
            {
              icon: <RefreshCw size={32} />,
              title: "Easy Returns",
              desc: "No questions asked 30-day return policy.",
            },
            {
              icon: <ShieldCheck size={32} />,
              title: "2-Year Warranty",
              desc: "Quality guaranteed on every single product.",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-6">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h4>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-12">
              YOU MAY ALSO LIKE.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
