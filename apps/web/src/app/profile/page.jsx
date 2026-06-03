"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Camera,
  Save,
  ChevronLeft,
  Edit2,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    organization: "",
  });

  const { data: profileData, isLoading } = useQuery({
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

  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        name: profileData.user.name || "",
        phone: profileData.user.phone || "",
        organization: profileData.user.organization || "",
      });
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      toast.success("Profile updated successfully!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const user = profileData?.user;
  const roleBadge = {
    admin: {
      cls: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      label: "Administrator",
    },
    super_admin: {
      cls: "bg-red-500/20 text-red-300 border-red-500/30",
      label: "Super Admin",
    },
    teacher: {
      cls: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      label: "Teacher",
    },
    student: {
      cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      label: "Student",
    },
    employee: {
      cls: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      label: "Employee",
    },
  };
  const badge = roleBadge[user?.role] || {
    cls: "bg-white/10 text-white/50 border-white/20",
    label: user?.role || "User",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style
          jsx
          global
        >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <a
          href="/dashboard"
          className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mb-3 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Dashboard
        </a>
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-white/50 text-sm">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4 w-fit">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white border-4 border-[#0A0A0F] shadow-2xl shadow-indigo-500/30">
              {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center transition-all shadow-lg">
              <Camera size={12} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.name || "No name set"}
              </h2>
              <p className="text-white/50 text-sm">{user?.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mt-2 ${badge.cls}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {badge.label}
              </span>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${editing ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"}`}
            >
              <Edit2 size={14} /> {editing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {[
              {
                label: "Full Name",
                icon: User,
                key: "name",
                type: "text",
                placeholder: "Your full name",
                value: formData.name,
              },
              {
                label: "Email",
                icon: Mail,
                key: "email",
                type: "email",
                value: user?.email,
                disabled: true,
              },
              {
                label: "Phone",
                icon: Phone,
                key: "phone",
                type: "tel",
                placeholder: "+1 (555) 000-0000",
                value: formData.phone,
              },
              {
                label: "Organization",
                icon: Building,
                key: "organization",
                type: "text",
                placeholder: "School / Company",
                value: formData.organization,
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type={field.type}
                    value={field.value || ""}
                    disabled={field.disabled || !editing}
                    onChange={(e) =>
                      !field.disabled &&
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm transition-all ${field.disabled || !editing ? "border-white/5 text-white/40 cursor-not-allowed" : "border-white/10 text-white focus:outline-none focus:border-indigo-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate(formData)}
                disabled={updateMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Save size={14} />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Account Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-indigo-400" /> Account Security
        </h3>
        <div className="space-y-3">
          {[
            { label: "Password", value: "••••••••", action: "Change" },
            {
              label: "Two-Factor Auth",
              value: "Not enabled",
              action: "Enable",
              disabled: true,
            },
            { label: "Active Sessions", value: "1 device", action: "Manage" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-white">
                  {item.label}
                </div>
                <div className="text-xs text-white/40">{item.value}</div>
              </div>
              <button
                disabled={item.disabled}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${item.disabled ? "text-white/20 cursor-not-allowed" : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"}`}
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <a
          href="/account/logout"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
        >
          Sign Out of SmartAttend Pro
        </a>
      </motion.div>

      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
