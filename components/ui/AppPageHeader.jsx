import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppPageHeader = ({ title, eyebrow, accent = "#102A43", accentSoft = "#DDF3F0", icon = "auto-awesome", onBack }) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        paddingTop: Math.max(insets.top + 12, 24),
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: "hidden",
        transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
      }}
    >
      <LinearGradient
        colors={["#172B4D", "#213B61"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className="absolute left-0 right-0 top-0 h-1 bg-[#F4B942]" />
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={onBack} className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/15" activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={21} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="h-11 w-11 overflow-hidden rounded-2xl bg-[#F4B942]">
          <Image
            source={require("../../assets/images/applogo.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-bold uppercase tracking-[2px] text-[#F4B942]">Resume Studio</Text>
          <Text numberOfLines={1} className="mt-1 text-2xl font-bold text-white">{title}</Text>
        </View>
        <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#F4B942]">
          <LottieView source={require("../../assets/images/lionblink.json")} autoPlay loop style={{ width: 43, height: 43 }} />
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF3F0]">
          <MaterialIcons name={icon} size={22} color="#2A9D8F" />
        </View>
      </View>
    </Animated.View>
  );
};

export default AppPageHeader;
