"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Search,
  Filter,
  User,
  ChevronLeft,
  RefreshCw,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Edit,
  LogIn,
  LogOut,
} from "lucide-react";

const ACTION_ICONS = {
  mark_attendance: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  qr_checkin: {
    icon: CheckCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  create_session: {
    icon: Activity,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  end_session: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  delete_user: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
  update_user: { icon: Edit, color: "text-purple-400", bg: "bg-purple-500/10" },
  login: { icon: LogIn, color: "text-green-400", bg: "bg-green-500/10" },
  logout: { icon: LogOut, color: "text-gray-400", bg: "bg-gray-500/10" },
  view: { icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
};

const getActionConfig = (action) => {
  return (
    ACTION_ICONS[action] || {
      icon: Activity,
      color: "text-white/50",
      bg: "bg-white/5",
    }
  );
};

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["audit-logs", search, actionFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(search && { search }),
        ...(actionFilter && { action: actionFilter }),
      });
      const res = await fetch(`/api/audit-logs?${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch audit logs");
      }
      return res.json();
    },
    staleTime: 10000,
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const actionTypes = [
    "",
    "mark_attendance",
    "qr_checkin",
    "create_session",
    "end_session",
    "update_user",
    "delete_user",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a
            href="/dashboard"
            className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mb-2 transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Dashboard
          </a>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Audit Logs</h1>
              <p className="text-white/50 text-sm">
                Complete system activity trail · {total.toLocaleString()} total
                events
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
          Refresh
        </button>
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by email, action, entity..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            {actionTypes.map((a) => (
              <option key={a} value={a} className="bg-[#12121A]">
                {a
                  ? a
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "All Actions"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["Event", "User", "Entity", "Time"].map((h) => (
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
                  <td colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-white/40 text-sm">
                        Loading audit logs...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <Shield size={36} className="text-white/15 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      No audit events found
                    </p>
                    <p className="text-white/25 text-xs mt-1">
                      {search || actionFilter
                        ? "Try adjusting your filters"
                        : "System events will appear here"}
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const cfg = getActionConfig(log.action);
                  const Icon = cfg.icon;
                  const name =
                    [log.first_name, log.last_name].filter(Boolean).join(" ") ||
                    log.user_email ||
                    "System";
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedLog(log)}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}
                          >
                            <Icon size={14} className={cfg.color} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white capitalize">
                              {log.action.replace(/_/g, " ")}
                            </div>
                            {log.entity_type && (
                              <div className="text-xs text-white/35 capitalize">
                                {log.entity_type.replace(/_/g, " ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">
                              {name}
                            </div>
                            {log.user_role && (
                              <div className="text-xs text-white/35 capitalize">
                                {log.user_role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {log.entity_id ? (
                          <span className="text-xs bg-white/8 text-white/50 px-2 py-1 rounded-lg font-mono">
                            #{log.entity_id}
                          </span>
                        ) : (
                          <span className="text-white/25 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-white/50">
                          {getTimeAgo(log.created_at)}
                        </div>
                        <div className="text-xs text-white/25">
                          {new Date(log.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-white/40">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
              {total.toLocaleString()} events
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm text-white/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                ← Prev
              </button>
              <span className="text-xs text-white/40 px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm text-white/50 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#12121A] border border-white/15 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = getActionConfig(selectedLog.action);
                  const Icon = cfg.icon;
                  return (
                    <div
                      className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}
                    >
                      <Icon size={18} className={cfg.color} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-bold text-white capitalize">
                    {selectedLog.action.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-white/40">
                    Event #{selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white/30 hover:text-white/70 transition-colors text-xl font-light"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "User", value: selectedLog.user_email || "System" },
                { label: "Entity Type", value: selectedLog.entity_type },
                { label: "Entity ID", value: selectedLog.entity_id },
                {
                  label: "Timestamp",
                  value: new Date(selectedLog.created_at).toLocaleString(),
                },
              ].map(({ label, value }) =>
                value ? (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2.5 border-b border-white/5"
                  >
                    <span className="text-xs text-white/40 uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="text-sm text-white font-medium text-right max-w-[60%] break-all">
                      {String(value)}
                    </span>
                  </div>
                ) : null,
              )}
              {selectedLog.details && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                    Details
                  </p>
                  <pre className="bg-white/5 rounded-xl p-3 text-xs text-white/60 overflow-auto max-h-40 font-mono">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
