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
  User,
  Building,
} from "lucide-react";
import useAuth from "@/utils/useAuth";

const roles = [
  { id: "admin", label: "Admin", icon: "🏢", desc: "Manage organization" },
  { id: "teacher", label: "Teacher", icon: "👩‍🏫", desc: "Run sessions" },
  { id: "student", label: "Student", icon: "🎓", desc: "Track attendance" },
  { id: "employee", label: "Employee", icon: "💼", desc: "Check in/out" },
];

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [org, setOrg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("pendingRole", selectedRole);
        localStorage.setItem("pendingOrg", org);
      }
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      const msgs = {
        CredentialsSignin:
          "An account with this email already exists. Try signing in.",
        OAuthCreateAccount: "This email is already registered.",
      };
      setError(
        msgs[err.message] || "Could not create account. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Smart Attendance<span className="text-indigo-400"> System</span>
            </span>
          </a>
          <h1 className="text-3xl font-black text-white mb-2">
            Create your account
          </h1>
          <p className="text-white/50">
            Join thousands of organizations using smart attendance
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${selectedRole === r.id ? "bg-indigo-500/20 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className="text-xs font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Organization <span className="text-white/30">(optional)</span>
              </label>
              <div className="relative">
                <Building
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="University / Company name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

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
                  placeholder="Min 8 characters"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-1">
                  {[8, 12, 16].map((len) => (
                    <div
                      key={len}
                      className={`h-1 flex-1 rounded-full transition-colors ${password.length >= len ? "bg-indigo-500" : "bg-white/10"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{" "}
              <a
                href="/account/signin"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
        <p className="text-center text-white/25 text-xs mt-4">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </motion.div>
    </div>
  );
}
