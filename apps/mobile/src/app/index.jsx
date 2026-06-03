import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0D1A",
        }}
      >
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
