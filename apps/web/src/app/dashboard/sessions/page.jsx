"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  CalendarCheck,
  QrCode,
  Clock,
  Users,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Square,
  Trash2,
  Eye,
} from "lucide-react";

export default function SessionsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    class_id: "",
    late_threshold_minutes: 15,
    allow_qr: true,
    allow_face: false,
    allow_manual: true,
    radius_meters: 100,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", search, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/sessions?${params}`);
      if (!res.ok) return { sessions: [] };
      return res.json();
    },
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await fetch("/api/classes");
      if (!res.ok) return { classes: [] };
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["sessions"]);
      setShowCreate(false);
      toast.success("Session created! QR code is ready.");
      window.location.href = `/attendance/${data.session.id}`;
    },
    onError: () => toast.error("Failed to create session"),
  });

  const endMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sessions"]);
      toast.success("Session ended");
    },
    onError: () => toast.error("Failed to end session"),
  });

  const sessions = data?.sessions || [];
  const classes = classesData?.classes || [];

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Attendance Sessions
          </h1>
          <p className="text-white/50 text-sm">
            Create and manage attendance sessions
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105"
        >
          <Plus size={16} /> New Session
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "ended", "paused"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white/5 border border-white/10 rounded-2xl"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <CalendarCheck size={40} className="text-white/20 mb-4" />
          <h3 className="font-semibold text-white/60 mb-1">
            No sessions found
          </h3>
          <p className="text-white/30 text-sm mb-6">
            Create your first attendance session to get started
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus size={16} /> Create Session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {session.title}
                    </h3>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${session.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/10"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-400" : "bg-white/40"}`}
                      />
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck size={14} />
                      {new Date(session.session_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(session.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      {session.checkin_count || 0} checked in
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.allow_qr && (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-lg border border-blue-500/20">
                        <QrCode size={10} /> QR
                      </span>
                    )}
                    {session.allow_face && (
                      <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded-lg border border-purple-500/20">
                        👤 Face Pipeline
                      </span>
                    )}
                    {session.allow_manual && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-lg border border-amber-500/20">
                        ✋ Manual
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/attendance/${session.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl text-sm font-medium transition-all border border-indigo-500/30"
                  >
                    <Eye size={14} /> Open
                  </a>
                  {session.status === "active" && (
                    <button
                      onClick={() => endMutation.mutate(session.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all border border-red-500/30"
                    >
                      <Square size={14} /> End
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-white">Create New Session</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Session Title *
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. CS101 - Monday Lecture"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Class (optional)
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, class_id: e.target.value }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                >
                  <option value="" className="bg-[#12121A]">
                    No specific class
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#12121A]">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Late threshold (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.late_threshold_minutes}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      late_threshold_minutes: parseInt(e.target.value),
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Check-in Methods
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "allow_qr", label: "QR Code", icon: "📱" },
                    {
                      key: "allow_face",
                      label: "Face Pipeline",
                      icon: "👤",
                    },
                    { key: "allow_manual", label: "Manual", icon: "✋" },
                  ].map((m) => (
                    <label
                      key={m.key}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData[m.key] ? "bg-indigo-500/20 border-indigo-500/50 text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData[m.key]}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            [m.key]: e.target.checked,
                          }))
                        }
                        className="sr-only"
                      />
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : null}
                  Create & Open Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
