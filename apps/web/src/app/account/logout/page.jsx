"use client";
import { useEffect } from "react";
import { Brain, LogOut } from "lucide-react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>
      <div className="text-center relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
          <Brain size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Sign out of Smart Attendance System?
        </h1>
        <p className="text-white/50 mb-8">
          You'll need to sign in again to access your dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 transition-all text-sm font-medium"
          >
            Stay signed in
          </a>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all text-sm font-semibold flex items-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
