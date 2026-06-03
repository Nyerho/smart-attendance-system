"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Trash2,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { data: user } = useUser();

  const handlePromote = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
          <p className="text-white/50 text-sm mt-1">
            One-time admin account creation
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-amber-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-amber-300 font-semibold text-sm">
                Security Notice
              </p>
              <p className="text-amber-200/70 text-xs mt-1">
                This page grants admin privileges to your account.{" "}
                <strong>Delete this page and API route after use.</strong>{" "}
                Anyone signed in can use this page — secure it by deleting it
                immediately.
              </p>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <Lock size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm mb-4">
              You must be signed in to continue
            </p>
            <a
              href="/account/signin"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Sign In First
            </a>
          </div>
        ) : result ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Admin Access Granted!
            </h2>
            <p className="text-emerald-400 font-medium">{result.email}</p>
            <p className="text-white/50 text-sm mt-3 mb-6">{result.message}</p>
            <div className="flex gap-3 justify-center">
              <a
                href="/dashboard"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Open Dashboard
              </a>
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl text-sm font-medium">
                <Trash2 size={14} /> Delete this page next
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <p className="text-sm text-white/70 mb-3">Signed in as:</p>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {(user.name || user.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">
                    {user.name || "No name set"}
                  </div>
                  <div className="text-xs text-white/50">{user.email}</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePromote}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all"
            >
              {loading ? (
                <div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Shield size={18} />
              )}
              Promote My Account to Admin
            </button>
          </div>
        )}
      </motion.div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
