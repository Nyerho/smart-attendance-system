"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Shield,
  UserCheck,
  Mail,
  Building,
  Edit2,
} from "lucide-react";

const roleBadge = {
  admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  super_admin: "bg-red-500/20 text-red-300 border-red-500/30",
  teacher: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  student: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  employee: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  manager: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access denied. Admin only.");
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast.success("User role updated!");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-white/50 text-sm">
            Manage all registered users and their roles
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Users size={16} className="text-indigo-400" />
          <span className="text-white/60">{users.length} total users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-indigo-500 transition-all"
        >
          {["all", "admin", "teacher", "student", "employee", "manager"].map(
            (r) => (
              <option key={r} value={r} className="bg-[#12121A] capitalize">
                {r === "all"
                  ? "All Roles"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ),
          )}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={40} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  {["User", "Role", "Organization", "Joined", "Actions"].map(
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
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {(user.name || user.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {user.name || "—"}
                          </div>
                          <div className="text-xs text-white/40">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUser === user.id ? (
                        <select
                          defaultValue={user.role}
                          autoFocus
                          onBlur={(e) => {
                            updateRoleMutation.mutate({
                              id: user.id,
                              role: e.target.value,
                            });
                          }}
                          className="bg-[#1A1A2E] border border-indigo-500 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                        >
                          {[
                            "student",
                            "teacher",
                            "employee",
                            "manager",
                            "admin",
                          ].map((r) => (
                            <option
                              key={r}
                              value={r}
                              className="bg-[#12121A] capitalize"
                            >
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${roleBadge[user.role] || "bg-white/10 text-white/50 border-white/20"}`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {user.organization || user.department_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          setEditingUser(
                            editingUser === user.id ? null : user.id,
                          )
                        }
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 size={13} /> Edit Role
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
