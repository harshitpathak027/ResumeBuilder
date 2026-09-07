import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TemplatePageHeader = ({
  eyebrow,
  title,
  accent = "#2A9D8F",
  accentSoft = "#DDF3F0",
  icon = "auto-awesome",
  onBack,
  trailing,
}) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 390;

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
      style={{
        opacity: entrance,
        backgroundColor: accent,
        paddingTop: Math.max(insets.top + 12, 24),
        paddingHorizontal: compact ? 14 : 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
      }}
      className="w-full"
    >
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          className={`${compact ? "h-10 w-10" : "h-11 w-11"} items-center justify-center rounded-2xl bg-black/15`}
          style={{ flexShrink: 0 }}
        >
          <MaterialIcons name="arrow-back" size={compact ? 20 : 22} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: accentSoft }}>
            {eyebrow}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" className="mt-1 text-xl font-bold text-white">{title}</Text>
        </View>
        <View className={`${compact ? "h-8 w-8" : "h-9 w-9"} flex-shrink-0 items-center justify-center overflow-hidden rounded-full`} style={{ backgroundColor: accentSoft }}>
          <LottieView
            source={require("../../assets/images/lionblink.json")}
            autoPlay
            loop
            resizeMode="cover"
            style={{ width: compact ? 32 : 36, height: compact ? 32 : 36 }}
          />
        </View>
        {trailing || (
          <View className={`${compact ? "h-10 w-10" : "h-11 w-11"} flex-shrink-0 items-center justify-center rounded-2xl`} style={{ backgroundColor: accentSoft }}>
            <MaterialIcons name={icon} size={22} color={accent} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default TemplatePageHeader;
