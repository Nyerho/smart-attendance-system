"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  Zap,
} from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A2E] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const insightCards = [
  {
    title: "At-Risk Students",
    value: "23",
    desc: "Below 75% attendance threshold",
    icon: AlertTriangle,
    color: "red",
    trend: "+3 this week",
  },
  {
    title: "Perfect Attendance",
    value: "142",
    desc: "100% attendance rate",
    icon: TrendingUp,
    color: "emerald",
    trend: "+12 vs last week",
  },
  {
    title: "Avg. Check-in Speed",
    value: "2.3s",
    desc: "QR scan average",
    icon: Zap,
    color: "amber",
    trend: "↓ 0.5s faster",
  },
  {
    title: "Duplicate Checks Blocked",
    value: "7",
    desc: "Duplicate check-in attempts rejected",
    icon: Brain,
    color: "purple",
    trend: "This month",
  },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("week");

  const hourlyData = [
    { hour: "7AM", checkins: 12 },
    { hour: "8AM", checkins: 145 },
    { hour: "9AM", checkins: 320 },
    { hour: "10AM", checkins: 280 },
    { hour: "11AM", checkins: 190 },
    { hour: "12PM", checkins: 85 },
    { hour: "1PM", checkins: 220 },
    { hour: "2PM", checkins: 195 },
    { hour: "3PM", checkins: 110 },
    { hour: "4PM", checkins: 65 },
    { hour: "5PM", checkins: 30 },
    { hour: "6PM", checkins: 8 },
  ];

  const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    attendance: Math.round(75 + Math.random() * 20),
    target: 85,
  }));

  const radarData = [
    { subject: "Present", A: 87, fullMark: 100 },
    { subject: "On-Time", A: 79, fullMark: 100 },
    { subject: "Verified", A: 95, fullMark: 100 },
    { subject: "GPS OK", A: 82, fullMark: 100 },
    { subject: "No Fraud", A: 99, fullMark: 100 },
    { subject: "Audit Trail", A: 73, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            Attendance Analytics
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Operational insights powered by attendance data
          </p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "quarter"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${period === p ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br from-${card.color}-500/10 to-${card.color}-600/5 border border-${card.color}-500/20 rounded-2xl p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <card.icon size={20} className={`text-${card.color}-400`} />
              <span className="text-xs text-white/40">{card.trend}</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {card.value}
            </div>
            <div className="text-sm font-medium text-white/70">
              {card.title}
            </div>
            <div className="text-xs text-white/40 mt-1">{card.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-1">
            Check-in Distribution by Hour
          </h3>
          <p className="text-white/40 text-sm mb-6">
            When do students check in most?
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={hourlyData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="checkins"
                name="Check-ins"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-1">
            Attendance Quality Score
          </h3>
          <p className="text-white/40 text-sm mb-4">
            Multi-dimensional attendance health
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart
              data={radarData}
              margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-white">30-Day Attendance Trend</h3>
            <p className="text-white/40 text-sm">Daily rate vs 85% target</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-white/50">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-500" />
              <span className="text-white/50">Target (85%)</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={monthlyTrend}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[60, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="attendance"
              name="Attendance %"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#attendGrad)"
            />
            <Area
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insights Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/30">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Generated Insights</h3>
            <div className="space-y-2">
              {[
                {
                  icon: "📈",
                  text: "Attendance peaks on Wednesdays (91%) and drops on Sundays (65%). Consider scheduling important sessions mid-week.",
                },
                {
                  icon: "⚠️",
                  text: "23 students are at risk with attendance below 75%. Automated alerts have been sent to advisors.",
                },
                {
                  icon: "🔒",
                  text: "Duplicate check-in prevention stopped repeated submissions this month. A real face or biometric backend is not connected yet.",
                },
                {
                  icon: "⏰",
                  text: "Late arrivals are 3× more common in 8AM sessions. Consider adjusting session start times or late thresholds.",
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/5 rounded-xl p-3"
                >
                  <span className="text-lg shrink-0">{insight.icon}</span>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
