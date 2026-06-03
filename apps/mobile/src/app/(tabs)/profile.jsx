import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Brain,
  QrCode,
  TrendingUp,
  Key,
  Info,
  Star,
} from "lucide-react-native";

function Avatar({ name, size = 72 }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#6366F1",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(99,102,241,0.4)",
      }}
    >
      <Text
        style={{ fontSize: size / 2.8, fontWeight: "900", color: "#FFFFFF" }}
      >
        {initials}
      </Text>
    </View>
  );
}

function MenuRow({
  icon: Icon,
  label,
  value,
  onPress,
  color = "rgba(255,255,255,0.6)",
  danger = false,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger
            ? "rgba(239,68,68,0.12)"
            : "rgba(255,255,255,0.07)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color={danger ? "#EF4444" : color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: danger ? "#EF4444" : "#FFFFFF",
          }}
        >
          {label}
        </Text>
        {value && (
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginTop: 1,
            }}
          >
            {value}
          </Text>
        )}
      </View>
      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {title && (
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            paddingHorizontal: 20,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: 16,
          marginHorizontal: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, signIn } = useAuth();
  const { data: user } = useUser();

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
  });

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const getRoleColor = (role) => {
    const map = {
      admin: "#EF4444",
      teacher: "#F59E0B",
      student: "#6366F1",
    };
    return map[role] || "#6366F1";
  };

  const getRoleBg = (role) => {
    const map = {
      admin: "rgba(239,68,68,0.15)",
      teacher: "rgba(245,158,11,0.15)",
      student: "rgba(99,102,241,0.15)",
    };
    return map[role] || "rgba(99,102,241,0.15)";
  };

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
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(99,102,241,0.12)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <User size={36} color="#6366F1" />
        </View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Your Profile
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Sign in to view your profile and attendance statistics
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#6366F1",
            paddingHorizontal: 36,
            paddingVertical: 15,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.name ||
    user.email;

  return (
    <View style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 28,
            alignItems: "center",
          }}
        >
          <Avatar name={fullName} size={80} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: "#FFFFFF",
              marginTop: 14,
            }}
          >
            {fullName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            {user.email}
          </Text>
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: getRoleBg(user.role),
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: `${getRoleColor(user.role)}40`,
            }}
          >
            <Brain size={12} color={getRoleColor(user.role)} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: getRoleColor(user.role),
                textTransform: "capitalize",
              }}
            >
              {user.role || "student"}
            </Text>
          </View>
        </View>

        {/* Attendance Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: "rgba(99,102,241,0.08)",
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: "rgba(99,102,241,0.2)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Attendance Statistics
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              {[
                {
                  label: "Rate",
                  value:
                    stats?.attendanceRate !== undefined
                      ? `${stats.attendanceRate}%`
                      : "—",
                  color: "#10B981",
                },
                {
                  label: "Present",
                  value: stats?.classesAttended ?? "—",
                  color: "#6366F1",
                },
                {
                  label: "Streak",
                  value: stats?.currentStreak ? `${stats.currentStreak}d` : "—",
                  color: "#F59E0B",
                },
              ].map(({ label, value, color }) => (
                <View key={label} style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "900", color }}>
                    {value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 4,
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Account Info */}
        <Section title="Account">
          <MenuRow
            icon={User}
            label="Full Name"
            value={fullName}
            color="#6366F1"
          />
          <MenuRow
            icon={Mail}
            label="Email"
            value={user.email}
            color="#10B981"
          />
          {user.employee_id && (
            <MenuRow
              icon={Key}
              label="Student ID"
              value={user.employee_id}
              color="#F59E0B"
            />
          )}
          {user.phone && (
            <MenuRow
              icon={Phone}
              label="Phone"
              value={user.phone}
              color="#8B5CF6"
            />
          )}
          {user.organization && (
            <MenuRow
              icon={Building}
              label="Organization"
              value={user.organization}
              color="#06B6D4"
            />
          )}
        </Section>

        {/* Features */}
        <Section title="Features">
          <MenuRow
            icon={QrCode}
            label="QR Code Check-in"
            value="Scan sessions to mark attendance"
            color="#6366F1"
          />
          <MenuRow
            icon={TrendingUp}
            label="Attendance Analytics"
            value="View your trends & statistics"
            color="#10B981"
          />
          <MenuRow
            icon={Bell}
            label="Notifications"
            value="Late alerts & session reminders"
            color="#F59E0B"
          />
        </Section>

        {/* Security */}
        <Section title="Security">
          <MenuRow
            icon={Shield}
            label="GPS Verification"
            value="Location-based check-in verification"
            color="#10B981"
          />
          <MenuRow
            icon={Brain}
            label="Anti-Spoofing"
            value="AI-powered duplicate prevention"
            color="#8B5CF6"
          />
        </Section>

        {/* App Info */}
        <Section title="About">
          <MenuRow
            icon={Star}
            label="SmartAttend Pro"
            value="AI-powered attendance system"
            color="#F59E0B"
          />
          <MenuRow
            icon={Info}
            label="Version"
            value="1.0.0"
            color="rgba(255,255,255,0.4)"
          />
        </Section>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.8}
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.25)",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#EF4444" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
