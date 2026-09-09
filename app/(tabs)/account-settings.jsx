import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { triggerVibration } from "../../components/constant/vibration";
import { API_BASE_URL } from "../../constants/api";
import { authFetch } from "../../utils/authFetch";
import { clearAuthSession, getAuthToken, getAuthUser } from "../../utils/authStorage";
import { showErrorMessage } from "../../utils/errorMessageBus";

const T = {
  ink: "#141821",
  fieldBg: "#F7F7F8",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  blue: "#1CB0F6",
  red: "#FF4B4B",
  redBg: "#FDECEC",
  green: "#58CC02",
  greenPressed: "#46A302",
};

export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getAuthUser();
      const token = await getAuthToken();
      setAuthUser(user);
      setAuthToken(token);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await clearAuthSession();
    setAuthUser(null);
    showErrorMessage("Logged out", "You have been logged out successfully");
    router.replace("/login");
  };

  const deleteAccount = async () => {
    if (isDeletingAccount) return;

    setIsDeletingAccount(true);
    try {
      if (!authToken) {
        showErrorMessage("Not logged in", "Please login again");
        router.replace("/login");
        return;
      }

      const response = await authFetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        await clearAuthSession();
        setAuthUser(null);
        setAuthToken(null);
        showErrorMessage("Account deleted", "Your account and data were deleted");
        setShowDeleteDialog(false);
        router.replace("/login");
        return;
      }

      if (response.status === 401) {
        await clearAuthSession();
        setAuthUser(null);
        setAuthToken(null);
        showErrorMessage("Session expired", "Please login again");
        setShowDeleteDialog(false);
        router.replace("/login");
        return;
      }

      let message = `Failed to delete account (HTTP ${response.status})`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            if (json?.message) message = json.message;
          } catch {
            message = text;
          }
        }
      } catch {
        // ignore
      }

      showErrorMessage("Delete failed", message);
    } catch (error) {
      showErrorMessage("Delete failed", error?.message || "Network error");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const confirmDeleteAccount = async () => {
    await triggerVibration("tap");
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = async () => {
    await triggerVibration("tap");
    if (isDeletingAccount) return;
    setShowDeleteDialog(false);
  };

  const handleDeleteFromDialog = async () => {
    await triggerVibration("tap");
    deleteAccount();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Delete Confirmation Modal */}
      <Modal transparent animationType="fade" statusBarTranslucent visible={showDeleteDialog} onRequestClose={closeDeleteDialog}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ width: "100%", borderRadius: 24, backgroundColor: "#FFFFFF", padding: 20 }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: T.redBg, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <MaterialIcons name="delete-forever" size={28} color={T.red} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink, textAlign: "center" }}>Delete Account?</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, textAlign: "center", marginTop: 4 }}>
                This will permanently delete your account and all saved resumes.
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity activeOpacity={0.9} onPress={handleDeleteFromDialog} disabled={isDeletingAccount}>
                <View style={{ borderRadius: 16, paddingBottom: 3, backgroundColor: "#D32F2F" }}>
                  <View style={{ alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14, backgroundColor: T.red }}>
                    {isDeletingAccount ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF" }}>DELETE ACCOUNT</Text>}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={closeDeleteDialog} disabled={isDeletingAccount} style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: T.caps }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justify: "space-between",
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top + 12, 52),
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: T.fieldBorder,
        }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color={T.caps} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>Account Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {!authToken ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: T.fieldBorder, backgroundColor: T.fieldBg, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>You are not logged in</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginTop: 4, marginBottom: 16 }}>Log in to manage your account details.</Text>

            <TouchableOpacity activeOpacity={0.92} onPress={() => router.replace("/login")}>
              <View style={{ borderRadius: 16, paddingBottom: 4, backgroundColor: T.greenPressed }}>
                <View style={{ alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14, backgroundColor: T.green }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF" }}>GO TO LOGIN</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}>
          {/* User Info Card */}
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: T.fieldBorder, backgroundColor: T.fieldBg, padding: 18, marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 4 }}>SIGNED IN AS</Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: T.ink }}>{authUser?.name || "User"}</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginTop: 2 }}>{authUser?.email || "No email available"}</Text>
          </View>

          {/* Action List */}
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justify: "space-between",
                backgroundColor: T.fieldBg,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: T.fieldBorder,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <MaterialIcons name="logout" size={22} color={T.blue} />
                <Text style={{ fontSize: 16, fontWeight: "800", color: T.ink }}>Logout</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={T.caps} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={confirmDeleteAccount}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justify: "space-between",
                backgroundColor: T.redBg,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: "#F8C4C4",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <MaterialIcons name="delete-forever" size={22} color={T.red} />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: T.red }}>Delete Account</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: T.red, opacity: 0.8 }}>This action cannot be undone</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={T.red} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}