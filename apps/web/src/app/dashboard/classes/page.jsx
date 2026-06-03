"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Plus, Users, MapPin, Clock, Search } from "lucide-react";

export default function ClassesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department_id: "",
    schedule: "",
    location: "",
    max_students: 50,
  });
  const queryClient = useQueryClient();

  const { data: classesData, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await fetch("/api/classes");
      if (!res.ok) return { classes: [] };
      return res.json();
    },
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) return { departments: [] };
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          max_students: parseInt(data.max_students),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setShowCreate(false);
      setFormData({
        name: "",
        code: "",
        department_id: "",
        schedule: "",
        location: "",
        max_students: 50,
      });
      toast.success("Class created!");
    },
    onError: () => toast.error("Failed to create class"),
  });

  const classes = (classesData?.classes || []).filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(search.toLowerCase()),
  );
  const departments = deptData?.departments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Classes</h1>
          <p className="text-white/50 text-sm">
            Manage courses and class enrollments
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105"
        >
          <Plus size={16} /> New Class
        </button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-white/5 border border-white/10 rounded-2xl"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <BookOpen size={40} className="text-white/20 mb-4" />
          <h3 className="font-semibold text-white/60 mb-1">No classes yet</h3>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Create first class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={20} className="text-blue-400" />
                </div>
                {cls.code && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg font-mono">
                    {cls.code}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-white mb-1">{cls.name}</h3>
              {cls.department_name && (
                <p className="text-white/40 text-xs mb-4">
                  {cls.department_name}
                </p>
              )}
              <div className="space-y-2 text-xs text-white/40">
                {cls.schedule && (
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>{cls.schedule}</span>
                  </div>
                )}
                {cls.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    <span>{cls.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={12} />
                  <span>Max {cls.max_students} students</span>
                </div>
              </div>
              {cls.teacher_name && (
                <div className="mt-4 pt-3 border-t border-white/8 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-xs font-bold text-white">
                    {cls.teacher_name.charAt(0)}
                  </div>
                  <span className="text-xs text-white/50">
                    {cls.teacher_name}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-auto max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-white">Create New Class</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Class Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Introduction to Programming"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Code
                  </label>
                  <input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, code: e.target.value }))
                    }
                    placeholder="CS101"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        max_students: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Department
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      department_id: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="" className="bg-[#12121A]">
                    No department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#12121A]">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Schedule
                </label>
                <input
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, schedule: e.target.value }))
                  }
                  placeholder="e.g. Mon/Wed 9:00-10:30"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Location
                </label>
                <input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="e.g. Room 201, Building A"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium transition-all hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : null}
                  Create Class
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
