import React from "react";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-600 hover:text-white transition-colors">
            <Heart size={18} />
          </button>
        </div>

        {/* Image */}
        <a href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </a>

        {/* Quick Add */}
        <button
          onClick={() => addItem(product)}
          className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 font-bold text-sm"
        >
          <ShoppingCart size={18} />
          QUICK ADD
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-600">
              {product.rating}
            </span>
          </div>
        </div>

        <a href={`/products/${product.id}`}>
          <h3 className="font-bold text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </a>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
