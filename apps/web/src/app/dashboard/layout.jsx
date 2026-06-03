"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Sun,
  Moon,
  QrCode,
  Shield,
  Clock,
  TrendingUp,
  FileText,
  Building,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["admin", "teacher", "student", "employee"],
  },
  { icon: Users, label: "Users", href: "/dashboard/users", roles: ["admin"] },
  {
    icon: Building,
    label: "Departments",
    href: "/dashboard/departments",
    roles: ["admin"],
  },
  {
    icon: BookOpen,
    label: "Classes",
    href: "/dashboard/classes",
    roles: ["admin", "teacher"],
  },
  {
    icon: CalendarCheck,
    label: "Sessions",
    href: "/dashboard/sessions",
    roles: ["admin", "teacher"],
  },
  {
    icon: QrCode,
    label: "Attendance",
    href: "/dashboard/attendance",
    roles: ["admin", "teacher", "student", "employee"],
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    roles: ["admin", "teacher"],
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/reports",
    roles: ["admin", "teacher"],
  },
  {
    icon: Shield,
    label: "Audit Logs",
    href: "/dashboard/audit",
    roles: ["admin"],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    roles: ["admin", "teacher", "student", "employee"],
  },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: notifsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { notifications: [] };
      return res.json();
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (typeof window !== "undefined") setCurrentPath(window.location.pathname);
  }, []);

  const userRole = profileData?.user?.role || "student";
  const userName =
    profileData?.user?.name || profileData?.user?.email || "User";
  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));
  const unreadNotifs = (notifsData?.notifications || []).filter(
    (n) => !n.is_read,
  ).length;

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full bg-[#0D0D14] border-r border-white/8 ${mobile ? "w-72" : sidebarOpen ? "w-64" : "w-16"} transition-all duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <Brain size={18} className="text-white" />
        </div>
        {(sidebarOpen || mobile) && (
          <div>
            <div className="font-bold text-white text-sm leading-tight">
              Smart Attendance
            </div>
            <div className="text-indigo-400 text-xs font-medium">System</div>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {(sidebarOpen || mobile) && (
        <div className="px-4 py-3 border-b border-white/8">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            ${
              userRole === "admin"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : userRole === "teacher"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(item.href + "/");
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
            >
              <item.icon
                size={18}
                className={`shrink-0 ${isActive ? "text-indigo-400" : "group-hover:text-white/70"}`}
              />
              {(sidebarOpen || mobile) && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && (sidebarOpen || mobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/8">
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer ${!sidebarOpen && !mobile ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          {(sidebarOpen || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/80 truncate">
                {userName}
              </div>
              <div className="text-xs text-white/40 truncate">{userRole}</div>
            </div>
          )}
          {(sidebarOpen || mobile) && (
            <a
              href="/account/logout"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
            >
              <LogOut size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/8 bg-[#0A0A0F]/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setMobileSidebarOpen(true);
              }}
              className="md:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                placeholder="Search..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all w-48 lg:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        Notifications
                      </span>
                      {unreadNotifs > 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                          {unreadNotifs} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {(notifsData?.notifications || []).length === 0 ? (
                        <div className="text-center text-white/30 text-sm py-8">
                          No notifications
                        </div>
                      ) : (
                        (notifsData?.notifications || [])
                          .slice(0, 5)
                          .map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all ${!n.is_read ? "bg-indigo-500/5" : ""}`}
                            >
                              <div className="font-medium text-sm text-white/80">
                                {n.title}
                              </div>
                              <div className="text-xs text-white/40 mt-1">
                                {n.message}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <a
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/70 hidden sm:block max-w-[100px] truncate">
                {userName}
              </span>
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }
      `}</style>
    </div>
  );
}
