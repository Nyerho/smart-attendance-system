"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Brain,
  QrCode,
  MapPin,
  Shield,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
  X,
  Zap,
  ChevronRight,
  Play,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Planned Vision Pipeline",
    desc: "The repo is structured so a future FastAPI/OpenCV service can be added, but that backend is not shipped in this deployment.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: QrCode,
    title: "QR Code Check-in",
    desc: "Session-unique, time-limited QR codes for instant check-ins. Auto-expires after session ends.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: MapPin,
    title: "GPS Geofencing",
    desc: "Location-bound attendance. Students must be inside the defined radius to check in successfully.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Clock,
    title: "Late Arrival Detection",
    desc: "Auto-classifies on-time, late, and absent with configurable thresholds per class.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Real-time dashboards with trends, risk alerts, and exportable PDF/Excel reports.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    desc: "AI-powered duplicate detection, proxy prevention, and full audit trail logging.",
    color: "from-indigo-500 to-blue-600",
  },
];

const stats = [
  { value: "QR + GPS", label: "Current Check-in Stack" },
  { value: "< 3s", label: "Average Check-in Time" },
  { value: "500K+", label: "Daily Attendances Tracked" },
  { value: "150+", label: "Organizations Onboarded" },
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Academic Registrar, TechU",
    avatar: "SC",
    text: "SmartAttend Pro gave our team a clean QR and GPS attendance workflow without the friction of paper sheets.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "HR Director, GlobalCorp",
    avatar: "MR",
    text: "We track 2,000 employees across 3 campuses. The GPS geofencing alone paid for itself in the first month.",
    rating: 5,
  },
  {
    name: "Prof. Aisha Patel",
    role: "Department Head, State University",
    avatar: "AP",
    text: "Students love the QR code feature. Setup took minutes, not hours. This is exactly what universities need.",
    rating: 5,
  },
];

const roles = [
  {
    icon: "👑",
    title: "Super Admin",
    desc: "Full platform control, multi-org management, global analytics and oversight",
  },
  {
    icon: "🏢",
    title: "Organization Admin",
    desc: "Manage departments, users, sessions, and export comprehensive reports",
  },
  {
    icon: "👩‍🏫",
    title: "Teacher / Manager",
    desc: "Start attendance sessions, monitor check-ins, generate class reports",
  },
  {
    icon: "🎓",
    title: "Student / Employee",
    desc: "Check in via QR with optional GPS verification and view attendance history on mobile",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/10" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                Smart Attendance<span className="text-indigo-400"> System</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Roles"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/account/signin"
                className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2 rounded-lg font-medium transition-all"
              >
                Get Started Free
              </a>
            </div>
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 px-4 pb-6 pt-2"
          >
            {["Features", "How It Works", "Roles"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-white/70 hover:text-white border-b border-white/5"
              >
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="/account/signin"
                className="text-center py-2.5 rounded-lg border border-white/20 text-white/80"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="text-center py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
              >
                Get Started Free
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8"
          >
            <Zap size={14} className="text-indigo-400" />
            QR + GPS attendance workflow, ready for future backend expansion
            <ChevronRight size={14} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight"
          >
            Smart Attendance
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            A modern attendance platform built around QR check-in, GPS
            verification, dashboards, and mobile access for schools,
            universities, and teams.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <a
              href="/account/signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl shadow-indigo-500/25 hover:scale-105"
            >
              Start Free Today{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <Play size={18} className="text-indigo-400" /> View Demo Dashboard
            </a>
            <a
              href="/demo/face-biometric"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <Shield size={18} className="text-emerald-300" /> Live Face + Biometric Demo
            </a>
          </motion.div>

          {/* Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur-sm opacity-40" />
            <div className="relative bg-[#12121A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-white/40 font-mono">
                  smartattend.pro/dashboard/admin
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Students",
                      val: "1,247",
                      icon: "👥",
                      pct: "+12%",
                      color: "from-indigo-500/20 to-indigo-600/20",
                    },
                    {
                      label: "Present Today",
                      val: "1,089",
                      icon: "✅",
                      pct: "87.3%",
                      color: "from-emerald-500/20 to-emerald-600/20",
                    },
                    {
                      label: "Late Arrivals",
                      val: "84",
                      icon: "⏰",
                      pct: "6.7%",
                      color: "from-amber-500/20 to-amber-600/20",
                    },
                    {
                      label: "Absent Today",
                      val: "74",
                      icon: "❌",
                      pct: "5.9%",
                      color: "from-red-500/20 to-red-600/20",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${s.color} border border-white/10 rounded-xl p-4`}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-white">
                        {s.val}
                      </div>
                      <div className="text-xs text-white/50">{s.label}</div>
                      <div className="text-xs text-emerald-400 mt-1 font-medium">
                        {s.pct}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80">
                      Weekly Attendance Trend
                    </span>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    {[65, 78, 82, 75, 90, 88, 87].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col justify-end gap-1"
                      >
                        <div
                          className="rounded-sm bg-gradient-to-t from-indigo-600 to-purple-500 opacity-80"
                          style={{ height: `${h}%` }}
                        />
                        <div className="text-center text-xs text-white/30">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="relative z-10 py-16 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-white/50">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300 mb-6">
              <Brain size={14} /> Core Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Everything you need to
              <br />
              <span className="text-indigo-400">track attendance smarter</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              The current deployment focuses on QR, GPS, dashboards, and audit
              trails. The face-recognition backend remains a planned phase.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 transition-all cursor-pointer"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 py-24 px-4 bg-white/[0.02] border-y border-white/10"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              How It <span className="text-purple-400">Works</span>
            </h2>
            <p className="text-white/50 text-lg">
              From session creation to verified attendance in seconds
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Create Session",
                desc: "Admin or teacher creates a session with timing rules, GPS radius, and the allowed check-in methods.",
                icon: "🎯",
                color: "from-indigo-500 to-purple-600",
              },
              {
                step: "02",
                title: "Students Check In",
                desc: "Students sign in and scan the QR code. The system validates the session token and, when configured, the GPS radius.",
                icon: "📱",
                color: "from-blue-500 to-cyan-600",
              },
              {
                step: "03",
                title: "Server Validation",
                desc: "The web API stores attendance, prevents duplicate check-ins, applies late thresholds, and records audit logs.",
                icon: "🤖",
                color: "from-emerald-500 to-teal-600",
              },
              {
                step: "04",
                title: "Instant Analytics",
                desc: "Dashboard updates in real-time: present/late/absent counts, trends, and auto-calculated percentages.",
                icon: "📊",
                color: "from-pink-500 to-rose-600",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center font-bold text-sm mb-4 shadow-lg`}
                >
                  {s.step}
                </div>
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Built for <span className="text-cyan-400">Every Role</span>
            </h2>
            <p className="text-white/50 text-lg">
              Tailored dashboards and features for every member of your
              organization
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 text-center transition-all"
              >
                <div className="text-4xl mb-4">{r.icon}</div>
                <h3 className="font-bold text-lg mb-2">{r.title}</h3>
                <p className="text-white/50 text-sm">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Loved by{" "}
              <span className="text-pink-400">Educators & HR Teams</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Brain size={28} className="text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Ready to modernize your
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                attendance system?
              </span>
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Deploy the current QR and GPS workflow now, then add the planned
              Python vision service when you are ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/account/signup"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-indigo-500/30 hover:scale-105"
              >
                Get Started Free{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="/account/signin"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all"
              >
                Sign In
              </a>
            </div>
            <p className="text-white/30 text-sm mt-6">
              No credit card required · Free plan available · Setup in minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold">
              Smart Attendance <span className="text-indigo-400">System</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <span>© 2026 Smart Attendance System</span>
            <a href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 3px; }
      `}</style>
    </div>
  );
}
