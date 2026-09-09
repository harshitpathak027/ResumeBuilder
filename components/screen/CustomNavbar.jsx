import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { triggerVibration } from "../constant/vibration";

const T = {
  activeBlue: "#1CB0F6",
  inactiveIcon: "#9AA0AC",
  borderTop: "#EAEBED",
  bg: "#FFFFFF",
};

const tabs = [
  { name: "index", route: "/", label: "Home", icon: "school" },
  { name: "Templates", route: "/Template", label: "Template", icon: "description" },
  { name: "profile", route: "/profile", label: "PROFILE", icon: "person" },
];

export default function CustomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handlePress = (tab) => {
    if (pathname === tab.route || (tab.route === "/" && pathname === "/index")) {
      return;
    }
    router.replace(tab.route);
  };

  const handlePressIn = () => {
    triggerVibration("flash-click");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: T.bg,
        borderTopWidth: 2,
        borderTopColor: T.borderTop,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom + 4, 12),
        paddingHorizontal: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route === "/" && pathname === "/index") ||
          (tab.route === "/Template" && pathname.startsWith("/Template"));

        return (
          <TouchableOpacity
            key={tab.name}
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPress={() => handlePress(tab)}
            style={{
              flex: 1,
              alignItems: "center",
              justify: "center",
              gap: 4,
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 16,
                backgroundColor: isActive ? "#E8F2FF" : "transparent",
              }}
            >
              <MaterialIcons
                size={24}
                name={tab.icon}
                color={isActive ? T.activeBlue : T.inactiveIcon}
              />
            </View>

            <Text
              style={{
                fontSize: 10,
                fontWeight: "900",
                letterSpacing: 0.8,
                color: isActive ? T.activeBlue : T.inactiveIcon,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
} 