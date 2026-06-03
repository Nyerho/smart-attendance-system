"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
  Activity,
  Brain,
  QrCode,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  change,
  loading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden hover:border-${color}-500/30 transition-all group`}
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 rounded-full -translate-y-8 translate-x-8`}
    />
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/50 text-sm font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-white/10 rounded-lg mt-2 shimmer" />
          ) : (
            <p className="text-3xl font-black text-white mt-1">{value}</p>
          )}
        </div>
        <div
          className={`w-11 h-11 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center shadow-xl shadow-${color}-500/20`}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${parseFloat(change) >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
          >
            {parseFloat(change) >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {subtitle && <span className="text-xs text-white/40">{subtitle}</span>}
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A2E] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        window.location.href = "/account/signin";
        return null;
      }
      return res.json();
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions?limit=5");
      if (!res.ok) return { sessions: [] };
      return res.json();
    },
  });

  useEffect(() => {
    if (profileData?.user) setProfile(profileData.user);
  }, [profileData]);

  const userRole = profile?.role || "student";
  const userName = profile?.name || profile?.email || "User";

  const weeklyData = statsData?.weeklyTrend || [
    { day: "Mon", present: 85, absent: 10, late: 5 },
    { day: "Tue", present: 82, absent: 12, late: 6 },
    { day: "Wed", present: 89, absent: 8, late: 3 },
    { day: "Thu", present: 78, absent: 15, late: 7 },
    { day: "Fri", present: 91, absent: 6, late: 3 },
    { day: "Sat", present: 70, absent: 22, late: 8 },
    { day: "Sun", present: 65, absent: 28, late: 7 },
  ];

  const pieData = [
    { name: "Present", value: statsData?.presentPct || 87 },
    { name: "Late", value: statsData?.latePct || 8 },
    { name: "Absent", value: statsData?.absentPct || 5 },
  ];

  const recentSessions = sessionsData?.sessions || [];

  const stats =
    userRole === "admin" || userRole === "teacher"
      ? [
          {
            title: "Total Users",
            value: statsData?.totalUsers || "—",
            subtitle: "registered",
            icon: Users,
            color: "indigo",
            change: 12,
          },
          {
            title: "Active Sessions",
            value: statsData?.activeSessions || "—",
            subtitle: "running now",
            icon: Activity,
            color: "emerald",
            change: 3,
          },
          {
            title: "Today's Attendance",
            value: statsData?.todayAttendance
              ? `${statsData.todayAttendance}%`
              : "—",
            subtitle: "rate",
            icon: CheckCircle,
            color: "blue",
            change: 2.3,
          },
          {
            title: "Late Arrivals",
            value: statsData?.lateToday || "—",
            subtitle: "today",
            icon: Clock,
            color: "amber",
            change: -1,
          },
        ]
      : [
          {
            title: "My Attendance",
            value: statsData?.myAttendance ? `${statsData.myAttendance}%` : "—",
            subtitle: "this month",
            icon: CheckCircle,
            color: "emerald",
            change: 2,
          },
          {
            title: "Classes Attended",
            value: statsData?.classesAttended || "—",
            subtitle: "sessions",
            icon: CalendarCheck,
            color: "indigo",
          },
          {
            title: "Sessions Missed",
            value: statsData?.sessionsMissed || "—",
            subtitle: "this month",
            icon: XCircle,
            color: "red",
          },
          {
            title: "Current Streak",
            value: statsData?.streak ? `${statsData.streak}d` : "—",
            subtitle: "days",
            icon: TrendingUp,
            color: "amber",
          },
        ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {(userRole === "admin" || userRole === "teacher") && (
          <a
            href="/dashboard/sessions/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
          >
            <Plus size={16} /> New Session
          </a>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden hover:border-indigo-500/20 transition-all group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/50 text-sm font-medium">{s.title}</p>
                  {statsLoading ? (
                    <div className="h-8 w-20 bg-white/10 rounded-lg mt-2" />
                  ) : (
                    <p className="text-3xl font-black text-white mt-1">
                      {s.value}
                    </p>
                  )}
                </div>
                <div
                  className={`w-11 h-11 bg-gradient-to-br from-${s.color}-500 to-${s.color}-600 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <s.icon size={20} className="text-white" />
                </div>
              </div>
              <div className="relative flex items-center gap-2">
                {s.change !== undefined && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${s.change >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {s.change >= 0 ? "+" : ""}
                    {s.change}%
                  </span>
                )}
                {s.subtitle && (
                  <span className="text-xs text-white/40">{s.subtitle}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">Weekly Attendance Trend</h3>
              <p className="text-white/40 text-sm">
                Present / Late / Absent rates
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {[
                ["emerald", "Present"],
                ["amber", "Late"],
                ["red", "Absent"],
              ].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${c}-500`} />
                  <span className="text-white/50">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={weeklyData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="present"
                name="Present"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#presentGrad)"
              />
              <Area
                type="monotone"
                dataKey="late"
                name="Late"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#lateGrad)"
              />
              <Area
                type="monotone"
                dataKey="absent"
                name="Absent"
                stroke="#EF4444"
                strokeWidth={2}
                fill="none"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-1">Today's Breakdown</h3>
          <p className="text-white/40 text-sm mb-6">Attendance distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`]}
                contentStyle={{
                  backgroundColor: "#1A1A2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span className="text-sm text-white/60">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Recent Attendance Sessions</h3>
            <p className="text-white/40 text-sm">
              Latest sessions across all classes
            </p>
          </div>
          <a
            href="/dashboard/sessions"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight size={16} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                  Session
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden lg:table-cell">
                  Check-ins
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarCheck size={32} className="text-white/20" />
                      <p className="text-white/40 text-sm">
                        No sessions yet. Create your first session!
                      </p>
                      {(userRole === "admin" || userRole === "teacher") && (
                        <a
                          href="/dashboard/sessions/new"
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={14} /> Create Session
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                recentSessions.map((session, i) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white text-sm">
                        {session.title}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {session.class_name || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-white/60">
                        {new Date(session.session_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-white/30">
                        {new Date(session.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (session.checkin_count || 0) * 2)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-white/60">
                          {session.checkin_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${session.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : session.status === "ended" ? "bg-white/10 text-white/50 border border-white/10" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-400" : "bg-current"}`}
                        />
                        {session.status.charAt(0).toUpperCase() +
                          session.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/attendance/${session.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        Open <ChevronRight size={14} />
                      </a>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      {(userRole === "admin" || userRole === "teacher") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "New Session",
                icon: Plus,
                href: "/dashboard/sessions/new",
                color: "from-indigo-500 to-purple-600",
              },
              {
                label: "View Reports",
                icon: BarChart3,
                href: "/reports",
                color: "from-blue-500 to-cyan-600",
              },
              {
                label: "Manage Users",
                icon: Users,
                href: "/dashboard/users",
                color: "from-emerald-500 to-teal-600",
              },
              {
                label: "AI Analytics",
                icon: Brain,
                href: "/dashboard/analytics",
                color: "from-pink-500 to-rose-600",
              },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="group flex flex-col items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-5 transition-all hover:scale-105"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <action.icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
