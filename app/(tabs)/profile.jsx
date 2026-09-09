import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clearAuthSession, getAuthUser } from "../../utils/authStorage";
import { showErrorMessage } from "../../utils/errorMessageBus";

const T = {
  ink: "#141821",
  fieldBg: "#F7F7F8",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  yellow: "#FFC800",
  yellowDark: "#E5B200",
  blue: "#1CB0F6",
  red: "#FF4B4B",
  redBg: "#FDECEC",
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getAuthUser();
      setAuthUser(user);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await clearAuthSession();
    setAuthUser(null);
    showErrorMessage("Logged out", "You have been logged out successfully");
    router.push("/login");
  };

  const accountItems = [
    { label: "Account Settings", icon: "settings", route: "/account-settings", color: "#FF9600" },
    { label: "Privacy Policy", icon: "security", route: "/privacy-policy", color: "#1CB0F6" },
    { label: "Terms of Service", icon: "description", route: "/terms-of-service", color: "#8954BA" },
    { label: "Help & Support", icon: "help-outline", route: "/help-support", color: "#58CC02" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Duolingo Style Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top + 12, 52),
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: T.fieldBorder,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "900", color: T.ink }}>Profile</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/account-settings")}>
          <MaterialIcons name="settings" size={26} color={T.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}>
        {/* User Avatar Stage */}
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{ position: "relative", marginBottom: 14 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#E8F2FF",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: T.fieldBorder,
                overflow: "hidden",
              }}
            >
              {authUser?.avatar ? (
                <Image source={{ uri: authUser.avatar }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <MaterialIcons name="person" size={58} color={T.blue} />
              )}
            </View>

            {/* Camera Edit Badge */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/account-settings")}
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: T.blue,
                borderWidth: 2,
                borderColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "900", color: T.ink, textAlign: "center" }}>
            {authUser?.name || "Guest User"}
          </Text>

          <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginTop: 2 }}>
            {authUser?.email ? `Joined ${authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}` : "Not logged in"}
          </Text>

          {/* Premium Tag Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: T.yellow,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 12,
              marginTop: 10,
            }}
          >
            <MaterialIcons name="crown" size={16} color="#FFFFFF" />
            <Text style={{ fontSize: 11, fontWeight: "900", letterSpacing: 0.8, color: "#FFFFFF", textTransform: "uppercase" }}>
              PREMIUM
            </Text>
          </View>
        </View>

        {/* Account List Section */}
        <Text style={{ fontSize: 18, fontWeight: "900", color: T.ink, marginBottom: 12 }}>Account</Text>

        <View style={{ gap: 10, marginBottom: 28 }}>
          {accountItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => router.push(item.route)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: T.fieldBg,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: T.fieldBorder,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <MaterialIcons name={item.icon} size={22} color={item.color} />
                <Text style={{ fontSize: 16, fontWeight: "800", color: T.ink }}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={T.caps} />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          {authUser && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: T.redBg,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: "#F8C4C4",
                marginTop: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <MaterialIcons name="logout" size={22} color={T.red} />
                <Text style={{ fontSize: 16, fontWeight: "800", color: T.red }}>Logout</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={T.red} />
            </TouchableOpacity>
          )}
        </View>

        {/* Guest User CTA */}
        {!authUser && (
          <View
            style={{
              borderRadius: 24,
              backgroundColor: T.ink,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: T.yellow, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="lock-open" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>Unlock your workspace</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: T.caps, marginTop: 2 }}>Save your progress across devices.</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/login")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "800", color: T.ink }}>Log in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/signup")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: T.yellow,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}