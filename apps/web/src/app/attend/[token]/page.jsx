"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  QrCode,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Brain,
  Shield,
  RefreshCw,
  LogIn,
  AlertTriangle,
} from "lucide-react";

export default function AttendTokenPage({ params }) {
  const { token } = params;
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(true);

  // Get user session
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["attend-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const getLocation = useCallback(() => {
    setGettingLocation(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGettingLocation(false);
        },
        (err) => {
          setLocationError(err.message);
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      setGettingLocation(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sessions/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: token,
          method: "qr",
          lat: location?.lat,
          lng: location?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check-in failed");
      return data;
    },
    onSuccess: (data) => {
      setCheckinResult({ success: true, data });
      setCheckedIn(true);
    },
    onError: (err) => {
      setCheckinResult({ success: false, error: err.message });
    },
  });

  const user = profile?.user;
  const isLoading = profileLoading;

  // Not signed in
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Brain size={36} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            SmartAttend Pro
          </h1>
          <p className="text-white/50 text-sm mb-8">
            Sign in to mark your attendance for this session
          </p>
          <a
            href={`/account/signin?callbackUrl=${encodeURIComponent("/attend/" + token)}`}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold text-base transition-all"
          >
            <LogIn size={18} /> Sign In to Check In
          </a>
          <p className="text-white/30 text-xs mt-4">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Create one
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-6">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full"
        >
          {/* Success State */}
          {checkinResult?.success ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="w-24 h-24 bg-emerald-500/15 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={48} className="text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">
                Attendance Marked!
              </h2>
              <p className="text-emerald-400 font-semibold text-lg mb-2 capitalize">
                ✓ {checkinResult.data?.attendance_status || "Present"}
              </p>
              {checkinResult.data?.session_title && (
                <p className="text-white/50 text-sm mb-6">
                  {checkinResult.data.session_title}
                </p>
              )}
              {checkinResult.data?.already_checked_in && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-left">
                  <p className="text-amber-300 text-sm font-medium">
                    Already checked in
                  </p>
                  <p className="text-amber-300/70 text-xs mt-1">
                    You were already marked{" "}
                    {checkinResult.data?.attendance_status}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <a
                  href="/dashboard"
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl text-sm font-semibold transition-all text-center"
                >
                  Dashboard
                </a>
                <a
                  href="/"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl text-sm font-semibold transition-all text-center"
                >
                  Home
                </a>
              </div>
            </div>
          ) : checkinResult?.success === false ? (
            /* Error State */
            <div className="text-center">
              <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={48} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Check-in Failed
              </h2>
              <p className="text-red-400 text-sm mb-8 leading-relaxed">
                {checkinResult.error}
              </p>
              <button
                onClick={() => {
                  setCheckinResult(null);
                  checkInMutation.reset();
                }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl text-sm font-semibold transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            /* Check-in Screen */
            <div>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <QrCode size={36} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-1">
                  Check In
                </h1>
                <p className="text-white/50 text-sm">
                  Session token:{" "}
                  <code className="text-indigo-400 font-mono text-xs">
                    {token.slice(0, 20)}...
                  </code>
                </p>
              </div>

              {/* User Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {(user?.first_name || user?.name || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {[user?.first_name, user?.last_name]
                        .filter(Boolean)
                        .join(" ") || user?.name}
                    </div>
                    <div className="text-xs text-white/40">{user?.email}</div>
                  </div>
                  <span className="ml-auto text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Location Status */}
              <div
                className={`rounded-xl p-4 mb-5 border flex items-start gap-3 ${location ? "bg-emerald-500/8 border-emerald-500/20" : "bg-white/4 border-white/10"}`}
              >
                {gettingLocation ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="text-white/40 mt-0.5 animate-spin"
                    />
                    <div>
                      <p className="text-sm text-white/60 font-medium">
                        Getting your location...
                      </p>
                      <p className="text-xs text-white/35 mt-0.5">
                        Required for verification
                      </p>
                    </div>
                  </>
                ) : location ? (
                  <>
                    <MapPin size={16} className="text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-emerald-300 font-medium">
                        Location verified
                      </p>
                      <p className="text-xs text-emerald-400/60 mt-0.5">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      size={16}
                      className="text-amber-400 mt-0.5"
                    />
                    <div>
                      <p className="text-sm text-amber-300 font-medium">
                        Location unavailable
                      </p>
                      <p className="text-xs text-amber-300/60 mt-0.5">
                        {locationError || "Enable GPS for better verification"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Check In Button */}
              <button
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending || gettingLocation}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-base transition-all flex items-center justify-center gap-2 mb-4"
              >
                {checkInMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Mark Me Present
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-white/25 justify-center">
                <Shield size={12} />
                <span>Secured with session tokens, sign-in, and GPS verification</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
