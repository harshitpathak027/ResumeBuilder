import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const T = {
  ink: "#141821",
  fieldBg: "#F7F7F8",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  blue: "#1CB0F6",
  green: "#58CC02",
  greenPressed: "#46A302",
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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
        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}>
        <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: T.caps, marginBottom: 4 }}>
          SUPPORT CENTER
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "900", color: T.ink, marginBottom: 20 }}>
          How can we help?
        </Text>

        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: T.fieldBorder,
            backgroundColor: T.fieldBg,
            padding: 20,
          }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: "#E8F2FF", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <MaterialIcons name="email" size={26} color={T.blue} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: "800", color: T.ink }}>Email Support</Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginTop: 4, marginBottom: 20 }}>
            er.harshitpathak@outlook.com
          </Text>

          <TouchableOpacity activeOpacity={0.92} onPress={() => Linking.openURL("mailto:er.harshitpathak@outlook.com")}>
            <View style={{ borderRadius: 16, paddingBottom: 4, backgroundColor: T.greenPressed }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 14, backgroundColor: T.green }}>
                <MaterialIcons name="send" size={18} color="#FFFFFF" />
                <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "900", color: "#FFFFFF" }}>CONTACT SUPPORT</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}