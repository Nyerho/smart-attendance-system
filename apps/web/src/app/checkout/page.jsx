import React, { useState } from "react";
import { useCartStore } from "../../store/useCartStore";
import {
  ShieldCheck,
  ChevronLeft,
  Lock,
  Truck,
  CreditCard,
  ChevronDown,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const subtotal = getTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      alert("Order placed successfully! This is a demo checkout.");
      setIsProcessing(false);
      window.location.href = "/";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mini Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <a
            href="/cart"
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Bag
          </a>
          <a
            href="/"
            className="text-2xl font-bold tracking-tighter text-slate-900 flex items-center gap-1"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span>AURA</span>
          </a>
          <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
            <Lock size={14} /> SECURE CHECKOUT
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Side: Forms */}
            <div className="space-y-12">
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Information Section */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      1. SHIPPING INFO
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-emerald-600 hover:underline"
                      >
                        Sign in
                      </button>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Phone Number
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        First Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="John"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Last Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Doe"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Street Address
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="123 Aura Lane"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        City
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="New York"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        ZIP / Postal Code
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="10001"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </section>

                {/* Shipping Method Section */}
                <section>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">
                    2. SHIPPING METHOD
                  </h2>
                  <div className="space-y-4">
                    <label
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${shipping === 0 ? "border-emerald-600 bg-emerald-50" : "border-white bg-white hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shipping === 0}
                          readOnly
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            Standard Shipping
                          </p>
                          <p className="text-xs text-slate-500">
                            3-5 Business Days
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600">
                        {shipping === 0 ? "FREE" : "$15.00"}
                      </span>
                    </label>
                    <label className="flex items-center justify-between p-6 rounded-2xl border-2 border-white bg-white hover:border-slate-200 cursor-pointer transition-all">
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            Express Delivery
                          </p>
                          <p className="text-xs text-slate-500">
                            1-2 Business Days
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">$29.00</span>
                    </label>
                  </div>
                </section>

                {/* Payment Section */}
                <section>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">
                    3. PAYMENT
                  </h2>
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-emerald-600" />
                        <span className="font-bold text-slate-900">
                          Credit Card
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                          className="h-4 opacity-70"
                          alt="Visa"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                          className="h-4 opacity-70"
                          alt="Mastercard"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                          <div className="absolute right-4 top-4 text-slate-300">
                            <Lock size={18} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Expiry Date
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="MM / YY"
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            CVV / CVC
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="123"
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <button
                  disabled={isProcessing}
                  className={`w-full py-6 rounded-2xl font-black text-lg transition-all shadow-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${isProcessing ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98]"}`}
                >
                  {isProcessing ? "PROCESSING..." : "COMPLETE PURCHASE"}
                </button>
              </form>
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:sticky lg:top-12 h-fit">
              <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm uppercase leading-tight mb-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          {item.selectedColor && `COLOR: ${item.selectedColor}`}
                          {item.selectedSize && ` • SIZE: ${item.selectedSize}`}
                        </p>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-slate-100 mb-8">
                  <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-slate-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-emerald-600">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <span>Est. Tax (8%)</span>
                    <span className="text-slate-900">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-8 border-t-4 border-slate-900 flex justify-between items-end mb-10">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
                    Total
                  </span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Guaranteed
                      </p>
                      <p className="text-[10px] font-black text-slate-900 uppercase">
                        QUALITY
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Truck size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Tracked
                      </p>
                      <p className="text-[10px] font-black text-slate-900 uppercase">
                        SHIPPING
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="py-12 bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © 2026 AURA PREMIUM. SECURE SSL ENCRYPTED.
          </p>
          <div className="flex gap-6 opacity-40">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
              className="h-4"
              alt="Visa"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
              className="h-4"
              alt="Mastercard"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
              className="h-4"
              alt="PayPal"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
