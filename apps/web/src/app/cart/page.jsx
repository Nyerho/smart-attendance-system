import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCartStore } from "../../store/useCartStore";
import {
  Minus,
  Plus,
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { products } from "../../data/products";
import ProductCard from "../../components/ProductCard";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const subtotal = getTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const recommendations = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-40 pb-24 text-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
              <ShoppingBag size={48} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 uppercase">
              YOUR CART IS EMPTY.
            </h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore
              our collection and find something special.
            </p>
            <a
              href="/products"
              className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl"
            >
              START SHOPPING
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-12 uppercase">
            YOUR <span className="text-emerald-600">BAG.</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              <div className="hidden md:grid grid-cols-6 pb-6 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-3">Product</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Price</div>
                <div className="text-right">Total</div>
              </div>

              {items.map((item, idx) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="grid grid-cols-1 md:grid-cols-6 items-center gap-6 pb-8 border-b border-slate-100 group"
                >
                  <div className="md:col-span-3 flex items-center gap-6">
                    <div className="w-24 aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {item.selectedColor && (
                          <span>
                            Color:{" "}
                            <span className="text-slate-600">
                              {item.selectedColor}
                            </span>
                          </span>
                        )}
                        {item.selectedSize && (
                          <span>
                            Size:{" "}
                            <span className="text-slate-600">
                              {item.selectedSize}
                            </span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeItem(
                            item.id,
                            item.selectedColor,
                            item.selectedSize,
                          )
                        }
                        className="mt-4 flex items-center gap-2 text-xs font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.selectedColor,
                            item.selectedSize,
                          )
                        }
                        className="p-2 text-slate-400 hover:text-slate-900"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.selectedColor,
                            item.selectedSize,
                          )
                        }
                        className="p-2 text-slate-400 hover:text-slate-900"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right hidden md:block">
                    <span className="text-sm font-bold text-slate-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right flex md:block justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest md:hidden">
                      Subtotal
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                <a
                  href="/products"
                  className="text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 hover:border-slate-900 transition-all pb-1"
                >
                  Continue Shopping
                </a>
                <button
                  onClick={() => useCartStore.getState().clearCart()}
                  className="text-sm font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Empty Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 sticky top-32">
                <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                  SUMMARY
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Shipping</span>
                    <span className="text-slate-900">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      Spend ${(150 - subtotal).toFixed(2)} more for free
                      shipping!
                    </p>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Tax</span>
                    <span className="text-slate-900">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      Estimated Total
                    </span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Discount code"
                      className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold tracking-widest"
                    />
                    <button className="absolute right-2 top-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors uppercase tracking-widest">
                      Apply
                    </button>
                  </div>
                  <a
                    href="/checkout"
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl uppercase tracking-widest active:scale-95 group"
                  >
                    Checkout Now{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="mt-10 pt-10 border-t border-slate-200 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        Secure Payments
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        SSL Encrypted Checkout
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        Global Express
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Delivered to your door
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Products */}
      <section className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-12 uppercase">
            RECOMMENDED FOR YOU.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
