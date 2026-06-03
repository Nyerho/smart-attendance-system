"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle,
  Loader,
} from "lucide-react";
import useAuth from "@/utils/useAuth";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@demo.com", color: "purple" },
  { role: "Teacher", email: "teacher@demo.com", color: "blue" },
  { role: "Student", email: "student@demo.com", color: "emerald" },
  { role: "Manager", email: "manager@demo.com", color: "amber" },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoSetupLoading, setDemoSetupLoading] = useState(false);
  const [demoSetupDone, setDemoSetupDone] = useState(false);
  const [demoSetupError, setDemoSetupError] = useState(null);
  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const msgs = {
        CredentialsSignin: "Incorrect email or password. Please try again.",
        AccessDenied: "Access denied. Contact your administrator.",
        Configuration:
          "Sign-in is not configured correctly. Please try again later.",
      };
      setError(msgs[err.message] || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSetupDemo = async () => {
    setDemoSetupLoading(true);
    setDemoSetupError(null);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      setDemoSetupDone(true);
      // Auto-fill admin demo
      setEmail("admin@demo.com");
      setPassword("demo1234");
    } catch (err) {
      setDemoSetupError(err.message);
    } finally {
      setDemoSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Smart Attendance<span className="text-indigo-400"> System</span>
            </span>
          </a>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25"
            >
              {loading ? (
                <div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{" "}
              <a
                href="/account/signup"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Create one free
              </a>
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-5 bg-white/3 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
              Try Demo
            </p>
            {!demoSetupDone ? (
              <button
                onClick={handleSetupDemo}
                disabled={demoSetupLoading}
                className="flex items-center gap-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {demoSetupLoading ? (
                  <>
                    <Loader
                      size={11}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Setting up...
                  </>
                ) : (
                  "① Set Up Demo First"
                )}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle size={12} /> Ready — click any account below
              </span>
            )}
          </div>

          {demoSetupError && (
            <p className="text-xs text-red-400 mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {demoSetupError}
            </p>
          )}

          {!demoSetupDone && (
            <p className="text-xs text-white/30 mb-3">
              Click "Set Up Demo First" once, then select any account below to
              auto-fill credentials.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.role}
                onClick={() => {
                  setEmail(d.email);
                  setPassword("demo1234");
                }}
                disabled={!demoSetupDone}
                className={`text-xs border rounded-xl px-3 py-2.5 text-left transition-all ${
                  demoSetupDone
                    ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 cursor-pointer"
                    : "bg-white/2 border-white/5 cursor-not-allowed opacity-40"
                }`}
              >
                <span className="font-semibold text-indigo-400 block">
                  {d.role}
                </span>
                <span className="text-white/40 block truncate">{d.email}</span>
                <span className="text-white/25 block mt-0.5">pw: demo1234</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
