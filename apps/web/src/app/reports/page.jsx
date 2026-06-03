"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A2E] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
          {typeof p.value === "number" && p.value <= 100 ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { data: statsData } = useQuery({
    queryKey: ["reports-stats", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/stats?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const weeklyData = statsData?.weeklyTrend || [
    { day: "Mon", present: 88, late: 7, absent: 5 },
    { day: "Tue", present: 85, late: 9, absent: 6 },
    { day: "Wed", present: 91, late: 5, absent: 4 },
    { day: "Thu", present: 79, late: 13, absent: 8 },
    { day: "Fri", present: 93, late: 4, absent: 3 },
    { day: "Sat", present: 68, late: 20, absent: 12 },
    { day: "Sun", present: 60, late: 25, absent: 15 },
  ];

  const departmentData = [
    { name: "Computer Science", attendance: 91, students: 240 },
    { name: "Business Admin", attendance: 85, students: 180 },
    { name: "Engineering", attendance: 88, students: 320 },
    { name: "Mathematics", attendance: 94, students: 140 },
    { name: "Sciences", attendance: 87, students: 200 },
  ];

  const methodData = [
    { name: "QR Code", value: 62 },
    { name: "GPS Verified", value: 28 },
    { name: "Manual", value: 10 },
  ];

  const handleExport = async (format) => {
    setExportLoading(true);
    setExportSuccess(false);
    try {
      // Build date range params
      const now = new Date();
      let dateFrom = "";
      if (dateRange === "week") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        dateFrom = d.toISOString().split("T")[0];
      } else if (dateRange === "month") {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        dateFrom = d.toISOString().split("T")[0];
      } else if (dateRange === "quarter") {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 3);
        dateFrom = d.toISOString().split("T")[0];
      } else if (dateRange === "year") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        dateFrom = d.toISOString().split("T")[0];
      }

      const params = new URLSearchParams({
        format: format === "pdf" ? "csv" : format,
        ...(dateFrom && { date_from: dateFrom }),
        date_to: now.toISOString().split("T")[0],
      });

      const res = await fetch(`/api/attendance/export?${params}`);
      if (!res.ok) {
        const err = await res.json();
        alert(
          err.error ||
            "Export failed. Make sure you have admin or teacher permissions.",
        );
        return;
      }

      // Trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smartattend-report-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-2 transition-colors w-fit cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={16} /> Back
          </div>
          <h1 className="text-2xl font-black text-white">
            Analytics & Reports
          </h1>
          <p className="text-white/50 text-sm">
            Detailed attendance insights and exportable reports
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["week", "month", "quarter", "year"].map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${dateRange === r ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"}`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => handleExport("csv")}
            disabled={exportLoading}
            className={`flex items-center gap-2 ${exportSuccess ? "bg-emerald-600" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"} disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all`}
          >
            {exportSuccess ? <CheckCircle size={14} /> : <Download size={14} />}
            {exportLoading
              ? "Exporting..."
              : exportSuccess
                ? "Downloaded!"
                : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Avg. Attendance",
            value: "87.3%",
            change: "+2.1%",
            icon: TrendingUp,
            color: "emerald",
          },
          {
            label: "Total Sessions",
            value: "142",
            change: "+18",
            icon: Calendar,
            color: "indigo",
          },
          {
            label: "Users Tracked",
            value: "1,247",
            change: "+45",
            icon: Users,
            color: "blue",
          },
          {
            label: "Reports Generated",
            value: "38",
            change: "+12",
            icon: FileText,
            color: "purple",
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/50 text-xs font-medium">{s.label}</p>
              <s.icon size={16} className={`text-${s.color}-400`} />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              {s.change} this {dateRange}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-1">Attendance by Day</h3>
          <p className="text-white/40 text-sm mb-6">
            Daily breakdown of present / late / absent
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
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
              <Bar
                dataKey="present"
                name="Present"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="late"
                name="Late"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Check-in Methods Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="font-bold text-white mb-1">Check-in Methods</h3>
          <p className="text-white/40 text-sm mb-4">
            How students are checking in
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {methodData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{
                  backgroundColor: "#1A1A2E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {methodData.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span className="text-sm text-white/60">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${m.value}%`,
                        backgroundColor: COLORS[i],
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">
                    {m.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-bold text-white">Department Performance</h3>
          <p className="text-white/40 text-sm">
            Attendance rates by department
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Department", "Students", "Attendance Rate", "Trend"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white text-sm">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {dept.students}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[120px] h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${dept.attendance}%`,
                            backgroundColor:
                              dept.attendance >= 90
                                ? "#10B981"
                                : dept.attendance >= 80
                                  ? "#F59E0B"
                                  : "#EF4444",
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {dept.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium ${dept.attendance >= 90 ? "text-emerald-400" : dept.attendance >= 80 ? "text-amber-400" : "text-red-400"}`}
                    >
                      {dept.attendance >= 90
                        ? "↑ Excellent"
                        : dept.attendance >= 80
                          ? "→ Good"
                          : "↓ Needs attention"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <h3 className="font-bold text-white mb-1">Attendance Trend</h3>
        <p className="text-white/40 text-sm mb-6">
          Week-over-week attendance rate progression
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={weeklyData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
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
              domain={[50, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ fill: "#6366F1", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
