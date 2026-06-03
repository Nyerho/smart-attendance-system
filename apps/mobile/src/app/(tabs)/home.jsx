import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Brain,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Bell,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react-native";

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        minWidth: "44%",
      }}
    >
      <Icon size={18} color={color} style={{ marginBottom: 8 }} />
      <Text
        style={{
          fontSize: 26,
          fontWeight: "900",
          color: "#FFFFFF",
          lineHeight: 30,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          marginTop: 2,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SessionCard({ session, onPress }) {
  const isActive = session.status === "active";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isActive
          ? "rgba(99,102,241,0.4)"
          : "rgba(255,255,255,0.07)",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isActive
            ? "rgba(99,102,241,0.2)"
            : "rgba(255,255,255,0.06)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isActive ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#6366F1",
            }}
          />
        ) : (
          <Clock size={20} color="rgba(255,255,255,0.3)" />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}
          numberOfLines={1}
        >
          {session.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            marginTop: 2,
          }}
        >
          {new Date(session.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" · "}
          {session.checkin_count || 0} checked in
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            backgroundColor: isActive
              ? "rgba(16,185,129,0.15)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: isActive ? "#10B981" : "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {session.status}
          </Text>
        </View>
        <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  const {
    data: stats,
    refetch: refetchStats,
    isRefetching,
  } = useQuery({
    queryKey: ["mobile-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["mobile-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions?limit=5&status=active");
      if (!res.ok) return { sessions: [] };
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 20000,
  });

  const { data: notifData } = useQuery({
    queryKey: ["mobile-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=3");
      if (!res.ok) return { notifications: [] };
      return res.json();
    },
    enabled: !!user,
  });

  const activeSessions = (sessionsData?.sessions || []).filter(
    (s) => s.status === "active",
  );
  const unreadNotifs = (notifData?.notifications || []).filter(
    (n) => !n.is_read,
  ).length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (!user && !userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0D0D1A",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <StatusBar style="light" />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: "rgba(99,102,241,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Brain size={36} color="#6366F1" />
        </View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          SmartAttend Pro
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          AI-powered attendance management system
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          activeOpacity={0.8}
          style={{
            width: "100%",
            backgroundColor: "#6366F1",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
            Sign In to Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchStats}
            tintColor="#6366F1"
          />
        }
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 24,
            backgroundColor: "#0D0D1A",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: "500",
                }}
              >
                {getGreeting()},
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginTop: 2,
                }}
              >
                {user?.first_name || user?.name?.split(" ")[0] || "Student"} 👋
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "rgba(255,255,255,0.07)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Bell size={18} color="rgba(255,255,255,0.6)" />
              {unreadNotifs > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#EF4444",
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Role Badge */}
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(99,102,241,0.15)",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(99,102,241,0.3)",
              }}
            >
              <Brain size={12} color="#6366F1" />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#6366F1",
                  textTransform: "capitalize",
                }}
              >
                {user?.role || "student"}
              </Text>
            </View>
            {activeSessions.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(16,185,129,0.15)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(16,185,129,0.3)",
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#10B981",
                  }}
                />
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#10B981" }}
                >
                  {activeSessions.length} Live Session
                  {activeSessions.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Your Stats
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <StatCard
              label="Attendance Rate"
              value={
                stats?.attendanceRate !== undefined
                  ? `${stats.attendanceRate}%`
                  : "—"
              }
              icon={TrendingUp}
              color="#10B981"
              bg="rgba(16,185,129,0.08)"
            />
            <StatCard
              label="Classes Attended"
              value={stats?.classesAttended ?? "—"}
              icon={CheckCircle}
              color="#6366F1"
              bg="rgba(99,102,241,0.08)"
            />
            <StatCard
              label="Missed"
              value={stats?.sessionsMissed ?? "—"}
              icon={AlertTriangle}
              color="#F59E0B"
              bg="rgba(245,158,11,0.08)"
            />
            <StatCard
              label="Current Streak"
              value={stats?.currentStreak ? `${stats.currentStreak}d` : "—"}
              icon={TrendingUp}
              color="#8B5CF6"
              bg="rgba(139,92,246,0.08)"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/scan")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: "#6366F1",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                gap: 8,
              }}
            >
              <QrCode size={26} color="#FFFFFF" />
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}
              >
                Scan QR
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                }}
              >
                Check in to class
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/history")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Clock size={26} color="rgba(255,255,255,0.6)" />
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}
              >
                History
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  textAlign: "center",
                }}
              >
                View attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {activeSessions.length > 0 ? "Live Sessions" : "Recent Sessions"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Wifi size={12} color="rgba(255,255,255,0.3)" />
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                Auto-refresh
              </Text>
            </View>
          </View>

          {(sessionsData?.sessions || []).length === 0 ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.07)",
                borderStyle: "dashed",
              }}
            >
              <Clock
                size={32}
                color="rgba(255,255,255,0.15)"
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                No active sessions
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Sessions will appear here when your teacher starts one
              </Text>
            </View>
          ) : (
            (sessionsData?.sessions || []).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => router.push("/(tabs)/scan")}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
