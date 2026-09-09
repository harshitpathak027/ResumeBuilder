import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const T = {
  ink: "#141821",
  fieldBg: "#F7F7F8",
  fieldBorder: "#EAEBED",
  caps: "#9AA0AC",
  blue: "#1CB0F6",
};

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: "What personal data we collect",
      items: [
        "Account data: name, email, and login credentials.",
        "Resume content: profile details, education, work experience, projects, and skills.",
        "Usage data: basic app activity, device type, and error logs for troubleshooting.",
      ],
    },
    {
      title: "How we use your data",
      items: [
        "To create, save, edit, and export your resumes.",
        "To secure your account and prevent unauthorized access.",
        "To provide support and improve app performance.",
      ],
    },
    {
      title: "Data sharing",
      items: [
        "We do not sell your personal data.",
        "Data is shared only with required infrastructure providers (hosting/storage).",
        "Data may be disclosed if required by law.",
      ],
    },
    {
      title: "Contact for privacy requests",
      items: [
        "Email: er.harshitpathak@outlook.com",
        "Support: er.harshitpathak@outlook.com",
        "You can request access, correction, or deletion of your personal data.",
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
        <Text style={{ fontSize: 20, fontWeight: "900", color: T.ink }}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: T.caps, marginBottom: 20, lineHeight: 18 }}>
          A clear overview of how your resume data is handled.
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