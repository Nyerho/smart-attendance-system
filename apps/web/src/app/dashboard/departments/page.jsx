"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building, Plus, Users, BookOpen, Search } from "lucide-react";

export default function DepartmentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) return { departments: [] };
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setShowCreate(false);
      setFormData({ name: "", code: "", description: "" });
      toast.success("Department created!");
    },
    onError: () => toast.error("Failed to create department"),
  });

  const departments = (data?.departments || []).filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Departments</h1>
          <p className="text-white/50 text-sm">
            Manage organizational departments and divisions
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:scale-105"
        >
          <Plus size={16} /> New Department
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
          placeholder="Search departments..."
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-white/5 border border-white/10 rounded-2xl"
            />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <Building size={40} className="text-white/20 mb-4" />
          <h3 className="font-semibold text-white/60 mb-1">
            No departments yet
          </h3>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Create first department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building size={20} className="text-indigo-400" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white">{dept.name}</h3>
                {dept.code && (
                  <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-lg font-mono">
                    {dept.code}
                  </span>
                )}
              </div>
              {dept.description && (
                <p className="text-white/40 text-sm mb-4 line-clamp-2">
                  {dept.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-white/30 pt-3 border-t border-white/8">
                <div className="flex items-center gap-1">
                  <Users size={12} /> {dept.member_count || 0} members
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={12} /> {dept.class_count || 0} classes
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-white">Create Department</h2>
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
                  Department Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Computer Science"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Code
                </label>
                <input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, code: e.target.value }))
                  }
                  placeholder="e.g. CS"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Brief description..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
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
                  Create Department
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
