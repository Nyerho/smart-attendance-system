"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Bell, Shield, QrCode, Palette, Save, ChevronLeft } from "lucide-react";

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      type="button"
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-indigo-600" : "bg-white/20"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <Icon size={18} className="text-indigo-400" />
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && (
          <div className="text-xs text-white/40 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      attendance_marked: true,
      late_arrival: true,
      session_start: true,
      weekly_report: false,
    },
    attendance: {
      allow_qr: true,
      allow_face: false,
      allow_manual: false,
      default_late_threshold: 15,
      default_radius: 100,
    },
    security: { require_gps: false, prevent_proxy: true, face_liveness: false },
    appearance: { dark_mode: true, compact_view: false },
  });

  const set = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const saveSettings = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a
          href="/dashboard"
          className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mb-3 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Dashboard
        </a>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-white/50 text-sm">
          Configure your SmartAttend Pro experience
        </p>
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <SettingRow
          label="Attendance Marked"
          description="Get notified when your attendance is recorded"
        >
          <ToggleSwitch
            checked={settings.notifications.attendance_marked}
            onChange={(v) => set("notifications", "attendance_marked", v)}
          />
        </SettingRow>
        <SettingRow
          label="Late Arrival Alerts"
          description="Receive alerts when you're marked late"
        >
          <ToggleSwitch
            checked={settings.notifications.late_arrival}
            onChange={(v) => set("notifications", "late_arrival", v)}
          />
        </SettingRow>
        <SettingRow
          label="Session Start Notifications"
          description="Be notified when a new session begins"
        >
          <ToggleSwitch
            checked={settings.notifications.session_start}
            onChange={(v) => set("notifications", "session_start", v)}
          />
        </SettingRow>
        <SettingRow
          label="Weekly Summary Report"
          description="Receive weekly attendance summary via email"
        >
          <ToggleSwitch
            checked={settings.notifications.weekly_report}
            onChange={(v) => set("notifications", "weekly_report", v)}
          />
        </SettingRow>
      </Section>

      {/* Attendance Methods */}
      <Section title="Attendance Methods" icon={QrCode}>
        <SettingRow
          label="QR Code Check-in"
          description="Allow students to scan QR codes for attendance"
        >
          <ToggleSwitch
            checked={settings.attendance.allow_qr}
            onChange={(v) => set("attendance", "allow_qr", v)}
          />
        </SettingRow>
        <SettingRow
          label="Face Pipeline (Planned)"
          description="Reserved for a future FastAPI/OpenCV service. Not active in this deployment."
        >
          <ToggleSwitch
            checked={settings.attendance.allow_face}
            onChange={(v) => set("attendance", "allow_face", v)}
          />
        </SettingRow>
        <SettingRow
          label="Manual Entry (Default Off)"
          description="Allow manual attendance marking without verification"
        >
          <ToggleSwitch
            checked={settings.attendance.allow_manual}
            onChange={(v) => set("attendance", "allow_manual", v)}
          />
        </SettingRow>
        <div className="pt-3 border-t border-white/10 space-y-4">
          <SettingRow
            label="Default Late Threshold"
            description="Minutes after session start to mark as late"
          >
            <select
              value={settings.attendance.default_late_threshold}
              onChange={(e) =>
                set(
                  "attendance",
                  "default_late_threshold",
                  parseInt(e.target.value),
                )
              }
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              {[5, 10, 15, 20, 30].map((v) => (
                <option key={v} value={v} className="bg-[#12121A]">
                  {v} minutes
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow
            label="Default GPS Radius"
            description="Default geofence radius for new sessions"
          >
            <select
              value={settings.attendance.default_radius}
              onChange={(e) =>
                set("attendance", "default_radius", parseInt(e.target.value))
              }
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              {[50, 100, 200, 500, 1000].map((v) => (
                <option key={v} value={v} className="bg-[#12121A]">
                  {v}m
                </option>
              ))}
            </select>
          </SettingRow>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security & Fraud Prevention" icon={Shield}>
        <SettingRow
          label="Require GPS Verification"
          description="All check-ins must include valid GPS coordinates"
        >
          <ToggleSwitch
            checked={settings.security.require_gps}
            onChange={(v) => set("security", "require_gps", v)}
          />
        </SettingRow>
        <SettingRow
          label="AI Proxy Prevention"
          description="Detect and block duplicate check-in attempts"
        >
          <ToggleSwitch
            checked={settings.security.prevent_proxy}
            onChange={(v) => set("security", "prevent_proxy", v)}
          />
        </SettingRow>
        <SettingRow
          label="Liveness Checks (Planned)"
          description="Enable only after a real biometric or face service is deployed."
        >
          <ToggleSwitch
            checked={settings.security.face_liveness}
            onChange={(v) => set("security", "face_liveness", v)}
          />
        </SettingRow>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <SettingRow
          label="Dark Mode"
          description="Use dark theme throughout the app (recommended)"
        >
          <ToggleSwitch
            checked={settings.appearance.dark_mode}
            onChange={(v) => set("appearance", "dark_mode", v)}
          />
        </SettingRow>
        <SettingRow
          label="Compact View"
          description="Use smaller cards and reduced spacing"
        >
          <ToggleSwitch
            checked={settings.appearance.compact_view}
            onChange={(v) => set("appearance", "compact_view", v)}
          />
        </SettingRow>
      </Section>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xl shadow-indigo-500/20"
      >
        <Save size={16} /> Save All Settings
      </button>
    </div>
  );
}
