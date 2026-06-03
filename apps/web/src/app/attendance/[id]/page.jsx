"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  QrCode,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";

function ManualEntryForm({ sessionId, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("present");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          method: "manual",
          user_name: name,
          user_email: email,
          status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(`Marked ${name} as ${status}`);
      setName("");
      setEmail("");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to mark attendance");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Student Name *
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@school.edu"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Status
        </label>
        <div className="flex gap-2">
          {[
            ["present", "✓ Present", "emerald"],
            ["late", "⏰ Late", "amber"],
            ["absent", "✗ Absent", "red"],
          ].map(([s, l, c]) => {
            const activeClass = `bg-${c}-500/20 text-${c}-400 border-${c}-500/30`;
            const inactiveClass =
              "bg-white/5 text-white/50 border-white/10 hover:text-white/70";
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${status === s ? activeClass : inactiveClass}`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            style={{ animation: "spin 1s linear infinite" }}
          />
        ) : null}
        Mark Attendance
      </button>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

export default function AttendanceSessionPage({ params }) {
  const { id } = params;
  const [activeTab, setActiveTab] = useState("overview");
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error("Session not found");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: recordsData } = useQuery({
    queryKey: ["attendance-records", id],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?session_id=${id}`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const getLocation = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => setLocationError(err.message),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const session = data?.session;
  const records = recordsData?.records || [];
  const userRole = profileData?.user?.role || "student";
  const userId = profileData?.user?.id;
  const myRecord = records.find((r) => r.user_id === userId);
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const totalRecords = records.length;

  const qrBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrData = session
    ? `${qrBaseUrl}/attend/${session.session_token || id}`
    : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-4"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-white/50 text-sm">Loading session...</p>
        </div>
        <style
          jsx
          global
        >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle size={40} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Session Not Found</h2>
        <a
          href="/dashboard/sessions"
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 mt-2"
        >
          <ChevronLeft size={16} /> Back to Sessions
        </a>
      </div>
    );
  }

  const isActive = session.status === "active";
  const tabs = [
    { id: "overview", label: "QR Code" },
    ...(session?.allow_face
      ? [{ id: "face", label: "Face Pipeline" }]
      : []),
    { id: "records", label: `Records (${totalRecords})` },
    ...(userRole === "admin" || userRole === "teacher"
      ? [{ id: "manual", label: "Manual Entry" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <a
          href="/dashboard/sessions"
          className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mb-3 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Sessions
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">{session.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                {new Date(session.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                {totalRecords} check-ins
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/50 border border-white/10"}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-white/40"}`}
                />
                {session.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Present",
            value: presentCount,
            colorClass:
              "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
            icon: CheckCircle,
          },
          {
            label: "Late",
            value: lateCount,
            colorClass:
              "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
            icon: Clock,
          },
          {
            label: "Total",
            value: totalRecords,
            colorClass:
              "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
            icon: Users,
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.colorClass} border rounded-2xl p-4 text-center`}
          >
            <s.icon
              size={20}
              className={`${s.colorClass.split(" ").find((c) => c.startsWith("text-"))} mx-auto mb-2`}
            />
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === tab.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* QR Code Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                <h3 className="font-bold text-white mb-2">Session QR Code</h3>
                <p className="text-white/40 text-sm text-center mb-6">
                  Students scan this to check in instantly
                </p>
                {isActive && qrData ? (
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-30" />
                    <div className="relative bg-white rounded-2xl p-4 shadow-2xl">
                      <img src={qrUrl} alt="QR Code" width={280} height={280} />
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
                    <QrCode size={48} className="text-white/20 mb-3" />
                    <p className="text-white/40 text-sm text-center">
                      Session is not active
                    </p>
                  </div>
                )}
                {isActive && session.session_token && (
                  <div className="mt-6 text-center">
                    <p className="text-xs text-white/30 mb-1">Session Token</p>
                    <code className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg font-mono">
                      {session.session_token}
                    </code>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {myRecord ? (
                  <div
                    className={`rounded-2xl p-5 border ${myRecord.status === "present" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      {myRecord.status === "present" ? (
                        <CheckCircle size={24} className="text-emerald-400" />
                      ) : (
                        <Clock size={24} className="text-amber-400" />
                      )}
                      <div>
                        <div className="font-bold text-white">
                          You're marked {myRecord.status}!
                        </div>
                        <div className="text-sm text-white/50">
                          via {myRecord.method} at{" "}
                          {new Date(myRecord.check_in_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isActive ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} className="text-amber-400" />
                      <div>
                        <div className="font-bold text-white">
                          Not checked in yet
                        </div>
                        <div className="text-sm text-white/50">
                          Use the QR code flow or an approved manual fallback
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold text-white">Session Details</h4>
                  {[
                    {
                      label: "Date",
                      value: new Date(
                        session.session_date,
                      ).toLocaleDateString(),
                    },
                    {
                      label: "Start Time",
                      value: new Date(session.start_time).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                      ),
                    },
                    {
                      label: "Late After",
                      value: `${session.late_threshold_minutes} min`,
                    },
                    { label: "GPS Radius", value: `${session.radius_meters}m` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-white font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {session.allow_qr && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg">
                        QR Code
                      </span>
                    )}
                    {session.allow_face && (
                      <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-lg">
                        Face pipeline
                      </span>
                    )}
                    {session.allow_manual && (
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg">
                        Manual
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-4 border ${gpsLocation ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={18}
                      className={
                        gpsLocation ? "text-emerald-400" : "text-white/30"
                      }
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {gpsLocation
                          ? "Location verified"
                          : "Getting location..."}
                      </div>
                      {gpsLocation && (
                        <div className="text-xs text-white/40">
                          {gpsLocation.lat.toFixed(4)},{" "}
                          {gpsLocation.lng.toFixed(4)}
                        </div>
                      )}
                      {locationError && (
                        <div className="text-xs text-red-400">
                          {locationError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={getLocation}
                      className="text-white/30 hover:text-white/60 p-1 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Face Pipeline Tab */}
        {activeTab === "face" && (
          <motion.div
            key="face"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="max-w-lg mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <Shield size={32} className="text-indigo-400 mx-auto mb-3" />
                  <h3 className="font-bold text-white text-xl">
                    Face Recognition Backend Required
                  </h3>
                  <p className="text-white/50 text-sm">
                    This session was created with the face pipeline flag enabled,
                    but this repo does not include a live FastAPI/OpenCV service
                    or mobile biometric integration yet.
                  </p>
                </div>
                <div className="bg-black/30 rounded-2xl border border-white/10 p-5 mb-6 space-y-3">
                  <div className="text-sm font-semibold text-white">
                    What is missing
                  </div>
                  {[
                    "A Python FastAPI service for face detection, encoding, and match verification",
                    "A registration flow that stores face embeddings and device public keys",
                    "A mobile biometric flow that signs a payload after local fingerprint or Face ID verification",
                    "BLE classroom proximity checks for biometric fallback",
                  ].map((item) => (
                    <div key={item} className="text-sm text-white/60">
                      • {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                  <Shield size={12} />
                  <span>
                    Until the backend exists, this deployment supports QR +
                    GPS check-in and teacher/admin manual fallback only.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Records Tab */}
        {activeTab === "records" && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center gap-3 justify-between">
                <h3 className="font-semibold text-white">
                  Attendance Records ({totalRecords})
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {[
                    {
                      label: "Present",
                      count: presentCount,
                      cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    },
                    {
                      label: "Late",
                      count: lateCount,
                      cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                    },
                    {
                      label: "Absent",
                      count: totalRecords - presentCount - lateCount,
                      cls: "bg-red-500/20 text-red-400 border-red-500/30",
                    },
                  ].map((s) => (
                    <span
                      key={s.label}
                      className={`text-xs ${s.cls} border px-2 py-1 rounded-full font-medium`}
                    >
                      {s.label}: {s.count}
                    </span>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Name", "Status", "Check-in Time", "Method"].map(
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
                    {records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-12 text-white/30 text-sm"
                        >
                          No check-ins yet. Session is{" "}
                          {isActive ? "active and waiting..." : "ended."}
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                                {(r.user_name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {r.user_name || "Unknown"}
                                </div>
                                {r.user_email && (
                                  <div className="text-xs text-white/40">
                                    {r.user_email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium capitalize
                            ${
                              r.status === "present"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : r.status === "late"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                            >
                              {r.status === "present"
                                ? "✓"
                                : r.status === "late"
                                  ? "⏰"
                                  : "✗"}{" "}
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/50">
                            {new Date(r.check_in_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-white/10 text-white/60 border border-white/10 px-2 py-1 rounded-lg capitalize">
                              {r.method}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Tab */}
        {activeTab === "manual" &&
          (userRole === "admin" || userRole === "teacher") && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2">
                  Manual Attendance Entry
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Manually mark attendance for students who can't check in
                  digitally.
                </p>
                <ManualEntryForm
                  sessionId={id}
                  onSuccess={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["attendance-records", id],
                    })
                  }
                />
              </div>
            </motion.div>
          )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
