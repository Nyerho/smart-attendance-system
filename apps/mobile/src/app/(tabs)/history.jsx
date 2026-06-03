import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  Camera,
  PenLine,
  TrendingUp,
  Filter,
} from "lucide-react-native";

const STATUS_FILTERS = ["all", "present", "late", "absent"];

function StatusBadge({ status }) {
  const config = {
    present: {
      color: "#10B981",
      bg: "rgba(16,185,129,0.12)",
      label: "Present",
      Icon: CheckCircle,
    },
    late: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
      label: "Late",
      Icon: Clock,
    },
    absent: {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
      label: "Absent",
      Icon: XCircle,
    },
  };
  const c = config[status] || config.present;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: c.bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
      }}
    >
      <c.Icon size={11} color={c.color} />
      <Text style={{ fontSize: 11, fontWeight: "700", color: c.color }}>
        {c.label}
      </Text>
    </View>
  );
}

function MethodIcon({ method }) {
  const cfg = {
    qr: { Icon: QrCode, color: "#6366F1" },
    face: { Icon: Camera, color: "#8B5CF6" },
    manual: { Icon: PenLine, color: "rgba(255,255,255,0.4)" },
  };
  const { Icon, color } = cfg[method] || cfg.manual;
  return <Icon size={13} color={color} />;
}

function AttendanceRow({ record }) {
  const date = new Date(record.check_in_time);
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Date block */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.06)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF" }}>
          {date.getDate()}
        </Text>
        <Text
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
          }}
        >
          {date.toLocaleString("default", { month: "short" })}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}
          numberOfLines={1}
        >
          {record.session_title || "Class Session"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
          }}
        >
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <MethodIcon method={record.method} />
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              textTransform: "capitalize",
            }}
          >
            {record.method}
          </Text>
        </View>
      </View>

      <StatusBadge status={record.status} />
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const { signIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["mobile-attendance-history", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?user_id=${user.id}&limit=100`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
    enabled: !!user?.id,
  });

  const allRecords = data?.records || [];
  const filtered =
    activeFilter === "all"
      ? allRecords
      : allRecords.filter((r) => r.status === activeFilter);

  const presentCount = allRecords.filter((r) => r.status === "present").length;
  const lateCount = allRecords.filter((r) => r.status === "late").length;
  const absentCount = allRecords.filter((r) => r.status === "absent").length;
  const total = allRecords.length;
  const rate =
    total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  if (!user) {
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
        <Clock
          size={48}
          color="rgba(255,255,255,0.2)"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Sign in Required
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Sign in to view your attendance history
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: "#6366F1",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF" }}>
          Attendance History
        </Text>
        <Text
          style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}
        >
          Your complete attendance record
        </Text>
      </View>

      {/* Summary Bar */}
      <View
        style={{
          marginHorizontal: 20,
          backgroundColor: "rgba(99,102,241,0.08)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "rgba(99,102,241,0.2)",
          flexDirection: "row",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Rate */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color:
                rate >= 80 ? "#10B981" : rate >= 60 ? "#F59E0B" : "#EF4444",
            }}
          >
            {rate}%
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            OVERALL
          </Text>
        </View>
        <View
          style={{
            width: 1,
            height: 40,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        {/* Present */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#10B981" }}>
            {presentCount}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            PRESENT
          </Text>
        </View>
        <View
          style={{
            width: 1,
            height: 40,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        {/* Late */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#F59E0B" }}>
            {lateCount}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            LATE
          </Text>
        </View>
        <View
          style={{
            width: 1,
            height: 40,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        {/* Absent */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#EF4444" }}>
            {absentCount}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            ABSENT
          </Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  activeFilter === f ? "#6366F1" : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor:
                  activeFilter === f ? "#6366F1" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color:
                    activeFilter === f ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  textTransform: "capitalize",
                }}
              >
                {f === "all"
                  ? "All"
                  : `${f.charAt(0).toUpperCase() + f.slice(1)} (${allRecords.filter((r) => r.status === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Records List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#6366F1"
          />
        }
      >
        {isLoading ? (
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <TrendingUp size={32} color="rgba(255,255,255,0.15)" />
            <Text
              style={{
                color: "rgba(255,255,255,0.3)",
                marginTop: 12,
                fontSize: 14,
              }}
            >
              Loading records...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingTop: 48,
              paddingBottom: 20,
            }}
          >
            <Clock
              size={48}
              color="rgba(255,255,255,0.1)"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              No records found
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.2)",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {activeFilter === "all"
                ? "Scan a QR code to start building your record"
                : `No ${activeFilter} records`}
            </Text>
          </View>
        ) : (
          filtered.map((record) => (
            <AttendanceRow key={record.id} record={record} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
