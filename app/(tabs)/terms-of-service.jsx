import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const T = {
  ink: "#141821",
  fieldBg: "#F7F7F8",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
};

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: "Use of service",
      items: [
        "You are responsible for the information you add to your resume.",
        "Do not upload unlawful, abusive, or misleading content.",
        "Keep your account credentials secure.",
      ],
    },
    {
      title: "User content",
      items: [
        "You keep ownership of your resume and personal data.",
        "You grant us permission to store/process data only to provide the service.",
        "You can request deletion by contacting support.",
      ],
    },
    {
      title: "Availability and updates",
      items: [
        "Features may change to improve reliability and security.",
        "We may suspend accounts that violate these terms.",
        'Service is provided on an "as-is" basis.',
      ],
    },
    {
      title: "Contact",
      items: [
        "Email: er.harshitpathak@outlook.com",
        "Support: er.harshitpathak@outlook.com",
      ],
    },
  ];

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
        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginBottom: 20, lineHeight: 18 }}>
          The guidelines that keep your resume workspace useful and secure.
        </Text>

        <View style={{ gap: 14 }}>
          {sections.map((section) => (
            <View
              key={section.title}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: T.fieldBorder,
                backgroundColor: T.fieldBg,
                padding: 18,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: T.ink, marginBottom: 10 }}>{section.title}</Text>
              {section.items.map((item, idx) => (
                <Text key={idx} style={{ fontSize: 13, fontWeight: "600", color: T.caps, lineHeight: 20, marginBottom: 4 }}>
                  • {item}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}