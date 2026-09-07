import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

const FormSectionCard = ({ title, rightText, children, accent, icon }) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const sectionStyle = {
    "Full Name": { icon: "badge", color: "#2A9D8F", background: "#DDF3F0" },
    "Contact Details": { icon: "contact-mail", color: "#3A86FF", background: "#DDEAF5" },
    "Online Presence": { icon: "public", color: "#E76F51", background: "#FDE2DD" },
    "Professional Summary": { icon: "edit-note", color: "#A76400", background: "#FFF8DE" },
  }[title] || { icon: icon || "auto-awesome", color: accent || "#2A9D8F", background: "#DDF3F0" };
  const resolvedStyle = {
    icon: icon || sectionStyle.icon,
    color: accent || sectionStyle.color,
    background: accent ? `${accent}18` : sectionStyle.background,
  };

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <Animated.View
      className="mb-3 rounded-[24px] border border-[#D9E2EC] bg-white p-4 shadow-sm"
      style={{
        opacity: entrance,
        transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <View className="mb-3 h-1.5 w-14 rounded-full" style={{ backgroundColor: resolvedStyle.color }} />
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: resolvedStyle.background }}>
            <MaterialIcons name={resolvedStyle.icon} size={20} color={resolvedStyle.color} />
          </View>
          <Text className="text-lg font-bold text-[#102A43]">{title}</Text>
        </View>
        {rightText ? <Text className="text-sm font-medium text-[#A76400]">{rightText}</Text> : null}
      </View>
      {children}
    </Animated.View>
  );
};

export default FormSectionCard;