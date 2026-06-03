import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Camera,
  MapPin,
  Scan,
  Shield,
  ChevronLeft,
  Keyboard,
} from "lucide-react-native";

function CheckInResult({ status, message, sessionTitle, onClose, onRetry }) {
  const isSuccess = status === "success";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isSuccess
          ? "rgba(16,185,129,0.08)"
          : "rgba(239,68,68,0.08)",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: isSuccess
            ? "rgba(16,185,129,0.2)"
            : "rgba(239,68,68,0.2)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          borderWidth: 2,
          borderColor: isSuccess
            ? "rgba(16,185,129,0.4)"
            : "rgba(239,68,68,0.4)",
        }}
      >
        {isSuccess ? (
          <CheckCircle size={48} color="#10B981" />
        ) : (
          <XCircle size={48} color="#EF4444" />
        )}
      </View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "900",
          color: "#FFFFFF",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {isSuccess ? "Attendance Marked!" : "Check-in Failed"}
      </Text>
      {sessionTitle && (
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          {sessionTitle}
        </Text>
      )}
      <Text
        style={{
          fontSize: 14,
          color: isSuccess ? "#10B981" : "#EF4444",
          textAlign: "center",
          marginBottom: 36,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
      <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
        {!isSuccess && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: isSuccess ? "#10B981" : "#6366F1",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            {isSuccess ? "Done" : "Cancel"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const { signIn } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status, message, sessionTitle }
  const [manualMode, setManualMode] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true },
      );
    }
  }, []);

  const extractToken = (data) => {
    // QR code contains URL like https://app.com/attend/TOKEN or just the token itself
    try {
      const url = new URL(data);
      const parts = url.pathname.split("/");
      return parts[parts.length - 1];
    } catch {
      return data.trim();
    }
  };

  const checkIn = async (token) => {
    if (!token) return;
    setLoading(true);
    try {
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
      if (!res.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setResult({
          status: "error",
          message: data.error || "Check-in failed. Try again.",
        });
      } else {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        setResult({
          status: "success",
          message: `You are marked ${data.attendance_status || "present"} ✓`,
          sessionTitle: data.session_title,
        });
      }
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setResult({
        status: "error",
        message: "Network error. Please check your connection.",
      });
    }
    setLoading(false);
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const token = extractToken(data);
    await checkIn(token);
  };

  const handleManualSubmit = async () => {
    if (!tokenInput.trim()) return;
    const token = extractToken(tokenInput.trim());
    await checkIn(token);
  };

  const reset = () => {
    setScanned(false);
    setResult(null);
    setTokenInput("");
    setLoading(false);
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
        <QrCode
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
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Sign in to scan your attendance QR code
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

  // Showing result screen
  if (result) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#0D0D1A", paddingTop: insets.top }}
      >
        <StatusBar style="light" />
        <CheckInResult
          status={result.status}
          message={result.message}
          sessionTitle={result.sessionTitle}
          onClose={reset}
          onRetry={reset}
        />
      </View>
    );
  }

  // Loading overlay state
  if (loading) {
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
            backgroundColor: "rgba(99,102,241,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: "#FFFFFF",
            marginBottom: 6,
          }}
        >
          Verifying...
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
          }}
        >
          AI is checking your attendance securely
        </Text>
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFFFFF" }}>
            Scan QR Code
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
            }}
          >
            Point at the session QR code to check in
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setManualMode(!manualMode)}
          style={{
            backgroundColor: "rgba(99,102,241,0.15)",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(99,102,241,0.3)",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#6366F1" }}>
            {manualMode ? "Camera" : "Manual"}
          </Text>
        </TouchableOpacity>
      </View>

      {manualMode ? (
        // Manual Token Entry
        <ScrollView contentContainerStyle={{ flex: 1, padding: 20 }}>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Keyboard
              size={40}
              color="rgba(99,102,241,0.6)"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#FFFFFF",
                marginBottom: 6,
              }}
            >
              Enter Session Token
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Ask your teacher for the session token or paste the QR code URL
            </Text>
            <TextInput
              value={tokenInput}
              onChangeText={setTokenInput}
              placeholder="e.g. abc123xyz or session URL"
              placeholderTextColor="rgba(255,255,255,0.25)"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(99,102,241,0.3)",
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: "#FFFFFF",
                fontSize: 14,
                marginBottom: 14,
              }}
            />
            <TouchableOpacity
              onPress={handleManualSubmit}
              disabled={!tokenInput.trim()}
              activeOpacity={0.8}
              style={{
                width: "100%",
                backgroundColor: tokenInput.trim()
                  ? "#6366F1"
                  : "rgba(99,102,241,0.3)",
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}
              >
                Check In
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "rgba(16,185,129,0.06)",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(16,185,129,0.15)",
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Shield size={16} color="#10B981" style={{ marginTop: 1 }} />
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                flex: 1,
                lineHeight: 18,
              }}
            >
              Your check-in is verified with GPS location and timestamp.
              Anti-spoofing measures are always active.
            </Text>
          </View>
        </ScrollView>
      ) : (
        // Camera QR Scanner
        <View style={{ flex: 1 }}>
          {!permission?.granted ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
              }}
            >
              <Camera
                size={52}
                color="rgba(255,255,255,0.2)"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Camera Access Needed
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Allow camera access to scan the session QR code for attendance
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={{
                  backgroundColor: "#6366F1",
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}
                >
                  Grant Camera Access
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, position: "relative" }}>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
              {/* Scan overlay */}
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Dark corners */}
                <View
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: "rgba(99,102,241,0.8)",
                  }}
                >
                  {/* Corner decorators */}
                  {[
                    {
                      top: -2,
                      left: -2,
                      borderTopWidth: 4,
                      borderLeftWidth: 4,
                    },
                    {
                      top: -2,
                      right: -2,
                      borderTopWidth: 4,
                      borderRightWidth: 4,
                    },
                    {
                      bottom: -2,
                      left: -2,
                      borderBottomWidth: 4,
                      borderLeftWidth: 4,
                    },
                    {
                      bottom: -2,
                      right: -2,
                      borderBottomWidth: 4,
                      borderRightWidth: 4,
                    },
                  ].map((style, i) => (
                    <View
                      key={i}
                      style={{
                        position: "absolute",
                        width: 30,
                        height: 30,
                        borderColor: "#6366F1",
                        borderRadius: 4,
                        ...style,
                      }}
                    />
                  ))}
                </View>

                {/* Instructions */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 80,
                    backgroundColor: "rgba(13,13,26,0.85)",
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    alignItems: "center",
                    gap: 6,
                    marginHorizontal: 20,
                  }}
                >
                  <Scan size={18} color="#6366F1" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Align QR code in the frame
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <MapPin
                      size={11}
                      color={location ? "#10B981" : "rgba(255,255,255,0.4)"}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: location ? "#10B981" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {location ? "GPS verified" : "Getting location..."}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
