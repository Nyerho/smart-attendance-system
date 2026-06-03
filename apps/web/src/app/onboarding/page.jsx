"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Brain,
  CheckCircle,
  ArrowRight,
  User,
  Building,
  Phone,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({
    role: "student",
    organization: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingRole = localStorage.getItem("pendingRole");
      const pendingOrg = localStorage.getItem("pendingOrg");
      setFormData((prev) => ({
        ...prev,
        role: pendingRole || "student",
        organization: pendingOrg || "",
      }));
    }
  }, []);

  const saveProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingRole");
          localStorage.removeItem("pendingOrg");
        }
        setDone(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [formData]);

  if (done) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            You're all set!
          </h2>
          <p className="text-white/50">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const roles = [
    {
      id: "admin",
      label: "Administrator",
      icon: "👑",
      desc: "Full org management",
    },
    { id: "teacher", label: "Teacher", icon: "👩‍🏫", desc: "Manage classes" },
    { id: "student", label: "Student", icon: "🎓", desc: "Track attendance" },
    { id: "employee", label: "Employee", icon: "💼", desc: "Work attendance" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Complete your profile
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Help us personalize your experience
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Your role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: r.id }))
                    }
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formData.role === r.id ? "bg-indigo-500/20 border-indigo-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div
                        className={`text-sm font-medium ${formData.role === r.id ? "text-white" : "text-white/60"}`}
                      >
                        {r.label}
                      </div>
                      <div className="text-xs text-white/30">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Organization
              </label>
              <div className="relative">
                <Building
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }))
                  }
                  placeholder="School / Company name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Phone <span className="text-white/30">(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Complete Setup{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
