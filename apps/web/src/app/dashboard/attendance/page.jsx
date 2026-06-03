"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  QrCode,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  Calendar,
  ChevronRight,
  BarChart3,
} from "lucide-react";

function StatusBadge({ status }) {
  const map = {
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    late: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    absent: "bg-red-500/15 text-red-400 border-red-500/25",
  };
  const icons = { present: "✓", late: "⏰", absent: "✗" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${map[status] || "bg-white/5 text-white/50 border-white/10"}`}
    >
      {icons[status]} {status}
    </span>
  );
}

export default function AttendanceDashboardPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["all-attendance", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      const res = await fetch(`/api/attendance?${params}`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["attendance-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const allRecords = data?.records || [];
  const filtered = allRecords.filter((r) => {
    const matchSearch =
      !search ||
      (r.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.session_title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const presentCount = allRecords.filter((r) => r.status === "present").length;
  const lateCount = allRecords.filter((r) => r.status === "late").length;
  const absentCount = allRecords.filter((r) => r.status === "absent").length;

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({ format: "csv" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/attendance/export?${params}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Attendance exported successfully!");
    } catch (err) {
      toast.error("Export failed: " + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Attendance Records</h1>
          <p className="text-white/50 text-sm">
            All check-ins across sessions · {allRecords.length} total records
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => (window.location.href = "/dashboard/sessions")}
            className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <QrCode size={14} /> Sessions
          </button>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <Download size={14} />{" "}
            {exportLoading ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Records",
            value: allRecords.length,
            icon: Users,
            color: "indigo",
          },
          {
            label: "Present",
            value: presentCount,
            icon: CheckCircle,
            color: "emerald",
          },
          { label: "Late", value: lateCount, icon: Clock, color: "amber" },
          { label: "Absent", value: absentCount, icon: XCircle, color: "red" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/50 text-xs font-medium">{s.label}</p>
              <s.icon size={16} className={`text-${s.color}-400`} />
            </div>
            <p className="text-3xl font-black text-white">{s.value}</p>
            {allRecords.length > 0 && (
              <p className="text-xs text-white/30 font-medium mt-1">
                {Math.round((s.value / allRecords.length) * 100)}% of total
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Analytics & Trends",
            href: "/dashboard/analytics",
            icon: BarChart3,
            desc: "AI-powered insights",
            color: "indigo",
          },
          {
            label: "Full Reports",
            href: "/reports",
            icon: TrendingUp,
            desc: "Export & download data",
            color: "emerald",
          },
          {
            label: "Session Management",
            href: "/dashboard/sessions",
            icon: Calendar,
            desc: "Create & manage sessions",
            color: "purple",
          },
        ].map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all group"
          >
            <div
              className={`w-10 h-10 bg-${item.color}-500/10 border border-${item.color}-500/20 rounded-xl flex items-center justify-center shrink-0`}
            >
              <item.icon size={18} className={`text-${item.color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">
                {item.label}
              </div>
              <div className="text-xs text-white/40">{item.desc}</div>
            </div>
            <ChevronRight
              size={16}
              className="text-white/20 group-hover:text-white/50 transition-colors shrink-0"
            />
          </a>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or session..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            {["all", "present", "late", "absent"].map((s) => (
              <option key={s} value={s} className="bg-[#12121A] capitalize">
                {s === "all"
                  ? "All Status"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Student",
                  "Session",
                  "Status",
                  "Check-in Time",
                  "Method",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-medium text-white/40 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      <p className="text-white/40 text-sm">
                        Loading attendance records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <QrCode size={36} className="text-white/15 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      No attendance records found
                    </p>
                    <p className="text-white/25 text-xs mt-1">
                      {search || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Start a session to collect attendance"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {(record.user_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {record.user_name || "Unknown"}
                          </div>
                          {record.user_email && (
                            <div className="text-xs text-white/40">
                              {record.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-white">
                        {record.session_title ||
                          `Session #${record.session_id}`}
                      </div>
                      {record.session_date && (
                        <div className="text-xs text-white/40">
                          {new Date(record.session_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/50">
                      {new Date(record.check_in_time).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-white/8 text-white/50 border border-white/10 px-2.5 py-1 rounded-lg capitalize">
                        {record.method}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/8 text-xs text-white/30">
            Showing {filtered.length} of {allRecords.length} records
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
